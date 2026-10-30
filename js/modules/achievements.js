/* Kurenai OS — modules/achievements.js
   The Badge Wall (roadmap 5.16, docs/achievements-plan.md; invariants
   161–163), after Reverse: 1999's "Fourth Wall": a record of your time at
   the top, then each SET as a panel with its medallions laid across it, a
   set opened as a carousel of its badges and their tiers, a list view, the
   tiers earned lately, the showcase and the titles.

   THE LIGHT is one picture and five looks, all CSS (`--p` on the medal):
   locked (grey, dim), in progress (colour and brightness rising with p, a
   rim ring filling to p), nearly (p ≥ 0.9, the rim breathes), earned (full
   colour, a sweep of light once) and hidden (a silhouette until earned).
   A badge with no art yet is the set's own enamel disc with its glyph.

   Pages only READ (smoke56): drawing the Wall measures, never writes. The
   overlay and the ping read what evaluate() returned; neither interrupts a
   running Focus session, the Exam Room or a dialog (invariant 163).      */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var el = KOS.ui.el, store = KOS.store;
  function A() { return KOS.achievements; }
  var ART = {};
  (window.KOS_ACH_ART || []).forEach(function (id) { ART[id] = true; });
  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function dateText(ts) { var d = new Date(ts); return d.getDate() + " " + MON[d.getMonth()] + " " + d.getFullYear(); }
  function numText(n) { return n == null ? "–" : (Math.round(n * 10) / 10).toLocaleString("en-GB"); }
  function U() { var ui = store.state.ui || (store.state.ui = {}); return ui; }
  function prefs() { var p = (store.state.ui || {}).achView || {}; return { list: !!p.list, filter: p.filter || "all", sort: p.sort || "set" }; }
  function setPrefs(patch) { var ui = U(); ui.achView = Object.assign({}, prefs(), patch); store.save(); }

  /* ================= the medal ================= */
  function artSrc(d) { return d && d.art && ART[d.art] ? "assets/app/img/" + d.art + ".webp" : null; }
  function hueOf(d) { var s = d && A().set(d.set); return s ? "var(" + s.hue + ")" : "var(--crimson)"; }
  function glyphOf(d) { var s = d && A().set(d.set); return (d && d.glyph) || (s && s.glyph) || "章"; }
  /* medal(view, {size, pips, tier, label}) — `tier` draws one tier of a
     multi-tier badge (the carousel): earned up to the earned tier, the next
     at its progress, the rest locked */
  function medal(v, o) {
    o = o || {};
    var d = v.def, state = v.state, p = v.p;
    if (o.tier) {
      if (o.tier <= v.tier) { state = "earned"; p = 1; }
      else if (o.tier === v.tier + 1 && !v.masked && state !== "soon") { p = v.p; state = p >= 0.9 ? "nearly" : p > 0 ? "progress" : "locked"; }
      else { state = v.masked ? "hidden" : state === "soon" ? "soon" : "locked"; p = 0; }
    }
    var src = v.masked ? null : artSrc(d);
    var node = el("span", { class: "k-ach-medal", "data-ui": "ach.medal", "data-state": state, "data-size": o.size || "md",
      "data-gold": d.gold ? "" : null, role: o.decorative ? null : "img",
      "aria-hidden": o.decorative ? "true" : null,
      "aria-label": o.decorative ? null : (o.label || medalLabel(v, o.tier)) }, [
      el("span", { class: "k-ach-ring", "aria-hidden": "true" }),
      el("span", { class: "k-ach-disc", "aria-hidden": "true" }, [
        src ? el("img", { src: src, alt: "", loading: "lazy", decoding: "async", draggable: "false" })
          : el("span", { class: "k-ach-glyph", lang: "ja", text: v.masked ? "?" : glyphOf(d) })
      ]),
      el("span", { class: "k-ach-sweep", "aria-hidden": "true" })
    ]);
    node.style.setProperty("--p", String(Math.max(0, Math.min(1, p || 0))));
    /* the disc's light follows the whole climb — tiers earned plus the
       current one's progress — so a badge brightens tier by tier and is
       full only when complete; the rim ring keeps the current interval */
    var lp = o.tier ? (state === "earned" ? 1 : p || 0) : v.tiers ? ((v.tier || 0) + (v.full ? 0 : p || 0)) / v.tiers : p || 0;
    node.style.setProperty("--lp", String(Math.max(0, Math.min(1, v.full ? 1 : lp))));
    node.style.setProperty("--set-hue", hueOf(d));
    if (!src) KOS.ui.state(node, "uncast", true);
    if (o.pips !== false && v.tiers > 1 && !o.tier) node.appendChild(pips(v));
    return node;
  }
  function pips(v) {
    var row = el("span", { class: "k-ach-pips", "aria-hidden": "true" });
    for (var i = 1; i <= v.tiers; i++) row.appendChild(el("i", { "data-on": i <= v.tier ? "" : null, "data-metal": i === v.tiers ? "gold" : i === v.tiers - 1 ? "silver" : "bronze" }));
    return row;
  }
  function roman(n) { return A().roman(n); }
  function nameOf(v) { return v.masked ? "Hidden badge" : v.def.name; }
  function whatOf(v) { return v.masked ? "It shows itself once it is earned." : v.def.what; }
  function medalLabel(v, tier) {
    if (v.masked) return "Hidden badge, not yet earned";
    var t = tier ? " " + roman(tier) : v.tiers > 1 && v.tier ? " " + roman(v.tier) : "";
    return v.def.name + t + ", " + statusText(v, tier);
  }
  function statusText(v, tier) {
    if (v.masked) return "not yet earned";
    if (tier) {
      if (tier <= v.tier) return "earned " + dateText((v.earned.t && v.earned.t[tier]) || v.at);
      if (tier === v.tier + 1) return progressText(v);
      return "not yet";
    }
    if (v.full) return "earned " + dateText(v.lastAt || v.at);
    if (v.state === "soon") return "not released yet";
    return progressText(v);
  }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  function progressText(v) {
    if (v.masked) return "";
    if (v.full) return "Complete";
    if (v.state === "soon") return "Not released yet";
    if (v.next == null) return v.value == null ? "No evidence yet" : numText(v.value) + (v.def.unit ? " " + v.def.unit : "");
    return numText(v.value == null ? 0 : v.value) + " / " + numText(v.next) + (v.def.unit ? " " + v.def.unit : "");
  }

  /* ================= the page ================= */
  var TABS = [["sets", "Sets"], ["recent", "Recent"], ["showcase", "Showcase"], ["titles", "Titles"]];
  KOS.views.achievements = function (main, arg) {
    KOS.shell.tree("none");
    var parts = String(arg || "").split("/"), cur = TABS.some(function (t) { return t[0] === parts[0]; }) ? parts[0] : "sets";
    var openSet = parts[0] === "set" ? parts[1] : null;
    var tabs = KOS.ui.tabs(TABS.map(function (t) {
      return { label: t[1], active: t[0] === cur, onSelect: function () { KOS.show("achievements", t[0]); } };
    }), { variant: "workspace", label: "Wall pages" });
    main.appendChild(KOS.ui.pageHeader({ kicker: "Governor", title: "The Wall", sub: "Badges for what you've done. They light up as you go; none of them pay.", actions: [tabs] }));
    var root = el("div", { class: "k-ach", "data-ui": "ach.page", "data-page": cur });
    main.appendChild(root);
    root.appendChild(dossier());
    var body = el("div", { class: "k-ach-body", "data-ui": "ach.body", "aria-busy": "true" }, [el("p", { class: "k-muted k-ach-wait", text: "Reading your records…" })]);
    root.appendChild(body);
    A().list(function (views) {
      if (!body.isConnected && body.parentNode == null) return;
      body.removeAttribute("aria-busy");
      body.textContent = "";
      if (cur === "sets") drawSets(body, views);
      else if (cur === "recent") drawRecent(body, views);
      else if (cur === "showcase") drawShowcase(body, views);
      else drawTitles(body, views);
      fillTray(views);
      if (openSet && A().set(openSet)) openSetDialog(openSet, views, parts[2] || null);
    });
  };

  /* ---------------- the record (after R1999's Career Overview) ---------------- */
  var trayNode = null;
  function dossier() {
    var gov = store.state.governor || {}, info = KOS.governor.levelInfo(gov.xp || 0), c = A().counts(), life = A().lifetime();
    var t = A().title(), since = +store.state.created;
    var card = el("section", { class: "k-card k-ach-dossier", "data-ui": "ach.dossier", "aria-label": "Your record" });
    card.appendChild(el("div", { class: "k-ach-id" }, [
      el("span", { class: "k-ach-avatar" }, [KOS.governor.avatarNode(84)]),
      el("div", { class: "k-ach-id-txt" }, [
        el("div", { class: "k-kicker", text: "The record" }),
        el("h2", { class: "k-ach-id-name", text: "Level " + info.level }),
        t ? el("div", { class: "k-ach-id-title", "data-ui": "ach.title", text: t.name }) : null,
        since > 0 ? el("div", { class: "k-muted k-ach-id-since", text: "First day " + dateText(since) }) : null
      ].filter(Boolean))
    ]));
    card.appendChild(el("div", { class: "k-ach-stats" }, [
      KOS.ui.statTile({ label: "Days journeyed", value: life.days, suppressZero: true }),
      KOS.ui.statTile({ label: "Badges", value: c.owned + " / " + c.badges }),
      KOS.ui.statTile({ label: "Tiers", value: c.tiers + " / " + c.tiersTotal }),
      KOS.ui.statTile({ label: "Hours of focus", value: Math.floor(life.focusSecs / 3600), suppressZero: true })
    ].filter(Boolean)));
    trayNode = el("div", { class: "k-ach-tray", "data-ui": "ach.tray", "aria-label": "Your showcase" });
    card.appendChild(el("div", { class: "k-ach-tray-row" }, [
      trayNode,
      el("div", { class: "k-ach-tray-count" }, [el("span", { class: "k-muted", text: "Achievements" }), el("b", { class: "k-mono", text: String(c.tiers) })]),
      el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "ach.edit-showcase", text: "Edit showcase", onclick: function () { KOS.show("achievements", "showcase"); } })
    ]));
    return card;
  }
  function fillTray(views) {
    if (!trayNode) return;
    trayNode.textContent = "";
    var byId = {}; views.forEach(function (v) { byId[v.id] = v; });
    var ids = A().showcase();
    for (var i = 0; i < A().SHOWCASE_MAX; i++) {
      var v = ids[i] && byId[ids[i]];
      trayNode.appendChild(v ? el("button", { type: "button", class: "k-ach-slot", "data-ui": "ach.slot", onclick: openFor(v, views) }, [medal(v, { size: "sm", pips: false })])
        : el("span", { class: "k-ach-slot", "data-empty": "", "aria-hidden": "true" }));
    }
  }
  function openFor(v, views) { return function () { openSetDialog(v.set, views, v.id); }; }

  /* ---------------- filters and sorting (hidden never leaks) ---------------- */
  var FILTERS = [["all", "All"], ["earned", "Earned"], ["progress", "In progress"], ["locked", "Locked"], ["study", "Study"], ["productivity", "Productivity"], ["collection", "Collection"], ["app", "The app"]];
  function passes(v, f) {
    if (f === "all") return true;
    if (f === "earned") return v.tier > 0;
    if (f === "progress") return !v.full && !v.masked && v.state !== "soon" && (v.tier > 0 || v.p > 0);
    if (f === "locked") return !v.tier && !(v.p > 0);
    var s = A().set(v.set); return !!s && s.area === f;
  }
  function sortViews(list, how) {
    var hidden = list.filter(function (v) { return v.masked; }), open = list.filter(function (v) { return !v.masked; });
    if (how === "near") open.sort(function (a, b) { return (a.full - b.full) || (b.p - a.p) || (a.def.name < b.def.name ? -1 : 1); });
    else if (how === "recent") open.sort(function (a, b) { return (b.lastAt || 0) - (a.lastAt || 0); });
    return open.concat(hidden);
  }
  function toolbar(views, redraw) {
    var p = prefs();
    var sel = el("select", { class: "k-pill-select k-ach-filter", "data-ui": "ach.filter", "aria-label": "Show" },
      FILTERS.map(function (f) { var o = el("option", { value: f[0], text: f[1] }); if (f[0] === p.filter) o.selected = true; return o; }));
    sel.addEventListener("change", function () { setPrefs({ filter: sel.value }); redraw(); });
    var sw = el("input", { type: "checkbox", class: "k-switch", "data-ui": "ach.list-view", "aria-label": "List view" });
    sw.checked = p.list;
    sw.addEventListener("change", function () { setPrefs({ list: sw.checked }); redraw(); });
    var bits = [el("label", { class: "k-ach-switch" }, [el("span", { text: "List view" }), sw]), sel];
    if (p.list) {
      var so = el("select", { class: "k-pill-select", "data-ui": "ach.sort", "aria-label": "Sort" },
        [["set", "By set"], ["near", "Nearest to done"], ["recent", "Recently earned"]].map(function (x) { var o = el("option", { value: x[0], text: x[1] }); if (x[0] === p.sort) o.selected = true; return o; }));
      so.addEventListener("change", function () { setPrefs({ sort: so.value }); redraw(); });
      bits.push(so);
    }
    var c = A().counts();
    return el("div", { class: "k-ach-toolbar", "data-ui": "ach.toolbar" }, [
      el("span", { class: "k-ach-owned" }, [el("span", { class: "k-muted", text: "Owned " }), el("b", { class: "k-mono", text: c.owned + " / " + c.badges })]),
      el("div", { class: "k-ach-tools" }, bits)
    ]);
  }

  /* ---------------- Sets: one panel per set ---------------- */
  function drawSets(body, views) {
    function redraw() { body.textContent = ""; drawSets(body, views); }
    body.appendChild(toolbar(views, redraw));
    var p = prefs();
    if (p.list) { body.appendChild(listView(views.filter(function (v) { return passes(v, p.filter); }), p.sort, views)); return; }
    var wall = el("div", { class: "k-ach-wall", "data-ui": "ach.wall" });
    var shown = 0;
    A().sets().forEach(function (s) {
      var vs = views.filter(function (v) { return v.set === s.id && passes(v, p.filter); });
      if (!vs.length) return;
      shown++;
      wall.appendChild(panel(s, vs, views));
    });
    body.appendChild(shown ? wall : KOS.ui.emptyState({ compact: true, title: "Nothing here", body: "No badge matches this filter yet." }));
  }
  function panel(s, vs, views) {
    var all = views.filter(function (v) { return v.set === s.id; });
    var owned = all.filter(function (v) { return v.full; }).length;
    var size = vs.length <= 6 ? "md" : vs.length <= 14 ? "base" : "row";
    var node = el("button", { type: "button", class: "k-ach-panel", "data-ui": "ach.panel", "data-set": s.id, "data-size": size,
      "aria-label": s.name + ", " + owned + " of " + all.length + " badges complete. Open the set." }, [
      el("span", { class: "k-ach-pano", "aria-hidden": "true" }, [
        s.pano && ART[s.pano] ? el("img", { src: "assets/app/img/" + s.pano + ".webp", alt: "", loading: "lazy" }) : el("span", { class: "k-ach-pano-mark", lang: "ja", text: s.glyph })
      ]),
      el("span", { class: "k-ach-panel-name" }, [
        el("span", { class: "k-kicker", text: s.kicker || "" }),
        el("b", { text: s.name }),
        el("span", { class: "k-mono k-ach-panel-count", text: owned + " / " + all.length })
      ]),
      el("span", { class: "k-ach-panel-medals" }, vs.map(function (v, i) {
        var m = medal(v, { size: size, decorative: true });
        if (i % 2) KOS.ui.state(m, "low", true);
        return m;
      }))
    ]);
    node.style.setProperty("--set-hue", "var(" + s.hue + ")");
    node.addEventListener("click", function () { openSetDialog(s.id, views, null); });
    return node;
  }

  /* ---------------- the list view ---------------- */
  function listView(vs, sort, views) {
    var rows = sortViews(vs, sort);
    if (!rows.length) return KOS.ui.emptyState({ compact: true, title: "Nothing here", body: "No badge matches this filter yet." });
    var list = el("ul", { class: "k-card k-ach-list", "data-ui": "ach.list", "aria-label": "Badges" });
    rows.forEach(function (v) {
      var s = A().set(v.set);
      var bar = el("span", { class: "k-bar k-ach-bar", "aria-hidden": "true" }, [el("i")]);
      bar.style.setProperty("--p", Math.round(100 * (v.masked ? 0 : v.p)) + "%");
      bar.style.setProperty("--set-hue", hueOf(v.def));
      list.appendChild(el("li", { class: "k-ach-row", "data-ui": "ach.row", "data-state": v.state }, [
        el("button", { type: "button", class: "k-ach-row-btn", "aria-label": "Open " + nameOf(v), onclick: openFor(v, views) }, [medal(v, { size: "row", decorative: true })]),
        el("div", { class: "k-ach-row-txt" }, [
          el("b", { text: nameOf(v) + (v.tier && v.tiers > 1 && !v.masked ? " " + roman(v.tier) : "") }),
          el("span", { class: "k-muted", text: v.masked ? "Hidden · " + (s ? s.name : "") : whatOf(v) + (s ? " · " + s.name : "") })
        ]),
        el("div", { class: "k-ach-row-prog" }, [bar, el("span", { class: "k-mono k-ach-row-num", text: v.masked ? "?" : progressText(v) })]),
        el("span", { class: "k-mono k-muted k-ach-row-date", text: v.tier && !v.masked ? dateText(v.lastAt || v.at) : "" })
      ]));
    });
    return list;
  }

  /* ---------------- Recent: the tiers earned, newest first ---------------- */
  function drawRecent(body, views) {
    var byId = {}; views.forEach(function (v) { byId[v.id] = v; });
    var rows = A().earnedIn("0000-01-01", "9999-12-31").reverse().slice(0, 60);
    if (!rows.length) { body.appendChild(KOS.ui.emptyState({ title: "No badges yet", body: "The first one is never far: a Focus session, ten reviews, a week of days." })); return; }
    var list = el("ul", { class: "k-card k-ach-list", "data-ui": "ach.recent", "aria-label": "Recently earned" });
    rows.forEach(function (r) {
      var v = byId[r.id]; if (!v) return;
      list.appendChild(el("li", { class: "k-ach-row", "data-state": "earned" }, [
        el("button", { type: "button", class: "k-ach-row-btn", "aria-label": "Open " + v.def.name, onclick: openFor(v, views) }, [medal(v, { size: "row", tier: r.tier, decorative: true })]),
        el("div", { class: "k-ach-row-txt" }, [el("b", { text: v.def.name + (v.tiers > 1 ? " " + roman(r.tier) : "") }), el("span", { class: "k-muted", text: v.def.what })]),
        el("span", { class: "k-mono k-muted k-ach-row-date", text: dateText(r.at) })
      ]));
    });
    body.appendChild(list);
  }

  /* ---------------- the showcase (six slots) and titles ---------------- */
  function drawShowcase(body, views) {
    var earned = views.filter(function (v) { return v.tier > 0; });
    var pick = A().showcase();
    var count = el("span", { class: "k-mono", "data-ui": "ach.pick-count" });
    function paintCount() { count.textContent = pick.length + " of " + A().SHOWCASE_MAX; }
    paintCount();
    var save = el("button", { type: "button", class: "k-btn k-btn--primary", "data-ui": "ach.save-showcase", "data-intent": "primary", text: "Save the showcase",
      onclick: function () { A().setShowcase(pick); KOS.ui.toast("Showcase saved."); KOS.a11y.announce("Showcase saved."); fillTray(views); } });
    body.appendChild(KOS.ui.sectionHeader({ title: "Showcase", sub: "Pick up to six earned badges for your record and the Governor's seat", actions: [count, save] }));
    if (!earned.length) { body.appendChild(KOS.ui.emptyState({ compact: true, title: "Nothing earned yet", body: "Earned badges can be shown here." })); return; }
    var grid = el("div", { class: "k-ach-pickgrid", "data-ui": "ach.pick", role: "group", "aria-label": "Earned badges" });
    earned.forEach(function (v) {
      var b = el("button", { type: "button", class: "k-ach-pick", "aria-pressed": String(pick.indexOf(v.id) >= 0), "data-ui": "ach.pick-item" }, [
        medal(v, { size: "base", decorative: true }), el("span", { text: v.def.name + (v.tiers > 1 ? " " + roman(v.tier) : "") })
      ]);
      b.addEventListener("click", function () {
        var i = pick.indexOf(v.id);
        if (i >= 0) pick.splice(i, 1);
        else if (pick.length < A().SHOWCASE_MAX) pick.push(v.id);
        else { KOS.ui.toast("Six at most: take one out first."); return; }
        b.setAttribute("aria-pressed", String(pick.indexOf(v.id) >= 0));
        paintCount();
      });
      grid.appendChild(b);
    });
    body.appendChild(grid);
  }
  function drawTitles(body) {
    var ts = A().titles(), cur = A().title();
    body.appendChild(KOS.ui.sectionHeader({ title: "Titles", sub: "Shown under your level. Earned from a badge's third tier, with a few exceptions" }));
    var list = el("div", { class: "k-card k-ach-titles", role: "radiogroup", "aria-label": "Your title", "data-ui": "ach.titles" });
    function row(id, name, ok, need) {
      var on = (cur ? cur.id : null) === id;
      var b = el("button", { type: "button", role: "radio", "aria-checked": String(on), class: "k-ach-title", "data-ui": "ach.title-opt", disabled: ok ? null : "" }, [
        el("b", { text: name }), need ? el("span", { class: "k-muted", text: need }) : null
      ].filter(Boolean));
      if (ok) b.addEventListener("click", function () { A().setTitle(id); KOS.a11y.announce(id ? "Title set: " + name + "." : "No title."); KOS.rerender(); });
      return b;
    }
    list.appendChild(row(null, "No title", true, null));
    ts.forEach(function (t) {
      var d = A().def(t.badge);
      list.appendChild(row(t.id, t.name, t.unlocked, t.unlocked ? null : (d ? d.name + " " + roman(t.tier) : "")));
    });
    body.appendChild(list);
  }

  /* ---------------- a set opened: the carousel ---------------- */
  function openSetDialog(setId, views, startId) {
    var s = A().set(setId); if (!s) return;
    var vs = views.filter(function (v) { return v.set === setId; });
    vs = sortViews(vs, "set");
    if (!vs.length) return;
    var i = Math.max(0, vs.map(function (v) { return v.id; }).indexOf(startId));
    var overlay = el("div", { class: "k-dialog-overlay" });
    var box = el("div", { class: "k-dialog k-ach-dlg", "data-ui": "ui.dialog ach.set-dialog" });
    box.style.setProperty("--set-hue", "var(" + s.hue + ")");
    overlay.appendChild(box);
    var stage = el("div", { class: "k-ach-dlg-stage", "aria-live": "polite" });
    var strip = el("div", { class: "k-ach-dlg-strip", role: "group", "aria-label": s.name });
    var counter = el("span", { class: "k-mono k-muted k-ach-dlg-n" });
    function paint() {
      var v = vs[i];
      stage.textContent = "";
      stage.appendChild(el("h3", { class: "k-ach-dlg-name", text: nameOf(v) }));
      stage.appendChild(el("p", { class: "k-ach-dlg-what", text: whatOf(v) }));
      var tiers = el("div", { class: "k-ach-dlg-tiers" });
      for (var k = 1; k <= v.tiers; k++) {
        tiers.appendChild(el("div", { class: "k-ach-dlg-tier" }, [
          medal(v, { size: v.tiers > 2 ? "md" : "lg", tier: k }),
          el("span", { class: "k-ach-dlg-tier-t" }, [
            v.tiers > 1 ? el("b", { text: roman(k) + (v.masked ? "" : " · " + numText(v.thresholds[k - 1]) + (v.def.unit ? " " + v.def.unit : "")) }) : null,
            el("span", { class: "k-muted", text: cap(statusText(v, k)) })
          ].filter(Boolean))
        ]));
      }
      stage.appendChild(tiers);
      if (!v.masked && v.def.title) {
        var tt = A().titles().filter(function (t) { return t.badge === v.id; })[0];
        if (tt) stage.appendChild(el("p", { class: "k-muted k-ach-dlg-titlenote", text: "Tier " + roman(tt.tier) + " unlocks the title “" + tt.name + "”." }));
      }
      counter.textContent = (i + 1) + " / " + vs.length;
      Array.prototype.forEach.call(strip.children, function (b, j) { b.setAttribute("aria-current", j === i ? "true" : "false"); });
    }
    vs.forEach(function (v, j) {
      strip.appendChild(el("button", { type: "button", class: "k-ach-dlg-chip", "aria-label": nameOf(v), onclick: function () { i = j; paint(); } }, [medal(v, { size: "xs", pips: false, decorative: true })]));
    });
    function step(n) { i = (i + n + vs.length) % vs.length; paint(); }
    box.appendChild(el("div", { class: "k-dialog-head", "data-ui": "ui.dialog-head" }, [
      el("h2", { class: "k-dialog-title", "data-ui": "ui.dialog-title", text: s.name }),
      el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "ui.dialog-close", "aria-label": "Close", text: "Close", onclick: function () { overlay.remove(); } })
    ]));
    box.appendChild(el("div", { class: "k-dialog-body k-ach-dlg-body" }, [
      el("button", { type: "button", class: "k-btn k-ach-dlg-nav", "aria-label": "Previous badge", text: "‹", onclick: function () { step(-1); } }),
      stage,
      el("button", { type: "button", class: "k-btn k-ach-dlg-nav", "aria-label": "Next badge", text: "›", onclick: function () { step(1); } })
    ]));
    box.appendChild(el("div", { class: "k-dialog-foot k-ach-dlg-foot" }, [strip, counter]));
    box.addEventListener("keydown", function (e) {
      if (e.target && /^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
      if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
    });
    paint();
    KOS.ui.openDialog(overlay, { label: s.name });
  }

  /* ================= the unlock overlay (invariant 163) ================= */
  var queue = [], showing = false, holdTimer = null;
  function celebrate(changes) {
    (changes || []).forEach(function (c) { queue.push(c); });
    drain();
  }
  function drain() {
    if (showing || !queue.length) return;
    if (A().quiet()) { if (!holdTimer) holdTimer = setTimeout(function () { holdTimer = null; drain(); }, 20000); return; }
    var batch = queue.splice(0, queue.length);
    A().list(function (views) {
      var byId = {}; views.forEach(function (v) { byId[v.id] = v; });
      var items = batch.map(function (c) { return { c: c, v: byId[c.id] }; }).filter(function (x) { return x.v; });
      if (items.length) show(items);
    }, { ids: batch.map(function (c) { return c.id; }) });
  }
  function show(items) {
    showing = true;
    var i = 0, rest = items.length > 5 ? items.slice(4) : [];
    if (rest.length) items = items.slice(0, 4);
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var overlay = el("div", { class: "k-dialog-overlay k-ach-unlock-overlay" });
    var box = el("div", { class: "k-dialog k-ach-unlock", "data-ui": "ui.dialog ach.unlock", "data-reduce": reduce ? "" : null });
    overlay.appendChild(box);
    var stage = el("div", { class: "k-ach-unlock-stage" });
    var nextBtn = el("button", { type: "button", class: "k-btn k-btn--primary", "data-ui": "ach.unlock-next", "data-intent": "primary" });
    var viewBtn = el("button", { type: "button", class: "k-btn", "data-ui": "ach.unlock-view", text: "View on the Wall" });
    function close() { overlay.remove(); }
    function paint() {
      stage.textContent = "";
      if (i >= items.length) { summary(); return; }
      var x = items[i], v = x.v, d = v.def;
      var m = medal(v, { size: "lg", tier: x.c.tier, label: d.name + (v.tiers > 1 ? " " + roman(x.c.tier) : "") + ", earned" });
      KOS.ui.state(m, "rising", !reduce);
      stage.appendChild(el("div", { class: "k-ach-unlock-burst", "aria-hidden": "true" }));
      stage.appendChild(m);
      stage.appendChild(el("div", { class: "k-ach-unlock-txt" }, [
        el("div", { class: "k-kicker", text: (A().set(d.set) || {}).name || "Badge earned" }),
        el("h2", { class: "k-ach-unlock-name", text: d.name + (v.tiers > 1 ? " " + roman(x.c.tier) : "") }),
        el("p", { class: "k-ach-unlock-what", text: d.hidden ? "A hidden badge, found." : tierLine(v, x.c.tier) }),
        items.length > 1 ? el("span", { class: "k-mono k-muted", text: (i + 1) + " of " + items.length + (rest.length ? " · and " + rest.length + " more" : "") }) : null
      ].filter(Boolean)));
      nextBtn.textContent = i < items.length - 1 || rest.length ? "Next" : "Close";
      viewBtn.onclick = function () { close(); KOS.show("achievements", "set/" + d.set + "/" + d.id); };
      KOS.a11y.announce("Badge earned: " + d.name + (v.tiers > 1 ? " " + roman(x.c.tier) : "") + ".");
    }
    function summary() {
      var left = rest.splice(0, rest.length);
      if (!left.length) { close(); return; }
      stage.appendChild(el("div", { class: "k-ach-unlock-txt" }, [
        el("h2", { class: "k-ach-unlock-name", text: "And " + left.length + " more" }),
        el("div", { class: "k-ach-unlock-row" }, left.map(function (x) { return medal(x.v, { size: "sm", tier: x.c.tier, pips: false }); }))
      ]));
      nextBtn.textContent = "Close";
      items = [];
    }
    nextBtn.onclick = function () { i++; if (i >= items.length && !rest.length) { close(); return; } paint(); };
    box.appendChild(stage);
    box.appendChild(el("div", { class: "k-ach-unlock-foot" }, [viewBtn, nextBtn]));
    paint();
    KOS.ui.openDialog(overlay, { label: "Badge earned", initialFocus: nextBtn, onClose: function () { showing = false; setTimeout(drain, 400); } });
  }
  function tierLine(v, tier) {
    var t = v.thresholds[tier - 1], u = v.def.unit;
    return v.tiers > 1 || (t && t > 1) ? numText(t) + (u ? " " + u : "") + " — " + v.def.what : v.def.what;
  }

  /* the silent first run's one summary (decision 3) */
  var retroShown = false;
  function retro(result) {
    var n = result.earned.length;
    if (!n || retroShown || A().quiet()) return;
    retroShown = true;
    n = A().counts().tiers;
    KOS.ui.toast("You already had " + n + " badge tier" + (n === 1 ? "" : "s") + " — they are on the Wall.", false,
      { label: "Open the Wall", run: function () { KOS.show("achievements"); } });
  }

  /* ================= the progress ping (top left) ================= */
  var pingBox = null, pingQ = [], pinging = false;
  function ping(pg) {
    if (A().quiet()) return;
    pingQ = pingQ.filter(function (x) { return x.id !== pg.id; });
    pingQ.unshift(pg);
    drainPing();
  }
  function drainPing() {
    if (pinging || !pingQ.length) return;
    var pg = pingQ.shift(), d = A().def(pg.id);
    if (!d) { drainPing(); return; }
    pinging = true;
    if (!pingBox || !pingBox.isConnected) { pingBox = el("div", { class: "k-ach-pings", "data-ui": "ach.pings", "aria-hidden": "true" }); document.body.appendChild(pingBox); }
    var v = { def: d, state: pg.p >= 0.9 ? "nearly" : "progress", p: pg.p0, tiers: d.tiers.length, tier: 0, masked: false };
    var m = medal(v, { size: "sm", pips: false, decorative: true });
    var bar = el("span", { class: "k-bar k-ach-bar", "aria-hidden": "true" }, [el("i")]);
    bar.style.setProperty("--p", Math.round(100 * pg.p0) + "%");
    bar.style.setProperty("--set-hue", hueOf(d));
    var text = numText(pg.to) + " / " + numText(pg.next) + (d.unit ? " " + d.unit : "");
    var node = el("div", { class: "k-ach-ping", "data-ui": "ach.ping" }, [m, el("div", { class: "k-ach-ping-txt" }, [el("b", { text: d.name }), el("span", { class: "k-mono", text: text }), bar])]);
    pingBox.appendChild(node);
    KOS.a11y.announce(d.name + ": " + text + ".");
    var later = window.requestAnimationFrame || function (f) { return setTimeout(f, 16); };
    later(function () { later(function () {
      m.style.setProperty("--p", String(pg.p));
      bar.style.setProperty("--p", Math.round(100 * pg.p) + "%");
      KOS.ui.state(node, "in", true);
    }); });
    setTimeout(function () {
      KOS.ui.state(node, "in", false);
      setTimeout(function () { node.remove(); pinging = false; drainPing(); }, 300);
    }, 3200);
  }

  /* ================= the Governor's card ================= */
  function governorCard() {
    var c = A().counts(), t = A().title();
    var card = el("section", { class: "k-card k-ach-gov", "data-ui": "gov.wall", "aria-label": "The Wall" });
    var tray = el("div", { class: "k-ach-tray" });
    card.appendChild(el("div", { class: "k-card-head" }, [
      el("span", { class: "k-card-title", text: "The Wall" }),
      el("span", { class: "k-card-meta", text: c.owned + " of " + c.badges + " badges" + (t ? " · " + t.name : "") }),
      el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "gov.wall-open", text: "Open the Wall", onclick: function () { KOS.show("achievements"); } })
    ]));
    card.appendChild(tray);
    var ids = A().showcase();
    if (!ids.length) tray.appendChild(el("span", { class: "k-muted", text: c.owned ? "Pick six badges to show here on the Wall's Showcase." : "Your badges will gather here." }));
    else A().list(function (views) {
      views.forEach(function (v) { tray.appendChild(el("span", { class: "k-ach-slot" }, [medal(v, { size: "sm", pips: false })])); });
    }, { ids: ids });
    return card;
  }

  /* ================= wiring ================= */
  function boot() {
    if (!A()) return;
    A().onChange(function (r) {
      if (!r) return;
      /* the Wall on screen redraws with what was just earned (a redraw, not
         navigation; the overlay sits above it) */
      if (r.earned.length && KOS.router && /^#\/achievements/.test(location.hash || "")) setTimeout(function () { KOS.rerender(); }, 0);
      if (r.silent) { retro(r); return; }
      r.earned.forEach(function (c) { A().notify(c); });
      if (r.earned.length) celebrate(r.earned);
      var now = Date.now();
      r.pings.forEach(function (pg) { if (A().pingAllowed(pg, now)) ping(pg); });
    });
    A().start();
    document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible") setTimeout(drain, 800); });
    window.addEventListener("hashchange", function () { setTimeout(drain, 600); });
  }

  KOS.achUI = { medal: medal, progressText: progressText, celebrate: celebrate, ping: ping, governorCard: governorCard, openSet: openSetDialog, boot: boot, artSrc: artSrc };
})();
