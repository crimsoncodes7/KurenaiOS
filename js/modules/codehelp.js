/* Kurenai OS — modules/codehelp.js
   The Code editor's live help (1C, UR-23), attached by KOS.codeUI.editor
   to every C# editor you write in (the task, the capstone); the bug hunt
   and retrieval pass assist: false, where help would give an answer away.

     PROBLEMS   the compiler's own errors and warnings, squiggled under
                their spans as you type (650 ms after the last key), marked
                in the gutter, and named in the status bar: the problem on
                the caret's line, else the first; the line is a button that
                selects the next problem. An edit moves the squiggles with
                their words until the compiler answers again.
     SUGGEST    the names that fit at the caret: after a dot (a type's
                statics, a value's members, extension methods after the
                type's own), while typing a name (what is in scope, then
                keywords), or on Ctrl+Space. ↑↓ choose, Enter or Tab
                inserts, Esc closes (and only closes).

   Both come from Roslyn in the full runtime's worker (KOS.codeRun.assist →
   Runner.Assist in tools/cs-wasm/Assist.cs), which compiles and never runs
   anything (invariant 105). Without the runtime there are no squiggles, and
   suggestions are only the keywords and the names already in the file.
   Loaded with page-code (invariant 168): the editor works without it.      */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var el = KOS.ui.el, esc = KOS.ui.esc;

  var KIND_MARK = {};
  ("local x parameter p field f property P method m event e constant c class C struct S record R interface I enum E " +
   "delegate D namespace N type T keyword k word w").split(" ").forEach(function (w, i, a) { if (i % 2 === 0) KIND_MARK[w] = a[i + 1]; });
  function keywords() { return KOS.codeUI && KOS.codeUI.KW || {}; }
  var EXTRA = "Console WriteLine ReadLine Write Parse List Dictionary Join Length Count Add Math".split(" ");

  /* a squiggle's span, moved by an edit: the text before and after share a
     start and an end; a squiggle the edit touched waits for the compiler */
  function shiftMarks(marks, before, after) {
    var a = 0, n = Math.min(before.length, after.length);
    while (a < n && before.charCodeAt(a) === after.charCodeAt(a)) a++;
    var b = 0;
    while (b < n - a && before.charCodeAt(before.length - 1 - b) === after.charCodeAt(after.length - 1 - b)) b++;
    var oldEnd = before.length - b, delta = after.length - before.length;
    return marks.filter(function (m) { return m.e < a || m.s > oldEnd; })
      .map(function (m) { return m.s >= oldEnd ? Object.assign({}, m, { s: m.s + delta, e: m.e + delta }) : m; });
  }
  /* the squiggle layer: the same text, invisible, each problem's span underlined */
  function diagHtml(text, marks) {
    var out = "", i = 0;
    marks.slice().sort(function (x, y) { return x.s - y.s || (x.sev === "error" ? -1 : 1); }).forEach(function (m) {
      var s = Math.max(m.s, i), e = Math.min(Math.max(m.e, m.s + 1), text.length);
      if (text.charAt(s) === "\n" && s > i) { s--; e = s + 1; }
      if (s >= text.length) { if (i < text.length || !out) { out += esc(text.slice(i)) + '<span class="k-ced-dsq" data-sev="' + m.sev + '"> </span>'; i = text.length; } return; }
      if (e <= s) return;
      out += esc(text.slice(i, s)) + '<span class="k-ced-dsq" data-sev="' + m.sev + '">' + esc(text.slice(s, e)) + "</span>";
      i = e;
    });
    return out + esc(text.slice(i)) + "\n ";
  }
  function lineOf(text, at) { var n = 1; for (var i = 0; i < at && i < text.length; i++) if (text.charCodeAt(i) === 10) n++; return n; }
  /* without the runtime: keywords and the file's own words, from two letters */
  function localWords(text, start, prefix) {
    if (prefix.length < 2) return [];
    var KW = keywords(), seen = {}, out = [], p = prefix.toLowerCase(), re = /[A-Za-z_]\w*/g, m;
    function add(w) { if (!seen[w] && w.length > prefix.length && w.toLowerCase().indexOf(p) === 0) { seen[w] = 1; out.push({ l: w, k: KW[w] ? "keyword" : "word", d: "" }); } }
    while ((m = re.exec(text))) if (m.index !== start) add(m[0]);
    Object.keys(KW).concat(EXTRA).forEach(add);
    return out.sort(function (x, y) { return x.l.localeCompare(y.l); }).slice(0, 30);
  }
  function say(m) { if (KOS.a11y && KOS.a11y.announce) KOS.a11y.announce(m); }

  /* c: { id, file, opts, ta, body, gutter, wrap, bar, hint, hooks, paint, pos, changed } */
  function attach(c) {
    var ta = c.ta, file = c.file, opts = c.opts, hk = c.hooks;
    var nullable = opts.nullable != null ? !!opts.nullable : !!(opts.lesson && KOS.code && KOS.code.runnerFor && KOS.code.runnerFor(opts.lesson) === "wasm");
    var marks = [], asked = false, diagT = null, diagBusy = false, diagAgain = false, lastText = ta.value;
    var pop = { open: false, items: [], sel: 0, start: 0, end: 0, seq: 0, t: null };
    var dpre = el("pre", { class: "k-ced-hl k-ced-diag", "data-ui": "code.editor-squiggles", "aria-hidden": "true" });
    c.wrap.insertBefore(dpre, ta);
    var popEl = el("ul", { class: "k-ced-pop", id: c.id + "-pop", role: "listbox", "data-ui": "code.editor-complete", "aria-label": "Suggestions", hidden: "" });
    c.body.appendChild(popEl);
    var probs = el("button", { type: "button", class: "k-ced-probs", "data-ui": "code.editor-problems", hidden: "", onclick: function () { nextProblem(); } });
    c.bar.insertBefore(probs, c.hint);
    [" · ", el("kbd", { text: "Ctrl" }), "+", el("kbd", { text: "Space" }), " suggests"].forEach(function (n) { c.hint.appendChild(typeof n === "string" ? document.createTextNode(n) : n); });
    ta.setAttribute("aria-autocomplete", "list");
    ta.setAttribute("aria-controls", popEl.id);

    function assist(req) { return KOS.codeRun && KOS.codeRun.assist ? KOS.codeRun.assist(req) : Promise.resolve(null); }
    function allFiles() { return opts.files ? opts.files(ta.value) : [{ name: file, src: ta.value }]; }

    /* ---- the problems ---- */
    function askProblems(now) { clearTimeout(diagT); diagT = setTimeout(sendProblems, now ? 0 : 650); }
    function sendProblems() {
      if (diagBusy) { diagAgain = true; return; }
      diagBusy = true;
      var src = ta.value;
      assist({ files: allFiles(), nullable: nullable, diag: true }).then(function (r) {
        diagBusy = false;
        if (r && r.diags && ta.value === src) {
          asked = true;
          marks = r.diags.filter(function (d) { return d.file === file; }).map(function (d) { return { s: d.s, e: d.e, sev: d.sev, code: d.code, msg: d.msg }; });
          lastText = src;
          c.paint(); sayProblems();
        }
        if (diagAgain || (r && ta.value !== src)) { diagAgain = false; askProblems(); }
      }, function () { diagBusy = false; });
    }
    /* the status bar names the problem on the caret's line, else the first */
    function sayProblems() {
      if (!marks.length) { probs.hidden = true; probs.textContent = ""; return; }
      var errs = marks.filter(function (m) { return m.sev === "error"; }).length, warns = marks.length - errs;
      var caret = lineOf(ta.value, ta.selectionStart || 0);
      var here = marks.filter(function (m) { return lineOf(ta.value, m.s) === caret; })[0];
      var m = here || marks.slice().sort(function (x, y) { return (x.sev === "error" ? 0 : 1) - (y.sev === "error" ? 0 : 1) || x.s - y.s; })[0];
      probs.hidden = false;
      KOS.ui.state(probs, "warn", !errs);
      probs.textContent = (errs ? "✗ " + errs + " error" + (errs > 1 ? "s" : "") : "") + (errs && warns ? " · " : "") +
        (warns ? "⚠ " + warns + " warning" + (warns > 1 ? "s" : "") : "") + " — Ln " + lineOf(ta.value, m.s) + ": " + m.msg;
      probs.title = m.code + ": " + m.msg;
      probs.setAttribute("aria-label", probs.textContent + ". Selects the next problem.");
    }
    /* the next problem after the caret, round to the first */
    function nextProblem() {
      if (!marks.length) return;
      var at = ta.selectionStart || 0;
      var sorted = marks.slice().sort(function (x, y) { return x.s - y.s; });
      var m = sorted.filter(function (x) { return x.s > at; })[0] || sorted[0];
      ta.focus();
      ta.selectionStart = m.s; ta.selectionEnd = Math.max(m.s, Math.min(m.e, ta.value.length));
      c.pos();
      say("Line " + lineOf(ta.value, m.s) + ": " + m.msg);
    }

    /* ---- suggestions ---- */
    function wordStart(v, at) { var s = at; while (s > 0 && /\w/.test(v.charAt(s - 1))) s--; return s; }
    function closePop() {
      clearTimeout(pop.t); pop.seq++;
      if (!pop.open) return;
      pop.open = false; popEl.hidden = true; popEl.innerHTML = "";
      ta.removeAttribute("aria-activedescendant");
    }
    function askComplete(explicit) {
      clearTimeout(pop.t);
      pop.t = setTimeout(function () { sendComplete(explicit); }, explicit ? 0 : 120);
    }
    function sendComplete(explicit) {
      var v = ta.value, at = ta.selectionStart || 0;
      if (at !== ta.selectionEnd) return closePop();
      var start = wordStart(v, at), prefix = v.slice(start, at);
      var k = start - 1; while (k >= 0 && (v.charAt(k) === " " || v.charAt(k) === "\t")) k--;
      var member = v.charAt(k) === ".";
      if (/^\d/.test(prefix) || (!prefix && !member && !explicit)) return closePop();
      var seq = ++pop.seq;
      assist({ files: allFiles(), nullable: nullable, diag: false, file: file, pos: at, explicit: !!explicit }).then(function (r) {
        if (seq !== pop.seq || ta.value !== v || ta.selectionStart !== at) return;
        var items = r && r.complete ? r.complete.items : r || member ? [] : localWords(v, start, prefix);
        showPop(items, r && r.complete ? r.complete.start : start, at, prefix, explicit);
      });
    }
    function showPop(items, start, end, prefix, explicit) {
      if (!items.length) { closePop(); if (explicit) say("No suggestions."); return; }
      var opened = !pop.open;
      pop.open = true; pop.items = items; pop.sel = 0; pop.start = start; pop.end = end;
      popEl.innerHTML = "";
      items.forEach(function (it, i) {
        var lab = el("span", { class: "k-ced-pop-l" });
        var cut = prefix && it.l.toLowerCase().indexOf(prefix.toLowerCase()) === 0 ? prefix.length : 0;
        if (cut) lab.appendChild(el("b", { text: it.l.slice(0, cut) }));
        lab.appendChild(document.createTextNode(it.l.slice(cut)));
        var li = el("li", { class: "k-ced-pop-i", id: c.id + "-opt-" + i, role: "option", "aria-selected": i === 0 ? "true" : "false", "data-k": it.k,
          "aria-label": it.l + ", " + it.k + (it.d ? ", " + it.d : "") }, [
          el("span", { class: "k-ced-pop-k", "aria-hidden": "true", text: KIND_MARK[it.k] || "·" }), lab,
          it.d ? el("span", { class: "k-ced-pop-d", text: it.d }) : null].filter(Boolean));
        li.addEventListener("pointerdown", function (e) { e.preventDefault(); });
        li.addEventListener("click", function () { pop.sel = i; accept(); });
        popEl.appendChild(li);
      });
      popEl.hidden = false;
      place();
      selectPop(0);
      if (opened && explicit) say(items.length + " suggestion" + (items.length > 1 ? "s" : "") + ". Up and down choose, Enter inserts.");
    }
    function selectPop(i) {
      var n = pop.items.length;
      pop.sel = (i + n) % n;
      Array.prototype.forEach.call(popEl.children, function (li, j) { li.setAttribute("aria-selected", j === pop.sel ? "true" : "false"); });
      var cur = popEl.children[pop.sel];
      ta.setAttribute("aria-activedescendant", cur.id);
      if (cur.scrollIntoView) cur.scrollIntoView({ block: "nearest" });
    }
    function accept() {
      var it = pop.items[pop.sel];
      if (!it) return closePop();
      var end = ta.selectionStart || pop.end;
      if (typeof ta.setRangeText === "function") ta.setRangeText(it.l, pop.start, end, "end");
      else { ta.value = ta.value.slice(0, pop.start) + it.l + ta.value.slice(end); ta.selectionStart = ta.selectionEnd = pop.start + it.l.length; }
      closePop();
      c.changed();
    }
    /* under the word being typed, flipped above near the editor's bottom */
    var cv = null;
    function place() {
      var body = c.body, cs = window.getComputedStyle ? window.getComputedStyle(ta) : null;
      var lh = cs ? parseFloat(cs.lineHeight) || 20 : 20, padT = cs ? parseFloat(cs.paddingTop) || 0 : 0, padL = cs ? parseFloat(cs.paddingLeft) || 0 : 0;
      var cw = 8;
      try { cv = cv || document.createElement("canvas").getContext("2d"); if (cv && cs) { cv.font = cs.font; cw = cv.measureText("0000000000").width / 10 || 8; } } catch (e) { /* no canvas: the estimate */ }
      var before = ta.value.slice(0, pop.start), line = before.split("\n").length - 1, col = before.length - before.lastIndexOf("\n") - 1;
      var x = c.gutter.offsetWidth + padL + col * cw, y = padT + (line + 1) * lh;
      var h = popEl.offsetHeight || 0, w = popEl.offsetWidth || 0;
      if (h && y + h > body.scrollTop + body.clientHeight && y - lh - h >= body.scrollTop) y = y - lh - h;
      if (w && x + w > body.scrollLeft + body.clientWidth) x = Math.max(body.scrollLeft, body.scrollLeft + body.clientWidth - w);
      popEl.style.setProperty("--ced-pop-x", x + "px"); popEl.style.setProperty("--ced-pop-y", y + "px");
    }

    /* ---- the editor's hooks ---- */
    hk.lines = function () {
      var sevAt = {};
      marks.forEach(function (m) { var l = lineOf(ta.value, m.s); if (sevAt[l] !== "error") sevAt[l] = m.sev; });
      return sevAt;
    };
    hk.paint = function () { dpre.innerHTML = marks.length ? diagHtml(ta.value, marks) : ""; };
    hk.pos = sayProblems;
    hk.edit = function () {
      if (marks.length) marks = shiftMarks(marks, lastText, ta.value);
      lastText = ta.value;
      askProblems();
    };
    hk.input = function (ev) {
      var ch = ev && ev.data != null ? String(ev.data).slice(-1) : "";
      if (ev && ev.inputType === "insertText" && (ch === "." || /\w/.test(ch))) askComplete(false);
      else if (pop.open && ev && /^deleteContent/.test(ev.inputType || "")) askComplete(false);
      else closePop();
    };
    hk.focus = function () { if (!asked) askProblems(true); };
    hk.blur = closePop;
    hk.reset = function () { marks = []; asked = false; lastText = ta.value; closePop(); sayProblems(); };
    /* the list takes the arrows, Enter, Tab and Esc while it is open; true = handled */
    hk.keydown = function (ev) {
      if (pop.open) {
        if (ev.key === "ArrowDown" || ev.key === "ArrowUp") { ev.preventDefault(); selectPop(pop.sel + (ev.key === "ArrowDown" ? 1 : -1)); return true; }
        if ((ev.key === "Enter" || ev.key === "Tab") && !ev.shiftKey && !ev.ctrlKey && !ev.metaKey) { ev.preventDefault(); accept(); return true; }
        if (ev.key === "Escape") { ev.preventDefault(); closePop(); return true; }
        if (/^(ArrowLeft|ArrowRight|Home|End|PageUp|PageDown)$/.test(ev.key)) closePop();
      }
      if (ev.ctrlKey && (ev.key === " " || ev.code === "Space")) { ev.preventDefault(); askComplete(true); return true; }
      return false;
    };
  }

  KOS.codeHelp = { attach: attach, shiftMarks: shiftMarks, diagHtml: diagHtml };
})();
