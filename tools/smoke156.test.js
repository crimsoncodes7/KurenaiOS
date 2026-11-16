/* Kurenai OS — smoke156.test.js
   Roadmap 5.19 item 1: IT unit F201 (Big data and machine learning) at full
   depth, from the OCR specification and its Sample Assessment Material.

     A · NOTES. Every F201 leaf opens on its whole-topic overview and what the
         specification asks, is paged, ends with "Exam toolkit", has an
         "In exam questions" page, draws at least one figure, names its
         misconceptions, gives a mnemonic and its synoptic links, and holds
         no bare paragraph.
     B · WORKED EXAM ANSWERS. At least four OCR-style worked cards a leaf,
         each with its marks and mark points; at least one is a 6- or 9-mark
         levels-of-response answer; the exam tab's items derive from them and
         name OCR.
     C · FLASHCARDS are quick recall: twelve or more a leaf; every front asks
         for something specific (a question, never a bare label) and no back
         is a bare yes/no; a new card never takes an old card's schedule
         (third element 100 or more, unique in its leaf).
     D · QUIZ: eight or more a leaf, four options, and no item whose right
         answer is the one long option (tools/quiz_bias.mjs's rule).
     E · ONE OWNER: the old it-f201.js is gone, the three files are loaded
         and between them cover all fifteen F201 leaves; every leaf renders
         with no page error.

   Run: node tools/smoke156.test.js */
"use strict";
const fs = require("fs");
const path = require("path");
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
const ROOT = path.join(__dirname, "..");
const FILES = ["it-f201a.js", "it-f201b.js", "it-f201c.js"];
const LEAVES = ["1.1", "1.2", "1.3", "1.4", "2.1", "2.2", "2.3", "2.4", "2.5", "2.6", "3.1", "4.1", "4.2", "5.1", "5.2"].map((r) => "F201." + r);
let app, K, C;

/* the leaf, every block inside its callouts too */
function blocks(notes) {
  const out = [];
  (function walk(list) { (list || []).forEach((b) => { if (!b || typeof b !== "object") return; out.push(b); if (b.callout && Array.isArray(b.callout.body)) walk(b.callout.body); }); })(notes);
  return out;
}

step("boot", async () => {
  app = await boot({ clock: "2026-11-16T10:00:00" });
  K = app.KOS; C = app.window.KOS_CONTENT;
});

step("A · notes", () => {
  const bad = [];
  LEAVES.forEach((ref) => {
    const c = C["it:" + ref], n = c && c.notes || [];
    const why = [];
    if (!/ — the whole topic on one page$/.test((n[0] && n[0].h) || "")) why.push("opens on its overview");
    if (!n.some((b) => b && b.callout && /^What the specification asks/.test(b.callout.h || ""))) why.push("what the specification asks");
    const pages = n.filter((b) => b && b.page).map((b) => b.page);
    if (pages.length < 4) why.push("paged (" + pages.length + ")");
    if (pages[pages.length - 1] !== "Exam toolkit") why.push("ends with Exam toolkit");
    if (pages.indexOf("In exam questions") < 0) why.push("an In exam questions page");
    const all = blocks(n);
    const figs = all.filter((b) => b.fig).length + all.filter((b) => b.worked).reduce((a, b) => a + (b.worked.fig ? 1 : 0) + (b.worked.steps || []).filter((s) => s && s.fig).length, 0);
    if (!figs) why.push("a figure");
    const callouts = all.filter((b) => b.callout).map((b) => b.callout);
    if (!callouts.some((x) => x.t === "miscon")) why.push("misconceptions");
    if (!callouts.some((x) => x.t === "mnemonic")) why.push("a mnemonic");
    if (!callouts.some((x) => /^Synoptic links$/.test(x.h || ""))) why.push("synoptic links");
    if (n.some((b) => typeof b === "string")) why.push("a bare paragraph");
    if (why.length) bad.push(ref + ": " + why.join(", "));
  });
  assert(!bad.length, "F201 notes:\n  " + bad.join("\n  "));
});

step("B · worked exam answers and the exam tab", () => {
  const bad = [];
  LEAVES.forEach((ref) => {
    const c = C["it:" + ref], why = [];
    const worked = blocks(c.notes).filter((b) => b.worked && b.worked.tag === "exam").map((b) => b.worked);
    if (worked.length < 4) why.push("worked exam cards (" + worked.length + ")");
    worked.forEach((w) => {
      const m = /(\d+)\s*marks?/.exec(w.src || "");
      if (!m) why.push("no marks in src: " + w.title);
      if (!(w.steps || []).some((s) => s && s.mk)) why.push("no mark points: " + w.title);
    });
    if (!worked.some((w) => /\b(6|9) marks\b/.test(w.src || ""))) why.push("a 6- or 9-mark levels-of-response answer");
    const derived = (c.exam || []).filter((x) => /^OCR /.test(x.src || ""));
    if (derived.length < 4) why.push("exam items derived (" + derived.length + ")");
    derived.forEach((x) => { if (!(Number.isInteger(x.marks) && x.marks > 0 && x.ms.length)) why.push("an exam item without marks: " + x.q.slice(0, 40)); });
    if (why.length) bad.push(ref + ": " + why.join(", "));
  });
  assert(!bad.length, "F201 worked answers:\n  " + bad.join("\n  "));
});

step("C · flashcards are quick recall", () => {
  const bad = [];
  LEAVES.forEach((ref) => {
    const cards = C["it:" + ref].flashcards || [], why = [], keys = {};
    if (cards.length < 12) why.push("cards (" + cards.length + ")");
    cards.forEach((c, i) => {
      const q = String(c[0]).trim(), a = String(c[1]).trim();
      const words = q.replace(/\$[^$]*\$/g, "x").split(/\s+/).filter(Boolean).length;
      if (!/\?$/.test(q) && !/^(Name|List|State|Give|Define|Complete|Order|Match|Explain|Describe|Identify|Fill)\b/.test(q)) why.push("#" + i + " not a question: " + q.slice(0, 40));
      if (words < 4) why.push("#" + i + " a bare label: " + q);
      if (/^(yes|no|true|false)\b[.!—–,-]*\s*\S{0,30}$/i.test(a) && a.split(/\s+/).length < 6) why.push("#" + i + " a bare yes/no: " + a);
      const k = c[2] == null ? i : c[2];
      if (keys[k]) why.push("#" + i + " shares a key with another card: " + k);
      keys[k] = true;
      if (c[2] == null) why.push("#" + i + " has no third element (new cards take 100+, kept ones their old place)");
      else if (typeof c[2] === "number" && c[2] < 100 && c[2] >= 40) why.push("#" + i + " an odd key " + c[2]);
    });
    if (why.length) bad.push(ref + ": " + why.join("; "));
  });
  assert(!bad.length, "F201 flashcards:\n  " + bad.join("\n  "));
});

step("D · quiz", () => {
  const bad = [];
  LEAVES.forEach((ref) => {
    const qs = C["it:" + ref].quiz || [], why = [];
    if (qs.length < 8) why.push("items (" + qs.length + ")");
    qs.forEach((q, i) => {
      if ((q.opts || []).length !== 4) why.push("#" + i + " has " + (q.opts || []).length + " options");
      if (!(q.ans >= 0 && q.ans < (q.opts || []).length)) why.push("#" + i + " answer out of range");
      if (!q.why) why.push("#" + i + " no explanation");
      const L = (q.opts || []).map((o) => String(o).length), s = L.slice().sort((a, b) => b - a);
      if (L[q.ans] === s[0] && s[0] > s[1] && s[0] >= 1.3 * s[1]) why.push("#" + i + " the right answer is the one long option");
    });
    if (why.length) bad.push(ref + ": " + why.join("; "));
  });
  assert(!bad.length, "F201 quiz:\n  " + bad.join("\n  "));
});

step("E · one owner, all fifteen leaves, every leaf renders", async () => {
  assert(!fs.existsSync(path.join(ROOT, "js/data/content/it-f201.js")), "the old it-f201.js is gone");
  const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  FILES.forEach((f) => assert(html.indexOf("js/data/content/" + f) > 0, f + " is loaded"));
  const owners = {};
  FILES.forEach((f) => {
    const src = fs.readFileSync(path.join(ROOT, "js/data/content", f), "utf8");
    (src.match(/C\["it:F201\.[0-9.]+"\]\s*=/g) || []).forEach((m) => { const r = /F201\.[0-9.]+/.exec(m)[0]; (owners[r] = owners[r] || []).push(f); });
  });
  LEAVES.forEach((r) => assert(owners[r] && owners[r].length === 1, r + " is defined once: " + (owners[r] || []).join(", ")));
  for (const ref of LEAVES) {
    K.show("ref", { subject: "it", ref }, { _nav: true }); await app.settle();
    assert(app.document.querySelector("#main [data-ui~='study.panel']"), ref + " opens");
  }
  assert(!app.errors.length, "no page errors: " + app.errors.slice(0, 3).join(" | "));
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok   " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + String(e && e.message || e).split("\n").slice(0, 40).join("\n       ")); }
  }
  console.log(failed ? `\nSMOKE156 FAIL — ${failed} of ${steps.length} step(s)` : `\nSMOKE156 OK — ${steps.length} steps`);
  process.exit(failed ? 1 : 0);
})();
