/* Kurenai OS — core/edits.js
   User edits to the study material — the layer that makes every topic page
   editable in place.

   The curriculum ships in js/data/content/*.js (notes, flashcards, quiz,
   exam) and js/data/{compsci,maths,it}.js (the generated specification).
   Neither is ever written. Instead an edit FORKS the material for one topic
   and one kind into state.edits.topics["sid:ref"].<kind>, and every reader
   asks this module for the EFFECTIVE material: the fork when one exists,
   the shipped version otherwise. Deleting the fork ("Reset to curriculum")
   restores the shipped version exactly, because the shipped version was
   never touched.

   Shapes (all plain JSON, every row carries a random string `id` so the
   cloud merge can key on it and two devices can edit different rows of
   the same topic without either id space colliding):
     notes:      [block, …]          content.js blocks, each with an `id`
     spec:       {content:[block…], info:[block…]}   converted from the
                                     generated lines on first edit
     flashcards: [{id, k, q, a}]     `k` is the SM-2 key — a card that came
                                     from the curriculum keeps its original
                                     "sid:ref:i" key so its review history
                                     survives being edited or reordered; a
                                     card added here gets "sid:ref:e<n>"
     quiz:       [{id, q, opts, ans, why}]
     exam:       [{id, q, marks, ms, ctx?, parts?, src?, level?}]

   Custom cards (state.custom.cards, "u<id>" keys) and custom quiz items
   (state.custom.quizzes) are a separate, older layer that the assistant and
   the personal deck write to; they are unaffected and still render beside
   the curriculum material.

   Rides the normal state export and the cloud document. Nothing here logs
   a session or touches the Governor.                                     */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var store = KOS.store;
  var KINDS = ["notes", "spec", "flashcards", "quiz", "exam"];

  function root() {
    var s = store.state.edits;
    if (!s || typeof s !== "object") s = store.state.edits = { v: 1, topics: {} };
    if (!s.topics || typeof s.topics !== "object") s.topics = {};
    return s;
  }
  function key(sid, ref) { return sid + ":" + ref; }
  /* Row ids are never shown or referenced — they exist so the cloud merge
     can tell rows apart, so they must not collide across devices the way a
     per-device counter would. Time plus entropy is enough. */
  var idSeq = 0;
  function nextId() {
    return "e" + Date.now().toString(36) + (idSeq++ % 1296).toString(36) + Math.random().toString(36).slice(2, 5);
  }
  function clone(v) { return JSON.parse(JSON.stringify(v)); }
  function stamp(rec) {
    if (rec.id == null) rec.id = nextId();
    return rec;
  }
  /* shipped rows take a DETERMINISTIC id from their position, so two
     devices that fork the same topic independently agree on which row is
     which and the merge folds them instead of doubling the page */
  function shippedId(i) { return "s" + i; }

  function get(sid, ref) { return root().topics[key(sid, ref)] || null; }
  function has(sid, ref, kind) {
    var t = get(sid, ref);
    return !!(t && t[kind] != null);
  }
  function anyEdit(sid, ref) {
    var t = get(sid, ref);
    return !!t && KINDS.some(function (k) { return t[k] != null; });
  }

  /* ---------------- shipped material, in editable shape ---------------- */
  function shippedEntry(sid, ref) { return window.KOS_CONTENT[key(sid, ref)] || null; }

  /* strings become {p}, and every block gains an id */
  function blocksEditable(blocks) {
    return (blocks || []).map(function (b, i) {
      var o = typeof b === "string" ? { p: b } : clone(b);
      if (o.id == null) o.id = shippedId(i);
      return o;
    });
  }
  function shippedNotes(sid, ref) {
    var e = shippedEntry(sid, ref);
    return blocksEditable(e && e.notes);
  }
  function shippedFlashcards(sid, ref) {
    var e = shippedEntry(sid, ref);
    return ((e && e.flashcards) || []).map(function (c, i) {
      return { id: shippedId(i), k: key(sid, ref) + ":" + i, q: c[0], a: c[1] };
    });
  }
  function shippedQuiz(sid, ref) {
    var e = shippedEntry(sid, ref);
    return ((e && e.quiz) || []).map(function (q, i) { var o = clone(q); if (o.id == null) o.id = shippedId(i); return o; });
  }
  function shippedExam(sid, ref) {
    var e = shippedEntry(sid, ref);
    return ((e && e.exam) || []).map(function (q, i) { var o = clone(q); if (o.id == null) o.id = shippedId(i); return o; });
  }

  /* The generated specification is an array of lines carrying the PDF's
     own glyphs (□ • o); hub.js's renderer turns those into headings and
     lists on the fly. Editing needs real blocks, so the same reading is
     done once here and the result becomes the fork. The glyph rules
     mirror hub.js specLine/renderSpecContent — keep them in step. */
  function cleanGlyphs(raw) {
    return String(raw)
      .replace(/□/g, " ")
      .replace(/\s+/g, " ")
      .replace(/^[•◦▪‣]\s*/, "")
      .replace(/^o\s+/, "")
      .replace(/^-\s+/, "")
      .replace(/\s+o\s*$/, "")
      .replace(/\bDoes\b/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
  function specLineKind(raw) {
    return /^\s*□/.test(raw) ? "box" : /^\s*o\s/.test(raw) ? "sub2"
         : /^\s*[•◦▪‣]/.test(raw) ? "bullet" : "none";
  }
  function linesToBlocks(lines) {
    var items = (lines || []).map(function (l) { return { kind: specLineKind(l), text: cleanGlyphs(l) }; })
      .filter(function (x) { return x.text && x.text !== "To"; });
    var out = [], buf = [];
    function flush() { if (buf.length) { out.push({ ul: buf }); buf = []; } }
    items.forEach(function (it, idx) {
      var s = it.text, nx = items[idx + 1];
      if (/\bTo$/.test(s)) { flush(); out.push({ h: s.replace(/\s*To$/, "") }); return; }
      if (it.kind === "box") {
        if (nx && (nx.kind === "bullet" || nx.kind === "sub2")) { flush(); out.push({ h: s }); return; }
        buf.push(s); return;
      }
      if (it.kind === "bullet" || it.kind === "sub2") { buf.push(s); return; }
      if (/\so\s/.test(s)) {
        s.split(/\s+o\s+/).forEach(function (p) { p = p.trim(); if (p) buf.push(p); });
        return;
      }
      if (/:\s*$/.test(s) && nx && (nx.kind === "bullet" || nx.kind === "sub2")) { flush(); out.push({ h: s.replace(/:\s*$/, "") }); return; }
      flush(); out.push({ p: s });
    });
    flush();
    return out.map(function (b, i) { b.id = shippedId(i); return b; });
  }
  function shippedSpec(sid, ref) {
    var leaf = KOS.hub && KOS.hub.BYREF && KOS.hub.BYREF[sid] ? KOS.hub.BYREF[sid][ref] : null;
    return {
      content: linesToBlocks(leaf ? leaf.content : []),
      info: linesToBlocks(leaf ? leaf.info : [])
    };
  }

  /* ---------------- the effective material ---------------- */
  /* material(sid, ref, kind) → a fresh copy the caller may mutate and hand
     back to set(). The fork if there is one, else the shipped material in
     the same shape. */
  function material(sid, ref, kind) {
    var t = get(sid, ref);
    if (t && t[kind] != null) return clone(t[kind]);
    if (kind === "notes") return shippedNotes(sid, ref);
    if (kind === "flashcards") return shippedFlashcards(sid, ref);
    if (kind === "quiz") return shippedQuiz(sid, ref);
    if (kind === "exam") return shippedExam(sid, ref);
    if (kind === "spec") return shippedSpec(sid, ref);
    return null;
  }

  function normaliseKind(sid, ref, kind, value) {
    if (kind === "spec") {
      value = value && typeof value === "object" ? value : {};
      return { content: (value.content || []).map(stamp), info: (value.info || []).map(stamp) };
    }
    if (!Array.isArray(value)) return [];
    if (kind === "flashcards") {
      return value.map(function (c) {
        var o = stamp({ id: c.id, k: c.k, q: String(c.q || ""), a: String(c.a || "") });
        if (!o.k) o.k = key(sid, ref) + ":" + o.id;
        return o;
      });
    }
    return value.map(function (v) {
      return stamp(typeof v === "string" ? { p: v } : clone(v));
    });
  }
  function set(sid, ref, kind, value) {
    if (KINDS.indexOf(kind) === -1) return null;
    var r = root(), k = key(sid, ref);
    var t = r.topics[k] = r.topics[k] || {};
    t[kind] = normaliseKind(sid, ref, kind, value);
    t.updatedAt = Date.now();
    store.save();
    return t[kind];
  }
  function reset(sid, ref, kind) {
    var r = root(), k = key(sid, ref), t = r.topics[k];
    if (!t) return false;
    if (kind) delete t[kind]; else KINDS.forEach(function (x) { delete t[x]; });
    if (!KINDS.some(function (x) { return t[x] != null; })) delete r.topics[k];
    else t.updatedAt = Date.now();
    store.save();
    return true;
  }

  /* the topics that carry a fork of a given kind (or any) — for the card
     registry, coverage and search */
  function topics(kind) {
    var r = root();
    return Object.keys(r.topics).filter(function (k) {
      var t = r.topics[k];
      return kind ? t[kind] != null : KINDS.some(function (x) { return t[x] != null; });
    });
  }

  /* an editable-shape entry for readers that used KOS.content.get():
     notes stay blocks (ids are harmless to the renderer), quiz/exam rows
     keep their ids, flashcards return to [q, a] pairs. Null when neither
     the curriculum nor a fork has anything. */
  function effectiveEntry(sid, ref) {
    var shipped = shippedEntry(sid, ref);
    var t = get(sid, ref);
    if (!t) return shipped;
    var e = shipped ? Object.assign({}, shipped) : {};
    if (t.notes != null) e.notes = t.notes;
    if (t.quiz != null) e.quiz = t.quiz;
    if (t.exam != null) e.exam = t.exam;
    if (t.flashcards != null) e.flashcards = t.flashcards.map(function (c) { return [c.q, c.a]; });
    return e;
  }

  KOS.edits = {
    KINDS: KINDS,
    get: get,
    has: has,
    anyEdit: anyEdit,
    material: material,
    set: set,
    reset: reset,
    topics: topics,
    effectiveEntry: effectiveEntry,
    nextId: nextId,
    blocksEditable: blocksEditable,
    linesToBlocks: linesToBlocks
  };

  /* content.get()/has() answer with the effective material from here on */
  var baseHas = KOS.content.has;
  KOS.content.get = function (sid, ref) { return effectiveEntry(sid, ref); };
  KOS.content.has = function (sid, ref) { return baseHas(sid, ref) || anyEdit(sid, ref); };
})();
