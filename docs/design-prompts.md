# Claude Design prompts

One prompt per design request in [ROADMAP.md](ROADMAP.md). Paste each into
the Claude Design project that holds the approved Graphite file
(`KurenaiOS Overhaul`, frames 7a–14c), one conversation per prompt. The frame
ids suggested here (15a onwards) continue that file's numbering so each
handoff maps back to the roadmap.

| # | Prompt | Roadmap | Priority |
|---|---|---|---|
| 1 | Phone views | 3.1 | first |
| 2 | OOP sandbox as an IDE | 1.7 | second |
| 3 | The lab system | 3.3 | third |
| 4 | Dawn and the shop themes | 3.2 | fourth |
| 5 | Profile frames, shelf skins, Shrine styles | 3.2 | with 4 |
| 6 | Focus: stopwatch, study until, mini-player | 1.6 | optional |
| 7 | The topic picker | 1.1 | optional |
| 8 | IT unit grades | 1.2 | optional |
| 9 | Reports: week, month, term, year | 5.1 | next |
| 10 | Code: a C# study space | 5.3 | after 9 |
| 11 | Money and Goals | 5.4 | with 10 |
| 12 | Japanese: a study space for the four skills | 5.5 | now (slice closed) |
| 13 | Exams & Deadlines Hub | 5.8 | after FSRS (released) |
| 14 | The iPad and the Pencil | 6 | now (layout released) |
| 15 | Creatives: art, design, editing, writing | 5.7 item 3 | with 14 |
| 16 | Mind: psychology and philosophy | 5.9 | after 15 |

---

## 1 · Phone views

```text
Design the phone version of KurenaiOS, continuing the approved "Graphite" file in this project (frames 7a–14c are the desktop screens and stay the source of truth for look, tokens, type and copy). Number the new frames 15a onwards.

Canvas: 390 × 844 (iPhone), with a second width check at 360 for the smallest layouts. Respect the top notch and bottom home-indicator safe areas. Everything uses the existing Graphite tokens (--bg, --s1, --s2, --s3, --line, --text, --text-2, --muted, crimson, teal, amber, green, red, gold, bloom, the three subject hues and four medium hues), Onest / JetBrains Mono / Shippori Mincho / Newsreader, the same radii and chip/button language. No new colours.

Hard rules from the app:
- Touch targets at least 44px. Text never below 11px. Text inputs 16px (so iOS does not zoom).
- Primary navigation is a bottom tab bar: 灯 Home, 学 Study, 整 Productivity, 蒐 Collection, and 余 More. More opens a bottom sheet with 守 Governor, 助 Assistant, 蔵 Archive.
- The header keeps: the bloom logo, a search button (opens a full-screen search sheet with results grouped by domain), the bell, and the sync dot. Show the header in its compact form.
- Filters, section switches and side panels become bottom sheets. The same controls move into the sheet; nothing is duplicated on the page.
- No sideways page scroll. Rows of cards that do not fit become a declared horizontal scroller with visible edge.
- Flat surfaces, no card inside a card, one primary button per region — as on desktop.

Frames to draw (with real-feeling sample data, like the desktop frames):
15a Shell: header, bottom tabs, the More sheet open, the search sheet with results.
15b Home: hero (greeting, level, HP, the daily list, Start focus), Routines and Reminders, Up next, Today/Upcoming, Study hours, Week's plan — in one scrolling column. Also the Critical-HP variant of the hero.
15c Study subject desk: subject card with paper breakdown, Continue / Weakest, course units as a horizontal scroller.
15d Topic page: title and path, the material tabs (Notes, Spec, Flashcards, Quiz, Exam, Worked, Simulate, Files) as a scrollable tab strip, a notes page with its page stepper. The spec spine as a left drawer (open state), and the inspector (status, R/A/G confidence, checklist, quick note, Ask Kurenai) as a bottom sheet (open state).
15e Flashcards and Quiz on a phone: the card with its flip, rating buttons within thumb reach.
15f Focus: the running timer full screen, and the minimised dock (two rows, sitting above the tab bar).
15g Calendar: a day/agenda view and the month grid; the add-event sheet.
15h Reminders and Habits: the list with smart sections as a switch, add field, a habit's 12-week grid made to fit.
15i Pacing: the week page with the three subject columns stacked, carried-over rows, lesson ticks; the braid as a horizontally scrolled diagram with a pinned key column.
15j A Collection vault (Anime): spotlight hero, the grid of cover cards (2 per row), the filter sheet; and the record editor as a full-height sheet with its tabs.
15k Governor status and the Gold Shop.
15l The Assistant: chat full screen with the composer above the keyboard, and the drawer version.
15m Archive: Backup & Restore and Notifications.

For each frame, note in a caption what moved into a sheet or drawer and what was dropped from the desktop version. Keep copy identical to desktop wherever the same element appears.
```

## 2 · OOP sandbox as an IDE

```text
Redesign the "C# OOP Architecture Sandbox" lab in KurenaiOS as a small IDE, continuing the approved "Graphite" file in this project (reuse its tokens, type, card and button language; the current lab chrome is frame 8h). Number the frames 19a onwards. Desktop 1280 wide.

What it does today: you add class blocks on a small 2D canvas, give each a name, mark it abstract, add fields (access, type, name) and methods (access, return type, name, none/virtual/override/abstract), click "set base" and then another class to draw an inheritance arrow, and the C# for the whole model rewrites itself in a code panel (Copy C#, Clear sandbox). A first visit shows example classes. It feels cramped: every class is squeezed into a tiny card.

The new design:
- The sandbox takes most of the screen (the main rail may collapse to its 72px icon form).
- Left: a file tree — one file per class (Animal.cs, Dog.cs…), with add / rename / delete, abstract classes marked, inheritance shown as nesting or a small badge.
- Centre: the editor for the selected class. Structured, not free text: the class header (name, abstract, base class picker), then field rows and method rows that read like code (access · type · name, the modifier as a chip), with add-row buttons in the flow. Syntax colours as in frame 8j's code block.
- A Code | Diagram toggle at the top. Diagram is an infinite canvas: pan by dragging, zoom with a zoom control and "Fit", class cards readable at 100%, inheritance arrows with the UML hollow triangle, abstract names in italics, a minimap in a corner.
- A generated C# panel that can be opened beside the editor or as its own tab, with Copy C#.
- Clear sandbox stays, and asks first.

Frames:
19a Code mode with three classes, one selected.
19b Diagram mode, the same model, mid-zoom, with the minimap.
19c Diagram mode, empty state, with the first "Add class" call to action.
19d The generated C# view.
19e Adding a method: the row in its editing state (pickers open).
19f A validation state: a duplicate class name or an inheritance cycle.
```

## 3 · The lab system

```text
Design a reusable "lab system" for the interactive simulations in KurenaiOS, continuing the approved "Graphite" file in this project (current lab chrome is frame 8h: a card, mono pill controls, a stage on --s3). Number the frames 20a onwards. Desktop 1280; also show each archetype at 720 wide, because the same lab is embedded in a topic page's Simulate tab, which is narrower.

The problem: there are about 55 simulations, plus a Trace Lab and a Worked Example engine. Many look rough, and several draw past the edge of their area (the linked list and binary tree run off the stage). I don't want 55 designs — I want a small set of archetypes every sim can be rebuilt on.

Every lab shares: a header (title, spec reference, Open topic page), a control bar (buttons, sliders, number inputs, toggles, a Step / Run / Reset group), a stage with a fixed aspect ratio that never overflows (content that is too big scales or pans, with a Fit control), a readout area (live values, the current step's explanation), and an optional legend. Canvas colours come from the Graphite tokens; subject hue for the main ink (CS teal, Maths violet).

Archetypes to design (one frame each, with a real example in it):
20a Data-structure diagram — nodes and pointers: linked list (8 nodes, head/tail, a node being inserted), binary search tree (15 nodes, a search path highlighted), hash table with probing. Show how it handles more nodes than fit.
20b Graph and algorithm — Dijkstra / BFS vs DFS: weighted graph, visited/frontier states, the queue or stack beside it, a step log.
20c Function plot — the maths sims (trapezium rule, Newton–Raphson, normal distribution shading, projectile): axes, gridlines, shaded areas, sliders, a values readout.
20d Bits and registers — binary register, floating point, bitmap lab, ASCII/Unicode: rows of bit cells, grouping, the decoded value.
20e Machine and tape — Turing machine, finite-state machine, fetch–execute cycle: states, transitions, the head, a transition table.
20f The Trace Lab — code panel with the running line lit, the structure being traced, and the trace table growing row by row.
20g Worked examples — paper pills, generator tabs, New numbers, the question, steps revealed one at a time with the M1/A1 mark pills.
20h The Simulations index — a categorised, searchable card grid, and "More in this area" on an opened sim (currently a wall of pill buttons; design something cleaner).

Also give one frame (20i) for the locked state: the lab behind a Gold Shop unlock, with the price and "Open the Gold Shop".
```

## 4 · Dawn and the shop themes

```text
Design the theme system for KurenaiOS, continuing the approved "Graphite" file in this project. Graphite (dark) is the only theme so far. Number the frames 21a onwards.

Part 1 — Dawn, the light theme. Give a complete token table that maps every Graphite token to a Dawn value, in oklch: --bg, --s1, --s2, --s3, --line, --text, --text-2, --muted, --crimson, --crimson-ink, --teal, --amber, --green, --red, --gold, --bloom, the three subject hues (CS, Maths, IT), the four medium hues (Anime, Books, VN, Games), and the floating-layer shadow. Every text role must pass WCAG AA on every surface; show the contrast table. The hierarchy must match Graphite's: surfaces are separated by value, not by borders; no nested cards.
Then redraw four existing frames in Dawn so I can compare them side by side: 7a Home, 8b the topic page, 11b a vault, 12a Governor status.

Part 2 — the 23 Gold Shop themes. Each is only a set of token overrides on top of Graphite (a dark theme) — no layout changes. For each theme, give the token values and show it on one specimen board: the same three pieces for all 23 (the Home hero strip, a card with a progress bar and chips, and a small bar chart), plus the four-colour swatch that appears in the shop. Keep subject hues distinguishable and text AA in every theme. The themes and their briefs:
Spectral Rose — blue-black lacquer, wine red, cyan rim-light and ember orange.
Verdigris Duel — charcoal, oxidised teal, fog white and restrained rust.
Sakura Skyline — deep indigo city-night with periwinkle, electric blue and sakura pink.
Starfall Serenade — midnight plum, smoky violet, coral horizon and cold starlight.
Feathered Dusk — ink mauve, dusty rose, blue-grey and pale blush.
Rosewater Abyss — near-black marine blue, pearl aqua, coral petals and pale gold.
Clinic Noir — sterile slate, charcoal, pearl and faint blush reflections.
Azure Corset Noir — midnight blue, icy porcelain, graphite lace and cardinal ribbon.
Shattered Bloom — blue-black, electric cyan, hot pink and ultraviolet.
Scarlet Garden Night — dark sage, blackened porcelain, scarlet silk and muted stone.
Midnight Lilies — ink-black water, moon-white petals, slate and muted sage.
Gothic Camellia — deep navy, magenta velvet, antique brass and smoky violet.
Rain Café — deep teal glass, rain-blue neon, warm peach and coffee cream.
Porcelain Sky Night — navy-black, powder blue, porcelain highlights and a clean red bow.
Crimson Moth — absolute black, blood-red wings, bone white and smoke brown.
Celestial Duality — black void, ultramarine, ice-white, cyan and silver.
Jade Camellia — forest black, jade leaf, olive gold, coral flower and parchment.
Ember Wraith — midnight navy, dark crimson, rose flame and ice-blue eyes.
Solar Manuscript — charcoal ink, saffron, engraved gold, lavender-grey and ivory.
Violet Requiem — midnight indigo, hydrangea violet, pale lilac, rose and white cloth.
Rosarium — black rose garden, oxblood, petal pink, ivory and antique brass.
Lycoris Radiata — sumi black, scarlet filaments, ember orange and pale bone.
Azure Butterfly — night-sky blue, luminous aqua, pearl, silver and soft lilac.

Two free house themes exist in the shop as "Atelier Dawn" and "Atelier Dusk": treat Dawn (Part 1) as the new Atelier Dawn and Graphite as the new Atelier Dusk, and give both a swatch too.

Last frame: the Gold Shop's Themes department showing these swatches as purchasable cards, owned vs for sale, and the theme picker on the Avatar page.
```

## 5 · Profile frames, shelf skins, Shrine styles

```text
Design the cosmetic items sold in the KurenaiOS Gold Shop, continuing the approved "Graphite" file in this project (the Governor frames 12a–12d, the Books shelf in 11d, the Shrine in 11g and its share card in 11k). Number the frames 22a onwards. Cosmetics only change decoration, never layout.

22a Profile frames — the ring around the avatar in the rail's profile chip, the profile popover and the Home hero. The default ring is the HP ring (green when healthy, crimson in Critical); a frame decorates around it without hiding the HP reading. Four frames: Gilt ring (gold), Kurenai bloom (crimson petals, the brand bloom), Jade band (green), Amethyst orbit (a violet ring — the IT hue). Show each at 38px (rail), 64px (popover) and 120px (hero).
22b Books shelf skins — the physical-books shelf where volume spines stand side by side (frame 11d). Three skins: Walnut grain, Black lacquer, Vermilion shrine (torii-red boards, the shelf as a small shrine). Show each with 12 spines of mixed heights and colours, and the default (unskinned) shelf for comparison.
22c Shrine styles — the Shrine hall of fame: the podium (ranks 1–3) and the ledger of the rest. Three styles: Gilded torii (double gold borders on every enshrined card), Ink brush (sumi ink strokes, monochrome covers), Neon shrine (glowing edges). Show the podium and three ledger rows in each.
22d The share card (the exportable image from 11k: full-art, the cover as the background, text overlaid) in the default and each of the three Shrine styles.
22e How these items look as cards in the Gold Shop (price, owned, preview) and where they are equipped on the Avatar page.
```

## 6 · Focus: stopwatch, study until, mini-player

```text
Extend the Focus Timer in KurenaiOS, continuing the approved "Graphite" file in this project (Focus is frames 10a–10b: setup, running, minimised, completion). Number the frames 16a onwards. Desktop 1280.

New:
- Two new modes beside Pomodoro and Custom: Stopwatch (counts up until I press Stop) and Study until (I pick a clock time, e.g. 21:30, and it counts down to it). Design the mode switch in the setup panel with all four modes, and the setup fields each mode needs.
- Rewards: Stopwatch and Custom earn a base award for every full 10 minutes. The setup and the running screen should show what the session has earned so far and when the next 10-minute award lands (a small progress tick), without cluttering the timer.
- The minimised mini-player can be dragged anywhere on screen and resized (a compact size showing time and pause, a larger one adding the linked topic and the next award). Show it docked in a corner, being dragged (with snap guides to the edges), and in both sizes.

Frames:
16a Setup with the four-mode switch, Stopwatch selected.
16b Setup, Study until selected (time picker, the computed duration).
16c Running, Stopwatch (time counting up, earned so far, next award).
16d The mini-player, small and large, docked bottom-right over a page.
16e The mini-player mid-drag with snap guides.
16f The completion screen for a stopwatch session (duration, awards earned, pauses; zero counts are not shown).
```

## 7 · The topic picker

```text
Design one reusable topic picker for KurenaiOS, continuing the approved "Graphite" file in this project. Number the frames 17a onwards.

The specification is a tree: unit → parent topic → leaf (for example: Fundamentals of programming › Programming › Data types — AQA 7517 4.1.1). Three subjects: CS (teal), Maths (violet), IT (pink-violet). Today several forms ask for a "related topic" as free text; this picker replaces all of them: Assignments, Exams & Papers, Focus setup, the Calendar study block, and Pacing's row editor.

The picker:
- A field that shows the chosen topics as chips (subject hue dot, reference, short title, remove ×).
- Clicking opens a dropdown panel: a subject switch, a search box (matches reference or title), and a three-way level switch — Unit / Parent / Leaf — that decides what a click selects. The tree below shows the chosen level as selectable rows, with the levels above as headings.
- Multi-select, with a count and Clear; keyboard navigable.
- A single-select variant for places that allow only one topic.

Frames:
17a The field, empty and with three chips of mixed subjects.
17b The open panel, Leaf level, searching "hash".
17c The open panel, Parent level, with two parents selected.
17d The same picker inside the Assignment editor (so it is seen in context).
```

## 8 · IT unit grades

```text
Design an "IT units" panel for the IT subject desk in KurenaiOS, continuing the approved "Graphite" file in this project (the subject desk is frame 8a). Number the frames 18a onwards.

The qualification is OCR's A-level-sized IT qualification (units F200–F206), graded on the total of the units taken: every unit is worth 60 UMS (exam units F200/F201 are marked out of 60 raw, 1 raw = 1 UMS; NEA units F202/F204/F206 out of 24 raw, 1 raw = 2.5 UMS), five units make 300 UMS, and 270/300 is a Distinction*. I took F200 and F202 in Year 1 (done, with marks), I'm sitting F201, F204 and F206 in Year 2. F203 and F205 are not taken and no longer exist anywhere in the app — do not draw them.

The panel:
- A table of units: unit code and name, year, status (Done / Sitting — with the exam date if known), the raw mark out of its maximum and the UMS out of 60, the grade that mark gets, and a small bar against the unit's boundaries.
- The grade boundaries — per unit Pass, Merit, Distinction; for the qualification also Distinction* — shown in a way that reads at a glance.
- The aggregate: total marks so far out of the maximum for the units counted, the overall grade that total gets, and "to reach Distinction* you need N more marks across F201, F204 and F206 — about X per paper", with a target-grade picker.
- Entering a mark when a result arrives (an inline edit on the row).

Sample data: F200 51/60 raw (51 UMS), F202 54/60 UMS, Year 1 grade Distinction; the Year 2 units not yet sat — so 105 of 300 banked, and a Distinction* needs 165 more, 55 UMS per unit (55/60 on F201, 22/24 on each NEA). Boundaries (UMS): a unit is Distinction 48, Merit 36, Pass 24 — units have no Distinction*; the Extended Certificate is Distinction* 270, Distinction 240, Merit 180, Pass 120. A UMS converted from a raw mark is an estimate until the results slip gives the real one.

Frames:
18a The panel on the IT desk, Year 2 in progress.
18b Entering a new mark on F201.
18c The same panel at the end of Year 2, all units done.
```

## 9 · Reports: week, month, term and year

```text
Design a Reports feature for KurenaiOS, continuing the approved design in this project: Graphite (Atelier Dusk) and its light twin Dawn, the phone views (frames 15a–15n) and the rest of design part 2 (frames 15–23). Number the new frames 24a onwards. Desktop 1280; phone 390 × 844, checked at 360. Use only the existing tokens, type scale, cards, stat tiles, tabs, chips and chart styles — this is a new page in the same system, not a new look.

What KurenaiOS is: my study companion for A-levels (AQA Computer Science teal, Edexcel Maths violet, OCR IT pink-violet) plus my productivity tools and my media Collection, with a Governor (XP, gold, HP, streaks) and an AI assistant, Kurenai. Areas: Study (specification topics, notes, flashcards with spaced repetition, quizzes, exam questions, Exams & Papers results, IT unit marks), Productivity (Focus timer sessions, calendar, reminders, tasks and habits, assignments, the weekly plan with class vs my plan, carry-overs and the "braid" alignment graph), Collection (anime, books, visual novels, games, the Shrine, the Budget Planner and goals), the Assistant (conversations, scheduled messages), and my profile (level, XP, gold, HP, study and rest streaks, cosmetics).

The idea: like Claude's "Reflect" page — a headline, a short narrative paragraph, a row of facts (most active day, peak hour, totals), an activity chart with a Conversations/Time toggle, a "what it was about" bar split by area, then cards — but across the whole app. Four periods, each deeper than the last:
- Weekly (Mon–Sun): what moved — study time and sessions, cards reviewed and recall %, topics touched and status changes, Focus blocks, the plan's ticks and carry-overs, tasks/reminders/habits done, what I watched, read and played, XP, gold, streaks.
- Monthly: adds comparison with last month (up/down, never a bare zero), busiest day and hour, subject balance, mastery change by unit, Collection completions and score spread, Assistant use.
- Termly (the school term from the plan): adds the plan against class (ahead / aligned / behind), exam and paper results with grades, IT unit marks, weakest and strongest topics, Focus habits (when and how long I actually focus).
- Yearly (the academic year, Sept–Aug): adds the long view — a month-by-month strip, every graded result, the year's Collection, records (longest streak, longest Focus, best recall week) and milestones.
Each section links to the page it summarises. Depth should feel earned: a weekly report fits on roughly one screen; a yearly one is a long, scrolling read with chapter-like section heads.

Two ways the words are written, both designed:
- Template (default, offline, free): sentences built from the numbers by rule — plain, factual, consistent.
- Kurenai: the assistant writes the headline and narrative from the report's totals (never raw notes or titles), as one request. Show the switch between them, a "Written by Kurenai · regenerate" mark, the generating state, and a failure that falls back to the template without losing the page.

Rules from the app that the design must keep:
- A zero that is only a supporting fact is not printed; a zero that is the point stays.
- A chart needs enough evidence to make a claim: show an honest low-data state (first week, a quiet month) instead of an empty chart.
- Labelled axes and marks, an 11px label floor; subject hues for subject data; status colours (behind, overdue) are the fixed alarm red, never the theme accent.
- Rewards are reported, never promised.
- Reports are saved, so a past week reads exactly as it was; a Monday morning notification ("Your week in review is ready") opens the latest.

Sample data for the weekly frame (w/c 5 Oct 2026): 11 h 40 m studied across 14 sessions (CS 5 h 10, Maths 4 h 50, IT 1 h 40); 312 flashcard reviews, 86% recall; 9 topics touched, 3 moved to Green; Focus 21 blocks, longest 70 min, Wednesday 19:00 most focused; plan 6 of 8 personal rows ticked, 2 carried over (Maths P4 binomial, CS 4.10 normalisation); 17 reminders and 4 habits kept; Collection: 3 anime episodes, 1 visual novel route, 2 volumes read; +1,240 XP, +96 gold, study streak 12 days, rest streak 4; Kurenai 9 conversations, the 07:00 plan sent 5 times. Headline example: "A Maths-heavy week that kept the streak alive." Use plausible scaled-up numbers for month, term and year (term: Mock exam Maths 71% A, CS Paper 1 practice 58/75; IT F201 sitting in January).

Frames:
24a Reports page: period switch (Weekly / Monthly / Termly / Yearly), the latest report open, earlier reports listed (date range, headline, a small spark).
24b Weekly report, full (template words).
24c Monthly report, full, with comparisons to last month.
24d Termly report: the plan-against-class section, results and weakest/strongest topics.
24e Yearly report: the opening screen and one deeper section further down (records or the month-by-month strip).
24f The words: the Template/Kurenai switch, generating, written-by-Kurenai with regenerate, and the fallback after a failure.
24g Low-data states: a first week, and a month with one study day.
24h The Home card for the latest report, and its notification in the bell.
24i Phone: weekly report.
24j Phone: yearly report, scrolled to a deeper section.
24k Share / export: the report as a share card (the existing share-card finish) and the export options.
24l Dawn: the weekly report in the light theme.
```


## 10 · Code: a C# study space

The agreed scope is [code-plan.md](code-plan.md) revision 2. This prompt
designs the **initial release (R1–R4: the core path, Bridge B, the Rider
workflow, GitHub)** and only the *frames that show* the later tracks (the
curriculum map and one track page). It does not design every track.

```text
Design the Code space for KurenaiOS, continuing the approved design in this project: Graphite (Atelier Dusk) and its light twin Dawn, the phone views (15a–15n), the OOP IDE (19a–19f), the lab system (20a–20i) and Reports (24a–24l, 25a–25g). Number the new frames 26a–26x. Desktop 1280 wide; phone 390 × 844, checked at 360. Use only the existing tokens, type scale (Onest for UI, JetBrains Mono for code — never ligatured), cards, stat tiles, tabs, chips, dialogs, the lab system's text kind, and the existing chart styles. Show every frame in Graphite; frame 26x shows Dawn.

FOURTH SUBJECT HUE. Code is a fourth study space beside AQA Computer Science (teal), Edexcel Maths (violet) and OCR IT (pink-violet). Propose a fourth hue that is clearly distinct from all three AND from the crimson accent and the status colours (amber, green, the fixed alarm red), passes WCAG AA as text and as a chip outline on both Dusk and Dawn, and works as the editor's focus ring. Show it as a swatch card beside the existing three, in both themes, with contrast ratios.

WHAT THE SPACE IS. A space for learning C# and, later, wider programming and computer science. It has the same structure as the other subjects (a spine of units and lessons on the left, the inspector, status and mastery bands, Focus and the topic picker all work) and adds: a curriculum in stages (Foundations; Working with data; Bridge B "Your real toolkit"; Object-oriented C#; Professional practice), each ending in a capstone; lessons whose notes are a long-term REFERENCE, not a short intro; an editor that runs the learner's code ON THE DEVICE and checks it against hidden tests; a Daily 20 task; retrieval that brings early skills back; katas and debugging drills; multi-file projects; real-IDE projects built in JetBrains Rider and validated by a script whose JSON report is imported back; and an optional GitHub repository ("Kurenai Programming") that receives the learner's work. Every item is tagged with strands: L (C# and .NET), E (software engineering), S (computer science).

RULES THE DESIGN MUST KEEP
- Nothing is ever locked. Content beyond the learner is "Recommended later" (a calm label, dashed outline), never greyed out, hidden or padlocked.
- A zero that is only a supporting fact is not printed. A chart needs enough evidence to make a claim; a brand-new learner sees honest low-data states, not empty grids.
- Status colours (a failing test, a compile error, a rejected report, a failed push) are the FIXED alarm red, never the theme accent. Nothing relies on colour alone: every pass/fail has an icon AND a word ("✓ Pass", "✗ Fail"), every age band also prints its number of days.
- Rewards are REPORTED, never promised in advance. A first pass pays once ("+18 XP · +2 gold · +3 HP"); a re-run, a seen answer or a repeat retrieval shows "No reward" calmly with the reason. Phone tasks are visibly marked "Phone task · reduced reward".
- Learner code runs on the device. Anything sent to the Assistant (Kurenai) is on request only and is preceded by a "What is sent" dialog that lists exactly the items.
- Real-IDE work is presented honestly: "Built in Rider", never a fake in-browser simulation. Evidence has three levels shown as a small badge everywhere it appears: "In-app" (verified), "Self-run" (from the learner's machine), "CI-verified" (GitHub Actions).
- The five breakpoints are 1240, 1080, 860, 700 and 560; phone composition starts at 700 (bottom tabs, the canonical tree drawer, bottom sheets, 16px inputs, safe areas). Touch targets 44px on coarse pointers; round controls stay round.
- Accessibility: every frame keyboard-complete with visible focus; the editor's keyboard model is Tab/Shift+Tab indent, Enter keeps indentation, Ctrl/⌘+Enter runs, and "Esc then Tab" leaves the editor (show the hint line in the editor's status bar); the results list is a real list announced through one polite live region; dialogs trap and restore focus, danger dialogs focus Cancel; reduced motion removes all transitions; the lesson's table of contents is a nav landmark.

SAMPLE DATA (use consistently)
Learner in unit 5 (Text: strings, parsing, formatting) of the core path; 38 of ~121 core lessons done; study streak 12 days. Capstone 1 "Text adventure engine" passed (In-app). Daily 20 today (Tuesday): "Word frequency counter" — Core tier, practises 5.2 Split and Join mixed with unit 4's Dictionary ("Chosen because you finished 5.2 yesterday and have not proven it in code yet"). One retrieval: "Swap two variables without a temp" (unit 1, last proven 41 days ago). 6 retrievals due. Weekend project "Library fines calculator" (in-app, four milestones, 3 of 10 tests passing). Rider project "Contacts on SQLite" (Bridge B taster): milestone 1 Self-run ✓, milestone 2 failed in the last report (9 passed, 1 failed: Milestone2.CappedAtFivePounds). GitHub: connected to private repo "kurenai-programming", mode "Batched automatic", 2 commits waiting (offline). Task results: 5 of 6 cases pass, hidden case 4 fails with a line diff; a compile error CS0103 "The name 'totl' does not exist in the current context" with the plain-words explanation "You used a name C# has never seen at this point" and the cause "a typo, or declared inside a block and used outside".

FRAMES

26a Code home (desktop). Hero: today's Daily 20 card (title, tier chip, concept chips, "about 20 minutes", the one-line reason it was chosen, Start; "+ 1 retrieval" secondary). Retrieval due (big number, the top three with unit and days). The stage path: stages as a horizontal track with unit squares (done / current / recommended later) and capstones as diamond checkpoints between stages (passed / next). Skill map summary (counts per age band, "Getting rusty" top three with Prove it). This weekend's project. A "For the computer" list (items saved on the phone). Status line: runner ("In-app · offline"), full runtime ("not downloaded — offered at unit 7"), GitHub ("2 commits waiting"). States to annotate: a review week (every 4th week: "Review week — a mixed set from earlier units"), a capstone weekend (the capstone replaces the project).

26b Curriculum map. The core path as the spine (stages, units, Bridge B between stages 2 and 3, capstones), then "Deepening" modules and "Tracks" as optional branches with their prerequisites drawn as concept requirements ("needs: events, async"), strand chips (L/E/S), a "Where it runs" badge per lesson group ("In-app", "In-app sandbox", "Rider", "External tools"), a lesson count, and a taster project. Show tracks not started, one track started (T2 UI & Desktop), and a strand filter. Annotate that order is a recommendation and everything opens.

26c Lesson — Learn mode (desktop). Lesson 4.3 "Counting with Dictionary". Header: title, unit, strands, concepts, prerequisites, "Core 25 min · full 70 min", the AQA cross-link chip ("↔ AQA 4.2.1"). The quick reference card at the top (one screen: syntax, five things to remember, the errors you will meet). Sections as numbered pages with a page bar (1 Problem · 2 Core · 3 Rules · 4 Variations · 5 Under the hood · 6 Pitfalls · 7 Choosing · 8 Performance · 9 Connections · 10 Good practice · 11 Advanced · 12 Practise). Show page 6 Pitfalls: a runnable broken example per pitfall (CS1061 on .Length, KeyNotFoundException, modifying while enumerating), each with its error card. Show a runnable, editable listing inline (editor, Run, output). The Advanced section collapsed with "Recommended after unit 9". Notes stay in short lines and bullets with annotated diagrams; long-form never becomes a wall of text.

26d Lesson — Reference mode (desktop), the same lesson as the learner returns months later: every section expanded, a sticky table of contents (nav) with the current section marked, in-lesson search with match highlighting, the quick reference card pinned, section 7 "Choosing" as a comparison table (Dictionary vs List vs HashSet vs SortedDictionary vs array) and section 8 performance (O(1) average, O(n) worst), the "Connections" panel with back links, forward links ("U9 GroupBy", "U12 hash tables from scratch") and practice links with the learner's status. A "Revisit" banner variant: "You reached unit 9 — section 11 is now recommended".

26e Lesson practice tabs: Predict the output (the learner types the output; checked by running), Fill the gap (inline gap inputs inside highlighted code; any answer whose program works is right), Find the bug (editor + expected output), Flashcards (self-graded Again/Hard/Good/Easy), Quiz. One frame with the five as a strip of small panels, each in its answered state.

26f The task editor (desktop) — the Daily 20. Left: statement, Examples table, "+ 3 hidden cases", the hint ladder (three rungs: Nudge, Pointer, Shape of the answer; locked rungs are "after the one above", not padlocks), "See the answer…". Right: the editor (gutter, file tab, status bar with the keyboard hint), Check against the tests (primary), Run with an input box, output. Show these states as a set: idle; running (busy indicator, editor read-only); all pass with the reward line; 5 of 6 pass with the hidden-case line diff ("The input of a hidden case stays hidden"); compile error CS0103 with the line marked in the gutter and the plain-words card; runtime exception (IndexOutOfRangeException with "Usually because: a loop with <= Length"); timeout ("Did not finish — is there a loop whose condition never becomes false?"); "No reward — already passed"; "No reward — you opened the answer".

26g Dialogs and runtime states: "See the answer?" confirm (danger dialog, Cancel focused); the full .NET runtime offer the first time a lesson needs it ("Unit 7 runs on the full .NET runtime. Download once (size from the spike), kept offline afterwards", with Download / Not now); the download in progress and ready states; an "In-app runner can't run this yet" card for a feature beyond it, with the honest reason.

26h Retrieval session. A due list on the left ordered by priority, the current card on the right: prompt, "Variation 4" with its parameters, a small editor, Run and check, Hint ("grades it Hard"). States: proven (grade chip "Easy" and "derived, not self-reported: first try, no hint, 1m 12s", next review "in 9 days", "+4 XP · retrieval rewards today 3 of 10"); a rule broken ("It prints the right thing, but the card asks for it without a temporary variable"); Again; the daily cap reached ("still counts on the schedule"). A small "Next reviews will ask…" table showing three upcoming variations.

26i The skill map. Concepts as chips grouped by unit, coloured by days since last proven (≤7, 8–21, 22–40, 41+), each printing its days; "studied, not proven" outlined; "recommended later" dashed. A strand filter (L/E/S). A concept opened in a side panel: when it was last proven and by what (a task, a retrieval, a project milestone), its skill cards, Prove it now. "Getting rusty" list.

26j Katas and drills, four panels: Find the bug (fixed state with the bugs explained); Read and explain (explanation box, Compare with the model answer, "✦ Ask Kurenai for feedback…" opening the What is sent dialog listing "the listing (shipped)" and "your explanation, 84 words"); Refactor to a smell list (tests must stay green; a live smell meter of four checks); Write the tests (results: "✓ 6 tests pass on the correct version", "Caught 3 of 4 broken versions", the survivor described after a second try).

26k In-app project workspace (Library fines). A file tree (LibraryFines/, Models/, Services/, Tests/ marked read only), file tabs, the editor, "Run milestone tests" and "Run the program (milestone 4 script)", a milestones column (progress per milestone with the first failing assertion), and tabs Workspace · Brief & milestones · Architecture (a one-way dependency diagram: Program → Services → Models, Tests → Services/Models) · Export. Show the scaffold state and the all-green state.

26l Capstone checkpoint: a seven-step stepper (Closed-book quiz · Brief · Build · Rubric · Kurenai review · Write-up · Result). Show the quiz answered ("4 of 5 — the brief is open"), the rubric (correctness filled automatically from acceptance tests; other rows self-marked), the Kurenai review's What is sent (the files the learner ticked + rubric + brief), and the result ("Capstone passed — Stage 3 is now recommended. It was never locked." + the once-only reward + "added to your yearly report").

26m Rider project hub ("Contacts on SQLite"). Tabs: Overview · Requirements · Setup · Validation · History. Overview: brief, milestones with each check labelled "Automated" or "Manual (rubric)", evidence badges per milestone. Setup: numbered steps (Export zip or clone from GitHub → open the .sln in Rider → run the shared "Kurenai Validate" configuration, or the terminal command `dotnet run .kurenai/validate.cs`) with copy buttons. Validation: what the script checks (build via compiler diagnostics, tests via the test report, scripted runs, protected files unchanged), and "Bring in a report". History: every imported report (date, evidence level, pass counts, commit, "changed since validation" flag).

26n Import a validation report. A drop zone and file picker; when GitHub is connected, "Found 1 new report in the repository". A preview dialog before anything changes: project, scaffold version, validator version, machine and SDK, steps with exit codes (build ✓, tests 9 passed / 1 failed), milestones that will change. Then the outcome states: Accepted (milestone 1 passed, reward line); Practice only — "The shipped tests were changed (2 files), so milestones are not marked"; Rejected — not one of your projects / unknown scaffold version / validator too old / not a valid report / dated in the future; Already imported (no change); Changed since validation (a newer commit exists).

26o Export and portfolio. The export dialog (what the zip contains: .sln, src, tests with xUnit, README from your brief and write-up, .gitignore, the validator, the Rider run configuration; "Nullable: off until unit 7"). The portfolio page: finished projects and capstones as cards with write-up excerpts, evidence badges, last-validated commit, "Open on GitHub" when connected; an empty state.

26p GitHub connection (Settings › Code › GitHub). A setup wizard: 1 "Create a private repository on GitHub yourself" (the app never creates it), 2 connect (GitHub App sign-in, or a fine-grained token limited to that one repository, entered by the learner), 3 checks (repo found, Private ✓, empty or Kurenai manifest), 4 consent: exactly which paths will be written, a sample commit, and the mode (Off · Checkpoints only · Batched automatic; Off is the default). A status panel: mode, last push, the outbox ("2 commits waiting — offline"), failures ("Push failed — retrying in 4 min"), "Reconnect GitHub" when the token expired, a conflict ("Your repository changed in the same files. Saved to branch kurenai/conflict-20261013 — resolve it in Rider"), and the blocking secret-scan dialog ("This file looks like it contains an API key (line 12). It was not pushed.").

26q Checkpoint and commits. The Checkpoint dialog (files that will be committed, an editable message, Commit / Cancel), the batched practice commit preview ("Practice 13 Oct: 2 tasks, 1 kata"), and a commit's place in the project history.

26r Code settings and runtime: runner status, full runtime (not downloaded / downloading with size / ready / offline-unavailable), storage used by Code, practice focus (core only ↔ 50/50 with a started track), phone options, GitHub section link, "What is never sent".

26s Empty and low-data states: first visit (one sentence and "Start unit 1"), no retrievals due ("Nothing due — the next one is tomorrow"), a skill map with nothing proven, no projects yet, no reports yet, GitHub not connected (a calm invitation, not a nag), offline.

26t A track page: "T2 · User interfaces & desktop apps (Avalonia)". Overview, strands, prerequisites met/missing as concept chips with links to the lessons, "Where it runs: Rider" with a one-line why, the lesson list grouped by part with "Where it runs" per group, the taster project ("Your first window") available now, the track capstone, and "Add to practice" (joins the daily pool).

26u Phone: Code home (Daily 20 card, retrieval, path compressed to the current stage, "For the computer" list) and a lesson in Reference mode (the quick reference card first, the table of contents as a bottom sheet, runnable examples full width).

26v Phone tasks: a unit-2 phone task (a short program, the symbol key bar `{ } ( ) ; " = < >` and Tab above the keyboard, "Phone task · reduced reward", results as a list) and a unit-6 task showing "Best on a computer" with the statement readable and "Save for the computer".

26w Phone: a retrieval card (predict and fill variants), and a Rider project's status (milestones with evidence badges, the last report, read-only).

26x Dawn: the task editor (26f, the 5-of-6 state with the compile error) and the lesson in Learn mode (26c) in the light theme.

DELIVERABLE NOTES. For every frame annotate: the interaction states listed, focus order, what is announced in the live region, the empty/error states, and what changes at 1080, 860, 700 and 560. Mark any new component (the editor, the results list, the hint ladder, the evidence badge, the stage path, the skill chip, the quick reference card) with its states so it can be built once as a shared primitive. Keep copy short and calm, in British English.
```

## 11 · Money and Goals

The agreed scope is [ROADMAP.md](ROADMAP.md) 5.4. Revised 19 October 2026
for the Claude Design project on the second account. That project holds the
earlier handover packages as attachments and is linked to the GitHub
repository, so the prompt points at both rather than at frames only the
first account's project could open.

```text
Redesign the Budget Planner and Goals for KurenaiOS, continuing the approved design. The earlier handover packages are attached to this project: Graphite (Atelier Dusk) and its light twin Dawn (frames 7a–14c, 21a–21h), the phone views (15a–15n), design part 2 (15–23), Reports (24a–24l, 25a–25g) and Code (26a–26x). The GitHub repository is linked: treat css/tokens.css, css/themes.css and css/components.css as the source of truth for tokens and components, and read docs/ROADMAP.md §5.4 (the agreed scope) and the invariants in CLAUDE.md. The current pages are js/modules/wishlist.js (Budget Planner) and js/modules/goals.js (Goals). Number the new frames 27a–27s (28a onwards is reserved for the Japanese space). Desktop 1280; phone 390 × 844, checked at 360. Use only the existing tokens, type scale, cards, stat tiles, tabs, chips, dialogs, the topic picker and the chart styles: this extends two existing pages, it is not a new look.

WHAT EXISTS. The Budget Planner is a Collection purchase queue (Want to buy · Waiting for release · Purchased) against ONE monthly limit for Books, Games and Visual Novels, with a month-by-month purchase history chart. Goals has 14 fixed types, nearly all reading the media vault (complete N titles, watch episodes, finish a series, spend below an amount, a manual counter). Both sit under Collection › Planner.

WHAT IS WANTED
- MONEY: a full personal budget. Income and outgoings; transactions with category, payee, note and tags; splits across categories; refunds; transfers between pots that never count as spend. Recurring payments and subscriptions, many categories each with a monthly budget (optional rollover), savings pots (sinking funds), a month view and a year view. The Collection's purchase queue stays as a Wishlist tab and feeds Money when something is marked purchased. No bank connection: entries are typed, imported from a CSV on the device, or made by a recurring rule. One base currency.
- GOALS: one page for goals about Study, Productivity, Money, Code, the Governor and the Collection, including goals that repeat every week or month ("10 hours of study a week") with a history of the periods met or missed. A goal has a target, an optional deadline, milestones and a pace chip (ahead · on track · behind) from the straight-line expectation. A missed goal is kept in history (missed, then archived or restarted), never deleted.
- PLACEMENT: the rail has seven sections (Home, Study, Productivity, Collection, Governor, Assistant, Archive). The Productivity strip today is Focus Timer · Reminders · Habits · Calendar (Pacing now lives under Study). My recommendation is that Money and Goals join that strip (six items) and Collection keeps a Wishlist tab where Planner is; if six is too crowded, propose a new rail group ("Plan and money"). Show the rail and the strip either way, desktop and phone (the More sheet).

RULES THE DESIGN MUST KEEP
- A zero that is only a supporting fact is not printed; a zero that is the point stays. A chart needs enough evidence to make a claim: a month-end projection or "safe to spend today" appears only with enough days of data, otherwise an honest low-data line.
- A balance or an amount is a formatted figure, never a progress bar. A budget's bar shows spend against its budget and is labelled with both figures.
- Behind, overdue, over budget, a missed goal and a failed import are the FIXED alarm red, never the theme accent (shop themes re-tint the accent). Never colour alone: an icon and a word. Category colours come from the shared tokens; the subject hues stay (CS teal, Maths violet, IT pink-violet, Code sky) and a Japanese vermilion is coming, so leave room for a fifth domain hue rather than inventing a palette.
- Money has no rewards and no Governor numbers (XP, gold, HP) anywhere on it. A goal completing says so calmly and promises nothing; a goal about a Governor value (a streak, a level) is display only.
- A privacy toggle hides amounts on screen (show it on and off; hidden amounts keep their width so nothing jumps).
- Recurring bills are computed from ONE rule, never copied: an upcoming occurrence is Confirmed (optionally with a changed amount), Skipped, or left Upcoming. Show all three. Upcoming bills and goal deadlines appear on the Calendar as derived chips.
- Lists are lazy (60-entry batches) and keyboard-complete; amounts are right-aligned tabular figures with the currency; dialogs trap and restore focus, a delete is a danger dialog with Cancel focused, and Delete never sits beside Save.
- Five breakpoints only: 1240, 1080, 860, 700 and 560; phone composition starts at 700 (bottom tabs, bottom sheets, 16px inputs, safe areas); 44px touch targets on coarse pointers, and round controls stay round.
- No dead space: a view fills its width (a side panel, a second column or a grid), never a reading-width block beside an empty column. Check the 1440 composition too.

SAMPLE DATA (use consistently; today is Monday 19 October 2026)
Base currency £. October income £640: part-time job £520 expected on the 28th (not yet received), allowance £120 received on the 1st. Outgoings so far £412. Categories: Food £96 of £120, Transport £34 of £40, Subscriptions £27.97 of £30, Education and exams £85 of £60 (over by £25), Social £48 of £80, Collection £61 of £75 (Books £24, Games £37), Savings £60 (a transfer to pots). A split transaction: Tesco £23.40 = Food £18.90 + Social £4.50. A refund: Steam −£7.99 in Collection. Subscriptions: Crunchyroll £6.49 monthly, Spotify £11.99 monthly (up from £10.99 in September), GitHub Copilot £10 monthly, a domain name £14 a year (£1.17 a month), a Duolingo Super free trial ending 20 October ("cancel before"). Pots: Laptop £420 of £900 by 31 January (£160 a month to stay on track), Exam fees £80 of £160, Holiday £0 of £300. The month starts on the 1st (show the payday option, the 28th).
Goals: Study 10 h a week (this week 7 h 40 m with two days left, repeating, 9 of the last 12 weeks met); 5 topics to Green in Maths Statistics this month (3 of 5, behind pace); Code: pass 10 Daily 20 tasks this month (6 of 10, on track) and capstone 4 (not started, "recommended later"); save £900 for the laptop by 31 January (reads the Laptop pot, on track); a no-spend weekend (met); spend under £75 on Collection this month (£61, on track); finish Frieren (Collection, 24 of 28 episodes); Focus 20 blocks a week (repeating); a study streak of 14 days (Governor, display only: 12 today).

FRAMES
27a Placement: the rail, the Productivity strip with Money and Goals, Collection's strip with Wishlist, and the phone More sheet.
27b Money Overview: income (expected against received, the late-not-missing state), outgoings, left to spend, safe to spend today, the category bars, upcoming bills (next 14 days), the subscriptions total per month, a pots summary, the privacy toggle.
27c Transactions: a searchable list with filters (category, date range, tag, income/outgoing), a split transaction, a refund, a transfer between pots, the add/edit form (a dialog on desktop, a full sheet on phone), bulk select.
27d Budgets: per-category budgets for the month, the over-budget state, rollover from last month, the payday month start, archiving a category, the Collection category with its Books/Games/VN breakdown.
27e Recurring and Subscriptions: the rule editor (every N days/weeks/months/years, day of month, end date), next renewals, per-month and per-year cost, a price-rise note, a trial ending with "cancel before", the Confirm / Skip / Leave actions on a due occurrence, and "Remind me" (it makes a real reminder).
27f Pots: each pot's balance and target, the monthly set-aside, a transfer in or out, and a savings goal reading one.
27g Month and Year views: a month summary (income, outgoings, by category, against last month with "same as" / "new this month", never a bare 0 or +∞%), and a year strip of twelve months.
27h CSV import: choose a file, column mapping, date and sign format, a preview, duplicates found (skip / import anyway), the result with counts; and CSV export.
27i Goals page: domain filter (All · Study · Productivity · Money · Code · Collection · Governor), This week / This month / All / Done tabs, pace chips, a repeating goal with its run of weeks, a missed goal, an archived one.
27j A goal opened: pace with the straight-line expectation, milestones, linked items (a topic, a subject, an assignment, a pot, a title, plus a link whose target was deleted, marked as such), the period history for a repeating goal, and a projected finish date (only with enough data).
27k New goal: the type picker grouped by domain, templates ("10 hours of study a week", "Five topics to Green this month", "A no-spend weekend", "Finish the series I'm on", "Save for something"), the topic picker for a study goal, a pot for a savings goal, the repeat setting.
27l Empty and low-data states: first visit to Money (one sentence, "Add your first income" / "Import a CSV"), a month with three days of data, no subscriptions yet, a new learner with no goals (templates instead of a blank form).
27m Home: the goal card in Home's next-action ladder (a goal behind, or a period ending soon), the bell's goal notification ("This week's study goal ends tomorrow — 7 h 40 m of 10 h"), and a bill-due notification.
27n Collection's Wishlist tab and the "Purchased → added to Money" handoff (what it creates, and where to see it).
27o Reports: the Money section and the Goals section in a weekly and a monthly report (totals and the biggest categories only, a balance as context, goals met and missed), and the line "What Kurenai sees" (totals only, never payees, notes or titles).
27p Calendar: an upcoming bill and a goal deadline as derived chips in the week view.
27q Phone: Money Overview and Transactions (with the add sheet).
27r Phone: the Goals page and a goal opened.
27s Dawn: Money Overview and the Goals page in the light theme.

DELIVERABLE NOTES. For every frame annotate the interaction states, focus order, what is announced in the live region, the empty and error states, and what changes at 1080, 860, 700 and 560. Mark any new component (the amount field, the category bar, the pace chip, the recurring-rule editor, the period-history strip, the privacy mask) with its states so it can be built once as a shared primitive. Keep copy short and calm, in British English.
```

## 12 · Japanese: a study space for the four skills

The agreed scope is [japanese-plan.md](japanese-plan.md) revision 3.1, after
the vertical slice measured speech, handwriting and a real episode. This
prompt designs the platform, Stage 0 and Stage 1. Later stages reuse these
frames.

**Attach the slice's art to the conversation** so the frames use the real
cast and style rather than placeholders, from
`prototypes/japanese-space/art/`:
- `ja.base.akari.a.webp` and `ja.face.akari.happy.webp`;
- `ja.base.yota.a.webp`;
- `ja.bg.cafe.webp`;
- `ja.panel.kosoa.1.webp` and `ja.panel.kosoa.2.webp`.

```text
Design the Japanese space for KurenaiOS, continuing the approved design in this project: Graphite (Atelier Dusk) and its light twin Dawn, the phone views (15a–15n), the lab system (20a–20i), Reports (24a–24l), Code (26a–26x) and Money and Goals (27a–27s). Number the new frames 28a onwards. Desktop 1280 wide; phone 390 × 844, checked at 360. Use only the existing tokens, type scale, cards, stat tiles, tabs, chips, dialogs and chart styles, and reuse Code's stage path and evidence patterns where they fit.

FIFTH SUBJECT HUE. Japanese joins AQA Computer Science (teal), Edexcel Maths (violet), OCR IT (pink-violet) and Code (sky). The proposed hue is 朱 shu, a vermilion of about oklch(0.72 0.15 42): a sibling of the crimson accent, clearly orange beside it. Confirm or adjust it so it is distinct from crimson and from the status amber, passes WCAG AA as text and as a chip outline in Dusk and Dawn, and show the swatch card with the other four.

TYPOGRAPHY. Japanese is content, never decoration. Japanese body text is Noto Sans JP (or Zen Kaku Gothic New; pick one and show both at 16/20/28px). Model glyphs for handwriting are Klee One, the textbook-style face learners should copy. Display kanji is Shippori Mincho (already in the app). Every Japanese run is lang="ja". Furigana are ruby text: show the three settings (All, Unknown only, None), the ruby size and line height so furigana never collide, and vertical text (writing-mode: vertical-rl) in the reader and manga panels. Navigation, tabs, buttons and headers are English. Japanese appears only where it carries meaning: the item being studied, a stage's emblem kanji always beside its English name (仮 Kana, 基 Foundations, 橋 Bridge, 中 Intermediate, 上 Upper, 達 Advanced), and the rail tile 語.

MOTIFS, KEPT QUIET. Genkō-yōshi (manuscript grid) as the writing canvas; a thin hanko-style seal on a passed checkpoint; the media path drawn as stepping stones (飛び石). No cherry-blossom wallpaper, no decorative kanji, no fake Japanese labels.

WHAT THE SPACE IS. A path from zero to watching anime, reading manga, light novels and VNs, and following J-dramas and J-pop without English. It is input-led: reviews, new material, reading/listening input and output (writing/speaking) every day, about 30–45 minutes, computed each day. Mastery is tracked separately for Reading, Writing, Listening and Speaking. Answers are checked by validators that understand Japanese and return one of four verdicts: Correct, Accepted (valid, not the target form, with a note), Near (a slip; one retry), Wrong, each with a diagnosis. SPEAKING, AS MEASURED. Speech recognition checks only that a sentence would be UNDERSTOOD: the slice showed every recogniser silently "fixes" a dropped っ, a dropped long vowel and voicing (が for か), and an acoustic check failed on a real beginner's voice. So a speaking result says "Understood" or "Not understood — try again", never "Correct", and a single word that is not recognised asks to "Say it again", never marks it wrong. Vowel length, っ and voicing are trained where a verdict is reliable: listening minimal pairs, dictation, and SHADOWING — the learner's recording played back to back with the model, with a length bar of each (beats as segments) — which the learner self-marks ("Self-marked", pays nothing extra). Pitch is an advisory contour. The learner always HEARS a line (▶ Hear, ▶ Slow) before being asked to say it; in Stage 0's first week a plain-letter guide shows the beats ("o·ba·a·sa·n · 5 beats"), then disappears for good.

AUDIO. Every word, sentence and scene line is pre-rendered audio, one distinct voice per character (the browser voice is only a fallback, marked "synthetic voice"). The player shows who is speaking.

MEDIA MOMENTS. Use the attached art. Manga panels are black-and-white raster art with LIVE balloons on top: SVG balloons, real vertical Japanese text (selectable, furigana by mastery, each balloon voiced in its speaker's voice), live sound-effect lettering, panels laid out right to left and balloons read right to left. A "Fill the bubbles" mode blanks words in the balloons for a pick. VN scenes are a painted background, character sprites whose FACE changes while the body stays exactly still, a name plate, a typewriter text box, backlog, English on request and "Mine this line". The learner's own media: an episode's video file plus its Japanese subtitle file, OR a YouTube video with its pasted transcript; everything stays on the device; saving a line as a clip needs a video file in Chrome or Edge (an embed or Safari cannot cut one).

CAST. 白石 灯 (Shiraishi Akari) — third-year senpai and guide, polite です/ます, later keigo; glasses, chestnut hair with a thin braid and a vermilion clip. 朝日 陽太 (Asahi Yōta) — same-year classmate, casual speech and anime contractions; messy dark hair, blazer open over a grey hoodie. Two more to come (a café owner, a little sibling) in the same style.

RULES THE DESIGN MUST KEEP
- Nothing is locked. Content beyond the learner is "Recommended later" (a calm label, dashed outline).
- Grades are derived, never self-reported; a self-marked fallback is labelled "Self-marked" and pays nothing.
- A zero that is only a supporting fact is not printed; the timeline shows "Calibrating" with under two weeks of data, and every projected date is a RANGE, never one date.
- Pass/fail use the fixed green and alarm red with an icon AND a word, never the subject hue.
- Rewards are reported after the fact and paid once.
- Anything sent to the Assistant is preceded by a "What is sent" dialog. Microphone use is requested from a gesture, with a visible recording state and a clear stop. Speaking is OPT-IN, and the opt-in says plainly that Chrome's recogniser sends the audio to Google.
- The five breakpoints (1240, 1080, 860, 700, 560); phone composition from 700; 44px touch targets; keyboard-complete frames; one polite live region for results; reduced motion removes the typewriter and cross-fades.

SAMPLE DATA. Learner 9 weeks in: hiragana and katakana done; Stage 1, unit 3 ("Verbs and ます"), lesson 3.4 "Going places: に and へ". 412 words (R stable 288, L 241, W 160, S 72), 64 kanji read. Reading speed 118 characters a minute. Input this week 2 h 50 m (raw 40 m, JP subtitles 1 h 20 m, reader 50 m). Today ≈ 38 min: Reviews 64 due (≈ 12 min), New: 3.4 (≈ 13 min), Input: graded reader "ねこの いちにち" (≈ 8 min), Output: say-it set (≈ 5 min). Next milestone "Yotsuba&! with a dictionary": 61% there, projected Feb–Apr 2027; "Anime with JP subtitles": calibrated range Nov 2027 – Mar 2028. Collection: Frieren (anime, in progress) — 54% of the words in episode 1's subtitles known, 58 lines with exactly one new word, names (フリーレン, フェルン, ヒンメル) listed apart and not counted; Yotsuba&! vol. 1 (manga, planned). Speaking this week: 14 sentences understood of 17, 6 shadowing reps self-marked.

FRAMES
28a The desk: today's session as four blocks with one Start and the ≈ minutes; the media path strip with the next milestone and its range; the R/W/L/S radar; Collection readiness chips; continue reading; input hours this week. States: first day (Stage 0, nothing calibrated); a heavy review day ("New shrinks to 6 min; input stays").
28b The media path: stepping-stone milestones with requirement profiles (words, kanji, reading speed, listening hours) as small meters, the projected range for each, and "what moves this date most" ("+15 min/day of listening brings it ~4 months forward").
28c The skill map: units with four skill bars, the radar, kanji read and written, fluency measures, and a "Rework" list for leeches.
28d Kana: the chart with per-kana state, a recognition speed drill, and handwriting on a genkō-yōshi square with the Klee One model glyph. The stroke-order animation PLAYS BEFORE THE FIRST ATTEMPT at a new kana (the slice's learner made order slips on 6 of 15 without it), then on request. Stroke diagnosis states with the strokes coloured and the model's numbered starts shown: "Your stroke 1 is stroke 2 — stroke 1 comes first", "Stroke 1 goes the other way: top to bottom", a combined "…comes first, and it goes the other way", and "You went over stroke 1 twice — Undo the extra one".
28e A lesson on the shared topic page (Learn): the hook (a manga panel the lesson unlocks), core idea with example sentences (audio, furigana by mastery), Listen & notice, the page bar, the inspector with evidence.
28f The exercise runner: one frame per family with every verdict state: A typed recall (romaji converting to kana live; "Accepted — kana for 食べる, kanji taught"); B build-sentence tiles and conjugation with a diagnosis ("ichidan rule on a godan verb: 帰る → 帰って"); C a passage with questions and per-sentence translation reveal; D dictation and a minimal pair (おばさん / おばあさん) with a mora diff — the reliable home of vowel length and っ; E say-it: ▶ Hear first, then the recording state, what was understood, and the two outcomes ("Understood" / "Not understood — try again"), never a mora-level verdict; and SHADOWING: model and learner recordings back to back, two length bars in beats, the advisory pitch contours, and the self-mark ("Matched / Not yet"), labelled Self-marked.
28g Reviews: due facets interleaved, the skill each card trains as a chip, derived grade and next interval, sibling burying explained once.
28h The reader: pasted text with furigana by mastery, tap-to-lookup popup (word, reading, pitch, gloss, Add to reviews, audio), mine a sentence, timed reading speed, vertical mode.
28i Media components, using the attached art: a manga page of the two panels side by side in right-to-left order (live vertical balloons with tails to each speaker, the ビシッ sound effect, a balloon highlighted while it is voiced, Read / Fill the bubbles); a VN scene in the café (name plate in the subject hue, typewriter, backlog, the face changing mid-line while the body stays, the listener dimmed); a clip player (loop line, 0.75×, Subtitles / Hidden / Dictation, Shadow, Save this line, a subtitle timing nudge "Subs +0.5 s"); the YouTube variant (embed + pasted transcript, Save this line disabled with its reason); and the subtitle import with the coverage result (percentage known, the commonest unknown words, the one-new-word lines to mine, names listed apart, "Make a target pack").
28j Checkpoint: four skill sections and a media task, per-skill result with the 80% line, a targeted rework set, the hanko seal on pass, and the stage gate's spoken monologue and essay.
28k Speech: the opt-in (what is sent to Google and when), the microphone permission flow, the pace check ("Say ありがとうございます once"; a silent take is refused with "Didn't hear you — try again"), and what speaking is and is not checked for, said once in plain words.
28l Immersion through Focus: choosing raw / JP subtitles / EN subtitles and a Collection title; the EN-subtitles note ("logged, counts as 0 listening input").
28m Settings and credits: furigana, daily minutes, voice, speech engine, audio packs, the Licences & credits page (JMdict, KANJIDIC2, KanjiVG, Tatoeba, Tadoku, the voice provider's credit line per character, AI-assisted art).
28n Phone: the desk, a review card and the reader.
28o Phone: say-it and kana handwriting.
28p Dawn: the desk and the exercise runner in the light theme.

DELIVERABLE NOTES. For every frame annotate the interaction states, focus order, live-region announcements, empty and error states, and what changes at 1080, 860, 700 and 560. Mark new shared components (furigana text, the audio player with the speaker and pitch, the exercise verdict card, the shadowing comparison, the skill radar, the manga panel, the VN scene) with their states. Copy short and calm, in British English.
```

## 13 · Exams & Deadlines Hub

The agreed scope is [exams-plan.md](exams-plan.md) revision 1. This prompt
designs the hub, every tier, the Companion and the paper engine. Later
papers' Companions reuse these frames.

**Attach your own revision materials to the conversation.** They show the
content types and the floor of depth. They are NOT a look to copy: the
frames use the app's design.
- `AS_Pure_Interactive.html`;
- `AS_Pure_Maths_Revision.docx`;
- `F200_Mock_Paper_1.docx`;
- `F200_Subtopic_Questions.docx`;
- `DataStructures_Revision.docx`.

```text
Design the Exams & Deadlines Hub for KurenaiOS, continuing the approved design. The earlier handover packages are attached to this project: Graphite (Atelier Dusk) and its light twin Dawn (frames 7a–14c, 21a–21h), the phone views (15a–15n), design part 2 (15–23, including the topic picker 17a–17e and the lab system 20a–20i), Reports (24a–24l, 25a–25g), Code (26a–26x) and Money and Goals (27a–27s). The GitHub repository is linked: treat css/tokens.css, css/themes.css and css/components.css as the source of truth for tokens and components, and read docs/exams-plan.md (the agreed scope) and the invariants in CLAUDE.md. The current page is js/modules/tracker.js (Study → Exams & Papers, frame 9e). Number the new frames 29a–29x (28a onwards is the Japanese space). Desktop 1280; phone 390 × 844, checked at 360. Use only the existing tokens, type scale, cards, stat tiles, tabs, chips, dialogs, the topic picker, the lab system and the chart styles; extend Exams & Papers, do not invent a new look.

THE IDEA. An assessment is not just a date: it is a classified event with a scope, a readiness model, a preparation workflow, evidence from practice and optional linked goals. The hub grows Study → Exams & Papers (keep its name in the Study strip; its log dialog and record list survive inside it).

TIERS (a chip on every assessment, icon + word, never colour alone):
- Real exam (AQA 7517 Paper 1/2, Edexcel 9MA0 Paper 1/2/3, OCR F201);
- Mock (December, March);
- Topic test;
- Retrieval test / quiz;
- Deadline (NEA, coursework).
The tier decides how much machinery appears: a retrieval quiz is one light card; a real exam has the full set. Show the same page at each tier to prove it scales down rather than going empty.

WHAT IS WANTED (detail in exams-plan.md):
- TIMETABLE: every assessment in date order, subject hue, board, paper, date/time/duration/room, tier, scope summary, readiness band, start-by marker; provisional dates marked.
- SCOPE BUILDER: paper presets (one tap), "Covered in Pacing so far" (a live rule that grows; "+3 leaves since you made this test"), the topic picker in Include and Exclude modes down to leaves, "Exclude Year 2 content", and the "Excluded from this test" callout on the assessment page.
- READINESS: FOUR separate signals, never one blended number:
  1. Coverage (Pacing);
  2. RAG (G/A/R/unrated bar);
  3. Projected exam-day recall (from FSRS), with the five weakest leaves;
  4. Timed practice (count, last three %, predicted grade RANGE).
  Plus a band (Ready · On track · At risk · Not enough evidence) that names the signal holding it down. Each signal has a silent low-evidence state.
- PRACTICE: the quick log stays one screen; pick a past paper from the index (board → paper → session fills marks and the question list); per-question marks, ten error tags and a redo toggle are OPTIONAL; "what do you think you got?" before marking; timed with minutes. Topic packs (ours and PMT's) can be logged, and a pack shelf shows what's done per topic.
- POST-MORTEM: one screen after a marked paper: lost marks by topic, by archetype and by error tag, the three costliest questions, and actions (make redo items, add to this week's priorities, open the Companion there). Untagged lost marks read "untagged"; nothing forces tags to add up.
- ANALYTICS: "Where the next ten marks come from" as plain sentences with their evidence; predicted grade as a range with the boundaries' series named; pace in minutes per mark against the board budget; calibration (predicted vs actual); error-pattern prescriptions.
- PLANNER: read-only weekly allocation: hours available (editable), split across assessments, then topics with suggested 25-minute sessions and a reason each, the week's practice paper, the cram deck size. ONE action: "Send this week's priorities to Pacing / Today", a confirm dialog listing exactly what it adds. Never writes the Calendar.
- START-BY dates: advisory, editable, with the derivation shown in one line.
- EXAM SEASON: the hub's Season view (next exams and days left, highest-risk topics, due reviews in scope, rapid recall, latest post-mortem, checklists, logistics).
- EXAM ROOM: the calm last 60 minutes: five blocks and a quiet countdown, no dashboards, no new material.
- COMPANION, scaled by tier:
  - topic and retrieval tests get an assembled guide (key notes, labs, flashcards, exam items, the command words present, booklet vs must-memorise, traps, cram deck, 15-question rapid drill);
  - real exams and mocks get an exhaustive layer BEYOND the topic notes: per topic an archetype catalogue with real frequency ("8 of 11 sittings, 4–10 marks"), Variations A–n each fully worked with M1/A1/B1 (or AQA mark points, OCR PO1–PO3) annotations on the step that earns them, Method 1 vs Method 2, the board's working rules, an examiner's-report trap, a sandbox or generator, a practice set with mark schemes, and real-question pointers ("June 2019 P1 Q8 · 10 marks").
- PLAYBOOK DRAWER (slide-out, per board): formula booklet vs must-memorise, command-word decoder, OCR levels-of-response guidance, FX-991CW setup and checking techniques, master mnemonics, Misconceptions Blacklist.
- TREND & LIKELIHOOD: topic mark-weighting table, a yield map (High/Medium/Low with the word, not colour only), "the core half of the paper" (the archetypes that make up ~50% of marks), "due by its pattern" markers, discriminator post-mortems, and the standing caveat that anything in the specification can appear.
- PAPERS:
  - predicted papers (original, labelled "written by KurenaiOS, not a board paper") in exact board style: cover sheet, instructions, marks in brackets, the question ramp, answer space;
  - the mark scheme with board conventions and level descriptors;
  - a self-marking tally sheet that logs straight into an attempt;
  - an interactive timed mode;
  - an A4 PRINT layout (black on white, no app chrome);
  - also custom mocks from a scope, subtopic packs (5 questions each) and 20-question mixed drills.
- GOALS: five exam goal types linked by exam (grade/score, projected recall, topics green/covered, papers done, checklist); templates offered when an exam is created; a goal whose exam was deleted shows "Exam removed · unlinked".

RULES THE DESIGN MUST KEEP
- A zero that is only a supporting fact is not printed; a zero that is the point stays. Every figure has an evidence threshold and an honest low-data line instead of a guess. Projections and predicted grades are RANGES.
- At risk, behind, overdue, Red and "ran out of time" use the FIXED alarm red with an icon and a word, never the theme accent; subject hues stay (CS teal, Maths violet, IT pink-violet, Code sky; Japanese vermilion is coming).
- No Governor numbers (XP, gold, HP) anywhere in the hub; an attempt still logs its study session as today.
- No past-paper text or images appear anywhere: real papers are references (board · paper · session · question · marks · topic) and the user's own folder path as text. Every question shown is original.
- Likelihood is evidence, not prophecy: the caveat is visible wherever yield is shown.
- Dialogs trap and restore focus; a delete is a danger dialog with Cancel focused; Delete never beside Save. Lists are lazy and keyboard-complete; per-question entry works with the keyboard alone (Tab through got/max, a key for tags).
- Five breakpoints: 1240, 1080, 860, 700, 560; phone composition from 700 (bottom tabs, bottom sheets, 16px inputs, safe areas); 44px touch targets, round controls stay round.
- No dead space: a view fills its width (a side panel, a second column, a grid); charts fill their cards. Check 1440 too.
- Print: the paper and the mark scheme print cleanly on A4 in black; nothing interactive prints.

SAMPLE DATA (use consistently; today is Tuesday 20 October 2026; the summer 2027 dates are illustrative and marked provisional)
- Real exams:
  - OCR F201 Big data and machine learning: Wed 13 Jan 2027, 1 h 30, 60 marks.
  - Edexcel 9MA0 Paper 1: Wed 2 Jun 2027; Paper 2: Wed 9 Jun; Paper 3: Wed 16 Jun (each 2 h, 100 marks, FX-991CW).
  - AQA 7517 Paper 1: Fri 4 Jun 2027, 2 h 30, on-screen; Paper 2: Mon 14 Jun, 2 h 30.
- Mocks:
  - CS Paper 2 mock: Tue 8 Dec 2026, scope "Covered in Pacing so far" (4.5–4.9 and 4.11, excluding 4.10 Databases).
  - Maths Pure mock: Thu 10 Dec 2026, scope P1–P6 plus P8, "Exclude Year 2 content" on, cap opted in.
- Topic test: Maths "Integration topic test", Tue 3 Nov, scope P8.
- Retrieval test: CS "Networking quiz", Thu 22 Oct, 8 leaves of 4.9.
- Deadlines: IT F204 NEA "Task 2 draft", Fri 27 Nov (milestones 2 of 4); CS NEA "Analysis section", Fri 18 Dec.
- Readiness for the CS mock:
  - Coverage 78% (6 leaves not yet met).
  - RAG: Green 41%, Amber 37%, Red 9%, unrated 13%.
  - Projected recall on 8 Dec: 84% (exam-day target 95%); weakest: TCP/IP stack 61%, subnetting 66%, Big O 70%.
  - Practice: 3 timed papers, 61 → 68 → 72%, predicted B–A (boundaries from 2023–25).
  - Band: At risk — limiting: projected recall.
- Practice attempt: Edexcel 9MA0 Paper 1, June 2019, timed 118 min, predicted 70, scored 64/100. Lost marks: Integration 11 (Q8 area between curves 6 of 10: method ×2, slip ×1), Trigonometry 8 (Q6: command, working), Vectors 5, untagged 6. Redo items made for Q8 and Q6.
- Next ten marks:
  1. Area between curves: ~9 marks a paper, on 6 of 8 papers, you dropped 7 of 18 here → 2 sessions on Variations C–E, then redo June 2019 Q8.
  2. Trig identities "show that" → the working rules card and 1 session.
  3. Vectors: due by its pattern (absent 2024 and 2025).
- Planner, week of 26 Oct, 7 h available:
  - CS mock 3 h 30 (TCP/IP 2 sessions, subnetting 2, Big O 1, the CS Paper 2 June 2023 timed paper);
  - Integration test 2 h (Variations A–F, cram deck 34 cards);
  - Maths Paper 1 1 h;
  - reviews 30 min.
- Start-by: CS mock, Mon 2 Nov ("2 weeks of buffer + 9 h at your 4.5 h a week").
- Likelihood (Edexcel Paper 1): Integration high yield (8 of 8 sittings, mean 11 marks); Proof medium; Vectors due by its pattern. The core half of the paper: 9 archetypes.
- Goals:
  - "CS Paper 1 projected recall ≥ 85% by 21 May" (now 79%, on track);
  - "4 marked Maths past papers before Paper 1" (1 of 4, behind);
  - "Pre-exam checklist: F201" (3 of 7, auto items ticked by the app).

FRAMES
29a Placement: Study strip with Exams & Papers, the hub's own tabs (Timetable · Readiness · Planner · Practice · Companion), the phone More sheet entry, and the Season view replacing the hub's landing when on.
29b Timetable: the list grouped by month with tier chips, bands, start-by markers, provisional dates; filters by subject and tier; "Import timetable" (paste text) and "New assessment".
29c New / edit assessment: tier picker (what each tier gives, one line each), paper presets, date/time/duration/room/seat, calculator, extra time, cap toggle (mock only, explained), and the goal templates step after saving.
29d Scope Builder: presets, "Covered in Pacing so far" (the live rule and its "+3 since" note, Freeze), the topic picker in Include and Exclude modes, "Exclude Year 2 content", the resolved count, and the "Excluded from this test" callout as it appears on the assessment page.
29e Assessment overview at REAL EXAM tier: header (title, date, days left, tier, band), the four readiness signals, the band's limiting signal, next ten marks, the week's planned sessions, checklist, linked goals, logistics.
29f The same overview at MOCK, TOPIC TEST and RETRIEVAL tiers side by side (how it scales down), and the DEADLINE tier (milestones, start-by, at-risk state).
29g Readiness in depth: each signal opened (coverage list of unmet leaves, RAG by unit, recall by leaf with the weakest first, practice trend with the grade-range band), and every low-evidence state.
29h The log dialog: quick mode (one screen) and the index pick (board → paper → session), topic-pack pick, timed/minutes, "what do you think you got?", link to an assessment, and "This IS the result of…".
29i Per-question entry: the question list with got/max, error-tag chips (ten tags), redo toggle, the "questions add to 64, total says 66" note (not an error), keyboard flow.
29j Post-mortem: lost marks by topic, archetype and tag, the costliest three questions, the action row, untagged marks.
29k Analytics: next ten marks, predicted grade range with series named, pace (min/mark vs budget, the "ran out" markers on the question ramp), calibration chart, error-pattern prescription cards; each with its low-data state.
29l Planner: hours available, the split across assessments, topic rows with sessions and reasons, the week's paper, cram deck; the "Send to Pacing / Today" confirm dialog; the week after a disrupted week (nothing stale to clean).
29m Exam Season view: next exams, highest-risk topics, due reviews in scope, rapid recall, latest post-mortem, checklists, logistics, "quiet the rest" toggle.
29n Exam Room: the five calm blocks with the countdown, reduced-motion version.
29o Companion, assembled tier (Integration topic test): key notes, labs, cram deck, rapid drill, command words, booklet vs must-memorise, traps.
29p Companion, exhaustive tier, one topic (Integration — area between curves): archetype catalogue with frequency, Variations A–F (one opened fully with M1/A1/B1 on each scoring step), Method 1 vs Method 2, Edexcel working rules, examiner's-report trap, a sandbox, the practice set, real-question pointers with "Log this question".
29q The same for a CS topic (AQA pseudocode conventions, a trace table variation, mark points) and an OCR F201 extended question (PO1/PO2/PO3, level descriptors, the band-climbing checklist).
29r Playbook drawer: booklet vs must-memorise, command-word decoder, OCR levels of response, FX-991CW techniques, mnemonics, Misconceptions Blacklist; open over the Companion.
29s Trend & likelihood: mark-weighting table, the yield map, the core half of the paper, due-by-pattern markers, discriminator post-mortems, the caveat.
29t Predicted paper: interactive timed mode and the board-style cover sheet; mark scheme with conventions and level descriptors; the self-marking tally that logs an attempt.
29u Print: the predicted paper and mark scheme as A4 pages (cover, a question page with answer space, a mark-scheme page).
29v Goals: the five exam goal types in the new-goal picker, templates on exam creation, a linked goal card on the assessment, "Exam removed · unlinked".
29w Elsewhere: Home's ladder (exam inside lead days, start-by today, deadline at risk), the Calendar with assessment chips and start-by markers, Review's "cram this scope" run, Reports' Exams card, the bell's exam notification.
29x Phone: timetable, an assessment overview, the log dialog as a sheet, per-question entry, the Exam Room; plus Dawn: the assessment overview and the Companion in the light theme.

DELIVERABLE NOTES. For every frame annotate the interaction states, focus order, live-region announcements, empty, low-evidence and error states, and what changes at 1080, 860, 700 and 560. Mark new shared components with their states so each is built once: the tier chip, the readiness signal card, the band with its limiting signal, the scope summary and excluded callout, the error-tag chip set, the question ramp, the yield map, the variation card with mark annotations, the method comparison, the drawer, the paper page (screen and print), the tally sheet.
```

---

## 14 · The iPad and the Pencil

The agreed scope is [ipad-plan.md](ipad-plan.md) revision 1. The layout
for the iPad (6.0) is already released, so this prompt designs only what
is new: the ink surfaces and the iPad compositions around them.

```text
Design the iPad and Pencil features for KurenaiOS, continuing the approved design. The earlier handover packages are attached to this project: Graphite (Atelier Dusk) and Dawn (7a–14c, 21a–21h), the phone views (15a–15n), design part 2 (15–23, including the topic picker 17a–17e and the lab system 20a–20i), Reports (24–25), Code (26a–26x), Money and Goals (27a–27s) and the Exams hub (29a–29ac). The GitHub repository is linked: treat css/tokens.css, css/themes.css and css/components.css as the source of truth, and read docs/ipad-plan.md (the agreed scope) and the invariants in CLAUDE.md. Number the new frames 30a onwards (28 is Japanese, 31 is Creatives). The device is an iPad Air 11": draw at 1180 × 796 (landscape, the installed app) and 820 × 1156 (portrait), and show one Split View at 590. Use only the existing tokens, type, cards, tabs, chips, dialogs and the lab system; extend the existing pages, do not invent a new look. The rail, the spine and the inspector stay as they are.

THE IDEA. One ink engine, mounted in many places: the iPad becomes the study notes device. The stylus is a Metapen A8 now (probably no pressure) and an Apple Pencil Pro later. It is pen only: a finger scrolls and pinches, two fingers tap to undo, and the palm never draws.

WHAT IS WANTED:
1. THE INK TOOLBAR (30a–30b): pen, highlighter, eraser (stroke or partial), lasso, shape snap, ruler, text and image, colour (theme roles only, three widths), undo and redo, and the paper choice (blank, lined, squared 5 mm, dotted, Cornell, answer booklet). Show it docked on the top edge and as a small floating palette, in both orientations. Every tool has a visible name on long press; nothing is icon-only without a label.
2. A TOPIC'S HANDWRITTEN TAB (30c–30e): a new tab beside Notes, Flashcards, Quiz and Exam questions. Show its empty state (where writing starts), a notebook of A4 pages, and landscape SIDE BY SIDE: the shipped notes left, your page right, scrolling separately, with "Clip to page" on a figure in the notes. The inspector counts pages written.
3. THE ANSWER PAD (30f–30g): under a question (an exam item, a practice-set question from the Companion, a predicted paper). A strip for a short answer, a page for a long one, and the mark-point tally beside it (M1, A1, B1 ticks). Then "Mark with Kurenai": first its "What is sent" dialog (exactly the image and the scheme), then its result, which SUGGESTS ticks with a reason each and asks you to confirm. Nothing logs on its own.
4. THE PDF VIEWER (30h–30j): a past paper from the Paper library with thumbnails, jump to question, an ink layer per page, the Exam Room's timer, and the mark scheme in a second pane (in the viewer, and as a Split View). Then the marking step: marks by question log one attempt and pick redo items.
5. MATHS WORKING (30k–30l): squared paper with the FX-991CW panel and the formula booklet beside it; the "Write it out" drill (a worked example's steps hidden one at a time; write the next line, reveal, say whether you had it); "Check my working" pointing at the first wrong line without giving the rest away.
6. RETRIEVAL BY HAND (30m–30o): a blurt page with a timer, then compare mode (the notes beside it, tick what you had, circle what you missed); a diagram drill (draw an FSM, a logic circuit, a binary tree or a free-body diagram from memory, then the model answer overlays at 50%); a handwritten flashcard answer strip.
7. KANA PRACTICE (30p): a guide square, the model stroke animation, and the checker's result (order, direction, shape), in the Japanese space's look (28a onwards).
8. SETTINGS (30q): this device's pen-only and finger-drawing switches, sync of ink, "Make my handwriting searchable" (off), and storage used.
9. SPLIT VIEW AND SLIDE OVER (30r): a notebook beside the Assistant at 590, and Focus's dock at 375.

STATES: no pen detected (finger drawing offered), a page syncing, a conflict (both copies kept), offline, a very long notebook, Dawn for one ink frame (ink colours stay readable).

RULES: ink colours are theme roles, never fixed hex; the Pencil Pro's squeeze and barrel roll are not available to the web, so nothing depends on them; "written by KurenaiOS, not a board paper" stays on generated questions; status is never colour alone.
```

---

## 15 · Creatives: art, design, editing, writing

The agreed scope is [creatives-plan.md](creatives-plan.md) revision 2
(decisions A–H approved). The sketchbook is built on prompt 14's ink
engine, so draw 14 first or alongside it.

```text
Design Creatives for KurenaiOS, a new non-exam study space beside CS, Maths, IT, Code and Japanese, continuing the approved design. The earlier handover packages are attached to this project (Graphite and Dawn 7a–14c and 21a–21h, phone 15a–15n, design part 2 15–23 with the lab system 20a–20i, Reports 24–25, Code 26a–26x, Money and Goals 27a–27s, the Exams hub 29a–29ac, and the iPad ink frames 30a onwards). The GitHub repository is linked: treat css/tokens.css, css/themes.css and css/components.css as the source of truth, and read docs/creatives-plan.md (the agreed scope) and the invariants in CLAUDE.md. Code's desk and lesson frames (26a–26f) are the closest model: Creatives is a sibling, not a new app. Number the new frames 31a onwards. Draw at iPad 1180 × 796 and 820 × 1156 (this is the iPad's track), desktop 1280, and phone 390 × 844 for review only. Propose ONE new subject hue that is distinct from CS, Maths, IT, Code (Sky) and Japanese (vermilion) and from every status colour, with its Dawn variant.

WHO IT IS FOR. A complete beginner in all four tracks who has quit before because of the taste gap: comparing Day 1 with professional anime art and YouTubers. It is a light hobby (20–30 minutes a day, or a couple of sessions a week), behind the A-levels. The whole space must feel SAFE TO BE BAD AT: small steps, private practice, progress measured only against yourself. It is aimed at the media they love: anime and light-novel characters, background scenery, short edits and AMVs, clean covers and UI, and one day their own VN scenes.

THE FOUR TRACKS: Art (the iPad and stylus), Graphic design (interactive drills in the app, then Figma or Canva), Editing (video: DaVinci Resolve for iPad, CapCut or Alight Motion), Writing (the in-app Writing Desk). Free apps only; paid apps appear as an optional upgrade note after 20 sessions, never before.

WHAT IS WANTED:
1. THE DESK (31a–31b): the four tracks with their unit paths; the Daily Creative (one drill or micro-study, or a milestone, plus due theory cards), sized to minutes; a "chosen days" setting with no streak pressure; and its Exam Season state ("Paused for Exam Season", one calm line). Recent work shows PORTFOLIO pieces only; the Practice Log is a quiet link, never a gallery here.
2. A LESSON (31c–31d) on the shared topic page: notes with step images, then MICRO-STUDIES (each isolates one skill, 5–20 minutes, with what is given: a reference to trace over, a fixed palette, a pre-cut clip and beat grid, a written setup). Then the unit's project, offered only once its micro-studies are done, with a quiet "Try it anyway".
3. "GOOD FOR THIS UNIT" (31e): the check on every micro-study: one or two rows for the unit's ONE skill, each with its calibration text ("Your lines will wobble and nothing will look like a finished anime frame yet. Pass if the box's edges head to consistent vanishing points. Ignore shading and proportions: later units."), and an EXPECTED BEGINNER OUTPUT example, deliberately rough. Design this as the emotional centre of the space.
4. THE SKETCHBOOK IN A TIMED DRILL (31f–31g): the rep timer (for example 30 s gestures, 20 reps), the MOMENTUM MODE switch (no undo, no eraser: commit and move on), clearly shown while on, layers-lite (three layers), a few brushes, the mirror flip and greyscale, and tracing-over at 30%.
5. BEST OF FIVE (31h): after a batch, the reps in groups of five; star the best of each group (optional), and critique only the starred ones.
6. THE PROCEDURAL REFERENCE GENERATOR (31i): boxes, cylinders, spheres and cones at random angles, a perspective grid, a block mannequin in a random pose, a block head turned; with Next, Show construction and a seed. It is drawn on the lab system's SVG stage, so use the lab frames' bar and readout.
7. THE PRACTICE LOG AND THE PORTFOLIO (31j–31k): the log is private, raw, batch by batch, and prunable, opened only on purpose. The portfolio is curated, reached by a deliberate "Promote to Portfolio". Show the promote dialog. A piece's page shows its milestones, time from Focus, tools, the "made from" link to a Collection title, and its critique if one was asked for.
8. THE REDO (31l): the same micro-study months apart, side by side, old and new, then rate the redo: you against you only.
9. THE WRITING DESK (31m–31n): distraction-free Markdown with word count; versions and a diff between drafts; a sprint running in Focus (word target and timer); a 150-word dialogue micro-study with its calibration; "reading as a writer" questions about a finished Collection book or VN.
10. DESIGN DRILLS (31o–31p): kerning (space a word, then the reference overlay), font pairing for a brief, the hierarchy fix, the palette builder with its contrast check, and snapping to a grid.
11. EDITING (31q): the beat map (tap along to a song; markers listed and exported for Resolve or CapCut), a storyboard page in the sketchbook, and the 8-beat loop micro-study's brief.
12. ASK KURENAI FOR A CRITIQUE (31r): the "What is sent" dialog (the starred image or excerpt, the brief, the unit and its one skill), then the reply: what worked against THIS unit's bar and ONE thing to try on the next rep. It never mentions later skills and never compares with professional work.
13. PHONE (31s): the desk, the theory cards and the Portfolio, read and review only.

STATES: first visit (an encouraging start, not a wall of 13 units), a skipped week (no guilt, just "pick up here"), the Exam Season pause, an empty Portfolio (the log has work but nothing promoted yet), Dawn for the desk and a lesson.

RULES: no locks for good (a project says "Try it anyway"); no streaks, badges or counts that shame; zero-value facts suppressed (invariant 77); Kurenai never generates or rewrites work; status is never colour alone; the Practice Log never appears in Reports, a share or the Home page.
```


---

## 16 · Mind: psychology and philosophy

The agreed scope is [mind-plan.md](mind-plan.md) revision 2 (decisions
A–J approved). Unlike Creatives, the phone is a first-class device here:
the Daily 15 is meant to be done on a bus.

```text
Design Mind for KurenaiOS, a new non-exam study space for psychology and philosophy, beside CS, Maths, IT, Code, Japanese and Creatives, continuing the approved design. The earlier handover packages are attached to this project (Graphite and Dawn 7a–14c and 21a–21h, phone 15a–15n, design part 2 15–23 with the lab system 20a–20i and the topic picker 17a–17e, Reports 24–25, Code 26a–26x, Money and Goals 27a–27s, Japanese 28 onwards with its VN scene and manga panel components, the Exams hub 29a–29ac, the iPad 30a onwards, Creatives 31a onwards). The GitHub repository is linked: treat css/tokens.css, css/themes.css and css/components.css as the source of truth, and read docs/mind-plan.md (the agreed scope) and the invariants in CLAUDE.md. Code's desk and lesson frames (26a–26f) and Japanese's desk and scenes are the closest models: Mind is a sibling, not a new app. Number the new frames 32a onwards. Draw at desktop 1280 and phone 390 × 844 for EVERY main flow (the phone is primary for the daily session), plus iPad 1180 × 796 for the desk and a lesson. Propose ONE new subject hue distinct from CS, Maths, IT, Code (Sky), Japanese (vermilion), Creatives and every status colour, with its Dawn variant.

WHO IT IS FOR. A sixth-form student with no formal psychology or philosophy, but who knows many of the themes from visual novels, psychological mysteries, light novels, and CS and AI. It is for curiosity, sharper thinking, understanding people and strategy, and analysing the stories they read and write (their own VN and story writing lives in Creatives). It is 15 minutes a day, ADDED to the other spaces, mostly on a phone on the bus: one hand, patchy signal, interruptions. It must feel quick, calm and intellectually alive, never like homework or an essay.

THE MODEL. One subject, "Mind", everywhere. Inside, the curriculum sits under four headers: Foundation (F1 arguments, F2 evidence and Bayes), Psychology (Y1 learning and memory, Y2 social, Y3 decisions and strategy: biases, game theory, decision paradoxes, Y4 emotion, motivation and habit, Y5 development and personality, Y6 research methods), Philosophy (P1 ethics, P2 mind and self, P3 knowledge and reality, P4 how to live, P5 society) and Crossings (X1 free will, X2 morality, X3 happiness, X4 the self, X5 machine minds, X6 cooperation). Paths contain units, units contain lessons, lessons teach CONCEPTS. A concept's mastery is a four-step ladder: Recall, Explain, Apply, Evaluate, derived from evidence.

WHAT IS WANTED:
1. THE DESK (32a–32b): the Daily 15 as the hero (three parts: Reviews ~4 min, One sitting ~8 min, One question ~3 min, with "Just reviews · 5 min"); the current unit and the one suggested next unit; the four headers' paths with mastery ladders; recent Journal entries (titles only); milestones. Its Exam Season state: "Reviews only until your exams end", one calm line.
2. THE PATH PAGE (32c): Foundation, Psychology, Philosophy and Crossings as headed sections; each path's units with their lesson counts and ladders; a Crossing whose two sides are not done says so with "Start anyway". Nothing is locked.
3. A LESSON (32d–32f) on the shared topic page: Hook (a vote or a story-style setup, the answer kept), The idea (short lines, an annotated diagram), The case (a study, a payoff matrix or a close-read passage), The pushback, Check (quiz with an apply scenario), Close. Psychology findings carry an EVIDENCE TAG: Robust, Debated or Failed to replicate; design it to be honest and unalarming. Show the "For your stories" note (two or three lines on how a writer uses the idea, with "Save to Journal").
4. THE ONE WRITTEN PROMPT (32g–32h), in its two forms; a lesson has only one. EXPLAIN-BACK: a bullet box ("Bullets are fine"), then tick which key points you covered. POSITION CARD: options or a scale, a confidence slider 50–99%, one line of reason, and an optional "Strongest objection + your reply" that unlocks Evaluate. Both have a quiet "Later" that parks it without guilt.
5. THE SOCRATIC DIALOGUE (32i–32j) in Japanese's VN scene component with Kurenai's existing art: her question, 2–4 answer choices plus "Type your own", follow-ups, and the closing summary with "Save to Journal". Thumb-reachable on the phone.
6. POSITIONS OVER TIME (32k–32l): a position's version history and the BELIEF TIMELINE across all positions ("What changed my mind" on each revision; a changed mind is a milestone, celebrated quietly); a REVISIT card ("In October you said X because Y. Still true?" Keep · Revise · Retire); a TENSION PAIR prompt ("You pulled the lever but didn't push. What's the difference?") that opens a dialogue, never a verdict.
7. ASK KURENAI (32m): the four modes (Socratic, Explain it differently, Push back, Make it mine), the "What is sent" dialog with tickable extras, offline ("Saved to ask when you're online"), and a reply saved to the Journal.
8. THE JOURNAL (32n–32o): five kinds (Insight, Quote, Question, Position, Reflection), filters by kind and concept, the Big Question of the week as a thread with its Sunday synthesis, the commonplace-book export, and QUICK CAPTURE on the phone (kind, text, done).
9. THE KNOWLEDGE GRAPH (32p–32q): a concept page's Neighbours panel (typed links: is a kind of, objects to, supports, is evidence for, same idea as, applies in; links out to CS/Maths topics, Code, Japanese and Collection titles; the user's own links distinguished from authored ones) and THE ATLAS, an SVG map of one path or a concept's two-step neighbourhood on the lab stage, with the list beneath it as the real control. Show the MEDIA LENS: "You've seen this in…" on a concept, and "Ideas in this" on a Collection title.
10. THE ARGUMENT MAPPER (32r): premises and a conclusion as an indented tree joined by because / but / therefore; drag on desktop, tap-to-move on the phone; export.
11. THE FALLACY FIELD GUIDE (32s): a daily item (a quote, fake ad or line of dialogue; name the fallacy) and the guide page (every fallacy and bias, a one-line definition, an example, your "Spotted in the wild" sightings).
12. THOUGHT-EXPERIMENT THEATRE (32t–32u): one scene (the trolley, then the footbridge) as a VN scene with choices, and the results page ("you answered like a consequentialist 4 times out of 6"), a description, never a score, with its tension pairs.
13. LABS (32v–32w): one self-experiment (Stroop or serial position: run, then your result beside the published one, kept on the device) and one strategy lab (Axelrod's tournament: pick strategies, watch the round-robin, the standings; or the Bayes box: base rate and accuracy sliders driving a frequency tree), all on the lab system's bar, stage and readout.
14. THE READING ROOM (32x): a short public-domain passage with margin notes and two or three questions, its translation cited.
15. A CHECKPOINT (32y): cards, apply scenarios and one short synthesis marked against a rubric; retake any time.
16. THE PHONE DAILY 15 (32z–32ab): one vertical flow with a three-part progress strip; reviews and choices in the thumb zone; resume mid-sitting after an interruption; offline banner; the done state.
17. LIGHT EXTRAS (32ac): a philosopher card (thinker, the one idea, an objection; earned at Apply, display only) and the yearly "what I believe" panel in Reports' year view.

STATES: first visit (a welcoming start that suggests F1, not a wall of paths), a skipped week (no guilt, "pick up here"), Exam Season, no network, an empty Journal, a concept with no neighbours yet, Dawn for the desk and a lesson.

RULES: nothing locked; no streak of its own and no counts that shame; zero-value facts suppressed (invariant 77); one written prompt per lesson, bullets welcome; Kurenai discusses but never grades; the Journal is private (Reports count entries, never quote them); no therapy framing, nothing diagnoses; status is never colour alone; evidence tags never rely on colour; no text in any generated image (all text is a live layer); new characters need the user's own art, so use only Kurenai.
```
