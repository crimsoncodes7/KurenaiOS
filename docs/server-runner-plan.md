# A server runner and Web Push: what reaches a closed app (plan, revision 1)

Asked for on 20 October 2026 (roadmap 5.7 item 1), started 22 October 2026.
It unparks "Scheduled messages while the app is closed".

> **Status (22 October 2026):** plan written; phases A and B are built on
> `feat/after-fsrs` (smoke97). Nothing is deployed. The steps that need
> your accounts (VAPID keys, function secrets, the cron job) are listed in
> §8.

Short answer:
- **The server never re-implements the app.** The device already knows,
  with the app's own rules, every notice it will raise in the coming days.
  It publishes that list, the **outlook**, whenever it syncs. A cron job on
  the server delivers each entry at its time as a Web Push, but only while
  no device has the app open.
- **Scheduled messages move to the server** when you turn closed-app
  delivery on. The server answers each one from a **brief**: the facts the
  Assistant's read tools would return for the next seven days, written by
  the device in the same publish. There are no tools on the server.
- **Phone, Mac and anything else that installs the app** get the push.
  iPhone needs the app added to the Home Screen first (iOS 16.4 or later).

---

## 1. What is there today

- **Invariant 98:** device alerts fire only while the page is open. There
  is no push server; a closed app stays quiet, and the page says so.
- **Invariant 71b:** a scheduled message runs while the app is open, or on
  the first open later that day. A day the app was never opened is skipped.
- **The notice sources** each own their rules and their once-only key:

| Kind | Where | Computable for a future time? |
|---|---|---|
| calendar (event alerts) | `calendar.js` tick: `cal:<aid>:<date>:<min>` | yes: an alert fires `min` minutes before a known moment |
| reminder | `reminders.js` tick: `rem:<id>:<due>:<time>:<min>` | yes, the same way |
| assignment | `assignments.js` tick: `asg:<id>:<due>:<time>:<min>` | yes, the same way |
| exam (start-by, milestones, tests tomorrow, season) | `KOS.exams.notices(from)` | yes: it takes the day |
| money (trial, bill, late income) | `KOS.money.notices(now)` | yes: it takes the day |
| goal (period ending, deadline, reached, missed) | `KOS.goals.notices(rows, today)` | ending and deadline yes; reached and missed need a measurement on the day, so no |
| assistant (a scheduled reply) | `aischedule.js` | only by running the model (§4) |
| airing, wishlist | `notify.js` | airing needs AniList's schedule; wishlist release days yes (phase C) |
| reports, pacing, focus | device-only facts | no: they describe what the device did |

## 2. The shape

```
device (open)                               Supabase
─────────────                               ────────
sync tick ──► KOS.outlook.build()  ──────►  kos_outlook (one row a user:
                (pure: the next 7 days of     items[], brief{}, tz, built_at)
                 notices + the brief)
visible  ──► presence beat every 2 min ──►  kos_outlook.seen_at
"Reach me when closed" ─► PushManager ───►  kos_push_subs (endpoint, keys)

                                            pg_cron, every 5 min
                                              └─► Edge Function `runner`
                                                   (service role, CRON_SECRET)
                                                   1. due outlook items not yet
                                                      in kos_push_sent, no device
                                                      seen in the last 5 min
                                                   2. due scheduled messages:
                                                      model + brief → kos_runs
                                                   3. Web Push to every sub
service worker `push` ◄──────────────────────── (encrypted, VAPID-signed)
  └─ showNotification(tag = the ledger id)
device (next open) ◄── kos_runs pulled: the reply lands on its schedule and
                       in the notification ledger, exactly once
```

## 3. The outlook (decision A: the device computes, the server delivers)

- **`KOS.outlook.build(now)`**, pure, reads only the owners' own functions:
  - calendar, reminder and assignment alerts in the next 7 days: each
    domain gains `forecast(fromTs, toTs)` returning the alerts its ticker
    WOULD fire, with the ticker's own id and the moment it fires;
  - exam, money and goal notices for each of the next 7 days, at a morning
    time (`ui.notifyMorning`, default 08:00), from their own `notices(day)`;
  - wishlist release days (phase C).
- **Each item:** `{id, kind, at (ms), title, body, view, arg}`. The id is
  the ledger id, so the push, the toast and the bell can never disagree.
- **Filters and quiet hours apply before publishing.** A kind muted in
  `notifyMuted` is left out. An item inside quiet hours is moved to the
  hour's end, or dropped when the move would make it pointless (a
  15-minute warning). Exam Season's "quiet the rest" applies as on the
  device.
- **Privacy:** the items are titles the synced state document already
  holds (event and reminder titles, an assessment's name, a bill's name).
  Money amounts are never in an item; Hide amounts is respected.
- **Published** on each sync push when it changed (a hash), and at least
  every 6 hours while open. A device that has not been opened for 7 days
  has an empty future, so the server goes quiet rather than inventing
  anything.

## 4. Scheduled messages on the server (decision B: a brief, no tools)

- **Turning closed-app delivery on hands schedules to the server**
  (`state.assistant.serverRuns`, synced). A device then never runs a
  schedule itself; it pulls the server's results. That gives one owner,
  so a reply can never come twice.
- **The brief** is part of the outlook publish. It holds, for the next 7
  days: the Pacing week and today's lessons, due cards per day and topic
  memory for the weakest topics, open assignments, calendar events,
  assessments with readiness bands and start-by dates, recurring bills
  (names and days, no amounts), goals ending, the study streak and hours
  this week. It is the same data the read tools return, made by the same
  functions. It is never notes, card text or chat history.
- **A run** is one text-only request: the system prompt, the brief ("as
  of <built_at>"), the schedule's prompt (`runner/model.ts`). `ai-chat` is
  left untouched: it is JWT-verified for users, and the runner is not one.
  The run is metered through `kos_ai_consume` before the provider is
  called, like every request, against your daily cap, and recorded in
  `kos_ai_usage` as category `scheduled`. A schedule whose route is Ollama
  (on your device) cannot run on the server, and its reply says so.
- **The result** goes to `kos_runs` `{user_id, schedule_id, day, at, ok,
  text}`. The device pulls it on open: `last` and `lastRun` are set, the
  `assistant` notification is pushed into the ledger with id
  `asst:<id>:<day>`, the device's own id (the push used the same tag).
- **Timezone:** `state.assistant.tz` (synced, set from the device that
  turned delivery on), so 07:00 is your 07:00.

## 5. Delivery

- **Subscriptions:** `kos_push_subs {user_id, endpoint, p256dh, auth,
  label}`, owner-only RLS. The page subscribes with
  the VAPID public key (`KOS_ENV.VAPID_PUBLIC_KEY`) after a user gesture,
  the same opt-in as device alerts (`ui.notifyDevice`), plus a new
  per-device switch, "Also when the app is closed".
- **Presence:** while a page is visible it updates `kos_outlook.seen_at`
  every 2 minutes. If any device was seen in the last 5 minutes, the runner holds pushes
  (the open device raises them itself) and retries on the next tick, up to
  30 minutes late. After that the item is dropped as stale: a late "in 15
  minutes" is noise.
- **Sent once:** `kos_push_sent {user_id, item_id, at}`. A 410 or 404 from
  a push service deletes that subscription.
- **The service worker's `push` handler** shows the notification with
  `tag` = the ledger id and `data` = `{view, arg}`. The existing
  `notificationclick` opens the right page.
- **Sending** uses Web Push with VAPID (RFC 8291 aes128gcm and RFC 8292),
  signed with WebCrypto inside the function. No third-party push service
  sits in the path, and the private key lives only in the function's
  secrets.

## 6. Security

- `runner` is called only by pg_cron, with `Authorization: Bearer
  <CRON_SECRET>` checked in constant time. `verify_jwt` is off for it.
  Nothing a browser can call starts it.
- It reads `kos_outlook`, `kos_push_subs`, `kos_push_sent` and `kos_runs`
  with the service role. It never reads `kos_state`, `kos_media`, files or
  credentials, and it writes only `kos_runs`, `kos_push_sent` and deletes
  dead subscriptions.
- The VAPID private key, `CRON_SECRET` and the provider keys are function
  secrets only (invariant 35).

## 7. Phases

| Phase | What | Gate |
|---|---|---|
| A | tables and RLS; subscribe and presence; the `push` handler; `KOS.outlook` for exam, money and goal notices plus calendar, reminder and assignment forecasts; `runner` delivering outlook items | smoke97 A–C, E–F |
| B | scheduled messages on the server: the brief, `runner/model.ts`, `kos_runs`, the device's pull and hand-over | smoke97 D–E |
| C | wishlist release days; airing (the runner asks AniList's public schedule for the watched list the brief carries) | later |

## 8. What you run once (needs your accounts)

> **22 October 2026:** steps 1–3 are done (keys generated, secrets set,
> `runner` deployed and answering). Step 4 is the SQL in the gitignored
> `supabase/runner-cron.sql.local`, which holds the secret.

1. `node tools/gen_vapid.mjs`. Put the public key in `js/env.local.js` as
   `VAPID_PUBLIC_KEY`.
2. `supabase secrets set VAPID_PUBLIC_KEY=… VAPID_PRIVATE_KEY=…
   VAPID_SUBJECT=mailto:you@example.com CRON_SECRET=<random 32 bytes>`.
3. `supabase db push` (the migrations), then
   `supabase functions deploy runner --no-verify-jwt`.
4. In the SQL editor, the cron job (pg_cron and pg_net are enabled on
   every Supabase project):
   `select cron.schedule('kos-runner', '*/5 * * * *', $$ select net.http_post(url := 'https://<ref>.supabase.co/functions/v1/runner', headers := jsonb_build_object('Authorization', 'Bearer <CRON_SECRET>')) $$);`

## 9. Invariants this moves

- **98:** "a closed app stays quiet" becomes: closed-app delivery is a
  per-device opt-in; the server delivers only the outlook the device
  published, never re-derives a notice, and holds while a device is open.
- **71b:** with `serverRuns` on, the server owns schedule runs, answering
  from the brief without tools. Off, nothing changes.
- **35:** new secrets are named.
- **New, 131:** the outlook and the brief are derived data published by a
  device. The server delivers them at their time and stores what it sent,
  and nothing else.

## 10. Decisions (proposed)

| | Decision | Proposed |
|---|---|---|
| A | Who computes a notice | the device, with the owners' own functions; the server only delivers (§3) |
| B | Server-side Assistant | the brief, no tools (§4); a run that needs a tool says what it could not see |
| C | Cadence | pg_cron every 5 minutes; an alert can land up to 5 minutes late |
| D | When a device is open | it holds the push (presence, 5 minutes) |
| E | Push library | WebCrypto in the function, no npm dependency |
