/* Kurenai OS — modules/matrix.js
   The Kurenai Collection Matrix home (Build 3a/3b/3e): the cross-media
   view over Anime, Books (manga & light novels), Visual Novels and Games —
   all four real as of Build 3e.
   Everything on this page is module-agnostic: the "currently consuming"
   strip and the stats read whatever the vault holds, whichever module it
   belongs to. Charts reuse KOS.charts (the Build 2c inline-SVG helpers),
   not a new charting approach.

   Category 7 Phase D — PARTIAL REDESIGN, as the audit prescribed. The
   composition survives (this was the most alive page in the app); the
   content selection is replaced:

     · MTX-2 — four near-identical "X by status" bar charts, two of them
       carrying a single bar, become ONE small-multiples row on a shared
       scale with one legend. The comparison was the point; four cards
       each showing a quarter of it was not.
     · MTX-3 — the four module totals appeared FOUR times on one page (KPI
       row, whole-vault donut, medium donut, module cards). Each module's
       totals are now the job of its own card; the KPI row carries only the
       cross-media figures no card can say, and one donut survives.
     · MTX-4 — every chart gained a value axis, gridlines, hover titles and
       an 11px label floor. That work lives in core/charts.js, so it pays
       out on every chart in the app.
     · MTX-5 — zero tiles are suppressed, and "score distribution" refuses
       to draw a distribution from one rated title; it says so instead.
     · MTX-6 — progress is printed through KOS.media.progressText.
     · The long tail moved behind an Analytics tab, so the overview is one
       screen again.

   Collection mirror release — the overview is "what next?" only: an
   airing SCHEDULE grouped by day (watching titles only), the on-the-go
   cards with their +1, and the four vault doors. The figures and the
   status comparison joined Analytics; the streak chips went (the
   Governor page owns streaks); the Overview/Analytics switcher rides the
   page header's action slot like Planner and Sync.                     */
(function () {
  "use strict";
  var el = KOS.ui.el;

  /* the schedule's day buckets — local-time calendar days from now */
  function dayLabel(airingAtSecs, now) {
    var d = new Date(airingAtSecs * 1000);
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var that = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    var diff = Math.round((that - today) / 86400000);
    if (diff <= 0) return { key: "0", label: "Today", sub: d.toLocaleDateString(undefined, { day: "numeric", month: "short" }) };
    if (diff === 1) return { key: "1", label: "Tomorrow", sub: d.toLocaleDateString(undefined, { day: "numeric", month: "short" }) };
    if (diff < 7) return { key: String(diff), label: d.toLocaleDateString(undefined, { weekday: "long" }), sub: d.toLocaleDateString(undefined, { day: "numeric", month: "short" }) };
    return { key: "9" + ("00" + diff).slice(-3), label: d.toLocaleDateString(undefined, { day: "numeric", month: "short" }), sub: d.toLocaleDateString(undefined, { weekday: "short" }) };
  }
  function clock(secs) {
    return new Date(secs * 1000).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  }

  KOS.views.matrix = function (main) {
    KOS.shell.tree("none");

    /* ---- the two panes: the switcher rides the page header's action
       slot, aligned with the title the way Planner and Sync do it ---- */
    var tab = "overview";
    var tabBar = el("div", { class: "k-cluster" });
    function buildTabs() {
      var t = KOS.ui.tabs([
        { label: "Overview", active: tab === "overview", onSelect: function () { setTab("overview"); } },
        { label: "Analytics", active: tab === "analytics", onSelect: function () { setTab("analytics"); } }
      ], { variant: "workspace", label: "Collection views" });
      KOS.medview.addHook(t, "coll.tabs");
      return t;
    }
    function setTab(next) {
      if (tab === next) return;
      tab = next;
      tabBar.innerHTML = "";
      tabBar.appendChild(buildTabs());
      var stage = document.getElementById("stage");
      if (stage) stage.scrollTop = 0;
      render();
    }
    tabBar.appendChild(buildTabs());

    main.appendChild(KOS.ui.pageHeader({
      kicker: "蒐 · Personal archive",
      title: "The Collection",
      sub: "The other half of the ledger: what you watch, read and play.",
      actions: [tabBar]
    }));

    if (KOS.medview.unavailable(main)) return;

    var pane = el("div", { class: "k-mx" });
    main.appendChild(pane);

    /* ONE aggregate pass, reused by both panes — KOS.mediadb.stats walks
       every row in the vault, and doing that again on each tab switch is
       a full-table scan the user pays for with a stutter */
    var agg = null, aggErr = false;
    KOS.mediadb.stats(function (err, a) {
      aggErr = !!err;
      agg = a || null;
      render();
    });

    function render() {
      pane.innerHTML = "";
      if (tab === "overview") renderOverview();
      else renderAnalytics();
    }
    function openEntry(e) {
      KOS.mediaEditor(e, function () { KOS.show("matrix", undefined, { _nav: true }); });
    }

    /* ================= overview (frame 11a) ================= */
    /* The ledger in six figures, then what is on the go, then what airs
       next beside where each medium stands, then the four doors. */
    function renderOverview() {
      if (!aggErr && agg && agg.total) pane.appendChild(figureBand());

      /* ---- on the go — every medium, most recently touched first; each
         card carries the everyday +1 where the medium has a unit ---- */
      var nowWrap = el("section", { class: "k-mx-now", "aria-label": "Currently consuming" });
      pane.appendChild(nowWrap);
      function renderNow() {
        KOS.mediadb.query({ status: "inProgress", sort: "updated" }, function (err, current) {
          if (err || !document.body.contains(nowWrap)) return;
          nowWrap.innerHTML = "";
          nowWrap.appendChild(el("div", { class: "k-card-head k-mx-head" }, [
            el("h2", { class: "k-mx-title", text: "Currently consuming" }),
            current.length ? el("span", { class: "k-card-meta", text: current.length + " in progress · most recent first" }) : null
          ].filter(Boolean)));
          if (!current.length) {
            nowWrap.appendChild(KOS.ui.emptyState({ compact: true,
              body: "Nothing in progress — sync your AniList, or start something from a vault.",
              action: el("button", { type: "button", class: "k-btn", text: "⇅ Sync & Import", onclick: function () { KOS.show("mediasync"); } }) }));
            return;
          }
          var grid = el("div", { class: "k-mx-now-grid" });
          current.slice(0, 12).forEach(function (e) {
            var mod = KOS.media.module(e.module);
            var prog = KOS.media.progressText(e);
            var bumpMode = mod.id === "anime" || mod.id === "books" ? "progress" : mod.id === "game" ? "hours" : null;
            var air = KOS.anime.airingInfo(e);
            var art = el("span", { class: "k-mx-now-art" }, [
              KOS.medview.cover(e, mod.kanji),
              el("span", { class: "k-mchip k-mx-now-kind", text: mod.id === "books" && e.format ? (KOS.media.FORMAT_LABEL[e.format] || mod.label) : mod.label }),
              bumpMode ? el("button", { type: "button", class: "k-mx-now-plus", "data-ui": "coll.now-plus", text: "+1 " + mod.unit,
                title: "Log the next " + mod.unitName.replace(/s$/, ""), onclick: function (ev) {
                  ev.stopPropagation();
                  KOS.medview.bumpUnit(e, bumpMode, function () { renderNow(); });
                } }) : null,
              KOS.media.progressBar(e)
            ].filter(Boolean));
            var card = el("div", { class: "k-mx-now-card", "data-ui": "coll.now-card", onclick: function () { openEntry(e); } }, [
              art,
              el("button", { type: "button", class: "k-mx-now-title", "data-ui": "coll.now-title", text: e.title, title: e.title,
                onclick: function (ev) { ev.stopPropagation(); openEntry(e); } }),
              el("span", { class: "k-mrow-sub", text: [prog, air ? "EP " + air.episode + " in " + KOS.anime.fmtCountdown(air.timeUntilAiring) : null].filter(Boolean).join(" · ") })
            ]);
            card.style.setProperty("--vh-accent", mod.accent);
            grid.appendChild(card);
          });
          nowWrap.appendChild(grid);
        });
      }
      renderNow();

      var pair = el("div", { class: "k-mx-pair" });
      pane.appendChild(pair);

      /* ---- airing schedule (3f) — live countdowns, grouped by day, for
         the titles being WATCHED. Says so when there is nothing. ---- */
      var airWrap = el("section", { class: "k-card k-mx-air", "aria-label": "Airing soon" });
      pair.appendChild(airWrap);
      function renderAiring() {
        KOS.mediadb.query({ module: "anime", status: "inProgress" }, function (err, rows) {
          if (err || !document.body.contains(airWrap)) return;
          var list = KOS.anime.airingList(rows).slice(0, 12);
          airWrap.innerHTML = "";
          airWrap.appendChild(el("div", { class: "k-card-head" }, [
            el("h2", { class: "k-card-title", text: "Airing soon" }),
            el("button", { type: "button", class: "k-link", text: "Seasonal view →", onclick: function () { KOS.show("seasonal"); } })
          ]));
          if (!list.length) {
            airWrap.appendChild(el("p", { class: "k-muted k-mx-quiet", text: "Nothing you're watching has an episode scheduled." }));
            return;
          }
          /* bucket by local day, keep AniList's soonest-first order inside */
          var now = new Date(), days = [], byKey = {};
          list.forEach(function (x) {
            var d = dayLabel(x.airing.airingAt, now);
            if (!byKey[d.key]) { byKey[d.key] = { meta: d, items: [] }; days.push(byKey[d.key]); }
            byKey[d.key].items.push(x);
          });
          days.forEach(function (day) {
            var group = el("div", { class: "k-mx-day", "data-ui": "coll.airing-day" }, [
              el("div", { class: "k-kicker k-mx-day-h", "data-ui": "coll.day-h" }, [
                el("b", { text: day.meta.label }), el("span", { text: " · " + day.meta.sub })
              ])
            ]);
            if (day.meta.key === "0") KOS.ui.state(group, "today", true);
            day.items.forEach(function (x) {
              var e = x.entry, a = x.airing;
              var seen = e.progress.current || 0;
              var behind = a.episode - 1 - seen;   // episodes aired but unseen
              group.appendChild(el("button", { type: "button", class: "k-mx-ep", "data-ui": "coll.airing-ep",
                title: e.title + " — episode " + a.episode + " airs " + new Date(a.airingAt * 1000).toLocaleString(),
                onclick: function () { openEntry(e); } }, [
                el("span", { class: "k-mx-ep-cover" }, [KOS.medview.cover(e, "映")]),
                el("span", { class: "k-mrow-main" }, [
                  el("span", { class: "k-mrow-title", text: e.title }),
                  el("span", { class: "k-mrow-sub", text: "EP " + a.episode + " · " + clock(a.airingAt) + (behind > 0 ? " · " + behind + " to catch up" : "") })
                ]),
                el("span", { class: "k-mono k-mx-ep-count", text: KOS.anime.fmtCountdown(a.timeUntilAiring) })
              ]));
            });
            airWrap.appendChild(group);
          });
        });
      }
      renderAiring();
      KOS.anime.refreshAiring(false, function (err, byId, fromCache) {
        if (!err && !fromCache && document.body.contains(airWrap)) renderAiring();
      });

      if (aggErr || !agg) return;
      pair.appendChild(standings());
      pane.appendChild(moduleCards());
    }

    /* the six figures of 11a — zero-only figures are suppressed (invariant 77) */
    function figureBand() {
      var m = modules();
      var inProgressAll = m.anime.inProgress + m.books.inProgress + m.vn.inProgress + m.game.inProgress;
      var figs = [
        ["Titles in the vault", agg.total],
        ["In progress", inProgressAll],
        ["Episodes watched", m.anime.episodes],
        ["Chapters read", m.books.episodes],
        ["Hours played", Math.round(m.game.episodes || 0)],
        ["In the Shrine", agg.favourites]
      ].filter(function (f, i) { return i === 0 || f[1]; });
      return el("dl", { class: "k-mx-band", "data-ui": "coll.figures" }, figs.map(function (f) {
        return el("div", { class: "k-mx-fig" }, [el("dt", { text: f[0] }), el("dd", { text: KOS.ui.num(f[1]) })]);
      }));
    }

    /* where each medium stands: one stacked bar per medium, on the four
       statuses the design keys (paused rides with in progress) */
    function standings() {
      var m = modules();
      var KEYS = [["completed", "Completed"], ["inProgress", "In progress"], ["planned", "Planned"], ["dropped", "Dropped"]];
      var card = el("section", { class: "k-card k-mx-stand", "aria-label": "Where each medium stands" }, [
        el("div", { class: "k-card-head" }, [
          el("h2", { class: "k-card-title", text: "Where each medium stands" }),
          el("span", { class: "k-mx-key" }, KEYS.map(function (k) {
            return el("span", { "data-status": k[0] }, [el("i", { "aria-hidden": "true" }), k[1]]);
          }))
        ])
      ]);
      KOS.media.MODULES.forEach(function (mod) {
        var s = m[mod.id];
        if (!s || !s.total) return;
        var vals = { completed: s.completed, inProgress: s.inProgress + s.onHold, planned: s.planned, dropped: s.dropped };
        var bar = el("span", { class: "k-mx-stack", role: "img", "aria-label": mod.label + ": " + KEYS.map(function (k) { return vals[k[0]] + " " + k[1].toLowerCase(); }).join(", ") },
          KEYS.filter(function (k) { return vals[k[0]]; }).map(function (k) {
            var seg = el("span", { "data-status": k[0] });
            seg.style.setProperty("--n", String(vals[k[0]]));
            return seg;
          }));
        var name = el("span", { class: "k-mx-stand-name" }, [el("i", { "aria-hidden": "true" }), mod.label]);
        name.style.setProperty("--vh-accent", mod.accent);
        card.appendChild(el("div", { class: "k-mx-stand-row" }, [name, bar, el("span", { class: "k-mono k-muted", text: KOS.ui.num(s.total) })]));
      });
      return card;
    }

    /* ================= analytics ================= */
    function renderAnalytics() {
      if (aggErr || !agg) {
        pane.appendChild(KOS.ui.emptyState({ body: "Could not read the vault." }));
        return;
      }
      if (!agg.total) {
        pane.appendChild(KOS.ui.emptyState({
          title: "Nothing to analyse yet",
          body: "Charts appear here once the vault has titles in it.",
          action: el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: "⇅ Sync & Import", onclick: function () { KOS.show("mediasync"); } }) }));
        return;
      }
      var m = modules();

      /* ---- the headline figures (audit MTX-3 / MTX-5 / U-17) ---- */
      var inProgressAll = m.anime.inProgress + m.books.inProgress + m.vn.inProgress + m.game.inProgress;
      pane.appendChild(el("div", { class: "k-stats", "data-ui": "ui.stat-strip" }, [
        KOS.ui.statTile({ value: agg.total, label: "Titles in the vault" }),
        KOS.ui.statTile({ value: inProgressAll, label: "In progress", sub: "across every medium", suppressZero: true }),
        KOS.ui.statTile({ value: m.anime.episodes, label: "Episodes watched", suppressZero: true }),
        KOS.ui.statTile({ value: m.books.episodes, label: "Chapters read", suppressZero: true }),
        KOS.ui.statTile({ value: m.books.volumesOwned || 0, label: "Volumes on the shelf", suppressZero: true }),
        KOS.ui.statTile({ value: Math.round(m.game.episodes || 0), label: "Hours played", suppressZero: true }),
        KOS.ui.statTile({ value: agg.favourites, label: "In the Shrine", suppressZero: true })
      ].filter(Boolean)));

      /* ---- ONE comparison, one shared scale, one legend (MTX-2/U-18) ---- */
      var groups = KOS.media.MODULES.filter(function (mod) {
        return mod.real && (m[mod.id] || {}).total;
      }).map(function (mod) {
        return { label: mod.label, sub: m[mod.id].total + " titles", data: statusSeries(m[mod.id]) };
      });
      if (groups.length) {
        pane.appendChild(KOS.charts.chartCard("Where each medium stands",
          groups.length > 1
            ? "the same five statuses on the same scale — so the shapes are comparable"
            : "every title in the collection, by status",
          KOS.charts.smallMultiples(groups)));
      }

      var grid = el("div", { class: "k-mstats-grid", "data-ui": "chart.grid" });

      /* ONE donut: the cut the module cards do not make */
      grid.appendChild(KOS.charts.chartCard("Where the collection lives", "every title, by medium",
        KOS.charts.donutWithLegend(KOS.media.MODULES.map(function (mod) {
          return { label: mod.label, value: (agg.modules[mod.id] || {}).total || 0, color: mod.accent };
        }).filter(function (d) { return d.value; }), { centre: agg.total, centreSub: "titles" })));

      var topGenres = Object.keys(agg.genres).map(function (g) { return { label: g, value: agg.genres[g] }; })
        .sort(function (a, b) { return b.value - a.value; }).slice(0, 10);
      if (topGenres.length) {
        grid.appendChild(KOS.charts.chartCard("Top genres", "one taxonomy across every module",
          KOS.charts.hbarChart(topGenres, { color: "var(--vn)" })));
      }

      /* audit MTX-5: a distribution of one is not a distribution — say what
         is missing rather than drawing something that looks like a finding */
      var rated = agg.scores.reduce(function (a, n) { return a + n; }, 0);
      if (rated >= 5) {
        grid.appendChild(KOS.charts.chartCard("Score distribution", rated + " rated titles, out of 10",
          KOS.charts.barChart(agg.scores.map(function (n, i) {
            return { label: String(i), value: n, color: i >= 8 ? "var(--gold)" : i >= 5 ? "var(--green)" : "var(--red)" };
          }).slice(1))));
      } else {
        grid.appendChild(KOS.charts.chartCard("Score distribution", "not enough ratings yet",
          KOS.ui.emptyState({ compact: true,
            body: rated
              ? "Only " + rated + (rated === 1 ? " title is" : " titles are") + " rated — a distribution needs at least five before it says anything."
              : "Nothing is rated yet. Scores appear here once five titles carry one." })));
      }

      /* the rest streak's own record: media logs over 16 weeks */
      var byDay = {}, total = 0;
      KOS.sessions.all().forEach(function (s) {
        if (s.type === "media" && s.metrics && s.metrics.module) byDay[s.date] = (byDay[s.date] || 0) + 1;
      });
      var days = [];
      for (var h = 16 * 7 - 1; h >= 0; h--) {
        var dd = KOS.srs.addDays(KOS.srs.todayISO(), -h);
        var n = byDay[dd] || 0; total += n;
        days.push({ date: dd, value: n, hint: dd + ": " + n + (n === 1 ? " log" : " logs") });
      }
      if (total) {
        grid.appendChild(KOS.charts.chartCard("Rest, logged", total + " Collection logs over 16 weeks",
          KOS.charts.heatmap(days, { color: "var(--vn)" })));
      }
      pane.appendChild(grid);
      pane.appendChild(el("p", { class: "k-muted",
        text: "Each vault keeps its own deeper numbers — open one and choose “The numbers” from its Actions menu." }));
    }

    /* ================= shared pieces ================= */
    function modules() {
      var base = ["total", "inProgress", "completed", "planned", "onHold", "dropped", "episodes"];
      function m(id, extra) {
        var src = (agg && agg.modules[id]) || {};
        var out = {};
        base.concat(extra || []).forEach(function (k) { out[k] = src[k] || 0; });
        return out;
      }
      return { anime: m("anime"), books: m("books", ["volumesOwned"]),
        vn: m("vn", ["quotes"]), game: m("game") };
    }
    function statusSeries(m) {
      return ["inProgress", "planned", "onHold", "completed", "dropped"].map(function (st) {
        return { label: KOS.media.STATUS_LABEL[st], value: m[st] || 0, color: "var(--st-" + st + ")" };
      });
    }
    /* the four doors into the vaults */
    function moduleCards() {
      var m = modules();
      var cards = el("div", { class: "k-mx-doors", "data-ui": "coll.modules" });
      KOS.media.MODULES.forEach(function (mod) {
        if (!mod.real) {
          cards.appendChild(el("div", { class: "k-card k-mx-door", "data-ui": "coll.soon-card" }, [
            el("span", { class: "k-kicker", text: "Coming soon" }),
            el("h3", { text: mod.kanji + " " + mod.label }),
            el("p", { class: "k-muted", text: mod.desc })
          ]));
          return;
        }
        var s = m[mod.id];
        var line = mod.id === "books"
          ? s.total + " series · " + s.inProgress + " reading · " + s.completed + " completed · " + (s.volumesOwned || 0) + " vols owned"
          : mod.id === "vn"
          ? s.total + " tracked · " + s.inProgress + " playing · " + s.episodes + " routes cleared · " + (s.quotes || 0) + " quotes"
          : mod.id === "game"
          ? s.total + " tracked · " + s.inProgress + " playing · " + Math.round(s.episodes) + " hours logged · " + s.completed + " completed"
          : s.total + " entries · " + s.inProgress + " watching · " + s.completed + " completed";
        var door = el("button", { type: "button", class: "k-card k-mx-door", "data-ui": "coll.module-card",
          onclick: function () { KOS.show(mod.id); } }, [
          el("span", { class: "k-mx-door-mark", lang: "ja", "aria-hidden": "true", text: mod.kanji }),
          el("span", { class: "k-kicker", text: mod.id === "books" ? "Dual-tracked · live"
            : mod.id === "vn" ? "VNDB-synced · live"
            : mod.id === "game" ? "Manual-first · live" : "AniList-synced · live" }),
          el("span", { class: "k-mx-door-t", text: mod.label }),
          el("span", { class: "k-mrow-sub", text: line })
        ]);
        door.style.setProperty("--vh-accent", mod.accent);
        cards.appendChild(door);
      });
      return cards;
    }
  };
})();
