/* Kurenai OS — core/srs.js
   The SM-2 spaced-repetition engine + unified card registry (FR-1.1/1.2/1.4/1.5).

   Every flashcard — curriculum (KOS_CONTENT) and user-created (store.custom) —
   carries persistent SM-2 metadata in store.state.srs, keyed:
     curriculum:  "sid:ref:i"   (index into the entry's flashcards array)
     custom:      "u<id>"       (stable across topic moves)

   Rating scale (4-point, mapped onto classic SM-2 quality):
     0 Again  → q=1  lapse: reps reset, interval snaps short, card requeues
     1 Hard   → q=3  passes, interval grows slowly
     2 Good   → q=4  classic SM-2 progression (1d, 6d, ivl×EF)
     3 Easy   → q=5  progression with a bonus multiplier

   The in-session requeue for "Again" is the session engine's job
   (js/engines/flashcards.js) — this file only owns the long-term schedule. */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var store = KOS.store;

  var RATINGS = [
    { id: 0, key: "again", label: "Again", hint: "blanked — retest now" },
    { id: 1, key: "hard",  label: "Hard",  hint: "got there, shakily" },
    { id: 2, key: "good",  label: "Good",  hint: "solid recall" },
    { id: 3, key: "easy",  label: "Easy",  hint: "instant" }
  ];
  var QUALITY = [1, 3, 4, 5];   // rating id -> SM-2 quality

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

  function meta(key) {
    var srs = store.state.srs;
    return srs[key] = srs[key] || {
      ef: 2.5, ivl: 0, reps: 0,
      due: null, last: null,
      views: 0, lapses: 0, lastRating: null
    };
  }
  function peek(key) { return store.state.srs[key] || null; }

  /* ---- the SM-2 update. rating: 0..3. Returns the updated meta. ---- */
  function rate(key, rating) {
    var m = meta(key);
    var q = QUALITY[rating];
    var today = todayISO();

    m.views++;
    m.lastRating = rating;
    m.last = today;

    /* EF update applies on every review (classic SM-2 formula), floor 1.3 */
    m.ef = Math.max(1.3, m.ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));

    if (rating === 0) {
      /* lapse: repetition count resets and the long-term interval snaps to a
         short value. Due today — the card stays in the due queue until it is
         re-rated (the session engine also requeues it immediately). */
      m.reps = 0;
      m.ivl = 0;
      m.lapses++;
      m.due = today;
    } else {
      m.reps++;
      if (m.reps === 1) m.ivl = 1;
      else if (m.reps === 2) m.ivl = rating === 1 ? 3 : 6;
      else {
        var next = m.ivl * m.ef;
        if (rating === 1) next = m.ivl * 1.2;         // Hard: grow slowly
        if (rating === 3) next = m.ivl * m.ef * 1.3;  // Easy: bonus
        m.ivl = Math.max(m.ivl + 1, Math.round(next));
      }
      m.due = addDays(today, m.ivl);
    }
    store.save();
    return m;
  }

  /* ---- unified card enumeration ---- */
  function curriculumCards(sid, ref) {
    var entry = window.KOS_CONTENT[sid + ":" + ref];
    var out = [];
    if (entry && entry.flashcards) {
      entry.flashcards.forEach(function (c, i) {
        out.push({ key: sid + ":" + ref + ":" + i, sid: sid, ref: ref, q: c[0], a: c[1], custom: false });
      });
    }
    return out;
  }
  function customCards(sid, ref) {
    return store.state.custom.cards
      .filter(function (c) { return (!sid || c.sid === sid) && (!ref || c.ref === ref); })
      .map(function (c) {
        return { key: "u" + c.id, id: c.id, sid: c.sid, ref: c.ref, q: c.q, a: c.a, custom: true };
      });
  }
  /* every card for a topic — curriculum first, user cards after */
  function cardsFor(sid, ref) {
    return curriculumCards(sid, ref).concat(customCards(sid, ref));
  }
  /* every card in the OS (all subjects, both origins) */
  function allCards() {
    var out = [];
    Object.keys(window.KOS_CONTENT).forEach(function (k) {
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
     (SM-2 keys "u<id>", the due queue, the session engine) already treats
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

  KOS.srs = {
    RATINGS: RATINGS,
    todayISO: todayISO,
    addDays: addDays,
    daysBetween: daysBetween,
    meta: meta,
    peek: peek,
    rate: rate,
    cardsFor: cardsFor,
    allCards: allCards,
    dueCards: dueCards,
    dueCount: dueCount,
    PERSONAL_SID: PERSONAL_SID,
    personalRefs: personalRefs,
    addCustom: addCustom,
    updateCustom: updateCustom,
    deleteCustom: deleteCustom
  };
})();
