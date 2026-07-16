-- Kurenai OS — Build 4a cloud sync schema.
--
-- Three application tables mirror the three local persistence layers:
--   kos_state  ← localStorage "kurenai-os-v1"   (ONE jsonb document per user;
--                mirrors the existing R3 export architecture — last-write-wins
--                applies to the WHOLE document, so concurrent edits to
--                unrelated fields on different devices can overwrite each
--                other; accepted + documented, not merged field-by-field)
--   kos_media  ← IndexedDB "kurenai-os-media"   (one row per vault entry,
--                keyed by the entry's device-independent syncId)
--   kos_files  ← IndexedDB "kurenai-os-files"   (attachment METADATA only —
--                binary content lives in the kos-attachments storage bucket,
--                uploaded only by explicit user action)
--
-- Timestamps are SERVER-generated (default + touch trigger): the browser
-- client never supplies updated_at, so client clock skew can never corrupt
-- last-write-wins ordering. Deletions are soft tombstones (deleted=true) so
-- other devices learn about them through the normal pull path.
--
-- Row-Level Security is the actual security boundary (the publishable key
-- ships in the browser). Every policy is owner-only via auth.uid().

-- ---------------------------------------------------------------------------
-- shared touch trigger: updated_at is always server time
-- ---------------------------------------------------------------------------
create or replace function public.kos_touch_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- kos_state — one jsonb document per user
-- ---------------------------------------------------------------------------
create table public.kos_state (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  state_json jsonb not null,
  updated_at timestamptz not null default now()
);

create trigger kos_state_touch
  before insert or update on public.kos_state
  for each row execute function public.kos_touch_updated_at();

alter table public.kos_state enable row level security;

create policy "kos_state_select_own" on public.kos_state
  for select to authenticated using (auth.uid() = user_id);
create policy "kos_state_insert_own" on public.kos_state
  for insert to authenticated with check (auth.uid() = user_id);
create policy "kos_state_update_own" on public.kos_state
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "kos_state_delete_own" on public.kos_state
  for delete to authenticated using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- kos_media — one row per media vault entry
-- entry_id is the entry's syncId (a UUID minted locally, stable across
-- devices — local IndexedDB autoIncrement ids are per-device and never leave
-- the device). data_json is the full normalised entry.
-- ---------------------------------------------------------------------------
create table public.kos_media (
  user_id    uuid not null references auth.users (id) on delete cascade,
  entry_id   text not null,
  module     text not null,
  data_json  jsonb not null,
  deleted    boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, entry_id)
);

-- module-scoped queries for a user; the PK already covers (user_id, entry_id)
create index kos_media_user_module on public.kos_media (user_id, module);

create trigger kos_media_touch
  before insert or update on public.kos_media
  for each row execute function public.kos_touch_updated_at();

alter table public.kos_media enable row level security;

create policy "kos_media_select_own" on public.kos_media
  for select to authenticated using (auth.uid() = user_id);
create policy "kos_media_insert_own" on public.kos_media
  for insert to authenticated with check (auth.uid() = user_id);
create policy "kos_media_update_own" on public.kos_media
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "kos_media_delete_own" on public.kos_media
  for delete to authenticated using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- kos_files — attachment metadata ONLY (no binary content in this table)
-- file_id is the attachment's fileId UUID (files DB v2). entry_id carries the
-- "subject:ref" topic key the attachment belongs to. meta_json carries the
-- fields the required columns can't (subject, ref, the user's note, added ts)
-- — a documented addition to the required shape. binary_uploaded records
-- whether the blob has been explicitly uploaded to storage.
-- ---------------------------------------------------------------------------
create table public.kos_files (
  user_id         uuid not null references auth.users (id) on delete cascade,
  file_id         text not null,
  entry_id        text,
  name            text not null,
  mime_type       text,
  size            bigint not null,
  meta_json       jsonb not null default '{}'::jsonb,
  binary_uploaded boolean not null default false,
  deleted         boolean not null default false,
  updated_at      timestamptz not null default now(),
  primary key (user_id, file_id)
);

create trigger kos_files_touch
  before insert or update on public.kos_files
  for each row execute function public.kos_touch_updated_at();

alter table public.kos_files enable row level security;

create policy "kos_files_select_own" on public.kos_files
  for select to authenticated using (auth.uid() = user_id);
create policy "kos_files_insert_own" on public.kos_files
  for insert to authenticated with check (auth.uid() = user_id);
create policy "kos_files_update_own" on public.kos_files
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "kos_files_delete_own" on public.kos_files
  for delete to authenticated using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- storage: private kos-attachments bucket
-- Objects live under <auth-user-id>/<file-id>/<safe-file-name>. Ownership is
-- derived from auth.uid() and the object PATH — never from a client-supplied
-- user id. 26 MB object cap (the app enforces 25 MB per attachment).
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit)
values ('kos-attachments', 'kos-attachments', false, 27262976)
on conflict (id) do nothing;

create policy "kos_attachments_select_own" on storage.objects
  for select to authenticated
  using (bucket_id = 'kos-attachments' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "kos_attachments_insert_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'kos-attachments' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "kos_attachments_update_own" on storage.objects
  for update to authenticated
  using (bucket_id = 'kos-attachments' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'kos-attachments' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "kos_attachments_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'kos-attachments' and (storage.foldername(name))[1] = auth.uid()::text);
