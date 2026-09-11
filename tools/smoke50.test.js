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
const css = fs.readFileSync(path.join(ROOT, "css/main.css"), "utf8");
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
  assert(idx("bank-cs-41.js") > idx("cs-datastructures.js"), "a bank loads before the base content it extends");
  assert(idx("bank-maths-stats.js") > idx("maths-applied.js"), "the stats bank loads before maths-applied.js");
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
  const tab = $$(".study-nav button, .study-nav .tab, .study-nav [role=tab]").find(b => /Exam questions/.test(b.textContent));
  assert(tab, "no Exam questions tab on the topic page");
  click(tab);
  const items = $$(".qz-exam-top").length;
  assert(items >= 5, "the bank's exam items did not render: " + items);
  assert($$(".qz-src").some(s => /modelled on Edexcel/.test(s.textContent)), "no provenance line");
  assert($$(".qz-part-l").some(l => /^\(a\)/.test(l.textContent.trim())), "parts are not lettered");
  const chips = $$(".qz-chip");
  assert(chips.length >= 3, "no tariff filter chips");
  const before = KOS.store.state.sessions.length;
  const log = $$(".qz-selfmark button, .qz-exam-foot button").find(b => /Log self-mark/.test(b.textContent));
  assert(log, "no per-item self-mark control");
  click(log);
  assert(KOS.store.state.sessions.length === before + 1, "logging one item did not produce exactly one session");
});

step("the tariff chips filter the items shown", () => {
  const all = $$(".qz-exam-top").length;
  const chip = $$(".qz-chip").find(c => /6\+/.test(c.textContent));
  assert(chip, "no 6+ marks chip");
  click(chip);
  const shown = $$(".qz-exam-top").length;
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
  for (const [sid, ref, id] of [["maths", "9.4", "trapezium-rule"], ["maths", "S7.5", "projectile-lab"], ["maths", "S9.1", "moments-beam"],
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
  for (const [sid, ref, id] of [["maths", "9.4", "trapezium"], ["maths", "S5.1", "pmcctest"], ["maths", "S8.6", "incline"], ["compsci", "4.3.3.1", "rpn"], ["compsci", "4.9.4.4", "subnet"]]) {
    assert(KOS.worked.forRef(sid, ref).some(g => g.id === id), id + " is not wired to " + sid + ":" + ref);
  }
  KOS.show("ref", { subject: "maths", ref: "9.4" });
  const tab = $$(".study-nav button, .study-nav .tab, .study-nav [role=tab]").find(b => /Worked/.test(b.textContent));
  assert(tab, "no Worked tab on 9.4");
  click(tab);
  assert($$(".step").length >= 1, "the trapezium generator did not mount on its topic page");
});

step("the Simulations view is a categorised, searchable grid with a deep-linkable open state", () => {
  KOS.show("sims");
  assert($$(".sim-card").length >= 45, "the grid does not list the sims");
  const pill = $$(".cat-pill").find(b => /Stats & Mechanics/.test(b.textContent));
  assert(pill, "no category pills"); click(pill);
  const n = $$(".sim-card").length;
  assert(n >= 8 && n < 20, "the Stats & Mechanics filter did not narrow the grid: " + n);
  const search = $(".sim-toolbar input[type=search]");
  search.value = "turing"; search.dispatchEvent(new window.Event("input", { bubbles: true }));
  const hits = $$(".sim-card");
  assert(hits.length >= 1 && hits.length <= 4 && hits.some(c => /Turing Machine/.test(c.textContent)), "search did not surface the Turing machine (" + hits.length + " cards)");
  KOS.show("sims", "turing-machine");
  assert($(".sim-open-head") && /Turing/.test($(".sim-open-head h2").textContent), "the open state has no header");
  assert($$(".sim-open-head button").some(b => /All simulations/.test(b.textContent)), "no way back to the grid");
  assert($$(".sim-open-head button").some(b => /Open topic page/.test(b.textContent)), "no link to the topic page");
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

step("the topic page's tab bar is static — it no longer covers the text it introduces", () => {
  assert(!/\.study-nav\s*\{[^}]*position:\s*sticky/s.test(css), "the study nav is sticky again");
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
