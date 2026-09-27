/* Kurenai OS — core/spec.js
   The specification as a queryable tree (roadmap 1.1).

   ONE INDEX, EVERY PICKER. The generated specifications (js/data/compsci.js,
   maths.js, it.js) are a tree: unit → parent topic(s) → leaf. Several forms
   used to ask for a "related topic" as free text or as a flat leaf list;
   the shared topic picker and every owner that stores topic links read
   this module instead, so a ref means the same thing everywhere.

   Levels:
     unit    a top-level section ("4.1", "P3", "F200");
     parent  any node between a unit and a leaf ("4.1.1", "F200.TA1").
             Maths has none — its leaves hang off the unit directly;
     leaf    a node carrying specification content (what a topic page
             opens and what progress is recorded against).

   Stored topic links are "sid:ref" strings — the same key edits and SRS
   use — so one field can hold topics from different subjects and the
   cloud merge can treat it as a set. A unit or parent pick is stored AS
   PICKED and resolved to its leaves wherever progress is read
   (resolve()); an owner whose contract is leaves-only (Pacing, invariant
   81) expands on save instead.

   This module is PURE over window.KOS_DATA: no store, no DOM, no network.
   It builds lazily on first use, so its place in the load order only has
   to follow the generated data.                                         */
(function () {
  "use strict";
  window.KOS = window.KOS || {};

  var SUBJECTS = ["compsci", "maths", "it"];
  var LEVELS = ["unit", "parent", "leaf"];
  var IDX = null;   // sid -> { nodes: [node], byRef: {ref: node}, leaves: [node], units: [node] }

  function isLeafNode(n) { return !!(n && n.content && n.content.length); }

  function build() {
    if (IDX) return IDX;
    IDX = {};
    SUBJECTS.forEach(function (sid) {
      var data = window.KOS_DATA && window.KOS_DATA[sid];
      var ix = { nodes: [], byRef: {}, leaves: [], units: [] };
      IDX[sid] = ix;
      if (!data || !Array.isArray(data.sections)) return;
      function walk(raw, depth, parent, unit, path) {
        var level = depth === 0 ? "unit" : isLeafNode(raw) ? "leaf" : "parent";
        var node = {
          key: sid + ":" + raw.ref,
          subject: sid,
          ref: String(raw.ref),
          title: String(raw.title || ""),
          level: level,
          depth: depth,
          unit: unit ? unit.ref : String(raw.ref),
          parent: parent ? parent.ref : null,
          path: path.slice(),               // ancestor titles, unit first
          children: [],
          leafRefs: []
        };
        /* a unit that is itself content-bearing is still a unit for picking;
           it also counts as its own leaf so progress can be read from it */
        if (depth === 0 && isLeafNode(raw)) node.selfLeaf = true;
        node.order = ix.nodes.length;
        ix.nodes.push(node);
        ix.byRef[node.ref] = node;
        if (depth === 0) ix.units.push(node);
        if (parent) parent.children.push(node.ref);
        if (level === "leaf" || node.selfLeaf) ix.leaves.push(node);
        (raw.children || []).forEach(function (c) {
          walk(c, depth + 1, node, unit || node, path.concat(node.title));
        });
        /* every node knows the leaves beneath it, in spec order */
        if (level === "leaf" || node.selfLeaf) node.leafRefs.push(node.ref);
        node.children.forEach(function (cr) {
          Array.prototype.push.apply(node.leafRefs, ix.byRef[cr].leafRefs);
        });
      }
      data.sections.forEach(function (sec) { walk(sec, 0, null, null, []); });
    });
    return IDX;
  }

  /* Public nodes are copies: a caller can never corrupt the index. */
  function pub(n) {
    if (!n) return null;
    return {
      key: n.key, subject: n.subject, ref: n.ref, title: n.title, level: n.level,
      unit: n.unit, parent: n.parent, path: n.path.slice(),
      children: n.children.slice(), leafCount: n.leafRefs.length
    };
  }
  function raw(sid, ref) {
    var ix = build()[sid];
    return ix ? ix.byRef[String(ref)] || null : null;
  }

  /* ---------------- keys ---------------- */
  function key(sid, ref) { return sid + ":" + ref; }
  /* "sid:ref" → {subject, ref} for a node that exists; null otherwise.
     Refs contain dots and letters but never a colon, so the first colon
     splits unambiguously. */
  function parse(k) {
    if (typeof k !== "string") return null;
    var i = k.indexOf(":");
    if (i <= 0) return null;
    var sid = k.slice(0, i), ref = k.slice(i + 1);
    return raw(sid, ref) ? { subject: sid, ref: ref } : null;
  }

  /* ---------------- tree reads ---------------- */
  function node(sid, ref) {
    if (ref === undefined && typeof sid === "string" && sid.indexOf(":") > 0) {
      var p = parse(sid); if (!p) return null; sid = p.subject; ref = p.ref;
    }
    return pub(raw(sid, ref));
  }
  function level(sid, ref) { var n = raw(sid, ref); return n ? n.level : null; }
  function units(sid) { var ix = build()[sid]; return ix ? ix.units.map(pub) : []; }
  function children(sid, ref) {
    var n = raw(sid, ref);
    return n ? n.children.map(function (r) { return pub(raw(sid, r)); }) : [];
  }
  /* every node of one level, in spec order. For a subject with no parent
     level (Maths) the parent list is empty — the picker offers units. */
  function levelNodes(sid, lvl) {
    var ix = build()[sid];
    if (!ix || LEVELS.indexOf(lvl) === -1) return [];
    return ix.nodes.filter(function (n) { return n.level === lvl; }).map(pub);
  }
  /* leaves in spec order — the whole subject, or beneath one node */
  function leaves(sid, ref) {
    var ix = build()[sid];
    if (!ix) return [];
    if (ref == null) return ix.leaves.map(pub);
    var n = ix.byRef[String(ref)];
    return n ? n.leafRefs.map(function (r) { return pub(ix.byRef[r]); }) : [];
  }
  /* the nested tree for one subject: {key, ref, title, level, children:[…]} */
  function tree(sid) {
    return units(sid).map(function expand(n) {
      return { key: n.key, subject: n.subject, ref: n.ref, title: n.title, level: n.level,
        leafCount: n.leafCount, children: children(n.subject, n.ref).map(expand) };
    });
  }

  /* ---------------- search ----------------
     By reference or title. Ranking: exact ref, ref prefix, title word
     start, then any substring; spec order within a rank. `level` limits
     the kinds of node returned; `subject` limits the subject. */
  function search(q, opts) {
    opts = opts || {};
    q = String(q == null ? "" : q).trim().toLowerCase();
    var subs = opts.subject ? [opts.subject] : SUBJECTS;
    var lv = opts.level ? [].concat(opts.level) : LEVELS;
    var limit = opts.limit > 0 ? opts.limit : 50;
    var hits = [];
    subs.forEach(function (sid, si) {
      var ix = build()[sid];
      if (!ix) return;
      ix.nodes.forEach(function (n) {
        if (lv.indexOf(n.level) === -1) return;
        var r = n.ref.toLowerCase(), t = n.title.toLowerCase(), rank;
        if (!q) rank = 4;
        else if (r === q) rank = 0;
        else if (r.indexOf(q) === 0) rank = 1;
        else if ((" " + t).indexOf(" " + q) !== -1) rank = 2;
        else if (t.indexOf(q) !== -1 || r.indexOf(q) !== -1) rank = 3;
        else return;
        hits.push({ n: n, rank: rank, si: si });
      });
    });
    hits.sort(function (a, b) { return a.rank - b.rank || a.si - b.si || a.n.order - b.n.order; });
    return hits.slice(0, limit).map(function (h) { return pub(h.n); });
  }

  /* ---------------- stored topic links ----------------
     normaliseRefs(input, opts) is the gate every owner's normaliser calls.
     It accepts every shape a record has ever carried —
       "sid:ref"             the current shape,
       {subject, ref}        assignments/calendar `topics` before 1.1,
       "ref" + opts.subject  a bare ref under a known subject (old single
                             `ref` fields, Pacing rows) —
     and returns unique "sid:ref" keys of nodes that EXIST, in first-seen
     order. Unknown refs are dropped, never re-pointed at a near match
     (invariant 81). Options: subject (the hint for bare refs, and with
     `oneSubject` the only subject allowed), leavesOnly (expand unit and
     parent picks to their leaves), max. */
  function normaliseRefs(input, opts) {
    opts = opts || {};
    var list = input == null ? [] : Array.isArray(input) ? input : [input];
    var out = [], seen = {};
    function push(k) {
      if (!seen[k]) { seen[k] = true; out.push(k); }
    }
    list.forEach(function (item) {
      var sid = null, ref = null;
      /* a {ref} pair with no subject is read like a bare ref */
      if (item && typeof item === "object" && !item.subject && item.ref != null) item = String(item.ref);
      if (typeof item === "string") {
        var s = item.trim();
        var p = parse(s);
        if (p) { sid = p.subject; ref = p.ref; }
        else if (opts.subject && raw(opts.subject, s)) { sid = opts.subject; ref = s; }
        else if (!opts.subject) {
          /* a bare ref with no subject (old calendar topics): accepted only
             when exactly one subject has it — never a guess */
          var owners = SUBJECTS.filter(function (x) { return raw(x, s); });
          if (owners.length === 1) { sid = owners[0]; ref = s; }
        }
      } else if (item && typeof item === "object" && item.subject && item.ref != null) {
        if (raw(String(item.subject), String(item.ref))) { sid = String(item.subject); ref = String(item.ref); }
      }
      if (!sid) return;
      if (opts.oneSubject && opts.subject && sid !== opts.subject) return;
      if (opts.leavesOnly) {
        raw(sid, ref).leafRefs.forEach(function (lr) { push(key(sid, lr)); });
      } else push(key(sid, ref));
    });
    return opts.max > 0 ? out.slice(0, opts.max) : out;
  }
  /* the leaves a set of links covers, unique, as "sid:ref" keys */
  function resolve(refs) {
    return normaliseRefs(refs, { leavesOnly: true });
  }
  /* does a set of links cover this leaf? (a unit pick covers all of it) */
  function covers(refs, sid, ref) {
    return resolve(refs).indexOf(key(sid, ref)) !== -1;
  }
  /* [{subject, ref}] for readers that want the pair form */
  function pairs(refs) {
    return normaliseRefs(refs).map(function (k) { return parse(k); });
  }
  /* the first leaf a set of links covers — the single `ref` an older
     reader (the session ledger, RAG) still reads */
  function firstLeaf(refs) {
    var r = resolve(refs);
    return r.length ? parse(r[0]) : null;
  }
  /* the distinct subjects a set of links spans */
  function subjectsOf(refs) {
    var out = [];
    normaliseRefs(refs).forEach(function (k) {
      var s = k.slice(0, k.indexOf(":"));
      if (out.indexOf(s) === -1) out.push(s);
    });
    return out;
  }
  function label(sid, ref) {
    var n = ref === undefined ? node(sid) : node(sid, ref);
    return n ? n.ref + " " + n.title : "";
  }

  KOS.spec = {
    SUBJECTS: SUBJECTS.slice(),
    LEVELS: LEVELS.slice(),
    key: key,
    parse: parse,
    node: node,
    level: level,
    units: units,
    children: children,
    levelNodes: levelNodes,
    leaves: leaves,
    tree: tree,
    search: search,
    normaliseRefs: normaliseRefs,
    resolve: resolve,
    covers: covers,
    pairs: pairs,
    firstLeaf: firstLeaf,
    subjectsOf: subjectsOf,
    label: label,
    /* tests: drop the lazily built index (after swapping KOS_DATA) */
    _reset: function () { IDX = null; }
  };
})();
