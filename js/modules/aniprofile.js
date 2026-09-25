/* Kurenai OS — modules/aniprofile.js
   The AniList profile view (Build 3f): the account behind the sync,
   surfaced in-app — identity (name, avatar, banner, about), anime & manga
   overview statistics, favourites (anime, manga, characters, staff,
   studios), followers & following, notifications and the activity feed.

   Everything arrives in ONE GraphQL request (KOS.anilist.fetchProfileBundle
   — aliased Pages, shape verified live 2026-07-03), cached in memory for a
   few minutes so rail-hopping doesn't spend the 30 req/min budget; the ⟳
   button forces. Read-only throughout: notifications are fetched with
   resetNotificationCount:false, so looking here never consumes the unread
   badge on the site itself. Live API data stays live; only optional local
   avatar/banner source overrides and crop metadata are stored in account-
   keyed media KV records (and therefore included in full backups).         */
(function () {
  "use strict";
  var el = KOS.ui.el;

  var TTL = 5 * 60 * 1000;
  var cache = { key: null, at: 0, data: null };
  /* the active sub-page survives refresh/rail-hops (3j tab split) */
  var curTab = "overview";

  function timeAgo(unixSecs) {
    var s = Math.max(0, Math.floor(Date.now() / 1000 - unixSecs));
    if (s < 60) return "just now";
    if (s < 3600) return Math.floor(s / 60) + "m ago";
    if (s < 86400) return Math.floor(s / 3600) + "h ago";
    if (s < 86400 * 30) return Math.floor(s / 86400) + "d ago";
    return new Date(unixSecs * 1000).toLocaleDateString();
  }

  /* AniList composes an AiringNotification from its contexts array:
     contexts[0] + episode + contexts[1] + title + contexts[2]. */
  function notifText(n) {
    if (n.__typename === "AiringNotification") {
      var c = n.contexts || ["Episode ", " of ", " aired."];
      return (c[0] || "") + n.episode + (c[1] || "") +
        ((n.media && n.media.title && KOS.anilist.pickTitle(n.media.title)) || "an anime") + (c[2] || "");
    }
    var who = (n.user && n.user.name) || "";
    var what = n.context || " sent a notification.";
    if (n.__typename === "RelatedMediaAdditionNotification") {
      return ((n.media && n.media.title && KOS.anilist.pickTitle(n.media.title)) || "A related title") + (n.context || " was added to the site.");
    }
    if (who || n.context) return who + what;
    return "Site notification (" + n.__typename.replace(/Notification$/, "") + ")";
  }

  function activityText(a) {
    if (a.__typename === "ListActivity") {
      /* status is a human string ("watched episode"), progress a string
         range ("5 - 8") — both verified live */
      return (a.status || "updated") + (a.progress ? " " + a.progress : "") + " of " +
        ((a.media && a.media.title && KOS.anilist.pickTitle(a.media.title)) || "a title");
    }
    if (a.__typename === "TextActivity") return (a.text || "").slice(0, 160) || "posted a status";
    if (a.__typename === "MessageActivity") {
      return "message from " + ((a.messenger && a.messenger.name) || "someone") + ": " + (a.message || "").slice(0, 120);
    }
    return "activity";
  }

  /* the profile grammar shared with vndbprofile.js (Sync, frame 11i
     language): a titled section, a stat band, a people/cover strip */
  function section(title, sub, children) {
    return el("section", { class: "k-pf-sec", "data-ui": "profile.section" }, [
      KOS.ui.sectionHeader({ title: title, sub: sub || null })
    ].concat(children));
  }
  function band(tiles) {
    return el("div", { class: "k-stats k-pf-band", "data-ui": "ui.stat-strip" }, tiles);
  }
  function stat(v, k) { return KOS.ui.statTile({ label: k, value: String(v) }); }
  function favStrip(nodes, kind) {
    var strip = el("div", { class: "k-pf-favs", "data-ui": "profile.favs" });
    nodes.forEach(function (n) {
      var title = kind === "media" ? ((n.title && KOS.anilist.pickTitle(n.title)) || "?")
        : (n.name && n.name.full) || n.name || "?";
      var img = kind === "media" ? (n.coverImage && n.coverImage.large)
        : kind === "person" ? (n.image && n.image.large) : null;
      strip.appendChild(el("div", { class: "k-pf-fav", "data-kind": kind, title: title }, [
        el("span", { class: "k-pf-fav-art" }, [img
          ? el("img", { src: img, alt: "", loading: "lazy", decoding: "async" })
          : el("span", { class: "k-pf-ph", "aria-hidden": "true", text: kind === "person" ? "人" : "映" })]),
        el("span", { class: "k-pf-fav-t", text: title })
      ]));
    });
    return strip;
  }
  function userRow(users) {
    return el("div", { class: "k-pf-users", "data-ui": "profile.users" }, users.map(function (u) {
      return el("a", { class: "k-pf-user", href: "https://anilist.co/user/" + u.name, target: "_blank", rel: "noopener", title: u.name }, [
        u.avatar && u.avatar.medium ? el("img", { src: u.avatar.medium, alt: "" }) : el("span", { class: "k-pf-ph", "aria-hidden": "true", text: "人" }),
        el("span", { text: u.name })
      ]);
    }));
  }
  function feedRow(text, when, img) {
    return el("div", { class: "k-pf-row", "data-ui": "profile.row" }, [
      img ? el("img", { class: "k-pf-row-img", src: img, alt: "", loading: "lazy" }) : null,
      el("span", { class: "k-pf-row-t", text: text }),
      el("span", { class: "k-mono k-muted", text: when })
    ].filter(Boolean));
  }
  function note(text) { return el("p", { class: "k-muted k-pf-note", text: text }); }

  /* the hero both profiles share: banner (a local override or the
     site's), avatar, identity and a figure band */
  function profileHero(o) {
    var head = el("div", { class: "k-pf-hero", "data-ui": o.hook ? "profile.head " + o.hook : "profile.head" });
    if (o.banner) {
      KOS.ui.state(head, "has-banner", true);
      KOS.imageCrop.background(head, o.banner, o.bannerCrop, { className: "k-pf-hero-art" });
    }
    head.appendChild(el("span", { class: "k-pf-hero-scrim", "aria-hidden": "true" }));
    head.appendChild(el("div", { class: "k-pf-hero-in" }, [
      o.avatar
        ? el("span", { class: "k-pf-avatar", "data-ui": "profile.avatar" }, [KOS.imageCrop.image(o.avatar, { alt: "" }, o.avatarCrop)])
        : el("span", { class: "k-pf-avatar", "data-ui": "profile.avatar", lang: "ja", "aria-hidden": "true", text: o.mark }),
      el("div", { class: "k-pf-id" }, [
        el("div", { class: "k-pf-id-top" }, [el("h2", { class: "k-pf-name", text: o.name }), o.chip || null].filter(Boolean)),
        el("span", { class: "k-pf-since", text: o.since }),
        el("a", { class: "k-pf-link", href: o.href, target: "_blank", rel: "noopener", text: o.hrefText })
      ]),
      o.figures && o.figures.length ? el("dl", { class: "k-pf-figs" }, o.figures.map(function (f) {
        return el("div", { class: "k-mx-fig" }, [el("dt", { text: f[1] }), el("dd", { text: String(f[0]) })]);
      })) : null
    ].filter(Boolean)));
    return head;
  }
  /* ⟳ Refresh, when it was fetched, and the two local image overrides */
  function actionRow(onRefresh, fetchedAt, onBanner, onAvatar) {
    return el("div", { class: "k-pf-actions", "data-ui": "profile.actions" }, [
      el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "profile.refresh", text: "⟳ Refresh", onclick: onRefresh }),
      el("span", { class: "k-muted k-pf-fetched", text: "Updated " + new Date(fetchedAt).toLocaleTimeString() }),
      el("button", { type: "button", class: "k-btn k-btn--sm k-btn--quiet", text: "✎ Banner", onclick: onBanner }),
      el("button", { type: "button", class: "k-btn k-btn--sm k-btn--quiet", text: "✎ Avatar", onclick: onAvatar })
    ]);
  }
  KOS.profileParts = { hero: profileHero, actions: actionRow, section: section, band: band, stat: stat, note: note };

  KOS.views.aniprofile = function (main) {
    KOS.shell.tree("none");
    main.appendChild(KOS.ui.pageHeader({
      kicker: "Collection · 顔",
      title: "AniList Profile",
      sub: "The account behind the sync: stats, favourites, follows and activity.",
      actions: [KOS.collectionWorkspaceTabs("sync", "aniprofile")]
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

    /* One fetch, six sub-pages (3j): the tabs re-render slices of the SAME
       cached bundle — switching tabs never spends a request. */
    function render(data, fetchedAt) {
      body.innerHTML = "";
      var v = data.Viewer;
      var st = (v.statistics) || {};
      var an = st.anime || {}, mg = st.manga || {};
      var fav = v.favourites || {};
      var bannerPref = visual.banner || {};
      var avatarPref = visual.avatar || {};
      var bannerSource = bannerPref.source || v.bannerImage || null;
      var avatarSource = avatarPref.source || (v.avatar && v.avatar.large) || null;

      body.appendChild(profileHero({
        banner: bannerSource, bannerCrop: bannerPref.crop, avatar: avatarSource, avatarCrop: avatarPref.crop, mark: "顔",
        name: v.name,
        chip: v.unreadNotificationCount ? el("span", { class: "k-mchip", "data-tone": "crimson", "data-ui": "profile.unread", text: v.unreadNotificationCount + " unread" }) : null,
        since: "member since " + new Date(v.createdAt * 1000).toLocaleDateString(),
        href: v.siteUrl, hrefText: "anilist.co ↗",
        figures: [
          [an.count || 0, "anime"], [mg.count || 0, "manga"],
          [an.minutesWatched ? Math.round(an.minutesWatched / 1440) + "d" : "0d", "watched"],
          [an.meanScore ? (an.meanScore / 10).toFixed(1) : "—", "mean"]
        ]
      }));

      body.appendChild(actionRow(function () { load(true); }, fetchedAt, function () {
        KOS.imageCrop.open({
          title: "Position your AniList banner",
          description: "Your AniList image remains the default source; Kurenai stores only an optional override and focal position.",
          source: bannerSource || "", originalSource: v.bannerImage || "", originalLabel: "Use AniList banner",
          crop: bannerPref.crop, aspect: 3.2, allowUpload: true,
          fileOptions: { maxWidth: 1800, maxHeight: 1200, maxBytes: 520 * 1024, quality: 0.82 },
          removeLabel: "Reset to AniList banner",
          onRemove: function () {
            var next = Object.assign({}, visual); delete next.banner;
            saveVisual(next, data, fetchedAt);
          },
          onSave: function (result) {
            var next = Object.assign({}, visual);
            next.banner = { source: v.bannerImage && result.source === v.bannerImage ? null : result.source, crop: result.crop };
            saveVisual(next, data, fetchedAt);
          }
        });
      }, function () {
        var remoteAvatar = (v.avatar && v.avatar.large) || "";
        KOS.imageCrop.open({
          title: "Position your AniList avatar", source: avatarSource || "",
          originalSource: remoteAvatar, originalLabel: "Use AniList avatar",
          crop: avatarPref.crop, aspect: 1, allowUpload: true,
          fileOptions: { maxWidth: 900, maxHeight: 900, maxBytes: 260 * 1024, quality: 0.84 },
          removeLabel: "Reset to AniList avatar",
          onRemove: function () {
            var next = Object.assign({}, visual); delete next.avatar;
            saveVisual(next, data, fetchedAt);
          },
          onSave: function (result) {
            var next = Object.assign({}, visual);
            next.avatar = { source: remoteAvatar && result.source === remoteAvatar ? null : result.source, crop: result.crop };
            saveVisual(next, data, fetchedAt);
          }
        });
      }));

      /* --- the sub-page tabs --- */
      var TABS = [
        ["overview", "Overview"], ["analytics", "Analytics"], ["favourites", "Favourites"], ["social", "Social"],
        ["activity", "Activity"], ["notifications", "Notifications"]
      ];
      if (!TABS.some(function (t) { return t[0] === curTab; })) curTab = "overview";
      var tabsHost = el("div", { class: "k-pf-tabs" });
      var pane = el("div", { class: "k-pf-pane", "data-ui": "profile.pane" });
      function renderTabs() {
        tabsHost.innerHTML = "";
        tabsHost.appendChild(KOS.medview.addHook(KOS.ui.tabs(TABS.map(function (t) {
          return { label: t[1], active: t[0] === curTab, hook: "ui.tab profile.tab",
            onSelect: function () { curTab = t[0]; renderTabs(); renderTab(); } };
        }), { variant: "card", label: "Profile pages" }), "profile.tabs"));
      }
      body.appendChild(tabsHost);
      body.appendChild(pane);

      function renderOverview() {
        if (v.about) pane.appendChild(section("About me", null, [el("blockquote", { class: "k-pf-about", text: v.about })]));
        var days = an.minutesWatched ? (an.minutesWatched / 1440) : 0;
        pane.appendChild(section("Anime overview", "as AniList counts it (mean score /100)", [band([
          stat(an.count || 0, "Anime"), stat(an.episodesWatched || 0, "Episodes"),
          stat(days ? days.toFixed(1) : "0", "Days watched"), stat(an.meanScore || 0, "Mean score")
        ])]));
        pane.appendChild(section("Manga overview", null, [band([
          stat(mg.count || 0, "Manga"), stat(mg.chaptersRead || 0, "Chapters"),
          stat(mg.volumesRead || 0, "Volumes"), stat(mg.meanScore || 0, "Mean score")
        ])]));
      }

      function renderAnalytics() {
        var grid = el("div", { class: "k-mstats-grid", "data-ui": "profile.analytics chart.grid" });
        var colors = ["var(--anime)", "var(--muted)", "var(--crimson)", "var(--vn)", "var(--books)"];
        function rows(list, key, status) {
          return (list || []).filter(function (r) { return r && r.count; }).map(function (r, i) {
            var local = status ? KOS.anilist.STATUS_MAP[r[key]] : null;
            if (status && local === "planned") return null;
            return { label: local ? KOS.media.STATUS_LABEL[local] : String(r[key] || "Unknown"), value: r.count,
              color: local ? KOS.media.STATUS_COLOR[local] : colors[i % colors.length] };
          }).filter(Boolean);
        }
        function add(title, sub, node) { grid.appendChild(KOS.charts.chartCard(title, sub, node)); }
        function medium(label, stats) {
          var formats = rows(stats.formats, "format"), statuses = rows(stats.statuses, "status", true);
          var lengths = rows(stats.lengths, "length"), years = rows(stats.releaseYears, "releaseYear");
          if (formats.length) add(label + " formats", "titles by format", KOS.charts.donutWithLegend(formats, { centre: stats.count || 0, centreSub: "titles" }));
          if (statuses.length) add(label + " status", "active and completed titles", KOS.charts.donutWithLegend(statuses, { centre: statuses.reduce(function (n, item) { return n + item.value; }, 0), centreSub: "titles" }));
          if (lengths.length) add(label + " length", "title count by length", KOS.charts.barChart(lengths, { color: "var(--anime)" }));
          if (years.length) add(label + " release year", "titles by release year", KOS.charts.lineChart(years, { color: "var(--anime)" }));
        }
        medium("Anime", an);
        medium("Manga", mg);
        var genres = rows(an.genres, "genre").concat(rows(mg.genres, "genre"));
        if (genres.length) add("Library genres", "anime and manga favourites", KOS.charts.hbarChart(genres.slice(0, 8), { color: "var(--anime)" }));
        if (grid.children.length) pane.appendChild(grid);
        else pane.appendChild(KOS.ui.emptyState({ compact: true, title: "Analytics will appear as your library grows.",
          body: "AniList has not returned enough distribution data for this account yet." }));
      }

      function renderFavourites() {
        function favSection(title, nodes, kind) {
          if (!nodes || !nodes.length) return;
          pane.appendChild(section("Favourites — " + title, null, [favStrip(nodes, kind)]));
        }
        favSection("Anime", fav.anime && fav.anime.nodes, "media");
        favSection("Manga", fav.manga && fav.manga.nodes, "media");
        favSection("Characters", fav.characters && fav.characters.nodes, "person");
        favSection("Staff", fav.staff && fav.staff.nodes, "person");
        if (fav.studios && fav.studios.nodes && fav.studios.nodes.length) {
          pane.appendChild(section("Favourites — Studios", null, [
            el("div", { class: "k-pf-chips" }, fav.studios.nodes.map(function (s2) {
              return el("span", { class: "k-mchip", "data-tone": "studio", text: s2.name });
            }))
          ]));
        }
        if (!pane.children.length) pane.appendChild(note("No favourites on the account yet."));
      }

      function renderSocial() {
        var fers = data.followers || {}, fing = data.following || {};
        pane.appendChild(section("Followers & following",
          ((fers.pageInfo && fers.pageInfo.total) || 0) + " followers · " + ((fing.pageInfo && fing.pageInfo.total) || 0) + " following", [
          (fers.followers && fers.followers.length) ? userRow(fers.followers) : note("No followers yet."),
          (fing.following && fing.following.length) ? userRow(fing.following) : note("Not following anyone yet.")
        ]));
      }

      function renderActivity() {
        var acts = (data.activity && data.activity.activities) || [];
        pane.appendChild(section("Recent activity", "your latest 20 list updates and posts", [el("div", { class: "k-pf-feed" },
          acts.length ? acts.map(function (a) {
            return feedRow(activityText(a), a.createdAt ? timeAgo(a.createdAt) : "",
              a.media && a.media.coverImage && a.media.coverImage.medium);
          }) : [note("No public activity yet.")])]));
      }

      function renderNotifications() {
        var notifs = (data.notifications && data.notifications.notifications) || [];
        pane.appendChild(section("Notifications", "latest 15 — reading them here never marks them read on the site", [el("div", { class: "k-pf-feed" },
          notifs.length ? notifs.map(function (n) {
            return feedRow(notifText(n), n.createdAt ? timeAgo(n.createdAt) : "");
          }) : [note("No notifications.")])]));
      }

      function renderTab() {
        pane.innerHTML = "";
        if (curTab === "analytics") renderAnalytics();
        else if (curTab === "favourites") renderFavourites();
        else if (curTab === "social") renderSocial();
        else if (curTab === "activity") renderActivity();
        else if (curTab === "notifications") renderNotifications();
        else renderOverview();
      }
      renderTabs();
      renderTab();
    }

    function load(force) {
      KOS.anilist.getConnection(function (err, conn) {
        if (err || !conn.token || !conn.viewer) {
          body.innerHTML = "";
          body.appendChild(KOS.ui.emptyState({
            mark: "映",
            title: "Connect AniList to open your profile",
            body: "The profile uses the same account as Sync & Import. Its token stays in this browser on this device.",
            action: el("button", { type: "button", class: "k-btn k-btn--primary", text: "⇅ Sync & Import", onclick: function () { KOS.show("mediasync"); } })
          }));
          return;
        }
        visualKey = "profile.anilist." + conn.viewer.id;
        KOS.mediadb.getKV(visualKey, function (prefErr, pref) {
          visual = !prefErr && pref && typeof pref === "object" ? pref : {};
          if (!force && cache.key === String(conn.viewer.id) && cache.data && Date.now() - cache.at < TTL) {
            render(cache.data, cache.at);
            return;
          }
          body.innerHTML = "";
          body.appendChild(note("Loading your profile from AniList (one request)…"));
          KOS.anilist.fetchProfileBundle(conn.token, conn.viewer.id, function (err2, data) {
            if (err2) {
              body.innerHTML = "";
              body.appendChild(KOS.ui.emptyState({ compact: true, body: err2.message,
                action: err2.kind === "auth"
                  ? el("button", { type: "button", class: "k-btn k-btn--primary", text: "⇅ Reconnect on Sync & Import", onclick: function () { KOS.show("mediasync"); } })
                  : null }));
              return;
            }
            cache = { key: String(conn.viewer.id), at: Date.now(), data: data };
            render(data, cache.at);
          });
        });
      });
    }
    load(false);
  };
})();
