/* Kurenai OS — modules/governor-ui.js
   The Behavioural Governor: Status (the Seat), the Gold Shop, Avatar &
   profile and the Session Log (FR-3.2 surfaced).

   Graphite step 6 (frames 12a–12d). Status is an identity stage on the
   user's banner beside a stack of four instruments, the study cadence and
   the milestone ledger beneath, and the three HP rules as a strip; below
   Healthy the recovery dispatch (12a2) joins them with the checklist from
   KOS.governor.recoveryTasks(). The shop is a balance band, a department
   rail and one card shape whose preview is what is being sold. Avatar is
   the live identity beside its workshop. The Session Log is day groups of
   rows with the open entry in a panel beside them.

   INVARIANT 2 overrides the frames wherever they disagree: HP gates
   nothing. The frames say purchases pause while Strained or Critical; they
   do not — the dispatch says so, and so does the shop.

   Navigation shape: the four pages ride KOS.workspaceTabs in the page
   header, like the Collection planner/sync workspaces.

   Ledger policy: routine integration housekeeping — the one session an
   autosync cycle logs — is CLASSIFIED as routine and kept out of the
   meaningful ledger. It is never dropped from the session log itself (the
   governor prices from that log; invariants #1/#5), only filed into the
   Session Log's System category, coalesced per day + provider.

   Rewards are not stored on a session, so a row prints only what the
   record itself determines: a Focus row its award (KOS.governor.focusAward,
   the one pure definition — invariant 4a), a Collection row "rest"
   (invariant 3). Nothing re-derives the rest after the fact. */
(function () {
  "use strict";
  var el = KOS.ui.el, store = KOS.store;

  function addHook(node, hook) {
    node.setAttribute("data-ui", ((node.getAttribute("data-ui") || "") + " " + hook).trim());
    return node;
  }

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
      copy: "One portrait, banner and status, shared everywhere your profile appears."
    },
    history: {
      kicker: "Chronicle",
      title: "Session Log",
      copy: "Everything you have done, by day. Open an entry for its recorded detail."
    }
  };

  /* ---------------- ledger classification ----------------
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
      if (s.ts > b.ts) b.ts = s.ts;   // newest wins for the time
    });
    return order.map(function (k) { return byKey[k]; });
  }

  var ACTION_TEXT = { progress: "Progress saved", completed: "Completed", added: "Added to the vault",
    status: "Status changed", dropped: "Set down", "reading-session": "Reading session",
    chapter: "Chapter completed", quote: "Quote saved", route: "Route cleared" };
  /* the chip tone of each category (frame 12d) */
  var CAT_TONE = { study: "teal", focus: "crimson", tasks: "green", papers: "amber", collection: "bloom", system: "muted" };

  function subjName(sid) {
    return sid && KOS_DATA[sid] ? KOS_DATA[sid].name.replace("Computer Science", "CS").replace("Mathematics", "Maths") : sid;
  }
  function clock(ts) {
    return ts ? new Date(ts).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "";
  }
  function shortDate(iso) {
    return new Date(iso + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  }
  /* "09:52" today, "Yesterday", else "12 Sep" — the ledger's when */
  function whenOf(s) {
    var today = KOS.srs.todayISO();
    if (s.date === today) return clock(s.ts);
    if (s.date === KOS.srs.addDays(today, -1)) return "Yesterday";
    return shortDate(s.date);
  }
  function activityInfo(s) {
    var m = s.metrics || {};
    var topic = s.subject ? subjName(s.subject) + (s.ref ? " " + s.ref : "") : null;
    var info = { label: "Activity", title: "Activity recorded", detail: topic || "KurenaiOS", category: "study", meaningful: true };
    switch (s.type) {
      case "quiz":
        info.label = "Quiz"; info.title = "Quiz completed";
        info.detail = (topic || "Mixed topics") + (m.pct != null ? " · " + (m.pct || 0) + "%" : ""); break;
      case "exam":
        info.label = "Paper"; info.title = "Exam practice marked";
        info.detail = (topic || "Mixed topics") + (m.max ? " · " + m.marks + "/" + m.max + " marks" : ""); break;
      case "flashcards":
        info.label = "Review"; info.title = "Flashcard review complete";
        info.detail = (topic || "Mixed deck") + " · " + (m.cards || 0) + " cards"; break;
      case "due-review":
        info.label = "Review"; info.title = "Due review cleared";
        info.detail = (m.cards || 0) + " scheduled cards"; break;
      case "focus":
        info.label = "Focus";
        info.title = m.complete ? "Focus session completed" : "Focus session ended early";
        info.detail = (topic ? topic + " · " : "") + (m.mins || Math.round((s.dur || 0) / 60)) + " min";
        info.category = "focus"; info.meaningful = !!m.complete; break;
      case "todo":
        info.label = "Task"; info.title = m.item || "Task completed";
        info.detail = "Checked off today's list"; info.category = "tasks"; break;
      case "tracker":
        info.label = "Paper"; info.title = "Paper result recorded";
        info.detail = topic || "Exam and paper records"; info.category = "papers"; break;
      case "media":
        info.category = "collection";
        if (m.action === "sync-reward") {
          info.label = "System"; info.title = providerName(m) + " sync completed";
          info.detail = (m.entries || 0) + " title" + (m.entries === 1 ? "" : "s") + " updated";
          info.category = "system"; info.meaningful = false;
        } else if (m.action === "reading-session") {
          info.label = "Reading"; info.title = "Reading session completed";
          info.detail = (m.title ? m.title + " · " : "") + (m.mins || "?") + " min";
        } else {
          info.label = "Collection"; info.title = ACTION_TEXT[m.action] || "Collection updated";
          info.detail = m.title || "Media library";
          info.meaningful = ["completed", "chapter", "route", "reading-session"].indexOf(m.action) !== -1;
        }
        break;
      default:
        info.title = String(s.type || "Activity").replace(/(^|-)([a-z])/g, function (_, gap, ch) { return (gap ? " " : "") + ch.toUpperCase(); });
    }
    info.tone = CAT_TONE[info.category] || "muted";
    return info;
  }
  function isMeaningful(s) {
    return !isRoutine(s) && activityInfo(s).meaningful;
  }
  /* what the record itself says it paid — see the header */
  function rewardOf(s) {
    if (s.type === "focus") {
      var a = KOS.governor.focusAward(s.metrics || {});
      return a.forfeited ? { text: "award forfeited", tone: "red" }
        : { text: "+" + a.xp + " XP · +" + a.gold + " ◆", tone: "gold" };
    }
    if (s.type === "media" && !isRoutine(s)) return { text: "rest", tone: "teal" };
    return null;
  }

  KOS.views.governor = function (main, openTab) {
    KOS.shell.tree("none");
    var g = store.state.governor;
    var cur = TABS.some(function (t) { return t[0] === openTab; }) ? openTab : "status";
    var pageMeta = PAGE_META[cur];
    var hpPreview = "live";
    try { hpPreview = sessionStorage.getItem("kos-governor-hp-preview") || "live"; } catch (e) {}
    if (["live", "full", "critical"].indexOf(hpPreview) === -1) hpPreview = "live";

    var govTabs = addHook(KOS.workspaceTabs(TABS.map(function (t) { return [t[1], "governor", t[0], t[0]]; }),
      cur, "Governor pages"), "gov.tabs");
    /* keep the data-tab hook every consumer of this switcher has used */
    govTabs.querySelectorAll("[data-ui~='ui.tab']").forEach(function (b, i) { b.dataset.tab = TABS[i][0]; });
    main.appendChild(addHook(KOS.ui.pageHeader({ kicker: pageMeta.kicker, title: pageMeta.title,
      sub: pageMeta.copy, actions: [govTabs] }), "gov.head"));

    var panel = el("div", { class: "k-gv", "data-ui": "study.panel gov.workspace", "data-page": cur });
    main.appendChild(panel);

    function render() {
      g = store.state.governor;
      panel.innerHTML = "";
      if (cur === "status") renderStatus();
      else if (cur === "shop") renderShop();
      else if (cur === "avatar") renderAvatar();
      else renderHistory();
    }
    function openProfileEditor() {
      KOS.governor.editProfileText(function (err, res) {
        if (res && res.cancelled) return;
        KOS.ui.toast("Status updated.");
        render();
      });
    }
    function editBanner() {
      KOS.governor.editBanner(function (err, result) {
        if (err) { KOS.ui.toast("Banner upload failed: " + err.message, true); return; }
        if (result && result.cancelled) return;
        KOS.ui.toast("Banner set.");
        render();
      });
    }
    function sealGlyph() {
      var it = g.seal && g.seal !== "kurenai" ? KOS.governor.item(g.seal) : null;
      return (it && it.glyph) || "紅";
    }
    /* the portrait in its HP ring with the worn seal as a badge — the
       Status hero and the Avatar preview draw the same one */
    function ring(size, hp, hpCls, tag, attrs) {
      var node = el(tag || "span", Object.assign({ class: "k-gv-ring", "data-hp": hpCls }, attrs || {}), [
        KOS.governor.avatarNode(size),
        el("span", { class: "k-gv-ring-seal", lang: "ja", "aria-hidden": "true", text: sealGlyph() })
      ]);
      node.style.setProperty("--hp", Math.max(0, Math.min(100, hp)) + "%");
      return node;
    }
    function bar(pct, tone, hook) {
      var b = el("span", { class: "k-bar", "data-ui": hook || null, "data-tone": tone || null, "aria-hidden": "true" }, [el("i")]);
      b.style.setProperty("--p", Math.max(0, Math.min(100, pct || 0)) + "%");
      return b;
    }
    function cardHead(title, meta, end) {
      return el("div", { class: "k-card-head" }, [
        el("span", { class: "k-card-title", text: title }),
        meta ? el("span", { class: "k-card-meta", text: meta }) : null,
        end || null
      ].filter(Boolean));
    }

    /* ================= STATUS — the Seat (12a / 12a2) ================= */
    function renderStatus() {
      var p = KOS.governor.profile();
      var displayHp = hpPreview === "full" ? 100 : hpPreview === "critical" ? 0 : p.hp;
      var hpCls = hpPreview === "full" ? "healthy" : hpPreview === "critical" ? "critical" : KOS.governor.hpState();
      var hpLabel = { healthy: "Healthy", strained: "Strained", critical: "Critical" }[hpCls];
      var stks = KOS.sessions.streaks();
      var allSessions = KOS.sessions.all();
      var realSessions = allSessions.filter(function (s) { return !isRoutine(s); });
      var meaningfulSessions = realSessions.filter(isMeaningful);
      var dueCount = KOS.srs.dueCount();

      var seat = el("div", { class: "k-gv-seat", "data-ui": "gov.bento gov.status", "data-hp": hpCls });
      panel.appendChild(seat);

      /* — the identity stage and the instrument stack — */
      var hasBanner = !!KOS.governor.bannerCss();
      var hero = el("section", { class: "k-gv-hero", "data-ui": "gov.bento-id gov.seat", "aria-label": "Your identity" });
      if (hasBanner) {
        KOS.ui.state(hero, "has-banner", true);
        /* a painted preset has no scrim of its own; an upload carries it */
        KOS.ui.state(hero, "preset-banner", g.banner !== "custom");
        KOS.governor.applyBanner(hero, { scrim: "governor" });
      }
      var txt = el("div", { class: "k-gv-hero-txt" }, [
        el("div", { class: "k-kicker k-gv-rank", text: p.rank + " · Behavioural Governor" }),
        el("h2", { class: "k-gv-name", text: "Level " + p.level }),
        p.status ? el("div", { class: "k-gv-status-line", "data-ui": "gov.id-status", text: p.status }) : null,
        !p.status ? el("button", { type: "button", class: "k-gv-about-empty",
          text: "＋ Set a status for your command seat", onclick: openProfileEditor }) : null,
        el("div", { class: "k-gv-xp", "data-ui": "gov.xp" }, [
          bar(p.xpPct, "ink"),
          el("span", { class: "k-mono", text: KOS.ui.num(p.xpToNext) + " XP to " + (p.level + 1) })
        ])
      ].filter(Boolean));

      /* the access row: state chip (the dispatch replaces it in Critical),
         profile edit, the HP preview, and the banner controls */
      var access = el("div", { class: "k-gv-access", "data-ui": "gov.id-access", role: "group", "aria-label": "Governor access state" }, [
        hpCls === "critical" ? null : el("span", { class: "k-chip", "data-tone": hpCls === "healthy" ? "green" : "amber",
          text: hpCls === "healthy" ? "● All systems open" : "● Strained · nothing locks" }),
        el("button", { type: "button", class: "k-btn k-btn--sm", text: "Edit status", onclick: openProfileEditor }),
        el("div", { class: "k-seg k-seg--quiet k-gv-preview", "data-ui": "gov.hp-preview", role: "group", "aria-label": "Preview HP state" }, [
          el("span", { class: "k-gv-preview-k", text: "Preview" }),
          hpPreviewButton("live", "Live"),
          hpPreviewButton("full", "Full"),
          hpPreviewButton("critical", "Off")
        ]),
        hpPreview !== "live" ? el("small", { class: "k-gv-preview-note", text: "Preview only · actual HP " + p.hp + "/100" }) : null,
        /* review aid: the whole app on an empty or a sample account, each a
           separate namespace (store.js KOS.dataMode) — never this data */
        el("div", { class: "k-seg k-seg--quiet k-gv-preview", "data-ui": "gov.data-mode", role: "group", "aria-label": "Which account the app shows" }, [
          el("span", { class: "k-gv-preview-k", text: "Data" }),
          dataModeButton("", "Mine"),
          dataModeButton("empty", "Empty"),
          dataModeButton("sample", "Sample")
        ]),
        el("div", { class: "k-gv-banner-ctl" }, [
          el("button", { type: "button", class: "k-btn k-btn--sm", text: "Edit banner", title: "Upload or reposition your profile banner", onclick: editBanner }),
          hasBanner ? el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", text: "×", "aria-label": "Remove profile banner",
            title: "Remove the banner", onclick: function () { KOS.governor.setBanner(null); render(); } }) : null
        ].filter(Boolean))
      ].filter(Boolean));
      txt.appendChild(access);

      hero.appendChild(el("div", { class: "k-gv-hero-body" }, [
        ring(120, displayHp, hpCls, "button", { type: "button", "data-ui": "gov.face",
          "aria-label": "Edit your profile picture", title: "Edit your profile picture",
          onclick: function () { KOS.show("governor", "avatar"); } }),
        txt
      ]));

      function dataModeButton(value, label) {
        var cur = (KOS.dataMode && KOS.dataMode.mode) || "";
        return el("button", { type: "button", class: "k-seg-item", "data-ui": "gov.data-mode-btn",
          "aria-pressed": cur === value ? "true" : "false", text: label,
          onclick: function () {
            if (cur === value) return;
            KOS.ui.confirm({
              title: value === "sample" ? "Show the sample account?" : value === "empty" ? "Show an empty account?" : "Back to your data?",
              body: value
                ? "The app reloads into a separate " + (value === "sample" ? "sample account, filled in everywhere" : "account with nothing added") +
                  ". Your own data is untouched, and cloud and provider sync stay off until you switch back to Mine."
                : "The app reloads into your own account, with sync back on.",
              confirm: value ? "Switch" : "Back to mine"
            }, function () { KOS.dataMode.set(value); });
          } });
      }
      function hpPreviewButton(value, label) {
        return el("button", { type: "button", class: "k-seg-item", "data-ui": "gov.hp-preview-btn",
          "aria-pressed": hpPreview === value ? "true" : "false", text: label,
          onclick: function () {
            hpPreview = value;
            try { sessionStorage.setItem("kos-governor-hp-preview", value); } catch (e) {}
            render();
          } });
      }

      /* four instruments: HP, Gold (a balance — no bar, invariant 78), the
         review queue against the backlog line, and the streak toward its
         next bonus. XP is the hero's own bar. */
      var cheapest = KOS.governor.catalog()
        .filter(function (c) { return !KOS.governor.owns(c.id); })
        .sort(function (a, b) { return a.price - b.price; })[0];
      var limit = KOS.governor.BACKLOG_LIMIT || 30;
      var nextBonus = [3, 7, 14, 30, 60, 100].filter(function (m) { return m > stks.all; })[0];
      var prevBonus = [0, 3, 7, 14, 30, 60, 100].filter(function (m) { return m <= stks.all; }).pop();
      var stack = el("div", { class: "k-gv-stack", "data-ui": "gov.b-vitals gov.instruments", "aria-label": "Instruments" }, [
        instrument({ kind: "hp", label: hpPreview === "live" ? "Live HP" : "HP preview", value: displayHp + " / 100",
          hint: hpLabel + (hpCls === "healthy" ? " · everything open" : " · nothing locks"), tone: hpCls, pct: displayHp }),
        instrument({ kind: "gold", label: "Gold", value: "◆ " + KOS.ui.num(p.gold), tone: "gold", bar: false,
          hint: cheapest ? (p.gold >= cheapest.price ? cheapest.name + " is affordable" : KOS.ui.num(cheapest.price - p.gold) + " to " + cheapest.name) : "Catalogue complete" }),
        instrument({ kind: "due", label: "Review queue", value: KOS.ui.num(dueCount), tone: "teal",
          hint: dueCount ? (dueCount > limit ? (dueCount - limit) + " past the backlog line" : "Ready in Review") : "Queue clear",
          pct: 100 * Math.min(dueCount, limit) / limit }),
        instrument({ kind: "streak", label: "Study streak", value: stks.all + (stks.all === 1 ? " day" : " days"), tone: "crimson",
          hint: nextBonus ? (nextBonus - stks.all) + " to the " + nextBonus + "-day bonus" : "Every streak bonus earned",
          pct: nextBonus ? 100 * (stks.all - prevBonus) / (nextBonus - prevBonus) : 100 })
      ]);
      function instrument(o) {
        var node = el("div", { class: "k-gv-stat", "data-ui": "gov.vital gov.stat", "data-kind": o.kind, "data-tone": o.tone }, [
          el("span", { class: "k-gv-stat-k", "data-ui": "gov.vital-label", text: o.label }),
          el("span", { class: "k-gv-stat-v", "data-ui": "gov.vital-v", text: o.value }),
          el("span", { class: "k-gv-stat-h", text: o.hint }),
          o.bar === false ? null : bar(o.pct, o.tone, "gov.vital-bar")
        ].filter(Boolean));
        if (o.bar === false) KOS.ui.state(node, "no-meter", true);
        return node;
      }
      seat.appendChild(el("div", { class: "k-gv-top" }, [hero, stack]));

      /* — the recovery dispatch (12a2): below Healthy, the checklist that
         climbs back. Nothing is locked; it says so. — */
      if (hpCls !== "healthy") seat.appendChild(recovery(hpCls, displayHp));

      /* — cadence and the ledger — */
      seat.appendChild(el("div", { class: "k-gv-mid" }, [cadence(realSessions, stks), ledger(meaningfulSessions, allSessions.length - realSessions.length)]));

      /* — the three rules, always in view — */
      seat.appendChild(el("section", { class: "k-gv-rules", "data-ui": "gov.rules", "aria-label": "How HP works" }, [
        rule("red", "Drains", "A fully missed day costs 15 HP. A due backlog past " + limit + " cards costs 10 HP a day."),
        rule("green", "Restores", "Completed sessions, due reviews and tasks restore HP. Recovery is slower while Critical."),
        rule("teal", "Always open", "Specification, notes, flashcards, quizzes, exam questions and Focus never lock.")
      ]));
      function rule(tone, title, body) {
        return el("div", { class: "k-gv-rule", "data-tone": tone }, [
          el("b", { class: "k-gv-rule-h" }, [el("span", { class: "k-gv-dot", "aria-hidden": "true" }), title]),
          el("p", { text: body })
        ]);
      }
    }

    function recovery(hpCls, hp) {
      var tasks = KOS.governor.recoveryTasks();
      var done = tasks.filter(function (t) { return t.cur >= t.target; }).length;
      var goal = hpCls === "critical" ? 30 : 60;
      var segs = el("div", { class: "k-gv-rec-segs", "aria-hidden": "true" });
      tasks.forEach(function (t, i) { segs.appendChild(el("span", { "data-state": i < done ? "done" : null })); });
      var list = el("div", { class: "k-gv-rec-list", role: "list", "aria-label": "Recovery checklist" });
      tasks.forEach(function (t) {
        var ok = t.cur >= t.target;
        list.appendChild(el("div", { class: "k-gv-rec-item", role: "listitem", "data-state": ok ? "done" : null }, [
          el("span", { class: "k-gv-rec-mark", "aria-hidden": "true", text: ok ? "✓" : "" }),
          el("span", { class: "k-gv-rec-label", text: t.label + (t.target > 1 && !ok ? " · " + t.cur + "/" + t.target : "") }),
          ok ? el("span", { class: "k-gv-rec-done", text: "Done" })
             : el("button", { type: "button", class: "k-link k-gv-rec-go", "data-ui": "gov.rec-go", text: "Start →",
                 "aria-label": "Start: " + t.label, onclick: t.go })
        ]));
      });
      return el("section", { class: "k-gv-recovery", "data-ui": "gov.recovery gov.bento-wide", "data-hp": hpCls, "aria-label": "Recovery dispatch" }, [
        el("div", { class: "k-gv-rec-card" }, [
          el("div", { class: "k-kicker k-gv-rec-eyebrow", text: "Recovery dispatch · " + (hpCls === "critical" ? "Critical" : "Strained") }),
          el("h3", { class: "k-gv-rec-title", text: "Route to Healthy" }),
          el("p", { class: "k-gv-rec-copy", text: hpCls === "critical"
            ? "Nothing locks. HP restores at half rate while Critical — these three climb back fastest."
            : "Nothing locks. The drains are catching up — these three restore HP today." }),
          segs,
          el("div", { class: "k-mono k-gv-rec-meta", text: done + " of " + tasks.length + " · HP " + hp + " → " + goal +
            (hpCls === "critical" ? " to leave Critical" : " to reach Healthy") })
        ]),
        list
      ]);
    }

    /* 26 weeks at the shared heatmap's own geometry; Study counts the
       study ledger, Rest rhythm the Collection's (invariant 3) */
    function cadence(realSessions, stks) {
      var WEEKS = 26, mode = "study";
      var card = el("section", { class: "k-card k-gv-cadence", "data-ui": "gov.b-heat", "aria-label": "Study cadence" });
      var body = el("div", { class: "k-gv-heat" });
      var seg = KOS.ui.tabs([
        { label: "Study", active: true, onSelect: function () { set("study"); } },
        { label: "Rest rhythm", onSelect: function () { set("rest"); } }
      ], { variant: "card", label: "Cadence" });
      card.appendChild(cardHead("Study cadence", "last " + WEEKS + " weeks", el("span", { class: "k-gv-cad-seg" }, [seg])));
      card.appendChild(body);
      function set(m) {
        mode = m;
        seg.querySelectorAll("[role='tab']").forEach(function (b, i) {
          var on = (i === 0) === (m === "study");
          b.setAttribute("aria-selected", String(on));
          KOS.ui.state(b, "active", on);
        });
        draw();
      }
      function draw() {
        body.innerHTML = "";
        var rest = mode === "rest";
        var byDate = {};
        realSessions.forEach(function (s) {
          if ((s.type === "media") === rest) byDate[s.date] = (byDate[s.date] || 0) + 1;
        });
        var days = [], today = KOS.srs.todayISO();
        for (var j = WEEKS * 7 - 1; j >= 0; j--) {
          var iso = KOS.srs.addDays(today, -j), n = byDate[iso] || 0;
          days.push({ date: iso, value: n, hint: n + (rest ? " rest session" : " session") + (n === 1 ? "" : "s") + " · " + iso });
        }
        var active = days.filter(function (d) { return d.value > 0; }).length;
        var weekStart = KOS.srs.addDays(today, -6), weekSecs = 0, weekN = 0;
        realSessions.forEach(function (s) {
          if (s.date >= weekStart && (s.type === "media") === rest) { weekSecs += (s.dur || 0); weekN++; }
        });
        body.appendChild(el("div", { class: "k-gv-heat-chart", "data-ui": "chart.heatmap", role: "img",
          "aria-label": active + " active " + (rest ? "rest " : "") + "days in the last " + WEEKS + " weeks" },
          [KOS.charts.heatmap(days, { cell: 15, gap: 4, color: rest ? "var(--teal)" : "var(--crimson)" })]));
        var facts = [];
        if (active) facts.push(el("span", {}, [el("b", { text: String(active) }), " active days"]));
        if (weekSecs) facts.push(el("span", {}, [el("b", { text: weekSecs >= 3600 ? (Math.round(weekSecs / 360) / 10) + "h" : Math.round(weekSecs / 60) + " min" }), " this week"]));
        else if (weekN) facts.push(el("span", {}, [el("b", { text: String(weekN) }), " this week"]));
        if (rest && stks.rest) facts.push(el("span", {}, [el("b", { text: String(stks.rest) }), " rest-day streak"]));
        if (!facts.length) facts.push(el("span", { text: rest ? "No rest sessions in " + WEEKS + " weeks" : "No sessions in " + WEEKS + " weeks" }));
        var scale = el("span", { class: "k-gv-heat-scale", "aria-hidden": "true" }, ["Less"]);
        [1, 2, 3, 4].forEach(function (l) { scale.appendChild(el("i", { "data-level": String(l) })); });
        scale.appendChild(document.createTextNode("More"));
        facts.push(scale);
        body.appendChild(el("div", { class: "k-gv-heat-foot", "data-ui": "gov.heat-stats", "data-mode": mode }, facts));
      }
      draw();
      return card;
    }

    /* meaningful milestones only; progress noise and sync live in the log */
    function ledger(meaningful, routineCount) {
      var card = el("section", { class: "k-card k-gv-ledger", "data-ui": "gov.b-ledger", "aria-label": "Milestone ledger" });
      card.appendChild(cardHead("Milestone ledger", null, el("button", { type: "button", class: "k-link", "data-ui": "gov.ledger-more",
        text: "Open full log →", title: routineCount ? routineCount + " system event" + (routineCount === 1 ? "" : "s") + " filed under System" : null,
        onclick: function () { KOS.show("governor", "history"); } })));
      var recent = meaningful.slice(-5).reverse();
      if (!recent.length) card.appendChild(KOS.ui.emptyState({ compact: true, mark: "◇",
        title: "Your first milestone is waiting",
        body: "Complete a focus session, review, task, paper, or collection title." }));
      recent.forEach(function (s) {
        var info = activityInfo(s), rw = rewardOf(s);
        card.appendChild(el("div", { class: "k-gv-led-row", "data-ui": "gov.ledger-row", "data-tone": info.tone }, [
          el("span", { class: "k-gv-dot", "aria-hidden": "true" }),
          el("div", { class: "k-gv-led-txt" }, [
            el("div", { class: "k-gv-led-title", "data-ui": "part.lead", text: info.title }),
            el("div", { class: "k-gv-led-sub" }, [info.detail + " · ", el("time", { datetime: s.date || "", text: whenOf(s) })])
          ]),
          rw ? el("span", { class: "k-gv-reward", "data-tone": rw.tone, text: rw.text }) : null
        ].filter(Boolean)));
      });
      return card;
    }

    /* ================= SHOP — the Treasury (12b) =================
       A balance band, a department rail and one card shape whose preview
       is what is being sold. Every section stays rendered so the whole
       catalogue is browsable (and searchable); the rail narrows it. */
    var BIG_LABS = ["trace", "oop"];
    var SHOP_GROUPS = [
      { id: "tools", domain: "tools", label: "Learning tools", match: function (c) { return c.kind === "lab" && BIG_LABS.indexOf(c.id) !== -1; } },
      { id: "simulations", domain: "simulations", label: "Simulations", match: function (c) { return c.kind === "lab" && BIG_LABS.indexOf(c.id) === -1; } },
      { id: "themes", domain: "cosmetics", label: "OS themes", match: function (c) { return c.kind === "theme"; } },
      { id: "banners", domain: "cosmetics", label: "Profile banners", match: function (c) { return c.kind === "banner"; } },
      { id: "seals", domain: "cosmetics", label: "Profile seals", match: function (c) { return c.kind === "seal"; } },
      { id: "frames", domain: "cosmetics", label: "Avatar frames", match: function (c) { return c.kind === "frame"; } },
      { id: "shelves", domain: "cosmetics", label: "Bookshelf skins", match: function (c) { return c.kind === "shelfskin"; } },
      { id: "shrines", domain: "cosmetics", label: "Shrine card styles", match: function (c) { return c.kind === "shrinestyle"; } }
    ];
    var KIND_LABEL = { tools: "Learning tool", simulations: "Simulation", cosmetics: "Cosmetic" };

    function renderShop() {
      var cat = KOS.governor.catalog();
      var ownedN = cat.filter(function (c) { return KOS.governor.owns(c.id); }).length;
      var unowned = cat.filter(function (c) { return !KOS.governor.owns(c.id); });
      var affordable = unowned.filter(function (c) { return g.gold >= c.price; });
      var cheapest = unowned.slice().sort(function (a, b) { return a.price - b.price; })[0];

      var shop = el("div", { class: "k-gv-shop", "data-ui": "gov.shop" });
      panel.appendChild(shop);

      /* — the balance band — */
      var facts = [el("div", { class: "k-gv-bal-fact" }, [el("span", { text: "Catalogue" }), el("b", { text: ownedN + " of " + cat.length + " owned" })])];
      if (affordable.length) facts.push(el("div", { class: "k-gv-bal-fact" }, [el("span", { text: "Within reach" }), el("b", { text: KOS.ui.num(affordable.length) + " affordable now" })]));
      facts.push(cheapest
        ? el("div", { class: "k-gv-bal-fact" }, [el("span", { text: "Cheapest ware" }), el("b", { text: "next: " + cheapest.name + " · ◈ " + KOS.ui.num(cheapest.price) })])
        : el("div", { class: "k-gv-bal-fact" }, [el("span", { text: "Catalogue" }), el("b", { text: "all wares owned" })]));
      shop.appendChild(el("section", { class: "k-gv-balance", "data-ui": "gov.treasury", "aria-label": "Balance" }, [
        el("div", { class: "k-gv-bal-purse" }, [
          el("div", { class: "k-kicker", text: "Balance" }),
          el("div", { class: "k-gv-bal-amt", text: "◈ " + KOS.ui.num(g.gold) })
        ]),
        el("span", { class: "k-gv-bal-rule", "aria-hidden": "true" }),
        el("p", { class: "k-gv-bal-copy", text: "Earned from focus cycles, reviews, quizzes and papers. Gold buys practice spaces and cosmetics — it never unlocks study, and HP never locks the shop." }),
        el("div", { class: "k-gv-bal-facts", "data-ui": "gov.treasury-facts" }, facts)
      ]));

      /* — the rail and the wares — */
      var groups = SHOP_GROUPS.map(function (grp) {
        var items = cat.filter(grp.match);
        return { grp: grp, items: items, own: items.filter(function (c) { return KOS.governor.owns(c.id); }).length };
      }).filter(function (x) { return x.items.length; });
      function count(domain) {
        return groups.filter(function (x) { return !domain || x.grp.domain === domain; })
          .reduce(function (a, x) { return a + x.items.length; }, 0);
      }
      var rail = el("div", { class: "k-gv-rail", "data-ui": "shop.depts", role: "tablist", "aria-orientation": "vertical", "aria-label": "Shop departments" });
      var sections = el("div", { class: "k-gv-wares", id: "gov-shop-wares" });
      function railItem(o) {
        return el("button", { type: "button", class: "k-gv-rail-item" + (o.sub ? " k-gv-rail-sub" : ""), role: "tab",
          "aria-selected": "false", "aria-controls": "gov-shop-wares", "data-ui": o.hook,
          "data-dept": o.dept || null, "data-group": o.group || null, "data-domain": o.domain || null,
          onclick: function () { select(o.dept ? { dept: o.dept } : { group: o.group }); } }, [
          el("span", { class: "k-gv-rail-l", text: o.label }),
          el("span", { class: "k-gv-rail-n", text: String(o.n) })
        ]);
      }
      function railLabel(text) { return el("div", { class: "k-gv-rail-label", "aria-hidden": "true", text: text }); }
      rail.appendChild(railItem({ hook: "shop.dept", dept: "all", label: "All wares", n: count() }));
      rail.appendChild(railLabel("Deep practice"));
      rail.appendChild(railItem({ hook: "shop.dept", dept: "tools", label: "Learning tools", n: count("tools") }));
      rail.appendChild(railItem({ hook: "shop.dept", dept: "simulations", label: "Simulations", n: count("simulations") }));
      rail.appendChild(railLabel("Cosmetics"));
      rail.appendChild(railItem({ hook: "shop.dept", dept: "cosmetics", label: "All cosmetics", n: count("cosmetics") }));
      groups.filter(function (x) { return x.grp.domain === "cosmetics"; }).forEach(function (x) {
        rail.appendChild(railItem({ hook: "shop.rail-item", group: x.grp.id, domain: "cosmetics", label: x.grp.label, n: x.items.length, sub: true }));
      });

      groups.forEach(function (x) {
        var grid = el("div", { class: "k-gv-ware-grid" });
        x.items.forEach(function (it) { grid.appendChild(shopCard(it, x.grp)); });
        sections.appendChild(el("section", { class: "k-gv-ware-sec", "data-ui": "shop.section", id: "shop-sec-" + x.grp.id,
          "data-domain": x.grp.domain, "data-group": x.grp.id, "aria-label": x.grp.label }, [
          el("div", { class: "k-gv-ware-head" }, [
            el("h3", { text: x.grp.label }),
            el("span", { class: "k-card-meta", text: x.own ? x.own + " of " + x.items.length + " owned" : x.items.length + " to unlock" })
          ]),
          grid
        ]));
      });
      sections.appendChild(el("p", { class: "k-gv-earn", text: "Gold comes from session completions, streak milestones, quiz scores of 80% or more and clearing the due queue. Worked examples, flashcards and quizzes are free forever." }));
      shop.appendChild(el("div", { class: "k-gv-shop-body" }, [rail, sections]));

      /* the catalogue opens on All wares */
      select({ dept: "all" });
      function select(sel) {
        rail.querySelectorAll("[role='tab']").forEach(function (b) {
          var on = sel.dept ? b.dataset.dept === sel.dept : b.dataset.group === sel.group;
          b.setAttribute("aria-selected", on ? "true" : "false");
          KOS.ui.state(b, "active", on);
        });
        sections.querySelectorAll("[data-ui~='shop.section']").forEach(function (sec) {
          sec.hidden = sel.group ? sec.dataset.group !== sel.group
            : sel.dept !== "all" && sec.dataset.domain !== sel.dept;
        });
      }
    }

    function shopCard(it, grp) {
      var owned = KOS.governor.owns(it.id);
      var active = (it.kind === "theme" && g.theme === it.theme) ||
                   (it.kind === "seal" && g.seal === it.id) ||
                   (it.kind === "frame" && g.avatar.frame === it.id) ||
                   (it.kind === "shelfskin" && g.shelfSkin === it.id) ||
                   (it.kind === "shrinestyle" && g.shrineStyle === it.id) ||
                   (it.kind === "banner" && g.banner === it.banner);
      var afford = g.gold >= it.price;
      var card = el("article", { class: "k-gv-ware", "data-ui": "shop.card", "data-kind": it.kind, "aria-label": it.name });
      if (owned) KOS.ui.state(card, "owned", true);
      if (active) KOS.ui.state(card, "is-active", true);
      if (!owned && !afford) KOS.ui.state(card, "unafford", true);

      card.appendChild(shopPreview(it));
      card.appendChild(el("div", { class: "k-gv-ware-h" }, [
        el("div", { class: "k-gv-ware-t" }, [
          el("div", { class: "k-gv-ware-kind", text: KIND_LABEL[grp.domain] }),
          el("div", { class: "k-gv-ware-name", text: it.name })
        ]),
        owned ? el("span", { class: "k-chip", "data-tone": active ? "green" : "muted", text: active ? "Active" : "Owned" })
              : el("span", { class: "k-gv-price", "data-state": afford ? null : "short", text: "◈ " + KOS.ui.num(it.price) })
      ]));
      card.appendChild(el("div", { class: "k-gv-ware-desc" }, [
        it.desc,
        it.kind === "lab" ? el("div", { class: "k-gv-ware-note", "data-ui": "shop.access-note", text: "Core revision stays free. This adds a practice surface." }) : null
      ].filter(Boolean)));

      var foot = el("div", { class: "k-gv-ware-foot", "data-ui": "shop.card-foot" });
      if (!owned) {
        var buyBtn = el("button", { type: "button", class: "k-btn k-gv-buy", "data-intent": "primary",
          text: afford ? "Buy · ◈ " + KOS.ui.num(it.price) : "◈ " + KOS.ui.num(it.price - g.gold) + " more needed",
          onclick: function () {
            var r = KOS.governor.buy(it.id);
            KOS.ui.toast(r.msg, !r.ok);
            if (r.ok) render();
          } });
        buyBtn.disabled = !afford;
        foot.appendChild(buyBtn);
      } else if (it.kind === "lab") {
        foot.appendChild(el("span", { class: "k-gv-unlocked", text: "✓ Unlocked · in its subject's Practice zone" }));
      } else {
        var APPLY = {
          theme: ["Apply theme", "✓ Applied", function () { KOS.governor.setTheme(active ? "kurenai" : it.theme); }],
          seal: ["Apply seal", "✓ Applied", function () { KOS.governor.setSeal(active ? "kurenai" : it.id); }],
          frame: ["Wear frame", "✓ Worn", function () { g.avatar.frame = active ? null : it.id; store.save(); KOS.refreshHUD(); }],
          shelfskin: ["Apply skin", "✓ Applied", function () { KOS.governor.setShelfSkin(active ? null : it.id); }],
          shrinestyle: ["Apply style", "✓ Applied", function () { KOS.governor.setShrineStyle(active ? null : it.id); }],
          banner: ["Hang banner", "✓ Hung", function () { KOS.governor.setBanner(active ? null : it.banner); }]
        }[it.kind];
        if (APPLY) foot.appendChild(el("button", { type: "button", class: "k-btn k-gv-apply", "aria-pressed": active ? "true" : "false",
          text: active ? APPLY[1] : APPLY[0], title: active ? "Take it off" : null,
          onclick: function () { APPLY[2](); render(); } }));
      }
      card.appendChild(foot);
      return card;
    }

    /* each lab's miniature: what the learner does there, in words and a mark */
    var LAB_MARK = {
      trace: { mark: "⇄", label: "step through" }, oop: { mark: "{ }", label: "compose classes" },
      "logic-lab": { mark: "⊢", label: "test a truth" }, "sort-viz": { mark: "▥", label: "compare passes" },
      "fsm-lab": { mark: "⟲", label: "follow a state" }, "fn-transform": { mark: "f(x)", label: "move a graph" },
      "trig-circle": { mark: "◯", label: "turn the circle" }, "integration-area": { mark: "∫", label: "measure area" }
    };
    /* the preset banner's painted background, as a custom property */
    function bannerImage(id) {
      var css = KOS.governor.bannerPresetCss(id) || "";
      var m = /background-image:\s*([^;]+);?/.exec(css);
      return m ? m[1] : null;
    }
    function shopPreview(it) {
      var pv = el("div", { class: "k-gv-pv", "data-kind": it.kind, "aria-hidden": "true" });
      if (it.sw) it.sw.forEach(function (c, i) { pv.style.setProperty("--sw" + (i + 1), c); });
      if (it.kind === "banner") {
        var img = bannerImage(it.banner);
        if (img) pv.style.setProperty("--pv-banner", img);
        pv.appendChild(el("span", { class: "k-gv-pv-band" }));
      } else if (it.kind === "theme") {
        pv.appendChild(el("span", { class: "k-gv-pv-theme" }, [
          el("span", { class: "k-gv-pv-side" }),
          el("span", { class: "k-gv-pv-page" }, [el("i"), el("i"), el("i")])
        ]));
      } else if (it.kind === "seal") {
        pv.appendChild(el("span", { class: "k-gv-pv-brand", "data-ui": "shop.preview-seal" }, [
          el("b", { text: "Kurenai" }),
          el("span", { class: "k-gv-pv-glyph", lang: "ja", text: it.glyph || "紅" })
        ]));
      } else if (it.kind === "frame") {
        var framed = KOS.governor.avatarNode(66);
        framed.setAttribute("data-frame", it.id);
        pv.appendChild(framed);
      } else if (it.kind === "shelfskin") {
        pv.appendChild(el("span", { class: "k-gv-pv-shelf", "data-ui": "shop.preview-shelf", "data-skin": it.id }, [
          el("i"), el("i"), el("i"), el("i"), el("i"), el("i")
        ]));
      } else if (it.kind === "shrinestyle") {
        pv.appendChild(el("span", { class: "k-gv-pv-shrine", "data-ui": "shop.preview-shrine", "data-skin": it.id }, [el("i")]));
      } else {
        var lab = LAB_MARK[it.id] || { mark: "◎", label: "explore" };
        pv.appendChild(el("span", { class: "k-gv-pv-lab", "data-ui": "shop.lab-scene" }, [
          el("span", { class: "k-gv-pv-bars" }, [el("i"), el("i"), el("i"), el("i"), el("i")]),
          el("span", { class: "k-gv-pv-mark", text: lab.mark }),
          el("span", { class: "k-gv-pv-label", text: lab.label })
        ]));
      }
      /* the palette an item carries, as three dots */
      if (it.sw) pv.appendChild(el("span", { class: "k-gv-pv-sw", "data-ui": "shop.swatch" }, it.sw.slice(0, 3).map(function (c, i) {
        return el("i", { "data-ui": "shop.sw-dot", "data-n": String(i + 1) });
      })));
      return pv;
    }

    /* ================= AVATAR — the live identity (12c) ================= */
    function renderAvatar() {
      var p = KOS.governor.profile();
      var grid = el("div", { class: "k-gv-studio", "data-ui": "gov.avatar-studio" });
      panel.appendChild(grid);

      /* --- left: the live identity (the same record the topbar popover renders) --- */
      var preview = el("aside", { class: "k-gv-id", "data-ui": "gov.identity-stage", "aria-label": "Live identity preview" });
      var band = el("div", { class: "k-gv-id-band" }, [el("span", { class: "k-chip k-gv-id-live", text: "Live identity" })]);
      if (KOS.governor.bannerCss()) KOS.governor.applyBanner(band, { scrim: "governor" });
      preview.appendChild(band);
      var sealIt = g.seal && g.seal !== "kurenai" ? KOS.governor.item(g.seal) : null;
      preview.appendChild(el("div", { class: "k-gv-id-body" }, [
        ring(94, p.hp, p.hpState, "span", { "data-ui": "gov.avatar-preview-avatar" }),
        el("div", { class: "k-gv-id-name" }, ["Level " + p.level + " ", el("span", { text: "· " + p.rank })]),
        p.status ? el("div", { class: "k-gv-id-status", "data-ui": "gov.avatar-preview-status", text: p.status }) : null,
        el("div", { class: "k-gv-id-facts" }, [
          fact("Portrait", g.avatar.kind === "custom" && g.avatar.img ? "Custom image" : (KOS.governor.sealById(g.avatar.id) || {}).name || "Ember"),
          fact("Frame", g.avatar.frame ? (KOS.governor.item(g.avatar.frame) || {}).name || "Frame" : "None"),
          fact("Seal", sealIt ? sealIt.name : "紅 Kurenai"),
          fact("Banner", g.banner ? (g.banner === "custom" ? "Custom banner" : bannerName(g.banner)) : "None")
        ]),
        el("div", { class: "k-kicker k-gv-id-k", text: "Topbar seal preview" }),
        el("div", { class: "k-gv-id-topbar" }, [
          el("span", { class: "k-gv-id-brand", text: "Kurenai" }),
          el("span", { class: "k-gv-pv-glyph", lang: "ja", "aria-hidden": "true", text: sealGlyph() })
        ])
      ].filter(Boolean)));
      grid.appendChild(preview);
      function fact(k, v) {
        return el("div", { class: "k-card-row" }, [el("span", { class: "k-card-row-k", text: k }), el("span", { class: "k-card-row-v", text: v })]);
      }
      function bannerName(id) {
        var found = KOS.governor.catalog().find(function (c) { return c.kind === "banner" && c.banner === id; });
        return found ? found.name : "Banner";
      }

      /* --- right: the workshop --- */
      var ctl = el("div", { class: "k-gv-controls", "data-ui": "gov.avatar-controls" });
      grid.appendChild(ctl);

      var hasPic = g.avatar.kind === "custom" && !!g.avatar.img, hasBanner = !!KOS.governor.bannerCss();
      ctl.appendChild(el("section", { class: "k-card k-gv-media", "data-ui": "gov.avatar-section", "aria-label": "Profile" }, [
        media({ label: "Profile picture", value: hasPic ? "Custom image" : "Seal portrait", hook: "gov.avatar-mc",
          action: hasPic ? "Reposition →" : "Add picture →",
          go: function () {
            KOS.governor.editAvatar(function (err, result) {
              if (err) KOS.ui.toast("Upload failed: " + err.message, true);
              else if (!(result && result.cancelled)) { KOS.ui.toast("Avatar positioned and saved."); render(); }
            });
          },
          clear: hasPic ? function () {
            g.avatar.kind = "seal"; g.avatar.img = null; g.avatar.crop = null;
            store.save(); KOS.refreshHUD(); render();
          } : null, clearLabel: "Remove profile picture" }),
        media({ label: "Profile banner", value: g.banner ? (g.banner === "custom" ? "Custom banner" : bannerName(g.banner)) : "None", hook: "gov.avatar-mc",
          action: g.banner === "custom" ? "Reposition →" : hasBanner ? "Upload your own →" : "Add banner →", go: editBanner,
          clear: g.banner ? function () { KOS.governor.setBanner(null); render(); } : null, clearLabel: "Remove profile banner" }),
        media({ label: "Status", value: p.status || "Not set", hook: "gov.avatar-text",
          action: p.status ? "Edit →" : "Write one →", go: openProfileEditor })
      ]));
      function media(o) {
        return el("div", { class: "k-gv-media-item", "data-ui": o.hook }, [
          el("div", { class: "k-gv-media-k", text: o.label }),
          el("div", { class: "k-gv-media-v", text: o.value }),
          el("div", { class: "k-gv-media-acts" }, [
            el("button", { type: "button", class: "k-link", text: o.action, "aria-label": o.label + ": " + o.action.replace(" →", ""), onclick: o.go }),
            o.clear ? el("button", { type: "button", class: "k-link k-gv-media-clear", text: "Remove", "aria-label": o.clearLabel, onclick: o.clear }) : null
          ].filter(Boolean))
        ]);
      }

      /* seal library — the portrait seals, unlocked by level */
      var sgrid = el("div", { class: "k-gv-seals", "data-ui": "gov.seal-grid" });
      KOS.governor.seals().forEach(function (s) {
        var unlocked = KOS.governor.sealUnlocked(s);
        var on = g.avatar.kind === "seal" && g.avatar.id === s.id;
        var card = el("button", { type: "button", class: "k-gv-seal", "data-ui": "gov.seal-card", "aria-pressed": on ? "true" : "false",
          "aria-label": s.name + (unlocked ? "" : " — unlocks at level " + s.minLevel), title: unlocked ? s.name : s.name + " — unlocks at level " + s.minLevel,
          onclick: function () {
            if (!unlocked) { KOS.ui.toast("Unlocks at level " + s.minLevel + " — you're level " + p.level + ".", true); return; }
            g.avatar.kind = "seal"; g.avatar.id = s.id;
            store.save(); KOS.refreshHUD(); render();
          } });
        if (!unlocked) KOS.ui.state(card, "locked", true);
        var art = el("span", { class: "k-gv-seal-art", "aria-hidden": "true" });
        art.innerHTML = KOS.governor.sealSvg(s);
        card.appendChild(art);
        card.appendChild(el("span", { class: "k-gv-seal-n", text: on ? "Worn" : unlocked ? s.name : "Lv " + s.minLevel }));
        sgrid.appendChild(card);
      });
      ctl.appendChild(el("section", { class: "k-card k-gv-lib", "data-ui": "gov.avatar-section", "aria-label": "Seal library" }, [
        cardHead("Seal library", "your portrait when no picture is set · unlocked by level"),
        sgrid
      ]));

      /* frames — every frame, the owned ones wearable, the rest a shop away */
      var fgrid = el("div", { class: "k-gv-frames", "data-ui": "gov.frame-grid" });
      fgrid.appendChild(frameChip(null, "No frame", true));
      KOS.governor.catalog().filter(function (c) { return c.kind === "frame"; }).forEach(function (fr) {
        fgrid.appendChild(frameChip(fr, fr.name, KOS.governor.owns(fr.id)));
      });
      ctl.appendChild(el("section", { class: "k-card k-gv-lib", "data-ui": "gov.avatar-section", "aria-label": "Frames" }, [
        cardHead("Frames", "owned frames are ready to wear, the rest are Gold Shop unlocks"),
        fgrid
      ]));
      function frameChip(fr, label, owned) {
        var id = fr ? fr.id : null, on = (g.avatar.frame || null) === id;
        var disc = KOS.governor.avatarNode(44);
        if (id) disc.setAttribute("data-frame", id); else disc.removeAttribute("data-frame");
        var chip = el("button", { type: "button", class: "k-gv-frame", "data-ui": "gov.frame-chip", "aria-pressed": on ? "true" : "false",
          "aria-label": owned ? label : label + " — in the Gold Shop for ◈ " + fr.price,
          onclick: function () {
            if (!owned) { KOS.show("governor", "shop"); return; }
            g.avatar.frame = id; store.save(); KOS.refreshHUD(); render();
          } }, [disc, el("span", { class: "k-gv-frame-n", text: owned ? label : label + "\u00a0·\u00a0◈" })]);
        if (!owned) KOS.ui.state(chip, "locked", true);
        return chip;
      }
    }

    /* ================= SESSION LOG (12d) =================
       Meaningful acts by default, grouped by day; the open entry sits in a
       panel beside the list. Routine integration traffic lives in its own
       System category, coalesced per day + provider. */
    var LOG_CATS = [
      { id: "all", label: "All activity", match: function (e) { return !isRoutine(e); } },
      { id: "study", label: "Study", match: function (e) { return ["flashcards", "due-review", "quiz", "exam"].indexOf(e.type) !== -1; } },
      { id: "focus", label: "Focus", match: function (e) { return e.type === "focus"; } },
      { id: "tasks", label: "Tasks", match: function (e) { return e.type === "todo"; } },
      { id: "papers", label: "Papers", match: function (e) { return e.type === "tracker"; } },
      { id: "collection", label: "Collection", match: function (e) { return e.type === "media" && !isRoutine(e); } },
      { id: "system", label: "System", routine: true, match: isRoutine }
    ];
    function renderHistory() {
      var all = KOS.sessions.all().slice().reverse();
      var catId = "all", visible = 30, openId = null;
      var human = all.filter(function (e) { return !isRoutine(e); });

      var page = el("div", { class: "k-gv-log-page", "data-ui": "gov.history" });
      panel.appendChild(page);
      var col = el("div", { class: "k-gv-log-col" });
      var side = el("aside", { class: "k-gv-entry", "data-ui": "gov.log-details", id: "gov-log-entry", "aria-label": "Entry", hidden: "" });
      page.appendChild(col);
      page.appendChild(side);

      /* the category switch and this week's line */
      var band = el("div", { class: "k-seg k-seg--quiet k-gv-log-cats", "data-ui": "gov.log-filter", role: "tablist", "aria-label": "Session categories" });
      LOG_CATS.forEach(function (c) {
        if (c.routine) band.appendChild(el("span", { class: "k-seg-sep", "aria-hidden": "true" }));
        band.appendChild(el("button", { type: "button", class: "k-seg-item", "data-ui": "gov.log-category", "data-cat": c.id,
          role: "tab", "aria-selected": c.id === catId ? "true" : "false", text: c.label,
          onclick: function () { setCat(c.id); } }));
      });
      var weekStart = KOS.srs.addDays(KOS.srs.todayISO(), -6);
      var week = human.filter(function (e) { return e.date >= weekStart; });
      var weekDays = {};
      week.forEach(function (e) { weekDays[e.date] = true; });
      var nDays = Object.keys(weekDays).length, nMiles = week.filter(isMeaningful).length;
      var stats = el("div", { class: "k-gv-log-week", "data-ui": "gov.history-stats", "aria-label": "This week" });
      if (week.length) {
        stats.appendChild(el("span", { text: "This week" }));
        stats.appendChild(el("span", { "data-ui": "gov.history-stat", text: week.length + " entr" + (week.length === 1 ? "y" : "ies") }));
        stats.appendChild(el("span", { "data-ui": "gov.history-stat", text: nDays + " active day" + (nDays === 1 ? "" : "s") }));
        if (nMiles) stats.appendChild(el("span", { "data-ui": "gov.history-stat", text: nMiles + " milestone" + (nMiles === 1 ? "" : "s") }));
      } else stats.appendChild(el("span", { text: "Nothing logged this week" }));
      col.appendChild(el("div", { class: "k-gv-log-bar" }, [band, stats]));

      var note = el("p", { class: "k-gv-log-note", role: "status", "aria-live": "polite" });
      col.appendChild(note);
      var wrap = el("div", { class: "k-gv-log", "data-ui": "gov.log gov.timeline" });
      col.appendChild(wrap);
      var pager = el("div", { class: "k-gv-log-pager" });
      col.appendChild(pager);

      function setCat(id) {
        catId = id; visible = 30;
        band.querySelectorAll("[data-ui~='gov.log-category']").forEach(function (b) {
          var on = b.dataset.cat === catId;
          KOS.ui.state(b, "active", on);
          b.setAttribute("aria-selected", on ? "true" : "false");
        });
        showEntry(null);
        draw();
      }
      /* the entry sits beside the list where there is room, and under its
         own day where there is not (the 860 tier), so it never covers the
         row it describes */
      function place() {
        var narrow = openId != null && window.matchMedia && window.matchMedia("(max-width: 860px)").matches;
        var row = narrow && wrap.querySelector("[data-id='" + openId + "']");
        if (row) row.closest("[data-ui~='gov.day-group']").after(side);
        else if (side.parentNode !== page) page.appendChild(side);
      }
      function draw() {
        if (side.parentNode !== page) page.appendChild(side);
        wrap.innerHTML = "";
        pager.innerHTML = "";
        var cat = LOG_CATS.find(function (c) { return c.id === catId; });
        var matched = all.filter(cat.match);
        if (cat.routine) {
          note.textContent = "Technical integration traffic · one record per provider and day.";
          var groups = coalesceRoutine(matched);
          if (!groups.length) { wrap.appendChild(emptyLog("System is quiet", "No provider sync activity has been recorded.")); return; }
          dayGroups(groups.slice(0, visible), groups, routineRow);
          addPager(groups.length);
          return;
        }
        note.textContent = catId === "all" ? "" : matched.length + " recorded " + cat.label.toLowerCase() + " event" + (matched.length === 1 ? "" : "s") + ".";
        if (!matched.length) {
          wrap.appendChild(emptyLog(all.length ? "Nothing filed here yet" : "Begin your chronicle",
            all.length ? "Complete an activity in this category and its details will appear here." : "Finish a focus block, review, quiz, task, paper, or collection title to create your first entry."));
          return;
        }
        dayGroups(matched.slice(0, visible), matched, entryRow);
        addPager(matched.length);
        place();
      }
      function dayGroups(rows, totalRows, rowFactory) {
        var counts = {}, groups = [], byDate = {};
        totalRows.forEach(function (row) { counts[row.date] = (counts[row.date] || 0) + 1; });
        rows.forEach(function (row) {
          if (!byDate[row.date]) { byDate[row.date] = []; groups.push({ date: row.date, rows: byDate[row.date] }); }
          byDate[row.date].push(row);
        });
        groups.forEach(function (grp) {
          var events = el("div", { class: "k-gv-day-rows", "data-ui": "gov.day-events" });
          grp.rows.forEach(function (row) { events.appendChild(rowFactory(row)); });
          wrap.appendChild(el("section", { class: "k-gv-day", "data-ui": "gov.day-group", "aria-label": dayName(grp.date) }, [
            el("h3", { class: "k-gv-day-head", "data-ui": "gov.ledger-day" }, [
              dayName(grp.date),
              el("small", { text: (counts[grp.date] || grp.rows.length) + " entr" + ((counts[grp.date] || grp.rows.length) === 1 ? "y" : "ies") })
            ]),
            events
          ]));
        });
      }
      function dayName(iso) {
        var today = KOS.srs.todayISO();
        if (iso === today) return "Today";
        if (iso === KOS.srs.addDays(today, -1)) return "Yesterday";
        var d = new Date(iso + "T12:00:00");
        var o = { weekday: "long", day: "numeric", month: "long" };
        if (iso.slice(0, 4) !== today.slice(0, 4)) o.year = "numeric";
        return d.toLocaleDateString("en-GB", o);
      }
      function addPager(total) {
        if (total <= visible) return;
        pager.appendChild(el("button", { type: "button", class: "k-btn", "data-ui": "gov.log-more",
          text: "Show " + Math.min(30, total - visible) + " more · " + visible + " of " + total,
          onclick: function () { visible += 30; draw(); } }));
      }
      function emptyLog(title, copy) {
        return KOS.ui.emptyState({
          compact: !!all.length, mark: "◇", title: title, body: copy,
          action: !all.length ? el("button", { type: "button", class: "k-btn k-btn--primary", text: "Open Review", onclick: function () { KOS.show("due"); } }) : null
        });
      }
      function entryRow(e) {
        var info = activityInfo(e), rw = rewardOf(e);
        return el("button", { type: "button", class: "k-gv-row", "data-ui": "gov.log-event gov.ledger-row", "data-id": String(e.id),
          "aria-expanded": openId === e.id ? "true" : "false", "aria-controls": "gov-log-entry",
          onclick: function () { showEntry(openId === e.id ? null : e); } }, [
          el("time", { class: "k-gv-row-time", datetime: e.date || "", text: clock(e.ts) || shortDate(e.date) }),
          el("span", { class: "k-chip", "data-tone": info.tone, text: info.label }),
          el("span", { class: "k-gv-row-txt" }, [
            el("span", { class: "k-gv-row-title", "data-ui": "part.lead", text: info.title }),
            info.detail ? el("span", { class: "k-gv-row-sub", text: info.detail }) : null
          ].filter(Boolean)),
          el("span", { class: "k-gv-reward", "data-tone": rw ? rw.tone : null, text: rw ? rw.text : "" })
        ]);
      }
      /* a coalesced routine row — one per day + provider */
      function routineRow(b) {
        var row = el("div", { class: "k-gv-row", "data-ui": "gov.ledger-row", "data-state": "is-routine" }, [
          el("time", { class: "k-gv-row-time", datetime: b.date || "", text: clock(b.ts) }),
          el("span", { class: "k-chip", "data-tone": "muted", text: "System" }),
          el("span", { class: "k-gv-row-txt" }, [
            el("span", { class: "k-gv-row-title", "data-ui": "part.lead", text: b.provider + " sync completed" }),
            el("span", { class: "k-gv-row-sub", text: b.entries + " entr" + (b.entries === 1 ? "y" : "ies") + " updated" + (b.syncs > 1 ? " across " + b.syncs + " syncs" : "") })
          ]),
          el("span", { class: "k-gv-reward" })
        ]);
        return row;
      }

      /* the open entry: what was recorded, and nothing re-derived */
      function showEntry(e) {
        var was = openId;
        openId = e ? e.id : null;
        wrap.querySelectorAll("[data-ui~='gov.log-event']").forEach(function (b) {
          var on = String(openId) === b.dataset.id;
          b.setAttribute("aria-expanded", on ? "true" : "false");
          KOS.ui.state(b, "active", on);
        });
        KOS.ui.state(page, "has-entry", !!e);
        side.innerHTML = "";
        side.hidden = !e;
        place();
        if (!e) {
          if (was != null) { var back = wrap.querySelector("[data-id='" + was + "']"); if (back && side.contains(document.activeElement)) back.focus(); }
          return;
        }
        var info = activityInfo(e), m = e.metrics || {}, rw = rewardOf(e);
        var end = e.ts ? new Date(e.ts) : null, start = end && e.dur ? new Date(e.ts - e.dur * 1000) : null;
        var when = new Date(e.date + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }) +
          (end ? " · " + (start ? clock(start.getTime()) + "–" : "") + clock(end.getTime()) : "");
        side.appendChild(el("div", { class: "k-gv-entry-head" }, [
          el("span", { class: "k-kicker", text: "Entry" }),
          el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", text: "✕", "aria-label": "Close entry", onclick: function () { showEntry(null); } })
        ]));
        side.appendChild(el("div", {}, [
          el("span", { class: "k-chip", "data-tone": info.tone, text: info.label }),
          el("h3", { class: "k-gv-entry-title", text: info.title }),
          el("div", { class: "k-gv-entry-when", text: when })
        ]));
        /* the figures the record carries, in the facts grid */
        var figs = [];
        if (e.dur) figs.push([e.type === "focus" ? "Focused" : "Duration", Math.max(1, Math.round(e.dur / 60)) + " min"]);
        [["cards", "Cards"], ["pct", "Score", "%"], ["correct", "Correct"], ["total", "Questions"], ["marks", "Marks"], ["max", "Available"],
         ["pauses", "Pauses", "", true], ["distractions", "Distractions", "", true], ["entries", "Entries updated", "", true], ["advances", "Status advances", "", true]].forEach(function (f) {
          /* a zero pause, distraction or sync count is no fact (invariant 77) */
          if (m[f[0]] === undefined || m[f[0]] === null || (f[3] && !m[f[0]])) return;
          figs.push([f[1], String(m[f[0]]) + (f[2] || "")]);
        });
        if (m.selfMarks) figs.push(["Self-marked", String(m.selfMarks)]);
        if (figs.length) side.appendChild(el("div", { class: "k-gv-entry-figs" }, figs.map(function (f) {
          return el("div", {}, [el("div", { class: "k-gv-entry-k", text: f[0] }), el("div", { class: "k-gv-entry-v", text: f[1] })]);
        })));
        /* the words the record carries */
        var rows = [];
        if (e.subject) rows.push(["Linked", subjName(e.subject) + (e.ref ? " · " + e.ref : "")]);
        if (m.title) rows.push(["Title", m.title]);
        if (m.objective) rows.push(["Objective", m.objective]);
        if (m.objectiveResult) rows.push(["Objective result", { met: "Met", partly: "Partly met", missed: "Missed" }[m.objectiveResult] || m.objectiveResult]);
        if (m.notesFiledTo) rows.push(["Notes filed to", m.notesFiledTo]);
        if (rw) rows.push(["Award", rw.tone === "red" ? "Forfeited" : rw.text, rw.tone]);
        if (rows.length) side.appendChild(el("div", { class: "k-gv-entry-rows" }, rows.map(function (r) {
          return el("div", { class: "k-card-row" }, [el("span", { class: "k-card-row-k", text: r[0] }),
            el("span", { class: "k-card-row-v", "data-tone": r[2] || null, text: r[1] })]);
        })));
        if (m.reflection) side.appendChild(el("div", {}, [
          el("div", { class: "k-kicker", text: "Reflection" }),
          el("p", { class: "k-gv-entry-p", text: m.reflection })
        ]));
        if (!figs.length && !rows.length && !m.reflection) side.appendChild(el("p", { class: "k-gv-entry-p", text: info.detail || "Recorded by KurenaiOS." }));
        side.appendChild(el("p", { class: "k-gv-entry-foot", text: e.type === "focus" && m.complete === false
          ? "Ended early: the session stays in the log and counts as the day's activity, but not toward the streak."
          : "Recorded once in the session log; the topic and the Governor read the same entry." }));
      }
      draw();
    }

    render();
  };
})();
