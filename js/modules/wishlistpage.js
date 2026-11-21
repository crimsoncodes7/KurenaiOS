/* Kurenai OS — modules/wishlistpage.js
   The Wishlist planner page (`#/wishlist`), loaded on first use with the
   vaults (page-vaults, 1F). The wishlist's record and its rules stay at
   boot in js/modules/wishlist.js (KOS.wishlist), which the notification
   centre, Money and the Assistant read. */
(function () {
  "use strict";
  var el = KOS.ui.el, store = KOS.store, W = KOS.wishlist, K = W._k;
  var STATUSES = W.STATUSES, STATUS_LABEL = W.STATUS_LABEL, MODULES = W.MODULES, MODULE_LABEL = W.MODULE_LABEL, MODULE_KANJI = W.MODULE_KANJI, MODULE_COLOR = W.MODULE_COLOR, data = W.data, budget = W.budget, items = W.items, get = W.get, monthKey = W.monthKey, byStatus = W.byStatus, forEntry = W.forEntry, add = W.add, update = W.update, setStatus = W.setStatus, remove = W.remove, reorder = W.reorder, markPurchased = W.markPurchased, currentMonthSpend = W.currentMonthSpend, selectedTotal = W.selectedTotal, remaining = W.remaining, spendByMonth = W.spendByMonth, spendByModule = W.spendByModule, totalSpent = W.totalSpent, purchaseCount = W.purchaseCount, committedTotal = W.committedTotal, advanceReleasedItems = W.advanceReleasedItems, featuredItem = W.featuredItem, handoffPurchased = W.handoffPurchased;
  var TABS = K.TABS, prefs = K.prefs, persistPrefs = K.persistPrefs, normModule = K.normModule, now = K.now, dayKey = K.dayKey, money = K.money;

  /* ---------------- little shared bits ---------------- */
  /* n in major units. One grammar with Money (KOS.money.format) and Hide
     amounts masks it (audit CL-10); an item priced in another currency
     keeps its own. */
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
      if (err || !entry) {
        /* CL-25: a link to a deleted entry is cleared, so the row offers
           linking again instead of a button that does nothing */
        items().filter(function (it) { return it.linkedEntryId === entryId; }).forEach(function (it) { update(it.id, { linkedEntryId: null }); });
        KOS.ui.toast("That collection entry was deleted — the link is cleared.", true);
        if (after) after(); else if (KOS.rerender) KOS.rerender();
        return;
      }
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

    /* 27n: the Budget Planner's queue is Collection › Wishlist; its money
       lives in Money, and its allowance IS Money's Collection budget */
    main.appendChild(KOS.ui.pageHeader({
      kicker: "願 · The queue",
      title: "Wishlist",
      sub: "What you want from the Collection, in order. Buying one adds it to Money."
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
        el("h2", { class: "k-kicker", text: "Collection budget · " + monthName }),
        el("span", { class: "k-muted", text: "from Money" })
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
          text: limit ? "Money › Budgets →" : "Set a Collection budget in Money", onclick: function () { KOS.show("money", "budgets"); } })
      ]));
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
        queue.appendChild(KOS.ui.emptyState({ compact: true, art: needle ? null : "wishlist", title: copy[0], body: copy[1],
          action: !needle && (tab === "wantToBuy" || tab === "waitingForRelease")
            ? el("button", { type: "button", class: "k-btn k-btn--sm", text: "+ Add item", onclick: function () { itemEditor(null, renderPlanner); } })
            : null }));
        return;
      }
      var draggable = (tab === "wantToBuy" || tab === "waitingForRelease") && pref.sort === "priority" && !needle;
      var list = el("div", { class: "k-pl-list", "data-ui": "plan.list" });
      /* the queue as columns (review B, after the reference planner's
         active-queue table): a header, then one row per item */
      list.appendChild(el("div", { class: "k-pl-row k-pl-row--head", "data-ui": "plan.head", "aria-hidden": "true" },
        ["", "Priority", "Item", "Type", "Release", "Price", "Collection", ""].map(function (t) { return el("span", { class: "k-pl-h", text: t }); })));
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

      /* the release column: the date, then what it means today */
      var dd = daysUntil(it.releaseDate);
      var release = el("span", { class: "k-pl-rel" }, it.releaseDate ? [
        el("span", { class: "k-mono", text: it.releaseDate }),
        el("small", { "data-state": dd > 0 ? "soon" : null, text: dd > 0 ? "Pre-order · in " + dd + (dd === 1 ? " day" : " days") : dd === 0 ? "Out today" : "Available now" })
      ] : [el("small", { text: tab === "waitingForRelease" ? "Date needed" : "No date" })]);
      var tone = rank === 1 ? "high" : rank <= 3 ? "mid" : null;
      facts = facts.filter(function (f) { return f.getAttribute("data-tone") !== "release"; });
      var row = el("article", { class: "k-pl-row", "data-ui": "plan.row", "data-id": String(it.id),
        draggable: draggable ? "true" : null }, [
        lead,
        el("span", { class: "k-pl-prio k-mono", "data-tone": tone, title: "Priority " + rank + " — drag to reorder", text: "#" + rank }),
        el("div", { class: "k-pl-item" }, [
          el("span", { class: "k-pl-cover" }, [KOS.medview.cover(it, MODULE_KANJI[it.module])]),
          el("div", { class: "k-pl-main" }, [
            el("div", { class: "k-pl-title", title: it.title, text: it.title }),
            sub || it.notes ? el("div", { class: "k-pl-sub", text: sub || it.notes }) : null,
            facts.length ? el("div", { class: "k-pl-facts" }, facts) : null
          ].filter(Boolean))
        ]),
        el("span", { class: "k-pl-type" }, [moduleTag(it.module)]),
        release,
        el("span", { class: "k-pl-price k-mono", text: it.price ? money(it.price, it.currency) : "—" }),
        link,
        actions
      ]);
      if (draggable) KOS.ui.state(row, "draggable", true);
      return row;
    }

    /* 27n: Mark purchased says exactly what it will do, then does it */
    function doPurchase(it) {
      var M = KOS.money, was = { status: it.status, price: it.price, priority: it.priority };
      var price = KOS.ui.amountField({ value: it.price ? Math.round(it.price * 100) : null, label: "Paid" });
      var on = el("input", { type: "date", class: "k-input", "aria-label": "On" });
      on.value = dayKey(now());
      var medium = MODULE_LABEL[it.module] || "Collection";
      var vol = it.module === "books" && it.physicalVolumeNumber ? it.physicalVolumeNumber : null;
      var willList = el("div", { class: "k-pl-will" });
      var monthNote = el("p", { class: "k-muted k-pl-guidance" });
      function drawWill() {
        var v = price.value(), money2 = v != null ? (M ? M.format(v) : money(v / 100)) : "the price";
        willList.textContent = "";
        willList.appendChild(el("div", { class: "k-field-label", text: "This will" }));
        [["円", "Add an outgoing of " + money2 + " to Money, in Collection › " + medium + ", on " + on.value.split("-").reverse().slice(0, 2).join("/")],
          ["願", "Move " + it.title + " to Purchased"],
          vol ? ["本", "Mark volume " + vol + " owned on its Books entry (exact; it never lowers what is there)"] : ["蒐", "Add it to the Collection as planned, if it is not there yet"]]
          .forEach(function (x) { willList.appendChild(el("div", { class: "k-pl-will-row" }, [el("span", { class: "k-kanji k-muted", "aria-hidden": "true", text: x[0] }), el("span", { text: x[1] })])); });
        var limit = (data().budget.monthlyLimit || 0), after = currentMonthSpend() + (v || 0) / 100;
        monthNote.textContent = limit ? "Collection would be " + money(after) + " of " + money(limit) + " this month." : "";
      }
      price.input.addEventListener("input", drawWill);
      on.addEventListener("change", drawWill);
      drawWill();
      var overlay = KOS.medview.modalOverlay();
      var go = el("button", { type: "button", class: "k-btn k-btn--primary", "data-ui": "plan.buy-go", text: "Mark purchased", onclick: function () {
        if (!price.validate()) return;
        var v = price.value() / 100, ts = new Date(on.value + "T12:00:00").getTime();
        overlay.close();
        if (v !== it.price) update(it.id, { price: v });
        markPurchased(it.id, isFinite(ts) ? ts : null);
        delete selected[it.id];
        renderPlanner();
        KOS.ui.toast("Added to Money · Collection › " + medium + " · " + (M ? M.format(Math.round(v * 100)) : money(v)), false, {
          label: "View in Transactions", run: function () { KOS.show("money", "transactions"); } });
        if (KOS.a11y) KOS.a11y.announce("Added to Money: Collection, " + medium + ", " + money(v) + ". " + it.title + " moved to Purchased.");
        afterPurchase(it, was);
      } });
      KOS.medview.dialogBox(overlay, "plan.buy-dialog", "Mark purchased", it.title + " · " + medium,
        el("div", { class: "k-dialog-body k-pl-form", "data-ui": "ui.form" }, [
          el("div", { class: "k-pl-two" }, [KOS.medview.field("Paid", price.node), KOS.medview.field("On", on)]),
          el("p", { class: "k-muted k-pl-guidance", text: "The wishlist price; change it if it differed." }),
          willList, monthNote]),
        el("div", { class: "k-dialog-foot" }, [el("span"),
          el("button", { type: "button", class: "k-btn", text: "Cancel", onclick: function () { overlay.close(); } }), go]));
      KOS.ui.openDialog(overlay, { label: "Mark purchased", initialFocus: price.input });
    }
    function afterPurchase(it, was) {
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
      }), { variant: "card", label: "Purchase queue", edge: true }), "plan.tabs"));
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

})();
