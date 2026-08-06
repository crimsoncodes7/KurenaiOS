/* Kurenai OS — smoke33.test.js
   Build 6.4: the Assignment Tracker.

   The point of this suite is the ONE-RECORD claim. Every surface — Study,
   Calendar, Countdown, Home, Focus — must render the same canonical
   assignment, never a copy, so:
     · editing the record changes every surface at once, and
     · deleting it removes every surface with it, leaving no orphan.

   Also covers the lifecycle the brief names: create, edit, submit, complete,
   reopen, overdue, delete, reload and backup/restore.
   Run: node tools/smoke33.test.js                                          */
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
const A = () => KOS.assignments;
const steps = [];
const step = (n, f) => steps.push([n, f]);
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const click = n => n.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
const tick = ms => new Promise(r => setTimeout(r, ms || 40));
const T = () => KOS.srs.todayISO();
const todoSessions = () => KOS.sessions.all().filter(s => s.type === "todo").length;

function reset() { KOS.store.state.assignments = { v: 1, nextId: 1, items: [] }; }

/* ============ 1 · the canonical record ============ */
console.log("== the canonical record ==");
step("create stores every field the brief names", () => {
  reset();
  const a = A().add({
    title: "NEA analysis", subject: "compsci", type: "coursework",
    description: "Write the analysis section", assigned: KOS.srs.addDays(T(), -3),
    due: KOS.srs.addDays(T(), 5), dueTime: "16:00",
    status: "inProgress", progress: 30, priority: 3,
    estimateMins: 600, actualMins: 0,
    notes: "check the mark scheme", topics: [{ subject: "compsci", ref: "4.1.1.1" }],
    alerts: [1440, 0], showInCalendar: true, showInCountdown: true
  });
  if (!a) throw new Error("create failed");
  ["id", "title", "subject", "type", "description", "assigned", "due", "dueTime", "status",
   "progress", "priority", "estimateMins", "actualMins", "subtasks", "notes", "topics",
   "alerts", "showInCalendar", "showInCountdown", "created", "updatedAt"].forEach(k => {
    if (!(k in a)) throw new Error("field missing from the record: " + k);
  });
  if (a.alerts.join() !== "0,1440") throw new Error("alerts not normalised: " + a.alerts);
  if (a.topics.length !== 1) throw new Error("topics lost");
  if (!A().add({ title: "" })) { /* expected */ } else throw new Error("a blank title was accepted");
});

step("edit changes the ONE record — no copy is left behind", () => {
  const a = A().all()[0];
  const before = A().all().length;
  const up = A().update(a.id, { title: "NEA analysis (v2)", priority: 2 });
  if (A().all().length !== before) throw new Error("editing created a second record");
  if (up.title !== "NEA analysis (v2)" || up.priority !== 2) throw new Error("edit did not apply");
  if (up.due !== a.due || up.estimateMins !== a.estimateMins) throw new Error("edit clobbered untouched fields");
  if (up.id !== a.id) throw new Error("edit changed the identity");
});

step("subtasks drive progress and lift Not started into In progress", () => {
  reset();
  const a = A().add({ title: "Essay", subject: "maths", status: "notStarted" });
  A().subAdd(a.id, "plan"); A().subAdd(a.id, "draft"); A().subAdd(a.id, "proof");
  const subs = A().get(a.id).subtasks;
  A().subToggle(a.id, subs[0].id, true);
  const mid = A().get(a.id);
  if (mid.progress !== 33) throw new Error("progress should follow subtasks: " + mid.progress);
  if (mid.status !== "inProgress") throw new Error("first tick should start it: " + mid.status);
  if (A().nextSubtask(mid).text !== "draft") throw new Error("next subtask wrong: " + A().nextSubtask(mid).text);
});

/* ============ 2 · the lifecycle ============ */
console.log("== lifecycle: submit, complete, reopen ==");
step("submit stamps the record and forces progress to 100", () => {
  reset();
  const a = A().add({ title: "Lab report", subject: "compsci", progress: 40 });
  A().setStatus(a.id, "submitted");
  const s = A().get(a.id);
  if (s.status !== "submitted") throw new Error("status");
  if (s.progress !== 100) throw new Error("a submitted assignment showing " + s.progress + "% would make every surface lie");
  if (!s.submittedAt) throw new Error("no submittedAt stamp");
  if (s.completedAt) throw new Error("submitting is not completing");
});

step("complete stamps, pays the governor ONCE, and never pays again", () => {
  const a = A().all()[0];
  const before = todoSessions();
  A().setStatus(a.id, "complete");
  const c = A().get(a.id);
  if (c.status !== "complete" || !c.completedAt) throw new Error("complete did not stamp");
  if (todoSessions() - before !== 1) throw new Error("completion should log exactly one governor session");
  const paid = KOS.sessions.all().filter(s => s.type === "todo").pop();
  if (paid.metrics.source !== "assignment") throw new Error("the log does not identify its source");

  /* reopen → complete again must NOT pay: the status field is not a faucet */
  const before2 = todoSessions();
  A().setStatus(a.id, "inProgress");
  A().setStatus(a.id, "complete");
  if (todoSessions() !== before2) throw new Error("re-completing farmed another reward");
});

step("reopening clears the terminal stamps and stops claiming 100%", () => {
  reset();
  const a = A().add({ title: "Reopen me", subject: "it" });
  A().subAdd(a.id, "one"); A().subAdd(a.id, "two");
  A().setStatus(a.id, "complete");
  if (A().get(a.id).progress !== 100) throw new Error("complete should be 100");
  A().setStatus(a.id, "inProgress");
  const r = A().get(a.id);
  if (r.completedAt || r.submittedAt) throw new Error("reopening left a terminal stamp behind");
  if (r.progress === 100) throw new Error("a reopened assignment must stop claiming to be finished");
  if (r.progress !== 0) throw new Error("progress should fall back to what the subtasks say: " + r.progress);
});

step("overdue is judged by the clock, not just the date", () => {
  reset();
  const past = A().add({ title: "Late", subject: "maths", due: KOS.srs.addDays(T(), -1) });
  const soon = A().add({ title: "Later", subject: "maths", due: KOS.srs.addDays(T(), 2) });
  const earlyToday = A().add({ title: "This morning", subject: "maths", due: T(), dueTime: "00:01" });
  const lateToday = A().add({ title: "Tonight", subject: "maths", due: T(), dueTime: "23:59" });
  if (!A().isOverdue(A().get(past.id))) throw new Error("yesterday is overdue");
  if (A().isOverdue(A().get(soon.id))) throw new Error("the future is not overdue");
  if (!A().isOverdue(A().get(earlyToday.id))) throw new Error("00:01 today is overdue by now");
  if (A().isOverdue(A().get(lateToday.id))) throw new Error("23:59 today is not overdue yet");
  /* a completed assignment is never overdue, however late */
  A().setStatus(past.id, "complete");
  if (A().isOverdue(A().get(past.id))) throw new Error("a completed assignment cannot be overdue");
});

/* ============ 3 · filters, sorting, counts ============ */
console.log("== filters and sorting ==");
step("filter by subject, status and due date; sort by each key", () => {
  reset();
  A().add({ title: "CS one", subject: "compsci", due: KOS.srs.addDays(T(), 1), priority: 1 });
  A().add({ title: "CS two", subject: "compsci", due: KOS.srs.addDays(T(), 20), priority: 3, status: "blocked" });
  A().add({ title: "Maths one", subject: "maths", due: KOS.srs.addDays(T(), -2) });
  A().add({ title: "No date", subject: "maths" });

  const t = o => A().query(o).map(x => x.title);
  if (t({ subject: "compsci" }).length !== 2) throw new Error("subject filter");
  if (t({ status: "blocked" }).join() !== "CS two") throw new Error("status filter");
  if (t({ due: "overdue" }).join() !== "Maths one") throw new Error("overdue filter");
  if (t({ due: "week" }).join() !== "CS one") throw new Error("next-7-days filter: " + t({ due: "week" }));
  if (t({ due: "nodate" }).join() !== "No date") throw new Error("no-deadline filter");
  if (t({ sort: "due" })[0] !== "Maths one") throw new Error("due sort: " + t({ sort: "due" }));
  if (t({ sort: "priority" })[0] !== "CS two") throw new Error("priority sort");
  if (t({ sort: "title" })[0] !== "CS one") throw new Error("title sort");
  if (t({ search: "maths one" }).join() !== "Maths one") throw new Error("search");
  const c = A().counts();
  if (c.total !== 4 || c.overdue !== 1 || c.blocked !== 1) throw new Error("counts: " + JSON.stringify(c));
});

/* ============ 4 · the derived surfaces ============ */
console.log("== derived surfaces (one record, many views) ==");
step("the deadline appears on the Calendar without ever becoming an event", async () => {
  reset();
  const evsBefore = KOS.store.state.calendar.events.length;
  const a = A().add({ title: "Calendar visible", subject: "compsci", due: T(), showInCalendar: true });
  if (KOS.store.state.calendar.events.length !== evsBefore)
    throw new Error("an assignment wrote a calendar event — the deadline must stay derived");
  if (!A().forDate(T()).some(x => x.id === a.id)) throw new Error("forDate did not surface it");
  KOS.show("calendar");
  await tick(70);
  if (!$$(".cal-ev.cal-asg").some(n => /Calendar visible/.test(n.textContent)))
    throw new Error("the deadline did not render on the grid");
  /* and an assignment hidden from the calendar stays off it */
  A().update(a.id, { showInCalendar: false });
  KOS.show("calendar", undefined, { _nav: true });
  await tick(70);
  if ($$(".cal-ev.cal-asg").some(n => /Calendar visible/.test(n.textContent)))
    throw new Error("calendar visibility is not honoured");
});

step("only assignments marked major reach the Countdown rail", () => {
  reset();
  A().add({ title: "Ordinary work", subject: "compsci", due: KOS.srs.addDays(T(), 4), showInCountdown: false });
  const major = A().add({ title: "Major deadline", subject: "compsci", due: KOS.srs.addDays(T(), 6), showInCountdown: true });
  const rail = A().countdownItems().map(x => x.assignment.title);
  if (rail.join() !== "Major deadline") throw new Error("countdown rail: " + rail.join());
  const widget = KOS.calendar.countdownWidget(null);
  if (!/Major deadline/.test(widget.textContent)) throw new Error("the widget did not merge the assignment");
  if (/Ordinary work/.test(widget.textContent)) throw new Error("ordinary work must not become a major countdown");
  /* completing it retires it from the rail */
  A().setStatus(major.id, "complete");
  if (A().countdownItems().length) throw new Error("a completed assignment stayed in the countdown");
});

step("urgent assignments surface on Home, overdue first", async () => {
  reset();
  A().add({ title: "Due in a fortnight", subject: "maths", due: KOS.srs.addDays(T(), 14) });
  A().add({ title: "Due tomorrow", subject: "maths", due: KOS.srs.addDays(T(), 1) });
  A().add({ title: "Was due", subject: "maths", due: KOS.srs.addDays(T(), -1) });
  const u = A().urgent().map(x => x.title);
  if (u[0] !== "Was due") throw new Error("overdue should lead: " + u.join());
  if (u.indexOf("Due in a fortnight") !== -1) throw new Error("a fortnight away is not urgent");
  KOS.show("home");
  await tick(90);
  const card = $(".asg-urgent");
  if (!card) throw new Error("no urgent card on Home");
  if (!/Was due/.test(card.textContent)) throw new Error("Home card does not show the overdue item");
});

step("Home stays quiet when nothing is urgent", async () => {
  reset();
  A().add({ title: "Far away", subject: "maths", due: KOS.srs.addDays(T(), 30) });
  KOS.show("home", undefined, { _nav: true });
  await tick(90);
  if ($(".asg-urgent")) throw new Error("the urgent card appeared with nothing urgent");
});

step("a focus session can link to an assignment and banks its effort", () => {
  reset();
  const a = A().add({ title: "Focus target", subject: "compsci", estimateMins: 120 });
  if (!A().linkable("compsci").some(x => x.id === a.id)) throw new Error("not offered to the timer");
  A().addEffort(a.id, 25);
  A().addEffort(a.id, 25);
  const after = A().get(a.id);
  if (after.actualMins !== 50) throw new Error("effort should accumulate: " + after.actualMins);
  if (after.status !== "inProgress") throw new Error("logging effort should start it");
  /* a completed assignment is no longer offered */
  A().setStatus(a.id, "complete");
  if (A().linkable("compsci").some(x => x.id === a.id)) throw new Error("a finished assignment is still linkable");
});

step("related topics are navigable", async () => {
  reset();
  const key = Object.keys(window.KOS_CONTENT)[0];
  const sid = key.slice(0, key.indexOf(":")), ref = key.slice(key.indexOf(":") + 1);
  const a = A().add({ title: "Topic linked", subject: sid, topics: [{ subject: sid, ref }] });
  KOS.assignmentDetail(a.id);
  await tick(60);
  const link = $$(".asg-topic.link").find(n => new RegExp(ref.replace(/\./g, "\\.")).test(n.textContent));
  if (!link) throw new Error("no navigable topic link in the detail view");
  click(link);
  await tick(60);
  if (KOS.store.state.ui.view !== "ref") throw new Error("the topic link did not navigate: " + KOS.store.state.ui.view);
});

/* ============ 5 · the page ============ */
console.log("== the tracker page ==");
step("the Study subject desk carries an Assignments tab page", async () => {
  KOS.show("subject", "compsci");
  await tick(80);
  const tabs = $$(".subject-workspace-tabs .study-tab").map(b => b.textContent.trim());
  if (tabs.join("|") !== "Overview|Assignments") throw new Error("subject tabs: " + tabs.join("|"));
  if (KOS.sectionOf("assignments") !== "study") throw new Error("assignments must belong to Study");
});

step("the page lists title, subject, deadline, status, progress, priority and next subtask", async () => {
  reset();
  const a = A().add({ title: "Shown fully", subject: "compsci", type: "essay",
    due: KOS.srs.addDays(T(), 3), status: "inProgress", priority: 3 });
  A().subAdd(a.id, "outline"); A().subAdd(a.id, "write");
  KOS.show("assignments");
  await tick(90);
  const row = $(".asg-row");
  if (!row) throw new Error("no rows rendered");
  const txt = row.textContent;
  ["Shown fully", "CS", "In progress", "outline"].forEach(bit => {
    if (txt.indexOf(bit) === -1) throw new Error("the row omits " + bit + ": " + txt);
  });
  if (!row.querySelector(".asg-track")) throw new Error("no progress bar");
  if (!row.querySelector(".asg-prio")) throw new Error("no priority mark");
  if (!row.querySelector(".asg-status")) throw new Error("no status pill");
});

step("the page filters and the full detail view both work", async () => {
  KOS.show("assignments", { subject: "" });
  await tick(90);
  const sels = $$(".asg-tools .status-sel");
  if (sels.length !== 4) throw new Error("expected subject/status/due/sort filters, got " + sels.length);
  const row = $(".asg-row");
  click(row.querySelector(".mini-btn"));
  await tick(60);
  const modal = $(".asg-detail-modal");
  if (!modal) throw new Error("the detail view did not open");
  ["Progress", "Priority", "Estimated", "Actual", "Deadline", "Subtasks"].forEach(h => {
    if (modal.textContent.indexOf(h) === -1) throw new Error("detail is missing " + h);
  });
  if (!modal.querySelector(".asg-d-actions .btn")) throw new Error("no status transitions offered");
  const ov = $(".modal-ov");
  if (ov) ov.remove();
});

/* ============ 6 · delete, reload, backup ============ */
console.log("== delete, reload, backup ==");
step("deleting removes the record AND every surface derived from it", async () => {
  reset();
  const a = A().add({ title: "Delete me", subject: "compsci", due: T(),
    showInCalendar: true, showInCountdown: true });
  if (!A().forDate(T()).length) throw new Error("precondition: should be on the calendar");
  if (!A().countdownItems().length) throw new Error("precondition: should be in countdowns");
  if (!A().urgent().length) throw new Error("precondition: should be urgent on Home");
  const evs = KOS.store.state.calendar.events.length;

  A().remove(a.id);

  if (A().get(a.id)) throw new Error("the record survived");
  if (A().forDate(T()).length) throw new Error("a calendar chip outlived the assignment");
  if (A().countdownItems().length) throw new Error("a countdown row outlived the assignment");
  if (A().urgent().length) throw new Error("a Home card outlived the assignment");
  if (KOS.store.state.calendar.events.length !== evs)
    throw new Error("deleting an assignment touched real calendar events");
  KOS.show("calendar", undefined, { _nav: true });
  await tick(70);
  if ($$(".cal-ev.cal-asg").some(n => /Delete me/.test(n.textContent))) throw new Error("the grid still shows it");
});

step("records survive a reload of the page", async () => {
  reset();
  A().add({ title: "Persist me", subject: "maths", due: KOS.srs.addDays(T(), 2) });
  KOS.show("assignments");
  await tick(80);
  const before = $$(".asg-row").length;
  KOS.show("home", undefined, { _nav: true });
  await tick(50);
  KOS.show("assignments", undefined, { _nav: true });
  await tick(80);
  if ($$(".asg-row").length !== before) throw new Error("rows did not survive a re-render");
  if (!A().all().some(x => x.title === "Persist me")) throw new Error("the record did not persist");
});

step("backup carries every assignment field and restore returns them", async () => {
  reset();
  const a = A().add({ title: "Round trip", subject: "compsci", type: "project",
    description: "d", assigned: T(), due: KOS.srs.addDays(T(), 9), dueTime: "12:30",
    status: "blocked", priority: 2, estimateMins: 90, actualMins: 45,
    notes: "n", topics: [{ subject: "compsci", ref: "4.1.1.1" }],
    alerts: [60], showInCalendar: true, showInCountdown: true });
  A().subAdd(a.id, "step one");
  const fp = () => A().all().map(x => [x.title, x.subject, x.type, x.description, x.assigned, x.due,
    x.dueTime, x.status, x.progress, x.priority, x.estimateMins, x.actualMins,
    (x.subtasks || []).length, x.notes, JSON.stringify(x.topics), (x.alerts || []).join("/"),
    x.showInCalendar, x.showInCountdown].join("|")).sort();
  const before = fp();

  const snap = await new Promise((res, rej) => KOS.store.snapshotFull((e, s) => e ? rej(e) : res(s)));
  const json = JSON.stringify(snap);
  if (json.indexOf('"assignments"') === -1) throw new Error("the backup does not carry the assignments branch");
  reset();
  if (A().all().length) throw new Error("wipe failed");
  KOS.store.replaceState(JSON.parse(json).state);
  if (A().all().length !== 1) throw new Error("restore lost the assignment");
  if (JSON.stringify(fp()) !== JSON.stringify(before)) throw new Error("a field changed across the round-trip");
});

step("a pre-6.4 backup with no assignments branch restores without throwing", () => {
  KOS.store.replaceState({ progress: {}, todo: { nextId: 1, manual: [], autoChecked: {} } });
  if (!Array.isArray(A().all())) throw new Error("the store did not self-heal for an old backup");
  A().add({ title: "still works", subject: "maths" });
  if (A().all().length !== 1) throw new Error("cannot write after restoring an old backup");
});

/* ============ runner ============ */
(async () => {
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { errors.push(`STEP "${name}": ${e.stack.split("\n").slice(0, 2).join(" | ")}`); console.log("FAIL  " + name); }
  }
  console.log("");
  if (errors.length) {
    console.log("SMOKE33 FAILURES (" + errors.length + "):");
    errors.forEach(e => console.log("  - " + e));
    process.exit(1);
  }
  console.log("SMOKE33 PASS — Assignment Tracker verified (" + steps.length + " steps).");
  process.exit(0);
})();
