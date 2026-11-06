create table public.materials (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses on delete cascade,
  name text not null,
  path text not null unique,
  size_bytes bigint not null,
  created_at timestamptz not null default now()
);
create index on public.materials (course_id);

alter table public.materials enable row level security;

create policy "read materials" on public.materials for select to authenticated
  using (private.teaches(course_id) or private.enrolled_in(course_id));
create policy "teacher writes materials" on public.materials for all to authenticated
  using (private.teaches(course_id)) with check (private.teaches(course_id));

create trigger audit_materials after insert or delete on public.materials for each row execute function private.audit();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('materials', 'materials', false, 20971520, array['application/pdf']);

create or replace function private.course_from_path(path text)
returns uuid
language sql immutable set search_path = ''
as $$ select case when split_part(path, '/', 1) ~ '^[0-9a-f-]{36}$' then split_part(path, '/', 1)::uuid end $$;
grant execute on function private.course_from_path(text) to authenticated;

create policy "teacher uploads materials" on storage.objects for insert to authenticated
  with check (bucket_id = 'materials' and private.teaches(private.course_from_path(name)));
create policy "teacher deletes materials" on storage.objects for delete to authenticated
  using (bucket_id = 'materials' and private.teaches(private.course_from_path(name)));
create policy "course members read materials" on storage.objects for select to authenticated
  using (bucket_id = 'materials' and (private.teaches(private.course_from_path(name)) or private.enrolled_in(private.course_from_path(name))));
