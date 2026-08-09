# KurenaiOS — Full UI/UX & Product-Quality Audit
**Category 7 · audit and remediation plan**
Audited 7–8 August 2026 · build at `codex/assistant-phase-2-live-character` (123c1d3)

Method: full repository read; live use of the app signed into the owner's real
account (1,880 media entries, 1,652 sessions, Level 53, 253 progress records);
a second seeded instance driven over CDP for the responsive/theme matrix.
161 screenshots at four viewports × two themes are in [`audit-evidence/`](audit-evidence/),
with machine-measured layout findings in
[`audit-evidence/_probe-findings.json`](audit-evidence/_probe-findings.json).

---

## 1. Executive Summary

### Overall quality

KurenaiOS is a **remarkably ambitious, genuinely distinctive application with a
real design identity** — and it is currently **held back far more by a handful of
systemic defects than by any shortage of craft**. The visual language (parchment
or lacquer grounds, Fraunces display serif, kanji section marks, restrained
accent hues, watercolour washes) is coherent, unusual, and worth preserving. The
token architecture in `css/main.css` is better documented than most commercial
design systems.

The problem is that this quality is **unevenly distributed**. Roughly a third of
the app (Focus Timer running state, the media editor, the focus completion
review, the calendar event modal, Governor's Seat, Assistant chat) is at or near
production quality. Another third (Home, Review, Collection Overview, the vault
views, Gold Shop) is competent but over-carded, over-duplicated and full of
zero-value tiles. The final third (subject desk, ref page chrome, Mangaka,
mobile everything) is either structurally wrong or has never been designed for
the viewport it has to survive.

Above all: **the app currently has a P0 that makes it hostile to use on more than
one device**, and **an accessibility floor that fails WCAG AA on the default
theme every new user sees**. Neither is a polish item. Both should be fixed
before any redesign work begins.

### Strongest areas

| Area | Why |
|---|---|
| **Focus Timer running state** | The best screen in the app. One dominant clock, calm field, honest microcopy. |
| **Focus completion review modal** | Facts strip, real award, reflection, note filing, "Already recorded — this only adds to it". Exemplary. |
| **Calendar event modal** | Correct progressive disclosure, real validation with `role="alert"`, Delete separated from Save. |
| **Media record editor** | Sectioned form with left-column explanations; destructive action correctly isolated. |
| **Governor's Seat** | Confident hero, honest HP microcopy, coherent instrument strip. |
| **Assistant page (desktop)** | Modern, well-composed; markdown/table rendering is excellent. |
| **Microcopy throughout** | Consistently literate and honest ("Ending now forfeits the award", "Purchases are paused, not lost"). A real asset. |

### Weakest areas

| Area | Why |
|---|---|
| **Cloud sync ↔ navigation** | Background pulls hijack the current page and clobber local UI state. P0. |
| **The ref page chrome stack** | ~330 px of controls before the first word of revision content. |
| **The subject desk** | Renders the same section list twice, side by side. |
| **Mobile, nearly everywhere** | Content is *clipped*, not reflowed. Home overflows by 208 px, Focus by 280 px. |
| **Mangaka** | 142,062 px tall, 12,833 DOM nodes, 1,107 `<img>` in one view. |
| **Default-theme contrast** | `--muted` is 3.1:1. Used at 9–13 px across the whole app. |
| **Modal accessibility** | No `role="dialog"`, no focus trap, no scroll lock, Enter confirms deletes. |
| **Dark mode** | Only available by spending 140 gold. No `prefers-color-scheme` support at all. |

### Major recurring design problems

1. **Duplicated information within one viewport.** The ref page shows mastery
   twice and the four material counts twice. The subject desk shows the section
   list twice. Collection Overview shows the four module totals three times.
   Reminders and Governor each carry two navigations for the same destinations.
2. **Chrome before content.** Every page opens with kicker + title + subtitle +
   tabs + filters + action chips before anything the user came for.
3. **Zero-value tiles.** Review shows six stat cards reading `0`. Gold Shop
   shows "0 affordable now" beside "everything owned". Collection shows
   "0 playing now".
4. **Empty states occupy card-sized boxes** rather than collapsing.
5. **Charts without axes**, several with one data point, several near-identical.
6. **Three different tab idioms** (`subnav-item`, `study-tab`, the Books
   `Digital / Physical Vault` cards) doing the same job.

### Major recurring UX problems

1. Background sync steals navigation and orphans open modals.
2. Navigation dirties the cloud document, so the sync chip never rests.
3. No URL routing — browser Back exits the app; nothing is linkable.
4. No keyboard shortcuts in the flashcard/quiz engines.
5. No global search over the 1,880-item collection (spec points only).
6. Calendar opens on a stale, previously-viewed week.
7. Provider tokens don't sync, so profile pages dead-end on a new device with no
   explanation.

### Major bug classes

Navigation hijack (sync) · scroll-position jumps on render · lazy-loader stalls ·
un-virtualised list rendering · state-vs-DOM desync · cosmetics not re-applied
after a cloud pull · mobile overflow clipping.

### Is the design system coherent?

**The tokens are; the usage is not.** `:root` defines a well-considered set
(`--bg0/--bg1/--panel`, `--text/--text2/--muted`, three accents, 4 px spacing
scale, radius/control/type ramps) and documents a four-tier breakpoint plan.
But the stylesheet then uses **21 distinct breakpoints**, and **23 of the 24
themes set `--text2` identical to `--text`**, collapsing the three-level type
hierarchy to two everywhere except the default. The system is sound; it needs
enforcement, not replacement.

### Polish vs redesign

Across the 35 screens and sub-surfaces in the redesign matrix:
**3 FULL OVERHAUL · 10 PARTIAL REDESIGN · 16 POLISH · 6 KEEP.**
Weighted by usage, roughly **35 % needs structural work and 65 % needs polish**.
No screen needs its visual language replaced — the identity is the app's best asset.

---

## 2. Severity Scale

| Level | Meaning |
|---|---|
| **P0 — Critical** | Breaks core workflows, data safety, or makes an important area unusable. |
| **P1 — High** | Major UX/layout/product problem; fix soon. |
| **P2 — Medium** | Noticeable friction, inconsistency, or visual weakness. |
| **P3 — Low** | Polish and detail. |

**Redesign classification** — `KEEP` (sound as-is) · `POLISH` (spacing, type,
tokens; no structural change) · `PARTIAL REDESIGN` (re-lay-out part of the page,
keep the rest) · `FULL OVERHAUL` (rethink information architecture and layout).

---

## 3. Global / Cross-App Findings

### 3.1 Navigation & routing

**G-01 · P0 · Background cloud sync hijacks navigation and clobbers UI state.**
`cloudsync.applyRemoteState()` replaces `KOS.store.state` wholesale — including
`state.ui` — and then calls `rerenderCurrent()`
([cloudsync.js:402](js/core/cloudsync.js:402)), which calls `KOS.show(ui.view)`.
Because `ui.view`, `ui.subject`, `ui.openSections`, `ui.railOpen`, `ui.calFocus`,
`media.*.layout/sort/tab` all live in the synced document, **whatever page
another signed-in device is on is forced onto this one.**

Observed three times in ~20 minutes of ordinary use:
`review → ref`, `assistant → governor`, and — worst — while the **anime record
editor was open**, the page behind it navigated to a Computer Science spec page,
leaving the modal floating over an unrelated view. `KOS.show` runs
`main.innerHTML = ""`, so any in-progress inline editing is destroyed.

A guard instrumented at runtime proved the two halves are independent: with
`KOS.show` blocked, `state.ui.view` was **still** overwritten to `governor`
while the DOM showed the Assistant — a persistent state-vs-DOM desync that sends
the next reload to the wrong page.

*Fix:* split per-device UI preferences out of the synced document (keep them in
a local-only `kos.ui` key), and make `rerenderCurrent()` refresh the **current**
view in place rather than routing to the remote document's view.

**G-02 · P1 · Every navigation dirties the cloud state document.**
`KOS.show` ends with `KOS.store.save()`, writing `ui.view`; cloudsync's
dirtiness test is `hashStr(JSON.stringify(KOS.store.state))`
([cloudsync.js:436](js/core/cloudsync.js:436)). Measured: `Synced` →
`Changes pending` on the very next page view, then a full push. Consequences:
the sync chip never rests and therefore carries no information; every page view
uploads the entire state document (1,652 sessions, 253 empty progress records);
and under whole-document LWW, *looking* at a page on one device can overwrite
real edits on another. Same fix as G-01.

**G-03 · P1 · No URL routing.** `KOS.show` maintains a private
`navHist`/`navFwd` array ([ui.js:99–123](js/core/ui.js:99)) and never touches
`history.pushState`. The browser/OS Back button therefore **exits the app**
instead of navigating it — severe in an installed PWA — and nothing is
bookmarkable, linkable or shareable. The in-app `‹ ›` buttons are the only way
back, and `rerenderCurrent()` pushes entries onto that stack too, so even they
lie after a sync.

**G-04 · P2 · The app scrolls an inner container, not the document.**
`#main` is `overflow-y: auto` inside `#app { height: 100vh }`. Mobile browsers
never collapse their URL bar, native scroll restoration doesn't apply, and
`position: sticky` only works relative to `#main`.

**G-05 · P2 · Views are torn down with no teardown hook.** `main.innerHTML = ""`
is the only cleanup. Any interval, `IntersectionObserver` or listener a view
registered keeps running after navigation.

### 3.2 Themes

**G-06 · P1 · Dark mode is paywalled and OS preference is ignored.** All 23
themes are shop items at 140 gold ([governor.js:228–250](js/core/governor.js:228)).
`:root` is the light Atelier Dawn. There is **no `prefers-color-scheme` rule
anywhere** in the CSS or JS. A user whose device is in dark mode gets a bright
parchment app and must grind currency to escape it.

**G-07 · P1 · Cosmetics are not re-applied after a cloud pull.**
`applyCosmetics()` is called exactly once, at boot ([main.js:55](js/main.js:55)).
Signing in on a new device pulls `governor.theme = "celestial-duality"` and 27
owned themes, but `data-theme` stayed empty and the app rendered in the default
light theme until a manual reload. Theme, seal, avatar frame, shelf skin and
shrine style are all affected. *Fix:* call `applyCosmetics()` from
`rerenderCurrent()`.

**G-08 · P2 · The three-level type hierarchy exists only in the default theme.**
Measured across all theme blocks: **every one of the 23 dark themes sets
`--text2` to the same value as `--text`**, and all 23 share one `--muted`
(`#7E899A`, a blue-grey) regardless of the theme's hue — so a warm theme like
*Solar Manuscript* or *Crimson Moth* renders its secondary text cold blue.

### 3.3 Accessibility

**G-09 · P1 · Default-theme secondary text fails WCAG AA.** Measured
contrast ratios:

| Token | Theme | On `--bg1` | On `--panel` | Verdict |
|---|---|---|---|---|
| `--muted` `#97896D` | **light default** | **3.10** | **3.29** | ✗ fails AA (4.5) |
| `--text2` `#5E5442` | light default | 6.71 | — | ✓ |
| `--muted` `#7E899A` | celestial-duality | 5.58 | 5.06 | ✓ |
| `--muted` `#7E899A` | rain-cafe | 4.48 | **3.41** | ✗ on panels |
| `--accent` `#5D6BA8` | **celestial-duality** | **2.74** | — | ✗ accent text/links |

`--muted` is the app's workhorse: every ALL-CAPS field label, every empty-state
sentence, every sub-line — at **9, 10, 11, 12, 12.5 and 13 px**, far below the
large-text exemption. On Home alone, 26 distinct failing text styles were found.

**G-10 · P1 · Modals are not dialogs.** `KOS.ui.confirm`
([ui.js:66–92](js/core/ui.js:66)) creates a plain `div` with **no
`role="dialog"`, no `aria-modal`, no `aria-labelledby`**, **no focus trap**
(Tab from the last button escapes into the page behind), **no body scroll lock**
(`overflow: visible` while open), and **no focus restoration** on close.

**G-11 · P1 · Enter confirms destructive modals.** `onKey` binds
`Enter → close(true)` ([ui.js:76](js/core/ui.js:76)) for *all* modals including
`danger: true`, and initial focus is placed on the `.danger` button
([ui.js:90](js/core/ui.js:90)). Two Enters deletes.

**G-12 · P1 · No skip link.** Reaching page content requires tabbing past 13
chrome controls (brand, back, search, assistant, sync, forward, 7 rail items,
HUD). `#main` already carries `tabindex="-1"` — only the link is missing.

**G-13 · P1 · Touch targets far below minimum.** Measured per view:
the ref page has **11 controls at 16×16 px** (the four progress-check
checkboxes among them); the calendar has **61 sub-24 px targets at every
viewport including 1920**; Home has 4; the Assistant mascot hit-zones are
14×10, 24×17 and 32×22 px. WCAG 2.5.5 asks for 44×44.

**G-14 · P2 · Unlabelled and non-semantic controls.** `.todo-in`,
`.res-refin` and `.rem-quick-in` inputs have no accessible name; a `div`
(the subject card) sits in the tab order; the decorative quote pill on Home is
a focusable `button`.

**G-15 · P3 · Reduced motion is honoured bluntly but honestly.**
`@media (prefers-reduced-motion: reduce)` kills petals and sets
`* { animation-duration: .001s !important; transition-duration: .001s !important }`
([main.css:250](css/main.css:250)). Effective; worth narrowing to avoid
disabling functional transitions.

### 3.4 Responsive behaviour

**G-16 · P0 · The phone tier clips instead of reflowing.** Machine-measured at
390 px (`_probe-findings.json`):

| View | Overflowing elements | Worst offender |
|---|---|---|
| `subject` | **155** | `.unit-stat` +36 px; section rows and paper card cut off |
| `home` | **54** | `.todo-panel` / `.path-card` **+208 px** |
| `focus` | **40** | `.fx-setup-main` **+280 px**, `.fx-modes` +255 px |
| `governor` | 8 | `.gov-seat-hero` content 492 px inside a 341 px box |
| `assistant` | 21 | `.asst-presence` clipped 132 px — "Voice on"/"Ready when…" cut |

Crucially `document.scrollWidth` never exceeds the viewport on any view — the
app has **no horizontal page scrollbar because everything is `overflow: hidden`**.
Content isn't reachable; it's amputated.

**G-17 · P1 · 21 breakpoints against a documented 4.** The token comment at
[main.css:84](css/main.css:84) declares "1240 workspace · 1080 compact rail ·
860 compact · 560 small". The file actually uses 1240, 1180, 1120, 1100, 1080,
1050, 1040, 1000, 900, 860, 850, 840, 820, 760, 700, 680, 620, 560, 520, 480,
460. The "phone tier" CLAUDE.md describes as one block at the end of the file is
**seven scattered `max-width: 700px` blocks**.

**G-18 · P1 · `height: 100vh` with no `dvh` fallback.**
[main.css:258](css/main.css:258) on `#app`, the outermost frame. Only three
`100vh` uses exist in the whole file and none has a dynamic-viewport fallback.

**G-19 · P1 · The bottom tab bar overlaps content.** At 390 px the primary CTA
on Focus, section 4.5 on the subject desk and the last conversation turn on the
Assistant all sit behind the tab bar — `#main` has no bottom padding for it.

**G-20 · P2 · Seven-item bottom tab bar at 390 px.** "Productivity" truncates to
"Productivi…"; labels render at ~9 px.

**G-21 · P2 · Global search disappears on mobile.** `#searchbox` is hidden in
the phone tier with no replacement entry point.

**G-22 · P2 · The subnav wraps to three rows on phones.** On the subject desk
that is ~230 px — a quarter of the screen — before the page title.

### 3.5 Components

**G-23 · P1 · Three tab idioms.** `.subnav-item` (section nav), `.study-tab`
(`KOS.workspaceTabs`, used for Review/Planner/Sync/Governor/ref tabs), and the
bespoke Books `Digital / Physical Vault` cards. On Reminders the workspace tabs
sit **60 px below the subnav offering the same three destinations**. On Gold
Shop a category card row sits beside a category list of the same taxonomy.

**G-24 · P2 · Loading state for covers is a void.** `medview.cover()`
([medview.js:39](js/modules/medview.js:39)) shows the module kanji on `error`
and when `coverUrl` is empty, but **not while loading**. With `loading="lazy"`,
a 1,100-item grid is a field of empty boxes that reads as broken.

**G-25 · P2 · The sync chip has three states and no rest state.** Because of
G-02 it cycles `Synced → Changes pending → Syncing…` on navigation alone.

**G-26 · P2 · Toasts render behind the modal scrim.** After ending a focus
session, "Focus session logged — award forfeited" appeared dimmed underneath the
review modal.

**G-27 · P3 · Numbers are unformatted.** `12344 gold` everywhere; no thousands
separator, in the HUD, the hero, and the Gold Shop.

**G-28 · P3 · Gold shows a progress bar.** In Governor's Seat, gold has a filled
bar labelled "Catalogue complete" — a progress bar for a currency balance.

### 3.6 Data & empty states

**G-29 · P1 · The headline dashboard reads all-zero for an active user.** The
real account — Level 53, 71,802 XP, 1,652 sessions, 1,880 collection entries —
sees `0% covered · 0/355 spec points · 0 mastered · 0 cards due` on Home and
`0%` on all three subject cards. The numbers are *truthful* (all 253 progress
records are `status:"none"` with no checks), but the app's front page tells its
most active user they have done nothing. The metrics chosen for the hero don't
describe what this user actually does.

**G-30 · P2 · 253 empty progress records are persisted and synced.** Merely
opening a topic writes `{status:"none", check:[false×4], note:""}`, which then
rides every cloud push and every backup.

**G-31 · P2 · The genre facet mixes two vocabularies.** The "All genres"
dropdown carries **64 options**, alphabetically interleaving real genres with
one-off VNDB content tags — "Albino Heroine", "Battle of Wits", "Breaking the
Fourth Wall", "Chuunibyou Protagonist" sitting between *Adventure* and *Comedy*.
`stats().genres` shows ~40 tags with a count of 1 or 2.

**G-32 · P2 · Charts render with one data point.** `scores` across all 1,880
entries is `[0,0,0,0,0,0,0,0,0,0,1]` — a single rated title — yet "Score
distribution" gets a full-size card.

**G-33 · P2 · Seeded sample data persists on a mature account.** Four
`SAMPLE — … (edit me)` calendar events from `KOS.calendar.seedSamples()` are
still present on a Level 53 account and render on every month and week grid.

---

## 4. Section-by-Section Audit

### 4.1 Home (`home`)

**Current UX.** Date kicker + greeting + "Begin a focus session"; an HP-state
banner; a hero band (avatar, level, quote, XP bar, streak chips, four KPIs over
banner artwork); a two-column row of "Today's Directives / Reminders" and
"Countdowns"; then four cards — three subjects plus Collection.

**What works well.** The greeting is warm and time-aware ("Good evening.",
"Working late."). The HP banner is a genuinely good actionable alert. The hero
reads beautifully *when the numbers are non-zero* (see
`audit-evidence/phone-390-dark-home.jpg`).

**Problems found**

| ID | Sev | Category | Detail |
|---|---|---|---|
| HOME-1 | P1 | Data/design | Four KPIs read `0` for the real account (G-29). Hero communicates nothing. |
| HOME-2 | P1 | Contrast | KPI values and labels sit directly on banner artwork with **no scrim**; "COVERED" is overlapped by the progress ring and partly illegible. Fragile by luck of the image. |
| HOME-3 | P1 | Responsive | At 390 px `.todo-panel` overflows **+208 px**; directive text is cut mid-sentence and unreachable. |
| HOME-4 | P2 | Layout | Two large empty-state boxes side by side (Directives, Countdowns) consume ~280 px saying nothing. |
| HOME-5 | P2 | Layout | The Collection card is a different shape from the three subject cards beside it — no % badge, no Continue action. |
| HOME-6 | P2 | Clarity | Seven unlabelled pips beside the streak chips have no explanation. |
| HOME-7 | P2 | A11y | The decorative quote is a focusable `<button>` in the tab order. |
| HOME-8 | P3 | Responsive | At 390 px greeting and CTA compete on one row; hero is ~890 px tall on an 844 px screen. |

**Visual assessment: PARTIAL REDESIGN.** The composition is good; the *content
selection* is wrong and the hero has no scrim discipline.

**Proposed direction.** Keep the band, change what it measures. Lead with a
single **"what should I do next"** statement, then three honest figures chosen
from what the user actually generates — study streak, cards due, hours logged
this week — with coverage demoted to the subject cards where it belongs. Put a
mandatory gradient scrim behind all hero text (`linear-gradient` from
`--bg1` at the text side). Collapse empty Directives/Countdowns to a single
one-line row with an inline "Add" affordance rather than two boxes. Give the
Collection card the same shape as the subject cards. On phones, stack the hero
into: identity row → one KPI row that scrolls horizontally → streaks; and let
the directive list wrap.

---

### 4.2 Study — subject desk (`subject`)

**Current UX.** Left spec tree; page header; a board card (AQA 7517 + three
paper cards); a "Sections" ledger; a right "Subject analytics" 2×4 tile grid;
a full-width action card.

**What works well.** The board/paper card is a strong component. The analytics
tiles have one consistent shape and a shared low/mid/high ramp.

**Problems found**

| ID | Sev | Category | Detail |
|---|---|---|---|
| SUBJ-1 | **P1** | Information architecture | **The left tree and the "Sections" ledger render the same list simultaneously** — same 14 sections, same counts, ~400 px apart. |
| SUBJ-2 | P1 | Duplication | Spec-point totals appear four times with four labels: "156 spec points", "0/156 secure" (tree), "TOPICS SECURE 0/156", "TOPICS STARTED 0/156". |
| SUBJ-3 | **P1** | Responsive | 155 overflowing elements at 390 px; the paper card scrolls horizontally inside itself (Papers 2–3 unreachable); section rows are cut at the right edge. See `audit-evidence/phone-390-dark-subject.jpg`. |
| SUBJ-4 | P1 | Responsive | The "SPEC SPINE" drawer handle floats over the section list mid-content on phones, obscuring a row. |
| SUBJ-5 | P2 | Layout | Long deadline titles clip by **286 px** in `.dl-title` at 1440. |
| SUBJ-6 | P2 | Copy | A dense explanatory paragraph ("Mastery averages the four progress checks…") sits under the grid as body text. |

**Visual assessment: FULL OVERHAUL.** A page cannot ship showing its primary
navigation twice.

**Proposed direction.** Decide what the tree is *for*. Recommended: **the tree
becomes the only section list**, and the main column becomes a genuine subject
*desk* — a single "continue where you left off" card, the paper/board summary,
the analytics grid, and the action card. The section ledger disappears from the
main column entirely; drilling into a section happens in the tree, which gains
the ledger's progress bars. This alone reclaims ~600 px and removes SUBJ-1 and
SUBJ-2. On phones, the tree is already a drawer — move the paper card into a
horizontally-scrolling snap carousel with visible affordance, wrap the unit
stats, and dock the spine handle to the bottom-left above the tab bar.

---

### 4.3 Study — topic / ref page (`ref`)

**Current UX.** Crumbs → seal + title + exam board line → "TOPIC STATUS" band
(status select, four progress checkboxes, three confidence dots) → an action
row (Ask Kurenai / Make flashcards / Make a quiz) → six study tabs → up to seven
note-page pills → content. A right "INSPECTOR" column carries mastery,
materials, recall record and next review.

**What works well.** The content typography is excellent — measure, callouts,
worked examples, code slabs. The inspector's *idea* is right.

**Problems found**

| ID | Sev | Category | Detail |
|---|---|---|---|
| REF-1 | **P1** | Layout | **~330 px of chrome before the first word of content.** At 1440×900 only ~220 px of viewport shows revision material. See `audit-evidence/laptop-1440-light-ref.jpg`. |
| REF-2 | **P1** | Bug | Opening a topic **scrolls the page 579 px down**, past the title, status band and tabs. Root cause: `showPage()` calls `article.scrollIntoView()` on **first mount**, not just on user page changes — [hub.js:1362](js/modules/hub.js:1362). |
| REF-3 | P1 | Duplication | Mastery `0% · 0/4 checks` appears in the status band **and** in the inspector, ~280 px apart. |
| REF-4 | P1 | Duplication | The four material counts appear as tab badges **and** as inspector "MATERIALS". Same four numbers twice. |
| REF-5 | P1 | A11y | 11 controls at 16×16 px, including the four progress checkboxes. |
| REF-6 | P2 | Layout | Six study tabs wrap, orphaning "Files" on its own row; seven note pills wrap to two rows. Three levels of tab on one page. |
| REF-7 | P2 | Clarity | "CONFIDENCE" is three unlabelled pale circles; in the light theme they are near-invisible against cream. |
| REF-8 | P1 | UX | **No keyboard support in the flashcard/quiz engines** — no space-to-flip, no 1–4 grading. Verified: zero `keydown` handlers in `js/engines/`. |
| REF-9 | P2 | Layout | On the Flashcards tab the card and its grading buttons are below the fold at 900 px. |
| REF-10 | P3 | Design | Rating pills carry 8 px sub-labels ("blanked — retest now") that are illegible. |

**Visual assessment: FULL OVERHAUL** (of the page shell; **KEEP** the content
renderer).

**Proposed direction.** Invert the page: **content first, chrome on demand.**
Header collapses to one row — seal, title, board line, and a compact
`● Started ▾` status control. The progress checks, confidence and materials
counts move into the inspector, which becomes the page's single "state" surface
(and gains a proper collapse). The six study tabs become a single sticky bar
directly above content. Note pages become a `‹ 3 / 7 ›` stepper in that bar, not
a second pill row. Fix REF-2 by passing a flag so only user-initiated page
changes scroll. Add flashcard keybindings (`Space` flip, `1–4` grade, `→` next)
and surface them in the card footer. Target: **content begins within 140 px**.

---

### 4.4 Study — Review (`review` / `due` / `cardstats`)

**Current UX.** Header with a two-tab switcher; a six-card stat strip; then the
due queue or the card-stats charts.

**Problems found**

| ID | Sev | Category | Detail |
|---|---|---|---|
| REV-1 | P2 | Design | Six stat cards, **all reading `0`** on a real account. Five of six carry no information. |
| REV-2 | P2 | Layout | The page ends at ~60 % of viewport height; the rest is empty. |
| REV-3 | P3 | Design | The 澄 "Queue clear" empty state is handsome but occupies 190 px for one sentence. |

**Visual assessment: POLISH.** Structure is right.

**Proposed direction.** Collapse the stat strip to one line (`0 due · 0 overdue`)
and only expand per-subject figures when non-zero. Bring the "Queue clear" state
up to fill the reclaimed space and give it a real next action ("Rate cards on a
topic →" as a button, not prose).

---

### 4.5 Study — Assignments, Exams & Papers, Personal Deck

Clean at every desktop viewport; no overflow. Both are competent list-plus-stats
pages with correct empty states. `tracker` has one 13×13 px checkbox.

**Visual assessment: POLISH** (both). Raise checkbox hit areas; align their stat
strips with whatever Review adopts.

---

### 4.6 Productivity — Focus Timer (`focus`)

**Current UX.** Setup (mode cards, subject/topic/assignment/objective, "The
deal" panel, "Your record") → running state (dominant clock, context chips,
buttons, quick note) → completion review modal.

**What works well.** The **running state is the best screen in the app**. The
**completion review modal is exemplary**: facts strip, the real award,
reflection, note filing, and "Already recorded — this only adds to it".

**Problems found**

| ID | Sev | Category | Detail |
|---|---|---|---|
| FOC-1 | **P1** | Responsive | At 390 px `.fx-setup-main` overflows **+280 px** and `.fx-modes` +255 px. Mode cards, topic select and objective input are all cut; the primary CTA sits behind the tab bar. |
| FOC-2 | P2 | Design | "The deal" is a right-aligned monospace ledger (`-15% (36 XP at two)`, `-2 HP, charged as it happens`) — reads as a spec sheet, exposing the economy's implementation. |
| FOC-3 | P2 | Design | The running state stacks ten rows of 9–11 px low-contrast micro-text under the clock, undoing the calm of the top half. |
| FOC-4 | P2 | Hierarchy | Three buttons in three colours (purple Pause, blue "Study while focused", red "End early") with no clear primary. |
| FOC-5 | P3 | Layering | The completion toast renders behind the review modal's scrim. |

**Visual assessment:** setup **PARTIAL REDESIGN** · running state **POLISH** ·
review modal **KEEP**.

**Proposed direction.** Setup: a single column at ≤820 px with full-width mode
cards; rewrite "The deal" as three plain sentences ("A finished 25-minute cycle
pays 35 XP, 5 gold and 6 HP. Your first pause is free; each one after costs 15 %.
Ending early logs the session but forfeits the award."). Running: keep the clock
and the objective; move pauses/tab-switches/eligibility into one single-line
status strip and put quick notes behind a "Jot" toggle. Make Pause the only
filled button.

---

### 4.7 Productivity — Reminders (`reminders`)

**Current UX.** Three columns: smart sections + lists + tags · list with search,
priority and sort · detail inspector.

**What works well.** Long titles wrap correctly in the list and truncate in the
inspector. The inspector opens automatically on add. Lists-vs-tags is well
explained inline.

**Problems found**

| ID | Sev | Category | Detail |
|---|---|---|---|
| REM-1 | P2 | Navigation | The workspace tabs (Reminders / Habits / Calendar) sit **60 px below the subnav offering the same destinations** (G-23). |
| REM-2 | P2 | Layout | The inspector reserves a full column for a placeholder glyph when nothing is selected. |
| REM-3 | P2 | A11y | The quick-add input has no accessible name; alert chips are ~9 px. |
| REM-4 | P3 | Semantics | "All 0" while "Completed 1" — the counts don't explain their own scope. |

**Visual assessment: POLISH.** One of the better-structured pages.

---

### 4.8 Productivity — Calendar (`calendar`)

**Current UX.** Month/Week toggle, prev/next/Today, "New event"; a grid; a
progressive-disclosure event modal.

**What works well.** **The event modal is a model of the pattern** — core fields
visible, Details and Repeat & alerts collapsed, colour swatches, real validation
with `role="alert"`, date correctly defaulted to today.

**Problems found**

| ID | Sev | Category | Detail |
|---|---|---|---|
| CAL-1 | P2 | State | The grid opens on a **stale persisted week**: `ui.calFocus = "2026-08-01"` while today was 7 August, so the calendar opened on the previous week with only a quiet "Today" chip to signal it. Adding an event to the wrong week is one click away. |
| CAL-2 | P1 | A11y | **61 sub-24 px targets at every viewport, including 1920** — the day cells' event chips. |
| CAL-3 | P2 | Layout | Event titles clip: `.cal-ev-t` at 33 px content in a 15 px box on desktop; 19 clipped titles at 820 px; 103 px content in a 30 px box at 390 px. |
| CAL-4 | P2 | Data | Four `SAMPLE — … (edit me)` seed events still render on a mature account (G-33). |
| CAL-5 | P3 | Design | The colour swatch row has no labels; the white swatch is invisible on light themes. |

**Visual assessment: POLISH.** Reset `calFocus` to today on view entry unless
navigated within the session; raise chip heights; give chips a title tooltip and
a two-line clamp.

---

### 4.9 Collection — Overview (`matrix`)

**Current UX.** Header, streak chips, a "Currently consuming" cover strip, a
seven-tile KPI row, then eleven chart cards, then four module cards.

**What works well.** The most *alive* page in the app — real cover art, real
numbers. The four module cards with kanji watermarks are a strong signature.

**Problems found**

| ID | Sev | Category | Detail |
|---|---|---|---|
| MTX-1 | P2 | Affordance | The cover strip is a real `overflow-x: auto` scroller but has **no arrows and no edge fade**; the last card is sliced by the container edge and reads as a rendering bug. |
| MTX-2 | P1 | Design | **Four near-identical "X by status" bar charts** with the same five categories; the VN and Games versions have one bar each. |
| MTX-3 | P2 | Duplication | The four module totals (692/1107/11/70) appear in the KPI row, the "whole vault" donut, the "vault by medium" donut **and** the four module cards — four times on one page. |
| MTX-4 | P2 | Design | Charts have **no axes, no gridlines, no tooltips**; category labels render at ~7 px. |
| MTX-5 | P2 | Data | "Score distribution" renders from a single rated title (G-32). "0 playing now" is a zero tile. |
| MTX-6 | P3 | Consistency | Progress formats differ per card: `69 / 76`, `13 ch`, `7/8 vol`, `14 / 26 ch` — spacing around the slash is inconsistent. |

**Visual assessment: PARTIAL REDESIGN.**

**Proposed direction.** Replace the four status charts with **one small-multiples
row** sharing an axis and a legend. Cut the second donut. Keep the KPI row, the
cover strip (with fades and arrows) and the four module cards; move the long tail
(genres, scores, medium, in-progress) behind an "Analytics" tab so the overview
is one screen. Standardise a `progressText()` helper.

---

### 4.10 Collection — Anime · Books · Visual Novels · Games

**Current UX.** Hero spotlight (banner + title + status + `+1 ep` / Open entry /
Spotlight / Banner) → filter rail → toolbar → lazy cover grid.

**What works well.** The Anime hero with a real banner is the app's best
single visual moment. The filter rail is well organised. The lazy grid is fast.

**Problems found**

| ID | Sev | Category | Detail |
|---|---|---|---|
| VLT-1 | **P1** | Bug | **The lazy loader stalls whenever the sentinel stays continuously intersecting.** `renderBatch` appends one batch per intersection *transition* ([medview.js:253](js/modules/medview.js:253)); a flick-scroll to the bottom leaves the sentinel inside the 600 px `rootMargin` and the list stops dead at 300 of 692 entries. Reproduced 10/10 times. *Fix:* loop until the sentinel is no longer intersecting. |
| VLT-2 | P1 | Loading | Covers show **nothing** while loading (G-24) — a grid of empty boxes. |
| VLT-3 | P1 | Control clutter | Books stacks **17 controls in three rows** before content (tab cards, search + 5 selects + layout, then 8 action chips); Anime 11; Games 9. No grouping logic — "Profile" sits beside "+Add"; "Seasonal" beside "List". |
| VLT-4 | P1 | Consistency | Hero treatment differs per vault: Anime gets a full-bleed banner, Books/VN a mostly-empty gradient with a small floated cover, Games a kanji placeholder. Same component, three levels of finish. |
| VLT-5 | P2 | Contrast | Hero text sits on artwork with no scrim — legibility depends on which image happens to be spotlighted. |
| VLT-6 | P2 | Data | Long titles wrap to three lines over the cover art, obscuring half the image. |
| VLT-7 | P2 | Data | Custom lists imported from AniList with decorative Unicode names (`—— ☆ ——`) render as near-invisible thin lines in the filter rail. |
| VLT-8 | P2 | Facet | The genre select carries 64 options mixing genres and VNDB tags (G-31). |
| VLT-9 | P2 | Editor | The record editor exposes the **raw AniList CDN URL** in an editable field for synced entries, and shows an unrated score as `0`. |
| VLT-10 | P2 | Layout | `.med-quickrow` overflows its 128 px card by 8 px on the Seasonal grid (23 instances). |
| VLT-11 | P3 | Design | Games is 70 identical grey 遊 tiles — monotonous, reads as unfinished. |

**Visual assessment: PARTIAL REDESIGN** (all four).

**Proposed direction.** One vault shell, four skins. Fix the hero contract: every
module gets the same component with a mandatory scrim and, absent a banner, a
generated gradient derived from the cover's dominant hue rather than an empty
panel. Collapse the toolbar to **search + sort + layout visible; everything else
behind one "Actions ▾" menu and one "Filters" button** that opens the rail as a
sheet below 900 px. Show the kanji placeholder during load, cross-fading to the
image. Clamp titles to two lines with a tooltip. Split the genre facet into
"Genres" and "Tags", or threshold tags at count ≥ 5.

---

### 4.11 Collection — Mangaka (`mangaka`)

**Problems found**

| ID | Sev | Category | Detail |
|---|---|---|---|
| MNG-1 | **P0** | Performance | Renders **all 882 authors and 1,107 series at once**: `scrollHeight` **142,062 px**, **12,833 DOM nodes**, **1,107 `<img>` elements**, 308 truncated titles. Directly violates the project's own invariant #8 ("Views NEVER render the whole vault at once"). |
| MNG-2 | P1 | Navigation | No search, no A–Z index, no filter — 882 authors reachable only by scrolling 142 k px. |

**Visual assessment: FULL OVERHAUL.**

**Proposed direction.** Adopt `medview`'s lazy area (it already exists — this
view simply doesn't use it). Add an author search, an A–Z jump rail and a
"authors with ≥ N works" filter. Default to the 60 most-read authors.

---

### 4.12 Collection — Shrine · Planner · Goals · Sync · Profiles

Clean at desktop; no overflow. Shrine's rank-one feature is well composed and the
Planner's release desk is a genuinely good idea.

| ID | Sev | Category | Detail |
|---|---|---|---|
| COL-1 | P1 | UX | **AniList and VNDB profile pages dead-end on a new device**: "Connect your AniList first" despite the vault being fully AniList-synced, because tokens are deliberately excluded from sync/backup. The message never says *why* or that the data is already there. |
| COL-2 | P2 | A11y | Sync & Import has 6 unlabelled controls and 3 sub-24 px targets. |
| COL-3 | P2 | Layout | Goals and both profile pages end at ~60 % viewport height. |

**Visual assessment:** Shrine **KEEP** · Planner **POLISH** · Goals **POLISH** ·
Sync **POLISH** · Profiles **PARTIAL REDESIGN** (they need a real signed-out /
token-missing state that explains the situation and offers the reconnect action).

---

### 4.13 Governor (`governor`)

**Current UX.** Four tabs (Status / Gold Shop / Avatar / Session Log). Status:
hero with identity and an access-state panel; a five-tile instrument strip; a
90-day cadence heatmap and a milestone ledger.

**What works well.** The most polished page. HP microcopy is honest and
actionable. The heatmap and ledger are genuinely useful.

**Problems found**

| ID | Sev | Category | Detail |
|---|---|---|---|
| GOV-1 | **P1** | Responsive | At 390 px `.gov-seat-hero` holds 492 px of content in a 341 px box with `overflow: hidden` — "Grandmaster · Behavioural Governor" and "Level 53" are cut off. |
| GOV-2 | P2 | Placement | Settings (Recovery mode, PREFER HP Low/Full/Off, Edit profile, Edit banner) live **inside the decorative hero**. Configuration in a display banner. |
| GOV-3 | P2 | Design | Gold Shop shows a category card row **and** a category list of the same taxonomy (G-23). |
| GOV-4 | P2 | Data | "51 / 51 unlocked · **0 affordable now** · — everything owned" — a zero tile and an em-dash tile side by side. |
| GOV-5 | P3 | Design | Shop items use abstract bar-chart SVGs that don't represent the item. Gold has a progress bar (G-28). |

**Visual assessment: POLISH** (Status) · **POLISH** (Gold Shop).

**Proposed direction.** Move the access-state/settings cluster out of the hero
into its own card directly beneath it. Collapse the shop's dual taxonomy to the
left list only. Swap the KPI trio for `51 / 51 owned` plus a single "Nothing left
to buy" line when complete.

---

### 4.14 Assistant (`assistant`)

**Current UX.** Three columns: conversation/control-room nav · chat · mascot
presence panel.

**What works well.** The most modern page. The empty state ("Begin with the part
that feels tangled.") is excellent. **Markdown rendering is the best in the app** —
proper tables, numbered lists with bold leads, good measure.

**Problems found**

| ID | Sev | Category | Detail |
|---|---|---|---|
| AST-1 | P1 | Layout | `.asst-presence` content is **132–138 px wider than its panel** at 820 px *and* 1440 px, relying on `overflow: hidden`. On mobile "Voice on" and "Ready when you are" are visibly cut off. |
| AST-2 | P1 | Feedback | The "Thinking…" indicator appears **in the far-right mascot panel**, ~500 px from where the user is looking. No in-thread loading state. |
| AST-3 | P2 | Layout | The mascot column consumes ~20 % of the workspace for a static PNG and two words of status; the chat column is squeezed on laptops. |
| AST-4 | P2 | Consistency | User turns get a bubble; assistant turns get bare text with no bubble or surface. Asymmetric. |
| AST-5 | P2 | Affordance | No copy, regenerate or edit actions on messages. |
| AST-6 | P1 | A11y | Mascot hit-zones are 14×10, 24×17 and 32×22 px. |
| AST-7 | P2 | Responsive | On phones the control-room tab strip needs horizontal scrolling with a raw scrollbar visible and the "Control room" group label lost. |

**Visual assessment: POLISH.** This is the closest thing to a quality benchmark;
it needs fixes, not a rethink.

**Proposed direction.** Make the presence panel collapsible and let it collapse
by default below 1240 px, reclaiming the width for the conversation. Move
"Thinking…" into the thread as a streaming placeholder turn. Give assistant turns
a subtle surface and a hover action row (copy / regenerate). Merge the tab strip
into a single scroller with group separators and fade edges.

---

### 4.15 Archive — Backup & Restore (`data`) and Help (`help`)

Both are **clean at every viewport and both themes** — zero overflow, zero
clipping, zero tiny targets. Help's `4,076 px` guide with a nav rail and a
search box is well built.

| ID | Sev | Category | Detail |
|---|---|---|---|
| ARC-1 | P3 | Design | "Reset everything" is a soft pink pill visually similar to the other three export/import buttons; it deserves stronger separation. |
| ARC-2 | P3 | Copy | The account card doesn't mention that AniList/VNDB tokens don't sync — the cause of COL-1. |

**Visual assessment: KEEP** (both). Reference for how the rest of the app should
behave responsively.

---

### 4.16 Global chrome — topbar, rail, search, HUD

| ID | Sev | Category | Detail |
|---|---|---|---|
| CHR-1 | P1 | Search scope | Global search covers **spec points only**. With 1,880 collection entries, 5 events and assignments in the app, there is no cross-app search. Zero-result copy is good ("No spec point matches … across the three subjects."). |
| CHR-2 | P2 | Mobile | Search is removed entirely on phones (G-21); the sync chip clips to "SY…"; the HUD avatar is cut by the viewport's right edge. |
| CHR-3 | P2 | A11y | No skip link (G-12); 13 chrome tab stops before content. |
| CHR-4 | P3 | State | The rail collapse button's `aria-label` and glyph only update via `applyRail()` at boot, so a state change from elsewhere leaves it stale. |

**Visual assessment: POLISH.**

---

## 5. Bug Register

*Functional defects only. Subjective design criticism is in §6.*

| ID | Area | Sev | Bug | Reproduction | Likely cause | Proposed fix |
|---|---|---|---|---|---|---|
| B-01 | Cloud sync / nav | **P0** | A background pull navigates the app away from the current page and orphans open modals | Sign in on two devices; use device A; wait for a sync cycle | `applyRemoteState` replaces all of `state` incl. `state.ui`, then `rerenderCurrent()` calls `KOS.show(ui.view)` — [cloudsync.js:402](js/core/cloudsync.js:402) | Keep `state.ui` and `state.media.*` view prefs in a local-only key; make `rerenderCurrent` re-render the *current* view |
| B-02 | Cloud sync | **P0** | `state.ui.view` is overwritten even when the re-render is suppressed, desyncing state from DOM | Block `KOS.show`, force a pull; DOM shows Assistant, `state.ui.view === "governor"` | Same as B-01 | Same as B-01 |
| B-03 | Cosmetics | P1 | Theme/seal/frame/skins are not applied after a cloud pull; a new device renders in the default light theme despite owning and selecting a dark one | Sign in on a fresh device | `applyCosmetics()` called only at [main.js:55](js/main.js:55) | Call it from `rerenderCurrent()` |
| B-04 | Study / ref | P1 | Opening a topic scrolls 579 px past the page header | `KOS.show('ref', …)` on any topic whose Notes tab is active | `showPage()` calls `article.scrollIntoView()` on first mount — [hub.js:1362](js/modules/hub.js:1362) | Add a `userInitiated` flag; skip the scroll on mount |
| B-05 | Collection vaults | P1 | Lazy list stops loading at 300 of 692 entries | Flick-scroll to the bottom of the Anime grid and hold | One batch per intersection *transition*; sentinel stays inside the 600 px margin — [medview.js:253](js/modules/medview.js:253) | After each batch, re-check `isIntersecting` and loop |
| B-06 | Mangaka | **P0** | 142,062 px page, 12,833 DOM nodes, 1,107 `<img>` rendered at once | Collection → Books → Mangaka with a large library | View builds every author synchronously, bypassing `medview`'s lazy area | Use the shared lazy area; add search + A–Z index |
| B-07 | Cloud sync | P1 | Every page view marks the state dirty and triggers a full push | Navigate anywhere; watch the sync chip | Dirty hash is over the whole state incl. `ui.view` — [cloudsync.js:436](js/core/cloudsync.js:436) | Hash only synced domains |
| B-08 | Calendar | P2 | Opens on a stale week/month from a previous session | Open Calendar after not using it for a week | `ui.calFocus` persisted and synced, never reset | Reset to today on view entry unless navigated in-session |
| B-09 | mediadb | P3 | `KOS.mediadb.count({}, cb)` throws `DataError` | `count({}, cb)` | Signature takes a module string; a truthy object reaches `IDBKeyRange.only` — [mediadb.js:595](js/core/mediadb.js:595) | Guard `typeof module === "string"` |
| B-10 | Focus | P3 | The completion toast renders behind the review modal's scrim | End a focus session early | Toast z-index below `.modal-ov` (120) | Raise the toast above modals or suppress while one is open |
| B-11 | Store | P3 | 253 empty progress records are persisted and pushed to the cloud | Open any topic without marking anything | A progress object is written on read | Write lazily on first real mutation |
| B-12 | Calendar | P3 | `SAMPLE — … (edit me)` seed events persist on mature accounts | Any account seeded before first use | `seedSamples()` has no retirement rule | Retire samples once the user creates a real event |

---

## 6. UI/UX Issue Register

| ID | Area | Sev | Issue | Why it matters | Recommended treatment |
|---|---|---|---|---|---|
| U-01 | Global | P1 | Dark mode costs 140 gold; no `prefers-color-scheme` | Every new user gets a bright app regardless of OS setting | Ship one free dark theme; follow `prefers-color-scheme` when the user hasn't chosen |
| U-02 | Global | P1 | `--muted` is 3.10:1 on the default theme, used at 9–13 px | Systemic AA failure on the theme everyone starts with | Darken to ≥ 4.5:1; raise the label floor to 11 px |
| U-03 | Global | P1 | Modals lack `role="dialog"`, focus trap, scroll lock, focus restore | Screen-reader users can't tell a modal opened; keyboard users fall behind the scrim | Rewrite `KOS.ui.confirm` as a proper dialog primitive; reuse everywhere |
| U-04 | Global | P1 | Enter confirms `danger` modals with focus on Delete | Two keystrokes destroy data | Focus Cancel on danger modals; require explicit activation |
| U-05 | Global | P1 | No skip link; 13 tab stops before content | Keyboard navigation is impractical | Add a visible-on-focus skip link to `#main` |
| U-06 | Global | P1 | Browser Back exits the app | Breaks the single most-used control on mobile | Adopt `history.pushState` in `KOS.show` |
| U-07 | Global | P1 | Phone tier clips rather than reflows on 5 major views | Content is unreachable, not merely ugly | Consolidate to 4 breakpoints; audit every view at 390 px |
| U-08 | Global | P1 | Bottom tab bar overlaps content | Primary CTAs sit behind it | Add `padding-block-end` to `#main` equal to the bar plus safe area |
| U-09 | Study | P1 | Subject desk renders the section list twice | Doubles page length, halves confidence in the IA | Remove the ledger; the tree owns sections |
| U-10 | Study | P1 | ~330 px of chrome before ref content | The core reading surface is a letterbox | Collapse the header; move state into the inspector |
| U-11 | Study | P1 | No flashcard/quiz keyboard shortcuts | The core SRS loop is mouse-bound | `Space` flip, `1–4` grade, `→` next |
| U-12 | Global | P2 | Three tab idioms; two nav bars on Reminders and Gold Shop | Users must learn the same control three ways | One `Tabs` primitive with `primary`/`workspace` variants |
| U-13 | Collection | P1 | 17 controls before content on Books | Nothing has priority, so nothing is discoverable | Search + sort + layout visible; everything else behind Actions ▾ / Filters |
| U-14 | Collection | P1 | Vault heroes have three levels of finish | The app looks half-built where art is missing | One hero component, generated gradient fallback, mandatory scrim |
| U-15 | Collection | P2 | Covers show nothing while loading | A big grid reads as broken | Kanji placeholder during load, cross-fade in |
| U-16 | Home | P1 | Headline KPIs read all-zero for a Level-53 user | The front page misrepresents the user to themselves | Choose metrics from what the user actually generates |
| U-17 | Global | P2 | Zero-value tiles everywhere (Review ×5, Shop ×2, Collection ×1) | Dilutes the real numbers | Suppress or collapse zero tiles |
| U-18 | Collection | P2 | Four near-identical status charts; two donuts of the same data | Chart soup instead of insight | One small-multiples row; move the tail behind an Analytics tab |
| U-19 | Global | P2 | Charts have no axes, no gridlines, ~7 px labels | Unreadable, so decorative | Add axes/gridlines; 11 px label floor; tooltips |
| U-20 | Global | P2 | Empty states occupy full card boxes | Empty screens look larger than full ones | Collapse to a single line with an inline action |
| U-21 | Sync | P2 | The sync chip never rests at "Synced" | A status that always says "pending" says nothing | Fix B-07; then only surface real pending work |
| U-22 | Collection | P1 | Profile pages dead-end on a new device | The user sees "connect first" over data that is already synced | Explain that tokens are device-local and offer reconnect inline |
| U-23 | Focus | P2 | "The deal" reads as a console dump | Exposes the economy's implementation | Rewrite as three plain sentences |
| U-24 | Assistant | P2 | Loading indicator is 500 px from the conversation | Users can't tell the app is working | In-thread streaming placeholder |
| U-25 | Global | P2 | No cross-app search | 1,880 entries are unreachable from the one search box | Extend global search to media, reminders, assignments, events, notes |
| U-26 | Collection | P2 | 64-option genre facet mixing genres and VNDB tags | The filter is unusable | Split facets or threshold tags |
| U-27 | Global | P3 | Unformatted thousands; gold shown as a progress bar | Small credibility costs | `toLocaleString()`; drop the bar |
| U-28 | Governor | P2 | Settings live inside the decorative hero | Configuration hidden in ornament | Move to a card beneath |
| U-29 | Collection | P2 | Cover strip has no scroll affordance | Cut-off card reads as a bug | Edge fades + arrow controls |
| U-30 | Global | P3 | Progress formats differ across cards | Sloppy at close reading | One `progressText()` helper |

---

## 7. Redesign Matrix

| Screen | Current quality | Classification | Priority | Effort | Notes |
|---|---|---|---|---|---|
| Home | Mixed — good frame, wrong content | **PARTIAL REDESIGN** | P1 | M | Re-pick hero metrics; scrim; fix +208 px phone overflow |
| Study — subject desk | Poor — duplicated IA | **FULL OVERHAUL** | P1 | L | Remove the second section list; rebuild the phone tier |
| Study — ref page (shell) | Poor — letterboxed content | **FULL OVERHAUL** | P0/P1 | L | Content-first; fix B-04; keyboard shortcuts |
| Study — ref page (content renderer) | Excellent | **KEEP** | — | — | Best typography in the app |
| Study — Review | Adequate | POLISH | P2 | S | Collapse the zero stat strip |
| Study — Assignments | Good | POLISH | P3 | S | Align stat strip |
| Study — Exams & Papers | Good | POLISH | P3 | S | Checkbox hit area |
| Study — Personal Deck | Adequate | POLISH | P3 | S | Empty state action |
| Productivity — Focus setup | Mixed | PARTIAL REDESIGN | P1 | M | +280 px phone overflow; rewrite "The deal" |
| Productivity — Focus running | Very good | POLISH | P2 | S | Compress the micro-text stack |
| Productivity — Focus review modal | Excellent | **KEEP** | — | — | Use as the modal benchmark |
| Productivity — Reminders | Good | POLISH | P2 | S | Remove duplicate nav; inspector empty state |
| Productivity — Habits | Adequate | POLISH | P3 | S | Thin page |
| Productivity — Calendar grid | Good | POLISH | P2 | M | 61 tiny targets; chip clipping; `calFocus` |
| Productivity — Event modal | Excellent | **KEEP** | — | — | Progressive-disclosure benchmark |
| Collection — Overview | Mixed — chart soup | PARTIAL REDESIGN | P2 | M | Small multiples; drop duplicate donut |
| Collection — Anime | Good | PARTIAL REDESIGN | P1 | M | Toolbar; hero scrim; B-05 |
| Collection — Books | Mixed — worst clutter | PARTIAL REDESIGN | P1 | M | 17 controls; hero |
| Collection — Visual Novels | Adequate | PARTIAL REDESIGN | P2 | S | Shares the vault shell fix |
| Collection — Games | Weak — 70 grey tiles | PARTIAL REDESIGN | P2 | S | Placeholder design; shares the shell fix |
| Collection — Mangaka | **Unusable at scale** | **FULL OVERHAUL** | **P0** | M | 142 k px; no search |
| Collection — Shrine | Very good | **KEEP** | — | — | Rank-one feature is strong |
| Collection — Planner | Good | POLISH | P3 | S | Release desk is a good idea |
| Collection — Goals | Adequate | POLISH | P3 | S | Short page |
| Collection — Sync & Import | Adequate | POLISH | P2 | S | 6 unlabelled controls |
| Collection — AniList profile | Broken on new devices | PARTIAL REDESIGN | P1 | S | Real token-missing state |
| Collection — VNDB profile | Broken on new devices | PARTIAL REDESIGN | P1 | S | Same |
| Collection — Seasonal | Adequate | POLISH | P3 | S | `.med-quickrow` 8 px overflow |
| Governor — Status | Very good | POLISH | P1 | S | Phone clipping; settings out of the hero |
| Governor — Gold Shop | Good | POLISH | P2 | S | Dual taxonomy; zero tiles |
| Governor — Avatar / Session Log | Good | POLISH | P3 | S | Not deeply exercised |
| Assistant | Very good | POLISH | P1 | M | Presence panel overflow; in-thread loading |
| Archive — Backup & Restore | Very good | **KEEP** | — | — | Cleanest responsive page |
| Archive — Help & Guide | Very good | **KEEP** | — | — | Reference implementation |
| Global chrome | Mixed | PARTIAL REDESIGN | P1 | M | Routing, skip link, mobile topbar, search scope |

**Totals over the 35 rows above — FULL OVERHAUL 3** (subject desk, ref page
shell, Mangaka) · **PARTIAL REDESIGN 10** · **POLISH 16** · **KEEP 6**.

---

## 8. Design-System Problems

**Font sizes.** Body is `15.5px`; inputs `14.5px`; `small` `12.5px`. Observed in
the wild: 7, 8, 9, 10, 11, 12, 12.5, 13, 13.5, 14.5, 15.5, 16, 21, 24 px plus
four `clamp()` ramps. Only four type tokens exist
(`--type-page-title/hero-title/section-title/card-title/label`) and most
components ignore them. **Recommend:** a 7-step scale
(11 / 12.5 / 14 / 15.5 / 18 / 22 / 30) exposed as tokens, an **11 px floor**, and
a lint rule against literal `font-size` under 11 px.

**Font weights.** `h1–h3` at `550`; `strong` at `700`; buttons inherit. Kickers
use `700` at 11.5 px. **Recommend:** three weights only — 400 / 550 / 700.

**Spacing.** `--space-1…8` exist on a 4 px cadence and are genuinely used, but
literals persist (`padding: 7px var(--space-3)` in the base input rule;
`--hero-pad-block: 26px`; `--page-pad-start: 26px`; `--page-pad-end: 70px`).
**Recommend:** eliminate non-multiples of 4.

**Border radii.** `--radius: 12px` with `--radius-control`, `--radius-card`,
`--radius-hero` (clamped 6–30 px) and `--radius-pill`. Well designed; the
problem is that themes override `--radius` and the clamps then produce different
relationships per theme. **Recommend:** derive hero/control radii from a fixed
ratio, not independent clamps.

**Card styles.** At least four surface treatments coexist: `.card`,
`.subj-card`, `.stat-card`, `.bento-card`, plus one-off panels. Nesting is
common — bento card → stat card → inner well. **Recommend:** two surfaces only
(`surface` and `surface-raised`) and a rule against three levels of nesting.

**Borders & shadows.** `--line` / `--line2` derived from `--text` are good.
`--shadow-sm/md/lg` are hard-coded warm RGBA (`rgba(46,36,18,…)`) that stay warm
on all 23 dark themes. **Recommend:** derive shadow colour from `--bg0`.

**Colours.** Canonical set is sound. Two systemic faults: `--text2 === --text` in
all 23 dark themes, and one shared `--muted` (`#7E899A`) across all of them
regardless of hue. **Recommend:** every theme block must define three distinct
text levels, and CI should assert `contrast(--muted, --bg1) ≥ 4.5`.

**Buttons.** `.btn`, `.btn.primary`, `.btn.danger`, `.mini-btn`, `.study-tab`,
`.subnav-item`, `.pill`, plus ad-hoc chips. Focus running state shows three
different fills with no primary. **Recommend:** four variants — primary,
secondary, ghost, danger — in three sizes, with exactly one primary per view.

**Inputs.** The base `:where(input, select, textarea)` rule is good
(min-height, focus ring, `accent-color`). Labels are the problem: 10 px
uppercase `--muted` at 3.1:1. **Recommend:** 11 px, `--text2`, sentence case.

**Section headers.** Three patterns: `.dh-kicker` + `h1` + `.dh-sub`;
ALL-CAPS `--muted` mini-headers; and plain `h2`/`h3`. **Recommend:** one
`PageHeader` and one `SectionHeader`.

**Icon sizing.** `--icon-btn-size` 32/28/24 exists, but calendar chips, mascot
hit-zones and ref checkboxes ignore it (13–22 px). **Recommend:** a 24 px visual
minimum with a 44 px hit area via padding or `::after`.

**Component density.** Content-region density varies wildly — the ref page packs
five control bands into 330 px while Review leaves 40 % of the viewport empty.
**Recommend:** a documented density target of ~140 px of chrome before content.

**Responsive.** See G-17. **Recommend:** the four declared tiers only —
1240 / 1080 / 860 / 560 — plus one phone tier at 700 consolidated into a single
block, and a CI check that fails on any other breakpoint.

---

## 9. Technical UI Debt

Only items with a direct UI-reliability payoff.

1. **One 7,337-line / 426 KB `main.css`.** Section comments are excellent but
   related rules for one component are scattered across thousands of lines (the
   phone tier is in seven places). *Split into layered files
   (`tokens / base / layout / components / views / responsive`) concatenated at
   deploy* — no bundler required, `deploy_pages.sh` already stages files.
2. **21 breakpoints** (G-17). Direct cause of the mobile failures — nobody can
   hold 21 collapse points in their head.
3. **`overflow: hidden` as a layout tool.** The reason no view reports document
   overflow while five views are visibly amputated on phones. *Replace with real
   wrapping/reflow; reserve `hidden` for deliberate bleed.*
4. **`height: 100vh` on `#app`** with no `dvh` fallback (G-18).
5. **No teardown contract for views.** `main.innerHTML = ""` is the only
   cleanup. *Add an optional `KOS.views[id].destroy` invoked by `KOS.show`.*
6. **`KOS.show` conflates routing, persistence and rendering.** It writes
   `ui.view`, saves state (dirtying cloud sync — B-07), resets scroll, repaints
   the rail and subnav, and calls the view. *Separate router / persistence /
   render.*
7. **UI preferences live in the synced state document.** Root cause of B-01,
   B-02, B-07 and B-08. *Move `state.ui` and `state.media.*` view prefs to a
   local-only store.*
8. **`scrollIntoView` used for in-page positioning** (7 call sites). It walks
   every scrollable ancestor; B-04 is the result. *Scroll the intended container
   explicitly.*
9. **The lazy area is implemented once but not adopted everywhere.**
   `medview`'s area is good; Mangaka bypasses it entirely (B-06).
10. **`IntersectionObserver` with `root: null`** against an inner scroll
    container, plus one-batch-per-transition (B-05). *Set `root` to `#main` and
    loop until not intersecting.*
11. **`el(tag, {style: "..."})` sets `cssText`**, encouraging inline styles;
    `crop-media` writes `--crop-x/y/zoom` inline per image (1,107 times on
    Mangaka). *Acceptable for crop vars; audit other inline style use.*
12. **Hard-coded pixel geometry in tokens** (`--hero-min-h: 240px`,
    `--page-pad-end: 70px`, `--sidebar-*-w`) that never adapt below their
    breakpoints.
13. **Repeated components that should be primitives:** three tab
    implementations, four card surfaces, at least three "stat tile" variants,
    two hero patterns, and per-view empty states. *Promote to `KOS.ui`.*
14. **No focus-management primitive.** Every modal reimplements (or omits)
    trapping, labelling and restoration.

---

## 10. Proposed Target Design Direction

**Preserve the identity. Fix the frame.** KurenaiOS should not become a generic
SaaS dashboard; its parchment-and-lacquer, kanji-marked, serif-titled character
is its main advantage over Anki + Notion + AniList.

**Visual personality.** *A lamplit study room, not a control panel.* Warm
grounds, ink text, one accent per context, kanji as quiet section marks, generous
serif display type against compact sans UI. Ornament earns its place by marking
structure (the 澄 empty state, the 集中 focus field, module watermarks) and is
removed where it merely fills space (abstract shop SVGs, the decorative quote in
the tab order).

**Hierarchy.** One page title, one primary action, one dominant object per
screen. Everything else is secondary. Where two components currently show the
same number, exactly one survives.

**Density.** Two modes. *Reading surfaces* (ref content, Help, assistant turns)
get generous measure and ≤ 140 px of chrome. *Working surfaces* (vaults,
calendar, reminders, planner) get compact rows, 32 px controls and real
information per pixel. No screen should be 60 % empty; none should stack five
control bands.

**Typography.** Fraunces for display, Alegreya Sans for UI, IBM Plex Mono
reserved for code and identifiers only (not for economy readouts). Seven sizes,
three weights, 11 px floor.

**Surfaces.** Two levels — `surface` and `surface-raised`. A maximum of two
levels of nesting. Panels are separated by rules and space before they are
separated by borders.

**Colour.** Canonical tokens only. Every theme defines three distinct text
levels. `--muted` must clear 4.5:1 in every theme. Subject hues stay fixed in
meaning. Status colour is carried by `--good/--warning/--danger` and never
hard-coded.

**Imagery.** Cover art and banners are first-class, and every text-over-image
surface carries a mandatory scrim. Missing art has a *designed* fallback (module
kanji on a hue derived from the title), used during loading as well as on error —
never an empty box.

**Motion.** Motion explains state changes: a card flipping, a panel expanding, a
batch of results arriving. It never decorates a static page. The drifting petals
stay — they are ambient and already reduced-motion-aware — but no new decorative
animation.

**Navigation philosophy.** One primary rail (sections), one secondary strip
(views within a section), and nothing else. A page never carries two navigations
for the same destinations. `KOS.show` gains `history.pushState` so every view has
a URL, browser Back works, and deep links are possible.

**Mobile philosophy.** Phones are a first-class tier, not a squeeze. Content
reflows; it is never clipped. One column, full-width cards, sheets instead of
side panels, a bottom bar of at most five destinations with the rest behind
"More", and `#main` padded clear of it. Every touch target is 44 px.

**Responsive strategy.** Four tiers only — 1240 (workspace), 1080 (compact rail),
860 (compact), 560 (small) — plus the consolidated 700 px phone block. Layout
adapts by reflow and disclosure, never by `overflow: hidden`.

**Accessibility principles.** AA contrast is a build gate, not an aspiration.
Every modal is a real dialog. Every interactive surface is keyboard-reachable
with a visible focus ring, in a sensible order, behind a skip link. Icon-only
controls always carry a name. Status changes are announced.

---

## 10a. Remediation status (updated 8 August 2026)

**Phase A is complete and verified.** Merged as
[PR #1](https://github.com/crimsoncodes7/KurenaiOS/pull/1) and
[PR #2](https://github.com/crimsoncodes7/KurenaiOS/pull/2); `main` is at
`dc44fe4`. The release gate is now **41 suites**, all green.

| Finding | Status | How it was verified |
|---|---|---|
| B-01 / B-02 — sync hijacks navigation and clobbers `state.ui` | **Fixed** | Per-device keys excluded from the payload and the dirty hash by one shared filter; `rerenderCurrent` redraws the on-screen view. smoke17 step 4b. |
| B-07 — every page view dirties the cloud document | **Fixed** | Same filter. A page view no longer pushes. |
| B-03 — cosmetics not re-applied after a pull | **Fixed** | `applyCosmetics()` called from the pull path; smoke17 asserts it with a spy. |
| B-04 — topic opens 579px down the page | **Fixed** | `scrollTop` 643 → 0; smoke40. |
| B-05 — vault lazy loader stalls | **Fixed** | Observer roots on `#main` and refills while the sentinel is in range; smoke40. The originally reported stall could not be reproduced, but both defects were real. |
| B-06 — Mangaka renders the whole library | **Fixed** | 144,276px → 9,970px at 900 authors; smoke40. |
| G-16 — the phone tier clips instead of reflowing | **Fixed** | 0 overflowing elements at 390px on all five views (`tools/phone_overflow.mjs`). |
| **GOV-1 — the Governor seat clips at 390px** | **Fixed later** | Phase A validated this against an *empty* account, where the seat happens to fit. With the real account it still overflowed 114px and clipped 136px. Fixed in `a3b0016`: 8 → 0 overflowing. |
| G-06 — dark mode is paywalled and OS preference ignored | **Fixed** | Two FREE themes (Atelier Dawn / Atelier Dusk, price 0, owned without purchase), and an unpinned install now follows `prefers-color-scheme` in pure CSS so a dark device never flashes the light palette before scripts run. The 23 shop themes are unchanged. |
| G-08 — the three-level type hierarchy exists only in the default theme | **Fixed** | Every one of the 23 dark themes now defines its own `--text2` and `--muted`, derived from that theme's own text hue against its own surfaces, each clearing 4.5:1 on ground/paper/raised. No more shared blue-grey on warm themes. |
| G-09 — default-theme secondary text fails AA | **Fixed (light) / partial (structure)** | `--muted` #97896D → #726751: 4.52 / 5.02 / 5.33. The hierarchy stays compressed (text2 : muted ≈ 1.34) because the Atelier surfaces span only ~4% luminance; moving `--text2` makes it worse, so opening it further needs a deliberate surface change, deferred as a design decision. |
| **The 8 Aug data-loss incident** | **Fixed** | Not in the original audit — found in production after Phase A. A dormant device with one real edit still overwrote a newer cloud copy wholesale. A monotonic `__seq` staleness guard now refuses the push and raises a conflict. Covered by smoke41 and by `tools/cloud_staleness_live.mjs` **against the real Supabase database, two independent devices, end to end**. |

**Phase B — complete.** The release gate is now **42 suites**, all green, plus the
live-Chrome visual audit and a 480-cell responsive sweep (24 views × 10 widths ×
2 themes) at zero overflowing elements.

| Finding | Status | How it was verified |
|---|---|---|
| **G-17 — 21 breakpoints against a documented 4** | **Fixed** | Every `max-width` in `css/main.css` is now one of **1240 · 1080 · 860 · 700 · 560**; 66 width queries, five thresholds, no `min-width` bands. smoke42 fails the build on a sixth. The tiers, and the rule that a component needing its own collapse point must reflow intrinsically instead, are written into the token block. |
| **Tier ordering (not in the original audit)** | **Fixed** | Consolidating exposed 30 cases where a *narrower* tier was written ABOVE its wider sibling and therefore never applied: half the Governor seat's ≤700 identity rules (the GOV-1 fix's own `minmax(0,1fr)` and padding), a dead `.heat-stats` rule, and 24 assistant declarations left over from the drawer-era CSS the Category 6.1 workspace rewrite superseded. Removed or reordered; smoke42 asserts zero inversions remain. |
| **SUBJ-4 — the spec-spine handle floats over the section list** | **Fixed** | The pill kept its 32px desktop width on phones, so "Spec spine" wrapped to two lines and printed on top of the card beneath. `width: auto` in the phone tier. Not visible to a pixel probe — it overlaps vertically without crossing the viewport edge. |
| **G-10 / U-03 — modals are not dialogs** | **Fixed** | One `KOS.ui.openDialog` primitive: `role="dialog"`, `aria-modal`, a name taken from the modal's own visible heading, focus trap, body scroll lock, focus restoration, Escape. All **33** overlays migrated; a source contract in smoke42 fails the build if a new modal appends itself directly. |
| **G-11 / U-04 — Enter confirms destructive modals** | **Fixed** | A `danger` dialog is an `alertdialog`, opens with **Cancel** focused, and ignores Enter. Non-destructive dialogs keep the shortcut. |
| **G-12 / U-05 / CHR-3 — no skip link** | **Fixed** | Visible-on-focus skip link to `#main`, which already carried `tabindex="-1"`. |
| **G-23 / U-12 — three tab idioms** | **Fixed (component)** | One `KOS.ui.tabs` with three variants — primary (section nav, keeps navigation semantics and `aria-current`), workspace (a real tablist), card (the Books lens). `.subnav-item`, `.study-tab` and the bespoke Books cards all resolve to it. The *duplicate navigations* on Reminders and Gold Shop (REM-1, GOV-3) are page-level and remain open. |
| **G-24 / U-15 / VLT-2 — covers are a void while loading** | **Fixed** | The module kanji is painted from the first frame and the image cross-fades over it; on error the mark is simply already there. |
| **REV-1 / U-17 — six stat cards all reading `0`** | **Fixed (Review)** | `KOS.ui.statTile` suppresses a zero that carries no information. Review shows Due and Overdue always — "0 due" is the answer to the question — plus whichever per-subject splits are non-zero. The Gold Shop and Collection zero tiles are page-level and remain open. |
| **U-20 — empty states occupy card-sized boxes** | **Fixed (component)** | `KOS.ui.emptyState` with a `compact` form: one line, inline action, no reserved box. The eight vault call sites route through it. Per-page adoption continues in later phases. |
| **MTX-1 / U-29 / SUBJ-3 — scrollers with no affordance** | **Fixed** | `KOS.ui.scroller`: position-aware edge fades, arrow controls, ← → keys, `data-scroller`. Applied to Collection's cover strip and the subject unit band — the two real horizontal scrollers, which between them accounted for every one of the 1,562 overflowing elements the sweep found before the fix. |
| **B-10 / G-26 — toasts render behind the modal scrim** | **Fixed** | One `--z-*` layer scale; the toast sits above the modal layer. Verified by screenshot with a modal open. |
| **U-27 — unformatted thousands** | **Fixed (currency)** | `KOS.ui.num()` on the HUD, the Governor instruments and the Gold Shop. The gold progress bar (G-28/U-27's second half) is page-level and remains open. |

**Deliberately retained.** `prefers-reduced-motion`, `prefers-color-scheme` and
`pointer: coarse` are feature queries, not breakpoints, and stay. No component
was given a container query: every case that looked like it needed one
(`.ap-analytics-grid`, `.goal-grid-v2`, `.heat-stats`, `.integration-facts`)
resolved cleanly onto a tier, and adding a second responsive mechanism to buy
back 40px of collapse point is a worse trade than the tier.

**Lesson carried forward, second instance:** the pixel probe is necessary and
not sufficient. It found nothing wrong with the spec-spine pill, because
overlapping content vertically is invisible to a right-edge check. Screenshots
at every viewport are still part of verifying a responsive change.

**Lesson carried forward:** an empty test account hides most layout failures.
Density seeding is now part of verifying any responsive fix — GOV-1 survived a
whole phase because nobody measured it with real data.

**Phase C (Study) — complete.** The release gate is now **43 suites**, all
green, plus a 108-cell responsive sweep of the Study surfaces across nine
widths × two themes at zero overflowing elements, and screenshots at
1920/1440/820/390 in Dawn and Dusk against the dense account.

| Finding | Status | How it was verified |
|---|---|---|
| **SUBJ-1 — the tree and the "Sections" ledger render the same list** | **Fixed** | The main-column ledger is deleted. The spine is the only section list, and it inherited both things the ledger did that it did not: a per-section progress bar on the shared `low/mid/high` ramp, and the per-subsection tally that the ledger revealed on expand. smoke43 A asserts both, that the bar carries the same quantity as the count beside it, and that no `.sec-card` is rendered in the main column. |
| **SUBJ-2 — spec-point totals appear four times** | **Fixed** | Twice now, each doing a different job: the spine header (navigation context) and the "Topics secure" tile (the statistic). The board band's lead states the board's identity instead of restating the ratio. smoke37 asserts the lead carries no "secure" text. |
| **SUBJ-4 — the spec-spine handle floats over the section list** | **Fixed properly** | Phase B fixed the pill's text *wrap* and closed this; it was still a `position: fixed` control printing over whatever paragraph was beneath it, which no right-edge probe can see. The pill is retired. At ≤860 the closed spine has no presence at all and the page header carries a real `☰ Spec spine` button, which cannot overlap anything. smoke43 F greps for both. |
| **SUBJ-5 — long deadline titles clip by 286px** | **Fixed** | `.dl-title` clamps to two lines instead of one `nowrap` line. |
| **SUBJ-6 — a dense explanatory paragraph sits under the grid as body text** | **Fixed** | The line that carries information every time (deep-content coverage) stays visible; the mastery-vs-secure definition is behind a `<details>`. |
| **The spine covered the page at 701–860 (not in the original audit)** | **Fixed** | `#tree` goes `position: fixed` at ≤860, but the default-closed rule only ran at ≤700 — so for a 160px band the spine simply covered the page it navigates, with no scrim and nothing to dismiss it. The overlay threshold is now 860 for both, and the drawer gained a scrim that dismisses on tap and on Escape (and leaves Escape alone above the tier, and never steals it from a modal). |
| **Opening a topic did not reveal it in the spine (not in the original audit)** | **Fixed** | The active leaf sat inside a collapsed section, so `.leaf.active` was `display:none` and the existing `scrollIntoView` was a no-op — the spine could not answer "where am I", which is disqualifying for the control that now owns section navigation. The owning section opens itself and is marked `.here`; `scrollIntoView` is `block:"nearest"` so it no longer yanks the list when the topic is already visible. |
| **REF-1 — ~330px of chrome before the first word of content** | **Fixed** | Measured against the dense account at 1440×900: **571px → 161px** from `#main`'s top edge, **135px below the topic header** (133–136 at 1240/1440/1920). Crumbs, seal+title+board line and a 170px status band became one header row; the status band moved to the inspector. |
| **REF-2 / B-04 — opening a topic scrolls the page down** | **Held** | `#main.scrollTop === 0` on every mount at every width; smoke43 D re-asserts the reader-initiated-only rule through the new page control. |
| **REF-3 — mastery appears twice** | **Fixed** | Once. The inspector's standalone "Mastery" section is gone; the one live readout is the Topic Status component's head, which is now *in* the inspector. smoke37 asserts `$$(".ts-pct").length === 1`. |
| **REF-4 — the four material counts appear twice** | **Fixed** | Once, on the tab chips — the number is what decides whether you press the tab. The inspector's "Materials" list is gone; smoke37 greps the inspector for it. |
| **REF-5 — 11 controls at 16×16px** | **Fixed (the four progress checks)** | 16 → 20px, inside chips that already carry `--control-h-sm`. The confidence controls became labelled pills. |
| **REF-6 — three levels of tab on one page** | **Fixed** | One. The assistant strip moved into the inspector, the tab strip is a single row inside a declared `KOS.ui.scroller` (arrows, edge fades, `data-scroller`) stuck to the top of the reader, and the note-page pills became a `‹ 3 / 7 · Title ›` stepper in that same bar with the full list behind a disclosure. Verified one row at 390/560/820/1080/1240/1440/1920. |
| **REF-7 — confidence is three unlabelled pale circles** | **Fixed** | Three labelled controls — struggling · shaky · solid — each with `aria-pressed` and a real accessible name. The dot survives as the colour cue. |
| **REF-8 — no keyboard support in the flashcard/quiz engines** | **Fixed** | Flashcards: `Space`/`Enter` flip, `1–4` grade, `→` reveal-then-Good, `←` hide. Quiz: `1–9` answers the first question still open. Both are printed in the UI (a legend under the card, the number on each grading button and each option), both refuse to act on a face-down card or steal a key from a text field, and both remove their own listener once their panel is replaced. smoke43 E covers all of it. |
| **REF-9 — the flashcard and its grading buttons are below the fold** | **Fixed** | Consequentially: the card now begins 410px higher than it did. |
| **REF-10 — 8px rating sub-labels** | **Fixed** | 9.5 → 11px, the floor Phase B set for the primitives. |

**Open, and deliberately not fixed here.** `#subnav` sets `flex-wrap: wrap`, so
at 390px the Study section strip wraps to **three rows and eats ~100px above
every page in the app** — the single largest remaining "chrome before content"
cost on both Study surfaces. The fix is to run the subnav through
`KOS.ui.scroller` (an undeclared sideways scroll would fail the probe by
design), which changes global navigation on all 24 views; it belongs with the
Home/global chrome work in the rest of Phase C, not as a drive-by at the end of
a Study redesign.

**Also found, out of scope, unchanged:** the Focus Timer setup overflows by
366px at 390px (39 elements, both themes). Confirmed pre-existing by running
the same sweep against the Phase B tree — see the harness note below.

**Phase C part 2 (Home) — complete.** A partial redesign, as the audit
prescribed: the composition is kept, the content selection is replaced.

| Finding | Status | How it was verified |
|---|---|---|
| **HOME-1 / G-29 — four KPIs read `0` for an active account** | **Fixed** | The hero measured a checklist the user does not tick. It measures the work now: **study streak · cards due · hours this week**, each with a line saying what it means so a zero is an answer rather than an accusation. Coverage was not deleted — it was demoted to the subject cards, where it is a property of a subject rather than a headline. smoke43 G drives an account with 24 sessions and *zero* ticked checks — exactly the shape the audit found — and asserts the figures are non-zero. |
| **HOME-2 — hero text sits on banner artwork with no scrim** | **Fixed** | Two changes, both mandatory rather than best-effort. `applyBanner` gained a `full` scrim for hosts that carry text at *both* ends (Home's default gradient went transparent exactly where the figures sat, which is why a kanji watermark was printing through "SPEC POINTS"), and the figures gained their own translucent `--bg1` panel. The status pill, streak chips and XP bar lost the `rgba(0,0,0,.3)` treatment that assumed dark artwork. No text on this page depends on the image. |
| **HOME-3 — `.todo-panel` overflows +208px at 390px** | **Held** | 0 overflowing elements on home across 9 widths × 2 themes with the dense account. |
| **HOME-4 — two empty boxes consume ~280px saying nothing** | **Fixed** | Empty Directives *and* Countdowns collapse to one 64px line with the action that would fill them — **240px reclaimed**. When only one has content it takes the full width (`.home-today.one-up`) instead of sitting beside a hole. |
| **HOME-5 — the Collection card is a different shape** | **Fixed** | It is the same component: the same ring, the same meta line, the same track, the same Continue action ("Anime · 24 in progress"). Its figures come from one `mediadb.stats` pass, gated on an IntersectionObserver so a full-table scan never runs on Home's render pass. |
| **HOME-6 — seven unlabelled pips** | **Fixed** | The row is titled "Last 7 days", each pip carries its own date, and the group is announced as "N of the last 7 days had a study session". |
| **HOME-7 — the decorative quote is a focusable button** | **Already resolved; now pinned** | The pill became the profile-status editor in an earlier build, so it is a real control with a name. smoke43 G asserts it stays one. |
| **HOME-8 — greeting and CTA compete at 390px** | **Fixed** | The focus CTA left the greeting row for the next-action card, which is where a call to action belongs. The hero is a two-row reflow on phones and each headline figure becomes a full-width row rather than wrapping 2-then-1 around a hole. |
| **"What should I do next" was not answered anywhere** | **New surface** | One statement, one reason, one action, directly under the greeting: a running session → cards due → anything dated inside a week → the first unsealed directive → where you left off → a genuinely clear board. It reads the surfaces that already exist (`countdowns()` is the same merged read the panel below uses, so the two cannot disagree) and writes nothing. The page now has **exactly one primary button**. |

**Also fixed in passing:** Home used to force the media vault open during
boot. The Collection card's scan is now visibility-gated, so a cold start on
the app's most-visited page no longer opens IndexedDB or walks ~1,900 rows.

**Lesson carried forward, third instance — and this one was in the harness.**
`tools/responsive_audit.mjs` had two defects that between them meant the
"dense account" was not dense: it seeded `status: "completed"`, which is not a
value the app's `none|started|paused|done` vocabulary knows (so every Study
surface read **0/156 secure** — the very figure the audit quoted for SUBJ-2),
and its `store.save()` is debounced 120ms while the harness reloads the page
the moment seeding resolves, so on a *re-seed* the entire localStorage half of
the seed was silently lost. Both fixed (`store.flush()`, correct statuses, plus
SM-2 metadata and RAG ratings). The measurement tool is part of the surface
under test.

**Phase D (Collection) — complete.** The release gate is now **44 suites**,
all green, plus a 192-cell whole-app sweep and an 88-cell Collection sweep
(4 widths × 2 themes) at zero overflowing elements, and screenshots at
1920/1440/820/390 in Dawn and Dusk against the dense account.

| Finding | Status | How it was verified |
|---|---|---|
| **MNG-1 — Mangaka renders 882 authors and 1,107 series at once** | **Fixed** | Phase A put it on the lazy area, which fixed the page height and not the page: a prolific author still printed all 28 works inline. The author card is bounded at 8 works with `Show all N` behind it. Against the dense account (1,107 series / 732 authors): **142,062px → 10,850px**, **12,833 → 1,220 nodes**, **1,107 → 106 `<img>`**, 60 authors mounted. smoke44 E. |
| **MNG-2 — no search, no index, no filter** | **Fixed** | Search and the A–Z rail landed in Phase A. Phase D added the filtering the page never had — format, reading status, the physical shelf, and a "prolific only" threshold, which is the question a mangaka directory answers — plus sort by works / volumes / chapters, and **sticky letter dividers in the flow** (a rail says where you can go; a divider says where you are). Filtering recomputes each author's own figures, so the meta line always describes the works you can see. |
| **VLT-3 / U-13 — 17 controls before content on Books (11 Anime, 11 VN, 9 Games)** | **Fixed** | One toolbar: `search · sort · layout · Filters ▾ · Actions ▾ · + Add`. Six controls, and smoke44 A fails the build on a seventh. Facets moved into Filters ▾ with a badge counting what is applied; commands into Actions ▾ under real headings. |
| **VLT-4 / U-14 — three levels of hero finish** | **Fixed** | One composition, one three-step backdrop — banner, else the entry's own cover blown up and blurred, else a deterministic gradient in the module's accent hue-shifted by the title. The light `.vh-painted` treatment is retired. Nothing here fetches, so games/VN still emit zero network. |
| **VLT-5 — hero text on artwork with no scrim** | **Fixed** | The scrim is unconditional on every path, and there is one text colour rather than one per backdrop. Invariant #56's rule, applied to the Collection. |
| **VLT-6 — long titles wrap to three lines over the cover** | **Fixed** | Two-line clamp with a tooltip, on the grid cards and the Mangaka work tiles. |
| **VLT-7 — decorative Unicode list names are invisible lines** | **Fixed** | The name is preserved exactly (it is the user's and it round-trips to AniList); the row gains "unnamed list" and a count. |
| **VLT-8 / G-31 / U-26 — a 64-option facet mixing genres and VNDB tags** | **Fixed** | Fixed where it is READ, not in the data (invariant #29): Genres, then Tags, then Rare tags, each option carrying its count. Nothing is hidden — a one-title tag is still reachable. |
| **VLT-10 — `.med-quickrow` overflows a 128px card by 8px** | **Fixed** | The quick-edit row wraps and its controls shrink; a 118px select + a 52px score is 175px whatever the card is. |
| **VLT-11 — Games is 70 identical grey tiles** | **Fixed** | The placeholder mark sits on a wash derived from the title (the same hash the book spines use), and a loading cover shimmers. A placeholder identical for every title says nothing about any title. |
| **VLT-2 / U-15 — covers show nothing while loading** | **Held, extended** | Phase B painted the kanji from the first frame; Phase D added the shimmer and routed the Overview's strip through the same shared `cover()`. |
| **VLT-9 — the editor exposes a raw CDN URL and shows an unrated score as 0** | **Not fixed** | Out of this phase's three named surfaces (the editor folio is smoke36's). Recorded. |
| **MTX-1 / U-29 — the cover strip has no scroll affordance** | **Held** | Still on `KOS.ui.scroller`; re-asserted after the Overview rewrite. |
| **MTX-2 / U-18 — four near-identical status charts, two donuts** | **Fixed** | One small-multiples row on a shared scale with one legend, and one donut (in Analytics). smoke44 F asserts every panel's axis tops out at the same value. |
| **MTX-3 — the four module totals appear four times** | **Fixed** | Each module's totals are its own card's job; the KPI row carries only the cross-media figures no card can say. smoke44 F fails if a per-module total reappears in the KPI row. |
| **MTX-4 / U-19 — no axes, no gridlines, ~7px labels** | **Fixed** | In `core/charts.js`, so it pays out on every chart in the app: a value axis with gridlines and labels, an **11px floor**, a `<title>` on every mark, and category labels that wrap rather than being cut to nine characters. |
| **MTX-5 — a "distribution" drawn from one rated title; a zero tile** | **Fixed** | Zero tiles suppressed via `KOS.ui.statTile`; the score card refuses to draw below five ratings and says what is missing instead. |
| **MTX-6 / U-30 — four progress formats on one page** | **Fixed** | `KOS.media.progressText` / `progressPct` are the one grammar; the vault views, the hero and the Overview all read them. |
| **An open menu survived a view change (not in the original audit)** | **Fixed** | A menu panel is `position: fixed` on `document.body`, so clearing `#main` did not remove it: navigating with one open left a floating popover over the new page, still wired to controls that no longer existed. Found by smoke11, fixed in `KOS.show`. |

**Lesson carried forward, fourth instance — and again it was the harness.**
`responsive_audit.mjs` seeded 460 entries on a flat four-way module rotation
with 40 author names, and gave **all four** vaults a hero banner. That is not
the library the audit measured (692 anime · 1,107 books · 11 VNs · 70 games,
882 authors), and the banner seeding hid VLT-4 entirely — the asymmetry it
describes only exists because AniList is the one provider that exposes a
banner. Both fixed. A seeder that flatters the app is worse than no seeder.

## 11. Prioritised Remediation Roadmap

### Phase A — Critical bugs and broken layouts
**Areas:** `cloudsync.js`, `main.js`, `hub.js`, `medview.js`, Mangaka, the phone
tier for Home / subject / focus / governor / assistant.
**Rationale:** B-01/B-02 make multi-device use hostile and can orphan an open
editor; B-06 can lock a large library out of a whole view; the phone overflows
make five major screens unusable on the most likely device.
**Dependencies:** none — this phase must land first.
**Scope:** ~2–3 days.
**Acceptance criteria:**
- With two devices signed in and active, neither ever changes the other's
  current view; `state.ui.view` always matches the rendered view.
- Signing in on a fresh device applies the saved theme with no reload.
- Opening any topic leaves `#main.scrollTop === 0`.
- Scrolling a 692-entry vault to the end loads all entries; no stall.
- Mangaka's `scrollHeight` is under 20,000 px with a library of 900 authors, and
  the view has a working search.
- At 390 px, `_probe-findings.json` reports **zero** overflowing elements on
  home, subject, focus, governor and assistant.
- No content sits behind the bottom tab bar.

### Phase B — Shared design system and layout foundations · **COMPLETE**
**Areas:** `main.css` token layer and split; `KOS.ui` primitives (Dialog, Tabs,
Card, StatTile, EmptyState, PageHeader, SectionHeader); breakpoint consolidation.
**Rationale:** every later phase is cheaper once there is one tab component, one
dialog and four breakpoints.
**Dependencies:** Phase A (don't refactor CSS under a moving layout).
**Scope:** ~3–4 days.
**Acceptance criteria:**
- `grep '@media' css/main.css` yields only the five sanctioned widths.
- `--muted` clears 4.5:1 against `--bg1` and `--panel` in **all 24** themes; all
  24 define three distinct text levels; a script asserts this in the smoke gate.
- One `Dialog` primitive with `role="dialog"`, `aria-modal`, `aria-labelledby`,
  focus trap, scroll lock and focus restore; every existing modal uses it;
  danger dialogs focus Cancel and do not confirm on Enter.
- One `Tabs` primitive; `.subnav-item`, `.study-tab` and the Books tab cards all
  resolve to it.
- No literal `font-size` below 11 px; no spacing literal that isn't a multiple of 4.

**Outcome — met, except two items deliberately deferred:**

| Criterion | Result |
|---|---|
| Only the five sanctioned widths | ✓ 66 width queries, thresholds 1240/1080/860/700/560, asserted by smoke42 |
| `--muted` ≥ 4.5:1 in all 24 themes, three text levels each | ✓ landed earlier in Phase B (`605fcb1`, `93b4f6b`) |
| One Dialog primitive, every modal uses it, danger-safe | ✓ 33 overlays, source contract in smoke42 |
| One Tabs primitive resolving all three idioms | ✓ |
| Visible-on-focus skip link | ✓ |
| **No literal `font-size` below 11 px** | **Deferred.** ~40 rules sit at 8–10.5 px, most of them inside components (calendar chips at 9.5 px, the Focus micro-text stack, assistant presence at 8–9 px) whose *layout* has to change for 11 px to fit. Raising the number without re-laying-out the component would reintroduce the overflow Phase A removed. This belongs with the per-page work in Phases C–E, where each component is being re-laid-out anyway. The floor is enforced for anything the new primitives emit. |
| **No spacing literal that isn't a multiple of 4** | **Deferred**, same reason and same phases — the literals are load-bearing inside components that are about to be rebuilt. |
| **`main.css` split into layered files** | **Not done, and now recommended against for this phase.** The split would have relocated ~50 media blocks across a 7,700-line file; the ordering analysis above shows that is precisely the operation that resurrects dead rules. With the tier contract and the inversion check now enforced by smoke42, a later split is safe to attempt and cheap to verify. Doing it *before* the contract existed would have been the risky order. |
- A visible-on-focus skip link reaches `#main`.

### Phase C — Highest-priority page overhauls
**Areas:** ref page shell, subject desk, Home.
**Rationale:** the three most-visited study surfaces; they carry the duplication
and letterboxing problems that most damage daily use.
**Dependencies:** Phases A and B.
**Scope:** ~4–5 days.
**Acceptance criteria:**
- Ref page: content begins within 140 px of the page top at 1440×900; mastery
  and material counts appear exactly once each; flashcards support `Space` and
  `1–4`.
- Subject desk: the section list appears exactly once; paper cards are reachable
  at 390 px without inner horizontal scrolling.
- Home: hero KPIs are non-zero and meaningful for an account with sessions but
  no ticked checks; all hero text sits on a scrim; directives wrap at 390 px.

**Outcome — Phase C is complete.**

| Criterion | Result |
|---|---|
| Ref page: content within 140px at 1440×900 | ✓ 571px → **161px** from `#main`'s top, **135px below the topic header** (133–136 across 1240/1440/1920) |
| Mastery appears exactly once | ✓ the inspector's duplicate block is gone; smoke37 asserts one `.ts-pct` |
| Material counts appear exactly once | ✓ on the tab chips; the inspector's "Materials" list is gone |
| Flashcards support `Space` and `1–4` | ✓ plus `→`/`←`, plus `1–9` in the quiz engine, all surfaced in the UI — smoke43 E |
| Subject desk: the section list appears exactly once | ✓ the ledger is deleted; the spine inherited its bar and subsection tally |
| Paper cards reachable at 390px without inner horizontal scrolling | ✓ the band stacks below the phone tier; above it, it is a declared scroller with arrows and fades |
| Home: hero KPIs non-zero and meaningful for an account with sessions but no ticked checks | ✓ streak / cards due / hours this week, asserted against exactly that account in smoke43 G |
| Home: all hero text sits on a scrim | ✓ a `full` band scrim plus the figures' own surface; the dark-artwork assumptions removed |
| Home: directives wrap at 390px | ✓ 0 overflowing elements on home across 9 widths × 2 themes |

### Phase D — Secondary page redesigns
**Areas:** the four vault views and their shared shell, Collection Overview,
Focus setup, AniList/VNDB profiles, Governor Status and Gold Shop.
**Rationale:** the Collection is where this user actually spends time; the
vault shell fix pays out four times.
**Dependencies:** Phase B primitives.
**Scope:** ~4–5 days.
**Acceptance criteria:**
- One hero component across all four vaults, with a designed fallback and a
  mandatory scrim.
- No vault shows more than six controls above the grid; the rest is behind
  Actions ▾ and Filters.
- Covers show the kanji placeholder while loading.
- Collection Overview fits one screen at 1440 with the analytics tail behind a tab.
- Profile pages explain the missing-token state and offer reconnect inline.
- Governor settings sit outside the hero; no zero-value tiles remain.

**Outcome — the Collection third of Phase D is complete** (Mangaka, the four
vaults and their shared shell, Collection Overview). Focus setup, the
AniList/VNDB profiles and Governor Status/Gold Shop remain.

| Criterion | Result |
|---|---|
| One hero component across all four vaults, designed fallback, mandatory scrim | ✓ one composition, a three-step backdrop, the scrim unconditional — smoke44 B |
| No vault shows more than six controls above the grid | ✓ exactly six on all four; smoke44 A fails on a seventh |
| Covers show the kanji placeholder while loading | ✓ held from Phase B, plus a shimmer and a title-derived wash (VLT-11) |
| Collection Overview fits one screen at 1440 with the analytics tail behind a tab | ✓ Overview / Analytics; the tail is one tab away |
| Mangaka usable at scale | ✓ 142,062px → 10,850px, 12,833 → 1,220 nodes, with filters, sort, A–Z and letter dividers |

### Phase E — Responsive / mobile polish
**Areas:** every remaining view at 820 and 390 px; the bottom bar; the mobile
topbar; the spec-spine drawer.
**Dependencies:** Phases C and D.
**Scope:** ~2–3 days.
**Acceptance criteria:**
- Zero overflowing elements and zero unintended clipping on **every** view at
  390 and 820 px, verified by the probe script.
- Bottom bar carries at most five destinations plus "More"; no label truncates.
- Search is reachable on phones.
- `#app` uses `100dvh` with a `100vh` fallback.

### Phase F — Accessibility and interaction refinement
**Areas:** touch targets, labels, tab order, announcements, keyboard shortcuts,
routing.
**Dependencies:** Phase B's primitives.
**Scope:** ~2–3 days.
**Acceptance criteria:**
- No interactive target below 24 px visual / 44 px hit area anywhere (ref
  checkboxes and the 61 calendar chips specifically).
- Every input and icon-only button has an accessible name; no `div` in the tab
  order; the decorative quote is not focusable.
- `KOS.show` uses `history.pushState`; browser Back navigates within the app and
  every view has a URL.
- Toast/status updates announce via a live region; the sync chip announces only
  real state changes.

### Phase G — Final visual consistency pass
**Areas:** charts, empty states, number formatting, iconography, shadows,
remaining POLISH screens.
**Dependencies:** all prior phases.
**Scope:** ~2 days.
**Acceptance criteria:**
- All charts have axes, gridlines and ≥ 11 px labels; no chart renders from
  fewer than three data points without an explanatory empty state.
- One `EmptyState` component everywhere; none reserves more than 120 px when the
  page has other content.
- All large numbers are locale-formatted; gold has no progress bar.
- Shadows derive from `--bg0`; radii relationships hold across all 24 themes.
- A full smoke-suite run plus the probe script pass at four viewports × two
  themes with zero regressions.

---

## 12. Recommended Implementation Order

Ordered so each step makes the next cheaper.

1. **Split per-device UI state out of the synced document** and fix
   `rerenderCurrent` (B-01, B-02, B-07, B-08) — everything else is unreliable to
   test until the app stops navigating itself.
2. **Call `applyCosmetics()` after a cloud pull** (B-03) — one line; without it
   every theme fix is invisible on a fresh device.
3. **Fix the three render bugs**: ref scroll jump (B-04), lazy-loader stall
   (B-05), Mangaka virtualisation (B-06).
4. **Repair the phone tier for the five broken views** (Home, subject, focus,
   governor, assistant) and pad `#main` clear of the bottom bar.
5. **Consolidate breakpoints to five and split `main.css` into layers** — the
   prerequisite for any confident layout work.
6. **Fix the colour contract**: `--muted` ≥ 4.5:1 in all 24 themes; three
   distinct text levels per theme; ship a **free** dark theme and follow
   `prefers-color-scheme`.
7. **Build the shared primitives**: Dialog (with focus management), Tabs, Card,
   StatTile, EmptyState, PageHeader — and migrate existing usage.
8. **Overhaul the ref page shell** (content-first) and add flashcard/quiz
   keyboard shortcuts.
9. **Overhaul the subject desk** (remove the duplicated section list).
10. **Redesign Home's hero content model.**
11. **Build the one vault shell** and apply it to Anime, Books, VN and Games.
12. **Rework Collection Overview's analytics** into small multiples plus a tab.
13. **Polish Governor, Focus setup, Reminders, Review and the profile pages.**
14. **Add `history.pushState` routing** and extend global search across domains.
15. **Complete the accessibility pass**: touch targets, labels, tab order, live
    regions, skip link.
16. **Final consistency pass**: charts, empty states, number formatting, shadows —
    then re-run the full smoke suite and the probe script across the matrix.

---

## Appendix — Evidence and coverage

**Screenshots:** 161 JPGs in `audit-evidence/`, named
`<device>-<theme>-<view>.jpg` across `desktop-1920`, `laptop-1440`, `tablet-820`,
`phone-390` × `light` / `dark` (celestial-duality) × 23 views, plus
`_probe-findings.json` with per-view overflow, clipping and touch-target counts.

**Referenced directly in this document:**
`phone-390-dark-home.jpg` (HOME-3) · `phone-390-dark-subject.jpg` (SUBJ-3,
SUBJ-4) · `laptop-1440-light-ref.jpg` (REF-1, REF-3, REF-4, REF-7) ·
`laptop-1440-dark-assistant.jpg` (AST-1, AST-3) · `phone-390-*-focus.jpg`
(FOC-1) · `*-matrix.jpg` (MTX-1, MTX-2).

**Not fully tested, and why:**

| Area | Reason |
|---|---|
| Governor → Avatar and Session Log tabs | Reached and rendered, but not exercised in depth. |
| Labs (`trace`, `oop`, `sims`, `worked`) and sandboxes | Gold-gated views outside the seven audited sections; only their gating was verified. |
| Attachments / Study Files | Requires uploading files into the owner's IndexedDB; skipped as out-of-scope side effects. |
| Live AniList / VNDB sync and write-back | Would mutate the owner's real remote lists; only local state and UI were exercised. |
| XML import, backup restore, "Reset everything" | Destructive against a live account; the surfaces were audited, the actions were not run. |
| Steam / IGDB Edge Functions | Require deployed secrets; the graceful-degradation UI was audited. |
| Live2D renderer | Release gate is deliberately closed; no runtime installed. |
| iOS/Android installed-PWA behaviour | Audited via viewport emulation only; no physical device. |
| Screen-reader verification | ARIA and focus behaviour audited in the DOM; no VoiceOver/NVDA session. |

**Interaction note.** The browser automation's synthetic mouse events did not
reach the page, so interactions were driven with real DOM `.click()` /
`dispatchEvent` calls against the live app. Rendering, state and layout were
observed exactly as a user would see them; only the input transport differed.

**Temporary changes made during the audit** (all reverted or session-local):
the service worker was unregistered and Cache Storage cleared in the audit
browser only; a `KOS.show` guard was installed at runtime to work around B-01
and removed by reload; one test reminder was created and deleted. **No
repository files were modified**; `KURENAIOS_FULL_UI_UX_AUDIT.md` and
`audit-evidence/` are the only additions.
