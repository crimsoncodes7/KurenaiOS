-- Kurenai OS — Money (roadmap 5.4, phase 5): the replicated copy of the
-- transactions.
--
-- The primary copy stays on each device (IndexedDB `kurenai-os-money`,
-- invariant 31: signed out, Money still works). Categories, rules and pots
-- ride the synced state document; only the transactions, which grow for
-- years, live here. On the Build 4a pattern: owner-only RLS through
-- auth.uid(), server-generated timestamps through the shared touch
-- trigger, and the client's own identity (`syncId`) as the key.
--
--   sync_id   the transaction's id: "t-…" typed, "r:<rule>:<date>" a
--             confirmed recurring occurrence (the same on every device)
--   deleted   a tombstone (invariant 32): the row stays so every device
--             learns of the deletion; data_json is then empty
--   stamp     the client's change marker — a device pushes only what
--             changed since it last pushed, and skips its own echo
--   data_json the transaction: date, amount in pence, kind, category,
--             payee, note, tags, pot. Never a credential. The Budget
--             Planner's mirrored purchases are never sent: every device
--             derives them from the state document.

create table public.kos_money (
  user_id    uuid not null references auth.users (id) on delete cascade,
  sync_id    text not null,
  deleted    boolean not null default false,
  stamp      text not null default '',
  data_json  jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, sync_id)
);

create index kos_money_user_updated on public.kos_money (user_id, updated_at);

create trigger kos_money_touch
  before insert or update on public.kos_money
  for each row execute function public.kos_touch_updated_at();

alter table public.kos_money enable row level security;

create policy "kos_money_select_own" on public.kos_money
  for select to authenticated using (auth.uid() = user_id);
create policy "kos_money_insert_own" on public.kos_money
  for insert to authenticated with check (auth.uid() = user_id);
create policy "kos_money_update_own" on public.kos_money
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "kos_money_delete_own" on public.kos_money
  for delete to authenticated using (auth.uid() = user_id);
