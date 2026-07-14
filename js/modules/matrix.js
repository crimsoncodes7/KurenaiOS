/* Kurenai OS — modules/matrix.js
   The Kurenai Collection Matrix home (Build 3a/3b/3e): the cross-media
   view over Anime, Books (manga & light novels), Visual Novels and Games —
   all four real as of Build 3e.
   Everything on this page is module-agnostic: the "currently consuming"
   strip and the stats read whatever the vault holds, whichever module it
   belongs to. Charts reuse KOS.charts (the Build 2c inline-SVG helpers),
   not a new charting approach.                                             */
(function () {
  "use strict";
  var el = KOS.ui.el;

  KOS.views.matrix = function (main) {
    document.getElementById("tree").classList.add("hidden");
    document.getElementById("cols").classList.add("no-tree");

    main.appendChild(el("div", { class: "dash-head" }, [
      el("div", { class: "dh-txt" }, [
        el("span", { class: "dh-kicker", text: "蒐 · Personal archive" }),
        el("h1", { text: "The Collection" }),
        el("div", { class: "dh-sub" }, [
          el("span", { class: "board", text: "The other half of the ledger — what you watch, read and play. Rest, kept honestly." })
        ])
      ]),
      el("div", { class: "dh-actions" }, [
        el("button", { class: "btn", text: "⇅ Sync & Import", onclick: function () { KOS.show("mediasync"); } }),
        el("button", { class: "btn", text: "標 Goals", onclick: function () { KOS.show("goals"); } }),
        el("button", { class: "btn gold", text: "祠 The Shrine", onclick: function () { KOS.show("shrine"); } })
      ])
    ]));

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

    /* ---- airing soon (3f) — live countdowns, beside (never replacing)
       the consuming strip. Fetched on load via the shared anime cache;
       renders nothing while empty/offline — strictly additive. ---- */
    var airWrap = el("div", { class: "mx-airing" });
    main.appendChild(airWrap);
    function renderAiring() {
      KOS.mediadb.query({ module: "anime" }, function (err, rows) {
        if (err) return;
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
    main.appendChild(stripWrap);

    /* ---- stats + module cards fill async off one aggregate pass ---- */
    var statsWrap = el("div", {});
    main.appendChild(statsWrap);

    KOS.mediadb.query({ status: "inProgress", sort: "updated" }, function (err, current) {
      if (err) return;
      stripWrap.appendChild(el("h3", { class: "n-h", text: "Currently consuming" }));
      if (!current.length) {
        stripWrap.appendChild(el("p", { class: "sub", text: "Nothing in progress yet — sync your AniList or add something to the vault." }));
        return;
      }
      var strip = el("div", { class: "med-strip" });
      current.slice(0, 24).forEach(function (e) {
        var mod = KOS.media.module(e.module);
        var t = e.progress.total;
        var card = el("div", { class: "med-strip-card", role: "button", tabindex: "0",
          title: e.title + " — " + (e.progress.current || 0) + (t ? "/" + t : "") + " " + mod.unit,
          onclick: function () { KOS.mediaEditor(e, function () { KOS.show("matrix", undefined, { _nav: true }); }); },
          onkeydown: function (ev) { if (ev.key === "Enter") { ev.preventDefault(); KOS.mediaEditor(e, function () { KOS.show("matrix", undefined, { _nav: true }); }); } }
        }, [
          el("span", { class: "med-strip-cover" }, [
            e.coverUrl
              ? KOS.imageCrop.image(e.coverUrl, { alt: "", loading: "lazy", decoding: "async" }, e.coverCrop)
              : el("span", { class: "med-cover-ph", "aria-hidden": "true", text: mod.kanji })
          ]),
          el("span", { class: "med-strip-mod", text: mod.kanji, title: mod.label }),
          el("span", { class: "med-strip-t", text: e.title }),
          el("span", { class: "med-strip-p", text: (e.progress.current || 0) + (t ? "/" + t : "") + " " + mod.unit })
        ]);
        if (t) card.appendChild(el("span", { class: "med-strip-track" }, [
          el("span", { style: "width:" + Math.min(100, Math.round(100 * (e.progress.current || 0) / t)) + "%" })
        ]));
        strip.appendChild(card);
      });
      stripWrap.appendChild(strip);
      if (current.length > 24) stripWrap.appendChild(el("p", { class: "sub", text: "Showing the 24 most recently touched of " + current.length + " in progress — the full set lives in each module." }));
    });

    KOS.mediadb.stats(function (err, agg) {
      if (err || !agg) return;
      var anime = agg.modules.anime || { total: 0, inProgress: 0, completed: 0, planned: 0, onHold: 0, dropped: 0, episodes: 0 };
      var books = agg.modules.books || { total: 0, inProgress: 0, completed: 0, planned: 0, onHold: 0, dropped: 0, episodes: 0, volumesOwned: 0 };
      var vn = agg.modules.vn || { total: 0, inProgress: 0, completed: 0, planned: 0, onHold: 0, dropped: 0, episodes: 0, quotes: 0 };
      var game = agg.modules.game || { total: 0, inProgress: 0, completed: 0, planned: 0, onHold: 0, dropped: 0, episodes: 0, tiers: {} };

      /* stat strip */
      function stat(v, k, onclick) {
        return el("div", { class: "stat-card" + (onclick ? " click" : ""), onclick: onclick || null }, [
          el("div", { class: "v", text: String(v) }), el("div", { class: "k", text: k })]);
      }
      statsWrap.appendChild(el("div", { class: "stat-strip" }, [
        stat(agg.total, "Entries in the vault"),
        stat(anime.inProgress || 0, "Watching now", function () { KOS.show("anime"); }),
        stat(books.inProgress || 0, "Reading now", function () { KOS.show("books"); }),
        stat(game.inProgress || 0, "Playing now", function () { KOS.show("game"); }),
        stat(anime.episodes, "Episodes logged"),
        stat(books.volumesOwned || 0, "Volumes on the shelf", function () { KOS.show("books"); }),
        stat(agg.favourites, "In the Shrine", function () { KOS.show("shrine"); })
      ]));

      /* charts — the Build 2c SVG helpers, nothing new */
      if (agg.total) {
        var grid = el("div", { class: "cs-grid" });
        grid.appendChild(KOS.charts.chartCard("The whole vault", "every module, by status",
          KOS.charts.donutWithLegend(["inProgress", "planned", "onHold", "completed", "dropped"].map(function (s) {
            return { label: KOS.media.STATUS_LABEL[s],
              value: (anime[s] || 0) + (books[s] || 0) + (vn[s] || 0) + (game[s] || 0),
              color: KOS.media.STATUS_COLOR[s] };
          }), { centre: agg.total, centreSub: "titles" })));
        grid.appendChild(KOS.charts.chartCard("Anime by status", "the founding module",
          KOS.charts.barChart(["inProgress", "planned", "onHold", "completed", "dropped"].map(function (s) {
            return { label: KOS.media.STATUS_LABEL[s], value: anime[s] || 0, color: KOS.media.STATUS_COLOR[s] };
          }))));
        if (books.total) {
          grid.appendChild(KOS.charts.chartCard("Books by status", "manga & light novels",
            KOS.charts.barChart(["inProgress", "planned", "onHold", "completed", "dropped"].map(function (s) {
              return { label: KOS.media.STATUS_LABEL[s], value: books[s] || 0, color: KOS.media.STATUS_COLOR[s] };
            }))));
        }
        if (vn.total) {
          grid.appendChild(KOS.charts.chartCard("Visual novels by status", (vn.episodes || 0) + " routes cleared · " + (vn.quotes || 0) + " quotes kept",
            KOS.charts.barChart(["inProgress", "planned", "onHold", "completed", "dropped"].map(function (s) {
              return { label: KOS.media.STATUS_LABEL[s], value: vn[s] || 0, color: KOS.media.STATUS_COLOR[s] };
            }))));
        }
        if (game.total) {
          grid.appendChild(KOS.charts.chartCard("Games by status", Math.round(game.episodes || 0) + " hours logged · " +
            (((game.tiers || {}).platinum || 0) + ((game.tiers || {}).fullCompletion || 0)) + " at 100%/platinum",
            KOS.charts.barChart(["inProgress", "planned", "onHold", "completed", "dropped"].map(function (s) {
              return { label: KOS.media.STATUS_LABEL[s], value: game[s] || 0, color: KOS.media.STATUS_COLOR[s] };
            }))));
        }
        var topGenres = Object.keys(agg.genres).map(function (g) { return { label: g, value: agg.genres[g] }; })
          .sort(function (a, b) { return b.value - a.value; }).slice(0, 10);
        if (topGenres.length) {
          grid.appendChild(KOS.charts.chartCard("Top genres", "one taxonomy across every module",
            KOS.charts.hbarChart(topGenres, { color: "#8A63A8" })));
        }
        var scored = agg.scores.reduce(function (a, n) { return a + n; }, 0);
        if (scored) {
          grid.appendChild(KOS.charts.chartCard("Score distribution", "everything you've rated, /10",
            KOS.charts.barChart(agg.scores.map(function (n, i) {
              return { label: String(i), value: n, color: i >= 8 ? "#B08A3E" : i >= 5 ? "#7D9B76" : "#B5573F" };
            }).slice(1))));
        }
        /* two more, so the grid fills rather than leaving blank cells */
        grid.appendChild(KOS.charts.chartCard("Vault by medium", "where your collection lives",
          KOS.charts.donutWithLegend(KOS.media.MODULES.map(function (mod) {
            return { label: mod.label, value: (agg.modules[mod.id] || {}).total || 0, color: mod.accent };
          }).filter(function (d) { return d.value; }), { centre: agg.total, centreSub: "titles" })));
        var inProg = KOS.media.MODULES.map(function (mod) {
          return { label: mod.label, value: (agg.modules[mod.id] || {}).inProgress || 0, color: mod.accent };
        }).filter(function (d) { return d.value; });
        if (inProg.length) grid.appendChild(KOS.charts.chartCard("In progress now", "what's on the go across every medium",
          KOS.charts.hbarChart(inProg, { labelW: 110 })));
        statsWrap.appendChild(grid);
      }

      /* module cards — all four real as of Build 3e */
      var cards = el("div", { class: "home-cards med-mods" });
      KOS.media.MODULES.forEach(function (mod) {
        var m = agg.modules[mod.id] || { total: 0, inProgress: 0, completed: 0, volumesOwned: 0 };
        if (mod.real) {
          var line = mod.id === "books"
            ? m.total + " series · " + (m.inProgress || 0) + " reading · " + (m.completed || 0) + " completed · " + (m.volumesOwned || 0) + " vols owned"
            : mod.id === "vn"
            ? m.total + " tracked · " + (m.inProgress || 0) + " playing · " + (m.episodes || 0) + " routes cleared · " + (m.quotes || 0) + " quotes"
            : mod.id === "game"
            ? m.total + " tracked · " + (m.inProgress || 0) + " playing · " + Math.round(m.episodes || 0) + " hours logged · " + (m.completed || 0) + " completed"
            : m.total + " entries · " + (m.inProgress || 0) + " watching · " + (m.completed || 0) + " completed";
          cards.appendChild(el("div", { class: "subj-card med-mod-card", style: "--accent:" + mod.accent,
            role: "button", tabindex: "0",
            onclick: function () { KOS.show(mod.id); },
            onkeydown: function (ev) { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); KOS.show(mod.id); } }
          }, [
            el("span", { class: "med-mod-wm", "aria-hidden": "true", text: mod.kanji }),
            el("div", { class: "subj-card-top" }, [
              el("div", {}, [
                el("h3", {}, [el("span", { class: "kanji-inline", text: mod.kanji }), " " + mod.label]),
                el("span", { class: "b", text: mod.id === "books" ? "Dual-tracked · live" : mod.id === "vn" ? "VNDB-synced · live" : mod.id === "game" ? "Manual-first · live" : "AniList-synced · live" })
              ])
            ]),
            el("div", { class: "m", text: line })
          ]));
        } else {
          cards.appendChild(el("div", { class: "subj-card soon-card" }, [
            el("span", { class: "soon-tag", text: "Coming soon" }),
            el("h3", {}, [el("span", { class: "kanji-inline", text: mod.kanji }), " " + mod.label]),
            el("div", { class: "m", text: mod.desc })
          ]));
        }
      });
      statsWrap.appendChild(cards);
    });


  };
})();
