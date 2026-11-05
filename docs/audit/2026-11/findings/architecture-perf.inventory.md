# architecture-perf — inventory (top-up on kos-redraw-1, e30b837)

The area is the whole codebase, so the "features" are the measurable
properties and structural seams. Each row is checked in the coverage matrix
of architecture-perf.json.

## A. Boot and payload
- A1 index.html script list: 346 classic scripts (5 defer/async), 16.9 MB JS; 26 stylesheets, 1.31 MB CSS
- A2 js/data share of boot JS (curriculum, exam index, Code projects): 9.95 MB
- A3 boot time to interactive (Performance API: domInteractive, load, shell ready) — empty and dense accounts
- A4 long tasks during boot (PerformanceObserver longtask) and CPU profile by script
- A5 service-worker precache (derived from index.html; VERSION bump re-downloads all)
- A6 the art: assets/app/img 468 webp (25 MB), loaded per slot; KOS.art.loadOwn at boot
- A7 Achievements boot sweep (2.5 s after boot) and 30-min sweep; cost of evaluate(null) over 254 badges

## B. Runtime performance
- B1 first / warm render times of heavy views: home, calendar, exams, code, due, pacing, reports, anime/books/vn, ref topic, achievements (+ every tab), governor, governor/edit, shop
- B2 derived reads without memo (readiness, code unit state, calendar derivedOn, srs.allCards)
- B3 memory: heap and DOM nodes/listeners across rounds of navigation (incl. achievements, governor)
- B4 the global-listener leak pattern (isConnected-lazy removal, 15 sites)
- B5 store.save frequency and size; achievements' achSeen writes per evaluate

## C. Rerender model (kos-redraw-1 stopgap)
- C1 KOS.rerender focus retention (home, calendar, routines, money, achievements, governor)
- C2 TASK_VIEWS hold list vs pages with in-page drafts (governor/edit's Edit seat draft, achievements showcase picker, money, goals editor)
- C3 soft vs hard background redraw callers (main.js:303/307, routines.js:699, ext.js:364, dayreview.js:92/103/661/709, cloudsync.js:731)

## D. Structure and maintainability
- D1 giant files: hub.js (3,914), aitools.js (3,811), governor-ui.js (1,730, +1,015 since f4fa493)
- D2 KOS namespace and load-order guards (412 `KOS.x &&` guards); achievements' 22 owner hook call sites
- D3 study-space duplication (Code / Japanese / Mind / Creatives: DWELL readers, syncChecks, award, planDay, evidence)
- D4 helper duplication (pad, addDays, iso, isoOf, hm, rid) incl. new files
- D5 dead CSS (Habits k-hb-*, governor.css pre-shop classes, components)
- D6 dead JS modules / namespaces
- D7 badge owner domains vs domains that call touch (assistant, reports only by sweep)

## E. Repository and docs
- E1 repo root clutter and tracked personal data (public repo)
- E2 docs drift: README, AGENTS, PROGRESS, docs/HANDOFF, docs/ROADMAP, docs/GUIDE, in-app Help vs code
- E3 CLAUDE.md length (2,415 lines, 186 KB) and its release diary
- E4 Help & Guide coverage of new features (Achievements, Gold Shop, art slots)

## F. Tests
- F1 smoke gate: 113 suites, wall/CPU time, failures, slowest suites
- F2 test runner / npm scripts / CI
- F3 smoke113 (Badge Wall) coverage of the new features

## G. Audit infrastructure
- G1 the stale-checkout problem from the earlier run (HEAD vs production)
