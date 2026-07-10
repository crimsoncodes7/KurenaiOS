/* Kurenai OS — modules/medview.js
   The vault-view toolkit (refactor step 6, audit item A1).

   Builds 3a→3e grew the four vault views (anime → books → vn → games) by
   copy-paste before the "reuse existing X" convention crystallised — every
   view carried its own byte-identical cover renderer, lazy batch renderer,
   dropdown filler, status pill row, empty states and editor scaffolding.
   This file is the single implementation they now share. It is VIEW-layer
   (it renders DOM), so it lives with the modules it serves, not in core.

   Class names are load-bearing: the smoke suites key off .med-card,
   .med-grid, .med-empty, .med-field, .modal-ov and friends — everything
   here emits exactly the markup the four views emitted before extraction.

   A fifth media module (Music/Competitions — backlog #5) should build on
   this toolkit + KOS.mediaEditors instead of copying a sibling view.      */
(function () {
  "use strict";
  var el = KOS.ui.el;

  var BATCH = 60;   // lazy-render batch size (the 3a scale rule)
  /* display order for pills + editor status dropdowns — deliberately NOT
     mediadb.STATUSES (which is schema order, planned first) */
  var STATUSES = ["inProgress", "planned", "onHold", "completed", "dropped"];

  /* ================= availability ================= */
  var NEEDS_IDB = "The Collection Matrix needs IndexedDB, which this browser/context doesn't provide.";
  /* the canonical guard every Matrix view opens with:
     if (KOS.medview.unavailable(main)) return; */
  function unavailable(main) {
    if (KOS.mediadb.available()) return false;
    main.appendChild(el("p", { class: "fc-empty", text: NEEDS_IDB }));
    return true;
  }

  /* ================= shared display bits ================= */
  /* cover image with lazy load + kanji placeholder fallback (offline or
     broken URL) — the glyph is the module's kanji */
  function cover(e, kanji) {
    var box = el("div", { class: "med-cover" });
    function ph() { return el("span", { class: "med-cover-ph", "aria-hidden": "true", text: kanji }); }
    if (e.coverUrl) {
      var img = el("img", { src: e.coverUrl, alt: "", loading: "lazy", decoding: "async" });
      img.addEventListener("error", function () {
        box.removeChild(img);
        box.appendChild(ph());
      });
      box.appendChild(img);
    } else {
      box.appendChild(ph());
    }
    return box;
  }

  /* dropdown option fill from real index keys, preserving the selection */
  function fillSel(sel, values, blank) {
    var cur = sel.value;
    sel.innerHTML = "";
    sel.appendChild(el("option", { value: "", text: blank }));
    values.forEach(function (v) { sel.appendChild(el("option", { value: v, text: v })); });
    sel.value = values.indexOf(cur) !== -1 ? cur : "";
  }

  /* the vault search box */
  function searchInput(ariaLabel) {
    return el("input", { type: "search", class: "todo-in med-search",
      placeholder: "Search titles…", "aria-label": ariaLabel });
  }

  /* the vault sort select — labels for score/progress vary per module
     (books: Rating / vn: Routes cleared / games: Playtime) */
  function sortSelect(pref, labels) {
    labels = labels || {};
    var sel = el("select", { class: "status-sel", "aria-label": "Sort" }, [
      ["updated", "Recently updated"], ["title", "Title A–Z"],
      ["score", labels.score || "Score"], ["progress", labels.progress || "Progress"]
    ].map(function (o) { return el("option", { value: o[0], text: o[1] }); }));
    sel.value = pref || "updated";
    return sel;
  }

  /* the two-way grid ⇄ list layout toggle (books cycles three layouts per
     tab and keeps its own) */
  function layoutToggle(p, onChange) {
    var btn = el("button", { class: "btn", text: p.layout === "list" ? "▦ Grid" : "☰ List",
      title: "Toggle grid / list", onclick: function () {
        p.layout = p.layout === "list" ? "grid" : "list";
        KOS.store.save();
        btn.textContent = p.layout === "list" ? "▦ Grid" : "☰ List";
        onChange();
      } });
    return btn;
  }

  /* status pill row: All + the five statuses; extra = [[label, applyFn]]
     (books adds a DNF pill). onPick(statusOrNull) sets the filter and
     refreshes; the row manages its own active state. */
  function statusPills(onPick, extra) {
    var pills = el("div", { class: "study-tabs med-pills", role: "tablist" });
    function pill(label, apply) {
      var b = el("button", { class: "study-tab", role: "tab", onclick: function () {
        pills.querySelectorAll(".study-tab").forEach(function (x) { x.classList.remove("active"); });
        b.classList.add("active");
        apply();
      } }, [label]);
      return b;
    }
    var all = pill("All", function () { onPick(null); });
    all.classList.add("active");
    pills.appendChild(all);
    STATUSES.forEach(function (s) {
      pills.appendChild(pill(KOS.media.STATUS_LABEL[s], function () { onPick(s); }));
    });
    (extra || []).forEach(function (x) { pills.appendChild(pill(x[0], x[1])); });
    return pills;
  }

  /* the standard vault empty state — message + centred action buttons */
  function emptyState(message, buttons) {
    return el("div", { class: "med-empty" }, [
      el("p", { class: "fc-empty", text: message }),
      el("div", { class: "lab-controls", style: "justify-content:center" }, buttons || [])
    ]);
  }

  /* ================= the results area + lazy batch renderer =================
     countLine + holder + IntersectionObserver sentinel, and the batched
     renderer behind them: the DOM never holds every card at once — BATCH
     rows at a time as the sentinel scrolls into view, with a render-all-in-
     idle-chunks fallback where IO doesn't exist (old engines / jsdom).
     makeItem(row, index) builds one card/row. */
  function resultsArea(main, makeItem) {
    var countLine = el("p", { class: "sub med-count" });
    main.appendChild(countLine);
    var holder = el("div", { class: "med-grid" });
    main.appendChild(holder);
    var sentinel = el("div", { class: "med-sentinel", "aria-hidden": "true" });
    main.appendChild(sentinel);

    var results = [], rendered = 0, io = null;
    function renderBatch() {
      var end = Math.min(rendered + BATCH, results.length);
      var frag = document.createDocumentFragment();
      for (var i = rendered; i < end; i++) frag.appendChild(makeItem(results[i], i));
      holder.appendChild(frag);
      rendered = end;
      if (rendered >= results.length && io) { io.disconnect(); io = null; }
    }
    /* re-render the current results without a re-query (rank moves etc.) */
    function repaint() {
      if (io) { io.disconnect(); io = null; }
      holder.innerHTML = "";
      rendered = 0;
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
    function start(rows) {
      results = rows;
      repaint();
    }

    return {
      countLine: countLine,
      holder: holder,
      sentinel: sentinel,
      start: start,
      repaint: repaint,
      results: function () { return results; }
    };
  }

  /* ================= the everyday +1 action =================
     mode "progress": +1 episode/chapter — completes at total, moves
     planned/onHold to inProgress, logs one activity, schedules a push.
     mode "hours": games' +1 playtime hour — no total to complete against
     and NEVER a push (games have no sync, invariant #12). */
  function bumpUnit(e, mode, done) {
    var finished = false;
    if (mode === "hours") {
      e.playtimeHours = (e.playtimeHours || 0) + 1;
    } else {
      e.progress.current = (e.progress.current || 0) + 1;
      finished = !!(e.progress.total && e.progress.current >= e.progress.total);
      if (finished) {
        e.progress.current = e.progress.total;
        e.status = "completed";
        if (!e.dates.finished) e.dates.finished = KOS.srs.todayISO();
      }
    }
    if (!finished && (e.status === "planned" || e.status === "onHold")) {
      e.status = "inProgress";
      if (!e.dates.started) e.dates.started = KOS.srs.todayISO();
    }
    KOS.mediadb.put(e, function (err, rec) {
      if (err) { KOS.ui.toast("Save failed: " + err.message, true); return; }
      KOS.media.logActivity(rec, finished ? "completed" : "progress");
      if (mode !== "hours") KOS.mediapush.schedule(rec);   // 3d: coalesces rapid +1 clicks
      done && done(rec);
    });
  }

  /* ================= the editor shell (Phase B) ================= */
  /* the two labelled-field flavors, matching the pre-extraction markup
     exactly: field() is the Matrix editors' label.med-field > span.k;
     calField() is the calendar/tracker forms' label.cal-field > bare span */
  function field(label, input, cls) {
    return el("label", { class: "med-field" + (cls ? " " + cls : "") },
      [el("span", { class: "k", text: label }), input]);
  }
  function calField(label, input) {
    return el("label", { class: "cal-field" }, [el("span", { text: label }), input]);
  }
  function splitList(v) {
    return v.split(",").map(function (s) { return s.trim(); }).filter(Boolean);
  }

  /* overlay + close plumbing shared by every Matrix modal: click outside
     closes, and — new with the shell — Esc closes too (parity with the
     calendar/tracker modals). onClose (optional) runs first, for teardown
     like stopping the barcode scanner's camera. overlay.close is the one
     close path. */
  function modalOverlay(onClose) {
    function close() {
      if (onClose) onClose();
      document.removeEventListener("keydown", onEsc);
      overlay.remove();
    }
    function onEsc(ev) { if (ev.key === "Escape") close(); }
    var overlay = el("div", { class: "modal-ov", onclick: function (ev) { if (ev.target === overlay) close(); } });
    document.addEventListener("keydown", onEsc);
    overlay.close = close;
    return overlay;
  }

  /* the editor's working copy: a NORMALISED deep clone (id preserved), or
     a normalised blank of the module. Normalising here is what aligned the
     anime editor with books/vn/games (audit A11) — it used to edit a raw
     clone and rely on the entry already being clean. */
  function editDraft(entry, module) {
    var e = entry ? KOS.mediadb.normalise(JSON.parse(JSON.stringify(entry)))
                  : KOS.mediadb.normalise({ module: module });
    if (entry && entry.id != null) e.id = entry.id;
    return e;
  }

  /* the editor modal scaffold: header (Add to / Edit —, syncSource
     subtitle, ✕), the med-form body, and the Delete/Cancel/Add|Save
     footer. opts: { isNew, label, subtitle, className, form: node[],
     onSave, onDelete (null hides the button), focus }. Returns the
     overlay (whose .close() the save/delete paths call). */
  function editorModal(opts) {
    var overlay = modalOverlay();
    overlay.appendChild(el("div", { class: "modal med-modal" + (opts.className ? " " + opts.className : "") }, [
      el("div", { class: "modal-h" }, [
        el("b", { text: (opts.isNew ? "Add to " : "Edit — ") + opts.label }),
        el("span", { class: "sub", text: opts.subtitle }),
        el("button", { class: "mini-btn", style: "margin-left:auto", text: "✕", "aria-label": "Close", onclick: overlay.close })
      ]),
      el("div", { class: "med-form" }, opts.form),
      el("div", { class: "lab-controls med-modal-foot" }, [
        !opts.isNew && opts.onDelete ? el("button", { class: "btn danger", text: "Delete", onclick: opts.onDelete }) : null,
        el("span", { style: "flex:1" }),
        el("button", { class: "btn", text: "Cancel", onclick: overlay.close }),
        el("button", { class: "btn primary", text: opts.isNew ? "Add" : "Save", onclick: opts.onSave })
      ])
    ]));
    document.body.appendChild(overlay);
    if (opts.focus) opts.focus.focus();
    return overlay;
  }

  /* the shared save tail: put → ONE deliberate activity log ("added" for
     new entries, else the module's own precedence via ctx.activity(rec) —
     null means just a "Saved." toast) → push when the remote-mapped state
     moved (a no-op for never-eligible modules like games) → close. */
  function saveEntry(e, ctx) {
    KOS.mediadb.put(e, function (err, rec) {
      if (err) { KOS.ui.toast("Save failed: " + err.message, true); return; }
      var action = ctx.isNew ? "added" : (ctx.activity ? ctx.activity(rec) : null);
      if (action) KOS.media.logActivity(rec, action);
      else KOS.ui.toast("Saved.");
      if (KOS.mediapush.snapshot(rec) !== ctx.pushBefore) KOS.mediapush.schedule(rec);
      ctx.close();
      ctx.onSaved && ctx.onSaved(rec);
    });
  }

  /* ================= per-card affordances (Phase C — ex core/media.js,
     which is domain layer and shouldn't render DOM) ================= */
  /* inline quick-edit (Build 3d): status + score editable straight on a
     vault card — the low-friction editing that makes automatic push worth
     having. One implementation, used by all the module views. Status
     changes log a session ("status", same as the editors); score-only
     changes just save+push (the editors don't log those either). */
  function quickEdit(e, rerender) {
    var before = KOS.mediapush.snapshot(e);
    function saved(action) {
      KOS.mediadb.put(e, function (err, rec) {
        if (err) { KOS.ui.toast("Save failed: " + err.message, true); return; }
        if (action) KOS.media.logActivity(rec, action);
        if (KOS.mediapush.snapshot(rec) !== before) KOS.mediapush.schedule(rec);
        rerender && rerender(rec);
      });
    }
    var sel = el("select", { class: "status-sel med-qsel", "aria-label": "Status",
      title: "Change status — " + (e.module === "game"
        ? "saved locally (games have no live sync)"
        : "pushes to " + (e.module === "vn" ? "VNDB" : "AniList") + " when this entry is synced") },
      Object.keys(KOS.media.STATUS_LABEL).map(function (s) {
        return el("option", { value: s, text: KOS.media.STATUS_LABEL[s] });
      }));
    sel.value = e.status;
    sel.addEventListener("click", function (ev) { ev.stopPropagation(); });
    sel.addEventListener("change", function (ev) {
      ev.stopPropagation();
      e.status = sel.value;
      var today = KOS.srs.todayISO();
      if (e.status === "inProgress" && !e.dates.started) e.dates.started = today;
      if (e.status === "completed" && !e.dates.finished) e.dates.finished = today;
      saved("status");
    });
    var score = el("input", { type: "number", class: "todo-in med-qscore", min: "0", max: "10",
      step: "0.5", value: e.score ? String(e.score) : "", placeholder: "★",
      "aria-label": "Score out of 10" });
    score.addEventListener("click", function (ev) { ev.stopPropagation(); });
    score.addEventListener("keydown", function (ev) { ev.stopPropagation(); });
    score.addEventListener("change", function (ev) {
      ev.stopPropagation();
      e.score = Math.max(0, Math.min(10, parseFloat(score.value) || 0));
      saved(null);
    });
    return el("span", { class: "med-quick" }, [sel, score]);
  }

  /* the pending/failed push indicator + manual retry, per card */
  function pushChip(e, rerender) {
    if (e.push && e.push.state === "failed") {
      return el("button", { class: "med-chip med-push-fail", text: "⚠ sync",
        title: (e.push.error || "Push failed.") + " — click to retry",
        "aria-label": "Sync failed — retry", onclick: function (ev) {
          ev.stopPropagation();
          KOS.ui.toast("Retrying the push…");
          KOS.mediapush.flush(e.id);
          setTimeout(function () { rerender && rerender(); }, 400);
        } });
    }
    if (KOS.mediapush.isPending(e.id)) {
      return el("span", { class: "med-chip med-push-pending", title: "Syncing to " +
        (e.module === "vn" ? "VNDB" : "AniList") + "…", text: "⇅" });
    }
    return null;
  }

  /* the shared delete tail — every editor's Delete button */
  function deleteEntry(e, confirmMsg, close, onSaved) {
    if (!confirm(confirmMsg)) return;
    KOS.mediadb.remove(e.id, function (err) {
      if (err) { KOS.ui.toast("Delete failed: " + err.message, true); return; }
      KOS.ui.toast("Deleted.");
      close();
      onSaved && onSaved(null);
    });
  }

  /* ================= the vault hero (Build 4.0) =================
     Sol's hero treatment, per design.md: one user-selectable spotlight PER
     MODULE, carried by a genuine banner image — AniList's bannerImage where
     the entry is synced (verified live: a separate schema field from
     coverImage), a user-uploaded wide image otherwise (VNDB exposes no
     banner; games/books lookups don't either). Selection + upload live in
     the media kv store ("hero.<module>"), NOT on the entry — no schema
     change, no normalise() edit needed.
     Network discipline: the ONLY fetch is the read-only AniList banner
     lookup, and only for syncSource:"anilist" entries missing one. Games
     and VN entries never trigger network from here (invariants #12/#20). */
  function heroKey(modId) { return "hero." + modId; }

  /* wide-banner upload: centre-crop to ~3.2:1 and compress to JPEG ≤1600px,
     same canvas approach as the avatar/volume-cover uploads */
  function compressBanner(file, cb) {
    var img = new Image();
    var url = URL.createObjectURL(file);
    img.onload = function () {
      URL.revokeObjectURL(url);
      var W = Math.min(1600, img.width), H = Math.round(W / 3.2);
      var c = document.createElement("canvas");
      c.width = W; c.height = H;
      var scale = Math.max(W / img.width, H / img.height);
      var sw = W / scale, sh = H / scale;
      var sx = (img.width - sw) / 2, sy = (img.height - sh) / 2;
      c.getContext("2d").drawImage(img, sx, sy, sw, sh, 0, 0, W, H);
      cb(null, c.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = function () { URL.revokeObjectURL(url); cb(new Error("Could not read the image")); };
    img.src = url;
  }

  /* the spotlight picker: search-as-you-type over the module's vault */
  function heroPicker(modId, kanji, onPick) {
    var overlay = modalOverlay();
    var input = el("input", { type: "search", class: "todo-in msch-in", placeholder: "Search your vault…" });
    var list = el("div", { class: "msch-results" });
    function run() {
      KOS.mediadb.query({ module: modId, search: input.value.trim() || undefined, sort: "updated" }, function (err, rows) {
        if (err) return;
        list.innerHTML = "";
        rows.slice(0, 40).forEach(function (e) {
          list.appendChild(el("div", { class: "msch-row", role: "button", tabindex: "0",
            onclick: function () { overlay.close(); onPick(e); } }, [
            e.coverUrl ? el("img", { class: "msch-cover", src: e.coverUrl, alt: "" })
                       : el("span", { class: "msch-cover med-cover-ph", text: kanji }),
            el("div", { class: "msch-body" }, [
              el("div", { class: "msch-title", text: e.title }),
              el("span", { class: "sub", text: KOS.media.STATUS_LABEL[e.status] })
            ])
          ]));
        });
        if (!rows.length) list.appendChild(el("p", { class: "fc-empty", text: "Nothing in this vault yet." }));
      });
    }
    input.addEventListener("input", KOS.ui.debounce(run, 200));
    overlay.appendChild(el("div", { class: "modal msch-modal" }, [
      el("div", { class: "modal-h" }, [
        el("b", { text: "Choose the spotlight" }),
        el("button", { class: "mini-btn", style: "margin-left:auto", text: "\u2715", onclick: overlay.close })
      ]),
      input, list
    ]));
    document.body.appendChild(overlay);
    input.focus();
    run();
    return overlay;
  }

  /* mount the hero into `holder`. mod = KOS.media.module(modId); rerender
     re-runs the view's refresh so progress bumps show everywhere. */
  function heroCard(holder, modId, mod, rerender) {
    holder.innerHTML = "";
    KOS.mediadb.getKV(heroKey(modId), function (err, pref) {
      if (err) return;
      pref = pref || {};
      function renderWith(e) {
        if (!e) return;   // empty vault — no hero
        var banner = (e.extra && e.extra.bannerImage) || pref.banner || null;
        var hero = el("div", { class: "vault-hero" + (banner ? " has-banner" : ""), role: "region", "aria-label": "Spotlight" });
        if (banner) hero.style.backgroundImage =
          "linear-gradient(90deg, color-mix(in srgb, var(--bg0) 94%, transparent) 0%, color-mix(in srgb, var(--bg0) 78%, transparent) 42%, color-mix(in srgb, var(--bg0) 30%, transparent) 100%), url(" + JSON.stringify(banner).slice(1, -1) + ")";
        var pct = e.progress && e.progress.total
          ? Math.min(100, Math.round(100 * (e.progress.current || 0) / e.progress.total)) : null;
        var frac = KOS.media.progressText ? null : null;
        var body = el("div", { class: "vh-body" }, [
          el("div", { class: "vh-kicker" }, [
            el("span", { text: "Spotlight" }),
            el("span", { class: "vh-mod", text: mod.label })
          ]),
          el("h2", { class: "vh-title", text: e.title }),
          el("div", { class: "vh-meta" }, [
            el("span", { class: "med-chip", style: "--chip:" + (KOS.media.STATUS_COLOR[e.status] || "#888"),
              text: KOS.media.STATUS_LABEL[e.status] }),
            e.score ? el("span", { class: "med-score", text: "\u2605 " + e.score }) : null,
            e.progress && e.progress.total
              ? el("span", { class: "med-prog", text: (e.progress.current || 0) + " / " + e.progress.total + " " + mod.unitName })
              : (e.module === "game" && e.playtimeHours != null
                  ? el("span", { class: "med-prog", text: e.playtimeHours + " hr" }) : null)
          ]),
          pct !== null ? el("div", { class: "vh-track" }, [el("i", { style: "width:" + pct + "%" })]) : null,
          el("div", { class: "vh-actions" }, [
            e.status === "inProgress" && e.module !== "game"
              ? el("button", { class: "btn primary", text: "+1 " + mod.unit, onclick: function () {
                  bumpUnit(e, "progress", function () { rerender && rerender(); });
                } }) : null,
            el("button", { class: "btn", text: "Edit", onclick: function () {
              KOS.mediaEditor(e, function () { rerender && rerender(); });
            } }),
            el("button", { class: "btn", text: "\u2606 Change spotlight", onclick: function () {
              heroPicker(modId, mod.kanji, function (picked) {
                KOS.mediadb.setKV(heroKey(modId), { entryId: picked.id, banner: null }, function () {
                  /* synced AniList entries that predate the banner field:
                     one read-only lookup, saved into extra so it sticks */
                  if (picked.syncSource === "anilist" && picked.externalIds && picked.externalIds.anilistId
                      && !(picked.extra && picked.extra.bannerImage)) {
                    KOS.anilist.fetchBanner(picked.externalIds.anilistId, function (err2, url) {
                      if (!err2 && url) {
                        picked.extra = picked.extra || {};
                        picked.extra.bannerImage = url;
                        KOS.mediadb.put(picked, function () { rerender && rerender(); });
                        return;
                      }
                      rerender && rerender();
                    });
                  } else { rerender && rerender(); }
                });
              });
            } }),
            (function () {
              var file = el("input", { type: "file", accept: "image/*", style: "display:none", onchange: function () {
                if (!file.files[0]) return;
                compressBanner(file.files[0], function (err2, dataUrl) {
                  if (err2) { KOS.ui.toast("Banner upload failed: " + err2.message, true); return; }
                  KOS.mediadb.setKV(heroKey(modId), { entryId: e.id, banner: dataUrl }, function () {
                    KOS.ui.toast("Banner set.");
                    rerender && rerender();
                  });
                });
              } });
              var btn = el("button", { class: "btn", text: "\u2912 Banner",
                title: "Upload a wide banner image for this spotlight", onclick: function () { file.click(); } });
              return el("span", {}, [file, btn]);
            })()
          ].filter(Boolean))
        ].filter(Boolean));
        if (!banner && e.coverUrl) {
          hero.appendChild(el("img", { class: "vh-cover", src: e.coverUrl, alt: "" }));
        } else if (!banner) {
          hero.appendChild(el("span", { class: "vh-ph med-cover-ph", text: mod.kanji }));
        }
        hero.appendChild(body);
        holder.appendChild(hero);
      }
      if (pref.entryId != null) {
        KOS.mediadb.get(pref.entryId, function (err2, e) {
          if (!err2 && e && e.module === modId) { renderWith(e); return; }
          autoPick();
        });
      } else autoPick();
      function autoPick() {
        /* nothing chosen: spotlight the most recently updated in-progress
           entry, falling back to the most recent anything */
        KOS.mediadb.query({ module: modId, status: "inProgress", sort: "updated" }, function (err2, rows) {
          if (!err2 && rows && rows.length) { renderWith(rows[0]); return; }
          KOS.mediadb.query({ module: modId, sort: "updated" }, function (err3, all) {
            renderWith(!err3 && all && all.length ? all[0] : null);
          });
        });
      }
    });
  }

  KOS.medview = {
    BATCH: BATCH,
    heroCard: heroCard,
    STATUSES: STATUSES,
    NEEDS_IDB: NEEDS_IDB,
    unavailable: unavailable,
    cover: cover,
    fillSel: fillSel,
    searchInput: searchInput,
    sortSelect: sortSelect,
    layoutToggle: layoutToggle,
    statusPills: statusPills,
    emptyState: emptyState,
    resultsArea: resultsArea,
    bumpUnit: bumpUnit,
    field: field,
    calField: calField,
    splitList: splitList,
    modalOverlay: modalOverlay,
    editDraft: editDraft,
    editorModal: editorModal,
    saveEntry: saveEntry,
    deleteEntry: deleteEntry,
    quickEdit: quickEdit,
    pushChip: pushChip
  };
})();
