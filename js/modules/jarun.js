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
    return null;
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
      keys.sort(function (x, y) { var sx = KOS.jaSrs.split(x).skill === "R" ? 0 : 1, sy = KOS.jaSrs.split(y).skill === "R" ? 0 : 1; return sx - sy; });
    }
    var list = keys.map(exercise).filter(Boolean);
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
      stage.appendChild(el("div", { class: "k-ja-run-skill" }, [U().skill(ex.skill), el("span", { class: "k-muted", text: ex.family })]));
      var host = el("div", { class: "k-ja-run-host" });
      stage.appendChild(host);
      mount(host, ex, function (res) {
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

  KOS.jaRun = { exercise: exercise, mount: mount, run: run, GRADE: GRADE };
})();
