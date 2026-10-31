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
      copy: "Your identity, current access state, study rhythm and what you have earned."
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
        info.detail = KOS.sessions.stretchText(s) ? "Switched · " + KOS.sessions.stretchText(s)
          : (topic ? topic + " · " : "") + (m.mins || Math.round((s.dur || 0) / 60)) + " min";
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
      var a = KOS.governor.focusAward(Object.assign({ secs: s.dur }, s.metrics || {}));
      if (a.rule === "blocks" && !a.blocks) return { text: "under 10 minutes", tone: "muted" };
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
    if (openTab === "edit") { editSeat(main); return; }

    var govTabs = addHook(KOS.workspaceTabs(TABS.map(function (t) { return [t[1], "governor", t[0], t[0]]; }),
      cur, "Governor pages"), "gov.tabs");
    /* 15k: on a phone these are never a strip — they are the title's
       section switch ("Status ▾") */
    govTabs.setAttribute("data-phone-tabs", "");
    /* keep the data-tab hook every consumer of this switcher has used */
    govTabs.querySelectorAll("[data-ui~='ui.tab']").forEach(function (b, i) { b.dataset.tab = TABS[i][0]; });
    main.appendChild(addHook(KOS.ui.pageHeader({ kicker: pageMeta.kicker, title: pageMeta.title,
      sub: pageMeta.copy, actions: [cur === "status" ? el("button", { type: "button", class: "k-btn", "data-ui": "gov.edit-seat", text: "✎ Edit seat",
        onclick: function () { KOS.show("governor", "edit"); } }) : null, govTabs].filter(Boolean) }), "gov.head"));

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

    /* ================= STATUS — the Seat, the Stage (35a) =================
       Your banner runs the full width as the stage. Left: the avatar in its
       HP ring with the worn seal, the level, the title, the motto and XP;
       the six showcase medals on a gold arc; one glass panel with the
       Wall's count and the record. Right: one glass panel with the study
       cadence over the milestone ledger and the four live figures. Along
       the foot, Drains · Restores · Always open. Below: six area cards in
       their set panoramas. Below Healthy the recovery dispatch follows the
       stage. Pages only read (invariant 161). */
    function seatBgSrc(gg) {
      gg = gg || g;
      var v = gg.seatBg;
      if (v === "custom" || (!v && gg.banner === "custom" && gg.bannerImg)) return gg.bannerImg ? { src: gg.bannerImg, crop: gg.bannerCrop, custom: true } : null;
      var set = /^pano:(.+)$/.exec(v || "") ? v.slice(5) : "kurenai";
      return { src: "assets/app/img/app.ach.pano." + set + ".webp", set: set };
    }
    function stageBg(node, gg) {
      var FOCUS_X = { left: "20%", centre: "50%", right: "80%" };
      var bg = seatBgSrc(gg);
      if (!bg) return;
      var img = el("img", { class: "k-gv-stage-bg", src: bg.src, alt: "", decoding: "async", "aria-hidden": "true" });
      var c = bg.custom && KOS.imageCrop ? KOS.imageCrop.value(bg.crop) : null;
      img.style.setProperty("--obj-pos", c ? c.x + "% " + c.y + "%" : (FOCUS_X[(gg || g).seatFocus] || "50%") + " 40%");
      img.addEventListener("error", function () { img.remove(); });
      node.insertBefore(img, node.firstChild);
    }
    function renderStatus() {
      var p = KOS.governor.profile();
      var displayHp = hpPreview === "full" ? 100 : hpPreview === "critical" ? 0 : p.hp;
      var hpCls = hpPreview === "full" ? "healthy" : hpPreview === "critical" ? "critical" : KOS.governor.hpState();
      var stks = KOS.sessions.streaks();
      var allSessions = KOS.sessions.all();
      var realSessions = allSessions.filter(function (s) { return !isRoutine(s); });
      var meaningfulSessions = realSessions.filter(isMeaningful);

      var seat = el("div", { class: "k-gv-seat", "data-ui": "gov.bento gov.status", "data-hp": hpCls });
      panel.appendChild(seat);
      var stage = buildStage(g, { p: p, displayHp: displayHp, hpCls: hpCls, stks: stks, realSessions: realSessions, meaningful: meaningfulSessions, routineN: allSessions.length - realSessions.length });
      seat.appendChild(stage);

      /* the recovery dispatch (12a2): below Healthy, the checklist that
         climbs back. Nothing is locked; it says so. */
      if (hpCls !== "healthy") seat.appendChild(recovery(hpCls, displayHp));
      seat.appendChild(areaCards());
    }

    /* the stage, drawn for the page and, scaled, for Edit seat's preview */
    function buildStage(gg, o) {
      var p = o.p, A = KOS.achievements, aui = KOS.achUI;
      var stage = el("section", { class: "k-gv-stage k-gv-stage-grid", "data-ui": "gov.bento-id gov.seat", "aria-label": "Your identity" });
      stageBg(stage, gg);
      var title = A && A.title();
      if (o.titleId !== undefined) title = A && o.titleId ? A.titles().filter(function (t) { return t.id === o.titleId; })[0] : null;
      var txt = el("div", { class: "k-gv-stage-txt" }, [
        el("div", { class: "k-gv-stage-kick", text: "Behavioural Governor" }),
        el("h2", { class: "k-gv-name", "data-ui": "gov.level", text: "Level " + p.level }),
        title ? el("div", { class: "k-gv-title", "data-ui": "gov.title", text: title.name })
          : o.preview ? null : el("button", { type: "button", class: "k-gv-title k-gv-title--pick", text: "Pick a title", onclick: function () { KOS.show("governor", "edit"); } }),
        p.status ? el("div", { class: "k-gv-status-line", "data-ui": "gov.id-status", text: p.status }) : null,
        !p.status && !o.preview ? el("button", { type: "button", class: "k-gv-about-empty", text: "＋ Set a motto for your seat", onclick: openProfileEditor }) : null,
        el("div", { class: "k-gv-xp", "data-ui": "gov.xp" }, [
          bar(p.xpPct, "ink"),
          el("span", { class: "k-mono", text: KOS.ui.num(p.xpToNext) + " XP to " + (p.level + 1) })
        ])
      ].filter(Boolean));
      if (!o.preview) txt.appendChild(accessRow(o.hpCls));
      var id = el("header", { class: "k-gv-stage-id" }, [
        o.preview ? ring(180, o.displayHp, o.hpCls, "span", { "data-seal": o.seal || null })
          : ring(180, o.displayHp, o.hpCls, "button", { type: "button", "data-ui": "gov.face",
            "aria-label": "Edit your profile picture", title: "Edit your profile picture",
            onclick: function () { KOS.show("governor", "avatar"); } }),
        txt
      ]);
      if (o.seal) { var sg = id.querySelector(".k-gv-ring-seal"); var it = o.seal !== "kurenai" ? KOS.governor.item(o.seal) : null; if (sg) sg.textContent = (it && it.glyph) || "紅"; }

      /* the showcase arc: six medals at 72, highest in the middle */
      var arc = el("div", { class: "k-gv-arc", "data-ui": "gov.showcase", role: "group", "aria-label": "Your showcase" });
      arc.innerHTML = '<svg class="k-gv-arc-lines" viewBox="0 0 560 132" preserveAspectRatio="none" aria-hidden="true"><path d="M 66 80 Q 291 -8 516 80" data-line="a"/><path d="M 30 112 Q 291 -40 552 112" data-line="b"/></svg>';
      var AX = [30, 120, 210, 300, 390, 480], AY = [44, 16, 0, 0, 16, 44];
      var ids = o.showcase || (A ? A.showcase() : []);
      AX.forEach(function (x, i) {
        var slot = el("span", { class: "k-gv-arc-slot", "data-empty": "" });
        slot.style.setProperty("--ax", (100 * x / 560).toFixed(2) + "%");
        slot.style.setProperty("--ay", (100 * AY[i] / 132).toFixed(2) + "%");
        arc.appendChild(slot);
      });
      var note = el("div", { class: "k-gv-arc-note" });
      arc.appendChild(note);
      if (A && aui) A.list(function (views) {
        var byId = {}; views.forEach(function (v) { byId[v.id] = v; });
        var slots = arc.querySelectorAll(".k-gv-arc-slot");
        ids.filter(function (x) { return byId[x]; }).slice(0, 6).forEach(function (bid, i) {
          var v = byId[bid], s = slots[i];
          s.removeAttribute("data-empty");
          s.appendChild(o.preview ? aui.medal(v, { px: 72, pips: false, decorative: true })
            : el("button", { type: "button", class: "k-gv-arc-btn", "aria-label": aui.badgeName(v) + ", open its set", onclick: function () { KOS.show("achievements", "set/" + v.set + "/" + v.id); } },
              [aui.medal(v, { px: 72, pips: false, decorative: true })]));
        });
        if (!ids.length && !o.preview) {
          var near = views.filter(function (v) { return !v.masked && !v.full && v.state !== "soon" && v.p > 0; }).sort(function (a, b) { return b.p - a.p; })[0];
          var any = views.some(function (v) { return v.tier > 0; });
          note.appendChild(any ? el("button", { type: "button", class: "k-link", text: "Pick your showcase →", onclick: function () { KOS.show("governor", "edit"); } })
            : near ? el("span", { text: "Your first badge is close: " + near.def.name + ", " + aui.progressText(near) }) : null);
        }
      });

      /* the Wall and the record, in glass */
      var c = A ? A.counts() : { owned: 0, badges: 0, tiers: 0, tiersTotal: 0 }, life = A ? A.lifetime() : { days: 0, focusSecs: 0 };
      var since = +store.state.created;
      function rec(label, value, unit) {
        return el("div", { class: "k-gv-rec" }, [el("span", { class: "k-gv-rec-k", text: label }), el("span", { class: "k-gv-rec-v k-mono" }, [value, unit ? el("small", { text: " " + unit }) : null].filter(Boolean))]);
      }
      var wall = el("section", { class: "k-gv-glass k-gv-wallg", "data-ui": "gov.wall", "aria-label": "The Wall and your record" }, [
        el("div", { class: "k-gv-wallg-head" }, [
          el("span", { class: "k-gv-glass-kick", text: "The Wall" }),
          el("span", { class: "k-gv-wallg-n" }, [String(c.owned), el("small", { class: "k-mono", text: " / " + c.badges + " badges" })]),
          el("span", { class: "k-spacer" }),
          o.preview ? null : el("button", { type: "button", class: "k-link", "data-ui": "gov.wall-open", text: "Open the Wall →", onclick: function () { KOS.show("achievements"); } })
        ].filter(Boolean)),
        el("div", { class: "k-gv-recs" }, [
          rec("Days journeyed", String(life.days || 0), "days"),
          rec("First day", since > 0 ? new Date(since).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"),
          rec("Hours of focus", String(Math.floor((life.focusSecs || 0) / 3600)), "h"),
          rec("Tiers earned", String(c.tiers), "/ " + c.tiersTotal)
        ])
      ]);

      /* the right panel: cadence over the ledger and the four live figures */
      var cad = cadence(o.realSessions, o.stks), led = ledger(o.meaningful, o.routineN);
      cad.classList.remove("k-card"); led.classList.remove("k-card");
      var right = el("section", { class: "k-gv-glass k-gv-rightg", "aria-label": "Rhythm and figures" }, [cad, el("div", { class: "k-gv-rightg-low" }, [led, el("span", { class: "k-gv-vrule", "aria-hidden": "true" }), instruments(p, o)])]);

      var rules = el("section", { class: "k-gv-glass k-gv-rules", "data-ui": "gov.rules", "aria-label": "How HP works" }, [
        rule("red", "Drains", "A fully missed day costs 15 HP. A due backlog past " + (KOS.governor.BACKLOG_LIMIT || 30) + " cards costs 10 HP a day."),
        rule("green", "Restores", "Completed sessions, due reviews and tasks restore HP. Recovery is slower while Critical."),
        rule("teal", "Always open", "Specification, notes, flashcards, quizzes, exam questions and Focus never lock.")
      ]);
      [id, arc, wall, right, rules].forEach(function (n) { stage.appendChild(n); });
      return stage;
    }
    function rule(tone, title, body) {
      return el("div", { class: "k-gv-rule", "data-tone": tone }, [
        el("b", { class: "k-gv-rule-h" }, [el("span", { class: "k-gv-dot", "aria-hidden": "true" }), title]),
        el("p", { text: body })
      ]);
    }
    /* the access row: state chip, the motto's edit, the HP preview and the
       review aid that shows the app on an empty or sample account */
    function accessRow(hpCls) {
      return el("div", { class: "k-gv-access", "data-ui": "gov.id-access", role: "group", "aria-label": "Governor access state" }, [
        hpCls === "critical" ? null : el("span", { class: "k-chip", "data-tone": hpCls === "healthy" ? "green" : "amber",
          text: hpCls === "healthy" ? "● All systems open" : "● Strained · nothing locks" }),
        el("button", { type: "button", class: "k-btn k-btn--sm", text: "Edit motto", onclick: openProfileEditor }),
        el("div", { class: "k-seg k-seg--quiet k-gv-preview", "data-ui": "gov.hp-preview", role: "group", "aria-label": "Preview HP state", "data-phone-more": "" }, [
          el("span", { class: "k-gv-preview-k", text: "Preview" }),
          hpPreviewButton("live", "Live"), hpPreviewButton("full", "Full"), hpPreviewButton("critical", "Off")
        ]),
        hpPreview !== "live" ? el("small", { class: "k-gv-preview-note", text: "Preview only · actual HP " + KOS.governor.profile().hp + "/100" }) : null,
        el("div", { class: "k-seg k-seg--quiet k-gv-preview", "data-ui": "gov.data-mode", role: "group", "aria-label": "Which account the app shows", "data-phone-more": "" }, [
          el("span", { class: "k-gv-preview-k", text: "Data" }),
          dataModeButton("", "Mine"), dataModeButton("empty", "Empty"), dataModeButton("sample", "Sample")
        ])
      ].filter(Boolean));
    }
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
    /* the four live figures: HP, Gold (a balance — no bar, invariant 78),
       the review queue against the backlog line, and the streak toward its
       next bonus. XP is the hero's own bar. */
    function instruments(p, o) {
      var stks = o.stks, dueCount = KOS.srs.dueCount(), hpCls = o.hpCls, displayHp = o.displayHp;
      var hpLabel = { healthy: "Healthy", strained: "Strained", critical: "Critical" }[hpCls];
      var cheapest = KOS.governor.catalog()
        .filter(function (c) { return c.kind !== "banner" && !KOS.governor.owns(c.id); })
        .sort(function (a, b) { return a.price - b.price; })[0];
      var limit = KOS.governor.BACKLOG_LIMIT || 30;
      var nextBonus = [3, 7, 14, 30, 60, 100].filter(function (m) { return m > stks.all; })[0];
      var prevBonus = [0, 3, 7, 14, 30, 60, 100].filter(function (m) { return m <= stks.all; }).pop();
      function instrument(x) {
        var node = el("div", { class: "k-gv-stat", "data-ui": "gov.vital gov.stat", "data-kind": x.kind, "data-tone": x.tone }, [
          el("span", { class: "k-gv-stat-k", "data-ui": "gov.vital-label", text: x.label }),
          el("span", { class: "k-gv-stat-v", "data-ui": "gov.vital-v", text: x.value }),
          el("span", { class: "k-gv-stat-h", text: x.hint }),
          x.bar === false ? null : bar(x.pct, x.tone, "gov.vital-bar")
        ].filter(Boolean));
        if (x.bar === false) KOS.ui.state(node, "no-meter", true);
        return node;
      }
      return el("div", { class: "k-gv-stack", "data-ui": "gov.b-vitals gov.instruments", "aria-label": "Instruments" }, [
        instrument({ kind: "hp", label: hpPreview === "live" ? "Live HP" : "HP preview", value: displayHp + " / 100",
          hint: hpLabel + (hpCls === "healthy" ? " · all open" : " · nothing locks"), tone: hpCls, pct: displayHp }),
        instrument({ kind: "gold", label: "Gold", value: "◆ " + KOS.ui.num(p.gold), tone: "gold", bar: false,
          hint: cheapest ? (p.gold >= cheapest.price ? cheapest.name + " is affordable" : "For the Gold Shop") : "Catalogue complete" }),
        instrument({ kind: "due", label: "Review queue", value: KOS.ui.num(dueCount), tone: "teal",
          hint: dueCount ? (dueCount > limit ? (dueCount - limit) + " past the backlog line" : "Ready in Review") : "Queue clear",
          pct: 100 * Math.min(dueCount, limit) / limit }),
        instrument({ kind: "streak", label: "Study streak", value: stks.all + (stks.all === 1 ? " day" : " days"), tone: "crimson",
          hint: nextBonus ? (nextBonus - stks.all) + " to the " + nextBonus + "-day bonus" : "Every streak bonus earned",
          pct: nextBonus ? 100 * (stks.all - prevBonus) / (nextBonus - prevBonus) : 100 })
      ]);
    }
    /* six area cards under the stage, each in its set's panorama, its figure
       read from the matching badge's own measure */
    var AREAS = [["study", "Study", "into-the-green", "topics at Green"], ["code", "Code", "green-tests", "tasks passed"], ["ja", "Japanese", "words", "words held"],
      ["mind", "Mind", "evaluated", "concepts at Evaluate"], ["creatives", "Creatives", "studies", "studies passed"], ["collection", "The Collection", "bookshelf", "volumes on the shelf"]];
    function areaCards() {
      var row = el("div", { class: "k-gv-areas", "data-ui": "gov.areas" });
      var A = KOS.achievements;
      AREAS.forEach(function (x) {
        var s = A && A.set(x[0]);
        var card = el("button", { type: "button", class: "k-gv-area", "data-area": x[0], "aria-label": x[1] + ", open its set on the Wall",
          onclick: function () { KOS.show("achievements", "set/" + x[0] + "/" + x[2]); } }, [
          el("img", { src: "assets/app/img/app.ach.pano." + x[0] + ".webp", alt: "", loading: "lazy", "aria-hidden": "true" }),
          el("span", { class: "k-gv-area-t" }, [el("span", { class: "k-ach-kick", text: x[1] }), el("b", { class: "k-mono k-gv-area-n", text: "—" }),
            el("span", { class: "k-gv-area-u" }), el("i", { class: "k-gv-area-s" })])
        ]);
        if (s) card.style.setProperty("--set-hue", "var(" + s.hue + ")");
        row.appendChild(card);
      });
      if (A) A.list(function (views) {
        AREAS.forEach(function (x) {
          var v = views.filter(function (y) { return y.id === x[2]; })[0], card = row.querySelector("[data-area='" + x[0] + "']");
          if (!v || !card) return;
          var soon = v.state === "soon";
          card.querySelector(".k-gv-area-n").textContent = soon || v.value == null ? "—" : KOS.ui.num(Math.floor(v.value));
          card.querySelector(".k-gv-area-u").textContent = soon ? "not started yet" : x[3];
          card.querySelector(".k-gv-area-s").textContent = soon ? "Opens with its first lesson" : v.tier ? v.def.name + " " + A.roman(v.tier) : v.next != null ? "First tier at " + KOS.ui.num(v.next) : "";
        });
      }, { ids: AREAS.map(function (x) { return x[2]; }) });
      return row;
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
      /* four rows: the ledger's height matches the cadence card beside it (review A) */
      var recent = meaningful.slice(-4).reverse();
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

    /* ================= EDIT YOUR SEAT (35a·edit) =================
       A live preview at 60% beside the editor: Showcase · Background ·
       Title · Sigil. Nothing is written until Save; the showcase is the
       Wall's own (editing either edits both). */
    function editSeat(main) {
      var A = KOS.achievements, aui = KOS.achUI;
      var draft = { showcase: A ? A.showcase().slice() : [], seatBg: g.seatBg || null, seatFocus: g.seatFocus || "centre",
        titleId: A && A.title() ? A.title().id : null, seal: g.seal || "kurenai" };
      var saved = JSON.stringify(draft);
      var saveBtn = el("button", { type: "button", class: "k-btn k-btn--primary", "data-ui": "gov.seat-save", "data-intent": "primary", text: "Save", onclick: save });
      var head = KOS.ui.pageHeader({ kicker: "‹ The Governor's Seat", title: "Edit your seat", sub: "Your showcase, the stage's background, your title and the seal on your ring.",
        actions: [el("button", { type: "button", class: "k-btn", "data-ui": "gov.seat-discard", text: "Discard", onclick: function () { KOS.show("governor"); } }), saveBtn] });
      var kick = head.querySelector("[data-ui~='ui.page-kicker']");
      if (kick) { kick.setAttribute("role", "link"); kick.setAttribute("tabindex", "0"); kick.classList.add("k-kicker--link"); KOS.a11y.activate(kick, function () { KOS.show("governor"); }); }
      main.appendChild(addHook(head, "gov.head"));
      var prevBox = el("div", { class: "k-gv-prev", "aria-hidden": "true" });
      var sum = el("section", { class: "k-card k-gv-sum" });
      var editor = el("section", { class: "k-card k-gv-editor", "data-ui": "gov.seat-editor" });
      main.appendChild(el("div", { class: "k-gv-edit", "data-ui": "gov.seat-edit" }, [
        el("div", { class: "k-gv-edit-left" }, [el("div", { class: "k-gv-edit-cap" }, [el("span", { class: "k-kicker", text: "Preview" }), el("span", { class: "k-muted", text: "Live preview · your data" })]), prevBox, sum]),
        editor
      ]));
      function dirty() { var d = JSON.stringify(draft) !== saved; KOS.ui.state(saveBtn, "lit", d); return d; }
      function paintPreview() {
        prevBox.textContent = "";
        var p = KOS.governor.profile(), stks = KOS.sessions.streaks(), all = KOS.sessions.all(), real = all.filter(function (x) { return !isRoutine(x); });
        var gg = Object.assign({}, g, { seatBg: draft.seatBg, seatFocus: draft.seatFocus });
        var inner = el("div", { class: "k-gv-prev-inner" }, [buildStage(gg, { preview: true, p: p, displayHp: p.hp, hpCls: KOS.governor.hpState(), stks: stks,
          realSessions: real, meaningful: real.filter(isMeaningful), routineN: all.length - real.length, showcase: draft.showcase, titleId: draft.titleId, seal: draft.seal })]);
        prevBox.appendChild(inner);
        fitPreview();
        paintSummary();
        dirty();
      }
      /* the preview is the Stage at its 1440 width, scaled to the box */
      function fitPreview() { var w = prevBox.clientWidth; if (w) prevBox.style.setProperty("--prev-s", String(w / 1328)); }
      if (window.ResizeObserver) { var ro = new ResizeObserver(function () { if (!prevBox.isConnected) { ro.disconnect(); return; } fitPreview(); }); ro.observe(prevBox); }
      function bgName() {
        var bg = seatBgSrc(Object.assign({}, g, { seatBg: draft.seatBg }));
        if (!bg) return "None";
        if (bg.custom) return "Your banner";
        var st = A && A.set(bg.set); return st ? st.name : "Kurenai and the Governor";
      }
      function paintSummary() {
        sum.textContent = "";
        var t = A && draft.titleId ? A.titles().filter(function (x) { return x.id === draft.titleId; })[0] : null;
        var it = draft.seal !== "kurenai" ? KOS.governor.item(draft.seal) : null;
        function cell(l, v) { return el("div", { class: "k-gv-sum-c" }, [el("span", { class: "k-kicker", text: l }), v]); }
        sum.appendChild(el("div", { class: "k-gv-sum-row" }, [
          cell("Background", el("span", { text: bgName() })),
          cell("Title", t ? el("i", { class: "k-gv-sum-title", text: t.name }) : el("span", { class: "k-muted", text: "No title" })),
          cell("Sigil", el("span", {}, [el("b", { class: "k-gv-sum-seal", lang: "ja", text: (it && it.glyph) || "紅" }), " " + (it ? it.name.replace(/^\S+\s/, "") : "Kurenai")])),
          cell("Showcase", el("span", { class: "k-mono", text: draft.showcase.length + " of 6" }))
        ]));
        sum.appendChild(el("p", { class: "k-muted k-gv-sum-note", text: "The showcase is also the Wall's Showcase tab and, when switched on, the share card's." }));
      }
      var TABS_E = [["showcase", "Showcase"], ["bg", "Background"], ["title", "Title"], ["sigil", "Sigil"]], tab = "showcase";
      function paintEditor() {
        editor.textContent = "";
        var seg = KOS.ui.tabs(TABS_E.map(function (x) { return { label: x[1], active: x[0] === tab, onSelect: function () { tab = x[0]; paintEditor(); } }; }),
          { variant: "workspace", label: "Edit", className: "k-gv-edit-tabs" });
        editor.appendChild(seg);
        var body = el("div", { class: "k-gv-edit-body" });
        editor.appendChild(body);
        if (tab === "showcase") paintShowcase(body);
        else if (tab === "bg") paintBg(body);
        else if (tab === "title") paintTitle(body);
        else paintSigil(body);
      }
      function paintShowcase(body) {
        if (!A || !aui) return;
        body.appendChild(el("p", { class: "k-muted", text: "Reading your badges…" }));
        A.list(function (views) {
          body.textContent = "";
          var pk = aui.showcasePicker(views, { small: true, initial: draft.showcase, onChange: function (ids) { draft.showcase = ids; paintPreview(); } });
          body.appendChild(el("div", { class: "k-gv-edit-h" }, [el("b", { text: "On display" }), pk.count, el("span", { class: "k-spacer" }),
            el("button", { type: "button", class: "k-link", text: "Clear", onclick: pk.clear })]));
          body.appendChild(el("div", { class: "k-gv-edit-tray" }, [pk.tray]));
          body.appendChild(el("p", { class: "k-muted k-gv-edit-hint", text: "In the order picked; the first leads on the share card. Tap one on display to take it out." }));
          body.appendChild(el("div", { class: "k-gv-edit-h" }, [el("b", { text: "Earned" }), el("span", { class: "k-muted", text: pk.earned.length + ", newest first" })]));
          body.appendChild(pk.earned.length ? pk.grid : KOS.ui.emptyState({ compact: true, body: "Earn a badge to show it here." }));
        });
      }
      function paintBg(body) {
        var fileIn = el("input", { type: "file", accept: "image/jpeg,image/png,image/webp", class: "sr-only", tabindex: "-1", "aria-hidden": "true" });
        fileIn.addEventListener("change", function () {
          var f = fileIn.files && fileIn.files[0]; fileIn.value = "";
          if (!f) return;
          KOS.governor.setCustomBanner(f, function (err, res) {
            if (err) { KOS.ui.toast("That picture could not be used: " + err.message, true); return; }
            if (res && res.cancelled) return;
            g = store.state.governor; draft.seatBg = "custom"; paintPreview(); paintEditor();
            KOS.a11y.announce("Background set to your banner.");
          });
        });
        body.appendChild(fileIn);
        body.appendChild(el("b", { class: "k-gv-edit-h", text: "Your banner" }));
        var tiles = el("div", { class: "k-gv-bg-own" }, [
          el("button", { type: "button", class: "k-gv-bg-up", "data-ui": "gov.bg-upload", onclick: function () { fileIn.click(); } }, [el("span", { text: "＋ Upload an image" }), el("small", { class: "k-mono", text: "JPG or PNG · 2400 × 1350 or larger" })])
        ]);
        if (g.bannerImg) {
          var mine = el("button", { type: "button", class: "k-gv-bg-thumb", "aria-pressed": String(draft.seatBg === "custom"), "aria-label": "Your banner", onclick: function () { pick("custom", "your banner"); } }, [
            el("img", { src: g.bannerImg, alt: "" }), el("span", { text: "Your banner" })]);
          tiles.appendChild(mine);
        }
        body.appendChild(tiles);
        body.appendChild(el("div", { class: "k-gv-edit-h" }, [el("b", { text: "Set panoramas" }), el("span", { class: "k-muted", text: "from the Wall" })]));
        var grid = el("div", { class: "k-gv-bg-grid", role: "group", "aria-label": "Set panoramas" });
        (A ? A.sets() : []).forEach(function (st) {
          var val = "pano:" + st.id, on = draft.seatBg === val || (!draft.seatBg && !g.bannerImg && st.id === "kurenai");
          var img = el("img", { src: "assets/app/img/app.ach.pano." + st.id + ".webp", alt: "", loading: "lazy" });
          var b = el("button", { type: "button", class: "k-gv-bg-thumb", "aria-pressed": String(on), "aria-label": st.name, onclick: function () { pick(val, st.name); } }, [img, el("span", { text: st.name })]);
          b.style.setProperty("--set-hue", "var(" + st.hue + ")");
          img.addEventListener("error", function () { img.remove(); });
          grid.appendChild(b);
        });
        body.appendChild(grid);
        function pick(v, name) { draft.seatBg = v; paintPreview(); paintEditor(); KOS.a11y.announce("Background set to " + name + "."); }
        body.appendChild(el("b", { class: "k-gv-edit-h", text: "Focus point" }));
        var fseg = KOS.ui.tabs([["left", "Left"], ["centre", "Centre"], ["right", "Right"]].map(function (x) {
          return { label: x[1], active: draft.seatFocus === x[0], onSelect: function () { draft.seatFocus = x[0]; paintPreview(); } };
        }), { variant: "workspace", label: "Focus point", className: "k-seg--quiet" });
        body.appendChild(el("div", { class: "k-gv-edit-h" }, [fseg, el("span", { class: "k-muted", text: "where narrow frames crop it" })]));
      }
      function paintTitle(body) {
        var ts = A ? A.titles() : [];
        var list = el("div", { class: "k-gv-titles", role: "radiogroup", "aria-label": "Your title" });
        function opt(id, name, ok, need) {
          var b = el("button", { type: "button", role: "radio", class: "k-gv-topt", "aria-checked": String(draft.titleId === id), disabled: ok ? null : "" }, [
            el("span", { class: "k-gv-topt-r", "aria-hidden": "true" }), el("i", { text: name }), need ? el("span", { class: "k-muted", text: need }) : null].filter(Boolean));
          if (ok) b.addEventListener("click", function () { draft.titleId = id; paintPreview(); paintEditor(); });
          return b;
        }
        list.appendChild(opt(null, "No title", true, null));
        ts.forEach(function (t) { var d = A.def(t.badge); list.appendChild(opt(t.id, t.name, t.unlocked, t.unlocked ? null : (d ? d.name + " " + A.roman(t.tier) : ""))); });
        body.appendChild(list);
        body.appendChild(el("button", { type: "button", class: "k-link", text: "All titles on the Wall →", onclick: function () { KOS.show("achievements", "titles"); } }));
      }
      function paintSigil(body) {
        var owned = [{ id: "kurenai", glyph: "紅", name: "Kurenai" }].concat(KOS.governor.catalog().filter(function (c) { return c.kind === "seal" && KOS.governor.owns(c.id); })
          .map(function (c) { return { id: c.id, glyph: c.glyph, name: c.name.replace(/^\S+\s/, "") }; }));
        var grid = el("div", { class: "k-gv-sigils", role: "radiogroup", "aria-label": "The seal on your ring" });
        owned.forEach(function (x) {
          grid.appendChild(el("button", { type: "button", role: "radio", class: "k-gv-sigil", "aria-checked": String(draft.seal === x.id), onclick: function () { draft.seal = x.id; paintPreview(); paintEditor(); } }, [
            el("b", { lang: "ja", text: x.glyph }), el("span", { text: x.name })]));
        });
        body.appendChild(grid);
        body.appendChild(el("p", { class: "k-muted k-gv-edit-hint", text: "More seals are in the Gold Shop." }));
      }
      function save() {
        if (A) { A.setShowcase(draft.showcase); A.setTitle(draft.titleId); }
        g.seatBg = draft.seatBg; g.seatFocus = draft.seatFocus;
        if (draft.seal !== (g.seal || "kurenai")) KOS.governor.setSeal(draft.seal);
        store.save();
        KOS.ui.toast("Seat saved."); KOS.a11y.announce("Seat saved.");
        KOS.show("governor");
      }
      paintPreview();
      paintEditor();
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
      { id: "seals", domain: "cosmetics", label: "Profile seals", match: function (c) { return c.kind === "seal"; } },
      { id: "frames", domain: "cosmetics", label: "Avatar frames", match: function (c) { return c.kind === "frame"; } },
      { id: "shelves", domain: "cosmetics", label: "Bookshelf skins", match: function (c) { return c.kind === "shelfskin"; } },
      { id: "shrines", domain: "cosmetics", label: "Shrine card styles", match: function (c) { return c.kind === "shrinestyle"; } }
    ];
    var KIND_LABEL = { tools: "Learning tool", simulations: "Simulation", cosmetics: "Cosmetic" };

    function renderShop() {
      /* profile banners are no longer sold (review A): the banner is your
         own upload, from Avatar */
      var cat = KOS.governor.catalog().filter(function (c) { return c.kind !== "banner"; });
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
      /* 15k: on a phone the department rail is one declared chip scroller;
         above that tier the wrapper is transparent and the rail is itself */
      shop.appendChild(el("div", { class: "k-gv-shop-body" }, [
        KOS.ui.scroller(rail, { keepRole: true, label: "Shop departments", className: "k-gv-rail-scroll" }), sections]));

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
      var active = (it.kind === "theme" && chosenTheme() === it.theme) ||
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
        owned ? el("span", { class: "k-chip", "data-tone": active ? "green" : "muted", text: active ? (it.kind === "frame" ? "Worn" : "Active") : "Owned" })
              : el("span", { class: "k-gv-price", "data-state": afford ? null : "short", text: "◈ " + KOS.ui.num(it.price) })
      ]));
      card.appendChild(el("div", { class: "k-gv-ware-desc" }, [
        it.desc,
        null
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
      /* frame 21h: "Try on" previews a theme across the whole app, without
         buying or choosing it, until the shop is left */
      if (it.kind === "theme" && !active) {
        var trying = KOS.governor.triedTheme() === it.theme;
        KOS.ui.state(foot, "split", true);
        foot.appendChild(el("button", { type: "button", class: "k-btn k-btn--quiet k-gv-try", "data-ui": "shop.try-on",
          "aria-pressed": trying ? "true" : "false", text: trying ? "Trying on" : "Try on",
          "aria-label": (trying ? "Stop trying on " : "Try on ") + it.name,
          onclick: function () { KOS.governor.tryTheme(trying ? null : it.theme); render(); } }));
      }
      card.appendChild(foot);
      return card;
    }
    /* the chosen theme (the default id is Atelier Dusk, which is Graphite) */
    function chosenTheme() {
      var known = KOS.governor.catalog().some(function (c) { return c.kind === "theme" && c.theme === g.theme; });
      return known ? g.theme : "atelier-dusk";
    }
    /* a live miniature of a theme, drawn by its own tokens (21h): ground,
       hero tint, the three subject dots and the accent button, with the
       four-colour swatch — ground, tint, accent, second */
    function themeMini(themeId, withSwatch) {
      return el("span", { class: "k-gv-pv-theme", "data-theme": themeId, "data-ui": "shop.theme-mini" }, [
        el("span", { class: "k-gv-pv-hero" }),
        el("span", { class: "k-gv-pv-row" }, [
          el("span", { class: "k-gv-pv-dots" }, [el("i", { "data-subj": "cs" }), el("i", { "data-subj": "maths" }), el("i", { "data-subj": "it" })]),
          el("span", { class: "k-gv-pv-go", text: "Start" })
        ]),
        withSwatch ? el("span", { class: "k-gv-pv-strip", "data-ui": "shop.swatch" }, ["bg", "tint", "accent", "second"].map(function (n) {
          return el("i", { "data-ui": "shop.sw-dot", "data-n": n });
        })) : null
      ].filter(Boolean));
    }

    /* each lab's miniature: what the learner does there, in words and a mark */
    var LAB_MARK = {
      trace: { mark: "⇄", label: "step through" }, oop: { mark: "{ }", label: "compose classes" },
      "logic-lab": { mark: "⊢", label: "test a truth" }, "sort-viz": { mark: "▥", label: "compare passes" },
      "fsm-lab": { mark: "⟲", label: "follow a state" }, "fn-transform": { mark: "f(x)", label: "move a graph" },
      "trig-circle": { mark: "◯", label: "turn the circle" }, "integration-area": { mark: "∫", label: "measure area" }
    };
    /* each lab's own miniature (review B: one bar chart stood in for all
       of them) — what the learner actually looks at in there */
    var SVG_OPEN = '<svg viewBox="0 0 120 64" width="120" height="64" class="k-gv-sc">';
    var LAB_SCENE = {
      trace: function () {
        return el("span", { class: "k-gv-sc-stack" }, ["main()", "fact(3)", "fact(2)", "fact(1)"].map(function (t, i, a) {
          return el("span", { class: "k-gv-sc-frame", "data-state": i === a.length - 1 ? "top" : null, text: t });
        }));
      },
      oop: function () {
        return el("span", { html: SVG_OPEN
          + '<rect x="34" y="4" width="52" height="20" rx="4" class="k-gv-sc-box"/><text x="60" y="17" class="k-gv-sc-t">Animal</text>'
          + '<rect x="6" y="40" width="48" height="20" rx="4" class="k-gv-sc-box" data-hot="1"/><text x="30" y="53" class="k-gv-sc-t">Dog</text>'
          + '<rect x="66" y="40" width="48" height="20" rx="4" class="k-gv-sc-box"/><text x="90" y="53" class="k-gv-sc-t">Cat</text>'
          + '<path d="M30,40 L30,32 L90,32 L90,40 M60,32 L60,24" class="k-gv-sc-line"/><path d="M55,28 L60,23 L65,28" class="k-gv-sc-line"/></svg>' });
      },
      "logic-lab": function () {
        var rows = [["A", "B", "Q"], ["0", "0", "0"], ["0", "1", "1"], ["1", "0", "1"], ["1", "1", "0"]];
        return el("span", { class: "k-gv-sc-tt" }, rows.map(function (r, i) {
          return el("span", { class: "k-gv-sc-tr", "data-state": i === 0 ? "head" : null }, r.map(function (v, j) {
            return el("i", { "data-state": j === 2 && i > 0 ? (v === "1" ? "on" : "off") : null, text: v });
          }));
        }));
      },
      "sort-viz": function () {
        return el("span", { class: "k-gv-pv-bars" }, [el("i"), el("i"), el("i"), el("i"), el("i")]);
      },
      "fsm-lab": function () {
        return el("span", { html: SVG_OPEN
          + '<path d="M26,32 L48,32 M72,32 L94,32" class="k-gv-sc-line"/><path d="M43,28 L48,32 L43,36 M89,28 L94,32 L89,36" class="k-gv-sc-line"/>'
          + '<path d="M60,20 C52,4 68,4 60,20" class="k-gv-sc-line"/>'
          + '<circle cx="16" cy="32" r="10" class="k-gv-sc-node"/><circle cx="60" cy="32" r="10" class="k-gv-sc-node" data-hot="1"/>'
          + '<circle cx="104" cy="32" r="10" class="k-gv-sc-node"/><circle cx="104" cy="32" r="7" class="k-gv-sc-node"/>'
          + '<text x="16" y="35" class="k-gv-sc-t">q0</text><text x="60" y="35" class="k-gv-sc-t">q1</text><text x="104" y="35" class="k-gv-sc-t">q2</text></svg>' });
      },
      "fn-transform": function () {
        return el("span", { html: SVG_OPEN
          + '<path d="M4,56 L116,56 M14,62 L14,2" class="k-gv-sc-axis"/>'
          + '<path d="M14,50 Q44,50 64,26 T116,10" class="k-gv-sc-curve" data-base="1"/>'
          + '<path d="M28,40 Q58,40 78,16 T120,2" class="k-gv-sc-curve"/></svg>' });
      },
      "trig-circle": function () {
        return el("span", { html: SVG_OPEN
          + '<path d="M22,32 L98,32 M60,2 L60,62" class="k-gv-sc-axis"/>'
          + '<circle cx="60" cy="32" r="26" class="k-gv-sc-ring"/>'
          + '<path d="M60,32 L80,15" class="k-gv-sc-curve"/><path d="M80,15 L80,32" class="k-gv-sc-line" data-dash="1"/>'
          + '<circle cx="80" cy="15" r="3.5" class="k-gv-sc-dot"/></svg>' });
      },
      "integration-area": function () {
        return el("span", { html: SVG_OPEN
          + '<path d="M36,56 L36,38 Q52,24 68,22 Q80,21 88,26 L88,56 Z" class="k-gv-sc-area"/>'
          + '<path d="M4,56 L116,56 M10,62 L10,2" class="k-gv-sc-axis"/>'
          + '<path d="M10,52 Q30,46 44,32 T84,24 T116,34" class="k-gv-sc-curve"/>'
          + '<text x="36" y="63" class="k-gv-sc-t">a</text><text x="88" y="63" class="k-gv-sc-t">b</text></svg>' });
      }
    };
    function labScene(id) {
      return (LAB_SCENE[id] || LAB_SCENE["sort-viz"])();
    }
    /* the preset banner's painted background, as a custom property */
    function bannerImage(id) {
      var css = KOS.governor.bannerPresetCss(id) || "";
      var m = /background-image:\s*([^;]+);?/.exec(css);
      return m ? m[1] : null;
    }
    function shopPreview(it) {
      var pv = el("div", { class: "k-gv-pv", "data-kind": it.kind, "aria-hidden": "true" });
      if (it.sw && it.kind !== "theme") it.sw.forEach(function (c, i) { pv.style.setProperty("--sw" + (i + 1), c); });
      if (it.kind === "banner") {
        var img = bannerImage(it.banner);
        if (img) pv.style.setProperty("--pv-banner", img);
        pv.appendChild(el("span", { class: "k-gv-pv-band" }));
      } else if (it.kind === "theme") {
        pv.appendChild(themeMini(it.theme, true));
      } else if (it.kind === "seal") {
        pv.appendChild(el("span", { class: "k-gv-pv-brand", "data-ui": "shop.preview-seal" }, [
          el("b", { text: "Kurenai" }),
          el("span", { class: "k-gv-pv-glyph", lang: "ja", text: it.glyph || "紅" })
        ]));
      } else if (it.kind === "frame") {
        /* the real component: the avatar at 64 in its HP ring, framed */
        var framed = KOS.governor.avatarNode(64);
        framed.setAttribute("data-frame", it.id);
        var hpRing = el("span", { class: "k-pc-ring", "data-ui": "shop.preview-frame" }, [framed]);
        hpRing.style.setProperty("--hp", Math.max(0, Math.min(100, g.hp)) + "%");
        hpRing.style.setProperty("--ring", "var(--teal)");
        pv.appendChild(hpRing);
      } else if (it.kind === "shelfskin") {
        /* the real shelf (frame 22e), scaled: the same spines and the skin's
           own back panel, board and sides */
        var spines = ["var(--cs)", "var(--cs)", "var(--crimson)", "var(--it)", "var(--amber)", "var(--maths)", "var(--teal)"];
        var shelfRow = el("span", { class: "k-bk-shelf" }, spines.map(function (c, i) {
          var sp = el("span", { class: "k-bk-spine" }, [el("span", { class: "k-bk-spine-n", text: String(i + 1) })]);
          sp.style.setProperty("--spine", c);
          return sp;
        }));
        pv.appendChild(el("span", { class: "k-mgrid k-gv-pv-shelf", "data-layout": "shelf", "data-ui": "shop.preview-shelf", "data-skin": it.id }, [shelfRow]));
      } else if (it.kind === "shrinestyle") {
        /* a small podium (02 · 01 · 03) in the style (frame 22e) */
        pv.appendChild(el("span", { class: "k-gv-pv-shrine", "data-ui": "shop.preview-shrine", "data-skin": it.id }, ["弐", "壱", "参"].map(function (g0, i) {
          return el("i", { "data-rank": String(i === 1 ? 1 : i === 0 ? 2 : 3) }, [el("b", { text: g0 })]);
        })));
      } else {
        var lab = LAB_MARK[it.id] || { mark: "◎", label: "explore" };
        pv.appendChild(el("span", { class: "k-gv-pv-lab", "data-ui": "shop.lab-scene", "data-scene": LAB_SCENE[it.id] ? it.id : "generic" }, [
          labScene(it.id),
          el("span", { class: "k-gv-pv-label", text: lab.label })
        ]));
      }
      /* the palette an item carries, as three dots (a theme shows its own
         tokens instead, above) */
      if (it.sw && it.kind !== "theme") pv.appendChild(el("span", { class: "k-gv-pv-sw", "data-ui": "shop.swatch" }, it.sw.slice(0, 3).map(function (c, i) {
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
      preview.appendChild(el("div", { class: "k-gv-id-body" }, [
        ring(94, p.hp, p.hpState, "span", { "data-ui": "gov.avatar-preview-avatar" }),
        el("div", { class: "k-gv-id-name" }, ["Level " + p.level + " ", el("span", { text: "· " + p.rank })]),
        p.status ? el("div", { class: "k-gv-id-status", "data-ui": "gov.avatar-preview-status", text: p.status }) : null
        /* the topbar seal preview went (review B): the card is the portrait,
           banner and status, and its foot lines up with the Frames card */
      ].filter(Boolean)));
      grid.appendChild(preview);
      function bannerName(id) {
        var found = KOS.governor.catalog().find(function (c) { return c.kind === "banner" && c.banner === id; });
        return found ? found.name : "Banner";
      }

      /* --- right: the workshop --- */
      var ctl = el("div", { class: "k-gv-controls", "data-ui": "gov.avatar-controls" });
      grid.appendChild(ctl);

      var hasPic = g.avatar.kind === "custom" && !!g.avatar.img, hasBanner = !!KOS.governor.bannerCss();
      ctl.appendChild(el("section", { class: "k-card k-gv-media", "data-ui": "gov.avatar-section", "aria-label": "Profile" }, [
        media({ label: "Profile picture", value: hasPic ? "Custom image" : "Default", hook: "gov.avatar-mc",
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

      /* no seal library (review A): with no picture the portrait is the
         default design */
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

      /* frame 22e: the Collection cosmetics — one choice row for the Books
         shelf skin and one for the Shrine style (the share card follows the
         Shrine style unless a card picks its own). Owned ones apply at once;
         the rest say ◈ and open the shop. */
      function cosmeticRow(label, kind, current, set) {
        var row = el("div", { class: "k-seg k-seg--quiet k-gv-cos-row", role: "group", "aria-label": label, "data-ui": "gov.cosmetic-row", "data-kind": kind });
        function opt(id, name, owned, price) {
          var on = (current || null) === id;
          var b = el("button", { type: "button", class: "k-seg-item", "aria-pressed": String(on), "data-value": id || "",
            "aria-label": owned ? name : name + " — in the Gold Shop for ◈ " + price,
            text: owned ? name : name + " · ◈",
            onclick: function () { if (!owned) { KOS.show("governor", "shop"); return; } set(id); render(); } });
          KOS.ui.state(b, "active", on);
          return b;
        }
        row.appendChild(opt(null, "Default", true));
        KOS.governor.catalog().filter(function (c) { return c.kind === kind; }).forEach(function (c) {
          row.appendChild(opt(c.id, c.name, KOS.governor.owns(c.id), c.price));
        });
        return el("div", { class: "k-gv-cos" }, [el("span", { class: "k-gv-cos-k", text: label }), row]);
      }
      ctl.appendChild(el("section", { class: "k-card k-gv-lib", "data-ui": "gov.collection-cosmetics", "aria-label": "Collection cosmetics" }, [
        cardHead("Collection cosmetics", "apply to the Books shelf and the Shrine"),
        cosmeticRow("Shelf skin", "shelfskin", KOS.governor.shelfSkin(), function (id) { KOS.governor.setShelfSkin(id); }),
        cosmeticRow("Shrine style", "shrinestyle", KOS.governor.shrineStyle(), function (id) { KOS.governor.setShrineStyle(id); })
      ]));

      /* the theme (21h): owned themes only, the chosen one ringed, and the
         device-following pair — Atelier Dawn by day, the dark choice by night */
      var ownedThemes = KOS.governor.catalog().filter(function (c) { return c.kind === "theme" && KOS.governor.owns(c.id); });
      var tgrid = el("div", { class: "k-gv-themes", "data-ui": "gov.theme-grid" }, ownedThemes.map(function (t) {
        var on = chosenTheme() === t.theme;
        return el("button", { type: "button", class: "k-gv-theme", "data-ui": "gov.theme-chip", "aria-pressed": on ? "true" : "false",
          "aria-label": t.name + (on ? " — current theme" : ""),
          onclick: function () { KOS.governor.setTheme(t.theme); render(); } }, [
          themeMini(t.theme, false),
          el("span", { class: "k-gv-theme-n" }, [t.name, on ? el("span", { class: "k-gv-theme-on", "aria-hidden": "true", text: "✓" }) : null].filter(Boolean))
        ]);
      }));
      var follow = el("input", { type: "checkbox", class: "k-switch", "data-ui": "gov.theme-follow", "aria-label": "Follow the system" });
      follow.checked = KOS.governor.themeFollow();
      follow.addEventListener("change", function () { KOS.governor.setThemeFollow(follow.checked); });
      /* a full-width row under the studio, so the identity stage and the
         workshop keep their matched heights */
      panel.appendChild(el("section", { class: "k-card k-gv-lib", "data-ui": "gov.theme-section", "aria-label": "Theme" }, [
        cardHead("Theme", ownedThemes.length + " owned",
          el("button", { type: "button", class: "k-link", text: "Get more in the Gold Shop →", onclick: function () { KOS.show("governor", "shop"); } })),
        tgrid,
        el("label", { class: "k-gv-theme-follow" }, [
          follow,
          el("span", { class: "k-gv-theme-follow-t", text: "Follow the system: Atelier Dawn by day, your dark theme by night" }),
          el("span", { class: "k-gv-theme-sync", text: "Synced to every device" })
        ])
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
        var st = KOS.sessions.stretches(e);
        if (st) st.forEach(function (x, i) { rows.push([i ? "Then" : "Stretches", x.label + (x.title ? " " + x.title : "") + " · " + x.mins + " min"]); });
        else if (e.subject) rows.push(["Linked", subjName(e.subject) + (e.ref ? " · " + e.ref : "")]);
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
