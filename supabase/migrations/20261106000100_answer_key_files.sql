create table public.answer_key_files (
  activity_id uuid primary key references public.activities on delete cascade,
  name text not null,
  path text not null unique,
  content_type text not null,
  size_bytes bigint not null check (size_bytes > 0),
  uploaded_at timestamptz not null default now()
);

alter table public.answer_key_files enable row level security;

create or replace function private.course_of_activity(activity uuid)
returns uuid
language sql stable security definer set search_path = ''
as $$ select course_id from public.activities where id = activity $$;

create or replace function private.key_released(activity uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$ select coalesce(due_at <= now(), false) from public.activities where id = activity $$;

grant execute on function private.course_of_activity(uuid), private.key_released(uuid) to authenticated;

create policy "read answer key files" on public.answer_key_files for select to authenticated
  using (private.teaches(private.course_of_activity(activity_id))
    or (private.enrolled_in(private.course_of_activity(activity_id)) and private.key_released(activity_id)));
create policy "teacher writes answer key files" on public.answer_key_files for all to authenticated
  using (private.teaches(private.course_of_activity(activity_id)))
  with check (private.teaches(private.course_of_activity(activity_id)));

create trigger audit_answer_key_files after insert or delete on public.answer_key_files for each row execute function private.audit();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('answer-keys', 'answer-keys', false, 10485760, array['application/pdf', 'image/png', 'image/jpeg']);

create or replace function private.activity_from_path(path text)
returns uuid
language sql immutable set search_path = ''
as $$ select case when split_part(path, '/', 2) ~ '^[0-9a-f-]{36}$' then split_part(path, '/', 2)::uuid end $$;
grant execute on function private.activity_from_path(text) to authenticated;

create policy "teacher uploads answer keys" on storage.objects for insert to authenticated
  with check (bucket_id = 'answer-keys' and private.teaches(private.course_from_path(name))
    and private.course_of_activity(private.activity_from_path(name)) = private.course_from_path(name));
create policy "teacher deletes answer keys" on storage.objects for delete to authenticated
  using (bucket_id = 'answer-keys' and private.teaches(private.course_from_path(name)));
create policy "read released answer keys" on storage.objects for select to authenticated
  using (bucket_id = 'answer-keys' and (private.teaches(private.course_from_path(name))
    or (private.enrolled_in(private.course_from_path(name)) and private.key_released(private.activity_from_path(name)))));
