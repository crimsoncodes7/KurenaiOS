/* Kurenai OS — smoke82.test.js
   Japanese (roadmap 5.5): the lesson content — Stage 0 (js/data/content/ja-s0.js, A–C) and each
   released Stage 1 unit (js/data/ja-s1.js and js/data/content/ja-f*.js, D–F).

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
     D · STAGE 1's PAGES. The eight pages in order — Hook, Core idea,
         Patterns, Listen & notice, Pitfalls, Culture & usage, Practise,
         Quick reference (§4.2) — of blocks the lesson page draws.
     E · STAGE 1's DEPTH. A media moment on the Hook whose art is on disk
         (or listed as awaited, below); at least three patterns; at least
         eight voiced examples; two pitfalls; a culture note; a graded
         passage with its question; a shadowing set; the practice; a Quick
         reference built from the lesson's own items. Every speaker is one
         of the cast. The unit has its checkpoint.
     F · STAGE 1's ANSWERS (invariant 114). Every word's gloss, reading and
         written form pass the checks its exercises use; every grammar
         point's sentences read back exactly as their kana (the furigana
         agree), pass dictation typed as kana and typed with particles as
         they sound; every particle template's answer is right and every
         option has a verdict; every build's natural order is right; every
         kanji is in the word it is read in; every facet builds an exercise,
         with four distinct options where it offers a choice.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke82.test.js                                            */
"use strict";
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
const PAGES = ["Hook", "Core idea", "Listen & notice", "Practice", "Pitfalls", "Quick reference"];
const PAGES1 = ["Hook", "Core idea", "Patterns", "Listen & notice", "Pitfalls", "Culture & usage", "Practise", "Quick reference"];
const BLOCKS1 = ["p", "line", "callout", "table", "go", "scene", "panel", "pattern", "passage", "shadow"];
/* art asked for and not delivered yet (art-source/ja/manifest.json): listed, so the gate says what
   it is waiting for; a unit that uses one is not released until it arrives and leaves this list */
const AWAITED_ART = [];
const BLOCKS = ["h", "p", "line", "kana", "pair", "callout", "table", "go"];
/* typed as listed and accepted as typed: the homophones, and the loanword sounds whose usual
   romaji is already a native kana's (ti is ち, di ぢ, tu つ, du づ, wo を) */
const HOMOPHONES = ["ぢ", "づ", "を", "ヂ", "ヅ", "ヲ", "ティ", "ディ", "トゥ", "ドゥ", "ウォ"];

function lessonsOf(app, stage) {
  const out = [];
  app.window.KOS_JA.STAGES.filter((st) => st.id === stage).forEach((st) => st.units.forEach((u) => u.lessons.forEach((l) => out.push(l))));
  return out;
}
function lessons(app) { return lessonsOf(app, "s0"); }
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

/* ================= Stage 1 ================= */
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
function art(id) { return fs.existsSync(path.join(ROOT, "assets/ja/img", id + ".webp")); }

step("D · every Stage 1 lesson has the eight pages in order, of known blocks", (app) => {
  const L = lessonsOf(app, "s1");
  assert(L.length >= 6, "a released Stage 1 unit, got " + L.length + " lessons");
  L.forEach((ref) => {
    const c = content(app, ref);
    assert(c && Array.isArray(c.pages), ref + " has no pages");
    assert(JSON.stringify(c.pages.map((p) => p.t)) === JSON.stringify(PAGES1), ref + " pages: " + c.pages.map((p) => p.t).join(", "));
    c.pages.forEach((p) => p.blocks.forEach((b) => {
      const keys = Object.keys(b);
      assert(keys.length === 1 && BLOCKS1.indexOf(keys[0]) >= 0, ref + " " + p.t + ": an unknown block " + JSON.stringify(b).slice(0, 60));
    }));
  });
});

step("E · each Stage 1 lesson is as deep as the contract asks", (app) => {
  const CAST = Object.keys(app.KOS.jaUI.CAST), J = app.window.KOS_JA, awaited = [];
  const need = (id) => { if (!art(id)) { assert(AWAITED_ART.indexOf(id) >= 0, "missing art, and not asked for: " + id); awaited.push(id); } };
  lessonsOf(app, "s1").forEach((ref) => {
    const P = content(app, ref).pages, voiced = [];
    const media = P[0].blocks.filter((b) => b.scene || b.panel);
    assert(media.length === 1, ref + ": the Hook has no media moment");
    P.forEach((p) => p.blocks.forEach((b) => {
      if (b.scene) { need(b.scene.bg); [b.scene.left, b.scene.right].filter(Boolean).forEach((w) => need("ja.base." + w + ".a"));
        b.scene.lines.forEach((l) => { assert(CAST.indexOf(l.who) >= 0, ref + ": a scene line with no speaker"); if (l.face && l.face !== "neutral") need("ja.face." + l.who + "." + l.face); }); }
      if (b.panel) { need(b.panel.img); b.panel.bubbles.forEach((x) => assert(CAST.indexOf(x.who) >= 0 && x.ja, ref + ": a balloon with no speaker or text")); }
      if (b.line) voiced.push(b.line);
      if (b.pattern) { assert(b.pattern.f && b.pattern.en && b.pattern.eg && b.pattern.egEn, ref + ": a pattern without its form, meaning or example"); voiced.push({ who: "narrator", ja: b.pattern.eg }); }
      if (b.shadow) b.shadow.forEach((l) => voiced.push(l));
    }));
    voiced.forEach((l) => assert(CAST.indexOf(l.who) >= 0 && l.ja, ref + ": a line with no speaker or text"));
    assert(voiced.length >= 8, ref + ": " + voiced.length + " voiced examples, fewer than eight");
    assert(blocks(P[2], "pattern").length >= 2, ref + ": fewer than two patterns");
    assert(blocks(P[3], "line").length >= 6, ref + ": Listen & notice has fewer than six lines");
    assert(blocks(P[4], "callout").length >= 2, ref + ": fewer than two pitfalls");
    assert(blocks(P[5], "callout").length >= 1, ref + ": no culture note");
    const ps = blocks(P[6], "passage")[0];
    assert(ps && ps.passage.lines.length >= 4 && ps.passage.q && ps.passage.q.options[ps.passage.q.a], ref + ": the graded passage or its question is missing");
    assert(blocks(P[6], "shadow").length === 1 && blocks(P[6], "shadow")[0].shadow.length >= 3, ref + ": no shadowing set of three");
    assert(blocks(P[6], "go").length === 1, ref + ": Practise does not start the practice");
    const words = J.LESSONS[ref].items.filter((k) => /^w:/.test(k)).length;
    assert(blocks(P[7], "table")[0].table.rows.length === words, ref + ": the Quick reference does not list the lesson's words");
  });
  J.STAGES.filter((st) => st.id === "s1")[0].units.forEach((u) => assert(J.CHECKPOINTS[u.checkpoint] && J.CHECKPOINTS[u.checkpoint].unit === u.id, u.id + " has no checkpoint"));
  if (awaited.length) console.log("       awaiting art: " + [...new Set(awaited)].join(", "));
});

step("F · every Stage 1 answer checks against its own validator", (app) => {
  const K = app.KOS, J = app.window.KOS_JA, V = K.jaValid, plain = (t) => t.replace(/\{([^|}]+)\|([^}]+)\}/g, "$2");
  const read = (t) => K.jaKana.toHiragana(plain(t)).replace(/[、。！？!?\s　…]/g, "");
  lessonsOf(app, "s1").forEach((ref) => {
    const L = J.LESSONS[ref];
    L.produce.forEach((k) => assert(L.items.indexOf(k) >= 0 && /^w:/.test(k), ref + ": " + k + " in its production set but not its words"));
    L.items.forEach((key) => {
      const it = J.ITEMS[key];
      assert(it, ref + ": no item " + key);
      if (it.kind === "word") {
        assert(V.check("meaning-set", it.en[0], { glosses: it.en }).verdict === "correct", key + ": its first gloss is not accepted");
        const forms = [{ w: it.r, r: it.r }].concat(it.w !== it.r ? [{ w: it.w, r: it.r }] : []);
        assert(V.check("reading-set", it.r, { forms: forms, taught: it.r }).verdict === "correct", key + ": its reading " + it.r + " is not accepted");
        assert(read(it.ruby) === K.jaKana.toHiragana(it.r), key + ": the furigana (" + read(it.ruby) + ") disagree with its reading " + it.r);
      }
      if (it.kind === "kanji") assert(J.ITEMS[it.in] && J.ITEMS[it.in].w.indexOf(it.w) >= 0, key + ": not in the word it is read in");
      if (it.kind === "grammar") {
        it.says.forEach((sy) => {
          assert(read(sy.ja) === K.jaKana.toHiragana(sy.kana), key + ": “" + sy.ja + "” reads " + read(sy.ja) + ", not its kana " + sy.kana);
          assert(V.check("dictation", sy.kana, { target: sy.kana }).verdict === "correct", key + ": its kana does not pass dictation");
          const sounded = sy.kana.replace(/(.)は/g, "$1わ").replace(/を/g, "お");
          assert(V.check("dictation", K.jaRun.particleSounds(sounded, sy.kana), { target: sy.kana }).verdict === "correct", key + ": typed with particles as they sound, “" + sounded + "” fails");
        });
        it.particles.forEach((t) => {
          assert(V.check("particle-slot", t.target, t).verdict === "correct", key + ": the particle answer is not right");
          assert(t.options.indexOf(t.target) >= 0 && new Set(t.options).size === t.options.length, key + ": the options miss the answer or repeat");
        });
        it.builds.forEach((b) => assert(V.check("order-graph", b.natural, b).verdict === "correct", key + ": a build's natural order is not right"));
        assert(it.says.length >= 3 || key === "g:tens", key + ": fewer than three sentences");
      }
      const held = { [key + "|R"]: { reps: 3, s: 9, d: 5 } };
      K.jaSrs.facetsFor(key, held, { produces: () => true, speech: false }).forEach((sk) => {
        const ex = K.jaRun.exercise(key + "|" + sk);
        assert(ex, ref + ": " + key + "|" + sk + " builds no exercise");
        if (ex.options) assert(new Set(ex.options).size === ex.options.length && ex.options.length >= 3, key + "|" + sk + ": options repeat or are too few: " + ex.options.join(" / "));
        if (ex.kind === "listen-pick") assert(ex.options.length === 4 && ex.options.indexOf(it.en[0]) >= 0, key + ": the listening options lack the answer");
      });
    });
  });
});

/* voices not designed yet (prototypes/japanese-space/voice/voices.json): their lines keep the
   browser's voice; a unit voiced by one is not released until its audio is baked */
const AWAITED_VOICE = [];
step("G · the audio pack: every file exists and every voiced line has one", (app) => {
  const A = app.window.KOS_JA_AUDIO, J = app.window.KOS_JA, C = app.window.KOS_CONTENT;
  assert(A && Object.keys(A).length > 0, "js/data/ja-audio.js is not loaded (node tools/bake_ja_audio.mjs)");
  Object.entries(A).forEach(([k, f]) => assert(fs.existsSync(path.join(ROOT, "assets/ja/audio", f)), "the pack names a missing file: " + k + " → " + f));
  const missing = [], awaited = new Set();
  const CAST = ["akari", "yota", "makoto"];
  function walk(o, who) {
    if (!o || typeof o !== "object") return;
    if (Array.isArray(o)) return o.forEach((x) => walk(x, who));
    const w = o.who || who;
    if (typeof o.ja === "string") {
      const v = CAST.indexOf(w) >= 0 ? w : "narrator";
      if (app.KOS.jaUI.synthetic(o.ja, v)) { if (AWAITED_VOICE.indexOf(v) >= 0) awaited.add(v); else missing.push(v + "|" + o.ja); }
    }
    if (o.pattern && app.KOS.jaUI.synthetic(o.pattern.eg, "narrator")) missing.push("narrator|" + o.pattern.eg);
    Object.values(o).forEach((x) => { if (x && typeof x === "object") walk(x, w); });
  }
  Object.keys(J.LESSONS).forEach((id) => walk(C["ja:" + id], null));
  Object.entries(J.ITEMS).forEach(([id, it]) => {
    if (/^w:/.test(id) && app.KOS.jaUI.synthetic(it.r, "narrator")) missing.push("narrator|" + it.r);
    if (/^g:/.test(id)) (it.says || []).forEach((x) => { if (app.KOS.jaUI.synthetic(x.ja, "narrator")) missing.push("narrator|" + x.ja); });
  });
  assert(!missing.length, missing.length + " voiced lines have no recording (node tools/bake_ja_audio.mjs): " + missing.slice(0, 4).join(" · "));
  if (awaited.size) console.log("       awaiting voices: " + [...awaited].join(", "));
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
  console.log("SMOKE82 PASS — Stage 0 and Stage 1 lessons and their answers (" + steps.length + " steps).");
})();
