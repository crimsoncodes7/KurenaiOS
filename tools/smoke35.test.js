/* Kurenai OS — smoke35.test.js
   Build 6.6: the Calendar clean-up and the event model.

   The claims this suite pins down:

     NO GLOBAL ALERT SETTING. The page-level "remind me about deadlines"
     threshold is gone from the UI and from the store, and the day count it
     used to hold migrates into per-event alerts[] exactly once. An event
     whose alerts the user cleared stays cleared — normalise() must never
     re-seed a default over a deliberate choice.

     ONE RECORD PER THING. A recurring event is ONE record whose occurrences
     are computed; editing it edits every showing. An assignment is never
     copied into the calendar, and the Countdown rail is a merged READ over
     the two canonical stores, filtered by a field on each record rather
     than by a second copy.

     THE MODAL. One modal adds and edits, discloses progressively, shows
     only the conditional section its type owns, validates dates and times,
     and keeps Delete away from Save.

   Run: node tools/smoke35.test.js                                          */
const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const dom = new JSDOM(html, { url: "http://localhost/index.html", runScripts: "outside-only", pretendToBeVisual: true });
const { window } = dom;
const { document } = window;
const errors = [];
window.addEventListener("error", e => errors.push("window error: " + e.message));
const noop = () => {};
const ctxStub = new Proxy({}, { get: (t, k) => k === "measureText" ? () => ({ width: 10 }) : (typeof k === "string" ? noop : undefined), set: () => true });
window.HTMLCanvasElement.prototype.getContext = () => ctxStub;
window.requestAnimationFrame = cb => setTimeout(cb, 0);
window.confirm = () => true; window.__kosAutoConfirm = true;
if (!window.AbortController) window.AbortController = class { constructor() { this.signal = {}; } abort() {} };
const { indexedDB, IDBKeyRange } = require("fake-indexeddb");
window.indexedDB = indexedDB; window.IDBKeyRange = IDBKeyRange;
window.fetch = () => Promise.reject(new Error("network disabled in this suite"));
window.URL.createObjectURL = () => "blob:stub/1";
window.URL.revokeObjectURL = () => {};

const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
for (const src of scripts) {
  try { window.eval(fs.readFileSync(path.join(ROOT, src), "utf8")); }
  catch (e) { errors.push(`LOAD FAIL ${src}: ${e.message}`); }
}
const KOS = window.KOS;
if (KOS.autosync) KOS.autosync.stop();
const C = () => KOS.calendar;
const steps = [];
const step = (n, f) => steps.push([n, f]);
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const click = n => { if (!n) throw new Error("nothing to click"); n.dispatchEvent(new window.MouseEvent("click", { bubbles: true })); };
const tick = ms => new Promise(r => setTimeout(r, ms || 40));
const T = () => KOS.srs.todayISO();
const src = f => fs.readFileSync(path.join(ROOT, f), "utf8");

function reset() {
  KOS.store.state.calendar = { nextId: 1, seeded: true, events: [], notified: {}, v: 2 };
  KOS.store.state.assignments = { v: 1, nextId: 1, items: [] };
  KOS.store.state.reminders = { v: 1, nextId: 1, items: [], lists: [], rewardLog: {}, migrated: true };
}
function closeModals() { $$(".modal-ov").forEach(n => n.remove()); }
function labelled(text) {
  return $$(".cal-field").find(l => (l.querySelector("span") || {}).textContent === text);
}

/* ============ 1 · the retired global setting ============ */
console.log("== the global threshold is gone ==");
step("no page-level reminder threshold in the UI or the defaults", async () => {
  reset();
  KOS.show("calendar");
  await tick(60);
  if ($(".cal-thresh")) throw new Error("the global threshold control is still on the page");
  if (/Remind me about deadlines/.test(document.body.textContent))
    throw new Error("the global threshold copy is still rendered");
  if ("notifyDays" in KOS.store.state.calendar)
    throw new Error("notifyDays survived in a freshly reset branch");
  if (/notifyDays: *3/.test(src("js/core/store.js")))
    throw new Error("store DEFAULTS still ship the global threshold");
});

step("a v1 branch migrates its threshold into per-event alerts exactly once", () => {
  /* the shape a pre-6.6 install actually holds */
  KOS.store.state.calendar = {
    nextId: 4, seeded: true, notifyDays: 7, notified: {},
    events: [
      { id: 1, title: "legacy exam", date: KOS.srs.addDays(T(), 9), time: "09:00", type: "exam", subject: "maths", recur: "none" },
      { id: 2, title: "legacy silenced", date: KOS.srs.addDays(T(), 9), type: "deadline", recur: "none", notify: -1 },
      { id: 3, title: "legacy explicit", date: KOS.srs.addDays(T(), 9), type: "deadline", recur: "none", notify: 2 }
    ]
  };
  const evs = KOS.store.state.calendar.events;
  C().eventsOn(T());                                   // any read triggers the pass
  if (KOS.store.state.calendar.v !== 2) throw new Error("the branch was not stamped as migrated");
  if ("notifyDays" in KOS.store.state.calendar) throw new Error("the global threshold was not removed");
  const byId = id => KOS.store.state.calendar.events.find(e => e.id === id);
  if (String(byId(1).alerts) !== "10080") throw new Error("the global 7 days did not become one alert: " + byId(1).alerts);
  if (byId(2).alerts.length) throw new Error("an explicit 'no alert' became an alert");
  if (String(byId(3).alerts) !== "2880") throw new Error("an explicit 2-day alert did not migrate: " + byId(3).alerts);
  if (byId(1).notify !== undefined) throw new Error("the legacy notify field survived");
  /* idempotent: a second pass must not touch anything */
  const snap = JSON.stringify(KOS.store.state.calendar.events);
  C().eventsOn(T());
  if (JSON.stringify(KOS.store.state.calendar.events) !== snap) throw new Error("the migration ran twice");
  if (evs === KOS.store.state.calendar.events && false) throw new Error("unreachable");
});

step("alerts live on the record: a default on create, never re-seeded on edit", () => {
  reset();
  const ex = C().addEvent({ title: "defaulted", date: KOS.srs.addDays(T(), 20), type: "exam" });
  if (String(ex.alerts) !== "4320") throw new Error("a new exam got no default warning: " + ex.alerts);
  const personal = C().addEvent({ title: "no default", date: T(), type: "personal" });
  if (personal.alerts.length) throw new Error("an ordinary event was given an alert it never asked for");
  /* the deliberate clear has to stick — this is the whole point of moving
     alerts onto the record */
  const cleared = C().updateEvent(ex.id, { alerts: [] });
  if (cleared.alerts.length) throw new Error("clearing every alert did not stick");
  const again = C().updateEvent(ex.id, { title: "renamed" });
  if (again.alerts.length) throw new Error("an unrelated edit re-seeded the default alert");
});

step("alerts fire per record, per occurrence, once a day", () => {
  reset();
  C().addEvent({ title: "week out", date: KOS.srs.addDays(T(), 6), type: "exam", alerts: [10080] });
  C().addEvent({ title: "night before", date: KOS.srs.addDays(T(), 6), type: "deadline", alerts: [1440] });
  const fired = C().checkReminders().map(f => f.ev.title);
  if (!fired.includes("week out")) throw new Error("a 1-week alert did not fire six days out");
  if (fired.includes("night before")) throw new Error("a 1-day alert fired six days out");
  if (C().checkReminders().length) throw new Error("the same alert fired twice in one day");
  /* a finished deadline stops shouting */
  reset();
  const done = C().addEvent({ title: "handed in", date: KOS.srs.addDays(T(), 1), type: "deadline", alerts: [4320], status: "complete" });
  if (C().checkReminders().length) throw new Error("a completed deadline still alerted");
  C().updateEvent(done.id, { status: "inProgress" });
  if (!C().checkReminders().length) throw new Error("reopening it did not restore the alert");
});

/* ============ 2 · recurrence is computed, never copied ============ */
console.log("== recurrence ==");
step("every cadence resolves occurrences from ONE record", () => {
  reset();
  const anchor = "2026-01-31";
  const mk = (recur, date) => C().addEvent({ title: recur, date: date || anchor, type: "lesson", recur: recur });
  const daily = mk("daily"), weekly = mk("weekly"), fort = mk("fortnightly"),
        monthly = mk("monthly"), yearly = mk("yearly");
  if (!C().occursOn(daily, "2026-02-05")) throw new Error("daily");
  if (!C().occursOn(weekly, "2026-02-07")) throw new Error("weekly (+7)");
  if (C().occursOn(weekly, "2026-02-06")) throw new Error("weekly matched the wrong weekday");
  if (!C().occursOn(fort, "2026-02-14")) throw new Error("fortnightly (+14)");
  if (C().occursOn(fort, "2026-02-07")) throw new Error("fortnightly fired on the off week");
  /* the 31st in a 28-day month lands on the last day rather than vanishing */
  if (!C().occursOn(monthly, "2026-02-28")) throw new Error("monthly did not clamp to the short month");
  if (C().occursOn(monthly, "2026-02-27")) throw new Error("monthly clamped too far");
  if (!C().occursOn(yearly, "2027-01-31")) throw new Error("yearly");
  if (KOS.store.state.calendar.events.length !== 5)
    throw new Error("recurrence materialised extra records: " + KOS.store.state.calendar.events.length);
  /* editing the one record moves every showing */
  C().updateEvent(weekly.id, { title: "moved" });
  if (C().eventsOn("2026-02-07").find(e => e.id === weekly.id).title !== "moved")
    throw new Error("an edit did not reach a later occurrence");
});

step("an end date stops the repeat, and nextOccurrence skips past dates", () => {
  reset();
  const ev = C().addEvent({ title: "term only", date: "2026-01-05", type: "lesson", recur: "weekly", recurUntil: "2026-02-02" });
  if (!C().occursOn(ev, "2026-02-02")) throw new Error("the last day was excluded");
  if (C().occursOn(ev, "2026-02-09")) throw new Error("the repeat outlived its end date");
  if (C().nextOccurrence(ev, "2026-02-03") !== null) throw new Error("an expired repeat still reported a next date");
  const live = C().addEvent({ title: "ongoing", date: "2026-01-05", type: "lesson", recur: "weekly" });
  const next = C().nextOccurrence(live, "2026-03-10");
  if (KOS.srs.daysBetween("2026-03-10", next) > 6) throw new Error("nextOccurrence overshot: " + next);
});

step("a recurring exam counts down from its NEXT occurrence", () => {
  reset();
  C().addEvent({ title: "weekly test", date: KOS.srs.addDays(T(), -70), type: "exam", recur: "weekly" });
  const d = C().deadlines()[0];
  if (!d) throw new Error("a past-dated recurring exam disappeared from the countdown");
  if (d.days < 0 || d.days > 6) throw new Error("counted from the original date, not the next one: " + d.days);
});

/* ============ 3 · countdowns derive, never duplicate ============ */
console.log("== countdowns ==");
step("the rail merges two canonical stores and honours the field on each", () => {
  reset();
  const shown = C().addEvent({ title: "shown exam", date: KOS.srs.addDays(T(), 5), type: "exam" });
  C().addEvent({ title: "hidden deadline", date: KOS.srs.addDays(T(), 2), type: "deadline", showInCountdown: false });
  C().addEvent({ title: "a lesson", date: KOS.srs.addDays(T(), 1), type: "lesson" });
  KOS.assignments.add({ title: "major essay", due: KOS.srs.addDays(T(), 3), showInCountdown: true });
  KOS.assignments.add({ title: "ordinary homework", due: KOS.srs.addDays(T(), 4), showInCountdown: false });

  const titles = C().countdowns(null).map(r => r.title);
  if (!titles.includes("shown exam")) throw new Error("the exam is missing");
  if (!titles.includes("major essay")) throw new Error("the assignment did not merge in");
  if (titles.includes("hidden deadline")) throw new Error("countdown visibility is not honoured");
  if (titles.includes("ordinary homework")) throw new Error("ordinary work became a major countdown");
  if (titles.includes("a lesson")) throw new Error("a lesson entered the deadline countdown");
  if (titles.join() !== "major essay,shown exam") throw new Error("not sorted nearest-first: " + titles.join());

  /* the assignment is a READ — nothing was written into the calendar */
  if (KOS.store.state.calendar.events.length !== 3)
    throw new Error("the countdown duplicated an assignment into the calendar");
  /* and hiding one is a field on the record, not a deletion */
  C().updateEvent(shown.id, { showInCountdown: false });
  if (C().countdowns(null).some(r => r.title === "shown exam")) throw new Error("hiding did not take effect");
  if (!C().deadlines().some(d => d.ev.id === shown.id)) throw new Error("hiding deleted the record instead of the row");
});

step("a completed deadline retires itself from the rail", () => {
  reset();
  const dl = C().addEvent({ title: "essay", date: KOS.srs.addDays(T(), 3), type: "deadline" });
  if (!C().countdowns(null).length) throw new Error("precondition");
  C().updateEvent(dl.id, { status: "complete" });
  if (C().countdowns(null).length) throw new Error("a finished deadline stayed in the countdown");
});

step("the widget renders merged rows the user can open", async () => {
  reset();
  C().addEvent({ title: "widget exam", date: KOS.srs.addDays(T(), 4), type: "exam" });
  KOS.assignments.add({ title: "widget essay", due: KOS.srs.addDays(T(), 2), showInCountdown: true });
  const w = C().countdownWidget(null);
  if (!/widget exam/.test(w.textContent) || !/widget essay/.test(w.textContent))
    throw new Error("the widget did not merge both stores");
  if (!w.querySelectorAll("button.dl-item").length) throw new Error("countdown rows are not openable");
});

/* ============ 4 · the grid ============ */
console.log("== the grid ==");
step("month: whole weeks, a marked today, and one chip per record", async () => {
  reset();
  C().addEvent({ title: "grid weekly", date: KOS.srs.addDays(T(), -14), type: "lesson", recur: "weekly", time: "10:00" });
  KOS.show("calendar");
  await tick(70);
  const cells = $$(".cal-cell").length;
  if (cells !== 35 && cells !== 42) throw new Error("the month is not whole weeks: " + cells);
  const todayCell = $(".cal-cell.today");
  if (!todayCell) throw new Error("today is not distinguished");
  if (!todayCell.querySelector(".cal-daynum")) throw new Error("today has no day number");
  if (!$$(".cal-ev").some(n => /grid weekly/.test(n.textContent)))
    throw new Error("the recurring lesson did not paint");
  if (!$$(".cal-ev .cal-ev-re").length) throw new Error("a recurring occurrence carries no repeat mark");
  /* legibility: the title is its own truncating element, not raw text */
  const chip = $$(".cal-ev").find(n => /grid weekly/.test(n.textContent));
  if (!chip.querySelector(".cal-ev-t")) throw new Error("the chip title is not a truncation target");
  if (!chip.getAttribute("title")) throw new Error("the chip carries no hover detail");
  if (!chip.getAttribute("aria-label")) throw new Error("the chip is unlabelled for screen readers");
});

step("day overflow collapses into a sheet that lists everything", async () => {
  reset();
  for (let i = 0; i < 6; i++) C().addEvent({ title: "busy " + i, date: T(), type: "personal", time: "0" + (9 + i) + ":00" });
  KOS.assignments.add({ title: "busy assignment", due: T() });
  KOS.reminders.add({ title: "busy reminder", due: T() });
  KOS.show("calendar", undefined, { _nav: true });
  await tick(70);
  const todayCell = $(".cal-cell.today");
  const more = todayCell.querySelector(".cal-more");
  if (!more) throw new Error("eight items in one cell produced no overflow control");
  if (todayCell.querySelectorAll(".cal-ev").length > 4) throw new Error("the cell rendered everything anyway");
  if (!/^\+\d+ more$/.test(more.textContent)) throw new Error("overflow copy: " + more.textContent);
  click(more);
  await tick(60);
  const sheet = $(".cal-day-modal");
  if (!sheet) throw new Error("the day sheet did not open");
  const rows = [...sheet.querySelectorAll(".cal-day-row")];
  if (rows.length !== 8) throw new Error("the sheet dropped items: " + rows.length);
  if (!rows.some(r => /busy assignment/.test(r.textContent))) throw new Error("the assignment is missing from the sheet");
  if (!rows.some(r => /busy reminder/.test(r.textContent))) throw new Error("the reminder is missing from the sheet");
  closeModals();
});

step("a single extra item is shown rather than hidden behind '+1 more'", async () => {
  reset();
  for (let i = 0; i < 4; i++) C().addEvent({ title: "four " + i, date: T(), type: "personal" });
  KOS.show("calendar", undefined, { _nav: true });
  await tick(70);
  const cell = $(".cal-cell.today");
  if (cell.querySelector(".cal-more")) throw new Error("a '+1 more' hid exactly one chip for no gain");
  if (cell.querySelectorAll(".cal-ev").length !== 4) throw new Error("chips: " + cell.querySelectorAll(".cal-ev").length);
});

step("clicking a chip opens the detail, not the editor", async () => {
  reset();
  C().addEvent({ title: "read me", date: T(), type: "exam", time: "09:00", endTime: "10:30",
    paper: "Paper 2", room: "Hall", durationMins: 90, subject: "maths" });
  KOS.show("calendar", undefined, { _nav: true });
  await tick(70);
  click($$(".cal-ev").find(n => /read me/.test(n.textContent)));
  await tick(50);
  const card = $(".cal-detail-modal");
  if (!card) throw new Error("no detail card");
  if (card.querySelector("input, textarea, select")) throw new Error("the detail card is an editor in disguise");
  if (!/09:00–10:30/.test(card.textContent)) throw new Error("the time range is not shown");
  if (!/Paper 2/.test(card.textContent) || !/Hall/.test(card.textContent))
    throw new Error("exam detail is missing from the card");
  const foot = card.querySelector(".cal-modal-foot");
  if (!foot.querySelector(".cal-foot-del")) throw new Error("no delete on the detail card");
  if (![...foot.querySelectorAll("button")].some(b => b.textContent === "Edit")) throw new Error("no way through to editing");
  closeModals();
});

step("week is a time grid: an all-day band, an hour gutter, placed blocks", async () => {
  reset();
  C().addEvent({ title: "timed", date: T(), type: "lesson", time: "11:00", endTime: "12:30" });
  C().addEvent({ title: "overlapping", date: T(), type: "study", time: "11:30", endTime: "12:00" });
  C().addEvent({ title: "whole day", date: T(), type: "personal", allDay: true });
  KOS.store.state.ui.calMode = "week";
  KOS.show("calendar", undefined, { _nav: true });
  await tick(70);
  if (!$(".cal-week")) throw new Error("no time grid");
  if ($$(".cw-col").length !== 7) throw new Error("columns: " + $$(".cw-col").length);
  const band = [...$$(".cw-band-col")].map(n => n.textContent).join(" ");
  if (!/whole day/.test(band)) throw new Error("an all-day event did not reach the band");
  if (/timed/.test(band)) throw new Error("a timed event was dumped in the all-day band");
  const blocks = $$(".cal-ev.block");
  if (blocks.length !== 2) throw new Error("timed blocks: " + blocks.length);
  if (!blocks.every(b => b.style.top && b.style.height)) throw new Error("blocks are not placed by time");
  /* overlapping events share the column instead of hiding each other */
  if (!blocks.every(b => /calc\(/.test(b.style.width))) throw new Error("overlap was not packed into columns");
  KOS.store.state.ui.calMode = "month";
});

step("assignments and reminders ride the grid without becoming events", async () => {
  reset();
  const evs = KOS.store.state.calendar.events.length;
  KOS.assignments.add({ title: "derived work", due: T(), showInCalendar: true });
  KOS.reminders.add({ title: "derived reminder", due: T() });
  KOS.show("calendar", undefined, { _nav: true });
  await tick(70);
  if (!$$(".cal-ev.cal-asg").some(n => /derived work/.test(n.textContent))) throw new Error("no assignment chip");
  if (!$$(".cal-ev.cal-rem").some(n => /derived reminder/.test(n.textContent))) throw new Error("no reminder chip");
  if (KOS.store.state.calendar.events.length !== evs) throw new Error("the grid wrote shadow events");
  if (C().deadlines().length) throw new Error("a derived item entered the calendar's own deadlines()");
});

/* ============ 5 · the event modal ============ */
console.log("== the modal ==");
step("core fields are visible, the rest is disclosed", async () => {
  reset();
  closeModals();
  C().eventModal(null, T(), null);
  await tick(40);
  const modal = $(".cal-ev-modal");
  if (!modal) throw new Error("the editor did not open");
  ["Title", "Date", "Start", "End", "Type", "Colour"].forEach(k => {
    if (!labelled(k)) throw new Error("core field missing: " + k);
  });
  if (!modal.querySelector('input[type="checkbox"]')) throw new Error("no all-day control");
  const discs = [...modal.querySelectorAll(".cal-disc")];
  if (discs.length < 2) throw new Error("no progressive disclosure");
  const closed = discs.filter(d => !d.classList.contains("open"));
  if (!closed.length) throw new Error("everything is expanded — that is not disclosure");
  closed.forEach(d => {
    if (d.querySelector(".cal-disc-h").getAttribute("aria-expanded") !== "false")
      throw new Error("a collapsed section lies about its state");
  });
  /* opening one reveals its fields */
  const details = discs.find(d => /Details/.test(d.textContent));
  click(details.querySelector(".cal-disc-h"));
  if (!details.classList.contains("open")) throw new Error("a section did not open");
  if (details.querySelector(".cal-disc-h").getAttribute("aria-expanded") !== "true")
    throw new Error("aria-expanded did not follow");
  ["Subject", "Topic ref", "Location", "Description"].forEach(k => {
    if (!labelled(k)) throw new Error("detail field missing: " + k);
  });
  closeModals();
});

step("each type discloses ONLY its own conditional section", async () => {
  reset();
  closeModals();
  C().eventModal(null, T(), null);
  await tick(40);
  const type = $(".cal-ev-modal").querySelector("select");
  const set = v => { type.value = v; type.onchange(); };

  set("exam");
  ["Paper", "Duration (min)", "Room", "Related topics"].forEach(k => {
    if (!labelled(k)) throw new Error("exam field missing: " + k);
  });
  if (labelled("Priority")) throw new Error("deadline fields leaked into an exam");

  set("deadline");
  if (!labelled("Priority") || !labelled("Status")) throw new Error("deadline fields missing");
  if (labelled("Paper")) throw new Error("exam fields survived a type change");
  const countdown = [...$(".cal-ev-modal").querySelectorAll(".cal-check")]
    .find(l => /Countdown/.test(l.textContent));
  if (!countdown || countdown.hidden) throw new Error("no countdown-visibility control on a deadline");

  set("study");
  if (!labelled("Intended duration (min)")) throw new Error("no intended duration");
  if (!labelled("Linked assignment")) throw new Error("no linked-assignment control");
  if (![...$(".cal-ev-modal").querySelectorAll("button")].some(b => /focus session/i.test(b.textContent)))
    throw new Error("no focus-session shortcut on a study block");

  set("personal");
  if (labelled("Paper") || labelled("Priority") || labelled("Intended duration (min)"))
    throw new Error("a plain event still shows a conditional section");
  const cdRow = [...$(".cal-ev-modal").querySelectorAll(".cal-check")].find(l => /Countdown/.test(l.textContent));
  if (cdRow && !cdRow.hidden) throw new Error("countdown visibility offered on a type that never counts down");
  closeModals();
});

step("the linked assignment is a LINK — the block copies nothing", async () => {
  reset();
  const a = KOS.assignments.add({ title: "linkable work", subject: "compsci", due: KOS.srs.addDays(T(), 4) });
  closeModals();
  C().eventModal(null, T(), null);
  await tick(40);
  const modal = $(".cal-ev-modal");
  const type = modal.querySelector("select");
  type.value = "study"; type.onchange();
  const sel = labelled("Linked assignment").querySelector("select");
  if (sel.disabled) throw new Error("an open assignment did not reach the picker");
  if (![...sel.options].some(o => /linkable work/.test(o.textContent))) throw new Error("the assignment is not listed");
  sel.value = String(a.id);
  modal.querySelector('input[type="text"]').value = "study block";
  click([...modal.querySelectorAll(".cal-modal-foot button")].find(b => /Add event/.test(b.textContent)));
  await tick(40);
  const ev = KOS.store.state.calendar.events.find(e => e.title === "study block");
  if (!ev) throw new Error("the block did not save");
  if (ev.assignmentId !== a.id) throw new Error("the link was not stored");
  if (/linkable work/.test(JSON.stringify(ev))) throw new Error("the block copied the assignment's data");
  /* the record it points at stays the only copy */
  KOS.assignments.update(a.id, { title: "renamed work" });
  if (KOS.assignments.get(ev.assignmentId).title !== "renamed work") throw new Error("the link went stale");
  closeModals();
});

step("dates and times are validated before anything is written", async () => {
  reset();
  closeModals();
  C().eventModal(null, T(), null);
  await tick(40);
  const modal = $(".cal-ev-modal");
  const save = [...modal.querySelectorAll(".cal-modal-foot button")].find(b => /Add event/.test(b.textContent));
  const before = KOS.store.state.calendar.events.length;

  click(save);                                        // no title
  if ($(".cal-errs").hidden) throw new Error("an empty title saved silently");
  if (KOS.store.state.calendar.events.length !== before) throw new Error("an invalid event was written");
  if (!modal.querySelector(".cal-in.bad")) throw new Error("the offending field is not marked");

  modal.querySelector('input[type="text"]').value = "valid title";
  const times = modal.querySelectorAll('input[type="time"]');
  times[0].value = "14:00"; times[1].value = "13:00";
  click(save);
  if ($(".cal-errs").hidden) throw new Error("an end before its start saved");
  if (!/after the start/.test($(".cal-errs").textContent)) throw new Error("the message does not say what is wrong");
  if (KOS.store.state.calendar.events.length !== before) throw new Error("a backwards time range was written");

  times[1].value = "15:00";
  click(save);
  await tick(30);
  if (KOS.store.state.calendar.events.length !== before + 1) throw new Error("a valid event did not save");
  const ev = KOS.store.state.calendar.events[before];
  if (ev.time !== "14:00" || ev.endTime !== "15:00") throw new Error("times: " + ev.time + "-" + ev.endTime);
  closeModals();
});

step("an all-day event drops its times, and an end alone is refused", async () => {
  reset();
  closeModals();
  C().eventModal(null, T(), null);
  await tick(40);
  const modal = $(".cal-ev-modal");
  const save = [...modal.querySelectorAll(".cal-modal-foot button")].find(b => /Add event/.test(b.textContent));
  modal.querySelector('input[type="text"]').value = "end only";
  const times = modal.querySelectorAll('input[type="time"]');
  times[1].value = "16:00";
  click(save);
  if ($(".cal-errs").hidden) throw new Error("an end time without a start was accepted");

  const allDay = modal.querySelector('input[type="checkbox"]');
  allDay.checked = true; allDay.onchange();
  if (!times[0].disabled) throw new Error("all-day did not disable the time fields");
  click(save);
  await tick(30);
  const ev = KOS.store.state.calendar.events.find(e => e.title === "end only");
  if (!ev) throw new Error("the all-day event did not save");
  if (!ev.allDay || ev.time || ev.endTime) throw new Error("an all-day event kept a time");
  closeModals();
});

step("the same modal edits, and Delete stays away from Save", async () => {
  reset();
  const ev = C().addEvent({ title: "editable", date: T(), type: "deadline", priority: 3, description: "notes here" });
  closeModals();
  C().eventModal(ev, null, null);
  await tick(40);
  const modal = $(".cal-ev-modal");
  if (!/Edit event/.test(modal.textContent)) throw new Error("the editor did not open in edit mode");
  if (modal.querySelector('input[type="text"]').value !== "editable") throw new Error("fields were not populated");
  /* a section with content is disclosed already — the user should not hunt */
  const details = [...modal.querySelectorAll(".cal-disc")].find(d => /Details/.test(d.textContent));
  if (!details.classList.contains("open")) throw new Error("a populated section opened closed");

  const foot = modal.querySelector(".cal-modal-foot");
  const buttons = [...foot.querySelectorAll("button")];
  const del = foot.querySelector(".cal-foot-del");
  if (!del) throw new Error("no delete in the editor");
  if (buttons.indexOf(del) !== 0) throw new Error("delete is not separated to the far side of the footer");
  const save = buttons.find(b => /Save changes/.test(b.textContent));
  if (buttons.indexOf(save) !== buttons.length - 1) throw new Error("save is not the last, primary action");
  if (!save.classList.contains("primary")) throw new Error("save is not the primary action");
  if (!buttons.some(b => b.textContent === "Cancel")) throw new Error("no cancel");

  modal.querySelector('input[type="text"]').value = "edited";
  click(save);
  await tick(30);
  if (C().getEvent(ev.id).title !== "edited") throw new Error("the edit did not persist");
  if (KOS.store.state.calendar.events.length !== 1) throw new Error("editing created a second record");
  closeModals();
});

step("cancelling an edit leaves the record untouched", async () => {
  reset();
  const ev = C().addEvent({ title: "keep me", date: T(), type: "personal" });
  const before = JSON.stringify(C().getEvent(ev.id));
  closeModals();
  C().eventModal(ev, null, null);
  await tick(40);
  const modal = $(".cal-ev-modal");
  modal.querySelector('input[type="text"]').value = "thrown away";
  click([...modal.querySelectorAll(".cal-modal-foot button")].find(b => b.textContent === "Cancel"));
  await tick(30);
  if (JSON.stringify(C().getEvent(ev.id)) !== before) throw new Error("a cancelled edit still wrote");
  closeModals();
});

step("switching a type clears the fields that type does not own", () => {
  reset();
  const ex = C().addEvent({ title: "was an exam", date: T(), type: "exam", paper: "Paper 1", room: "Hall",
    durationMins: 90, topics: [{ subject: "maths", ref: "A1" }] });
  const now = C().updateEvent(ex.id, { type: "personal", paper: "", room: "", topics: [], durationMins: null });
  if (now.paper || now.room || now.topics.length || now.durationMins)
    throw new Error("stale exam data survived the type change");
});

/* ============ 6 · the schema gate ============ */
console.log("== the schema gate ==");
step("normalise() is the only door into the store", () => {
  reset();
  const ev = C().addEvent({ title: "  padded  ", date: "not-a-date", type: "nonsense",
    time: "9:05", endTime: "08:00", recur: "hourly", colour: "chartreuse",
    alerts: [60, 60, -5, "1440", 99999999], priority: 99, status: "invented",
    smuggled: "should not exist" });
  if (ev.title !== "padded") throw new Error("the title was not trimmed");
  if (ev.date !== T()) throw new Error("an invalid date was stored: " + ev.date);
  if (ev.type !== "personal") throw new Error("an invented type was stored: " + ev.type);
  if (ev.time !== "09:05") throw new Error("the time was not padded: " + ev.time);
  if (ev.endTime !== null) throw new Error("an end before its start was kept");
  if (ev.recur !== "none") throw new Error("an invented cadence was stored");
  if (ev.colour !== "") throw new Error("an invented colour was stored");
  if (String(ev.alerts) !== "60,1440,99999999") throw new Error("alerts were not cleaned: " + ev.alerts);
  if (ev.priority !== 3) throw new Error("priority was not clamped: " + ev.priority);
  if (ev.status !== "notStarted") throw new Error("an invented status was stored");
  if ("smuggled" in ev) throw new Error("an unlisted field entered the store");
  if (ev.v !== 2) throw new Error("the record is unversioned");
});

step("deadline status speaks the assignment tracker's vocabulary", () => {
  const calStatuses = KOS.assignments.STATUSES.map(s => s.v);
  const ev = C().addEvent({ title: "vocab", date: T(), type: "deadline", status: "blocked" });
  if (ev.status !== "blocked") throw new Error("a tracker status was rejected by the calendar");
  if (!calStatuses.includes(ev.status)) throw new Error("the two vocabularies have drifted");
});

/* ============ 7 · persistence ============ */
console.log("== persistence ==");
step("every field survives a backup round-trip", () => {
  reset();
  const made = C().addEvent({
    title: "full record", date: KOS.srs.addDays(T(), 3), type: "exam", subject: "maths",
    ref: "4.1.1.1", time: "09:00", endTime: "11:00", description: "everything", location: "Hall",
    colour: "sage", recur: "yearly", recurUntil: KOS.srs.addDays(T(), 900),
    alerts: [1440, 10080], paper: "Paper 3", room: "B12", durationMins: 120,
    topics: [{ subject: "maths", ref: "4.1.1.1" }], showInCountdown: true
  });
  const before = JSON.stringify(made);
  const snapshot = JSON.parse(JSON.stringify(KOS.store.state));
  KOS.store.replaceState(snapshot);
  const after = C().getEvent(made.id);
  if (JSON.stringify(after) !== before) throw new Error("a field changed across the round-trip");
});

step("a pre-6.6 backup restores and keeps working", () => {
  KOS.store.replaceState({
    progress: {},
    calendar: { nextId: 2, seeded: true, notifyDays: 5, notified: {},
      events: [{ id: 1, title: "old world", date: KOS.srs.addDays(T(), 4), type: "deadline", recur: "none", notify: 1 }] }
  });
  const ev = C().eventsOn(KOS.srs.addDays(T(), 4))[0];
  if (!ev) throw new Error("the restored event vanished");
  if (String(ev.alerts) !== "1440") throw new Error("the restored event did not migrate: " + ev.alerts);
  if ("notifyDays" in KOS.store.state.calendar) throw new Error("the restored global threshold survived");
  const fresh = C().addEvent({ title: "after restore", date: T(), type: "personal" });
  if (!fresh || !C().getEvent(fresh.id)) throw new Error("cannot write after restoring an old backup");
});

/* ============ 8 · the boundaries the rest of the app relies on ============ */
console.log("== boundaries ==");
step("the calendar never logs a session or moves the governor", () => {
  reset();
  const g = KOS.store.state.governor;
  const before = { hp: g.hp, gold: g.gold, xp: g.xp, sessions: KOS.sessions.all().length };
  const ev = C().addEvent({ title: "no reward", date: T(), type: "exam" });
  C().updateEvent(ev.id, { status: "complete", title: "still no reward" });
  C().checkReminders();
  C().deleteEvent(ev.id);
  if (g.hp !== before.hp || g.gold !== before.gold || g.xp !== before.xp)
    throw new Error("the calendar moved the economy");
  if (KOS.sessions.all().length !== before.sessions) throw new Error("the calendar logged a session");
});

step("deleting an event cleans up its alert bookkeeping", () => {
  reset();
  const ev = C().addEvent({ title: "noisy", date: KOS.srs.addDays(T(), 1), type: "exam", alerts: [4320] });
  C().checkReminders();
  if (!Object.keys(KOS.store.state.calendar.notified).length) throw new Error("precondition: nothing fired");
  C().deleteEvent(ev.id);
  const stale = Object.keys(KOS.store.state.calendar.notified).filter(k => k.split("|")[1] === String(ev.id));
  if (stale.length) throw new Error("alert keys outlived the event they belonged to");
});

step("the old callers still get the shapes they have always read", () => {
  reset();
  const blk = C().addEvent({ title: "study block", date: T(), type: "study", subject: "compsci", ref: "4.2.3.1", time: "16:00" });
  /* focus.js and todo.js both read eventsOn() + .time/.type/.subject/.ref */
  const found = C().eventsOn(T()).find(e => e.id === blk.id);
  if (!found || found.time !== "16:00" || found.type !== "study" || found.subject !== "compsci" || found.ref !== "4.2.3.1")
    throw new Error("the shape the focus timer and daily list read has changed");
  const items = KOS.todo.autoItems().map(i => i.key);
  if (!items.some(k => k === "blk" + blk.id)) throw new Error("the daily list lost today's study block");
  /* deadlines() is still {ev, days}, nearest first */
  C().addEvent({ title: "near", date: KOS.srs.addDays(T(), 1), type: "exam" });
  C().addEvent({ title: "far", date: KOS.srs.addDays(T(), 9), type: "exam" });
  const dl = C().deadlines();
  if (!dl[0].ev || typeof dl[0].days !== "number") throw new Error("deadlines() changed shape");
  if (dl[0].ev.title !== "near") throw new Error("deadlines() is not nearest-first");
});

/* ============ runner ============ */
(async () => {
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { errors.push(`STEP "${name}": ${e.stack.split("\n").slice(0, 2).join(" | ")}`); console.log("FAIL  " + name); }
  }
  console.log("");
  if (errors.length) {
    console.log("SMOKE35 FAILURES (" + errors.length + "):");
    errors.forEach(e => console.log("  - " + e));
    process.exit(1);
  }
  console.log("SMOKE35 PASS — Calendar & the event model verified (" + steps.length + " steps).");
  process.exit(0);
})();
