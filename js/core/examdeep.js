/* Kurenai OS — core/examdeep.js
   The Companion's EXHAUSTIVE layer (roadmap 5.8 phase 6, docs/exams-plan.md
   §13.2, §13.5; frames 29p, 29q; invariant 130). A board paper's authored
   material lives in js/data/exams/<paper>-*.js as KOS_EXAMS.deep[paper]:

     leaves[ref] = {
       archetypes: [{ id, title?, match?, rules: [..], traps: [{sitting, q, text}],
         variations: [{ v, t, m, q, ctx?, code?, steps: [[text, marks, why]],
           trap?, methods?: [{ name, rec?, when, lines: [[text, marks]], slip? }] }] }],
       practice: [[d, marks, q, [ms…], {code?, ctx?, arch?}?]]
     }
     extended = an archetype of the paper's extended answers (levels)

   An archetype's id is the catalogue's (js/data/exam-archetypes.js) where
   one exists, so its real questions are the ones the catalogue tags; an
   archetype of its own carries `match`, a pattern over the index's tag
   text for the questions of its leaf. Everything here is READ: nothing is
   stored but the variations you have worked (per device, a click).

     paperOf(a)         the paper an assessment's Companion is exhaustive for
     data(pid)          the paper's material, normalised (cached)
     archetype(pid, id) one archetype with its leaf, frequency, real
                        questions and report traps
     index(a)           the scope's archetypes by unit, for the Companion
     bank(pid, keys)    the original practice questions as paper items
     pack(pid, ref)     a leaf's subtopic pack: five questions, easy first
     recognition(a, seed, n)  the mixed recognition drill
     marksOf(tokens)    a step's marks from its annotation ("MP1 MP2", "M1 A1")

   Zero Governor traffic (invariant 129).                                */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  function E() { return KOS.exams; }
  function C() { return KOS.examCompanion; }
  function S() { return KOS.examStats; }
  function IX() { return window.KOS_EXAMS && KOS_EXAMS.index; }
  function DP() { return (window.KOS_EXAMS && KOS_EXAMS.deep) || {}; }
  function real(s) { return s !== "specimen" && s !== "sample"; }

  /* a step's marks: each AQA mark point MPn is one mark; Edexcel's M1 A1
     B1 dM1 carry their number; levels (L1–L4) and "" score nothing here */
  var TOKEN = /\b(MP\d+|dM\d|M\d|A\d|B\d)\b/g;
  function marksOf(t) {
    var s = 0;
    String(t || "").replace(TOKEN, function (x) { s += /^MP/.test(x) ? 1 : (+x.replace(/\D/g, "") || 1); return x; });
    return s;
  }
  function tokens(t) { return String(t || "").match(TOKEN) || []; }

  var CACHE = {};
  function catalogue() {
    var by = {};
    ((window.KOS_EXAMS && KOS_EXAMS.archetypes) || []).forEach(function (r) { by[r[0]] = { id: r[0], title: r[3] }; });
    return by;
  }
  function data(pid) {
    var raw = DP()[pid];
    if (!raw) return null;
    if (CACHE[pid] && CACHE[pid].raw === raw && CACHE[pid].n === Object.keys(raw.leaves || {}).length) return CACHE[pid].d;
    var ix = IX(), p = ix && ix.papers[pid], sid = p ? p.subject : null, cat = catalogue();
    var d = { pid: pid, sid: sid, title: p ? p.title : pid, board: p ? p.board : null, leaves: [], byLeaf: {}, byArch: {}, archs: [] };
    function norm(x, ref) {
      var a = {
        id: x.id, ref: ref, key: ref ? sid + ":" + ref : null, title: x.title || (cat[x.id] && cat[x.id].title) || x.id,
        catalogued: !!cat[x.id], match: x.match ? new RegExp(x.match, "i") : null, rules: x.rules || [], traps: x.traps || [],
        variations: (x.variations || []).map(function (v) {
          var steps = (v.steps || []).map(function (s) { return { text: s[0], marks: s[1] || "", why: s[2] || "", value: marksOf(s[1]) }; });
          return { v: v.v, t: v.t, m: v.m, q: v.q, ctx: v.ctx || null, code: v.code || null, steps: steps, trap: v.trap || null, line: v.line || null,
            methods: (v.methods || []).map(function (m) { return { name: m.name, rec: !!m.rec, when: m.when || "", slip: m.slip || null, lines: (m.lines || []).map(function (l) { return { text: l[0], marks: l[1] || "" }; }) }; }),
            levels: v.levels || null };
        })
      };
      d.byArch[a.id] = a;
      if (ref) d.archs.push(a);   /* the leaves' shapes; the extended answers stand apart */
      return a;
    }
    Object.keys(raw.leaves || {}).sort(function (x, y) { return x.localeCompare(y, undefined, { numeric: true }); }).forEach(function (ref) {
      var L = raw.leaves[ref], key = sid + ":" + ref;
      var n = E() && E().nodeOf ? E().nodeOf(key) : null;
      var leaf = { ref: ref, key: key, title: n ? n.title : ref, unit: n ? n.unit : ref.split(".").slice(0, 2).join("."), unitTitle: n ? n.unitTitle : null,
        archetypes: (L.archetypes || []).map(function (x) { return norm(x, ref); }),
        practice: (L.practice || []).map(function (r, i) {
          var o = r[4] || {};
          return { id: pid + ":" + ref + ":" + i, i: i, d: r[0], marks: r[1], q: r[2], ms: r[3] || [], code: o.code || null, ctx: o.ctx || null, arch: o.arch || null, key: key, ref: ref };
        }) };
      d.leaves.push(leaf);
      d.byLeaf[ref] = leaf;
    });
    if (raw.extended) { d.extended = norm(raw.extended, null); d.extended.practice = (raw.extended.practice || []).map(function (r, i) {
      var o = r[4] || {};
      return { id: pid + ":extended:" + i, i: i, d: r[0], marks: r[1], q: r[2], ms: r[3] || [], ctx: o.ctx || null, refs: o.refs || [], arch: d.extended.id };
    }); }
    CACHE[pid] = { raw: raw, n: Object.keys(raw.leaves || {}).length, d: d };
    return d;
  }
  function paperOf(a) {
    var pid = a && C() ? C().indexPaperOf(a) : null;
    return pid && DP()[pid] ? pid : null;
  }

  /* ---------------- an archetype's evidence ---------------- */
  function questionsOf(pid) { var ix = IX(); return ix ? ix.questions.filter(function (q) { return q[0] === pid; }) : []; }
  function instances(pid, arch) {
    var t = C() && C().tags ? C().tags() : null;
    return questionsOf(pid).filter(function (q) {
      if (t && t.of[S().qkey(q)] === arch.id) return true;
      return !!(arch.match && arch.key && (q[5] || []).indexOf(arch.key) !== -1 && arch.match.test(q[6] || ""));
    }).map(function (q) { return { paper: q[0], sitting: q[1], section: q[2], q: q[3], marks: q[4], title: q[6], leaves: q[5] }; })
      .sort(function (x, y) { return x.sitting < y.sitting ? 1 : x.sitting > y.sitting ? -1 : x.q < y.q ? -1 : 1; });
  }
  function freq(pid, inst) {
    var ix = IX(), p = ix && ix.papers[pid];
    var sits = p ? p.sittings.filter(real) : [], on = {};
    var lo = null, hi = null;
    inst.forEach(function (x) { if (!real(x.sitting)) return; on[x.sitting] = (on[x.sitting] || 0) + x.marks; });
    Object.keys(on).forEach(function (s) { lo = lo == null ? on[s] : Math.min(lo, on[s]); hi = hi == null ? on[s] : Math.max(hi, on[s]); });
    return { appear: Object.keys(on).length, of: sits.length, lo: lo, hi: hi, enough: sits.length >= 4 };
  }
  /* the examiner's report notes that are about this archetype's real
     questions: the evidence its traps must cite */
  function reportNotes(pid, inst) {
    var r = window.KOS_EXAMS && KOS_EXAMS.reports && KOS_EXAMS.reports[pid];
    if (!r) return [];
    var on = {};
    inst.forEach(function (x) { on[x.sitting + "|" + x.q] = true; });
    return (r.notes || []).filter(function (n) {
      if (on[n.sitting + "|" + n.q]) return true;
      /* a note that spans a run (Q03.1 to Q03.3) counts for each part in it */
      var a = /^(Q\d+)\.(\d+)$/.exec(n.q), b = n.to ? /^(Q\d+)\.(\d+)$/.exec(n.to) : null;
      if (!a || !b || a[1] !== b[1]) return false;
      for (var i = +a[2] + 1; i <= +b[2]; i++) if (on[n.sitting + "|" + a[1] + "." + i]) return true;
      return false;
    });
  }
  function archetype(pid, id) {
    var d = data(pid);
    var a = d ? (d.byArch[id] || (d.extended && d.extended.id === id ? d.extended : null)) : null;
    if (!a) return null;
    var inst = instances(pid, a), leaf = a.ref ? d.byLeaf[a.ref] : null;
    return {
      a: a, d: d, leaf: leaf, instances: inst, freq: freq(pid, inst), notes: reportNotes(pid, inst),
      traps: a.traps.map(function (t) { return { text: t.text, cite: t.sitting ? C().sittingName(t.sitting) + " " + t.q + (t.to ? "–" + t.to.replace(/^Q\d+\./, "") : "") : null, sitting: t.sitting || null, q: t.q || null }; }),
      practice: leaf ? leaf.practice : a.practice || [],
      group: leaf ? group(d, leaf) : null,
      siblings: leaf ? groupLeaves(d, leaf).reduce(function (o, l) { return o.concat(l.archetypes); }, []) : [a]
    };
  }

  /* the shapes beside one: the leaves under the same sub-section (4.5.4 for
     4.5.4.4), or the whole unit when that holds fewer than three shapes */
  function group(d, leaf) {
    var parts = leaf.ref.split("."), parent = parts.length > 3 ? parts.slice(0, parts.length - 1).join(".") : leaf.unit;
    var ls = d.leaves.filter(function (l) { return l.ref.indexOf(parent + ".") === 0; });
    var n = ls.reduce(function (s, l) { return s + l.archetypes.length; }, 0);
    if (n < 3) parent = leaf.unit;
    var node = KOS.spec.node(d.sid, parent);
    return { ref: parent, title: node ? node.title : parent };
  }
  function groupLeaves(d, leaf) { var g = group(d, leaf); return d.leaves.filter(function (l) { return l.ref.indexOf(g.ref + ".") === 0; }); }

  /* ---------------- the scope's index (for the Companion) ---------------- */
  function index(a) {
    var pid = paperOf(a), d = pid ? data(pid) : null;
    if (!d) return null;
    var inScope = {};
    E().leaves(a).forEach(function (k) { inScope[k] = true; });
    var units = [], byUnit = {}, nA = 0, nV = 0, nP = 0;
    d.leaves.forEach(function (l) {
      if (!inScope[l.key]) return;
      var u = byUnit[l.unit];
      if (!u) {
        var un = KOS.spec.node(d.sid, l.unit);
        u = byUnit[l.unit] = { unit: l.unit, title: un ? un.title : l.unitTitle || l.unit, rows: [] };
        units.push(u);
      }
      l.archetypes.forEach(function (x) {
        var inst = instances(pid, x), f = freq(pid, inst);
        u.rows.push({ id: x.id, title: x.title, ref: l.ref, leaf: l.title, variations: x.variations.length, worked: x.variations.filter(function (v) { return isWorked(pid, x.id, v.v); }).length, freq: f, n: inst.length });
        nA++; nV += x.variations.length;
      });
      nP += l.practice.length;
    });
    return { pid: pid, title: d.title, board: d.board, units: units, archetypes: nA, variations: nV, practice: nP, extended: d.extended || null };
  }

  /* ---------------- worked, per device ---------------- */
  function workedMap() { var ui = KOS.store.state.ui; return ui.examWorked && typeof ui.examWorked === "object" ? ui.examWorked : {}; }
  function isWorked(pid, id, v) { return !!workedMap()[pid + "|" + id + "|" + v]; }
  function setWorked(pid, id, v, on) {
    var ui = KOS.store.state.ui, m = ui.examWorked = ui.examWorked && typeof ui.examWorked === "object" ? ui.examWorked : {};
    var k = pid + "|" + id + "|" + v;
    if (on) m[k] = KOS.srs.todayISO(); else delete m[k];
    KOS.store.save();
  }

  /* ---------------- the bank: original questions as paper items ---------------- */
  function itemOf(d, p, leaf) {
    var arch = p.arch && d.byArch[p.arch] ? d.byArch[p.arch] : leaf && leaf.archetypes[0];
    return { id: p.id, key: p.key || (leaf ? leaf.key : null), ref: p.ref || (leaf ? leaf.ref : ""), title: leaf ? leaf.title : "Extended answer", ctx: p.ctx, code: p.code,
      parts: [{ q: p.q, marks: p.marks, ms: p.ms, code: p.code }], marks: p.marks, d: p.d, arch: arch ? arch.id : null,
      src: null, origin: "KurenaiOS · " + (arch ? arch.title : "original") };
  }
  function bank(pid, keys) {
    var d = data(pid);
    if (!d) return [];
    var on = null;
    if (keys) { on = {}; keys.forEach(function (k) { on[k] = true; }); }
    var out = [];
    d.leaves.forEach(function (l) {
      if (on && !on[l.key]) return;
      l.practice.forEach(function (p) { out.push(itemOf(d, p, l)); });
    });
    if (d.extended) d.extended.practice.forEach(function (p) {
      if (on && p.refs.length && !p.refs.some(function (r) { return on[d.sid + ":" + r]; })) return;
      var it = itemOf(d, p, null);
      it.key = p.refs.length ? d.sid + ":" + p.refs[0] : null; it.ref = p.refs[0] || ""; it.extended = true; it.arch = d.extended.id; it.origin = "KurenaiOS · extended answer";
      out.push(it);
    });
    return out;
  }
  /* a leaf's subtopic pack: five questions, easiest first, one of each
     difficulty before a second of any */
  function pack(pid, ref) {
    var d = data(pid), l = d && d.byLeaf[ref];
    if (!l) return null;
    var by = { 1: [], 2: [], 3: [] }, out = [];
    l.practice.forEach(function (p) { (by[p.d] || by[2]).push(p); });
    for (var round = 0; out.length < 5 && round < 6; round++) [1, 2, 3].forEach(function (k) { if (out.length < 5 && by[k][round]) out.push(by[k][round]); });
    out.sort(function (x, y) { return x.d - y.d || x.i - y.i; });
    return { leaf: l, items: out.map(function (p) { return itemOf(d, p, l); }), marks: out.reduce(function (s, p) { return s + p.marks; }, 0) };
  }

  /* ---------------- the recognition drill (§13.5) ----------------
     20 stems from the scope's variations and practice questions: name the
     shape and the first move. Self-marked, nothing stored. */
  function recognition(a, seed, n) {
    n = n || 20;
    var pid = paperOf(a), d = pid ? data(pid) : null;
    if (!d) return null;
    var rand = C().rng((a ? a.id : "") + ":recog:" + seed), on = {}, pool = [];
    E().leaves(a).forEach(function (k) { on[k] = true; });
    d.leaves.forEach(function (l) {
      if (!on[l.key]) return;
      l.archetypes.forEach(function (x) {
        x.variations.forEach(function (v) {
          var first = v.steps.filter(function (s) { return s.value > 0; })[0] || v.steps[0];
          pool.push({ kind: "recog", arch: x.id, ref: l.ref, title: l.title, q: v.q, code: v.code, ctx: v.ctx,
            a: "**" + x.title + "** · Variation " + v.v + ", " + v.t + (first ? ". First move: " + first.text : "") });
        });
      });
      l.practice.forEach(function (p) {
        var x = p.arch && d.byArch[p.arch] ? d.byArch[p.arch] : l.archetypes[0];
        if (x) pool.push({ kind: "recog", arch: x.id, ref: l.ref, title: l.title, q: p.q, code: p.code, ctx: p.ctx, a: "**" + x.title + "** · " + (p.ms[0] ? "first mark: " + p.ms[0] : "") });
      });
    });
    /* spread across archetypes: at most two stems a shape */
    var per = {}, out = [];
    C().shuffle(pool, rand).forEach(function (x) { if (out.length < n && (per[x.arch] || 0) < 2) { out.push(x); per[x.arch] = (per[x.arch] || 0) + 1; } });
    return { seed: seed, items: out, mins: Math.max(8, Math.round(out.length * 0.75)) };
  }

  KOS.examDeep = {
    data: data, paperOf: paperOf, archetype: archetype, instances: instances, freq: freq, reportNotes: reportNotes, index: index,
    bank: bank, pack: pack, recognition: recognition, marksOf: marksOf, tokens: tokens,
    isWorked: isWorked, setWorked: setWorked, _reset: function () { CACHE = {}; }
  };
})();
