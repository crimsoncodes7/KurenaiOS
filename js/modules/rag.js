/* Kurenai OS — modules/rag.js
   RAG topic flagging (FR-3.3), hybrid:
   - MANUAL: a Red/Amber/Green confidence the user sets per topic (stored on
     the progress entry as `rag` — confidence, a separate concept from the
     completion status field).
   - AUTO: a 0–100 score computed from real performance data — SM-2 lapse
     rate / ease / overdue cards, quiz scores, and exam/paper tracker results
     on that topic. No data → no rating (null), never a fake green.
   Manual takes display precedence; the auto value stays visible so the user
   can see when their confidence disagrees with their data.                  */
(function () {
  "use strict";
  var el = KOS.ui.el, store = KOS.store;

  var BANDS = { r: { label: "Red", word: "struggling" }, a: { label: "Amber", word: "shaky" }, g: { label: "Green", word: "solid" } };

  function band(score) { return score >= 70 ? "g" : score >= 45 ? "a" : "r"; }

  function manual(sid, ref) {
    var p = store.peekProgress(sid, ref);
    return (p && p.rag) || null;
  }
  function setManual(sid, ref, v) {
    var p = store.getProgress(sid, ref);
    p.rag = v || null;
    store.save();
  }

  /* the auto-computed rating: {score, band, reasons[]} or null (no data) */
  function auto(sid, ref) {
    var score = 100, reasons = [], hasData = false;

    /* SM-2 signals from this topic's cards */
    var lapses = 0, views = 0, efSum = 0, tracked = 0, overdue = 0;
    var today = KOS.srs.todayISO();
    KOS.srs.cardsFor(sid, ref).forEach(function (c) {
      var m = KOS.srs.peek(c.key);
      if (!m || !m.views) return;
      tracked++;
      lapses += m.lapses; views += m.views; efSum += m.ef;
      if (m.due && m.due < today) overdue++;
    });
    if (tracked) {
      hasData = true;
      var lapseRate = lapses / Math.max(1, views);
      if (lapseRate > 0.15) {
        score -= Math.min(35, Math.round(lapseRate * 80));
        reasons.push(lapses + (lapses === 1 ? " lapse" : " lapses") + " in " + views + " reviews");
      }
      var avgEf = efSum / tracked;
      if (avgEf < 2.3) {
        score -= Math.min(20, Math.round((2.3 - avgEf) * 40));
        reasons.push("ease " + avgEf.toFixed(2));
      }
      if (overdue) {
        score -= Math.min(15, overdue * 3);
        reasons.push(overdue + " overdue card" + (overdue === 1 ? "" : "s"));
      }
    }

    /* quiz performance on this topic */
    var study = store.state.study || {};
    var q = (study.quiz || {})[sid + ":" + ref];
    if (q && q.attempts) {
      hasData = true;
      if (q.lastPct < 80) {
        score -= Math.min(25, Math.round((100 - q.lastPct) * 0.25));
        reasons.push("quiz " + q.lastPct + "%");
      }
    }

    /* exam / practice-paper results linked to this topic (recent 3) */
    var recs = KOS.tracker.forRef(sid, ref)
      .map(function (e) { return KOS.tracker.pct(e); })
      .filter(function (p) { return p != null; })
      .slice(-3);
    if (recs.length) {
      hasData = true;
      var avgPct = Math.round(recs.reduce(function (a, p) { return a + p; }, 0) / recs.length);
      if (avgPct < 75) {
        score -= Math.min(30, Math.round((100 - avgPct) * 0.3));
        reasons.push("exam/paper avg " + avgPct + "%");
      }
    }

    if (!hasData) return null;
    score = Math.max(0, Math.min(100, score));
    return { score: score, band: band(score), reasons: reasons };
  }

  /* what to show/sort by: manual wins display, auto stays alongside */
  function effective(sid, ref) {
    var m = manual(sid, ref), a = auto(sid, ref);
    return {
      band: m || (a ? a.band : null),
      source: m ? "manual" : a ? "auto" : null,
      manual: m,
      auto: a,
      disagree: !!(m && a && m !== a.band)
    };
  }

  /* ---------------- prescriptive analytics: recommended next ---------------- */
  function worst(sid, limit) {
    var out = [];
    var sids = sid ? [sid] : ["compsci", "maths", "it"];
    sids.forEach(function (s) {
      KOS.hub.LEAVES[s].forEach(function (leaf) {
        var e = effective(s, leaf.ref);
        if (!e.band || e.band === "g") return;
        var rank = e.band === "r" ? 2 : 1;
        var score = e.auto ? e.auto.score : (e.band === "r" ? 20 : 55);
        out.push({ sid: s, ref: leaf.ref, title: leaf.title, e: e,
          severity: rank * 1000 + (100 - score) });
      });
    });
    out.sort(function (a, b) { return b.severity - a.severity; });
    return out.slice(0, limit || 6);
  }

  /* one line on why a topic is flagged: its band, then the evidence (or
     that the rating is the user's own) — "Red · 3 lapses on its cards" */
  function why(t) {
    var reasons = t.e.auto && t.e.auto.reasons.length ? t.e.auto.reasons.join(" · ")
      : "your own rating";
    return BANDS[t.e.band].label + " · " + reasons;
  }

  function dot(bandId, title) {
    return el("span", { class: "rag-dot rag-" + bandId, title: title || BANDS[bandId].label });
  }

  /* the "Recommended next" panel (home + subject dashboards) */
  function panel(sid) {
    var list = worst(sid, 6);
    if (!list.length) return null;
    var wrap = el("div", { class: "rag-panel" });
    wrap.appendChild(el("div", { class: "dl-h" }, [
      el("b", { text: "Recommended next — flagged topics" }),
      el("span", { class: "sub", text: "from your confidence + performance data" })
    ]));
    list.forEach(function (t) {
      var reasons = t.e.auto && t.e.auto.reasons.length ? t.e.auto.reasons.join(" · ")
        : "your own " + BANDS[t.e.manual].label + " rating";
      var row = el("button", { class: "rag-item", onclick: function () {
        KOS.show("ref", { subject: t.sid, ref: t.ref });
      } }, [
        dot(t.e.band, (t.e.source === "manual" ? "Your rating: " : "Data says: ") + BANDS[t.e.band].label),
        t.e.disagree ? dot(t.e.auto.band, "…but the data says " + BANDS[t.e.auto.band].label) : null,
        el("span", { class: "rag-item-t" }, [
          el("b", { text: t.ref + " " + t.title }),
          el("span", { class: "rag-why", text: reasons })
        ]),
        el("span", { class: "rag-go", text: "study →" })
      ]);
      wrap.appendChild(row);
    });
    return wrap;
  }

  /* the per-topic picker for the ref-page control row.

     Category 7 Phase C (audit REF-7): this was three unlabelled pale circles
     under the word CONFIDENCE — near-invisible on the cream default theme,
     and giving a first-time reader no way to know which circle meant what
     without clicking one. Each control now says what it means in words, and
     the pressed one is announced with aria-pressed rather than a class the
     eye has to find. The band ids, the store field and the auto read-out are
     unchanged. */
  function picker(sid, ref) {
    /* Graphite (frame 8b): three lettered circles beside the status. Each
       still says what it means — in its accessible name and tooltip — and
       the pressed one is announced with aria-pressed (audit REF-7). What
       the data says rides beneath as one quiet line. */
    var wrap = el("span", { class: "k-rag", "data-ui": "rag.picker", role: "group",
      "aria-label": "Your confidence on this topic",
      title: "Your confidence on this topic (separate from completion status)" });
    var cur = manual(sid, ref);
    var picks = el("span", { class: "k-rag-picks" });
    ["r", "a", "g"].forEach(function (b) {
      var btn = el("button", { type: "button", class: "k-rag-pick", "data-ui": "rag.pick", "data-band": b,
        "aria-pressed": String(cur === b),
        "aria-label": BANDS[b].label + " — " + BANDS[b].word,
        title: BANDS[b].label + " — " + BANDS[b].word + " (press again to clear)",
        onclick: function () {
          cur = cur === b ? null : b;             // press again to clear
          setManual(sid, ref, cur);
          picks.querySelectorAll("[data-ui~='rag.pick']").forEach(function (x) {
            KOS.ui.state(x, "on", false); x.setAttribute("aria-pressed", "false"); });
          if (cur) { KOS.ui.state(btn, "on", true); btn.setAttribute("aria-pressed", "true"); }
          renderAuto();
        } }, [
        el("span", { "aria-hidden": "true", text: BANDS[b].label.charAt(0) }),
        el("span", { class: "sr-only", "data-ui": "rag.option-label", text: BANDS[b].word })
      ]);
      if (cur === b) KOS.ui.state(btn, "on", true);
      picks.appendChild(btn);
    });
    wrap.appendChild(picks);
    var autoEl = el("span", { class: "k-rag-auto", "data-ui": "rag.auto" });
    function renderAuto() {
      autoEl.innerHTML = "";
      var a = auto(sid, ref);
      if (!a) { autoEl.textContent = "No performance data yet"; return; }
      autoEl.appendChild(document.createTextNode("Data says "));
      autoEl.appendChild(el("b", { "data-band": a.band, title: a.reasons.join(" · ") || "looking solid", text: BANDS[a.band].label }));
      var m = manual(sid, ref);
      if (m && m !== a.band) {
        autoEl.appendChild(el("span", { class: "k-rag-disagree", "data-ui": "rag.disagree",
          text: " ≠ your " + BANDS[m].label.toLowerCase(), title: a.reasons.join(" · ") }));
      }
    }
    renderAuto();
    return { node: wrap, auto: autoEl };
  }

  KOS.rag = {
    BANDS: BANDS,
    manual: manual,
    setManual: setManual,
    auto: auto,
    effective: effective,
    worst: worst,
    why: why,
    panel: panel,
    picker: picker,
    dot: dot
  };
})();
