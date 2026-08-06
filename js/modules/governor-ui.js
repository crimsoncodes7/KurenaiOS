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
  var PAGE_META = {
    status: {
      kicker: "Command centre",
      title: "The Governor's Seat",
      copy: "Your identity, current access state, study rhythm, and recent milestones."
    },
    shop: {
      kicker: "Treasury",
      title: "Gold Shop",
      copy: "Spend earned gold on practice spaces and cosmetics. Core study tools remain free."
    },
    avatar: {
      kicker: "Identity",
      title: "Avatar & profile",
      copy: "Shape the profile shown across KurenaiOS with one shared portrait and banner cropper."
    },
    history: {
      kicker: "Chronicle",
      title: "Session Log",
      copy: "Browse meaningful activity by date and open an entry when you need its recorded detail."
    }
  };

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
    var pageMeta = PAGE_META[cur];
    var hpPreview = "live";
    try { hpPreview = sessionStorage.getItem("kos-governor-hp-preview") || "live"; } catch (e) {}
    if (["live", "full", "critical"].indexOf(hpPreview) === -1) hpPreview = "live";

    /* --- Part A: header carries the switcher; no strip above or below --- */
    var govTabs = KOS.workspaceTabs(TABS.map(function (t) { return [t[1], "governor", t[0], t[0]]; }),
      cur, "Governor pages", "gov-tabs");
    /* keep the data-tab hook every consumer of this switcher has used */
    govTabs.querySelectorAll(".study-tab").forEach(function (b, i) { b.dataset.tab = TABS[i][0]; });

    var head = el("div", { class: "dash-head gov-head" }, [
      el("div", { class: "dh-txt" }, [
        el("span", { class: "dh-kicker", text: pageMeta.kicker }),
        el("h1", { text: pageMeta.title }),
        el("div", { class: "dh-sub" }, [
          el("span", { class: "board", text: pageMeta.copy })
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

    var ACTION_TEXT = { progress: "Progress saved", completed: "Completed", added: "Added to the vault",
      status: "Status changed", dropped: "Set down", "reading-session": "Reading session",
      chapter: "Chapter completed", quote: "Quote saved", route: "Route cleared" };
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
    function activityInfo(s) {
      var m = s.metrics || {};
      var topic = s.subject ? subjName(s.subject) + (s.ref ? " " + s.ref : "") : null;
      var info = { icon: "◆", label: "Activity", title: "Activity recorded", detail: topic || "KurenaiOS", tone: "study", category: "study", meaningful: true };
      switch (s.type) {
        case "quiz":
          info.icon = "✓"; info.label = "Quiz"; info.title = "Quiz completed";
          info.detail = (topic || "Mixed topics") + (m.pct != null ? " · " + (m.pct || 0) + "%" : ""); break;
        case "exam":
          info.icon = "試"; info.label = "Paper"; info.title = "Exam practice marked";
          info.detail = (topic || "Mixed topics") + (m.max ? " · " + m.marks + "/" + m.max + " marks" : ""); break;
        case "flashcards":
          info.icon = "札"; info.label = "Review"; info.title = "Flashcard review complete";
          info.detail = (m.cards || 0) + " cards · " + (topic || "Mixed deck"); break;
        case "due-review":
          info.icon = "◎"; info.label = "Review"; info.title = "Due review cleared";
          info.detail = (m.cards || 0) + " scheduled cards"; break;
        case "focus":
          info.icon = m.complete ? "◉" : "◌"; info.label = "Focus";
          info.title = m.complete ? "Focus session completed" : "Focus session ended early";
          info.detail = (m.mins || Math.round((s.dur || 0) / 60)) + " min" + (topic ? " · " + topic : "");
          info.tone = m.complete ? "focus" : "muted"; info.category = "focus"; info.meaningful = !!m.complete; break;
        case "todo":
          info.icon = "✓"; info.label = "Task"; info.title = m.item || "Task completed";
          info.detail = "Checked off today's list"; info.tone = "task"; info.category = "tasks"; break;
        case "tracker":
          info.icon = "▤"; info.label = "Record"; info.title = "Paper result recorded";
          info.detail = topic || "Exam and paper records"; info.tone = "paper"; info.category = "papers"; break;
        case "media":
          info.category = "collection"; info.tone = "collection";
          if (m.action === "sync-reward") {
            info.icon = "↻"; info.label = "System"; info.title = providerName(m) + " sync completed";
            info.detail = (m.entries || 0) + " title" + (m.entries === 1 ? "" : "s") + " updated";
            info.category = "system"; info.tone = "system"; info.meaningful = false;
          } else if (m.action === "reading-session") {
            info.icon = "◫"; info.label = "Reading"; info.title = "Reading session completed";
            info.detail = (m.mins || "?") + " min" + (m.title ? " · " + m.title : "");
          } else {
            info.icon = m.action === "completed" ? "◇" : m.action === "chapter" ? "▣" : m.action === "route" ? "⌁" : "◫";
            info.label = "Collection"; info.title = ACTION_TEXT[m.action] || "Collection updated";
            info.detail = m.title || "Media library";
            info.meaningful = ["completed", "chapter", "route", "reading-session"].indexOf(m.action) !== -1;
          }
          break;
        default:
          info.title = String(s.type || "Activity").replace(/(^|-)([a-z])/g, function (_, gap, ch) { return (gap ? " " : "") + ch.toUpperCase(); });
      }
      return info;
    }
    function isMeaningful(s) {
      return !isRoutine(s) && activityInfo(s).meaningful;
    }
    function ledgerRow(s) {
      var info = activityInfo(s);
      return el("div", { class: "led-row gov-ledger-event tone-" + info.tone }, [
        el("span", { class: "gov-event-icon", "aria-hidden": "true", text: info.icon }),
        el("span", { class: "lt gov-event-copy" }, [
          el("b", { text: info.title }),
          info.detail ? el("span", { text: info.detail }) : null
        ].filter(Boolean)),
        el("time", { class: "when", datetime: s.date || "", text: relTime(s.ts) || s.date })
      ]);
    }
    KOS.governorLedgerRow = ledgerRow;

    /* a coalesced routine row — one per day + provider */
    function routineRow(b) {
      var desc = b.provider + " sync completed — " + b.entries + " entr" + (b.entries === 1 ? "y" : "ies") +
        " updated" + (b.syncs > 1 ? " across " + b.syncs + " syncs" : "");
      return el("div", { class: "led-row gov-ledger-event is-routine tone-system" }, [
        el("span", { class: "gov-event-icon", "aria-hidden": "true", text: "↻" }),
        el("span", { class: "lt gov-event-copy" }, [
          el("b", { text: b.provider + " sync completed" }),
          el("span", { text: desc.replace(b.provider + " sync completed — ", "") })
        ]),
        el("time", { class: "when", datetime: b.date || "", text: relTime(b.ts) || b.date })
      ]);
    }

    function renderStatus() {
      var p = KOS.governor.profile();
      var actualHpCls = KOS.governor.hpState();
      var displayHp = hpPreview === "full" ? 100 : hpPreview === "critical" ? 0 : p.hp;
      var hpCls = hpPreview === "full" ? "healthy" : hpPreview === "critical" ? "critical" : actualHpCls;
      var displayState = hpCls === "healthy"
        ? { label: "Healthy", desc: "Everything open." }
        : hpCls === "strained"
          ? { label: "Strained", desc: "Labs, simulations, and purchases are paused. Core study remains open." }
          : { label: "Critical", desc: "Recovery mode is visible. Core study remains open." };
      var bento = el("div", { class: "bento gov-status gov-" + hpCls });
      panel.appendChild(bento);
      var stks = KOS.sessions.streaks();
      var dayMs = 864e5;
      var allSessions = KOS.sessions.all();
      var realSessions = allSessions.filter(function (s) { return !isRoutine(s); });
      var meaningfulSessions = realSessions.filter(isMeaningful);
      var routineCount = allSessions.length - realSessions.length;

      /* — the unique identity stage: identity and state only; telemetry lives
         in the equal instrument strip below so nothing is repeated. — */
      var hasBanner = !!KOS.governor.bannerCss(), pState = displayState.label;
      var idCard = el("section", { class: "card bento-card b-id gov-seat-hero" + (hasBanner ? " has-banner" : "") +
        (hasBanner && KOS.governor.bannerIsDark() ? " banner-dark" : "") });
      if (hasBanner) KOS.governor.applyBanner(idCard, { darkScrim: true });
      var aboutBlock = el("div", { class: "id-about" });
      if (p.status) aboutBlock.appendChild(el("div", { class: "id-status" }, [
        el("span", { text: p.status })
      ]));
      if (p.about) aboutBlock.appendChild(el("p", { class: "id-about-txt", text: p.about }));
      if (!p.status && !p.about) aboutBlock.appendChild(el("button", {
        class: "id-about-empty", text: "＋ Set a status for your command seat",
        onclick: openProfileEditor }));

      idCard.appendChild(el("div", { class: "id-wrap" }, [
        el("div", { class: "id-face" }, [
          KOS.governor.avatarNode(140),
          el("button", { class: "id-face-edit", title: "Edit your profile picture", "aria-label": "Edit your profile picture",
            text: "✎", onclick: function () { KOS.show("governor", "avatar"); } })
        ]),
        el("div", { class: "id-txt" }, [
          el("div", { class: "rank", text: p.rank + " · Behavioural Governor" }),
          el("h2", { text: "Level " + p.level }),
          el("div", { class: "title-line" }, [
            el("span", { class: "gov-state-dot", "aria-hidden": "true" }),
            el("b", { text: pState }),
            el("span", { text: hpPreview === "live" ? "Live HP" : "UI preview" })
          ]),
          aboutBlock
        ]),
        el("aside", { class: "id-access", "aria-label": "Governor access state" }, [
          el("span", { class: "id-access-k", text: "Access state" }),
          el("strong", { text: hpCls === "healthy" ? "All systems open" : "Recovery mode" }),
          el("p", { text: hpCls === "healthy"
            ? "Labs, simulations, and the Gold Shop are available."
            : "Core study stays open; labs and purchases wait for recovery." }),
          el("div", { class: "hp-preview", role: "group", "aria-label": "Preview HP state" }, [
            el("span", { text: "Preview HP" }),
            hpPreviewButton("live", "Live"),
            hpPreviewButton("full", "Full"),
            hpPreviewButton("critical", "Off")
          ]),
          hpPreview !== "live" ? el("small", { class: "hp-preview-note", text: "Preview only · actual HP " + p.hp + "/100" }) : null,
          el("div", { class: "id-banner-ctl" }, [
            el("button", { class: "mini-btn", text: "Edit profile", title: "Edit your status and about", onclick: openProfileEditor }),
            el("button", { class: "mini-btn", text: "Edit banner", title: "Upload or reposition your profile banner",
              onclick: function () { KOS.governor.editBanner(function (err, result) {
                if (err) { KOS.ui.toast("Banner upload failed: " + err.message, true); return; }
                if (result && result.cancelled) return;
                KOS.ui.toast("Banner set.");
                render();
              }); } }),
            hasBanner ? el("button", { class: "mini-btn icon-only", text: "×", "aria-label": "Remove profile banner", title: "Remove the banner",
              onclick: function () { KOS.governor.setBanner(null); render(); } }) : null
          ].filter(Boolean))
        ])
      ]));
      bento.appendChild(idCard);

      function hpPreviewButton(value, label) {
        return el("button", { class: "hp-preview-btn" + (hpPreview === value ? " active" : ""),
          type: "button", "aria-pressed": hpPreview === value ? "true" : "false", text: label,
          onclick: function () {
            hpPreview = value;
            try { sessionStorage.setItem("kos-governor-hp-preview", value); } catch (e) {}
            render();
          } });
      }

      /* — five equal instruments: one place for every number — */
      var cheapest = KOS.governor.catalog()
        .filter(function (c) { return !KOS.governor.owns(c.id); })
        .sort(function (a, b) { return a.price - b.price; })[0];
      var dueCount = KOS.srs.dueCount();
      var vitals = el("div", { class: "vital-stack gov-instruments" }, [
        el("div", { class: "vital" }, [statTile({ cls: "hp", label: "HP", value: displayHp + " / 100", pct: displayHp,
          barCls: "hud-hp", hint: hpPreview === "live" ? displayState.desc : "UI preview · actual HP " + p.hp + "/100", warn: hpCls !== "healthy" })]),
        el("div", { class: "vital" }, [statTile({ cls: "xp", label: "XP", value: p.xpInto + " / " + p.xpNeed,
          pct: p.xpPct, barCls: "hud-xp", hint: p.xpToNext + " to level " + (p.level + 1) })]),
        el("div", { class: "vital" }, [statTile({ cls: "gold", label: "Gold", value: "◈ " + p.gold,
          pct: cheapest ? 100 * p.gold / cheapest.price : 100, barCls: "hud-gold",
          hint: cheapest ? (p.gold >= cheapest.price ? cheapest.name + " is affordable" : (cheapest.price - p.gold) + " to " + cheapest.name) : "Catalogue complete" })]),
        el("div", { class: "vital" }, [statTile({ cls: "due", label: "Review queue", value: String(dueCount),
          pct: Math.max(0, 100 - Math.min(100, dueCount * 3)), barCls: "hud-neutral", hint: dueCount ? "Ready in Review" : "Queue clear" })]),
        el("div", { class: "vital" }, [statTile({ cls: "streak", label: "Study streak", value: stks.all + (stks.all === 1 ? " day" : " days"),
          pct: Math.min(100, stks.all / 30 * 100), barCls: "hud-neutral", hint: stks.rest ? stks.rest + " rest day" + (stks.rest === 1 ? "" : "s") + " protected" : "Build from one completed session" })])
      ]);
      bento.appendChild(bentoCard("b-vitals", "Command instruments", [vitals], displayState.label));

      /* — ninety days at its native geometry: compact and never stretched — */
      var byDate = {};
      realSessions.forEach(function (s) { byDate[s.date] = (byDate[s.date] || 0) + 1; });
      var WEEKS = 13;
      var days = [];
      for (var j = WEEKS * 7 - 1; j >= 0; j--) {
        var dd = new Date(Date.now() - j * dayMs);
        var iso2 = dd.getFullYear() + "-" + ("0" + (dd.getMonth() + 1)).slice(-2) + "-" + ("0" + dd.getDate()).slice(-2);
        days.push({ date: iso2, value: byDate[iso2] || 0,
          hint: (byDate[iso2] || 0) + " session" + ((byDate[iso2] || 0) === 1 ? "" : "s") + " · " + iso2 });
      }
      var totalSess = days.reduce(function (a, d) { return a + d.value; }, 0);
      var activeDays = days.filter(function (d) { return d.value > 0; }).length;
      var since = days[0].date;
      var weekSecs = 0;
      var weekStart = KOS.srs.addDays(KOS.srs.todayISO(), -6);
      realSessions.forEach(function (s) {
        if (s.date >= weekStart && s.type !== "media") weekSecs += (s.dur || 0);
      });
      var heat = el("div", { class: "heat-wrap" }, [
        el("div", { class: "heat-svg" }, [KOS.charts.heatmap(days, { cell: 16, gap: 4 })]),
        el("div", { class: "heat-legend" }, [
          el("span", { class: "hl-num", text: totalSess + " session" + (totalSess === 1 ? "" : "s") + " in 90 days" }),
          el("span", { class: "hl-scale" }, [
            el("span", { class: "hl-t", text: "Less" }),
            el("i", { class: "l0" }), el("i", { class: "l1" }), el("i", { class: "l2" }),
            el("i", { class: "l3" }), el("i", { class: "l4" }),
            el("span", { class: "hl-t", text: "More" })
          ])
        ]),
        el("div", { class: "heat-stats" }, [
          miniStat("Active days", String(activeDays)),
          miniStat("This week", weekSecs ? Math.round(weekSecs / 60) + " min" : "0 min"),
          miniStat("Rest rhythm", stks.rest + (stks.rest === 1 ? " day" : " days"))
        ])
      ]);
      function miniStat(k, v) {
        return el("div", { class: "gstat gstat-mini" }, [
          el("div", { class: "gstat-top" }, [el("span", { class: "gstat-k", text: k })]),
          el("div", { class: "gstat-v", text: String(v) })
        ]);
      }
      bento.appendChild(bentoCard("b-heat", "Study cadence", [heat], "last 90 days"));

      /* — meaningful milestones only; progress noise and sync live in filters — */
      var led = el("div", { class: "ledger" });
      var recent = meaningfulSessions.slice(-5).reverse();
      if (!recent.length) led.appendChild(el("div", { class: "gov-empty compact" }, [
        el("span", { class: "gov-empty-mark", "aria-hidden": "true", text: "◇" }),
        el("div", {}, [
          el("b", { text: "Your first milestone is waiting" }),
          el("p", { text: "Complete a focus session, review, task, paper, or collection title." })
        ])
      ]));
      recent.forEach(function (s) { led.appendChild(ledgerRow(s)); });
      var ledKids = [led];
      ledKids.push(el("button", { class: "led-more", onclick: function () { KOS.show("governor", "history"); } },
        [routineCount ? "Open full log · " + routineCount + " system event" + (routineCount === 1 ? "" : "s") + " filed separately →" : "Open the full session log →"]));
      bento.appendChild(bentoCard("b-ledger", "Milestone ledger", ledKids, meaningfulSessions.length + " meaningful acts"));

      /* — one prescriptive dispatch instead of a long route map — */
      if (hpCls !== "healthy") {
        var nextTask = recoveryAction(dueCount);
        var rec = el("aside", { class: "gov-recovery b-wide" + (hpCls === "critical" ? " urgent" : ""), "aria-live": "polite" }, [
          el("div", { class: "gov-rec-signal", "aria-hidden": "true", text: "✦" }),
          el("div", { class: "gov-rec-copy" }, [
            el("span", { class: "gov-rec-eyebrow", text: hpCls === "critical" ? "Recovery dispatch" : "Route to Healthy" }),
            el("h3", { class: "n-h", text: nextTask.label }),
            el("p", { text: nextTask.detail })
          ]),
          el("div", { class: "gov-rec-progress" }, [
            el("span", { text: nextTask.cur + " / " + nextTask.target }),
            el("div", { class: "hud-bar hud-hp", "aria-label": "Recovery task progress" }, [
              el("span", { style: "width:" + Math.min(100, 100 * nextTask.cur / nextTask.target) + "%" })
            ])
          ]),
          el("button", { class: "btn primary gov-rec-go", text: "Start this step →", onclick: nextTask.go })
        ]);
        bento.appendChild(rec);
      }

      function recoveryAction(due) {
        if (due > 0) {
          var target = Math.min(5, due);
          return { label: "Review " + target + " due flashcard" + (target === 1 ? "" : "s"), cur: 0, target: target,
            detail: due + " card" + (due === 1 ? " is" : "s are") + " ready now. Review opens directly to that queue.",
            go: function () { KOS.show("due"); } };
        }
        return { label: "Complete a 15-minute focus block", cur: 0, target: 15,
          detail: "Your review queue is clear. Focus Timer is available now and completed study time restores HP.",
          go: function () { KOS.show("focus"); } };
      }

      /* rules remain accessible without competing with current status */
      panel.appendChild(el("details", { class: "gov-rules-note" }, [
        el("summary", { text: "How HP and access work" }),
        el("div", { class: "gov-rules" }, [
          el("div", { class: "gov-rule" }, [el("b", { text: "Drains" }), el("span", { text: "A fully missed day costs 15 HP; a due backlog past " + KOS.governor.BACKLOG_LIMIT + " costs 10 HP per day." })]),
          el("div", { class: "gov-rule" }, [el("b", { text: "Restores" }), el("span", { text: "Completed sessions, due reviews, and tasks restore HP. Recovery is slower while Critical." })]),
          el("div", { class: "gov-rule" }, [el("b", { text: "Always open" }), el("span", { text: "Specification, notes, flashcards, quizzes, and exam questions never lock." })])
        ])
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
    var BIG_LABS = ["trace", "oop"];
    var SHOP_GROUPS = [
      { id: "tools", domain: "tools", label: "Learning tools", glyph: "⌘", blurb: "Deep interactive workspaces for practising a full method.", match: function (c) { return c.kind === "lab" && BIG_LABS.indexOf(c.id) !== -1; } },
      { id: "simulations", domain: "simulations", label: "Simulations", glyph: "◉", blurb: "Focused visual experiments attached to relevant specification points.", match: function (c) { return c.kind === "lab" && BIG_LABS.indexOf(c.id) === -1; } },
      { id: "themes", domain: "cosmetics", label: "OS themes", glyph: "彩", blurb: "Repaint the whole interface. Applied instantly and switchable forever.", match: function (c) { return c.kind === "theme"; } },
      { id: "banners", domain: "cosmetics", label: "Profile banners", glyph: "幟", blurb: "Painted backdrops for your identity stage.", match: function (c) { return c.kind === "banner"; } },
      { id: "seals", domain: "cosmetics", label: "Profile seals", glyph: "印", blurb: "Identity marks presented in the context where you will wear them.", match: function (c) { return c.kind === "seal"; } },
      { id: "frames", domain: "cosmetics", label: "Avatar frames", glyph: "環", blurb: "Rings worn around your profile picture.", match: function (c) { return c.kind === "frame"; } },
      { id: "shelves", domain: "cosmetics", label: "Bookshelf skins", glyph: "棚", blurb: "Material treatments for the Physical Books shelf.", match: function (c) { return c.kind === "shelfskin"; } },
      { id: "shrines", domain: "cosmetics", label: "Shrine card styles", glyph: "社", blurb: "Card treatments for the Shrine collection.", match: function (c) { return c.kind === "shrinestyle"; } }
    ];
    var SHOP_DEPTS = [
      { id: "all", label: "All wares", hint: "Full catalogue" },
      { id: "tools", label: "Learning tools", hint: "Deep practice" },
      { id: "simulations", label: "Simulations", hint: "Visual experiments" },
      { id: "cosmetics", label: "Cosmetics", hint: "Profile & atmosphere" }
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
        shop.appendChild(el("div", { class: "gov-banner bad shop-lock-note" }, [
          el("span", { class: "shop-lock-icon", "aria-hidden": "true", text: "◇" }),
          el("div", {}, [
            el("b", { text: "Purchases are paused, not lost." }),
            el("span", { text: " HP is " + state.label + ". The shop and purchased labs reopen at 60 HP; essential study tools stay available." })
          ]),
          el("button", { class: "btn", text: "View recovery", onclick: function () { KOS.show("governor", "status"); } })
        ]));
      }

      var activeDept = "all";
      var deptBar = el("div", { class: "shop-depts", role: "tablist", "aria-label": "Shop departments" });
      SHOP_DEPTS.forEach(function (d) {
        deptBar.appendChild(el("button", { class: "shop-dept" + (d.id === activeDept ? " active" : ""),
          role: "tab", "aria-selected": d.id === activeDept ? "true" : "false", "data-dept": d.id,
          onclick: function () { setDepartment(d.id); } }, [
          el("span", { text: d.label }), el("small", { text: d.hint })
        ]));
      });
      shop.appendChild(deptBar);

      var body = el("div", { class: "shop-body" });
      shop.appendChild(body);

      /* — sticky category rail — */
      var rail = el("nav", { class: "shop-rail", "aria-label": "Shop categories" });
      var sections = el("div", { class: "shop-sections" });
      body.appendChild(rail);
      body.appendChild(sections);

      SHOP_GROUPS.forEach(function (grp) {
        var items = cat.filter(grp.match);
        if (!items.length) return;
        var own = items.filter(function (c) { return KOS.governor.owns(c.id); }).length;
        var secId = "shop-sec-" + grp.id;

        rail.appendChild(el("button", { class: "shop-rail-item" + (own === items.length ? " complete" : ""),
          "data-domain": grp.domain,
          onclick: function () {
            var t = document.getElementById(secId);
            if (t) t.scrollIntoView({ behavior: "smooth", block: "start" });
          } }, [
          el("span", { class: "sri-g", "aria-hidden": "true", text: grp.glyph }),
          el("span", { class: "sri-l", text: grp.label }),
          el("span", { class: "sri-n", text: own + "/" + items.length })
        ]));

        var sec = el("section", { class: "shop-sec", id: secId, "data-domain": grp.domain });
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

      function setDepartment(id) {
        activeDept = id;
        deptBar.querySelectorAll(".shop-dept").forEach(function (b) {
          var on = b.dataset.dept === activeDept;
          b.classList.toggle("active", on);
          b.setAttribute("aria-selected", on ? "true" : "false");
        });
        sections.querySelectorAll(".shop-sec").forEach(function (sec) {
          sec.hidden = activeDept !== "all" && sec.dataset.domain !== activeDept;
        });
        rail.querySelectorAll(".shop-rail-item").forEach(function (b) {
          b.hidden = activeDept !== "all" && b.dataset.domain !== activeDept;
        });
      }

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
        el("div", { class: "shop-card-title" }, [
          el("span", { class: "shop-kind", text: grp.domain === "tools" ? "Learning tool" : grp.domain === "simulations" ? "Simulation" : "Cosmetic" }),
          el("b", { text: it.name })
        ]),
        owned ? el("span", { class: "shop-owned" + (active ? " on" : ""), text: active ? "Active" : "Owned" })
              : el("span", { class: "shop-price" + (afford ? "" : " short"), text: "◈ " + it.price })
      ]));
      card.appendChild(el("p", { class: "sub", text: it.desc }));
      if (it.kind === "lab") card.appendChild(el("p", { class: "shop-access-note", text: "Core revision stays free. This unlock adds an interactive practice surface." }));

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

    /* Functional cards show the interaction a learner receives, not an
       unexplained glyph. These miniature scenes are CSS-native and remain
       crisp in every theme and at every density. */
    var LAB_MARK = {
      trace: { mark: "⇄", label: "step through" }, oop: { mark: "{ }", label: "compose classes" },
      "logic-lab": { mark: "⊢", label: "test a truth" }, "sort-viz": { mark: "▥", label: "compare passes" },
      "fsm-lab": { mark: "⟲", label: "follow a state" }, "fn-transform": { mark: "f(x)", label: "move a graph" },
      "trig-circle": { mark: "◯", label: "turn the circle" }, "integration-area": { mark: "∫", label: "measure area" }
    };

    /* the visual sold by each card kind — a painted band for anything with a
       palette, the rendered seal for seals, a drawn ring for frames */
    function shopPreview(it, grp) {
      var pv = el("div", { class: "shop-pv pv-" + it.kind });
      if (it.kind === "banner") {
        var band = el("div", { class: "shop-pv-band" });
        band.style.cssText += KOS.governor.bannerPresetCss(it.banner) || "";
        pv.appendChild(band);
        pv.appendChild(el("span", { class: "shop-preview-label", text: "Profile banner" }));
      } else if (it.kind === "theme") {
        var strip = el("div", { class: "shop-pv-theme" });
        (it.sw || []).forEach(function (c) {
          strip.appendChild(el("span", { class: "spt-band", style: "background:" + c }));
        });
        pv.appendChild(strip);
        pv.appendChild(el("span", { class: "shop-preview-label", text: "Interface palette" }));
      } else if (it.kind === "seal") {
        pv.appendChild(el("div", { class: "shop-pv-mark sp-seal-brand", "aria-hidden": "true" }, [
          el("span", { class: "sp-seal-avatar" }, [el("span", { class: "spm-k", text: it.glyph || grp.glyph })]),
          el("span", { class: "sp-seal-copy" }, [el("b", { text: "Kurenai" }), el("small", { text: "Topbar seal" })])
        ]));
      } else if (it.kind === "frame") {
        var framedAvatar = KOS.governor.avatarNode(68);
        framedAvatar.classList.add(it.id);
        pv.appendChild(el("div", { class: "shop-pv-frame" }, [framedAvatar]));
      } else if (it.kind === "shelfskin") {
        pv.appendChild(el("div", { class: "sp-shelf " + it.id, "aria-hidden": "true" }, [
          el("span", { class: "sp-books" }, [el("i"), el("i"), el("i"), el("i"), el("i")]),
          el("span", { class: "sp-shelf-board" })
        ]));
      } else if (it.kind === "shrinestyle") {
        pv.appendChild(el("div", { class: "sp-shrine " + it.id, "aria-hidden": "true" }, [
          el("span", { class: "sp-shrine-card back" }),
          el("span", { class: "sp-shrine-card front" }, [el("i"), el("i")])
        ]));
      } else {
        var lab = LAB_MARK[it.id] || { mark: "◎", label: "explore" };
        pv.appendChild(el("div", { class: "shop-lab-scene", "aria-hidden": "true" }, [
          el("span", { class: "sp-lab-chrome" }, [el("i"), el("i"), el("i")]),
          el("span", { class: "sp-lab-mark", text: lab.mark }),
          el("span", { class: "sp-lab-label", text: lab.label }),
          el("span", { class: "sp-lab-steps" }, [el("i"), el("i"), el("i"), el("i")])
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
      var grid = el("div", { class: "av-grid avatar-studio" });
      panel.appendChild(grid);

      /* --- left: the live profile preview --- */
      var bannerCss = KOS.governor.bannerCss();
      var preview = el("aside", { class: "av-preview identity-stage", "aria-label": "Live Governor profile preview" });
      var pvBanner = el("div", { class: "av-pv-banner" + (bannerCss && KOS.governor.bannerIsDark() ? " dark" : "") });
      if (bannerCss) KOS.governor.applyBanner(pvBanner, { darkScrim: true });
      else pvBanner.classList.add("plain");
      pvBanner.appendChild(el("span", { class: "av-stage-label", text: "Live identity" }));
      preview.appendChild(pvBanner);
      preview.appendChild(el("div", { class: "av-pv-body" }, [
        el("div", { class: "av-pv-identity" }, [
          el("div", { class: "av-pv-avatar" }, [KOS.governor.avatarNode(96)]),
          p.status ? el("div", { class: "av-pv-status profile-speech", "aria-label": "Profile status", text: p.status }) : null
        ].filter(Boolean)),
        el("div", { class: "av-pv-name", text: "Level " + p.level }),
        el("div", { class: "av-pv-rank", text: p.rank + " · Behavioural Governor" }),
        p.about ? el("p", { class: "av-pv-about", text: p.about }) : null,
        el("div", { class: "av-pv-meta" }, [
          el("span", {}, [el("small", { text: "Portrait" }), (g.avatar.kind === "custom" ? "Custom image" : (KOS.governor.sealById(g.avatar.id) || {}).name || "Ember seal")]),
          el("span", {}, [el("small", { text: "Frame" }), g.avatar.frame ? (KOS.governor.item(g.avatar.frame) || {}).name : "None"]),
          el("span", {}, [el("small", { text: "Banner" }), g.banner ? (g.banner === "custom" ? "Custom banner" : bannerName(g.banner)) : "None"])
        ]),
        el("button", { class: "btn av-pv-edit", text: "Edit status & about", onclick: openProfileEditor })
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
      ctl.appendChild(avSection("Profile", "Portrait, banner, status, and about are shared everywhere this identity appears. Images retain their full source for repositioning.", [
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
      var unlockedSeals = KOS.governor.seals().filter(function (seal) { return KOS.governor.sealUnlocked(seal); }).length;
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
      ctl.appendChild(avSection("Seal library", unlockedSeals + " of " + KOS.governor.seals().length + " unlocked by level. Seals become your portrait when no custom image is active.", [sgrid]));

      /* frames the user owns — rendered as the actual ring, not a text button */
      var frames = KOS.governor.catalog().filter(function (c) { return c.kind === "frame" && KOS.governor.owns(c.id); });
      var fGrid = el("div", { class: "frame-grid" });
      fGrid.appendChild(frameChip(null, "No frame", !g.avatar.frame));
      frames.forEach(function (fr) { fGrid.appendChild(frameChip(fr.id, fr.name, g.avatar.frame === fr.id)); });
      var lockedFrames = KOS.governor.catalog().filter(function (c) { return c.kind === "frame" && !KOS.governor.owns(c.id); });
      var frameKids = [fGrid];
      if (lockedFrames.length) frameKids.push(el("button", { class: "av-shop-link", text: "Browse " + lockedFrames.length + " locked frame" + (lockedFrames.length === 1 ? "" : "s") + " in the Gold Shop →", onclick: function () { KOS.show("governor", "shop"); } }));
      ctl.appendChild(avSection("Frames", lockedFrames.length ? "Owned frames are ready to wear; the rest are cosmetic Gold Shop unlocks." : "Every frame is unlocked.", frameKids));

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
      { id: "all", label: "All activity", glyph: "◇", match: function (e) { return !isRoutine(e); } },
      { id: "study", label: "Study", glyph: "学", match: function (e) { return ["flashcards", "due-review", "quiz", "exam"].indexOf(e.type) !== -1; } },
      { id: "focus", label: "Focus", glyph: "◉", match: function (e) { return e.type === "focus"; } },
      { id: "tasks", label: "Tasks", glyph: "✓", match: function (e) { return e.type === "todo"; } },
      { id: "collection", label: "Collection", glyph: "蒐", match: function (e) { return e.type === "media" && !isRoutine(e); } },
      { id: "papers", label: "Papers", glyph: "試", match: function (e) { return e.type === "tracker"; } },
      { id: "system", label: "System", glyph: "↻", routine: true, match: isRoutine }
    ];
    function renderHistory() {
      var all = KOS.sessions.all().slice().reverse();
      var cur2 = "all", visible = 30;
      var human = all.filter(function (e) { return !isRoutine(e); });
      var activeDates = {};
      human.forEach(function (e) { activeDates[e.date] = true; });

      var history = el("div", { class: "gov-history" });
      panel.appendChild(history);
      function historyStat(value, label) {
        return el("span", { class: "gov-history-stat" }, [el("b", { text: value }), el("small", { text: label })]);
      }

      /* A compact filter row replaces the previous wall of stat cards. */
      var band = el("div", { class: "log-cats log-filterbar", role: "tablist", "aria-label": "Session categories" });
      LOG_CATS.forEach(function (c) {
        var n = all.filter(c.match).length;
        band.appendChild(el("button", { class: "log-cat" + (c.routine ? " is-routine" : ""), "data-cat": c.id,
          role: "tab", "aria-selected": c.id === cur2 ? "true" : "false",
          onclick: function () { setCat(c.id); } }, [
          el("span", { class: "log-cat-k", "aria-hidden": "true", text: c.glyph }),
          el("span", { class: "log-cat-l", text: c.label }),
          el("b", { text: String(n) })
        ]));
      });
      history.appendChild(el("div", { class: "gov-history-tools" }, [
        band,
        el("div", { class: "gov-history-stats", "aria-label": "Session history summary" }, [
          historyStat(String(human.length), "actions"),
          historyStat(String(Object.keys(activeDates).length), "active days"),
          historyStat(String(human.filter(isMeaningful).length), "milestones")
        ])
      ]));

      var note = el("p", { class: "sub log-note", role: "status", "aria-live": "polite" });
      history.appendChild(note);
      var wrap = el("div", { class: "gov-log ledger gov-timeline" });
      history.appendChild(wrap);
      var pager = el("div", { class: "gov-log-pager" });
      history.appendChild(pager);

      function setCat(id) {
        cur2 = id; visible = 30;
        band.querySelectorAll(".log-cat").forEach(function (b) {
          var on = b.dataset.cat === cur2;
          b.classList.toggle("active", on);
          b.setAttribute("aria-selected", on ? "true" : "false");
        });
        draw();
      }
      function draw() {
        wrap.innerHTML = "";
        pager.innerHTML = "";
        var cat = LOG_CATS.find(function (c) { return c.id === cur2; });
        var matched = all.filter(cat.match);

        if (cat.routine) {
          note.textContent = "Technical integration traffic · collapsed to one record per provider and day.";
          var groups = coalesceRoutine(matched);
          if (!groups.length) { wrap.appendChild(emptyLog("System is quiet", "No provider sync activity has been recorded.")); return; }
          var lastD = null;
          groups.slice(0, visible).forEach(function (b) {
            if (b.date !== lastD) { lastD = b.date; wrap.appendChild(dayHead(b.date, groups.filter(function (g2) { return g2.date === b.date; }).length)); }
            wrap.appendChild(routineRow(b));
          });
          addPager(groups.length);
          return;
        }

        note.textContent = cur2 === "all" ? "Technical sync is hidden here and available under System." : matched.length + " recorded " + cat.label.toLowerCase() + " event" + (matched.length === 1 ? "" : "s") + ".";
        var rows = matched.slice(0, visible);
        if (!rows.length) {
          wrap.appendChild(emptyLog(all.length ? "Nothing filed here yet" : "Begin your chronicle",
            all.length ? "Complete an activity in this category and its details will appear here." : "Finish a focus block, review, quiz, task, paper, or collection title to create your first entry."));
          return;
        }
        var lastDate = null;
        rows.forEach(function (e) {
          if (e.date !== lastDate) { lastDate = e.date; wrap.appendChild(dayHead(e.date, matched.filter(function (r) { return r.date === e.date; }).length)); }
          wrap.appendChild(historyRow(e));
        });
        addPager(matched.length);
      }
      function addPager(total) {
        if (total <= visible) return;
        pager.appendChild(el("button", { class: "btn gov-log-more", text: "Show " + Math.min(30, total - visible) + " more · " + visible + " of " + total,
          onclick: function () { visible += 30; draw(); } }));
      }
      function dayHead(dateISO, count) {
        var d = new Date(dateISO + "T12:00:00");
        return el("div", { class: "led-day" }, [
          el("span", { text: d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) }),
          el("small", { text: count + " event" + (count === 1 ? "" : "s") })
        ]);
      }
      function emptyLog(title, copy) {
        return el("div", { class: "gov-empty gov-log-empty" }, [
          el("span", { class: "gov-empty-mark", "aria-hidden": "true", text: "◇" }),
          el("div", {}, [el("b", { text: title }), el("p", { text: copy })]),
          !all.length ? el("button", { class: "btn primary", text: "Open Review", onclick: function () { KOS.show("due"); } }) : null
        ].filter(Boolean));
      }
      function historyRow(e) {
        var info = activityInfo(e), m = e.metrics || {};
        var details = el("details", { class: "led-row gov-log-event tone-" + info.tone });
        details.appendChild(el("summary", { class: "gov-log-summary" }, [
          el("span", { class: "gov-event-icon", "aria-hidden": "true", text: info.icon }),
          el("span", { class: "lt gov-event-copy" }, [el("small", { text: info.label }), el("b", { text: info.title }), info.detail ? el("span", { text: info.detail }) : null].filter(Boolean)),
          el("time", { class: "when", datetime: e.date || "", text: e.ts ? new Date(e.ts).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : e.date }),
          el("span", { class: "gov-event-chevron", "aria-hidden": "true", text: "+" })
        ]));
        var facts = [];
        if (e.subject) facts.push(["Subject", subjName(e.subject)]);
        if (e.ref) facts.push(["Topic", e.ref]);
        if (e.dur) facts.push(["Duration", Math.max(1, Math.round(e.dur / 60)) + " min"]);
        /* Build 6.5 — a focus session's objective, how it went and where its
           notes were filed are part of the record, so the chronicle shows
           them beside the numbers rather than only in the timer. */
        if (m.objective) facts.push(["Objective", m.objective]);
        if (m.objectiveResult) facts.push(["Objective result", { met: "Met", partly: "Partly met", missed: "Missed" }[m.objectiveResult] || m.objectiveResult]);
        if (m.reflection) facts.push(["Reflection", m.reflection]);
        if (m.notesFiledTo) facts.push(["Notes filed to", m.notesFiledTo]);
        if (m.selfMarks) facts.push(["Self-marked", String(m.selfMarks)]);
        [["cards", "Cards"], ["pct", "Score"], ["correct", "Correct"], ["total", "Questions"], ["marks", "Marks"], ["max", "Available"], ["pauses", "Pauses"], ["distractions", "Distractions"], ["entries", "Entries updated"], ["advances", "Status advances"]].forEach(function (pair) {
          if (m[pair[0]] !== undefined && m[pair[0]] !== null) facts.push([pair[1], String(m[pair[0]]) + (pair[0] === "pct" ? "%" : "")]);
        });
        var detailBox = el("div", { class: "gov-event-details" }, [
          el("p", { text: info.detail || "Recorded by KurenaiOS." }),
          facts.length ? el("dl", {}, facts.map(function (f) { return el("div", {}, [el("dt", { text: f[0] }), el("dd", { text: f[1] })]); })) : el("span", { class: "sub", text: "No extra metrics were recorded for this event." })
        ]);
        details.appendChild(detailBox);
        details.addEventListener("toggle", function () { details.querySelector(".gov-event-chevron").textContent = details.open ? "−" : "+"; });
        return details;
      }
      draw();
    }

    render();
  };
})();
