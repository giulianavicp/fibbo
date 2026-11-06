create extension if not exists unaccent with schema extensions;

alter table public.submissions add column reviewed boolean not null default false;
alter table public.answers add column overridden boolean not null default false;

create or replace function private.norm(t text)
returns text
language sql immutable set search_path = ''
as $$ select regexp_replace(lower(extensions.unaccent(coalesce(t, ''))), '\s+', ' ', 'g') $$;

create or replace function private.grade_submission(sub uuid)
returns numeric
language plpgsql security definer set search_path = ''
as $$
declare
  obj numeric;
  ess numeric;
  final numeric;
begin
  update public.answers a
  set score = case
        when q.kind = 'objective' then case when upper(trim(a.response)) = k.correct_option then 100 else 0 end
        else round(100.0 * (select count(*) from unnest(k.keywords) kw where position(private.norm(kw) in private.norm(a.response)) > 0)
                   / greatest(cardinality(k.keywords), 1))
      end,
      matched_keywords = case
        when q.kind = 'essay' then array(select kw from unnest(k.keywords) kw where position(private.norm(kw) in private.norm(a.response)) > 0)
        else '{}'
      end
  from public.questions q
  join public.question_keys k on k.question_id = q.id
  where a.submission_id = sub and a.question_id = q.id and not a.overridden;

  select avg(a.score) filter (where q.kind = 'objective'), avg(a.score) filter (where q.kind = 'essay')
  into obj, ess
  from public.answers a join public.questions q on q.id = a.question_id
  where a.submission_id = sub;

  final := round(case
    when obj is not null and ess is not null then 0.6 * obj + 0.4 * ess
    else coalesce(obj, ess, 0)
  end / 10, 1);

  update public.submissions s
  set grade = final,
      reviewed = s.reviewed or not exists (
        select 1 from public.answers a join public.questions q on q.id = a.question_id
        where a.submission_id = sub and q.kind = 'essay')
  where s.id = sub;

  return final;
end;
$$;

create or replace function public.submit_activity(activity uuid, responses jsonb)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  course uuid;
  sub uuid;
begin
  select a.course_id into course from public.activities a where a.id = activity and a.published;
  if course is null or not private.enrolled_in(course) then
    raise exception 'activity not available';
  end if;

  insert into public.submissions (activity_id, student_id) values (activity, auth.uid())
  returning id into sub;

  insert into public.answers (submission_id, question_id, response)
  select sub, q.id, coalesce(left(r->>'response', 5000), '')
  from public.questions q
  left join jsonb_array_elements(responses) r on (r->>'question_id')::uuid = q.id
  where q.activity_id = activity;

  perform private.grade_submission(sub);
  return sub;
exception
  when unique_violation then raise exception 'already submitted';
end;
$$;

create or replace function public.review_answer(answer uuid, new_score numeric)
returns numeric
language plpgsql security definer set search_path = ''
as $$
declare
  sub uuid;
begin
  if new_score < 0 or new_score > 100 then raise exception 'score must be between 0 and 100'; end if;
  select a.submission_id into sub from public.answers a where a.id = answer;
  if sub is null or not private.teaches(private.course_of_submission(sub)) then
    raise exception 'not allowed';
  end if;
  update public.answers set score = round(new_score), overridden = true where id = answer;
  return private.grade_submission(sub);
end;
$$;

create or replace function public.mark_reviewed(submission uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not private.teaches(private.course_of_submission(submission)) then raise exception 'not allowed'; end if;
  update public.submissions set reviewed = true where id = submission;
end;
$$;

create or replace function public.submission_feedback(submission uuid)
returns table (question_id uuid, pos int, kind public.question_kind, prompt text, topic text, options jsonb,
               response text, score numeric, matched_keywords text[], correct_option text, keywords text[])
language sql stable security definer set search_path = ''
as $$
  select q.id, q.position, q.kind, q.prompt, q.topic, q.options, a.response, a.score, a.matched_keywords, k.correct_option, k.keywords
  from public.submissions s
  join public.answers a on a.submission_id = s.id
  join public.questions q on q.id = a.question_id
  join public.question_keys k on k.question_id = q.id
  where s.id = submission
    and (s.student_id = auth.uid() or private.teaches(private.course_of_submission(s.id)))
  order by q.position
$$;

revoke all on function private.grade_submission(uuid), private.norm(text) from public, anon, authenticated;
revoke execute on function public.submit_activity(uuid, jsonb), public.review_answer(uuid, numeric), public.mark_reviewed(uuid), public.submission_feedback(uuid) from public, anon;
grant execute on function public.submit_activity(uuid, jsonb), public.review_answer(uuid, numeric), public.mark_reviewed(uuid), public.submission_feedback(uuid) to authenticated;
