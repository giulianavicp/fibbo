create or replace function public.create_activity(
  course uuid, title text, kind public.activity_kind, due_at timestamptz, questions jsonb
)
returns uuid
language plpgsql security invoker set search_path = ''
as $$
declare
  activity uuid;
  q jsonb;
  question uuid;
  pos int := 0;
begin
  if jsonb_array_length(questions) = 0 then
    raise exception 'activity needs at least one question';
  end if;

  insert into public.activities (course_id, title, kind, due_at)
  values (course, trim(title), kind, due_at)
  returning id into activity;

  for q in select * from jsonb_array_elements(questions) loop
    pos := pos + 1;
    insert into public.questions (activity_id, position, kind, prompt, topic, options)
    values (activity, pos, (q->>'kind')::public.question_kind, trim(q->>'prompt'), nullif(trim(q->>'topic'), ''),
      case when q->>'kind' = 'objective' then q->'options' end)
    returning id into question;

    insert into public.question_keys (question_id, correct_option, keywords)
    values (question,
      case when q->>'kind' = 'objective' then q->>'correct' end,
      coalesce(array(select lower(trim(k)) from jsonb_array_elements_text(q->'keywords') k where trim(k) <> ''), '{}'));
  end loop;

  return activity;
end;
$$;

revoke execute on function public.create_activity(uuid, text, public.activity_kind, timestamptz, jsonb) from public, anon;
grant execute on function public.create_activity(uuid, text, public.activity_kind, timestamptz, jsonb) to authenticated;
