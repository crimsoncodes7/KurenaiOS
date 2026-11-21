/* Kurenai OS — modules/achievements.js
   The Badge Wall's BOOT PART (1F): the medal, the earned toasts and pings and
   the Governor's Wall card; the Wall itself is js/modules/achievementspage.js
   (page-achievements). The Badge Wall (roadmap 5.16, docs/achievements-plan.md; invariants
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
  /* a medal of 96 CSS px or less reads the 192 px copy (1F; tools/gen_badge_small.py),
     which covers it at a pixel ratio of 2; the 120 and 208 px medals the 384 px art */
  var SMALL_MAX = 96;
  function artSrc(d, px) {
    if (!(d && d.art && ART[d.art])) return null;
    return "assets/app/img/" + (px && px <= SMALL_MAX ? "sm/" : "") + d.art + ".webp";
  }
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
    var size = o.px ? null : o.size || "md";
    var src = v.masked ? null : artSrc(d, o.px || SIZE_PX[size] || 88);
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

  function badgeName(v, tier) {
    if (v.masked) return "Hidden badge";
    var t = tier || v.tier;
    return v.def.name + (v.tiers > 1 && t ? " " + roman(t) : "");
  }

  /* ================= the unlock overlay (invariant 163) ================= */
  var queue = [], showing = false, holdTimer = null;
  function celebrate(changes) {
    (changes || []).forEach(function (c) { queue.push(c); });
    drain();
  }
  function drain() {
    if (showing || !queue.length) return;
    if (A().quiet(true)) { if (!holdTimer) holdTimer = setTimeout(function () { holdTimer = null; drain(); }, 20000); return; }
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
      el("span", { class: "k-card-meta", text: c.earned + " of " + c.badges + " badges earned" + (t ? " · " + t.name : "") }),
      el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "gov.wall-open", text: "Open the Wall", onclick: function () { KOS.show("achievements"); } })
    ]));
    card.appendChild(tray);
    var ids = A().showcase();
    if (!ids.length) tray.appendChild(el("span", { class: "k-muted", text: c.earned ? "Pick six badges to show here on the Wall's Showcase." : "Your badges will gather here." }));
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

  KOS.achUI = { medal: medal, progressText: progressText, celebrate: celebrate, ping: ping, governorCard: governorCard, boot: boot, artSrc: artSrc, badgeName: badgeName };
  /* what the Wall's page (js/modules/achievementspage.js, page-achievements, 1F) reads */
  KOS.achUI._k = { ART: ART, MON: MON, dateText: dateText, numText: numText, prefs: prefs, setPrefs: setPrefs, hueOf: hueOf, medal: medal, rimOf: rimOf, pips: pips, roman: roman, nameOf: nameOf, whatOf: whatOf, cap: cap, progressText: progressText, badgeName: badgeName, show: show };
})();
