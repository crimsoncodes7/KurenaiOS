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
  function longDate(iso) {
    var d = new Date(iso + "T00:00:00");
    return isNaN(d) ? iso : d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  }
  function releaseText(iso) {
    var d = daysUntil(iso);
    if (d == null) return "no date set";
    if (d === 0) return "releases today";
    if (d > 0) return "in " + d + (d === 1 ? " day" : " days") + " · " + iso;
    return "released " + (-d) + (d === -1 ? " day ago" : " days ago") + " · " + iso;
  }
  function moduleTag(module) {
    var n = el("span", { class: "k-pl-module", text: MODULE_LABEL[module] });
    n.style.setProperty("--vh-accent", MODULE_COLOR[module]);
    return n;
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
    var search = el("input", { type: "search", class: "k-input", "data-ui": "plan.link-search",
      placeholder: "Search your " + MODULE_LABEL[module] + " vault…", "aria-label": "Search vault to link" });
    var results = el("div", { class: "k-pl-linkhits", "data-ui": "plan.link-results" });
    var currentLine = el("div", { class: "k-pl-linkcur", "data-ui": "plan.link-current" });
    var box = el("div", { class: "k-pl-linkbox", "data-ui": "plan.link-box" }, [search, currentLine, results]);
    var picked = current != null ? current : null;

    function paintCurrent() {
      currentLine.innerHTML = "";
      if (picked == null) {
        currentLine.appendChild(el("span", { class: "k-muted", text: "Not linked to a vault entry." }));
        return;
      }
      KOS.mediadb.get(picked, function (err, entry) {
        currentLine.innerHTML = "";
        if (err || !entry) {
          currentLine.appendChild(el("span", { class: "k-muted", text: "Linked entry #" + picked + " (missing)." }));
          return;
        }
        currentLine.appendChild(el("span", { class: "k-mchip", "data-tone": "linked", text: "⇄ " + entry.title }));
        currentLine.appendChild(el("button", { type: "button", class: "k-btn k-btn--sm k-btn--quiet", text: "Unlink", onclick: function () {
          picked = null; if (onPick) onPick(null); paintCurrent();
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
          results.appendChild(el("button", { type: "button", class: "k-pl-linkhit", "data-ui": "plan.link-hit", onclick: function () {
            picked = entry.id;
            if (onPick) onPick(entry);
            search.value = "";
            results.innerHTML = "";
            paintCurrent();
          } }, [
            el("span", { class: "k-pl-linkhit-cover" }, [KOS.medview.cover(entry, MODULE_KANJI[module])]),
            el("span", { class: "k-pl-linkhit-t", text: entry.title })
          ]));
        });
        if (!rows.length) results.appendChild(el("p", { class: "k-muted", text: "No matching entries in the " + MODULE_LABEL[module] + " vault." }));
      });
    }
    search.addEventListener("input", KOS.ui.debounce(runSearch, 200));
    paintCurrent();
    return box;
  }

  /* ---------------- item editor ---------------- */
  function itemEditor(existing, onSaved) {
    var isNew = !existing;
    var e = existing ? JSON.parse(JSON.stringify(existing)) : { module: "books", status: "wantToBuy", physicalVolumeNumber: 1 };
    var linkedId = e.linkedEntryId != null ? e.linkedEntryId : null;
    var overlay = KOS.medview.modalOverlay();
    var close = overlay.close;
    var field = KOS.medview.field;
    function input(type, value, placeholder, extra) {
      return el("input", Object.assign({ type: type, class: "k-input", value: value, placeholder: placeholder || null }, extra || {}));
    }

    var title = input("text", e.title && e.title !== "Untitled" ? e.title : "", "Title");
    var moduleSel = el("select", { class: "k-input" }, MODULES.map(function (m) {
      return el("option", { value: m, text: MODULE_KANJI[m] + " " + MODULE_LABEL[m] });
    }));
    moduleSel.value = normModule(e.module || "books");
    var statusSel = el("select", { class: "k-input" }, STATUSES.map(function (s) {
      return el("option", { value: s, text: STATUS_LABEL[s] });
    }));
    statusSel.value = STATUSES.indexOf(e.status) !== -1 ? e.status : "wantToBuy";
    var price = input("number", (e.price != null && e.price !== 0) ? String(e.price) : "", "0.00", { min: "0", step: "0.01" });
    var volumeNumber = input("number", String(e.physicalVolumeNumber || 1), "1", { min: "1", step: "1" });
    var author = input("text", e.author || "", "Author / creator / studio");
    var retailer = input("text", e.retailer || "", "Amazon, Steam, local shop…");
    var retailerUrl = input("url", e.retailerUrl || "", "https://… (manual link)");
    var release = input("date", e.releaseDate || "");
    var coverU = input("url", e.coverUrl || "", "https://… (optional)");
    var coverPosition = KOS.medview.coverPositionControl(e, coverU);
    var notes = el("textarea", { class: "k-input", "data-ui": "ui.note-area", rows: 2, placeholder: "Why, edition, condition wanted…" });
    notes.value = e.notes || "";
    var volumeField = field("Physical volume / edition #", volumeNumber);
    function syncModuleFields() { volumeField.hidden = moduleSel.value !== "books"; }

    var linkHolder = el("div", { class: "k-pl-linkholder" });
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
      if (onSaved) onSaved();
      if (saved && saved.status === "purchased") handoffPurchased(saved.id, function (err) {
        if (err) KOS.ui.toast("Purchase saved; its Collection handoff needs attention.", true);
        else { if (onSaved) onSaved(); KOS.ui.toast("Collection handoff completed."); }
      });
    }

    KOS.medview.dialogBox(overlay, "plan.dialog", isNew ? "Add to the planner" : "Edit wishlist item",
      "Logistics only: nothing here touches XP, gold or HP.",
      el("div", { class: "k-dialog-body k-pl-form", "data-ui": "ui.form" }, [
        field("Title", title, true),
        field("Cover URL", el("div", { class: "k-pl-image-field" }, [coverU, coverPosition.node]), true),
        field("Module", moduleSel),
        field("Status", statusSel),
        field("Price (" + (budget().currency || "£") + ")", price),
        volumeField,
        field("Author / creator", author),
        field("Retailer", retailer),
        field("Retailer link", retailerUrl, true),
        field("Release date (typed by hand; no automated source exists)", release),
        el("div", { class: "k-field k-medit-wide", "data-ui": "ui.field vault.span-2" }, [
          el("span", { class: "k-field-label", text: "Link to a collection entry (optional)" }),
          linkHolder,
          el("p", { class: "k-muted k-pl-guidance", text: "A confirmed Book purchase adds this volume to the Physical Vault. Visual Novels and Games become planned Collection entries. Existing progress is never overwritten." })
        ]),
        field("Notes", notes, true)
      ]),
      el("div", { class: "k-dialog-foot" }, [
        !isNew ? el("button", { type: "button", class: "k-btn k-btn--danger", text: "Delete", onclick: function () {
          KOS.ui.confirm({ title: "Remove from planner?", body: "“" + e.title + "” will be removed.", danger: true, confirm: "Remove" }, function () {
            remove(e.id); KOS.ui.toast("Removed."); close(); if (onSaved) onSaved();
          });
        } }) : null,
        el("span", { class: "k-pl-spacer" }),
        el("button", { type: "button", class: "k-btn", text: "Cancel", onclick: close }),
        el("button", { type: "button", class: "k-btn k-btn--primary", text: isNew ? "Add" : "Save", onclick: save })
      ].filter(Boolean)), "k-pl-dialog");
    KOS.ui.openDialog(overlay);
    title.focus();
  }

  /* ---------------- the view (frame 11h) ---------------- */
  var TAB_LABEL = { wantToBuy: "Want to buy", waitingForRelease: "Waiting for release", purchased: "Purchased", cancelled: "Cancelled" };
  var EMPTY = {
    wantToBuy: ["Your buy list is clear", "Add a book, visual novel or game when something belongs in your next purchase plan."],
    waitingForRelease: ["No releases on watch", "Add an item with a release date when you want it to take the release desk."],
    purchased: ["No purchases recorded yet", "Confirmed purchases appear here and build the spending history below."],
    cancelled: ["Nothing cancelled", "An item you decide against moves here instead of being deleted."]
  };

  KOS.views.wishlist = function (main) {
    KOS.shell.tree("none");

    var w = data();
    var pref = prefs();
    var tab = pref.tab;
    var selected = {};   // ephemeral checkbox simulation — id -> true
    var heroRotationTimer = null;

    main.appendChild(KOS.ui.pageHeader({
      kicker: "円 · The allowance",
      title: "Budget Planner",
      sub: "One wishlist, one monthly pool. Tick items to try a purchase on paper: nothing spends until you say so.",
      actions: [KOS.collectionWorkspaceTabs("planner", "wishlist")]
    }));

    /* ---- top row: the release desk and the allowance ---- */
    var heroWrap = el("div", { class: "k-pl-herowrap" });
    var barWrap = el("aside", { class: "k-pl-allow", "data-ui": "plan.budget", "aria-label": "Monthly allowance" });
    main.appendChild(el("div", { class: "k-pl-top", "data-ui": "plan.top" }, [heroWrap, barWrap]));

    /* ---- the queue's controls ---- */
    var tabsHost = el("div", { class: "k-pl-tabs" });
    var queryIn = el("input", { type: "search", class: "k-msearch", "data-ui": "plan.search",
      placeholder: "⌕ Search this queue…", "aria-label": "Search purchase queue" });
    var sortSel = el("select", { class: "k-pill-select", "data-ui": "ui.status-select plan.sort", "aria-label": "Sort purchase queue" }, [
      el("option", { value: "priority", text: "Priority order" }),
      el("option", { value: "release", text: "Release date" }),
      el("option", { value: "price", text: "Price" }),
      el("option", { value: "recent", text: "Recently added" })
    ]);
    sortSel.value = pref.sort;
    main.appendChild(el("div", { class: "k-pl-toolbar", "data-ui": "plan.toolbar" }, [
      tabsHost,
      el("div", { class: "k-pl-tools" }, [
        queryIn, sortSel,
        el("button", { type: "button", class: "k-btn k-btn--primary", "data-ui": "plan.add", text: "+ Add item",
          onclick: function () { itemEditor(null, renderPlanner); } })
      ])
    ]));

    var listWrap = el("div", { class: "k-pl-listwrap" });
    main.appendChild(listWrap);
    var chartsWrap = el("section", { class: "k-pl-history", "data-ui": "plan.history", "aria-label": "Purchase history" });
    main.appendChild(chartsWrap);

    queryIn.addEventListener("input", function () { renderList(); });
    sortSel.addEventListener("change", function () {
      pref.sort = sortSel.value;
      persistPrefs({ sort: pref.sort });
      renderList();
    });

    /* ---- the allowance: actual spend and the on-paper scenario stay
       visibly separate; the numbers are edited in a dialog, so the card
       reads as a decision aid rather than a form ---- */
    function selectedIds() {
      return Object.keys(selected).filter(function (k) { return selected[k]; }).map(Number);
    }
    function pruneSelection() {
      Object.keys(selected).forEach(function (id) {
        var it = get(Number(id));
        if (!it || it.status !== "wantToBuy") delete selected[id];
      });
    }
    function ledgerLine(tone, label, detail, value) {
      return el("div", { class: "k-pl-ledger-line", "data-ui": "plan.ledger-line", "data-tone": tone }, [
        el("span", { class: "k-pl-dot", "aria-hidden": "true" }),
        el("div", { class: "k-pl-ledger-copy" }, [
          el("dt", { text: label }),
          el("span", { class: "k-muted", text: detail })
        ]),
        el("dd", { class: "k-mono", text: value })
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
      var d = new Date(now()), next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      var monthName = d.toLocaleDateString(undefined, { month: "long" });
      var purchases = (w.budget.history.find(function (h) { return h.month === monthKey(); }) || { items: [] }).items.length;

      barWrap.appendChild(el("div", { class: "k-pl-allow-head" }, [
        el("h2", { class: "k-kicker", text: monthName + " allowance" }),
        el("span", { class: "k-muted", text: "resets " + next.toLocaleDateString(undefined, { day: "numeric", month: "short" }) })
      ]));
      var head = el("div", { class: "k-pl-allow-figure", "data-ui": "plan.bn-rem" }, limit
        ? [el("b", { text: money(rem) }), el("span", { text: "left of " + money(limit) })]
        : [el("b", { text: "Not set" }), el("span", { text: "set a monthly ceiling to see what remains" })]);
      if (limit && rem < 0) KOS.ui.state(head, "over", true);
      barWrap.appendChild(head);
      if (limit) {
        var bar = el("div", { class: "k-pl-allow-bar", role: "img",
          "aria-label": money(spent) + " spent and " + money(selectedNow) + " on paper of " + money(limit) });
        [["spent", spent], ["paper", selectedNow], ["rest", Math.max(0, limit - spent - selectedNow)]].forEach(function (s) {
          if (!s[1]) return;
          var seg = el("span", { class: "k-pl-allow-seg", "data-tone": s[0] });
          seg.style.setProperty("--n", String(s[1]));
          bar.appendChild(seg);
        });
        barWrap.appendChild(bar);
      }
      barWrap.appendChild(el("dl", { class: "k-pl-ledger", "data-ui": "plan.ledger" }, [
        ledgerLine("spent", "Spent this month", purchases === 1 ? "1 purchase" : purchases + " purchases", money(spent)),
        ledgerLine("committed", "Committed / planned", "wishlist value, not paid yet", money(committed)),
        ledgerLine("paper", "On paper", selectedNow ? "a scenario, not spent" : "tick items to try a purchase", money(selectedNow))
      ]));
      barWrap.appendChild(el("div", { class: "k-pl-allow-foot" }, [
        el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "plan.budget-edit",
          text: limit ? "Edit allowance" : "Set allowance", onclick: editBudget })
      ]));
    }
    function editBudget() {
      var overlay = KOS.medview.modalOverlay(), close = overlay.close;
      var amount = el("input", { type: "number", class: "k-input", min: "0", step: "1", placeholder: "0.00",
        value: w.budget.monthlyLimit ? String(w.budget.monthlyLimit) : "" });
      var currencyIsEditable = canChangeCurrency();
      var currency = currencyIsEditable
        ? el("input", { type: "text", class: "k-input", maxlength: "3", value: w.budget.currency || "£", "aria-label": "Currency symbol or code" })
        : null;
      KOS.medview.dialogBox(overlay, "plan.budget-dialog", "Monthly allowance", "This changes the allowance, not your recorded purchases.",
        el("div", { class: "k-dialog-body k-pl-form", "data-ui": "ui.form" }, [
          KOS.medview.field("Monthly allowance", amount),
          currencyIsEditable
            ? KOS.medview.field("Currency", currency)
            : el("p", { class: "k-muted k-pl-guidance", text: "Currency stays " + (w.budget.currency || "£") + " once priced items or purchases exist, so totals are never relabelled without a real conversion." })
        ]),
        el("div", { class: "k-dialog-foot" }, [
          el("span", { class: "k-pl-spacer" }),
          el("button", { type: "button", class: "k-btn", text: "Cancel", onclick: close }),
          el("button", { type: "button", class: "k-btn k-btn--primary", text: "Save budget", onclick: function () {
            var patch = { monthlyLimit: amount.value };
            if (currencyIsEditable) patch.currency = currency.value;
            setBudget(patch);
            close(); renderPlanner(); KOS.ui.toast("Monthly allowance updated.");
          } })
        ]));
      KOS.ui.openDialog(overlay);
      amount.focus();
    }

    /* ---- the active tab's queue ---- */
    function renderList() {
      listWrap.innerHTML = "";
      var needle = queryIn.value.trim().toLowerCase();
      var rows = byStatus(tab).filter(function (it) {
        return !needle || [it.title, it.author, it.retailer, MODULE_LABEL[it.module]].join(" ").toLowerCase().indexOf(needle) !== -1;
      });
      if (pref.sort === "release") {
        rows.sort(function (a, b) { return (a.releaseDate || "9999-12-31") < (b.releaseDate || "9999-12-31") ? -1 : 1; });
      } else if (pref.sort === "price") {
        rows.sort(function (a, b) { return (b.price || 0) - (a.price || 0) || a.id - b.id; });
      } else if (pref.sort === "recent") {
        rows.sort(function (a, b) { return (b.addedAt || 0) - (a.addedAt || 0); });
      }
      var queue = el("section", { class: "k-pl-queue", "data-ui": "plan.queue", "aria-label": TAB_LABEL[tab] });
      listWrap.appendChild(queue);
      if (!rows.length) {
        var copy = needle ? ["No matching items", "Try a different title, creator, retailer or media type."] : EMPTY[tab];
        queue.appendChild(KOS.ui.emptyState({ compact: true, title: copy[0], body: copy[1],
          action: !needle && (tab === "wantToBuy" || tab === "waitingForRelease")
            ? el("button", { type: "button", class: "k-btn k-btn--sm", text: "+ Add item", onclick: function () { itemEditor(null, renderPlanner); } })
            : null }));
        return;
      }
      var draggable = (tab === "wantToBuy" || tab === "waitingForRelease") && pref.sort === "priority" && !needle;
      var list = el("div", { class: "k-pl-list", "data-ui": "plan.list" });
      rows.forEach(function (it, i) { list.appendChild(itemRow(it, i + 1, draggable)); });
      queue.appendChild(list);
      if (draggable) {
        queue.appendChild(el("p", { class: "k-pl-hint k-muted", text: tab === "wantToBuy"
          ? "Drag a row to set its priority. Tick one to try it against this month’s allowance."
          : "Drag a row to set its priority." }));
        enableDrag(list);
      }
    }

    function renderHero() {
      if (heroRotationTimer) {
        clearTimeout(heroRotationTimer);
        heroRotationTimer = null;
      }
      heroWrap.innerHTML = "";
      var feature = featuredItem();
      if (feature) { heroWrap.appendChild(dropHero(feature)); scheduleHeroRotation(feature); return; }
      var empty = el("article", { class: "k-pl-hero", "data-ui": "plan.hero" }, [
        el("span", { class: "k-pl-hero-scrim", "aria-hidden": "true" }),
        el("div", { class: "k-pl-hero-in" }, [
          el("span", { class: "k-pl-hero-cover k-pl-hero-ph", lang: "ja", "aria-hidden": "true", text: "円" }),
          el("div", { class: "k-pl-hero-body", "data-ui": "plan.hero-body" }, [
            el("span", { class: "k-pl-badge", text: "◆ Release desk" }),
            el("h2", { class: "k-pl-hero-title", text: "Your next release will live here" }),
            el("p", { class: "k-pl-hero-meta", text: "Give an item on watch a release date, or tick Want to buy to surface your top priority." }),
            el("div", { class: "k-pl-hero-actions" }, [
              el("button", { type: "button", class: "k-btn k-btn--primary", text: "+ Add release", onclick: function () { itemEditor(null, renderPlanner); } })
            ])
          ])
        ])
      ]);
      KOS.ui.state(empty, "wl-hero-empty", true);
      heroWrap.appendChild(empty);
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
      if (feature.kind === "releaseReminder") return { badge: "◆ Final release reminder", state: "Released yesterday · choose it before it joins Want to buy" };
      if (feature.kind === "releaseDay") return { badge: "◆ Release day", state: "Out today · it stays here through tomorrow" };
      if (feature.kind === "awaitingDate") return { badge: "◆ Waiting for a date", state: "Add a release date to schedule this item" };
      if (feature.kind === "priorityPick") return { badge: "◆ Priority purchase", state: "Top of your Want to buy queue" };
      return { badge: "◆ Next to drop", state: null };
    }
    function priorityText(it) {
      var rank = byStatus(it.status).map(function (x) { return x.id; }).indexOf(it.id) + 1;
      return rank > 0 ? "Priority " + rank : "Priority";
    }
    function dropHero(feature) {
      var it = feature.item;
      var d = daysUntil(it.releaseDate);
      var copy = featureCopy(feature);
      var hero = el("article", { class: "k-pl-hero", "data-ui": "plan.hero plan.hero-feature" });
      hero.style.setProperty("--vh-accent", MODULE_COLOR[it.module]);
      if (d != null && d >= 0 && d <= 7) KOS.ui.state(hero, "imminent", true);
      if (it.coverUrl) {
        KOS.ui.state(hero, "has-banner", true);
        KOS.imageCrop.background(hero, it.coverUrl, it.coverCrop, { className: "k-pl-hero-art" });
      }
      var countdown = !copy.state && d != null && d > 0
        ? el("div", { class: "k-pl-countdown" }, [
          el("b", { class: "k-mono", text: String(d) }),
          el("span", { text: (d === 1 ? "day" : "days") + " · releases " + longDate(it.releaseDate) })
        ])
        : el("p", { class: "k-pl-hero-state", text: copy.state || (it.releaseDate ? "Releases " + longDate(it.releaseDate) : "Release date not set") });
      hero.appendChild(el("span", { class: "k-pl-hero-scrim", "aria-hidden": "true" }));
      hero.appendChild(el("div", { class: "k-pl-hero-in" }, [
        el("span", { class: "k-pl-hero-cover" }, [KOS.medview.cover(it, MODULE_KANJI[it.module])]),
        el("div", { class: "k-pl-hero-body", "data-ui": "plan.hero-body" }, [
          el("span", { class: "k-pl-badge", "data-ui": "plan.hero-badge", text: copy.badge }),
          el("h2", { class: "k-pl-hero-title", text: it.title }),
          el("p", { class: "k-pl-hero-meta", text: [MODULE_LABEL[it.module], it.author, it.retailer, priorityText(it)].filter(Boolean).join(" · ") }),
          countdown,
          el("div", { class: "k-pl-hero-actions" }, [
            el("button", { type: "button", class: "k-btn k-btn--primary", text: "Mark purchased", onclick: function () { doPurchase(it); } }),
            it.retailerUrl ? el("a", { class: "k-btn k-pl-glass", href: it.retailerUrl, target: "_blank", rel: "noopener noreferrer", text: "Store ↗" }) : null,
            el("button", { type: "button", class: "k-btn k-pl-glass", text: "Edit", onclick: function () { itemEditor(it, renderPlanner); } }),
            it.price ? el("span", { class: "k-pl-hero-price k-mono", text: money(it.price, it.currency) }) : null
          ].filter(Boolean))
        ])
      ]));
      return hero;
    }

    /* one queue row: tick/grip · rank · cover · title · link · price · actions */
    function itemRow(it, rank, draggable) {
      var lead;
      if (tab === "wantToBuy") {
        lead = el("input", { type: "checkbox", class: "k-pl-check", "data-ui": "plan.check", "aria-label": "Simulate buying " + it.title });
        lead.checked = !!selected[it.id];
        lead.addEventListener("change", function () { selected[it.id] = lead.checked; renderBudget(); });
      } else {
        lead = el("span", { class: "k-pl-grip", "aria-hidden": "true", text: draggable ? "⋮⋮" : "" });
      }
      var sub = [it.author, it.retailer].filter(Boolean).join(" · ");
      var link = it.linkedEntryId != null
        ? el("button", { type: "button", class: "k-pl-link", "data-state": "linked", title: "Open the linked Collection entry",
          text: "⇄ Collection", onclick: function (ev) { ev.stopPropagation(); openLinkedEntry(it.linkedEntryId, renderPlanner); } })
        : el("button", { type: "button", class: "k-pl-link", title: "Link this item to a vault entry",
          text: "Link to vault", onclick: function (ev) { ev.stopPropagation(); itemEditor(it, renderPlanner); } });
      var facts = [
        it.releaseDate ? el("span", { class: "k-mchip", "data-tone": "release", text: "◷ " + releaseText(it.releaseDate) })
          : (tab === "waitingForRelease" ? el("span", { class: "k-mchip", text: "date needed" }) : null),
        it.retailerUrl ? el("a", { class: "k-mchip", "data-tone": "link", href: it.retailerUrl, target: "_blank", rel: "noopener noreferrer",
          text: (it.retailer || "store") + " ↗", onclick: function (ev) { ev.stopPropagation(); } }) : null,
        it.status === "purchased" && it.purchasedAt ? el("span", { class: "k-mchip", text: "bought " + monthKey(it.purchasedAt) }) : null,
        it.collectionHandoffError ? el("span", { class: "k-mchip", "data-tone": "crimson", title: it.collectionHandoffError, text: "Collection needs attention" }) : null
      ].filter(Boolean);
      var actions = el("div", { class: "k-pl-row-actions" }, [
        tab === "wantToBuy" || tab === "waitingForRelease"
          ? el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "plan.purchase", text: "Purchased",
            title: "Record this as bought: it joins spend history and hands off to Collection",
            onclick: function (ev) { ev.stopPropagation(); doPurchase(it); } }) : null,
        tab === "waitingForRelease" ? el("button", { type: "button", class: "k-btn k-btn--sm k-btn--quiet", text: "Move to buy",
          title: "Move it from release watch to Want to buy",
          onclick: function (ev) { ev.stopPropagation(); setStatus(it.id, "wantToBuy"); renderPlanner(); } }) : null,
        tab === "purchased" && it.collectionHandoffError ? el("button", { type: "button", class: "k-btn k-btn--sm", text: "Retry Collection", title: it.collectionHandoffError,
          onclick: function (ev) { ev.stopPropagation(); handoffPurchased(it.id, function (err) { renderPlanner(); KOS.ui.toast(err ? "Purchase kept, but Collection still needs attention." : "Collection handoff completed.", !!err); }); } }) : null,
        el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", text: "✎", "aria-label": "Edit " + it.title,
          onclick: function (ev) { ev.stopPropagation(); itemEditor(it, renderPlanner); } })
      ].filter(Boolean));

      var row = el("article", { class: "k-pl-row", "data-ui": "plan.row", "data-id": String(it.id),
        draggable: draggable ? "true" : null }, [
        lead,
        el("span", { class: "k-pl-rank k-mono", text: String(rank) }),
        el("span", { class: "k-pl-cover" }, [KOS.medview.cover(it, MODULE_KANJI[it.module])]),
        el("div", { class: "k-pl-main" }, [
          el("div", { class: "k-pl-title", title: it.title, text: it.title }),
          el("div", { class: "k-pl-sub" }, [moduleTag(it.module), sub ? el("span", { text: " · " + sub }) : null].filter(Boolean)),
          facts.length ? el("div", { class: "k-pl-facts" }, facts) : null
        ].filter(Boolean)),
        link,
        el("span", { class: "k-pl-price k-mono", text: it.price ? money(it.price, it.currency) : "—" }),
        actions
      ]);
      if (draggable) KOS.ui.state(row, "draggable", true);
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

    /* HTML5 drag reordering within the active tab (priority order only) */
    function enableDrag(list) {
      var dragEl = null;
      list.querySelectorAll("[data-ui~='plan.row'][data-state~='draggable']").forEach(function (row) {
        row.addEventListener("dragstart", function (ev) {
          dragEl = row; KOS.ui.state(row, "dragging", true);
          ev.dataTransfer.effectAllowed = "move";
          try { ev.dataTransfer.setData("text/plain", row.dataset.id); } catch (e) {}
        });
        row.addEventListener("dragend", function () { KOS.ui.state(row, "dragging", false); dragEl = null; commitOrder(list); });
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
      var ids = Array.prototype.map.call(list.querySelectorAll("[data-ui~='plan.row']"), function (r) { return Number(r.dataset.id); });
      reorder(tab, ids);
      renderList();
    }

    /* ---- purchase history: charts only once they can say something
       (invariant 76); until then one honest line ---- */
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
      chartsWrap.appendChild(KOS.ui.sectionHeader({
        title: "Purchase history",
        sub: count ? money(spentAll) + " across " + count + (count === 1 ? " purchase" : " purchases") + " · actual spend, not wishlist value" : null
      }));
      if (!enough) {
        var toGo = Math.max(0, 3 - count);
        chartsWrap.appendChild(KOS.ui.emptyState({ compact: true,
          body: count === 0
            ? "Confirmed purchases build a spending picture here; planned items never count as money spent."
            : toGo
              ? toGo + (toGo === 1 ? " more purchase" : " more purchases") + " before a trend is worth drawing."
              : "A second month or media type is needed before a chart would say anything." }));
        return;
      }
      var grid = el("div", { class: "k-mstats-grid", "data-ui": "chart.grid" });
      grid.appendChild(KOS.charts.chartCard("Actual spend over time", money(spentAll) + " across " + byMonth.length + (byMonth.length === 1 ? " month" : " months"),
        KOS.charts.barChart(byMonth.map(function (m) {
          return { label: m.month.slice(2), value: Math.round(m.total), hint: m.month + ": " + money(m.total) };
        }), { color: "var(--crimson)" })));
      grid.appendChild(KOS.charts.chartCard("Collection split", "what you actually bought, by medium",
        KOS.charts.barChart(modBars)));
      chartsWrap.appendChild(grid);
    }

    function renderTabs() {
      tabsHost.innerHTML = "";
      tabsHost.appendChild(KOS.medview.addHook(KOS.ui.tabs(TABS.map(function (t) {
        var n = byStatus(t).length;
        return { label: TAB_LABEL[t], active: tab === t, count: n || null, hook: "ui.tab plan.tab",
          onSelect: function () {
            tab = t; pref.tab = t; persistPrefs({ tab: t }); renderTabs(); renderList();
          } };
      }), { variant: "card", label: "Purchase queue" }), "plan.tabs"));
    }
    function renderPlanner() {
      var moved = advanceReleasedItems();
      w = data();
      pruneSelection();
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
