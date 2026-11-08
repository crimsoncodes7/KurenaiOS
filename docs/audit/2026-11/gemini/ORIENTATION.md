# Phase 0 Orientation — KurenaiOS Independent Audit (Gemini)

**Date:** 7 November 2026
**Reviewer:** Gemini 4 Argon (Independent Verifier & Completeness Critic)
**Branch:** `audit/gemini-2026-11` (branched from `audit/quality-2026-11` at `894a407209113e8ec72d3bd563aca07432d75a1d`)

---

## 1. Environment & Harness Confirmation

### 1.1 Git & Service Worker Baseline
- **`git status` (before branching):** On branch `audit/quality-2026-11`, up to date with `origin/audit/quality-2026-11`. Unrelated local modifications/untracked files present in working tree (`.claude/launch.json`, `.claude/settings.local.json`, `art-source/assistant/live2d/source/*`, `media_budget_planner.html`, `prompt.md`, `prototypes/code-space/`) — left strictly untouched per §0.4.
- **`git log -1`:**
  ```
  commit 894a407209113e8ec72d3bd563aca07432d75a1d (HEAD -> audit/gemini-2026-11, origin/audit/quality-2026-11, audit/quality-2026-11)
  Author: Crimson <262622923+crimsoncodes7@users.noreply.github.com>
  Date:   Sat Nov 7 07:10:39 2026 +0000
      docs(audit): freeze Gemini's 96 P0/P1 ids; Batch B2 delta for later top-ups; second account's start prompt
  ```
- **`grep VERSION sw.js`:**
  ```js
  var VERSION = "kos-redraw-1";
  ```

### 1.2 Node, Python & Chrome Environment
- **Google Chrome:** Present at `/Applications/Google Chrome.app` (`Google Chrome 156.0.8078.80`).
- **Node.js & Architecture Note:**
  - `/usr/local/bin/node` (`v26.5.0`) is an `x86_64` (Rosetta) binary, whereas `/usr/local/n/versions/node/24.18.0/bin/node` (`v24.18.0`) is native `arm64`.
  - In non-interactive shells (`zsh -c`), `/usr/local/bin` is not in the default `PATH` (`/usr/bin:/bin:/usr/sbin:/sbin`). Furthermore, when an `x86_64` Node process spawns `/usr/bin/python3`, macOS inherits the `x86_64` architecture preference and `xcrun` fails to load `libxcrun.dylib` (`arm64`-only), causing `tools/dev_server.py` to exit immediately with code 1.
  - **Resolution:** Added a tiny helper wrapper at [`docs/audit/2026-11/gemini/probes/kos.sh`](file:///Users/fj/Developer/KurenaiOS%20-%20Web/docs/audit/2026-11/gemini/probes/kos.sh) that exports `PATH="/usr/local/n/versions/node/24.18.0/bin:/usr/local/bin:/opt/homebrew/bin:$PATH"` and executes `kos.mjs` under native `arm64` Node `v24.18.0`.

### 1.3 Harness Slot 31 Verification
- **Start:** `sh docs/audit/2026-11/gemini/probes/kos.sh start 31` -> `slot 31 ready: http://127.0.0.1:9131/index.html (CDP 9331)`
- **Seed:** `sh docs/audit/2026-11/gemini/probes/kos.sh seed 31` -> `seeded: {"sessions":600,"progress":120,"media":1880,"authors":732,"secure":24}` (`wrote /tmp/kosqa-seed-31.json`)
- **Orientation Screenshots Captured:**
  - `audit-evidence/2026-11/gemini/shots/orientation-home-mac.png` (`mac`, 1470×832)
  - `audit-evidence/2026-11/gemini/shots/orientation-home-ipad.png` (`ipad`, 820×1180, coarse/touch)
  - `audit-evidence/2026-11/gemini/shots/orientation-home-iphone.png` (`iphone`, 402×874, coarse/touch)
  - `audit-evidence/2026-11/gemini/shots/orientation-topic-mac.png` (`#/ref/compsci/4.2.1.1` at `mac`)
  - `audit-evidence/2026-11/gemini/shots/orientation-topic-ipad.png` (`#/ref/compsci/4.2.1.1` at `ipad`)
  - `audit-evidence/2026-11/gemini/shots/orientation-topic-iphone.png` (`#/ref/compsci/4.2.1.1` at `iphone`)
- **Stop:** `sh docs/audit/2026-11/gemini/probes/kos.sh stop 31` -> cleanly terminated both Chrome (`CDP 9331`) and `dev_server.py` (`HTTP 9131`).

### 1.4 Antigravity Capabilities Available in This Session
- **Subagents (`invoke_subagent`, `define_subagent`, `manage_subagents`, `send_message`):** Available. Built-in subagent types: `self` (full tool access including `run_command`), `research` (read-only sandbox), and `image-generator`.
- **Worktrees (`Workspace` parameter on `invoke_subagent`):** Supports `inherit`, `branch`, and `share`. Per instructions, subagents will either run in `inherit` mode returning structured JSON/text directly to the main agent, or write only to dedicated shard files under `/Users/fj/Developer/KurenaiOS - Web/docs/audit/2026-11/gemini/shards/` in the main checkout so nothing is lost on cleanup.
- **Browser Subagent (`/browser`):** In this Antigravity environment, `/browser` is a user-facing slash command rather than a callable agent tool; all runtime browser inspection, DOM evaluation, viewport/touch emulation, and screenshot capture work directly through `kos.mjs` over CDP on slots 30–39 (capped at ≤3 concurrent slots).

---

## 2. Independent Architecture & Subsystem Map

### 2.1 Runtime Shape & Script-Tag Load Order
KurenaiOS is a zero-bundler, classic-script PWA (`index.html`) that populates a single global namespace, `window.KOS`. Load order is an explicit architectural contract:
1. **Stylesheets (`css/tokens.css` → `base.css` → `layout.css` → `components.css` → 19 `css/views/*.css` files → `themes.css`)** plus KaTeX and deferred `supabase.js` / `env.local.js`. Each CSS file owns a single `@layer` in the order declared by `css/tokens.css`.
2. **Specification & Curriculum Metadata (`js/data/*.js`):** Generated specifications (`compsci.js`, `maths.js`, `it.js`), IT unit scales (`it-grades.js`), exam index/archetypes/reports/playbooks/boundaries, CS Paper 2 deep companion (`js/data/exams/aqa-7517-2-*.js`), and study-space spines (`code.js`, `ja.js`, `ja-s1.js`, `ja-strokes.js`, `ja-audio.js`, `creatives.js`, `mind.js`), followed by `js/core/subjects.js`, `js/data/pacing.js`, and `js/data/intel.js`.
3. **Core Infrastructure (`js/core/*.js`):**
   - Persistence & UI primitives: `store.js`, `ui.js`, `a11y.js`, `router.js`, `search.js`, `imagecrop.js`, `art.js`, `charts.js`, `figures.js`.
   - Study & FSRS: `content.js`, `spec.js`, `topicpicker.js`, `edits.js`, `fsrs.js`, `fsrsopt.js`, `reviewlog.js`, `srs.js`.
   - Ink & PDFs: `ink.js`, `inkui.js`, `inkexport.js`, `inksync.js`, `inkpad.js`, `pdfview.js`, `desk.js`.
   - Japanese validators/scheduler: `jakana.js`, `jaconj.js`, `jastroke.js`, `javalid.js`, `jasrs.js`.
   - Ledger, Organisation & Exams: `sessions.js`, `reminders.js`, `assignments.js`, `tracker.js`, `itunits.js`, `pacing.js`, `examstats.js`, `exams.js`, `examplan.js`, `examcompanion.js`, `examdeep.js`, `exampaper.js`, `exampapers.js`, `governor.js`.
   - Collection & Sync: `mediadb.js`, `anilist.js`, `vndb.js`, `bookapi.js`, `media.js`, `mediapush.js`, `autosync.js`, `cloud.js`, `cloudmerge.js`, `cloudsync.js`, `pwa.js`, `notify.js`, `gameapi.js`.
   - Assistant, Reports & New Spaces: `ai.js`, `aitools.js`, `aiorchestrator.js`, `aimemory.js`, `aischedule.js`, `report.js`, `reportwords.js`, `reportstore.js`, `coderun.js`, `code.js`, `ja.js`, `jaui.js`, `creatives.js`, `mindtree.js`, `mind.js`, `mindjournal.js`, `mindui.js`, `codezip.js`, `codeproj.js`, `codegit.js`, `ext.js`, `extgcal.js`, `exttasks.js`, `codeui.js`, `money.js`, `goals.js`, `outlook.js`, `push.js`, `goals-collection.js`, `goals-exams.js`, `routines.js`, `today.js`, `dayreview.js`, `achievements.js`.
4. **Authored Content (`js/data/content/*.js`):** CS, Maths, question banks (`bank-*.js`), merged CS leaves (`cs-m-*.js`), IT units, Code units/capstones/tracks, Japanese (`ja-s0.js`, `ja-f1.js`, `ja-f2.js`), Creatives (`cr-*.js`), and Mind (`mind-f1.js`).
5. **Engines, View Modules & Labs (`js/engines/*.js`, `js/modules/*.js`, `js/labs/*.js`):** Register 49 views on `KOS.views` and lab archetypes on `KOS.sims`/`KOS.worked`, followed by `achcatalogue.js`, `achievements.js`, `sample.js`, `mobile-shell.js`, and finally `main.js`.

---

## 3. Persistence Architecture

### 3.1 Synchronised State Document (`localStorage`)
- Owned by [`js/core/store.js`](file:///Users/fj/Developer/KurenaiOS%20-%20Web/js/core/store.js). Keyed by `kurenai-os-v1` (or `kurenai-os-sample-v1` / `kurenai-os-empty-v1` when `KOS.dataMode.mode` is active).
- Mutations call `KOS.store.save()` (120 ms trailing debounce + `KOS.cloudsync.noteChange("state")`), while lifecycle unload paths call `KOS.store.flush()` for synchronous `localStorage.setItem`.
- On load, `deepMerge(DEFAULTS, raw)` is passed through `scrubLegacy(state)` → `renameRefs(state)` to migrate legacy Maths Mechanics refs (`S6–S9` → `M6–M9`) and merged CS leaf aliases (`REF_ALIASES`).
- Live inspection of `KOS.store.state` on seeded slot 31 shows 35 top-level keys:
  - **Study & Spaces:** `progress`, `study`, `srs`, `srsCfg`, `custom`, `edits`, `code`, `japanese`, `creatives`, `mind`, `oop`, `worked`, `trace`, `itUnits`, `tracker`, `exams`, `resources`.
  - **Productivity & Logistics:** `sessions`, `focus`, `calendar`, `reminders`, `assignments`, `routines` (migrated from `todo`), `dayReview`, `pacing`, `money`, `goals`, `wishlist`, `ext`.
  - **Gamification, UI & System:** `governor`, `achievements`, `media` (view prefs + `shrine.order`), `notify`, `artSlots`, `assistant`, `ui` (per-device state, excluded from cloud merge).

### 3.2 Ten IndexedDB Stores (Verified Live on Slot 31)
| Database Name | Version | Owner | Role & Replication Contract |
|---|---|---|---|
| `kurenai-os-media` | v8 | `js/core/mediadb.js` | Collection entries (`anime`, `books`, `vn`, `game`), per-row activity `journal`, and `kv` store (provider tokens, sync watermarks, hero crops, base docs). Tokens (`TOKEN_KV_KEYS`) are excluded from backups and search. |
| `kurenai-os-files` | v3 | `js/modules/attachments.js` / `js/core/files.js` | Content-addressed (`hash`) file records, multi-links (`links`, `linkKeys`), aliases, and binary blobs. Metadata syncs via state/cloud; binaries auto-upload (<25 MB) to private Supabase bucket unless marked `local`. |
| `kurenai-os-filetext` | v1 | `js/core/files.js` | Extracted PDF text (per page via `pdf.js` during idle slices) for cross-domain and in-Files search. Derived; retained if binary is evicted. |
| `kurenai-os-ink` | v2 | `js/core/ink.js` / `js/core/inksync.js` | Handwritten notebooks (`docs`) and A4/custom pages of packed strokes (`pages`). Included in full backup; replicated per-stroke via `KOS.inkSync` to `kos_ink`. |
| `kurenai-os-papers` | v1 | `js/core/exampapers.js` | Local Paper Library PDFs/photos. Never synced or backed up unless promoted ("Keep in my cloud") into `kurenai-os-files`. |
| `kurenai-os-money` | v2 | `js/core/money.js` | Money transactions (`tx` by `syncId`, indexed by `date`) and deletion tombstones (`del`). Replicated to `kos_money`; Wishlist purchases (`wl:*`) are mirrored dynamically before reads and never stored/synced twice. |
| `kurenai-os-reviews` | v1 | `js/core/reviewlog.js` | Append-only FSRS rating log (`uid = key|ts`, grade, elapsed, memory before/after). Replicated insert-or-ignore to `kos_reviews`; feeds `KOS.fsrsOpt`. |
| `kurenai-os-reports` | v1 | `js/core/reportstore.js` | Saved weekly/monthly/termly/yearly reports and Monday/1st-of-month boundary snapshots. Replicated to `kos_reports` (earliest facts win, latest `words.changedAt` wins). |
| `kurenai-os-mind` | v1 | `js/core/mindjournal.js` | Private Mind Journal entries (`entries`) and tombstones (`del`). Replicated to `kos_mind`; never quoted in Reports or Assistant tools. |
| `kurenai-os-creatives` | v1 | `js/core/creatives.js` | Creatives work files (sketchbook PNGs, Writing Desk drafts and versions `doc:<id>`). Rides full backup; local-first. |

---

## 4. Cross-Cutting Mechanisms & Invariants

### 4.1 Routing, History & Background Redraw Stopgap (`kos-redraw-1`)
- **View Dispatch (`KOS.show`):** Defined in [`js/core/ui.js`](file:///Users/fj/Developer/KurenaiOS%20-%20Web/js/core/ui.js) and wrapped by [`js/core/router.js`](file:///Users/fj/Developer/KurenaiOS%20-%20Web/js/core/router.js). `KOS.router` maps `(viewId, arg)` to `#/<viewId>/...` hash URLs via `ENCODE`/`DECODE` tables and delegates Back/Forward to `history.back()`/`history.forward()`.
- **Redraw vs Navigation (`KOS.rerender`):** Passes `{ _nav: true }` so history, URL, focus, and screen-reader route announcements are untouched, and restores `scrollTop` across `[#stage, #main, document.scrollingElement]` synchronously and on `requestAnimationFrame`.
- **Stopgap Redraw Hold (`TASK_VIEWS` in `ui.js:356-394`):** When `KOS.rerender({ background: "soft" | "hard" })` is called (e.g. cloud pull, habit auto-tick, image load, Daily Review close):
  - If `navCur.viewId` is in `TASK_VIEWS` (`ref`, `due`, `review`, `personaldeck`, `code`, `japanese`, `mind`, `creatives`, `exams`, `tracker`, `assistant`, `worked`, `trace`, `oop`, `sims`, `files`), the repaint is held indefinitely until the user navigates away.
  - Otherwise, if the user is typing (`INPUT`/`TEXTAREA`/`SELECT`/`isContentEditable`), a dialog is open (`topDialog()`), or `kind === "hard"` within 45s of `lastTouch`, the repaint is deferred and retried every 15s.
  - Additionally, if `KOS.inkUI.busy()` is true (active stroke/text box or ink within 1.5s), any `KOS.rerender` retries after 1,200 ms.

### 4.2 Reward & Activity Backbone (`KOS.sessions` & `KOS.governor`)
- **Single Source of Truth (Invariant 1):** `KOS.sessions.log()` in [`js/core/sessions.js`](file:///Users/fj/Developer/KurenaiOS%20-%20Web/js/core/sessions.js) is the sole entry point that triggers `KOS.governor.onSession(e)`, `KOS.routines.onSession(e)`, and `KOS.achievements.onSession(e)`.
- **Ledger Rollup & Cap:** `state.sessions` is capped at 2,000 entries (`CAP = 2000`). Before splicing oldest entries on overflow, `KOS.achievements.rollup(true)` folds monthly totals into `state.achievements.months` so lifetime badge counts never regress (Invariant 161).
- **Streaks vs Activity (Invariant 4):**
  - `studyEntry(e, sid)` excludes `type === "media"`, `type === "todo"`, and incomplete Focus sessions (`metrics.complete === false`).
  - `hasActivity(dateISO)` (used for HP day-drain) includes `todo` ticks and incomplete Focus sessions, but excludes `media` (leisure).
  - `hasMediaActivity(dateISO)` feeds only `restStreak()`.
  - Focus sessions switched mid-way (`KOS.focus.switchTo`) remain a single ledger entry with `metrics.segments`, read via `KOS.sessions.parts(e)` across Reports, Goals, Home, and topic time calculations.

### 4.3 Multi-Device Cloud Merge & External Sync
- **State Document Merge (`js/core/cloudmerge.js`):** Pure 3-way merge `merge(base, local, remote)`:
  - `RECORDS` arrays merge by `id`; local counter collisions (`!base`, same `id`, `!sameOrigin`) are re-keyed above the family ceiling and references in `RECORDS[].refs` are rewritten before merging.
  - `ADDITIVE` (`governor.hp`, `governor.gold`, `governor.xp`) merge as `base + Δlocal + Δremote`.
  - `SET_FIELDS` (`refs`, `include`, `exclude`, `workOn`) merge as sets against `base`.
  - `ATOMIC_PREFIX` (`media.shrine.order.*`, `srsCfg.fit.w`) and `FACET_PATH` (`japanese.facets.*`, `mind.cards.*`) merge whole rather than element-wise or field-wise.
  - `MONO_PATH` (`achievements.earned.*`, `achievements.months.*`) merges monotonically (`Math.max` for counts/tiers, `Math.min` for timestamps).
  - `state.ui` and `state.focus.active` are per-device and stripped/preserved locally outside the cloud state document.
- **External Integrations (`js/core/ext.js`, `extgcal.js`, `exttasks.js`):** Two-way sync for primary Google Calendar and linked Todoist/Google Tasks reminder lists using `KOS.ext.merge3` over `ext.base`, guarded by `KOS.ext.inbound` (to prevent echo loops) and a 2-minute Supabase DB lease (`kos_ext_lease`).

### 4.4 Responsive Tiers & Device Presentation
KurenaiOS enforces five CSS width breakpoints (`1240px`, `1080px`, `860px`, `700px`, `560px`), observed across our three target viewports on slot 31:
1. **`mac` (`1470×832`):** Full desktop frame. Expanded left `#rail` (`Home`, `Study`, `Productivity`, `Collection`, `Governor`, `Assistant`, `Archive` + `#hud` profile foot), inline `#subnav` pill strip, and on Study topic views (`#/ref/compsci/4.2.1.1`) a 3-column layout (`#tree` specification spine on the left, `#main` paged notes in the centre, and the `Inspector` aside on the right).
2. **`ipad` (`820×1180` portrait, coarse pointer, `hover: none`):** Between `701px` and `1080px`, `#rail` collapses to an icon-tile strip that expands *over* the stage when toggled (`ui.railOpenNarrow`). On topic views (`#cols[data-tree]`), the specification spine becomes an overlay drawer triggered by a `≡` button next to the topic title, while the `Inspector` stacks below the main content column.
3. **`iphone` (`402×874`, coarse pointer, `hover: none`):** At `≤700px`, [`js/modules/mobile-shell.js`](file:///Users/fj/Developer/KurenaiOS%20-%20Web/js/modules/mobile-shell.js) sets `:root[data-shell="ready"]`, hides the left `#rail` in favour of a 5-tab bottom bar (`Home`, `Study`, `Productivity`, `Collection`, `More`), moves topbar search and compact filter/action bars into `KOS.ui.openDialog` bottom sheets without cloning controllers, and renders compact topic headers with a status pill (`0%`) and horizontal tab scrollers.
