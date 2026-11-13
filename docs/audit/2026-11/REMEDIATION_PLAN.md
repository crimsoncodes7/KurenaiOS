# KurenaiOS quality programme — remediation plan

**Status (8 Nov 2026): APPROVED for implementation of W0 and W1**, with the
10 revisions in §A and the 14 decisions in §B. W2–W10 are approved in outline
and follow in order. Each later workstream starts once the previous one has
been reported.

**Shipped before approval, at your request:**
- `kos-redraw-1` (3 Nov): the redraw stopgap.
- `kos-malfix-1` (8 Nov): the DI-27 hotfix.

**The basis:**
- 21 areas, each with an inventory and a coverage matrix.
- 737 findings, 731 of them open: P0 5 · P1 97 · P2 327 · P3 302
  ([`FINDINGS.md`](FINDINGS.md)).
- Your reports, UR-1…24.
- The live checks, LA-1…32.
- Gemini's re-check of the P0/P1s, accepted as corroboration.
- Claude's re-check of the new P1s.

Every open finding is assigned to exactly one workstream, by its root cause,
in [`data/plan-mapping.json`](data/plan-mapping.json). §1's counts are
generated from that file. The appendix lists every finding.

**Execution discipline (yours, binding):**
- **Destructive work.** Every migration, clean-up, economy correction and
  repository deletion is treated as potentially destructive. First comes a
  backup that has been verified by a test restore. Migrations are idempotent,
  and rollback paths are kept.
- **Your real account.** Anything touching it is tested first on isolated
  sample data. The expected changes and the reconciliation are shown to you
  before running, and I stop if the actual changes differ.
- **Tests.** The relevant tests run after every workstream, and results are
  reported as they are: failures and skips included.
- **Documents.** The plan, this mapping, the findings, implementation notes
  and test evidence stay in sync.
- **Scope.** No expansion without asking you. New issues go to the backlog.
- **Conflicts.** Where a specified design conflicts with an invariant, risks
  data loss or can't be done safely as written, I stop and explain. I don't
  substitute a different design.

---

## 1. The shape of it (generated from `data/plan-mapping.json`)

| WS | Workstream | Open | P0 | P1 | P2 | P3 | Root causes (HANDOFF §6) |
|---|---|---|---|---|---|---|---|
| W0 | Safety net (tests and gates first) | 4 | | | | 4 | test infrastructure, 8, 10 |
| W1 | Data integrity and the economy | 59 | 5 | 11 | 31 | 12 | 4, 5, 6, 21, DI-27 |
| W2 | Redraw policy, view lifecycle and boot | 63 | | 17 | 33 | 13 | 1, 14 (boot), 15, 18 |
| W3 | Layering, layout tiers and touch | 160 | | 26 | 80 | 54 | 2, 3, 17 |
| W4 | Money revamp | 25 | | 9 | 6 | 10 | 11 |
| W5 | Cosmetics, shop and art | 45 | | 11 | 27 | 7 | 10 |
| W6 | Content quality and exam marking | 50 | | 8 | 20 | 22 | 7, 8, 9 |
| W7 | Connected OS and honest numbers | 99 | | 15 | 46 | 38 | 12, 19, 20 |
| W8 | Maintainability, performance and docs | 23 | | | 14 | 9 | 13, 14, 16 |
| W9 | Polish and HCI (frozen, §A9) | 200 | | | 70 | 130 | — |
| QoL | Findings that are QoL | 3 | | | | 3 | |
| | **Total** | **731** | **5** | **97** | **327** | **302** | |

**No P0 or P1 is left in W8 or W9.** These moved:
- SH-20, SH-21, AA-01 and AP-01 → W2;
- EX-01 → W6.

**Order of work:**
1. W0.
2. W1. At the end of W1 the three design prompts go to you (§A8).
3. W2 and W3.
4. W7, with W4, W5 and W6 alongside it.
5. W8 and W9.
6. W10.

**How each workstream ships.** Each one gets its own branch from `main` and
its own release or releases. The full gate passes before anything ships, and
a device check runs on Mac, iPad (portrait and landscape) and iPhone. Each
deploy waits for your go-ahead.

---

## A. The ten revisions (8 Nov), as applied

**A1. The counts are reconciled.** §1 is generated from the mapping and
sums to 731. `harness/plan_appendix.py` refuses to run if any open finding is
unmapped.

**A2. P1s are promoted out of the polish and docs workstreams.**
- SH-20, SH-21 and AA-01 move to W2. AP-01 (boot weight) also moves to W2,
  so the iPad and iPhone device checks in W3–W7 aren't held up by slow cold
  starts.
- EX-01 moves to W6, alongside exam self-marking.
- Every P0 and P1 now has an explicit fix and acceptance check, in §2's
  tables.

**A3. Money de-duplication (MG-01 + MG-23).**
- **What makes a transaction's identity:**
  - **FITID** when the bank provides one (OFX, and QIF where present);
  - otherwise the tuple `date | minor | kind | normalised raw text` plus a
    **within-statement occurrence ordinal** (`occ` 1, 2… for identical
    tuples in one file);
  - plus the **running balance delta** when the file has a Balance column.
- **Each import records:**
  - a **statement fingerprint** (account, date range, row count, hash);
  - the original row, which stays on the transaction (`src`) for
    reconciliation.
- **How a match works:**
  - **Re-importing a statement** skips `(tuple, occ 1)` and `(tuple, occ 2)`,
    because both already exist.
  - **Two genuine identical coffees** in one statement are `occ 1` and
    `occ 2`, and both import.
  - **Overlapping or reordered exports** match by FITID, or by balance chain
    and tuple-with-occurrence. Ordinals are assigned in each file's own date
    order, so reordering doesn't change identity. When rows are ambiguous,
    they import as "possible duplicate", unticked, and are never dropped
    silently.
- **Tests:** a statement imported twice; two identical same-day purchases;
  overlapping date ranges; a reordered export; a file with FITID; a file with
  a balance column.

**A4. Concurrency across tabs, devices and provider syncs (DI-04, DI-19,
SY-18).**
- **Saving.**
  - `localStorage` holds a monotonic **`rev`**, and each tab keeps its
    `baseRev` and `baseState`.
  - `save()` takes `navigator.locks.request('kos-state-write')`.
  - If the stored rev is newer, it **three-way merges** stored state and the
    tab's memory against `baseState` with `KOS.cloudmerge` *before* writing.
  - It then writes and bumps rev.
  - Finally it broadcasts `{rev, keys}` on **`BroadcastChannel('kos-state')`**,
    and other tabs patch their memory straight away.
- **Merge semantics per top-level domain.** These are written out as a table
  in W1 and taken from cloudmerge's existing rules:
  - records by id;
  - additive gold, XP and HP;
  - keyed maps per key;
  - monotonic badges.
  - Domains that are per-device (`ui`, `focus.active`) never merge across
    tabs of one device unless they are written by that tab.
  - **No domain whose concurrent changes can lose data uses
    last-write-wins.**
- **The Todoist and Google lease.** It gets a per-tab instance id under a Web
  Lock, and its heartbeat is renewed during multi-chunk pushes.
- **Tests:**
  - simultaneous edits in two jsdom "tabs" sharing storage;
  - a stale tab;
  - an interrupted write;
  - lock contention;
  - a provider sync running alongside a local edit.

**A5. Storage ceiling and privacy (DI-10, DI-18, DI-25).**
- **DI-10:**
  - Avatar and banner data-URLs move to `kurenai-os-files`.
  - A live state-size meter is added to Archive › Storage.
  - An IndexedDB mirror of `kurenai-os-v1` is written after each successful
    save.
  - Session entries past the 2,000 cap are archived to IndexedDB instead of
    being dropped.
  - **Write order:** localStorage first, then the mirror.
  - **Recovery precedence:** at boot, the newer `rev` of the two wins.
  - **On `QuotaExceededError`:** the mirror becomes the primary, and a
    visible warning is shown. A save that failed both stores is reported as
    failed, never as a success.
- **DI-18.** Creatives' IndexedDB operations are scoped by `KOS.dataMode`
  (mine, empty or sample) through the store registry.
- **DI-25.** `state.japanese.mined` moves out of the synced document into a
  local IndexedDB store. It is in full backups and never in the cloud push
  (invariant **115**, "personal media never leaves the device"; the request
  cited 13, but 115 is the governing one).

**A6. Per-action durable sessions (ST-04, JM-08, JM-22, SY-03, SY-09).**
- Each review or learn batch gets a stable **`sessionId`**, kept in
  `state.ui` together with its remaining queue.
- After each rating (debounced about 2 s, and immediately on
  `visibilitychange` to hidden), the app **upserts that one ledger entry**
  (cards, passed, dur) and pays only the **delta** against the session's
  stored receipt.
- Replaying, retrying or restoring never pays twice: the receipt is the
  amount already paid for that sessionId.
- Coming back offers **Resume** or **Start fresh**.
- This keeps invariant 5 (one action, one session) and 116 (one ledger entry
  per Japanese session).

**A7. W0 also covers:**
- automated tests for DST and the 04:00 routine-day boundary;
- the service-worker update prompt across two versions;
- the offline fallbacks;
- a read-only audit of `supabase/functions/` (CORS, auth-header checks and
  error shapes against the client's assumptions).

**A8. Design prompts are drafted early.** D-Held page, D-Topic tier and
D-Agenda go to you **at the end of W1**, so they're approved before W2/W3.

**A9. W9 is frozen.** W9 is exactly the **200** findings mapped to it, plus
your **6** QoL items in §5. The auditors' other 181 QoL ideas stay in the
post-programme backlog.

**A10. Breakpoints and checklist evidence.**
- **W3 testing.** W3 is tested and enforced at **1470, 1180, 1080, 820, 700
  and 402 (and 402×760)** wide, in portrait and landscape and in Split View
  and Slide Over, with no dead zones.
  - Those are **test widths**. The CSS stays on invariant 47's five
    breakpoints (1240, 1080, 860, 700, 560), and other needs reflow
    intrinsically, because adding breakpoints would break that invariant.
- **W10 checklist.** Every item links the finding ids it verifies **and**
  cites the smoke suite and device check that closed them.

---

## B. Your decisions (8 Nov), recorded

| # | Decision | Notes on doing it safely |
|---|---|---|
| B1 | **DI-27 clean-up: yes.** Remove the phantom sync-reward entries and scrub the polluted journal events, after a verified W0 backup. **Deduct the phantom XP and gold**, clamped at 0. **Keep badge tiers** (invariant 162). **Rebuild** saved reports that were frozen empty (HR-02) or polluted (HR-31), once. | The classifier finds the exact entries. The adjustment is computed from them, not the estimates. A before-and-after reconciliation is shown to you **before** anything runs on your account, and an audit record is kept. The deduction is logged as one correction entry through `KOS.sessions.log` with a negative award, so invariant 1 still holds. The report rebuild is a one-off, recorded exception to invariant 102. |
| B2 | **Other clawbacks: going forward only.** HR-18's ticks come strictly from evidence, with no self-tick pay. MI-05 pays only on a pass. CR-20 needs an attached work. | RC21 receipts make every award idempotent. |
| B3 | **Unfinished sessions: both** durable per action and resumable. Re-confirmed 13 Nov (Q8): **resumable** — a flashcard, quiz or Japanese session left part-way picks up where it stopped, as one ledger entry per session upserted with delta pay against its receipt, so nothing is paid twice or lost. | §A6. |
| B4 | **Redraw policy: approved.** Hold on task pages, while typing or in a dialog; a quiet "Updated on another device · Refresh" pill; apply on leaving or finishing. | W2. |
| B5 | **Money:** spend by merchant, by category and by week; subscriptions and recurring; budget pace; balance reconciliation; the Student Finance runway if it comes out clean. A built-in UK merchant table plus learned payee→category rules. **PDF import dropped.** | W4. D-Money is drafted after W1. |
| B6 | **Shop:** **retire and refund** the 10 near-Graphite themes; **keep and fix** the light themes (Washi Morning, and Atelier Dawn's tokens). **Build the seals' surface:** the Seat ring, the share card, and beside the brand mark. Study set gets distinct role colours. The 16 legacy cosmetics point at their repainted art, and the CSS gradient frames are retired. **Pen sets apply to new strokes only.** Try on covers every kind. | See the conflict note below on how pen sets store their colour. |
| B7 | **Forks:** M7.3 is **reset** to the shipped notes, with the old fork text saved to a backup key first. CS 4.1.1.6 and 4.1.1.8 are **merged**: the shipped deck, plus your added cards appended. The stale-fork hash banner is built. | Each card keeps its schedule (invariant 87). |
| B8 | **First run:** drop the seeded sample events. Add the one-screen welcome. Hold Pacing carry-over notices until it's answered. | W7/W9. A D-First run prompt only if needed. |
| B9 | **Build:** CR-26 (Minutes), AA-19 (pause read tools on Ask first), MI-08 (flush the offline queue on reconnect). **Remove:** CO-18 (Practice focus) and AA-18 (the crud route and its status). | |
| B10 | **Rules:** PR-23 refuses an all-optional routine ("At least one step must be required"). PR-35 records "kept late", which still pays and holds the streak. PR-32 counts completed sessions or banked 10-minute blocks by the 04:00 routine day. AG-07 shows "Earned 21 / 254 · 8 complete". AG-24 drops "the". SH-02: no bare Backspace; Alt+←/→ and ⌘[ / ⌘] only. | |
| B11 | **Shared browser: not a case.** GEM-001 is closed as not needed. Clearing `ext` links on account switch (DI-08) stays as hygiene. | |
| B12 | **Repository:** `git rm --cached` the personal export, `.claude/` and the root clutter, and add them to `.gitignore`. **No history rewrite** until every branch is merged. | Done in W0. History keeps every file, the local copies stay on disk, and `.claude/` holds only `launch.json` and `settings.local.json` (local preview and permission config), both kept locally. |
| B13 | **Todoist:** the captured findings cover everything you experienced. | |
| B14 | **The three deleted files (LA-30): ignore.** | |
| B15 | **Goal getter (13 Nov): take back** the tiers earned by Collection goals the whole vault met at once (GO-02). | An automatic repair after the first sync and a verified checkpoint; the one recorded exception to invariant 162. |
| B16 | **Topic colours (13 Nov): evidence first** (GO-23, UR-22). | Green needs recall and practice; some topics that read Green will read Amber until they have both. |

**Conflict to note (B6, pen sets).** "Store the resolved colour on the
stroke" would break invariant 133: a stroke's colour is a ROLE read live from
the theme, never a hex, so ink stays legible in every theme and in the
Dawn-on-white export. What I'll implement is the other form you allowed:
**store the pen-set id on each new stroke**, next to its role. Switching sets
never recolours past notes, and the colour is still resolved from the theme.
No other decision conflicts with an invariant as written. Two are recorded as
exceptions:
- B1's report rebuild (invariant 102);
- B1's deduction, which goes through the ledger, so invariant 1 holds.

---

## 2. The workstreams

The fix and acceptance check for every P0 and P1 are in each workstream's
table below (drafted from the findings, checked against the code). Every
other finding is in the appendix.

### W0 — Safety net (first; about 1 session)
Nothing risky lands before these exist.
- **A backup before any repair.** Before any one-off repair or migration
  (the DI-27 clean-up, moving pictures out of the state document), a full
  backup is taken automatically and checked against a test restore.
- **New gates in the smoke suite:**
  - content: no near-duplicate cards, answer positions spread out, mark
    schemes that add up, no duplicate ids;
  - cosmetics: buy, apply and render every shop item;
  - menus: every menu opened inside a dialog can be clicked
    (`elementFromPoint`);
  - CSS: no duplicate component class.
- **The harness itself.**
  - Replace the fixed sleeps in the five timing-flaky suites; smoke75 is the
    one that fails under load.
  - Run the gate in parallel, so 114 suites take minutes.
  - Add a Mind Journal replication smoke with an injectable cloud.
- **Device checks.** `responsive_audit` covers the three exact device sizes
  (§1.3) in one command.
- **New tests (§A7):**
  - DST and the 04:00 routine-day boundary, for routines, reviews, streaks
    and Reports' weeks;
  - the service-worker update prompt across two versions, with
    `skipWaiting` only after confirming;
  - offline fallbacks: a navigation served from cache, and sync failing
    soft.
- **Ratchet the new gates.** Content, cosmetics, menus and CSS gates fail
  only on **new** violations. Today's violations are recorded in a baseline
  file that shrinks as W3, W5, W6 and W9 fix them.
- **Read-only audit of `supabase/functions/`:** CORS, auth-header checks and
  error shapes against what the client assumes. Findings are recorded, not
  fixed.
- **The repository (B12).** Untrack the personal export, `.claude/`,
  `Context/`, the `fix_*.py` scripts and the old plan docs. Archive them
  under `docs/archive/` or `.gitignore` them. History keeps them, and local
  copies stay.

**W0 as built (8 Nov 2026, branch `feat/w0-safety-net` at `969371e`; gate 123/123, `qa/w0/gate-2026-11-08.txt`).**
- Backup: `js/core/backup.js` (`KOS.backup`: checkpoint, withCheckpoint,
  list, verify, download, restore), IndexedDB `kurenai-os-backups` scoped by
  the data namespace, the last 5 kept. "Verified" = read back, parsed, every
  part's count and SHA-256 matching, and a second live snapshot matching.
  The test RESTORE runs on test data (smoke123 C); on the real account the
  restore is not exercised (it would overwrite it), so before the DI-27
  clean-up the downloaded checkpoint is also restored into an isolated
  jsdom copy and compared (W1, B1).
- Gates: smoke116 content, 117 cosmetics, 118 menus in dialogs, 119 CSS
  collisions, each ratcheted against `tools/baselines/smoke11x-*.json`
  (CC-11 is held, not fixed: its 288 validate_content errors are in the
  smoke116 baseline and are fixed in W6).
- Harness: `npm test` = `tools/run_smoke.mjs` (parallel, timeouts, skips
  named, `--repeat`); AP-16's fixed sleeps replaced in smoke, 2, 4, 16, 17,
  45, 47, 54, 75, 76; smoke115 Mind Journal replication (DI-26);
  `.github/workflows/smoke.yml` (skips 75 and 76, which need the built C#
  runtime); `responsive_audit --devices`.
- §A7 tests: smoke120 DST and 04:00, smoke121 the SW update across two
  versions, smoke122 offline.
- Edge Functions audit: `qa/w0/edge-functions-audit.md` — no P0 or P1;
  EF-01…EF-08 (3 P2, 5 P3) recorded in §4's backlog, not scheduled.
- Repository (B12): commit `ae4dd7e`; backup of the untracked files in
  `audit-evidence/2026-11/qa/w0/repo-untracked-backup.tgz` (local).

### W1 — Data integrity and the economy (about 2–3 sessions)
**The P0s:**

| Id | What happens | Fix |
|---|---|---|
| **ST-25** | Deleting an assignment deletes every file linked to it, topic files included, and tombstones them in the cloud. | Use `KOS.files`' detach rule: remove the link, and delete only a file that nothing else links. |
| **SY-18** | An open study editor, held by the stopgap, writes its stale copy over cards pulled from your other device. | The editor merges each row against what is stored before saving (§A4). W2's change bus later replaces this properly. |
| **JM-06** | Switching Japanese's spine to Media locks you out of every Japanese lesson. | One guard in `jatopic.js`, plus a smoke. |
| **MG-01** | Money duplicates transactions on re-import. | Identity by FITID, or the tuple plus a within-statement occurrence ordinal, with a statement fingerprint and the source row kept (§A3). |
| **DI-27** | The phantom sync rewards. **Hotfixed.** | The clean-up as decided in §B1, with the reconciliation shown to you before it runs on your account. |

**Rewards with receipts (RC21).**
- Every award gets a stored receipt key, checked before it pays.
- That closes:
  - repeated streak-milestone gold (HR-16);
  - Daily goal re-ticks paying again (HR-18);
  - reminder and habit ticks with no Undo;
  - Mind's checkpoint paying with nothing right (MI-05);
  - Creatives projects paying on bare ticks (CR-20);
  - Japanese sessions paying on failed evidence.
- **One smoke ticks, unticks and re-ticks every rewarding control.**

**Two tabs and storage (RC5).** The design is §A4 (rev, lock, three-way merge, BroadcastChannel) and §A5 (storage ceiling, mirror, privacy). The points below are what it fixes.
- Another tab's write is merged instead of overwritten. This uses a
  `storage` event plus a Web Lock around save. It fixes DI-04/UR-4, the
  session you lost on 1 Nov.
- An unreadable state is quarantined, never overwritten.
- The avatar and banner pictures (440 KB of your 1.35 MB state document,
  LA-9) move to the file store.
- First sign-in ignores state that is only the shipped defaults (DI-03).

**One store registry (RC4).**
- Every IndexedDB owner registers export, import, clear and count.
- Backup, Restore, Reset everything, the Storage page and "What a backup
  covers" are all generated from it (DI-14, DI-21, AA-11, AA-26).
- Import backup asks before it replaces everything (AA-11).

**Google, Todoist and Google Tasks bookkeeping (RC6).**
- **Pull and push order.** Pull before taking the lease, push after.
- **Lease and partial results.** A per-tab lease, and apply each chunk's
  results as they come back.
- **uid for older reminders.** Give the reminders made before 5.15 a uid,
  so they stop being skipped (LA-1).
- **Todoist sections.** Keep a task's section, and stop sending it back to
  the Inbox (LA-24/UR-2: the section/move bounce).
- **Unlinked projects.** Never treat "moved to an unlinked project" as a
  delete (LA-25).
- **Re-key references.** The merge also re-keys goal, exam and session links
  to assignments.

**Side replicators.** Money, reviews, Mind, reports and ink each get a
2-minute overlap window on every pull. Their last success and last error
show on Account & Cloud Sync (DI-20).

**Every P0/P1 in W1: the fix, and how it's accepted**

| Id | Sev | Fix | Acceptance |
|---|---|---|---|
| DI-27 | P0 | Hotfixed (js/core/mediadb.js tryMal/tryAnilist module-scoped, merge refuses cross-module, smoke114); remaining: boot repair pruning bogus journal events and the user-decided ledger/badge clean-up. | smoke114: two cycles with a colliding MAL id pay once and leave the manga untouched; after the clean-up no phantom sync entries remain in the ledger. |
| JM-06 | P0 | js/modules/jatopic.js spine media branch returns a stageHead (and hub.js guards codeSpine.stageHead before calling). | Smoke: with ui.japanese.spine='media', opening a ja lesson renders without throwing and stays on the lesson. |
| MG-01 | P0 | js/core/money.js previewCSV/importRows: identity = date/minor/kind/normalised raw + within-statement occurrence ordinal (occ) per identical tuple, FITID or balance delta when present, plus a statement fingerprint; keep tx.raw source data on every row. | Smoke: import a CSV, re-import it with a different payee mapping → 0 new rows; importing the same statement as OFX matches by FITID. |
| ST-25 | P0 | js/core/assignments.js:220 removeAttachments: per file use the Files detach rule — removeLink({kind:'assignment',id}) when other links exist, delete only sole-link files, and list those in the confirm. | Smoke: a file linked to a topic and an assignment survives deleting the assignment with its topic link intact; a sole-link file is deleted. |
| SY-18 | P0 | Held background redraws emit an event with changed paths; js/modules/editor.js re-reads its fork when idle and saves per-row patches (KOS.edits.patchRow/addRow/removeRow) by row id instead of the whole array. | Smoke: editor open, remote fork adds a card, local keystroke saves → the remote row survives locally and after merge. |
| AA-11 | P1 | Backup import (store importFull caller): parse first, show a danger openDialog (Cancel focused) with the backup's date and counts vs this device, an 'Export this device first' option and the cloud overwrite note. | Smoke: picking a backup file opens the danger dialog and state is unchanged until confirmed; Cancel leaves it untouched. |
| DI-01 | P1 | js/core/exttasks.js: pull cloud before taking the lease and push right after; record pending adds {uid→temp} in state.ext, dedupe imports by link/pending uid, and a boot/merge pass folding reminders linked to the same ext.id. | Smoke: two simulated devices, device B syncs before A's state arrives → one reminder linked to the Todoist task. |
| DI-02 | P1 | js/core/exttasks.js Todoist push: apply each chunk's sync_status results as it returns, keep parent+subtask adds in one chunk, persist the temp-id map before the next request; treat mapped ids as linked on pull. | Smoke: second batch fails → first batch's tasks are linked and the next sync imports no duplicates. |
| DI-03 | P1 | js/core/cloudsync.js stateMeaningful: compare against a pristine DEFAULTS snapshot (ignoring seeders) or every RECORDS array/keyed map; first link always no-base three-way merge; snapshot local state to the media kv before any replaceState. | Smoke: a device with only reminders/assignments/routines signs in to a non-empty account → all its records survive the first link. |
| DI-04 | P1 | js/core/store.js save(): monotonic rev in localStorage, write inside navigator.locks('kos-state-write'), three-way merge (cloudmerge, base = last read/written) before writing when rev moved, BroadcastChannel('kos-state') patching other tabs; pwa.js reloads all tabs on update. | Smoke (two jsdom windows sharing storage): tab A adds a reminder, tab B adds an event and saves → stored state holds both and rev increased monotonically. |
| GO-25 | P1 | js/modules/goals.js title picker: always include the current linked title selected, and replace the 60-row capped select with a search picker over the whole vault. | Smoke: editing a goal linked to title #200 keeps that link on Save and any title can be found by search. |
| HR-16 | P1 | js/core/governor.js:329-337 milestones: key each milestone on the run's start date (lastActiveDay − (stk−1)) stored once, or pay only on the session that makes a run ending today reach exactly ms days. | Smoke: a 7-day streak, then boot on the next two days before studying and after → the 7-day milestone gold is paid exactly once. |
| HR-18 | P1 | js/modules/hub.js:1166 + js/modules/todo.js setChecked: directive ticks are derived strictly from evidence (cards due cleared, exam revision minutes, assignment progress); remove the hand tick and any pay for it. | Smoke: clicking/toggling a directive logs no session and pays no XP/gold; clearing the due cards marks it sealed on next render. |
| MG-23 | P1 | js/core/money.js:1030-1031: remove within-file folding; compare against STORED rows only using the occ ordinal per date/minor/kind/raw tuple (plus FITID/balance delta), flagging only the surplus. | Smoke: a statement with two identical same-day payments imports both; re-importing it flags both as duplicates. |
| PR-03 | P1 | js/modules/routineplayer.js:279 taskOf: honour ctx.explicit from focus.js (return General study, no fallback), offer the suggestion as 'Use: <task>'; 'Just start' starts the Focus page's config exactly; fix the menu z-index. | Smoke: Focus with 'General study — no link' → Just start → session has no assignmentId. |
| ST-26 | P1 | js/modules/itdesk.js mark input: distinguish empty (clear, ask/Undo) from invalid (keep editing, focus, say 'Enter 0–60'); never write on invalid. | Smoke: type 459 over a saved 45 + Enter → stored raw stays 45 and an error message shows. |

**W1 progress (9 Nov 2026, branch `feat/w1-integrity`).**
- The automatic backup: `KOS.repairs` (`js/core/repairs.js`) runs every
  one-off repair as dry run → preview with a hash → (consent repairs) the
  approved hash only → a VERIFIED checkpoint → apply → re-plan to settled →
  a synced receipt and a local audit record. Import backup now reads the
  file, asks (danger dialog, Cancel focused, its date and counts) and takes
  a verified checkpoint before replacing anything (AA-11, DI-22). smoke124.
- P0s fixed with tests that fail on the old code (smoke125): JM-06, ST-25,
  MG-01 with MG-23 (the §A3 identity; no OFX importer exists, so FITID is
  read from a CSV id column), SY-18 (editor saves merge by row id against
  what the editor loaded).
- DI-27: the ledger clean-up is built as the consent repair
  `di27-phantom-sync` (smoke126 on test data). It has NOT run on the real
  account: the reconciliation is shown first.
- **B1's journal scrub: decided 9 Nov — fix the readers, and scrub on
  every device.** `KOS.mediadb.activeEvent` is the one definition of
  activity (HR-31); Reports read it; `activityAt` drives "Recently
  updated" (CL-45); `di27-journal-scrub` tidies each device's copy at
  start-up before cloud sync, only after the clean-up was approved, and
  again if a device on the old journal sends the traces back. smoke127.
- **Adversarial review (3 agents, 9 Nov):** one P0 (the classifier matched
  titles only, so a genuine Death Note ANIME reward would have been taken
  back), two P1s (a double deduction on a second device; Money's import
  key truncated past 400 characters, and a bank id trusted alone), and
  P2/P3s — all fixed with tests except one, recorded: the saved
  checkpoints have no restore button in the app yet (to be built with the
  Backup page and the store registry in W1).
- Gate 127/127 (`qa/w1/gate-w1-2026-11-09b.txt`), commit `83a144c`.
- **Released 9 Nov (sw `kos-integrity-3`, `6751a7f`):** HR-16 (milestone
  gold once per run, smoke128), ST-26 (an invalid IT mark writes nothing,
  smoke58), PR-03 (no link stays unlinked; Just start starts the page's
  choice, smoke104 — the menu's layering is left to W3's menus-in-dialogs
  work). Gate 127/128: smoke17 flakes under heavy parallel load (it passes
  alone; at the pre-W1 commit it flakes more) — AP-16 remainder, backlog.
- **The saved-reports rebuild (B1; HR-02, HR-31), built 9 Nov (`9dfed9d`,
  not yet deployed or run):** a consent repair, surgical and exact (see
  `js/core/repair-reports.js`). A 3-agent review of the first version found
  2 P0s (a second correction of items saved after the clean-up; replacing a
  whole Collection section would erase real titles whose rows left the
  vault) and P1/P2s (rest streak, levels of rebuilt-empty weeks, the next
  report's comparison, an old-version device pushing old copies back, the
  reports store missing from the full backup, checkpoint rotation) — all
  fixed and tested (smoke129). **RAN on the live account on 9 Nov after
  approval (6 snapshots, 9 reports; record `qa/w1/reports-rebuild-preview-2026-11-09.md`). B1 is complete.**
  Left as saved, by design: terms and years,
  and words Kurenai wrote. Every other device must run the new version
  before it runs.
- **Rewards with receipts (RC21), RELEASED 9 Nov (sw `kos-integrity-5`,
  `6c04c6e`; checked on staging first):** ST-20, HR-18 (the Daily goal seals from evidence and pays
  nothing; no hand tick), HR-21 and PR-27 (Undo on Home's reminder and habit
  ticks and on repeating reminders, through one correction that also takes
  back the HP), PR-24 (a min day topped up once), PR-23 (an all-optional
  routine refused), MI-05 (the checkpoint pays on its first pass and keeps
  the best attempt), CR-20 and CR-31 (a project pays only with work
  attached, one set of pieces pays one project), JM-13 (a lesson pays only
  on a pass, its misses kept across sittings), and the review-session pay
  (only correct or accepted). Three agents built it in separate worktrees;
  a 3-agent review found 2 P1s (Creatives pieces reused across projects; a
  Japanese lesson passing around earlier misses), 3 P2s and 8 P3s — all
  fixed with failing-first tests (smoke130–132). Past pay is not clawed
  back (decision B2: going forward only). Found on staging and fixed in
  the same release: a second Check on a Japanese question recorded, scheduled
  and paid it again (40 presses made 40 reviews) — smoke132 I.
- **New backlog item (found 9 Nov, not scheduled):** a Collection status
  changed back and forth (quick-edit, the editor) logs a paid media session
  each time (4 XP, 1 gold), with no receipt. No audit finding covers it.
- **Two tabs and storage (RC5), BUILT 9–14 Nov, NOT deployed
  (`feat/w1-integrity` at `74800f7`; gate 135/135):** DI-04 (rev, Web Lock
  and three-way merge on save; one change once across tabs through
  `KOS.store.transact`; a Focus session owned by one tab; an unreadable
  document set aside; the IndexedDB mirror, the primary when localStorage
  is full), DI-10/LA-9 (the avatar and banner into the file store by an
  automatic repair that waits for the first good sync), DI-18 (every
  database name carries the namespace suffix), DI-25 (mined Japanese lines
  on the device; an older device's map handed back unchanged), DI-03
  (first sign-in: one definition of the user's data, a verified checkpoint
  before combining, a pinned copy of the device from before the link, the
  no-base merge leaving out untouched seeds), DI-19 with part of DI-02
  (the lease per tab, renewed and given back at pagehide; Todoist's
  bookkeeping applied per chunk), GO-25 (the linked title). A cloud
  document now lands in one store transaction, one tab syncing at a time.
  A 3-agent review on 9 Nov found 26 problems (1 P0, 7 P1, 9 P2, 9 P3):
  all fixed with failing-first tests (smoke133 K–Q, smoke134 I–N, smoke135
  H–T). The re-review was done inline (reviewer agents exhausted the usage
  limit twice and produced nothing) and found four small things, fixed.
  smoke45's 1-in-6 failure was a race in the test with the Badge Wall's
  boot toast, fixed in the test. Record: `docs/HANDOFF-W1-RC5.md` on the
  branch, with what is known and accepted, and what the picture move does
  to the live account. **Not yet checked in a real browser; staging first.**
- **The store registry (RC4), BUILT 13 Nov (`feat/w1-integrity` 14bd215,
  NOT deployed; gate 135/135):** `KOS.stores`, one row per database;
  "What a backup covers" and "Not in the file" drawn from it (DI-14,
  AA-26); Reset everything clears every store after a verified checkpoint
  and drops the cloud base, which before could make a signed-in device
  push its emptiness as deletions (DI-21); the checkpoints listed with
  Download and Restore (the gap the 9 Nov review recorded). smoke134 U–W.
- Still to do in W1: the rest of Todoist/Google
  bookkeeping (RC6: pull before the lease, uid for older reminders,
  sections, unlinked projects, re-keyed references), side replicators
  (DI-20), the remaining P1s.

**W7 progress (13 Nov 2026, `feat/w1-integrity` 016c0ba, NOT deployed; gate
136/136, smoke136 new):** FIXED JM-07, MI-01, CR-25 (lesson checks reach
Completed through reviews, the checkpoint's concepts and card ratings, with a
boot repair), ST-03 (Quiz best a percent of a full run), HR-17 (every subject
named in report words), HR-05 (Study hours = Focus time, one definition),
GO-06, GO-07 (routine/habit picker over Routines' records), HR-01 (Home's
desks by recency), HR-02 (backfill waits for the first sync; an empty week
rebuilt once). HR-31 and CL-45 were done in W1. Then (a9945f7, decided by you on
13 Nov: "take them back") **GO-02 FIXED**: Collection goals measure their own
period from the media journal, and the automatic repair
`goal-getter-whole-vault` voids the receipts the old rule produced and lowers
Goal getter (the one recorded exception to invariant 162); **GO-23 FIXED**
(UR-22): topic colours are evidence-weighted — a 0% quiz is Red, Green needs
recall from three rated cards AND a quiz or paper at 70+, else Amber "not
enough evidence". LEFT: **HR-04** (Home's "what next" for the study spaces:
a design).

### W2 — Redraw policy, view lifecycle and boot (about 2–3 sessions; replaces the stopgap)
- **The change bus.**
  - A background change carries the keys it changed, and a view declares
    what it reads. A view is redrawn only when what it reads changed, and
    only at a safe point. While you're mid-task it shows
    **"Updated on another device · Refresh"** (your decision, Q4).
  - This ends the stopgap's stale held pages, the root of SY-18.
- **A per-view session store.** The note page, flashcard, quiz and exam runs,
  Japanese runs, Code drafts, vault scroll and batch, the tab strip's position
  and Edit-your-seat drafts all survive a redraw (SY-02…04, SY-19, SY-20,
  ST-12).
- **A view lifecycle.**
  - `view.dispose()` and an AbortController per render, so async work
    started for a page you've left stops (RC15).
  - Navigating closes open dialogs, with an unsaved-changes guard.
  - Focus is restored on a redraw (invariant 65).
- **Moved in (§A2).**
  - **SH-20:** Enter on a focused Cancel never confirms.
  - **SH-21:** "Skip to content" focuses `#main` without routing.
  - **AA-01:** the Assistant's undoable actions offer Undo.
  - **AP-01, boot weight:** curriculum content loads lazily per subject,
    and scripts load deferred where safe. It lands early in W2, so device
    testing from W3 on runs on a fast cold start.
- **Sessions in progress (§A6, per action).** Replaces the leave/pagehide
  design below. A flashcard batch, a Japanese session or a kana
  set is logged when the page is left or the app is put away, not only at
  its end (ST-04, JM-08). Pro-rata or resumable is your decision, Q8.
- **iPhone Focus with the screen off (UR-5).**
  - Bank the clock when the page is hidden.
  - A screen lock is not a distraction.
  - After iOS discards the page, offer "Count the N minutes the screen was
    off?" instead of dropping them.
- **Review on two devices (UR-3).**
  - Auto-open waits for the first pull.
  - A review finished elsewhere closes the open sheet.
  - A finished review is never downgraded to skipped.

**Every P0/P1 in W2: the fix, and how it's accepted**

| Id | Sev | Fix | Acceptance |
|---|---|---|---|
| AA-01 | P1 | js/modules/assistant.js: render Undo on each verified-action card (and a toast) wired to undo.run, marking the card and audit row 'Undone'. | Smoke: an undoable tool call shows Undo; clicking it reverts the record and labels the card Undone. |
| AA-02 | P1 | js/modules/assistant.js: scroll to end after first mount (rAF) and on send/approval cards; 'only if at bottom' for streamed additions with a 'New message ↓' pill. | Smoke: reopening a long chat leaves scrollTop at the bottom and a new approval card is in view. |
| AP-01 | P1 | index.html + js/core/content.js: content manifest key→file with lazy script injection on first topic/desk/search open; exam-index.js, code-projects-files.js and ja/mind/creatives content loaded on demand; performance marks in js/main.js. | Smoke: boot script payload < ~4 MB and kos-interactive mark recorded; opening a lesson lazy-loads its content and renders it. |
| CR-01 | P1 | js/modules/creatives.js:561 logPage: open the deep-linked dialog only on navigation (not KOS.ui.redrawing) and replace the route with #/creatives/log on close. | Smoke: open #/creatives/log/<id>, act in the dialog, KOS.rerender() → exactly one dialog and the hash is #/creatives/log after close. |
| JM-08 | P1 | js/modules/jarun.js: upsert one ledger entry per sessionId on each rating with delta pay against the receipt; queue resumable from state.ui, so navigation/pagehide loses nothing. | Smoke: answer 4 items then KOS.show('home') → one ja session entry with 4 passes paid; re-entering resumes the queue. |
| SH-02 | P1 | js/main.js:24 history shortcut: drop bare Backspace entirely; keep Alt+←/→ and ⌘[ / ⌘], and return early when e.defaultPrevented or a dialog is open. | Smoke: dispatch Backspace on a focused Money row → 'Delete this entry?' opens and location.hash is unchanged; Alt+← still goes back. |
| SH-20 | P1 | js/core/ui.js:288 confirm onKey: only treat Enter as yes when e.target is not inside button,a,[role=button] (or drop the document listener and rely on the focused confirm button). | Smoke: open a non-danger KOS.ui.confirm, focus Cancel, dispatch Enter → resolves false; Enter on the confirm button → true. |
| SH-21 | P1 | index.html skip link + js/core/router.js: give the skip link a click handler that preventDefault()s and focuses #main, and make router.parse ignore hashes not starting with '#/'. | Smoke: on #/money click 'Skip to content' → hash stays #/money and document.activeElement is #main. |
| ST-04 | P1 | js/engines/flashcards.js: upsert ONE ledger entry per sessionId on each rating with delta pay against a stored receipt, queue resumable from state.ui; 'Reviewed today' reads KOS.reviewLog. | Smoke: rate 5 cards then navigate away → one session entry with 5 reviews and pay for 5; resume and rate 3 more → same entry, delta pay only, streak credited. |
| SY-02 | P1 | js/modules/hub.js notes reader: keep the page in a module memo keyed by sid:ref (or state.ui.notePage) and read it on remount/redraw. | Smoke: on notes page 4, KOS.rerender() → still page 4. |
| SY-03 | P1 | Redraw policy holds the review view; flashcards.js keeps the session in state.ui.fcSession[deckKey] and resumes on remount, and upserts one ledger entry per sessionId per rating with delta pay against the receipt. | Smoke: rate 3 cards, KOS.rerender() → resumes at card 4 and the ledger entry already holds 3 reviews paid once. |
| SY-04 | P1 | js/engines/quiz.js/exam engine: persist position, picks and drafts in state.ui.quizRun[sid:ref] and restore on remount; held by the redraw policy while mounted and touched. | Smoke: answer 2 quiz items and type an exam draft, KOS.rerender() → position and draft restored. |
| SY-05 | P1 | Systemic redraw policy in js/core/ui.js + cloudsync.js: pass changed keys to KOS.rerender({background,changed}), views declare reads, hold background redraws on task pages/when busy and show 'Updated on another device · Refresh', applying on leave/finish. | Smoke: a pull changing only state.money while on a topic page does not remount; a change to a read key on a task page shows the Refresh chip and applies on navigation. |
| SY-06 | P1 | js/modules/dayreview.js close: repaint only the chip (and Home cards when Home is on screen) via the policy's refresh, never a full remount; auto-open on visibility only on Home/no active engine. | Smoke: open a lesson, close the review sheet → #main not remounted; visibility change on a lesson does not auto-open the review. |
| SY-08 | P1 | Redraw policy defers background redraws while activeElement is editable in #main; fallback generalises mobile-shell.js calendarFocusSignature to restore focus/selection after a redraw. | Smoke: focus a textarea with caret mid-text, trigger a background redraw → focus and selection unchanged; device check iPad 820x1180 keyboard stays open. |
| SY-19 | P1 | Add vault views (anime, books, vn, game, mangaka, seasonal, wishlist, shrine) to the held set and keep the loaded batch count in a per-visit memo so a redraw renders up to it before restoring scroll. | Smoke: scroll a vault past batch 3, background redraw → scrollTop restored within 10px and ≥180 cards rendered. |
| SY-20 | P1 | js/modules/governor-ui.js Edit your seat: hold background redraws while dirty (task page) and keep the draft in a per-visit store keyed by route; add the leave-with-changes prompt. | Smoke: change the seat background without saving, background redraw → draft kept; navigating away prompts. |

### W3 — Layering, layout tiers and touch (about 3 sessions; the biggest by count)
- **Menus above dialogs (RC2).**
  - A menu opened inside a dialog mounts in that dialog's top layer.
  - The painted page header no longer clips the Governor menu.
  - This fixes:
    - the Afternoon review's "Place in a free block" (PR-01);
    - About to Study's Change;
    - the pen toolbar's colours in Files (UR-24);
    - the Governor ⋯ menu (SH-03, AG-01).
- **Test widths (§A10).** Every change is tested at 1470, 1180, 1080, 820,
  700 and 402 (and 402×760), including Split View and Slide Over. The CSS
  stays on invariant 47's five breakpoints.
- **The 1240–700 tier (RC3).** Every master-detail and side column is
  checked at 1080, 860, 700 and 560 on your three devices.
  - A detail panel becomes a sheet under 1240 or 860.
  - The topic inspector overlays between 700 and 1080.
  - Phone reachability for every section:
    - Money's Transactions and Import;
    - Goals' tabs;
    - Creatives settings;
    - space page actions (MG-09, CR-02).
- **Touch and iOS (RC17).**
  - The 44 px touch floor and the 16 px input rule move to the last CSS
    layer, so page classes can't undo them. This fixes iOS zooming on nearly
    every field (AX-01).
  - Round controls become circles, never ovals: a fixed glyph inside a
    44×44 box (UR-17, CR-07, AG-06, JM-25, AA-14).
  - Contrast inks per role, and focus rings.
- **Dead space, alignment and centring.** One pass over the 15-finding
  cluster:
  - the study-space desks share one side-column rule and one hero height
    (ST-08);
  - Kurenai is centred, with no empty band above her (UR-16);
  - the HP ring reads as a full ring (UR-15);
  - Side by side stops at the end of the notes (UR-8);
  - the toast is centred.
- **Agenda on Mac and iPad (PR-06).** Your request. It goes through a design
  prompt, below.

**Every P0/P1 in W3: the fix, and how it's accepted**

| Id | Sev | Fix | Acceptance |
|---|---|---|---|
| AG-01 | P1 | js/modules/governor-ui.js Seat ⋯: build with KOS.ui.menu (portalled) instead of an in-header popover; raise the ⋯ button to 44px on coarse pointers. | Smoke: open the Seat ⋯ menu and elementFromPoint hits the Data row's Mine/Empty/Sample; device check iPad 1180x820 and Mac 1470x832. |
| AG-02 | P1 | css/views/achievements.css/governor: set the medal size via data-size/--m with var() fallback (not an inline property) so ≤700 can override; slots flex:0 0 auto; .k-gv-arc-note:empty {display:none}. | Responsive audit at 402px: showcase medals don't intersect each other or the XP bar and empty slots are square ≥44px; device check iPhone 402x874. |
| AX-01 | P1 | css/components.css end (unlayered) or themes layer: @media (max-width:700px) inputs/select/textarea/[contenteditable] font-size:max(16px,1em) !important. | Smoke/responsive audit at 402px: no visible field computes font-size < 16px; device check iPhone 402x874 no zoom on focus. |
| CC-04 | P1 | Worked card (content.js render + css): put 'Write it out' in the head row as a flex item beside Copy (title flex:1, min-width:0), wrapping under 560px, 44px on coarse pointers. | Visual audit: the button rect doesn't intersect the title at 402 and 820; device check iPhone 402x874, iPad 820x1180. |
| CL-01 | P1 | css/components.css:80: give the pill group flex:none inside .k-subnav (or drop overflow-x:auto on .k-seg there) so the outer k-subnav-scroller with arrows scrolls. | Responsive audit at 820x1180: Games pill reachable via the subnav scroller arrows; device check iPad 820x1180. |
| CO-01 | P1 | css/views/code.css: .k-cx-sq/.k-cx-dia min-block-size:0 with the 44px hit area on a transparent ::before (or raise width with height). | Responsive audit with --touch: unit squares width=height and the diamond is a square rotated 45°; device check iPad 820x1180. |
| CO-02 | P1 | css/views/study.css:1169: at ≤700 set .k-cx-hero + .k-subj-side to a single column (as japanese.css:449); .k-fit-btn on the Open-lesson button. | Responsive audit at 402px: Daily 20 and Continue stacked full width and the button label stays inside its pill; device check iPhone 402x874. |
| CO-03 | P1 | css/views/code.css desk side: Continue card flex:0 0 auto, Daily 20 card clips/scrolls instead; concept chips one line or two + '+N'. | Responsive audit at 1470x832 and 1180x820 with a real Daily 20 task: Continue card height ≥ its content and 'CONTINUE' not clipped. |
| CR-02 | P1 | js/modules/creatives.js: mark the gear (and Start focus) with data-phone-action, or add Settings to the phone menu. | Smoke at 402px: the phone title bar exposes Settings that navigates to #/creatives/settings; device check iPhone 402x874. |
| EX-02 | P1 | css (exam room): .k-exr-body flex-shrink:0 so the room scrolls; on phone put the checklist under the ring. | Responsive audit at 402px: checklist rect does not intersect the rapid-recall list; device check iPhone 402x874. |
| EX-03 | P1 | js/core/inkui.js palette: in icons state hide the colour text, move Shape/Ruler into More when wider than innerWidth−40, and clamp place() to centre a wide palette. | Responsive audit at 402px: palette width ≤ viewport and Undo/Redo are on screen; device check iPhone 402x874. |
| EX-28 | P1 | css (exam paper view): .k-ex-tnav-b flex:none, 44×44 square on touch; scroller({reveal}) for the current square. | Responsive audit at 820 and 402: each navigator square width=height ≥ 32px (44 on touch); device check iPad 820x1180. |
| HR-03 | P1 | css/views/home.css (hub) 701–1080 tier: replace the display:none on the hero goal block with a full-width grid-column 1/-1 row under the greeting (as the phone tier does). | Responsive audit at 820x1180: the hero shows Daily goal, Today's three/Recovery and Start focus (non-zero boxes); device check iPad 820x1180. |
| JM-09 | P1 | css/views/study.css ≤700: .k-topic-tabrow wraps, tab scroller full width (min 50%), Working/Edit/Learn·Reference on a second line or in ⋯. | Responsive audit at 402px on a ja lesson: Notes/Practice/Reviews/Files tabs visible; device check iPhone 402x874. |
| MG-09 | P1 | js/modules/mobile-shell.js destinations(): when the page carries [data-phone-tabs] list those tabs as a second group in the sheet (Money and Goals). | Smoke at 402px: the phone sheet lists Transactions, Month, Import/Export and Goals' This week/This month/Done; device check iPhone 402x874. |
| MG-25 | P1 | js/modules/money.js Transactions: under 860px open the tapped entry in a k-msheet/openDialog with Edit and Delete. | Smoke at 402px: tapping a row opens a dialog containing Edit/Delete; device check iPhone 402x874, iPad 820x1180. |
| MI-02 | P1 | css/views/mind.css .k-mind-deskside: same grid/flex-basis auto treatment as Japanese/Creatives under 1080; on Mac min-block-size:min-content for the Daily card. | Responsive audit at 402, 820 and 1470: Daily 15 and Continue cards ≥ content height, Start button visible. |
| PR-01 | P1 | js/core/ui.js KOS.ui.menu place(): when the button is inside an open dialog, append the panel inside that overlay (or a --z-menu-modal token above --z-modal). | Smoke: open a menu inside openDialog and elementFromPoint at an item hits it; device check Mac 1470x832 'Place in a free block'. |
| PR-04 | P1 | css/views/productivity.css: .k-fx-ctx max-inline-size:100% (column min-inline-size:0), chip ellipsis with title attr; due via dayLabel; stronger scrim on phone. | Responsive audit at 1470 and 402 with a 120-char title: chip rect inside the viewport; device check iPhone 402x874. |
| SH-01 | P1 | css/components.css toast rule: replace left:50%+translateX with inset-inline:0; margin-inline:auto; inline-size:fit-content; max-inline-size:min(var(--toast-max), calc(100% - var(--sp-32))); translate on Y only; radius r-16 when wrapped. | Smoke: a 60-word toast at 402px computes width > 0.8×viewport and height < 3 lines; device check iPhone 402x874 and iPad 820x1180 toast is one centred rounded block. |
| SH-03 | P1 | js/modules/governor-ui.js: replace the hand-made <details> ⋯ menu with KOS.ui.menu (portalled to body, js/core/ui.js ~813); audit other inline popovers inside painted (34e) page headers. | Smoke: open the Governor ⋯ menu and elementFromPoint at every item's centre returns that item; device check Mac 1470x832 and iPad 1180x820 all rows visible. |
| SH-04 | P1 | css/layout.css ≤700 block: reset '#cols:not([data-rail="full"]) .k-rail-label/.k-rail-count' (position static, auto size, clip auto) or scope the 1080-tier hide rule to min-width:701px. | Smoke/responsive audit at 402px: every bottom-tab label is visible with width > 20px; device check iPhone 402x874 shows Home/Study/Productivity/Collection/More. |
| ST-01 | P1 | css/views (IT desk): add an 860 tier — .k-it-agg one/two columns stacked, .k-it-tr uses the ≤700 grid-template-areas layout, ruler numbers min width or below the bar. | Responsive audit at 820x1180: the boundary chart is ≥200px wide with no overlapping labels and unit names are not truncated; device check iPad 820x1180. |
| ST-02 | P1 | css/views/study.css ≤700: .k-topic-tabrow flex-wrap:wrap with the tab scroller at flex-basis 100% (Working/Edit on the next line or in ⋯). | Responsive audit at 402px: the topic tab scroller width ≥ 90% of the row and the selected tab is visible; device check iPhone 402x874. |
| ST-05 | P1 | css/views (assignments) detail panel: align-self:start, max-block-size:calc(100dvh - header) with overflow-y:auto, no min-block-size:100% so the footer sits at the panel's bottom. | Responsive audit at 1470x832: 'Focus on this' and Complete/Submitted/Blocked are inside the viewport when an assignment is selected. |
| ST-06 | P1 | js/modules/assignments.js: below 1240 open the detail in a KOS.ui.openDialog sheet (bottom sheet ≤700, side sheet on iPad), focus its heading. | Smoke: at 820px clicking an assignment opens a dialog containing its detail; device check iPad 820x1180/1180x820 and iPhone 402x874. |

**W3 progress (13 Nov 2026, `feat/w1-integrity` 8ba235f, NOT deployed; gate
137/137, smoke137 new):** the GLOBAL fixes only (the per-page tail is left
for Opus later, page by page). RC2: KOS.ui.menu inside a dialog was already
on top (fc55d492, PR-01/UR-24); now the painted page header stacks above the
page body, so the Seat's ⋯ is no longer under the Stage (SH-03, AG-01).
RC17: a last cascade layer `floors` holds the 16px phone field rule (AX-01;
measured 16px everywhere at 375px). The 44px touch minimum was NOT moved
there — it would override the dense size invariant 69 keeps for tiny marks.
Round controls stay circles on touch: AA-14, CR-07, AG-06, JM-25. LEFT in
W3: the 1240–700 tier (RC3), contrast inks and focus rings, the dead-space
cluster, the Agenda (a design), and the page-by-page P2/P3s.

### W4 — Money revamp (about 1–2 sessions; one design prompt)
- **Import.**
  - Santander's real exports (§1.6): midata CSV with preamble and delimiter
    detection, Online Banking CSV/TXT, QIF, OFX, and a PDF statement's text
    if pdf.js reads it reliably.
  - The thousands separator (MG-06).
  - Identical same-day payments are kept (MG-23).
  - The app's own export round-trips (MG-24).
- **Import batches.** See, undo or replace any import later (MG-05).
- **Information.**
  - Merchant clean-up and categorising rules.
  - Recurring detection, and a recurring confirm that never double-counts a
    bank row (MG-07).
  - Keep the Type and Balance columns.
  - What the views show is your decision, Q1: design prompt **D-Money**.
- **Layout.** Selecting a transaction on iPhone or iPad portrait opens it
  (MG-25). Phone reachability is in W3.

**Every P0/P1 in W4: the fix, and how it's accepted**

| Id | Sev | Fix | Acceptance |
|---|---|---|---|
| MG-02 | P1 | js/core/money.js:978 guessMapping: add Merchant/Description, Debit/Credit, 'Amount (£)', 'Money in/out (£)' patterns; never hard-fail — open the Columns step with unmatched columns. | Smoke: a Santander midata fixture maps date/amount/payee automatically; an unknown header opens the mapper instead of an error. |
| MG-03 | P1 | js/core/money.js:947 parseCSV: sniff the delimiter over ~10 non-empty lines, find the header row in the first 20 rows by date+amount patterns, report 'Skipped: n header lines', drop trailing empty columns. | Smoke: fixtures with a leading blank line, ';' delimiter, and an account preamble all parse with the right header. |
| MG-04 | P1 | js/core/money.js: format sniffing with OFX/QFX (STMTTRN, FITID, LEDGERBAL), QIF and Santander .txt parsers feeding the same preview; Columns step names the format. | Smoke: OFX, QIF and Santander .txt fixtures each produce the expected rows and amounts. |
| MG-05 | P1 | Store {batch,fileName,from,to,n,at} in state.money.imports (normalise gate); Transactions › Imports list in js/modules/money.js with Undo/Delete/Replace and a Source filter. | Smoke: after an import the Imports list shows it; Undo removes exactly its rows and the record. |
| MG-06 | P1 | js/core/money.js preview: flag rows whose cell count differs from the header and re-join a split £n,nnn.nn amount for the Santander layout; show the Balance column. | Smoke: a row with unquoted '£1,234.56' imports as 123456 minor, and a malformed row is reported with its cell count. |
| MG-07 | P1 | js/core/money.js import: match rows to due rule occurrences (same amount, ±3 days, payee alias) and mark the occurrence confirmed pointing at the imported tx; Confirm offers a matching bank entry. | Smoke: a rule due 27 Oct + importing the bank row → one transaction total and the occurrence marked done. |
| MG-08 | P1 | js/core/money.js: keep raw text, derive a clean merchant (strip card/apple pay/date/FX noise), learned payee rules {match→merchant,category}, UK merchant table, Type DD/SO → suggest a rule, Balance → reconcile line. | Smoke: 'CARD PAYMENT TO HERON FOODS,3.50 GBP, ON 27-10-2026' → merchant 'Heron Foods' and a learned rule categorises the next one. |
| MG-10 | P1 | Import dialog: own wide token (~1080px, full sheet on iPad), Columns above Preview below ~900px, sticky footer with Import. | Responsive audit at 1470x832 and 820x1180: payee and amount columns visible and Import button inside the viewport. |
| MG-24 | P1 | js/core/money.js guessMapping/import: recognise the app's own export header exactly and import losslessly (Type→kind, Category→cat by name, Pot, Tags); offer a Type/Direction mapping (DEB/DD/SO/FPO out, FPI/BGC/CR in). | Smoke: export then re-import into an empty store round-trips kind, category, pot and tags identically. |

### W5 — Cosmetics, shop and art (about 1–2 sessions; decisions first)
- **Asset URLs.** Shelf skins and Shrine cards currently 404 because their
  URLs resolve relative to the CSS file (SC-05). Point the 16 legacy rows at
  their repainted art.
- **Avatars in frames.** Each painted frame stores its measured opening and
  centre, the avatar is sized and centred by it, and each host reserves the
  frame's bleed (SC-01, 03, 06, 07, 08).
- **Try on, and one record for what's worn.** Try on covers every kind; "Use"
  writes the picture drawer's rule; the worn item never leaks into other
  previews (SC-33).
- **Your decisions:**
  - the theme cull (Q3, SC-22);
  - the seals, which have no surface (Q2, SC-04);
  - the pen set "Study set" (SC-09);
  - the four CSS frames (SC-28);
  - pen sets on new strokes only, or remapping every stroke live (SC-34).
- **Buying.** Cancel-first confirm or a timed Undo (SC-20, which also needs a
  Gemini asset).

**Every P0/P1 in W5: the fix, and how it's accepted**

| Id | Sev | Fix | Acceptance |
|---|---|---|---|
| PR-02 | P1 | js/core/ui.js KOS.show: set KOS.ui.currentView = viewId BEFORE calling the view and have pageHeader read it. | Smoke: navigate A→B and B's page header band id is B's. |
| SC-01 | P1 | js/modules/governor-ui.js shop avatar preview: give the img its own class (k-gv-apv-disc-img) inset in a position:relative disc with object-fit:contain; check baked-disc art (koi, lamp). | Visual audit: each shop avatar card's img rect is inside its disc rect; device check Mac 1470x832 and iPhone 402x874. |
| SC-02 | P1 | css (governor/shop): raise the buy rule's specificity (.k-gv-stage .k-gv-buy) or wrap the stage glass-button rule in :where() so gold buy keeps its gold fill. | Smoke: on Try on, the Buy button's computed text/background contrast ≥ 4.5:1. |
| SC-03 | P1 | Store each painted frame's hole ratio in the catalogue and reserve --frame-bleed padding on the Seat face column; scale the frame so its hole meets the HP ring instead of a fixed 152%. | Visual audit: worn painted frame rect does not overlap the Level/title chip rects and stays inside the stage; device check Mac 1470x832, iPad 820x1180. |
| SC-04 | P1 | Decide the seal's place: draw the worn seal's stamp art in the topbar brand slot (bloom kept for 紅), on the Seat ring and Share card; update applyCosmetics in governor.js and the Wardrobe caption. | Smoke: wearing a seal sets the topbar mark's img src to that seal's stamp art; the Wardrobe caption names where it shows. |
| SC-05 | P1 | Where --skin-art is set (shelf skins / Shrine card styles), build an absolute URL via new URL('assets/app/img/'+art+'.webp', location.href) as dayreview.js:142 does. | Smoke: every shelf skin/card style's --skin-art resolves to an existing file under assets/app/img (no /css/views/ path). |
| SC-06 | P1 | Shop frame preview: size the preview avatar as a fraction of the frame box using the catalogue's measured hole ratio (same rule as worn) instead of fixed 64/120px. | Visual audit: preview avatar diameter / frame box ≈ the frame's hole ratio ±5%; device check Mac 1470x832. |
| SC-07 | P1 | avatarNode in governor-ui.js: add an option {frame:id/null} (or strip .k-avatar-frame-art like frameChip) so shop and banner previews never inherit the worn frame. | Smoke: with a painted frame worn, every CSS frame card preview has data-frame = its own id and no .k-avatar-frame-art child. |
| SC-08 | P1 | Reserve frame bleed (or hole-ratio sizing) in every large framed-avatar host: Home hero ring (hub.js/css), Avatar stage and phone stage. | Visual audit: Home hero's framed avatar rect doesn't overlap the greeting and is within the hero; device check Mac 1470x832, iPhone 402x874. |
| SC-20 | P1 | Re-key avatar art to an inscribed ~88% circle on one ground (ask the user for art via the manifest); meanwhile pad the img to ~78% and add per-item focal/scale in the catalogue for cat/lantern. | Visual audit: each worn avatar's opaque content bbox lies within the clip circle; device check Mac 1470x832 Seat and Home. |
| SC-21 | P1 | Catalogue stores each frame's hole ratio and centre offset; worn art sized avatarOuter/hole (~133%) positioned by hole centre, covering the HP ring. | Visual audit: gap between avatar edge and frame hole ≤ 2px for every frame; device check Mac 1470x832. |

### W6 — Content quality and exam marking (about 2 sessions)
- **EX-01 (moved in).** `+ Question` in Marks by question can set its Max
  and Topic.
- **Specification text.** Fix the parsers (`gen_data.py` and `parse_it.py`)
  and regenerate:
  - garbled PDF text on the Maths and IT Spec tabs (CM-01, CC-01);
  - IT's duplicate leaf F206.6.1 (CC-02);
  - add a ref-uniqueness assertion.
- **Quiz options.**
  - First make dependent items self-contained (CM-25).
  - Then shuffle options at render with a stable seed. Today answers sit at
    A or B 94% of the time (CM-02, CC-03).
  - Add the W0 gates so this can't come back.
- **Exam self-marking.**
  - Weight each step by its M/A/B codes (CM-14, CC-14, CC-17).
  - The model answer is not a mark.
  - An A cannot be ticked without its M (invariant 135).
- **Stale forks.** Each fork stores the shipped version's hash and warns you
  when the shipped material changes. Your three forks (M7.3 notes, CS 4.1.1.6
  and 4.1.1.8 cards; LA-23) need your decision, Q5.
- **De-duplicate cards.** Remove bank files that duplicate base cards, and
  CS decks that ask the same definition twice, keeping each schedule
  (invariant 87).
- **Thin content and its tests.** Fill the thin Maths leaves, add the
  Write-it-out pill layout (CC-04), and check that the C# in CS notes
  compiles in the content tests.

**Every P0/P1 in W6: the fix, and how it's accepted**

| Id | Sev | Fix | Acceptance |
|---|---|---|---|
| CC-01 | P1 | tools/parse_it.py: stop each leaf at 'Assessment criteria/guidance/Synoptic assessment' and column breaks, join 'To include:' continuation lines; regenerate js/data/it.js. | Smoke: no IT spec string > ~300 chars or starting 'include:'; F206.6.1 etc. read clean. |
| CC-02 | P1 | tools/parse_it.py/gen_data.py: drop overview nodes ('Overview of the assessment', 'NEA Units'), assert ref uniqueness, regenerate; prune state keyed to the bogus ref at the store gate. | Smoke: all IT refs unique and 'Ways to reflect' opens its own leaf. |
| CC-03 | P1 | Shared with CM-02: deterministic per-question shuffle in js/engines/quiz.js (keyboard 1–4 on displayed order); rebalance longest-option bias in CS banks. | Smoke: with shuffling on, no leaf has >50% answers at one displayed index; correct-option length is not the max in >50% of items per bank. |
| CM-01 | P1 | Add a checked-in Maths spec override table applied by tools/gen_data.py (hand-authored from Edexcel 9MA0, LaTeX in $…$, no 'need to learn:'), regenerate js/data/maths.js. | Smoke: no Maths spec line ≤4 chars, no single-letter runs and no 'need to learn'; M7.3 spec tab reads clean. |
| CM-02 | P1 | js/engines/quiz.js mountMCQ: seeded per-attempt option permutation (reshuffled on Retry), clicks mapped back to the original index so stats and why text stay valid. | Smoke: across 200 mounts the displayed correct position is roughly uniform (each index 15–35%) and recorded answers map to the authored ans. |
| CM-14 | P1 | js/core/content.js:537 examFromWorked: emit one scheme point per mark code ([M1],[A1]…), Answer as a separate non-tickable line; fromTicks needsM reads the code tokens. | Smoke: for every derived exam part Σ point weights = marks and an A point can't be ticked without its M. |
| CO-04 | P1 | js/core/codeui.js task Run: replace the one-line input with an auto-growing textarea prefilled with the whole first example stdin; keep Ctrl+Enter. | Smoke: running a multi-line task's reference answer with the prefilled input passes with no ArgumentNullException. |
| EX-01 | P1 | js/modules/examprac.js Marks by question: Max as a number input on rows without an index max; Topic cell a KOS.topicPicker scoped to the assessment's leaves. | Smoke: '＋ Question', set max 6 and a topic → saved question has max 6 and refs. |

**W6 progress (13 Nov 2026, `feat/w1-integrity` 0a57ea5, NOT deployed; gate
138/138, smoke138 new):** FIXED CC-03/CM-02 (quiz options shuffled per
attempt; self-referring sets keep their order), CM-25, CM-14/CC-14/CC-17
(self-marking by mark codes; the Answer line a model answer, never ticked),
EX-01 (out-of and topic on a hand-added question), CO-04 (multi-line Run
input), CC-01/CC-02 (IT spec text tidied by `gen_data.py --tidy-it`; F206.6.1
"Ways to reflect" opens again). LEFT: **CM-01** — the Maths spec text on
about 36 of 89 leaves is broken PDF extraction (lost exponents, fractions,
split words); it needs re-authoring from the Edexcel 9MA0 specification as
typeset blocks, an override table gen_data.py applies, and a smoke check
that refuses fragment lines. A content batch of its own. Also left: the
longest-option bias in authored distractors (CC-03's second half) and the
W6 P2/P3s.

### W7 — Connected OS and honest numbers (about 2 sessions)
- **Automatic judgements need minimum evidence (RC20).** Each one names its
  minimum evidence and is tested with thin and contradictory fixtures.
  - **RAG:** no claim until there is evidence; Green only when recall and
    practice both clear their bar (GO-23/UR-22: one 0% quiz reading Green).
  - **Mind's ladder:** Apply only on a first-attempt right answer.
  - **Japanese:** "holds a week" needs a week; Easy only on a first try.
- **Goals measure their period.** Collection goals read the media journal in
  range (GO-02/UR-20: "3 titles" met at once at 666/3). Periods clamp to the
  start date. Editing a goal re-baselines it.
- **One definition of activity (HR-31, your 8 Nov rule).**
  - **What counts:** progress, volumes, chapters, routes or hours moving
    forward; a start or finish dated in the period; or a session on the
    title.
  - **What doesn't:** a score change, notes, tags, or a tidy-up status move.
  - **Recently updated (CL-45, your 8 Nov screenshots).** It sorts by when you
    last acted on a title (AniList's own list-entry time, or your edit in the app),
    never by when AniList's tags, cover or totals last changed.
  - **Who uses it:** Reports, Home, Goals and the Collection's "this week".
  - **One study-minutes figure.** Home, Reports, Goals and the Daily goal all
    read one study-minutes derivation (HR-05).
- **Every study space joins the OS (RC19).**
  - Japanese and Mind sync their checks after every scheduler write and at
    boot (JM-07, MI-01).
  - Creatives syncs its fourth check after a card rating (CR-25).
  - Japanese and Mind get goal types, Reports facts, Today/Home entries and
    Assistant read tools.
- **Home and search.**
  - Home's Continue covers every space, ordered by recency (HR-01: Mind and
    Creatives missing).
  - Search finds pages and achievements (SH-07).
  - One amount formatter, so Hide amounts masks everything.

**Every P0/P1 in W7: the fix, and how it's accepted**

| Id | Sev | Fix | Acceptance |
|---|---|---|---|
| CL-45 | P1 | Add an activity stamp (activityAt) in mediadb from AniList list updatedAt, VNDB lastmod and local list-state/personal edits; sort 'Recently updated' by it, keep updatedAt for cloud dirtiness; share HR-31's activity definition. | Smoke: a pull that only reorders tags or changes a cover leaves the sort order unchanged; a progress step moves the title to the top. |
| CR-25 | P1 | Hook KOS.srs.rate: when a key starts 'creatives:' call KOS.creatives.syncChecks(lesson); run KOS.creatives.syncAll() once at boot. | Smoke: rate a Creatives theory card Good → the lesson's fourth check is set and mastery reaches 100% when other checks are done. |
| GO-02 | P1 | js/core/goals-collection.js: measure the period from the media journal (completions, deltas, favourites in [start,deadline]), purchases by purchasedAt, library-size by createdAt; baseline at creation meanwhile. | Smoke: a Collection goal created today with a full vault reads 0 progress and is not Met; a completion today counts 1. |
| GO-06 | P1 | js/modules/goals.js goalDialog: fields.routine on both routine types with a Routine select from KOS.routines.all() writing params.routine; refuse Save without one. | Smoke: create 'Keep a routine on N days' → params.routine set and Save refused when blank. |
| GO-07 | P1 | js/modules/goals.js: fill the habit select from KOS.routines.habitsView() storing params.routine (or retire habit-streak for routine-streak, old records readable). | Smoke: a habit created in Routines appears in the habit-streak picker and its streak is measured. |
| GO-23 | P1 | js/core/rag.js auto(): evidence-weighted score with minimum evidence before any band; goals-exams topics-green counts a leaf only with enough evidence and judges on the deadline. | Smoke: five topics with one 0% quiz each are not Green and 'Move topics to Green' is not met. |
| HR-01 | P1 | js/modules/hub.js Continue row: order desks by last-studied time from the ledger/ui.lastRef, wrap to auto-fill minmax columns on desktop/iPad (or prev/next + 'N more'), and let started() count Mind journal/positions/cards and Creatives works. | Smoke: with a recent Creatives session the Creatives desk is in the first four Continue cards; device check Mac 1470x832, iPad 820x1180 every started desk visible without hidden scroll. |
| HR-02 | P1 | js/core/reportstore.js ensureReports: wait for the first cloud pull (or signed-out), stop seeded Pacing rows alone counting as content, and after importFull/first link rebuild rebuilt reports whose facts are empty or older than the newest ledger entry in their period. | Smoke: ensureReports before a pull saves nothing; after a pull adding sessions in that week the rebuilt report shows the minutes, not 'A quiet week for study'. |
| HR-04 | P1 | js/core/today.js build: add a spaces read (Code planDay, KOS.ja planDay, KOS.mind planDay, KOS.creatives planDay) and a money read (KOS.money.notices(today,{hide}), safe-to-spend); hub.js uses them for the Due card split, Up next rungs/Today rows and a Money line. | Smoke: with due Japanese facets and a Code Daily 20 pending, KOS.today.build lists both and Home's Due count includes them; a bill tomorrow shows the Money line. |
| HR-05 | P1 | Add KOS.sessions.studyMins(range) in js/core/sessions.js (isStudy + parts, excluding todo/external/media) and call it from hub.js Study hours, report.js Studied, goals study-hours and the Daily goal. | Smoke: a seeded week with Focus, todo and media sessions gives identical minutes on Home's Study hours and the week report's Studied. |
| HR-17 | P1 | Name subjects via KOS.subjects.name(sid)/hue in report.js, reportwords.js, reports.js, reportstory.js, reportshare.js; regenerate template words for saved reports containing 'undefined'. | Smoke: a Code-heavy week's template narrative names 'Code' and no report text contains 'undefined'. |
| HR-31 | P1 | Define media activity once (e.g. KOS.media.activeIn(row, range): forward progress/volumes/chapter/route/hours, a start/finish date in range, or a media session naming the row) and use it in report.js collection(), Home/Collection 'this week' and goals. | Smoke: a week whose only journal event is a score change shows no title in the report's Collection; a progress step does. |
| JM-07 | P1 | js/core/ja.js: after record()/finishSession() call syncChecks for each lesson whose items were reviewed, and run a boot pass over started lessons. | Smoke: pass reviews for a lesson's items → stored progress checks equal evidence() (4/4) and status follows. |
| MI-01 | P1 | js/core/mind.js evidence(): for a checkpoint lesson read concepts from KOS_MIND.CHECKPOINTS[unit].concepts for the retrieval check. | smoke110: a fully done F1.8 checkpoint lesson reaches status done with 4/4 checks. |
| ST-03 | P1 | js/engines/quiz.js: store best as a percent (bestPct) and migrate existing records at the store gate (best/len when deck length known); hub.js inspector prints the percent. | Smoke: 6/11 correct → inspector reads 'Quiz best 55%' and the quiz header agrees. |

### W8 — Maintainability, performance and docs (about 1–2 sessions)
- **Help & Guide.** Rewrite it for every shipped area: Money, Goals,
  Routines, Files, the study spaces and Achievements (SH-10, SH-11). A smoke
  ties each Help entry to a registered view.
- **Docs.** Re-baseline the docs: README, AGENTS, PROGRESS, ROADMAP and
  HANDOFF currently disagree (AP-05, AP-06).
- **CLAUDE.md and AGENTS.md rules (your four, §1.2):**
  - ask before building;
  - keep docs in sync;
  - keep Help & Guide in sync;
  - check every device before calling a feature done.
- **Shared study-space machinery.** One `KOS.lessonReader` (dwell, evidence,
  `syncChecks`, award) shared by Code, Japanese, Mind and Creatives (RC16).
  Split `hub.js` (3,899 lines) by surface.
- **Performance (RC14).**
  - Memoise the heavy derived reads: exams readiness, badge measures,
    Mangaka aggregates.
  - Lazy-load curriculum content per subject. The app boots about 16.6 MB of
    JS in 340 scripts, and the iPad feels it.
- **Repository.** Untrack the personal exports; whether to purge them from
  history is your decision (AP-07).

### W9 — Polish and HCI (about 2 sessions; FROZEN, §A9)
- **Scope:** exactly the 200 mapped findings, plus your 6 QoL items (§5).
  Nothing else.
- **The long tail.** All remaining P2/P3 polish, grouped by page.
- **Keyboard and dialogs.**
  - Arrow keys on tab strips.
  - The toast's Undo is reachable by keyboard and ⌘Z.
  - A toast queue.
  - Enter never confirms on a button.
- **Page title.** `document.title` follows the page.
- **Audio and haptics (HCI).**
  - A sound setting, and chimes that work on iOS after a gesture.
  - Light haptics where iOS supports them.
  - The Focus chime is silent on iOS (AX-03).
- **Assistant action cards.** Each shows its result, an Open link and Undo.

### W10 — Deliverables (after implementation)
- **The interactive review checklist.**
  - Modelled on [`reference/graphite-review.html`](reference/graphite-review.html):
    sections with a kanji mark, title plus what to check, a tick per device
    (Mac, iPad and iPhone) and per account, Issue with a note, the summary
    bar, filters, and "Copy issues and notes".
  - Every item links the finding ids it verifies **and cites the smoke
    suite and device check that closed them** (§A10).
  - Published as an artifact with a `db`.
- **The final technical report.** What was found, what changed, what was
  verified, what is still outstanding, and the overall state.

---


---

## 3. Design prompts and art

**Claude Design prompts.** These are written only where a real redesign is
needed. They will be added to `docs/design-prompts.md`. **D-Held page,
D-Topic tier and D-Agenda go to you at the end of W1 (§A8).** The rest come
one per release, before its build:
- **D-Money:** what a student with a Santander account wants to see (W4;
  MG-08).
- **D-Agenda:** the Agenda view on Mac and iPad (PR-06, PR-12).
- **D-Topic tier:** the topic page and inspector between 700 and 1240, and
  the topic tab row on the phone (ST-06, ST-17).
- **D-Held page:** the "Updated on another device" chip and held-page states
  (SY-26).
- **D-First run:** the welcome (SH-35), if you want one.
- **D-Shop:** the seals' surface and the theme redesigns, if you choose
  redesign over removal (SC-04, SC-15, SC-17, SC-22).
- **D-Home and Seat:** small layout passes (HR-04, AG-30, AX-45). These may
  fold into W3 without a prompt.

**Gemini art-sheet entries.** These are made by hand in the Gemini app:
- SH-19: an empty-state spot;
- SC-20: the shop's purchase art;
- the replacement art for any themes or frames you choose to redesign.

---

## 4. QoL (after the fixes) and backlog

**Your QoL requests, kept in the plan once the workstreams above land:**
- **Agenda everywhere** (PR-06; W3/D-Agenda).
- **Anime "where I'm watching" links** (CL-11).
- **Pacing:** shift the plan by N weeks in one action (UR-19).
- **Ink:**
  - add or delete a page from the Handwritten tab (UR-11);
  - paste a picture on the iPad, with a Paste button (UR-10);
  - lasso across pages and parts of a picture (UR-9);
  - copy maths as TeX (UR-13).
- **Kurenai's drawer:** a clear collapse control. Today's "Hide" chip is easy
  to miss (UR-18).
- **Device continuity:** pick up a running Focus or routine timer on another
  device, as an option (UR-6). It needs care, because invariant 33b makes a
  timer per device.

The auditors' 181 QoL ideas stay in each area's file (`qol`), in the
**post-programme backlog**. None is pulled into W9 (§A9).

**Reported by you on 13 Nov 2026 (new; not in the audit):**
- **UR-25 · FIXED 13 Nov (`feat/w1-integrity` 13903e9, smoke113 M) · titles and the showcase empty themselves and don't reach the
  other device.** Found on reading the code: Edit your seat's Save
  (`js/modules/governor-ui.js` ~822) ALWAYS calls `setShowcase(draft.showcase)`
  and `setTitle(draft.titleId)` with the copy taken when the page OPENED
  (~671), even when only the background changed. Saved on a device that had
  not pulled the title yet, or on a page the stopgap held across a pull, it
  writes an empty showcase and no title as a local edit, which the merge then
  pushes to every device (the "original" one included). Before RC5 a second
  tab's save could also overwrite the whole document (fixed in
  kos-integrity-6). Fix: Save writes only what was changed in the editor;
  smoke over two devices. Small; W1/W2 (with SY-20/AG-25's draft store).
- **UR-26 · FIXED 13 Nov (14bd215, smoke91 L) · Exams › Companion "Cram" does nothing.** Cause: the button counted every card in scope, the run took only due and weak RATED cards — with the queue cleared and cards unrated it opened "Queue clear". Now due, weakest, never rated, then the rest, up to the count shown. Both Cram buttons call
  `KOS.show("review", {tab: "due", run: "scope:<id>"})` (examguide.js 83,
  278); not reproduced yet — check `due.js`'s `scope:` run with no card due
  today, and SH-37 (the review route has no codec, so a reload loses the run).
- **UR-27 · CLOSED 13 Nov, not reproduced · the rapid drill shows wrong answers.** You said: likely misread in a rush five minutes before the exam; nothing wrong found since. Reopen with a screenshot (question and topic) if it recurs. `KOS.examCompanion.drill`
  takes each card's own `a` and each short item's first part's mark scheme;
  not reproduced yet — likely the derived exam items (CC-14/CC-17: the worked
  card's one-line "Answer:" as a mark point) or a content error. Needs a
  repro with the leaf and the question.
- **UR-28 · Exams & Papers as a WHOLE is not as helpful as it should be:
  rework it like Money (W4).** Your words (13 Nov): used for three days
  before a topic test, "overall just not as helpful as it should be" — not
  only the exam items. Needs a design pass first (a D-Exams prompt): what
  the days before an exam should look like, how a question, its marks, the
  scheme and the self-mark read, what Cram and the drill are for; folds in
  CC-14, CC-17, CM-21, EX-30, UR-26, UR-27. Backlog until W4's pattern
  exists.
- **UR-29 · pacing should live INSIDE the calendar's blocks.** A Maths
  lesson you put in the Calendar should carry that week's class pacing for
  Maths; a study block should carry My plan's rows; instead the plan stands
  as its own list. Design first (later): which block a row attaches to
  (subject, the class timetable, a study block's subject), what happens to
  a row with no block, and how a tick in the block reaches Pacing
  (invariants 82, 82b).
- **UR-30 · FIXED 13 Nov (13903e9, smoke130 S, T) · "the Daily goal is
  broken".** It WAS counting (the header said 2 / 2): since HR-18 a
  directive is a link marked `data-state="done"`, but the stylesheet filled
  the mark only for `aria-pressed`, so the tick (drawn in `--bg`) was
  invisible on an empty ring. Also fixed: an assessment's revision time
  now counts over its RESOLVED scope (excludes out, every include — the
  derived event's links stopped at 20), one count shared by the directive
  and Home's Focus card.
- **UR-31 · FIXED 13 Nov (13903e9, smoke104 J) · the plan floods the
  afternoon review.** Still today listed every plan row with "▲ Overdue"
  (49 rows on a real week); it is now ONE line, as the morning's Due card
  already was. Left for UR-29/W7: whether carried rows should count as
  overdue at all, and a calmer Pacing carry-over.
- **UR-32 · FIXED 13 Nov · everything on the week's plan said "Today".** An
  undated row fell through to "● Today"; a chip now says only Overdue,
  Today or Tomorrow by the row's own date.
- **UR-33 · FIXED 13 Nov · two empty "now" rows in After now.** The step and
  its timeline each drew a Now marker.

**Backlog** (not this programme): routines inside routines (sketched in
`findings/productivity.json`), folders for loose notes (UR-14), tables and
rich formatting in ink (UR-12), Code editor intelligence (UR-23: Roslyn
diagnostics and completion in the existing worker; feasible in stages), and
the auditors' 127 backlog ideas.

**Edge Functions (W0 audit, `qa/w0/edge-functions-audit.md`; recorded, not
scheduled — ask before adding to a workstream):** EF-01 P2 an uncaught
exception answers without CORS headers ("network?" instead of the reason);
EF-02 P2 the gateway's own 401 has no `error` field; EF-05 P2 one user's
failure aborts the runner's whole tick; EF-03, EF-04, EF-06, EF-07, EF-08
P3 hygiene.

---

## 5. What is not covered (be honest)

**Not covered by the audit:**
- DST and time-zone edge cases;
- real offline use;
- the service-worker update prompt across two deploys;
- Edge Function code;
- VoiceOver inside labs, ink and the code editor;
- every shop theme on every page.

**Checked only in the emulated harness, not on a real device:** iOS
behaviours (screen lock, keyboard, Pencil, haptics).

**Not done in the live checks:** AniList and VNDB pages at iPad and iPhone
sizes. Chrome would not resize.

**Where these gaps go:** W0 adds tests for DST and the update prompt. Device
checks run on your real iPad and iPhone before each W2/W3 release is called
done.

---

---

## Appendix — every open finding by workstream

Generated by `harness/plan_appendix.py` from [`data/plan-mapping.json`](data/plan-mapping.json). "fixed by" names the finding whose fix also closes it.

### W0 — Safety net (4)

| Id | Sev | Title | RC | Fixed by / depends on | Decision |
|---|---|---|---|---|---|
| AP-12 | P3 | The 112-suite smoke gate takes ~14 CPU-minutes with no runner, no npm script and no CI; two suites are 41% of it |  |  |  |
| AP-16 | P3 | The smoke gate is not reliable under load: five suites fail when run three at a time and pass alone |  |  |  |
| CC-11 | P3 | validate_content reports 9 errors in the CS merged leaves (cs-m-*) and 92 in IT: bare top-level paragraphs | 8 |  |  |
| DI-26 | P3 | Mind's Journal replication has no test and no injectable cloud, unlike every other replicated store |  |  |  |

### W1 — Data integrity and the economy (59)

| Id | Sev | Title | RC | Fixed by / depends on | Decision |
|---|---|---|---|---|---|
| DI-27 | P0 | Sync rewards never stop: bulkUpsert matches by MAL id across modules, so an anime sharing a manga's MAL id flips the manga row to anime and  | 21 |  | yes |
| JM-06 | P0 | Choosing 'Media' in the Japanese spine locks the device out of every Japanese lesson: each lesson page throws 'codeSpine.stageHead is not a  |  |  |  |
| MG-01 | P0 | Duplicate transactions after re-importing: de-dupe key includes payee, so a second import mapped differently is all 'new' | 11 |  |  |
| ST-25 | P0 | Deleting an assignment permanently deletes every file linked to it, including files that belong to a topic or another record |  |  |  |
| SY-18 | P0 | With the redraw held, an open study editor writes its stale copy over material another device added — the pulled card is deleted locally and | 1 |  |  |
| AA-11 | P1 | Import backup replaces everything on this device the moment a file is picked: no confirmation, no summary, no undo |  | fixed by DI-22 |  |
| DI-01 | P1 | Todoist: a reminder made on one device is duplicated when another device syncs before the state document arrives | 6 |  |  |
| DI-02 | P1 | Todoist: a failed second command batch leaves the first batch's tasks unlinked, so the next sync imports them as duplicates | 6 |  |  |
| DI-03 | P1 | First cloud sign-in silently discards a device's reminders, assignments, exams, routines and other data that 'stateMeaningful' does not coun | 4 |  |  |
| DI-04 | P1 | Two open tabs or windows overwrite each other's saves (last writer wins on the whole state) | 5 |  |  |
| GO-25 | P1 | Editing a title goal silently relinks it to another title; only the first 60 in-progress titles can ever be linked |  |  |  |
| HR-16 | P1 | Streak milestone bonuses are paid again every day: before the first study session the streak 'ends yesterday', which moves each milestone's  | 21 |  | yes |
| HR-18 | P1 | Hero 'Daily goal' directives pay XP and gold on a self-tick with no evidence, and untick/re-tick pays again without limit | 21 |  | yes |
| MG-23 | P1 | Two genuine identical payments on the same day in one statement: the second is marked 'Already have' and skipped by default | 11 |  |  |
| PR-03 | P1 | Focus: 'General study — no link' is overridden by About to Study, which silently links the session to the first assignment (even with 'Just  |  |  |  |
| ST-26 | P1 | IT desk: an out-of-range mark typed over a saved one (e.g. 459 for 45) and Enter silently erases the unit's result |  |  |  |
| AA-12 | P2 | Restoring a backup MERGES handwriting instead of replacing it (every other store is cleared first) | 4 | fixed by DI-24 |  |
| AA-13 | P2 | Full backup leaves out saved Reports (weeks, months, words) and Money pot pictures, so a restore loses them | 4 |  |  |
| CC-15 | P2 | Restoring an older backup folds a merged CS leaf's progress by dropping it: a completed member leaf loses to a weaker record on the kept lea | 4 |  |  |
| CL-17 | P2 | Ordering a tied tier while the Shrine is filtered to one medium erases the hand-set rank of every other medium's titles in that tier |  |  |  |
| CL-25 | P2 | Deleting a vault entry has no undo and leaves its Wishlist purchase pointing at nothing ('⇄ Collection' still offered, then 'That collection |  |  |  |
| CR-15 | P2 | Reopening a study's check shows a blank form and silently overwrites the earlier result (a pass can become 'Not yet') |  |  |  |
| CR-20 | P2 | A unit project pays 150 XP, 40 gold and +10 HP for three 'Mark done' taps with no work saved | 21,20 |  | yes |
| DI-05 | P2 | Todoist: a full sync drops completed sub-tasks from the reminder (and can re-add them to Todoist as duplicates) | 6 |  |  |
| DI-06 | P2 | Todoist: completing a repeating reminder here sends a new due string instead of closing the occurrence | 6 |  |  |
| DI-07 | P2 | An assignment re-keyed by the cloud merge leaves its goals, Exams links, Focus sessions and review picks pointing at another assignment | 4 |  |  |
| DI-08 | P2 | A 404 on an update deletes the local event or reminder (e.g. after reconnecting a different Google account) | 6 |  |  |
| DI-09 | P2 | The full backup leaves out saved Reports and snapshots, and builds one giant string that can fail on the iPad | 4 |  |  |
| DI-10 | P2 | The whole state lives in one localStorage key with no fallback: when it outgrows the quota every later change is lost on reload | 5 | after DI-04 |  |
| DI-11 | P2 | Every replicated store pulls with a strict updated_at > cursor on now() stamps, so a row committed late is skipped forever |  |  |  |
| DI-16 | P2 | Todoist: moving a task to another linked project in Todoist is undone by the next sync | 6 |  |  |
| DI-17 | P2 | A linked reminder moved to a list linked to the other provider is copied there and orphaned in the first | 6 |  |  |
| DI-18 | P2 | Creatives' file store is shared by the real account and the Empty and Sample review namespaces | 4 |  |  |
| DI-19 | P2 | The Todoist/Google sync lease does not exclude a second tab on the same device, and is never renewed during a long cycle | 6 |  |  |
| DI-20 | P2 | Money, the review log, Mind's Journal and saved Reports replicate with no error surfaced anywhere | 4 |  |  |
| DI-21 | P2 | 'Reset everything' only resets the state document: the media vault, files, money, ink, Mind, reviews, Creatives and reports all stay | 4 |  |  |
| DI-22 | P2 | Import backup replaces everything the moment a file is picked, with no confirmation and no safety copy |  |  |  |
| EX-39 | P2 | A brand-new account's Exams hub is built around the Calendar's 'SAMPLE — Mock exam (edit me)', migrated into a real assessment |  |  |  |
| HR-21 | P2 | Home's one-tap reminder and habit ticks complete and pay at once with no Undo | 21 |  |  |
| MI-05 | P2 | Checkpoint pays 50 XP / 12 gold / +4 HP and marks itself passed with nothing right; a retake then erases the Explain/Evaluate rungs it gave | 20,21 |  | yes |
| PR-23 | P2 | A routine whose steps are all optional can never be kept: ticking every step leaves it 'partial' for ever (no pay, no streak) | 21 |  | yes |
| PR-24 | P2 | Ticking a routine's minimum step first pays the small minimum award and locks out the full award when you then finish every step | 21 |  |  |
| PR-26 | P2 | Monthly reminders drift: due 31 Jan repeats 28 Feb, then 28 Mar (the day-of-month is lost after a short month) |  |  |  |
| PR-27 | P2 | Completing a repeating reminder cannot be undone and leaves no record: no Undo, un-tick does not restore the date, nothing in Completed | 21 | after HR-21 |  |
| PR-28 | P2 | Pacing 'Edit week' accepts any date as the week beginning: a mid-week date overlaps the previous week and takes over 'this week' |  |  |  |
| SC-32 | P2 | Edit your seat > Background offers '+ Upload an image' with 0 gold and no unlock, bypassing the 3,000-gold 'Profile banner' unlock (invarian |  |  |  |
| SH-27 | P2 | First run writes four fake 'SAMPLE — … (edit me)' events into the real calendar; the mock exam becomes a real assessment that drives Home, a | 4 |  | yes |
| AA-26 | P3 | 'What a backup covers' lists six things and omits half of what the file holds (Money, review log, handwriting, Mind's Journal, Creatives wor | 4,13 | fixed by DI-14 |  |
| CL-38 | P3 | Quote → flashcard writes the card at once while the quote itself waits for the editor's Save; Cancel keeps a card for a quote that no longer |  |  |  |
| CR-31 | P3 | After undoing a paid project milestone the project page promises '150 XP, 40 gold and +10 HP' again, but re-completing pays nothing | 21 | after CR-20 |  |
| CR-32 | P3 | A drill batch pays 6 XP even when nothing was touched: pressing Check and Next through every round earns the day's reward | 21,20 |  |  |
| DI-12 | P3 | Todoist: a command the server rejects is resent on every cycle forever, with no status shown | 6 |  |  |
| DI-13 | P3 | An unreadable stored state is replaced by a fresh one and overwritten on the next save |  |  |  |
| DI-14 | P3 | Backup & Restore's 'What a backup covers' list is out of date: half of what the file holds, and everything it leaves out, is unlisted | 4,13 |  |  |
| DI-15 | P3 | Archive › Storage accounts for none of the app's real data and prints rows of 0 KB | 4 |  |  |
| DI-23 | P3 | A reminder deleted here while its task was edited in Todoist comes back for one sync cycle | 6 |  |  |
| DI-24 | P3 | Restore is not authoritative for handwriting or files: ink pages and files not in the backup survive it | 4 |  |  |
| DI-25 | P3 | Japanese mined lines are kept in the synced state document, against 'personal media never leaves the device' |  |  |  |
| ST-20 | P3 | Streak milestone note repeats '36-day streak' once per milestone, and missing milestone records pay every past milestone at once | 21 |  |  |

### W2 — Redraw policy and view lifecycle (63)

| Id | Sev | Title | RC | Fixed by / depends on | Decision |
|---|---|---|---|---|---|
| AA-01 | P1 | 'Undoable' Assistant actions cannot be undone: the undo each tool returns is collected and never offered |  |  |  |
| AA-02 | P1 | Reopened chat starts at the oldest message, and from then on new replies and approval cards land off-screen | 1 |  |  |
| AP-01 | P1 | Boot loads ~16.6 MB of JavaScript in 340 synchronous script tags, most of it curriculum content no first view needs | 14 |  |  |
| CR-01 | P1 | Practice Log work dialog reopens itself after every action and stacks on each redraw (#/creatives/log/<id>) | 1,15 |  |  |
| JM-08 | P1 | Leaving a Japanese session by navigation (rail, tab bar, Back, iPad edge swipe, reload) logs nothing: answers are rescheduled but the sessio | 18 |  | yes |
| SH-02 | P1 | Global Backspace = Back fires even when a page handled the key: Backspace on a Money row opens 'Delete this entry?' AND navigates to the pre | 15 |  | yes |
| SH-20 | P1 | Enter on a focused Cancel button CONFIRMS a non-danger confirm dialog (End session, Turn off notifications, Disconnect GitHub, Add a copy/Op | 17 |  |  |
| SH-21 | P1 | 'Skip to content' navigates to Home instead of skipping: href='#main' is read by the hash router as an unknown route | 17 |  |  |
| ST-04 | P1 | Cards reviewed in an unfinished flashcard batch are never logged: no streak, no pay, 'Today so far · Reviewed 0' | 18 |  | yes |
| SY-02 | P1 | CS/Maths/IT notes reset to page 1 on every background redraw (the reported 'notes page 4 jumps back to page 1') | 1 |  |  |
| SY-03 | P1 | A background redraw mid-flashcards restarts the set at card 1 and silently drops the cards already rated from the session ledger (no XP, no  | 1,18 | after SY-05 | yes |
| SY-04 | P1 | Quiz progress and a typed exam answer are wiped by any background redraw | 1 |  |  |
| SY-05 | P1 | Every cloud pull/merge redraws the active view unconditionally — even when nothing the view shows changed, and even while the user is mid-ta | 1,15 |  | yes |
| SY-06 | P1 | Closing the Daily Review sheet (Later, Esc, Close) redraws the page underneath — and on the iPad it can auto-open over a lesson when you ret | 1 |  |  |
| SY-08 | P1 | A background redraw steals focus from whatever is being typed in — the iPad/iPhone keyboard closes mid-sentence | 1,15 | after SY-05 |  |
| SY-19 | P1 | A background redraw of a Collection vault throws the reader back to the top: the lazy batches are rebuilt at 60 entries, so the saved scroll | 1 |  |  |
| SY-20 | P1 | Edit your seat loses every unsaved change on a background redraw (the draft lives in the render closure) | 1 | after AX-22 |  |
| AA-15 | P2 | Toggling a notification filter (or any Notifications switch) redraws the page and drops keyboard focus to <body> | 1,15 |  |  |
| AA-17 | P2 | After a backup restore the rail's profile card and the file index stay stale (Level 1, 0 gold; 'No files on this device yet') | 1 |  |  |
| AG-03 | P2 | Wall tabs and set deep links are not in the URL: #/achievements/<tab> and #/achievements/set/<id> open Sets | 15 | fixed by SH-37 |  |
| AP-08 | P2 | Detached pages leak: global listeners are removed only when their event next fires, so every visited topic/Files/lesson page stays in memory | 15 |  |  |
| AP-10 | P2 | KOS.rerender() drops keyboard focus to <body> on every redraw, including background ones (cloud pull, habit auto-tick) | 1,15 | after AP-08 |  |
| AP-14 | P2 | Edit your seat loses its unsaved draft (and its tab) on any background redraw: governor is not a held view | 1 | after AP-08 |  |
| AP-17 | P2 | Opening a Wall set by link and leaving before the badges are measured pops the set dialog over whatever page you are on | 15 |  |  |
| AX-07 | P2 | Backspace on any focused button navigates Back, even inside an open dialog, leaving the dialog over a different page | 15 | fixed by SH-02 |  |
| AX-22 | P2 | Edit your seat throws away unsaved changes on any navigation, with no prompt | 15 |  |  |
| AX-24 | P2 | The Wall's tabs and set links have no URL: #/achievements/recent, /titles, /showcase and /set/<id> all open Sets | 15 | fixed by SH-37 |  |
| AX-27 | P2 | A badge set dialog opens over whatever page you moved to, seconds after leaving the Wall | 15 |  |  |
| AX-38 | P2 | No dialog closes on navigation: the router leaves every open dialog, drawer and sheet over the next page | 15 |  |  |
| CC-18 | P2 | Back from a notes diagram (or any detour) reopens the topic's notes on page 1, losing the reading place | 1 | fixed by SY-02 |  |
| CL-08 | P2 | Back (or any route change) leaves a vault editor open over the next page; Save then edits a title from another vault | 15 |  |  |
| CL-24 | P2 | '+1' on a card deep in the grid re-sorts it to the top under the default 'recently updated' sort, so it vanishes from under the pointer | 1 |  |  |
| CR-03 | P2 | A work dialog stays open over other pages after navigation (Back, hash change), stacking duplicates | 15 | fixed by CL-08 |  |
| HR-09 | P2 | Share/Export dialog stays open across navigation (Back, swipe-back, hash change) and shows the previous report over another page | 15 | fixed by AX-38 |  |
| JM-22 | P2 | Kana page: switching Mixed / Read / Write mid-set (or leaving without 'End set') throws the set's answers away unlogged | 18 |  | yes |
| MG-17 | P2 | Painted page header shows the PREVIOUS page's picture (Goals shows Money's jar, Money shows Goals' mountain) | 15 |  |  |
| SH-23 | P2 | Navigating to the page you are already on pushes a duplicate history entry, so Back appears to do nothing | 15 |  |  |
| SH-25 | P2 | A dialog survives navigation: Back (or a rail/route change) leaves the confirm open over the new page, still bound to the old page's record | 15 | fixed by AX-38 |  |
| SH-37 | P2 | The URL does not record many pages: the Wall's tabs and set pages, an opened assignment or reminder, a review run all collapse to the bare r | 15 |  |  |
| ST-12 | P2 | A topic's tab strip forgets its scroll on every redraw, leaving the selected tab off-screen on the phone | 1 |  |  |
| SY-09 | P2 | Japanese review/learn session restarts and loses its unlogged results on a background redraw | 1,18 | after SY-03 | yes |
| SY-11 | P2 | Edits in a Code lesson's runnable listings are lost on a background redraw | 1 |  |  |
| SY-12 | P2 | routines.onSession redraws the whole page whenever an auto-tracked habit ticks itself — e.g. right after a flashcard batch or Code task pass | 1 | after SY-17 |  |
| SY-14 | P2 | A redraw mid-retrieval resets the Code retrieval card's tries, hint flag and clock, so the derived grade comes out better than earned | 1 |  |  |
| SY-21 | P2 | Horizontal strips without a scroll memo snap back to the start on every redraw (study desks' unit strip, Home's desks, the Collection's Now  | 1 |  |  |
| SY-22 | P2 | In-page tabs that are not routes reset on a background redraw (Collection Overview's Analytics, Notifications' Unread filter, Edit seat's ed | 1 |  |  |
| SY-23 | P2 | The achievement unlock overlay opens mid-task (over a flashcard set, a quiz or a lesson) and takes focus | 1 |  |  |
| SY-24 | P2 | Text typed into a field but not yet submitted is wiped once the field loses focus and a background redraw lands (Reminders' quick add and ev | 1 |  |  |
| SY-25 | P2 | Delayed plain KOS.rerender() calls redraw whatever page is on screen by then — bypassing the background hold (Exams planner's 8 s flash, Con | 1 |  |  |
| SY-26 | P2 | Held task pages never catch up while the user stays on them: another device's progress stays invisible, with no sign that the page is out of ✎design | 1 | after SY-05 | yes |
| AG-25 | P3 | Showcase changes on the Wall and in Edit seat are lost without a word when you leave before Save | 15 | after AX-22 |  |
| EX-27 | P3 | Topic tab strip on iPhone doesn't reveal the selected tab (Handwritten is off-screen) | 1 | fixed by ST-12 |  |
| EX-49 | P3 | An open dialog survives Back/hash navigation: the 'Mark it yourself' tally stayed on screen over the next pages | 15 |  |  |
| HR-30 | P3 | Home jumps up 43px on a redraw when you are at the bottom: the Collection desk's rows are filled after the render | 1 |  |  |
| MG-21 | P3 | Phone section sheet stays open across navigation and shows the wrong page ticked | 15 |  |  |
| MI-16 | P3 | Mind's sheets (Ask Kurenai, Quick capture, Explain-back, Position) stay open over the next page after Back or any navigation | 15 | after EX-49 |  |
| SH-13 | P3 | Nothing redraws the open page when the day changes: header clock says Mon 2 Nov, Home still says Sunday 1 November / Good evening | 1 | after SY-05 |  |
| SH-41 | P3 | KOS.show with an unknown view id draws a blank page and pushes it into history (#/archive, #/nonsense) instead of falling back like a typed  | 15 |  |  |
| ST-19 | P3 | Inspector's Quiz best and attempts do not update when a quiz finishes | 1 |  |  |
| ST-36 | P3 | The Notes page you were on is forgotten: Back, returning to the topic or any foreground redraw reopens page 1 | 1 |  |  |
| SY-16 | P3 | Boot-time redraws of whatever page the PWA reopened on (Google read-only copy, own art pictures, sample seed) | 1 | after SY-17 |  |
| SY-17 | P3 | Inconsistent refresh policy: Google/Todoist pulls change Calendar and Reminders without redrawing them, while a state pull redraws every pag | 1 | after SY-05 |  |
| SY-27 | P3 | The Files page repaints its whole list on every text-index step and cloud file event, outside the redraw hold | 1 |  |  |

### W3 — Layering, layout tiers and touch (160)

| Id | Sev | Title | RC | Fixed by / depends on | Decision |
|---|---|---|---|---|---|
| AG-01 | P1 | The Seat's ⋯ menu is cut off by the stage: its Data row (Mine / Empty / Sample) is hidden and unclickable | 2 | fixed by SH-03 |  |
| AG-02 | P1 | iPhone Seat: showcase medals draw at 80px over each other and the XP bar, and the empty slots are 17 x 44 ovals | 3 |  |  |
| AX-01 | P1 | iPhone: most text fields and selects are under 16px, so iOS Safari zooms the page on every focus | 17 |  |  |
| CC-04 | P1 | 'Write it out' pill on worked examples overlaps the example's title on iPhone and iPad | 3 |  |  |
| CL-01 | P1 | Collection section strip hides the Games vault on iPad portrait (inner pill group scrolls invisibly) | 3 |  |  |
| CO-01 | P1 | Stage path on touch devices: unit squares become 28x44 bars and capstone diamonds render as skewed slashes | 17 |  |  |
| CO-02 | P1 | iPhone desk: Daily 20 and Continue squeezed side by side; the Open-lesson button's label spills out of its pill | 3 |  |  |
| CO-03 | P1 | Desk side column: a real Daily 20 task crushes the Continue card to 41px and clips its 'CONTINUE' label (Mac, iPad landscape) | 3 |  |  |
| CR-02 | P1 | On iPhone, Creatives settings (and Start focus) cannot be reached: the gear lives in the page actions, which the phone shell hides | 3 |  |  |
| EX-02 | P1 | Exam Room on iPhone: the 'Before you go in' checklist is drawn on top of the rapid-recall list | 3 |  |  |
| EX-03 | P1 | On iPhone the floating ink palette is 500px wide on a 402px screen: Undo and Redo are off-screen | 3 |  |  |
| EX-28 | P1 | Timed paper: the question navigator's squares are crushed to 7px slivers on iPad and iPhone (17px on Mac) | 17 |  |  |
| HR-03 | P1 | iPad portrait Home has no Daily goal, no Today's three, no Recovery list and no Start focus in the hero | 3 |  |  |
| JM-09 | P1 | iPhone: on a Japanese lesson the topic tab strip collapses to 5 px — Notes, Practice, Reviews and Files are invisible and the Practice sessi | 3 | fixed by ST-02 |  |
| MG-09 | P1 | iPhone: Money's Transactions, Month and year, Import/Export CSV and Goals' This week/This month/Done are unreachable | 3 |  |  |
| MG-25 | P1 | iPhone and iPad portrait: tapping a transaction shows nothing; its Edit and Delete sit below the whole list | 3 |  |  |
| MI-02 | P1 | Mind desk on iPhone and iPad portrait: the Daily 15 and Continue cards are crushed to 40px — the Start button, the plan and the lesson title | 3 |  |  |
| PR-01 | P1 | Afternoon review: 'Place in a free block' menu opens BEHIND the review dialog, so it does nothing | 2 |  |  |
| PR-04 | P1 | Running Focus: a long assignment title runs off the screen (left edge on Mac, right edge on iPhone) |  |  |  |
| SH-01 | P1 | Toast wraps at half the viewport width on phones: tall broken pill over content |  |  |  |
| SH-03 | P1 | Governor ⋯ menu is cut off behind the Stage (only half of its first row shows) | 2 |  |  |
| SH-04 | P1 | iPhone bottom tab bar lost its labels: five bare kanji (灯 学 整 蒐 余) with no Home/Study/Productivity/Collection/More text | 3 |  |  |
| ST-01 | P1 | IT desk on iPad portrait: the qualification-boundary chart is crushed to 52px and its numbers overlap; the units table truncates every unit  | 3 |  |  |
| ST-02 | P1 | iPhone topic page: the Working and Edit buttons squeeze the tab strip to ~181px, hiding the selected tab | 3 |  |  |
| ST-05 | P1 | Assignment detail: 'Focus on this' and the Complete/Submitted/Blocked buttons sit ~1,000px below the panel's content, off-screen | 3 |  |  |
| ST-06 | P1 | On iPad and iPhone, tapping an assignment opens its detail at the bottom of the page, out of sight ✎design | 3 |  |  |
| AA-14 | P2 | Scheduled tab's day buttons are 32x44 ovals on iPad and iPhone | 17 |  |  |
| AA-20 | P2 | Assistant chat header's Project picker and Pin are 21px-tall chips on iPad (touch targets far under 44px) | 17 |  |  |
| AG-06 | P2 | The current-badge ring in an opened set's strip is an oval, off-centre on its medal |  |  |  |
| AG-11 | P2 | Study cadence heatmap labels shrink to ~6px on iPhone (10px on the Mac) | 3 |  |  |
| AG-18 | P2 | iPhone: the Gold Shop item sheet stops 32px short of the right edge, leaving a strip of the page showing beside the bottom sheet | 3 |  |  |
| AG-21 | P2 | iPhone Titles: tapping a plaque shows nothing — its detail and the Equip button sit ~1,600px further down, under all 16 plaques | 3 |  |  |
| AX-04 | P2 | Status chips fail AA contrast app-wide (3.5–4.3:1 at 11.5px), worst in Atelier Dawn | 17 |  |  |
| AX-05 | P2 | Touch-size floor is undone by shared primitives: pill selects 30px, switches 34x20, checkboxes 18x18 on iPad and iPhone | 17 |  |  |
| AX-06 | P2 | iPad portrait rail is seven bare kanji with no label, tooltip or due count | 3 |  |  |
| AX-26 | P2 | iPhone: the Seat's empty showcase draws six squashed ovals until (or unless) its note arrives | 3 | fixed by AG-02 |  |
| AX-28 | P2 | Atelier Dawn: title plaques put gold names on pastel washes (~2.3:1) and grey 11px 'LOCKED · …' lines (~2:1) | 17 |  |  |
| AX-37 | P2 | Atelier Dawn: Home hero's XP and HP line sits at ~3:1 over the painted art | 17 |  |  |
| CC-16 | P2 | On iPhone a worked example keeps its 84px 'GIVEN / STEP n' label column, squeezing the working into 61% of the card | 3 |  |  |
| CC-20 | P2 | IT desk on iPad portrait: the qualification boundary bar collapses to 48px, its 120/180/240/270 labels print on top of each other | 3 |  |  |
| CL-06 | P2 | Small touch targets across Collection controls on iPad/iPhone (sort selects 30px, Mangaka letters 32px, Wishlist checkboxes 18px, Sync radio | 17 |  |  |
| CL-07 | P2 | Vault toolbar wraps into three ragged rows on iPad portrait ('Find new' alone on a row, count alone above) | 3 |  |  |
| CL-16 | P2 | AniList profile stat bands use a quarter of the card's width (auto-fill leaves empty tracks) and repeat the hero's figures on another scale |  |  |  |
| CL-19 | P2 | Mark purchased dialog: the Paid amount field is 57px wide and clips the price ('£ l0.00'); the date is cut to '06/11/20' |  |  |  |
| CL-26 | P2 | iPad landscape (1180): the vault toolbar overflows leftwards over the title count; search squeezed to 112px ('Search bc') | 3 |  |  |
| CM-03 | P2 | "Write it out" chip overlaps worked-example titles on every device and is only 23px tall | 17 |  |  |
| CM-19 | P2 | Long worked-step lines push the topic page sideways on iPhone: 14 lines in 9 Maths leaves run up to 114px past the screen |  |  |  |
| CO-05 | P2 | Subject analytics card stretches its eight tiles over the Retrieval-due list's height, leaving ~120px gaps between rows |  |  |  |
| CO-08 | P2 | Capstone step bar: steps 2-6 are 26x40 targets on iPhone and every step is 40px tall on iPad | 17 |  |  |
| CO-10 | P2 | Lesson listings' Run / Reset / Copy are 33px tall on iPad and iPhone | 17 |  |  |
| CO-11 | P2 | iPad portrait: 'Start focus' wraps to its own 44px row and the subject pills cut 'Creatives' down to a lone dot | 3 |  |  |
| CO-20 | P2 | SQL task examples: the expected result table wraps mid-row in a half-width column beside an empty '(none)' input |  |  |  |
| CO-22 | P2 | iPhone lesson listings: the caption is crushed into a ~110px column beside Run/Reset/Copy and wraps to five lines |  |  |  |
| CR-04 | P2 | Creatives desk hero is taller than the other study spaces' heroes (341 vs 292-339 px) and its analytics card is stretched with empty bands |  |  |  |
| CR-06 | P2 | Subject pill strip hides the active 'Creatives' pill off the right edge on iPad portrait | 3 |  |  |
| CR-07 | P2 | Settings 'Your days': the S M T W T F S letters sit at the left edge of their circles, and on touch the circles are 40x44 ovals | 17 |  |  |
| CR-13 | P2 | iPhone lesson page: the tab strip gets 181 px, so only 'Notes' and half of 'Micro-studies' show; Theory cards and Project are hidden behind  | 3 |  |  |
| CR-16 | P2 | Hierarchy drill: five identical 'Bold' toggles with no line in their name, 32 px tall on touch; − M + read as plain text | 17 |  |  |
| CR-17 | P2 | On iPhone, Creatives sub-pages lose their title: Practice Log, Settings, The check and Project all read 'Creatives' | 3 |  |  |
| CR-18 | P2 | Sketchbook on iPad portrait: the brief, timer, reference and 'Save to Practice Log' are below a 1,078 px canvas, off screen | 3 |  |  |
| CR-19 | P2 | 'Add your work' is a bare 720 px form with a raw browser file button, a 490 px dead column beside it, no preview and no drop target |  |  |  |
| CR-27 | P2 | The check's 'Yes, mostly' / 'Not yet' buttons are 32 px tall on iPad and iPhone | 17 |  |  |
| CR-28 | P2 | Font pairing drill: the face options are 32 px tall on touch | 17 | fixed by CR-16 |  |
| CR-29 | P2 | On iPhone the check page cuts the work's title off at the card edge and puts the check itself two screens below the whole piece | 3 |  |  |
| EX-05 | P2 | Readiness band line on iPhone squeezes the sentence into a ~80px column, one word per line | 3 |  |  |
| EX-06 | P2 | Planner rows on iPhone truncate every topic name to a few letters and wrap the group total | 3 |  |  |
| EX-08 | P2 | Marks by question on touch: tag chips are 24px tall and the Got field 28px | 17 |  |  |
| EX-10 | P2 | Exam Season on iPhone: 'Highest-risk topics' shows each topic as 'Finite …', 'Abstr…' (51px) | 3 |  |  |
| EX-12 | P2 | Floating palette's grip (the only way to Text, Image and Paper while floating) is 32x32 | 17 |  |  |
| EX-31 | P2 | Full Companion's shape rows: two unlabeled number columns explained only in a footnote; on iPad portrait the shape title gets 108px and wrap | 3 |  |  |
| EX-34 | P2 | Results › IT units: the grade word ('Distinction') overflows a 24px column and runs off the card's right edge |  |  |  |
| EX-36 | P2 | Scan pages: the four corner handles are 30px dots on iPad and iPhone, the device the camera flow is for | 17 |  |  |
| EX-38 | P2 | Side by side on iPad landscape: the docked ink bar is 474px wide and scrolls, hiding Undo, Redo, Paper and Float behind a › arrow | 3 |  |  |
| GO-12 | P2 | iPhone: 'Aim at something new' template rows are 180px tall for one line of text |  |  |  |
| GO-13 | P2 | iPhone: goal cards hide the deadline, the pace chip and the action button | 3 |  |  |
| GO-22 | P2 | Goal editor: 'Every month' is cut off in the Repeats control beside a money amount (mac) |  |  |  |
| HR-07 | P2 | Hero's season chip ('Autumn · by season') covers the Daily goal count |  |  |  |
| HR-10 | P2 | Home's middle rows leave large empty areas inside equal-height cards (Today, Due today, Study hours, Week in review) |  |  |  |
| HR-19 | P2 | iPhone hero: the XP line shares a row with the 200px XP bar and has 6px of slack, so it collides as soon as glyph metrics or the number grow | 3 |  |  |
| HR-20 | P2 | Touch targets under 44px on Home's week plan and across Reports (tick boxes 18x18, '31 more this week' 19px, crumbs 20px, 'Full overview ›'  | 17 |  |  |
| HR-25 | P2 | Weekly report page: the Study and 'Governor and Kurenai' cards are stretched to the Focus card's height and are mostly empty |  |  |  |
| JM-01 | P2 | Japanese stage path labels truncate ('Intermedi...', 'Upper int...', 'Advanced' on iPad) on the desk hero and the Checkpoints page |  |  |  |
| JM-03 | P2 | Touch targets under 44px in Japanese and Mind: stage-path checkpoints 21px wide, Journal kind chips 32px tall, Daily-minutes slider 16px tal | 17 |  |  |
| JM-23 | P2 | iPhone Kana chart hides the や, ら, わ and ん columns off the left edge with no cue: an undeclared overflow scroller |  |  |  |
| JM-24 | P2 | Study-space heroes are four different heights: the Japanese desk hero is 339 px on the Mac against Code's 292 and Mind's 296 (iPad 507 vs 45 | 16 | fixed by ST-08 |  |
| JM-25 | P2 | Stage-path checkpoint circles render as 21×44 ovals on iPad and iPhone | 17 |  |  |
| MG-14 | P2 | Pots: empty right column beside the pot cards, and Move money's tabs/select clipped | 3 |  |  |
| MG-15 | P2 | iPhone Recurring: the third occurrence tile is cut off at the card edge | 3 |  |  |
| MG-20 | P2 | iPad: Money header wraps Add entry to its own row and clips Hide amounts; filter selects are 30px on touch | 3,17 |  |  |
| MI-11 | P2 | iPhone: Ask Kurenai's 'What is sent' sheet is wider than the screen — its text and boxes are cut off on the right | 3 |  |  |
| PR-07 | P2 | iPad portrait Calendar: '+ New event' wraps to its own row leaving a full-width empty band | 3 |  |  |
| PR-08 | P2 | Routine offer checkboxes render as 22x44 tall pills on touch devices | 17 |  |  |
| PR-09 | P2 | Routines 'Start with these?' card leaves ~400px dead on the right on Mac |  |  |  |
| PR-10 | P2 | Reminders: the right inspector column is a small hint card over a dead column |  |  |  |
| PR-12 | P2 | Focus page while a session is minimised is one banner over an empty page ✎design |  |  |  |
| PR-13 | P2 | Pacing week: lesson ticks (18x18) and lesson-day selects (62x24) are far below the 44px touch minimum on iPad/iPhone | 17 |  |  |
| SC-29 | P2 | On iPad portrait (701-1080px) the Assistant shows no Kurenai at all, so a bought outfit (4,500-10,000 gold) is invisible there | 3 |  |  |
| SH-08 | P2 | Phone '⋯ tools' and section-switch sheets stay open when the window grows past 700px, showing a phone sheet as a desktop modal | 3 |  |  |
| ST-07 | P2 | Topic inspector and Assignments controls stay 30-32px tall on iPad touch (below the 44px minimum) | 17 |  |  |
| ST-08 | P2 | Study-space heroes are seven different heights on one shared component | 16 |  |  |
| ST-09 | P2 | Subject pills clip 'Study spa…' inside a nested scroller on iPad portrait |  |  |  |
| ST-11 | P2 | Weakest/Continue card ellipsises a word mid-title on the phone ('4.5.4.8 Norm… of floating point form') | 3 |  |  |
| ST-15 | P2 | The spec spine drawer (iPad portrait, iPhone) opens at the top of the subject, not at the topic you are on, and does not take focus | 3 |  |  |
| ST-17 | P2 | On iPad portrait the topic inspector is stacked under the whole tab, ~1,700-2,600px down, behind a right-pointing collapse chevron ✎design | 3 |  |  |
| ST-29 | P2 | Due today's By topic list cuts every topic name to ~18 characters on the phone while its second line sits half empty | 3 |  |  |
| SY-13 | P2 | Toasts are capped at half the viewport width and, on the iPhone, sit on top of the flashcard rating buttons (and catch taps when they carry  |  | after SH-01 |  |
| AA-22 | P3 | Permissions on iPhone: each area's disclosure chevron is pushed off-screen and the filter field floats unaligned | 3 |  |  |
| AA-23 | P3 | Storage page leaves dead space: a lone card on the last row and three mostly empty cards stretched to the tallest one |  |  |  |
| AG-15 | P3 | Seat showcase medals: the focus ring is an oval (button 80 x 86.3) |  | fixed by AG-06 |  |
| AG-29 | P3 | Wall toolbar on touch: the filter select is 30px tall and the List view switch row 20px — both under the 44px touch minimum | 17 | fixed by AX-05 |  |
| AG-30 | P3 | Avatar tab: the Wardrobe is a 3x3 grid of near-empty cells and the Theme card holds two swatches in a full-width row ✎design |  |  |  |
| AX-11 | P3 | Danger and gold buttons in Atelier Dawn fall to ~3:1 contrast | 17 |  |  |
| AX-12 | P3 | Some text fields show no usable focus indicator | 17 |  |  |
| AX-13 | P3 | Calendar dialogs float their Cancel/Close button in the middle of the footer |  |  |  |
| AX-15 | P3 | iPhone Assignments shows its title twice (phone title bar plus the page's own header) | 3 |  |  |
| AX-18 | P3 | iPad Calendar: every day cell carries an invisible '+' (New event) that a tap can hit | 17 |  |  |
| AX-21 | P3 | Calendar's leading/trailing days fade their events to ~2.3-2.9:1 while they stay clickable | 17 |  |  |
| AX-42 | P3 | iPhone Gold Shop truncates item names that would fit ('The night tr…') | 3 |  |  |
| AX-43 | P3 | Files' empty state fades its live filter bar to 55% (text ~3.6:1) | 17 |  |  |
| AX-45 | P3 | iPhone: Edit your seat's preview is the desktop Stage shrunk to 28% (4.5px text) ✎design | 3 |  |  |
| CC-27 | P3 | On iPhone the exam card's '0 / 2 marks' total wraps onto two lines beside the two footer buttons | 3 |  |  |
| CL-15 | P3 | Seasonal controls on iPhone wrap into a ragged block (segmented control alone, right-aligned) | 3 |  |  |
| CL-21 | P3 | AniList profile action row wraps 'Avatar' onto its own line on iPhone | 3 |  |  |
| CL-40 | P3 | Vault editor's section tabs overflow on iPhone with no scroller affordance: 'Quote lo…' cut, 'Identity' off-screen | 3 |  |  |
| CO-12 | P3 | Stage path scroller clips the current unit's square and its focus ring at its left edge |  |  |  |
| CO-30 | P3 | Skill map rows are 40px tall on touch devices | 17 |  |  |
| CO-31 | P3 | Track T2 page: five part cards in a fixed three-column grid leave an empty cell, and the cards stretch to equal heights with blank bottoms |  |  |  |
| CO-37 | P3 | Capstone and Rider project briefs stop at 620px inside an 832px card, leaving a 190px empty strip |  |  |  |
| CR-21 | P3 | Work dialog: the picture sits left with a 252 px empty strip beside it, the note is jammed under it, and nothing says when/where the piece w |  |  |  |
| CR-22 | P3 | Lesson spine's subject switch clips the active 'Creatives' pill on iPad landscape | 3 |  |  |
| CR-38 | P3 | References page: the lab's zoom − + Fit buttons are 24 px on iPad | 17 |  |  |
| EX-14 | P3 | Readiness 'Coverage' rows on iPhone ellipsise topic names while the Pacing note keeps full width | 3 |  |  |
| EX-15 | P3 | Exam season and Quiet the rest switches: 20px tall hit area on touch, and no role=switch | 17 |  |  |
| EX-17 | P3 | Pen and ink page leaves a dead block under 'On this device' on iPad landscape and Mac |  |  |  |
| EX-21 | P3 | Small touch targets in the assessment page: Goals '＋' is 12x44, 'Edit' 22x44, checklist boxes 18x18 | 17 |  |  |
| EX-22 | P3 | Planner allocation legend: a long name wraps under its colour dot, leaving the dot alone on a line |  |  |  |
| EX-41 | P3 | Post-mortem's empty state stretches 'Marks by question' into a 1166px pill under one short sentence |  |  |  |
| EX-46 | P3 | New assessment dialog: the two-column form leaves holes (Duration, Extra time, Target grade each alone on a row) and pre-fills the Title wit |  |  |  |
| GO-01 | P3 | First-goal template grid leaves an empty sixth column at 1470 (auto-fill) |  |  |  |
| GO-14 | P3 | iPhone: Domain filter pills overflow the screen edge as an undeclared, scrollbar-less scroller |  |  |  |
| GO-17 | P3 | 'Every week so far' history bars overflow and are cut off at the card edge on iPhone |  |  |  |
| HR-14 | P3 | Story player top controls: speed and close are below the 32px hit size and not the same shape as Pause | 17 |  |  |
| HR-15 | P3 | Week's plan card header wraps 'Pacing →' onto its own line and truncates every row title |  |  |  |
| JM-35 | P3 | Checkpoints page: cards in a row stretch to the tallest (two of three ~65% empty), each '✗ Not yet' wraps under its bar, and the subtitle sa |  |  |  |
| MI-12 | P3 | Inspector 'Ask Kurenai' grid: 'Explain it differently' overflows its button's padding at mac width |  |  |  |
| MI-19 | P3 | Mind polish: Journal card and empty Foundation strip leave large dead areas; selects render larger than the chips beside them; search glyph  |  |  |  |
| PR-18 | P3 | Reminders: complete circles are 32x32 on touch | 17 |  |  |
| PR-19 | P3 | Daily Review step tabs: the active tab's focus ring is clipped to two vertical crimson bars | 17 |  |  |
| PR-22 | P3 | Routines Today: three equal columns stretch the reviews and habits cards to the routine card's height |  |  |  |
| PR-36 | P3 | Daily habits editor: Save and Cancel sit inside the 'How habits work' help card, which stretches to the habit list's height |  |  |  |
| PR-37 | P3 | Touch sizes on Focus setup and Routines settings: selects 39 px tall, time inputs 42 px, switches 34x20 | 17 | fixed by AX-05 |  |
| PR-39 | P3 | Calendar event modal: Cancel floats in the middle of the footer on a new event |  | fixed by AX-13 |  |
| PR-40 | P3 | Routines Today: 'Today's three' rows clip their titles mid-letter with no ellipsis, and the ○ mark shrinks so rows misalign |  |  |  |
| PR-42 | P3 | Pacing 'Edit week' dialog on Mac: 'My week' sits alone on its own row under 'Week beginning' while 'School week' is in the row above |  |  |  |
| SH-14 | P3 | Help on iPhone: section chips wrap into a ragged left-aligned cloud | 3 |  |  |
| SH-17 | P3 | Collapsed rail (Mac, iPad portrait) is kanji-only with no tooltip and drops the due-count badge | 3 | fixed by AX-06 |  |
| SH-33 | P3 | iPad-portrait overlay rail: Escape does not close it, a tap on the page both closes it and activates what was under the finger, and its open | 3 |  |  |
| SH-38 | P3 | iPad touch targets in the shell: the rail toggle is 24x24 and the collapsed rail buttons are 30px wide (narrower than their own 32px tile) | 17 |  |  |
| SH-44 | P3 | iPhone in landscape gets the iPad shell with nothing for its height or the Dynamic Island: the rail's profile chip is cut off below the scre | 3 |  |  |
| ST-33 | P3 | Subject analytics tiles stretch to the side column: ~40% of each tile is blank and the explanatory sub-lines are screen-reader only |  |  |  |

### W4 — Money revamp (25)

| Id | Sev | Title | RC | Fixed by / depends on | Decision |
|---|---|---|---|---|---|
| MG-02 | P1 | Santander midata CSV is refused: 'Merchant/Description' and 'Debit/Credit' headers are not recognised | 11 |  |  |
| MG-03 | P1 | Import only reads the first line as the header: midata with a leading blank line or a semicolon delimiter, and Online Banking CSV with an ac | 11 |  |  |
| MG-04 | P1 | Santander's other exports (.txt, QIF, OFX) are not supported at all; the picker accepts .txt but cannot read it | 11 | after MG-01 |  |
| MG-05 | P1 | No way to see, undo or replace an import after the result dialog closes | 11 | after MG-01 |  |
| MG-06 | P1 | Unquoted thousands separators shift columns: '£1,234.56' imports silently as £1.00 | 11 |  |  |
| MG-07 | P1 | A recurring rule's 'Confirm' and an imported bank row for the same payment double-count | 11 | after MG-01 |  |
| MG-08 | P1 | Imported rows are unusable as information: raw bank strings, everything in Other, Type and Balance columns discarded ✎design | 11 | after MG-01 | yes |
| MG-10 | P1 | Import preview hides the payee and amount, and the Import button is below the fold | 11 |  |  |
| MG-24 | P1 | Re-importing the app's own CSV export turns every outgoing into income and files the category as a note | 11 |  |  |
| MG-26 | P2 | Amounts written as (3.45) or 3.45 DR import as money in | 11 |  |  |
| MG-27 | P2 | Editing a transfer into a move between two pots keeps the original and adds two new entries |  |  |  |
| MG-28 | P2 | Bulk 'Set category' puts income entries into spending categories |  |  |  |
| MG-29 | P2 | Recurring: an occurrence left unconfirmed for more than 14 days disappears; older months are never offered |  |  |  |
| MG-31 | P2 | Budgets: the Payday day picker does nothing while the month starts on the 1st, then Payday ignores the day you picked |  |  |  |
| MG-32 | P2 | New entry: switching Out to In keeps the Out category, so income is saved under Food while the picker shows Job |  |  |  |
| MG-33 | P3 | Import error rows read 'no date i can read' (lower-case I) | 11 |  |  |
| MG-34 | P3 | Editing a confirmed recurring entry's amount leaves Recurring showing the old amount |  |  |  |
| MG-35 | P3 | Transactions search ignores category names and amounts |  |  |  |
| MG-36 | P3 | A closed pot cannot be reopened, and the money still in it drops out of every view |  |  |  |
| MG-39 | P3 | Income categories can be added but never renamed, recoloured or archived |  |  |  |
| MG-40 | P3 | Month and year: a past month's category row opens Transactions on 'Everything', and Export CSV ignores the month on screen |  |  |  |
| MG-41 | P3 | Year view: 'Set aside · 2 pots' counts every open pot, and the dashed income line carries no amount |  |  |  |
| MG-42 | P3 | A subscription's price rise can never be recorded: setPrice has no caller, and editing the amount re-prices past occurrences |  |  |  |
| MG-43 | P3 | Import preview shows only the first 80 rows without saying so | 11 |  |  |
| MG-44 | P3 | CSV export does not neutralise cells that start with = + - @ (bank descriptions can carry formulas into Excel) |  |  |  |

### W5 — Cosmetics, shop and art (45)

| Id | Sev | Title | RC | Fixed by / depends on | Decision |
|---|---|---|---|---|---|
| PR-02 | P1 | Every page header shows the PREVIOUS page's painted band after in-app navigation | 10 |  |  |
| SC-01 | P1 | Shop avatar previews: the painted avatar escapes its disc (drawn top-left, overflowing the card) and the disc sits empty, offset | 10 |  |  |
| SC-02 | P1 | Try on panel's 'Buy · ◈ 4,500' button is illegible (dark ink on dark glass) | 10 |  |  |
| SC-03 | P1 | A painted frame on the Seat spills over 'Level 53', the title chip and past the stage edge | 10 | after SC-21 |  |
| SC-04 | P1 | Seals are sold as 'the topbar mark' but the topbar has no mark any more; the painted stamp art is never shown in use ✎design | 10 |  | yes |
| SC-05 | P1 | All 10 painted shelf skins and Shrine card styles never show: their picture URL resolves to /css/views/assets/... (404) | 10 |  |  |
| SC-06 | P1 | Shop frame previews: the avatar is a small disc lost inside a big painted ring (55px avatar in a 179px frame) | 10 |  |  |
| SC-07 | P1 | With a painted frame worn, every CSS frame card in the shop previews the WORN frame instead of its own | 10 |  |  |
| SC-08 | P1 | A painted frame on Home's hero and on the phone overlaps the greeting and is cut off by the hero's edge | 10 | after SC-21 |  |
| SC-20 | P1 | Worn painted avatars are clipped by their circle and sized inconsistently (fox ears, crane wings, lamp head, dragon tail cut; cat and lanter ✦art | 10 |  |  |
| SC-21 | P1 | Worn painted frames leave a dark empty band between the avatar and the ring (the ring's hole is ~75% of the art, the avatar is drawn at 66%) | 10 |  |  |
| AG-10 | P2 | Edit seat's '＋ Upload an image' uploads a new banner without the 'Your own picture' unlock | 10 |  |  |
| AG-17 | P2 | Gold Shop: one tap on Buy spends the gold (up to 10,000) with no confirm and no undo, and equips the item at once | 21 | fixed by AX-23 |  |
| AX-23 | P2 | Buy in the Gold Shop spends gold on one tap with no confirm and no undo | 21 |  |  |
| AX-36 | P2 | Looking at 'Your own' in the picture drawer replaces the slot's picture rule while it is locked | 10 |  |  |
| AX-39 | P2 | Light shop themes keep the dark-ground red: overdue day dots on Home fall to 1.3:1 in Washi Morning | 10 |  | yes |
| CC-19 | P2 | In the light shop theme Washi Morning, code in notes is nearly invisible: keywords 1.7:1, strings and numbers 1.3:1 | 10 |  | yes |
| SC-09 | P2 | Pen set 'Study set' (◈500) changes nothing: it maps the pen to exactly the default roles | 10 |  | yes |
| SC-10 | P2 | Repainted art for the original 16 cosmetics is imported but never used (frames, shelf skins, Shrine cards, seals) | 10 | after SC-05 |  |
| SC-11 | P2 | Shop Stage: no Kurenai mannequin unless an outfit is worn or tried; the third column is empty | 10 |  |  |
| SC-12 | P2 | Wardrobe: notebook papers and pen sets are shown as meaningless capital-letter tiles (K, D, I, M, M, 2 / S, E, S) | 10 |  |  |
| SC-13 | P2 | Avatar & profile stage: the painted frame clips into 'LIVE IDENTITY' / 'Level 53' and the stage's middle third is empty | 10 | after SC-21 |  |
| SC-14 | P2 | Focus scene 'First snow': secondary text on the running stage is unreadable over the bright window; the assignment chip runs off the left ed | 10 |  |  |
| SC-15 | P2 | Share-card finishes: the card looks nothing like the shop preview (Washi turns muddy brown), the finish reaches only the Reports card, and t ✎design | 10 |  |  |
| SC-16 | P2 | Ink toolbar's Paper button says 'Lined' on every bought paper (Kraft, Slate, Iso, Manuscript, Staff, 2 mm graph) | 10 |  |  |
| SC-17 | P2 | 'Try on' for Focus scenes, Shrine halls and share-card finishes shows nothing: the try-on ends the moment you leave the shop ✎design | 10 | after SC-33 |  |
| SC-18 | P2 | Preview sheet of an owned item is a dead end: no Use / Take off, no 'Owned' or 'In use' state, and half the dialog is empty | 10 |  |  |
| SC-19 | P2 | Two sources of truth for the Focus scene / Shrine hall / banner: the shop's 'Use' says 'In use' while the picture drawer's rule silently win | 10 |  |  |
| SC-22 | P2 | Ten of the 23 paid shop themes are near-copies of free Graphite (same near-black ground, accent within dE 2-6 of Graphite's crimson) ✎design | 10 |  | yes |
| SC-23 | P2 | Theme cards' lead swatch promises a colour the theme never uses as its accent (Azure Corset Noir, Porcelain Sky Night, Jade Camellia: blue/g | 10 | after SC-22 |  |
| SC-24 | P2 | Wardrobe chip names are cut off for 22 of the owned items (Exam se…, Moon ra…, The nigh…, every seal, most papers) | 10 |  |  |
| SC-25 | P2 | Switching between two painted avatars loses your own photo: taking the second off falls back to the default seal, not your picture | 10 |  |  |
| SC-26 | P2 | One click on a card's Buy spends up to 12,000 gold with no confirmation and no undo, and silently re-dresses the app | 10 |  |  |
| SC-27 | P2 | Owned 'Your own picture' unlocks: a 6-line green text block instead of a button, and no way to reach the picture drawer from the shop | 10 |  |  |
| SC-30 | P2 | Washi Morning (light shop theme, 1,500 gold) keeps the dark-ground red: every overdue/alarm text is 3.2:1 on its cards | 10,17 |  |  |
| SC-31 | P2 | Picture drawer 'Rotate by season / time of day' ignores what the pictures are: First snow never shows in winter, the rooftop and First snow  | 10 | after SC-19 |  |
| SC-33 | P2 | 'Try anything on before you buy' is not true for 65 of the items (avatars, frames, seals, banners, shelf skins, Shrine cards, papers, pen se | 10 |  | yes |
| SC-34 | P2 | Exam and Sketch pen sets barely differ from the default, label their swatches wrongly, and silently recolour every stroke already written | 10 |  | yes |
| AG-31 | P3 | Gold Shop Frames: the four drawn rings get short 112px tiles while the painted rings beside them get 235px squares | 10 |  |  |
| SC-28 | P3 | 'Kurenai bloom' frame (◈90) renders as eight blocky pink squares, not petals | 10 |  | yes |
| SC-35 | P3 | Two outfit descriptions do not match their art: 'Day off' promises a soft cardigan (art: a hoodie), 'Exam season' a blazer and lanyard (art: | 10 |  |  |
| SC-37 | P3 | Empty Wardrobe and Theme card waste most of the page: 12 cells of 'In the Gold Shop ->' with 120px gaps, a 2-card Theme row on a 1,200px car | 10 |  |  |
| SC-38 | P3 | A locked lab sends you to the top of the shop with no Buy here, never says it unlocks the whole Trace Lab, and repeats '180' on four cards | 10 |  |  |
| SC-41 | P3 | The free default theme (Atelier Dusk) shows 'In use' with a 'Take off' button that does nothing; taking off any theme stores the legacy id ' | 10 |  |  |
| SH-19 | P3 | Header controls on Graphite: the Assistant emblem is near-invisible and the four header controls are four different heights ✦art | 10 |  |  |

### W6 — Content quality (50)

| Id | Sev | Title | RC | Fixed by / depends on | Decision |
|---|---|---|---|---|---|
| CC-01 | P1 | IT spec text for F206.6.1, F204.6.5, F202.5.1, F201.5.2, F200.5.3 (and F200.2.x/F202.2.x) holds garbled PDF dumps of the assessment criteria | 7 |  |  |
| CC-02 | P1 | IT spec has a duplicate leaf: F206.6.1 'Ways to reflect' and 'Overview of the assessment' share a ref, so 'Ways to reflect' cannot be opened | 7 |  |  |
| CC-03 | P1 | Quiz answers are guessable: the correct option is A or B in 94% of CS questions (D only 12 of 1,347) and options are never shuffled | 8 |  |  |
| CM-01 | P1 | Specification tab shows garbled PDF-extraction text on most Maths leaves (M7.3 included) | 7 |  |  |
| CM-02 | P1 | Quiz answers are almost always A or B, and options are never shuffled | 8 | after CM-25 |  |
| CM-14 | P1 | Exam questions self-mark ignores the M1/A1 codes on Maths worked-derived items, and the Answer line counts as a mark |  |  |  |
| CO-04 | P1 | Task Run can only feed ONE line of input: a correct answer to any multi-line task crashes with ArgumentNullException |  |  |  |
| EX-01 | P1 | Marks by question: a question added with '＋ Question' can't be given its Max or its topic |  |  |  |
| CC-05 | P2 | Same past-paper question appears twice in a CS leaf's Exam questions (worked card + bank item): 202 duplicate groups across 88 of 131 leaves | 8 |  |  |
| CC-06 | P2 | Steps blocks in 4.5.x notes render prose as monospace code with literal **bold** and a redundant '1.' heading |  |  |  |
| CC-07 | P2 | ~30 CS flashcard decks ask the same fact twice ('Bandwidth?' + 'Define bandwidth.'), plus 11 cards duplicated across neighbouring leaves | 8 |  |  |
| CC-08 | P2 | IT F201 (the unit still to sit) is much thinner than CS: no worked answers, 3 exam items and 5–6 quiz questions per leaf |  |  |  |
| CC-14 | P2 | Derived exam items make the worked card's one-line 'Answer:' summary a tickable mark point, so full marks can be self-awarded with a real po |  |  |  |
| CC-17 | P2 | Self-mark tally ignores a worked step's own mark weight ('[3 marks]'), so 60 derived CS exam items cannot reach full marks from their real m |  | after CC-14 |  |
| CM-04 | P2 | A curriculum fork silently hides later curriculum upgrades (plausible cause of "M7.3 is basically bare") | 9 |  | yes |
| CM-05 | P2 | Bank files duplicate base flashcards and quiz items in the same leaf (17 exact repeats, about 45 same-answer groups) | 8 |  |  |
| CM-06 | P2 | Thin notes on core Pure and Applied leaves (depth very uneven: 200 to 8,700 words) |  |  |  |
| CM-07 | P2 | Statistics and Mechanics leaf titles are cut-off 80-character spec sentences, unlike the short Pure titles | 7 |  |  |
| CM-08 | P2 | Wrong flashcard answer: 9.3 Newton–Raphson from x0 = 0 gives x1 = −2.5, not 2.5 | 8 |  |  |
| CM-15 | P2 | 24 exam-style worked examples carry mark codes that do not add up to their stated marks | 8 |  |  |
| CM-16 | P2 | Newton–Raphson generator prints a 'Root estimate' that is not a root in about a third of its random examples |  |  |  |
| CO-17 | P2 | Concept id collision: 'validation' is defined for T2.17 and for B.8, and B.8's (loaded later) replaces T2.17's, so T2.17 has no concept of i |  |  |  |
| EX-33 | P2 | 'Mark it yourself' tally: rows show only a question number and anonymous '○ ✓' chips; 'Mark schemes ›' closes the dialog and throws away eve |  |  |  |
| JM-10 | P2 | Japanese learn session asks Listening first and buries every Reading facet (sibling tie-break sorts 'L' before 'R') |  |  |  |
| JM-11 | P2 | Sibling rule broken within a day: once one facet of an item is answered, its buried sibling becomes due the same day |  |  |  |
| JM-16 | P2 | Kana Writing reviews show the answer: the model glyph sits beside the pad on every review, so 'Write it' is a copying exercise graded as rec | 20 |  |  |
| JM-20 | P2 | Checkpoints are easier than '80% in every skill' suggests: the Hiragana checkpoint's 6 Listening questions are 3 two-choice items each asked | 20 |  |  |
| MI-03 | P2 | Mind ladder: most F1 concepts can never climb past Recall/Apply — 5 of 16 concepts have no route to any rung above Recall, only 3 can reach  | 20 |  |  |
| CC-09 | P3 | Bold containing an *italic* word renders literal ** in three IT F204 callouts |  |  |  |
| CC-10 | P3 | Flashcards filed under the wrong leaf |  |  |  |
| CC-12 | P3 | AQA mark-scheme shorthand (I., A., R., MAX, DPT) is used ~228 times with no explanation anywhere |  |  |  |
| CC-13 | P3 | Functional-programming code is tagged 'text' (no Haskell label or highlighting) and assembly shows the raw label 'asm' |  |  |  |
| CC-22 | P3 | Six CS quizzes ask the identical question twice (same stem, same answer), e.g. 4.9.4.6 '172.32.0.5 is' as Q1 and Q2 | 8 |  |  |
| CC-23 | P3 | A third of quiz explanations say nothing: 502 of 1,635 'why' lines are under 16 characters ('Definition.' ×44, 'See the notes.' ×10, 'Spec.' | 8 |  |  |
| CC-25 | P3 | IT exam mark schemes give one bullet per two marks, so the tally awards IT answers in steps of 2 (97 of 150 items) |  | after CC-17 |  |
| CM-09 | P3 | Cards filed under the wrong leaf | 8 |  |  |
| CM-10 | P3 | "Past-paper patterns" pages are one wall-of-text paragraph |  |  |  |
| CM-11 | P3 | 29 leaves have no figure where a picture would teach |  |  |  |
| CM-12 | P3 | Units such as "m s$^{-1}$" break across lines |  |  |  |
| CM-13 | P3 | Two-option quiz items in a 4-option quiz | 8 |  |  |
| CM-21 | P3 | A worked example citing two questions becomes a 4-mark exam item whose scheme covers 7 marks | 8 | after CM-14 |  |
| CM-22 | P3 | Normal-distribution generator writes the symmetric interval backwards, e.g. P(61 < X < 51) |  |  |  |
| CM-23 | P3 | Hypothesis-test generators draw contradictory set-ups (testing p < p0 with x far above the mean) |  |  |  |
| CM-24 | P3 | Seven Maths callouts use an undefined kind 'key' and render as an unlabelled teal Tip |  |  |  |
| CM-25 | P3 | Two bank items depend on the item before them and break when the quiz is shuffled (M8.4 'Tension then:') | 8 |  |  |
| CM-26 | P3 | 6.4 flashcard question mixes base 2 and base 10 in one garbled stem |  |  |  |
| CM-27 | P3 | A third of Maths quiz explanations are a bare label: 352 of 1,058 'why' lines are three words or fewer with no working ('Definition.' ×9, 'C |  |  |  |
| CM-28 | P3 | Four Pure leaf titles show raw caret notation ('e^x', 'Gradient of e^kx', 'Solving a^x = b', 'Differentiating x^n, e^kx…') in the spine, hea | 7 |  |  |
| EX-25 | P3 | Predicted paper 1 for CS Paper 2 totals 99 marks and 2 h 29 min against a 100-mark, 2 h 30 board paper |  |  |  |
| JM-04 | P3 | Mind path: Decisions and strategy units are numbered Y3.1/Y3.2/Y3.3 while every other unit is <path>.U<n> |  |  |  |

### W7 — Connected OS and honest numbers (99)

| Id | Sev | Title | RC | Fixed by / depends on | Decision |
|---|---|---|---|---|---|
| CL-45 | P1 | 'Recently updated' sorts by the row's last write, not by your list activity: provider metadata changes (AniList tag ranks, covers, totals) a | 12 |  |  |
| CR-25 | P1 | Rating a Creatives theory card never ticks the lesson's fourth check: syncAll() exists but nothing calls it, so mastery stays at 75% and the | 19 |  |  |
| GO-02 | P1 | UR-20 verified: Collection goal types read the whole vault, so a goal starting today is Met at once and pays the Goal getter badge | 20 |  |  |
| GO-06 | P1 | 'Keep a routine on N days' and 'A routine's streak' can never be linked to a routine: the editor has no routine field |  |  |  |
| GO-07 | P1 | 'A habit's streak' lists habits from the frozen pre-Routines store, so habits made in Routines can't be picked |  |  |  |
| GO-23 | P1 | UR-22 verified through Goals: one 0% quiz per topic turns five topics Green and completes 'Move topics to Green' at once | 20 |  |  |
| HR-01 | P1 | Mind and Creatives are pushed off-screen in Home's Continue row (fixed subject order, 4 visible, no scroll affordance) | 19 |  |  |
| HR-02 | P1 | Weekly/monthly reports saved before the history arrives are frozen as 'A quiet week for study' forever | 12 |  | yes |
| HR-04 | P1 | Home does not answer 'what next' for Code, Japanese, Mind, Creatives or Money ✎design | 19 |  |  |
| HR-05 | P1 | Home 'Study hours' and Reports 'Studied' measure different things (12h14m vs 2h32m for the same week) | 12 |  |  |
| HR-17 | P1 | Report words print 'undefined took the largest share' when Code, Japanese, Mind or Creatives got the most Focus time, and that text is saved | 12,19 |  |  |
| HR-31 | P1 | Reports count a title as active in the period for ANY journal event — a score change, a status tidy-up or a sync echo — so titles with no re | 12 |  | yes |
| JM-07 | P1 | 'Held in reviews' (4th lesson check) is never written to the progress record by reviews, so the inspector shows 3/4 · 75% while the stored s | 19 |  |  |
| MI-01 | P1 | The F1 checkpoint lesson (F1.8) can never reach Completed: its fourth check reads retrieval over the lesson's concepts, and a checkpoint les | 19 |  |  |
| ST-03 | P1 | 'Quiz best' shows a raw count as a percentage: 6 of 11 right reads 'Quiz best 6%' | 12 |  |  |
| AG-07 | P2 | 'Owned' means two different things: the Wall header and the Seat say 8 badges while the set panels and the Showcase show 21 | 12 |  | yes |
| AG-19 | P2 | Session Log shows a reward only for Focus (and re-prices it), never what quizzes, exams, cards, Code, Japanese, Mind or Creatives were paid; | 12 |  |  |
| AG-20 | P2 | Recovery dispatch promises that ticking 2 plan items restores HP, but plan ticks move no HP at all | 12 |  |  |
| CC-21 | P2 | IT desk's 'Start here' sends you to F200.1.1, a unit already sat and with no notes, instead of F201/F206 |  |  |  |
| CL-09 | P2 | Books status rail counts the whole module while the grid shows one lens ('All 1107' beside '738 series') | 12 |  |  |
| CL-10 | P2 | 'Hide amounts' does not hide money on the Wishlist, Mangaka or the Books shelf; currency is formatted three different ways | 12 |  |  |
| CM-17 | P2 | 'Retry the N missed' overwrites the topic's quiz score with the retry's: 9/13 then 4/4 records lastPct 100 and the head reads 'best 9/4' | 12 |  |  |
| CM-18 | P2 | One mediocre quiz makes a Maths topic 'Data says Green': the RAG starts at 100 and a 69% quiz only takes 8 points off | 20 | fixed by GO-23 |  |
| CO-06 | P2 | Continue keeps pointing at 1.1 after the learner has worked through 22 lessons |  |  |  |
| CO-07 | P2 | Retrieval's 'Next reviews will ask…' dates come from a hard-coded SM-2 formula and contradict the real FSRS schedule | 12 |  |  |
| CR-10 | P2 | A Writing study can be 'saved' with only the given setup text: the untouched 80% counts as made work | 20 |  |  |
| EX-40 | P2 | Start-by is too strict: a one-topic test 3 days away needing 30 minutes is born 'Start-by passed · 7 days ago' and lands in Needs attention | 20 |  |  |
| GO-03 | P2 | Repeating goals count activity from before the goal started in their first period (week and month) | 20 |  |  |
| GO-04 | P2 | Changing a repeating goal's 'week runs' or its repeat keeps the old periods: history fills with overlapping weeks and months |  |  |  |
| GO-05 | P2 | A met goal stays 'Met' after its target is raised or a manual count is lowered (10% shown as Met) | 20 |  |  |
| GO-08 | P2 | Stay-under goals on live state (No overdue assignment, Carry-overs cleared, Subscriptions below) flip between Missed and active and are judg | 20 |  |  |
| GO-11 | P2 | 'Review flashcards' and 'Keep recall' offer Japanese, Mind and Code but never count their reviews | 19 |  |  |
| GO-24 | P2 | Editing a 'Move topics to Green' goal's subject or topics keeps the old baseline, so it can be met instantly | 20 |  |  |
| GO-27 | P2 | Projected-recall goal with too little data shows '–' and a meaningless 'The line says 4.3%', without saying why | 20 |  |  |
| HR-08 | P2 | Report Focus heat map drops every block between 23:00 and 07:00 (late-night study vanishes; contradicts the Night Owl line) | 12 |  |  |
| HR-22 | P2 | A brand-new, empty account saves three weekly reports and a monthly one ('A quiet week for study', 0m) and Home announces them as '2 new' | 12 |  |  |
| HR-23 | P2 | Study-space time is in the totals but missing from every subject split (Home's Study hours bar, Reports' Activity chart, legend, story) | 12,19 | after HR-17 |  |
| HR-24 | P2 | Home's Focus card and hero keep saying 'Revise for <exam> · at 14:00' after the exam has been sat (all evening) |  |  |  |
| JM-02 | P2 | Mind lesson inspector has no status selector, confidence (RAG) or progress bar, unlike every other study space | 16 |  |  |
| JM-12 | P2 | One fast correct answer unlocks the Writing facet at once: 'R holds a week' is read as first-review stability ≥ 7 days, which a single Easy  | 20 |  |  |
| JM-13 | P2 | 'Passed the practice' ticks and the lesson pays 15 XP · 2 gold · +3 HP even when every answer in the learn session is wrong | 20 |  |  |
| JM-17 | P2 | Grades are more lenient than the rules say: a retry after 'near' can still grade Easy, and a stroke check 'accepted' (a stroke 'a little off | 20 |  |  |
| JM-19 | P2 | Media path projects absurd ranges from thin evidence ('Graded reader Level 1 · 2032 – 2084', 'A light novel · 2180 – 3559') once two weeks p | 20 |  |  |
| JM-21 | P2 | Japanese is missing from Goals and Reports: no goal type measures it and Reports has no Japanese facts, unlike Code (f.code, code-tasks/retr | 19 |  |  |
| JM-26 | P2 | The Assistant and the day model know nothing about Japanese: no ja_* read tool, and KOS.today/the reviews never mention Japanese reviews due | 19 |  |  |
| JM-27 | P2 | A passed checkpoint shows 'Passed · paid once' beside '10% ✗ Not yet' in every skill after a weaker retake — the last attempt's scores overw |  |  |  |
| MG-11 | P2 | Month and year: 'In' shows expected income as if received | 12 |  |  |
| MG-19 | P2 | Transactions 'This view' totals cover only the rows loaded so far | 12 |  |  |
| MG-30 | P2 | Money goals are met with no evidence: 'No-spend days' counts days with no entries at all, and 'Spend under' is met by an empty month | 20 |  |  |
| MI-04 | P2 | Evaluate is lost whenever a position is revised: the revise sheet starts with an empty objection/reply and the ladder reads only the latest  | 20 |  |  |
| MI-06 | P2 | Apply and Explain rungs are earned without showing understanding: Apply after the check has revealed the answer, Explain from one one-charac | 20 |  |  |
| MI-10 | P2 | Mind is barely joined to the rest of the OS: no Reports facts or milestones, Goals' card/recall types silently read 0 for Mind, and Home/Tod | 19 |  |  |
| PR-06 | P2 | Calendar has no Agenda (or Day) view on Mac or iPad; Agenda exists only under 700px ✎design |  |  |  |
| PR-11 | P2 | Reminders 'Today' leaves out overdue reminders |  |  |  |
| SH-06 | P2 | Phone search chips file Goals under 'Collection' and Reports/Files under a fake 'Pages' section | 13 |  |  |
| SH-07 | P2 | Global search cannot find app pages or features (typing 'money', 'goals', 'help', 'settings' finds no page) | 13 |  |  |
| SH-29 | P2 | Search ranks specification hits in syllabus order, not by relevance: 'binary' shows 'Fields, records and files' first and cuts 'Unsigned bin | 13 |  |  |
| SH-30 | P2 | Tapping a notification often lands on a generic page: Daily Review notices open Routines (not the review), routine-window notices ignore the |  |  |  |
| SH-34 | P2 | Kurenai cannot open 13 current pages: app_navigate's view list stops before Money, Reports, Routines, Files, Achievements, Connections, Stor | 4 |  |  |
| ST-27 | P2 | Opening a topic's Quiz tab writes a quiz record, and the subject desk then reports "Quiz best 0% · 0 attempts across 1 topic" | 12 |  |  |
| ST-30 | P2 | Due today reviews are logged with no subject or topic, even a one-topic run, so they never count for a subject's streak, the topic's session | 12 |  |  |
| AA-27 | P3 | Storage rounds small data to '0 KB' (a 5-byte file, 2 ink pages) while Pen and ink says '1 KB of ink' | 12 |  |  |
| AA-29 | P3 | A fresh install's first notification is backdated: '23 plan topics carried over into this week', dated Monday 08:00, before the app existed |  |  |  |
| AG-14 | P3 | 'First day' on the Seat can be later than the history it sits beside (138 days journeyed, first day 1 Nov 2026) | 12 |  |  |
| AP-19 | P3 | Writing, Files, Kurenai and Reports badges never hear their owners: they wait for the 30-minute sweep | 4 |  |  |
| AX-29 | P3 | The Wall says 'Owned 8 / 254' while its Earned filter and the showcase picker list 21 earned badges | 12 | fixed by AG-07 |  |
| AX-32 | P3 | Search cannot find a badge, a title, the Gold Shop or any page by name | 13 | after SH-07 |  |
| AX-33 | P3 | The Seat's 'First day' reads the state document's creation date, not your first record | 12 | fixed by AG-14 |  |
| CC-28 | P3 | Search finds a CS/IT topic only by its spec wording or flashcards: words taught in the notes, quiz and exam questions return nothing | 13 |  |  |
| CL-28 | P3 | Books card prints '0 ch' for a series read by the volume; long-form progress says '1 of 1 routes' / '1 hours' | 12 |  |  |
| CL-32 | P3 | Import and sync reports count every matched row as 'updated', even when nothing changed | 12 |  |  |
| CO-32 | P3 | Desk analytics: 'Tasks passed 28 / 30' means passed of tried, unlike every other 'x / y' tile, and its bar reads as nearly finished | 12 |  |  |
| CO-38 | P3 | Search finds Code lessons only under 'Specification' and never finds capstones, Rider projects or tasks | 13 |  |  |
| CR-23 | P3 | Tracks page: a track's bar says 33% while every unit row beside it says 0 / 3; an unreleased track draws a full-width empty bar | 12 |  |  |
| CR-33 | P3 | Desk 'Continue' points at the next study (A2.2) while the hero path and unit cards mark a different unit (A1) as current | 12 |  |  |
| CR-37 | P3 | Global search does not find Creatives work: Portfolio pieces and Writing Desk drafts never appear (lessons do, via the spec) |  |  |  |
| EX-24 | P3 | Analytics opens on the nearest assessment even when it has no evidence, while Calibration below counts every paper |  |  |  |
| EX-45 | P3 | Three different file-size formatters: the same 16-byte file is '1 KB' in Files, '0 KB' in Storage and '16 B' on a topic's Files tab; Storage | 12 |  |  |
| EX-47 | P3 | Readiness band prints 'limiting: RAG' under 'Not enough evidence' — a limiting signal named when there is no evidence at all | 20 |  |  |
| GO-09 | P3 | Reports drop repeating-goal periods that straddle a report boundary (weeks from a weekday, payday months) |  |  |  |
| GO-10 | P3 | A stay-under goal breached early never sends its 'Goal missed' notice |  |  |  |
| GO-18 | P3 | Spend-below goals are judged Met for months with no Money records at all | 20 |  |  |
| GO-19 | P3 | Hero's 'behind / on track / met this week' counts every open goal, not this week's | 12 |  |  |
| GO-26 | P3 | Met and missed goals stay pinned to the Morning Review and Home, using up the three pin slots |  |  |  |
| HR-13 | P3 | Focus overview headline and persona contradict ('most of them before noon' beside 'Night Owl'), and blocks outside 07-23 are drawn at the 07 | 12 | after HR-08 |  |
| HR-26 | P3 | Week report text says 'across 6 sessions on 7 of 7 days' next to a chart that shows Thursday at zero | 12 |  |  |
| HR-29 | P3 | Exam revision time on Home is matched by the session's objective text, so renaming the exam (or two exams with one title) breaks the goal | 12 |  |  |
| JM-30 | P3 | 'Type instead' on a kana Writing review passes the Writing facet for typing its romaji (e.g. 'a' for あ) | 20 |  |  |
| JM-32 | P3 | Three Japanese badges can never be earned (Voice, Immersion, Sentence miner) yet are registered as live badges, and Japanese reviews never r | 19 |  |  |
| JM-38 | P3 | The desk's Today plan budgets 'Input 8 · Output 7' minutes (and 'Say it · optional · 2 min' on the first day) for blocks the app cannot run, | 12 |  |  |
| MG-37 | P3 | With Hide amounts on, a money goal's figure reads '– / of · 8 of 30 days gone' | 12 |  |  |
| MI-15 | P3 | Checkpoint Argument Mapper: every claim starts as 'conclusion', the warning says 'Two conclusions' for five, and an untouched map still earn | 20 |  |  |
| PR-20 | P3 | Evening review: 'Tomorrow's first task' says nothing is due while overdue plan rows exist; lesson rows show bare dashes |  |  |  |
| PR-32 | P3 | Auto-tracked Focus habits count aborted sessions and split a late-night session at midnight instead of at the routine day start | 20 |  | yes |
| PR-35 | P3 | A routine's time window never closes it: a Morning routine played at 19:00 is kept, paid and streaked as on time | 20 |  | yes |
| SH-18 | P3 | Search result sub-lines print raw data: 'Due 2026-10-28', goal status 'completed'/'active' | 13 |  |  |
| ST-31 | P3 | Subject analytics "Started" says "opened at least once" but counts only topics given a status by hand |  |  |  |
| ST-37 | P3 | Today so far's "Time" never counts a review: the flashcard engine logs no duration | 12 |  |  |
| ST-40 | P3 | Assignment progress has two owners: the editor's Progress % is silently overwritten by the subtasks | 12 |  |  |

### W8 — Maintainability, performance and docs (23)

| Id | Sev | Title | RC | Fixed by / depends on | Decision |
|---|---|---|---|---|---|
| AA-16 | P2 | Help & Guide is badly out of date: no entry for the Assistant, Money, Goals, Reports, Exams hub, Code, Japanese, Mind, Creatives, Achievemen | 13 |  |  |
| AG-08 | P2 | Every Wall tab (and the Seat's showcase arc) waits 1.6-6 s on 'Reading your records…' because list() re-walks the whole vault each time | 14 | fixed by AX-25 |  |
| AP-03 | P2 | Cold-path cost after boot: the first render of each heavy view takes 0.5-2.8 s on the dense account (Exams, Code map, Due, Pacing, Calendar) | 14 |  |  |
| AP-04 | P2 | The four study spaces each re-implement the same lesson machinery (paged reader with dwell, evidence, syncChecks, award, planDay), and the c | 16 |  |  |
| AP-05 | P2 | README, AGENTS, PROGRESS and HANDOFF each name a different 'current' release and smoke gate; Mind and Creatives are still listed as planned | 13 |  |  |
| AP-06 | P2 | In-app Help & Guide has no entry for Japanese, Mind, Creatives, Money, Goals or the Google/Todoist connections | 13 | fixed by AA-16 |  |
| AP-07 | P2 | The public repository tracks personal data and one-off clutter at its root (an AniList/MAL export, local Claude settings, spec PDFs, repair  | 13 |  | yes |
| AP-09 | P2 | hub.js is a 3,899-line grab bag: Home (~900 lines), the subject page, a 953-line KOS.views.ref topic function, Backup & Restore, the header  | 16 |  |  |
| AP-15 | P2 | Badge measuring runs synchronously on the main thread: the Governor's Seat measures all 254 badges twice per render, and every topic tick re | 14 |  |  |
| AP-18 | P2 | Every boot runs the exam cap pass over all cards (0.7-1 s) and readiness about fifteen times before the first page settles | 14 |  |  |
| AX-25 | P2 | The Wall, the Seat's showcase and Edit your seat wait 7-12 s on a dense account because every open re-measures all 254 badges | 14 |  |  |
| CL-05 | P2 | Mangaka takes ~3 s to render on the dense account (reads and groups every book on each open) | 14 |  |  |
| SH-10 | P2 | In-app Help & Guide is missing most features released since mid-October (Money, Goals, Reports, Exams hub, Code, Japanese, Mind, Creatives,  | 13 |  |  |
| SH-11 | P2 | Help & Guide entries that are now wrong | 13 |  |  |
| AP-11 | P3 | ~110 lines of dead CSS: the retired Habits page (79 lines of .k-hb-*) and canvas-era lab classes | 13 |  |  |
| AP-13 | P3 | Date and formatting helpers are re-implemented per file (pad x18, addDays x14, iso/isoOf x16, hm x11, rid x8) | 16 |  |  |
| AP-20 | P3 | CLAUDE.md is 186 KB (2,415 lines) loaded into every agent session, and its 271-line Current baseline is a release diary with stale entries | 13 |  |  |
| AX-20 | P3 | Help & Guide describes screens that no longer exist, and its last section has no mark | 13 | fixed by SH-11 |  |
| AX-34 | P3 | Help & Guide says nothing about the Wall, titles, Try on or 'Your own picture', and still says gold buys only unlocks and cosmetics | 13 | fixed by SH-10 |  |
| EX-16 | P3 | Files list silently stops at 300 files | 14 |  |  |
| SH-31 | P3 | ui.js still keeps a second, dead navigation stack (navHist/navFwd, KOS.back/forward/canBack) that the router overwrites | 16 |  |  |
| SH-32 | P3 | docs/GUIDE.md (the plain-words guide) stops at 26 Oct: Creatives and Mind are listed as 'still on the way', and Achievements, Connections, t | 13 |  |  |
| SH-42 | P3 | <body> also carries data-theme ("legacy hook, harmless"), so every derived token is re-derived on body: anything that sets the theme on <htm | 16 |  |  |

### W9 — Polish and HCI (200)

| Id | Sev | Title | RC | Fixed by / depends on | Decision |
|---|---|---|---|---|---|
| AA-03 | P2 | Composer hint 'Shift + Enter for a new line' floats mid-height while the send button sits at the bottom |  |  |  |
| AA-04 | P2 | Opening a Morning/Evening review notification lands on Routines Today and never opens the review |  |  |  |
| AA-05 | P2 | History's 'Open Account & Cloud Sync' button opens the Collection's Sync & Import page, which has no sign-in |  |  |  |
| AA-06 | P2 | Every 'sign in first' message points to 'Archive → Account & Cloud Sync', a page that does not exist, and offers no button |  |  |  |
| AA-07 | P2 | Activity (signed out) shows every action as 'Proposed … Started' forever, with no time |  |  |  |
| AA-18 | P2 | Assistant Settings' 'Simple data requests' route is a dead control: nothing ever asks for the crud category, yet its 'Ollama · no model set' |  |  | yes |
| AA-19 | P2 | Permissions offers 'Ask first' for read-only tools, but a read tool set to Ask first still runs without asking |  |  | yes |
| AG-04 | P2 | Progress ping overflows its card when the badge name is long |  |  |  |
| AG-05 | P2 | A ping shows on top of the unlock overlay (and above any dialog) when a tier and a ping arrive in the same sweep |  | after SY-23 |  |
| AG-09 | P2 | Edit seat's showcase picker: 21 badge buttons with no name, visible or accessible |  | fixed by AX-35 |  |
| AG-22 | P2 | Edit seat: choosing a title or a seal rebuilds the editor and drops keyboard focus to <body>; the radio groups have no arrow keys | 17 |  |  |
| AX-02 | P2 | Undo in toasts cannot be reached by keyboard or screen reader | 17 |  |  |
| AX-03 | P2 | Focus chime is silent on iPhone/iPad and has no on/off or volume setting | 17 |  |  |
| AX-08 | P2 | The document title never changes: every page is 'Kurenai OS — Study Atelier' | 17 |  |  |
| AX-35 | P2 | Edit your seat's showcase picker is 21 unnamed buttons |  |  |  |
| CL-02 | P2 | Collection Overview prints zero-only facts and truncates them on the module cards |  |  |  |
| CL-03 | P2 | 'Where each medium stands' card renders a legend over an empty body on an empty account |  |  |  |
| CL-04 | P2 | Mangaka is marked as the Anime page (strip lights Anime; phone header reads 'Anime') |  |  |  |
| CL-18 | P2 | Wishlist priority can only be set by HTML5 mouse drag: no keyboard path, no grip in Want to buy, unreliable on iPad touch (bypasses KOS.ui.r |  |  |  |
| CL-20 | P2 | After Mark purchased, the Money confirmation and its 'View in Transactions' action are overwritten at once by the Collection handoff toast |  |  |  |
| CL-23 | P2 | A filter that matches nothing offers 'Bulk add' and 'Add one game' but no 'Clear filters' |  |  |  |
| CL-27 | P2 | Find new (Anime/Books) without AniList connected lets you search and pick, then toasts a self-contradicting message: 'added locally only. No |  |  |  |
| CM-20 | P2 | On iPhone the Maths plot labs draw their axis numbers at 5.7px (half the 11px label floor) |  |  |  |
| CO-09 | P2 | On iPhone every Code sub-page loses its own title: a task, a track, the skill map, katas and settings all read just 'Code' |  |  |  |
| CO-18 | P2 | Code settings: 'Practice focus' slider is permanently disabled, whatever tracks are started |  |  | yes |
| CO-19 | P2 | SQL tasks: a slow first SQLite load fails a correct answer as an infinite loop, and the kill makes every retry cold again |  |  |  |
| CO-21 | P2 | Error and runtime cards: the heading ('✗ Compile error', '◇ The in-app runner can't run this') is near-black on a dark card | 17 |  |  |
| CR-05 | P2 | Daily Creative card in Exam Season is a tall empty card with no way to do today's study anyway |  |  |  |
| CR-08 | P2 | A Writing study's '▶ Start' (and a project's 'Write it') makes a NEW draft every time instead of reopening the unfinished one |  |  |  |
| CR-09 | P2 | Writing Desk 'Save to Practice Log' (and Add your work's Save) saves twice on a double tap |  |  |  |
| CR-11 | P2 | Writing Desk drafts cannot be deleted or tidied: every 'New draft' and every study Start adds a permanent row |  |  |  |
| CR-12 | P2 | Lesson inspector checklist: each label sits half a column away from its checkbox (.k-cr-check class collision) |  |  |  |
| CR-14 | P2 | The check page shows an Art study's 'Expected beginner output' as text only: the beginner picture is dropped |  |  |  |
| CR-26 | P2 | Creatives settings 'Minutes' (10/20/30 min, 'How long a day's study runs') changes nothing: the Daily Creative ignores it |  |  | yes |
| EX-04 | P2 | A transparent PNG pasted or dropped onto an ink page gets a black background |  |  |  |
| EX-07 | P2 | Files list is one big aria-live region: every keystroke in search re-announces up to 300 cards |  |  |  |
| EX-09 | P2 | Exam Room text over the classroom painting is low-contrast (blacklist on Mac, plan line on iPad) |  |  |  |
| EX-11 | P2 | Planner's 'Next week' preview is one run-on paragraph of titles and times |  |  |  |
| EX-29 | P2 | Post-mortem headline reads '40 of null.' (and 'of null' under the big figure) for an attempt logged without 'Out of' |  |  |  |
| EX-30 | P2 | Companion hero always says 'Start the rapid drill · 15', even when the scope has nothing to drill (it opens '0 of 0 right · 1 min') |  |  |  |
| EX-32 | P2 | Timed paper with Rest breaks off: Pause hides the clock as 'Paused' while the paper's time keeps running, and time-up never fires while paus |  |  |  |
| EX-35 | P2 | Files' subject filter chips read inverted: the selected chip is the dark one, the unselected chip looks highlighted |  |  |  |
| EX-37 | P2 | Answer pad (Write) inherits a tool its bar doesn't offer: pick Ruler on a Handwritten page and every answer pad opens with the ruler across  |  |  |  |
| GO-16 | P2 | iPhone: the goal's pace chart labels shrink to about 6px |  |  |  |
| HR-06 | P2 | Hero 'Daily goal' counts 5 items but shows only 3, with no way to reach the other 2 |  |  |  |
| HR-11 | P2 | Upcoming caps at 3 rows: two overdue assignments hide the mock exam 4 days away, with no 'N more' and a link to Assignments only |  |  |  |
| JM-14 | P2 | A Japanese leech (8 lapses) leaves the schedule for good: Rework rows are inert text with no way to relearn or put the facet back, and a lee |  |  |  |
| JM-15 | P2 | Three promises the Japanese space cannot keep: 'Input this week' never fills (addInput has no caller), the Speaking switch changes nothing,  |  |  |  |
| JM-18 | P2 | '▶ Practise again' on a finished lesson opens an empty session ('Nothing due right now') and sends you to the desk, not back to the lesson |  |  |  |
| MG-12 | P2 | 'Never printed' card shows designer rules to the user |  |  |  |
| MG-13 | P2 | Money's section tabs jump between pages (Add entry button appears on some pages only) |  |  |  |
| MG-16 | P2 | Goal page: status chip unreadable on the painted band, and a mostly empty page |  |  |  |
| MG-18 | P2 | CSS class collision: first-run steps and the import stepper share .k-mn-steps/.k-mn-step, breaking both |  |  |  |
| MI-07 | P2 | Exam Season Daily 15 with no cards due still offers '▶ Reviews · 5 min', which ends instantly as 'Done for today. 1 minute.' |  |  |  |
| MI-08 | P2 | Ask Kurenai offline: 'Saved to ask when you're online. You will see "What is sent" again' — the queue is written and never read |  |  | yes |
| MI-09 | P2 | Journal entries cannot be edited or linked to a concept after capture, though capture says 'Link a concept later' |  |  |  |
| PR-05 | P2 | Afternoon review time strip: end label '22:00 夜' overprints the last hour tick; 30-minute block text wraps to two lines |  |  |  |
| PR-25 | P2 | '+ New routine' with a single step silently becomes a habit and disappears into Daily habits |  |  |  |
| SH-09 | P2 | Phone ⋯ tools sheet drops the group labels: Governor's sheet shows bare 'Live Full Off' and 'Mine Empty Sample' with no idea what they contr |  |  |  |
| SH-12 | P2 | Review chip menu never names the review on iPhone ('Open · ready' / 'Skip review'), and Skip has no undo |  |  |  |
| SH-24 | P2 | The installed app has no Back control at all: the header's ‹ › were removed and iOS Home Screen apps have no browser Back |  |  |  |
| SH-26 | P2 | Opening the bell puts focus on 'Mark all as read': one Enter/Space after opening clears every unread notice on every device, with no undo |  |  |  |
| SH-28 | P2 | Toast 'Undo' is unreachable without a pointer: the button is tabindex=-1 inside the aria-hidden #toast, and the spoken message never says Un | 17 | fixed by AX-02 |  |
| SH-35 | P2 | No first run: a new device opens straight onto a busy Home that is already "23 behind" with 3 unread notices, and nothing offers to sign in  ✎design |  | after SH-27 | yes |
| SH-36 | P2 | One toast slot: each new toast replaces the last, so in the Daily Review (or Home's Today ticks) only the most recent triage can be undone;  | 17 | after AX-02 |  |
| ST-10 | P2 | Assignment list rows draw a rule through the middle: .k-asg-sub is two different things |  |  |  |
| ST-13 | P2 | Due today's progress meter draws one pip per card: a 308-card queue is a 108px wall of 308 dashes |  |  |  |
| ST-14 | P2 | Card stats' RAG column is always empty: the dot is a 0x0 inline span |  |  |  |
| ST-16 | P2 | Card stats' Due forecast draws the coming days' bars in --s3, darker than the card they sit on (near invisible) |  |  |  |
| ST-28 | P2 | Assignment status buttons: a finished assignment shows two "↺ Reopen" buttons that do different things, and an open one offers "Reopen" to m |  |  |  |
| AA-08 | P3 | Assistant's side status card prints the full error as an uppercase letter-spaced eyebrow, cut off mid-word |  |  |  |
| AA-09 | P3 | Verified-action card shows internals: raw tool id, 'done', and 'Target · #1' |  |  |  |
| AA-10 | P3 | No space between consecutive blocks in an Assistant reply (table runs straight into the code block) |  |  |  |
| AA-21 | P3 | Morning Review text has a double full stop and lower-cases the warning's title ('revision block 24 is 7 days away..') |  |  |  |
| AA-24 | P3 | Account & Cloud Sync card still says attachment files upload only with 'Sync files now' |  |  |  |
| AA-25 | P3 | A scheduled message cannot be edited, its row repeats the time and uses a bare checkbox instead of the app's switch |  |  |  |
| AA-28 | P3 | Archive pages disagree on their kicker: 'The archive · 通' on Backup, Help and Notifications, 'Settings · 庫' on Storage, Pen and ink and Conn |  |  |  |
| AG-12 | P3 | A four-tier badge's tiers wrap 3 + 1 in the set dialog, leaving the fourth alone on a second row |  |  |  |
| AG-13 | P3 | HP preview's 'Off' button actually previews Critical (0 HP) |  |  |  |
| AG-16 | P3 | A partial showcase fills the Seat's arc from the bottom-left, leaving the top and right of the arc empty |  |  |  |
| AG-23 | P3 | Edit seat preview is aria-hidden but three of its controls stay in the Tab order |  |  |  |
| AG-24 | P3 | Four titles start with a lowercase "the" ("the Early Riser", "the Unbroken", "the Clear-Eyed", "the Steadfast") while the rest are bare noun |  |  | yes |
| AG-26 | P3 | Unlock overlay polish: the unit is said twice ("1,000 hours · hours of games played"), the "And N more" frame is blank for 1.5 s, and its Vi |  |  |  |
| AG-27 | P3 | The Seat still speaks of access: "current access state" in the sub-line and "Healthy · all open" under Live HP, though HP gates nothing |  |  |  |
| AG-28 | P3 | Recent lists every tier of a badge as its own row, all dated the first sweep, and on iPhone the date drops to an orphan line under the medal |  |  |  |
| AX-09 | P3 | No haptic or tactile-equivalent feedback anywhere on iPhone/iPad | 17 |  |  |
| AX-10 | P3 | Error toasts show raw exception text ('Save failed: <err.message>') |  |  |  |
| AX-14 | P3 | Reduced motion is not honoured by JS smooth scrolling | 17 |  |  |
| AX-16 | P3 | Inconsistent button wording: two plus glyphs, an empty state naming a button that does not exist |  |  |  |
| AX-17 | P3 | Tab strips declare role=tablist/tab but ignore arrow keys and have no tabpanel | 17 |  |  |
| AX-19 | P3 | Goals opens on a blank page (no loading state) until the async compute returns |  |  |  |
| AX-30 | P3 | Shop actions (Try on, Use, Take off, Buy) drop keyboard focus to the page and announce nothing for Try on |  |  |  |
| AX-31 | P3 | Badge dialog lays a four-tier badge out 3 + 1, leaving the fourth medal alone on a second row |  | fixed by AG-12 |  |
| AX-40 | P3 | Showcase and Seat saves are spoken twice (toast plus a second announce) |  |  |  |
| AX-41 | P3 | The picture drawer's Rotate thumbnails are buttons that do nothing |  |  |  |
| AX-44 | P3 | Assistant: Hide / Show Kurenai and Voice redraw the whole page and drop focus; the chips are 21px tall on the iPad |  |  |  |
| CC-24 | P3 | Copy on a worked example pastes 'Write it out' as its first line and every formula one symbol per line |  |  |  |
| CC-26 | P3 | Notes diagram buttons promise 'Open simulation →' but 8 of them open a gold-locked lab with no hint on the button |  |  |  |
| CL-12 | P3 | Favourite heart on vault cards is a generic 'Toggle favourite' with no visible label and an easy mis-tap |  |  |  |
| CL-13 | P3 | Spotlight says 'the last one is next' when every route/episode is already done |  |  |  |
| CL-14 | P3 | Seasonal hero's art credit is unreadable on the painted scenery (Mac/iPad) |  |  |  |
| CL-22 | P3 | Want to buy rows label the purchase action 'Purchased' (reads as a status) while the hero and dialog say 'Mark purchased' |  |  |  |
| CL-29 | P3 | Editor header shows the browser's broken-image glyph when a cover URL fails (cards fall back to the kanji placeholder) |  |  |  |
| CL-30 | P3 | VN 'What counts as progress' offers no Percentage option, so the % mode the schema and editor support is unreachable for new titles |  |  |  |
| CL-31 | P3 | Score lives in a different place in each vault editor: Books puts an unlabelled '– / 10' box in the header, the others a 'Score /10' field t |  |  |  |
| CL-33 | P3 | Autonomous sync card says 'On' and runs cycles with no provider connected, and prints the last cycle twice |  |  |  |
| CL-34 | P3 | XML-imported Anime rows can never be deleted without AniList, and a Completed show with no episode total still offers '+1 · Log episode 31' |  |  |  |
| CL-35 | P3 | Bar charts clip the value label of the tallest bar (Score distribution '168', medium charts '222') |  |  |  |
| CL-36 | P3 | Wishlist 'Purchased' tab is still laid out as a buy queue: priority ranks #1–#8, 'AVAILABLE NOW' / 'PRE-ORDER · IN 30 DAYS', sorted by prior |  |  |  |
| CL-37 | P3 | Renaming or deleting a custom list that came from AniList is undone by the next pull (and a rename leaves both names) |  |  |  |
| CL-39 | P3 | Books 'Owned vs read' bars have no visible track (track colour = box colour) and the two 'one scale' bars get different lengths |  |  |  |
| CL-41 | P3 | Games copy contradicts itself about importing, and the Steam dialog signed out is a dead end with no button to sign in |  |  |  |
| CL-42 | P3 | Dialogs opened from a vault's Actions menu return focus to the top of the page ('Skip to content') when closed |  |  |  |
| CL-43 | P3 | 'Genres' charts list tags truncated to identical labels ('Protagonist with a Tra…' ×7) |  |  |  |
| CL-44 | P3 | An empty vault still draws the full status rail of zeros and every toolbar control (sort, Filters, layout, search) around the empty state |  |  |  |
| CO-13 | P3 | Phone 'Best on a computer' task shows the example OUTPUT without its input |  |  |  |
| CO-14 | P3 | Rider project's 'Lessons it proves' is string-sorted: 10.1, 10.10, 10.2, 10.3 … |  |  |  |
| CO-15 | P3 | After a task passes the page offers no next step and its clock keeps running |  |  |  |
| CO-16 | P3 | Daily 20 marked Done still says 'you haven't proven Input loops in code yet' |  |  |  |
| CO-23 | P3 | On the Katas page the section strip lights 'Code' instead of 'Katas' |  |  |  |
| CO-24 | P3 | Code settings states the in-app runner's time limit as 2 seconds; the runner actually allows 2.5 s and the watchdog 4 s |  |  |  |
| CO-25 | P3 | 'See the answer?' says only today's first pass loses its reward; in fact the task never pays again |  |  |  |
| CO-26 | P3 | Task page: the Problems tab says 0 while it lists the compile error from Run |  |  |  |
| CO-27 | P3 | Runtime card on a task says 'You can still read the listing and its output below' — there is no listing below |  |  |  |
| CO-28 | P3 | Check on a unit 7+ task without the runtime reports 'Compile error RUNTIME' |  |  |  |
| CO-29 | P3 | Retrieval due list and skill map truncate the names the learner needs (lesson and card titles end in '…') |  |  |  |
| CO-33 | P3 | Unknown Code ids leave the bad URL in the address bar while another page is drawn |  |  |  |
| CO-34 | P3 | 'For the computer' shows only the newest four saved tasks and offers no way to reach the rest |  |  |  |
| CO-35 | P3 | Retrieval 'Due' listbox: arrow keys move a selection screen readers never hear, and the card does not follow until Enter |  |  |  |
| CO-36 | P3 | With 'Phone tasks' switched off, a unit 1–3 task on the phone says 'This one needs a wide editor' and gives no way back |  |  |  |
| CR-24 | P3 | Palette drill: the Hue sliders are plain accent bars with no spectrum and no value, so you pick a hue blind |  |  |  |
| CR-30 | P3 | Creatives settings 'Your days': tapping the last remaining day does nothing, with no message |  |  |  |
| CR-35 | P3 | On a rest day the Daily Creative card says only 'Next on Monday': no way to do today's study anyway, and due theory cards are hidden |  |  |  |
| CR-36 | P3 | 'Add your work' accepts confusing input: every piece is 'Untitled' and has no track, a link without https:// is refused as 'Choose a file or |  |  |  |
| CR-39 | P3 | A check link to a work that is not on this account ('Nothing to check here') is a dead end with no way onward |  |  |  |
| EX-13 | P3 | Pen and ink says a pen without pressure follows 'speed and tilt'; tilt is never read |  |  |  |
| EX-18 | P3 | Exam Room's keep-awake is lost after the iPad is switched away and back |  |  |  |
| EX-19 | P3 | Marks page: 'Use 19 · Keep 40' are unstyled text links that wrap apart, and a 'Keys · no mouse needed' card shows on touch devices |  |  |  |
| EX-20 | P3 | Exam Room's countdown says 'until 09:00' when the exam is weeks away |  |  |  |
| EX-23 | P3 | Practice attempts: an unlabeled checkbox on every row |  |  |  |
| EX-26 | P3 | Handwritten tab tells you pages 'stay on this device', but ink syncs to your account when signed in |  |  |  |
| EX-42 | P3 | Timed paper: a reload does not come back paused, contrary to the module's documented contract |  |  |  |
| EX-43 | P3 | Paper library says your PDFs 'never sync … and are never uploaded' while offering 'Keep in my cloud' and showing a 'Synced' row |  |  |  |
| EX-44 | P3 | Scan pages dialog: an emoji camera icon, instructions shown before any photo, and a 'Remove this page' button styled like a disabled primary |  |  |  |
| EX-48 | P3 | Practice's empty state points to a '+ Log entry' button that does not exist (the button is '+ Log a result') and offers no action of its own |  |  |  |
| GO-15 | P3 | A custom manual goal is filed under Collection |  |  |  |
| GO-20 | P3 | Home's Goals card: an unlabeled number in each ring and doubled units ('5 blocks of 30 blocks') |  |  |  |
| GO-21 | P3 | Phone search sheet files Goals under Collection |  |  |  |
| HR-12 | P3 | Home Goals list: the ring's number (days left) has no unit and is hidden from assistive tech |  |  |  |
| HR-27 | P3 | Home's Upcoming shows raw subject ids ('4 days overdue · compsci', 'NEA milestone in class · compsci') |  | after HR-17 |  |
| HR-28 | P3 | Routines card hides most habits with no 'N more' (a due routine leaves room for 2; an odd count drops one) |  |  |  |
| JM-05 | P3 | Japanese lesson inspector reads '0 of 1 sessions' |  |  |  |
| JM-28 | P3 | Multiple-choice exercises never show which option was right after a wrong pick |  |  |  |
| JM-29 | P3 | Session runner leaks internal exercise-family codes ('A · read it', 'C · read and understand', 'D · listen and pick') into the skill line |  |  |  |
| JM-31 | P3 | Minimal-pair options render the kana in the UI font at 15px with the beat count glued on ('ケキ2 beats') |  |  |  |
| JM-33 | P3 | VN scene text box is role=button yet contains the Voice, English and From the start buttons (nested interactive controls) |  |  |  |
| JM-34 | P3 | Lesson Practice tab promises 'reading, then writing and listening … read it, write it, hear the difference', and lists 本 twice as identical  |  |  |  |
| JM-36 | P3 | Badge unlock overlay reads '1 checkpoints · japanese checkpoints passed' |  |  |  |
| JM-37 | P3 | Reference mode replaces the lesson inspector with the notes' 'On this page' list on every tab — the status, checks and evidence disappear, a |  |  |  |
| JM-39 | P3 | Skill map Fluency card sets prose in the monospace figure style ('Drill kana to time it', 'Time a reading in the reader (Stage 1)') and poin |  |  |  |
| MG-22 | P3 | Goals: zero counts printed and empty-state card leaves a dead half |  |  |  |
| MG-38 | P3 | Recurring rule rows are role=button cards that contain buttons |  |  |  |
| MI-13 | P3 | Dialogue 'Skip to summary' on the first question gives an empty '0 turns' summary, and 'Save to Journal' saves an empty Reflection (counted  |  |  |  |
| MI-14 | P3 | Ask Kurenai's 'What is sent' pre-ticks the explain-back under 'Extras · tick to include', summarises instead of printing the payload, and sa |  |  |  |
| MI-17 | P3 | Concept neighbours ('the opposite of · Straw man', 'leads to · Steelmanning') are plain chips, not links to the concept or its lesson |  |  |  |
| MI-18 | P3 | Positions page never says when a position comes back, and Keep/Retire act instantly with no undo |  |  |  |
| PR-14 | P3 | Daily Review marks sit in the Week view's all-day row and their time is truncated away |  |  |  |
| PR-15 | P3 | Routines: page-header 'Templates' button duplicates the Templates tab 60px below |  |  |  |
| PR-16 | P3 | Daily habits card repeats the page sub-line, truncated, and has no add button when empty |  |  |  |
| PR-17 | P3 | Session review repeats '36-day streak' four times and hides what the bonus gold was for |  |  |  |
| PR-21 | P3 | Running Focus in a break: red 'End early' stays in the header beside 'End session' |  |  |  |
| PR-29 | P3 | Afternoon review 'Tomorrow' on a plan row says 'moved to tomorrow' when nothing moved |  |  |  |
| PR-30 | P3 | Time-left strip's end label always reads the evening review time even when the strip runs past it (after ~21:00 two '22:00' labels, or the t |  | after PR-05 |  |
| PR-31 | P3 | Review times can be set out of order and a later slot then folds a review that has not happened yet |  |  |  |
| PR-34 | P3 | Routine player's finish screen says '炎 1 days' |  |  |  |
| PR-38 | P3 | Morning review summary prints '11 days away..' and lower-cases the exam's name |  |  |  |
| PR-41 | P3 | Reminder alert notifications read 'Reminder · due 10 minutes to go' / 'due 1 day to go' |  |  |  |
| PR-43 | P3 | Achievement progress pings sit exactly over the section strip (Productivity/Study pills) and blend with it while fading |  |  |  |
| SC-36 | P3 | Edit your seat: the aria-hidden preview still holds three keyboard-focusable buttons (Study, Rest rhythm, 'Open full log ->'); Enter on the  | 17 |  |  |
| SC-39 | P3 | Gold is drawn with two different glyphs: ◈ in the Gold Shop, ◆ in the HUD, Seat, labs and rewards | 12 |  |  |
| SC-40 | P3 | Every shop action (Buy, Use, Take off, Try on, Pin) rebuilds the whole shop and drops keyboard focus to <main> | 15 |  |  |
| SH-15 | P3 | document.title never changes: every page, history entry and app-switcher card reads "Kurenai OS — Study Atelier" | 17 | fixed by AX-08 |  |
| SH-16 | P3 | Unknown or stale deep links fall back silently (to Home, or to a list) with no message |  |  |  |
| SH-39 | P3 | A hidden live region announces a bare number ("545") at boot: #node-count is aria-live but only holds the total leaf count |  |  |  |
| SH-40 | P3 | Hold-⌘ shortcut sheet is a fixed list: it shows Ink/PDF/Flashcard keys on every page and omits the shortcuts that exist (Backspace back, Esc |  |  |  |
| SH-43 | P3 | Reports has no rail item marked: on #/reports and every report page no destination is current (Reports lives under Home) |  |  |  |
| SH-45 | P3 | Header sync status is an unlabelled 8px grey dot: signed out, offline and idle look identical, and on iPad/iPhone (no hover) nothing says wh |  |  |  |
| ST-18 | P3 | Unit cards print 'completed · 0 started' (a supporting zero, invariant 77) |  |  |  |
| ST-21 | P3 | Quiz "Next question" shows a keyboard Enter hint (↵) on touch devices | 17 |  |  |
| ST-22 | P3 | Study editor card headers print raw ISO dates and wrap "Card 1" onto two lines on the phone |  |  |  |
| ST-23 | P3 | Empty Review, Due today and Assignments are dead ends with zero rows and placeholder panels |  |  |  |
| ST-24 | P3 | New assignment: a missing title is reported only in a toast; the field is not marked or focused, and a subject-less assignment can never be  |  |  |  |
| ST-32 | P3 | An unknown topic ref shows the subject desk under the bad #/ref URL instead of replacing the route |  |  |  |
| ST-34 | P3 | An assignment due earlier today reads "Overdue · 1 day" |  |  |  |
| ST-35 | P3 | Assignments have no URL of their own: #/assignments/<id> is ignored and a reload or Back loses the open assignment |  |  |  |
| ST-38 | P3 | Subject Resources accept a "file path" the link can never open: /Users/…/week1.pdf becomes a link into the app's own site |  |  |  |
| ST-39 | P3 | Card stats with no history: one figure in a full-width card, and the page header changes shape between Due today and Card stats |  |  |  |
| ST-41 | P3 | The spec spine truncates most unit names on the Mac: "Algebra and functi…", "Fundamentals of data structure…" |  |  |  |
| ST-42 | P3 | Topic inspector prints a column of dashes on a topic with no activity (8 "—" rows) |  |  |  |
| ST-43 | P3 | Inspector's "Review queue" prints a raw ISO date ("2026-11-08") |  |  |  |

### QOL — QoL (3)

| Id | Sev | Title | RC | Fixed by / depends on | Decision |
|---|---|---|---|---|---|
| CL-11 | P3 | No link out to the title's AniList/VNDB page, and nowhere to keep 'where I watch/read it' (QoL) |  |  |  |
| CR-34 | P3 | Writing sprint: the word target is never measured; it only becomes text in the Focus objective |  |  |  |
| PR-33 | P3 | Calendar: a repeating event can only be edited or deleted as a whole series; no 'this showing only', and an event cannot run past midnight |  |  |  |

### Decisions recorded per finding

- **AA-18:** Assistant 'Simple data requests' route: build a real short-request classifier, or remove the row (and its Ollama status)
- **AA-19:** Read tools set to 'Ask first': pause them too, or stop offering Ask first on read tools
- **AG-07:** One word for 'Owned' on the Wall and Seat: badges with any tier earned, or fully complete (or print both)?
- **AG-24:** Title naming: drop the leading 'the' from the four titles (Early Riser, Unbroken, Clear-Eyed, Steadfast)?
- **AP-07:** Repository clean-up: only untrack the personal AniList/MAL export and local settings, or also purge them from the public Git history (rewrites history)
- **AX-39:** Theme cull (HANDOFF Q3/SC-22): remove the light shop themes, or re-tint each with a real light ground?
- **CC-19:** Theme cull (HANDOFF Q3/SC-22): remove the light shop themes (Washi Morning), or give them a real light ground and syntax block?
- **CM-04:** The user's 3 personal forks (Maths M7.3 notes, CS 4.1.1.6 / 4.1.1.8 cards): keep, merge or reset to the shipped versions
- **CO-18:** Code settings 'Practice focus': build the Core/Tracks mix, or remove the card
- **CR-20:** A Creatives project milestone: count a hand tick only when a work is attached (changes invariant 154), and whether to claw back projects already paid on bare ticks
- **CR-26:** Creatives 'Minutes' setting: make the Daily Creative size itself by it, or remove the control
- **DI-27:** The DI-27 clean-up: remove the ~1,741 phantom sync entries from the session ledger and claw back their XP/gold and badge tiers (invariant 162 says earned only goes up), or keep the balances and only scrub the ledger and the media journals
- **HR-02:** Allow rebuilding saved reports that were frozen empty before the history arrived (an exception to invariant 102)?
- **HR-16:** Clawback: take back the streak-milestone gold already paid more than once, or leave balances as they are?
- **HR-18:** Daily goal directives: derive the tick from evidence, pay once a day, or pay nothing (activity only)? Claw back past repeat pay?
- **HR-31:** Saved reports keep facts counted the old way (invariant 102: saved once, never recomputed). Rebuild the saved weeks and months with the new activity rule, or apply it to new reports only?
- **JM-08:** Unfinished-session policy (HANDOFF §8 Q8): log what was done when the page is left, or keep it resumable
- **JM-22:** Unfinished-session policy (HANDOFF §8 Q8): log what was done when the page is left, or keep it resumable
- **MG-08:** Which Money views matter most (spend by merchant/category/week, subscriptions, budget pace, balance tracking) and whether a built-in UK merchant table and learned payee rules are wanted
- **MI-05:** Mind checkpoint pass rule: pay only on a pass, and whether to claw back rewards already paid for a checkpoint passed with nothing right
- **MI-08:** Ask Kurenai offline: build the queue it promises, or say plainly 'you're offline' and drop the queue
- **PR-23:** An all-optional routine: refuse to save it, or count it kept when every (or any) step is ticked?
- **PR-32:** Auto-tracked Focus habits: count only completed sessions (or full 10-minute blocks), measured by the routine day?
- **PR-35:** A routine kept outside its time window: record it as 'kept late' (still paid) or close the day at the window's end?
- **SC-04:** Seals: build a surface where a worn seal's stamp shows (e.g. the topbar mark, Seat ring, share card), or withdraw seals and refund the gold
- **SC-09:** Pen set 'Study set': give it its own colours, or withdraw it and refund the 500 gold
- **SC-22:** Theme cull: retire the ten near-Graphite paid themes (owned copies keep working; refund or not) or redesign each with a distinct ground and accent
- **SC-28:** Retire the four CSS frames now that painted frames exist (owned copies kept or refunded?) or redraw the bloom as an SVG petal mask
- **SC-33:** Try on: extend the transient try-on to every kind (profile kinds on the Stage identity block, shelf/Shrine samples, papers/pens on a sample page), or reword the promise to the kinds that can be tried
- **SC-34:** Pen sets: apply a set to NEW strokes only (stores a colour per stroke, widening invariant 133's roles) or keep remapping every stroke's role live
- **SH-02:** Keep a bare Backspace = Back shortcut (guarded) or drop it for Alt+←/→ only?
- **SH-27:** First-run sample events: drop the seed entirely (Sample data mode covers demos) or keep it marked sample:true?
- **SH-35:** First run: a one-screen welcome (Sign in to bring your data / Start fresh / theme), with plan backlog and notices held until it is answered?
- **ST-04:** Unfinished-session policy (HANDOFF §8 Q8): log what was done when the page is left, or keep it resumable
- **SY-03:** Unfinished-session policy (HANDOFF Q8): log what was done pro-rata on leave, or keep it resumable?
- **SY-05:** Redraw policy (HANDOFF Q4): apply remote changes at a safe point (leaving the page / finishing the set) with an 'Updated on another device · Refresh' chip?
- **SY-09:** Same as SY-03 (unfinished-session policy).
- **SY-26:** Same as SY-05: the held-page Refresh chip and when it flushes.
