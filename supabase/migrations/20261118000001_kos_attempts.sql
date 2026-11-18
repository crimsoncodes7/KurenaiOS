-- Kurenai OS — recorded exam attempts (the Exams & Papers rework,
-- docs/exams-rework-plan.md §8.1, decision D1; invariant 130a): the
-- replicated copy of each device's recorded attempts.
--
-- The primary copy stays on each device (IndexedDB `kurenai-os-attempts`,
-- invariant 31: signed out, recording and feedback still work). This table
-- is the replication layer on the review log's pattern: owner-only RLS
-- through auth.uid(), server-generated timestamps through the shared touch
-- trigger, the client's own identity as the key.
--
--   uid       the attempt's identity on every device (16 hex characters)
--   data_json one attempt: its parts, its events (timing only: never ink or
--             typed text), its marks and any feedback imported for it; or
--             {uid, deleted: true, updatedAt} when it was deleted
--
-- Unlike a review, an attempt changes after it is sat (its marks, then
-- feedback), so a push is an upsert and the newer `updatedAt` wins on read.

create table public.kos_attempts (
  user_id    uuid not null references auth.users (id) on delete cascade,
  uid        text not null,
  data_json  jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, uid)
);

create index kos_attempts_user_updated on public.kos_attempts (user_id, updated_at);

create trigger kos_attempts_touch
  before insert or update on public.kos_attempts
  for each row execute function public.kos_touch_updated_at();

alter table public.kos_attempts enable row level security;

create policy "kos_attempts_select_own" on public.kos_attempts
  for select to authenticated using (auth.uid() = user_id);
create policy "kos_attempts_insert_own" on public.kos_attempts
  for insert to authenticated with check (auth.uid() = user_id);
create policy "kos_attempts_update_own" on public.kos_attempts
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "kos_attempts_delete_own" on public.kos_attempts
  for delete to authenticated using (auth.uid() = user_id);
