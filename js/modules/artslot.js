/* KurenaiOS — the picture drawer every painted slot shares (design turn 34n,
   roadmap 5.14). One picture · Rotate (by time or by condition) · Shuffle ·
   Your own picture (an unlock). The rule is synced (`state.artSlots`); the
   picture of the moment is a pure read (KOS.art.rotated). Opened from a
   slot's chip (Home's hero) and from the Wardrobe. */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var el = KOS.ui.el;
  var PERIODS = [["day", "Day"], ["week", "Week"], ["season", "Season"], ["tod", "Time of day"]];
  var CONDS = [["exam", "Exam Season", "while an exam window is open"], ["streak", "A streak milestone", "7, 14, 30 and 100 days, for that day"],
    ["weekend", "Weekend", "Saturday and Sunday"]];

  function open(slot, done) {
    var A = KOS.art, S = A.SLOTS[slot];
    if (!S) return;
    var overlay = el("div", { class: "k-dialog-overlay k-art-drawer-overlay" });
    var box = el("div", { class: "k-dialog k-art-drawer", "data-ui": "ui.dialog art.drawer" });
    overlay.appendChild(box);
    function close() { overlay.close ? overlay.close() : overlay.remove(); if (done) done(); }
    function seg(items, cur, onPick, label) {
      var g = el("div", { class: "k-seg k-seg--quiet", role: "group", "aria-label": label });
      items.forEach(function (x) {
        var b = el("button", { type: "button", class: "k-seg-item", "aria-pressed": String(x[0] === cur), text: x[1], onclick: function () { onPick(x[0]); } });
        KOS.ui.state(b, "active", x[0] === cur);
        g.appendChild(b);
      });
      return g;
    }
    function thumb(p, on, onClick) {
      return el("button", { type: "button", class: "k-art-thumb", "data-slot": slot, "aria-pressed": on ? "true" : "false", "aria-label": p.name, onclick: onClick }, [
        el("img", { src: A.src(p.id), alt: "", loading: "lazy" }), el("span", { text: p.name })]);
    }
    function paint() {
      var c = A.cfg(slot) || { mode: slot === "home" ? "rotate" : "one", by: "time", period: slot === "focus" ? "tod" : "season" };
      var list = A.pool(slot);
      function save(patch) { var n = Object.assign({}, c, patch); A.setCfg(slot, n); KOS.a11y && KOS.a11y.announce(S.name + ": " + A.explain(slot)); paint(); }
      box.innerHTML = "";
      box.appendChild(el("div", { class: "k-dialog-head", "data-ui": "ui.dialog-head" }, [
        el("div", {}, [el("h2", { class: "k-dialog-title", "data-ui": "ui.dialog-title", text: S.name }),
          el("p", { class: "k-muted k-art-drawer-sub", text: "The picture behind this slot · synced like the theme" })]),
        el("button", { type: "button", class: "k-iconbtn", "data-ui": "ui.dialog-close", "aria-label": "Close", text: "✕", onclick: close })
      ]));
      var body = el("div", { class: "k-dialog-body k-art-drawer-body" });
      box.appendChild(body);
      body.appendChild(seg([["one", "One picture"], ["rotate", "Rotate"], ["shuffle", "Shuffle"], ["own", "Your own"]], c.mode, function (m) {
        save({ mode: m });
        if (m === "own") A.loadOwn(paint);
      }, "Mode"));
      if (list.length < 2 && (c.mode === "rotate" || c.mode === "shuffle"))
        body.appendChild(el("p", { class: "k-muted", text: "Own one more to rotate: until then the one you have shows." }));
      if (c.mode === "one") {
        body.appendChild(el("div", { class: "k-art-thumbs" }, list.map(function (p) { return thumb(p, c.pick === p.id, function () { save({ pick: p.id }); }); })));
      } else if (c.mode === "rotate") {
        body.appendChild(el("div", { class: "k-cluster" }, [
          seg([["time", "By time"], ["condition", "By condition"]], c.by || "time", function (b) { save({ by: b }); }, "Rotate by"),
          c.by === "condition" ? null : seg(PERIODS.filter(function (x) { return x[0] !== "season" || slot === "home" || list.length; }), c.period || "season", function (p) { save({ period: p }); }, "Period")
        ].filter(Boolean)));
        if (c.by === "condition") {
          body.appendChild(el("div", { class: "k-art-conds" }, CONDS.map(function (k) {
            var cur = (c.conds || {})[k[0]] || "";
            var sel = el("select", { class: "k-input k-input--sm", "aria-label": k[1] + ": picture" },
              [el("option", { value: "", text: "Off" })].concat(list.map(function (p) { return el("option", { value: p.id, text: p.name }); })));
            sel.value = cur;
            sel.addEventListener("change", function () { var cs = Object.assign({}, c.conds || {}); cs[k[0]] = sel.value || null; save({ conds: cs }); });
            return el("div", { class: "k-art-cond" }, [el("div", {}, [el("b", { text: k[1] }), el("small", { class: "k-muted", text: k[2] })]), sel]);
          })));
          body.appendChild(el("p", { class: "k-muted k-art-small", text: "A condition that holds beats the time rule; the higher row wins. Otherwise the season decides." }));
        } else {
          body.appendChild(el("div", { class: "k-art-thumbs" }, list.map(function (p) { return thumb(p, A.pick(slot) === p.id, null); })));
        }
      } else if (c.mode === "own") {
        var mine = A.ownOf(slot);
        if (!A.canUpload(slot)) {
          var it = KOS.governor.item(S.area);
          body.appendChild(el("div", { class: "k-art-lock", "data-ui": "art.lock" }, [
            el("span", { class: "k-art-lock-k", lang: "ja", "aria-hidden": "true", text: "錠" }),
            el("div", {}, [el("b", { text: "Your own picture" }), el("small", { class: "k-muted", text: "Upload a picture for this slot. A picture you set before stays." })]),
            el("div", { class: "k-art-lock-p" }, [el("b", { class: "k-mono", text: "◈ " + KOS.ui.num(it ? it.price : 3000) }), el("small", { class: "k-muted", text: "or every area ◈ " + KOS.ui.num((KOS.governor.item("upload-all") || {}).price || 0) })]),
            el("button", { type: "button", class: "k-btn k-btn--sm", text: "Open in the shop", onclick: function () { close(); KOS.show("governor", "shop"); } })
          ]));
        } else {
          body.appendChild(el("div", { class: "k-cluster" }, [
            el("button", { type: "button", class: "k-btn k-btn--sm", "data-intent": "primary", text: mine ? "Change or position" : "Upload a picture", onclick: function () {
              KOS.imageCrop.open({ title: "Your own picture · " + S.name, description: "Drag the focal point; the slot keeps it at every width.",
                source: mine ? mine.src : "", crop: mine ? mine.crop : null, aspect: S.aspect, allowUpload: true,
                fileOptions: { maxWidth: 1920, maxHeight: 1200, maxBytes: 620 * 1024, quality: 0.82 },
                onSave: function (r) { A.setOwn(slot, { src: r.source, crop: r.crop }, function () { paint(); KOS.rerender && KOS.rerender(); }); } });
            } }),
            mine ? el("button", { type: "button", class: "k-btn k-btn--sm k-btn--quiet", text: "Remove", onclick: function () { A.setOwn(slot, null, function () { paint(); KOS.rerender && KOS.rerender(); }); } }) : null
          ].filter(Boolean)));
          body.appendChild(el("p", { class: "k-muted k-art-small", text: "Kept on this device, like every hero picture." }));
        }
      }
      body.appendChild(el("p", { class: "k-art-now", "data-ui": "art.now" }, [el("span", { "aria-hidden": "true", text: "◐ " }), A.explain(slot)]));
    }
    paint();
    KOS.ui.openDialog(overlay, { label: S.name });
  }
  KOS.artSlot = { open: open };
})();
