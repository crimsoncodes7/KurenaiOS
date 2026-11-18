/* Kurenai OS — core/examsession.js · KOS.examSession
   One exam, reworked (docs/exams-rework-plan.md §4–§5, §8.5; design turns
   45–47). Everything here is a PURE READ over the records other modules
   own — the assessment (KOS.exams), the cards (KOS.srs), the question
   histories (KOS.questions), RAG (KOS.rag), the logged attempts
   (KOS.tracker) and the authored papers (KOS.examPaper) — except the few
   writes a click makes, each named below.

     SECTIONS          the exam's eight sections, in sidebar order
     topics(a)         the scope as a checklist (45d): one row per topic
     questions(a)      the scope's exam questions, each with its history
     today(a)          today's session (45c), COMPUTED, never stored:
                       due cards, redo items, the weakest topic's next step,
                       a paper on paper days, at most two targets
     strip(a)          Coverage · Recall · Practice · Calibration: a figure,
                       or the action that fills it — never "not enough"
     marks(a)          each section's progress mark for the sidebar
     chapters(a)       Revise's chapters, in order (46a)
     schedule(a)       the days to the exam with the sessions placed (45f)
     targets(aid)      the exam's targets (47h) and their evidence

   Writes, each from a click and never from a render:
     start / pause / skip     the running step (per device, state.ui)
     markRead                 a chapter read (per device, state.ui, §9.5)
     setRag                   a topic's confidence (through KOS.rag)
     sendSchedule             the plan's personal Pacing rows, tagged
                              exam:<id> (invariant 126's one write)
     addTarget / closeTarget  state.exams.targets (synced)

   Zero Governor traffic (invariant 129).                                 */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var SECTIONS = [
    ["today", "今", "Today"], ["plan", "計", "Plan"], ["topics", "項", "Topics"], ["revise", "読", "Revise"],
    ["questions", "問", "Questions"], ["papers", "紙", "Papers"], ["review", "省", "Review"], ["day", "当", "On the day"]];
  var COMMANDS = ["Identify", "State", "Define", "Give", "Name", "Outline", "Describe", "Explain", "Analyse", "Discuss", "Evaluate",
    "Justify", "Compare", "Assess", "Calculate", "Find", "Show", "Prove", "Write", "Draw", "Complete", "Suggest", "Sketch", "Solve"];

  function E() { return KOS.exams; }
  function today() { return KOS.srs.todayISO(); }
  function addDays(d, n) { return KOS.srs.addDays(d, n); }
  function between(a, b) { return KOS.srs.daysBetween(a, b); }
  function ui() { return KOS.store.state.ui; }
  function uiMap(k) { var u = ui(); return u[k] && typeof u[k] === "object" ? u[k] : {}; }
  function setUi(k, fn) { var u = ui(); u[k] = u[k] && typeof u[k] === "object" ? u[k] : {}; fn(u[k]); KOS.store.save(); }
  function rid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function dowOf(iso) { var p = iso.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]).getDay(); }

  /* ---------------- topics (45d) ----------------
     The scope's picks, expanded to the grain a school's checklist uses: a
     paper becomes its units, IT's units their leaves (F201's 2.6 is a
     topic), anything holding more than twelve leaves its children. A leaf
     the scope holds that no pick reaches (a Pacing rule) is a topic of its
     own. */
  function expand(sid, ref, out, seen, held) {
    var n = KOS.spec.node(sid, ref);
    if (!n) return;
    var kids = KOS.spec.children(sid, ref) || [];
    var split = n.level !== "leaf" && kids.length && (n.level === "paper" || sid === "it" || n.leafCount > 12);
    if (split) { kids.forEach(function (c) { expand(sid, c.ref, out, seen, held); }); return; }
    var key = sid + ":" + n.ref;
    if (seen[key]) return;
    var ls = KOS.spec.resolve([key]).filter(function (k) { return held[k]; });
    if (!ls.length) return;
    seen[key] = true;
    ls.forEach(function (k) { seen[k] = true; });
    /* IT's refs carry their unit (F201.2.6); inside one unit's exam the
       unit is said once, in the header, and a row reads 2.6 (45d) */
    var short = sid === "it" ? n.ref.replace(/^F\d{3}\./, "") : n.ref;
    out.push({ key: key, sid: sid, ref: n.ref, short: short, title: n.title, leaves: ls });
  }
  var PAPER_CACHE = {};
  function paperOfLeaf(k) {
    var p = KOS.spec.parse(k);
    if (!p) return null;
    if (!PAPER_CACHE[p.subject]) {
      var m = {};
      (KOS.spec.papers(p.subject) || []).forEach(function (pp) {
        KOS.spec.resolve([p.subject + ":" + pp.ref]).forEach(function (x) { if (!m[x]) m[x] = pp.ref; });
      });
      PAPER_CACHE[p.subject] = m;
    }
    return PAPER_CACHE[p.subject][k] || null;
  }
  function paperShort(ref) { var m = /(\d+)$/.exec(String(ref || "")); return m ? "P" + m[1] : ref ? String(ref) : null; }

  /* the scope's topics, their rows' facts; memoised for one render's
     worth of reads (AP-18) */
  var memo = { at: 0, key: "", v: null };
  function topics(a, now) {
    if (!a || !a.scope) return [];
    now = now || today();
    var key = a.id + "|" + a.updatedAt + "|" + now;
    if (memo.key === key && Date.now() - memo.at < 1500) return memo.v;
    var held = {}, out = [], seen = {};
    E().leaves(a, now).forEach(function (k) { held[k] = true; });
    (a.scope.include || []).forEach(function (pick) {
      var p = KOS.spec.parse(pick);
      if (p) expand(p.subject, p.ref, out, seen, held);
    });
    Object.keys(held).forEach(function (k) {
      if (seen[k]) return;
      var p = KOS.spec.parse(k);
      if (p) expand(p.subject, p.ref, out, seen, held);
    });
    var qs = questions(a, out);
    out.forEach(function (t) {
      var mem = { cards: 0, rated: 0, sum: 0, due: 0, last: null };
      t.leaves.forEach(function (k) {
        var p = KOS.spec.parse(k);
        KOS.srs.cardsFor(p.subject, p.ref).forEach(function (c) {
          var m = KOS.srs.peek(c.key);
          mem.cards++;
          if (m && m.due && m.due <= now && !m.leech) mem.due++;
          if (m && m.last && (!mem.last || m.last > mem.last)) mem.last = m.last;
        });
        var tm = KOS.srs.topicMemory(p.subject, p.ref, now);
        if (tm.recall != null) { mem.sum += tm.recall * tm.rated; mem.rated += tm.rated; }
      });
      var rag = KOS.rag ? KOS.rag.effective(t.sid, t.ref) : null;
      if (rag && !rag.band && t.leaves.length > 1) {
        /* a topic over several leaves reads its worst rated leaf */
        var order = { r: 0, a: 1, g: 2 };
        t.leaves.forEach(function (k) {
          var p = KOS.spec.parse(k), e = KOS.rag.effective(p.subject, p.ref);
          if (e.band && (!rag.band || order[e.band] < order[rag.band])) rag = { band: e.band, source: e.source, manual: null };
        });
      }
      var mine = qs.filter(function (q) { return t.leaves.indexOf(q.leaf) !== -1; });
      var best = null, last = mem.last, tried = 0, todayN = 0;
      mine.forEach(function (q) {
        if (q.tries.length) tried++;
        q.tries.forEach(function (x) {
          if (x.max && (!best || x.got / x.max > best.got / best.max)) best = { got: x.got, max: x.max, d: x.d };
          if (x.d && (!last || x.d > last)) last = x.d;
          if (x.d === now) todayN++;
        });
      });
      t.paper = paperOfLeaf(t.leaves[0]);
      t.rag = rag && rag.band ? rag.band : null;
      t.ragManual = rag ? rag.manual || null : null;
      t.cards = mem.cards; t.due = mem.due;
      t.recall = mem.rated ? mem.sum / mem.rated : null;
      t.best = best; t.last = last;
      t.qn = mine.length; t.tried = tried; t.today = todayN;
    });
    memo = { at: Date.now(), key: key, v: out };
    return out;
  }
  /* the papers a scope's topics span ("Both papers · P1 · P2") */
  function papersOf(a) {
    var seen = {}, out = [];
    topics(a).forEach(function (t) { if (t.paper && !seen[t.paper]) { seen[t.paper] = true; out.push(t.paper); } });
    return out.sort();
  }
  /* weakest first (45d): Red, then Amber, then unrated, then Green; within
     a band the lower recall first; never-practised before practised */
  var RANK = { r: 0, a: 1, null: 2, g: 3 };
  function weakest(rows) {
    return rows.slice().sort(function (x, y) {
      var rx = RANK[x.rag], ry = RANK[y.rag];
      if (rx !== ry) return rx - ry;
      var cx = x.recall == null ? 2 : x.recall, cy = y.recall == null ? 2 : y.recall;
      if (cx !== cy) return cx - cy;
      return (x.last || "") < (y.last || "") ? -1 : (x.last || "") > (y.last || "") ? 1 : 0;
    });
  }
  /* a click on a confidence chip: Red · Amber · Green, then round again */
  function cycleRag(t) {
    var next = t.rag === "r" ? "a" : t.rag === "a" ? "g" : "r";
    if (KOS.rag) KOS.rag.setManual(t.sid, t.ref, next);
    memo.key = "";
    return next;
  }
  function clearRag(t) { if (KOS.rag) KOS.rag.setManual(t.sid, t.ref, null); memo.key = ""; }

  /* ---------------- questions (46f) ----------------
     The scope's exam questions from each topic's own material (the study
     exam questions, through KOS.content.get), one row a question with its
     history; the engine that runs them is KOS.quiz.mountExam. */
  function commandOf(text) {
    var s = String(text || "").replace(/^[^A-Za-z]+/, "");
    for (var i = 0; i < COMMANDS.length; i++) if (new RegExp("^" + COMMANDS[i] + "\\b", "i").test(s)) return COMMANDS[i];
    var m = new RegExp("\\b(" + COMMANDS.join("|") + ")\\b", "i").exec(s);
    return m ? m[1].charAt(0).toUpperCase() + m[1].slice(1).toLowerCase() : null;
  }
  function questions(a, tops) {
    var out = [];
    var leaves = {};
    (tops || topics(a)).forEach(function (t) { t.leaves.forEach(function (k) { leaves[k] = t; }); });
    Object.keys(leaves).forEach(function (k) {
      var p = KOS.spec.parse(k);
      var c = p && KOS.content && KOS.content.get ? KOS.content.get(p.subject, p.ref) : null;
      var list = c && Array.isArray(c.exam) ? c.exam : [];
      list.forEach(function (it, i) {
        if (!it) return;
        var parts = it.parts && it.parts.length ? it.parts : [{ q: it.q, marks: it.marks }];
        var marks = parts.reduce(function (s, x) { return s + (Number(x.marks) || 0); }, 0);
        var qk = KOS.questions ? KOS.questions.keyOf("exam", p.subject, p.ref, it, i) : p.subject + ":" + p.ref + ":" + i;
        var tries = KOS.questions ? KOS.questions.tries(qk) : [];
        var lastT = tries[tries.length - 1] || null;
        out.push({ qk: qk, sid: p.subject, ref: p.ref, leaf: k, topic: leaves[k].key, item: it, i: i, marks: marks,
          command: commandOf(parts[0].q || it.q || it.ctx), tries: tries, last: lastT,
          dropped: !!(lastT && lastT.max && lastT.got < lastT.max), written: !it.src });
      });
    });
    return out;
  }
  function band(m) { return m <= 2 ? "1-2" : m <= 5 ? "3-5" : "6+"; }
  /* the three ready-made sets (46f) */
  function sets(a) {
    var qs = questions(a), tops = weakest(topics(a));
    var weak = null;
    for (var i = 0; i < tops.length && !weak; i++) {
      var mine = qs.filter(function (q) { return q.topic === tops[i].key; });
      if (mine.length) weak = { id: "weak", title: "5 from my weakest topic", sub: tops[i].title, items: mine.slice(0, 5), topic: tops[i].key };
    }
    var six = qs.filter(function (q) { return q.marks >= 6; });
    var wrong = qs.filter(function (q) { return q.dropped; });
    return [weak || { id: "weak", title: "5 from my weakest topic", sub: "No questions on a weak topic yet", items: [] },
      { id: "six", title: "5 six-markers", sub: six.length ? six.slice(0, 5).map(function (q) { return q.marks; }).filter(function (m, j, l) { return l.indexOf(m) === j; }).join(" and ") + " marks" : "None in scope yet", items: six.slice(0, 5) },
      { id: "wrong", title: "The ones I got wrong", sub: wrong.length ? wrong.length + " dropped marks last time" : "Nothing dropped yet", items: wrong.slice(0, 5) }];
  }

  /* ---------------- papers (47a) ---------------- */
  function papers(a) {
    var att = E().attemptsFor(a);
    var list = KOS.examPaper ? KOS.examPaper.authoredList(a) : [];
    function lastFor(n) {
      var hit = att.filter(function (e) { return e.source && e.source.kind === "predicted" && String(e.source.ref || "") === a.id + ":" + n; });
      return hit.length ? hit[hit.length - 1] : null;
    }
    var rows = list.map(function (p, i) {
      return { n: i + 1, kind: "board", title: p.title + (p.org ? " · " + p.org : ""), org: p.org, board: p.board, format: p.format,
        marks: p.marks, mins: p.mins, last: lastFor(i + 1), blurb: p.blurb || null };
    });
    var built = { n: list.length + 1, kind: "built", title: a.title + " · built from your scope", marks: a.marks || null, mins: a.durationMins || null, last: lastFor(list.length + 1) };
    return { board: rows, built: built, sat: rows.concat([built]).filter(function (r) { return r.last; }).length, of: rows.length || 1 };
  }

  /* ---------------- the strip (45c) ---------------- */
  function strip(a, now) {
    var X = E(), rd = X.readiness(a, now), tops = topics(a, now);
    var rated = tops.filter(function (t) { return t.rag; }).length;
    var sig = rd && rd.signals || {};
    var out = { coverage: { n: rated, of: tops.length } };
    var rc = sig.recall;
    out.recall = rc && !rc.thin ? { v: rc.value, target: rd.targetPct ? rd.targetPct / 100 : 0.9 }
      : { action: rc && rc.cards ? "Do " + Math.max(1, 20 - (rc.rated || 0)) + " cards to see this" : "Make cards to see this" };
    var att = X.attemptsFor(a).filter(function (e) { return e.timed && e.marks != null && e.max; });
    if (att.length) {
      var l = att[att.length - 1];
      out.practice = { got: l.marks, max: l.max, sub: (l.paper || "paper") + " · timed" };
    } else out.practice = { action: "Do a timed paper to see this" };
    var cal = X.attemptsFor(a).filter(function (e) { return e.predicted != null && e.marks != null; });
    if (cal.length) {
      var c = cal[cal.length - 1];
      out.calibration = { v: c.predicted - c.marks, sub: "predicted " + c.predicted + " · got " + c.marks };
    } else out.calibration = { action: "Predict before marking to see this" };
    return out;
  }

  /* ---------------- today's session (45c) ---------------- */
  function run() { return uiMap("examRun"); }
  function runOf(aid, now) { var r = run()[aid]; return r && r.date === (now || today()) ? r : null; }
  function skipped(aid, now) { return uiMap("examSkip")[aid] === (now || today()); }
  /* the exam's paper day: the weekday it is sat on, so practice keeps
     the exam's own rhythm (45f) */
  function paperDay(a) { return a.date ? dowOf(a.date) : 6; }
  function isPaperDay(a, d) { return a.date && dowOf(d) === paperDay(a) && d < a.date && between(d, a.date) >= 2; }
  function nextPaperDay(a, from) {
    for (var i = 0; i < 8; i++) { var d = addDays(from, i); if (isPaperDay(a, d)) return d; }
    return null;
  }
  function cardsToday(a, now) {
    var due = 0, done = 0, redo = 0, redoDone = 0;
    E().leaves(a, now).forEach(function (k) {
      var p = KOS.spec.parse(k);
      if (!p) return;
      KOS.srs.cardsFor(p.subject, p.ref).forEach(function (c) {
        var m = KOS.srs.peek(c.key);
        var isDue = m && m.due && m.due <= now && !m.leech, did = m && m.last === now;
        if (c.redo) { if (isDue || !m || !m.last) redo++; if (did) redoDone++; }
        else { if (isDue) due++; if (did) done++; }
      });
    });
    return { due: due, done: done, redo: redo, redoDone: redoDone };
  }
  function pct(v) { return Math.round(100 * v) + " %"; }
  function ago(d, now) {
    if (!d) return "never practised";
    var n = between(d, now);
    return n <= 0 ? "practised today" : n === 1 ? "last practised yesterday" : "last practised " + n + " days ago";
  }
  function today_(a, now) {
    now = now || today();
    if (!a || !a.scope) return { steps: [], done: 0, mins: 0 };
    var steps = [], st = strip(a, now), cd = cardsToday(a, now), r = runOf(a.id, now);
    var rec = st.recall.v != null ? "Recall " + pct(st.recall.v) + " · target " + pct(st.recall.target) : st.recall.action;
    if (cd.due || cd.done) {
      steps.push({ id: "cards", glyph: "↻", kind: "cards", title: cd.due ? cd.due + (cd.due === 1 ? " card" : " cards") + " due in scope" : cd.done + " cards done in scope",
        reason: rec, mins: Math.max(5, Math.round((cd.due || cd.done) * 0.5)), done: !cd.due && cd.done > 0,
        progress: cd.done && cd.due ? { n: cd.done, of: cd.done + cd.due } : null, go: { review: "scope:" + a.id } });
    }
    if (cd.redo || cd.redoDone) {
      var rc = KOS.tracker && KOS.tracker.redoCards ? KOS.tracker.redoCards().filter(function (c) { return E().contains(a, c.sid, c.ref, now); }) : [];
      steps.push({ id: "redo", glyph: "↺", kind: "redo", title: (cd.redo || cd.redoDone) + ((cd.redo || cd.redoDone) === 1 ? " redo item" : " redo items"),
        reason: rc.length ? rc.slice(0, 3).map(function (c) { return c.front || c.q || ""; }).filter(Boolean).join(" · ").slice(0, 80) || "From your marked papers" : "From your marked papers",
        mins: Math.max(5, 5 * (cd.redo || 1)), done: !cd.redo && cd.redoDone > 0,
        progress: cd.redoDone && cd.redo ? { n: cd.redoDone, of: cd.redoDone + cd.redo } : null, go: { review: "scope:" + a.id } });
    }
    var tops = weakest(topics(a, now));
    var pinned = r && r.step === "topic" && r.topic ? tops.filter(function (t) { return t.key === r.topic; })[0] : null;
    var weak = pinned || tops.filter(function (t) { return t.today === 0; })[0] || null;
    if (weak) {
      var read = isRead(a.id, "t:" + weak.key, now);
      var tdone = read && weak.today > 0;
      steps.push({ id: "topic", glyph: "✎", kind: "topic", topic: weak.key,
        title: "Weakest topic: " + weak.title + " · " + (weak.qn ? "read the chapter, then 5 questions" : "read the chapter"),
        reason: [weak.short || weak.ref, weak.rag === "r" ? "Red" : weak.rag === "a" ? "Amber" : null, weak.best ? "Best " + weak.best.got + "/" + weak.best.max : null,
          weak.recall != null ? "Recall " + pct(weak.recall) : null, ago(weak.last, now)].filter(Boolean).join(" · "),
        mins: weak.qn ? 35 : 20, done: tdone, progress: !tdone && (read || weak.today) ? { n: (read ? 1 : 0) + (weak.today ? 1 : 0), of: 2, text: read ? "chapter read" : weak.today + " tried" } : null,
        go: { section: "revise", sub: "t:" + weak.key } });
    }
    var pp = papers(a), att = E().attemptsFor(a);
    if (isPaperDay(a, now)) {
      var next = pp.board.filter(function (p) { return !p.last; })[0] || pp.built;
      var sat = att.filter(function (e) { return e.date === now && e.timed; }).length > 0;
      var timed = att.filter(function (e) { return e.timed && e.marks != null; });
      steps.push({ id: "paper", glyph: "▤", kind: "paper", title: "Paper day: " + next.title + (next.mins ? " · " + KOS.examUI.mins(next.mins) : ""),
        reason: timed.length ? "Practice " + timed[timed.length - 1].marks + "/" + timed[timed.length - 1].max + " · " + timed.length + (timed.length === 1 ? " timed paper" : " timed papers") + " so far" : "No timed paper yet: this one sets the baseline",
        mins: next.mins || 60, done: sat, go: { section: "paper", sub: String(next.n) } });
    }
    targets(a.id).filter(function (t) { return t.state === "open"; }).slice(0, 2).forEach(function (t) {
      var ev = evidence(t);
      steps.push({ id: "target:" + t.id, glyph: "◎", kind: "target", title: "Target: " + t.text,
        reason: (t.from && t.from.model ? "From " + t.from.model + "'s feedback" : "Your target") + " · " + ev.met + " of 2 met",
        mins: null, inPaper: isPaperDay(a, now), done: false, go: t.go || { section: "review", sub: "targets" } });
    });
    steps = steps.slice(0, 5);
    steps.forEach(function (s) { s.running = !!(r && r.step === s.id && !s.done); });
    var done = steps.filter(function (s) { return s.done; }).length;
    return { steps: steps, done: done, mins: steps.reduce(function (m, s) { return m + (s.done ? 0 : s.mins || 0); }, 0),
      paperDay: isPaperDay(a, now), nextPaperDay: nextPaperDay(a, addDays(now, 1)), skipped: skipped(a.id, now), strip: st };
  }
  /* a step's Start (a click): the running mark, per device */
  function start(a, step, now) {
    setUi("examRun", function (m) { m[a.id] = { date: now || today(), step: step.id, topic: step.topic || null, at: Date.now() }; });
  }
  function pause(a) { setUi("examRun", function (m) { delete m[a.id]; }); }
  function skip(a, on) { setUi("examSkip", function (m) { if (on) m[a.id] = today(); else delete m[a.id]; }); }

  /* ---------------- Revise's chapters (46a) ---------------- */
  function readMap() { return uiMap("examRead"); }
  function isRead(aid, ch, onDay) { var d = readMap()[aid + "|" + ch]; return onDay ? d === onDay : !!d; }
  function markRead(aid, ch, on) { setUi("examRead", function (m) { var k = aid + "|" + ch; if (on) m[k] = today(); else delete m[k]; }); }
  function hasEssentials(a) {
    var X = window.KOS_EXAMS;
    var pr = a.preset ? E().preset(a.preset) : null;
    return !!(X && X.essentialsFor && X.essentialsFor(a.preset, pr ? pr.board : a.board));
  }
  function chapters(a, order) {
    var tops = order === "spec" ? topics(a) : weakest(topics(a));
    var out = [];
    if (hasEssentials(a)) out.push({ id: "essentials", kind: "essentials", title: "Exam essentials", group: "essentials" });
    tops.forEach(function (t) { out.push({ id: "t:" + t.key, kind: "topic", title: t.title, ref: t.ref, topic: t, group: "topics" }); });
    out.push({ id: "lose", kind: "lose", title: "Where you lose marks", group: "yours", noRead: true });
    out.push({ id: "cheat", kind: "cheat", title: "Cheat sheet", group: "yours" });
    out.push({ id: "night", kind: "night", title: "The night before", group: "yours" });
    out.forEach(function (c, i) { c.n = i + 1; c.read = !c.noRead && isRead(a.id, c.id); });
    return out;
  }

  /* ---------------- section marks (45b) ---------------- */
  function marks(a, now) {
    now = now || today();
    var td = today_(a, now), tops = topics(a, now), ch = chapters(a);
    var qs = questions(a, tops), pp = papers(a);
    var night = E().checklist(a).filter(function (c) { return c.group === "day" || c.group === "night"; });
    var sch = schedule(a, { now: now });
    var att = E().attemptsFor(a);
    return {
      today: td.steps.length ? { n: td.done, of: td.steps.length } : null,
      plan: sch.sessions ? { n: sch.sessions, fig: String(sch.sessions) } : null,
      topics: tops.length ? { n: tops.filter(function (t) { return t.rag; }).length, of: tops.length } : null,
      revise: { n: ch.filter(function (c) { return c.read; }).length, of: ch.filter(function (c) { return !c.noRead; }).length },
      questions: qs.length ? { n: qs.filter(function (q) { return q.tries.length; }).length, of: qs.length, fig: String(qs.length) } : null,
      papers: { n: pp.sat, of: pp.of },
      review: att.length ? { n: att.length, fig: String(att.length) } : null,
      day: night.length ? { n: night.filter(function (c) { return c.done; }).length, of: night.length } : null
    };
  }

  /* ---------------- the plan (45f) ----------------
     The days from today to the exam, each with what is placed on it:
     one paper a week on the exam's weekday, the weakest topics in turn on
     the other days, cards on Sundays, and the last week's redo items,
     cheat sheet and the night before. Hours a week bound it. Nothing is
     written until Send. */
  function hoursOf(a) { return a.planHours || Math.max(1, Math.round((E().weeklyHours().hours || 6) / Math.max(1, E().upcoming().filter(function (x) { return x.tier === "real_exam" || x.tier === "mock"; }).length) * 2) / 2); }
  function schedule(a, o) {
    o = o || {};
    var now = o.now || today();
    if (!a || !a.date || a.date <= now || !a.scope) return { days: [], weeks: [], sessions: 0, mins: 0, hours: a ? hoursOf(a) : 0 };
    var hours = o.hours || hoursOf(a), perWeek = Math.round(hours * 60);
    var tops = weakest(topics(a, now)), pp = papers(a);
    var boardLeft = pp.board.filter(function (p) { return !p.last; });
    var days = [], ti = 0, pi = 0;
    var n = between(now, a.date);
    for (var i = 0; i < n; i++) days.push({ date: addDays(now, i), items: [] });
    days.push({ date: a.date, exam: true, items: [] });
    var used = {};
    function wk(d) { return KOS.examPlan ? KOS.examPlan.mondayOf(d) : d; }
    function fits(d, m) { var w = wk(d.date); return (used[w] || 0) + m <= perWeek; }
    function place(d, it) { d.items.push(it); var w = wk(d.date); used[w] = (used[w] || 0) + (it.mins || 0); }
    var last = days.length - 1;
    days.forEach(function (d, i) {
      if (d.exam) return;
      var toGo = last - i;
      if (toGo === 1) { place(d, { kind: "night", glyph: "□", title: "The night before", mins: 20, go: { section: "revise", sub: "night" } }); return; }
      if (toGo === 2) { place(d, { kind: "cheat", glyph: "✎", title: "Cheat sheet", mins: 30, go: { section: "revise", sub: "cheat" } }); return; }
      if (toGo === 4) { place(d, { kind: "redo", glyph: "↺", title: "Redo items", mins: 30, go: { section: "today" } }); return; }
      if (isPaperDay(a, d.date)) {
        var p = boardLeft[pi] || pp.built;
        if (boardLeft[pi]) pi++;
        var pm = p.mins || 60;
        if (fits(d, pm) || !d.items.length) { place(d, { kind: "paper", glyph: "▤", title: p.title, mins: pm, go: { section: "paper", sub: String(p.n) } }); return; }
      }
      if (dowOf(d.date) === 0) { if (fits(d, 15)) place(d, { kind: "cards", glyph: "↻", title: "Cards in scope", mins: 15, go: { review: "scope:" + a.id } }); return; }
      if (!tops.length) return;
      var t = tops[ti % tops.length];
      if (fits(d, 30)) { place(d, { kind: "topic", glyph: "✎", title: (t.short || t.ref) + " " + t.title, mins: 30, topic: t.key, refs: t.leaves, go: { section: "revise", sub: "t:" + t.key } }); ti++; }
    });
    var weeks = [], byW = {};
    days.forEach(function (d) {
      var w = wk(d.date);
      if (!byW[w]) { byW[w] = { wb: w, days: [], mins: 0 }; weeks.push(byW[w]); }
      byW[w].days.push(d);
      d.items.forEach(function (it) { byW[w].mins += it.mins || 0; });
    });
    var sessions = 0, mins = 0, paperDays = 0;
    days.forEach(function (d) { d.items.forEach(function (it) { sessions++; mins += it.mins || 0; if (it.kind === "paper") paperDays++; }); });
    return { days: days, weeks: weeks, sessions: sessions, mins: mins, hours: hours, paperDays: paperDays, sent: sentState(a) };
  }
  function sentRows(a) {
    return KOS.pacing ? KOS.pacing.entries().filter(function (e) { return e.source === "personal" && e.tag === "exam:" + a.id; }) : [];
  }
  function sentState(a) {
    var s = (KOS.store.state.exams.planSent || {})[a.id];
    var rows = sentRows(a);
    return s || rows.length ? { at: s ? s.at : null, n: rows.length, done: rows.filter(function (e) { return e.done; }).length } : null;
  }
  /* THE ONE WRITE of the plan (invariant 126): this exam's sessions as
     personal Pacing rows, a row a session in the week it falls in, tagged
     exam:<id>, replacing this exam's own unticked rows; never the Calendar */
  function sendSchedule(a, sch) {
    if (!KOS.pacing) return { added: 0, skipped: 0 };
    var added = 0, skippedN = 0;
    sentRows(a).forEach(function (e) { if (!e.done && e.wb >= KOS.examPlan.mondayOf(today())) KOS.pacing.removeEntry(e.id); });
    sch.weeks.forEach(function (w) {
      w.days.forEach(function (d) {
        d.items.forEach(function (it) {
          if (!KOS.pacing.weekAt(w.wb)) { skippedN++; return; }
          var refs = (it.refs || []).map(function (k) { var p = KOS.spec.parse(k); return p && p.subject === a.subject ? p.ref : null; }).filter(Boolean);
          var e = KOS.pacing.addEntry({ source: "personal", wb: w.wb, subject: a.subject, kind: "Exam", title: it.title,
            detail: KOS.examUI.pretty(d.date, { dow: true }) + " · " + it.mins + " min · " + a.title, refs: refs, tag: "exam:" + a.id });
          if (e) added++;
        });
      });
    });
    var x = KOS.store.state.exams;
    x.planSent = x.planSent && typeof x.planSent === "object" ? x.planSent : {};
    x.planSent[a.id] = { at: Date.now(), n: added };
    KOS.store.save();
    return { added: added, skipped: skippedN };
  }

  /* ---------------- targets (47h, plan §8.5) ----------------
     state.exams.targets, keyed by a random id, synced: {id, aid, text,
     kind, from {attempt, model, date}, rule {type, band, max}, met
     [attempt uids], state open|met|closed, closedBy, at}. A target
     closes itself when two attempts meet its rule; by hand otherwise. */
  function T() { var x = KOS.store.state.exams; if (!x.targets || typeof x.targets !== "object") x.targets = {}; return x.targets; }
  function targets(aid) {
    var x = KOS.store.state.exams, m = x && x.targets && typeof x.targets === "object" ? x.targets : {};
    return Object.keys(m).map(function (k) { return m[k]; }).filter(function (t) { return t && (!aid || t.aid === aid); })
      .sort(function (p, q) { return (p.state === "open" ? 0 : 1) - (q.state === "open" ? 0 : 1) || (p.at || 0) - (q.at || 0); });
  }
  var RULE_RE = /(?:≤|<=|at most)\s*([\d.]+)\s*min(?:utes)?\s*(?:a|per)\s*mark(?:\s*on\s*(\d)[–-]?(\d)?-?mark)?/i;
  function ruleOf(text, kind) {
    var m = RULE_RE.exec(text || "");
    if (m) return { type: "mpm", max: parseFloat(m[1]), lo: m[2] ? +m[2] : null, hi: m[3] ? +m[3] : m[2] ? +m[2] : null };
    if (kind === "topic" || kind === "knowledge") return { type: "topic" };
    return { type: "manual" };
  }
  function addTarget(aid, o) {
    var id = rid();
    var t = { id: id, aid: aid, text: String(o.text || "").slice(0, 160), kind: o.kind || "technique",
      from: o.from ? { attempt: o.from.attempt || null, model: o.from.model || null, date: o.from.date || today() } : null,
      rule: ruleOf(o.text, o.kind), refs: (o.refs || []).slice(0, 6), parts: (o.parts || []).slice(0, 12), met: [], state: "open", at: Date.now(), updatedAt: Date.now() };
    T()[id] = t;
    KOS.store.save();
    return t;
  }
  function closeTarget(id, by) {
    var t = T()[id];
    if (!t) return null;
    t.state = by === "evidence" ? "met" : "closed"; t.closedBy = by || "hand"; t.closedAt = today(); t.updatedAt = Date.now();
    KOS.store.save();
    return t;
  }
  function reopenTarget(id) { var t = T()[id]; if (!t) return; t.state = "open"; delete t.closedBy; delete t.closedAt; t.updatedAt = Date.now(); KOS.store.save(); }
  function removeTarget(id) { delete T()[id]; KOS.store.save(); }
  /* does one recorded attempt (its figures) meet a target's rule? */
  function meets(t, fig) {
    if (!t || !t.rule || !fig) return null;
    if (t.rule.type === "mpm") {
      var parts = (fig.parts || []).filter(function (p) { return p.marks && (!t.rule.lo || p.marks >= t.rule.lo) && (!t.rule.hi || p.marks <= t.rule.hi) && p.timeMs; });
      if (!parts.length) return null;
      var ms = parts.reduce(function (s, p) { return s + p.timeMs; }, 0), mk = parts.reduce(function (s, p) { return s + p.marks; }, 0);
      var v = ms / 60000 / mk;
      return { ok: v <= t.rule.max, value: Math.round(v * 10) / 10 };
    }
    return null;
  }
  /* a click after an attempt's figures are read: record the attempts that
     meet it, and close it on the second */
  function noteEvidence(t, uid, fig) {
    var r = meets(t, fig);
    if (!r || !r.ok || t.state !== "open" || (t.met || []).indexOf(uid) !== -1) return r;
    var x = T()[t.id];
    x.met = (x.met || []).concat([uid]);
    x.last = r.value;
    x.updatedAt = Date.now();
    if (x.met.length >= 2) { x.state = "met"; x.closedBy = "evidence"; x.closedAt = today(); }
    KOS.store.save();
    return r;
  }
  function evidence(t) { return { met: (t.met || []).length, of: 2, last: t.last != null ? t.last : null }; }

  KOS.examSession = {
    SECTIONS: SECTIONS,
    COMMANDS: COMMANDS,
    topics: topics,
    papersOf: papersOf,
    paperShort: paperShort,
    paperOfLeaf: paperOfLeaf,
    weakest: weakest,
    cycleRag: cycleRag,
    clearRag: clearRag,
    questions: function (a) { return questions(a); },
    commandOf: commandOf,
    band: band,
    sets: sets,
    papers: papers,
    strip: strip,
    today: today_,
    start: start,
    pause: pause,
    skip: skip,
    runOf: runOf,
    isPaperDay: isPaperDay,
    nextPaperDay: nextPaperDay,
    chapters: chapters,
    isRead: isRead,
    markRead: markRead,
    marks: marks,
    hoursOf: hoursOf,
    schedule: schedule,
    sendSchedule: sendSchedule,
    sentState: sentState,
    targets: targets,
    addTarget: addTarget,
    closeTarget: closeTarget,
    reopenTarget: reopenTarget,
    removeTarget: removeTarget,
    ruleOf: ruleOf,
    meets: meets,
    noteEvidence: noteEvidence,
    evidence: evidence,
    invalidate: function () { memo.key = ""; }
  };
})();
