/* Kurenai OS — modules/editor.js
   The study editor: the side panel that makes a topic page's material
   editable in place. One panel, five kinds — Specification, Notes,
   Flashcards, Quiz, Exam questions — mounted by hub.js where the study
   inspector normally sits, editing the effective material through
   KOS.edits (core/edits.js) and re-rendering the page beside it on every
   change, so what you see IS the preview.

   Notes and the Specification are lists of content.js blocks: every block
   type the renderer knows (paragraph, Markdown, heading, lists, key-value
   pairs, tables, code, the seven callouts, step-by-step, worked examples,
   interactive-diagram links, raw SVG and page dividers) can be added,
   edited, reordered, duplicated and removed. Text fields take the inline
   markup (`code`, **bold**, *italic*, [links]) and KaTeX ($…$ and $$…$$);
   the Markdown block takes a whole document fragment.

   Flashcards, Quiz and Exam questions are row editors over the same
   shapes the engines read, so a question edited here is the question the
   session asks next. A curriculum flashcard keeps its SM-2 key through
   every edit (core/edits.js), so rewording it never resets its schedule.

   Persistence is immediate and permanent: each change writes the fork
   through KOS.edits.set → store.save → cloud sync. "Reset to curriculum"
   deletes the fork and the shipped material returns untouched.

   KOS.editor.mount(host, {sid, ref, kind, onChange(kind, hint), onClose})
     → { setKind(kind), select(blockId), destroy() }                       */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var el = KOS.ui.el;

  var KIND_LABEL = { spec: "Specification", notes: "Notes", flashcards: "Flashcards", quiz: "Quiz", exam: "Exam questions" };

  /* ---------------- block vocabulary ---------------- */
  var TYPES = [
    { t: "p",        label: "Paragraph",       hint: "Plain text with inline markup and $maths$; a new line is a line break" },
    { t: "md",       label: "Markdown",        hint: "A whole fragment: headings, lists, fences, tables, quotes" },
    { t: "h",        label: "Heading",         hint: "A sub-heading inside the page" },
    { t: "ul",       label: "Bullet list",     hint: "One item per line" },
    { t: "ol",       label: "Numbered list",   hint: "One item per line" },
    { t: "kv",       label: "Key terms",       hint: "Term :: Definition, one per line" },
    { t: "table",    label: "Table",           hint: "Header row, then rows; cells split on |" },
    { t: "code",     label: "Code block",      hint: "With a language and caption" },
    { t: "callout",  label: "Callout",         hint: "Information, definition, tip, watch out, misconception, mnemonic, must-memorise, formula" },
    { t: "steps",    label: "Step by step",    hint: "Numbered steps with heading, working and note" },
    { t: "worked",   label: "Worked example",  hint: "Tagged steps and an answer line" },
    { t: "diagram",  label: "Diagram link",    hint: "Opens an interactive simulation" },
    { t: "svg",      label: "SVG figure",      hint: "Raw inline SVG with a caption" },
    { t: "page",     label: "Page break",      hint: "Starts a new named page here" }
  ];
  function typeOf(b) {
    if (!b || typeof b !== "object") return "p";
    for (var i = 0; i < TYPES.length; i++) if (b[TYPES[i].t] != null) return TYPES[i].t;
    return "raw";
  }
  function typeLabel(b) {
    var t = typeOf(b);
    if (t === "callout") return (KOS.content.CALLOUT_META[b.callout.t] || {}).label || "Callout";
    for (var i = 0; i < TYPES.length; i++) if (TYPES[i].t === t) return TYPES[i].label;
    return "Block";
  }
  function fresh(t) {
    switch (t) {
      case "p": return { p: "" };
      case "md": return { md: "" };
      case "h": return { h: "Heading" };
      case "ul": return { ul: [""] };
      case "ol": return { ol: [""] };
      case "kv": return { kv: [["Term", "Definition"]] };
      case "table": return { table: { head: ["Column", "Column"], rows: [["", ""]] } };
      case "code": return { code: { lang: "pseudo", src: "", cap: "" } };
      case "callout": return { callout: { t: "tip", h: "", body: [{ md: "" }] } };
      case "steps": return { steps: [{ h: "", m: "", n: "" }] };
      case "worked": return { worked: { tag: "example", title: "", steps: [{ h: "", m: "", n: "" }], result: "" } };
      case "diagram": return { diagram: "" };
      case "svg": return { svg: { src: "<svg viewBox=\"0 0 200 100\" xmlns=\"http://www.w3.org/2000/svg\"></svg>", cap: "" } };
      case "page": return { page: "New page" };
    }
    return { p: "" };
  }
  /* a one-line summary for the collapsed block row */
  function summary(b) {
    var t = typeOf(b), s = "";
    if (t === "p") s = b.p; else if (t === "md") s = b.md; else if (t === "h") s = b.h;
    else if (t === "ul") s = (b.ul || []).join(" · "); else if (t === "ol") s = (b.ol || []).join(" · ");
    else if (t === "kv") s = (b.kv || []).map(function (p) { return p[0]; }).join(" · ");
    else if (t === "table") s = (b.table.head || []).join(" | ");
    else if (t === "code") s = (b.code.lang ? b.code.lang + " · " : "") + (b.code.cap || b.code.src || "");
    else if (t === "callout") s = b.callout.h || textOf(b.callout.body);
    else if (t === "steps") s = b.steps.length + " step" + (b.steps.length === 1 ? "" : "s");
    else if (t === "worked") s = b.worked.title || (b.worked.steps || []).length + " steps";
    else if (t === "diagram") s = b.diagram; else if (t === "svg") s = b.svg.cap || "inline SVG";
    else if (t === "page") s = b.page; else s = JSON.stringify(b);
    s = String(s || "").replace(/\s+/g, " ").trim();
    return s.length > 70 ? s.slice(0, 68) + "…" : s;
  }
  function textOf(body) {
    if (typeof body === "string") return body;
    return (body || []).map(function (x) { return typeof x === "string" ? x : (x.p || x.md || x.h || ""); }).join(" ");
  }

  /* A callout body is a list of blocks; the editor offers it as one
     Markdown field. Shipped bodies are turned into Markdown once, on the
     way in, and stored back as a single {md} block. */
  function blocksToMarkdown(blocks) {
    if (typeof blocks === "string") return blocks;
    return (blocks || []).map(function (b) {
      if (typeof b === "string") return b;
      var t = typeOf(b);
      if (t === "p") return b.p;
      if (t === "md") return b.md;
      if (t === "h") return "### " + b.h;
      if (t === "ul") return b.ul.map(function (i) { return "- " + i; }).join("\n");
      if (t === "ol") return b.ol.map(function (i, n) { return (n + 1) + ". " + i; }).join("\n");
      if (t === "kv") return b.kv.map(function (p) { return "- **" + p[0] + "** — " + p[1]; }).join("\n");
      if (t === "code") return "```" + (b.code.lang || "") + "\n" + (b.code.src || "") + "\n```";
      if (t === "table") return "| " + b.table.head.join(" | ") + " |\n|" + b.table.head.map(function () { return " --- |"; }).join("") + "\n" +
        b.table.rows.map(function (r) { return "| " + r.join(" | ") + " |"; }).join("\n");
      return textOf([b]);
    }).join("\n\n");
  }

  /* ---------------- small form helpers ---------------- */
  function field(label, control, hint) {
    return el("label", { class: "ed-field" }, [
      el("span", { class: "ed-lbl", text: label }),
      control,
      hint ? el("span", { class: "ed-hint", text: hint }) : null
    ]);
  }
  function area(value, rows, oninput, placeholder) {
    var ta = el("textarea", { class: "ed-ta", rows: rows || 3, placeholder: placeholder || "", oninput: function () { oninput(ta.value); } });
    ta.value = value == null ? "" : String(value);
    /* grow with the text so a long paragraph is never edited through a slit */
    var grow = function () { ta.style.height = "auto"; ta.style.height = Math.min(480, ta.scrollHeight + 2) + "px"; };
    ta.addEventListener("input", grow);
    setTimeout(grow, 0);
    return ta;
  }
  function input(value, oninput, placeholder, type) {
    var i = el("input", { class: "ed-in", type: type || "text", placeholder: placeholder || "", oninput: function () { oninput(i.value); } });
    i.value = value == null ? "" : String(value);
    return i;
  }
  function select(value, options, onchange) {
    var s = el("select", { class: "ed-sel", onchange: function () { onchange(s.value); } },
      options.map(function (o) { return el("option", { value: o[0], text: o[1] }); }));
    s.value = value;
    return s;
  }
  function lines(arr) { return (arr || []).join("\n"); }
  function splitLines(v) { return String(v).split("\n").map(function (x) { return x.replace(/\s+$/, ""); }).filter(function (x) { return x.trim(); }); }
  function iconBtn(label, glyph, onclick, cls) {
    return el("button", { class: "ed-ib" + (cls ? " " + cls : ""), type: "button", "aria-label": label, title: label, onclick: onclick }, [glyph]);
  }

  var HELP = [
    ["↵ new line", "line break · a blank line starts a new paragraph"],
    ["`code`", "inline code"], ["**bold**", "bold"], ["*italic*", "italic"], ["~~struck~~", "strikethrough"],
    ["[text](https://…)", "link"], ["$x^2$", "inline maths (KaTeX)"], ["$$\\frac{a}{b}$$", "display maths"],
    ["# Heading", "Markdown heading (Markdown block)"], ["- item / 1. item", "lists (Markdown block)"],
    ["```lang … ```", "fenced code (Markdown block)"], ["| a | b |", "pipe table (Markdown block)"], ["> quote", "block quote (Markdown block)"]
  ];
  function helpPanel() {
    var d = el("details", { class: "ed-help" }, [
      el("summary", { text: "Formatting" }),
      el("dl", {}, HELP.reduce(function (acc, h) {
        acc.push(el("dt", {}, [el("code", { text: h[0] })]));
        acc.push(el("dd", { text: h[1] }));
        return acc;
      }, []))
    ]);
    return d;
  }

  /* ---------------- the block form ---------------- */
  /* Renders the controls for one block. `commit()` is called after every
     keystroke; `rebuild()` when the block's shape changed (type, a step
     added) so the form and the row summary redraw. */
  function blockForm(b, commit, rebuild) {
    var t = typeOf(b);
    var f = el("div", { class: "ed-form" });
    if (t === "p") f.appendChild(field("Text", area(b.p, 3, function (v) { b.p = v; commit(); }, "Paragraph text — inline markup and $maths$ allowed")));
    else if (t === "md") f.appendChild(field("Markdown", area(b.md, 8, function (v) { b.md = v; commit(); }, "# Heading\n\nText with **bold**, lists, fences, tables…")));
    else if (t === "h") f.appendChild(field("Heading", input(b.h, function (v) { b.h = v; commit(); })));
    else if (t === "ul" || t === "ol") f.appendChild(field("Items", area(lines(b[t]), 4, function (v) { b[t] = splitLines(v); commit(); }, "One item per line"), "One item per line"));
    else if (t === "kv") f.appendChild(field("Pairs", area((b.kv || []).map(function (p) { return p[0] + " :: " + p[1]; }).join("\n"), 5, function (v) {
      b.kv = splitLines(v).map(function (l) { var i = l.indexOf("::"); return i === -1 ? [l.trim(), ""] : [l.slice(0, i).trim(), l.slice(i + 2).trim()]; });
      commit();
    }), "Term :: Definition — one pair per line"));
    else if (t === "table") {
      var tb = b.table;
      var text = [tb.head.join(" | ")].concat(tb.rows.map(function (r) { return r.join(" | "); })).join("\n");
      f.appendChild(field("Cells", area(text, 6, function (v) {
        var rows = splitLines(v).map(function (l) { return l.split("|").map(function (c) { return c.trim(); }); });
        tb.head = rows.shift() || [""];
        tb.rows = rows.map(function (r) { while (r.length < tb.head.length) r.push(""); return r.slice(0, tb.head.length); });
        commit();
      }), "First line is the header; cells split on |"));
    }
    else if (t === "code") {
      var c = b.code;
      f.appendChild(field("Language", select(c.lang || "", [["", "none"], ["pseudo", "Pseudocode"], ["csharp", "C#"], ["python", "Python"], ["js", "JavaScript"], ["sql", "SQL"], ["vb", "VB.NET"], ["text", "Plain"]], function (v) { c.lang = v; commit(); })));
      f.appendChild(field("Source", area(c.src, 8, function (v) { c.src = v; commit(); })));
      f.appendChild(field("Caption", input(c.cap, function (v) { c.cap = v; commit(); })));
    }
    else if (t === "callout") {
      var co = b.callout;
      f.appendChild(field("Type", select(co.t || "tip", Object.keys(KOS.content.CALLOUT_META).map(function (k) { return [k, KOS.content.CALLOUT_META[k].label]; }), function (v) { co.t = v; commit(); rebuild(); })));
      f.appendChild(field("Heading", input(co.h, function (v) { co.h = v; commit(); }, "leave blank for the type's own label")));
      var bodyMd = Array.isArray(co.body) && co.body.length === 1 && co.body[0] && co.body[0].md != null ? co.body[0].md : blocksToMarkdown(co.body);
      f.appendChild(field("Body", area(bodyMd, 5, function (v) { co.body = [{ md: v }]; commit(); }), "Markdown"));
    }
    else if (t === "steps" || t === "worked") {
      var stepsArr = t === "steps" ? b.steps : b.worked.steps;
      if (t === "worked") {
        f.appendChild(field("Tag", select(b.worked.tag || "example", [["example", "Worked example"], ["exam", "Exam-style"], ["variation", "Variation"], ["check", "Check"]], function (v) { b.worked.tag = v; commit(); })));
        f.appendChild(field("Title", input(b.worked.title, function (v) { b.worked.title = v; commit(); })));
      }
      var list = el("div", { class: "ed-steps" });
      stepsArr.forEach(function (st, i) {
        if (typeof st === "string") stepsArr[i] = st = { h: "", m: "", n: st };
        list.appendChild(el("div", { class: "ed-step" }, [
          el("div", { class: "ed-step-h" }, [
            el("b", { text: "Step " + (i + 1) }),
            iconBtn("Move step up", "▲", function () { if (i > 0) { stepsArr.splice(i - 1, 0, stepsArr.splice(i, 1)[0]); commit(); rebuild(); } }),
            iconBtn("Move step down", "▼", function () { if (i < stepsArr.length - 1) { stepsArr.splice(i + 1, 0, stepsArr.splice(i, 1)[0]); commit(); rebuild(); } }),
            iconBtn("Remove step", "✕", function () { stepsArr.splice(i, 1); commit(); rebuild(); }, "danger")
          ]),
          input(st.h, function (v) { st.h = v; commit(); }, "Heading (optional)"),
          area(st.m, 2, function (v) { st.m = v; commit(); }, "Working / maths"),
          area(st.n, 2, function (v) { st.n = v; commit(); }, "Note (optional)")
        ]));
      });
      f.appendChild(list);
      f.appendChild(el("button", { class: "btn ed-add-step", type: "button", text: "+ Add step", onclick: function () { stepsArr.push({ h: "", m: "", n: "" }); commit(); rebuild(); } }));
      if (t === "worked") f.appendChild(field("Answer", input(b.worked.result, function (v) { b.worked.result = v; commit(); })));
    }
    else if (t === "diagram") {
      var sims = KOS.sims && KOS.sims.all ? KOS.sims.all() : [];
      f.appendChild(field("Simulation", select(b.diagram || "", [["", "— choose —"]].concat(sims.map(function (s) { return [s.id, s.title + " (" + s.id + ")"]; })), function (v) { b.diagram = v; commit(); rebuild(); })));
    }
    else if (t === "svg") {
      f.appendChild(field("SVG source", area(b.svg.src, 8, function (v) { b.svg.src = v; commit(); }), "Inline <svg> markup — trusted as authored"));
      f.appendChild(field("Caption", input(b.svg.cap, function (v) { b.svg.cap = v; commit(); })));
    }
    else if (t === "page") f.appendChild(field("Page title", input(b.page, function (v) { b.page = v; commit(); rebuild(); })));
    else {
      f.appendChild(field("Block JSON", area(JSON.stringify(b, null, 2), 8, function (v) {
        try { var o = JSON.parse(v); Object.keys(b).forEach(function (k) { if (k !== "id") delete b[k]; }); Object.keys(o).forEach(function (k) { if (k !== "id") b[k] = o[k]; }); commit(); }
        catch (e) { /* keep typing */ }
      }), "An unrecognised block — edited as raw JSON"));
    }
    return f;
  }

  /* ---------------- the block-list editor ---------------- */
  /* blocks: the array to edit (mutated in place). onSave(hint) persists
     and re-renders the page; hint.id names the block to show. */
  function blockList(blocks, onSave, opts) {
    opts = opts || {};
    var wrap = el("div", { class: "ed-blocks" });
    var list = el("div", { class: "ed-list", role: "list" });
    var selected = null;
    var saveTimer = null;
    function commit(id) {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(function () { onSave({ id: id || selected }); }, 250);
    }
    function commitNow(id) { clearTimeout(saveTimer); onSave({ id: id || selected }); }

    function row(b, i) {
      var isPage = typeOf(b) === "page";
      var r = el("div", { class: "ed-block" + (isPage ? " ed-page" : "") + (b.id === selected ? " sel" : ""), role: "listitem", "data-bid": b.id });
      var head = el("button", { class: "ed-block-h", type: "button", "aria-expanded": String(b.id === selected), onclick: function () {
        selected = b.id === selected ? null : b.id;
        redraw();
        if (selected) onSave({ id: selected, focusOnly: true });
      } }, [
        el("span", { class: "ed-type", text: isPage ? "Page" : typeLabel(b) }),
        el("span", { class: "ed-sum", text: summary(b) || "(empty)" })
      ]);
      var tools = el("div", { class: "ed-tools" }, [
        iconBtn("Move up", "▲", function () { if (i > 0) { blocks.splice(i - 1, 0, blocks.splice(i, 1)[0]); commitNow(b.id); redraw(); } }),
        iconBtn("Move down", "▼", function () { if (i < blocks.length - 1) { blocks.splice(i + 1, 0, blocks.splice(i, 1)[0]); commitNow(b.id); redraw(); } }),
        iconBtn("Duplicate", "⧉", function () { var c = JSON.parse(JSON.stringify(b)); c.id = KOS.edits.nextId(); blocks.splice(i + 1, 0, c); selected = c.id; commitNow(c.id); redraw(); }),
        iconBtn("Remove", "✕", function () { blocks.splice(i, 1); if (selected === b.id) selected = null; commitNow(); redraw(); }, "danger")
      ]);
      r.appendChild(el("div", { class: "ed-block-row" }, [head, tools]));
      if (b.id === selected) {
        r.appendChild(blockForm(b, function () { commit(b.id); }, redraw));
        r.appendChild(addMenu(i + 1, "Add block after"));
      }
      return r;
    }
    function addMenu(at, label) {
      var d = el("details", { class: "ed-addmenu" });
      d.appendChild(el("summary", { text: "+ " + (label || "Add block") }));
      d.appendChild(el("div", { class: "ed-addgrid" }, TYPES.map(function (T) {
        return el("button", { class: "ed-addbtn", type: "button", title: T.hint, onclick: function () {
          var nb = fresh(T.t); nb.id = KOS.edits.nextId();
          /* the end-of-list menu is built once, so it asks where the end
             is now rather than where it was */
          blocks.splice(typeof at === "function" ? at() : at, 0, nb);
          selected = nb.id;
          commitNow(nb.id); redraw();
          var ta = list.querySelector('.ed-block.sel textarea, .ed-block.sel input, .ed-block.sel select');
          if (ta) ta.focus();
        } }, [T.label]);
      })));
      return d;
    }
    function redraw() {
      list.innerHTML = "";
      if (!blocks.length) list.appendChild(el("p", { class: "ed-empty", text: opts.emptyText || "Nothing here yet — add the first block." }));
      blocks.forEach(function (b, i) { list.appendChild(row(b, i)); });
      var sel = list.querySelector(".ed-block.sel");
      if (sel && sel.scrollIntoView) sel.scrollIntoView({ block: "nearest" });
    }
    wrap.appendChild(list);
    wrap.appendChild(addMenu(function () { return blocks.length; }, "Add block at the end"));
    redraw();
    return { node: wrap, select: function (id) { selected = id; redraw(); }, redraw: redraw };
  }

  /* ---------------- row editors: flashcards / quiz / exam ---------------- */
  function rowTools(arr, i, commit, redraw, extra) {
    return el("div", { class: "ed-tools" }, [
      iconBtn("Move up", "▲", function () { if (i > 0) { arr.splice(i - 1, 0, arr.splice(i, 1)[0]); commit(); redraw(); } }),
      iconBtn("Move down", "▼", function () { if (i < arr.length - 1) { arr.splice(i + 1, 0, arr.splice(i, 1)[0]); commit(); redraw(); } }),
      iconBtn("Remove", "✕", function () {
        KOS.ui.confirm({ title: "Remove this item?", body: extra && extra.removeBody || "It leaves this topic's material. Reset to curriculum brings the shipped set back.", danger: true, confirm: "Remove" }, function () {
          arr.splice(i, 1); commit(); redraw();
        });
      }, "danger")
    ]);
  }

  function flashcardEditor(sid, ref, onSave) {
    var cards = KOS.edits.material(sid, ref, "flashcards");
    var wrap = el("div", { class: "ed-rows" });
    var list = el("div", { class: "ed-list" });
    var timer = null;
    function commit() { clearTimeout(timer); timer = setTimeout(save, 250); }
    function save() { clearTimeout(timer); KOS.edits.set(sid, ref, "flashcards", cards); onSave(); }
    function redraw() {
      list.innerHTML = "";
      if (!cards.length) list.appendChild(el("p", { class: "ed-empty", text: "No curriculum cards on this topic yet — add one." }));
      cards.forEach(function (c, i) {
        var m = KOS.srs.peek(c.k);
        list.appendChild(el("div", { class: "ed-row" }, [
          el("div", { class: "ed-row-h" }, [
            el("b", { text: "Card " + (i + 1) }),
            el("span", { class: "ed-meta", text: m && m.views ? m.views + " review" + (m.views === 1 ? "" : "s") + " · due " + (m.due || "—") : "new" }),
            rowTools(cards, i, save, redraw, { removeBody: "The card and its review history leave this deck." })
          ]),
          area(c.q, 2, function (v) { c.q = v; commit(); }, "Question"),
          area(c.a, 2, function (v) { c.a = v; commit(); }, "Answer — the wording that earns the mark")
        ]));
      });
      /* the older custom layer, still editable here so the deck has one editor */
      var custom = KOS.srs.cardsFor(sid, ref).filter(function (c) { return c.custom; });
      if (custom.length) {
        list.appendChild(el("h5", { class: "ed-sub", text: "Your custom cards" }));
        custom.forEach(function (c) {
          var q = c.q, a = c.a, t2 = null;
          function saveCustom() { clearTimeout(t2); t2 = setTimeout(function () { KOS.srs.updateCustom(c.id, q, a); onSave(); }, 250); }
          list.appendChild(el("div", { class: "ed-row custom" }, [
            el("div", { class: "ed-row-h" }, [
              el("b", { text: c.ai ? "AI · Custom" : "Custom" }),
              iconBtn("Delete custom card", "✕", function () {
                KOS.ui.confirm({ title: "Delete this card?", body: "The card and its review history go with it.", danger: true, confirm: "Delete" }, function () {
                  KOS.srs.deleteCustom(c.id); onSave(); redraw();
                });
              }, "danger")
            ]),
            area(q, 2, function (v) { q = v; saveCustom(); }, "Question"),
            area(a, 2, function (v) { a = v; saveCustom(); }, "Answer")
          ]));
        });
      }
    }
    wrap.appendChild(list);
    wrap.appendChild(el("button", { class: "btn primary ed-add", type: "button", text: "+ Add card", onclick: function () {
      cards.push({ q: "", a: "" }); save(); cards = KOS.edits.material(sid, ref, "flashcards"); redraw();
      var last = list.querySelectorAll(".ed-row:not(.custom) textarea"); if (last.length) last[last.length - 2].focus();
    } }));
    redraw();
    return wrap;
  }

  function quizEditor(sid, ref, onSave) {
    var items = KOS.edits.material(sid, ref, "quiz");
    var wrap = el("div", { class: "ed-rows" });
    var list = el("div", { class: "ed-list" });
    var timer = null;
    function commit() { clearTimeout(timer); timer = setTimeout(save, 250); }
    function save() { clearTimeout(timer); KOS.edits.set(sid, ref, "quiz", items); onSave(); }
    function optionRows(it, redrawItem) {
      var box = el("div", { class: "ed-opts" });
      it.opts.forEach(function (o, oi) {
        var radio = el("input", { type: "radio", name: "ed-ans-" + it.id, "aria-label": "Correct answer", onchange: function () { it.ans = oi; commit(); } });
        radio.checked = it.ans === oi;
        box.appendChild(el("div", { class: "ed-opt" + (it.ans === oi ? " right" : "") }, [
          radio,
          input(o, function (v) { it.opts[oi] = v; commit(); }, "Option " + (oi + 1)),
          iconBtn("Remove option", "✕", function () {
            if (it.opts.length <= 2) { KOS.ui.toast("A question needs at least two options.", true); return; }
            it.opts.splice(oi, 1); if (it.ans >= it.opts.length) it.ans = 0; else if (it.ans > oi) it.ans--; commit(); redrawItem();
          }, "danger")
        ]));
      });
      if (it.opts.length < 6) box.appendChild(el("button", { class: "btn ed-add-step", type: "button", text: "+ Option", onclick: function () { it.opts.push(""); commit(); redrawItem(); } }));
      return box;
    }
    function redraw() {
      list.innerHTML = "";
      if (!items.length) list.appendChild(el("p", { class: "ed-empty", text: "No quiz questions on this topic yet — add one." }));
      items.forEach(function (it, i) {
        if (!Array.isArray(it.opts)) it.opts = ["", ""];
        if (typeof it.ans !== "number") it.ans = 0;
        var r = el("div", { class: "ed-row" });
        function redrawItem() { var n = el("div"); r.replaceWith(n); n.replaceWith(build()); }
        function build() {
          r = el("div", { class: "ed-row" }, [
            el("div", { class: "ed-row-h" }, [el("b", { text: "Q" + (i + 1) }), rowTools(items, i, save, redraw)]),
            area(it.q, 2, function (v) { it.q = v; commit(); }, "Question"),
            el("div", { class: "ed-lbl", text: "Options — tick the correct one" }),
            optionRows(it, redrawItem),
            area(it.why, 2, function (v) { it.why = v; commit(); }, "Explanation shown after answering")
          ]);
          return r;
        }
        list.appendChild(build());
      });
      var custom = KOS.srs.customQuizFor(sid, ref);
      if (custom.length) {
        list.appendChild(el("h5", { class: "ed-sub", text: "Your custom questions" }));
        custom.forEach(function (cq) {
          var patch = { q: cq.q, opts: cq.opts.slice(), ans: cq.ans, why: cq.why }, t2 = null;
          function saveCustom() { clearTimeout(t2); t2 = setTimeout(function () { var r2 = KOS.srs.updateCustomQuiz(cq.id, patch); if (r2 && r2.error) KOS.ui.toast(r2.error, true); else onSave(); }, 300); }
          var box = el("div", { class: "ed-row custom" });
          function paint() {
            box.innerHTML = "";
            box.appendChild(el("div", { class: "ed-row-h" }, [
              el("b", { text: cq.ai ? "AI · Custom" : "Custom" }),
              iconBtn("Delete custom question", "✕", function () { KOS.srs.deleteCustomQuiz(cq.id); onSave(); redraw(); }, "danger")
            ]));
            box.appendChild(area(patch.q, 2, function (v) { patch.q = v; saveCustom(); }, "Question"));
            patch.opts.forEach(function (o, oi) {
              var radio = el("input", { type: "radio", name: "ed-cans-" + cq.id, onchange: function () { patch.ans = oi; saveCustom(); } });
              radio.checked = patch.ans === oi;
              box.appendChild(el("div", { class: "ed-opt" }, [radio, input(o, function (v) { patch.opts[oi] = v; saveCustom(); })]));
            });
            box.appendChild(area(patch.why, 2, function (v) { patch.why = v; saveCustom(); }, "Explanation"));
          }
          paint();
          list.appendChild(box);
        });
      }
    }
    wrap.appendChild(list);
    wrap.appendChild(el("button", { class: "btn primary ed-add", type: "button", text: "+ Add question", onclick: function () {
      items.push({ q: "", opts: ["", ""], ans: 0, why: "" }); save(); items = KOS.edits.material(sid, ref, "quiz"); redraw();
    } }));
    redraw();
    return wrap;
  }

  function examEditor(sid, ref, onSave) {
    var items = KOS.edits.material(sid, ref, "exam");
    var wrap = el("div", { class: "ed-rows" });
    var list = el("div", { class: "ed-list" });
    var timer = null;
    /* the engine reads {q, marks, ms} or {ctx, parts:[{q, marks, ms}]};
       the editor always works on parts and flattens a lone part on save */
    function partsOf(it) {
      if (!Array.isArray(it.parts)) it.parts = [{ q: it.q || "", marks: it.marks || 1, ms: it.ms || [] }];
      it.parts.forEach(function (p) { if (!Array.isArray(p.ms)) p.ms = p.ms ? [String(p.ms)] : []; });
      return it.parts;
    }
    function flatten() {
      return items.map(function (it) {
        var o = { id: it.id, src: it.src || undefined, level: it.level || undefined };
        var parts = partsOf(it);
        if (parts.length === 1 && !(it.ctx && it.ctx.trim())) { o.q = parts[0].q; o.marks = Number(parts[0].marks) || 1; o.ms = parts[0].ms; }
        else { o.ctx = it.ctx || ""; o.parts = parts.map(function (p) { return { q: p.q, marks: Number(p.marks) || 1, ms: p.ms }; }); }
        Object.keys(o).forEach(function (k) { if (o[k] === undefined) delete o[k]; });
        return o;
      });
    }
    function commit() { clearTimeout(timer); timer = setTimeout(save, 250); }
    function save() { clearTimeout(timer); KOS.edits.set(sid, ref, "exam", flatten()); onSave(); }
    function redraw() {
      list.innerHTML = "";
      if (!items.length) list.appendChild(el("p", { class: "ed-empty", text: "No exam questions on this topic yet — add one." }));
      items.forEach(function (it, i) {
        var parts = partsOf(it);
        var r = el("div", { class: "ed-row" });
        r.appendChild(el("div", { class: "ed-row-h" }, [el("b", { text: "Question " + (i + 1) }), rowTools(items, i, save, redraw)]));
        r.appendChild(area(it.ctx, 2, function (v) { it.ctx = v; commit(); }, "Shared stem / context (optional for a multi-part question)"));
        var pl = el("div", { class: "ed-steps" });
        parts.forEach(function (p, pi) {
          pl.appendChild(el("div", { class: "ed-step" }, [
            el("div", { class: "ed-step-h" }, [
              el("b", { text: parts.length > 1 ? "Part (" + String.fromCharCode(97 + pi) + ")" : "The question" }),
              parts.length > 1 ? iconBtn("Remove part", "✕", function () { parts.splice(pi, 1); commit(); redraw(); }, "danger") : null
            ]),
            area(p.q, 3, function (v) { p.q = v; commit(); }, "Question text"),
            field("Marks", input(p.marks, function (v) { p.marks = Number(v) || 1; commit(); }, "", "number")),
            field("Mark scheme", area(lines(p.ms), 4, function (v) { p.ms = splitLines(v); commit(); }, "One mark point per line"), "One mark point per line")
          ]));
        });
        r.appendChild(pl);
        r.appendChild(el("div", { class: "ed-inline" }, [
          el("button", { class: "btn ed-add-step", type: "button", text: "+ Add part", onclick: function () { parts.push({ q: "", marks: 1, ms: [] }); commit(); redraw(); } }),
          field("Source", input(it.src, function (v) { it.src = v; commit(); }, "e.g. AQA 2023 Paper 1 Q4")),
          field("Level", select(it.level || "", [["", "A-level"], ["AS", "AS only"]], function (v) { it.level = v; commit(); }))
        ]));
        list.appendChild(r);
      });
    }
    wrap.appendChild(list);
    wrap.appendChild(el("button", { class: "btn primary ed-add", type: "button", text: "+ Add question", onclick: function () {
      items.push({ q: "", marks: 2, ms: [] }); save(); items = KOS.edits.material(sid, ref, "exam"); redraw();
    } }));
    redraw();
    return wrap;
  }

  /* ---------------- mount ---------------- */
  function mount(host, opts) {
    var sid = opts.sid, ref = opts.ref, kind = opts.kind || "notes";
    var onChange = opts.onChange || function () {};
    host.innerHTML = "";
    var aside = el("aside", { class: "study-editor", "aria-label": "Study editor" });
    var title = el("b", { class: "ed-title" });
    var state = el("span", { class: "ed-state" });
    var resetBtn = el("button", { class: "btn ed-reset", type: "button", text: "Reset to curriculum", onclick: function () {
      KOS.ui.confirm({ title: "Reset " + KIND_LABEL[kind] + " to the curriculum?", body: "Every edit you made to this tab on this topic is discarded and the shipped material comes back. Other tabs are untouched.", danger: true, confirm: "Reset" }, function () {
        KOS.edits.reset(sid, ref, kind);
        KOS.ui.toast(KIND_LABEL[kind] + " reset to the curriculum.");
        onChange(kind, { reset: true });
        render();
      });
    } });
    var closeBtn = el("button", { class: "btn primary ed-done", type: "button", text: "Done", onclick: function () { opts.onClose && opts.onClose(); } });
    var head = el("div", { class: "ed-head" }, [el("div", { class: "ed-head-l" }, [title, state]), closeBtn]);
    var body = el("div", { class: "ed-body" });
    aside.appendChild(head);
    aside.appendChild(body);
    host.appendChild(aside);
    var current = null;   // the block-list controller, for select()

    function paintState() {
      var forked = KOS.edits.has(sid, ref, kind);
      state.textContent = forked ? "Edited · saved on this device and your account" : "Curriculum version — edits fork it for this topic";
      state.className = "ed-state" + (forked ? " on" : "");
      resetBtn.hidden = !forked;
    }
    function render() {
      title.textContent = "Editing · " + KIND_LABEL[kind];
      body.innerHTML = "";
      current = null;
      paintState();
      var bar = el("div", { class: "ed-bar" }, [helpPanel(), resetBtn]);
      body.appendChild(bar);
      function saved(kind2, hint) { paintState(); onChange(kind2, hint || {}); }
      if (kind === "notes") {
        var blocks = KOS.edits.material(sid, ref, "notes");
        current = blockList(blocks, function (hint) {
          if (!hint.focusOnly) KOS.edits.set(sid, ref, "notes", blocks);
          saved("notes", hint);
        }, { emptyText: "No notes on this topic yet — add the first block, or a Markdown block to paste a whole page." });
        body.appendChild(current.node);
      } else if (kind === "spec") {
        var spec = KOS.edits.material(sid, ref, "spec");
        var save = function (hint) { if (!hint.focusOnly) KOS.edits.set(sid, ref, "spec", spec); saved("spec", hint); };
        body.appendChild(el("h5", { class: "ed-sub", text: "Specification content" }));
        var a = blockList(spec.content, save, { emptyText: "No content — add a block." });
        body.appendChild(a.node);
        body.appendChild(el("h5", { class: "ed-sub", text: "Guidance / examiner notes" }));
        var b = blockList(spec.info, save, { emptyText: "No guidance — add a block." });
        body.appendChild(b.node);
        current = { select: function (id) { a.select(id); b.select(id); } };
      } else if (kind === "flashcards") {
        body.appendChild(flashcardEditor(sid, ref, function () { saved("flashcards"); }));
      } else if (kind === "quiz") {
        body.appendChild(quizEditor(sid, ref, function () { saved("quiz"); }));
      } else if (kind === "exam") {
        body.appendChild(examEditor(sid, ref, function () { saved("exam"); }));
      }
    }
    render();
    return {
      setKind: function (k) { if (KIND_LABEL[k] && k !== kind) { kind = k; render(); } },
      kind: function () { return kind; },
      select: function (id) { if (current && current.select) current.select(id); },
      destroy: function () { host.innerHTML = ""; }
    };
  }

  KOS.editor = { mount: mount, KIND_LABEL: KIND_LABEL, TYPES: TYPES, blocksToMarkdown: blocksToMarkdown };
})();
