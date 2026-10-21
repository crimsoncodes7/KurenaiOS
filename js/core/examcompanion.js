/* Kurenai OS — core/examcompanion.js
   The Study Companion's ASSEMBLED layer and the playbook (roadmap 5.8
   phase 5, docs/exams-plan.md §13.1, §13.3, §13.4, §16.4, §16.7; frames
   29o, 29r, 29s, 29ac). Everything here is READ at the time it is asked
   for, from what already exists — nothing is stored and nothing is new
   material:

     guide(a)       the assessment's resolved leaves → key notes, the
                    command words its items use, the booklet against
                    must-memorise, traps, labs, exam items, the cram deck
                    (from the notes' own callouts and items, the playbook
                    and the examiner's report notes)
     drill(a, seed) the 15-question rapid drill: flashcards and short
                    items from the scope, seeded so it can be replayed
     playbook(board, a)  the drawer's six sections, filtered to a scope
     habitFor(board, text)  the 30-second pre-flight a question calls up
     likelihood(a)  trend and likelihood for a board paper: the marks by
                    topic and sitting, the core half, the yield map, due
                    by pattern, the discriminators, your marks against the
                    paper's weighting
     archetypes(paperId)  the catalogue's frequency per paper
     pack(a, parts) the revision pack's pages for print

   Zero Governor traffic and no writes (invariant 129).                 */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  function E() { return KOS.exams; }
  function S() { return KOS.examStats; }
  function IX() { return window.KOS_EXAMS && KOS_EXAMS.index; }
  function PB() { return (window.KOS_EXAMS && KOS_EXAMS.playbook) || {}; }
  function today() { return KOS.srs.todayISO(); }

  /* ---------------- a seeded random (a drill or paper replays) ---------------- */
  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function rng(seed) {
    var t = hash(String(seed)) || 1;
    return function () {
      t += 0x6D2B79F5;
      var r = Math.imul(t ^ (t >>> 15), 1 | t);
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffle(list, rand) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rand() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  /* ---------------- boards ---------------- */
  function boardOf(a) {
    var map = (window.KOS_EXAMS && KOS_EXAMS.boardOf) || {};
    if (a && a.preset && E().preset(a.preset)) {
      var b = E().preset(a.preset).board;
      if (/aqa/i.test(b)) return "AQA";
      if (/edexcel|pearson/i.test(b)) return "Edexcel";
      if (/ocr/i.test(b)) return "OCR";
    }
    return a ? map[a.subject] || null : null;
  }
  function indexPaperOf(a) {
    var pr = a && a.preset ? E().preset(a.preset) : null;
    return pr && pr.index && IX() && IX().papers[pr.index] ? pr.index : null;
  }

  /* ---------------- the notes' blocks ---------------- */
  function plain(b) {
    if (b == null) return "";
    if (typeof b === "string") return b;
    if (b.p) return b.p;
    if (b.md) return b.md;
    if (b.h) return b.h;
    if (b.ul || b.ol) return (b.ul || b.ol).join("; ");
    return "";
  }
  /* every callout in a leaf's notes, in order, with its kind */
  function callouts(blocks, out) {
    out = out || [];
    (blocks || []).forEach(function (b) {
      if (!b || typeof b !== "object") return;
      if (b.callout) {
        var body = typeof b.callout.body === "string" ? [b.callout.body] : b.callout.body || [];
        out.push({ kind: b.callout.t, h: b.callout.h || "", body: body, text: body.map(plain).filter(Boolean).join(" ") });
        callouts(body, out);
      }
      if (Array.isArray(b.body)) callouts(b.body, out);
    });
    return out;
  }
  function leafInfo(k) {
    var p = KOS.spec.parse(k), n = E().nodeOf ? E().nodeOf(k) : null;
    var c = p ? KOS.content.get(p.subject, p.ref) : null;
    return { key: k, sid: p ? p.subject : null, ref: p ? p.ref : k, title: n ? n.title : k, unit: n ? n.unit : null, unitTitle: n ? n.unitTitle : null, content: c };
  }
  /* the exam items of a leaf, a multi-part item kept whole */
  function itemsOf(info) {
    return ((info.content && info.content.exam) || []).map(function (it, i) {
      var parts = it.parts ? it.parts.map(function (pt) { return { q: pt.q, marks: pt.marks || 0, ms: pt.ms || [] }; })
        : [{ q: it.q, marks: it.marks || 0, ms: it.ms || [] }];
      return { id: info.key + "#" + i, key: info.key, sid: info.sid, ref: info.ref, title: info.title, ctx: it.ctx || null, parts: parts,
        marks: parts.reduce(function (s, p) { return s + (p.marks || 0); }, 0), src: it.src || null, level: it.level || null };
    });
  }

  /* ---------------- command words and habits ---------------- */
  function wordsOf(cmd) { return [cmd.w.toLowerCase()].concat((cmd.also || []).map(function (x) { return x.toLowerCase(); })); }
  function commandIn(board, text) {
    var t = String(text || "").toLowerCase();
    var cmds = (PB()[board] || {}).commands || [];
    /* the longest phrase that appears wins ("show that" over "show") */
    var best = null, bestLen = 0;
    cmds.forEach(function (c) {
      wordsOf(c).forEach(function (w) {
        var re = new RegExp("(^|[^a-z])" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "([^a-z]|$)");
        if (re.test(t) && w.length > bestLen) { best = c; bestLen = w.length; }
      });
    });
    return best;
  }
  function habitFor(board, text) {
    var t = String(text || "").toLowerCase();
    var hs = (PB()[board] || {}).habits || [], best = null, bestLen = 0;
    hs.forEach(function (h) {
      (h.words || []).forEach(function (w) { if (t.indexOf(w) !== -1 && w.length > bestLen) { best = h; bestLen = w.length; } });
    });
    return best;
  }

  /* ---------------- the examiner's report notes ---------------- */
  function reportsFor(paperId) { var r = window.KOS_EXAMS && KOS_EXAMS.reports; return r && paperId ? r[paperId] || null : null; }
  /* every report note on a leaf, across this board's papers */
  function notesForLeaf(k, board) {
    var r = window.KOS_EXAMS && KOS_EXAMS.reports, ref = k.slice(k.indexOf(":") + 1), out = [];
    if (!r) return out;
    Object.keys(r).forEach(function (pid) {
      var p = IX() && IX().papers[pid];
      if (!p || (board && boardOf({ subject: p.subject }) !== board && !(board === "AQA" && /aqa/.test(pid)))) return;
      (r[pid].notes || []).forEach(function (n) {
        if (n.leaf && (n.leaf === ref || ref.indexOf(n.leaf + ".") === 0 || n.leaf.indexOf(ref + ".") === 0)) out.push(Object.assign({ paper: pid, paperTitle: p.title }, n));
      });
    });
    return out;
  }
  function trapsOf(note) {
    return (note.points || []).filter(function (t) { return /^(trap|traps?\b|most:|common|watch)/i.test(t) || /\btrap\b/i.test(t); });
  }

  /* ================= the assembled guide (§13.1, 29o) ================= */
  function guide(a) {
    if (!a) return null;
    var board = boardOf(a), ls = E().leaves(a), now = today();
    var infos = ls.map(leafInfo);
    var tiles = [], booklet = [], memorise = [], mnemonics = [], traps = [], labs = [], items = [], defs = [];
    var seenLab = {};
    infos.forEach(function (info) {
      var cs = info.content ? callouts(info.content.notes) : [];
      var rule = cs.filter(function (c) { return c.kind === "formula" || c.kind === "memorise" || c.kind === "def"; })[0] || null;
      var tip = cs.filter(function (c) { return c.kind === "tip" || c.kind === "warn"; })[0] || null;
      tiles.push({ key: info.key, ref: info.ref, title: info.title, unitTitle: info.unitTitle, has: !!info.content,
        rule: rule ? { kind: rule.kind, h: rule.h, text: rule.text } : null, line: tip ? tip.text : null,
        taught: E().leafCovered(info.key), week: E().nextInPacing ? E().nextInPacing(info.key, now) : null });
      cs.forEach(function (c) {
        var row = { key: info.key, ref: info.ref, title: info.title, h: c.h, text: c.text, body: c.body };
        if (c.kind === "formula") booklet.push(row);
        else if (c.kind === "memorise") memorise.push(row);
        else if (c.kind === "mnemonic") mnemonics.push(row);
        else if (c.kind === "miscon" || c.kind === "warn") traps.push(Object.assign({ from: "notes", kind: c.kind }, row));
        else if (c.kind === "def") defs.push(row);
      });
      notesForLeaf(info.key, board).forEach(function (n) {
        trapsOf(n).forEach(function (t) { traps.push({ key: info.key, ref: info.ref, title: info.title, h: n.title, text: t, from: "report", cite: n.paperTitle + " · " + sittingName(n.sitting) + " " + n.q }); });
      });
      if (KOS.sims && KOS.sims.forRef && info.sid) KOS.sims.forRef(info.sid, info.ref).forEach(function (sm) {
        if (seenLab[sm.id]) return;
        seenLab[sm.id] = true;
        labs.push({ id: sm.id, title: sm.title || sm.name || sm.id, desc: sm.desc || sm.blurb || "", key: info.key });
      });
      items = items.concat(itemsOf(info));
    });
    /* the command words the scope's items use, with how many */
    var cmdCount = {}, cmdRow = {};
    items.forEach(function (it) {
      it.parts.forEach(function (pt) {
        var c = commandIn(board, (it.ctx || "") + " " + pt.q);
        if (!c) return;
        cmdCount[c.w] = (cmdCount[c.w] || 0) + 1;
        cmdRow[c.w] = c;
      });
    });
    var commands = Object.keys(cmdCount).sort(function (x, y) { return cmdCount[y] - cmdCount[x]; })
      .map(function (w) { return Object.assign({ n: cmdCount[w] }, cmdRow[w]); });
    /* traps: the report's first (they are evidence), then the notes', one per leaf in turn */
    var rep = traps.filter(function (t) { return t.from === "report"; }), own = traps.filter(function (t) { return t.from !== "report"; });
    var cram = KOS.examPlan ? { cards: KOS.examPlan.cardsInScope(a), due: KOS.examPlan.dueInScope(a, now), seenWeek: seenThisWeek(ls, now) } : null;
    return {
      a: a, board: board, leaves: infos.length, tiles: tiles, commands: commands, booklet: booklet, memorise: memorise,
      mnemonics: mnemonics, traps: rep.concat(own), labs: labs, items: items, defs: defs, cram: cram,
      sections: [
        ["notes", "Key notes", tiles.length > 0],
        ["commands", "Command words", commands.length > 0],
        ["booklet", board === "Edexcel" ? "Booklet or memorise" : "Must memorise", booklet.length + memorise.length > 0],
        ["traps", "Traps", traps.length > 0],
        ["labs", "Labs", labs.length > 0],
        ["items", "Exam items", items.length > 0],
        ["cram", "Cram and drill", !!cram]
      ].filter(function (s) { return s[2]; }).map(function (s) { return { id: s[0], title: s[1] }; })
    };
  }
  function seenThisWeek(ls, now) {
    var from = KOS.srs.addDays(now, -6), n = 0;
    ls.forEach(function (k) {
      var p = KOS.spec.parse(k);
      if (!p) return;
      KOS.srs.cardsFor(p.subject, p.ref).forEach(function (c) { var m = KOS.srs.peek(c.key); if (m && m.last && m.last >= from) n++; });
    });
    return n;
  }
  var MON = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  function sittingName(s) {
    if (!s) return "";
    if (KOS.examIndex && KOS.examIndex.sittingLabel) return KOS.examIndex.sittingLabel(s);
    var p = String(s).split("-");
    return MON[+p[1] - 1] + " " + p[0];
  }

  /* ================= the rapid drill (§13.1) =================
     15 questions mixed from the scope: flashcards and items of up to 3
     marks with a mark scheme, two cards to every item, seeded so the same
     drill replays. Self-marked: nothing is rated and nothing scheduled —
     the misses go to a cram run of those cards. */
  function drill(a, seed, n) {
    n = n || 15;
    var rand = rng((a ? a.id : "") + ":" + seed), cards = [], short = [];
    E().leaves(a).forEach(function (k) {
      var info = leafInfo(k);
      if (!info.sid) return;
      KOS.srs.cardsFor(info.sid, info.ref).forEach(function (c) {
        if (c.q && c.a) cards.push({ kind: "card", key: c.key, leaf: k, ref: info.ref, title: info.title, q: c.q, a: c.a });
      });
      itemsOf(info).forEach(function (it) {
        if (it.parts.length === 1 && it.marks > 0 && it.marks <= 3 && it.parts[0].ms.length) {
          short.push({ kind: "item", id: it.id, leaf: k, ref: info.ref, title: info.title, q: it.parts[0].q, marks: it.marks, ms: it.parts[0].ms, ctx: it.ctx });
        }
      });
    });
    /* the weakest leaves first among the cards: recall today, lowest first */
    cards = shuffle(cards, rand);
    var wantItems = Math.min(short.length, Math.round(n / 3)), out = [];
    var its = shuffle(short, rand).slice(0, wantItems);
    var cs = cards.slice(0, n - its.length);
    for (var i = 0, j = 0; out.length < cs.length + its.length;) {
      if (j < its.length && (out.length % 3 === 2 || i >= cs.length)) out.push(its[j++]);
      else out.push(cs[i++]);
    }
    return { seed: seed, items: out, mins: Math.max(5, Math.round(out.length * 0.8)) };
  }

  /* ================= the playbook drawer (§13.3, 29r) ================= */
  function playbook(board, a) {
    var pb = PB()[board];
    if (!pb) return null;
    var g = a && boardOf(a) === board ? guide(a) : null;
    var sections = [];
    var booklet = g ? g.booklet : [], memorise = g ? g.memorise : [];
    if (!g) {
      /* no assessment from this board: the whole subject's callouts */
      var sid = board === "AQA" ? "compsci" : board === "Edexcel" ? "maths" : "it";
      (KOS.hub && KOS.hub.LEAVES && KOS.hub.LEAVES[sid] || []).forEach(function (leaf) {
        var c = KOS.content.get(sid, leaf.ref);
        if (!c) return;
        callouts(c.notes).forEach(function (x) {
          var row = { key: sid + ":" + leaf.ref, ref: leaf.ref, title: leaf.title, h: x.h, text: x.text, body: x.body };
          if (x.kind === "formula") booklet.push(row);
          else if (x.kind === "memorise") memorise.push(row);
        });
      });
    }
    if (booklet.length || memorise.length) sections.push({ id: "booklet", title: board === "Edexcel" ? "Booklet" : "Memorise", booklet: booklet, memorise: memorise });
    sections.push({ id: "commands", title: "Command words", rows: pb.commands, habits: pb.habits });
    if (pb.levels) sections.push({ id: "levels", title: "Levels", levels: pb.levels });
    if (pb.calculator && (!a || a.calculator !== "none")) sections.push({ id: "calculator", title: pb.calculator.title, calculator: pb.calculator });
    var mn = g ? g.mnemonics : mnemonicsOfBoard(board);
    if (mn.length) sections.push({ id: "mnemonics", title: "Mnemonics", rows: mn });
    sections.push({ id: "blacklist", title: "Blacklist", rows: blacklist(board, a) });
    return { board: board, title: pb.title, conventions: pb.conventions, conventionsNote: pb.conventionsNote, notation: pb.notation, sections: sections, scoped: !!g };
  }
  function mnemonicsOfBoard(board) {
    var sid = board === "AQA" ? "compsci" : board === "Edexcel" ? "maths" : "it", out = [];
    (KOS.hub && KOS.hub.LEAVES && KOS.hub.LEAVES[sid] || []).forEach(function (leaf) {
      var c = KOS.content.get(sid, leaf.ref);
      if (c) callouts(c.notes).forEach(function (x) { if (x.kind === "mnemonic") out.push({ key: sid + ":" + leaf.ref, ref: leaf.ref, title: leaf.title, h: x.h, text: x.text }); });
    });
    return out;
  }
  /* the Misconceptions Blacklist: yours (your three most frequent tags),
     then the examiner reports' traps, then the notes' misconceptions —
     each says where it came from */
  function blacklist(board, a) {
    var out = [];
    var atts = (KOS.tracker ? KOS.tracker.all() : []).filter(function (e) { return boardOf({ subject: e.subject }) === board; });
    var pats = S() && S().patterns ? S().patterns(atts.reduce(function (qs, e) { return qs.concat(e.questions || []); }, [])) : null;
    if (pats && pats.list) pats.list.slice(0, 3).forEach(function (p) {
      var fix = S().TAG_FIX[p.tag];
      out.push({ from: "yours", text: fix ? fix[0] : p.tag, fix: fix ? fix[1] : "", n: p.questions ? p.questions.length : null, marks: p.marks });
    });
    var ls = a && boardOf(a) === board ? E().leaves(a) : null;
    var r = window.KOS_EXAMS && KOS_EXAMS.reports;
    if (r) Object.keys(r).forEach(function (pid) {
      var p = IX() && IX().papers[pid];
      if (!p || boardOf({ subject: p.subject }) !== board) return;
      (r[pid].notes || []).forEach(function (n) {
        if (ls && n.leaf && !ls.some(function (k) { var ref = k.slice(k.indexOf(":") + 1); return ref === n.leaf || ref.indexOf(n.leaf + ".") === 0; })) return;
        trapsOf(n).forEach(function (t) { out.push({ from: "report", text: t, cite: p.title + " · " + sittingName(n.sitting) + " " + n.q, leaf: n.leaf }); });
      });
    });
    var g = ls ? guide(a) : null;
    (g ? g.traps.filter(function (t) { return t.from === "notes"; }) : []).slice(0, 12).forEach(function (t) { out.push({ from: "notes", text: t.text, h: t.h, cite: t.ref + " " + t.title }); });
    return out;
  }

  /* ================= trend and likelihood (§13.4, 29s) ================= */
  var TAGS = null;
  function tags() {
    if (!TAGS && IX() && window.KOS_EXAMS.archetypes && S()) TAGS = S().tagArchetypes(IX(), KOS_EXAMS.archetypes);
    return TAGS;
  }
  function archetypes(paperId) { var t = tags(); return t ? S().archetypeStats(IX(), t, paperId) : null; }
  function unitOf(k) { var n = E().nodeOf ? E().nodeOf(k) : null; return n ? n.unitTitle || n.unit || null : null; }
  function likelihood(a) {
    var pid = indexPaperOf(a);
    if (!pid) return null;
    var ix = IX(), st = archetypes(pid);
    var hm = S().heat(ix, pid, unitOf);
    var core = S().coreHalf(st);
    /* discriminators: the report notes' hardest questions (the ones the
       report says few got), else the longest schemes in the index */
    var rep = reportsFor(pid), disc = [];
    if (rep) rep.notes.forEach(function (n) {
      var hard = (n.points || []).filter(function (t) { return /only (about )?(a )?(quarter|third|few|minority|handful)|poorly|very few|most (lost|did not|could not)|rarely/i.test(t); })[0];
      if (hard) disc.push({ q: n.q, sitting: n.sitting, title: n.title, marks: n.marks, why: hard, from: "report" });
    });
    if (!disc.length) {
      ix.questions.filter(function (q) { return q[0] === pid && q[1] !== "specimen" && q[1] !== "sample"; })
        .sort(function (x, y) { return y[4] - x[4]; }).slice(0, 3)
        .forEach(function (q) { disc.push({ q: q[3], sitting: q[1], title: q[6], marks: q[4], from: "index" }); });
    }
    /* your marks against the paper's weighting: what a paper carries per
       topic and what you keep there, from your marked questions */
    var keep = {}, avail = {};
    E().attemptsFor(a).forEach(function (e) {
      (e.questions || []).forEach(function (q) {
        if (q.max == null || q.got == null || !(q.refs || []).length) return;
        q.refs.forEach(function (k) {
          var t = unitOf(k) || "Other";
          avail[t] = (avail[t] || 0) + q.max / q.refs.length;
          keep[t] = (keep[t] || 0) + q.got / q.refs.length;
        });
      });
    });
    var marked = Object.keys(avail).length >= 1;
    var you = hm ? hm.rows.filter(function (r) { return avail[r.topic]; }).map(function (r) {
      var share = keep[r.topic] / avail[r.topic];
      var paper = r.mean * r.appear / Math.max(1, r.of);
      return { topic: r.topic, paper: Math.round(paper * 10) / 10, keep: Math.round(paper * share * 10) / 10, drop: Math.round(paper * (1 - share) * 10) / 10 };
    }).sort(function (x, y) { return y.drop - x.drop; }).slice(0, 8) : [];
    return { paper: pid, title: ix.papers[pid].title, sittings: hm ? hm.sittings : [], enough: hm ? hm.enough : false, heat: hm, archetypes: st, core: core,
      discriminators: disc.slice(0, 4), you: marked ? you : [], reports: !!rep };
  }

  /* ================= the revision pack (§16.7, 29ac) =================
     The parts that exist for the scope, each with its page count at the
     print size (a page holds fewer lines in large print). */
  var PARTS = [
    ["notes", "Key notes for every leaf"],
    ["variations", "Worked variations with mark annotations"],
    ["traps", "Traps and conventions"],
    ["cards", "Cram deck as fold-over cards"],
    ["drill", "The 15-question drill and answers"]
  ];
  function pack(a, opts) {
    opts = opts || {};
    var g = guide(a), large = !!opts.large, per = large ? 0.6 : 1;
    if (!g) return null;
    var cards = [];
    E().leaves(a).forEach(function (k) { var p = KOS.spec.parse(k); if (p) KOS.srs.cardsFor(p.subject, p.ref).forEach(function (c) { if (c.q && c.a) cards.push(c); }); });
    var dr = drill(a, opts.seed || 1);
    var parts = PARTS.map(function (p) {
      var pages = 0, available = true, why = null;
      if (p[0] === "notes") pages = Math.ceil(g.tiles.filter(function (t) { return t.has; }).length / (2 * per));
      else if (p[0] === "variations") { available = false; why = "Worked variations arrive when the Companion for this paper is built."; }
      else if (p[0] === "traps") pages = Math.max(1, Math.ceil((g.traps.length + g.commands.length) / (14 * per)));
      else if (p[0] === "cards") pages = Math.ceil(cards.length / (12 * per));
      else if (p[0] === "drill") pages = Math.ceil(dr.items.length / (10 * per));
      if (!pages && available) { available = false; why = "Nothing to print for this scope."; }
      return { id: p[0], title: p[1], pages: pages, available: available, why: why, count: p[0] === "cards" ? cards.length : p[0] === "drill" ? dr.items.length : null };
    });
    return { guide: g, parts: parts, cards: cards, drill: dr, large: large };
  }

  KOS.examCompanion = {
    rng: rng, hash: hash, shuffle: shuffle,
    boardOf: boardOf, indexPaperOf: indexPaperOf, callouts: callouts, leafInfo: leafInfo, itemsOf: itemsOf,
    commandIn: commandIn, habitFor: habitFor, guide: guide, drill: drill, playbook: playbook, blacklist: blacklist,
    archetypes: archetypes, tags: tags, likelihood: likelihood, pack: pack, PARTS: PARTS,
    reportsFor: reportsFor, notesForLeaf: notesForLeaf, sittingName: sittingName
  };
})();
