# Graphite review — test plan

A walk through every surface of the rebuilt app, in an order that follows
how the app is used: shell first, then a study day, the organiser, the
Collection, the Governor and Assistant, the Archive, and the labs. Each step
says what to do and what to look for. Tick as you go, and note anything that
reads wrong, looks wrong or feels slow.

Desktop only for this pass. Phone layouts, Dawn and the other themes come
after the base release.

## 0 · Before you start: the three accounts

Governor → Status → the **Data** switch beside Preview: **Mine · Empty · Sample**.

- **Mine** is your real account. Nothing below changes it unless you act on a
  real record yourself.
- **Empty** is a separate first-run account: nothing added. It still has the
  weekly plan (seeded from the pacing file) and the calendar's two
  "SAMPLE — … (edit me)" starter events, because that is what a first run
  genuinely shows.
- **Sample** is a separate, lived-in account: 26 weeks of sessions, study
  progress and flashcards, calendar, reminders, assignments, papers, habits,
  the Planner, goals, notifications and 31 Collection titles across the four
  vaults (placeholder covers, no cover art). Every lab is unlocked there;
  one frame and one banner are owned and the rest of the shop is for sale.
- Switching reloads the app. The header shows an amber chip in Empty and
  Sample ("Sample data · back to mine"); pressing it returns you to Mine.
- Cloud sync and provider sync (AniList, VNDB) are **off** in Empty and
  Sample, so nothing you do there reaches your accounts. Edits there persist
  in that account only.

Suggested rhythm: walk each section in **Sample** (full), flip to **Empty**
and walk it again for the empty states, then finish on **Mine**.

- [ ] Switch to Sample. The chip appears in the header; Home fills in.
- [ ] Switch to Empty, then back to Mine. Your data is exactly as it was.

## 1 · The shell

- [ ] **Header.** Brand (press → Home), a search pill shorter than the bar,
      the clock, the bell, the Assistant emblem and the sync dot. There are no
      back/forward arrows (use the browser's, or Alt+← / Alt+→).
- [ ] **Search.** Press `/`. Type a topic, a title, a reminder. Results group
      by domain; arrow keys and Enter open one; Escape closes.
- [ ] **Bell.** Unread count badge; the popover lists the five latest, "Mark
      all as read", and "View all notifications →" opens the full feed.
- [ ] **Rail.** Seven sections, the active one lit. Collapse/expand with the
      small arrow; the choice survives a reload.
- [ ] **Profile chip** (foot of the rail). Opens the profile card: banner,
      portrait in its HP ring, level and rank, status, HP/XP/Gold meters, "Edit
      status" and "Open Governor →". Escape or a click outside closes it.
- [ ] **Edit status.** One line, a character count, Clear / Cancel / Save.
      There is no "About" field anywhere.
- [ ] **Icons** read at a comfortable size across the app (bell, ✕, arrows,
      scroller arrows).

## 2 · Home

- [ ] **Hero.** Greeting and streak, your status as a quote (press it to edit),
      level bar, HP, and the daily goal list with Start focus. With a banner
      set (Governor → Avatar), the picture shows through a light overlay.
- [ ] **Routines** and **Reminders** cards; tick a habit and a reminder.
- [ ] **Due today / Focus** card: the Focus ↔ Review switch, durations, the
      primary action.
- [ ] **Today** and **Upcoming** (countdowns, including the weekly plan's
      class milestones).
- [ ] **Study hours**, **Week's plan** (tick a personal row), the subject
      desks and the Collection desk further down.
- [ ] Empty: every card collapses to one quiet line; nothing decorative fills
      the fold.

## 3 · Study

### 3a · A subject desk (CS, Maths, IT)

- [ ] Subject card with the per-paper breakdown; Continue and Weakest beside
      it; analytics + deadlines row; stat strip.
- [ ] **Course units** scroller: the first card lines up with the cards above
      and below; arrows appear only when there is more to scroll.
- [ ] **Practice zone** (Simulations, Worked Examples, Trace Lab, OOP, Logic,
      Sort, FSM) and **Resources** (add one; the dialog).

### 3b · A topic page

- [ ] Spine on the left: subject switch, units, groups, the current topic
      marked; collapse it.
- [ ] Header, the static study-nav row, the inspector (status, confidence
      R/A/G, checklist, note).
- [ ] Tabs: **Notes** (callouts, code with copy, tables, figures), **Spec**,
      **Flashcards** (flip, rate), **Quiz** (answer, result), **Exam** (write,
      reveal mark scheme, self-mark), **Worked** (first open, the rest fold),
      **Simulate** (an inline sim), **Files** (attach one).
- [ ] **Editor** (✎): edit notes, add a flashcard, reorder; the page beside it
      previews; Reset returns the shipped material.

### 3c · Review

- [ ] Overview queue, start a session, rate cards, the completion screen.
- [ ] Card Stats (needs three tracked cards and three reviews; Empty shows the
      low-data state). Your personal deck: add, edit, delete a card.

### 3d · Assignments and Exams & Papers

- [ ] Assignments: filters, the list, the side panel (brief, subtasks,
      progress), "+ New assignment" — one create button only, including when
      the list is empty.
- [ ] Exams & Papers: add a paper, the reflections, the grade trend.

## 4 · Productivity

- [ ] **Focus Timer.** Set up (mode, minutes, subject/ref), start, pause,
      minimise, finish; the completion screen reports the award; the review
      afterwards. Reload mid-session: it returns paused.
- [ ] **Reminders.** Smart sections, lists, tags, priorities; add with a due
      time and an alert; subtasks; complete; recurring.
- [ ] **Habits.** Add, tick today, the twelve-week grid.
- [ ] **Calendar.** Month and Week, add an event of each type (exam,
      deadline, study block linked to an assignment, lesson, personal),
      recurrence, alerts, countdown toggle, Delete kept apart from Save.
- [ ] **Pacing.** The week page (class vs personal rows, carry-over "→ here",
      notes, Remind me), week navigation, and the braid (#/pacing/braid) with
      its key column and branch buttons.

## 5 · Collection

- [ ] **Overview.** Stat strip, Currently consuming, Airing soon, Where each
      medium stands.
- [ ] **Overview → Analytics.** Stat strip, the four-panel status comparison
      with one legend, Where the collection lives (donut + key), Top genres
      (readable labels), Score distribution (full width), Rest logged.
- [ ] **Each vault** (Anime, Books, Visual Novels, Games): the spotlight hero,
      the filter rail (status + lists), the control row above the grid, the
      overlay cards (hover shows status + "+1"), grid ↔ list.
- [ ] **Editor.** Open a title: AniList-owned rows are read-only facts with
      editable list state and your personal layer; a manual/VN/Game row edits
      fully; image position through the cropper.
- [ ] **Actions menu.** The numbers (per-vault charts), This season (anime),
      Find new titles, the provider profile, Sync & Import.
- [ ] **Books.** Digital vs Physical lens; the shelf; volumes.
- [ ] **Visual Novels.** Routes/chapters/hours progress, quotes, CG counter.
- [ ] **Games.** Playtime, platform, completion tier.
- [ ] **Shrine.** Favourites across vaults; the painter/export.
- [ ] **Planner.** Budget Planner (month budget, want/waiting/purchased, the
      purchase hand-off) and Goals ("+ New goal" is the only create button,
      also when a tab is empty).
- [ ] **Sync & Import.** Provider cards, AniList XML import, the AniList and
      VNDB profile pages. (Sync is off in Empty and Sample.)

## 6 · Governor

- [ ] **Status.** Hero (a lighter overlay over a banner), Edit status, the HP
      Preview (Live / Full / Off), the Data switch, Edit banner (the cropper),
      the four instruments. **Study cadence** and **Milestone ledger** are the
      same height, the heatmap spans its card and its footer sits on the
      card's floor. The three rules.
- [ ] **Gold Shop.** Balance band, departments, previews, buy something
      (Sample has 640 gold).
- [ ] **Avatar.** Live identity preview, profile picture (cropper), banner,
      frames and seals.
- [ ] **Session Log.** Categories, the entry panel.

## 7 · Assistant

- [ ] Open from the header emblem (drawer) and as the full page.
- [ ] Chat, a tool confirmation card, Stop.
- [ ] Settings (provider, routing), Memory, Permissions, Activity.

## 8 · Archive

- [ ] **Notifications.** Filters (all/unread/study/productivity/collection),
      day groups, mark read, the device-alert switch, "What lands here",
      "Clear the feed…".
- [ ] **Backup & Restore.** Keep it safe (last backup), Export, Import, the
      storage estimate, what a backup covers, and "Reset everything…" (type
      RESET; do this only in Empty or Sample).
- [ ] **Help & Guide.** Sections one at a time, search across all of them, the
      pager, On this page, shortcuts.

## 9 · Labs

- [ ] **Simulations** (#/sims). Area pills, search, the card grid; open one: the
      header (back, spec line, Open topic page), the lab card, More in this area.
      Try: Boolean Logic Lab (switches + live row), Binary Register (flip bits,
      Add), FSM Lab (Run/Step), Bitmap Lab (paint), Floating Point, Parity,
      Recursion, a maths sim with sliders.
- [ ] **Worked Examples** (#/worked). Paper pills, generator tabs, New numbers,
      Generate working, Reveal next step / all.
- [ ] **Trace Lab** (#/trace). Stack, queue, list, tree; the code panel lights
      the running line; the trace table.
- [ ] **OOP Sandbox** (#/oop). The example classes on a first visit, drag a
      card, add a class/field/method, set base (the arrow), Copy C#, Clear
      sandbox (asks first).
- [ ] Locked state: in Empty, a lab shows the lock card with "Open the Gold
      Shop".

## 10 · Across the app

- [ ] Every dialog: named, Escape closes, focus returns to what opened it,
      danger dialogs focus Cancel and never confirm on Enter.
- [ ] Toasts sit above any open dialog.
- [ ] Back/Forward in the browser walk the pages you visited; a redraw
      (sync, a tick) never adds a history step.
- [ ] Nothing flashes unstyled; no page scrolls sideways at desktop widths.

## Known gaps in this pass

- Phone layouts (700px and below) are not reviewed yet.
- Dawn and the other themes are not built yet.
- Sample covers are placeholder tiles.
