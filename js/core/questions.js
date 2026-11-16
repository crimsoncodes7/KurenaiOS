/* Kurenai OS — core/questions.js · KOS.questions
   Roadmap 5.19 item 4 (design turn 44): quiz and exam questions on the
   review schedule, and every question's history.

   A QUESTION is one quiz item or one exam item of a topic, named by a key
   that survives edits and reorders:
     q:<sid>:<ref>:<id>   a quiz item        e:<sid>:<ref>:<id>   an exam item
   where <id> is the item's own `qk` (a card moved in, "c<i>"), else its
   `oi` (a bank item's place, js/core/content.js), else the number of a
   shipped fork row ("s<i>" → i), else a fork row's id, else its place.

   ITS HISTORY is `state.questions.items[key].tries`, a keyed map (each try
   under its own random key, so two devices' tries both survive the merge):
     quiz  {d: day, ts, ok: 0|1}
     exam  {d, ts, got, max, pts: [[0|1 per mark point] per part]}
   at most KEEP tries a question (the newest). Nothing is paid: a quiz run
   and a logged exam question log their sessions as before (invariant 129's
   spirit — the schedule is bookkeeping).

   ITS SCHEDULE is an ordinary FSRS record in `state.srs[key]`, rated by
   `KOS.srs.rate` from the marks (the defaults agreed 16 November 2026):
   under 50% Again, 50–79% Hard, 80–99% Good, full marks Easy; a quiz item
   right is Good, wrong Again. A question JOINS the schedule the first time
   it is answered anywhere; afterwards an answer rates it only when it is
   due (an answer before its day is history only); a miss waits until
   tomorrow, never the same day. Questions come back on
   Due today beside the cards, CAPPED per subject a day (`cap`, synced,
   default 10, 0 = none come back); redo items (invariant 124) are cards
   and never capped. A question is never set aside as a leech.

   MOVED CARDS: a Maths flashcard that is a several-step problem is not
   quick recall, so it lives as an exam question (KOS_MOVED_CARDS, made by
   tools/gen_moved_cards.mjs). `moveCards` (run at the end of the Maths
   bundle) takes it out of its deck — every card after it keeps its key
   (invariant 87) — and adds it to the topic's exam questions; `migrate`
   (boot) copies its schedule to the question's key once, so its history
   goes with it. Reads never write.                                       */
(function () {
  "use strict";
  var store = KOS.store;
  var KEEP = 30, DEFAULT_CAP = 10;

  function root() { return store.state.questions || null; }
  function W() {
    var q = store.state.questions = store.state.questions && typeof store.state.questions === "object" ? store.state.questions : {};
    if (!q.items || typeof q.items !== "object") q.items = {};
    if (!q.cap || typeof q.cap !== "object") q.cap = {};
    return q;
  }
  function today() { return KOS.srs.todayISO(); }
  function rid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  /* ---------- keys ---------- */
  function idOf(item, i) {
    if (item && item.qk != null) return String(item.qk);
    if (item && item.oi != null) return String(item.oi);
    var m = item && item.id != null ? /^s(\d+)$/.exec(String(item.id)) : null;
    if (m) return m[1];
    if (item && item.id != null) return String(item.id);
    return String(i);
  }
  function keyOf(kind, sid, ref, item, i) { return (kind === "quiz" ? "q:" : "e:") + sid + ":" + ref + ":" + idOf(item, i); }
  function isKey(k) { return typeof k === "string" && /^[qe]:[^:]+:.+:[^:]+$/.test(k); }
  function parse(k) {
    if (!isKey(k)) return null;
    var p = k.split(":");
    return { kind: p[0] === "q" ? "quiz" : "exam", sid: p[1], ref: p.slice(2, -1).join(":"), id: p[p.length - 1] };
  }
  /* the item a key names in a topic's effective material (null when the
     topic's words are not in, or the item is gone) */
  function itemOf(k) {
    var p = parse(k);
    var c = p && KOS.content && KOS.content.get ? KOS.content.get(p.sid, p.ref) : null;
    var list = c && Array.isArray(c[p.kind === "quiz" ? "quiz" : "exam"]) ? c[p.kind === "quiz" ? "quiz" : "exam"] : null;
    if (!list) return null;
    for (var i = 0; i < list.length; i++) if (idOf(list[i], i) === p.id) return { item: list[i], i: i, sid: p.sid, ref: p.ref, kind: p.kind };
    return null;
  }

  /* a day in words: today, yesterday, "2 days ago", a weekday this week,
     else "12 Oct" */
  var DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function when(iso) {
    if (!iso) return "";
    var n = KOS.srs.daysBetween(iso, today()), d = new Date(iso + "T12:00:00");
    if (n <= 0) return "today";
    if (n === 1) return "yesterday";
    if (n <= 2) return n + " days ago";
    if (n < 7) return DOW[d.getDay()];
    return d.getDate() + " " + MON[d.getMonth()];
  }

  /* ---------- the grade from the marks ---------- */
  function gradeOf(got, max) {
    if (!(max > 0)) return null;
    var f = got / max;
    return f >= 1 ? 3 : f >= 0.8 ? 2 : f >= 0.5 ? 1 : 0;
  }

  /* ---------- history ---------- */
  function rec(k) { var r = root(); return r && r.items && r.items[k] || null; }
  function tries(k) {
    var r = rec(k), t = r && r.tries || {};
    return Object.keys(t).map(function (id) { return Object.assign({ id: id }, t[id]); })
      .sort(function (a, b) { return (a.ts || 0) - (b.ts || 0); });
  }

  /* record an answer; rates the question when it is new or due.
     o: {kind, sid, ref, ok (quiz) | got, max, pts (exam), back} */
  function answer(k, o) {
    if (!isKey(k) || !o) return null;
    var q = W(), r = q.items[k] = q.items[k] || {};
    var t = r.tries = r.tries && typeof r.tries === "object" ? r.tries : {};
    /* each try after the last, so the order holds within one millisecond */
    var lastTs = Object.keys(t).reduce(function (m, id) { return Math.max(m, t[id].ts || 0); }, 0);
    var day = today(), row = { d: day, ts: Math.max(Date.now(), lastTs + 1) };
    var grade;
    if (o.kind === "quiz" || o.ok != null) { row.ok = o.ok ? 1 : 0; grade = o.ok ? 2 : 0; }
    else {
      row.got = Math.max(0, +o.got || 0); row.max = Math.max(0, +o.max || 0);
      if (Array.isArray(o.pts)) row.pts = o.pts.map(function (p) { return (p || []).map(function (x) { return x ? 1 : 0; }); });
      grade = gradeOf(row.got, row.max);
    }
    if (o.back) row.back = 1;
    t[rid()] = row;
    var ids = Object.keys(t).sort(function (a, b) { return (t[a].ts || 0) - (t[b].ts || 0); });
    while (ids.length > KEEP) delete t[ids.shift()];
    var m = KOS.srs.peek(k), rated = false;
    if (grade != null && (!m || !m.due || m.due <= day)) {
      KOS.srs.rate(k, grade);
      var mm = KOS.srs.peek(k);
      if (mm && mm.leech) delete mm.leech;          /* a question is never set aside */
      /* a missed question waits for tomorrow: asked again the same day it
         is answered from memory of the scheme, not recalled */
      if (mm && mm.due && mm.due <= day) mm.due = KOS.srs.addDays(day, 1);
      rated = true;
    }
    store.save();
    return { rated: rated, grade: grade, due: (KOS.srs.peek(k) || {}).due || null };
  }

  /* days until it comes back (0 = today, null = not on the schedule) */
  function againIn(k) {
    var m = KOS.srs.peek(k);
    if (!m || !m.due) return null;
    var t = today();
    return m.due <= t ? 0 : KOS.srs.daysBetween(t, m.due);
  }

  /* ---------- the cap ---------- */
  function cap(sid) {
    var r = root(), c = r && r.cap ? r.cap[sid] : null;
    return c == null ? DEFAULT_CAP : Math.max(0, Math.min(50, +c || 0));
  }
  function setCap(sid, n) {
    var q = W();
    q.cap[sid] = Math.max(0, Math.min(50, Math.round(+n || 0)));
    store.save();
    return q.cap[sid];
  }

  /* every question the schedule holds (a read of state.srs) */
  function scheduled() {
    var srs = store.state.srs || {}, out = [];
    Object.keys(srs).forEach(function (k) {
      var p = parse(k);
      if (p && srs[k] && srs[k].due) out.push({ key: k, sid: p.sid, ref: p.ref, kind: p.kind, id: p.id, meta: srs[k] });
    });
    return out;
  }
  /* the ones back today, capped per subject: answered back today count
     against the cap. {list, by: {sid: {due, cap, done, left}}, total, waiting} */
  function inScope(sid, ref) { return sid !== "it" || !KOS.itUnits || !KOS.itUnits.inReview || KOS.itUnits.inReview(ref); }
  function dueToday(t) {
    t = t || today();
    var by = {}, all = [];
    scheduled().forEach(function (q) {
      if (q.meta.due > t || !inScope(q.sid, q.ref)) return;
      q.overdue = KOS.srs.daysBetween(q.meta.due, t);
      all.push(q);
    });
    var r = root(), items = r && r.items || {};
    var doneBy = {};
    Object.keys(items).forEach(function (k) {
      var p = parse(k), tt = items[k] && items[k].tries || {};
      if (!p) return;
      Object.keys(tt).forEach(function (id) { if (tt[id].d === t && tt[id].back) doneBy[p.sid] = (doneBy[p.sid] || 0) + 1; });
    });
    all.sort(function (a, b) { return b.overdue - a.overdue || (a.key < b.key ? -1 : 1); });
    var list = [];
    all.forEach(function (q) {
      var b = by[q.sid] = by[q.sid] || { due: 0, cap: cap(q.sid), done: doneBy[q.sid] || 0, left: 0 };
      b.due++;
      if (b.done + b.left < b.cap) { b.left++; list.push(q); }
    });
    Object.keys(doneBy).forEach(function (s) { if (!by[s]) by[s] = { due: 0, cap: cap(s), done: doneBy[s], left: 0 }; });
    return { list: list, by: by, total: list.length, waiting: all.length - list.length };
  }

  /* ---------- reads for the pages ---------- */
  /* a topic's quiz, item by item, weakest first (44c) */
  function quizHistory(sid, ref, items) {
    return (items || []).map(function (it, i) {
      var k = keyOf("quiz", sid, ref, it, i), tt = tries(k);
      var ok = tt.filter(function (x) { return x.ok; }).length;
      return { key: k, i: i, item: it, tries: tt, pct: tt.length ? Math.round(100 * ok / tt.length) : null, last: tt.length ? tt[tt.length - 1].d : null };
    }).sort(function (a, b) {
      if (a.pct == null || b.pct == null) return a.pct == null ? (b.pct == null ? a.i - b.i : 1) : -1;
      return a.pct - b.pct || b.tries.length - a.tries.length || a.i - b.i;
    });
  }
  /* a subject's question figures for the review strip (44e) */
  function subjectStats(sid) {
    var r = root(), items = r && r.items || {}, got = 0, max = 0, attempts = 0;
    Object.keys(items).forEach(function (k) {
      var p = parse(k);
      if (!p || p.sid !== sid || !inScope(p.sid, p.ref)) return;
      var tt = items[k].tries || {};
      Object.keys(tt).forEach(function (id) {
        var x = tt[id];
        attempts++;
        if (x.ok != null) { got += x.ok; max += 1; } else if (x.max) { got += x.got / x.max; max += 1; }
      });
    });
    var d = dueToday().by[sid];
    return { back: d ? d.left : 0, attempts: attempts, avg: max ? Math.round(100 * got / max) : null };
  }

  /* ---------- moved cards ---------- */
  function movedFor(sid) {
    var M = window.KOS_MOVED_CARDS || {}, out = {};
    Object.keys(M).forEach(function (topic) { if (topic.indexOf(sid + ":") === 0) out[topic] = M[topic]; });
    return out;
  }
  function movedKey(topic, i) { return "e:" + topic + ":c" + i; }
  /* run once the subject's content is in: each listed card leaves its deck
     (its neighbours keep their keys) and joins the topic's exam questions */
  function moveCards(sid) {
    var M = movedFor(sid), C = window.KOS_CONTENT;
    Object.keys(M).forEach(function (topic) {
      var e = C[topic];
      if (!e || !Array.isArray(e.flashcards) || e._moved) return;
      var want = {}, add = [];
      M[topic].forEach(function (i) { want[i] = true; });
      var kept = [];
      e.flashcards.forEach(function (c, i) {
        var pos = c[2] == null ? i : c[2];
        if (want[pos] && typeof pos === "number") {
          var a = String(c[1]), proof = /^\s*Prove\b/i.test(String(c[0]));
          add.push({ q: String(c[0]), marks: proof ? 3 : 2, qk: "c" + pos, moved: topic + ":" + pos,
            ms: proof
              ? ["M1 A correct first step", "M1 The argument carried through", "A1 A complete, correct conclusion", "**Answer:** " + a]
              : ["M1 A correct method", "A1 The correct answer", "**Answer:** " + a] });
          return;
        }
        kept.push(c[2] == null ? [c[0], c[1], i] : c);
      });
      if (!add.length) return;
      e.flashcards = kept;
      e._moved = add.length;
      KOS.content.extend(topic, { exam: add });
    });
  }
  /* boot: a moved card's schedule goes to its question, once */
  function migrate() {
    var M = window.KOS_MOVED_CARDS || {}, srs = store.state.srs || {}, n = 0;
    Object.keys(M).forEach(function (topic) {
      M[topic].forEach(function (i) {
        var from = topic + ":" + i, to = movedKey(topic, i);
        if (srs[from] && srs[from].due && !srs[to]) {
          srs[to] = JSON.parse(JSON.stringify(srs[from]));
          delete srs[to].leech;
          n++;
        }
      });
    });
    if (n) store.save();
    return n;
  }

  KOS.questions = {
    KEEP: KEEP, DEFAULT_CAP: DEFAULT_CAP,
    idOf: idOf, keyOf: keyOf, isKey: isKey, parse: parse, itemOf: itemOf,
    gradeOf: gradeOf, when: when, tries: tries, answer: answer, againIn: againIn,
    cap: cap, setCap: setCap, scheduled: scheduled, dueToday: dueToday,
    quizHistory: quizHistory, subjectStats: subjectStats,
    moveCards: moveCards, migrate: migrate, movedKey: movedKey
  };
})();
