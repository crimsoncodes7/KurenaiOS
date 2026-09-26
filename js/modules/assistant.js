/* Kurenai OS — modules/assistant.js (Category 6 Phase E)
   The three Kurenai Assistant surfaces — global drawer, contextual
   actions, dedicated page — over ONE shared controller. The UI here is
   presentation only: every request goes through KOS.ai.orchestrator (one
   submission path), confirmations use the canonical Phase C object,
   conversations/memory ride KOS.ai.convo / KOS.ai.memory, and no code in
   this file executes a tool, decides a tier, or writes memory directly.

   Character: exactly six full-body states (idle/thinking/working/success/
   error/confirmation), driven EXPLICITLY by orchestrator lifecycle events
   and request ownership — never inferred from message text. Each state has
   a distinct static production PNG and real textual status. Image failure
   falls back to a glyph + the text. The state→asset map mirrors
   assets/assistant/manifest.json (hardcoded — file:// can't fetch JSON;
   keep the two in step).

   The drawer and the dedicated page render the SAME thread/state, so a
   conversation moves between them without losing anything or duplicating
   provider requests (one busy flag, one draft, one pending confirmation).

   Voice cues are deliberately short, optional local ElevenLabs renders.
   One reusable audio player enforces lifecycle priority and interaction
   cooldowns. It never narrates provider answers and makes no runtime TTS
   request. */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var el = KOS.ui.el;

  /* ================= mascot state map (mirrors manifest.json) ========== */
  var ASSET_BASE = "assets/assistant/";
  var MASCOT_STATES = {
    idle:         { image: "mascot/states/idle.png", label: "Ready when you are", audio: "voice/state/idle.mp3" },
    thinking:     { image: "mascot/states/thinking.png", label: "Thinking…", audio: "voice/state/thinking.mp3" },
    working:      { image: "mascot/states/working.png", label: "Working with your KurenaiOS data…", audio: "voice/state/working.mp3" },
    success:      { image: "mascot/states/success.png", label: "Complete and verified", audio: "voice/state/success.mp3", autoReturnMs: 2200 },
    error:        { image: "mascot/states/error.png", label: "Something needs attention", audio: "voice/state/error.mp3", autoReturnMs: 4000 },
    confirmation: { image: "mascot/states/confirmation.png", label: "Waiting for your approval", audio: "voice/state/confirmation.mp3" }
  };
  var CHARACTER_REACTIONS = {
    hover:  { cooldownMs: 30000, files: ["hover-01.mp3", "hover-02.mp3", "hover-03.mp3", "hover-04.mp3"] },
    head:   { cooldownMs: 8000, files: ["head-01.mp3", "head-02.mp3", "head-03.mp3", "head-04.mp3"] },
    flower: { cooldownMs: 8000, files: ["flower-01.mp3", "flower-02.mp3", "flower-03.mp3", "flower-04.mp3"] },
    tablet: { cooldownMs: 8000, files: ["tablet-01.mp3", "tablet-02.mp3", "tablet-03.mp3", "tablet-04.mp3"] }
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
     state path. Conversation contents remain owned by KOS.ai.convo.

     Reading never writes (UI rebuild, smoke56): a page that is merely
     opened must not create or migrate state. workspaceCfg() returns the
     stored record when it is already in shape, else a normalised DETACHED
     copy; every mutation asks for workspaceCfg(true), which creates and
     migrates the stored record first. */
  function normaliseWorkspace(ws) {
    if (!Array.isArray(ws.pins)) ws.pins = [];
    if (!Array.isArray(ws.projects)) ws.projects = [];
    if (!ws.conversationProjects || typeof ws.conversationProjects !== "object") ws.conversationProjects = {};
    if (typeof ws.sidebarCollapsed !== "boolean") ws.sidebarCollapsed = false;
    if (!ws.characterAudio || typeof ws.characterAudio !== "object") {
      ws.characterAudio = {
        enabled: typeof ws.voiceEnabled === "boolean" ? ws.voiceEnabled : false,
        volume: 0.72
      };
    }
    if (typeof ws.characterAudio.enabled !== "boolean") ws.characterAudio.enabled = false;
    if (!Number.isFinite(Number(ws.characterAudio.volume))) ws.characterAudio.volume = 0.72;
    ws.characterAudio.volume = Math.max(0, Math.min(1, Number(ws.characterAudio.volume)));
    /* Build 6.1 migration: the local clip player has one authored voice,
       so browser voice names and the legacy speech toggle are retired. */
    delete ws.voiceEnabled;
    delete ws.voiceName;
    return ws;
  }
  function workspaceInShape(ws) {
    return !!ws && Array.isArray(ws.pins) && Array.isArray(ws.projects) &&
      !!ws.conversationProjects && typeof ws.conversationProjects === "object" &&
      typeof ws.sidebarCollapsed === "boolean" && !!ws.characterAudio &&
      typeof ws.characterAudio.enabled === "boolean" && Number.isFinite(Number(ws.characterAudio.volume)) &&
      !("voiceEnabled" in ws) && !("voiceName" in ws);
  }
  function workspaceCfg(write) {
    var root = KOS.store.state.assistant, ws = root && root.workspace;
    if (!write) return workspaceInShape(ws) ? ws : normaliseWorkspace(JSON.parse(JSON.stringify(ws || {})));
    root = KOS.store.state.assistant || (KOS.store.state.assistant = {});
    return normaliseWorkspace(root.workspace || (root.workspace = {}));
  }
  function saveWorkspace() { KOS.store.save(); }
  function conversationKey() { return S.conversationId || S.localId; }
  function projectFor(key) { return workspaceCfg().conversationProjects[key || conversationKey()] || ""; }
  function assignProject(projectId, key) {
    var ws = workspaceCfg(true);
    key = key || conversationKey();
    if (!key) return;
    if (projectId) ws.conversationProjects[key] = projectId;
    else delete ws.conversationProjects[key];
    saveWorkspace();
  }
  function migrateWorkspaceKey(from, to) {
    if (!from || !to || from === to) return;
    var ws = workspaceCfg(true);
    if (ws.conversationProjects[from]) {
      ws.conversationProjects[to] = ws.conversationProjects[from];
      delete ws.conversationProjects[from];
    }
    var at = ws.pins.indexOf(from);
    if (at >= 0) ws.pins.splice(at, 1, to);
    saveWorkspace();
  }
  function togglePin(key) {
    var ws = workspaceCfg(true);
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
  var mascots = [];       // live character nodes
  var lifecycleTimer = null, lifecycleEpoch = 0, lifecycleOwner = null, lifecycleSerial = 0;
  var audioEl = null, audioPriority = 0, audioSource = "", audioSettleTimer = null;
  var hoverTimer = null, tapCooldownAt = -Infinity, lastHoverAt = -Infinity;
  var reactionIndexes = {}, lastLifecycleAudioAt = {};
  var rendererFactory = null, rendererEpoch = 0;
  var nowFn = function () { return Date.now(); }, audioFactory = null;
  var preloadedStates = {};
  var _auditReader = null; // test seam
  var announcerEl = null;
  var streamTimer = null, streamRow = null, streamDone = null;

  function announcer() {
    if (announcerEl && announcerEl.isConnected) return announcerEl;
    announcerEl = el("div", { class: "sr-only", "data-ui": "asst.live", "aria-live": "polite", "aria-atomic": "true" });
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

  function characterAudioCfg() { return workspaceCfg().characterAudio; }
  function player() {
    if (audioEl) return audioEl;
    try {
      audioEl = audioFactory ? audioFactory() : (typeof window.Audio === "function" ? new window.Audio() : document.createElement("audio"));
      audioEl.preload = "none";
      audioEl.addEventListener && audioEl.addEventListener("ended", function () { audioPriority = 0; audioSource = ""; });
      audioEl.addEventListener && audioEl.addEventListener("error", function () { audioPriority = 0; audioSource = ""; });
    } catch (e) { audioEl = null; }
    return audioEl;
  }
  function stopAudio() {
    clearTimeout(audioSettleTimer);
    audioSettleTimer = null;
    if (audioEl) {
      try { audioEl.pause(); audioEl.currentTime = 0; } catch (e) { /* local playback failure is non-fatal */ }
    }
    audioPriority = 0;
    audioSource = "";
  }
  function playLocalAudio(path, priority, force) {
    var cfg = characterAudioCfg();
    if (!cfg.enabled || !path) return false;
    if (audioPriority && !force && priority <= audioPriority) return false;
    var p = player();
    if (!p) return false;
    try {
      if (audioPriority) { p.pause(); p.currentTime = 0; }
      audioPriority = priority;
      audioSource = path;
      p.volume = cfg.volume;
      p.src = ASSET_BASE + path;
      var result = p.play();
      if (result && typeof result.catch === "function") result.catch(function () {
        if (audioSource === path) { audioPriority = 0; audioSource = ""; }
      });
      return true;
    } catch (e) {
      audioPriority = 0;
      audioSource = "";
      return false;
    }
  }
  function playStateCue(state, force) {
    var spec = MASCOT_STATES[state] || MASCOT_STATES.idle;
    var now = nowFn();
    if (!force && (state === "idle" || now - (lastLifecycleAudioAt[state] || 0) < 15000)) return false;
    if (playLocalAudio(spec.audio, 2, true)) {
      lastLifecycleAudioAt[state] = now;
      return true;
    }
    return false;
  }
  function scheduleStateCue(state, epoch) {
    clearTimeout(audioSettleTimer);
    if (state === "idle") return;
    audioSettleTimer = setTimeout(function () {
      audioSettleTimer = null;
      if (epoch === lifecycleEpoch && S.visual === state) playStateCue(state, false);
    }, 250);
  }
  function react(kind, opts) {
    opts = opts || {};
    var spec = CHARACTER_REACTIONS[kind];
    if (!spec || (!opts.force && S.visual !== "idle")) return false;
    var now = nowFn();
    if (!opts.force) {
      if (kind === "hover") {
        if (now - lastHoverAt < spec.cooldownMs) return false;
      } else if (now - tapCooldownAt < spec.cooldownMs) return false;
    }
    var previous = typeof reactionIndexes[kind] === "number" ? reactionIndexes[kind] : -1;
    var at = (previous + 1) % spec.files.length;
    reactionIndexes[kind] = at;
    if (!playLocalAudio("voice/interaction/" + spec.files[at], 1, !!opts.force)) return false;
    if (kind === "hover") lastHoverAt = now;
    else tapCooldownAt = now;
    connectedMascots().forEach(function (m) { m.react(kind); });
    return true;
  }

  var NEXT_STATES = {
    idle: ["thinking"], thinking: ["working", "confirmation", "success", "error"],
    working: ["confirmation", "success", "error"], confirmation: ["working", "error"],
    success: ["idle"], error: ["idle"]
  };
  function preloadState(state) {
    if (!MASCOT_STATES[state] || preloadedStates[state] || typeof window.Image !== "function") return;
    preloadedStates[state] = true;
    var img = new window.Image();
    img.src = ASSET_BASE + MASCOT_STATES[state].image;
  }
  function preloadNext(state) { (NEXT_STATES[state] || []).forEach(preloadState); }

  /* Phase 2 renderer seam. The request-owned controller remains the sole
     lifecycle authority; a renderer only receives state/reaction commands.
     No Cubism SDK or model is bundled here, so the installed renderer may
     fail or disappear without affecting the Phase 1 PNG fallback. */
  function connectedMascots() {
    var keep = [];
    mascots.forEach(function (m) {
      if (m.node.isConnected) keep.push(m);
      else if (m.destroy) m.destroy();
    });
    mascots = keep;
    return keep;
  }
  function installRenderer(factory) {
    if (typeof factory !== "function") return false;
    rendererFactory = factory;
    rendererEpoch += 1;
    connectedMascots().forEach(function (m) { if (m.installRenderer) m.installRenderer(rendererEpoch); });
    return true;
  }
  function removeRenderer() {
    rendererFactory = null;
    rendererEpoch += 1;
    connectedMascots().forEach(function (m) { if (m.installRenderer) m.installRenderer(rendererEpoch); });
  }
  function rendererStatus() {
    return {
      mode: rendererFactory ? "live-candidate" : "static",
      surfaces: connectedMascots().map(function (m) { return m.rendererStatus ? m.rendererStatus() : "static"; })
    };
  }

  /* ---- lifecycle state: EXPLICIT request-owned input only ---- */
  function setLifecycle(state, options) {
    options = options || {};
    if (!MASCOT_STATES[state]) state = "idle";
    var owner = Object.prototype.hasOwnProperty.call(options, "requestId") ? options.requestId : lifecycleOwner;
    if (options.claim) lifecycleOwner = owner || null;
    else if (!options.force && owner != null && lifecycleOwner != null && owner !== lifecycleOwner) return false;
    if (!options.force && S.visual === "confirmation" && state !== "confirmation" && !options.releaseConfirmation) return false;
    clearTimeout(lifecycleTimer);
    clearTimeout(audioSettleTimer);
    lifecycleEpoch += 1;
    var epoch = lifecycleEpoch;
    S.visual = state;
    S.statusText = options.statusText || MASCOT_STATES[state].label;
    /* Idle means no request phase owns the audible channel. This also
       makes Cancel immediate instead of letting a superseded cue finish. */
    if (state === "idle") stopAudio();
    if (MASCOT_STATES[state].autoReturnMs) {
      lifecycleTimer = setTimeout(function () {
        if (epoch === lifecycleEpoch && lifecycleOwner === (owner || null) && S.visual === state) {
          setLifecycle("idle", { requestId: owner, releaseConfirmation: true, silentAudio: true });
        }
      }, MASCOT_STATES[state].autoReturnMs);
    }
    connectedMascots().forEach(function (m) { m.update(); });
    preloadNext(state);
    updateTrigger();
    var status = document.querySelectorAll("[data-ui~='asst.status']");
    status.forEach(function (n) { n.textContent = S.statusText; });
    announce(S.statusText);
    if (!options.silentAudio) scheduleStateCue(state, epoch);
    return true;
  }
  function setVisual(state, statusText, options) {
    options = options || {};
    options.statusText = statusText;
    return setLifecycle(state, options);
  }
  function claimLifecycle(prefix, state, statusText) {
    var owner = prefix + ":" + (++lifecycleSerial);
    setLifecycle(state, { requestId: owner, claim: true, releaseConfirmation: true, statusText: statusText });
    return owner;
  }

  /* ---- the mascot component (one implementation, two sizes) ---- */
  /* The mascot OWNS data-state: it is the visual state (idle, thinking,
     success …) that the stylesheet and the Live2D seam key off. Its render
     flags therefore ride their own boolean attributes rather than joining
     data-state (UI rebuild M1): data-loading / data-img-failed /
     data-live-renderer / data-live-loading / data-reacting carry them for
     the stylesheet, behaviour and tests alike (Graphite step 7). */
  var MASCOT_FLAGS = { "is-loading": "data-loading", "img-failed": "data-img-failed",
    "has-live-renderer": "data-live-renderer", "is-live-loading": "data-live-loading",
    "is-reacting": "data-reacting" };
  function mascotFlag(node, word, on) {
    if (on) node.setAttribute(MASCOT_FLAGS[word], ""); else node.removeAttribute(MASCOT_FLAGS[word]);
  }
  function mascotNode(size) {
    var staticImageFailed = false;
    var img = el("img", { class: "k-asst-mascot-img", "data-ui": "asst.mascot-img", alt: "" });
    img.addEventListener("error", function () {
      staticImageFailed = true;
      if (!node.hasAttribute("data-live-renderer")) mascotFlag(node, "img-failed", true);
      mascotFlag(node, "is-loading", false);
    });
    img.addEventListener("load", function () { staticImageFailed = false; mascotFlag(node, "is-loading", false); mascotFlag(node, "img-failed", false); });
    var liveHost = el("div", { class: "k-asst-live2d-host", "data-ui": "asst.live2d-host", "aria-hidden": "true" });
    var glyph = el("span", { class: "k-asst-mascot-fallback", lang: "ja", "aria-hidden": "true", text: "紅" });
    var status = el("p", { class: "k-asst-status", "data-ui": "asst.status", role: "status" });
    function hit(kind, label) {
      var button = el("button", { class: "k-asst-hit", "data-ui": "asst.hit-zone", type: "button", "data-reaction": kind,
        "aria-label": label, title: label });
      button.addEventListener("click", function (event) { event.stopPropagation(); react(kind); });
      return button;
    }
    var frame = el("div", { class: "k-asst-mascot-frame", "data-ui": "asst.mascot-frame", role: "group",
      "aria-label": "Interactive full-body Kurenai character" }, [
      el("span", { class: "k-asst-ring", "data-ring": "one", "aria-hidden": "true" }),
      el("span", { class: "k-asst-ring", "data-ring": "two", "aria-hidden": "true" }),
      img,
      liveHost,
      glyph,
      hit("head", "Greet Kurenai"),
      hit("flower", "Touch Kurenai's flower ornament"),
      hit("tablet", "Tap Kurenai's tablet")
    ]);
    function clearHover() { clearTimeout(hoverTimer); hoverTimer = null; }
    frame.addEventListener("pointerenter", function () {
      clearHover();
      hoverTimer = setTimeout(function () { hoverTimer = null; react("hover"); }, 800);
    });
    frame.addEventListener("pointerleave", clearHover);
    var node = el("div", { class: "k-asst-mascot", "data-ui": "asst.mascot", "data-size": size === "large" ? "large" : "small" },
      [frame, status]);
    var reactionTimer = null, liveRenderer = null, liveToken = 0, liveState = "static";
    function clearLive(nextState) {
      liveToken += 1;
      if (liveRenderer && typeof liveRenderer.destroy === "function") {
        try { liveRenderer.destroy(); } catch (e) { /* renderer cleanup must not disturb fallback */ }
      }
      liveRenderer = null;
      liveHost.replaceChildren();
      liveState = nextState || "static";
      node.setAttribute("data-renderer", liveState);
      mascotFlag(node, "has-live-renderer", false); mascotFlag(node, "is-live-loading", false);
      if (staticImageFailed) mascotFlag(node, "img-failed", true);
    }
    function updateLive() {
      if (!liveRenderer || typeof liveRenderer.setState !== "function") return;
      try {
        liveRenderer.setState(S.visual, { label: S.statusText, size: size });
      } catch (e) { clearLive("failed"); }
    }
    function mountLive(epoch) {
      clearLive("static");
      if (!rendererFactory || reducedMotion()) return;
      var token = liveToken, factory = rendererFactory;
      liveState = "loading";
      node.setAttribute("data-renderer", liveState);
      mascotFlag(node, "is-live-loading", true);
      var candidate;
      try {
        candidate = factory({
          host: liveHost,
          size: size,
          assetBase: ASSET_BASE,
          state: S.visual,
          maxFps: size === "large" ? 60 : 30
        });
      } catch (e) { clearLive("failed"); return; }
      Promise.resolve(candidate).then(function (renderer) {
        if (token !== liveToken || epoch !== rendererEpoch || factory !== rendererFactory) {
          if (renderer && typeof renderer.destroy === "function") renderer.destroy();
          return;
        }
        if (!renderer || typeof renderer.setState !== "function") { clearLive("failed"); return; }
        liveRenderer = renderer;
        liveState = "live";
        node.setAttribute("data-renderer", liveState);
        mascotFlag(node, "is-live-loading", false); mascotFlag(node, "img-failed", false);
        mascotFlag(node, "has-live-renderer", true);
        updateLive();
      }).catch(function () { if (token === liveToken) clearLive("failed"); });
    }
    function showReaction(kind) {
      clearTimeout(reactionTimer);
      mascotFlag(node, "is-reacting", false);
      void node.offsetWidth;
      mascotFlag(node, "is-reacting", true);
      node.setAttribute("data-reaction", kind);
      if (liveRenderer && typeof liveRenderer.react === "function") {
        try { liveRenderer.react(kind); } catch (e) { clearLive("failed"); }
      }
      reactionTimer = window.setTimeout(function () { mascotFlag(node, "is-reacting", false); node.removeAttribute("data-reaction"); }, 360);
    }
    function update() {
      var st = MASCOT_STATES[S.visual] || MASCOT_STATES.idle;
      mascotFlag(node, "img-failed", false);
      node.setAttribute("data-state", S.visual);
      var nextSrc = ASSET_BASE + st.image;
      if (img.getAttribute("src") !== nextSrc) { mascotFlag(node, "is-loading", true); img.src = nextSrc; }
      img.alt = size === "large" ? ("Kurenai, full-body assistant — " + st.label) : "";
      status.textContent = S.statusText;
      updateLive();
    }
    var surface = {
      node: node,
      update: update,
      react: showReaction,
      installRenderer: mountLive,
      rendererStatus: function () { return liveState; },
      destroy: function () { clearTimeout(reactionTimer); clearLive("static"); }
    };
    mascots.push(surface);
    update();
    if (rendererFactory) window.requestAnimationFrame(function () { if (rendererFactory) mountLive(rendererEpoch); });
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
    claimLifecycle("conversation", "idle");
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
      claimLifecycle("conversation", "idle");
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
      var characterOwner = claimLifecycle("request", "thinking");
      S.requestId = KOS.ai.orchestrator.send({
        userText: text,
        conversationId: S.conversationId,
        conversationKey: S.localId,   // stable per-conversation continuity key
        category: opts.category || "complex"
      }, {
        onStatus: function (p) {
          if (p.state === "thinking") setVisual("thinking", null, { requestId: characterOwner });
          else if (p.state === "working") setVisual("working", null, { requestId: characterOwner });
          else if (p.state === "awaiting_confirmation") setVisual("confirmation", null, { requestId: characterOwner });
          else if (p.state === "fallback") pushRow({ kind: "warning", text: "Switched from " + providerName(p.from) + " to " + providerName(p.to) + " using the fallback you enabled." });
          else if (p.state === "persist_warning") pushRow({ kind: "warning", text: p.message });
        },
        onToolStart: function (p) {
          setVisual("working", toolActivity(p.tool) + "…", { requestId: characterOwner });
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
          setVisual("confirmation", "Review before Kurenai acts: " + toolDisplayName(card.tool), { requestId: characterOwner });
          announce("Your approval is required for " + toolDisplayName(card.tool));
          notify();
        },
        onText: function (p) { pushAssistantStream(p.text); },
        onError: function (p) {
          S.lastError = p.message;
          pushRow({ kind: "error", text: p.message });
          setVisual("error", "Failed: " + clampText(p.message, 80), { requestId: characterOwner, releaseConfirmation: true });
        },
        onDone: function (p) {
          function finishUi() {
          if (lifecycleOwner !== characterOwner) return;
          S.busy = false;
          S.requestId = null;
          if (p.status === "complete") setVisual("success", null, { requestId: characterOwner, releaseConfirmation: true });
          else if (p.status === "cancelled") setVisual("idle", "Cancelled", { requestId: characterOwner, releaseConfirmation: true });
          /* error state already set by onError */
          notify();
          }
          if (S.streaming) streamDone = finishUi;
          else finishUi();
        }
      });
      if (S.requestId === null) { S.busy = false; setVisual("idle", null, { requestId: characterOwner, releaseConfirmation: true }); }
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
    S.requestId = null;
    claimLifecycle("cancel", "idle", "Cancelled");
    notify();
  }

  /* ---- deterministic single-tool run (proposal Save/Discard, contextual
     "Generate flashcards") — runs the EXACT tool through the orchestrator's
     Phase C gating/audit/receipts, no model interpretation ---- */
  function runToolUi(name, args, onComplete) {
    if (S.busy) { KOS.ui.toast("Kurenai is busy — wait for the current step.", true); return; }
    S.busy = true;
    var characterOwner = claimLifecycle("tool", "working", toolActivity(name) + "…");
    notify();
    S.requestId = KOS.ai.orchestrator.runTool(name, args || {}, {
      onProposal: function (p) {
        var art = KOS.ai.tools.getPendingArtifact && KOS.ai.tools.getPendingArtifact();
        pushRow({ kind: "proposal", artifact: art, tool: p.tool });
      },
      onReceipt: function (p) { pushRow({ kind: "receipt", tool: p.tool, target: p.target, summary: p.summary }); },
      onConfirmationNeeded: function (card) {
        S.pending = card; S.pendingState = null; S.busy = true;
        setVisual("confirmation", "Review before Kurenai acts: " + toolDisplayName(card.tool), { requestId: characterOwner });
        announce("Your approval is required for " + toolDisplayName(card.tool)); notify();
      },
      onError: function (p) { S.lastError = p.message; pushRow({ kind: "error", text: p.message }); setVisual("error", clampText(p.message, 80), { requestId: characterOwner, releaseConfirmation: true }); },
      onDone: function (p) {
        if (lifecycleOwner !== characterOwner) return;
        S.busy = false; S.requestId = null;
        if (p.status === "complete") setVisual("success", null, { requestId: characterOwner, releaseConfirmation: true });
        else if (p.status === "cancelled") setVisual("idle", "Cancelled", { requestId: characterOwner, releaseConfirmation: true });
        if (typeof onComplete === "function") onComplete(p.status);
        notify();
      }
    });
    if (S.requestId === null) { S.busy = false; setVisual("idle", null, { requestId: characterOwner, releaseConfirmation: true }); notify(); }
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
        setVisual("error", clampText(err.message, 80), { requestId: lifecycleOwner, releaseConfirmation: true });
      } else {
        S.pending = null;
        setVisual("working", "Running the confirmed action…", { requestId: lifecycleOwner, releaseConfirmation: true });
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
    setVisual("thinking", "Declined — Kurenai is responding…", { requestId: lifecycleOwner, releaseConfirmation: true });
    notify();
  }

  function clampText(s, n) { s = String(s == null ? "" : s); return s.length > n ? s.slice(0, n) + "…" : s; }

  /* ================= trigger + drawer ================= */
  var drawerEl = null, drawerScrim = null, composerEl = null, lastFocus = null;

  function updateTrigger() {
    var t = document.getElementById("assistant-trigger");
    if (!t) return;
    KOS.ui.state(t, "is-busy", S.busy && !S.pending);
    KOS.ui.state(t, "is-confirm", !!S.pending);
    t.setAttribute("aria-expanded", S.open ? "true" : "false");
    t.title = S.pending ? "Kurenai is waiting for your confirmation"
      : S.busy ? "Kurenai is working…" : "Kurenai assistant";
  }

  /* the composer (frame 13a): one card, the message beside its two
     buttons; the textarea grows with its text up to a cap */
  function buildComposer(compact) {
    var ta = el("textarea", { class: "k-asst-input", "data-ui": "asst.composer", rows: "1",
      placeholder: compact ? "Ask Kurenai…" : "Ask about your studies, collection, plans, or progress…",
      "aria-label": "Message to the Kurenai assistant" });
    ta.value = S.draft;
    function autoSize() {
      var max = compact ? 132 : 168;
      ta.style.setProperty("--ta-h", "auto");
      var next = ta.value ? Math.min(Math.max(24, ta.scrollHeight), max) : 24;
      ta.style.setProperty("--ta-h", next + "px");
      if (ta.scrollHeight > max) ta.setAttribute("data-overflow", ""); else ta.removeAttribute("data-overflow");
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
    var sendBtn = el("button", { class: "k-asst-send", "data-ui": "asst.send", type: "button", text: "↑",
      "aria-label": "Send message to Kurenai",
      title: "Send message",
      onclick: function () { if (submit(ta.value)) { ta.value = ""; autoSize(); } } });
    var cancelBtn = el("button", { class: "k-btn k-btn--sm", "data-ui": "asst.cancel", type: "button", text: "Stop",
      "aria-label": "Stop the current request",
      onclick: function () { cancelActive(); } });
    function refresh() {
      var lock = S.busy || S.streaming;
      ta.disabled = lock;
      sendBtn.disabled = lock;
      cancelBtn.hidden = !lock;
      KOS.ui.state(sendBtn, "is-working", lock);
    }
    refresh();
    var wrap = el("div", { class: "k-asst-composer", "data-ui": "asst.composer-box" }, [
      ta,
      compact ? null : el("span", { class: "k-asst-hint", text: "Shift + Enter for a new line" }),
      cancelBtn, sendBtn
    ].filter(Boolean));
    wrap._refresh = refresh;
    wrap._ta = ta;
    window.requestAnimationFrame(autoSize);
    return wrap;
  }

  /* the approval card (frame 13a): a consequential action waits here, with
     its exact request one disclosure away and nothing run until Confirm */
  function argFacts(args) {
    return Object.keys(args || {}).filter(function (k) {
      var v = args[k];
      return v !== null && v !== undefined && v !== "" && (typeof v === "string" || typeof v === "number" || typeof v === "boolean");
    }).slice(0, 4).map(function (k) { return [titleWords(k.replace(/([a-z])([A-Z])/g, "$1_$2")), String(args[k])]; });
  }
  function confirmationCard() {
    if (!S.pending) return null;
    var p = S.pending;
    var expiresIn = Math.max(0, Math.round((p.expiresAt - Date.now()) / 1000));
    var facts = (p.target ? [["Target", p.target]] : []).concat(argFacts(p.args));
    return el("article", { class: "k-asst-row k-asst-card k-asst-confirm", "data-ui": "asst.confirm", "data-tier": p.tier, role: "group",
      "aria-label": "Review an action before Kurenai runs it" }, [
      el("div", { class: "k-asst-card-head" }, [
        el("span", { class: "k-asst-confirm-k", text: "⚠ Review before Kurenai acts" }),
        el("span", { class: "k-asst-expiry", text: expiresIn >= 90 ? "expires in about " + Math.round(expiresIn / 60) + " min" : "expires in about " + expiresIn + " s" })
      ]),
      el("h3", { class: "k-asst-card-title", text: toolDisplayName(p.tool) }),
      el("p", { class: "k-asst-card-desc", text: p.description || "This action changes your KurenaiOS data." }),
      facts.length ? el("div", { class: "k-asst-facts" }, facts.map(function (f) {
        return el("p", { class: "k-card-row" }, [el("span", { class: "k-card-row-k", text: f[0] }), el("span", { class: "k-card-row-v", text: f[1] })]);
      })) : null,
      el("details", { class: "k-asst-exact" }, [
        el("summary", { text: "Review the exact request" }),
        el("code", { class: "k-asst-id", "data-ui": "asst.technical-id", text: p.tool }),
        el("pre", { class: "k-asst-args", "data-ui": "asst.confirm-args", text: JSON.stringify(p.args, null, 1) })
      ]),
      el("p", { class: "k-asst-card-note", text: "A changed target or screen invalidates the approval automatically." }),
      el("div", { class: "k-asst-card-btns" }, [
        (function () {
          var b = el("button", { class: "k-btn k-asst-go", type: "button", "data-intent": "primary",
            text: S.pendingState === "confirming" ? "Running…" : "Confirm & run",
            onclick: confirmPending });
          b.disabled = S.pendingState === "confirming";
          return b;
        })(),
        el("button", { class: "k-btn", type: "button", text: "Decline", onclick: rejectPending }),
        el("span", { class: "k-asst-tier-note", text: tierLabel(p.tier) })
      ])
    ].filter(Boolean));
  }

  /* ---- the pending-artifact card: a validated-but-UNSAVED proposal with
     real Edit / Discard / Save actions. Save runs the EXACT stored artifact
     through study_save_proposed; nothing here persists until then. ---- */
  var PROPOSAL_PREVIEW = 3;
  function proposalCard(r) {
    var art = r.artifact;
    var isFlash = !art || art.kind !== "quiz";
    var items = (art && art.items) || [];
    var typeLabel = isFlash ? "flashcards" : "quiz questions";
    /* is this row still THE live pending artifact (a newer proposal replaces it)? */
    var current = KOS.ai.tools.getPendingArtifact && KOS.ai.tools.getPendingArtifact();
    var live = !!art && current === art;

    var tagText = r._saved ? "✓ Saved to your deck"
      : r._discarded ? "Discarded · nothing was saved"
      : !live ? "Superseded by a newer proposal"
      : "PROPOSED · not saved yet";
    var head = el("div", { class: "k-asst-card-head" }, [
      el("span", { class: "k-chip k-asst-tag", "data-tone": r._saved ? "green" : live && !r._discarded ? "bloom" : "muted", text: tagText }),
      art ? el("span", { class: "k-asst-card-sum", text: items.length + " " + typeLabel +
        (art.topicTitle ? " · " + art.topicTitle : "") + (art.provider ? " · " + art.provider : "") }) : null
    ].filter(Boolean));

    /* --- editing mode (flashcards only: inline q/a) --- */
    if (r._editing && isFlash && !r._saved && !r._discarded && live) {
      var rows = items.map(function (it) {
        var q = el("textarea", { class: "k-input k-asst-edit", rows: "2", "aria-label": "Question" }); q.value = it.q || "";
        var a = el("textarea", { class: "k-input k-asst-edit", rows: "2", "aria-label": "Answer" }); a.value = it.a || "";
        return { q: q, a: a };
      });
      var editList = el("ol", { class: "k-asst-items" }, rows.map(function (row2, i) {
        return el("li", { class: "k-asst-item k-asst-item-edit" }, [
          el("span", { class: "k-asst-item-n", text: String(i + 1) }), row2.q, row2.a
        ]);
      }));
      var editBtns = el("div", { class: "k-asst-card-btns" }, [
        el("button", { class: "k-btn k-btn--primary", type: "button", text: "Apply edits", onclick: function () {
          var next = rows.map(function (row2) { return { q: row2.q.value.trim(), a: row2.a.value.trim() }; })
            .filter(function (c) { return c.q && c.a; });
          if (!next.length) { KOS.ui.toast("Each card needs a question and an answer.", true); return; }
          commitProposalEdits(r, next);
        } }),
        el("button", { class: "k-btn", type: "button", text: "Cancel", onclick: function () { toggleEditProposal(r, false); } })
      ]);
      return el("article", { class: "k-asst-row k-asst-card k-asst-proposal", "data-ui": "asst.proposal", "data-state": "is-editing" }, [head, editList, editBtns]);
    }

    /* --- display mode: the first few, the rest one press away --- */
    var shown = r._expanded ? items : items.slice(0, PROPOSAL_PREVIEW);
    var list = el("ol", { class: "k-asst-items" }, shown.map(function (it) {
      var answer = isFlash ? (it.a || "")
        : (it.opts || []).map(function (o, oi) { return (oi === it.ans ? "✓ " : "") + o; }).join("   ·   ");
      return el("li", { class: "k-asst-item" }, [
        el("span", { class: "k-asst-item-q", text: it.q || "" }),
        el("span", { class: "k-asst-item-a", text: answer })
      ]);
    }));
    var kids = [head, list];
    if (items.length > PROPOSAL_PREVIEW) kids.push(el("button", { class: "k-link k-asst-more", type: "button",
      text: r._expanded ? "Show fewer" : "+ " + (items.length - PROPOSAL_PREVIEW) + " more",
      "aria-expanded": r._expanded ? "true" : "false",
      onclick: function () { r._expanded = !r._expanded; notify(); } }));
    if (!r._saved && !r._discarded && live) {
      var btns = [el("button", { class: "k-btn k-btn--primary", type: "button", text: "Save to deck", onclick: function () { saveProposed(r); } })];
      if (isFlash) btns.push(el("button", { class: "k-btn", type: "button", text: "Edit", onclick: function () { toggleEditProposal(r, true); } }));
      btns.push(el("button", { class: "k-btn", type: "button", text: "Discard", onclick: function () { discardProposed(r); } }));
      kids.push(el("div", { class: "k-asst-card-btns" }, btns));
    }
    return el("article", { class: "k-asst-row k-asst-card k-asst-proposal", "data-ui": "asst.proposal",
      "data-state": r._saved ? "is-saved" : r._discarded ? "is-discarded" : null }, kids);
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
      class: "k-asst-math", "data-ui": "asst.math-source" + (display ? " asst.math-display" : ""),
      "data-display": display ? "" : null,
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
          parent.appendChild(el("code", { class: "k-asst-code-inline", text: text.slice(i + ticks.length, close).replace(/^ | $/g, "") }));
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
          link = href ? el("a", { class: "k-asst-image-link", href: href, target: "_blank", rel: "noopener noreferrer" })
            : el("span", { class: "k-asst-image-link" });
          link.appendChild(document.createTextNode("Image: "));
          appendInline(link, match[2], depth + 1);
          parent.appendChild(link);
        } else if (href) {
          link = el("a", { href: href, target: href.charAt(0) === "#" || href.charAt(0) === "/" ? "_self" : "_blank",
            rel: "noopener noreferrer" });
          appendInline(link, match[2], depth + 1);
          parent.appendChild(link);
        } else {
          link = el("span", { class: "k-asst-unsafe-link", title: "Link removed: only web and mail links are kept" });
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
    var code = el("code", { "data-lang": language ? String(language).replace(/[^a-z0-9_+-]/gi, "") : null });
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
      if (kind) code.appendChild(el("span", { class: "k-asst-tok", "data-ui": "code.token", "data-kind": kind, text: token }));
      else code.appendChild(document.createTextNode(token));
      at = pattern.lastIndex;
    }
    if (at < source.length) code.appendChild(document.createTextNode(source.slice(at)));
    return code;
  }

  function codeBlock(language, code) {
    var copy = el("button", { class: "k-btn k-btn--sm k-asst-copy", type: "button", text: "Copy", "aria-label": "Copy code" });
    copy.addEventListener("click", function () {
      var done = function () { copy.textContent = "Copied"; setTimeout(function () { copy.textContent = "Copy"; }, 1400); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code).then(done).catch(function () { KOS.ui.toast("Couldn't copy code", true); });
      else KOS.ui.toast("Clipboard access is unavailable", true);
    });
    return el("figure", { class: "k-asst-codeblock", "data-ui": "asst.code" }, [
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
          var th = el("th", { scope: "col", "data-align": aligns[index] || "left" });
          appendInline(th, cell); row.appendChild(th);
        });
        table.appendChild(el("thead", {}, [row]));
        var tbody = el("tbody"); at += 2;
        while (at < lines.length && lines[at].trim() && lines[at].indexOf("|") >= 0) {
          row = el("tr"); splitTableRow(lines[at]).forEach(function (cell, index) {
            var td = el("td", { "data-align": aligns[index] || "left" });
            appendInline(td, cell); row.appendChild(td);
          });
          while (row.children.length < cells.length) row.appendChild(el("td"));
          tbody.appendChild(row); at += 1;
        }
        table.appendChild(tbody);
        wrap = el("figure", { class: "k-asst-table", "data-ui": "asst.table", "data-scroller": "true", role: "region", tabindex: "0", "aria-label": "Scrollable response table" }, [table]);
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
            li.setAttribute("data-task", "");
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
      Array.prototype.forEach.call(root.querySelectorAll("[data-ui~='asst.math-source']"), function (node) {
        if (node._asstMathRendered) return;
        try {
          window.katex.render(node._asstMath, node, { displayMode: node._asstMathDisplay, throwOnError: false, trust: false, strict: "ignore" });
          node._asstMathRendered = true;
          KOS.ui.state(node, "is-rendered", true);
        } catch (e) { /* malformed maths remains readable in its source form */ }
      });
      return true;
    }
    if (!apply() && document.readyState !== "complete") window.addEventListener("load", apply, { once: true });
  }

  function assistantRichText(source) {
    var bubble = el("div", { class: "k-asst-rich", "data-ui": "asst.bubble asst.richtext" });
    renderMarkdownInto(bubble, source);
    typesetAssistantMath(bubble);
    return bubble;
  }

  /* tool activity (frame 13a): the steps sit inside Kurenai's column as
     one native disclosure — human copy first, the raw id secondary */
  function toolGroupNode(rows) {
    var failed = rows.filter(function (r) { return !r.ok; }).length;
    var title = rows.length === 1
      ? (failed ? "Could not finish · " : "") + toolActivity(rows[0].tool)
      : failed ? rows.length + " steps · " + failed + " need attention" : rows.length + " steps completed";
    var details = el("ul", { class: "k-asst-steps-list" }, rows.map(function (r) {
      return el("li", { class: "k-asst-step", "data-state": r.ok ? null : "failed" }, [
        el("span", { class: "k-asst-step-mark", "aria-hidden": "true", text: r.ok ? "✓" : "!" }),
        el("span", { class: "k-asst-step-copy", text: toolActivity(r.tool) }),
        el("code", { class: "k-asst-id", "data-ui": "asst.technical-id", text: r.tool }),
        r.text ? el("span", { class: "k-asst-step-detail", text: clampText(r.text, 160) }) : null
      ].filter(Boolean));
    }));
    return el("details", { class: "k-asst-row k-asst-steps", "data-ui": "asst.tool", "data-state": failed ? "failed" : null }, [
      el("summary", {}, [
        el("span", { class: "k-asst-step-mark", "aria-hidden": "true", text: failed ? "!" : "✓" }),
        el("span", { class: "k-asst-step-copy", text: title }),
        el("span", { class: "k-asst-step-more", text: "Details" })
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
        out.push(el("article", { class: "k-asst-row k-asst-receipt", "data-ui": "asst.receipt" }, [
          el("span", { class: "k-asst-receipt-mark", "aria-hidden": "true", text: "✓" }),
          el("div", { class: "k-asst-receipt-txt" }, [
            el("span", { class: "k-asst-receipt-k", text: "Verified action complete" }),
            el("strong", { text: toolDisplayName(r.tool) }),
            el("span", { text: r.summary || "The change was recorded by KurenaiOS." }),
            r.target ? el("span", { class: "k-asst-muted", text: "Target · " + r.target }) : null,
            el("code", { class: "k-asst-id", "data-ui": "asst.technical-id", text: r.tool })
          ].filter(Boolean))
        ]));
        continue;
      }
      if (r.kind === "proposal") { out.push(proposalCard(r)); continue; }
      if (r.kind === "warning" || r.kind === "error") {
        var warn = r.kind === "warning";
        out.push(el("article", { class: "k-asst-row k-asst-alert", "data-ui": warn ? "asst.warning" : "asst.error",
          "data-tone": warn ? "amber" : "red", role: warn ? "note" : "alert" }, [
          el("span", { class: "k-asst-alert-mark", "aria-hidden": "true", text: warn ? "!" : "×" }),
          el("div", {}, [el("strong", { text: warn ? "Heads up" : "Kurenai couldn't finish that" }), el("span", { text: r.text })])
        ]));
        continue;
      }
      /* Provider Markdown is parsed into an allowlisted DOM tree. Raw HTML
         remains text; only assistant prose takes this path. */
      if (r.kind === "assistant") {
        var rich = assistantRichText(r.visibleText == null ? r.text : r.visibleText);
        if (r.streaming) rich.appendChild(el("span", { class: "k-asst-caret", "data-ui": "asst.stream-caret", "aria-hidden": "true" }));
        rich.classList.add("k-asst-msg-body");
        out.push(el("article", { class: "k-asst-row k-asst-msg", "data-ui": "asst.assistant", "data-state": r.streaming ? "is-streaming" : null }, [
          el("img", { class: "k-asst-mark", "data-ui": "asst.message-mark", src: EMBLEM, alt: "" }),
          el("span", { class: "sr-only", text: "Kurenai said" }),
          rich
        ]));
        continue;
      }
      out.push(el("article", { class: "k-asst-row k-asst-you", "data-ui": "asst.user" }, [
        el("span", { class: "sr-only", text: "You said" }),
        el("div", { class: "k-asst-you-bubble", "data-ui": "asst.bubble", text: r.text })
      ]));
    }
    return out;
  }

  var STARTERS = ["What should I revise next?", "Show today's study plan", "Summarise my study progress", "Help me plan this week"];
  function buildThreadArea(compact) {
    /* Phase F: the thread is tabbable so it can be SCROLLED from the
       keyboard, which is right — but a focus stop with no role announced
       itself as nothing. role="log" is what a growing conversation is. */
    var scroller = el("div", { class: "k-asst-thread", "data-ui": "asst.thread", tabindex: "0", role: "log",
      "aria-label": "Conversation", "aria-live": "polite", "aria-relevant": "additions" });
    var composer = buildComposer(compact);
    function emptyState() {
      return el("header", { class: "k-asst-intro", "data-ui": "asst.empty" }, [
        el("div", { class: "k-asst-bloom-k", text: "Whispering Bloom" }),
        el("h2", { class: "k-asst-intro-h", text: "What are we working on?" }),
        el("p", { class: "k-asst-intro-p", text: "Begin with the part that feels tangled. Any consequential change pauses for your approval." }),
        el("p", { class: "k-asst-starters", role: "group", "aria-label": "Suggested prompts" }, STARTERS.map(function (prompt) {
          return el("button", { class: "k-asst-starter", "data-ui": "asst.starter", type: "button", text: prompt,
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
      KOS.ui.state(wrap, "is-empty", !S.thread.length && !S.pending);
      composer._refresh();
    }
    var wrap = el("div", { class: "k-asst-chat", "data-ui": "asst.thread-wrap" }, [scroller, el("div", { class: "k-asst-compose" }, [composer])]);
    subscribe(wrap, render);
    render();
    wrap._composer = composer;
    return wrap;
  }

  /* the drawer (frame 13b): a floating card over any page. Empty, Kurenai
     stands in it at full height; once a conversation runs she steps back to
     a status strip and the thread takes the room. */
  function openDrawer() {
    if (S.open) return;
    S.open = true;
    lastFocus = document.activeElement;
    drawerScrim = el("button", { class: "k-asst-scrim", "data-ui": "asst.drawer-scrim", type: "button", tabindex: "-1",
      "aria-label": "Close Kurenai assistant", onclick: closeDrawer });
    var threadArea = buildThreadArea(true);
    drawerEl = el("aside", { class: "k-asst-drawer", "data-ui": "asst.drawer", role: "dialog", "aria-label": "Kurenai assistant", "aria-modal": "true" }, [
      el("div", { class: "k-asst-drawer-head" }, [
        el("img", { class: "k-asst-emblem", src: EMBLEM, alt: "" }),
        el("b", { class: "k-asst-drawer-name", text: "Kurenai" }),
        el("span", { class: "k-asst-drawer-btns" }, [
          el("button", { class: "k-iconbtn k-iconbtn--sm", type: "button", text: "＋", "aria-label": "New conversation",
            title: "New conversation", onclick: function () { newConversation(); } }),
          el("button", { class: "k-iconbtn k-iconbtn--sm", type: "button", text: "⤢", "aria-label": "Open the full assistant page",
            title: "Open the full assistant page",
            onclick: function () { closeDrawer(); KOS.show("assistant"); } }),
          el("button", { class: "k-iconbtn k-iconbtn--sm", type: "button", text: "✕", "aria-label": "Close the assistant drawer",
            onclick: function () { closeDrawer(); } })
        ])
      ]),
      el("div", { class: "k-asst-drawer-stage" }, [mascotNode("small")]),
      threadArea
    ]);
    function paintEmpty() { KOS.ui.state(drawerEl, "is-empty", !S.thread.length && !S.pending); }
    subscribe(drawerEl, paintEmpty);
    paintEmpty();
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
    document.documentElement.setAttribute("data-assistant-drawer", "open");
    document.body.appendChild(drawerScrim);
    document.body.appendChild(drawerEl);
    updateTrigger();
    var ta = drawerEl.querySelector("[data-ui~='asst.composer']");
    if (ta) ta.focus();
  }
  /* closing NEVER cancels — the request (and any pending confirmation)
     stays live; only the explicit Stop/Decline buttons cancel things */
  function closeDrawer() {
    if (!S.open) return;
    S.open = false;
    if (drawerEl) { drawerEl.remove(); drawerEl = null; }
    if (drawerScrim) { drawerScrim.remove(); drawerScrim = null; }
    document.documentElement.removeAttribute("data-assistant-drawer");
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
    return el("div", { class: "k-asst-ctx", "data-ui": "asst.ctx", role: "group", "aria-label": "Kurenai" }, [
      el("img", { class: "k-asst-ctx-mark", src: EMBLEM, alt: "" })
    ].concat(acts.map(function (a) {
      return el("button", { class: "k-asst-ctx-btn", "data-ui": "asst.ctx-btn", type: "button", text: a[0], onclick: a[1] });
    })));
  }
  /* the vault editor hook — same pattern as wishlist's banner */
  if (KOS.mediaEditorHooks) {
    KOS.mediaEditorHooks.push(function (entry, overlay) {
      if (!entry || entry.id == null || !overlay) return;
      var form = overlay.querySelector("[data-ui~='ui.form']");
      if (!form) return;
      var strip = contextActions("entry", { module: entry.module, entryId: entry.id, title: entry.title });
      if (strip) form.insertBefore(strip, form.firstChild);
    });
  }

  /* ================= the dedicated page (frames 13a, 13c–13f) =========
     A second sidebar beside the page: New chat and search, the six pages
     in two groups with kanji tiles that follow the main rail, projects,
     recent chats with times, and the routing pinned at the foot. The page
     takes the whole stage (KOS.shell.bleed). */
  var PAGE_TABS = [
    ["Chat", "assistant", { tab: "chat" }, "chat"],
    ["History", "assistant", { tab: "history" }, "history"],
    ["Settings", "assistant", { tab: "settings" }, "settings"],
    ["Memory", "assistant", { tab: "memory" }, "memory"],
    ["Permissions", "assistant", { tab: "permissions" }, "permissions"],
    ["Activity", "assistant", { tab: "activity" }, "activity"]
  ];
  var TAB_KANJI = { chat: "話", history: "歴", settings: "設", memory: "憶", permissions: "許", activity: "録" };
  /* the tool areas of js/core/aitools.js, marked like the main rail */
  var AREA_KANJI = { app: "灯", archive: "蔵", collection: "蒐", governor: "守", memory: "憶",
    planner: "整", search: "索", study: "学", sync: "同" };

  function relTime(ts) {
    if (!ts) return "";
    var t = typeof ts === "number" ? ts : Date.parse(ts);
    if (!t) return "";
    var diff = Date.now() - t;
    if (diff < 90e3) return "now";
    if (diff < 36e5) return Math.round(diff / 6e4) + "m";
    if (diff < 864e5) return Math.round(diff / 36e5) + "h";
    if (diff < 864e5 * 6) return new Date(t).toLocaleDateString("en-GB", { weekday: "short" });
    return new Date(t).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  }
  /* the routing as configured, read without creating it (KOS.ai.routing) */
  function routingNow() {
    return (KOS.ai && KOS.ai.routing) ? KOS.ai.routing() : {};
  }

  function createProject(name) {
    name = clampText(String(name || "").trim(), 48);
    if (!name) return null;
    var ws = workspaceCfg(true);
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
      var ws = workspaceCfg(true);
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
    var select = el("select", { class: "k-asst-chip-select", "data-ui": "asst.project-picker", "aria-label": "Conversation project", title: "Organise this conversation in a project" }, [
      el("option", { value: "", text: "Project · none" })
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
    var nav = el("aside", { class: "k-asst-nav", "data-ui": "asst.nav", "aria-label": "Assistant navigation and conversations" });
    if (ws.sidebarCollapsed) KOS.ui.state(nav, "is-collapsed", true);
    var collapse = el("button", { class: "k-iconbtn k-asst-collapse", "data-ui": "asst.nav-collapse", type: "button",
      text: ws.sidebarCollapsed ? "›" : "‹", "aria-label": ws.sidebarCollapsed ? "Expand assistant sidebar" : "Collapse assistant sidebar",
      title: ws.sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar", onclick: function () {
        var w = workspaceCfg(true);
        w.sidebarCollapsed = !w.sidebarCollapsed; saveWorkspace();
        KOS.show("assistant", { tab: active });
      } });
    nav.appendChild(el("div", { class: "k-asst-brand" }, [
      el("img", { class: "k-asst-emblem", src: EMBLEM, alt: "" }),
      el("div", { class: "k-asst-brand-txt" }, [
        el("div", { class: "k-asst-bloom-k", text: "Whispering Bloom" }),
        el("h1", { id: "asst-page-title", class: "k-asst-brand-name", tabindex: "-1", text: "Kurenai Assistant" })
      ])
    ]));

    /* New chat, and a filter over the conversations listed below */
    var filter = el("input", { class: "k-input k-asst-filter", type: "search", placeholder: "Filter chats…",
      "aria-label": "Filter conversations", hidden: "" });
    var searchBtn = el("button", { class: "k-iconbtn k-asst-search", type: "button", text: "⌕", "aria-label": "Filter conversations",
      "aria-pressed": "false", title: "Filter conversations", onclick: function () {
        var on = filter.hidden;
        filter.hidden = !on;
        searchBtn.setAttribute("aria-pressed", String(on));
        if (on) filter.focus(); else { filter.value = ""; applyFilter(); }
      } });
    nav.appendChild(el("div", { class: "k-asst-nav-acts" }, [
      el("button", { class: "k-asst-new", type: "button", "aria-label": "New conversation", title: "New conversation",
        onclick: function () { newConversation(); KOS.show("assistant", { tab: "chat" }); } }, [
        el("span", { "aria-hidden": "true", text: "＋" }), el("span", { class: "k-asst-new-l", text: " New chat" })
      ]),
      searchBtn,
      collapse
    ]));
    nav.appendChild(filter);

    var tablist = el("div", { class: "k-asst-tabs", role: "tablist", "aria-orientation": "vertical", "aria-label": "Kurenai Assistant pages" });
    [["Conversation", PAGE_TABS.slice(0, 2)], ["Control", PAGE_TABS.slice(2)]].forEach(function (group) {
      tablist.appendChild(el("div", { class: "k-asst-nav-label", role: "presentation", text: group[0] }));
      group[1].forEach(function (tab) {
        var selected = tab[3] === active;
        var btn = el("button", { class: "k-asst-tab", "data-ui": "ui.tab", type: "button", "data-tab": tab[3],
          role: "tab", "aria-selected": selected ? "true" : "false", "aria-controls": "asst-page-panel",
          tabindex: selected ? "0" : "-1", "aria-label": tab[0], title: tab[0],
          onclick: function () { KOS.show(tab[1], tab[2]); } }, [
          el("span", { class: "k-asst-tab-tile", lang: "ja", "aria-hidden": "true", text: TAB_KANJI[tab[3]] || "·" }),
          el("span", { class: "k-asst-tab-l", text: tab[0] }),
          tab[3] === "activity" && S.pending ? el("span", { class: "k-asst-tab-dot", title: "An action is waiting for your approval" }) : null
        ].filter(Boolean));
        if (selected) KOS.ui.state(btn, "active", true);
        tablist.appendChild(btn);
      });
    });
    nav.appendChild(tablist);

    /* projects */
    var projectList = el("div", { class: "k-asst-list" });
    var addProject = el("button", { class: "k-asst-add", "data-ui": "asst.nav-add", type: "button", text: "＋", "aria-label": "Create project", title: "Create project" });
    addProject.addEventListener("click", function () {
      if (projectList.querySelector("[data-ui~='asst.project-new']")) return;
      var input = el("input", { class: "k-input k-asst-filter", "data-ui": "asst.project-new", type: "text", maxlength: "48", placeholder: "Project name", "aria-label": "Project name" });
      function commit() {
        if (!createProject(input.value)) return;
        KOS.show("assistant", { tab: active });
      }
      input.addEventListener("keydown", function (e) { if (e.key === "Enter") commit(); else if (e.key === "Escape") input.remove(); });
      input.addEventListener("blur", function () { if (!input.value.trim()) input.remove(); });
      projectList.insertBefore(input, projectList.firstChild); input.focus();
    });
    nav.appendChild(el("div", { class: "k-asst-nav-sec" }, [
      el("div", { class: "k-asst-nav-label" }, [el("span", { text: "Projects" }), addProject]), projectList
    ]));
    var projectCounts = {};
    Object.keys(ws.conversationProjects).forEach(function (key) {
      var id = ws.conversationProjects[key]; projectCounts[id] = (projectCounts[id] || 0) + 1;
    });
    ws.projects.forEach(function (project, pi) {
      var current = ws.projectFilter === project.id;
      projectList.appendChild(el("div", { class: "k-asst-proj", "data-state": current ? "active" : null }, [
        el("button", { class: "k-asst-proj-open", "data-ui": "asst.project-open", type: "button", "aria-pressed": current ? "true" : "false",
          title: current ? "Show every chat" : "Show this project's chats", onclick: function () {
            var w = workspaceCfg(true);
            w.projectFilter = current ? "" : project.id; saveWorkspace(); KOS.show("assistant", { tab: active });
          } }, [el("span", { class: "k-asst-proj-dot", "data-hue": String(pi % 7), "aria-hidden": "true" }),
          el("span", { class: "k-asst-proj-name", text: project.name }),
          projectCounts[project.id] ? el("small", { class: "k-asst-count", text: String(projectCounts[project.id]) }) : null].filter(Boolean)),
        el("button", { class: "k-asst-x", type: "button", text: "×", "aria-label": "Delete project " + project.name,
          onclick: function () { removeProject(project); } })
      ]));
    });
    if (!ws.projects.length) projectList.appendChild(el("p", { class: "k-asst-nav-empty", text: "Group chats by subject or goal." }));

    /* recent chats */
    var recents = el("div", { class: "k-asst-list" }, [el("p", { class: "k-asst-nav-empty", text: canPersist() ? "Loading…" : "Sign in to keep recent chats." })]);
    nav.appendChild(el("div", { class: "k-asst-nav-sec k-asst-recents" }, [
      el("div", { class: "k-asst-nav-label" }, [el("span", { text: ws.projectFilter ? "Project chats" : "Recent" })]), recents
    ]));
    function recentRow(o) {
      return el("div", { class: "k-asst-recent", "data-state": o.current ? "current" : null, "data-title": o.title.toLowerCase() }, [
        el("button", { class: "k-asst-recent-open", type: "button", title: o.title, onclick: o.open }, [
          o.pinned ? el("span", { class: "k-asst-recent-pin", "aria-hidden": "true", text: "◆" }) : null,
          el("span", { class: "k-asst-recent-t", text: o.title }),
          o.meta ? el("span", { class: "k-asst-recent-m", text: o.meta }) : null
        ].filter(Boolean)),
        el("button", { class: "k-asst-x", type: "button", text: o.pinned ? "◆" : "◇",
          "aria-label": o.pinLabel, "aria-pressed": o.pinned ? "true" : "false", title: o.pinned ? "Unpin" : "Pin",
          onclick: o.pin })
      ]);
    }
    function applyFilter() {
      var q = filter.value.trim().toLowerCase();
      recents.querySelectorAll("[data-title]").forEach(function (r) { r.hidden = !!q && r.getAttribute("data-title").indexOf(q) === -1; });
    }
    filter.addEventListener("input", applyFilter);
    if (canPersist()) KOS.ai.convo.list(function (err, rows) {
      if (!recents.isConnected) return;
      recents.innerHTML = "";
      if (err) { recents.appendChild(el("p", { class: "k-asst-nav-empty", text: "History unavailable." })); return; }
      if (ws.projectFilter) rows = rows.filter(function (c) { return projectFor(c.id) === ws.projectFilter; });
      rows.sort(function (a, b) {
        var ap = ws.pins.indexOf(a.id) >= 0, bp = ws.pins.indexOf(b.id) >= 0;
        return ap === bp ? 0 : ap ? -1 : 1;
      });
      rows.slice(0, 8).forEach(function (c) {
        var pinned = ws.pins.indexOf(c.id) >= 0;
        recents.appendChild(recentRow({ title: c.title, current: c.id === S.conversationId, pinned: pinned,
          meta: relTime(c.updatedAt),
          open: function () { openConversation(c.id, function (e) { if (!e) KOS.show("assistant", { tab: "chat" }); }); },
          pinLabel: (pinned ? "Unpin " : "Pin ") + c.title,
          pin: function () { togglePin(c.id); KOS.show("assistant", { tab: active }); } }));
      });
      if (!rows.length) recents.appendChild(el("p", { class: "k-asst-nav-empty", text: ws.projectFilter ? "No chats in this project yet." : "No conversations yet." }));
      applyFilter();
    });
    else {
      recents.innerHTML = "";
      var localPinned = ws.pins.indexOf(S.localId) >= 0;
      recents.appendChild(recentRow({ title: S.conversationTitle || "Current conversation", current: true, pinned: localPinned,
        meta: projectFor(S.localId) ? "this device" : "",
        open: function () { KOS.show("assistant", { tab: "chat" }); },
        pinLabel: localPinned ? "Unpin current conversation" : "Pin current conversation",
        pin: function () { togglePin(S.localId); KOS.show("assistant", { tab: active }); } }));
      recents.appendChild(el("p", { class: "k-asst-nav-empty", text: "Sign in to keep more chats across sessions." }));
    }

    /* the routing, pinned at the foot: which model answers what */
    var routing = routingNow(), seen = {}, foot = el("div", { class: "k-asst-models", "aria-label": "Model routing" });
    Object.keys(routing).forEach(function (cat) {
      var r = routing[cat];
      if (!r || seen[r.provider]) return;
      seen[r.provider] = true;
      foot.appendChild(el("div", { class: "k-asst-model", "data-provider": r.provider }, [
        el("span", { class: "k-asst-model-dot", "aria-hidden": "true" }),
        el("span", { text: providerName(r.provider) + (r.provider === "ollama" ? " · local" : "") }),
        el("span", { class: "k-asst-model-id", text: r.model ? clampText(r.model, 18) : "no model set" })
      ]));
    });
    if (foot.children.length) nav.appendChild(foot);

    nav.addEventListener("keydown", function (e) {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End"].indexOf(e.key) < 0) return;
      var tabs = Array.prototype.slice.call(nav.querySelectorAll("[data-ui~='ui.tab']"));
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

  /* one intro for the control pages: kicker, heading, one line */
  function sectionIntro(body, kicker, title, copy) {
    body.appendChild(el("header", { class: "k-asst-head" }, [
      el("div", { class: "k-kicker", text: kicker }),
      el("h2", { class: "k-asst-head-h", text: title }),
      copy ? el("p", { class: "k-asst-head-p", text: copy }) : null
    ].filter(Boolean)));
  }
  function card(title, meta, kids, extra) {
    return el("section", { class: "k-card k-asst-block", "aria-label": title }, [
      el("div", { class: "k-card-head" }, [
        el("span", { class: "k-card-title", text: title }),
        meta ? el("span", { class: "k-card-meta", text: meta }) : null,
        extra ? el("span", { class: "k-asst-block-end" }, [extra]) : null
      ].filter(Boolean))
    ].concat(kids));
  }

  function pageChat(body) {
    var ws = workspaceCfg();
    var currentPinned = ws.pins.indexOf(conversationKey()) >= 0;
    var route = routingNow().complex;
    var conversation = el("div", { class: "k-asst-chatcol", "data-ui": "asst.chat-main" }, [
      el("div", { class: "k-asst-toolbar" }, [
        el("h2", { class: "k-asst-title", text: S.conversationTitle || "A fresh thread" }),
        projectPicker(),
        el("span", { class: "k-asst-toolbar-end" }, [
          el("button", { class: "k-asst-chip-btn", type: "button", text: currentPinned ? "◆ Pinned" : "◇ Pin",
            "aria-label": currentPinned ? "Unpin current conversation" : "Pin current conversation", title: currentPinned ? "Unpin conversation" : "Pin conversation",
            "aria-pressed": currentPinned ? "true" : "false",
            onclick: function () { togglePin(); KOS.show("assistant", { tab: "chat" }); } }),
          route ? el("span", { class: "k-chip", "data-tone": "muted", title: "Each kind of request is routed to its own model (Settings)",
            text: providerName(route.provider) + " · auto" }) : null,
          el("button", { class: "k-iconbtn k-iconbtn--sm", type: "button", text: "＋", "aria-label": "New conversation", title: "New conversation", onclick: function () {
            newConversation(); KOS.show("assistant", { tab: "chat" });
          } })
        ].filter(Boolean))
      ]),
      buildThreadArea(false)
    ]);
    var presence = el("aside", { class: "k-asst-presence", "data-ui": "asst.presence", "aria-label": "Kurenai status" }, [
      el("div", { class: "k-asst-presence-head" }, [
        el("span", { class: "k-asst-live-dot", "aria-hidden": "true" }),
        el("b", { text: "Kurenai is with you" }),
        el("button", { class: "k-asst-chip-btn", type: "button", text: ws.characterAudio.enabled ? "♪ Voice on" : "Voice off",
          "aria-pressed": ws.characterAudio.enabled ? "true" : "false", onclick: function () {
            var w = workspaceCfg(true);
            w.characterAudio.enabled = !w.characterAudio.enabled; saveWorkspace();
            if (w.characterAudio.enabled) playStateCue("idle", true); else stopAudio();
            KOS.show("assistant", { tab: "chat" });
          } })
      ]),
      el("div", { class: "k-asst-stage" }, [mascotNode("large")]),
      el("div", { class: "k-asst-note" }, [el("p", { text: "Hover, or tap her flower, tablet or portrait." }),
        el("p", { class: "k-asst-muted", text: canPersist() ? "Cloud history is on for this session." : "Signed out · this conversation stays on this device." })])
    ]);
    body.appendChild(conversation);
    body.appendChild(presence);
  }

  function pageHistory(body) {
    sectionIntro(body, "Conversation", "History", "Return to an earlier thread; the drawer and this page share it.");
    if (!canPersist()) {
      body.appendChild(KOS.ui.emptyState({ mark: "歴", title: "History is kept after cloud sign-in",
        body: "The current conversation still works on this device; it is simply not added to the cloud archive.",
        action: el("button", { class: "k-btn", type: "button", text: "Open Account & Cloud Sync", onclick: function () { KOS.show("mediasync"); } }) }));
      return;
    }
    var list = el("div", { class: "k-card k-asst-list-card", "data-ui": "asst.history" });
    body.appendChild(list);
    function render() {
      list.innerHTML = "";
      list.appendChild(el("p", { class: "k-asst-muted", text: "Loading…" }));
      KOS.ai.convo.list(function (err, rows) {
        list.innerHTML = "";
        if (err) { list.appendChild(el("p", { class: "k-asst-error-line", text: "Couldn't load history: " + err.message })); return; }
        if (!rows.length) { list.appendChild(el("p", { class: "k-asst-muted", text: "No conversations yet — start one in Chat." })); return; }
        rows.forEach(function (c) {
          var titleSpan = el("b", { class: "k-asst-line-t", text: c.title });
          list.appendChild(el("div", { class: "k-asst-line", "data-ui": "asst.history-row", "data-state": c.id === S.conversationId ? "current" : null }, [
            el("span", { class: "k-asst-line-mark", lang: "ja", "aria-hidden": "true", text: "話" }),
            el("div", { class: "k-asst-line-txt" }, [
              titleSpan,
              el("span", { class: "k-asst-line-m", text: c.updatedAt ? new Date(c.updatedAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "" })
            ]),
            el("button", { class: "k-link", type: "button", text: "Open", onclick: function () {
              openConversation(c.id, function (err2) { if (!err2) KOS.show("assistant", { tab: "chat" }); });
            } }),
            el("button", { class: "k-link", type: "button", text: "Rename", "aria-label": "Rename conversation", onclick: function () {
              var input = el("input", { type: "text", class: "k-input", value: c.title, "aria-label": "New title" });
              var row = el("div", { class: "k-asst-inline-edit", "data-ui": "asst.history-rename" }, [input,
                el("button", { class: "k-btn k-btn--sm", type: "button", text: "Save", onclick: function () {
                  KOS.ai.convo.rename(c.id, input.value, function (err2) {
                    if (err2) { KOS.ui.toast(err2.message, true); return; }
                    if (c.id === S.conversationId) S.conversationTitle = input.value;
                    render();
                  });
                } })]);
              titleSpan.replaceWith(row);
              input.focus();
            } }),
            el("button", { class: "k-link k-asst-danger", type: "button", text: "Delete", "aria-label": "Delete conversation", onclick: function () {
              KOS.ui.confirm({ title: "Delete this conversation?", danger: true, confirm: "Delete",
                body: "“" + c.title + "” and its messages are removed from history. Actions it ran are NOT undone (see Activity)." },
                function () {
                  KOS.ai.convo.remove(c.id, function (err2) {
                    if (err2) { KOS.ui.toast(err2.message, true); return; }
                    var ws = workspaceCfg(true);
                    delete ws.conversationProjects[c.id];
                    ws.pins = ws.pins.filter(function (id) { return id !== c.id; });
                    saveWorkspace();
                    if (c.id === S.conversationId) newConversation();
                    render();
                  });
                });
            } })
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
    /* the legend under the table says which is local and which is billed */
    var PROVIDERS = [["ollama", "Ollama"], ["gemini", "Gemini"], ["deepseek", "DeepSeek"]];
    var cfg = KOS.ai.config();
    sectionIntro(body, "Control room", "Settings", "Which model answers each kind of request. Safety tiers and approvals do not change with the provider.");

    /* model control: routing by task type */
    var health = el("div", { class: "k-asst-health", role: "status" });
    var checkBtn = el("button", { class: "k-btn k-btn--sm", type: "button", text: "Check availability & usage", onclick: function () {
      health.innerHTML = "";
      health.appendChild(el("p", { class: "k-asst-muted", text: "Checking…" }));
      var out = [];
      var todo = 3;
      ["ollama", "gemini", "deepseek"].forEach(function (p) {
        KOS.ai.health(p, function (e, h) {
          out.push(h || { provider: p, available: false, reason: "no answer" });
          if (--todo === 0) {
            health.innerHTML = "";
            out.forEach(function (h2) {
              health.appendChild(el("p", { class: "k-asst-health-line", "data-ok": h2.available ? "" : null }, [
                el("span", { class: "k-asst-model-dot", "aria-hidden": "true" }),
                el("b", { text: providerName(h2.provider) + " " }),
                h2.available
                  ? "available" + (h2.used != null ? " · " + h2.used + "/" + (h2.cap || "?") + " requests today" : "") +
                    (h2.models ? " · models: " + h2.models.slice(0, 4).join(", ") : "")
                  : "unavailable · " + (h2.reason || "unknown")
              ]));
            });
          }
        });
      });
    } });
    var grid = el("div", { class: "k-asst-routes", role: "table", "aria-label": "Routing by task type" }, [
      el("div", { class: "k-asst-routes-head", role: "row" }, ["Task", "Primary provider", "Model", "Fallback"].map(function (h) {
        return el("span", { role: "columnheader", text: h });
      }))
    ]);
    CATS.forEach(function (cat) {
      var route = cfg.routing[cat[0]];
      var provSel = el("select", { class: "k-input", "aria-label": cat[1] + " provider" }, PROVIDERS.map(function (p) {
        var o = el("option", { value: p[0], text: p[1] });
        if (route.provider === p[0]) o.selected = true;
        return o;
      }));
      var modelIn = el("input", { type: "text", class: "k-input", value: route.model || "",
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
      var fbSel = el("select", { class: "k-input", "aria-label": cat[1] + " fallback" }, [
        el("option", { value: "", text: "No fallback" })
      ].concat(PROVIDERS.map(function (p) {
        var o = el("option", { value: p[0], text: "Fall back to " + providerName(p[0]) });
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
      grid.appendChild(el("div", { class: "k-asst-route", "data-ui": "asst.route-row", role: "row" }, [
        el("span", { class: "k-asst-route-k", role: "rowheader" }, [el("b", { text: cat[1] }), el("span", { class: "k-asst-id", text: cat[0] + " requests" })]),
        el("span", { role: "cell" }, [provSel]),
        el("span", { role: "cell" }, [modelIn]),
        el("span", { role: "cell" }, [fbSel])
      ]));
    });
    body.appendChild(card("Model control", "routing by task type", [
      grid,
      el("div", { class: "k-asst-legend" }, [
        el("span", { "data-provider": "ollama" }, [el("span", { class: "k-asst-model-dot", "aria-hidden": "true" }), el("b", { text: "Ollama" }), " local, free"]),
        el("span", { "data-provider": "gemini" }, [el("span", { class: "k-asst-model-dot", "aria-hidden": "true" }), el("b", { text: "Gemini" }), " online, billable"]),
        el("span", { "data-provider": "deepseek" }, [el("span", { class: "k-asst-model-dot", "aria-hidden": "true" }), el("b", { text: "DeepSeek" }), " online, billable"])
      ]),
      el("p", { class: "k-asst-muted", text: "Online providers use your cloud account and daily cap. API keys live only on the server and are never shown here." }),
      health
    ], checkBtn));

    /* the local connection and the voice, side by side */
    var ollamaIn = el("input", { type: "text", class: "k-input k-asst-mono", value: cfg.ollama.url, "aria-label": "Ollama endpoint" });
    /* same reasoning as the model input — persist on input so a typed
       endpoint survives tab navigation */
    ollamaIn.addEventListener("input", function () { KOS.ai.setOllamaUrl(ollamaIn.value); });
    ollamaIn.addEventListener("change", function () { KOS.ai.setOllamaUrl(ollamaIn.value); });
    var local = card("Local connection", null, [
      el("label", { class: "k-field", "data-ui": "asst.route-row" }, [el("span", { class: "k-field-label", text: "Ollama endpoint URL" }), ollamaIn]),
      el("p", { class: "k-asst-muted", text: "Start Ollama with OLLAMA_ORIGINS allowing this app's origin." })
    ]);

    var ws = workspaceCfg();
    var voiceToggle = el("input", { type: "checkbox", role: "switch", class: "k-switch", "aria-label": "Play short state and interaction lines" });
    voiceToggle.checked = ws.characterAudio.enabled;
    var volume = el("input", { type: "range", class: "k-asst-range", min: "0", max: "100", step: "1", value: String(Math.round(ws.characterAudio.volume * 100)),
      "aria-label": "Kurenai voice volume" });
    voiceToggle.addEventListener("change", function () {
      var w = workspaceCfg(true);
      w.characterAudio.enabled = voiceToggle.checked; saveWorkspace();
      if (w.characterAudio.enabled) playStateCue("idle", true); else stopAudio();
    });
    volume.addEventListener("input", function () {
      var w = workspaceCfg(true);
      w.characterAudio.volume = Math.max(0, Math.min(1, Number(volume.value) / 100));
      if (audioEl) audioEl.volume = w.characterAudio.volume;
      saveWorkspace();
    });
    var voice = card("Kurenai voice", null, [
      el("label", { class: "k-asst-switch-row", "data-ui": "asst.voice-row" }, [voiceToggle, el("span", { text: "Play short state and interaction lines" })]),
      el("div", { class: "k-asst-volume" }, [
        el("span", { class: "k-asst-muted", text: "Volume" }), volume,
        el("button", { class: "k-btn k-btn--sm", type: "button", text: "▶ Preview", onclick: function () { playStateCue("working", true); } })
      ]),
      el("p", { class: "k-asst-muted" }, [
        document.createTextNode("22 local clips, reaction lines only: it never narrates answers and sends nothing to a voice provider. Generated with "),
        el("a", { class: "k-link", href: "https://elevenlabs.io", target: "_blank", rel: "noopener noreferrer", text: "ElevenLabs" }),
        document.createTextNode(" · free-tier non-commercial use.")
      ])
    ]);
    body.appendChild(el("div", { class: "k-asst-pair" }, [local, voice]));
  }

  function pageMemory(body) {
    sectionIntro(body, "User-controlled context", "Memory", "What Kurenai keeps between conversations. You can edit or forget any of it.");
    if (!KOS.ai.memory.available().persist) {
      body.appendChild(KOS.ui.emptyState({ mark: "憶", title: "Memory needs a cloud sign-in",
        body: "Archive → Account & Cloud Sync. Every memory is one you asked for or approved; secrets and keys are always refused." }));
      return;
    }
    var list = el("div", { class: "k-card k-asst-list-card", "data-ui": "asst.memory" });
    var addIn = el("textarea", { class: "k-asst-input", rows: "1", placeholder: "Add a note for Kurenai to remember…", "aria-label": "New memory" });
    body.appendChild(el("div", { class: "k-asst-composer", "data-ui": "asst.memory-add" }, [addIn,
      el("button", { class: "k-btn k-btn--primary", type: "button", text: "＋ New memory", onclick: function () {
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
        if (err) { list.appendChild(el("p", { class: "k-asst-error-line", text: err.message })); return; }
        if (!rows.length) { list.appendChild(el("p", { class: "k-asst-muted", text: "No memories yet. Every memory is one you asked for or approved." })); return; }
        rows.forEach(function (m) {
          var content = el("div", { class: "k-asst-line-t", text: m.content });
          list.appendChild(el("div", { class: "k-asst-line", "data-ui": "asst.memory-row" }, [
            el("span", { class: "k-asst-line-mark", "aria-hidden": "true", text: "◇" }),
            el("div", { class: "k-asst-line-txt" }, [
              content,
              el("span", { class: "k-asst-line-m", text: (m.origin === "user" ? "you asked" : "you approved") +
                (m.updatedAt ? " · " + new Date(m.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "") })
            ]),
            el("button", { class: "k-link", type: "button", text: "Edit", "aria-label": "Edit memory", onclick: function () {
              var ta = el("textarea", { class: "k-input", rows: "2" }); ta.value = m.content;
              var save = el("button", { class: "k-btn k-btn--sm", type: "button", text: "Save", onclick: function () {
                KOS.ai.memory.update(m.id, ta.value, function (err2) {
                  if (err2) { KOS.ui.toast(err2.message, true); return; }
                  render();
                });
              } });
              content.replaceWith(el("div", { class: "k-asst-inline-edit", "data-ui": "asst.memory-edit" }, [ta, save]));
              ta.focus();
            } }),
            el("button", { class: "k-link k-asst-danger", type: "button", text: "Forget", "aria-label": "Delete memory", onclick: function () {
              KOS.ui.confirm({ title: "Forget this?", danger: true, confirm: "Forget",
                body: "“" + clampText(m.content, 120) + "” is removed permanently." },
                function () { KOS.ai.memory.remove(m.id, function () { render(); }); });
            } })
          ]));
        });
      });
    }
    render();
  }

  var TIER_TONE = { read: "teal", reversible: "amber", consequential: "crimson" };
  function tierChip(tier) {
    return el("span", { class: "k-chip", "data-tone": TIER_TONE[tier] || "teal", text: tierLabel(tier) });
  }

  /* Permissions (frame 13e): grouped by area as in aitools.js, one open;
     each group counts its tiers and its changed rows. A consequential row
     can be blocked but never loosened — it always asks. */
  function pagePermissions(body) {
    sectionIntro(body, "Autonomy controls", "Permissions", "Decide what Kurenai may read or do automatically. Consequential actions always keep their approval floor.");
    var tools = KOS.ai.tools.list();
    var perTool = function () { return (KOS.ai.config().permissions || { perTool: {} }).perTool || {}; };
    var cats = {};
    tools.forEach(function (t) { (cats[t.category] = cats[t.category] || []).push(t); });
    var areas = Object.keys(cats).sort();
    var filterIn = el("input", { class: "k-input k-asst-filter", type: "search", placeholder: "⌕ Filter tools", "aria-label": "Filter tools" });
    var reset = el("button", { class: "k-btn k-btn--sm", type: "button", text: "Reset to defaults", onclick: function () {
      var changed = Object.keys(perTool()).filter(function (n) { return perTool()[n]; });
      if (!changed.length) { KOS.ui.toast("Every tool is already on its default."); return; }
      KOS.ui.confirm({ title: "Reset every permission?", confirm: "Reset " + changed.length,
        body: changed.length + " tool" + (changed.length === 1 ? " goes" : "s go") + " back to its default. Consequential actions keep asking either way." }, function () {
        changed.forEach(function (n) { KOS.ai.orchestrator.setPermission(n, null); });
        KOS.show("assistant", { tab: "permissions" });
      });
    } });
    body.appendChild(el("div", { class: "k-asst-permbar" }, [
      tierChip("read"), tierChip("reversible"), tierChip("consequential"),
      el("span", { class: "k-asst-muted", text: tools.length + " tools in " + areas.length + " areas" }),
      el("span", { class: "k-asst-permbar-end" }, [filterIn, reset])
    ]));
    var groups = el("div", { class: "k-asst-perm-groups" });
    areas.forEach(function (cat, catIndex) {
      var rows = el("div", { class: "k-asst-perm-rows" });
      var tiers = { read: 0, reversible: 0, consequential: 0 }, changed = 0;
      cats[cat].forEach(function (t) {
        tiers[t.tier] = (tiers[t.tier] || 0) + 1;
        var userMode = perTool()[t.name] || "";
        if (userMode) changed++;
        var opts = [];
        if (t.tier !== "consequential") opts.push(["", "Default · " + (t.tier === "read" ? "runs freely" : "runs, undoable")], ["ask", "Ask first"]);
        else opts.push(["", "Always asks (fixed)"]);
        opts.push(["never", "Blocked"]);
        var sel = el("select", { class: "k-input", "aria-label": "Permission for " + t.name }, opts.map(function (o) {
          var opt = el("option", { value: o[0], text: o[1] });
          if (userMode === o[0]) opt.selected = true;
          return opt;
        }));
        sel.addEventListener("change", function () {
          var r = KOS.ai.orchestrator.setPermission(t.name, sel.value === "" ? null : sel.value);
          if (!r.ok) { KOS.ui.toast(r.msg, true); sel.value = ""; }
        });
        rows.appendChild(el("div", { class: "k-asst-perm", "data-ui": "asst.perm-row", "data-name": (toolDisplayName(t.name) + " " + t.name).toLowerCase() }, [
          el("div", { class: "k-asst-perm-txt" }, [
            el("div", { class: "k-asst-perm-t", text: toolDisplayName(t.name) }),
            el("div", { class: "k-asst-perm-d", text: t.desc || "KurenaiOS assistant action" }),
            el("code", { class: "k-asst-id", "data-ui": "asst.technical-id", text: t.name })
          ]),
          tierChip(t.tier),
          sel
        ]));
      });
      var counts = el("span", { class: "k-asst-tiers", "aria-label": "By tier" });
      ["read", "reversible", "consequential"].forEach(function (tier) {
        if (tiers[tier]) counts.appendChild(el("span", { "data-tone": TIER_TONE[tier], title: tierLabel(tier) }, [
          el("span", { class: "k-asst-model-dot", "aria-hidden": "true" }), String(tiers[tier])
        ]));
      });
      var details = el("details", { class: "k-asst-perm-group", "data-ui": "asst.perm-group" }, [
        el("summary", {}, [
          el("span", { class: "k-asst-perm-tile", lang: "ja", "aria-hidden": "true", text: AREA_KANJI[cat] || "·" }),
          el("span", { class: "k-asst-perm-area", text: titleWords(cat) }),
          el("span", { class: "k-asst-muted", text: cats[cat].length + " tool" + (cats[cat].length === 1 ? "" : "s") }),
          counts,
          changed ? el("span", { class: "k-chip", "data-tone": "bloom", text: changed + " changed" }) : null,
          el("span", { class: "k-asst-chev", "aria-hidden": "true" })
        ].filter(Boolean)),
        rows
      ]);
      if (catIndex === 0) details.open = true;
      groups.appendChild(details);
    });
    body.appendChild(groups);
    filterIn.addEventListener("input", function () {
      var q = filterIn.value.trim().toLowerCase();
      groups.querySelectorAll("[data-ui~='asst.perm-group']").forEach(function (g) {
        var hits = 0;
        g.querySelectorAll("[data-ui~='asst.perm-row']").forEach(function (r) {
          var on = !q || r.getAttribute("data-name").indexOf(q) !== -1;
          r.hidden = !on; if (on) hits++;
        });
        g.hidden = !!q && !hits;
        if (q && hits) g.open = true;
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

  /* Activity (frame 13f): the record, read-only. Each row is when, what
     happened, the action and its target, its tier and the outcome; the
     raw tool id and status stay beside it for diagnosis. */
  /* the orchestrator's audit statuses (aiorchestrator.js auditStatus) */
  var AUDIT_PHASE = { proposed: "Proposed", awaiting_confirmation: "Proposed", confirmed: "Approved",
    executed: "Ran", rejected: "Declined", cancelled: "Cancelled", failed: "Failed" };
  var AUDIT_OUTCOME = { proposed: ["Started", "muted"], awaiting_confirmation: ["Waiting", "amber"],
    confirmed: ["Running", "teal"], executed: ["Done", "green"], rejected: ["Declined", "muted"],
    cancelled: ["Cancelled", "muted"], failed: ["Failed", "red"] };
  var AUDIT_FILTERS = [["all", "All"], ["waiting", "Waiting"], ["ran", "Ran"], ["declined", "Declined"], ["failed", "Failed"]];
  function auditBucket(status) {
    return status === "awaiting_confirmation" ? "waiting" : status === "executed" || status === "confirmed" ? "ran"
      : status === "rejected" || status === "cancelled" ? "declined" : status === "failed" ? "failed" : "other";
  }
  function pageActivity(body) {
    sectionIntro(body, "Immutable record", "Activity", "Every proposed or executed action and its real outcome. Deliberately read-only, so the record stays honest.");
    var areaOf = {};
    KOS.ai.tools.list().forEach(function (t) { areaOf[t.name] = t.category; });
    var status = "all", area = "all", rows = [];
    var bar = el("div", { class: "k-asst-permbar" });
    var count = el("span", { class: "k-asst-permbar-end k-asst-muted", role: "status" });
    var list = el("div", { class: "k-card k-asst-list-card", "data-ui": "asst.audit" });
    body.appendChild(bar);
    body.appendChild(list);
    function seg(items, cur, pick, label) {
      return KOS.ui.tabs(items.map(function (it) {
        return { label: it[1], active: it[0] === cur, onSelect: function () { pick(it[0]); } };
      }), { variant: "card", label: label });
    }
    function paintBar() {
      bar.innerHTML = "";
      var waiting = rows.filter(function (r) { return auditBucket(r.status || "proposed") === "waiting"; }).length;
      bar.appendChild(seg(AUDIT_FILTERS.map(function (f) { return f[0] === "waiting" && waiting ? [f[0], f[1] + " · " + waiting] : f; }),
        status, function (v) { status = v; paintBar(); draw(); }, "Filter by outcome"));
      var areas = Object.keys(rows.reduce(function (a, r) { if (areaOf[r.tool]) a[areaOf[r.tool]] = 1; return a; }, {})).sort();
      if (areas.length > 1) bar.appendChild(seg([["all", "All areas"]].concat(areas.map(function (a) { return [a, titleWords(a)]; })),
        area, function (v) { area = v; paintBar(); draw(); }, "Filter by area"));
      bar.appendChild(count);
    }
    function draw() {
      list.innerHTML = "";
      var shown = rows.filter(function (r) {
        return (status === "all" || auditBucket(r.status || "proposed") === status) && (area === "all" || areaOf[r.tool] === area);
      });
      count.textContent = rows.length ? (shown.length === rows.length ? rows.length + " action" + (rows.length === 1 ? "" : "s") : shown.length + " of " + rows.length) : "";
      if (!shown.length) { list.appendChild(el("p", { class: "k-asst-muted", text: rows.length ? "Nothing matches these filters." : "No assistant actions yet." })); return; }
      shown.forEach(function (r) {
        var st = r.status || "proposed", out = AUDIT_OUTCOME[st] || [titleWords(st), "muted"];
        var when = r.created_at ? new Date(r.created_at) : null;
        var detail = [r.target, r.result_summary ? clampText(r.result_summary, 120) : null].filter(Boolean).join(" · ");
        list.appendChild(el("div", { class: "k-asst-audit", "data-ui": "asst.audit-row", "data-status": st }, [
          el("time", { class: "k-asst-audit-when", datetime: r.created_at || null,
            text: when ? (when.toDateString() === new Date().toDateString() ? when.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
              : when.toLocaleDateString("en-GB", { day: "numeric", month: "short" })) : "" }),
          el("span", { class: "k-asst-audit-phase", text: AUDIT_PHASE[st] || titleWords(st) }),
          el("div", { class: "k-asst-audit-txt" }, [
            el("div", { class: "k-asst-audit-t", text: toolDisplayName(r.tool) }),
            detail ? el("div", { class: "k-asst-audit-d", text: detail }) : null,
            r.error_summary ? el("div", { class: "k-asst-error-line", text: clampText(r.error_summary, 120) }) : null,
            el("code", { class: "k-asst-id", "data-ui": "asst.technical-id", text: r.tool + " · " + st })
          ].filter(Boolean)),
          tierChip(r.tier || "read"),
          el("span", { class: "k-asst-outcome", "data-tone": out[1] }, [el("span", { class: "k-asst-model-dot", "aria-hidden": "true" }), out[0]])
        ]));
      });
    }
    list.appendChild(el("p", { class: "k-asst-muted", text: "Loading…" }));
    loadAudit(function (err, got, source) {
      list.innerHTML = "";
      if (err) { list.appendChild(el("p", { class: "k-asst-error-line", text: "Couldn't load the action history: " + err.message })); return; }
      rows = got || [];
      if (source === "queued") body.insertBefore(el("p", { class: "k-asst-muted", text: "Signed out · showing actions queued on this device; they upload on sign-in." }), bar);
      paintBar();
      draw();
    });
  }

  KOS.views.assistant = function (main, arg) {
    KOS.shell.tree("none");
    KOS.shell.bleed(true);
    var tab = (arg && arg.tab) || "chat";
    if (!PAGE_TABS.some(function (t) { return t[3] === tab; })) tab = "chat";
    var tabs = assistantTabs(tab);
    var body = el("section", { id: "asst-page-panel", class: "k-asst-page", "data-ui": "asst.page", "data-tab": tab,
      role: "tabpanel", "aria-label": "Assistant " + tab });
    var shell = el("div", { class: "k-asst", "data-ui": "asst.shell" }, [tabs, body]);
    if (workspaceCfg().sidebarCollapsed) KOS.ui.state(shell, "is-side-collapsed", true);
    main.appendChild(shell);
    if (tab === "chat") pageChat(body);
    else if (tab === "history") pageHistory(body);
    else if (tab === "settings") pageSettings(body);
    else if (tab === "memory") pageMemory(body);
    else if (tab === "permissions") pagePermissions(body);
    else if (tab === "activity") pageActivity(body);
    var heading = document.getElementById("asst-page-title");
    window.requestAnimationFrame(function () { if (heading && heading.isConnected) heading.focus({ preventScroll: true }); });
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
    character: {
      setLifecycle: setLifecycle,
      react: react,
      stopAudio: stopAudio,
      installRenderer: installRenderer,
      removeRenderer: removeRenderer,
      rendererStatus: rendererStatus
    },
    toolDisplayName: toolDisplayName,
    toolActivity: toolActivity,
    renderMarkdown: assistantRichText,
    loadAudit: loadAudit,
    state: function () { return S; },
    MASCOT_STATES: MASCOT_STATES,
    CHARACTER_REACTIONS: CHARACTER_REACTIONS,
    _config: function (o) {
      o = o || {};
      if ("auditReader" in o) _auditReader = o.auditReader;
      if ("now" in o) nowFn = o.now || function () { return Date.now(); };
      if ("audioFactory" in o) { stopAudio(); audioEl = null; audioFactory = o.audioFactory; }
      if (o.resetCharacter) {
        tapCooldownAt = -Infinity; lastHoverAt = -Infinity; reactionIndexes = {}; lastLifecycleAudioAt = {};
      }
    }
  };
})();
