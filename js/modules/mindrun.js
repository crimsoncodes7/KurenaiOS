/* Kurenai OS — modules/mindrun.js (KOS.mindRun)
   Mind's flows that open over a page (design 32g–32h, 32i–32m, 32o):
     explain(id, o)        the explain-back: write in bullets, then tick the key points (32g)
     position(id, o)       the position card: options, confidence, one line of reason, and the
                           optional objection + reply that unlocks Evaluate (32h); o.revise
     revisitCard(id, o)    "In October you said X because Y. Still true?" Keep · Revise · Retire (32l)
     dialogue(id, o)       a lesson's Socratic dialogue, resuming at its turn (32i–32j)
     ask(ctx)              Ask Kurenai: four modes, "What is sent", the reply, Save to Journal (32m)
     capture(o)            quick capture: kind, text, done (32o)
   Every write goes through its owner (KOS.mind, KOS.mindJournal). Nothing here pays: writing is
   never rewarded (decision I). Kurenai discusses and never grades (invariant 140).             */
(function () {
  "use strict";
  var el = KOS.ui.el;
  function M() { return KOS.mind; }
  function UI() { return KOS.mindUI; }
  function announce(m) { if (KOS.a11y && KOS.a11y.announce) KOS.a11y.announce(m); }
  function changed(ref) { document.dispatchEvent(new window.CustomEvent("kos:mind-evidence", { detail: { ref: ref } })); }
  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var MONTH = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  function dmy(ts) { var d = new Date(ts); return d.getDate() + " " + MON[d.getMonth()]; }
  function nextDow(iso) { var d = new Date(iso + "T12:00:00"); return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][d.getDay()]; }

  /* ================= the explain-back (32g) ================= */
  function explain(id, o) {
    o = o || {};
    var l = M().lesson(id); if (!l || l.kind !== "explain" || !l.prompt) return;
    var c = M().concept(l.main), prev = M().peek().explains[id];
    var draft = prev ? prev.bullets.slice() : [], ticks = prev ? Object.assign({}, prev.ticks) : {};
    var sh = UI().sheet({ kicker: id + " · the one prompt · explain-back", title: l.prompt.q, hook: "mind.explain", body: [], foot: [] });
    var body = sh.box.querySelector(".k-mind-sheet-body"), foot = sh.box.querySelector(".k-dialog-foot");
    function later() {
      M().park(id); changed(id);
      var day = nextDow(KOS.srs.todayISO());
      announce("Parked for a coming Daily 15.");
      body.innerHTML = ""; foot.innerHTML = "";
      body.appendChild(el("div", { class: "k-mind-done", "data-ui": "mind.parked" }, [el("span", { class: "k-mind-done-g", "aria-hidden": "true", text: "⏸" }),
        el("div", {}, [el("b", { text: "Parked. It will be a Daily 15 question soon." }), el("p", { class: "k-muted", text: "The check stays open; nothing reads as missed." })])]));
      foot.appendChild(el("span")); foot.appendChild(el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: "Done", onclick: sh.close }));
      if (o.onDone) o.onDone("later");
    }
    function step1() {
      body.innerHTML = ""; foot.innerHTML = "";
      var bb = UI().bullets({ value: draft, label: "Your explain-back", onChange: function (v) { draft = v; } });
      var msg = el("p", { class: "k-mind-err", role: "alert", hidden: "" });
      body.appendChild(el("p", { class: "k-muted", text: "Three bullets or three sentences, in your own words." }));
      body.appendChild(bb.node); body.appendChild(msg);
      foot.appendChild(el("button", { type: "button", class: "k-btn", "data-ui": "mind.later", text: "Later", title: "Parks it for a coming Daily 15", onclick: later }));
      foot.appendChild(el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "mind.explain-next", text: "Done writing ›",
        onclick: function () { draft = bb.value(); if (!draft.length) { msg.hidden = false; msg.textContent = "Add one bullet, or choose Later."; return; } step2(); } }));
      setTimeout(bb.focus, 30);
    }
    function step2() {
      body.innerHTML = ""; foot.innerHTML = "";
      body.appendChild(el("ul", { class: "k-mind-yours" }, draft.map(function (b) { return el("li", { text: b }); })));
      body.appendChild(el("h3", { class: "k-mind-sub", text: "Which key points did you cover?" }));
      body.appendChild(el("p", { class: "k-muted", text: "Tick what is in your own words, even roughly. You are the judge here." }));
      var count = el("span");
      var saveBtn = el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "mind.explain-save", onclick: save }, [count]);
      function paint() { var n = Object.keys(ticks).filter(function (k) { return ticks[k]; }).length; count.textContent = n ? "Save · " + n + " of " + c.keyPoints.length : "Save · not yet"; }
      body.appendChild(el("div", { class: "k-mind-ticks", role: "group", "aria-label": "Key points" }, c.keyPoints.map(function (kp, i) {
        var cb = el("input", { type: "checkbox", class: "k-box", onchange: function () { ticks[i] = cb.checked; paint(); } });
        cb.checked = !!ticks[i];
        return el("label", { class: "k-mind-tick", "data-ui": "mind.keypoint" }, [cb, el("span", { text: kp })]);
      })));
      foot.appendChild(el("button", { type: "button", class: "k-btn", text: "‹ Edit", onclick: step1 }));
      foot.appendChild(el("button", { type: "button", class: "k-btn", "data-ui": "mind.ask-check", text: "Ask Kurenai to check it",
        onclick: function () { ask({ lesson: id, concept: l.main, mode: "check", typed: draft.join("\n"), extras: { explain: true } }); } }));
      foot.appendChild(saveBtn);
      paint();
    }
    function save() {
      var r = M().saveExplain(id, draft, ticks);
      if (!r) return;
      changed(id);
      body.innerHTML = ""; foot.innerHTML = "";
      var lad = M().ladder(l.main);
      body.appendChild(el("div", { class: "k-mind-done", "data-ui": "mind.explain-saved" }, [UI().ladder(lad),
        el("div", {}, [el("b", { text: r.reached ? c.name + " reaches Explain." : lad && lad.rungs[1] ? "Saved. " + c.name + " is at Explain." : "Saved." }),
          el("p", { class: "k-muted", text: r.ticked + " of " + r.of + " key points" + (r.ticked < r.of ? ". The rest come back in your reviews." : ".") })])]));
      announce(r.reached ? "Saved. " + c.name + " reaches Explain." : "Saved.");
      foot.appendChild(el("span")); foot.appendChild(el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: "Done", onclick: sh.close }));
      if (o.onDone) o.onDone("saved");
    }
    step1();
    return sh;
  }

  /* ================= the position card (32h) ================= */
  function position(id, o) {
    o = o || {};
    var l = M().lesson(id); if (!l || l.kind !== "contested" || !l.prompt) return;
    var prev = M().latest(id);
    var st = { answer: prev ? prev.answer : null, conf: prev ? prev.conf : 70, reason: prev ? prev.reason : "", objection: "", reply: "", changed: "" };
    var sh = UI().sheet({ kicker: id + " · the one prompt · position", title: l.prompt.q, hook: "mind.position", body: [], foot: [] });
    var body = sh.box.querySelector(".k-mind-sheet-body"), foot = sh.box.querySelector(".k-dialog-foot");
    var take;
    function draw() {
      body.innerHTML = ""; foot.innerHTML = "";
      if (prev && o.revise) body.appendChild(el("div", { class: "k-mind-was" }, [UI().kind("position"), el("span", { text: "v" + prev.n + " · " + dmy(prev.at) + ": " + l.prompt.options[prev.answer] + " · " + prev.conf + "%" }), prev.reason ? el("small", { text: "\"" + prev.reason + "\"" }) : null].filter(Boolean)));
      body.appendChild(el("div", { class: "k-mind-opts", role: "radiogroup", "aria-label": "Where you stand" }, l.prompt.options.map(function (op, i) {
        return el("button", { type: "button", class: "k-mind-opt", role: "radio", "aria-checked": String(st.answer === i), "data-ui": "mind.position-option",
          onclick: function () { st.answer = i; draw(); var b = body.querySelectorAll(".k-mind-opt")[i]; if (b) b.focus(); } }, [op]);
      })));
      body.appendChild(UI().slider({ value: st.conf, onChange: function (v) { st.conf = v; } }));
      body.appendChild(el("label", { class: "k-mind-field" }, [el("span", { text: "One line of reason" }),
        field(st.reason, "• Bullets are fine", function (v) { st.reason = v; })]));
      if (prev && o.revise) body.appendChild(el("label", { class: "k-mind-field" }, [el("span", { text: "What changed my mind" }), field(st.changed, "• a dialogue, a lesson, a conversation", function (v) { st.changed = v; })]));
      var obj = el("details", { class: "k-mind-obj", "data-ui": "mind.objection" }, [
        el("summary", {}, [el("b", { text: "Strongest objection + your reply" }), el("small", { text: " optional · unlocks Evaluate" })]),
        el("p", { class: "k-muted", text: "Add the best case against your view and answer it. Skip it and the position still counts." }),
        el("label", { class: "k-mind-field" }, [el("span", { text: "The best case against you" }), field(st.objection, "•", function (v) { st.objection = v; })]),
        el("label", { class: "k-mind-field" }, [el("span", { text: "Your reply" }), field(st.reply, "•", function (v) { st.reply = v; })])
      ]);
      if (st.objection) obj.open = true;
      body.appendChild(obj);
      foot.appendChild(el("button", { type: "button", class: "k-btn", "data-ui": "mind.later", text: "Later", onclick: function () {
        M().park(id); changed(id); announce("Parked for a coming Daily 15."); sh.close(); if (o.onDone) o.onDone("later"); } }));
      foot.appendChild(el("button", { type: "button", class: "k-btn", text: "Ask Kurenai to push back",
        onclick: function () { ask({ lesson: id, concept: l.main, mode: "push", typed: st.answer != null ? l.prompt.options[st.answer] + (st.reason ? ": " + st.reason : "") : "" }); } }));
      take = el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "mind.position-take", disabled: st.answer == null ? "" : null,
        title: st.answer == null ? "Pick where you stand first" : null, text: "Take this position", onclick: save });
      foot.appendChild(take);
    }
    function field(v, ph, set) {
      var t = el("textarea", { class: "k-mind-text", rows: "2", placeholder: ph, oninput: function () { set(t.value); } });
      t.value = v || ""; return t;
    }
    function save() {
      if (st.answer == null) return;
      var r = M().takePosition(id, st);
      if (!r) return;
      changed(id);
      var v = M().latest(id), lad = M().ladder(l.main);
      body.innerHTML = ""; foot.innerHTML = "";
      body.appendChild(el("div", { class: "k-mind-poscard", "data-ui": "mind.position-saved" }, [
        el("div", { class: "k-mind-poscard-h" }, [UI().kind("position"), el("span", { class: "k-mono", text: "v" + v.n + " · " + dmy(v.at) })]),
        el("b", { text: l.prompt.options[v.answer] + " · " + v.conf + "%" }),
        v.reason ? el("p", { class: "k-mind-read", text: "\"" + v.reason + "\"" }) : null,
        v.objection && v.reply ? el("p", { class: "k-muted", text: "With an objection answered, " + M().concept(l.main).name.toLowerCase() + " reaches Evaluate." }) : null,
        lad ? UI().ladder(lad) : null,
        el("small", { class: "k-muted", text: "Comes back in about two weeks: \"Still true?\"" })
      ].filter(Boolean)));
      if (r.changedAnswer) body.appendChild(el("div", { class: "k-mind-milestone", "data-ui": "mind.changed-mind" }, [el("span", { class: "k-mind-emblem", lang: "ja", "aria-hidden": "true", text: "心" }),
        el("div", {}, [el("b", { text: "You changed your mind, for a reason." }), el("small", { class: "k-muted", text: "In your milestones. No reward: changing your mind for a reason is the point." })])]));
      announce(l.prompt.options[v.answer] + ", " + v.conf + " percent. Saved as version " + v.n + ".");
      foot.appendChild(el("span")); foot.appendChild(el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: "Done", onclick: sh.close }));
      if (o.onDone) o.onDone("saved");
    }
    draw();
    return sh;
  }

  /* ================= a revisit (32l, 32ab) ================= */
  function revisitCard(id, o) {
    o = o || {};
    var p = M().position(id); if (!p) return null;
    var v = p.current, d = new Date(v.at);
    var card = el("section", { class: "k-card k-mind-revisit", "data-ui": "mind.revisit", "aria-label": "Revisit: " + p.q }, [
      el("div", { class: "k-mind-poscard-h" }, [UI().kind("position"), el("span", { class: "k-kicker", text: "Revisit · " + (p.revisit && p.revisit.stage ? "again" : "two weeks on") }), el("span", { class: "k-mono", text: "v" + v.n + " · " + dmy(v.at) })]),
      el("p", { class: "k-mind-read" }, ["In " + MONTH[d.getMonth()] + " you said ", el("b", { text: p.options[v.answer].toLowerCase() }), v.reason ? ", because \"" + v.reason + "\"" : "", "."]),
      el("small", { class: "k-muted", text: "Confidence then " + v.conf + "%" }),
      el("b", { class: "k-mind-still", text: "Still true?" }),
      el("div", { class: "k-mind-three", role: "group", "aria-label": "Still true?" }, [
        big("Keep", "as it is", function () { M().keepPosition(id); announce("Kept."); if (o.onDone) o.onDone("kept"); }),
        big("Revise", "a new version", function () { position(id, { revise: true, onDone: function (r) { if (r === "saved" && o.onDone) o.onDone("revised"); } }); }),
        big("Retire", "no longer mine", function () { M().retirePosition(id); announce("Retired. It stays in your history."); if (o.onDone) o.onDone("retired"); })
      ]),
      el("small", { class: "k-muted", text: "Revise keeps the old version; nothing is overwritten." })
    ]);
    function big(t, sub, fn) { return el("button", { type: "button", class: "k-mind-big", onclick: fn }, [el("b", { text: t }), el("small", { text: sub })]); }
    return card;
  }

  /* ================= the dialogue (32i–32j) ================= */
  function dialogue(id, o) {
    o = o || {};
    var l = M().lesson(id), tree = o.tree || (l && l.dialogue); if (!tree) return null;
    var ui = M().ui(); ui.tree = ui.tree && typeof ui.tree === "object" ? ui.tree : {};
    var place = ui.tree[tree.id] || {};
    var box = el("div", { class: "k-mind-dlg", "data-ui": "mind.dialogue-wrap" });
    function run(fresh) {
      box.innerHTML = "";
      var start = fresh ? {} : place;
      box.appendChild(UI().scene(tree, { at: start.at, path: start.path, bg: o.bg,
        onTurn: function (s) { ui.tree[tree.id] = place = s; KOS.store.save(); },
        onEnd: function (sum, path) {
          delete ui.tree[tree.id]; place = {}; KOS.store.save();
          var concepts = (l && (l.concepts || [])) || [];
          var saveBtn = el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "mind.dialogue-save", text: "≋ Save to Journal",
            onclick: function () {
              KOS.mindJournal.add({ kind: "reflection", title: "Dialogue: " + tree.title, text: sum, concepts: concepts.slice(0, 3), lesson: id, src: { kind: "dialogue", ref: tree.id } }, function (err) {
                if (err) { KOS.ui.toast("Couldn't save to the Journal on this device.", true); return; }
                saveBtn.textContent = "In your Journal ›"; saveBtn.onclick = function () { KOS.show("mind", { page: "journal" }); };
                announce("Saved to your Journal as a Reflection.");
              });
            } });
          box.appendChild(el("section", { class: "k-card k-mind-summary", "data-ui": "mind.dialogue-summary", "aria-label": "The line you took" }, [
            el("span", { class: "k-kicker", text: "The line you took · " + path.length + (path.length === 1 ? " turn" : " turns") }),
            el("p", { class: "k-mind-read", text: sum }),
            el("div", { class: "k-mind-chips" }, concepts.slice(0, 3).map(function (cid) { var c = M().concept(cid); return c ? el("span", { class: "k-chip", text: c.name }) : null; }).filter(Boolean)),
            el("div", { class: "k-mind-row" }, [saveBtn, el("button", { type: "button", class: "k-btn", text: "Run it again", onclick: function () { run(true); } })]),
            el("small", { class: "k-muted", text: "Kurenai discusses; she does not grade." })
          ]));
          announce("Summary: " + sum);
          if (o.onEnd) o.onEnd(sum);
        } }));
    }
    run(false);
    return box;
  }

  /* ================= Ask Kurenai (32m; invariant 140) ================= */
  var MODES = [
    ["socratic", "Socratic", "Asks only questions; the answer only if you ask"],
    ["differently", "Explain it differently", "Simpler or more concrete, then one check question"],
    ["push", "Push back", "The strongest case against your view: a steelman"],
    ["mine", "Make it mine", "Examples from what you allow: a subject, a title, your story"]
  ];
  var SYSTEM = {
    socratic: "Reply ONLY with one to three short questions that help the learner think the idea through. Do not give the answer unless they ask for it directly.",
    differently: "Explain the idea again more simply or more concretely, in at most 120 words, then ask ONE short check question.",
    push: "Give the strongest case against the learner's view: a steelman, in at most 140 words. End with one question that the learner would need to answer. Never say who is right.",
    mine: "Give two short, concrete examples of the idea drawn from what the learner allows below (their subjects, a title, their story). At most 140 words.",
    check: "Read the learner's explain-back and say, in at most 100 words, which of the listed key points it covers and which it leaves out. Be kind and specific. You SUGGEST; the learner ticks."
  };
  var BASE = "You are Kurenai, the study companion inside KurenaiOS, talking to a sixth-form student studying psychology and philosophy for curiosity. British English, plain prose, no markdown, no lists. You discuss; you never grade, mark or set progress.";
  function ask(ctx) {
    ctx = ctx || {};
    var l = ctx.lesson ? M().lesson(ctx.lesson) : null, c = ctx.concept ? M().concept(ctx.concept) : (l && l.main ? M().concept(l.main) : null);
    var mode = ctx.mode || null;
    var ex = M().peek().explains[ctx.lesson || ""], pos = ctx.lesson ? M().latest(ctx.lesson) : null;
    var extras = { explain: !!(ctx.extras && ctx.extras.explain) || !!ex, position: false, entry: null };
    var typed = ctx.typed || "";
    var sh = UI().sheet({ kicker: "Ask Kurenai", title: c ? "About " + (l ? l.id + " · " : "") + c.name.toLowerCase() : "Ask Kurenai", hook: "mind.ask", body: [], foot: [], scrimCloses: false });
    var body = sh.box.querySelector(".k-mind-sheet-body"), foot = sh.box.querySelector(".k-dialog-foot");
    var req = null;
    function pickMode() {
      body.innerHTML = ""; foot.innerHTML = "";
      body.appendChild(el("div", { class: "k-mind-modes", role: "radiogroup", "aria-label": "Mode" }, MODES.map(function (m) {
        return el("button", { type: "button", class: "k-mind-mode", role: "radio", "aria-checked": String(mode === m[0]), "data-ui": "mind.ask-mode",
          onclick: function () { mode = m[0]; pickMode(); } }, [el("b", { text: m[1] }), el("small", { text: m[2] })]);
      })));
      body.appendChild(el("label", { class: "k-mind-field" }, [el("span", { text: "Your question or view (optional)" }), (function () {
        var t = el("textarea", { class: "k-mind-text", rows: "2", placeholder: "Isn't a rebuilt memory still basically true?", oninput: function () { typed = t.value; } });
        t.value = typed; return t; })()]));
      body.appendChild(el("p", { class: "k-muted", text: "Four fixed prompts. Nothing has been sent." }));
      foot.appendChild(el("button", { type: "button", class: "k-btn", text: "Cancel", onclick: sh.close }));
      foot.appendChild(el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", disabled: mode ? null : "", text: "Next · what is sent", onclick: whatIsSent }));
    }
    function payload() {
      var parts = [];
      parts.push("Mode: " + (MODES.filter(function (m) { return m[0] === mode; })[0] || ["", "Check my explain-back"])[1]);
      if (c) parts.push("Concept: " + c.name + " — " + c.gist + (c.keyPoints && mode === "check" ? "\nKey points: " + c.keyPoints.join("; ") : ""));
      if (l) parts.push("Lesson: " + l.id + " " + l.title);
      if (typed.trim()) parts.push("The learner asks or says: \"" + typed.trim() + "\"");
      if (extras.explain && ex) parts.push("Their explain-back: " + ex.bullets.join(" / "));
      if (extras.position && pos) parts.push("Their position: " + l.prompt.options[pos.answer] + ", " + pos.conf + "% — " + (pos.reason || ""));
      if (extras.entry) parts.push("A Journal entry they added: " + extras.entry.title + (extras.entry.text && extras.entry.text !== extras.entry.title ? " — " + extras.entry.text : ""));
      return parts.join("\n");
    }
    function whatIsSent() {
      body.innerHTML = ""; foot.innerHTML = "";
      body.appendChild(el("p", { text: "This goes to Kurenai once, when you press Send. Journal entries never go unless you add one by hand." }));
      var fixed = [["Mode", (MODES.filter(function (m) { return m[0] === mode; })[0] || ["", "Check my explain-back"])[1] + " · a fixed prompt"]];
      if (c) fixed.push(["The concept and the lesson", c.name + (l ? " · " + l.id : "")]);
      if (typed.trim()) fixed.push(["Your typed words", "\"" + typed.trim() + "\""]);
      body.appendChild(el("ul", { class: "k-mind-sent", "data-ui": "mind.what-is-sent" }, fixed.map(function (f) { return el("li", {}, [el("b", { text: f[0] }), el("span", { text: f[1] })]); })));
      body.appendChild(el("h3", { class: "k-kicker", text: "Extras · tick to include" }));
      var xs = el("div", { class: "k-mind-ticks" });
      if (ex) xs.appendChild(tick("Your explain-back for this lesson", ex.bullets.length + " bullets", "explain"));
      if (pos) xs.appendChild(tick("Your position here", "v" + pos.n + " · " + pos.conf + "% · its reason line", "position"));
      var entries = KOS.mindJournal.list().slice(0, 30);
      if (entries.length) {
        var sel = el("select", { class: "k-mind-select", "aria-label": "Add a Journal entry by hand", onchange: function () { extras.entry = KOS.mindJournal.get(sel.value) || null; count(); } }, [el("option", { value: "", text: "+ Add a Journal entry by hand" })]
          .concat(entries.map(function (e) { return el("option", { value: e.id, text: KOS.mindJournal.LABEL[e.kind] + " · " + e.title.slice(0, 60) }); })));
        xs.appendChild(sel);
      }
      if (!xs.children.length) xs.appendChild(el("p", { class: "k-muted", text: "No extras to add yet." }));
      body.appendChild(xs);
      var wc = el("p", { class: "k-muted", "aria-live": "polite" });
      body.appendChild(wc);
      function count() { var n = (BASE + " " + payload()).split(/\s+/).length; wc.textContent = "About " + Math.round(n / 10) * 10 + " words · one request"; }
      function tick(t, sub, key) {
        var cb = el("input", { type: "checkbox", class: "k-box", onchange: function () { extras[key] = cb.checked; count(); } });
        cb.checked = !!extras[key];
        return el("label", { class: "k-mind-tick" }, [cb, el("span", {}, [t, el("small", { text: " " + sub })])]);
      }
      count();
      var cancel = el("button", { type: "button", class: "k-btn", text: "Cancel", onclick: sh.close });
      foot.appendChild(el("button", { type: "button", class: "k-btn", text: "‹ Mode", onclick: pickMode }));
      foot.appendChild(cancel);
      foot.appendChild(el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "mind.ask-send", text: "Send", onclick: send }));
      setTimeout(function () { cancel.focus(); }, 20);
    }
    function send() {
      var text = payload();
      if (navigator.onLine === false) {
        var ui = M().ui(); ui.askQueue = Array.isArray(ui.askQueue) ? ui.askQueue : [];
        ui.askQueue.push({ at: Date.now(), lesson: ctx.lesson || null, concept: c ? c.id : null, mode: mode, typed: typed });
        KOS.store.save();
        body.innerHTML = ""; foot.innerHTML = "";
        body.appendChild(el("p", { class: "k-mind-offline", role: "status", text: "Offline. Saved to ask when you're online. You will see \"What is sent\" again before it goes." }));
        foot.appendChild(el("span")); foot.appendChild(el("button", { type: "button", class: "k-btn k-btn--primary", text: "Done", onclick: sh.close }));
        announce("Queued until you're online.");
        return;
      }
      body.innerHTML = ""; foot.innerHTML = "";
      body.appendChild(el("p", { class: "k-muted", role: "status", text: "Kurenai is thinking…" }));
      announce("Sending one request.");
      foot.appendChild(el("span"));
      foot.appendChild(el("button", { type: "button", class: "k-btn", text: "Cancel", onclick: function () { if (req && KOS.ai.cancel) KOS.ai.cancel(req); req = null; sh.close(); } }));
      if (!KOS.ai || !KOS.ai.chat) { fail({ kind: "config" }); return; }
      req = KOS.ai.chat("tutor", { system: BASE + " " + (SYSTEM[mode] || SYSTEM.socratic), messages: [{ role: "user", content: text }], temperature: 0.6, maxTokens: 600 }, function (err, res) {
        if (!req) return;
        req = null;
        if (err || !res || !res.text) { fail(err); return; }
        reply(String(res.text).trim());
      });
    }
    function fail(err) {
      body.innerHTML = ""; foot.innerHTML = "";
      var why = err && (err.kind === "config" || err.kind === "auth") ? "Set up Kurenai in the Assistant's settings to use this. The authored dialogue works without her." : "Kurenai could not answer. Nothing was saved.";
      body.appendChild(el("p", { class: "k-mind-err", role: "alert", text: why }));
      foot.appendChild(el("button", { type: "button", class: "k-btn", text: "Close", onclick: sh.close }));
      foot.appendChild(el("button", { type: "button", class: "k-btn k-btn--primary", text: "Try again", onclick: send }));
    }
    function reply(t) {
      body.innerHTML = ""; foot.innerHTML = "";
      if (typed.trim()) body.appendChild(el("p", { class: "k-mind-you", text: typed.trim() }));
      body.appendChild(el("div", { class: "k-mind-reply", "data-ui": "mind.ask-reply" }, [UI().avatar("kurenai", "thinking"), el("p", { class: "k-mind-read", text: t })]));
      body.appendChild(el("small", { class: "k-muted", text: (MODES.filter(function (m) { return m[0] === mode; })[0] || ["", "A second look"])[1] + " · nothing here sets mastery" }));
      announce("Reply from Kurenai.");
      var save = el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "mind.ask-save", text: "≋ Save to Journal",
        onclick: function () {
          KOS.mindJournal.add({ kind: "reflection", title: (MODES.filter(function (m) { return m[0] === mode; })[0] || ["", "Kurenai"])[1] + (c ? " on " + c.name.toLowerCase() : ""),
            text: (typed.trim() ? "Q: " + typed.trim() + "\n\n" : "") + t, concepts: c ? [c.id] : [], lesson: ctx.lesson || null, src: { kind: "kurenai", ref: mode } }, function (err) {
            if (err) { KOS.ui.toast("Couldn't save to the Journal on this device.", true); return; }
            save.textContent = "In your Journal ›"; save.onclick = function () { sh.close(); KOS.show("mind", { page: "journal" }); };
            announce("Saved to your Journal.");
          });
        } });
      foot.appendChild(el("small", { class: "k-muted", text: "Not saved unless you choose" }));
      foot.appendChild(el("button", { type: "button", class: "k-btn", text: "Ask a follow-up", onclick: function () { typed = ""; pickMode(); } }));
      foot.appendChild(save);
    }
    if (mode) whatIsSent(); else pickMode();
    return sh;
  }

  /* ================= quick capture (32o) ================= */
  function capture(o) {
    o = o || {};
    var kindOf = o.kind || "insight", text = "";
    var area = el("textarea", { class: "k-mind-text", rows: "3", "aria-label": "What to capture", placeholder: "Why do sequels feel worse even when they're the same quality?",
      oninput: function () { text = area.value; done.disabled = !text.trim(); } });
    var done = el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "mind.capture-done", disabled: "", text: "Done", onclick: save });
    var kinds = el("div", { class: "k-mind-kinds", role: "radiogroup", "aria-label": "Kind" });
    function drawKinds() {
      kinds.innerHTML = "";
      ["insight", "quote", "question", "reflection"].forEach(function (k) {
        kinds.appendChild(el("button", { type: "button", class: "k-mind-kindpick", role: "radio", "aria-checked": String(kindOf === k), onclick: function () { kindOf = k; drawKinds(); } }, [UI().kind(k)]));
      });
    }
    drawKinds();
    var src = el("input", { type: "text", class: "k-mind-input", placeholder: "Who said it, and where (optional)", "aria-label": "Source" });
    var sh = UI().sheet({ kicker: "Mind · Journal", title: "Quick capture", hook: "mind.capture", body: [kinds, area, el("label", { class: "k-mind-field", "data-ui": "mind.capture-source" }, [el("span", { text: "Source, for a quote" }), src]),
      el("small", { class: "k-muted", text: "Link a concept later. Private: only you read it." })], foot: [el("span"), done], initialFocus: area, scrimCloses: false,
      onClose: null });
    var origClose = sh.overlay.close;
    sh.overlay.close = function () {
      if (text.trim() && !saved) { KOS.ui.confirm({ title: "Discard this?", body: "It hasn't been saved.", confirm: "Discard", danger: true }, function () { saved = true; origClose(); }); return; }
      origClose();
    };
    var saved = false;
    function save() {
      if (!text.trim()) return;
      KOS.mindJournal.add({ kind: kindOf, text: text, source: src.value, concepts: o.concepts || [], lesson: o.lesson || null, src: { kind: "capture", ref: null } }, function (err) {
        if (err) { KOS.ui.toast("Couldn't save it on this device.", true); return; }
        saved = true; origClose();
        KOS.ui.toast("Captured as a" + (kindOf === "insight" ? "n " : " ") + KOS.mindJournal.LABEL[kindOf] + ". It waits in your Journal.");
        announce("Captured as a" + (kindOf === "insight" ? "n " : " ") + KOS.mindJournal.LABEL[kindOf] + ".");
        if (o.onDone) o.onDone();
      });
    }
    return sh;
  }

  KOS.mindRun = { explain: explain, position: position, revisitCard: revisitCard, dialogue: dialogue, ask: ask, capture: capture, MODES: MODES };
})();
