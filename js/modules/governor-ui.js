/* Kurenai OS — modules/governor-ui.js
   The Behavioural Governor panel: status + recovery, the gold shop,
   the avatar system, and the session history log (FR-3.2 surfaced). */
(function () {
  "use strict";
  var el = KOS.ui.el, store = KOS.store;

  var TABS = [
    ["status", "Status"],
    ["shop", "Gold Shop"],
    ["avatar", "Avatar"],
    ["history", "Session Log"]
  ];

  KOS.views.governor = function (main, openTab) {
    document.getElementById("tree").classList.add("hidden");
    document.getElementById("cols").classList.add("no-tree");
    var g = store.state.governor;
    var li = KOS.governor.levelInfo(g.xp);
    var state = KOS.governor.hpStateInfo();

    main.appendChild(el("div", { class: "dash-head" }, [
      el("div", { class: "dh-txt" }, [
        el("span", { class: "dh-kicker", text: "Command centre" }),
        el("h1", { text: "The Governor's Seat" }),
        el("div", { class: "dh-sub" }, [
          el("span", { class: "board", text: "One glance at the whole domain — vitals, cadence, and the ledger." })
        ])
      ])
    ]));

    var cur = TABS.some(function (t) { return t[0] === openTab; }) ? openTab : "status";
    var bar = el("div", { class: "study-tabs", role: "tablist" });
    var panel = el("div", { class: "study-panel" });
    TABS.forEach(function (t) {
      bar.appendChild(el("button", { class: "study-tab" + (t[0] === cur ? " active" : ""), role: "tab", "data-tab": t[0],
        onclick: function () {
          cur = t[0];
          bar.querySelectorAll(".study-tab").forEach(function (b) {
            b.classList.toggle("active", b.dataset.tab === cur); });
          render();
        } }, [t[1]]));
    });
    main.appendChild(bar);
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
       Identity over a paintable banner · vitals with human hints · the
       study cadence · the Fable ledger. Directives, countdowns and the
       streak live on the Overview — this page is the command record. */
    function bentoCard(cls, title, kids, endNote) {
      return el("div", { class: "card bento-card " + cls }, [
        el("h4", {}, [
          el("span", { text: title }),
          endNote ? el("span", { class: "end", text: endNote }) : null
        ]),
      ].concat(kids));
    }

    /* one ledger line: signed chip · human description · relative time */
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
          if (m.action === "sync-reward") desc = (m.entries || 0) + " title" + (m.entries === 1 ? "" : "s") + " synced from " + (m.module === "vn" ? "VNDB" : "AniList");
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

    function renderStatus() {
      var hpCls = KOS.governor.hpState();
      var bento = el("div", { class: "bento gov-status gov-" + hpCls });
      panel.appendChild(bento);
      var stks = KOS.sessions.streaks();
      var dayMs = 864e5;

      /* — identity, over the banner — */
      var bannerCss = KOS.governor.bannerCss();
      var idCard = el("div", { class: "card bento-card b-id" + (bannerCss ? " has-banner" : "") +
        (bannerCss && KOS.governor.bannerIsDark() ? " banner-dark" : "") });
      if (bannerCss) idCard.style.cssText += bannerCss;
      idCard.appendChild(el("div", { class: "id-wrap" }, [
        KOS.governor.avatarNode(88),
        el("div", { class: "id-txt" }, [
          el("div", { class: "rank", text: KOS.rankName(li.level) }),
          el("h2", { text: "Level " + li.level }),
          el("div", { class: "title-line" }, [
            "Behavioural Governor · ", el("b", { text: state.label }),
            " · " + KOS.sessions.all().length + " sessions on record"
          ]),
          el("div", { class: "lvl-row" }, [
            el("span", { class: "lvl-badge" }, [el("i", { text: "LV" }), String(li.level)]),
            el("div", { class: "hud-bar hud-xp big lvl-bar" }, [
              el("span", { style: "width:" + Math.round(100 * li.into / li.need) + "%" })]),
            el("span", { class: "to-next", text: (li.need - li.into) + " XP to Lv " + (li.level + 1) })
          ]),
          el("div", { class: "id-substats" }, [
            el("span", {}, [el("b", { text: String(stks.all) }), " day streak"]),
            el("span", {}, [el("b", { text: "◈ " + g.gold }), " gold"]),
            el("span", {}, [el("b", { text: String(KOS.srs.dueCount()) }), " cards due"])
          ])
        ])
      ]));
      /* banner controls — quiet, top-right of the card */
      var bfile = el("input", { type: "file", accept: "image/*", style: "display:none", onchange: function () {
        if (!bfile.files[0]) return;
        KOS.governor.setCustomBanner(bfile.files[0], function (err) {
          if (err) { KOS.ui.toast("Banner upload failed: " + err.message, true); return; }
          KOS.ui.toast("Banner set.");
          render();
        });
      } });
      idCard.appendChild(bfile);
      idCard.appendChild(el("div", { class: "id-banner-ctl" }, [
        el("button", { class: "mini-btn", text: "⤒ Banner", title: "Upload a banner image for your profile",
          onclick: function () { bfile.click(); } }),
        bannerCss ? el("button", { class: "mini-btn", text: "✕", title: "Remove the banner",
          onclick: function () { KOS.governor.setBanner(null); render(); } }) : null
      ]));
      bento.appendChild(idCard);

      /* — vitals — */
      var cheapest = KOS.governor.catalog()
        .filter(function (c) { return !KOS.governor.owns(c.id); })
        .sort(function (a, b) { return a.price - b.price; })[0];
      function vital(cls, label, val, pct, hint, warn) {
        return el("div", { class: "vital " + cls }, [
          el("div", { class: "vt" }, [
            el("b", { text: label }),
            el("span", { class: "val", text: val })
          ]),
          el("div", { class: "hud-bar big " + (cls === "hp" ? "hud-hp" : cls === "xp" ? "hud-xp" : "hud-gold") },
            [el("span", { style: "width:" + Math.max(0, Math.min(100, pct)) + "%" })]),
          hint ? el("div", { class: "hint" + (warn ? " warn" : ""), text: hint }) : null
        ]);
      }
      bento.appendChild(bentoCard("b-vitals", "Vitals", [
        vital("hp", "HP", g.hp + " / 100", g.hp, state.desc, hpCls !== "healthy"),
        vital("gold", "Gold", "◈ " + g.gold,
          cheapest ? 100 * g.gold / cheapest.price : 100,
          cheapest ? (g.gold >= cheapest.price ? cheapest.name + " is affordable now"
                     : (cheapest.price - g.gold) + " more for " + cheapest.name) : "everything owned"),
        vital("xp", "XP", li.into + " / " + li.need, 100 * li.into / li.need,
          "level " + (li.level + 1) + " at " + li.need + " XP")
      ]));

      /* — study cadence: the heatmap with its numbers — */
      var byDate = {};
      KOS.sessions.all().forEach(function (s) { byDate[s.date] = (byDate[s.date] || 0) + 1; });
      var days = [];
      for (var j = 16 * 7 - 1; j >= 0; j--) {
        var dd = new Date(Date.now() - j * dayMs);
        var iso2 = dd.getFullYear() + "-" + ("0" + (dd.getMonth() + 1)).slice(-2) + "-" + ("0" + dd.getDate()).slice(-2);
        days.push({ date: iso2, value: byDate[iso2] || 0 });
      }
      var totalSess = days.reduce(function (a, d) { return a + d.value; }, 0);
      var activeDays = days.filter(function (d) { return d.value > 0; }).length;
      var since = days[0].date;
      var bySubj = {};
      var weekSecs = 0;
      var weekStart = KOS.srs.addDays(KOS.srs.todayISO(), -6);
      KOS.sessions.all().forEach(function (s) {
        if (s.date >= since && s.subject) bySubj[s.subject] = (bySubj[s.subject] || 0) + 1;
        if (s.date >= weekStart && s.type !== "media") weekSecs += (s.dur || 0);
      });
      var bestSubj = Object.keys(bySubj).sort(function (a, b) { return bySubj[b] - bySubj[a]; })[0];
      var heat = el("div", { class: "heat-wrap" }, [
        el("div", { class: "heat-svg" }, [KOS.charts.heatmap(days, {})]),
        el("div", { class: "heat-side" }, [
          el("div", { class: "hnum", text: String(totalSess) }),
          el("div", { class: "hlbl", text: "sessions · 16 weeks" }),
          el("div", { class: "hrow" }, [el("span", { text: "Active days" }), el("b", { text: String(activeDays) })]),
          bestSubj ? el("div", { class: "hrow" }, [el("span", { text: "Best subject" }), el("b", { text: subjName(bestSubj) })]) : null,
          el("div", { class: "hrow" }, [el("span", { text: "This week" }), el("b", { text: weekSecs ? Math.round(weekSecs / 60) + " min timed" : "—" })]),
          el("div", { class: "hrow" }, [el("span", { text: "Rest streak" }), el("b", { text: String(stks.rest || 0) })])
        ])
      ]);
      bento.appendChild(bentoCard("b-heat", "Study cadence", [heat], "last 16 weeks"));

      /* — the ledger — */
      var led = el("div", { class: "ledger" });
      var recent = KOS.sessions.all().slice(-9).reverse();
      if (!recent.length) led.appendChild(el("p", { class: "sub", text: "No sessions yet — finish a flashcard batch, quiz or focus block and it lands here." }));
      recent.forEach(function (s) { led.appendChild(ledgerRow(s)); });
      bento.appendChild(bentoCard("b-ledger", "The ledger", [led], "recent"));

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

    /* ---------------- SHOP ---------------- */
    function renderShop() {
      var suspended = KOS.governor.hpState() !== "healthy";
      if (suspended) {
        panel.appendChild(el("div", { class: "gov-banner bad", html:
          "<b>Shop suspended.</b> HP is " + state.label + " — purchases and purchased labs reopen at 60 HP." }));
      }
      var groups = [["lab", "Labs & simulations — one-time permanent unlocks"],
                    ["theme", "OS themes"], ["banner", "Profile banners — painted backdrops for the identity card"],
                    ["seal", "Kanji seals"], ["frame", "Avatar frames"],
                    ["shelfskin", "Bookshelf skins — Books' Physical tab"],
                    ["shrinestyle", "Shrine card styles"]];
      groups.forEach(function (grp) {
        var items = KOS.governor.catalog().filter(function (c) { return c.kind === grp[0]; });
        if (!items.length) return;
        panel.appendChild(el("h3", { class: "n-h", text: grp[1] }));
        var row = el("div", { class: "shop-grid" });
        items.forEach(function (it) {
          var owned = KOS.governor.owns(it.id);
          var active = (it.kind === "theme" && (g.theme === it.theme)) ||
                       (it.kind === "seal" && (g.seal === it.id)) ||
                       (it.kind === "frame" && (g.avatar.frame === it.id)) ||
                       (it.kind === "shelfskin" && (g.shelfSkin === it.id)) ||
                       (it.kind === "shrinestyle" && (g.shrineStyle === it.id)) ||
                       (it.kind === "banner" && (g.banner === it.banner));
          var card = el("div", { class: "shop-card" + (owned ? " owned" : "") + (suspended && it.kind === "lab" ? " suspended" : "") });
          card.appendChild(el("div", { class: "shop-card-h" }, [
            el("b", { text: it.name }),
            owned ? el("span", { class: "shop-owned", text: active ? "Active" : "Owned" })
                  : el("span", { class: "shop-price", text: "◈ " + it.price })
          ]));
          if (it.sw) {
            card.appendChild(el("div", { class: "shop-sw" }, it.sw.map(function (c) {
              return el("span", { class: "shop-sw-dot", style: "background:" + c });
            })));
          }
          card.appendChild(el("p", { class: "sub", text: it.desc }));
          if (!owned) {
            var buyBtn = el("button", { class: "btn gold", text: "Buy — ◈ " + it.price,
              onclick: function () {
                var r = KOS.governor.buy(it.id);
                KOS.ui.toast(r.msg, !r.ok);
                if (r.ok) render();
              } });
            buyBtn.disabled = suspended || g.gold < it.price;
            card.appendChild(buyBtn);
          } else if (it.kind === "theme") {
            card.appendChild(el("button", { class: "btn", text: active ? "✓ Applied" : "Apply theme", onclick: function () {
              KOS.governor.setTheme(active ? "kurenai" : it.theme); render();
            } }));
          } else if (it.kind === "seal") {
            card.appendChild(el("button", { class: "btn", text: active ? "✓ Applied" : "Apply seal", onclick: function () {
              KOS.governor.setSeal(active ? "kurenai" : it.id); render();
            } }));
          } else if (it.kind === "frame") {
            card.appendChild(el("button", { class: "btn", text: active ? "✓ Worn" : "Wear frame", onclick: function () {
              g.avatar.frame = active ? null : it.id;
              store.save(); KOS.refreshHUD(); render();
            } }));
          } else if (it.kind === "shelfskin") {
            card.appendChild(el("button", { class: "btn", text: active ? "✓ Applied" : "Apply skin", onclick: function () {
              KOS.governor.setShelfSkin(active ? null : it.id); render();
            } }));
          } else if (it.kind === "shrinestyle") {
            card.appendChild(el("button", { class: "btn", text: active ? "✓ Applied" : "Apply style", onclick: function () {
              KOS.governor.setShrineStyle(active ? null : it.id); render();
            } }));
          } else if (it.kind === "banner") {
            card.appendChild(el("button", { class: "btn", text: active ? "✓ Hung" : "Hang banner", onclick: function () {
              KOS.governor.setBanner(active ? null : it.banner); render();
            } }));
          } else {
            card.appendChild(el("p", { class: "shop-note", text: suspended ? "Suspended until HP recovers." : "Unlocked — reachable from its subject's Practice zone." }));
          }
          row.appendChild(card);
        });
        panel.appendChild(row);
      });
      panel.appendChild(el("p", { class: "sub", style: "margin-top:16px",
        text: "Earning gold: session completions, streak milestones, quiz scores ≥80%, and clearing the due queue to zero. Worked examples, flashcards and quizzes are free forever." }));
    }

    /* ---------------- AVATAR ---------------- */
    function renderAvatar() {
      panel.appendChild(el("h3", { class: "n-h", style: "margin-top:0", text: "Seal library — unlocks by level" }));
      var grid = el("div", { class: "seal-grid" });
      KOS.governor.seals().forEach(function (s) {
        var unlocked = KOS.governor.sealUnlocked(s);
        var active = g.avatar.kind === "seal" && g.avatar.id === s.id;
        var card = el("button", { class: "seal-card" + (active ? " active" : "") + (unlocked ? "" : " locked"),
          onclick: function () {
            if (!unlocked) { KOS.ui.toast("Unlocks at level " + s.minLevel + " — you're level " + li.level + ".", true); return; }
            g.avatar.kind = "seal"; g.avatar.id = s.id;
            store.save(); KOS.refreshHUD(); render();
          } });
        card.innerHTML = KOS.governor.sealSvg(s);
        card.appendChild(el("span", { class: "seal-name", text: s.name }));
        card.appendChild(el("span", { class: "seal-lv", text: unlocked ? (active ? "Active" : "Level " + s.minLevel) : "Locks off at Lv " + s.minLevel }));
        grid.appendChild(card);
      });
      panel.appendChild(grid);

      panel.appendChild(el("h3", { class: "n-h", text: "Custom avatar" }));
      var row = el("div", { class: "lab-controls" });
      var file = el("input", { type: "file", accept: "image/*", style: "display:none", onchange: function () {
        if (!file.files[0]) return;
        KOS.governor.setCustomAvatar(file.files[0], function (err) {
          if (err) KOS.ui.toast("Upload failed: " + err.message, true);
          else { KOS.ui.toast("Avatar set — cropped to a circle and compressed to 256×256."); render(); }
        });
      } });
      row.appendChild(file);
      row.appendChild(el("button", { class: "btn primary", text: "Upload image…", onclick: function () { file.click(); } }));
      if (g.avatar.kind === "custom" && g.avatar.img) {
        row.appendChild(el("button", { class: "btn", text: "Remove custom image", onclick: function () {
          g.avatar.kind = "seal"; g.avatar.img = null;
          store.save(); KOS.refreshHUD(); render();
        } }));
      }
      panel.appendChild(el("p", { class: "sub", text: "Images are centre-cropped to a circle, resized to 256×256 and stored compressed in this browser — large originals never touch localStorage." }));
      panel.appendChild(row);
      panel.appendChild(el("div", { class: "avatar-preview" }, [
        KOS.governor.avatarNode(96),
        el("span", { class: "sub", text: "Current avatar" + (g.avatar.frame ? " · " + (KOS.governor.item(g.avatar.frame) || {}).name : "") })
      ]));
    }

    /* ---------------- HISTORY ---------------- */
    function renderHistory() {
      var all = KOS.sessions.all().slice().reverse();
      if (!all.length) {
        panel.appendChild(el("p", { class: "sub", text: "No sessions logged yet. Finish a flashcard batch, quiz or exam question and it lands here." }));
        return;
      }
      panel.appendChild(el("p", { class: "sub", style: "margin-top:0",
        text: all.length + " sessions on record — streaks, HP and the struggle flags all read from this ledger." }));
      /* the full ledger, day-grouped, in the same voice as the status card */
      var wrap = el("div", { class: "gov-log ledger" });
      var lastDate = null;
      all.slice(0, 120).forEach(function (e) {
        if (e.date !== lastDate) {
          lastDate = e.date;
          var d = new Date(e.date + "T12:00:00");
          wrap.appendChild(el("div", { class: "led-day", text:
            d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }) }));
        }
        wrap.appendChild(KOS.governorLedgerRow(e));
      });
      panel.appendChild(wrap);
      if (all.length > 120) panel.appendChild(el("p", { class: "sub", text: "Showing the most recent 120." }));
    }

    render();
  };
})();
