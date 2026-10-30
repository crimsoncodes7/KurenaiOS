-- Kurenai OS — Mind (roadmap 5.9, docs/mind-plan.md §9.3, invariant 139): the replicated copy of
-- the Journal.
--
-- The primary copy stays on each device (IndexedDB `kurenai-os-mind`, invariant 31: signed out,
-- the Journal still works). Positions, explain-backs and lesson evidence ride the synced state
-- document; only the free-text entries — insights, quotes, questions and reflections, which grow
-- for years — live here. On the kos_money pattern: owner-only RLS through auth.uid(),
-- server-generated timestamps through the shared touch trigger, and the client's own id as the key.
--
--   sync_id   the entry's id ("j-…", made on the device)
--   deleted   a tombstone (invariant 32): the row stays so every device learns of the deletion;
--             data_json is then empty
--   stamp     the client's change marker — a device pushes only what changed since it last pushed,
--             and skips its own echo
--   data_json the entry: kind, title, text, concepts, lesson, source, dates. Never a credential.
--             Nothing reads it but its owner: Reports count entries on the device and never quote
--             them, and the closed-app runner never reads this table.

create table public.kos_mind (
  user_id    uuid not null references auth.users (id) on delete cascade,
  sync_id    text not null,
  deleted    boolean not null default false,
  stamp      text not null default '',
  data_json  jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, sync_id)
);

create index kos_mind_user_updated on public.kos_mind (user_id, updated_at);

create trigger kos_mind_touch
  before insert or update on public.kos_mind
  for each row execute function public.kos_touch_updated_at();

alter table public.kos_mind enable row level security;

create policy "kos_mind_select_own" on public.kos_mind
  for select to authenticated using (auth.uid() = user_id);
create policy "kos_mind_insert_own" on public.kos_mind
  for insert to authenticated with check (auth.uid() = user_id);
create policy "kos_mind_update_own" on public.kos_mind
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "kos_mind_delete_own" on public.kos_mind
  for delete to authenticated using (auth.uid() = user_id);
