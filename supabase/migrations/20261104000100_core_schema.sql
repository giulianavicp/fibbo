create extension if not exists pgcrypto;

create type public.user_role as enum ('student', 'teacher');
create type public.activity_kind as enum ('atividade', 'prova');
create type public.question_kind as enum ('objective', 'essay');

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text not null,
  role public.user_role not null,
  unit text,
  consent_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  name text not null,
  unit text,
  topics text[] not null default '{}',
  teacher_id uuid not null references public.profiles on delete cascade,
  join_code text not null unique default upper(substr(md5(gen_random_uuid()::text), 1, 6)),
  created_at timestamptz not null default now()
);

create table public.enrollments (
  course_id uuid references public.courses on delete cascade,
  student_id uuid references public.profiles on delete cascade,
  created_at timestamptz not null default now(),
  primary key (course_id, student_id)
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses on delete cascade,
  title text not null,
  kind public.activity_kind not null default 'atividade',
  due_at timestamptz,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities on delete cascade,
  position int not null,
  kind public.question_kind not null,
  prompt text not null,
  topic text,
  options jsonb,
  weight numeric not null default 1 check (weight > 0),
  unique (activity_id, position)
);

create table public.question_keys (
  question_id uuid primary key references public.questions on delete cascade,
  correct_option text,
  keywords text[] not null default '{}',
  check (correct_option is not null or cardinality(keywords) > 0)
);

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities on delete cascade,
  student_id uuid not null references public.profiles on delete cascade,
  submitted_at timestamptz not null default now(),
  grade numeric check (grade between 0 and 10),
  unique (activity_id, student_id)
);

create table public.answers (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions on delete cascade,
  question_id uuid not null references public.questions on delete cascade,
  response text not null default '',
  score numeric check (score between 0 and 100),
  matched_keywords text[] not null default '{}',
  unique (submission_id, question_id)
);

create table public.login_attempts (
  id bigint generated always as identity primary key,
  email text not null,
  success boolean not null,
  attempted_at timestamptz not null default now()
);
create index on public.login_attempts (lower(email), attempted_at desc);

create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid,
  action text not null,
  entity text not null,
  entity_id text,
  details jsonb,
  created_at timestamptz not null default now()
);

create index on public.courses (teacher_id);
create index on public.enrollments (student_id);
create index on public.activities (course_id);
create index on public.questions (activity_id);
create index on public.submissions (student_id);
create index on public.answers (question_id);
create index on public.audit_log (actor_id);
