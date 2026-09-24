# KurenaiOS view contracts

This is the Phase 1 / M0 deliverable for the presentation rebuild. The plan is in [PLAN.md](PLAN.md).
Measured on 2026-09-24 at `749f062`, branch `refactor/ui-ux-overhaul`.

This document is the **only** input for writing new markup. It says what each
surface *shows*, what it *does* and which *hooks* it must expose. It does not
say how anything looks, how it is nested or what it used to be called
(except in the M1 migration column). When you rebuild a view, work from its
section here, the invariants in `CLAUDE.md` and the service APIs. Do not open
the old render function to copy structure from it.

## 0. How to read a contract

Each view section uses the same fields.

| Field | Meaning |
|---|---|
| **Route** | `KOS.show(viewId, arg)` shape and the hash route it produces. The router (`js/core/router.js`) owns encoding and must not change. |
| **Section** | The rail section it lights and the subnav entry it marks active (`SECTION_OF` / `renderSubnav`, `js/core/ui.js`). |
| **Purpose** | The single question the page answers. If a region doesn't serve it, it doesn't belong. |
| **Shows** | An information inventory. It lists facts, not layout. Order is priority order, not DOM order. |
| **Actions** | User intent → the service call that performs it. These calls are the functional contract and move unchanged into the view's action layer. |
| **Hooks** | The `data-ui` names the view must emit, with the legacy class each one replaces. Tests, `mobile-shell.js` and cross-module lookups query hooks only. |
| **State** | Which attribute carries each piece of UI state (ARIA/native first, then `data-state`). |
| **A11y** | Headings, landmarks, focus rules and live announcements. |
| **Invariants** | `CLAUDE.md` rules the surface must keep. |
| **Coverage** | The smoke suites that exercise the view today. M1 moves them to hooks, and they must stay green. |

### 0.1 Hook conventions (they apply everywhere)

§M records how M1 put these in place on the legacy markup, and where the
delivered names and attributes differ from this section.

- **`data-ui="<domain>.<part>"`** gives structural identity. Names are lower
  kebab-case and dot-namespaced by domain: `shell`, `ui`, `home`, `study`, `topic`,
  `review`, `focus`, `cal`, `rem`, `asg`, `habit`, `pace`, `coll`, `vault`,
  `anime`, `books`, `vn`, `games`, `shrine`, `plan`, `goal`, `sync`, `profile`,
  `gov`, `shop`, `asst`, `notify`, `archive`, `help`, `lab`.
  Repeated items use the same name on every instance (`vault.card`), and the
  record identity goes in a data attribute beside it (`data-id`, `data-ref`,
  `data-sid`, `data-wb`, `data-module`).
- **A hook is never a styling selector.** CSS may not select `[data-ui]`
  (`smoke55` enforces this). Styling uses `k-` classes, which carry no meaning
  for logic and tests.
- **State lives in attributes, never in classes:**

| Legacy state class | Replacement |
|---|---|
| `hidden` | the native `hidden` attribute |
| `active` (rail, subnav, tabs, pills) | `aria-current="page"` for navigation; `aria-selected="true"` inside a `role="tablist"` |
| `on` (toggles, filters, choices) | `aria-pressed="true"` (toggle buttons) or `aria-checked` (radio/checkbox roles) |
| `open` / `closed` (disclosures) | `aria-expanded` on the control; `<details open>` where native |
| `is-loading`, `is-busy`, `is-working` | `aria-busy="true"` |
| `is-error`, `bad`, `img-failed` | `data-state="error"` / `data-state="failed"`, plus `aria-invalid` on fields |
| `no-tree`, `tree-closed` | `#cols[data-tree="none"|"closed"|"open"]` |
| `insp-closed` | `[data-ui="topic.inspector"][data-state="collapsed"]` plus `aria-expanded` on its toggle |
| `flipped`, `dragging`, `dragover`, `editing`, `revealed`, `live`, `returning`, `basing` | `data-state="<word>"` on the owning hook |
| `focus-mode`, `fx-minimised` | `<html data-focus="stage"|"docked"|"minimised">` |
| `modal-open`, `no-scroll` | `<html data-scroll-lock>` (set by `openDialog`) |
| `mobile-shell-ready` | `<html data-shell="ready">` |
| `asst-drawer-open`, `has-live-renderer`, `is-reacting` | `data-state` on `asst.drawer` / `asst.mascot` |
| `at-start`, `at-end` (scrollers) | `data-edge="start"|"end"|"both"|"none"` on `ui.scroller` |
| `sel`, `n-blk-sel` | `aria-current="true"` on the selected block |
| `pulse`, `copied`, `hot`, `lit`, `low`, `first-mount` | `data-state` (visual-only flags; CSS may read `data-state`) |

The rule is that **CSS may select state attributes** (`[aria-selected="true"]`,
`[data-state="error"]`, `[hidden]`) but never `data-ui`.

- **IDs that stay exactly as they are** because the router, search, notifications
  and tests depend on them: `#app #topbar #brand-home #nav-back #nav-fwd
  #searchbox #search #search-results #search-count #notify-mount
  #assistant-trigger #sync-status #cols #rail #rail-toggle #hud #node-count
  #tree #tree-scrim #stage #subnav #main #toast`, plus the rail counters
  `#pc-due #pc-compsci #pc-maths #pc-it`.
- **Existing data attributes that stay:** `data-section`, `data-view` (rail),
  `data-bid` (content blocks), `data-cid` (OOP classes), `data-sim`,
  `data-theme` (root), `data-imported`, `data-last-sync` (sync).

### 0.2 What every rebuilt view must do

1. Build its tree from the M5 primitives (§P). It may contain no literal
   `style` other than `--custom-property` values (`el()` asserts this in tests).
2. Emit exactly one `h1` through `KOS.ui.pageHeader`. Sections take `h2` through
   `sectionHeader`, and the heading levels never skip.
3. Render without writing data. `smoke56` renders each view twice and asserts
   the store JSON **outside `state.ui`** and the media records are byte-identical
   across renders and tab switches. `state.ui` is exempt because `KOS.show`
   writes `ui.view`, and views lazily create their per-device preference
   branches (for example `ui.reminders`, `ui.calMode`).
4. Keep navigation inside `KOS.show()`. Redraws use `KOS.rerender()` and change
   no URL, focus or announcement (inv. 65).
5. Suppress supporting facts that are only zeros (inv. 77), and print no bar
   without the value it describes (inv. 26d).

---

## S. The shell (M4)

Owner files: `index.html`, `js/core/ui.js` (nav, subnav, toast, `KOS.show`),
`js/core/governor.js` (HUD and profile popover), `js/modules/notifications.js`
(bell), `js/modules/assistant.js` (trigger and drawer), `js/modules/cloudui.js`
(sync chip), `js/modules/mobile-shell.js`, `js/core/pwa.js`.

### S-1 Global header (`#topbar`, a `<header>` landmark)
- **Shows:** a brand control that goes Home; Back/Forward (the router owns their
  disabled state); the global search combobox; the notification bell with
  unread count; the assistant trigger with a status dot; the cloud sync chip
  (hidden until cloud is configured).
- **Actions:** brand → `KOS.show("home")`; Back/Forward → router history
  (Alt+←/→); `/` focuses search (`hub.js` owns the shortcut); bell →
  `KOS.ui.menu` holding the five latest items (inv. 97); trigger → assistant
  drawer; chip → `KOS.show("data")`.
- **Hooks:** `shell.brand` ← `#topbar .brand`, and `shell.brand-mark` ←
  `.brand .kanji` (governor.js paints the rank mark into it);
  `shell.header-actions` ← `.topbar-right` (mobile-shell moves it);
  `notify.bell` ← `.notify-bell`; `notify.badge` ← `.notify-badge`.
- **A11y:** search is `role="combobox"` with `aria-expanded`/`aria-controls`
  pointing at `#search-results` (`role="listbox"`) and a polite `#search-count`.
  The sync chip is **not** a live region, because cloudui announces the
  transitions that matter (inv. 66). There is a skip link to `#main`.
- **Invariants:** 64, 66, 71, 73, 97.

### S-2 Primary rail (`<nav id="rail" aria-label="Primary">`)
- **Shows:** seven sections, each with a mark and a label: Home, Study,
  Productivity, Collection, Governor, Assistant, Archive. Study carries the due
  count (`#pc-due`). The foot holds the HUD/profile (`#hud`) and a polite
  `#node-count`.
- **Actions:** section → `KOS.show(...KOS.sectionLanding(sec))`; `#rail-toggle`
  collapses the rail (a per-device UI preference); the HUD opens the profile
  popover.
- **Hooks:** `shell.rail-item` (with `data-section`/`data-view` kept) ←
  `.rail-item`; `shell.rail-foot` ← `.rail-foot`; `gov.hud` ← `#hud .hud`;
  `gov.profile-pop` ← `.profile-pop`/`.profile-card`, with parts
  `gov.profile-name`, `gov.profile-status`, `gov.profile-about`,
  `gov.profile-action` (← `.hud-profile-name`, `.pc-status`, `.pc-about`,
  `.pc-action`).
- **State:** the lit section is `aria-current="page"` on its rail item, set in
  `KOS.show` (`ui.js`, today `classList.toggle("active")`). Exactly one item
  is lit (or none).
- **Phone (<700):** the rail becomes the bottom tab bar (inv. 40). Governor,
  Assistant and Archive move into a "More" sheet (`shell.more-sheet`).

### S-3 Section strip (`<nav id="subnav" aria-label="Section">`)
- **Shows:** the `SUBNAV[section]` entries, built with
  `KOS.ui.tabs({variant:"primary"})`. Group separators are
  `ui.tab-sep` ← `.subnav-sep`. Some entries carry counts
  (`pc-compsci` etc.).
- **Active mapping (keep exactly):** `ref`→its subject; `seasonal`,
  `mangaka`→`anime`; `due`, `cardstats`→`review`; `goals`→`wishlist`;
  `aniprofile`, `vndbprofile`→`mediasync`. `home`, `governor` and `assistant`
  have no strip (`#subnav[hidden]`).
- **Hooks:** `shell.subnav-item` ← `.subnav-item`; the phone scroller shell is
  `shell.subnav-scroller` ← `.subnav-scroller`, with arrows
  `ui.scroller-arrow` ← `.u-scroller-arrow`.
- **Invariants:** 50 (the one scroller exception keeps its nav landmark), 50b.

### S-4 Spec spine (`<aside id="tree" aria-label="Topic tree">`) and scrim
- **Shown only** on Study subject/ref views. Every other view sets
  `#cols[data-tree="none"]` (today `no-tree`, toggled by 35 call sites, so M1
  routes it through one helper, `KOS.shell.tree(mode)`).
- **Shows:** the subject name and board, a completion value with its bar, and
  collapse/reopen controls. Units → sections → leaves with status, a deep-content
  marker and the current location.
- **Actions:** leaf → `KOS.show("ref",{subject,ref})`; collapse/expand is a
  per-device preference (`state.ui.treeClosed`, `state.ui.openSections`); the
  scrim closes the overlay drawer (≤860).
- **Hooks:** `study.spine`, `study.spine-leaf` (`data-ref`) ← `.leaf`;
  `study.spine-toggle` ← `.tree-collapse`/`.tree-reopen`.
- **State:** `#cols[data-tree]`; the current leaf is `aria-current="location"`
  (today `.leaf.active`); sections use `aria-expanded`.
- **Invariants:** 51 (the only section list for Study, owning expansion and the
  compact drawer), 54.

### S-5 Stage, toast and dialog host
- `#stage` holds `#subnav` and `<main id="main" tabindex="-1">`. `KOS.show`
  empties `#main`, resets scroll and removes a per-view `--accent`
  (`ui.js` `KOS.show`).
- `#toast` is visible-only and `aria-hidden` (inv. 66). `KOS.ui.toast(msg, bad)`
  sets `data-state="show"|"show error"` instead of writing `className`.
- Dialogs are appended by `openDialog` only (P-9).

### S-6 Mobile shell (`js/modules/mobile-shell.js`)
- **Responsibilities (unchanged):** move canonical search, filter and section
  controls into sheets and restore them; the compact "Browse sections, lists &
  tags" sheet for Reminders; the "Status & lists" sheet for vaults; a
  breakpoint redraw that waits for an open dialog (inv. 74).
- **Lookups become hooks:** `.med-layout` → `vault.layout`;
  `:scope > .med-filter-rail` → `vault.filter-rail`; `:scope > .med-main` →
  `vault.main`; `.rem-grid` → `rem.layout`; `:scope > .rem-side` → `rem.side`;
  `.topbar-right` → `shell.header-actions`; `.rail-foot` → `shell.rail-foot`;
  `.subnav-item.active` → `[data-ui="shell.subnav-item"][aria-current="page"]`.
- **Hooks it emits:** `shell.search-sheet` ← `.mobile-search-sheet`;
  `shell.compact-sheet` ← `.mobile-compact-sheet`; `shell.more-sheet`.
- **State:** `<html data-shell="ready">` gates the JS-dependent hiding (inv. 72).
- **Invariants:** 40, 58, 72, 73, 74, 75. **Coverage:** smoke37, 42, 46.

---

## P. Shared primitives (M5)

The primitives are the only building blocks views may use. Each one owns its
hook, its ARIA and its keyboard behaviour. None of them take a class for
styling: they take a `variant`, and the CSS maps variants to `k-` classes.

| # | Primitive (owner) | Contract | Hooks (← legacy) | Coverage |
|---|---|---|---|---|
| P-1 | `el(tag, attrs, children)` `ui.js` | Omits null/undefined attributes (inv. 68). `style` accepts `--*` declarations only. In test mode, `class` must be `k-` tokens. `html` is allowed only for the content renderer and sims. | — | all |
| P-2 | `KOS.ui.tabs(items, {variant, label})` | variants `primary` (section strip), `workspace` (page switchers), `lens` (Books lenses), `local` (in-page). `role="tablist"` for local/lens and `<nav>` + `aria-current` for navigational variants; arrow-key roving; optional count per item (never printed at zero, inv. 77) | `ui.tabs`, `ui.tab` (← `.study-tabs`, `.study-tab`), `ui.tab-count` (← `.tab-n`), `ui.tab-sep` (← `.subnav-sep`) | 8,9,12,14,15,21,24,29,38,42,44,52,53 |
| P-3 | `KOS.workspaceTabs`, `KOS.collectionWorkspaceTabs(area, current)` | Rides the page header's action slot (inv. 50b). Planner = Budget Planner, Goals. Sync = AniList, VNDB, Sync & Import. Review = Due, Card Stats. | `ui.workspace-tabs` (← `.profile-workspace-tabs`, `.collection-workspace-tabs`) | 42, 44, 49 |
| P-4 | `KOS.ui.pageHeader({kicker,title,sub,actions})` | Exactly one `h1`. `sub` is **one line** on the muted token (inv. 50a). `actions` is the only place for a page switcher. | `ui.page-head` (← `.dash-head`/`.page-header`), `ui.page-kicker`, `ui.page-sub` (← `.dh-sub > span.board`), `ui.page-actions` (← `.dh-actions`) | 4, 15, 44, 52, 53 |
| P-5 | `KOS.ui.sectionHeader({title,sub,actions,level})` | An `h2` by default. Week/page facts go on the sub-line rather than in stat boxes (inv. 50c). | `ui.section-head` (← `.sec-head`), `ui.section-title`, `ui.section-sub` | 37, 43 |
| P-6 | `KOS.ui.emptyState({mark,title,body,action,compact})` | Compact where the page is otherwise full (inv. 53). The title is not an accessible name for anything else (inv. 68). | `ui.empty` (← `.empty-state`), `ui.empty-action` (← `.empty-state-action`) | 45, 47 |
| P-7 | `KOS.ui.statTile({label,value,sub})` | Only for a genuine metric strip (inv. 50c). The value goes through `num()`, and a zero-only supporting fact is suppressed (inv. 77). | `ui.stat` (← `.stat-card`), `ui.stat-strip` (← `.stat-strip`) | 4, 5, 8, 42, 44, 47, 52 |
| P-8 | `KOS.ui.scroller(node,{label})` | Declared horizontal overflow (inv. 50), with arrow buttons and an edge state | `ui.scroller`, `ui.scroller-arrow` (← `.u-scroller-arrow`); `data-edge` | 37, 42 |
| P-9 | `KOS.ui.openDialog(overlay, opts)` | The **only** modal route (inv. 49): name, `aria-modal`, focus trap and restore, scroll lock, Escape, dialog stack. Box lookup becomes `[data-ui="ui.dialog"]`, and the name comes from `ui.dialog-title`. | `ui.dialog-overlay` (← `.modal-ov`), `ui.dialog` (← `.modal`, `.confirm-modal`, `[data-dialog-box]`), `ui.dialog-title` (← `.modal-h b`, `.confirm-title`), `ui.dialog-foot` | 5,6,8,9,11,14,38,42,45,46,49 |
| P-10 | `KOS.ui.confirm(opts, yes, no)` | `danger:true` focuses Cancel and never confirms on Enter. Delete never shares a group with Save (inv. 45, 84). | `ui.confirm`, `ui.confirm-foot` (← `.confirm-foot`), `ui.confirm-yes`, `ui.confirm-no` | 21, 36, 42, 45, 49, 52 |
| P-11 | `KOS.ui.menu({label,items})` | A popover menu button. Closed by `KOS.show` (a stale panel must never survive navigation). | `ui.menu-button`, `ui.menu-panel` (← `.menu-panel`), `ui.menu-item` (← `.menu-item-lbl`), `ui.menu-count` (← `.menu-btn-n`) | 11, 53 |
| P-12 | `KOS.ui.num(n)` | Locale formatting. Balances are formatted context, never a bar (inv. 78). | — | — |
| P-13 | `KOS.media.progressBar/progressText/progressPct/progressFill` (`media.js`) | THE card bar (inv. 63): a fraction, `open` (half-full when there is no total), volumes for Books; no bar when not started. Uses a `<meter>`-equivalent with a text value. | `media.bar` (← `.subj-track`/`.subj-fill` in media use), `media.bar-text` | 43, 54 |
| P-14 | `KOS.imageCrop.open/apply/image/background/normalise` (`imagecrop.js`) | The only crop/focal workflow (inv. 26c). Source and `{x,y,zoom}` are stored separately; cancel/reset never write; the focal point is applied through `--crop-x/--crop-y/--crop-zoom` custom properties. | `crop.dialog` (← `.cropper-modal`), `crop.preview` (← `.cropper-preview`), `crop.file` (← `.cropper-file`), `crop.url` (← `.cropper-url`), `crop.status` (← `.cropper-status`), `crop.foot` (← `.cropper-foot`), `crop.host` (← `.image-crop-host`), `crop.media` (← `.crop-media`), `crop.bg` (← `.image-crop-bg`), `crop.shade` (← `.image-crop-shade`) | 16, 31, 53 |
| P-15 | `KOS.charts.*` (`charts.js`) | Labelled axes and marks, an 11px label floor, honest low-data states (inv. 63, 76). Colours from tokens only. | `chart.frame` (← `.cs-chart`), `chart.multi` (← `.cs-multi`, `.cs-multi-h`, `.cs-multi-panel`, `.cs-multi-legend`), `chart.donut` (← `.donut-wrap`), `chart.heatmap` (← `.heat-svg`) | 8, 9, 11, 44, 47, 52 |
| P-16 | `KOS.medview` shared bits (`medview.js`) | `modalOverlay`, `field`, `emptyState`, `cover`, `listRow`, `quickRow`, `quickScore`, `pushChip`, `bumpUnit`, `quickEdit`, `coverPositionControl`, `unavailable`. These stay as named helpers, re-expressed on P-1…P-14. | see V-18 | many |
| P-17 | Form fields | label + control + hint + error; 16px text on phone (inv. 40); hit area 32/44px (inv. 69); `aria-invalid` + described-by error | `ui.field` (← `.med-field`, `.cal-field`), `ui.form` (← `.med-form`), `ui.check` (← `.chk`, `.rem-check`, `.cal-check`) | 30, 35, 36, 37, 49, 52 |
| P-18 | Buttons | intents `primary` (at most one per region), `default`, `quiet`, `danger`; sizes `md`/`sm`. Classes `.btn`, `.primary`, `.mini-btn`, `.danger` are retired. Tests address buttons by hook or accessible name, never by intent. | `ui.button` is not needed: tests use `getByRole`-style name lookups or a feature hook | 21–53 |

---
## V. Views

### V-01 `home`: Home (M6)
- **Route:** `KOS.show("home")` → `#/home`. **Section:** Home, with no strip and no spine.
- **Owner:** `js/modules/hub.js` (`KOS.views.home`, `nextAction()`); cards from
  `pacing.js` (`KOS.pacingHomeCard`), `assignments.js`
  (`KOS.assignmentsUrgentCard`), `calendar.js` (`KOS.calendar.countdownWidget`),
  `todo.js` (`KOS.todo.panel`).
- **Purpose:** "What should I do next?" (inv. 53).
- **Shows, in priority order:**
  1. The day line and a greeting (the page `h1`).
  2. A Governor state notice, only when HP is Strained or Critical. It is
     informative, not a lock (inv. 2).
  3. **The next action:** one statement, one reason, one action, and the page's
     only primary button. The ladder is: running focus session → cards due →
     dated countdown → behind on the plan (inv. 82b) → first open directive →
     where you left off → clear board.
  4. The identity band: avatar, name, level, status line, banner (from
     `KOS.governor.profile/bannerCss/avatarNode`), plus study and rest streak
     chips, kept separate (inv. 4).
  5. Three facts for this week: day streak, cards due (navigates to `due`),
     hours logged with the session count. These are not stat tiles
     (inv. 50c, 77).
  6. Today's path (the habit and reminder directives) and the horizon
     (countdowns, urgent assignments, this week's plan card). When both are
     empty, this whole area is **one quiet line** with the action that would
     fill it.
  7. Desks: the three subjects (completion value and bar, due count) plus the
     Collection desk (library completion from `KOS.mediadb.stats`, which is a
     full-table scan and so is loaded asynchronously).
  8. Struggling topics across subjects (the RAG confidence panel `KOS.rag.panel`).
- **Actions:** next-action CTA (`KOS.show` to focus/due/ref/pacing/calendar);
  edit status (`KOS.governor.editProfileText`); streak and due fact →
  `KOS.show("due")`; subject desk → `KOS.show("subject", sid)`; Collection desk →
  `KOS.show("matrix")`; tick a plan row (`KOS.pacing.setDone` through the card);
  tick a directive (`KOS.todo`); governor notice → `KOS.show("governor")`.
- **Hooks:** `home.hero` ← `.home-hero`; `home.next` ← `.home-next`, with parts
  `home.next-kicker` ← `.hn-kicker`, `home.next-label` ← `.hn-label`,
  `home.next-why` ← `.hn-why`; `home.status` ← `.hi-status`; `home.streak` ←
  `.streak-chip`; `home.facts` ← `.hi-stats`; `home.desk` (with `data-sid` or
  `data-module="collection"`) ← `.subj-card`/`.med-home-card`, and
  `home.desk-open` ← `.subj-card-open`; `pace.home` (P-card) ← `.pace-home`,
  `pace.home-row` ← `.pace-home-row`, `pace.tick` ← `.pace-tick`.
- **State:** `home.next[data-state="live"]` while a session runs.
- **A11y:** the facts are native buttons where clickable (today a
  `div role=button` → replace). The profile band carries no heading above
  `h2`. `home.next` is a `<section aria-label="What to do next">`.
- **Invariants:** 2, 4, 26d, 50c, 53, 54, 77, 82b.
- **Coverage:** renders in smoke, smoke2, 3, 4, 9, 15, 22, 30, 33, 43, 45; hooks in smoke4, 43, 52, 54.

### V-02 `subject`: Subject desk (M7)
- **Route:** `KOS.show("subject", sid)`, where `sid` ∈ `compsci|maths|it` →
  `#/subject/<sid>`. **Section:** Study; the strip lights the subject. **Spine:** shown.
- **Owner:** `hub.js` (`KOS.views.subject`). Stats are derived once in `hub.js`
  (inv. 26d).
- **Purpose:** "Where am I in this subject, and what can I do here?"
- **Shows:** subject name, board identity and overall completion (one value,
  one bar); continue state (last ref, deep link); board band with one entry per
  paper/unit (completion, topic counts), which can scroll sideways (a declared
  scroller); subject analytics (status distribution, confidence, card state,
  tracker scores); practice zone (sims, worked generators, sandboxes available
  for the subject, gated only by gold one-time unlocks, inv. 2); resources
  table (name, link, optional ref, remove); a context column with dates
  (countdowns for the subject) and recommendations.
- **Actions:** open topic → `KOS.show("ref",{subject,ref})`; open sim →
  `KOS.sims.open`/`KOS.show("sims", id)`; worked → `KOS.show("worked")`;
  add/remove resource (writes `state.resources`, remove through `confirm`
  danger); focus on subject → `KOS.show("focus", {...})`.
- **Hooks:** `study.subject` (`data-sid`); `study.continue` ←
  `.continue-action`; `study.units` ← `.subject-units`; `study.unit` ←
  `.unit-stat`; `study.analytics` ← `.subj-analytics`, with parts
  `study.analytics-grid` ← `.sa-grid`, `study.analytics-tile` ← `.sa-tile`,
  `study.analytics-track` ← `.sa-track`, `study.analytics-foot` ←
  `.sa-foot`/`.sa-foot-fact`; `study.practice`; `study.resources`,
  `study.resource-row`.
- **State:** the study grid (`.study-grid`) becomes `study.grid`, a layout-only hook that tests may use but CSS may not.
- **Invariants:** 2, 26 (subject hue via `--accent` on `#main`, reset by
  `KOS.show`), 26d, 50, 51, 54, 77.
- **Coverage:** smoke, smoke2, 3, 15, 33, 37, 42, 43, 45, 46.

### V-03 `ref`: Topic page (M7)
- **Route:** `KOS.show("ref", {subject, ref})` → `#/ref/<sid>/<ref>`. **Section:**
  Study; the strip lights the subject. **Spine:** shown, with the current leaf
  marked.
- **Owner:** `hub.js` (`KOS.views.ref`). The renderer is `KOS.content.renderBlocks/
  splitPages/typeset/inline` (`content.js`); the editor is `KOS.editor.mount`
  (`editor.js`); engines are `KOS.flashcards.mount`, `KOS.quiz.mountMCQ/mountExam`;
  labs are `KOS.worked.mount`, `KOS.sims.forRef`; attachments are `KOS.attach.mountTab`;
  assistant actions are `KOS.assistant.contextActions`.
- **Purpose:** "Study this topic." Content first (inv. 52).
- **Shows:**
  1. **One header row:** ref, title, subject crumb, and one Edit control for
     whatever tab is open.
  2. **One static study-nav row** (not sticky): tabs for Specification, Notes,
     Flashcards, Quiz, Exam, Worked, Sims and Files, each with its material count
     printed once on the chip. Notes, Quiz and Exam are always present, and a zero
     count is never printed (inv. 77, 89).
  3. **The tab body:** notes are paged (pager with previous/choose/next and a page
     select); blocks are wrapped as `note-block[data-bid]`; KaTeX is typeset.
     Other tabs mount their engine. Empty tabs show a compact empty state
     whose action opens the editor.
  4. **The inspector, the only state surface:** topic status select, confidence
     (RAG picker), checklist (spec points), completion percentage, SM-2 card
     summary, tracker results, neighbouring topics, prev/next, compare topics,
     and assistant topic actions. It is collapsible, and the preference is
     per device (`state.ui.inspectorOpen`).
  5. **The study editor**, when open: `KOS.editor.mount` beside the page, which
     acts as the preview (`openTab({keep, reveal})`, inv. 89). `state.ui.editing`
     reopens it after a redraw.
- **Actions:** status → `store` progress through the existing setter (marking
  Completed fills the checklist); confidence → `KOS.rag`; flip or rate cards →
  engine (`KOS.srs.rate`, `KOS.sessions.log`); quiz/exam self-mark → engine
  logs ONE session per item (see "Deep content" in CLAUDE.md); focus on topic →
  `KOS.show("focus",{subject,ref})`; compare → modal with
  Swap/Open A/B/Focus A/B/Comparison note; edit → `KOS.edits.set/reset`
  through the editor; attach → `KOS.attach`.
- **Hooks:** `topic.head` ← `.topic-head`, `topic.meta` ← `.th-meta`;
  `topic.nav` ← `.study-nav`; `topic.tabs` ← `.study-tabs-topic` (tabs use
  P-2 with `data-tab="<kind>"`), `topic.edit` ← `.study-edit-t`;
  `topic.notes` ← `.notes-article`; `topic.pager` ← `.reader-nav`,
  `topic.page-select` ← `.reader-page-select`, `topic.page` ← `.pn-page`;
  `topic.note-block` (keeps `data-bid`) ← `.n-blk`; `topic.inspector` ←
  `.study-inspector`, with parts `topic.inspector-toggle` ← `.insp-toggle`,
  `topic.inspector-body` ← `.insp-body`, `topic.inspector-spine` ←
  `.insp-spine`; `topic.status` ← `.topic-status`, with parts
  `topic.status-head` ← `.ts-head`, `topic.status-select` ← `.status-sel`,
  `topic.status-field` ← `.ts-field`(`-status`/`-conf`), `topic.checks` ←
  `.ts-checks`/`.ts-checkgrid`, `topic.pct` ← `.ts-pct`; `rag.picker` ←
  `.rag-picker`, `rag.option` ← `.rag-pick`; `topic.custom-quiz` ←
  `.quiz-custom`, `.quiz-custom-manage`.
- **State:** the open tab is `aria-selected`; the inspector uses
  `data-state="collapsed"`; a selected block in the editor is
  `aria-current="true"` (was `.n-blk-sel`); an editing session sets
  `topic.nav[data-state="editing"]`.
- **A11y:** the topic title is the `h1`; tabs are a real tablist with
  `aria-controls`; opening a topic starts at the top, and the pager scrolls only
  when the reader turns a page (smoke40).
- **Invariants:** 25, 52, 54, 77, 86–89.
- **Coverage:** smoke, smoke2, 3, 8, 9, 12, 14, 15, 21, 24, 29, 34, 37, 38, 40, 42,
  43, 44, 45, 50, 51, 52, 53.

### V-04 `review`: Review workspace (M7)
- **Route:** `KOS.show("review")`. Compatibility routes `due` and `cardstats`
  stay. **Section:** Study → Review.
- **Owner:** `js/modules/review.js`, which composes `KOS.review.renderDue` and
  `renderStats` under `KOS.workspaceTabs` (Due, Card Stats).
- **Purpose:** one place for spaced review. It has no content of its own beyond
  the switcher in the page header's action slot (inv. 50b).
- **Hooks:** `review.tabs` (P-3). **Coverage:** smoke3, 45.

### V-05 `due`: Due Today (M7)
- **Route:** `KOS.show("due")`. **Section:** Study → Review.
- **Owner:** `js/modules/due.js`.
- **Shows:** cards due and overdue (a metric strip, which is a genuine use of
  statTile); the review session (`KOS.flashcards.session` across due cards); a
  "Queue clear" state; links to the Personal deck and Visual Novels.
- **Actions:** rate → engine (`KOS.srs.rate` + `KOS.sessions.log`, inv. 1);
  → `KOS.show("personaldeck")`; → `KOS.show("vn")`.
- **Hooks:** `review.due`, `review.due-strip` ← `.stat-strip`; the engine
  hooks come from C-1.
- **Invariants:** 1, 50c, 77. **Coverage:** smoke3, 6, 21, 42.

### V-06 `cardstats`: Card Statistics (M7)
- **Route:** `KOS.show("cardstats", {subject?, ref?})`. **Section:** Study → Review.
- **Owner:** `js/modules/cardstats.js`.
- **Shows:** a scope selector (all / subject / topic); cards in scope, in the
  schedule, total reviews, due now, overdue, average ease and lapse rate; a
  trend chart and an answer-distribution chart (Again/Hard/Good/Easy); a
  per-topic breakdown sorted by lapses. Below 3 tracked cards or 3 reviews it
  shows the low-data state instead of charts (inv. 76).
- **Actions:** change scope → `KOS.show("cardstats", {...}, {_nav:true})`;
  topic row → `ref`.
- **Hooks:** `review.stats` ← `.cs-grid`; `review.stats-strip` ←
  `.cardstats-stat-strip`; `review.stats-empty` ← `.cardstats-empty`;
  `review.stats-lowdata` ← `.cardstats-lowdata`; `review.scope` (P-2 local);
  crumbs `ui.crumbs` ← `.crumbs`.
- **Invariants:** 63, 76, 77. **Coverage:** smoke3, 43, 44, 47.

### V-07 `personaldeck`: Personal Deck (M7)
- **Route:** `KOS.show("personaldeck")`. **Section:** Study → Review.
- **Owner:** `js/modules/due.js`.
- **Shows:** user-authored cards (`KOS.srs.personalRefs`, including VN quotes sent
  as cards); due count; the deck in the flashcards engine.
- **Actions:** study/rate (engine); ← back to Due; → VN vault.
- **Hooks:** `review.personal`. **Coverage:** smoke6, 21, 47.

### V-08 `assignments`: Assignment Tracker (M7)
- **Route:** `KOS.show("assignments")`. **Section:** Study → Assignments.
- **Owner:** `js/modules/assignments.js` (the canonical assignment store, inv. 27)
  plus `KOS.assignmentDetail` (the detail modal, reused by search and calendar).
- **Purpose:** "What coursework is open, and what's next on it?"
- **Shows:** a list filtered by subject/status/deadline, sorted, with search.
  Each row shows title, subject, status, priority, due date (overdue flagged)
  and subtask progress. Detail shows the subtasks, related topics (spec refs),
  alerts (per-record, inv. 42), where it shows (countdowns toggle, inv. 44),
  effort minutes and attachments.
- **Actions:** new/edit/save/delete (`confirm` danger, separate from Save,
  inv. 45); status, priority and subtask toggles; link/remove topic; attach/remove
  file (`KOS.attach.add/remove`); focus on this →
  `KOS.show("focus",{assignmentId})`; open topic → `ref`; alerts →
  `KOS.assignments.checkAlerts` → `KOS.notify.push` (inv. 95).
- **Hooks:** `asg.list`, `asg.row` (`data-id`); `asg.status` ← `.asg-status`;
  `asg.priority` ← `.asg-prio`; `asg.track` ← `.asg-track`; `asg.detail`,
  `asg.detail-actions` ← `.asg-d-actions`; `asg.urgent-card` (Home).
- **Invariants:** 27, 42, 44, 45, 95. **Coverage:** smoke30, 33 (the detail modal also opens from search and calendar).

### V-09 `tracker`: Exams & Papers (M7)
- **Route:** `KOS.show("tracker")`. **Section:** Study → Exams & Papers.
- **Owner:** `js/modules/tracker.js` (`state.tracker`).
- **Shows:** logged papers and topic tests (type, subject, topic, paper name,
  marks awarded out of available, percentage, date, reviewed flag); average
  score; count not yet reviewed; count below 60% (a genuine metric strip); a
  subject filter; date sort; an empty state when nothing is logged.
- **Actions:** log entry (`KOS.sessions.log` type `tracker`, one session per
  entry, inv. 1); edit; mark reviewed; delete (`confirm` danger); open topic → `ref`.
- **Hooks:** `tracker.list`, `tracker.row` (`data-id`); `tracker.strip` ←
  `.tracker-stat-strip`; `tracker.empty` ← `.tracker-empty`; `tracker.filter`.
- **State:** reviewed uses `aria-pressed` (was `.reviewed`).
- **Invariants:** 1, 50c, 77. **Coverage:** smoke3, 45, 47.

### V-10 `focus`: Focus Timer (M8)
- **Route:** `KOS.show("focus", {subject?, ref?} | {assignmentId?})`.
  **Section:** Productivity → Focus Timer.
- **Owner:** `js/modules/focus.js`. The state machine (`focus.js` "state
  machine", "deterrents", "reload restore") is logic and is **not** rewritten.
  Only the "Focus Mode UI", "running-state pieces", "completion review" and
  "start view" regions are.
- **Purpose:** start, run and close one focus session honestly.
- **Shows:**
  - **Start (idle):**
    - Left: the session being set up, which is context (topic, assignment or
      reading), objective, mode/length and the award preview
      (`KOS.governor.focusAward`, inv. 4a).
    - Right: "the deal" (rules in one line each) and your recent record.
  - **Running, full stage:**
    - clock, context and objective;
    - cycle pips (one per banked cycle plus the live one);
    - what ending now would pay;
    - the working row: quick note, mark a distraction, notes list.
  - **Running, docked** (chrome-free app use): a two-row dock with clock, End and
    Stage, and measured clearance on phone (inv. 75).
  - **Completion review, opened after payment (inv. 4b):**
    1. what happened;
    2. what it paid (`KOS.governor.lastAward()`);
    3. the objective and whether it landed (Met/Partly/Missed);
    4. one line of reflection;
    5. notes and where to file them;
    6. the linked assignment's status/progress/subtasks;
    7. today's study block.
- **Actions:** start → state machine; mark distraction (the deterrent path; never
  for reading, inv. 3); end / end early (`confirm`) → `KOS.sessions.log` +
  payment; save review (annotates the record and linked work; **never logs or
  pays again**, inv. 4b); assignment updates → `KOS.assignments.update/setStatus/
  subToggle/addEffort`; open topic → `ref`.
- **Hooks:** `focus.start`, `focus.start-button`; `focus.stage`, `focus.clock` ←
  `.fx-clock`; `focus.fill` ← `.fx-fill`; `focus.mode` ← `.fx-mode-card`;
  `focus.objective`; `focus.pips`; `focus.award`; `focus.note-input`,
  `focus.distraction`; `focus.dock`, `focus.dock-clock` ← `.fx-dock-clock`;
  `focus.review`, `focus.review-choice` ← `.fx-rev-choice`,
  `focus.review-reflect` ← `.fx-rev-reflect`, `focus.review-save`.
- **State:** `<html data-focus="stage|docked|minimised">` (was `.focus-mode`,
  `.fx-minimised`); the objective result uses `aria-pressed` on the three choices.
- **A11y:** the clock is not a live region; announce start, end and each banked
  cycle once through `KOS.a11y.announce`. The review is a dialog (P-9).
- **Invariants:** 1, 3, 4, 4a, 4b, 4c, 75. **Coverage:** smoke3, 34, 49.

### V-11 `reminders`: Reminders (M8)
- **Route:** `KOS.show("reminders", {id?, section?})`. **Section:** Productivity
  → Reminders.
- **Owner:** `js/modules/reminders.js` (view); `js/core/reminders.js` (store,
  alerts).
- **Purpose:** capture and clear personal to-dos.
- **Shows:**
  - **Sidebar:** smart sections (All, Today, Scheduled, Upcoming, Overdue, Completed),
    user lists (new/rename/delete) and tags. Lists and tags are visibly separate
    because a list contains and a tag labels.
  - **Main:** the reminder list for the selection, with search, sort, priority
    filter and quick add (files into the selected list/section).
  - **Detail inspector:** title, notes, due date/time, recurrence (computed,
    inv. 43), alerts (per record, inv. 42), sub-tasks, priority, list, tags.
- **Actions:** add, tick, edit, delete (`confirm` danger); list CRUD; alerts →
  `KOS.reminders.checkAlerts` → `KOS.notify.push`; "Remind me" rows created by
  Pacing arrive tagged `pacing` (inv. 82b).
- **Hooks:** `rem.layout` ← `.rem-grid` (mobile-shell); `rem.side` ←
  `.rem-side`; `rem.section` (`data-section`); `rem.list`, `rem.row`
  (`data-id`); `rem.check` ← `.rem-check`; `rem.detail`; `rem.add` ←
  `.todo-in`.
- **State:** the selected section/list is `aria-current`; done is
  `aria-checked` on the check.
- **Phone:** the sidebar moves to the compact sheet (S-6) and the detail
  becomes a bottom sheet.
- **Invariants:** 27, 42, 43, 50b, 58, 72, 95. **Coverage:** smoke30, 46.

### V-12 `tasks`: Habits (M8)
- **Route:** `KOS.show("tasks")`. **Section:** Productivity → Habits.
- **Owner:** `js/modules/todo.js` (`state.todo`); `KOS.todo.panel` is reused on Home.
- **Shows:** daily habits (seal directives) with today's tick state;
  automatic directives derived from due cards, deadlines and today's events
  (`KOS.todo.autoItems`, derived, never stored as events, inv. 44); a reminders
  summary card.
- **Actions:** add habit; tick/seal (`KOS.sessions.log` for a real completion,
  inv. 1); delete (`confirm` danger); auto item → `due`/`calendar`/`ref`.
- **Hooks:** `habit.list`, `habit.row` (`data-id`), `habit.tick` ←
  `.todo-tick`, `habit.add` ← `.todo-in`.
- **Invariants:** 1, 27, 44, 50b. **Coverage:** no suite renders `tasks` today (smoke30 and 52 exercise `todo` pieces through Home). `smoke56` must render it.

### V-13 `calendar`: Calendar (M8)
- **Route:** `KOS.show("calendar")`; mode and focus date are `state.ui`
  (`calMode` = month|week). **Section:** Productivity → Calendar.
- **Owner:** `js/modules/calendar.js`. Schema, CRUD, recurrence, countdowns,
  alerts and samples are logic and are not rewritten. The "month grid", "week
  grid", "legend", event modal, day disclosure and countdown widget are
  rewritten.
- **Purpose:** "What is on, when?"
- **Shows:**
  - **Header:** period title; previous/next; Today; the Month/Week mode toggle.
  - **Month grid:** days with event chips (category hue through `--ev-hue`,
    inv. 46), with assignment and reminder chips derived from their stores
    (inv. 44), multi-day spans, and a "+N more" overflow into a day disclosure.
  - **Week grid:** time-positioned events and all-day row.
  - **Legend** of categories.
  - **Countdown widget** (reused on Home and Subject): merged deadlines,
    assignment reads and pacing milestones (kind `pacing`, inv. 82b).
- **Event modal (one for add and edit, inv. 45):**
  - type (Exam/Deadline/Study block/Lesson/Personal) and colour (match type or
    one of Iris/Brass/Sage/Clay/Sky/Plum/Jade/Slate);
  - date, time (`time` is the start, inv. 41), end, all-day, recurrence;
  - alerts (new exam/deadline defaults are applied in `addEvent()` only,
    inv. 42);
  - conditional fields: exam (paper, board), deadline (status, priority), study
    block (links an assignment by id and copies nothing);
  - a validation surface.

  Delete sits apart from Save. "Save and start a focus session" is an action.
- **Actions:** CRUD through `KOS.calendar` normaliser/`addEvent`; chip →
  event detail, `KOS.assignmentDetail`, or `KOS.show("reminders",{id})`;
  pacing milestone → `KOS.show("pacing",{wb})`; start focus →
  `KOS.show("focus",{subject,ref})`.
- **Hooks:** `cal.head`, `cal.mode` (pressed), `cal.grid` (`data-mode`);
  `cal.day` (`data-date`) ← `.cw-day`, `cal.day-num` ← `.cal-daynum`;
  `cal.day-row` ← `.cal-day-row`; `cal.event` (`data-id`) ← `.cal-ev`,
  `cal.event-title` ← `.cal-ev-t`; `cal.more` ← `.cal-more`; `cal.disclosure`
  ← `.cal-disc`, `cal.disclosure-head` ← `.cal-disc-h`; `cal.modal-foot` ←
  `.cal-modal-foot`; `cal.delete` ← `.cal-foot-del`; `cal.countdowns` ←
  `.dl-widget`, `cal.countdown` ← `.dl-item`, `cal.countdown-head` ←
  `.dl-h`; `cal.swatch` ← `.cal-sw`.
- **State:** span chips use `data-span="start|mid|end"` (was `.cal-span`);
  all-day uses `data-allday`; validation uses `aria-invalid` (was `.bad`).
- **A11y:** chips may use the documented 24px-with-spacing exception (inv. 69).
  A breakpoint redraw at 700 waits for an open dialog and restores equivalent
  focus (inv. 74).
- **Invariants:** 41–46, 69, 74. **Coverage:** smoke3, 22, 30, 33, 35, 37, 45, 46, 49.

### V-14 `pacing`: Weekly plan and braid (M8)
- **Route:** `KOS.show("pacing", {wb})` → `#/pacing/YYYY-MM-DD` (the week), or
  `#/pacing/braid` (the whole-term graph). **Section:** Productivity → Pacing.
- **Owner:** `js/modules/pacing.js` (view); `js/core/pacing.js` (logic, out of
  scope).
- **Purpose:** "Is my personal study aligned with the class plan this week?"
- **Shows:**
  - **Term ribbon:** every week (school/personal week numbers, break/mock
    markers, status) with "This week".
  - **The week:** one column per subject.
    - **Class rows:** lessons, no tick.
    - **Personal rows:** tick `done` and a note.
    - **Carried-over rows** from ended weeks, with `weeksLate` and marked behind
      (inv. 82a).
    - Linked spec leaves with coverage READ from progress (inv. 82).
    - Alignment verdict ahead/aligned/behind/unplanned, or no claim at all
      (inv. 83).
    - Assignments due inside the week, and the week note.
  - **Braid:** one branch per shared spec point packed into commit-graph depths,
    with a non-scrolling key column. It is one `role="img"`, and every branch is
    repeated as a real button beneath it (inv. 85). No shared refs means no
    diagram.
- **Actions (through `KOS.pacing.*` only):**
  - rows: tick (`setDone`), add row (`addEntry`), edit (`updateEntry`), move
    "→ here" (`updateEntry({wb})`), delete row (`removeEntry`, `confirm`
    danger);
  - weeks: add week (`addWeek`), edit week (`updateWeek`), delete week
    (`removeWeek`, refuses without `cascade`);
  - "Remind me by the week" → one `KOS.reminders.add`, tagged `pacing`;
  - open topic → `ref`; assignment → `assignments`.
- **Hooks:** `pace.ribbon`, `pace.week` (`data-wb`); `pace.column`
  (`data-sid`); `pace.row` (`data-id`) ← `.pace-topic`, with `data-kind="class|
  mine"` ← `.pace-reg-class`/`.pace-reg-mine`; `pace.class` ← `.pace-class`;
  `pace.lessons` ← `.pace-lessons`, `pace.lesson` ← `.pace-lesson`;
  `pace.tick` ← `.pace-tick`; `pace.move` ← `.pace-move`; `pace.picker` ←
  `.pace-pick`, `pace.pick-row` ← `.pace-pick-row`, `pace.pick-count` ←
  `.pace-pick-count`; dialog parts `pace.dlg-refs` ← `.pace-dlg-refs`,
  `pace.dlg-actions` ← `.pace-dlg-actions`, `pace.dlg-danger` ←
  `.pace-dlg-danger`, `pace.dlg-done` ← `.pace-dlg-done`; `pace.braid`,
  `pace.braid-branch`.
- **State:** carried rows use `data-state="behind"`; ticks are `aria-checked`.
  Braid lane geometry lives in SVG attributes and custom properties only.
- **Invariants:** 80–85, 44, 45. **Coverage:** smoke49.

### V-15 `matrix`: Collection Overview (M10)
- **Route:** `KOS.show("matrix")`; the tab (Overview | Analytics) is local.
  **Section:** Collection → Overview.
- **Owner:** `js/modules/matrix.js`.
- **Purpose:** summarise the vaults without becoming a fifth vault (inv. 57).
- **Shows:**
  - **Overview:**
    - Airing soon: this season's watched titles with episode countdowns, grouped
      Today/Tomorrow/day (`KOS.anime.airingList`; memory-only, inv. 23).
    - Currently consuming: in-progress rows across modules, with the shared
      progress bar and a +1 action.
    - One card per module: count and a headline figure (episodes watched,
      chapters read, volumes on the shelf, hours played, in the Shrine).
  - **Analytics:** small multiples, heatmap, donut, bars (P-15), with honest
    low-data states.
- **Actions:** +1 → `KOS.medview.bumpUnit`; open entry → `KOS.mediaEditor`;
  module card → `KOS.show(module)`; Sync & Import → `KOS.show("mediasync")`;
  seasonal → `KOS.show("seasonal")`. It performs no provider request except the
  airing refresh.
- **Hooks:** `coll.tabs` ← `.mx-tabs`; `coll.strip` ← `.stat-strip`;
  `coll.airing`, `coll.airing-day` ← `.mx-day`, `coll.airing-day-head` ←
  `.mx-day-h`, `coll.airing-ep` ← `.mx-ep`; `coll.now-card` ← `.mx-now-card`,
  `coll.now-plus` ← `.mx-now-plus`; `coll.module-card` (`data-module`) ←
  `.med-mod-card`; `coll.soon-card` ← `.soon-card`; `coll.analytics` ←
  `.cs-grid`.
- **Invariants:** 8, 23, 57, 63, 76, 77. **Coverage:** smoke4, 5, 6, 8, 9, 43,
  44, 49, 52, 54.

### V-16 `anime`: Anime vault (M10)
- **Route:** `KOS.show("anime")`. **Section:** Collection → Anime.
- **Owner:** `js/modules/anime.js` on the medview shell (V-18).
- **Shows:** the vault shell (hero, toolbar, filter rail, results) over the
  AniList mirror (inv. 90). The editor shows AniList facts read-only and edits
  list state plus the personal layer only (inv. 92). Airing chips come from
  memory only. Genre and tag facets. A per-vault statistics modal.
- **Actions:** Find new (`KOS.mediaSearch.open`, which creates on AniList
  FIRST, inv. 92); Sync & Import → `mediasync`; Today and airing refresh
  (`KOS.anime.refreshAiring`); +1 episode (`bumpUnit` → `mediapush`); favourite
  (Shrine); → `seasonal`, → `aniprofile`. There is no manual create, no metadata
  edit and no Delete.
- **Hooks:** vault hooks (V-18) plus `anime.airing` ← `.an-airing`; mirror
  explanation dialog `anime.mirror-dialog` ← `.med-mirror-modal`.
- **Invariants:** 8, 9, 12–14, 23, 30, 56, 58–61, 63, 90, 92, 94.
- **Coverage:** smoke4, 5, 7, 8, 9, 11, 12, 15, 16, 36, 40, 44, 45, 47, 52, 53, 54.

### V-17 `seasonal`: Seasonal view (M10)
- **Route:** `KOS.show("seasonal")`; season and year are local. **Section:**
  Collection → Anime (strip lights Anime).
- **Owner:** `js/modules/anime.js`.
- **Shows:** the season hero, which is one credited piece of scenery per season
  (`SEASON_META[].art`; a small sample loads while the full frame loads) or the
  user's picture from kv `hero.season.<SEASON>` (inv. 94), with credit; a
  season/year picker with previous/next and "Back to the current season"; EVERY
  status of that season, watching first; an empty state for the season.
- **Actions:** choose picture (`KOS.imageCrop.open` → `setKV`), use the shipped
  scenery (`delKV`); navigate seasons; open entry.
- **Hooks:** `anime.season` ← `.season-view`; `anime.season-hero` ←
  `.season-hero`, `anime.season-art` ← `.season-art`, `anime.season-credit` ←
  `.season-credit`; `anime.season-picker` ← `.season-picker`,
  `anime.season-year` ← `.season-yr`; `anime.season-empty` ←
  `.seasonal-empty`.
- **Invariants:** 23, 26c, 30, 94. **Coverage:** smoke9, 12, 16, 53.

### V-18 Shared vault shell: `KOS.medview` (M9, used by V-16, V-19–V-22)
- **Owner:** `js/modules/medview.js`; editor dispatch `KOS.mediaEditor` with
  editors in `KOS.mediaEditors` and hooks in `KOS.mediaEditorHooks` (inv. 28,
  never wrap the dispatcher).
- **Shows:**
  - **Hero:** spotlight title, banner, cover and actions. Selection, banner and
    crop live in `hero.<module>` kv (inv. 30); VN/Games heroes are upload-only
    (inv. 60).
  - **Toolbar:** search, sort, grid/list toggle, filters button, facet chips,
    actions menu, statistics.
  - **Filter rail:** status and custom lists (new/rename/delete), plus the
    facets.
  - **Results:** a lazy batch renderer of 60 per batch with a sentinel (inv. 8).
    Grid cards show cover (deterministic placeholder hue, inv. 61), title, meta,
    the ONE progress bar (P-13), quick score and push-state chip. List rows show
    the same data.
  - **Editor dialog:** read-only provider facts (`vault.readonly`, inv. 92),
    list state, the personal layer (favourite, notes, tags, mood, shelves,
    lists, cover position) and source info. Delete lives in a separate group.
  - **Statistics dialog:** composition, taste and pace charts.
- **Actions:** `KOS.mediadb.query` (indexed, capped); `put`/`remove`
  (confirm danger); `KOS.mediapush.schedule/flush` (push is AniList/VNDB-owned
  only, inv. 12–14); custom lists → `KOS.media.registerList/renameList/
  deleteList`; cover/banner → `KOS.imageCrop`; +1 → `bumpUnit`; retry a failed
  push chip.
- **Hooks:**
  - **Layout:** `vault.layout` ← `.med-layout`; `vault.filter-rail` ←
    `.med-filter-rail`; `vault.main` ← `.med-main`.
  - **Hero:** `vault.hero` ← `.vault-hero`, with parts `vault.hero-art` ←
    `.vh-art`, `vault.hero-cover` ← `.vh-cover`, `vault.hero-title` ←
    `.vh-title`, `vault.hero-actions` ← `.vh-actions`, `vault.hero-menu` ←
    `.vh-menu`, `vault.hero-scrim` ← `.vh-scrim`, `vault.hero-placeholder` ←
    `.vh-ph`/`.vh-fallback`.
  - **Toolbar:** `vault.toolbar` ← `.med-toolbar`/`.mvt`, with parts
    `vault.search` ← `.med-search`, `vault.sort` ← `.med-sort`,
    `vault.filters-button` ← `.mvt-filters-btn`, `vault.actions-button` ←
    `.mvt-actions-btn`, `vault.facet` ← `.mvt-facet`, `vault.count` ←
    `.med-count`.
  - **Results:** `vault.grid` ← `.med-grid`; `vault.card` (`data-id`) ←
    `.med-card`, with parts `vault.card-body` ← `.med-card-body`,
    `vault.card-title` ← `.med-title`, `vault.card-progress` ← `.med-prog`,
    `vault.card-num` ← `.med-num`, `vault.cover` ← `.med-cover`,
    `vault.cover-placeholder` ← `.med-cover-ph`, `vault.plus` ← `.med-plus`,
    `vault.quickrow` ← `.med-quickrow`, `vault.quick-score` ← `.med-qscore`,
    `vault.quick-select` ← `.med-qsel`; `vault.sentinel` ← `.med-sentinel`;
    `vault.empty` ← `.med-empty`.
  - **Editor:** `vault.editor` ← `.med-modal`/`.med-record-modal`, with parts
    `vault.editor-body` ← `.med-edit-body`, `vault.readonly` ← `.med-ro`,
    `vault.save-actions` ← `.med-save-actions`, `vault.delete-actions` ←
    `.med-delete-actions`, `vault.source` ← `.med-source-info`,
    `vault.span-2` ← `.med-span-2` (layout hint → drop; tests use the field
    hook instead).
  - **Other dialogs:** `vault.stats` ← `.stats-modal`.
- **State:** `aria-busy` on results while loading; `vault.hero[data-state=
  "banner"|"fallback"|"cover"]` (was `.has-banner`, `.vh-fallback`,
  `.vh-fromcover`); `vault.toolbar[data-filters="on"]` (was `.has-filters`);
  covers with no art use `data-state="no-art"`.
- **Phone:** the filter rail and actions move into the "Status & lists" sheet
  (S-6, inv. 58).
- **Invariants:** 6–17, 26c, 28, 30, 56, 58–61, 63.
- **Coverage:** smoke4–9, 11, 14–16, 19, 36, 40, 42, 44, 52, 54.

### V-19 `books`: Books vault (M10)
- **Route:** `KOS.show("books", {tab?: "digital"|"physical"})`. **Section:**
  Collection → Books.
- **Owner:** `js/modules/books.js` on V-18.
- **Shows:**
  - **Lens tabs** (P-2 variant `lens`):
    - **Digital:** `syncSource==="anilist"` rows only, mirrored.
    - **Physical Vault:** owned volumes whatever the source (inv. 91).
  - **Physical lens:**
    - The shelf, laid out in cycled layouts, with spines in series order and a
      condition mark on each.
    - Per-series volume grid: add next, add a range, remove.
    - Custom volume covers with position.
    - Star rating in half steps.
    - Drag to reorder shelves.
  - **Book lookup:** Open Library first, then Google Books (inv. 21), by
    title or ISBN, with barcode scan.
  - A compare view. A reading session start (`KOS.focus.start` reading, inv. 3).
- **Actions:** `KOS.bookapi.search/byIsbn`; add to shelf (`mediadb.put`, which
  must carry a volume, inv. 92); volume add/range/remove; reorder
  (`KOS.books.setShelfOrder`); cover (`KOS.imageCrop`); start reading →
  `KOS.focus.start`; → `mangaka`, → `mediasync`.
- **Hooks:** V-18 plus `books.lens` ← `.bk-tab`; `books.card` ← `.bk-card`;
  `books.spine` ← `.bk-spine`, `books.spine-condition` ← `.bk-spine-cond`;
  `books.series` ← `.bk-shelf-series`; `books.stars` ← `.bk-stars`/`.bk-star`;
  `books.author` ← `.bk-author`; `books.range` ← `.bk-range-grid`,
  `books.range-submit` ← `.bk-range-submit`; `books.lookup` ← `.bk-lookup`/
  `.bk-modal`, `books.isbn` ← `.bk-isbn-in`, `books.scan-none` ←
  `.bk-scan-none`, `books.source-chip` ← `.bk-src-chip`; `books.compare` ←
  `.bk-compare`, `books.compare-row` ← `.bk-compare-row`; `books.rank-row` ←
  `.bk-rank-row`.
- **State:** drag uses `data-state="dragging"|"dragover"`.
- **Invariants:** 3, 21, 63, 90–92. **Coverage:** smoke4, 5, 7, 8, 9, 11, 14,
  15, 19, 36, 40, 42, 44, 45, 52, 54.

### V-20 `mangaka`: Mangaka (M10)
- **Route:** `KOS.show("mangaka")`. **Section:** Collection → Anime (per
  `renderSubnav`).
- **Owner:** `js/modules/books.js`.
- **Shows:** authors with their works in the collection, using its own compact
  discovery grammar (inv. 55): search authors, sort, reading-status filter,
  minimum works, letter jump bar, "more" per author.
- **Hooks:** `mangaka.toolbar` ← `.mk-toolbar`; `mangaka.jump` ←
  `.mk-jump-key`, `mangaka.letter` ← `.mk-letter`; `mangaka.card` ←
  `.mk-card`, `mangaka.name` ← `.mk-name`, `mangaka.meta` ← `.mk-meta`,
  `mangaka.work` ← `.mk-work`, `mangaka.more` ← `.mk-more`,
  `mangaka.head-text` ← `.mk-h-txt`.
- **Invariants:** 8, 55. **Coverage:** smoke44, 45.

### V-21 `vn`: Visual Novels vault (M10)
- **Route:** `KOS.show("vn")`. **Section:** Collection → Visual Novels.
- **Owner:** `js/modules/vn.js` on V-18.
- **Shows:** vault cards whose progress is derived from ONE source
  (`mediadb.vnSource`: routes → chapters → hours vs VNDB length (flagged
  estimate) → percent) with its unit (inv. 10). The editor has a progress-mode
  selector, routes (add/remove, cleared), chapters (name, status, notes),
  hours, percent, quotes (text, context; log to the Personal deck), content
  warnings (manual, inv. 29) and a CG counter.
- **Actions:** +chapter / +hour (`KOS.vn.quickBump`, `bumpUnit`); route and
  chapter CRUD (`mediadb.normRoute/normChapter` → `put`); quote → flashcard
  (`KOS.srs.addCustom`); push (VNDB-owned only; relay/direct PATCH, inv. 19)
  through `mediapush.schedule`; add manually (local fallback, inv. 92);
  → `vndbprofile`, → `personaldeck`.
- **Hooks:** V-18 plus `vn.card` ← `.vn-card`; `vn.editor` ← `.vn-modal`;
  `vn.routes` with `vn.route-row` ← `.vn-route-row`, `vn.route-name` ←
  `.vn-route-name`, `vn.route-add` ← `.vn-route-add`; `vn.chapters` ←
  `.vn-chapters`, `vn.chapter-row` ← `.vn-ch-row`, `vn.chapter-status` ←
  `.vn-ch-status`; `vn.quote` ← `.vn-quote`; `vn.progress-note` ←
  `.vn-prog-note`; `vn.length-note` ← `.vn-len-note`.
- **Invariants:** 10, 11, 12, 18, 19, 29, 30, 60, 63.
- **Coverage:** smoke4–9, 11, 12, 15, 36, 45, 52, 54.

### V-22 `game`: Games vault (M10)
- **Route:** `KOS.show("game")`. **Section:** Collection → Games.
- **Owner:** `js/modules/games.js` on V-18.
- **Shows:** vault cards with playtime-derived progress (inv. 10), completion
  tier and backlog priority; backlog analytics; bulk add from a pasted list
  (review drafts first); the Steam link flow (link, check, owned-library import
  with select all/none, unlink). The browser never talks to Steam; this is
  Edge-Function mediated, with a review stage and gap-fill only (inv. 20).
- **Actions:** +1 hr (`bumpUnit` + `KOS.sessions.log` via media logging, inv. 3);
  add one (`mediadb.add`); bulk drafts → create; Steam: `KOS.gameapi.steamBegin/
  steamStatus/steamOwnedGames/steamUnlink`; quick edit. Games never push (inv. 12).
- **Hooks:** V-18 plus `games.editor` ← `.gm-modal`; `games.bulk` ←
  `.gm-bulk-modal`; `games.steam` ← `.gm-steam-modal`, `games.steam-id` ←
  `.gm-steamid`, `games.steam-link` ← `.gm-steamlink`.
- **Invariants:** 3, 10, 12, 20, 30, 60. **Coverage:** smoke4, 5, 7, 8, 9, 11,
  14, 15, 19, 36, 45, 52, 54.

### V-23 `shrine`: The Shrine (M10)
- **Route:** `KOS.show("shrine")`. **Section:** Collection → Shrine.
- **Owner:** `js/modules/shrine.js`; the card style comes from
  `KOS.governor.shrineStyle` (a shop cosmetic).
- **Shows:** the collection standing (a ledger of hall statistics); the featured
  entry (rank one, with a description); the ranked Hall of Fame of favourites,
  filterable by media type and sortable; a per-rank share card (render to PNG,
  save, copy, share, with an optional local cover) and a note per entry.
- **Actions:** open entry → `KOS.mediaEditor`; share card → canvas render;
  save note (media kv/entry via existing path); → `matrix`.
- **Hooks:** `shrine.stage` ← `.shrine-stage`; `shrine.feature` ←
  `.shrine-feature`, `shrine.feature-rank` ← `.shrine-feature-rank`;
  `shrine.description` ← `.shrine-description`; `shrine.hall` ←
  `.shrine-hall`; `shrine.ranked` ← `.shrine-ranked-grid`, `shrine.rank-card`
  ← `.shrine-rank-card`, `shrine.rank` ← `.shrine-rank`, `shrine.row-foot` ←
  `.shrine-row-foot`; `shrine.filter` ← `.shrine-filter`; `shrine.sort` ←
  `.shrine-sort`; `shrine.ledger` ← `.shrine-ledger`, `shrine.ledger-lines` ←
  `.shrine-ledger-lines`, `shrine.ledger-line` ← `.shrine-ledger-line`;
  `shrine.share-dialog` ← `.shrine-card-modal`, `shrine.message` ←
  `.shrine-message`.
- **Invariants:** 26c, 29, 59, 63. **Coverage:** smoke4, 5, 6, 8, 12, 14, 15,
  16, 38, 42.

### V-24 `wishlist`: Budget Planner (M10)
- **Route:** `KOS.show("wishlist")`. **Section:** Collection → Planner
  (workspace tabs: Budget Planner | Goals).
- **Owner:** `js/modules/wishlist.js` (`state.wishlist`).
- **Purpose:** logistics for buying. Zero Governor traffic, zero network
  (inv. 5a).
- **Shows:**
  - The monthly budget: actual spend, not wishlist value; currency.
  - The next-release hero (or its empty state).
  - The purchase queue: search, sort, drag to reorder, "simulate buying" each
    row, a link to the collection entry.
  - Release watch → "Move to buy".
  - Purchase history.
- **Actions:** add item/release; edit; delete (`confirm` danger); edit budget;
  confirm purchase → an exact, local handoff to the Collection that never
  downgrades it (`mediadb.add/put`, inv. 5a); link/unlink a vault entry; open
  the linked entry.
- **Hooks:** `plan.tabs` ← `.wl-tabs`; `plan.top` ← `.wl-top`; `plan.budget` ←
  `.wl-budget`, `plan.budget-edit` ← `.wl-budget-edit`, `plan.budget-dialog` ←
  `.wl-budget-modal`; `plan.hero` ← `.wl-hero`, `plan.hero-body` ←
  `.wl-hero-body`, `plan.hero-feature` ← `.wl-hero-feature`,
  `plan.hero-empty` ← `.wl-hero-empty`; `plan.row` (`data-id`) ← `.wl-row`;
  `plan.check` ← `.wl-check`; `plan.on-list` ← `.wl-onlist`; `plan.history` ←
  `.wl-history`; `plan.ledger-line` ← `.wl-ledger-line`.
- **State:** draggable rows use `data-state="dragging"`.
- **Invariants:** 5a, 50b, 77, 78. **Coverage:** smoke4, 5, 8, 14, 15, 16, 38,
  44, 49, 52.

### V-25 `goals`: Collection Goals (M10)
- **Route:** `KOS.show("goals")`. **Section:** Collection → Planner (the tabs
  light Goals).
- **Owner:** `js/modules/goals.js` (`state.goals`).
- **Shows:** goals by media scope (All, Anime, Books, VN, Games) and kind
  (complete N titles, episodes, chapters, volumes, a specific title, finish a
  series, titles from a list/tag/genre, spend below, grow the collection,
  enshrine, purchases, hours, VN routes, custom manual). Each shows progress
  derived from the collection, a summary metric and status (open, complete,
  ended), plus an integrity note when a linked title is missing. There is an
  overview and an empty state.
- **Actions:** new/edit (dialog with form sections); manual ±1; mark complete →
  one idempotent `payout:"activity-only"` receipt (inv. 5b); end/reopen; delete
  (`confirm` danger); find title (vault search).
- **Hooks:** `goal.tabs` ← `.goal-tabs`; `goal.overview` ← `.goal-overview`;
  `goal.card` (`data-id`) ← `.goal-card-v2`; `goal.metric` ←
  `.goal-summary-metric`; `goal.integrity` ← `.goal-integrity`; `goal.empty` ←
  `.goal-empty-v2`; `goal.editor` ← `.goal-modal-v2`, `goal.editor-body` ←
  `.goal-editor-body`, `goal.form-section` ← `.goal-form-section-head`,
  `goal.editor-foot` ← `.goal-modal-foot`.
- **Invariants:** 5b, 45, 77. **Coverage:** smoke14, 36, 38, 47, 49, 54.

### V-26 `mediasync`: Sync & Import (M10)
- **Route:** `KOS.show("mediasync")`. **Section:** Collection → Sync (workspace
  tabs: AniList | VNDB | Sync & Import).
- **Owner:** `js/modules/mediasync.js`.
- **Shows:** one panel per provider.
  - **AniList:** client id, connect (OAuth), token, verify, connected viewer,
    sync now (Anime/Books).
  - **VNDB:** personal token (link to `vndb.org/u/tokens`), verify, sync now.
  - **Games:** a pointer to the Games vault flow.

  Per module: last sync and imported counts (`data-last-sync`, `data-imported`).
  Autonomous sync toggle and "run a cycle now" (30-minute safety-net timer,
  inv. 36c). XML import (AniList XML ids are MAL ids, inv. 22; no reward).
  Find and merge duplicates. Metadata enrichment needs. Push write log.
- **Actions:** `KOS.anilist.setClientId/authorizeUrl/setToken/fetchViewer/
  disconnect/syncList/enrich`; `KOS.vndb.setToken/fetchAuthInfo/disconnect/
  syncList/enrich`; `KOS.autosync.setEnabled/runOnce`; `KOS.media.parseXML` →
  `bulkUpsert` (no push, no log, inv. 15); `KOS.media.dedupeVault` (`confirm`);
  `KOS.media.logSyncRewards` (at most one session per deliberate action, inv. 5).
- **Hooks:** `sync.provider` (`data-provider`) ← `.integration-provider`;
  `sync.panel` ← `.med-panel`; `sync.status` ← `.med-sync-status`;
  `sync.enrich` ← `.med-enrich-block`; `sync.log-row` ← `.med-wlog-row`;
  `sync.progress` ← `.subj-track`/`.subj-fill` (in sync use).
- **State:** a provider error uses `data-state="error"` (was `.is-error`).
- **A11y:** tokens are password inputs with labels; statuses change through
  `announce` once per transition.
- **Invariants:** 5, 9, 12–17, 19, 22, 35, 36a–36c, 90, 93.
- **Coverage:** smoke4, 5, 7, 8, 36, 43, 49, 54.

### V-27 `aniprofile` / `vndbprofile`: provider profiles (M10)
- **Route:** `KOS.show("aniprofile")`, `KOS.show("vndbprofile")`. **Section:**
  Collection → Sync (the tabs light AniList/VNDB).
- **Owner:** `js/modules/aniprofile.js`, `js/modules/vndbprofile.js`.
- **Shows:** a profile header (banner and avatar, each user-positionable through
  `KOS.imageCrop` and stored in kv); read-only profile statistics (AniList:
  `fetchProfileBundle`, batched, inv. 23; VNDB: user and site stats, ulist
  labels); analytics panes with charts; a "Connect … to open your profile" state.
- **Actions:** refresh; position banner/avatar (`imageCrop.open` → `setKV`);
  → vault; → `mediasync`.
- **Hooks:** `profile.head` ← `.ap-head`; `profile.avatar` ← `.ap-avatar`;
  `profile.tabs` ← `.ap-tabs`; `profile.pane` ← `.ap-pane`;
  `profile.analytics` ← `.ap-analytics-grid`; `profile.label-stats` ←
  `.vp-label-stats`; `ui.stat` ← `.stat-card`.
- **Invariants:** 23, 26c, 76. **Coverage:** smoke6, 9, 12, 42, 44, 47, 49.

### V-28 `governor`: The Governor (M11)
- **Route:** `KOS.show("governor", tab?)`, where `tab` ∈
  `status|shop|avatar|history`. **Section:** Governor; no strip. The page
  switcher rides the header (inv. 50b).
- **Owner:** `js/modules/governor-ui.js`; the economy is `js/core/governor.js` (out
  of scope except swatch data in M13).
- **Shows:**
  - **Status (the Seat):**
    - Identity hero: avatar, name, level/rank, status, about, banner, seal.
    - Vitals: HP state (Healthy/Strained/Critical) with a preview, XP to the
      next level, gold as formatted context (never a bar, inv. 78), study and
      rest streaks, review queue.
    - The recovery checklist when HP is low. It informs and locks nothing
      (inv. 2).
    - The first-milestone step.
    - An activity heatmap.
  - **Shop (the Treasury):** departments (Learning tools = labs and simulations,
    one-time gold unlocks; OS themes; banners; seals; avatar frames; bookshelf
    skins; Shrine card styles), a catalogue by category, a preview of the
    selected ware, buy/own/apply state.
  - **Avatar (the Atelier):** a live profile preview, a picture/banner editor
    (`KOS.imageCrop` via governor), seal/frame/skin selection.
  - **History (Chronicle):**
    - a session log grouped by day, with category filters (Study, Focus, Tasks,
      Collection, Papers, System), a summary stat row, expandable event details
      and "show more";
    - activity-only rows (`is-routine`) are distinguished.
- **Actions:** `KOS.governor.buy/setTheme/setBanner/setSeal/setShelfSkin/
  setShrineStyle/editAvatar/editBanner/editProfileText`; tab →
  `KOS.show("governor", tab)`; step → `due`/`focus`. It **never** writes XP, HP
  or gold directly (inv. 1).
- **Hooks:**
  - **Page:** `gov.head` ← `.gov-head`; `gov.tabs` (P-3).
  - **Status:** `gov.seat` ← `.gov-seat-hero`/`.identity-stage`, with parts
    `gov.face` ← `.id-face`, `gov.status` ← `.id-status`/`.gov-status`,
    `gov.about` ← `.id-about-txt`, `gov.access` ← `.id-access`,
    `gov.speech` ← `.profile-speech`; `gov.instruments` ← `.gov-instruments`,
    `gov.vital` ← `.vital`/`.gstat` (with `gov.vital-label` ← `.gstat-k`,
    `gov.vital-value` ← `.gstat-v`, `gov.vital-bar` ← `.gstat-bar`);
    `gov.hp-preview` ← `.hp-preview`, `gov.hp-preview-button` ←
    `.hp-preview-btn`; `gov.recovery` ← `.gov-recovery`, `gov.recovery-go` ←
    `.gov-rec-go`; `gov.treasury-facts` ← `.tre-facts`.
  - **Shop:** `shop.dept` ← `.shop-dept`/`.shop-rail-item`; `shop.section` ←
    `.shop-sec`; `shop.card` ← `.shop-card`; `shop.swatch` ← `.shop-sw`,
    `shop.swatch-dot` ← `.shop-sw-dot`; `shop.lab-scene` ← `.shop-lab-scene`;
    `shop.preview-seal` ← `.sp-seal-brand`, `shop.preview-shelf` ←
    `.sp-shelf`, `shop.preview-shrine` ← `.sp-shrine`.
  - **Avatar:** `gov.avatar` ← `.gov-avatar`/`.avatar-studio`, with parts
    `gov.avatar-controls` ← `.av-controls`, `gov.avatar-mc` ← `.av-mc`;
    `gov.seal-grid` ← `.seal-grid`, `gov.seal-card` ← `.seal-card`.
  - **History:** `gov.log` ← `.gov-log`, `gov.log-summary` ←
    `.gov-log-summary`, `gov.log-filter` ← `.log-filterbar`/`.log-cat`,
    `gov.log-event` ← `.gov-log-event` (`data-state="routine"` ←
    `.is-routine`), `gov.log-details` ← `.gov-event-details`, `gov.log-more` ←
    `.gov-log-more`; `gov.day-group` ← `.gov-day-group`, `gov.day-events` ←
    `.gov-day-events`, `gov.timeline` ← `.gov-timeline`; `gov.history-stats`
    ← `.gov-history-stats`, `gov.history-stat` ← `.gov-history-stat`;
    `gov.ledger-row` ← `.led-row`, `gov.ledger-day` ← `.led-day`,
    `gov.ledger-more` ← `.led-more`.
  - **Shared/legacy:** `gov.bento` ← `.bento`/`.b-id`/`.b-wide` (layout-only
    legacy; tests move to the feature hooks above); `chart.heatmap` ←
    `.heat-svg`.
- **Invariants:** 1, 2, 26a, 26b, 50b, 50c, 77, 78, 79. **Coverage:** smoke3, 4,
  12, 15, 22, 31, 34, 45, 47.

### V-29 `assistant`: Kurenai Assistant (M12)
- **Route:** `KOS.show("assistant", {tab})`, where `tab` ∈
  `chat|history|settings|memory|permissions`. **Section:** Assistant; no strip.
- **Owner:** `js/modules/assistant.js` (view, drawer, trigger); services
  `assistant-*.js`, `js/core/ai*.js` (out of scope); `assistant-live2d.js`
  (inert seam, untouched, smoke39).
- **Shows:**
  - **Page:** a side navigation (tabs plus conversations, collapsible) with
    conversation projects (create, rename, delete).
  - **Chat tab:**
    - The mascot, in one component used at two sizes.
    - A status line (Ready, Thinking, Working with your data, Complete and
      verified, Something needs attention, Waiting for approval).
    - The thread: safe rich text, code blocks with copy, tables in a declared
      scroller, math.
    - Tool receipts.
    - Pending-artifact cards (a validated-but-unsaved proposal, e.g. flashcards,
      edited inline, then Save to deck / Discard).
    - Confirmation cards (Approve/Decline, with arguments).
    - Suggested prompts, a composer and Stop.
  - **History:** conversations with rename/delete (needs cloud sign-in).
  - **Settings:** routing, fallback, Ollama endpoint, health/usage check,
    reaction clips, voice volume.
  - **Memory:** list, add, edit, forget.
  - **Permissions:** a per-tool permission row, plus the audit log.
  - **Drawer:** the compact chat anywhere, with "Open the full assistant page".
  - **Contextual actions:** topic-level prompts injected into V-03's inspector.
- **Actions:** the single submission path (`KOS.ai.orchestrator`); confirm →
  canonical confirmation object; `KOS.ai.setRouting/setFallback/setOllamaUrl/
  health`; memory and permission CRUD; → `mediasync`.
- **Hooks:**
  - **Page:** `asst.page` ← `.asst-page`/`.asst-shell`; `asst.nav` ←
    `.asst-tabs`; `asst.nav-collapse` ← `.asst-side-collapse`; `asst.nav-add`
    ← `.asst-side-add`.
  - **Projects:** `asst.project-picker` ← `.asst-project-picker`,
    `asst.project-new` ← `.asst-project-new`, `asst.project-open` ←
    `.asst-project-open`.
  - **Thread:** `asst.thread` ← `.asst-thread`; `asst.bubble` ← `.asst-bubble`;
    `asst.message-mark` ← `.asst-message-mark`; `asst.richtext` ←
    `.asst-richtext`; `asst.code` ← `.asst-code-block`; `asst.table` ←
    `.asst-table-wrap`; `asst.math-source` ← `.asst-math-source`;
    `asst.stream-caret` ← `.asst-stream-caret`; `asst.receipt` ←
    `.asst-receipt`; `asst.tool` ← `.asst-tool`.
  - **Confirmation:** `asst.confirm` ← `.asst-confirm-card`, `asst.confirm-args`
    ← `.asst-confirm-args`.
  - **Composer and status:** `asst.composer` ← `.asst-composer-in`;
    `asst.cancel` ← `.asst-cancel`; `asst.status` ← `.asst-status-line`.
  - **Mascot and drawer:** `asst.mascot` ← `.asst-mascot`, with parts
    `asst.mascot-frame` ← `.asst-mascot-frame`, `asst.mascot-img` ←
    `.asst-mascot-img`, `asst.hit-zone` ← `.asst-hit-zone`,
    `asst.live2d-host` ← `.asst-live2d-host`; `asst.drawer` ← `.asst-drawer`.
  - **Context:** `asst.ctx` ← `.asst-ctx`, `asst.ctx-button` ← `.asst-ctx-btn`.
  - **History, memory, permissions:** `asst.history-row` ← `.asst-history-row`,
    `asst.history-rename` ← `.asst-history-rename`; `asst.memory-row` ←
    `.asst-memory-row`, `asst.memory-add` ← `.asst-memory-add`,
    `asst.memory-edit` ← `.asst-memory-edit`; `asst.perm-row` ←
    `.asst-perm-row`, `asst.route-row` ← `.asst-route-row`; `asst.audit` ←
    `.asst-audit`, `asst.audit-row` ← `.asst-audit-row`;
    `asst.technical-id` ← `.asst-technical-id`.
- **State:** `asst.drawer[data-state="open"]`; `asst.mascot[data-state=
  "idle|thinking|working|confirm|error|reacting|loading|live"]` (replaces
  `is-busy`, `is-working`, `is-confirm`, `is-error`, `is-reacting`,
  `is-live-loading`, `has-live-renderer`, `is-rendered`); a failed image uses
  `data-state="failed"`; the current conversation is `aria-current`.
- **A11y:** the thread is focusable to scroll; the composer is labelled; the
  status is announced on transitions only; roving focus in the nav
  (Home/End/arrows) is kept.
- **Invariants:** 35, 49, 66, 71 (assistant audits never searched).
- **Coverage:** smoke4, 24, 25, 29, 39, 42, 43.

### V-30 `notifications`: Notifications (M11)
- **Route:** `KOS.show("notifications", filter?)`, where `filter` ∈
  `all|study|productivity|collection`. **Section:** Archive → Notifications.
- **Owner:** `js/modules/notifications.js` (page and bell); `js/core/notify.js`
  (ledger, out of scope).
- **Shows:** filter tabs; items grouped by day (kind, title, detail, relative
  time, read state); "Mark all as read"; "Clear the feed" (`confirm` danger);
  the device-alerts opt-in (per device, needs a user gesture, and the page says
  there is no push server, inv. 98); an empty state.
- **Bell (S-1):** unread badge; menu of the five most recent; "View all".
- **Actions:** `KOS.notify.open` (routes through `KOS.show`), `markAllRead`,
  `clear`, device opt-in toggle.
- **Hooks:** `notify.tabs` ← `.nt-tabs-list`; `notify.list` ← `.nt-list`;
  `notify.day` ← `.nt-day`; `notify.row` (`data-id`) ← `.nt-row`;
  `notify.bell`, `notify.badge`; `notify.device-toggle`
  (`aria-pressed`, was `.is-on`).
- **Invariants:** 95–98. **Coverage:** smoke53.

### V-31 `data`: Backup & Restore (M11)
- **Route:** `KOS.show("data")`. **Section:** Archive → Backup & Restore.
- **Owner:** `hub.js` (`KOS.views.data`); the cloud panel is
  `KOS.cloudui.panel` (`cloudui.js`).
- **Shows:** actions, each with a one-line explanation: Export full backup
  (.json), Import backup, Export revision summary (print/PDF), Reset everything.
  Beside them, what a backup covers and deliberately excludes (credentials,
  cloud sessions, sync metadata, inv. 7, 35). Account & Cloud Sync: sign
  in/create account, status, last merge, last error, Sync now, Sync files now
  (explicit binary upload, inv. 36), Sign out.
- **Actions:** `store.exportFull/importFull`; reset (`confirm` danger);
  `KOS.cloud.*`, `KOS.cloudsync.syncNow/retry/uploadBinaries`.
- **Hooks:** `archive.actions`, `archive.action` (`data-action`);
  `archive.cloud` ← `.save-wrap` (cloudui lookup); `cloud.status`,
  `cloud.signin`.
- **A11y:** cloudui announces sign-in/out and sync outcome transitions (2
  announce sites).
- **Invariants:** 7, 31–36, 49. **Coverage:** no smoke suite renders `data`
  (the cloud panel is exercised by `tools/cloud_integration.mjs`). `smoke56` must
  render it.

### V-32 `help`: Help & Guide (M11)
- **Route:** `KOS.show("help")`. **Section:** Archive → Help & Guide.
- **Owner:** `js/modules/help.js`.
- **Shows:** guide sections navigation; guide context for the current area;
  searchable manual rows (question → answer disclosure). This is where the rules
  that pages must not re-teach live (inv. 50a, 85).
- **Hooks:** `help.nav`, `help.nav-item` ← `.help-nav-item`; `help.block` ←
  `.help-block`; `help.row` ← `.help-row`, `help.row-head` ← `.help-row-head`;
  `help.search`.
- **State:** rows use `aria-expanded` (was `.open`); the nav item uses
  `aria-current`.
- **Coverage:** smoke3, 45.

### V-33 `sims`: Simulations (M12)
- **Route:** `KOS.show("sims", id?)`. **Section:** Study; the spine is hidden.
- **Owner:** `js/labs/sims.js` (index plus built-in sims), `sims-cs.js`,
  `sims-maths.js`, `sandboxes.js` (SQL, Regex, base converter, LMC).
- **Shows:** a catalogue filtered by category (pills) and search, with each
  sim's title, subject and linked refs, and gold-unlock state
  (`KOS.governor.simAccess`/`lockPanel`: gold gates labs and sims only,
  inv. 2). A single sim: its mounted panel (`mount(panel)`, inline, never a
  redirect), ← All simulations, and Open topic page →.
- **Actions:** open sim; unlock (governor); open topic → `ref`.
- **Hooks:** `lab.catalog`, `lab.category` ← `.cat-pill`, `lab.sim-card`
  (`data-sim`), `lab.sim` (`data-sim`); inner sim controls keep their own
  `data-ui` names under `lab.*` as they are rewritten (e.g. `lab.bit` ←
  `.bit`/`.cbit`, `lab.readout` ← `.sim-read`).
- **State:** `lab.sim[data-state="live"]` (was `.live`), flip/returning via
  `data-state`.
- **Canvas rule:** every colour comes from `KOS.labPalette()` (theme tokens
  resolved once per `data-theme`, cache cleared on theme change,
  `worked.js`/`pwa.js` observers).
- **Invariants:** 2, "Deep content and labs" notes. **Coverage:** smoke2, 43, 50.

### V-34 `worked`: Worked Example Engine (M12)
- **Route:** `KOS.show("worked")`. **Section:** Study.
- **Owner:** `js/labs/worked.js`, `worked-extra.js` (`KOS.worked.register`).
- **Shows:** a generator catalogue by category with search; the selected
  generator: inputs (Randomise), Generate working, stepwise reveal (next / all),
  diagrams.
- **Hooks:** `lab.worked`, `lab.worked-tab` ← `.lab-tab`, `lab.category` ←
  `.cat-pill`, `lab.worked-step` (`data-state="revealed"`).
- **Coverage:** smoke, smoke2.

### V-35 `trace`: Data Structure Trace Lab (M12)
- **Route:** `KOS.show("trace")`. **Owner:** `js/labs/trace.js`
  (`state.trace.tab`).
- **Shows:** tabs for stack, queue, linked list and tree, with operations
  (Push/Pop/Peek, Enqueue/Dequeue, Append/Prepend/Remove, Insert and the three
  traversals), a visualisation (`role="img"` with a text alternative) and
  highlighted code (`KOS.content.highlight`).
- **Hooks:** `lab.trace`, `lab.trace-tab` ← `.lab-tab`; highlighted code lines
  use `aria-current` (was `.hl`).
- **Coverage:** smoke.

### V-36 `oop`: C# OOP Architecture Sandbox (M12)
- **Route:** `KOS.show("oop")`. **Owner:** `js/labs/oop.js` (`state.oop`).
- **Shows:** class cards (name, abstract toggle, fields and methods with access
  modifier and type, virtual/override, base-class relation), plus Copy C# and
  Clear sandbox.
- **Actions:** add class/field/method; set base ("then click the parent class
  card"); delete; copy C#.
- **Hooks:** `lab.oop-class` (keeps `data-cid`) ← `.cls-card`,
  `lab.oop-class-head` ← `.cls-h`.
- **State:** base selection uses `data-state="basing"` on the root.
- **Coverage:** smoke.

---

## C. Embedded components (rebuilt with their host milestone)

| # | Component (owner) | Host | Contract and hooks (← legacy) | Coverage |
|---|---|---|---|---|
| C-1 | Flashcards engine `KOS.flashcards.mount/session` (`engines/flashcards.js`) | V-03, V-05, V-07 | A card that flips to show the answer, rated Again/Hard/Good/Easy (`KOS.srs.rate`, `sessions.log`); shuffle, restart, card stats (review history), deck edit (custom cards: add/update/delete, forked keys kept, inv. 87); mode pips; empty states. Hooks: `fc.card` ← `.fc-card` (`data-state="flipped"`), `fc.rate` (`data-grade`), `fc.mode` ← `.fc-mode`, `fc.pip` ← `.fc-pip`, `fc.custom` ← `.fc-custom`, `fc.empty` ← `.flashcards-empty`. | 6, 21, 43, 47 |
| C-2 | Quiz/exam engine `KOS.quiz.mountMCQ/mountExam` (`engines/quiz.js`) | V-03 | MCQ options with key and why; tariff filter; exam items with parts, a reveal-mark-scheme control and a self-mark (one session per item). Hooks: `quiz.option` ← `.qz-opt` (`aria-checked`; `data-state="right|wrong"`), `quiz.option-key` ← `.qz-opt-key`, `quiz.why` ← `.qz-why`, `quiz.chip` ← `.qz-chip`, `quiz.mark` ← `.qz-markbtn`. | 2, 37, 43 |
| C-3 | Study editor `KOS.editor.mount` (`editor.js`) | V-03 | Block list for notes (paragraph, markdown, heading, lists, key terms, table, code, callout, steps, worked example, diagram link, SVG figure, page break) and rows for spec, cards, quiz and exam; add, reorder, remove (`confirm`); Reset to curriculum; Done. It is the ONLY surface that edits material (inv. 86–89). Hooks: `editor.root`, `editor.block` (`data-bid`, `aria-current` when selected) ← `.ed-block`, `editor.row` ← `.ed-row`, `editor.add` ← `.ed-addbtn`. | 51 |
| C-4 | Content renderer `KOS.content.renderBlocks/inline/typeset` (`content.js`) | V-03, C-2 | Authored blocks → semantic HTML; figures via `KOS.figures.render`; code copy (`data-state="copied"`); embeds sims inline. It keeps `html` for authored content only; new `k-` classes per block type; `topic.note-block[data-bid]` wraps blocks (display: contents). | 2, 40, 51 |
| C-5 | Countdown widget `KOS.calendar.countdownWidget` | V-01, V-02, V-13 | See V-13 `cal.countdowns`. | 49 |
| C-6 | Media search `KOS.mediaSearch.open` (`mediasearch.js`) | V-16, V-19, V-21, V-22 | A provider search dialog (AniList/VNDB/IGDB); a row shows an "added" state; create on the provider first (inv. 92). Hooks: `msearch.dialog` ← `.msch-modal`, `msearch.input` ← `.msch-in`, `msearch.row` ← `.msch-row`, `msearch.add` ← `.msch-add` (`data-state="added"`), `msearch.status` ← `.msch-status`. | 7, 11, 14, 19, 42 |
| C-7 | Attachments `KOS.attach.mountTab` (`attachments.js`) | V-03, V-08 | File list, attach, rename, replace, remove (`confirm`), preview with fit/zoom, full screen, open, download, download from cloud (explicit binary, inv. 36), and document notes. Hooks: `attach.list`, `attach.preview` ← `.att-preview`, `attach.fs-bar` ← `.att-fs-bar`. | 32 |
| C-8 | RAG confidence `KOS.rag.picker/panel/dot` (`rag.js`) | V-01, V-03, V-06 | Red/Amber/Green picker; struggling-topics panel. Hooks: `rag.picker` ← `.rag-picker`, `rag.option` ← `.rag-pick` (`aria-checked`), `rag.option-label` ← `.rag-pick-l`. | 37, 43, 49 |
| C-9 | Pacing home card `KOS.pacingHomeCard` | V-01 | See V-01 and V-14 hooks. | 49 |
| C-10 | Governor HUD and profile popover (`governor.js`) | S-2 | See S-2. | 4, 15, 31 |
| C-11 | Shrine card `KOS.shrineCard` | V-23 | Style from `KOS.governor.shrineStyle`. | 38 |
| C-12 | Cloud panel `KOS.cloudui.panel` + sync chip | V-31, S-1 | See V-31. | — |
| C-13 | Assistant drawer and trigger | S-1, all | See V-29 `asst.drawer`. | 24, 25 |

---

## M. The M1 migration, as delivered (2026-09-24)

M1 kept the old presentation exactly as it was. Its stylesheet, classes and
markup are untouched, apart from the one additive `button.hstat` rule noted
below. A before/after screenshot comparison of every view at 1440 and 390 px,
in Dawn and Dusk, found only run-to-run rendering noise. What changed is what
logic and tests hold on to.

1. **The bridge: `js/core/ui-hooks.js`.** It loads right after `ui.js`. It
   was generated once, in M1, and from here only shrinks. It holds three
   tables:
   - `LEGACY_HOOKS`: legacy class → hook name, **one class to one hook**, so a
     test that told two classes apart can still tell their hooks apart;
   - `LEGACY_STATE`: state words mirrored into `data-state`;
   - `LEGACY_INTENT`: `primary` and `danger`, mirrored into `data-intent`.

   `KOS.ui.el()` derives the attributes from a node's classes when it
   creates the node. `KOS.ui.setClass()` replaces every `className =` write,
   and is SVG-safe. `KOS.ui.state(node, word, on)` replaces every
   `classList` toggle of a state word. `KOS.ui.hookify(root)` covers markup
   that arrives through `innerHTML` (the note renderer and lab truth tables).
   Each rebuilt view (M4–M12) emits its hooks directly and removes its rows
   from the tables; they are empty at M14.
2. **Where the names differ from this document, the table wins.** It is the
   complete list, about 690 rows. The contract sections name the hooks by
   role; the table resolves every legacy class, including the ones only a test
   ever touched. A view's contract section is brought in line with the table
   when that view is rebuilt.
3. **Hooks are token lists.** Always match them with `~=`
   (`[data-ui~="vault.card"]`), because one element can carry several hooks.
   `KOS.ui.hook(name)` returns that selector.
4. **Generic parts.** The short structural classes shared across components
   became a `part.*` vocabulary: `k` → `part.label`, `v` → `part.value`,
   `s` → `part.caption`, `sub` → `part.sub`, `pc` → `part.percent`,
   `ref` → `part.ref`, `st` → `part.status` and so on. A test reads them
   inside their owner: `[data-ui~="ui.stat"] [data-ui~="part.value"]`.
5. **State in M1 is `data-state`.** Legacy state classes are mirrored into
   `data-state` tokens. The ARIA-first mapping in §0.1 (`aria-current`,
   `aria-selected`, `aria-pressed`) is applied when each view is rebuilt,
   where the control's real role is designed rather than inferred.
6. **Variants became data attributes, not hooks or state.**
   - Callout kind, syntax-token kind, Governor stat kind and editor row kind
     use `data-kind`.
   - Other variants have their own attribute: `data-season` (Seasonal
     palette), `data-skin` (Shrine card style), `data-fit` (attachment preview
     fit), `data-hp` (Governor status), `data-block` (a calendar event drawn
     as a week block), `data-single` (a one-entry Shrine hall), `data-status`
     (spine leaf status), `data-section` (Reminders smart sections).
7. **Page-level state lives on `<html>`**, which the old classes on `body`
   and `#cols` did not:
   - `data-scroll-lock` (open modal);
   - `data-focus="stage|minimised"` (Focus session);
   - `data-shell="ready"` (mobile shell enhanced, inv. 72);
   - `data-assistant-drawer="open"`.

   The spine is `#cols[data-tree="none|open|closed"]`, owned by
   `KOS.shell.tree(mode)`, which replaced 34 copies of the two-line
   hide-the-spine write.
8. **One element owns its `data-state`: the assistant mascot.** Its value is
   the visual state (`idle`, `thinking`, `success` …), which the stylesheet
   and the Live2D seam match exactly. Its render flags are therefore boolean
   attributes: `data-loading`, `data-img-failed`, `data-live-renderer`,
   `data-live-loading`, `data-reacting`. Any future element whose
   `data-state` is a single owned value follows the same pattern.
9. **App code reads no presentation class.** Every class query in `js/`
   became a hook, state or intent selector. This covers `mobile-shell.js`,
   `openDialog`, the governor HUD and brand mark, cloudui, OOP, the assistant,
   the quiz and flashcard engines, labs and help. The last few structural reads
   gained explicit hooks: `ui.field-label`, `cal.w-slot`, `lab.oop-abstract`,
   `data-kind="custom"` and `files-tab` as state.
10. **Tests query hooks.** `tools/lib/ui-query.js` provides `hook`, `ui`,
    `uiAll`, `hasHook`, `hasState` and `byName`/`allByName` (accessible name).
    1,795 selector strings and `classList.contains` checks across the suites
    were converted mechanically, class by class. `.btn`/`.mini-btn` became the
    element (`button`), and every conversion where that could pick a different
    button was checked by hand. Three did (the Calendar phone "+", "Manage →",
    the assignment row's "Open"), and those use `byName`. `className`-based
    assertions (child order, exact class strings, scroll-spy targets) now read
    hooks and data attributes.
11. **What still names a legacy class in the tests, deliberately:**
    - negative "the retired X is not back" checks for classes the app no
      longer produces at all (`.home-ring`, `.np-pill`, `.th-status`,
      `.insp-mastery`, `.subject-workspace-tabs`, `.cal-thresh`, `.med-streaks`
      and others). These stay true and harmless;
    - third-party output (`.katex`);
    - a class a test adds to its own fixture (`.test-layer`);
    - source-text regexes that check an obsolete component is not constructed.

    `smoke55` (M2) bans the legacy vocabulary from `index.html`, `js/` and
    `css/`, not from the tests.
12. **Stylesheet assertions.** No suite reads `css/main.css` by name any more.
    `tools/lib/css.js` (`readCss()`, `stylesheets()`) joins every local sheet
    `index.html` links, in cascade order. The assertions were **not** split or
    deleted in M1: the legacy layer is still live, and they still protect it.
    [css-assertions.md](css-assertions.md) classifies all 153 (98 pin a legacy
    selector, 55 pin a design contract) as the worklist for M2, when
    `main.css` goes.
13. **Home's weekly facts.** The clickable fact (Cards due) is a native
    `<button>`. The two facts that go nowhere are no longer exposed as
    controls. A one-line additive rule (`button.hstat { font: inherit; … }`)
    keeps its rendering identical to the `div` it replaced, and smoke43 pins
    the behaviour.
14. **Carried to M2:** `smoke55` (legacy vocabulary, inline style, colour
    literals, breakpoints, depth budget, no CSS selecting `[data-ui]`) and
    `smoke56` (render purity, plus action-dispatch parity). The parity
    baseline is recorded from this M1 build, where every view still renders
    its legacy markup, before any view is rebuilt.

## Appendix: view index

| # | View id | Title | Owner | Milestone |
|---|---|---|---|---|
| V-01 | home | Home | hub.js | M6 |
| V-02 | subject | Subject desk | hub.js | M7 |
| V-03 | ref | Topic page | hub.js | M7 |
| V-04 | review | Review | review.js | M7 |
| V-05 | due | Due Today | due.js | M7 |
| V-06 | cardstats | Card Statistics | cardstats.js | M7 |
| V-07 | personaldeck | Personal Deck | due.js | M7 |
| V-08 | assignments | Assignment Tracker | assignments.js | M7 |
| V-09 | tracker | Exams & Papers | tracker.js | M7 |
| V-10 | focus | Focus Timer | focus.js | M8 |
| V-11 | reminders | Reminders | reminders.js | M8 |
| V-12 | tasks | Habits | todo.js | M8 |
| V-13 | calendar | Calendar | calendar.js | M8 |
| V-14 | pacing | Pacing | pacing.js | M8 |
| V-15 | matrix | Collection Overview | matrix.js | M10 |
| V-16 | anime | Anime | anime.js | M10 |
| V-17 | seasonal | Seasonal | anime.js | M10 |
| V-18 | (shell) | Vault shell | medview.js | M9 |
| V-19 | books | Books | books.js | M10 |
| V-20 | mangaka | Mangaka | books.js | M10 |
| V-21 | vn | Visual Novels | vn.js | M10 |
| V-22 | game | Games | games.js | M10 |
| V-23 | shrine | The Shrine | shrine.js | M10 |
| V-24 | wishlist | Budget Planner | wishlist.js | M10 |
| V-25 | goals | Collection Goals | goals.js | M10 |
| V-26 | mediasync | Sync & Import | mediasync.js | M10 |
| V-27 | aniprofile, vndbprofile | Provider profiles | aniprofile.js, vndbprofile.js | M10 |
| V-28 | governor | The Governor | governor-ui.js | M11 |
| V-29 | assistant | Kurenai Assistant | assistant.js | M12 |
| V-30 | notifications | Notifications | notifications.js | M11 |
| V-31 | data | Backup & Restore | hub.js, cloudui.js | M11 |
| V-32 | help | Help & Guide | help.js | M11 |
| V-33 | sims | Simulations | labs/sims*.js, sandboxes.js | M12 |
| V-34 | worked | Worked Examples | labs/worked*.js | M12 |
| V-35 | trace | Trace Lab | labs/trace.js | M12 |
| V-36 | oop | OOP Sandbox | labs/oop.js | M12 |

The 36 registered `KOS.views` are all covered: V-18 is the shared shell rather
than a route, and V-27 covers two routes.
