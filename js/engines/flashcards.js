/* Kurenai OS — engines/flashcards.js
   SM-2 flashcard sessions (FR-1.2/1.4/1.5) + custom-card CRUD (FR-1.1).

   KOS.flashcards.session(holder, cards, opts)
     the core review engine over any card list (per-topic or the global due
     queue). 4-point rating: Again requeues the card into THIS session and
     resets its long-term schedule; Hard/Good/Easy graduate it.
   KOS.flashcards.mount(holder, sid, ref, {onEdit})
     the per-topic tab: session over the effective deck (the curriculum's
     cards, or the user's fork of them, plus custom cards) and the deck
     browser with per-card SM-2 metrics. Editing lives in the study editor
     (modules/editor.js); onEdit opens it.

   Graphite (frame 8d): a centred column — the mode pills, a row of pips,
   the card over a second card's edge, the four ratings (each naming the
   interval it schedules), one line of the card's history, the keys, and
   the deck's figures with the session's controls. Every element carries
   its hook explicitly.                                                    */
(function () {
  "use strict";
  var el = KOS.ui.el, store = KOS.store;

  var RATE_META = [
    { cls: "again", label: "Again", key: "1" },
    { cls: "hard",  label: "Hard",  key: "2" },
    { cls: "good",  label: "Good",  key: "3" },
    { cls: "easy",  label: "Easy",  key: "4" }
  ];
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
  function dayName(iso) {
    var p = iso.split("-");
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    return DAYS[d.getDay()] + " " + d.getDate() + " " + MONTHS[d.getMonth()];
  }
  function dueLabel(m) {
    if (!m || !m.due) return "new card";
    var d = KOS.srs.daysBetween(KOS.srs.todayISO(), m.due);
    if (d < 0) return (-d) + "d overdue";
    if (d === 0) return "due today";
    return "due in " + d + "d";
  }
  function ivlText(days) { return days <= 0 ? "<1m" : days < 30 ? days + "d" : days < 365 ? Math.round(days / 30) + "mo" : (days / 365).toFixed(1) + "y"; }
  function kbd(t) { return el("kbd", { class: "k-kbd", text: t }); }

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
    var dl = el("dl", { class: "k-fc-metrics", "data-ui": "fc.metrics" });
    rows.forEach(function (r) {
      dl.appendChild(el("dt", { text: r[0] }));
      dl.appendChild(el("dd", { text: r[1] }));
    });
    return dl;
  }
  /* the card's history as one line: "seen 4× · last Tue 22 Sep · 1 lapse · ease 2.5" */
  function historyLine(card) {
    var m = KOS.srs.peek(card.key);
    if (!m || !m.views) return "new card — enters the schedule on its first rating";
    return ["seen " + m.views + "×", m.last ? "last " + dayName(m.last) : null,
      m.lapses ? m.lapses + (m.lapses === 1 ? " lapse" : " lapses") : null,
      "ease " + (Math.round(m.ef * 10) / 10)].filter(Boolean).join(" · ");
  }

  /* ---------------- the session engine ---------------- */
  function session(holder, cards, opts) {
    opts = opts || {};
    holder.innerHTML = "";
    if (!cards || !cards.length) {
      var empty = KOS.ui.emptyState({
        compact: true, mark: "札", title: "No cards here yet",
        body: opts.emptyText || "Add a custom card to begin this deck."
      });
      empty.setAttribute("data-ui", (empty.getAttribute("data-ui") || "") + " fc.empty");
      holder.appendChild(empty);
      return;
    }

    var queue = cards.map(function (_, i) { return i; });
    if (opts.shuffle) shuffleArr(queue);
    var total = cards.length;
    var graduated = 0;                       // cards that left the session
    var counts = { again: 0, hard: 0, good: 0, easy: 0 };
    var flipped = false, finished = false;
    var legacy = opts.sid && opts.ref ? stats(opts.sid, opts.ref) : null;

    var meter = el("div", { class: "k-fc-pips", "data-ui": "fc.meter", "aria-hidden": "true" });
    var front = el("div", { class: "k-fc-face", "data-ui": "fc.front" });
    var back = el("div", { class: "k-fc-face", "data-ui": "fc.back", "data-side": "back" });
    var stage = el("button", { type: "button", class: "k-fc-card", "data-ui": "fc.card", "aria-label": "Flashcard — press to flip", onclick: flip }, [front, back]);
    var deckEdge = el("div", { class: "k-fc-stack" }, [el("span", { class: "k-fc-under", "aria-hidden": "true" }), stage]);

    var rateRow = el("div", { class: "k-fc-rate", "data-ui": "fc.rate", role: "group", "aria-label": "Rate your recall" },
      RATE_META.map(function (r, i) {
        return el("button", { type: "button", class: "k-fc-r", "data-ui": "fc.r", "data-rate": i, "data-kind": r.cls,
          "aria-keyshortcuts": r.key, "aria-label": r.label + " — " + KOS.srs.RATINGS[i].hint, title: KOS.srs.RATINGS[i].hint,
          onclick: function (e) { e.stopPropagation(); rate(i); } }, [
          el("span", { class: "k-fc-r-top" }, [
            el("b", { text: r.label }),
            el("kbd", { class: "k-kbd", "data-ui": "fc.r-key", "aria-hidden": "true", text: r.key })
          ]),
          el("span", { class: "k-fc-r-ivl", "data-ui": "fc.r-hint" })
        ]);
      }));
    var history = el("p", { class: "k-fc-history", "data-ui": "fc.history" });
    var infoWrap = el("div", { class: "k-fc-info", "data-ui": "fc.info", hidden: "" });

    /* audit REF-8: the engine had no keyboard support at all. The keys are
       printed under the card, because a shortcut nobody can see is a
       shortcut nobody uses. */
    var keyHint = el("p", { class: "k-fc-keys", "data-ui": "fc.keys" }, [
      kbd("Space"), " flip · ", kbd("1"), "–", kbd("4"), " rate · ", kbd("→"), " reveal, then Good"
    ]);
    var deckLine = el("span", { class: "k-fc-deck" });
    var foot = el("div", { class: "k-fc-foot", "data-ui": "lab.controls fc.foot" }, [
      deckLine,
      el("button", { type: "button", class: "k-fc-foot-btn", text: "⇄ Shuffle", onclick: function () { shuffleArr(queue); flipped = false; show(); } }),
      el("button", { type: "button", class: "k-fc-foot-btn", text: "↺ Restart", onclick: restart }),
      el("button", { type: "button", class: "k-fc-foot-btn", "aria-expanded": "false", text: "ⓘ Card stats", onclick: function (e) {
        e.stopPropagation();
        infoWrap.hidden = !infoWrap.hidden;
        e.currentTarget.setAttribute("aria-expanded", String(!infoWrap.hidden));
        renderInfo();
      } })
    ]);
    var lifeStats = el("p", { class: "k-fc-life", "data-ui": "fc.life" });

    [meter, deckEdge, rateRow, history, keyHint, foot, infoWrap, lifeStats].forEach(function (n) { holder.appendChild(n); });
    bindKeys();

    function cur() { return cards[queue[0]]; }

    function renderInfo() {
      infoWrap.innerHTML = "";
      if (finished || infoWrap.hidden) return;
      infoWrap.appendChild(el("h3", { class: "k-kicker", text: "Tracking history — this card" }));
      infoWrap.appendChild(metricsPanel(cur()));
    }
    function paintDeck() {
      var today = KOS.srs.todayISO(), due = 0, fresh = 0, learnt = 0;
      cards.forEach(function (c) {
        var m = KOS.srs.peek(c.key);
        if (!m || !m.due) fresh++;
        else { learnt++; if (m.due <= today) due++; }
      });
      deckLine.textContent = [due ? due + " due" : null, fresh ? fresh + " new" : null, learnt ? learnt + " learnt" : null]
        .filter(Boolean).join(" · ");
    }

    function badgeHtml(c) {
      var b = "";
      if (opts.showTopic) b += '<span class="k-chip" data-ui="fc.topic">' + KOS.hub.esc(c.sid + " · " + c.ref) + "</span>";
      if (c.custom) b += '<span class="k-chip" data-ui="fc.custom" data-tone="bloom">' + (c.ai ? "AI · Custom" : "Custom") + "</span>";
      b += '<span class="k-chip" data-tone="muted" data-ui="fc.due">' + KOS.hub.esc(dueLabel(KOS.srs.peek(c.key))) + "</span>";
      return '<span class="k-fc-badges">' + b + "</span>";
    }

    function show() {
      var c = cur();
      flipped = false;
      KOS.ui.state(stage, "flipped", false);
      front.innerHTML = '<span class="k-fc-kind">Question · ' + queue.length + " left of " + total + "</span>" +
        '<div class="k-fc-text">' + KOS.content.inline(c.q) + "</div>" + badgeHtml(c) +
        '<span class="k-fc-hint">press to flip</span>';
      back.innerHTML = '<span class="k-fc-kind">Answer</span>' +
        '<div class="k-fc-text">' + KOS.content.inline(c.a) + "</div>" +
        '<span class="k-fc-q">Q · ' + KOS.content.inline(c.q) + "</span>";
      KOS.content.typeset(stage);
      KOS.ui.state(rateRow, "concealed", true);
      RATE_META.forEach(function (r, i) {
        rateRow.children[i].querySelector("[data-ui~='fc.r-hint']").textContent = ivlText(KOS.srs.preview(c.key, i));
      });
      meter.innerHTML = "";
      for (var i = 0; i < total; i++) {
        meter.appendChild(el("span", { "data-ui": "fc.pip", "data-state": i < graduated ? "done" : i === graduated ? "cur" : null }));
      }
      history.textContent = historyLine(c);
      lifeStats.textContent = counts.again + counts.hard + counts.good + counts.easy
        ? "This session: " + counts.again + " again · " + counts.hard + " hard · " + counts.good + " good · " + counts.easy + " easy" : "";
      paintDeck();
      renderInfo();
    }
    function flip() {
      if (finished) return;
      flipped = !flipped;
      KOS.ui.state(stage, "flipped", flipped);
      KOS.ui.state(rateRow, "concealed", !flipped);
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
      KOS.ui.state(stage, "flipped", false);
      KOS.ui.state(rateRow, "concealed", true);
      infoWrap.hidden = true;
      var pct = total ? Math.round(100 * (counts.good + counts.easy) / (counts.good + counts.easy + counts.hard + counts.again)) : 0;
      front.innerHTML = '<span class="k-fc-kind">Session complete</span>' +
        '<div class="k-fc-text">' + total + (total === 1 ? " card" : " cards") + " graduated" +
        (counts.again === 0 ? " — clean sweep ★" : " · " + counts.again + " needed a retest") + "</div>" +
        '<span class="k-fc-hint">every card is rescheduled — check Due Today tomorrow</span>';
      KOS.content.typeset(stage);
      history.textContent = "";
      meter.querySelectorAll("[data-ui~='fc.pip']").forEach(function (p) { KOS.ui.state(p, "cur", false); KOS.ui.state(p, "done", true); });
      lifeStats.textContent = "This session: " + counts.again + " again · " + counts.hard + " hard · " + counts.good + " good · " + counts.easy + " easy";
      paintDeck();
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

    /* The listener rides `document` so the keys work without hunting for
       focus, and removes ITSELF the first time it fires after the holder has
       left the page — openTab() replaces the panel wholesale, so there is no
       teardown callback to hang it on and a plain listener would accumulate
       one dead session per tab switch. */
    function bindKeys() {
      if (typeof document === "undefined" || !document.addEventListener) return;
      document.addEventListener("keydown", onKey);
    }
    function onKey(e) {
      if (!holder.ownerDocument || !holder.ownerDocument.contains(holder)) {
        document.removeEventListener("keydown", onKey);
        return;
      }
      if (finished || e.metaKey || e.ctrlKey || e.altKey) return;
      /* never steal a key from someone writing a custom card, a note or a
         self-mark — the manage panel lives in this same holder */
      var t = e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName || ""))) return;
      var k = e.key;
      if (k === " " || k === "Spacebar" || k === "Enter") { e.preventDefault(); flip(); return; }
      if (k === "ArrowLeft") { if (flipped) { e.preventDefault(); flip(); } return; }
      if (k === "ArrowRight") { e.preventDefault(); flipped ? rate(2) : flip(); return; }
      if (k >= "1" && k <= "4") {
        if (!flipped) return;              /* grading a face-down card is a misclick, not an intent */
        e.preventDefault();
        rate(Number(k) - 1);
      }
    }
    show();
  }

  /* ---------------- custom-card form ----------------
     Used only where the study editor is not available (the Personal Deck,
     which has no topic page): a topic's own deck edits through the editor. */
  function cardForm(sid, ref, existing, onDone) {
    var q = el("textarea", { class: "k-input", "data-ui": "ui.note-area fc.form-q", rows: 2, "aria-label": "Question", placeholder: "Question — what future-you gets asked" });
    var a = el("textarea", { class: "k-input", "data-ui": "ui.note-area fc.form-a", rows: 2, "aria-label": "Answer", placeholder: "Answer — the wording that earns the mark" });
    if (existing) { q.value = existing.q; a.value = existing.a; }
    return el("div", { class: "k-card k-fc-form", "data-ui": "fc.form" }, [
      el("h3", { class: "k-card-title", text: existing ? "Edit card" : "New card" }),
      q, a,
      el("div", { class: "k-fc-form-actions", "data-ui": "lab.controls" }, [
        el("button", { type: "button", class: "k-btn", text: "Cancel", onclick: onDone }),
        el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: existing ? "Save changes" : "+ Add card", onclick: function () {
          if (!q.value.trim() || !a.value.trim()) { KOS.ui.toast("Both a question and an answer are needed.", true); return; }
          if (existing) KOS.srs.updateCustom(existing.id, q.value.trim(), a.value.trim());
          else KOS.srs.addCustom(sid, ref, q.value.trim(), a.value.trim());
          KOS.ui.toast(existing ? "Card updated." : "Card added — it joins this deck and the SM-2 schedule.");
          onDone();
        } })
      ])
    ]);
  }

  /* ---------------- the deck browser ----------------
     Every card in the topic's deck, one row each, with its SM-2 history a
     tap away. On a topic page nothing is edited here: the study editor is
     the one place a card's wording changes, and "Edit deck" opens it. A
     deck with no topic page (the Personal Deck) keeps its own form. */
  function managePanel(holder, sid, ref, rerender, opts) {
    var cards = KOS.srs.cardsFor(sid, ref);
    var forked = KOS.edits && KOS.edits.has(sid, ref, "flashcards");
    var inlineCrud = !(opts && (opts.onEdit || opts.editing));
    var wrap = el("div", { class: "k-fc-manage", "data-ui": "fc.manage" });
    var head = el("div", { class: "k-sectionhead" }, [
      el("h2", { text: cards.length + (cards.length === 1 ? " card" : " cards") + " in this deck" }),
      el("span", { class: "k-sectionhead-sub", "data-ui": "part.sub", text: forked
        ? "Your edited version of the curriculum's deck."
        : "Curriculum cards and your own, with each card's review history." })
    ]);
    var actions = el("span", { class: "k-sectionhead-actions" });
    head.appendChild(actions);
    if (opts && opts.onEdit && !opts.editing) actions.appendChild(el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: "✎ Edit deck", onclick: opts.onEdit }));
    wrap.appendChild(head);
    var addHolder = el("div", {});
    if (inlineCrud) {
      var addBtn = el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: "+ New card", onclick: function () {
        addHolder.innerHTML = "";
        addHolder.appendChild(cardForm(sid, ref, null, rerender));
        addBtn.hidden = true;
      } });
      actions.appendChild(addBtn);
      wrap.appendChild(addHolder);
    }
    if (!cards.length) {
      wrap.appendChild(KOS.ui.emptyState({ compact: true, mark: "札", title: "No cards yet",
        body: inlineCrud ? "Add the first card above." : "Edit the deck to write the first card." }));
      holder.appendChild(wrap);
      return;
    }
    var list = el("ol", { class: "k-fc-list", "aria-label": "Cards in this deck" });
    cards.forEach(function (c, i) {
      var m = KOS.srs.peek(c.key);
      var detail = el("div", { class: "k-fc-row-detail", hidden: "" });
      var info = el("button", { type: "button", class: "k-fc-row-info", "aria-expanded": "false",
        "aria-label": "Review history for card " + (i + 1), title: "Review history",
        onclick: function () {
          var open = detail.hidden;
          detail.hidden = !open;
          info.setAttribute("aria-expanded", String(open));
          KOS.ui.state(info, "on", open);
        } }, [m && m.views ? m.views + " review" + (m.views === 1 ? "" : "s") : "new", el("span", { "aria-hidden": "true", text: " ▾" })]);
      var badge = c.custom
        ? el("span", { class: "k-chip", "data-ui": "fc.custom", "data-tone": "bloom", text: c.ai ? "AI · Custom" : "Custom" })
        : el("span", { class: "k-chip", "data-tone": "muted", text: forked ? "Edited" : "Curriculum" });
      var row = el("li", { class: "k-fc-row", "data-ui": "fc.row", "data-state": c.custom ? "custom" : null }, [
        el("span", { class: "k-fc-row-n k-mono", "aria-hidden": "true", text: String(i + 1) }),
        el("div", { class: "k-fc-row-main" }, [
          el("div", { class: "k-fc-row-q", html: KOS.content.inline(c.q) }),
          el("div", { class: "k-fc-row-a", html: KOS.content.inline(c.a) })
        ]),
        el("div", { class: "k-fc-row-side" }, [
          badge,
          info,
          m && m.due ? el("span", { class: "k-fc-row-due", text: dueLabel(m) }) : null,
          inlineCrud && c.custom ? el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", text: "✎", "aria-label": "Edit card", onclick: function () {
            detail.hidden = false; detail.innerHTML = ""; detail.appendChild(cardForm(sid, ref, c, rerender));
          } }) : null,
          inlineCrud && c.custom ? el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "data-intent": "danger", text: "✕", "aria-label": "Delete card", onclick: function () {
            KOS.ui.confirm({ title: "Delete this card?", body: "The card and its review history go with it.", danger: true, confirm: "Delete" }, function () {
              KOS.srs.deleteCustom(c.id); KOS.ui.toast("Card deleted."); rerender();
            });
          } }) : null
        ].filter(Boolean)),
        detail
      ]);
      detail.appendChild(metricsPanel(c));
      list.appendChild(row);
      KOS.content.typeset(row);
    });
    wrap.appendChild(list);
    holder.appendChild(wrap);
  }

  /* ---------------- per-topic mount ---------------- */
  function mount(holder, sid, ref, opts) {
    opts = opts || {};
    holder.innerHTML = "";
    var cards = KOS.srs.cardsFor(sid, ref);
    var mode = "study";

    var studyTab = el("button", { type: "button", class: "k-seg-item", "data-ui": "fc.mode", role: "tab", text: "Study", onclick: function () { mode = "study"; render(); } });
    var deckTab = el("button", { type: "button", class: "k-seg-item", "data-ui": "fc.mode", role: "tab", text: "Deck (" + cards.length + ")", onclick: function () { mode = "manage"; render(); } });
    var bar = el("div", { class: "k-fc-modes" }, [
      el("div", { class: "k-seg k-seg--loose", role: "tablist", "aria-label": "Flashcards" }, [studyTab, deckTab]),
      /* a topic page writes cards in the study editor; a deck with no page
         adds them in the deck browser's own form */
      opts.editing ? null : el("button", { type: "button", class: "k-seg-item k-fc-new", "data-ui": "fc.new", text: "+ New card",
        onclick: function () { if (opts.onEdit) opts.onEdit(); else { mode = "manage"; render(); } } })
    ].filter(Boolean));
    var body = el("div", { class: "k-fc-body" });
    holder.appendChild(bar);
    holder.appendChild(body);

    function render() {
      cards = KOS.srs.cardsFor(sid, ref);
      [studyTab, deckTab].forEach(function (b, i) {
        var on = (i === 0) === (mode === "study");
        KOS.ui.state(b, "active", on);
        b.setAttribute("aria-selected", String(on));
      });
      deckTab.textContent = "Deck (" + cards.length + ")";
      body.innerHTML = "";
      if (mode === "study") {
        var holder2 = el("div", { class: "k-fc" });
        body.appendChild(holder2);
        session(holder2, cards, { sid: sid, ref: ref, type: "flashcards",
          emptyText: "No cards on this topic yet — press Edit to write the first one." });
      } else {
        managePanel(body, sid, ref, render, opts);
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
