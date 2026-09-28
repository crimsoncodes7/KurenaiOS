/* Kurenai OS — labs/oop.js
   C# OOP Architecture Sandbox: drop class blocks on a 2D canvas, set
   access modifiers, draw inheritance lines, and read clean C# as it
   transpiles live in the side window. Layout persists. */
(function () {
  "use strict";
  var el = KOS.ui.el, store = KOS.store;

  var ACCESS = ["public", "private", "protected"];
  var VIRT = ["none", "virtual", "override", "abstract"];

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
      mode: v.mode === "diagram" ? "diagram" : "code", selected: v.selected != null && isFinite(+v.selected) ? +v.selected : null,
      /* where the generated C# sits in Code mode (19a, 19d) */
      side: v.side !== false, cs: v.cs === "tab" ? "tab" : "side", framed: !!v.framed };
  }
  /* zoom by `factor` keeping the canvas point under (px, py) — a pointer
     or the viewport centre — where it is */
  function zoomAt(view, factor, px, py) {
    var v = normaliseView(view), z = clampZoom(v.zoom * num(factor, 1));
    var wx = (num(px, 0) - v.x) / v.zoom, wy = (num(py, 0) - v.y) / v.zoom;
    return normaliseView({ x: num(px, 0) - wx * z, y: num(py, 0) - wy * z, zoom: z, mode: v.mode, selected: v.selected, side: v.side, cs: v.cs, framed: v.framed });
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
    /* one pass, so a later rule never matches inside an earlier span */
    return KOS.hub.esc(code).replace(
      /(\/\/[^\n]*)|\b(namespace|public|private|protected|class|abstract|virtual|override|return|new|default)\b|\b(void|int|long|byte|double|float|decimal|bool|string|char)\b/g,
      function (m, cm, kw, ty) {
        if (cm) return '<span class="k-cs-cm">' + cm + "</span>";
        if (kw) return '<span class="k-cs-kw">' + kw + "</span>";
        return '<span class="k-cs-ty">' + ty + "</span>";
      }).replace(/class<\/span> (\w+)/g, 'class</span> <span class="k-cs-cl">$1</span>');
  }

  /* ================= THE IDE (design part 2, frames 19a–19f) =================
     A small IDE over the model above: a file tree (one file per class,
     nested by inheritance), a structured editor for the selected class
     that reads like code, the generated C# beside it or as its own tab,
     and a Diagram mode — an infinite canvas with UML cards, hollow
     inheritance triangles, zoom, Fit and a minimap. Selection, the mode,
     the pan and the zoom are this device's view (state.ui.oopView); the
     model changes only on a real edit. */
  var TYPES = ["int", "string", "bool", "double", "float", "char", "decimal", "long"];
  var ide = { open: [], lastValid: null, renaming: null, renameErr: "" };

  /* the first visit shows a small worked example, as a draft (smoke56) */
  function ensureDraft() {
    if (model().classes.length || model().seeded) return;
    var base = store.state.oop;
    draft = { classes: [], links: [], nextId: base.nextId || 1, seeded: true };
    var a = newClass(40, 30); a.name = "GameEntity"; a.abstract = true;
    a.fields = [{ acc: "protected", type: "int", name: "health" },
                { acc: "private", type: "string", name: "id" }];
    a.methods = [{ acc: "public", type: "void", name: "TakeDamage", virt: "virtual" }];
    var b = newClass(330, 300); b.name = "Suspect";
    b.fields = [{ acc: "private", type: "bool", name: "isLying" }];
    b.methods = [{ acc: "public", type: "void", name: "TakeDamage", virt: "override" },
                 { acc: "public", type: "string", name: "Confess", virt: "none" }];
    model().links.push({ child: b.id, parent: a.id });
  }
  function baseOf(id) { var l = model().links.find(function (x) { return x.child === id; }); return l ? l.parent : null; }
  function descendants(id) {
    var out = {}, stack = [id];
    while (stack.length) {
      var cur = stack.pop();
      model().links.forEach(function (l) { if (l.parent === cur && !out[l.child]) { out[l.child] = true; stack.push(l.child); } });
    }
    return out;
  }
  function setBase(childId, parentId) {
    var m = model();
    m.links = m.links.filter(function (l) { return l.child !== childId; });
    if (parentId != null) m.links.push({ child: childId, parent: parentId });
  }
  function copyText(code) {
    function fallback(text) {
      var ta = el("textarea", { class: "sr-only", "aria-hidden": "true", tabindex: "-1" });
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); KOS.ui.toast("C# copied to clipboard."); }
      catch (e) { KOS.ui.toast("Copy failed — select the code manually.", true); }
      ta.remove();
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(function () { KOS.ui.toast("C# copied to clipboard."); }, function () { fallback(code); });
    } else fallback(code);
  }

  KOS.views.oop = function (main) {
    KOS.shell.tree("none");
    draft = null;
    ide.renaming = null;
    ensureDraft();

    var leaf = KOS.hub && KOS.hub.BYREF && KOS.hub.BYREF.compsci && KOS.hub.BYREF.compsci["4.1.2.3"];
    main.appendChild(KOS.ui.pageHeader({ kicker: "Study · Practice zone · 4.1.2 Object-oriented programming", title: "OOP Sandbox",
      sub: "C# classes, inheritance and the code they compile to.",
      actions: leaf ? [el("button", { type: "button", class: "k-btn k-btn--quiet k-btn--sm", text: "Open topic page →",
        onclick: function () { KOS.show("ref", { subject: "compsci", ref: "4.1.2.3" }); } })] : [] }));
    var root = el("section", { class: "k-ide", "data-ui": "oop.ide", "aria-label": "OOP Sandbox" });
    main.appendChild(root);

    var check, sel, view, parts = {};
    function selected() {
      view = viewState();
      var ids = model().classes.map(function (c) { return c.id; });
      sel = ids.indexOf(view.selected) !== -1 ? view.selected : (ids[0] != null ? ids[0] : null);
      ide.open = ide.open.filter(function (id) { return ids.indexOf(id) !== -1; });
      if (sel != null && ide.open.indexOf(sel) === -1) ide.open.push(sel);
      return sel;
    }
    function errorsFor(id) { return check.errors.filter(function (e) { return e.classId === id; }); }
    function select(id, mode) {
      setView({ selected: id, mode: mode || viewState().mode });
      if (ide.open.indexOf(id) === -1) ide.open.push(id);
      render();
    }
    function edited(full) {
      save();
      if (full) render(); else refresh();
    }

    function render() {
      selected();
      check = validate(model());
      if (check.ok) ide.lastValid = transpileModel(model());
      root.innerHTML = "";
      root.appendChild(toolbar());
      var mode = view.mode === "diagram" ? "diagram" : (viewState().cs === "tab" ? "csharp" : "code");
      var body = el("div", { class: "k-ide-body", "data-mode": mode, "data-side": mode === "code" && viewState().side !== false ? "" : null });
      body.appendChild(tree());
      if (mode === "diagram") body.appendChild(diagram());
      else if (mode === "csharp") body.appendChild(csPanel(false));
      else {
        body.appendChild(editor());
        if (viewState().side !== false) body.appendChild(csPanel(true));
      }
      root.appendChild(body);
      root.appendChild(parts.status = status());
      if (mode === "code") paintErrors();
    }
    /* a text edit: what depends on the model is redrawn around the field
       being typed in, never the field itself */
    function refresh() {
      check = validate(model());
      if (check.ok) ide.lastValid = transpileModel(model());
      if (parts.tree) parts.tree.replaceWith(tree());
      if (parts.cs) parts.cs.replaceWith(csPanel(parts.cs.getAttribute("data-side") != null));
      if (parts.tabs) parts.tabs.replaceWith(tabs());
      if (parts.status) parts.status.replaceWith(parts.status = status());
      if (parts.errLine) paintErrors();
      if (parts.copy) parts.copy.disabled = !check.ok;
    }

    /* ---------- the toolbar ---------- */
    function toolbar() {
      var v = viewState();
      var seg = el("div", { class: "k-seg k-ide-modes", role: "group", "aria-label": "View" }, [["code", "⟨/⟩ Code"], ["diagram", "◇ Diagram"]].map(function (m) {
        return el("button", { type: "button", class: "k-seg-item", "data-ui": "oop.mode", "data-mode": m[0], "aria-pressed": String(v.mode === m[0]),
          text: m[1], onclick: function () { setView({ mode: m[0] }); render(); } });
      }));
      var copy = parts.copy = el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "oop.copy", text: "Copy C#",
        onclick: function () { copyText(transpileModel(model())); } });
      copy.disabled = !check.ok;
      return el("div", { class: "k-ide-bar", "data-ui": "lab.controls oop.toolbar" }, [
        seg,
        el("button", { type: "button", class: "k-btn", "data-ui": "oop.add", text: "+ Add class", onclick: addClass }),
        el("span", { class: "k-spacer" }),
        v.mode === "code" && v.cs !== "tab" ? el("button", { type: "button", class: "k-btn k-ide-side-btn", "data-ui": "oop.cs-side",
          "aria-pressed": String(v.side !== false), text: "C# beside editor",
          onclick: function () { setView({ side: viewState().side === false }); render(); } }) : null,
        el("button", { type: "button", class: "k-btn", "data-ui": "oop.cs-tab", "aria-pressed": String(v.mode === "code" && v.cs === "tab"),
          text: "⧉ C# tab", onclick: function () {
            var now = viewState();
            setView({ mode: "code", cs: now.mode === "code" && now.cs === "tab" ? "side" : "tab" });
            render();
          } }),
        copy,
        el("button", { type: "button", class: "k-btn k-btn--quiet", "data-ui": "oop.clear", text: "Clear sandbox", onclick: function () {
          function clearAll() { model().classes = []; model().links = []; edited(true); }
          if (!model().classes.length) { clearAll(); return; }
          KOS.ui.confirm({ title: "Clear the sandbox?", body: "Every class and inheritance arrow is removed.",
            confirm: "Clear sandbox", danger: true }, clearAll);
        } })
      ].filter(Boolean));
    }
    function addClass() {
      var m = model(), n = m.classes.length, name = "Class" + (n + 1), k = n + 1;
      while (m.classes.some(function (c) { return c.name === name; })) name = "Class" + (++k);
      var c = newClass(40 + (n % 3) * 290, 40 + Math.floor(n / 3) * 260);
      c.name = name;
      save();
      setView({ selected: c.id, mode: viewState().mode });
      if (ide.open.indexOf(c.id) === -1) ide.open.push(c.id);
      render();
      var nm = root.querySelector("[data-ui~='oop.class-name']");
      if (nm) { nm.focus(); if (nm.select) nm.select(); }
    }

    /* ---------- the file tree (nesting shows inheritance) ---------- */
    function tree() {
      var m = model(), rows = [], seen = {};
      function walk(id, depth) {
        if (seen[id]) return;
        seen[id] = true;
        rows.push({ c: byId(id), depth: depth });
        m.links.filter(function (l) { return l.parent === id; }).forEach(function (l) { walk(l.child, depth + 1); });
      }
      m.classes.forEach(function (c) { var p = baseOf(c.id); if (p == null || !byId(p)) walk(c.id, 0); });
      m.classes.forEach(function (c) { if (!seen[c.id]) walk(c.id, 0); });   // a cycle has no root
      var list = el("ul", { class: "k-ide-files", "aria-label": "Class files" }, rows.map(function (r) { return fileRow(r.c, r.depth); }));
      var node = parts.tree = el("aside", { class: "k-ide-tree", "data-ui": "oop.tree", "aria-label": "Classes" }, [
        el("header", { class: "k-ide-tree-h" }, [
          el("span", { class: "k-kicker", text: "Classes" }),
          el("span", { class: "k-ide-tree-n k-mono", text: String(m.classes.length) }),
          el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "data-ui": "oop.tree-add", "aria-label": "Add class", text: "+", onclick: addClass })
        ]),
        list,
        el("p", { class: "k-ide-tree-foot", text: "Nesting shows inheritance. Drag a file onto another to set its base class." })
      ]);
      return node;
    }
    function fileRow(c, depth) {
      var errs = errorsFor(c.id), on = c.id === sel;
      var li = el("li", { class: "k-ide-file", "data-ui": "oop.file", "data-cid": c.id, draggable: "true", "aria-current": on ? "true" : null });
      li.style.setProperty("--depth", String(depth));
      if (errs.length) KOS.ui.state(li, "error", true);
      if (ide.renaming === c.id) {
        var input = el("input", { type: "text", class: "k-ide-rename", "data-ui": "oop.rename", value: c.name, "aria-label": "Rename " + fileName(c) });
        var why = el("p", { class: "k-ide-rename-why", role: "status" });
        function problem(v) {
          if (!isIdent(v)) return "“" + (v || "(blank)") + "” is not a valid C# class name.";
          if (model().classes.some(function (k) { return k.id !== c.id && k.name === v; })) return "A class named " + v + " already exists. Class names must be unique.";
          return "";
        }
        input.addEventListener("input", function () { why.textContent = problem(input.value.trim()); KOS.ui.state(input, "error", !!why.textContent); });
        input.addEventListener("keydown", function (e) {
          if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); ide.renaming = null; render(); }
          if (e.key === "Enter") {
            e.preventDefault();
            var v = input.value.trim();
            if (problem(v)) return;
            c.name = v; ide.renaming = null; edited(true);
          }
        });
        li.appendChild(el("span", { class: "k-ide-badge k-mono", "aria-hidden": "true", text: "C#" }));
        li.appendChild(el("span", { class: "k-ide-rename-wrap" }, [input, el("span", { class: "k-ide-ext k-mono", text: ".cs" }), why]));
        setTimeout(function () { if (input.isConnected) { input.focus(); input.select(); } }, 0);
        return li;
      }
      var name = el("button", { type: "button", class: "k-ide-file-name", "aria-label": fileName(c) + (c.abstract ? ", abstract" : "") + (errs.length ? ", " + errs.length + " problem" + (errs.length === 1 ? "" : "s") : ""),
        onclick: function () { select(c.id); } }, [
        el("span", { class: "k-ide-badge k-mono", "aria-hidden": "true", text: "C#" }),
        el("span", { class: "k-ide-cls" }, [el("span", { class: c.abstract ? "k-ide-abs" : null, text: identOf(c) }), el("span", { class: "k-ide-ext k-mono", text: ".cs" })])
      ]);
      li.appendChild(name);
      if (c.abstract && !on) li.appendChild(el("span", { class: "k-ide-tag k-mono", text: "abstract" }));
      if (errs.length) li.appendChild(el("span", { class: "k-ide-dot", "aria-hidden": "true" }));
      if (on) {
        li.appendChild(el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "data-ui": "oop.file-rename", "aria-label": "Rename " + fileName(c), text: "✎",
          onclick: function () { ide.renaming = c.id; render(); } }));
        li.appendChild(el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "data-ui": "oop.file-delete", "aria-label": "Delete " + fileName(c), text: "✕",
          onclick: function () {
            KOS.ui.confirm({ title: "Delete " + fileName(c) + "?", body: "The class and its inheritance arrows go.", confirm: "Delete", danger: true }, function () {
              var m = model();
              m.classes = m.classes.filter(function (k) { return k.id !== c.id; });
              m.links = m.links.filter(function (l) { return l.child !== c.id && l.parent !== c.id; });
              edited(true);
            });
          } }));
      }
      /* drag a file onto another to make that one its base */
      li.addEventListener("dragstart", function (e) { e.dataTransfer.setData("text/plain", String(c.id)); e.dataTransfer.effectAllowed = "link"; });
      li.addEventListener("dragover", function (e) { e.preventDefault(); KOS.ui.state(li, "drop", true); });
      li.addEventListener("dragleave", function () { KOS.ui.state(li, "drop", false); });
      li.addEventListener("drop", function (e) {
        e.preventDefault();
        KOS.ui.state(li, "drop", false);
        var child = parseInt(e.dataTransfer.getData("text/plain"), 10);
        if (!isFinite(child) || child === c.id) return;
        if (descendants(child)[c.id]) { KOS.ui.toast("That would create an inheritance cycle.", true); return; }
        setBase(child, c.id);
        KOS.ui.toast(identOf(byId(child)) + " : " + identOf(c) + " — base class set.");
        edited(true);
      });
      return li;
    }

    /* ---------- the editor: the class as rows of pickers that read like code ---------- */
    function tabs() {
      var bar = parts.tabs = el("div", { class: "k-ide-tabs", role: "tablist", "aria-label": "Open files" }, ide.open.map(function (id) {
        var c = byId(id);
        if (!c) return null;
        return el("span", { class: "k-ide-tab", "data-state": id === sel ? "on" : null }, [
          el("button", { type: "button", role: "tab", class: "k-ide-tab-b" + (c.abstract ? " k-ide-abs" : ""), "data-ui": "oop.tab",
            "aria-selected": String(id === sel), text: fileName(c), onclick: function () { select(id); } }),
          el("button", { type: "button", class: "k-ide-tab-x", "aria-label": "Close " + fileName(c), text: "×", onclick: function () {
            ide.open = ide.open.filter(function (x) { return x !== id; });
            if (id === sel && ide.open.length) { select(ide.open[ide.open.length - 1]); return; }
            render();
          } })
        ]);
      }).filter(Boolean));
      return bar;
    }
    var typeList = null;
    function typesList() {
      if (typeList && typeList.isConnected) typeList.remove();
      typeList = el("datalist", { id: "oop-types" }, TYPES.concat(["void"]).concat(model().classes.map(identOf)).map(function (t) { return el("option", { value: t }); }));
      return typeList;
    }
    function editor() {
      var wrap = el("div", { class: "k-ide-editor", "data-ui": "oop.editor" });
      wrap.appendChild(tabs());
      var c = sel != null ? byId(sel) : null;
      if (!c) {
        wrap.appendChild(el("div", { class: "k-ide-empty", "data-ui": "oop.empty" }, [
          el("b", { text: "No classes yet" }),
          el("p", { text: "A class is a file here: add one, then give it fields and methods." }),
          el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: "+ Add class", onclick: addClass })
        ]));
        return wrap;
      }
      var doc = el("ol", { class: "k-ide-doc k-mono", "aria-label": fileName(c) });
      wrap.appendChild(typesList());
      /* 1 · the header: public [abstract] class Name : Base ▾ */
      var nameIn = el("input", { type: "text", class: "k-ide-in k-ide-name" + (c.abstract ? " k-ide-abs" : ""), "data-ui": "oop.class-name",
        value: c.name, "aria-label": "Class name", size: String(Math.max(4, c.name.length + 1)) });
      nameIn.addEventListener("input", function () { c.name = nameIn.value.trim(); nameIn.size = Math.max(4, nameIn.value.length + 1); edited(false); });
      var abs = el("button", { type: "button", class: "k-ide-chip", "data-ui": "oop.abstract", "data-kind": "abstract", "aria-pressed": String(c.abstract),
        text: "abstract", title: c.abstract ? "Abstract — cannot be instantiated" : "Make this class abstract",
        onclick: function () { c.abstract = !c.abstract; edited(true); } });
      var own = descendants(c.id);
      var baseSel = el("select", { class: "k-ide-pick k-ide-base", "data-ui": "oop.base", "aria-label": "Base class" },
        [el("option", { value: "", text: "no base" })].concat(model().classes.filter(function (k) {
          return k.id !== c.id && !own[k.id];   // its own subclasses would close a loop
        }).map(function (k) { return el("option", { value: String(k.id), text: identOf(k) }); })));
      var cur = baseOf(c.id);
      if (cur != null && !baseSel.querySelector("option[value='" + cur + "']") && byId(cur)) {
        baseSel.appendChild(el("option", { value: String(cur), text: identOf(byId(cur)) }));   // a loop that arrived another way stays visible
      }
      baseSel.value = cur != null ? String(cur) : "";
      baseSel.addEventListener("change", function () { setBase(c.id, baseSel.value ? parseInt(baseSel.value, 10) : null); edited(true); });
      function line(kids, cls, hook) { var li = el("li", { class: "k-ide-line" + (cls ? " " + cls : ""), "data-ui": hook || null }, kids); doc.appendChild(li); return li; }
      function tok(t, cls) { return el("span", { class: cls, text: t }); }
      line([tok("public", "k-cs-kw"), abs, tok("class", "k-cs-kw"), nameIn, tok(":", "k-ide-punct"), baseSel], "k-ide-head", "oop.header");
      parts.errLine = line([], "k-ide-errline", "oop.errors");
      parts.errLine.hidden = true;
      parts.head = nameIn; parts.base = baseSel;
      line([tok("{", "k-ide-punct")]);
      var inherited = [];
      model() && (function () {
        var chain = ancestors(model(), c.id);
        chain.forEach(function (aid) {
          var a = byId(aid);
          if (!a) return;
          a.fields.forEach(function (f) { if (f.acc !== "private") inherited.push(f.name); });
          a.methods.forEach(function (mt) { if (mt.acc !== "private") inherited.push(mt.name + "()"); });
        });
        if (chain.length && byId(chain[0])) line([tok("// Inherited from " + identOf(byId(chain[0])) + (inherited.length ? ": " + inherited.join(", ") : ": nothing it can see"), "k-cs-cm")], "k-ide-in1");
      })();
      line([], "k-ide-blank");
      line([tok("// Fields", "k-cs-cm")], "k-ide-in1");
      c.fields.forEach(function (f, i) { line(memberRow(c, f, i, "fields"), "k-ide-in1 k-ide-member", "oop.field"); });
      line([el("button", { type: "button", class: "k-ide-add", "data-ui": "oop.add-field", text: "+ Add field", onclick: function () {
        c.fields.push({ acc: "private", type: "int", name: "field" + (c.fields.length + 1) });
        edited(true);
        var rows = root.querySelectorAll("[data-ui~='oop.field'] [data-ui~='oop.member-name']");
        if (rows.length) { rows[rows.length - 1].focus(); rows[rows.length - 1].select(); }
      } })], "k-ide-in1");
      line([], "k-ide-blank");
      line([tok("// Methods", "k-cs-cm")], "k-ide-in1");
      c.methods.forEach(function (mt, i) { line(memberRow(c, mt, i, "methods"), "k-ide-in1 k-ide-member", "oop.method"); });
      line([el("button", { type: "button", class: "k-ide-add", "data-ui": "oop.add-method", text: "+ Add method", onclick: function () {
        c.methods.push({ acc: "public", type: "void", name: "Method" + (c.methods.length + 1), virt: "none" });
        edited(true);
        var rows = root.querySelectorAll("[data-ui~='oop.method'] [data-ui~='oop.member-name']");
        if (rows.length) { rows[rows.length - 1].focus(); rows[rows.length - 1].select(); }
      } })], "k-ide-in1");
      line([tok("}", "k-ide-punct")]);
      wrap.appendChild(doc);
      return wrap;
    }
    /* the methods a class may override: virtual, abstract or override above it */
    function overridable(c) {
      var out = [], seen = {};
      ancestors(model(), c.id).forEach(function (aid) {
        var a = byId(aid);
        if (a) a.methods.forEach(function (mt) { if (mt.virt !== "none" && !seen[mt.name]) { seen[mt.name] = true; out.push({ name: mt.name, type: mt.type, from: identOf(a) }); } });
      });
      return out;
    }
    function memberRow(c, mem, idx, kind) {
      var acc = el("select", { class: "k-ide-pick k-ide-acc", "data-ui": "oop.access", "aria-label": "Access" }, ACCESS.map(function (a) { return el("option", { value: a, text: a }); }));
      acc.value = mem.acc;
      acc.addEventListener("change", function () { mem.acc = acc.value; edited(false); });
      var kids = [acc];
      var list = null;
      if (kind === "methods") {
        var mod = el("select", { class: "k-ide-pick k-ide-mod", "data-ui": "oop.modifier", "aria-label": "Modifier", "data-virt": mem.virt },
          VIRT.map(function (v) {
            var o = el("option", { value: v, text: v === "abstract" && !c.abstract ? "abstract — " + identOf(c) + " isn't abstract" : v });
            if (v === "abstract" && !c.abstract && mem.virt !== "abstract") o.disabled = true;
            return o;
          }));
        mod.value = mem.virt;
        mod.addEventListener("change", function () { mem.virt = mod.value; edited(true); });
        kids.push(mod);
        var ov = overridable(c);
        if (mem.virt === "override" && ov.length) {
          list = el("datalist", { id: "oop-ov-" + c.id + "-" + idx }, ov.map(function (o) { return el("option", { value: o.name, label: "from " + o.from + " · " + o.type }); }));
        }
      }
      var type = el("input", { type: "text", class: "k-ide-in k-ide-type", "data-ui": "oop.member-type", value: mem.type, list: "oop-types", "aria-label": "Type", size: String(Math.max(3, mem.type.length + 1)) });
      type.addEventListener("input", function () { mem.type = type.value.trim(); type.size = Math.max(3, type.value.length + 1); edited(false); });
      var name = el("input", { type: "text", class: "k-ide-in k-ide-mname", "data-ui": "oop.member-name", value: mem.name, "aria-label": kind === "methods" ? "Method name" : "Field name",
        list: list ? list.id : null, size: String(Math.max(3, mem.name.length + 1)), "data-name": mem.name });
      name.addEventListener("input", function () {
        mem.name = name.value.trim();
        name.size = Math.max(3, name.value.length + 1);
        name.setAttribute("data-name", mem.name);
        /* choosing an overridable method fills in its return type */
        if (kind === "methods" && mem.virt === "override") {
          var hit = overridable(c).filter(function (o) { return o.name === mem.name; })[0];
          if (hit && mem.type !== hit.type) { mem.type = hit.type; type.value = hit.type; }
        }
        edited(false);
      });
      name.addEventListener("keydown", function (e) {
        if (e.key === "Enter") { e.preventDefault(); root.querySelector(kind === "methods" ? "[data-ui~='oop.add-method']" : "[data-ui~='oop.add-field']").click(); }
      });
      kids.push(type, name);
      if (list) kids.push(list);
      kids.push(el("span", { class: "k-ide-punct", text: kind === "methods" ? "();" : ";" }));
      kids.push(el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm k-ide-rm", "data-ui": "oop.member-remove",
        "aria-label": "Remove " + (mem.name || "member"), text: "✕", onclick: function () { c[kind].splice(idx, 1); edited(true); } }));
      return kids;
    }
    /* the class's problems sit under its header; a member's mark its name */
    function paintErrors() {
      var c = sel != null ? byId(sel) : null;
      if (!c || !parts.errLine || !root.contains(parts.errLine)) return;
      var errs = errorsFor(c.id);
      parts.errLine.innerHTML = "";
      parts.errLine.hidden = !errs.length;
      var loop = errs.some(function (e) { return e.code === "cycle" || e.code === "multiple-bases"; });
      KOS.ui.state(parts.base, "error", loop);
      KOS.ui.state(parts.head, "error", errs.some(function (e) { return e.code === "invalid-name" && !e.member || e.code === "duplicate-class"; }));
      root.querySelectorAll("[data-ui~='oop.member-name']").forEach(function (n) {
        var hit = errs.filter(function (e) { return e.member && e.member === n.getAttribute("data-name"); })[0];
        KOS.ui.state(n, "error", !!hit);
        n.title = hit ? hit.message : "";
      });
      var classErrs = errs.filter(function (e) { return !e.member; });
      if (!classErrs.length && !errs.length) return;
      var shown = classErrs.length ? classErrs : errs;
      parts.errLine.appendChild(el("div", { class: "k-ide-err", role: "alert" }, [
        el("span", { class: "k-ide-err-mark", "aria-hidden": "true", text: "!" }),
        el("span", { class: "k-ide-err-t" }, shown.slice(0, 3).map(function (e) {
          return el("span", { text: (e.code === "cycle" ? "Inheritance cycle: " : "") + pathText(e, c) });
        })),
        loop ? el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "oop.remove-base", text: "Remove base",
          onclick: function () { setBase(c.id, null); edited(true); } }) : null
      ].filter(Boolean)));
    }
    function pathText(e, c) {
      if (e.code !== "cycle") return e.message;
      var names = [identOf(c)], p = baseOf(c.id), hops = 0;
      while (p != null && hops++ <= model().classes.length) { names.push(identOf(byId(p))); if (p === c.id) break; p = baseOf(p); }
      return names.join(" → ") + ". A class can't inherit from its own subclass.";
    }

    /* ---------- the generated C# (beside the editor, or as its own tab) ---------- */
    function csPanel(side) {
      var live = check.ok, code = live ? transpileModel(model()) : (ide.lastValid || transpileModel(model()));
      var lines = code.split("\n");
      /* the selected class's block is lit in the whole file */
      var c = sel != null ? byId(sel) : null, from = -1, to = -1;
      if (c) {
        var head = new RegExp("^    public (abstract )?class " + identOf(c) + "( |$)");
        lines.forEach(function (ln, i) { if (from < 0 && head.test(ln)) from = i; });
        if (from >= 0) for (var j = from + 1; j < lines.length; j++) { if (lines[j] === "    }") { to = j; break; } }
      }
      var pre = el("pre", { class: "k-mono k-ide-code" });
      pre.innerHTML = lines.map(function (ln, i) {
        return '<span class="k-ide-cl"' + (i >= from && i <= to ? ' data-state="lit"' : "") + ">" + highlight(ln) + "</span>";
      }).join("\n");
      var node = parts.cs = el("aside", { id: "oop-code", class: "k-ide-cs", "data-ui": "oop.cs", "data-side": side ? "" : null, "aria-label": "Generated C#" }, [
        el("header", { class: "k-ide-cs-h" }, [
          el("span", { class: "k-ide-badge k-mono", "aria-hidden": "true", text: "C#" }),
          el("b", { text: "Generated" }),
          el("span", { class: "k-ide-cs-meta", text: model().classes.length + (model().classes.length === 1 ? " class" : " classes") + " · " + lines.length + " lines" }),
          el("span", { class: "k-spacer" }),
          side ? el("button", { type: "button", class: "k-btn k-btn--quiet k-btn--sm", "data-ui": "oop.cs-to-tab", text: "⤢ Tab",
            onclick: function () { setView({ mode: "code", cs: "tab" }); render(); } }) : el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "oop.cs-copy", text: "Copy C#",
            onclick: function () { if (check.ok) copyText(transpileModel(model())); } }),
          el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "aria-label": side ? "Close the C# panel" : "Back to the editor", text: "✕",
            onclick: function () { setView(side ? { side: false } : { cs: "side" }); render(); } })
        ]),
        live ? null : el("p", { class: "k-ide-paused", role: "status" }, [el("b", { text: "C# paused. " }), "Showing the last version that compiled. Fix the problem to resume."]),
        pre
      ].filter(Boolean));
      if (!live) KOS.ui.state(node, "paused", true);
      return node;
    }

    /* ---------- Diagram mode: an infinite canvas ---------- */
    function diagram() {
      var m = model(), v = viewState();
      var canvas = el("div", { class: "k-ide-canvas", "data-ui": "oop.canvas", tabindex: "0", "aria-label": "Class diagram" });
      if (!m.classes.length) {
        canvas.appendChild(el("div", { class: "k-ide-empty", "data-ui": "oop.empty" }, [
          el("b", { text: "Start with a class" }),
          el("p", { text: "Each class is a card here and a file in the tree. Add one, then draw its base from the editor or by dragging files." }),
          el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: "+ Add class", onclick: addClass })
        ]));
        return canvas;
      }
      canvas.appendChild(el("span", { class: "k-ide-hint", text: "Drag to pan · ⌘ + scroll to zoom · double-click a card to edit" }));
      canvas.appendChild(el("span", { class: "k-ide-key k-mono", "aria-hidden": "true" }, [
        el("b", { text: "+" }), " public ", el("b", { text: "−" }), " private ", el("b", { text: "#" }), " protected ", el("i", { text: "—▷" }), " inherits"
      ]));
      var world = el("div", { class: "k-ide-world" });
      var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("class", "k-ide-links");
      svg.setAttribute("width", "1"); svg.setAttribute("height", "1");
      world.appendChild(svg);
      var cards = {};
      m.classes.forEach(function (c) {
        var sym = { "public": "+", "private": "−", "protected": "#" };
        var card = el("article", { class: "k-ide-card", "data-ui": "oop.card", "data-cid": c.id, "aria-label": identOf(c) + (c.abstract ? ", abstract" : ""),
          "aria-current": c.id === sel ? "true" : null }, [
          el("header", { class: "k-ide-card-h" }, [
            c.abstract ? el("span", { class: "k-ide-stereo", text: "«abstract»" }) : null,
            el("b", { class: c.abstract ? "k-ide-abs" : null, text: identOf(c) })
          ].filter(Boolean)),
          c.fields.length ? el("ul", { class: "k-ide-card-l" }, c.fields.map(function (f) { return el("li", { text: sym[f.acc] + " " + f.name + " : " + f.type }); })) : null,
          c.methods.length ? el("ul", { class: "k-ide-card-l" }, c.methods.map(function (mt) {
            var isAbs = mt.virt === "abstract";
            return el("li", { class: isAbs ? "k-ide-abs" : null, text: sym[mt.acc] + " " + mt.name + "() : " + mt.type });
          })) : null
        ].filter(Boolean));
        card.style.setProperty("--x", c.x + "px");
        card.style.setProperty("--y", c.y + "px");
        if (errorsFor(c.id).length) KOS.ui.state(card, "error", true);
        cards[c.id] = card;
        world.appendChild(card);
        card.addEventListener("click", function () { if (!card.dataset.moved) select(c.id, "diagram"); });
        card.addEventListener("dblclick", function () { select(c.id, "code"); });
        card.addEventListener("pointerdown", function (e) {
          if (e.button !== 0) return;
          e.stopPropagation();
          var sx = e.clientX, sy = e.clientY, x0 = c.x, y0 = c.y, z = cur.zoom;
          delete card.dataset.moved;
          function move(ev) {
            var dx = (ev.clientX - sx) / z, dy = (ev.clientY - sy) / z;
            if (Math.abs(dx) + Math.abs(dy) > 3) card.dataset.moved = "1";
            c.x = Math.round(x0 + dx); c.y = Math.round(y0 + dy);
            card.style.setProperty("--x", c.x + "px"); card.style.setProperty("--y", c.y + "px");
            drawLinks(); paintMini();
          }
          function up() {
            document.removeEventListener("pointermove", move); document.removeEventListener("pointerup", up);
            if (card.dataset.moved) { save(); setTimeout(function () { delete card.dataset.moved; }, 0); }
          }
          document.addEventListener("pointermove", move); document.addEventListener("pointerup", up);
        });
      });
      canvas.appendChild(world);
      var cur = { x: v.x, y: v.y, zoom: v.zoom };
      var framed = store.state.ui && store.state.ui.oopView && store.state.ui.oopView.framed;
      function apply() {
        world.style.setProperty("--wx", cur.x + "px");
        world.style.setProperty("--wy", cur.y + "px");
        world.style.setProperty("--wz", String(cur.zoom));
        pct.textContent = Math.round(cur.zoom * 100) + "%";
        paintMini();
        if (parts.status) { var z = parts.status.querySelector("[data-ui~='oop.zoom-read']"); if (z) z.textContent = Math.round(cur.zoom * 100) + "%"; }
      }
      var persist = null;
      function keep() { clearTimeout(persist); persist = setTimeout(function () { setView({ x: cur.x, y: cur.y, zoom: cur.zoom, framed: true }); }, 250); }
      function drawLinks() {
        while (svg.firstChild) svg.removeChild(svg.firstChild);
        var NS = "http://www.w3.org/2000/svg";
        m.links.forEach(function (l) {
          var a = byId(l.child), b = byId(l.parent), ca = cards[l.child], cb = cards[l.parent];
          if (!a || !b) return;
          var aw = (ca && ca.offsetWidth) || CARD.w, bw = (cb && cb.offsetWidth) || CARD.w, bh = (cb && cb.offsetHeight) || CARD.h;
          var x1 = a.x + aw / 2, y1 = a.y, x2 = b.x + bw / 2, y2 = b.y + bh + 14;
          var mid = y2 + Math.max(12, (y1 - y2) / 2);
          var path = document.createElementNS(NS, "path");
          path.setAttribute("class", "k-ide-link");
          path.setAttribute("d", y1 > y2 ? "M" + x1 + "," + y1 + " V" + mid + " H" + x2 + " V" + y2 : "M" + x1 + "," + y1 + " L" + x2 + "," + y2);
          svg.appendChild(path);
          var tri = document.createElementNS(NS, "path");
          tri.setAttribute("class", "k-ide-tri");
          tri.setAttribute("d", "M" + x2 + "," + (y2 - 14) + " l-9,14 h18 z");
          svg.appendChild(tri);
        });
      }
      /* the minimap: every class and the crimson viewport; press to move */
      var mini = el("div", { class: "k-ide-mini", "data-ui": "oop.minimap", "aria-hidden": "true" });
      var msvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      mini.appendChild(msvg);
      canvas.appendChild(mini);
      var MW = 160, MH = 100, box = null;
      function bounds() {
        var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
        m.classes.forEach(function (c) { x0 = Math.min(x0, c.x); y0 = Math.min(y0, c.y); x1 = Math.max(x1, c.x + CARD.w); y1 = Math.max(y1, c.y + CARD.h); });
        var vw = canvas.clientWidth || 800, vh = canvas.clientHeight || 500;
        var vx0 = -cur.x / cur.zoom, vy0 = -cur.y / cur.zoom;
        x0 = Math.min(x0, vx0); y0 = Math.min(y0, vy0); x1 = Math.max(x1, vx0 + vw / cur.zoom); y1 = Math.max(y1, vy0 + vh / cur.zoom);
        return { x0: x0 - 40, y0: y0 - 40, x1: x1 + 40, y1: y1 + 40, vw: vw, vh: vh, vx0: vx0, vy0: vy0 };
      }
      function paintMini() {
        var b = box = bounds(), s = Math.min(MW / (b.x1 - b.x0), MH / (b.y1 - b.y0));
        box.s = s;
        msvg.setAttribute("viewBox", "0 0 " + MW + " " + MH);
        while (msvg.firstChild) msvg.removeChild(msvg.firstChild);
        function rect(cls, x, y, w, h) {
          var r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
          r.setAttribute("class", cls);
          r.setAttribute("x", x.toFixed(1)); r.setAttribute("y", y.toFixed(1));
          r.setAttribute("width", w.toFixed(1)); r.setAttribute("height", h.toFixed(1)); r.setAttribute("rx", "2");
          msvg.appendChild(r);
        }
        m.classes.forEach(function (c) {
          rect(c.id === sel ? "k-ide-mini-c k-ide-mini-on" : "k-ide-mini-c", (c.x - b.x0) * s, (c.y - b.y0) * s, CARD.w * s, CARD.h * s);
        });
        rect("k-ide-mini-v", (b.vx0 - b.x0) * s, (b.vy0 - b.y0) * s, b.vw / cur.zoom * s, b.vh / cur.zoom * s);
      }
      mini.addEventListener("pointerdown", function (e) {
        e.stopPropagation();
        function go(ev) {
          var r = mini.getBoundingClientRect(), b = box;
          if (!b || !r.width) return;
          var wx = b.x0 + (ev.clientX - r.left) * (MW / r.width) / b.s, wy = b.y0 + (ev.clientY - r.top) * (MH / r.height) / b.s;
          cur.x = b.vw / 2 - wx * cur.zoom; cur.y = b.vh / 2 - wy * cur.zoom;
          apply(); keep();
        }
        go(e);
        function up() { document.removeEventListener("pointermove", go); document.removeEventListener("pointerup", up); }
        document.addEventListener("pointermove", go); document.addEventListener("pointerup", up);
      });
      /* pan the background; ⌘/Ctrl + wheel zooms about the pointer */
      canvas.addEventListener("pointerdown", function (e) {
        if (e.button !== 0 || e.target.closest(".k-ide-card, .k-ide-zoom, .k-ide-mini")) return;
        var sx = e.clientX, sy = e.clientY, x0 = cur.x, y0 = cur.y;
        KOS.ui.state(canvas, "panning", true);
        function move(ev) { cur.x = x0 + ev.clientX - sx; cur.y = y0 + ev.clientY - sy; apply(); }
        function up() { document.removeEventListener("pointermove", move); document.removeEventListener("pointerup", up); KOS.ui.state(canvas, "panning", false); keep(); }
        document.addEventListener("pointermove", move); document.addEventListener("pointerup", up);
      });
      canvas.addEventListener("wheel", function (e) {
        if (!(e.ctrlKey || e.metaKey)) return;
        e.preventDefault();
        var r = canvas.getBoundingClientRect();
        var z = zoomAt(cur, e.deltaY < 0 ? 1.1 : 1 / 1.1, e.clientX - r.left, e.clientY - r.top);
        cur.x = z.x; cur.y = z.y; cur.zoom = z.zoom; apply(); keep();
      }, { passive: false });
      var pct = el("span", { class: "k-ide-zoom-v k-mono", "data-ui": "oop.zoom-value" });
      function zoomBy(f) { var z = zoomAt(cur, f, (canvas.clientWidth || 800) / 2, (canvas.clientHeight || 500) / 2); cur.x = z.x; cur.y = z.y; cur.zoom = z.zoom; apply(); keep(); }
      canvas.appendChild(el("div", { class: "k-ide-zoom", "data-ui": "oop.zoom", role: "group", "aria-label": "Zoom" }, [
        el("button", { type: "button", class: "k-ide-zoom-b", "aria-label": "Zoom out", text: "−", onclick: function () { zoomBy(1 / 1.2); } }),
        pct,
        el("button", { type: "button", class: "k-ide-zoom-b", "aria-label": "Zoom in", text: "+", onclick: function () { zoomBy(1.2); } }),
        el("button", { type: "button", class: "k-ide-zoom-b", "data-ui": "oop.fit", text: "Fit", onclick: function () {
          var f = fit(m, canvas.clientWidth || 800, canvas.clientHeight || 500);
          cur.x = f.x; cur.y = f.y; cur.zoom = f.zoom; apply(); keep();
        } })
      ]));
      apply();
      setTimeout(function () {
        /* never framed here: open on the whole model (a read — nothing is saved until you move it) */
        if (!framed && canvas.clientWidth) { var f = fit(m, canvas.clientWidth, canvas.clientHeight, 56); cur.x = f.x; cur.y = f.y; cur.zoom = f.zoom; apply(); }
        drawLinks(); paintMini();
      }, 0);
      drawLinks();
      return canvas;
    }

    /* ---------- the status bar ---------- */
    function status() {
      var n = check.errors.length, v = viewState(), c = sel != null ? byId(sel) : null;
      var lines = (check.ok ? transpileModel(model()) : (ide.lastValid || "")).split("\n").length;
      var first = check.errors[0];
      return el("footer", { class: "k-ide-status k-mono", "data-ui": "oop.status" }, [
        el("span", { class: "k-ide-st-dot", "data-tone": n ? "red" : "green", "aria-hidden": "true" }),
        el("span", { class: "k-ide-st-p", "data-tone": n ? "red" : null, title: first ? first.message : null, text: n ? n + (n === 1 ? " problem" : " problems") : "No problems" }),
        el("span", { text: model().classes.length + (model().classes.length === 1 ? " class" : " classes") }),
        c ? el("span", { text: fileName(c) + (v.mode === "diagram" ? " selected" : "") }) : null,
        v.mode === "diagram" ? el("span", { "data-ui": "oop.zoom-read", text: Math.round(v.zoom * 100) + "%" }) : null,
        n && first ? el("span", { text: first.code.replace(/-/g, " ") }) : null,
        el("span", { class: "k-spacer" }),
        el("span", { text: "Saved on this device" }),
        el("span", { text: "C# " + lines })
      ].filter(Boolean));
    }

    render();
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
