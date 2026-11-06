create extension if not exists vector with schema extensions;

alter table public.materials
  add column status text not null default 'pending' check (status in ('pending', 'processing', 'ready', 'error')),
  add column chunk_count int not null default 0;

create table public.material_chunks (
  id bigint generated always as identity primary key,
  material_id uuid not null references public.materials on delete cascade,
  course_id uuid not null references public.courses on delete cascade,
  position int not null,
  content text not null,
  embedding extensions.vector(768) not null
);
create index on public.material_chunks (course_id);
create index on public.material_chunks using hnsw (embedding extensions.vector_cosine_ops);
alter table public.material_chunks enable row level security;
create policy "teacher reads chunks" on public.material_chunks for select to authenticated using (private.teaches(course_id));

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null default auth.uid() references public.profiles on delete cascade,
  course_id uuid references public.courses on delete set null,
  activity_id uuid references public.activities on delete set null,
  title text not null default 'Nova conversa',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.conversations (student_id, updated_at desc);

create table public.chat_messages (
  id bigint generated always as identity primary key,
  conversation_id uuid not null references public.conversations on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  sources jsonb not null default '[]',
  created_at timestamptz not null default now()
);
create index on public.chat_messages (conversation_id, created_at);

alter table public.conversations enable row level security;
alter table public.chat_messages enable row level security;
create policy "own conversations" on public.conversations for select to authenticated using (student_id = (select auth.uid()));
create policy "delete own conversations" on public.conversations for delete to authenticated using (student_id = (select auth.uid()));
create policy "own messages" on public.chat_messages for select to authenticated
  using (exists (select 1 from public.conversations c where c.id = conversation_id and c.student_id = (select auth.uid())));

create or replace function public.match_chunks(query extensions.vector(768), courses uuid[], k int default 6)
returns table (content text, material_name text, course_id uuid, similarity float)
language sql stable security definer set search_path = ''
as $$
  select ch.content, m.name, ch.course_id, 1 - (ch.embedding operator(extensions.<=>) query)
  from public.material_chunks ch
  join public.materials m on m.id = ch.material_id
  where ch.course_id = any(courses)
  order by ch.embedding operator(extensions.<=>) query
  limit k
$$;
revoke all on function public.match_chunks(extensions.vector, uuid[], int) from public, anon, authenticated;
grant execute on function public.match_chunks(extensions.vector, uuid[], int) to service_role;

create or replace function public.top_questions(course uuid)
returns table (question text, asked_at timestamptz)
language sql stable security definer set search_path = ''
as $$
  select m.content, m.created_at
  from public.chat_messages m join public.conversations c on c.id = m.conversation_id
  where m.role = 'user' and c.course_id = course and private.teaches(course)
  order by m.created_at desc
  limit 200
$$;
revoke execute on function public.top_questions(uuid) from public, anon;
grant execute on function public.top_questions(uuid) to authenticated;
