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
  var MODULE_COLOR = { books: "#F2C46D", vn: "#c77bf2", game: "#35D7FF" };

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
  /* view prefs live under state.media like every other Matrix view — NOT on
     the data object. Migration: pre-refactor saves kept the active tab as a
     stray `_tab` key on state.wishlist; fold it in and drop it. */
  var TABS = ["wantToBuy", "waitingForRelease", "purchased"];
  var SORTS = ["priority", "release", "price", "recent"];
  function prefs() {
    var m = store.state.media = store.state.media || {};
    m.wishlist = m.wishlist || { tab: "wantToBuy", sort: "priority" };
    var w = store.state.wishlist;
    if (w && w._tab) {
      if (TABS.indexOf(w._tab) !== -1) m.wishlist.tab = w._tab;
      delete w._tab;
    }
    if (TABS.indexOf(m.wishlist.tab) === -1) m.wishlist.tab = "wantToBuy";
    if (SORTS.indexOf(m.wishlist.sort) === -1) m.wishlist.sort = "priority";
    return m.wishlist;
  }
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
      coverCrop: KOS.imageCrop.normalise(d.coverCrop),
      price: cleanPrice(d.price),
      currency: d.currency || w.budget.currency || "£",
      author: String(d.author || "").trim(),
      retailer: String(d.retailer || "").trim(),
      retailerUrl: String(d.retailerUrl || "").trim(),
      priority: nextPriority(status),
      releaseDate: d.releaseDate || null,
      status: status,
      linkedEntryId: d.linkedEntryId != null ? d.linkedEntryId : null,
      notes: String(d.notes || ""),
      addedAt: now(),
      purchasedAt: null,
      /* A book purchase can identify its physical copy precisely. Earlier
         saves omit this harmlessly; 1 is the safe default for a standalone
         title, while an existing series can be set explicitly in the editor. */
      physicalVolumeNumber: d.physicalVolumeNumber != null && d.physicalVolumeNumber !== ""
        ? Math.max(1, Math.floor(parseFloat(d.physicalVolumeNumber) || 1)) : 1,
      /* A handoff marker prevents a repeated purchase click or retry from
         duplicating a physical volume. These are planner-local pointers;
         `linkedEntryId` remains the public collection link. */
      collectionAppliedAt: d.collectionAppliedAt || null,
      collectionHandoffError: d.collectionHandoffError || null
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
      if (k === "physicalVolumeNumber") {
        it.physicalVolumeNumber = patch.physicalVolumeNumber != null && patch.physicalVolumeNumber !== ""
          ? Math.max(1, Math.floor(parseFloat(patch.physicalVolumeNumber) || 1)) : 1;
        return;
      }
      if (k === "coverCrop") { it.coverCrop = KOS.imageCrop.normalise(patch.coverCrop); return; }
      if (k === "status") return;   // status transitions go through setStatus
      it[k] = patch[k];
    });
    if (patch && patch.status && patch.status !== wasStatus) {
      setStatus(id, patch.status);   // saves
    } else {
      /* Keep an already-confirmed purchase's historical snapshot in step
         with safe edits such as title, module, price or creator. */
      if (it.status === "purchased") archive(it, it.purchasedAt || now());
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
    if (it.status === "purchased") {
      /* The planner's archived record follows a reversal, but a local
         Collection handoff remains intentionally non-destructive. */
      unarchive(id);
      it.purchasedAt = null;
    }
    it.status = status;
    it.priority = nextPriority(status);
    store.save();
    return it;
  }

  function remove(id) {
    var w = data();
    /* A planner row and its archived actual-spend snapshot are one purchase
       record. Removing the row must not leave a phantom charge behind. This
       deliberately does not remove any already-created Collection entry. */
    unarchive(id);
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
  function recalcBucket(bucket) {
    bucket.spent = (bucket.items || []).reduce(function (a, x) { return a + (x.price || 0); }, 0);
  }
  /* Remove every historical copy for an item. The normal path has exactly one,
     but scanning all buckets repairs old manually-edited saves and lets an
     archived purchase be corrected or reverted without leaving phantom spend. */
  function unarchive(id) {
    var w = data();
    w.budget.history.forEach(function (bucket) {
      bucket.items = (bucket.items || []).filter(function (x) { return x.id !== id; });
      recalcBucket(bucket);
    });
    w.budget.history = w.budget.history.filter(function (bucket) { return (bucket.items || []).length; });
  }
  function archive(it, t) {
    var w = data();
    unarchive(it.id);
    var mk = monthKey(t);
    var bucket = w.budget.history.find(function (h) { return h.month === mk; });
    if (!bucket) { bucket = { month: mk, spent: 0, items: [] }; w.budget.history.push(bucket); }
    bucket.items.push({ id: it.id, title: it.title, module: it.module,
      price: it.price, currency: it.currency, purchasedAt: t });
    recalcBucket(bucket);
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
    /* There is no FX conversion engine. Once any value has been recorded,
       changing the shared currency would only relabel amounts, so the UI and
       API retain the established unit instead of silently corrupting totals. */
    if (patch.currency != null && canChangeCurrency()) b.currency = String(patch.currency).slice(0, 3) || "£";
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
      var it = get(id); return a + (it && it.status === "wantToBuy" ? (it.price || 0) : 0);
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
  function purchaseCount() {
    return budget().history.reduce(function (n, h) { return n + ((h.items || []).length); }, 0);
  }
  function canChangeCurrency() {
    return purchaseCount() === 0 && !items().some(function (it) { return (it.price || 0) > 0; });
  }
  /* Everything still waiting to be bought is a commitment against future
     allowance, but never an actual charge. Cancelled and purchased records
     intentionally stay out of this number. */
  function committedTotal() {
    return items().filter(function (it) {
      return it.status === "wantToBuy" || it.status === "waitingForRelease";
    }).reduce(function (sum, it) { return sum + (it.price || 0); }, 0);
  }

  function dayKey(ts) {
    if (ts == null) return KOS.srs.todayISO();
    var d = new Date(ts);
    return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
  }
  function shiftDay(iso, amount) {
    var d = new Date(iso + "T12:00:00");
    d.setDate(d.getDate() + amount);
    return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
  }
  /* Release-day behaviour is deliberately calendar-based: a 15 July item
     remains the featured reminder on the 15th and the whole 16th, moving to
     Want to Buy only when the 17th begins. Return moved records for a useful
     UI toast, but retain the existing synchronous planner data contract. */
  function advanceReleasedItems(ts) {
    var today = dayKey(ts), cutoff = shiftDay(today, -1), moved = [];
    byStatus("waitingForRelease").forEach(function (it) {
      if (it.releaseDate && it.releaseDate < cutoff) {
        it.status = "wantToBuy";
        it.priority = nextPriority("wantToBuy");
        moved.push(it);
      }
    });
    if (moved.length) store.save();
    return moved;
  }
  function rotateSameDay(candidates, ts) {
    if (!candidates.length) return null;
    if (candidates.length === 1) return candidates[0];
    /* A deterministic hourly rotation works after reload and does not add a
       cosmetic state field to backups. */
    var slot = Math.floor((ts == null ? now() : ts) / 3600000);
    return candidates[slot % candidates.length];
  }
  /* The screen's actual feature decision. `nextToDrop` remains exported with
     its historic nearest-upcoming semantics for callers that only need a date
     lookup; this richer helper owns visual release reminders and fallbacks. */
  function featuredItem(ts) {
    var today = dayKey(ts);
    var waiting = byStatus("waitingForRelease").filter(function (it) { return it.releaseDate; });
    var valid = waiting.filter(function (it) { return it.releaseDate >= shiftDay(today, -1); });
    if (valid.length) {
      valid.sort(function (a, b) {
        return a.releaseDate < b.releaseDate ? -1 : a.releaseDate > b.releaseDate ? 1
          : (a.priority || 0) - (b.priority || 0) || a.id - b.id;
      });
      var date = valid[0].releaseDate;
      var sameDate = valid.filter(function (it) { return it.releaseDate === date; });
      return {
        item: rotateSameDay(sameDate, ts),
        kind: date < today ? "releaseReminder" : date === today ? "releaseDay" : "nextDrop"
      };
    }
    var undated = byStatus("waitingForRelease").filter(function (it) { return !it.releaseDate; });
    if (undated.length) return { item: undated[0], kind: "awaitingDate" };
    var priorityPick = byStatus("wantToBuy")[0];
    return priorityPick ? { item: priorityPick, kind: "priorityPick" } : null;
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

  /* ---------------- Collection handoff ----------------
     A wishlist record remains the source of purchase intent. The Collection
     entry is only created or changed through a conscious local handoff — no
     title matching, provider sync, network request or Governor activity.
     Books gain an owned physical-volume record once purchased; VNs and games
     are created as planned library entries. Existing collection progress is
     never downgraded. */
  function purchaseDate(ts) { return dayKey(ts == null ? now() : ts); }
  function collectionAvailable() {
    return !!(KOS.mediadb && typeof KOS.mediadb.add === "function" &&
      typeof KOS.mediadb.get === "function" && typeof KOS.mediadb.put === "function");
  }
  function collectionDraft(it, physical) {
    var rec = {
      module: it.module,
      title: it.title,
      status: "planned",
      syncSource: "manual",
      coverUrl: it.coverUrl || null,
      coverCrop: it.coverCrop || null,
      author: it.author || "",
      notes: it.notes || ""
    };
    if (it.module === "books" && physical) {
      rec.ownership = "physical";
      rec.physical = { owned: true, volumes: [KOS.mediadb.normVolume({
        number: it.physicalVolumeNumber || 1,
        condition: "good",
        purchaseDate: purchaseDate(it.purchasedAt),
        price: it.price || 0,
        coverUrl: it.coverUrl || null,
        coverCrop: it.coverCrop || null
      })] };
    }
    return rec;
  }
  function rememberCollectionLink(it, entryId, applied) {
    it.linkedEntryId = entryId;
    if (applied) it.collectionAppliedAt = now();
    it.collectionHandoffError = null;
    store.save();
  }
  function handoffError(it, err) {
    if (it) {
      it.collectionHandoffError = String((err && err.message) || err || "Could not update Collection.");
      store.save();
    }
  }
  /* Explicitly create the linked library record before purchase when the
     user wants it on their Collection roadmap. Books remain digital/planned
     until a confirmed purchase later adds their physical volume. */
  function createCollectionEntry(id, done) {
    var it = get(id);
    if (!it) { done && done(new Error("Wishlist item not found.")); return; }
    if (!collectionAvailable()) { done && done(new Error("Collection storage is unavailable.")); return; }
    if (it.linkedEntryId != null) {
      KOS.mediadb.get(it.linkedEntryId, function (err, entry) {
        if (err || !entry) { done && done(err || new Error("The linked collection entry is missing.")); return; }
        done && done(null, entry, true);
      });
      return;
    }
    KOS.mediadb.add(collectionDraft(it, false), function (err2, entry2) {
      if (err2 || !entry2) {
        handoffError(it, err2 || new Error("Could not create the collection entry."));
        done && done(err2 || new Error("Could not create the collection entry."));
        return;
      }
      rememberCollectionLink(it, entry2.id, false);
      done && done(null, entry2, false);
    });
  }
  function applyBookPurchase(it, entry) {
    var volumeNo = it.physicalVolumeNumber || 1;
    entry.physical = entry.physical || { owned: true, volumes: [] };
    entry.physical.owned = true;
    entry.ownership = "physical";
    var exists = (entry.physical.volumes || []).some(function (v) { return Number(v.number) === Number(volumeNo); });
    if (exists) return { entry: entry, changed: false, duplicate: true };
    entry.physical.volumes.push(KOS.mediadb.normVolume({
      number: volumeNo,
      condition: "good",
      purchaseDate: purchaseDate(it.purchasedAt),
      price: it.price || 0,
      coverUrl: it.coverUrl || null,
      coverCrop: it.coverCrop || null
    }));
    return { entry: entry, changed: true, duplicate: false };
  }
  /* Actual purchase first archives locally. This optional follow-up materialises
     that truth in Collection without altering the synchronous `markPurchased`
     API. A missing link creates a deliberately new manual entry — NEVER a
     fuzzy title match — and an existing VN/game status is respected. */
  function handoffPurchased(id, done) {
    var it = get(id);
    if (!it || it.status !== "purchased") { done && done(new Error("Mark the item purchased first.")); return; }
    if (!collectionAvailable()) { done && done(new Error("Collection storage is unavailable.")); return; }
    if (it.collectionAppliedAt) { done && done(null, null, { alreadyApplied: true }); return; }
    function finish(err, entry, detail) {
      if (err) handoffError(it, err);
      else if (entry) rememberCollectionLink(it, entry.id, true);
      done && done(err || null, entry || null, detail || {});
    }
    function updateExisting(entry) {
      if (entry.module !== it.module) {
        finish(new Error("The linked Collection entry is a different media type."));
        return;
      }
      if (it.module !== "books") {
        /* A collection item can already be in progress/completed. Planning
           must never erase that history, so no status write is needed. */
        finish(null, entry, { preservedStatus: true });
        return;
      }
      var applied = applyBookPurchase(it, entry);
      if (!applied.changed) { finish(null, entry, { duplicateVolume: true }); return; }
      KOS.mediadb.put(entry, function (err, saved) { finish(err, saved || entry, { physicalVolume: true }); });
    }
    if (it.linkedEntryId != null) {
      KOS.mediadb.get(it.linkedEntryId, function (err, entry) {
        if (err || !entry) { finish(err || new Error("The linked Collection entry is missing.")); return; }
        updateExisting(entry);
      });
      return;
    }
    var draft = collectionDraft(it, it.module === "books");
    KOS.mediadb.add(draft, function (err2, entry2) {
      finish(err2 || null, entry2 || null,
        it.module === "books" ? { physicalVolume: true, created: true } : { planned: true, created: true });
    });
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
    totalSpent: totalSpent, purchaseCount: purchaseCount, committedTotal: committedTotal,
    nextToDrop: nextToDrop, advanceReleasedItems: advanceReleasedItems,
    featuredItem: featuredItem, createCollectionEntry: createCollectionEntry,
    handoffPurchased: handoffPurchased
  };

  /* ---------------- little shared bits ---------------- */
  function money(n, currency) {
    var v = (typeof n === "number" && !isNaN(n)) ? n : 0;
    var cur = String(currency || budget().currency || "£").trim() || "£";
    return (/^[£$€¥]$/.test(cur) ? cur : cur + " ") + v.toFixed(2);
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
            entry.coverUrl ? el("span", { class: "wl-linkhit-cover" }, [
              KOS.imageCrop.image(entry.coverUrl, { alt: "", loading: "lazy" }, entry.coverCrop)
            ])
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
    var e = existing ? JSON.parse(JSON.stringify(existing)) : { module: "books", status: "wantToBuy", physicalVolumeNumber: 1 };
    var linkedId = e.linkedEntryId != null ? e.linkedEntryId : null;

    var overlay = KOS.medview.modalOverlay();   // click-outside + Esc close
    var close = overlay.close;
    var field = KOS.medview.field;

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
    var volumeNumber = el("input", { type: "number", class: "todo-in med-num", min: "1", step: "1",
      value: String(e.physicalVolumeNumber || 1), placeholder: "1" });
    var author = el("input", { type: "text", class: "todo-in", value: e.author || "", placeholder: "Author / creator / studio" });
    var retailer = el("input", { type: "text", class: "todo-in", value: e.retailer || "", placeholder: "Amazon, Steam, local shop…" });
    var retailerUrl = el("input", { type: "url", class: "todo-in", value: e.retailerUrl || "", placeholder: "https://… (manual link)" });
    var release = el("input", { type: "date", class: "todo-in", value: e.releaseDate || "" });
    var coverU = el("input", { type: "url", class: "todo-in", value: e.coverUrl || "", placeholder: "https://… (optional)" });
    var coverPosition = KOS.medview.coverPositionControl(e, coverU);
    var notes = el("textarea", { class: "note-area", rows: 2, placeholder: "Why, edition, condition wanted…" });
    notes.value = e.notes || "";
    var volumeField = field("Physical volume / edition #", volumeNumber);
    function syncModuleFields() {
      volumeField.style.display = moduleSel.value === "books" ? "" : "none";
    }

    var linkHolder = el("div", {});
    function buildLinker() {
      linkHolder.innerHTML = "";
      linkHolder.appendChild(linkPicker(moduleSel.value, linkedId, function (entry) {
        linkedId = entry ? entry.id : null;
        /* borrow the entry's cover/title if the item is otherwise blank */
        if (entry) {
          if (!coverU.value.trim() && entry.coverUrl) coverPosition.set(entry.coverUrl, entry.coverCrop);
          if (!title.value.trim()) title.value = entry.title;
        }
      }));
    }
    buildLinker();
    syncModuleFields();
    moduleSel.addEventListener("change", function () { linkedId = null; buildLinker(); syncModuleFields(); });

    function save() {
      if (!title.value.trim()) { KOS.ui.toast("A title is needed.", true); return; }
      var payload = {
        module: moduleSel.value, title: title.value.trim(),
        price: price.value, author: author.value.trim(),
        retailer: retailer.value.trim(), retailerUrl: retailerUrl.value.trim(),
        releaseDate: release.value || null, coverUrl: coverPosition.sourceFor(),
        coverCrop: coverPosition.cropFor(coverPosition.sourceFor()),
        notes: notes.value, linkedEntryId: linkedId, status: statusSel.value,
        physicalVolumeNumber: moduleSel.value === "books" ? volumeNumber.value : null
      };
      var saved = isNew ? add(payload) : update(e.id, payload);
      KOS.ui.toast(isNew ? "Added to the planner." : "Saved.");
      close();
      onSaved && onSaved();
      if (saved && saved.status === "purchased") handoffPurchased(saved.id, function (err) {
        if (err) KOS.ui.toast("Purchase saved; its Collection handoff needs attention.", true);
        else { onSaved && onSaved(); KOS.ui.toast("Collection handoff completed."); }
      });
    }

    var box = el("div", { class: "modal med-modal wl-modal" }, [
      el("div", { class: "modal-h" }, [
        el("b", { text: isNew ? "Add to the planner" : "Edit wishlist item" }),
        el("span", { class: "sub", text: "logistics only — nothing here touches XP, gold or HP" }),
        el("button", { class: "mini-btn", style: "margin-left:auto", text: "✕", "aria-label": "Close", onclick: close })
      ]),
      el("div", { class: "med-form" }, [
        el("div", { class: "med-form-row" }, [
          field("Title", title, "bk-grow"),
          field("Cover URL", el("div", { class: "image-field" }, [coverU, coverPosition.node]), "bk-grow")
        ]),
        el("div", { class: "med-form-row" }, [
          field("Module", moduleSel),
          field("Status", statusSel),
          field("Price (" + (budget().currency || "£") + ")", price)
        ]),
        el("div", { class: "med-form-row" }, [
          field("Author / creator", author),
          field("Retailer", retailer),
          field("Retailer link", retailerUrl)
        ]),
        el("div", { class: "med-form-row" }, [
          field("Release date (manual — no automated source exists)", release),
          volumeField
        ]),
        el("div", { class: "wl-field" }, [
          el("span", { class: "k", text: "Link to a collection entry (optional)" }),
          linkHolder,
          el("p", { class: "sub wl-collection-guidance", text: "Confirmed Book purchases add this volume to the Physical Vault. Visual Novels and Games become planned Collection entries. Existing progress is never overwritten." })
        ]),
        field("Notes", notes, "wl-notes-full")
      ]),
      el("div", { class: "lab-controls med-modal-foot" }, [
        !isNew ? el("button", { class: "btn danger", text: "Delete", onclick: function () {
          KOS.ui.confirm({ title: "Remove from planner?", body: "“" + e.title + "” will be removed.", danger: true, confirm: "Remove" }, function () {
            remove(e.id); KOS.ui.toast("Removed."); close(); onSaved && onSaved();
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
  }

  /* ---------------- the view ---------------- */
  KOS.views.wishlist = function (main) {
    document.getElementById("tree").classList.add("hidden");
    document.getElementById("cols").classList.add("no-tree");

    var w = data();
    var pref = prefs();
    var tab = pref.tab;
    var selected = {};   // ephemeral checkbox simulation — id -> true
    var heroRotationTimer = null;

    main.appendChild(KOS.collectionCrumbs("Planner", "Budget Planner"));
    var workspaceTabs = KOS.collectionWorkspaceTabs("planner", "wishlist");
    workspaceTabs.classList.add("profile-workspace-tabs");

    main.appendChild(el("div", { class: "dash-head" }, [
      el("div", { class: "dh-txt" }, [
        el("span", { class: "dh-kicker", text: "円 · The allowance" }),
        el("h1", { text: "Budget Planner" }),
        el("div", { class: "dh-sub" }, [
          el("span", { class: "board", text: "One wishlist, one monthly pool. Tick items to try a purchase on paper — nothing spends until you say so." })
        ])
      ]),
      workspaceTabs
    ]));

    /* ---- top row: release desk + operational allowance ledger ---- */
    var top = el("div", { class: "wl-top" });
    main.appendChild(top);
    var heroWrap = el("div", { class: "wl-hero-wrap" });
    top.appendChild(heroWrap);
    var barWrap = el("div", { class: "wl-budget" });
    top.appendChild(barWrap);

    /* ---- queue controls ---- */
    var tabsRow = el("div", { class: "study-tabs wl-tabs", role: "tablist", "aria-label": "Purchase queue" });
    var queryIn = el("input", { type: "search", class: "todo-in wl-search", placeholder: "Search this queue…", "aria-label": "Search purchase queue" });
    var sortSel = el("select", { class: "status-sel wl-sort", "aria-label": "Sort purchase queue" }, [
      el("option", { value: "priority", text: "Priority order" }),
      el("option", { value: "release", text: "Release date" }),
      el("option", { value: "price", text: "Price" }),
      el("option", { value: "recent", text: "Recently added" })
    ]);
    sortSel.value = pref.sort;
    var toolbar = el("div", { class: "med-toolbar wl-toolbar" }, [
      tabsRow,
      el("div", { class: "wl-toolbar-tools" }, [queryIn, sortSel]),
      el("button", { class: "btn primary", text: "+ Add item", onclick: function () { itemEditor(null, renderPlanner); } })
    ]);
    main.appendChild(toolbar);

    var listWrap = el("div", { class: "wl-list-wrap" });
    main.appendChild(listWrap);
    var chartsWrap = el("section", { class: "wl-history", "aria-labelledby": "wl-history-title" });
    main.appendChild(chartsWrap);

    queryIn.addEventListener("input", function () { renderList(); });
    sortSel.addEventListener("change", function () {
      pref.sort = sortSel.value;
      store.save();
      renderList();
    });

    /* ---- allowance ledger — actual spend and a temporary scenario stay
       visibly separate. The numeric budget editor intentionally lives in a
       modal so this operational panel reads as a decision aid, not a form. */
    function selectedIds() {
      return Object.keys(selected).filter(function (k) { return selected[k]; }).map(Number);
    }
    function pruneSelection() {
      Object.keys(selected).forEach(function (id) {
        var it = get(Number(id));
        if (!it || it.status !== "wantToBuy") delete selected[id];
      });
    }
    function ledgerLine(label, value, detail, tone) {
      return el("div", { class: "wl-ledger-line" + (tone ? " " + tone : "") }, [
        el("div", { class: "wl-ledger-copy" }, [
          el("span", { class: "wl-ledger-label", text: label }),
          el("span", { class: "wl-ledger-detail", text: detail })
        ]),
        el("b", { text: value })
      ]);
    }
    function renderBudget() {
      w = data();
      barWrap.innerHTML = "";
      var limit = w.budget.monthlyLimit || 0;
      var spent = currentMonthSpend();
      var committed = committedTotal();
      var selectedNow = selectedTotal(selectedIds());
      var rem = remaining(limit, spent, selectedNow);
      var used = limit ? Math.min(100, Math.round(100 * (spent + selectedNow) / limit)) : 0;
      var month = monthKey();
      var remainingText = limit ? money(rem) : "Set allowance";
      var remainingClass = limit && rem < 0 ? "wl-over" : "";

      barWrap.appendChild(el("div", { class: "wl-budget-head" }, [
        el("div", {}, [
          el("span", { class: "wl-sum-h", text: "Allowance ledger" }),
          el("h2", { class: "wl-budget-title", text: "Monthly budget" })
        ]),
        el("button", { class: "btn subtle wl-budget-edit", text: "Edit monthly budget", onclick: editBudget })
      ]));
      barWrap.appendChild(el("div", { class: "wl-allowance-main" }, [
        el("span", { class: "k", text: month + " allowance" }),
        el("b", { text: limit ? money(limit) : "Not set" }),
        el("span", { class: "sub", text: limit ? "A ceiling for this month’s actual purchases." : "Set a ceiling to calculate what remains." })
      ]));
      barWrap.appendChild(el("div", { class: "wl-ledger" }, [
        ledgerLine("Committed / planned", money(committed), "Wishlist value only — not paid yet."),
        ledgerLine("Spent", money(spent), "Actual purchases recorded in " + month + ".", "is-actual"),
        ledgerLine("Remaining", remainingText, limit
          ? "After actual spend" + (selectedNow ? " and the current scenario" : ".")
          : "Set a monthly allowance to calculate this.", "wl-bn-rem " + remainingClass)
      ]));
      if (limit) {
        barWrap.appendChild(el("div", { class: "wl-meter-block" }, [
          el("div", { class: "wl-meter-copy" }, [
            el("span", { text: selectedNow ? "Actual spend + selected scenario" : "Actual spend" }),
            el("b", { text: used + "% allocated" })
          ]),
          el("div", { class: "wl-meter" }, [el("span", { class: "wl-meter-fill" + (rem < 0 ? " over" : ""), style: "width:" + used + "%" })])
        ]));
      }
      barWrap.appendChild(el("div", { class: "wl-selection-note" + (selectedNow ? " has-selection" : "") }, [
        el("span", { class: "wl-selection-dot", "aria-hidden": "true" }),
        el("span", { text: selectedNow
          ? money(selectedNow) + " selected as a temporary purchase scenario — it is not spent."
          : "Select items in Want to buy to test a purchase scenario without changing your history." })
      ]));
      barWrap.appendChild(el("details", { class: "wl-budget-definitions" }, [
        el("summary", { text: "How these figures work" }),
        el("p", { text: "Committed is every active wishlist item. Spent is a finalised purchase. Selected is a temporary checkbox scenario and only affects the remaining estimate." })
      ]));
    }
    function editBudget() {
      var overlay = KOS.medview.modalOverlay(), close = overlay.close;
      var amount = el("input", { type: "number", class: "todo-in", min: "0", step: "1", placeholder: "0.00",
        value: w.budget.monthlyLimit ? String(w.budget.monthlyLimit) : "" });
      var currencyIsEditable = canChangeCurrency();
      var currency = currencyIsEditable
        ? el("input", { type: "text", class: "todo-in wl-cur", maxlength: "3", value: w.budget.currency || "£", "aria-label": "Currency symbol or code" })
        : null;
      var formFields = [KOS.medview.field("Monthly allowance", amount)];
      if (currencyIsEditable) {
        formFields.push(KOS.medview.field("Currency", currency));
      } else {
        formFields.push(el("p", { class: "sub wl-currency-lock", text: "Currency stays " + (w.budget.currency || "£") + " once priced items or purchases exist, so totals are never relabelled without a real conversion." }));
      }
      var box = el("div", { class: "modal med-modal wl-budget-modal" }, [
        el("div", { class: "modal-h" }, [
          el("div", {}, [el("b", { text: "Edit monthly budget" }), el("span", { class: "sub", text: "This changes the allowance, not your recorded purchases." })]),
          el("button", { class: "mini-btn", text: "✕", "aria-label": "Close", onclick: close })
        ]),
        el("div", { class: "med-form" }, formFields),
        el("div", { class: "lab-controls med-modal-foot" }, [
          el("span", { style: "flex:1" }),
          el("button", { class: "btn", text: "Cancel", onclick: close }),
          el("button", { class: "btn primary", text: "Save budget", onclick: function () {
            var patch = { monthlyLimit: amount.value };
            if (currencyIsEditable) patch.currency = currency.value;
            setBudget(patch);
            close(); renderPlanner(); KOS.ui.toast("Monthly allowance updated.");
          } })
        ])
      ]);
      overlay.appendChild(box);
      document.body.appendChild(overlay);
      amount.focus();
    }

    /* ---- render the active tab ---- */
    function renderList() {
      listWrap.innerHTML = "";
      var labels = { wantToBuy: "Want to buy", waitingForRelease: "Waiting for release", purchased: "Purchased history" };
      var allRows = byStatus(tab);
      var needle = queryIn.value.trim().toLowerCase();
      var rows = allRows.filter(function (it) {
        return !needle || [it.title, it.author, it.retailer, MODULE_LABEL[it.module]].join(" ").toLowerCase().indexOf(needle) !== -1;
      });
      if (pref.sort === "release") {
        rows.sort(function (a, b) { return (a.releaseDate || "9999-12-31") < (b.releaseDate || "9999-12-31") ? -1 : 1; });
      } else if (pref.sort === "price") {
        rows.sort(function (a, b) { return (b.price || 0) - (a.price || 0) || a.id - b.id; });
      } else if (pref.sort === "recent") {
        rows.sort(function (a, b) { return (b.addedAt || 0) - (a.addedAt || 0); });
      }
      var queue = el("section", { class: "wl-queue", "aria-labelledby": "wl-queue-title" });
      queue.appendChild(el("div", { class: "wl-queue-head" }, [
        el("div", {}, [
          el("span", { class: "wl-sum-h", text: "Purchase queue" }),
          el("h2", { id: "wl-queue-title", text: labels[tab] })
        ]),
        el("span", { class: "wl-queue-count", text: rows.length + (rows.length === 1 ? " item" : " items") + (needle ? " matching" : "") })
      ]));
      if (!rows.length) {
        queue.appendChild(el("div", { class: "wl-queue-empty" }, [
          el("span", { class: "wl-empty-mark", text: tab === "purchased" ? "◌" : "＋" }),
          el("div", {}, [
            el("b", { text: needle ? "No matching purchases" : tab === "purchased" ? "No purchases recorded yet" : tab === "waitingForRelease" ? "No releases on watch" : "Your buy list is clear" }),
            el("p", { class: "sub", text: needle ? "Try a different title, creator, retailer or media type." : tab === "purchased"
              ? "Confirmed purchases will appear here and start building useful spending insights."
              : tab === "waitingForRelease" ? "Add an item with a manual release date when you want it to take the release desk."
              : "Add a book, visual novel or game when something belongs in your next purchase plan." })
          ]),
          !needle && tab !== "purchased" ? el("button", { class: "btn primary", text: "+ Add item", onclick: function () { itemEditor(null, renderPlanner); } }) : null
        ].filter(Boolean)));
        listWrap.appendChild(queue);
        return;
      }

      if (pref.sort === "priority" && !needle && tab !== "purchased") {
        queue.appendChild(el("p", { class: "wl-queue-hint", text: "Drag a row to set its priority. Check a Want to buy item to model it against this month’s allowance." }));
      }
      var list = el("div", { class: "wl-list" });
      rows.forEach(function (it) { list.appendChild(itemRow(it)); });
      queue.appendChild(list);
      listWrap.appendChild(queue);
      if (tab !== "purchased" && pref.sort === "priority" && !needle) enableDrag(list);
    }

    function renderHero() {
      if (heroRotationTimer) {
        clearTimeout(heroRotationTimer);
        heroRotationTimer = null;
      }
      heroWrap.innerHTML = "";
      var feature = featuredItem();
      if (feature) { heroWrap.appendChild(dropHero(feature)); scheduleHeroRotation(feature); return; }
      heroWrap.appendChild(el("div", { class: "wl-hero wl-hero-empty" }, [
        el("div", { class: "wl-hero-badge", text: "◆ Release desk" }),
        el("span", { class: "wl-hero-ph", text: "円" }),
        el("div", { class: "wl-hero-body" }, [
          el("h2", { class: "wl-hero-title", text: "Your next release will live here" }),
          el("p", { class: "sub", text: "Add a manual release date to an item on watch, or use Want to buy to surface your highest-priority purchase." }),
          el("button", { class: "btn primary", text: "+ Add release", onclick: function () { itemEditor(null, renderPlanner); } })
        ])
      ]));
    }

    function scheduleHeroRotation(feature) {
      if (!feature || !feature.item || !feature.item.releaseDate) return;
      var delay = 3600000 - (now() % 3600000) + 40;
      heroRotationTimer = setTimeout(function () {
        heroRotationTimer = null;
        if (!document.body.contains(heroWrap)) return;
        /* Re-run the lifecycle as well as the cosmetic rotation. This lets a
           release move into Want to buy on the first scheduled refresh after
           its release-day-plus-one grace period ends. */
        renderPlanner();
      }, delay);
    }

    function featureCopy(feature) {
      var it = feature.item, d = daysUntil(it.releaseDate);
      if (feature.kind === "releaseReminder") return { badge: "◆ Final release reminder", state: "Released yesterday · choose it before it joins Want to buy" };
      if (feature.kind === "releaseDay") return { badge: "◆ Release day", state: "Out today · it will remain here through tomorrow" };
      if (feature.kind === "awaitingDate") return { badge: "◆ Waiting for a date", state: "Add a manual release date to schedule this item" };
      if (feature.kind === "priorityPick") return { badge: "◆ Priority purchase", state: "Top of your Want to buy queue" };
      return { badge: "◆ Next to drop", state: d == null ? "Release date not set" : "Releases " + it.releaseDate + " · " + (d === 1 ? "tomorrow" : "in " + d + " days") };
    }
    function priorityText(it) {
      var rank = byStatus(it.status).map(function (x) { return x.id; }).indexOf(it.id) + 1;
      return rank > 0 ? "Priority " + rank : "Priority";
    }
    function dropHero(feature) {
      var it = feature.item;
      var d = daysUntil(it.releaseDate);
      var imminent = d != null && d >= 0 && d <= 7;
      var copy = featureCopy(feature);
      var hero = el("article", { class: "wl-hero wl-hero-feature" + (imminent ? " imminent" : "") + (it.coverUrl ? " has-banner" : ""), style: "--accent:" + MODULE_COLOR[it.module] });
      if (it.coverUrl) KOS.imageCrop.background(hero, it.coverUrl, it.coverCrop, {
        overlay: "linear-gradient(100deg, color-mix(in srgb, var(--bg0) 94%, transparent) 0%, color-mix(in srgb, var(--bg0) 74%, transparent) 52%, color-mix(in srgb, var(--bg0) 26%, transparent) 100%)"
      });
      hero.appendChild(el("div", { class: "wl-hero-badge", text: copy.badge }));
      hero.appendChild(el("div", { class: "wl-hero-body" }, [
        el("div", { class: "wl-hero-status", text: copy.state }),
        el("div", { class: "wl-hero-tags" }, [
          el("span", { class: "wl-modtag", style: "--accent:" + MODULE_COLOR[it.module], text: MODULE_KANJI[it.module] + " " + MODULE_LABEL[it.module] }),
          el("span", { class: "wl-priority-pill", text: priorityText(it) })
        ]),
        el("h2", { class: "wl-hero-title", text: it.title }),
        it.author ? el("p", { class: "wl-hero-meta", text: it.author }) : null,
        it.notes ? el("p", { class: "wl-hero-note", text: it.notes }) : null,
        el("dl", { class: "wl-hero-facts" }, [
          el("div", {}, [el("dt", { text: "Price" }), el("dd", { text: it.price ? money(it.price, it.currency) : "Unpriced" })]),
          el("div", {}, [el("dt", { text: "Release" }), el("dd", { text: it.releaseDate || "Date not set" })]),
          el("div", {}, [el("dt", { text: "Store" }), el("dd", { text: it.retailer || "Not set" })])
        ]),
        el("div", { class: "wl-hero-actions" }, [
          el("button", { class: "btn primary", text: "Confirm purchase", onclick: function () { doPurchase(it); } }),
          it.retailerUrl ? el("a", { class: "btn", href: it.retailerUrl, target: "_blank", rel: "noopener noreferrer", text: "Store link ↗" }) : null,
          el("button", { class: "btn subtle", text: "Edit", onclick: function () { itemEditor(it, renderPlanner); } })
        ].filter(Boolean))
      ].filter(Boolean)));
      return hero;
    }

    function itemRow(it) {
      var draggable = tab !== "purchased" && pref.sort === "priority" && !queryIn.value.trim();
      var checkbox = null;
      if (tab === "wantToBuy") {
        checkbox = el("input", { type: "checkbox", class: "wl-check", "aria-label": "Simulate buying " + it.title });
        checkbox.checked = !!selected[it.id];
        checkbox.addEventListener("change", function () { selected[it.id] = checkbox.checked; renderBudget(); });
      }
      var linkChip = it.linkedEntryId != null
        ? el("button", { class: "wl-chip wl-linked", title: "Part of your collection — open the linked entry",
            text: "⇄ Collection", onclick: function () { openLinkedEntry(it.linkedEntryId, renderPlanner); } })
        : null;
      var retailChip = it.retailerUrl
        ? el("a", { class: "wl-chip wl-retail", href: it.retailerUrl, target: "_blank", rel: "noopener noreferrer",
            text: (it.retailer || "store") + " ↗", onclick: function (ev) { ev.stopPropagation(); } })
        : (it.retailer ? el("span", { class: "wl-chip", text: it.retailer }) : null);
      var relChip = it.releaseDate ? el("span", { class: "wl-chip wl-rel", text: "◷ " + releaseText(it.releaseDate) })
        : el("span", { class: "wl-chip", text: tab === "waitingForRelease" ? "date needed" : "no release date" });

      var actions = el("div", { class: "wl-row-actions" }, [
        tab !== "purchased" ? el("button", { class: "mini-btn wl-purchase", text: "Purchased", title: "Record this as bought — archives it into spend history and updates its Collection handoff",
          onclick: function (ev) { ev.stopPropagation(); doPurchase(it); } }) : null,
        tab === "waitingForRelease" ? el("button", { class: "mini-btn", text: "Move to buy", title: "Move it from release watch to Want to buy",
          onclick: function (ev) { ev.stopPropagation(); setStatus(it.id, "wantToBuy"); renderPlanner(); } }) : null,
        tab === "purchased" && it.collectionHandoffError ? el("button", { class: "mini-btn", text: "Retry Collection", title: it.collectionHandoffError,
          onclick: function (ev) { ev.stopPropagation(); handoffPurchased(it.id, function (err) { renderPlanner(); KOS.ui.toast(err ? "Purchase kept, but Collection still needs attention." : "Collection handoff completed.", !!err); }); } }) : null,
        tab === "purchased" && it.linkedEntryId != null ? el("button", { class: "mini-btn", text: "Open Collection", onclick: function (ev) { ev.stopPropagation(); openLinkedEntry(it.linkedEntryId, renderPlanner); } }) : null,
        el("button", { class: "mini-btn", text: "Edit", onclick: function (ev) { ev.stopPropagation(); itemEditor(it, renderPlanner); } })
      ].filter(Boolean));

      var row = el("article", { class: "wl-row" + (draggable ? " draggable" : ""), "data-id": String(it.id),
        draggable: draggable ? "true" : null, style: "--accent:" + MODULE_COLOR[it.module] }, [
        el("div", { class: "wl-row-lead" }, [
          draggable ? el("span", { class: "wl-grip", "aria-hidden": "true", text: "⋮⋮" }) : null,
          checkbox
        ].filter(Boolean)),
        it.coverUrl ? el("span", { class: "wl-cover" }, [KOS.imageCrop.image(it.coverUrl, { alt: "", loading: "lazy" }, it.coverCrop)])
          : el("span", { class: "wl-cover wl-cover-ph", text: MODULE_KANJI[it.module] }),
        el("div", { class: "wl-row-main" }, [
          el("div", { class: "wl-row-title", text: it.title, title: it.title }),
          it.author ? el("div", { class: "wl-row-author", text: it.author }) : null,
          el("div", { class: "wl-row-meta" }, [
            el("span", { class: "wl-modtag", style: "--accent:" + MODULE_COLOR[it.module], text: MODULE_KANJI[it.module] + " " + MODULE_LABEL[it.module] }),
            relChip, retailChip, linkChip,
            it.status === "purchased" && it.purchasedAt ? el("span", { class: "wl-chip", text: "bought " + monthKey(it.purchasedAt) }) : null,
            it.collectionHandoffError ? el("span", { class: "wl-chip wl-handoff-error", title: it.collectionHandoffError, text: "Collection needs attention" }) : null
          ].filter(Boolean))
        ].filter(Boolean)),
        el("div", { class: "wl-row-price" }, [
          el("span", { class: "k", text: "Price" }),
          el("b", { text: it.price ? money(it.price, it.currency) : "—" })
        ]),
        actions
      ].filter(Boolean));
      return row;
    }

    function doPurchase(it) {
      markPurchased(it.id);
      delete selected[it.id];
      renderPlanner();
      KOS.ui.toast("Purchase recorded — added to " + monthKey() + " actual spend.");
      handoffPurchased(it.id, function (err, entry, detail) {
        renderPlanner();
        if (err) {
          KOS.ui.toast("Purchase kept. Collection needs attention before it can link.", true);
          return;
        }
        if (detail && detail.duplicateVolume) {
          KOS.ui.toast("Purchase recorded — that book volume is already in the Physical Vault.");
        } else if (entry) {
          KOS.ui.toast(it.module === "books" ? "Added to the Physical Vault." : "Added to Collection as planned.");
        }
      });
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

    /* ---- Purchase history: show charts only once they can say something
       useful. A small, intentional state replaces decorative zero charts. */
    function renderCharts() {
      chartsWrap.innerHTML = "";
      var byMonth = spendByMonth();
      var byMod = spendByModule();
      var spentAll = totalSpent();
      var count = purchaseCount();
      var modBars = MODULES.map(function (m) {
        return { label: MODULE_LABEL[m], value: Math.round(byMod[m] || 0), color: MODULE_COLOR[m],
          hint: MODULE_LABEL[m] + ": " + money(byMod[m] || 0) };
      }).filter(function (b) { return b.value; });
      var enough = count >= 3 && (byMonth.length >= 2 || modBars.length >= 2);
      chartsWrap.appendChild(el("div", { class: "wl-history-head" }, [
        el("div", {}, [
          el("span", { class: "wl-sum-h", text: "Purchase history" }),
          el("h2", { id: "wl-history-title", text: "Actual spend, not wishlist value" })
        ]),
        el("div", { class: "wl-history-total" }, [
          el("span", { class: "k", text: count + (count === 1 ? " purchase" : " purchases") }),
          el("b", { text: money(spentAll) })
        ])
      ]));
      if (!enough) {
        var remainingToInsights = Math.max(0, 3 - count);
        chartsWrap.appendChild(el("div", { class: "wl-history-empty" }, [
          el("span", { class: "wl-empty-mark", text: "◔" }),
          el("div", {}, [
            el("b", { text: count ? "Keep recording purchases for a useful picture" : "Your spending story starts with the first purchase" }),
            el("p", { class: "sub", text: count === 0
              ? "When you confirm purchases here, this space will show timing and Collection split without treating planned items as money spent."
              : remainingToInsights
                ? remainingToInsights + (remainingToInsights === 1 ? " more purchase helps unlock a meaningful trend." : " more purchases help unlock meaningful trends.")
                : "More than one month or media type is needed before a chart would add useful context." })
          ])
        ]));
        return;
      }
      var grid = el("div", { class: "cs-grid wl-history-charts" });
      grid.appendChild(KOS.charts.chartCard("Actual spend over time", money(spentAll) + " across " + byMonth.length + (byMonth.length === 1 ? " month" : " months"),
        KOS.charts.barChart(byMonth.map(function (m) {
          return { label: m.month.slice(2), value: Math.round(m.total), hint: m.month + ": " + money(m.total) };
        }), { color: "var(--accent2)" })));
      grid.appendChild(KOS.charts.chartCard("Collection split", "What you actually bought across the Matrix",
        KOS.charts.barChart(modBars)));
      chartsWrap.appendChild(grid);
    }

    function renderTabs() {
      tabsRow.innerHTML = "";
      [["wantToBuy", "Want to buy"], ["waitingForRelease", "Waiting for release"], ["purchased", "Purchased"]].forEach(function (t) {
        tabsRow.appendChild(el("button", { class: "study-tab" + (tab === t[0] ? " active" : ""), role: "tab",
          "aria-selected": tab === t[0] ? "true" : "false", onclick: function () {
            tab = t[0]; pref.tab = tab; store.save(); renderTabs(); renderList();
          } }, [
            t[1], el("span", { class: "wl-tabcount", text: String(byStatus(t[0]).length) })
          ]));
      });
    }
    function renderPlanner() {
      var moved = advanceReleasedItems();
      w = data();
      pruneSelection();
      tab = pref.tab;
      renderTabs();
      renderHero();
      renderBudget();
      renderList();
      renderCharts();
      if (moved.length) {
        KOS.ui.toast(moved.length === 1
          ? "Released item moved to Want to buy."
          : moved.length + " released items moved to Want to buy.");
      }
    }

    renderPlanner();
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
