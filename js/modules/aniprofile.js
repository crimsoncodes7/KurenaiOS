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
   badge on the site itself. Nothing from this view is written to the vault
   or localStorage — live profile data stays live.                          */
(function () {
  "use strict";
  var el = KOS.ui.el;

  var TTL = 5 * 60 * 1000;
  var cache = { at: 0, data: null };
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
        ((n.media && n.media.title && n.media.title.romaji) || "an anime") + (c[2] || "");
    }
    var who = (n.user && n.user.name) || "";
    var what = n.context || " sent a notification.";
    if (n.__typename === "RelatedMediaAdditionNotification") {
      return ((n.media && n.media.title && n.media.title.romaji) || "A related title") + (n.context || " was added to the site.");
    }
    if (who || n.context) return who + what;
    return "Site notification (" + n.__typename.replace(/Notification$/, "") + ")";
  }

  function activityText(a) {
    if (a.__typename === "ListActivity") {
      /* status is a human string ("watched episode"), progress a string
         range ("5 - 8") — both verified live */
      return (a.status || "updated") + (a.progress ? " " + a.progress : "") + " of " +
        ((a.media && a.media.title && a.media.title.romaji) || "a title");
    }
    if (a.__typename === "TextActivity") return (a.text || "").slice(0, 160) || "posted a status";
    if (a.__typename === "MessageActivity") {
      return "message from " + ((a.messenger && a.messenger.name) || "someone") + ": " + (a.message || "").slice(0, 120);
    }
    return "activity";
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
  function favStrip(nodes, kind) {
    var strip = el("div", { class: "ap-favs" });
    nodes.forEach(function (n) {
      var title = kind === "media" ? ((n.title && (n.title.romaji || n.title.english)) || "?")
        : (n.name && n.name.full) || n.name || "?";
      var img = kind === "media" ? (n.coverImage && n.coverImage.large)
        : kind === "person" ? (n.image && n.image.large) : null;
      strip.appendChild(el("div", { class: "ap-fav" + (kind === "person" ? " ap-fav-round" : ""), title: title }, [
        img ? el("img", { src: img, alt: "", loading: "lazy", decoding: "async" })
            : el("span", { class: "med-cover-ph", "aria-hidden": "true", text: kind === "person" ? "人" : "映" }),
        el("span", { class: "ap-fav-t", text: title })
      ]));
    });
    return strip;
  }
  function userRow(users) {
    var row = el("div", { class: "ap-users" });
    users.forEach(function (u) {
      row.appendChild(el("a", { class: "ap-user", href: "https://anilist.co/user/" + u.name,
        target: "_blank", rel: "noopener", title: u.name }, [
        u.avatar && u.avatar.medium ? el("img", { src: u.avatar.medium, alt: "" }) : el("span", { class: "med-cover-ph", text: "人" }),
        el("span", { text: u.name })
      ]));
    });
    return row;
  }

  KOS.views.aniprofile = function (main) {
    document.getElementById("tree").classList.add("hidden");
    document.getElementById("cols").classList.add("no-tree");

    main.appendChild(el("div", { class: "lab-h" }, [
      el("h1", {}, [el("span", { class: "kanji-inline", text: "顔" }), " AniList Profile"]),
      el("p", { class: "sub", text: "The account behind the sync — stats, favourites, follows, notifications and activity, read straight from AniList in one request. Read-only: looking at notifications here doesn't mark them read on the site." })
    ]));

    if (!KOS.mediadb.available()) {
      main.appendChild(el("p", { class: "fc-empty", text: "The Collection Matrix needs IndexedDB, which this browser/context doesn't provide." }));
      return;
    }

    var body = el("div", { class: "ap-body" });
    main.appendChild(body);

    /* One fetch, five sub-pages (3j): the tabs re-render slices of the SAME
       cached bundle — switching tabs never spends a request. */
    function render(data, fetchedAt) {
      body.innerHTML = "";
      var v = data.Viewer;
      var st = (v.statistics) || {};
      var an = st.anime || {}, mg = st.manga || {};
      var fav = v.favourites || {};

      /* --- header: banner + avatar + identity --- */
      var head = el("div", { class: "ap-head" + (v.bannerImage ? " has-banner" : "") });
      if (v.bannerImage) head.style.backgroundImage = "url(" + v.bannerImage + ")";
      head.appendChild(el("div", { class: "ap-head-scrim" }, [
        v.avatar && v.avatar.large ? el("img", { class: "ap-avatar", src: v.avatar.large, alt: "" }) : null,
        el("div", { class: "ap-id" }, [
          el("b", { class: "ap-name", text: v.name }),
          el("span", { class: "sub", text: "member since " + new Date(v.createdAt * 1000).toLocaleDateString() }),
          el("a", { class: "mini-btn", href: v.siteUrl, target: "_blank", rel: "noopener", text: "anilist.co ↗" })
        ]),
        v.unreadNotificationCount
          ? el("span", { class: "med-chip ap-unread", style: "--chip:#ef4965", text: v.unreadNotificationCount + " unread" })
          : null
      ]));
      body.appendChild(head);

      var refreshBtn = el("button", { class: "btn", text: "⟳ Refresh", onclick: function () { load(true); } });
      body.appendChild(el("div", { class: "lab-controls" }, [
        refreshBtn,
        el("span", { class: "sub", text: "fetched " + new Date(fetchedAt).toLocaleTimeString() }),
        el("span", { style: "flex:1" }),
        el("button", { class: "btn", text: "映 Anime vault", onclick: function () { KOS.show("anime"); } }),
        el("button", { class: "btn", text: "⇅ Sync & Import", onclick: function () { KOS.show("mediasync"); } })
      ]));

      /* --- the sub-page tabs --- */
      var TABS = [
        ["overview", "Overview"], ["favourites", "Favourites"], ["social", "Social"],
        ["activity", "Activity"], ["notifications", "Notifications"]
      ];
      if (!TABS.some(function (t) { return t[0] === curTab; })) curTab = "overview";
      var bar = el("div", { class: "study-tabs ap-tabs", role: "tablist" });
      var pane = el("div", { class: "ap-pane" });
      TABS.forEach(function (t) {
        bar.appendChild(el("button", { class: "study-tab" + (t[0] === curTab ? " active" : ""), role: "tab", "data-tab": t[0],
          onclick: function () {
            curTab = t[0];
            bar.querySelectorAll(".study-tab").forEach(function (b) {
              b.classList.toggle("active", b.dataset.tab === curTab); });
            renderTab();
          } }, [t[1]]));
      });
      body.appendChild(bar);
      body.appendChild(pane);

      function renderOverview() {
        if (v.about) {
          pane.appendChild(section("About me", null, [
            el("p", { class: "ap-about", text: v.about })
          ]));
        }
        var days = an.minutesWatched ? (an.minutesWatched / 1440) : 0;
        pane.appendChild(section("Anime overview", "as AniList counts it (mean score /100)", [
          el("div", { class: "stat-strip" }, [
            stat(an.count || 0, "Anime"),
            stat(an.episodesWatched || 0, "Episodes"),
            stat(days ? days.toFixed(1) : "0", "Days watched"),
            stat(an.meanScore || 0, "Mean score")
          ])
        ]));
        pane.appendChild(section("Manga overview", null, [
          el("div", { class: "stat-strip" }, [
            stat(mg.count || 0, "Manga"),
            stat(mg.chaptersRead || 0, "Chapters"),
            stat(mg.volumesRead || 0, "Volumes"),
            stat(mg.meanScore || 0, "Mean score")
          ])
        ]));
        /* genre + status charts (the shared inline-SVG helpers) */
        if (KOS.charts) {
          var grid = el("div", { class: "cs-grid" });
          if (an.genres && an.genres.length) {
            grid.appendChild(KOS.charts.chartCard("Top genres (anime)", "by titles watched",
              KOS.charts.barChart(an.genres.map(function (g) { return { label: g.genre, value: g.count }; }), { color: "#ef4965" })));
          }
          if (an.statuses && an.statuses.length) {
            grid.appendChild(KOS.charts.chartCard("List breakdown (anime)", "your AniList statuses",
              KOS.charts.barChart(an.statuses.map(function (s2) {
                var loc = KOS.anilist.STATUS_MAP[s2.status];
                return { label: loc ? KOS.media.STATUS_LABEL[loc] : s2.status, value: s2.count,
                         color: loc ? KOS.media.STATUS_COLOR[loc] : "#6f6488" };
              }))));
          }
          if (grid.children.length) pane.appendChild(grid);
        }
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
            el("div", { class: "ap-studios" }, fav.studios.nodes.map(function (s2) {
              return el("span", { class: "med-chip", style: "--chip:#c77bf2", text: s2.name });
            }))
          ]));
        }
        if (!pane.children.length) pane.appendChild(el("p", { class: "sub", text: "No favourites on the account yet." }));
      }

      function renderSocial() {
        var fers = data.followers || {}, fing = data.following || {};
        pane.appendChild(section("Followers & following",
          ((fers.pageInfo && fers.pageInfo.total) || 0) + " followers · " + ((fing.pageInfo && fing.pageInfo.total) || 0) + " following", [
          (fers.followers && fers.followers.length) ? userRow(fers.followers) : el("p", { class: "sub", text: "No followers yet." }),
          (fing.following && fing.following.length) ? userRow(fing.following) : el("p", { class: "sub", text: "Not following anyone yet." })
        ]));
      }

      function renderActivity() {
        var acts = (data.activity && data.activity.activities) || [];
        pane.appendChild(section("Recent activity", "your latest 20 list updates and posts",
          acts.length ? acts.map(function (a) {
            return el("div", { class: "ap-row ap-act" }, [
              a.media && a.media.coverImage && a.media.coverImage.medium
                ? el("img", { class: "ap-act-img", src: a.media.coverImage.medium, alt: "", loading: "lazy" }) : null,
              el("span", { class: "ap-row-t", text: activityText(a) }),
              el("span", { class: "sub", text: a.createdAt ? timeAgo(a.createdAt) : "" })
            ]);
          }) : [el("p", { class: "sub", text: "No public activity yet." })]));
      }

      function renderNotifications() {
        var notifs = (data.notifications && data.notifications.notifications) || [];
        pane.appendChild(section("Notifications", "latest 15 — reading them here never marks them read on the site",
          notifs.length ? notifs.map(function (n) {
            return el("div", { class: "ap-row" }, [
              el("span", { class: "ap-row-t", text: notifText(n) }),
              el("span", { class: "sub", text: n.createdAt ? timeAgo(n.createdAt) : "" })
            ]);
          }) : [el("p", { class: "sub", text: "No notifications." })]));
      }

      function renderTab() {
        pane.innerHTML = "";
        if (curTab === "favourites") renderFavourites();
        else if (curTab === "social") renderSocial();
        else if (curTab === "activity") renderActivity();
        else if (curTab === "notifications") renderNotifications();
        else renderOverview();
      }
      renderTab();
    }

    function load(force) {
      KOS.anilist.getConnection(function (err, conn) {
        if (err || !conn.token || !conn.viewer) {
          body.innerHTML = "";
          body.appendChild(el("div", { class: "med-empty" }, [
            el("p", { class: "fc-empty", text: "Connect your AniList first — the profile view reads the account behind the sync." }),
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
        body.appendChild(el("p", { class: "sub ap-loading", text: "Loading your profile from AniList (one request)…" }));
        KOS.anilist.fetchProfileBundle(conn.token, conn.viewer.id, function (err2, data) {
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
