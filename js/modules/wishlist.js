/* Kurenai OS — modules/wishlist.js
   Build 3g — the Collection Matrix Purchase / Budget Planner.

   Spans Books (physical), Games and Visual Novels against ONE shared
   monthly budget pool (never per-module limits). Marking an item Purchased
   archives it into budget.history — it is never deleted — which feeds a
   spend-over-time chart and a per-module breakdown, both drawn with the
   shared KOS.charts inline-SVG helpers (no new charting approach).

   GOVERNOR BOUNDARY (deliberate, enforced by smoke14): nothing in this
   module ever calls KOS.sessions.log / KOS.media.logActivity / the
   governor. Purchasing is logistics, not media engagement, so it stays
   entirely outside the XP/gold/HP/streak loop — the same reason HP never
   touches leisure. This file emits ZERO governor traffic.

   RELEASE DATES ARE MANUAL, by design. No viable automated source exists:
   Amazon's Product Advertising API needs an approved affiliate account and
   forbids the "wishlist/price-watch" use it would be wanted for; Keepa is a
   paid subscription behind its own key; IGDB (games) covers no books at all
   and needs a Twitch OAuth secret a static file:// app can't hold. So the
   honest answer is a date field the user types — the UI says so plainly
   rather than implying automation that isn't there.

   Storage: KOS.store.state.wishlist (localStorage), NOT the media vault —
   these are planning records, not media entries. They ride the standard
   backup because exportFull serialises the whole state object.             */
(function () {
  "use strict";
  var el = KOS.ui.el, store = KOS.store;

  /* ---------------- constants ---------------- */
  var STATUSES = ["wantToBuy", "waitingForRelease", "purchased", "cancelled"];
  var STATUS_LABEL = {
    wantToBuy: "Want to buy", waitingForRelease: "Waiting for release",
    purchased: "Purchased", cancelled: "Cancelled"
  };
  /* the vault modules this planner spans — ids match the Matrix's own
     ("game" is singular internally; "games" from callers is normalised) */
  var MODULES = ["books", "vn", "game"];
  var MODULE_LABEL = { books: "Books", vn: "Visual Novels", game: "Games" };
  var MODULE_KANJI = { books: "本", vn: "選", game: "遊" };
  var MODULE_COLOR = { books: "#ecc15a", vn: "#c77bf2", game: "#66c0f4" };

  /* ---------------- data layer (pure — no governor, ever) ---------------- */
  function data() {
    var w = store.state.wishlist = store.state.wishlist ||
      { nextId: 1, budget: { monthlyLimit: 0, currency: "£", history: [] }, items: [] };
    if (!w.budget) w.budget = { monthlyLimit: 0, currency: "£", history: [] };
    if (!Array.isArray(w.budget.history)) w.budget.history = [];
    if (!Array.isArray(w.items)) w.items = [];
    if (!w.nextId) w.nextId = 1;
    return w;
  }
  function budget() { return data().budget; }
  function items() { return data().items; }
  function get(id) { return items().find(function (it) { return it.id === id; }) || null; }
  function normModule(m) { return m === "games" ? "game" : (MODULES.indexOf(m) !== -1 ? m : "game"); }
  function cleanPrice(p) {
    var n = typeof p === "number" ? p : parseFloat(p);
    return (typeof n === "number" && !isNaN(n) && n >= 0) ? n : 0;
  }
  function now() { return Date.now(); }
  function monthKey(ts) {
    var d = new Date(ts == null ? now() : ts);
    return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2);
  }

  /* items of one status, ranked by the draggable priority */
  function byStatus(status) {
    return items().filter(function (it) { return it.status === status; })
      .sort(function (a, b) { return (a.priority || 0) - (b.priority || 0) || a.id - b.id; });
  }
  /* every live wishlist item tied to a vault entry — the reverse-surfacing
     lookup used by the vault editor ("on your wishlist") */
  function forEntry(entryId) {
    if (entryId == null) return [];
    return items().filter(function (it) {
      return it.linkedEntryId === entryId && it.status !== "cancelled";
    });
  }
  function nextPriority(status) {
    var arr = byStatus(status);
    return arr.length ? Math.max.apply(null, arr.map(function (it) { return it.priority || 0; })) + 1 : 0;
  }

  function add(d) {
    d = d || {};
    var w = data();
    var status = STATUSES.indexOf(d.status) !== -1 ? d.status : "wantToBuy";
    var it = {
      id: w.nextId++,
      module: normModule(d.module),
      title: (String(d.title || "").trim()) || "Untitled",
      coverUrl: d.coverUrl || null,
      price: cleanPrice(d.price),
      currency: d.currency || w.budget.currency || "£",
      retailer: String(d.retailer || "").trim(),
      retailerUrl: String(d.retailerUrl || "").trim(),
      priority: nextPriority(status),
      releaseDate: d.releaseDate || null,
      status: status,
      linkedEntryId: d.linkedEntryId != null ? d.linkedEntryId : null,
      notes: String(d.notes || ""),
      addedAt: now(),
      purchasedAt: null
    };
    if (status === "purchased") { it.purchasedAt = now(); archive(it, it.purchasedAt); }
    w.items.push(it);
    store.save();
    return it;
  }

  function update(id, patch) {
    var it = get(id);
    if (!it) return null;
    var wasStatus = it.status;
    Object.keys(patch || {}).forEach(function (k) {
      if (k === "id" || k === "addedAt" || k === "purchasedAt") return;
      if (k === "module") { it.module = normModule(patch.module); return; }
      if (k === "price") { it.price = cleanPrice(patch.price); return; }
      if (k === "status") return;   // status transitions go through setStatus
      it[k] = patch[k];
    });
    if (patch && patch.status && patch.status !== wasStatus) {
      setStatus(id, patch.status);   // saves
    } else {
      store.save();
    }
    return it;
  }

  /* a status move keeps ranking sane (append at the tail of the new tab)
     and routes a move-to-purchased through the archive */
  function setStatus(id, status) {
    var it = get(id);
    if (!it || STATUSES.indexOf(status) === -1 || it.status === status) return it;
    if (status === "purchased") { markPurchased(id); return get(id); }
    it.status = status;
    it.priority = nextPriority(status);
    store.save();
    return it;
  }

  function remove(id) {
    var w = data();
    w.items = w.items.filter(function (it) { return it.id !== id; });
    store.save();
  }

  /* drag-drop reorder within one tab: reassign 0..n by drop order */
  function reorder(status, orderedIds) {
    orderedIds.forEach(function (id, i) {
      var it = get(id);
      if (it && it.status === status) it.priority = i;
    });
    store.save();
  }

  /* ---------------- purchase archiving ----------------
     Marking Purchased never deletes the item — it flips status and lands a
     snapshot in the month bucket of budget.history, which is what the
     spend-over-time chart and per-module breakdown read. */
  function archive(it, t) {
    var w = data();
    var mk = monthKey(t);
    var bucket = w.budget.history.find(function (h) { return h.month === mk; });
    if (!bucket) { bucket = { month: mk, spent: 0, items: [] }; w.budget.history.push(bucket); }
    if (!bucket.items.some(function (x) { return x.id === it.id; })) {
      bucket.items.push({ id: it.id, title: it.title, module: it.module,
        price: it.price, currency: it.currency, purchasedAt: t });
    }
    bucket.spent = bucket.items.reduce(function (a, x) { return a + (x.price || 0); }, 0);
    w.budget.history.sort(function (a, b) { return a.month < b.month ? -1 : 1; });
  }
  function markPurchased(id, ts) {
    var it = get(id);
    if (!it || it.status === "purchased") return it;
    var t = ts == null ? now() : ts;
    it.status = "purchased";
    it.purchasedAt = t;
    archive(it, t);
    store.save();
    return it;
  }

  /* ---------------- budget maths (all pure, all tested) ---------------- */
  function setBudget(patch) {
    var b = budget();
    if (patch.monthlyLimit != null) b.monthlyLimit = Math.max(0, parseFloat(patch.monthlyLimit) || 0);
    if (patch.currency != null) b.currency = String(patch.currency).slice(0, 3) || "£";
    store.save();
    return b;
  }
  function spentInMonth(mk) {
    var h = budget().history.find(function (x) { return x.month === mk; });
    return h ? h.spent : 0;
  }
  function currentMonthSpend(ts) { return spentInMonth(monthKey(ts)); }
  function selectedTotal(ids) {
    return (ids || []).reduce(function (a, id) {
      var it = get(id); return a + (it ? (it.price || 0) : 0);
    }, 0);
  }
  /* the live "will I bust the budget" number: limit − already spent this
     month − the simulated (checkbox) selection. Can go negative (over). */
  function remaining(limit, spent, selected) {
    return (limit || 0) - (spent || 0) - (selected || 0);
  }
  function spendByMonth() {
    return budget().history.slice()
      .sort(function (a, b) { return a.month < b.month ? -1 : 1; })
      .map(function (h) { return { month: h.month, total: h.spent || 0 }; });
  }
  function spendByModule() {
    var out = {};
    budget().history.forEach(function (h) {
      (h.items || []).forEach(function (x) { out[x.module] = (out[x.module] || 0) + (x.price || 0); });
    });
    return out;
  }
  function totalSpent() {
    return budget().history.reduce(function (a, h) { return a + (h.spent || 0); }, 0);
  }
  /* the "next to drop": whichever waiting-for-release item has the nearest
     manual release date — upcoming first, else the most recent past one */
  function nextToDrop() {
    var today = KOS.srs.todayISO();
    var waiting = byStatus("waitingForRelease").filter(function (it) { return it.releaseDate; });
    if (!waiting.length) return null;
    var upcoming = waiting.filter(function (it) { return it.releaseDate >= today; })
      .sort(function (a, b) { return a.releaseDate < b.releaseDate ? -1 : 1; });
    if (upcoming.length) return upcoming[0];
    return waiting.sort(function (a, b) { return a.releaseDate > b.releaseDate ? -1 : 1; })[0];
  }

  KOS.wishlist = {
    STATUSES: STATUSES, STATUS_LABEL: STATUS_LABEL,
    MODULES: MODULES, MODULE_LABEL: MODULE_LABEL,
    MODULE_KANJI: MODULE_KANJI, MODULE_COLOR: MODULE_COLOR,
    data: data, budget: budget, items: items, get: get,
    byStatus: byStatus, forEntry: forEntry,
    add: add, update: update, setStatus: setStatus, remove: remove,
    reorder: reorder, markPurchased: markPurchased,
    setBudget: setBudget, monthKey: monthKey,
    spentInMonth: spentInMonth, currentMonthSpend: currentMonthSpend,
    selectedTotal: selectedTotal, remaining: remaining,
    spendByMonth: spendByMonth, spendByModule: spendByModule,
    totalSpent: totalSpent, nextToDrop: nextToDrop
  };

  /* ---------------- little shared bits ---------------- */
  function money(n, cur) {
    cur = cur || budget().currency || "£";
    var v = (typeof n === "number" && !isNaN(n)) ? n : 0;
    return cur + v.toFixed(2);
  }
  function daysUntil(iso) {
    if (!iso) return null;
    var today = KOS.srs.todayISO();
    var a = new Date(today + "T00:00:00"), b = new Date(iso + "T00:00:00");
    return Math.round((b - a) / 86400000);
  }
  function releaseText(iso) {
    var d = daysUntil(iso);
    if (d == null) return "no date set";
    if (d === 0) return "releases today";
    if (d > 0) return "in " + d + (d === 1 ? " day" : " days") + " · " + iso;
    return "released " + (-d) + (d === -1 ? " day ago" : " days ago") + " · " + iso;
  }

  /* ---------------- vault linking (both directions) ---------------- */
  /* forward: a wishlist item can open the vault entry it references */
  function openLinkedEntry(entryId, after) {
    KOS.mediadb.get(entryId, function (err, entry) {
      if (err || !entry) { KOS.ui.toast("That collection entry no longer exists.", true); return; }
      KOS.mediaEditor(entry, after || null);
    });
  }
  /* the link picker: a small search over one module's vault, used inside
     the item editor. onPick(entry|null). */
  function linkPicker(module, current, onPick) {
    var box = el("div", { class: "wl-linkbox" });
    var search = el("input", { type: "search", class: "todo-in", placeholder: "Search your " + MODULE_LABEL[module] + " vault…", "aria-label": "Search vault to link" });
    var results = el("div", { class: "wl-linkresults" });
    var currentLine = el("div", { class: "wl-linkcur" });
    box.appendChild(search);
    box.appendChild(currentLine);
    box.appendChild(results);
    var picked = current != null ? current : null;

    function paintCurrent() {
      currentLine.innerHTML = "";
      if (picked == null) {
        currentLine.appendChild(el("span", { class: "sub", text: "Not linked to a vault entry." }));
        return;
      }
      KOS.mediadb.get(picked, function (err, entry) {
        currentLine.innerHTML = "";
        if (err || !entry) {
          currentLine.appendChild(el("span", { class: "sub", text: "Linked entry #" + picked + " (missing)." }));
          return;
        }
        currentLine.appendChild(el("span", { class: "wl-chip wl-linked" }, [
          el("span", { class: "k", text: "linked ⇄ " }),
          el("b", { text: entry.title })
        ]));
        currentLine.appendChild(el("button", { class: "mini-btn", text: "unlink", onclick: function () {
          picked = null; onPick && onPick(null); paintCurrent();
        } }));
      });
    }
    function runSearch() {
      var q = search.value.trim();
      results.innerHTML = "";
      if (q.length < 2) return;
      KOS.mediadb.query({ module: module, search: q, sort: "title" }, function (err, rows) {
        results.innerHTML = "";
        if (err) return;
        rows.slice(0, 8).forEach(function (entry) {
          results.appendChild(el("button", { class: "wl-linkhit", onclick: function () {
            picked = entry.id;
            onPick && onPick(entry);
            search.value = "";
            results.innerHTML = "";
            paintCurrent();
          } }, [
            entry.coverUrl ? el("img", { src: entry.coverUrl, alt: "", loading: "lazy" })
              : el("span", { class: "wl-linkhit-ph", text: MODULE_KANJI[module] }),
            el("span", { class: "wl-linkhit-t", text: entry.title })
          ]));
        });
        if (!rows.length) results.appendChild(el("p", { class: "sub", text: "No matching entries in the " + MODULE_LABEL[module] + " vault." }));
      });
    }
    search.addEventListener("input", KOS.ui.debounce(runSearch, 200));
    paintCurrent();
    return box;
  }

  /* ---------------- item editor modal ---------------- */
  function itemEditor(existing, onSaved) {
    var isNew = !existing;
    var e = existing ? JSON.parse(JSON.stringify(existing)) : { module: "books", status: "wantToBuy" };
    var linkedId = e.linkedEntryId != null ? e.linkedEntryId : null;

    var overlay = el("div", { class: "modal-ov", onclick: function (ev) { if (ev.target === overlay) close(); } });
    function close() { overlay.remove(); }
    function field(label, input) {
      return el("label", { class: "med-field" }, [el("span", { class: "k", text: label }), input]);
    }

    var title = el("input", { type: "text", class: "todo-in", value: e.title && e.title !== "Untitled" ? e.title : "", placeholder: "Title" });
    var moduleSel = el("select", { class: "status-sel" }, MODULES.map(function (m) {
      return el("option", { value: m, text: MODULE_KANJI[m] + " " + MODULE_LABEL[m] });
    }));
    moduleSel.value = normModule(e.module || "books");
    var statusSel = el("select", { class: "status-sel" }, ["wantToBuy", "waitingForRelease", "purchased", "cancelled"].map(function (s) {
      return el("option", { value: s, text: STATUS_LABEL[s] });
    }));
    statusSel.value = STATUSES.indexOf(e.status) !== -1 ? e.status : "wantToBuy";
    var price = el("input", { type: "number", class: "todo-in med-num", min: "0", step: "0.01",
      value: (e.price != null && e.price !== 0) ? String(e.price) : "", placeholder: "0.00" });
    var currency = el("input", { type: "text", class: "todo-in wl-cur", maxlength: "3",
      value: e.currency || budget().currency || "£" });
    var retailer = el("input", { type: "text", class: "todo-in", value: e.retailer || "", placeholder: "Amazon, Steam, local shop…" });
    var retailerUrl = el("input", { type: "url", class: "todo-in", value: e.retailerUrl || "", placeholder: "https://… (manual link)" });
    var release = el("input", { type: "date", class: "todo-in", value: e.releaseDate || "" });
    var coverU = el("input", { type: "url", class: "todo-in", value: e.coverUrl || "", placeholder: "https://… (optional)" });
    var notes = el("textarea", { class: "note-area", rows: 2, placeholder: "Why, edition, condition wanted…" });
    notes.value = e.notes || "";

    var linkHolder = el("div", {});
    function buildLinker() {
      linkHolder.innerHTML = "";
      linkHolder.appendChild(linkPicker(moduleSel.value, linkedId, function (entry) {
        linkedId = entry ? entry.id : null;
        /* borrow the entry's cover/title if the item is otherwise blank */
        if (entry) {
          if (!coverU.value.trim() && entry.coverUrl) coverU.value = entry.coverUrl;
          if (!title.value.trim()) title.value = entry.title;
        }
      }));
    }
    buildLinker();
    moduleSel.addEventListener("change", function () { linkedId = null; buildLinker(); });

    function save() {
      if (!title.value.trim()) { KOS.ui.toast("A title is needed.", true); return; }
      var payload = {
        module: moduleSel.value, title: title.value.trim(),
        price: price.value, currency: currency.value.trim() || "£",
        retailer: retailer.value.trim(), retailerUrl: retailerUrl.value.trim(),
        releaseDate: release.value || null, coverUrl: coverU.value.trim() || null,
        notes: notes.value, linkedEntryId: linkedId, status: statusSel.value
      };
      if (isNew) add(payload);
      else update(e.id, payload);
      KOS.ui.toast(isNew ? "Added to the planner." : "Saved.");
      close();
      onSaved && onSaved();
    }

    var box = el("div", { class: "modal med-modal wl-modal" }, [
      el("div", { class: "modal-h" }, [
        el("b", { text: isNew ? "Add to the planner" : "Edit wishlist item" }),
        el("span", { class: "sub", text: "logistics only — nothing here touches XP, gold or HP" }),
        el("button", { class: "mini-btn", style: "margin-left:auto", text: "✕", "aria-label": "Close", onclick: close })
      ]),
      el("div", { class: "med-form" }, [
        field("Title", title),
        el("div", { class: "med-form-row" }, [
          field("Module", moduleSel),
          field("Status", statusSel),
          field("Price", price),
          field("Currency", currency)
        ]),
        el("div", { class: "med-form-row" }, [
          field("Retailer", retailer),
          field("Retailer link (manual)", retailerUrl)
        ]),
        field("Release date (manual — no automated source exists)", release),
        el("div", { class: "wl-field" }, [
          el("span", { class: "k", text: "Link to a collection entry (optional)" }),
          linkHolder
        ]),
        field("Cover URL", coverU),
        field("Notes", notes)
      ]),
      el("div", { class: "lab-controls med-modal-foot" }, [
        !isNew ? el("button", { class: "btn danger", text: "Delete", onclick: function () {
          if (!confirm("Remove “" + e.title + "” from the planner?")) return;
          remove(e.id); KOS.ui.toast("Removed."); close(); onSaved && onSaved();
        } }) : null,
        el("span", { style: "flex:1" }),
        el("button", { class: "btn", text: "Cancel", onclick: close }),
        el("button", { class: "btn primary", text: isNew ? "Add" : "Save", onclick: save })
      ])
    ]);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    title.focus();
  }

  /* ---------------- the view ---------------- */
  KOS.views.wishlist = function (main) {
    document.getElementById("tree").classList.add("hidden");
    document.getElementById("cols").classList.add("no-tree");

    var w = data();
    var tab = w._tab && ["wantToBuy", "waitingForRelease", "purchased"].indexOf(w._tab) !== -1 ? w._tab : "wantToBuy";
    var selected = {};   // ephemeral checkbox simulation — id -> true

    main.appendChild(el("div", { class: "lab-h" }, [
      el("h1", {}, [el("span", { class: "kanji-inline", text: "円" }), " Purchase & Budget Planner"]),
      el("p", { class: "sub", text: "A wishlist across Books, Visual Novels and Games against one shared monthly budget. Tick items to simulate a purchase — the total and what's left update live; nothing is spent until you mark it Purchased. This is pure logistics: it never earns XP, gold or a streak. Release dates are typed in by hand — no automated source spans books, VNs and games." })
    ]));

    /* ---- budget bar ---- */
    var barWrap = el("div", { class: "wl-budget" });
    main.appendChild(barWrap);

    /* ---- tabs ---- */
    var tabsRow = el("div", { class: "study-tabs wl-tabs", role: "tablist" });
    [["wantToBuy", "Want to buy"], ["waitingForRelease", "Waiting for release"], ["purchased", "Purchased"]].forEach(function (t) {
      tabsRow.appendChild(el("button", { class: "study-tab" + (tab === t[0] ? " active" : ""), role: "tab",
        onclick: function () { w._tab = t[0]; store.save(); KOS.show("wishlist", undefined, { _nav: true }); } }, [
          t[1],
          el("span", { class: "wl-tabcount", text: String(byStatus(t[0]).length) })
        ]));
    });
    main.appendChild(el("div", { class: "med-toolbar wl-toolbar" }, [
      tabsRow,
      el("span", { style: "flex:1" }),
      el("button", { class: "btn", text: "← Collection Matrix", onclick: function () { KOS.show("matrix"); } }),
      el("button", { class: "btn primary", text: "+ Add item", onclick: function () { itemEditor(null, function () { KOS.show("wishlist", undefined, { _nav: true }); }); } })
    ]));

    var listWrap = el("div", { class: "wl-list-wrap" });
    main.appendChild(listWrap);

    var chartsWrap = el("div", {});
    main.appendChild(chartsWrap);

    /* ---- budget bar renderer (recomputed on every simulation change) ---- */
    var limitIn = el("input", { type: "number", class: "todo-in wl-limit", min: "0", step: "1",
      value: w.budget.monthlyLimit ? String(w.budget.monthlyLimit) : "", placeholder: "0" });
    var curIn = el("input", { type: "text", class: "todo-in wl-cur", maxlength: "3", value: w.budget.currency || "£", "aria-label": "Currency" });
    var spentEl = el("b", {});
    var selEl = el("b", {});
    var remainEl = el("b", {});
    var meter = el("span", { class: "wl-meter-fill" });

    function recalc() {
      var limit = w.budget.monthlyLimit || 0;
      var spent = currentMonthSpend();
      var sel = selectedTotal(Object.keys(selected).filter(function (k) { return selected[k]; }).map(Number));
      var rem = remaining(limit, spent, sel);
      spentEl.textContent = money(spent);
      selEl.textContent = money(sel);
      remainEl.textContent = money(rem);
      remainEl.className = rem < 0 ? "wl-over" : "";
      var used = limit ? Math.min(100, Math.round(100 * (spent + sel) / limit)) : 0;
      meter.style.width = used + "%";
      meter.className = "wl-meter-fill" + (rem < 0 ? " over" : "");
    }
    limitIn.addEventListener("change", function () { setBudget({ monthlyLimit: limitIn.value }); recalc(); });
    curIn.addEventListener("change", function () { setBudget({ currency: curIn.value }); KOS.show("wishlist", undefined, { _nav: true }); });

    barWrap.appendChild(el("div", { class: "wl-budget-head" }, [
      el("label", { class: "wl-budget-limit" }, [
        el("span", { class: "k", text: "Monthly budget" }), curIn, limitIn
      ]),
      el("div", { class: "wl-budget-nums" }, [
        el("div", { class: "wl-bn" }, [el("span", { class: "k", text: "Spent this month" }), spentEl]),
        el("div", { class: "wl-bn" }, [el("span", { class: "k", text: "Selected (sim)" }), selEl]),
        el("div", { class: "wl-bn wl-bn-rem" }, [el("span", { class: "k", text: "Remaining" }), remainEl])
      ])
    ]));
    barWrap.appendChild(el("div", { class: "wl-meter" }, [meter]));
    barWrap.appendChild(el("p", { class: "sub wl-budget-note", text: "One shared pool — Books, VNs and games all draw from the same limit. Ticking below is a simulation; “Mark purchased” is what actually records a spend." }));

    /* ---- render the active tab ---- */
    function renderList() {
      listWrap.innerHTML = "";
      var rows = byStatus(tab);
      if (!rows.length) {
        listWrap.appendChild(el("div", { class: "med-empty" }, [
          el("p", { class: "fc-empty", text: tab === "purchased"
            ? "Nothing marked purchased yet — buys you record land here and in the spend history below."
            : tab === "waitingForRelease"
            ? "Nothing on pre-order watch. Add an item and set it to “Waiting for release”, with a manual release date, to see the countdown."
            : "Your wishlist is empty. Add something you're eyeing across Books, VNs or Games." }),
          el("div", { class: "lab-controls", style: "justify-content:center" }, [
            el("button", { class: "btn primary", text: "+ Add item", onclick: function () { itemEditor(null, function () { KOS.show("wishlist", undefined, { _nav: true }); }); } })
          ])
        ]));
        return;
      }

      /* next-to-drop hero on the waiting tab */
      if (tab === "waitingForRelease") {
        var hero = nextToDrop();
        if (hero) listWrap.appendChild(dropHero(hero));
      }

      var list = el("div", { class: "wl-list" });
      rows.forEach(function (it) { list.appendChild(itemRow(it)); });
      listWrap.appendChild(list);
      if (tab !== "purchased") enableDrag(list);
      recalc();
    }

    function dropHero(it) {
      var d = daysUntil(it.releaseDate);
      return el("div", { class: "wl-hero" + (d != null && d >= 0 && d <= 7 ? " imminent" : ""), style: "--accent:" + MODULE_COLOR[it.module] }, [
        el("div", { class: "wl-hero-badge", text: "◆ Next to drop" }),
        it.coverUrl ? el("img", { class: "wl-hero-cover", src: it.coverUrl, alt: "", loading: "lazy" })
          : el("span", { class: "wl-hero-ph", text: MODULE_KANJI[it.module] }),
        el("div", { class: "wl-hero-body" }, [
          el("div", { class: "wl-hero-count", text: d == null ? "—" : d === 0 ? "Today" : d > 0 ? d + (d === 1 ? " day" : " days") : "Out now" }),
          el("h3", { class: "wl-hero-title", text: it.title }),
          el("p", { class: "sub", text: MODULE_LABEL[it.module] + " · " + releaseText(it.releaseDate) + (it.price ? " · " + money(it.price, it.currency) : "") }),
          el("div", { class: "lab-controls" }, [
            el("button", { class: "btn primary", text: "Mark purchased", onclick: function () { doPurchase(it); } }),
            el("button", { class: "btn", text: "Edit", onclick: function () { itemEditor(it, renderList); } })
          ])
        ])
      ]);
    }

    function itemRow(it) {
      var draggable = tab !== "purchased";
      var checkbox = null;
      if (tab === "wantToBuy") {
        checkbox = el("input", { type: "checkbox", class: "wl-check", "aria-label": "Simulate buying " + it.title });
        checkbox.checked = !!selected[it.id];
        checkbox.addEventListener("change", function () { selected[it.id] = checkbox.checked; recalc(); });
      }
      var linkChip = it.linkedEntryId != null
        ? el("button", { class: "wl-chip wl-linked", title: "Part of your collection — open the linked entry",
            text: "⇄ in collection", onclick: function () { openLinkedEntry(it.linkedEntryId, renderList); } })
        : null;
      var retailChip = it.retailerUrl
        ? el("a", { class: "wl-chip wl-retail", href: it.retailerUrl, target: "_blank", rel: "noopener noreferrer",
            text: (it.retailer || "store") + " ↗", onclick: function (ev) { ev.stopPropagation(); } })
        : (it.retailer ? el("span", { class: "wl-chip", text: it.retailer }) : null);
      var relChip = it.releaseDate ? el("span", { class: "wl-chip wl-rel", text: "◷ " + releaseText(it.releaseDate) }) : null;

      var actions = el("div", { class: "wl-row-actions" }, [
        tab !== "purchased" ? el("button", { class: "mini-btn", text: "Purchased", title: "Record this as bought — archives it into the spend history",
          onclick: function (ev) { ev.stopPropagation(); doPurchase(it); } }) : null,
        tab === "waitingForRelease" ? el("button", { class: "mini-btn", text: "→ Want to buy", title: "It's out — move it to the buy list",
          onclick: function (ev) { ev.stopPropagation(); setStatus(it.id, "wantToBuy"); renderList(); } }) : null,
        el("button", { class: "mini-btn", text: "Edit", onclick: function (ev) { ev.stopPropagation(); itemEditor(it, renderList); } })
      ]);

      var row = el("div", { class: "wl-row" + (draggable ? " draggable" : ""), "data-id": String(it.id),
        draggable: draggable ? "true" : null, style: "--accent:" + MODULE_COLOR[it.module] }, [
        draggable ? el("span", { class: "wl-grip", "aria-hidden": "true", text: "⋮⋮" }) : null,
        checkbox,
        it.coverUrl ? el("img", { class: "wl-cover", src: it.coverUrl, alt: "", loading: "lazy" })
          : el("span", { class: "wl-cover wl-cover-ph", text: MODULE_KANJI[it.module] }),
        el("div", { class: "wl-row-main" }, [
          el("div", { class: "wl-row-title", text: it.title, title: it.title }),
          el("div", { class: "wl-row-meta" }, [
            el("span", { class: "wl-modtag", style: "--accent:" + MODULE_COLOR[it.module], text: MODULE_KANJI[it.module] + " " + MODULE_LABEL[it.module] }),
            relChip, retailChip, linkChip,
            it.status === "purchased" && it.purchasedAt ? el("span", { class: "wl-chip", text: "bought " + monthKey(it.purchasedAt) }) : null
          ])
        ]),
        el("div", { class: "wl-row-price", text: it.price ? money(it.price, it.currency) : "—" }),
        actions
      ]);
      return row;
    }

    function doPurchase(it) {
      if (it.price && (it.currency || "£") !== (w.budget.currency || "£")) {
        /* different currency from the pool — still archives, just flag it */
        KOS.ui.toast("Recorded (note: item currency differs from the budget currency).");
      }
      markPurchased(it.id);
      delete selected[it.id];
      renderList();
      renderCharts();
      KOS.ui.toast("Marked purchased — logged to " + monthKey() + " spend.");
    }

    /* HTML5 drag reordering within the active tab (List only) */
    function enableDrag(list) {
      var dragEl = null;
      list.querySelectorAll(".wl-row.draggable").forEach(function (row) {
        row.addEventListener("dragstart", function (ev) {
          dragEl = row; row.classList.add("dragging");
          ev.dataTransfer.effectAllowed = "move";
          try { ev.dataTransfer.setData("text/plain", row.dataset.id); } catch (e) {}
        });
        row.addEventListener("dragend", function () { row.classList.remove("dragging"); dragEl = null; commitOrder(list); });
        row.addEventListener("dragover", function (ev) {
          ev.preventDefault();
          if (!dragEl || dragEl === row) return;
          var rect = row.getBoundingClientRect();
          var after = (ev.clientY - rect.top) / rect.height > 0.5;
          list.insertBefore(dragEl, after ? row.nextSibling : row);
        });
      });
    }
    function commitOrder(list) {
      var ids = Array.prototype.map.call(list.querySelectorAll(".wl-row"), function (r) { return Number(r.dataset.id); });
      reorder(tab, ids);
    }

    /* ---- charts (shared KOS.charts helpers, nothing new) ---- */
    function renderCharts() {
      chartsWrap.innerHTML = "";
      var byMonth = spendByMonth();
      var byMod = spendByModule();
      var spentAll = totalSpent();
      if (!spentAll) {
        chartsWrap.appendChild(el("p", { class: "sub wl-nochart", text: "Spend charts appear once you've marked something purchased." }));
        return;
      }
      chartsWrap.appendChild(el("h3", { class: "n-h", text: "Spending" }));
      var grid = el("div", { class: "cs-grid" });
      grid.appendChild(KOS.charts.chartCard("Spend over time", money(spentAll) + " across " + byMonth.length + (byMonth.length === 1 ? " month" : " months"),
        KOS.charts.barChart(byMonth.map(function (m) {
          return { label: m.month.slice(2), value: Math.round(m.total), hint: m.month + ": " + money(m.total) };
        }), { color: "#ecc15a" })));
      var modBars = MODULES.map(function (m) {
        return { label: MODULE_LABEL[m], value: Math.round(byMod[m] || 0), color: MODULE_COLOR[m],
          hint: MODULE_LABEL[m] + ": " + money(byMod[m] || 0) };
      }).filter(function (b) { return b.value; });
      if (modBars.length) {
        grid.appendChild(KOS.charts.chartCard("By module", "how the shared pool split — books vs VNs vs games",
          KOS.charts.barChart(modBars)));
      }
      chartsWrap.appendChild(grid);
    }

    renderList();
    renderCharts();
  };

  /* ---------------- reverse surfacing: vault editor "on your wishlist" ----
     a KOS.mediaEditorHooks entry (the dispatcher in core/media.js runs
     hooks after the editor's modal is in the DOM, passing the overlay
     element directly — no DOM probing). When the opened entry is on the
     wishlist, prepend a banner into the editor form.                      */
  KOS.mediaEditorHooks.push(function (entry, overlay) {
    if (!entry || entry.id == null || !overlay) return;
    var linked = forEntry(entry.id);
    if (!linked.length) return;
    var form = overlay.querySelector(".med-form");
    if (!form) return;
    form.insertBefore(wishlistBanner(linked, overlay), form.firstChild);
  });
  function wishlistBanner(linked, overlay) {
    var banner = el("div", { class: "wl-onlist" });
    banner.appendChild(el("span", { class: "wl-onlist-h", text: "◆ On your wishlist" }));
    linked.forEach(function (it) {
      banner.appendChild(el("span", { class: "wl-chip wl-onlist-chip",
        text: it.title + " · " + STATUS_LABEL[it.status] + (it.price ? " · " + money(it.price, it.currency) : "") }));
    });
    banner.appendChild(el("button", { class: "mini-btn", text: "Open planner →", onclick: function () {
      overlay.remove();
      KOS.show("wishlist");
    } }));
    return banner;
  }
})();
