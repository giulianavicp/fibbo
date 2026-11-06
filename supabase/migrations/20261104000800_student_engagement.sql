create table public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null default auth.uid() references public.profiles on delete cascade,
  prompt text not null,
  content text not null check (char_length(content) between 1 and 4000),
  created_at timestamptz not null default now()
);
create index on public.journal_entries (student_id, created_at desc);

alter table public.journal_entries enable row level security;
create policy "own journal" on public.journal_entries for all to authenticated
  using (student_id = (select auth.uid())) with check (student_id = (select auth.uid()));

create or replace function private.student_xp(student uuid)
returns int
language sql stable security definer set search_path = ''
as $$
  select coalesce((
    select sum(round(coalesce(s.grade, 0) * 10) + case when a.due_at is null or s.submitted_at <= a.due_at then 20 else 0 end)
    from public.submissions s join public.activities a on a.id = s.activity_id
    where s.student_id = student), 0)::int
  + 5 * (select count(*) from public.journal_entries j where j.student_id = student)::int
$$;
revoke all on function private.student_xp(uuid) from public, anon, authenticated;

create or replace function public.leaderboard()
returns table (display_name text, xp int, is_me boolean)
language sql stable security definer set search_path = ''
as $$
  with classmates as (
    select distinct e2.student_id
    from public.enrollments e1
    join public.enrollments e2 on e2.course_id = e1.course_id
    where e1.student_id = auth.uid()
    union select auth.uid() where private.my_role() = 'student'
  )
  select split_part(p.full_name, ' ', 1) || coalesce(' ' || left(nullif(split_part(p.full_name, ' ', 2), ''), 1) || '.', ''),
         private.student_xp(p.id),
         p.id = auth.uid()
  from classmates c join public.profiles p on p.id = c.student_id
  order by 2 desc, 1
$$;
revoke execute on function public.leaderboard() from public, anon;
grant execute on function public.leaderboard() to authenticated;
