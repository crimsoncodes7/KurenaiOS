/* Kurenai OS — modules/inkdrills.js · KOS.inkDrills
   The pen's drills (roadmap 6.5–6.6, design 30k–30n), each a dialog over
   the page that opened it, each an ink doc of its own:

   - WRITE IT OUT (30l): a worked example's steps hidden one at a time. You
     write the next line on a strip, reveal it, and say Had it, Partly or
     Missed it; the marks each step carries ride on its right. From a
     topic's notes (any worked example) and the Companion's variations.
   - BLURT (30m): a blank page and a timer for one topic; Done opens
     compare — the notes reduced to their points (headings, key-value rows,
     callouts; the Spec's statements when there are no notes) — and you tick
     what you had. Compare with Kurenai suggests ticks (only when asked,
     invariant 135). Save to the notebook files the page into the topic's
     Handwritten tab, titled "Blurt".
   - DIAGRAM DRILL (30n): a diagram named and nothing else, drawn from
     memory on dotted paper, then the authored model (js/data/ink-drills.js)
     laid over it in Teal, 0–100 (50 to start), with its checklist.
   - MATHS WORKING (30k): the FX-991CW panel and the topic's formula
     booklet (Booklet · Memorise) beside a squared page, and Check my
     working (only when asked): the first line to look at, nothing further.

   Verdicts and ticks are EVIDENCE kept with the drill's own doc (its
   meta): they rate no card and move no FSRS state (invariant 111), and
   writing pays nothing (invariant 134).                                  */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var I = KOS.ink;
  function el() { return KOS.ui.el.apply(null, arguments); }
  function announce(t) { if (KOS.a11y && KOS.a11y.announce) KOS.a11y.announce(t); }
  function inline(s) { return KOS.content.inline(String(s || "")); }
  function html(tag, cls, h) { var n = el(tag, { class: cls }); n.innerHTML = h; return n; }

  var VERDICTS = [["had", "Had it", "✓"], ["partly", "Partly", "◐"], ["missed", "Missed it", "✕"]];

  /* ================= Write it out (30l) =================
     o: {title, given (html or blocks), steps: [{h, m, n, mk}], result,
         item, badge ("Written by KurenaiOS, not a board paper")} */
  function writeOut(o) {
    var pads = [];
    KOS.inkUI.dialog({ title: "Write it out · " + (o.title || "worked example"), className: "k-drill-dlg", wide: true, hook: "drill.writeout",
      onClose: function () { pads.forEach(function (p) { p.destroy(); }); },
      render: function (body) {
        if (o.badge) body.appendChild(el("p", { class: "k-drill-badge", text: o.badge }));
        if (o.given) {
          var g = el("div", { class: "k-prose k-drill-given", "data-ui": "drill.given" });
          g.innerHTML = Array.isArray(o.given) ? KOS.content.renderBlocks(o.given) : "<p>" + inline(o.given) + "</p>";
          body.appendChild(el("section", { class: "k-drill-sec" }, [el("span", { class: "k-kicker", text: "Given" }), g]));
          KOS.content.typeset(g);
        }
        var list = el("ol", { class: "k-drill-steps", "data-ui": "drill.steps" });
        body.appendChild(list);
        var verdicts = [], at = 0, steps = o.steps || [];
        var summary = el("div", { class: "k-drill-summary", "data-ui": "drill.summary", hidden: "" });
        body.appendChild(summary);
        var docKeys = [];
        function stepRow(i) {
          var st = steps[i], li = el("li", { class: "k-drill-step", "data-ui": "drill.step" });
          var head = el("div", { class: "k-drill-step-h" }, [el("b", { text: "Step " + (i + 1) }), st.mk ? el("span", { class: "k-drill-mk", text: st.mk }) : null].filter(Boolean));
          li.appendChild(head);
          return li;
        }
        function paint() {
          list.innerHTML = "";
          steps.forEach(function (st, i) {
            var li = stepRow(i);
            if (i < at) {
              KOS.ui.state(li, "done", true);
              var line = el("div", { class: "k-prose k-drill-line" }); line.innerHTML = (st.h ? "<b>" + inline(st.h) + "</b> " : "") + (st.m != null ? inline(st.m) : "");
              li.appendChild(line);
              if (st.n) li.appendChild(html("p", "k-drill-note", inline(st.n)));
              var v = VERDICTS.filter(function (x) { return x[0] === verdicts[i]; })[0];
              if (v) li.appendChild(el("span", { class: "k-chip k-drill-verdict", "data-v": v[0], text: v[2] + " " + v[1] }));
            } else if (i === at) {
              KOS.ui.state(li, "now", true);
              var slot = el("div", { class: "k-drill-pad" });
              li.appendChild(slot);
              var pad = KOS.inkPad.mount(slot, { kind: "strip", prefix: "drill", item: o.item ? o.item + ":s" + i : null, title: "Write it out · step " + (i + 1), q: "s" + i,
                paper: o.paper || "lined" });
              pads.push(pad);
              docKeys[i] = pad.key;
              var acts = el("div", { class: "k-drill-acts" });
              if (st.h) acts.appendChild(el("button", { type: "button", class: "k-btn k-btn--sm k-btn--quiet", "data-ui": "drill.hint", text: "Hint", onclick: function (e) {
                e.currentTarget.replaceWith(el("span", { class: "k-drill-hint", html: "Hint: " + inline(st.h) }));
              } }));
              var reveal = el("button", { type: "button", class: "k-btn k-btn--primary k-btn--sm", "data-ui": "drill.reveal", text: "Reveal step " + (i + 1), disabled: "" });
              pad.onInk(function () { reveal.disabled = false; });
              reveal.addEventListener("click", function () {
                reveal.remove();
                var line = el("div", { class: "k-prose k-drill-line" }); line.innerHTML = (st.h ? "<b>" + inline(st.h) + "</b> " : "") + (st.m != null ? inline(st.m) : "");
                li.insertBefore(line, acts);
                KOS.content.typeset(line);
                announce("Step " + (i + 1) + " revealed.");
                acts.innerHTML = "";
                acts.appendChild(el("span", { class: "k-kicker", text: "Did you have it?" }));
                VERDICTS.forEach(function (v) {
                  acts.appendChild(el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "drill.verdict", "data-v": v[0], text: v[2] + " " + v[1], onclick: function () {
                    verdicts[i] = v[0];
                    I.setDocMeta(pad.key, { verdict: v[0], drill: "writeout" });
                    at++;
                    announce(v[1] + ". " + (at < steps.length ? "Step " + (at + 1) + " of " + steps.length + "." : "Done."));
                    pads.splice(0).forEach(function (p) { p.destroy(); });
                    paint();
                  } }));
                });
              });
              acts.appendChild(reveal);
              li.appendChild(acts);
            } else {
              KOS.ui.state(li, "hidden", true);
              li.appendChild(el("p", { class: "k-drill-hidden", text: "Hidden until you write the step before" }));
            }
            list.appendChild(li);
          });
          KOS.content.typeset(list);
          if (at >= steps.length) {
            var had = verdicts.filter(function (v) { return v === "had"; }).length, part = verdicts.filter(function (v) { return v === "partly"; }).length;
            summary.hidden = false;
            summary.innerHTML = "";
            summary.appendChild(el("p", { class: "k-drill-sum-t", text: had + " of " + steps.length + " had" + (part ? ", " + part + " partly" : "") + "." }));
            if (o.result) summary.appendChild(html("p", "k-drill-result", "<b>Answer</b> " + inline(o.result)));
            summary.appendChild(el("div", { class: "k-drill-acts" }, [el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "drill.again", text: "Again", onclick: function () { at = 0; verdicts = []; summary.hidden = true; paint(); } })]));
            KOS.content.typeset(summary);
          }
        }
        paint();
      } });
  }
  /* the worked examples in a notes block list, in render order */
  function workedIn(blocks, out) {
    out = out || [];
    (blocks || []).forEach(function (b) {
      if (!b || typeof b !== "object") return;
      if (b.worked) out.push(b.worked);
      if (b.callout && Array.isArray(b.callout.body)) workedIn(b.callout.body, out);
      if (Array.isArray(b.body)) workedIn(b.body, out);
    });
    return out;
  }
  function writeOutWorked(w, sid, ref, i) {
    writeOut({ title: w.title ? KOS.inkAI.plain(w.title).replace(/\$/g, "") : "worked example", given: w.q ? (typeof w.q === "string" ? [w.q] : w.q) : null,
      steps: (w.steps || []).map(function (st) { return typeof st === "string" ? { m: st } : st; }), result: w.result,
      item: "writeout:" + sid + ":" + ref + ":" + i, paper: sid === "maths" ? "squared" : "lined" });
  }

  /* ================= Blurt (30m) ================= */
  function pointsOf(sid, ref) {
    var c = KOS.content.get(sid, ref), out = [];
    function walk(blocks) {
      (blocks || []).forEach(function (b) {
        if (!b || typeof b !== "object") return;
        if (b.h) out.push(KOS.inkAI.plain(b.h));
        if (b.kv) b.kv.forEach(function (p) { out.push(KOS.inkAI.plain(p[0]) + ": " + KOS.inkAI.plain(typeof p[1] === "string" ? p[1] : "").slice(0, 120)); });
        if (b.callout) out.push(KOS.inkAI.plain(b.callout.h || (typeof b.callout.body === "string" ? b.callout.body : "")).slice(0, 140));
        if (b.callout && Array.isArray(b.callout.body)) walk(b.callout.body);
      });
    }
    walk(c && c.notes);
    out = out.filter(function (x, i) { return x && out.indexOf(x) === i; });
    if (!out.length) {
      var n = KOS.spec.node && KOS.spec.node(sid + ":" + ref);
      (n && n.content || []).forEach(function (t) { var s = KOS.inkAI.plain(typeof t === "string" ? t : t.text || ""); if (s) out.push(s); });
    }
    return out.slice(0, 24);
  }
  function blurt(sid, ref, title) {
    var pad = null, timer = null;
    KOS.inkUI.dialog({ title: "Blurt · " + (title || ref), className: "k-drill-dlg", wide: true, hook: "drill.blurt", scrimClose: false,
      onClose: function () { clearInterval(timer); if (pad) pad.destroy(); },
      render: function (body) {
        var head = el("div", { class: "k-drill-blurt-head" });
        body.appendChild(head);
        var stage = el("div", { class: "k-drill-blurt" });
        body.appendChild(stage);
        var minutes = 5;
        function choose() {
          head.innerHTML = "";
          head.appendChild(el("p", { class: "k-drill-p", text: "Write everything you remember about " + ref + " on a blank page. Then the notes open beside it and you tick what you had." }));
          head.appendChild(el("div", { class: "k-drill-acts" }, [el("span", { class: "k-kicker", text: "Timer" })].concat([3, 5, 10, 15].map(function (m) {
            var b = el("button", { type: "button", class: "k-chip", "aria-pressed": String(m === minutes), "data-ui": "drill.minutes", text: m + " min", onclick: function () { minutes = m; choose(); } });
            KOS.ui.state(b, "on", m === minutes);
            return b;
          })).concat([el("button", { type: "button", class: "k-btn k-btn--primary k-btn--sm", "data-ui": "drill.start", text: "Start", onclick: start })])));
        }
        function start() {
          var end = Date.now() + minutes * 60000, warned = false;
          head.innerHTML = "";
          var clock = el("span", { class: "k-drill-clock k-mono", "data-ui": "drill.clock", "aria-hidden": "true" });
          head.appendChild(el("div", { class: "k-drill-acts" }, [clock, el("button", { type: "button", class: "k-btn k-btn--primary k-btn--sm", "data-ui": "drill.done", text: "Done · compare", onclick: compare })]));
          function tick() {
            var left = Math.max(0, end - Date.now()), m = Math.floor(left / 60000), sec = Math.floor(left % 60000 / 1000);
            clock.textContent = m + ":" + String(sec).padStart(2, "0");
            if (!warned && left <= 60000 && left > 0) { warned = true; announce("One minute left."); }
            if (!left) { clearInterval(timer); clock.textContent = "Time"; announce("Time."); }
          }
          tick(); timer = setInterval(tick, 1000);
          pad = KOS.inkPad.mount(stage, { kind: "page", prefix: "blurt", item: "blurt:" + sid + ":" + ref, title: "Blurt", q: ref, paper: "blank" });
        }
        function compare() {
          clearInterval(timer);
          head.innerHTML = "";
          KOS.ui.state(stage, "compare", true);
          var pts = pointsOf(sid, ref), ticks = pts.map(function () { return false; });
          var side = el("section", { class: "k-drill-points", "data-ui": "drill.points", "aria-label": "The topic's points" });
          var count = el("span", { class: "k-drill-count", "aria-live": "polite" });
          function paintCount() { count.textContent = ticks.filter(Boolean).length + " of " + pts.length + " points ticked"; }
          side.appendChild(el("div", { class: "k-drill-acts" }, [el("span", { class: "k-kicker", text: "What the notes hold" }), count]));
          var boxes = [];
          pts.forEach(function (p, i) {
            var cb = el("input", { type: "checkbox", class: "k-box", onchange: function () { ticks[i] = cb.checked; paintCount(); } });
            boxes.push(cb);
            side.appendChild(el("label", { class: "k-drill-point" }, [cb, el("span", { text: p })]));
          });
          paintCount();
          var acts = el("div", { class: "k-drill-acts" });
          if (KOS.inkAI.reads() && pad && pad.hasInk() && pts.length) acts.appendChild(el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "drill.compare-ai", text: KOS.inkAI.online() ? "Compare with Kurenai" : "Compare with Kurenai · needs a connection", disabled: KOS.inkAI.online() ? null : "", onclick: function (e) {
            var b = e.currentTarget;
            KOS.inkAI.compareBlurt({ pad: pad, points: pts, onReply: function (json) {
              (json.had || []).forEach(function (n) {
                var i = n - 1;
                if (!boxes[i] || boxes[i].checked) return;
                var lbl = boxes[i].parentNode;
                lbl.appendChild(KOS.inkAI.suggestionChip({ award: true, reason: "covered on your page" }, function () { boxes[i].checked = true; ticks[i] = true; paintCount(); }));
              });
              b.remove();
              announce("Kurenai suggests " + (json.had || []).length + " points. None ticked.");
            } });
          } }));
          acts.appendChild(el("button", { type: "button", class: "k-btn k-btn--primary k-btn--sm", "data-ui": "drill.save-blurt", text: "Save to the notebook", disabled: pad && pad.hasInk() ? null : "", onclick: function (e) {
            e.currentTarget.disabled = true;
            I.setDocMeta(pad.key, { ticks: ticks.filter(Boolean).length, of: pts.length, drill: "blurt" });
            var copy = { paper: "blank", items: pad.page.items.map(function (it) { return Object.assign({}, it, { id: I.uid() }); }) };
            I.addPage(I.topicDoc(sid, ref), copy, function (err) { KOS.ui.toast(err ? "It couldn't be saved — " + err.message : "Saved to " + ref + "'s notebook as a new page.", !!err); });
          } }));
          side.appendChild(acts);
          stage.appendChild(side);
          if (pad) I.setDocMeta(pad.key, { ticks: 0, of: pts.length, drill: "blurt" });
          boxes.forEach(function (cb, i) { cb.addEventListener("change", function () { if (pad) I.setDocMeta(pad.key, { ticks: ticks.filter(Boolean).length, of: pts.length, drill: "blurt" }); }); });
        }
        choose();
      } });
  }

  /* ================= the diagram drill (30n) ================= */
  function drillsFor(sid, ref) {
    return (window.KOS_INK_DRILLS || []).filter(function (d) { return d.sid === sid && d.refs.indexOf(ref) >= 0; });
  }
  function diagram(sid, ref, id) {
    var list = drillsFor(sid, ref), cur = list.filter(function (d) { return d.id === id; })[0] || list[0], pad = null;
    if (!cur) return;
    KOS.inkUI.dialog({ title: "Diagram drill", className: "k-drill-dlg", wide: true, hook: "drill.diagram", scrimClose: false,
      onClose: function () { if (pad) pad.destroy(); },
      render: function (body) {
        function paint() {
          if (pad) { pad.destroy(); pad = null; }
          body.innerHTML = "";
          if (list.length > 1) body.appendChild(el("div", { class: "k-drill-acts", role: "radiogroup", "aria-label": "Drill" }, list.map(function (d) {
            var b = el("button", { type: "button", class: "k-chip", role: "radio", "aria-checked": String(d === cur), text: d.kind, onclick: function () { cur = d; paint(); } });
            KOS.ui.state(b, "on", d === cur);
            return b;
          })));
          body.appendChild(el("p", { class: "k-drill-p" }, [el("b", { text: cur.title + ". " }), el("span", { text: cur.prompt })]));
          body.appendChild(el("p", { class: "k-drill-badge", text: "The model is written by KurenaiOS." }));
          var grid = el("div", { class: "k-drill-diagram" });
          body.appendChild(grid);
          var pageBox = el("div", { class: "k-drill-pagebox" });
          grid.appendChild(pageBox);
          pad = KOS.inkPad.mount(pageBox, { kind: "page", prefix: "drill", item: "diagram:" + cur.id, title: "Diagram · " + cur.kind, q: cur.id, paper: "dotted" });
          var sheet = pageBox.querySelector(".k-ink-page");
          var ov = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          ov.setAttribute("viewBox", "0 0 1000 1414"); ov.setAttribute("class", "k-drill-model"); ov.setAttribute("aria-hidden", "true");
          ov.innerHTML = cur.svg;
          ov.style.setProperty("--model-o", "0");
          sheet.appendChild(ov);
          var side = el("section", { class: "k-drill-points", "aria-label": "The model" });
          grid.appendChild(side);
          var showBtn = el("button", { type: "button", class: "k-btn k-btn--primary k-btn--sm", "data-ui": "drill.show-model", text: "Show the model", onclick: function () {
            showBtn.remove();
            var slider = el("input", { type: "range", min: "0", max: "100", value: "50", class: "k-drill-slider", "data-ui": "drill.opacity", "aria-label": "Model strength" });
            var val = el("span", { class: "k-mono", text: "50%" });
            slider.addEventListener("input", function () { ov.style.setProperty("--model-o", String(slider.value / 100)); val.textContent = slider.value + "%"; });
            ov.style.setProperty("--model-o", "0.5");
            announce("Model shown at 50%.");
            side.appendChild(el("label", { class: "k-drill-acts" }, [el("span", { class: "k-kicker", text: "Model" }), slider, val]));
            var ticks = [];
            cur.features.forEach(function (f, i) {
              var cb = el("input", { type: "checkbox", class: "k-box", onchange: function () { ticks[i] = cb.checked; } });
              side.appendChild(el("label", { class: "k-drill-point" }, [cb, el("span", { text: f })]));
            });
            side.appendChild(el("div", { class: "k-drill-acts" }, [el("span", { class: "k-kicker", text: "Did you have it?" })].concat(VERDICTS.map(function (v) {
              return el("button", { type: "button", class: "k-btn k-btn--sm", "data-v": v[0], "data-ui": "drill.verdict", text: v[2] + " " + v[1], onclick: function () {
                if (pad.hasInk()) I.setDocMeta(pad.key, { verdict: v[0], drill: "diagram", ticks: ticks.filter(Boolean).length, of: cur.features.length });
                announce(v[1] + ".");
                KOS.ui.toast(v[1] + " — kept with this drill's page.");
              } });
            }))));
          } });
          side.appendChild(showBtn);
        }
        paint();
      } });
  }

  /* ================= Maths working (30k): the side panel =================
     The FX-991CW's set-up and checks (the Maths playbook) and the topic's
     own formula callouts, Booklet and Memorise. */
  function mathsPanel(sid, ref) {
    var pb = window.KOS_EXAMS && KOS_EXAMS.playbook && KOS_EXAMS.playbook.Edexcel;
    var calc = pb && pb.calculator;
    var cs = KOS.examCompanion && KOS.examCompanion.callouts ? KOS.examCompanion.callouts((KOS.content.get(sid, ref) || {}).notes || []) : [];
    var booklet = cs.filter(function (c) { return c.kind === "formula"; }), memorise = cs.filter(function (c) { return c.kind === "memorise"; });
    var box = el("section", { class: "k-drill-mpanel", "data-ui": "drill.maths-panel", "aria-label": "Calculator and formulae" });
    var view = "calc";
    function paint() {
      box.innerHTML = "";
      box.appendChild(KOS.ui.tabs([
        calc ? { label: "FX-991CW", active: view === "calc", onSelect: function () { view = "calc"; paint(); } } : null,
        { label: "Booklet", active: view === "booklet", onSelect: function () { view = "booklet"; paint(); } },
        { label: "Memorise", active: view === "memorise", onSelect: function () { view = "memorise"; paint(); } }
      ].filter(Boolean), { variant: "workspace", label: "Maths panel" }));
      if (view === "calc" && calc) {
        box.appendChild(el("p", { class: "k-drill-p", text: calc.note }));
        box.appendChild(el("ul", { class: "k-drill-list" }, calc.checks.map(function (c) { return el("li", {}, [el("b", { text: c[0] + ". " }), el("span", { text: c[1] })]); })));
        box.appendChild(el("details", { class: "k-drill-fold" }, [el("summary", { text: "Set-up before a paper" }), el("ul", { class: "k-drill-list" }, calc.setup.map(function (t) { return el("li", { text: t }); }))]));
        box.appendChild(el("p", { class: "k-drill-badge", text: calc.source }));
        return;
      }
      var rows = view === "booklet" ? booklet : memorise;
      if (!rows.length) { box.appendChild(el("p", { class: "k-drill-p", text: view === "booklet" ? "This topic's notes mark nothing as in the formula booklet." : "This topic's notes mark nothing to memorise." })); return; }
      rows.forEach(function (r) {
        var n = el("div", { class: "k-prose k-drill-formula" });
        n.innerHTML = (r.h ? "<b>" + inline(r.h) + "</b>" : "") + KOS.content.renderBlocks(r.body);
        box.appendChild(n);
        KOS.content.typeset(n);
      });
      box.appendChild(el("p", { class: "k-drill-badge", text: view === "booklet" ? "In Edexcel's formula booklet: look it up, do not learn it." : "Not in the booklet: learn it." }));
    }
    paint();
    return box;
  }
  /* Check my working on a pad (30k): a card anchored above the page */
  function checkButton(pad, question, host) {
    if (!KOS.inkAI.reads()) return null;
    var b = el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "drill.check", text: KOS.inkAI.online() ? "Check my working" : "Check my working · needs a connection", disabled: "" });
    b.title = "Write your working first";
    pad.onInk(function () { if (KOS.inkAI.online()) { b.disabled = false; b.title = ""; } });
    b.addEventListener("click", function () {
      KOS.inkAI.checkWorking({ pad: pad, question: question(), onReply: function (json) {
        var old = host.querySelector("[data-ui~='drill.check-card']");
        if (old) old.remove();
        var card = el("div", { class: "k-drill-check", "data-ui": "drill.check-card", role: "status" });
        if (json.ok) card.appendChild(el("p", { text: "Every line checks out." + (json.look ? " " + json.look : "") }));
        else {
          card.appendChild(el("p", {}, [el("b", { text: "Line " + (json.line || "?") + " is the first to look at. " }), el("span", { text: json.look || "" })]));
          if (json.why) card.appendChild(el("button", { type: "button", class: "k-btn k-btn--sm k-btn--quiet", text: "Show why", onclick: function (e) { var w = el("p", { class: "k-drill-p", text: json.why }); e.currentTarget.replaceWith(w); KOS.inkAI.typeset(w); } }));
        }
        if (json.unreadable && json.unreadable.length) card.appendChild(el("p", { class: "k-drill-p", text: "Kurenai couldn't read line" + (json.unreadable.length > 1 ? "s " : " ") + json.unreadable.join(" and ") + "." }));
        card.appendChild(el("p", { class: "k-drill-badge", text: "A suggestion from Kurenai. It wrote nothing on your page." }));
        host.insertBefore(card, host.firstChild);
        KOS.inkAI.typeset(card);
        announce(json.ok ? "Check: every line checks out." : "Check: line " + (json.line || "") + " is the first to look at.");
      } });
    });
    return b;
  }

  /* the drills a topic offers, for the Handwritten tab's menu */
  function menuItems(sid, ref, title) {
    var items = [{ label: "Blurt…", onSelect: function () { blurt(sid, ref, title); } }];
    drillsFor(sid, ref).forEach(function (d) { items.push({ label: "Diagram drill: " + d.kind + "…", onSelect: function () { diagram(sid, ref, d.id); } }); });
    var w = workedIn((KOS.content.get(sid, ref) || {}).notes || []);
    w.slice(0, 12).forEach(function (x, i) {
      items.push({ label: "Write it out: " + (x.title ? KOS.inkAI.plain(x.title).slice(0, 48) : "worked example " + (i + 1)) + "…", onSelect: function () { writeOutWorked(x, sid, ref, i); } });
    });
    return items;
  }

  /* the notes' "Write it out" buttons: one listener for every notes view */
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-ui~='content.writeout']");
    if (!b) return;
    e.preventDefault(); e.stopPropagation();
    var fig = b.closest("[data-w]"), art = b.closest("[data-topic]");
    if (!fig || !art) { KOS.ui.toast("Open the topic's notes to write this one out."); return; }
    var t = art.getAttribute("data-topic"), i = t.indexOf(":"), sid = t.slice(0, i), ref = t.slice(i + 1);
    var all = workedIn((KOS.content.get(sid, ref) || {}).notes || []);
    var at = -1;
    all.forEach(function (w, k) { if (at < 0 && KOS.content.workedKey(w) === fig.getAttribute("data-w")) at = k; });
    if (at < 0) { KOS.ui.toast("That example could not be found in the notes."); return; }
    writeOutWorked(all[at], sid, ref, at);
  }, true);

  KOS.inkDrills = { writeOut: writeOut, writeOutWorked: writeOutWorked, workedIn: workedIn, blurt: blurt, pointsOf: pointsOf,
    diagram: diagram, drillsFor: drillsFor, mathsPanel: mathsPanel, checkButton: checkButton, menuItems: menuItems };
})();
