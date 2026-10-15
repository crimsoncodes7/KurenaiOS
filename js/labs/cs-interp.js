/* Kurenai OS — labs/cs-interp.js
   CSI, the in-app C# runner (roadmap 5.3, docs/code-plan.md §7, decision A).

   A C#-subset interpreter for units 1–6: lexer → parser → a light compile
   check (CS0103 and friends) → a tree-walking evaluator with a step budget,
   fake stdin/stdout and C#-shaped errors. Anything outside the subset says
   "not supported yet" instead of guessing.

   THE SANDBOX (a Code invariant). Learner code runs here and nowhere else:
   in a Worker (js/core/coderun.js starts it from this same file) with
   fetch, XMLHttpRequest, importScripts and WebSocket removed, no DOM and
   no app data. Only on a page served from file:// — where browsers refuse
   workers — does it run in the page, still with no access to the store.

   It is PURE and runs in Node too (module.exports), which is how the smoke
   suites and tools/cs_diff.mjs check every shipped listing and reference
   solution against it.

   run({files:[{name,src}], stdin, mode:"program"|"method"|"tests",
        call:{name,args}, budget, ms})
     → {ok, stdout, value?, tests?, error:{code,kind,msg,line,file},
        steps, ms, constructs}
   Worker protocol: postMessage({id, req}) → {id, res}.                    */
(function (root) {
  "use strict";

  // ───────────────────────── errors ─────────────────────────
  class CsError extends Error {
    constructor(code, msg, line, kind, file) {
      super(msg);
      this.code = code; this.line = line || 0; this.kind = kind || "compile"; this.file = file || "";
    }
  }
  const unsupported = (what, line) =>
    new CsError("NS0001", "Not supported yet in the in-app runner: " + what + ". This needs the full .NET runtime (units 7–12).", line, "unsupported");

  // ───────────────────────── lexer ─────────────────────────
  const KW = new Set(("abstract as base bool break byte case catch char class const continue decimal default do double else enum " +
    "false finally float for foreach if in int interface internal is long namespace new null object out override params private " +
    "protected public readonly ref return sealed short static string struct switch this throw true try typeof uint ulong using " +
    "virtual void while").split(" "));
  const PRIM = new Set(["int", "long", "short", "byte", "uint", "ulong", "double", "float", "decimal", "bool", "char", "string", "object", "void"]);
  const OPS = ["??=", "<=", ">=", "==", "!=", "&&", "||", "++", "--", "+=", "-=", "*=", "/=", "%=", "=>", "??", "?.",
    "+", "-", "*", "/", "%", "<", ">", "=", "!", "?", ":", ";", ",", ".", "(", ")", "{", "}", "[", "]", "&", "|", "^", "~"];

  function lex(src, file) {
    const toks = []; let i = 0, line = 1; const n = src.length;
    const err = (m) => { throw new CsError("CS1010", m, line, "compile", file); };
    function readEsc() {
      const c = src[++i];
      const map = { n: "\n", t: "\t", r: "\r", "0": "\0", "\\": "\\", "'": "'", '"': '"' };
      if (c in map) { i++; return map[c]; }
      if (c === "u") { const h = src.substr(i + 1, 4); i += 5; return String.fromCharCode(parseInt(h, 16)); }
      err("Unrecognized escape sequence"); return "";
    }
    function readString(verbatim) { // i at opening quote
      let s = ""; i++;
      while (true) {
        if (i >= n || (!verbatim && src[i] === "\n")) throw new CsError("CS1010", "Newline in constant", line, "compile", file);
        const c = src[i];
        if (verbatim && c === '"' && src[i + 1] === '"') { s += '"'; i += 2; continue; }
        if (c === '"') { i++; return s; }
        if (!verbatim && c === "\\") { s += readEsc(); continue; }
        if (c === "\n") line++;
        s += c; i++;
      }
    }
    function readInterp(verbatim) { // i at opening quote
      const parts = []; let buf = ""; i++;
      while (true) {
        if (i >= n || (!verbatim && src[i] === "\n")) throw new CsError("CS1010", "Newline in constant", line, "compile", file);
        const c = src[i];
        if (c === "{" && src[i + 1] === "{") { buf += "{"; i += 2; continue; }
        if (c === "}" && src[i + 1] === "}") { buf += "}"; i += 2; continue; }
        if (c === '"' && verbatim && src[i + 1] === '"') { buf += '"'; i += 2; continue; }
        if (c === '"') { i++; if (buf) parts.push(buf); return parts; }
        if (!verbatim && c === "\\") { buf += readEsc(); continue; }
        if (c === "{") {
          if (buf) parts.push(buf); buf = "";
          i++; let depth = 0, expr = "", align = null, fmt = null, cur = "expr";
          while (i < n) {
            const d = src[i];
            if (d === '"') { // nested string inside a hole
              const st = i; readString(false); const raw = src.slice(st, i);
              if (cur === "expr") expr += raw; else if (cur === "fmt") fmt += raw; continue;
            }
            if (d === "'") { const st = i; i++; if (src[i] === "\\") i++; i += 2; const raw = src.slice(st, i); if (cur === "expr") expr += raw; continue; }
            if (cur === "fmt") { if (d === "}") { i++; break; } fmt += d; i++; continue; }
            if ("([{".includes(d)) depth++;
            if (")]".includes(d)) depth--;
            if (d === "}") { if (depth === 0) { i++; break; } depth--; }
            if (depth === 0 && d === ":" && cur !== "fmt") {
              // a ?: ternary needs parentheses in C# holes, so a top-level ':' is the format
              cur = "fmt"; fmt = ""; i++; continue;
            }
            if (depth === 0 && d === "," && cur === "expr") { cur = "align"; align = ""; i++; continue; }
            if (cur === "expr") expr += d; else if (cur === "align") align += d;
            i++;
          }
          parts.push({ expr: expr.trim(), align: align === null ? null : parseInt(align, 10), fmt, line });
          continue;
        }
        if (c === "\n") line++;
        buf += c; i++;
      }
    }
    while (i < n) {
      const c = src[i];
      if (c === "\n") { line++; i++; continue; }
      if (c === " " || c === "\t" || c === "\r") { i++; continue; }
      if (c === "/" && src[i + 1] === "/") { while (i < n && src[i] !== "\n") i++; continue; }
      if (c === "/" && src[i + 1] === "*") { i += 2; while (i < n && !(src[i] === "*" && src[i + 1] === "/")) { if (src[i] === "\n") line++; i++; } i += 2; continue; }
      if (c === "#") { while (i < n && src[i] !== "\n") i++; continue; }
      const L = line;
      if (/[A-Za-z_]/.test(c) || (c === "@" && /[A-Za-z_]/.test(src[i + 1] || ""))) {
        const at = c === "@"; if (at) i++;
        let s = ""; while (i < n && /[A-Za-z0-9_]/.test(src[i])) s += src[i++];
        toks.push({ t: !at && KW.has(s) ? "kw" : "id", v: s, line: L }); continue;
      }
      if (/[0-9]/.test(c) || (c === "." && /[0-9]/.test(src[i + 1] || ""))) {
        let s = "", dbl = false;
        if (c === "0" && /[xX]/.test(src[i + 1])) { i += 2; while (/[0-9a-fA-F_]/.test(src[i] || "")) s += src[i++]; toks.push({ t: "num", v: parseInt(s.replace(/_/g, ""), 16), dbl: false, line: L }); continue; }
        while (/[0-9_]/.test(src[i] || "")) s += src[i++];
        if (src[i] === "." && /[0-9]/.test(src[i + 1] || "")) { dbl = true; s += src[i++]; while (/[0-9_]/.test(src[i] || "")) s += src[i++]; }
        if (/[eE]/.test(src[i] || "")) { dbl = true; s += src[i++]; if (/[+-]/.test(src[i])) s += src[i++]; while (/[0-9]/.test(src[i] || "")) s += src[i++]; }
        let dec = false;
        if (/[mM]/.test(src[i] || "")) { dbl = true; dec = true; i++; }
        else if (/[dDfF]/.test(src[i] || "")) { dbl = true; i++; }
        let lng = false;
        if (!dbl && /[lLuU]/.test(src[i] || "")) { lng = /[lL]/.test(src[i]); i++; if (/[lLuU]/.test(src[i] || "")) { lng = lng || /[lL]/.test(src[i]); i++; } }
        toks.push({ t: "num", v: parseFloat(s.replace(/_/g, "")), dbl, dec, lng, line: L }); continue;
      }
      if (c === '"') { toks.push({ t: "str", v: readString(false), line: L }); continue; }
      if (c === "@" && src[i + 1] === '"') { i++; toks.push({ t: "str", v: readString(true), line: L }); continue; }
      if (c === "$" && src[i + 1] === '"') { i++; toks.push({ t: "interp", v: readInterp(false), line: L }); continue; }
      if ((c === "$" && src[i + 1] === "@" && src[i + 2] === '"') || (c === "@" && src[i + 1] === "$" && src[i + 2] === '"')) { i += 2; toks.push({ t: "interp", v: readInterp(true), line: L }); continue; }
      if (c === "'") {
        i++; let ch;
        if (src[i] === "\\") ch = readEsc(); else ch = src[i++];
        if (src[i] !== "'") throw new CsError("CS1012", "Too many characters in character literal", L, "compile", file);
        i++; toks.push({ t: "chr", v: ch, line: L }); continue;
      }
      const op = OPS.find((o) => src.startsWith(o, i));
      if (!op) throw new CsError("CS1056", "Unexpected character '" + c + "'", L, "compile", file);
      toks.push({ t: "op", v: op, line: L }); i += op.length;
    }
    toks.push({ t: "eof", v: "<end of file>", line });
    return toks;
  }

  // ───────────────────────── parser ─────────────────────────
  const MODS = new Set(["public", "private", "protected", "internal", "static", "abstract", "virtual", "override", "sealed", "readonly", "const", "async", "partial", "new", "extern", "unsafe", "volatile", "required"]);

  function parse(src, file) {
    const toks = lex(src, file); let p = 0;
    const peek = (k) => toks[p + (k || 0)];
    const next = () => toks[p++];
    const isOp = (v, k) => { const t = peek(k); return t.t === "op" && t.v === v; };
    const isKw = (v, k) => { const t = peek(k); return t.t === "kw" && t.v === v; };
    const isId = (v, k) => { const t = peek(k); return t.t === "id" && (v === undefined || t.v === v); };
    const acc = (v) => { const t = peek(); if ((t.t === "op" || t.t === "kw") && t.v === v) { p++; return true; } return false; };
    const prevLine = () => (p > 0 ? toks[p - 1].line : 1);
    function expect(v) {
      if (acc(v)) return;
      const t = peek();
      if (v === ";") throw new CsError("CS1002", "; expected", prevLine(), "compile", file);
      if (v === ")") throw new CsError("CS1026", ") expected", t.line, "compile", file);
      if (v === "}") throw new CsError("CS1513", "} expected", t.line, "compile", file);
      if (v === "{") throw new CsError("CS1514", "{ expected", t.line, "compile", file);
      throw new CsError("CS1003", "Syntax error, '" + v + "' expected (found '" + t.v + "')", t.line, "compile", file);
    }
    function ident() {
      const t = peek();
      if (t.t === "id") { p++; return t.v; }
      throw new CsError("CS1001", "Identifier expected (found '" + t.v + "')", t.line, "compile", file);
    }

    // types: returns {name, args, arr, tuple?, names?} or null (never throws)
    function tryType() {
      const save = p; const t = peek();
      if (t.t === "op" && t.v === "(") { // tuple type
        p++; const els = [], names = [];
        while (true) {
          const ty = tryType(); if (!ty) { p = save; return null; }
          els.push(ty); names.push(isId() && (isOp(",", 1) || isOp(")", 1)) ? next().v : null);
          if (acc(",")) continue;
          if (acc(")")) break;
          p = save; return null;
        }
        if (els.length < 2) { p = save; return null; }
        const ty = { name: "tuple", args: els, names, arr: 0 };
        while (isOp("[") && isOp("]", 1)) { p += 2; ty.arr++; }
        return ty;
      }
      if (!(t.t === "id" || (t.t === "kw" && PRIM.has(t.v)))) return null;
      p++; let name = t.v;
      while (isOp(".") && peek(1).t === "id") { p++; name += "." + next().v; }
      let args = [];
      if (isOp("<")) {
        const s2 = p; p++; let ok = true;
        while (true) {
          const a = tryType(); if (!a) { ok = false; break; }
          args.push(a);
          if (acc(",")) continue;
          if (acc(">")) break;
          ok = false; break;
        }
        if (!ok) { p = s2; args = []; return p = save, null; }
      }
      const ty = { name, args, arr: 0 };
      if (isOp("?") && (peek(1).t === "id" || isOp("[", 1) || isOp(">", 1) || isOp(",", 1) || isOp(")", 1))) { p++; ty.nullable = true; }
      while (isOp("[") && (isOp("]", 1) || isOp(",", 1))) { p++; while (acc(",")); expect("]"); ty.arr++; }
      return ty;
    }
    function needType() {
      const ty = tryType();
      if (!ty) throw new CsError("CS1031", "Type expected (found '" + peek().v + "')", peek().line, "compile", file);
      return ty;
    }

    function attrs() {
      const out = [];
      while (isOp("[") && peek(1).t === "id") {
        const save = p; p++;
        const list = [];
        while (true) {
          const nm = ident(); let args = [];
          if (acc("(")) { if (!isOp(")")) { do { args.push(expr()); } while (acc(",")); } expect(")"); }
          list.push({ name: nm, args });
          if (acc(",")) continue; break;
        }
        if (!acc("]")) { p = save; break; }
        out.push(...list);
      }
      return out;
    }
    function mods() { const m = new Set(); while ((peek().t === "kw" || peek().t === "id") && MODS.has(peek().v)) { if (peek().t === "id" && !(peek(1).t === "id" || peek(1).t === "kw")) break; m.add(next().v); } return m; }

    function compilationUnit() {
      const unit = { types: [], top: [], file };
      while (peek().t !== "eof") {
        if (isKw("using")) { // using directive (but not a using statement)
          if (isOp("(", 1)) { unit.top.push(statement()); continue; }
          while (!isOp(";") && peek().t !== "eof") p++; expect(";"); continue;
        }
        if (isKw("namespace")) {
          p++; needType();
          if (acc(";")) continue;
          expect("{");
          while (!isOp("}") && peek().t !== "eof") typeOrStatement(unit);
          expect("}"); continue;
        }
        typeOrStatement(unit);
      }
      return unit;
    }
    function typeOrStatement(unit) {
      const save = p; const at = attrs(); const m = mods();
      const t = peek();
      if (t.t === "kw" && (t.v === "class" || t.v === "interface" || t.v === "struct" || t.v === "enum")) { unit.types.push(typeDecl(m, at)); return; }
      if (t.t === "id" && t.v === "record") throw unsupported("record types", t.line);
      p = save; unit.top.push(statement());
    }
    function typeDecl(m, at) {
      const kindTok = next(); const line = kindTok.line;
      const name = ident();
      if (kindTok.v === "enum") {
        if (acc(":")) needType();
        expect("{"); const members = []; let val = 0;
        while (!isOp("}")) {
          attrs(); const nm = ident();
          if (acc("=")) { const e = expr(); val = e.k === "lit" ? e.v : val; }
          members.push({ name: nm, value: val++ });
          if (!acc(",")) break;
        }
        expect("}"); acc(";");
        return { k: "enum", name, members, line };
      }
      let tparams = [];
      if (acc("<")) { do { tparams.push(ident()); } while (acc(",")); expect(">"); }
      let pctor = null;
      if (isOp("(")) throw unsupported("primary constructors", line);
      const bases = [];
      if (acc(":")) { do { bases.push(needType().name); } while (acc(",")); }
      while (isId("where")) { while (!isOp("{")) p++; }
      expect("{");
      const decl = { k: kindTok.v === "interface" ? "interface" : "class", name, bases, tparams, mods: m, attrs: at, fields: [], props: [], methods: [], ctors: [], nested: [], line, pctor };
      while (!isOp("}") && peek().t !== "eof") member(decl);
      expect("}"); acc(";");
      return decl;
    }
    function paramList() {
      expect("("); const ps = [];
      if (!isOp(")")) {
        do {
          attrs();
          let mod = null;
          if (isKw("out") || isKw("ref") || isKw("params") || isKw("this") || isId("in")) mod = next().v;
          const type = needType(); const name = ident(); let def;
          if (acc("=")) def = expr();
          ps.push({ type, name, def, mod });
        } while (acc(","));
      }
      expect(")");
      return ps;
    }
    function member(decl) {
      const at = attrs(); const m = mods(); const t = peek();
      if (t.t === "kw" && (t.v === "class" || t.v === "interface" || t.v === "struct" || t.v === "enum")) { decl.nested.push(typeDecl(m, at)); return; }
      if (t.t === "id" && t.v === "record") throw unsupported("record types", t.line);
      if (t.t === "id" && t.v === decl.name && isOp("(", 1)) { // constructor
        p++; const params = paramList(); let init = null;
        if (acc(":")) { const kind = next().v; expect("("); const args = []; if (!isOp(")")) { do { args.push(argument()); } while (acc(",")); } expect(")"); init = { kind, args }; }
        const body = isOp("=>") ? (p++, (() => { const e = expr(); expect(";"); return { k: "block", body: [{ k: "expr", e, line: t.line }] }; })()) : block();
        decl.ctors.push({ params, init, body, line: t.line, mods: m }); return;
      }
      if (t.t === "op" && t.v === "~") throw unsupported("finalizers", t.line);
      if (isId("event") || isKw("event")) throw unsupported("events", t.line);
      if (t.t === "id" && t.v === "operator") throw unsupported("operator overloading", t.line);
      const type = needType();
      if (isKw("operator") || isId("operator")) throw unsupported("operator overloading", t.line);
      if (isKw("this")) throw unsupported("indexers", t.line);
      const nmTok = peek(); const name = ident();
      if (isOp("<")) { p++; while (!acc(">")) p++; } // generic method type params (ignored)
      if (isOp("(")) {
        const params = paramList();
        while (isId("where")) { while (!isOp("{") && !isOp(";") && !isOp("=>")) p++; }
        let body = null;
        if (acc("=>")) { const e = expr(); expect(";"); body = { k: "block", body: [{ k: type.name === "void" ? "expr" : "return", e, line: nmTok.line }] }; }
        else if (acc(";")) body = null;
        else body = block();
        decl.methods.push({ name, type, params, body, mods: m, attrs: at, line: nmTok.line, abstract: !body }); return;
      }
      if (isOp("{")) { // property
        p++; const pr = { name, type, mods: m, line: nmTok.line, auto: true, get: null, set: null, hasGet: false, hasSet: false, init: null };
        while (!isOp("}")) {
          const am = mods(); const acc2 = next().v;
          if (acc2 === "get") { pr.hasGet = true; if (isOp("{")) { pr.get = block(); pr.auto = false; } else if (acc("=>")) { pr.get = { k: "block", body: [{ k: "return", e: expr(), line: nmTok.line }] }; pr.auto = false; expect(";"); } else expect(";"); }
          else if (acc2 === "set" || acc2 === "init") { pr.hasSet = true; pr.setPrivate = am.has("private"); if (isOp("{")) { pr.set = block(); pr.auto = false; } else if (acc("=>")) { pr.set = { k: "block", body: [{ k: "expr", e: expr(), line: nmTok.line }] }; pr.auto = false; expect(";"); } else expect(";"); }
          else throw new CsError("CS1014", "A get or set accessor expected", nmTok.line, "compile", file);
        }
        expect("}");
        if (acc("=")) { pr.init = expr(); expect(";"); }
        decl.props.push(pr); return;
      }
      if (acc("=>")) { const e = expr(); expect(";"); decl.props.push({ name, type, mods: m, line: nmTok.line, auto: false, hasGet: true, get: { k: "block", body: [{ k: "return", e, line: nmTok.line }] } }); return; }
      // field(s)
      let nm = name;
      while (true) {
        let init = null; if (acc("=")) init = isOp("{") ? arrayInit() : expr();
        decl.fields.push({ name: nm, type, init, mods: m, line: nmTok.line });
        if (acc(",")) { nm = ident(); continue; }
        break;
      }
      expect(";");
    }

    // statements
    function block() {
      const line = peek().line; expect("{"); const body = [];
      while (!isOp("}")) { if (peek().t === "eof") throw new CsError("CS1513", "} expected", peek().line, "compile", file); body.push(statement()); }
      p++; return { k: "block", body, line };
    }
    function embedded() { return statement(); }
    function tryDecl() {
      const save = p;
      if (isKw("const")) p++;
      // deconstruction: var (a, b) = ...
      if ((isId("var")) && isOp("(", 1)) {
        p += 2; const names = []; let ok = true;
        while (true) { if (!isId()) { ok = false; break; } names.push(next().v); if (acc(",")) continue; if (acc(")")) break; ok = false; break; }
        if (ok && isOp("=")) { p++; const e = expr(); return { k: "deconstruct", names, e, line: toks[save].line }; }
        p = save; return null;
      }
      const ty = tryType();
      if (!ty) { p = save; return null; }
      if (peek().t === "id" && isOp("(", 1) && ty.name !== "var") { // local function
        const nmTok = next(); const params = paramList(); let body;
        if (acc("=>")) { const e = expr(); expect(";"); body = { k: "block", body: [{ k: ty.name === "void" ? "expr" : "return", e, line: nmTok.line }] }; }
        else body = block();
        return { k: "localfn", name: nmTok.v, type: ty, params, body, line: nmTok.line };
      }
      if (peek().t === "id" && (isOp("=", 1) || isOp(";", 1) || isOp(",", 1))) {
        const decls = []; const line = peek().line;
        do {
          const nm = ident(); let init = null;
          if (acc("=")) init = isOp("{") ? arrayInit() : expr();
          decls.push({ name: nm, init });
        } while (acc(","));
        return { k: "var", type: ty, decls, line };
      }
      p = save; return null;
    }
    function statement() {
      const t = peek(); const line = t.line;
      if (t.t === "op" && t.v === "{") return block();
      if (t.t === "op" && t.v === ";") { p++; return { k: "empty", line }; }
      if (t.t === "kw") {
        switch (t.v) {
          case "if": { p++; expect("("); const c = expr(); expect(")"); const a = embedded(); let b = null; if (acc("else")) b = embedded(); return { k: "if", c, a, b, line }; }
          case "while": { p++; expect("("); const c = expr(); expect(")"); return { k: "while", c, body: embedded(), line }; }
          case "do": { p++; const body = embedded(); expect("while"); expect("("); const c = expr(); expect(")"); expect(";"); return { k: "do", c, body, line }; }
          case "for": {
            p++; expect("("); const init = [];
            if (!isOp(";")) { const d = tryDecl(); if (d) init.push(d); else { do { init.push({ k: "expr", e: expr(), line }); } while (acc(",")); } }
            expect(";"); const c = isOp(";") ? null : expr(); expect(";");
            const upd = []; if (!isOp(")")) { do { upd.push(expr()); } while (acc(",")); }
            expect(")"); return { k: "for", init, c, upd, body: embedded(), line };
          }
          case "foreach": {
            p++; expect("(");
            let names = null, name = null, type = null;
            if (isId("var") && isOp("(", 1)) { p += 2; names = []; do { if (isId("var") || (peek().t === "kw" && PRIM.has(peek().v))) { if (peek(1).t === "id") p++; } names.push(ident()); } while (acc(",")); expect(")"); }
            else { type = needType(); name = ident(); }
            expect("in"); const e = expr(); expect(")");
            return { k: "foreach", type, name, names, e, body: embedded(), line };
          }
          case "switch": {
            p++; expect("("); const e = expr(); expect(")"); expect("{"); const sections = [];
            while (!isOp("}")) {
              const labels = [];
              while (isKw("case") || isKw("default")) {
                if (acc("default")) { expect(":"); labels.push({ def: true }); continue; }
                p++; labels.push(pattern()); let when = null;
                if (isId("when")) { p++; when = expr(); labels[labels.length - 1].when = when; }
                expect(":");
              }
              if (!labels.length) throw new CsError("CS1513", "case or default expected", peek().line, "compile", file);
              const body = [];
              while (!isKw("case") && !isKw("default") && !isOp("}")) body.push(statement());
              sections.push({ labels, body });
            }
            p++; return { k: "switch", e, sections, line };
          }
          case "break": p++; expect(";"); return { k: "break", line };
          case "continue": p++; expect(";"); return { k: "continue", line };
          case "return": { p++; const e = isOp(";") ? null : expr(); expect(";"); return { k: "return", e, line }; }
          case "throw": { p++; const e = isOp(";") ? null : expr(); expect(";"); return { k: "throw", e, line }; }
          case "try": {
            p++; const body = block(); const catches = []; let fin = null;
            while (acc("catch")) {
              let type = null, name = null;
              if (acc("(")) { type = needType().name; if (isId()) name = next().v; expect(")"); }
              let when = null; if (isId("when")) { p++; expect("("); when = expr(); expect(")"); }
              catches.push({ type, name, when, body: block() });
            }
            if (acc("finally")) fin = block();
            return { k: "try", body, catches, fin, line };
          }
          case "using": throw unsupported("using statements", line);
        }
      }
      if (t.t === "id" && t.v === "await") throw unsupported("async / await", line);
      if (t.t === "id" && t.v === "yield") throw unsupported("iterators (yield)", line);
      if (t.t === "kw" && t.v === "static" && (peek(1).t === "id" || (peek(1).t === "kw" && PRIM.has(peek(1).v)))) p++; // static local function
      const d = tryDecl();
      if (d) { if (d.k !== "localfn") expect(";"); return d; }
      const e = expr(); expect(";");
      if (!["asg", "call", "pre", "post", "new", "await"].includes(e.k)) throw new CsError("CS0201", "Only assignment, call, increment, decrement and new object expressions can be used as a statement", line, "compile", file);
      return { k: "expr", e, line };
    }

    // patterns (switch cases, `is`)
    /* pattern combinators: not binds tightest, then and, then or */
    function pattern() { let l = andPattern(); while (isId("or")) { p++; l = { or: [l, andPattern()] }; } return l; }
    function andPattern() { let l = notPattern(); while (isId("and")) { p++; l = { and: [l, notPattern()] }; } return l; }
    function notPattern() { if (isId("not")) { p++; return { not: notPattern() }; } return primaryPattern(); }
    function primaryPattern() {
      const line = peek().line;
      if (isOp("<") || isOp(">") || isOp("<=") || isOp(">=")) { const op = next().v; return { rel: op, e: shift(), line }; }
      if (isId("_")) { p++; return { discard: true }; }
      if (isKw("null")) { p++; return { e: { k: "lit", v: null }, line }; }
      // type pattern: Type name
      const save = p; const ty = tryType();
      if (ty && isId() && !isOp("(", 1)) { const bind = next().v; return { type: ty.name, bind, line }; }
      if (ty && (isOp(":") || isOp("=>") || isId("when")) && (ty.name[0] === ty.name[0].toUpperCase()) && !/\./.test(ty.name) && PRIM.has(ty.name) ) { return { type: ty.name, line }; }
      p = save;
      return { e: shift(), line };
    }

    // expressions
    function argument() {
      if (isKw("out") || isKw("ref")) {
        const mod = next().v; const line = peek().line;
        if (isId("var") && isId(undefined, 1)) { p++; return { k: "outvar", name: next().v, line }; }
        const save = p; const ty = tryType();
        if (ty && isId()) return { k: "outvar", name: next().v, type: ty, line };
        p = save; return { k: "ref", e: unary(), mod, line };
      }
      if (isId() && isOp(":", 1)) { p += 2; } // named argument (name ignored)
      return expr();
    }
    function args() { expect("("); const a = []; if (!isOp(")")) { do { a.push(argument()); } while (acc(",")); } expect(")"); return a; }
    function expr() { return assignment(); }
    function assignment() {
      // lambda?
      const line = peek().line;
      if (isId() && isOp("=>", 1)) { const nm = next().v; p++; return lambdaBody([nm], line); }
      if (isOp("(")) {
        let k = 1, ok = true; const names = [];
        if (isOp(")", 1)) { if (isOp("=>", 2)) { p += 3; return lambdaBody([], line); } ok = false; }
        while (ok) {
          const t = peek(k);
          if (t.t === "id" || (t.t === "kw" && PRIM.has(t.v))) {
            if (peek(k + 1).t === "id") { names.push(peek(k + 1).v); k += 2; } else { names.push(t.v); k++; }
          } else { ok = false; break; }
          const s = peek(k);
          if (s.t === "op" && s.v === ",") { k++; continue; }
          if (s.t === "op" && s.v === ")" && isOp("=>", k + 1)) { p += k + 2; return lambdaBody(names, line); }
          ok = false;
        }
      }
      const left = conditional();
      const t = peek();
      if (t.t === "op" && ["=", "+=", "-=", "*=", "/=", "%=", "??="].includes(t.v)) {
        p++; const right = t.v === "=" && isOp("{") ? arrayInit() : assignment();
        if (!["name", "mem", "idx", "tuple"].includes(left.k)) throw new CsError("CS0131", "The left-hand side of an assignment must be a variable, property or indexer", line, "compile", file);
        return { k: "asg", op: t.v, a: left, b: right, line };
      }
      return left;
    }
    function lambdaBody(params, line) {
      if (isOp("{")) return { k: "lambda", params, body: block(), line };
      return { k: "lambda", params, e: expr(), line };
    }
    function conditional() {
      const c = coalesce();
      if (isOp("?")) { p++; const a = expr(); expect(":"); const b = expr(); return { k: "cond", c, a, b, line: c.line }; }
      return c;
    }
    function coalesce() { const a = orE(); if (isOp("??")) { p++; return { k: "bin", op: "??", a, b: coalesce(), line: a.line }; } return a; }
    function binLevel(sub, ops) {
      return function () {
        let a = sub();
        while (peek().t === "op" && ops.includes(peek().v)) { const op = next().v; a = { k: "bin", op, a, b: sub(), line: a.line }; }
        return a;
      };
    }
    function relational() {
      let a = shift();
      while (true) {
        const t = peek();
        if (t.t === "op" && ["<", ">", "<=", ">="].includes(t.v)) { p++; a = { k: "bin", op: t.v, a, b: shift(), line: a.line }; continue; }
        if (t.t === "kw" && t.v === "is") {
          p++; let neg = false;
          if (isId("not")) { p++; neg = true; }
          const pat = pattern(); a = { k: "is", e: a, pat, neg, line: t.line }; continue;
        }
        if (t.t === "kw" && t.v === "as") { p++; const ty = needType(); a = { k: "as", e: a, type: ty.name, line: t.line }; continue; }
        return a;
      }
    }
    function shift() { return additive(); }
    const multiplicative = binLevel(unary, ["*", "/", "%"]);
    const additive = binLevel(multiplicative, ["+", "-"]);
    const equality = binLevel(relational, ["==", "!="]);
    const bitAnd = binLevel(equality, ["&"]);
    const bitXor = binLevel(bitAnd, ["^"]);
    const bitOr = binLevel(bitXor, ["|"]);
    const andE = binLevel(bitOr, ["&&"]);
    const orE = binLevel(andE, ["||"]);
    function unary() {
      const t = peek();
      if (t.t === "op" && ["!", "-", "+", "~"].includes(t.v)) { p++; return { k: "un", op: t.v, a: unary(), line: t.line }; }
      if (t.t === "op" && (t.v === "++" || t.v === "--")) { p++; return { k: "pre", op: t.v, a: unary(), line: t.line }; }
      if (t.t === "id" && t.v === "await") throw unsupported("async / await", t.line);
      if (t.t === "op" && t.v === "(") { // cast?
        const save = p; p++; const ty = tryType();
        if (ty && acc(")")) {
          const nt = peek();
          const castable = PRIM.has(ty.name) || ty.arr || /^[A-Z]/.test(ty.name);
          if (castable && (nt.t === "id" || nt.t === "num" || nt.t === "str" || nt.t === "chr" || (nt.t === "kw" && (["this", "new", "true", "false", "null", "base"].includes(nt.v) || PRIM.has(nt.v))) || (nt.t === "op" && nt.v === "(") || (PRIM.has(ty.name) && nt.t === "op" && (nt.v === "-" || nt.v === "!")))) {
            return { k: "cast", type: ty, e: unary(), line: t.line };
          }
        }
        p = save;
      }
      return postfix(primary());
    }
    function tryTypeArgs() {
      const save = p; if (!acc("<")) return null; const out = [];
      while (true) { const ty = tryType(); if (!ty) { p = save; return null; } out.push(ty); if (acc(",")) continue; if (acc(">")) break; p = save; return null; }
      if (!isOp("(")) { p = save; return null; }
      return out;
    }
    function postfix(e) {
      while (true) {
        const t = peek();
        if (t.t === "op" && (t.v === "." || t.v === "?.")) {
          p++; const n = ident(); e = { k: "mem", o: e, n, cond: t.v === "?.", line: t.line };
          const ta = tryTypeArgs(); if (ta) e.targs = ta; continue;
        }
        if (t.t === "op" && t.v === "(") { e = { k: "call", f: e, args: args(), line: t.line }; continue; }
        if (t.t === "op" && t.v === "[") { p++; const i = expr(); expect("]"); e = { k: "idx", o: e, i, line: t.line }; continue; }
        if (t.t === "op" && (t.v === "++" || t.v === "--")) { p++; e = { k: "post", op: t.v, a: e, line: t.line }; continue; }
        if (t.t === "op" && t.v === "!" && (isOp(".", 1) || isOp(";", 1) || isOp(")", 1))) { p++; continue; } // null-forgiving
        if (t.t === "kw" && t.v === "switch") {
          p++; expect("{"); const arms = [];
          while (!isOp("}")) { const pat = pattern(); let when = null; if (isId("when")) { p++; when = expr(); } expect("=>"); arms.push({ pat, when, e: expr() }); if (!acc(",")) break; }
          expect("}"); e = { k: "swexpr", e, arms, line: t.line }; continue;
        }
        return e;
      }
    }
    function arrayInit() { const line = peek().line; expect("{"); const items = []; while (!isOp("}")) { items.push(isOp("{") ? arrayInit() : expr()); if (!acc(",")) break; } expect("}"); return { k: "coll", items, line }; }
    function primary() {
      const t = next(); const line = t.line;
      switch (t.t) {
        case "num": return { k: "lit", v: t.dbl ? (t.dec ? decm(t.v) : new D(t.v)) : t.v, lng: !!t.lng, line };
        case "str": return { k: "lit", v: t.v, line };
        case "chr": return { k: "lit", v: new Ch(t.v), line };
        case "interp": return { k: "interp", parts: t.v.map((pt) => typeof pt === "string" ? pt : { e: parseExprText(pt.expr, pt.line), align: pt.align, fmt: pt.fmt }), line };
        case "id": {
          if (t.v === "nameof") { expect("("); const e = expr(); expect(")"); return { k: "lit", v: e.n || "", line }; }
          const ta = tryTypeArgs(); if (ta) return { k: "name", n: t.v, targs: ta, line };
          return { k: "name", n: t.v, line };
        }
        case "kw":
          switch (t.v) {
            case "true": return { k: "lit", v: true, line };
            case "false": return { k: "lit", v: false, line };
            case "null": return { k: "lit", v: null, line };
            case "this": return { k: "this", line };
            case "base": return { k: "base", line };
            case "default": if (acc("(")) { const ty = needType(); expect(")"); return { k: "default", type: ty, line }; } return { k: "lit", v: null, line };
            case "typeof": throw unsupported("typeof / reflection", line);
            case "throw": return { k: "throwexpr", e: unary(), line };
            case "new": {
              if (isOp("[")) { p++; expect("]"); const init = arrayInit(); return { k: "newarr", type: null, items: init.items, line }; }
              if (isOp("(")) { const a = args(); let init = null; if (isOp("{")) init = objInit(); return { k: "new", type: null, args: a, init, line }; }
              const ty = (() => { const save = p; const base = { name: next().v, args: [] };
                while (isOp(".") && peek(1).t === "id") { p++; base.name += "." + next().v; }
                if (isOp("<")) { p++; do { base.args.push(needType()); } while (acc(",")); expect(">"); }
                return base; })();
              if (isOp("[")) {
                p++;
                if (acc("]")) { let arr = 1; while (isOp("[")) { p++; expect("]"); arr++; } const init = arrayInit(); return { k: "newarr", type: ty, items: init.items, line }; }
                const size = expr(); if (isOp(",")) throw unsupported("multi-dimensional arrays", line); expect("]");
                let jag = 0; while (isOp("[") && isOp("]", 1)) { p += 2; jag++; }
                const init = isOp("{") ? arrayInit() : null;
                return { k: "newarr", type: ty, size, items: init ? init.items : null, jag, line };
              }
              let a = []; if (isOp("(")) a = args();
              let init = null; if (isOp("{")) init = objInit();
              return { k: "new", type: ty, args: a, init, line };
            }
            default:
              if (PRIM.has(t.v)) return { k: "name", n: t.v, line };
          }
          break;
        case "op":
          if (t.v === "(") {
            const e = expr();
            if (isOp(",")) { const items = [e]; while (acc(",")) items.push(expr()); expect(")"); return { k: "tuple", items, line }; }
            expect(")"); return e;
          }
          if (t.v === "[") { // collection expression [1, 2, 3]
            const items = []; while (!isOp("]")) { items.push(expr()); if (!acc(",")) break; } expect("]"); return { k: "coll", items, line, bracket: true };
          }
      }
      throw new CsError("CS1525", "Invalid expression term '" + t.v + "'", line, "compile", file);
    }
    function objInit() {
      const line = peek().line; expect("{"); const items = [];
      while (!isOp("}")) {
        if (isId() && isOp("=", 1)) { const n = next().v; p++; items.push({ set: n, e: isOp("{") ? arrayInit() : expr() }); }
        else if (isOp("[")) { p++; const k = expr(); expect("]"); expect("="); items.push({ key: k, e: expr() }); }
        else if (isOp("{")) { p++; const k = expr(); expect(","); const v = expr(); expect("}"); items.push({ pair: [k, v] }); }
        else items.push({ add: expr() });
        if (!acc(",")) break;
      }
      expect("}"); return { items, line };
    }
    function parseExprText(text, line) {
      const sub = parseExpr(text, file, line);
      return sub;
    }
    return { unit: compilationUnit, expr };
  }
  function parseExpr(text, file, line) {
    const P = parse(text, file);
    try { return P.expr(); } catch (e) { if (e instanceof CsError) { e.line = line; } throw e; }
  }
  function parseUnit(src, file) { return parse(src, file).unit(); }

  // ───────────────────────── runtime values ─────────────────────────
  class D { constructor(v) { this.v = v; } }            // double / decimal / float
  // decimal: a D flagged .m whose arithmetic is rounded to 12 places, so 3 * 0.20m == 0.60m
  const decm = (v) => { const d = new D(Number(v.toFixed(12))); d.m = true; return d; };
  class Ch { constructor(c) { this.c = c; } }           // char
  class CsList { constructor(items, tname, arr) { this.items = items; this.tname = tname || "System.Object"; this.arr = !!arr; } }
  class CsDict { constructor(tk, tv) { this.map = new Map(); this.keys = new Map(); this.tk = tk; this.tv = tv; } }
  class CsSet { constructor() { this.map = new Map(); } }
  class CsQueue { constructor(stack) { this.items = []; this.stack = stack; } }
  class CsTuple { constructor(items, names) { this.items = items; this.names = names || null; } }
  class CsKvp { constructor(k, v) { this.Key = k; this.Value = v; } }
  class CsSB { constructor(s) { this.s = s || ""; } }
  class CsObj { constructor(cls) { this.cls = cls; this.f = new Map(); } }
  class CsEnum { constructor(type, name, value) { this.type = type; this.name = name; this.value = value; } }
  class CsFn { constructor(params, body, e, env, self, cls) { this.params = params; this.body = body; this.e = e; this.env = env; this.self = self; this.cls = cls; } }
  class CsGroup { constructor(key, items) { this.Key = key; this.items = items; } }
  class CsRandom { constructor(seed) { this.s = (seed === undefined ? 12345 : seed) >>> 0 || 1; } next() { this.s ^= this.s << 13; this.s >>>= 0; this.s ^= this.s >>> 17; this.s ^= this.s << 5; this.s >>>= 0; return this.s / 4294967296; } }
  class Ref { constructor(get, set) { this.get = get; this.set = set; } }
  class Thrown { constructor(obj, line) { this.obj = obj; this.line = line; } }
  class Ret { constructor(v) { this.v = v; } }
  const BRK = { brk: true }, CONT = { cont: true };
  class Budget extends Error { constructor(kind) { super(kind); this.kind = kind; } }

  const keyOf = (v) => v instanceof D ? "d" + v.v : v instanceof Ch ? "c" + v.c : v instanceof CsEnum ? "e" + v.type + v.value : typeof v === "string" ? "s" + v : typeof v === "number" ? "d" + v : typeof v === "boolean" ? "b" + v : v instanceof CsTuple ? "t" + v.items.map(keyOf).join("|") : v;

  const NETNAME = { int: "System.Int32", long: "System.Int64", string: "System.String", double: "System.Double", bool: "System.Boolean", char: "System.Char", decimal: "System.Decimal", float: "System.Single", object: "System.Object" };
  const netName = (ty) => !ty ? "System.Object" : NETNAME[ty.name] || ty.name;

  // ───────────────────────── formatting ─────────────────────────
  function fmtDouble(x) {
    if (Number.isNaN(x)) return "NaN";
    if (x === Infinity) return "∞"; if (x === -Infinity) return "-∞";
    let s = String(x);
    if (/e/.test(s)) s = s.replace(/e([+-])(\d)$/, "E$10$2").replace(/e/, "E");
    return s;
  }
  function groupThousands(s) { const [i, f] = s.split("."); const neg = i[0] === "-"; const d = neg ? i.slice(1) : i; const g = d.replace(/\B(?=(\d{3})+(?!\d))/g, ","); return (neg ? "-" : "") + g + (f !== undefined ? "." + f : ""); }
  /* .NET formats a double from its EXACT value; an exact tie (0.125 to 2
     places) goes to the even digit, where JS's toFixed picks the larger */
  function toFixedAway(x, n, dec) {
    if (!isFinite(x)) return x === Infinity ? "∞" : x === -Infinity ? "-∞" : "NaN";
    if (dec) { const m = Math.pow(10, n); return (Math.sign(x) * Math.round(Math.abs(x) * m + 1e-7) / m).toFixed(n); }
    const s = x.toFixed(n);
    const r = Math.abs(x);
    const ex = r.toFixed(Math.min(100, n + 60));
    const cut = ex.indexOf(".") + n + (n ? 1 : 0);
    const rest = n ? ex.slice(cut) : ex.slice(ex.indexOf(".") + 1);
    if (!/^50*$/.test(rest)) return s;
    const trunc = n ? ex.slice(0, cut) : ex.slice(0, ex.indexOf("."));
    if (+trunc.slice(-1) % 2 === 0) return (x < 0 && /[1-9]/.test(trunc) ? "-" : "") + trunc;
    return s;
  }
  function formatSpec(v, spec) {
    if (spec == null || spec === "") return str(v);
    const num = v instanceof D ? v.v : typeof v === "number" ? v : v instanceof Ch ? null : null;
    if (num === null) return str(v);
    const m = /^([FfNnDdEePpXxGgCc])(\d*)$/.exec(spec);
    if (m) {
      const k = m[1].toUpperCase(); const d = m[2] === "" ? null : parseInt(m[2], 10);
      const dm = v instanceof D && v.m;
      if (k === "F") return toFixedAway(num, d === null ? 2 : d, dm);
      if (k === "N") return groupThousands(toFixedAway(num, d === null ? 2 : d, dm));
      if (k === "D") { const s = String(Math.abs(Math.trunc(num))).padStart(d || 0, "0"); return (num < 0 ? "-" : "") + s; }
      if (k === "P") return toFixedAway(num * 100, d === null ? 2 : d, dm) + "%";
      if (k === "C") return (num < 0 ? "-" : "") + "£" + groupThousands(toFixedAway(Math.abs(num), d === null ? 2 : d, dm));
      if (k === "X") { const s = (num >>> 0).toString(16); return (m[1] === "X" ? s.toUpperCase() : s).padStart(d || 0, "0"); }
      if (k === "E") return num.toExponential(d === null ? 6 : d).replace(/e([+-])(\d+)$/, (_, s, e) => (m[1] === "E" ? "E" : "e") + s + e.padStart(3, "0"));
      if (k === "G") return str(v);
    }
    if (/^[0#,.]+$/.test(spec)) {
      const dec = (spec.split(".")[1] || "").length; const minDec = (spec.split(".")[1] || "").replace(/#/g, "").length;
      let s = num.toFixed(dec);
      if (dec > minDec && s.includes(".")) { s = s.replace(/0+$/, ""); const need = minDec; const [i, f] = s.split("."); s = i + ((f || "").padEnd(need, "0") ? "." + (f || "").padEnd(need, "0") : ""); if (s.endsWith(".")) s = s.slice(0, -1); }
      if (spec.includes(",")) s = groupThousands(s);
      return s;
    }
    return str(v);
  }
  function align(s, a) { if (a == null || isNaN(a)) return s; return a >= 0 ? s.padStart(a) : s.padEnd(-a); }

  // str() needs the interpreter for user ToString(); set per run
  let CUR = null;
  let CHECKED = 0;   /* inside checked(…): int overflow throws */
  function str(v) {
    if (v === null || v === undefined) return "";
    if (typeof v === "string") return v;
    if (typeof v === "number") return String(v);
    if (typeof v === "boolean") return v ? "True" : "False";
    if (v instanceof D) return fmtDouble(v.v);
    if (v instanceof Ch) return v.c;
    if (v instanceof CsEnum) return v.name;
    if (v instanceof CsTuple) return "(" + v.items.map(str).join(", ") + ")";
    if (v instanceof CsKvp) return "[" + str(v.Key) + ", " + str(v.Value) + "]";
    if (v instanceof CsSB) return v.s;
    if (v instanceof CsList) return v.arr ? v.tname + "[]" : "System.Collections.Generic.List`1[" + v.tname + "]";
    if (v instanceof CsDict) return "System.Collections.Generic.Dictionary`2[" + v.tk + "," + v.tv + "]";
    if (v instanceof CsObj) return CUR ? CUR.objToString(v) : v.cls.name;
    if (v instanceof CsFn) return "System.Func`1";
    return String(v);
  }
  // A readable rendering used by the checker for return values (lists shown as [a, b])
  function show(v) {
    if (v === null || v === undefined) return "null";
    if (v instanceof CsList) return "[" + v.items.map(show).join(", ") + "]";
    if (v instanceof CsDict) return "{" + [...v.map.values()].map((e) => show(e[0]) + ": " + show(e[1])).join(", ") + "}";
    if (typeof v === "string") return JSON.stringify(v);
    if (v instanceof Ch) return "'" + v.c + "'";
    return str(v);
  }
  function composite(fmt, args, line) {
    return fmt.replace(/\{\{|\}\}|\{(\d+)(?:,(-?\d+))?(?::([^}]*))?\}/g, (m, i, a, f) => {
      if (m === "{{") return "{"; if (m === "}}") return "}";
      const idx = parseInt(i, 10);
      if (idx >= args.length) throw CUR.exc("FormatException", "Index (zero based) must be greater than or equal to zero and less than the size of the argument list.", line);
      return align(formatSpec(args[idx], f), a == null ? null : parseInt(a, 10));
    });
  }

  // ───────────────────────── numbers ─────────────────────────
  const isNum = (v) => typeof v === "number" || v instanceof D || v instanceof Ch;
  const nv = (v) => v instanceof D ? v.v : v instanceof Ch ? v.c.charCodeAt(0) : v;

  // ───────────────────────── the interpreter ─────────────────────────
  const BUILTIN_TYPES = new Set(["Console", "Math", "int", "long", "double", "float", "decimal", "string", "String", "char", "bool", "object", "Convert", "List", "Dictionary",
    "HashSet", "Queue", "Stack", "StringBuilder", "Random", "Environment", "Array", "Enumerable", "StringSplitOptions", "Exception", "ArgumentException",
    "ArgumentOutOfRangeException", "ArgumentNullException", "InvalidOperationException", "FormatException", "IndexOutOfRangeException", "DivideByZeroException",
    "NullReferenceException", "KeyNotFoundException", "NotImplementedException", "OverflowException", "Assert", "Int32", "Double", "Char", "Boolean", "var",
    "Func", "Action", "Predicate", "KeyValuePair", "Tuple", "IEnumerable", "IList", "ICollection", "IDictionary", "IComparable", "Comparer", "StringComparer",
    "StringComparison", "Thread", "Fact", "Theory", "InlineData", "System", "nameof", "_", "Linq", "Collections", "Generic", "Text", "value", "MidpointRounding"]);
  const EXC = ["Exception", "SystemException", "ArgumentException", "ArgumentOutOfRangeException", "ArgumentNullException", "InvalidOperationException", "FormatException",
    "IndexOutOfRangeException", "DivideByZeroException", "NullReferenceException", "KeyNotFoundException", "NotImplementedException", "OverflowException", "InvalidCastException", "AssertFailedException"];
  const EXC_BASE = { Exception: null, SystemException: "Exception", ArgumentException: "SystemException", ArgumentOutOfRangeException: "ArgumentException", ArgumentNullException: "ArgumentException",
    InvalidOperationException: "SystemException", FormatException: "SystemException", IndexOutOfRangeException: "SystemException", DivideByZeroException: "SystemException",
    NullReferenceException: "SystemException", KeyNotFoundException: "SystemException", NotImplementedException: "SystemException", OverflowException: "SystemException", InvalidCastException: "SystemException", AssertFailedException: "Exception" };
  const EXC_DEFAULT = { Exception: "Exception of type 'System.Exception' was thrown.", ArgumentException: "Value does not fall within the expected range.", InvalidOperationException: "Operation is not valid due to the current state of the object.", NotImplementedException: "The method or operation is not implemented." };

  function Interp(opts) {
    const self = this;
    const stdin = (opts.stdin || "").split("\n"); if (stdin.length && stdin[stdin.length - 1] === "") stdin.pop();
    let inPos = 0;
    let out = "";
    const MAX_STEPS = opts.budget || 3e6, DEADLINE = Date.now() + (opts.ms || 2500), MAX_OUT = 100000;
    let steps = 0, depth = 0;
    const classes = new Map(); const enums = new Map();
    const globalFns = new Map();
    let rnd = null;

    function tick() { if (++steps > MAX_STEPS || ((steps & 8191) === 0 && Date.now() > DEADLINE)) throw new Budget("timeout"); }
    function write(s) { out += s; if (out.length > MAX_OUT) throw new Budget("output"); }
    this.steps = () => steps; this.out = () => out;

    // exceptions
    function excClass(name) { return classes.get(name); }
    this.exc = function (type, msg, line) { const o = new CsObj(excClass(type)); o.f.set("Message", msg); return new Thrown(o, line); };
    const exc = this.exc;

    // classes
    function defineBuiltinExceptions() {
      for (const n of EXC) classes.set(n, { name: n, base: EXC_BASE[n], ifaces: [], fields: [], props: [], methods: new Map(), ctors: [], builtin: true, statics: new Map(), decl: null });
    }
    function register(unit) {
      for (const t of unit.types) registerType(t, unit.file);
    }
    function registerType(t, file) {
      if (t.k === "enum") { enums.set(t.name, t); return; }
      if (classes.has(t.name) && !classes.get(t.name).builtin) throw new CsError("CS0101", "The namespace already contains a definition for '" + t.name + "'", t.line, "compile", file);
      const methods = new Map();
      for (const m of t.methods) { if (!methods.has(m.name)) methods.set(m.name, []); methods.get(m.name).push(m); }
      let base = null; const ifaces = [];
      for (const b of t.bases) { if (b[0] === "I" && /^I[A-Z]/.test(b) && !classes.has(b)) ifaces.push(b); else if (base === null && t.k !== "interface") base = b; else ifaces.push(b); }
      classes.set(t.name, { name: t.name, base, ifaces, decl: t, fields: t.fields, props: t.props, methods, ctors: t.ctors, statics: new Map(), isStatic: t.mods.has("static"), isAbstract: t.mods.has("abstract"), isInterface: t.k === "interface", file });
      for (const n of t.nested) registerType(n, file);
    }
    function cls(name) { return classes.get(name); }
    function chain(c) { const out = []; while (c) { out.push(c); c = c.base ? classes.get(c.base) : null; } return out; }
    function isA(c, name) {
      for (const k of chain(c)) { if (k.name === name) return true; if (k.ifaces.includes(name)) return true; for (const i of k.ifaces) { const ic = classes.get(i); if (ic && isA(ic, name)) return true; } }
      return false;
    }
    function findMethod(c, name, argc, args, wantStatic) {
      let best = null;
      for (const k of chain(c)) {
        const ms = k.methods.get(name); if (!ms) continue;
        for (const m of ms) {
          if (m.abstract && !k.isInterface && best) continue;
          const req = m.params.filter((p) => p.def === undefined && p.mod !== "params").length;
          const hasParams = m.params.some((p) => p.mod === "params");
          if (argc < req || (argc > m.params.length && !hasParams)) continue;
          const score = scoreArgs(m.params, args);
          if (!best || score > best.score) best = { m, owner: k, score };
        }
        if (best) return best;
      }
      return best;
    }
    function scoreArgs(params, args) {
      let s = 0;
      for (let i = 0; i < Math.min(params.length, args.length); i++) {
        const t = params[i].type.name, v = args[i];
        if (t === "int" || t === "long") s += typeof v === "number" ? 2 : -5;
        else if (t === "double" || t === "decimal" || t === "float") s += v instanceof D ? 2 : typeof v === "number" ? 1 : -5;
        else if (t === "string") s += typeof v === "string" ? 2 : v === null ? 1 : -5;
        else if (t === "bool") s += typeof v === "boolean" ? 2 : -5;
        else if (t === "char") s += v instanceof Ch ? 2 : -5;
        else if (v instanceof CsObj) s += isA(v.cls, t) ? 2 : -3;
      }
      return s;
    }
    function findProp(c, name) { for (const k of chain(c)) { const p = k.props.find((x) => x.name === name); if (p) return { p, owner: k }; } return null; }
    function findField(c, name) { for (const k of chain(c)) { const f = k.fields.find((x) => x.name === name); if (f) return { f, owner: k }; } return null; }

    // coercion to declared types
    function coerce(v, ty, line) {
      if (!ty || v === null || v === undefined) return v;
      const n = ty.name;
      if (ty.arr || ty.args && ty.args.length && n !== "tuple") return v;
      if (n === "decimal") { if (isNum(v)) return decm(nv(v)); return v; }
      if (n === "double" || n === "float") { if (typeof v === "number") return new D(v); if (v instanceof Ch) return new D(nv(v)); if (v instanceof D && v.m) return new D(v.v); return v; }
      if (n === "int" || n === "long" || n === "short" || n === "byte") { if (v instanceof Ch) return nv(v); if (v instanceof D) throw new CsError("CS0266", "Cannot implicitly convert type 'double' to '" + n + "'. An explicit conversion exists (are you missing a cast?)", line, "compile"); return v; }
      if (n === "tuple" && v instanceof CsTuple && ty.names && ty.names.some(Boolean)) return new CsTuple(v.items.map((x, i) => coerce(x, ty.args[i], line)), ty.names);
      return v;
    }
    function defaultOf(ty) {
      if (!ty) return null;
      if (ty.arr || ty.nullable) return null;
      switch (ty.name) { case "int": case "long": case "short": case "byte": return 0; case "double": case "float": case "decimal": return new D(0); case "bool": return false; case "char": return new Ch("\0"); }
      if (enums.has(ty.name)) { const e = enums.get(ty.name); return new CsEnum(e.name, e.members[0] ? e.members[0].name : "0", 0); }
      return null;
    }

    // environments
    class Env {
      constructor(parent) { this.v = new Map(); this.parent = parent; }
      find(n) { let e = this; while (e) { if (e.v.has(n)) return e; e = e.parent; } return null; }
      def(n, val, ty) { this.v.set(n, { val, ty }); }
    }

    // object creation
    function instantiate(c, args, line, init, ctx) {
      if (c.isAbstract || c.isInterface) throw new CsError("CS0144", "Cannot create an instance of the abstract type or interface '" + c.name + "'", line, "compile");
      if (c.builtin) { const o = new CsObj(c); o.f.set("Message", args.length ? str(args[0]) : (EXC_DEFAULT[c.name] || "Exception of type 'System." + c.name + "' was thrown.")); if (args[1] instanceof CsObj) o.f.set("InnerException", args[1]); applyInit(o, init, ctx); return o; }
      const o = new CsObj(c);
      // field initialisers, base first
      const ch = chain(c).reverse();
      for (const k of ch) {
        if (k.builtin) { o.f.set("Message", EXC_DEFAULT[k.name] || "Exception of type 'System." + c.name + "' was thrown."); continue; }
        for (const f of k.fields) if (!f.mods.has("static") && !f.mods.has("const")) o.f.set(f.name, f.init ? coerce(evalIn(f.init, { self: o, cls: k, env: new Env(null) }, f.type), f.type, f.line) : defaultOf(f.type));
        for (const pr of k.props) if (pr.auto && !pr.mods.has("static")) o.f.set("<" + pr.name + ">", pr.init ? coerce(evalIn(pr.init, { self: o, cls: k, env: new Env(null) }, pr.type), pr.type) : defaultOf(pr.type));
      }
      runCtor(o, c, args, line);
      applyInit(o, init, ctx);
      return o;
    }
    function applyInit(o, init, ctx) {
      if (!init) return;
      for (const it of init.items) {
        if (it.set) setMember(o, it.set, evalE(it.e, ctx), init.line, ctx);
        else throw new CsError("CS0747", "Invalid initializer member declarator", init.line, "compile");
      }
    }
    function runCtor(o, c, args, line) {
      if (c.builtin) { if (args.length) o.f.set("Message", str(args[0])); return; }
      const ctors = c.ctors;
      if (!ctors.length) { if (args.length) throw new CsError("CS1729", "'" + c.name + "' does not contain a constructor that takes " + args.length + " arguments", line, "compile"); if (c.base) runCtor(o, classes.get(c.base), [], line); return; }
      let best = null;
      for (const ct of ctors) { const req = ct.params.filter((p) => p.def === undefined).length; if (args.length < req || args.length > ct.params.length) continue; const s = scoreArgs(ct.params, args); if (!best || s > best.s) best = { ct, s }; }
      if (!best) throw new CsError("CS1729", "'" + c.name + "' does not contain a constructor that takes " + args.length + " arguments", line, "compile");
      const ct = best.ct; const env = new Env(null);
      ct.params.forEach((p, i) => env.def(p.name, coerce(i < args.length ? args[i] : evalIn(p.def, { self: o, cls: c, env }, p.type), p.type, line), p.type));
      const ctx = { self: o, cls: c, env, isStatic: false };
      if (ct.init) {
        const a = ct.init.args.map((x) => evalE(x, ctx));
        if (ct.init.kind === "base") { if (c.base) runCtor(o, classes.get(c.base), a, line); }
        else runCtor(o, c, a, line);
      } else if (c.base) runCtor(o, classes.get(c.base), [], line);
      callDepth(() => execBlock(ct.body, ctx));
    }
    function callDepth(fn) {
      if (++depth > 900) { depth = 0; throw new Budget("stack"); }
      try { return fn(); } finally { depth--; }
    }

    // invoke a user method
    function invoke(m, owner, selfObj, args, line, isVirtualTarget) {
      tick();
      if (m.abstract) throw new CsError("CS0500", "'" + owner.name + "." + m.name + "' cannot be called: it has no body", line, "compile");
      const env = new Env(null);
      const refs = [];
      m.params.forEach((p, i) => {
        if (p.mod === "params") { const rest = args.slice(i); env.def(p.name, rest.length === 1 && rest[0] instanceof CsList ? rest[0] : new CsList(rest.map((x) => coerce(x, { name: p.type.name })), netName(p.type), true), p.type); return; }
        let v = i < args.length ? args[i] : (p.def !== undefined ? evalIn(p.def, { self: selfObj, cls: owner, env }, p.type) : undefined);
        if (p.mod === "out" || p.mod === "ref") { refs.push([p.name, v]); env.def(p.name, p.mod === "ref" && v instanceof Ref ? v.get() : defaultOf(p.type), p.type); return; }
        env.def(p.name, coerce(v, p.type, line), p.type);
      });
      const ctx = { self: selfObj, cls: owner, env, isStatic: m.mods.has("static"), method: m };
      const r = callDepth(() => execBlock(m.body, ctx));
      for (const [n, ref] of refs) if (ref instanceof Ref) ref.set(env.v.get(n).val);
      const v = r instanceof Ret ? r.v : undefined;
      return coerce(v, m.type, line);
    }
    function callFn(fn, args, line) {
      tick();
      if (!(fn instanceof CsFn)) { if (typeof fn === "function") return fn(...args); throw exc("NullReferenceException", "Object reference not set to an instance of an object.", line); }
      if (fn.params.length && typeof fn.params[0] !== "string") {
        const req = fn.params.filter((p) => p.def === undefined);
        if (args.length < req.length) throw new CsError("CS7036", "There is no argument given that corresponds to the required parameter '" + req[args.length].name + "'", line, "compile");
        if (args.length > fn.params.length) throw new CsError("CS1501", "No overload for method takes " + args.length + " arguments", line, "compile");
      }
      const env = new Env(fn.env);
      fn.params.forEach((p, i) => env.def(typeof p === "string" ? p : p.name, typeof p === "string" ? args[i] : coerce(args[i], p.type, line), typeof p === "string" ? null : p.type));
      const ctx = { self: fn.self, cls: fn.cls, env, isStatic: fn.isStatic };
      if (fn.e) return callDepth(() => evalE(fn.e, ctx));
      const r = callDepth(() => execBlock(fn.body, ctx));
      return r instanceof Ret ? r.v : undefined;
    }

    // ToString for objects
    this.objToString = function (o) {
      if (o.cls.builtin || chain(o.cls).some((k) => k.builtin)) {
        const userTs = findMethod(o.cls, "ToString", 0, [], false);
        if (userTs && !userTs.owner.builtin) return str(invoke(userTs.m, userTs.owner, o, [], 0));
        return "System." + (chain(o.cls).find((k) => k.builtin) || o.cls).name + ": " + o.f.get("Message");
      }
      const ts = findMethod(o.cls, "ToString", 0, [], false);
      if (ts) return str(invoke(ts.m, ts.owner, o, [], 0));
      return o.cls.name;
    };

    // member access
    function getMember(o, name, line, ctx) {
      if (o === null || o === undefined) throw exc("NullReferenceException", "Object reference not set to an instance of an object.", line);
      if (o instanceof CsObj) {
        if (name === "Message" && chain(o.cls).some((k) => k.builtin)) return o.f.get("Message");
        if (name === "InnerException") return o.f.get("InnerException") || null;
        const pr = findProp(o.cls, name);
        if (pr) {
          if (pr.p.auto) return o.f.get("<" + name + ">");
          // virtual dispatch for computed properties
          const env = new Env(null);
          const r = callDepth(() => execBlock(pr.p.get, { self: o, cls: pr.owner, env }));
          return coerce(r instanceof Ret ? r.v : undefined, pr.p.type, line);
        }
        if (o.f.has(name)) return o.f.get(name);
        const fm = findField(o.cls, name);
        if (fm && (fm.f.mods.has("static") || fm.f.mods.has("const"))) return staticGet(fm.owner, name, line);
        const meth = findMethod(o.cls, name, 0, [], false);
        if (meth) { const fn = (...a) => invoke(findMethod(o.cls, name, a.length, a).m, meth.owner, o, a, line); return fn; }
        throw new CsError("CS1061", "'" + o.cls.name + "' does not contain a definition for '" + name + "'", line, "compile");
      }
      if (typeof o === "string") {
        if (name === "Length") return o.length;
        throw new CsError("CS1061", "'string' does not contain a definition for '" + name + "'", line, "compile");
      }
      if (o instanceof CsList && o.seq && (name === "Count" || name === "Length")) throw new CsError("CS0428", "A LINQ result (IEnumerable<T>) has no " + name + " property. Call the method: .Count()", line, "compile");
      if (o instanceof CsList) { if (name === (o.arr ? "Length" : "Count")) return o.items.length; if (name === "Count" && o.arr) throw new CsError("CS0428", "Arrays have Length, not Count. Use .Length (or the LINQ method .Count())", line, "compile"); if (name === "Length" && !o.arr) throw new CsError("CS1061", "'List<T>' does not contain a definition for 'Length'. A list has .Count", line, "compile"); }
      if (o instanceof CsDict) { if (name === "Count") return o.map.size; if (name === "Keys") return new CsList([...o.map.values()].map((e) => e[0]), o.tk); if (name === "Values") return new CsList([...o.map.values()].map((e) => e[1]), o.tv); }
      if (o instanceof CsSet && name === "Count") return o.map.size;
      if (o instanceof CsQueue && name === "Count") return o.items.length;
      if (o instanceof CsSB && name === "Length") return o.s.length;
      if (o instanceof CsKvp) { if (name === "Key") return o.Key; if (name === "Value") return o.Value; }
      if (o instanceof CsGroup) { if (name === "Key") return o.Key; if (name === "Count") return o.items.length; }
      if (o instanceof CsTuple) { const m = /^Item(\d)$/.exec(name); if (m) return o.items[+m[1] - 1]; if (o.names) { const i = o.names.indexOf(name); if (i >= 0) return o.items[i]; } }
      if (o instanceof CsEnum) { }
      throw new CsError("CS1061", "'" + typeName(o) + "' does not contain a definition for '" + name + "'", line, "compile");
    }
    function setMember(o, name, v, line, ctx) {
      if (o === null || o === undefined) throw exc("NullReferenceException", "Object reference not set to an instance of an object.", line);
      if (o instanceof CsObj) {
        const pr = findProp(o.cls, name);
        if (pr) {
          if (!pr.p.hasSet && !(ctx && ctx.inCtor)) {
            if (pr.p.auto && ctx && ctx.self === o) { o.f.set("<" + name + ">", coerce(v, pr.p.type, line)); return; }
            throw new CsError("CS0200", "Property or indexer '" + o.cls.name + "." + name + "' cannot be assigned to -- it is read only", line, "compile");
          }
          if (pr.p.setPrivate && !(ctx && ctx.self && ctx.cls && chain(o.cls).includes(ctx.cls))) throw new CsError("CS0272", "The property '" + o.cls.name + "." + name + "' cannot be used in this context because the set accessor is inaccessible", line, "compile");
          if (pr.p.auto) { o.f.set("<" + name + ">", coerce(v, pr.p.type, line)); return; }
          const env = new Env(null); env.def("value", coerce(v, pr.p.type, line), pr.p.type);
          callDepth(() => execBlock(pr.p.set, { self: o, cls: pr.owner, env }));
          return;
        }
        const fm = findField(o.cls, name);
        if (fm) {
          if (fm.f.mods.has("private") && ctx && ctx.self !== o && !(ctx.cls && chain(o.cls).includes(ctx.cls))) throw new CsError("CS0122", "'" + o.cls.name + "." + name + "' is inaccessible due to its protection level", line, "compile");
          if (fm.f.mods.has("readonly") && !(ctx && ctx.inCtor)) { /* allowed during construction only */ }
          o.f.set(name, coerce(v, fm.f.type, line)); return;
        }
        throw new CsError("CS1061", "'" + o.cls.name + "' does not contain a definition for '" + name + "'", line, "compile");
      }
      throw new CsError("CS0200", "Cannot assign to '" + name + "'", line, "compile");
    }
    function staticGet(c, name, line) {
      if (!c.statics.has(name)) throw new CsError("CS0117", "'" + c.name + "' does not contain a definition for '" + name + "'", line, "compile");
      const e = c.statics.get(name); return e.val;
    }
    function initStatics() {
      for (const c of classes.values()) {
        if (c.builtin) continue;
        for (const f of c.fields) if (f.mods.has("static") || f.mods.has("const")) c.statics.set(f.name, { val: null, ty: f.type });
        for (const pr of c.props) if (pr.mods.has("static") && pr.auto) c.statics.set(pr.name, { val: defaultOf(pr.type), ty: pr.type, prop: pr });
      }
      for (const c of classes.values()) {
        if (c.builtin) continue;
        for (const f of c.fields) if (f.mods.has("static") || f.mods.has("const")) c.statics.get(f.name).val = f.init ? coerce(evalIn(f.init, { self: null, cls: c, env: new Env(null), isStatic: true }, f.type), f.type, f.line) : defaultOf(f.type);
        for (const pr of c.props) if (pr.mods.has("static") && pr.auto && pr.init) c.statics.get(pr.name).val = coerce(evalIn(pr.init, { self: null, cls: c, env: new Env(null), isStatic: true }), pr.type);
      }
    }
    function typeName(v) {
      if (typeof v === "number") return "int"; if (typeof v === "string") return "string"; if (typeof v === "boolean") return "bool";
      if (v instanceof D) return "double"; if (v instanceof Ch) return "char"; if (v instanceof CsList) return v.arr ? "array" : "List<T>";
      if (v instanceof CsDict) return "Dictionary<TKey, TValue>"; if (v instanceof CsObj) return v.cls.name; if (v instanceof CsEnum) return v.type;
      if (v instanceof CsTuple) return "tuple"; return "object";
    }

    // ───── statements ─────
    function execBlock(b, ctx) {
      if (!b) return;
      const env = new Env(ctx.env); const c2 = Object.assign({}, ctx, { env });
      // hoist local functions
      for (const s of b.body) if (s.k === "localfn") env.def(s.name, makeLocalFn(s, c2), null);
      for (const s of b.body) { const r = exec(s, c2); if (r) return r; }
    }
    function makeLocalFn(s, ctx) { const f = new CsFn(s.params, s.body, null, ctx.env, ctx.self, ctx.cls); f.isStatic = ctx.isStatic; f.retType = s.type; return f; }
    function exec(s, ctx) {
      tick();
      switch (s.k) {
        case "block": return execBlock(s, ctx);
        case "empty": case "localfn": return;
        case "expr": evalE(s.e, ctx); return;
        case "var":
          for (const d of s.decls) {
            if (ctx.env.v.has(d.name) || (ctx.env.parent && ctx.env.find(d.name) && ctx.env.find(d.name) !== ctx.root)) {
              const found = ctx.env.find(d.name); if (found && found !== null && found.v.get(d.name) && !found.isRoot) throw new CsError("CS0128", "A local variable named '" + d.name + "' is already defined in this scope", s.line, "compile");
            }
            let v = d.init ? evalIn(d.init, ctx, s.type) : (s.type.name === "var" ? null : undefined);
            if (d.init && v === undefined) throw new CsError("CS0815", "Cannot assign void to an implicitly-typed variable", s.line, "compile");
            ctx.env.def(d.name, coerce(v, s.type.name === "var" ? null : s.type, s.line), s.type.name === "var" ? null : s.type);
          }
          return;
        case "deconstruct": {
          const v = evalE(s.e, ctx);
          if (!(v instanceof CsTuple)) throw new CsError("CS8129", "Cannot deconstruct this value", s.line, "compile");
          s.names.forEach((n, i) => { if (n !== "_") ctx.env.def(n, v.items[i], null); });
          return;
        }
        case "if": if (truthy(evalE(s.c, ctx), s.line)) return exec(s.a, ctx); else if (s.b) return exec(s.b, ctx); return;
        case "while": while (truthy(evalE(s.c, ctx), s.line)) { tick(); const r = exec(s.body, ctx); if (r === BRK) break; if (r === CONT) continue; if (r) return r; } return;
        case "do": do { tick(); const r = exec(s.body, ctx); if (r === BRK) break; if (r === CONT) continue; if (r) return r; } while (truthy(evalE(s.c, ctx), s.line)); return;
        case "for": {
          const env = new Env(ctx.env); const c2 = Object.assign({}, ctx, { env });
          for (const i of s.init) exec(i, c2);
          while (s.c === null || truthy(evalE(s.c, c2), s.line)) {
            tick();
            const r = exec(s.body, c2);
            if (r === BRK) break; if (r && r !== CONT) return r;
            for (const u of s.upd) evalE(u, c2);
          }
          return;
        }
        case "foreach": {
          const coll = evalE(s.e, ctx);
          const items = enumerate(coll, s.line);
          const snapshotLen = coll instanceof CsList && !coll.arr ? coll.items.length : -1;
          for (const it of items) {
            tick();
            if (snapshotLen >= 0 && coll.items.length !== snapshotLen) throw exc("InvalidOperationException", "Collection was modified; enumeration operation may not execute.", s.line);
            const env = new Env(ctx.env);
            if (s.names) { const parts = it instanceof CsKvp ? [it.Key, it.Value] : it instanceof CsTuple ? it.items : [it]; s.names.forEach((n, i) => env.def(n, parts[i], null)); }
            else env.def(s.name, s.type && s.type.name !== "var" ? coerce(it, s.type, s.line) : it, s.type && s.type.name !== "var" ? s.type : null);
            const r = exec(s.body, Object.assign({}, ctx, { env }));
            if (r === BRK) break; if (r === CONT) continue; if (r) return r;
          }
          return;
        }
        case "switch": {
          const v = evalE(s.e, ctx); let hit = -1;
          outer: for (let i = 0; i < s.sections.length; i++) for (const lab of s.sections[i].labels) { if (lab.def) continue; const env = new Env(ctx.env); if (matchPattern(v, lab, Object.assign({}, ctx, { env })) && (!lab.when || truthy(evalE(lab.when, Object.assign({}, ctx, { env })), s.line))) { hit = i; ctx = Object.assign({}, ctx, { env }); break outer; } }
          if (hit < 0) hit = s.sections.findIndex((sec) => sec.labels.some((l) => l.def));
          if (hit < 0) return;
          const env = new Env(ctx.env); const c2 = Object.assign({}, ctx, { env });
          for (const st of s.sections[hit].body) { const r = exec(st, c2); if (r === BRK) return; if (r) return r; }
          return;
        }
        case "break": return BRK;
        case "continue": return CONT;
        case "return": return new Ret(s.e ? evalE(s.e, ctx) : undefined);
        case "throw": {
          if (!s.e) { if (ctx.caught) throw ctx.caught; throw new CsError("CS0156", "A throw statement with no arguments is not allowed outside of a catch clause", s.line, "compile"); }
          const v = evalE(s.e, ctx);
          if (!(v instanceof CsObj) || !chain(v.cls).some((k) => k.name === "Exception")) throw new CsError("CS0155", "The type caught or thrown must be derived from System.Exception", s.line, "compile");
          throw new Thrown(v, s.line);
        }
        case "try": {
          let result;
          try { result = execBlock(s.body, ctx); }
          catch (e) {
            if (!(e instanceof Thrown)) throw e;
            const c = s.catches.find((c) => !c.type || isA(e.obj.cls, c.type.replace(/^System\./, "")));
            if (!c) throw e;
            const env = new Env(ctx.env); if (c.name) env.def(c.name, e.obj, null);
            const c2 = Object.assign({}, ctx, { env, caught: e });
            if (c.when && !truthy(evalE(c.when, c2), s.line)) throw e;
            result = execBlock(c.body, c2);
          } finally { if (s.fin) { const r = execBlock(s.fin, ctx); if (r) result = r; } }
          return result;
        }
      }
      throw new CsError("NS0002", "Unknown statement " + s.k, s.line, "internal");
    }
    function truthy(v, line) {
      if (typeof v !== "boolean") throw new CsError("CS0029", "Cannot implicitly convert type '" + typeName(v) + "' to 'bool'", line, "compile");
      return v;
    }
    function matchPattern(v, pat, ctx) {
      if (pat.discard) return true;
      if (pat.and) return matchPattern(v, pat.and[0], ctx) && matchPattern(v, pat.and[1], ctx);
      if (pat.or) return matchPattern(v, pat.or[0], ctx) || matchPattern(v, pat.or[1], ctx);
      if (pat.not) return !matchPattern(v, pat.not, ctx);
      if (pat.rel) { const r = evalE(pat.e, ctx); return compare(pat.rel, v, r); }
      if (pat.type) {
        const ok = isType(v, pat.type);
        if (ok && pat.bind) ctx.env.def(pat.bind, v, null);
        return ok;
      }
      const c = evalE(pat.e, ctx);
      if (c && c.__type) return isType(v, c.__type);
      return equals(v, c);
    }
    function isType(v, t) {
      t = t.replace(/^System\./, "");
      if (v === null || v === undefined) return false;
      switch (t) { case "int": case "long": return typeof v === "number"; case "double": case "decimal": case "float": return v instanceof D; case "string": return typeof v === "string"; case "bool": return typeof v === "boolean"; case "char": return v instanceof Ch; case "object": return true; }
      if (v instanceof CsObj) return isA(v.cls, t);
      if (v instanceof CsEnum) return v.type === t;
      return false;
    }
    function enumerate(v, line) {
      if (v === null || v === undefined) throw exc("NullReferenceException", "Object reference not set to an instance of an object.", line);
      if (typeof v === "string") return [...v].map((c) => new Ch(c));
      if (v instanceof CsList) return v.items.slice();
      if (v instanceof CsDict) return [...v.map.values()].map((e) => new CsKvp(e[0], e[1]));
      if (v instanceof CsSet) return [...v.map.values()];
      if (v instanceof CsQueue) return v.stack ? v.items.slice().reverse() : v.items.slice();
      if (v instanceof CsGroup) return v.items.slice();
      throw new CsError("CS1579", "foreach statement cannot operate on variables of type '" + typeName(v) + "'", line, "compile");
    }

    // ───── expressions ─────
    function evalIn(e, ctx, ty) {
      if (e && e.k === "coll") return makeColl(e, ty, ctx);
      if (e && e.k === "new" && !e.type && ty) return evalE(Object.assign({}, e, { type: ty }), ctx);
      if (e && e.k === "lambda") return evalE(e, ctx);
      return evalE(e, ctx);
    }
    function makeColl(e, ty, ctx) {
      const items = e.items.map((x) => x.k === "coll" ? makeColl(x, ty && ty.arr > 1 ? Object.assign({}, ty, { arr: ty.arr - 1 }) : null, ctx) : evalE(x, ctx));
      const elT = ty ? (ty.arr ? { name: ty.name } : ty.args && ty.args[0]) : null;
      const isList = ty && !ty.arr && /List$/.test(ty.name);
      return new CsList(items.map((x) => coerce(x, elT)), netName(elT), !isList);
    }
    function compare(op, a, b) {
      let x, y;
      if (typeof a === "string" && typeof b === "string") throw new CsError("CS0019", "Operator '" + op + "' cannot be applied to operands of type 'string' and 'string'. Use string.Compare or CompareTo", 0, "compile");
      x = a instanceof CsEnum ? a.value : nv(a); y = b instanceof CsEnum ? b.value : nv(b);
      switch (op) { case "<": return x < y; case ">": return x > y; case "<=": return x <= y; case ">=": return x >= y; }
    }
    function equals(a, b) {
      if (a === b) return true;
      if (a === null || b === null || a === undefined || b === undefined) return (a == null) && (b == null);
      if (isNum(a) && isNum(b)) return nv(a) === nv(b);
      if (a instanceof CsEnum && b instanceof CsEnum) return a.type === b.type && a.value === b.value;
      if (a instanceof CsTuple && b instanceof CsTuple) return a.items.length === b.items.length && a.items.every((x, i) => equals(x, b.items[i]));
      if (a instanceof CsObj && b instanceof CsObj) { const eq = findMethod(a.cls, "Equals", 1, [b]); if (eq && !eq.owner.builtin) return invoke(eq.m, eq.owner, a, [b], 0); return false; }
      return false;
    }
    function arith(op, a, b, line, wide) {
      if (op === "+" && (typeof a === "string" || typeof b === "string")) return str(a) + str(b);
      if (a === null || b === null || a === undefined || b === undefined) { if (op === "+" && (typeof a === "string" || typeof b === "string")) return str(a) + str(b); throw exc("NullReferenceException", "Object reference not set to an instance of an object.", line); }
      if (a instanceof CsEnum) a = a.value; if (b instanceof CsEnum) b = b.value;
      if (!isNum(a) || !isNum(b)) throw new CsError("CS0019", "Operator '" + op + "' cannot be applied to operands of type '" + typeName(a) + "' and '" + typeName(b) + "'", line, "compile");
      const dbl = a instanceof D || b instanceof D; const x = nv(a), y = nv(b); let r;
      if (a instanceof D && b instanceof D && !!a.m !== !!b.m && ["+", "-", "*", "/", "%"].includes(op)) throw new CsError("CS0019", "Operator '" + op + "' cannot be applied to operands of type '" + (a.m ? "decimal" : "double") + "' and '" + (b.m ? "decimal" : "double") + "'", line, "compile");
      switch (op) {
        case "+": r = x + y; break; case "-": r = x - y; break; case "*": r = x * y; break;
        case "/": if (!dbl) { if (y === 0) throw exc("DivideByZeroException", "Attempted to divide by zero.", line); r = Math.trunc(x / y); } else r = x / y; break;
        case "%": if (!dbl && y === 0) throw exc("DivideByZeroException", "Attempted to divide by zero.", line); r = x % y; break;
        case "&": r = typeof a === "boolean" ? a && b : x & y; break; case "|": r = x | y; break; case "^": r = x ^ y; break;
      }
      if (!dbl && !wide && Math.abs(x) <= 2147483648 && Math.abs(y) <= 2147483648 && (op === "+" || op === "-" || op === "*") && (r > 2147483647 || r < -2147483648) && opts.checkedInts !== false) {
        if (CHECKED) throw exc("OverflowException", "Arithmetic operation resulted in an overflow.", line);
        r = r | 0; // int wraps like unchecked C#
      }
      if (dbl && ((a instanceof D && a.m) || (b instanceof D && b.m))) return decm(r);
      return dbl ? new D(r) : r;
    }
    function lookupName(n, ctx, line) {
      const e = ctx.env.find(n);
      if (e) return e.v.get(n).val;
      // instance / static members of current class chain
      if (ctx.cls) {
        for (const k of chain(ctx.cls)) {
          if (k.builtin) continue;
          const f = k.fields.find((x) => x.name === n);
          if (f) { if (f.mods.has("static") || f.mods.has("const")) return staticGet(k, n, line); if (!ctx.self) throw new CsError("CS0120", "An object reference is required for the non-static field, method, or property '" + k.name + "." + n + "'", line, "compile"); return ctx.self.f.get(n); }
          const pr = k.props.find((x) => x.name === n);
          if (pr) { if (pr.mods.has("static")) return staticGet(k, n, line); if (!ctx.self) throw new CsError("CS0120", "An object reference is required for the non-static field, method, or property '" + k.name + "." + n + "'", line, "compile"); return getMember(ctx.self, n, line, ctx); }
        }
      }
      if (globalFns.has(n)) return globalFns.get(n);
      throw new CsError("CS0103", "The name '" + n + "' does not exist in the current context", line, "compile");
    }
    function assignTo(target, v, ctx, line) {
      switch (target.k) {
        case "name": {
          const e = ctx.env.find(target.n);
          if (e) { const slot = e.v.get(target.n); slot.val = coerce(v, slot.ty, line); return slot.val; }
          if (ctx.cls) for (const k of chain(ctx.cls)) {
            if (k.builtin) continue;
            const f = k.fields.find((x) => x.name === target.n);
            if (f) { if (f.mods.has("const")) throw new CsError("CS0131", "A const cannot be assigned to", line, "compile"); if (f.mods.has("static")) { k.statics.get(target.n).val = coerce(v, f.type, line); return v; } if (!ctx.self) throw new CsError("CS0120", "An object reference is required for the non-static field '" + target.n + "'", line, "compile"); ctx.self.f.set(target.n, coerce(v, f.type, line)); return v; }
            const pr = k.props.find((x) => x.name === target.n);
            if (pr) { if (pr.mods.has("static")) { k.statics.get(target.n).val = coerce(v, pr.type, line); return v; } setMember(ctx.self, target.n, v, line, Object.assign({}, ctx, { inCtor: true })); return v; }
          }
          throw new CsError("CS0103", "The name '" + target.n + "' does not exist in the current context", line, "compile");
        }
        case "mem": {
          if (target.o.k === "name" && !ctx.env.find(target.o.n) && classes.has(target.o.n)) { const c = classes.get(target.o.n); if (!c.statics.has(target.n)) throw new CsError("CS0117", "'" + c.name + "' does not contain a definition for '" + target.n + "'", line, "compile"); c.statics.get(target.n).val = coerce(v, c.statics.get(target.n).ty, line); return v; }
          const o = target.o.k === "this" ? ctx.self : evalE(target.o, ctx);
          setMember(o, target.n, v, line, ctx); return v;
        }
        case "idx": {
          const o = evalE(target.o, ctx); const i = evalE(target.i, ctx);
          if (o instanceof CsList && o.seq) throw new CsError("CS0021", "Cannot apply indexing with [] to an IEnumerable<T>. Call .ToList() first, or use .ElementAt(i)", e.line, "compile");
          if (o instanceof CsList) { const k = nv(i); if (k < 0 || k >= o.items.length || !Number.isInteger(k)) throw o.arr ? exc("IndexOutOfRangeException", "Index was outside the bounds of the array.", line) : exc("ArgumentOutOfRangeException", "Index was out of range. Must be non-negative and less than the size of the collection. (Parameter 'index')", line); o.items[k] = v; return v; }
          if (o instanceof CsDict) { const k = keyOf(i); o.map.set(k, [i, v]); return v; }
          if (typeof o === "string") throw new CsError("CS0200", "Property or indexer 'string.this[int]' cannot be assigned to -- it is read only (strings are immutable)", line, "compile");
          if (o === null) throw exc("NullReferenceException", "Object reference not set to an instance of an object.", line);
          throw new CsError("CS0021", "Cannot apply indexing with [] to an expression of type '" + typeName(o) + "'", line, "compile");
        }
        case "tuple": {
          const vals = v instanceof CsTuple ? v.items : null;
          if (!vals) throw new CsError("CS8129", "Cannot deconstruct this value", line, "compile");
          target.items.forEach((t, i) => { if (!(t.k === "name" && t.n === "_")) assignTo(t, vals[i], ctx, line); });
          return v;
        }
      }
    }
    function evalE(e, ctx) {
      switch (e.k) {
        case "lit": return e.v;
        case "name": {
          if (e.n === "_" ) return null;
          const env = ctx.env.find(e.n); if (env) return env.v.get(e.n).val;
          if (classes.has(e.n) || enums.has(e.n) || BUILTIN_TYPES.has(e.n)) return { __type: e.n };
          return lookupName(e.n, ctx, e.line);
        }
        case "this": return ctx.self;
        case "base": return { __base: true };
        case "interp": return e.parts.map((pt) => typeof pt === "string" ? pt : align(formatSpec(evalE(pt.e, ctx), pt.fmt), pt.align)).join("");
        case "tuple": return new CsTuple(e.items.map((x) => evalE(x, ctx)));
        case "coll": return makeColl(e, null, ctx);
        case "default": return defaultOf(e.type);
        case "cond": return truthy(evalE(e.c, ctx), e.line) ? evalE(e.a, ctx) : evalE(e.b, ctx);
        case "lambda": { const f = new CsFn(e.params, e.body, e.e, ctx.env, ctx.self, ctx.cls); f.isStatic = ctx.isStatic; return f; }
        case "un": {
          const v = evalE(e.a, ctx);
          if (e.op === "!") return !truthy(v, e.line);
          if (e.op === "-") { if (!isNum(v)) throw new CsError("CS0023", "Operator '-' cannot be applied to operand of type '" + typeName(v) + "'", e.line, "compile"); return v instanceof D ? new D(-v.v) : -nv(v); }
          if (e.op === "~") return ~nv(v);
          return v instanceof Ch ? nv(v) : v;
        }
        case "pre": case "post": {
          const old = evalE(e.a, ctx);
          if (!isNum(old)) throw new CsError("CS0023", "Operator '" + e.op + "' cannot be applied to operand of type '" + typeName(old) + "'", e.line, "compile");
          const nw = old instanceof Ch ? new Ch(String.fromCharCode(nv(old) + (e.op === "++" ? 1 : -1))) : arith(e.op === "++" ? "+" : "-", old, 1, e.line, isLong(e.a, ctx));
          assignTo(e.a, nw, ctx, e.line);
          return e.k === "pre" ? nw : old;
        }
        case "asg": {
          if (e.op === "=") { const v = e.b.k === "coll" ? makeColl(e.b, staticTypeOf(e.a, ctx), ctx) : evalE(e.b, ctx); return assignTo(e.a, v, ctx, e.line); }
          if (e.op === "??=") { const cur = evalE(e.a, ctx); if (cur !== null && cur !== undefined) return cur; return assignTo(e.a, evalE(e.b, ctx), ctx, e.line); }
          const cur = evalE(e.a, ctx); const r = evalE(e.b, ctx);
          if (cur instanceof CsFn || r instanceof CsFn) throw unsupported("delegate combination (+=) / events", e.line);
          let v = arith(e.op[0], cur, r, e.line, isLong(e.a, ctx) || isLong(e.b, ctx));
          if (cur instanceof Ch && typeof v === "number") v = new Ch(String.fromCharCode(v));
          return assignTo(e.a, v, ctx, e.line);
        }
        case "bin": {
          if (e.op === "&&") return truthy(evalE(e.a, ctx), e.line) && truthy(evalE(e.b, ctx), e.line);
          if (e.op === "||") return truthy(evalE(e.a, ctx), e.line) || truthy(evalE(e.b, ctx), e.line);
          if (e.op === "??") { const a = evalE(e.a, ctx); return a !== null && a !== undefined ? a : evalE(e.b, ctx); }
          const a = evalE(e.a, ctx), b = evalE(e.b, ctx);
          if (e.op === "==") return equals(a, b);
          if (e.op === "!=") return !equals(a, b);
          if (["<", ">", "<=", ">="].includes(e.op)) { try { return compare(e.op, a, b); } catch (er) { if (er instanceof CsError) er.line = e.line; throw er; } }
          if ((e.op === "&" || e.op === "|" || e.op === "^") && typeof a === "boolean") return e.op === "&" ? a && b : e.op === "|" ? a || b : a !== b;
          return arith(e.op, a, b, e.line, isLong(e.a, ctx) || isLong(e.b, ctx));
        }
        case "is": { const v = evalE(e.e, ctx); const r = matchPattern(v, e.pat, ctx); return e.neg ? !r : r; }
        case "as": { const v = evalE(e.e, ctx); return isType(v, e.type) ? v : null; }
        case "cast": return cast(evalE(e.e, ctx), e.type, e.line);
        case "swexpr": {
          const v = evalE(e.e, ctx);
          for (const arm of e.arms) { const env = new Env(ctx.env); const c2 = Object.assign({}, ctx, { env }); if (matchPattern(v, arm.pat, c2) && (!arm.when || truthy(evalE(arm.when, c2), e.line))) return evalE(arm.e, c2); }
          throw exc("InvalidOperationException", "The switch expression does not handle all possible values of its input type (it is not exhaustive). Unhandled value: " + str(v), e.line);
        }
        case "idx": {
          const o = evalE(e.o, ctx); const i = evalE(e.i, ctx);
          if (o === null || o === undefined) throw exc("NullReferenceException", "Object reference not set to an instance of an object.", e.line);
          if (typeof o === "string") { const k = nv(i); if (k < 0 || k >= o.length) throw exc("IndexOutOfRangeException", "Index was outside the bounds of the array.", e.line); return new Ch(o[k]); }
          if (o instanceof CsList && o.seq) throw new CsError("CS0021", "Cannot apply indexing with [] to an IEnumerable<T>. Call .ToList() first, or use .ElementAt(i)", e.line, "compile");
          if (o instanceof CsList) { const k = nv(i); if (k < 0 || k >= o.items.length || !Number.isInteger(k)) throw o.arr ? exc("IndexOutOfRangeException", "Index was outside the bounds of the array.", e.line) : exc("ArgumentOutOfRangeException", "Index was out of range. Must be non-negative and less than the size of the collection. (Parameter 'index')", e.line); return o.items[k]; }
          if (o instanceof CsDict) { const k = keyOf(i); if (!o.map.has(k)) throw exc("KeyNotFoundException", "The given key '" + str(i) + "' was not present in the dictionary.", e.line); return o.map.get(k)[1]; }
          if (o instanceof CsSB) return new Ch(o.s[nv(i)]);
          throw new CsError("CS0021", "Cannot apply indexing with [] to an expression of type '" + typeName(o) + "'", e.line, "compile");
        }
        case "mem": {
          if (e.o.k === "name" && !ctx.env.find(e.o.n)) {
            const tn = e.o.n;
            if (enums.has(tn)) { const en = enums.get(tn); const m = en.members.find((x) => x.name === e.n); if (!m) throw new CsError("CS0117", "'" + tn + "' does not contain a definition for '" + e.n + "'", e.line, "compile"); return new CsEnum(tn, m.name, m.value); }
            if (classes.has(tn) && !(ctx.cls && memberNamed(ctx.cls, tn))) return staticGet(classes.get(tn), e.n, e.line);
            const sv = staticBuiltin(tn, e.n, e.line); if (sv !== NOPE) return sv;
          }
          const o = evalE(e.o, ctx);
          if (e.cond && (o === null || o === undefined)) return null;
          if (o && o.__type) { if (o.__type === "System") return { __type: e.n }; const sv = staticBuiltin(o.__type, e.n, e.line); if (sv !== NOPE) return sv; }
          if (o instanceof CsList && !o.arr && e.n === "Length") throw new CsError("CS1061", "'List<T>' does not contain a definition for 'Length'. A list has .Count", e.line, "compile");
          return getMember(o, e.n, e.line, ctx);
        }
        case "call": return evalCall(e, ctx);
        case "new": return evalNew(e, ctx);
        case "newarr": {
          const elT = e.type ? { name: e.type.name, args: e.type.args } : null;
          if (e.items) { const items = e.items.map((x) => x.k === "coll" ? makeColl(x, null, ctx) : evalE(x, ctx)).map((x) => coerce(x, elT)); return new CsList(items, netName(elT) || (items.length ? netName({ name: typeName(items[0]) }) : "System.Object"), true); }
          const n = nv(evalE(e.size, ctx));
          if (n < 0) throw exc("OverflowException", "Arithmetic operation resulted in an overflow.", e.line);
          const d = e.jag ? null : defaultOf(elT);
          return new CsList(Array.from({ length: n }, () => d), netName(elT), true);
        }
        case "throwexpr": { const v = evalE(e.e, ctx); throw new Thrown(v, e.line); }
        case "outvar": { ctx.env.def(e.name, defaultOf(e.type), e.type || null); const env = ctx.env; return new Ref(() => env.v.get(e.name).val, (v) => { env.v.get(e.name).val = v; }); }
        case "ref": { const t = e.e; return new Ref(() => evalE(t, ctx), (v) => assignTo(t, v, ctx, e.line)); }
      }
      throw new CsError("NS0003", "Unknown expression " + e.k, e.line, "internal");
    }
    function memberNamed(c, n) { for (const k of chain(c)) { if (k.builtin) continue; if (k.fields.some((f) => f.name === n) || k.props.some((p) => p.name === n)) return true; } return false; }
    /* is this expression a long (so its arithmetic is 64-bit)? */
    function isLong(e, ctx) {
      if (!e || typeof e !== "object") return false;
      if (e.k === "lit") return !!e.lng;
      if (e.k === "name") { const t = staticTypeOf(e, ctx); return !!(t && (t.name === "long" || t.name === "ulong" || t.name === "Int64")); }
      if (e.k === "cast") return !!(e.type && (e.type.name === "long" || e.type.name === "ulong"));
      if (e.k === "bin" || e.k === "paren") return isLong(e.a, ctx) || isLong(e.b, ctx) || isLong(e.e, ctx);
      if (e.k === "mem" && e.o && e.o.k === "name" && e.o.n === "long") return true;
      return false;
    }
    function staticTypeOf(target, ctx) {
      if (target.k === "name") { const e = ctx.env.find(target.n); if (e) return e.v.get(target.n).ty; if (ctx.cls) { const f = findField(ctx.cls, target.n); if (f) return f.f.type; const pr = findProp(ctx.cls, target.n); if (pr) return pr.p.type; } }
      if (target.k === "mem") { const o = evalE(target.o, ctx); if (o instanceof CsObj) { const f = findField(o.cls, target.n); if (f) return f.f.type; const pr = findProp(o.cls, target.n); if (pr) return pr.p.type; } }
      return null;
    }
    function cast(v, ty, line) {
      const n = ty.name;
      if (v === null) { if (["int", "double", "char", "bool", "long"].includes(n)) throw exc("NullReferenceException", "Object reference not set to an instance of an object.", line); return null; }
      switch (n) {
        case "int": case "long": case "short": case "byte": if (v instanceof D) { if (!isFinite(v.v)) return -2147483648; return Math.trunc(v.v); } if (v instanceof Ch) return nv(v); if (v instanceof CsEnum) return v.value; if (typeof v === "number") return v; break;
        case "double": case "float": case "decimal": if (isNum(v)) return new D(nv(v)); break;
        case "char": if (isNum(v)) return new Ch(String.fromCharCode(nv(v))); break;
        case "string": if (typeof v === "string") return v; break;
        case "object": return v;
        default:
          if (enums.has(n) && typeof v === "number") { const en = enums.get(n); const m = en.members.find((x) => x.value === v); return new CsEnum(n, m ? m.name : String(v), v); }
          if (v instanceof CsObj) { if (isA(v.cls, n)) return v; throw exc("InvalidCastException", "Unable to cast object of type '" + v.cls.name + "' to type '" + n + "'.", line); }
          return v;
      }
      throw new CsError("CS0030", "Cannot convert type '" + typeName(v) + "' to '" + n + "'", line, "compile");
    }
    function evalNew(e, ctx) {
      const ty = e.type; if (!ty) throw new CsError("CS8754", "There is no target type for 'new()'", e.line, "compile");
      const args = e.args.map((a) => evalE(a, ctx));
      const n = ty.name.replace(/^System\.(Collections\.Generic\.|Text\.)?/, "");
      const T = ty.args || [];
      let o;
      switch (n) {
        case "List": case "IList": o = new CsList(args[0] instanceof CsList ? args[0].items.slice() : args[0] && typeof args[0] !== "number" ? enumerate(args[0], e.line) : [], netName(T[0])); break;
        case "Dictionary": o = new CsDict(netName(T[0]), netName(T[1])); if (args[0] instanceof CsDict) for (const [k, v] of args[0].map) o.map.set(k, v.slice()); break;
        case "HashSet": o = new CsSet(); if (args[0]) for (const x of enumerate(args[0], e.line)) o.map.set(keyOf(x), x); break;
        case "Queue": o = new CsQueue(false); if (args[0]) o.items = enumerate(args[0], e.line); break;
        case "Stack": o = new CsQueue(true); if (args[0]) o.items = enumerate(args[0], e.line); break;
        case "StringBuilder": o = new CsSB(args[0] ? str(args[0]) : ""); break;
        case "Random": return (rnd = new CsRandom(args.length ? nv(args[0]) : 12345));
        case "string": case "String": return str(args[0]).repeat(nv(args[1]));
        case "object": return new CsObj({ name: "Object", base: null, ifaces: [], fields: [], props: [], methods: new Map(), ctors: [], statics: new Map() });
        case "KeyValuePair": return new CsKvp(args[0], args[1]);
        default: {
          const c = classes.get(n);
          if (!c) throw new CsError("CS0246", "The type or namespace name '" + n + "' could not be found (are you missing a using directive or an assembly reference?)", e.line, "compile");
          return instantiate(c, args, e.line, e.init, ctx);
        }
      }
      if (e.init) {
        for (const it of e.init.items) {
          if (it.add) { const v = evalE(it.add, ctx); if (o instanceof CsList) o.items.push(coerce(v, T[0])); else if (o instanceof CsSet) o.map.set(keyOf(v), v); else throw new CsError("CS1922", "Cannot initialize this type with a collection initializer", e.line, "compile"); }
          else if (it.pair) { const k = evalE(it.pair[0], ctx), v = evalE(it.pair[1], ctx); const kk = keyOf(k); if (o.map.has(kk)) throw exc("ArgumentException", "An item with the same key has already been added. Key: " + str(k), e.line); o.map.set(kk, [k, coerce(v, T[1])]); }
          else if (it.key) { const k = evalE(it.key, ctx), v = evalE(it.e, ctx); o.map.set(keyOf(k), [k, coerce(v, T[1])]); }
          else if (it.set) throw new CsError("CS0117", "'" + n + "' does not contain a definition for '" + it.set + "'", e.line, "compile");
        }
      }
      return o;
    }

    const NOPE = {};
    function staticBuiltin(t, n, line) {
      const tn = t.replace(/^System\./, "");
      if (tn === "Math") { if (n === "PI") return new D(Math.PI); if (n === "E") return new D(Math.E); }
      if (tn === "int" || tn === "Int32") { if (n === "MaxValue") return 2147483647; if (n === "MinValue") return -2147483648; }
      if (tn === "double" || tn === "Double") { if (n === "MaxValue") return new D(Number.MAX_VALUE); if (n === "MinValue") return new D(-Number.MAX_VALUE); if (n === "NaN") return new D(NaN); if (n === "PositiveInfinity") return new D(Infinity); if (n === "Epsilon") return new D(5e-324); }
      if (tn === "string" || tn === "String") { if (n === "Empty") return ""; }
      if (tn === "Environment" && n === "NewLine") return "\n";
      if (tn === "StringSplitOptions") return n;
      if (tn === "StringComparison") return n;
      if (tn === "MidpointRounding") return n;
      if (tn === "Console" && n === "Out") return { __type: "Console" };
      return NOPE;
    }

    // ───── calls ─────
    function evalCall(e, ctx) {
      const f = e.f; const line = e.line;
      const argv = () => e.args.map((a) => a.k === "outvar" || a.k === "ref" ? evalE(a, ctx) : evalE(a, ctx));
      if (f.k === "name" && (f.n === "checked" || f.n === "unchecked") && e.args.length === 1 && !ctx.env.find(f.n)) {
        const was = CHECKED; CHECKED = f.n === "checked" ? 1 : 0;
        try { return evalE(e.args[0], ctx); } finally { CHECKED = was; }
      }
      if (f.k === "name") {
        // local variable holding a delegate / local function
        const env = ctx.env.find(f.n);
        if (env) { const fn = env.v.get(f.n).val; const a = argv(); const r = callFn(fn, a, line); return fn && fn.retType ? coerce(r, fn.retType, line) : r; }
        if (ctx.cls) {
          const a = argv();
          const m = findMethod(ctx.cls, f.n, a.length, a);
          if (m) {
            const isStaticM = m.m.mods.has("static");
            if (!isStaticM && !ctx.self) throw new CsError("CS0120", "An object reference is required for the non-static field, method, or property '" + m.owner.name + "." + f.n + "'. Make the method static, or call it on an object", line, "compile");
            if (!isStaticM && ctx.self) { const vm = findMethod(ctx.self.cls, f.n, a.length, a); return invoke(vm.m, vm.owner, ctx.self, a, line); }
            return invoke(m.m, m.owner, null, a, line);
          }
          if (ctx.cls.methods.size || chain(ctx.cls).some((k) => k.methods && k.methods.has(f.n))) {
            const any = chain(ctx.cls).find((k) => k.methods && k.methods.has(f.n));
            if (any) throw new CsError("CS1501", "No overload for method '" + f.n + "' takes " + a.length + " arguments", line, "compile");
          }
          // a delegate stored in a field/property
          const fm = findField(ctx.cls, f.n) || findProp(ctx.cls, f.n);
          if (fm) return callFn(lookupName(f.n, ctx, line), a, line);
          if (globalFns.has(f.n)) return callFn(globalFns.get(f.n), a, line);
        }
        if (globalFns.has(f.n)) return callFn(globalFns.get(f.n), argv(), line);
        if (f.n === "nameof") return "";
        throw new CsError("CS0103", "The name '" + f.n + "' does not exist in the current context", line, "compile");
      }
      if (f.k === "mem") {
        // static calls on a type name
        if (f.o.k === "name" && !ctx.env.find(f.o.n) && !(ctx.cls && memberNamed(ctx.cls, f.o.n))) {
          const tn = f.o.n;
          if (classes.has(tn) && !classes.get(tn).builtin) {
            const c = classes.get(tn); const a = argv(); const m = findMethod(c, f.n, a.length, a);
            if (!m) throw new CsError(c.methods.has(f.n) ? "CS1501" : "CS0117", c.methods.has(f.n) ? "No overload for method '" + f.n + "' takes " + a.length + " arguments" : "'" + tn + "' does not contain a definition for '" + f.n + "'", line, "compile");
            if (!m.m.mods.has("static")) throw new CsError("CS0120", "An object reference is required for the non-static method '" + tn + "." + f.n + "'. Create an object with new " + tn + "(...) first", line, "compile");
            return invoke(m.m, m.owner, null, a, line);
          }
          if (BUILTIN_TYPES.has(tn) || tn === "System") return callStatic(tn, f.n, argv(), line, ctx, f.targs);
        }
        if (f.o.k === "base") {
          const a = argv(); const base = classes.get(ctx.cls.base);
          if (base && base.builtin) { if (f.n === "ToString") return "System." + base.name + ": " + ctx.self.f.get("Message"); }
          const m = findMethod(base, f.n, a.length, a);
          if (!m) throw new CsError("CS0117", "'" + ctx.cls.base + "' does not contain a definition for '" + f.n + "'", line, "compile");
          return invoke(m.m, m.owner, ctx.self, a, line);
        }
        if (f.o.k === "mem" && f.o.o.k === "name" && f.o.o.n === "System") return callStatic(f.o.n, f.n, argv(), line, ctx, f.targs);
        const o = evalE(f.o, ctx);
        if (f.cond && (o === null || o === undefined)) return null;
        if (o && o.__type) return callStatic(o.__type, f.n, argv(), line, ctx, f.targs);
        const a = argv();
        return callMethod(o, f.n, a, line, ctx);
      }
      // calling an expression result (delegate)
      const fn = evalE(f, ctx);
      return callFn(fn, argv(), line);
    }
    function callMethod(o, n, a, line, ctx) {
      if (o === null || o === undefined) throw exc("NullReferenceException", "Object reference not set to an instance of an object.", line);
      if (o instanceof CsObj) {
        if (n === "GetType") return { Name: o.cls.name };
        const m = findMethod(o.cls, n, a.length, a);
        if (m) {
          if (m.m.mods.has("private") && ctx && ctx.cls && !chain(o.cls).includes(ctx.cls) && ctx.cls !== m.owner) throw new CsError("CS0122", "'" + m.owner.name + "." + n + "' is inaccessible due to its protection level", line, "compile");
          return invoke(m.m, m.owner, o, a, line);
        }
        if (n === "ToString") return CUR.objToString(o);
        if (n === "Equals") return equals(o, a[0]);
        if (n === "GetHashCode") return 0;
        // delegate in a property / field
        const pr = findProp(o.cls, n) || findField(o.cls, n);
        if (pr) return callFn(getMember(o, n, line, ctx), a, line);
        if (o.cls.methods && [...chain(o.cls)].some((k) => k.methods && k.methods.has(n))) throw new CsError("CS1501", "No overload for method '" + n + "' takes " + a.length + " arguments", line, "compile");
        throw new CsError("CS1061", "'" + o.cls.name + "' does not contain a definition for '" + n + "'", line, "compile");
      }
      if (o instanceof CsFn && n === "Invoke") return callFn(o, a, line);
      const r = builtinMethod(o, n, a, line);
      if (r !== NOPE) return r;
      throw new CsError("CS1061", "'" + typeName(o) + "' does not contain a definition for '" + n + "'", line, "compile");
    }

    function readLine() { tick(); return inPos < stdin.length ? stdin[inPos++] : null; }
    function parseIntStrict(s, line, kind) {
      if (s === null || s === undefined) throw exc("ArgumentNullException", "Value cannot be null. (Parameter 's')", line);
      const t = String(s).trim();
      if (kind === "int") { if (!/^[+-]?\d+$/.test(t)) throw exc("FormatException", "The input string '" + s + "' was not in a correct format.", line); const v = parseInt(t, 10); if (v > 2147483647 || v < -2147483648) throw exc("OverflowException", "Value was either too large or too small for an Int32.", line); return v; }
      if (!/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(t) && !/^[+-]?\d{1,3}(,\d{3})+(\.\d+)?$/.test(t)) throw exc("FormatException", "The input string '" + s + "' was not in a correct format.", line);
      return new D(parseFloat(t.replace(/,/g, "")));
    }
    /* .NET's Math.Round(x, d): scale, round to even on an EXACT .5, scale
       back — so 2.345 rounds to 2.35 (2.345 * 100 is 234.50000000000003) */
    function bankers(x, d) {
      const m = Math.pow(10, d || 0); const y = x * m;
      const f = Math.floor(y);
      if (y - f === 0.5) return (f % 2 === 0 ? f : f + 1) / m;
      return Math.round(y) / m;
    }
    function callStatic(t, n, a, line, ctx, targs) {
      const tn = t.replace(/^System\./, "");
      switch (tn) {
        case "Console":
          if (n === "WriteLine") { if (a.length > 1 && typeof a[0] === "string") write(composite(a[0], a.slice(1), line) + "\n"); else write((a.length ? str(a[0]) : "") + "\n"); return; }
          if (n === "Write") { if (a.length > 1 && typeof a[0] === "string") write(composite(a[0], a.slice(1), line)); else write(str(a[0])); return; }
          if (n === "ReadLine") return readLine();
          if (n === "Clear" || n === "ResetColor" || n === "Beep") return;
          if (n === "ReadKey" || n === "Read") throw unsupported("Console.ReadKey — tasks read whole lines with Console.ReadLine()", line);
          break;
        case "Math": {
          const x = a.map(nv); const anyD = a.some((v) => v instanceof D);
          const wrap = (r) => anyD ? new D(r) : r;
          switch (n) {
            case "Abs": return wrap(Math.abs(x[0])); case "Max": return wrap(Math.max(x[0], x[1])); case "Min": return wrap(Math.min(x[0], x[1]));
            case "Pow": return new D(Math.pow(x[0], x[1])); case "Sqrt": return new D(Math.sqrt(x[0])); case "Floor": return new D(Math.floor(x[0])); case "Ceiling": return new D(Math.ceil(x[0]));
            case "Round": { if (a[a.length - 1] === "AwayFromZero") { const d = a.length === 3 ? x[1] : 0; const m = Math.pow(10, d); return new D(Math.sign(x[0]) * Math.round(Math.abs(x[0]) * m) / m); } return new D(bankers(x[0], a.length > 1 ? x[1] : 0)); }
            case "Truncate": return new D(Math.trunc(x[0])); case "Sign": return Math.sign(x[0]); case "Clamp": return wrap(Math.min(Math.max(x[0], x[1]), x[2]));
            case "Sin": return new D(Math.sin(x[0])); case "Cos": return new D(Math.cos(x[0])); case "Log": return new D(a.length > 1 ? Math.log(x[0]) / Math.log(x[1]) : Math.log(x[0])); case "Log10": return new D(Math.log10(x[0])); case "Log2": return new D(Math.log2(x[0]));
          }
          break;
        }
        case "int": case "Int32": case "long": case "Int64":
          if (n === "Parse") return parseIntStrict(a[0], line, "int");
          if (n === "TryParse") { try { const v = parseIntStrict(a[0], line, "int"); a[1].set(v); return true; } catch (er) { if (er instanceof Thrown) { a[1].set(0); return false; } throw er; } }
          break;
        case "double": case "Double": case "decimal": case "Decimal": case "float":
          if (n === "Parse") return parseIntStrict(a[0], line, "double");
          if (n === "TryParse") { try { const v = parseIntStrict(a[0], line, "double"); a[1].set(v); return true; } catch (er) { if (er instanceof Thrown) { a[1].set(new D(0)); return false; } throw er; } }
          if (n === "IsNaN") return Number.isNaN(nv(a[0]));
          break;
        case "bool": case "Boolean": if (n === "Parse") { const s = String(a[0]).trim().toLowerCase(); if (s === "true") return true; if (s === "false") return false; throw exc("FormatException", "String '" + a[0] + "' was not recognized as a valid Boolean.", line); } break;
        case "char": case "Char": {
          const c = a[0] instanceof Ch ? a[0].c : typeof a[0] === "string" ? a[0][nv(a[1])] : String(a[0]);
          switch (n) {
            case "IsDigit": return /[0-9]/.test(c); case "IsLetter": return /\p{L}/u.test(c); case "IsLetterOrDigit": return /[\p{L}0-9]/u.test(c);
            case "IsUpper": return /\p{Lu}/u.test(c); case "IsLower": return /\p{Ll}/u.test(c); case "IsWhiteSpace": return /\s/.test(c); case "IsPunctuation": return /[!-\/:-@\[-`{-~]/.test(c) && !/[$+<=>^`|~]/.test(c);
            case "ToUpper": return new Ch(c.toUpperCase()); case "ToLower": return new Ch(c.toLowerCase()); case "GetNumericValue": return new D(/[0-9]/.test(c) ? +c : -1);
          }
          break;
        }
        case "string": case "String":
          switch (n) {
            case "Join": { const sep = str(a[0]); const items = a.length === 2 && (a[1] instanceof CsList || a[1] instanceof CsSet || a[1] instanceof CsGroup) ? enumerate(a[1], line) : a.slice(1); return items.map(str).join(sep); }
            case "IsNullOrEmpty": return a[0] === null || a[0] === ""; case "IsNullOrWhiteSpace": return a[0] === null || String(a[0]).trim() === "";
            case "Concat": return a.length === 1 && a[0] instanceof CsList ? a[0].items.map(str).join("") : a.map(str).join(""); case "Format": return composite(a[0], a.slice(1), line);
            case "Compare": return Math.sign(String(a[0]).localeCompare(String(a[1]))); case "Equals": return a[0] === a[1];
          }
          break;
        case "Convert":
          switch (n) {
            case "ToInt32": if (typeof a[0] === "string") return parseIntStrict(a[0], line, "int"); if (a[0] instanceof D) return bankers(a[0].v, 0); if (typeof a[0] === "boolean") return a[0] ? 1 : 0; return nv(a[0]);
            case "ToDouble": if (typeof a[0] === "string") return parseIntStrict(a[0], line, "double"); return new D(nv(a[0]));
            case "ToString": return str(a[0]); case "ToChar": return new Ch(String.fromCharCode(nv(a[0]))); case "ToBoolean": return typeof a[0] === "string" ? a[0].toLowerCase() === "true" : !!nv(a[0]);
          }
          break;
        case "Array":
          if (n === "Sort") { sortList(a[0], a[1], line); return; }
          if (n === "Reverse") { a[0].items.reverse(); return; }
          if (n === "IndexOf") return a[0].items.findIndex((x) => equals(x, a[1]));
          if (n === "Empty") return new CsList([], "System.Object", true);
          if (n === "Fill") { a[0].items.fill(a[1]); return; }
          if (n === "Copy") { for (let i = 0; i < nv(a[2]); i++) a[1].items[i] = a[0].items[i]; return; }
          if (n === "Resize") throw unsupported("Array.Resize (uses ref) — make a new array or use a List<T>", line);
          break;
        case "Enumerable":
          if (n === "Range") return new CsList(Array.from({ length: nv(a[1]) }, (_, i) => nv(a[0]) + i), "System.Int32");
          if (n === "Repeat") return new CsList(Array.from({ length: nv(a[1]) }, () => a[0]), "System.Object");
          break;
        case "Assert": return assertCall(n, a, line, targs);
        case "Thread": throw unsupported("threads", line);
      }
      throw new CsError("CS0117", "'" + tn + "' does not contain a definition for '" + n + "'", line, "compile");
    }
    function assertCall(n, a, line, targs) {
      const fail = (msg) => { const o = new CsObj(classes.get("AssertFailedException")); o.f.set("Message", msg); throw new Thrown(o, line); };
      switch (n) {
        case "Equal": if (!equals(a[0], a[1]) && !(a[0] instanceof CsList && a[1] instanceof CsList && show(a[0]) === show(a[1]))) fail("Assert.Equal() Failure\nExpected: " + show(a[0]) + "\nActual:   " + show(a[1])); return;
        case "NotEqual": if (equals(a[0], a[1])) fail("Assert.NotEqual() Failure: both were " + show(a[0])); return;
        case "True": if (a[0] !== true) fail("Assert.True() Failure" + (a[1] ? ": " + a[1] : "")); return;
        case "False": if (a[0] !== false) fail("Assert.False() Failure" + (a[1] ? ": " + a[1] : "")); return;
        case "Null": if (a[0] !== null) fail("Assert.Null() Failure"); return;
        case "NotNull": if (a[0] === null) fail("Assert.NotNull() Failure"); return;
        case "Empty": if (enumerate(a[0], line).length) fail("Assert.Empty() Failure"); return;
        case "Contains": { const ok = typeof a[1] === "string" ? a[1].includes(a[0]) : enumerate(a[1], line).some((x) => equals(x, a[0])); if (!ok) fail("Assert.Contains() Failure: " + show(a[0]) + " not found"); return; }
        case "Throws": {
          const want = targs && targs[0] ? targs[0].name : "Exception";
          try { callFn(a[0], [], line); } catch (er) { if (er instanceof Thrown) { if (er.obj.cls.name === want) return er.obj; fail("Assert.Throws() Failure\nExpected: " + want + "\nActual:   " + er.obj.cls.name); } throw er; }
          fail("Assert.Throws() Failure\nExpected: " + want + "\nActual:   (no exception was thrown)");
        }
      }
      throw new CsError("CS0117", "'Assert' does not contain a definition for '" + n + "'", line, "compile");
    }
    function cmpVals(x, y) {
      if (typeof x === "string" && typeof y === "string") { const r = x.localeCompare(y, "en", { sensitivity: "variant", caseFirst: "lower" }); return r; }
      if (x instanceof CsObj) { const m = findMethod(x.cls, "CompareTo", 1, [y]); if (m) return nv(invoke(m.m, m.owner, x, [y], 0)); throw CUR.exc("InvalidOperationException", "Failed to compare two elements in the array.", 0); }
      if (x instanceof CsTuple) { for (let i = 0; i < x.items.length; i++) { const r = cmpVals(x.items[i], y.items[i]); if (r) return r; } return 0; }
      const a = x instanceof CsEnum ? x.value : nv(x), b = y instanceof CsEnum ? y.value : nv(y);
      return a < b ? -1 : a > b ? 1 : 0;
    }
    function sortList(list, cmp, line) {
      if (cmp) list.items.sort((x, y) => nv(callFn(cmp, [x, y], line)));
      else list.items.sort(cmpVals);
    }
    function linq(items, n, a, line, src) {
      const f = a[0];
      const call = (fn, ...xs) => callFn(fn, xs, line);
      const tname = src && src.tname;
      const L = (arr, t) => { const l = new CsList(arr, t || "System.Object"); l.seq = true; return l; };
      const needNonEmpty = () => { if (!items.length) throw exc("InvalidOperationException", "Sequence contains no elements", line); };
      switch (n) {
        case "Where": return L(items.filter((x, i) => call(f, x, i)), tname);
        case "Select": return L(items.map((x, i) => call(f, x, i)));
        case "SelectMany": return L(items.flatMap((x) => enumerate(call(f, x), line)));
        case "OrderBy": case "OrderByDescending": { const keyed = items.map((x) => [call(f, x), x]); keyed.sort((p, q) => cmpVals(p[0], q[0]) * (n === "OrderBy" ? 1 : -1)); const r = L(keyed.map((k) => k[1]), tname); r.order = [{ f, desc: n !== "OrderBy" }]; return r; }
        case "ThenBy": case "ThenByDescending": {
          if (!src.order) throw new CsError("CS1061", "ThenBy needs to follow OrderBy", line, "compile");
          const keys = src.order.concat([{ f, desc: n === "ThenByDescending" }]);
          const sorted = items.slice().sort((x, y) => { for (const k of keys) { const r = cmpVals(call(k.f, x), call(k.f, y)) * (k.desc ? -1 : 1); if (r) return r; } return 0; });
          const r = L(sorted, tname); r.order = keys; return r;
        }
        case "Count": return f ? items.filter((x) => call(f, x)).length : items.length;
        case "Sum": { const vs = f ? items.map((x) => call(f, x)) : items; const dbl = vs.some((v) => v instanceof D); const s = vs.reduce((acc, v) => acc + nv(v), 0); return dbl ? new D(s) : s; }
        case "Average": { needNonEmpty(); const vs = f ? items.map((x) => call(f, x)) : items; return new D(vs.reduce((acc, v) => acc + nv(v), 0) / vs.length); }
        case "Max": case "Min": { needNonEmpty(); const vs = f ? items.map((x) => call(f, x)) : items; return vs.reduce((p, q) => (cmpVals(q, p) * (n === "Max" ? 1 : -1) > 0 ? q : p)); }
        case "MaxBy": case "MinBy": { needNonEmpty(); return items.reduce((p, q) => (cmpVals(call(f, q), call(f, p)) * (n === "MaxBy" ? 1 : -1) > 0 ? q : p)); }
        case "Any": return f ? items.some((x) => call(f, x)) : items.length > 0;
        case "All": return items.every((x) => call(f, x));
        case "First": { const r = f ? items.filter((x) => call(f, x)) : items; if (!r.length) throw exc("InvalidOperationException", f ? "Sequence contains no matching element" : "Sequence contains no elements", line); return r[0]; }
        case "FirstOrDefault": { const r = f ? items.find((x) => call(f, x)) : items[0]; return r === undefined ? null : r; }
        case "Last": { needNonEmpty(); return items[items.length - 1]; }
        case "LastOrDefault": return items.length ? items[items.length - 1] : null;
        case "Single": if (items.length !== 1) throw exc("InvalidOperationException", "Sequence contains more than one element", line); return items[0];
        case "ToList": return new CsList(items.slice(), tname);
        case "ToArray": return new CsList(items.slice(), tname, true);
        case "ToHashSet": { const s = new CsSet(); for (const x of items) s.map.set(keyOf(x), x); return s; }
        case "ToDictionary": { const d = new CsDict("System.Object", "System.Object"); for (const x of items) { const k = call(f, x); const kk = keyOf(k); if (d.map.has(kk)) throw exc("ArgumentException", "An item with the same key has already been added. Key: " + str(k), line); d.map.set(kk, [k, a[1] ? call(a[1], x) : x]); } return d; }
        case "Distinct": { const seen = new Map(); for (const x of items) if (!seen.has(keyOf(x))) seen.set(keyOf(x), x); return L([...seen.values()], tname); }
        case "Take": return L(items.slice(0, nv(f)), tname);
        case "Skip": return L(items.slice(nv(f)), tname);
        case "TakeWhile": { const r = []; for (const x of items) { if (!call(f, x)) break; r.push(x); } return L(r, tname); }
        case "SkipWhile": { let i = 0; while (i < items.length && call(f, items[i])) i++; return L(items.slice(i), tname); }
        case "Reverse": return L(items.slice().reverse(), tname);
        case "Contains": return items.some((x) => equals(x, f));
        case "Concat": return L(items.concat(enumerate(f, line)), tname);
        case "Zip": { const o = enumerate(f, line); return L(items.slice(0, Math.min(items.length, o.length)).map((x, i) => a[1] ? call(a[1], x, o[i]) : new CsTuple([x, o[i]]))); }
        case "Aggregate": { if (a.length === 1) { needNonEmpty(); return items.slice(1).reduce((acc, x) => call(f, acc, x), items[0]); } return items.reduce((acc, x) => call(a[1], acc, x), a[0]); }
        case "GroupBy": { const g = new Map(); for (const x of items) { const k = call(f, x); const kk = keyOf(k); if (!g.has(kk)) g.set(kk, new CsGroup(k, [])); g.get(kk).items.push(x); } return L([...g.values()]); }
        case "Sum0": break;
      }
      return NOPE;
    }
    function builtinMethod(o, n, a, line) {
      if (typeof o === "string") {
        const s = o;
        switch (n) {
          case "ToUpper": case "ToUpperInvariant": return s.toUpperCase(); case "ToLower": case "ToLowerInvariant": return s.toLowerCase();
          case "Trim": return a.length ? trimChars(s, a, 3) : s.trim(); case "TrimStart": return a.length ? trimChars(s, a, 1) : s.replace(/^\s+/, ""); case "TrimEnd": return a.length ? trimChars(s, a, 2) : s.replace(/\s+$/, "");
          case "Contains": return s.includes(str(a[0])); case "StartsWith": return s.startsWith(str(a[0])); case "EndsWith": return s.endsWith(str(a[0]));
          case "IndexOf": return s.indexOf(str(a[0]), a[1] !== undefined ? nv(a[1]) : 0); case "LastIndexOf": return s.lastIndexOf(str(a[0]));
          case "Replace": return s.split(str(a[0])).join(str(a[1]));
          case "Substring": { const st = nv(a[0]); const len = a.length > 1 ? nv(a[1]) : s.length - st; if (st < 0 || st > s.length || len < 0 || st + len > s.length) throw exc("ArgumentOutOfRangeException", a.length > 1 ? "Index and length must refer to a location within the string. (Parameter 'length')" : "startIndex cannot be larger than length of string. (Parameter 'startIndex')", line); return s.substr(st, len); }
          case "Split": {
            let seps = a.filter((x) => typeof x === "string" && x !== "RemoveEmptyEntries" && x !== "TrimEntries" && x !== "None" || x instanceof Ch || x instanceof CsList).flatMap((x) => x instanceof CsList ? x.items.map(str) : [str(x)]);
            const rm = a.includes("RemoveEmptyEntries"), tr = a.includes("TrimEntries");
            if (!seps.length) seps = [" "];
            let parts = [s];
            for (const sp of seps) parts = parts.flatMap((pp) => pp.split(sp));
            if (tr) parts = parts.map((x) => x.trim());
            if (rm) parts = parts.filter((x) => x !== "");
            return new CsList(parts, "System.String", true);
          }
          case "PadLeft": return s.padStart(nv(a[0]), a[1] ? str(a[1]) : " "); case "PadRight": return s.padEnd(nv(a[0]), a[1] ? str(a[1]) : " ");
          case "ToCharArray": return new CsList([...s].map((c) => new Ch(c)), "System.Char", true);
          case "Equals": return a[1] === "OrdinalIgnoreCase" || a[1] === "CurrentCultureIgnoreCase" ? s.toLowerCase() === str(a[0]).toLowerCase() : s === a[0];
          case "CompareTo": return Math.sign(s.localeCompare(str(a[0]), "en", { caseFirst: "lower" }));
          case "Insert": return s.slice(0, nv(a[0])) + str(a[1]) + s.slice(nv(a[0]));
          case "Remove": return a.length > 1 ? s.slice(0, nv(a[0])) + s.slice(nv(a[0]) + nv(a[1])) : s.slice(0, nv(a[0]));
          case "ToString": return s; case "GetHashCode": return 0;
        }
        const r = linq([...s].map((c) => new Ch(c)), n, a, line, { tname: "System.Char" });
        if (r !== NOPE) return r;
      }
      if (typeof o === "number" || o instanceof D || o instanceof Ch || typeof o === "boolean" || o instanceof CsEnum) {
        if (n === "ToString") return a.length ? formatSpec(o, str(a[0])) : str(o);
        if (n === "CompareTo") return cmpVals(o, a[0]);
        if (n === "Equals") return equals(o, a[0]);
        if (n === "GetHashCode") return nv(o) | 0;
      }
      if (o instanceof CsList) {
        const L = o.items;
        if (o.seq && ["Add", "Remove", "RemoveAt", "Insert", "Clear", "AddRange", "Sort", "IndexOf", "Find", "ForEach"].includes(n)) throw new CsError("CS1061", "'IEnumerable<T>' does not contain a definition for '" + n + "'. Call .ToList() first", line, "compile");
        if (o.arr && ["Add", "Remove", "RemoveAt", "Insert", "Clear", "AddRange"].includes(n)) throw new CsError("CS1061", "Arrays have a fixed size: an array does not contain '" + n + "'. Use a List<T> to add or remove items", line, "compile");
        switch (n) {
          case "Add": L.push(a[0]); return; case "AddRange": L.push(...enumerate(a[0], line)); return; case "Clear": L.length = 0; return;
          case "Remove": { const i = L.findIndex((x) => equals(x, a[0])); if (i >= 0) { L.splice(i, 1); return true; } return false; }
          case "RemoveAt": { const i = nv(a[0]); if (i < 0 || i >= L.length) throw exc("ArgumentOutOfRangeException", "Index was out of range. Must be non-negative and less than the size of the collection. (Parameter 'index')", line); L.splice(i, 1); return; }
          case "RemoveAll": { const before = L.length; o.items = L.filter((x) => !callFn(a[0], [x], line)); return before - o.items.length; }
          case "Insert": { const i = nv(a[0]); if (i < 0 || i > L.length) throw exc("ArgumentOutOfRangeException", "Index must be within the bounds of the List. (Parameter 'index')", line); L.splice(i, 0, a[1]); return; }
          case "IndexOf": return L.findIndex((x) => equals(x, a[0]));
          case "Contains": return L.some((x) => equals(x, a[0]));
          case "Sort": sortList(o, a[0], line); return;
          case "Reverse": if (!a.length) { L.reverse(); return; } break;
          case "Find": { const r = L.find((x) => callFn(a[0], [x], line)); return r === undefined ? defaultOf({ name: (o.tname || "").replace("System.Int32", "int") }) : r; }
          case "FindAll": return new CsList(L.filter((x) => callFn(a[0], [x], line)), o.tname);
          case "FindIndex": return L.findIndex((x) => callFn(a[0], [x], line));
          case "Exists": return L.some((x) => callFn(a[0], [x], line));
          case "TrueForAll": return L.every((x) => callFn(a[0], [x], line));
          case "ForEach": L.forEach((x) => callFn(a[0], [x], line)); return;
          case "GetRange": return new CsList(L.slice(nv(a[0]), nv(a[0]) + nv(a[1])), o.tname);
          case "ToString": return str(o);
          case "CopyTo": throw unsupported("CopyTo", line);
        }
        const r = linq(L, n, a, line, o); if (r !== NOPE) return r;
      }
      if (o instanceof CsDict) {
        switch (n) {
          case "Add": { const k = keyOf(a[0]); if (o.map.has(k)) throw exc("ArgumentException", "An item with the same key has already been added. Key: " + str(a[0]), line); o.map.set(k, [a[0], a[1]]); return; }
          case "TryAdd": { const k = keyOf(a[0]); if (o.map.has(k)) return false; o.map.set(k, [a[0], a[1]]); return true; }
          case "ContainsKey": return o.map.has(keyOf(a[0]));
          case "ContainsValue": return [...o.map.values()].some((e) => equals(e[1], a[0]));
          case "Remove": return o.map.delete(keyOf(a[0]));
          case "Clear": o.map.clear(); return;
          case "TryGetValue": { const k = keyOf(a[0]); if (o.map.has(k)) { a[1].set(o.map.get(k)[1]); return true; } a[1].set(defaultOf({ name: o.tv === "System.Int32" ? "int" : o.tv === "System.Double" ? "double" : "x" })); return false; }
          case "GetValueOrDefault": { const k = keyOf(a[0]); return o.map.has(k) ? o.map.get(k)[1] : a.length > 1 ? a[1] : defaultOf({ name: o.tv === "System.Int32" ? "int" : "x" }); }
        }
        const r = linq([...o.map.values()].map((e) => new CsKvp(e[0], e[1])), n, a, line, null); if (r !== NOPE) return r;
      }
      if (o instanceof CsSet) {
        switch (n) {
          case "Add": { const k = keyOf(a[0]); if (o.map.has(k)) return false; o.map.set(k, a[0]); return true; }
          case "Contains": return o.map.has(keyOf(a[0])); case "Remove": return o.map.delete(keyOf(a[0])); case "Clear": o.map.clear(); return;
          case "UnionWith": for (const x of enumerate(a[0], line)) o.map.set(keyOf(x), x); return;
          case "IntersectWith": { const other = new Set(enumerate(a[0], line).map(keyOf)); for (const k of [...o.map.keys()]) if (!other.has(k)) o.map.delete(k); return; }
        }
        const r = linq([...o.map.values()], n, a, line, null); if (r !== NOPE) return r;
      }
      if (o instanceof CsQueue) {
        const empty = () => { if (!o.items.length) throw exc("InvalidOperationException", o.stack ? "Stack empty." : "Queue empty.", line); };
        switch (n) {
          case "Enqueue": case "Push": o.items.push(a[0]); return;
          case "Dequeue": empty(); return o.items.shift(); case "Pop": empty(); return o.items.pop();
          case "Peek": empty(); return o.stack ? o.items[o.items.length - 1] : o.items[0];
          case "Contains": return o.items.some((x) => equals(x, a[0])); case "Clear": o.items.length = 0; return;
        }
        const r = linq(enumerate(o, line), n, a, line, null); if (r !== NOPE) return r;
      }
      if (o instanceof CsGroup) { const r = linq(o.items, n, a, line, null); if (r !== NOPE) return r; }
      if (o instanceof CsSB) {
        switch (n) { case "Append": o.s += str(a[0]); return o; case "AppendLine": o.s += (a.length ? str(a[0]) : "") + "\n"; return o; case "ToString": return o.s; case "Clear": o.s = ""; return o; case "Insert": o.s = o.s.slice(0, nv(a[0])) + str(a[1]) + o.s.slice(nv(a[0])); return o; }
      }
      if (o instanceof CsRandom) {
        if (n === "Next") { const r = o.next(); if (a.length === 0) return Math.floor(r * 2147483647); if (a.length === 1) return Math.floor(r * nv(a[0])); return nv(a[0]) + Math.floor(r * (nv(a[1]) - nv(a[0]))); }
        if (n === "NextDouble") return new D(o.next());
      }
      if (o instanceof CsTuple && n === "ToString") return str(o);
      if (o instanceof CsKvp && n === "ToString") return str(o);
      return NOPE;
    }
    function trimChars(s, a, mode) {
      const set = new Set(a.flatMap((x) => x instanceof CsList ? x.items.map(str) : [str(x)]));
      let i = 0, j = s.length;
      if (mode & 1) while (i < j && set.has(s[i])) i++;
      if (mode & 2) while (j > i && set.has(s[j - 1])) j--;
      return s.slice(i, j);
    }

    // ───── program entry points ─────
    this.load = function (units) {
      defineBuiltinExceptions();
      for (const u of units) register(u);
      // classes whose base is unknown
      for (const c of classes.values()) if (c.base && !classes.has(c.base)) {
        if (/^I[A-Z]/.test(c.base)) { c.ifaces.push(c.base); c.base = null; }
        else throw new CsError("CS0246", "The type or namespace name '" + c.base + "' could not be found", c.decl ? c.decl.line : 0, "compile", c.file);
      }
      // interfaces/abstract: concrete classes must implement abstract members
      for (const c of classes.values()) {
        if (c.builtin || c.isAbstract || c.isInterface) continue;
        const need = [];
        for (const k of chain(c)) for (const iname of k.ifaces) { const ic = classes.get(iname); if (ic) for (const [mn] of ic.methods) need.push([iname, mn]); }
        for (const k of chain(c).slice(1)) if (k.isAbstract) for (const [mn, ms] of k.methods) if (ms.some((m) => m.abstract)) need.push([k.name, mn]);
        for (const [iname, mn] of need) { const ok = chain(c).some((k) => !k.isInterface && k.methods.has(mn) && k.methods.get(mn).some((m) => !m.abstract)); if (!ok) throw new CsError("CS0535", "'" + c.name + "' does not implement member '" + iname + "." + mn + "()'", c.decl.line, "compile", c.file); }
      }
      initStatics();
    };
    this.runMain = function (units) {
      const top = units.flatMap((u) => u.top.map((s) => Object.assign(s, { __file: u.file })));
      if (top.length) {
        const progCls = { name: "Program", base: null, ifaces: [], fields: [], props: [], methods: new Map(), ctors: [], statics: new Map() };
        const root = new Env(null); root.isRoot = true;
        const ctx = { self: null, cls: progCls, env: root, isStatic: true, root };
        for (const s of top) if (s.k === "localfn") { const fn = makeLocalFn(s, ctx); root.def(s.name, fn, null); globalFns.set(s.name, fn); }
        for (const s of top) { const r = exec(s, ctx); if (r instanceof Ret) return; }
        return;
      }
      for (const c of classes.values()) {
        if (c.builtin) continue;
        const ms = c.methods.get("Main"); if (ms && ms[0].mods.has("static")) { const m = ms[0]; invoke(m, c, null, m.params.length ? [new CsList([], "System.String", true)] : [], m.line); return; }
      }
      throw new CsError("CS5001", "Program does not contain a static 'Main' method suitable for an entry point", 1, "compile");
    };
    this.callMethod = function (name, args) {
      for (const c of classes.values()) {
        if (c.builtin) continue;
        const m = findMethod(c, name, args.length, args);
        if (m && m.m.mods.has("static")) return invoke(m.m, m.owner, null, args, m.m.line);
      }
      throw new CsError("CS0103", "The method '" + name + "' was not found. Keep the name and parameters from the starter code", 1, "compile");
    };
    this.facts = function () {
      const out = [];
      for (const c of classes.values()) {
        if (c.builtin) continue;
        for (const [mn, ms] of c.methods) for (const m of ms) {
          const fact = m.attrs && m.attrs.find((x) => x.name === "Fact" || x.name === "Theory");
          if (!fact) continue;
          const data = m.attrs.filter((x) => x.name === "InlineData");
          if (data.length) for (const d of data) out.push({ cls: c, m, label: c.name + "." + mn + "(" + d.args.map((x) => show(x.v)).join(", ") + ")", args: d.args.map((x) => evalE(x, { env: new Env(null) })) });
          else out.push({ cls: c, m, label: c.name + "." + mn, args: [] });
        }
      }
      return out;
    };
    this.runFact = function (f) {
      const o = f.m.mods.has("static") ? null : instantiate(f.cls, [], f.m.line, null, null);
      invoke(f.m, f.cls, o, f.args, f.m.line);
    };
  }

  // ───────────────────────── static check (compile-time names) ─────────────────────────
  // Finds CS0103 (unknown names) before anything runs, as a compiler would,
  // including in branches the program never takes.
  function nameCheck(units) {
    const known = new Set(BUILTIN_TYPES); EXC.forEach((x) => known.add(x)); known.add("checked"); known.add("unchecked");
    const members = new Map(); // class -> Set(member names) incl. bases (resolved lazily)
    const types = new Map();
    const allTypes = [];
    for (const u of units) for (const t of u.types) { (function add(t) { allTypes.push(t); types.set(t.name, t); (t.nested || []).forEach(add); })(t); }
    for (const t of allTypes) known.add(t.name);
    function membersOf(t, seen) {
      if (!t) return new Set(); seen = seen || new Set(); if (seen.has(t.name)) return new Set(); seen.add(t.name);
      if (t.k === "enum") return new Set(t.members.map((m) => m.name));
      const s = new Set([...t.fields.map((f) => f.name), ...t.props.map((p) => p.name), ...t.methods.map((m) => m.name)]);
      for (const b of t.bases || []) { const bt = types.get(b); if (bt) membersOf(bt, seen).forEach((x) => s.add(x)); if (EXC.includes(b)) { s.add("Message"); s.add("InnerException"); } }
      return s;
    }
    const errs = [];
    /* a little static typing for the errors unit 1–2 teach: the declared
       type of each local (by name), how deep in loops/switches we are */
    const TY = new Map();
    let loops = 0, switches = 0;
    const NUM = new Set(["int", "long", "double", "decimal", "float", "short", "byte"]);
    function tyOf(e) {
      if (!e) return null;
      if (e.k === "lit") return typeof e.v === "string" ? "string" : typeof e.v === "number" ? "int" : e.v instanceof D ? (e.v.m ? "decimal" : "double") : typeof e.v === "boolean" ? "bool" : e.v instanceof Ch ? "char" : null;
      if (e.k === "name") return TY.get(e.n) || null;
      if (e.k === "interp") return "string";
      if (e.k === "paren") return tyOf(e.e);
      if (e.k === "bin" && ["==", "!=", "<", ">", "<=", ">=", "&&", "||"].includes(e.op)) return "bool";
      return null;
    }
    function walkBlockLike(stmts, scope, mem, file) {
      const sc = new Set(scope);
      for (const s of stmts) if (s.k === "localfn") sc.add(s.name);
      /* definite assignment (CS0165), conservatively: a local declared
         without a value is an error only when a later statement in the
         same block reads it before ANY statement could have assigned it */
      const unset = new Set(), here = new Set();
      for (const s of stmts) {
        if (s.k === "var") for (const d of s.decls) {
          if (here.has(d.name)) errs.push(new CsError("CS0128", "A local variable or function named '" + d.name + "' is already defined in this scope", s.line, "compile", file));
          here.add(d.name);
        }
        if (unset.size) {
          if (s.k === "expr" && s.e && s.e.k === "asg" && s.e.op === "=" && s.e.a.k === "name" && unset.has(s.e.a.n)) {
            readsIn(s.e.b).forEach((r) => { if (unset.has(r.n)) errs.push(new CsError("CS0165", "Use of unassigned local variable '" + r.n + "'", r.line, "compile", file)); unset.delete(r.n); });
            unset.delete(s.e.a.n);
          } else {
            const assigned = assignsIn(s);
            readsIn(s).forEach((r) => { if (unset.has(r.n) && !assigned.has(r.n)) { errs.push(new CsError("CS0165", "Use of unassigned local variable '" + r.n + "'", r.line, "compile", file)); unset.delete(r.n); } });
            assigned.forEach((n) => unset.delete(n));
          }
        }
        stmt(s, sc, mem, file);
        if (s.k === "var") for (const d of s.decls) { if (!d.init && s.type && !s.type.arr) unset.add(d.name); else unset.delete(d.name); }
      }
    }
    /* every name an AST reads (not the left side of a plain =), and every
       name it assigns anywhere inside */
    function readsIn(node) {
      const out = [];
      (function walk(n, target) {
        if (!n || typeof n !== "object") return;
        if (Array.isArray(n)) { n.forEach((x) => walk(x)); return; }
        if (n.k === "name") { if (!target) out.push(n); return; }
        if (n.k === "asg") { walk(n.a, n.op === "="); walk(n.b); return; }
        if (n.k === "outvar") return;
        if (n.k === "localfn" || n.k === "lambda") return;
        for (const key of Object.keys(n)) if (key !== "line" && key !== "k" && n[key] && typeof n[key] === "object") walk(n[key]);
      })(node);
      return out;
    }
    function assignsIn(node) {
      const out = new Set();
      (function walk(n) {
        if (!n || typeof n !== "object") return;
        if (Array.isArray(n)) { n.forEach(walk); return; }
        if (n.k === "asg" && n.a && n.a.k === "name") out.add(n.a.n);
        if ((n.k === "pre" || n.k === "post") && n.a && n.a.k === "name") out.add(n.a.n);
        if (n.k === "ref" && n.e && n.e.k === "name") out.add(n.e.n);
        if (n.k === "outname" || (n.k === "out" && n.e && n.e.k === "name")) out.add((n.e && n.e.n) || n.n);
        for (const key of Object.keys(n)) if (key !== "line" && key !== "k" && n[key] && typeof n[key] === "object") walk(n[key]);
      })(node);
      return out;
    }
    function stmt(s, sc, mem, file) {
      if (!s) return;
      switch (s.k) {
        case "block": walkBlockLike(s.body, sc, mem, file); return;
        case "var": for (const d of s.decls) {
            if (d.init) expr(d.init, sc, mem, file); sc.add(d.name);
            const t = s.type && !s.type.arr && s.type.name !== "var" ? s.type.name : tyOf(d.init);
            if (t) TY.set(d.name, t); else TY.delete(d.name);
            let ie = d.init; while (ie && ie.k === "paren") ie = ie.e;
            if (s.type && s.type.name === "bool" && ie && ie.k === "asg") errs.push(new CsError("CS0029", "Cannot implicitly convert type '" + (tyOf(ie.b) || "int") + "' to 'bool'", s.line, "compile", file));
          }
          if (s.type && ["int", "long", "double", "bool", "char"].includes(s.type.name) && !s.type.arr) for (const d of s.decls) {
            if (d.init && d.init.k === "lit" && typeof d.init.v === "string") errs.push(new CsError("CS0029", "Cannot implicitly convert type 'string' to '" + s.type.name + "'", s.line, "compile", file));
            if (d.init && d.init.k === "call" && d.init.f && d.init.f.k === "mem" && d.init.f.n === "ReadLine" && d.init.f.o && d.init.f.o.n === "Console") errs.push(new CsError("CS0029", "Cannot implicitly convert type 'string' to '" + s.type.name + "'", s.line, "compile", file));
            if (s.type.name === "int" && d.init && d.init.k === "lit" && d.init.v instanceof D) errs.push(new CsError("CS0266", "Cannot implicitly convert type 'double' to 'int'. An explicit conversion exists (are you missing a cast?)", s.line, "compile", file));
          }
          if (s.type && s.type.name === "string" && !s.type.arr) for (const d of s.decls) if (d.init && d.init.k === "lit" && (typeof d.init.v === "number" || d.init.v instanceof D)) errs.push(new CsError("CS0029", "Cannot implicitly convert type '" + (d.init.v instanceof D ? "double" : "int") + "' to 'string'", s.line, "compile", file));
          return;
        case "deconstruct": expr(s.e, sc, mem, file); s.names.forEach((n) => sc.add(n)); return;
        case "localfn": { const inner = new Set(sc); s.params.forEach((p) => inner.add(p.name)); stmt(s.body, inner, mem, file); return; }
        case "expr": expr(s.e, sc, mem, file); return;
        case "if": expr(s.c, sc, mem, file); stmt(s.a, new Set(sc), mem, file); stmt(s.b, new Set(sc), mem, file); return;
        case "while": case "do": expr(s.c, sc, mem, file); loops++; stmt(s.body, new Set(sc), mem, file); loops--; return;
        case "for": { const inner = new Set(sc); s.init.forEach((i) => stmt(i, inner, mem, file)); if (s.c) expr(s.c, inner, mem, file); s.upd.forEach((u) => expr(u, inner, mem, file)); loops++; stmt(s.body, inner, mem, file); loops--; return; }
        case "foreach": { expr(s.e, sc, mem, file); const inner = new Set(sc); if (s.names) s.names.forEach((n) => inner.add(n)); else inner.add(s.name);
          if (!s.names) { const ro = s.name; (function walkAsg(n) { if (!n || typeof n !== "object") return; if (Array.isArray(n)) { n.forEach(walkAsg); return; }
            if ((n.k === "asg" && n.a && n.a.k === "name" && n.a.n === ro) || ((n.k === "pre" || n.k === "post") && n.a && n.a.k === "name" && n.a.n === ro)) errs.push(new CsError("CS1656", "Cannot assign to '" + ro + "' because it is a 'foreach iteration variable'", n.line || s.line, "compile", file));
            if (n.k === "foreach" && n.name === ro) return;
            for (const key of Object.keys(n)) if (key !== "line" && n[key] && typeof n[key] === "object") walkAsg(n[key]); })(s.body); }
          if (s.type && s.type.name && s.type.name !== "var" && !s.names) TY.set(s.name, s.type.name);
          loops++; stmt(s.body, inner, mem, file); loops--; return; }
        case "break": if (!loops && !switches) errs.push(new CsError("CS0139", "No enclosing loop out of which to break or continue", s.line, "compile", file)); return;
        case "continue": if (!loops) errs.push(new CsError("CS0139", "No enclosing loop out of which to break or continue", s.line, "compile", file)); return;
        case "switch": expr(s.e, sc, mem, file);
          /* every non-empty section must end by leaving the switch (CS0163) */
          s.sections.forEach((sec, i) => {
            const last = sec.body[sec.body.length - 1];
            const ends = (st) => st && (["break", "return", "throw", "continue", "goto"].includes(st.k) || (st.k === "block" && ends(st.body[st.body.length - 1])));
            if (sec.body.length && !ends(last)) errs.push(new CsError("CS0163", "Control cannot fall through from one case label ('" + (sec.labels[0] && sec.labels[0].e && sec.labels[0].e.v != null ? "case " + sec.labels[0].e.v + ":" : "default:") + "') to another", (sec.line || s.line), "compile", file));
          });
          switches++;
          for (const sec of s.sections) { const inner = new Set(sc); for (const l of sec.labels) { if (l.bind) inner.add(l.bind); } walkBlockLike(sec.body, inner, mem, file); }
          switches--; return;
        case "return": case "throw": if (s.e) expr(s.e, sc, mem, file); return;
        case "try": stmt(s.body, sc, mem, file); for (const c of s.catches) { const inner = new Set(sc); if (c.name) inner.add(c.name); stmt(c.body, inner, mem, file); } stmt(s.fin, sc, mem, file); return;
      }
    }
    function expr(e, sc, mem, file) {
      if (!e || typeof e !== "object") return;
      switch (e.k) {
        case "name": if (!sc.has(e.n) && !mem.has(e.n) && !known.has(e.n)) errs.push(new CsError("CS0103", "The name '" + e.n + "' does not exist in the current context", e.line, "compile", file)); return;
        case "mem": expr(e.o, sc, mem, file); return;
        case "call": expr(e.f, sc, mem, file); e.args.forEach((a) => { if (a.k === "outvar") sc.add(a.name); else expr(a.k === "ref" ? a.e : a, sc, mem, file); }); return;
        case "lambda": { const inner = new Set(sc); e.params.forEach((p) => inner.add(typeof p === "string" ? p : p.name)); if (e.e) expr(e.e, inner, mem, file); else stmt(e.body, inner, mem, file); return; }
        case "is": expr(e.e, sc, mem, file); if (e.pat.bind) sc.add(e.pat.bind); if (e.pat.e) expr(e.pat.e, sc, mem, file); return;
        case "interp": e.parts.forEach((p) => typeof p !== "string" && expr(p.e, sc, mem, file)); return;
        case "new": e.args.forEach((a) => expr(a, sc, mem, file)); if (e.init) e.init.items.forEach((it) => { if (it.e) expr(it.e, sc, mem, file); if (it.add) expr(it.add, sc, mem, file); if (it.pair) it.pair.forEach((x) => expr(x, sc, mem, file)); if (it.key) expr(it.key, sc, mem, file); }); return;
        case "swexpr": expr(e.e, sc, mem, file); e.arms.forEach((a) => { const inner = new Set(sc); if (a.pat.bind) inner.add(a.pat.bind); if (a.pat.e) expr(a.pat.e, inner, mem, file); expr(a.e, inner, mem, file); }); return;
        case "cond": {
          expr(e.c, sc, mem, file); expr(e.a, sc, mem, file); expr(e.b, sc, mem, file);
          const ta = tyOf(e.a), tb = tyOf(e.b);
          if (ta && tb && ta !== tb && !(NUM.has(ta) && NUM.has(tb)) && !(ta === "char" && NUM.has(tb)) && !(tb === "char" && NUM.has(ta)))
            errs.push(new CsError("CS0173", "Type of conditional expression cannot be determined because there is no implicit conversion between '" + ta + "' and '" + tb + "'", e.line, "compile", file));
          return;
        }
        default:
          if (e.k === "bin" && ["==", "!=", "<", ">", "<=", ">="].includes(e.op)) {
            const ta = tyOf(e.a), tb = tyOf(e.b);
            const bad = ta && tb && ta !== tb && (ta === "string" || tb === "string" || ta === "bool" || tb === "bool") && !(e.op === "==" || e.op === "!=" ? false : false);
            if (bad || (["<", ">", "<=", ">="].includes(e.op) && (ta === "bool" || tb === "bool" || ta === "string" && tb === "string")))
              errs.push(new CsError("CS0019", "Operator '" + e.op + "' cannot be applied to operands of type '" + (ta || "?") + "' and '" + (tb || "?") + "'", e.line, "compile", file));
          }
          /* constant int arithmetic the compiler can see overflowing (CS0220) */
          if (e.k === "bin" && ["+", "-", "*"].includes(e.op)) {
            const cv = (x) => x && x.k === "lit" && typeof x.v === "number" && !x.lng ? x.v : x && x.k === "mem" && x.o && x.o.k === "name" && x.o.n === "int" ? (x.n === "MaxValue" ? 2147483647 : x.n === "MinValue" ? -2147483648 : null) : null;
            const l = cv(e.a), r = cv(e.b);
            if (l !== null && r !== null) { const v = e.op === "+" ? l + r : e.op === "-" ? l - r : l * r; if (v > 2147483647 || v < -2147483648) errs.push(new CsError("CS0220", "The operation overflows at compile time in checked mode", e.line, "compile", file)); }
          }
          for (const k of ["a", "b", "c", "e", "o", "i", "size"]) if (e[k] && typeof e[k] === "object" && e[k].k) expr(e[k], sc, mem, file);
          if (e.items) e.items.forEach((x) => expr(x, sc, mem, file));
      }
    }
    for (const u of units) {
      const topScope = new Set();
      for (const s of u.top) if (s.k === "localfn") topScope.add(s.name);
      const globalTop = new Set(topScope);
      walkBlockLike(u.top, globalTop, new Set(), u.file);
      (function visit(types) {
        for (const t of types) {
          if (t.k === "enum") continue;
          const mem = membersOf(t);
          (t.nested || []).forEach((n) => mem.add(n.name));
          for (const f of t.fields) if (f.init) expr(f.init, new Set(), mem, u.file);
          for (const m of t.methods) if (m.body) { const sc = new Set(m.params.map((p) => p.name)); stmt(m.body, sc, mem, u.file); }
          for (const c of t.ctors) { const sc = new Set(c.params.map((p) => p.name)); if (c.init) c.init.args.forEach((a) => expr(a, sc, mem, u.file)); stmt(c.body, sc, mem, u.file); }
          for (const p of t.props) { if (p.get) stmt(p.get, new Set(), mem, u.file); if (p.set) stmt(p.set, new Set(["value"]), mem, u.file); if (p.init) expr(p.init, new Set(), mem, u.file); }
          visit(t.nested || []);
        }
      })(u.types);
    }
    return errs;
  }

  // Which C# constructs a program uses (to check a task's `requires` honestly)
  function constructs(units) {
    const found = new Set();
    const walk = (x) => {
      if (!x || typeof x !== "object") return;
      if (Array.isArray(x)) { x.forEach(walk); return; }
      if (x.k) {
        const map = { if: "if", while: "while", do: "do-while", for: "for", foreach: "foreach", switch: "switch", try: "try-catch", throw: "throw", lambda: "lambda", swexpr: "switch-expression", tuple: "tuple", deconstruct: "tuple", interp: "interpolation", is: "pattern", cast: "cast", localfn: "local-function", cond: "ternary" };
        if (map[x.k]) found.add(map[x.k]);
        if (x.k === "new" && x.type) { const n = x.type.name; if (/List/.test(n)) found.add("List"); else if (/Dictionary/.test(n)) found.add("Dictionary"); else if (/HashSet/.test(n)) found.add("HashSet"); else if (/StringBuilder/.test(n)) found.add("StringBuilder"); else if (/Queue|Stack/.test(n)) found.add(n); else found.add("new-object"); }
        if (x.k === "newarr" || (x.k === "coll")) found.add("array");
        if (x.k === "call" && x.f && x.f.k === "mem" && ["Where", "Select", "OrderBy", "OrderByDescending", "GroupBy", "Sum", "Any", "All", "First", "ToList", "Count", "Max", "Min", "Average", "Distinct"].includes(x.f.n) && x.args.some((a) => a.k === "lambda")) found.add("LINQ");
        if (x.k === "call" && x.f && x.f.k === "mem" && x.f.n === "ReadLine") found.add("ReadLine");
      }
      for (const k in x) if (k !== "line" && x[k] && typeof x[k] === "object") walk(x[k]);
    };
    for (const u of units) {
      walk(u.top);
      for (const t of u.types) {
        if (t.k === "enum") { found.add("enum"); continue; }
        if (t.k === "interface") found.add("interface");
        else found.add("class");
        if (t.bases && t.bases.length) found.add("inheritance");
        if (t.props && t.props.length) found.add("property");
        if (t.methods.some((m) => m.mods.has("static"))) found.add("static-method");
        if (t.methods.some((m) => m.mods.has("override") || m.mods.has("virtual"))) found.add("polymorphism");
        walk(t.methods); walk(t.ctors); walk(t.props); walk(t.fields);
      }
    }
    return [...found].sort();
  }

  // ───────────────────────── public API ─────────────────────────
  function compile(files) {
    const units = files.map((f) => parseUnit(f.src, f.name));
    const errs = nameCheck(units);
    if (errs.length) throw errs[0];
    return units;
  }
  function packError(e, it) {
    if (e instanceof CsError) return { code: e.code, kind: e.kind, msg: e.message, line: e.line, file: e.file || (it && it.file) || "" };
    if (e instanceof Thrown) { const name = e.obj.cls.name; const builtinBase = (() => { let c = e.obj.cls; return c; })(); return { code: name, kind: "exception", msg: e.obj.f.get("Message"), line: e.line || 0, type: name }; }
    if (e instanceof Budget) {
      if (e.kind === "timeout") return { code: "TIMEOUT", kind: "timeout", msg: "Your program ran for more than " + (it ? it.steps().toLocaleString("en-GB") : "") + " steps without finishing.", line: 0 };
      if (e.kind === "stack") return { code: "StackOverflow", kind: "exception", msg: "Stack overflow: a method called itself too deeply.", line: 0, type: "StackOverflowException" };
      return { code: "OUTPUT", kind: "timeout", msg: "Your program printed more than 100,000 characters.", line: 0 };
    }
    if (e instanceof RangeError) return { code: "StackOverflow", kind: "exception", msg: "Stack overflow: a method called itself too deeply.", line: 0, type: "StackOverflowException" };
    return { code: "INTERNAL", kind: "internal", msg: String(e && e.message || e), line: 0 };
  }
  // run({files:[{name,src}], stdin, mode:"program"|"method"|"tests", call:{name,args}, budget})
  function run(req) {
    const t0 = Date.now();
    let it = null;
    try {
      const units = compile(req.files);
      it = new Interp({ stdin: req.stdin, budget: req.budget, ms: req.ms });
      CUR = it;
      it.load(units);
      if (req.mode === "method") {
        const args = (req.call.args || []).map(toCs);
        const v = it.callMethod(req.call.name, args);
        return { ok: true, stdout: it.out(), value: show(v), steps: it.steps(), ms: Date.now() - t0, constructs: constructs(units) };
      }
      if (req.mode === "tests") {
        const facts = it.facts(); const results = [];
        for (const f of facts) {
          try { it.runFact(f); results.push({ name: f.label, ok: true }); }
          catch (e) { results.push({ name: f.label, ok: false, error: packError(e, it) }); if (e instanceof CsError && e.kind === "compile") throw e; }
        }
        return { ok: true, tests: results, stdout: it.out(), steps: it.steps(), ms: Date.now() - t0 };
      }
      it.runMain(units);
      return { ok: true, stdout: it.out(), steps: it.steps(), ms: Date.now() - t0, constructs: constructs(units) };
    } catch (e) {
      return { ok: false, stdout: it ? it.out() : "", error: packError(e, it), steps: it ? it.steps() : 0, ms: Date.now() - t0 };
    } finally { CUR = null; CHECKED = 0; }
  }
  function toCs(v) {
    if (Array.isArray(v)) return new CsList(v.map(toCs), typeof v[0] === "string" ? "System.String" : "System.Int32", true);
    if (v && typeof v === "object" && "d" in v) return new D(v.d);
    if (v && typeof v === "object" && "ch" in v) return new Ch(v.ch);
    if (v && typeof v === "object" && "list" in v) return new CsList(v.list.map(toCs), "System.Int32", false);
    return v;
  }

  const api = { run, lex, parseUnit, CsError, version: "csi-1.0" };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.CSI = api;
  // Worker protocol: postMessage({id, req}) → {id, res}
  if (typeof WorkerGlobalScope !== "undefined" && typeof self !== "undefined" && self instanceof WorkerGlobalScope) {
    self.fetch = undefined; self.XMLHttpRequest = undefined; self.importScripts = undefined; self.WebSocket = undefined; // no network for learner code
    self.onmessage = (ev) => { const { id, req } = ev.data; self.postMessage({ id, res: run(req) }); };
  }
})(typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : globalThis);
