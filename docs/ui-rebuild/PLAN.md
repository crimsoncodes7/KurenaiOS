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

### M2 as delivered (2026-09-24)

Three commits on `refactor/ui-ux-overhaul`, in this order, so each step's
evidence was taken before the next step could change it.

1. **Render-purity baseline, from the untouched M1 tree** (`smoke56`).
   `tools/lib/app-harness.js` boots the app deterministically (a fixed
   clock that advances only with virtual timers, a seeded PRNG, no
   background tickers, fake IndexedDB) and `tools/lib/seed.js` seeds a used
   account through each domain's normaliser. For 42 surfaces (every view,
   the args that select a different page, and the shell chrome) the suite
   renders twice and diffs the store outside `state.ui` and the media DB,
   then clicks each of 1,135 controls from a restored snapshot and records
   what the click did: route, dialog, menu, store paths, media records,
   announcement, toast, requests, errors. Controls are keyed by their own
   `data-ui` hooks and accessible name; a rebuilt control may add hooks,
   never lose them. Two recordings are byte-identical, and a deliberate
   mis-wiring fails the suite. The baseline tolerates the render-time writes
   the M1 tree already makes (lazy topic progress rows, `custom.quizzes`,
   per-module `state.media` preferences, `todo.habits`, `goals.items`,
   `assistant`, `worked.last`, the OOP sandbox seed); a view listed as
   rebuilt must render with none (view-contracts §0.2.3). *Parity is
   measured as effects rather than spied call lists*, so a rewritten view
   that reaches the same service by a different helper still passes.
2. **The visual audit on hooks.** `tools/visual_audit.mjs` drove the
   browser through 365 legacy class tokens in 287 selector literals, which
   M1's generation never scanned. They are hooks, state or intent now; the
   five negative "retired X" checks keep their names, as M1 did for the
   suites. **60 rows were added to `js/core/ui-hooks.js`**, in a labelled
   block, for classes only the audit queried — M1's generation completed,
   not new vocabulary; they leave with their views. The converted audit
   passed against the M1 look before the purge, exactly as the original did.
3. **Scorched earth.** `tools/ui-legacy-classes.json` was generated from
   `main.css` first (**2,397** classes from rule preludes; the Phase 1
   figure of ~2,416 counted comment and file-name noise), by
   `tools/gen_legacy_classes.js`, which reads a Git revision so it stays
   reproducible. Then: `css/main.css` and the three root mockups removed;
   the petal backdrop (and its hook row), the Google Fonts link and its
   preconnects removed from `index.html`; `sw.js` no longer lists the
   stylesheet (every linked layer is derived at install); the deploy script
   refuses a stray `main.css` and checks every linked sheet was staged.
   Thirteen empty layer files are linked in cascade order — `tokens`,
   `base`, `layout`, `components`, the eight `views/*` domains of §3.2,
   `themes` — each wrapping one `@layer` block, with the order statement at
   the top of `tokens.css`. The 153 stylesheet assertions were acted on as
   [css-assertions.md](css-assertions.md) records: 49 contracts kept (they
   wait for their layer through `pending()` in `tools/lib/css.js` and switch
   on by themselves), 6 "contract" rows re-read as legacy and deleted, 25
   legacy pins rewritten as selector-agnostic layer contracts, 73 deleted.
   `smoke55` guards the purge, the frozen vocabulary, every sheet (k- or
   the two kept utilities `.sr-only`/`.skip-link`, no `[data-ui]` selector,
   colour literals only in tokens/themes, raw px only in tokens, the five
   tiers), rebuilt markup and the depth budget, and proves each guard bites
   on a fixture. `tools/ui-migration.json` lists the rebuilt files (the
   thirteen sheets) and views (none yet).

Consequences to know about until the layers are written: the app renders
as unstyled semantic HTML; canvas text in the labs and the Shrine share
card names Fraunces/IBM Plex Mono/Shippori Mincho and falls back to system
families until M3 chooses the type (the Shrine's self-hosted fonts are
unaffected); `sw.js` `VERSION` is unchanged because nothing deploys before
M14. `tools/mobile_audit.mjs` still toggles the retired `.tree-closed`
class and queries `.confirm-ov`, a drift that predates M2.

### M3 as delivered (2026-09-24) — awaiting sign-off

- **`css/tokens.css`**: the "beni and ai" palette (safflower crimson and
  indigo, the two dyes of the workshop the app is named after). Indigo
  neutral ramp `--ai-0..1000`, safflower `--beni-*`, semantic hues (pine
  good, turmeric warn, vermilion danger, ultramarine info and focus, gold
  for the Governor), the three subject hues in their jade/blue/violet
  families, calendar hue angles for `--ev-hue`. Dawn on `:root` and
  `[data-theme="atelier-dawn"]`, Dusk on `[data-theme="atelier-dusk"]` and,
  for an unpinned install on a dark device, `:root:not([data-theme])` /
  `:root[data-theme=""]` (the default id stamps an empty attribute). Every
  theme block also matches a scoped element, so a theme can be previewed
  inside a page. Type (Bricolage Grotesque, Atkinson Hyperlegible Next and
  Mono; the system mincho for the kanji marks), the 11–41 scale, spacing
  `--space-0..12`, hit areas, radii, `--shadow-ink` and `--elev-0..4`, the
  `--z-*` scale, motion, and the five tiers documented and applied
  widest-first. A labelled bridge aliases the pre-rebuild token names the
  JavaScript still reads (charts, figures, labs); it empties by M14.
- **`css/base.css`**: reset, element defaults, focus ring, `.sr-only` and
  `.skip-link`, touch-target baselines, `#app` 100vh → 100dvh, 16px phone
  inputs, KaTeX harmonisation, reduced motion. The whole (still unstyled)
  app now draws its ground, ink and type from the tokens.
- **`design/foundation.html`**: the specimen — both palettes with live
  hex values and a WCAG contrast table (every text role passes AA on every
  surface in both themes), ramps, type, space, radii, hit areas, elevation,
  the z-scale, control and layout-primitive proposals, and the topic page
  composed at 1440 and 390 through container queries at the five tiers.
  `tools/foundation_artifact.mjs` packages it for the review link.
- The fonts are not yet linked from `index.html` (smoke55 still holds the
  M2 line); M4 adds the link after sign-off.

### The Graphite design (2026-09-25) — supersedes the M3 spec

The M3 "beni and ai" spec was not approved. The product owner designed the
interface in Claude Design instead, and every screen of that handoff
("Graphite": `design_handoff_kurenaios_overhaul/README.md` and its
`KurenaiOS Overhaul.dc.html`, frames 7a–14c) is approved and high-fidelity.
From here the handoff is the visual source of truth; the view contracts,
the invariants and the hook contract still govern behaviour.

- **Order.** The handoff's order maps onto the milestones: (1) tokens, fonts,
  shell and primitives = M3 + M4 + M5; (2) Home = M6; (3) Study = M7;
  (4) Productivity = M8; (5) Collection = M9 + M10 (the 11b vault template
  built once); (6) Governor, (8) Archive = M11; (7) Assistant = M12. The
  light Dawn theme and the shop themes stay M13; release M14.
- **Themes.** Graphite is dark and is the only designed theme. Until Dawn is
  designed every theme id renders Graphite; invariant 26a ("Atelier Dawn is
  the default") is amended at M14.
- **Desktop first.** The handoff is 1280px and leaves mobile for a later
  round; the phone composition (invariant 40) keeps working on the new
  shell, restyled minimally, until its own design exists.
- **Deviations kept on purpose.** Labels drawn at 10.5px in the mocks are set
  at the 11px floor (invariant 63). The shell keeps Back/Forward beside the
  search (an installed app has no browser chrome). The rejected
  `design/foundation.html` and its packaging script are removed.

### Step 1 as delivered — tokens, fonts, shell and primitives

- `css/tokens.css`: Graphite in oklch exactly as the handoff tabulates it
  (`--bg --s1 --s2 --s3 --line --text --text-2 --muted`, crimson and its
  ink, teal, amber, green, red, gold, bloom, the three subject and four
  medium hues), the handoff's type, spacing and radius scales named by
  value, the shell's measures, `--shadow-ink`/`--elev-*` for floating layers
  only, the `--z-*` scale, motion, the five tiers. The bridge of legacy
  names the JavaScript reads now aliases the Graphite roles.
- `index.html`: the four families (Onest, JetBrains Mono, Shippori Mincho,
  Newsreader); the shell rebuilt — bloom logo, centred search pill with its
  `/` key, clock over date, bell, assistant emblem, sync dot; the 212px
  rail of kanji tiles (crimson gradient tile and 3px bar when lit), the
  profile chip with an HP ring at its foot, a 72px tiles-only rail when
  collapsed or beside the spec spine. index.html is listed in
  `tools/ui-migration.json`.
- `css/layout.css`, `css/components.css`: the shell, and the primitives —
  page head, pill sub-navigation (the first group in a track, the rest loose
  after a divider, with dots, kanji marks and live counts), quiet switcher,
  card, row, kanji tile, pill buttons, chips, bars, stats, empty state,
  scroller, menu, dialog, toast, fields, image crop.
- `js/core/ui.js`, `governor.js`, `notifications.js`, `cloudui.js`,
  `imagecrop.js`, `mobile-shell.js`, the search dropdown in `hub.js`: the
  primitives and shell pieces emit `k-` classes and their hooks explicitly.
  Sub-navigation entries are named by their plain label (a dot, a mark or a
  count is not part of the name). A modal from a view not yet rebuilt gets
  the dialog frame from `openDialog`, and bare buttons and fields default to
  the ghost pill and the inset field, so every unrebuilt view stays usable.
- `tools/baselines/render-purity.renames.json`: smoke56's list of deliberate
  accessible-name changes (the subject pills lose their percentage, the
  profile chip gains an explicit name, a lens tab is named by its label);
  every recorded effect still matches.

### Step 2 as delivered — Home (frame 7a)

- `KOS.views.home` (`js/modules/hub.js`) is rebuilt on `k-` classes and
  `css/views/home.css`, and is the first view listed under `views` in
  `tools/ui-migration.json`: it renders without writing data (its habit read
  no longer materialises `todo.habits`) and inside the depth budget.
- The hero carries the user's banner behind the design's own scrim
  (`applyBanner({ scrim: "hero" })`), the HP ring around the avatar, the
  greeting with the streak, level and HP, and the daily goal — today's
  generated directives, ticked in place (`KOS.todo.setChecked`), or the
  recovery wins while Critical (nothing locks, invariant 2).
- Routines and Reminders are read-only digests with their own links. Up next
  is the canonical ladder (`nextAction`) with a Focus/Review switch; the
  Focus side skips the due-cards rung (`nextAction({ skipDue: true })`) so the
  two sides never say the same thing. Today and Upcoming collapse to one
  quiet line when both are empty and a lone card takes the full width;
  assignment rows open the one Assignment dialog in place.
- Study hours replaces the headline tiles and the seven pips: the week's
  chart (one `role="img"`, seven dated days), the streak and cards-due figures
  beneath it, the subject split. The week's plan card (`KOS.pacingHomeCard`)
  shows five rows, carried rows first, and counts the rest.
- Continue: one desk per subject (ring, Topics done / total, the single
  weakest topic from `KOS.rag.worst`, Continue) and the Collection desk, still
  filled only once it is on screen (invariant 8).
- Tests moved with the design, each with a note: smoke2/3/30/43/49. smoke56
  gained surface-scoped rules and **retirements** — a retirement excuses a
  control's absence only (a capped list, a panel folded elsewhere), never a
  change in what it does, and a `reachable` one must still be matched by a
  control on the page. Home's renames and retirements are in
  `tools/baselines/render-purity.renames.json`.

### Step 3a as delivered — the subject desk (frame 8a)

- `KOS.views.subject` is rebuilt on `k-` classes (`css/views/study.css`) and
  registered as a rebuilt view. Four rows: the hero (mastery ring, board and
  streak, one row per paper) beside Continue and Weakest; the analytics
  (eight tiles, their context on the tooltip and the accessible text, the
  definitions behind "What do these mean?") beside Deadlines; the course
  units; Practice beside Resources ("+ Add" is a dialog now).
- **The desk carries no spine.** Frame 8a draws the full rail and no tree;
  each course unit opens its section's topic page (the current topic, else
  the first unfinished one), where the spine is. Invariant 51 is amended at
  M14 to say so: the spine is the topic page's section list.
- The shell gained a page-actions slot on the sub-navigation row
  (`KOS.shell.actions`, cleared on every navigation); the desk's Compare and
  Start focus sit there.
- `KOS.calendar.openCountdown(row, done)` is the one routing for a countdown
  row (Home, the desk, the widget); `KOS.rag.why(t)` is the one line on why a
  topic is flagged. The dated row (`k-day-row`, `k-days-dot`) moved from the
  Home sheet to the components layer.
- smoke56 rules can now select by `navTo`, drop named side effects on both
  sides (`dropEffects`) and replace a control's contract (`expect`); every
  rule keeps its `why`.

### Step 3b as delivered — the spine and the topic page (frames 8b, 8c)

- The spine (`renderTree`) is rebuilt: a subject switch (each pill opens that
  subject's desk), a topic filter, the board line with the subject's
  completion, section rows that only disclose, group rows, and the entries —
  mastery as a vertical bar, the RAG band as a dot, ◆ where revision notes
  exist. A closed spine is reopened from the ☰ in the topic header.
- `KOS.views.ref` is rebuilt: the stage runs without padding or the
  sub-navigation row (`KOS.shell.bleed`); the title with its ref chip, the
  path and the neighbouring topics as round ‹ ›; one static study-nav (the
  first four tabs, the rest behind "+N ▾", the Edit control, and on a paged
  note "Page x of y — title" with page dots); the inspector runs the full
  height beside the column. The spec tab is two cards with the examiner's
  guidance as callouts (8c). The engines inside the other tabs (flashcards,
  quiz, exam, files) and the note blocks are rebuilt in steps 3c–3d.
- The Topic Status component keeps its contract in the inspector: status
  and the RAG circles on one row, the four checks as custom boxes, and what
  the data says as one quiet line beneath (`KOS.rag.picker` now returns
  `{node, auto}`).
- smoke56 `via` lets a reachable retirement look outside the replayed
  regions (the spine's subject switch lives in `#tree`).

### Step 3c as delivered — the tab panels (frames 8d–8i)

- **Flashcards** (`js/engines/flashcards.js`, now a rebuilt file): the mode
  pills, a row of pips, the card over a second card's edge, the four
  ratings each naming the interval it schedules (`KOS.srs.preview`, a pure
  SM-2 step shared with `rate`), one line of the card's history, the keys,
  and the deck's figures with the session controls. The deck browser and
  the Personal Deck's card form are rebuilt too.
- **Quiz and exam questions** (`js/engines/quiz.js`, rebuilt): one question
  at a time with "Question x of N". An MCQ locks on the first answer, marks
  the right option, says why and offers the next question (1–9 answer, Enter
  moves on). An exam question reveals its scheme as a checklist when there
  is a point per mark, and keeps the mark buttons for a banded scheme; one
  Log per item, as before.
- **Worked examples** (`mountGenerator` in `js/labs/worked.js`): the title
  with "↻ New numbers", your numbers, the working as ruled steps revealed
  one at a time and the answer in its own box; a topic's second and later
  generators wait behind their titles. The Worked Examples page itself is
  the Labs step.
- **Simulations**: a gated one is one row — what it is, why it is closed,
  Unlock (`KOS.governor.lockPanel(…, {compact})`); the whole-page lock is
  the same statement centred.
- **Files** (`js/modules/attachments.js`, rebuilt): the list with type
  badges beside one preview card (name and actions, fit/zoom, the preview,
  the notes beneath). The topic tabs now fold by the width available, so
  with the inspector folded every tab shows (8i).

### Step 3d as delivered — note blocks and the editor (frames 8j, 8k)

- `js/core/content.js` (now a rebuilt file) renders all fourteen block
  types to the design: paragraph and Markdown in one reading measure, h3
  headings, custom bullets and numbers, key terms and tables as ruled
  cards, code with a language/caption/Copy head, the eight callouts, step
  by step as a numbered rail, the worked example as Given/Step rows with
  its marks and an answer box, the diagram link as a card, figures with
  captions. Every block carries its hook explicitly (`content.*`).
- The syntax highlighter is rewritten as one tokenising pass per language
  (Python, pseudocode, C#, SQL, JavaScript): comments, strings, numbers,
  keywords, calls, self/this and operators, each token escaped; a block
  with no language stays plain.
- `js/modules/editor.js` (rebuilt) sits LEFT of the live preview while
  editing: a header naming the topic and the kind with its fork state, the
  page chips (numbered like the reader, "+ page"), block rows with a grip,
  a type chip, the summary and hover tools, the open block's form, and
  "Add a block" as a filtered grid of every type.

### Step 3e as delivered — Review (frames 9a, 9b)

- `review.js`, `due.js` and `cardstats.js` are rebuilt files. The Review
  header carries the quiet Due today / Card stats switcher (and, on Card
  stats, the All / CS / Maths / IT scope beside it).
- **Due today is an overview first**: the queue as a hero (count, overdue,
  the subject split with an estimate, Start review · all N and Overdue
  first), the next seven days, the queue by topic (each row reviewable on
  its own, sortable), the personal deck, the backlog warning and today so
  far. A run (`review {tab:"due", run:"all"|"overdue"|"sid:ref"}`) swaps in
  the session; the `due` route — every "review now" button — opens straight
  into the whole queue.
- **Card stats**: one strip of figures, reviews per day (30 days) beside the
  rating mix as a stacked bar, the due forecast beside the ease
  distribution, and the per-topic breakdown for every subject in scope.
  Chart colours are theme tokens; the low-data rule (invariant 76) holds.

### Step 3f/3g as delivered — Assignments and Exams & Papers (frames 9c–9e)

- `assignments.js` and `tracker.js` are rebuilt files. Assignments is one
  grouped list (Overdue / This week / Later / No deadline / Done) under four
  pill filters; a row opens an inline panel, and the modal detail is the
  same body (`detailBody`). The edit form is a `k-dialog`. The Home-only
  urgent card is gone, because Home reads assignments itself.
- Exams & Papers: kind tabs, a strip of figures, the trend, and a table
  whose row title opens its detail in place. Logging is a dialog with kind
  tabs and a live preview line.
- Every Study view is now in `ui-migration.json`, so smoke56 holds them to
  render purity. The topic page reads progress through `peekProgress` and
  `customQuizFor` no longer materialises `custom.quizzes`. The first real
  edit creates the record. Two parity rules record this: opening a topic
  drops the old on-arrival writes, and a field write folds into its record.
  `rewriteEffects` now normalises both sides of the comparison, the same way
  `dropEffects` does.
- `openDialog` stamps `ui.dialog-overlay`/`ui.dialog` on every dialog, so
  rebuilt dialogs pass the modal audit and release the scroll lock.

### Step 4a–4d as delivered — Focus, Reminders, Habits, Calendar (frames 10a–10e)

- `focus.js`, `reminders.js`, `todo.js` and `calendar.js` are rebuilt files.
- **Focus (10a/10b)**:
  - The setup page is one hero card: a dial with −5/+5 beside the form. The form has a Pomodoro / Custom / Reading switcher, the links, the objective and the tab-switch switch.
  - "From today's plan" fills the form from today's first unticked study block. It starts nothing.
  - "Your record" and "The deal" sit beside the hero, with the last five sessions below. The deal is still quoted from `focusAward`.
  - The stage has three columns around one ring: objective, context, stats and eligibility on the left; the clock in the middle; quick notes on the right. The cycles show as a segmented bar.
  - The takeover has its own layer, `--z-focus`, because `--z-stage` is the page stage.
- **Reminders (10c)**:
  - Sections, lists and tags sit on the left, and the list is grouped by when.
  - The detail panel is on the right, and the quick-add bar can file a reminder into a list.
  - List dots use the calendar hues.
  - The mobile-shell disclosure trigger now uses the new vocabulary (`k-disclosure`). It shows only at the compact tier, gated on `data-shell` (invariant 72).
- **Habits (10d)**:
  - The week is a grid: tick, habit, seven day cells, and the streak with its best. It pages back by week.
  - Today's directives and a 12-week keeping heatmap sit beside it.
  - The page reads `todo.habits` without creating it.
  - `KOS.todo.panel()` and `KOS.remindersSummaryCard` were dead, because Home draws its own, so they are gone.
- **Calendar (10e)**:
  - The month is the page title. The grid is on a card with the legend, and Today and Countdowns sit beside it.
  - Every hue comes from `--ev-hue` through `data-type` / `data-colour` (invariant 46).
  - Week-grid geometry rides custom properties in hours (`--at`, `--span`, `--lane`, `--lanes`), and the stylesheet owns `--cal-hour-h`.
  - The 24px chip exception is documented at its rule.
- Shared additions:
  - `k-pill-select` and the toggle pill `k-qz-pill` moved into components.
  - `k-switch` exists.
  - A dialog head's trailing icon button sits at the end.
- New smoke56 rules:
  - Focus and Reminders renames.
  - Habits' on-arrival write dropped.
  - Countdown rows retired as reachable, now named by title, distance and kind.

### Step 4e as delivered — Pacing (frames 10f, 10g)

- `pacing.js` is a rebuilt file.
- **Week view**:
  - The ribbon is a tile per week, and its plan rows are segments: ticked, carried past their week, or still to come. The current week is inverted, and half term is hatched.
  - The week is a hero. The week label stays its h2, the facts are its sub-line (invariant 50c), and its actions sit beside it (invariant 50b). The tick count and segment bar, plus "N behind", are on the right.
  - Three subject cards on the subject's wash hold In class (with the scheme of work's lessons), the alignment line, and My plan (with the carried band). Each row is a tick beside a button.
  - "Due this week" and the week's note sit at the foot.
- **Braid**:
  - The commit-graph model stays (invariant 85). Every paint is now a class, and each lane's hue rides `--lane-hue`.
  - A tone legend sits in the card head.
  - The merges read as rows: ref, titles and weeks, a tone chip, Open.
- **Dialogs**: both editors share one k-dialog shell, with Delete in its own row apart from Save (invariant 84).
- The workspace-tabs variant now carries `ui.workspace-tabs` itself.
- smoke56 changes:
  - `reachable()` restores the toast text it found, so replaying a page cannot silence a later control's repeated toast.
  - Class rows are retired as reachable, because their sub-line now carries the refs and the due list moved.

### Step 5a as delivered — the vault template, Anime, the season, VN, Games (frames 11b, 11c, 11e, 11f, 11j)

- `medview.js` is rebuilt and builds 11b once for every medium: `vaultPage`, the spotlight hero, the Status + Lists rail, one controls row and the shared overlay card.
  - The controls row holds the count, then search, sort, Filters ▾, ▦/≡, Actions ▾ and the primary.
  - `KOS.medview.card` puts everything on the cover: the score top-left, ♥ top-right, the title, chips, progress and the bar. The status and +1 row shows on hover.
  - Every hook (`vault.*`) is explicit now rather than derived from a legacy class.
- The record editor is a right-hand drawer (11c). Delete stays apart from Cancel/Save.
- `KOS.media.progressBar` is the shared `k-bar`, with its fill on `--p`. The module accents are the medium tokens.
- Rebuilt files:
  - `anime.js` (vault, mirror editor and season).
  - `vn.js`: routes and chapters as tick rows; the quote log in the reading face with "+ Add to Personal deck".
  - `games.js`: tier, platform and priority chips toned by the stylesheet.
- This season (11j):
  - The seasonal hero lives only here: season title in Mincho on the scenery, ‹ ›, Art ▾ and Today.
  - The season's titles are horizontal cards that lead with the countdown.
- The VN and Games vaults read their prefs without creating them.
- Shell fixes:
  - The lazy observer watches `#stage`, the element that scrolls.
  - The compact disclosure triggers (Reminders and vaults) are `k-disclosure`. The rule lives in components so it beats `.k-btn`.
- Books and Mangaka (11d) are the next step.

### Step 5b as delivered — Books and Mangaka (frame 11d)

- `books.js` (Books and Mangaka) is a rebuilt file on the 11b template.
  The Digital / Physical lens rides the page header's action slot, and
  the layout switch is a ▦ ≡ 📚 segment (the shelf is the Physical lens's
  default).
- The physical vault in the drawer follows 11d. A band shows on the shelf
  / read / owned-unread / shelf value, and every volume up to the series
  length is a tile (read ✓, owned, or not owned). The selected tile opens
  its own record (condition, date, price, cover, remove). The range tool
  folds into a disclosure.
- Spine colours are tokens (`--spine-0…9`), and `spineColor` returns the
  token. The bookshelf, the volume tiles and the Mangaka marks all read it.
- Books reads its prefs without creating them; a pre-3i "shelf" pref is
  read as the Physical shelf rather than rewritten on open.
- Mangaka keeps its bounded author cards, sticky letter dividers and
  letter filter (invariant 55), now in the shared toolbar row.
- `KOS.ui.tabs` items accept an extra `hook`.

### Step 5c as delivered — the Collection Overview (frame 11a)

- `matrix.js` is a rebuilt file. The Overview follows 11a from top to bottom:
  - the figure band;
  - Currently consuming, with its "+1 ep" shortcut;
  - Airing soon, grouped by day, with a Seasonal view link;
  - the standings as stacked status bars;
  - the four module doors.
- The figure band is a `dl` hooked `coll.figures`, not a
  `ui.stat-strip`. Three to five facts ride one band (invariant 50c),
  and a zero figure is dropped (invariant 77).
- Analytics keeps the KPI strip and the charts. The Overview stays a
  summary and does not become a second vault (invariant 57).

### Risks and mitigations
- **Unstyled app between M2 and M14.** This is the branch only, and production never deploys from a push. If you want to use the app day-to-day meanwhile, production keeps the current build.
- **Behaviour regressions hidden inside the DOM rewrite.** `smoke56` compares action dispatch against the pre-rewrite spies recorded in M1, and each view commit carries only that view.
- **Scale.** 3,589 class sites across 36 views. The milestones are sized to one domain each, and M7, M8 and M10 split into per-view commits.
