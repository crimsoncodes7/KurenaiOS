-- Kurenai OS — Category 6 Phases C/D: assistant persistence.
--
-- Four owner-only tables on the Build 4a pattern (RLS via auth.uid(),
-- server-generated timestamps through the shared touch trigger):
--
--   kos_assistant_conversations / kos_assistant_messages — chat history
--     (wired in Phase D; schema lands here so C+D share one migration).
--   kos_assistant_memory — the deliberately simple notes-to-self store
--     (wired in Phase D; written only on explicit ask or approved proposal).
--   kos_assistant_audit — the tool-action audit log (wired in PHASE C):
--     one row per proposed tool action, updated through its lifecycle
--     (proposed → awaiting_confirmation → confirmed/rejected →
--     executed/failed). args_json is the SANITIZED canonical argument
--     object; never secrets, never large payloads, never message content
--     beyond the action itself. Owner select/insert/update — deliberately
--     NO delete policy: the executed-action history stays inspectable and
--     honest (revisit only as an explicit user decision).
--
-- All ids are client-minted UUIDs (the same device-independent-identity
-- rule as syncId/fileId — local sequence numbers never leave the device).

create table public.kos_assistant_conversations (
  id         uuid primary key,
  user_id    uuid not null references auth.users (id) on delete cascade,
  title      text not null default 'New conversation',
  summary    text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index kos_assistant_conversations_user
  on public.kos_assistant_conversations (user_id, updated_at desc);

create trigger kos_assistant_conversations_touch
  before insert or update on public.kos_assistant_conversations
  for each row execute function public.kos_touch_updated_at();

alter table public.kos_assistant_conversations enable row level security;
create policy "kos_assistant_conversations_select_own" on public.kos_assistant_conversations
  for select to authenticated using (auth.uid() = user_id);
create policy "kos_assistant_conversations_insert_own" on public.kos_assistant_conversations
  for insert to authenticated with check (auth.uid() = user_id);
create policy "kos_assistant_conversations_update_own" on public.kos_assistant_conversations
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "kos_assistant_conversations_delete_own" on public.kos_assistant_conversations
  for delete to authenticated using (auth.uid() = user_id);

create table public.kos_assistant_messages (
  id              uuid primary key,
  conversation_id uuid not null references public.kos_assistant_conversations (id) on delete cascade,
  user_id         uuid not null references auth.users (id) on delete cascade,
  role            text not null check (role in ('user', 'assistant', 'tool', 'system')),
  content         jsonb not null,
  created_at      timestamptz not null default now()
);

create index kos_assistant_messages_convo
  on public.kos_assistant_messages (conversation_id, created_at);

alter table public.kos_assistant_messages enable row level security;
create policy "kos_assistant_messages_select_own" on public.kos_assistant_messages
  for select to authenticated using (auth.uid() = user_id);
create policy "kos_assistant_messages_insert_own" on public.kos_assistant_messages
  for insert to authenticated with check (auth.uid() = user_id);
create policy "kos_assistant_messages_delete_own" on public.kos_assistant_messages
  for delete to authenticated using (auth.uid() = user_id);

create table public.kos_assistant_memory (
  id         uuid primary key,
  user_id    uuid not null references auth.users (id) on delete cascade,
  content    text not null,
  origin     text not null default 'user',   -- user | approved-proposal
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger kos_assistant_memory_touch
  before insert or update on public.kos_assistant_memory
  for each row execute function public.kos_touch_updated_at();

alter table public.kos_assistant_memory enable row level security;
create policy "kos_assistant_memory_select_own" on public.kos_assistant_memory
  for select to authenticated using (auth.uid() = user_id);
create policy "kos_assistant_memory_insert_own" on public.kos_assistant_memory
  for insert to authenticated with check (auth.uid() = user_id);
create policy "kos_assistant_memory_update_own" on public.kos_assistant_memory
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "kos_assistant_memory_delete_own" on public.kos_assistant_memory
  for delete to authenticated using (auth.uid() = user_id);

create table public.kos_assistant_audit (
  id              uuid primary key,
  user_id         uuid not null references auth.users (id) on delete cascade,
  conversation_id uuid,
  correlation_id  text,
  tool            text not null,
  provider        text,
  model           text,
  args_json       jsonb not null default '{}'::jsonb,
  target          text,
  tier            text not null,
  status          text not null check (status in
    ('proposed', 'awaiting_confirmation', 'confirmed', 'rejected',
     'executed', 'failed', 'cancelled')),
  result_summary  text,
  error_summary   text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index kos_assistant_audit_user
  on public.kos_assistant_audit (user_id, created_at desc);

create trigger kos_assistant_audit_touch
  before insert or update on public.kos_assistant_audit
  for each row execute function public.kos_touch_updated_at();

alter table public.kos_assistant_audit enable row level security;
create policy "kos_assistant_audit_select_own" on public.kos_assistant_audit
  for select to authenticated using (auth.uid() = user_id);
create policy "kos_assistant_audit_insert_own" on public.kos_assistant_audit
  for insert to authenticated with check (auth.uid() = user_id);
create policy "kos_assistant_audit_update_own" on public.kos_assistant_audit
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- NO delete policy on kos_assistant_audit (see header).
