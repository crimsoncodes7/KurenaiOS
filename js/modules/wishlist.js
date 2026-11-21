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
  var MODULE_COLOR = { books: "var(--books)", vn: "var(--vn)", game: "var(--games)" };

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
  var TABS = ["wantToBuy", "waitingForRelease", "purchased", "cancelled"];
  var SORTS = ["priority", "release", "price", "recent"];
  /* read without creating (render purity). A pre-refactor save kept the
     active tab as a stray `_tab` on state.wishlist; it still wins on read
     and the first real change folds it in and drops it. */
  function prefs() {
    var p = store.state.media && store.state.media.wishlist;
    var legacy = store.state.wishlist && store.state.wishlist._tab;
    var tab = TABS.indexOf(legacy) !== -1 ? legacy : p && p.tab;
    return {
      tab: TABS.indexOf(tab) !== -1 ? tab : "wantToBuy",
      sort: p && SORTS.indexOf(p.sort) !== -1 ? p.sort : "priority"
    };
  }
  function persistPrefs(patch) {
    var cur = prefs(), w = store.state.wishlist;
    var legacy = !!(w && w._tab);
    if (!legacy && Object.keys(patch).every(function (k) { return cur[k] === patch[k]; })) return;
    var m = store.state.media = store.state.media || {};
    m.wishlist = m.wishlist || { tab: cur.tab, sort: cur.sort };
    m.wishlist.tab = cur.tab;
    Object.keys(patch).forEach(function (k) { m.wishlist[k] = patch[k]; });
    if (legacy) delete w._tab;
    store.save();
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
    /* Anime and digital Books mirror AniList 1:1: a planned row made here
       would be removed by the next pull. Books still join the Collection
       through the purchase handoff, which puts the volume on the shelf. */
    if (it.linkedEntryId == null && (it.module === "anime" || it.module === "books")) {
      done && done(new Error(it.module === "anime"
        ? "Anime mirrors your AniList list — plan it there and the next sync brings it over."
        : "Digital reading mirrors AniList — plan it there; a confirmed purchase here still puts the volume on your shelf."));
      return;
    }
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
  /* what the planner page (js/modules/wishlistpage.js, page-vaults) reads */
  KOS.wishlist._k = { TABS: TABS, prefs: prefs, persistPrefs: persistPrefs, normModule: normModule, now: now, dayKey: dayKey, money: money };

  /* the planner's one money word, shared with the editor banner below */
  function money(n, currency) {
    var v = (typeof n === "number" && !isNaN(n)) ? n : 0;
    var cur = String(currency || budget().currency || "").trim() || undefined;
    if (KOS.money) return KOS.money.formatShown(Math.round(v * 100), { currency: cur });
    cur = cur || "£";
    return (/^[£$€¥]$/.test(cur) ? cur : cur + " ") + v.toFixed(2);
  }

  /* ---------------- reverse surfacing: vault editor "on your wishlist" ----
     a KOS.mediaEditorHooks entry (the dispatcher in core/media.js runs
     hooks after the editor's modal is in the DOM, passing the overlay
     element directly — no DOM probing). When the opened entry is on the
     wishlist, prepend a banner into the editor form.                      */
  KOS.mediaEditorHooks.push(function (entry, overlay) {
    if (!entry || entry.id == null || !overlay) return;
    var linked = forEntry(entry.id);
    if (!linked.length) return;
    var form = overlay.querySelector("[data-ui~='ui.form']");
    if (!form) return;
    form.insertBefore(wishlistBanner(linked, overlay), form.firstChild);
  });
  function wishlistBanner(linked, overlay) {
    return el("div", { class: "k-pl-onlist", "data-ui": "plan.on-list" }, [
      el("span", { class: "k-pl-onlist-h", text: "◆ On your wishlist" })
    ].concat(linked.map(function (it) {
      return el("span", { class: "k-mchip", text: it.title + " · " + STATUS_LABEL[it.status] + (it.price ? " · " + money(it.price, it.currency) : "") });
    }), [
      el("button", { type: "button", class: "k-btn k-btn--sm k-btn--quiet", text: "Open planner →", onclick: function () {
        overlay.remove();
        KOS.show("wishlist");
      } })
    ]));
  }
})();
