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
    var size = o.px ? null : o.size || "md";
    var node = el("span", { class: "k-ach-medal", "data-ui": "ach.medal", "data-state": state, "data-size": size, "data-rim": rimOf(o.px || SIZE_PX[size] || 88),
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
    if (o.px) node.style.setProperty("--m", o.px + "px");
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
  /* the rim's width follows the size (35·medal): 3 px at 44, 4 at 88,
     5 at 120, 6 at 208 — named sizes and the panels' laid sizes alike */
  var SIZE_PX = { xs: 32, sm: 44, row: 52, base: 88, md: 120, lg: 208 };
  function rimOf(px) { return px >= 200 ? "lg" : px >= 110 ? "md" : px >= 80 ? "base" : "sm"; }
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
    tabs.setAttribute("data-phone-tabs", "");
    /* the record moved to the Governor's Seat (35a); the Wall is the sets */
    main.appendChild(KOS.ui.pageHeader({ kicker: "‹ Governor", title: "The Wall", sub: "Badges for what you've done. They light up as you go; none of them pay.", actions: [tabs] }));
    var kick = main.querySelector("[data-ui~='ui.page-kicker'], .k-kicker");
    if (kick) { kick.setAttribute("role", "link"); kick.setAttribute("tabindex", "0"); kick.classList.add("k-kicker--link"); KOS.a11y.activate(kick, function () { KOS.show("governor"); }); }
    var root = el("div", { class: "k-ach", "data-ui": "ach.page", "data-page": cur });
    main.appendChild(root);
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
      if (openSet && A().set(openSet)) openSetDialog(openSet, views, parts[2] || null);
    });
  };
  function openFor(v, views) { return function () { openSetDialog(v.set, views, v.id); }; }
  function badgeName(v, tier) {
    if (v.masked) return "Hidden badge";
    var t = tier || v.tier;
    return v.def.name + (v.tiers > 1 && t ? " " + roman(t) : "");
  }

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
      el("span", { class: "k-ach-owned" }, [el("span", { class: "k-muted", text: "Owned " }), el("b", { class: "k-mono", text: String(c.owned) }), el("span", { class: "k-mono k-muted", text: " / " + c.badges })]),
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
    var count = el("span", { class: "k-mono k-ach-pickn", "data-ui": "ach.pick-count" });
    var grid = el("div", { class: "k-ach-pickgrid", "data-ui": "ach.pick", role: "group", "aria-label": "Earned badges" });
    function paint() {
      tray.textContent = "";
      for (var i = 0; i < A().SHOWCASE_MAX; i++) {
        (function (id) { tray.appendChild(slot(id && byId[id], i, function () { toggle(id); })); })(pick[i]);
      }
      count.textContent = pick.length + " of " + A().SHOWCASE_MAX;
      Array.prototype.forEach.call(grid.children, function (b) { b.setAttribute("aria-pressed", String(pick.indexOf(b.getAttribute("data-id")) >= 0)); });
      if (opts.onChange) opts.onChange(pick.slice());
    }
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
    return { tray: tray, count: count, grid: grid, earned: earned, get: function () { return pick.slice(); },
      clear: function () { pick = []; paint(); } };
  }
  function drawShowcase(body, views) {
    var pk = showcasePicker(views);
    var save = el("button", { type: "button", class: "k-btn k-btn--primary", "data-ui": "ach.save-showcase", "data-intent": "primary", text: "Save",
      onclick: function () { A().setShowcase(pk.get()); KOS.ui.toast("Showcase saved."); KOS.a11y.announce("Showcase saved."); } });
    body.appendChild(el("section", { class: "k-card k-ach-traycard" }, [
      pk.tray,
      el("span", { class: "k-spacer" }),
      el("div", { class: "k-ach-traycount" }, [pk.count, el("span", { class: "k-muted", text: "tap a medal to add or remove it" })]),
      el("button", { type: "button", class: "k-btn", "data-ui": "ach.clear-showcase", text: "Clear", onclick: pk.clear }),
      save
    ]));
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
  function openSetDialog(setId, views, startId, returnTo) {
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
    KOS.ui.openDialog(overlay, { label: s.name, returnFocus: returnTo || null });
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
      stage.style.setProperty("--set-hue", hueOf(d));
      stage.appendChild(el("div", { class: "k-ach-kick k-ach-unlock-kick", text: (A().set(d.set) || {}).name || "Badge earned" }));
      stage.appendChild(el("div", { class: "k-ach-unlock-burst", "aria-hidden": "true" }));
      stage.appendChild(m);
      stage.appendChild(el("div", { class: "k-ach-unlock-txt" }, [
        el("h2", { class: "k-ach-unlock-name", text: d.name + (v.tiers > 1 ? " " + roman(x.c.tier) : "") }),
        el("p", { class: "k-ach-unlock-what", text: d.hidden ? "A hidden badge, found." : tierLine(v, x.c.tier) }),
        items.length > 1 || rest.length ? el("span", { class: "k-mono k-muted", text: (i + 1) + " of " + (items.length + (rest.length ? 1 : 0)) }) : null
      ].filter(Boolean)));
      nextBtn.textContent = i < items.length - 1 || rest.length ? "Next" : "Close";
      viewBtn.onclick = function () { close(); KOS.show("achievements", "set/" + d.set + "/" + d.id); };
      KOS.ui.state(box, "skip", false);
      KOS.a11y.announce("Badge earned: " + d.name + (v.tiers > 1 ? ", tier " + ["", "one", "two", "three", "four", "five"][x.c.tier] : "") + ". " + ((A().set(d.set) || {}).name || "") + ".", { assertive: true });
    }
    function summary() {
      var left = rest.splice(0, rest.length);
      if (!left.length) { close(); return; }
      stage.appendChild(el("div", { class: "k-ach-unlock-txt" }, [
        el("div", { class: "k-kicker", text: (items.length + 1) + " of " + (items.length + 1) }),
        el("h2", { class: "k-ach-unlock-name", text: "And " + left.length + " more" }),
        el("div", { class: "k-ach-unlock-row" }, left.map(function (x) {
          return el("div", { class: "k-ach-unlock-mini" }, [medal(x.v, { px: 64, tier: x.c.tier, pips: false }), el("span", { text: badgeName(x.v, x.c.tier) })]);
        }))
      ]));
      nextBtn.textContent = "Close";
      items = [];
    }
    nextBtn.onclick = function () { i++; if (i >= items.length && !rest.length) { close(); return; } paint(); };
    box.appendChild(stage);
    box.appendChild(el("div", { class: "k-ach-unlock-foot" }, [viewBtn, nextBtn]));
    /* any key or tap skips to the finished frame */
    function skip() { KOS.ui.state(box, "skip", true); }
    overlay.addEventListener("pointerdown", skip);
    box.addEventListener("keydown", function (e) { if (e.key !== "Tab" && e.key !== "Enter" && e.key !== " ") skip(); });
    paint();
    KOS.ui.openDialog(overlay, { label: "Badge earned", initialFocus: nextBtn, onClose: function () { showing = false; setTimeout(drain, 400); } });
  }
  function tierLine(v, tier) {
    var t = v.thresholds[tier - 1], u = v.def.unit;
    var what = v.def.what ? v.def.what.charAt(0).toLowerCase() + v.def.what.slice(1) : "";
    return v.tiers > 1 || (t && t > 1) ? numText(t) + (u ? " " + u : "") + " · " + what : v.def.what;
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
    var node = el("div", { class: "k-ach-ping", "data-ui": "ach.ping" }, [m, el("div", { class: "k-ach-ping-txt" }, [
      el("div", { class: "k-ach-ping-row" }, [el("b", { text: d.name }), el("span", { class: "k-mono", text: text })]), bar])]);
    node.style.setProperty("--set-hue", hueOf(d));
    /* clicking opens the set at that badge; hovering holds it */
    node.addEventListener("click", function () { leave(); KOS.show("achievements", "set/" + d.set + "/" + d.id); });
    node.addEventListener("mouseenter", function () { clearTimeout(timer); });
    node.addEventListener("mouseleave", function () { timer = setTimeout(leave, 1200); });
    pingBox.appendChild(node);
    KOS.a11y.announce(d.name + ": " + text + ".");
    var later = window.requestAnimationFrame || function (f) { return setTimeout(f, 16); };
    later(function () { later(function () {
      m.style.setProperty("--p", String(pg.p));
      bar.style.setProperty("--p", Math.round(100 * pg.p) + "%");
      KOS.ui.state(node, "in", true);
    }); });
    var gone = false, timer = setTimeout(leave, 3200);
    function leave() {
      if (gone) return; gone = true; clearTimeout(timer);
      KOS.ui.state(node, "in", false);
      setTimeout(function () { node.remove(); pinging = false; drainPing(); }, 300);
    }
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

  KOS.achUI = { medal: medal, progressText: progressText, celebrate: celebrate, ping: ping, governorCard: governorCard, openSet: openSetDialog, boot: boot, artSrc: artSrc,
    showcasePicker: showcasePicker, badgeName: badgeName, titleInfo: titleInfo };
})();
