/* Kurenai OS — smoke30.test.js
   Build 6.2 Reminders: the dedicated page and its store.

   Covers the contracts that are easy to break later:
     · lists (containers) and tags (cross-list labels) stay SEPARATE
     · the five smart sections derive correctly, including overdue-by-time
     · full CRUD + subtasks + recurrence roll-forward
     · search across title/notes/tags/subtasks, filters and sorting
     · the anti-farming reward bounds (daily cap, once-per-item-per-day,
       sub-tasks never pay) — all through sessions.log, never direct economy
     · migration from the pre-6.2 todo.manual list
     · integration boundaries: Home is read-only, dated reminders reach the
       calendar grid but NEVER KOS.calendar.deadlines()
     · backup/restore carries every reminder field
   Run: node tools/smoke30.test.js                                          */
const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");

/* seed a LEGACY todo list before the scripts run, so boot exercises migration */
const legacy = {
  v: 1,
  todo: {
    nextId: 9,
    manual: [
      { id: 1, text: "Return library books", done: false, created: "2026-08-01", date: "2026-08-05", category: "Errands" },
      { id: 2, text: "Email supervisor", done: false, created: "2026-08-02", date: null, category: "Uni",
        subs: [{ id: 5, text: "draft it", done: true }, { id: 6, text: "send", done: false }] },
      { id: 3, text: "Old finished thing", done: true, created: "2026-07-20", date: null, category: null }
    ],
    autoChecked: {}, habits: []
  }
};

const dom = new JSDOM(html, { url: "http://localhost/index.html", runScripts: "outside-only", pretendToBeVisual: true });
const { window } = dom;
const { document } = window;
window.localStorage.setItem("kurenai-os-v1", JSON.stringify(legacy));
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

const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
for (const src of scripts) {
  try { window.eval(fs.readFileSync(path.join(ROOT, src), "utf8")); }
  catch (e) { errors.push(`LOAD FAIL ${src}: ${e.message}`); }
}
const KOS = window.KOS;
const R = () => KOS.reminders;
const steps = [];
const step = (n, f) => steps.push([n, f]);
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const click = n => n.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
const tick = ms => new Promise(r => setTimeout(r, ms || 30));
const todoSessions = () => KOS.sessions.all().filter(s => s.type === "todo").length;

/* ============ 1 · migration ============ */
console.log("== migration from the pre-6.2 list ==");
step("todo.manual is migrated once, categories become LISTS, subtasks survive", () => {
  if (!KOS.store.state.reminders.migrated) throw new Error("migration did not run at boot");
  if (KOS.store.state.todo.manual.length) throw new Error("the legacy array was not emptied — reminders would be counted twice");
  const items = R().all();
  if (items.length !== 3) throw new Error("expected 3 migrated reminders, got " + items.length);
  const books = items.find(i => i.title === "Return library books");
  if (!books || books.due !== "2026-08-05") throw new Error("due date lost in migration");
  if (R().listName(books.listId) !== "Errands") throw new Error("category did not become a list");
  const email = items.find(i => i.title === "Email supervisor");
  if ((email.subs || []).length !== 2) throw new Error("sub-tasks lost in migration");
  if (!email.subs[0].done) throw new Error("sub-task done state lost");
  if (!items.find(i => i.title === "Old finished thing").done) throw new Error("completed state lost");
  /* a second run must be a no-op */
  const n = R().migrate();
  if (n !== 0) throw new Error("migration is not idempotent: " + n);
});

/* ============ 2 · lists vs tags stay separate ============ */
console.log("== lists (containers) vs tags (labels) ==");
step("a reminder has ONE list and MANY tags; the two never merge", () => {
  const l = R().addList("Uni");
  const item = R().add({ title: "Submit draft", listId: l.id, tags: ["urgent", "uni", "urgent"] });
  if (item.listId !== l.id) throw new Error("list not stored");
  if (item.tags.length !== 2) throw new Error("tags must dedupe: " + JSON.stringify(item.tags));
  /* the list name and an identically-named tag are different things */
  if (R().tags().some(t => t.tag === "Uni")) throw new Error("a list leaked into the tag vocabulary");
  const byList = R().query({ section: "all", listId: l.id }).map(i => i.title);
  const byTag = R().query({ section: "all", tag: "uni" }).map(i => i.title);
  if (!byList.includes("Submit draft") || !byTag.includes("Submit draft")) throw new Error("filters disagree");
  /* the migrated Uni reminder is in the list but carries no tag */
  R().update(R().all().find(i => i.title === "Email supervisor").id, { listId: l.id });
  if (R().query({ section: "all", listId: l.id }).length !== 2) throw new Error("list should now hold two");
  if (R().query({ section: "all", tag: "uni" }).length !== 1) throw new Error("a tag must not follow a list membership");
});
step("deleting a list keeps its reminders — they just lose the container", () => {
  const tmp = R().addList("Temp");
  const it = R().add({ title: "Orphan me", listId: tmp.id });
  R().deleteList(tmp.id);
  const after = R().get(it.id);
  if (!after) throw new Error("deleting a list deleted its reminders");
  if (after.listId !== null) throw new Error("listId not cleared");
  R().remove(it.id);
});
step("renaming and deleting a tag rewrites every carrier", () => {
  const a = R().add({ title: "tag a", tags: ["temp"] });
  const b = R().add({ title: "tag b", tags: ["temp", "keep"] });
  R().renameTag("temp", "moved");
  if (R().get(a.id).tags[0] !== "moved") throw new Error("rename missed a carrier");
  R().deleteTag("moved");
  if (R().get(b.id).tags.join() !== "keep") throw new Error("delete removed the wrong tag");
  R().remove(a.id); R().remove(b.id);
});

/* ============ 3 · smart sections + overdue ============ */
console.log("== smart sections ==");
step("Today / Scheduled / Upcoming / Overdue / Completed derive from one array", () => {
  const t = KOS.srs.todayISO();
  R().all().slice().forEach(i => R().remove(i.id));
  const today = R().add({ title: "due today", due: t });
  const soon = R().add({ title: "due later", due: KOS.srs.addDays(t, 4) });
  const late = R().add({ title: "was due", due: KOS.srs.addDays(t, -2) });
  const undated = R().add({ title: "someday" });
  const done = R().add({ title: "finished" });
  R().complete(done.id, true);

  const ids = s => R().query({ section: s }).map(i => i.title).sort();
  if (ids("today").join() !== "due today") throw new Error("Today: " + ids("today"));
  if (ids("scheduled").join() !== ["due later", "due today", "was due"].sort().join()) throw new Error("Scheduled: " + ids("scheduled"));
  if (ids("upcoming").join() !== "due later") throw new Error("Upcoming: " + ids("upcoming"));
  if (ids("overdue").join() !== "was due") throw new Error("Overdue: " + ids("overdue"));
  if (ids("completed").join() !== "finished") throw new Error("Completed: " + ids("completed"));
  /* an undated reminder belongs to no dated section but must remain reachable */
  if (!ids("all").includes("someday")) throw new Error("an undated reminder fell out of every section");
  if (ids("scheduled").includes("someday")) throw new Error("an undated reminder must not be Scheduled");
  [today, soon, late, undated, done].forEach(i => R().remove(i.id));
});
step("a time-stamped reminder goes overdue by the clock, not just the date", () => {
  const t = KOS.srs.todayISO();
  const early = R().add({ title: "early", due: t, dueTime: "00:01" });
  const late = R().add({ title: "late", due: t, dueTime: "23:59" });
  if (!R().isOverdue(R().get(early.id))) throw new Error("00:01 today should be overdue by now");
  if (R().isOverdue(R().get(late.id))) throw new Error("23:59 today is not overdue yet");
  R().remove(early.id); R().remove(late.id);
});

/* ============ 4 · CRUD, subtasks, recurrence ============ */
console.log("== crud, subtasks, recurrence ==");
step("create / edit / delete round-trips every field", () => {
  const it = R().add({ title: "Full item", due: "2026-09-01", dueTime: "08:30", priority: 2,
    tags: ["x"], notes: "hello", alerts: [60, 0] });
  if (it.alerts.join() !== "0,60") throw new Error("alerts not sorted/kept: " + it.alerts);
  const up = R().update(it.id, { title: "Renamed", priority: 3, notes: "changed" });
  if (up.title !== "Renamed" || up.priority !== 3 || up.notes !== "changed") throw new Error("update lost a field");
  if (up.due !== "2026-09-01" || up.dueTime !== "08:30") throw new Error("update clobbered untouched fields");
  if (!R().remove(it.id) || R().get(it.id)) throw new Error("delete failed");
});
step("a blank title is refused; clearing the date clears the time and repeat", () => {
  if (R().add({ title: "   " })) throw new Error("a blank reminder was created");
  const it = R().add({ title: "dated", due: "2026-09-01", dueTime: "09:00", recur: "weekly" });
  const cleared = R().update(it.id, { due: null });
  if (cleared.dueTime !== null) throw new Error("time survived the date being cleared");
  if (cleared.recur !== null) throw new Error("a repeat without a date is meaningless and must clear");
  R().remove(it.id);
});
step("completing a repeating reminder rolls it forward instead of closing it", () => {
  const t = KOS.srs.todayISO();
  const it = R().add({ title: "Weekly shop", due: t, recur: "weekly" });
  R().subAdd(it.id, "milk");
  R().subToggle(it.id, R().get(it.id).subs[0].id, true);
  R().complete(it.id, true);
  const after = R().get(it.id);
  if (after.done) throw new Error("a repeating reminder must stay open");
  if (after.due !== KOS.srs.addDays(t, 7)) throw new Error("did not roll a week forward: " + after.due);
  if (after.subs[0].done) throw new Error("sub-tasks must reset for the new occurrence");
  R().remove(it.id);
});
step("monthly recurrence clamps rather than overflowing the month", () => {
  const it = R().add({ title: "month end", due: "2026-01-31", recur: "monthly" });
  const next = R().nextOccurrence(R().get(it.id), "2026-01-31");
  if (next !== "2026-02-28") throw new Error("31 Jan + 1 month should clamp to 28 Feb, got " + next);
  R().remove(it.id);
});

/* ============ 5 · search, filters, sorting ============ */
console.log("== search, filters, sorting ==");
step("search reaches title, notes, tags and sub-tasks", () => {
  const it = R().add({ title: "Coursework", notes: "evaluation table", tags: ["deep"] });
  R().subAdd(it.id, "proofread");
  const hit = q => R().query({ section: "all", search: q }).map(i => i.title);
  if (!hit("coursework").includes("Coursework")) throw new Error("title search");
  if (!hit("evaluation").includes("Coursework")) throw new Error("notes search");
  if (!hit("deep").includes("Coursework")) throw new Error("tag search");
  if (!hit("proofread").includes("Coursework")) throw new Error("sub-task search");
  R().remove(it.id);
});
step("sorting by due date, priority and title each order correctly", () => {
  R().all().slice().forEach(i => R().remove(i.id));
  const t = KOS.srs.todayISO();
  R().add({ title: "b-late", due: KOS.srs.addDays(t, 5), priority: 1 });
  R().add({ title: "a-soon", due: KOS.srs.addDays(t, 1), priority: 0 });
  R().add({ title: "c-undated", priority: 3 });
  const by = s => R().query({ section: "all", sort: s }).map(i => i.title);
  if (by("due")[0] !== "a-soon") throw new Error("due sort: " + by("due"));
  if (by("due")[2] !== "c-undated") throw new Error("undated must sort last: " + by("due"));
  if (by("priority")[0] !== "c-undated") throw new Error("priority sort: " + by("priority"));
  if (by("title").join() !== "a-soon,b-late,c-undated") throw new Error("title sort: " + by("title"));
});

/* ============ 6 · the anti-farming reward bounds ============ */
console.log("== governor bounds (no trivial-item farming) ==");
step("sub-task ticks never pay anything", () => {
  const it = R().add({ title: "with subs" });
  R().subAdd(it.id, "one"); R().subAdd(it.id, "two");
  const before = todoSessions();
  const subs = R().get(it.id).subs;
  R().subToggle(it.id, subs[0].id, true);
  R().subToggle(it.id, subs[1].id, true);
  if (todoSessions() !== before) throw new Error("a sub-task tick paid out — that is the most farmable path there is");
  R().remove(it.id);
});
step("the daily cap bounds how many completions can pay", () => {
  KOS.store.state.reminders.rewardLog = {};
  const made = [];
  for (let i = 0; i < R().REWARD_CAP + 5; i++) made.push(R().add({ title: "farm " + i }));
  const before = todoSessions();
  made.forEach(m => R().complete(m.id, true));
  const paid = todoSessions() - before;
  if (paid !== R().REWARD_CAP) throw new Error(`expected exactly ${R().REWARD_CAP} paid completions, got ${paid}`);
  /* completing still WORKS past the cap — it just stops paying */
  if (made.some(m => !R().get(m.id).done)) throw new Error("completions past the cap were refused instead of unpaid");
  made.forEach(m => R().remove(m.id));
});
step("re-ticking the same reminder on the same day pays once, not twice", () => {
  KOS.store.state.reminders.rewardLog = {};
  const it = R().add({ title: "flip flop" });
  const before = todoSessions();
  R().complete(it.id, true);
  R().complete(it.id, false);
  R().complete(it.id, true);
  if (todoSessions() - before !== 1) throw new Error("re-ticking farmed extra rewards");
  R().remove(it.id);
});
step("every reward flows through sessions.log — the module never moves the economy itself", () => {
  KOS.store.state.reminders.rewardLog = {};
  const g = KOS.store.state.governor;
  const before = { hp: g.hp, gold: g.gold, xp: g.xp };
  const it = R().add({ title: "no direct writes", due: KOS.srs.todayISO(), priority: 3, tags: ["a"], notes: "n" });
  R().update(it.id, { title: "still none" });
  R().subAdd(it.id, "s");
  if (g.hp !== before.hp || g.gold !== before.gold || g.xp !== before.xp)
    throw new Error("creating/editing a reminder moved the economy");
  R().complete(it.id, true);
  if (g.xp === before.xp) throw new Error("a paid completion should have moved XP through the governor");
  R().remove(it.id);
});

/* ============ 7 · integration boundaries ============ */
console.log("== integrations ==");
step("dated reminders reach the calendar grid but NEVER the deadline countdowns", async () => {
  const t = KOS.srs.todayISO();
  const it = R().add({ title: "Calendar visible", due: t });
  if (!R().forDate(t).some(i => i.id === it.id)) throw new Error("forDate did not surface the reminder");
  KOS.show("calendar");
  await tick(60);
  const remCells = $$(".cal-ev.cal-rem").map(n => n.textContent);
  if (!remCells.some(x => /Calendar visible/.test(x))) throw new Error("the reminder did not render on the grid");
  /* the hard part: it must not have become a Countdown */
  const dl = KOS.calendar.deadlines().map(d => d.ev.title);
  if (dl.some(x => /Calendar visible/.test(x))) throw new Error("an ordinary reminder became a major Countdown");
  R().remove(it.id);
});
step("Home shows a READ-ONLY summary that links to the page", async () => {
  R().add({ title: "home digest", due: KOS.srs.addDays(KOS.srs.todayISO(), -1) });
  KOS.show("home");
  await tick(80);
  const card = $(".rem-sum");
  if (!card) throw new Error("no reminders summary on Home");
  if (card.querySelectorAll("input, textarea, .rem-check, .todo-tick").length)
    throw new Error("Home exposed a mutation control — it must report, not manage");
  if (!card.querySelector(".mini-btn")) throw new Error("no link through to the Reminders page");
  if (!/overdue/.test(card.textContent)) throw new Error("the digest does not report the overdue count");
});
step("the dedicated page renders sections, lists, tags, list and inspector", async () => {
  KOS.show("reminders");
  await tick(80);
  if ($$(".rem-side-group").length < 3) throw new Error("sections / lists / tags are not three separate groups");
  const groups = $$(".rem-side-group h4").map(h => h.textContent.replace("＋", "").trim());
  if (!groups.includes("Smart sections") || !groups.includes("Lists") || !groups.includes("Tags"))
    throw new Error("sidebar groups: " + groups.join("|"));
  if ($$(".rem-side-item.sec-today").length !== 1) throw new Error("the Today section is missing");
  if (!$(".rem-items")) throw new Error("no list column");
  if (!$(".rem-insp")) throw new Error("no side inspector");
  /* selecting a row opens the inspector with the full field set */
  const row = $(".rem-row");
  if (!row) throw new Error("no reminder rows rendered");
  click(row);
  await tick(40);
  const labels = $$(".rem-insp-body .med-field > span, .rem-insp-body .rem-i-block h4").map(n => n.textContent.trim());
  ["Reminder", "Due date", "Priority", "List", "Repeat", "Alerts", "Notes", "Sub-tasks"].forEach(f => {
    if (!labels.some(l => l.indexOf(f) === 0)) throw new Error("inspector is missing " + f + " — got " + labels.join("|"));
  });
});
step("completing from the list updates the row without a full navigation", async () => {
  KOS.show("reminders");
  await tick(60);
  const before = $$(".rem-row").length;
  const check = $(".rem-row .rem-check");
  click(check);
  await tick(60);
  if ($$(".rem-row").length === before && $(".rem-side-item.sec-completed .rsi-n").textContent === "0")
    throw new Error("completing did not move the item out of the open sections");
});

/* ============ 8 · backup / restore ============ */
console.log("== backup / restore ==");
step("every reminder field survives a full snapshot and restore", async () => {
  R().all().slice().forEach(i => R().remove(i.id));
  R().lists().slice().forEach(l => R().deleteList(l.id));
  const l = R().addList("Home");
  const it = R().add({ title: "Full fidelity", due: "2026-12-24", dueTime: "18:45", priority: 3,
    listId: l.id, tags: ["gift", "family"], notes: "wrap it", alerts: [60, 1440], recur: "yearly" });
  R().subAdd(it.id, "buy paper");
  const fp = () => R().all().map(i => [i.title, i.due, i.dueTime, i.priority, R().listName(i.listId),
    (i.tags || []).join(","), i.notes, (i.alerts || []).join("/"), i.recur, (i.subs || []).length].join("|")).sort();
  const before = fp();

  const snap = await new Promise((res, rej) => KOS.store.snapshotFull((e, s) => e ? rej(e) : res(s)));
  const json = JSON.stringify(snap);
  if (json.indexOf('"reminders"') === -1) throw new Error("the backup payload does not carry the reminders branch");

  R().all().slice().forEach(i => R().remove(i.id));
  R().lists().slice().forEach(x => R().deleteList(x.id));
  if (R().all().length || R().lists().length) throw new Error("wipe failed");

  KOS.store.replaceState(JSON.parse(json).state);
  if (R().all().length !== 1) throw new Error("restore lost the reminder");
  if (R().lists().length !== 1) throw new Error("restore lost the list");
  if (JSON.stringify(fp()) !== JSON.stringify(before)) throw new Error("a field changed across the round-trip:\n" + fp() + "\n" + before);
});
step("a pre-6.2 backup with no reminders branch restores without throwing", () => {
  KOS.store.replaceState({ progress: {}, todo: { nextId: 1, manual: [], autoChecked: {} } });
  if (!Array.isArray(R().all())) throw new Error("the store did not self-heal for an old backup");
  R().add({ title: "still works" });
  if (R().all().length !== 1) throw new Error("cannot write after restoring an old backup");
});

/* ============ runner ============ */
(async () => {
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { errors.push(`STEP "${name}": ${e.stack.split("\n").slice(0, 2).join(" | ")}`); console.log("FAIL  " + name); }
  }
  console.log("");
  if (errors.length) {
    console.log("SMOKE30 FAILURES (" + errors.length + "):");
    errors.forEach(e => console.log("  - " + e));
    process.exit(1);
  }
  console.log("SMOKE30 PASS — Reminders verified (" + steps.length + " steps).");
  process.exit(0);
})();
