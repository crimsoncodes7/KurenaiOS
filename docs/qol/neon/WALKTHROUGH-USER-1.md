# Walkthrough — User-Directed Customisation Branch (`neon/user-custom-1`)

> **User-Authorised Branch:** Every ticket on `neon/user-custom-1` (cut cleanly from `origin/main` at `f26102f5`, completely independent of `neon/qol-batch-6`) was explicitly requested by the user, outside `PLAN.md` and `BRIEF-6.md`. The user granted explicit permission to edit core files (`js/core/*`, `js/modules/*`, `css/*`, state/schema/sync wiring where required) whenever a feature genuinely needs it, while keeping generated files (`js/data/compsci.js`, `maths.js`, `it.js`, `lazy-index.js` except via `gen_lazy_index.mjs`), `js/env*.js`, `supabase/`, `.claude/`, and `docs/memory/` untouched. All commits carry `Agent: Gemini 4 Neon (Antigravity)` and a `User-authorised customisation (neon/user-custom-1).` note.

---

## Round 1 · Home & Kurenai Panel (U1–U3)

### U1 · Kurenai panel centring, aura alignment & animation clipping

- **R1 reproduction:** Opened `#/assistant` (`tab: "chat"`) in live Chrome (`1470×832`, Graphite & Dawn). `.k-asst-stage .k-asst-mascot` used `justify-content: flex-end;` (`css/views/assistant.css:370`), leaving a `143 px` dead gap (`y: 113..256`) above Kurenai's frame (`440 px` tall). `.k-asst-presence` painted its radial aura at `50% 38%` (`y ≈ 353`, near her forehead instead of behind her body), and `.k-asst-mascot-frame { overflow: hidden }` clipped the top of her `605×1400` figure whenever `asstBreath`, `:hover`, `asstNudge`, or `asstEnterSuccess` lifted her upward.
- **Commit:** `59e9d99f` — `fix(custom): U1 — centre Kurenai panel figure, align aura and prevent idle head clipping`
- **Files and lines:**
  - `css/views/assistant.css`: `:361` (`.k-asst-presence` radial gradient centre `50% 38%` → `50% 47%`), `:366` (`.k-asst-stage` `padding-block-start: var(--sp-20)`), `:371` (`.k-asst-stage .k-asst-mascot-frame` `margin-block: auto; overflow: visible; max-block-size: calc(100% - var(--sp-24))`), `:375` (`.k-asst-stage .k-asst-mascot-frame::before` `inset: 14% -8% 14%`), `:376` (`.k-asst-stage .k-asst-status` `flex: none`), `:406–408` (empty drawer stage `padding: var(--sp-24) 0 0` and frame `overflow: visible`).
  - `tools/smoke199.test.js`: `:1–65` (new suite for `neon/user-custom-1`, Step A verified failing before edit and passing after).
- **Invariants:** `ui.md` 26, 26a, 47–48; mascot/Live2D contract (`smoke39`, `smoke24`, `smoke29`).
- **Verification (run before committing):**
  - `smoke199` (2/2), `smoke24` (21/21), `smoke29` (12/12), `smoke39` (22/22), `smoke55` (14/14), `smoke119` (2/2) — all pass.
  - Live Chrome (Graphite & Dawn):
    - `1470×832`: `topGap: 81 px`, `botGap: 62 px`, `clippedByHead: false`, `overlapsStatus: false`.
    - `1200×832`: `topGap: 72 px`, `botGap: 53 px`, `clippedByHead: false`, `overlapsStatus: false`.
    - `1081×760`: `topGap: 36 px`, `botGap: 17 px` clear of `.k-asst-status`, peak animation transform (`translate: 0 -4.5%; scale: 1.035`) `peakTop: 132` vs `head.b: 131` (`clippedByHead: false`, `overlapsStatus: false`), `head`/`flower`/`tablet` hit zones aligned inside frame (`y: 167..607`).
    - `820×1180`: zero horizontal overflow (`sw: 820, iw: 820`).

### U2 · Home hero: lighten the blue overlay

- **R1 reproduction:** Inspected `.k-home-hero > .k-art` on `#/home` (`1470×832`, Graphite & Dawn): `--art-op-hero` (`0.62` Graphite / `0.34` Dawn) over `--home-hero-bg` (`--hero-tint` blue) stacked with `--home-hero-scrim` (`0.80 / 0.55` Graphite; `0.85 / 0.60` Dawn), heavily obscuring the left half of the Home hero artwork.
- **Commit:** `bd16bde0` — `feat(custom): U2 — lighten Home hero blue overlay so artwork breathes cleanly`
- **Files and lines:**
  - `css/tokens.css`: `:1361` (lightened Graphite `--home-hero-scrim` stops to `0.48 / 0.28 / 0.06 / 0 / 0.26 / 0.42`), `:1422` (added `--home-art-op: 0.84`).
  - `css/themes.css`: `:67` (added Dawn `--home-art-op: 0.62`), `:149` (lightened Dawn `--home-hero-scrim` stops to `0.56 / 0.34 / 0.08 / 0 / 0.28 / 0.44`).
  - `css/views/home.css`: `:18` (`.k-home-hero > .k-art` binds `--art-op: var(--home-art-op)`).
  - `tools/smoke199.test.js`: `:61–81` (Step B verified failing before edit and passing after).
- **Invariants:** `ui.md` 26, 26a, 26b, 53. Critical HP (`--home-crit-scrim`) and other heroes untouched.
- **Verification (run before committing):**
  - `smoke199` (3/3), `smoke55` (14/14), `smoke119` (2/2) — all pass.
  - Live Chrome (Graphite & Dawn at `1470×832`, `820×1180`, `375×812`): artwork clearly visible across desktop and mobile while all hero text (date kicker, greeting, streak, quote, level/XP/HP, Daily Goal / Today's Three) remains comfortably legible; zero horizontal overflow.

### U3 · Home Routines (4 habits + smart rotation) & Reminders alignment

- **R1 reproduction:** Seeded 1 routine due now (`Midday Reset`), 6 daily habits, and 5 open reminders on `#/home` (`1470×832`): `homeRoutines` rendered only 2 habits (`dueNow ? 2 : 4`, plus `nH % 2` hiding a 3rd habit) with no rotation on tick, and Reminders showed only 2 rows (`remOpen.slice(0, 2)`).
- **Commit:** `af6f8bea` — `feat(custom): U3 — show 4 Home habits with smart rotation and align Reminders to 3 rows`
- **Files and lines:**
  - `js/modules/home.js`: `:450–459` (partition scheduled habits preserving order into `openH` and `doneH` (`done`/`min`/`rest`), render `openH.concat(doneH).slice(0, 4)` so 4 habits / 2 rows stay visible even with `dueNow` active, completed habits rotate out to surface undone ones, and completed habits backfill when fewer than 4 undone remain), `:660, :666` (expanded Home Reminders digest from `2` to `3` rows).
  - `tools/smoke199.test.js`: `:83–132` (Step C verified failing before edit and passing after — tests 4 visible habits with `dueNow`, rotation on tick, partial backfill, all-done backfill, 3 reminders + `3 of 5` meta, and render purity using `data-ui` + ARIA only).
- **Invariants:** `productivity.md` 142, 143, 147–149; `ui.md` 26, 53, 54, 67–69.
- **Verification (run before committing):**
  - `node --check js/modules/home.js`, `node tools/gen_lazy_index.mjs --check` (`402 KB`) — pass.
  - `smoke199` (4/4), `smoke30` (22/22), `smoke55` (14/14), `smoke104` (12/12), `smoke130` (21/21), `smoke142` (12/12), `smoke164` (9/9) — all pass.
  - Live Chrome (`1470×832`, `820×1180`, `375×812`): at `1470×832`, Routines (`167 px` natural height: 2 rows of habits + bottom review line) and Reminders (`173 px` natural height: 3 rows) align evenly side-by-side (`173 px` rendered card height for both); ticking `"Drink water"` rotated it out and surfaced `"Tidy desk"` into slot 4; zero horizontal overflow.

### Round 1 · Boot bytes

- **End of Round 1 (`af6f8bea`):** `5,356,204` B (`5.1081 MB`) against the `5,400,166` B (`5.15 MB`) budget — **`43,962` B (`42.93 KB`) free**.

### Round 1 · Full gate summary

```text
run_smoke: 180 suite run(s), 3 worker(s), 300 s timeout (smoke56, smoke75 900 s), failures re-run alone at the end
...
  ok   smoke197      3.3 s
  ok   smoke199      1.8 s
  ok   smoke196      6.3 s

slowest: smoke75 342 s, smoke56 320 s, smoke142 66 s, smoke139 58 s, smoke135 42 s

run_smoke: 180 / 180 passed in 558.0 s wall (1670 s summed)
```

### Round 1 · Noticed, not touched

- `css/themes.css:112` and `:115` both set `--hero-tint: oklch(0.95 0.02 235);` (pre-existing duplicate line); left untouched per R3.
