-- Kurenai OS — Code → GitHub as a GitHub App (roadmap 5.7 item 2,
-- docs/github-app-plan.md).
--
-- One row a user: which installation of the KurenaiOS GitHub App is theirs,
-- and the one repository it reaches. Written only by the github-token Edge
-- Function, after it has checked the installation is in the user's own
-- /user/installations. Not a credential: the function mints a one-hour,
-- one-repository token from the App's private key (a function secret) each
-- time a push needs one. Row-level security is on with NO policies, so no
-- browser can read or point it at another installation.

create table public.kos_github (
  user_id         uuid primary key references auth.users (id) on delete cascade,
  installation_id bigint not null,
  repo            text not null,
  account         text not null default '',
  updated_at      timestamptz not null default now()
);

create trigger kos_github_touch
  before insert or update on public.kos_github
  for each row execute function public.kos_touch_updated_at();

alter table public.kos_github enable row level security;
