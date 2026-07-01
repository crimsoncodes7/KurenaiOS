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

    /* ---------------- STATUS + RECOVERY ---------------- */
    function renderStatus() {
      var hpCls = KOS.governor.hpState();
      var card = el("div", { class: "gov-status gov-" + hpCls });
      card.appendChild(el("div", { class: "gov-status-top" }, [
        KOS.governor.avatarNode(64),
        el("div", { class: "gov-status-id" }, [
          el("div", { class: "gov-lv-big", text: "Level " + li.level }),
          el("div", { class: "sub", text: li.into + " / " + li.need + " XP to level " + (li.level + 1) }),
          el("div", { class: "hud-bar hud-xp big" }, [el("span", { style: "width:" + Math.round(100 * li.into / li.need) + "%" })])
        ]),
        el("div", { class: "gov-gold-big", title: "Gold" }, [
          el("b", { text: "◈ " + g.gold }),
          el("span", { class: "sub", text: "gold" })
        ])
      ]));
      card.appendChild(el("div", { class: "gov-hp-row" }, [
        el("span", { class: "gov-hp-label", text: "HP " + g.hp + "/100 — " + state.label }),
        el("div", { class: "hud-bar hud-hp big" }, [el("span", { style: "width:" + g.hp + "%" })]),
        el("p", { class: "sub", text: state.desc })
      ]));
      panel.appendChild(card);

      /* how HP moves */
      panel.appendChild(el("div", { class: "gov-rules" }, [
        el("div", { class: "gov-rule" }, [el("b", { text: "Drains" }), el("span", { text: "a day with zero logged sessions (−15), or a due-card backlog past " + KOS.governor.BACKLOG_LIMIT + " (−10/day)." })]),
        el("div", { class: "gov-rule" }, [el("b", { text: "Restores" }), el("span", { text: "completing sessions, clearing due reviews, ticking to-do items. Restores trickle at half rate while Critical." })]),
        el("div", { class: "gov-rule" }, [el("b", { text: "Never locks" }), el("span", { text: "spec reading, notes, personal notes, per-topic flashcards, quizzes, exam questions." })])
      ]));

      /* recovery checklist — surfaced hard when critical, visible when strained */
      if (hpCls !== "healthy") {
        var rec = el("div", { class: "gov-recovery" + (hpCls === "critical" ? " urgent" : "") });
        rec.appendChild(el("h3", { class: "n-h", text: hpCls === "critical" ? "Recovery Mode — fastest route back" : "Shortest route back to Healthy" }));
        KOS.governor.recoveryTasks().forEach(function (t) {
          var done = t.cur >= t.target;
          rec.appendChild(el("button", { class: "gov-rec-item" + (done ? " done" : ""), onclick: t.go }, [
            el("span", { class: "gov-rec-check", text: done ? "✓" : "○" }),
            el("span", { text: t.label }),
            el("span", { class: "gov-rec-n", text: t.cur + "/" + t.target })
          ]));
        });
        panel.appendChild(rec);
      }

      /* streaks (FR-3.7) */
      var stks = KOS.sessions.streaks();
      var names = { all: "Overall", compsci: "Computer Science", maths: "Mathematics", it: "IT" };
      var srow = el("div", { class: "stat-strip" });
      Object.keys(names).forEach(function (k) {
        srow.appendChild(el("div", { class: "stat-card" }, [
          el("div", { class: "v", text: stks[k] + (stks[k] === 1 ? " day" : " days") }),
          el("div", { class: "k", text: names[k] + " streak" })
        ]));
      });
      panel.appendChild(el("h3", { class: "n-h", text: "Study streaks" }));
      panel.appendChild(srow);
    }

    /* ---------------- SHOP ---------------- */
    function renderShop() {
      var suspended = KOS.governor.hpState() !== "healthy";
      if (suspended) {
        panel.appendChild(el("div", { class: "gov-banner bad", html:
          "<b>Shop suspended.</b> HP is " + state.label + " — purchases and purchased labs reopen at 60 HP." }));
      }
      var groups = [["lab", "Labs & simulations — one-time permanent unlocks"],
                    ["theme", "OS themes"], ["seal", "Kanji seals"], ["frame", "Avatar frames"]];
      groups.forEach(function (grp) {
        var items = KOS.governor.catalog().filter(function (c) { return c.kind === grp[0]; });
        if (!items.length) return;
        panel.appendChild(el("h3", { class: "n-h", text: grp[1] }));
        var row = el("div", { class: "shop-grid" });
        items.forEach(function (it) {
          var owned = KOS.governor.owns(it.id);
          var active = (it.kind === "theme" && (g.theme === it.theme)) ||
                       (it.kind === "seal" && (g.seal === it.id)) ||
                       (it.kind === "frame" && (g.avatar.frame === it.id));
          var card = el("div", { class: "shop-card" + (owned ? " owned" : "") + (suspended && it.kind === "lab" ? " suspended" : "") });
          card.appendChild(el("div", { class: "shop-card-h" }, [
            el("b", { text: it.name }),
            owned ? el("span", { class: "shop-owned", text: active ? "Active" : "Owned" })
                  : el("span", { class: "shop-price", text: "◈ " + it.price })
          ]));
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
