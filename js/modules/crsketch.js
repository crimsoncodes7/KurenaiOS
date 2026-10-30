/* Kurenai OS — modules/crsketch.js (KOS.crSketch)
   The sketchbook (#/creatives/sketch/<lesson>.<study>, docs/creatives-plan.md §9, design 31f–31h):
   an Art micro-study drawn on the ink engine. One page (KOS.inkPad.mount, prefix "sketch", so the
   ink lives in kurenai-os-ink and an earlier attempt stays a link), and beside it the study's brief,
   its timer, Momentum and a reference: the lesson's step pictures, and for a study with `ref` a
   drawing from the generator (KOS.crRefs). "Save to Practice Log" saves the page as a picture on
   this device (KOS.creatives.addWork, invariant 156) and opens its check.

   MOMENTUM (plan §5): for a study that offers it, a per-device switch (state.ui.creatives.momentum)
   chosen before the first stroke: no undo and no eraser, every line committed, the piece marked
   Momentum. The timer only counts down and says "Time"; it never stops the page. Drawing the page
   writes nothing to the state document; only Save does.                                        */
(function () {
  "use strict";
  var el = KOS.ui.el, SID = "creatives", NS = "http://www.w3.org/2000/svg";
  function CR() { return KOS.creatives; }
  function announce(m) { if (KOS.a11y && KOS.a11y.announce) KOS.a11y.announce(m); }
  function svg(tag, attrs) { var n = document.createElementNS(NS, tag); Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); }); return n; }

  /* a generated reference, drawn once (the form and its far edges; no construction) */
  function refFigure(kind) {
    var seed = 1 + Math.floor(Math.random() * 99999);
    var fig = el("figure", { class: "k-crs-ref", "data-ui": "cr.sketch-ref" });
    function draw() {
      fig.innerHTML = "";
      var out = KOS.crRefs.build(kind, seed), box = svg("svg", { viewBox: "0 0 " + out.w + " " + out.h, role: "img", "aria-label": "A generated reference to copy" });
      out.items.forEach(function (it) { if (it.d && it.role !== "cons") box.appendChild(svg("path", { d: it.d, class: "k-sv-edge k-crg k-crg-" + it.role })); });
      fig.appendChild(box);
      fig.appendChild(el("figcaption", {}, [el("span", { class: "k-muted", text: "Seed " + seed }),
        el("button", { type: "button", class: "k-link", "data-ui": "cr.sketch-ref-next", text: "Another", onclick: function () { seed = 1 + Math.floor(Math.random() * 99999); draw(); } })]));
    }
    draw();
    return fig;
  }

  /* the lesson's step pictures as a small strip to look at while drawing (only when all are in) */
  function stepStrip(L) {
    var c = CR().content(L.id), block = null;
    (c && c.pages || []).forEach(function (pg) { pg.blocks.forEach(function (b) { if (b.steps && b.art && !block) block = b; }); });
    if (!block || !KOS.crArt) return null;
    var pics = block.steps.map(function (t, i) { return KOS.crArt("cr.step." + block.art + "." + (i + 1), "Step " + (i + 1) + ": " + t, "k-crs-step"); });
    if (!pics.every(Boolean)) return null;
    return el("ol", { class: "k-crs-steps", "data-ui": "cr.sketch-steps", "aria-label": "The lesson's steps" }, pics.map(function (img, i) {
      return el("li", {}, [img, el("small", { text: (i + 1) + " · " + block.steps[i] })]);
    }));
  }

  function page(main, key) {
    var bits = String(key || "").split("."), lid = bits.slice(0, 2).join("."), sid = bits[2] || null;
    var L = CR().lesson(lid), s = L ? CR().study(lid, sid) : null;
    if (!s || s.tool !== "sketch") { main.appendChild(KOS.ui.emptyState({ mark: "絵", title: "No sketch study here", body: "A sketch study opens from its lesson's Micro-studies tab." })); return; }
    var ui = CR().ui ? (KOS.store.state.ui.creatives || {}) : {};
    var momentum = !!(s.momentum && ui.momentum);
    var stage = el("div", { class: "k-crs-stage", "data-ui": "cr.sketch" });
    var pad = null, saved = false;
    var saveBtn = el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "cr.sketch-save", text: "Save to Practice Log", disabled: "" });
    var momBox = null;
    function mount() {
      if (pad) pad.destroy();
      stage.innerHTML = "";
      pad = KOS.inkPad.mount(stage, { kind: "page", prefix: "sketch", item: "sketch:" + lid + "." + sid, title: s.t, q: lid + "." + sid, paper: "blank",
        tools: momentum ? ["pen"] : ["pen", "eraser", "lasso"], image: false, momentum: momentum });
      pad.onInk(function () { saveBtn.disabled = false; if (momBox) momBox.disabled = true; });
    }
    saveBtn.onclick = function () {
      if (saved || !pad || !pad.hasInk()) return;
      saved = true; saveBtn.disabled = true; saveBtn.textContent = "Saving…";
      pad.image(function (b64, url) {
        CR().addWork({ lesson: lid, study: sid, kind: "image", track: "art", title: lid + "·" + sid + " " + s.t + (momentum ? " · Momentum" : ""), momentum: momentum }, { dataUrl: url }, function (wid) {
          announce("Saved to your Practice Log.");
          KOS.show("creatives", { page: "check", id: wid });
        });
      });
    };

    /* the timer: a countdown the learner starts; "Time" never stops the page */
    var timerRow = null;
    if (s.timer) {
      var clock = el("span", { class: "k-mono k-crs-clock", "aria-hidden": "true", text: s.timer + ":00" }), t = null;
      var go = el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "cr.sketch-timer", text: "Start the timer", onclick: function () {
        if (t) return;
        var end = Date.now() + s.timer * 60000; go.disabled = true;
        (function tick() {
          var left = Math.max(0, end - Date.now()), m = Math.floor(left / 60000), sec = Math.floor(left % 60000 / 1000);
          clock.textContent = m + ":" + String(sec).padStart(2, "0");
          if (!left) { clock.textContent = "Time"; announce("Time."); return; }
          if (!clock.isConnected) return;
          t = setTimeout(tick, 1000);
        })();
        announce(s.timer + " minutes, starting now.");
      } });
      timerRow = el("div", { class: "k-crs-row" }, [clock, go]);
    }
    if (s.momentum) {
      momBox = el("input", { type: "checkbox", class: "k-box", "data-ui": "cr.sketch-momentum" });
      momBox.checked = momentum;
      momBox.onchange = function () {
        momentum = momBox.checked;
        var u = CR().ui(); u.momentum = momentum; KOS.store.save();
        mount();
        announce(momentum ? "Momentum: no undo and no eraser." : "Momentum off.");
      };
    }
    var u = CR().unit(L.unit), T = CR().track(u.track);
    var tip = KOS.crTip ? KOS.crTip(lid, sid) : null;
    var side = el("aside", { class: "k-crs-side", "aria-label": "The study" }, [
      el("section", { class: "k-card k-crs-brief" }, [
        el("span", { class: "k-kicker", text: T.name + " " + u.n + " · " + L.id + "·" + s.id + " · ≈ " + s.min + " min" }),
        el("h2", { class: "k-crs-t", text: s.t }),
        el("dl", { class: "k-cr-study-dl" }, [
          el("div", {}, [el("dt", { text: "Given" }), el("dd", { text: s.give })]),
          el("div", {}, [el("dt", { text: "Your one variable" }), el("dd", { text: s.vary })])
        ]),
        tip,
        timerRow,
        momBox ? el("label", { class: "k-crs-mom" }, [momBox, el("span", {}, [el("b", { text: "Momentum" }), el("small", { class: "k-muted", text: "No undo, no eraser: every line counts. Choose before you start." })])]) : null,
        el("div", { class: "k-cr-daily-go" }, [saveBtn,
          el("button", { type: "button", class: "k-btn", text: "Back to the lesson", onclick: function () { KOS.show("ref", { subject: SID, ref: lid }); } })])
      ].filter(Boolean)),
      s.ref && KOS.crRefs ? el("section", { class: "k-card k-crs-refcard" }, [el("span", { class: "k-kicker", text: "Copy this" }), refFigure(s.ref)]) : null,
      (function () { var st = stepStrip(L); return st ? el("section", { class: "k-card k-crs-refcard" }, [el("span", { class: "k-kicker", text: "The steps" }), st]) : null; })()
    ].filter(Boolean));
    main.appendChild(el("div", { class: "k-crs" }, [stage, side]));
    mount();
  }

  KOS.crSketch = { page: page };
})();
