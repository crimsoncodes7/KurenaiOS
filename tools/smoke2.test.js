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
window.confirm = () => true;

const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
for (const src of scripts) {
  try { window.eval(fs.readFileSync(path.join(ROOT, src), "utf8")); }
  catch (e) { errors.push(`LOAD FAIL ${src}: ${e.message}`); }
}
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
  KOS.show("subject", "compsci");
  const grp = $$("#tree .grp-h").find(g => g.textContent.includes("4.9.4"));
  // open 4.9 section first
  const sec = $$("#tree .sec-head").find(h => h.textContent.includes("4.9"));
  click(sec);
  const grp2 = $$("#tree .grp-h").find(g => g.textContent.includes("4.9.4 ·"));
  if (!grp2) throw new Error("TCP/IP group header missing");
  const kids = grp2.nextElementSibling;
  if (!kids.querySelector(".leaf")) throw new Error("group has no nested leaves");
  click(grp2); // collapse
  if (kids.style.display !== "none") throw new Error("group didn't collapse");
  click(grp2);
});
step("deep-content badge shows on enriched leaves", () => {
  const sec = $$("#tree .sec-head").find(h => h.textContent.startsWith("4.2"));
  click(sec);
  const leaf = $$("#tree .leaf").find(l => l.textContent.includes("4.2.3.1"));
  if (!leaf.querySelector(".deep")) throw new Error("no ◆ badge on stacks leaf");
});

console.log("== study page tabs ==");
step("enriched ref defaults to Notes tab with rendered blocks", () => {
  KOS.show("ref", { subject: "compsci", ref: "4.2.3.1" });
  const tabs = $$(".study-tab").map(t => t.textContent);
  if (tabs.length < 6) throw new Error("tabs: " + tabs.join(","));
  if (!$(".notes-article")) throw new Error("notes article not rendered");
  // notes may be paginated; gather block-type presence across every page
  let sawTable = false, sawMnemonic = false, sawCode = false;
  const scan = () => {
    if ($(".n-table")) sawTable = true;
    if ($(".n-call-mnemonic")) sawMnemonic = true;
    if ($(".n-code .k")) sawCode = true;
  };
  scan();
  $$(".note-page-tab").forEach(t => { click(t); scan(); });
  if (!sawTable) throw new Error("comparison table missing");
  if (!sawMnemonic) throw new Error("mnemonic callout missing");
  if (!sawCode) throw new Error("code highlighting missing");
});
step("spec tab still shows split + personal notes", () => {
  click($$(".study-tab").find(t => t.dataset.tab === "spec"));
  if (!$(".speccontent")) throw new Error("spec content missing");
  if (!$(".note-area")) throw new Error("personal note area missing");
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
    const pager = $(".note-pager");
    if (!pager) throw new Error("note-pager not rendered");
    const tabs = $$(".note-page-tab");
    if (tabs.length !== 3) throw new Error("expected 3 page tabs, got " + tabs.length);
    if (!$(".notes-article")) throw new Error("article missing");
    click(tabs[2]); // jump to "Exam technique"
    if (!tabs[2].classList.contains("active")) throw new Error("page tab did not activate");
  } finally { window.KOS_CONTENT[KEY] = orig; }
});
step("plain ref (no content) shows spec only", () => {
  // F200.1.1 is a leaf with no deep KOS_CONTENT entry (the old fixture
  // it:F201.2.1 was later enriched by Gemini, so it now has study tabs).
  KOS.show("ref", { subject: "it", ref: "F200.1.1" });
  if ($$(".study-tab").length !== 1) throw new Error("unexpected tabs on plain ref");
  if (!$(".speccontent")) throw new Error("spec missing");
});

console.log("== flashcards engine ==");
step("flip + rate-through completes a session", () => {
  KOS.show("ref", { subject: "maths", ref: "S5.2" });
  click($$(".study-tab").find(t => t.dataset.tab === "cards"));
  const card = $(".fc-card");
  if (!card) throw new Error("no card");
  const total = $$(".fc-pip").length;
  for (let i = 0; i < total; i++) {
    click($(".fc-card"));                       // flip
    click($$(".fc-rate .btn")[1]);              // knew it
  }
  if (!$(".fc-front").textContent.includes("Session complete")) throw new Error("session didn't finish");
  const st = KOS.flashcards.stats("maths", "S5.2");
  if (st.right < total) throw new Error("stats not recorded");
});

console.log("== quiz engine ==");
step("MCQ instant feedback + scoring", () => {
  KOS.show("ref", { subject: "compsci", ref: "4.2.2.1" });
  click($$(".study-tab").find(t => t.dataset.tab === "quiz"));
  const cards = $$(".qz-card");
  if (cards.length < 4) throw new Error("quiz too small");
  cards.forEach(c => click(c.querySelectorAll(".qz-opt")[0])); // answer everything with option A
  if (!$(".qz-result") || $(".qz-result").style.display === "none") throw new Error("no result");
  if (!$$(".qz-why").length) throw new Error("no explanations");
  const st = KOS.quiz.stats("compsci", "4.2.2.1");
  if (st.attempts < 1) throw new Error("attempt not logged");
});
step("exam Q reveals mark scheme", () => {
  click($$(".study-tab").find(t => t.dataset.tab === "exam"));
  click($$(".btn.primary").find(b => b.textContent.includes("Reveal")));
  if (!$(".qz-ms").textContent.includes("Mark scheme")) throw new Error("mark scheme hidden");
});

console.log("== worked engine ==");
step("category pills separate CS from maths", () => {
  KOS.show("worked");
  const pills = $$(".cat-pill").map(p => p.textContent);
  if (!pills.includes("Computer Science") || !pills.includes("Pure Maths")) throw new Error(pills.join(","));
  click($$(".cat-pill").find(p => p.textContent === "Computer Science"));
  const tabs = $$(".lab-tab").map(t => t.textContent).join(" ");
  if (/Quadratic|suvat/.test(tabs)) throw new Error("maths leaked into CS tab: " + tabs);
  if (!/binary|two's|Floating/i.test(tabs)) throw new Error("CS gens missing: " + tabs);
});
step("worked tab embeds generator on ref page", () => {
  KOS.show("ref", { subject: "maths", ref: "2.3" });
  click($$(".study-tab").find(t => t.dataset.tab === "worked"));
  if (!$(".answerline")) throw new Error("embedded generator produced no answer");
});

console.log("== simulations ==");
step("logic lab parses and builds truth table", () => {
  KOS.show("sims", "logic-lab");
  if (!$(".logic-tt")) throw new Error("truth table missing");
  const rows = $$(".logic-tt tbody tr").length;
  if (rows !== 8) throw new Error("A.B+¬C should give 8 rows, got " + rows);
  click($$(".logic-sw")[0]); // toggle A
  if (!$(".logic-tt tr.live")) throw new Error("live row not highlighted");
});
step("fsm lab steps and accepts", () => {
  KOS.show("sims", "fsm-lab");
  const stepBtn = $$(".btn").find(b => b.textContent === "Step");
  const input = $(".lab-controls input");
  input.value = "11";
  input.dispatchEvent(new window.Event("input", { bubbles: true }));
  click(stepBtn); click(stepBtn);
  const v = $$(".sim-msg").map(m => m.textContent).join(" ");
  if (!v.includes("ACCEPTED")) throw new Error("even-1s machine should accept '11': " + v);
});
step("fn-transform mounts with equation readout", () => {
  KOS.show("sims", "fn-transform");
  if (!$(".fn-eq").textContent.includes("f(")) throw new Error("equation missing");
  if (!$(".fn-desc")) throw new Error("description missing");
});
step("sim deep-link from notes (Simulate tab)", () => {
  KOS.show("ref", { subject: "compsci", ref: "4.6.2.1" });
  const simTab = $$(".study-tab").find(t => t.dataset.tab === "sim");
  if (!simTab) throw new Error("no Simulate tab on Boolean");
  click(simTab);
  if (!$(".logic-tt") && !$(".logic-switches")) throw new Error("logic lab not embedded");
});

console.log("== home & dashboards ==");
step("home renders rings, coverage and resume", () => {
  KOS.show("home");
  if (!$(".home-ring canvas")) throw new Error("no overall ring");
  if ($$(".subj-card").length < 6) throw new Error("subject+lab cards missing");
  if (!$$(".subj-card").some(c => c.textContent.includes("deep-content"))) throw new Error("coverage stat missing");
});
step("subject dash shows deep-content stat", () => {
  KOS.show("subject", "maths");
  const strip = $(".stat-strip").textContent;
  if (!strip.includes("Deep-content")) throw new Error("stat missing");
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
  else console.log("ALL SMOKE TESTS PASSED");
}, 600);
