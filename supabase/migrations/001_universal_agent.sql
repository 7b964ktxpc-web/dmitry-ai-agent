-- Universal AI Agent Platform
-- Multi-tenant schema. Every Telegram user owns an isolated agent namespace.

create extension if not exists pgcrypto;
create extension if not exists vector;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  telegram_id bigint unique,
  username text,
  first_name text,
  last_name text,
  timezone text default 'Europe/Moscow',
  language text default 'ru',
  onboarding_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null default 'Мой помощник',
  role text default 'Персональный ИИ-помощник',
  system_prompt text,
  status text not null default 'setup' check (status in ('setup','online','paused')),
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists agents_one_default_per_user on public.agents(user_id);

create table if not exists public.agent_profiles (
  agent_id uuid primary key references public.agents(id) on delete cascade,
  occupation text,
  goals text,
  communication_style text,
  preferences jsonb not null default '{}'::jsonb,
  onboarding_answers jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(id) on delete cascade,
  channel text not null default 'telegram',
  external_chat_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role text not null check (role in ('system','user','assistant','tool')),
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists messages_conversation_created_idx on public.messages(conversation_id, created_at desc);

create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(id) on delete cascade,
  content text not null,
  category text default 'general',
  importance smallint default 3 check (importance between 1 and 5),
  embedding vector(1536),
  source_message_id uuid references public.messages(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists memories_agent_idx on public.memories(agent_id, importance desc, created_at desc);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(id) on delete cascade,
  title text not null,
  description text,
  schedule text,
  timezone text default 'Europe/Moscow',
  status text not null default 'active' check (status in ('active','paused','completed')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.tools (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  enabled_by_default boolean default false,
  config_schema jsonb not null default '{}'::jsonb
);

create table if not exists public.agent_tools (
  agent_id uuid references public.agents(id) on delete cascade,
  tool_id uuid references public.tools(id) on delete cascade,
  enabled boolean default true,
  config jsonb not null default '{}'::jsonb,
  primary key (agent_id, tool_id)
);

create table if not exists public.knowledge_sources (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(id) on delete cascade,
  name text not null,
  source_type text not null,
  storage_path text,
  status text default 'ready',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(id) on delete cascade,
  event_type text not null,
  model text,
  input_tokens integer default 0,
  output_tokens integer default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references public.users(id) on delete cascade,
  plan text not null default 'free',
  status text not null default 'active',
  monthly_message_limit integer default 100,
  current_period_start timestamptz default now(),
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  agent_id uuid references public.agents(id) on delete set null,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz default now()
);

insert into public.tools (slug,name,description,enabled_by_default) values
 ('web_search','Поиск в интернете','Находит актуальную информацию в интернете',true),
 ('calculator','Калькулятор','Вычисления и преобразования',true),
 ('reminders','Напоминания','Создание персональных напоминаний',false),
 ('documents','Документы','Работа с загруженными файлами',false),
 ('image_generation','Изображения','Создание изображений по описанию',false),
 ('calendar','Календарь','Работа с календарём пользователя',false)
on conflict (slug) do nothing;

alter table public.users enable row level security;
alter table public.agents enable row level security;
alter table public.agent_profiles enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.memories enable row level security;
alter table public.tasks enable row level security;
alter table public.agent_tools enable row level security;
alter table public.knowledge_sources enable row level security;
alter table public.usage_events enable row level security;
alter table public.subscriptions enable row level security;
alter table public.audit_logs enable row level security;

-- The server uses the Supabase service role for Telegram/webhook operations.
-- Client-facing access can later be exposed through authenticated policies.
