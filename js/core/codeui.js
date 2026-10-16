/* Kurenai OS — core/codeui.js
   The Code primitives (design 26·kit), built once and used by every Code
   surface: lessons, the Practice tab, tasks, retrieval and settings.

     editor(opts)         the code editor: a textarea under a highlighting
                          overlay. Tab indents, Shift+Tab outdents, Enter
                          keeps the indent, Ctrl/⌘+Enter runs, and Esc then
                          Tab leaves (Tab is never a trap). Its status bar
                          always shows state · position · indent · the
                          keyboard hint. States: idle, focused, running
                          (read-only), compile error (line + squiggle),
                          runtime error, timeout.
     highlight(src)       the IDE colours (frame 19a) as k-t spans
     results(check, opts) the results list: a real <ul>; waiting, running
                          (placeholder rows), results, or the error card
     errorCard(err)       compile · runtime exception · did not finish:
                          the raw message, one plain sentence, "Usually
                          because…"
     hintLadder(o)        three rungs; a rung opens only after the one above
     evidence(level)      In-app ✓ · Self-run ◐ · CI-verified ◆
     strands(list)        the L · E · S chips
     dot(band) / days()   the freshness dot, always with its days printed
     stagePath(o)         units as squares, capstones as diamonds
     listing(run, o)      a runnable code block in notes: Run · Reset · Copy
     keyBar(textarea)     the phone's symbol bar
     reward(outcome)      "◆ +18 XP · …" or "No reward · why"

   Classes are k-ced / k-cx (presentation only, invariant 26); logic and
   tests read the data-ui hooks. Nothing here writes the store except the
   listing's run evidence, through KOS.code.                              */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var el = KOS.ui.el, esc = KOS.ui.esc;

  /* ---------------- highlighting ---------------- */
  var KW = {};
  ("abstract as base bool break byte case catch char class const continue decimal default do double else enum " +
   "false finally float for foreach if in int interface internal is long namespace new null object out override " +
   "params private protected public readonly ref return sealed short static string struct switch this throw true " +
   "try typeof uint ulong using var virtual void while get set init record async await when not and or yield")
    .split(" ").forEach(function (w) { KW[w] = true; });
  function tok(t, s) { return '<span class="k-t" data-t="' + t + '">' + esc(s) + "</span>"; }
  /* one line at a time, carrying an open block comment across lines;
     `mark` wraps the first occurrence of a name in the squiggle */
  function highlightLines(src, markLine, markName) {
    var lines = String(src == null ? "" : src).replace(/\r\n?/g, "\n").split("\n");
    var inBlock = false;
    return lines.map(function (line, li) {
      var out = "", i = 0, n = line.length;
      var re = /(\/\/.*$)|(\/\*)|(\$?@?"(?:[^"\\]|\\.)*"?|'(?:[^'\\]|\\.)*'?)|(\b\d[\d_]*(?:\.\d+)?[mMdDfFL]?\b)|(\[(?:Fact|Theory|InlineData)\b[^\]]*\])|([A-Za-z_]\w*)|([^\sA-Za-z_\d"'$@/\[]+|.)/g;
      var squig = markName && li + 1 === markLine;
      var done = false;
      function word(w, kind) {
        if (squig && !done && w === markName) { done = true; return '<span class="k-ced-squig">' + (kind ? tok(kind, w) : esc(w)) + "</span>"; }
        return kind ? tok(kind, w) : esc(w);
      }
      if (inBlock) {
        var end = line.indexOf("*/");
        if (end < 0) return tok("com", line);
        out += tok("com", line.slice(0, end + 2));
        i = end + 2; inBlock = false;
      }
      re.lastIndex = i;
      var m;
      while (i < n && (m = re.exec(line))) {
        if (m.index > i) out += esc(line.slice(i, m.index));
        if (m[1]) out += tok("com", m[1]);
        else if (m[2]) {
          var close = line.indexOf("*/", m.index + 2);
          if (close < 0) { out += tok("com", line.slice(m.index)); inBlock = true; i = n; break; }
          out += tok("com", line.slice(m.index, close + 2));
          re.lastIndex = close + 2;
        }
        else if (m[3]) out += tok("str", m[3]);
        else if (m[4]) out += tok("num", m[4]);
        else if (m[5]) out += tok("attr", m[5]);
        else if (m[6]) {
          var w = m[6], call = line.charAt(re.lastIndex) === "(";
          out += word(w, KW[w] ? "kw" : call ? "fn" : /^[A-Z]/.test(w) ? "ty" : null);
        }
        else out += esc(m[7]);
        i = re.lastIndex;
      }
      if (i < n) out += esc(line.slice(i));
      return out;
    });
  }
  function highlight(src) { return highlightLines(src).join("\n"); }

  /* ---------------- the editor ---------------- */
  var edSeq = 0;
  var STATE_WORD = { ready: "Ready", running: "Running on this device…", pass: "All tests pass", fail: "",
    compile: "", exception: "Stopped: exception", timeout: "Did not finish", edited: "Edited" };
  function editor(opts) {
    opts = opts || {};
    var id = "k-ced-" + (++edSeq);
    var file = opts.file || "Program.cs";
    var errLine = 0, errName = null, escArmed = false, readOnly = !!opts.readOnly, running = false;
    var gutter = el("div", { class: "k-ced-gutter", "aria-hidden": "true" });
    var pre = el("pre", { class: "k-ced-hl", "aria-hidden": "true" });
    var ta = el("textarea", { class: "k-ced-ta", "data-ui": "code.editor-input", id: id, spellcheck: "false", autocapitalize: "off",
      autocomplete: "off", autocorrect: "off", wrap: "off", "aria-describedby": id + "-hint",
      "aria-label": (opts.label || "Code editor") + ", " + file });
    var wrap = el("div", { class: "k-ced-wrap" }, [pre, ta]);
    var body = el("div", { class: "k-ced-body", "data-scroller": "true" }, [gutter, wrap]);
    var stateEl = el("span", { class: "k-ced-state", "data-ui": "code.editor-state" });
    var posEl = el("span", { class: "k-ced-pos", "data-ui": "code.editor-pos" });
    var note = el("span", { class: "k-ced-note", "data-ui": "code.editor-note", hidden: "" }, ["Read-only while it runs"]);
    var head = el("div", { class: "k-ced-head" }, [
      el("span", { class: "k-ced-lang", "aria-hidden": "true", text: "C#" }),
      el("span", { class: "k-ced-file", text: file }),
      note,
      opts.actions ? el("span", { class: "k-ced-actions" }, opts.actions) : null
    ].filter(Boolean));
    var hint = el("span", { class: "k-ced-hint", id: id + "-hint" }, [
      el("kbd", { text: "Esc" }), " then ", el("kbd", { text: "Tab" }), " leaves the editor · ",
      el("kbd", { text: "Ctrl" }), "+", el("kbd", { text: "Enter" }), " runs"
    ]);
    var bar = el("div", { class: "k-ced-bar", "data-ui": "code.editor-bar" }, [stateEl, posEl,
      el("span", { class: "k-ced-indent", text: "Spaces: 4" }), hint]);
    var root = el("div", { class: "k-ced", "data-ui": "code.editor", "data-state": readOnly ? "ro" : null }, [
      opts.bare ? null : head, body, opts.noBar ? null : bar
    ].filter(Boolean));
    if (opts.compact) KOS.ui.state(root, "compact", true);
    var state = "ready";
    function setState(s, text) {
      state = s;
      ["pass", "fail", "compile", "exception", "timeout", "running"].forEach(function (w) { KOS.ui.state(root, w, w === s); });
      stateEl.textContent = (s === "ready" || s === "edited" ? "● " : s === "running" ? "◌ " : s === "pass" ? "✓ " : "✗ ") + (text || STATE_WORD[s] || "Ready");
    }
    function paint() {
      var lines = highlightLines(ta.value, errLine, errName);
      pre.innerHTML = lines.join("\n") + "\n ";
      var n = Math.max(lines.length, opts.minLines || 1);
      var g = "";
      for (var i = 1; i <= n; i++) g += '<span class="k-ced-ln"' + (i === errLine ? ' data-state="err"' : "") + ">" + (i === errLine ? "✗ " : "") + i + "</span>";
      gutter.innerHTML = g;
      KOS.ui.state(root, "has-err", !!errLine);
      wrap.style.setProperty("--ced-err", errLine ? String(errLine) : "0");
    }
    function pos() {
      var v = ta.value.slice(0, ta.selectionStart || 0);
      var ln = v.split("\n").length, col = v.length - v.lastIndexOf("\n");
      posEl.textContent = "Ln " + ln + ", Col " + col;
    }
    function changed() {
      if (errLine) { errLine = 0; errName = null; }
      paint(); pos();
      if (state !== "ready" && state !== "edited") setState("edited");
      if (opts.onChange) opts.onChange(ta.value);
    }
    function replaceSel(text) {
      var s = ta.selectionStart, e = ta.selectionEnd;
      if (typeof ta.setRangeText === "function") ta.setRangeText(text, s, e, "end");
      else { ta.value = ta.value.slice(0, s) + text + ta.value.slice(e); ta.selectionStart = ta.selectionEnd = s + text.length; }
      changed();
    }
    ta.addEventListener("input", changed);
    ta.addEventListener("keyup", pos);
    ta.addEventListener("click", pos);
    ta.addEventListener("focus", function () { KOS.ui.state(root, "focused", true); pos(); });
    ta.addEventListener("blur", function () { KOS.ui.state(root, "focused", false); escArmed = false; });
    body.addEventListener("scroll", function () { /* the overlay scrolls with the body; nothing to sync */ });
    ta.addEventListener("keydown", function (ev) {
      if ((ev.ctrlKey || ev.metaKey) && ev.key === "Enter") { ev.preventDefault(); if (opts.onRun) opts.onRun(); return; }
      if ((ev.ctrlKey || ev.metaKey) && (ev.key === "b" || ev.key === "B") && opts.onToggle) { ev.preventDefault(); opts.onToggle(); return; }
      if (ev.key === "Escape") {
        escArmed = true;
        stateEl.textContent = "Tab now leaves the editor";
        return;
      }
      if (ta.readOnly) return;
      if (ev.key === "Tab") {
        if (escArmed) { escArmed = false; setState(state); return; }
        ev.preventDefault();
        var v = ta.value, s = ta.selectionStart, e = ta.selectionEnd;
        var ls = v.lastIndexOf("\n", s - 1) + 1;
        if (s === e && !ev.shiftKey) { replaceSel("    "); return; }
        var le = v.indexOf("\n", e - (e > s && v.charAt(e - 1) === "\n" ? 1 : 0));
        var end = le < 0 ? v.length : le;
        var block = v.slice(ls, end);
        var nb = ev.shiftKey ? block.replace(/^ {1,4}/gm, "") : block.replace(/^/gm, "    ");
        if (typeof ta.setRangeText === "function") ta.setRangeText(nb, ls, end, "select");
        else ta.value = v.slice(0, ls) + nb + v.slice(end);
        changed();
        return;
      }
      escArmed = false;
      if (ev.key === "Enter") {
        ev.preventDefault();
        var v2 = ta.value, s2 = ta.selectionStart;
        var ls2 = v2.lastIndexOf("\n", s2 - 1) + 1, line = v2.slice(ls2, s2);
        var ind = (/^\s*/.exec(line) || [""])[0];
        if (/[{(]\s*$/.test(line)) ind += "    ";
        replaceSel("\n" + ind);
        return;
      }
      if (ev.key === "}") {
        var v3 = ta.value, s3 = ta.selectionStart, ls3 = v3.lastIndexOf("\n", s3 - 1) + 1;
        if (/^\s+$/.test(v3.slice(ls3, s3)) && s3 - ls3 >= 4) {
          ev.preventDefault();
          if (typeof ta.setRangeText === "function") ta.setRangeText("}", s3 - 4, s3, "end");
          changed();
        }
      }
    });
    ta.value = opts.value || "";
    ta.readOnly = readOnly;
    setState("ready");
    paint(); posEl.textContent = "Ln 1, Col 1";
    return {
      el: root, input: ta,
      get value() { return ta.value; },
      files: function () { return [{ name: file, src: ta.value }]; },
      set: function (src) { ta.value = String(src == null ? "" : src); errLine = 0; errName = null; paint(); },
      focus: function () { ta.focus(); },
      state: function (s, text) { if (s === undefined) return state; setState(s, text); },
      /* mark an error line; `name` gets the squiggle (CS0103's 'totl') */
      mark: function (line, name) { errLine = line || 0; errName = name || null; paint(); },
      running: function (on) {
        running = !!on;
        ta.readOnly = running || readOnly;
        note.hidden = !running;
        KOS.ui.state(root, "ro", running || readOnly);
        if (running) setState("running");
      },
      readOnly: function (on) { readOnly = !!on; ta.readOnly = readOnly; KOS.ui.state(root, "ro", readOnly); }
    };
  }

  /* ---------------- error card ---------------- */
  /* the name a compile message quotes ('totl'), for the squiggle */
  function quoted(msg) { var m = /'([A-Za-z_]\w*)'/.exec(String(msg || "")); return m ? m[1] : null; }
  function errorCard(err, opts) {
    opts = opts || {};
    if (err && err.kind === "runtime") return runtimeCard(opts);
    var x = KOS.codeRun.explain(err);
    if (!x) return null;
    return el("div", { class: "k-cx-err", "data-ui": "code.error-card", "data-kind": err.kind, role: "group", "aria-label": x.kind }, [
      el("div", { class: "k-cx-err-head" }, [
        el("b", { text: "✗ " + x.kind }),
        err.kind === "timeout" ? null : el("span", { class: "k-mono", text: x.code }),
        x.line ? el("span", { class: "k-cx-err-line", text: "line " + x.line }) : null
      ].filter(Boolean)),
      x.msg ? el("p", { class: "k-cx-err-raw k-mono", text: err.kind === "timeout" ? (opts.caseNo ? "Stopped after 2 seconds in case " + opts.caseNo + "." : x.msg) : x.msg }) : null,
      x.plain ? el("p", { class: "k-cx-err-plain", text: err.kind === "timeout" ? "Did not finish — is there a loop whose condition never becomes false?" : x.plain }) : null,
      x.usually ? el("p", { class: "k-cx-err-why", text: "Usually because: " + x.usually }) : null,
      opts.after ? el("p", { class: "k-cx-err-after", text: opts.after }) : null
    ].filter(Boolean));
  }

  /* ---------------- the full runtime (frame 26g) ---------------- */
  var MB = function (b) { return b == null ? "?" : (b / 1e6 < 10 ? (b / 1e6).toFixed(1) : String(Math.round(b / 1e6))); };
  /* where Run would answer: the reason in one sentence and the ways forward */
  function runtimeCard(opts) {
    var rt = KOS.codeRun.runtime();
    var file = rt.state === "file";
    return el("div", { class: "k-cx-err k-cx-rtcard", "data-ui": "code.runtime-card", "data-kind": "runtime", role: "group", "aria-label": "Needs the full C# runtime" }, [
      el("div", { class: "k-cx-err-head" }, [el("b", { text: "◇ The in-app runner can't run this" })]),
      el("p", { class: "k-cx-err-plain", text: file
        ? "From unit 7 the code runs on real .NET in this browser, which needs the app served over http(s) rather than opened as a file."
        : "From unit 7 the code runs on real .NET: the compiler and the runtime, downloaded once and kept on this device." }),
      file ? null : el("div", { class: "k-cx-rtcard-acts" }, [
        el("button", { type: "button", class: "k-btn k-btn--primary k-btn--sm", "data-ui": "code.runtime-get", text: "Get the full runtime", onclick: function () { runtimeOffer({ onReady: opts.onReady }); } }),
        opts.saveLater ? el("button", { type: "button", class: "k-btn k-btn--sm", text: "Save for the computer", onclick: opts.saveLater }) : null
      ].filter(Boolean)),
      el("p", { class: "k-cx-err-after", text: "You can still read the listing and its output below. Nothing is uploaded: your code runs only on this device." })
    ].filter(Boolean));
  }
  /* the offer → downloading → ready (or offline, or failed) dialog */
  function runtimeOffer(opts) {
    opts = opts || {};
    var R = KOS.codeRun, announce = function (m) { if (KOS.a11y && KOS.a11y.announce) KOS.a11y.announce(m); };
    var overlay = el("div", { class: "k-dialog-overlay" });
    var box = el("div", { class: "k-dialog k-cx-rt", "data-ui": "ui.dialog code.runtime-dialog" });
    overlay.appendChild(box);
    var size = null, said = -1, off = null, onOnline = null;
    function close() {
      if (off) off();
      if (onOnline) window.removeEventListener("online", onOnline);
      overlay.remove();
    }
    function foot(btns) { return el("div", { class: "k-dialog-foot" }, btns); }
    function head(t) {
      return el("div", { class: "k-dialog-head", "data-ui": "ui.dialog-head" }, [el("h2", { class: "k-dialog-title", "data-ui": "ui.dialog-title", text: t }),
        el("button", { type: "button", class: "k-iconbtn", "data-ui": "ui.dialog-close", "aria-label": "Close", text: "✕", onclick: close })]);
    }
    function draw() {
      var rt = R.runtime();
      box.innerHTML = "";
      box.setAttribute("data-state", rt.state);
      if (rt.state === "ready") {
        box.appendChild(head("✓ Full runtime ready"));
        box.appendChild(el("div", { class: "k-dialog-body" }, [el("p", { text: "Works offline · " + MB(size && size.bytes) + " MB in Code storage. It compiled a first program in " + (rt.warm || rt.ms) + " ms." })]));
        var go = el("button", { type: "button", class: "k-btn k-btn--primary", "data-ui": "code.runtime-run", text: opts.onReady ? "Run it" : "Done", onclick: function () { close(); if (opts.onReady) opts.onReady(); } });
        box.appendChild(foot([go]));
        go.focus();
        return;
      }
      if (rt.state === "downloading") {
        var pct = rt.total ? Math.round(100 * rt.loaded / rt.total) : 0;
        var q = Math.floor(pct / 25);
        if (q !== said) { said = q; announce("Downloading the full runtime, " + pct + " percent."); }
        box.appendChild(head("Downloading the full runtime"));
        box.appendChild(el("div", { class: "k-dialog-body" }, [
          el("p", { class: "k-cx-rt-n", text: (size ? MB(size.gzip * pct / 100) + " of " + MB(size.gzip) + " MB" : pct + "%") }),
          el("div", { class: "k-cx-rt-bar", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": String(pct), "aria-label": "Download" }, [el("span", { style: "--pct:" + pct + "%" })]),
          el("p", { class: "k-cx-note", text: pct + "% · units 1–6 still run meanwhile" })
        ]));
        box.appendChild(foot([el("button", { type: "button", class: "k-btn", text: "Cancel", onclick: function () { R.removeRuntime(); close(); announce("Download cancelled."); } })]));
        return;
      }
      if (rt.state === "offline") {
        box.appendChild(head("⌁ You're offline"));
        box.appendChild(el("div", { class: "k-dialog-body" }, [el("p", { text: "The download starts when you're back online. Units 1–6 run as normal." })]));
        box.appendChild(foot([el("button", { type: "button", class: "k-btn", text: "Close", onclick: close })]));
        return;
      }
      var failed = rt.state === "failed";
      box.appendChild(head(failed ? "The download stopped" : "This lesson runs on the full .NET runtime"));
      var dl = el("button", { type: "button", class: "k-btn k-btn--primary", "data-ui": "code.runtime-download", text: failed ? "Try again" : "↓ Download", onclick: start });
      var need = el("p", { class: "k-cx-note", "data-ui": "code.runtime-space" });
      box.appendChild(el("div", { class: "k-dialog-body" }, [
        el("p", { text: failed ? "It stopped before the runtime was ready" + (rt.error ? " (" + rt.error + ")" : "") + ". What arrived is kept; trying again fetches the rest."
          : "Classes, records, generics and LINQ need more than the in-app runner. Download the full runtime once and it stays on this device, working offline afterwards." }),
        el("div", { class: "k-cx-rt-pkg" }, [el("span", { class: "k-cx-rt-ic", "aria-hidden": "true", text: ".NET" }),
          el("div", {}, [el("b", { text: ".NET 10 runtime and the C# compiler" }), el("span", { class: "k-cx-note", "data-ui": "code.runtime-size", text: "≈ " + MB(size && size.gzip) + " MB" })])]),
        el("p", { class: "k-cx-note", text: "Your code still runs only on this device. Nothing is uploaded." }),
        need
      ]));
      box.appendChild(foot([el("button", { type: "button", class: "k-btn", "data-ui": "ui.dialog-cancel", text: "Not now", onclick: close }), dl]));
      dl.focus();
      if (navigator.storage && navigator.storage.estimate && size) navigator.storage.estimate().then(function (est) {
        var free = (est.quota || 0) - (est.usage || 0);
        if (est.quota && free < size.bytes) { need.textContent = "Needs " + MB(size.bytes) + " MB; " + MB(free) + " MB free."; dl.disabled = true; }
      }).catch(function () { /* no estimate */ });
    }
    function start() {
      if (navigator.onLine === false) {
        KOS.codeRun.startRuntime();
        onOnline = function () { draw(); };
        window.addEventListener("online", onOnline);
      } else KOS.codeRun.startRuntime();
      draw();
    }
    off = R.onRuntime(function (rt) { if (rt.state === "ready") announce("Full runtime ready."); draw(); });
    KOS.ui.openDialog(overlay, { label: "The full C# runtime" });
    draw();
    R.runtimeSize().then(function (s) { size = s; draw(); });
    return { close: close };
  }
  /* compiler warnings (nullable from unit 7): a design tool, never a failure */
  function warningsPanel(ws) {
    if (!ws || !ws.length) return null;
    return el("div", { class: "k-cx-warns", "data-ui": "code.warnings" }, [el("span", { class: "k-cx-out-k", text: ws.length + " warning" + (ws.length === 1 ? "" : "s") })]
      .concat([el("ul", {}, ws.slice(0, 8).map(function (w) {
        return el("li", {}, [el("span", { class: "k-cx-warn-m", "aria-hidden": "true", text: "⚠" }), el("span", { class: "k-mono", text: w.code }), w.line ? el("span", { class: "k-cx-err-line", text: "line " + w.line }) : null, el("span", { text: w.msg })].filter(Boolean));
      }))]));
  }

  /* ---------------- results list ---------------- */
  /* check: the KOS.codeRun.check() result, or null with opts.running;
     spec: the cases (to name them) */
  function results(check, opts) {
    opts = opts || {};
    var total = opts.total || (check ? check.total : 0);
    var box = el("section", { class: "k-cx-res", "data-ui": "code.results", "aria-label": "Results" });
    var sum = el("span", { class: "k-cx-res-sum", "data-ui": "code.results-sum" });
    box.appendChild(el("div", { class: "k-cx-res-head" }, [el("h3", { class: "k-cx-res-h", text: opts.title || "Results" }), sum]));
    if (opts.running || !check) {
      var ul0 = el("ul", { class: "k-cx-list", "aria-busy": opts.running ? "true" : null });
      sum.textContent = opts.running ? "Running " + total + " case" + (total === 1 ? "" : "s") + " on this device…" : "Not run yet";
      for (var i = 0; i < total; i++) {
        var hid = opts.cases && opts.cases[i] && opts.cases[i].hidden;
        ul0.appendChild(el("li", { class: "k-cx-row", "data-state": "wait" }, [
          el("span", { class: "k-cx-ph", "aria-hidden": "true" }),
          el("b", { text: "Case " + (i + 1) + (hid ? " · hidden" : "") })
        ]));
      }
      box.appendChild(ul0);
      return box;
    }
    if (check.compile) {
      sum.textContent = "Compile error " + check.compile.code + (check.compile.line ? " on line " + check.compile.line : "");
      box.appendChild(errorCard(check.compile, { after: "The results list is replaced until it compiles. Nothing was run." }));
      return box;
    }
    var fails = check.results.filter(function (r) { return !r.ok && !r.skipped; });
    sum.textContent = check.pass + " of " + check.total + " pass" + (fails.length ? " · case " + (fails[0].i + 1) + " fails" : "");
    var ul = el("ul", { class: "k-cx-list" });
    check.results.forEach(function (r) {
      var label = r.hidden ? "hidden" : opts.method ? opts.method + "(" + (r.input || "").replace(/^\[|\]$/g, "") + ")" : r.input ? JSON.stringify(KOS.codeRun.firstLine(r.input)) : "no input";
      if (r.skipped) {
        ul.appendChild(el("li", { class: "k-cx-row", "data-state": "skip" }, [
          el("span", { class: "k-cx-pill", "data-tone": "muted", text: "– Not run" }),
          el("b", { text: "Case " + (r.i + 1) }), el("span", { class: "k-cx-case", text: r.hidden ? "hidden" : "" })
        ]));
        return;
      }
      var li = el("li", { class: "k-cx-row", "data-state": r.ok ? "pass" : "fail", "data-ui": "code.result" }, [
        el("span", { class: "k-cx-pill", "data-tone": r.ok ? "pass" : "fail", text: r.ok ? "✓ Pass" : "✗ Fail" }),
        el("b", { text: "Case " + (r.i + 1) }),
        el("span", { class: "k-cx-case", text: label }),
        el("span", { class: "k-cx-ms k-mono", text: Math.max(1, Math.round(r.ms || 1)) + " ms" })
      ]);
      if (!r.ok) {
        var more = el("div", { class: "k-cx-more" });
        if (r.error) more.appendChild(errorCard(r.error, { caseNo: r.i + 1, after: check.stopped && check.total > r.i + 1 ? "Stopped in case " + (r.i + 1) + " · cases " + (r.i + 2) + "–" + check.total + " not run" : null }));
        else {
          if (r.hidden) more.appendChild(el("p", { class: "k-cx-note", text: "The input of a hidden case stays hidden. Here is how your output differed:" }));
          more.appendChild(diffView(r.expected, r.got));
        }
        li.appendChild(more);
      }
      ul.appendChild(li);
    });
    box.appendChild(ul);
    if (check.rule) {
      box.appendChild(el("div", { class: "k-cx-rule", "data-ui": "code.rule" }, [
        el("b", { text: "✗ Not yet · output matched · rule failed" }),
        el("p", { text: check.rule.msg })
      ]));
    }
    return box;
  }
  function diffView(expected, got) {
    var rows = KOS.codeRun.diff(expected, got);
    var tbl = el("div", { class: "k-cx-diff", "data-ui": "code.diff", role: "table", "aria-label": "Expected and your output" }, [
      el("div", { class: "k-cx-diff-h", role: "row" }, [el("span", { role: "columnheader", text: "Expected" }), el("span", { role: "columnheader", text: "Your output" })])
    ]);
    rows.forEach(function (r) {
      tbl.appendChild(el("div", { class: "k-cx-diff-r", role: "row", "data-state": r.same ? null : "diff" }, [
        el("span", { role: "cell", class: "k-mono", text: r.exp === undefined ? "∅" : (r.same ? "  " : "+ ") + r.exp }),
        el("span", { role: "cell", class: "k-mono", text: r.got === undefined ? "∅ missing" : (r.same ? "  " : "≠ ") + r.got })
      ]));
    });
    return tbl;
  }

  /* ---------------- the reward line ---------------- */
  function hm(ts) { var d = new Date(ts); return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2); }
  function payText(p) {
    if (!p) return "";
    return ["+" + p.xp + " XP", p.gold ? "+" + p.gold + " gold" : null, p.hp ? "+" + p.hp + " HP" : null].filter(Boolean).join(" · ");
  }
  function reward(outcome, extra) {
    if (!outcome) return null;
    if (outcome.pay) {
      return el("p", { class: "k-cx-reward", "data-ui": "code.reward", "data-state": "paid" }, [
        el("b", { text: "◆ " + payText(outcome.pay) }),
        outcome.phone ? el("span", { text: " Phone task · reduced reward" }) : null,
        extra ? el("span", { class: "k-cx-reward-x", text: extra }) : null
      ].filter(Boolean));
    }
    var why = outcome.why === "already passed" ? "already passed" + (outcome.at ? " on " + new Date(outcome.at).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) + " at " + hm(outcome.at) : "")
      : outcome.why === "answer opened" ? "you opened the answer" + (outcome.at ? " at " + hm(outcome.at) : "")
      : outcome.why === "already passed on a phone" ? "already passed on a phone — the rest pays on a computer"
      : outcome.capped ? "today’s " + KOS.code.CARD_CAP + " retrieval rewards are used"
      : outcome.why || "practice";
    return el("p", { class: "k-cx-reward", "data-ui": "code.reward", "data-state": "none" }, [
      el("b", { text: "No reward" }), el("span", { text: " · " + why })
    ]);
  }

  /* ---------------- hint ladder ---------------- */
  var RUNG = ["Nudge", "Pointer", "Shape of the answer"];
  function hintLadder(o) {
    var hints = o.hints || [], open = o.open || 0;
    var list = el("ol", { class: "k-cx-hints", "data-ui": "code.hints" });
    hints.forEach(function (h, i) {
      var st = i < open ? "open" : i === open ? "available" : "closed";
      list.appendChild(el("li", { class: "k-cx-hint", "data-state": st }, [
        el("span", { class: "k-cx-hint-n", "aria-hidden": "true", text: String(i + 1) }),
        el("div", { class: "k-cx-hint-txt" }, [
          el("b", { text: RUNG[i] || "Hint " + (i + 1) }),
          st === "open" ? el("p", { text: h }) :
          st === "available" ? el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "code.hint-open", text: "Open",
            onclick: function () { if (o.onOpen) o.onOpen(i); } }) :
          el("span", { class: "k-cx-hint-wait", text: "after the one above" })
        ])
      ]));
    });
    return list;
  }

  /* ---------------- small marks ---------------- */
  var EVIDENCE = { app: ["✓", "In-app"], self: ["◐", "Self-run"], ci: ["◆", "CI-verified"] };
  function evidence(level) {
    var e = EVIDENCE[level] || EVIDENCE.app;
    return el("span", { class: "k-cx-ev", "data-level": level || "app", "data-ui": "code.evidence" }, [
      el("span", { "aria-hidden": "true", text: e[0] }), " " + e[1]
    ]);
  }
  /* a unit's strands as quiet words ("C# · Computer science"), never as
     letter badges — the letters meant nothing at a glance */
  var STRAND_WORD = { L: "C#", E: "Engineering", S: "Computer science" };
  function strands(list) {
    return el("span", { class: "k-cx-strands", text: (list || []).map(function (k) { return STRAND_WORD[k] || k; }).join(" · ") });
  }
  function where(kind, opts) {
    var W = (window.KOS_CODE && KOS_CODE.WHERE) || {};
    var w = W[kind] || W.app || { label: kind, mark: "▸" };
    return el("span", { class: "k-cx-where", "data-where": kind, title: w.hint || null }, [
      el("span", { "aria-hidden": "true", text: w.mark + " " }), opts && opts.short ? null : w.label
    ].filter(Boolean));
  }
  function dot(b) { return el("span", { class: "k-cx-dot", "data-band": b || "later", "aria-hidden": "true" }); }
  function daysText(sk) {
    return sk.band === "np" ? "not proven" : sk.band === "later" ? "later" : sk.days + " d";
  }
  function chip(text, tone) { return el("span", { class: "k-cx-chip", "data-tone": tone || null, text: text }); }

  /* ---------------- the stage path ---------------- */
  function stagePath(o) {
    o = o || {};
    var K = window.KOS_CODE;
    var row = el("div", { class: "k-cx-path", "data-ui": "code.stage-path", role: "group", "aria-label": "Core path", tabindex: o.focusable ? "0" : null });
    if (o.compact) KOS.ui.state(row, "compact", true);
    (K ? K.STAGES : []).forEach(function (st) {
      if (o.only && o.only !== st.id) return;
      var cur = st.units.some(function (u) { var x = KOS.code.unitState(u).state; return x === "current"; });
      var grp = el("div", { class: "k-cx-stage", "data-bridge": st.bridge ? "" : null, "data-state": cur ? "current" : null });
      grp.appendChild(el("div", { class: "k-cx-stage-h" }, st.bridge
        ? [el("b", { text: "Bridge B" })]
        : [el("span", { class: "k-mono", text: "Stage " + st.id }), " ", el("b", { text: st.title })]));
      var marks = el("div", { class: "k-cx-stage-m" });
      st.units.forEach(function (u) {
        var us = KOS.code.unitState(u);
        var lbl = u === "B" ? "B" : u;
        var b = el("button", { type: "button", class: "k-cx-sq", "data-state": us.state, "data-ui": "code.path-unit",
          "aria-label": (u === "B" ? "Bridge B" : "Unit " + u.slice(1)) + ": " + (us.state === "later" ? "recommended later" : us.done + " of " + us.total + " done"),
          tabindex: "-1", text: us.state === "done" ? "✓" : lbl,
          onclick: function () { if (o.onUnit) o.onUnit(u); } });
        if (us.state === "done") b.setAttribute("title", lbl + " done");
        marks.appendChild(b);
      });
      if (st.capstone) {
        var cap = K.CAPSTONES[st.capstone], cst = KOS.code.capStage(st.capstone), cid = st.capstone;
        var words = cst === "passed" ? "passed" : cst === "next" ? "next" : "recommended later";
        marks.appendChild(KOS.code.capstone(cid)
          ? el("button", { type: "button", class: "k-cx-dia", "data-state": cst, "data-ui": "code.path-capstone", tabindex: "-1",
              "aria-label": "Capstone " + cid.slice(1) + ", " + cap.title + ": " + words, title: "Capstone " + cid.slice(1) + " · " + cap.title,
              onclick: function () { KOS.show("code", { page: "capstone", id: cid }); } })
          : el("span", { class: "k-cx-dia", "data-state": cst, role: "img",
              "aria-label": "Capstone " + cid.slice(1) + ", " + cap.title + ": " + words, title: "Capstone " + cid.slice(1) + " · " + cap.title }));
      }
      grp.appendChild(marks);
      row.appendChild(grp);
    });
    /* on a phone only the current stage shows (frame 26u); wider, the path
       scrolls inside the shared scroller rather than spilling */
    row.addEventListener("keydown", function (e) {
      var sq = [].slice.call(row.querySelectorAll("[data-ui~='code.path-unit']"));
      var i = sq.indexOf(document.activeElement);
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        var j = i < 0 ? 0 : Math.max(0, Math.min(sq.length - 1, i + (e.key === "ArrowRight" ? 1 : -1)));
        if (sq[j]) sq[j].focus();
      }
    });
    if (!row.querySelector("[data-state~='current']") && row.firstChild) KOS.ui.state(row.firstChild, "current", true);
    return o.bare ? row : KOS.ui.scroller(row, { keepRole: true, label: "Core path", prevLabel: "Earlier stages", nextLabel: "Later stages" });
  }

  /* ---------------- files (unit 6): the in-memory disk ----------------
     A listing, task or card may bring files ({ "scores.txt": "…" }); the
     runner reads and writes them in memory. filesPanel shows the seed
     files; writtenPanel shows what a run created or changed. */
  /* a file of bytes ({hex}) as a dump: offset, sixteen bytes, their text */
  function hexDump(hex) {
    var b = (hex.match(/../g) || []).map(function (h) { return parseInt(h, 16); }), rows = [];
    for (var i = 0; i < b.length && i < 512; i += 16) {
      var part = b.slice(i, i + 16);
      rows.push(("000" + i.toString(16).toUpperCase()).slice(-4) + "  " + part.map(function (x) { return ("0" + x.toString(16).toUpperCase()).slice(-2); }).join(" ").padEnd(47) + "  " +
        part.map(function (x) { return x >= 32 && x < 127 ? String.fromCharCode(x) : "."; }).join(""));
    }
    if (b.length > 512) rows.push("… " + (b.length - 512) + " more bytes");
    return rows.join("\n");
  }
  function fileBox(name, text, tag) {
    if (text && typeof text === "object") {
      var n = (text.hex || "").length / 2;
      return el("div", { class: "k-cx-file", "data-ui": "code.file", "data-kind": "binary" }, [
        el("div", { class: "k-cx-file-h" }, [el("span", { class: "k-cx-file-ic", "aria-hidden": "true", text: "▦" }), el("b", { class: "k-mono", text: name }),
          tag ? el("span", { class: "k-cx-file-tag", text: tag }) : null, el("span", { class: "k-cx-file-n", text: n + " byte" + (n === 1 ? "" : "s") + " · binary" })].filter(Boolean)),
        n ? el("pre", { class: "k-mono k-cx-file-pre", "aria-label": "Bytes in hexadecimal", text: hexDump(text.hex) }) : null
      ].filter(Boolean));
    }
    return el("div", { class: "k-cx-file", "data-ui": "code.file" }, [
      el("div", { class: "k-cx-file-h" }, [el("span", { class: "k-cx-file-ic", "aria-hidden": "true", text: "▤" }), el("b", { class: "k-mono", text: name }),
        tag ? el("span", { class: "k-cx-file-tag", text: tag }) : null,
        el("span", { class: "k-cx-file-n", text: text === "" ? "empty" : splitN(text) + " line" + (splitN(text) === 1 ? "" : "s") })].filter(Boolean)),
      text === "" ? null : el("pre", { class: "k-mono k-cx-file-pre", text: text.replace(/\n$/, "") })
    ].filter(Boolean));
  }
  function splitN(t) { var n = String(t).split("\n").length; return /\n$/.test(t) ? n - 1 : n; }
  function filesPanel(seed, opts) {
    var names = Object.keys(seed || {});
    if (!names.length) return null;
    return el("details", { class: "k-cx-files", "data-ui": "code.files", open: (opts && opts.open) || names.length === 1 ? "" : null }, [
      el("summary", { class: "k-cx-files-s" }, [names.length === 1 ? "File on the in-app disk: " : "Files on the in-app disk: ", el("span", { class: "k-mono", text: names.join(", ") })]),
      el("div", { class: "k-cx-files-b" }, names.map(function (n) { return fileBox(n, seed[n]); }))
    ]);
  }
  function writtenPanel(seed, after) {
    if (!after) return null;
    seed = seed || {};
    var same = function (x, y) { return x === y || (x && y && typeof x === "object" && typeof y === "object" && x.hex === y.hex); };
    var changed = Object.keys(after).filter(function (n) { return !same(after[n], seed[n]); });
    var gone = Object.keys(seed).filter(function (n) { return !(n in after); });
    if (!changed.length && !gone.length) return null;
    return el("div", { class: "k-cx-written", "data-ui": "code.files-written" }, [el("span", { class: "k-cx-out-k", text: "Files after the run" })]
      .concat(changed.map(function (n) { return fileBox(n, after[n], n in seed ? "changed" : "new"); }))
      .concat(gone.map(function (n) { return el("p", { class: "k-cx-note", text: n + " was deleted." }); })));
  }

  /* ---------------- a runnable listing in notes ---------------- */
  /* run: { id, src, cap, stdin, out } — Run · Reset · Copy, the output
     under it, the error line marked. Editing never changes the lesson. */
  function listing(run, opts) {
    opts = opts || {};
    var orig = String(run.src || "").replace(/\n+$/, "");
    var out = el("div", { class: "k-cx-out", "data-ui": "code.listing-out", hidden: "" });
    var ed = null;
    var reset = el("button", { type: "button", class: "k-btn k-btn--sm k-btn--quiet", "data-ui": "code.listing-reset", text: "Reset", disabled: "",
      onclick: function () { ed.set(orig); ed.state("ready"); reset.disabled = true; out.hidden = true; } });
    var copy = el("button", { type: "button", class: "k-btn k-btn--sm k-btn--quiet", "data-ui": "code.listing-copy", text: "Copy",
      onclick: function () {
        var done = function () { copy.textContent = "Copied"; KOS.a11y && KOS.a11y.announce && KOS.a11y.announce("Copied."); setTimeout(function () { copy.textContent = "Copy"; }, 1400); };
        try { navigator.clipboard.writeText(ed.value).then(done, done); } catch (e) { done(); }
      } });
    var runBtn = el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "code.listing-run", text: "▶ Run", onclick: go });
    ed = editor({ value: orig, file: run.cap || "Listing", compact: true, noBar: true, label: "Listing" + (run.cap ? ": " + run.cap : ""),
      actions: [runBtn, reset, copy],
      onRun: go,
      onChange: function (v) { reset.disabled = v === orig; } });
    var fig = el("figure", { class: "k-cx-listing", "data-ui": "code.listing", "data-lid": run.id || null }, [filesPanel(run.fs), ed.el, out].filter(Boolean));
    function go() {
      if (runBtn.disabled) return;
      runBtn.disabled = true;
      ed.running(true);
      KOS.codeRun.run({ files: ed.files(), stdin: run.stdin || "", fs: run.fs, lesson: opts.lesson }).then(function (r) {
        runBtn.disabled = false;
        ed.running(false);
        out.hidden = false;
        out.innerHTML = "";
        if (r.error && r.error.kind === "runtime") { ed.state("ready"); out.appendChild(runtimeCard({ onReady: go })); return; }
        out.appendChild(el("span", { class: "k-cx-out-k", text: "Output" }));
        if (r.ok) {
          ed.state("pass", "Ran");
          ed.mark(0);
          out.appendChild(el("pre", { class: "k-cx-out-pre k-mono", text: r.stdout ? r.stdout.replace(/\n$/, "") : "(no output)" }));
          KOS.a11y && KOS.a11y.announce && KOS.a11y.announce("Runs. Output: " + (KOS.codeRun.firstLine(r.stdout) || "nothing") + ".");
        } else {
          var e = r.error || {};
          ed.state(e.kind === "compile" ? "compile" : e.kind === "timeout" ? "timeout" : "exception",
            e.kind === "compile" ? "1 compile error" : e.kind === "timeout" ? "Did not finish" : "Stopped: exception");
          if (e.line) ed.mark(e.line, quoted(e.msg));
          if (r.stdout) out.appendChild(el("pre", { class: "k-cx-out-pre k-mono", text: r.stdout.replace(/\n$/, "") }));
          out.appendChild(el("p", { class: "k-cx-out-err k-mono", "data-kind": e.kind, text: "✗ " + (e.kind === "timeout" ? "Did not finish" : e.code) + (e.line ? " · line " + e.line : "") + " · " + e.msg }));
          KOS.a11y && KOS.a11y.announce && KOS.a11y.announce(e.kind === "compile" ? "Compile error " + e.code + (e.line ? " on line " + e.line : "") + "."
            : e.kind === "timeout" ? "Did not finish." : "Stopped: " + e.code + (e.line ? " on line " + e.line : "") + ".");
        }
        var wp = writtenPanel(run.fs, r.fs);
        if (wp) out.appendChild(wp);
        var wn = warningsPanel(r.warnings);
        if (wn) out.appendChild(wn);
        if (opts.onRun) opts.onRun(run.id, r);
      });
    }
    return fig;
  }
  /* turn every listing placeholder a notes render left into a live one */
  function mountListings(root, ref) {
    var c = KOS.content.get("code", ref);
    if (!root || !c) return;
    var byId = {};
    KOS.code.listingsOf(ref).forEach(function (r) { byId[r.id] = r; });
    [].forEach.call(root.querySelectorAll("[data-ui~='code.listing-slot']"), function (slot) {
      var r = byId[slot.getAttribute("data-lid")];
      if (!r) return;
      slot.parentNode.replaceChild(listing(r, { lesson: ref, onRun: function (id) {
        KOS.code.markListing(ref, id);
        /* the inspector's checks follow the evidence (frame 26c) */
        document.dispatchEvent(new window.CustomEvent("kos:code-evidence", { detail: { ref: ref } }));
      } }), slot);
    });
  }

  /* ---------------- the phone's symbol key bar ---------------- */
  function keyBar(input) {
    var keys = ["Tab", "{", "}", "(", ")", ";", "\"", "=", "<", ">"];
    var bar = el("div", { class: "k-cx-keys", "data-ui": "code.keybar", "data-scroller": "true", role: "toolbar", "aria-label": "Symbols" }, keys.map(function (k) {
      return el("button", { type: "button", class: "k-cx-key", text: k, "aria-label": k === "Tab" ? "Indent" : "Insert " + k,
        onmousedown: function (e) { e.preventDefault(); },
        onclick: function () {
          var t = k === "Tab" ? "    " : k;
          var s = input.selectionStart, e = input.selectionEnd;
          if (typeof input.setRangeText === "function") input.setRangeText(t, s, e, "end");
          else input.value = input.value.slice(0, s) + t + input.value.slice(e);
          input.dispatchEvent(new window.Event("input", { bubbles: true }));
          input.focus();
        } });
    }));
    return bar;
  }

  KOS.codeUI = {
    highlight: highlight, highlightLines: highlightLines, editor: editor, errorCard: errorCard, results: results,
    diffView: diffView, reward: reward, payText: payText, hintLadder: hintLadder, evidence: evidence,
    strands: strands, where: where, dot: dot, daysText: daysText, chip: chip, stagePath: stagePath,
    listing: listing, mountListings: mountListings, keyBar: keyBar, quoted: quoted, hm: hm,
    filesPanel: filesPanel, writtenPanel: writtenPanel,
    runtimeCard: runtimeCard, runtimeOffer: runtimeOffer, warningsPanel: warningsPanel
  };
})();
