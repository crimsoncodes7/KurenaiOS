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
  /* 3j rebalance: sims are 100 gold (the 2a 90 was a flagged placeholder) */
  if (!r.ok || !KOS.governor.owns("logic-lab") || g.gold !== 500 - 100) throw new Error(JSON.stringify(r) + " gold=" + g.gold);
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
  if ($(".streak-chip").length < 2) throw new Error("streak chips: " + $(".streak-chip").length);
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

console.log("== focus timer (Build 2b) ==");
const setVis = v => {
  Object.defineProperty(document, "visibilityState", { value: v, configurable: true });
  document.dispatchEvent(new window.Event("visibilitychange"));
};
step("start custom session -> running, chrome hidden, stage + dock built", () => {
  KOS.store.state.governor.hp = 50;
  KOS.focus.start({ mode: "custom", workMin: 25, breakMin: 5, subject: "compsci", ref: "4.2.3.1" });
  if (KOS.focus.state() !== "running") throw new Error("state: " + KOS.focus.state());
  if (!document.body.classList.contains("focus-mode")) throw new Error("focus-mode class missing");
  if (!$(".fx-stage .fx-clock")) throw new Error("stage clock missing");
  if (!$(".fx-dock")) throw new Error("dock missing");
  if (!KOS.focus.activeId()) throw new Error("no active id");
});
step("attribution: entries logged mid-session carry the focusId", () => {
  KOS.sessions.log({ type: "quiz", subject: "compsci", ref: "4.2.2.1", metrics: { correct: 5, total: 5, pct: 100 } });
  const last = KOS.sessions.all()[KOS.sessions.all().length - 1];
  if (last.focusId !== KOS.focus.activeId()) throw new Error("focusId: " + last.focusId);
});
step("pause economy: pauses counted; resume works", () => {
  KOS.focus.pause();
  if (KOS.focus.state() !== "paused") throw new Error("not paused");
  KOS.focus.resume();
  if (KOS.focus.state() !== "running") throw new Error("not resumed");
  if (KOS.focus.session().pauses !== 1) throw new Error("pauses: " + KOS.focus.session().pauses);
  // the distraction step below adds one more pause/resume -> 2 total for the session
});
step("distractions: first free, second nicks HP; only while running", () => {
  const hp0 = KOS.store.state.governor.hp;
  setVis("hidden"); setVis("visible");                       // #1 — free
  if (KOS.focus.session().distractions.length !== 1) throw new Error("d1: " + KOS.focus.session().distractions.length);
  if (KOS.store.state.governor.hp !== hp0) throw new Error("first distraction should be free");
  setVis("hidden"); setVis("visible");                       // #2 — −2 HP
  if (KOS.focus.session().distractions.length !== 2) throw new Error("d2");
  if (KOS.store.state.governor.hp !== hp0 - 2) throw new Error("hp: " + KOS.store.state.governor.hp);
  KOS.focus.pause();
  setVis("hidden"); setVis("visible");                       // paused — not a distraction
  if (KOS.focus.session().distractions.length !== 2) throw new Error("paused tab-switch counted");
  KOS.focus.resume();
});
step("pomodoro cycle: work interval completes -> break, end becomes eligible", () => {
  if (KOS.focus.canComplete()) throw new Error("complete-eligible too early");
  KOS.focus._debugAdvance(25 * 60);
  KOS.focus.tick();
  const s = KOS.focus.session();
  if (s.phase !== "break" || s.cycles !== 1) throw new Error("phase=" + s.phase + " cycles=" + s.cycles);
  if (!KOS.focus.canComplete()) throw new Error("should be end-eligible after a full cycle");
  if (KOS.focus.workSeconds() !== 1500) throw new Error("workSeconds: " + KOS.focus.workSeconds());
});
step("complete: real dur + activity summary logged, award paid with pause penalty, chrome restored, block ticked", () => {
  const today = KOS.srs.todayISO();
  const blk = KOS.calendar.addEvent({ title: "Focus test block", date: today, type: "study", subject: "compsci", recur: "none" });
  const g = KOS.store.state.governor;
  const gold0 = g.gold, xp0 = g.xp;
  KOS.focus.endComplete();                                    // confirm() stubbed true -> block ticked
  if (KOS.focus.state() !== "idle") throw new Error("session not cleared");
  if (document.body.classList.contains("focus-mode")) throw new Error("chrome not restored");
  if ($(".fx-stage")) throw new Error("stage not removed");
  const e = KOS.sessions.all()[KOS.sessions.all().length - 1];
  if (e.type !== "focus" || e.dur !== 1500) throw new Error("entry: " + e.type + " dur=" + e.dur);
  if (!e.metrics.complete || e.metrics.pauses !== 2 || e.metrics.distractions !== 2) throw new Error(JSON.stringify(e.metrics));
  if (e.metrics.activities.quizzes !== 1 || !/quiz/.test(e.metrics.summary)) throw new Error("summary: " + e.metrics.summary);
  // 25 min, 1 extra pause: xp 35->30, gold 5->4 after the 15% shave
  if (g.xp - xp0 !== 30) throw new Error("xp delta: " + (g.xp - xp0));
  if (g.gold - gold0 !== 4) throw new Error("gold delta: " + (g.gold - gold0));
  if (!KOS.store.state.todo.autoChecked[today + "|blk" + blk.id]) throw new Error("study block not ticked");
});
step("early stop: still logs (incomplete), award forfeited", () => {
  const g = KOS.store.state.governor;
  KOS.focus.start({ mode: "pomodoro", workMin: 25, breakMin: 5, subject: null, ref: null });
  KOS.focus._debugAdvance(120);
  const gold0 = g.gold, xp0 = g.xp, n0 = KOS.sessions.all().length;
  KOS.focus.endEarly();                                       // confirm() stubbed true
  if (KOS.focus.state() !== "idle") throw new Error("not cleared");
  const e = KOS.sessions.all()[KOS.sessions.all().length - 1];
  if (KOS.sessions.all().length !== n0 + 1) throw new Error("not logged");
  if (e.type !== "focus" || e.metrics.complete !== false) throw new Error("entry: " + JSON.stringify(e.metrics));
  if (e.dur < 118 || e.dur > 125) throw new Error("dur: " + e.dur);
  if (g.gold !== gold0 || g.xp !== xp0) throw new Error("award not forfeited");
});
step("focus start view renders modes + link selects; reload restore is paused", () => {
  KOS.show("focus");
  if ($$(".fx-mode-card").length !== 2) throw new Error("mode cards: " + $$(".fx-mode-card").length);
  if (!$(".fx-start")) throw new Error("start button missing");
  // simulate a reload restore: plant a running snapshot and re-eval focus.js
  const f = KOS.store.state.focus;
  f.active = { id: "f99", mode: "custom", workMin: 25, breakMin: 0, subject: null, ref: null,
    state: "running", phase: "work", phaseAccum: 300, phaseStartTs: Date.now() - 60000,
    lastBeat: Date.now() - 50000, workAccum: 0, cycles: 0, pauses: 0, distractions: [], startedAt: Date.now() - 400000 };
  window.eval(fs.readFileSync(path.join(ROOT, "js/modules/focus.js"), "utf8"));
  if (KOS.focus.state() !== "paused") throw new Error("restore state: " + KOS.focus.state());
  // 300s accumulated + ~10s credited up to the heartbeat
  const ws = KOS.focus.workSeconds();
  if (ws < 305 || ws > 315) throw new Error("restored workSeconds: " + ws);
  KOS.focus.endEarly();                                       // clean up for the exit checks
  if (document.body.classList.contains("focus-mode")) throw new Error("chrome stuck after cleanup");
});

console.log("== tracker (Build 2c: FR-3.4/3.5) ==");
step("add exam entry -> stored, session-logged, awarded", () => {
  const g = KOS.store.state.governor, gold0 = g.gold;
  const n0 = KOS.sessions.all().length;
  const e = KOS.tracker.add({ kind: "exam", subject: "maths", ref: "2.3", topic: "Quadratics mock",
    paper: "Paper 1", marks: 10, max: 40, grade: "U", date: today, well: "surds", badly: "discriminant", notes: "recheck b²−4ac" });
  if (!e.id || KOS.store.state.tracker.entries.length !== 1) throw new Error("not stored");
  const log = KOS.sessions.all()[KOS.sessions.all().length - 1];
  if (KOS.sessions.all().length !== n0 + 1 || log.type !== "tracker") throw new Error("no session entry");
  if (log.metrics.pct !== 25) throw new Error("pct: " + log.metrics.pct);
  if (g.gold <= gold0 - 1) throw new Error("no award");
  if (KOS.tracker.forRef("maths", "2.3").length !== 1) throw new Error("forRef miss");
});
step("tracker view renders rows, reviewed toggle + update persist", () => {
  KOS.show("tracker");
  if ($$(".study-tab").length !== 2) throw new Error("kind tabs: " + $$(".study-tab").length);
  if (!$$(".trk-row").length) throw new Error("no rows");
  const e = KOS.store.state.tracker.entries[0];
  KOS.tracker.update(e.id, { reviewed: true, grade: "C" });
  if (!KOS.store.state.tracker.entries[0].reviewed || KOS.store.state.tracker.entries[0].grade !== "C") throw new Error("update lost");
  // paper tab is empty for now
  click($$(".study-tab").find(t => t.dataset.tab === "paper"));
  if ($$(".trk-row").length) throw new Error("paper tab should be empty");
});

console.log("== RAG flagging (FR-3.3) ==");
step("auto score degrades with lapses + quiz + exam data", () => {
  // maths:2.3 already has: 1 tracked card (overdue) + a 25% mock (above).
  KOS.store.state.study = KOS.store.state.study || {};
  KOS.store.state.study.quiz = KOS.store.state.study.quiz || {};
  KOS.store.state.study.quiz["maths:2.3"] = { attempts: 1, best: 1, lastPct: 20 };
  for (let i = 0; i < 3; i++) KOS.srs.rate("maths:2.3:0", 0);   // 3 lapses
  const a = KOS.rag.auto("maths", "2.3");
  if (!a) throw new Error("no auto rating despite data");
  if (a.band !== "r") throw new Error("expected red, got " + a.band + " (score " + a.score + ")");
  if (!a.reasons.length) throw new Error("no reasons");
});
step("manual override wins display; disagreement is surfaced", () => {
  KOS.rag.setManual("maths", "2.3", "g");
  const e = KOS.rag.effective("maths", "2.3");
  if (e.band !== "g" || e.source !== "manual") throw new Error(JSON.stringify(e));
  if (!e.disagree) throw new Error("disagreement not flagged");
  KOS.rag.setManual("maths", "2.3", null);                      // clear
  if (KOS.rag.effective("maths", "2.3").band !== "r") throw new Error("auto not restored");
});
step("worst() + recommended-next panel on home", () => {
  const w = KOS.rag.worst(null, 6);
  if (!w.some(t => t.sid === "maths" && t.ref === "2.3")) throw new Error("flagged topic missing from worst()");
  KOS.show("home");
  if (!$(".rag-panel")) throw new Error("no recommended-next panel");
  if (!$$(".rag-item").length) throw new Error("no flagged items");
});
step("ref page carries the confidence picker + data verdict", () => {
  KOS.show("ref", { subject: "maths", ref: "2.3" });
  if (!$(".rag-picker")) throw new Error("picker missing");
  if ($$(".rag-pick").length !== 3) throw new Error("pick buttons: " + $$(".rag-pick").length);
  click($$(".rag-pick")[2]);                                    // set green manually
  if (KOS.rag.manual("maths", "2.3") !== "g") throw new Error("manual not set via picker");
  if (!$(".rag-disagree")) throw new Error("disagreement indicator missing");
  click($$(".rag-pick")[2]);                                    // click again clears
  if (KOS.rag.manual("maths", "2.3") !== null) throw new Error("clear failed");
});

console.log("== card stats (FR-1.6) ==");
step("dashboard renders stat strip + SVG charts", () => {
  KOS.show("cardstats");
  if ($$(".stat-card").length < 6) throw new Error("stat strip thin");
  if ($$(".cs-chart svg").length < 4) throw new Error("charts: " + $$(".cs-chart svg").length);
  if (!$$(".cs-chart svg rect").length) throw new Error("no bars drawn");
});
step("subject scope adds the per-topic breakdown, drill-down to topic", () => {
  KOS.show("cardstats", { subject: "maths" });
  if (!$(".cs-topics")) throw new Error("per-topic table missing");
  if (!$$(".cs-topics tbody tr").length) throw new Error("no topic rows");
  KOS.show("cardstats", { subject: "maths", ref: "2.3" });
  if (!$$(".cs-chart svg").length) throw new Error("topic-scope charts missing");
});

console.log("== resources (FR-2.8) + attachments (FR-2.5) ==");
step("resource table CRUD on the subject dashboard", () => {
  KOS.show("subject", "maths");
  if (!$(".res-table")) throw new Error("resource table missing");
  const ins = $$(".res-add .todo-in");
  ins[0].value = "PMT pure notes"; ins[1].value = "https://example.org/pmt";
  click($$(".res-add .btn")[0]);
  if (!$$(".res-row").length) throw new Error("row not added");
  if (KOS.store.state.resources.items.length !== 1) throw new Error("not stored");
  click($(".res-row .mini-btn.danger"));                        // confirm stubbed true
  if (KOS.store.state.resources.items.length !== 0) throw new Error("delete failed");
});
step("files tab present on every ref; degrades without IndexedDB", () => {
  KOS.show("ref", { subject: "it", ref: "F200.1.1" });
  const ft = $$(".study-tab").find(t => t.dataset.tab === "files");
  if (!ft) throw new Error("files tab missing");
  click(ft);
  if (KOS.attach.available()) {
    if (!$$(".lab-controls .btn.primary").length) throw new Error("upload control missing");
  } else {
    if (!$(".att-unavail")) throw new Error("no graceful fallback without IndexedDB");
  }
});

console.log("== streak integrity (2c) ==");
step("early-stopped focus sessions don't keep a streak alive", () => {
  KOS.store.state.sessions.splice(0);                           // clean slate
  KOS.sessions.log({ type: "focus", subject: null, ref: null, dur: 300,
    metrics: { complete: false, mins: 5, pauses: 0, distractions: 0 } });
  if (KOS.sessions.streak(null) !== 0) throw new Error("incomplete focus counted: " + KOS.sessions.streak(null));
  KOS.sessions.log({ type: "quiz", subject: "maths", ref: "2.3", metrics: { correct: 3, total: 5, pct: 60 } });
  if (KOS.sessions.streak(null) !== 1) throw new Error("normal session should count");
  KOS.sessions.log({ type: "focus", subject: null, ref: null, dur: 1500,
    metrics: { complete: true, mins: 25, pauses: 0, distractions: 0 } });
  if (KOS.sessions.streak(null) !== 1) throw new Error("completed focus should count (still 1 day)");
});

console.log("== help view ==");
step("help & guide renders every section", () => {
  KOS.show("help");
  if ($$(".help-card").length < 15) throw new Error("help cards: " + $$(".help-card").length);
});

setTimeout(() => {
  console.log("\n==============================");
  if (errors.length) { console.log("FAILURES (" + errors.length + "):"); errors.forEach(e => console.log(" • " + e)); process.exit(1); }
  else { console.log("ALL SMOKE TESTS PASSED"); process.exit(0); }
}, 400);
