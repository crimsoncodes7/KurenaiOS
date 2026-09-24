# KurenaiOS presentation-layer rebuild: execution plan

Branch: `refactor/ui-ux-overhaul` (created from `claude/ui-ux-overhaul-plan-drndl8` @ `749f062`, 2026-09-24). Every milestone below is one or more commits pushed to this branch. Nothing deploys: production is a manual upload and happens only at M14.

## Context

Earlier restyles deleted CSS but kept the DOM and class vocabulary, so the rebuild anchored to the old containers and reproduced the same interface. This plan removes the old presentation completely: stylesheet, class vocabulary, wrapper hierarchy, inline styles and design mockups. It keeps business logic, state, persistence, routing, a11y services and every non-visual invariant in CLAUDE.md.

Decisions you made:
- **Fresh visual direction.** Neither the old mockups nor the concept files are used. The new tokens are designed and signed off in M3 before any view is built.
- **Dawn/Dusk first.** The other 23 shop themes keep their ids and ownership records and render as the default until M13.
- **Tests move to stable hooks.** Suites stop querying legacy classes, and the invariants that name classes (26, 50a, 52, 72, 89, 92) are amended.
- **Push target** is `refactor/ui-ux-overhaul`.

---

## Phase 1: Presentation inventory and coupling audit (measured 2026-09-24)

### 1.1 Styling residue

| Residue | Where | Size |
|---|---|---|
| Monolithic stylesheet | `css/main.css` | 9,677 lines, ~2,416 distinct classes, 100 `@media`, 138 custom properties, 25 `data-theme` blocks |
| External CSS | `index.html:20` (Google Fonts: Fraunces, Alegreya Sans, IBM Plex Mono, Shippori Mincho), `index.html:22` (KaTeX CSS, keep) | 2 links |
| Static shell markup | `index.html:33–130`: `.bg-flora` petals, `#topbar .brand .kanji/.name/.sub`, `.nav-arrows`, `#searchbox .glyph`, `.rail-item .glyph/.lbl/.pc`, `.rail-foot`, `.toast` | whole shell |
| Class strings in JS | `class:` / `className=`: 3,589 sites. Heaviest: `hub.js` 324, `assistant.js` 261, `governor-ui.js` 205, `calendar.js` 179, `books.js` 174, `wishlist.js` 159, `pacing.js` 155, `medview.js` 140, `focus.js` 136, `sims.js` 123 | 36 views |
| Inline `style` | `el(..., {style:"…"})` → `node.style.cssText` (`js/core/ui.js:14`); `.style.*` in `pacing.js` 47, `sims.js` 41, `hub.js` 36, `sims-cs.js` 29, `sandboxes.js` 24, `calendar.js` 17, `medview.js` 14 … | ~450 sites |
| `innerHTML` markup | `sims*.js`, `hub.js` 13, `wishlist.js` 11, `flashcards.js` 11, `assistant.js` 9, `medview.js` 9, `editor.js` 8 | ~150 sites |
| Hard-coded CSS paths | `sw.js:33` (precache list), `tools/deploy_pages.sh:32` (`cp -R css`), `governor.js:229` (comment about theme blocks) | 3 |
| Design mockups at repo root | `kurenai-os-mockup.html`, `kurenai-os-direction-lab-v3.html`, `kurenaios_ui_overhaul_concept.html` | 3 files (anchoring risk) |
| Tests coupled to CSS | 19 suites read `css/main.css` (`smoke15, 18, 24, 29, 31, 32, 36, 37, 39, 40, 42–47, 49, 50, 52`); 43 suites query ~491 distinct class selectors | test gate |

### 1.2 Where logic depends on presentation markup

1. **Classes used as state.** `classList` toggles: `hidden` (44), `no-tree` (35), `active` (26), `on` (19), `open` (8), `is-loading` (7), `insp-closed` (6), plus `dragging`, `flipped`, `editing`, `modal-open`, `focus-mode`, `at-start/at-end`, `asst-drawer-open`, `img-failed` and others. These state flags are expressed as visual classes.
2. **Classes used as structural lookups.** About 85 `querySelector` calls on class selectors and 9 `closest()` calls. The worst cases are:
   - `mobile-shell.js`, which moves canonical nodes via `.med-layout`, `:scope > .med-filter-rail`, `:scope > .med-main`, `.rem-grid`, `:scope > .rem-side`, `.topbar-right`, `.rail-foot`, `.subnav-item.active`;
   - document-level lookups of `.rail-item`, `.cls-card`, `#hud .hud`, `.asst-status-line`, `.save-wrap`, `.modal-ov`, `#topbar .brand .kanji`;
   - `ui.js:35` `toast` writing `className`.
3. **Render functions mix derivation with DOM building.** In most views, data reads (`KOS.store.state`, `mediadb.query`, `hub` stats, `pacing`, `calendar.countdowns`) and event handlers that call services are interleaved with `el()` trees inside one `KOS.views.<id>` function.
4. **Dynamic styling that must survive.** Some inline styles carry data, not layout: `--ev-hue` (inv. 46), progress/bar widths, crop focal `{x,y,zoom}` (`imagecrop.js`), chart geometry, menu placement (`ui.js:651`), braid lanes, sim canvases. These stay, but only as CSS custom properties or SVG/canvas attributes.
5. **Invariants that name classes today.** 26 ("preserve class names"), 50a (`.dh-sub > span.board`), 52/89 (`.n-blk[data-bid]`), 72 (`.mobile-shell-ready`), 92 (`.med-ro`).

### 1.3 Preserving functional contracts without the markup

Every view becomes three separate layers:

- **Model.** A pure `derive()` function per view (or a named helper in the same file) that returns plain data from the existing services. It is extracted, not rewritten, and existing calls (`KOS.show`, `KOS.sessions.log`, `KOS.edits.set`, `KOS.media.*`, `KOS.pacing.*` …) move with it unchanged.
- **Actions.** Named handler functions that close over the model. These are the only code that calls services.
- **View.** New DOM built only from the new primitives. It binds actions and emits **hooks**.

The hook contract replaces classes as the thing logic and tests depend on:
- `data-ui="<name>"` gives structural identity (e.g. `data-ui="vault-filter-rail"`, `data-ui="page-sub"`, `data-ui="note-block"`). It is never styled.
- State lives in ARIA or native attributes first (`aria-current`, `aria-selected`, `aria-expanded`, `aria-pressed`, `hidden`, `inert`, `disabled`), then `data-state="…"`. No class ever carries state.
- Existing IDs (`#main`, `#stage`, `#subnav`, `#rail`, `#tree`, `#toast`, `#search`, `#search-results`, `#notify-mount`, `#hud`, `#sync-status`) and existing `data-*` (`data-section`, `data-view`, `data-bid`, `data-cid`, `data-sim`, `data-theme`) are kept as-is. The router, search, notifications and tests already depend on them.
- Classes become purely visual and use a new prefix, `k-` (e.g. `k-card`, `k-stack`), so no legacy name can come back unnoticed.

Deliverable: `docs/ui-rebuild/view-contracts.md`, one section per view (36 views plus the shell and primitives). Each section lists the data read, the actions, the `data-ui` hooks, focus and announce behaviour, routes/args, and the invariants that apply. **The new markup is written from this document, not from the old render code.** That is the main anti-anchoring rule.

---

## Phase 2: DOM and styling purge strategy

### 2.1 Order of the purge (keeps the 54/54 gate green)
1. **M1, hooks first.** Mechanically add `data-ui` / ARIA state to the *current* DOM wherever a test, `mobile-shell.js` or a document-level lookup reads a class. Rewrite those lookups and the 43 test suites to use hooks. Move state classes to attributes. Rewrite the 19 CSS-reading suites so they assert on the new token files (e.g. canonical token names, the five breakpoints, widest-first order) instead of `main.css`. The gate is still 54/54 with the old look.
2. **M2, scorched earth.** In one commit:
   - `git rm css/main.css`;
   - delete the three root mockups;
   - remove `.bg-flora` and the Google Fonts link from `index.html`;
   - add empty layered stylesheets (Phase 3);
   - update `sw.js:33` and the precache derivation.

   After M2 the branch renders as unstyled semantic HTML, and it stays that way until each view is rebuilt. This is intentional: with nothing left to repaint, the rebuild can't anchor to the old containers.
3. **Freeze the legacy vocabulary.** Generate `tools/ui-legacy-classes.json` from `main.css` *before* it is deleted in M2, with every one of the ~2,416 names. Add a guard suite, `tools/smoke55.test.js`, that fails if any legacy name appears in `index.html`, `js/**` or `css/**` for a file listed as migrated in `tools/ui-migration.json`. Each milestone appends its files, and by M14 the list covers everything.

### 2.2 Stripping class names
- The old class strings are not renamed. Each view's `el()` tree is **deleted and rewritten** from its contract in `view-contracts.md`. Renaming them would anchor the new markup to the old structure.
- `el()` (`js/core/ui.js:6`) gains a dev assertion, active only in tests: a `class` value must match `^k-` tokens, and `style` must contain only `--custom-property` declarations. That turns legacy residue into test failures.
- `innerHTML` markup is replaced by `el()` everywhere except the content/KaTeX renderer and sim canvases. Those keep `innerHTML` for authored content only, with new `k-` classes.

### 2.3 Flattening div soup
Every rebuilt view follows the same skeleton, built only from primitives:

```
<main id="main">                                     (exists)
  <header data-ui="page-head">  h1 · sub · actions   (pageHeader)
  <section aria-labelledby=…>   section header + body (sectionHeader)
    k-stack / k-cluster / k-grid / k-sidebar layout primitives
  <aside>                       inspector / filters (canonical nodes, inv. 58/72)
```

Rules:
- A `<div>` is allowed only as a layout primitive (`k-stack`, `k-cluster`, `k-grid`, `k-sidebar`, `k-switcher`) or when no semantic element fits.
- Maximum nesting is 4 wrapper levels from a section to its leaf content.
- Lists are `<ul>`/`<ol>`, facts are `<dl>`, tabular data is `<table>`, and the progress bar stays `<meter>`/`progressBar()` (inv. 63).
- `smoke55` records a depth budget per view.

---

## Phase 3: Design token architecture and foundation

### 3.1 M3: design spec and sign-off (a gate; no view code starts until you approve it)
- Build `design/foundation.html`, a standalone specimen that loads only the new CSS. It shows the palette in Dawn and Dusk, type scale, spacing, elevation, every primitive in every state, and a sample page at 1440 and 390 widths. I publish it as a private Artifact link for your review.
- Anti-anchoring rules: no screenshots of the current app, no reading of the deleted `main.css`, and none of the old mockups are consulted. The inputs are the product (README), the view contracts and the invariants only.

### 3.2 Files (cascade order fixed with `@layer tokens, base, layout, components, views, themes;`)
| File | Contents |
|---|---|
| `css/tokens.css` | **Primitives**: raw colour ramps (neutral 0–1000, kurenai accent, three subject hues (inv. 26), good/warn/danger, calendar category hues (inv. 46)). **Semantic**: `--bg`, `--surface-1..3`, `--border-subtle/-default/-strong`, `--text`, `--text-muted` (the 50a sub-line), `--accent`, `--focus-ring`; elevation `--shadow-ink` + `--elev-0..4` (inv. 79); `--z-*` (inv. 70); radii; motion. Dawn on `:root`, Dusk on `:root[data-theme="atelier-dusk"]` (inv. 26a/26b). |
| `css/base.css` | Modern reset, element defaults, focus-visible ring, `.sr-only`, `.skip-link`, `100vh`→`100dvh` (inv. 75), KaTeX harmonisation, reduced-motion. |
| `css/layout.css` | App shell grid and the layout primitives (`k-stack`, `k-cluster`, `k-grid`, `k-sidebar`, `k-switcher`, `k-center`). |
| `css/components.css` | One block per `KOS.ui` primitive: tabs, pageHeader, sectionHeader, emptyState, statTile, scroller, menu, dialog, confirm, toast, buttons, fields (16px inputs on phone, inv. 40), chips, card, progress bar, crop host, chart frame. |
| `css/views/{home,study,productivity,collection,governor,assistant,archive,labs}.css` | View compositions only. They may use tokens and primitives but may not restyle a primitive's internals. |
| `css/themes.css` | The 23 shop themes as semantic-token overrides only (M13). |

- **Typography.** Minor-third scale on a 4px grid: 11 (label floor, inv. 63) / 12 / 14 (body-small, page sub) / 16 (body) / 19 / 23 / 28 / 34 / 41. Line-height tokens are 1.2 display, 1.35 heading, 1.55 body, snapped to 4px. Weights are 400/500/600/700. Tracking is tightened on display sizes and loosened +0.04em on caps labels. There are three families (display, text, mono), self-hosted or on Google Fonts, chosen in M3. The `lang="ja"` fallback stack covers the kanji marks.
- **Spacing.** `--space-0..12` = 0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80. Every margin, padding and gap uses a token. Hit areas are 32px, or 44px on coarse pointers (inv. 69).
- **Breakpoints.** Exactly 1240/1080/860/700/560 (inv. 47). They're documented at the top of `tokens.css`, enforced by `smoke55`, and written widest-first (inv. 48).
- **Guard.** No hex, rgb or hsl colour literal outside `tokens.css`/`themes.css`, and no raw px spacing outside tokens except 1px borders.

### 3.3 M4: shell first, interiors later
Rebuild `index.html` and the chrome before any view:
- `<body>` → `#app` grid with named areas: header (`#topbar`), rail (`<nav id="rail">`), tree (`<aside id="tree">`), stage (`#stage` → `#subnav` + `<main id="main">`).
- Below 700px (inv. 40): the bottom tab bar, tree drawer, bottom sheets and safe-area insets, with main content reserving one tab-bar height (inv. 75).
- Re-template `mobile-shell.js` against `data-ui` hooks and `data-shell="ready"` on `<html>` (replacing `.mobile-shell-ready`, inv. 72).
- Rebuild the `ui.js` shell pieces: `renderSubnav` (`ui.js:767`), nav arrows, `toast` (hook, not `className`), dialog host.
- Keep untouched: `router.js`, `search.js` controller (inv. 73), `a11y.js`, `pwa.js`.

---

## Phase 4: Incremental re-implementation order

### Checkpoint protocol (run at the end of every milestone before pushing)
1. **Compile.** `node --check` on every edited JS file, then a boot smoke (`tools/smoke.test.js`). This app has no build step, so these two checks are the compile gate.
2. **Gate.** `for i in "" {2..56}; do node tools/smoke${i}.test.js; done` must pass in full.
3. **Data flow.** The new `tools/smoke56.test.js` ("render purity") seeds state and media, renders every migrated view and its tabs, and asserts:
   - `KOS.store.state` JSON and the media DB are byte-identical before and after rendering;
   - zero console errors;
   - zero Governor/session writes;
   - each action in the view contract, dispatched through its `data-ui` hook, produces exactly the service call it produced before (spied).
4. **No leakage.** `smoke55` passes for the migrated files: no legacy class, no static inline style, no colour literal, depth budget met.
5. **Visual.** `node tools/responsive_audit.mjs --seed` at the five breakpoints for touched views (screenshots inspected, not only JSON), plus `node tools/visual_audit.mjs` for image, hero, chart and shrine work. Dawn and Dusk are checked at each step, and axe contrast AA must pass.
6. **Commit and push.** `git push -u origin refactor/ui-ux-overhaul`.

### Milestones
| # | Milestone | Main files |
|---|---|---|
| M0 | Commit this plan as `docs/ui-rebuild/PLAN.md`; write `view-contracts.md` (Phase 1.3) | docs only |
| M1 | Hook migration and test rewrite, old look intact (Phase 2.1.1) | `mobile-shell.js`, `ui.js`, modules with document-level lookups, 43 suites, 19 CSS suites |
| M2 | Scorched earth: generate legacy manifest → `git rm css/main.css`, mockups, `.bg-flora`; empty layer files; `sw.js`, `deploy_pages.sh`; add `smoke55`/`smoke56` | `index.html`, `sw.js`, `tools/` |
| M3 | Design spec: `tokens.css`, `base.css`, `design/foundation.html`. **Your sign-off gate.** | `css/tokens.css`, `css/base.css` |
| M4 | Shell and navigation (Phase 3.3) | `index.html`, `css/layout.css`, `mobile-shell.js`, `ui.js` shell |
| M5 | Primitives: `tabs`, `pageHeader` (new 50a hook), `sectionHeader`, `emptyState`, `statTile`, `scroller`, `menu`, `openDialog`/`confirm` (inv. 49), `num`, `progressBar` (inv. 63), `imageCrop` UI (inv. 26c), `charts.js` frames (inv. 76), `el()` assertion | `js/core/ui.js`, `imagecrop.js`, `charts.js`, `media.js` (bar only), `css/components.css` |
| M6 | Home: next-action ladder, pacing home card (inv. 53/82b) | `hub.js` (home), `pacing.js` card, `css/views/home.css` |
| M7 | Study: spec spine and tree (inv. 51), subject desk, topic page and inspector (inv. 52), content renderer and `note-block` hook (inv. 89), editor, flashcards/quiz engines, Review/due/cardstats/personaldeck | `hub.js`, `content.js` renderer, `editor.js`, `engines/*`, `review.js`, `due.js`, `cardstats.js`, `css/views/study.css` |
| M8 | Productivity: Focus (running, dock, review, inv. 4a–4c, 75), Calendar (event modal, chips, `--ev-hue`, inv. 45/46/74), Reminders, Tasks/Habits/Assignments, Pacing week and braid (inv. 84/85) | `focus.js`, `calendar.js`, `reminders.js`, `todo.js`, `assignments.js`, `pacing.js`, `css/views/productivity.css` |
| M9 | Collection shell: `medview` (shell, editor, filters, actions, inv. 56/58), vault hero (inv. 30/60), read-only facts hook (inv. 92), placeholder hue (inv. 61) | `medview.js`, `css/views/collection.css` |
| M10 | Vaults and Collection pages: Overview (`matrix`), Anime and Seasonal, Books, VN, Games, Mangaka (inv. 55), Shrine, Planner (`wishlist`), Sync (`mediasync`), profiles, tracker, goals | the matching modules |
| M11 | Governor and Shop (balance as formatted context, inv. 78; HUD in the rail foot), notification bell and feed (inv. 97), cloud UI, Archive (`data`, `help`, `attachments`) | `governor-ui.js`, `notifications.js`, `cloudui.js`, `help.js`, `attachments.js` |
| M12 | Assistant (chat, drawer, status, Live2D seam untouched, inv. smoke39) and Labs chrome: `sims*`, `worked*`, `trace`, `oop`, `sandboxes`. Canvases keep `KOS.labPalette()` reading the new tokens. | `assistant.js`, `js/labs/*`, `css/views/{assistant,labs}.css` |
| M13 | The 23 shop themes as token overrides in `themes.css`, with swatches synced to `governor.js` | `css/themes.css`, `governor.js` swatch data |
| M14 | Release: full-coverage `ui-migration.json`, full breakpoint/device matrix, visual audit, amend CLAUDE.md (invariants 26, 50a, 52, 72, 89, 92; gate count 56/56; file map), update `AGENTS.md`/`PROGRESS.md`, bump `sw.js` `VERSION`, `tools/deploy_pages.sh --stage` for your review, then production only on your go | docs, `sw.js` |

Out of scope (unchanged throughout): `store.js`, `mediadb.js` and every provider client, the cloud engine (`cloud*.js`), `router.js`, `search.js` ranking, `governor.js` economy, `sessions.js`, `srs.js`, `pacing.js` core, `edits.js`, generated data, authored content data, `supabase/`, Live2D files.

### Risks and mitigations
- **Unstyled app between M2 and M14.** This is the branch only, and production never deploys from a push. If you want to use the app day-to-day meanwhile, production keeps the current build.
- **Behaviour regressions hidden inside the DOM rewrite.** `smoke56` compares action dispatch against the pre-rewrite spies recorded in M1, and each view commit carries only that view.
- **Scale.** 3,589 class sites across 36 views. The milestones are sized to one domain each, and M7, M8 and M10 split into per-view commits.
