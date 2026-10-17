/* The exercise engine (docs/japanese-plan.md §5): one schema, many renderers.
   JA.ex.forFacet(key, seed) builds an exercise for an item × skill; JA.ex.render(host, ex, done)
   draws it and reports {verdict, ms, hints, tries, selfMarked}. Throwaway slice code. */
(function (G) {
  "use strict";
  var JA = G.JA = G.JA || {};
  var K = JA.kana;

  // ---------- small helpers shared with app.js ----------
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    for (var k in attrs || {}) {
      var v = attrs[k];
      if (v == null || v === false) continue;
      if (k === "text") n.textContent = v;
      else if (k === "html") n.innerHTML = v;
      else if (k.slice(0, 2) === "on") n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? "" : v);
    }
    (kids || []).forEach(function (c) { if (c != null && c !== false) n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  }
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function pick(list, seed) { return list[hash(String(seed)) % list.length]; }
  function shuffle(list, seed) {
    var a = list.slice(), h = hash(String(seed));
    for (var i = a.length - 1; i > 0; i--) { h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0; var j = h % (i + 1); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  /* Ruby: "{本|ほん}" → <ruby>. Furigana show by mastery (plan §6): `known(kanji)` says whether the
     reader has made that reading stable; mode "all" | "unknown" | "none". */
  function ruby(text, known, mode) {
    var frag = el("span", { lang: "ja" });
    String(text).split(/(\{[^}]+\})/).forEach(function (part) {
      var m = /^\{([^|]+)\|([^}]+)\}$/.exec(part);
      if (!m) { if (part) frag.appendChild(document.createTextNode(part)); return; }
      var show = mode === "all" || (mode !== "none" && !(known && known(m[1])));
      frag.appendChild(show ? el("ruby", {}, [m[1], el("rt", { text: m[2] })]) : document.createTextNode(m[1]));
    });
    return frag;
  }
  function plain(text) { return String(text).replace(/\{([^|]+)\|[^}]+\}/g, "$1"); }

  // ---------- audio: the browser's Japanese voice (VOICEVOX files replace it later, plan §4.4) ----------
  var voice = null;
  function pickVoice() {
    if (!G.speechSynthesis) return null;
    var vs = speechSynthesis.getVoices().filter(function (v) { return /^ja/i.test(v.lang); });
    return vs.filter(function (v) { return /Kyoko|O-ren|Google|Siri/i.test(v.name); })[0] || vs[0] || null;
  }
  if (G.speechSynthesis) { voice = pickVoice(); speechSynthesis.onvoiceschanged = function () { voice = pickVoice(); }; }
  function say(text, rate) {
    if (!G.speechSynthesis) return false;
    speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(plain(text));
    u.lang = "ja-JP"; if (voice) u.voice = voice; u.rate = rate || 0.9;
    speechSynthesis.speak(u);
    return true;
  }
  function audioBtn(text, label) {
    var rate = 0.9;
    return el("span", { class: "aud" }, [
      el("button", { class: "btn icon", type: "button", "aria-label": label || "Play", onclick: function () { say(text, rate); } }, ["▶"]),
      el("button", { class: "btn icon slow", type: "button", "aria-label": "Play slowly", onclick: function () { say(text, 0.6); } }, ["0.6×"])
    ]);
  }

  // ---------- building an exercise for a facet ----------
  var I = function (k) { return JA.items[k]; };
  function wordsLike(item) { return Object.keys(JA.items).filter(function (k) { return k.split(":")[0] === item.split(":")[0] && k !== item; }); }

  function forFacet(fk, seed) {
    var p = JA.srs.split(fk), it = I(p.item), kind = p.item.split(":")[0], sk = p.skill;
    seed = fk + ":" + (seed || 0);
    if (kind === "k") {
      if (sk === "R") return { id: fk, kind: "kana-read", skills: ["R"], items: [p.item], prompt: { big: it.w }, ask: "Type how it is read (romaji or kana).",
        answer: { strategy: "exact-kana", target: it.w }, model: it.romaji, targetMs: 3000, hint: it.hint };
      return { id: fk, kind: "kana-write", skills: ["W"], items: [p.item], prompt: { audio: it.w, text: it.romaji }, ask: "Write the kana for this sound, stroke by stroke.",
        answer: { strategy: "stroke", target: it.w }, typed: { strategy: "exact-kana", target: it.w }, model: it.w, targetMs: 9000, hint: it.hint };
    }
    if (kind === "w" || kind === "j") {
      if (sk === "R") return { id: fk, kind: "word-meaning", skills: ["R"], items: [p.item], prompt: { big: it.w, sub: kind === "j" ? "kanji" : null }, ask: "What does it mean? (English)",
        answer: { strategy: "meaning-set", glosses: it.en }, model: it.en.join(" · "), targetMs: 6000, english: true, hint: "Reading: " + it.r };
      if (sk === "L") {
        var opts = shuffle([p.item].concat(shuffle(wordsLike(p.item), seed).slice(0, 3)), seed + "o");
        return { id: fk, kind: "listen-pick", skills: ["L"], items: [p.item], prompt: { audio: it.w }, ask: "Listen. Which meaning?",
          options: opts.map(function (k) { return { label: I(k).en[0], ok: k === p.item }; }), model: it.w + " — " + it.en[0], targetMs: 6000 };
      }
      if (sk === "W") return { id: fk, kind: "meaning-word", skills: ["W"], items: [p.item], prompt: { text: "“" + it.en[0] + "”" }, ask: "Type it in Japanese (romaji turns into kana).",
        answer: { strategy: "reading-set", forms: [{ w: it.w, r: it.r }], taught: it.w }, model: it.w + (it.w !== it.r ? " (" + it.r + ")" : ""), targetMs: 8000, hint: "It starts with " + K.morae(it.r)[0] };
      return { id: fk, kind: "say-it", skills: ["S"], items: [p.item], prompt: { text: "“" + it.en[0] + "”" }, ask: "Say it in Japanese.",
        answer: { strategy: "dictation", target: it.r, alt: [it.w] }, model: it.w, targetMs: 8000 };
    }
    if (kind === "g") {
      if (sk === "R") {
        if (p.item === "g:kosoa" || !JA.builds[p.item]) {
          var pt = pick(JA.particles, seed);
          return { id: fk, kind: "particle-pick", skills: ["R"], items: [p.item], prompt: { gap: pt }, ask: "Choose the particle. “" + pt.en + "”",
            options: pt.options.map(function (o) { return { label: o, value: o }; }), answer: { strategy: "particle-slot", target: pt.target, accept: pt.accept, wrong: pt.wrong },
            model: pt.before + pt.target + plain(pt.after), targetMs: 6000 };
        }
        var b = pick(JA.builds[p.item], seed);
        return { id: fk, kind: "build-sentence", skills: ["R", "W"], items: [p.item], prompt: { text: b.en }, ask: "Put the tiles in order.",
          tiles: shuffle(b.chunks, seed + "t"), answer: Object.assign({ strategy: "order-graph" }, b), model: b.natural.map(function (id) { return b.chunks.filter(function (c) { return c.id === id; })[0].t; }).join(""), targetMs: 12000 };
      }
      if (sk === "L") {
        var s = pick(JA.sentences, seed);
        return { id: fk, kind: "dictation", skills: ["L", "W"], items: [p.item], prompt: { audio: s.ja }, ask: "Listen and type what you hear (kana or romaji).",
          answer: { strategy: "dictation", target: s.kana, alt: [s.kana.replace(/は(?=[^ぁ-ん]|$)/, "わ")] }, model: plain(s.ja), en: s.en, targetMs: 15000 };
      }
      var t = pick(JA.translations[p.item] || JA.translations["g:wa-desu"], seed);
      return { id: fk, kind: "translate-en-ja", skills: ["W"], items: [p.item], prompt: { text: t.en }, ask: "Write it in Japanese.",
        answer: { strategy: "dictation", target: t.target }, model: t.target, targetMs: 15000,
        note: "Checked by sound (mora by mora) until the tokeniser spike lands; then by words and grammar." };
    }
    return null;
  }

  // a minimal-pair item for the listening block (sound contrasts, plan §5 D)
  function minimalPair(seed) {
    var pr = pick(JA.pairs, seed), which = hash(seed + "w") % 2;
    return { id: "pair:" + pr[0], kind: "minimal-pair", skills: ["L"], items: [], prompt: { audio: pr[which] }, ask: "Which did you hear?",
      options: [{ label: pr[0] + " · " + pr[2], ok: which === 0 }, { label: pr[1] + " · " + pr[3], ok: which === 1 }], model: pr[which], targetMs: 5000 };
  }

  // ---------- rendering ----------
  var VERDICT = { correct: ["✓", "Correct"], accepted: ["✓", "Accepted"], near: ["≈", "Nearly"], wrong: ["✗", "Not quite"], self: ["◐", "Self-marked"] };

  function render(host, ex, done, opts) {
    opts = opts || {};
    var t0 = Date.now(), hints = 0, tries = 0, finished = false;
    host.innerHTML = "";
    var card = el("article", { class: "card ex", "data-kind": ex.kind, "data-id": ex.id });
    card._ex = ex;
    var head = el("header", { class: "ex-head" }, [
      el("span", { class: "chip", text: ex.kind.replace(/-/g, " ") }),
      el("span", { class: "skills" }, ex.skills.map(function (s) { return el("span", { class: "sk sk-" + s, title: { R: "Reading", W: "Writing", L: "Listening", S: "Speaking" }[s], text: s }); }))
    ]);
    var prompt = el("div", { class: "ex-prompt" });
    if (ex.prompt.big) prompt.appendChild(el("div", { class: "big", lang: "ja", text: ex.prompt.big }));
    if (ex.prompt.sub) prompt.appendChild(el("div", { class: "muted", text: ex.prompt.sub }));
    if (ex.prompt.text) prompt.appendChild(el("div", { class: "ptext", text: ex.prompt.text }));
    if (ex.prompt.gap) prompt.appendChild(el("div", { class: "gap", lang: "ja" }, [ex.prompt.gap.before, el("span", { class: "slot", "aria-label": "blank", text: "？" }), ruby(ex.prompt.gap.after, opts.known, opts.furigana)]));
    if (ex.prompt.audio) {
      prompt.appendChild(el("div", { class: "listen" }, [audioBtn(ex.prompt.audio, "Play the audio"), el("span", { class: "muted", text: G.speechSynthesis ? "" : "No Japanese voice in this browser." })]));
      setTimeout(function () { say(ex.prompt.audio); }, 250);
    }
    var ask = el("p", { class: "ask", text: ex.ask });
    var area = el("div", { class: "ex-area" });
    var verdictBox = el("div", { class: "verdict", role: "status", "aria-live": "polite" });
    var foot = el("div", { class: "ex-foot" });
    card.appendChild(head); card.appendChild(prompt); card.appendChild(ask); card.appendChild(area); card.appendChild(verdictBox); card.appendChild(foot);
    if (ex.note) card.appendChild(el("p", { class: "note muted", text: ex.note }));
    host.appendChild(card);

    function finish(res) {
      if (finished) return; finished = true;
      res.ms = Date.now() - t0; res.hints = hints; res.tries = tries;
      foot.innerHTML = "";
      var next = el("button", { class: "btn primary", type: "button", onclick: function () { done(res); } }, ["Continue"]);
      foot.appendChild(next); next.focus();
    }
    function show(res, final) {
      var v = VERDICT[res.verdict] || VERDICT.wrong;
      verdictBox.className = "verdict v-" + res.verdict;
      verdictBox.innerHTML = "";
      verdictBox.appendChild(el("div", { class: "v-line" }, [el("b", {}, [v[0] + " " + v[1]]), res.normalised && res.verdict !== "correct" ? el("span", { class: "muted", lang: "ja", text: " you wrote " + res.normalised }) : null]));
      if (res.note) verdictBox.appendChild(el("p", { text: res.note }));
      if (res.diagnosis) verdictBox.appendChild(el("p", { class: "diag" }, [el("span", { class: "chip", text: res.diagnosis.code }), " " + res.diagnosis.explain]));
      if (final && res.verdict !== "correct") verdictBox.appendChild(el("p", { class: "model" }, ["Answer: ", el("span", { lang: "ja", text: ex.model })]));
      if (final && ex.en) verdictBox.appendChild(el("p", { class: "muted", text: ex.en }));
      if (final && (ex.prompt.audio || ex.kind === "say-it")) verdictBox.appendChild(audioBtn(ex.prompt.audio || ex.model, "Play the answer"));
    }
    function judge(res) {
      tries++;
      if (res.verdict === "near" && tries === 1) { show(res, false); verdictBox.appendChild(el("p", { class: "muted", text: "One more try." })); return false; }
      show(res, true); finish(res); return true;
    }

    // --- typed answers (with live romaji → kana unless the answer is English) ---
    if (ex.answer && ["exact-kana", "reading-set", "meaning-set", "dictation", "conjugation"].indexOf(ex.answer.strategy) >= 0 && ex.kind !== "say-it") {
      var inp = el("input", { type: "text", class: "ans", lang: ex.english ? "en" : "ja", autocomplete: "off", autocapitalize: "off", spellcheck: "false", "aria-label": "Your answer" });
      var preview = el("div", { class: "preview muted", lang: "ja", "aria-hidden": "true" });
      inp.addEventListener("input", function () {
        preview.textContent = !ex.english && K.hasRomaji(inp.value) ? "→ " + JA.valid.normalise(inp.value, { script: ex.answer.script, fold: false }) : "";
      });
      var check = el("button", { class: "btn primary", type: "button", onclick: go }, ["Check"]);
      inp.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); if (!finished) go(); } });
      area.appendChild(el("div", { class: "row" }, [inp, check])); area.appendChild(preview);
      function go() { if (!inp.value.trim() || finished) return; var r = JA.valid.check(ex.answer.strategy, inp.value, ex.answer); if (!judge(r)) { inp.select(); } else { inp.disabled = true; check.disabled = true; } }
      setTimeout(function () { inp.focus(); }, 0);
    }

    // --- handwriting (a stroke check; typing is the fallback and counts as a hint) ---
    if (ex.answer && ex.answer.strategy === "stroke") {
      var pad = JA.writePad({ ch: ex.answer.target, guide: !!ex.guide, label: "Write here with a mouse, pen or finger", onChange: function (n) { wcheck.disabled = !n; } });
      var wcheck = el("button", { class: "btn primary", type: "button", disabled: true, onclick: function () {
        if (finished) return;
        var r = JA.valid.check("stroke", pad.strokes(), ex.answer);
        pad.mark(r);
        if (!judge(r)) { pad.lock(); retry.hidden = false; } else { pad.lock(); }
      } }, ["Check"]);
      var retry = el("button", { class: "btn", type: "button", hidden: true, onclick: function () { pad.clear(); retry.hidden = true; } }, ["Write it again"]);
      var typed = el("button", { class: "btn ghost", type: "button", onclick: function () {
        hints++; padWrap.hidden = true; typed.hidden = true;
        var ti = el("input", { type: "text", class: "ans", lang: "ja", "aria-label": "Type the kana", autocomplete: "off" });
        var tb = el("button", { class: "btn primary", type: "button", onclick: function () { if (ti.value.trim()) judge(JA.valid.check(ex.typed.strategy, ti.value, ex.typed)); } }, ["Check"]);
        ti.addEventListener("keydown", function (e) { if (e.key === "Enter") tb.click(); });
        area.appendChild(el("div", { class: "row" }, [ti, tb])); ti.focus();
      } }, ["Type instead"]);
      var padWrap = el("div", { class: "pad-wrap" }, [pad.node, el("div", { class: "pad-tools" }, [
        wcheck, retry,
        el("button", { class: "btn", type: "button", onclick: function () { pad.undo(); } }, ["Undo"]),
        el("button", { class: "btn", type: "button", onclick: function () { pad.clear(); } }, ["Clear"]),
        el("button", { class: "btn ghost", type: "button", onclick: function () { hints++; pad.animate(); } }, ["Show the strokes"]),
        typed
      ])]);
      area.appendChild(padWrap);
    }

    // --- choices (listen-pick, minimal pairs, particles) ---
    if (ex.options) {
      var group = el("div", { class: "opts", role: "group", "aria-label": "Options" });
      ex.options.forEach(function (o, i) {
        group.appendChild(el("button", { class: "btn opt", type: "button", lang: ex.kind === "particle-pick" ? "ja" : null, onclick: function (e) {
          if (finished) return;
          var r = ex.answer ? JA.valid.check(ex.answer.strategy, o.value, ex.answer) : { verdict: o.ok ? "correct" : "wrong" };
          e.currentTarget.setAttribute("data-picked", r.verdict);
          if (judge(r)) Array.prototype.forEach.call(group.children, function (b) { b.disabled = true; });
        } }, [el("span", { class: "k", text: String(i + 1) }), o.label]));
      });
      area.appendChild(group);
      card.addEventListener("keydown", function (e) { var n = +e.key; if (n >= 1 && n <= ex.options.length && !finished && e.target.tagName !== "INPUT") group.children[n - 1].click(); });
      setTimeout(function () { group.children[0].focus(); }, 0);
    }

    // --- tiles (build-sentence) ---
    if (ex.tiles) {
      var line = el("div", { class: "tiles line", "aria-label": "Your sentence", role: "group" });
      var bank = el("div", { class: "tiles bank", "aria-label": "Tiles", role: "group" });
      var order = [];
      function draw() {
        line.innerHTML = ""; bank.innerHTML = "";
        order.forEach(function (id, i) { var c = ex.tiles.filter(function (t) { return t.id === id; })[0];
          line.appendChild(el("button", { class: "tile", type: "button", lang: "ja", "aria-label": c.t + ", remove", onclick: function () { if (finished) return; order.splice(i, 1); draw(); } }, [c.t])); });
        if (!order.length) line.appendChild(el("span", { class: "muted", text: "Tap tiles to build the sentence." }));
        ex.tiles.forEach(function (c) { if (order.indexOf(c.id) >= 0) return;
          bank.appendChild(el("button", { class: "tile", type: "button", lang: "ja", onclick: function () { if (finished) return; order.push(c.id); draw(); } }, [c.t])); });
      }
      draw();
      area.appendChild(line); area.appendChild(bank);
      area.appendChild(el("div", { class: "row end" }, [el("button", { class: "btn primary", type: "button", onclick: function () {
        if (finished || order.length < ex.tiles.length) return; if (judge(JA.valid.check("order-graph", order, ex.answer))) draw();
      } }, ["Check"])]));
    }

    // --- speaking (browser recognition when present; otherwise record and self-mark) ---
    if (ex.kind === "say-it") {
      var SR = G.SpeechRecognition || G.webkitSpeechRecognition;
      var status = el("p", { class: "muted", "aria-live": "polite" });
      var mic = el("button", { class: "btn primary mic", type: "button" }, ["● Speak"]);
      area.appendChild(el("div", { class: "row" }, [mic, status]));
      if (SR) {
        mic.addEventListener("click", function () {
          if (finished) return;
          var rec = new SR(); rec.lang = "ja-JP"; rec.interimResults = false; rec.maxAlternatives = 3;
          mic.setAttribute("data-rec", "1"); mic.textContent = "■ Listening…"; status.textContent = "Speak now.";
          rec.onresult = function (e) {
            var alts = Array.prototype.map.call(e.results[0], function (a) { return a.transcript; });
            var best = null;
            alts.forEach(function (t) { var r = JA.valid.check("dictation", t, ex.answer); r.heard = t; if (!best || rank(r) > rank(best)) best = r; });
            status.textContent = "Heard: " + best.heard;
            judge(best);
          };
          rec.onerror = function (e) { status.textContent = "Recognition failed (" + e.error + "). Try again, or mark it yourself."; };
          rec.onend = function () { mic.removeAttribute("data-rec"); mic.textContent = "● Speak"; };
          rec.start();
        });
      } else {
        status.textContent = "No speech recognition in this browser: say it aloud, compare, and mark it yourself.";
        mic.textContent = "Show the answer";
        mic.addEventListener("click", function () {
          if (finished) return;
          show({ verdict: "self" }, true);
          foot.innerHTML = "";
          foot.appendChild(el("div", { class: "row" }, [
            el("button", { class: "btn", type: "button", onclick: function () { finish({ verdict: "wrong", selfMarked: true }); } }, ["I missed it"]),
            el("button", { class: "btn", type: "button", onclick: function () { finish({ verdict: "accepted", selfMarked: true }); } }, ["I said it"])
          ]));
        });
      }
    }
    if (ex.kind === "say-it") foot.appendChild(el("button", { class: "btn ghost", type: "button", onclick: function () {
      if (finished) return; finished = true; done({ verdict: "skip", skipped: true, ms: Date.now() - t0 });
    } }, ["Can't speak now"]));
    function rank(r) { return { correct: 3, accepted: 2, near: 1, wrong: 0 }[r.verdict]; }

    // hints: each costs a grade step (derived grades, plan §9)
    if (ex.hint && !ex.options) foot.appendChild(el("button", { class: "btn ghost", type: "button", onclick: function (e) {
      hints++; e.currentTarget.disabled = true; verdictBox.className = "verdict v-hint"; verdictBox.textContent = "Hint: " + ex.hint;
    } }, ["Hint"]));
  }

  JA.ex = { forFacet: forFacet, minimalPair: minimalPair, render: render, el: el, ruby: ruby, plain: plain, say: say, audioBtn: audioBtn, hash: hash, shuffle: shuffle };
})(typeof window !== "undefined" ? window : globalThis);
