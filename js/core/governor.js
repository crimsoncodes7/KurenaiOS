/* Kurenai OS — core/governor.js
   The Behavioural Governor: HP, gold, XP/level, avatar, and feature gating.

   Design contract (Build 2a):
   - HP gates ONLY the enrichment layer (labs, sims, gold shop). Spec reading,
     notes, personal notes, per-topic flashcards, quizzes and exam questions
     NEVER lock, at any HP.
   - Gold buys one-time permanent lab/sim unlocks + cosmetics. Worked examples,
     flashcards and quizzes are free forever.
   - XP is a pure progress metric — nothing gates on it except the default
     avatar seal library, which unlocks by level.                              */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var store = KOS.store;

  function G() { return store.state.governor; }
  function clamp(v) { return Math.max(0, Math.min(100, v)); }

  /* ================= HP ================= */
  var HP_STATE = [
    { id: "healthy",  min: 60, label: "Healthy",  desc: "Everything open." },
    { id: "strained", min: 30, label: "Strained", desc: "Labs, sims and the gold shop are suspended until HP recovers. Core revision never locks." },
    { id: "critical", min: 0,  label: "Critical", desc: "Recovery Mode: clear the checklist to climb back to Strained. Core revision never locks." }
  ];
  function hpState() {
    var hp = G().hp;
    return hp >= 60 ? "healthy" : hp >= 30 ? "strained" : "critical";
  }
  function hpStateInfo() {
    var id = hpState();
    return HP_STATE.find(function (s) { return s.id === id; });
  }

  var DAY_DRAIN = 15;        // per fully-missed day with zero session activity
  var BACKLOG_LIMIT = 30;    // due-queue size that starts hurting
  var BACKLOG_DRAIN = 10;    // once per day while over the limit

  /* Boot-time (and midnight-crossing) tick: apply drains for elapsed days. */
  function tick() {
    var g = G(), today = KOS.srs.todayISO();
    if (!g.lastTick) { g.lastTick = today; store.save(); return; }
    if (g.lastTick > today) g.lastTick = today;   // clock moved back — be lenient

    /* drain each fully-elapsed day that had no session activity */
    var cursor = g.lastTick;
    var drained = 0;
    while (cursor < today) {
      if (!KOS.sessions.hasActivity(cursor, null)) drained += DAY_DRAIN;
      cursor = KOS.srs.addDays(cursor, 1);
    }
    if (drained) g.hp = clamp(g.hp - drained);

    /* backlog pressure: due queue past the threshold costs HP once a day */
    if (g.lastBacklogDrain !== today && KOS.srs.dueCount() > BACKLOG_LIMIT) {
      g.hp = clamp(g.hp - BACKLOG_DRAIN);
      g.lastBacklogDrain = today;
    }
    g.lastTick = today;
    store.save();
  }

  /* HP restore — halved trickle while Critical so it can't be gamed back
     instantly; the Recovery checklist is the intended route out. */
  function restoreHp(amount) {
    var g = G();
    if (hpState() === "critical") amount = Math.ceil(amount / 2);
    g.hp = clamp(g.hp + amount);
  }

  /* immediate HP nick (Build 2b: focus-session distraction penalty) */
  function drainHp(amount) {
    var g = G();
    g.hp = clamp(g.hp - amount);
    store.save();
    if (KOS.refreshHUD) KOS.refreshHUD();
    return g.hp;
  }

  /* ================= XP / level ================= */
  /* XP to go from level n to n+1: 100 + 50·(n−1). Pure progress, no gating. */
  function levelInfo(xp) {
    var level = 1, need = 100, rem = xp;
    while (rem >= need) { rem -= need; level++; need = 100 + 50 * (level - 1); }
    return { level: level, into: rem, need: need };
  }
  function level() { return levelInfo(G().xp).level; }

  /* ================= awards ================= */
  /* Session-type → base award. XP and gold always land; HP goes through the
     Critical trickle. One toast summarises the take. */
  function onSession(e) {
    var g = G();
    var before = levelInfo(g.xp).level;
    var xp = 0, gold = 0, hp = 0, notes = [];
    var m = e.metrics || {};

    if (e.type === "flashcards") { xp = 15 + (m.cards || 0); gold = 3; hp = 4; }
    else if (e.type === "due-review") {
      xp = 20 + (m.cards || 0) * 2; gold = 5; hp = 6;
      if (KOS.srs.dueCount() === 0) { gold += 20; hp += 6; notes.push("backlog cleared"); }
    }
    else if (e.type === "quiz") {
      var pct = m.pct || 0;
      xp = 10 + Math.round(pct / 10); hp = 4;
      gold = pct >= 80 ? 10 : 2;
      if (pct >= 80) notes.push("high score");
    }
    else if (e.type === "exam") { xp = 12; gold = 2; hp = 3; }
    else if (e.type === "todo") { xp = 5; gold = 1; hp = 2; }
    else if (e.type === "tracker") { xp = 8; gold = 1; hp = 2; }
    else if (e.type === "media") {
      /* Collection Matrix (Build 3a): a small trickle for logging what you
         watched/read. HP stays at 0 BY CONTRACT — this module never drains
         or restores HP (sessions.js also hides media from the day-drain). */
      if (m.action === "sync-reward") {
        /* Build 3j — a pull that discovered progress made elsewhere
           (mal-sync, site edits). Proportional to the watermark delta,
           capped so even a month of catch-up can't outpay real study:
           a unit is one episode/chapter, an advance one status step up. */
        var units = Math.min(m.units || 0, 50);
        var advances = Math.min(m.advances || 0, 10);
        xp = Math.min(4 + units + 3 * advances, 60);
        gold = Math.min(1 + Math.floor(units / 4) + advances, 12);
        hp = 0;
        notes.push("synced progress");
      } else {
        xp = 4; gold = 1; hp = 0;
      }
    }
    else if (e.type === "focus") {
      /* Build 2b — the real focus award. Ended-early sessions log but forfeit
         the whole award; extra pauses (first is free) shave XP/gold 15% each;
         distraction HP nicks were already applied live by the timer. */
      if (!m.complete) {
        store.save();
        if (KOS.ui) KOS.ui.toast("Focus session logged — ended early, award forfeited.");
        if (KOS.refreshHUD) KOS.refreshHUD();
        return;
      }
      var mins = m.mins || Math.round((e.dur || 0) / 60);
      xp = 10 + mins;
      gold = 3 + 2 * Math.floor(mins / 25);
      hp = 6;
      var extraPauses = Math.max(0, (m.pauses || 0) - 1);
      if (extraPauses) {
        var mult = Math.max(0.25, 1 - 0.15 * extraPauses);
        xp = Math.round(xp * mult);
        gold = Math.round(gold * mult);
        notes.push(extraPauses + " extra pause" + (extraPauses > 1 ? "s" : "") + " −" + Math.round((1 - mult) * 100) + "%");
      }
      if (m.distractions) notes.push(m.distractions + " distraction" + (m.distractions > 1 ? "s" : ""));
    }

    /* streak milestone bonuses (once per milestone per streak-run) */
    var stk = KOS.sessions.streak(null);
    [3, 7, 14, 30, 60, 100].forEach(function (ms) {
      var key = "streak" + ms;
      g.milestones = g.milestones || {};
      if (stk >= ms && g.milestones[key] !== KOS.srs.addDays(KOS.srs.todayISO(), -(stk - ms))) {
        /* keyed to the run's start date so a fresh run re-earns the bonus */
        g.milestones[key] = KOS.srs.addDays(KOS.srs.todayISO(), -(stk - ms));
        gold += ms; notes.push(stk + "-day streak");
      }
    });

    g.xp += xp;
    g.gold += gold;
    restoreHp(hp);
    store.save();

    var after = levelInfo(g.xp).level;
    var msg = "+" + xp + " XP · +" + gold + " gold" + (notes.length ? " · " + notes.join(", ") : "");
    if (after > before) msg += " · LEVEL " + after + "!";
    if (KOS.ui) KOS.ui.toast(msg);
    if (KOS.refreshHUD) KOS.refreshHUD();
  }

  /* ================= gold catalog ================= */
  /* Pricing rebalanced in Build 3j (the 2a numbers were flagged
     placeholders from day one). Anchor: a steady study day yields roughly
     15–30 gold (sessions 1–10 each, quiz ≥80% +10, clearing the due queue
     +20, streak milestones on top). So: a BIG lab ≈ a week of real study
     (180), a focused sim ≈ 3–4 days (100), an OS theme is the prestige
     cosmetic (140), and the small cosmetics sit at 2–3 days (70–90) so
     there is always something within reach. Existing owned items keep
     working — ids never change, only prices did. */
  var CATALOG = [
    /* functional: one-time permanent lab/sim unlocks */
    { id: "trace",            kind: "lab",   name: "Trace Lab",              price: 180, desc: "Stacks, queues, lists & trees animated with trace tables." },
    { id: "oop",              kind: "lab",   name: "OOP Sandbox",            price: 180, desc: "Drag class blocks, draw inheritance, read the C#." },
    { id: "logic-lab",        kind: "lab",   name: "Logic Lab",              price: 100, desc: "Boolean expressions with live truth tables." },
    { id: "sort-viz",         kind: "lab",   name: "Sort Visualiser",        price: 100, desc: "Bubble vs merge — watch the Big-O gap appear." },
    { id: "fsm-lab",          kind: "lab",   name: "FSM Lab",                price: 100, desc: "Feed strings through acceptor state machines." },
    { id: "fn-transform",     kind: "lab",   name: "Function Transformer",   price: 100, desc: "y = a·f(bx + c) + d with exam wording written for you." },
    { id: "trig-circle",      kind: "lab",   name: "Trig Circle",            price: 100, desc: "Unit circle explorer for the wave functions." },
    { id: "integration-area", kind: "lab",   name: "Integration Area",       price: 100, desc: "Definite integrals as signed area, live." },
    /* cosmetic: OS theme variants over the Linear Void default (Build 4.0).
       23 palettes generated from tools/theme-lab-raw.json — the CSS lives in
       body[data-theme="<id>"] blocks in main.css. sw = shop swatch preview.
       The retired kin/shinku/aoi/sumi ids fall back to the default theme in
       applyCosmetics(); owned copies simply stop being applicable. */
    { id: "theme-spectral-rose", kind: "theme", name: "Spectral Rose", price: 140, desc: "Blue-black lacquer, wine red, cyan rim-light and ember orange.", theme: "spectral-rose", sw: ["#D82D57", "#22D7E8", "#FF8A3D"] },
    { id: "theme-verdigris-duel", kind: "theme", name: "Verdigris Duel", price: 140, desc: "Charcoal, oxidised teal, fog white and restrained rust.", theme: "verdigris-duel", sw: ["#6F9E98", "#DDEBE7", "#A65E58"] },
    { id: "theme-sakura-skyline", kind: "theme", name: "Sakura Skyline", price: 140, desc: "Deep indigo city-night with periwinkle, electric blue and sakura pink.", theme: "sakura-skyline", sw: ["#9B8DFF", "#55C7FF", "#F052B7"] },
    { id: "theme-starfall-serenade", kind: "theme", name: "Starfall Serenade", price: 140, desc: "Midnight plum, smoky violet, coral horizon and cold starlight.", theme: "starfall-serenade", sw: ["#E67F74", "#87AAFF", "#A66FD2"] },
    { id: "theme-feathered-dusk", kind: "theme", name: "Feathered Dusk", price: 140, desc: "Ink mauve, dusty rose, blue-grey and pale blush.", theme: "feathered-dusk", sw: ["#B985A0", "#6F83AC", "#D9A8BC"] },
    { id: "theme-rosewater-abyss", kind: "theme", name: "Rosewater Abyss", price: 140, desc: "Near-black marine blue, pearl aqua, coral petals and pale gold.", theme: "rosewater-abyss", sw: ["#EF8997", "#6EC5DE", "#D6B05C"] },
    { id: "theme-clinic-noir", kind: "theme", name: "Clinic Noir", price: 140, desc: "Sterile slate, charcoal, pearl and faint blush reflections.", theme: "clinic-noir", sw: ["#DDE7E9", "#5DD7E8", "#E7A2B1"] },
    { id: "theme-azure-corset-noir", kind: "theme", name: "Azure Corset Noir", price: 140, desc: "Midnight blue, icy porcelain, graphite lace and cardinal ribbon.", theme: "azure-corset-noir", sw: ["#79BAD3", "#DCEBF0", "#C83E53"] },
    { id: "theme-shattered-bloom", kind: "theme", name: "Shattered Bloom", price: 140, desc: "Blue-black, electric cyan, hot pink and ultraviolet.", theme: "shattered-bloom", sw: ["#FF2F84", "#3BE3FF", "#8B5CFF"] },
    { id: "theme-scarlet-garden-night", kind: "theme", name: "Scarlet Garden Night", price: 140, desc: "Dark sage, blackened porcelain, scarlet silk and muted stone.", theme: "scarlet-garden-night", sw: ["#BF3B48", "#769383", "#C6D0C8"] },
    { id: "theme-midnight-lilies", kind: "theme", name: "Midnight Lilies", price: 140, desc: "Ink-black water, moon-white petals, slate and muted sage.", theme: "midnight-lilies", sw: ["#D8DAD7", "#94B0A4", "#697E91"] },
    { id: "theme-gothic-camellia", kind: "theme", name: "Gothic Camellia", price: 140, desc: "Deep navy, magenta velvet, antique brass and smoky violet.", theme: "gothic-camellia", sw: ["#D64087", "#B79753", "#7454AF"] },
    { id: "theme-rain-cafe", kind: "theme", name: "Rain Café", price: 140, desc: "Deep teal glass, rain-blue neon, warm peach and coffee cream.", theme: "rain-cafe", sw: ["#42C6D0", "#E99A78", "#83A8FF"] },
    { id: "theme-porcelain-sky-night", kind: "theme", name: "Porcelain Sky Night", price: 140, desc: "Navy-black, powder blue, porcelain highlights and a clean red bow.", theme: "porcelain-sky-night", sw: ["#6BB5D1", "#C73B50", "#D9EAF0"] },
    { id: "theme-crimson-moth", kind: "theme", name: "Crimson Moth", price: 140, desc: "Absolute black, blood-red wings, bone white and smoke brown.", theme: "crimson-moth", sw: ["#E53228", "#FF6650", "#80645A"] },
    { id: "theme-celestial-duality", kind: "theme", name: "Celestial Duality", price: 140, desc: "Black void, ultramarine, ice-white, cyan and silver.", theme: "celestial-duality", sw: ["#3348C9", "#52D9FF", "#C8D3FF"] },
    { id: "theme-jade-camellia", kind: "theme", name: "Jade Camellia", price: 140, desc: "Forest black, jade leaf, olive gold, coral flower and parchment.", theme: "jade-camellia", sw: ["#4D8D67", "#A6A15D", "#D16E67"] },
    { id: "theme-ember-wraith", kind: "theme", name: "Ember Wraith", price: 140, desc: "Midnight navy, dark crimson, rose flame and ice-blue eyes.", theme: "ember-wraith", sw: ["#D9546E", "#FF8AA1", "#76DFFF"] },
    { id: "theme-solar-manuscript", kind: "theme", name: "Solar Manuscript", price: 140, desc: "Charcoal ink, saffron, engraved gold, lavender-grey and ivory.", theme: "solar-manuscript", sw: ["#F0B92C", "#B98936", "#AAA0C5"] },
    { id: "theme-violet-requiem", kind: "theme", name: "Violet Requiem", price: 140, desc: "Midnight indigo, hydrangea violet, pale lilac, rose and white cloth.", theme: "violet-requiem", sw: ["#A586C7", "#D0A6DA", "#B86D91"] },
    { id: "theme-rosarium", kind: "theme", name: "Rosarium", price: 140, desc: "Black rose garden, oxblood, petal pink, ivory and antique brass.", theme: "rosarium", sw: ["#D83D68", "#F19AB4", "#D1A95B"] },
    { id: "theme-lycoris-radiata", kind: "theme", name: "Lycoris Radiata", price: 140, desc: "Sumi black, scarlet filaments, ember orange and pale bone.", theme: "lycoris-radiata", sw: ["#E32636", "#FF7448", "#D7C9BC"] },
    { id: "theme-azure-butterfly", kind: "theme", name: "Azure Butterfly", price: 140, desc: "Night-sky blue, luminous aqua, pearl, silver and soft lilac.", theme: "azure-butterfly", sw: ["#5DB9E7", "#92E4FF", "#B8A9F2"] },
    /* cosmetic: kanji seal variants (the topbar mark) */
    { id: "seal-homura", kind: "seal", name: "焔 Homura seal", price: 70, desc: "Flame variant of the OS mark.", glyph: "焔" },
    { id: "seal-tsuki",  kind: "seal", name: "月 Tsuki seal",  price: 70, desc: "Moon variant of the OS mark.", glyph: "月" },
    { id: "seal-ryuu",   kind: "seal", name: "竜 Ryū seal",    price: 70, desc: "Dragon variant of the OS mark.", glyph: "竜" },
    { id: "seal-sakura", kind: "seal", name: "桜 Sakura seal", price: 70, desc: "Blossom variant — for the spring seasons.", glyph: "桜" },
    { id: "seal-rai",    kind: "seal", name: "雷 Rai seal",    price: 70, desc: "Thunder variant of the OS mark.", glyph: "雷" },
    { id: "seal-hoshi",  kind: "seal", name: "星 Hoshi seal",  price: 70, desc: "Star variant of the OS mark.", glyph: "星" },
    /* cosmetic: avatar frames */
    { id: "frame-gold",     kind: "frame", name: "Gilt ring",      price: 90, desc: "A solid gold ring around your avatar." },
    { id: "frame-crimson",  kind: "frame", name: "Kurenai bloom",  price: 90, desc: "A crimson glow bleeding off the rim." },
    { id: "frame-jade",     kind: "frame", name: "Jade band",      price: 90, desc: "A cool jade ring — the CS hue." },
    { id: "frame-amethyst", kind: "frame", name: "Amethyst orbit", price: 90, desc: "A violet ring — the IT hue." },
    /* cosmetic: Collection Matrix — bookshelf skins (Books' Physical tab) */
    { id: "shelf-walnut",    kind: "shelfskin", name: "Walnut grain",     price: 80, desc: "Warm wood tones under the spines — a reading-lamp shelf." },
    { id: "shelf-lacquer",   kind: "shelfskin", name: "Black lacquer",    price: 80, desc: "Gloss-dark boards with a gold hairline." },
    { id: "shelf-vermilion", kind: "shelfskin", name: "Vermilion shrine", price: 80, desc: "Torii-red boards — the shelf as a small shrine." },
    /* cosmetic: Collection Matrix — Shrine card border styles */
    { id: "shrine-gilded", kind: "shrinestyle", name: "Gilded torii", price: 80, desc: "Double gold borders on every enshrined card." },
    { id: "shrine-ink",    kind: "shrinestyle", name: "Ink brush",    price: 80, desc: "Soft brushed monochrome edges — the quiet hall." },
    { id: "shrine-neon",   kind: "shrinestyle", name: "Neon shrine",  price: 80, desc: "Crimson glow bleeding off every card rim." }
  ];
  var SEAL_GLYPHS = { kurenai: "紅", "seal-homura": "焔", "seal-tsuki": "月", "seal-ryuu": "竜",
                      "seal-sakura": "桜", "seal-rai": "雷", "seal-hoshi": "星" };

  function catalog() { return CATALOG.slice(); }
  function item(id) { return CATALOG.find(function (c) { return c.id === id; }); }
  function owns(id) { return G().owned.indexOf(id) !== -1; }
  function buy(id) {
    var g = G(), it = item(id);
    if (!it) return { ok: false, msg: "Unknown item." };
    if (owns(id)) return { ok: false, msg: "Already owned." };
    if (hpState() !== "healthy" && it.kind === "lab") return { ok: false, msg: "The shop is suspended while HP is " + hpStateInfo().label + "." };
    if (g.gold < it.price) return { ok: false, msg: "Not enough gold — " + (it.price - g.gold) + " more needed." };
    g.gold -= it.price;
    g.owned.push(id);
    store.save();
    if (KOS.refreshHUD) KOS.refreshHUD();
    return { ok: true, msg: it.name + " unlocked." };
  }

  /* ================= feature gating ================= */
  /* Gold-gated sim ids → catalog item that unlocks them. The four tl-* trace
     structures belong to the Trace Lab purchase. Sims not listed here are
     free (HP-gated only). */
  var SIM_ITEM = {
    "logic-lab": "logic-lab", "sort-viz": "sort-viz", "fsm-lab": "fsm-lab",
    "fn-transform": "fn-transform", "trig-circle": "trig-circle",
    "integration-area": "integration-area",
    "tl-stack": "trace", "tl-queue": "trace", "tl-list": "trace", "tl-tree": "trace"
  };
  var VIEW_ITEM = { trace: "trace", oop: "oop" };

  /* Can this sim mount right now? {ok} or {ok:false, why:"hp"|"gold", item} */
  function simAccess(simId) {
    if (hpState() !== "healthy") return { ok: false, why: "hp" };
    var itemId = SIM_ITEM[simId];
    if (itemId && !owns(itemId)) return { ok: false, why: "gold", item: item(itemId) };
    return { ok: true };
  }
  function viewAccess(viewId) {
    if (viewId === "sims") return hpState() !== "healthy" ? { ok: false, why: "hp" } : { ok: true };
    if (hpState() !== "healthy") return { ok: false, why: "hp" };
    var itemId = VIEW_ITEM[viewId];
    if (itemId && !owns(itemId)) return { ok: false, why: "gold", item: item(itemId) };
    return { ok: true };
  }

  /* Wrap the lab views once everything is registered (called from main.js).
     The sims view additionally gates per-sim inside its own tabs, so we gate
     the whole view only on HP and rely on simAccess for gold. */
  function lockPanel(main, access, backLabel) {
    var el = KOS.ui.el;
    var isHp = access.why === "hp";
    main.appendChild(el("div", { class: "gov-lock" }, [
      el("div", { class: "gov-lock-glyph", text: isHp ? "朽" : "錠" }),
      el("h2", { text: isHp ? "Suspended — HP is " + hpStateInfo().label : "Locked — " + access.item.name }),
      el("p", { class: "sub", text: isHp
        ? "Labs and simulations reopen at 60 HP. Clear due flashcards, finish a session or tick to-do items to recover. Core revision (notes, flashcards, quizzes, exam Qs) is never locked."
        : access.item.name + " is a one-time unlock: " + access.item.price + " gold. Earn gold from sessions, streaks, high quiz scores and clearing the review backlog." }),
      el("div", { class: "lab-controls", style: "justify-content:center;margin-top:14px" }, [
        isHp
          ? el("button", { class: "btn primary", text: "Open Recovery — Governor panel", onclick: function () { KOS.show("governor"); } })
          : el("button", { class: "btn gold", text: "Open the Gold Shop", onclick: function () { KOS.show("governor", "shop"); } }),
        el("button", { class: "btn", text: backLabel || "← Overview", onclick: function () { KOS.show("home"); } })
      ])
    ]));
  }
  function installGates() {
    ["trace", "oop", "sims"].forEach(function (v) {
      var orig = KOS.views[v];
      if (!orig) return;
      KOS.views[v] = function (main, arg) {
        var acc = v === "sims" && arg ? simAccess(arg) : viewAccess(v);
        /* the plain sims view with no target is HP-gated only */
        if (v === "sims" && !arg) acc = viewAccess("sims");
        if (!acc.ok) {
          document.getElementById("tree").classList.add("hidden");
          document.getElementById("cols").classList.add("no-tree");
          lockPanel(main, acc);
          return;
        }
        orig(main, arg);
      };
    });
  }

  /* ================= avatar ================= */
  /* Default library: procedural SVG seals, geometric/kanji-adjacent, crimson +
     gold, unlocking progressively by level. */
  function sealSvg(spec) {
    var K = "#8C7CFF", K2 = "#A99BFF", GD = "#35D7FF", INK = "#0A0D13";
    var defs = '<circle cx="32" cy="32" r="30" fill="' + INK + '" stroke="' + spec.ring + '" stroke-width="2.5"/>';
    return '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + spec.name + '">' +
      defs + spec.art
        .replace(/\{K\}/g, K).replace(/\{K2\}/g, K2).replace(/\{G\}/g, GD).replace(/\{I\}/g, INK) +
      "</svg>";
  }
  var SEALS = [
    { id: "seal-ember", name: "Ember", minLevel: 1, ring: "#8C7CFF",
      art: '<circle cx="32" cy="32" r="17" fill="none" stroke="{K}" stroke-width="2"/>' +
           '<circle cx="32" cy="32" r="8" fill="{K}"/>' +
           '<circle cx="32" cy="32" r="23" fill="none" stroke="{G}" stroke-width="1" stroke-dasharray="2 5"/>' },
    { id: "seal-facet", name: "Facet", minLevel: 2, ring: "#35D7FF",
      art: '<polygon points="32,12 49,32 32,52 15,32" fill="none" stroke="{G}" stroke-width="2"/>' +
           '<polygon points="32,20 42,32 32,44 22,32" fill="{K}"/>' +
           '<line x1="32" y1="12" x2="32" y2="52" stroke="{G}" stroke-width="1"/>' },
    { id: "seal-torii", name: "Torii", minLevel: 3, ring: "#8C7CFF",
      art: '<path d="M15 24 h34 M18 30 h28 M22 30 v18 M42 30 v18 M13 22 q19 -6 38 0" fill="none" stroke="{K}" stroke-width="3" stroke-linecap="round"/>' +
           '<circle cx="32" cy="41" r="3.4" fill="{G}"/>' },
    { id: "seal-asanoha", name: "Asanoha", minLevel: 5, ring: "#35D7FF",
      art: '<g stroke="{K}" stroke-width="1.6" fill="none">' +
           '<polygon points="32,13 48.5,22.5 48.5,41.5 32,51 15.5,41.5 15.5,22.5"/>' +
           '<line x1="32" y1="13" x2="32" y2="51"/><line x1="15.5" y1="22.5" x2="48.5" y2="41.5"/>' +
           '<line x1="48.5" y1="22.5" x2="15.5" y2="41.5"/></g>' +
           '<circle cx="32" cy="32" r="4.5" fill="{G}"/>' },
    { id: "seal-getsuei", name: "Getsuei", minLevel: 8, ring: "#8C7CFF",
      art: '<circle cx="32" cy="32" r="18" fill="{K}"/>' +
           '<circle cx="39" cy="27" r="15" fill="{I}"/>' +
           '<circle cx="45" cy="20" r="2.4" fill="{G}"/><circle cx="20" cy="44" r="1.7" fill="{G}"/>' +
           '<circle cx="32" cy="32" r="23" fill="none" stroke="{G}" stroke-width="1" stroke-dasharray="1 6"/>' }
  ];
  function seals() { return SEALS.slice(); }
  function sealById(id) { return SEALS.find(function (s) { return s.id === id; }); }
  function sealUnlocked(s) { return level() >= s.minLevel; }

  /* Returns a DOM node for the current avatar at a given px size. */
  function avatarNode(size) {
    var el = KOS.ui.el, g = G();
    var cls = "gov-avatar" + (g.avatar.frame ? " " + g.avatar.frame : "");
    var node = el("span", { class: cls, style: "width:" + size + "px;height:" + size + "px" });
    if (g.avatar.kind === "custom" && g.avatar.img) {
      node.appendChild(el("img", { src: g.avatar.img, alt: "Your avatar" }));
    } else {
      var s = sealById(g.avatar.id) || SEALS[0];
      node.innerHTML += sealSvg(s);
    }
    return node;
  }

  /* Custom upload: crop-to-circle via canvas, resized to 256×256 and stored
     as compressed JPEG base64 — REQUIRED, localStorage has a hard ceiling. */
  function setCustomAvatar(file, done) {
    var reader = new FileReader();
    reader.onload = function () {
      var img = new Image();
      img.onload = function () {
        try {
          var SIZE = 256;
          var cv = document.createElement("canvas");
          cv.width = SIZE; cv.height = SIZE;
          var ctx = cv.getContext("2d");
          ctx.beginPath(); ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2, 0, Math.PI * 2); ctx.clip();
          /* cover-fit: crop the shorter side, centre the crop */
          var side = Math.min(img.width, img.height);
          ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, SIZE, SIZE);
          var data = cv.toDataURL("image/jpeg", 0.82);
          if (data.length > 200 * 1024) data = cv.toDataURL("image/jpeg", 0.6);
          var g = G();
          g.avatar.kind = "custom";
          g.avatar.img = data;
          store.save();
          if (KOS.refreshHUD) KOS.refreshHUD();
          done && done(null);
        } catch (e) { done && done(e); }
      };
      img.onerror = function () { done && done(new Error("Not a readable image")); };
      img.src = reader.result;
    };
    reader.onerror = function () { done && done(new Error("Could not read the file")); };
    reader.readAsDataURL(file);
  }

  /* ================= cosmetics application ================= */
  function applyCosmetics() {
    var g = G();
    /* unknown/retired theme ids (the old kin/shinku/aoi/sumi) render as the
       Linear Void default rather than a half-themed page */
    var known = CATALOG.some(function (c) { return c.kind === "theme" && c.theme === g.theme; });
    /* the attribute must live on <html>: derived tokens (--panel, --kurenai,
       …) are computed at :root, so canonical overrides must land there too */
    var tid = (g.theme === "kurenai" || !known) ? "" : g.theme;
    document.documentElement.dataset.theme = tid;
    document.body.dataset.theme = tid;   /* legacy hook, harmless */
    var mark = document.querySelector("#topbar .brand .kanji");
    if (mark) mark.textContent = SEAL_GLYPHS[g.seal] || "紅";
  }
  function setTheme(themeId) { G().theme = themeId; store.save(); applyCosmetics(); }
  function setSeal(sealId) { G().seal = sealId; store.save(); applyCosmetics(); }
  /* Collection Matrix cosmetics (3j): the id is read at render time by
     books.js (Physical-tab shelf) and shrine.js — null = the default look */
  function setShelfSkin(id) { G().shelfSkin = id || null; store.save(); }
  function setShrineStyle(id) { G().shrineStyle = id || null; store.save(); }
  function shelfSkin() { return G().shelfSkin || null; }
  function shrineStyle() { return G().shrineStyle || null; }

  /* ================= recovery mode ================= */
  /* The fastest route from Critical back to Strained: three concrete tasks,
     progress measured from today's session log. */
  function recoveryTasks() {
    var today = KOS.srs.todayISO();
    var todays = KOS.sessions.forDate(today, null);
    var reviewed = todays.filter(function (e) { return e.type === "due-review" || e.type === "flashcards"; })
      .reduce(function (a, e) { return a + (e.metrics.cards || 0); }, 0);
    var quizzes = todays.filter(function (e) { return e.type === "quiz" || e.type === "exam"; }).length;
    var todos = todays.filter(function (e) { return e.type === "todo"; }).length;
    return [
      { label: "Review 5 due flashcards", cur: Math.min(5, reviewed), target: 5,
        go: function () { KOS.show("due"); } },
      { label: "Complete a quiz or exam question", cur: Math.min(1, quizzes), target: 1,
        go: function () { KOS.show("home"); } },
      { label: "Tick 2 items on today's list", cur: Math.min(2, todos), target: 2,
        go: function () { KOS.show("home"); } }
    ];
  }

  /* ================= HUD ================= */
  function refreshHUD() {
    var holder = document.getElementById("hud");
    if (!holder) return;
    var el = KOS.ui.el, g = G();
    var li = levelInfo(g.xp);
    var state = hpState();
    holder.innerHTML = "";
    var btn = el("button", { class: "hud hud-" + state, title: "Behavioural Governor — HP " + g.hp + " · Level " + li.level + " · " + g.gold + " gold",
      onclick: function () { KOS.show("governor"); } }, [
      avatarNode(30),
      el("span", { class: "hud-col" }, [
        el("span", { class: "hud-row" }, [
          el("span", { class: "hud-lv", text: "Lv " + li.level }),
          el("span", { class: "hud-gold", text: "◈ " + g.gold })
        ]),
        el("span", { class: "hud-bars" }, [
          el("span", { class: "hud-bar hud-hp", title: "HP " + g.hp + "/100 — " + hpStateInfo().label }, [
            el("span", { style: "width:" + g.hp + "%" })]),
          el("span", { class: "hud-bar hud-xp", title: li.into + "/" + li.need + " XP to level " + (li.level + 1) }, [
            el("span", { style: "width:" + Math.round(100 * li.into / li.need) + "%" })])
        ])
      ])
    ]);
    holder.appendChild(btn);
  }
  KOS.refreshHUD = refreshHUD;

  /* test/dev helper: own every catalog item (used by the smoke suites so the
     lab steps run against a fresh store) */
  function debugUnlockAll() {
    var g = G();
    CATALOG.forEach(function (c) { if (g.owned.indexOf(c.id) === -1) g.owned.push(c.id); });
    g.hp = 100;
    store.save();
  }

  KOS.governor = {
    hpState: hpState,
    hpStateInfo: hpStateInfo,
    tick: tick,
    onSession: onSession,
    levelInfo: levelInfo,
    level: level,
    drainHp: drainHp,
    catalog: catalog,
    item: item,
    owns: owns,
    buy: buy,
    simAccess: simAccess,
    viewAccess: viewAccess,
    installGates: installGates,
    lockPanel: lockPanel,
    seals: seals,
    sealById: sealById,
    sealSvg: sealSvg,
    sealUnlocked: sealUnlocked,
    avatarNode: avatarNode,
    setCustomAvatar: setCustomAvatar,
    applyCosmetics: applyCosmetics,
    setTheme: setTheme,
    setSeal: setSeal,
    setShelfSkin: setShelfSkin,
    setShrineStyle: setShrineStyle,
    shelfSkin: shelfSkin,
    shrineStyle: shrineStyle,
    recoveryTasks: recoveryTasks,
    refreshHUD: refreshHUD,
    debugUnlockAll: debugUnlockAll,
    BACKLOG_LIMIT: BACKLOG_LIMIT
  };
})();
