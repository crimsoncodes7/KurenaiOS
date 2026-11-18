/* Kurenai OS — modules/examquestions.js · KOS.examQuestions
   Questions (docs/exams-rework-plan.md §6, design 46f): the scope's exam
   questions, ONE at a time, each run by the study engine
   (KOS.quiz.mountExam: the context, Type · Write · On paper, the pad, the
   scheme as mark points and the tally, the history). Never all at once.

     #/exams/<id>/questions[/<set>]
       weak · six · wrong     the three ready-made sets
       topic:<key>            one topic's questions (from Topics or Revise)
       (none)                 the filtered list: topic, marks 1–2 · 3–5 ·
                              6+, command word, not tried, dropped marks

   Where you are in a set and the filters are per device (state.ui), so a
   redraw or a reload keeps the place; the engine keeps typed answers
   under its own run key. Logging a question is the engine's own write
   (KOS.questions, invariant 111c); this page writes nothing else.       */
(function () {
  "use strict";
  var el = KOS.ui.el;
  function S() { return KOS.examSession; }
  function U() { return KOS.examUI; }
  function SH() { return KOS.examShell; }
  function btn(t, k, f, x) { return U().btn(t, k, f, x); }
  var BANDS = [["any", "Any"], ["1-2", "1–2"], ["3-5", "3–5"], ["6+", "6+"]];

  function st(a) { var m = KOS.store.state.ui.examQ; return m && m[a.id] ? m[a.id] : {}; }
  function setSt(a, patch, redraw) {
    var u = KOS.store.state.ui;
    u.examQ = u.examQ && typeof u.examQ === "object" ? u.examQ : {};
    u.examQ[a.id] = Object.assign({}, u.examQ[a.id] || {}, patch);
    KOS.store.save();
    if (redraw !== false) KOS.rerender();
  }
  function listFor(a, sub, qs, f) {
    var sets = S().sets(a);
    var set = sets.filter(function (x) { return x.id === sub; })[0];
    if (set) return { id: set.id, title: set.title, items: set.items };
    if (sub && sub.indexOf("topic:") === 0) {
      var key = sub.slice(6), t = S().topics(a).filter(function (x) { return x.key === key; })[0];
      return { id: sub, title: t ? t.title : "One topic", items: qs.filter(function (q) { return q.topic === key; }) };
    }
    var items = qs.filter(function (q) {
      return (!f.topic || q.topic === f.topic) && (!f.band || f.band === "any" || S().band(q.marks) === f.band) &&
        (!f.cmd || q.command === f.cmd) && (!f.notTried || !q.tries.length) && (!f.dropped || q.dropped);
    });
    return { id: null, title: "Filtered", items: items };
  }
  function scoreOf(q) { var l = q.tries[q.tries.length - 1]; return l && l.max ? l.got + "/" + l.max : null; }

  function page(content, a, sub) {
    var qs = S().questions(a), f = st(a), tops = S().topics(a);
    var tried = qs.filter(function (q) { return q.tries.length; }).length;
    var redo = KOS.tracker && KOS.tracker.redoCards ? KOS.tracker.redoCards().filter(function (c) { return KOS.exams.contains(a, c.sid, c.ref); }).length : 0;
    SH().sectionHead(content, "Questions", qs.length + " in scope · " + tried + " tried",
      [redo ? U().linkBtn("Redo items · " + redo, function () { KOS.show("review", { tab: "due", run: "scope:" + a.id }); }, "exams.q-redo") : null]);
    if (!qs.length) {
      content.appendChild(el("div", { class: "k-card k-xs-quietcard" }, [el("span", { text: KOS.exams.leaves(a).length ? "No exam questions on these topics yet." : "Set the scope first." }),
        btn("Papers", "sm", function () { KOS.show("exams", { id: a.id, tab: "papers" }); })]));
      return;
    }
    /* the filters */
    var topicSel = el("select", { class: "k-input k-xq-sel", "data-ui": "exams.q-topic", "aria-label": "Topic",
      onchange: function () { setSt(a, { topic: topicSel.value || null, at: 0 }, false); KOS.show("exams", { id: a.id, tab: "questions" }); } },
      [el("option", { value: "", text: "All " + tops.length + " topics" })].concat(tops.map(function (t) {
        return el("option", { value: t.key, selected: f.topic === t.key ? "" : null, text: (t.short || t.ref) + " " + t.title });
      })));
    var cmds = {};
    qs.forEach(function (q) { if (q.command) cmds[q.command] = (cmds[q.command] || 0) + 1; });
    var cmdSel = el("select", { class: "k-input k-xq-sel", "data-ui": "exams.q-cmd", "aria-label": "Command word",
      onchange: function () { setSt(a, { cmd: cmdSel.value || null, at: 0 }, false); KOS.show("exams", { id: a.id, tab: "questions" }); } },
      [el("option", { value: "", text: "Any command" })].concat(Object.keys(cmds).sort().map(function (c) {
        return el("option", { value: c, selected: f.cmd === c ? "" : null, text: c + " · " + cmds[c] });
      })));
    function toggle(label, k) {
      return el("button", { type: "button", class: "k-btn k-btn--sm k-xq-tog", "aria-pressed": String(!!f[k]), "data-ui": "exams.q-" + k,
        onclick: function () { var p = {}; p[k] = !f[k]; p.at = 0; setSt(a, p, false); KOS.show("exams", { id: a.id, tab: "questions" }); } }, [label]);
    }
    content.appendChild(el("div", { class: "k-xs-filters", "data-ui": "exams.q-filters" }, [topicSel,
      KOS.ui.tabs(BANDS.map(function (b) {
        return { label: b[1], active: (f.band || "any") === b[0], onSelect: function () { setSt(a, { band: b[0], at: 0 }, false); KOS.show("exams", { id: a.id, tab: "questions" }); } };
      }), { variant: "card", label: "Marks" }),
      cmdSel, toggle("Not tried", "notTried"), toggle("Dropped marks", "dropped")]));
    /* the three sets */
    var sets = S().sets(a);
    content.appendChild(el("div", { class: "k-xq-sets", "data-ui": "exams.q-sets" }, sets.map(function (x) {
      return el("button", { type: "button", class: "k-xq-set", "data-ui": "exams.q-set", "data-set": x.id, "aria-pressed": String(sub === x.id), disabled: x.items.length ? null : "",
        onclick: function () { setSt(a, { at: 0 }, false); KOS.show("exams", { id: a.id, tab: "questions", sub: x.id }); } }, [el("b", { text: x.title }), U().muted(x.sub)]);
    })));
    var list = listFor(a, sub, qs, f);
    if (!list.items.length) {
      content.appendChild(el("div", { class: "k-card k-xs-quietcard", "data-ui": "exams.q-none" }, [el("span", { text: "No question matches these filters." }),
        btn("Clear the filters", "sm", function () { setSt(a, { topic: null, band: "any", cmd: null, notTried: false, dropped: false, at: 0 }); })]));
      return;
    }
    var key = (sub || "list") + "|" + list.items.length;
    var at = f.key === key ? Math.min(f.at || 0, list.items.length - 1) : 0;
    function goTo(n) { setSt(a, { at: Math.max(0, Math.min(list.items.length - 1, n)), key: key }); }
    /* the set's navigator: ‹ 1–n ›, each with its last score */
    var many = list.items.length > 12;
    var nav = el("div", { class: "k-xq-nav", "data-ui": "exams.q-nav", role: "group", "aria-label": "Questions in this set" }, [
      el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "aria-label": "Previous question", disabled: at ? null : "", text: "‹", onclick: function () { goTo(at - 1); } })]
      .concat(many ? [el("span", { class: "k-mono k-ex-muted", text: (at + 1) + " of " + list.items.length })] : list.items.map(function (q, i) {
        var sc = scoreOf(q);
        return el("button", { type: "button", class: "k-xq-pip", "aria-current": i === at ? "true" : null, "aria-label": "Question " + (i + 1) + (sc ? ", last " + sc : ""),
          onclick: function () { goTo(i); } }, [el("b", { class: "k-mono", text: String(i + 1) }), sc ? el("span", { class: "k-mono", text: sc }) : null].filter(Boolean));
      }))
      .concat([el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "aria-label": "Next question", disabled: at < list.items.length - 1 ? null : "", text: "›", onclick: function () { goTo(at + 1); } })]));
    content.appendChild(el("div", { class: "k-xq-navrow" }, [el("span", { class: "k-ex-muted" }, ["Set · ", el("b", { text: list.id ? list.title : "Filtered · " + list.items.length })]), el("span", { class: "k-ex-grow" }), nav]));
    var q = list.items[at];
    var t = S().topics(a).filter(function (x) { return x.key === q.topic; })[0];
    var label = el("div", { class: "k-xq-qhead" }, [el("b", { class: "k-mono", text: "Q" + (at + 1) }),
      U().muted([q.marks + (q.marks === 1 ? " mark" : " marks"), q.command, t ? (t.short || t.ref) : null].filter(Boolean).join(" · ")),
      el("span", { class: "k-ex-grow" }),
      U().muted(q.written ? "✎ Written by KurenaiOS, not a board paper" : "Modelled on " + q.item.src),
      U().linkBtn("Topic ›", function () { KOS.show("ref", { subject: q.sid, ref: q.ref, tab: "exam" }); })]);
    var holder = el("div", { class: "k-topic-engine k-xq-engine", "data-ui": "exams.q-engine" });
    content.appendChild(el("section", { class: "k-card k-xq-card", "data-ui": "exams.q-card", "data-q": q.qk }, [label, holder,
      q.last ? U().muted("Last time " + q.last.got + "/" + q.last.max + (q.last.d ? " · " + U().pretty(q.last.d, { dow: false }) : "")) : null].filter(Boolean)));
    var item = Object.assign({}, q.item, { qk: q.qk.split(":").pop() });
    KOS.quiz.mountExam(holder, q.sid, q.ref, [item], { runKey: "xq:" + a.id + ":" + q.qk, onLog: function (r) {
      U().announce("Logged " + r.got + " of " + r.max + "." + (at < list.items.length - 1 ? " Question " + (at + 2) + " next." : " That's the set."));
      setTimeout(function () { KOS.rerender(); }, 0);
    } });
  }

  KOS.examQuestions = { page: page };
})();
