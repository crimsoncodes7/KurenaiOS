/* Kurenai OS — engines/quiz.js
   MCQ quizzes with instant feedback + explanations, and exam-style
   questions with reveal-the-mark-scheme self-marking. Best scores persist.

   Graphite (frames 8e, 8f): both engines show ONE question at a time with
   where you are in the set ("Question 3 of 10"). An MCQ locks on the first
   answer, marks the right option, explains why and offers the next
   question; an exam question reveals its scheme as a checklist to tick (a
   point per mark) or, where the scheme is banded, a row of mark buttons,
   and logs the item once. Every element carries its hook explicitly.     */
(function () {
  "use strict";
  var el = KOS.ui.el, store = KOS.store;
  var LETTERS = "ABCDEFGHI";

  function qstats(sid, ref) {
    var st = store.state.study = store.state.study || {};
    var q = st.quiz = st.quiz || {};
    var k = sid + ":" + ref;
    return q[k] = q[k] || { attempts: 0, best: 0, lastPct: 0 };
  }
  function pill(text, onclick, attrs) {
    return el("button", Object.assign({ type: "button", class: "k-qz-pill", "data-ui": "quiz.chip", text: text, onclick: onclick }, attrs || {}));
  }
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  /* self-removing keyboard handling, exactly like the flashcard engine's:
     the panel this lives in is replaced wholesale on a tab change, so the
     listener notices it has been orphaned rather than wait to be torn down */
  function bindKeys(holder, fn) {
    function onKey(e) {
      if (!holder.ownerDocument || !holder.ownerDocument.contains(holder)) {
        document.removeEventListener("keydown", onKey);
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      var t = e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName || ""))) return;
      fn(e);
    }
    if (typeof document !== "undefined" && document.addEventListener) document.addEventListener("keydown", onKey);
  }

  KOS.quiz = {
    stats: qstats,

    mountMCQ: function (holder, sid, ref, items) {
      holder.innerHTML = "";
      if (!items || !items.length) return;
      var st = qstats(sid, ref);
      var order = items.map(function (_, i) { return i; });
      var at = 0, correct = 0, answered = {}, missed = [];

      var title = el("span", { class: "k-qz-title", "data-ui": "quiz.counter" });
      var meta = el("span", { class: "k-qz-meta" });
      var head = el("div", { class: "k-qz-head", "data-ui": "quiz.head" }, [title, meta,
        el("span", { class: "k-qz-tools" }, [
          pill("Shuffle", function () { shuffle(order); restart(); }),
          pill("Retry", function () { KOS.quiz.mountMCQ(holder, sid, ref, items); })
        ])
      ]);
      var stage = el("div", { class: "k-qz-stage" });
      var keys = el("p", { class: "k-qz-keys", "data-ui": "quiz.keys" });
      var result = el("section", { class: "k-card k-qz-result", "data-ui": "quiz.result", hidden: "", "aria-live": "polite" });
      [head, stage, keys, result].forEach(function (n) { holder.appendChild(n); });

      function paintHead() {
        var done = Object.keys(answered).length;
        title.textContent = done === items.length ? "All " + items.length + " answered" : "Question " + (at + 1) + " of " + items.length;
        meta.textContent = "score " + correct + (st.attempts ? " · best " + st.best + "/" + items.length : " · first attempt");
      }
      var card = null, next = null;
      function show() {
        var qi = order[at], item = items[qi];
        stage.innerHTML = "";
        var opts = el("div", { class: "k-qz-opts", role: "group", "aria-label": "Answers" });
        card = el("article", { class: "k-card k-qz-card", "data-ui": "quiz.card" }, [
          el("div", { class: "k-qz-q", "data-ui": "quiz.q", html: KOS.content.inline(item.q) }),
          opts
        ]);
        item.opts.forEach(function (opt, oi) {
          var btn = el("button", { type: "button", class: "k-qz-opt", "data-ui": "quiz.option",
            "aria-keyshortcuts": String(oi + 1), onclick: function () { answer(oi); } }, [
            el("span", { class: "k-qz-key", "data-ui": "quiz.option-key", "aria-hidden": "true", text: String(oi + 1) }),
            el("span", { class: "k-qz-letter", "aria-hidden": "true", text: LETTERS.charAt(oi) }),
            el("span", { class: "k-qz-opt-t", html: KOS.content.inline(opt) })
          ]);
          opts.appendChild(btn);
        });
        next = el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "quiz.next",
          hidden: "", text: at < order.length - 1 ? "Next question →" : "See your score →", onclick: advance });
        card.appendChild(el("div", { class: "k-qz-foot" }, [next]));
        stage.appendChild(card);
        KOS.content.typeset(card);
        keys.innerHTML = "";
        keys.appendChild(el("kbd", { class: "k-kbd", text: "1" }));
        keys.appendChild(document.createTextNode("–"));
        keys.appendChild(el("kbd", { class: "k-kbd", text: String(Math.min(9, item.opts.length)) }));
        keys.appendChild(document.createTextNode(" answer · "));
        keys.appendChild(el("kbd", { class: "k-kbd", text: "Enter" }));
        keys.appendChild(document.createTextNode(" next question"));
        paintHead();
      }
      function answer(oi) {
        var qi = order[at], item = items[qi];
        if (answered[qi] != null) return;
        answered[qi] = oi;
        var ok = oi === item.ans;
        if (ok) correct++; else missed.push(item);
        var btns = card.querySelectorAll("[data-ui~='quiz.option']");
        btns.forEach(function (b, i) {
          b.disabled = true;
          if (i === item.ans) { KOS.ui.state(b, "right", true); b.appendChild(el("span", { class: "k-qz-verdict", text: "Correct" })); }
          else if (i === oi) { KOS.ui.state(b, "wrong", true); b.appendChild(el("span", { class: "k-qz-verdict", text: "Your answer" })); }
        });
        var why = el("p", { class: "k-qz-why", "data-ui": "quiz.why", "data-state": ok ? "ok" : "no" }, [
          el("b", { text: (ok ? "✓ Correct" : "✕ Not quite") + " · " })
        ]);
        why.insertAdjacentHTML("beforeend", KOS.content.inline(item.why || ""));
        card.insertBefore(why, card.lastChild);
        KOS.content.typeset(why);
        next.hidden = false;
        paintHead();
        if (Object.keys(answered).length === items.length) finish();
      }
      function advance() {
        if (at < order.length - 1) { at++; show(); if (card.scrollIntoView) card.scrollIntoView({ block: "nearest" }); }
        else if (!result.hidden && result.scrollIntoView) result.scrollIntoView({ block: "nearest" });
      }
      function restart() { at = 0; correct = 0; answered = {}; missed = []; result.hidden = true; show(); }
      bindKeys(holder, function (e) {
        var qi = order[at];
        if (e.key >= "1" && e.key <= "9") {
          if (answered[qi] != null) return;               /* an answered question stays answered */
          var pick = card.querySelectorAll("[data-ui~='quiz.option']")[Number(e.key) - 1];
          if (!pick) return;
          e.preventDefault();
          answer(Number(e.key) - 1);
        } else if ((e.key === "Enter" || e.key === "ArrowRight") && answered[qi] != null) {
          if (e.key === "Enter" && e.target && e.target.tagName === "BUTTON") return;   /* the button's own Enter */
          e.preventDefault();
          advance();
        }
      });

      function finish() {
        st.attempts++;
        st.lastPct = Math.round(100 * correct / items.length);
        if (correct > st.best) st.best = correct;
        store.save();
        /* FR-3.2 — every completed quiz attempt lands in the session log */
        KOS.sessions.log({
          type: "quiz", subject: sid, ref: ref,
          metrics: { correct: correct, total: items.length, pct: st.lastPct }
        });
        var verdict = correct === items.length ? "Full marks ★" :
          correct >= items.length * 0.7 ? "Solid — review the misses." :
          "Worth another pass over the notes.";
        result.innerHTML = "";
        result.appendChild(el("div", { class: "k-qz-score" }, [
          el("b", { text: correct + " / " + items.length }),
          el("span", { text: verdict })
        ]));
        var acts = el("div", { class: "k-qz-foot" }, [
          el("button", { type: "button", class: "k-btn", text: "Retry", onclick: function () { KOS.quiz.mountMCQ(holder, sid, ref, items); } })
        ]);
        /* the misses are the only questions worth a second pass right now;
           the full retry stays for a clean score */
        if (missed.length && missed.length < items.length) {
          acts.appendChild(el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: "Retry the " + missed.length + " missed",
            onclick: function () { KOS.quiz.mountMCQ(holder, sid, ref, missed.slice()); } }));
        }
        result.appendChild(acts);
        result.hidden = false;
        next.textContent = "See your score →";
        paintHead();
      }
      show();
    },

    /* Exam-style questions. An item is
         { q, marks, ms:[..] }                      one-part question
         { ctx, parts:[{q, marks, ms}], src }      shared stem + lettered parts
       plus optional `src` ("AQA 2019 P2 Q5" — the paper it is modelled on),
       `level` ("AS"|"A"), `code` ({lang, src} printed under the stem) and
       `note` (an examiner's-report style caution shown with the scheme).
       Every part is self-marked; one "Log" per item records the total, so a
       six-part question is one exam session, not six. */
    mountExam: function (holder, sid, ref, items) {
      holder.innerHTML = "";
      if (!items || !items.length) return;
      var norm = items.map(function (it, i) {
        var parts = it.parts && it.parts.length ? it.parts : [{ q: it.q, marks: it.marks, ms: it.ms || [], code: it.partCode }];
        var total = parts.reduce(function (a, p) { return a + (Number(p.marks) || 0); }, 0);
        return { i: i, item: it, parts: parts, total: total };
      });
      var st = qstats(sid, ref);

      /* tariff filter: the short "state/define" items, the 3–5 mark
         "explain" items and the extended 6+ responses train different
         skills, and a reader revising for a 12-marker wants only those */
      var FILTERS = [["all", "All"], ["short", "1–2 marks"], ["mid", "3–5 marks"], ["long", "6+ marks"]];
      var filter = "all", shuffled = false, at = 0, shown = norm;
      function tariff(n) { return n.total <= 2 ? "short" : n.total <= 5 ? "mid" : "long"; }

      var chips = el("div", { class: "k-qz-chips", role: "group", "aria-label": "Filter by tariff" });
      FILTERS.forEach(function (f) {
        var n = f[0] === "all" ? norm.length : norm.filter(function (x) { return tariff(x) === f[0]; }).length;
        if (f[0] !== "all" && !n) return;
        chips.appendChild(pill(f[0] === "all" ? "All · " + n : f[1], function () { filter = f[0]; at = 0; render(); },
          { "aria-pressed": String(f[0] === filter), "data-f": f[0], title: n + (n === 1 ? " question" : " questions") }));
      });
      var shuffleBtn = pill("Shuffle", function () { shuffled = !shuffled; shuffleBtn.setAttribute("aria-pressed", String(shuffled)); at = 0; render(); }, { "aria-pressed": "false" });
      chips.appendChild(shuffleBtn);
      var counter = el("span", { class: "k-qz-meta", "data-ui": "quiz.counter" });
      var prevBtn = el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "data-ui": "quiz.prev", "aria-label": "Previous question", text: "‹", onclick: function () { at--; render(); } });
      var nextBtn = el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "data-ui": "quiz.next", "aria-label": "Next question", text: "›", onclick: function () { at++; render(); } });
      holder.appendChild(el("div", { class: "k-qz-head", "data-ui": "quiz.head" }, [chips,
        el("span", { class: "k-qz-tools" }, [counter, prevBtn, nextBtn])]));
      var stage = el("div", { class: "k-qz-stage" });
      holder.appendChild(stage);
      var tally = el("p", { class: "k-qz-tally", "data-ui": "quiz.tally", "aria-live": "polite" });
      holder.appendChild(tally);
      var logged = {};   /* item index -> marks logged this visit */
      var marksBy = {};  /* item index -> { part index -> marks } — kept while paging */

      function updateTally() {
        var keys = Object.keys(logged);
        if (!keys.length) { tally.textContent = st.attempts ? "Self-marked " + st.attempts + " time" + (st.attempts === 1 ? "" : "s") + " before — be a harsh marker." : ""; return; }
        var got = 0, max = 0;
        keys.forEach(function (k) { got += logged[k].got; max += logged[k].max; });
        tally.innerHTML = "";
        tally.appendChild(el("b", { text: got + " / " + max }));
        tally.appendChild(document.createTextNode(" self-marked this visit across " + keys.length + " question" + (keys.length === 1 ? "" : "s") +
          (max ? " — " + Math.round(100 * got / max) + "%" : "")));
      }
      function srcLine(it) {
        if (!it.src && !it.level) return null;
        var bits = [];
        if (it.level) bits.push(it.level === "AS" ? "AS level" : "A level");
        if (it.src) bits.push("modelled on " + it.src);
        return el("span", { class: "k-qz-src", "data-ui": "quiz.src", text: bits.join(" · ") });
      }

      /* one part: its question, the answer box, and — once revealed — the
         scheme to mark against. A scheme with a point per mark is a
         checklist; a banded scheme keeps the mark buttons. */
      function partBlock(part, label, marks, onMark) {
        var wrap = el("section", { class: "k-qz-part", "data-ui": "quiz.part" });
        wrap.appendChild(el("div", { class: "k-qz-part-q" }, [
          label ? el("span", { class: "k-mono k-muted", "data-ui": "quiz.part-l", text: label }) : null,
          el("span", { class: "k-qz-part-t", html: KOS.content.inline(part.q) }),
          /* a single-part item already carries its total in the header */
          label ? el("span", { class: "k-qz-marks", text: "[" + part.marks + (part.marks === 1 ? " mark" : " marks") + "]" }) : null
        ].filter(Boolean)));
        if (part.code) wrap.appendChild(el("div", { class: "k-prose", html: KOS.content.renderBlocks([{ code: part.code }]) }));
        var ta = el("textarea", { class: "k-input k-qz-answer", "data-ui": "ui.note-area", rows: part.marks >= 6 ? 7 : part.marks >= 3 ? 4 : 2,
          "aria-label": "Your answer" + (label ? " to " + label : ""),
          placeholder: part.marks >= 6 ? "Plan the points first, then write it as a paragraph the way the mark scheme is banded…" : "Your answer…" });
        wrap.appendChild(ta);
        var ms = el("div", { class: "k-qz-ms", "data-ui": "quiz.ms", hidden: "" });
        wrap.appendChild(ms);
        var points = part.ms || [];
        var checklist = points.length && points.length === Number(part.marks);
        function paint() {
          ms.innerHTML = "";
          ms.appendChild(el("h3", { class: "k-kicker", text: "Mark scheme · self-mark" }));
          var self = el("div", { class: "k-qz-self", "data-ui": "quiz.selfmark" });
          if (checklist) {
            points.forEach(function (m, i) {
              var cb = el("input", { type: "checkbox", class: "k-box", onchange: function () {
                var got = 0;
                self.querySelectorAll("input[type=checkbox]").forEach(function (x) { if (x.checked) got++; });
                onMark(got);
              } });
              cb.checked = i < (marks || 0);
              var row = el("label", { class: "k-qz-point" }, [cb, el("span", { class: "k-qz-point-t", html: KOS.content.inline(m) }), el("span", { class: "k-mono k-muted", text: "1" })]);
              self.appendChild(row);
            });
          } else {
            var list = el("ul", { class: "k-qz-points" }, points.map(function (m) { return el("li", { html: KOS.content.inline(m) }); }));
            ms.appendChild(list);
            if (part.marks <= 10) {
              var grp = el("div", { class: "k-qz-markbtns", role: "group", "aria-label": "Marks awarded out of " + part.marks });
              for (var m = 0; m <= part.marks; m++) (function (m) {
                grp.appendChild(el("button", { type: "button", class: "k-qz-markbtn", "data-ui": "quiz.markbtn", text: String(m), "aria-pressed": String(marks === m), onclick: function () {
                  grp.querySelectorAll("[data-ui~='quiz.markbtn']").forEach(function (b) { b.setAttribute("aria-pressed", String(Number(b.textContent) === m)); });
                  onMark(m);
                } }));
              })(m);
              self.appendChild(el("span", { class: "k-kicker", text: "Awarded" }));
              self.appendChild(grp);
            } else {
              var markIn = el("input", { type: "number", class: "k-input k-qz-markin", min: 0, max: part.marks, "aria-label": "Marks awarded out of " + part.marks,
                oninput: function () { onMark(Math.max(0, Math.min(part.marks, parseInt(markIn.value || "0", 10)))); } });
              if (marks != null) markIn.value = String(marks);
              self.appendChild(markIn);
            }
            self.appendChild(el("span", { class: "k-mono k-muted", text: "/ " + part.marks }));
          }
          ms.appendChild(self);
          if (part.note) ms.appendChild(el("p", { class: "k-qz-note", html: KOS.content.inline(part.note) }));
          KOS.content.typeset(ms);
        }
        return { node: wrap, reveal: function (on) { if (on) paint(); ms.hidden = !on; } };
      }

      function render() {
        shown = norm.filter(function (n) { return filter === "all" || tariff(n) === filter; });
        if (shuffled) shown = shuffle(shown.slice());
        at = Math.max(0, Math.min(shown.length - 1, at));
        chips.querySelectorAll("[data-f]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.f === filter)); });
        stage.innerHTML = "";
        if (!shown.length) { stage.appendChild(KOS.ui.emptyState({ compact: true, body: "No questions at that tariff." })); counter.textContent = ""; return; }
        counter.textContent = "Question " + (at + 1) + " of " + shown.length;
        prevBtn.disabled = at === 0;
        nextBtn.disabled = at === shown.length - 1;
        var n = shown[at], it = n.item;
        var marks = marksBy[n.i] = marksBy[n.i] || {};
        var card = el("article", { class: "k-card k-qz-exam", "data-ui": "quiz.card quiz.exam" + (n.parts.length > 1 ? " quiz.multi" : "") });
        card.appendChild(el("div", { class: "k-qz-exam-top", "data-ui": "quiz.exam-top" }, [
          el("b", { class: "k-mono", text: "Q" + (n.i + 1) }),
          srcLine(it),
          el("span", { class: "k-qz-marks", text: n.total + (n.total === 1 ? " mark" : " marks") })
        ].filter(Boolean)));
        if (it.ctx) card.appendChild(el("div", { class: "k-prose k-qz-stem", html: Array.isArray(it.ctx) ? KOS.content.renderBlocks(it.ctx) : "<p>" + KOS.content.inline(it.ctx) + "</p>" }));
        if (it.code) card.appendChild(el("div", { class: "k-prose k-qz-stem", html: KOS.content.renderBlocks([{ code: it.code }]) }));
        var sum = el("span", { class: "k-qz-sum", "data-ui": "quiz.sum" });
        function paintSum() {
          var got = 0;
          n.parts.forEach(function (p, pi) { got += marks[pi] || 0; });
          sum.textContent = revealed ? got + " / " + n.total + " marks" : n.total + (n.total === 1 ? " mark" : " marks") + " available";
        }
        var revealed = false;
        var blocks = n.parts.map(function (p, pi) {
          var label = n.parts.length > 1 ? "(" + String.fromCharCode(97 + pi) + ")" : "";
          var b = partBlock(p, label, marks[pi], function (v) { marks[pi] = v; paintSum(); });
          card.appendChild(b.node);
          return b;
        });
        var done = el("span", { class: "k-qz-logged", "data-ui": "quiz.logged", text: logged[n.i] ? "Logged " + logged[n.i].got + "/" + logged[n.i].max : "" });
        var revealBtn = el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "quiz.reveal", text: "Reveal mark scheme", onclick: function () {
          revealed = !revealed;
          blocks.forEach(function (b) { b.reveal(revealed); });
          revealBtn.textContent = revealed ? "Hide mark scheme" : "Reveal mark scheme";
          revealBtn.className = revealed ? "k-btn" : "k-btn k-btn--primary";
          if (revealed) revealBtn.removeAttribute("data-intent"); else revealBtn.setAttribute("data-intent", "primary");
          logBtn.hidden = !revealed;
          paintSum();
          var first = revealed && card.querySelector("[data-ui~='quiz.selfmark'] button, [data-ui~='quiz.selfmark'] input");
          if (first) first.focus();
        } });
        var logBtn = el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "quiz.log", hidden: "", text: "Log self-mark",
          disabled: logged[n.i] ? "" : null, onclick: function () {
          var got = 0;
          n.parts.forEach(function (p, pi) { got += marks[pi] || 0; });
          st.attempts++;
          store.save();
          /* FR-3.2 — self-marked exam questions are sessions too */
          KOS.sessions.log({ type: "exam", subject: sid, ref: ref, metrics: { marks: got, max: n.total } });
          logged[n.i] = { got: got, max: n.total };
          updateTally();
          done.textContent = "Logged " + got + "/" + n.total;
          logBtn.disabled = true;
          KOS.ui.toast("Logged " + got + "/" + n.total + " — be a harsh marker, future-you benefits.");
        } });
        card.appendChild(el("div", { class: "k-qz-foot k-qz-exam-foot", "data-ui": "quiz.exam-foot" }, [sum, done, revealBtn, logBtn]));
        paintSum();
        stage.appendChild(card);
        KOS.content.typeset(card);
      }
      render();
      updateTally();
    }
  };
})();
