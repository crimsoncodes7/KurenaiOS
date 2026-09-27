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

The qualification is OCR's A-level-sized IT qualification (units F200–F206), graded on the total of the units taken. I took F200 and F202 in Year 1 (done, with marks), I'm sitting F201, F204 and F206 in Year 2, and I'm not taking F203 or F205 at all — they must not appear in any figure.

The panel:
- A table of units: unit code and name, year, status (Done / Sitting — with the exam date if known / Not taken, hidden by default), mark out of maximum, the grade that mark gets, and a small bar against the unit's boundaries.
- The grade boundaries (Pass, Merit, Distinction, Distinction*), shown in a way that reads at a glance.
- The aggregate: total marks so far out of the maximum for the units counted, the overall grade that total gets, and "to reach Distinction* you need N more marks across F201, F204 and F206 — about X per paper", with a target-grade picker.
- Entering a mark when a result arrives (an inline edit on the row).

Sample data: F200 51/60, F202 54/60, Year 1 grade Distinction; the Year 2 units not yet sat. Use placeholder boundaries and label them as such; the real ones come from the specification.

Frames:
18a The panel on the IT desk, Year 2 in progress.
18b Entering a new mark on F201.
18c The same panel at the end of Year 2, all units done.
```
