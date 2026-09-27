/* Kurenai OS — labs/oop.js
   C# OOP Architecture Sandbox: drop class blocks on a 2D canvas, set
   access modifiers, draw inheritance lines, and read clean C# as it
   transpiles live in the side window. Layout persists. */
(function () {
  "use strict";
  var el = KOS.ui.el, store = KOS.store;

  var ACCESS = ["public", "private", "protected"];
  var VIRT = ["none", "virtual", "override", "abstract"];
  var basingFrom = null; // class id awaiting a base-class click

  /* ================= THE MODEL (roadmap 1.7) =================
     Pure functions over the plain model the sandbox stores in state.oop —
     {classes: [{id, name, abstract, x, y, fields: [{acc, type, name}],
     methods: [{acc, type, name, virt}]}], links: [{child, parent}], nextId,
     seeded}. Nothing here reads the store or the DOM, so the IDE view that
     is coming from the design, the Assistant and the tests share one
     definition. Render purity (smoke56) is the view's side of the bargain:
     it draws from a model and writes only on a real edit.

     IDENTITY. A class's `id` is its stable identity — the file tree, the
     links and the canvas key on it; renaming changes the name and the file
     name, never the id. Ids come from `nextId` (the cloud merge re-keys a
     colliding one and rewrites its links, invariant 33a). The file name is
     DERIVED from the class name (`Name.cs`), so it can never drift from
     the code it holds.

     VIEW STATE. The canvas's pan and zoom and the Code/Diagram toggle are
     how THIS DEVICE looks at the model (a phone and a desktop want
     different ones), so they live in state.ui.oopView, not in the synced
     model. */
  var CS_KEYWORDS = ("abstract as base bool break byte case catch char checked class const continue decimal default " +
    "delegate do double else enum event explicit extern false finally fixed float for foreach goto if implicit in int " +
    "interface internal is lock long namespace new null object operator out override params private protected public " +
    "readonly ref return sbyte sealed short sizeof stackalloc static string struct switch this throw true try typeof " +
    "uint ulong unchecked unsafe ushort using virtual void volatile while").split(" ");
  var IDENT = /^[A-Za-z_][A-Za-z0-9_]*$/;
  var ZOOM_MIN = 0.25, ZOOM_MAX = 3;
  var CARD = { w: 232, h: 180 };           // a class card's footprint on the canvas

  function str(v, max) { return String(v == null ? "" : v).trim().slice(0, max || 80); }
  function num(v, d) { v = Number(v); return isFinite(v) ? v : d; }
  function isIdent(name) { return IDENT.test(name) && CS_KEYWORDS.indexOf(name) === -1; }

  /* the schema gate: a clean copy of any model (a pull, a restore, an
     Assistant proposal). Members and names are cleaned; a link to a class
     that does not exist, a self-link and a duplicate link are dropped;
     nextId is lifted past every id. It never "fixes" a modelling error —
     a cycle or a second base survives for validate() to report. */
  function normaliseModel(m) {
    m = m && typeof m === "object" ? m : {};
    var seen = {}, classes = [];
    (Array.isArray(m.classes) ? m.classes : []).forEach(function (c) {
      if (!c || typeof c !== "object") return;
      var id = parseInt(c.id, 10);
      if (!isFinite(id) || id < 1 || seen[id]) return;
      seen[id] = true;
      classes.push({
        id: id,
        name: str(c.name, 60),
        abstract: !!c.abstract,
        x: Math.round(num(c.x, 0)), y: Math.round(num(c.y, 0)),
        fields: (Array.isArray(c.fields) ? c.fields : []).slice(0, 60).map(function (f) {
          f = f || {};
          return { acc: ACCESS.indexOf(f.acc) !== -1 ? f.acc : "private", type: str(f.type, 40), name: str(f.name, 60) };
        }),
        methods: (Array.isArray(c.methods) ? c.methods : []).slice(0, 60).map(function (mt) {
          mt = mt || {};
          return { acc: ACCESS.indexOf(mt.acc) !== -1 ? mt.acc : "public", type: str(mt.type, 40), name: str(mt.name, 60),
            virt: VIRT.indexOf(mt.virt) !== -1 ? mt.virt : "none" };
        })
      });
    });
    var linkSeen = {};
    var links = (Array.isArray(m.links) ? m.links : []).map(function (l) {
      return l ? { child: parseInt(l.child, 10), parent: parseInt(l.parent, 10) } : null;
    }).filter(function (l) {
      if (!l || !seen[l.child] || !seen[l.parent] || l.child === l.parent) return false;
      var k = l.child + ">" + l.parent;
      if (linkSeen[k]) return false;
      linkSeen[k] = true;
      return true;
    });
    var maxId = classes.reduce(function (a, c) { return Math.max(a, c.id); }, 0);
    var out = { classes: classes, links: links, nextId: Math.max(maxId + 1, parseInt(m.nextId, 10) || 1) };
    if (m.seeded) out.seeded = true;
    return out;
  }

  /* ---------------- identity ---------------- */
  function classById(m, id) { return (m.classes || []).find(function (c) { return c.id === id; }) || null; }
  function identOf(c) { return safeIdent(c && c.name, "Class" + (c && c.id)); }
  function fileName(c) { return identOf(c) + ".cs"; }
  /* the file tree: one file per class, in the model's order, with its
     base and whether it is abstract — [{id, file, name, base, abstract}] */
  function files(m) {
    return (m.classes || []).map(function (c) {
      var link = (m.links || []).find(function (l) { return l.child === c.id; });
      return { id: c.id, file: fileName(c), name: identOf(c), abstract: !!c.abstract,
        base: link ? link.parent : null };
    });
  }
  function parentOf(m, id) {
    var l = (m.links || []).find(function (x) { return x.child === id; });
    return l ? l.parent : null;
  }
  /* the base chain above a class, nearest first; stops at a cycle */
  function ancestors(m, id) {
    var out = [], seen = {}, p = parentOf(m, id);
    seen[id] = true;
    while (p != null && !seen[p]) { out.push(p); seen[p] = true; p = parentOf(m, p); }
    return out;
  }

  /* ---------------- validation ----------------
     validate(model) → {ok, errors: [{code, classId, member?, message}]}.
     Every rule is a C# compile rule the generated code would break:
       invalid-name     a class or member name that is not an identifier
                        (or is a C# keyword);
       duplicate-class  two classes with the same name (also two files
                        with the same name);
       multiple-bases   a class with more than one base (C# has single
                        inheritance);
       cycle            a class that inherits from itself, however far up;
       duplicate-member two members of one class with the same name;
       abstract-in-concrete  an abstract method in a class not marked
                        abstract;
       private-virtual  a virtual, abstract or override method that is
                        private;
       override-without-base an override with no virtual, abstract or
                        override method of that name above it;
       unimplemented    a concrete class that leaves an inherited abstract
                        method without an override. */
  function validate(model) {
    var m = normaliseModel(model), errors = [];
    function err(code, c, message, member) {
      var e = { code: code, classId: c ? c.id : null, message: message };
      if (member) e.member = member;
      errors.push(e);
    }
    var byName = {};
    m.classes.forEach(function (c) {
      if (!isIdent(c.name)) err("invalid-name", c, "“" + (c.name || "(blank)") + "” is not a valid C# class name.");
      var k = c.name;
      if (k) (byName[k] = byName[k] || []).push(c);
    });
    Object.keys(byName).forEach(function (k) {
      if (byName[k].length > 1) byName[k].forEach(function (c) { err("duplicate-class", c, "Two classes are called " + k + "."); });
    });
    var parents = {};
    m.links.forEach(function (l) { (parents[l.child] = parents[l.child] || []).push(l.parent); });
    Object.keys(parents).forEach(function (cid) {
      if (parents[cid].length > 1) err("multiple-bases", classById(m, +cid), identOf(classById(m, +cid)) + " has more than one base class — C# allows one.");
    });
    m.classes.forEach(function (c) {
      /* a cycle: walking up from c returns to c */
      var p = parentOf(m, c.id), hops = 0;
      while (p != null && hops++ <= m.classes.length) {
        if (p === c.id) { err("cycle", c, identOf(c) + " inherits from itself through its bases."); break; }
        p = parentOf(m, p);
      }
      var names = {};
      c.fields.concat(c.methods).forEach(function (mem) {
        if (!isIdent(mem.name)) err("invalid-name", c, "“" + (mem.name || "(blank)") + "” in " + identOf(c) + " is not a valid member name.", mem.name);
        else if (names[mem.name]) err("duplicate-member", c, identOf(c) + " has two members called " + mem.name + ".", mem.name);
        names[mem.name] = true;
        if (mem.name === identOf(c)) err("invalid-name", c, "A member of " + identOf(c) + " cannot share the class's name.", mem.name);
      });
      c.methods.forEach(function (mt) {
        if (mt.virt === "abstract" && !c.abstract) err("abstract-in-concrete", c, identOf(c) + "." + mt.name + " is abstract, so " + identOf(c) + " must be abstract too.", mt.name);
        if (mt.virt !== "none" && mt.acc === "private") err("private-virtual", c, identOf(c) + "." + mt.name + " cannot be private and " + mt.virt + ".", mt.name);
        if (mt.virt === "override") {
          var found = ancestors(m, c.id).some(function (aid) {
            var a = classById(m, aid);
            return a && a.methods.some(function (x) { return x.name === mt.name && x.virt !== "none"; });
          });
          if (!found) err("override-without-base", c, identOf(c) + "." + mt.name + " overrides nothing — no base class has a virtual or abstract " + mt.name + ".", mt.name);
        }
      });
      if (!c.abstract) {
        /* walk down from the root: an abstract method stays owed until a
           class on the way overrides it */
        var chain = ancestors(m, c.id).reverse().concat([c.id]), owed = {};
        chain.forEach(function (cid) {
          var k = classById(m, cid);
          if (!k) return;
          k.methods.forEach(function (x) {
            /* the class's OWN abstract method is abstract-in-concrete's
               error, not an unimplemented inheritance */
            if (x.virt === "abstract" && cid !== c.id) owed[x.name] = identOf(k);
            else if (x.virt === "override") delete owed[x.name];
          });
        });
        Object.keys(owed).forEach(function (name) {
          err("unimplemented", c, identOf(c) + " must override " + owed[name] + "." + name + ".", name);
        });
      }
    });
    return { ok: !errors.length, errors: errors };
  }

  /* ---------------- canvas view (per device) ---------------- */
  function clampZoom(z) { return Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, num(z, 1))); }
  function normaliseView(v) {
    v = v && typeof v === "object" ? v : {};
    return { x: Math.round(num(v.x, 0)), y: Math.round(num(v.y, 0)), zoom: Math.round(clampZoom(v.zoom) * 100) / 100,
      mode: v.mode === "diagram" ? "diagram" : "code", selected: v.selected != null && isFinite(+v.selected) ? +v.selected : null };
  }
  /* zoom by `factor` keeping the canvas point under (px, py) — a pointer
     or the viewport centre — where it is */
  function zoomAt(view, factor, px, py) {
    var v = normaliseView(view), z = clampZoom(v.zoom * num(factor, 1));
    var wx = (num(px, 0) - v.x) / v.zoom, wy = (num(py, 0) - v.y) / v.zoom;
    return normaliseView({ x: num(px, 0) - wx * z, y: num(py, 0) - wy * z, zoom: z, mode: v.mode, selected: v.selected });
  }
  /* the pan and zoom that show every class card inside a vw × vh viewport
     with a margin; an empty model returns the origin at 100% */
  function fit(model, vw, vh, margin) {
    var m = normaliseModel(model), pad = margin == null ? 32 : margin;
    if (!m.classes.length || !(vw > 0) || !(vh > 0)) return normaliseView({});
    var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    m.classes.forEach(function (c) {
      x0 = Math.min(x0, c.x); y0 = Math.min(y0, c.y);
      x1 = Math.max(x1, c.x + CARD.w); y1 = Math.max(y1, c.y + CARD.h);
    });
    var z = clampZoom(Math.min((vw - 2 * pad) / (x1 - x0), (vh - 2 * pad) / (y1 - y0), 1));
    return normaliseView({ x: (vw - (x1 - x0) * z) / 2 - x0 * z, y: (vh - (y1 - y0) * z) / 2 - y0 * z, zoom: z });
  }
  function viewState() { return normaliseView(store.state.ui && store.state.ui.oopView); }
  function setView(patch) {
    var next = normaliseView(Object.assign(viewState(), patch || {}));
    store.state.ui.oopView = next;
    store.save();
    return next;
  }

  /* The first visit shows a small worked example. It is a DRAFT until the
     first edit: a view renders without writing (smoke56), so the example
     reaches the store only when the reader changes something. */
  var draft = null;
  function model() { return draft || store.state.oop; }
  function save() {
    if (draft) { Object.assign(store.state.oop, draft); draft = null; }
    store.save();
  }
  function byId(id) { return model().classes.find(function (c) { return c.id === id; }); }

  function newClass(x, y) {
    var m = model();
    var c = {
      id: m.nextId++,
      name: "Class" + (m.classes.length + 1),
      abstract: false,
      x: x, y: y,
      fields: [{ acc: "private", type: "int", name: "value" }],
      methods: [{ acc: "public", type: "void", name: "DoWork", virt: "none" }]
    };
    m.classes.push(c);
    return c;
  }

  /* ---------------- transpiler ---------------- */
  function safeIdent(s, fallback) {
    s = String(s || "").replace(/[^A-Za-z0-9_]/g, "");
    if (!s || /^\d/.test(s)) s = fallback;
    return s;
  }
  function defaultReturn(type) {
    switch (type) {
      case "void": return null;
      case "int": case "long": case "byte": return "0";
      case "double": case "float": case "decimal": return "0";
      case "bool": return "false";
      case "string": return "string.Empty";
      case "char": return "' '";
      default: return "default";
    }
  }
  /* the C# for a model — the whole sandbox, or (onlyId) one class's file */
  function transpileModel(mIn, onlyId) {
    var m = mIn;
    var lines = [];
    lines.push("// Generated by Kurenai OS \u2014 C# OOP Sandbox");
    lines.push("namespace KurenaiOS.Sandbox");
    lines.push("{");
    var list = onlyId == null ? m.classes : m.classes.filter(function (c) { return c.id === onlyId; });
    if (!list.length) {
      lines.push("    // Add a class block to begin.");
    }
    list.forEach(function (c, ci) {
      var name = safeIdent(c.name, "Class" + c.id);
      var base = m.links.find(function (l) { return l.child === c.id; });
      var baseName = base ? safeIdent((classById(m, base.parent) || {}).name, "Base") : null;
      var head = "    public " + (c.abstract ? "abstract " : "") + "class " + name +
                 (baseName ? " : " + baseName : "");
      lines.push(head);
      lines.push("    {");
      c.fields.forEach(function (f) {
        lines.push("        " + f.acc + " " + safeIdent(f.type, "int") + " " +
          safeIdent(f.name, "field") + ";");
      });
      if (c.fields.length && c.methods.length) lines.push("");
      // constructor
      lines.push("        public " + name + "()");
      lines.push("        {");
      lines.push("        }");
      if (c.methods.length) lines.push("");
      c.methods.forEach(function (mt, i) {
        var mod = mt.virt === "virtual" ? "virtual " : mt.virt === "override" ? "override " : mt.virt === "abstract" ? "abstract " : "";
        var t = safeIdent(mt.type, "void");
        var sig = "        " + mt.acc + " " + mod + t + " " + safeIdent(mt.name, "Method") + "()";
        if (mt.virt === "abstract") {
          lines.push(sig + ";");
        } else {
          lines.push(sig);
          lines.push("        {");
          var ret = defaultReturn(t);
          if (ret) lines.push("            return " + ret + ";");
          lines.push("        }");
        }
        if (i < c.methods.length - 1) lines.push("");
      });
      lines.push("    }");
      if (ci < list.length - 1) lines.push("");
    });
    lines.push("}");
    return lines.join("\n");
  }
  function transpile() { return transpileModel(model()); }
  function highlight(code) {
    var esc = KOS.hub.esc(code);
    return esc
      .replace(/(\/\/[^\n]*)/g, '<span class="k-cs-cm">$1</span>')
      .replace(/\b(namespace|public|private|protected|class|abstract|virtual|override|return|new|default)\b/g, '<span class="k-cs-kw">$1</span>')
      .replace(/\b(void|int|long|byte|double|float|decimal|bool|string|char)\b/g, '<span class="k-cs-ty">$1</span>')
      .replace(/\bclass<\/span> (\w+)/g, 'class</span> <span class="k-cs-cl">$1</span>');
  }

  /* ---------------- view ---------------- */
  var stage, svg, codePre;

  KOS.views.oop = function (main) {
    KOS.shell.tree("none");
    basingFrom = null;
    draft = null;

    main.appendChild(KOS.ui.pageHeader({ kicker: "Labs · AQA 7517 · 4.1.2.3", title: "C# OOP Sandbox",
      sub: "Drag class blocks, set modifiers, draw inheritance; the C# rewrites itself." }));

    var bar = el("div", { class: "k-lab-controls", "data-ui": "lab.controls" });
    bar.appendChild(el("button", { class: "k-btn k-btn--primary", "data-intent": "primary", text: "+ Add class", onclick: function () {
      var n = model().classes.length;
      addCard(newClass(30 + (n % 3) * 250, 26 + Math.floor(n / 3) * 210));
      save();
      refresh();
    }}));
    bar.appendChild(el("button", { class: "k-btn", text: "Copy C#", onclick: function () {
      var code = transpile();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(function () { KOS.ui.toast("C# copied to clipboard."); },
          function () { fallbackCopy(code); });
      } else fallbackCopy(code);
      function fallbackCopy(text) {
        var ta = el("textarea", { class: "sr-only", "aria-hidden": "true", tabindex: "-1" });
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); KOS.ui.toast("C# copied to clipboard."); }
        catch (e) { KOS.ui.toast("Copy failed — select the code manually.", true); }
        ta.remove();
      }
    }}));
    bar.appendChild(el("button", { class: "k-btn k-lab-alt", text: "Clear sandbox", onclick: function () {
      function clearAll() { model().classes = []; model().links = []; save(); buildStage(); }
      if (!model().classes.length) { clearAll(); return; }
      KOS.ui.confirm({ title: "Clear the sandbox?", body: "Every class block and inheritance arrow is removed.",
        confirm: "Clear sandbox", danger: true }, clearAll);
    }}));
    main.appendChild(bar);

    var wrap = el("div", { id: "oop-stage-wrap", class: "k-oop" });
    stage = el("div", { id: "oop-stage", class: "k-oop-stage" });
    svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.id = "oop-svg";
    svg.setAttribute("class", "k-oop-svg");
    var defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    defs.innerHTML = '<marker id="tri" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="11" markerHeight="11" orient="auto"><path d="M1,1 L11,6 L1,11 z" fill="none" stroke="var(--amber)" stroke-width="1.6"/></marker>';
    svg.appendChild(defs);
    stage.appendChild(svg);
    wrap.appendChild(stage);

    var codeBox = el("div", { id: "oop-code", class: "k-oop-code" });
    codePre = el("pre", { class: "k-mono" });
    codeBox.appendChild(codePre);
    wrap.appendChild(codeBox);
    main.appendChild(wrap);

    buildStage();

    function buildStage() {
      stage.querySelectorAll("[data-ui~='lab.oop-class']").forEach(function (n) { n.remove(); });
      if (!model().classes.length) {
        // seed a tiny inheritance example on first visit
        if (!model().seeded) {
          var base = store.state.oop;
          draft = { classes: [], links: [], nextId: base.nextId || 1, seeded: true };
          var a = newClass(40, 30); a.name = "GameEntity"; a.abstract = true;
          a.fields = [{ acc: "protected", type: "int", name: "health" },
                      { acc: "private", type: "string", name: "id" }];
          a.methods = [{ acc: "public", type: "void", name: "TakeDamage", virt: "virtual" }];
          var b = newClass(330, 150); b.name = "Suspect";
          b.fields = [{ acc: "private", type: "bool", name: "isLying" }];
          b.methods = [{ acc: "public", type: "void", name: "TakeDamage", virt: "override" },
                       { acc: "public", type: "string", name: "Confess", virt: "none" }];
          model().links.push({ child: b.id, parent: a.id });
        }
      }
      model().classes.forEach(addCard);
      refresh();
    }

    function addCard(c) {
      var card = el("div", { class: "k-lab-cls-card", "data-ui": "lab.oop-class", style: "--x: " + c.x + "px; --y: " + c.y + "px" });
      card.dataset.cid = c.id;

      var nameIn = el("input", { value: c.name, "aria-label": "Class name", oninput: function () {
        c.name = nameIn.value; save(); refresh();
      }});
      var abst = el("span", { class: "k-lab-abst", "data-ui": "lab.oop-abstract", title: "Toggle abstract",
        text: c.abstract ? "✦ abstract" : "✧ concrete",
        onclick: function () { c.abstract = !c.abstract; abst.textContent = c.abstract ? "✦ abstract" : "✧ concrete"; save(); refresh(); } });
      var head = el("div", { class: "k-lab-cls-h", "data-ui": "lab.oop-class-head" }, [
        nameIn, abst,
        el("button", { class: "k-iconbtn k-iconbtn--sm", title: "Delete class", text: "✕", onclick: function (e) {
          e.stopPropagation();
          var m = model();
          m.classes = m.classes.filter(function (k) { return k.id !== c.id; });
          m.links = m.links.filter(function (l) { return l.child !== c.id && l.parent !== c.id; });
          save();
          card.remove();
          refresh();
        }})
      ]);
      card.appendChild(head);

      var body = el("div", { class: "k-lab-cls-body" });
      card.appendChild(body);

      function renderMembers() {
        body.innerHTML = "";
        body.appendChild(el("div", { class: "k-lab-mem-h", text: "Fields" }));
        c.fields.forEach(function (f, i) { body.appendChild(memberRow(f, i, "fields")); });
        body.appendChild(el("div", { class: "k-lab-mem-h", text: "Methods" }));
        c.methods.forEach(function (mt, i) { body.appendChild(memberRow(mt, i, "methods")); });
      }
      function memberRow(mem, idx, kind) {
        var acc = el("select", { class: "k-lab-acc", title: "Access modifier" }, ACCESS.map(function (a) {
          return el("option", { value: a, text: a === "public" ? "+" : a === "private" ? "−" : "#" });
        }));
        acc.value = mem.acc;
        acc.onchange = function () { mem.acc = acc.value; save(); refresh(); };
        var type = el("input", { value: mem.type, placeholder: "type", title: "Type" });
        type.oninput = function () { mem.type = type.value; save(); refresh(); };
        var nm = el("input", { value: mem.name, placeholder: "name", title: "Name" });
        nm.oninput = function () { mem.name = nm.value; save(); refresh(); };
        var row = el("div", { class: "k-lab-member" }, [acc, type, nm,
          el("button", { class: "k-iconbtn k-iconbtn--sm", text: "✕", title: "Remove", onclick: function () {
            c[kind].splice(idx, 1); save(); renderMembers(); refresh();
          }})
        ]);
        if (kind === "methods") {
          nm.title = "Method name — click ↻ below to cycle virtual/override/abstract";
        }
        return row;
      }
      renderMembers();

      var foot = el("div", { class: "k-lab-cls-foot" });
      foot.appendChild(el("button", { class: "k-btn k-btn--sm", text: "+ field", onclick: function () {
        c.fields.push({ acc: "private", type: "int", name: "field" + (c.fields.length + 1) });
        save(); renderMembers(); refresh();
      }}));
      foot.appendChild(el("button", { class: "k-btn k-btn--sm", text: "+ method", onclick: function () {
        c.methods.push({ acc: "public", type: "void", name: "Method" + (c.methods.length + 1), virt: "none" });
        save(); renderMembers(); refresh();
      }}));
      foot.appendChild(el("button", { class: "k-btn k-btn--sm", text: "↻ virt", title: "Cycle the LAST method through none → virtual → override → abstract", onclick: function () {
        if (!c.methods.length) return;
        var mt = c.methods[c.methods.length - 1];
        var cyc = ["none", "virtual", "override", "abstract"];
        mt.virt = cyc[(cyc.indexOf(mt.virt) + 1) % cyc.length];
        KOS.ui.toast(mt.name + " is now " + (mt.virt === "none" ? "plain" : mt.virt) + ".");
        save(); refresh();
      }}));
      foot.appendChild(el("button", { class: "k-btn k-btn--sm", text: "⇡ set base", title: "Then click the parent class card", onclick: function (e) {
        e.stopPropagation();
        var m = model();
        var existing = m.links.find(function (l) { return l.child === c.id; });
        if (existing) {
          m.links = m.links.filter(function (l) { return l.child !== c.id; });
          save(); refresh();
          KOS.ui.toast("Inheritance removed from " + c.name + ".");
          return;
        }
        basingFrom = c.id;
        document.querySelectorAll("[data-ui~='lab.oop-class']").forEach(function (k) {
          KOS.ui.state(k, "basing", +k.dataset.cid !== c.id);
        });
        KOS.ui.toast("Now click the class " + c.name + " should inherit from. (Click ⇡ again to cancel.)");
      }}));
      card.appendChild(foot);

      // click-to-finish inheritance
      card.addEventListener("click", function () {
        if (basingFrom !== null && basingFrom !== c.id) {
          // refuse cycles
          var m = model(), p = c.id, hops = 0;
          while (p !== undefined && hops++ < 50) {
            if (p === basingFrom) { KOS.ui.toast("That would create an inheritance cycle.", true); endBasing(); return; }
            var up = m.links.find(function (l) { return l.child === p; });
            p = up ? up.parent : undefined;
          }
          m.links.push({ child: basingFrom, parent: c.id });
          var childName = (byId(basingFrom) || {}).name;
          save();
          KOS.ui.toast(childName + " : " + c.name + " — inheritance drawn.");
          endBasing(); refresh();
        }
      });
      function endBasing() {
        basingFrom = null;
        document.querySelectorAll("[data-ui~='lab.oop-class']").forEach(function (k) { KOS.ui.state(k, "basing", false); });
      }

      // dragging via the header
      head.addEventListener("pointerdown", function (e) {
        if (e.target.tagName === "INPUT" || e.target.tagName === "BUTTON" || e.target.matches('[data-ui~="lab.oop-abstract"]')) return;
        e.preventDefault();
        var startX = e.clientX - c.x, startY = e.clientY - c.y;
        function move(ev) {
          c.x = Math.max(0, Math.min(stage.clientWidth - 232, ev.clientX - startX));
          c.y = Math.max(0, Math.min(stage.clientHeight - 80, ev.clientY - startY));
          card.style.setProperty("--x", c.x + "px"); card.style.setProperty("--y", c.y + "px");
          drawLinks();
        }
        function up() {
          document.removeEventListener("pointermove", move);
          document.removeEventListener("pointerup", up);
          save();
        }
        document.addEventListener("pointermove", move);
        document.addEventListener("pointerup", up);
      });

      stage.appendChild(card);
    }

    function drawLinks() {
      while (svg.lastChild && svg.lastChild.tagName !== "defs") svg.removeChild(svg.lastChild);
      model().links.forEach(function (l) {
        var c1 = byId(l.child), c2 = byId(l.parent);
        if (!c1 || !c2) return;
        var e1 = stage.querySelector('[data-cid="' + c1.id + '"]');
        var e2 = stage.querySelector('[data-cid="' + c2.id + '"]');
        if (!e1 || !e2) return;
        var x1 = c1.x + e1.offsetWidth / 2, y1 = c1.y;
        var x2 = c2.x + e2.offsetWidth / 2, y2 = c2.y + e2.offsetHeight;
        var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        var midY = (y1 + y2) / 2;
        path.setAttribute("d", "M" + x1 + "," + y1 + " C" + x1 + "," + midY + " " + x2 + "," + midY + " " + x2 + "," + y2);
        path.setAttribute("stroke", "var(--amber)");
        path.setAttribute("stroke-width", "1.8");
        path.setAttribute("fill", "none");
        path.setAttribute("marker-end", "url(#tri)");
        svg.appendChild(path);
      });
    }

    function refresh() {
      drawLinks();
      codePre.innerHTML = highlight(transpile());
    }
  };

  KOS.oop = {
    ACCESS: ACCESS.slice(),
    VIRT: VIRT.slice(),
    CARD: { w: CARD.w, h: CARD.h },
    ZOOM: { min: ZOOM_MIN, max: ZOOM_MAX },
    normalise: normaliseModel,
    isIdent: isIdent,
    fileName: fileName,
    files: files,
    ancestors: ancestors,
    validate: validate,
    transpile: transpileModel,
    normaliseView: normaliseView,
    zoomAt: zoomAt,
    fit: fit,
    view: viewState,
    setView: setView
  };
})();
