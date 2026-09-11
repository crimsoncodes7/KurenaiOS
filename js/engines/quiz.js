/* Kurenai OS — engines/quiz.js
   MCQ quizzes with instant feedback + explanations, and exam-style
   questions with reveal-the-mark-scheme self-marking. Best scores persist. */
(function () {
  "use strict";
  var el = KOS.ui.el, store = KOS.store;

  function qstats(sid, ref) {
    var st = store.state.study = store.state.study || {};
    var q = st.quiz = st.quiz || {};
    var k = sid + ":" + ref;
    return q[k] = q[k] || { attempts: 0, best: 0, lastPct: 0 };
  }

  KOS.quiz = {
    stats: qstats,
    mountMCQ: function (holder, sid, ref, items) {
      holder.innerHTML = "";
      if (!items || !items.length) return;
      var st = qstats(sid, ref);
      var answered = 0, correct = 0;

      var head = el("div", { class: "qz-head" }, [
        el("span", { text: items.length + " questions" }),
        el("span", { class: "qz-best", text: st.attempts ? "best: " + st.best + "/" + items.length + " · attempts: " + st.attempts : "first attempt" })
      ]);
      holder.appendChild(head);

      /* audit REF-8: no keyboard support existed in this engine either. The
         number keys answer the FIRST QUESTION STILL OPEN, which is the only
         unambiguous target on a page of stacked questions — and it is also
         the one the reader is looking at, because answered questions lock
         and reveal their explanation. */
      var cards = [], missed = [];
      var list = el("div", {});
      items.forEach(function (item, qi) {
        var card = el("div", { class: "qz-card" });
        card.appendChild(el("div", { class: "qz-q", html: "<b>Q" + (qi + 1) + ".</b> " + KOS.content.inline(item.q) }));
        var opts = el("div", { class: "qz-opts" });
        var locked = false;
        item.opts.forEach(function (opt, oi) {
          var btn = el("button", { class: "qz-opt", onclick: function () {
            if (locked) return;
            locked = true;
            answered++;
            var ok = oi === item.ans;
            if (ok) correct++; else missed.push(item);
            btn.classList.add(ok ? "right" : "wrong");
            opts.children[item.ans].classList.add("right");
            opts.querySelectorAll(".qz-opt").forEach(function (b) { b.disabled = true; });
            var why = el("div", { class: "qz-why " + (ok ? "ok" : "no"),
              html: (ok ? "✓ Correct. " : "✕ Not quite. ") + KOS.content.inline(item.why || "") });
            card.appendChild(why);
            KOS.content.typeset(why);
            if (answered === items.length) finish();
          }});
          btn.appendChild(el("span", { class: "qz-opt-key", "aria-hidden": "true", text: String(oi + 1) }));
          btn.appendChild(el("span", { class: "qz-opt-t", html: KOS.content.inline(opt) }));
          opts.appendChild(btn);
        });
        card.appendChild(opts);
        cards.push({ card: card, opts: opts, open: function () { return !locked; } });
        list.appendChild(card);
      });
      holder.appendChild(list);
      holder.appendChild(el("p", { class: "qz-keys" }, [
        el("kbd", { text: "1" }), "–", el("kbd", { text: String(Math.min(9, items[0].opts.length)) }),
        " answers the first question still open"
      ]));
      KOS.content.typeset(list);

      /* self-removing, exactly like the flashcard engine's: the panel this
         lives in is replaced wholesale on a tab change, so the listener has
         to notice it has been orphaned rather than wait to be torn down */
      function onKey(e) {
        if (!holder.ownerDocument || !holder.ownerDocument.contains(holder)) {
          document.removeEventListener("keydown", onKey);
          return;
        }
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        var t = e.target;
        if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName || ""))) return;
        if (!(e.key >= "1" && e.key <= "9")) return;
        var live = cards.filter(function (c) { return c.open(); })[0];
        if (!live) return;
        var pick = live.opts.querySelectorAll(".qz-opt")[Number(e.key) - 1];
        if (!pick) return;
        e.preventDefault();
        pick.click();
        if (live.card.scrollIntoView) live.card.scrollIntoView({ block: "nearest" });
      }
      if (typeof document !== "undefined" && document.addEventListener) {
        document.addEventListener("keydown", onKey);
      }

      var result = el("div", { class: "qz-result", style: "display:none" });
      holder.appendChild(result);

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
        result.innerHTML = "<b>" + correct + " / " + items.length + "</b> — " + verdict;
        result.style.display = "";
        result.appendChild(el("button", { class: "btn gold", style: "margin-left:14px", text: "Retry",
          onclick: function () { KOS.quiz.mountMCQ(holder, sid, ref, items); } }));
        /* the misses are the only questions worth a second pass right now;
           the full retry stays for a clean score */
        if (missed.length && missed.length < items.length) {
          result.appendChild(el("button", { class: "btn", style: "margin-left:8px", text: "Retry the " + missed.length + " missed",
            onclick: function () { KOS.quiz.mountMCQ(holder, sid, ref, missed.slice()); } }));
        }
      }
    },

    /* Exam-style questions. An item is
         { q, marks, ms:[..] }                      one-part question
         { ctx, parts:[{q, marks, ms}], src }      shared stem + lettered parts
       plus optional `src` ("AQA 2019 P2 Q5" — the paper it is modelled on),
       `level` ("AS"|"A"), `code` ({lang, src} printed under the stem) and
       `note` (an examiner's-report style caution shown with the scheme).
       Every part is self-marked separately; one "Log" per item records the
       total so a six-part question is one exam session, not six. */
    mountExam: function (holder, sid, ref, items) {
      holder.innerHTML = "";
      if (!items || !items.length) return;
      var norm = items.map(function (it, i) {
        var parts = it.parts && it.parts.length ? it.parts : [{ q: it.q, marks: it.marks, ms: it.ms || [] }];
        var total = parts.reduce(function (a, p) { return a + (Number(p.marks) || 0); }, 0);
        return { i: i, item: it, parts: parts, total: total };
      });
      var totalMarks = norm.reduce(function (a, n) { return a + n.total; }, 0);
      var st = qstats(sid, ref);

      /* tariff filter: the short "state/define" items, the 3–5 mark
         "explain" items and the extended 6+ responses train different
         skills and a reader revising for a 12-marker wants only those */
      var FILTERS = [["all", "All"], ["short", "1–2 marks"], ["mid", "3–5 marks"], ["long", "6+ marks"]];
      var filter = "all", shuffled = false;
      function tariff(n) { return n.total <= 2 ? "short" : n.total <= 5 ? "mid" : "long"; }

      var head = el("div", { class: "qz-head qz-head-exam" });
      var lead = el("span", { text: items.length + " questions · " + totalMarks + " marks" });
      head.appendChild(lead);
      var tools = el("div", { class: "qz-tools" });
      var chips = el("div", { class: "qz-filter", role: "group", "aria-label": "Filter by tariff" });
      FILTERS.forEach(function (f) {
        var n = f[0] === "all" ? norm.length : norm.filter(function (x) { return tariff(x) === f[0]; }).length;
        if (f[0] !== "all" && !n) return;
        chips.appendChild(el("button", { class: "qz-chip" + (f[0] === filter ? " on" : ""), type: "button",
          "aria-pressed": String(f[0] === filter), "data-f": f[0],
          onclick: function () { filter = f[0]; render(); } }, [f[1], el("span", { class: "tab-n", text: String(n) })]));
      });
      tools.appendChild(chips);
      tools.appendChild(el("button", { class: "qz-chip", type: "button", "aria-pressed": "false", text: "Shuffle",
        onclick: function (e) { shuffled = !shuffled; e.currentTarget.setAttribute("aria-pressed", String(shuffled)); e.currentTarget.classList.toggle("on", shuffled); render(); } }));
      head.appendChild(tools);
      holder.appendChild(head);
      var list = el("div", {});
      holder.appendChild(list);
      var tally = el("div", { class: "qz-tally", "aria-live": "polite" });
      holder.appendChild(tally);
      var logged = {};   /* item index -> marks logged this visit */

      function updateTally() {
        var keys = Object.keys(logged);
        if (!keys.length) { tally.textContent = st.attempts ? "Self-marked " + st.attempts + " time" + (st.attempts === 1 ? "" : "s") + " before — be a harsh marker." : ""; return; }
        var got = 0, max = 0;
        keys.forEach(function (k) { got += logged[k].got; max += logged[k].max; });
        tally.innerHTML = "<b>" + got + " / " + max + "</b> self-marked this visit across " + keys.length + " question" + (keys.length === 1 ? "" : "s") +
          (max ? " — " + Math.round(100 * got / max) + "%" : "");
      }

      function srcLine(it) {
        if (!it.src && !it.level) return null;
        var bits = [];
        if (it.level) bits.push(it.level === "AS" ? "AS level" : "A level");
        if (it.src) bits.push("modelled on " + it.src);
        return el("span", { class: "qz-src", text: bits.join(" · ") });
      }

      function partCard(part, label, item, onMark) {
        var wrap = el("div", { class: "qz-part" });
        wrap.appendChild(el("div", { class: "qz-q qz-part-q", html:
          (label ? '<span class="qz-part-l">' + label + "</span> " : "") + KOS.content.inline(part.q) +
          ' <span class="qz-marks">[' + part.marks + (part.marks === 1 ? " mark" : " marks") + "]</span>" }));
        if (part.code) wrap.appendChild(el("div", { html: KOS.content.renderBlocks([{ code: part.code }]) }));
        var ta = el("textarea", { class: "note-area", rows: part.marks >= 6 ? 7 : part.marks >= 3 ? 4 : 2,
          placeholder: part.marks >= 6 ? "Plan the points first, then write it as a paragraph the way the mark scheme is banded…" : "Write your answer the way you would in the exam, then reveal the mark scheme…" });
        wrap.appendChild(ta);
        var msWrap = el("div", { class: "qz-ms", style: "display:none" });
        var selfRow = el("div", { class: "qz-selfmark", style: "display:none" });
        var reveal = el("button", { class: "btn primary", type: "button", text: "Reveal mark scheme", onclick: function () {
          msWrap.innerHTML = "<b>Mark scheme</b><ul>" + (part.ms || []).map(function (m) {
            return "<li>" + KOS.content.inline(m) + "</li>"; }).join("") + "</ul>" +
            (part.note ? '<p class="qz-note">' + KOS.content.inline(part.note) + "</p>" : "");
          msWrap.style.display = "";
          selfRow.style.display = "";
          reveal.disabled = true;
          KOS.content.typeset(msWrap);
          var first = selfRow.querySelector("button, input");
          if (first) first.focus();
        }});
        wrap.appendChild(el("div", { class: "lab-controls", style: "margin-top:10px" }, [reveal]));
        wrap.appendChild(msWrap);
        /* a row of mark buttons is one tap; a number field is three */
        var chosen = null;
        selfRow.appendChild(el("span", { class: "qz-self-l", text: "Self-mark" }));
        if (part.marks <= 10) {
          var grp = el("div", { class: "qz-markbtns", role: "group", "aria-label": "Marks awarded out of " + part.marks });
          for (var m = 0; m <= part.marks; m++) (function (m) {
            grp.appendChild(el("button", { class: "qz-markbtn", type: "button", text: String(m), "aria-pressed": "false", onclick: function () {
              chosen = m;
              grp.querySelectorAll(".qz-markbtn").forEach(function (b) { var on = Number(b.textContent) === m; b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on)); });
              onMark(m);
            }}));
          })(m);
          selfRow.appendChild(grp);
          selfRow.appendChild(el("span", { class: "qz-self-max", text: "/ " + part.marks }));
        } else {
          var markIn = el("input", { type: "number", min: 0, max: part.marks, style: "width:70px", "aria-label": "Marks awarded out of " + part.marks,
            oninput: function () { chosen = Math.max(0, Math.min(part.marks, parseInt(markIn.value || "0", 10))); onMark(chosen); } });
          selfRow.appendChild(markIn);
          selfRow.appendChild(el("span", { class: "qz-self-max", text: "/ " + part.marks }));
        }
        wrap.appendChild(selfRow);
        return wrap;
      }

      function render() {
        list.innerHTML = "";
        var shown = norm.filter(function (n) { return filter === "all" || tariff(n) === filter; });
        if (shuffled) {
          shown = shown.slice();
          for (var i = shown.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = shown[i]; shown[i] = shown[j]; shown[j] = t; }
        }
        chips.querySelectorAll(".qz-chip").forEach(function (b) { var on = b.dataset.f === filter; b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on)); });
        if (!shown.length) { list.appendChild(el("p", { class: "sub", text: "No questions at that tariff." })); return; }
        shown.forEach(function (n) {
          var it = n.item;
          var card = el("article", { class: "qz-card qz-exam" + (n.parts.length > 1 ? " qz-multi" : "") });
          var top = el("div", { class: "qz-exam-top" }, [
            el("b", { class: "qz-num", text: "Q" + (n.i + 1) }),
            srcLine(it),
            el("span", { class: "qz-marks qz-total", text: n.total + (n.total === 1 ? " mark" : " marks") })
          ].filter(Boolean));
          card.appendChild(top);
          if (it.ctx) {
            var stem = el("div", { class: "qz-stem", html: Array.isArray(it.ctx) ? KOS.content.renderBlocks(it.ctx) : "<p>" + KOS.content.inline(it.ctx) + "</p>" });
            card.appendChild(stem);
          }
          if (it.code) card.appendChild(el("div", { class: "qz-stem-code", html: KOS.content.renderBlocks([{ code: it.code }]) }));
          var marks = {};
          var logBtn;
          function onMark(pi, v) { marks[pi] = v; logBtn.disabled = false; }
          n.parts.forEach(function (p, pi) {
            var label = n.parts.length > 1 ? "(" + String.fromCharCode(97 + pi) + ")" : "";
            card.appendChild(partCard(p, label, it, function (v) { onMark(pi, v); }));
          });
          var done = el("span", { class: "qz-logged" });
          logBtn = el("button", { class: "btn jade", type: "button", text: "Log self-mark", disabled: true, onclick: function () {
            var got = 0;
            n.parts.forEach(function (p, pi) { got += marks[pi] || 0; });
            st.attempts++;
            store.save();
            /* FR-3.2 — self-marked exam questions are sessions too */
            KOS.sessions.log({
              type: "exam", subject: sid, ref: ref,
              metrics: { marks: got, max: n.total }
            });
            logged[n.i] = { got: got, max: n.total };
            updateTally();
            done.textContent = "Logged " + got + "/" + n.total;
            logBtn.disabled = true;
            KOS.ui.toast("Logged " + got + "/" + n.total + " — be a harsh marker, future-you benefits.");
          }});
          card.appendChild(el("div", { class: "lab-controls qz-exam-foot" }, [logBtn, done]));
          list.appendChild(card);
          KOS.content.typeset(card);
        });
      }
      render();
      updateTally();
    }
  };
})();
