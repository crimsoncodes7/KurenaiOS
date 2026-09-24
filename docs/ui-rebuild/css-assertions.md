# Stylesheet assertions in the smoke suites

Produced in M1 (2026-09-24) of the presentation rebuild ([PLAN.md](PLAN.md))
as the worklist for M2; **acted on in M2** (the disposition column).

In M1 every suite stopped reading `css/main.css` by name and read the
stylesheet through `tools/lib/css.js` (`readCss()`), which joins every
local sheet `index.html` links, in cascade order. M1 classified all 153
assertions mechanically:

- **legacy-selector** (98): the regex names a class from the legacy
  stylesheet and pins one rule of the old design.
- **contract** (55): the assertion pins a design-system rule with no legacy
  selector: tokens, breakpoints, safe-area insets, 16px phone inputs,
  coarse-pointer targets, reduced motion, keyframes.

## What M2 did

M2 deleted `css/main.css` and linked thirteen empty layer files
(`css/tokens.css` … `css/themes.css`, `css/views/*.css`). Nothing is left
for a stylesheet assertion to hold until each layer is written, so:

- **Contracts wait for their layer; they are not deleted.**
  `tools/lib/css.js` gained `pending(layer, what)`: while a layer file has
  no rules the assertion prints `wait  <what> — pending until <file> has
  rules` and passes; the moment the milestone that owns the layer adds a
  rule, every contract that layer owns switches on. Nobody has to remember
  to re-enable them. Contracts that cannot fail on an empty stylesheet
  (negative checks, the deploy script) stay always on.
- **Contracts still name the M1 tokens** (`--bg0`, `--z-modal: 120` …).
  M3 re-points an assertion only where the new palette renames a token;
  the mascot contract names `asst-mascot-img` in two reduced-motion regexes
  (smoke24:197, smoke29:232) and is re-pointed when M12 writes
  `css/views/assistant.css`.
- **Legacy pins were deleted or rewritten.** Where the requirement outlives
  the old design, the assertion is rewritten against what survives the
  purge — state attributes CSS may select (`[data-scroll-lock]`,
  `#cols[data-tree]`, `[data-shell="ready"]`, the mascot's
  `data-state`/`data-reacting`/`data-live-renderer`), keyframe and custom
  property names, the `--z-*` scale — never against a class, and waits for
  its layer. Every rewrite was checked for satisfiability against a
  translation of the legacy rules into those attributes. Everything else
  is deleted; each deletion is listed below and in the M2 commit.
- **Six rows the script labelled "contract" were legacy pins** on
  re-reading (the M1 note said each row is re-read when acted on): four
  were helper lines (a block slice or a media-block match) whose only
  consumer was a legacy assertion, and two held legacy selectors in string
  arrays or a `.att-pdf` rule. They are marked **reclassified legacy**.

| Disposition | Count |
|---|---|
| contract kept (waiting for its layer, or always on) | 49 |
| contract re-read as legacy and deleted | 6 |
| legacy pin rewritten as a selector-agnostic layer contract | 25 |
| legacy pin deleted | 73 |
| **total** | **153** |

Two stylesheet-wide guards replace groups of deleted pins and are always
on: smoke47 "no stylesheet sets text below the 11px floor" (invariant 63,
replacing the "final polish block" list) and smoke55's colour-literal, raw
px, breakpoint and legacy-vocabulary guards.

Line numbers in the first column are as of the M1 commit.

| Suite:line | Kind (M1) | Legacy classes named | Assertion message | M2 disposition |
|---|---|---|---|---|
| smoke15:72 | contract |  |  | kept · waits for `tokens` |
| smoke15:74 | contract |  |  | kept · waits for `tokens` |
| smoke15:75 | contract |  |  | kept · waits for `tokens` |
| smoke15:76 | contract |  |  | kept · waits for `tokens` |
| smoke15:77 | contract |  |  | kept · waits for `tokens` |
| smoke15:84 | contract |  |  | kept · waits for `tokens` |
| smoke15:86 | contract |  |  | kept · waits for `tokens` |
| smoke15:89 | contract |  |  | kept · waits for `themes` |
| smoke15:93 | contract |  |  | kept · always on |
| smoke18:144 | contract |  | bottom-bar rail missing | kept · waits for `layout` |
| smoke18:145 | contract |  | safe-area bottom missing | kept · waits for `layout` |
| smoke18:146 | contract |  | safe-area top missing | kept · waits for `layout` |
| smoke18:147 | contract |  | 16px inputs (iOS zoom guard) missing | kept · waits for `components` |
| smoke18:148 | legacy-selector | `modal-ov` | bottom-sheet modals missing | deleted |
| smoke18:149 | contract |  | coarse-pointer targets missing | kept · waits for `components` |
| smoke18:150 | legacy-selector | `sync-chip` | chip nowrap missing | deleted |
| smoke24:197 | contract |  | reduced-motion contract missing for the mascot | kept · waits for `views/assistant` |
| smoke24:199 | legacy-selector | `assistant-trigger` | reduced-motion contract missing for the trigger | deleted — trigger reduced motion is smoke29:231 |
| smoke24:201 | contract |  | assets/ must ship in the production deploy | kept · always on |
| smoke29:230 | legacy-selector | `asst-page` `asst-drawer` | assistant must inherit canonical theme tokens | deleted — theme inheritance is smoke55's colour-literal guard |
| smoke29:231 | contract |  | reduced-motion trigger coverage missing | kept · waits for `layout` |
| smoke29:232 | contract |  | reduced-motion mascot coverage missing | kept · waits for `views/assistant` |
| smoke31:189 | legacy-selector | `gov-seat-hero` |  | deleted |
| smoke31:190 | legacy-selector | `shop-card` |  | deleted — reduced motion is smoke29/smoke39 |
| smoke31:194 | legacy-selector | `heat-svg` |  | deleted |
| smoke31:204 | contract |  |  | **reclassified legacy** · deleted — its strings are legacy selectors (`.gov-seat-hero .id-access`, `.hp-preview` …) |
| smoke31:205 | legacy-selector | `gov-head` `gov-workspace` |  | deleted |
| smoke31:207 | legacy-selector | `assistant-trigger` `at-dot` |  | deleted |
| smoke31:210 | legacy-selector | `assistant-trigger` `is-busy` `at-dot` |  | deleted |
| smoke31:211 | legacy-selector | `assistant-trigger` `is-confirm` `at-dot` |  | deleted |
| smoke31:213 | contract |  |  | kept · always on (own step) |
| smoke32:210 | legacy-selector | `study-grid` `insp-closed` |  | deleted |
| smoke32:211 | legacy-selector | `att-body` |  | deleted |
| smoke32:216 | legacy-selector | `att-pdf` |  | deleted — raw px heights are smoke55's guard |
| smoke32:221 | contract |  |  | **reclassified legacy** · deleted — the `vh` height of `.att-pdf`; smoke55 bans raw px lengths instead |
| smoke36:116 | legacy-selector | `med-record-modal` `med-form` | record body is not internally scrollable | deleted |
| smoke36:117 | legacy-selector | `med-edit-section` | desktop section index/body grid is missing | deleted |
| smoke36:118 | legacy-selector | `med-edit-grid` | shared two-column field grid is missing | deleted |
| smoke36:119 | legacy-selector | `med-edit-grid` | mobile editor does not collapse to one column | deleted |
| smoke37:77 | legacy-selector | `sa-grid` | the grid is not four columns — 8 tiles must divide evenly | deleted |
| smoke37:114 | legacy-selector | `continue-action` | the action card is not full width | deleted |
| smoke37:154 | legacy-selector | `subject-side` | .subject-side is not explicitly non-sticky | deleted |
| smoke37:155 | legacy-selector | `subject-side` | .subject-side is sticky | deleted — vacuous without the class |
| smoke37:156 | legacy-selector | `study-inspector` | .study-inspector is still pinned | deleted |
| smoke37:200 | legacy-selector | `sec-card` `bar-fill` |  | deleted |
| smoke37:201 | legacy-selector | `sa-tile` `sa-track` |  | deleted |
| smoke37:203 | legacy-selector | `sa-tile` `due` | work waiting to be done has no distinct attention state | deleted |
| smoke37:366 | legacy-selector | `study-tab` `tab-n` | the count chip has no fixed geometry | deleted |
| smoke37:368 | legacy-selector | `study-tabs-topic` | the topic strip wraps again | deleted |
| smoke39:458 | contract |  | missing @keyframes ${kf} | kept · rewritten on keyframes/attributes · waits for `views/assistant` |
| smoke39:460 | legacy-selector | `asst-mascot-img` | the mascot image must run both breath and sway | **rewritten** · keyframes, `--asst-*` and `data-state`/`data-reacting`/`data-live-renderer` · waits for `views/assistant` |
| smoke39:462 | legacy-selector | `asst-mascot-frame` | the bloom must animate on the frame | **rewritten** · keyframes, `--asst-*` and `data-state`/`data-reacting`/`data-live-renderer` · waits for `views/assistant` |
| smoke39:466 | contract |  | missing default ${d} | kept · rewritten on keyframes/attributes · waits for `views/assistant` |
| smoke39:469 | legacy-selector | `asst-mascot-img` | breathing must be anchored at her feet, matching object-position: bottom center | **rewritten** · keyframes, `--asst-*` and `data-state`/`data-reacting`/`data-live-renderer` · waits for `views/assistant` |
| smoke39:475 | legacy-selector | `asst-mascot-frame` | idle must not have an entry animation | **rewritten** · keyframes, `--asst-*` and `data-state`/`data-reacting`/`data-live-renderer` · waits for `views/assistant` |
| smoke39:483 | contract |  | ${state} must enter with ${kf} | kept · rewritten on keyframes/attributes · waits for `views/assistant` |
| smoke39:484 | contract |  | missing @keyframes ${kf} | kept · rewritten on keyframes/attributes · waits for `views/assistant` |
| smoke39:487 | legacy-selector | `asst-mascot` |  | **rewritten** · keyframes, `--asst-*` and `data-state`/`data-reacting`/`data-live-renderer` · waits for `views/assistant` |
| smoke39:494 | legacy-selector | `asst-mascot` `is-reacting` `asst-bloom-ring` | ring-one must ripple for 0.34s | **rewritten** · keyframes, `--asst-*` and `data-state`/`data-reacting`/`data-live-renderer` · waits for `views/assistant` |
| smoke39:496 | legacy-selector | `asst-mascot` `is-reacting` `ring-two` |  | **rewritten** · keyframes, `--asst-*` and `data-state`/`data-reacting`/`data-live-renderer` · waits for `views/assistant` |
| smoke39:506 | legacy-selector | `asst-mascot` `is-reacting` `asst-mascot-img` |  | **rewritten** · keyframes, `--asst-*` and `data-state`/`data-reacting`/`data-live-renderer` · waits for `views/assistant` |
| smoke39:513 | legacy-selector | `asst-mascot` `has-live-renderer` `asst-mascot-img` `asst-mascot-frame` |  | **rewritten** · keyframes, `--asst-*` and `data-state`/`data-reacting`/`data-live-renderer` · waits for `views/assistant` |
| smoke39:516 | contract |  |  | kept · rewritten on keyframes/attributes · waits for `views/assistant` |
| smoke39:517 | legacy-selector | `asst-mascot` |  | **rewritten** · keyframes, `--asst-*` and `data-state`/`data-reacting`/`data-live-renderer` · waits for `views/assistant` |
| smoke39:525 | contract |  |  | kept · rewritten on keyframes/attributes · waits for `views/assistant` |
| smoke39:526 | contract |  |  | kept · rewritten on keyframes/attributes · waits for `views/assistant` |
| smoke39:527 | contract |  | reduced motion must clear translate/rotate/scale, not just animations | kept · rewritten on keyframes/attributes · waits for `views/assistant` |
| smoke40:281 | contract |  |  | kept · waits for `layout` |
| smoke40:290 | contract |  |  | kept · waits for `layout` |
| smoke42:76 | contract |  |  | kept · stray tiers always on; "all five in use" waits for `layout` |
| smoke42:121 | contract |  | the token comment does not describe the  | kept · waits for `tokens` |
| smoke42:147 | contract |  |  | kept · rail/clearance wait for `layout`, 16px inputs for `components` |
| smoke42:188 | legacy-selector | `modal-open` | modal-open has no scroll-lock rule in the stylesheet | **rewritten** · `[data-scroll-lock]` sets `overflow: hidden` · waits for `components` |
| smoke42:372 | contract |  | the bespoke .bk-tab styling is back — it should resolve to .tab-card | kept · always on |
| smoke42:374 | legacy-selector | `tab-card` | the shared card-tab styling is missing | deleted |
| smoke42:388 | legacy-selector | `empty-state` `compact` | the compact form still reserves a card-sized box (audit U-20) | deleted |
| smoke42:431 | legacy-selector | `u-scroller` | no edge fades | **rewritten** · the edge fades read the scroller's edge state · waits for `components` |
| smoke42:432 | legacy-selector | `u-scroller` `at-start` | the fades do not react to scroll position, so they lie at the ends | **rewritten** · the edge fades read the scroller's edge state · waits for `components` |
| smoke42:443 | legacy-selector | `mx-now-grid` | the on-the-go grid is not a grid | deleted |
| smoke42:462 | legacy-selector | `med-cover` | .med-cover is not positioned, so the placeholder cannot sit behind the image | deleted |
| smoke42:474 | legacy-selector | `skip-link` | the skip link never becomes visible | **rewritten** · `.skip-link` is a kept utility name · waits for `base` |
| smoke42:475 | legacy-selector | `skip-link` | the skip link is not hidden off-screen when unfocused | **rewritten** · off-screen by transform, negative offset or clip · waits for `base` |
| smoke42:480 | contract |  | the layer scale is missing —  | kept · waits for `tokens` |
| smoke42:482 | contract |  |  | kept · waits for `tokens` |
| smoke42:483 | contract |  |  | kept · waits for `tokens` |
| smoke42:485 | legacy-selector | `toast` | the toast does not use the layer scale (audit B-10/G-26) | **rewritten** · `z-index: var(--z-toast)` · waits for `components` |
| smoke43:137 | contract |  | the 860 tier no longer floats the spine — this suite | kept · waits for `layout` |
| smoke43:198 | legacy-selector | `study-nav` | the nav bar is sticky again and covers the text it introduces | deleted — vacuous without the class; inv. 52 is rebuilt in M7 |
| smoke43:409 | legacy-selector | `ctl-row` |  | deleted |
| smoke43:433 | legacy-selector | `fc-r-hint` |  | deleted |
| smoke43:445 | legacy-selector | `tree-open-btn` | the opener | deleted |
| smoke43:447 | contract |  |  | **reclassified legacy** · deleted — the tier slice fed the `.tree-open-btn` assertion (448) |
| smoke43:448 | legacy-selector | `tree-closed` `tree-open-btn` | the opener never switches on for the overlay tiers | deleted |
| smoke43:461 | legacy-selector | `tree-closed` `tree-reopen` | the floating pill is still rendered on phones | deleted — vacuous without the class |
| smoke43:463 | legacy-selector | `tree-closed` | the closed spine still occupies the overlay tiers | **rewritten** · `#cols[data-tree="closed"] #tree` takes no space · waits for `layout` |
| smoke43:477 | legacy-selector | `dl-title` |  | deleted |
| smoke43:682 | legacy-selector | `hi-stats` | the headline figures have no surface of their own | deleted |
| smoke43:687 | legacy-selector | `home-id` `has-banner` `hi-status` | the status pill still assumes dark artwork | deleted |
| smoke44:242 | contract |  | the .vh-painted rules are still in the stylesheet | kept · always on |
| smoke44:244 | legacy-selector | `vault-hero` | the hero | deleted |
| smoke44:250 | legacy-selector | `vh-scrim` | the fallback path has no scrim rule | deleted |
| smoke44:295 | contract |  | the menu layer is not below the modal layer | kept · waits for `tokens` |
| smoke44:297 | legacy-selector | `menu-panel` | the panel is not on the menu layer | **rewritten** · `z-index: var(--z-menu)` · waits for `components` |
| smoke44:434 | legacy-selector | `mk-letter` | the divider scrolls away with the list it labels | deleted |
| smoke45:819 | contract |  | #topbar is not positioned, so its backdrop-filter traps the search results underneath the  | kept · waits for `layout` |
| smoke45:822 | contract |  |  | kept · waits for `tokens` |
| smoke45:841 | legacy-selector | `icon-btn` `mini-btn` `xbtn` `med-fav` | the icon controls have no 32px visual floor | **rewritten** · a 32px control floor · waits for `components` |
| smoke45:843 | contract |  |  | kept · waits for `components` |
| smoke45:849 | legacy-selector | `cal-ev` | the calendar chip has no 24px floor | deleted |
| smoke45:850 | legacy-selector | `cal-cell` `cal-ev` | chips are not spaced, so the 2.5.8 exception does not apply | deleted |
| smoke45:853 | contract |  | the decision not to use 44px in a month cell is undocumented | kept · waits for `views/productivity` |
| smoke45:862 | legacy-selector | `todo-tick` `rem-check` | the completion checkboxes are back under the 24px floor | deleted — the 32/44px floors are smoke45:841/843 |
| smoke45:864 | legacy-selector | `rem-check` `sm` | the sub-task check is under 24px | deleted — the 32/44px floors are smoke45:841/843 |
| smoke45:865 | legacy-selector | `cal-phone-date` | the phone day header is under the 24px floor | deleted — the 32/44px floors are smoke45:841/843 |
| smoke45:867 | contract |  |  | **reclassified legacy** · deleted — fed the `.cal-phone-date` 44px assertion; 843 keeps the coarse-pointer 44px |
| smoke45:871 | legacy-selector | `rem-check` |  | deleted — the 32/44px floors are smoke45:841/843 |
| smoke45:878 | legacy-selector | `chk` `ts-chk` | the progress checks lost their chip-sized hit area | deleted — the 32/44px floors are smoke45:841/843 |
| smoke46:98 | legacy-selector | `fx-setup` | compact .fx-setup still has an automatic min-content track | deleted |
| smoke46:100 | legacy-selector | `fx-link-row` | the phone links did not become a single shrinkable column | deleted |
| smoke46:102 | legacy-selector | `fx-modes` | the phone mode cards still compete side by side | deleted |
| smoke46:107 | legacy-selector | `fx-link-row` `cal-field` `status-sel` | linked Focus selects can still establish an off-screen width | deleted |
| smoke46:109 | legacy-selector | `fx-obj-field` | the objective keeps its desktop cap | deleted |
| smoke46:110 | legacy-selector | `fx-start` | Start is not the clear phone CTA | deleted |
| smoke46:111 | legacy-selector | `fx-minimised` `fx-dock` | the populated minimised dock still competes in one shrinking row | deleted |
| smoke46:113 | legacy-selector | `fx-dock-ctl` `mini-btn` | the minimised phone controls cannot retain coarse-pointer targets | deleted — 44px targets are smoke45:843 |
| smoke46:115 | legacy-selector | `fx-minimised` | page content does not clear the two-row minimised dock | deleted |
| smoke46:137 | legacy-selector | `mobile-shell-ready` `rail-item` | the three low-frequency destinations are not presentation-only hidden at the phone tier | **rewritten** · phone-tier hiding of search/rail is gated on `[data-shell="ready"]` · waits for `layout` |
| smoke46:139 | legacy-selector | `mobile-shell-ready` |  | **rewritten** · phone-tier hiding of search/rail is gated on `[data-shell="ready"]` · waits for `layout` |
| smoke46:140 | legacy-selector | `mobile-shell-ready` `mobile-search-trigger` |  | **rewritten** · phone-tier hiding of search/rail is gated on `[data-shell="ready"]` · waits for `layout` |
| smoke46:141 | legacy-selector | `mobile-shell-ready` `mobile-more` | a failed mobile-shell load can hide canonical search/nav without mounting replacements | **rewritten** · phone-tier hiding of search/rail is gated on `[data-shell="ready"]` · waits for `layout` |
| smoke46:174 | legacy-selector | `subnav-item` `subnav-scroller` `subnav-sep` | the compact strip can still wrap | deleted |
| smoke46:180 | legacy-selector | `sec-head` `sec-title` | a long spine title can still orphan its count/arrow onto another flex line | deleted |
| smoke46:189 | legacy-selector | `rail-foot` | the phone rail-foot must not be position:fixed any more | deleted |
| smoke46:276 | legacy-selector | `n-code` |  | deleted |
| smoke46:277 | legacy-selector | `n-code` | long Ref-page code still establishes a hidden desktop-width inline box on phones | deleted |
| smoke46:284 | contract |  | #app lost its vh/dvh fallback pair | kept · waits for `layout` |
| smoke46:285 | contract |  | #main does not reserve the bar and home indicator | kept · waits for `layout` |
| smoke46:287 | legacy-selector | `tree-closed` | the retired Spec-spine clearance still double-pads phone pages | deleted — vacuous without the class |
| smoke46:289 | legacy-selector | `toast` | toasts can still render behind the fixed phone bar | **rewritten** · the toast clears `--tabbar-h` + safe area · waits for `components` |
| smoke46:294 | legacy-selector | `rail-item` `mobile-more` `lbl` |  | deleted — the 11px floor is smoke47's stylesheet-wide guard |
| smoke46:320 | legacy-selector | `mobile-shell-ready` `rem-grid` `rem-side` `med-layout` | compact side rails hide without a successfully mounted disclosure module | **rewritten** · phone-tier hiding of search/rail is gated on `[data-shell="ready"]` · waits for `layout` |
| smoke47:146 | contract |  |  | kept · rewritten as the stylesheet-wide 11px type floor · always on |
| smoke47:149 | legacy-selector | `fx-deal-list` | Focus reward prose is still forced into mono | deleted |
| smoke47:154 | contract |  | shadow ink is not derived from --bg0 | kept · waits for `tokens` |
| smoke47:155 | contract |  | --shadow- | kept · waits for `tokens` |
| smoke47:157 | legacy-selector | `asst-drawer` | the raised Assistant drawer keeps a literal shadow | deleted — literal shadows are smoke55's colour-literal guard |
| smoke47:164 | legacy-selector | `cardstats-stat-strip` | Card Stats is not intrinsically responsive | deleted |
| smoke47:169 | contract |  |  | **reclassified legacy** · deleted — the "Phase G" block slice fed `.gov-head .gov-tabs` / tracker pins |
| smoke47:177 | contract |  |  | **reclassified legacy** · deleted — the "Phase G" block slice fed `.shrine-note-btn` / `.shrine-feature` pins |
| smoke49:435 | contract |  |  | kept · re-pointed at `css/views/productivity.css` · waits for it |
| smoke50:269 | legacy-selector | `study-nav` | the study nav is sticky again | deleted — vacuous without the class; inv. 52 is rebuilt in M7 |
| smoke52:270 | legacy-selector | `med-score-corner` | the corner score is not top-left | deleted |
| smoke52:271 | legacy-selector | `med-quickrow` | the hover row can still wrap (and clip the +1) | deleted |
