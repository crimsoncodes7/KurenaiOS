-- Kurenai OS — Build 4c: verified Steam identity.
--
-- kos_steam holds ONE verified SteamID64 per user. The row is written ONLY
-- by the steam-auth Edge Function (service role) after a server-side OpenID
-- check_authentication round-trip — the browser can read its own row but
-- can never insert or change a SteamID (no client-supplied identity is ever
-- trusted; that is the entire lesson of the Build 3e post-mortem).
--
-- kos_steam_auth holds the short-lived single-use nonces that bind an
-- OpenID callback to the authenticated user who started the flow. Service
-- role only — no client policy at all.

create table public.kos_steam (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  steam_id    text not null,
  verified_at timestamptz not null default now()
);

alter table public.kos_steam enable row level security;

-- the app may show "linked as <id>" for its own account; nothing else
create policy "kos_steam_select_own" on public.kos_steam
  for select to authenticated using (auth.uid() = user_id);
-- deliberately NO insert/update/delete policies: writes happen only through
-- the service role inside the steam-auth Edge Function

create table public.kos_steam_auth (
  nonce      text primary key,
  user_id    uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.kos_steam_auth enable row level security;
-- NO policies: this table is service-role only, invisible to clients
