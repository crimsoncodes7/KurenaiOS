/* Kurenai OS — modules/rag.js
   RAG topic flagging (FR-3.3), hybrid:
   - MANUAL: a Red/Amber/Green confidence the user sets per topic (stored on
     the progress entry as `rag` — confidence, a separate concept from the
     completion status field).
   - AUTO: a 0–100 score computed from real performance data — recall from
     the topic's rated cards, its quiz, and exam/paper tracker results, each
     scored on its own and weighed together; Green needs recall AND practice
     (GO-23, see auto()). No data → no rating (null), never a fake green.
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

  /* the auto-computed rating: {score, band, reasons[], evidence, thin} or
     null (no data).

     GO-23 / UR-22: EVIDENCE-WEIGHTED. It used to start at 100 and take
     capped penalties off, so one quiz at 0% (at most −25) left a topic at
     75, Green — and "Move topics to Green" goals, Exams readiness and the
     topic colours all believed it. Now each kind of evidence is scored on
     its own, 0–100:
       recall  — the rated cards: recall today, less lapses and overdue
       quiz    — the last attempt's percent
       papers  — the last three logged results on the topic
     The score is their weighted mean (papers count most), and the band
     follows it — so any evidence gives an honest band (a 0% quiz is Red).
     GREEN NEEDS BOTH: recall from at least GREEN_CARDS rated cards AND
     practice (a quiz or a paper), each at 70 or more. A topic that scores
     Green on one kind alone reads Amber, `thin`, "not enough evidence". */
  var GREEN_CARDS = 3, BAR = 70;
  function auto(sid, ref) {
    var reasons = [], parts = [];

    /* recall: the schedule's signals from this topic's cards (FSRS) */
    var lapses = 0, views = 0, tracked = 0, overdue = 0;
    var today = KOS.srs.todayISO();
    KOS.srs.cardsFor(sid, ref).forEach(function (c) {
      var m = KOS.srs.peek(c.key);
      if (!m || !m.views) return;
      tracked++;
      lapses += m.lapses; views += m.views;
      if (m.due && m.due < today) overdue++;
    });
    var recall = null;
    if (tracked) {
      var tm = KOS.srs.topicMemory(sid, ref, today);
      var avgR = tm.recall == null ? 1 : tm.recall;
      var lapseRate = lapses / Math.max(1, views);
      recall = Math.round(100 * avgR);
      if (lapseRate > 0.15) { recall -= Math.min(35, Math.round(lapseRate * 80)); reasons.push(lapses + (lapses === 1 ? " lapse" : " lapses") + " in " + views + " reviews"); }
      if (avgR < 0.85) reasons.push("recall today ≈ " + Math.round(avgR * 100) + "%");
      if (overdue) { recall -= Math.min(15, overdue * 3); reasons.push(overdue + " overdue card" + (overdue === 1 ? "" : "s")); }
      recall = Math.max(0, Math.min(100, recall));
      parts.push([recall, 1]);
    }

    /* quiz: the last attempt on this topic */
    var study = store.state.study || {};
    var q = (study.quiz || {})[sid + ":" + ref], quiz = null;
    if (q && q.attempts) {
      quiz = Math.max(0, Math.min(100, +q.lastPct || 0));
      parts.push([quiz, 1]);
      if (quiz < 80) reasons.push("quiz " + quiz + "%");
    }

    /* papers: exam / practice-paper results linked to this topic (recent 3) */
    var recs = KOS.tracker.forRef(sid, ref)
      .map(function (e) { return KOS.tracker.pct(e); })
      .filter(function (p) { return p != null; })
      .slice(-3);
    var papers = null;
    if (recs.length) {
      papers = Math.round(recs.reduce(function (a, p) { return a + p; }, 0) / recs.length);
      parts.push([papers, 1.5]);
      if (papers < 75) reasons.push("exam/paper avg " + papers + "%");
    }

    if (!parts.length) return null;
    var w = parts.reduce(function (n, p) { return n + p[1]; }, 0);
    var score = Math.round(parts.reduce(function (n, p) { return n + p[0] * p[1]; }, 0) / w);
    var b = band(score), thin = false;
    if (b === "g") {
      var practice = Math.max(quiz == null ? -1 : quiz, papers == null ? -1 : papers);
      var recallOk = recall != null && tracked >= GREEN_CARDS && recall >= BAR;
      if (!recallOk || practice < BAR) {
        b = "a"; thin = true;
        reasons.push(!recallOk && practice < BAR ? "not enough evidence yet"
          : !recallOk ? "not enough evidence yet: rate " + Math.max(1, GREEN_CARDS - tracked) + " more of its cards" : "not enough evidence yet: a quiz or a paper on it");
      }
    }
    return { score: score, band: b, reasons: reasons, thin: thin,
      evidence: { cards: tracked, quiz: q && q.attempts ? q.attempts : 0, papers: recs.length } };
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
    picker: picker
  };
})();
