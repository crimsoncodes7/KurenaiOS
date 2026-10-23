/* Kurenai OS — modules/jarun.js (KOS.jaRun)
   The exercise runner (design 28f) and the review block (28g). One runner for every family; an
   exercise is built from a facet key and the item it names:
     k:<kana>|R    kana reading — type the reading; romaji converts as you type
     k:<kana>|W    kana writing — the genkō square with stroke diagnosis; "Type instead" counts as a hint
     s:<pair>|L    a listening minimal pair — hear one, pick which (vowel length, っ, voicing live here,
                   because a typed or picked answer can be checked reliably)
   Every answer goes through KOS.ja.record (a derived grade, invariant 113); a session ends with ONE
   ledger entry (KOS.ja.finishSession, invariant 5) and a learn session finishes its lesson once.
   One polite live region per runner (KOS.a11y.announce).                                          */
(function () {
  "use strict";
  var el = KOS.ui.el;
  function U() { return KOS.jaUI; }
  function announce(m) { if (KOS.a11y && KOS.a11y.announce) KOS.a11y.announce(m); }
  var GRADE = { 1: "Again", 2: "Hard", 3: "Good", 4: "Easy" };

  function hash(s) { var x = 2166136261; s = String(s); for (var i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); } return x >>> 0; }
  function nextText(f) {
    if (!f || !f.ivl) return "";
    return f.ivl === 1 ? "tomorrow" : "in " + f.ivl + " days";
  }

  /* ---------------- building exercises ---------------- */
  /* exercise(key) → { key, kind, skill, item, prompt, … } or null */
  function exercise(key) {
    var p = KOS.jaSrs.split(key), it = KOS.ja.item(p.item);
    if (!it) return null;
    if (p.kind === "k" && p.skill === "R") return { key: key, kind: "kana-read", skill: "R", item: it, family: "A · read it" };
    if (p.kind === "k" && p.skill === "W") return { key: key, kind: "kana-write", skill: "W", item: it, family: "A · write it" };
    if (p.kind === "s" && p.skill === "L") {
      var pairs = it.pairs || [], seed = hash(key + KOS.srs.todayISO());
      var pair = pairs[seed % Math.max(1, pairs.length)] || ["", ""];
      return { key: key, kind: "minimal-pair", skill: "L", item: it, pair: pair, target: pair[(seed >>> 3) % 2], family: "D · minimal pair" };
    }
    var h = hash(key + "|" + KOS.srs.todayISO());
    if (p.kind === "w") {
      if (p.skill === "R") return { key: key, kind: "word-meaning", skill: "R", item: it, family: "A · what does it mean?" };
      if (p.skill === "L") return { key: key, kind: "listen-pick", skill: "L", item: it, options: shuffle([it.en[0]].concat(distract(it, h)), h), family: "D · listen and pick" };
      if (p.skill === "W") return { key: key, kind: "meaning-word", skill: "W", item: it, family: "A · say it in Japanese" };
    }
    if (p.kind === "j" && p.skill === "R") return { key: key, kind: "kanji-reading", skill: "R", item: it, word: KOS.ja.item(it.in), family: "A · read the kanji" };
    if (p.kind === "g") {
      var says = it.says || [];
      if (p.skill === "R" && it.particles.length) return { key: key, kind: "particle-pick", skill: "R", item: it, t: it.particles[h % it.particles.length], family: "B · the right particle" };
      if (p.skill === "R" && says.length) { var sr = says[h % says.length]; return { key: key, kind: "read-meaning", skill: "R", item: it, say: sr, options: shuffle([sr.en].concat(otherSays(it, sr, h)), h), family: "C · read and understand" }; }
      if (p.skill === "L" && says.length) { var sl = says[(h >>> 2) % says.length]; return { key: key, kind: "listen-meaning", skill: "L", item: it, say: sl, options: shuffle([sl.en].concat(otherSays(it, sl, h)), h >>> 1), family: "D · listen and understand" }; }
      if (p.skill === "W" && it.builds.length && (h & 1 || !says.length)) return { key: key, kind: "build", skill: "W", item: it, t: it.builds[(h >>> 1) % it.builds.length], family: "B · build the sentence" };
      if (p.skill === "W" && says.length) return { key: key, kind: "translate", skill: "W", item: it, say: says[(h >>> 3) % says.length], family: "E · write it in Japanese" };
    }
    return null;
  }
  /* typed romaji spells a particle as it sounds (wa, o, e); where the answer has わ/お/え and the
     target has the particle は/を/へ in the same place — never at the start of the sentence or
     after a pause — the particle's own spelling is meant */
  function particleSounds(v, target) {
    var a = KOS.jaValid.normalise(v), t = KOS.jaKana.toHiragana(target).replace(/[、。]/g, ""), SOUND = { "は": "わ", "を": "お", "へ": "え" };
    if (a.length !== t.length) return v;
    var out = "";
    for (var i = 0; i < a.length; i++) out += i > 0 && SOUND[t[i]] === a[i] && t[i + 1] !== "っ" ? t[i] : a[i];
    return out;
  }
  /* seeded shuffles and distractors from the item's own unit, so options are words the learner
     has met nearby, never another unit's */
  function shuffle(list, h) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) { h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0; var j = h % (i + 1), t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  /* the items met by the time this one is taught: its own lesson first, then the unit's earlier
     lessons (never a later one, so no option is a word the learner hasn't seen) */
  function unitItems(key) {
    var out = [];
    (window.KOS_JA.STAGES || []).forEach(function (st) { st.units.forEach(function (u) {
      var at = -1;
      u.lessons.forEach(function (id, i) { if (KOS.ja.lesson(id).items.indexOf(key) >= 0) at = i; });
      if (at < 0) return;
      out = KOS.ja.lesson(u.lessons[at]).items.slice();
      for (var i = at - 1; i >= 0; i--) out = out.concat(KOS.ja.lesson(u.lessons[i]).items);
    }); });
    return out;
  }
  function distract(it, h) {
    var mine = it.en.map(function (g) { return g.toLowerCase(); });
    var pool = unitItems(it.key).map(KOS.ja.item).filter(function (x) {
      return x && x.kind === "word" && x.key !== it.key && x.en.every(function (g) { return mine.indexOf(g.toLowerCase()) < 0; });
    }).map(function (x) { return x.en[0]; }).filter(function (g, i, a) { return a.indexOf(g) === i && mine.indexOf(g.toLowerCase()) < 0; });
    return shuffle(pool.slice(0, Math.max(6, pool.length >> 1)), h).slice(0, 3);
  }
  function otherSays(it, say, h) {
    var pool = [];
    unitItems(it.key).map(KOS.ja.item).forEach(function (x) { if (x && x.kind === "grammar") (x.says || []).forEach(function (o) { if (o.en !== say.en && o.kana !== say.kana && pool.indexOf(o.en) < 0) pool.push(o.en); }); });
    return shuffle(pool, h).slice(0, 2);
  }

  /* ---------------- one exercise on screen ---------------- */
  /* mount(host, ex, done(result)) — result: { key, verdict, hints, ms } */
  function mount(host, ex, done) {
    host.innerHTML = "";
    var t0 = Date.now(), hints = 0, tries = 0;
    var body = el("div", { class: "k-ja-ex", "data-ui": "ja.exercise", "data-kind": ex.kind });
    var out = el("div", { class: "k-ja-ex-out", "data-ui": "ja.exercise-out" });
    host.appendChild(body); host.appendChild(out);
    function finish(res) {
      res.key = ex.key; res.hints = hints; res.ms = Date.now() - t0;
      out.innerHTML = "";
      out.appendChild(U().verdict(res));
      announce(U().verdictWords(res));
      if (res.verdict === "near" && tries < 2) {
        out.appendChild(el("div", { class: "k-ja-ex-act" }, [el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "ja.retry", text: "Retry",
          onclick: function () { out.innerHTML = ""; if (ex.retry) ex.retry(); } })]));
        return;
      }
      done(res);
    }

    if (ex.kind === "kana-read") {
      var big = el("div", { class: "k-ja-kana-big", lang: "ja", "aria-hidden": "true", text: ex.item.w });
      var inp = el("input", { type: "text", class: "k-input k-ja-input", "data-ui": "ja.answer", autocomplete: "off", autocapitalize: "off", spellcheck: "false",
        "aria-label": "Type the reading of " + ex.item.w, placeholder: "Type the reading" });
      var conv = el("small", { class: "k-muted", "aria-hidden": "true" });
      inp.addEventListener("input", function () { conv.textContent = inp.value ? "→ " + KOS.jaKana.toKana(inp.value.toLowerCase()) : ""; });
      function check() {
        if (!inp.value.trim()) return;
        tries++;
        var got = KOS.jaKana.toHiragana(KOS.jaKana.toKana(inp.value.trim().toLowerCase()));
        var want = KOS.jaKana.toHiragana(ex.item.w);
        var ok = got === want || inp.value.trim().toLowerCase() === ex.item.r;
        finish(ok ? { verdict: "correct", answer: ex.item.w, note: ex.item.r } : { verdict: "wrong", answer: ex.item.w, note: "It reads " + ex.item.r + "." });
      }
      inp.addEventListener("keydown", function (e) { if (e.key === "Enter") check(); });
      body.appendChild(el("p", { class: "k-ja-ex-q", text: "Read it: type the reading" }));
      body.appendChild(big);
      body.appendChild(el("div", { class: "k-ja-ex-in" }, [inp, el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "ja.check", text: "Check", onclick: check })]));
      body.appendChild(conv);
      setTimeout(function () { inp.focus(); }, 0);
      return;
    }

    if (ex.kind === "kana-write") {
      var ch = ex.item.w, n = (KOS.jaStrokes[ch] || []).length;
      var pad = U().pad({ ch: ch, size: "lg", label: "Write " + ch + " in the square" });
      var model = el("div", { class: "k-ja-model" }, [
        el("span", { class: "k-ja-model-g", lang: "ja", "aria-hidden": "true", text: ch }),
        el("b", { text: ex.item.r }),
        el("small", { text: n + (n === 1 ? " stroke" : " strokes") + " · copy the model" })
      ]);
      var first = !(KOS.ja.peek().facets[ex.key] || {}).reps;
      function check() {
        var st = pad.strokes();
        if (!st.length) { announce("Write it first."); return; }
        tries++;
        var r = KOS.jaStroke.check(ch, st);
        pad.mark(r);
        var v = r.verdict === "correct" || r.verdict === "accepted" ? "correct" : r.verdict;
        finish({ verdict: v, answer: ch, diagnosis: r.diagnosis || null, note: v === "correct" ? n + (n === 1 ? " stroke" : " strokes") + ", in order" : null });
      }
      ex.retry = function () { pad.clear(); };
      var typeInstead = el("button", { type: "button", class: "k-link", "data-ui": "ja.type-instead", text: "Type instead",
        onclick: function () {
          hints++;
          body.innerHTML = "";
          var e2 = { key: ex.key, kind: "kana-read", skill: "W", item: ex.item };
          mount(host, e2, function (res) { res.hints = 1; done(res); });
        } });
      body.appendChild(el("p", { class: "k-ja-ex-q", text: "Write it" }));
      body.appendChild(el("div", { class: "k-ja-write" }, [pad.node, model]));
      body.appendChild(el("div", { class: "k-ja-ex-act" }, [
        el("button", { type: "button", class: "k-btn", "data-ui": "ja.stroke-order", text: "▶ Stroke order", onclick: function () { pad.animate(); } }),
        el("button", { type: "button", class: "k-btn", "data-ui": "ja.undo", text: "↶ Undo", onclick: function () { pad.undo(); } }),
        el("button", { type: "button", class: "k-btn", "data-ui": "ja.clear", text: "Clear", onclick: function () { pad.clear(); } }),
        el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "ja.check", text: "Check", onclick: check }),
        typeInstead
      ]));
      /* the stroke-order animation plays before the first attempt at a new kana (28d) */
      if (first) { announce("Watch first. " + n + (n === 1 ? " stroke." : " strokes.")); pad.animate(); }
      return;
    }

    if (ex.kind === "minimal-pair") {
      var a = ex.pair[0], b = ex.pair[1];
      var hear = el("button", { type: "button", class: "k-btn", "data-ui": "ja.hear", text: "▶ Hear", onclick: function () { U().say(ex.target, { node: hear }); } });
      var opts = el("div", { class: "k-ja-opts", role: "group", "aria-label": "Which did you hear?" }, [a, b].map(function (w) {
        var beats = KOS.jaKana.morae(w).length;
        return el("button", { type: "button", class: "k-ja-opt", "data-ui": "ja.option", lang: "ja",
          onclick: function () {
            tries++;
            var ok = w === ex.target;
            finish(ok ? { verdict: "correct", answer: ex.target, note: ex.target + ", " + KOS.jaKana.morae(ex.target).length + " beats." }
              : { verdict: "wrong", answer: ex.target, note: "You picked " + w + " (" + beats + " beats); it was " + ex.target + " (" + KOS.jaKana.morae(ex.target).length + " beats)." });
          } }, [el("span", { text: w }), el("small", { class: "k-mono", text: beats + " beats" })]);
      }));
      body.appendChild(el("p", { class: "k-ja-ex-q", text: "Which did you hear?" }));
      body.appendChild(el("div", { class: "k-ja-ex-act" }, [hear]));
      body.appendChild(opts);
      setTimeout(function () { U().say(ex.target, { node: hear }); }, 150);
      return;
    }
    /* ---- words, kanji and grammar (Stage 1) ---- */
    function typed(label, placeholder, onCheck, o) {
      o = o || {};
      var inp = el("input", { type: "text", class: "k-input k-ja-input", "data-ui": "ja.answer", autocomplete: "off", autocapitalize: "off", spellcheck: "false",
        lang: o.ja ? "ja" : null, "aria-label": label, placeholder: placeholder });
      var conv = el("small", { class: "k-muted", "aria-hidden": "true" });
      if (o.ja) inp.addEventListener("input", function () { var v = inp.value.trim(); conv.textContent = v && KOS.jaKana.hasRomaji(v) ? "→ " + KOS.jaKana.toKana(v.toLowerCase()) : ""; });
      function go() { if (!inp.value.trim()) return; tries++; onCheck(inp.value.trim()); }
      inp.addEventListener("keydown", function (e) { if (e.key === "Enter") go(); });
      ex.retry = function () { inp.value = ""; conv.textContent = ""; inp.focus(); };
      var dunno = el("button", { type: "button", class: "k-link", "data-ui": "ja.dont-know", text: "I don't know", onclick: function () { tries++; onCheck(""); } });
      body.appendChild(el("div", { class: "k-ja-ex-in" }, [inp, el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "ja.check", text: "Check", onclick: go })]));
      body.appendChild(el("div", { class: "k-ja-ex-act" }, [conv, dunno]));
      setTimeout(function () { inp.focus(); }, 0);
    }
    function picks(label, options, ok, onPick, o) {
      o = o || {};
      body.appendChild(el("div", { class: "k-ja-opts", role: "group", "aria-label": label, "data-state": o.ja ? "ja" : null }, options.map(function (opt) {
        return el("button", { type: "button", class: "k-ja-opt", "data-ui": "ja.option", lang: o.ja ? "ja" : null,
          onclick: function (e) {
            tries++;
            [].forEach.call(e.currentTarget.parentNode.children, function (b) { b.disabled = true; KOS.ui.state(b, opt === ok ? "right" : "wrong", false); });
            KOS.ui.state(e.currentTarget, opt === ok ? "right" : "wrong", true);
            onPick(opt);
          } }, [o.ja ? U().furi(opt, { mode: "all" }) : opt]);
      })));
    }
    function hearBtn(text, who) {
      var b = el("button", { type: "button", class: "k-btn", "data-ui": "ja.hear", text: "▶ Hear", onclick: function () { U().say(text, { node: b, who: who }); } });
      var sl = el("button", { type: "button", class: "k-btn k-btn--quiet", "data-ui": "ja.slow", text: "Slow", onclick: function () { U().say(text, { node: sl, who: who, slow: true }); } });
      body.appendChild(el("div", { class: "k-ja-ex-act" }, [b, sl]));
      setTimeout(function () { U().say(text, { node: b, who: who }); }, 150);
    }
    var it = ex.item;
    if (ex.kind === "meet") {
      var kind = it.kind;
      var say0 = kind === "grammar" ? (it.says[0] || {}) : null;
      var form = kind === "grammar" ? say0.ja : kind === "kanji" ? it.w : it.ruby || it.w;
      var voice = kind === "grammar" ? say0.ja : kind === "kanji" ? KOS.ja.item(it.in).r : it.r;
      body.appendChild(el("p", { class: "k-ja-ex-q", text: kind === "grammar" ? "A new pattern" : kind === "kanji" ? "A new kanji" : "A new word" }));
      body.appendChild(el("div", { class: "k-ja-meet", "data-ui": "ja.meet" }, [
        el("div", { class: "k-ja-word-big" }, [kind === "grammar" ? U().furi(it.w, { mode: "all" }) : U().furi(form, { mode: "all" })]),
        el("dl", { class: "k-ja-dl" }, [
          kind === "grammar" ? null : el("div", {}, [el("dt", { text: "Reading" }), el("dd", { lang: "ja", text: kind === "kanji" ? it.r + " (in " + KOS.ja.item(it.in).w + ")" : it.r })]),
          el("div", {}, [el("dt", { text: "Means" }), el("dd", { text: kind === "grammar" ? it.en : it.en.slice(0, 3).join(", ") })]),
          kind === "grammar" && say0.ja ? el("div", {}, [el("dt", { text: "Example" }), el("dd", {}, [U().furi(say0.ja, { mode: "all" }), " — " + say0.en])]) : null,
          it.note ? el("div", {}, [el("dt", { text: "Note" }), el("dd", { text: it.note })]) : null
        ].filter(Boolean))
      ]));
      hearBtn(voice);
      var got = el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "ja.meet-next", text: "Got it ›", onclick: function () { done({ key: ex.key, meet: true }); } });
      body.appendChild(el("div", { class: "k-ja-ex-act" }, [got]));
      setTimeout(function () { got.focus(); }, 0);
      return;
    }
    if (ex.kind === "word-meaning") {
      body.appendChild(el("p", { class: "k-ja-ex-q", text: "What does it mean? Type it in English" }));
      body.appendChild(el("div", { class: "k-ja-word-big" }, [U().furi(it.ruby || it.w)]));
      typed("Type the meaning of " + it.w, "Meaning in English", function (v) {
        var r = v ? KOS.jaValid.check("meaning-set", v, { glosses: it.en }) : { verdict: "wrong" };
        finish({ verdict: r.verdict, diagnosis: r.diagnosis || null, answer: it.ruby || it.w, note: it.en.slice(0, 3).join(" · ") + (it.note ? " — " + it.note : "") });
      });
      return;
    }
    if (ex.kind === "listen-pick") {
      body.appendChild(el("p", { class: "k-ja-ex-q", text: "Listen: what does it mean?" }));
      hearBtn(it.r);
      picks("What did you hear?", ex.options, it.en[0], function (opt) {
        finish({ verdict: opt === it.en[0] ? "correct" : "wrong", answer: it.ruby || it.w, note: it.r + " — " + it.en[0] });
      });
      return;
    }
    if (ex.kind === "meaning-word" || ex.kind === "kanji-reading") {
      var w = ex.kind === "kanji-reading" ? ex.word : it;
      if (ex.kind === "meaning-word") {
        body.appendChild(el("p", { class: "k-ja-ex-q", text: "Say it in Japanese: type it" }));
        body.appendChild(el("div", { class: "k-ja-word-big", "data-state": "en" }, [el("span", { text: it.en[0] }), it.note ? el("small", { class: "k-muted", text: it.note }) : null].filter(Boolean)));
      } else {
        body.appendChild(el("p", { class: "k-ja-ex-q", text: "Read it: type the reading" }));
        body.appendChild(el("div", { class: "k-ja-word-big" }, [el("span", { lang: "ja", text: w.w })]));
      }
      typed(ex.kind === "kanji-reading" ? "Type the reading of " + w.w : "Type the Japanese for " + it.en[0], "Type in kana or romaji", function (v) {
        var raw = v.normalize("NFKC").replace(/\s+/g, "");
        var forms = [{ w: w.r, r: w.r }].concat((w.forms || []).filter(function (f) { return f.w !== w.r && f.w !== w.w; })).concat(w.w !== w.r ? [{ w: w.w, r: w.r }] : []);
        var r = !v ? { verdict: "wrong" } : raw === w.w ? { verdict: "correct" } : KOS.jaValid.check("reading-set", v, { forms: forms, taught: w.r });
        if (r.verdict === "accepted" && raw !== w.w && KOS.jaValid.normalise(v) === KOS.jaKana.toHiragana(w.r)) r = { verdict: "correct" };
        finish({ verdict: r.verdict, diagnosis: r.diagnosis || null, answer: w.ruby || w.w, note: (r.note ? r.note + " " : "") + w.r + " — " + w.en[0] + (ex.kind === "kanji-reading" ? " · " + it.w + " reads " + it.r + " here" : "") });
      }, { ja: true });
      return;
    }
    if (ex.kind === "particle-pick") {
      var t = ex.t;
      body.appendChild(el("p", { class: "k-ja-ex-q", text: "Which particle fills the gap?" }));
      body.appendChild(el("div", { class: "k-ja-sent" }, [U().furi(t.before), el("span", { class: "k-ja-gap", "aria-label": "blank", text: "＿" }), U().furi(t.after)]));
      body.appendChild(el("p", { class: "k-muted k-ja-sent-en", text: t.en }));
      picks("Particles", t.options, t.target, function (opt) {
        var r = KOS.jaValid.check("particle-slot", opt, t);
        finish({ verdict: r.verdict, diagnosis: r.diagnosis || null, answer: t.before + t.target + t.after, note: r.note || null });
      }, { ja: true });
      return;
    }
    if (ex.kind === "read-meaning" || ex.kind === "listen-meaning") {
      var sy = ex.say;
      if (ex.kind === "read-meaning") {
        body.appendChild(el("p", { class: "k-ja-ex-q", text: "Read it: what does it say?" }));
        body.appendChild(el("div", { class: "k-ja-sent" }, [U().furi(sy.ja)]));
      } else {
        body.appendChild(el("p", { class: "k-ja-ex-q", text: "Listen: what did they say?" }));
        hearBtn(sy.ja);
      }
      picks("Meanings", ex.options, sy.en, function (opt) {
        finish({ verdict: opt === sy.en ? "correct" : "wrong", answer: sy.ja, note: sy.en + " · " + it.w });
      });
      return;
    }
    if (ex.kind === "build") {
      var b = ex.t, order = [];
      body.appendChild(el("p", { class: "k-ja-ex-q", text: "Build it: tap the pieces in order" }));
      body.appendChild(el("p", { class: "k-ja-sent-en", text: b.en }));
      var line = el("div", { class: "k-ja-tiles", "data-ui": "ja.build-line", "data-state": "line", "aria-label": "Your sentence", role: "group" });
      var bank = el("div", { class: "k-ja-tiles", "data-ui": "ja.build-bank", role: "group", "aria-label": "Pieces" });
      function paint() {
        line.innerHTML = ""; bank.innerHTML = "";
        if (!order.length) line.appendChild(el("span", { class: "k-muted", text: "Tap the pieces below" }));
        order.forEach(function (id, i) {
          var c = b.chunks.filter(function (x) { return x.id === id; })[0];
          line.appendChild(el("button", { type: "button", class: "k-ja-tile", "data-ui": "ja.tile", "aria-label": U().plain(c.t) + ", remove", onclick: function () { order.splice(i, 1); paint(); } }, [U().furi(c.t)]));
        });
        shuffle(b.chunks, hash(ex.key)).forEach(function (c) {
          if (order.indexOf(c.id) >= 0) return;
          bank.appendChild(el("button", { type: "button", class: "k-ja-tile", "data-ui": "ja.tile", "aria-label": U().plain(c.t), onclick: function () { order.push(c.id); paint(); } }, [U().furi(c.t)]));
        });
      }
      ex.retry = function () { order = []; paint(); };
      paint();
      body.appendChild(line); body.appendChild(bank);
      body.appendChild(el("div", { class: "k-ja-ex-act" }, [el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "ja.check", text: "Check",
        onclick: function () {
          if (order.length < b.chunks.length) { announce("Use every piece."); return; }
          tries++;
          var r = KOS.jaValid.check("order-graph", order, b);
          var natural = b.natural.map(function (id) { return b.chunks.filter(function (x) { return x.id === id; })[0].t; }).join("");
          finish({ verdict: r.verdict, diagnosis: r.diagnosis || null, answer: natural, note: r.note || b.en });
        } })]));
      return;
    }
    if (ex.kind === "translate") {
      var sw = ex.say;
      body.appendChild(el("p", { class: "k-ja-ex-q", text: "Write it in Japanese" }));
      body.appendChild(el("div", { class: "k-ja-word-big", "data-state": "en" }, [el("span", { text: sw.en })]));
      typed("Type the Japanese for " + sw.en, "Type in kana or romaji", function (v) {
        var r = v ? KOS.jaValid.check("dictation", particleSounds(v, sw.kana), { target: sw.kana, alt: sw.alt || [] }) : { verdict: "wrong" };
        finish({ verdict: r.verdict, diagnosis: r.diagnosis || null, answer: sw.ja, note: sw.en });
      }, { ja: true });
      return;
    }
    body.appendChild(el("p", { class: "k-muted", text: "This exercise isn't available yet." }));
    done({ key: ex.key, verdict: "wrong", selfMarked: true });
  }

  /* ---------------- a session ---------------- */
  /* run(main, { kind: "reviews" | "learn" | "today", lesson }) — the page for #/japanese/session */
  function run(main, o) {
    o = o || {};
    var lessonId = o.kind === "learn" ? o.lesson : null;
    if (lessonId) KOS.ja.startLesson(lessonId);
    var keys = KOS.ja.due();
    if (lessonId) {
      var L = KOS.ja.lesson(lessonId), mine = {};
      L.items.forEach(function (k) { mine[k] = 1; });
      /* the lesson's own facets, Reading first; reviews stay in their own block */
      keys = keys.filter(function (k) { return mine[KOS.jaSrs.split(k).item]; });
      /* the lesson's order: each item in turn, Reading before Listening before Writing */
      var SK = { R: 0, L: 1, W: 2, S: 3 };
      keys.sort(function (x, y) {
        var a = KOS.jaSrs.split(x), b = KOS.jaSrs.split(y);
        return L.items.indexOf(a.item) - L.items.indexOf(b.item) || SK[a.skill] - SK[b.skill];
      });
    }
    var list = keys.map(exercise).filter(Boolean);
    /* a new word, kanji or pattern is MET before it is checked: its form, reading, meaning and
       voice on one card, then the questions (kana meet theirs through the stroke animation) */
    if (lessonId) {
      var met = {}, fac = KOS.ja.peek().facets;
      list = [].concat.apply([], list.map(function (ex) {
        var item = ex.item.key;
        if (met[item] || !/^[wjg]:/.test(item) || (fac[ex.key] && fac[ex.key].reps)) return [ex];
        met[item] = 1;
        return [{ key: item + "|meet", kind: "meet", skill: ex.skill, item: ex.item, family: "New · meet it", meet: true }, ex];
      }));
    }
    var results = [], i = 0;
    var title = lessonId ? "New · " + lessonId + " " + KOS.ja.lesson(lessonId).title : "Reviews";
    var head = el("div", { class: "k-ja-run-head" }, [
      el("button", { type: "button", class: "k-iconbtn", "data-ui": "ja.exit", "aria-label": "Leave the session", text: "✕",
        onclick: function () { leave(); } }),
      el("span", { class: "k-ja-run-t", text: title }),
      el("span", { class: "k-mono k-ja-run-n", "data-ui": "ja.progress" })
    ]);
    var stage = el("div", { class: "k-ja-run-stage" });
    var foot = el("div", { class: "k-ja-run-foot" });
    var box = el("section", { class: "k-card k-ja-run", "data-ui": "ja.runner", "aria-label": title }, [head, stage, foot]);
    main.appendChild(box);
    function leave() {
      if (results.length && !box.getAttribute("data-done")) {
        KOS.ui.confirm({ title: "Leave the session?", body: "What you have answered is kept and scheduled.", confirm: "Leave", cancel: "Stay", mark: "語" },
          function () { end(true); });
      } else KOS.show("subject", "ja");
    }
    function show() {
      foot.innerHTML = "";
      if (i >= list.length) { end(false); return; }
      var ex = list[i];
      head.querySelector("[data-ui~='ja.progress']").textContent = (i + 1) + " / " + list.length;
      stage.innerHTML = "";
      stage.appendChild(el("div", { class: "k-ja-run-skill" }, [ex.meet ? el("span", { class: "k-chip", style: "--chip-c: var(--subj-c)", text: "New" }) : U().skill(ex.skill), el("span", { class: "k-muted", text: ex.meet ? "meet it, then it's checked" : ex.family })]));
      var host = el("div", { class: "k-ja-run-host" });
      stage.appendChild(host);
      mount(host, ex, function (res) {
        if (ex.meet) { i++; show(); return; }
        var rec = KOS.ja.record(ex.key, res);
        results.push({ key: ex.key, grade: rec.grade });
        if (rec.grade) {
          host.appendChild(el("p", { class: "k-ja-verdict-g", "data-ui": "ja.grade" }, [el("span", { class: "k-muted", text: "Grade, from your answer · " }),
            el("b", { text: GRADE[rec.grade] }), " · next " + nextText(rec.facet)]));
          announce(GRADE[rec.grade] + ", next " + nextText(rec.facet) + ".");
        }
        var nx = el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "ja.next", text: i + 1 < list.length ? "Next ›" : "Finish",
          onclick: function () { i++; show(); } });
        foot.appendChild(nx);
        nx.focus();
      });
    }
    function end(early) {
      box.setAttribute("data-done", "1");
      var fin = KOS.ja.finishSession(results, { lesson: lessonId });
      var paidLesson = null;
      if (lessonId && !early && results.length) paidLesson = KOS.ja.finishLesson(lessonId);
      stage.innerHTML = ""; foot.innerHTML = "";
      var good = results.filter(function (r) { return r.grade >= 3; }).length;
      var pay = [];
      if (fin.paid) pay.push("+" + fin.paid + " XP");
      if (paidLesson && paidLesson.paid) pay.push("+" + paidLesson.pay.xp + " XP · +" + paidLesson.pay.gold + " gold · +" + paidLesson.pay.hp + " HP");
      stage.appendChild(el("div", { class: "k-ja-run-end", "data-ui": "ja.session-done" }, [
        el("h2", { text: results.length ? KOS.ui.num(results.length) + " answered" : "Nothing due right now" }),
        results.length ? el("p", { text: good + " Good or Easy" + (fin.capped ? " · past today's review cap, so no more XP today" : "") }) : null,
        pay.length ? el("p", { class: "k-ja-pay", "data-ui": "ja.pay", text: "◆ " + pay.join(" · ") }) : results.length ? el("p", { class: "k-muted", text: "No reward · " + (fin.capped ? "today's review cap reached" : "nothing passed") }) : null,
        el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: "Back to the desk", onclick: function () { KOS.show("subject", "ja"); } })
      ].filter(Boolean)));
      head.querySelector("[data-ui~='ja.progress']").textContent = "";
      announce(results.length ? "Session done. " + results.length + " answered." : "Nothing due right now.");
    }
    if (!list.length) { end(false); return; }
    show();
  }

  KOS.jaRun = { exercise: exercise, mount: mount, run: run, particleSounds: particleSounds, GRADE: GRADE };
})();
