/* Kurenai OS — smoke116.test.js
   Content gates over every subject's shipped material (quality audit W0
   §A7 "content: no near-duplicate cards, answer positions spread out, mark
   schemes that add up, no duplicate ids"; findings CM-02 — Maths quiz
   answers almost always A or B — and CC-11 — validate_content's errors in
   cs-m-* and IT; the content itself is fixed in W6).

   The app's scripts are loaded in document order into jsdom, exactly as the
   page loads them, with a few read-only taps: which file registered each
   KOS_CONTENT key, which flashcards, quiz and exam items a bank
   (KOS.content.extend) added, which exam items were derived from worked
   cards, and every registration that REPLACED an id already registered.

     A · LOADS: every script loads; KOS_CONTENT has every subject.
     B · NEAR-DUPLICATE CARDS: within one deck, two flashcards whose
         question + answer token sets overlap by Jaccard ≥ 0.85 (marked
         bank·base when a bank card repeats a base card); across decks of one
         subject, the same card word for word.
     C · ANSWER POSITIONS: per subject, the share of multiple-choice items
         whose answer is A or B (KOS_CONTENT quizzes, Mind's checks). It may
         not grow.
     D · MARK SCHEMES ADD UP: a worked card's step mark codes (M1 A1 B1,
         dM1, A1ft, A1* …, or "1 mark") sum to the marks in its `src`; an
         exam item whose every mark-scheme line carries codes ("M1: …",
         "… [M1 A1]") sums to its `marks` (parts each on their own); a
         scheme that says "Max" may list more points than marks. A
         scheme written in another convention is skipped, not guessed.
     E · CALLOUT TYPES: every callout's `t` is one the renderer knows
         (KOS.content.CALLOUT_META); an unknown one silently renders as a tip.
     F · DUPLICATE IDS: a KOS_CONTENT key, a Code concept/task/card, a Mind
         concept/lesson/checkpoint or a Japanese item/lesson registered twice
         (the second silently replaces the first); a block id or runnable
         listing id used twice in one leaf. 
     G · DUPLICATE SOURCES: two exam items of one leaf naming the same `src`.
     H · VALIDATOR: `node tools/validate_content.js` errors, by file and
         message (CC-11). A file the validator cannot evaluate on its own
         (it needs KOS, which only the page provides) is reported as not
         checkable — step A loads it for real.

   RATCHETED: tools/baselines/smoke116-content.json holds today's
   violations as counts by key (and each subject's A/B share). The suite
   fails only on a violation not in it (or a count, or a share, that grew),
   and lists what is now fixed so the baseline can be shrunk.

   Run:
     node tools/smoke116.test.js
     node tools/smoke116.test.js --write-baseline   (re-record today's)  */
"use strict";
const { JSDOM, VirtualConsole } = require("jsdom");
const fs = require("fs"), path = require("path");
const { spawnSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const BASELINE = path.join(ROOT, "tools", "baselines", "smoke116-content.json");
const WRITE = process.argv.includes("--write-baseline");
const JACCARD = 0.85;

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, msg) { if (!c) throw new Error(msg); }

/* ---- findings: check -> key -> count ---- */
const found = {};
function hit(check, key) { const c = (found[check] = found[check] || {}); c[key] = (c[key] || 0) + 1; }
const shares = {};   /* sid -> {n, ab, pos:[A,B,C,D,…]} */

/* ---- load the page's scripts with read-only taps ---- */
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const vc = new VirtualConsole();
const dom = new JSDOM(html, { url: "http://localhost/index.html", runScripts: "outside-only", pretendToBeVisual: true, virtualConsole: vc });
const { window } = dom;
const noop = () => {};
const ctxStub = new Proxy({}, { get: (t, k) => k === "measureText" ? () => ({ width: 10 }) : (typeof k === "string" ? noop : undefined), set: () => true });
window.HTMLCanvasElement.prototype.getContext = () => ctxStub;
window.requestAnimationFrame = (cb) => setTimeout(cb, 0);
window.setInterval = () => 0;
window.matchMedia = (q) => ({ matches: false, media: q, addEventListener: noop, removeEventListener: noop, addListener: noop, removeListener: noop });
const fakeIdb = require("fake-indexeddb");
window.indexedDB = fakeIdb.indexedDB; window.IDBKeyRange = fakeIdb.IDBKeyRange;

let current = "";
const keyFile = {};                 /* KOS_CONTENT key -> the file that first registered it */
const bankItems = new Set();        /* flashcard/quiz/exam objects a bank added */
const bankFileOf = new Map();
const derived = new Set();          /* exam items made from worked cards */
const dupIds = [];                  /* "<registry> · <id> · <file> replaced <file>" */
const contentRaw = {};
window.KOS_CONTENT = new Proxy(contentRaw, {
  set(t, k, v) {
    if (Object.prototype.hasOwnProperty.call(t, k) && t[k] !== v) dupIds.push("KOS_CONTENT · " + String(k) + " · " + current + " replaced " + (keyFile[k] || "?"));
    if (!keyFile[k]) keyFile[k] = current;
    t[k] = v;
    return true;
  }
});
function registryProxy(name, obj) {
  const where = {};
  Object.keys(obj).forEach((k) => { where[k] = current; });
  return new Proxy(obj, {
    set(t, k, v) {
      if (Object.prototype.hasOwnProperty.call(t, k) && t[k] !== v) dupIds.push(name + " · " + String(k) + " · " + current + " replaced " + (where[k] || "?"));
      if (!where[k]) where[k] = current;
      t[k] = v;
      return true;
    }
  });
}
function wrapRegister(name, holder, fn, idOf, mapOf) {
  const orig = holder[fn];
  const where = {};
  holder[fn] = function (o) {
    const id = idOf(o);
    const map = mapOf();
    if (id != null && map && Object.prototype.hasOwnProperty.call(map, id)) dupIds.push(name + " · " + id + " · " + current + " replaced " + (where[id] || "?"));
    if (id != null && !where[id]) where[id] = current;
    return orig.apply(this, arguments);
  };
}
const tapped = {};
function taps() {
  const W = window, K = W.KOS || {};
  if (!tapped.content && K.content && K.content.extend) {
    tapped.content = true;
    const ext = K.content.extend;
    K.content.extend = function (key, patch) {
      ["flashcards", "quiz", "exam"].forEach((k) => (patch && patch[k] || []).forEach((it) => { bankItems.add(it); bankFileOf.set(it, current); }));
      return ext.apply(this, arguments);
    };
    const efw = K.content.examFromWorked;
    K.content.examFromWorked = function () { const out = efw.apply(this, arguments); (out || []).forEach((it) => derived.add(it)); return out; };
  }
  if (!tapped.mind && W.KOS_MIND && W.KOS_MIND.concept) {
    tapped.mind = true;
    const M = W.KOS_MIND;
    wrapRegister("Mind concept", M, "concept", (c) => c && c.id, () => M.CONCEPTS);
    wrapRegister("Mind lesson", M, "lesson", (l) => l && l.id, () => M.LESSONS);
    wrapRegister("Mind checkpoint", M, "checkpoint", (c) => c && c.unit, () => M.CHECKPOINTS);
  }
  if (!tapped.code && W.KOS_CODE && W.KOS_CODE.add) {
    tapped.code = true;
    const C = W.KOS_CODE, add = C.add, where = {};
    C.add = function (o) {
      ["CONCEPTS", "TASKS", "CARDS"].forEach((k) => {
        Object.keys((o && o[k.toLowerCase()]) || {}).forEach((id) => {
          if (C[k] && Object.prototype.hasOwnProperty.call(C[k], id)) dupIds.push("Code " + k.toLowerCase().replace(/s$/, "") + " · " + id + " · " + current + " replaced " + (where[k + id] || "?"));
          if (!where[k + id]) where[k + id] = current;
        });
      });
      return add.apply(this, arguments);
    };
  }
  if (!tapped.ja && W.KOS_JA && W.KOS_JA.ITEMS) {
    tapped.ja = true;
    W.KOS_JA.ITEMS = registryProxy("Japanese item", W.KOS_JA.ITEMS);
    if (W.KOS_JA.LESSONS) W.KOS_JA.LESSONS = registryProxy("Japanese lesson", W.KOS_JA.LESSONS);
  }
}
const loadErrors = [];
const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]);
for (const src of scripts) {
  current = src;
  try { window.eval(fs.readFileSync(path.join(ROOT, src), "utf8")); } catch (e) { loadErrors.push(src + ": " + e.message); }
  taps();
}
current = "(after load)";
const K = window.KOS;
if (K && K.autosync && K.autosync.stop) K.autosync.stop();
if (K && K.cloudsync && K.cloudsync.stop) K.cloudsync.stop();
const CONTENT = contentRaw;

/* ---- helpers ---- */
const sidOf = (key) => key.split(":")[0];
const OWN_CALLOUTS = ["ja", "creatives", "mind"];
function cardText(c) {
  if (Array.isArray(c)) return [String(c[0] == null ? "" : c[0]), String(c[1] == null ? "" : c[1])];
  if (c && typeof c === "object") return [String(c.q || c.front || ""), String(c.a || c.back || "")];
  return [String(c), ""];
}
function norm(s) {
  return String(s).toLowerCase()
    .replace(/\\[a-z]+/g, " ")          /* LaTeX commands */
    .replace(/[^a-z0-9À-￿]+/g, " ").trim();
}
/* words, numbers, LaTeX command names and single symbols, so "x + y" and "x × y" stay two cards */
function tokens(s) {
  return new Set(String(s).toLowerCase().match(/\\[a-z]+|[a-zÀ-￿]+|\d+(?:\.\d+)?|[^\s\w${}\\]/g) || []);
}
function jaccard(a, b) {
  if (!a.size && !b.size) return 1;
  let i = 0; for (const t of a) if (b.has(t)) i++;
  return i / (a.size + b.size - i);
}
const short = (s, n) => { s = norm(s); return s.length > (n || 50) ? s.slice(0, n || 50) + "…" : s; };
function walk(x, fn, seen) {
  seen = seen || new Set();
  if (!x || typeof x !== "object" || seen.has(x)) return;
  seen.add(x);
  fn(x);
  if (Array.isArray(x)) x.forEach((y) => walk(y, fn, seen));
  else Object.keys(x).forEach((k) => walk(x[k], fn, seen));
}

/* mark codes */
const CODE = /^(?:d|D)?[MAB]\d+(?:ft|\*|cao|oe|cso|aef)?$/;
function codeSum(str) {
  const toks = String(str).trim().split(/[\s,]+/).filter(Boolean);
  if (!toks.length) return null;
  if (toks.every((t) => CODE.test(t))) return toks.reduce((s, t) => s + parseInt(/\d+/.exec(t)[0], 10), 0);
  const n = /^\(?(\d+)\)?(?:\s*marks?)?$/i.exec(String(str).trim());
  return n ? +n[1] : null;
}
function msLineCodes(line) {
  line = String(line);
  if (/^\s*\*\*answer/i.test(line)) return 0;
  const pre = /^\s*((?:(?:d|D)?[MAB]\d+(?:ft|\*)?[\s,]*)+)\s*[:—–-]/.exec(line);
  if (pre) return codeSum(pre[1]);
  const suf = /\[\s*((?:(?:d|D)?[MAB]\d+(?:ft|\*)?[\s,]*)+)\]\s*\.?\s*$/.exec(line);
  if (suf) return codeSum(suf[1]);
  return null;
}

step("A · every script loads and every subject has content", () => {
  assert(!loadErrors.length, "scripts failed to load:\n         " + loadErrors.join("\n         "));
  const sids = new Set(Object.keys(CONTENT).map(sidOf));
  ["compsci", "maths", "it", "code"].forEach((s) => assert(sids.has(s), "KOS_CONTENT holds " + s));
  console.log("       " + Object.keys(CONTENT).length + " leaves across " + [...sids].join(", ") + "; " + bankItems.size + " bank items");
});

step("B · near-duplicate flashcards", () => {
  const exact = {};   /* sid|normalised -> [decks] */
  let pairs = 0, cards = 0;
  Object.keys(CONTENT).sort().forEach((key) => {
    const deck = (CONTENT[key] && CONTENT[key].flashcards) || [];
    const rows = deck.map((c) => { const [q, a] = cardText(c); return { c, q, a, t: tokens(q + " " + a) }; });
    cards += rows.length;
    for (let i = 0; i < rows.length; i++) {
      for (let j = i + 1; j < rows.length; j++) {
        if (jaccard(rows[i].t, rows[j].t) < JACCARD) continue;
        pairs++;
        const bi = bankItems.has(rows[i].c), bj = bankItems.has(rows[j].c);
        const tag = bi && bj ? "bank·bank" : bi || bj ? "bank·base" : "base·base";
        const [x, y] = [short(rows[i].q), short(rows[j].q)].sort();
        hit("nearDuplicateCards", key + " · " + tag + " · \"" + x + "\" ≈ \"" + y + "\"");
      }
      const ex = sidOf(key) + "|" + norm(rows[i].q) + "|" + norm(rows[i].a);
      (exact[ex] = exact[ex] || new Set()).add(key);
    }
  });
  Object.keys(exact).forEach((ex) => {
    const decks = [...exact[ex]].sort();
    if (decks.length > 1) hit("sameCardAcrossDecks", decks.join(" + ") + " · \"" + short(ex.split("|")[1]) + "\"");
  });
  console.log("       " + cards + " cards; " + pairs + " near-duplicate pair(s) within decks; " +
    Object.keys(found.sameCardAcrossDecks || {}).length + " card(s) repeated across decks");
});

step("C · answer positions per subject", () => {
  function count(sid, ans, nOpts) {
    if (typeof ans !== "number" || !(nOpts > 1)) return;
    const s = (shares[sid] = shares[sid] || { n: 0, ab: 0, pos: [] });
    s.n++; if (ans <= 1) s.ab++;
    s.pos[ans] = (s.pos[ans] || 0) + 1;
  }
  Object.keys(CONTENT).forEach((key) => ((CONTENT[key] && CONTENT[key].quiz) || []).forEach((q) => count(sidOf(key), q.ans, (q.opts || []).length)));
  const M = window.KOS_MIND;
  if (M) Object.keys(M.LESSONS).forEach((id) => (M.LESSONS[id].check || []).forEach((q) => count("mind", q.a, (q.options || []).length)));
  Object.keys(shares).sort().forEach((sid) => {
    const s = shares[sid];
    s.share = +(s.ab / s.n).toFixed(4);
    console.log("       " + sid.padEnd(9) + " " + String(s.n).padStart(5) + " items · A/B " + (100 * s.share).toFixed(1) + "% · by position " +
      [...s.pos].map((v, i) => "ABCDEFGH"[i] + " " + (v || 0)).join(", "));
  });
});

step("D · mark schemes add up", () => {
  let worked = 0, items = 0;
  Object.keys(CONTENT).sort().forEach((key) => {
    const e = CONTENT[key];
    walk(e && e.notes, (b) => {
      const w = b.worked;
      if (!w || typeof w !== "object") return;
      const mm = /(\d+)\s*marks?\b/i.exec(String(w.src || "")) || (w.marks != null ? [0, w.marks] : null);
      if (!mm) return;
      const marks = +mm[1];
      let sum = 0, any = false, ok = true;
      (w.steps || []).forEach((st) => {
        if (!st || st.mk == null || st.mk === "") return;
        any = true;
        const v = codeSum(st.mk);
        if (v == null) ok = false; else sum += v;
      });
      if (!any || !ok) return;
      worked++;
      /* AQA's "Max N" lists more creditable points than marks: more is fine there, fewer never */
      const capped = sum > marks && /\bmax(imum)?\b/i.test(JSON.stringify(w.steps || []) + " " + (w.result || ""));
      if (sum !== marks && !capped) hit("markSchemes", key + " · worked \"" + short(w.title || w.src, 60) + "\" · codes sum " + sum + ", marks " + marks);
    });
    function item(it, label) {
      if (!it || derived.has(it) || it.marks == null || !Array.isArray(it.ms) || !it.ms.length) return;
      const lines = it.ms.filter((l) => !/^\s*\*\*answer/i.test(String(l)));
      const vals = lines.map(msLineCodes);
      if (!lines.length || vals.some((v) => v == null)) return;
      items++;
      const sum = vals.reduce((s, v) => s + v, 0);
      const capped = sum > +it.marks && /\bmax(imum)?\b/i.test(JSON.stringify(it.ms));
      if (sum !== +it.marks && !capped) hit("markSchemes", key + " · exam \"" + short(label, 60) + "\" · codes sum " + sum + ", marks " + it.marks);
    }
    ((e && e.exam) || []).forEach((it) => {
      if (Array.isArray(it.parts)) it.parts.forEach((p, i) => item(p, (it.src || it.ctx || "") + " part " + (i + 1)));
      else item(it, it.src || it.q || "");
    });
  });
  console.log("       " + worked + " coded worked cards and " + items + " coded exam items checked; " +
    Object.values(found.markSchemes || {}).reduce((s, n) => s + n, 0) + " do not add up");
});

step("E · callout types the renderer knows", () => {
  const known = (K.content && K.content.CALLOUT_META) || {};
  assert(Object.keys(known).length >= 5, "KOS.content.CALLOUT_META is there");
  /* Japanese, Creatives and Mind draw their own callouts, whose `t` is a title (jatopic, crtopic, mindtopic) */
  Object.keys(CONTENT).filter((key) => OWN_CALLOUTS.indexOf(sidOf(key)) < 0).sort().forEach((key) => walk(CONTENT[key], (b) => {
    if (b.callout && typeof b.callout === "object" && !Object.prototype.hasOwnProperty.call(known, b.callout.t)) hit("unknownCallouts", key + " · t=" + JSON.stringify(b.callout.t));
  }));
  console.log("       known: " + Object.keys(known).join(", ") + "; unknown uses: " + Object.values(found.unknownCallouts || {}).reduce((s, n) => s + n, 0));
});

step("F · duplicate ids", () => {
  dupIds.forEach((d) => hit("duplicateIds", d));
  Object.keys(CONTENT).sort().forEach((key) => {
    const blockIds = {}, runIds = {};
    walk(CONTENT[key] && CONTENT[key].notes, (b) => {
      if (Array.isArray(b)) return;
      if (typeof b.id === "string" && (b.p != null || b.md != null || b.callout || b.h != null || b.table || b.ul || b.ol || b.kv)) blockIds[b.id] = (blockIds[b.id] || 0) + 1;
      if (b.run && b.run.id) runIds[b.run.id] = (runIds[b.run.id] || 0) + 1;   /* a listing id is scoped to its lesson */
    });
    Object.keys(blockIds).forEach((id) => { if (blockIds[id] > 1) hit("duplicateIds", key + " · block id " + id + " ×" + blockIds[id]); });
    Object.keys(runIds).forEach((id) => { if (runIds[id] > 1) hit("duplicateIds", key + " · run id " + id + " ×" + runIds[id]); });
  });
  console.log("       " + Object.keys(found.duplicateIds || {}).length + " duplicate id(s)");
});

step("G · duplicate sources within a leaf", () => {
  Object.keys(CONTENT).sort().forEach((key) => {
    const by = {};
    ((CONTENT[key] && CONTENT[key].exam) || []).forEach((it) => {
      if (!it || !it.src) return;
      const s = String(it.src).trim().replace(/\s+/g, " ");
      (by[s] = by[s] || []).push(it);
    });
    Object.keys(by).forEach((s) => {
      if (by[s].length < 2) return;
      const kinds = by[s].map((it) => derived.has(it) ? "worked" : bankItems.has(it) ? "bank" : "base").sort().join("+");
      hit("duplicateSources", key + " · \"" + s + "\" ×" + by[s].length + " (" + kinds + ")");
    });
  });
  console.log("       " + Object.keys(found.duplicateSources || {}).length + " repeated source(s)");
});

step("H · validate_content errors (CC-11)", () => {
  const r = spawnSync(process.execPath, [path.join(ROOT, "tools/validate_content.js")], { cwd: ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const lines = (r.stderr || "").split("\n").filter((l) => /^\s*ERROR\s/.test(l));
  let notCheckable = 0, n = 0;
  lines.forEach((l) => {
    const msg = l.replace(/^\s*ERROR\s+/, "").trim();
    const fileMsg = /^(js\/data\/content\/\S+\.js) — (.*)$/.exec(msg);
    /* the validator evaluates each file alone; one that needs the page (KOS, KOS_CODE…) or holds no entries cannot be judged
       there — unless the page itself failed to load it, which A reports */
    if (fileMsg && /^(failed to eval:|registered zero KOS_CONTENT keys)/.test(fileMsg[2]) && !loadErrors.some((e) => e.indexOf(fileMsg[1] + ":") === 0)) { notCheckable++; return; }
    const keyMsg = /^(\S+?) — (.*)$/.exec(msg);
    const file = fileMsg ? fileMsg[1] : keyMsg ? (keyFile[keyMsg[1]] || "?") : "?";
    n++;
    hit("validatorErrors", file + " · " + msg);
  });
  assert(lines.length || r.status === 0, "the validator ran (" + (r.error ? r.error.message : "status " + r.status) + ")");
  const byFamily = {};
  Object.keys(found.validatorErrors || {}).forEach((k) => {
    const fam = k.split(" · ")[0].replace(/^js\/data\/content\//, "").replace(/-.*$/, "");
    byFamily[fam] = (byFamily[fam] || 0) + found.validatorErrors[k];
  });
  console.log("       " + n + " error(s) (" + Object.keys(byFamily).map((f) => f + " " + byFamily[f]).join(", ") + "); " +
    notCheckable + " file(s) the validator cannot evaluate alone (loaded in A instead)");
});

step("the ratchet: nothing new, nothing worse", () => {
  const CHECKS = ["nearDuplicateCards", "sameCardAcrossDecks", "markSchemes", "unknownCallouts", "duplicateIds", "duplicateSources", "validatorErrors"];
  if (WRITE) {
    const out = {
      _about: "smoke116: today's content violations, as counts by key, and each subject's multiple-choice A/B share. The suite fails only on a key " +
        "NOT listed, a count that grew, or a share that grew. Shrink this as W6 fixes the content; re-record with --write-baseline.",
      quizAB: {}
    };
    Object.keys(shares).sort().forEach((s) => { out.quizAB[s] = { n: shares[s].n, ab: shares[s].ab, share: shares[s].share }; });
    CHECKS.forEach((c) => {
      out[c] = {};
      Object.keys(found[c] || {}).sort().forEach((k) => { out[c][k] = found[c][k]; });
    });
    fs.mkdirSync(path.dirname(BASELINE), { recursive: true });
    fs.writeFileSync(BASELINE, JSON.stringify(out, null, 2) + "\n");
    console.log("       wrote " + path.relative(ROOT, BASELINE) + ": " + CHECKS.map((c) => c + " " + Object.keys(out[c]).length).join(", "));
    return;
  }
  assert(fs.existsSync(BASELINE), "the baseline exists (run with --write-baseline once)");
  const base = JSON.parse(fs.readFileSync(BASELINE, "utf8"));
  const fresh = [], fixed = [];
  CHECKS.forEach((c) => {
    const b = base[c] || {}, f = found[c] || {};
    Object.keys(f).forEach((k) => { if (f[k] > (b[k] || 0)) fresh.push(c + ": " + k + (b[k] ? " (" + b[k] + " → " + f[k] + ")" : "")); });
    Object.keys(b).forEach((k) => { if ((f[k] || 0) < b[k]) fixed.push(c + ": " + k + " (" + b[k] + " → " + (f[k] || 0) + ")"); });
  });
  Object.keys(shares).forEach((s) => {
    const b = (base.quizAB || {})[s];
    const now = shares[s].ab / shares[s].n;
    if (!b) { if (now > 0.5 + 1e-9) fresh.push("quizAB: " + s + " is new and keeps " + (100 * now).toFixed(1) + "% of answers at A or B"); return; }
    const was = b.ab / b.n;
    if (now > was + 1e-9) fresh.push("quizAB: " + s + " A/B share grew " + (100 * was).toFixed(2) + "% → " + (100 * now).toFixed(2) + "% (" + shares[s].ab + "/" + shares[s].n + ")");
    else if (now < was - 1e-9) fixed.push("quizAB: " + s + " " + (100 * was).toFixed(2) + "% → " + (100 * now).toFixed(2) + "%");
  });
  if (fixed.length) console.log("       FIXED (shrink the baseline, " + fixed.length + "):\n         " + fixed.slice(0, 40).join("\n         ") + (fixed.length > 40 ? "\n         …" : ""));
  assert(!fresh.length, fresh.length + " new content violation(s):\n         " + fresh.join("\n         "));
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + (e && e.message ? e.message : e)); }
  }
  console.log(failed ? "smoke116: " + failed + " failed" : "smoke116: all " + steps.length + " passed");
  process.exit(failed ? 1 : 0);
})();
