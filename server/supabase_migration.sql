-- ==============================================================================
-- Koko AI: Complete Backend Schema Migration
-- Includes Profiles, Preferences, Conversations, Messages, Memories & Feedback
-- Row-Level Security (RLS) + Automated Triggers
-- ==============================================================================

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE
-- Stores user identity, avatar, display name, and onboarding state
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. USER PREFERENCES TABLE
-- Stores personalized routing, style, language, and memory configurations
create table if not exists public.user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  primary_use_cases text[] not null default '{}',
  experience_level text default 'intermediate',
  response_style text default 'Concise and direct',
  preferred_language text default 'auto',
  current_project text,
  memory_preference text not null default 'remember_useful_details',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint check_experience_level check (
    experience_level in ('beginner', 'intermediate', 'advanced', 'expert')
  ),
  constraint check_memory_preference check (
    memory_preference in ('remember_useful_details', 'ask_before_saving', 'current_conversation_only')
  )
);

-- 3. CONVERSATIONS TABLE
-- Stores conversation threads scoped per user
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New conversation',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. MESSAGES TABLE
-- Stores structured messages, responses, provider telemetry and metadata
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null,
  content text not null,
  response_type text not null default 'text',
  model_used text,
  token_count integer,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),

  constraint check_message_role check (
    role in ('user', 'assistant', 'system', 'tool')
  ),
  constraint check_response_type check (
    response_type in ('text', 'code', 'image', 'video', 'table', 'error')
  )
);

-- Safe migration for existing messages table to add new columns if they do not exist
do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'messages' and column_name = 'response_type') then
    alter table public.messages add column response_type text not null default 'text';
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'messages' and column_name = 'metadata') then
    alter table public.messages add column metadata jsonb not null default '{}'::jsonb;
  end if;
end $$;

-- 5. MEMORIES TABLE
-- Stores long-term user facts, preferences, and project context
create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  memory_text text not null,
  memory_type text not null default 'preference',
  importance integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 6. FEEDBACK TABLE
-- Stores ratings (up/down) and qualitative feedback on assistant responses
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  message_id uuid not null references public.messages(id) on delete cascade,
  rating text not null,
  reason text,
  created_at timestamptz not null default now(),

  constraint check_feedback_rating check (
    rating in ('up', 'down')
  )
);

-- ==============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ==============================================================================
create index if not exists idx_user_preferences_user_id on public.user_preferences(user_id);
create index if not exists idx_conversations_user_id on public.conversations(user_id);
create index if not exists idx_conversations_created_at on public.conversations(created_at desc);
create index if not exists idx_messages_conversation_id on public.messages(conversation_id);
create index if not exists idx_messages_user_id on public.messages(user_id);
create index if not exists idx_messages_created_at on public.messages(created_at asc);
create index if not exists idx_memories_user_id on public.memories(user_id);
create index if not exists idx_feedback_message_id on public.feedback(message_id);
create index if not exists idx_feedback_user_id on public.feedback(user_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict user-level data isolation
-- ==============================================================================
alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.memories enable row level security;
alter table public.feedback enable row level security;

-- PROFILES
drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile" on public.profiles for select using (auth.uid() = id);
drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);

-- USER PREFERENCES
drop policy if exists "Users can view their own preferences" on public.user_preferences;
create policy "Users can view their own preferences" on public.user_preferences for select using (auth.uid() = user_id);
drop policy if exists "Users can insert their own preferences" on public.user_preferences;
create policy "Users can insert their own preferences" on public.user_preferences for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update their own preferences" on public.user_preferences;
create policy "Users can update their own preferences" on public.user_preferences for update using (auth.uid() = user_id);

-- CONVERSATIONS
drop policy if exists "Users can view their own conversations" on public.conversations;
create policy "Users can view their own conversations" on public.conversations for select using (auth.uid() = user_id);
drop policy if exists "Users can insert their own conversations" on public.conversations;
create policy "Users can insert their own conversations" on public.conversations for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update their own conversations" on public.conversations;
create policy "Users can update their own conversations" on public.conversations for update using (auth.uid() = user_id);
drop policy if exists "Users can delete their own conversations" on public.conversations;
create policy "Users can delete their own conversations" on public.conversations for delete using (auth.uid() = user_id);

-- MESSAGES
drop policy if exists "Users can view their own messages" on public.messages;
create policy "Users can view their own messages" on public.messages for select using (auth.uid() = user_id);
drop policy if exists "Users can insert their own messages" on public.messages;
create policy "Users can insert their own messages" on public.messages for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update their own messages" on public.messages;
create policy "Users can update their own messages" on public.messages for update using (auth.uid() = user_id);
drop policy if exists "Users can delete their own messages" on public.messages;
create policy "Users can delete their own messages" on public.messages for delete using (auth.uid() = user_id);

-- MEMORIES
drop policy if exists "Users can view their own memories" on public.memories;
create policy "Users can view their own memories" on public.memories for select using (auth.uid() = user_id);
drop policy if exists "Users can insert their own memories" on public.memories;
create policy "Users can insert their own memories" on public.memories for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update their own memories" on public.memories;
create policy "Users can update their own memories" on public.memories for update using (auth.uid() = user_id);
drop policy if exists "Users can delete their own memories" on public.memories;
create policy "Users can delete their own memories" on public.memories for delete using (auth.uid() = user_id);

-- FEEDBACK
drop policy if exists "Users can view their own feedback" on public.feedback;
create policy "Users can view their own feedback" on public.feedback for select using (auth.uid() = user_id);
drop policy if exists "Users can insert their own feedback" on public.feedback;
create policy "Users can insert their own feedback" on public.feedback for insert with check (auth.uid() = user_id);

-- ==============================================================================
-- TRIGGERS & PROCEDURES
-- ==============================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, onboarding_completed)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''), false)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles for each row execute procedure public.handle_updated_at();

drop trigger if exists set_user_preferences_updated_at on public.user_preferences;
create trigger set_user_preferences_updated_at before update on public.user_preferences for each row execute procedure public.handle_updated_at();

drop trigger if exists set_conversations_updated_at on public.conversations;
create trigger set_conversations_updated_at before update on public.conversations for each row execute procedure public.handle_updated_at();

drop trigger if exists set_memories_updated_at on public.memories;
create trigger set_memories_updated_at before update on public.memories for each row execute procedure public.handle_updated_at();
