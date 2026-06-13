/* Kurenai OS — engines/flashcards.js
   Per-spec-point flashcard sessions with flip, shuffle and self-rating.
   Stats persist per ref, ready to feed the SM-2 engine in Build 2. */
(function () {
  "use strict";
  var el = KOS.ui.el, store = KOS.store;

  function stats(sid, ref) {
    var st = store.state.study = store.state.study || {};
    var fc = st.fc = st.fc || {};
    var k = sid + ":" + ref;
    return fc[k] = fc[k] || { seen: 0, right: 0, wrong: 0 };
  }

  KOS.flashcards = {
    stats: stats,
    mount: function (holder, sid, ref, cards) {
      holder.innerHTML = "";
      if (!cards || !cards.length) return;
      var order = cards.map(function (_, i) { return i; });
      var pos = 0, flipped = false, sessionRight = 0, sessionDone = 0;
      var st = stats(sid, ref);

      var meter = el("div", { class: "fc-meter" });
      var stage = el("button", { class: "fc-card", "aria-label": "Flashcard — click to flip",
        onclick: flip });
      var front = el("div", { class: "fc-face fc-front" });
      var back = el("div", { class: "fc-face fc-back" });
      stage.appendChild(front); stage.appendChild(back);

      var rateRow = el("div", { class: "fc-rate", style: "visibility:hidden" }, [
        el("button", { class: "btn danger", text: "✕ Didn't know", onclick: function (e) { e.stopPropagation(); rate(false); } }),
        el("button", { class: "btn jade", text: "✓ Knew it", onclick: function (e) { e.stopPropagation(); rate(true); } })
      ]);
      var ctlRow = el("div", { class: "lab-controls", style: "justify-content:center;margin-top:10px" }, [
        el("button", { class: "btn", text: "⇄ Shuffle", onclick: shuffle }),
        el("button", { class: "btn gold", text: "↺ Restart", onclick: restart })
      ]);
      var lifeStats = el("div", { class: "fc-life" });

      holder.appendChild(meter);
      holder.appendChild(stage);
      holder.appendChild(rateRow);
      holder.appendChild(ctlRow);
      holder.appendChild(lifeStats);

      function show() {
        var c = cards[order[pos]];
        flipped = false;
        stage.classList.remove("flipped");
        front.innerHTML = '<span class="fc-kind">Q ' + (pos + 1) + " / " + cards.length + "</span>" +
          "<div>" + KOS.content.inline(c[0]) + "</div>" +
          '<span class="fc-hint">click to flip</span>';
        back.innerHTML = '<span class="fc-kind">A</span><div>' + KOS.content.inline(c[1]) + "</div>";
        rateRow.style.visibility = "hidden";
        meter.innerHTML = "";
        for (var i = 0; i < cards.length; i++) {
          meter.appendChild(el("span", { class: "fc-pip" + (i < sessionDone ? " done" : i === pos ? " cur" : "") }));
        }
        lifeStats.textContent = "All-time on this card set: " + st.right + " ✓ · " + st.wrong + " ✕ · " + st.seen + " seen";
      }
      function flip() {
        flipped = !flipped;
        stage.classList.toggle("flipped", flipped);
        rateRow.style.visibility = flipped ? "visible" : "hidden";
      }
      function rate(ok) {
        st.seen++; ok ? (st.right++, sessionRight++) : st.wrong++;
        sessionDone++;
        store.save();
        if (pos < order.length - 1) { pos++; show(); }
        else finish();
      }
      function finish() {
        stage.classList.remove("flipped");
        rateRow.style.visibility = "hidden";
        front.innerHTML = '<span class="fc-kind">Session complete</span>' +
          "<div>" + sessionRight + " / " + cards.length + " known" +
          (sessionRight === cards.length ? " — clean sweep ★" : "") + "</div>" +
          '<span class="fc-hint">restart or shuffle to go again</span>';
        stage.onclick = null;
        meter.querySelectorAll(".fc-pip").forEach(function (p) { p.classList.add("done"); });
      }
      function shuffle() {
        for (var i = order.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var t = order[i]; order[i] = order[j]; order[j] = t;
        }
        restart(true);
      }
      function restart(keepOrder) {
        if (keepOrder !== true) order = cards.map(function (_, i) { return i; });
        pos = 0; sessionDone = 0; sessionRight = 0;
        stage.onclick = flip;
        show();
      }
      show();
    }
  };
})();
