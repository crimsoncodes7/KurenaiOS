-- Kurenai OS — FSRS phase 3 (roadmap 5.6, docs/fsrs-plan.md §4, decision C):
-- the replicated copy of the review log.
--
-- The primary copy stays on each device (IndexedDB `kurenai-os-reviews`,
-- invariant 31: signed out, ratings and the optimiser still work). This
-- table is the replication layer, on the Build 4a pattern: owner-only RLS
-- through auth.uid(), server-generated timestamps through the shared touch
-- trigger, and the client's own identity as the key, so every device's
-- ratings join the optimiser's fit.
--
--   uid       the review's identity on every device: "<card key>|<ts>"
--   data_json one rating: {key, ts, day, g, el, s0, d0, s1, d1, ivl, src} —
--             numbers and a card key, never card text or a credential
--
-- A review never changes once written: pushes are insert-or-ignore.

create table public.kos_reviews (
  user_id    uuid not null references auth.users (id) on delete cascade,
  uid        text not null,
  data_json  jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, uid)
);

create index kos_reviews_user_updated on public.kos_reviews (user_id, updated_at);

create trigger kos_reviews_touch
  before insert or update on public.kos_reviews
  for each row execute function public.kos_touch_updated_at();

alter table public.kos_reviews enable row level security;

create policy "kos_reviews_select_own" on public.kos_reviews
  for select to authenticated using (auth.uid() = user_id);
create policy "kos_reviews_insert_own" on public.kos_reviews
  for insert to authenticated with check (auth.uid() = user_id);
create policy "kos_reviews_update_own" on public.kos_reviews
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "kos_reviews_delete_own" on public.kos_reviews
  for delete to authenticated using (auth.uid() = user_id);
