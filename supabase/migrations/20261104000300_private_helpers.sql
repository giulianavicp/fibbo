create schema if not exists private;
grant usage on schema private to authenticated;

alter function public.my_role() set schema private;
alter function public.teaches(uuid) set schema private;
alter function public.enrolled_in(uuid) set schema private;
alter function public.course_of_activity(uuid) set schema private;
alter function public.course_of_question(uuid) set schema private;
alter function public.course_of_submission(uuid) set schema private;
alter function public.audit() set schema private;
alter function public.handle_new_user() set schema private;

revoke all on all functions in schema private from public, anon, authenticated;
grant execute on function private.my_role(), private.teaches(uuid), private.enrolled_in(uuid),
  private.course_of_activity(uuid), private.course_of_question(uuid), private.course_of_submission(uuid)
  to authenticated;

create or replace function public.join_course(code text)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  course uuid;
begin
  if private.my_role() is distinct from 'student' then
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

revoke execute on function public.join_course(text) from anon;
revoke execute on function public.login_status(text), public.record_login_attempt(text, boolean) from public;
grant execute on function public.login_status(text), public.record_login_attempt(text, boolean) to anon, authenticated;
