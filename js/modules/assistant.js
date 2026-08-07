/* Kurenai OS — modules/assistant.js (Category 6 Phase E)
   The three Kurenai Assistant surfaces — global drawer, contextual
   actions, dedicated page — over ONE shared controller. The UI here is
   presentation only: every request goes through KOS.ai.orchestrator (one
   submission path), confirmations use the canonical Phase C object,
   conversations/memory ride KOS.ai.convo / KOS.ai.memory, and no code in
   this file executes a tool, decides a tier, or writes memory directly.

   Mascot: exactly six states (idle/thinking/working/success/error/
   confirmation), driven EXPLICITLY by orchestrator lifecycle events —
   never inferred from message text. Kurenai's canonical portrait stays
   stable while a six-state Bloom Familiar changes beside her. Both are
   supplementary: every state also renders real textual status, and a
   failed image load falls back to a glyph + the text. The state→asset map
   mirrors assets/assistant/manifest.json (hardcoded — file:// can't fetch
   JSON; keep the two in step).

   The drawer and the dedicated page render the SAME thread/state, so a
   conversation moves between them without losing anything or duplicating
   provider requests (one busy flag, one draft, one pending confirmation).

   Voice cues are deliberately short, optional and on-device through the
   browser speech engine. They narrate lifecycle state only, never whole
   provider answers and never send audio or text to a new cloud endpoint. */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var el = KOS.ui.el;

  /* ================= mascot state map (mirrors manifest.json) ========== */
  var ASSET_BASE = "assets/assistant/";
  var PRODUCTION_MASCOT = "mascot/full/kurenai-production.png";
  var MASCOT_STATES = {
    idle:         { image: PRODUCTION_MASCOT, familiar: "mascot/familiar/idle.png", label: "Ready when you are", cue: "Ready when you are." },
    thinking:     { image: PRODUCTION_MASCOT, familiar: "mascot/familiar/thinking.png", label: "Thinking…", cue: "Let me think." },
    working:      { image: PRODUCTION_MASCOT, familiar: "mascot/familiar/working.png", label: "Working with your KurenaiOS data…", cue: "I'm on it." },
    success:      { image: PRODUCTION_MASCOT, familiar: "mascot/familiar/success.png", label: "Complete and verified", cue: "All done.", autoReturnMs: 2200 },
    error:        { image: PRODUCTION_MASCOT, familiar: "mascot/familiar/error.png", label: "Something needs attention", cue: "That didn't work." },
    confirmation: { image: PRODUCTION_MASCOT, familiar: "mascot/familiar/confirmation.png", label: "Waiting for your approval", cue: "Your call." }
  };
  var EMBLEM = ASSET_BASE + "logo/whispering-bloom-emblem-production.png";
  var WORDMARK = ASSET_BASE + "logo/whispering-bloom-wordmark.png";

  /* Display copy only. Tool ids remain untouched in controller, audit and
     orchestrator data, but are never the primary language shown to people. */
  var TOOL_COPY = {
    study_list_subjects: "Reading your subjects",
    study_list_topics: "Reading your topics",
    study_read_notes: "Reading your topic notes",
    study_get_progress: "Checking your study progress",
    study_generate_flashcards: "Preparing flashcards",
    study_propose_flashcards: "Preparing a flashcard proposal",
    study_propose_quiz: "Preparing a quiz proposal",
    study_save_proposed: "Saving the approved study set",
    collection_list_entries: "Reading your collection",
    collection_get_entry: "Reading a collection entry",
    todo_list_tasks: "Reading your tasks",
    todo_add_task: "Adding a task",
    calendar_list_events: "Reading your calendar",
    calendar_add_event: "Adding a calendar event"
  };
  var TOOL_NAMES = {
    app_navigate: "Open an app page",
    app_get_context: "Check current context",
    focus_pause_resume: "Pause or resume focus",
    games_bulk_add: "Add games in bulk",
    todo_list: "Read tasks",
    wishlist_list: "Read wishlist",
    goals_list: "Read goals",
    attachments_list: "Read attachments",
    memory_list: "Read memory",
    sync_cloud_sync_now: "Sync cloud data now",
    sync_retry_pushes: "Retry pending sync changes",
    wishlist_mark_purchased: "Mark wishlist item purchased",
    collection_add_from_external: "Add an external search result"
  };
  var ACTION_WORDS = {
    list: "Read", read: "Read", get: "Check", search: "Search", find: "Find",
    propose: "Prepare", generate: "Prepare", save: "Save", add: "Add", create: "Create",
    update: "Update", set: "Set", mark: "Mark", delete: "Delete", remove: "Remove",
    import: "Import", export: "Export", sync: "Sync", start: "Start", stop: "Stop",
    complete: "Complete", log: "Record", archive: "Archive", restore: "Restore",
    navigate: "Open", buy: "Buy", toggle: "Toggle", tick: "Check off", rate: "Rate"
  };
  var DOMAIN_NOUNS = { todo: "tasks", wishlist: "wishlist", goals: "goals", attachments: "attachments",
    memory: "memory", app: "app page", governor: "Governor", focus: "focus session", archive: "backup",
    sync: "cloud sync", games: "games" };

  function titleWords(value) {
    return String(value || "").split("_").filter(Boolean).map(function (w) {
      return w.charAt(0).toUpperCase() + w.slice(1);
    }).join(" ");
  }
  function toolDisplayName(name) {
    if (TOOL_NAMES[name]) return TOOL_NAMES[name];
    var parts = String(name || "assistant_action").split("_");
    var verbIndex = parts.findIndex(function (p) { return ACTION_WORDS[p]; });
    var verb = verbIndex >= 0 ? ACTION_WORDS[parts[verbIndex]] : "Use";
    var subject = parts.slice(verbIndex >= 0 ? verbIndex + 1 : 1).join("_");
    if (!subject && verbIndex > 0) subject = DOMAIN_NOUNS[parts[0]] || parts.slice(0, verbIndex).join("_");
    if (!subject) subject = parts.join("_");
    return verb + " " + titleWords(subject).toLowerCase();
  }
  function toolActivity(name, phase) {
    var copy = TOOL_COPY[name] || toolDisplayName(name);
    if (phase === "done") return copy.replace(/ing\b/, "ed");
    return copy;
  }
  function tierLabel(tier) {
    return tier === "consequential" ? "Needs approval" : tier === "reversible" ? "Undoable action" : "Read only";
  }
  function providerName(name) {
    return name === "gemini" ? "Gemini" : name === "deepseek" ? "DeepSeek" : name === "ollama" ? "Ollama" : titleWords(name);
  }

  /* Assistant workspace preferences are ordinary app state, so pins,
     projects, layout and voice choices ride the existing save/backup/cloud
     state path. Conversation contents remain owned by KOS.ai.convo. */
  function workspaceCfg() {
    var root = KOS.store.state.assistant || (KOS.store.state.assistant = {});
    var ws = root.workspace || (root.workspace = {});
    if (!Array.isArray(ws.pins)) ws.pins = [];
    if (!Array.isArray(ws.projects)) ws.projects = [];
    if (!ws.conversationProjects || typeof ws.conversationProjects !== "object") ws.conversationProjects = {};
    if (typeof ws.sidebarCollapsed !== "boolean") ws.sidebarCollapsed = false;
    if (typeof ws.voiceEnabled !== "boolean") ws.voiceEnabled = false;
    if (typeof ws.voiceName !== "string") ws.voiceName = "";
    return ws;
  }
  function saveWorkspace() { KOS.store.save(); }
  function conversationKey() { return S.conversationId || S.localId; }
  function projectFor(key) { return workspaceCfg().conversationProjects[key || conversationKey()] || ""; }
  function assignProject(projectId, key) {
    var ws = workspaceCfg();
    key = key || conversationKey();
    if (!key) return;
    if (projectId) ws.conversationProjects[key] = projectId;
    else delete ws.conversationProjects[key];
    saveWorkspace();
  }
  function migrateWorkspaceKey(from, to) {
    if (!from || !to || from === to) return;
    var ws = workspaceCfg();
    if (ws.conversationProjects[from]) {
      ws.conversationProjects[to] = ws.conversationProjects[from];
      delete ws.conversationProjects[from];
    }
    var at = ws.pins.indexOf(from);
    if (at >= 0) ws.pins.splice(at, 1, to);
    saveWorkspace();
  }
  function togglePin(key) {
    var ws = workspaceCfg();
    key = key || conversationKey();
    var at = ws.pins.indexOf(key);
    if (at >= 0) ws.pins.splice(at, 1);
    else ws.pins.unshift(key);
    saveWorkspace();
    notify();
  }

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
    lastError: null,
    streaming: false
  };
  var listeners = [];     // full re-render subscribers (thread/status areas)
  var mascots = [];       // live mascot nodes
  var successTimer = null;
  var _auditReader = null; // test seam
  var announcerEl = null;
  var streamTimer = null, streamRow = null, streamDone = null;
  var lastVoiceState = null, lastVoiceAt = 0;

  function announcer() {
    if (announcerEl && announcerEl.isConnected) return announcerEl;
    announcerEl = el("div", { class: "asst-live sr-only", "aria-live": "polite", "aria-atomic": "true" });
    document.body.appendChild(announcerEl);
    return announcerEl;
  }
  function announce(text) {
    var n = announcer();
    n.textContent = "";
    window.setTimeout(function () { if (n.isConnected) n.textContent = String(text || ""); }, 20);
  }

  function notify() {
    listeners = listeners.filter(function (l) { return l.node.isConnected; });
    listeners.forEach(function (l) { try { l.fn(); } catch (e) { /* a render error must not kill the controller */ } });
    updateTrigger();
  }
  function subscribe(node, fn) { listeners.push({ node: node, fn: fn }); }

  function reducedMotion() {
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  function voiceCue(state, force) {
    var ws = workspaceCfg();
    if (!ws.voiceEnabled || !window.speechSynthesis || !window.SpeechSynthesisUtterance) return;
    var now = Date.now();
    if (!force && (state === "idle" || (state === lastVoiceState && now - lastVoiceAt < 4500))) return;
    var spec = MASCOT_STATES[state] || MASCOT_STATES.idle;
    try {
      var utterance = new SpeechSynthesisUtterance(spec.cue || spec.label);
      var voices = window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices() : [];
      var selected = voices.find(function (v) { return v.name === ws.voiceName; }) ||
        voices.find(function (v) { return /samantha|ava|serena|female|kyoko|haruka/i.test(v.name); }) ||
        voices.find(function (v) { return /^en[-_]/i.test(v.lang || ""); });
      if (selected) utterance.voice = selected;
      utterance.pitch = 1.18;
      utterance.rate = 1.04;
      utterance.volume = 0.72;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
      lastVoiceState = state;
      lastVoiceAt = now;
    } catch (e) { /* an unavailable OS voice never interrupts the assistant */ }
  }

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
    announce(S.statusText);
    voiceCue(state, false);
  }

  /* ---- the mascot component (one implementation, two sizes) ---- */
  function mascotNode(size) {
    var img = el("img", { class: "asst-mascot-img", alt: "" });
    img.addEventListener("error", function () { node.classList.add("img-failed"); });
    var familiar = el("img", { class: "asst-familiar-img", alt: "" });
    familiar.addEventListener("error", function () { node.classList.add("familiar-failed"); });
    var glyph = el("span", { class: "asst-mascot-fallback", "aria-hidden": "true", text: "紅" });
    var status = el("p", { class: "asst-status-line", role: "status" });
    var frame = el("button", { class: "asst-mascot-frame", type: "button",
      "aria-label": "Interact with Kurenai", title: "Say hello" }, [
      el("span", { class: "asst-bloom-ring ring-one", "aria-hidden": "true" }),
      el("span", { class: "asst-bloom-ring ring-two", "aria-hidden": "true" }),
      img,
      familiar,
      glyph
    ]);
    frame.addEventListener("click", function () {
      node.classList.remove("is-reacting");
      void node.offsetWidth;
      node.classList.add("is-reacting");
      voiceCue(S.visual, true);
      window.setTimeout(function () { node.classList.remove("is-reacting"); }, 900);
    });
    var node = el("div", { class: "asst-mascot " + (size === "large" ? "asst-mascot-lg" : "asst-mascot-sm") },
      [frame, status]);
    function update() {
      var st = MASCOT_STATES[S.visual] || MASCOT_STATES.idle;
      node.classList.remove("img-failed");
      node.classList.remove("familiar-failed");
      node.setAttribute("data-state", S.visual);
      img.src = ASSET_BASE + st.image;
      familiar.src = ASSET_BASE + st.familiar;
      img.alt = size === "large" ? "Kurenai, the Whispering Bloom assistant" : "";
      familiar.alt = size === "large" ? ("Bloom Familiar: " + st.label) : "";
      status.textContent = S.statusText;
    }
    mascots.push({ node: node, update: update });
    update();
    return node;
  }

  /* ---- thread helpers ---- */
  function pushRow(row) {
    S.thread.push(row);
    if (row.kind === "assistant") announce("Kurenai replied. " + clampText(row.text, 140));
    else if (row.kind === "tool") announce((row.ok ? "Completed: " : "Could not complete: ") + toolActivity(row.tool));
    else if (row.kind === "receipt") announce("Verified action complete. " + (row.summary || toolDisplayName(row.tool)));
    else if (row.kind === "warning") announce("Warning. " + clampText(row.text, 140));
    else if (row.kind === "error") announce("Error. " + clampText(row.text, 140));
    notify();
  }
  function finishAssistantStream(showAll) {
    clearTimeout(streamTimer);
    streamTimer = null;
    if (streamRow) {
      if (showAll) streamRow.visibleText = streamRow.text;
      streamRow.streaming = false;
      announce("Kurenai replied. " + clampText(streamRow.text, 140));
    }
    streamRow = null;
    S.streaming = false;
    var done = streamDone;
    streamDone = null;
    notify();
    if (done) done();
  }
  function pushAssistantStream(text) {
    text = String(text || "");
    if (!text) return;
    /* Short acknowledgements feel slower when artificially typed. The
       progressive reveal is reserved for substantive replies. */
    if (text.length <= 160 || reducedMotion()) {
      pushRow({ kind: "assistant", text: text, visibleText: text, streaming: false });
      return;
    }
    clearTimeout(streamTimer);
    streamRow = { kind: "assistant", text: text, visibleText: "", streaming: true };
    S.thread.push(streamRow);
    S.streaming = true;
    notify();
    var at = 0;
    var chunk = Math.max(2, Math.ceil(text.length / 180));
    (function reveal() {
      if (!streamRow) return;
      var next = Math.min(text.length, at + chunk);
      if (next < text.length) {
        var boundary = text.slice(next, Math.min(text.length, next + 14)).search(/[\s,.;:!?)]/);
        if (boundary >= 0) next += boundary + 1;
      }
      at = next;
      streamRow.visibleText = text.slice(0, at);
      notify();
      if (at >= text.length) { finishAssistantStream(false); return; }
      streamTimer = window.setTimeout(reveal, 32);
    })();
  }
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
    finishAssistantStream(true);
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
    finishAssistantStream(true);
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
    if (S.busy || S.streaming) { KOS.ui.toast("Kurenai is already working — cancel first or wait.", true); return false; }
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
          else if (p.state === "fallback") pushRow({ kind: "warning", text: "Switched from " + providerName(p.from) + " to " + providerName(p.to) + " using the fallback you enabled." });
          else if (p.state === "persist_warning") pushRow({ kind: "warning", text: p.message });
        },
        onToolStart: function (p) {
          setVisual("working", toolActivity(p.tool) + "…");
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
          setVisual("confirmation", "Review before Kurenai acts: " + toolDisplayName(card.tool));
          announce("Your approval is required for " + toolDisplayName(card.tool));
          notify();
        },
        onText: function (p) { pushAssistantStream(p.text); },
        onError: function (p) {
          S.lastError = p.message;
          pushRow({ kind: "error", text: p.message });
          setVisual("error", "Failed: " + clampText(p.message, 80));
        },
        onDone: function (p) {
          function finishUi() {
          S.busy = false;
          S.requestId = null;
          if (p.status === "complete") setVisual("success");
          else if (p.status === "cancelled") setVisual("idle", "Cancelled");
          /* error state already set by onError */
          notify();
          }
          if (S.streaming) streamDone = finishUi;
          else finishUi();
        }
      });
      if (S.requestId === null) { S.busy = false; setVisual("idle"); }
      notify();
    }

    /* first message of a fresh signed-in session mints the conversation so
       history works from turn one; signed out it stays in-memory (loudly). */
    if (!S.conversationId && canPersist()) {
      KOS.ai.convo.create(clampText(text, 60), function (err, convo) {
        if (!err && convo) {
          var localKey = S.localId;
          S.conversationId = convo.id; S.conversationTitle = convo.title;
          migrateWorkspaceKey(localKey, convo.id);
        }
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
    finishAssistantStream(true);
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
    setVisual("working", toolActivity(name) + "…");
    notify();
    S.requestId = KOS.ai.orchestrator.runTool(name, args || {}, {
      onProposal: function (p) {
        var art = KOS.ai.tools.getPendingArtifact && KOS.ai.tools.getPendingArtifact();
        pushRow({ kind: "proposal", artifact: art, tool: p.tool });
      },
      onReceipt: function (p) { pushRow({ kind: "receipt", tool: p.tool, target: p.target, summary: p.summary }); },
      onConfirmationNeeded: function (card) {
        S.pending = card; S.pendingState = null; S.busy = true;
        setVisual("confirmation", "Review before Kurenai acts: " + toolDisplayName(card.tool));
        announce("Your approval is required for " + toolDisplayName(card.tool)); notify();
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
  var drawerEl = null, drawerScrim = null, composerEl = null, lastFocus = null;

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
    var ta = el("textarea", { class: "asst-composer-in", rows: "1",
      placeholder: compact ? "Ask Kurenai…" : "Ask about your studies, collection, plans, or progress…",
      "aria-label": "Message to the Kurenai assistant" });
    ta.value = S.draft;
    function autoSize() {
      var max = compact ? 132 : 168;
      ta.style.height = "auto";
      var next = ta.value ? Math.min(Math.max(24, ta.scrollHeight), max) : 24;
      ta.style.height = next + "px";
      ta.style.overflowY = ta.scrollHeight > max ? "auto" : "hidden";
    }
    ta.addEventListener("input", function () { S.draft = ta.value; autoSize(); });
    ta.addEventListener("keydown", function (e) {
      /* Enter sends; Shift+Enter newline. Never touches confirmation
         buttons — those are separate, explicit clicks. */
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (submit(ta.value)) { ta.value = ""; autoSize(); }
      }
    });
    var sendBtn = el("button", { class: "asst-send", type: "button", text: "↑",
      "aria-label": "Send message to Kurenai",
      title: "Send message",
      onclick: function () { if (submit(ta.value)) { ta.value = ""; autoSize(); } } });
    var cancelBtn = el("button", { class: "mini-btn asst-cancel", type: "button", text: "Stop",
      "aria-label": "Stop the current request",
      onclick: function () { cancelActive(); } });
    function refresh() {
      var lock = S.busy || S.streaming;
      ta.disabled = lock;
      sendBtn.disabled = lock;
      cancelBtn.style.display = lock ? "" : "none";
      sendBtn.classList.toggle("is-working", lock);
    }
    refresh();
    var wrap = el("div", { class: "asst-composer" }, [
      ta,
      el("div", { class: "asst-composer-foot" }, [
        el("span", { class: "asst-composer-hint", text: compact ? "Shift + Enter for a new line" : "Enter to send · Shift + Enter for a new line" }),
        el("div", { class: "asst-composer-btns" }, [cancelBtn, sendBtn])
      ])
    ]);
    wrap._refresh = refresh;
    wrap._ta = ta;
    window.requestAnimationFrame(autoSize);
    return wrap;
  }

  function confirmationCard() {
    if (!S.pending) return null;
    var p = S.pending;
    var expiresIn = Math.max(0, Math.round((p.expiresAt - Date.now()) / 1000));
    return el("div", { class: "asst-confirm-card", role: "group", "aria-label": "Review an action before Kurenai runs it" }, [
      el("div", { class: "asst-confirm-kicker", text: "Review before Kurenai acts" }),
      el("div", { class: "asst-confirm-head" }, [
        el("div", {}, [
          el("h3", { text: toolDisplayName(p.tool) }),
          el("code", { class: "asst-technical-id", text: p.tool })
        ]),
        el("span", { class: "asst-tier asst-tier-" + p.tier, text: tierLabel(p.tier) })
      ]),
      el("p", { class: "asst-confirm-desc", text: p.description || "This action changes your KurenaiOS data." }),
      p.target ? el("div", { class: "asst-confirm-target" }, [
        el("span", { text: "Target" }), el("b", { text: p.target })
      ]) : null,
      el("details", { class: "asst-confirm-detail" }, [
        el("summary", { text: "Review the exact request" }),
        el("pre", { class: "asst-confirm-args", text: JSON.stringify(p.args, null, 1) })
      ]),
      el("p", { class: "asst-confirm-expiry", text: "Approval expires in about " + expiresIn + " seconds. A changed target or screen invalidates it automatically." }),
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

  /* ================= safe assistant rich text =================
     Provider prose is Markdown, but it is still untrusted input. This
     renderer deliberately builds a small, useful Markdown DOM vocabulary
     rather than converting arbitrary HTML and sanitising it afterwards.
     Raw HTML therefore remains visible text; links pass a protocol allowlist;
     remote images are never fetched; and maths is handed only to KaTeX with
     trust:false. User copy, tool data, confirmations and receipts stay on
     their existing plain-text render paths. */
  function safeMarkdownHref(raw) {
    var href = String(raw || "").trim().replace(/^<|>$/g, "");
    if (!href || /[\u0000-\u001f\u007f]/.test(href)) return null;
    if (href.charAt(0) === "#" || href.charAt(0) === "/" || href.indexOf("./") === 0 || href.indexOf("../") === 0) return href;
    try {
      var parsed = new URL(href, window.location.href);
      return /^(https?:|mailto:)$/.test(parsed.protocol) ? parsed.href : null;
    } catch (e) { return null; }
  }

  function closingRun(text, start, marker) {
    var at = text.indexOf(marker, start + marker.length);
    while (at >= 0 && text.charAt(at - 1) === "\\") at = text.indexOf(marker, at + marker.length);
    return at;
  }

  function mathNode(expression, display, source) {
    var node = el("span", {
      class: "asst-math-source" + (display ? " asst-math-display" : ""),
      text: source
    });
    node._asstMath = String(expression || "");
    node._asstMathDisplay = !!display;
    return node;
  }

  function appendInline(parent, value, depth) {
    var text = String(value == null ? "" : value);
    var i = 0, plain = 0;
    depth = depth || 0;
    function flush(end) {
      if (end > plain) parent.appendChild(document.createTextNode(text.slice(plain, end)));
    }
    function addWrapped(tag, className, inner, markerLength, closeAt) {
      flush(i);
      var node = el(tag, className ? { class: className } : {});
      appendInline(node, inner, depth + 1);
      parent.appendChild(node);
      i = closeAt + markerLength;
      plain = i;
    }

    while (i < text.length) {
      var rest = text.slice(i);
      var match, close, ticks, expression, href, link;

      if (text.charAt(i) === "\\" && i + 1 < text.length && /[\\`*_[\]{}()#+.!|>$~\-]/.test(text.charAt(i + 1))) {
        flush(i);
        parent.appendChild(document.createTextNode(text.charAt(i + 1)));
        i += 2; plain = i; continue;
      }
      if (text.charAt(i) === "\n") {
        flush(i);
        parent.appendChild(el("br"));
        i += 1; plain = i; continue;
      }

      match = rest.match(/^(`+)/);
      if (match) {
        ticks = match[1]; close = closingRun(text, i, ticks);
        if (close >= 0) {
          flush(i);
          parent.appendChild(el("code", { class: "asst-inline-code", text: text.slice(i + ticks.length, close).replace(/^ | $/g, "") }));
          i = close + ticks.length; plain = i; continue;
        }
      }

      if (rest.indexOf("\\(") === 0) {
        close = text.indexOf("\\)", i + 2);
        if (close >= 0) {
          flush(i); expression = text.slice(i + 2, close);
          parent.appendChild(mathNode(expression, false, "\\(" + expression + "\\)"));
          i = close + 2; plain = i; continue;
        }
      }
      if (rest.indexOf("\\[") === 0) {
        close = text.indexOf("\\]", i + 2);
        if (close >= 0) {
          flush(i); expression = text.slice(i + 2, close);
          parent.appendChild(mathNode(expression, true, "\\[" + expression + "\\]"));
          i = close + 2; plain = i; continue;
        }
      }
      if (rest.indexOf("$$") === 0) {
        close = closingRun(text, i, "$$");
        if (close >= 0) {
          flush(i); expression = text.slice(i + 2, close);
          parent.appendChild(mathNode(expression, true, "$$" + expression + "$$"));
          i = close + 2; plain = i; continue;
        }
      }
      if (text.charAt(i) === "$" && text.charAt(i + 1) && !/\s/.test(text.charAt(i + 1))) {
        close = closingRun(text, i, "$");
        if (close > i + 1 && !/\s/.test(text.charAt(close - 1))) {
          flush(i); expression = text.slice(i + 1, close);
          parent.appendChild(mathNode(expression, false, "$" + expression + "$"));
          i = close + 1; plain = i; continue;
        }
      }

      match = rest.match(/^(!?)\[([^\]\n]+)\]\(([^)\n]+)\)/);
      if (match) {
        flush(i);
        href = safeMarkdownHref(match[3].replace(/\s+["'][^"']*["']\s*$/, ""));
        if (match[1]) {
          link = href ? el("a", { class: "asst-image-link", href: href, target: "_blank", rel: "noopener noreferrer" })
            : el("span", { class: "asst-image-link" });
          link.appendChild(document.createTextNode("Image: "));
          appendInline(link, match[2], depth + 1);
          parent.appendChild(link);
        } else if (href) {
          link = el("a", { href: href, target: href.charAt(0) === "#" || href.charAt(0) === "/" ? "_self" : "_blank",
            rel: "noopener noreferrer" });
          appendInline(link, match[2], depth + 1);
          parent.appendChild(link);
        } else {
          link = el("span", { class: "asst-unsafe-link" });
          appendInline(link, match[2], depth + 1);
          parent.appendChild(link);
        }
        i += match[0].length; plain = i; continue;
      }

      match = rest.match(/^<(https?:\/\/[^<>\s]+)>/i);
      if (match) {
        flush(i); href = safeMarkdownHref(match[1]);
        link = el("a", { href: href, target: "_blank", rel: "noopener noreferrer", text: match[1] });
        parent.appendChild(link);
        i += match[0].length; plain = i; continue;
      }

      if (depth < 10 && (rest.indexOf("**") === 0 || rest.indexOf("__") === 0)) {
        var strongMarker = rest.slice(0, 2);
        close = closingRun(text, i, strongMarker);
        if (close > i + 2) { addWrapped("strong", "", text.slice(i + 2, close), 2, close); continue; }
      }
      if (depth < 10 && rest.indexOf("~~") === 0) {
        close = closingRun(text, i, "~~");
        if (close > i + 2) { addWrapped("del", "", text.slice(i + 2, close), 2, close); continue; }
      }
      if (depth < 10 && (text.charAt(i) === "*" || text.charAt(i) === "_")) {
        var emMarker = text.charAt(i);
        close = closingRun(text, i, emMarker);
        if (close > i + 1) { addWrapped("em", "", text.slice(i + 1, close), 1, close); continue; }
      }
      i += 1;
    }
    flush(text.length);
  }

  function splitTableRow(line) {
    var value = String(line || "").trim();
    if (value.charAt(0) === "|") value = value.slice(1);
    if (value.charAt(value.length - 1) === "|") value = value.slice(0, -1);
    var out = [], cell = "", escaped = false, ticks = 0;
    for (var i = 0; i < value.length; i++) {
      var ch = value.charAt(i);
      if (escaped) { cell += ch; escaped = false; continue; }
      if (ch === "\\") { cell += ch; escaped = true; continue; }
      if (ch === "`") { ticks = ticks ? 0 : 1; cell += ch; continue; }
      if (ch === "|" && !ticks) { out.push(cell.trim()); cell = ""; continue; }
      cell += ch;
    }
    out.push(cell.trim());
    return out;
  }

  function tableDivider(line) {
    var cells = splitTableRow(line);
    return cells.length > 0 && cells.every(function (cell) { return /^:?-{3,}:?$/.test(cell); });
  }

  function startsMarkdownBlock(lines, at) {
    var line = lines[at] || "";
    if (!line.trim()) return true;
    if (/^\s{0,3}(```+|~~~+)/.test(line) || /^\s{0,3}#{1,6}\s+/.test(line) || /^\s{0,3}>/.test(line) ||
        /^\s{0,3}([-+*]|\d+[.)])\s+/.test(line) || /^\s{0,3}((\*\s*){3,}|(-\s*){3,}|(_\s*){3,})$/.test(line)) return true;
    return at + 1 < lines.length && line.indexOf("|") >= 0 && tableDivider(lines[at + 1]);
  }

  /* Small dependency-free syntax layer. It colours the distinctions people
     actually scan for (comments, strings, keywords, numbers and callable
     names) while keeping provider code inert text nodes. */
  var CODE_KEYWORDS = {
    js: "as async await break case catch class const continue debugger default delete do else export extends finally for from function get if import in instanceof let new of return set static super switch this throw try typeof var void while with yield",
    ts: "abstract any as async await boolean break case catch class const constructor continue declare default delete do else enum export extends finally for from function get if implements import in infer instanceof interface keyof let namespace never new number object of private protected public readonly return set static string super switch symbol this throw try type typeof undefined unknown var void while with yield",
    py: "and as assert async await break class continue def del elif else except False finally for from global if import in is lambda None nonlocal not or pass raise return True try while with yield",
    sql: "add all alter and any as asc between by case check column constraint create database default delete desc distinct drop else end exists foreign from full group having in index inner insert into is join key left like limit not null on or order outer primary references right row select set table then union unique update values view when where with",
    css: "important inherit initial unset revert auto none block inline flex grid relative absolute fixed sticky hidden visible",
    html: "doctype html head body main section article aside nav header footer div span p a img button input textarea select option table thead tbody tr th td script style link meta",
    java: "abstract assert boolean break byte case catch char class const continue default do double else enum extends final finally float for goto if implements import instanceof int interface long native new package private protected public return short static strictfp super switch synchronized this throw throws transient try void volatile while",
    c: "auto break case char const continue default do double else enum extern float for goto if inline int long register restrict return short signed sizeof static struct switch typedef union unsigned void volatile while"
  };
  function normalizedLanguage(language) {
    var lang = String(language || "").toLowerCase();
    if (/^(javascript|jsx|mjs|node)$/.test(lang)) return "js";
    if (/^(typescript|tsx)$/.test(lang)) return "ts";
    if (/^(python|py)$/.test(lang)) return "py";
    if (/^(postgres|postgresql|mysql|sqlite)$/.test(lang)) return "sql";
    if (/^(markup|xml|svg)$/.test(lang)) return "html";
    if (/^(scss|sass)$/.test(lang)) return "css";
    if (/^(c\+\+|cpp|cxx|c#|csharp)$/.test(lang)) return "c";
    return CODE_KEYWORDS[lang] ? lang : "js";
  }
  function highlightedCode(language, source) {
    var lang = normalizedLanguage(language);
    var keywords = {};
    String(CODE_KEYWORDS[lang] || "").split(/\s+/).forEach(function (word) { if (word) keywords[word.toLowerCase()] = true; });
    var comment = lang === "py" ? "#[^\\n]*" : lang === "sql" ? "--[^\\n]*" : lang === "html" ? "<!--[\\s\\S]*?-->" : "\\/\\*[\\s\\S]*?\\*\\/|\\/\\/[^\\n]*";
    var pattern = new RegExp("(?:\\\"(?:\\\\.|[^\\\"\\\\])*\\\"|'(?:\\\\.|[^'\\\\])*'|`(?:\\\\.|[^`\\\\])*`)|(?:" + comment + ")|(?:<\\/?[A-Za-z][^>]*>)|(?:\\b(?:0x[\\da-f]+|\\d+(?:\\.\\d+)?)\\b)|(?:\\b[A-Za-z_$][\\w$]*\\b)", "gim");
    var code = el("code", { class: language ? "language-" + String(language).replace(/[^a-z0-9_+-]/gi, "") : "" });
    var at = 0, match;
    while ((match = pattern.exec(source))) {
      if (match.index > at) code.appendChild(document.createTextNode(source.slice(at, match.index)));
      var token = match[0], lower = token.toLowerCase(), kind = "";
      if (/^(\/\*|\/\/|#|--|<!--)/.test(token)) kind = "comment";
      else if (/^[\"'`]/.test(token)) kind = "string";
      else if (/^<\/?/.test(token)) kind = "tag";
      else if (/^(?:0x[\da-f]+|\d)/i.test(token)) kind = "number";
      else if (keywords[lower]) kind = "keyword";
      else if (/^(true|false|null|none|undefined|nan)$/i.test(token)) kind = "constant";
      else if (/^\s*\(/.test(source.slice(pattern.lastIndex))) kind = "function";
      if (kind) code.appendChild(el("span", { class: "tok tok-" + kind, text: token }));
      else code.appendChild(document.createTextNode(token));
      at = pattern.lastIndex;
    }
    if (at < source.length) code.appendChild(document.createTextNode(source.slice(at)));
    return code;
  }

  function codeBlock(language, code) {
    var copy = el("button", { class: "asst-code-copy", type: "button", text: "Copy", "aria-label": "Copy code" });
    copy.addEventListener("click", function () {
      var done = function () { copy.textContent = "Copied"; setTimeout(function () { copy.textContent = "Copy"; }, 1400); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code).then(done).catch(function () { KOS.ui.toast("Couldn't copy code", true); });
      else KOS.ui.toast("Clipboard access is unavailable", true);
    });
    return el("figure", { class: "asst-code-block" }, [
      el("figcaption", {}, [el("span", { text: language || "Code" }), copy]),
      el("pre", {}, [highlightedCode(language, code)])
    ]);
  }

  function appendParagraph(parent, lines) {
    var p = el("p");
    lines.forEach(function (line, index) {
      var hardBreak = /\s{2}$/.test(line);
      appendInline(p, line.replace(/\s+$/, ""));
      if (index < lines.length - 1) p.appendChild(hardBreak ? el("br") : document.createTextNode(" "));
    });
    parent.appendChild(p);
  }

  function renderMarkdownInto(parent, source) {
    var lines = String(source == null ? "" : source).replace(/\r\n?/g, "\n").split("\n");
    var at = 0, expression;
    while (at < lines.length) {
      var line = lines[at], trimmed = line.trim(), match, end, cells, aligns, row, wrap, table, group;
      if (!trimmed) { at += 1; continue; }

      match = line.match(/^\s{0,3}(```+|~~~+)\s*([^\s]*)\s*$/);
      if (match) {
        var fence = match[1], code = [];
        at += 1;
        while (at < lines.length && !(new RegExp("^\\s{0,3}" + fence.charAt(0) + "{" + fence.length + ",}\\s*$").test(lines[at]))) {
          code.push(lines[at]); at += 1;
        }
        if (at < lines.length) at += 1;
        parent.appendChild(codeBlock(match[2], code.join("\n")));
        continue;
      }

      if (trimmed.indexOf("$$") === 0 || trimmed.indexOf("\\[") === 0) {
        var texOpen = trimmed.indexOf("$$") === 0 ? "$$" : "\\[";
        var texClose = texOpen === "$$" ? "$$" : "\\]";
        var afterOpen = trimmed.slice(texOpen.length), texLines = [];
        if (afterOpen.lastIndexOf(texClose) > 0 && !afterOpen.slice(afterOpen.lastIndexOf(texClose) + texClose.length).trim()) {
          end = afterOpen.lastIndexOf(texClose);
          parent.appendChild(mathNode(afterOpen.slice(0, end), true, texOpen + afterOpen.slice(0, end) + texClose));
          at += 1; continue;
        }
        if (!afterOpen) {
          var mathStart = at;
          at += 1;
          while (at < lines.length && lines[at].trim() !== texClose) { texLines.push(lines[at]); at += 1; }
          if (at < lines.length) {
            at += 1; expression = texLines.join("\n");
            parent.appendChild(mathNode(expression, true, texOpen + expression + texClose));
            continue;
          }
          /* An unclosed display delimiter is ordinary readable text. Do not
             consume the rest of the answer as one broken formula. */
          at = mathStart;
        }
      }

      match = line.match(/^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/);
      if (match) {
        var heading = el("h" + Math.min(6, match[1].length + 1));
        appendInline(heading, match[2]); parent.appendChild(heading); at += 1; continue;
      }
      if (/^\s{0,3}((\*\s*){3,}|(-\s*){3,}|(_\s*){3,})$/.test(line)) {
        parent.appendChild(el("hr")); at += 1; continue;
      }

      if (at + 1 < lines.length && line.indexOf("|") >= 0 && tableDivider(lines[at + 1])) {
        cells = splitTableRow(line);
        aligns = splitTableRow(lines[at + 1]).map(function (cell) {
          return cell.charAt(0) === ":" && cell.charAt(cell.length - 1) === ":" ? "center" : cell.charAt(cell.length - 1) === ":" ? "right" : "left";
        });
        table = el("table");
        row = el("tr");
        cells.forEach(function (cell, index) {
          var th = el("th", { scope: "col", style: "text-align:" + (aligns[index] || "left") });
          appendInline(th, cell); row.appendChild(th);
        });
        table.appendChild(el("thead", {}, [row]));
        var tbody = el("tbody"); at += 2;
        while (at < lines.length && lines[at].trim() && lines[at].indexOf("|") >= 0) {
          row = el("tr"); splitTableRow(lines[at]).forEach(function (cell, index) {
            var td = el("td", { style: "text-align:" + (aligns[index] || "left") });
            appendInline(td, cell); row.appendChild(td);
          });
          while (row.children.length < cells.length) row.appendChild(el("td"));
          tbody.appendChild(row); at += 1;
        }
        table.appendChild(tbody);
        wrap = el("div", { class: "asst-table-wrap", role: "region", tabindex: "0", "aria-label": "Scrollable response table" }, [table]);
        parent.appendChild(wrap); continue;
      }

      if (/^\s{0,3}>/.test(line)) {
        group = [];
        while (at < lines.length && /^\s{0,3}>/.test(lines[at])) {
          group.push(lines[at].replace(/^\s{0,3}>\s?/, "")); at += 1;
        }
        var quote = el("blockquote"); renderMarkdownInto(quote, group.join("\n")); parent.appendChild(quote); continue;
      }

      match = line.match(/^\s{0,3}([-+*]|\d+[.)])\s+(.+)$/);
      if (match) {
        var ordered = /^\d/.test(match[1]);
        var list = el(ordered ? "ol" : "ul");
        while (at < lines.length) {
          match = lines[at].match(/^\s{0,3}([-+*]|\d+[.)])\s+(.+)$/);
          if (!match || /^\d/.test(match[1]) !== ordered) break;
          var itemText = match[2], task = itemText.match(/^\[([ xX])\]\s+(.*)$/), li = el("li");
          if (task) {
            li.className = "asst-task-item";
            li.appendChild(el("input", { type: "checkbox", disabled: "", "aria-label": task[1].toLowerCase() === "x" ? "Completed" : "Not completed" }));
            if (task[1].toLowerCase() === "x") li.firstChild.checked = true;
            appendInline(li, task[2]);
          } else appendInline(li, itemText);
          list.appendChild(li); at += 1;
        }
        parent.appendChild(list); continue;
      }

      group = [line]; at += 1;
      while (at < lines.length && !startsMarkdownBlock(lines, at)) { group.push(lines[at]); at += 1; }
      appendParagraph(parent, group);
    }
  }

  function typesetAssistantMath(root) {
    function apply() {
      if (!window.katex) return false;
      Array.prototype.forEach.call(root.querySelectorAll(".asst-math-source"), function (node) {
        if (node._asstMathRendered) return;
        try {
          window.katex.render(node._asstMath, node, { displayMode: node._asstMathDisplay, throwOnError: false, trust: false, strict: "ignore" });
          node._asstMathRendered = true;
          node.classList.add("is-rendered");
        } catch (e) { /* malformed maths remains readable in its source form */ }
      });
      return true;
    }
    if (!apply() && document.readyState !== "complete") window.addEventListener("load", apply, { once: true });
  }

  function assistantRichText(source) {
    var bubble = el("div", { class: "asst-bubble asst-richtext" });
    renderMarkdownInto(bubble, source);
    typesetAssistantMath(bubble);
    return bubble;
  }

  function toolGroupNode(rows) {
    var failed = rows.filter(function (r) { return !r.ok; }).length;
    var title = rows.length === 1
      ? (failed ? "Could not finish · " : "Finished · ") + toolActivity(rows[0].tool)
      : failed ? rows.length + " steps · " + failed + " need attention" : rows.length + " steps completed";
    var details = el("div", { class: "asst-tool-detail" }, rows.map(function (r) {
      return el("div", { class: "asst-tool-step" }, [
        el("span", { class: "asst-tool-step-state", "aria-hidden": "true", text: r.ok ? "✓" : "!" }),
        el("span", { class: "asst-tool-step-copy", text: toolActivity(r.tool) }),
        el("code", { class: "asst-technical-id", text: r.tool }),
        r.text ? el("span", { class: "asst-event-detail", text: clampText(r.text, 160) }) : null
      ].filter(Boolean));
    }));
    return el("details", { class: "asst-row asst-tool" + (failed ? " failed" : "") }, [
      el("summary", {}, [
        el("span", { class: "asst-event-icon", "aria-hidden": "true", text: failed ? "!" : "✓" }),
        el("span", { class: "asst-event-title", text: title }),
        el("span", { class: "asst-tool-expand", text: "Details" })
      ]),
      details
    ]);
  }

  function threadRows() {
    var out = [];
    for (var rowIndex = 0; rowIndex < S.thread.length; rowIndex++) {
      var r = S.thread[rowIndex];
      if (r.kind === "tool") {
        var tools = [r];
        while (rowIndex + 1 < S.thread.length && S.thread[rowIndex + 1].kind === "tool") tools.push(S.thread[++rowIndex]);
        out.push(toolGroupNode(tools));
        continue;
      }
      if (r.kind === "receipt") {
        /* app-generated VERIFIED action receipt — the ground truth of a write */
        out.push(el("div", { class: "asst-row asst-receipt" }, [
          el("span", { class: "asst-receipt-badge", "aria-hidden": "true", text: "✓" }),
          el("div", { class: "asst-receipt-copy" }, [
            el("span", { class: "asst-receipt-label", text: "Verified action complete" }),
            el("strong", { text: toolDisplayName(r.tool) }),
            el("span", { class: "asst-receipt-sum", text: r.summary || "The change was recorded by KurenaiOS." }),
            r.target ? el("span", { class: "asst-event-detail", text: "Target · " + r.target }) : null,
            el("code", { class: "asst-technical-id", text: r.tool })
          ].filter(Boolean))
        ].filter(Boolean)));
        continue;
      }
      if (r.kind === "proposal") { out.push(proposalCard(r)); continue; }
      if (r.kind === "warning") { out.push(el("div", { class: "asst-row asst-warning", role: "note" }, [
        el("span", { class: "asst-alert-icon", "aria-hidden": "true", text: "!" }),
        el("div", {}, [el("strong", { text: "Heads up" }), el("span", { text: r.text })])
      ])); continue; }
      if (r.kind === "error") { out.push(el("div", { class: "asst-row asst-error", role: "alert" }, [
        el("span", { class: "asst-alert-icon", "aria-hidden": "true", text: "×" }),
        el("div", {}, [el("strong", { text: "Kurenai couldn't finish that" }), el("span", { text: r.text })])
      ])); continue; }
      /* Provider Markdown is parsed into an allowlisted DOM tree. Raw HTML
         remains text; only assistant prose takes this path. */
      if (r.kind === "assistant") {
        var rich = assistantRichText(r.visibleText == null ? r.text : r.visibleText);
        if (r.streaming) rich.appendChild(el("span", { class: "asst-stream-caret", "aria-hidden": "true" }));
        out.push(el("div", { class: "asst-row asst-assistant" + (r.streaming ? " is-streaming" : "") }, [
          el("img", { class: "asst-message-mark", src: EMBLEM, alt: "" }),
          el("div", { class: "asst-message-body" }, [
            el("span", { class: "asst-message-author", text: "Kurenai" }),
            rich
          ])
        ]));
        continue;
      }
      out.push(el("div", { class: "asst-row asst-user" }, [
        el("span", { class: "sr-only", text: "You said" }),
        el("div", { class: "asst-bubble", text: r.text })
      ]));
    }
    return out;
  }

  function buildThreadArea(compact) {
    var scroller = el("div", { class: "asst-thread", tabindex: "0", "aria-label": "Conversation" });
    var composer = buildComposer(compact);
    function emptyState() {
      var prompts = compact ? [
        "What should I revise next?",
        "Show today's study plan"
      ] : [
        "What should I revise next?",
        "Summarise my study progress",
        "Help me plan this week"
      ];
      return el("div", { class: "asst-empty" }, [
        el("img", { class: "asst-empty-mark", src: EMBLEM, alt: "" }),
        el("span", { class: "asst-empty-kicker", text: "Whispering Bloom" }),
        el("h2", { text: compact ? "What are we working on?" : "Begin with the part that feels tangled." }),
        el("p", { text: "Kurenai can read your KurenaiOS context and help you act on it. Any consequential change pauses for your explicit approval." }),
        el("div", { class: "asst-starters", "aria-label": "Suggested prompts" }, prompts.map(function (prompt) {
          return el("button", { class: "asst-starter", type: "button", text: prompt,
            onclick: function () { submit(prompt, { category: "complex" }); } });
        }))
      ]);
    }
    function render() {
      var atBottom = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 60;
      scroller.innerHTML = "";
      if (!S.thread.length) scroller.appendChild(emptyState());
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
    drawerScrim = el("button", { class: "asst-drawer-scrim", type: "button", tabindex: "-1",
      "aria-label": "Close Kurenai assistant", onclick: closeDrawer });
    drawerEl = el("aside", { class: "asst-drawer", role: "dialog", "aria-label": "Kurenai assistant", "aria-modal": "true" }, [
      el("div", { class: "asst-drawer-head" }, [
        el("img", { class: "asst-emblem", src: EMBLEM, alt: "" }),
        el("div", { class: "asst-drawer-title" }, [
          el("span", { class: "asst-drawer-kicker", text: "Whispering Bloom" }),
          el("b", { text: "Kurenai Assistant" })
        ]),
        el("button", { class: "mini-btn", type: "button", text: "⤢", "aria-label": "Open the full assistant page",
          title: "Open the full assistant page",
          onclick: function () { closeDrawer(); KOS.show("assistant"); } }),
        el("button", { class: "mini-btn", type: "button", text: "✕", "aria-label": "Close the assistant drawer",
          onclick: function () { closeDrawer(); } })
      ]),
      el("div", { class: "asst-drawer-presence" }, [
        mascotNode("small"),
        el("div", { class: "asst-drawer-context" }, [
          el("span", { text: S.conversationTitle || "Current conversation" }),
          el("small", { text: "Consequential changes always pause for review." })
        ])
      ]),
      buildThreadArea(true)
    ]);
    drawerEl.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { e.stopPropagation(); closeDrawer(); }
      if (e.key === "Tab") {
        var focusable = Array.prototype.slice.call(drawerEl.querySelectorAll("button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [href], [tabindex]:not([tabindex='-1'])"));
        if (!focusable.length) { e.preventDefault(); return; }
        var first = focusable[0], last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    document.body.classList.add("asst-drawer-open");
    document.body.appendChild(drawerScrim);
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
    if (drawerScrim) { drawerScrim.remove(); drawerScrim = null; }
    document.body.classList.remove("asst-drawer-open");
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

  var TAB_ICONS = { chat: "✦", history: "◷", settings: "⌁", memory: "◇", permissions: "⌾", activity: "↻" };

  function createProject(name) {
    name = clampText(String(name || "").trim(), 48);
    if (!name) return null;
    var ws = workspaceCfg();
    var project = { id: "p-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 5), name: name, createdAt: Date.now() };
    ws.projects.push(project);
    ws.projectFilter = project.id;
    assignProject(project.id);
    saveWorkspace();
    return project;
  }

  function removeProject(project) {
    KOS.ui.confirm({ title: "Delete this project?", danger: true, confirm: "Delete project",
      body: "“" + project.name + "” is removed. Its conversations stay in History." }, function () {
      var ws = workspaceCfg();
      ws.projects = ws.projects.filter(function (p) { return p.id !== project.id; });
      Object.keys(ws.conversationProjects).forEach(function (key) {
        if (ws.conversationProjects[key] === project.id) delete ws.conversationProjects[key];
      });
      if (ws.projectFilter === project.id) ws.projectFilter = "";
      saveWorkspace();
      var view = (KOS.store.state.ui || {}).view;
      if (view === "assistant") KOS.show("assistant", { tab: "chat" });
    });
  }

  function projectPicker() {
    var ws = workspaceCfg();
    var selected = projectFor();
    var select = el("select", { class: "asst-project-picker", "aria-label": "Conversation project", title: "Organise this conversation in a project" }, [
      el("option", { value: "", text: "No project" })
    ].concat(ws.projects.map(function (p) {
      var option = el("option", { value: p.id, text: p.name });
      if (p.id === selected) option.selected = true;
      return option;
    })));
    select.addEventListener("change", function () { assignProject(select.value); notify(); });
    return select;
  }

  function assistantTabs(active) {
    var ws = workspaceCfg();
    var nav = el("aside", { class: "asst-tabs" + (ws.sidebarCollapsed ? " is-collapsed" : ""),
      "aria-label": "Assistant navigation and conversations" });
    var collapse = el("button", { class: "mini-btn asst-side-collapse", type: "button",
      text: ws.sidebarCollapsed ? "›" : "‹", "aria-label": ws.sidebarCollapsed ? "Expand assistant sidebar" : "Collapse assistant sidebar",
      title: ws.sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar", onclick: function () {
        ws.sidebarCollapsed = !ws.sidebarCollapsed; saveWorkspace();
        KOS.show("assistant", { tab: active });
      } });
    nav.appendChild(el("div", { class: "asst-side-brand" }, [
      el("img", { src: EMBLEM, alt: "" }),
      el("div", { class: "asst-side-brand-copy" }, [el("b", { text: "Kurenai" }), el("span", { text: "Whispering Bloom" })]),
      collapse
    ]));
    nav.appendChild(el("button", { class: "asst-new-chat", type: "button", "aria-label": "New conversation",
      onclick: function () { newConversation(); KOS.show("assistant", { tab: "chat" }); } }, [
      el("span", { "aria-hidden": "true", text: "+" }), el("b", { text: "New conversation" })
    ]));
    var tablist = el("div", { class: "asst-tablist", role: "tablist", "aria-label": "Kurenai Assistant pages" });
    [
      ["Conversation", PAGE_TABS.slice(0, 2)],
      ["Control room", PAGE_TABS.slice(2)]
    ].forEach(function (group) {
      var items = group[1].map(function (tab) {
        var selected = tab[3] === active;
        return el("button", { class: "study-tab" + (selected ? " active" : ""), type: "button",
          role: "tab", "aria-selected": selected ? "true" : "false", "aria-controls": "asst-page-panel",
          tabindex: selected ? "0" : "-1", "aria-label": tab[0],
          onclick: function () { KOS.show(tab[1], tab[2]); } }, [
          el("span", { class: "asst-tab-icon", "aria-hidden": "true", text: TAB_ICONS[tab[3]] || "·" }),
          el("span", { class: "asst-tab-text", text: tab[0] })
        ]);
      });
      tablist.appendChild(el("div", { class: "asst-tab-group", role: "presentation" }, [
        el("span", { class: "asst-tab-group-label", role: "presentation", text: group[0] })
      ].concat(items)));
    });
    nav.appendChild(tablist);

    var projectList = el("div", { class: "asst-project-list" });
    var addProject = el("button", { class: "mini-btn asst-side-add", type: "button", text: "+", "aria-label": "Create project", title: "Create project" });
    addProject.addEventListener("click", function () {
      if (projectList.querySelector(".asst-project-new")) return;
      var input = el("input", { class: "asst-project-new", type: "text", maxlength: "48", placeholder: "Project name", "aria-label": "Project name" });
      function commit() {
        if (!createProject(input.value)) return;
        KOS.show("assistant", { tab: active });
      }
      input.addEventListener("keydown", function (e) { if (e.key === "Enter") commit(); else if (e.key === "Escape") input.remove(); });
      input.addEventListener("blur", function () { if (!input.value.trim()) input.remove(); });
      projectList.insertBefore(input, projectList.firstChild); input.focus();
    });
    nav.appendChild(el("div", { class: "asst-side-section asst-projects" }, [
      el("div", { class: "asst-side-label" }, [el("span", { text: "Projects" }), addProject]), projectList
    ]));
    var projectCounts = {};
    Object.keys(ws.conversationProjects).forEach(function (key) {
      var id = ws.conversationProjects[key]; projectCounts[id] = (projectCounts[id] || 0) + 1;
    });
    ws.projects.forEach(function (project) {
      var current = ws.projectFilter === project.id;
      projectList.appendChild(el("div", { class: "asst-project-row" + (current ? " active" : "") }, [
        el("button", { class: "asst-project-open", type: "button", "aria-pressed": current ? "true" : "false",
          title: project.name, onclick: function () {
            ws.projectFilter = current ? "" : project.id; saveWorkspace(); KOS.show("assistant", { tab: active });
          } }, [el("span", { "aria-hidden": "true", text: "◇" }), el("span", { text: project.name }),
          el("small", { text: String(projectCounts[project.id] || 0) })]),
        el("button", { class: "asst-project-delete", type: "button", text: "×", "aria-label": "Delete project " + project.name,
          onclick: function () { removeProject(project); } })
      ]));
    });
    if (!ws.projects.length) projectList.appendChild(el("p", { class: "asst-side-empty", text: "Group chats by subject or goal." }));

    var recents = el("div", { class: "asst-recent-list" }, [el("p", { class: "asst-side-empty", text: canPersist() ? "Loading…" : "Sign in to keep recent chats." })]);
    nav.appendChild(el("div", { class: "asst-side-section asst-recents" }, [
      el("div", { class: "asst-side-label" }, [el("span", { text: ws.projectFilter ? "Project chats" : "Recent" })]), recents
    ]));
    if (canPersist()) KOS.ai.convo.list(function (err, rows) {
      if (!recents.isConnected) return;
      recents.innerHTML = "";
      if (err) { recents.appendChild(el("p", { class: "asst-side-empty", text: "History unavailable." })); return; }
      if (ws.projectFilter) rows = rows.filter(function (c) { return projectFor(c.id) === ws.projectFilter; });
      rows.sort(function (a, b) {
        var ap = ws.pins.indexOf(a.id) >= 0, bp = ws.pins.indexOf(b.id) >= 0;
        return ap === bp ? 0 : ap ? -1 : 1;
      });
      rows.slice(0, 8).forEach(function (c) {
        var pinned = ws.pins.indexOf(c.id) >= 0;
        recents.appendChild(el("div", { class: "asst-recent-row" + (c.id === S.conversationId ? " current" : "") }, [
          el("button", { class: "asst-recent-open", type: "button", title: c.title,
            onclick: function () { openConversation(c.id, function (e) { if (!e) KOS.show("assistant", { tab: "chat" }); }); } }, [
            el("span", { class: "asst-recent-title", text: c.title }),
            projectFor(c.id) ? el("span", { class: "asst-recent-project", text: (ws.projects.find(function (p) { return p.id === projectFor(c.id); }) || {}).name || "Project" }) : null
          ].filter(Boolean)),
          el("button", { class: "asst-pin" + (pinned ? " is-pinned" : ""), type: "button", text: "⌖",
            "aria-label": (pinned ? "Unpin " : "Pin ") + c.title, "aria-pressed": pinned ? "true" : "false",
            onclick: function () { togglePin(c.id); KOS.show("assistant", { tab: active }); } })
        ]));
      });
      if (!rows.length) recents.appendChild(el("p", { class: "asst-side-empty", text: ws.projectFilter ? "No chats in this project yet." : "No conversations yet." }));
    });
    else {
      recents.innerHTML = "";
      var localPinned = ws.pins.indexOf(S.localId) >= 0;
      recents.appendChild(el("div", { class: "asst-recent-row current" }, [
        el("button", { class: "asst-recent-open", type: "button", title: S.conversationTitle || "Current conversation",
          onclick: function () { KOS.show("assistant", { tab: "chat" }); } }, [
          el("span", { class: "asst-recent-title", text: S.conversationTitle || "Current conversation" }),
          projectFor(S.localId) ? el("span", { class: "asst-recent-project", text: "On this device" }) : null
        ].filter(Boolean)),
        el("button", { class: "asst-pin" + (localPinned ? " is-pinned" : ""), type: "button", text: "⌖",
          "aria-label": localPinned ? "Unpin current conversation" : "Pin current conversation", "aria-pressed": localPinned ? "true" : "false",
          onclick: function () { togglePin(S.localId); KOS.show("assistant", { tab: active }); } })
      ]));
      recents.appendChild(el("p", { class: "asst-side-empty", text: "Sign in to keep more chats across sessions." }));
    }

    nav.addEventListener("keydown", function (e) {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End"].indexOf(e.key) < 0) return;
      var tabs = Array.prototype.slice.call(nav.querySelectorAll(".study-tab"));
      var current = tabs.indexOf(document.activeElement);
      if (current < 0) return;
      e.preventDefault();
      var next = e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1
        : (e.key === "ArrowUp" || e.key === "ArrowLeft") ? (current - 1 + tabs.length) % tabs.length
        : (current + 1) % tabs.length;
      tabs[next].focus();
    });
    return nav;
  }

  function sectionIntro(body, kicker, title, copy) {
    body.appendChild(el("header", { class: "asst-section-intro" }, [
      el("span", { class: "asst-section-kicker", text: kicker }),
      el("h2", { text: title }),
      el("p", { text: copy })
    ]));
  }

  function pageChat(body) {
    var ws = workspaceCfg();
    var currentPinned = ws.pins.indexOf(conversationKey()) >= 0;
    var conversation = el("div", { class: "asst-chat-main" }, [
      el("div", { class: "asst-chat-toolbar" }, [
        el("div", {}, [
          el("span", { class: "asst-section-kicker", text: "Conversation" }),
          el("h2", { text: S.conversationTitle || "A fresh thread" })
        ]),
        el("div", { class: "asst-chat-actions" }, [
          projectPicker(),
          el("button", { class: "mini-btn asst-current-pin" + (currentPinned ? " is-pinned" : ""), type: "button", text: "⌖",
            "aria-label": currentPinned ? "Unpin current conversation" : "Pin current conversation", title: currentPinned ? "Unpin conversation" : "Pin conversation",
            "aria-pressed": currentPinned ? "true" : "false",
            onclick: function () { togglePin(); KOS.show("assistant", { tab: "chat" }); } }),
          el("button", { class: "mini-btn asst-toolbar-new", type: "button", text: "+", "aria-label": "New conversation", title: "New conversation", onclick: function () {
            newConversation(); KOS.show("assistant", { tab: "chat" });
          } })
        ])
      ]),
      buildThreadArea(false)
    ]);
    var presence = el("aside", { class: "asst-presence", "aria-label": "Kurenai status and safety" }, [
      el("div", { class: "asst-presence-wash", "aria-hidden": "true" }),
      el("div", { class: "asst-presence-copy" }, [
        el("span", { class: "asst-presence-kicker", text: "Whispering Bloom" }),
        el("h3", { text: "Kurenai is with you" }),
        el("p", { text: "Hover or tap the bloom to say hello." })
      ]),
      mascotNode("large"),
      el("div", { class: "asst-presence-actions" }, [
        el("button", { class: "mini-btn", type: "button", text: ws.voiceEnabled ? "Voice on" : "Voice off",
          "aria-pressed": ws.voiceEnabled ? "true" : "false", onclick: function () {
            ws.voiceEnabled = !ws.voiceEnabled; saveWorkspace();
            if (ws.voiceEnabled) voiceCue(S.visual, true);
            KOS.show("assistant", { tab: "chat" });
          } })
      ]),
      el("p", { class: "asst-presence-foot", text: canPersist() ? "Cloud history is available for this session." : "Signed out · this conversation stays on this device for now." })
    ]);
    body.appendChild(el("div", { class: "asst-chat-layout" }, [conversation, presence]));
  }

  function pageHistory(body) {
    sectionIntro(body, "Conversation archive", "History", "Return to an earlier thread without losing the shared drawer and page state.");
    var avail = canPersist();
    if (!avail) {
      body.appendChild(el("div", { class: "asst-empty-panel" }, [
        el("h3", { text: "History is available after cloud sign-in" }),
        el("p", { text: "The current conversation still works and keeps its signed-out continuity; it simply is not added to the cloud archive." }),
        el("button", { class: "btn", type: "button", text: "Open Account & Cloud Sync", onclick: function () { KOS.show("mediasync"); } })
      ]));
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
                      var ws = workspaceCfg();
                      delete ws.conversationProjects[c.id];
                      ws.pins = ws.pins.filter(function (id) { return id !== c.id; });
                      saveWorkspace();
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
    sectionIntro(body, "Model control", "Routing & usage", "Choose the model for each kind of request. The safety tier and confirmation path do not change with the provider.");
    body.appendChild(el("div", { class: "asst-info-strip" }, [
      el("span", { "aria-hidden": "true", text: "◇" }),
      el("p", { text: "Online providers use your cloud account and daily cap. Ollama stays local. API keys live only on the server and are never rendered here." })
    ]));

    var ws = workspaceCfg();
    var voiceToggle = el("input", { type: "checkbox", "aria-label": "Enable short Kurenai voice cues" });
    voiceToggle.checked = ws.voiceEnabled;
    var voiceSelect = el("select", { class: "todo-in", "aria-label": "Kurenai voice" });
    function loadVoices() {
      var voices = window.speechSynthesis && window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices() : [];
      voiceSelect.innerHTML = "";
      voiceSelect.appendChild(el("option", { value: "", text: voices.length ? "Automatic soft voice" : "System voice" }));
      voices.forEach(function (voice) {
        var option = el("option", { value: voice.name, text: voice.name + (voice.lang ? " · " + voice.lang : "") });
        if (voice.name === ws.voiceName) option.selected = true;
        voiceSelect.appendChild(option);
      });
    }
    loadVoices();
    if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = loadVoices;
    voiceToggle.addEventListener("change", function () { ws.voiceEnabled = voiceToggle.checked; saveWorkspace(); if (ws.voiceEnabled) voiceCue("idle", true); });
    voiceSelect.addEventListener("change", function () { ws.voiceName = voiceSelect.value; saveWorkspace(); if (ws.voiceEnabled) voiceCue("idle", true); });
    body.appendChild(el("div", { class: "asst-voice-row" }, [
      el("div", { class: "asst-route-label" }, [
        el("b", { text: "Character voice cues" }),
        el("span", { class: "asst-technical-id", text: "On-device speech · no answer narration" })
      ]),
      el("label", { class: "asst-voice-toggle" }, [voiceToggle, el("span", { text: "Speak short state lines" })]),
      el("label", { class: "asst-field" }, [el("span", { text: "Voice" }), voiceSelect]),
      el("button", { class: "mini-btn", type: "button", text: "Preview", onclick: function () { voiceCue("working", true); } })
    ]));

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
        el("div", { class: "asst-route-label" }, [
          el("b", { text: cat[1] }),
          el("span", { class: "asst-technical-id", text: cat[0] + " requests" })
        ]),
        el("label", { class: "asst-field" }, [el("span", { text: "Primary provider" }), provSel]),
        el("label", { class: "asst-field" }, [el("span", { text: "Model" }), modelIn]),
        el("label", { class: "asst-field" }, [el("span", { text: "Fallback" }), fbSel])
      ]));
    });

    var ollamaIn = el("input", { type: "text", class: "todo-in", value: cfg.ollama.url, "aria-label": "Ollama endpoint" });
    /* same reasoning as the model input — persist on input so a typed
       endpoint survives tab navigation */
    ollamaIn.addEventListener("input", function () { KOS.ai.setOllamaUrl(ollamaIn.value); });
    ollamaIn.addEventListener("change", function () { KOS.ai.setOllamaUrl(ollamaIn.value); });
    body.appendChild(el("div", { class: "asst-route-row" }, [
      el("div", { class: "asst-route-label" }, [el("b", { text: "Ollama endpoint" }), el("span", { class: "asst-technical-id", text: "Local connection" })]),
      el("label", { class: "asst-field asst-field-wide" }, [el("span", { text: "Endpoint URL" }), ollamaIn]),
      el("span", { class: "asst-route-note", text: "Start Ollama with OLLAMA_ORIGINS allowing this app's origin." })
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
    sectionIntro(body, "User-controlled context", "Memory", "The complete list of notes Kurenai may carry between conversations. Nothing is inferred silently.");
    body.appendChild(el("div", { class: "asst-info-strip" }, [
      el("span", { "aria-hidden": "true", text: "✓" }),
      el("p", { text: "Every memory was explicitly requested or approved by you. Secrets and keys are always refused." })
    ]));
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
    sectionIntro(body, "Autonomy controls", "Permissions", "Decide what Kurenai may read or do automatically. Consequential actions always keep their fixed approval floor.");
    body.appendChild(el("div", { class: "asst-perm-legend" }, [
      el("span", { class: "asst-tier asst-tier-read", text: "Read only" }),
      el("span", { class: "asst-tier asst-tier-reversible", text: "Undoable action" }),
      el("span", { class: "asst-tier asst-tier-consequential", text: "Needs approval" })
    ]));
    var cats = {};
    KOS.ai.tools.list().forEach(function (t) { (cats[t.category] = cats[t.category] || []).push(t); });
    var groups = el("div", { class: "asst-perm-groups" });
    Object.keys(cats).sort().forEach(function (cat, catIndex) {
      var rows = el("div", { class: "asst-perm-rows" });
      cats[cat].forEach(function (t) {
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
        rows.appendChild(el("div", { class: "asst-perm-row" }, [
          el("div", { class: "asst-perm-copy" }, [
            el("strong", { text: toolDisplayName(t.name) }),
            el("span", { text: t.desc || "KurenaiOS assistant action" }),
            el("code", { class: "asst-technical-id", text: t.name })
          ]),
          el("span", { class: "asst-tier asst-tier-" + t.tier, text: tierLabel(t.tier) }),
          sel
        ]));
      });
      var details = el("details", { class: "asst-perm-group" }, [
        el("summary", {}, [
          el("span", { text: titleWords(cat) }),
          el("span", { class: "asst-perm-count", text: cats[cat].length + " tools" })
        ]),
        rows
      ]);
      if (catIndex === 0) details.open = true;
      groups.appendChild(details);
    });
    body.appendChild(groups);
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
    sectionIntro(body, "Immutable record", "Activity", "Every proposed or executed action and its real outcome. This view is deliberately read-only so the record stays honest.");
    var list = el("div", { class: "asst-audit" });
    body.appendChild(list);
    loadAudit(function (err, rows, source) {
      list.innerHTML = "";
      if (err) { list.appendChild(el("p", { class: "sub is-error", text: "Couldn't load the action history: " + err.message })); return; }
      if (source === "queued") list.appendChild(el("p", { class: "sub", text: "Signed out — showing actions queued on this device; they upload on sign-in." }));
      if (!rows.length) { list.appendChild(el("p", { class: "sub", text: "No assistant actions yet." })); return; }
      rows.forEach(function (r) {
        list.appendChild(el("div", { class: "asst-audit-row st-" + (r.status || "proposed") }, [
          el("span", { class: "asst-audit-dot", "aria-hidden": "true" }),
          el("div", { class: "asst-audit-copy" }, [
            el("div", { class: "asst-audit-head" }, [
              el("strong", { text: toolDisplayName(r.tool) }),
              el("span", { class: "asst-audit-status", text: r.status || "proposed" })
            ]),
            el("div", { class: "asst-audit-meta" }, [
              el("span", { class: "asst-tier asst-tier-" + (r.tier || "read"), text: tierLabel(r.tier || "read") }),
              r.target ? el("span", { text: "Target · " + r.target }) : null,
              el("span", { text: r.created_at ? new Date(r.created_at).toLocaleString() : "" })
            ].filter(Boolean)),
            r.result_summary ? el("span", { class: "asst-audit-sum", text: clampText(r.result_summary, 120) }) : null,
            r.error_summary ? el("span", { class: "is-error", text: clampText(r.error_summary, 120) }) : null,
            el("code", { class: "asst-technical-id", text: r.tool })
          ].filter(Boolean))
        ].filter(Boolean)));
      });
    });
  }

  KOS.views.assistant = function (main, arg) {
    document.getElementById("tree").classList.add("hidden");
    document.getElementById("cols").classList.add("no-tree");
    var tab = (arg && arg.tab) || "chat";
    if (!PAGE_TABS.some(function (t) { return t[3] === tab; })) tab = "chat";
    var heading = el("h1", { id: "asst-page-title", tabindex: "-1", text: "Kurenai Assistant" });
    main.appendChild(el("div", { class: "dash-head asst-head" }, [
      el("div", { class: "asst-head-identity" }, [
        el("img", { class: "asst-head-emblem", src: EMBLEM, alt: "" }),
        el("div", { class: "dh-txt" }, [
          el("span", { class: "dh-kicker", text: "Whispering Bloom" }),
          heading,
          el("div", { class: "dh-sub", text: "Your context-aware companion for study, planning and collection work." })
        ])
      ])
    ]));
    var tabs = assistantTabs(tab);
    var body = el("section", { id: "asst-page-panel", class: "asst-page asst-page-" + tab,
      role: "tabpanel", "aria-label": "Assistant " + tab });
    main.appendChild(el("div", { class: "asst-shell" + (workspaceCfg().sidebarCollapsed ? " is-side-collapsed" : "") }, [tabs, body]));
    if (tab === "chat") pageChat(body);
    else if (tab === "history") pageHistory(body);
    else if (tab === "settings") pageSettings(body);
    else if (tab === "memory") pageMemory(body);
    else if (tab === "permissions") pagePermissions(body);
    else if (tab === "activity") pageActivity(body);
    window.requestAnimationFrame(function () { if (heading.isConnected) heading.focus({ preventScroll: true }); });
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
    toolDisplayName: toolDisplayName,
    toolActivity: toolActivity,
    renderMarkdown: assistantRichText,
    loadAudit: loadAudit,
    state: function () { return S; },
    MASCOT_STATES: MASCOT_STATES,
    _config: function (o) { o = o || {}; if ("auditReader" in o) _auditReader = o.auditReader; }
  };
})();
