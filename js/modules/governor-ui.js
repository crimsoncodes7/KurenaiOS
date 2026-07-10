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

    main.appendChild(el("div", { class: "lab-h" }, [
      el("h1", { text: "Behavioural Governor" }),
      el("p", { class: "sub", text: "The motivational layer over your real study data. It can suspend the enrichment layer — labs, sims, the shop — but core revision never locks." })
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

    /* ---------------- STATUS — the Fable bento (Build 4.0) ----------------
       Identity · vitals · edicts · streak · exams · heatmap · ledger, laid
       out as a 12-column bento per the Fable mockup. It deliberately blends
       overview-page and governor-page concepts (design.md: accepted as-is). */
    var RANKS = [[1, "Novice"], [3, "Apprentice"], [5, "Scholar"], [8, "Adept"],
                 [12, "Sage"], [16, "Archivist"], [20, "Grandmaster"]];
    function rankName(level) {
      var r = RANKS[0][1];
      RANKS.forEach(function (x) { if (level >= x[0]) r = x[1]; });
      return r;
    }
    function bentoCard(cls, title, kids, endNote) {
      return el("div", { class: "card bento-card " + cls }, [
        el("h4", {}, [
          el("span", { text: title }),
          endNote ? el("span", { class: "end", text: endNote }) : null
        ]),
      ].concat(kids));
    }
    function renderStatus() {
      var hpCls = KOS.governor.hpState();
      var bento = el("div", { class: "bento gov-status gov-" + hpCls });
      panel.appendChild(bento);

      /* — identity — */
      var idCard = el("div", { class: "card bento-card b-id" }, [
        el("div", { class: "id-wrap" }, [
          KOS.governor.avatarNode(84),
          el("div", { class: "id-txt" }, [
            el("div", { class: "rank", text: rankName(li.level) }),
            el("h2", { text: "Level " + li.level }),
            el("div", { class: "title-line" }, [
              "Behavioural Governor \u00b7 ", el("b", { text: state.label })
            ]),
            el("div", { class: "lvl-row" }, [
              el("span", { class: "lvl-badge" }, [el("i", { text: "LV" }), String(li.level)]),
              el("div", { class: "hud-bar hud-xp big lvl-bar" }, [
                el("span", { style: "width:" + Math.round(100 * li.into / li.need) + "%" })]),
              el("span", { class: "to-next", text: (li.need - li.into) + " XP to Lv " + (li.level + 1) })
            ])
          ])
        ])
      ]);
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
        vital("gold", "Gold", "\u25c8 " + g.gold,
          cheapest ? 100 * g.gold / cheapest.price : 100,
          cheapest ? (g.gold >= cheapest.price ? cheapest.name + " is affordable now"
                     : (cheapest.price - g.gold) + " more for " + cheapest.name) : "everything owned"),
        vital("xp", "XP", li.into + " / " + li.need, 100 * li.into / li.need,
          "level " + (li.level + 1) + " at " + li.need + " XP")
      ]));

      /* — edicts: the live to-do panel (one implementation, todo.js) — */
      var edicts = el("div", { class: "card bento-card b-edicts" });
      edicts.appendChild(KOS.todo.panel());
      bento.appendChild(edicts);

      /* — streak — */
      var stks = KOS.sessions.streaks();
      var week = [];
      var dayMs = 864e5;
      var activeDates = {};
      KOS.sessions.all().forEach(function (s) { activeDates[s.date] = true; });
      for (var i = 6; i >= 0; i--) {
        var d = new Date(Date.now() - i * dayMs);
        var iso = d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
        week.push({ on: !!activeDates[iso], today: i === 0 });
      }
      bento.appendChild(bentoCard("b-streak", "Study streak", [
        el("div", { class: "streak-big" }, [
          el("b", { text: String(stks.all) }),
          el("small", { text: stks.all === 1 ? "day" : "days" })
        ]),
        el("div", { class: "week-dots" }, week.map(function (w) {
          return el("i", { class: (w.on ? "on" : "") + (w.today && !w.on ? " today" : "") });
        })),
        el("div", { class: "streak-best", text: "CS " + stks.compsci + " \u00b7 Maths " + stks.maths + " \u00b7 IT " + stks.it })
      ]));

      /* — exams / deadlines — */
      var exams = el("div", { class: "card bento-card b-exams" });
      exams.appendChild(KOS.calendar.countdownWidget(null));
      bento.appendChild(exams);

      /* — the activity heatmap — */
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
      var heat = el("div", { class: "heat-wrap" }, [
        el("div", { class: "heat-svg" }, [KOS.charts.heatmap(days, {})]),
        el("div", { class: "heat-side" }, [
          el("div", { class: "hnum", text: String(totalSess) }),
          el("div", { class: "hlbl", text: "sessions \u00b7 16 weeks" }),
          el("div", { class: "hrow" }, [el("span", { text: "Active days" }), el("b", { text: String(activeDays) })]),
          el("div", { class: "hrow" }, [el("span", { text: "Cards due" }), el("b", { text: String(KOS.srs.dueCount()) })]),
          el("div", { class: "hrow" }, [el("span", { text: "Rest streak" }), el("b", { text: String(stks.rest || 0) })])
        ])
      ]);
      bento.appendChild(bentoCard("b-heat", "Activity", [heat]));

      /* — ledger: the most recent governor-relevant sessions — */
      var led = el("div", { class: "ledger" });
      var recent = KOS.sessions.all().slice(-8).reverse();
      if (!recent.length) led.appendChild(el("p", { class: "sub", text: "No sessions yet \u2014 finish a flashcard batch, quiz or focus block and it lands here." }));
      recent.forEach(function (s) {
        var sig = s.type === "quiz" || s.type === "exam" ? "plus-xp"
                : s.type === "todo" ? "plus-g"
                : s.type === "media" ? "log" : "plus-xp";
        var sigTxt = s.type === "media" ? "\u00b7 rest" : s.type === "todo" ? "+ gold" : "+ XP";
        led.appendChild(el("div", { class: "led-row" }, [
          el("span", { class: "sig " + sig, text: sigTxt }),
          el("span", { class: "lt", text: s.type + (s.subject ? " \u00b7 " + s.subject + (s.ref ? " " + s.ref : "") : "") }),
          el("span", { class: "when", text: s.date })
        ]));
      });
      bento.appendChild(bentoCard("b-ledger", "Ledger", [led], "latest 8"));

      /* recovery checklist — full-width when not healthy */
      if (hpCls !== "healthy") {
        var rec = el("div", { class: "gov-recovery b-wide" + (hpCls === "critical" ? " urgent" : "") });
        rec.appendChild(el("h3", { class: "n-h", text: hpCls === "critical" ? "Recovery Mode \u2014 fastest route back" : "Shortest route back to Healthy" }));
        KOS.governor.recoveryTasks().forEach(function (t) {
          var done = t.cur >= t.target;
          rec.appendChild(el("button", { class: "gov-rec-item" + (done ? " done" : ""), onclick: t.go }, [
            el("span", { class: "gov-rec-check", text: done ? "\u2713" : "\u25cb" }),
            el("span", { text: t.label }),
            el("span", { class: "gov-rec-n", text: t.cur + "/" + t.target })
          ]));
        });
        bento.appendChild(rec);
      }

      /* how HP moves — kept, full width below the bento */
      panel.appendChild(el("div", { class: "gov-rules" }, [
        el("div", { class: "gov-rule" }, [el("b", { text: "Drains" }), el("span", { text: "a day with zero logged sessions (\u221215), or a due-card backlog past " + KOS.governor.BACKLOG_LIMIT + " (\u221210/day)." })]),
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
                    ["theme", "OS themes"], ["seal", "Kanji seals"], ["frame", "Avatar frames"],
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
                       (it.kind === "shrinestyle" && (g.shrineStyle === it.id));
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
        text: all.length + " logged sessions — streaks, HP and the future RAG flags all derive from this record." }));
      var table = el("table", { class: "n-table gov-log" });
      table.appendChild(el("thead", {}, [el("tr", {}, [
        el("th", { text: "Date" }), el("th", { text: "Activity" }), el("th", { text: "Topic" }),
        el("th", { text: "Performance" }), el("th", { text: "Duration" })
      ])]));
      var tb = el("tbody", {});
      all.slice(0, 60).forEach(function (e) {
        var m = e.metrics || {};
        var perf = e.type === "quiz" ? m.correct + "/" + m.total + " (" + m.pct + "%)"
          : e.type === "exam" ? m.marks + "/" + m.max + " marks"
          : (e.type === "flashcards" || e.type === "due-review")
            ? m.cards + " cards · " + (m.again || 0) + " again"
          : e.type === "todo" ? (m.item || "item ticked") : "—";
        tb.appendChild(el("tr", {}, [
          el("td", { text: e.date }),
          el("td", { text: e.type }),
          el("td", { text: e.subject ? e.subject + (e.ref ? " · " + e.ref : "") : "mixed" }),
          el("td", { text: perf }),
          el("td", { text: e.dur != null ? Math.round(e.dur / 60) + " min" : "—" })
        ]));
      });
      table.appendChild(tb);
      panel.appendChild(el("div", { class: "n-tablewrap" }, [table]));
      if (all.length > 60) panel.appendChild(el("p", { class: "sub", text: "Showing the most recent 60." }));
    }

    render();
  };
})();
