/* Kurenai OS — modules/games.js
   The Games module (Build 3e) — the last Collection Matrix placeholder made
   real. MANUAL-ENTRY ONLY, permanently and by design:
   - Steam's data API blocks browser CORS with no client-side workaround
     (established 3a), so there is no library pull and playtime is typed in.
   - Steam OpenID sign-in was attempted and tested live (2026-07-03) and
     abandoned: the check_authentication verification response carries no
     Access-Control-Allow-Origin header, so a browser page can send the
     verification POST but can never read is_valid — verification requires
     a server, which this app deliberately doesn't have. (Also: file://
     return URLs are blocked by browsers outright, and even an unverified
     claimed_id is only a bare SteamID64 — the display name would need the
     Steam Web API, which is CORS-blocked too.) See the Games panel on
     Sync & Import.
   The honest mitigation is the BULK PASTE-IN tool: paste titles one per
   line (Steam's own library page copy-pastes cleanly) and each becomes a
   planned draft to flesh out later — pure local text parsing, no network.

   Games-only axes on the shared schema: completionTier (finer than status —
   credits-rolled vs 100% vs platinum), platform, playtimeHours (manual;
   a game's progress DERIVES from it, unit "hr"), backlogPriority,
   publisher, hand-entered steamAppId (store link + future-proofing).

   Same scale rules as the other vaults: DB-index filters, lazy batch
   rendering, lazy covers. Governor contract unchanged: deliberate log
   actions → KOS.media.logActivity (+4 XP/+1 gold, 0 HP, rest streak only);
   the bulk paste logs ONE session for the whole paste — one deliberate act,
   never one per created row.                                              */
(function () {
  "use strict";
  var el = KOS.ui.el, store = KOS.store;

  var BATCH = 60;
  var STATUSES = ["inProgress", "planned", "onHold", "completed", "dropped"];

  function prefs() {
    var m = store.state.media = store.state.media || {};
    m.game = m.game || { layout: "grid", sort: "updated" };
    return m.game;
  }

  /* ================= domain helpers (exposed as KOS.games) ================= */
  function playtimeText(e) {
    if (e.playtimeHours == null) return null;
    var h = e.playtimeHours;
    return (h === Math.floor(h) ? String(h) : h.toFixed(1)) + " h";
  }
  function steamUrl(e) {
    var id = e.externalIds && e.externalIds.steamAppId;
    return id ? "https://store.steampowered.com/app/" + id + "/" : null;
  }

  /* Bulk paste-in parser — pure local text handling, exported for tests.
     One title per line; blanks, in-paste duplicates (case-insensitive) and
     titles already in the vault are skipped, never silently doubled.
     existingLower: Set-like object of vault titleLower values. */
  function parseBulkTitles(text, existingLower) {
    existingLower = existingLower || {};
    var out = { titles: [], blank: 0, dupPaste: 0, dupVault: 0 };
    var seen = {};
    String(text || "").split(/\r?\n/).forEach(function (line) {
      var t = line.trim();
      if (!t) { out.blank++; return; }
      if (t.length > 300) t = t.slice(0, 300);
      var low = t.toLowerCase();
      if (seen[low]) { out.dupPaste++; return; }
      if (existingLower[low]) { out.dupVault++; return; }
      seen[low] = true;
      out.titles.push(t);
    });
    return out;
  }

  /* Backlog burn-down series (Build 3e analytics) — the same sessions log
     that backs the rest streak, filtered to game entries: how many were
     ADDED vs how many REACHED a completion tier, per week. Growing or
     shrinking, honestly, from data that already exists. */
  function isGameSession(s) {
    return s.type === "media" && s.metrics && s.metrics.module === "game";
  }
  function backlogWeeks(nWeeks) {
    var today = KOS.srs.todayISO();
    var weeks = [];
    for (var i = nWeeks - 1; i >= 0; i--) {
      weeks.push({ start: KOS.srs.addDays(today, -(i * 7 + 6)), end: KOS.srs.addDays(today, -i * 7), added: 0, done: 0 });
    }
    KOS.sessions.all().forEach(function (s) {
      if (!isGameSession(s)) return;
      var a = s.metrics.action;
      var isAdd = a === "added" || a === "bulk-add";
      var isDone = a === "tier" || a === "completed";
      if (!isAdd && !isDone) return;
      weeks.forEach(function (w) {
        if (s.date >= w.start && s.date <= w.end) {
          if (isAdd) w.added += (a === "bulk-add" ? (s.metrics.count || 1) : 1);
          else w.done++;
        }
      });
    });
    return weeks;
  }

  KOS.games = {
    playtimeText: playtimeText,
    steamUrl: steamUrl,
    parseBulkTitles: parseBulkTitles,
    backlogWeeks: backlogWeeks
  };

  /* ================= little shared bits ================= */
  var mod = function () { return KOS.media.module("game"); };
  function cover(e) { return KOS.medview.cover(e, mod().kanji); }
  function tierChip(e) {
    if (!e.completionTier || e.completionTier === "notStarted") return null;
    return el("span", { class: "med-chip gm-tier", style: "--chip:" + KOS.media.TIER_COLOR[e.completionTier],
      title: "Completion tier", text: KOS.media.TIER_LABEL[e.completionTier] });
  }
  function platformChip(e) {
    return e.platform ? el("span", { class: "med-chip gm-plat",
      style: "--chip:" + (mod().accent), text: KOS.media.PLATFORM_LABEL[e.platform] || e.platform }) : null;
  }
  function priorityChip(e) {
    return e.backlogPriority ? el("span", { class: "med-chip gm-prio",
      style: "--chip:" + KOS.media.PRIORITY_COLOR[e.backlogPriority],
      title: "Backlog priority", text: "▲ " + KOS.media.PRIORITY_LABEL[e.backlogPriority] }) : null;
  }
  function metaLine(e) {
    var bits = [];
    var pt = playtimeText(e);
    if (pt) bits.push(pt);
    if (e.developer) bits.push(e.developer);
    return bits.join(" · ");
  }

  /* +1 hour — the everyday logging action, mirroring anime's +1 ep. Hours
     are manual (nothing exists to pull them from), so the one-click bump is
     what keeps the number honest instead of abandoned. Shared bump, mode
     "hours": no total to complete against, never a push (games don't sync). */
  function bumpHour(e, done) { KOS.medview.bumpUnit(e, "hours", done); }

  /* ================= the editor modal (shared medview shell) ================= */
  function gamesEditor(entry, onSaved) {
    var mv = KOS.medview;
    var isNew = !entry || entry.id == null;
    var e = mv.editDraft(entry, "game");
    /* the shell's push wiring is a no-op here — games are never push-
       eligible (invariant #12) — but the snapshot keeps the ctx uniform */
    var pushBefore = KOS.mediapush.snapshot(e);
    var tierAtOpen = e.completionTier;
    var hoursAtOpen = e.playtimeHours || 0;
    var field = mv.field, splitList = mv.splitList;

    /* --- identity --- */
    var title = el("input", { type: "text", class: "todo-in", value: e.title === "Untitled" && isNew ? "" : e.title, placeholder: "Title" });
    var developer = el("input", { type: "text", class: "todo-in", value: e.developer, placeholder: "Developer" });
    var publisher = el("input", { type: "text", class: "todo-in", value: e.publisher, placeholder: "Publisher" });

    /* --- list state + games axes --- */
    var status = el("select", { class: "status-sel" }, STATUSES.map(function (s) {
      return el("option", { value: s, text: KOS.media.STATUS_LABEL[s] });
    }));
    status.value = e.status;
    var tier = el("select", { class: "status-sel", title: "Finer-grained than status: credits-rolled vs 100% vs platinum" },
      KOS.mediadb.TIERS.map(function (t) {
        return el("option", { value: t, text: KOS.media.TIER_LABEL[t] });
      }));
    tier.value = e.completionTier;
    /* light nudges, same spirit as the Books DNF box — the tier leads, the
       shared status follows unless the user overrides */
    tier.addEventListener("change", function () {
      if (tier.value === "abandoned" && status.value !== "completed") status.value = "dropped";
      if ((tier.value === "storyComplete" || tier.value === "fullCompletion" || tier.value === "platinum")) status.value = "completed";
    });
    var platform = el("select", { class: "status-sel" }, KOS.mediadb.PLATFORMS.map(function (p2) {
      return el("option", { value: p2, text: KOS.media.PLATFORM_LABEL[p2] });
    }));
    platform.value = e.platform || "pc";
    var own = el("select", { class: "status-sel" }, [["steam", "Steam"], ["digital", "Digital (other)"], ["physical", "Physical"], ["unset", "—"]].map(function (o) {
      return el("option", { value: o[0], text: o[1] });
    }));
    own.value = e.ownership;
    var hours = el("input", { type: "number", class: "todo-in med-num", min: "0", step: "0.5",
      placeholder: "?", value: e.playtimeHours != null ? String(e.playtimeHours) : "",
      title: "Manual — no API exists to pull playtime from" });
    var score = el("input", { type: "number", class: "todo-in med-num", min: "0", max: "10", step: "0.5", value: String(e.score || 0) });
    var prio = el("select", { class: "status-sel", title: "Feeds the backlog analytics below the vault" }, [["", "—"]].concat(
      KOS.mediadb.PRIORITIES.map(function (p2) { return [p2, KOS.media.PRIORITY_LABEL[p2]]; })
    ).map(function (o) { return el("option", { value: o[0], text: o[1] }); }));
    prio.value = e.backlogPriority || "";
    var started = el("input", { type: "date", class: "todo-in", value: e.dates.started || "" });
    var finished = el("input", { type: "date", class: "todo-in", value: e.dates.finished || "" });
    var fav = el("input", { type: "checkbox" });
    fav.checked = e.favourite;

    /* --- Steam app id: hand-entered, future-proofing + a store link.
       No fetch ever happens against it — Steam blocks browser CORS. --- */
    var steamId = el("input", { type: "text", class: "todo-in med-num gm-steamid", value: e.externalIds.steamAppId || "",
      placeholder: "e.g. 1091500", title: "The number from the store page URL — enables the store link; nothing is ever fetched (Steam blocks browsers)" });
    var steamLinkHolder = el("span", { class: "gm-steamlink" });
    function renderSteamLink() {
      steamLinkHolder.innerHTML = "";
      var id = steamId.value.trim().replace(/\D/g, "");
      if (id) {
        steamLinkHolder.appendChild(el("a", { class: "mini-btn", target: "_blank", rel: "noopener",
          href: "https://store.steampowered.com/app/" + id + "/", text: "View on Steam ↗" }));
      }
    }
    steamId.addEventListener("input", renderSteamLink);
    renderSteamLink();

    /* --- taxonomy + cover --- */
    var genres = el("input", { type: "text", class: "todo-in", value: e.genres.join(", "), placeholder: "RPG, Roguelike… (comma-separated, shared taxonomy)" });
    var tags = el("input", { type: "text", class: "todo-in", value: e.tags.join(", "), placeholder: "co-op, replay… (comma-separated)" });
    var coverU = el("input", { type: "url", class: "todo-in", value: e.coverUrl || "", placeholder: "https://… (or choose a local image in Position cover)" });
    var coverPosition = mv.coverPositionControl(e, coverU, { allowUpload: true, maskDataUrl: true });
    var notes = el("textarea", { class: "note-area", rows: 3, placeholder: "Notes…" });
    notes.value = e.notes || "";

    function save() {
      if (!title.value.trim()) { KOS.ui.toast("A title is needed.", true); return; }
      var oldStatus = e.status;
      e.title = title.value.trim();
      e.developer = developer.value.trim();
      e.publisher = publisher.value.trim();
      e.status = status.value;
      e.completionTier = tier.value;
      e.platform = platform.value;
      e.ownership = own.value;
      e.playtimeHours = hours.value === "" ? null : Math.max(0, parseFloat(hours.value) || 0);
      e.score = Math.max(0, Math.min(10, parseFloat(score.value) || 0));
      e.backlogPriority = prio.value || null;
      e.dates.started = started.value || null;
      e.dates.finished = finished.value || null;
      if (e.status === "completed" && !e.dates.finished) e.dates.finished = KOS.srs.todayISO();
      var sid = steamId.value.trim().replace(/\D/g, "");
      e.externalIds.steamAppId = sid ? parseInt(sid, 10) : null;
      e.genres = splitList(genres.value);
      e.tags = splitList(tags.value);
      e.coverUrl = coverPosition.sourceFor();
      e.coverCrop = coverPosition.cropFor(e.coverUrl);
      e.favourite = fav.checked;
      e.notes = notes.value;
      mv.saveEntry(e, {
        isNew: isNew, pushBefore: pushBefore,
        /* one deliberate act per save, most significant first */
        activity: function (rec) {
          if (rec.completionTier !== tierAtOpen && rec.completionTier !== "notStarted") return "tier";
          if (oldStatus !== rec.status) return "status";
          if ((rec.playtimeHours || 0) > hoursAtOpen) return "progress";
          return null;
        },
        close: function () { overlay.close(); }, onSaved: onSaved
      });
    }

    var overlay = mv.editorModal({
      isNew: isNew, label: "Games", className: "gm-modal",
      subtitle: "manual entry — games have no live sync (Steam blocks browsers); everything here is yours to keep",
      form: [
        field("Title", title),
        el("div", { class: "med-form-row" }, [
          field("Developer", developer, "bk-grow"),
          field("Publisher", publisher, "bk-grow")
        ]),
        el("div", { class: "med-form-row" }, [
          field("Status", status),
          field("Completion tier", tier),
          field("Platform", platform),
          field("Ownership", own)
        ]),
        el("div", { class: "med-form-row" }, [
          field("Playtime (hours)", hours),
          field("Score /10", score),
          field("Backlog priority", prio),
          field("Started", started),
          field("Finished", finished),
          field("Favourite ♥", el("span", { class: "med-favwrap" }, [fav]))
        ]),
        el("div", { class: "med-form-row" }, [
          field("Steam App ID (optional)", steamId),
          el("label", { class: "med-field" }, [el("span", { class: "k", text: " " }), steamLinkHolder])
        ]),
        field("Genres", genres),
        field("Tags", tags),
        field("Cover URL", el("div", { class: "image-field" }, [coverU, coverPosition.node])),
        field("Custom lists", mv.customListChips(e), "wl-notes-full"),
        field("Notes", notes)
      ],
      onSave: save,
      onDelete: function () {
        mv.deleteEntry(e, "Delete “" + e.title + "” from the collection?",
          function () { overlay.close(); }, onSaved);
      },
      focus: title
    });
    return overlay;
  }
  KOS.gamesEditor = gamesEditor;

  /* The Shrine and Matrix open entries through KOS.mediaEditor — register
     with the dispatcher (core/media.js) */
  KOS.mediaEditors.game = gamesEditor;

  /* ================= bulk paste-in add (the "no API import" mitigation) ================= */
  function bulkAddModal(onDone) {
    var overlay = KOS.medview.modalOverlay();   // click-outside + Esc close
    var close = overlay.close;
    var ta = el("textarea", { class: "note-area gm-bulk-in", rows: 12,
      placeholder: "Hades\nOuter Wilds\nDisco Elysium\n…one title per line. Steam's library page (steamcommunity.com/id/you/games) copy-pastes cleanly; so does any spreadsheet column." });
    var statusLine = el("p", { class: "sub" });
    var createBtn = el("button", { class: "btn primary", text: "Create drafts", onclick: function () {
      var text = ta.value;
      if (!text.trim()) { KOS.ui.toast("Paste some titles first — one per line.", true); return; }
      createBtn.disabled = true;
      statusLine.textContent = "Checking the vault for duplicates…";
      KOS.mediadb.query({ module: "game" }, function (err, rows) {
        if (err) { statusLine.textContent = "Could not read the vault: " + err.message; createBtn.disabled = false; return; }
        var existing = {};
        rows.forEach(function (r) { existing[r.titleLower] = true; });
        var parsed = parseBulkTitles(text, existing);
        if (!parsed.titles.length) {
          statusLine.textContent = "Nothing new to add — " + parsed.dupVault + " already in the vault, " +
            parsed.dupPaste + " repeated in the paste.";
          createBtn.disabled = false;
          return;
        }
        statusLine.textContent = "Creating " + parsed.titles.length + " drafts…";
        var i = 0;
        (function step() {
          if (i >= parsed.titles.length) {
            /* ONE session for the whole paste: it is one deliberate act.
               Logging per row would flood the log and mint gold — the same
               reason bulk sync/import never logs. */
            KOS.sessions.log({
              type: "media", subject: null, ref: null, dur: null,
              metrics: { module: "game", entryId: null,
                title: parsed.titles.length + " titles pasted in", action: "bulk-add",
                count: parsed.titles.length }
            });
            var skipped = [];
            if (parsed.dupVault) skipped.push(parsed.dupVault + " already in the vault");
            if (parsed.dupPaste) skipped.push(parsed.dupPaste + " repeated in the paste");
            KOS.ui.toast("Added " + parsed.titles.length + " draft" + (parsed.titles.length === 1 ? "" : "s") +
              (skipped.length ? " (skipped " + skipped.join(", ") + ")" : "") + " — each opens for fleshing out like any entry.");
            close();
            onDone && onDone();
            return;
          }
          KOS.mediadb.add({ module: "game", title: parsed.titles[i++], status: "planned",
            syncSource: "manual" }, function (err2) {
            if (err2) { statusLine.textContent = "Write failed at #" + i + ": " + err2.message; createBtn.disabled = false; return; }
            step();
          });
        })();
      });
    } });
    var box = el("div", { class: "modal med-modal gm-bulk-modal" }, [
      el("div", { class: "modal-h" }, [
        el("b", { text: "Bulk add — paste a list of titles" }),
        el("span", { class: "sub", text: "the quick-start path: no game API allows a browser import, but a pasted list is pure local parsing" }),
        el("button", { class: "mini-btn", style: "margin-left:auto", text: "✕", "aria-label": "Close", onclick: close })
      ]),
      el("div", { class: "med-form" }, [
        ta,
        el("p", { class: "sub", text: "One title per line. Each becomes a Planned draft with just the title — status, platform, playtime and the rest are filled in per game whenever you open it. Blank lines, repeats and titles already in the vault are skipped." })
      ]),
      el("div", { class: "lab-controls med-modal-foot" }, [
        statusLine,
        el("span", { style: "flex:1" }),
        el("button", { class: "btn", text: "Cancel", onclick: close }),
        createBtn
      ])
    ]);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    ta.focus();
  }
  KOS.games.bulkAdd = bulkAddModal;

  /* ================= cards ================= */
  function gridCard(e, rerender) {
    var card = el("div", { class: "med-card gm-card", role: "button", tabindex: "0",
      onclick: function () { gamesEditor(e, rerender); },
      onkeydown: function (ev) { if (ev.key === "Enter") { ev.preventDefault(); gamesEditor(e, rerender); } }
    }, [
      cover(e),
      el("button", { class: "med-fav" + (e.favourite ? " on" : ""), title: "Favourite — appears in the Shrine",
        "aria-label": "Toggle favourite", text: "♥", onclick: function (ev) {
          ev.stopPropagation();
          e.favourite = !e.favourite;
          KOS.mediadb.put(e, function () {});
          ev.target.classList.toggle("on", e.favourite);
        } }),
      el("div", { class: "med-card-body" }, [
        el("div", { class: "med-title", title: e.title, text: e.title }),
        e.developer ? el("div", { class: "bk-author", text: e.developer }) : null,
        el("div", { class: "med-meta" }, [
          platformChip(e),
          tierChip(e),
          priorityChip(e),
          el("span", { class: "med-prog", text: playtimeText(e) || "no hours logged" })
        ]),
        el("div", { class: "med-meta med-quickrow" }, [
          KOS.medview.quickEdit(e, rerender),
          e.status === "inProgress" ? el("button", { class: "mini-btn med-plus", text: "+1 hr",
            title: "Log another hour played", onclick: function (ev) {
              ev.stopPropagation();
              bumpHour(e, rerender);
            } }) : null
        ])
      ])
    ]);
    return card;
  }
  function listRow(e, rerender) {
    return KOS.medview.listRow(e, mod(), rerender, {
      subline: (KOS.media.PLATFORM_LABEL[e.platform] || "") + (e.genres.length ? " · " + e.genres.slice(0, 2).join(" · ") : ""),
      chips: [tierChip(e)],
      prog: metaLine(e),
      onBump: e.status === "inProgress" ? function () { bumpHour(e, rerender); } : null,
      open: function () { gamesEditor(e, rerender); }
    });
  }

  /* ================= games analytics (KOS.charts reuse, nothing new) ================= */
  function analyticsCards(agg, rows) {
    var out = [];
    var g = agg.modules.game;
    if (!g || !g.total) return out;

    /* completion tier breakdown across the whole enum */
    out.push(KOS.charts.chartCard("Completion tiers", "credits-rolled vs 100% vs platinum — finer than status",
      KOS.charts.barChart(KOS.mediadb.TIERS.map(function (t) {
        return { label: KOS.media.TIER_LABEL[t], value: (g.tiers && g.tiers[t]) || 0, color: KOS.media.TIER_COLOR[t] };
      }))));

    /* platform + genre breakdowns from the vault rows */
    var plats = {}, gens = {};
    rows.forEach(function (e) {
      if (e.platform) plats[e.platform] = (plats[e.platform] || 0) + 1;
      e.genres.forEach(function (x) { gens[x] = (gens[x] || 0) + 1; });
    });
    out.push(KOS.charts.chartCard("Platforms", "where the library lives",
      KOS.charts.barChart(KOS.mediadb.PLATFORMS.map(function (p2) {
        return { label: KOS.media.PLATFORM_LABEL[p2], value: plats[p2] || 0 };
      }), { color: mod().accent })));
    var topGenres = Object.keys(gens).map(function (x) { return { label: x, value: gens[x] }; })
      .sort(function (a, b) { return b.value - a.value; }).slice(0, 10);
    if (topGenres.length) {
      out.push(KOS.charts.chartCard("Top genres", "games only, shared taxonomy",
        KOS.charts.barChart(topGenres, { color: "#c77bf2" })));
    }

    /* backlog burn-down: added vs reached-a-tier per week, from the same
       activity log that backs the rest streak. Paired bars — crimson in,
       jade out; the subtitle states the verdict in plain words. */
    var weeks = backlogWeeks(12);
    var addedTotal = 0, doneTotal = 0, bars = [];
    weeks.forEach(function (w, i) {
      addedTotal += w.added; doneTotal += w.done;
      var lbl = w.end.slice(5);   // MM-DD
      bars.push({ label: lbl, value: w.added, color: "#35D7FF", hint: "week to " + w.end + ": " + w.added + " added" });
      bars.push({ label: "", value: w.done, color: "#45d6a8", hint: "week to " + w.end + ": " + w.done + " reached a completion tier" });
    });
    var net = addedTotal - doneTotal;
    var verdict = net > 0 ? "backlog GREW by " + net + " in 12 weeks"
      : net < 0 ? "backlog SHRANK by " + (-net) + " in 12 weeks"
      : "backlog held steady over 12 weeks";
    if (addedTotal || doneTotal) {
      out.push(KOS.charts.chartCard("Backlog burn-down", "crimson = added · jade = reached a tier — " + verdict,
        KOS.charts.barChart(bars)));
    }
    return out;
  }

  /* ================= the Games view ================= */
  KOS.views.game = function (main) {
    document.getElementById("tree").classList.add("hidden");
    document.getElementById("cols").classList.add("no-tree");
    var p = prefs();
    var mv = KOS.medview;

    main.appendChild(el("div", { class: "dash-head" }, [
      el("div", { class: "dh-txt" }, [
        el("span", { class: "dh-kicker", text: "Collection · 遊" }),
        el("h1", { text: "Games" }),
        el("div", { class: "dh-sub" }, [
          el("span", { class: "board", text: "The backlog, the hours, and what actually got finished." })
        ])
      ])
    ]));

    if (mv.unavailable(main)) return;

    /* Build 4.0: the per-module spotlight hero (medview.heroCard) */
    var heroHolder = el("div", { class: "vh-holder" });
    main.appendChild(heroHolder);

    /* toolbar — the shared pieces come from the medview toolkit */
    var search = mv.searchInput("Search game titles");
    var platSel = el("select", { class: "status-sel", "aria-label": "Filter by platform" }, [["", "All platforms"]].concat(
      KOS.mediadb.PLATFORMS.map(function (x) { return [x, KOS.media.PLATFORM_LABEL[x]]; })
    ).map(function (o) { return el("option", { value: o[0], text: o[1] }); }));
    var genreSel = el("select", { class: "status-sel", "aria-label": "Filter by genre" });
    var tierSel = el("select", { class: "status-sel", "aria-label": "Filter by completion tier" }, [["", "All tiers"]].concat(
      KOS.mediadb.TIERS.map(function (x) { return [x, KOS.media.TIER_LABEL[x]]; })
    ).map(function (o) { return el("option", { value: o[0], text: o[1] }); }));
    var sortSel = mv.sortSelect(p.sort, { progress: "Playtime" });
    var layoutBtn = mv.layoutToggle(p, function () { refresh(); });
    var rail = mv.filterRail("game", function () { refresh(); });

    var mainCol = el("div", { class: "med-main" });
    mainCol.appendChild(el("div", { class: "med-toolbar" }, [
      search, platSel, genreSel, tierSel, sortSel, layoutBtn,
      el("button", { class: "btn gold", text: "▤ Bulk add", title: "Paste a list of titles — one per line — and each becomes a draft entry",
        onclick: function () { bulkAddModal(refreshAll); } }),
      el("button", { class: "btn", text: "◫ Stats", title: "This vault, in numbers", onclick: function () { mv.statsModal("game", mod()); } }),
      el("button", { class: "btn", text: "⇅ Sync & Import", onclick: function () { KOS.show("mediasync"); } }),
      el("button", { class: "btn primary", text: "+ Add", onclick: function () { gamesEditor(null, refreshAll); } })
    ]));
    main.appendChild(el("div", { class: "med-layout" }, [rail.root, mainCol]));

    function refreshAll() { rail.reload(); refresh(); }

    /* countLine + holder + sentinel + the lazy batch renderer */
    var area = mv.resultsArea(mainCol, function (e) {
      return p.layout === "list" ? listRow(e, refreshAll) : gridCard(e, refreshAll);
    });

    /* stats strip + games analytics under the vault */
    var statsWrap = el("div", { class: "gm-stats" });
    main.appendChild(statsWrap);
    function renderStats() {
      statsWrap.innerHTML = "";
      KOS.mediadb.stats(function (err, agg) {
        if (err || !agg) return;
        var g = agg.modules.game || { total: 0, inProgress: 0, completed: 0, planned: 0, episodes: 0, tiers: {} };
        function stat(v, k) {
          return el("div", { class: "stat-card" }, [
            el("div", { class: "v", text: String(v) }), el("div", { class: "k", text: k })]);
        }
        var tiers = g.tiers || {};
        statsWrap.appendChild(el("div", { class: "stat-strip" }, [
          stat(g.total, "Games tracked"),
          stat(g.inProgress || 0, "Playing now"),
          stat(g.planned || 0, "In the backlog"),
          stat(Math.round(g.episodes || 0), "Hours logged"),
          stat((tiers.platinum || 0) + (tiers.fullCompletion || 0), "100% / platinum")
        ]));
        if (g.total) {
          KOS.mediadb.query({ module: "game" }, function (err2, rows) {
            if (err2) return;
            var grid = el("div", { class: "cs-grid gm-charts" });
            analyticsCards(agg, rows).forEach(function (c) { grid.appendChild(c); });
            statsWrap.appendChild(grid);
          });
        }
      });
    }
    renderStats();

    /* genre dropdown fill from game rows only */
    KOS.mediadb.query({ module: "game" }, function (err, rows) {
      if (err) return;
      var gs = {};
      rows.forEach(function (r) { r.genres.forEach(function (x) { gs[x] = true; }); });
      mv.fillSel(genreSel, Object.keys(gs).sort(), "All genres");
    });

    function refresh() {
      KOS.mediadb.query({
        module: "game", status: rail.status() || undefined,
        customList: rail.customList() || undefined,
        platform: platSel.value || undefined,
        genre: genreSel.value || undefined,
        tier: tierSel.value || undefined,
        search: search.value.trim() || undefined, sort: sortSel.value
      }, function (err, rows) {
        area.holder.className = p.layout === "list" ? "med-list" : "med-grid";
        if (err) {
          area.holder.innerHTML = "";
          area.countLine.textContent = "Query failed: " + err.message;
          return;
        }
        var filtered = rail.status() || rail.customList() || platSel.value || genreSel.value || tierSel.value || search.value;
        area.countLine.textContent = rows.length + (rows.length === 1 ? " game" : " games") + (filtered ? " (filtered)" : "");
        if (!rows.length) {
          area.holder.innerHTML = "";
          area.holder.appendChild(mv.emptyState(
            filtered
              ? "Nothing matches this filter."
              : "The Games vault is empty. Paste your library in bulk — one title per line, straight off Steam's library page — or add games one at a time. There's no import API a browser is allowed to use; this is the whole toolkit, honestly stated.",
            [
              el("button", { class: "btn gold", text: "▤ Bulk add from a pasted list", onclick: function () { bulkAddModal(refreshAll); } }),
              el("button", { class: "btn", text: "+ Add one game", onclick: function () { gamesEditor(null, refreshAll); } })
            ]));
          return;
        }
        area.start(rows);
      });
    }

    search.addEventListener("input", KOS.ui.debounce(refresh, 220));
    [platSel, genreSel, tierSel].forEach(function (s) { s.addEventListener("change", refresh); });
    sortSel.addEventListener("change", function () { p.sort = sortSel.value; store.save(); refresh(); });

    function mountHero() { mv.heroCard(heroHolder, "game", mod(), function () { refreshAll(); mountHero(); }); }
    mountHero();
    refresh();
  };
})();
