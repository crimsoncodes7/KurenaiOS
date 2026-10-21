-- Kurenai OS — a server runner and Web Push (roadmap 5.7 item 1,
-- docs/server-runner-plan.md): what reaches a closed app.
--
-- The device computes; the server delivers (invariant 131). Four tables:
--
--   kos_push_subs   this user's Web Push subscriptions, one per browser
--                   (endpoint + the two keys the push is encrypted to).
--                   Owner CRUD; the runner deletes one a push service says
--                   is gone (404/410).
--   kos_outlook     ONE row a user: the outlook a device published (the
--                   next seven days of notices with the ledger's own ids,
--                   the brief a scheduled message may read, the schedules
--                   the server runs, the model route) and `seen_at`, the
--                   presence beat an open device writes, so the runner
--                   holds pushes while you are in front of the app.
--                   Owner CRUD.
--   kos_push_sent   what the runner sent, so nothing goes twice. Owner may
--                   read; only the runner (service role) writes.
--   kos_runs        a scheduled message the server answered: one row per
--                   schedule and local day. Owner may read (the device pulls
--                   the reply on open); only the runner writes.
--
-- No credential ever rides these rows. The runner is called by pg_cron
-- with a shared secret (docs/server-runner-plan.md §8), never by a page.

create table public.kos_push_subs (
  user_id    uuid not null references auth.users (id) on delete cascade,
  endpoint   text not null,
  p256dh     text not null,
  auth       text not null,
  label      text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, endpoint)
);
create trigger kos_push_subs_touch
  before insert or update on public.kos_push_subs
  for each row execute function public.kos_touch_updated_at();
alter table public.kos_push_subs enable row level security;
create policy "kos_push_subs_select_own" on public.kos_push_subs
  for select to authenticated using (auth.uid() = user_id);
create policy "kos_push_subs_insert_own" on public.kos_push_subs
  for insert to authenticated with check (auth.uid() = user_id);
create policy "kos_push_subs_update_own" on public.kos_push_subs
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "kos_push_subs_delete_own" on public.kos_push_subs
  for delete to authenticated using (auth.uid() = user_id);

create table public.kos_outlook (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data_json  jsonb not null default '{}'::jsonb,
  hash       text not null default '',
  seen_at    timestamptz,
  updated_at timestamptz not null default now()
);
create trigger kos_outlook_touch
  before insert or update on public.kos_outlook
  for each row execute function public.kos_touch_updated_at();
alter table public.kos_outlook enable row level security;
create policy "kos_outlook_select_own" on public.kos_outlook
  for select to authenticated using (auth.uid() = user_id);
create policy "kos_outlook_insert_own" on public.kos_outlook
  for insert to authenticated with check (auth.uid() = user_id);
create policy "kos_outlook_update_own" on public.kos_outlook
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "kos_outlook_delete_own" on public.kos_outlook
  for delete to authenticated using (auth.uid() = user_id);

create table public.kos_push_sent (
  user_id uuid not null references auth.users (id) on delete cascade,
  item_id text not null,
  sent_at timestamptz not null default now(),
  primary key (user_id, item_id)
);
create index kos_push_sent_user_sent on public.kos_push_sent (user_id, sent_at);
alter table public.kos_push_sent enable row level security;
create policy "kos_push_sent_select_own" on public.kos_push_sent
  for select to authenticated using (auth.uid() = user_id);

create table public.kos_runs (
  user_id     uuid not null references auth.users (id) on delete cascade,
  schedule_id text not null,
  day         text not null,
  ok          boolean not null,
  text        text not null default '',
  updated_at  timestamptz not null default now(),
  primary key (user_id, schedule_id, day)
);
create index kos_runs_user_updated on public.kos_runs (user_id, updated_at);
create trigger kos_runs_touch
  before insert or update on public.kos_runs
  for each row execute function public.kos_touch_updated_at();
alter table public.kos_runs enable row level security;
create policy "kos_runs_select_own" on public.kos_runs
  for select to authenticated using (auth.uid() = user_id);
