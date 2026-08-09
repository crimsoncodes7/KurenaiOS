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
       screen again.                                                      */
(function () {
  "use strict";
  var el = KOS.ui.el;

  KOS.views.matrix = function (main) {
    document.getElementById("tree").classList.add("hidden");
    document.getElementById("cols").classList.add("no-tree");

    main.appendChild(KOS.ui.pageHeader({
      kicker: "蒐 · Personal archive",
      title: "The Collection",
      sub: "The other half of the ledger — what you watch, read and play. Rest, kept honestly."
    }));

    if (KOS.medview.unavailable(main)) return;

    /* ---- streak pair: study vs rest, deliberately side by side and
       visually distinct so they never read as one number ---- */
    var rest = KOS.sessions.restStreak();
    var study = KOS.sessions.streak(null);
    main.appendChild(el("div", { class: "med-streaks" }, [
      el("div", { class: "streak-chip med-rest" + (rest ? " lit" : ""),
        title: "Consecutive days with at least one Collection Matrix log — independent of the study streak" }, [
        el("span", { class: "fl", text: "休" }),
        el("span", { text: rest + (rest === 1 ? " day rest streak" : " day rest streak") })
      ]),
      el("div", { class: "streak-chip" + (study ? " lit" : ""), title: "The study streak, for contrast — media logs never feed it" }, [
        el("span", { class: "fl", text: "炎" }),
        el("span", { text: study + (study === 1 ? " day study streak" : " day study streak") })
      ])
    ]));

    /* ---- the two panes ---- */
    var tab = "overview";
    var tabBar = el("div", { class: "mx-tabbar" });
    main.appendChild(tabBar);
    var pane = el("div", { class: "mx-pane" });
    main.appendChild(pane);

    function buildTabs() {
      return KOS.ui.tabs([
        { label: "Overview", active: tab === "overview", onSelect: function () { setTab("overview"); } },
        { label: "Analytics", active: tab === "analytics", onSelect: function () { setTab("analytics"); } }
      ], { variant: "workspace", label: "Collection views", className: "mx-tabs" });
    }
    function setTab(next) {
      if (tab === next) return;
      tab = next;
      tabBar.innerHTML = "";
      tabBar.appendChild(buildTabs());
      main.scrollTop = 0;
      render();
    }
    tabBar.appendChild(buildTabs());

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

    /* ================= overview ================= */
    function renderOverview() {
      /* ---- airing soon (3f) — live countdowns, beside (never replacing)
         the consuming strip. Renders nothing while empty/offline. ---- */
      var airWrap = el("div", { class: "mx-airing" });
      pane.appendChild(airWrap);
      function renderAiring() {
        KOS.mediadb.query({ module: "anime" }, function (err, rows) {
          if (err || !document.body.contains(airWrap)) return;
          var list = KOS.anime.airingList(rows).slice(0, 8);
          airWrap.innerHTML = "";
          if (!list.length) return;
          airWrap.appendChild(el("h3", { class: "n-h" }, [
            "Airing soon",
            el("button", { class: "mini-btn mx-air-season", text: KOS.anime.SEASON_META[KOS.anime.currentSeason().season].kanji + " Seasonal view",
              onclick: function () { KOS.show("seasonal"); } })
          ]));
          var box = el("div", { class: "mx-air-list" });
          list.forEach(function (x) {
            var open = function () { KOS.mediaEditor(x.entry, function () { KOS.show("matrix", undefined, { _nav: true }); }); };
            box.appendChild(el("div", { class: "mx-air-card", role: "button", tabindex: "0",
              title: "Episode " + x.airing.episode + " airs " + new Date(x.airing.airingAt * 1000).toLocaleString(),
              onclick: open,
              onkeydown: function (ev) { if (ev.key === "Enter") { ev.preventDefault(); open(); } }
            }, [
              x.entry.coverUrl
                ? el("span", { class: "mx-air-cover" }, [KOS.imageCrop.image(x.entry.coverUrl,
                    { alt: "", loading: "lazy" }, x.entry.coverCrop)])
                : el("span", { class: "mx-air-cover med-cover-ph", "aria-hidden": "true", text: "映" }),
              el("span", { class: "mx-air-body" }, [
                el("span", { class: "mx-air-title", text: x.entry.title }),
                el("span", { class: "mx-air-when" }, [
                  el("b", { class: "mx-air-count", text: KOS.anime.fmtCountdown(x.airing.timeUntilAiring) }),
                  el("span", { class: "sub", text: " · EP " + x.airing.episode })
                ])
              ])
            ]));
          });
          airWrap.appendChild(box);
        });
      }
      renderAiring();
      KOS.anime.refreshAiring(false, function (err, byId, fromCache) {
        if (!err && !fromCache && document.body.contains(airWrap)) renderAiring();
      });

      /* ---- currently consuming — all modules, most recent first ---- */
      var stripWrap = el("div", {});
      pane.appendChild(stripWrap);
      KOS.mediadb.query({ status: "inProgress", sort: "updated" }, function (err, current) {
        if (err || !document.body.contains(stripWrap)) return;
        stripWrap.appendChild(el("h3", { class: "n-h", text: "Currently consuming" }));
        if (!current.length) {
          stripWrap.appendChild(KOS.ui.emptyState({ compact: true,
            body: "Nothing in progress yet — sync your AniList or add something to the vault.",
            action: el("button", { class: "btn", text: "⇅ Sync & Import", onclick: function () { KOS.show("mediasync"); } }) }));
          return;
        }
        var strip = el("div", { class: "med-strip" });
        current.slice(0, 24).forEach(function (e) {
          var mod = KOS.media.module(e.module);
          var prog = KOS.media.progressText(e);
          var pct = KOS.media.progressPct(e);
          var open = function () { KOS.mediaEditor(e, function () { KOS.show("matrix", undefined, { _nav: true }); }); };
          var card = el("div", { class: "med-strip-card", role: "button", tabindex: "0",
            title: e.title + (prog ? " — " + prog : ""),
            onclick: open,
            onkeydown: function (ev) { if (ev.key === "Enter") { ev.preventDefault(); open(); } }
          }, [
            /* the shared cover, so the kanji placeholder is painted from
               the first frame here too (audit G-24/U-15) */
            el("span", { class: "med-strip-cover" }, [KOS.medview.cover(e, mod.kanji)]),
            el("span", { class: "med-strip-mod", text: mod.kanji, title: mod.label }),
            el("span", { class: "med-strip-t", text: e.title }),
            prog ? el("span", { class: "med-strip-p", text: prog }) : null
          ].filter(Boolean));
          if (pct !== null) card.appendChild(el("span", { class: "med-strip-track" }, [
            el("span", { style: "width:" + pct + "%" })
          ]));
          strip.appendChild(card);
        });
        /* audit MTX-1/U-29: a real overflow-x scroller with no arrows and
           no edge fade, so the last card was sliced by the container edge
           and read as a rendering bug. The shared primitive gives it fades,
           arrows and ← → keys — and marks it data-scroller, which is what
           tells the responsive probe this sideways scroll is declared. */
        stripWrap.appendChild(KOS.ui.scroller(strip, { label: "Currently consuming",
          prevLabel: "Scroll to earlier titles", nextLabel: "Scroll to later titles" }));
        if (current.length > 24) stripWrap.appendChild(el("p", { class: "sub", text: "Showing the 24 most recently touched of " + current.length + " in progress — the full set lives in each module." }));
      });

      if (aggErr || !agg) return;
      var m = modules();

      /* ---- the headline row (audit MTX-3 / MTX-5 / U-17) ----
         Seven tiles, one of which read "0 playing now" — and the four
         module totals were repeated in the KPI row, the whole-vault donut,
         the medium donut AND the module cards: the same four numbers four
         times on one page. These tiles now carry only what no module card
         can say — the cross-media figures — and each is suppressed when it
         is zero. */
      var inProgressAll = m.anime.inProgress + m.books.inProgress + m.vn.inProgress + m.game.inProgress;
      pane.appendChild(el("div", { class: "stat-strip" }, [
        KOS.ui.statTile({ value: agg.total, label: "Entries in the vault" }),
        KOS.ui.statTile({ value: inProgressAll, label: "On the go", sub: "across every medium", suppressZero: true }),
        KOS.ui.statTile({ value: m.anime.episodes, label: "Episodes logged", suppressZero: true }),
        KOS.ui.statTile({ value: m.books.episodes, label: "Chapters read", suppressZero: true }),
        KOS.ui.statTile({ value: m.books.volumesOwned || 0, label: "Volumes owned", suppressZero: true }),
        KOS.ui.statTile({ value: Math.round(m.game.episodes || 0), label: "Hours played", suppressZero: true }),
        KOS.ui.statTile({ value: agg.favourites, label: "In the Shrine", suppressZero: true })
      ].filter(Boolean)));

      /* ---- ONE comparison, one shared scale, one legend (MTX-2/U-18) ---- */
      var groups = KOS.media.MODULES.filter(function (mod) {
        return mod.real && (m[mod.id] || {}).total;
      }).map(function (mod) {
        return { label: mod.label, sub: m[mod.id].total + " titles", data: statusSeries(m[mod.id]) };
      });
      /* one panel is still the by-status readout a single-medium collection
         needs; it is only the SCALE claim that needs two */
      if (groups.length) {
        pane.appendChild(KOS.charts.chartCard("Where each medium stands",
          groups.length > 1
            ? "the same five statuses on the same scale — so the shapes are comparable"
            : "every title in the collection, by status",
          KOS.charts.smallMultiples(groups)));
      }

      pane.appendChild(moduleCards());
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
          action: el("button", { class: "btn primary", text: "⇅ Sync & Import", onclick: function () { KOS.show("mediasync"); } }) }));
        return;
      }
      var grid = el("div", { class: "cs-grid" });

      /* ONE donut. "The whole vault by status" and "vault by medium" were
         the same 1,880 titles cut two ways, beside a KPI row that had
         already said 1,880. This is the cut the module cards do not make. */
      grid.appendChild(KOS.charts.chartCard("Where the collection lives", "every title, by medium",
        KOS.charts.donutWithLegend(KOS.media.MODULES.map(function (mod) {
          return { label: mod.label, value: (agg.modules[mod.id] || {}).total || 0, color: mod.accent };
        }).filter(function (d) { return d.value; }), { centre: agg.total, centreSub: "titles" })));

      var topGenres = Object.keys(agg.genres).map(function (g) { return { label: g, value: agg.genres[g] }; })
        .sort(function (a, b) { return b.value - a.value; }).slice(0, 10);
      if (topGenres.length) {
        grid.appendChild(KOS.charts.chartCard("Top genres", "one taxonomy across every module",
          KOS.charts.hbarChart(topGenres, { color: "#8A63A8" })));
      }

      /* audit MTX-5: this drew a "distribution" from a single rated title.
         A distribution of one is not a distribution — say what is missing
         rather than drawing something that looks like a finding. */
      var rated = agg.scores.reduce(function (a, n) { return a + n; }, 0);
      if (rated >= 5) {
        grid.appendChild(KOS.charts.chartCard("Score distribution", rated + " rated titles, out of 10",
          KOS.charts.barChart(agg.scores.map(function (n, i) {
            return { label: String(i), value: n, color: i >= 8 ? "#B08A3E" : i >= 5 ? "#7D9B76" : "#B5573F" };
          }).slice(1))));
      } else {
        grid.appendChild(KOS.charts.chartCard("Score distribution", "not enough ratings yet",
          KOS.ui.emptyState({ compact: true,
            body: rated
              ? "Only " + rated + (rated === 1 ? " title is" : " titles are") + " rated — a distribution needs at least five before it says anything."
              : "Nothing is rated yet. Scores appear here once five titles carry one." })));
      }

      /* the rest streak's own record: media logs over 16 weeks — the one
         chart on this page about behaviour rather than inventory */
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
          KOS.charts.heatmap(days, { color: "#8A63A8" })));
      }
      pane.appendChild(grid);
      pane.appendChild(el("p", { class: "sub mx-analytics-note",
        text: "Each vault keeps its own deeper numbers — open one and choose “The numbers” from its ⋯ menu." }));
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
        return { label: KOS.media.STATUS_LABEL[st], value: m[st] || 0, color: KOS.media.STATUS_COLOR[st] };
      });
    }
    function moduleCards() {
      var m = modules();
      var cards = el("div", { class: "home-cards med-mods" });
      KOS.media.MODULES.forEach(function (mod) {
        if (!mod.real) {
          cards.appendChild(el("div", { class: "subj-card soon-card" }, [
            el("span", { class: "soon-tag", text: "Coming soon" }),
            el("h3", {}, [el("span", { class: "kanji-inline", text: mod.kanji }), " " + mod.label]),
            el("div", { class: "m", text: mod.desc })
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
        cards.appendChild(el("div", { class: "subj-card med-mod-card", style: "--accent:" + mod.accent,
          role: "button", tabindex: "0",
          onclick: function () { KOS.show(mod.id); },
          onkeydown: function (ev) { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); KOS.show(mod.id); } }
        }, [
          el("span", { class: "med-mod-wm", "aria-hidden": "true", text: mod.kanji }),
          el("div", { class: "subj-card-top" }, [
            el("div", {}, [
              el("h3", {}, [el("span", { class: "kanji-inline", text: mod.kanji }), " " + mod.label]),
              el("span", { class: "b", text: mod.id === "books" ? "Dual-tracked · live"
                : mod.id === "vn" ? "VNDB-synced · live"
                : mod.id === "game" ? "Manual-first · live" : "AniList-synced · live" })
            ])
          ]),
          el("div", { class: "m", text: line })
        ]));
      });
      return cards;
    }
  };
})();
