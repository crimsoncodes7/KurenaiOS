/* Kurenai OS — modules/examscope.js · KOS.examScopeSheet
   Edit scope (design 45e; plan §4.4): paste a topic list, as the school's
   slide gives it, and confirm what the app read. Each line becomes a row:
   the line, its match (ref, name, paper) and Change. A line with two
   candidates is amber with both as chips; a line with none is amber with
   Keep as a note or Remove. NOTHING IS DROPPED SILENTLY: Confirm counts
   what will be saved and says what happens to the amber rows. The spans
   line names every board paper the scope touches (a two-paper scope keeps
   both papers' material, §9.2).

   "Pick from the spec" is the Scope Builder (the assessment's scope
   page). The only write is Confirm: the scope, through KOS.exams.update
   (its normaliser), and kept lines appended to the notes.             */
(function () {
  "use strict";
  var el = KOS.ui.el;
  function E() { return KOS.exams; }
  function S() { return KOS.examSession; }
  function U() { return KOS.examUI; }
  function btn(t, k, f, x) { return U().btn(t, k, f, x); }

  function sheet(a, o) {
    o = o || {};
    var pr = a.preset ? E().preset(a.preset) : null;
    var sid = a.subject || (pr && pr.subject) || "compsci";
    var root = sid === "it" ? (a.links && a.links.itUnit) || (pr && pr.itUnit) || null : null;
    var rows = [], skipped = [], notes = {}, removed = {}, chosen = {};
    var ta = el("textarea", { class: "k-input k-xc-paste", rows: "16", "aria-label": "Your topic list, one a line", placeholder: "One topic a line", "data-ui": "exams.scope-paste-box" });
    /* the current scope as lines, so editing starts from what is there */
    ta.value = S().topics(a).map(function (t) { return t.title; }).join("\n");
    var list = el("div", { class: "k-xc-rows", "data-ui": "exams.scope-rows", "aria-live": "off" });
    var foot = el("div", { class: "k-xc-foot", "data-ui": "exams.scope-foot" });
    var spans = el("div", { class: "k-ex-inline k-xc-spans" });
    var okB = btn("Confirm", "primary", function () { confirm(); }, { "data-ui": "exams.scope-confirm" });
    function keysOf(r, i) {
      if (removed[i] || notes[i]) return [];
      if (r.state === "ambiguous") return chosen[i] ? [chosen[i]] : [];
      return (chosen[i] ? [chosen[i]] : r.matches.map(function (m) { return m.key; }));
    }
    function all() {
      var ks = [];
      rows.forEach(function (r, i) { keysOf(r, i).forEach(function (k) { if (ks.indexOf(k) === -1) ks.push(k); }); });
      return ks;
    }
    function read() {
      var res = S().matchList(ta.value, sid, root);
      rows = res.rows; skipped = res.skipped; notes = {}; removed = {}; chosen = {};
      draw();
      var m = rows.filter(function (r) { return r.state === "matched"; }).length, amb = rows.filter(function (r) { return r.state === "ambiguous"; }).length, none = rows.filter(function (r) { return r.state === "none"; }).length;
      U().announce(rows.length + " lines read. " + m + " matched" + (amb ? ", " + amb + " " + (amb === 1 ? "needs" : "need") + " a choice" : "") + (none ? ", " + none + " " + (none === 1 ? "has" : "have") + " no match" : "") + ".");
    }
    function chip(m, on, onclick) {
      return el("button", { type: "button", class: "k-xc-cand", "aria-pressed": on ? "true" : "false", onclick: onclick }, [el("span", { class: "k-mono k-ex-muted", text: m.ref }), el("span", { text: " " + m.title })]);
    }
    function draw() {
      list.textContent = "";
      var matched = rows.filter(function (r, i) { return keysOf(r, i).length; }).length;
      list.appendChild(el("div", { class: "k-xc-head" }, [U().muted("Matched · " + matched + " of " + rows.length)]));
      rows.forEach(function (r, i) {
        var amber = (r.state !== "matched" && !chosen[i] && !notes[i] && !removed[i]);
        var right;
        if (removed[i]) right = el("span", { class: "k-ex-inline" }, [U().muted("Removed"), U().linkBtn("Undo", function () { delete removed[i]; draw(); })]);
        else if (notes[i]) right = el("span", { class: "k-ex-inline" }, [U().muted("Kept as a note"), U().linkBtn("Undo", function () { delete notes[i]; draw(); })]);
        else if (r.state === "ambiguous" && !chosen[i]) right = el("div", { class: "k-xc-cands" }, [el("span", { class: "k-xc-warn" }, [el("span", { "aria-hidden": "true", text: "! " }), "Two possible topics"])]
          .concat(r.cands.map(function (m) { return chip(m, false, function () { chosen[i] = m.key; draw(); }); })));
        else if (r.state === "none" && !chosen[i]) right = el("span", { class: "k-ex-inline" }, [el("span", { class: "k-xc-warn" }, [el("span", { "aria-hidden": "true", text: "! " }), "No topic matches"]),
          U().linkBtn("Keep as a note", function () { notes[i] = true; draw(); }), U().linkBtn("Remove", function () { removed[i] = true; draw(); })]);
        else {
          var ms = chosen[i] ? [r.cands.concat(r.matches).filter(function (m) { return m.key === chosen[i]; })[0] || { key: chosen[i], ref: KOS.spec.parse(chosen[i]).ref, title: (KOS.exams.nodeOf(chosen[i]) || {}).title || "", paper: "" }] : r.matches;
          right = el("span", { class: "k-xc-match" }, [el("span", { "aria-hidden": "true", class: "k-ex-muted", text: "→ " })].concat(ms.map(function (m, j) {
            return el("span", { class: "k-xc-m" }, [j ? el("span", { class: "k-ex-muted", text: " · " }) : null, el("span", { class: "k-mono k-ex-muted", text: m.ref + " " }), el("b", { class: "k-ex-ell", text: m.title }),
              m.paper ? el("span", { class: "k-chip k-xc-paper", text: m.paper }) : null].filter(Boolean));
          })));
        }
        var row = el("div", { class: "k-xc-row", "data-ui": "exams.scope-row", "data-state": amber ? "amber" : null }, [
          el("span", { class: "k-xc-line", text: r.line }), right,
          removed[i] || notes[i] ? el("span") : U().linkBtn("Change", function () { change(i, row); }, "exams.scope-change")]);
        list.appendChild(row);
      });
      if (skipped.length) list.appendChild(U().muted("Skipped as headings: " + skipped.join(", ")));
      /* the spans line and the foot */
      var ks = all(), leaves = E().leaves({ scope: { include: ks, exclude: [] } });
      var byP = {};
      leaves.forEach(function (k) { var p = S().paperOfLeaf(k); if (p) byP[p] = (byP[p] || 0) + 1; });
      spans.textContent = "";
      spans.appendChild(U().muted("Spans"));
      Object.keys(byP).sort().forEach(function (p) { spans.appendChild(el("span", { class: "k-chip", "data-tone": "teal", text: [pr ? pr.board + " " + pr.qual : a.board || null, p].filter(Boolean).join(" · ") })); });
      var toChoose = rows.filter(function (r, i) { return r.state === "ambiguous" && !chosen[i] && !notes[i] && !removed[i]; }).length;
      var noMatch = rows.filter(function (r, i) { return r.state === "none" && !chosen[i] && !notes[i] && !removed[i]; }).length;
      var kept = Object.keys(notes).length;
      foot.textContent = "";
      foot.appendChild(el("b", { class: "k-mono", text: leaves.length + (leaves.length === 1 ? " leaf" : " leaves") }));
      foot.appendChild(U().muted(Object.keys(byP).sort().map(function (p) { return byP[p] + " in " + p; }).join(" · ")));
      foot.appendChild(el("span", { class: "k-ex-grow" }));
      if (toChoose || noMatch || kept) foot.appendChild(el("span", { class: "k-xc-warn", text: "! " + [toChoose ? toChoose + " to choose (left out)" : null, noMatch ? noMatch + " with no match (kept as a note)" : null, kept ? kept + " kept as a note" : null].filter(Boolean).join(" · ") }));
      okB.textContent = "Confirm " + ks.length + (ks.length === 1 ? " topic" : " topics");
      okB.disabled = !ks.length;
    }
    function change(i, row) {
      if (typeof KOS.topicPicker !== "function") return;
      var host = el("div", { class: "k-xc-picker" });
      row.after(host);
      var tp = KOS.topicPicker({ label: "Topic for “" + rows[i].line + "”", multi: false, subject: sid, value: keysOf(rows[i], i).slice(0, 1),
        levels: ["unit", "parent", "leaf"], onChange: function (refs) { if (refs && refs[0]) { chosen[i] = refs[0]; delete notes[i]; delete removed[i]; draw(); } } });
      host.appendChild(tp.el);
      if (tp.open) tp.open();
    }
    function confirm() {
      var ks = all();
      if (!ks.length) return;
      var keep = rows.filter(function (r, i) { return notes[i] || (r.state === "none" && !chosen[i] && !removed[i]); }).map(function (r) { return r.line; });
      var patch = { scope: { include: ks, exclude: [] } };
      if (keep.length) patch.notes = ((a.notes || "").trim() + (a.notes ? "\n" : "") + "From the topic list: " + keep.join("; ")).trim();
      E().update(a.id, patch);
      if (S().invalidate) S().invalidate();
      ov.close();
      U().announce("Scope saved: " + ks.length + " topics." + (keep.length ? " " + keep.length + " kept in the notes." : ""));
      KOS.rerender();
    }
    var modes = KOS.ui.tabs([{ label: "Paste a topic list", active: true, onSelect: function () {} },
      { label: "Pick from the spec", active: false, onSelect: function () { ov.close(); KOS.show("exams", { id: a.id, tab: "scope" }); } }], { variant: "card", label: "How to set the scope" });
    var body = [
      el("div", { class: "k-ex-inline k-xc-top" }, [spans, el("span", { class: "k-ex-grow" }), modes]),
      el("div", { class: "k-xc-grid" }, [el("div", { class: "k-xc-left" }, [el("label", { class: "k-xv-label", text: "Pasted" }), ta,
        btn("Read the list", "sm", function () { read(); }, { "data-ui": "exams.scope-read" })]), list]),
      foot];
    var ov = KOS.examGuide.dialog("Edit scope", "項", body, [el("span", { class: "k-ex-grow" }), btn("Cancel", "", function () { ov.close(); }), okB], "exams.scope-sheet", "wide");
    var t = null;
    ta.addEventListener("input", function () { clearTimeout(t); t = setTimeout(read, 450); });
    read();
    if (o.mode === "paste") { ta.value = ""; read(); setTimeout(function () { ta.focus(); }, 0); }
    return ov;
  }

  KOS.examScopeSheet = sheet;
})();
