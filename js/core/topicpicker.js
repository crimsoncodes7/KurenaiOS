/* Kurenai OS — core/topicpicker.js
   The topic picker (frames 17a–17d): ONE field for every place a record
   names specification topics — Assignments, Exams & Papers, Focus setup,
   the Calendar (study block and exam), and the Pacing row editor.

   It reads the tree from KOS.spec and writes nothing: the owner takes
   value() — "sid:ref" keys, a unit or parent kept AS PICKED — and passes
   it through its own normaliser (invariant 26e). An owner whose contract
   is leaves only (Pacing, invariant 81) expands on save, not here.

     KOS.topicPicker({
       label:    "Related topics",     the field's label
       multi:    true,                 many chips, or one that choosing replaces
       value:    ["compsci:4.2.6.1"],  the starting links
       subject:  "compsci" | fn,       lock to one subject (Focus: one per session)
       levels:   ["paper","unit","parent","leaf"],  what may be picked
       placeholder, onChange(refs)
     }) → { el, value(), set(refs), open(), close(), refresh() }

   The field is a well of chips — subject dot, mono ref, short title, ✕ —
   with "+ Add"; past two lines the rest fold into a "+N" chip. The panel
   opens under the field, fixed so a scrolling dialog never clips it: a
   search over ref and title (matches marked), a subject switch, a level
   switch (Paper · Unit · Parent · Leaf), and the tree at that level with the unit (and parent) above
   each row as quiet headings. ↑↓ move, Space ticks, Tab steps the level,
   Esc closes. Ticking a parent swaps any of its leaves already chosen
   for the whole parent; a leaf under a chosen parent reads as covered. */
(function () {
  "use strict";
  var el = KOS.ui.el;
  var SUBJ = { compsci: "CS", maths: "Maths", it: "IT" };
  var LEVEL_NAME = { paper: "Paper", unit: "Unit", parent: "Parent", leaf: "Leaf" };
  var LEVEL_PLURAL = { paper: "papers", unit: "units", parent: "parents", leaf: "leaves" };
  var uid = 0;

  function short(t) {
    t = String(t || "");
    return t.length > 34 ? t.slice(0, 32).replace(/\s+\S*$/, "") + "…" : t;
  }
  /* node("sid:ref") or node(sid, ref) — the walk below needs both; with
     one argument only, ancestors() stopped at the first parent, so a unit
     pick never absorbed a leaf two levels under it */
  function node(k, ref) { return ref === undefined ? KOS.spec.node(k) : KOS.spec.node(k, ref); }
  /* the ancestors of a key, as keys, nearest first */
  function ancestors(k) {
    var out = [], n = node(k);
    while (n && n.parent) { out.push(n.subject + ":" + n.parent); n = node(n.subject, n.parent); }
    if (n && n.level !== "unit" && n.level !== "paper" && n.unit) out.push(n.subject + ":" + n.unit);
    /* a unit sits in its exam paper (IT's units are their own papers) */
    if (n && n.paper && n.paper !== n.ref) out.push(n.subject + ":" + n.paper);
    return out.filter(function (x, i) { return out.indexOf(x) === i; });
  }
  function isUnder(k, anc) {
    return ancestors(k).indexOf(anc) !== -1;
  }
  /* matched letters, marked */
  function marked(text, q) {
    var span = el("span", {});
    if (!q) { span.textContent = text; return span; }
    var i = text.toLowerCase().indexOf(q);
    if (i === -1) { span.textContent = text; return span; }
    span.appendChild(document.createTextNode(text.slice(0, i)));
    span.appendChild(el("mark", { class: "k-tp-hit", text: text.slice(i, i + q.length) }));
    span.appendChild(document.createTextNode(text.slice(i + q.length)));
    return span;
  }

  function topicPicker(opts) {
    opts = opts || {};
    var multi = opts.multi !== false;
    var levels = (opts.levels || KOS.spec.LEVELS).filter(function (l) { return KOS.spec.LEVELS.indexOf(l) !== -1; });
    var id = "tp" + (++uid);
    function lockedSubject() {
      var s = typeof opts.subject === "function" ? opts.subject() : opts.subject;
      return s && KOS.spec.SUBJECTS.indexOf(s) !== -1 ? s : null;
    }
    function clean(list) {
      var s = lockedSubject();
      var refs = KOS.spec.normaliseRefs(list || [], s ? { subject: s, oneSubject: true } : {});
      refs = refs.filter(function (k) { var n = node(k); return n && levels.indexOf(n.level) !== -1; });
      return multi ? refs : refs.slice(0, 1);
    }
    var sel = clean(opts.value);
    var subjFilter = lockedSubject() || "all";
    var level = levels.indexOf("leaf") !== -1 ? "leaf" : levels[levels.length - 1];
    var query = "";

    /* ---------------- the field ---------------- */
    var root = el("div", { class: "k-field k-tp", "data-ui": "ui.field topic-picker", "data-multi": multi ? "" : null });
    var labelEl = el("span", { class: "k-field-label", id: id + "-l", text: opts.label || (multi ? "Related topics" : "Topic") });
    var countEl = el("span", { class: "k-tp-count", "data-ui": "tp.count" });
    var clearBtn = el("button", { type: "button", class: "k-link k-tp-clear", "data-ui": "tp.clear", text: "Clear",
      onclick: function () { setSel([]); } });
    var head = el("div", { class: "k-tp-head" }, [labelEl, multi ? el("span", { class: "k-tp-meta" }, [countEl, clearBtn]) : null].filter(Boolean));
    var well = el("div", { class: "k-tp-well", role: "group", "aria-labelledby": id + "-l", "data-ui": "tp.well" });
    root.appendChild(head);
    root.appendChild(well);
    /* the whole well opens the panel; its own buttons keep their jobs */
    well.addEventListener("click", function (e) {
      if (!e.target.closest("[data-ui~='tp.remove'], [data-ui~='tp.more'], [data-ui~='tp.add']")) open();
    });

    function chip(k) {
      var n = node(k);
      if (!n) return null;
      var tag = n.level === "leaf" ? null
        : n.level + " · " + n.leafCount + (n.level === "parent" ? (n.leafCount === 1 ? " leaf" : " leaves") : "");
      return el("span", { class: "k-tp-chip", "data-subject": n.subject, "data-ui": "tp.chip", "data-key": k, title: n.ref + " " + n.title }, [
        el("span", { class: "k-tp-dot", "aria-hidden": "true" }),
        el("span", { class: "k-tp-ref k-mono", text: n.ref }),
        el("span", { class: "k-tp-title", text: short(n.title) }),
        tag ? el("span", { class: "k-tp-tag", text: tag }) : null,
        el("button", { type: "button", class: "k-tp-x", "data-ui": "tp.remove", "aria-label": "Remove " + n.ref + " " + n.title, text: "×",
          onclick: function (e) { e.stopPropagation(); setSel(sel.filter(function (x) { return x !== k; })); } })
      ].filter(Boolean));
    }
    var addBtn = el("button", { type: "button", class: "k-tp-add", "data-ui": "tp.add", "aria-haspopup": "dialog", "aria-expanded": "false",
      onclick: function () { if (panel) close(); else open(); } });
    function paintField() {
      well.innerHTML = "";
      sel.map(chip).filter(Boolean).forEach(function (c) { well.appendChild(c); });
      /* single-select with a choice: the caret is the way to change it */
      var caretOnly = !multi && sel.length;
      addBtn.textContent = caretOnly ? "▾" : !sel.length ? (opts.placeholder || (multi ? "+ Add related topics…" : "Choose a topic…")) : "+ Add";
      addBtn.setAttribute("aria-label", caretOnly ? "Change the topic" : multi ? "Add topics" : "Choose a topic");
      KOS.ui.state(addBtn, "empty", !sel.length);
      KOS.ui.state(addBtn, "caret", !!caretOnly);
      well.appendChild(addBtn);
      if (!caretOnly) well.appendChild(el("span", { class: "k-tp-caret", "aria-hidden": "true", text: "▾" }));
      countEl.textContent = sel.length ? sel.length + (sel.length === 1 ? " topic" : " topics") + " ·" : "";
      clearBtn.hidden = !sel.length;
      /* past two lines the rest fold into "+N", which opens the panel */
      if (window.requestAnimationFrame) requestAnimationFrame(fold);
    }
    function fold() {
      if (!multi || !well.isConnected) return;
      var chips = [].slice.call(well.querySelectorAll("[data-ui~='tp.chip']"));
      chips.forEach(function (c) { c.hidden = false; });
      var more = well.querySelector("[data-ui~='tp.more']");
      if (more) more.remove();
      more = null;
      if (chips.length < 2 || !chips[0].offsetHeight) return;
      var limit = chips[0].offsetTop + chips[0].offsetHeight * 1.9;
      function tail() {
        if (more) return more;
        for (var j = chips.length - 1; j >= 0; j--) if (!chips[j].hidden) return chips[j];
        return chips[0];
      }
      var hidden = 0;
      for (var i = chips.length - 1; i >= 1 && tail().offsetTop > limit; i--) {
        chips[i].hidden = true; hidden++;
        if (!more) {
          more = el("button", { type: "button", class: "k-tp-chip k-tp-more", "data-ui": "tp.more", onclick: function () { open(); } });
          well.insertBefore(more, addBtn);
        }
        more.textContent = "+" + hidden;
        more.setAttribute("aria-label", hidden + " more — open the list");
      }
    }
    function setSel(next, keepOpen) {
      sel = clean(next);
      paintField();
      if (panel) paintPanel();
      if (opts.onChange) opts.onChange(sel.slice());
      if (!multi && sel.length && !keepOpen) close();
    }

    /* ---------------- the panel ---------------- */
    var panel = null, search = null, list = null, foot = null, active = -1, rows = [];
    function place() {
      if (!panel) return;
      var r = well.getBoundingClientRect(), vh = window.innerHeight, vw = window.innerWidth;
      var w = Math.min(Math.max(r.width, 360), 480, vw - 16);
      var x = Math.max(8, Math.min(r.left, vw - w - 8));
      var below = vh - r.bottom - 8, above = r.top - 8;
      var up = below < 320 && above > below;
      panel.style.setProperty("--tp-x", Math.round(x) + "px");
      panel.style.setProperty("--tp-w", Math.round(w) + "px");
      panel.style.setProperty("--tp-y", Math.round(up ? r.top - 6 : r.bottom + 6) + "px");
      panel.style.setProperty("--tp-max", Math.round(Math.max(220, up ? above : below)) + "px");
      panel.setAttribute("data-side", up ? "top" : "bottom");
    }
    function onScroll(e) { if (panel && !panel.contains(e.target)) place(); }
    function onDocDown(e) { if (panel && !root.contains(e.target)) close(); }
    function open() {
      if (panel) { if (search) search.focus(); return; }
      subjFilter = lockedSubject() || (subjFilter !== "all" && !lockedSubject() ? subjFilter : "all");
      panel = el("div", { class: "k-tp-panel", role: "dialog", "data-keys-local": "", "aria-label": multi ? "Choose topics" : "Choose a topic", "data-ui": "tp.panel" });
      search = el("input", { type: "search", class: "k-input k-tp-search", "data-ui": "tp.search", placeholder: "Search by reference or title",
        "aria-label": "Search topics by reference or title", "aria-controls": id + "-list" });
      search.value = query;
      search.addEventListener("input", function () { query = search.value; active = 0; paintPanel(); });
      search.addEventListener("keydown", keys);
      var hits = el("span", { class: "k-tp-hits", "data-ui": "tp.hits" });
      panel.appendChild(el("div", { class: "k-tp-searchbox" }, [el("span", { class: "k-tp-glass", "aria-hidden": "true", text: "⌕" }), search, hits]));
      var switches = el("div", { class: "k-tp-switches" });
      if (!lockedSubject()) {
        var subs = el("div", { class: "k-seg k-seg--quiet k-tp-seg", role: "group", "aria-label": "Subjects", "data-ui": "tp.subjects" });
        [["all", "All"]].concat(KOS.spec.SUBJECTS.map(function (s) { return [s, SUBJ[s]]; })).forEach(function (s) {
          subs.appendChild(el("button", { type: "button", class: "k-seg-item", "data-subject": s[0] === "all" ? null : s[0], "data-value": s[0],
            "aria-pressed": String(subjFilter === s[0]),
            onclick: function () { subjFilter = s[0]; active = 0; paintPanel(); } }, [
            s[0] === "all" ? null : el("span", { class: "k-tp-dot", "aria-hidden": "true" }), s[1]
          ].filter(Boolean)));
        });
        switches.appendChild(subs);
      }
      if (levels.length > 1) {
        var lv = el("div", { class: "k-seg k-seg--quiet k-tp-seg", role: "group", "aria-label": "Select by", "data-ui": "tp.levels" });
        levels.forEach(function (l) {
          lv.appendChild(el("button", { type: "button", class: "k-seg-item", "data-value": l, "aria-pressed": String(level === l), text: LEVEL_NAME[l],
            onclick: function () { level = l; active = 0; paintPanel(); } }));
        });
        switches.appendChild(el("span", { class: "k-tp-select-by" }, [el("span", { class: "k-muted", text: "Select" }), lv]));
      }
      panel.appendChild(switches);
      list = el("div", { class: "k-tp-list", id: id + "-list", role: "listbox", "aria-multiselectable": multi ? "true" : "false", "aria-label": "Topics", "data-ui": "tp.list" });
      list.addEventListener("scroll", function () {
        if (drawnTo < pending.length && list.scrollTop + list.clientHeight > list.scrollHeight - 240) drawMore();
      }, { passive: true });
      panel.appendChild(list);
      foot = el("div", { class: "k-tp-foot" });
      panel.appendChild(foot);
      root.appendChild(panel);
      KOS.ui.state(root, "open", true);
      addBtn.setAttribute("aria-expanded", "true");
      active = 0;
      paintPanel();
      place();
      window.addEventListener("scroll", onScroll, true);
      window.addEventListener("resize", place);
      document.addEventListener("pointerdown", onDocDown, true);
      search.focus();
      /* scrolled to the selection */
      var on = list.querySelector("[aria-selected='true']");
      if (on && on.scrollIntoView) on.scrollIntoView({ block: "center" });
    }
    function close() {
      if (!panel) return;
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", place);
      document.removeEventListener("pointerdown", onDocDown, true);
      var had = panel.contains(document.activeElement);
      panel.remove(); panel = null; search = null; list = null; foot = null; rows = [];
      KOS.ui.state(root, "open", false);
      addBtn.setAttribute("aria-expanded", "false");
      if (had) addBtn.focus();
    }

    /* the rows at the current level, with the headings each one sits under */
    function entries() {
      var subs = lockedSubject() ? [lockedSubject()] : subjFilter === "all" ? KOS.spec.SUBJECTS : [subjFilter];
      var q = query.trim().toLowerCase();
      var out = [], count = 0;
      subs.forEach(function (sid) {
        var nodes = KOS.spec.levelNodes(sid, level);
        /* a subject with no parent level (Maths) offers its units there,
           and so does one whose units are their own papers (IT) */
        if (!nodes.length && (level === "parent" || level === "paper")) nodes = KOS.spec.units(sid);
        var lastUnit = null, lastParent = null;
        nodes.forEach(function (n) {
          if (q && n.ref.toLowerCase().indexOf(q) === -1 && n.title.toLowerCase().indexOf(q) === -1) return;
          count++;
          if (n.level !== "unit" && n.level !== "paper" && n.unit !== lastUnit) {
            var u = KOS.spec.node(sid, n.unit);
            out.push({ head: "unit", node: u });
            lastUnit = n.unit; lastParent = null;
          }
          if (n.level === "leaf" && n.parent && n.parent !== n.unit && n.parent !== lastParent) {
            out.push({ head: "parent", node: KOS.spec.node(sid, n.parent) });
            lastParent = n.parent;
          }
          out.push({ row: true, node: n });
        });
      });
      return { items: out, count: count, q: q };
    }
    function stateOf(k) {
      if (sel.indexOf(k) !== -1) return "on";
      if (sel.some(function (s) { return isUnder(k, s); })) return "covered";
      if (sel.some(function (s) { return isUnder(s, k); })) return "part";
      return "off";
    }
    function paintPanel() {
      if (!panel) return;
      panel.querySelectorAll("[data-ui~='tp.subjects'] .k-seg-item").forEach(function (b) {
        var on = b.getAttribute("data-value") === subjFilter;
        b.setAttribute("aria-pressed", String(on)); KOS.ui.state(b, "active", on);
      });
      panel.querySelectorAll("[data-ui~='tp.levels'] .k-seg-item").forEach(function (b) {
        var on = b.getAttribute("data-value") === level;
        b.setAttribute("aria-pressed", String(on)); KOS.ui.state(b, "active", on);
      });
      var e = entries();
      var hits = panel.querySelector("[data-ui~='tp.hits']");
      hits.textContent = e.q ? e.count + " " + (e.count === 1 ? LEVEL_NAME[level].toLowerCase() : LEVEL_PLURAL[level]) : "";
      list.innerHTML = "";
      rows = [];
      if (!e.items.length) {
        list.appendChild(el("p", { class: "k-tp-empty", text: e.q ? "Nothing matches “" + query.trim() + "”." : "Nothing to pick here." }));
      }
      /* drawn in batches of BATCH rows as the list scrolls — a whole
         subject is never on the page at once */
      pending = e.items; drawnTo = 0; lastQ = e.q;
      drawMore();
      /* the selection, scrolled to, must be drawn */
      var want = sel[0] && pending.findIndex ? pending.findIndex(function (it) { return it.row && it.node.key === sel[0]; }) : -1;
      while (want >= drawnTo && drawnTo < pending.length) drawMore();
      if (active >= rows.length) active = rows.length - 1;
      markActive(false);
      foot.innerHTML = "";
      foot.appendChild(el("b", { "data-ui": "tp.selected", text: sel.length + " selected" }));
      if (sel.length) foot.appendChild(el("button", { type: "button", class: "k-link", text: "Clear", onclick: function () { setSel([], true); } }));
      foot.appendChild(el("span", { class: "k-tp-keys k-mono", "aria-hidden": "true", text: "↑↓ move · ␣ select" + (levels.length > 1 ? " · ⇥ level" : "") + " · Esc" }));
      foot.appendChild(el("button", { type: "button", class: "k-btn k-btn--primary k-btn--sm", "data-ui": "tp.done", text: "Done", onclick: close }));
    }
    var BATCH = 60, pending = [], drawnTo = 0, lastQ = "";
    function drawMore() {
      var added = 0;
      while (drawnTo < pending.length && added < BATCH) {
        var it = pending[drawnTo++], n = it.node;
        if (it.head) {
          list.appendChild(el("div", { class: "k-tp-h", "data-level": it.head, "data-subject": n.subject, role: "presentation" }, [
            it.head === "unit" ? el("span", { class: "k-tp-dot", "aria-hidden": "true" }) : null,
            el("span", { class: "k-mono", text: n.ref }), " " + n.title
          ].filter(Boolean)));
          continue;
        }
        list.appendChild(rowFor(n));
        added++;
      }
    }
    function rowFor(n) {
      var k = n.key, st = stateOf(k);
      var idx = rows.length;
      var row = el("div", { class: "k-tp-row", role: "option", id: id + "-o" + idx, "data-ui": "tp.row", "data-key": k, "data-subject": n.subject,
        "aria-selected": String(st === "on"), "aria-disabled": st === "covered" ? "true" : null, tabindex: "-1",
        title: st === "covered" ? "Covered by a topic already chosen" : null,
        onclick: function () { active = idx; toggle(k); } }, [
        el("span", { class: "k-tp-box", "data-state": st, "aria-hidden": "true" }),
        el("span", { class: "k-tp-ref k-mono" }, [marked(n.ref, lastQ)]),
        el("span", { class: "k-tp-rt" }, [marked(n.title, lastQ)]),
        n.level !== "leaf" ? el("span", { class: "k-tp-n", text: n.leafCount + (n.leafCount === 1 ? " leaf" : " leaves") }) : null
      ].filter(Boolean));
      rows.push(row);
      return row;
    }
    function markActive(scroll) {
      rows.forEach(function (r, i) { KOS.ui.state(r, "active", i === active); });
      var r = rows[active];
      if (search) {
        if (r) search.setAttribute("aria-activedescendant", r.id);
        else search.removeAttribute("aria-activedescendant");
      }
      if (r && scroll && r.scrollIntoView) r.scrollIntoView({ block: "nearest" });
    }
    function toggle(k) {
      var st = stateOf(k);
      if (st === "covered") return;
      if (!multi) { setSel(st === "on" ? [] : [k]); return; }
      var next;
      if (st === "on") next = sel.filter(function (x) { return x !== k; });
      /* a parent or unit takes the place of anything under it */
      else next = sel.filter(function (x) { return !isUnder(x, k); }).concat(k);
      setSel(next, true);
      if (search) search.focus();
    }
    function keys(e) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (!rows.length) return;
        if (e.key === "ArrowDown" && active >= rows.length - 1 && drawnTo < pending.length) drawMore();
        active = Math.max(0, Math.min(rows.length - 1, active + (e.key === "ArrowDown" ? 1 : -1)));
        markActive(true);
      } else if ((e.key === " " && !search.value.trim().length) || e.key === "Enter") {
        /* Space ticks while nothing is typed; Enter always ticks */
        if (rows[active]) { e.preventDefault(); toggle(rows[active].getAttribute("data-key")); }
      } else if (e.key === "Tab" && levels.length > 1 && !e.altKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        var i = levels.indexOf(level);
        level = levels[(i + (e.shiftKey ? levels.length - 1 : 1)) % levels.length];
        active = 0;
        paintPanel();
      } else if (e.key === "Escape") {
        e.preventDefault(); e.stopPropagation();
        close();
      }
    }

    paintField();
    return {
      el: root,
      value: function () { return sel.slice(); },
      set: function (refs) { sel = clean(refs); paintField(); if (panel) paintPanel(); },
      open: open,
      close: close,
      isOpen: function () { return !!panel; },
      /* the owner's subject changed: links outside it go (Focus, Pacing) */
      refresh: function () { var n = clean(sel); var changed = n.join() !== sel.join(); sel = n; paintField(); if (panel) paintPanel(); if (changed && opts.onChange) opts.onChange(sel.slice()); }
    };
  }

  KOS.topicPicker = topicPicker;
})();
