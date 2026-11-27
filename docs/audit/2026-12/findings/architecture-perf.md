# architecture-perf — December 2026 audit (Phase 2)

6 new findings (P1 1, P2 2, P3 3). The Phase 1 splits hold: all 56 lazy routes open from a cold reload with no error or miss at mac and iPhone 4x CPU, no page bundle registers a listener or ticker at load, listeners stay flat across 90 navigations, and every page-part API used from boot code waits for its bundle except one (AP-22, ST-47/EX-57). The main defect predates Phase 1: in a real browser the curriculum stand-ins are never installed because lazy-index.js runs before the content templates are parsed (AP-21, the root cause of ST-52 and ST-51), so due counts are short until the warm-up and for good under Save-Data, where a partial Due run pays the backlog bonus. The service worker mixes versions after a deploy (AP-23); the boot timing row understates (AP-24); docs drift (AP-25) and one copied split (AP-26). November: 12 fixed, 7 still open (all W8 'partly' or Later).

Slot 6, code `fa4264d0` (sw `kos-qol-4`). Evidence and helper scripts: `/Users/fj/Developer/KurenaiOS-519/audit-evidence/2026-12/shots/architecture-perf/` (`cdp.mjs` drives real reloads through CDP; `xref.py` maps the page-part API; `matrix.sh`, `cold.sh`, `fp.sh` are the timing and cold sweeps).

## Findings

| Id | Sev | Title |
|---|---|---|
| AP-21 | P1 | In a real browser the curriculum stand-ins are never installed: lazy-index.js runs before the content templates are parsed, so every page load counts only Mind/Creatives/Japanese cards until the warm-up (and for good under Save-Data), and a partial Due run pays the backlog bonus |
| AP-22 | P2 | KOS.errorLog.openCapture asks for KOS.lazy.ensure, which lazy.js never defined, and the existence guard hides it: every Error Log capture before page-errorlog is in does nothing |
| AP-23 | P2 | The service worker mixes versions after a deploy: stale-while-revalidate writes the new deploy's scripts into the old version's cache, so the old index.html runs new scripts until the update is accepted |
| AP-24 | P3 | Settings › Storage's 'First page, this start' is not the first page: kos-boot starts at the first script, not navigation, and ends before a page that waits for its bundles has drawn |
| AP-25 | P3 | Docs drift after Phase 1: invariant 168 names 32 of the 44 lazy bundles, claims a browser-level guarantee only the jsdom loader gives, and HANDOFF still says new suites start at 196 (196–201 are taken) |
| AP-26 | P3 | The Reports split copied five helpers into the boot part instead of sharing them: Home's report card and the Reports page each have their own parse, dm, range, weekOf and mono |

## What was covered

- **Cold loads, done properly.** The harness's hash change is not a reload, so every timing here is a real `Page.navigate` (through about:blank) with the service worker and caches cleared, and Save-Data emulated wherever the warm-up had to be kept out.
- **Boot timing**, at mac (1x) and iphone (CPU 4x), on the Empty account with 8 scheduled cards and on the dense account, for Home, Due, Exams and Calendar: `kos-boot` 40–903 ms, `kos-interactive` 157–1,372 ms after navigation, `kos-ready` 5.4–7.9 s (the warm-up starts 5 s after interactive), boot JS 5.67 MB decoded including KaTeX from the CDN (5,389,922 bytes of the app's own, budget 5.15 MiB, about 11 KB headroom), no long task before interactive on either account. The time to the real page against the placeholder was measured on #/exams, a CS topic, the Wall and Anime (AP-24).
- **Every lazy route from cold**: the 36 views in `PAGES`, the six study-space desks, a topic of each of the seven subjects, Due, Card stats, Review, Files, Focus and Home: 56 routes, each loaded with nothing warmed, at mac and iphone 4x. All drew, with no console error, no stand-in left and 0 misses.
- **The split contract (168).** The KOS API was diffed before and after `KOS.lazy.all()`: 85 namespaces and 8 extended ones are page parts. All 168 references to them from boot code or another bundle were read, and only `errorlog.js:166` fails (AP-22). Listeners and intervals registered while every bundle loads: 0. The boot and page part of each 1F pair were compared for copied functions (AP-26).
- **ST-52 / ST-51 root cause** (AP-21): the templates visible at the moment `lazy-index.js` runs were recorded, the due count was watched over a reload, the Due page after warm-up, Save-Data, and the pay of a partial run (reproduced twice).
- **View lifecycle (166)**: listeners, DOM nodes and heap over 3 rounds of 30 views; focus across a background redraw on five pages; Edit your seat's tab; a Wall set left before it was measured.
- **Service worker (37/38)**: the precache derivation, the navigation shell and stale-while-revalidate, through smoke121's worker harness, run twice. A live update on a non-dev host was set up with a copy of the app served as `kos.test`, but the headless worker's precache stalled at 10 entries in that setup, so AP-23 rests on the harness and the code.
- **Heavy views** on the dense account, first draw and redraw: Exams, Code, Due, Pacing, Calendar, the Governor, the Wall and Home; badge list, readiness and the exam pass.
- **Docs against the code**: invariant 168, `docs/ownership.md`, `docs/SMOKE.md`, `docs/HANDOFF.md`, README, AGENTS and CLAUDE.md's baseline.
- **Code health re-counts**: local date helpers, the four lesson readers, file sizes, dead CSS, tracked clutter.

Not covered: iPad sizes (timing does not depend on layout), Safari itself (it has no `requestIdleCallback`, so the warm-up uses `setTimeout`), a live service-worker update on a production-like host, and the copy account, which has its own pass.

## November re-check

| Id | Verdict | Note |
|---|---|---|
| AP-01 | fixed | Boot parses 177 scripts, 5,389,922 bytes (was 346 / 16.9 MB); every one of 56 routes opened from a cold reload (Save-Data, no warm-up) draws with no error and 0 misses at mac and iphone 4x CPU (/Users/fj/Developer/KurenaiOS-519/audit-evidence/2026-12/shots/architecture-perf/cold-mac-mine.txt, cold-iphone4x-mine.txt); first page 0.2-1.4 s after navigation. The lazy design has one new defect in a real browser: AP-21. |
| AP-03 | still open | Partly better: dense account, all bundles in, Code's map first draw 1,014 ms and a KOS.rerender() of it 1,672 ms, the Wall 727/713 ms, Exams 313/573 ms, Governor 298/562 ms; Due, Pacing, Calendar, Home now 13-270 ms (/Users/fj/Developer/KurenaiOS-519/audit-evidence/2026-12/shots/architecture-perf/views-dense-mac.txt). The memo layer is in Later (bk:architecture-perf#3). |
| AP-04 | still open | Four DWELL readers (codetopic, crtopic, jatopic, mindtopic) and four syncChecks (core code, creatives, ja, mind) remain; Later (bk:architecture-perf#4). |
| AP-05 | still open | README.md:33 and AGENTS.md:145 still say 106 suites, README's sw kos-files-1; HANDOFF §00 at kos-integrity-23 and 'new suites from 196' (AP-25). CLAUDE.md and docs/SMOKE.md are current. Phase 4 re-baselines. |
| AP-06 | still open | js/modules/help.js: Japanese 0, Creatives 0, Todoist 0, Achievement 0 mentions; Phase 4. |
| AP-07 | still open | Partly fixed: the AniList export, .claude/settings.local.json and fix_*.py are no longer tracked and the old plans are in docs/archive/; Context/ still tracks 12 files (board specification PDFs, a .docx, revision HTML, screenshots). |
| AP-08 | fixed | window/document listeners counted through a wrapped addEventListener: 84, 84, 84 after three rounds of 30 views; DOM nodes 2,529 each round; heap 89 → 71 MB (/Users/fj/Developer/KurenaiOS-519/audit-evidence/2026-12/shots/architecture-perf/leak1.json). |
| AP-09 | still open | Partly fixed: hub.js 3,899 → 830 lines (home.js 1,267, topic.js 1,002 split out); aitools.js 3,892, focus.js 2,909, governor-ui.js 1,957 lines remain; Later (bk:architecture-perf#5). |
| AP-10 | fixed | Focus survives a background redraw on Home, Calendar, Money and the Wall (same control after); on Routines a focused scroller arrow that the redraw hides falls back to the page heading, not <body>. |
| AP-11 | fixed | The 79-line .k-hb-* block is gone (0 in css/views); the full unused-class scan was not re-run. |
| AP-12 | fixed | npm test runs tools/run_smoke.mjs; .github/workflows/smoke.yml exists; gate 183 suites. |
| AP-13 | still open | Local copies: pad 20, addDays 17, iso 12, isoOf 10, hm 13, rid 12 files (Nov 19/15/11/7/11/8); Phase 1 added one rid, the rest grew in W0-W8. |
| AP-14 | fixed | Edit your seat: Background tab chosen, a background redraw keeps Background (KOS.view.memo). |
| AP-15 | fixed | KOS.achievements.list 117 ms then 68 ms on the dense account (was 3,929 / 138 ms); the Wall's first draw is still 727 ms (AP-03). |
| AP-16 | fixed | smoke4, smoke16 and smoke17 run three at a time, twice: all pass (/Users/fj/Developer/KurenaiOS-519/audit-evidence/2026-12/shots/architecture-perf/ap16-parallel.txt). |
| AP-17 | fixed | KOS.show('achievements','set/app') then Home 30 ms later: no dialog after 5 s (KOS.view.token, achievementspage.js:33). |
| AP-18 | fixed | Boot's exam pass is skipped by its signature (js/main.js:158, srs.js:220-224; examPass 0 ms, 0 changes on reload); readiness over every upcoming exam 14 ms; no long task before kos-interactive on the dense account at mac or iphone 4x. |
| AP-19 | fixed | Ink, Files and Journal events re-measure their badges (js/core/achievements.js:498, 590); assistant and reports touch on write. |
| AP-20 | fixed | CLAUDE.md 186,526 → 47,965 bytes; the baseline is a dozen lines; invariants live in docs/invariants/<domain>.md and releases in docs/RELEASES.md. |
