/* Kurenai OS — Phase 2 Live2D binding for the assistant renderer seam.
 *
 * WHAT THIS FILE IS: the adapter that turns lifecycle/reaction commands
 * from KOS.assistant.character into Cubism motion playback. It is OUR
 * code. It contains no Live2D SDK, no Core binary, no .moc3 and no model
 * texture, and it never downloads one.
 *
 * RELEASE GATE (art-source/assistant/live2d/rig-contract.json):
 * publicDeployment is false until Live2D answers the AI/chatbot
 * publication question in LICENSE_REQUEST.md. Because js/ ships wholesale
 * to Pages, this adapter is written to be INERT BY CONSTRUCTION: enable()
 * refuses unless a Cubism runtime has actually been installed on the page
 * AND the model manifest resolves. On the deployed build neither is true,
 * so the Phase 1 static PNGs remain the only thing that renders.
 *
 * OWNERSHIP: the JavaScript controller stays the sole lifecycle authority
 * (rig-contract runtime.controllerOwnsLifecycle). This adapter is
 * write-only with respect to state — it receives setState/react and
 * animates. It never sets a lifecycle state, never reads assistant prose,
 * and never touches the audio channel.
 */
(function () {
  "use strict";
  var KOS = window.KOS = window.KOS || {};

  /* ---- rig contract mirror -------------------------------------------
     These tables mirror art-source/assistant/live2d/rig-contract.json.
     smoke39 loads both and fails if they drift, so the runtime and the
     rigging source can never disagree about a motion index. */
  var MODEL_PATH = "live2d/kurenai.model3.json";

  var MOTIONS = {
    idle:         { group: "Lifecycle", index: 0, loop: true,  fadeMs: 350 },
    thinking:     { group: "Lifecycle", index: 1, loop: true,  fadeMs: 260 },
    working:      { group: "Lifecycle", index: 2, loop: true,  fadeMs: 220 },
    success:      { group: "Lifecycle", index: 3, loop: false, fadeMs: 180 },
    error:        { group: "Lifecycle", index: 4, loop: false, fadeMs: 180 },
    confirmation: { group: "Lifecycle", index: 5, loop: true,  fadeMs: 220 }
  };

  var REACTIONS = {
    hover:  { group: "Reaction", index: 0, hitArea: "Body" },
    head:   { group: "Reaction", index: 1, hitArea: "Head" },
    flower: { group: "Reaction", index: 2, hitArea: "Flower" },
    tablet: { group: "Reaction", index: 3, hitArea: "Tablet" }
  };

  /* maxFps values come straight from the contract's drawer/page blocks.
     Both surfaces pause on hidden AND offscreen: that is a superset of
     what the contract names for each, and never burns a frame nobody
     can see. */
  var SURFACES = {
    small: { maxFps: 30, pauseWhenHidden: true, pauseWhenOffscreen: true },
    large: { maxFps: 60, pauseWhenHidden: true, pauseWhenOffscreen: true }
  };

  var RELEASE = {
    publicDeployment: false,
    gate: "written-live2d-ai-chatbot-classification",
    staticFallbackRequired: true
  };

  function surfaceFor(size) { return SURFACES[size] || SURFACES.small; }
  function motionFor(state) { return MOTIONS[state] || MOTIONS.idle; }
  function reactionFor(kind) { return REACTIONS[kind] || null; }

  /* ---- runtime binding -----------------------------------------------
     The Cubism-specific surface is confined to ONE injectable factory.
     The default implementation refuses unless a Cubism runtime has been
     installed on the page by hand; tests substitute a stub so every path
     below (mapping, frame governing, pausing, teardown) is exercised
     without an SDK present. */
  function defaultRuntime(ctx) {
    var core = window.Live2DCubismCore;
    var framework = window.Live2DCubismFramework;
    if (!core || !framework) return null;
    if (typeof framework.startUpCubismFramework === "function") {
      framework.startUpCubismFramework();
    }
    return {
      /* Resolves to the live model handle, or rejects so the seam can
         fall back to the static PNG. */
      load: function () {
        return framework.loadModel({
          url: ctx.assetBase + MODEL_PATH,
          host: ctx.host,
          maxFps: ctx.maxFps
        });
      }
    };
  }

  var runtimeFactory = defaultRuntime;
  var rafImpl = null, cancelRafImpl = null, nowFn = null;

  function raf(cb) {
    return (rafImpl || window.requestAnimationFrame).call(window, cb);
  }
  function cancelRaf(id) {
    var fn = cancelRafImpl || window.cancelAnimationFrame;
    if (fn) fn.call(window, id);
  }
  function now() {
    if (nowFn) return nowFn();
    if (window.performance && window.performance.now) return window.performance.now();
    return Date.now();
  }

  /* ---- capability + status -------------------------------------------- */
  function runtimeAvailable() {
    if (runtimeFactory !== defaultRuntime) return true;
    return !!(window.Live2DCubismCore && window.Live2DCubismFramework);
  }
  function available() { return runtimeAvailable(); }

  function status() {
    return {
      available: available(),
      installed: installed,
      release: RELEASE,
      modelPath: MODEL_PATH,
      seam: (KOS.assistant && KOS.assistant.character && KOS.assistant.character.rendererStatus)
        ? KOS.assistant.character.rendererStatus() : null
    };
  }

  /* ---- the renderer the seam receives --------------------------------- */
  function createRenderer(ctx) {
    var binding = null;
    try { binding = runtimeFactory(ctx); }
    catch (e) { return null; }
    if (!binding || typeof binding.load !== "function") return null;

    var surface = surfaceFor(ctx.size);
    var minFrameMs = 1000 / Math.max(1, ctx.maxFps || surface.maxFps);

    return Promise.resolve(binding.load()).then(function (model) {
      if (!model || typeof model.playMotion !== "function") {
        throw new Error("cubism runtime returned no playable model");
      }

      var dead = false, frameId = null, lastFrame = 0;
      var hidden = false, offscreen = false, observer = null;
      var currentState = null;

      function running() { return !dead && !(surface.pauseWhenHidden && hidden)
        && !(surface.pauseWhenOffscreen && offscreen); }

      function frame(ts) {
        frameId = null;
        if (dead) return;
        var t = typeof ts === "number" ? ts : now();
        /* Frame governing is a skip, not a sleep: the loop stays on rAF so
           the browser can still throttle it, but the model is only advanced
           once the surface's budget has elapsed. */
        if (t - lastFrame >= minFrameMs) {
          var delta = lastFrame ? (t - lastFrame) / 1000 : 0;
          lastFrame = t;
          try { model.update(delta); }
          catch (e) { destroy(); return; }
        }
        if (running()) frameId = raf(frame);
      }

      function start() {
        if (dead || frameId !== null || !running()) return;
        lastFrame = 0;
        frameId = raf(frame);
      }
      function stop() {
        if (frameId !== null) { cancelRaf(frameId); frameId = null; }
      }
      function reassess() { if (running()) start(); else stop(); }

      function onVisibility() {
        hidden = document.visibilityState === "hidden";
        reassess();
      }
      document.addEventListener("visibilitychange", onVisibility);
      onVisibility();

      if (surface.pauseWhenOffscreen && window.IntersectionObserver && ctx.host) {
        try {
          observer = new window.IntersectionObserver(function (entries) {
            offscreen = !entries.some(function (e) { return e.isIntersecting; });
            reassess();
          });
          observer.observe(ctx.host);
        } catch (e) { observer = null; }
      }

      function destroy() {
        if (dead) return;
        dead = true;
        stop();
        document.removeEventListener("visibilitychange", onVisibility);
        if (observer) { try { observer.disconnect(); } catch (e) { /* already gone */ } observer = null; }
        try { if (typeof model.release === "function") model.release(); }
        catch (e) { /* teardown must never throw into the seam */ }
      }

      var renderer = {
        /* The controller owns lifecycle; this only plays what it is told. */
        setState: function (state, meta) {
          if (dead) return;
          var m = motionFor(state);
          if (state === currentState) return;
          currentState = state;
          model.playMotion(m.group, m.index, { loop: m.loop, fadeMs: m.fadeMs, label: meta && meta.label });
          start();
        },
        react: function (kind) {
          if (dead) return;
          var r = reactionFor(kind);
          if (!r) return;
          model.playMotion(r.group, r.index, { loop: false, hitArea: r.hitArea, priority: "reaction" });
          start();
        },
        destroy: destroy,
        /* test/debug surface — never used by the seam */
        _debug: function () {
          return { running: running(), hidden: hidden, offscreen: offscreen,
                   dead: dead, state: currentState, minFrameMs: minFrameMs };
        }
      };

      if (ctx.state) renderer.setState(ctx.state, null);
      return renderer;
    });
  }

  /* ---- installation --------------------------------------------------- */
  var installed = false;

  function enable() {
    if (installed) return true;
    if (!available()) return false;
    var character = KOS.assistant && KOS.assistant.character;
    if (!character || typeof character.installRenderer !== "function") return false;
    installed = !!character.installRenderer(createRenderer);
    return installed;
  }

  function disable() {
    if (!installed) return false;
    var character = KOS.assistant && KOS.assistant.character;
    if (character && typeof character.removeRenderer === "function") character.removeRenderer();
    installed = false;
    return true;
  }

  KOS.assistant = KOS.assistant || {};
  KOS.assistant.live2d = {
    enable: enable,
    disable: disable,
    available: available,
    status: status,
    motionFor: motionFor,
    reactionFor: reactionFor,
    surfaceFor: surfaceFor,
    modelPath: function () { return MODEL_PATH; },
    release: function () { return RELEASE; },
    _config: function (o) {
      o = o || {};
      if ("runtimeFactory" in o) runtimeFactory = o.runtimeFactory || defaultRuntime;
      if ("raf" in o) rafImpl = o.raf;
      if ("cancelRaf" in o) cancelRafImpl = o.cancelRaf;
      if ("now" in o) nowFn = o.now;
      if (o.reset) { disable(); runtimeFactory = defaultRuntime; rafImpl = cancelRafImpl = nowFn = null; }
    }
  };
})();
