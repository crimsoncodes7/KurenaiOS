-- Kurenai OS — Google Calendar, Google Tasks and Todoist (roadmap 5.15,
-- docs/integrations-plan.md, invariants 157–160).
--
-- One row a user and provider ('google' | 'todoist'): the refresh token the
-- provider gave at sign-in, the account it belongs to, and the SYNC LEASE —
-- which device is syncing that provider now, so two devices never both
-- create the same reminder or event remotely. Written only by the
-- ext-token Edge Function (service role). The refresh token never leaves
-- the server: the function mints a one-hour access token from it each time
-- a device asks. Row-level security is on with NO policies, so no browser
-- can read a token or take another user's lease.

create table public.kos_ext (
  user_id       uuid not null references auth.users (id) on delete cascade,
  provider      text not null check (provider in ('google', 'todoist')),
  refresh_token text not null,
  scopes        text not null default '',
  account       text not null default '',
  lease_holder  text,
  lease_until   timestamptz,
  updated_at    timestamptz not null default now(),
  primary key (user_id, provider)
);

create trigger kos_ext_touch
  before insert or update on public.kos_ext
  for each row execute function public.kos_touch_updated_at();

alter table public.kos_ext enable row level security;

-- The lease, taken atomically: free, expired or already this device's.
-- The clock is the database's, so no device's clock is compared (invariant 33).
create or replace function public.kos_ext_lease(p_user uuid, p_provider text, p_holder text, p_secs integer)
returns boolean
language sql
security definer
set search_path = public
as $$
  with took as (
    update public.kos_ext
       set lease_holder = p_holder,
           lease_until  = now() + make_interval(secs => greatest(10, least(p_secs, 600)))
     where user_id = p_user and provider = p_provider
       and (lease_until is null or lease_until < now() or lease_holder = p_holder)
    returning 1
  )
  select exists (select 1 from took);
$$;

create or replace function public.kos_ext_release(p_user uuid, p_provider text, p_holder text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.kos_ext set lease_holder = null, lease_until = null
   where user_id = p_user and provider = p_provider and lease_holder = p_holder;
$$;

revoke all on function public.kos_ext_lease(uuid, text, text, integer) from public, anon, authenticated;
revoke all on function public.kos_ext_release(uuid, text, text) from public, anon, authenticated;
grant execute on function public.kos_ext_lease(uuid, text, text, integer) to service_role;
grant execute on function public.kos_ext_release(uuid, text, text) to service_role;
