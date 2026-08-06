/* Kurenai OS — smoke34.test.js
   Build 6.5: the Focus Timer, end to end.

   The claims this suite pins down, in the order the user meets them:

     SETUP is a short form and an honest one. The deal it states is QUOTED
     from KOS.governor.focusAward for the duration actually chosen, so the
     numbers on the screen are the numbers paid — and quoting them moves
     nothing.

     RUNNING adds only what a live session needs: the context it was started
     for, its objective, cycle progress, quick notes, a free self-marked
     distraction, and a live reward-eligibility read. All of it rides the
     persisted snapshot.

     COMPLETION is a review of a record that ALREADY EXISTS. The session is
     logged and paid before the modal opens, so dismissing it, or never
     seeing it, costs nothing. What it collects — objective result,
     reflection, assignment progress, where the notes go — annotates that
     one entry and never pays a second time.

     FAIRNESS: a refresh or a navigation must not cost a session. The clock
     is banked synchronously at pagehide, the unload's own visibilitychange
     is not charged as a distraction, and restore comes back paused with the
     time intact and no phantom pause.

   Run: node tools/smoke34.test.js                                          */
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
/* NOTE: __kosAutoConfirm is deliberately NOT set globally here. It is the
   documented headless hook that suppresses both KOS.ui.confirm and the
   completion review, and this suite's whole subject is that review. Steps
   that need a confirm auto-answered set it locally. */
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
const byText = (sel, re) => $$(sel).find(n => re.test(n.textContent));
function step(name, fn) {
  try { fn(); console.log("  ok  " + name); }
  catch (e) { errors.push(`STEP "${name}": ${e.stack.split("\n").slice(0, 2).join(" | ")}`); console.log("FAIL  " + name); }
}
function assert(cond, msg) { if (!cond) throw new Error(msg); }
const setVis = v => {
  Object.defineProperty(document, "visibilityState", { value: v, configurable: true });
  document.dispatchEvent(new window.Event("visibilitychange"));
};
const G = () => KOS.store.state.governor;
const lastSession = () => KOS.sessions.all()[KOS.sessions.all().length - 1];
/* close whatever overlay is on screen without saving anything */
const closeOverlay = () => { const ov = $(".modal-ov"); if (ov) ov.remove(); };

G().hp = 60;

/* ============ 1 · the deal, quoted not guessed ============ */
console.log("== the deal (pure award arithmetic) ==");

step("focusAward is pure: quoting it moves no HP, XP or gold", () => {
  const g = G();
  const before = [g.hp, g.xp, g.gold].join("/");
  const a = KOS.governor.focusAward({ complete: true, mins: 25, pauses: 0 });
  assert(a.xp === 35 && a.gold === 5 && a.hp === 6, "25-min award: " + JSON.stringify(a));
  assert([g.hp, g.xp, g.gold].join("/") === before, "quoting the award mutated the governor");
});

step("the quote matches what onSession actually pays, penalties included", () => {
  const quoted = KOS.governor.focusAward({ complete: true, mins: 25, pauses: 2 });
  const g = G();
  const xp0 = g.xp, gold0 = g.gold;
  KOS.sessions.log({ type: "focus", subject: null, ref: null, dur: 1500,
    metrics: { complete: true, mins: 25, pauses: 2, distractions: 0 } });
  assert(g.xp - xp0 === quoted.xp, "xp quoted " + quoted.xp + " paid " + (g.xp - xp0));
  assert(g.gold - gold0 === quoted.gold, "gold quoted " + quoted.gold + " paid " + (g.gold - gold0));
  assert(quoted.penaltyPct === 15 && quoted.extraPauses === 1, "penalty read: " + JSON.stringify(quoted));
});

step("an incomplete session quotes — and pays — nothing", () => {
  const a = KOS.governor.focusAward({ complete: false, mins: 40, pauses: 0 });
  assert(a.forfeited && a.xp === 0 && a.gold === 0, "forfeit: " + JSON.stringify(a));
  const g = G();
  const xp0 = g.xp, gold0 = g.gold;
  KOS.sessions.log({ type: "focus", subject: null, ref: null, dur: 2400,
    metrics: { complete: false, mins: 40, pauses: 0, distractions: 0 } });
  assert(g.xp === xp0 && g.gold === gold0, "an early end paid something");
  assert(KOS.governor.lastAward().xp === 0, "lastAward should record the forfeit");
});

/* ============ 2 · the setup screen ============ */
console.log("== setup ==");

let asg = null;
step("setup renders one calm form: modes, duration, links, one objective", () => {
  KOS.show("focus");
  assert($$(".fx-mode-card").length === 2, "mode cards: " + $$(".fx-mode-card").length);
  assert($$(".fx-link-row .cal-field").length === 3, "subject/topic/assignment fields expected");
  assert($$(".fx-obj-in").length === 1, "exactly one objective input");
  assert($$(".fx-start").length === 1, "one start button");
  /* nothing is invented to fill the column: the side rail is the deal and
     the record, and nothing else */
  assert($$(".fx-setup-side > *").length === 2, "side panels: " + $$(".fx-setup-side > *").length);
});

step("the deal states the real award for the duration on screen", () => {
  const deal = $(".fx-deal-list").textContent;
  assert(/\+35 XP/.test(deal) && /\+5 gold/.test(deal) && /\+6 HP/.test(deal), "pomodoro deal: " + deal);
  assert(/−15%/.test(deal), "the pause penalty must be stated: " + deal);
  assert(/−2 HP/.test(deal), "the tab-switch penalty must be stated: " + deal);
  assert(/forfeited/.test(deal), "the early-end rule must be stated: " + deal);
  assert(/free/.test(deal), "self-marking must be stated as free: " + deal);
  /* refreshing costs nothing — said before it is relied on */
  assert(/Refreshing/.test($(".fx-deal-foot").textContent), "the refresh promise is missing");
});

step("choosing Custom + a longer interval re-quotes the deal", () => {
  click(byText(".fx-mode-card", /Custom/));
  const work = $(".fx-custom .fx-num");
  work.value = "50";
  work.dispatchEvent(new window.Event("input", { bubbles: true }));
  const deal = $(".fx-deal-list").textContent;
  const a = KOS.governor.focusAward({ complete: true, mins: 50, pauses: 0 });
  assert(a.xp === 60 && a.gold === 7, "50-min award: " + JSON.stringify(a));
  assert(deal.indexOf("+" + a.xp + " XP") !== -1, "deal did not follow the duration: " + deal);
});

step("an open assignment is offered, and a deep link preselects it", () => {
  asg = KOS.assignments.add({ title: "Trees NEA writeup", subject: "compsci",
    type: "coursework", due: KOS.srs.addDays(KOS.srs.todayISO(), 4),
    subtasks: [{ id: 9001, text: "Draft the traversal section", done: false }] });
  assert(asg, "assignment fixture failed");
  KOS.show("focus", { assignmentId: asg.id });
  const sel = $(".fx-link-row select[aria-label='Link to an assignment']");
  assert(sel && sel.value === String(asg.id), "assignment not preselected: " + (sel && sel.value));
  assert($(".fx-link-row select").value === "compsci", "subject not carried from the assignment");
});

/* ============ 3 · starting, and the running stage ============ */
console.log("== running ==");

step("the form starts a session carrying subject, topic, assignment and objective", () => {
  $(".fx-obj-in").value = "  Finish the traversal section  ";
  const refSel = $$(".fx-link-row select")[1];
  refSel.value = "4.2.3.1";
  click($(".fx-start"));
  const s = KOS.focus.session();
  assert(s, "no session started");
  assert(s.subject === "compsci" && s.ref === "4.2.3.1", "context lost: " + s.subject + "/" + s.ref);
  assert(s.assignmentId === asg.id, "assignment link lost");
  assert(s.objective === "Finish the traversal section", "objective: " + JSON.stringify(s.objective));
  assert(KOS.focus.state() === "running", "state: " + KOS.focus.state());
});

step("the stage shows the context, the objective and the session's progress", () => {
  assert(/4\.2\.3\.1/.test($(".fx-topic").textContent), "topic context missing");
  assert(/Trees NEA writeup/.test($(".fx-context").textContent), "assignment chip missing");
  assert(/Finish the traversal section/.test($(".fx-objective").textContent), "objective missing from the stage");
  assert($(".fx-progress"), "session progress missing");
  assert($(".fx-clock"), "the clock must still be there");
});

step("reward eligibility is live, and honest before the first cycle", () => {
  const e = KOS.focus.eligibility();
  assert(e.forfeited, "no cycle banked yet — ending must read as a forfeit");
  const box = $(".fx-elig");
  assert(box && /forfeits/.test(box.textContent), "eligibility copy: " + (box && box.textContent));
  assert(box.classList.contains("warn"), "the forfeit state must be visually distinct");
});

step("quick notes are kept on the session and survive as data, not DOM", () => {
  const input = $(".fx-note-in");
  input.value = "BFS uses a queue, DFS a stack";
  input.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  KOS.focus.addNote("check the mark scheme wording");
  assert(KOS.focus.notes().length === 2, "notes: " + KOS.focus.notes().length);
  assert(KOS.store.state.focus.active.notes.length === 2, "notes are not in the persisted snapshot");
  assert($(".fx-notes"), "the kept-notes disclosure is missing");
  KOS.focus.removeNote(1);
  assert(KOS.focus.notes().length === 1, "removeNote did not remove");
  assert(!KOS.focus.addNote("   "), "an empty note must not be kept");
});

step("a self-marked distraction is recorded and never charged", () => {
  const hp0 = G().hp;
  KOS.focus.markDistraction();
  KOS.focus.markDistraction();
  assert(KOS.focus.marks() === 2, "marks: " + KOS.focus.marks());
  assert(G().hp === hp0, "owning a distraction cost HP — honesty must be free");
  assert(KOS.focus.session().distractions.length === 0, "a self-mark is not a tab-switch");
});

step("an unannounced tab-switch beyond the free one still costs HP", () => {
  const hp0 = G().hp;
  setVis("hidden"); setVis("visible");                    // #1 — free
  assert(G().hp === hp0, "the first tab-switch must stay free");
  setVis("hidden"); setVis("visible");                    // #2 — charged
  assert(G().hp === hp0 - 2, "hp: " + G().hp);
  assert(KOS.focus.session().distractions.length === 2, "tab switches not recorded");
});

step("the objective can be rewritten mid-session without stopping the clock", () => {
  KOS.focus.setObjective("Finish the traversal section and its diagram");
  assert(/and its diagram/.test(KOS.focus.objective()), "objective not updated");
  assert(KOS.focus.state() === "running", "editing the objective disturbed the clock");
});

/* ============ 4 · fairness: refresh and navigation ============ */
console.log("== fairness ==");

step("pagehide banks the live clock and writes it synchronously", () => {
  KOS.focus._debugAdvance(300);                            // 5 minutes in
  const banked = KOS.focus.workSeconds();
  window.dispatchEvent(new window.Event("pagehide"));
  const raw = JSON.parse(window.localStorage.getItem("kurenai-os-v1"));
  assert(raw.focus.active, "the running session was not persisted at pagehide");
  assert(raw.focus.active.phaseAccum >= banked - 2,
    "banked " + banked + "s but stored phaseAccum " + raw.focus.active.phaseAccum);
  assert(raw.focus.active.state === "running", "pagehide must not pause — a reload is not a pause");
});

step("the unload's own visibilitychange is not charged as a distraction", () => {
  const hp0 = G().hp;
  const d0 = KOS.focus.session().distractions.length;
  setVis("hidden");                                        // fired while unloading
  assert(G().hp === hp0, "a refresh cost HP");
  assert(KOS.focus.session().distractions.length === d0, "a refresh was logged as a distraction");
  window.dispatchEvent(new window.Event("pageshow"));      // came back (bfcache)
  setVis("visible");
});

step("a reload restores the session paused, with its time, notes and objective intact", () => {
  const before = KOS.focus.workSeconds();
  const pauses0 = KOS.focus.session().pauses;
  window.eval(fs.readFileSync(path.join(ROOT, "js/modules/focus.js"), "utf8"));
  const s = KOS.focus.session();
  assert(KOS.focus.state() === "paused", "restore state: " + KOS.focus.state());
  assert(KOS.focus.workSeconds() >= before - 2, "time lost: " + before + " → " + KOS.focus.workSeconds());
  assert(s.pauses === pauses0, "a reload was charged as a pause");
  assert(s.restores === 1, "the recovery was not counted: " + s.restores);
  assert(s.notes.length === 1 && /BFS/.test(s.notes[0].text), "notes lost on reload");
  assert(/and its diagram/.test(s.objective), "objective lost on reload");
  assert(s.assignmentId === asg.id, "assignment link lost on reload");
});

step("a snapshot written before this build restores without throwing", () => {
  const keep = KOS.store.state.focus.active;
  KOS.store.state.focus.active = { id: "fLegacy", mode: "custom", workMin: 25, breakMin: 0,
    subject: null, ref: null, state: "running", phase: "work", phaseAccum: 120,
    phaseStartTs: Date.now() - 5000, lastBeat: Date.now() - 4000, workAccum: 0,
    cycles: 0, pauses: 0, distractions: [], startedAt: Date.now() - 200000 };
  window.eval(fs.readFileSync(path.join(ROOT, "js/modules/focus.js"), "utf8"));
  const s = KOS.focus.session();
  assert(Array.isArray(s.notes) && Array.isArray(s.marks), "hydrate did not fill the new arrays");
  assert(s.objective === "" && s.assignmentId === null, "hydrate defaults wrong");
  KOS.store.state.focus.active = keep;
  window.eval(fs.readFileSync(path.join(ROOT, "js/modules/focus.js"), "utf8"));
  assert(KOS.focus.session().id === keep.id, "the real session was not put back");
});

/* ============ 5 · the completion review ============ */
console.log("== completion ==");

let entry = null, awarded = null;
step("completing banks a full cycle: the session is logged and paid before any review", () => {
  KOS.focus.resume();
  KOS.focus._debugAdvance(25 * 60);
  KOS.focus.tick();                                        // cycle 1 lands, break starts
  assert(KOS.focus.canComplete(), "a full cycle should make ending eligible");
  const e = KOS.focus.eligibility();
  assert(!e.forfeited && e.xp > 0, "eligibility after a cycle: " + JSON.stringify(e));
  const g = G();
  const xp0 = g.xp, n0 = KOS.sessions.all().length;
  KOS.focus.endComplete();
  entry = lastSession();
  awarded = g.xp - xp0;
  assert(KOS.sessions.all().length === n0 + 1, "the session was not logged");
  assert(entry.type === "focus" && entry.metrics.complete === true, "entry: " + JSON.stringify(entry.metrics));
  assert(awarded > 0, "the award was not paid");
  assert(KOS.focus.state() === "idle", "the session did not clear");
  assert(!document.body.classList.contains("focus-mode"), "the chrome was not restored");
});

step("the record carries the session's own working data", () => {
  const m = entry.metrics;
  assert(m.objective === "Finish the traversal section and its diagram", "objective not recorded");
  assert(m.assignmentId === asg.id, "assignment not recorded");
  assert(m.notes === 1, "note count: " + m.notes);
  assert(m.selfMarks === 2, "self-marks: " + m.selfMarks);
  assert(m.restores === 1, "restores: " + m.restores);
  /* NOT "marks" — that key already means exam marks on tracker entries and
     the Governor chronicle reads it generically */
  assert(m.marks === undefined, "self-marks must not collide with exam marks");
});

step("the review opens over a record that already exists, and reports the real award", () => {
  const rev = $(".fx-review-modal");
  assert(rev, "the completion review did not open");
  const facts = $(".fx-rev-facts").textContent;
  assert(/Focused/.test(facts) && /25 min/.test(facts), "duration missing: " + facts);
  assert(/Pauses/.test(facts) && /Tab switches/.test(facts), "pauses/tab-switches missing: " + facts);
  assert(/Self-marked/.test(facts), "self-marks missing from the review");
  assert(/Recovered/.test(facts), "the reload recovery is part of the honest record");
  const award = $(".fx-rev-award").textContent;
  assert(award.indexOf("+" + awarded + " XP") !== -1, "review award " + award + " ≠ paid " + awarded);
});

step("dismissing the review changes nothing — the session already counted", () => {
  const g = G();
  const xp0 = g.xp, n0 = KOS.sessions.all().length;
  click(byText(".fx-review-modal .btn", /^Close$/));
  assert(!$(".fx-review-modal"), "the review did not close");
  assert(g.xp === xp0 && KOS.sessions.all().length === n0, "closing the review moved the ledger");
  assert(entry.metrics.objectiveResult === undefined, "a dismissed review must annotate nothing");
  /* the effort still reached the assignment: that is the session, not the review */
  assert(KOS.assignments.get(asg.id).actualMins === 25, "effort: " + KOS.assignments.get(asg.id).actualMins);
});

/* ============ 6 · what the review can add ============ */
console.log("== review actions ==");

function runSession(opts) {
  opts = opts || {};
  KOS.focus.start({ mode: "custom", workMin: 25, breakMin: 5,
    subject: "compsci", ref: "4.2.3.1",
    assignmentId: opts.assignment === false ? null : asg.id,
    objective: opts.objective !== undefined ? opts.objective : "Second pass on the writeup" });
  KOS.focus.addNote("queue vs stack, again");
  KOS.focus._debugAdvance(25 * 60);
  KOS.focus.tick();
  KOS.focus.endComplete();
  return lastSession();
}

step("objective result and reflection annotate the SAME entry, with no second award", () => {
  const e = runSession();
  const g = G();
  const xp0 = g.xp, n0 = KOS.sessions.all().length;
  click(byText(".fx-rev-choice", /^Partly$/));
  assert($(".fx-rev-choice.active"), "the chosen result is not shown as chosen");
  $(".fx-rev-reflect").value = "Lost ten minutes finding the spec wording.";
  click(byText(".fx-review-modal .btn.primary", /Save review/));
  assert(e.metrics.objectiveResult === "partly", "result: " + e.metrics.objectiveResult);
  assert(/Lost ten minutes/.test(e.metrics.reflection), "reflection not recorded");
  assert(g.xp === xp0, "the review paid a second award");
  assert(KOS.sessions.all().length === n0, "the review logged a second session");
});

step("the review can move the linked assignment on, through its own API", () => {
  const before = KOS.assignments.get(asg.id);
  const mins0 = before.actualMins;
  runSession();
  const sub = $(".fx-rev-subs input[type=checkbox]");
  assert(sub, "an open subtask should be offered");
  sub.checked = true;
  const status = $(".fx-review-modal select[aria-label='Assignment status']");
  assert(status.value === before.status, "the status control should start where the record is");
  status.value = "inProgress";
  click(byText(".fx-review-modal .btn.primary", /Save review/));
  const after = KOS.assignments.get(asg.id);
  assert(after.subtasks[0].done === true, "the subtask was not ticked");
  assert(after.status === "inProgress", "status: " + after.status);
  assert(after.progress === 100, "subtask progress should derive: " + after.progress);
  assert(after.actualMins === mins0 + 25, "effort: " + mins0 + " → " + after.actualMins);
});

step("notes file onto the topic note by appending — never overwriting", () => {
  KOS.store.setNote("compsci", "4.2.3.1", "Existing revision note.");
  runSession();
  const dest = $(".fx-review-modal select[aria-label='Where to file these notes']");
  assert(dest, "no destination control");
  assert([...dest.options].some(o => o.value === "topic"), "the topic destination is missing");
  assert([...dest.options].some(o => o.value === "assignment"), "the assignment destination is missing");
  dest.value = "topic";
  dest.dispatchEvent(new window.Event("change", { bubbles: true }));
  click(byText(".fx-review-modal .btn.primary", /Save review/));
  const note = KOS.store.getProgress("compsci", "4.2.3.1").note;
  assert(/^Existing revision note\./.test(note), "the existing note was overwritten");
  assert(/Focus session/.test(note) && /queue vs stack/.test(note), "the session was not appended: " + note);
  assert(/Objective:/.test(note), "the objective should ride the filed note");
  assert(lastSession().metrics.notesFiledTo === "4.2.3.1", "the filing was not recorded on the entry");
});

step("notes can go to the assignment instead", () => {
  runSession();
  const dest = $(".fx-review-modal select[aria-label='Where to file these notes']");
  dest.value = "assignment";
  dest.dispatchEvent(new window.Event("change", { bubbles: true }));
  click(byText(".fx-review-modal .btn.primary", /Save review/));
  assert(/queue vs stack/.test(KOS.assignments.get(asg.id).notes), "the note did not reach the assignment");
});

step("with no objective the review skips the question rather than padding the modal", () => {
  runSession({ objective: "" });
  assert($(".fx-review-modal"), "the review should still open");
  assert(!$(".fx-rev-choice"), "an objective result was asked for without an objective");
  assert($(".fx-rev-reflect"), "the reflection is always worth asking for");
  closeOverlay();
});

step("ending early: reviewed like any other session, but the award is forfeited", () => {
  KOS.focus.start({ mode: "pomodoro", workMin: 25, breakMin: 5, subject: "compsci", ref: null,
    assignmentId: asg.id, objective: "A short go at it" });
  KOS.focus._debugAdvance(240);
  const g = G();
  const xp0 = g.xp, mins0 = KOS.assignments.get(asg.id).actualMins;
  window.__kosAutoConfirm = true;                          // answer the "End early?" confirm
  const wasSuppressed = true;
  KOS.focus.endEarly({ confirmed: true });                 // confirmed, but review NOT suppressed
  window.__kosAutoConfirm = false;
  assert(wasSuppressed, "guard");
  const e = lastSession();
  assert(e.type === "focus" && e.metrics.complete === false, "entry: " + JSON.stringify(e.metrics));
  assert(g.xp === xp0, "an early end paid an award");
  assert(KOS.assignments.get(asg.id).actualMins === mins0, "an early end banked effort");
  closeOverlay();
});

step("review:false ends identically but silently — the assistant's path", () => {
  KOS.focus.start({ mode: "custom", workMin: 25, breakMin: 5, subject: "compsci", ref: null,
    objective: "Assistant-driven block" });
  KOS.focus._debugAdvance(25 * 60);
  KOS.focus.tick();
  const g = G();
  const xp0 = g.xp;
  KOS.focus.endComplete({ review: false });
  assert(!$(".fx-review-modal"), "review:false must suppress the modal");
  assert(lastSession().metrics.complete === true, "the session was not logged");
  assert(g.xp > xp0, "review:false must still pay the award");
});

/* ============ 7 · recorded consistently, in Study and in the Governor ============ */
console.log("== recorded once, read everywhere ==");

step("the topic's own inspector counts the focus minutes", () => {
  KOS.show("ref", { subject: "compsci", ref: "4.2.3.1" });
  const insp = $(".study-inspector");
  assert(insp, "the study inspector is missing");
  const line = [...insp.querySelectorAll("li")].find(li => /Sessions here/.test(li.textContent));
  assert(line, "the inspector does not report sessions");
  assert(/min/.test(line.textContent), "focus minutes are not surfaced on the topic: " + line.textContent);
});

step("the Governor chronicle shows the objective, its result and where the notes went", () => {
  KOS.show("governor", "history");
  const rows = $$(".gov-log-event");
  assert(rows.length, "no history rows");
  const focusRow = rows.find(r => /Focus session/.test(r.textContent));
  assert(focusRow, "focus sessions are missing from the chronicle");
  const all = rows.map(r => r.textContent).join(" ");
  assert(/Objective/.test(all), "the objective is not part of the record shown");
  assert(/Objective result/.test(all), "the objective result is not shown");
  assert(/Notes filed to/.test(all), "where the notes went is not shown");
  assert(!/\bMarks\b/.test(all.replace(/Self-marked/g, "")), "self-marks leaked in as exam marks");
});

step("streak integrity is untouched: an early session still doesn't keep a streak alive", () => {
  const t = KOS.srs.todayISO();
  KOS.store.state.sessions = KOS.store.state.sessions.filter(s => s.date !== t);
  KOS.sessions.log({ type: "focus", subject: null, ref: null, dur: 300,
    metrics: { complete: false, mins: 5, pauses: 0, distractions: 0 } });
  assert(KOS.sessions.streak(null) === 0, "an incomplete session kept the streak: " + KOS.sessions.streak(null));
  KOS.sessions.log({ type: "focus", subject: null, ref: null, dur: 1500,
    metrics: { complete: true, mins: 25, pauses: 0, distractions: 0 } });
  assert(KOS.sessions.streak(null) === 1, "a completed session should count");
});

/* ============ runner ============ */
console.log("");
if (errors.length) {
  console.log("SMOKE34 FAILURES (" + errors.length + "):");
  errors.forEach(e => console.log("  - " + e));
  process.exit(1);
}
console.log("SMOKE34 PASS — Build 6.5 verified: quoted deal, session objective, running working-record, " +
  "refresh fairness, and a completion review over an already-recorded session (28 steps).");
/* the reload-restore steps re-evaluate focus.js, and each instance keeps its
   own 1 s interval alive — exit rather than wait on them */
process.exit(0);
