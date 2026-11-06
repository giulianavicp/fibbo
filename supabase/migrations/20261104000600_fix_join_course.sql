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
  select c.id into course from public.courses c where c.join_code = upper(trim(join_course.code));
  if course is null then
    raise exception 'invalid course code';
  end if;
  insert into public.enrollments (course_id, student_id) values (course, auth.uid()) on conflict do nothing;
  return course;
end;
$$;
