# Google Calendar, Google Tasks and Todoist (roadmap 5.15)

Asked for and approved on 29 October 2026. Built on `feat/integrations`.
Invariants 157–160 in CLAUDE.md; held by `tools/smoke112.test.js`.

## 1. Decisions (approved 29 October 2026)

| | Decision |
|---|---|
| A | **Todoist completions** count as daily activity only — no XP or gold. |
| B | **Calendar split.** The Calendar's own events sync two-way with the PRIMARY Google calendar. What the Calendar derives (assessments, assignment due dates, start-by dates, class milestones, bills, goal deadlines) goes one way to a secondary "KurenaiOS" calendar the app makes for itself. |
| C | **Alerts** map to Google's popup reminders (no alerts ↔ Google's default). Todoist's reminders are a paid feature and stay out; alerts stay in this app. |
| D | **Sign-in like the GitHub App**, for Google and Todoist alike: the refresh token stays in the `ext-token` Edge Function's table; a device holds a one-hour access token in memory only. |
| E | **Google event ids** are base32hex (a–v, 0–9, 5–1024). A record's uid is 32 lowercase hex characters, a subset, so it is the event id as it is; anything else is cleaned to that alphabet (`KOS.ext.gcalId`). |
| F | **No echo.** A write a pull makes runs inside `KOS.ext.inbound`: it sets the record's base to what it wrote, and the owner's change note (`noteLocal`) is silent there. Either alone stops a loop; both are kept. |

## 2. What syncs

| | Google Calendar (two-way) | Todoist | Google Tasks |
|---|---|---|---|
| Title, notes / description | ✓ | ✓ | ✓ |
| Date | ✓ (one day, all-day or timed) | ✓ | ✓ |
| Time | ✓ start and end | ✓ (floating) | — Google has none |
| Repeat | daily, weekly, fortnightly, monthly, yearly; an end date or a count | the four Reminders has; any other Todoist rule is kept as written and sent back unchanged | — |
| Priority | — | 0–3 ↔ 1–4 | — |
| Tags | — | labels | — |
| Sub-tasks | — | child tasks | child tasks |
| Done | — | ✓ (activity, no pay) | ✓ (activity, no pay) |
| Alerts | popup reminders | — | — |
| Deletion | both ways | both ways | both ways |

What the Calendar cannot hold as one event — another rule (BYDAY lists, the first Monday, RDATE), several days, past midnight — is read-only: this device keeps a copy of its showings for the next six months (`ext.<uid>.google.ro` in the media kv) and draws them as derived chips (kind `google`, hidden from the Show menu like the others), never stored as events (invariants 43, 44). A showing Google cancelled or moved is a date the one record skips (`ext.g.skip`); a moved one is drawn read-only at its new time. Events that ended more than 30 days ago are neither imported nor sent.

## 3. Sign-in (`supabase/functions/ext-token`, invariant 157)

- `start` → the provider's consent page (Google: `access_type=offline`, `prompt=consent`; scopes `calendar.events`, `calendar.app.created`, `tasks`, `openid email`; Todoist: `data:read_write,data:delete`). The redirect must be the app's own URL or a local dev host (`redirectAllowed`); the state is a one-time `ext-<provider>-<nonce>` in sessionStorage, which GitHub's return handler leaves alone.
- `complete` → the code is exchanged with the client secret; the refresh token goes to `kos_ext` (migration `20261030000001`, RLS on, no policy).
- `token` → a fresh access token; a rotated refresh token replaces the old one.
- `lease` / `release` → one device syncs a provider at a time (`kos_ext_lease`, the database's clock, two minutes; service role only).
- `unlink` → revokes (Google) and deletes the row.

**Set-up you do once** (none of it can be done for you):

1. Google Cloud console: a project, the Calendar API and the Tasks API enabled, an OAuth consent screen (External) set to **In production** — in Testing, Google ends refresh tokens after 7 days. It stays unverified; you'll see Google's "unverified app" screen when you connect. An OAuth client (Web application) with the redirect URIs `https://kurenai-os.pages.dev/` and `http://localhost:8765/`.
2. Todoist App Management Console: an app with the redirect URI `https://kurenai-os.pages.dev` — WITHOUT the trailing slash: Todoist calls the bare domain with a slash an invalid URL, so the app sends Todoist the address without it (`KOS.ext.redirectUri`). Refresh tokens are on by default for new apps.
3. `supabase secrets set GOOGLE_CLIENT_ID=… GOOGLE_CLIENT_SECRET=… TODOIST_CLIENT_ID=… TODOIST_CLIENT_SECRET=…`, then `supabase functions deploy ext-token` and `supabase db push`.

## 4. Google Calendar (`js/core/extgcal.js`)

A cycle: uids for records from before, fold two links to one event, the delete queue, the incremental pull (`syncToken`; a 410 reads it all again), the push, then the export.

- **Pull.** A linked event merges against `ext.g.base` field by field (title, when, repeat, location, description, alerts); a field changed on one side takes that side, on both this app's. An event carrying a `kosUid` this device doesn't have yet is another device's, still on its way through the cloud, and is left for it. A cancelled one deletes the local copy (no queue).
- **Push.** A new event is inserted under `gcalId(uid)`; a 409 means it is already there (another device, an earlier try) and is linked, not copied. A change is a PATCH of only its fields, with `If-Match`; a 412 waits for the next pull.
- **Export.** `exportItems()` reads the derived sources with `derivedOn(date, {all: true})` (so a device's Show menu never changes what is sent), the next 120 days. Each item is named `gcalId(hash(key))`, rewritten when its body changes, removed when it goes. Bills carry no amount. Events are `transparent` and carry no reminders.

## 5. Reminders (`js/core/exttasks.js`)

A list links to one Todoist project or one Google Tasks list (`list.ext`); "Reminders with no list" links through `state.ext.noList`. Linking one replaces the other, so nothing bounces between the two.

- **Todoist**: the Sync API. One read (`sync_token`; a change in the linked projects reads them whole), then one batch of commands. An `item_add`'s command id is `uuidOf("add|" + uid)`, so another device's retry is the same command. A per-device mirror of the linked projects' tasks gives every reminder its sub-tasks.
- **Google Tasks**: `updatedMin` with Google's own timestamps, a per-device mirror per list; a reminder moved to another linked list is deleted there and added again.
- A completion pulled in ticks the reminder (never through `complete()`, which pays) and the cycle logs ONE `todo` session, `metrics.external`, priced at nothing by the Governor (invariant 160).

## 6. The page

Archive › Connections (`#/connections`, `js/modules/connections.js`): the Google card (connect, two-way, the export and what it carries, Google Tasks, Sync now, the last cycle), the Todoist card, and Reminders lists (a picker per list). It reads only when drawn.

## 7. Not in this release

- Google's push notifications (watch channels) — the 15-minute cycle, a change and returning to the app are the triggers.
- Calendars other than the primary for two-way.
- Todoist reminders (paid), sections, and comments.
- The runner syncing while the app is closed.
