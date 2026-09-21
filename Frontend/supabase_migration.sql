-- ==============================================================================
-- Koko AI: Onboarding, User Preferences, Chat & Memory Schema Migration
-- ==============================================================================

-- 1. PROFILES TABLE
-- Stores user identity, avatar, and onboarding status.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. USER PREFERENCES TABLE
-- Stores personalized routing, style, language, and memory configurations.
create table if not exists public.user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  primary_use_cases text[] not null default '{}',
  experience_level text,
  response_style text,
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
-- Stores user conversation threads.
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New conversation',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. MESSAGES TABLE
-- Stores messages within conversations, including multi-model telemetry.
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null,
  content text not null,
  model_used text,
  token_count integer,
  created_at timestamptz not null default now(),

  constraint check_message_role check (
    role in ('user', 'assistant', 'system', 'tool')
  )
);

-- 5. MEMORIES TABLE
-- Stores extracted user preferences, facts, and project details.
-- NOTE: For vector embeddings and semantic search, enable pgvector (create extension vector;)
-- and add: embedding vector(1536) when integrating semantic memory retrieval.
create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  memory_text text not null,
  memory_type text not null default 'preference',
  importance integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.memories enable row level security;

-- PROFILES POLICIES
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- USER PREFERENCES POLICIES
create policy "Users can view their own preferences"
  on public.user_preferences for select
  using (auth.uid() = user_id);

create policy "Users can insert their own preferences"
  on public.user_preferences for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own preferences"
  on public.user_preferences for update
  using (auth.uid() = user_id);

-- CONVERSATIONS POLICIES
create policy "Users can view their own conversations"
  on public.conversations for select
  using (auth.uid() = user_id);

create policy "Users can insert their own conversations"
  on public.conversations for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own conversations"
  on public.conversations for update
  using (auth.uid() = user_id);

create policy "Users can delete their own conversations"
  on public.conversations for delete
  using (auth.uid() = user_id);

-- MESSAGES POLICIES
create policy "Users can view their own messages"
  on public.messages for select
  using (auth.uid() = user_id);

create policy "Users can insert their own messages"
  on public.messages for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own messages"
  on public.messages for update
  using (auth.uid() = user_id);

create policy "Users can delete their own messages"
  on public.messages for delete
  using (auth.uid() = user_id);

-- MEMORIES POLICIES
create policy "Users can view their own memories"
  on public.memories for select
  using (auth.uid() = user_id);

create policy "Users can insert their own memories"
  on public.memories for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own memories"
  on public.memories for update
  using (auth.uid() = user_id);

create policy "Users can delete their own memories"
  on public.memories for delete
  using (auth.uid() = user_id);

-- ==============================================================================
-- AUTOMATIC PROFILE INITIALIZATION TRIGGER
-- Ensures a profile record always exists when a user signs up.
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

-- Trigger definition on auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at timestamp function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger set_user_preferences_updated_at
  before update on public.user_preferences
  for each row execute procedure public.handle_updated_at();

create trigger set_conversations_updated_at
  before update on public.conversations
  for each row execute procedure public.handle_updated_at();

create trigger set_memories_updated_at
  before update on public.memories
  for each row execute procedure public.handle_updated_at();
