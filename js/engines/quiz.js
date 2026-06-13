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

      var list = el("div", {});
      items.forEach(function (item, qi) {
        var card = el("div", { class: "qz-card" });
        card.appendChild(el("div", { class: "qz-q", html: "<b>Q" + (qi + 1) + ".</b> " + KOS.content.inline(item.q) }));
        var opts = el("div", { class: "qz-opts" });
        var locked = false;
        item.opts.forEach(function (opt, oi) {
          var btn = el("button", { class: "qz-opt", html: KOS.content.inline(opt), onclick: function () {
            if (locked) return;
            locked = true;
            answered++;
            var ok = oi === item.ans;
            if (ok) correct++;
            btn.classList.add(ok ? "right" : "wrong");
            opts.children[item.ans].classList.add("right");
            opts.querySelectorAll(".qz-opt").forEach(function (b) { b.disabled = true; });
            var why = el("div", { class: "qz-why " + (ok ? "ok" : "no"),
              html: (ok ? "✓ Correct. " : "✕ Not quite. ") + KOS.content.inline(item.why || "") });
            card.appendChild(why);
            KOS.content.typeset(why);
            if (answered === items.length) finish();
          }});
          opts.appendChild(btn);
        });
        card.appendChild(opts);
        list.appendChild(card);
      });
      holder.appendChild(list);
      KOS.content.typeset(list);

      var result = el("div", { class: "qz-result", style: "display:none" });
      holder.appendChild(result);

      function finish() {
        st.attempts++;
        st.lastPct = Math.round(100 * correct / items.length);
        if (correct > st.best) st.best = correct;
        store.save();
        var verdict = correct === items.length ? "Full marks ★" :
          correct >= items.length * 0.7 ? "Solid — review the misses." :
          "Worth another pass over the notes.";
        result.innerHTML = "<b>" + correct + " / " + items.length + "</b> — " + verdict;
        result.style.display = "";
        result.appendChild(el("button", { class: "btn gold", style: "margin-left:14px", text: "Retry",
          onclick: function () { KOS.quiz.mountMCQ(holder, sid, ref, items); } }));
      }
    },

    mountExam: function (holder, sid, ref, items) {
      holder.innerHTML = "";
      if (!items || !items.length) return;
      items.forEach(function (item, qi) {
        var card = el("div", { class: "qz-card" });
        card.appendChild(el("div", { class: "qz-q", html:
          "<b>Q" + (qi + 1) + ".</b> " + KOS.content.inline(item.q) +
          ' <span class="qz-marks">[' + item.marks + " marks]</span>" }));
        var ta = el("textarea", { class: "note-area", rows: 4,
          placeholder: "Write your answer the way you would in the exam, then reveal the mark scheme…" });
        card.appendChild(ta);
        var msWrap = el("div", { class: "qz-ms", style: "display:none" });
        var selfRow = el("div", { class: "lab-controls", style: "display:none;margin-top:8px" });
        card.appendChild(el("div", { class: "lab-controls", style: "margin-top:10px" }, [
          el("button", { class: "btn primary", text: "Reveal mark scheme", onclick: function () {
            msWrap.innerHTML = "<b>Mark scheme</b><ul>" + item.ms.map(function (m) {
              return "<li>" + KOS.content.inline(m) + "</li>"; }).join("") + "</ul>";
            msWrap.style.display = "";
            selfRow.style.display = "";
            KOS.content.typeset(msWrap);
          }})
        ]));
        card.appendChild(msWrap);
        var markIn = el("input", { type: "number", min: 0, max: item.marks, style: "width:70px" });
        selfRow.appendChild(el("label", {}, ["self-mark / " + item.marks, markIn]));
        selfRow.appendChild(el("button", { class: "btn jade", text: "Log it", onclick: function () {
          var v = Math.max(0, Math.min(item.marks, parseInt(markIn.value || "0", 10)));
          var st = qstats(sid, ref);
          st.attempts++;
          store.save();
          KOS.ui.toast("Logged " + v + "/" + item.marks + " — be a harsh marker, future-you benefits.");
        }}));
        card.appendChild(selfRow);
        holder.appendChild(card);
        KOS.content.typeset(card);
      });
    }
  };
})();
