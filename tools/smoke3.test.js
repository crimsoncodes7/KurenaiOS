/* Kurenai OS — smoke3.test.js
   Build 2a governor suite: SM-2 scheduling, custom-card CRUD, session log +
   streaks, HP/gold/XP economy + gating, calendar + reminders, daily to-do,
   and the hard rule that core revision never locks. Run:
     node tools/smoke3.test.js */
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
window.confirm = () => true;
const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
for (const src of scripts) {
  try { window.eval(fs.readFileSync(path.join(ROOT, src), "utf8")); }
  catch (e) { errors.push(`LOAD FAIL ${src}: ${e.message}`); }
}
const KOS = window.KOS;
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const click = n => n.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
function step(name, fn) {
  try { fn(); console.log("  ok  " + name); }
  catch (e) { errors.push(`STEP "${name}": ${e.stack.split("\n").slice(0, 2).join(" | ")}`); console.log("FAIL  " + name); }
}
const today = KOS.srs.todayISO();

console.log("== SM-2 core ==");
step("Good on a new card -> 1d interval, due tomorrow", () => {
  const m = KOS.srs.rate("compsci:4.2.3.1:0", 2);
  if (m.ivl !== 1 || m.reps !== 1) throw new Error("ivl=" + m.ivl + " reps=" + m.reps);
  if (m.due !== KOS.srs.addDays(today, 1)) throw new Error("due=" + m.due);
});
step("second Good -> 6d, third grows by EF", () => {
  let m = KOS.srs.rate("compsci:4.2.3.1:0", 2);
  if (m.ivl !== 6) throw new Error("ivl2=" + m.ivl);
  const efBefore = m.ef;
  m = KOS.srs.rate("compsci:4.2.3.1:0", 2);
  if (m.ivl < 10) throw new Error("ivl3=" + m.ivl + " ef=" + efBefore);
  if (m.views !== 3) throw new Error("views=" + m.views);
});
step("Again -> lapse: reps reset, due today, EF floored >= 1.3", () => {
  const m = KOS.srs.rate("compsci:4.2.3.1:0", 0);
  if (m.reps !== 0 || m.due !== today || m.lapses !== 1) throw new Error(JSON.stringify(m));
  for (let i = 0; i < 20; i++) KOS.srs.rate("compsci:4.2.3.1:0", 0);
  if (KOS.srs.peek("compsci:4.2.3.1:0").ef < 1.3) throw new Error("EF fell through floor");
});
step("due queue picks up the lapsed card, overdue sorting", () => {
  KOS.store.state.srs["maths:2.3:0"] = { ef: 2.5, ivl: 3, reps: 2, due: KOS.srs.addDays(today, -4), last: today, views: 1, lapses: 0, lastRating: 2 };
  const due = KOS.srs.dueCards();
  if (!due.some(c => c.key === "compsci:4.2.3.1:0")) throw new Error("lapsed card missing");
  if (due[0].key !== "maths:2.3:0") throw new Error("overdue-first sort broken: " + due[0].key);
});

console.log("== custom cards ==");
step("CRUD + unified deck + srs cleanup", () => {
  const c = KOS.srs.addCustom("maths", "2.3", "my Q", "my A");
  let deck = KOS.srs.cardsFor("maths", "2.3");
  if (!deck.some(x => x.key === "u" + c.id && x.custom)) throw new Error("custom not in deck");
  KOS.srs.updateCustom(c.id, "my Q2", "my A2");
  if (KOS.store.state.custom.cards[0].q !== "my Q2") throw new Error("update failed");
  KOS.srs.rate("u" + c.id, 2);
  KOS.srs.deleteCustom(c.id);
  if (KOS.store.state.srs["u" + c.id]) throw new Error("srs meta not cleaned");
  if (KOS.srs.cardsFor("maths", "2.3").some(x => x.custom)) throw new Error("delete failed");
});

console.log("== sessions + streaks + governor ==");
step("session log entry awards XP/gold/HP and streak counts today", () => {
  const g = KOS.store.state.governor;
  g.hp = 50; const gold0 = g.gold, xp0 = g.xp;
  KOS.sessions.log({ type: "quiz", subject: "maths", ref: "2.3", metrics: { correct: 9, total: 10, pct: 90 } });
  if (g.xp <= xp0) throw new Error("no xp");
  if (g.gold < gold0 + 10) throw new Error("high-score gold missing: " + g.gold);
  if (g.hp <= 50) throw new Error("no hp restore");
  if (KOS.sessions.streak("maths") !== 1) throw new Error("subject streak: " + KOS.sessions.streak("maths"));
  if (KOS.sessions.streak(null) !== 1) throw new Error("overall streak");
});
step("critical trickle halves HP restore", () => {
  const g = KOS.store.state.governor;
  g.hp = 10;
  KOS.sessions.log({ type: "exam", subject: "maths", ref: "2.3", metrics: { marks: 3, max: 4 } });
  if (g.hp !== 12) throw new Error("expected 12 (=10+ceil(3/2)), got " + g.hp); // exam hp=3 -> ceil(1.5)=2
});
step("day-tick drains for a missed day", () => {
  const g = KOS.store.state.governor;
  g.hp = 80; g.lastTick = KOS.srs.addDays(today, -3);
  // sessions exist only for today; the 3 elapsed days (t-3, t-2, t-1) had none
  KOS.governor.tick();
  if (g.hp !== 80 - 45) throw new Error("hp=" + g.hp);
});
step("gating: strained locks sims + purchased labs, buy blocked", () => {
  const g = KOS.store.state.governor;
  g.hp = 45; g.owned = ["trace"];
  if (KOS.governor.simAccess("tl-stack").ok) throw new Error("strained should suspend owned lab");
  g.gold = 500;
  if (KOS.governor.buy("oop").ok) throw new Error("shop should be suspended");
  g.hp = 90;
  const acc = KOS.governor.simAccess("tl-stack");
  if (!acc.ok) throw new Error("owned lab should open when healthy");
  if (KOS.governor.simAccess("logic-lab").ok) throw new Error("unowned sim should be locked");
  const r = KOS.governor.buy("logic-lab");
  if (!r.ok || !KOS.governor.owns("logic-lab") || g.gold !== 500 - 90) throw new Error(JSON.stringify(r) + " gold=" + g.gold);
});
step("level maths: 100 xp -> level 2", () => {
  if (KOS.governor.levelInfo(0).level !== 1) throw new Error("l0");
  if (KOS.governor.levelInfo(100).level !== 2) throw new Error("l100");
  if (KOS.governor.levelInfo(249).level !== 2) throw new Error("l249");
  if (KOS.governor.levelInfo(250).level !== 3) throw new Error("l250");
});

console.log("== calendar + todo ==");
step("event CRUD + weekly recurrence + deadlines", () => {
  const ev = KOS.calendar.addEvent({ title: "T lesson", date: KOS.srs.addDays(today, -7), time: "10:00", type: "lesson", subject: "maths", recur: "weekly" });
  if (!KOS.calendar.eventsOn(today).some(e => e.id === ev.id)) throw new Error("weekly recurrence broken");
  const ex = KOS.calendar.addEvent({ title: "Real exam", date: KOS.srs.addDays(today, 2), type: "exam", recur: "none" });
  const dl = KOS.calendar.deadlines();
  if (dl[0].ev.id !== ex.id || dl[0].days !== 2) throw new Error("deadline sort: " + JSON.stringify(dl[0]));
  KOS.calendar.updateEvent(ex.id, { title: "Renamed" });
  if (KOS.store.state.calendar.events.find(e => e.id === ex.id).title !== "Renamed") throw new Error("update");
  KOS.calendar.deleteEvent(ev.id);
  if (KOS.calendar.eventsOn(today).some(e => e.id === ev.id)) throw new Error("delete");
});
step("reminders fire once per event per day", () => {
  const n1 = KOS.calendar.checkReminders();
  if (!n1.length) throw new Error("no reminder for a 2-day-out exam at threshold 3");
  const before = Object.keys(KOS.store.state.calendar.notified).length;
  KOS.calendar.checkReminders();
  if (Object.keys(KOS.store.state.calendar.notified).length !== before) throw new Error("re-notified same day");
});
step("todo: auto items from due queue + deadline; manual persists; tick logs session", () => {
  const items = KOS.todo.autoItems();
  if (!items.some(i => i.key === "due")) throw new Error("no due item");
  if (!items.some(i => i.key.startsWith("ev"))) throw new Error("no deadline item");
  KOS.todo.addManual("wash the kanji brush");
  const m = KOS.store.state.todo.manual[0];
  const sessBefore = KOS.sessions.all().length;
  KOS.todo.toggleManual(m.id, true, m.text);
  if (KOS.sessions.all().length !== sessBefore + 1) throw new Error("todo tick didn't log a session");
  KOS.todo.deleteManual(m.id);
  if (KOS.store.state.todo.manual.length) throw new Error("manual delete");
});

console.log("== views render ==");
step("due view renders with a mixed queue", () => {
  KOS.show("due");
  if (!$(".fc-card") && !$(".due-clear")) throw new Error("due view empty");
  if (!$$(".stat-card").length) throw new Error("no summary strip");
});
step("governor view: all four tabs render", () => {
  KOS.show("governor");
  for (const t of ["status", "shop", "avatar", "history"]) {
    click($$(".study-tab").find(b => b.dataset.tab === t));
    if (!$(".study-panel").children.length) throw new Error(t + " tab empty");
  }
  click($$(".study-tab").find(b => b.dataset.tab === "shop"));
  if (!$$(".shop-card").length) throw new Error("no shop cards");
  click($$(".study-tab").find(b => b.dataset.tab === "avatar"));
  if ($$(".seal-card").length !== 5) throw new Error("seal count: " + $$(".seal-card").length);
});
step("calendar view renders month grid + sample events", () => {
  KOS.show("calendar");
  if ($$(".cal-cell").length !== 42) throw new Error("cells: " + $$(".cal-cell").length);
  if (!$$(".cal-ev").length) throw new Error("no events painted");
  // week mode
  click($$(".btn").find(b => b.textContent === "Week"));
  if ($$(".cal-cell").length !== 7) throw new Error("week cells: " + $$(".cal-cell").length);
});
step("home renders today panel + countdowns + streak chips + HUD", () => {
  KOS.show("home");
  if (!$(".todo-panel")) throw new Error("no todo panel");
  if (!$(".dl-widget")) throw new Error("no countdown widget");
  if ($$(".streak-chip").length !== 3) throw new Error("streak chips: " + $$(".streak-chip").length);
  if (!$("#hud .hud")) throw new Error("HUD missing");
});
step("per-topic flashcards tab: SM-2 buttons + manage + custom add", () => {
  KOS.show("ref", { subject: "compsci", ref: "4.2.3.1" });
  click($$(".study-tab").find(t => t.dataset.tab === "cards"));
  if (!$(".fc-card")) throw new Error("no card");
  click($(".fc-card"));
  const rates = $$(".fc-rate .fc-r");
  if (rates.length !== 4) throw new Error("rating buttons: " + rates.length);
  // manage mode
  click($$(".fc-mode")[1]);
  if (!$$(".fc-row").length) throw new Error("manage rows missing");
  click($$(".btn.primary").find(b => b.textContent.includes("New custom card")));
  $(".fc-form-q").value = "QQ"; $(".fc-form-a").value = "AA";
  click($$(".fc-form .btn.primary")[0]);
  if (!$$(".fc-row.custom").length) throw new Error("custom row not added");
});
step("core revision never locks at 0 HP", () => {
  KOS.store.state.governor.hp = 0;
  KOS.show("ref", { subject: "compsci", ref: "4.2.3.1" });
  const tabs = $$(".study-tab").map(t => t.dataset.tab);
  for (const t of ["notes", "cards", "quiz", "exam"]) {
    if (!tabs.includes(t)) throw new Error(t + " tab missing");
    click($$(".study-tab").find(b => b.dataset.tab === t));
    if ($(".gov-lock")) throw new Error(t + " got locked!");
  }
  // but the sim tab IS suspended
  if (tabs.includes("sim")) {
    click($$(".study-tab").find(b => b.dataset.tab === "sim"));
    if (!$(".gov-lock")) throw new Error("sim tab not suspended at 0 HP");
  }
});

setTimeout(() => {
  console.log("\n==============================");
  if (errors.length) { console.log("FAILURES (" + errors.length + "):"); errors.forEach(e => console.log(" • " + e)); process.exit(1); }
  else { console.log("ALL SMOKE TESTS PASSED"); process.exit(0); }
}, 400);
