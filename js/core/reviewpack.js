/* Kurenai OS — core/reviewpack.js · KOS.reviewPack
   Feedback on an attempt from a model YOU choose (docs/exams-rework-plan.md
   §8.3–8.5, decisions D2 and D6). The app never asks a model itself.

   build(input) → ONE text for the clipboard: strict XML-tagged sections
   (instructions, the attempt, the paper part by part with its scheme,
   your marking and timing, the error types and the answer format). Every
   field the model must echo back (the attempt's uid, a part's id) is an
   attribute, so Claude and Gemini copy it exactly.

   parse(reply, rec) → {ok, data, errors, warnings}: the model's whole
   reply pasted back. It reads ONE fenced JSON block (or, without a fence,
   the JSON object that carries "kos"), forgives the usual noise — prose
   before and after, a ```JSON / ```jsonc fence, smart quotes used as
   quotes, trailing commas, // comments, a BOM — and validates every field
   against the attempt: an unknown part is an error, nothing is stored on
   an error, and text is capped.

   plan(items) lays the written parts out on A4 pages (pure); pagesPDF
   (in the page, with pdf-lib) draws them so a whole paper is ONE PDF of
   whole pages, each headed with the parts it holds — never a crop a part.
   Pure apart from pagesPDF; also in Node.                               */
(function () {
  "use strict";
  var root = typeof window !== "undefined" ? window : globalThis;
  root.KOS = root.KOS || {};
  var VERSION = "exam-feedback/1";
  var TYPES = ["knowledge", "method", "technique", "command_word", "timing", "presentation", "misread"];
  var KINDS = ["technique", "topic", "timing", "practice"];

  function x(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function attr(s) { return x(s).replace(/"/g, "&quot;"); }
  function secs(ms) { return ms == null ? "" : String(Math.round(ms / 1000)); }

  var SCHEMA = [
    "```json",
    "{",
    '  "kos": "' + VERSION + '",',
    '  "attempt": "<the uid attribute of <attempt>>",',
    '  "model": "<your model name>",',
    '  "summary": "<two or three sentences>",',
    '  "remark": [{ "part": "<part id>", "was": 2, "should": 1, "why": "<reason>" }],',
    '  "findings": [{ "parts": ["<part id>"], "error_type": "<one of <error_types>>", "what": "<the problem>", "evidence": "<from the answer or the timing>", "lost": 1 }],',
    '  "actions": [{ "text": "<one thing to practise>", "kind": "technique|topic|timing|practice", "topic": "<optional topic id>", "measure": "<optional: what a later attempt should show>" }]',
    "}",
    "```"].join("\n");

  /* input: {rec (a KOS.attempts record), figures (KOS.attempts.figures),
     parts: [{id, question, scheme (string or [lines]), levels, typed,
     points: [{code, text, ticked}]}], context, student, date} */
  function build(input) {
    var rec = input.rec || {}, fig = input.figures || { parts: [] }, extra = {};
    (input.parts || []).forEach(function (p) { extra[p.id] = p; });
    var figBy = {};
    (fig.parts || []).forEach(function (p) { figBy[p.id] = p; });
    var got = fig.got != null ? fig.got : null, max = fig.maxMarks || (rec.parts || []).reduce(function (s, p) { return s + (p.marks || 0); }, 0);
    var L = [];
    L.push("<instructions>");
    L.push("You are reviewing one exam attempt by a sixth-form student so they can improve before their next paper.");
    L.push("Judge ONLY against the <scheme> and <levels> given here; refer to parts by their id attribute; never invent a mark scheme or a board rule.");
    L.push("The handwritten answers are attached as files; each page's header names the parts on it. Typed answers are in <typed_answer>.");
    L.push("Do three things:");
    L.push("1. Diagnose where marks were lost and why, each finding with evidence from the answer or the <timing>.");
    L.push("2. Check the marking: flag a mark that looks too generous or too strict against the scheme (in \"remark\").");
    L.push("3. Prescribe at most 6 actions, most valuable first, each specific enough to practise this week.");
    L.push("Reply with your readable review inside <review>…</review>, then ONE fenced ```json block exactly as in <answer_format>. Nothing after it.");
    L.push("</instructions>");
    L.push("<attempt uid=\"" + attr(rec.uid) + "\" board=\"" + attr(rec.board) + "\" paper=\"" + attr(rec.title || rec.paper) + "\" sat=\"" +
      attr(input.date || (rec.started ? new Date(rec.started).toISOString().slice(0, 10) : "")) + "\" kind=\"" + attr(rec.kind) +
      "\" time_used_min=\"" + (fig.activeMs != null ? Math.round(fig.activeMs / 60000) : "") + "\" time_allowed_min=\"" +
      (rec.allowedMs != null ? Math.round(rec.allowedMs / 60000) : "") + "\" marks=\"" + (got != null ? got : "") + "/" + max +
      "\" budget_min_per_mark=\"" + (rec.budget || "") + "\" pauses=\"" + (fig.pauses || 0) + "\" marked_by=\"" + attr(rec.by || "") + "\"/>");
    if (input.student) L.push("<student>" + x(input.student) + "</student>");
    L.push("<paper>");
    if (input.context) L.push("  <context>" + x(input.context) + "</context>");
    (rec.parts || []).forEach(function (p) {
      var e = extra[p.id] || {}, f = figBy[p.id] || {};
      L.push("  <part id=\"" + attr(p.id) + "\" marks=\"" + p.marks + "\"" + (p.topic ? " topic=\"" + attr(p.topic) + "\"" : "") +
        (p.command ? " command=\"" + attr(p.command) + "\"" : "") + ">");
      if (e.question) L.push("    <question>" + x(e.question) + "</question>");
      if (e.scheme) L.push("    <scheme>" + x(Array.isArray(e.scheme) ? e.scheme.join("\n") : e.scheme) + "</scheme>");
      if (e.levels) L.push("    <levels>" + x(Array.isArray(e.levels) ? e.levels.join("\n") : e.levels) + "</levels>");
      if (e.typed) L.push("    <typed_answer>" + x(e.typed) + "</typed_answer>");
      var pts = e.points || [];
      L.push("    <marking marked_by=\"" + attr(rec.by || "") + "\" got=\"" + (f.got != null ? f.got : "") + "\">" +
        (pts.length ? "" : "</marking>"));
      if (pts.length) {
        pts.forEach(function (q) { L.push("      <point code=\"" + attr(q.code || "") + "\" ticked=\"" + (q.ticked ? "yes" : "no") + "\">" + x(q.text) + "</point>"); });
        L.push("    </marking>");
      }
      L.push("    <timing time_s=\"" + secs(f.timeMs) + "\" first_mark_s=\"" + secs(f.firstMarkMs) + "\" writing_s=\"" + secs(f.writeMs) +
        "\" idle_gaps=\"" + (f.idleGaps || 0) + "\" idle_s=\"" + secs(f.idleMs) + "\" erasures=\"" + ((f.erasures || 0) + (f.undos || 0)) +
        "\" returns=\"" + (f.returns || 0) + "\" min_per_mark=\"" + (f.minPerMark != null ? f.minPerMark : "") + "\" flagged=\"" + (f.flagged ? "yes" : "no") +
        "\" skipped=\"" + (f.skipped ? "yes" : "no") + "\"/>");
      L.push("  </part>");
    });
    L.push("</paper>");
    if (fig.pace && fig.pace.length) L.push("<pacing ideal_min_per_mark=\"" + (rec.budget || "") + "\">" + fig.pace.map(function (q) { return q[0] + "min:" + q[1]; }).join(" ") + "</pacing>");
    L.push("<error_types>" + TYPES.join(" ") + "</error_types>");
    L.push("<answer_format>");
    L.push(SCHEMA);
    L.push("</answer_format>");
    return L.join("\n");
  }

  /* ---------- reading the reply back ---------- */
  function candidates(text) {
    var out = [], m, re = /```[ \t]*([A-Za-z]*)[^\n]*\n([\s\S]*?)```/g;
    while ((m = re.exec(text))) out.push({ src: m[2], lang: m[1].toLowerCase(), fenced: true });
    /* a balanced {...} that mentions "kos" (no fence, or a fence the model broke) */
    for (var i = text.indexOf("{"); i >= 0; i = text.indexOf("{", i + 1)) {
      var depth = 0, inS = false, q = "", j = i;
      for (; j < text.length; j++) {
        var c = text[j];
        if (inS) { if (c === "\\") { j++; continue; } if (c === q) inS = false; continue; }
        if (c === '"') { inS = true; q = c; continue; }
        if (c === "{") depth++;
        else if (c === "}") { depth--; if (!depth) break; }
      }
      if (depth === 0 && j < text.length) {
        var s = text.slice(i, j + 1);
        if (/["“”]kos["“”]\s*:/.test(s)) { out.push({ src: s, lang: "", fenced: false }); i = j; }
      }
    }
    return out;
  }
  function repair(s) {
    var t = s.replace(/^﻿/, "").trim();
    t = t.replace(/^json\s*\n/i, "");
    /* smart quotes used as JSON quotes */
    if (/[“”]/.test(t)) t = t.replace(/[“”]/g, '"');
    if (/[‘’]/.test(t)) t = t.replace(/[‘’]/g, "'");
    /* // comments on their own or after a value, outside strings (rough but safe for this shape) */
    t = t.split("\n").map(function (line) {
      var inS = false;
      for (var i = 0; i < line.length - 1; i++) {
        var c = line[i];
        if (c === "\\") { i++; continue; }
        if (c === '"') inS = !inS;
        if (!inS && c === "/" && line[i + 1] === "/") return line.slice(0, i);
      }
      return line;
    }).join("\n");
    t = t.replace(/,\s*([}\]])/g, "$1");
    return t;
  }
  function tryJSON(src) {
    try { return { v: JSON.parse(src), repaired: false }; } catch (e) { /* repair below */ }
    try { return { v: JSON.parse(repair(src)), repaired: true }; } catch (e2) { return { err: e2.message }; }
  }
  function cap(s, n) { s = s == null ? "" : String(s).trim(); return s.length > n ? s.slice(0, n - 1) + "…" : s; }
  /* "Q3(b)", "3 (b)", "3b", "3.b" → "3(b)"; "6(c)(ii)", "6cii" → "6(c)(ii)" */
  function partKey(s) {
    var t = String(s == null ? "" : s).trim().toLowerCase().replace(/^(q|question)\s*/, "").replace(/[\s.]/g, "");
    var m = /^(\d+)\(?([a-h])?\)?\(?((?:i|ii|iii|iv|v|vi))?\)?$/.exec(t);
    if (!m) return t;
    return m[1] + (m[2] ? "(" + m[2] + ")" : "") + (m[3] ? "(" + m[3] + ")" : "");
  }
  function parse(text, rec) {
    var errors = [], warnings = [];
    text = String(text == null ? "" : text);
    if (!text.trim()) return { ok: false, data: null, errors: ["Nothing was pasted."], warnings: [] };
    var cands = candidates(text), pick = null, parsed = null, lastErr = null;
    /* prefer a fenced json block that carries "kos", then any that parses */
    cands.sort(function (a, b) { return score(b) - score(a); });
    function score(c) { return (/"kos"|“kos”/.test(c.src) ? 4 : 0) + (c.lang === "json" || c.lang === "jsonc" ? 2 : 0) + (c.fenced ? 1 : 0); }
    for (var i = 0; i < cands.length; i++) {
      var r = tryJSON(cands[i].src);
      if (r.v && typeof r.v === "object" && !Array.isArray(r.v)) { pick = cands[i]; parsed = r; break; }
      lastErr = r.err;
    }
    if (!parsed) return { ok: false, data: null, errors: [cands.length ? "The JSON block could not be read" + (lastErr ? ": " + lastErr : "") + "." : "No JSON block was found in the reply. Paste the whole reply, including the ```json block at its end."], warnings: [] };
    if (parsed.repaired) warnings.push("The JSON needed tidying (quotes, commas or comments) before it could be read.");
    if (!pick.fenced) warnings.push("The JSON had no ```json fence; it was found by its \"kos\" field.");
    var v = parsed.v;
    if (v.kos !== VERSION) {
      if (v.kos == null && (v.findings || v.actions)) warnings.push("The reply has no \"kos\" field; read as " + VERSION + ".");
      else errors.push("This is not " + VERSION + " feedback (\"kos\": " + JSON.stringify(v.kos) + ").");
    }
    var ids = {}, marksOf = {};
    if (rec && Array.isArray(rec.parts)) rec.parts.forEach(function (p) { ids[partKey(p.id)] = p.id; marksOf[p.id] = p.marks; });
    var known = rec && Array.isArray(rec.parts) && rec.parts.length > 0;
    if (rec && rec.uid && v.attempt != null && String(v.attempt).trim() !== rec.uid)
      errors.push("The reply is about attempt " + JSON.stringify(String(v.attempt)) + ", not this one (" + rec.uid + ").");
    if (rec && rec.uid && v.attempt == null) warnings.push("The reply does not name the attempt; it is stored on this one.");
    var unknown = [];
    function mapPart(p) {
      var k = partKey(p);
      if (!known) return String(p);
      if (ids[k]) return ids[k];
      unknown.push(String(p));
      return null;
    }
    var data = { kos: VERSION, attempt: rec && rec.uid ? rec.uid : cap(v.attempt, 40), model: cap(v.model, 60), summary: cap(v.summary, 1200),
      remark: [], findings: [], actions: [] };
    (Array.isArray(v.remark) ? v.remark : []).slice(0, 40).forEach(function (m) {
      if (!m || typeof m !== "object") return;
      var id = mapPart(m.part); if (!id) return;
      var was = +m.was, should = +m.should, max = marksOf[id];
      if (!isFinite(was) || !isFinite(should)) { warnings.push("A re-mark for " + id + " has no numbers; left out."); return; }
      if (max != null && (should < 0 || should > max)) { errors.push("The re-mark for " + id + " (" + should + ") is outside 0–" + max + "."); return; }
      data.remark.push({ part: id, was: was, should: should, why: cap(m.why, 400) });
    });
    (Array.isArray(v.findings) ? v.findings : []).slice(0, 30).forEach(function (f) {
      if (!f || typeof f !== "object") return;
      var parts = (Array.isArray(f.parts) ? f.parts : f.part != null ? [f.part] : []).map(mapPart).filter(Boolean);
      var t = String(f.error_type || f.category || "").toLowerCase().replace(/[\s-]+/g, "_");
      if (TYPES.indexOf(t) < 0) { if (t) warnings.push("Unknown error type \"" + t + "\" read as \"technique\"."); t = "technique"; }
      if (!f.what) return;
      data.findings.push({ parts: parts, error_type: t, what: cap(f.what, 300), evidence: cap(f.evidence, 600),
        lost: isFinite(+f.lost) ? Math.max(0, +f.lost) : null });
    });
    var acts = Array.isArray(v.actions) ? v.actions : [];
    if (acts.length > 6) warnings.push(acts.length + " actions were given; the first 6 are kept.");
    acts.slice(0, 6).forEach(function (a) {
      if (!a || typeof a !== "object" || !a.text) return;
      var k = String(a.kind || "").toLowerCase();
      data.actions.push({ text: cap(a.text, 300), kind: KINDS.indexOf(k) >= 0 ? k : "practice", topic: cap(a.topic, 60), measure: cap(a.measure, 200) });
    });
    if (unknown.length) errors.push("These parts are not in this attempt: " + unknown.filter(function (u, i) { return unknown.indexOf(u) === i; }).join(", ") + ".");
    if (!data.findings.length && !data.actions.length && !data.summary) errors.push("The JSON holds no summary, findings or actions.");
    return { ok: errors.length === 0, data: errors.length ? null : data, errors: errors, warnings: warnings };
  }

  /* ---------- the written pages, laid out on A4 (pure) ----------
     items: [{part, label, h}] in paper order, h in page units (a page is
     1000 wide); an answer taller than what is left starts a new page, and
     one taller than a page is cut across pages. → [[{part, label, y, h,
     from}]] where `from` is where in the answer this slice starts. */
  var PAGE_H = 1414, HEAD = 46, GAP = 18, TOP = 70, BOTTOM = 40;
  function plan(items) {
    var pages = [], cur = [], y = TOP;
    function flush() { if (cur.length) pages.push(cur); cur = []; y = TOP; }
    (items || []).forEach(function (it) {
      var h = Math.max(0, +it.h || 0), from = 0;
      if (!h) return;
      while (from < h) {
        var room = PAGE_H - BOTTOM - y - HEAD;
        if (room < 120 && cur.length) { flush(); continue; }
        var take = Math.min(h - from, room);
        if (take < h - from && h - from <= PAGE_H - BOTTOM - TOP - HEAD && cur.length) { flush(); continue; }
        cur.push({ part: it.part, label: it.label + (from ? " (cont.)" : ""), y: y, h: take, from: from });
        y += HEAD + take + GAP;
        from += take;
        if (from < h) flush();
      }
    });
    flush();
    return pages;
  }
  /* In the page: draw the planned A4 pages and make ONE PDF (pdf-lib).
     pads: [{part, label, pages: [ink page records]}] in paper order. */
  function pagesPDF(pads, title) {
    var K = root.KOS, I = K.ink, X = K.inkExport;
    var items = [], canvases = [];
    var chain = Promise.resolve();
    pads.forEach(function (pad) {
      (pad.pages || []).filter(function (p) { return (p.items || []).length; }).forEach(function (pg, i) {
        chain = chain.then(function () {
          return new Promise(function (res) { X.pageCanvas(pg, { px: 1000 }, res); }).then(function (c) {
            canvases.push(c);
            items.push({ part: pad.part, label: pad.label + ((pad.pages || []).length > 1 ? " · page " + (i + 1) : ""), h: I.pageH(pg), ci: canvases.length - 1 });
          });
        });
      });
    });
    return chain.then(function () {
      var layout = plan(items);
      return X.pdfLib().then(function (L) {
        return L.PDFDocument.create().then(function (doc) {
          var c2 = Promise.resolve();
          layout.forEach(function (slices, pi) {
            c2 = c2.then(function () {
              var cv = document.createElement("canvas");
              cv.width = 1240; cv.height = Math.round(1240 * PAGE_H / 1000);
              var g = cv.getContext("2d"), k = 1240 / 1000;
              g.fillStyle = "#fff"; g.fillRect(0, 0, cv.width, cv.height);
              g.fillStyle = "#222"; g.font = (22 * k) + "px sans-serif";
              var heads = slices.map(function (s) { return s.label; });
              g.fillText((title ? title + " · " : "") + "parts " + heads.join(", ") + " · page " + (pi + 1) + " of " + layout.length, 40 * k, 40 * k);
              slices.forEach(function (s) {
                var it = items.filter(function (q) { return q.part === s.part; })[0];
                var src = canvases[items.indexOf(it)];
                g.fillStyle = "#000"; g.font = "bold " + (24 * k) + "px sans-serif";
                g.fillText(s.label, 40 * k, (s.y + 32) * k);
                var sk = src.width / 1000;
                g.drawImage(src, 0, s.from * sk, src.width, s.h * sk, 0, (s.y + HEAD) * k, 1000 * k, s.h * k);
                g.strokeStyle = "#bbb"; g.strokeRect(20 * k, (s.y + HEAD) * k, 960 * k, s.h * k);
              });
              return X.canvasBlob(cv, "image/jpeg").then(function (b) { return b.arrayBuffer(); }).then(function (buf) { return doc.embedJpg(buf); })
                .then(function (img) { var pg = doc.addPage([595.28, 595.28 * PAGE_H / 1000]); pg.drawImage(img, { x: 0, y: 0, width: 595.28, height: 595.28 * PAGE_H / 1000 }); });
            });
          });
          return c2.then(function () { return doc.save(); }).then(function (bytes) { return new Blob([bytes], { type: "application/pdf" }); });
        });
      });
    });
  }

  root.KOS.reviewPack = { VERSION: VERSION, TYPES: TYPES, SCHEMA: SCHEMA, build: build, parse: parse, partKey: partKey, plan: plan, pagesPDF: pagesPDF };
})();
