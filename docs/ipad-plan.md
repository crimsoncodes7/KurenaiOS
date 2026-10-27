# The iPad and the Pencil (plan, revision 1, approved)

> **26 October 2026:** the rest of design turn 30 is BUILT on `feat/ipad-files`
> (see the roadmap's Phase 6 note); only the sketchbook (6.8) waits, for Creatives.

> **25 October 2026:** design turn 30 (frames 30a–30t) is drawn, and 6.1
> (the ink engine) and 6.2 (a topic's Handwritten tab) are RELEASED
> (`052b27c`, sw `kos-ink-1`). The stylus is now an Apple
> Pencil (USB-C or Pro, to be seen): the engine reads pressure only once
> the pen reports it.

Asked for on 22 October 2026: the iPad Air 11" (M4) becomes a first-class
device, and then the study notes device, written with an Apple Pencil
Pro (it arrived on 26 October 2026).

Short answer:
- **The layout work is done** (roadmap 6.0). It covers both orientations,
  Split View and touch with no hover.
- **Next is one ink engine** (`KOS.ink`). Every Pencil feature is built on
  it:
  - handwritten notes on every topic;
  - answering exam questions by hand;
  - annotating past papers and PDFs;
  - Maths working on squared paper;
  - drawing diagrams from memory;
  - kana practice;
  - the Creatives sketchbook.
- **It stays a web app.** The ink engine runs on Pointer Events in Safari,
  so the same pages work with a mouse on the Mac. The Pencil Pro's squeeze,
  barrel roll and haptics are native-only, and nothing here depends on
  them (decision A).
- **Three spikes come first**, on your iPad, before any feature:
  - what the Pencil Pro reports to Safari;
  - how pdf.js copes with a whole paper;
  - how well Kurenai reads your handwritten Maths.

---

## 1. The device

| | iPad Air 11" (M4) |
|---|---|
| Screen | 1180 × 820 points. The Home Screen app gets 1180 × 796 in landscape and 820 × 1156 in portrait (the status bar takes 24). |
| Split View, Stage Manager | the app can be about 590 (half), 375 (Slide Over) or any width in a Stage Manager window |
| Input | touch (`pointer: coarse`, `hover: none`), the stylus (`pointerType: "pen"`), and a keyboard and trackpad when attached (`any-pointer: fine`) |
| Browser | Safari, and every iPad browser is Safari underneath. It asks for desktop sites, so its user agent says "Macintosh". |
| Install | Add to Home Screen. It needs that for Web Push (invariant 131), and an installed app's storage is not evicted after 7 days without a visit. |

### 1.1 What the stylus gives a web page

| | Apple Pencil Pro |
|---|---|
| `pointerType` | `"pen"` |
| Pressure | 0–1 |
| Tilt (`tiltX/Y`, `altitudeAngle`) | yes |
| Palm rejection | the OS separates pen from touch |
| Hover | on supported iPads, as pen `pointermove` with no buttons |
| Squeeze, barrel roll, double-tap, haptics | native apps only; the web never sees them |
| Scribble (handwriting → text in any text field) | yes, free in every `<input>` and `<textarea>` |

The engine still works with no pressure (width from speed), so a
USB-C Pencil or a mouse writes too; with the Pencil Pro the width
follows pressure.

## 2. What is already done (roadmap 6.0, 22 October 2026)

The responsive audit has a device mode now:
`node tools/responsive_audit.mjs --ipad` (820 × 1156 and 1180 × 796, touch,
no hover), and `--sizes 590x796,375x796 --touch` for Split View. It now
measures Money, Exams and Notifications too.

It found and fixed (the rail on your report):
- **The main rail.**
  - **Portrait:** under 1080px it was always tiles and its toggle was
    hidden, so it could never be opened. Now the toggle shows, and the
    full rail opens OVER the page (the page keeps its width). It closes on
    a destination or a tap on the page, and remembers its own choice
    (`ui.railOpenNarrow`).
  - **Landscape:** the 24px toggle hung over the rail's edge. Under the
    touch minimum it grew 44px tall (an oval) and sat on the subject
    spine. On touch it now keeps the desktop's place and size, a 24px
    circle on the rail's edge (the dense size, invariant 69).
  - smoke43 holds both.
- **Every topic page collapsed between 1081 and 1240px**, so on the iPad in
  landscape. A token set the inspector to 100% width while the topic grid
  was still two columns, which left the text column about 0px. This dated
  from the first Graphite step and showed on any laptop window that size.
- **Page headers** now wrap their actions under the title before squeezing
  it. The Shrine's title had gone one word to a line at 820.
- **The Shrine's podium** uses its compact layout from 860 down, not 560.
- **The Notification filters** scroll in an edge track with arrows instead
  of running off the side.
- **Review's topic rows** put their chips on a second line under 700. They
  overflowed a 375px Slide Over or a phone by about 60px.
- **Row controls a mouse finds by hovering** are always shown where there
  is no hover:
  - a resource's or assignment's delete, an assignment's open;
  - a reminder's or habit's delete, the plan's move;
  - the picture's change button, an IDE member's remove.
  - The phone tier already showed them, but an iPad is wider than the
    phone tier.
- **`KOS.ui.device()`** names the device for words only (layout never reads
  it, invariant 47). An iPad was calling itself "this computer" and missing
  the "add to the Home Screen first" hint for push.

Result: 0 overflowing elements and 0 cut text in every view, at both
orientations and both themes, and at 590 and 375.

## 3. The ink engine (`KOS.ink`, roadmap 6.1)

One engine, mounted wherever ink is wanted.
`KOS.ink.mount(host, {doc, page, paper, tools})` returns a surface. Every
feature below is a surface with a different paper and a different place
the document belongs to.

### 3.1 Input

- **Pointer Events** only, with `touch-action: none` on the surface and
  `getCoalescedEvents()` where Safari has it, so a fast stroke keeps every
  sample.
- **No Scribble delay.** The surface calls `preventDefault()` on
  `pointerdown` and `touchstart`. Otherwise iPadOS Safari can hold a
  stroke's start for about 150 ms while it checks for Scribble
  handwriting. Spike P measures both ways.
- **Pen only by default:** a finger never draws. One finger scrolls the
  page, two pinch and pan, and two-finger tap is Undo (the gesture iPad
  note apps use). The tap counts only when both fingers go down and up
  within 200 ms and move under 10 px, so starting a pinch is never an
  Undo. A "Draw with a finger" switch is per device, for the Mac
  trackpad and for no pen.
- **Palm rejection** comes free from pen-only. A touch that starts while
  the pen is down is ignored.
- **Width:** from pressure when the device has it, else from speed and
  tilt. Strokes are smoothed with a perfect-freehand style outline: a
  filled polygon per stroke, not a polyline.

### 3.2 Tools

- **Pen and highlighter**, in three widths and a small palette. Colours are
  theme roles, so ink stays readable in Dawn and Graphite (as invariant 26a
  does for canvases).
- **Eraser:** whole stroke, or partial (it splits the stroke).
- **Lasso:** select, then move, resize, recolour, copy or delete.
- **Shape snap:** hold at the end of a stroke and it becomes a line,
  arrow, circle, ellipse, rectangle or triangle. That is what makes a
  logic gate, a tree or an FSM tidy.
- **Ruler:** two fingers place it, the pen draws along it.
- **Undo and redo:** per surface, unlimited for the session.
- **Text box** (typed or Scribble) and **image** (a picture, or a figure
  clipped from the notes).

### 3.3 Paper

- Blank, lined, squared (5 mm, the Maths answer booklet), dotted and
  Cornell.
- An **answer booklet** template (margin, question numbers).
- Fixed A4 pages, or one tall page that grows (decision C).

### 3.4 The record (invariant 132, drafted in §11)

- **Vector strokes, never pixels.** A stroke is `{tool, colour, width,
  points}`, where points are packed integers (x, y in 0.1 pt, t in ms,
  plus pressure and tilt when present), delta-encoded. A page of
  handwriting is about 20–60 KB.
- **Where it lives:** a new IndexedDB, `kurenai-os-ink`: `docs` (one per
  notebook, answer or PDF, with what it belongs to: `topic:sid:ref`,
  `answer:<item>`, `paper:<fileId>`, `sketch:<id>`) and `pages` (the
  strokes). It is in the full backup.
- **Sync** (decision D): pages replicate like `kos_reviews` do, owner-only,
  local first, a page at a time, last writer by page with both kept on a
  conflict. Ink is your notes, so unlike attachments it should not need a
  press to upload.
- **Export:** a page or a notebook as PNG or PDF through the share sheet.

## 4. Features (roadmap 6.2–6.9)

### 6.2 A topic's notebook

- **Every topic gets a Handwritten tab:** pages of ink that belong to that
  topic. Like Notes, it is always present (invariant 89), and an empty tab
  is where writing starts.
- **Side by side in landscape:** the shipped notes on the left, your page
  on the right, scrolled independently.
  - "Clip to page" copies a figure, a formula or a worked step from the
    notes onto the page as an image to write around.
- **The inspector counts pages written.** "Notes read" stays the reading
  check; writing is its own evidence.
- **The quick note** works with Scribble already: write in the field and
  it becomes text. Nothing to build.

### 6.3 Answering questions by hand

- **Every question surface gets an answer pad** under the question:
  - quiz items with typed answers;
  - exam questions;
  - the Companion's practice sets and predicted papers;
  - the paper engine's papers.
  - A long item gets a page; a short one a strip.
- **Self-mark against the mark points.** The tally beside the pad ticks
  M1, A1 and B1. It already exists for papers (invariant 127) and logs
  ONE attempt, as now.
- **"Mark with Kurenai"** (decision E) sends the pad as an image, with the
  question and its mark scheme, in one request. The reply ticks mark
  points and says where marks went. You confirm the marks; it never logs
  on its own.
  - A "What is sent" dialog shows exactly the image and the scheme, like
    Reports' (invariant 102b).
  - It is metered like any Assistant request.
- **The answer is kept** with the attempt (`answer:<attempt uid>:<q>`), so
  the post-mortem and redo items (invariant 124) show what you actually
  wrote.

### 6.4 Past papers and PDFs

- **The Paper library's PDFs** (`kurenai-os-papers`) open in an in-app
  viewer:
  - pdf.js renders each page;
  - an ink layer per page;
  - thumbnails, and jumping by question number.
  - A paper can be imported on the iPad from the Files app (iCloud Drive,
    or AirDrop from the Mac's `~/Downloads/A-level`).
- **Sit it timed** (the Exam Room's timer and extra time). Write on the
  paper itself, then mark it with the mark scheme open in a second pane
  (Split View, or a side-by-side in the viewer).
  - Marks by question log the attempt (invariant 124), and redo items are
    picked from the pages.
- **Any other PDF** (a school handout, a worksheet) can be attached to a
  topic as an attachment with ink.
- **Export a flattened copy** (pdf-lib) to print or send to a teacher.
- **Still no past-paper text in the app or the deploy** (invariant 125).
  Papers and their ink stay on your devices. Whether ink on a paper syncs
  is decision D, and the PDF itself is never uploaded unless you ask.

### 6.5 Maths working

- **Squared paper with the FX-991CW panel** from the Maths playbook beside
  it, and the formula booklet a tap away.
- **A "Write it out" drill:** a worked example's steps are hidden one at a
  time. You write the next line, then reveal it and say whether you had it.
  This turns the Companion's worked variations into active practice.
- **"Check my working"** (decision E) reads your lines, finds the first
  wrong step and says why, without giving the rest away.
- **Handwritten redo items:** a lost-marks question comes back on its FSRS
  day with your old answer hidden under the new page.

### 6.6 Retrieval by hand

- **Blurting:** a blank page for a topic and a timer. Write everything you
  remember, then the notes open beside it and you tick what you had and
  circle what you missed. Optionally, Kurenai compares the two.
  - The ticks feed topic memory as evidence only. They rate no card;
    ratings stay yours (invariant 111).
- **Diagram drills:** draw it from memory, then the model answer overlays
  at 50%. For example an FSM, a logic circuit, a binary tree after
  inserts, a graph traversal, a trace table, a free-body diagram or a
  normal curve.
- **Handwritten flashcards:** a card's back is answered on a strip, then
  revealed and self-rated as now. Your writing is kept with the review row
  (never the card text, invariant 111).

### 6.7 Japanese writing (with roadmap 5.5)

The slice's handwriting checker caught all 8 of your mistakes using a
mouse. With a pen, kana and later kanji are written on a guide square:
- the model animation plays first;
- the checker grades stroke order, direction and shape.

The Japanese plan already budgets W for production words. The iPad is
where those reviews should happen.

### 6.8 The Creatives sketchbook

The ink engine with layers-lite (three layers and opacity) and a few
brushes is the sketchbook for drills and studies. See
[creatives-plan.md](creatives-plan.md). It is not a Procreate replacement,
and finished pieces come in as evidence (that plan's decision C).

### 6.9 The iPad as a study desk

- **Keyboard and trackpad** (Magic Keyboard): shortcuts listed under ⌘
  (hold ⌘ for the overlay, as iPad apps do). Hover states come back when a
  trackpad is attached (`any-hover: hover`).
- **Stage Manager or Split View** with the Assistant or a paper in the
  second window. Every view now holds at 590 and 375.
- **Focus on the iPad:**
  - the phone dock at Slide Over widths;
  - the mini-player beside a notebook;
  - a "keep the screen on" option while a session runs (the Screen Wake
    Lock API, which Safari supports).
- **Code's full runtime on the iPad.** It is parked for phones, but the M4
  has the memory. A one-off check could unpark it for the iPad alone.
- **Lesson recording** (later): record audio while you write, and replay
  the page stroke by stroke in time with it, as Notability does. The
  strokes already carry `t`. This is offered, not planned (decision F).

## 5. Search and the Assistant

- **Handwriting is not searchable by default.** "Make my handwriting
  searchable" (off by default, decision E) sends each finished page once
  to be read, and keeps the text beside the strokes for search (invariant
  71) and the Assistant.
- **The Assistant gets read tools:** `ink_pages` (what was written where
  and when) and, when searchable, the text. It has no write tool on ink.

## 6. Spikes (the first step, on your iPad; `prototypes/ink-spike/`)

| | Question | Pass when |
|---|---|---|
| **P (pen)** | What does the Pencil Pro report? Check `pointerType`, pressure, tilt, coalesced events and the sample rate. How long from pen to pixel, with and without `preventDefault()` on `pointerdown` and `touchstart` (the Scribble buffer)? Does palm rejection hold while writing a page? Does the two-finger-tap Undo threshold ever fire during a pinch? | It reports as `"pen"`, writing a paragraph never draws from a palm, and the stroke keeps up at normal writing speed |
| **D (documents)** | Can pdf.js in Safari open a 30-page paper with an ink layer and keep scrolling smooth? How much memory does it use? Can the Paper library's PDFs be imported from Files? | First page under a second, no tab reload on a whole paper |
| **H (handwriting)** | Does Kurenai read your Maths working well enough to mark it? Test 10 real answers, marked by hand first. | It agrees on at least 9 of 10 mark-point decisions, and never awards an A without its M |

Spike H decides whether "Mark with Kurenai" and "Check my working" ship,
or wait for a better model.

**Results on the device (26 October 2026, Apple Pencil Pro,
[pencil-tests.md](pencil-tests.md)):**
- **P: passed.** It reports as a pen with pressure; no palm marks;
  a pinch never undid; the ink trails a little behind fast writing. The
  day found the fixes in smoke107: lasso chips that ignored the pen,
  colours stuck on black after a redraw, a redraw throwing the reader off
  the tab, the toolbar's gap, the tab row folded to "+7", sizes for every
  tool, two-finger scroll with finger drawing on, and the occasional
  spike (a stray sample). The live stroke now paints once a frame.
- **D: passed, but slow.** No stutter or reload and the ink stayed put,
  but the first page took about 10 s. Page 1 now shows before the other
  pages are measured, pages render one at a time nearest first, and the
  Files index waits while a viewer is open. To measure again.
- **H: not run yet.** The Daily Review's words were retried every 30 s
  after a failure and spent the day's Assistant quota (50) before the
  test; a failure now backs off. Run it once the quota resets.

## 7. Releases

1. **Spikes P, D, H** on the device, with no app files touched.
2. **Ink core and the topic notebook** (6.1, 6.2), with sync.
3. **Answer pads and self-marking** (6.3), then "Mark with Kurenai" if
   Spike H passed.
4. **The PDF viewer and papers** (6.4).
5. **Maths working and retrieval by hand** (6.5, 6.6).
6. **Japanese writing** (6.7), with its platform release.
7. **The sketchbook** (6.8), with Creatives.
8. **The desk niceties** (6.9) fold into whichever release they touch.

Each follows the pre-deploy checklist, and the audit runs with `--ipad`
from now on.

## 8. Design (◆, Claude Design prompt 14)

Frames needed:
- the ink toolbar, in landscape and portrait, docked and floating;
- a topic's Handwritten tab, and the side by side;
- an answer pad under a question, with the tally;
- the PDF viewer with thumbnails and the mark scheme pane;
- the Write it out drill;
- a blurt page in compare mode;
- "Mark with Kurenai"'s result and its "What is sent";
- the Split View and Slide Over compositions.

## 9. Decisions (proposed)

| | Decision | Proposed |
|---|---|---|
| A | Web or a native wrapper (PencilKit, squeeze, barrel roll) | **Web.** One codebase that works offline as now and on the Mac. A native shell can come later around the same stroke format. |
| B | Finger drawing | off by default, a per-device switch |
| C | Pages | fixed A4 pages for notebooks and answers (they print); papers take the PDF's own pages |
| D | Ink sync | automatic, a page at a time, owner-only table. Ink on a past paper syncs its strokes; the PDF itself stays on the device. |
| E | Kurenai reading handwriting | opt-in per action ("Mark with Kurenai", "Check my working"), plus a separate off-by-default switch for searchable handwriting. Spike H must pass first. |
| F | Lesson audio recording | not now; the stroke times keep it possible |
| G | Rewards | Writing pays nothing by itself. A Focus session pays as now (invariant 4a), and an answer pad is part of the attempt it belongs to (invariant 129). |

## 10. Risks

- **Safari memory on big PDFs.** Render only the pages near the viewport,
  and drop the bitmaps of pages out of view.
- **Ink volume in sync.** Pages are small as vectors, but a year of daily
  notes is still thousands of rows. They are paged reads, and never in
  the state document.
- **AI marking is wrong with confidence.** It only suggests: you confirm
  every mark, and Spike H sets the bar.

## 11. Invariants (adopted 25 October 2026, from design turn 30)

Design turn 30 drafted these as 130–134. Exams already holds 130 and the
closed app 131, so they are numbered 132–136 in `CLAUDE.md`:
- **132. One engine:** strokes, tools, paper and undo, with every surface
  a mount under a doc key.
- **133. Roles, not colours.**
- **134. Writing is evidence, never pay.**
- **135. Handwriting is read only when asked.**
- **136. Ink lives in its own store.**
