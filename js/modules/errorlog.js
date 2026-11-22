/* Kurenai OS — modules/errorlog.js (lazy bundle "page-errorlog")
   Universal Error Log hub, Quick Error Drill, and 1-Tap Quick Capture Sheet.
   - Zero boot weight (loaded on first visit to #/errorlog or openCapture).
   - Pure reads on render; every write passes through KOS.errorLog with Undo.
   - Uses KOS.ui.openDialog for capture/edit; never touches Governor or sessions. */
(function () {
  "use strict";
  var el = KOS.ui.el;
  var E = function () { return KOS.errorLog; };
  var BAR_TONES = ["var(--crimson)", "var(--amber)", "var(--maths)", "var(--teal)", "var(--it)"];
  var PAGE_SIZE = 20;

  function relTime(ts) {
    if (!ts) return "";
    var diff = Math.max(0, Date.now() - ts);
    var m = Math.floor(diff / 60000);
    if (m < 1) return "Just now";
    if (m < 60) return m + "m ago";
    var h = Math.floor(m / 60);
    if (h < 24) return h + "h ago";
    var d = Math.floor(h / 24);
    if (d === 1) return "Yesterday";
    if (d < 14) return d + "d ago";
    return new Date(ts).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  }
  function subjMeta(id) {
    return (E().SUBJ_MAP && E().SUBJ_MAP[id]) || { id: id || "general", label: "General", short: "General", hue: "var(--muted)" };
  }
  function srcLabel(id) {
    return (E().SOURCE_MAP && E().SOURCE_MAP[id]) || "Manual";
  }

  /* ============================================================
     QUICK CAPTURE & EDIT DIALOG
     Pre-filled capture (Ink/Quiz/Code/Ja/Paper) shows a compact context
     pill; manual capture shows Subject + optional Topic fields.
     Delete lives strictly here (never on card footers), with Undo toast.
     ============================================================ */
  function openDialog(specOrEntry, onSaved) {
    var existing = specOrEntry && specOrEntry.id ? E().get(specOrEntry.id) : null;
    var creating = !existing;
    var seed = existing || specOrEntry || {};
    var prefilled = creating && seed.source && seed.source !== "manual";
    var overlay;
    function close() { if (overlay && overlay.close) overlay.close(); }

    var pickedTypes = (Array.isArray(seed.mistakeTypes) ? seed.mistakeTypes : []).slice();
    var subjSel = el("select", { class: "k-input k-el-sel", "aria-label": "Subject or space", "data-ui": "errorlog.dlg-subject" },
      E().SUBJECTS.map(function (s) {
        var o = el("option", { value: s.id, text: s.label });
        if ((seed.subject || "compsci") === s.id) o.selected = true;
        return o;
      }));
    var topicIn = el("input", { type: "text", class: "k-input", "data-ui": "errorlog.dlg-topic",
      placeholder: "e.g. 4.3.2.1 or Integration by parts", "aria-label": "Topic or reference (optional)" });
    topicIn.value = seed.topicTitle || seed.topicRef || "";

    var titleIn = el("input", { type: "text", class: "k-input", "data-ui": "errorlog.dlg-title",
      placeholder: "What question, problem, or step tripped you up?", "aria-label": "Question or task" });
    titleIn.value = seed.title || "";

    var wrongIn = el("textarea", { class: "k-input", rows: 2, "data-ui": "errorlog.dlg-wrong",
      placeholder: "Why did that slip happen? (optional)", "aria-label": "What went wrong" });
    wrongIn.value = seed.wrongNote || "";

    var ruleIn = el("textarea", { class: "k-input", rows: 2, "data-ui": "errorlog.dlg-rule",
      placeholder: "One short rule to avoid it next time… (optional)", "aria-label": "Rule for next time" });
    ruleIn.value = seed.ruleNote || "";

    var chipsWrap = el("div", { class: "k-el-chips", role: "group", "aria-label": "Mistake types" },
      E().MISTAKE_TYPES.map(function (t) {
        var on = pickedTypes.indexOf(t.id) !== -1;
        var b = el("button", { type: "button", class: "k-el-tag", "data-ui": "errorlog.dlg-type",
          "aria-pressed": String(on), text: t.label,
          onclick: function () {
            var i = pickedTypes.indexOf(t.id);
            if (i === -1) pickedTypes.push(t.id); else pickedTypes.splice(i, 1);
            var nowOn = i === -1;
            b.setAttribute("aria-pressed", String(nowOn));
            KOS.ui.state(b, "on", nowOn);
          } });
        if (on) KOS.ui.state(b, "on", true);
        return b;
      }));

    function save() {
      var ttl = titleIn.value.trim();
      if (!ttl) { KOS.ui.toast("Give the mistake a short title.", true); titleIn.focus(); return; }
      var data = {
        title: ttl,
        wrongNote: wrongIn.value.trim(),
        ruleNote: ruleIn.value.trim(),
        mistakeTypes: pickedTypes.slice()
      };
      if (creating && !prefilled) {
        data.subject = subjSel.value;
        var rawTop = topicIn.value.trim();
        data.topicRef = rawTop || null;
        data.topicTitle = rawTop;
        data.source = seed.source || "manual";
      } else if (creating) {
        data.subject = seed.subject || "general";
        data.space = seed.space || undefined;
        data.topicRef = seed.topicRef || null;
        data.topicTitle = seed.topicTitle || "";
        data.source = seed.source || "manual";
        data.context = seed.context || "";
        data.deepLink = seed.deepLink || null;
        data.dedupeKey = seed.dedupeKey || null;
      }
      var saved = creating ? E().add(data) : E().update(existing.id, data);
      KOS.ui.toast(creating ? "Saved to Error Log." : "Mistake updated.");
      close();
      if (onSaved) onSaved(saved);
    }

    var sm = subjMeta(seed.subject);
    var ctxPill = (prefilled || !creating) ? (function () {
      var parts = [sm.short, seed.topicRef || seed.topicTitle || null, srcLabel(seed.source)].filter(Boolean);
      var c = el("span", { class: "k-chip k-el-ctxpill", text: parts.join(" · ") });
      c.style.setProperty("--chip-c", sm.hue);
      return c;
    })() : null;

    var bodyKids = [];
    if (creating && !prefilled) {
      bodyKids.push(el("div", { class: "k-el-fgrid" }, [
        el("label", { class: "k-field" }, [el("span", { class: "k-field-label", text: "Subject / Space" }), subjSel]),
        el("label", { class: "k-field" }, [el("span", { class: "k-field-label", text: "Topic (optional)" }), topicIn])
      ]));
    }
    if (seed.context) {
      bodyKids.push(el("p", { class: "k-el-ctx", text: seed.context }));
    }
    bodyKids.push(
      el("label", { class: "k-field" }, [el("span", { class: "k-field-label", text: "Question or task" }), titleIn]),
      el("div", { class: "k-field" }, [el("span", { class: "k-field-label", text: "Mistake type (optional, 1-tap)" }), chipsWrap]),
      el("label", { class: "k-field" }, [el("span", { class: "k-field-label", text: "What went wrong" }), wrongIn]),
      el("label", { class: "k-field" }, [el("span", { class: "k-field-label", text: "Rule for next time" }), ruleIn])
    );

    var delBtn = !creating ? el("button", {
      type: "button", class: "k-btn k-btn--danger k-btn--sm", "data-intent": "danger", "data-ui": "errorlog.dlg-delete",
      text: "Delete mistake",
      onclick: function () {
        var snap = E().remove(existing.id);
        close();
        KOS.ui.toast("Mistake removed.", false, snap ? {
          label: "Undo",
          run: function () { E().restore(snap); if (onSaved) onSaved(snap); else KOS.rerender(); }
        } : null);
        if (onSaved) onSaved(null);
      }
    }) : null;

    overlay = el("div", { class: "k-dialog-overlay" });
    overlay.close = function () { overlay.remove(); };
    overlay.appendChild(el("div", { class: "k-dialog k-el-dlg", "data-ui": "ui.dialog errorlog.dlg" }, [
      el("div", { class: "k-dialog-head", "data-ui": "ui.dialog-head" }, [
        el("h2", { class: "k-dialog-title", "data-ui": "ui.dialog-title", text: creating ? "Log mistake" : "Edit mistake" }),
        ctxPill,
        el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", text: "✕", "aria-label": "Close", onclick: close })
      ].filter(Boolean)),
      el("div", { class: "k-dialog-body k-el-dlg-body" }, bodyKids),
      el("div", { class: "k-dialog-foot", "data-ui": "errorlog.dlg-actions" }, [
        el("button", { type: "button", class: "k-btn", text: "Cancel", onclick: close }),
        el("button", { type: "button", class: "k-btn k-btn--primary k-spacer", "data-intent": "primary", "data-ui": "errorlog.dlg-save",
          text: creating ? "Save to Error Log" : "Save changes", onclick: save })
      ]),
      delBtn ? el("div", { class: "k-el-dlg-danger" }, [delBtn]) : null
    ].filter(Boolean)));
    KOS.ui.openDialog(overlay, { label: creating ? "Log mistake" : "Edit mistake" });
    (titleIn.value ? wrongIn : titleIn).focus();
  }

  /* ============================================================
     QUICK ERROR DRILL (#/errorlog/drill)
     ============================================================ */
  function renderDrill(main, arg) {
    var filter = { status: "open" };
    if (arg && arg.subject) filter.subject = arg.subject;
    if (arg && arg.topicRef) filter.topicRef = arg.topicRef;
    var queue = E().all(filter);
    var idx = 0, revealed = false, resolvedN = 0, revisitedN = 0;

    main.appendChild(KOS.ui.pageHeader({
      kicker: "Study · Error Log",
      title: "Quick Error Drill",
      sub: "Recall what went wrong and the rule before revealing your note.",
      actions: [
        el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "errorlog.drill-back",
          text: "← Back to Error Log",
          onclick: function () { KOS.show("errorlog", arg && arg.subject ? { subject: arg.subject, topicRef: arg.topicRef } : undefined); } })
      ]
    }));

    var stage = el("div", { class: "k-el-drill-wrap", "data-ui": "errorlog.drill" });
    main.appendChild(stage);

    function paint() {
      stage.innerHTML = "";
      if (!queue.length || idx >= queue.length) {
        stage.appendChild(KOS.ui.emptyState({
          mark: "省",
          title: queue.length ? "Drill complete" : "No open errors to drill",
          body: queue.length
            ? "You reviewed " + queue.length + (queue.length === 1 ? " mistake" : " mistakes")
              + " (" + resolvedN + " resolved · " + revisitedN + " marked to revisit)."
            : "Every mistake in this filter is resolved. Nice work.",
          action: el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary",
            text: "← Back to Error Log",
            onclick: function () { KOS.show("errorlog"); } })
        }));
        return;
      }
      var cur = E().get(queue[idx].id) || queue[idx];
      var sm = subjMeta(cur.subject);
      var linked = E().hasLinkedCard(cur);
      var card = el("section", { class: "k-card k-el-drill", "data-ui": "errorlog.drill-card" });
      card.style.setProperty("--el-hue", sm.hue);

      var headRow = el("div", { class: "k-el-chead" }, [
        el("span", { class: "k-kicker k-el-drill-k", text: "DRILL · " + (idx + 1) + " OF " + queue.length }),
        el("span", { class: "k-el-dot", "aria-hidden": "true" }),
        el("span", { class: "k-el-subj", text: sm.label }),
        cur.topicTitle || cur.topicRef ? el("span", { class: "k-el-topic", text: cur.topicTitle || cur.topicRef }) : null,
        el("span", { class: "k-chip", text: srcLabel(cur.source) }),
        cur.reviewCount ? el("span", { class: "k-el-meta", text: "Revisited ×" + cur.reviewCount }) : null
      ].filter(Boolean));

      card.appendChild(headRow);
      card.appendChild(el("h2", { class: "k-el-drill-q", text: cur.title }));
      if (cur.context) card.appendChild(el("p", { class: "k-el-ctx", text: cur.context }));

      if (!revealed) {
        card.appendChild(el("div", { class: "k-el-drill-prompt" }, [
          el("p", { class: "k-muted", text: "Think first: why did this happen, and what rule stops it next time?" }),
          el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "errorlog.drill-reveal",
            "aria-keyshortcuts": "Space", text: "Reveal fix & rule",
            onclick: function () { revealed = true; paint(); } })
        ]));
      } else {
        var notes = [];
        if (cur.wrongNote) notes.push(el("div", { class: "k-el-note" }, [
          el("span", { class: "k-el-notek", text: "What went wrong" }),
          el("span", { class: "k-el-notet", text: cur.wrongNote })
        ]));
        if (cur.ruleNote) notes.push(el("div", { class: "k-el-note k-el-note--rule" }, [
          el("span", { class: "k-el-notek", text: "Rule for next time" }),
          el("span", { class: "k-el-notet", text: cur.ruleNote })
        ]));
        if (!notes.length) notes.push(el("div", { class: "k-el-note" }, [
          el("span", { class: "k-el-notek", text: "No reflection note yet" }),
          el("span", { class: "k-el-notet", text: "Edit this mistake to write a rule for next time." })
        ]));
        card.appendChild(el("div", { class: "k-el-notes k-el-notes--stack" }, notes));

        if (cur.mistakeTypes && cur.mistakeTypes.length) {
          card.appendChild(el("div", { class: "k-el-chips" }, cur.mistakeTypes.map(function (t) {
            var tag = el("span", { class: "k-el-tag", text: E().TYPE_MAP[t] || t });
            KOS.ui.state(tag, "on", true);
            return tag;
          })));
        }
        card.appendChild(el("div", { class: "k-el-cfoot" }, [
          el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "errorlog.drill-revisit", "aria-keyshortcuts": "1",
            text: "Still shaky (Revisit later)",
            onclick: function () {
              E().markRevisited(cur.id);
              revisitedN++;
              idx++; revealed = false;
              paint();
            } }),
          el("button", { type: "button", class: "k-btn k-btn--sm k-btn--primary", "data-intent": "primary", "data-ui": "errorlog.drill-resolve",
            "aria-keyshortcuts": "2", text: "✓ Got it (Mark resolved)",
            onclick: function () {
              var prevSt = cur.status;
              E().setStatus(cur.id, "resolved");
              resolvedN++;
              KOS.ui.toast("Marked resolved.", false, {
                label: "Undo",
                run: function () { E().setStatus(cur.id, prevSt); KOS.rerender(); }
              });
              idx++; revealed = false;
              paint();
            } }),
          el("button", { type: "button", class: "k-btn k-btn--sm k-btn--quiet k-spacer", "data-ui": "errorlog.drill-card-push",
            text: linked ? "✓ In flashcard deck" : "→ Flashcard",
            onclick: function () {
              var r = E().toFlashcard(cur.id);
              KOS.ui.toast(r.already ? "Already in your flashcard deck." : "Added to flashcard deck.");
              paint();
            } })
        ]));
      }
      card.appendChild(el("p", { class: "k-el-drill-keys", text: "Shortcuts: Space reveal · 1 still shaky · 2 resolved" }));
      stage.appendChild(card);
    }

    function onKey(ev) {
      if (ev.target && /^(INPUT|TEXTAREA|SELECT)$/.test(ev.target.tagName)) return;
      if (document.querySelector("[data-ui~='ui.dialog']")) return;
      if (!queue.length || idx >= queue.length) return;
      if (ev.code === "Space" && !revealed) { ev.preventDefault(); revealed = true; paint(); }
      else if (revealed && ev.key === "1") { ev.preventDefault(); var b1 = stage.querySelector("[data-ui~='errorlog.drill-revisit']"); if (b1) b1.click(); }
      else if (revealed && ev.key === "2") { ev.preventDefault(); var b2 = stage.querySelector("[data-ui~='errorlog.drill-resolve']"); if (b2) b2.click(); }
    }
    document.addEventListener("keydown", onKey);
    if (KOS.view && KOS.view.onDispose) KOS.view.onDispose(function () { document.removeEventListener("keydown", onKey); });

    paint();
  }

  /* ============================================================
     ERROR LOG HUB (#/errorlog)
     ============================================================ */
  KOS.views.errorlog = function (main, arg) {
    KOS.shell.tree("none");
    if (arg && (arg === "drill" || arg.mode === "drill")) {
      renderDrill(main, typeof arg === "object" ? arg : {});
      return;
    }

    var state = {
      status: "open",
      subject: (arg && arg.subject) || "",
      topicRef: (arg && arg.topicRef) || "",
      mistakeType: "",
      source: "",
      q: "",
      limit: PAGE_SIZE
    };

    var headMount = el("div");
    var body = el("div", { class: "k-el-page" });
    main.appendChild(headMount);
    main.appendChild(body);

    function renderAll() {
      headMount.innerHTML = "";
      body.innerHTML = "";
      var allItems = E().all({});
      var openItems = allItems.filter(function (x) { return x.status !== "resolved"; });
      var resolvedItems = allItems.filter(function (x) { return x.status === "resolved"; });
      var isEmpty = allItems.length === 0;

      /* Empty state: hide header + Log mistake so empty card's CTA is sole primary */
      var headActions = [];
      if (!isEmpty) {
        if (openItems.length) {
          headActions.push(el("button", {
            type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "errorlog.start-drill",
            text: "▶ Quick Error Drill (" + openItems.length + ")",
            onclick: function () {
              KOS.show("errorlog", { mode: "drill", subject: state.subject || undefined, topicRef: state.topicRef || undefined });
            }
          }));
        }
        headActions.push(el("button", {
          type: "button", class: openItems.length ? "k-btn" : "k-btn k-btn--primary",
          "data-intent": openItems.length ? null : "primary",
          "data-ui": "errorlog.head-add", text: "+ Log mistake",
          onclick: function () { openDialog({ source: "manual" }, function () { renderAll(); }); }
        }));
      }
      headMount.appendChild(KOS.ui.pageHeader({
        kicker: "Study · Error Log",
        title: "Error Log",
        sub: "Spot recurring mistakes, write the rule for next time, and turn weak spots into flashcards.",
        actions: headActions
      }));

      if (isEmpty) {
        var emp = KOS.ui.emptyState({
          mark: "省",
          title: "No mistakes logged yet",
          body: "Whenever you miss a quiz question, drop marks on a past paper, hit a failing C# test, miss a Japanese reading, or catch a slip on Ink, tap + Log mistake in place — or add one manually here. Pattern insights appear automatically once you have a few entries.",
          action: el("button", {
            type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "errorlog.empty-add",
            text: "+ Log your first mistake",
            onclick: function () { openDialog({ source: "manual" }, function () { renderAll(); }); }
          })
        });
        emp.setAttribute("data-ui", (emp.getAttribute("data-ui") || "") + " errorlog.empty");
        body.appendChild(emp);
        return;
      }

      /* 1. Pattern Insights strip (derived on read; honest share-% bar scaling) */
      var ins = E().insights(allItems);
      if (ins.total >= 2 && (ins.byType.length || ins.byTopic.length)) {
        var insWrap = el("div", { class: "k-el-insights", "data-ui": "errorlog.insights" });
        if (ins.byType.length) {
          var bars = el("div", { class: "k-el-bars" }, ins.byType.map(function (t, bi) {
            var fill = el("span");
            fill.style.setProperty("--p", Math.max(4, t.pct) + "%");
            fill.style.setProperty("--bar-c", BAR_TONES[bi % BAR_TONES.length]);
            return el("button", {
              type: "button", class: "k-el-barrow", "data-ui": "errorlog.insight-type",
              "aria-label": "Filter by " + t.label + " (" + t.count + ", " + t.pct + "%)",
              onclick: function () { state.mistakeType = state.mistakeType === t.id ? "" : t.id; state.limit = PAGE_SIZE; paintList(); }
            }, [
              el("span", { class: "k-el-barlbl", text: t.label }),
              el("span", { class: "k-el-bartrack", "aria-hidden": "true" }, [fill]),
              el("span", { class: "k-el-barval", text: t.count + " · " + t.pct + "%" })
            ]);
          }));
          insWrap.appendChild(el("section", { class: "k-card k-el-icard" }, [
            el("div", { class: "k-el-icard-h" }, [
              el("h2", { text: "Most frequent mistake types" }),
              el("span", { text: ins.total + " logged · " + ins.open + " open" })
            ]),
            bars
          ]));
        }
        if (ins.byTopic.length) {
          var tops = el("div", { class: "k-el-toplist" }, ins.byTopic.map(function (tp) {
            var sm = subjMeta(tp.subject);
            var row = el("button", {
              type: "button", class: "k-el-toprow", "data-ui": "errorlog.insight-topic",
              onclick: function () {
                if (state.subject === tp.subject && state.topicRef === (tp.topicRef || "")) {
                  state.subject = ""; state.topicRef = "";
                } else {
                  state.subject = tp.subject; state.topicRef = tp.topicRef || "";
                }
                state.limit = PAGE_SIZE;
                paintList();
              }
            }, [
              el("span", { class: "k-el-dot", "aria-hidden": "true" }),
              el("span", { class: "k-el-topname", text: tp.topicTitle }),
              tp.topicRef && tp.topicRef !== tp.topicTitle ? el("span", { class: "k-el-topref", text: sm.short + " " + tp.topicRef }) : el("span", { class: "k-el-topref", text: sm.short }),
              el("span", { class: "k-chip", "data-tone": tp.open >= 3 ? "crimson" : tp.open >= 2 ? "amber" : null, text: tp.open + " open" })
            ]);
            row.style.setProperty("--el-hue", sm.hue);
            return row;
          }));
          insWrap.appendChild(el("section", { class: "k-card k-el-icard" }, [
            el("div", { class: "k-el-icard-h" }, [
              el("h2", { text: "Top error-prone topics" }),
              el("span", { text: "tap to filter" })
            ]),
            tops
          ]));
        }
        body.appendChild(insWrap);
      }

      /* 2. Filter & Search toolbar + Auto-log quiz misses toggle */
      var statusSeg = el("div", { class: "k-seg k-seg--quiet", role: "group", "aria-label": "Status filter", "data-ui": "errorlog.status-filter" }, [
        ["open", "Open (" + openItems.length + ")"],
        ["resolved", "Resolved (" + resolvedItems.length + ")"],
        ["all", "All (" + allItems.length + ")"]
      ].map(function (pair) {
        var on = state.status === pair[0];
        var b = el("button", { type: "button", class: "k-seg-item", "aria-pressed": String(on), text: pair[1],
          onclick: function () {
            state.status = pair[0]; state.limit = PAGE_SIZE;
            Array.prototype.forEach.call(statusSeg.children, function (c, ci) {
              var act = ci === ["open", "resolved", "all"].indexOf(pair[0]);
              c.setAttribute("aria-pressed", String(act));
              KOS.ui.state(c, "active", act);
            });
            paintList();
          } });
        if (on) KOS.ui.state(b, "active", true);
        return b;
      }));

      var searchIn = el("input", { type: "search", class: "k-input k-el-search", "data-ui": "errorlog.search",
        placeholder: "Search mistakes, topics, rules…", "aria-label": "Search Error Log" });
      searchIn.value = state.q;
      searchIn.addEventListener("input", function () { state.q = searchIn.value; state.limit = PAGE_SIZE; paintList(); });

      var subjF = el("select", { class: "k-input k-el-sel", "data-ui": "errorlog.filter-subject", "aria-label": "Filter by subject" },
        [el("option", { value: "", text: "All subjects" })].concat(E().SUBJECTS.map(function (s) {
          var o = el("option", { value: s.id, text: s.label });
          if (state.subject === s.id) o.selected = true;
          return o;
        })));
      subjF.addEventListener("change", function () { state.subject = subjF.value; state.topicRef = ""; state.limit = PAGE_SIZE; paintList(); });

      var typeF = el("select", { class: "k-input k-el-sel", "data-ui": "errorlog.filter-type", "aria-label": "Filter by mistake type" },
        [el("option", { value: "", text: "All mistake types" })].concat(E().MISTAKE_TYPES.map(function (t) {
          var o = el("option", { value: t.id, text: t.label });
          if (state.mistakeType === t.id) o.selected = true;
          return o;
        })));
      typeF.addEventListener("change", function () { state.mistakeType = typeF.value; state.limit = PAGE_SIZE; paintList(); });

      var srcF = el("select", { class: "k-input k-el-sel", "data-ui": "errorlog.filter-source", "aria-label": "Filter by source" },
        [el("option", { value: "", text: "All sources" })].concat(E().SOURCES.map(function (s) {
          var o = el("option", { value: s.id, text: s.label });
          if (state.source === s.id) o.selected = true;
          return o;
        })));
      srcF.addEventListener("change", function () { state.source = srcF.value; state.limit = PAGE_SIZE; paintList(); });

      var autoSw = el("input", { type: "checkbox", role: "switch", class: "k-switch", "data-ui": "errorlog.auto-quiz",
        "aria-label": "Auto-log quiz misses" });
      autoSw.checked = !!E().getSetting("autoLogQuiz", false);
      autoSw.addEventListener("change", function () {
        E().setSetting("autoLogQuiz", autoSw.checked);
        KOS.ui.toast(autoSw.checked ? "Quiz misses will log automatically." : "Auto-log quiz misses turned off.");
      });

      var activeTopicBar = el("div", { class: "k-el-activebar" });
      body.appendChild(el("div", { class: "k-el-bar" }, [statusSeg, searchIn, subjF, typeF, srcF]));
      body.appendChild(el("div", { class: "k-el-subbar" }, [
        activeTopicBar,
        el("label", { class: "k-el-autotog" }, [autoSw, el("span", { text: "Auto-log quiz misses" })])
      ]));

      var listMount = el("div", { class: "k-el-list", "data-ui": "errorlog.list" });
      body.appendChild(listMount);

      function paintList() {
        subjF.value = state.subject;
        typeF.value = state.mistakeType;
        srcF.value = state.source;
        activeTopicBar.innerHTML = "";
        if (state.topicRef) {
          activeTopicBar.appendChild(el("button", {
            type: "button", class: "k-btn k-btn--sm k-btn--quiet", "data-ui": "errorlog.clear-topic",
            text: "Topic: " + state.topicRef + " ✕",
            onclick: function () { state.topicRef = ""; paintList(); }
          }));
        }

        listMount.innerHTML = "";
        var filtered = E().all({
          status: state.status,
          subject: state.subject || undefined,
          topicRef: state.topicRef || undefined,
          mistakeType: state.mistakeType || undefined,
          source: state.source || undefined,
          q: state.q || undefined
        });

        if (!filtered.length) {
          listMount.appendChild(KOS.ui.emptyState({
            compact: true, mark: "空",
            title: "No mistakes match these filters",
            body: "Clear a filter or switch between Open and Resolved.",
            action: el("button", { type: "button", class: "k-btn k-btn--sm", text: "Reset filters",
              onclick: function () { state.status = "all"; state.subject = ""; state.topicRef = ""; state.mistakeType = ""; state.source = ""; state.q = ""; renderAll(); } })
          }));
          return;
        }

        filtered.slice(0, state.limit).forEach(function (it) {
          var sm = subjMeta(it.subject);
          var linked = E().hasLinkedCard(it);
          var card = el("article", { class: "k-el-card", "data-ui": "errorlog.card" });
          card.style.setProperty("--el-hue", sm.hue);
          if (it.status === "resolved") KOS.ui.state(card, "resolved", true);

          var stChip = it.status === "resolved"
            ? el("span", { class: "k-chip", "data-tone": "teal", text: "✓ Resolved" })
            : it.status === "revisited"
              ? el("span", { class: "k-chip", "data-tone": "amber", text: "Revisited ×" + (it.reviewCount || 1) })
              : el("span", { class: "k-chip", "data-tone": "crimson", text: "Open" });

          /* Mistake-type pills sit on the TOP metadata row (compact & scannable) */
          var tagChips = (it.mistakeTypes || []).map(function (t) {
            var tg = el("span", { class: "k-el-tag", "data-ui": "errorlog.tag", text: E().TYPE_MAP[t] || t });
            KOS.ui.state(tg, "on", true);
            return tg;
          });

          card.appendChild(el("div", { class: "k-el-chead", "data-ui": "errorlog.card-head" }, [
            el("span", { class: "k-el-dot", "aria-hidden": "true" }),
            el("span", { class: "k-el-subj", text: sm.label }),
            it.topicRef || it.topicTitle ? el("span", { class: "k-el-topic", text: [it.topicRef, it.topicTitle && it.topicTitle !== it.topicRef ? it.topicTitle : null].filter(Boolean).join(" · ") }) : null,
            el("span", { class: "k-chip", text: srcLabel(it.source) }),
            stChip
          ].concat(tagChips).concat([
            el("span", { class: "k-el-meta", text: relTime(it.createdAt) })
          ]).filter(Boolean)));

          card.appendChild(el("h3", { class: "k-el-title", text: it.title }));
          if (it.context) card.appendChild(el("p", { class: "k-el-ctx", text: it.context }));

          if (it.wrongNote || it.ruleNote) {
            card.appendChild(el("div", { class: "k-el-notes" + (!(it.wrongNote && it.ruleNote) ? " k-el-notes--one" : "") }, [
              it.wrongNote ? el("div", { class: "k-el-note" }, [
                el("span", { class: "k-el-notek", text: "What went wrong" }),
                el("span", { class: "k-el-notet", text: it.wrongNote })
              ]) : null,
              it.ruleNote ? el("div", { class: "k-el-note k-el-note--rule" }, [
                el("span", { class: "k-el-notek", text: "Rule for next time" }),
                el("span", { class: "k-el-notet", text: it.ruleNote })
              ]) : null
            ].filter(Boolean)));
          }

          /* Clean card footer: Delete stays inside Edit dialog */
          var foot = el("div", { class: "k-el-cfoot" }, [
            it.deepLink ? el("button", { type: "button", class: "k-btn k-btn--sm k-btn--quiet", "data-ui": "errorlog.goto",
              text: "Go to source ↗",
              onclick: function () { KOS.show(it.deepLink.view, it.deepLink.arg); } }) : null,
            el("button", { type: "button", class: "k-btn k-btn--sm" + (linked ? " k-btn--quiet" : ""), "data-ui": "errorlog.to-card",
              text: linked ? "✓ In flashcard deck" : "→ Turn into flashcard",
              onclick: function () {
                var r = E().toFlashcard(it.id);
                KOS.ui.toast(r.already ? "Already in your flashcard deck." : "Added to flashcard deck.");
                paintList();
              } }),
            el("span", { class: "k-spacer" }),
            el("button", { type: "button", class: "k-btn k-btn--sm k-btn--quiet", "data-ui": "errorlog.edit",
              text: "Edit",
              onclick: function () { openDialog(it, function () { renderAll(); }); } }),
            el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "errorlog.resolve",
              text: it.status === "resolved" ? "Reopen" : "✓ Mark resolved",
              onclick: function () {
                var prevSt = it.status;
                var nextSt = it.status === "resolved" ? "open" : "resolved";
                E().setStatus(it.id, nextSt);
                KOS.ui.toast(nextSt === "resolved" ? "Marked resolved." : "Reopened mistake.", false, {
                  label: "Undo",
                  run: function () { E().setStatus(it.id, prevSt); renderAll(); }
                });
                renderAll();
              } })
          ].filter(Boolean));
          card.appendChild(foot);
          listMount.appendChild(card);
        });

        if (filtered.length > state.limit) {
          var rem = filtered.length - state.limit;
          listMount.appendChild(el("div", { class: "k-el-pager" }, [
            el("span", { text: "Showing 1–" + state.limit + " of " + filtered.length + " mistakes" }),
            el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "errorlog.more",
              text: "Show " + Math.min(PAGE_SIZE, rem) + " more",
              onclick: function () { state.limit += PAGE_SIZE; paintList(); } })
          ]));
        }
      }

      paintList();
    }

    renderAll();
  };

  KOS.errorLogUI = { openDialog: openDialog };
})();
