/* Kurenai OS — modules/coderider.js
   A Rider project's hub (frame 26m) and its report import (26n):
   #/code/project/<id>. Overview (the brief and each milestone's state and
   evidence), Setup (export the zip, open it in Rider, the validate
   command), Validation (bring in a report: drop or choose the file, a
   preview, then Import) and History (every report imported). The page
   only READS when drawn (invariant 108); Export and Import are clicks.
   Checking a report is KOS.codeProject.check (pure); applying it is
   KOS.code.recordReport, the one gate to evidence.                        */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var el = KOS.ui.el;
  var SID = "code";
  function C() { return KOS.code; }
  function announce(m) { if (KOS.a11y && KOS.a11y.announce) KOS.a11y.announce(m); }
  function day(ts) { return new Date(ts).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }); }
  function levelText(l) { return l === "ci" ? "◆ CI-verified" : l === "app" ? "✓ In-app" : "◐ Self-run"; }
  var CHECK = { build: "builds", tests: "tests", run: "scripted run", package: "package", git: "committed", owntests: "your own tests", source: "source check", warnings: "no warnings", mutants: "planted bugs caught" };

  function page(main, id, arg) {
    var v = C().projectView(id);
    if (!v) { KOS.show("code", { page: "map" }); return; }
    var p = v.spec, tab = (arg && arg.tab) || "overview", flash = null;
    var body = el("div", { class: "k-cx-rp", "data-ui": "code.project" });
    main.appendChild(KOS.ui.pageHeader({ kicker: "Code · " + (p.capstone ? "Capstone " + p.capstone.slice(1) : /^U\d+$/.test(p.unit) ? "Unit " + p.unit.slice(1) : /^T\d/.test(p.unit) ? "Track " + p.unit.replace(/[A-Z]$/, "") + " · " + p.unit : "Bridge " + p.unit) + " · Rider project", title: p.title, sub: p.summary,
      actions: [el("span", { class: "k-cx-chip", text: "⌘ Rider" }),
        el("button", { type: "button", class: "k-btn k-btn--primary", "data-ui": "code.project-bring", text: "Bring in a report", onclick: function () { tab = "validation"; draw(); pick(); } })] }));
    main.appendChild(body);
    /* on a phone the page header gives way to the subject's: name the project */
    var mini = el("p", { class: "k-cx-capmini", "aria-hidden": "true" }, [el("span", { class: "k-mono", text: "Rider project · " }), el("b", { text: p.title })]);
    var TABS = [["overview", "Overview"], ["setup", "Setup"], ["validation", "Validation"], ["history", "History"]];
    function draw() {
      v = C().projectView(id);
      body.innerHTML = "";
      body.appendChild(mini);
      var bar = el("div", { class: "k-seg k-cx-rp-tabs", role: "tablist", "aria-label": "Project" }, TABS.map(function (t) {
        return el("button", { type: "button", class: "k-seg-item", role: "tab", "data-tab": t[0], "aria-selected": String(t[0] === tab),
          onclick: function () { tab = t[0]; flash = null; draw(); var h = body.querySelector("h2"); if (h) h.focus(); } }, [t[1] + (t[0] === "history" && v.reports.length ? " · " + v.reports.length : "")]);
      }));
      body.appendChild(bar);
      if (flash) body.appendChild(flash);
      ({ overview: overview, setup: setup, validation: validation, history: history })[tab]();
    }
    function grid(mainCol, side) {
      return el("div", { class: "k-cx-capgrid" }, [el("div", { class: "k-cx-capmain" }, mainCol.filter(Boolean)), el("aside", { class: "k-cx-capside" }, side.filter(Boolean))]);
    }
    function card(title, meta, kids, ui) {
      return el("section", { class: "k-card k-cx-capcard", "data-ui": ui || null }, [el("div", { class: "k-card-head" }, [el("h2", { class: "k-card-title", tabindex: "-1", text: title }), meta ? el("span", { class: "k-card-meta", text: meta }) : null].filter(Boolean))].concat(kids.filter(Boolean)));
    }
    function facts() {
      return card("This project", null, [el("ul", { class: "k-insp-list" }, [
        li("Where it runs", "Rider · " + p.sdk),
        li("Milestones", v.done + " of " + v.total),
        li("Last report", v.last ? day(v.last.importedAt) + " · " + levelText(v.last.level) : "none yet"),
        li("Exported here", v.exportedAt ? day(v.exportedAt) : "not yet"),
        li("Reward", p.capstone ? "with Capstone " + p.capstone.slice(1) + ", when it is submitted" : v.payAt ? "paid " + day(v.payAt) : "+" + p.reward.xp + " XP · +" + p.reward.gold + " gold · +" + p.reward.hp + " HP, once")
      ])]);
    }
    function li(k, val) { return el("li", {}, [el("span", { text: k }), el("strong", { text: val })]); }
    function lessons() {
      /* a capstone's project proves the capstone, not single lessons */
      if (p.capstone) return card("Capstone " + p.capstone.slice(1), null, [
        el("p", { class: "k-cx-note", text: "These milestones are the capstone's build. The quiz, rubric, review, write-up and result are on its page." }),
        el("button", { type: "button", class: "k-btn", "data-ui": "code.project-capstone", text: "Open Capstone " + p.capstone.slice(1) + " ›", onclick: function () { KOS.show("code", { page: "capstone", id: p.capstone }); } })]);
      var refs = [];
      p.milestones.forEach(function (m) { (m.lessons || []).forEach(function (r) { if (refs.indexOf(r) < 0) refs.push(r); }); });
      refs.sort();
      return card("Lessons it proves", null, [el("ul", { class: "k-cx-rp-lessons" }, refs.map(function (r) {
        var l = C().lesson(r);
        return el("li", {}, [el("button", { type: "button", class: "k-link", text: r + " " + (l ? l.title : ""), onclick: function () { KOS.show("ref", { subject: SID, ref: r }); } })]);
      }))]);
    }

    /* ── Overview ── */
    function overview() {
      var ms = el("div", { class: "k-cx-rp-ms", "data-ui": "code.project-ms" }, v.milestones.map(function (m, i) {
        var spec = p.milestones[i];
        var badge = m.passedAt ? levelText(m.level) : m.state === "failing" ? "✗ failing in the last report" : m.state === "passed-practice" ? "passes · practice only" : "not validated";
        return el("article", { class: "k-cx-rp-m", "data-state": m.passedAt ? "pass" : m.state === "failing" ? "fail" : null }, [
          el("div", { class: "k-cx-rp-mh" }, [el("b", { class: "k-mono", text: m.id.toUpperCase() }), el("span", { text: m.title }), el("span", { class: "k-cx-rp-badge", "data-ui": "code.project-badge", text: badge })]),
          el("p", { class: "k-cx-note", text: spec.about }),
          el("ul", { class: "k-cx-rp-checks" }, spec.checks.map(function (c, j) {
            var got = m.last && m.last.checks[j];
            return el("li", { "data-state": got ? (got.ok ? "pass" : "fail") : null }, [
              el("span", { "aria-hidden": "true", text: got ? (got.ok ? "✓" : "✗") : "○" }),
              el("span", { text: (CHECK[c.type] || c.type) + (c.class ? " · " + c.class : c.package ? " · " + c.package : "") }),
              el("small", { text: got && got.note ? got.note + " · Automated" : "Automated" })
            ]);
          }))
        ]);
      }));
      body.appendChild(grid([
        card("Brief", null, [el("div", { class: "k-prose", html: KOS.content.renderBlocks(p.brief) })]),
        card("Milestones", v.done + " of " + v.total + " passed", [ms, el("p", { class: "k-cx-note", text: "Every check is Automated: the validation script decides. Each milestone keeps the evidence level of the report that passed it." })])
      ], [facts(), lessons()]));
    }

    /* ── Setup ── */
    function copyField(text) {
      var b = el("button", { type: "button", class: "k-btn k-btn--sm", text: "Copy", onclick: function () {
        var done = function () { b.textContent = "Copied"; announce("Copied."); setTimeout(function () { b.textContent = "Copy"; }, 1400); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () { /* no clipboard */ }); else done();
      } });
      return el("div", { class: "k-cx-rp-copy" }, [el("code", { class: "k-mono", text: text }), b]);
    }
    function setup() {
      var status = el("p", { class: "k-cx-note", "data-ui": "code.project-export-status", role: "status" });
      var exp = el("button", { type: "button", class: "k-btn k-btn--primary", "data-ui": "code.project-export", text: "↓ Export zip", onclick: function () {
        exp.disabled = true; status.textContent = "Building the zip…";
        KOS.codeProject.download(id).then(function (z) { exp.disabled = false; status.textContent = "Zip ready: " + z.name + " (" + z.files.length + " files)."; announce("Zip ready: " + z.name + "."); },
          function (e) { exp.disabled = false; status.textContent = "The zip could not be made: " + (e && e.message || e) + ". Try again."; });
      } });
      var steps = [
        ["Get the project", [el("p", {}, ["A zip made on this device, nothing sent anywhere."]), el("div", { class: "k-cx-q-row" }, [exp]), status]],
        ["Open it in Rider", [el("p", {}, ["Unzip it and open ", el("code", { text: p.solution }), ". Rider restores the packages on first open."])]],
        ["Work on a milestone, then validate", [el("p", {}, ["Run the shared ", el("b", { text: "Kurenai Validate" }), " configuration in Rider's toolbar, or from a terminal in the project folder:"]), copyField("dotnet run .kurenai/validate.cs")]],
        ["Bring the report in", [el("p", {}, ["It writes ", el("code", { text: ".kurenai/reports/<date>.json" }), ". Bring the newest one in on the Validation tab."])]]
      ];
      body.appendChild(grid([card("Setup", "four steps", [el("ol", { class: "k-cx-rp-steps" }, steps.map(function (s, i) {
        return el("li", {}, [el("span", { class: "k-cx-rp-n", text: String(i + 1) }), el("div", {}, [el("h3", { text: s[0] })].concat(s[1]))]);
      }))]), card("What the zip holds", null, [el("ul", { class: "k-cx-rp-zip" }, [
        [p.solution, "the solution"], ["src/", "your code"], ["tests/", "xUnit acceptance tests · protected"], ["Directory.Build.props", "shared settings · protected"],
        [".kurenai/validate.cs", "the validator · protected"], [".run/Kurenai Validate", "the Rider run configuration"], ["README.md · BRIEF.md", "how to build it, and the milestones"], [".gitignore", "bin/, obj/ left out"]
      ].map(function (x) { return el("li", {}, [el("code", { text: x[0] }), el("span", { text: x[1] })]); })),
        el("p", { class: "k-cx-note", text: "Nullable reference types are off until unit 7, as in the lessons." })])], [facts(), lessons()]));
    }

    /* ── Validation ── */
    var input = null;
    function pick() { if (input) input.click(); }
    function validation() {
      input = el("input", { type: "file", accept: ".json,application/json", class: "sr-only", "data-ui": "code.project-file", "aria-label": "Choose a report file",
        onchange: function () { if (input.files && input.files[0]) readFile(input.files[0]); } });
      var drop = el("div", { class: "k-cx-rp-drop", "data-ui": "code.project-drop" }, [
        el("b", { text: "Drop report.json here" }), el("span", { class: "k-cx-note", text: "from .kurenai/reports/ in the project folder" }),
        el("button", { type: "button", class: "k-btn", "data-ui": "code.project-choose", text: "Choose a file", onclick: pick }), input
      ]);
      drop.addEventListener("dragover", function (e) { e.preventDefault(); drop.setAttribute("data-state", "over"); });
      drop.addEventListener("dragleave", function () { drop.removeAttribute("data-state"); });
      drop.addEventListener("drop", function (e) { e.preventDefault(); drop.removeAttribute("data-state"); var f = e.dataTransfer && e.dataTransfer.files[0]; if (f) readFile(f); });
      body.appendChild(grid([card("Bring in a report", null, [drop, el("p", { class: "k-cx-note", text: "Nothing changes until you press Import in the preview." })]),
        card("What the script checks", "on your machine", [el("ul", { class: "k-cx-rp-zip" }, [
          ["Build", "compiler diagnostics, from SARIF"], ["Tests", "the xUnit results, from TRX"], ["Scripted runs", "input in, output compared"], ["Protected files", "tests/, the settings and the validator unchanged"]
        ].map(function (x) { return el("li", {}, [el("b", { text: x[0] }), el("span", { text: x[1] })]); })),
          el("p", { class: "k-cx-note", text: "A report from your machine counts as ◐ Self-run. The same script run by GitHub Actions on a pushed commit will count as ◆ CI-verified." })])],
      [facts(), lessons()]));
    }
    function readFile(f) {
      if (f.size > 256 * 1024) { show(KOS.codeProject.check("x".repeat(256 * 1024 + 1))); return; }
      var r = new window.FileReader();
      r.onload = function () { show(KOS.codeProject.check(String(r.result), { expectId: id })); };
      r.onerror = function () { banner("bad", "✕ Rejected · not a valid report", "The file could not be read."); };
      r.readAsText(f);
    }
    function show(promise) {
      Promise.resolve(promise).then(function (res) {
        if (res.outcome === "rejected") { banner("bad", "✕ Rejected · " + ({ size: "too large", json: "not a valid report", shape: "not a valid report", project: "not one of your projects", scaffold: "unknown scaffold version", validator: "validator too old", future: "dated in the future", before: "older than the export" }[res.code] || "not accepted"), res.msg); announce("Rejected: " + res.msg); return; }
        if (res.outcome === "duplicate") { banner("mute", "= Already imported", res.msg); announce("Already imported. Nothing changed."); return; }
        announce("Report read. Preview open.");
        preview(res);
      });
    }
    function banner(tone, title, msg, extra) {
      flash = el("div", { class: "k-cx-rp-banner", "data-tone": tone, role: "status", "data-ui": "code.project-outcome" }, [el("b", { text: title }), el("p", { text: msg })].concat(extra || []));
      draw();
    }
    function preview(res) {
      var rep = res.report, st = function (sid) { return rep.steps.filter(function (s) { return s.id === sid; })[0] || {}; };
      var b = st("build"), t = st("test");
      var overlay = el("div", { class: "k-dialog-overlay" });
      var cancel = el("button", { type: "button", class: "k-btn", "data-ui": "ui.dialog-close", text: "Cancel", onclick: function () { overlay.remove(); } });
      var go = el("button", { type: "button", class: "k-btn k-btn--primary", "data-ui": "code.project-import", text: "Import", onclick: function () {
        overlay.remove();
        var out = KOS.codeProject.apply(res);
        if (!out || out.duplicate) { banner("mute", "= Already imported", "Nothing changed."); return; }
        if (res.practice) { banner("warn", "◐ Practice only", "The shipped tests were changed (" + res.mismatched.length + " file" + (res.mismatched.length === 1 ? "" : "s") + "), so milestones are not marked.", [el("p", { class: "k-mono", text: res.mismatched.join(" · ") })]); announce("Practice only."); return; }
        var said = out.newly.length ? out.newly.map(function (m) { return "Milestone " + m.slice(1); }).join(", ") + " passed · Self-run." : "No new milestone passed this time.";
        banner("ok", "✓ Accepted", said, out.pay ? [KOS.codeUI.reward({ pay: out.pay }, "the project is complete")] : [el("p", { class: "k-cx-note", text: p.capstone && out.all ? "Every milestone passes: finish Capstone " + p.capstone.slice(1) + " on its page." : v.payAt || out.all ? "" : (v.total - C().projectView(id).done) + " milestone(s) to go." })]);
        announce("Accepted. " + said);
      } });
      var rows = [["Project", p.title], ["Scaffold", "v" + rep.project.scaffoldVersion], ["Validator", rep.validator.version], ["Machine", [rep.env.os, rep.env.arch].filter(Boolean).join(" · ")], ["SDK", ".NET " + (rep.env.sdk || "?")]];
      var stepRows = [
        ["Build", b.ran ? (b.exit === 0 ? "✓ exit 0" : "✗ " + b.errors + " error(s)") : "not run"],
        ["Tests", t.ran ? "✓ " + t.passed + " passed" + (t.failed ? " ✗ " + t.failed + " failed" : "") : "not run"],
        ["Protected files", res.practice ? "◐ changed: " + res.mismatched.join(", ") : "✓ unchanged"]
      ];
      overlay.appendChild(el("div", { class: "k-dialog k-cx-rp-prev", "data-ui": "ui.dialog code.project-preview" }, [
        el("div", { class: "k-dialog-head", "data-ui": "ui.dialog-head" }, [el("h2", { class: "k-dialog-title", "data-ui": "ui.dialog-title", text: "Preview · nothing has changed yet" })]),
        el("div", { class: "k-dialog-body" }, [
          el("dl", { class: "k-cx-rp-dl" }, rows.concat(stepRows).reduce(function (a, r) { return a.concat([el("dt", { text: r[0] }), el("dd", { text: r[1] })]); }, [])),
          el("h3", { class: "k-kicker", text: "Will change" }),
          el("ul", { class: "k-cx-rp-will", "data-ui": "code.project-will" }, res.changes.map(function (c) {
            return el("li", { "data-state": c.becomes ? "pass" : null }, [el("b", { class: "k-mono", text: c.id.toUpperCase() + " " }), c.title + " → " + (c.was ? "already passed" : c.becomes ? "passed · ◐ Self-run" : res.practice && c.now ? "passes · practice only" : "stays open" + (c.why ? " · " + c.why : ""))]);
          })),
          res.completes ? el("p", { class: "k-cx-note", text: "This completes the project: +" + res.reward.xp + " XP · +" + res.reward.gold + " gold · +" + res.reward.hp + " HP, once." }) : null
        ].filter(Boolean)),
        el("div", { class: "k-dialog-foot" }, [cancel, go])
      ]));
      KOS.ui.openDialog(overlay, { label: "Preview the report", initialFocus: go });
    }

    /* ── History ── */
    function history() {
      if (!v.reports.length) {
        body.appendChild(grid([card("History", null, [KOS.ui.emptyState({ compact: true, title: "No reports yet", body: "Run Kurenai Validate in Rider, then bring the report in." })])], [facts(), lessons()]));
        return;
      }
      body.appendChild(grid([card("History", v.reports.length + " report" + (v.reports.length === 1 ? "" : "s"), [el("table", { class: "k-cx-rp-hist", "data-ui": "code.project-history" }, [
        el("thead", {}, [el("tr", {}, ["Imported", "Evidence", "Passes", "Commit", "SDK"].map(function (h) { return el("th", { scope: "col", text: h }); }))]),
        el("tbody", {}, v.reports.map(function (e) {
          return el("tr", { "data-state": e.practice ? "practice" : null }, [
            el("td", { text: day(e.importedAt) }), el("td", { text: e.practice ? "◐ practice only" : levelText(e.level) }),
            el("td", { text: e.milestones.filter(function (m) { return m.ok; }).length + " / " + p.milestones.length }),
            el("td", { class: "k-mono", text: e.commit ? e.commit.slice(0, 7) + (e.dirty ? " · uncommitted" : "") : "—" }),
            el("td", { class: "k-mono", text: e.sdk || "—" })
          ]);
        }))
      ])])], [facts(), lessons()]));
    }
    draw();
  }

  KOS.codeRider = { page: page };
})();
