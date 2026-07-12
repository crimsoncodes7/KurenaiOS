/* Kurenai OS — engines/flashcards.js
   SM-2 flashcard sessions (FR-1.2/1.4/1.5) + custom-card CRUD (FR-1.1).

   KOS.flashcards.session(holder, cards, opts)
     the core review engine over any card list (per-topic or the global due
     queue). 4-point rating: Again requeues the card into THIS session and
     resets its long-term schedule; Hard/Good/Easy graduate it.
   KOS.flashcards.mount(holder, sid, ref)
     the per-topic tab: session over curriculum + custom cards, plus the
     manage panel (add / edit / delete custom cards, per-card metrics).      */
(function () {
  "use strict";
  var el = KOS.ui.el, store = KOS.store;

  var RATE_META = [
    { cls: "again", label: "Again", key: "1" },
    { cls: "hard",  label: "Hard",  key: "2" },
    { cls: "good",  label: "Good",  key: "3" },
    { cls: "easy",  label: "Easy",  key: "4" }
  ];

  /* per-ref tallies (state.study.fc) — LOAD-BEARING, not legacy: the home
     dashboard ("Flashcards reviewed") and each subject dashboard read these.
     SM-2 metadata (KOS.srs) owns scheduling; this owns the lifetime counts. */
  function stats(sid, ref) {
    var st = store.state.study = store.state.study || {};
    var fc = st.fc = st.fc || {};
    var k = sid + ":" + ref;
    return fc[k] = fc[k] || { seen: 0, right: 0, wrong: 0 };
  }

  function fmtDate(iso) {
    if (!iso) return "—";
    var p = iso.split("-");
    return p[2] + "/" + p[1] + "/" + p[0].slice(2);
  }
  function dueLabel(m) {
    if (!m || !m.due) return "new card";
    var d = KOS.srs.daysBetween(KOS.srs.todayISO(), m.due);
    if (d < 0) return (-d) + "d overdue";
    if (d === 0) return "due today";
    return "due in " + d + "d";
  }

  /* FR-1.5 — the per-card history panel */
  function metricsPanel(card) {
    var m = KOS.srs.peek(card.key);
    var rows = m ? [
      ["Reviews", String(m.views)],
      ["Current rating", m.lastRating === null ? "—" : RATE_META[m.lastRating].label],
      ["Last reviewed", fmtDate(m.last)],
      ["Next review", fmtDate(m.due) + " (" + dueLabel(m) + ")"],
      ["Interval", m.ivl + (m.ivl === 1 ? " day" : " days")],
      ["Ease factor", m.ef.toFixed(2)],
      ["Lapses", String(m.lapses)]
    ] : [["Reviews", "0"], ["Status", "new — enters the schedule on its first rating"]];
    var dl = el("dl", { class: "fc-metrics" });
    rows.forEach(function (r) {
      dl.appendChild(el("dt", { text: r[0] }));
      dl.appendChild(el("dd", { text: r[1] }));
    });
    return dl;
  }

  /* ---------------- the session engine ---------------- */
  function session(holder, cards, opts) {
    opts = opts || {};
    holder.innerHTML = "";
    if (!cards || !cards.length) {
      holder.appendChild(el("p", { class: "fc-empty", text: opts.emptyText || "No cards here yet." }));
      return;
    }

    var queue = cards.map(function (_, i) { return i; });
    if (opts.shuffle) shuffleArr(queue);
    var total = cards.length;
    var graduated = 0;                       // cards that left the session
    var counts = { again: 0, hard: 0, good: 0, easy: 0 };
    var flipped = false, finished = false;
    var legacy = opts.sid && opts.ref ? stats(opts.sid, opts.ref) : null;

    var meter = el("div", { class: "fc-meter" });
    var stage = el("button", { class: "fc-card", "aria-label": "Flashcard — click to flip", onclick: flip });
    var front = el("div", { class: "fc-face fc-front" });
    var back = el("div", { class: "fc-face fc-back" });
    stage.appendChild(front); stage.appendChild(back);

    var infoWrap = el("div", { class: "fc-info", style: "display:none" });

    var rateRow = el("div", { class: "fc-rate", style: "visibility:hidden" },
      RATE_META.map(function (r, i) {
        return el("button", { class: "btn fc-r fc-r-" + r.cls, "data-rate": i,
          onclick: function (e) { e.stopPropagation(); rate(i); } }, [
          el("b", { text: r.label }),
          el("span", { class: "fc-r-hint", text: KOS.srs.RATINGS[i].hint })
        ]);
      }));

    var ctlRow = el("div", { class: "lab-controls", style: "justify-content:center;margin-top:10px" }, [
      el("button", { class: "btn", text: "⇄ Shuffle", onclick: function () { shuffleArr(queue); flipped = false; show(); } }),
      el("button", { class: "btn gold", text: "↺ Restart", onclick: restart }),
      el("button", { class: "btn", text: "ⓘ Card stats", onclick: function (e) {
        e.stopPropagation();
        infoWrap.style.display = infoWrap.style.display === "none" ? "" : "none";
        renderInfo();
      } })
    ]);
    var lifeStats = el("div", { class: "fc-life" });

    holder.appendChild(meter);
    holder.appendChild(stage);
    holder.appendChild(rateRow);
    holder.appendChild(infoWrap);
    holder.appendChild(ctlRow);
    holder.appendChild(lifeStats);

    function cur() { return cards[queue[0]]; }

    function renderInfo() {
      infoWrap.innerHTML = "";
      if (finished || infoWrap.style.display === "none") return;
      infoWrap.appendChild(el("div", { class: "fc-info-h", text: "Tracking history — this card" }));
      infoWrap.appendChild(metricsPanel(cur()));
    }

    function badgeHtml(c) {
      var b = "";
      if (opts.showTopic) b += '<span class="fc-topic">' + KOS.hub.esc(c.sid + " · " + c.ref) + "</span>";
      if (c.custom) b += '<span class="fc-custom">Custom</span>';
      var m = KOS.srs.peek(c.key);
      b += '<span class="fc-due">' + KOS.hub.esc(dueLabel(m)) + "</span>";
      return '<span class="fc-badges">' + b + "</span>";
    }

    function show() {
      var c = cur();
      flipped = false;
      stage.classList.remove("flipped");
      front.innerHTML = '<span class="fc-kind">Q · ' + queue.length + " left of " + total + "</span>" +
        badgeHtml(c) +
        "<div>" + KOS.content.inline(c.q) + "</div>" +
        '<span class="fc-hint">click to flip</span>';
      back.innerHTML = '<span class="fc-kind">A</span><div>' + KOS.content.inline(c.a) + "</div>";
      KOS.content.typeset(stage);
      rateRow.style.visibility = "hidden";
      meter.innerHTML = "";
      for (var i = 0; i < total; i++) {
        meter.appendChild(el("span", { class: "fc-pip" + (i < graduated ? " done" : i === graduated ? " cur" : "") }));
      }
      lifeStats.textContent = "This session: " + counts.again + " again · " + counts.hard + " hard · " +
        counts.good + " good · " + counts.easy + " easy";
      renderInfo();
    }
    function flip() {
      if (finished) return;
      flipped = !flipped;
      stage.classList.toggle("flipped", flipped);
      rateRow.style.visibility = flipped ? "visible" : "hidden";
    }
    function rate(r) {
      if (!flipped || finished) return;
      var c = cur();
      /* long-term schedule updates on EVERY rating — the SM-2 opinion.
         The in-session requeue below is a separate mechanism. */
      KOS.srs.rate(c.key, r);
      counts[RATE_META[r].cls]++;
      if (legacy) { legacy.seen++; r === 0 ? legacy.wrong++ : legacy.right++; }
      var idx = queue.shift();
      if (r === 0) {
        /* fix it NOW: back into the current session queue, a few cards on
           (or at the end of a short queue) so it resurfaces quickly */
        var at = Math.min(queue.length, 3);
        queue.splice(at, 0, idx);
      } else {
        graduated++;
      }
      store.save();
      if (queue.length) show();
      else finish();
    }
    function finish() {
      finished = true;
      stage.classList.remove("flipped");
      rateRow.style.visibility = "hidden";
      infoWrap.style.display = "none";
      var pct = total ? Math.round(100 * (counts.good + counts.easy) / (counts.good + counts.easy + counts.hard + counts.again)) : 0;
      front.innerHTML = '<span class="fc-kind">Session complete</span>' +
        "<div>" + total + (total === 1 ? " card" : " cards") + " graduated" +
        (counts.again === 0 ? " — clean sweep ★" : " · " + counts.again + " needed a retest") + "</div>" +
        '<span class="fc-hint">every card is rescheduled — check Due Today tomorrow</span>';
      KOS.content.typeset(stage);
      meter.querySelectorAll(".fc-pip").forEach(function (p) { p.classList.add("done"); });
      /* FR-3.2 — one session log entry per completed review batch */
      KOS.sessions.log({
        type: opts.type || "flashcards",
        subject: opts.sid || null, ref: opts.ref || null,
        metrics: { cards: total, again: counts.again, hard: counts.hard,
                   good: counts.good, easy: counts.easy, pct: pct }
      });
      if (opts.onFinish) opts.onFinish();
    }
    function restart() {
      queue = cards.map(function (_, i) { return i; });
      graduated = 0; finished = false; flipped = false;
      counts = { again: 0, hard: 0, good: 0, easy: 0 };
      show();
    }
    function shuffleArr(a) {
      for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = a[i]; a[i] = a[j]; a[j] = t;
      }
    }
    show();
  }

  /* ---------------- custom-card form ---------------- */
  function cardForm(sid, ref, existing, onDone) {
    var q = el("textarea", { class: "note-area fc-form-q", rows: 2, placeholder: "Question — what future-you gets asked" });
    var a = el("textarea", { class: "note-area fc-form-a", rows: 2, placeholder: "Answer — the wording that earns the mark" });
    if (existing) { q.value = existing.q; a.value = existing.a; }
    var form = el("div", { class: "fc-form" }, [
      el("div", { class: "fc-form-h", text: existing ? "Edit card" : "New custom card — " + sid + " · " + ref }),
      q, a,
      el("div", { class: "lab-controls" }, [
        el("button", { class: "btn primary", text: existing ? "Save changes" : "+ Add card", onclick: function () {
          if (!q.value.trim() || !a.value.trim()) { KOS.ui.toast("Both a question and an answer are needed.", true); return; }
          if (existing) KOS.srs.updateCustom(existing.id, q.value.trim(), a.value.trim());
          else KOS.srs.addCustom(sid, ref, q.value.trim(), a.value.trim());
          KOS.ui.toast(existing ? "Card updated." : "Card added — it joins this topic's deck and the SM-2 schedule.");
          onDone();
        } }),
        el("button", { class: "btn", text: "Cancel", onclick: onDone })
      ])
    ]);
    return form;
  }

  /* ---------------- manage panel (browse + CRUD + metrics) ---------------- */
  function managePanel(holder, sid, ref, rerender) {
    var cards = KOS.srs.cardsFor(sid, ref);
    var wrap = el("div", { class: "fc-manage" });
    wrap.appendChild(el("div", { class: "fc-manage-h" }, [
      el("b", { text: cards.length + (cards.length === 1 ? " card" : " cards") + " in this deck" }),
      el("span", { class: "sub", text: "Curriculum cards are fixed; your custom cards can be edited or deleted. ⓘ shows each card's SM-2 history." })
    ]));
    var addHolder = el("div", {});
    var addBtn = el("button", { class: "btn primary", text: "+ New custom card", onclick: function () {
      addHolder.innerHTML = "";
      addHolder.appendChild(cardForm(sid, ref, null, rerender));
      addBtn.style.display = "none";
    } });
    wrap.appendChild(addBtn);
    wrap.appendChild(addHolder);

    cards.forEach(function (c) {
      var row = el("div", { class: "fc-row" + (c.custom ? " custom" : "") });
      var detail = el("div", { class: "fc-row-detail", style: "display:none" });
      row.appendChild(el("div", { class: "fc-row-top" }, [
        el("span", { class: "fc-row-q", html: KOS.content.inline(c.q) }),
        c.custom ? el("span", { class: "fc-custom", text: "Custom" }) : el("span", { class: "fc-curr", text: "Curriculum" }),
        el("button", { class: "mini-btn", text: "ⓘ", "aria-label": "Card metrics", onclick: function () {
          detail.style.display = detail.style.display === "none" ? "" : "none";
        } }),
        c.custom ? el("button", { class: "mini-btn", text: "✎", "aria-label": "Edit card", onclick: function () {
          detail.style.display = "";
          detail.innerHTML = "";
          detail.appendChild(cardForm(sid, ref, c, rerender));
        } }) : null,
        c.custom ? el("button", { class: "mini-btn danger", text: "✕", "aria-label": "Delete card", onclick: function () {
          KOS.ui.confirm({ title: "Delete this card?", body: "The card and its review history go with it.", danger: true, confirm: "Delete" }, function () {
            KOS.srs.deleteCustom(c.id);
            KOS.ui.toast("Card deleted.");
            rerender();
          });
        } }) : null
      ]));
      row.appendChild(el("div", { class: "fc-row-a", html: KOS.content.inline(c.a) }));
      detail.appendChild(metricsPanel(c));
      row.appendChild(detail);
      wrap.appendChild(row);
      KOS.content.typeset(row);
    });
    holder.appendChild(wrap);
  }

  /* ---------------- per-topic mount ---------------- */
  function mount(holder, sid, ref) {
    holder.innerHTML = "";
    var cards = KOS.srs.cardsFor(sid, ref);
    var mode = "study";

    var bar = el("div", { class: "fc-modebar" }, [
      el("button", { class: "btn fc-mode active", text: "Study", onclick: function () { mode = "study"; render(); } }),
      el("button", { class: "btn fc-mode", text: "⚙ Manage cards (" + cards.length + ")", onclick: function () { mode = "manage"; render(); } })
    ]);
    var body = el("div", {});
    holder.appendChild(bar);
    holder.appendChild(body);

    function render() {
      cards = KOS.srs.cardsFor(sid, ref);
      bar.querySelectorAll(".fc-mode").forEach(function (b, i) {
        b.classList.toggle("active", (i === 0) === (mode === "study"));
        if (i === 1) b.textContent = "⚙ Manage cards (" + cards.length + ")";
      });
      body.innerHTML = "";
      if (mode === "study") {
        var holder2 = el("div", { class: "fc-wrap-inner" });
        body.appendChild(holder2);
        session(holder2, cards, { sid: sid, ref: ref, type: "flashcards",
          emptyText: "No cards on this topic yet — add your own under ⚙ Manage cards." });
      } else {
        managePanel(body, sid, ref, render);
      }
    }
    render();
  }

  KOS.flashcards = {
    stats: stats,
    session: session,
    mount: mount,
    metricsPanel: metricsPanel
  };
})();
