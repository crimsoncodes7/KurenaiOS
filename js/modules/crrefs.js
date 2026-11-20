/* Kurenai OS — modules/crrefs.js (KOS.crRefsPage)
   The References page (#/creatives/refs, design 31i): the procedural generator (KOS.crRefs) on
   the lab system's stage (KOS.lab), so it is themed, zooms and pans like every lab. A kind, a
   seed (Next draws a new one; the same seed is the same drawing) and Show construction, which
   adds the far edges and the construction lines in teal. The choices are per device
   (state.ui.creatives.ref) and written only by a press.                                       */
(function () {
  "use strict";
  var el = KOS.ui.el;
  function CR() { return KOS.creatives; }
  function prefs() {
    var r = (KOS.store.state.ui.creatives || {}).ref || {};
    var kinds = KOS.crRefs.KINDS.map(function (k) { return k.id; });
    return { kind: kinds.indexOf(r.kind) >= 0 ? r.kind : "forms", seed: r.seed > 0 ? Math.floor(r.seed) : 1, cons: r.cons !== false };
  }
  function save(p) { CR().ui().ref = p; KOS.store.save(); }

  KOS.crRefsPage = function (main) {
    var p = prefs();
    var hist = KOS.view && KOS.view.memo ? KOS.view.memo("cr.refHist", function () { return { list: [p.seed], pos: 0 }; }) : { list: [p.seed], pos: 0 };
    var panel = el("section", { class: "k-card k-lab k-cr-refs", "data-subject": "creatives", "data-ui": "cr.refs", "aria-label": "Reference generator" });
    main.appendChild(panel);
    var seg = el("div", { class: "k-seg", role: "group", "aria-label": "Kind of reference" }, KOS.crRefs.KINDS.map(function (k) {
      return el("button", { type: "button", class: "k-seg-item", "data-ui": "cr.ref-kind", "aria-pressed": String(p.kind === k.id), text: k.t, onclick: function () {
        p.kind = k.id; save(p); [].forEach.call(seg.children, function (b) { b.setAttribute("aria-pressed", String(b === this)); }, this); paint();
      } });
    }));
    function goSeed(n, push) {
      p.seed = n;
      if (push && hist.list[hist.pos] !== n) { hist.list = hist.list.slice(0, hist.pos + 1); hist.list.push(n); hist.pos = hist.list.length - 1; }
      save(p); paint(); KOS.a11y.announce("Reference " + p.seed + ".");
    }
    var seedIn = el("input", { type: "number", min: "1", max: "99999", step: "1", class: "k-input k-mono", "data-ui": "cr.ref-seed", "aria-label": "Seed",
      onchange: function () {
        var v = Math.floor(Number(seedIn.value));
        if (!isFinite(v) || v < 1 || v > 99999 || v === p.seed) { seedIn.value = String(p.seed); return; }
        goSeed(v, true);
      } });
    var seedWrap = el("label", { class: "k-cr-seedwrap" }, [el("span", { class: "k-muted", text: "Seed" }), seedIn]);
    var consBtn = el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "cr.ref-cons", "aria-pressed": String(p.cons), text: "Show construction",
      onclick: function () { p.cons = !p.cons; consBtn.setAttribute("aria-pressed", String(p.cons)); save(p); paint(); } });
    var prevBtn = el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "cr.ref-prev", text: "‹ Previous",
      onclick: function () { if (hist.pos <= 0) return; hist.pos--; goSeed(hist.list[hist.pos], false); } });
    var nextBtn = el("button", { type: "button", class: "k-btn k-btn--sm k-btn--primary", "data-intent": "primary", "data-ui": "cr.ref-next", text: "Next ›",
      onclick: function () {
        if (hist.pos < hist.list.length - 1) { hist.pos++; goSeed(hist.list[hist.pos], false); return; }
        var n = 1 + Math.floor(Math.random() * 99999);
        if (n === p.seed) n = (n % 99999) + 1;
        goSeed(n, true);
      } });
    var lab = KOS.lab.create(panel, { controls: [KOS.ui.scroller(seg, { label: "Kinds of reference" }), el("span", { class: "k-lab-bar-gap", "aria-hidden": "true" }), seedWrap, consBtn, prevBtn, nextBtn],
      label: "A drawn reference", readout: ["now", "values", "legend"] });
    function paint() {
      var K = KOS.crRefs.KINDS.filter(function (k) { return k.id === p.kind; })[0];
      var out = KOS.crRefs.build(p.kind, p.seed);
      seedIn.value = String(p.seed);
      prevBtn.disabled = hist.pos <= 0;
      lab.draw(function (d) {
        out.items.forEach(function (it) {
          if (it.role !== "form" && !p.cons) return;
          if (it.d) d.path(it.d, { cls: "k-crg k-crg-" + it.role });
        });
        return { w: out.w, h: out.h, note: K.t.toLowerCase() };
      });
      lab.now([K.what + "."]);
      lab.values([["Seed", String(p.seed)]].concat(out.facts));
      lab.legend(p.cons ? [["line-s1", "The form"], ["line-s2", "Construction and far edges"]] : [["line-s1", "The form"]]);
    }
    paint();
  };
})();
