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
    var panel = el("section", { class: "k-card k-lab k-cr-refs", "data-subject": "creatives", "data-ui": "cr.refs", "aria-label": "Reference generator" });
    main.appendChild(panel);
    var seg = el("div", { class: "k-seg", role: "group", "aria-label": "Kind of reference" }, KOS.crRefs.KINDS.map(function (k) {
      return el("button", { type: "button", class: "k-seg-item", "data-ui": "cr.ref-kind", "aria-pressed": String(p.kind === k.id), text: k.t, onclick: function () {
        p.kind = k.id; save(p); [].forEach.call(seg.children, function (b) { b.setAttribute("aria-pressed", String(b === this)); }, this); paint();
      } });
    }));
    var seedOut = el("span", { class: "k-mono k-muted", "data-ui": "cr.ref-seed" });
    var consBtn = el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "cr.ref-cons", "aria-pressed": String(p.cons), text: "Show construction",
      onclick: function () { p.cons = !p.cons; consBtn.setAttribute("aria-pressed", String(p.cons)); save(p); paint(); } });
    var nextBtn = el("button", { type: "button", class: "k-btn k-btn--sm k-btn--primary", "data-intent": "primary", "data-ui": "cr.ref-next", text: "Next ›",
      onclick: function () { p.seed = 1 + Math.floor(Math.random() * 99999); save(p); paint(); KOS.a11y.announce("Reference " + p.seed + "."); } });
    var lab = KOS.lab.create(panel, { controls: [KOS.ui.scroller(seg, { label: "Kinds of reference" }), el("span", { class: "k-lab-bar-gap", "aria-hidden": "true" }), seedOut, consBtn, nextBtn],
      label: "A drawn reference", readout: ["now", "values", "legend"] });
    function paint() {
      var K = KOS.crRefs.KINDS.filter(function (k) { return k.id === p.kind; })[0];
      var out = KOS.crRefs.build(p.kind, p.seed);
      seedOut.textContent = "Seed " + p.seed;
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
