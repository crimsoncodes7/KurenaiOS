/* Kurenai OS — modules/vndbprofile.js
   The VNDB profile view (Build 3j) — the analogue of the AniList profile,
   built from what VNDB's Kana API GENUINELY exposes, no more:

   - identity (the /authinfo record stored at connect time);
   - label breakdown with live counts, INCLUDING user-defined custom
     labels (GET /ulist_labels — verified live 2026-07-04);
   - length-vote stats (GET /user with lengthvotes/lengthvotes_sum —
     verified live same day);
   - site-wide database totals (GET /stats);
   - list statistics derived from the LOCAL vault (score spread, routes
     cleared, quotes kept, estimated hours from VNDB's own length data) —
     the vault is the synced ulist, so this is the same data without
     another network round-trip.

   What VNDB's API does NOT have — favourites, followers/following, an
   activity feed, notifications — is stated in the view rather than faked:
   parity with AniList's profile isn't possible and pretending otherwise
   would just be broken panels. Two requests total, cached in memory for
   a few minutes; the ⟳ button forces. Read-only throughout.             */
(function () {
  "use strict";
  var el = KOS.ui.el;

  var TTL = 5 * 60 * 1000;
  var cache = { at: 0, data: null };

  /* label colours: the five defaults map to the shared status palette;
     customs get the VN module accent */
  function labelColor(id) {
    var status = KOS.vndb.LABEL_STATUS[id];
    return status ? KOS.media.STATUS_COLOR[status] : "#c77bf2";
  }

  function section(title, sub, children) {
    return el("div", { class: "colcard med-panel ap-sec" }, [
      el("div", { class: "vn-sec-h" }, [el("b", { text: title }), sub ? el("span", { class: "sub", text: sub }) : null])
    ].concat(children));
  }
  function stat(v, k) {
    return el("div", { class: "stat-card" }, [
      el("div", { class: "v", text: String(v) }), el("div", { class: "k", text: k })]);
  }

  /* the two profile-level requests + the local vault pass, gathered into
     one render payload. cb(err, data). */
  function gather(conn, cb) {
    var out = { user: conn.user, userStats: null, labels: [], site: null, vault: null };
    KOS.vndb.fetchUlistLabels(conn.token, conn.user.id, function (e1, labels) {
      if (e1) { cb(e1); return; }
      out.labels = labels;
      KOS.vndb.fetchUserStats(conn.token, conn.user.id, function (e2, us) {
        if (!e2) out.userStats = us;   // non-fatal — the labels are the substance
        KOS.vndb.fetchSiteStats(function (e3, site) {
          if (!e3) out.site = site;
          KOS.mediadb.query({ module: "vn" }, function (e4, rows) {
            if (e4) { cb(e4); return; }
            var v = { total: rows.length, rated: 0, scoreSum: 0, routesCleared: 0, routesTotal: 0,
                      chaptersDone: 0, quotes: 0, warnings: 0, estMinutes: 0, completed: 0 };
            rows.forEach(function (e) {
              if (e.score) { v.rated++; v.scoreSum += e.score; }
              (e.routes || []).forEach(function (r) { v.routesTotal++; if (r.cleared) v.routesCleared++; });
              (e.chapters || []).forEach(function (c) { if (c.status === "completed") v.chaptersDone++; });
              v.quotes += (e.quotes || []).length;
              v.warnings += (e.contentWarnings || []).length;
              if (e.status === "completed") {
                v.completed++;
                if (e.extra && e.extra.lengthMinutes) v.estMinutes += e.extra.lengthMinutes;
              }
            });
            out.vault = v;
            cb(null, out);
          });
        });
      });
    });
  }

  KOS.views.vndbprofile = function (main) {
    document.getElementById("tree").classList.add("hidden");
    document.getElementById("cols").classList.add("no-tree");

    main.appendChild(el("div", { class: "lab-h" }, [
      el("h1", {}, [el("span", { class: "kanji-inline", text: "貌" }), " VNDB Profile"]),
      el("p", { class: "sub", text: "The account behind the VN sync — your labels with live counts (custom ones included), length-vote contributions, list statistics and the size of the database you're drawing from. Built from what VNDB's API actually offers: it has no favourites, follower graph, activity feed or notifications, so none are faked here." })
    ]));

    if (KOS.medview.unavailable(main)) return;

    var body = el("div", { class: "ap-body" });
    main.appendChild(body);

    function render(data, fetchedAt) {
      body.innerHTML = "";
      var u = data.user, us = data.userStats, vault = data.vault;

      /* --- header --- */
      var head = el("div", { class: "ap-head vp-head" });
      head.appendChild(el("div", { class: "ap-head-scrim" }, [
        el("span", { class: "ap-avatar vp-avatar", "aria-hidden": "true", text: "選" }),
        el("div", { class: "ap-id" }, [
          el("b", { class: "ap-name", text: u.username }),
          el("span", { class: "sub", text: "VNDB " + u.id + " · token permissions: " + (u.permissions || []).join(", ") }),
          el("a", { class: "mini-btn", href: "https://vndb.org/" + u.id, target: "_blank", rel: "noopener", text: "vndb.org ↗" })
        ])
      ]));
      body.appendChild(head);

      var refreshBtn = el("button", { class: "btn", text: "⟳ Refresh", onclick: function () { load(true); } });
      body.appendChild(el("div", { class: "lab-controls" }, [
        refreshBtn,
        el("span", { class: "sub", text: "fetched " + new Date(fetchedAt).toLocaleTimeString() }),
        el("span", { style: "flex:1" }),
        el("button", { class: "btn", text: "選 VN vault", onclick: function () { KOS.show("vn"); } }),
        el("button", { class: "btn", text: "⇅ Sync & Import", onclick: function () { KOS.show("mediasync"); } })
      ]));

      /* --- labels, live from the site --- */
      var total = data.labels.reduce(function (a, l) { return a + (l.count || 0); }, 0);
      body.appendChild(section("List labels — live from VNDB", total + " label assignments · customs included",
        data.labels.length ? [
          el("div", { class: "vp-labels" }, data.labels.map(function (l) {
            return el("div", { class: "vp-label" }, [
              el("span", { class: "med-chip", style: "--chip:" + labelColor(l.id), text: l.label }),
              el("b", { text: String(l.count || 0) }),
              l.private ? el("span", { class: "sub", text: "private" }) : null,
              l.id >= 10 ? el("span", { class: "sub", text: "custom" }) : null
            ]);
          }))
        ] : [el("p", { class: "sub", text: "No labels on the account yet." })]));

      /* --- vault-derived list stats (the synced ulist, locally) --- */
      if (vault) {
        var mean = vault.rated ? (vault.scoreSum / vault.rated).toFixed(1) : "—";
        var hours = Math.round(vault.estMinutes / 60);
        body.appendChild(section("List statistics", "from the synced vault — same data, no extra requests", [
          el("div", { class: "stat-strip" }, [
            stat(vault.total, "VNs tracked"),
            stat(vault.completed, "Finished"),
            stat(mean, "Mean vote /10"),
            stat(vault.routesCleared + "/" + vault.routesTotal, "Routes cleared"),
            stat(vault.chaptersDone, "Chapters done"),
            stat(vault.quotes, "Quotes kept"),
            stat(hours ? "~" + hours : "—", "Est. hours (finished)")
          ])
        ]));
      }

      /* --- length-vote contributions --- */
      if (us) {
        body.appendChild(section("Play-length contributions", "your crowd-sourced timing data on vndb.org", [
          el("div", { class: "stat-strip" }, [
            stat(us.lengthvotes || 0, "Length votes"),
            stat(us.lengthvotes_sum ? Math.round(us.lengthvotes_sum / 60) + " h" : "0 h", "Hours reported")
          ])
        ]));
      }

      /* --- the database itself --- */
      if (data.site) {
        body.appendChild(section("The database you draw from", "vndb.org, right now", [
          el("div", { class: "stat-strip" }, [
            stat(data.site.vn || 0, "Visual novels"),
            stat(data.site.releases || 0, "Releases"),
            stat(data.site.producers || 0, "Producers"),
            stat(data.site.staff || 0, "Staff"),
            stat(data.site.tags || 0, "Tags"),
            stat(data.site.chars || 0, "Characters")
          ])
        ]));
      }

      /* --- the honest boundary --- */
      body.appendChild(section("What VNDB's API doesn't offer", null, [
        el("p", { class: "sub", text: "No favourites, no followers/following, no activity feed, no notifications — the Kana API simply has no endpoints for them (checked against the live API, 2026-07-04). The AniList profile has those panels because AniList's API carries the data; here they would be decoration. Everything above is the real surface." })
      ]));
    }

    function load(force) {
      KOS.vndb.getConnection(function (err, conn) {
        if (err || !conn.token || !conn.user) {
          body.innerHTML = "";
          body.appendChild(el("div", { class: "med-empty" }, [
            el("p", { class: "fc-empty", text: "Connect your VNDB first — the profile view reads the account behind the sync." }),
            el("div", { class: "lab-controls", style: "justify-content:center" }, [
              el("button", { class: "btn primary", text: "⇅ Sync & Import", onclick: function () { KOS.show("mediasync"); } })
            ])
          ]));
          return;
        }
        if (!force && cache.data && Date.now() - cache.at < TTL) {
          render(cache.data, cache.at);
          return;
        }
        body.innerHTML = "";
        body.appendChild(el("p", { class: "sub ap-loading", text: "Loading your profile from VNDB (two small requests)…" }));
        gather(conn, function (err2, data) {
          if (err2) {
            body.innerHTML = "";
            body.appendChild(el("p", { class: "fc-empty", text: err2.message }));
            if (err2.kind === "auth") {
              body.appendChild(el("div", { class: "lab-controls", style: "justify-content:center" }, [
                el("button", { class: "btn primary", text: "⇅ Reconnect on Sync & Import", onclick: function () { KOS.show("mediasync"); } })
              ]));
            }
            return;
          }
          cache = { at: Date.now(), data: data };
          render(data, cache.at);
        });
      });
    }
    load(false);
  };
})();
