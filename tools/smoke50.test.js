/* Kurenai OS — smoke50.test.js
   The past-paper question banks and the labs expansion.

     A · the banks — every bank file loads, KOS.content.extend concatenates
         rather than replaces, every bank key targets a visible leaf, exam
         items carry the extended schema (src / level / parts) and each
         maths and CS leaf is materially larger than the base content alone
     B · the exam engine renders multi-part items with a provenance line,
         tariff filter chips and ONE self-mark log per item
     C · the labs — every registered sim mounts inline in jsdom, every
         worked generator solves its defaults and its randomised inputs
         without NaN, generators/sims are reachable from their topic pages,
         the Simulations view is a searchable grid, and the lab palette is
         theme-derived rather than fixed dark ink
     D · the study nav is static, not sticky (it covered the text)

   Run: node tools/smoke50.test.js                                        */
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
window.cancelAnimationFrame = clearTimeout;
window.confirm = () => true;
window.__kosAutoConfirm = true;
const { indexedDB, IDBKeyRange } = require("fake-indexeddb");
window.indexedDB = indexedDB;
window.IDBKeyRange = IDBKeyRange;
window.fetch = () => Promise.reject(new Error("network disabled in smoke50"));
window.matchMedia = q => ({ matches: false, media: q, addListener: noop, removeListener: noop, addEventListener: noop, removeEventListener: noop });

/* base content sizes BEFORE the banks extend them: load scripts in order and
   snapshot KOS_CONTENT the moment the first bank file is about to run */
let baseSizes = null;
for (const match of html.matchAll(/<script src="([^"]+)"><\/script>/g)) {
  if (!baseSizes && /bank-/.test(match[1])) {
    baseSizes = {};
    for (const k of Object.keys(window.KOS_CONTENT)) {
      const c = window.KOS_CONTENT[k];
      baseSizes[k] = { fc: (c.flashcards || []).length, quiz: (c.quiz || []).length, exam: (c.exam || []).length };
    }
  }
  try { window.eval(fs.readFileSync(path.join(ROOT, match[1]), "utf8")); }
  catch (e) { errors.push("LOAD FAIL " + match[1] + ": " + e.message); }
}
const KOS = window.KOS;
if (KOS.autosync) KOS.autosync.stop();
const C = window.KOS_CONTENT;
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const click = n => n.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
const steps = [];
const step = (n, f) => steps.push([n, f]);
function assert(ok, message) { if (!ok) throw new Error(message); }
const BANKS = [...html.matchAll(/js\/data\/content\/(bank-[^"]+\.js)/g)].map(m => m[1]);

/* ==================== A · the banks ==================== */
console.log("== A · the banks ==");

step("every bank file is registered after the base content and loads clean", () => {
  assert(BANKS.length >= 17, "expected the CS and maths bank files, found " + BANKS.length);
  assert(!errors.some(e => /LOAD FAIL.*bank-/.test(e)), errors.filter(e => /bank-/.test(e)).join("; "));
  const idx = s => html.indexOf(s);
  assert(idx("bank-cs-41.js") > idx("cs-p1-42d.js") && idx("cs-p1-42d.js") > 0, "a bank loads before the base content it extends");
  assert(idx("bank-maths-stats.js") > idx("maths-stats-s5.js"), "the stats bank loads after the Statistics notes");
  assert(idx("bank-maths-mech.js") > idx("maths-mech-m9.js"), "the mechanics bank loads after the Mechanics notes");
});

step("KOS.content.extend concatenates and never replaces", () => {
  assert(typeof KOS.content.extend === "function", "KOS.content.extend is missing");
  window.KOS_CONTENT["compsci:__smoke50"] = { notes: ["a"], flashcards: [["q", "a"]], quiz: [{ q: "q", opts: ["a", "b"], ans: 0 }], exam: [{ q: "e", marks: 1, ms: ["m"] }], sims: ["logic-lab"] };
  KOS.content.extend("compsci:__smoke50", { notes: ["b"], flashcards: [["q2", "a2"]], quiz: [{ q: "q2", opts: ["a", "b"], ans: 1 }], exam: [{ q: "e2", marks: 2, ms: ["m"] }], sims: ["logic-lab", "sort-viz"] });
  const c = window.KOS_CONTENT["compsci:__smoke50"];
  assert(c.notes.length === 2 && c.flashcards.length === 2 && c.quiz.length === 2 && c.exam.length === 2, "extend replaced instead of appending");
  assert(c.sims.length === 2, "sims were not unioned: " + JSON.stringify(c.sims));
  delete window.KOS_CONTENT["compsci:__smoke50"];
});

step("every bank key targets a visible leaf and no IT content was touched", () => {
  const bankKeys = new Set();
  for (const f of BANKS) {
    const src = fs.readFileSync(path.join(ROOT, "js/data/content", f), "utf8");
    for (const m of src.matchAll(/X\("([a-z]+:[^"]+)"/g)) bankKeys.add(m[1]);
    assert(!/"it:/.test(src), f + " touches IT content");
  }
  assert(bankKeys.size >= 150, "too few bank keys: " + bankKeys.size);
  for (const k of bankKeys) {
    const sid = k.split(":")[0], ref = k.slice(sid.length + 1);
    assert(KOS.hub.BYREF[sid] && KOS.hub.BYREF[sid][ref], "bank key does not target a visible leaf: " + k);
  }
  assert([...bankKeys].every(k => !k.startsWith("it:")), "a bank key targets IT");
});

step("every enriched CS and maths leaf grew — flashcards, quiz and exam items", () => {
  let grew = 0, checked = 0;
  for (const k of Object.keys(baseSizes)) {
    if (!/^(compsci|maths):/.test(k)) continue;
    const c = C[k], b = baseSizes[k];
    checked++;
    assert((c.flashcards || []).length >= b.fc && (c.quiz || []).length >= b.quiz && (c.exam || []).length >= b.exam, "a bank shrank " + k);
    if ((c.exam || []).length > b.exam) grew++;
  }
  assert(checked >= 200 && grew >= 200, "only " + grew + " of " + checked + " leaves gained exam items");
});

step("exam items use the extended schema: provenance, AS level, lettered parts", () => {
  let withSrc = 0, withParts = 0, withLevel = 0, total = 0;
  for (const k of Object.keys(C)) {
    if (!/^(compsci|maths):/.test(k)) continue;
    for (const it of (C[k].exam || [])) {
      total++;
      if (it.src) withSrc++;
      if (it.level === "AS") withLevel++;
      if (it.parts) {
        withParts++;
        assert(Array.isArray(it.parts) && it.parts.length >= 1, "empty parts in " + k);
        it.parts.forEach(p => assert(typeof p.q === "string" && typeof p.marks === "number" && Array.isArray(p.ms) && p.ms.length, "malformed part in " + k));
      } else {
        assert(typeof it.q === "string" && typeof it.marks === "number" && Array.isArray(it.ms), "malformed exam item in " + k);
      }
    }
  }
  assert(total >= 1400, "expected ≥ 1400 exam items, found " + total);
  assert(withSrc >= 700, "too few items name the paper they are modelled on: " + withSrc);
  assert(withParts >= 300, "too few multi-part items: " + withParts);
  assert(withLevel >= 100, "AS-level items are not flagged: " + withLevel);
});

step("bank quiz items are well-formed (2–6 options, a valid answer index, a reason)", () => {
  for (const k of Object.keys(C)) {
    if (!/^(compsci|maths):/.test(k)) continue;
    (C[k].quiz || []).forEach((q, i) => {
      assert(Array.isArray(q.opts) && q.opts.length >= 2 && q.opts.length <= 6, "bad options " + k + " #" + i);
      assert(Number.isInteger(q.ans) && q.ans >= 0 && q.ans < q.opts.length, "bad answer index " + k + " #" + i);
    });
    (C[k].flashcards || []).forEach((f, i) => assert(Array.isArray(f) && f.length === 2 && f[0] && f[1], "bad flashcard " + k + " #" + i));
  }
});

/* ==================== B · the exam engine ==================== */
console.log("== B · the exam engine ==");

step("a multi-part item renders its stem, lettered parts, provenance and one self-mark log", () => {
  KOS.show("ref", { subject: "maths", ref: "S5.2" });
  const tab = $$("[data-ui~='topic.nav'] button, [data-ui~='topic.nav'] [data-ui~='part.tab'], [data-ui~='topic.nav'] [role=tab]").find(b => /Exam questions/.test(b.textContent));
  assert(tab, "no Exam questions tab on the topic page");
  click(tab);
  /* Graphite (frame 8f): one question at a time, "Question x of N" */
  const count = () => Number(($("[data-ui~='quiz.counter']").textContent.match(/of (\d+)/) || [])[1]);
  const items = count();
  assert(items >= 5, "the bank's exam items did not render: " + items);
  const seen = { src: false, part: false };
  for (let i = 0; i < items; i++) {
    if ($$("[data-ui~='quiz.src']").some(s => /modelled on Edexcel/.test(s.textContent))) seen.src = true;
    if ($$("[data-ui~='quiz.part-l']").some(l => /^\(a\)/.test(l.textContent.trim()))) seen.part = true;
    if (i < items - 1) click($("[data-ui~='quiz.next']"));
  }
  assert(seen.src, "no provenance line");
  assert(seen.part, "parts are not lettered");
  const chips = $$("[data-ui~='quiz.chip']");
  assert(chips.length >= 3, "no tariff filter chips");
  const before = KOS.store.state.sessions.length;
  const log = $$("[data-ui~='quiz.selfmark'] button, [data-ui~='quiz.exam-foot'] button").find(b => /Log self-mark/.test(b.textContent));
  assert(log, "no per-item self-mark control");
  click(log);
  assert(KOS.store.state.sessions.length === before + 1, "logging one item did not produce exactly one session");
});

step("the tariff chips filter the items shown", () => {
  const count = () => Number(($("[data-ui~='quiz.counter']").textContent.match(/of (\d+)/) || [])[1]);
  const all = count();
  const chip = $$("[data-ui~='quiz.chip']").find(c => /6\+/.test(c.textContent));
  assert(chip, "no 6+ marks chip");
  click(chip);
  const shown = count();
  assert(shown >= 1 && shown < all, "the 6+ filter did not narrow the list (" + shown + " of " + all + ")");
});

/* ==================== C · the labs ==================== */
console.log("== C · the labs ==");

step("every registered sim mounts inline without throwing", () => {
  const sims = KOS.sims.all().filter(s => s.mount);
  assert(sims.length >= 45, "expected ≥ 45 mountable sims, found " + sims.length);
  const failed = [];
  for (const s of sims) {
    const host = document.createElement("div");
    document.body.appendChild(host);
    try { s.mount(host); assert(host.childNodes.length, "mounted nothing"); }
    catch (e) { failed.push(s.id + ": " + e.message); }
    host.remove();
  }
  assert(!failed.length, failed.join(" | "));
});

step("the maths and CS sims are wired to their spec points", () => {
  for (const [sid, ref, id] of [["maths", "9.4", "trapezium-rule"], ["maths", "M7.5", "projectile-lab"], ["maths", "M9.1", "moments-beam"],
    ["compsci", "4.4.5.1", "turing-machine"], ["compsci", "4.9.4.4", "subnet-lab"], ["compsci", "4.5.6.10", "cipher-lab"]]) {
    assert(KOS.sims.forRef(sid, ref).some(s => s.id === id), id + " is not reachable from " + sid + ":" + ref);
  }
});

step("every worked generator solves its defaults and 40 random draws without NaN", () => {
  const gens = KOS.worked.all();
  assert(gens.length >= 40, "expected ≥ 40 generators, found " + gens.length);
  const bad = [];
  for (const g of gens) {
    const tries = [Object.fromEntries(g.inputs.map(i => [i.k, i.type === "number" ? parseFloat(i.def) : i.def]))];
    for (let i = 0; i < 40; i++) tries.push(g.random());
    let ran = 0;
    for (const v of tries) {
      const vals = Object.fromEntries(g.inputs.map(i => [i.k, i.type === "number" ? parseFloat(v[i.k]) : v[i.k]]));
      if (g.validate && g.validate(vals)) continue;
      try {
        const r = g.solve(vals); ran++;
        assert(r && r.steps.length && r.answer, "empty result");
        r.steps.forEach(s => assert(!/NaN|undefined/.test(s.m), "NaN in step '" + s.h + "'"));
        assert(!/NaN|undefined/.test(r.answer), "NaN in answer");
      } catch (e) { bad.push(g.id + ": " + e.message); break; }
    }
    if (!ran) bad.push(g.id + ": every input was rejected by validate()");
  }
  assert(!bad.length, bad.join(" | "));
});

step("new generators are wired to their topic pages and mount there", () => {
  for (const [sid, ref, id] of [["maths", "9.4", "trapezium"], ["maths", "S5.1", "pmcctest"], ["maths", "M8.6", "incline"], ["compsci", "4.3.3.1", "rpn"], ["compsci", "4.9.4.4", "subnet"]]) {
    assert(KOS.worked.forRef(sid, ref).some(g => g.id === id), id + " is not wired to " + sid + ":" + ref);
  }
  KOS.show("ref", { subject: "maths", ref: "9.4" });
  const tab = $$("[data-ui~='topic.nav'] button, [data-ui~='topic.nav'] [data-ui~='part.tab'], [data-ui~='topic.nav'] [role=tab]").find(b => /Worked/.test(b.textContent));
  assert(tab, "no Worked tab on 9.4");
  click(tab);
  assert($$("[data-ui~='part.step']").length >= 1, "the trapezium generator did not mount on its topic page");
});

step("the Simulations view groups labs by area, searches across them and deep-links an open lab (20h)", () => {
  KOS.store.state.ui.simSubj = "all"; KOS.store.state.ui.simArea = "all";
  KOS.show("sims");
  const all = $$("[data-ui~='lab.sim-card']").length;
  assert(all >= 30, "the grouped grid does not list the labs: " + all);
  assert($$("[data-ui~='lab.area-all']").length >= 1, "a large area does not offer Show all");
  const area = $$("[data-ui~='lab.area']").find(b => /Mechanics/.test(b.textContent));
  assert(area, "no area rail"); click(area);
  const n = $$("[data-ui~='lab.sim-card']").length;
  assert(n >= 3 && n < 10, "the Mechanics area did not narrow the grid: " + n);
  click($$("[data-ui~='lab.area']").find(b => b.getAttribute("data-area") === "all"));
  const maths = $$("[data-ui~='lab.category']").find(b => b.getAttribute("data-subject") === "maths");
  click(maths);
  assert(!$$("[data-ui~='lab.sim-card']").some(c => c.getAttribute("data-subject") === "compsci"), "the Maths switch left CS labs in the grid");
  click($$("[data-ui~='lab.category']").find(b => b.getAttribute("data-subject") === "all"));
  const search = $("[data-ui~='lab.toolbar'] input[type=search]");
  search.value = "turing"; search.dispatchEvent(new window.Event("input", { bubbles: true }));
  const hits = $$("[data-ui~='lab.sim-card']");
  assert(hits.length >= 1 && hits.length <= 4 && hits.some(c => /Turing Machine/.test(c.textContent)), "search did not surface the Turing machine (" + hits.length + " cards)");
  KOS.show("sims", "turing-machine");
  assert($("[data-ui~='lab.sim-head']") && /Turing/.test($("[data-ui~='lab.sim-head'] h1").textContent), "the open state has no header");
  assert(/Theory of computation/.test($("[data-ui~='lab.sim-head']").textContent), "the header does not name the lab's area");
  assert($("[data-ui~='lab.back']"), "no way back to the grid");
  assert($$("[data-ui~='lab.sim-head'] button").some(b => /Open topic page/.test(b.textContent)), "no link to the topic page");
});

step("lab canvases take their ink from the theme, not a fixed dark palette", () => {
  assert(typeof KOS.labPalette === "function", "KOS.labPalette is missing");
  const p = KOS.labPalette();
  assert(p.text && p.ink && p.jade && p.alpha, "the palette is incomplete");
  const sims = fs.readFileSync(path.join(ROOT, "js/labs/sims.js"), "utf8");
  const trace = fs.readFileSync(path.join(ROOT, "js/labs/trace.js"), "utf8");
  assert(!/text:\s*"#ece7f4"/.test(sims) && !/TEXT = "#ece7f4"/.test(trace), "the fixed light-on-dark ink is back");
  assert(!/rgba\(69,214,168/.test(sims + trace), "a hard-coded jade wash remains in the labs");
});

/* ==================== D · the study nav ==================== */
console.log("== D · the study nav ==");

/* UI rebuild M2: "the topic page's tab bar is static" was a negative
   check on the legacy .study-nav rule. With the class gone it can no
   longer fail, and smoke55 bans the legacy names from every new sheet;
   the static study-nav row (invariant 52) is rebuilt and checked in M7. */

/* ==================== E · the plan shift ==================== */
console.log("== E · the personal plan moved a week later ==");

step("the seed carries the shift: no personal rows on w/c 7 Sept, the final week on w/c 21 Dec, school rows untouched", () => {
  const seed = window.KOS_PACING;
  const personal = seed.entries.filter(e => e.source === "personal");
  assert(!personal.some(e => e.wb === "2026-09-07"), "personal rows still on w/c 7 Sept");
  assert(!personal.some(e => e.wb === "2026-10-26" || e.wb === "2026-12-14"), "a personal row landed on half term or the mock week");
  assert(personal.filter(e => e.wb === "2026-12-21").length === 10, "the old final week did not land on w/c 21 Dec");
  assert(seed.weeks.some(w => w.wb === "2026-12-21" && w.personalWk === 14), "no w/c 21 Dec week in the seed");
  personal.forEach(e => { const w = seed.weeks.find(w => w.wb === e.wb); assert(w && w.personalWk === e.wk, "wk out of step with its week: " + e.id); });
  assert(seed.entries.filter(e => e.source === "school" && e.wb === "2026-08-31").length === 3, "school rows moved");
});

step("an already-seeded install gets the same move exactly once", () => {
  KOS.store.state.pacing = { v: 1, seeded: true, importedOn: "2026-09-09", nextId: 3, offset: { schoolMinusPersonal: 1 },
    migrations: { personalReflow1: true },   /* this step is about the week shift alone */
    weeks: window.KOS_PACING.weeks.filter(w => w.wb !== "2026-12-21").map(w => Object.assign({}, w)),
    entries: [
      { id: "p1", source: "personal", subject: "maths", wk: 1, wb: "2026-09-07", title: "first", refs: [] },
      { id: "p2", source: "personal", subject: "maths", wk: 13, wb: "2026-12-07", title: "last", refs: [] },
      { id: "p3", source: "school", subject: "maths", wk: 2, wb: "2026-09-07", title: "class", refs: [] }
    ] };
  assert(KOS.pacing.ensureSeeded() === true, "the migration reported no change");
  const s = KOS.store.state.pacing;
  const byId = id => s.entries.find(e => e.id === id);
  assert(byId("p1").wb === "2026-09-14" && byId("p1").wk === 2, "first personal row did not move to w/c 14 Sept");
  assert(byId("p2").wb === "2026-12-21" && byId("p2").wk === 14, "final personal row did not move over the mocks to w/c 21 Dec");
  assert(byId("p3").wb === "2026-09-07" && byId("p3").wk === 2, "a school row moved");
  assert(s.weeks.some(w => w.wb === "2026-12-21"), "w/c 21 Dec was not added");
  assert(s.migrations && s.migrations.personalShift1 === true, "the migration flag was not set");
  assert(KOS.pacing.ensureSeeded() === false && byId("p1").wb === "2026-09-14", "the migration applied twice");
});

/* ==================== F · the plan laid out again from w/c 12 Oct ==================== */
console.log("== F · the personal CS and Maths rows start on w/c 12 Oct ==");

/* the seed weeks as they stood before the reflow: nothing past w/c 21 Dec */
const preReflowWeeks = () => window.KOS_PACING.weeks.filter(w => w.wb <= "2026-12-21").map(w => Object.assign({}, w));
const seedP51 = "Subroutines, parameters, return values & scope";

step("an already-seeded install is laid out again once: split, five a subject a week, breaks skipped", () => {
  const entries = [];
  entries.push({ id: "p51", source: "personal", subject: "compsci", wk: 2, wb: "2026-09-14", title: seedP51,
    refs: ["4.1.1.10", "4.1.1.11", "4.1.1.12", "4.1.1.13", "4.1.1.14"], note: "kept on part one" });
  entries.push({ id: "p64", source: "personal", subject: "compsci", wk: 2, wb: "2026-09-14",
    title: "Bitmapped & vector graphics (my own title)", refs: ["4.5.6.4"] });          /* renamed: not split */
  entries.push({ id: "t0", source: "personal", subject: "compsci", wk: 6, wb: "2026-10-12", title: "ticked", refs: [], done: true, doneAt: 1 });
  for (let i = 1; i <= 50; i++) entries.push({ id: "t" + i, source: "personal", subject: "compsci", wk: 2, wb: "2026-09-14", title: "cs " + i, refs: [] });
  entries.push({ id: "m1", source: "personal", subject: "maths", wk: 2, wb: "2026-09-14", title: "maths one", refs: [] });
  entries.push({ id: "i1", source: "personal", subject: "it", wk: 2, wb: "2026-09-14", title: "it one", refs: [] });
  entries.push({ id: "s1", source: "school", subject: "compsci", wk: 3, wb: "2026-09-14", title: "class", refs: [] });
  KOS.store.state.pacing = { v: 1, seeded: true, importedOn: "2026-09-09", nextId: 60, offset: { schoolMinusPersonal: 1 },
    migrations: { personalShift1: true }, weeks: preReflowWeeks(), entries };
  assert(KOS.pacing.ensureSeeded() === true, "the migration reported no change");
  const s = KOS.store.state.pacing;
  const byId = id => s.entries.find(e => e.id === id);
  const cs = s.entries.filter(e => e.source === "personal" && e.subject === "compsci");

  /* the split: part one keeps the row's id and note, part two takes the fixed id and follows it */
  assert(byId("p51").title === "Subroutines & parameters" && byId("p51").refs.join() === "4.1.1.10,4.1.1.11", "part one of the split is wrong");
  assert(byId("p51").note === "kept on part one", "part one lost the row's note");
  const two = byId("p1001");
  assert(two && two.title.indexOf("Return values") === 0 && two.refs.join() === "4.1.1.12,4.1.1.13,4.1.1.14" && two.note === "", "part two is wrong");
  assert(s.entries.indexOf(two) === s.entries.indexOf(byId("p51")) + 1, "part two does not follow part one");
  assert(byId("p64").title === "Bitmapped & vector graphics (my own title)" && !byId("p1011"), "a renamed row was split");

  /* the layout: ticked row stays and counts, nothing past five, order kept, breaks skipped */
  assert(byId("t0").wb === "2026-10-12" && byId("t0").done === true, "a ticked row moved");
  const per = {}; cs.forEach(e => { per[e.wb] = (per[e.wb] || 0) + 1; });
  Object.keys(per).forEach(wb => assert(per[wb] <= 5, wb + " holds " + per[wb] + " CS rows"));
  assert(!cs.some(e => e.wb < "2026-10-12"), "a CS row was left before w/c 12 Oct");
  assert(!cs.some(e => e.wb === "2026-10-26" || e.wb === "2026-12-14"), "a row landed on half term or the mock week");
  assert(cs.filter(e => e.wb === "2026-10-12").length === 5, "w/c 12 Oct should hold the ticked row plus four");
  assert(byId("p51").wb === "2026-10-12" && byId("p1001").wb === "2026-10-12", "the first unticked rows did not start the week");
  assert(byId("t1").wb === "2026-10-12" && byId("t3").wb === "2026-10-19" && byId("t50").wb >= byId("t49").wb, "order was not kept");
  const order = cs.filter(e => !e.done).map(e => e.id);
  assert(order.indexOf("p51") < order.indexOf("p1001") && order.indexOf("p1001") < order.indexOf("p64") && order.indexOf("p64") < order.indexOf("t1") && order.indexOf("t1") < order.indexOf("t50"), "the row order changed");
  cs.forEach(e => assert(e.wk === s.weeks.find(w => w.wb === e.wb).personalWk, "wk out of step with its week: " + e.id));

  /* 51 unticked + split + the renamed one overflows w/c 21 Dec: the plan runs on in personal-only weeks */
  const dec28 = s.weeks.find(w => w.wb === "2026-12-28");
  assert(dec28 && dec28.label === "w/c 28 Dec" && dec28.schoolWk === null && dec28.personalWk === 15, "w/c 28 Dec was not added");
  assert(cs.some(e => e.wb === "2026-12-28"), "nothing landed on the new week");

  /* everything else is untouched */
  assert(byId("m1").wb === "2026-10-12", "maths was not laid out from w/c 12 Oct");
  assert(byId("i1").wb === "2026-09-14" && byId("i1").wk === 2, "an IT row moved");
  assert(byId("s1").wb === "2026-09-14" && byId("s1").wk === 3, "a school row moved");
  assert(s.migrations.personalReflow1 === true, "the migration flag was not set");
  assert(KOS.pacing.ensureSeeded() === false && byId("t1").wb === "2026-10-12" && s.entries.length === cs.length + 3, "the migration applied twice");
});

step("the seed already carries the layout, so the migration is a no-op on a fresh seed", () => {
  const seed = window.KOS_PACING;
  const personal = seed.entries.filter(e => e.source === "personal" && e.subject !== "it");
  assert(!personal.some(e => e.wb < "2026-10-12"), "a seeded CS/Maths row is before w/c 12 Oct");
  ["compsci", "maths"].forEach(sid => {
    const per = {};
    personal.filter(e => e.subject === sid).forEach(e => { per[e.wb] = (per[e.wb] || 0) + 1; });
    Object.keys(per).forEach(wb => assert(per[wb] <= 5, sid + " " + wb + " holds " + per[wb]));
    assert(!per["2026-10-26"] && !per["2026-12-14"], sid + " has a row in a break week");
  });
  personal.forEach(e => { const w = seed.weeks.find(w => w.wb === e.wb); assert(w && w.personalWk === e.wk, "wk out of step with its week: " + e.id); });
  assert(seed.entries.filter(e => e.source === "personal" && e.subject === "it").every(e => e.wb >= "2026-10-19" && e.wb <= "2026-11-30"), "an IT row moved");
});

/* ---- run ---- */
let pass = 0;
for (const [name, fn] of steps) {
  try { fn(); console.log("  ok  " + name); pass++; }
  catch (e) { errors.push('STEP "' + name + '": ' + (e.message || e)); console.log("FAIL  " + name + "\n        " + (e.message || e)); }
}
if (errors.length) {
  console.log("\nSMOKE50 FAILURES (" + errors.length + "):");
  errors.forEach(e => console.log("  - " + e));
  process.exit(1);
}
console.log("\nSMOKE50 PASS — question banks and labs expansion verified (" + pass + " steps).");
process.exit(0);
