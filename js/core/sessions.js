/* Kurenai OS — core/sessions.js
   The study session log (FR-3.2) and streak derivation (FR-3.7).

   Every completed activity appends one entry here — this is the single data
   backbone that streaks, the Behavioural Governor (HP/XP/gold) and the future
   RAG flagging system read from. Entry shape:

     { id, ts, date:"YYYY-MM-DD",
       type: "flashcards" | "due-review" | "quiz" | "exam" | "todo" | "focus",
       subject: sid|null, ref: ref|null,
       dur: seconds|null,           // known once the Focus Timer lands (2b)
       metrics: {…} }               // per-type performance numbers

   Metrics conventions:
     flashcards/due-review: {cards, again, hard, good, easy}
     quiz:                  {correct, total, pct}
     exam:                  {marks, max}
     todo:                  {item}                                            */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var store = KOS.store;

  var CAP = 2000;   // keep the log bounded — oldest entries fall off
  var nextId = 1;

  function log(entry) {
    var list = store.state.sessions;
    var e = {
      id: nextId++,
      ts: Date.now(),
      date: KOS.srs.todayISO(),
      type: entry.type,
      subject: entry.subject || null,
      ref: entry.ref || null,
      dur: entry.dur != null ? entry.dur : null,
      metrics: entry.metrics || {}
    };
    /* activity attribution (Build 2b): anything completed while a focus
       session is live carries that session's id, so the focus entry can
       summarise what was actually done during it (FR-3.2). The focus entry
       itself is logged after the session clears, so it never self-tags. */
    if (KOS.focus && KOS.focus.activeId && KOS.focus.activeId()) {
      e.focusId = KOS.focus.activeId();
    }
    list.push(e);
    if (list.length > CAP) list.splice(0, list.length - CAP);
    store.save();
    /* the governor feeds on the same event — awards XP/gold/HP */
    if (KOS.governor) KOS.governor.onSession(e);
    if (KOS.refreshHUD) KOS.refreshHUD();
    return e;
  }

  function forDate(dateISO, sid) {
    return store.state.sessions.filter(function (e) {
      return e.date === dateISO && (!sid || e.subject === sid);
    });
  }
  function hasActivity(dateISO, sid) {
    return store.state.sessions.some(function (e) {
      return e.date === dateISO && (!sid || e.subject === sid);
    });
  }

  /* Consecutive-day streak ending today (or yesterday — an unbroken run
     doesn't read as zero before you've studied today; it resets only once
     a full day is actually missed). sid null → overall streak. */
  function streak(sid) {
    var today = KOS.srs.todayISO();
    var cursor = hasActivity(today, sid) ? today : KOS.srs.addDays(today, -1);
    var n = 0;
    while (hasActivity(cursor, sid)) {
      n++;
      cursor = KOS.srs.addDays(cursor, -1);
      if (n > 3650) break;   // sanity bound
    }
    return n;
  }
  function streaks() {
    return {
      all: streak(null),
      compsci: streak("compsci"),
      maths: streak("maths"),
      it: streak("it")
    };
  }

  KOS.sessions = {
    log: log,
    all: function () { return store.state.sessions; },
    forDate: forDate,
    hasActivity: hasActivity,
    streak: streak,
    streaks: streaks
  };
})();
