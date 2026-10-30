/* Kurenai OS — core/inkpad.js · KOS.inkPad, KOS.inkAI
   The answer pad (roadmap 6.3, design 30f) and Kurenai reading handwriting
   when asked (30g, 30k, 30m).

   A PAD is one small ink surface under a question, a card or a drill: a
   lined strip for a short answer (up to 3 marks), an answer-booklet page
   for a long one, either growing when you write near its edge. Every pad
   is its own doc, `answer:<pad>:<q>` (or the caller's prefix), made by
   its first stroke and never before; its `item` names what it answered,
   so a later visit lists "Earlier answers" — viewable, never shown again
   on their own. A fresh revision always starts on a blank pad: earlier
   working is a link, never the page you start on (asked for 26 October
   2026: no copying your own working into an answer).

   KOS.inkAI is the one way Kurenai reads ink (invariant 135, decision E):
   only with "Kurenai reads handwriting when asked" on (Pen and ink, per
   device), only from a press, after a "What is sent" dialog that prints
   exactly the picture and the words one request carries (Cancel first,
   Send not the Enter default), one metered request routed to Gemini, and
   a reply that only SUGGESTS: it writes nothing, rates nothing and logs
   nothing; every suggestion waits for your confirm. Writing pays nothing
   (invariant 134); the attempt it belongs to is what is recorded.       */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var I = KOS.ink;
  function el() { return KOS.ui.el.apply(null, arguments); }
  function announce(t) { if (KOS.a11y && KOS.a11y.announce) KOS.a11y.announce(t); }

  var STRIP_H = 320, STRIP_TOOLS = ["pen", "hl", "eraser"], PAGE_TOOLS = ["pen", "hl", "eraser", "lasso", "shape", "ruler", "text"];

  /* ---------- earlier answers: listed, viewed, never reopened ---------- */
  function earlier(item, except) {
    return I.allDocs().filter(function (d) { return d.item === item && d.key !== except && (d.pages || []).some(function (id) { return (d.inked || {})[id]; }); })
      .sort(function (a, b) { return (b.at || 0) - (a.at || 0); });
  }
  function when(ts) {
    if (!ts) return "";
    var d = new Date(ts);
    return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }) + " · " + String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
  }
  /* a doc's pages, read-only, in a dialog */
  function viewDoc(key, title) {
    var dk = KOS.inkUI.desk();
    KOS.inkUI.dialog({ title: title || "Your working", className: "k-ink-viewdlg", wide: true, onClose: function () { dk.destroy(); }, render: function (body) {
      var list = el("div", { class: "k-ink-viewlist", "data-ui": "ink.view-doc" });
      body.appendChild(list);
      I.listPages(key, function (err, pages) {
        if (err || !pages.length) { list.appendChild(el("p", { class: "k-muted", text: "Nothing written." })); return; }
        pages.forEach(function (p) {
          var sheet = el("div", { class: "k-ink-page", "data-paper": p.paper || "lined", role: "img", "aria-label": "Your writing" });
          list.appendChild(sheet);
          KOS.inkUI.surface(sheet, p, dk, { readOnly: true });
        });
      });
    } });
  }
  function earlierLink(item, except, label) {
    var list = earlier(item, except);
    if (!list.length) return null;
    return KOS.ui.menu({ label: (label || "Earlier answers") + " · " + list.length, className: "k-btn--quiet k-btn--sm k-pad-earlier", align: "start",
      items: list.slice(0, 12).map(function (d) {
        return { label: (d.title || "Working") + " · " + when(d.at), onSelect: function () { viewDoc(d.key, (d.title || "Working") + " · " + when(d.at)); } };
      }) });
  }

  /* ---------- the pad ----------
     opts: item (what it answers, for Earlier answers), title, marks (the
     size: ≤ 3 a strip), prefix (doc key prefix, default "answer"), kind
     ("strip" | "page" to force), paper, onInk(fn on the first stroke). */
  function mount(host, opts) {
    opts = opts || {};
    var strip = opts.kind ? opts.kind === "strip" : (opts.marks || 0) <= 3;
    var key = (opts.prefix || "answer") + ":" + I.uid() + ":" + (opts.q || "1");
    /* opts.tools narrows the bar; opts.momentum takes undo away (Creatives' timed drills) */
    var dk = KOS.inkUI.desk({ dprCap: 2, noUndo: !!opts.momentum });
    var box = el("div", { class: "k-pad", "data-ui": "pad", "data-kind": strip ? "strip" : "page" });
    host.appendChild(box);
    /* the paper: the caller's, else the last one picked for this kind of
       pad on this device (state.ui.padPaper), else lined strips and booklet
       pages; Paper on the bar changes it for this pad and the next */
    var ui = KOS.store.state.ui, kindKey = strip ? "strip" : "page";
    var known = I.PAPERS.map(function (x) { return x[0]; });
    var remembered = ui.padPaper && known.indexOf(ui.padPaper[kindKey]) >= 0 ? ui.padPaper[kindKey] : null;
    var paper = opts.paper || remembered || (strip ? "lined" : "booklet");
    var bar = KOS.inkUI.dockable(dk, { tools: opts.tools || (strip ? STRIP_TOOLS : PAGE_TOOLS), image: opts.image != null ? opts.image : !strip, history: !opts.momentum, paper: {
      get: function () { return (page && page.paper) || paper; },
      set: function (pp) {
        if (known.indexOf(pp) < 0) return;
        page.paper = pp; paper = pp;
        sheet.setAttribute("data-paper", pp);
        ui.padPaper = Object.assign({}, ui.padPaper || {}); ui.padPaper[kindKey] = pp;
        KOS.store.save();
        if (page.items.length) I.savePage(page);
        announce((I.PAPERS.filter(function (x) { return x[0] === pp; })[0] || [0, pp])[1] + " paper.");
      } } });
    KOS.ui.state(bar, "pad", true);
    box.appendChild(bar);
    var page = I.blankPage(key, paper, strip ? STRIP_H : I.H);
    var sheet = el("div", { class: "k-ink-page k-pad-sheet", "data-paper": paper, "data-ui": "pad.sheet", role: "img", "aria-label": opts.title ? "Your answer to " + opts.title : "Your answer" });
    box.appendChild(sheet);
    var sf = KOS.inkUI.surface(sheet, page, dk, { grow: { step: strip ? 200 : 400, max: strip ? I.H : I.H * 3 } });
    dk.dropOn(sheet);
    var foot = el("div", { class: "k-pad-foot" });
    box.appendChild(foot);
    var early = opts.item ? earlierLink(opts.item, key) : null;
    if (early) foot.appendChild(early);
    var inked = false, listeners = [];
    dk.onChange(function () {
      if (inked || !page.items.length) return;
      inked = true;
      I.setDocMeta(key, { item: opts.item || null, title: opts.title || null });
      listeners.forEach(function (fn) { try { fn(); } catch (e) { /* one listener */ } });
    });
    var unkey = opts.momentum ? null : KOS.inkUI.shortcuts(dk, box);
    var api = {
      key: key, desk: dk, page: page, node: box,
      hasInk: function () { return page.items.length > 0; },
      onInk: function (fn) { listeners.push(fn); if (inked) fn(); },
      /* mark the doc as part of a logged attempt (30f) */
      logged: function (meta) { if (inked) I.setDocMeta(key, Object.assign({ logged: Date.now() }, meta || {})); },
      /* the pad as a JPEG (base64, no prefix) on white, for Kurenai */
      image: function (cb) {
        sf.flush();
        KOS.inkExport.pageCanvas(page, { px: 1100 }, function (c) {
          var url = c.toDataURL("image/jpeg", 0.85);
          cb(url.slice(url.indexOf(",") + 1), url);
        });
      },
      destroy: function () { if (unkey) unkey(); dk.destroy(); box.remove(); }
    };
    if (opts.onInk) api.onInk(opts.onInk);
    return api;
  }

  /* ---------- the answer modes (30f): Type · Write · On paper ----------
     Per device (state.ui.answerMode). Type keeps the caller's textarea;
     Write mounts a pad; On paper hides both and keeps the tally. */
  var MODES = [["type", "Type"], ["write", "Write"], ["paper", "On paper"]];
  function answer(host, opts) {
    opts = opts || {};
    var ui = KOS.store.state.ui;
    var mode = MODES.some(function (m) { return m[0] === ui.answerMode; }) ? ui.answerMode : "type";
    var wrap = el("div", { class: "k-pad-answer", "data-ui": "pad.answer" });
    host.appendChild(wrap);
    var seg = el("div", { class: "k-pad-modes" });
    wrap.appendChild(seg);
    var slot = el("div", { class: "k-pad-slot" });
    wrap.appendChild(slot);
    var pad = null, listeners = [];
    function paint() {
      seg.innerHTML = "";
      seg.appendChild(KOS.ui.tabs(MODES.map(function (m) {
        return { label: m[1], active: mode === m[0], hook: "pad.mode-" + m[0], onSelect: function () { setMode(m[0]); } };
      }), { variant: "workspace", label: "Answer with", className: "k-pad-seg" }));
      if (opts.textarea) opts.textarea.hidden = mode !== "type";
      if (mode === "write" && !pad) {
        pad = mount(slot, opts);
        pad.onInk(function () { listeners.forEach(function (fn) { fn(); }); });
      }
      if (pad) pad.node.hidden = mode !== "write";
      KOS.ui.state(wrap, "paper", mode === "paper");
    }
    function setMode(m) {
      mode = m; ui.answerMode = m; KOS.store.save(); paint();
      announce(m === "write" ? "Write your answer with the pen." : m === "paper" ? "Answer on paper; tick the marks yourself." : "Type your answer.");
    }
    if (opts.textarea) slot.appendChild(opts.textarea);
    paint();
    return {
      mode: function () { return mode; },
      pad: function () { return mode === "write" ? pad : null; },
      hasInk: function () { return !!(pad && pad.hasInk()); },
      onInk: function (fn) { listeners.push(fn); if (pad && pad.hasInk()) fn(); },
      logged: function (meta) { if (pad) pad.logged(meta); },
      destroy: function () { if (pad) pad.destroy(); wrap.remove(); }
    };
  }

  /* ================= Kurenai reads handwriting, when asked ================= */
  function reads() { return !!(KOS.inkSettings && KOS.inkSettings.readsHandwriting()); }
  function online() { return typeof navigator === "undefined" || navigator.onLine !== false; }
  function ready() { return reads() && KOS.ai && KOS.ai.edgeReady && KOS.ai.edgeReady(); }
  function route() {
    var r = KOS.ai.config && KOS.ai.config().routing && KOS.ai.config().routing.tutor;
    return r && r.provider === "gemini" ? r.model : KOS.ai.DEFAULT_MODEL.gemini;
  }
  /* Kurenai's words carry maths: asked for as $…$, and any LaTeX she still
     leaves bare (\sqrt{18}, a^{1/2}, a^2) is wrapped, so it draws as maths
     beside the scheme instead of as code (27 October 2026) */
  var BARE_TEX = /([0-9.]*\\[a-zA-Z]+(?:\{[^{}]*\})*|[A-Za-z0-9.]*\^\{[^{}]*\}|[A-Za-z0-9.]+\^-?[A-Za-z0-9]+|[A-Za-z]_\{?[A-Za-z0-9]+\}?)/g;
  function mathText(t) {
    t = String(t == null ? "" : t);
    if (t.indexOf("$") >= 0) return t;
    return t.replace(BARE_TEX, function (m) { return "$" + m + "$"; }).replace(/\$\s*\$/g, " ");
  }
  function mathAll(v, key) {
    if (typeof v === "string") return /^(reason|look|why|text)$/.test(key || "") ? mathText(v) : v;
    if (Array.isArray(v)) return v.map(function (x) { return mathAll(x, key); });
    if (v && typeof v === "object") { var o = {}; Object.keys(v).forEach(function (k) { o[k] = mathAll(v[k], k); }); return o; }
    return v;
  }
  function typeset(node) { if (KOS.content && KOS.content.typeset) KOS.content.typeset(node); }

  /* the reply's JSON: bare, in a ``` fence, or with a line of words
     around it (the outermost {…}) */
  function readJson(text) {
    var t = String(text || "").replace(/^\s*```(?:json)?\s*|\s*```\s*$/g, "").trim();
    try { return JSON.parse(t); } catch (e) { /* look inside */ }
    var i = t.indexOf("{"), j = t.lastIndexOf("}");
    if (i < 0 || j <= i) return null;
    try { return JSON.parse(t.slice(i, j + 1)); } catch (e) { return null; }
  }
  /* one request: "What is sent" first, then the reply (parsed JSON).
     o: {title, kicker, imageUrl, image (base64), sections: [{h, lines|text}],
         instruction, notSent, schema, system, onReply(json)} */
  function ask(o) {
    var cancel;
    KOS.inkUI.dialog({ title: o.title || "What is sent", className: "k-pad-sent", wide: true, focus: function () { return cancel; }, render: function (body, close, foot) {
      body.appendChild(el("p", { class: "k-pad-sent-lead", text: "One request to Kurenai carries exactly this, and nothing else. Its reply only suggests; nothing is marked or logged until you confirm." }));
      body.appendChild(el("figure", { class: "k-pad-sent-img" }, [el("img", { src: o.imageUrl, alt: "The picture of your writing that is sent" }), el("figcaption", { text: "The picture of your page" })]));
      (o.sections || []).forEach(function (sx) {
        var sec = el("section", { class: "k-pad-sent-sec" }, [el("h3", { class: "k-kicker", text: sx.h })]);
        /* the list numbers itself: the "1. " the prompt carries is not shown twice */
        if (sx.lines) sec.appendChild(el("ol", { class: "k-pad-sent-list" }, sx.lines.map(function (l) { return el("li", { text: String(l).replace(/^\d+\.\s+/, "") }); })));
        else sec.appendChild(el("p", { text: sx.text }));
        body.appendChild(sec);
      });
      body.appendChild(el("section", { class: "k-pad-sent-sec" }, [el("h3", { class: "k-kicker", text: "Instruction" }), el("p", { class: "k-pad-sent-ins", text: o.instruction })]));
      body.appendChild(el("p", { class: "k-pad-sent-not", text: "Not sent: " + (o.notSent || "your name, your other answers, your notes, your marks so far, and any chat.") }));
      /* the question and its scheme read as maths, as on the page ($…$) */
      if (KOS.content && KOS.content.typeset) KOS.content.typeset(body);
      var status = el("p", { class: "k-pad-sent-status", "aria-live": "polite" });
      body.appendChild(status);
      cancel = el("button", { type: "button", class: "k-btn", "data-ui": "pad.sent-cancel", text: "Cancel", onclick: function () { close(); } });
      var send = el("button", { type: "button", class: "k-btn k-btn--primary", "data-ui": "pad.sent-send", text: "Send", onclick: function () {
        if (!online()) { status.textContent = "This needs a connection."; return; }
        send.disabled = true; status.textContent = "Kurenai is reading your page…";
        KOS.ai.chatWith("gemini", route(), {
          category: "tutor", system: o.system + " Write any maths in your words as LaTeX between $ signs, such as $\\sqrt{18} = 3\\sqrt{2}$.", temperature: 0.1, maxTokens: 2000, noRetry: false,
          /* Gemini's "high demand" spikes outlast one 2 s retry (27 October
             2026): this one deliberate request waits patiently, and says so */
          busyRetries: 3, onBusy: function (n, of) { status.textContent = "Gemini is busy right now — trying again (" + n + " of " + of + ")…"; },
          structured: o.schema ? { schema: o.schema } : undefined,
          messages: [{ role: "user", content: o.prompt, images: [{ mime: "image/jpeg", data: o.image }] }]
        }, function (err, res) {
          if (err) {
            send.disabled = false;
            status.textContent = /HTTP 503|overloaded|UNAVAILABLE|high demand/i.test(err.message || "")
              ? "Gemini is still too busy (high demand on Google's side). Try Send again in a minute, or tick the marks yourself."
              : "Kurenai couldn't read it — " + (err.message || "try again") + ". Tick the marks yourself.";
            return;
          }
          var json = readJson(res.text);
          if (!json) {
            send.disabled = false;
            status.textContent = /max|length/i.test(res.finishReason || "") ? "Kurenai's reply was cut short. Send again, or tick the marks yourself." : "Kurenai's reply couldn't be read. Send again, or tick the marks yourself.";
            return;
          }
          close();
          o.onReply(mathAll(json));
        });
      } });
      foot.appendChild(el("span"));
      foot.appendChild(cancel); foot.appendChild(send);
    } });
  }

  /* Mark with Kurenai (30g): the pad, the question, its scheme → for each
     scheme point a suggestion (award or not, the line it read, a reason).
     An A is never suggested without its M: enforced here as well as asked. */
  var MARK_SCHEMA = { type: "object", properties: {
    lines: { type: "array", items: { type: "object", properties: { n: { type: "integer" }, text: { type: "string" } }, required: ["n", "text"] } },
    points: { type: "array", items: { type: "object", properties: {
      i: { type: "integer" }, award: { type: "boolean" }, line: { type: "integer" }, reason: { type: "string" } }, required: ["i", "award", "reason"] } },
    unreadable: { type: "array", items: { type: "integer" } } }, required: ["points"] };
  function markWithKurenai(o) {
    o.pad.image(function (b64, url) {
      var scheme = (o.scheme || []).map(function (s, i) { return (i + 1) + ". " + KOS.inkAI.plain(s); });
      ask({
        title: "Mark with Kurenai · what is sent", imageUrl: url, image: b64,
        sections: [{ h: "The question · " + o.marks + (o.marks === 1 ? " mark" : " marks"), text: KOS.inkAI.plain(o.question) }, { h: "Its mark scheme", lines: scheme }],
        instruction: "Read the handwritten answer line by line and number the lines. For each mark scheme point, say whether the answer earns it, which line shows it, and why in one sentence. Never award an A mark unless its M mark is awarded. Name lines you cannot read instead of guessing.",
        system: "You mark a student's handwritten A-level answer against the mark scheme given. You only suggest; the student decides. Be strict like an examiner. Reply with JSON only.",
        prompt: "QUESTION (" + o.marks + " marks):\n" + KOS.inkAI.plain(o.question) + "\n\nMARK SCHEME (points numbered from 1):\n" + scheme.join("\n") +
          "\n\nThe picture is the student's answer. Return {lines:[{n,text}], points:[{i (the point's number), award, line, reason}], unreadable:[line numbers]}.",
        schema: MARK_SCHEMA,
        onReply: function (json) {
          var pts = (json.points || []).filter(function (p) { return p && p.i >= 1 && p.i <= scheme.length; });
          /* an A without its M: the model's award is withheld, with why */
          pts.forEach(function (p) {
            var txt = String(o.scheme[p.i - 1] || "");
            if (/^\s*A\d/.test(txt) && p.award) {
              var m = null;
              for (var k = p.i - 2; k >= 0; k--) if (/^\s*M\d/.test(String(o.scheme[k] || ""))) { m = k + 1; break; }
              var mp = m ? pts.filter(function (q) { return q.i === m; })[0] : null;
              if (m && !(mp && mp.award)) { p.award = false; p.needsM = m; p.reason = "Needs the M above first. " + (p.reason || ""); }
            }
          });
          announce("Kurenai suggests " + pts.filter(function (p) { return p.award; }).length + " of " + o.marks + " marks. None confirmed.");
          o.onSuggest({ points: pts, lines: json.lines || [], unreadable: json.unreadable || [], at: o.pad.page.items.length });
        }
      });
    });
  }
  /* Check my working (30k): the first line to look at, what to look at in
     it, and nothing further — no corrected line, no final answer */
  var CHECK_SCHEMA = { type: "object", properties: {
    ok: { type: "boolean" }, line: { type: "integer" }, look: { type: "string" }, why: { type: "string" },
    lines: { type: "array", items: { type: "object", properties: { n: { type: "integer" }, text: { type: "string" } } } },
    unreadable: { type: "array", items: { type: "integer" } } }, required: ["ok"] };
  function checkWorking(o) {
    o.pad.image(function (b64, url) {
      ask({
        title: "Check my working · what is sent", imageUrl: url, image: b64,
        sections: [{ h: "The question", text: KOS.inkAI.plain(o.question) }],
        instruction: "Read the working line by line. Name the FIRST line that is wrong and what to look at in it, in one sentence. Do not correct it, do not give a later line, do not give the answer. If every line is right, say so.",
        system: "You check a student's handwritten maths working. You point at the first wrong line only and never give the correction or the answer. Reply with JSON only.",
        prompt: "QUESTION:\n" + KOS.inkAI.plain(o.question) + "\n\nThe picture is the student's working. Return {ok, line, look (what to look at, one sentence, no correction), why (one more sentence of reason, still no corrected working), lines:[{n,text}], unreadable:[n]}.",
        schema: CHECK_SCHEMA, onReply: o.onReply
      });
    });
  }
  /* Compare with Kurenai (30m): which of the notes' points the blurt has */
  var COMPARE_SCHEMA = { type: "object", properties: {
    had: { type: "array", items: { type: "integer" } }, notes: { type: "array", items: { type: "object", properties: { i: { type: "integer" }, reason: { type: "string" } } } } }, required: ["had"] };
  function compareBlurt(o) {
    o.pad.image(function (b64, url) {
      var pts = o.points.map(function (p, i) { return (i + 1) + ". " + p; });
      ask({
        title: "Compare with Kurenai · what is sent", imageUrl: url, image: b64,
        sections: [{ h: "The topic's points", lines: pts }],
        instruction: "Say which numbered points the handwritten page covers, in substance. Only suggest; the student ticks.",
        system: "You compare a student's handwritten blurt with a list of points. Reply with JSON only.",
        prompt: "POINTS:\n" + pts.join("\n") + "\n\nThe picture is the student's blurt. Return {had:[point numbers covered], notes:[{i, reason}]}.",
        schema: COMPARE_SCHEMA, onReply: o.onReply
      });
    });
  }
  function plain(s) {
    var d = document.createElement("div");
    d.innerHTML = KOS.content && KOS.content.inline ? KOS.content.inline(String(s || "")) : String(s || "");
    return (d.textContent || "").replace(/\s+/g, " ").trim();
  }

  /* the suggestion chips on a tally (30g): ◇ suggested (dashed teal), ✓
     confirmed, ✕ declined; confirming ticks the point through `tick(i)` */
  function suggestionChip(p, tick, onDecide) {
    var chip = el("span", { class: "k-pad-sug", "data-ui": "pad.suggestion", "data-award": p.award ? "yes" : "no" });
    function paint(state) {
      chip.innerHTML = "";
      KOS.ui.state(chip, "confirmed", state === "yes");
      KOS.ui.state(chip, "declined", state === "no");
      chip.appendChild(el("span", { class: "k-pad-sug-mark", "aria-hidden": "true", text: state === "yes" ? "✓" : state === "no" ? "✕" : "◇" }));
      var words = el("span", { class: "k-pad-sug-t", text: (p.award ? "Kurenai: award" : "Kurenai: not yet") + (p.line ? " · line " + p.line : "") + " — " + (p.reason || "") });
      chip.appendChild(words);
      typeset(words);
      if (!state) {
        chip.appendChild(el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "pad.sug-confirm", text: p.award ? "Confirm" : "Agree", onclick: function () { if (p.award) tick(true); paint("yes"); onDecide && onDecide(); } }));
        chip.appendChild(el("button", { type: "button", class: "k-btn k-btn--sm k-btn--quiet", "data-ui": "pad.sug-decline", text: p.award ? "Decline" : "Award anyway", onclick: function () { if (!p.award) tick(true); paint("no"); onDecide && onDecide(); } }));
      }
    }
    paint(null);
    chip.confirm = function () { if (!KOS.ui.hasState(chip, "confirmed") && !KOS.ui.hasState(chip, "declined") && p.award) { tick(true); paint("yes"); } };
    return chip;
  }

  KOS.inkPad = { mount: mount, answer: answer, earlier: earlier, earlierLink: earlierLink, viewDoc: viewDoc, STRIP_H: STRIP_H };
  KOS.inkAI = { readJson: readJson, mathText: mathText, typeset: typeset, reads: reads, ready: ready, online: online, ask: ask, markWithKurenai: markWithKurenai, checkWorking: checkWorking,
    compareBlurt: compareBlurt, suggestionChip: suggestionChip, plain: plain };
})();
