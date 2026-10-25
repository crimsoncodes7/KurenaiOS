# Daily Review and Routines (plan, revision 1, for approval)

Roadmap 5.10, asked for on 25 October 2026. It replaces the **Habits**
page with **Routines** and adds the **Daily Review**: three check-ins a
day that turn what KurenaiOS already knows into "what now?". Reminders
stay as they are, on their own page. It also tightens how Assignments,
Exams, Pacing, Reminders, Calendar, Goals and Focus feed each other.

It follows the usual shape: this plan, then Claude Design
([prompt 17](design-prompts.md), frames 33a onwards), then four releases
(§13). The art is asked for in [routines-art.md](routines-art.md).
Decisions waiting on you are in §16.

## Contents

1. What exists today
2. The idea in one page
3. The day model: `KOS.today`
4. Routines
5. Moving Habits into Routines
6. The Daily Review
7. Smart consolidation
8. The words: template first, Kurenai optional
9. Notifications, open and closed
10. Tightening the modules (the "where does it show?" clean-up)
11. Rewards (the Governor)
12. Files, routes and ownership
13. Releases and tests
14. Invariants this adds (142–149)
15. Risks
16. Decisions for you
17. Suggestions beyond the brief

---

## 1. What exists today

Read from the code on 25 October 2026.

- **Habits** (`js/modules/todo.js`, `KOS.views.tasks`, rail "Habits"):
  `state.todo.habits = [{id, text, days: {"YYYY-MM-DD": true}, created}]`.
  Ids are per-device counters (`todo.nextId`), re-keyed by the cloud
  merge (`cloudmerge.js` RECORDS, invariant 33a). A tick logs
  `sessions.log({type: "todo"})`, which pays **5 XP, 1 gold, +2 HP**
  (`governor.js:219`). There is no daily cap, and untick then re-tick
  pays again.
- The same page shows **Today's directives** (`KOS.todo.autoItems`:
  due cards, deadlines within 5 days, today's study blocks). The ticks
  are kept per day in `todo.autoChecked`.
- **Home** has a "Routines" card that is really the first four habits
  (`hub.js:995`), and a "Daily goal" made from the directives.
- **Readers of habits:**
  - Goals' `habit-streak` and `todos-done` types (`goals.js:580,620`);
  - Reports (`report.js:400`, the habit-days fact; `reports.js:1189`, the
    week's habit table);
  - the Assistant (`todo_list`, `todo_add_habit`, `todo_tick_habit` in
    `aitools.js:1808–1909`);
  - search;
  - smoke3, 21, 43, 56 (render-purity baselines `habit.*`), 64, 69, 70,
    71, 91 and 93.
- **Places that make you say where something shows:**
  - an assignment's "Show the deadline on the Calendar" and "Treat as a
    major deadline (shows in Countdowns)" (`assignments.js:341,413`);
  - a calendar event's countdown box (`calendar.js:1127`);
  - Pacing's "Remind me by the week's end", which COPIES a plan row into
    a reminder (`pacing.js:184`).
- **Already in place to build on:**
  - the timetable (`KOS.pacing.timetable`, `lessonsOn`);
  - Focus's objective (`KOS.focus.setObjective`);
  - Calendar's derived chips (`calDerived`);
  - the notification ledger and its kinds (`notify.js`);
  - the closed-app runner (`KOS.outlook`, `KOS.push`, `runner`);
  - scheduled messages (`aischedule.js`);
  - Reports' template and Kurenai words (`reportwords.js`);
  - Exams' notices and start-by;
  - the Goals engine.

## 2. The idea in one page

**One question per check-in, answered from data the app already
has.**

| | Morning (07:00) | Afternoon (16:30) | Evening (22:00) |
|---|---|---|---|
| Asks | What today needs, and how to start | What to do with the time left | What happened, and how to set up tomorrow |
| Opens with | Last night's promises | Progress so far | The day in numbers |
| Middle | Morning Routine; today's timetable, due items, exam warnings, pinned goals | What is left: blocks, deadlines, free time | Unfinished work: triage, never forced |
| Ends with | **Start the first task** (Focus) | Replan, then **Start** or **Done for now** | Tomorrow's preview, tomorrow's first task, Evening Prep, wind-down |

Three rules hold it together:

1. **A review owns almost nothing.** Every item lives in its own module
   (an assignment, a reminder, a lesson, a plan row). A review reads
   them, and when you act on one, it calls that module's own function.
   It stores only its own state: done or skipped, today's three, the
   first task, and when it was seen (§6.4).
2. **There is only ever one review on screen.** A missed review folds
   into the next one; nothing stacks (§7).
3. **Nothing punishes you.** Skip, Later and Esc work everywhere. A
   review has no streak and pays nothing. Routines keep their streaks,
   and a planned rest day does not break one (§4.5).

**Routines** are ordered steps with times, days and a time window. A
habit is a routine with one step, so nothing is lost when Habits goes
(§5). Three templates ship: Morning, Evening Prep and About to Study.
About to Study is also the pre-flight before Focus starts (§4.7).

## 3. The day model: `KOS.today` (the keystone)

Every review, Home's hero and the Assistant need the same list: "what
belongs to this day". Today the list is split across `KOS.todo.autoItems`,
`homeFocusPlan`, Calendar's `eventsOn`, `KOS.reminders.summary`,
`KOS.assignments`, `KOS.exams.notices` and `KOS.pacing.lessonsOn`.

**`js/core/today.js` (`KOS.today`)** is a pure read that returns one
shape:

```js
KOS.today.build(dateISO, {now}) → {
  date, dayStart, isSchoolDay,
  timeline: [ {kind: "lesson"|"event"|"study"|"exam"|"routine"|"review",
               start: "HH:MM", end, title, ref: {kind, id}, subject, done} ],
  due:      [ {kind: "assignment"|"reminder"|"plan"|"milestone"|"startby",
               ref, title, due, dueTime, overdue, priority, estimateMins,
               subject, weight} ],
  warnings: [ {kind: "exam"|"startby"|"atrisk"|"carry", ref, text, days} ],
  goals:    [ {id, title, pace, left} ],          // pinned goals (§10.6)
  routines: [ {id, name, window, state, steps, left} ],
  free:     [ {from, to, mins} ],                 // gaps between fixed items
  focus:    {mins, sessions, bySubject},          // done so far, from the ledger
  next:     {ref, title, why, objective}          // the one suggested first task
}
```

- **Owners stay owners.** `KOS.today` calls each module's existing read
  (`eventsOn`, `lessonsOn`, `forDate`, `deadlines`, `notices(day)`,
  `carriedInto`, `KOS.goals.compute`). It never copies a record. Each
  row carries `ref: {kind, id}` so an action can find its owner.
- **`next` is one ladder,** extended from Home's Focus ladder
  (invariant 53a), so Home and the Morning Review never disagree:
  1. a study block starting within 30 minutes;
  2. an exam inside its lead time;
  3. a deadline at risk;
  4. today's start-by;
  5. an assignment due within 7 days;
  6. a carried plan row;
  7. due cards;
  8. the plan's reading.
- **`free`** is the day's free time: from now (or the day's start) to the
  evening review, minus the timetable, events and study blocks. The
  Afternoon Review's replan uses it.
- **`KOS.todo.autoItems` becomes a thin view of `KOS.today.due`.** The
  directive ticks keep their storage, so Home's "Daily goal" does not
  change until §6.6 replaces it.
- **The day boundary** is `state.review.dayStart` (default **04:00**). An
  evening routine finished at 00:40 counts for the day before. Routine
  logs and review days use this "routine day". The session ledger,
  streaks and the Governor keep the calendar day they always used
  (invariant 4), so no streak moves.

## 4. Routines

### 4.1 The record

`state.routines` is synced. Its normaliser, `KOS.routines.normalise`, is
the gate.

```js
state.routines = {
  v: 1,
  items: [{
    id: "r_x7k2…",            // random string: the merge never re-keys it
    name: "Morning Routine",
    kind: "morning" | "evening" | "study" | "custom" | "habit",
    mark: "朝",               // one glyph; the art cover is chosen by kind (§ art)
    steps: [{ id: "s_…", text: "Shower", mins: 10, optional: false,
              note: "", link: null | {kind: "view"|"url"|"focus", to} }],
    days: [1,2,3,4,5],        // 0 = Sunday; empty = every day
    window: { from: "06:45", to: "07:45" } | null,
    weekend: { window, days } | null,   // optional second schedule
    anchor: "review:morning" | "review:evening" | "focus" | null,
    remind: true,             // a notification at window.from
    archived: false, order: 0,
    legacyHabit: null | "<old habit id>",
    createdAt, updatedAt
  }],
  log: {                      // keyed map: "<routineId>|<routineDay>"
    "r_x7k2|2026-10-25": {
      steps: { "s_a": 1730000000000, … },   // tick time per step
      done: 1730000400000 | null,           // every required step ticked
      rest: false,                          // a planned rest day (§4.5)
      snap: [["s_a","Shower",0], …],        // the steps as they were (id, text, optional)
      paid: true, startedAt, mins           // mins from the player's clock
    }
  },
  templatesSeeded: true
}
```

- **The log is a keyed map, so the merge folds two devices per key.**
  Within a key, `steps` merges per step, `done` keeps the earlier time,
  and `paid` is OR.
- **`snap` freezes history.** The first tick of a day writes the
  routine's steps as they are into the log. Renaming, reordering or
  deleting steps later changes the next day, never a past one. History
  and the heat map read `snap`.
- **Compaction.** After 60 days, a log entry keeps only
  `{done, n, of, rest}`, so the state document stays small. History
  stays whole.

### 4.2 Completion, partial and minimum

- **Done** means every **required** step is ticked. Optional steps never
  block it.
- **Partial** means one or more steps are ticked but not every required
  one. It shows as a half cell and does not count for the streak.
- **Minimum version** (a suggestion, §17): a routine may mark one step
  as its "minimum", for example Read for 10 minutes. On a bad day,
  ticking only that step is a **kept** day, drawn differently, and it
  counts for the streak. It is off unless you set it.

### 4.3 Schedule and window

- `days` and `window`, with an optional second weekend schedule (a later
  wake-up). Routines whose kind matches a review slot get their window
  from that review by default (Morning follows the morning time).
- **Calendar:** a routine with a window draws as a **derived chip**
  (invariant 44), hidden per device under "Routines" in `calDerived`.
  It is never written as an event.
- `remind` sends one `routine` notification at `window.from`. It is
  skipped when the routine's review is about to open (within 15
  minutes), because the review already brings it.

### 4.4 The player

A routine runs in one of two ways. Both write the same log.

- **Checklist:** tick steps in any order. This is used inside a review
  and on Home.
- **Player** ("Start routine"): one step at a time, large. It shows the
  step's estimate as a gentle clock (never a countdown that "fails"),
  with Next, Skip step, Back and a list of what is left. Total time is
  kept as `mins`. It works on the phone in one hand and keeps the
  screen awake if allowed. A `link` step opens its target: for example
  "Check timetable" opens today's timetable sheet, and "Start Focus
  timer" starts Focus.

### 4.5 Streaks, done kindly

- **The streak counts scheduled days only.** A routine set for weekdays
  is not broken by Saturday.
- **Today never breaks a streak** until the day ends (habits already
  work this way, `habitStreak`).
- **A planned rest day** (`rest: true`) can be set from the routine or
  a review before the window ends. It neither breaks nor adds to the
  streak. At most one in any 7 days per routine (decision C), so it is
  honest.
- **Shown:** the current streak, the best streak, and kept-of-scheduled
  for the last 4 weeks. The share of days kept is the headline, not the
  streak (§17).

### 4.6 Templates

The three you asked for ship as **templates**. Picking one makes a
routine you own, and the template itself never changes. The steps,
estimates and optional flags below are a first draft for you to
correct.

**Morning Routine** (朝, kind `morning`, weekdays, window 06:45–07:45, anchor `review:morning`)
1. Wake up (no snooze) · 1 min
2. Shower · 10
3. Get dressed · 5
4. Brush teeth · 3
5. Breakfast · 15
6. Check timetable and essentials · 3 (link: today's timetable and bag list)
7. Leave for the bus · 2 (the window's end)

**Evening Prep** (夜, kind `evening`, every day, window 21:30–23:00, anchor `review:evening`)
1. Review the day · 3 (link: the Evening Review)
2. Check tomorrow's timetable · 2 (link: tomorrow's timetable)
3. Prepare clothes · 3
4. Pack bag and books · 5 (link: the bag list for tomorrow, §17)
5. Set distraction blockers (Opal) · 2
6. Put devices away · 1
7. Read a light novel · 20 (optional; link: the Books vault, "currently reading")
8. Bedtime plan · 1 (the time you mean to sleep)

**About to Study** (始, kind `study`, no schedule, anchor `focus`)
1. Select the task · picked from `KOS.today.next` and the open assignments
2. Define the first concrete action · one line, which becomes Focus's objective
3. Open the materials · the topic page, the assignment's attachments or Code's lesson
4. Clear distractions · phone away, tabs closed (optional: start Opal)
5. Start the Focus timer · the mode and length, starting Focus
6. Begin · the player closes on Focus

### 4.7 About to Study, the pre-flight

- **Start Focus from anywhere** (Home, a topic, an assignment, a
  review) opens About to Study as a **sheet**, already filled in: the
  task from the context, a suggested first action, and the materials
  link. "Just start" skips it. "Don't ask before Focus" turns it off
  (per device, `state.ui.focusPreflight`).
- Steps 1–2 write the Focus session's `assignmentId`/`refs` and
  `objective` through `KOS.focus.start`/`setObjective`. Focus stays the
  only owner of the session (invariant 4a).
- A pre-flight finished all the way is logged as a routine day. It pays
  only through Focus (§11).

### 4.8 One-step routines are habits

"Add a habit" stays as quick as it is now: one line makes a
`kind: "habit"` routine with one step, every day, no window. It ticks in
one tap anywhere. The page groups habits under **Daily habits** below
the routines, so Habits never really goes away.

## 5. Moving Habits into Routines

Done once at boot, by `KOS.routines.migrate()`, held by smoke100.

1. **Each `todo.habits` entry** becomes a routine:
   - `id = "h:" + habit.id`, which is deterministic (see 4);
   - `kind: "habit"`;
   - one step, `id "s1"`, with the habit's text;
   - every day, `legacyHabit: habit.id`, `createdAt` from `created`.
2. **Each kept day** becomes `log["h:<id>|<day>"] = {done, steps: {s1},
   snap: [["s1", text, 0]], paid: true, legacy: true}`. `paid: true` so
   re-ticking a migrated day pays nothing new.
3. **`todo.habits` is kept as it was, frozen** (`todo.habitsMovedTo =
   "routines"`), for one release, so a rollback finds it (as Exams'
   migration did). The release after drops it.
4. **Two devices.** The migration runs after the first cloud pull of
   the boot, and only when `state.routines.migratedAt` is unset. It then
   sets that, which is synced. The ids are deterministic from the
   synced habit ids, so two devices that both migrate produce the same
   records, and the merge folds them by id. A habit created on an old
   copy of the app after the move is picked up by the next boot's pass
   (the migration is idempotent per `legacyHabit`).
5. **Readers move with it:**
   - Goals: `habit-streak` becomes **`routine-streak`**. It reads
     `params.routine`, falling back to `params.habit` and then
     `"h:" + habit`. The registry keeps `habit-streak` as an alias, so
     an old goal is never orphaned (invariant 5b keeps unknown types).
     `todos-done` counts routine completions as ticks.
   - Reports: `gather()` hands `routines` (with the log) in place of
     `habits`. The week's table becomes "Routines · n kept"; months read
     kept days. The old `habits` input is still accepted, so saved
     reports stay readable (they are saved facts, invariant 102).
   - The Assistant: `todo_add_habit` and `todo_tick_habit` stay as
     aliases onto routines. New tools are listed in §10.8.
   - Search: routines and their step text.
   - `KOS.todo.habits()` and friends become shims that read routines,
     for a release.
6. **Route:** `#/routines` is the page and `#/tasks` aliases to it. The
   Productivity strip says **Routines** where it said Habits.
7. **Tests:** the render-purity baselines record the moved controls
   (`habit.*` → `routine.*`, in `.renames.json`); they are not silenced.

## 6. The Daily Review

### 6.1 Configuration

`state.review` is synced:

```js
state.review = {
  v: 1,
  dayStart: "04:00",
  slots: {
    morning:   { on: true, weekday: "07:00", weekend: "09:00" },
    afternoon: { on: true, weekday: "16:30", weekend: "15:00" },
    evening:   { on: true, weekday: "22:00", weekend: "22:30" }
  },
  weekendDays: [0, 6],            // which days use the weekend times
  holidays: "auto",               // school holidays (Pacing's term weeks) use weekend times
  words: "template" | "kurenai",  // the default words (§8)
  autoOpen: true,                 // open the review when the app opens
  routines: { morning: "r_…", evening: "r_…" },   // which routine each review runs
  days: { "2026-10-25": { … } }   // §6.4, kept 60 days
}
```

Per device: `state.ui.review = {lastShown: {"<day>|<slot>": ts},
minimised}`.

### 6.2 What each review shows

Every review is a sequence of **steps** in one overlay (§6.5). Each step
can be skipped, and the whole review can be left at any step. A step
with nothing to show is left out (invariant 77: no "0 overdue").

**Morning: "What do I need to do today, and how do I get started?"**

1. **Last night.** The promises made in last night's Evening Review:
   - tomorrow's first task;
   - each Evening Prep step ticked ("Bag packed ✓, Clothes ready ✓"),
     read from that routine's log;
   - any step left, offered as "Do it now" (it ticks into yesterday's
     log only if before the day boundary, otherwise into a one-off
     reminder; decision F).

   Shown only if an Evening Review or Evening Prep happened.
2. **Morning Routine.** The routine's checklist inline, with Start
   routine for the player. It is hidden once the routine is done, and
   it is never shown after the routine's window has closed.
3. **Today.** One timeline from `KOS.today.timeline`:
   - lessons (from the timetable) with rooms where known;
   - events, study blocks and exams;
   - the evening review as the last mark.

   Beside it, **Due**:
   - reminders due today or overdue;
   - assignments due within 3 days, and any already started;
   - plan rows carried over;
   - exam warnings (inside the lead time, start-by today, a milestone at
     risk);
   - pinned goals with their pace ("2 h behind this week").
4. **Today's three.** Up to three picks, offered from `KOS.today.next`
   and the Due list (tap to pick or swap). They are stored as refs
   (§6.4), never copies, and Home shows them all day (§6.6). Skipping
   this step leaves Home's own ladder in charge.
5. **Start.** One large action: **Start: <first pick>**. It opens About
   to Study already filled (or Focus directly if the pre-flight is off),
   with the first concrete action from last night when there is one.
   Secondary: "Not yet" closes the review.

**Afternoon: "Given what has happened today, what should I do with the
time remaining?"**

1. **So far.**
   - Focus time (the total and a bar per subject);
   - Today's three (done, started or untouched);
   - ticks;
   - the morning routine (kept or not, said once and gently).
2. **Still today.** What remains on the timeline after now, and
   outstanding deadlines (today, tomorrow, at risk). **Folded morning
   items** show here (§7).
3. **Time left.** `KOS.today.free` as a strip from now to the evening
   review ("2 h 40 free, in two blocks"). Each item can be:
   - placed into a free block, which creates a **study block** through
     `KOS.calendar.addEvent`, linked by assignment id (invariant 45);
   - moved to tomorrow, through the owner: `KOS.reminders.update({due})`,
     an assignment's work-on date (§10.1), or `KOS.pacing.updateEntry`;
   - dropped from today's three;
   - marked done.
4. **Next.** "Start: <next>" (the pre-flight), or **Done for now**
   (closes it; the evening review still comes).

**Evening: "What happened today, what remains important, and how should
I prepare for tomorrow?"**

1. **Today in numbers.** A small Reports card from `KOS.review.dayFacts`,
   which is the same pure `KOS.report.compute` over a one-day period:
   - Focus time and sessions;
   - cards reviewed;
   - tasks and reminders completed;
   - lessons covered (Code, Japanese);
   - routines kept;
   - goal movement;
   - one comparison with the week's average.

   It uses Reports' rules: zeros are absent and comparisons go through
   `compare()`. "Full day →" opens Reports.
2. **Unfinished.** Each open item that was in today's three, was due
   today, or was a study block that did not run. Each has the choices
   **Tomorrow · Later this week (pick a day) · Someday (clear the date) ·
   Done · Leave it**. The default is **Leave it**, so nothing is forced
   forward. Every choice goes through the item's owner, and one tap
   undoes it (toast with Undo).
3. **Tomorrow.**
   - Tomorrow's timeline (the first lesson's time is the headline: "First
     lesson 08:50, Maths");
   - deadlines and exams within 3 days;
   - what to bring (§17);
   - the weather is not included (no network calls in this module).

   **Tomorrow's first task:** pick one, and write its first concrete
   action in one line. The Morning Review opens with it.
4. **Evening Prep.** The routine's checklist inline, or Start routine.
5. **Wind down.**
   - an optional one-line note on the day (private, kept in the review
     day, never sent);
   - an optional mood or energy tap (1–5; decision G);
   - **Good night**, which ends the review and, if you allow it, holds
     device alerts until the morning review (`notifyQuiet` for tonight
     only).

### 6.3 Weekdays, weekends and holidays

The weekday and weekend times differ (§6.1). School holidays use the
weekend times automatically: weeks with no class rows in Pacing count
as holiday (decision H). On a weekend the Morning Review leaves out the
timetable step when there are no lessons, and says "No lessons today".

### 6.4 What a review stores

Only its own state, in `state.review.days[routineDay]`:

```js
{
  morning:   { state: "done"|"skipped"|"folded"|null, seenAt, doneAt,
               three: [ {kind, id} ],          // refs, never copies
               first: {kind, id, action: "Draft the NEA analysis intro"} },
  afternoon: { state, seenAt, doneAt },
  evening:   { state, seenAt, doneAt, note, mood,
               tomorrow: { first: {kind, id, action} },
               triaged: { "<kind>:<id>": "tomorrow"|"week"|"someday"|"done"|"leave" } },
  words:     { morning: {text, by: "kurenai", at}, … }    // §8, optional
}
```

`triaged` is a record of what you chose. The change itself was made by
the item's owner at the time, so deleting a review day changes nothing
else. Kept for 60 days. Reports count reviews done; they never read
`note`.

### 6.5 The overlay

- One **review sheet** built on `KOS.ui.openDialog` (invariant 49 owns
  focus, Escape and scroll lock):
  - on desktop, a wide panel over a dimmed page, with the slot's art
    behind its header;
  - on a phone, a full-height sheet with steps in the thumb zone.
- **A step strip across the top** (Morning: Last night · Routine ·
  Today · Three · Start). Steps can be jumped. **Later** minimises it to
  a **chip** in the global header ("Morning review · 3 steps left").
  **Skip review** marks it skipped.
- **Kurenai** sits in the header art, using her redesigned sprite and
  expressions (§ art). Her line is the review's words (§8). She is
  decoration and can be hidden (`state.ui.review.portrait`); the review
  works without her.
- **When it opens by itself:** only on the first app open inside the
  slot (§7), and **never**:
  - over a running Focus session;
  - over an open dialog;
  - during the Exam Room;
  - on a deep link (a notification click to somewhere else, or a URL
    with a route): in those cases the chip appears instead.

  With `autoOpen` off, it is always the chip.
- **Reduced motion:** no slide-in. **Screen readers:** the step strip is
  a tablist; each step's heading is announced once.

### 6.6 Home with reviews

- **The hero's "Daily goal"** becomes **Today's three** when the
  morning review set them, with the first one's Start. Without them it
  stays the directive list it is now. Recovery still takes the slot in
  Critical (invariant 2).
- **The "Routines" card** becomes real:
  - the routines due now, with step progress and Start;
  - the day's habits as one-tap ticks;
  - "Review: Afternoon at 16:30", or the chip's state.
- **A review that was skipped** leaves nothing on Home. One that was
  minimised leaves the chip.

## 7. Smart consolidation

`KOS.review.due(now)` is pure and returns **at most one** review to
offer, plus what folds into it.

1. **The current slot** is the latest enabled slot whose time has
   passed today (in routine days). Before the morning time it is
   **none**. Yesterday's evening review is never offered the next
   morning.
2. **If the current slot is done or skipped:** none.
3. **Earlier slots of the same day that are not done or skipped** are
   marked **`folded`** when the current one is shown. Their
   still-relevant parts move into it:
   - **Morning folded into Afternoon:**
     - Today's three becomes "Pick up to three for the rest of today";
     - the Morning Routine is dropped once its window has closed;
     - "Last night" is kept only if tomorrow's first task is still open;
     - the timeline starts from now;
     - the first task's Start is kept.
   - **Morning or Afternoon folded into Evening:** nothing more is asked
     about today. Their open picks join "Unfinished".
4. **A slot that was minimised** (chip) and then passed by the next slot
   is **replaced** by it. You never see "Morning review" at 17:00.
5. **A late evening,** after midnight but before `dayStart`, is still
   that day's evening.
6. **After a missed evening,** the Morning Review's "Last night" step
   becomes **"Yesterday, quickly"**: only yesterday's three and due
   items still open, with the same triage choices. It is one step,
   never a whole evening review, and it is left out when nothing is
   open.

Folded and skipped states are recorded. Folded counts as neither done
nor skipped in Reports. No review has a streak (invariant 145).

## 8. The words: template first, Kurenai optional

Each review opens with a short paragraph (two or three sentences) and
Kurenai's one-liner in the header.

- **The template words (`KOS.review.words.template(slot, facts)`)** are
  deterministic, built from `KOS.today` and `dayFacts`:
  - "Three lessons, then a free afternoon. Your NEA draft is due
    Thursday, so it's the best first task."
  - "4 h 10 of Focus today, mostly Maths. Two things are still open; the
    reminder about the mock can wait."

  These always render first and instantly, with no network.
- **✦ Kurenai (optional, `words: "kurenai"` or per review):**
  - one `KOS.ai.chat("generation")` request carrying
    `KOS.review.payload(slot)`. It holds totals, times, counts and the
    TITLES of today's items. It never holds notes, card text, the
    evening note, money, or chat history;
  - "What is sent" prints exactly that, as Reports does (invariant
    102b);
  - the template shows while it is generating, and the reply replaces it
    in place;
  - a timeout (8 s), offline, a rate limit (429), a provider error or a
    refusal keeps the template, with no error note beyond a quiet
    "Kurenai's words aren't available right now";
  - the reply is cached in `days[d].words[slot]`, so reopening doesn't
    ask again.
- **Written ahead:**
  - With the app open at the slot's time, the words are requested then,
    so they are ready when the review opens.
  - With the server owning scheduled runs
    (`state.notifyCloud.serverRuns`, invariant 71b), the runner can
    write them from the published brief and send them in the push. This
    reuses the scheduled-message route (`aischedule`'s
    `applyServerRun`), so a closed-app notification can carry Kurenai's
    line. It runs only when you turn it on (decision D); otherwise the
    push carries the template line.
- **Kurenai never decides anything.** Her words describe and suggest;
  picks, triage and ticks are yours.

## 9. Notifications, open and closed

- **New kinds in `notify.js`:**
  - **`review`** (審, Productivity, view `routines`), id
    `review:<slot>:<day>`;
  - **`routine`** (習), id `routine:<id>:<day>`.

  Both can be muted (invariant 98) and are held in Exam Season's "quiet
  the rest" only if you choose (they are planning help, so not by
  default).
- **Open app:** a `KOS.review.tick()` every 30 s, alongside the other
  tickers, pushes the slot's notice once at its time. Its body is the
  template's first line ("Morning review · 3 lessons, NEA due Thursday").
  Clicking it opens the review (through `kos-open` → `KOS.show("routines",
  {review: slot})`).
- **Closed app:** `KOS.review.forecast(from, to)` and
  `KOS.routines.forecast(from, to)` join `KOS.outlook.build`'s week of
  notices (invariant 131), with the ledger's own ids, so the runner
  pushes each once and never while a device is open.
- **Quiet hours** hold review notices like any other device alert. "Good
  night" (§6.2) can set tonight's quiet window.

## 10. Tightening the modules (the "where does it show?" clean-up)

The rule (invariant 147): **where a record shows is derived from the
record, never asked for in a form.**

### 10.1 Assignments

- **The two checkboxes go:** "Show the deadline on the Calendar" and
  "Treat as a major deadline".
  - Every open assignment with a due date shows on the Calendar (a
    derived chip), in Today, the reviews, Home and search.
  - **Countdown** inclusion is derived by `KOS.assignments.isMajor(a)`:
    coursework, NEA or project; or priority High; or an estimate of
    3 h or more; or due within 3 days. You can still pin or unpin one
    from its detail ("Pin to countdowns" / "Unpin"). That is an action
    on the record, not a form field, stored as `countdown: "pin" |
    "hide" | null`. Default null means derived.
  - The old `showInCalendar`/`showInCountdown` stay readable for a
    release. On first read `showInCountdown: true` becomes `countdown:
    "pin"`, so nothing you marked disappears.
- **"Work on" dates (new, optional):** an assignment can carry
  `workOn: ["YYYY-MM-DD", …]`. These are days you mean to work on it,
  set from the Afternoon or Evening triage or from the assignment. They
  show in Today on those days. This is what "move to tomorrow" writes
  for an assignment, because its deadline is not yours to move.
- **The estimate's remaining time** (it exists) feeds the free-time
  placement (§6.2).

### 10.2 Calendar

- **The event modal's countdown box goes:** exams and deadlines always
  count down, and other kinds never do, with the same Pin and Unpin on
  the event's detail.
- **New derived chips:** routines with a window (§4.3) and the three
  review marks. Both can be hidden in the derived-chip menu.
- **Study blocks made by the Afternoon Review** are ordinary study
  blocks linked by assignment id (invariant 45).

### 10.3 Pacing

- **"Remind me by the week's end" stops copying** a plan row into a
  reminder. Instead:
  - an unticked personal row of this week shows in **Today**;
  - in the reviews (Due; "Unfinished" on Sunday evening);
  - and in **Reminders' Today and Scheduled lists as a derived row**
    "From your plan" that ticks through `KOS.pacing.setDone`.

  Reminders made before stay; they are yours.
- **Today's lessons** (`lessonsOn`) are the timetable in every review.
  A lesson sat can be ticked from the Evening Review's timeline
  (`setLessonSat`).
- **Carry-over notices** (`pace:carry`) fold into the Monday Morning
  Review when one happens that day, so the notice isn't sent twice.

### 10.4 Reminders (unchanged as a page)

- **Linked reminders:** a reminder can link a record (`link: {kind:
  "assignment"|"exam"|"goal", id}`). It then shows on that record's
  page ("Email Mr Hart" under the NEA assignment). The Assistant can
  set it.
- **Reviews change a reminder only through `KOS.reminders.update` or
  `toggle`,** so its rewards cap (8 a day) and once-per-day rule hold.
- **Smart lists gain "From your plan"** (above) and "From reviews"
  (nothing is created; it is a filter of items in today's three).

### 10.5 Exams

- **Exam warnings** in the reviews come from `KOS.exams.notices(day)`
  and readiness: start-by today, a milestone overdue, a test tomorrow,
  and the band turning At risk.
- **The Evening Review in Exam Season** adds "Tomorrow's exam" when
  there is one: the room, the time, what to bring, and the pre-exam
  checklist goal's open items (invariant 128 owns them).
- **Readiness's "At risk" naming a signal** gives a one-tap suggestion
  in the Afternoon Review ("Recall is behind: 20 minutes of the exam's
  cards").

### 10.6 Goals

- **Pinned goals:** `pinned: true` on up to three goals. They show in
  the Morning Review and on Home's Goals switch. Pin and unpin are
  actions on the goal page.
- **New productivity types** (registered by `routines.js`, read from
  the log, repeat by week or month):
  - **`routine-days`**: keep a routine N days a week;
  - **`routine-streak`**: replaces `habit-streak` (§5);
  - **`reviews-done`**: do N evening reviews a week. It counts, never
    shames; display only, so it pays nothing (decision E).
- Goal notices (`goal` kind) about tomorrow fold into the Evening
  Review's Tomorrow step when it runs that night, so the notice isn't
  sent twice.

### 10.7 Focus

- **The pre-flight** (§4.7).
- **Focus's review screen** (invariant 4b) gains one line: "Next in
  today's three: <item> · Start". It never pays again.
- **The Afternoon Review reads Focus time** from the ledger through
  `KOS.sessions.parts` (invariant 4a's split by stretch).

### 10.8 The Assistant

- **Read tools:**
  - `today_overview` (`KOS.today.build`);
  - `routines_list`;
  - `review_today` (the review day's state, the three, tomorrow's first
    task; never the note).
- **Write tools** (undoable, approval as usual):
  - `routine_add` (from a template or steps);
  - `routine_tick_step`;
  - `routine_rest_day`;
  - `review_set_three`;
  - `review_set_first`.
- **Aliases:** `todo_add_habit` and `todo_tick_habit` stay.
- **The system prompt's feature map** says Routines and Daily Review,
  and `LIMITS.cloudTools` ranking puts these under Productivity.

### 10.9 Reports

- **New facts:**
  - `f.routines`: kept days per routine, steps, rest days, the share of
    scheduled days kept;
  - `f.reviews`: morning, afternoon and evening done counts.

  Both are counts only in the words' payload (invariant 102b).
- **The day facts** that feed the Evening Review are the same
  `compute`, so a week's report and its seven evenings agree.

## 11. Rewards (the Governor)

Today a habit tick pays a `todo` tick (5 XP, 1 gold, +2 HP), with no cap
and untick and re-tick paying again. Moving to routines keeps what a
habit earned and closes the farm.

- **Steps pay nothing.** As with reminder sub-tasks, a step is progress
  inside one thing.
- **A routine's completion pays once per routine day** (`paid` in the
  log; unticking never refunds and re-completing never pays). It is a
  new session type, **`routine`**, priced by `KOS.governor.routineAward`
  (pure, beside `focusAward`). The figures are for decision B:

  | Routine | XP | Gold | HP |
  |---|---|---|---|
  | One step (a habit) | 5 | 1 | +2 (exactly what a habit paid) |
  | 2–4 required steps | 5 + 3 per required step after the first (max 14) | 1 | +3 |
  | 5+ required steps | 5 + 3 per step after the first, **max 25** | 2 | +4 |
  | Minimum version (§4.2) | 5 | 1 | +2 |

- **Daily cap:** at most **8 rewarded routine completions a day** (as
  reminders cap at 8). Past it, a routine still records and shows "No
  reward · why".
- **About to Study pays nothing itself;** Focus pays for the session
  (invariant 4a).
- **Reviews pay nothing and have no streak.** Actions taken inside a
  review pay through their owners as they always do: a reminder ticked,
  an assignment completed, Focus.
- **Streaks and HP:**
  - A routine completion is a **`todo`-class activity** for the HP
    day-activity test (invariant 4), never study. The study streak is
    unchanged.
  - A routine's own streak is a display, and gates nothing.
  - HP still gates nothing (invariant 2).
- **Rest days** pay nothing.

## 12. Files, routes and ownership

| Contract | Owner |
|---|---|
| The day model: one pure read of the day across modules | `js/core/today.js` (`KOS.today`: `build`, `free`, `next`) |
| Routines: the record, templates, schedule, log, snapshot, streaks, completion, award hook, migration, forecast | `js/core/routines.js` (`KOS.routines`); templates `js/data/routine-templates.js` (AUTHORED) |
| The Daily Review: config, `due` (consolidation, pure), `dayFacts`, words (template, payload, Kurenai), actions through owners, notices, forecast, ticker | `js/core/review.js` (`KOS.review`) |
| The Routines page: today, routines, the editor and templates, history, schedules and notifications | `js/modules/routines.js` (`KOS.views.routines`, `#/routines[/today\|edit/<id>\|templates\|history\|settings]`; `#/tasks` aliases) |
| The review sheet and the routine player | `js/modules/review.js` (`KOS.reviewUI`: `open(slot)`, the chip, the steps), `js/modules/routineplayer.js` (`KOS.routinePlayer`) |
| The pre-flight before Focus | `KOS.routinePlayer.preflight(ctx, cb)`, called by `KOS.focus` entry points |
| Styles | `css/views/routines.css` (the page, the player), the review sheet in `css/components.css` if the design makes it a primitive (`k-sheet--review`) |
| Directives (kept) | `js/modules/todo.js` shrinks to `KOS.todo` directives over `KOS.today`; the Habits view is removed |

**Load order:**
- `today.js`, `routines.js` and `review.js` load with the core, after
  `pacing.js`, `exams.js`, `goals.js` and `notify.js`;
- `routine-templates.js` loads with the authored data;
- the page modules load with the other modules.

**Boot, in `main.js`:**
- `KOS.routines.migrate()` runs after the first pull;
- `KOS.routines.seedTemplates()` offers the templates, it does not
  create them (§17);
- `KOS.review.tick` starts with the other tickers.

**The Routines page** (frames 33j–33s):
- **Today:** the status of the three reviews (done, skipped, next at
  16:30), the routines due now, and the day's habits;
- **Routines:** cards with steps, schedule and streak;
- **The editor:** steps that can be reordered (`KOS.ui.reorder`,
  invariant 89a), estimates, optional and minimum, days, window,
  weekend schedule, the review anchor and the reminder;
- **Templates;**
- **History:** a 12-week heat map per routine and for all of them, a
  week grid like today's Habits grid, and the reviews done;
- **Settings:** the review times (weekday and weekend), auto-open, the
  words, the portrait, the day start, the pre-flight, and the
  notification switches.

## 13. Releases and tests

Four releases, each whole, each on the 99-suite gate plus its own suite.

**R1 · Routines (replaces Habits).** smoke100.
- `routines.js` and its migration; the Routines page, editor, player,
  templates and history; Home's Routines card; Calendar's routine chips;
  the `routine` notifications and forecast; `routineAward` and the cap;
  the Goals `routine-*` types and the alias; the Reports input; the
  Assistant's routine tools and aliases; search.
- **Held by smoke100:**
  - migration (ids, days, frozen `todo.habits`, two-device idempotence);
  - the snapshot (editing steps never changes a past day);
  - streaks (scheduled days, rest days, today);
  - pay once and the cap;
  - render purity;
  - the merge of the log per key and per step.

**R2 · The day model and the clean-up.** smoke101.
- `KOS.today`; `KOS.todo` on top of it; Home's ladder through
  `KOS.today.next`; the assignment and event checkboxes replaced by
  derived rules and Pin/Unpin; `workOn`; Pacing's derived rows in place
  of copied reminders; linked reminders; pinned goals.
- **Held by smoke101:**
  - `KOS.today` against fixtures (school day, weekend, exam week,
    holiday);
  - `isMajor`;
  - `countdown: "pin"` migration;
  - Home and the review ladder agree.

**R3 · The Daily Review.** smoke102.
- `review.js`; the review sheet and the chip; the three reviews with
  their steps; consolidation; the template words; the `review`
  notifications, the ticker and the forecast; About to Study's
  pre-flight; Today's three on Home.
- **Held by smoke102:**
  - `due(now)` over a table of times and states (every fold and every
    "never");
  - actions go through owners (a spy on each owner);
  - skip and Later change nothing else;
  - no auto-open over Focus, a dialog or a deep link;
  - zero Governor traffic from reviews.

**R4 · Kurenai and the joins.** smoke103.
- ✦ Kurenai words with "What is sent"; written ahead (open app, and the
  runner when on); Reports' `f.routines` and `f.reviews`; the
  Assistant's review tools; Exams' and Goals' folds; Focus's "Next in
  today's three".
- **Held by smoke103:**
  - the payload holds no note, card text or amount;
  - a failure falls back to the template;
  - the runner's reply lands once.

The gate becomes 103 suites. Every release bumps `sw.js` and runs the
responsive audit at 1440, 1080, 700 and 390, plus `--ipad`, with images
inspected (the layout rule: no dead space).

## 14. Invariants this adds (142–149)

Numbered after Mind's 137–141.

- **142. ONE ROUTINE RECORD.**
  - A habit is a one-step routine.
  - `state.routines` (synced, random string ids, `KOS.routines.normalise`)
    is canonical.
  - Its log is a keyed map `"<routine>|<routineDay>"` that merges per
    key and per step.
  - The first tick of a day freezes the steps into `snap`, so editing a
    routine never rewrites a past day.
- **143. ROUTINES PAY ONCE.**
  - A routine's completion (every required step, or its minimum) pays
    `KOS.governor.routineAward` once per routine day, through
    `sessions.log({type: "routine"})`.
  - Steps, rest days, About to Study and unticking pay nothing.
  - At most 8 rewarded completions a day.
  - A completion is activity for the day, never study.
- **144. REVIEWS READ, OWNERS WRITE.**
  - A review stores only its own state (`state.review.days`).
  - Everything else it changes, it changes through that record's owner,
    at the moment you act.
  - It keeps refs, never copies.
  - Zero Governor traffic of its own; no review has a streak.
- **145. ONE REVIEW ON SCREEN.**
  - `KOS.review.due(now)` is pure and offers at most one review. Missed
    earlier slots fold into it, and a passed slot is never offered.
  - It opens by itself only on the first open inside its slot, never
    over Focus, a dialog, the Exam Room or a deep link.
  - Skip, Later and Esc never penalise.
- **146. TEMPLATE FIRST.**
  - A review's words are the template's, rendered at once.
  - ✦ Kurenai is one request with `KOS.review.payload` (no notes, card
    text, amounts or chat), printed exactly by "What is sent".
  - Any failure keeps the template.
  - Kurenai never picks, triages or ticks.
- **147. WHERE IT SHOWS IS DERIVED.**
  - A record's surfaces (Calendar, Countdowns, Today, the reviews,
    Home) are derived from its own fields.
  - A form never asks where something should appear.
  - The one exception is an explicit Pin or Unpin action on the record.
- **148. THE ROUTINE DAY.**
  - Routines and reviews use the routine day (`dayStart`, default
    04:00).
  - The session ledger, streaks and the Governor keep the calendar day
    (invariant 4).
- **149. TODAY IS A READ.** `KOS.today.build` is pure: it calls the
  owners' reads, writes nothing (a render writes nothing, smoke56), and
  is the one source for Home's next action, the reviews and the
  Assistant's day.

## 15. Risks

- **Nagging.** Three reviews, routine reminders and the existing
  notices could become a lot.
  - Mitigations: the folds (§7, §10.3, §10.6);
  - the routine reminder held when its review is near;
  - **Good night**;
  - each slot can be turned off;
  - an **"Easy week" switch** (§17) that leaves only the Morning
    Review.
- **Auto-open feeling hijacking.** The "never" list in §6.5 and the
  chip fallback. smoke102 holds it.
- **Two devices.**
  - Review state merges per day and per slot. The later `doneAt` wins
    and `skipped` loses to `done`.
  - A review done on the phone is not offered on the Mac.
  - Opening both at once can show the same review twice. That is
    harmless, because nothing it does is paid or duplicated.
- **Migration.** Deterministic ids, a frozen copy for one release, and
  one-way aliases. Rollback is a version back, with the frozen copy
  intact.
- **Scope creep in `KOS.today`.** It reads only; anything new it shows
  must already have an owner.
- **Late-night use and the day boundary.** Invariant 148 keeps the
  Governor on the calendar day, so a 00:30 routine counts for
  yesterday's routine day, while its activity counts for today's HP.
  This is said once in Help & Guide.

## 16. Decisions for you

- **A. The name.** "Routines" for the page and the strip, and "Daily
  Review" for the check-ins. (Alternatives: "Rhythm", "Day".)
- **B. Rewards.** The table in §11: one-step equals a habit today
  (5/1/+2); multi-step routines up to 25 XP, 2 gold, +4 HP; a cap of 8 a
  day; steps and reviews pay nothing.
- **C. Rest days.** One planned rest day per routine in any 7 days
  keeps the streak. More generous, or none?
- **D. Kurenai's words.** Off by default, with the template shown? Or
  on by default with the template as fallback? And should the server
  write them ahead for closed-app notifications (one metered request
  per review)?
- **E. Reviews and goals.** Is a "reviews-done" goal type wanted at
  all, or is it a quiet form of pressure?
- **F. "Do it now" after the day boundary.** Does an Evening Prep step
  ticked the next morning count for last night (more forgiving) or
  become a one-off reminder (more honest)?
- **G. Mood and energy.** Include the optional 1–5 tap in the Evening
  Review, used later for Focus suggestions? Or leave it out (privacy,
  less to do)?
- **H. Holidays.** Use weekend times automatically in weeks with no
  class rows in Pacing?
- **I. The pre-flight.** On by default before every Focus, or only when
  started from Home or a review?
- **J. The countdown rule.** `isMajor` as in §10.1 (coursework/project,
  High, 3 h+ or within 3 days), plus Pin/Unpin.

## 17. Suggestions beyond the brief

The ones I would build first:

1. **The bag list.** Each timetable lesson can carry "bring" items (PE
   kit, calculator, the CS textbook), and an exam carries its own (from
   the pre-exam checklist). Evening Prep's "Pack bag" step then shows
   **tomorrow's** bag, computed from tomorrow's timetable: the fiddliest
   part of the evening, done for you. It is stored on the timetable
   (`state.pacing.timetable`), never per day.
2. **"Leave by" from the timetable.** Morning's last step, "Leave for
   the bus", gets a time computed from the first lesson's start minus a
   travel time you set once. The morning routine's window follows it,
   and the player shows "11 minutes to the bus".
3. **The two-minute start.** Every "first concrete action" is asked as
   something you could do in two minutes ("Open the NEA doc and write
   the first heading"). Kurenai suggests one per task type when you
   don't write one. Starting is the hard part; this makes it tiny.
4. **Implementation intentions.** In the editor, an optional "When …,
   I will …" line per routine ("When I get home, I'll do About to
   Study"). The reviews read it back at the right time.
5. **Easy week / sick day.** One switch:
   - only the Morning Review;
   - routines on their minimum versions;
   - no routine reminders;
   - streaks paused for up to 7 days.

   It suits illness and the week after mocks, and it is honest because
   it is declared ahead and shown in Reports.
6. **Shutdown ritual.** The evening's last step marks "Done for the
   day". Until the morning, Home shows a calm "You're done for today"
   state instead of a to-do list, and device alerts hold.
7. **Templates gallery.** More templates beside the three you asked
   for:
   - Sunday weekly reset (plan the week in Pacing, clear the reminder
     inbox, check the bag list for Monday);
   - Exam morning;
   - After school (snack, 10-minute reset, About to Study);
   - Wind-down without screens.
8. **Routine insights** (after 4 weeks of data, invariant 76's honesty
   rule):
   - which steps get skipped most;
   - real time against estimates ("Breakfast averages 22 min, not 15");
   - the time you actually finish the morning routine against the bus.

   Suggestions only, never automatic changes.
9. **Home screen on a phone.** The PWA's shortcuts (manifest
   `shortcuts`) for "Morning routine", "Evening review" and "Start
   Focus". Two taps from the phone's home screen.
10. **Focus suggestions from energy.** If G is approved, the Afternoon
    Review suggests lighter work (cards, reading) on low-energy days and
    harder work (past papers) on high ones.
11. **Week review on Sunday evening.** The Sunday Evening Review gains
    one step: the week's report headline (already saved Monday 07:00,
    so this would be a preview from `compute`) and next week's first
    lesson. It is not a fourth review.
12. **Never a wall.** On a first visit the page offers the three
    templates as cards ("Start with these?"), rather than creating
    them. An empty review (nothing due, no routines) is one calm line
    ("Nothing pressing today. Start Focus on the plan's reading?") and
    closes itself after the start action.
