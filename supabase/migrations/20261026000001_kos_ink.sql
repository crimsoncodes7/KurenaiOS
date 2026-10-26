-- Kurenai OS — ink sync (roadmap 6.1, docs/ipad-plan.md decision D, design 30p):
-- the replicated copy of the ink store.
--
-- The primary copy stays on each device (IndexedDB `kurenai-os-ink`,
-- invariant 136: signed out, every pen still writes). This table is the
-- replication layer, on the Build 4a pattern: owner-only RLS through
-- auth.uid(), server-generated timestamps through the shared touch
-- trigger, the client's own ids as the key.
--
--   id        a page's id, or "doc:<doc key>" for a notebook's page order
--   kind      'page' | 'doc'
--   doc       the doc key the row belongs to ("topic:cs:4.6.1", "answer:…")
--   data_json a page {id, doc, paper, h?, items, at, created} or a doc
--             {key, pages, paper, title?, at}: strokes as packed numbers,
--             pictures as data URLs — never a credential
--   deleted   a tombstone: the page or doc was deleted on some device
--
-- A doc marked "this device only" (a past paper, decision D) is never
-- written here. Ink is never in the synced state document.

create table public.kos_ink (
  user_id    uuid not null references auth.users (id) on delete cascade,
  id         text not null,
  kind       text not null check (kind in ('page', 'doc')),
  doc        text not null,
  data_json  jsonb,
  deleted    boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

create index kos_ink_user_updated on public.kos_ink (user_id, updated_at);

create trigger kos_ink_touch
  before insert or update on public.kos_ink
  for each row execute function public.kos_touch_updated_at();

alter table public.kos_ink enable row level security;

create policy "kos_ink_select_own" on public.kos_ink
  for select to authenticated using (auth.uid() = user_id);
create policy "kos_ink_insert_own" on public.kos_ink
  for insert to authenticated with check (auth.uid() = user_id);
create policy "kos_ink_update_own" on public.kos_ink
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "kos_ink_delete_own" on public.kos_ink
  for delete to authenticated using (auth.uid() = user_id);
