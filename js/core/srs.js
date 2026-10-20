/* Kurenai OS — core/srs.js
   The flashcard schedule + unified card registry (FR-1.1/1.2/1.4/1.5).

   Every flashcard — curriculum (KOS_CONTENT) and user-created (store.custom) —
   carries a persistent schedule in store.state.srs, keyed:
     curriculum:  "sid:ref:i"   (index into the entry's flashcards array)
     custom:      "u<id>"       (stable across topic moves)

   The schedule is FSRS-6 (roadmap 5.6, docs/fsrs-plan.md): core/fsrs.js
   owns the model; this file turns dates into elapsed days, keeps the card
   record and logs each rating (core/reviewlog.js). Ratings are
   0 Again, 1 Hard, 2 Good, 3 Easy here and grades 1–4 in the core.
   An Again stays due today; the session engine requeues it at once
   (js/engines/flashcards.js), and that same-day answer takes FSRS's
   short-term rule.

   The switch from SM-2 (20 October 2026) converted each card's ease and
   interval the way Anki does (fsrs-rs memory_state_from_sm2, r = 0.9):
   stability = the interval, so no due date moved and the next on-time
   Good lands where SM-2 would have put it. `ef` stays on the record,
   frozen, so a card an older copy of the app rates converts again
   (KOS.fsrs.recordMemory: `fl` is the day FSRS last moved it). */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var store = KOS.store;
  var F = KOS.fsrs;

  var RATINGS = [
    { id: 0, key: "again", label: "Again", hint: "blanked — retest now" },
    { id: 1, key: "hard",  label: "Hard",  hint: "got there, shakily" },
    { id: 2, key: "good",  label: "Good",  hint: "solid recall" },
    { id: 3, key: "easy",  label: "Easy",  hint: "instant" }
  ];

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function toISO(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function todayISO() { return toISO(new Date()); }
  function addDays(iso, n) {
    var p = iso.split("-");
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    d.setDate(d.getDate() + n);
    return toISO(d);
  }
  function daysBetween(a, b) { // b - a in whole days (ISO strings)
    var pa = a.split("-"), pb = b.split("-");
    var da = new Date(+pa[0], +pa[1] - 1, +pa[2]);
    var db = new Date(+pb[0], +pb[1] - 1, +pb[2]);
    return Math.round((db - da) / 864e5);
  }
  function r4(v) { return Math.round(v * 1e4) / 1e4; }

  function meta(key) {
    var srs = store.state.srs;
    return srs[key] = srs[key] || {
      ef: 2.5, ivl: 0, reps: 0,
      due: null, last: null,
      views: 0, lapses: 0, lastRating: null
    };
  }
  function peek(key) { return store.state.srs[key] || null; }

  /* the recall the schedule aims for at each due date (decision A) */
  function retention() {
    var c = store.state.srsCfg;
    return F.clampRetention(c && c.retention);
  }
  function setRetention(r) {
    store.state.srsCfg = store.state.srsCfg || {};
    store.state.srsCfg.retention = F.clampRetention(r);
    store.save();
    return store.state.srsCfg.retention;
  }
  function elapsedOf(m, today) { return m && m.last ? Math.max(0, daysBetween(m.last, today)) : 0; }

  /* one rating, worked out without writing: the next memory and interval.
     The fuzz seed is the card key and the day, so the preview on a rating
     button is exactly what pressing it schedules, on every device. */
  function plan(key, m, rating, today) {
    var before = F.recordMemory(m);
    var el = elapsedOf(m, today);
    var nx = F.schedule(before, rating + 1, el, { retention: retention(), seed: key + "|" + today, againToday: true });
    return { before: before, el: el, next: nx };
  }

  /* the memory a card holds today, for the figures every surface shows:
     {s, d, r (recall today, 0..1), due}; null for a card never rated */
  function memory(key, today) {
    var m = peek(key);
    var mem = F.recordMemory(m);
    if (!mem) return null;
    var t = today || todayISO();
    return { s: mem.s, d: mem.d, r: F.retrievability(elapsedOf(m, t), mem.s), due: m.due };
  }

  /* ---- the update. rating: 0..3. Returns the updated record. ---- */
  function rate(key, rating) {
    var m = meta(key);
    var today = todayISO();
    var p = plan(key, m, rating, today);
    m.views++;
    m.lastRating = rating;
    m.last = today;
    m.fl = today;
    m.s = r4(p.next.s);
    m.d = r4(p.next.d);
    m.ivl = p.next.ivl;
    if (rating === 0) { m.lapses++; m.reps = 0; m.due = today; }
    else { m.reps++; m.due = addDays(today, m.ivl); }
    store.save();
    if (KOS.reviewLog && KOS.reviewLog.available()) {
      KOS.reviewLog.add({ key: key, ts: Date.now(), day: today, g: rating + 1, el: p.el,
        s0: p.before ? p.before.s : null, d0: p.before ? p.before.d : null,
        s1: m.s, d1: m.d, ivl: m.ivl, src: "flashcards" });
    }
    return m;
  }
  /* the interval in days a rating would schedule — 0 is "again today" */
  function preview(key, rating) {
    return plan(key, peek(key), rating, todayISO()).next.ivl;
  }

  /* The switch, persisted (docs/fsrs-plan.md §3.3): every rated card gets
     its s, d and fl. Idempotent — a card FSRS already moved is left alone,
     and one an older copy of the app rated since converts again. Runs at
     boot (main.js), never from a render; writes once, only if anything
     moved. Returns how many cards it converted. */
  function migrate() {
    var srs = store.state.srs || {}, n = 0;
    Object.keys(srs).forEach(function (k) {
      var m = srs[k];
      if (!m || !m.last || (m.s > 0 && m.d > 0 && m.fl === m.last)) return;
      var mem = F.recordMemory(m);
      if (!mem) return;
      m.s = r4(mem.s); m.d = r4(mem.d); m.fl = m.last;
      n++;
    });
    if (n) store.save();
    return n;
  }

  /* ---- unified card enumeration ---- */
  /* the effective deck: the user's fork of the topic when there is one
     (core/edits.js), else the shipped cards. A forked card keeps the schedule
     key it shipped with, so editing its wording never resets its schedule;
     `edited` marks a card whose topic carries a fork at all. */
  /* A shipped card's schedule key is "sid:ref:<position>". When cards are
     removed from a deck (duplicates, redundancies) the ones after them would
     slide up and inherit the wrong schedule, so a card whose position changed
     carries its original position as an optional third element, [q, a, 7]:
     the key stays "sid:ref:7" however the array is later edited. A string
     containing ":" is a whole key (a card moved here from another deck). */
  function shippedKey(sid, ref, c, i) {
    var k = c[2];
    if (k == null) return sid + ":" + ref + ":" + i;
    return typeof k === "string" && k.indexOf(":") >= 0 ? k : sid + ":" + ref + ":" + k;
  }
  function curriculumCards(sid, ref) {
    if (window.KOS.edits) {
      var forked = KOS.edits.has(sid, ref, "flashcards");
      return KOS.edits.material(sid, ref, "flashcards").map(function (c) {
        return { key: c.k, id: c.id, sid: sid, ref: ref, q: c.q, a: c.a, custom: false, edited: forked };
      });
    }
    var entry = window.KOS_CONTENT[sid + ":" + ref];
    var out = [];
    if (entry && entry.flashcards) {
      entry.flashcards.forEach(function (c, i) {
        out.push({ key: shippedKey(sid, ref, c, i), sid: sid, ref: ref, q: c[0], a: c[1], custom: false });
      });
    }
    return out;
  }
  function customCards(sid, ref) {
    return store.state.custom.cards
      .filter(function (c) { return (!sid || c.sid === sid) && (!ref || c.ref === ref); })
      .map(function (c) {
        /* `ai` marks assistant-generated cards (Category 6) so every surface
           can badge them; they are otherwise ordinary custom cards */
        return { key: "u" + c.id, id: c.id, sid: c.sid, ref: c.ref, q: c.q, a: c.a, custom: true, ai: !!c.ai };
      });
  }
  /* every card for a topic — curriculum first, user cards after */
  function cardsFor(sid, ref) {
    return curriculumCards(sid, ref).concat(customCards(sid, ref));
  }
  /* every card in the OS (all subjects, both origins) */
  function allCards() {
    var out = [];
    var keys = Object.keys(window.KOS_CONTENT);
    if (window.KOS.edits) {
      KOS.edits.topics("flashcards").forEach(function (k) { if (keys.indexOf(k) === -1) keys.push(k); });
    }
    keys.forEach(function (k) {
      var i = k.indexOf(":");
      out = out.concat(curriculumCards(k.slice(0, i), k.slice(i + 1)));
    });
    return out.concat(customCards(null, null));
  }

  /* ---- the due queue (FR-1.2): reviewed cards whose due date has arrived.
     Unseen cards are "new" — they enter the schedule on their first rating
     during per-topic study, so the queue can never explode to every card
     in the curriculum at once. Sorted most-overdue first. ---- */
  function dueCards() {
    var today = todayISO();
    return allCards()
      .map(function (c) {
        var m = peek(c.key);
        if (!m || !m.due || m.due > today) return null;
        c.meta = m;
        c.overdue = daysBetween(m.due, today);   // 0 = due today, >0 overdue
        return c;
      })
      .filter(Boolean)
      .sort(function (a, b) { return b.overdue - a.overdue; });
  }
  function dueCount() { return dueCards().length; }

  /* ---- custom flashcard CRUD (FR-1.1) ---- */
  /* Build 3c: `sid` is no longer necessarily a curriculum subject — the
     reserved sid "personal" (PERSONAL_SID) is a general bucket for cards
     with no A-level home (VN quotes use ref "vn"). Everything downstream
     (schedule keys "u<id>", the due queue, the session engine) already treats
     sid/ref as opaque strings, so the bucket needs no migration; `extra`
     is optional origin metadata (e.g. {src:{module,entryId,title}}). */
  var PERSONAL_SID = "personal";
  function addCustom(sid, ref, q, a, extra) {
    var cu = store.state.custom;
    var card = { id: cu.nextId++, sid: sid, ref: ref, q: q, a: a, created: todayISO() };
    if (extra) Object.keys(extra).forEach(function (k) { card[k] = extra[k]; });
    cu.cards.push(card);
    store.save();
    return card;
  }
  /* every distinct ref inside the personal bucket, with card counts —
     the Personal Deck view (due.js) builds itself from this */
  function personalRefs() {
    var by = {};
    store.state.custom.cards.forEach(function (c) {
      if (c.sid === PERSONAL_SID) by[c.ref] = (by[c.ref] || 0) + 1;
    });
    return Object.keys(by).sort().map(function (r) { return { ref: r, count: by[r] }; });
  }
  function updateCustom(id, q, a) {
    var card = store.state.custom.cards.find(function (c) { return c.id === id; });
    if (!card) return null;
    card.q = q; card.a = a;
    store.save();
    return card;
  }
  function deleteCustom(id) {
    var cu = store.state.custom;
    var i = cu.cards.findIndex(function (c) { return c.id === id; });
    if (i === -1) return false;
    cu.cards.splice(i, 1);
    delete store.state.srs["u" + id];   // drop its schedule with it
    store.save();
    return true;
  }

  /* ---- custom quiz items (Category 6) ----
     The curriculum quiz lives in KOS_CONTENT and is hand-authored; there was
     no store for user/AI quiz questions until the assistant needed one. Same
     custom-vs-curriculum split as flashcards: these live in
     state.custom.quizzes, share custom.nextId, ride the normal backup, and
     are rendered as a SEPARATE clearly-labelled block in the topic Quiz tab
     (hub.js) — never merged invisibly into curriculum questions.
     Item shape: {id, sid, ref, q, opts[2–6], ans, why, ai, created}.
     addCustomQuiz is ATOMIC: the whole batch validates before the first
     write; a malformed item means zero saves and a specific error.        */
  function customQuizzes() {
    var cu = store.state.custom;
    return cu.quizzes = cu.quizzes || [];
  }
  function validQuizItem(it) {
    if (!it || typeof it !== "object") return "not an object";
    if (typeof it.q !== "string" || !it.q.trim() || it.q.length > 2000) return "bad question text";
    if (!Array.isArray(it.opts) || it.opts.length < 2 || it.opts.length > 6) return "needs 2–6 options";
    for (var i = 0; i < it.opts.length; i++) {
      if (typeof it.opts[i] !== "string" || !it.opts[i].trim() || it.opts[i].length > 400) return "bad option " + (i + 1);
      if (it.opts.indexOf(it.opts[i]) !== i) return "duplicate option " + (i + 1);
    }
    if (typeof it.ans !== "number" || it.ans !== Math.floor(it.ans) ||
        it.ans < 0 || it.ans >= it.opts.length) return "answer index out of range";
    if (it.why != null && (typeof it.why !== "string" || it.why.length > 2000)) return "bad explanation";
    return null;
  }
  function addCustomQuiz(sid, ref, items, extra) {
    if (!Array.isArray(items) || !items.length) return { error: "No questions supplied." };
    for (var i = 0; i < items.length; i++) {
      var bad = validQuizItem(items[i]);
      if (bad) return { error: "Question " + (i + 1) + ": " + bad + ". Nothing was saved." };
    }
    var cu = store.state.custom;
    var created = items.map(function (it) {
      var row = { id: cu.nextId++, sid: sid, ref: ref, q: it.q.trim(),
        opts: it.opts.map(function (o) { return o.trim(); }),
        ans: it.ans, why: it.why != null ? String(it.why) : "", created: todayISO() };
      if (extra) Object.keys(extra).forEach(function (k) { row[k] = extra[k]; });
      customQuizzes().push(row);
      return row;
    });
    store.save();
    return { created: created };
  }
  function customQuizFor(sid, ref) {
    // a read: never materialise the array on a page that only looks
    var list = (store.state.custom && store.state.custom.quizzes) || [];
    return list.filter(function (c) {
      return (!sid || c.sid === sid) && (!ref || c.ref === ref);
    });
  }
  function updateCustomQuiz(id, patch) {
    var row = customQuizzes().find(function (c) { return c.id === id; });
    if (!row) return null;
    var probe = {
      q: patch.q != null ? patch.q : row.q,
      opts: patch.opts != null ? patch.opts : row.opts,
      ans: patch.ans != null ? patch.ans : row.ans,
      why: patch.why != null ? patch.why : row.why
    };
    var bad = validQuizItem(probe);
    if (bad) return { error: bad };
    row.q = probe.q.trim(); row.opts = probe.opts.slice(); row.ans = probe.ans; row.why = probe.why || "";
    store.save();
    return row;
  }
  function deleteCustomQuiz(id) {
    var list = customQuizzes();
    var i = list.findIndex(function (c) { return c.id === id; });
    if (i === -1) return false;
    list.splice(i, 1);
    store.save();
    return true;
  }

  KOS.srs = {
    RATINGS: RATINGS,
    todayISO: todayISO,
    addDays: addDays,
    daysBetween: daysBetween,
    meta: meta,
    peek: peek,
    memory: memory,
    retention: retention,
    setRetention: setRetention,
    migrate: migrate,
    rate: rate,
    preview: preview,
    cardsFor: cardsFor,
    allCards: allCards,
    dueCards: dueCards,
    dueCount: dueCount,
    PERSONAL_SID: PERSONAL_SID,
    personalRefs: personalRefs,
    addCustom: addCustom,
    updateCustom: updateCustom,
    deleteCustom: deleteCustom,
    addCustomQuiz: addCustomQuiz,
    customQuizFor: customQuizFor,
    updateCustomQuiz: updateCustomQuiz,
    deleteCustomQuiz: deleteCustomQuiz
  };
})();
