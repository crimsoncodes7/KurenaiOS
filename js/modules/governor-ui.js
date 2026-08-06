/* Kurenai OS — modules/governor-ui.js
   The Behavioural Governor panel: status + recovery, the gold shop,
   the avatar system, and the session history log (FR-3.2 surfaced).

   Navigation shape (Build 6): the four pages ride KOS.workspaceTabs in the
   page header, exactly like the Collection planner/sync workspaces, so the
   switcher sits at the top of the content area with no dead strip around it.

   Ledger policy (Build 6): routine integration housekeeping — the one
   session an autosync cycle logs — is CLASSIFIED as routine and kept out of
   the meaningful ledger. It is never dropped from the session log itself
   (the governor prices from that log; invariants #1/#5), only filed into the
   Session Log's own Sync history where it is coalesced per day + provider. */
(function () {
  "use strict";
  var el = KOS.ui.el, store = KOS.store;

  var TABS = [
    ["status", "Status"],
    ["shop", "Gold Shop"],
    ["avatar", "Avatar"],
    ["history", "Session Log"]
  ];

  /* ---------------- ledger classification (Part C) ----------------
     One predicate, used by every ledger surface. "Routine" = background
     integration bookkeeping that says nothing about what you did. */
  function isRoutine(s) {
    return s.type === "media" && s.metrics && s.metrics.action === "sync-reward";
  }
  function providerName(m) {
    if (!m) return "AniList";
    if (m.module === "integrations") return "Integrations";
    if (m.module === "vn") return "VNDB";
    if (m.module === "game") return "Steam";
    return "AniList";
  }
  /* collapse a run of routine entries into one row per day + provider */
  function coalesceRoutine(rows) {
    var byKey = {}, order = [];
    rows.forEach(function (s) {
      var prov = providerName(s.metrics);
      var key = s.date + "|" + prov;
      if (!byKey[key]) {
        byKey[key] = { date: s.date, ts: s.ts, provider: prov, syncs: 0, entries: 0, advances: 0 };
        order.push(key);
      }
      var b = byKey[key];
      b.syncs++;
      b.entries += (s.metrics && s.metrics.entries) || 0;
      b.advances += (s.metrics && s.metrics.advances) || 0;
      if (s.ts > b.ts) b.ts = s.ts;   // newest wins for the relative time
    });
    return order.map(function (k) { return byKey[k]; });
  }

  KOS.views.governor = function (main, openTab) {
    document.getElementById("tree").classList.add("hidden");
    document.getElementById("cols").classList.add("no-tree");
    var g = store.state.governor;
    var li = KOS.governor.levelInfo(g.xp);
    var state = KOS.governor.hpStateInfo();
    var cur = TABS.some(function (t) { return t[0] === openTab; }) ? openTab : "status";

    /* --- Part A: header carries the switcher; no strip above or below --- */
    var govTabs = KOS.workspaceTabs(TABS.map(function (t) { return [t[1], "governor", t[0], t[0]]; }),
      cur, "Governor pages", "gov-tabs");
    /* keep the data-tab hook every consumer of this switcher has used */
    govTabs.querySelectorAll(".study-tab").forEach(function (b, i) { b.dataset.tab = TABS[i][0]; });

    var head = el("div", { class: "dash-head gov-head" }, [
      el("div", { class: "dh-txt" }, [
        el("span", { class: "dh-kicker", text: "Command centre" }),
        el("h1", { text: "The Governor's Seat" }),
        el("div", { class: "dh-sub" }, [
          el("span", { class: "board", text: "One glance at the whole domain — vitals, cadence, and the ledger." })
        ])
      ]),
      govTabs
    ]);
    main.appendChild(head);

    var panel = el("div", { class: "study-panel gov-workspace" });
    main.appendChild(panel);

    function render() {
      g = store.state.governor;
      li = KOS.governor.levelInfo(g.xp);
      state = KOS.governor.hpStateInfo();
      panel.innerHTML = "";
      if (cur === "status") renderStatus();
      else if (cur === "shop") renderShop();
      else if (cur === "avatar") renderAvatar();
      else renderHistory();
    }

    /* ---------------- STATUS — the Governor's Seat ----------------
       Identity over a paintable banner · one vertical stat stack on the
       right · cadence and the ledger balanced beneath. */
    function bentoCard(cls, title, kids, endNote) {
      return el("div", { class: "card bento-card " + cls }, [
        el("h4", {}, [
          el("span", { text: title }),
          endNote ? el("span", { class: "end", text: endNote }) : null
        ]),
      ].concat(kids));
    }

    /* THE stat tile — one shape for every statistic on this page.
       Same dimensions, label type, value type, bar treatment and spacing,
       whether it carries a bar or not. */
    function statTile(o) {
      return el("div", { class: "gstat" + (o.cls ? " gstat-" + o.cls : "") + (o.warn ? " is-warn" : "") }, [
        el("div", { class: "gstat-top" }, [
          el("span", { class: "gstat-k", text: o.label }),
          el("span", { class: "gstat-v", text: o.value })
        ]),
        el("div", { class: "gstat-bar hud-bar " + (o.barCls || "hud-neutral") },
          [el("span", { style: "width:" + (o.pct == null ? 0 : Math.max(0, Math.min(100, o.pct))) + "%" })]),
        el("div", { class: "gstat-h", text: o.hint || "" })
      ]);
    }

    var ACTION_TEXT = { progress: "progress logged", completed: "finished", added: "added to the vault",
      status: "status changed", dropped: "set down", "reading-session": "reading session",
      chapter: "chapter completed", quote: "quote kept", route: "route cleared" };
    function relTime(ts) {
      if (!ts) return "";
      var diff = Date.now() - ts;
      if (diff < 90e3) return "now";
      if (diff < 36e5) return Math.round(diff / 6e4) + "m ago";
      if (diff < 864e5 * 0.9) return Math.round(diff / 36e5) + "h ago";
      if (diff < 864e5 * 2) return "yesterday";
      if (diff < 864e5 * 7) return new Date(ts).toLocaleDateString("en-GB", { weekday: "short" });
      return new Date(ts).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    }
    function subjName(sid) {
      return sid && KOS_DATA[sid] ? KOS_DATA[sid].name.replace("Computer Science", "CS").replace("Mathematics", "Maths") : sid;
    }
    function ledgerRow(s) {
      var m = s.metrics || {};
      var sig, sigTxt, desc;
      var topic = s.subject ? subjName(s.subject) + (s.ref ? " " + s.ref : "") : null;
      switch (s.type) {
        case "quiz":
          sig = "plus-xp"; sigTxt = "+XP";
          desc = "Quiz passed — " + (topic || "mixed") + (m.pct != null ? ", " + m.correct + "/" + m.total : ""); break;
        case "exam":
          sig = "plus-xp"; sigTxt = "+XP";
          desc = "Exam question self-marked — " + (topic || "mixed") + (m.max ? " (" + m.marks + "/" + m.max + ")" : ""); break;
        case "flashcards":
          sig = "plus-xp"; sigTxt = "+XP";
          desc = (m.cards || "?") + " cards reviewed — " + (topic || "mixed deck"); break;
        case "due-review":
          sig = "plus-xp"; sigTxt = "+XP";
          desc = (m.cards || "?") + " due cards cleared"; break;
        case "focus":
          sig = m.complete ? "plus-xp" : "minus"; sigTxt = m.complete ? "+XP" : "FORFEIT";
          desc = "Focus block — " + (m.mins || Math.round((s.dur || 0) / 60)) + " min" +
            (topic ? " on " + topic : "") + (m.complete ? "" : " (ended early)"); break;
        case "todo":
          sig = "plus-g"; sigTxt = "+G";
          desc = m.item || "Directive sealed"; break;
        case "tracker":
          sig = "plus-g"; sigTxt = "+G";
          desc = "Paper logged — " + (topic || "results"); break;
        case "media":
          sig = "log"; sigTxt = "LOGGED";
          if (m.action === "sync-reward") desc = providerName(m) + " sync — " + (m.entries || 0) + " title" + (m.entries === 1 ? "" : "s") + " updated";
          else if (m.action === "reading-session") desc = (m.mins || "?") + " min read" + (m.title ? " — " + m.title : "");
          else desc = (m.title || "Media") + " — " + (ACTION_TEXT[m.action] || m.action || "logged");
          break;
        default:
          sig = "plus-xp"; sigTxt = "+XP"; desc = s.type + (topic ? " — " + topic : "");
      }
      return el("div", { class: "led-row" }, [
        el("span", { class: "sig " + sig, text: sigTxt }),
        el("span", { class: "lt", text: desc, title: desc }),
        el("span", { class: "when", text: relTime(s.ts) || s.date })
      ]);
    }
    KOS.governorLedgerRow = ledgerRow;

    /* a coalesced routine row — one per day + provider */
    function routineRow(b) {
      var desc = b.provider + " sync completed — " + b.entries + " entr" + (b.entries === 1 ? "y" : "ies") +
        " updated" + (b.syncs > 1 ? " across " + b.syncs + " syncs" : "");
      return el("div", { class: "led-row is-routine" }, [
        el("span", { class: "sig sync", text: "SYNC" }),
        el("span", { class: "lt", text: desc, title: desc }),
        el("span", { class: "when", text: relTime(b.ts) || b.date })
      ]);
    }

    function renderStatus() {
      var hpCls = KOS.governor.hpState();
      var p = KOS.governor.profile();
      var bento = el("div", { class: "bento gov-status gov-" + hpCls });
      panel.appendChild(bento);
      var stks = KOS.sessions.streaks();
      var dayMs = 864e5;
      /* "sessions" means acts you performed — routine sync traffic is
         counted nowhere a human reads a number (Part C) */
      var realSessions = KOS.sessions.all().filter(function (s) { return !isRoutine(s); });
      var routineCount = KOS.sessions.all().length - realSessions.length;

      /* — identity, over the banner — */
      var hasBanner = !!KOS.governor.bannerCss();
      var idCard = el("div", { class: "card bento-card b-id" + (hasBanner ? " has-banner" : "") +
        (hasBanner && KOS.governor.bannerIsDark() ? " banner-dark" : "") });
      if (hasBanner) KOS.governor.applyBanner(idCard, { darkScrim: true });

      /* the about/status block — Discord-shaped, edited through the one
         shared editor so the topbar popover and Home never disagree */
      var aboutBlock = el("div", { class: "id-about" });
      if (p.status) aboutBlock.appendChild(el("div", { class: "id-status" }, [
        el("span", { class: "id-status-dot", "aria-hidden": "true" }),
        el("span", { text: p.status })
      ]));
      if (p.about) aboutBlock.appendChild(el("p", { class: "id-about-txt", text: p.about }));
      if (!p.status && !p.about) aboutBlock.appendChild(el("button", {
        class: "id-about-empty", text: "＋ Add a status or a couple of lines about yourself",
        onclick: openProfileEditor }));

      idCard.appendChild(el("div", { class: "id-wrap" }, [
        el("div", { class: "id-face" }, [
          KOS.governor.avatarNode(132),
          el("button", { class: "id-face-edit", title: "Edit your profile picture", "aria-label": "Edit your profile picture",
            text: "✎", onclick: function () { KOS.show("governor", "avatar"); } })
        ]),
        el("div", { class: "id-txt" }, [
          el("div", { class: "rank", text: p.rank }),
          el("h2", { text: "Level " + p.level }),
          el("div", { class: "title-line" }, [
            "Behavioural Governor · ", el("b", { text: state.label }),
            " · " + realSessions.length + " sessions on record"
          ]),
          aboutBlock,
          el("div", { class: "lvl-row" }, [
            el("span", { class: "lvl-badge" }, [el("i", { text: "LV" }), String(p.level)]),
            el("div", { class: "hud-bar hud-xp big lvl-bar" }, [
              el("span", { style: "width:" + p.xpPct + "%" })]),
            el("span", { class: "to-next", text: p.xpToNext + " XP to Lv " + (p.level + 1) })
          ])
        ]),
        /* the substats, pushed to the hero's right edge */
        el("div", { class: "id-side" }, [
          sideStat("炎", stks.all, "day streak"),
          sideStat("◈", p.gold, "gold"),
          sideStat("休", stks.rest, "rest streak"),
          sideStat("札", KOS.srs.dueCount(), "cards due")
        ])
      ]));
      function sideStat(glyph, v, k) {
        return el("div", { class: "id-side-stat" }, [
          el("span", { class: "iss-g", "aria-hidden": "true", text: glyph }),
          el("b", { text: String(v) }),
          el("span", { class: "iss-k", text: k })
        ]);
      }
      /* quiet controls — top-right of the card */
      idCard.appendChild(el("div", { class: "id-banner-ctl" }, [
        el("button", { class: "mini-btn", text: "✎ Status", title: "Edit your status and about", onclick: openProfileEditor }),
        el("button", { class: "mini-btn", text: "✎ Banner", title: "Upload or reposition your profile banner",
          onclick: function () { KOS.governor.editBanner(function (err, result) {
            if (err) { KOS.ui.toast("Banner upload failed: " + err.message, true); return; }
            if (result && result.cancelled) return;
            KOS.ui.toast("Banner set.");
            render();
          }); } }),
        hasBanner ? el("button", { class: "mini-btn", text: "✕", title: "Remove the banner",
          onclick: function () { KOS.governor.setBanner(null); render(); } }) : null
      ].filter(Boolean)));
      bento.appendChild(idCard);

      /* — vitals: the vertical stat stack on the right — */
      var cheapest = KOS.governor.catalog()
        .filter(function (c) { return !KOS.governor.owns(c.id); })
        .sort(function (a, b) { return a.price - b.price; })[0];
      var vitals = el("div", { class: "vital-stack" }, [
        el("div", { class: "vital" }, [statTile({ cls: "hp", label: "HP", value: p.hp + " / 100", pct: p.hp,
          barCls: "hud-hp", hint: state.desc, warn: hpCls !== "healthy" })]),
        el("div", { class: "vital" }, [statTile({ cls: "gold", label: "Gold", value: "◈ " + p.gold,
          pct: cheapest ? 100 * p.gold / cheapest.price : 100, barCls: "hud-gold",
          hint: cheapest ? (p.gold >= cheapest.price ? cheapest.name + " is affordable now"
                           : (cheapest.price - p.gold) + " more for " + cheapest.name) : "everything owned" })]),
        el("div", { class: "vital" }, [statTile({ cls: "xp", label: "XP", value: p.xpInto + " / " + p.xpNeed,
          pct: p.xpPct, barCls: "hud-xp", hint: "level " + (p.level + 1) + " at " + p.xpNeed + " XP" })])
      ]);
      bento.appendChild(bentoCard("b-vitals", "Vitals", [vitals], state.label));

      /* — study cadence: a full year at GitHub scale, so the grid fills the
           card instead of being stretched over empty air. Routine sync
           traffic is excluded — otherwise every square lights up for work
           you didn't do (Part C, same reasoning as the ledger). — */
      var byDate = {};
      realSessions.forEach(function (s) { byDate[s.date] = (byDate[s.date] || 0) + 1; });
      var WEEKS = 52;
      var days = [];
      for (var j = WEEKS * 7 - 1; j >= 0; j--) {
        var dd = new Date(Date.now() - j * dayMs);
        var iso2 = dd.getFullYear() + "-" + ("0" + (dd.getMonth() + 1)).slice(-2) + "-" + ("0" + dd.getDate()).slice(-2);
        days.push({ date: iso2, value: byDate[iso2] || 0,
          hint: (byDate[iso2] || 0) + " session" + ((byDate[iso2] || 0) === 1 ? "" : "s") + " · " + iso2 });
      }
      var totalSess = days.reduce(function (a, d) { return a + d.value; }, 0);
      var activeDays = days.filter(function (d) { return d.value > 0; }).length;
      var busiest = days.reduce(function (a, d) { return d.value > a.value ? d : a; }, days[0]);
      var since = days[0].date;
      var bySubj = {};
      var weekSecs = 0;
      var weekStart = KOS.srs.addDays(KOS.srs.todayISO(), -6);
      realSessions.forEach(function (s) {
        if (s.date >= since && s.subject) bySubj[s.subject] = (bySubj[s.subject] || 0) + 1;
        if (s.date >= weekStart && s.type !== "media") weekSecs += (s.dur || 0);
      });
      var bestSubj = Object.keys(bySubj).sort(function (a, b) { return bySubj[b] - bySubj[a]; })[0];
      /* the grid takes the card's full width; the numbers sit beneath it as
         the same tile shape used everywhere else on this page */
      var heat = el("div", { class: "heat-wrap" }, [
        el("div", { class: "heat-svg" }, [KOS.charts.heatmap(days, {})]),
        el("div", { class: "heat-legend" }, [
          el("span", { class: "hl-num", text: totalSess + " sessions in the last year" }),
          el("span", { class: "hl-scale" }, [
            el("span", { class: "hl-t", text: "Less" }),
            el("i", { class: "l0" }), el("i", { class: "l1" }), el("i", { class: "l2" }),
            el("i", { class: "l3" }), el("i", { class: "l4" }),
            el("span", { class: "hl-t", text: "More" })
          ])
        ]),
        el("div", { class: "heat-stats" }, [
          miniStat("Active days", activeDays + " / " + days.length),
          miniStat("Best subject", bestSubj ? subjName(bestSubj) : "—"),
          miniStat("Busiest day", busiest && busiest.value ? busiest.value + " sessions" : "—"),
          miniStat("This week", weekSecs ? Math.round(weekSecs / 60) + " min" : "—"),
          miniStat("Study streak", stks.all + (stks.all === 1 ? " day" : " days")),
          miniStat("Rest streak", stks.rest + (stks.rest === 1 ? " day" : " days"))
        ])
      ]);
      function miniStat(k, v) {
        return el("div", { class: "gstat gstat-mini" }, [
          el("div", { class: "gstat-top" }, [el("span", { class: "gstat-k", text: k })]),
          el("div", { class: "gstat-v", text: String(v) })
        ]);
      }
      bento.appendChild(bentoCard("b-heat", "Study cadence", [heat], "last 12 months"));

      /* — the ledger: meaningful acts only (routine sync is filed into the
           Session Log's Sync history instead) — */
      var led = el("div", { class: "ledger" });
      var recent = realSessions.slice(-8).reverse();
      if (!recent.length) led.appendChild(el("p", { class: "sub", text: "No sessions yet — finish a flashcard batch, quiz or focus block and it lands here." }));
      recent.forEach(function (s) { led.appendChild(ledgerRow(s)); });
      var ledKids = [led];
      ledKids.push(el("button", { class: "led-more", onclick: function () { KOS.show("governor", "history"); } },
        [routineCount ? "Full log · " + routineCount + " sync events filed separately →" : "Open the full session log →"]));
      bento.appendChild(bentoCard("b-ledger", "The ledger", ledKids, "meaningful acts"));

      /* recovery checklist — full-width when not healthy */
      if (hpCls !== "healthy") {
        var rec = el("div", { class: "gov-recovery b-wide" + (hpCls === "critical" ? " urgent" : "") });
        rec.appendChild(el("h3", { class: "n-h", text: hpCls === "critical" ? "Recovery Mode — fastest route back" : "Shortest route back to Healthy" }));
        KOS.governor.recoveryTasks().forEach(function (t) {
          var done = t.cur >= t.target;
          rec.appendChild(el("button", { class: "gov-rec-item" + (done ? " done" : ""), onclick: t.go }, [
            el("span", { class: "gov-rec-check", text: done ? "✓" : "○" }),
            el("span", { text: t.label }),
            el("span", { class: "gov-rec-n", text: t.cur + "/" + t.target })
          ]));
        });
        bento.appendChild(rec);
      }

      /* how HP moves — kept, full width below the bento */
      panel.appendChild(el("div", { class: "gov-rules" }, [
        el("div", { class: "gov-rule" }, [el("b", { text: "Drains" }), el("span", { text: "a day with zero logged sessions (−15), or a due-card backlog past " + KOS.governor.BACKLOG_LIMIT + " (−10/day)." })]),
        el("div", { class: "gov-rule" }, [el("b", { text: "Restores" }), el("span", { text: "completing sessions, clearing due reviews, ticking to-do items. Restores trickle at half rate while Critical." })]),
        el("div", { class: "gov-rule" }, [el("b", { text: "Never locks" }), el("span", { text: "spec reading, notes, personal notes, per-topic flashcards, quizzes, exam questions." })])
      ]));
    }

    function openProfileEditor() {
      KOS.governor.editProfileText(function (err, res) {
        if (res && res.cancelled) return;
        KOS.ui.toast("Profile updated.");
        render();
      });
    }

    /* ---------------- SHOP — the Treasury ----------------
       A ledger-style treasury strip, a sticky category rail, and one card
       shape whose preview changes with what is being sold. Every group stays
       rendered so the whole catalogue is browsable (and searchable) at once. */
    var SHOP_GROUPS = [
      { kind: "lab", label: "Labs & simulations", glyph: "験", blurb: "One-time permanent unlocks. Suspended, never lost, while HP is low." },
      { kind: "theme", label: "OS themes", glyph: "彩", blurb: "Repaint the whole interface. Applied instantly, switchable forever." },
      { kind: "banner", label: "Profile banners", glyph: "幟", blurb: "Painted backdrops for the identity card." },
      { kind: "seal", label: "Kanji seals", glyph: "印", blurb: "The mark in the topbar and your default avatar." },
      { kind: "frame", label: "Avatar frames", glyph: "環", blurb: "Rings worn around the profile picture." },
      { kind: "shelfskin", label: "Bookshelf skins", glyph: "棚", blurb: "The Physical tab in Books." },
      { kind: "shrinestyle", label: "Shrine card styles", glyph: "社", blurb: "Card treatment in the Shrine." }
    ];

    function renderShop() {
      var suspended = KOS.governor.hpState() !== "healthy";
      var cat = KOS.governor.catalog();
      var ownedN = cat.filter(function (c) { return KOS.governor.owns(c.id); }).length;
      var unowned = cat.filter(function (c) { return !KOS.governor.owns(c.id); });
      var affordable = unowned.filter(function (c) { return g.gold >= c.price; });
      var cheapest = unowned.slice().sort(function (a, b) { return a.price - b.price; })[0];

      var shop = el("div", { class: "shop-page" });
      panel.appendChild(shop);

      /* — treasury strip — */
      var treasury = el("div", { class: "treasury" + (suspended ? " is-suspended" : "") }, [
        el("div", { class: "tre-purse" }, [
          el("span", { class: "tre-coin", "aria-hidden": "true", text: "◈" }),
          el("div", {}, [
            el("div", { class: "tre-amt", text: String(g.gold) }),
            el("div", { class: "tre-lbl", text: "gold in the purse" })
          ])
        ]),
        el("div", { class: "tre-facts" }, [
          treFact(ownedN + " / " + cat.length, "unlocked"),
          treFact(String(affordable.length), "affordable now"),
          treFact(cheapest ? "◈ " + cheapest.price : "—", cheapest ? "next: " + cheapest.name : "everything owned")
        ])
      ]);
      function treFact(v, k) {
        return el("div", { class: "tre-fact" }, [el("b", { text: v }), el("span", { text: k })]);
      }
      shop.appendChild(treasury);
      if (suspended) {
        shop.appendChild(el("div", { class: "gov-banner bad", html:
          "<b>Shop suspended.</b> HP is " + state.label + " — purchases and purchased labs reopen at 60 HP. " +
          "Cosmetics you already own stay usable." }));
      }

      var body = el("div", { class: "shop-body" });
      shop.appendChild(body);

      /* — sticky category rail — */
      var rail = el("nav", { class: "shop-rail", "aria-label": "Shop categories" });
      var sections = el("div", { class: "shop-sections" });
      body.appendChild(rail);
      body.appendChild(sections);

      SHOP_GROUPS.forEach(function (grp) {
        var items = cat.filter(function (c) { return c.kind === grp.kind; });
        if (!items.length) return;
        var own = items.filter(function (c) { return KOS.governor.owns(c.id); }).length;
        var secId = "shop-sec-" + grp.kind;

        rail.appendChild(el("button", { class: "shop-rail-item" + (own === items.length ? " complete" : ""),
          onclick: function () {
            var t = document.getElementById(secId);
            if (t) t.scrollIntoView({ behavior: "smooth", block: "start" });
          } }, [
          el("span", { class: "sri-g", "aria-hidden": "true", text: grp.glyph }),
          el("span", { class: "sri-l", text: grp.label }),
          el("span", { class: "sri-n", text: own + "/" + items.length })
        ]));

        var sec = el("section", { class: "shop-sec", id: secId });
        sec.appendChild(el("div", { class: "shop-sec-h" }, [
          el("span", { class: "ssh-g", "aria-hidden": "true", text: grp.glyph }),
          el("div", {}, [
            el("h3", { text: grp.label }),
            el("p", { class: "sub", text: grp.blurb })
          ]),
          el("span", { class: "ssh-n", text: own + " of " + items.length + " owned" })
        ]));

        var row = el("div", { class: "shop-grid" });
        items.forEach(function (it) { row.appendChild(shopCard(it, grp, suspended)); });
        sec.appendChild(row);
        sections.appendChild(sec);
      });

      sections.appendChild(el("p", { class: "sub shop-earn",
        text: "Earning gold: session completions, streak milestones, quiz scores ≥80%, and clearing the due queue to zero. Worked examples, flashcards and quizzes are free forever." }));
    }

    function shopCard(it, grp, suspended) {
      var owned = KOS.governor.owns(it.id);
      var active = (it.kind === "theme" && (g.theme === it.theme)) ||
                   (it.kind === "seal" && (g.seal === it.id)) ||
                   (it.kind === "frame" && (g.avatar.frame === it.id)) ||
                   (it.kind === "shelfskin" && (g.shelfSkin === it.id)) ||
                   (it.kind === "shrinestyle" && (g.shrineStyle === it.id)) ||
                   (it.kind === "banner" && (g.banner === it.banner));
      var afford = g.gold >= it.price;
      var card = el("div", { class: "shop-card k-" + it.kind + (owned ? " owned" : "") +
        (active ? " is-active" : "") + (suspended && it.kind === "lab" ? " suspended" : "") +
        (!owned && !afford ? " unafford" : "") });

      /* --- the preview: what you are actually buying --- */
      card.appendChild(shopPreview(it, grp));

      card.appendChild(el("div", { class: "shop-card-h" }, [
        el("b", { text: it.name }),
        owned ? el("span", { class: "shop-owned" + (active ? " on" : ""), text: active ? "Active" : "Owned" })
              : el("span", { class: "shop-price" + (afford ? "" : " short"), text: "◈ " + it.price })
      ]));
      card.appendChild(el("p", { class: "sub", text: it.desc }));

      var foot = el("div", { class: "shop-card-f" });
      if (!owned) {
        var buyBtn = el("button", { class: "btn gold", text: afford ? "Buy — ◈ " + it.price : "◈ " + (it.price - g.gold) + " more needed",
          onclick: function () {
            var r = KOS.governor.buy(it.id);
            KOS.ui.toast(r.msg, !r.ok);
            if (r.ok) render();
          } });
        buyBtn.disabled = suspended || !afford;
        foot.appendChild(buyBtn);
      } else if (it.kind === "theme") {
        foot.appendChild(el("button", { class: "btn" + (active ? " primary" : ""), text: active ? "✓ Applied" : "Apply theme", onclick: function () {
          KOS.governor.setTheme(active ? "kurenai" : it.theme); render();
        } }));
      } else if (it.kind === "seal") {
        foot.appendChild(el("button", { class: "btn" + (active ? " primary" : ""), text: active ? "✓ Applied" : "Apply seal", onclick: function () {
          KOS.governor.setSeal(active ? "kurenai" : it.id); render();
        } }));
      } else if (it.kind === "frame") {
        foot.appendChild(el("button", { class: "btn" + (active ? " primary" : ""), text: active ? "✓ Worn" : "Wear frame", onclick: function () {
          g.avatar.frame = active ? null : it.id;
          store.save(); KOS.refreshHUD(); render();
        } }));
      } else if (it.kind === "shelfskin") {
        foot.appendChild(el("button", { class: "btn" + (active ? " primary" : ""), text: active ? "✓ Applied" : "Apply skin", onclick: function () {
          KOS.governor.setShelfSkin(active ? null : it.id); render();
        } }));
      } else if (it.kind === "shrinestyle") {
        foot.appendChild(el("button", { class: "btn" + (active ? " primary" : ""), text: active ? "✓ Applied" : "Apply style", onclick: function () {
          KOS.governor.setShrineStyle(active ? null : it.id); render();
        } }));
      } else if (it.kind === "banner") {
        foot.appendChild(el("button", { class: "btn" + (active ? " primary" : ""), text: active ? "✓ Hung" : "Hang banner", onclick: function () {
          KOS.governor.setBanner(active ? null : it.banner); render();
        } }));
      } else {
        foot.appendChild(el("span", { class: "shop-note", text: suspended ? "Suspended until HP recovers." : "Unlocked — reachable from its subject's Practice zone." }));
      }
      card.appendChild(foot);
      return card;
    }

    /* each lab gets its own mark so the section doesn't read as eight
       identical tiles */
    var LAB_GLYPH = { trace: "塔", oop: "継", "logic-lab": "論", "sort-viz": "序",
      "fsm-lab": "状", "fn-transform": "函", "trig-circle": "円", "integration-area": "積" };

    /* the visual sold by each card kind — a painted band for anything with a
       palette, the rendered seal for seals, a drawn ring for frames */
    function shopPreview(it, grp) {
      var pv = el("div", { class: "shop-pv pv-" + it.kind });
      if (it.kind === "banner") {
        var band = el("div", { class: "shop-pv-band" });
        band.style.cssText += KOS.governor.bannerPresetCss(it.banner) || "";
        pv.appendChild(band);
      } else if (it.kind === "theme") {
        var strip = el("div", { class: "shop-pv-theme" });
        (it.sw || []).forEach(function (c) {
          strip.appendChild(el("span", { class: "spt-band", style: "background:" + c }));
        });
        pv.appendChild(strip);
      } else if (it.kind === "seal") {
        /* shop seals are topbar MARK variants (they carry their own kanji),
           not entries in the avatar seal library — show the actual glyph */
        pv.appendChild(el("div", { class: "shop-pv-mark" }, [
          el("span", { class: "spm-k", "aria-hidden": "true", text: it.glyph || grp.glyph })
        ]));
      } else if (it.kind === "frame") {
        pv.appendChild(el("div", { class: "shop-pv-frame" }, [
          el("span", { class: "gov-avatar " + it.id, style: "width:56px;height:56px" }, [
            el("span", { class: "spf-fill", "aria-hidden": "true" })
          ])
        ]));
      } else {
        pv.appendChild(el("div", { class: "shop-pv-glyph", "aria-hidden": "true" }, [
          el("span", { text: LAB_GLYPH[it.id] || grp.glyph })
        ]));
      }
      /* the canonical swatch row stays on every palette-bearing item */
      if (it.sw) {
        pv.appendChild(el("div", { class: "shop-sw" }, it.sw.map(function (c) {
          return el("span", { class: "shop-sw-dot", style: "background:" + c });
        })));
      }
      return pv;
    }

    /* ---------------- AVATAR — the Atelier ----------------
       A living profile preview on the left (the same identity record the
       topbar popover renders), the workshop on the right. */
    function renderAvatar() {
      var p = KOS.governor.profile();
      var grid = el("div", { class: "av-grid" });
      panel.appendChild(grid);

      /* --- left: the live profile preview --- */
      var bannerCss = KOS.governor.bannerCss();
      var preview = el("div", { class: "av-preview" });
      var pvBanner = el("div", { class: "av-pv-banner" + (bannerCss && KOS.governor.bannerIsDark() ? " dark" : "") });
      if (bannerCss) KOS.governor.applyBanner(pvBanner, { darkScrim: true });
      else pvBanner.classList.add("plain");
      preview.appendChild(pvBanner);
      preview.appendChild(el("div", { class: "av-pv-body" }, [
        el("div", { class: "av-pv-avatar" }, [KOS.governor.avatarNode(96)]),
        el("div", { class: "av-pv-name", text: "Level " + p.level }),
        el("div", { class: "av-pv-rank", text: p.rank + " · Behavioural Governor" }),
        p.status ? el("div", { class: "av-pv-status", text: p.status }) : null,
        p.about ? el("p", { class: "av-pv-about", text: p.about }) : null,
        el("div", { class: "av-pv-meta" }, [
          el("span", { text: (g.avatar.kind === "custom" ? "Custom image" : (KOS.governor.sealById(g.avatar.id) || {}).name || "Ember seal") }),
          el("span", { text: g.avatar.frame ? (KOS.governor.item(g.avatar.frame) || {}).name : "No frame" }),
          el("span", { text: g.banner ? (g.banner === "custom" ? "Custom banner" : bannerName(g.banner)) : "No banner" })
        ]),
        el("button", { class: "btn av-pv-edit", text: "✎ Status & about", onclick: openProfileEditor })
      ].filter(Boolean)));
      grid.appendChild(preview);

      function bannerName(id) {
        var found = KOS.governor.catalog().find(function (c) { return c.kind === "banner" && c.banner === id; });
        return found ? found.name : "Banner";
      }

      /* --- right: the workshop --- */
      var ctl = el("div", { class: "av-controls" });
      grid.appendChild(ctl);

      /* portrait + banner, side by side — the two image sources */
      ctl.appendChild(avSection("Portrait & banner", "The two images that make up your identity. Both keep their full source, so you can reposition later without re-uploading.", [
        el("div", { class: "av-media" }, [
          avMediaCard({
            title: "Profile picture",
            has: g.avatar.kind === "custom" && !!g.avatar.img,
            thumb: KOS.governor.avatarNode(72),
            round: true,
            edit: function () {
              KOS.governor.editAvatar(function (err, result) {
                if (err) KOS.ui.toast("Upload failed: " + err.message, true);
                else if (!(result && result.cancelled)) { KOS.ui.toast("Avatar positioned and saved."); render(); }
              });
            },
            clear: (g.avatar.kind === "custom" && g.avatar.img) ? function () {
              g.avatar.kind = "seal"; g.avatar.img = null; g.avatar.crop = null;
              store.save(); KOS.refreshHUD(); render();
            } : null
          }),
          avMediaCard({
            title: "Profile banner",
            has: !!KOS.governor.bannerCss(),
            thumb: (function () {
              var t = el("span", { class: "av-mc-band" });
              if (!KOS.governor.applyBanner(t, { darkScrim: true })) t.classList.add("plain");
              return t;
            })(),
            edit: function () {
              KOS.governor.editBanner(function (err, result) {
                if (err) { KOS.ui.toast("Banner upload failed: " + err.message, true); return; }
                if (result && result.cancelled) return;
                KOS.ui.toast("Banner set."); render();
              });
            },
            clear: g.banner ? function () { KOS.governor.setBanner(null); render(); } : null
          })
        ])
      ]));

      /* seal library */
      var sgrid = el("div", { class: "seal-grid" });
      KOS.governor.seals().forEach(function (s) {
        var unlocked = KOS.governor.sealUnlocked(s);
        var active = g.avatar.kind === "seal" && g.avatar.id === s.id;
        var card = el("button", { class: "seal-card" + (active ? " active" : "") + (unlocked ? "" : " locked"),
          title: unlocked ? s.name : s.name + " — unlocks at level " + s.minLevel,
          onclick: function () {
            if (!unlocked) { KOS.ui.toast("Unlocks at level " + s.minLevel + " — you're level " + p.level + ".", true); return; }
            g.avatar.kind = "seal"; g.avatar.id = s.id;
            store.save(); KOS.refreshHUD(); render();
          } });
        card.innerHTML = KOS.governor.sealSvg(s);
        card.appendChild(el("span", { class: "seal-name", text: s.name }));
        card.appendChild(el("span", { class: "seal-lv", text: unlocked ? (active ? "Active" : "Unlocked") : "Lv " + s.minLevel }));
        if (!unlocked) card.appendChild(el("span", { class: "seal-lock", "aria-hidden": "true", text: "🔒" }));
        sgrid.appendChild(card);
      });
      ctl.appendChild(avSection("Seal library", "Unlocked by level. A seal is used as your avatar whenever no custom image is set.", [sgrid]));

      /* frames the user owns — rendered as the actual ring, not a text button */
      var frames = KOS.governor.catalog().filter(function (c) { return c.kind === "frame" && KOS.governor.owns(c.id); });
      var fGrid = el("div", { class: "frame-grid" });
      fGrid.appendChild(frameChip(null, "No frame", !g.avatar.frame));
      frames.forEach(function (fr) { fGrid.appendChild(frameChip(fr.id, fr.name, g.avatar.frame === fr.id)); });
      var lockedFrames = KOS.governor.catalog().filter(function (c) { return c.kind === "frame" && !KOS.governor.owns(c.id); });
      ctl.appendChild(avSection("Frame",
        lockedFrames.length ? lockedFrames.length + " more available in the Gold Shop." : "Every frame unlocked.",
        [fGrid]));

      function frameChip(id, label, on) {
        var chip = el("button", { class: "frame-chip" + (on ? " active" : ""), onclick: function () {
          g.avatar.frame = id; store.save(); KOS.refreshHUD(); render();
        } }, [
          el("span", { class: "fc-ring" }, [
            el("span", { class: "gov-avatar" + (id ? " " + id : ""), style: "width:52px;height:52px" }, [
              el("span", { class: "spf-fill", "aria-hidden": "true" })
            ])
          ]),
          el("span", { class: "frame-name", text: label })
        ]);
        return chip;
      }

      function avSection(title, blurb, kids) {
        return el("div", { class: "av-sec" }, [
          el("div", { class: "av-sec-h" }, [
            el("h4", { text: title }),
            blurb ? el("p", { class: "sub", text: blurb }) : null
          ].filter(Boolean))
        ].concat(kids));
      }
      function avMediaCard(o) {
        return el("div", { class: "av-mc" + (o.has ? " has" : "") }, [
          el("div", { class: "av-mc-thumb" + (o.round ? " round" : "") }, [o.thumb]),
          el("div", { class: "av-mc-txt" }, [
            el("b", { text: o.title }),
            el("span", { class: "sub", text: o.has ? "Set — edit to reposition" : "Not set" })
          ]),
          el("div", { class: "av-mc-btns" }, [
            el("button", { class: "btn primary", text: o.has ? "✎ Edit" : "＋ Add", onclick: o.edit }),
            o.clear ? el("button", { class: "btn", text: "Remove", onclick: o.clear }) : null
          ].filter(Boolean))
        ]);
      }
    }

    /* ---------------- HISTORY ----------------
       Meaningful acts by default. Routine integration traffic lives in its
       own Sync history category, coalesced per day + provider (Part C). */
    var LOG_CATS = [
      { id: "all", label: "Everything", match: function (e) { return !isRoutine(e); } },
      { id: "study", label: "Study", glyph: "学", match: function (e) { return ["flashcards", "due-review", "quiz", "exam", "focus"].indexOf(e.type) !== -1; } },
      { id: "media", label: "Collection", glyph: "蒐", match: function (e) { return e.type === "media" && !isRoutine(e); } },
      { id: "directives", label: "Directives", glyph: "勅", match: function (e) { return e.type === "todo"; } },
      { id: "papers", label: "Papers", glyph: "試", match: function (e) { return e.type === "tracker"; } },
      { id: "sync", label: "Sync history", glyph: "同", routine: true, match: isRoutine }
    ];
    function renderHistory() {
      var all = KOS.sessions.all().slice().reverse();
      if (!all.length) {
        panel.appendChild(el("p", { class: "sub", text: "No sessions logged yet. Finish a flashcard batch, quiz or exam question and it lands here." }));
        return;
      }
      var cur2 = "all";

      /* category summary boxes — the whole record broken down at a glance */
      var band = el("div", { class: "log-cats" });
      LOG_CATS.forEach(function (c) {
        if (c.id === "all") return;
        var n = all.filter(c.match).length;
        band.appendChild(el("button", { class: "log-cat" + (c.routine ? " is-routine" : ""), "data-cat": c.id,
          onclick: function () { setCat(c.id); } }, [
          el("span", { class: "log-cat-k", "aria-hidden": "true", text: c.glyph }),
          el("div", {}, [
            el("b", { text: String(n) }),
            el("span", { class: "log-cat-l", text: c.label })
          ])
        ]));
      });
      panel.appendChild(band);

      var seg = el("div", { class: "study-tabs log-seg", role: "tablist" });
      LOG_CATS.forEach(function (c) {
        seg.appendChild(el("button", { class: "study-tab" + (c.id === cur2 ? " active" : ""), "data-cat": c.id,
          onclick: function () { setCat(c.id); } }, [c.label]));
      });
      panel.appendChild(seg);

      var note = el("p", { class: "sub log-note" });
      panel.appendChild(note);
      var wrap = el("div", { class: "gov-log ledger" });
      panel.appendChild(wrap);

      function setCat(id) {
        cur2 = id;
        seg.querySelectorAll(".study-tab").forEach(function (b) { b.classList.toggle("active", b.dataset.cat === cur2); });
        band.querySelectorAll(".log-cat").forEach(function (b) { b.classList.toggle("active", b.dataset.cat === cur2); });
        draw();
      }
      function draw() {
        wrap.innerHTML = "";
        var cat = LOG_CATS.find(function (c) { return c.id === cur2; });
        var matched = all.filter(cat.match);

        if (cat.routine) {
          note.textContent = "Background integration traffic, collapsed to one line per provider per day. These entries are kept out of the main ledger on purpose.";
          var groups = coalesceRoutine(matched);
          if (!groups.length) { wrap.appendChild(el("p", { class: "sub", text: "No sync activity recorded." })); return; }
          var lastD = null;
          groups.slice(0, 90).forEach(function (b) {
            if (b.date !== lastD) { lastD = b.date; wrap.appendChild(dayHead(b.date)); }
            wrap.appendChild(routineRow(b));
          });
          return;
        }

        note.textContent = cur2 === "all"
          ? "Meaningful acts only — routine sync traffic lives under Sync history."
          : "";
        var rows = matched.slice(0, 120);
        if (!rows.length) { wrap.appendChild(el("p", { class: "sub", text: "Nothing in this category yet." })); return; }
        var lastDate = null;
        rows.forEach(function (e) {
          if (e.date !== lastDate) { lastDate = e.date; wrap.appendChild(dayHead(e.date)); }
          wrap.appendChild(KOS.governorLedgerRow(e));
        });
        if (matched.length > 120) wrap.appendChild(el("p", { class: "sub", text: "Showing the most recent 120 of " + matched.length + "." }));
      }
      function dayHead(dateISO) {
        var d = new Date(dateISO + "T12:00:00");
        return el("div", { class: "led-day", text:
          d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }) });
      }
      draw();
    }

    render();
  };
})();
