-- Kurenai OS — Reports (roadmap 5.1, phase 7): the replicated copy of the
-- saved reports and the period-boundary snapshots.
--
-- The primary copy stays on each device (IndexedDB `kurenai-os-reports`,
-- invariant 31: signed out, reports still work). This table is the
-- replication layer, on the Build 4a pattern: owner-only RLS through
-- auth.uid(), server-generated timestamps through the shared touch
-- trigger, and the client's own identity as the key.
--
--   item_id  "week:2026-10-05", "month:2026-09", "term:2026-08-31",
--            "year:2026", or "snap:2026-10-12" for a boundary snapshot
--   kind     'report' | 'snapshot'
--   stamp    the client's change marker (saved time, words changed) —
--            a device pushes only what changed since it last pushed
--   data_json the whole record: facts are derived data only (study
--            totals, topic refs and titles, Collection titles the user
--            already syncs in kos_media), never credentials.
--
-- A report's facts never change once saved; only its words do. Two devices
-- that both saved the same week converge on the copy saved first.

create table public.kos_reports (
  user_id    uuid not null references auth.users (id) on delete cascade,
  item_id    text not null,
  kind       text not null check (kind in ('report', 'snapshot')),
  stamp      text not null default '',
  data_json  jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, item_id)
);

create index kos_reports_user_updated on public.kos_reports (user_id, updated_at);

create trigger kos_reports_touch
  before insert or update on public.kos_reports
  for each row execute function public.kos_touch_updated_at();

alter table public.kos_reports enable row level security;

create policy "kos_reports_select_own" on public.kos_reports
  for select to authenticated using (auth.uid() = user_id);
create policy "kos_reports_insert_own" on public.kos_reports
  for insert to authenticated with check (auth.uid() = user_id);
create policy "kos_reports_update_own" on public.kos_reports
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "kos_reports_delete_own" on public.kos_reports
  for delete to authenticated using (auth.uid() = user_id);
