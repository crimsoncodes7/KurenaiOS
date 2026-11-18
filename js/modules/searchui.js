/* Kurenai OS — modules/searchui.js
   The header search box's controller: the one shared spec search (KOS.hub.search,
   also the Assistant's), the listbox and its keyboard, and the two seams a presenter
   gets (KOS.hub.dismissSearch, KOS.hub.onSearchChosen). Loads straight after hub.js.
   Split out of hub.js (W8, the quality audit's AP-09); the shared
   derivations, the spine and the spec renderers stay in hub.js and
   reach this file through KOS.hub._. */
(function () {
  "use strict";
  var el = KOS.ui.el, store = KOS.store, H = KOS.hub._;
  var BYREF = H.BYREF, SEARCH_INDEX = H.SEARCH_INDEX, plainSpec = H.plainSpec, warmSearch = H.warmSearch;

  /* ---------- search ---------- */
  var input = document.getElementById("search");
  /* the shell's text glyph rendered at half the bell's size: drawn instead */
  var glyph = document.querySelector("#searchbox .k-search-glyph");
  if (glyph && !glyph.querySelector("svg")) { glyph.textContent = ""; glyph.appendChild(KOS.ui.icon("search")); }
  var resultsEl = document.getElementById("search-results");
  var selIdx = -1;

  /* The one shared spec-search: the topbar box and the assistant's
     search tool (Category 6) both call THIS, so ranking and snippets can
     never diverge. Returns [{subject, ref, title, fcHit, snippet}], spec
     -wording matches outranking flashcard-only matches, capped at 30.
     The snippet is display text, NOT canonical content — resolve the ref
     for the real thing. */
  function searchSpec(q) {
    q = String(q || "").trim().toLowerCase();
    if (q.length < 2) return [];
    warmSearch();
    var terms = q.split(/\s+/);
    var found = [], M = KOS.search && KOS.search.more;   /* ranking and notes: the lazy search bundle */
    SEARCH_INDEX.forEach(function (it, order) {
      var kind;      /* 0 spec wording, 1 flashcard, 2 notes */
      if (terms.every(function (t) { return it.text.indexOf(t) !== -1; })) kind = 0;
      else if (it.fctext && terms.every(function (t) { return (it.text + " " + it.fctext).indexOf(t) !== -1; })) kind = 1;
      else {
        var nt = M ? M.noteText(it) : "";
        if (nt && terms.every(function (t) { return (it.text + " " + it.fctext + " " + nt).indexOf(t) !== -1; })) kind = 2;
        else return;
      }
      found.push({ it: it, kind: kind, order: order, tier: M ? M.tier(it, q, terms, kind) : 0 });
    });
    found.sort(function (a, b) { return a.tier - b.tier || a.order - b.order; });
    return found.slice(0, 30).map(function (f) {
      var it = f.it, leaf = BYREF[it.subject][it.ref];
      var joined = f.kind === 1 ? it.fctext : f.kind === 2 ? M.noteText(it) : plainSpec(leaf.content.join(" "));
      var pos = joined.toLowerCase().indexOf(terms[0]);
      var snip = pos >= 0
        ? "…" + joined.slice(Math.max(0, pos - 30), pos + 90) + "…"
        : plainSpec(leaf.content[0]);
      return { subject: it.subject, ref: it.ref, title: it.title, fcHit: f.kind === 1, noteHit: f.kind === 2, snippet: snip };
    });
  }

  /* ---- the topbar listbox (Category 7 Phase F) ----
     The ranking and the domains live in core/search.js; this is only the
     control. It is a real combobox: the input owns `aria-expanded` and
     `aria-activedescendant`, every result is a `role="option"` with an id,
     and the domain headings are `role="group"` wrappers rather than fake
     options \u2014 so \u2193 walks results and never lands on a heading.

     `KOS.search.run` calls back TWICE (memory first, IndexedDB second), so
     every callback re-checks that the query it answers is still the one in
     the box; a slow vault read can never overwrite a newer keystroke. */
  var options = [];          // flat list of the rendered option nodes
  var seq = 0;               // guards against a stale async answer

  function setExpanded(on) {
    KOS.ui.state(resultsEl, "open", !!on);
    input.setAttribute("aria-expanded", String(!!on));
    if (!on) {
      input.removeAttribute("aria-activedescendant");
      selIdx = -1;
    }
  }

  /* the phone sheet's domain chips (frame 15a): All, then the app section
     each result group belongs to. They filter the painted groups; ranking
     and routing stay core/search.js's. CSS shows them on a phone only. */
  /* a chip is the rail's own section of the group's view (SH-06) */
  function sectionOfGroup(g) {
    var sec = g.view && KOS.sectionOf ? KOS.sectionOf(g.view) : null;
    return sec ? (sec === "system" ? "Archive" : sec.charAt(0).toUpperCase() + sec.slice(1)) : "Pages";
  }
  var searchScope = null, lastPaint = null;
  function scopeChips(groups) {
    var counts = { All: 0 };
    groups.forEach(function (g) {
      var sec = sectionOfGroup(g);
      counts[sec] = (counts[sec] || 0) + g.items.length;
      counts.All += g.items.length;
    });
    if (searchScope && !counts[searchScope]) searchScope = null;
    return el("div", { class: "k-sr-scopes", "data-ui": "search.scopes", role: "group", "aria-label": "Search in" },
      Object.keys(counts).map(function (sec) {
        var on = sec === "All" ? !searchScope : searchScope === sec;
        return el("button", { type: "button", class: "k-chip k-sr-scope", "data-ui": "search.scope", "aria-pressed": String(on),
          onclick: function (e) {
            e.stopPropagation();
            searchScope = sec === "All" ? null : sec;
            if (lastPaint) paint(lastPaint.groups, lastPaint.q, lastPaint.done);
            input.focus();
          } }, [sec + " ", el("span", { class: "k-sr-scope-n", text: String(counts[sec]) })]);
      }));
  }

  function paint(groups, q, done) {
    resultsEl.innerHTML = "";
    options = [];
    selIdx = -1;
    input.removeAttribute("aria-activedescendant");
    lastPaint = { groups: groups, q: q, done: done };
    var total = 0;
    if (groups.length) resultsEl.appendChild(scopeChips(groups));
    groups = groups.filter(function (g) { return !searchScope || sectionOfGroup(g) === searchScope; });
    groups.forEach(function (g) {
      var wrap = el("div", { class: "k-sr-group", role: "group", "aria-label": g.label });
      wrap.appendChild(el("div", { class: "k-sr-group-h", "aria-hidden": "true" }, [
        el("span", { text: g.label }),
        el("span", { class: "k-sr-group-n", text: String(g.items.length) })
      ]));
      g.items.forEach(function (it) {
        var id = "sr-opt-" + (++optSeq);
        var node = el("div", { class: "k-sr-item", "data-ui": "search.result", role: "option", id: id, "aria-selected": "false" }, [
          el("span", { class: "k-sr-main" }, [
            el("span", { class: "k-sr-title", text: it.title }),
            it.sub ? el("span", { class: "k-sr-sub", "data-ui": "search.result-sub", text: it.sub }) : null
          ].filter(Boolean)),
          it.meta ? el("span", { class: "k-sr-snip", text: it.meta }) : null
        ].filter(Boolean));
        node.addEventListener("click", function () { choose(node); });
        node._open = it.open;
        options.push(node);
        wrap.appendChild(node);
        total++;
      });
      resultsEl.appendChild(wrap);
    });
    if (!total) {
      resultsEl.appendChild(el("div", { class: "k-sr-empty", "data-ui": "search.empty" }, [
        el("b", { text: "Nothing matches \u201C" + q + "\u201D." }),
        el("span", { text: done
          ? "Searched the pages, the specifications, your notes, the Collection, reminders, assignments, the calendar and your creative work."
          : "Still searching the Collection\u2026" })
      ]));
    }
    setExpanded(true);
    /* announce the count, not the results \u2014 the list is right there, and
       reading eight titles over the user's typing helps nobody */
    if (done) {
      var counter = document.getElementById("search-count");
      if (counter) {
        counter.textContent = total
          ? total + " result" + (total === 1 ? "" : "s") + " in " + groups.length +
            " section" + (groups.length === 1 ? "" : "s") + ". Use the arrow keys to review."
          : "No results.";
      }
    }
  }
  var optSeq = 0;

  function runSearch(q) {
    var mine = ++seq;
    if (q.trim().length < (KOS.search ? KOS.search.MIN_LEN : 2)) {
      resultsEl.innerHTML = "";
      options = [];
      setExpanded(false);
      return;
    }
    KOS.search.run(q, function (groups, done) {
      if (mine !== seq) return;                 /* a newer keystroke owns the box */
      paint(groups, q, done);
    });
  }

  /* ---- the ONE dismissal path (Category 7 E+F integration) ----
     Phase E's phone presenter MOVES this same #searchbox into a bottom
     sheet and moves it back on close — there is no second search input,
     no second result list and no second controller. What it cannot do
     from outside is retract the controller's state, and hiding the panel
     with a class does not: `aria-expanded` would still say "true" over a
     list that is gone, `aria-activedescendant` would still name a removed
     option, and an in-flight `KOS.search.run` answer (the vault read is
     asynchronous) would repaint the panel after it had been dismissed.

     So dismissal lives here, once, and both presentations call it.
     `preserveQuery` is what the phone sheet wants: closing the sheet is
     not the same act as abandoning the search, so reopening it should
     find the query still there. */
  function dismissSearch(opts) {
    opts = opts || {};
    seq++;                                  /* any pending answer is now stale */
    lastPaint = null;
    options = [];
    resultsEl.innerHTML = "";
    setExpanded(false);                     /* clears aria-expanded + activedescendant + selIdx */
    if (!opts.preserveQuery) input.value = "";
    var counter = document.getElementById("search-count");
    if (counter) counter.textContent = "";
  }

  /* A presentation layer (Phase E's phone sheet) needs to know that a
     result was chosen, so it can dismiss itself before the route changes.
     It used to find that out by intercepting the click and the Enter key
     ahead of this controller — which raced it: whichever listener ran
     first won, and on Enter the sheet's close emptied `options` before
     this function could read it, so the sheet closed and nothing
     navigated. The controller announces the decision instead. */
  var chosenListeners = [];
  function onSearchChosen(fn) { if (typeof fn === "function") chosenListeners.push(fn); }

  function choose(node) {
    if (!node || typeof node._open !== "function") return;
    dismissSearch();                        /* a chosen result abandons the query */
    chosenListeners.forEach(function (fn) {
      try { fn(); } catch (e) { /* a presenter must not block navigation */ }
    });
    node._open();                           /* …and the route change is last */
  }

  function moveSel(delta) {
    if (!options.length) return;
    selIdx = (selIdx + delta + options.length) % options.length;
    options.forEach(function (n, i) {
      var on = i === selIdx;
      KOS.ui.state(n, "sel", on);
      n.setAttribute("aria-selected", String(on));
    });
    var cur = options[selIdx];
    input.setAttribute("aria-activedescendant", cur.id);
    if (cur.scrollIntoView) cur.scrollIntoView({ block: "nearest" });
  }

  input.addEventListener("input", function () { runSearch(input.value); });
  input.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown") { e.preventDefault(); moveSel(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); moveSel(-1); }
    else if (e.key === "Home" && options.length) { e.preventDefault(); selIdx = -1; moveSel(1); }
    else if (e.key === "End" && options.length) { e.preventDefault(); selIdx = 0; moveSel(-1); }
    else if (e.key === "Enter" && selIdx >= 0) { e.preventDefault(); choose(options[selIdx]); }
    else if (e.key === "Escape") { e.preventDefault(); dismissSearch({ preserveQuery: true }); input.blur(); }
  });
  document.addEventListener("click", function (e) {
    if (!document.getElementById("searchbox").contains(e.target)) dismissSearch({ preserveQuery: true });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
    var a = document.activeElement;
    if (a === input || !a) return;
    /* "/" is a character in a text field and a shortcut everywhere else —
       contenteditable counts as a text field (the assistant composer) */
    if (/INPUT|TEXTAREA|SELECT/.test(a.tagName) || a.isContentEditable) return;
    if (KOS.ui.topDialog && KOS.ui.topDialog()) return;   /* a modal owns the keyboard */
    e.preventDefault();
    input.focus();
  });

  KOS.hub.search = searchSpec;
  /* the two seams a search PRESENTER needs, and the only two it gets:
     dismissSearch retracts this controller's async and ARIA state,
     onSearchChosen says a result was picked (before the route changes) */
  KOS.hub.dismissSearch = dismissSearch;
  KOS.hub.onSearchChosen = onSearchChosen;
})();
