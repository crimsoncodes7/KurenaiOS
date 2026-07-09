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
  function cover(e) {
    var box = el("div", { class: "med-cover" });
    if (e.coverUrl) {
      var img = el("img", { src: e.coverUrl, alt: "", loading: "lazy", decoding: "async" });
      img.addEventListener("error", function () {
        box.removeChild(img);
        box.appendChild(el("span", { class: "med-cover-ph", "aria-hidden": "true", text: mod().kanji }));
      });
      box.appendChild(img);
    } else {
      box.appendChild(el("span", { class: "med-cover-ph", "aria-hidden": "true", text: mod().kanji }));
    }
    return box;
  }
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
     what keeps the number honest instead of abandoned. */
  function bumpHour(e, done) {
    e.playtimeHours = (e.playtimeHours || 0) + 1;
    if (e.status === "planned" || e.status === "onHold") {
      e.status = "inProgress";
      if (!e.dates.started) e.dates.started = KOS.srs.todayISO();
    }
    KOS.mediadb.put(e, function (err, rec) {
      if (err) { KOS.ui.toast("Save failed: " + err.message, true); return; }
      KOS.media.logActivity(rec, "progress");
      done && done(rec);
    });
  }

  /* ================= the editor modal ================= */
  function gamesEditor(entry, onSaved) {
    var isNew = !entry;
    var e = entry ? KOS.mediadb.normalise(JSON.parse(JSON.stringify(entry))) : KOS.mediadb.normalise({ module: "game" });
    if (entry && entry.id != null) e.id = entry.id;
    var tierAtOpen = e.completionTier;
    var hoursAtOpen = e.playtimeHours || 0;

    var overlay = el("div", { class: "modal-ov", onclick: function (ev) { if (ev.target === overlay) close(); } });
    function close() { overlay.remove(); }
    function field(label, input, cls) {
      return el("label", { class: "med-field" + (cls ? " " + cls : "") }, [el("span", { class: "k", text: label }), input]);
    }
    function splitList(v) { return v.split(",").map(function (s) { return s.trim(); }).filter(Boolean); }

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
    var coverU = el("input", { type: "url", class: "todo-in", value: (e.coverUrl && e.coverUrl.slice(0, 5) !== "data:") ? e.coverUrl : "", placeholder: "https://… (or upload below — Steam art can't be fetched, CORS)" });
    /* manual upload — the same 2:3 canvas-compress used for per-volume book
       covers (Build 2a avatar pattern); lands as base64 in the entry */
    var coverNote = el("span", { class: "sub gm-cover-note", text: e.coverUrl && e.coverUrl.slice(0, 5) === "data:" ? "uploaded cover stored" : "" });
    var uploadBtn = el("button", { class: "btn", text: "🖼 Upload cover…", onclick: function (ev) {
      ev.preventDefault();
      var f = el("input", { type: "file", accept: "image/*" });
      f.addEventListener("change", function () {
        if (!f.files[0]) return;
        KOS.books.compressVolumeCover(f.files[0], function (err, data) {
          if (err) { KOS.ui.toast(err.message, true); return; }
          e.coverUrl = data;
          coverU.value = "";
          coverNote.textContent = "uploaded cover stored — save to keep it";
        });
      });
      f.click();
    } });
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
      if (coverU.value.trim()) e.coverUrl = coverU.value.trim();
      else if (!e.coverUrl || e.coverUrl.slice(0, 5) !== "data:") e.coverUrl = null;
      e.favourite = fav.checked;
      e.notes = notes.value;
      KOS.mediadb.put(e, function (err, rec) {
        if (err) { KOS.ui.toast("Save failed: " + err.message, true); return; }
        /* one deliberate act per save, most significant first */
        if (isNew) KOS.media.logActivity(rec, "added");
        else if (rec.completionTier !== tierAtOpen && rec.completionTier !== "notStarted") KOS.media.logActivity(rec, "tier");
        else if (oldStatus !== rec.status) KOS.media.logActivity(rec, "status");
        else if ((rec.playtimeHours || 0) > hoursAtOpen) KOS.media.logActivity(rec, "progress");
        else KOS.ui.toast("Saved.");
        close();
        onSaved && onSaved(rec);
      });
    }

    var box = el("div", { class: "modal med-modal gm-modal" }, [
      el("div", { class: "modal-h" }, [
        el("b", { text: (isNew ? "Add to " : "Edit — ") + "Games" }),
        el("span", { class: "sub", text: "manual entry — games have no live sync (Steam blocks browsers); everything here is yours to keep" }),
        el("button", { class: "mini-btn", style: "margin-left:auto", text: "✕", "aria-label": "Close", onclick: close })
      ]),
      el("div", { class: "med-form" }, [
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
        field("Cover URL", coverU),
        el("div", { class: "lab-controls" }, [uploadBtn, coverNote]),
        field("Notes", notes)
      ]),
      el("div", { class: "lab-controls med-modal-foot" }, [
        !isNew ? el("button", { class: "btn danger", text: "Delete", onclick: function () {
          if (!confirm("Delete “" + e.title + "” from the collection?")) return;
          KOS.mediadb.remove(e.id, function (err) {
            if (err) { KOS.ui.toast("Delete failed: " + err.message, true); return; }
            KOS.ui.toast("Deleted.");
            close();
            onSaved && onSaved(null);
          });
        } }) : null,
        el("span", { style: "flex:1" }),
        el("button", { class: "btn", text: "Cancel", onclick: close }),
        el("button", { class: "btn primary", text: isNew ? "Add" : "Save", onclick: save })
      ])
    ]);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    title.focus();
    return overlay;
  }
  KOS.gamesEditor = gamesEditor;

  /* The Shrine and Matrix open entries through KOS.mediaEditor — register
     with the dispatcher (core/media.js) */
  KOS.mediaEditors.game = gamesEditor;

  /* ================= bulk paste-in add (the "no API import" mitigation) ================= */
  function bulkAddModal(onDone) {
    var overlay = el("div", { class: "modal-ov", onclick: function (ev) { if (ev.target === overlay) close(); } });
    function close() { overlay.remove(); }
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
          KOS.media.quickEdit(e, rerender),
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
    return el("div", { class: "med-row gm-row", role: "button", tabindex: "0",
      onclick: function () { gamesEditor(e, rerender); },
      onkeydown: function (ev) { if (ev.key === "Enter") { ev.preventDefault(); gamesEditor(e, rerender); } }
    }, [
      el("span", { class: "med-row-fav" + (e.favourite ? " on" : ""), text: e.favourite ? "♥" : "" }),
      el("span", { class: "med-row-title", text: e.title, title: e.title }),
      el("span", { class: "med-row-genres", text: (KOS.media.PLATFORM_LABEL[e.platform] || "") +
        (e.genres.length ? " · " + e.genres.slice(0, 2).join(" · ") : "") }),
      KOS.media.quickEdit(e, rerender),
      el("span", { class: "med-prog", text: metaLine(e) }),
      tierChip(e),
      e.status === "inProgress" ? el("button", { class: "mini-btn med-plus", text: "+1", onclick: function (ev) {
        ev.stopPropagation();
        bumpHour(e, rerender);
      } }) : el("span", { class: "med-plus-gap" })
    ]);
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
      bars.push({ label: lbl, value: w.added, color: "#ef4965", hint: "week to " + w.end + ": " + w.added + " added" });
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
    var filt = { status: null };

    main.appendChild(el("div", { class: "lab-h" }, [
      el("h1", {}, [el("span", { class: "kanji-inline", text: mod().kanji }), " Games"]),
      el("p", { class: "sub", text: "Manual-first and honest about it: no game service lets a browser pull your library (Steam's API and even its sign-in are CORS-walled — see Sync & Import), so the vault is yours to type — or paste in bulk, one title per line. Completion tiers, platforms, playtime and backlog priority are the axes that matter." })
    ]));

    if (!KOS.mediadb.available()) {
      main.appendChild(el("p", { class: "fc-empty", text: "The Collection Matrix needs IndexedDB, which this browser/context doesn't provide." }));
      return;
    }

    /* toolbar */
    var search = el("input", { type: "search", class: "todo-in med-search", placeholder: "Search titles…", "aria-label": "Search game titles" });
    var platSel = el("select", { class: "status-sel", "aria-label": "Filter by platform" }, [["", "All platforms"]].concat(
      KOS.mediadb.PLATFORMS.map(function (x) { return [x, KOS.media.PLATFORM_LABEL[x]]; })
    ).map(function (o) { return el("option", { value: o[0], text: o[1] }); }));
    var genreSel = el("select", { class: "status-sel", "aria-label": "Filter by genre" });
    var tierSel = el("select", { class: "status-sel", "aria-label": "Filter by completion tier" }, [["", "All tiers"]].concat(
      KOS.mediadb.TIERS.map(function (x) { return [x, KOS.media.TIER_LABEL[x]]; })
    ).map(function (o) { return el("option", { value: o[0], text: o[1] }); }));
    var sortSel = el("select", { class: "status-sel", "aria-label": "Sort" }, [
      ["updated", "Recently updated"], ["title", "Title A–Z"], ["score", "Score"], ["progress", "Playtime"]
    ].map(function (o) { return el("option", { value: o[0], text: o[1] }); }));
    sortSel.value = p.sort || "updated";

    var layoutBtn = el("button", { class: "btn", text: p.layout === "list" ? "▦ Grid" : "☰ List",
      title: "Toggle grid / list", onclick: function () {
        p.layout = p.layout === "list" ? "grid" : "list";
        store.save();
        layoutBtn.textContent = p.layout === "list" ? "▦ Grid" : "☰ List";
        refresh();
      } });

    var pills = el("div", { class: "study-tabs med-pills", role: "tablist" });
    function pill(label, val) {
      return el("button", { class: "study-tab" + (filt.status === val ? " active" : ""), role: "tab",
        onclick: function () {
          filt.status = val;
          pills.querySelectorAll(".study-tab").forEach(function (b) { b.classList.remove("active"); });
          this.classList.add("active");
          refresh();
        } }, [label]);
    }
    pills.appendChild(pill("All", null));
    STATUSES.forEach(function (s) { pills.appendChild(pill(KOS.media.STATUS_LABEL[s], s)); });

    main.appendChild(el("div", { class: "med-toolbar" }, [
      search, platSel, genreSel, tierSel, sortSel, layoutBtn,
      el("button", { class: "btn gold", text: "▤ Bulk add", title: "Paste a list of titles — one per line — and each becomes a draft entry",
        onclick: function () { bulkAddModal(refresh); } }),
      el("button", { class: "btn", text: "⇅ Sync & Import", onclick: function () { KOS.show("mediasync"); } }),
      el("button", { class: "btn primary", text: "+ Add", onclick: function () { gamesEditor(null, refresh); } })
    ]));
    main.appendChild(pills);

    var countLine = el("p", { class: "sub med-count" });
    main.appendChild(countLine);
    var holder = el("div", { class: "med-grid" });
    main.appendChild(holder);
    var sentinel = el("div", { class: "med-sentinel", "aria-hidden": "true" });
    main.appendChild(sentinel);

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
    function fillSel(sel, values, blank) {
      var cur = sel.value;
      sel.innerHTML = "";
      sel.appendChild(el("option", { value: "", text: blank }));
      values.forEach(function (v) { sel.appendChild(el("option", { value: v, text: v })); });
      sel.value = values.indexOf(cur) !== -1 ? cur : "";
    }
    KOS.mediadb.query({ module: "game" }, function (err, rows) {
      if (err) return;
      var gs = {};
      rows.forEach(function (r) { r.genres.forEach(function (x) { gs[x] = true; }); });
      fillSel(genreSel, Object.keys(gs).sort(), "All genres");
    });

    /* ---- lazy batch renderer ---- */
    var results = [], rendered = 0, io = null;
    function renderBatch() {
      var end = Math.min(rendered + BATCH, results.length);
      var frag = document.createDocumentFragment();
      for (var i = rendered; i < end; i++) {
        frag.appendChild(p.layout === "list" ? listRow(results[i], refresh) : gridCard(results[i], refresh));
      }
      holder.appendChild(frag);
      rendered = end;
      if (rendered >= results.length && io) { io.disconnect(); io = null; }
    }
    function startLazy() {
      if (io) { io.disconnect(); io = null; }
      renderBatch();
      if (rendered >= results.length) return;
      if (typeof IntersectionObserver === "undefined") {
        (function chunk() { if (rendered < results.length) { renderBatch(); setTimeout(chunk, 0); } })();
        return;
      }
      io = new IntersectionObserver(function (ents) {
        if (ents.some(function (x) { return x.isIntersecting; })) renderBatch();
      }, { root: null, rootMargin: "600px" });
      io.observe(sentinel);
    }

    var emptyBox = null;
    function refresh() {
      KOS.mediadb.query({
        module: "game", status: filt.status || undefined,
        platform: platSel.value || undefined,
        genre: genreSel.value || undefined,
        tier: tierSel.value || undefined,
        search: search.value.trim() || undefined, sort: sortSel.value
      }, function (err, rows) {
        if (emptyBox) { emptyBox.remove(); emptyBox = null; }
        holder.innerHTML = "";
        rendered = 0;
        holder.className = p.layout === "list" ? "med-list" : "med-grid";
        if (err) { countLine.textContent = "Query failed: " + err.message; return; }
        results = rows;
        var filtered = filt.status || platSel.value || genreSel.value || tierSel.value || search.value;
        countLine.textContent = rows.length + (rows.length === 1 ? " game" : " games") + (filtered ? " (filtered)" : "");
        if (!rows.length) {
          emptyBox = el("div", { class: "med-empty" }, [
            el("p", { class: "fc-empty", text: filtered
              ? "Nothing matches this filter."
              : "The Games vault is empty. Paste your library in bulk — one title per line, straight off Steam's library page — or add games one at a time. There's no import API a browser is allowed to use; this is the whole toolkit, honestly stated." }),
            el("div", { class: "lab-controls", style: "justify-content:center" }, [
              el("button", { class: "btn gold", text: "▤ Bulk add from a pasted list", onclick: function () { bulkAddModal(refresh); } }),
              el("button", { class: "btn", text: "+ Add one game", onclick: function () { gamesEditor(null, refresh); } })
            ])
          ]);
          holder.appendChild(emptyBox);
          return;
        }
        startLazy();
      });
    }

    search.addEventListener("input", KOS.ui.debounce(refresh, 220));
    [platSel, genreSel, tierSel].forEach(function (s) { s.addEventListener("change", refresh); });
    sortSel.addEventListener("change", function () { p.sort = sortSel.value; store.save(); refresh(); });

    refresh();
  };
})();
