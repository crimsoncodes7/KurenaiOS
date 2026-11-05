# The portfolio capstone: a visual novel

**Status: PROPOSAL (5 November 2026). Not scheduled, nothing built.** Roadmap
5.18. It waits for the quality programme (`docs/audit/2026-11/`) and for
enough of the four study spaces to be released. Every unit named here is
real: ids and titles are from `js/data/code.js`, `js/data/ja.js` /
`ja-s1.js`, `js/data/creatives.js` and `js/data/mind.js` as they stand on
`main` (sw `kos-redraw-1`). **R** = released (lessons ship); **P** =
planned (outlined only, no lessons yet). Where no unit exists, it says so
(§10) instead of inventing one.

---

## 1. What it is

A playable visual novel of about **30–60 minutes**, made by you, that uses
what the four study spaces teach:

| Space | What it brings |
|---|---|
| Code | the engine and its systems: state, choices, saves, mechanics, tests |
| Creatives | the story, the dialogue, the art, the title, the cover, the trailer |
| Japanese | a character who speaks some Japanese, at the level you have reached |
| Mind | the ideas the story is about, and mechanics built on them |

A personal project and a portfolio of your skills: not commercial, not a
Steam release. Not a kinetic novel: it must have real mechanics.

KurenaiOS guides it: premises, structures, characters, mechanics, endings,
art direction and milestones are suggested (§4–§5); you choose and change
them.

---

## 2. How it fits KurenaiOS (no new systems)

- **Nothing is locked** (invariant 2; capstones are never locked, invariant
  106; Creatives "offers" a project with "Try it anyway", invariant 154).
  So your **Option A** becomes: every component shows **Ready** or **Not
  yet — missing: …**, and can always be started anyway. There is no gate.
- **Readiness reads the spaces' own records**, never a copy:
  `KOS.code.unitState`, `KOS.ja.unitState`, `KOS.creatives.unitState`,
  `KOS.mind.unitState` (each already returns done/current/later), plus
  Code's `capView`/`projectView` and Creatives' `projectState`.
- **Evidence reuses what each space already records** (§8): the Rider
  validator report for the engine, Creatives works and the Portfolio for
  art and writing, Mind positions and checkpoints, Japanese checkpoints.
- **The project record follows the Code capstone shape** (`capView`: steps,
  milestones, rubric with one automatic row, write-up, pay once) — the most
  complete project model in the app.
- When it is built, it needs one page reachable from all four desks: **◆**
  a Claude Design prompt, written then, not now.

---

## 3. The engine (decision A, open)

Nothing is chosen yet. The test is not "which engine makes VNs" but "which
lets you show real programming, with the units KurenaiOS teaches".

| Option | VN features built in | Programming it shows | Taught in KurenaiOS | Fit |
|---|---|---|---|---|
| **Ren'Py** (Python) | almost everything: text box, saves, rollback, menus | little unless you go out of your way: most of a Ren'Py game is its script language | **nothing**: Python is planned (PY1–PY3 P) but is data-oriented, and no lesson covers Ren'Py | fastest to a finished VN, weakest for Code |
| **Unity** (C#) | none: you build the text box, saves, choices | a lot, in the C# you already learn | **T5 Game development and graphics (P)** plans Unity, with "a small complete Unity game … menus, a save system, audio" as its capstone and a decided way to check Unity work (code-plan §3.5: rules in a plain .NET library the validator tests, EditMode tests in batch mode) | strongest match to the Code plan |
| **Godot** (C# or GDScript) | some (scenes, UI, animation) | a lot | **nothing**: Godot is not in any plan | good engine, no route in the app |
| **Avalonia** (C#) | none, and no game tooling (sprites, transitions, audio) | a lot, but much of it re-inventing a renderer | **Track T2 (R, all 20 lessons)**, CT2 publishes a macOS app | possible today; more UI app than game |

**Recommendation (to decide later): two layers.**

1. **The story engine is a plain, tested .NET library** — the script
   reader, the state and flags, choices, the mechanics, saves and the story
   graph. It needs only released units (U1–U12, C1, B) and is checked by
   the Rider validator exactly as T1/T2 projects are (invariant 109).
2. **A front end draws it** — Unity once T5 is released (recommended: it is
   already planned and checkable), or Avalonia (T2, released) if you want
   to start sooner. The library doesn't change.

This is the same split code-plan §3.5 already decided for T5 ("game logic
in a plain, tested .NET library both engines use"). Ren'Py remains an
option if you'd rather the time went into writing and art, but then most
of the Code evidence would be missing.

---

## 4. Mechanics (suggested; pick two or three)

Each one is grounded in a real unit, so it is a learning outcome, not
decoration.

| Mechanic | What the player does | Code | Mind |
|---|---|---|---|
| **The case file** (recommended) | collects evidence and testimony, then presents it to break an argument's hidden premise | U4 collections, U7 classes, U8 interfaces | F1 *hidden-premise*, *validity*, *soundness* (R); F2 Evidence and belief (P) |
| **Degrees of belief** | a visible "how sure are you?" that evidence moves; endings depend on what you believe and why | U7, U9 events | F2 Bayes and base rates (P) |
| **Trust as a repeated game** (recommended) | each choice with a character is cooperate or defect; trust follows the history, not a points bar | U4 dictionaries, U12 graphs | Y3.2 Games and strategy (P): the Prisoner's Dilemma played against a character |
| **A hidden character lens** | each character has motives, a bias and a flaw that change how they react | U7, U8 | Y5.U2 Personality and the character lens (P), Y3.1 Biases and heuristics (P) |
| **Unreliable memory** | two people remember one scene differently; the player decides which account holds | U4, U9 | Y1.U1 How memory works (P): "memory is reconstructed" |
| **Branching and endings** | choices set flags; three to four endings | U2 decisions, U4, U12 graphs (reachability of every ending) | P1 Ethics (P), X2 Morality (P) |

Avoid: a morality meter (good/evil points), and philosophy quoted for its
own sake. An idea earns its place when it changes a decision, a mechanic or
an ending.

---

## 5. Creative direction (starting points, not a brief)

Three premises. Each one can be cut to 30–60 minutes and uses the
mechanics above.

**A. "Testimony"** — a school mystery. Something precious went missing
from the club room; four people saw what happened and their accounts don't
agree. *Ideas:* memory is reconstructed (Y1.U1), the hidden premise (F1),
conformity in a group (Y2.U1). *Mechanics:* the case file, unreliable
memory. *Endings:* the truth found; the wrong person blamed; the truth
found and kept quiet.

**B. "The Ship of Theseus"** — after an accident, the protagonist's
friends describe a person they don't remember being. *Ideas:* personal
identity (P2.U2), the self (X4), memory (Y1.U1). *Mechanics:* unreliable
memory, degrees of belief. *Endings:* go back to who you were, become
someone new, refuse both.

**C. "Two Tickets"** — an exchange student and the protagonist share a
scholarship place that only one can keep. *Ideas:* consequences and duties
(P1.U2), trust as a repeated game (Y3.2), the steelman (F1.7). *Mechanics:*
trust, branching. *Endings:* decided by the trust history, not one final
choice.

**The Japanese character** (any premise): an exchange or transfer student.
Their Japanese grows as you do. Early scenes use what F1 and F2 teach
(introductions with さん, polite です lines, prices, times, trains); later
scenes add F3–F6 as they are released. Every line has a translation the
player can show. Natural props come straight from released lessons: a café
menu (1.6), station signs (1.5), a train board (2.5), a phone call (2.6).

**Structure:** kishōtenketsu or three acts (W7 Structure names both, P); a
prologue, three chapters and the endings; about 15,000–25,000 words for 30–60
minutes.

**Art direction:** anime-style sprites over painted backgrounds, one
colour script per chapter, a small cast (three to four characters, three to
five expressions each), six to eight backgrounds, four to six CGs. The
look follows the art units you have reached (§6).

---

## 6. Components and what each needs

**Mandatory** = needed to do the component properly. **Recommended** = makes
it better; never blocks. Each row reads its units' state; "available now" is
whether every mandatory unit is released today.

### 6.1 Story and script (Creatives · Writing)

| Component | Mandatory | Recommended | Available now |
|---|---|---|---|
| Premise and outline | W1 The sentence and the paragraph (R), W2 Point of view and voice (R) | W5 The scene (P), W7 Structure (P), Mind F1 (R) | yes |
| Characters | W3 Dialogue (R) | W6 Character (P), Mind Y5.U2 (P) | yes |
| Dialogue in VN script | W3 Dialogue (R) — W3.3 *Dialogue in a VN script* | W4 Description and the senses (P) | yes |
| Branching and endings | W3 (R) | W5 (P), W7 (P), W9 Forms (P) | yes (no unit teaches branching: §10) |
| Revision | W1 (R) | W8 Revision (P) | yes |

### 6.2 Engine and systems (Code)

| Component | Mandatory | Recommended | Available now |
|---|---|---|---|
| Script runner, state and choices | U1–U4 (R), U7 Classes and objects (R) | C1 Text adventure engine (R) — the nearest existing project; U8 Interfaces and inheritance (R); U9 LINQ and generics (R, events and iterators) | yes |
| Saves and settings | U6 Files, exceptions and debugging (R), U11 Async, events and I/O (R; 11.2 JSON) | T2D Async apps and services (R; T2.15 Settings and notifications), C4 A small service, tested (R) | yes |
| The mechanics (§4) | U7 (R), U8 (R) | U12 Data structures and algorithms (R; graphs), D4 Software design and architecture (P) | yes |
| Tests of the story logic | U10 Testing and design (R) | C4 (R), D5 Testing in depth (P) | yes |
| Story graph check (every ending reachable) | U12 (R) | T9 Theory of computation (P) | yes |
| Front end: scenes, sprites, text box, transitions, audio | Unity: T5 (P) · Avalonia: T2A–T2E (R) | CT2 The Planner on the desktop (R) | Avalonia yes, Unity no |
| Japanese text in the engine | U5 Text: strings, parsing, formatting (R; 5.7 Unicode) | — | partly (furigana: §10) |
| A macOS build | Avalonia: T2E (R; T2.20 Packaging and publishing) · Unity: T5 (P) | — | Avalonia yes |

### 6.3 Art (Creatives · Art)

| Component | Mandatory | Recommended | Available now |
|---|---|---|---|
| Backgrounds | A3 Perspective (R) | A11 Backgrounds and scenery (P), A4 Value (P), A5 Colour basics (P) | yes (rough); better after A11 |
| Character sprites | A1 Lines and confidence (R), A2 Boxes and forms (R), A7 The mannequin (P), A8 Heads and the anime face (P) | A6 Gesture (P), A9 Hands (P), A10 Clothing and folds (P), A13 A digital workflow (P) | no (A7, A8) — placeholder sprites can start now |
| Expressions | A8 (P) | — | no (no expression unit: §10) |
| CGs | A12 Composition (P) | A4 (P), A5 (P), A13 (P) | no |

### 6.4 Design and UI (Creatives · Graphic design)

| Component | Mandatory | Recommended | Available now |
|---|---|---|---|
| Title logo | D2 Typography (R) | D5 Logos and marks (P) | yes |
| Cover and banner | D1 The principles (R), D2 (R) | D6 Covers and posters (P), D3 Grids and layout (P), D4 Colour in design (P) | yes |
| Game UI: text box, menus, save screen | D1 (R), D2 (R) | D7 UI and screens (P), D8 Export (P) | yes |

### 6.5 Trailer and sound (Creatives · Editing)

| Component | Mandatory | Recommended | Available now |
|---|---|---|---|
| A 30–60 s trailer | E1 The cut and continuity (P), E3 Pacing (P), E5 A story in 30 seconds (P) | E2 Cutting on the beat (P), E6 Colour, then a grade (P), E7 Titles and text (P), E8 Export for platforms (P) | no (no Editing unit is released) |
| Music, effects, voices | — | E4 Sound and music levels (P; mixing only) | no unit makes audio: §10 |

### 6.6 Japanese

| Component | Mandatory | Recommended | Available now |
|---|---|---|---|
| Names and introductions | H Hiragana (R), K Katakana (R), F1 First conversations (R; 1.2 *Nice to meet you*, さん) | — | yes |
| Short polite lines, translated | F1 (R), F2 Days and times (R) | — | yes |
| Japanese props: menus, signs, a train board, a phone call | F1 (R; 1.5, 1.6), F2 (R; 2.5, 2.6) | — | yes |
| Lines about places, things and actions | F3 Things and places (P), F4 Doing things (P) | F5 Describing (P), F6 The て-form (P) | no |
| Casual speech, honorifics beyond さん, character speech | — | — | no unit: §10 |
| The character's voice | F1, F2 listening (R) | the ElevenLabs workflow in CLAUDE.md (a fourth designed voice needs your OK first) | yes |

### 6.7 Ideas (Mind)

| Component | Mandatory | Recommended | Available now |
|---|---|---|---|
| Arguments, clues and the reveal | F1 What makes an argument good (R; *hidden-premise*, *validity*, *deduction*, *induction*, the five fallacies) | F2 Evidence and belief (P) | yes |
| Characters who argue well on both sides | F1 (R; F1.6 *charity*, F1.7 *steelman*) | — | yes |
| Memory, identity and the self | — | Y1.U1 How memory works (P), P2.U2 Personal identity and free will (P), X4 The self (P) | yes (no mandatory unit) |
| The dilemma and the endings | — | P1.U2 Consequences and duties (P), P1.U3 Applied cases (P), X2 Morality (P) | yes |
| Trust and strategy | — | Y3.2 Games and strategy (P) | yes |
| Biases and flaws in characters | — | Y3.1 Biases and heuristics (P), Y4.U3 Cognitive distortions (P), Y5.U2 (P) | yes |
| Meaning and the absurd | — | P4.U2 Existentialism and the absurd (P) | yes |

Mind has few mandatory units on purpose: themes can be written from
reading. The recommended units are what make them precise.

### 6.8 Readiness meters (your Option A, with an overall line)

One meter a group, from the tables above. Your meters will count the units
YOU have done; what can be counted today is capped by what is released.
Counted from §6.1–§6.7 on 5 November 2026:

```
                     mandatory units released    components that can start
Story and script     3 / 3                       5 / 5
Engine and systems   16 / 17  (T5: Unity only)   8 / 8  (front end: Avalonia)
Art                  3 / 6    (A7, A8, A12)      1 / 4  (backgrounds; placeholders)
Design and UI        2 / 2                       3 / 3
Trailer and sound    0 / 3    (E1, E3, E5)       0 / 2
Japanese             4 / 6    (F3, F4)           4 / 6
Ideas (Mind)         1 / 1                       7 / 7
Overall                                          28 / 35 can start (some partly)
```

- A meter counts **units done** (each space's `unitState(...).state ===
  "done"`), never minutes or pages.
- Mandatory and recommended are counted apart; only mandatory moves
  "Ready".
- A planned unit shows as "not released yet", not as your gap.
- Each component lists what is missing by name, with a link to the unit.
- Drawn with `KOS.ui.ring` / the progress bar, zeros suppressed
  (invariant 77).

---

## 7. Milestones

Each milestone names the components it finishes (§6). "Start" = can begin
on today's releases.

| # | Milestone | Components | Needs (mandatory) | Start |
|---|---|---|---|---|
| 1 | Concept and design document | premise, mechanics chosen, engine decided | W1, W2, Mind F1 | now |
| 2 | Story plan | outline, branch map, endings | W3 | now |
| 3 | Characters and world | cast sheets, the Japanese character, settings | W3 | now |
| 4 | Engine choice and prototype | script runner on placeholder art; one scene with one choice | U1–U4, U7 | now |
| 5 | Core systems | mechanics, saves, settings, tests, ending reachability | U6, U8, U10, U11, U12 | now |
| 6 | Script | the whole script in the engine's format | W3 (W3.3) | now |
| 7 | Art and assets | backgrounds, sprites and expressions, CGs, UI | A3, A7, A8, A12, D1, D2 | partly (backgrounds and UI now; sprites after A7–A8) |
| 8 | Japanese | the character's lines, props, translations, voice | H, K, F1, F2 (F3–F6 as released) | partly |
| 9 | Sound and presentation | music, effects, transitions, front end | engine front end (T2 or T5) | partly (Avalonia now; Unity after T5) |
| 10 | Testing and refinement | playtests, every ending reached, revision | U10; W8 recommended | after 5–9 |
| 11 | Cover, trailer and write-up | logo, cover, banner, trailer, the portfolio write-up | D2; E1, E3, E5 | partly (cover now; trailer after Editing) |

Milestones 1–6 can all start on today's releases. Art and the trailer set
the real pace.

---

## 8. Evidence: required versus demonstrated

"Required" is what §6 asks of you before. "Demonstrated" is what the
finished piece shows after, recorded where the app already keeps evidence.

| Deliverable | Demonstrates | Recorded through |
|---|---|---|
| The story engine library | classes and interfaces, collections, events, files and JSON, tests, a graph check | a Rider validator report (milestones like T1/T2 projects; invariant 109) |
| The front end and build | UI, input, transitions, a packaged macOS app | the same report (Avalonia) or T5's planned Unity check |
| The script | point of view, dialogue that carries want, VN script form, branching | Creatives works, promoted to the Portfolio by you (invariant 156) |
| Sprites, backgrounds, CGs | construction, perspective, figures, colour, composition | Creatives works (pictures), promoted |
| Logo, cover, UI | hierarchy, type, layout | Creatives works, promoted |
| Trailer | cuts, pacing, titles, sound levels | Creatives work (once Editing is released) |
| The Japanese lines | reading, writing and register at your level | a checklist of lines against the grammar points they use (g:… ids) |
| The ideas | a coherent theme carried by decisions and endings | a Mind position on the story's central question, plus the write-up |

The write-up (Code capstones' `writeupMin` pattern) says, for each space,
what was used and what was learnt while building it.

---

## 9. When it is built (a sketch, not a spec)

- A record `state.capstone.vn` (synced, keyed maps, its own normaliser)
  holding only choices and milestone marks: premise, engine, cast, and the
  components you mark done; readiness is never stored.
- A project page with the meters, the components, the milestones and the
  guidance cards (§4–§5), linked from the four desks and from Home's
  Continue. **◆** Claude Design prompt first.
- Pay once when every milestone is marked, on the Code capstone pattern;
  zero pay for readiness changing.
- An optional Goals type ("capstone components ready") and one badge
  (Achievements), both reading the record.
- No new scheduler, no new evidence store, no locks.

---

## 10. Unresolved mappings (no unit exists, released or planned)

Recorded here rather than invented. Each needs either a new unit in its
space's plan or an accepted gap.

| Need | Nearest today | Space to decide |
|---|---|---|
| Branching narrative design (routes, flags, endings) | W3.3 (VN script form); a "branching VN scene" project idea in `docs/creatives-plan.md` §2.4, not in `KOS_CR` | Creatives (W9?) |
| Ren'Py, or Godot | none in any plan | Code |
| A game-state / scene state-machine lesson | only in T5's outline (P) | Code |
| Save games specifically (and rollback/history) | U6, U11 (generic files and JSON) | Code |
| A narrative scripting language | T9's "an interpreter for a small language" (P) | Code |
| Sprite layering, transitions, text-box typing, audio playback in an engine | T5 outline (P) | Code |
| Furigana and Japanese line breaking in an engine | U5 5.7 Unicode (string level only) | Code |
| Expression sheets as a skill | A8 (P); "a VN sprite with two expressions" project in creatives-plan §2.1 | Creatives |
| Character design (silhouette, turnarounds, cast sheets) | A8 (P) | Creatives |
| Game UI specifically | D7 UI and screens (P), general | Creatives |
| Making audio: music, effects, voice direction | E4 mixing (P); voice files come from the asset workflow, not a lesson | Creatives |
| Casual speech, plain forms, honorifics beyond さん, character speech (役割語), sentence-ending particles | Stage 2–4 descriptions only (`units: []`) | Japanese |
| Reading VN text: narration, inner monologue, onomatopoeia | an optional Onomatopoeia track is named only | Japanese |
| Writing original Japanese dialogue beyond sentence building | the stage-gate essay (plan §10.1, not in the data) | Japanese |
| Interactive storytelling and player choice | Mind's "For your stories" notes on F1 lessons | Mind |
| Perception; testimony and witness reliability as a unit | Y1's eyewitness memory (P) | Mind |

Also: **Mind F2 is planned** but is the unit most of the mechanics lean
on, and **T5 is planned** but is the recommended front end. Their release
order decides when this project can really start.

---

## 11. Decisions for you (when it is scheduled)

1. **Engine** (§3): the recommendation is the .NET library plus Unity (or
   Avalonia to start sooner).
2. **Premise** (§5): A, B, C or your own.
3. **Art:** all by hand, or may AI-assisted art stand in for some of it?
   Today the app's own art is AI-assisted (Gemini). For a portfolio of
   *your* skills, the default here is by hand.
4. **Audio:** made by you, licensed, or generated (VOICEVOX/ElevenLabs, as
   Japanese's audio is)?
5. **Length:** 30 or 60 minutes (it sets the word count and the art list).
6. **Which unresolved mappings (§10) should become units**, and in which
   space's release order.
7. **The release order** that unblocks it: T5, Mind F2, Art A7–A8 and
   A11–A12, Editing E1–E5, Japanese F3–F4.
