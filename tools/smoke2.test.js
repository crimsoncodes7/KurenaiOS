const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const errors = [];
const dom = new JSDOM(html, { url: "http://localhost/index.html", runScripts: "outside-only", pretendToBeVisual: true });
const { window } = dom;
const { document } = window;
window.addEventListener("error", e => errors.push("window error: " + e.message));
const noop = () => {};
const ctxStub = new Proxy({}, { get: (t, k) => k === "measureText" ? () => ({ width: 10 }) : (typeof k === "string" ? noop : undefined), set: () => true });
window.HTMLCanvasElement.prototype.getContext = () => ctxStub;
window.requestAnimationFrame = cb => setTimeout(cb, 0);
window.cancelAnimationFrame = clearTimeout;
window.confirm = () => true; window.__kosAutoConfirm = true;

const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
for (const src of scripts) {
  try { window.eval(fs.readFileSync(path.join(ROOT, src), "utf8")); }
  catch (e) { errors.push(`LOAD FAIL ${src}: ${e.message}`); }
}
// Build 2a: labs/sims are gold-gated behind the Behavioural Governor on a
// fresh store — own the whole catalog so the sim/lab steps run unobstructed.
window.eval("KOS.governor.debugUnlockAll()");

function step(name, fn) {
  try { fn(); console.log("  ok  " + name); }
  catch (e) { errors.push(`STEP "${name}": ${e.stack.split("\n").slice(0, 2).join(" | ")}`); console.log("FAIL  " + name); }
}
const KOS = window.KOS;
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const click = n => n.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));

console.log("== boot & content registry ==");
step("KOS + content registry", () => {
  if (!KOS.content) throw new Error("no content api");
  const n = Object.keys(window.KOS_CONTENT).length;
  if (n < 45) throw new Error("only " + n + " deep entries");
  console.log("       deep entries: " + n);
});
step("every entry well-formed", () => {
  for (const [k, v] of Object.entries(window.KOS_CONTENT)) {
    if (!v.notes || !v.notes.length) throw new Error(k + " has no notes");
    (v.quiz || []).forEach((q, i) => {
      if (q.ans === undefined || !q.opts || q.ans >= q.opts.length) throw new Error(k + " quiz " + i + " bad ans");
    });
    (v.flashcards || []).forEach((c, i) => { if (c.length !== 2) throw new Error(k + " card " + i); });
    (v.gens || []).forEach(g => { if (!KOS.worked.byIds([g]).length) throw new Error(k + " missing gen " + g); });
    (v.sims || []).forEach(s => { if (!KOS.sims.get(s)) throw new Error(k + " missing sim " + s); });
  }
});
step("every entry's ref exists in spec data", () => {
  for (const k of Object.keys(window.KOS_CONTENT)) {
    const [sid, ref] = k.split(":");
    if (!KOS.hub.BYREF[sid][ref]) throw new Error("orphan content key: " + k);
  }
});

console.log("== tree structure ==");
step("4.9.4 leaves nested under collapsible group", () => {
  /* Graphite (frame 8a): the spine is the topic page's; the desk has none */
  KOS.show("ref", { subject: "compsci", ref: "4.2.3.1" });
  const grp = $$("#tree [data-ui~='study.spine-group']").find(g => g.textContent.includes("4.9.4"));
  // open 4.9 section first
  const sec = $$("#tree [data-ui~='ui.section-head']").find(h => h.textContent.includes("4.9"));
  click(sec);
  const grp2 = $$("#tree [data-ui~='study.spine-group']").find(g => g.textContent.includes("4.9.4 ·"));
  if (!grp2) throw new Error("TCP/IP group header missing");
  const kids = grp2.nextElementSibling;
  if (!kids.querySelector("[data-ui~='study.spine-leaf']")) throw new Error("group has no nested leaves");
  click(grp2); // collapse
  if (!kids.hidden) throw new Error("group didn't collapse");
  click(grp2);
});
step("deep-content badge shows on enriched leaves", () => {
  const sec = $$("#tree [data-ui~='ui.section-head']").find(h => h.textContent.startsWith("4.2"));
  click(sec);
  const leaf = $$("#tree [data-ui~='study.spine-leaf']").find(l => l.textContent.includes("4.2.3.1"));
  if (!leaf.querySelector("[data-ui~='study.spine-deep']")) throw new Error("no ◆ badge on stacks leaf");
});

console.log("== study page tabs ==");
step("enriched ref defaults to Notes tab with rendered blocks", () => {
  KOS.show("ref", { subject: "compsci", ref: "4.2.3.1" });
  const tabs = $$("[data-ui~='ui.tab']").map(t => t.textContent);
  if (tabs.length < 6) throw new Error("tabs: " + tabs.join(","));
  if (!$("[data-ui~='topic.notes']")) throw new Error("notes article not rendered");
  // notes may be paginated; gather block-type presence across every page
  let sawTable = false, sawMnemonic = false, sawCode = false;
  const scan = () => {
    if ($("[data-ui~='content.table']")) sawTable = true;
    if ($("[data-ui~='content.callout'][data-kind='mnemonic']")) sawMnemonic = true;
    if ($("[data-ui~='content.code'] [data-ui~='part.label']")) sawCode = true;
  };
  scan();
  const pagePicker = $("[data-ui~='topic.reader-page-select']");
  if (!pagePicker) throw new Error("note page picker missing");
  [...pagePicker.options].forEach((_, i) => {
    pagePicker.value = String(i);
    pagePicker.dispatchEvent(new window.Event("change", { bubbles: true }));
    scan();
  });
  if (!sawTable) throw new Error("comparison table missing");
  if (!sawMnemonic) throw new Error("mnemonic callout missing");
  if (!sawCode) throw new Error("code highlighting missing");
});
step("spec tab still shows split + personal notes", () => {
  click($$("[data-ui~='ui.tab']").find(t => t.dataset.tab === "spec"));
  if (!$("[data-ui~='topic.spec']")) throw new Error("spec content missing");
  if (!$("[data-ui~='ui.note-area']")) throw new Error("personal note area missing");
});
step("notes pager: splitPages + sectioned rendering", () => {
  // pure function: no markers -> 1 page; markers -> N named pages
  const flat = KOS.content.splitPages(["a", { h: "x" }]);
  if (flat.length !== 1 || flat[0].title !== "Overview") throw new Error("flat split wrong");
  const paged = KOS.content.splitPages(["intro", { page: "Detail" }, "d1", { page: "Exam" }, "e1"]);
  if (paged.length !== 3) throw new Error("expected 3 pages, got " + paged.length);
  if (paged[0].title !== "Overview" || paged[1].title !== "Detail" || paged[2].title !== "Exam")
    throw new Error("page titles wrong: " + paged.map(p => p.title));
  // hub rendering: inject a paged entry, render, assert pager appears, then restore
  const KEY = "compsci:4.2.3.1", orig = window.KOS_CONTENT[KEY];
  window.KOS_CONTENT[KEY] = Object.assign({}, orig, {
    notes: ["lead", { page: "Types" }, { h: "Types" }, "t", { page: "Exam technique" }, "ex"]
  });
  try {
    KOS.show("ref", { subject: "compsci", ref: "4.2.3.1" });
    const pager = $("[data-ui~='topic.pager']"), picker = $("[data-ui~='topic.reader-page-select']");
    if (!pager || !picker) throw new Error("note page reader not rendered");
    if (picker.options.length !== 3) throw new Error("expected 3 named pages, got " + picker.options.length);
    if (!$("[data-ui~='topic.notes']")) throw new Error("article missing");
    picker.value = "2"; // jump to "Exam technique"
    picker.dispatchEvent(new window.Event("change", { bubbles: true }));
    if (picker.value !== "2") throw new Error("page picker did not activate the chosen page");
  } finally { window.KOS_CONTENT[KEY] = orig; }
});
step("plain ref (no content) shows the five editable tabs + files, no worked/sim", () => {
  // F200.1.1 is a leaf with no deep KOS_CONTENT entry. Since the study
  // editor every topic carries the five editable kinds (an empty tab is
  // where you add material), plus Files; worked examples and simulations
  // appear only when something is wired to the ref.
  KOS.show("ref", { subject: "it", ref: "F200.1.1" });
  const tabs = $$("[data-ui~='ui.tab']").map(t => t.dataset.tab);
  if (tabs.join(",") !== "spec,notes,cards,quiz,exam,files")
    throw new Error("unexpected tabs on plain ref: " + tabs.join(","));
  if (!$("[data-ui~='topic.spec']")) throw new Error("spec missing");
  if ($$("[data-ui~='ui.tab'] [data-ui~='ui.tab-count']").length) throw new Error("an empty tab printed a zero count");
  click($$("[data-ui~='ui.tab']").find(t => t.dataset.tab === "notes"));
  if (!$("[data-ui~='ui.empty']")) throw new Error("an empty Notes tab did not offer the editor");
});

console.log("== flashcards engine ==");
step("flip + rate-through completes a session", () => {
  KOS.show("ref", { subject: "maths", ref: "S5.2" });
  click($$("[data-ui~='ui.tab']").find(t => t.dataset.tab === "cards"));
  const card = $("[data-ui~='fc.card']");
  if (!card) throw new Error("no card");
  const total = $$("[data-ui~='fc.pip']").length;
  for (let i = 0; i < total; i++) {
    click($("[data-ui~='fc.card']"));                       // flip
    click($$("[data-ui~='fc.rate'] button")[1]);              // knew it
  }
  if (!$("[data-ui~='fc.front']").textContent.includes("Session complete")) throw new Error("session didn't finish");
  const st = KOS.flashcards.stats("maths", "S5.2");
  if (st.right < total) throw new Error("stats not recorded");
});

console.log("== quiz engine ==");
step("MCQ instant feedback + scoring", () => {
  KOS.show("ref", { subject: "compsci", ref: "4.2.2.1" });
  click($$("[data-ui~='ui.tab']").find(t => t.dataset.tab === "quiz"));
  const cards = $$("[data-ui~='quiz.card']");
  if (cards.length < 4) throw new Error("quiz too small");
  cards.forEach(c => click(c.querySelectorAll("[data-ui~='quiz.option']")[0])); // answer everything with option A
  if (!$("[data-ui~='quiz.result']") || $("[data-ui~='quiz.result']").style.display === "none") throw new Error("no result");
  if (!$$("[data-ui~='quiz.why']").length) throw new Error("no explanations");
  const st = KOS.quiz.stats("compsci", "4.2.2.1");
  if (st.attempts < 1) throw new Error("attempt not logged");
});
step("exam Q reveals mark scheme", () => {
  click($$("[data-ui~='ui.tab']").find(t => t.dataset.tab === "exam"));
  click($$("button[data-intent~='primary']").find(b => b.textContent.includes("Reveal")));
  if (!$("[data-ui~='quiz.ms']").textContent.includes("Mark scheme")) throw new Error("mark scheme hidden");
});

console.log("== worked engine ==");
step("category pills separate CS from maths", () => {
  KOS.show("worked");
  const pills = $$("[data-ui~='lab.category']").map(p => p.textContent);
  if (!pills.includes("Computer Science") || !pills.includes("Pure Maths")) throw new Error(pills.join(","));
  click($$("[data-ui~='lab.category']").find(p => p.textContent === "Computer Science"));
  const tabs = $$("[data-ui~='lab.tab']").map(t => t.textContent).join(" ");
  if (/Quadratic|suvat/.test(tabs)) throw new Error("maths leaked into CS tab: " + tabs);
  if (!/binary|two's|Floating/i.test(tabs)) throw new Error("CS gens missing: " + tabs);
});
step("worked tab embeds generator on ref page", () => {
  KOS.show("ref", { subject: "maths", ref: "2.3" });
  click($$("[data-ui~='ui.tab']").find(t => t.dataset.tab === "worked"));
  if (!$("[data-ui~='lab.answer-line']")) throw new Error("embedded generator produced no answer");
});

console.log("== simulations ==");
step("logic lab parses and builds truth table", () => {
  KOS.show("sims", "logic-lab");
  if (!$("[data-ui~='lab.truth-table']")) throw new Error("truth table missing");
  const rows = $$("[data-ui~='lab.truth-table'] tbody tr").length;
  if (rows !== 8) throw new Error("A.B+¬C should give 8 rows, got " + rows);
  click($$("[data-ui~='lab.logic-switch']")[0]); // toggle A
  if (!$("[data-ui~='lab.truth-table'] tr[data-state~='live']")) throw new Error("live row not highlighted");
});
step("fsm lab steps and accepts", () => {
  KOS.show("sims", "fsm-lab");
  const stepBtn = $$("button").find(b => b.textContent === "Step");
  const input = $("[data-ui~='lab.controls'] input");
  input.value = "11";
  input.dispatchEvent(new window.Event("input", { bubbles: true }));
  click(stepBtn); click(stepBtn);
  const v = $$("[data-ui~='lab.message']").map(m => m.textContent).join(" ");
  if (!v.includes("ACCEPTED")) throw new Error("even-1s machine should accept '11': " + v);
});
step("fn-transform mounts with equation readout", () => {
  KOS.show("sims", "fn-transform");
  if (!$("[data-ui~='lab.fn-eq']").textContent.includes("f(")) throw new Error("equation missing");
  if (!$("[data-ui~='lab.fn-desc']")) throw new Error("description missing");
});
step("sim deep-link from notes (Simulate tab)", () => {
  KOS.show("ref", { subject: "compsci", ref: "4.6.2.1" });
  const simTab = $$("[data-ui~='ui.tab']").find(t => t.dataset.tab === "sim");
  if (!simTab) throw new Error("no Simulate tab on Boolean");
  click(simTab);
  if (!$("[data-ui~='lab.truth-table']") && !$("[data-ui~='lab.logic-switches']")) throw new Error("logic lab not embedded");
});

console.log("== home & dashboards ==");
step("home renders its decision surface, cards, coverage and resume", () => {
  KOS.show("home");
  /* Cat 7 Phase C: the "N% COVERED" hero ring is retired — it was the front
     page's largest element and it read 0% for an active account (audit
     HOME-1). Coverage kept its place on the subject cards below. */
  if (!$("[data-ui~='home.next'] [data-ui~='home.next-label']")) throw new Error("no next-action statement");
  if (!$("[data-ui~='home.next'] button[data-intent~='primary']")) throw new Error("the next action has no button");
  /* 3 subject cards + the Collection desk card */
  if ($$("[data-ui~='home.desk']").length < 4) throw new Error("subject+collection cards missing");
  if (!$("[data-ui~='home.collection-desk']")) throw new Error("Collection Matrix home card missing");
  /* Graphite (frame 7a): a desk reports completion as its ring and its
     "Topics done / total" row; deep-content coverage lives on the subject
     desk's analytics, not the front page */
  if (!$$("[data-ui~='home.desk'][data-sid]").every(c => /Topics\s*\d+ \/ \d+/.test(c.textContent))) throw new Error("topic completion missing from a desk");
});
step("subject dash keeps deep-content coverage in the analytics panel", () => {
  KOS.show("subject", "maths");
  const panel = $("[data-ui~='study.analytics']");
  if (!panel) throw new Error("analytics panel missing");
  if (!panel.querySelector("[data-ui~='study.analytics-foot']").textContent.includes("Deep revision content"))
    throw new Error("deep-content coverage dropped");
});

console.log("== persistence ==");
window.eval("KOS.store.save()");
setTimeout(() => {
  try {
    const st = JSON.parse(window.localStorage.getItem("kurenai-os-v1"));
    if (!st.study || !st.study.fc["maths:S5.2"]) errors.push("flashcard stats not persisted");
    if (!st.study.quiz["compsci:4.2.2.1"]) errors.push("quiz stats not persisted");
    console.log("  ok  study stats persisted (" + (JSON.stringify(st).length / 1024).toFixed(1) + " KB state)");
  } catch (e) { errors.push("persist: " + e.message); }
  console.log("\n==============================");
  if (errors.length) { console.log("FAILURES (" + errors.length + "):"); errors.forEach(e => console.log(" • " + e)); process.exit(1); }
  // explicit exit: the app keeps a 30-min reminder interval alive (Build 2a),
  // so the event loop never drains on its own any more
  else { console.log("ALL SMOKE TESTS PASSED"); process.exit(0); }
}, 600);
