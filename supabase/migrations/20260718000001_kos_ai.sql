-- Kurenai OS — Category 6 Phase A: assistant provider metering.
--
-- Two tables, both SERVER-OWNED (the kos_steam precedent): the browser may
-- read its own rows for the usage/cap display, but every write happens
-- through the service role inside the ai-chat Edge Function. This is the
-- documented privileged-access exception — infrastructure metering, never
-- ordinary user-data operations.
--
--   kos_ai_daily — one counter row per (user, external provider, day); the
--                  per-user daily cap is enforced ATOMICALLY by
--                  kos_ai_consume below, so concurrent requests cannot slip
--                  past the cap between a read and an increment.
--   kos_ai_usage — one row per request for diagnosis and the usage UI:
--                  provider, model, category, outcome, token counts when the
--                  provider returned them, whether the rate limiter refused
--                  it, and the request correlation id. NEVER prompts, never
--                  message content, never key material.
--
-- Local Ollama usage is deliberately absent here: it is not external spend
-- and is tracked client-side for visibility only.

create table public.kos_ai_daily (
  user_id  uuid not null references auth.users (id) on delete cascade,
  provider text not null,
  day      date not null,
  used     integer not null default 0,
  primary key (user_id, provider, day)
);

alter table public.kos_ai_daily enable row level security;

-- the app may show "N of cap used today" for its own account; nothing else.
-- Deliberately NO insert/update/delete policies: writes are service-role
-- only, through kos_ai_consume.
create policy "kos_ai_daily_select_own" on public.kos_ai_daily
  for select to authenticated using (auth.uid() = user_id);

-- The atomic check-and-increment. A single INSERT ... ON CONFLICT DO UPDATE
-- takes the row lock, so two concurrent calls serialise: the WHERE clause on
-- the update arm refuses the increment once the cap is reached and the
-- statement then returns no row — which this function reports as
-- allowed = false. security definer + service-role-only EXECUTE: clients
-- can never call it (they have no path that writes metering).
create or replace function public.kos_ai_consume(
  p_user uuid, p_provider text, p_day date, p_cap integer
)
returns table (allowed boolean, used integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_used integer;
begin
  insert into public.kos_ai_daily (user_id, provider, day, used)
    values (p_user, p_provider, p_day, 1)
  on conflict (user_id, provider, day) do update
    set used = public.kos_ai_daily.used + 1
    where public.kos_ai_daily.used < p_cap
  returning public.kos_ai_daily.used into v_used;

  if v_used is null then
    -- cap reached: report the standing count without consuming
    select d.used into v_used from public.kos_ai_daily d
      where d.user_id = p_user and d.provider = p_provider and d.day = p_day;
    return query select false, coalesce(v_used, 0);
  else
    return query select true, v_used;
  end if;
end;
$$;

revoke execute on function public.kos_ai_consume(uuid, text, date, integer) from public;
revoke execute on function public.kos_ai_consume(uuid, text, date, integer) from anon;
revoke execute on function public.kos_ai_consume(uuid, text, date, integer) from authenticated;
grant  execute on function public.kos_ai_consume(uuid, text, date, integer) to service_role;

create table public.kos_ai_usage (
  id             bigint generated always as identity primary key,
  user_id        uuid not null references auth.users (id) on delete cascade,
  provider       text not null,
  model          text not null,
  category       text,
  outcome        text not null,           -- ok | provider_error | rate_limited | timeout | invalid
  prompt_tokens  integer,
  completion_tokens integer,
  rate_limited   boolean not null default false,
  correlation_id text,
  created_at     timestamptz not null default now()
);

create index kos_ai_usage_user_day on public.kos_ai_usage (user_id, created_at);

alter table public.kos_ai_usage enable row level security;

-- read-own for the usage panel; service-role-only writes (no client policies)
create policy "kos_ai_usage_select_own" on public.kos_ai_usage
  for select to authenticated using (auth.uid() = user_id);
