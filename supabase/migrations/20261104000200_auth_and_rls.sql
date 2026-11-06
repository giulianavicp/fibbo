create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role, unit, consent_at)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'student'),
    nullif(new.raw_user_meta_data->>'unit', ''),
    coalesce((new.raw_user_meta_data->>'consent_at')::timestamptz, now())
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.my_role()
returns public.user_role
language sql stable security definer set search_path = ''
as $$ select role from public.profiles where id = auth.uid() $$;

create or replace function public.teaches(course uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.courses where id = course and teacher_id = auth.uid()) $$;

create or replace function public.enrolled_in(course uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.enrollments where course_id = course and student_id = auth.uid()) $$;

create or replace function public.course_of_activity(activity uuid)
returns uuid
language sql stable security definer set search_path = ''
as $$ select course_id from public.activities where id = activity $$;

create or replace function public.course_of_question(question uuid)
returns uuid
language sql stable security definer set search_path = ''
as $$ select a.course_id from public.questions q join public.activities a on a.id = q.activity_id where q.id = question $$;

create or replace function public.course_of_submission(submission uuid)
returns uuid
language sql stable security definer set search_path = ''
as $$ select a.course_id from public.submissions s join public.activities a on a.id = s.activity_id where s.id = submission $$;

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.enrollments enable row level security;
alter table public.activities enable row level security;
alter table public.questions enable row level security;
alter table public.question_keys enable row level security;
alter table public.submissions enable row level security;
alter table public.answers enable row level security;
alter table public.login_attempts enable row level security;
alter table public.audit_log enable row level security;

create policy "own profile" on public.profiles for select to authenticated
  using (id = (select auth.uid()));
create policy "teacher sees own students" on public.profiles for select to authenticated
  using (exists (
    select 1 from public.enrollments e join public.courses c on c.id = e.course_id
    where e.student_id = profiles.id and c.teacher_id = (select auth.uid())
  ));
create policy "student sees course teachers" on public.profiles for select to authenticated
  using (exists (
    select 1 from public.courses c where c.teacher_id = profiles.id and public.enrolled_in(c.id)
  ));
create policy "update own profile" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
revoke update on public.profiles from authenticated;
grant update (full_name, unit) on public.profiles to authenticated;

create policy "read courses" on public.courses for select to authenticated
  using (teacher_id = (select auth.uid()) or public.enrolled_in(id));
create policy "teacher creates courses" on public.courses for insert to authenticated
  with check (teacher_id = (select auth.uid()) and public.my_role() = 'teacher');
create policy "teacher updates courses" on public.courses for update to authenticated
  using (teacher_id = (select auth.uid())) with check (teacher_id = (select auth.uid()));
create policy "teacher deletes courses" on public.courses for delete to authenticated
  using (teacher_id = (select auth.uid()));

create policy "read enrollments" on public.enrollments for select to authenticated
  using (student_id = (select auth.uid()) or public.teaches(course_id));
create policy "teacher manages enrollments" on public.enrollments for delete to authenticated
  using (public.teaches(course_id));

create policy "read activities" on public.activities for select to authenticated
  using (public.teaches(course_id) or (published and public.enrolled_in(course_id)));
create policy "teacher writes activities" on public.activities for all to authenticated
  using (public.teaches(course_id)) with check (public.teaches(course_id));

create policy "read questions" on public.questions for select to authenticated
  using (public.teaches(public.course_of_activity(activity_id)) or public.enrolled_in(public.course_of_activity(activity_id)));
create policy "teacher writes questions" on public.questions for all to authenticated
  using (public.teaches(public.course_of_activity(activity_id))) with check (public.teaches(public.course_of_activity(activity_id)));

create policy "teacher reads keys" on public.question_keys for all to authenticated
  using (public.teaches(public.course_of_question(question_id))) with check (public.teaches(public.course_of_question(question_id)));

create policy "read submissions" on public.submissions for select to authenticated
  using (student_id = (select auth.uid()) or public.teaches(public.course_of_activity(activity_id)));

create policy "read answers" on public.answers for select to authenticated
  using (
    exists (select 1 from public.submissions s where s.id = answers.submission_id and s.student_id = (select auth.uid()))
    or public.teaches(public.course_of_submission(submission_id))
  );

create policy "own audit entries" on public.audit_log for select to authenticated
  using (actor_id = (select auth.uid()));

create or replace function public.join_course(code text)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  course uuid;
begin
  if public.my_role() is distinct from 'student' then
    raise exception 'only students can join courses';
  end if;
  select id into course from public.courses where join_code = upper(trim(code));
  if course is null then
    raise exception 'invalid course code';
  end if;
  insert into public.enrollments (course_id, student_id) values (course, auth.uid()) on conflict do nothing;
  return course;
end;
$$;

create or replace function public.login_status(email text)
returns json
language sql stable security definer set search_path = ''
as $$
  with recent as (
    select success, attempted_at from public.login_attempts
    where lower(login_attempts.email) = lower(trim(login_status.email))
      and attempted_at > now() - interval '15 minutes'
    order by attempted_at desc
  ), streak as (
    select count(*) as failures, max(attempted_at) as last_failure from recent
    where attempted_at > coalesce((select max(attempted_at) from recent where success), '-infinity')
  )
  select json_build_object(
    'failures', failures,
    'locked_until', case when failures >= 3 then last_failure + interval '5 minutes' end
  ) from streak
$$;

create or replace function public.record_login_attempt(email text, success boolean)
returns json
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.login_attempts (email, success) values (lower(trim(email)), success);
  return public.login_status(email);
end;
$$;

revoke all on function public.login_status(text) from public;
revoke all on function public.record_login_attempt(text, boolean) from public;
grant execute on function public.login_status(text) to anon, authenticated;
grant execute on function public.record_login_attempt(text, boolean) to anon, authenticated;
revoke all on function public.join_course(text) from public, anon;
grant execute on function public.join_course(text) to authenticated;

create or replace function public.audit()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  row_id text := coalesce(to_jsonb(new)->>'id', to_jsonb(old)->>'id');
begin
  insert into public.audit_log (actor_id, action, entity, entity_id)
  values (auth.uid(), lower(tg_op), tg_table_name, row_id);
  return coalesce(new, old);
end;
$$;

create trigger audit_courses after insert or update or delete on public.courses for each row execute function public.audit();
create trigger audit_activities after insert or update or delete on public.activities for each row execute function public.audit();
create trigger audit_questions after insert or update or delete on public.questions for each row execute function public.audit();
create trigger audit_submissions after insert or update or delete on public.submissions for each row execute function public.audit();
create trigger audit_enrollments after insert or delete on public.enrollments for each row execute function public.audit();
