/* Kurenai OS — smoke82.test.js
   Japanese (roadmap 5.5): Stage 0's lesson content (js/data/content/ja-s0.js).

     A · THE PAGES. Every lesson has the design's six pages in order — Hook,
         Core idea, Listen & notice, Practice, Pitfalls, Quick reference
         (28e) — and nothing else; every block is a type the lesson page
         draws.
     B · THE DEPTH. A Hook with at least one voiced line; the Core idea's
         kana cards are exactly the lesson's own kana items; Listen & notice
         has a line or a minimal pair; Practice starts the practice; at least
         two Pitfalls; a Quick reference table with a row per kana or per
         pattern. Every line names one of the cast.
     C · THE ANSWERS CHECK (invariant 114). Every kana's romaji converts back
         to that kana (the homophones ぢ づ を, their katakana and the
         loanword sounds whose romaji is a native kana's are accepted as typed); every written kana has its stroke
         data and passes its own KanjiVG reference; every facet of every
         lesson builds an exercise; every minimal pair is two different
         words.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke82.test.js                                            */
"use strict";
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
const PAGES = ["Hook", "Core idea", "Listen & notice", "Practice", "Pitfalls", "Quick reference"];
const BLOCKS = ["h", "p", "line", "kana", "pair", "callout", "table", "go"];
/* typed as listed and accepted as typed: the homophones, and the loanword sounds whose usual
   romaji is already a native kana's (ti is ち, di ぢ, tu つ, du づ, wo を) */
const HOMOPHONES = ["ぢ", "づ", "を", "ヂ", "ヅ", "ヲ", "ティ", "ディ", "トゥ", "ドゥ", "ウォ"];

function lessons(app) { return Object.keys(app.window.KOS_JA.LESSONS); }
function content(app, ref) { return app.window.KOS_CONTENT["ja:" + ref]; }
function blocks(page, type) { return page.blocks.filter((b) => b[type] !== undefined); }

step("A · every lesson has the six pages in order, of known blocks", (app) => {
  const L = lessons(app);
  assert(L.length === 16, "sixteen Stage 0 lessons, got " + L.length);
  L.forEach((ref) => {
    const c = content(app, ref);
    assert(c && Array.isArray(c.pages), ref + " has no pages");
    assert(JSON.stringify(c.pages.map((p) => p.t)) === JSON.stringify(PAGES), ref + " pages: " + c.pages.map((p) => p.t).join(", "));
    c.pages.forEach((p) => p.blocks.forEach((b) => {
      const keys = Object.keys(b).filter((k) => k !== "mnemo");
      assert(keys.length === 1 && BLOCKS.indexOf(keys[0]) >= 0, ref + " " + p.t + ": an unknown block " + JSON.stringify(b).slice(0, 60));
    }));
  });
});

step("B · each page carries what the contract asks for", (app) => {
  const CAST = Object.keys(app.KOS.jaUI.CAST);
  lessons(app).forEach((ref) => {
    const P = content(app, ref).pages, L = app.window.KOS_JA.LESSONS[ref];
    assert(blocks(P[0], "line").length >= 1, ref + ": the Hook has no voiced line");
    const kana = L.items.filter((k) => /^k:/.test(k)).map((k) => k.slice(2));
    const cards = blocks(P[1], "kana");
    assert(cards.length === 1 && JSON.stringify(cards[0].kana) === JSON.stringify(kana), ref + ": the Core idea's cards are not the lesson's kana");
    assert(blocks(P[2], "line").length + blocks(P[2], "pair").length >= 1, ref + ": Listen & notice has nothing to hear");
    assert(blocks(P[3], "go").length === 1, ref + ": Practice does not start the practice");
    assert(blocks(P[4], "callout").length >= 2, ref + ": fewer than two pitfalls");
    const t = blocks(P[5], "table");
    assert(t.length === 1 && t[0].table.rows.length >= 3 && t[0].table.rows.every((r) => r.length === t[0].table.head.length), ref + ": the Quick reference table is short or ragged");
    P.forEach((p) => blocks(p, "line").forEach((b) => assert(CAST.indexOf(b.line.who) >= 0 && b.line.ja, ref + ": a line with no speaker or text")));
  });
});

step("C · every answer checks against its own validator", (app) => {
  const K = app.KOS, J = app.window.KOS_JA;
  Object.keys(J.ITEMS).filter((k) => /^k:/.test(k)).forEach((k) => {
    const it = J.ITEMS[k];
    if (it.w === "ー" || HOMOPHONES.indexOf(it.w) >= 0 || /^[ぁぃぅぇぉゃゅょっァィゥェォャュョッ]$/.test(it.w)) return;
    const got = K.jaKana.toHiragana(K.jaKana.toKana(it.r));
    assert(got === K.jaKana.toHiragana(it.w), k + ": typing " + it.r + " gives " + got);
  });
  lessons(app).forEach((ref) => {
    const L = J.LESSONS[ref];
    L.produce.forEach((k) => {
      const ch = k.slice(2), strokes = K.jaStrokes[ch];
      assert(strokes && strokes.length, ch + " has no stroke data");
      const r = K.jaStroke.check(ch, strokes.map((d) => K.jaStroke.parse(d)));
      assert(r.verdict === "correct", ch + ": its own reference does not pass (" + r.verdict + ")");
    });
    L.items.forEach((item) => K.jaSrs.facetsFor(item, {}, { produces: K.ja.produces }).forEach((s) => {
      assert(K.jaRun.exercise(item + "|" + s), ref + ": " + item + "|" + s + " builds no exercise");
    }));
  });
  Object.keys(J.ITEMS).filter((k) => /^s:/.test(k)).forEach((k) => J.ITEMS[k].pairs.forEach((p) => assert(p.length === 2 && p[0] !== p[1], k + ": a pair of one word")));
});

(async () => {
  let failed = 0;
  const app = await boot();
  for (const [name, fn] of steps) {
    try { await fn(app); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + e.message); }
  }
  console.log("\n" + "=".repeat(30));
  if (failed) { console.log("SMOKE82 FAIL — " + failed + " step(s)"); process.exit(1); }
  console.log("SMOKE82 PASS — Stage 0's lessons and their answers (" + steps.length + " steps).");
})();
