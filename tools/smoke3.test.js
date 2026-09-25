/* Kurenai OS — smoke3.test.js
   Build 2a governor suite: SM-2 scheduling, custom-card CRUD, session log +
   streaks, HP/gold/XP economy + gating, calendar + reminders, daily to-do,
   and the hard rule that core revision never locks. Run:
     node tools/smoke3.test.js */
const { JSDOM } = require("jsdom");
/* a sub-navigation entry is named by its label; its mark and count are extras */
const subnavName = (b) => (b.getAttribute("aria-label") || b.textContent).trim();
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
step("gating: HP never locks — owned labs open and the shop sells while strained; gold still gates", () => {
  const g = KOS.store.state.governor;
  g.hp = 45; g.owned = ["trace"];
  if (!KOS.governor.simAccess("tl-stack").ok) throw new Error("low HP must not suspend an owned lab");
  g.gold = 500;
  const bought = KOS.governor.buy("oop");
  if (!bought.ok) throw new Error("the shop must stay open while strained: " + bought.msg);
  g.gold = 500;
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
  if (!$("[data-ui~='fc.card']") && !$("[data-ui~='review.due-clear']")) throw new Error("due view empty");
  /* Graphite (frame 9a): the overview's queue figure replaces the strip */
  KOS.show("review");
  if (!$("[data-ui~='review.queue'] [data-ui~='review.due-count']")) throw new Error("no queue figure");
});
step("Study Review and Productivity own the intended navigation", () => {
  KOS.show("review");
  const reviewTabs = $$("[data-ui~='review.tabs'] [data-ui~='ui.tab']").map(b => b.textContent.trim());
  if (reviewTabs.join("|") !== "Due today|Card stats") throw new Error("review tabs: " + reviewTabs.join("|"));
  if (!$("[data-ui~='ui.page-head'] [data-ui~='review.tabs']")) throw new Error("Review tabs are not in the header");
  if (!document.querySelector('[data-ui~="shell.rail-item"][data-section="study"]').matches('[data-state~="active"]')) throw new Error("Study rail not active");

  click($$("[data-ui~='review.tabs'] [data-ui~='ui.tab']").find(b => b.textContent.trim() === "Card stats"));
  if (!$$("[data-ui~='chart.chart'] svg").length && !$("[data-ui~='review.stats-empty']")) throw new Error("Review Card Stats pane missing");
  if (!$$("[data-ui~='review.tabs'] [data-ui~='ui.tab']").find(b => b.textContent.trim() === "Card stats").matches('[data-state~="active"]')) throw new Error("stats tab inactive");

  KOS.show("due");
  if (!$$("[data-ui~='review.tabs'] [data-ui~='ui.tab']").find(b => b.textContent.trim() === "Due today").matches('[data-state~="active"]')) throw new Error("due compatibility route lost its tab");
  KOS.show("focus");
  if (!document.querySelector('[data-ui~="shell.rail-item"][data-section="productivity"]').matches('[data-state~="active"]')) throw new Error("Productivity rail not active");
  const productivityTabs = $$("#subnav [data-ui~='shell.subnav-item']").map(b => subnavName(b));
  /* Build 6.2: Reminders became a page of its own, so Tasks & Habits is now
     just Habits and Reminders sits beside it.
     Pacing (the integrated weekly plan) joined the section afterwards — it is
     a time surface, so it belongs beside the Calendar rather than under Study.
     This stays an exact match on purpose: the Productivity section's list of
     destinations is a deliberate decision, not something a page may join by
     registering itself. */
  if (productivityTabs.join("|") !== "Focus Timer|Reminders|Habits|Calendar|Pacing") throw new Error("productivity tabs: " + productivityTabs.join("|"));
  KOS.show("tracker");
  /* Graphite (frame 9d): the record switch leads the row of filters under the header */
  if (!$("[data-ui~='tracker.tools'] [data-ui~='tracker.kinds']")) throw new Error("the record switch is missing");
});
step("governor view: all four tabs render", () => {
  KOS.show("governor");
  for (const t of ["status", "shop", "avatar", "history"]) {
    click($$("[data-ui~='ui.tab']").find(b => b.dataset.tab === t));
    if (!$("[data-ui~='study.panel']").children.length) throw new Error(t + " tab empty");
  }
  click($$("[data-ui~='ui.tab']").find(b => b.dataset.tab === "shop"));
  if (!$$("[data-ui~='shop.card']").length) throw new Error("no shop cards");
  click($$("[data-ui~='ui.tab']").find(b => b.dataset.tab === "avatar"));
  if ($$("[data-ui~='gov.seal-card']").length !== 5) throw new Error("seal count: " + $$("[data-ui~='gov.seal-card']").length);
});
/* Build 6.6 rebuilt both views: the month trims to whole weeks (35 or 42
   cells, never a trailing empty row) and the week is a real time grid, not
   seven tall month cells. */
step("calendar view renders month grid + sample events", () => {
  KOS.show("calendar");
  const cells = $$("[data-ui~='cal.cell']").length;
  if (cells !== 35 && cells !== 42) throw new Error("cells: " + cells);
  if (!$$("[data-ui~='cal.event']").length) throw new Error("no events painted");
  if (!$("[data-ui~='cal.cell'][data-state~='today']")) throw new Error("today is not marked on the grid");
  // week mode is the time grid: seven day columns, an all-day band, an hour gutter
  click($$("[data-ui~='cal.mode']").find(b => b.textContent === "Week"));
  if (!$("[data-ui~='cal.week']")) throw new Error("week view did not render the time grid");
  if ($$("[data-ui~='cal.w-col']").length !== 7) throw new Error("week columns: " + $$("[data-ui~='cal.w-col']").length);
  if ($$("[data-ui~='cal.w-band-col']").length !== 7) throw new Error("no all-day band");
  if (!$$("[data-ui~='cal.w-hour']").length) throw new Error("no hour gutter");
  click($$("[data-ui~='cal.mode']").find(b => b.textContent === "Month"));
  if (!$$("[data-ui~='cal.cell']").length) throw new Error("month view did not come back");
});
step("home renders today panel + countdowns + streak chips + HUD", () => {
  KOS.show("home");
  if (!$("[data-ui~='habit.panel']")) throw new Error("no todo panel");
  if (!$("[data-ui~='cal.countdowns']")) throw new Error("no countdown widget");
  if ($("[data-ui~='home.streak']").length < 2) throw new Error("streak chips: " + $("[data-ui~='home.streak']").length);
  if (!$("#hud [data-ui~='gov.hud']")) throw new Error("HUD missing");
});
step("per-topic flashcards tab: SM-2 buttons + manage + custom add", () => {
  KOS.show("ref", { subject: "compsci", ref: "4.2.3.1" });
  click($$("[data-ui~='ui.tab']").find(t => t.dataset.tab === "cards"));
  if (!$("[data-ui~='fc.card']")) throw new Error("no card");
  click($("[data-ui~='fc.card']"));
  const rates = $$("[data-ui~='fc.rate'] [data-ui~='fc.r']");
  if (rates.length !== 4) throw new Error("rating buttons: " + rates.length);
  // the deck browser: every card, and the one route to editing — the study
  // editor (a topic page never carries two edit surfaces for a card)
  click($$("[data-ui~='fc.mode']")[1]);
  if (!$$("[data-ui~='fc.row']").length) throw new Error("deck rows missing");
  const editBtn = $$("[data-ui~='fc.manage'] button[data-intent~='primary']").find(b => /Edit deck/.test(b.textContent));
  if (!editBtn) throw new Error("the deck browser does not hand off to the editor");
  click(editBtn);
  if (!$("[data-ui~='editor.root']")) throw new Error("the study editor did not open");
  click($$("[data-ui~='editor.root'] button[data-intent~='primary']").find(b => /Add card/.test(b.textContent)));
  const tas = $$("[data-ui~='editor.root'] [data-ui~='editor.row']:not([data-kind='custom']) textarea");
  const q = tas[tas.length - 2], a = tas[tas.length - 1];
  q.value = "QQ"; q.dispatchEvent(new window.Event("input", { bubbles: true }));
  a.value = "AA"; a.dispatchEvent(new window.Event("input", { bubbles: true }));
  const fork = KOS.edits.get("compsci", "4.2.3.1");
  if (!fork || !fork.flashcards.some(c => c.q === "QQ" || c.a === "AA" || c.q === "")) throw new Error("the added card did not fork the deck");
  click($("[data-ui~='editor.root'] [data-ui~='editor.done']"));
  if ($("[data-ui~='editor.root']")) throw new Error("the editor did not close");
});
step("core revision never locks at 0 HP", () => {
  KOS.store.state.governor.hp = 0;
  KOS.show("ref", { subject: "compsci", ref: "4.2.3.1" });
  const tabs = $$("[data-ui~='ui.tab']").map(t => t.dataset.tab);
  for (const t of ["notes", "cards", "quiz", "exam"]) {
    if (!tabs.includes(t)) throw new Error(t + " tab missing");
    click($$("[data-ui~='ui.tab']").find(b => b.dataset.tab === t));
    if ($("[data-ui~='gov.lock']")) throw new Error(t + " got locked!");
  }
  // and the sim tab is NOT suspended either — HP is a signal, not a lock
  if (tabs.includes("sim")) {
    click($$("[data-ui~='ui.tab']").find(b => b.dataset.tab === "sim"));
    const lock = $("[data-ui~='gov.lock']");
    if (lock && /HP/.test(lock.textContent)) throw new Error("sim tab suspended at 0 HP");
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
  if (!document.documentElement.hasAttribute("data-focus")) throw new Error("focus-mode class missing");
  if (!$("[data-ui~='focus.stage'] [data-ui~='focus.clock']")) throw new Error("stage clock missing");
  if (!$("[data-ui~='focus.dock']")) throw new Error("dock missing");
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
  if (document.documentElement.hasAttribute("data-focus")) throw new Error("chrome not restored");
  if ($("[data-ui~='focus.stage']")) throw new Error("stage not removed");
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
  /* Graphite (frame 10a): Pomodoro, Custom and Reading */
  if ($$("[data-ui~='focus.mode']").length !== 3) throw new Error("mode cards: " + $$("[data-ui~='focus.mode']").length);
  if (!$("[data-ui~='focus.start']")) throw new Error("start button missing");
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
  if (document.documentElement.hasAttribute("data-focus")) throw new Error("chrome stuck after cleanup");
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
  if ($$("[data-ui~='ui.tab']").length !== 2) throw new Error("kind tabs: " + $$("[data-ui~='ui.tab']").length);
  if (!$$("[data-ui~='tracker.row']").length) throw new Error("no rows");
  const e = KOS.store.state.tracker.entries[0];
  KOS.tracker.update(e.id, { reviewed: true, grade: "C" });
  if (!KOS.store.state.tracker.entries[0].reviewed || KOS.store.state.tracker.entries[0].grade !== "C") throw new Error("update lost");
  // paper tab is empty for now
  click($$("[data-ui~='ui.tab']").find(t => t.dataset.tab === "paper"));
  if ($$("[data-ui~='tracker.row']").length) throw new Error("paper tab should be empty");
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
  /* Graphite (frame 7a): the struggling-topics panel became each desk's
     "Weakest" row, read from the same KOS.rag.worst() */
  const weakest = $$("[data-ui~='home.desk'][data-sid='maths'] [data-ui~='rag.item']");
  if (!weakest.length) throw new Error("no weakest topic on the Maths desk");
  if (weakest[0].textContent.indexOf(KOS.rag.worst("maths", 1)[0].ref) !== 0) throw new Error("the desk does not name worst()'s topic");
});
step("ref page carries the confidence picker + data verdict", () => {
  KOS.show("ref", { subject: "maths", ref: "2.3" });
  if (!$("[data-ui~='rag.picker']")) throw new Error("picker missing");
  if ($$("[data-ui~='rag.pick']").length !== 3) throw new Error("pick buttons: " + $$("[data-ui~='rag.pick']").length);
  click($$("[data-ui~='rag.pick']")[2]);                                    // set green manually
  if (KOS.rag.manual("maths", "2.3") !== "g") throw new Error("manual not set via picker");
  if (!$("[data-ui~='rag.disagree']")) throw new Error("disagreement indicator missing");
  click($$("[data-ui~='rag.pick']")[2]);                                    // click again clears
  if (KOS.rag.manual("maths", "2.3") !== null) throw new Error("clear failed");
});

console.log("== card stats (FR-1.6) ==");
/* Phase G deliberately refuses to draw a trend from one scheduled card.
   This dashboard step is the populated-data case, so give the topic three
   independent scheduled cards rather than relying on repeated ratings of
   one card to impersonate a distribution. */
KOS.store.state.srs["maths:2.3:1"] = { ef: 2.3, ivl: 4, reps: 2, due: KOS.srs.addDays(today, 2), last: today, views: 2, lapses: 1, lastRating: 1 };
KOS.store.state.srs["maths:2.3:2"] = { ef: 2.7, ivl: 8, reps: 3, due: KOS.srs.addDays(today, 5), last: today, views: 2, lapses: 0, lastRating: 2 };
step("dashboard renders stat strip + SVG charts", () => {
  KOS.show("cardstats");
  if ($$("[data-ui~='ui.stat']").length < 6) throw new Error("stat strip thin");
  /* Graphite (frame 9b): three bar charts; the rating mix is one stacked bar */
  if ($$("[data-ui~='chart.chart'] svg").length < 3) throw new Error("charts: " + $$("[data-ui~='chart.chart'] svg").length);
  if (!$("[data-ui~='review.rating-mix']")) throw new Error("no rating mix");
  if (!$$("[data-ui~='chart.chart'] svg rect").length) throw new Error("no bars drawn");
});
step("subject scope adds the per-topic breakdown, drill-down to topic", () => {
  KOS.show("cardstats", { subject: "maths" });
  if (!$("[data-ui~='chart.topics']")) throw new Error("per-topic table missing");
  if (!$$("[data-ui~='chart.topics'] tbody tr").length) throw new Error("no topic rows");
  KOS.show("cardstats", { subject: "maths", ref: "2.3" });
  if (!$$("[data-ui~='chart.chart'] svg").length) throw new Error("topic-scope charts missing");
});

console.log("== resources (FR-2.8) + attachments (FR-2.5) ==");
step("resource table CRUD on the subject dashboard", () => {
  KOS.show("subject", "maths");
  if (!$("[data-ui~='study.resources']")) throw new Error("resource table missing");
  /* Graphite (frame 8a): "+ Add" opens a small form in a dialog */
  click($("[data-ui~='study.resource-add']"));
  const dlg = $("[data-ui~='ui.dialog']");
  if (!dlg) throw new Error("the add dialog did not open");
  dlg.querySelector("[aria-label='Resource name']").value = "PMT pure notes";
  dlg.querySelector("[aria-label='Resource link or file path']").value = "https://example.org/pmt";
  click(dlg.querySelector("button[data-intent~='primary']"));
  if (!$$("[data-ui~='study.resource-row']").length) throw new Error("row not added");
  if (KOS.store.state.resources.items.length !== 1) throw new Error("not stored");
  click($("[data-ui~='study.resource-row'] button[data-intent~='danger']"));                        // confirm stubbed true
  if (KOS.store.state.resources.items.length !== 0) throw new Error("delete failed");
});
step("files tab present on every ref; degrades without IndexedDB", () => {
  KOS.show("ref", { subject: "it", ref: "F200.1.1" });
  const ft = $$("[data-ui~='ui.tab']").find(t => t.dataset.tab === "files");
  if (!ft) throw new Error("files tab missing");
  click(ft);
  if (KOS.attach.available()) {
    if (!$$("[data-ui~='lab.controls'] button[data-intent~='primary']").length) throw new Error("upload control missing");
  } else {
    if (!$("[data-ui~='attach.unavail']")) throw new Error("no graceful fallback without IndexedDB");
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
  if ($("[data-ui~='help.row']").length < 15) throw new Error("help rows: " + $("[data-ui~='help.row']").length);
  if (!$("[data-ui~='help.nav-item']")) throw new Error("help nav missing");
});

setTimeout(() => {
  console.log("\n==============================");
  if (errors.length) { console.log("FAILURES (" + errors.length + "):"); errors.forEach(e => console.log(" • " + e)); process.exit(1); }
  else { console.log("ALL SMOKE TESTS PASSED"); process.exit(0); }
}, 400);
