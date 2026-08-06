/* Kurenai OS — modules/assistant.js (Category 6 Phase E)
   The three Kurenai Assistant surfaces — global drawer, contextual
   actions, dedicated page — over ONE shared controller. The UI here is
   presentation only: every request goes through KOS.ai.orchestrator (one
   submission path), confirmations use the canonical Phase C object,
   conversations/memory ride KOS.ai.convo / KOS.ai.memory, and no code in
   this file executes a tool, decides a tier, or writes memory directly.

   Mascot: exactly six states (idle/thinking/working/success/error/
   confirmation), driven EXPLICITLY by orchestrator lifecycle events —
   never inferred from message text. The image is supplementary: every
   state also renders real textual status, and a failed image load falls
   back to a glyph + the text. The state→asset map mirrors
   assets/assistant/manifest.json (hardcoded — file:// can't fetch JSON;
   keep the two in step).

   The drawer and the dedicated page render the SAME thread/state, so a
   conversation moves between them without losing anything or duplicating
   provider requests (one busy flag, one draft, one pending confirmation).

   Voice (VOICE_NOTES.md) is DEFERRED: Gemini TTS needs its own Edge
   Function surface — a new provider endpoint, not a Phase E afternoon.
   Recorded in CATEGORY6_PLAN.md; nothing here blocks adding it later.   */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var el = KOS.ui.el;

  /* ================= mascot state map (mirrors manifest.json) ========== */
  var ASSET_BASE = "assets/assistant/";
  var MASCOT_STATES = {
    idle:         { image: "mascot/portrait/idle.png",         label: "Ready" },
    thinking:     { image: "mascot/portrait/thinking.png",     label: "Thinking…" },
    working:      { image: "mascot/portrait/working.png",      label: "Working…" },
    success:      { image: "mascot/portrait/success.png",      label: "Completed", autoReturnMs: 2200 },
    error:        { image: "mascot/portrait/error.png",        label: "Something went wrong" },
    confirmation: { image: "mascot/portrait/confirmation.png", label: "Awaiting your confirmation" }
  };
  var EMBLEM = ASSET_BASE + "logo/whispering-bloom-emblem.png";
  var WORDMARK = ASSET_BASE + "logo/whispering-bloom-wordmark.png";

  /* ================= the shared controller ================= */
  var S = {
    open: false,
    conversationId: null,   // persisted (Supabase) id, or null when signed out
    localId: "c" + Date.now(),  // client conversation key (always set) — drives
                                // the orchestrator's in-memory continuity + reset
    conversationTitle: null,
    thread: [],           // [{kind:"user"|"assistant"|"tool"|"warning"|"error", text, tool, ok}]
    draft: "",
    busy: false,
    requestId: null,
    visual: "idle",
    statusText: MASCOT_STATES.idle.label,
    pending: null,        // the canonical confirmation card from Phase C
    pendingState: null,   // null | "confirming" | "expired-message"
    lastError: null
  };
  var listeners = [];     // full re-render subscribers (thread/status areas)
  var mascots = [];       // live mascot nodes
  var successTimer = null;
  var _auditReader = null; // test seam

  function notify() {
    listeners = listeners.filter(function (l) { return l.node.isConnected; });
    listeners.forEach(function (l) { try { l.fn(); } catch (e) { /* a render error must not kill the controller */ } });
    updateTrigger();
  }
  function subscribe(node, fn) { listeners.push({ node: node, fn: fn }); }

  /* ---- visual state: EXPLICIT lifecycle input only ---- */
  function setVisual(state, statusText) {
    if (!MASCOT_STATES[state]) state = "idle";
    clearTimeout(successTimer);
    S.visual = state;
    S.statusText = statusText || MASCOT_STATES[state].label;
    if (state === "success") {
      successTimer = setTimeout(function () {
        if (S.visual === "success") setVisual("idle");
      }, MASCOT_STATES.success.autoReturnMs);
    }
    mascots = mascots.filter(function (m) { return m.node.isConnected; });
    mascots.forEach(function (m) { m.update(); });
    updateTrigger();
    var status = document.querySelectorAll(".asst-status-line");
    status.forEach(function (n) { n.textContent = S.statusText; });
  }

  /* ---- the mascot component (one implementation, two sizes) ---- */
  function mascotNode(size) {
    var img = el("img", { class: "asst-mascot-img", alt: "" });
    img.addEventListener("error", function () { node.classList.add("img-failed"); });
    var glyph = el("span", { class: "asst-mascot-fallback", "aria-hidden": "true", text: "紅" });
    var status = el("p", { class: "asst-status-line", role: "status" });
    var node = el("div", { class: "asst-mascot " + (size === "large" ? "asst-mascot-lg" : "asst-mascot-sm") },
      [el("div", { class: "asst-mascot-frame" }, [img, glyph]), status]);
    function update() {
      var st = MASCOT_STATES[S.visual] || MASCOT_STATES.idle;
      node.classList.remove("img-failed");
      node.setAttribute("data-state", S.visual);
      img.src = ASSET_BASE + st.image;
      status.textContent = S.statusText;
    }
    mascots.push({ node: node, update: update });
    update();
    return node;
  }

  /* ---- thread helpers ---- */
  function pushRow(row) { S.thread.push(row); notify(); }
  function threadFromStored(messages) {
    return messages.map(function (m) {
      var c = m.content || {};
      if (m.role === "tool") return { kind: "tool", tool: c.tool, ok: c.ok !== false, text: c.summary || "" };
      return { kind: m.role === "user" ? "user" : "assistant", text: c.text || "" };
    });
  }

  /* ---- conversation management (KOS.ai.convo only) ---- */
  function canPersist() {
    return !!(KOS.ai.convo && KOS.ai.convo.available().persist);
  }
  function newConversation() {
    S.conversationId = null;
    S.localId = "c" + Date.now() + "-" + Math.random().toString(36).slice(2, 6);
    S.conversationTitle = null;
    S.thread = [];
    S.pending = null;
    S.lastError = null;
    setVisual("idle");
    notify();
  }
  function openConversation(id, cb) {
    KOS.ai.convo.get(id, function (err, data) {
      if (err) { KOS.ui.toast(err.message, true); cb && cb(err); return; }
      S.conversationId = id;
      S.localId = "c-open-" + id;   // stable key for this conversation
      S.conversationTitle = data.conversation.title;
      S.thread = threadFromStored(data.messages);
      S.pending = null;
      S.lastError = null;
      setVisual("idle");
      notify();
      cb && cb(null);
    });
  }

  /* ---- THE one submission path (drawer, page, contextual actions) ---- */
  function submit(text, opts) {
    opts = opts || {};
    text = String(text || "").trim();
    if (!text) return false;
    if (S.busy) { KOS.ui.toast("Kurenai is already working — cancel first or wait.", true); return false; }
    S.lastError = null;
    S.draft = "";

    function actuallySend() {
      pushRow({ kind: "user", text: text });
      S.busy = true;
      setVisual("thinking");
      S.requestId = KOS.ai.orchestrator.send({
        userText: text,
        conversationId: S.conversationId,
        conversationKey: S.localId,   // stable per-conversation continuity key
        category: opts.category || "complex"
      }, {
        onStatus: function (p) {
          if (p.state === "thinking") setVisual("thinking");
          else if (p.state === "working") setVisual("working");
          else if (p.state === "awaiting_confirmation") setVisual("confirmation");
          else if (p.state === "fallback") pushRow({ kind: "warning", text: "Fell back from " + p.from + " to " + p.to + " (you enabled this fallback)." });
          else if (p.state === "persist_warning") pushRow({ kind: "warning", text: p.message });
        },
        onToolStart: function (p) {
          setVisual("working", "Running " + p.tool + "…");
        },
        onToolResult: function (p) {
          pushRow({ kind: "tool", tool: p.tool, ok: p.ok, text: p.ok ? "" : p.error });
        },
        onProposal: function (p) {
          /* a validated-but-UNSAVED artifact — render a real card (Save/Edit/
             Discard), clearly labelled as a proposal, from the stored object */
          var art = KOS.ai.tools.getPendingArtifact && KOS.ai.tools.getPendingArtifact();
          pushRow({ kind: "proposal", artifact: art, tool: p.tool });
        },
        onReceipt: function (p) {
          /* an app-generated VERIFIED action receipt — proof a write happened,
             never a model sentence */
          pushRow({ kind: "receipt", tool: p.tool, target: p.target, summary: p.summary });
        },
        onConfirmationNeeded: function (card) {
          S.pending = card;
          S.pendingState = null;
          S.busy = true;   // the request is paused, not gone
          setVisual("confirmation", "Awaiting your confirmation — " + card.tool);
          notify();
        },
        onText: function (p) { pushRow({ kind: "assistant", text: p.text }); },
        onError: function (p) {
          S.lastError = p.message;
          pushRow({ kind: "error", text: p.message });
          setVisual("error", "Failed: " + clampText(p.message, 80));
        },
        onDone: function (p) {
          S.busy = false;
          S.requestId = null;
          if (p.status === "complete") setVisual("success");
          else if (p.status === "cancelled") setVisual("idle", "Cancelled");
          /* error state already set by onError */
          notify();
        }
      });
      if (S.requestId === null) { S.busy = false; setVisual("idle"); }
      notify();
    }

    /* first message of a fresh signed-in session mints the conversation so
       history works from turn one; signed out it stays in-memory (loudly). */
    if (!S.conversationId && canPersist()) {
      KOS.ai.convo.create(clampText(text, 60), function (err, convo) {
        if (!err && convo) { S.conversationId = convo.id; S.conversationTitle = convo.title; }
        else if (err) pushRow({ kind: "warning", text: "History couldn't be started (" + err.message + ") — this conversation is unsaved." });
        actuallySend();
      });
    } else {
      actuallySend();
    }
    return true;
  }

  function cancelActive() {
    if (S.requestId) KOS.ai.orchestrator.cancel(S.requestId);
    if (S.pending) { S.pending = null; S.pendingState = null; }
    S.busy = false;
    setVisual("idle", "Cancelled");
    notify();
  }

  /* ---- deterministic single-tool run (proposal Save/Discard, contextual
     "Generate flashcards") — runs the EXACT tool through the orchestrator's
     Phase C gating/audit/receipts, no model interpretation ---- */
  function runToolUi(name, args, onComplete) {
    if (S.busy) { KOS.ui.toast("Kurenai is busy — wait for the current step.", true); return; }
    S.busy = true;
    setVisual("working", name + "…");
    notify();
    S.requestId = KOS.ai.orchestrator.runTool(name, args || {}, {
      onProposal: function (p) {
        var art = KOS.ai.tools.getPendingArtifact && KOS.ai.tools.getPendingArtifact();
        pushRow({ kind: "proposal", artifact: art, tool: p.tool });
      },
      onReceipt: function (p) { pushRow({ kind: "receipt", tool: p.tool, target: p.target, summary: p.summary }); },
      onConfirmationNeeded: function (card) {
        S.pending = card; S.pendingState = null; S.busy = true;
        setVisual("confirmation", "Awaiting your confirmation — " + card.tool); notify();
      },
      onError: function (p) { S.lastError = p.message; pushRow({ kind: "error", text: p.message }); setVisual("error", clampText(p.message, 80)); },
      onDone: function (p) {
        S.busy = false; S.requestId = null;
        if (p.status === "complete") setVisual("success"); else if (p.status === "cancelled") setVisual("idle", "Cancelled");
        if (typeof onComplete === "function") onComplete(p.status);
        notify();
      }
    });
    if (S.requestId === null) { S.busy = false; setVisual("idle"); notify(); }
  }
  function saveProposed(row) {
    runToolUi("study_save_proposed", {}, function (status) {
      /* mark the exact proposal row as saved ONLY when the write truly
         completed — the receipt row is the app-verified proof */
      if (status === "complete" && row) { row._saved = true; row._editing = false; }
      notify();
    });
  }
  function discardProposed(row) {
    /* only clear the shared pending state if THIS row is the live one */
    var live = KOS.ai.tools.getPendingArtifact && KOS.ai.tools.getPendingArtifact();
    if (live && live === row.artifact && KOS.ai.tools.clearPendingArtifact) KOS.ai.tools.clearPendingArtifact();
    row._discarded = true;
    notify();
  }
  function toggleEditProposal(row, on) { row._editing = on; notify(); }
  function commitProposalEdits(row, items) {
    if (KOS.ai.tools.updatePendingArtifact && KOS.ai.tools.updatePendingArtifact(items)) {
      row.artifact = KOS.ai.tools.getPendingArtifact();
    }
    row._editing = false;
    notify();
  }

  /* ---- confirmation actions: the canonical Phase C object ONLY ---- */
  function confirmPending() {
    if (!S.pending || S.pendingState === "confirming") return;
    var id = S.pending.confirmationId;
    S.pendingState = "confirming";
    notify();
    KOS.ai.orchestrator.confirm(id, function (err) {
      S.pendingState = null;
      if (err) {
        S.pending = null;
        pushRow({ kind: "warning", text: err.message });
        setVisual("error", clampText(err.message, 80));
      } else {
        S.pending = null;
        setVisual("working", "Running the confirmed action…");
      }
      notify();
    });
  }
  function rejectPending() {
    if (!S.pending) return;
    var id = S.pending.confirmationId;
    S.pending = null;
    S.pendingState = null;
    KOS.ai.orchestrator.reject(id, function () {});
    setVisual("thinking", "Declined — Kurenai is responding…");
    notify();
  }

  function clampText(s, n) { s = String(s == null ? "" : s); return s.length > n ? s.slice(0, n) + "…" : s; }

  /* ================= trigger + drawer ================= */
  var drawerEl = null, composerEl = null, lastFocus = null;

  function updateTrigger() {
    var t = document.getElementById("assistant-trigger");
    if (!t) return;
    t.classList.toggle("is-busy", S.busy && !S.pending);
    t.classList.toggle("is-confirm", !!S.pending);
    t.setAttribute("aria-expanded", S.open ? "true" : "false");
    t.title = S.pending ? "Kurenai is waiting for your confirmation"
      : S.busy ? "Kurenai is working…" : "Kurenai assistant";
  }

  function buildComposer(compact) {
    var ta = el("textarea", { class: "asst-composer-in", rows: compact ? "2" : "3",
      placeholder: "Ask Kurenai — she can read and change your real data…",
      "aria-label": "Message to the Kurenai assistant" });
    ta.value = S.draft;
    ta.addEventListener("input", function () { S.draft = ta.value; });
    ta.addEventListener("keydown", function (e) {
      /* Enter sends; Shift+Enter newline. Never touches confirmation
         buttons — those are separate, explicit clicks. */
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (submit(ta.value)) ta.value = "";
      }
    });
    var sendBtn = el("button", { class: "btn primary asst-send", text: "Send",
      onclick: function () { if (submit(ta.value)) ta.value = ""; } });
    var cancelBtn = el("button", { class: "btn asst-cancel", text: "Stop",
      "aria-label": "Stop the current request",
      onclick: function () { cancelActive(); } });
    function refresh() {
      var lock = S.busy;
      ta.disabled = lock;
      sendBtn.disabled = lock;
      sendBtn.textContent = lock ? "Working…" : "Send";
      cancelBtn.style.display = lock ? "" : "none";
    }
    refresh();
    var wrap = el("div", { class: "asst-composer" }, [ta, el("div", { class: "asst-composer-btns" }, [cancelBtn, sendBtn])]);
    wrap._refresh = refresh;
    wrap._ta = ta;
    return wrap;
  }

  function confirmationCard() {
    if (!S.pending) return null;
    var p = S.pending;
    var expiresIn = Math.max(0, Math.round((p.expiresAt - Date.now()) / 1000));
    return el("div", { class: "asst-confirm-card", role: "group", "aria-label": "Action awaiting confirmation" }, [
      el("div", { class: "asst-confirm-head" }, [
        el("b", { text: "Kurenai wants to run: " + p.tool }),
        el("span", { class: "med-chip", style: "--chip:var(--danger)", text: p.tier })
      ]),
      el("p", { class: "sub", text: p.description || "" }),
      p.target ? el("p", { class: "asst-confirm-target", text: "Target: " + p.target }) : null,
      el("pre", { class: "asst-confirm-args", text: JSON.stringify(p.args, null, 1) }),
      el("p", { class: "sub", text: "Expires in ~" + expiresIn + "s. Changing screens or targets cancels it automatically — nothing runs without this exact approval." }),
      el("div", { class: "asst-confirm-btns" }, [
        el("button", { class: "btn", type: "button", text: "Decline", onclick: rejectPending }),
        (function () {
          var b = el("button", { class: "btn primary", type: "button",
            text: S.pendingState === "confirming" ? "Running…" : "Confirm & run",
            onclick: confirmPending });
          b.disabled = S.pendingState === "confirming";
          return b;
        })()
      ])
    ].filter(Boolean));
  }

  /* ---- the pending-artifact card: a validated-but-UNSAVED proposal with
     real Edit / Discard / Save actions. Save runs the EXACT stored artifact
     through study_save_proposed; nothing here persists until then. ---- */
  function proposalCard(r) {
    var art = r.artifact;
    var isFlash = !art || art.kind !== "quiz";
    var items = (art && art.items) || [];
    var typeLabel = isFlash ? "flashcards" : "quiz questions";
    /* is this row still THE live pending artifact (a newer proposal replaces it)? */
    var current = KOS.ai.tools.getPendingArtifact && KOS.ai.tools.getPendingArtifact();
    var live = !!art && current === art;

    var tagText = r._saved ? "✓ Saved to your deck"
      : r._discarded ? "Discarded — nothing was saved"
      : !live ? "Superseded by a newer proposal"
      : "PROPOSED — not saved yet";
    var head = el("div", { class: "asst-proposal-head" }, [
      el("span", { class: "asst-proposal-tag", text: tagText }),
      art ? el("span", { class: "sub", text: (art.topicTitle ? art.topicTitle + " · " : "") + items.length + " " + typeLabel
        + (art.provider ? " · " + art.provider : "") }) : null
    ].filter(Boolean));

    /* --- editing mode (flashcards only: inline q/a) --- */
    if (r._editing && isFlash && !r._saved && !r._discarded && live) {
      var rows = items.map(function (it) {
        var q = el("textarea", { class: "asst-edit-in", rows: "2", "aria-label": "Question" }); q.value = it.q || "";
        var a = el("textarea", { class: "asst-edit-in", rows: "2", "aria-label": "Answer" }); a.value = it.a || "";
        return { q: q, a: a };
      });
      var editList = el("div", { class: "asst-proposal-items" }, rows.map(function (row2, i) {
        return el("div", { class: "asst-proposal-item asst-proposal-edit" }, [
          el("label", { class: "sub", text: "Q" + (i + 1) }), row2.q,
          el("label", { class: "sub", text: "A" + (i + 1) }), row2.a
        ]);
      }));
      var editBtns = el("div", { class: "asst-proposal-btns" }, [
        el("button", { class: "btn", type: "button", text: "Cancel", onclick: function () { toggleEditProposal(r, false); } }),
        el("button", { class: "btn primary", type: "button", text: "Apply edits", onclick: function () {
          var next = rows.map(function (row2) { return { q: row2.q.value.trim(), a: row2.a.value.trim() }; })
            .filter(function (c) { return c.q && c.a; });
          if (!next.length) { KOS.ui.toast("Each card needs a question and an answer.", true); return; }
          commitProposalEdits(r, next);
        } })
      ]);
      return el("div", { class: "asst-row asst-proposal is-editing" }, [head, editList, editBtns]);
    }

    /* --- display mode --- */
    var list = el("div", { class: "asst-proposal-items" }, items.map(function (it, i) {
      var answer = isFlash ? (it.a || "")
        : (it.opts || []).map(function (o, oi) { return (oi === it.ans ? "✓ " : "") + o; }).join("   ·   ");
      return el("div", { class: "asst-proposal-item" }, [
        el("div", { class: "asst-proposal-q" }, [ el("b", { text: (i + 1) + ". " }), document.createTextNode(it.q || "") ]),
        el("div", { class: "asst-proposal-a sub", text: answer })
      ]);
    }));

    var kids = [head, list];
    if (!r._saved && !r._discarded && live) {
      var btns = [
        el("button", { class: "btn", type: "button", text: "Discard", onclick: function () { discardProposed(r); } })
      ];
      if (isFlash) btns.push(el("button", { class: "btn", type: "button", text: "Edit", onclick: function () { toggleEditProposal(r, true); } }));
      btns.push(el("button", { class: "btn primary", type: "button", text: "Save to deck", onclick: function () { saveProposed(r); } }));
      kids.push(el("div", { class: "asst-proposal-btns" }, btns));
    }
    return el("div", { class: "asst-row asst-proposal" + (r._saved ? " is-saved" : r._discarded ? " is-discarded" : "") }, kids);
  }

  function threadRows() {
    return S.thread.map(function (r) {
      if (r.kind === "tool") {
        return el("div", { class: "asst-row asst-tool" + (r.ok ? "" : " failed") }, [
          el("span", { class: "asst-tool-chip", text: (r.ok ? "✓ " : "✕ ") + r.tool }),
          r.text ? el("span", { class: "sub", text: " " + clampText(r.text, 160) }) : null
        ].filter(Boolean));
      }
      if (r.kind === "receipt") {
        /* app-generated VERIFIED action receipt — the ground truth of a write */
        return el("div", { class: "asst-row asst-receipt" }, [
          el("span", { class: "asst-receipt-badge", text: "✓ done" }),
          el("code", { text: r.tool }),
          r.target ? el("span", { class: "sub", text: r.target }) : null,
          el("span", { class: "asst-receipt-sum", text: r.summary || "" })
        ].filter(Boolean));
      }
      if (r.kind === "proposal") return proposalCard(r);
      if (r.kind === "warning") return el("div", { class: "asst-row asst-warning", text: r.text });
      if (r.kind === "error") return el("div", { class: "asst-row asst-error", text: r.text });
      /* user/assistant text renders via textContent — provider output is
         never injected as HTML */
      return el("div", { class: "asst-row asst-" + r.kind }, [
        el("div", { class: "asst-bubble", text: r.text })
      ]);
    });
  }

  function buildThreadArea(compact) {
    var scroller = el("div", { class: "asst-thread", tabindex: "0", "aria-label": "Conversation" });
    var composer = buildComposer(compact);
    function render() {
      var atBottom = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 60;
      scroller.innerHTML = "";
      if (!S.thread.length) {
        scroller.appendChild(el("div", { class: "asst-empty" }, [
          el("p", { text: "Hello. I can read and change your real KurenaiOS data — topics, flashcards, the collection, the planner." }),
          el("p", { class: "sub", text: "Anything consequential waits for your explicit confirmation." })
        ]));
      }
      threadRows().forEach(function (n) { scroller.appendChild(n); });
      var card = confirmationCard();
      if (card) scroller.appendChild(card);
      /* only follow the tail if the user was already at it */
      if (atBottom) scroller.scrollTop = scroller.scrollHeight;
      composer._refresh();
    }
    var wrap = el("div", { class: "asst-thread-wrap" }, [scroller, composer]);
    subscribe(wrap, render);
    render();
    wrap._composer = composer;
    return wrap;
  }

  function openDrawer() {
    if (S.open) return;
    S.open = true;
    lastFocus = document.activeElement;
    drawerEl = el("aside", { class: "asst-drawer", role: "dialog", "aria-label": "Kurenai assistant", "aria-modal": "false" }, [
      el("div", { class: "asst-drawer-head" }, [
        el("img", { class: "asst-emblem", src: EMBLEM, alt: "" }),
        el("div", { class: "asst-drawer-title" }, [
          el("b", { text: "Kurenai" }),
          el("span", { class: "sub", text: S.conversationTitle || "assistant" })
        ]),
        el("button", { class: "mini-btn", type: "button", text: "⤢", "aria-label": "Open the full assistant page",
          title: "Open the full assistant page",
          onclick: function () { closeDrawer(); KOS.show("assistant"); } }),
        el("button", { class: "mini-btn", type: "button", text: "✕", "aria-label": "Close the assistant drawer",
          onclick: function () { closeDrawer(); } })
      ]),
      mascotNode("small"),
      buildThreadArea(true)
    ]);
    drawerEl.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { e.stopPropagation(); closeDrawer(); }
    });
    document.body.appendChild(drawerEl);
    updateTrigger();
    var ta = drawerEl.querySelector(".asst-composer-in");
    if (ta) ta.focus();
  }
  /* closing NEVER cancels — the request (and any pending confirmation)
     stays live; only the explicit Stop/Decline buttons cancel things */
  function closeDrawer() {
    if (!S.open) return;
    S.open = false;
    if (drawerEl) { drawerEl.remove(); drawerEl = null; }
    updateTrigger();
    var t = document.getElementById("assistant-trigger");
    if (lastFocus && lastFocus.isConnected) lastFocus.focus();
    else if (t) t.focus();
  }
  function toggleDrawer() { if (S.open) closeDrawer(); else openDrawer(); }

  /* ================= contextual actions =================
     Small, high-value, and always through the ONE submission path with
     live context in the prompt. Views receiving actions (documented in
     CATEGORY6_PLAN.md): the topic (ref) page and the vault entry editor. */
  function ask(prompt, category) {
    openDrawer();
    submit(prompt, { category: category || "complex" });
  }
  /* deterministic generation: open the drawer, then run the propose tool
     directly (no model interpretation) — it validates and yields a real
     proposal card the user reviews and saves. */
  function proposeFromContext(tool, ctx, count) {
    openDrawer();
    runToolUi(tool, { subject: ctx.subject, ref: ctx.ref, count: count });
  }
  function contextActions(kind, ctx) {
    var acts = [];
    if (kind === "ref") {
      var label = ctx.subject + " " + ctx.ref + (ctx.title ? " (" + ctx.title + ")" : "");
      acts = [
        ["Ask Kurenai", function () { ask("I'm looking at topic " + label + ". Give me a quick, exam-focused explanation of it grounded in my notes.", "tutor"); }],
        ["Make flashcards", function () { proposeFromContext("study_propose_flashcards", ctx, 8); }],
        ["Make a quiz", function () { proposeFromContext("study_propose_quiz", ctx, 6); }]
      ];
    } else if (kind === "entry") {
      acts = [
        ["Ask Kurenai", function () {
          ask("About my " + ctx.module + " collection entry id " + ctx.entryId + " (“" + ctx.title + "”): summarise where I am with it and suggest what to update.", "complex");
        }]
      ];
    }
    if (!acts.length) return null;
    return el("div", { class: "asst-ctx" }, [
      el("img", { class: "asst-ctx-glyph", src: EMBLEM, alt: "" })
    ].concat(acts.map(function (a) {
      return el("button", { class: "mini-btn asst-ctx-btn", type: "button", text: a[0], onclick: a[1] });
    })));
  }
  /* the vault editor hook — same pattern as wishlist's banner */
  if (KOS.mediaEditorHooks) {
    KOS.mediaEditorHooks.push(function (entry, overlay) {
      if (!entry || entry.id == null || !overlay) return;
      var form = overlay.querySelector(".med-form");
      if (!form) return;
      var strip = contextActions("entry", { module: entry.module, entryId: entry.id, title: entry.title });
      if (strip) form.insertBefore(strip, form.firstChild);
    });
  }

  /* ================= the dedicated page ================= */
  var PAGE_TABS = [
    ["Chat", "assistant", { tab: "chat" }, "chat"],
    ["History", "assistant", { tab: "history" }, "history"],
    ["Settings", "assistant", { tab: "settings" }, "settings"],
    ["Memory", "assistant", { tab: "memory" }, "memory"],
    ["Permissions", "assistant", { tab: "permissions" }, "permissions"],
    ["Activity", "assistant", { tab: "activity" }, "activity"]
  ];

  function pageChat(body) {
    var head = el("div", { class: "asst-page-chat-head" }, [
      mascotNode("large"),
      el("div", { class: "asst-page-chat-meta" }, [
        el("img", { class: "asst-wordmark", src: WORDMARK, alt: "Whispering Bloom" }),
        el("p", { class: "sub", text: S.conversationTitle ? "Conversation: " + S.conversationTitle : "A fresh conversation — it saves to history when you're signed in to cloud sync." }),
        el("div", { class: "lab-controls" }, [
          el("button", { class: "btn", type: "button", text: "＋ New conversation", onclick: function () { newConversation(); KOS.show("assistant", { tab: "chat" }); } })
        ])
      ])
    ]);
    body.appendChild(head);
    body.appendChild(buildThreadArea(false));
  }

  function pageHistory(body) {
    var avail = canPersist();
    if (!avail) {
      body.appendChild(el("p", { class: "sub", text: "Conversation history needs a cloud sign-in (Archive → Account & Cloud Sync). The current conversation still works — it just isn't saved." }));
      return;
    }
    var list = el("div", { class: "asst-history" });
    body.appendChild(list);
    function render() {
      list.innerHTML = "";
      list.appendChild(el("p", { class: "sub", text: "Loading…" }));
      KOS.ai.convo.list(function (err, rows) {
        list.innerHTML = "";
        if (err) { list.appendChild(el("p", { class: "sub is-error", text: "Couldn't load history: " + err.message })); return; }
        if (!rows.length) { list.appendChild(el("p", { class: "sub", text: "No conversations yet — start one in Chat." })); return; }
        rows.forEach(function (c) {
          var titleSpan = el("b", { text: c.title });
          list.appendChild(el("div", { class: "asst-history-row" + (c.id === S.conversationId ? " current" : "") }, [
            el("div", { class: "asst-history-main" }, [
              titleSpan,
              el("span", { class: "sub", text: c.updatedAt ? new Date(c.updatedAt).toLocaleString() : "" })
            ]),
            el("div", { class: "asst-history-btns" }, [
              el("button", { class: "mini-btn", type: "button", text: "Open", onclick: function () {
                openConversation(c.id, function (err2) { if (!err2) KOS.show("assistant", { tab: "chat" }); });
              } }),
              el("button", { class: "mini-btn", type: "button", text: "✎", "aria-label": "Rename conversation", onclick: function () {
                var input = el("input", { type: "text", class: "todo-in", value: c.title, "aria-label": "New title" });
                var row = el("div", { class: "asst-history-rename" }, [input,
                  el("button", { class: "mini-btn", type: "button", text: "Save", onclick: function () {
                    KOS.ai.convo.rename(c.id, input.value, function (err2) {
                      if (err2) { KOS.ui.toast(err2.message, true); return; }
                      if (c.id === S.conversationId) S.conversationTitle = input.value;
                      render();
                    });
                  } })]);
                titleSpan.replaceWith(row);
                input.focus();
              } }),
              el("button", { class: "mini-btn danger", type: "button", text: "✕", "aria-label": "Delete conversation", onclick: function () {
                KOS.ui.confirm({ title: "Delete this conversation?", danger: true, confirm: "Delete",
                  body: "“" + c.title + "” and its messages are removed from history. Actions it ran are NOT undone (see Activity)." },
                  function () {
                    KOS.ai.convo.remove(c.id, function (err2) {
                      if (err2) { KOS.ui.toast(err2.message, true); return; }
                      if (c.id === S.conversationId) newConversation();
                      render();
                    });
                  });
              } })
            ])
          ]));
        });
      });
    }
    render();
  }

  function pageSettings(body) {
    var CATS = [
      ["tutor", "Explanations & tutoring"],
      ["crud", "Simple data requests"],
      ["generation", "Flashcard / quiz generation"],
      ["complex", "Multi-step requests"]
    ];
    var PROVIDERS = [["ollama", "Ollama (local, free)"], ["gemini", "Gemini (online, billable)"], ["deepseek", "DeepSeek (online, billable)"]];
    var cfg = KOS.ai.config();
    body.appendChild(el("p", { class: "sub", text: "Each kind of request routes to its own model. Online providers run through your cloud account with a daily cap; the local Ollama needs its app running on this machine. API keys live only on the server — nothing here stores one." }));

    CATS.forEach(function (cat) {
      var route = cfg.routing[cat[0]];
      var provSel = el("select", { class: "todo-in", "aria-label": cat[1] + " provider" }, PROVIDERS.map(function (p) {
        var o = el("option", { value: p[0], text: p[1] });
        if (route.provider === p[0]) o.selected = true;
        return o;
      }));
      var modelIn = el("input", { type: "text", class: "todo-in", value: route.model || "",
        placeholder: "model id (e.g. gemini-3.5-flash)", "aria-label": cat[1] + " model id" });
      function save() {
        if (!KOS.ai.setRouting(cat[0], provSel.value, modelIn.value)) KOS.ui.toast("That routing isn't valid.", true);
      }
      provSel.addEventListener("change", save);
      /* persist on every keystroke (input), not just blur (change): a typed
         model that never blurs — because the user switches tab or submits —
         would otherwise be discarded when KOS.show destroys this input,
         leaving the model empty at request time. `change` is kept as a
         belt-and-braces final save. */
      modelIn.addEventListener("input", save);
      modelIn.addEventListener("change", save);
      var fb = cfg.fallback[cat[0]];
      var fbSel = el("select", { class: "todo-in", "aria-label": cat[1] + " fallback" }, [
        el("option", { value: "", text: "No fallback (recommended for local)" })
      ].concat(PROVIDERS.map(function (p) {
        var o = el("option", { value: p[0], text: "Fall back to " + p[1] });
        if (fb && fb.provider === p[0]) o.selected = true;
        return o;
      })));
      fbSel.addEventListener("change", function () {
        var v = fbSel.value;
        if (!v) { KOS.ai.setFallback(cat[0], null); return; }
        var model = v === "gemini" ? "gemini-3.5-flash" : v === "deepseek" ? "deepseek-v4-flash" : (cfg.routing.crud.model || "");
        KOS.ai.setFallback(cat[0], { provider: v, model: model });
        KOS.ui.toast("Fallback enabled for " + cat[1] + " — switches are always labelled, never silent.");
      });
      body.appendChild(el("div", { class: "asst-route-row" }, [
        el("b", { text: cat[1] }), provSel, modelIn, fbSel
      ]));
    });

    var ollamaIn = el("input", { type: "text", class: "todo-in", value: cfg.ollama.url, "aria-label": "Ollama endpoint" });
    /* same reasoning as the model input — persist on input so a typed
       endpoint survives tab navigation */
    ollamaIn.addEventListener("input", function () { KOS.ai.setOllamaUrl(ollamaIn.value); });
    ollamaIn.addEventListener("change", function () { KOS.ai.setOllamaUrl(ollamaIn.value); });
    body.appendChild(el("div", { class: "asst-route-row" }, [
      el("b", { text: "Ollama endpoint" }), ollamaIn,
      el("span", { class: "sub", text: "Start Ollama with OLLAMA_ORIGINS allowing this app's origin." })
    ]));

    var health = el("div", { class: "asst-health" });
    body.appendChild(el("div", { class: "lab-controls" }, [
      el("button", { class: "btn", type: "button", text: "Check availability & usage", onclick: function () {
        health.innerHTML = "";
        health.appendChild(el("p", { class: "sub", text: "Checking…" }));
        var out = [];
        var todo = 3;
        ["ollama", "gemini", "deepseek"].forEach(function (p) {
          KOS.ai.health(p, function (e, h) {
            out.push(h || { provider: p, available: false, reason: "no answer" });
            if (--todo === 0) {
              health.innerHTML = "";
              out.forEach(function (h2) {
                health.appendChild(el("p", { class: "sub" }, [
                  el("b", { text: h2.provider + ": " }),
                  h2.available
                    ? "available" + (h2.used != null ? " · " + h2.used + "/" + (h2.cap || "?") + " requests today" : "") +
                      (h2.models ? " · models: " + h2.models.slice(0, 4).join(", ") : "")
                    : "unavailable — " + (h2.reason || "unknown")
                ]));
              });
            }
          });
        });
      } })
    ]));
    body.appendChild(health);
  }

  function pageMemory(body) {
    body.appendChild(el("p", { class: "sub", text: "Kurenai's notes-to-self. Everything here was explicitly asked for or approved by you — nothing is ever inferred silently, and this list IS the whole memory. Secrets and keys are refused." }));
    if (!KOS.ai.memory.available().persist) {
      body.appendChild(el("p", { class: "sub", text: "Memory needs a cloud sign-in (Archive → Account & Cloud Sync)." }));
      return;
    }
    var list = el("div", { class: "asst-memory" });
    var addIn = el("textarea", { class: "todo-in", rows: "2", placeholder: "Add a note for Kurenai to remember…", "aria-label": "New memory" });
    body.appendChild(el("div", { class: "asst-memory-add" }, [addIn,
      el("button", { class: "btn primary", type: "button", text: "＋ Remember", onclick: function () {
        KOS.ai.memory.add(addIn.value, "user", function (err) {
          if (err) { KOS.ui.toast(err.message, true); return; }
          addIn.value = "";
          render();
        });
      } })]));
    body.appendChild(list);
    function render() {
      list.innerHTML = "";
      KOS.ai.memory.list(function (err, rows) {
        if (err) { list.appendChild(el("p", { class: "sub is-error", text: err.message })); return; }
        if (!rows.length) { list.appendChild(el("p", { class: "sub", text: "No memories yet." })); return; }
        rows.forEach(function (m) {
          var content = el("p", { class: "asst-memory-text", text: m.content });
          list.appendChild(el("div", { class: "asst-memory-row" }, [
            content,
            el("span", { class: "sub", text: (m.origin === "user" ? "you asked" : "you approved") +
              (m.updatedAt ? " · " + new Date(m.updatedAt).toLocaleDateString() : "") }),
            el("div", { class: "asst-history-btns" }, [
              el("button", { class: "mini-btn", type: "button", text: "✎", "aria-label": "Edit memory", onclick: function () {
                var ta = el("textarea", { class: "todo-in", rows: "2" }); ta.value = m.content;
                var save = el("button", { class: "mini-btn", type: "button", text: "Save", onclick: function () {
                  KOS.ai.memory.update(m.id, ta.value, function (err2) {
                    if (err2) { KOS.ui.toast(err2.message, true); return; }
                    render();
                  });
                } });
                content.replaceWith(el("div", { class: "asst-memory-edit" }, [ta, save]));
                ta.focus();
              } }),
              el("button", { class: "mini-btn danger", type: "button", text: "✕", "aria-label": "Delete memory", onclick: function () {
                KOS.ui.confirm({ title: "Forget this?", danger: true, confirm: "Forget",
                  body: "“" + clampText(m.content, 120) + "” is removed permanently." },
                  function () { KOS.ai.memory.remove(m.id, function () { render(); }); });
              } })
            ])
          ]));
        });
      });
    }
    render();
  }

  function pagePermissions(body) {
    body.appendChild(el("p", { class: "sub", text: "What Kurenai may do on her own. Read tools just look things up. Reversible tools may run automatically (tighten any to “ask first”). Consequential tools — deleting, spending, purchases, syncs — ALWAYS require your confirmation; that floor cannot be turned off. “Blocked” removes a tool entirely." }));
    var cats = {};
    KOS.ai.tools.list().forEach(function (t) { (cats[t.category] = cats[t.category] || []).push(t); });
    Object.keys(cats).sort().forEach(function (cat) {
      body.appendChild(el("h3", { class: "n-h", text: cat }));
      cats[cat].forEach(function (t) {
        var mode = KOS.ai.orchestrator.effectiveMode(t.name);
        var opts = [];
        if (t.tier !== "consequential") opts.push(["", "default (" + (t.tier === "read" ? "runs freely" : "runs, undoable") + ")"], ["ask", "ask first"]);
        else opts.push(["", "always asks (fixed)"]);
        opts.push(["never", "blocked"]);
        var sel = el("select", { class: "todo-in asst-perm-sel", "aria-label": "Permission for " + t.name }, opts.map(function (o) {
          var opt = el("option", { value: o[0], text: o[1] });
          var userMode = (KOS.ai.config().permissions || { perTool: {} }).perTool[t.name] || "";
          if (userMode === o[0]) opt.selected = true;
          return opt;
        }));
        sel.addEventListener("change", function () {
          var r = KOS.ai.orchestrator.setPermission(t.name, sel.value === "" ? null : sel.value);
          if (!r.ok) { KOS.ui.toast(r.msg, true); sel.value = ""; }
        });
        body.appendChild(el("div", { class: "asst-perm-row" }, [
          el("code", { text: t.name }),
          el("span", { class: "med-chip", style: "--chip:" + (t.tier === "read" ? "var(--good)" : t.tier === "reversible" ? "var(--warning)" : "var(--danger)"), text: t.tier }),
          sel
        ]));
        void mode;
      });
    });
  }

  /* audit reading: own rows via the user's session; signed out, the queued
     kv rows are shown so history is never invisible. */
  function loadAudit(cb) {
    if (_auditReader) { _auditReader(cb); return; }
    var uid = KOS.cloud && KOS.cloud.userId && KOS.cloud.userId();
    if (uid && KOS.cloud.available()) {
      KOS.cloud.client().from("kos_assistant_audit").select("*")
        .eq("user_id", uid).order("created_at", { ascending: false }).limit(60)
        .then(function (res) { cb(res.error ? new Error(res.error.message) : null, res.data || [], "cloud"); })
        .catch(function (e) { cb(new Error((e && e.message) || "network"), []); });
      return;
    }
    KOS.mediadb.getKV("assistant.auditQueue", function (e, q) {
      var rows = (Array.isArray(q) ? q : []).filter(function (r) { return r.kind === "insert"; })
        .map(function (r) { return r.payload; }).reverse();
      cb(null, rows, "queued");
    });
  }

  function pageActivity(body) {
    body.appendChild(el("p", { class: "sub", text: "Every action Kurenai proposed or ran, with its real outcome — separate from the chat, and it can't be deleted from here (the record stays honest)." }));
    var list = el("div", { class: "asst-audit" });
    body.appendChild(list);
    loadAudit(function (err, rows, source) {
      list.innerHTML = "";
      if (err) { list.appendChild(el("p", { class: "sub is-error", text: "Couldn't load the action history: " + err.message })); return; }
      if (source === "queued") list.appendChild(el("p", { class: "sub", text: "Signed out — showing actions queued on this device; they upload on sign-in." }));
      if (!rows.length) { list.appendChild(el("p", { class: "sub", text: "No assistant actions yet." })); return; }
      rows.forEach(function (r) {
        list.appendChild(el("div", { class: "asst-audit-row st-" + (r.status || "proposed") }, [
          el("span", { class: "asst-audit-status", text: r.status || "proposed" }),
          el("code", { text: r.tool }),
          el("span", { class: "med-chip", text: r.tier || "" }),
          r.target ? el("span", { class: "sub", text: r.target }) : null,
          el("span", { class: "sub", text: r.created_at ? new Date(r.created_at).toLocaleString() : "" }),
          r.result_summary ? el("span", { class: "sub asst-audit-sum", text: clampText(r.result_summary, 120) }) : null,
          r.error_summary ? el("span", { class: "sub is-error", text: clampText(r.error_summary, 120) }) : null
        ].filter(Boolean)));
      });
    });
  }

  KOS.views.assistant = function (main, arg) {
    document.getElementById("tree").classList.add("hidden");
    document.getElementById("cols").classList.add("no-tree");
    var tab = (arg && arg.tab) || "chat";
    if (!PAGE_TABS.some(function (t) { return t[3] === tab; })) tab = "chat";
    var tabs = KOS.workspaceTabs(PAGE_TABS, tab, "Assistant pages", "asst-tabs workspace-header-tabs");
    main.appendChild(el("div", { class: "dash-head asst-head" }, [
      el("div", { class: "dh-txt" }, [
        el("span", { class: "dh-kicker", text: "Whispering Bloom" }),
        el("h1", { text: "Kurenai Assistant" }),
        el("div", { class: "dh-sub" }, [el("span", { class: "board", text: "A context-aware companion over your real data — every consequential action needs your explicit confirmation." })])
      ]),
      tabs
    ]));
    var body = el("section", { class: "asst-page asst-page-" + tab, "aria-label": "Assistant " + tab });
    main.appendChild(body);
    if (tab === "chat") pageChat(body);
    else if (tab === "history") pageHistory(body);
    else if (tab === "settings") pageSettings(body);
    else if (tab === "memory") pageMemory(body);
    else if (tab === "permissions") pagePermissions(body);
    else if (tab === "activity") pageActivity(body);
  };

  /* ================= wiring ================= */
  var trigger = document.getElementById("assistant-trigger");
  if (trigger) trigger.addEventListener("click", toggleDrawer);
  updateTrigger();

  KOS.assistant = {
    open: openDrawer,
    close: closeDrawer,
    toggle: toggleDrawer,
    submit: submit,
    ask: ask,
    cancel: cancelActive,
    confirmPending: confirmPending,
    rejectPending: rejectPending,
    newConversation: newConversation,
    openConversation: openConversation,
    contextActions: contextActions,
    mascotNode: mascotNode,
    setVisual: setVisual,
    loadAudit: loadAudit,
    state: function () { return S; },
    MASCOT_STATES: MASCOT_STATES,
    _config: function (o) { o = o || {}; if ("auditReader" in o) _auditReader = o.auditReader; }
  };
})();
