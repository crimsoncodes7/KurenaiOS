/* Kurenai OS — modules/achievementspage.js
   The Badge Wall (`#/achievements`): its sets, recent, showcase and titles,
   and a set's dialog, loaded on first use (page-achievements, 1F; the
   Governor's page loads it too). The medal, the earned toasts and pings and
   the Governor's Wall card stay at boot in js/modules/achievements.js. */
(function () {
  "use strict";
  var el = KOS.ui.el, store = KOS.store, K = KOS.achUI._k;
  function A() { return KOS.achievements; }
  var ART = K.ART, MON = K.MON, dateText = K.dateText, numText = K.numText, prefs = K.prefs, setPrefs = K.setPrefs, hueOf = K.hueOf, medal = K.medal, rimOf = K.rimOf, pips = K.pips, roman = K.roman, nameOf = K.nameOf, whatOf = K.whatOf, cap = K.cap, progressText = K.progressText, badgeName = K.badgeName, show = K.show;

  /* ================= the page ================= */
  var TABS = [["sets", "Sets"], ["recent", "Recent"], ["showcase", "Showcase"], ["titles", "Titles"]];
  KOS.views.achievements = function (main, arg) {
    KOS.shell.tree("none");
    var parts = String(arg || "").split("/"), cur = TABS.some(function (t) { return t[0] === parts[0]; }) ? parts[0] : "sets";
    var openSet = parts[0] === "set" ? parts[1] : null;
    var tabs = KOS.ui.tabs(TABS.map(function (t) {
      return { label: t[1], active: t[0] === cur, onSelect: function () { KOS.show("achievements", t[0]); } };
    }), { variant: "workspace", label: "Wall pages" });
    tabs.setAttribute("data-phone-tabs", "");
    /* the record moved to the Governor's Seat (35a); the Wall is the sets */
    main.appendChild(KOS.ui.pageHeader({ kicker: "‹ Governor", title: "The Wall", sub: "Badges for what you've done. They light up as you go; none of them pay.", actions: [tabs] }));
    var kick = main.querySelector("[data-ui~='ui.page-kicker'], .k-kicker");
    if (kick) { kick.setAttribute("role", "link"); kick.setAttribute("tabindex", "0"); kick.classList.add("k-kicker--link"); KOS.a11y.activate(kick, function () { KOS.show("governor"); }); }
    var root = el("div", { class: "k-ach", "data-ui": "ach.page", "data-page": cur });
    main.appendChild(root);
    var body = el("div", { class: "k-ach-body", "data-ui": "ach.body", "aria-busy": "true" }, [el("p", { class: "k-muted k-ach-wait", text: "Reading your records…" })]);
    root.appendChild(body);
    /* W2 (AX-27, AP-17): the badges are measured asynchronously; a Wall
       that was left meanwhile draws nothing and opens no dialog over the
       page you moved to */
    var live = KOS.view ? KOS.view.token() : function () { return body.isConnected; };
    var redraw = !!KOS.ui.redrawing;
    A().list(function (views) {
      if (!live()) return;
      body.removeAttribute("aria-busy");
      body.textContent = "";
      if (cur === "sets") drawSets(body, views);
      else if (cur === "recent") drawRecent(body, views);
      else if (cur === "showcase") drawShowcase(body, views);
      else drawTitles(body, views);
      /* a redraw of the Wall under an open set does not open it again */
      /* a set opened from its address opens once: a redraw never opens it
         again, and closing it puts the address back on the tab (AX-24) */
      if (openSet && A().set(openSet) && !redraw) openSetDialog(openSet, views, parts[2] || null, null, function () {
        if (KOS.router && KOS.router.replaceArg) KOS.router.replaceArg("achievements", undefined);
      });
    });
  };
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
    /* soon badges list at the end, before the hidden ones (35d) */
    var soon = open.filter(function (v) { return v.state === "soon"; });
    open = open.filter(function (v) { return v.state !== "soon"; });
    if (how === "near") open.sort(function (a, b) { return (a.full - b.full) || (b.p - a.p) || (a.def.name < b.def.name ? -1 : 1); });
    else if (how === "recent") open.sort(function (a, b) { return (b.lastAt || 0) - (a.lastAt || 0); });
    return open.concat(soon, hidden);
  }
  function toolbar(views, redraw) {
    var p = prefs();
    var sel = el("select", { class: "k-pill-select k-ach-filter", "data-ui": "ach.filter", "aria-label": "Show" },
      FILTERS.map(function (f) { var o = el("option", { value: f[0], text: f[1] }); if (f[0] === p.filter) o.selected = true; return o; }));
    sel.addEventListener("change", function () {
      setPrefs({ filter: sel.value }); redraw();
      var n = A().sets().filter(function (s) { return views.some(function (v) { return v.set === s.id && passes(v, sel.value); }); }).length;
      KOS.a11y.announce("Showing " + FILTERS.filter(function (f) { return f[0] === sel.value; })[0][1] + " · " + n + (n === 1 ? " set." : " sets."));
    });
    var sw = el("input", { type: "checkbox", class: "k-switch", "data-ui": "ach.list-view", "aria-label": "List view" });
    sw.checked = p.list;
    sw.addEventListener("change", function () { setPrefs({ list: sw.checked }); redraw(); });
    var c = A().counts();
    return el("div", { class: "k-ach-toolbar", "data-ui": "ach.toolbar" }, [
      /* AG-07 */
      el("span", { class: "k-ach-owned", "data-ui": "ach.earned-count" }, [el("span", { class: "k-muted", text: "Earned " }), el("b", { class: "k-mono", text: String(c.earned) }), el("span", { class: "k-mono k-muted", text: " / " + c.badges }),
        c.complete ? el("span", { class: "k-muted", text: " · " + c.complete + " complete" }) : null].filter(Boolean)),
      el("span", { class: "k-spacer" }),
      el("label", { class: "k-ach-switch" }, [el("span", { text: "List view" }), sw]),
      sel
    ]);
  }

  /* ---------------- Sets: two sections of painted panels (35b) ----------------
     Badges first, then Units and paths. From 1240 up the panels go two to a
     row; the first of each section runs the full width (and so does a last
     one left alone), so no section ends on an empty column. */
  function drawSets(body, views) {
    function redraw() { body.textContent = ""; drawSets(body, views); }
    body.appendChild(toolbar(views, redraw));
    var p = prefs();
    if (p.list) { body.appendChild(listView(views.filter(function (v) { return passes(v, p.filter); }), views, redraw)); return; }
    var all = A().sets(), shown = 0;
    [["Badges", function (s) { return s.id.indexOf("u-") !== 0; }], ["Units and paths", function (s) { return s.id.indexOf("u-") === 0; }]].forEach(function (sec) {
      var sets = all.filter(sec[1]);
      var nBadges = views.filter(function (v) { return sets.some(function (s) { return s.id === v.set; }); }).length;
      var panels = [];
      sets.forEach(function (s) {
        var vs = views.filter(function (v) { return v.set === s.id && passes(v, p.filter); });
        if (vs.length) panels.push(panel(s, vs, views));
      });
      if (!panels.length) return;
      shown += panels.length;
      panels[0].setAttribute("data-wide", "");
      if ((panels.length - 1) % 2 === 1) panels[panels.length - 1].setAttribute("data-wide", "");
      body.appendChild(el("div", { class: "k-ach-sec" }, [el("h2", { class: "k-ach-sec-t", text: sec[0] }),
        el("span", { class: "k-muted", text: sets.length + " sets · " + nBadges + " badges" })]));
      body.appendChild(el("div", { class: "k-ach-wall", "data-ui": "ach.wall" }, panels));
    });
    if (!shown) body.appendChild(KOS.ui.emptyState({ compact: true, title: "Nothing here", body: p.filter === "progress" ? "Nothing in progress yet." : "No badge matches this filter yet." }));
    else layWall(body);
  }
  /* spot art at the foot of the name column (35b): seven sets reuse a
     spot the app has; the others' (batch 28, app.ach.spot.<set>) show once
     imported and listed in KOS_ACH_ART */
  var SPOT = { study: "assets/creatives/img/cr.spot.log.webp", mind: "assets/creatives/img/cr.spot.rest.webp", creatives: "assets/creatives/img/cr.spot.portfolio.webp",
    routines: "assets/routines/img/routines.spot.alldone.webp", organised: "assets/routines/img/routines.spot.fresh.webp", goals: "assets/app/img/app.empty.money.webp", ink: "assets/app/img/app.empty.files.webp" };
  function spotOf(id) { return SPOT[id] || (ART["app.ach.spot." + id] ? "assets/app/img/app.ach.spot." + id + ".webp" : null); }
  function panel(s, vs, views) {
    var all = views.filter(function (v) { return v.set === s.id; });
    var owned = all.filter(function (v) { return v.tier > 0; }).length;
    var hasPano = s.pano && ART[s.pano];
    var pano = el("span", { class: "k-ach-pano", "aria-hidden": "true" }, [
      el("span", { class: "k-ach-pano-mark", lang: "ja", text: s.glyph })]);
    if (hasPano) {
      var img = el("img", { src: "assets/app/img/" + s.pano + ".webp", alt: "", loading: "lazy", decoding: "async" });
      img.addEventListener("error", function () { img.remove(); KOS.ui.state(node, "no-pano", true); });
      pano.appendChild(img);
    }
    var medals = el("span", { class: "k-ach-panel-medals", "data-n": String(vs.length) }, vs.map(function (v) {
      return medal(v, { px: 64, decorative: true });
    }));
    var node = el("button", { type: "button", class: "k-ach-panel", "data-ui": "ach.panel", "data-set": s.id,
      "aria-label": s.name + ", " + owned + " of " + all.length + " badges earned" + (s.soon ? ", soon" : "") + ". Open the set." }, [
      pano,
      el("span", { class: "k-ach-panel-name" }, [
        el("span", { class: "k-ach-kick", text: s.kicker || "" }),
        el("b", { text: s.name }),
        el("span", { class: "k-ach-panel-count" }, [el("span", { class: "k-mono", text: String(owned) }), el("span", { class: "k-mono k-muted", text: " / " + all.length })])
      ]),
      spotOf(s.id) ? el("img", { class: "k-ach-spot", src: spotOf(s.id), alt: "", loading: "lazy", "aria-hidden": "true" }) : null,
      medals
    ].filter(Boolean));
    if (!hasPano) KOS.ui.state(node, "no-pano", true);
    node.style.setProperty("--set-hue", "var(" + s.hue + ")");
    node.addEventListener("click", function () { openSetDialog(s.id, views, null, node); });
    return node;
  }
  /* THE LAY (35b, wall-gen-a fit/lay): the row count, 1–4, that gives the
     largest medal (cap 88, never under 44); every second column dropped
     half a medal; a partial last row centred. Under 44 the panel grows
     instead: up to six to a row (the phone's panel). */
  function pipH(s) { return s >= 200 ? 21 : s >= 110 ? 15 : s >= 80 ? 12 : s >= 52 ? 10 : 9; }
  function fit(n, W, H, cap) {
    var best = null;
    for (var r = 1; r <= 4; r++) {
      var c = Math.ceil(n / r);
      for (var sz = cap; sz >= 28; sz--) {
        var gx = Math.max(8, sz * 0.18), gy = Math.max(6, sz * 0.12), off = r === 1 ? sz * 0.42 : sz * 0.5;
        if (c * (sz + gx) <= W && r * (sz + pipH(sz) + gy) + off <= H) { if (!best || sz > best.s) best = { r: r, c: c, s: sz, gy: gy, off: off }; break; }
      }
    }
    return best;
  }
  function layPanel(box, W, H, phone) {
    var kids = Array.prototype.slice.call(box.children), n = kids.length;
    if (!n || W <= 0) return;
    var L = phone ? null : fit(n, W, H, 88);
    if (!L || L.s < 44) {
      var cap = phone ? 58 : 64, c = Math.min(n, 6), sz = cap;
      while (sz > 40 && c * (sz + Math.max(8, sz * 0.18)) > W) sz--;
      while (c > 1 && sz < 44) { c--; sz = cap; while (sz > 40 && c * (sz + Math.max(8, sz * 0.18)) > W) sz--; }
      L = { r: Math.ceil(n / c), c: c, s: sz, gy: Math.max(6, sz * 0.12), off: sz * 0.5 };
      H = L.r * (L.s + pipH(L.s) + L.gy) + L.off;
      box.style.setProperty("--lay-h", H + "px");
    }
    /* filled a column at a time: a column holds L.r medals one row pitch
       apart, so no two ever meet; every second column drops half a medal,
       and a short last column is centred on its own. (Centring a short last
       ROW by half a column broke the stagger and stacked medals on top of
       each other.) Columns sit at most 1.75 medals apart, the group centred,
       so a set of four does not scatter across the panel. */
    var c = Math.ceil(n / L.r), cw = Math.min(W / c, L.s * 1.75), x0 = (W - c * cw) / 2, rh = L.s + pipH(L.s) + L.gy, used = L.r * rh - L.gy + (c > 1 ? L.off : 0), top = Math.max(0, (H - used) / 2);
    kids.forEach(function (m, i) {
      var col = Math.floor(i / L.r), row = i % L.r, k = Math.min(L.r, n - col * L.r);
      var dy = k < L.r ? (L.r - k) * rh / 2 + (c > 1 ? L.off / 2 : 0) : col % 2 ? L.off : 0;
      m.style.setProperty("--m", L.s + "px");
      m.setAttribute("data-rim", rimOf(L.s));
      m.style.setProperty("--x", (x0 + col * cw + (cw - L.s) / 2).toFixed(1) + "px");
      m.style.setProperty("--y", (top + row * rh + dy).toFixed(1) + "px");
    });
  }
  function layWall(body) {
    function run() {
      Array.prototype.forEach.call(body.querySelectorAll(".k-ach-panel-medals"), function (box) {
        box.style.removeProperty("--lay-h");
        var phone = box.offsetParent ? getComputedStyle(box).getPropertyValue("--ach-lay").trim() === "cols" : false;
        layPanel(box, box.clientWidth || 400, box.clientHeight || 248, phone);
      });
    }
    run();
    if (window.ResizeObserver) {
      var last = 0, ro = new ResizeObserver(function () {
        if (!body.isConnected) { ro.disconnect(); return; }
        var w = body.clientWidth; if (w === last) return; last = w; run();
      });
      ro.observe(body);
    }
  }

  /* ---------------- the list view (35d) ---------------- */
  var SORTS = [["set", "By set"], ["near", "Nearest to done"], ["recent", "Recently earned"]];
  function listView(vs, views, redraw) {
    var p = prefs();
    var rows = sortViews(vs, p.sort);
    var sort = KOS.ui.tabs(SORTS.map(function (x) {
      return { label: x[1], active: x[0] === p.sort, onSelect: function () { setPrefs({ sort: x[0] }); redraw(); KOS.a11y.announce("Sorted " + x[1].toLowerCase() + "."); } };
    }), { variant: "workspace", label: "Sort", className: "k-seg--quiet" });
    sort.setAttribute("data-ui", sort.getAttribute("data-ui") + " ach.sort");
    var wrap = el("div", { class: "k-ach-listwrap" }, [el("div", { class: "k-ach-sortrow" }, [el("span", { class: "k-muted", text: "Sort" }), sort, el("span", { class: "k-spacer" }), el("span", { class: "k-muted", text: rows.length + " shown" })])]);
    if (!rows.length) { wrap.appendChild(KOS.ui.emptyState({ compact: true, title: "Nothing here", body: p.filter === "progress" ? "Nothing in progress yet." : "No badge matches this filter yet." })); return wrap; }
    var list = el("ul", { class: "k-card k-ach-list", "data-ui": "ach.list", "aria-label": "Badges" });
    rows.forEach(function (v) {
      var s = A().set(v.set);
      var bar = el("span", { class: "k-bar k-ach-bar", "aria-hidden": "true" }, [el("i")]);
      bar.style.setProperty("--p", Math.round(100 * (v.masked ? 0 : v.full ? 1 : v.p)) + "%");
      var li = el("li", { class: "k-ach-row", "data-ui": "ach.row", "data-state": v.state }, [
        el("button", { type: "button", class: "k-ach-row-btn", "aria-label": "Open " + badgeName(v), onclick: openFor(v, views) }, [
          medal(v, { size: "row", decorative: true }),
          el("span", { class: "k-ach-row-txt" }, [
            el("b", { text: badgeName(v) }),
            el("span", { class: "k-ach-row-sub" }, [v.masked ? "It shows itself once it is earned · " : whatOf(v) + " · ", el("span", { class: "k-ach-row-set", text: s ? s.name : "" })])
          ]),
          v.masked ? el("span") : v.state === "soon" ? el("span", { class: "k-muted k-ach-row-num", text: "Not released yet" })
            : el("span", { class: "k-ach-row-prog" }, [bar, el("span", { class: "k-mono k-ach-row-num", text: progressText(v) })]),
          el("span", { class: "k-ach-row-date" + (v.tier && !v.masked ? "" : " k-muted"), text: v.masked ? "—" : v.tier ? (v.tiers > 1 ? roman(v.tier) + " · " : "") + shortDate(v.lastAt || v.at) : "Not yet" })
        ])
      ]);
      li.style.setProperty("--set-hue", hueOf(v.def));
      list.appendChild(li);
    });
    wrap.appendChild(list);
    return wrap;
  }
  function shortDate(ts) { var d = new Date(ts); return d.getDate() + " " + MON[d.getMonth()]; }

  /* ---------------- Recent: the tiers earned, newest first ---------------- */
  function drawRecent(body, views) {
    var byId = {}; views.forEach(function (v) { byId[v.id] = v; });
    var rows = A().earnedIn("0000-01-01", "9999-12-31").reverse().slice(0, 60);
    if (!rows.length) { body.appendChild(KOS.ui.emptyState({ title: "No badges yet", body: "The first one is never far: a Focus session, ten reviews, a week of days." })); return; }
    var list = el("ul", { class: "k-card k-ach-list", "data-ui": "ach.recent", "aria-label": "Recently earned" });
    rows.forEach(function (r) {
      var v = byId[r.id]; if (!v) return;
      var s = A().set(v.set);
      var li = el("li", { class: "k-ach-row", "data-state": "earned" }, [
        el("button", { type: "button", class: "k-ach-row-btn", "aria-label": "Open " + v.def.name, onclick: openFor(v, views) }, [
          medal(v, { size: "row", tier: r.tier, decorative: true }),
          el("span", { class: "k-ach-row-txt" }, [el("b", { text: badgeName(v, r.tier) }),
            el("span", { class: "k-ach-row-sub" }, [v.def.what + " · ", el("span", { class: "k-ach-row-set", text: s ? s.name : "" })])]),
          el("span"),
          el("span", { class: "k-ach-row-date", text: dateText(r.at) })
        ])
      ]);
      li.style.setProperty("--set-hue", hueOf(v.def));
      list.appendChild(li);
    });
    body.appendChild(list);
  }

  /* ---------------- the showcase (35e): the tray, then every earned badge ----------------
     The same six as the Governor's Seat; Save is the only commit. */
  function slot(v, i, onRemove) {
    return v ? el("button", { type: "button", class: "k-ach-slot", "data-ui": "ach.slot", "aria-label": "Take " + badgeName(v) + " out of the showcase", onclick: onRemove }, [medal(v, { size: "sm", pips: false, decorative: true })])
      : el("span", { class: "k-ach-slot", "data-empty": "", "aria-hidden": "true" });
  }
  function showcasePicker(views, opts) {
    opts = opts || {};
    var byId = {}; views.forEach(function (v) { byId[v.id] = v; });
    var earned = views.filter(function (v) { return v.tier > 0 && !v.masked; }).sort(function (a, b) { return (b.lastAt || 0) - (a.lastAt || 0); });
    var pick = (opts.initial || A().showcase()).filter(function (id) { return byId[id]; });
    var tray = el("div", { class: "k-ach-tray", "data-ui": "ach.tray", "aria-label": "Your showcase" });
    var order = el("ol", { class: "k-ach-order", "data-ui": "ach.order", "aria-label": "Showcase order" });
    var count = el("span", { class: "k-mono k-ach-pickn", "data-ui": "ach.pick-count" });
    var grid = el("div", { class: "k-ach-pickgrid", "data-ui": "ach.pick", role: "group", "aria-label": "Earned badges" });
    function paint() {
      tray.textContent = ""; order.textContent = "";
      for (var i = 0; i < A().SHOWCASE_MAX; i++) {
        (function (id) { tray.appendChild(slot(id && byId[id], i, function () { toggle(id); })); })(pick[i]);
      }
      pick.forEach(function (id, i) {
        var v = byId[id]; if (!v) return;
        var n = badgeName(v);
        order.appendChild(el("li", { class: "k-ach-order-row", "data-rid": id, "data-ui": "ach.order-row" }, [
          el("button", { type: "button", class: "k-grip", "data-reorder": "", "aria-label": "Move " + n, title: "Drag · Space lifts", text: "⠿" }),
          el("span", { class: "k-mono k-ach-order-n", text: String(i + 1) }),
          el("span", { class: "k-ach-order-t k-ellipsis", text: n }),
          i ? null : el("span", { class: "k-muted k-ach-order-lead", text: "leads" })
        ].filter(Boolean)));
      });
      count.textContent = pick.length + " of " + A().SHOWCASE_MAX;
      Array.prototype.forEach.call(grid.children, function (b) { b.setAttribute("aria-pressed", String(pick.indexOf(b.getAttribute("data-id")) >= 0)); });
      if (opts.onChange) opts.onChange(pick.slice());
    }
    KOS.ui.reorder(order, { rows: "[data-rid]", label: function (r) { var v = byId[r.getAttribute("data-rid")]; return v ? badgeName(v) : "Badge"; },
      onDrop: function () { pick = [].map.call(order.querySelectorAll("[data-rid]"), function (n) { return n.getAttribute("data-rid"); }); paint(); } });
    function toggle(id) {
      var i = pick.indexOf(id), v = byId[id];
      if (i >= 0) pick.splice(i, 1);
      else if (pick.length < A().SHOWCASE_MAX) pick.push(id);
      else { KOS.ui.state(count, "shake", false); void count.offsetWidth; KOS.ui.state(count, "shake", true); KOS.a11y.announce("Six at most — remove one first."); KOS.ui.toast("Six at most — remove one first."); return; }
      paint();
      KOS.a11y.announce(badgeName(v) + (i >= 0 ? " removed, " : " added, ") + pick.length + " of " + A().SHOWCASE_MAX + ".");
    }
    earned.forEach(function (v) {
      grid.appendChild(el("button", { type: "button", class: "k-ach-pick", "data-id": v.id, "data-ui": "ach.pick-item", onclick: function () { toggle(v.id); } }, [
        medal(v, { px: opts.small ? 44 : 64, decorative: true, pips: !opts.small }), opts.small ? null : el("span", { text: badgeName(v) })
      ].filter(Boolean)));
    });
    paint();
    return { tray: tray, order: order, count: count, grid: grid, earned: earned, get: function () { return pick.slice(); },
      clear: function () { pick = []; paint(); } };
  }
  function drawShowcase(body, views) {
    var ord = null;
    var pk = showcasePicker(views, { onChange: function (ids) { if (ord) ord.hidden = !ids.length; } });
    var save = el("button", { type: "button", class: "k-btn k-btn--primary", "data-ui": "ach.save-showcase", "data-intent": "primary", text: "Save",
      onclick: function () { A().setShowcase(pk.get()); KOS.ui.toast("Showcase saved."); KOS.a11y.announce("Showcase saved."); } });
    body.appendChild(el("section", { class: "k-card k-ach-traycard" }, [
      pk.tray,
      el("span", { class: "k-spacer" }),
      el("div", { class: "k-ach-traycount" }, [pk.count, el("span", { class: "k-muted", text: "tap a medal to add or remove it" })]),
      el("button", { type: "button", class: "k-btn", "data-ui": "ach.clear-showcase", text: "Clear", onclick: pk.clear }),
      save
    ]));
    ord = el("section", { class: "k-card k-ach-ordercard", "data-ui": "ach.order-card", hidden: pk.get().length ? null : "" }, [
      el("div", { class: "k-card-head" }, [el("span", { class: "k-card-title", text: "Showcase order" }), el("span", { class: "k-card-meta", text: "drag or Space + ↑↓" })]),
      pk.order
    ]);
    body.appendChild(ord);
    /* AG-25: the picks are a draft until Save — a background change waits
       for it, and leaving with it unsaved asks first (as Edit seat does) */
    function unsaved() { return JSON.stringify(pk.get()) !== JSON.stringify(A().showcase()); }
    if (KOS.view) {
      KOS.view.hold(unsaved);
      KOS.view.guard(function () { return unsaved() ? { title: "Leave without saving?", body: "Your changes to the showcase have not been saved." } : null; });
    }
    if (!pk.earned.length) { body.appendChild(KOS.ui.emptyState({ compact: true, title: "Nothing earned yet", body: "Earn a badge to show it here." })); return; }
    body.appendChild(el("div", { class: "k-ach-sec" }, [el("h2", { class: "k-ach-sec-t", text: "Earned" }), el("span", { class: "k-muted", text: pk.earned.length + " badges, newest first" })]));
    body.appendChild(pk.grid);
  }

  /* ---------------- Titles (35e): plaques cut from each set's panorama ---------------- */
  function titleInfo(t, byId) {
    var d = A().def(t.badge), v = byId[t.badge], s = d && A().set(d.set);
    var need = v && d ? (v.thresholds || [])[t.tier - 1] : null;
    var p = t.unlocked ? 1 : v && !v.masked && v.state !== "soon" ? (v.tier >= t.tier ? 1 : v.tier === t.tier - 1 ? v.p : 0) : 0;
    return { t: t, d: d, v: v, s: s, need: need, p: p, soon: !!(v && v.state === "soon") };
  }
  function plaque(x, o) {
    o = o || {};
    var s = x.s || {}, u = x.t.unlocked;
    var node = el(o.big ? "div" : "button", { type: o.big ? null : "button", class: "k-ach-plaque", "data-ui": o.big ? null : "ach.title-opt",
      "data-on": u ? "" : null, "data-big": o.big ? "" : null, "aria-pressed": o.big ? null : String(!!o.selected),
      "aria-label": o.big ? null : x.t.name + (u ? (o.equipped ? ", equipped" : ", unlocked") : ", locked") }, [
      s.pano && ART[s.pano] ? el("img", { src: "assets/app/img/" + s.pano + ".webp", alt: "", loading: "lazy", "aria-hidden": "true" }) : null,
      el("span", { class: "k-ach-plaque-wash", "aria-hidden": "true" }),
      o.big ? null : el("span", { class: "k-ach-plaque-glyph", lang: "ja", "aria-hidden": "true", text: s.glyph || "章" }),
      el("span", { class: "k-ach-plaque-t" }, [
        el("span", { class: "k-ach-plaque-name", text: x.t.name }),
        u || o.big ? null : el("span", { class: "k-mono k-ach-plaque-lock", text: x.soon ? "SOON" : "LOCKED · " + ((x.d ? x.d.name : "") + " " + roman(x.t.tier)).toUpperCase() })
      ].filter(Boolean)),
      o.equipped && !o.big ? el("span", { class: "k-chip k-ach-plaque-chip", text: "Equipped" }) : null
    ].filter(Boolean));
    node.style.setProperty("--set-hue", s.hue ? "var(" + s.hue + ")" : "var(--gold)");
    return node;
  }
  function drawTitles(body, views) {
    var byId = {}; views.forEach(function (v) { byId[v.id] = v; });
    var all = A().titles().map(function (t) { return titleInfo(t, byId); });
    var cur = A().title(), f = "all", sel = (cur && cur.id) || null;
    var ok = all.filter(function (x) { return x.t.unlocked; }).length;
    var grid = el("div", { class: "k-ach-plaques", "data-ui": "ach.titles", role: "group", "aria-label": "Titles" });
    var side = el("aside", { class: "k-card k-ach-tdetail", "data-ui": "ach.title-detail", "aria-live": "polite" });
    var seg = KOS.ui.tabs([["all", "All"], ["unlocked", "Unlocked"], ["locked", "Locked"]].map(function (x) {
      return { label: x[1], active: x[0] === f, onSelect: function () { f = x[0]; paint(); } };
    }), { variant: "workspace", label: "Show titles", className: "k-seg--quiet" });
    body.appendChild(el("div", { class: "k-ach-toolbar" }, [
      el("span", { class: "k-ach-owned" }, [el("span", { class: "k-muted", text: "Collected " }), el("b", { class: "k-mono", text: String(ok) }), el("span", { class: "k-mono k-muted", text: " / " + all.length })]),
      el("span", { class: "k-spacer" }), seg, el("span", { class: "k-muted k-ach-sortnote", text: "Nearest first" })
    ]));
    body.appendChild(el("div", { class: "k-ach-titlelay" }, [grid, side]));
    function paint() {
      cur = A().title();
      var rows = all.filter(function (x) { return f === "all" || (f === "unlocked") === x.t.unlocked; })
        .sort(function (a, b) { return (b.t.unlocked - a.t.unlocked) || (b.p - a.p) || (a.t.name < b.t.name ? -1 : 1); });
      grid.textContent = "";
      rows.forEach(function (x) {
        var b = plaque(x, { selected: x.t.id === sel, equipped: cur && cur.id === x.t.id });
        b.addEventListener("click", function () { sel = x.t.id; paint(); });
        grid.appendChild(b);
      });
      if (!rows.length) grid.appendChild(KOS.ui.emptyState({ compact: true, body: f === "unlocked" ? "No title unlocked yet." : "Every title is unlocked." }));
      if (!sel && rows[0]) { sel = rows[0].t.id; grid.firstChild.setAttribute("aria-pressed", "true"); }
      detail(all.filter(function (x) { return x.t.id === sel; })[0]);
    }
    function detail(x) {
      side.textContent = "";
      if (!x) return;
      var v = x.v, s = x.s || {}, u = x.t.unlocked, equipped = cur && cur.id === x.t.id;
      side.appendChild(plaque(x, { big: true }));
      side.appendChild(el("div", {}, [el("h3", { class: "k-ach-td-name", text: x.t.name }),
        el("div", { class: "k-ach-td-set", text: (s.name || "") + " · " + (x.d ? x.d.name : "") + " " + roman(x.t.tier) })]));
      if (x.d) side.appendChild(el("p", { class: "k-ach-td-what", text: x.d.what + "." }));
      side.appendChild(el("div", { class: "k-kicker", text: "Requirement" }));
      if (v) {
        var bar = el("span", { class: "k-bar k-ach-bar", "aria-hidden": "true" }, [el("i")]);
        bar.style.setProperty("--p", Math.round(100 * x.p) + "%");
        side.appendChild(el("div", { class: "k-ach-td-req" }, [
          medal(v, { px: 64, tier: x.t.tier, pips: false, decorative: true }),
          el("div", { class: "k-ach-td-reqt" }, [
            el("b", { text: x.d.name + " " + roman(x.t.tier) + (x.need != null ? " · " + numText(x.need) + (x.d.unit ? " " + x.d.unit : "") : "") }),
            bar,
            el("span", { class: "k-mono k-muted", text: u ? "Unlocked" : x.soon ? "Not released yet" : v.masked ? "Hidden until earned" : progressText(v) + (v.tier ? " · " + roman(v.tier) + " earned " + shortDate(v.lastAt || v.at) : "") })
          ])
        ]));
      }
      side.appendChild(el("div", { class: "k-ach-td-acts" }, [
        u ? el("button", { type: "button", class: "k-btn" + (equipped ? "" : " k-btn--primary"), "data-ui": "ach.title-equip", text: equipped ? "Take it off" : "Equip",
          onclick: function () { A().setTitle(equipped ? null : x.t.id); KOS.a11y.announce(equipped ? "No title." : "Title set to " + x.t.name + "."); paint(); } })
          : el("button", { type: "button", class: "k-btn", disabled: "", text: "Not unlocked yet" }),
        x.d ? el("button", { type: "button", class: "k-btn", text: "Open the badge", onclick: function () { openSetDialog(x.d.set, views, x.d.id); } }) : null
      ].filter(Boolean)));
      var next = all.filter(function (y) { return !y.t.unlocked && y.p > 0 && y.t.id !== x.t.id; }).sort(function (a, b) { return b.p - a.p; }).slice(0, 3);
      if (next.length) {
        side.appendChild(el("div", { class: "k-kicker", text: "Next closest" }));
        next.forEach(function (y) {
          var b2 = el("span", { class: "k-bar k-ach-bar", "aria-hidden": "true" }, [el("i")]);
          b2.style.setProperty("--p", Math.round(100 * y.p) + "%");
          b2.style.setProperty("--set-hue", y.s ? "var(" + y.s.hue + ")" : "var(--gold)");
          side.appendChild(el("div", { class: "k-ach-td-next" }, [el("span", {}, [el("i", { class: "k-ach-td-nt", text: y.t.name }), " · " + (y.d ? y.d.name + " " + roman(y.t.tier) : "")]),
            el("span", { class: "k-mono k-muted", text: y.v ? progressText(y.v) : "" }), b2]));
        });
      }
      side.style.setProperty("--set-hue", s.hue ? "var(" + s.hue + ")" : "var(--gold)");
    }
    paint();
  }

  /* ---------------- a set opened: the carousel (35c) ---------------- */
  function openSetDialog(setId, views, startId, returnTo, onClose) {
    var s = A().set(setId); if (!s) return;
    var vs = sortViews(views.filter(function (v) { return v.set === setId; }), "set");
    if (!vs.length) return;
    var i = Math.max(0, vs.map(function (v) { return v.id; }).indexOf(startId));
    var overlay = el("div", { class: "k-dialog-overlay" });
    var box = el("div", { class: "k-dialog k-ach-dlg", "data-ui": "ui.dialog ach.set-dialog" });
    box.style.setProperty("--set-hue", "var(" + s.hue + ")");
    overlay.appendChild(box);
    var stage = el("div", { class: "k-ach-dlg-stage" });
    var strip = el("div", { class: "k-ach-dlg-strip", role: "group", "aria-label": s.name });
    var counter = el("span", { class: "k-mono k-ach-dlg-n" });
    function tierText(v, k) {
      if (v.masked) return "";
      if (k <= v.tier) return "Earned " + dateText((v.earned.t && v.earned.t[k]) || v.at);
      if (k === v.tier + 1) return v.state === "soon" ? "Not released yet" : progressText(v);
      return "Not yet";
    }
    function paint(say) {
      var v = vs[i];
      stage.textContent = "";
      stage.appendChild(el("h3", { class: "k-ach-dlg-name", "data-masked": v.masked ? "" : null, text: nameOf(v) }));
      stage.appendChild(el("p", { class: "k-ach-dlg-what", text: v.masked ? "Hidden badge — it shows itself once it is earned" : whatOf(v) }));
      var tiers = el("div", { class: "k-ach-dlg-tiers", role: "list", "data-n": String(v.masked ? 1 : v.tiers) });
      var n = v.masked ? 1 : v.tiers;
      for (var k = 1; k <= n; k++) {
        var st = k <= v.tier ? "earned" : k === v.tier + 1 ? "progress" : "later";
        tiers.appendChild(el("div", { class: "k-ach-dlg-tier", role: "listitem", "data-state": st }, [
          medal(v, { size: "md", tier: v.masked ? null : k, pips: false }),
          v.masked ? null : el("span", { class: "k-ach-dlg-tier-t" }, [
            el("b", { class: "k-mono", text: (v.tiers > 1 ? roman(k) + " · " : "") + numText(v.thresholds[k - 1]) + (v.def.unit ? " " + v.def.unit : "") }),
            el("span", { class: "k-ach-dlg-tier-s", text: tierText(v, k) })
          ])
        ].filter(Boolean)));
      }
      stage.appendChild(tiers);
      if (!v.masked && v.def.title) {
        var tt = A().titles().filter(function (t) { return t.badge === v.id; })[0];
        if (tt) stage.appendChild(el("p", { class: "k-ach-dlg-titlenote" }, ["Tier " + roman(tt.tier) + " unlocks the title ", el("i", { text: tt.name }), "."]));
      }
      counter.textContent = (i + 1) + " / " + vs.length;
      Array.prototype.forEach.call(strip.children, function (b, j) { b.setAttribute("aria-current", j === i ? "true" : "false"); });
      if (say) {
        var line = nameOf(v) + ", " + (i + 1) + " of " + vs.length + ".";
        if (!v.masked && v.tier) line += " Tier " + roman(v.tier) + " earned.";
        if (!v.masked && !v.full && v.state !== "soon") line += " " + (v.tiers > 1 ? "Tier " + roman(v.tier + 1) + ", " : "") + progressText(v) + ".";
        KOS.a11y.announce(line);
      }
    }
    vs.forEach(function (v, j) {
      strip.appendChild(el("button", { type: "button", class: "k-ach-dlg-chip", "aria-label": nameOf(v), onclick: function () { i = j; paint(true); } }, [medal(v, { size: "xs", pips: false, decorative: true })]));
    });
    function step(n) { i = (i + n + vs.length) % vs.length; paint(true); }
    box.appendChild(el("div", { class: "k-dialog-head", "data-ui": "ui.dialog-head" }, [
      el("div", { class: "k-ach-dlg-titles" }, [
        el("div", { class: "k-ach-kick", text: s.kicker || "" }),
        el("h2", { class: "k-dialog-title", "data-ui": "ui.dialog-title", text: s.name })
      ]),
      el("button", { type: "button", class: "k-iconbtn", "data-ui": "ui.dialog-close", "aria-label": "Close", text: "✕", onclick: function () { overlay.close ? overlay.close() : overlay.remove(); } })
    ]));
    box.appendChild(el("div", { class: "k-dialog-body k-ach-dlg-body" }, [
      el("button", { type: "button", class: "k-ach-dlg-nav", "aria-label": "Previous badge", text: "‹", onclick: function () { step(-1); } }),
      stage,
      el("button", { type: "button", class: "k-ach-dlg-nav", "aria-label": "Next badge", text: "›", onclick: function () { step(1); } })
    ]));
    box.appendChild(el("div", { class: "k-dialog-foot k-ach-dlg-foot" }, [strip, counter]));
    box.addEventListener("keydown", function (e) {
      if (e.target && /^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
      if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
    });
    /* a swipe on the stage moves too (the phone's sheet) */
    var x0 = null;
    stage.addEventListener("pointerdown", function (e) { x0 = e.clientX; });
    stage.addEventListener("pointerup", function (e) { if (x0 != null && Math.abs(e.clientX - x0) > 48) step(e.clientX < x0 ? 1 : -1); x0 = null; });
    paint(false);
    KOS.ui.openDialog(overlay, { label: s.name, returnFocus: returnTo || null, onClose: onClose || null });
  }

  Object.assign(KOS.achUI, { openSet: openSetDialog, showcasePicker: showcasePicker, titleInfo: titleInfo });
})();
