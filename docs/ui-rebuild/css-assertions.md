# Stylesheet assertions in the smoke suites

Produced in M1 (2026-09-24) of the presentation rebuild ([PLAN.md](PLAN.md)).
In M1 every suite stopped reading `css/main.css` by name. They now read the
stylesheet through `tools/lib/css.js` (`readCss()`), which joins every local
sheet `index.html` links, in cascade order. The assertions themselves still
run against the legacy layer, which is intact and live in M1, so none were
deleted.

This file is the **worklist for M2**, when `main.css` is deleted. Each
assertion is classified mechanically:

- **legacy-selector** (98): the regex names a class from
  the legacy stylesheet. It pins one rule of the old design. M2 deletes it,
  or rewrites it as a behavioural check when the requirement it protects
  outlives the old design (for example a 44px phone target, the tab-bar
  clearance or a reduced-motion guard). Every deletion is listed in the M2
  commit.
- **contract** (55): the assertion pins a design-system
  rule with no legacy selector: tokens, breakpoints, safe-area insets, 16px
  phone inputs, coarse-pointer targets, reduced motion, keyframes. From M3
  the new `css/*.css` layers must satisfy these as written, and they are
  re-pointed at the new token names only where the name itself changes.

The classification is made by a script, so each row is re-read when it is
acted on. Line numbers are as of the M1 commit.

| Suite:line | Kind | Legacy classes named | Assertion message |
|---|---|---|---|
| smoke15:72 | contract |  |  |
| smoke15:74 | contract |  |  |
| smoke15:75 | contract |  |  |
| smoke15:76 | contract |  |  |
| smoke15:77 | contract |  |  |
| smoke15:84 | contract |  |  |
| smoke15:86 | contract |  |  |
| smoke15:89 | contract |  |  |
| smoke15:93 | contract |  |  |
| smoke18:144 | contract |  | bottom-bar rail missing |
| smoke18:145 | contract |  | safe-area bottom missing |
| smoke18:146 | contract |  | safe-area top missing |
| smoke18:147 | contract |  | 16px inputs (iOS zoom guard) missing |
| smoke18:148 | legacy-selector | `modal-ov` | bottom-sheet modals missing |
| smoke18:149 | contract |  | coarse-pointer targets missing |
| smoke18:150 | legacy-selector | `sync-chip` | chip nowrap missing |
| smoke24:197 | contract |  | reduced-motion contract missing for the mascot |
| smoke24:199 | legacy-selector | `assistant-trigger` | reduced-motion contract missing for the trigger |
| smoke24:201 | contract |  | assets/ must ship in the production deploy |
| smoke29:230 | legacy-selector | `asst-page` `asst-drawer` | assistant must inherit canonical theme tokens |
| smoke29:231 | contract |  | reduced-motion trigger coverage missing |
| smoke29:232 | contract |  | reduced-motion mascot coverage missing |
| smoke31:189 | legacy-selector | `gov-seat-hero` |  |
| smoke31:190 | legacy-selector | `shop-card` |  |
| smoke31:194 | legacy-selector | `heat-svg` |  |
| smoke31:204 | contract |  |  |
| smoke31:205 | legacy-selector | `gov-head` `gov-workspace` |  |
| smoke31:207 | legacy-selector | `assistant-trigger` `at-dot` |  |
| smoke31:210 | legacy-selector | `assistant-trigger` `is-busy` `at-dot` |  |
| smoke31:211 | legacy-selector | `assistant-trigger` `is-confirm` `at-dot` |  |
| smoke31:213 | contract |  |  |
| smoke32:210 | legacy-selector | `study-grid` `insp-closed` |  |
| smoke32:211 | legacy-selector | `att-body` |  |
| smoke32:216 | legacy-selector | `att-pdf` |  |
| smoke32:221 | contract |  |  |
| smoke36:116 | legacy-selector | `med-record-modal` `med-form` | record body is not internally scrollable |
| smoke36:117 | legacy-selector | `med-edit-section` | desktop section index/body grid is missing |
| smoke36:118 | legacy-selector | `med-edit-grid` | shared two-column field grid is missing |
| smoke36:119 | legacy-selector | `med-edit-grid` | mobile editor does not collapse to one column |
| smoke37:77 | legacy-selector | `sa-grid` | the grid is not four columns — 8 tiles must divide evenly |
| smoke37:114 | legacy-selector | `continue-action` | the action card is not full width |
| smoke37:154 | legacy-selector | `subject-side` | .subject-side is not explicitly non-sticky |
| smoke37:155 | legacy-selector | `subject-side` | .subject-side is sticky |
| smoke37:156 | legacy-selector | `study-inspector` | .study-inspector is still pinned |
| smoke37:200 | legacy-selector | `sec-card` `bar-fill` |  |
| smoke37:201 | legacy-selector | `sa-tile` `sa-track` |  |
| smoke37:203 | legacy-selector | `sa-tile` `due` | work waiting to be done has no distinct attention state |
| smoke37:366 | legacy-selector | `study-tab` `tab-n` | the count chip has no fixed geometry |
| smoke37:368 | legacy-selector | `study-tabs-topic` | the topic strip wraps again |
| smoke39:458 | contract |  | missing @keyframes ${kf} |
| smoke39:460 | legacy-selector | `asst-mascot-img` | the mascot image must run both breath and sway |
| smoke39:462 | legacy-selector | `asst-mascot-frame` | the bloom must animate on the frame |
| smoke39:466 | contract |  | missing default ${d} |
| smoke39:469 | legacy-selector | `asst-mascot-img` | breathing must be anchored at her feet, matching object-position: bottom center |
| smoke39:475 | legacy-selector | `asst-mascot-frame` | idle must not have an entry animation |
| smoke39:483 | contract |  | ${state} must enter with ${kf} |
| smoke39:484 | contract |  | missing @keyframes ${kf} |
| smoke39:487 | legacy-selector | `asst-mascot` |  |
| smoke39:494 | legacy-selector | `asst-mascot` `is-reacting` `asst-bloom-ring` | ring-one must ripple for 0.34s |
| smoke39:496 | legacy-selector | `asst-mascot` `is-reacting` `ring-two` |  |
| smoke39:506 | legacy-selector | `asst-mascot` `is-reacting` `asst-mascot-img` |  |
| smoke39:513 | legacy-selector | `asst-mascot` `has-live-renderer` `asst-mascot-img` `asst-mascot-frame` |  |
| smoke39:516 | contract |  |  |
| smoke39:517 | legacy-selector | `asst-mascot` |  |
| smoke39:525 | contract |  |  |
| smoke39:526 | contract |  |  |
| smoke39:527 | contract |  | reduced motion must clear translate/rotate/scale, not just animations |
| smoke40:281 | contract |  |  |
| smoke40:290 | contract |  |  |
| smoke42:76 | contract |  |  |
| smoke42:121 | contract |  | the token comment does not describe the  |
| smoke42:147 | contract |  |  |
| smoke42:188 | legacy-selector | `modal-open` | modal-open has no scroll-lock rule in the stylesheet |
| smoke42:372 | contract |  | the bespoke .bk-tab styling is back — it should resolve to .tab-card |
| smoke42:374 | legacy-selector | `tab-card` | the shared card-tab styling is missing |
| smoke42:388 | legacy-selector | `empty-state` `compact` | the compact form still reserves a card-sized box (audit U-20) |
| smoke42:431 | legacy-selector | `u-scroller` | no edge fades |
| smoke42:432 | legacy-selector | `u-scroller` `at-start` | the fades do not react to scroll position, so they lie at the ends |
| smoke42:443 | legacy-selector | `mx-now-grid` | the on-the-go grid is not a grid |
| smoke42:462 | legacy-selector | `med-cover` | .med-cover is not positioned, so the placeholder cannot sit behind the image |
| smoke42:474 | legacy-selector | `skip-link` | the skip link never becomes visible |
| smoke42:475 | legacy-selector | `skip-link` | the skip link is not hidden off-screen when unfocused |
| smoke42:480 | contract |  | the layer scale is missing —  |
| smoke42:482 | contract |  |  |
| smoke42:483 | contract |  |  |
| smoke42:485 | legacy-selector | `toast` | the toast does not use the layer scale (audit B-10/G-26) |
| smoke43:137 | contract |  | the 860 tier no longer floats the spine — this suite |
| smoke43:198 | legacy-selector | `study-nav` | the nav bar is sticky again and covers the text it introduces |
| smoke43:409 | legacy-selector | `ctl-row` |  |
| smoke43:433 | legacy-selector | `fc-r-hint` |  |
| smoke43:445 | legacy-selector | `tree-open-btn` | the opener |
| smoke43:447 | contract |  |  |
| smoke43:448 | legacy-selector | `tree-closed` `tree-open-btn` | the opener never switches on for the overlay tiers |
| smoke43:461 | legacy-selector | `tree-closed` `tree-reopen` | the floating pill is still rendered on phones |
| smoke43:463 | legacy-selector | `tree-closed` | the closed spine still occupies the overlay tiers |
| smoke43:477 | legacy-selector | `dl-title` |  |
| smoke43:682 | legacy-selector | `hi-stats` | the headline figures have no surface of their own |
| smoke43:687 | legacy-selector | `home-id` `has-banner` `hi-status` | the status pill still assumes dark artwork |
| smoke44:242 | contract |  | the .vh-painted rules are still in the stylesheet |
| smoke44:244 | legacy-selector | `vault-hero` | the hero |
| smoke44:250 | legacy-selector | `vh-scrim` | the fallback path has no scrim rule |
| smoke44:295 | contract |  | the menu layer is not below the modal layer |
| smoke44:297 | legacy-selector | `menu-panel` | the panel is not on the menu layer |
| smoke44:434 | legacy-selector | `mk-letter` | the divider scrolls away with the list it labels |
| smoke45:819 | contract |  | #topbar is not positioned, so its backdrop-filter traps the search results underneath the  |
| smoke45:822 | contract |  |  |
| smoke45:841 | legacy-selector | `icon-btn` `mini-btn` `xbtn` `med-fav` | the icon controls have no 32px visual floor |
| smoke45:843 | contract |  |  |
| smoke45:849 | legacy-selector | `cal-ev` | the calendar chip has no 24px floor |
| smoke45:850 | legacy-selector | `cal-cell` `cal-ev` | chips are not spaced, so the 2.5.8 exception does not apply |
| smoke45:853 | contract |  | the decision not to use 44px in a month cell is undocumented |
| smoke45:862 | legacy-selector | `todo-tick` `rem-check` | the completion checkboxes are back under the 24px floor |
| smoke45:864 | legacy-selector | `rem-check` `sm` | the sub-task check is under 24px |
| smoke45:865 | legacy-selector | `cal-phone-date` | the phone day header is under the 24px floor |
| smoke45:867 | contract |  |  |
| smoke45:871 | legacy-selector | `rem-check` |  |
| smoke45:878 | legacy-selector | `chk` `ts-chk` | the progress checks lost their chip-sized hit area |
| smoke46:98 | legacy-selector | `fx-setup` | compact .fx-setup still has an automatic min-content track |
| smoke46:100 | legacy-selector | `fx-link-row` | the phone links did not become a single shrinkable column |
| smoke46:102 | legacy-selector | `fx-modes` | the phone mode cards still compete side by side |
| smoke46:107 | legacy-selector | `fx-link-row` `cal-field` `status-sel` | linked Focus selects can still establish an off-screen width |
| smoke46:109 | legacy-selector | `fx-obj-field` | the objective keeps its desktop cap |
| smoke46:110 | legacy-selector | `fx-start` | Start is not the clear phone CTA |
| smoke46:111 | legacy-selector | `fx-minimised` `fx-dock` | the populated minimised dock still competes in one shrinking row |
| smoke46:113 | legacy-selector | `fx-dock-ctl` `mini-btn` | the minimised phone controls cannot retain coarse-pointer targets |
| smoke46:115 | legacy-selector | `fx-minimised` | page content does not clear the two-row minimised dock |
| smoke46:137 | legacy-selector | `mobile-shell-ready` `rail-item` | the three low-frequency destinations are not presentation-only hidden at the phone tier |
| smoke46:139 | legacy-selector | `mobile-shell-ready` |  |
| smoke46:140 | legacy-selector | `mobile-shell-ready` `mobile-search-trigger` |  |
| smoke46:141 | legacy-selector | `mobile-shell-ready` `mobile-more` | a failed mobile-shell load can hide canonical search/nav without mounting replacements |
| smoke46:174 | legacy-selector | `subnav-item` `subnav-scroller` `subnav-sep` | the compact strip can still wrap |
| smoke46:180 | legacy-selector | `sec-head` `sec-title` | a long spine title can still orphan its count/arrow onto another flex line |
| smoke46:189 | legacy-selector | `rail-foot` | the phone rail-foot must not be position:fixed any more |
| smoke46:276 | legacy-selector | `n-code` |  |
| smoke46:277 | legacy-selector | `n-code` | long Ref-page code still establishes a hidden desktop-width inline box on phones |
| smoke46:284 | contract |  | #app lost its vh/dvh fallback pair |
| smoke46:285 | contract |  | #main does not reserve the bar and home indicator |
| smoke46:287 | legacy-selector | `tree-closed` | the retired Spec-spine clearance still double-pads phone pages |
| smoke46:289 | legacy-selector | `toast` | toasts can still render behind the fixed phone bar |
| smoke46:294 | legacy-selector | `rail-item` `mobile-more` `lbl` |  |
| smoke46:320 | legacy-selector | `mobile-shell-ready` `rem-grid` `rem-side` `med-layout` | compact side rails hide without a successfully mounted disclosure module |
| smoke47:146 | contract |  |  |
| smoke47:149 | legacy-selector | `fx-deal-list` | Focus reward prose is still forced into mono |
| smoke47:154 | contract |  | shadow ink is not derived from --bg0 |
| smoke47:155 | contract |  | --shadow- |
| smoke47:157 | legacy-selector | `asst-drawer` | the raised Assistant drawer keeps a literal shadow |
| smoke47:164 | legacy-selector | `cardstats-stat-strip` | Card Stats is not intrinsically responsive |
| smoke47:169 | contract |  |  |
| smoke47:177 | contract |  |  |
| smoke49:435 | contract |  |  |
| smoke50:269 | legacy-selector | `study-nav` | the study nav is sticky again |
| smoke52:270 | legacy-selector | `med-score-corner` | the corner score is not top-left |
| smoke52:271 | legacy-selector | `med-quickrow` | the hover row can still wrap (and clip the +1) |
