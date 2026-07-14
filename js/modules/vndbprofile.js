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
   a few minutes; the ⟳ button forces. Optional local avatar/banner sources
   and crops live in an account-keyed media KV record, never the API data. */
(function () {
  "use strict";
  var el = KOS.ui.el;

  var TTL = 5 * 60 * 1000;
  var cache = { key: null, at: 0, data: null };

  /* label colours: the five defaults map to the shared status palette;
     customs get the VN module accent */
  function labelColor(id) {
    var status = KOS.vndb.LABEL_STATUS[id];
    return status ? KOS.media.STATUS_COLOR[status] : "#8A63A8";
  }

  function section(title, sub, children) {
    return el("section", { class: "ap-sec" }, [
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

    main.appendChild(KOS.collectionCrumbs("Sync", "VNDB"));
    var workspaceTabs = KOS.collectionWorkspaceTabs("sync", "vndbprofile");
    workspaceTabs.classList.add("profile-workspace-tabs");

    main.appendChild(el("div", { class: "dash-head" }, [
      el("div", { class: "dh-txt" }, [
        el("span", { class: "dh-kicker", text: "Collection · 貌" }),
        el("h1", { text: "VNDB Profile" }),
        el("div", { class: "dh-sub" }, [
          el("span", { class: "board", text: "The account behind the visual-novel sync — labels, list stats and your length votes." })
        ])
      ]),
      workspaceTabs
    ]));

    if (KOS.medview.unavailable(main)) return;

    var body = el("div", { class: "ap-body" });
    main.appendChild(body);
    var visual = {};
    var visualKey = null;

    function saveVisual(next, data, fetchedAt) {
      visual = next || {};
      KOS.mediadb.setKV(visualKey, visual, function (err) {
        if (err) { KOS.ui.toast("Could not save profile images: " + err.message, true); return; }
        render(data, fetchedAt);
      });
    }

    function render(data, fetchedAt) {
      body.innerHTML = "";
      var u = data.user, us = data.userStats, vault = data.vault;

      /* --- header --- */
      function hstat(v2, k) { return el("div", { class: "ap-hstat" }, [el("b", { text: String(v2) }), el("span", { text: k })]); }
      var bannerPref = visual.banner || {}, avatarPref = visual.avatar || {};
      var bannerSource = bannerPref.source || null, avatarSource = avatarPref.source || null;
      var head = el("div", { class: "ap-head vp-head" + (bannerSource ? " has-banner" : "") });
      if (bannerSource) KOS.imageCrop.background(head, bannerSource, bannerPref.crop);
      head.appendChild(el("div", { class: "ap-head-scrim" }, [
        avatarSource
          ? el("span", { class: "ap-avatar ap-avatar-media" }, [KOS.imageCrop.image(avatarSource, { alt: "" }, avatarPref.crop)])
          : el("span", { class: "ap-avatar vp-avatar", "aria-hidden": "true", text: "選" }),
        el("div", { class: "ap-id" }, [
          el("div", { class: "ap-id-top" }, [el("b", { class: "ap-name", text: u.username })]),
          el("span", { class: "ap-since", text: "vndb.org · " + u.id }),
          el("a", { class: "ap-sitelink", href: "https://vndb.org/" + u.id, target: "_blank", rel: "noopener", text: "vndb.org ↗" })
        ]),
        vault ? el("div", { class: "ap-headstats" }, [
          hstat(vault.total, "tracked"),
          hstat(vault.completed, "finished"),
          hstat(vault.routesCleared, "routes"),
          hstat(vault.quotes, "quotes")
        ]) : null
      ]));
      body.appendChild(head);

      var refreshBtn = el("button", { class: "btn", text: "⟳ Refresh", onclick: function () { load(true); } });
      body.appendChild(el("div", { class: "lab-controls ap-actions" }, [
        refreshBtn,
        el("span", { class: "ap-fetched", text: "Updated " + new Date(fetchedAt).toLocaleTimeString() }),
        el("button", { class: "btn", text: "✎ Banner", onclick: function () {
          KOS.imageCrop.open({
            title: "Position your VNDB banner",
            description: "VNDB does not expose profile artwork here, so this upload stays local to Kurenai.",
            source: bannerSource || "", crop: bannerPref.crop, aspect: 3.2, allowUpload: true,
            fileOptions: { maxWidth: 1800, maxHeight: 1200, maxBytes: 520 * 1024, quality: 0.82 },
            onRemove: bannerSource ? function () {
              var next = Object.assign({}, visual); delete next.banner;
              saveVisual(next, data, fetchedAt);
            } : null,
            onSave: function (result) {
              var next = Object.assign({}, visual);
              next.banner = { source: result.source, crop: result.crop };
              saveVisual(next, data, fetchedAt);
            }
          });
        } }),
        el("button", { class: "btn", text: "✎ Avatar", onclick: function () {
          KOS.imageCrop.open({
            title: "Position your VNDB avatar", source: avatarSource || "", crop: avatarPref.crop,
            aspect: 1, allowUpload: true,
            fileOptions: { maxWidth: 900, maxHeight: 900, maxBytes: 260 * 1024, quality: 0.84 },
            onRemove: avatarSource ? function () {
              var next = Object.assign({}, visual); delete next.avatar;
              saveVisual(next, data, fetchedAt);
            } : null,
            onSave: function (result) {
              var next = Object.assign({}, visual);
              next.avatar = { source: result.source, crop: result.crop };
              saveVisual(next, data, fetchedAt);
            }
          });
        } }),
        el("button", { class: "btn", text: "Vault", onclick: function () { KOS.show("vn"); } }),
        el("button", { class: "btn", text: "Sync", onclick: function () { KOS.show("mediasync"); } })
      ]));

      /* --- labels, live from the site --- */
      var visibleLabels = data.labels.filter(function (l) { return l.label && !/^no label$/i.test(l.label); });
      var total = visibleLabels.reduce(function (a, l) { return a + (l.count || 0); }, 0);
      body.appendChild(section("List labels — live from VNDB", total + " label assignments · customs included",
        visibleLabels.length ? [
          el("div", { class: "stat-strip vp-label-stats" }, visibleLabels.map(function (l) {
            var meta = (l.private ? " · private" : "") + (l.id >= 10 ? " · custom" : "");
            return el("div", { class: "stat-card", style: "--label-color:" + labelColor(l.id) }, [
              el("div", { class: "v", text: String(l.count || 0) }),
              el("div", { class: "k", text: l.label + meta })
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
        visualKey = "profile.vndb." + conn.user.id;
        KOS.mediadb.getKV(visualKey, function (prefErr, pref) {
          visual = !prefErr && pref && typeof pref === "object" ? pref : {};
          if (!force && cache.key === String(conn.user.id) && cache.data && Date.now() - cache.at < TTL) {
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
            cache = { key: String(conn.user.id), at: Date.now(), data: data };
            render(data, cache.at);
          });
        });
      });
    }
    load(false);
  };
})();
