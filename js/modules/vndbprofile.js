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
    return status ? KOS.media.STATUS_COLOR[status] : "var(--vn)";
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
    KOS.shell.tree("none");
    /* the profile grammar lives with the AniList profile (aniprofile.js) */
    var P = KOS.profileParts;
    main.appendChild(KOS.ui.pageHeader({
      kicker: "Collection · 貌",
      title: "VNDB Profile",
      sub: "The account behind the visual-novel sync: labels, list stats and your length votes.",
      actions: [KOS.collectionWorkspaceTabs("sync", "vndbprofile")]
    }));

    if (KOS.medview.unavailable(main)) return;

    var body = el("div", { class: "k-pf", "data-ui": "profile.body" });
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
      var bannerPref = visual.banner || {}, avatarPref = visual.avatar || {};
      var bannerSource = bannerPref.source || null, avatarSource = avatarPref.source || null;

      body.appendChild(P.hero({
        hook: "profile.vndb-head",
        banner: bannerSource, bannerCrop: bannerPref.crop, avatar: avatarSource, avatarCrop: avatarPref.crop, mark: "選",
        name: u.username, since: "vndb.org · " + u.id,
        href: "https://vndb.org/" + u.id, hrefText: "vndb.org ↗",
        figures: vault ? [[vault.total, "tracked"], [vault.completed, "finished"], [vault.routesCleared, "routes"], [vault.quotes, "quotes"]] : null
      }));

      body.appendChild(P.actions(function () { load(true); }, fetchedAt, function () {
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
      }, function () {
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
      }));

      /* --- labels, live from the site --- */
      var visibleLabels = data.labels.filter(function (l) { return l.label && !/^no label$/i.test(l.label); });
      var total = visibleLabels.reduce(function (a, l) { return a + (l.count || 0); }, 0);
      body.appendChild(P.section("List labels — live from VNDB", total + " label assignments · customs included",
        visibleLabels.length ? [
          el("div", { class: "k-stats k-pf-band k-pf-labels", "data-ui": "ui.stat-strip profile.label-stats" }, visibleLabels.map(function (l) {
            var tile = KOS.ui.statTile({ label: l.label + (l.private ? " · private" : "") + (l.id >= 10 ? " · custom" : ""), value: String(l.count || 0) });
            tile.style.setProperty("--vh-accent", labelColor(l.id));
            return tile;
          }))
        ] : [P.note("No labels on the account yet.")]));

      /* --- vault-derived list stats (the synced ulist, locally) --- */
      if (vault) {
        var mean = vault.rated ? (vault.scoreSum / vault.rated).toFixed(1) : "—";
        var hours = Math.round(vault.estMinutes / 60);
        body.appendChild(P.section("List statistics", "from the synced vault — same data, no extra requests", [P.band([
          P.stat(vault.total, "VNs tracked"), P.stat(vault.completed, "Finished"), P.stat(mean, "Mean vote /10"),
          P.stat(vault.routesCleared + "/" + vault.routesTotal, "Routes cleared"), P.stat(vault.chaptersDone, "Chapters done"),
          P.stat(vault.quotes, "Quotes kept"), P.stat(hours ? "~" + hours : "—", "Est. hours (finished)")
        ])]));
      }

      /* --- length-vote contributions --- */
      if (us) {
        body.appendChild(P.section("Play-length contributions", "your crowd-sourced timing data on vndb.org", [P.band([
          P.stat(us.lengthvotes || 0, "Length votes"),
          P.stat(us.lengthvotes_sum ? Math.round(us.lengthvotes_sum / 60) + " h" : "0 h", "Hours reported")
        ])]));
      }
    }

    function load(force) {
      KOS.vndb.getConnection(function (err, conn) {
        if (err || !conn.token || !conn.user) {
          body.innerHTML = "";
          body.appendChild(KOS.ui.emptyState({
            mark: "読",
            title: "Connect VNDB to open your profile",
            body: "The profile uses the same account as Sync & Import. Its token stays in this browser on this device.",
            action: el("button", { type: "button", class: "k-btn k-btn--primary", text: "⇅ Sync & Import", onclick: function () { KOS.show("mediasync"); } })
          }));
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
          body.appendChild(P.note("Loading your profile from VNDB (two small requests)…"));
          gather(conn, function (err2, data) {
            if (err2) {
              body.innerHTML = "";
              body.appendChild(KOS.ui.emptyState({ compact: true, body: err2.message,
                action: err2.kind === "auth"
                  ? el("button", { type: "button", class: "k-btn k-btn--primary", text: "⇅ Reconnect on Sync & Import", onclick: function () { KOS.show("mediasync"); } })
                  : null }));
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
