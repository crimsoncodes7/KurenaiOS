/* Kurenai OS — smoke39.test.js
   Phase 2 Live2D binding: js/modules/assistant-live2d.js over the
   assistant renderer seam, plus the source-side release gate.

   Run:
     npm install jsdom            (one-time)
     node tools/smoke39.test.js

   TESTED PROPERTIES:
   1. Release gate: the adapter carries no Cubism SDK/Core/model, never
      references a Live2D CDN, ships publicDeployment:false, is inert with
      no runtime installed, and cannot be enabled in that state. The
      deploy script hard-fails on Live2D material in dist/, and .gitignore
      blocks every Cubism file extension.
   2. Contract mirror: the six lifecycle motions, four reactions, surface
      frame budgets and model path in the adapter match
      art-source/assistant/live2d/rig-contract.json exactly — the runtime
      and the rigging source cannot drift.
   3. Seam integration with a STUB runtime: enable() installs through
      KOS.assistant.character.installRenderer, every lifecycle state plays
      its contract motion, repeats are suppressed, reactions play their
      own group, and both drawer and page surfaces mount.
   4. Ownership: the adapter never sets a lifecycle state, never reads
      assistant prose, and never touches audio — it is write-only with
      respect to the controller.
   5. Fallback: a runtime that returns nothing, throws, rejects, or hands
      back an unplayable model leaves the Phase 1 static PNG in place and
      never throws into the seam. disable() restores the static path.
   6. Frame governing: the loop skips frames below the surface budget
      (30fps drawer / 60fps page), pauses when the document is hidden and
      when the host scrolls offscreen, resumes after, and destroy()
      detaches every listener and observer exactly once.
   7. Scaffold: the Krita redraw scaffold matches layer-map.json — all 126
      contract layers, 19 groups, back-to-front order, variants hidden.  */

const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const LIVE2D_SRC = path.join(ROOT, "art-source/assistant/live2d");
const ADAPTER = path.join(ROOT, "js/modules/assistant-live2d.js");

const steps = [];
const step = (name, fn) => steps.push([name, fn]);
function assert(cond, msg) { if (!cond) throw new Error(msg); }
const tick = (ms) => new Promise((r) => setTimeout(r, ms));

const adapterSrc = fs.readFileSync(ADAPTER, "utf8");
const contract = JSON.parse(fs.readFileSync(path.join(LIVE2D_SRC, "rig-contract.json"), "utf8"));

/* ============ harness ============
   The adapter only needs a window and the character seam, so it runs
   against a minimal DOM rather than booting the whole app. */
function makeEnv() {
  const dom = new JSDOM("<!doctype html><html><body></body></html>",
    { url: "http://localhost/index.html", runScripts: "outside-only", pretendToBeVisual: true });
  const { window } = dom;
  let visibility = "visible";
  Object.defineProperty(window.document, "visibilityState",
    { get: () => visibility, configurable: true });

  const observers = [];
  window.IntersectionObserver = function (cb) {
    const self = { cb, targets: [], disconnected: false };
    this.observe = (t) => { self.targets.push(t); };
    this.disconnect = () => { self.disconnected = true; };
    self.handle = this;
    observers.push(self);
  };

  const frames = [];
  let frameSeq = 0;
  window.requestAnimationFrame = (cb) => { frameSeq += 1; frames.push([frameSeq, cb]); return frameSeq; };
  window.cancelAnimationFrame = (id) => {
    const i = frames.findIndex((f) => f[0] === id);
    if (i >= 0) frames.splice(i, 1);
  };

  let clock = 0;
  window.__advance = (ms) => { clock += ms; };
  window.__now = () => clock;
  /* Drain exactly one scheduled frame, the way a browser would. */
  window.__pump = () => {
    const next = frames.shift();
    if (!next) return false;
    next[1](clock);
    return true;
  };
  window.__frameCount = () => frames.length;
  window.__observers = observers;
  window.__setVisibility = (v) => {
    visibility = v;
    const ev = window.document.createEvent("Event");
    ev.initEvent("visibilitychange", true, true);
    window.document.dispatchEvent(ev);
  };

  /* A faithful stand-in for the seam in js/modules/assistant.js: it holds
     one factory and mounts it per surface, exactly as mascotNode does. */
  const seam = { factory: null, mounted: [] };
  window.KOS = {
    assistant: {
      character: {
        installRenderer(factory) {
          if (typeof factory !== "function") return false;
          seam.factory = factory; return true;
        },
        removeRenderer() { seam.factory = null; },
        rendererStatus() { return { mode: seam.factory ? "live-candidate" : "static" }; }
      }
    }
  };
  seam.mount = async (size, state) => {
    if (!seam.factory) return { renderer: null, fell_back: true };
    const host = window.document.createElement("div");
    window.document.body.appendChild(host);
    let renderer = null, threw = false;
    try {
      renderer = await Promise.resolve(seam.factory({
        host, size, assetBase: "assets/assistant/", state,
        maxFps: size === "large" ? 60 : 30
      }));
    } catch (e) { threw = true; }
    const usable = !!(renderer && typeof renderer.setState === "function");
    return { renderer: usable ? renderer : null, fell_back: !usable, threw, host };
  };

  window.eval(adapterSrc);
  return { window, seam, live2d: window.KOS.assistant.live2d };
}

/* A stub Cubism model that records everything it is asked to play. */
function stubRuntime(opts = {}) {
  const log = { motions: [], updates: 0, released: 0 };
  const factory = (ctx) => {
    if (opts.factoryReturnsNull) return null;
    if (opts.factoryThrows) throw new Error("runtime exploded");
    log.ctx = ctx;
    return {
      load() {
        if (opts.loadRejects) return Promise.reject(new Error("no model"));
        if (opts.unplayableModel) return Promise.resolve({});
        return Promise.resolve({
          playMotion(group, index, o) { log.motions.push({ group, index, ...o }); },
          update(dt) { log.updates += 1; if (opts.updateThrows) throw new Error("gl lost"); log.lastDt = dt; },
          release() { log.released += 1; }
        });
      }
    };
  };
  return { factory, log };
}

/* ============ 1. release gate ============ */
step("adapter bundles no Live2D SDK, Core, model or CDN reference", () => {
  assert(!/cdn|unpkg|jsdelivr|live2d\.com/i.test(adapterSrc),
    "adapter must not reference any remote host");
  assert(!/CubismMoc|CubismModel\b|\.moc3["']/.test(adapterSrc),
    "adapter must not embed Cubism Core types");
  const vendored = path.join(ROOT, "js/vendor/live2d");
  assert(!fs.existsSync(vendored), "js/vendor/live2d must not exist yet");
  const runtimeAssets = path.join(ROOT, "assets/assistant/live2d");
  assert(!fs.existsSync(runtimeAssets), "assets/assistant/live2d must not exist yet");
  const tracked = execFileSync("git", ["ls-files"], { cwd: ROOT, encoding: "utf8" });
  assert(!/\.(moc3|model3\.json|motion3\.json|physics3\.json)/.test(tracked),
    "no Cubism model file may be tracked in git");
});

step("release gate is closed in both the contract and the adapter", () => {
  assert(contract.release.publicDeployment === false, "rig contract must gate deployment");
  assert(contract.release.staticFallbackRequired === true, "static fallback must stay required");
  const env = makeEnv();
  const rel = env.live2d.release();
  assert(rel.publicDeployment === false, "adapter must report publicDeployment false");
  assert(rel.gate === contract.release.gate, "adapter gate must match the contract gate");
  assert(rel.staticFallbackRequired === true, "adapter must require the static fallback");
});

step("adapter is inert and unenableable with no runtime installed", async () => {
  const env = makeEnv();
  assert(env.live2d.available() === false, "must report unavailable with no Cubism runtime");
  assert(env.live2d.enable() === false, "enable() must refuse with no runtime");
  assert(env.seam.factory === null, "no factory may reach the seam");
  const st = env.live2d.status();
  assert(st.installed === false && st.available === false, "status must report inert");
  const mount = await env.seam.mount("large", "idle");
  assert(mount.fell_back === true, "with nothing installed the static PNG is the only path");
});

step("deploy script and .gitignore block Live2D runtime material", () => {
  const deploy = fs.readFileSync(path.join(ROOT, "tools/deploy_pages.sh"), "utf8");
  for (const ext of ["moc3", "model3.json", "motion3.json", "physics3.json"]) {
    assert(deploy.includes(ext), `deploy_pages.sh must hard-fail on *.${ext}`);
  }
  assert(/LIVE2D_LEAK[\s\S]*exit 1/.test(deploy), "deploy script must exit non-zero on a leak");
  const ignore = fs.readFileSync(path.join(ROOT, ".gitignore"), "utf8");
  for (const pat of ["*.moc3", "*.model3.json", "js/vendor/live2d/", "assets/assistant/live2d/"]) {
    assert(ignore.includes(pat), `.gitignore must block ${pat}`);
  }
});

/* ============ 2. contract mirror ============ */
step("six lifecycle motions mirror rig-contract.json exactly", () => {
  const env = makeEnv();
  const ids = Object.keys(contract.motions);
  assert(ids.length === 6, "contract must define exactly six lifecycle motions");
  for (const id of ids) {
    const want = contract.motions[id];
    const got = env.live2d.motionFor(id);
    assert(got.group === want.group, `${id} group drift: ${got.group} vs ${want.group}`);
    assert(got.index === want.index, `${id} index drift: ${got.index} vs ${want.index}`);
    assert(got.loop === want.loop, `${id} loop drift`);
    assert(got.fadeMs === want.fadeMs, `${id} fadeMs drift`);
  }
  const indexes = ids.map((i) => contract.motions[i].index).sort();
  assert(indexes.join() === "0,1,2,3,4,5", "lifecycle indexes must be 0..5");
});

step("four reactions and their hit areas mirror the contract", () => {
  const env = makeEnv();
  const areas = new Set(contract.hitAreas.map((h) => h.id));
  for (const kind of Object.keys(contract.interactions)) {
    const want = contract.interactions[kind];
    const got = env.live2d.reactionFor(kind);
    assert(got, `reaction ${kind} missing from the adapter`);
    assert(got.group === want.group && got.index === want.index,
      `${kind} motion drift`);
    assert(got.hitArea === want.hitArea, `${kind} hit area drift`);
    assert(areas.has(got.hitArea), `${kind} names an undeclared hit area`);
  }
  assert(env.live2d.reactionFor("nope") === null, "unknown reactions must not map");
});

step("surface frame budgets and model path mirror the contract", () => {
  const env = makeEnv();
  assert(env.live2d.surfaceFor("small").maxFps === contract.runtime.drawer.maxFps,
    "drawer fps drift");
  assert(env.live2d.surfaceFor("large").maxFps === contract.runtime.page.maxFps,
    "page fps drift");
  assert(contract.runtime.drawer.pauseWhenHidden === true
    && env.live2d.surfaceFor("small").pauseWhenHidden === true, "drawer must pause when hidden");
  assert(contract.runtime.page.pauseWhenOffscreen === true
    && env.live2d.surfaceFor("large").pauseWhenOffscreen === true, "page must pause offscreen");
  assert(env.live2d.modelPath().endsWith(".model3.json"), "model path must be a Cubism manifest");
  assert(env.live2d.motionFor("unknown-state").index === contract.motions.idle.index,
    "unknown states must fall back to idle");
});

/* ============ 3. seam integration with a stub runtime ============ */
step("enable() installs through the seam and mounts both surfaces", async () => {
  const env = makeEnv();
  const stub = stubRuntime();
  env.live2d._config({ runtimeFactory: stub.factory, raf: env.window.requestAnimationFrame,
    cancelRaf: env.window.cancelAnimationFrame, now: env.window.__now });
  assert(env.live2d.available() === true, "an installed runtime must report available");
  assert(env.live2d.enable() === true, "enable() must install the factory");
  assert(typeof env.seam.factory === "function", "the seam must hold the factory");
  assert(env.live2d.enable() === true, "enable() must be idempotent");

  const drawer = await env.seam.mount("small", "idle");
  const page = await env.seam.mount("large", "idle");
  assert(!drawer.fell_back && !page.fell_back, "both surfaces must mount live");
  assert(stub.log.motions.length === 2, "each surface plays its initial state once");
  assert(stub.log.ctx.assetBase === "assets/assistant/", "asset base must reach the runtime");
});

step("every lifecycle state plays its contract motion, repeats suppressed", async () => {
  const env = makeEnv();
  const stub = stubRuntime();
  env.live2d._config({ runtimeFactory: stub.factory, raf: env.window.requestAnimationFrame,
    cancelRaf: env.window.cancelAnimationFrame, now: env.window.__now });
  env.live2d.enable();
  const m = await env.seam.mount("large", null);
  assert(stub.log.motions.length === 0, "a null initial state plays nothing");

  for (const state of ["idle", "thinking", "working", "success", "error", "confirmation"]) {
    m.renderer.setState(state, { label: state });
  }
  assert(stub.log.motions.length === 6, "each of the six states plays exactly once");
  stub.log.motions.forEach((mo, i) => {
    const want = contract.motions[["idle", "thinking", "working", "success", "error", "confirmation"][i]];
    assert(mo.group === "Lifecycle" && mo.index === want.index, "state played the wrong motion");
    assert(mo.loop === want.loop, "loop flag not taken from the contract");
  });

  m.renderer.setState("confirmation", null);
  assert(stub.log.motions.length === 6, "re-entering the current state must not replay it");
  m.renderer.setState("idle", null);
  assert(stub.log.motions.length === 7, "a real transition must play");
});

step("reactions play the Reaction group without disturbing lifecycle state", async () => {
  const env = makeEnv();
  const stub = stubRuntime();
  env.live2d._config({ runtimeFactory: stub.factory, raf: env.window.requestAnimationFrame,
    cancelRaf: env.window.cancelAnimationFrame, now: env.window.__now });
  env.live2d.enable();
  const m = await env.seam.mount("large", "working");
  const before = m.renderer._debug().state;
  for (const kind of ["hover", "head", "flower", "tablet"]) m.renderer.react(kind);
  const reactions = stub.log.motions.filter((x) => x.group === "Reaction");
  assert(reactions.length === 4, "all four reactions must play");
  assert(reactions.every((r) => r.loop === false), "reactions must never loop");
  assert(m.renderer._debug().state === before, "a reaction must not change lifecycle state");
  m.renderer.react("unknown");
  assert(stub.log.motions.filter((x) => x.group === "Reaction").length === 4,
    "unknown reactions must be ignored");
});

/* ============ 4. ownership ============ */
step("adapter is write-only: it never sets lifecycle, reads prose or plays audio", () => {
  assert(contract.runtime.controllerOwnsLifecycle === true, "contract must give the controller ownership");
  assert(contract.runtime.inferStateFromProse === false, "contract must forbid prose inference");
  assert(!/setLifecycle|setVisual|claimLifecycle/.test(adapterSrc),
    "adapter must never drive the lifecycle controller");
  assert(!/new Audio|playAudio|stopAudio|\.mp3/.test(adapterSrc),
    "adapter must never touch the audio channel");
  assert(!/S\.thread|assistantRichText|\.text\b\s*=/.test(adapterSrc),
    "adapter must never read assistant prose");
  const env = makeEnv();
  const api = Object.keys(env.window.KOS.assistant.live2d);
  assert(!api.includes("setState"), "the adapter must not expose a state setter of its own");
});

/* ============ 5. fallback ============ */
step("every runtime failure mode falls back to the static PNG silently", async () => {
  const cases = [
    ["factory returns null", { factoryReturnsNull: true }],
    ["factory throws", { factoryThrows: true }],
    ["load() rejects", { loadRejects: true }],
    ["model is unplayable", { unplayableModel: true }]
  ];
  for (const [label, opts] of cases) {
    const env = makeEnv();
    const stub = stubRuntime(opts);
    env.live2d._config({ runtimeFactory: stub.factory, raf: env.window.requestAnimationFrame,
      cancelRaf: env.window.cancelAnimationFrame, now: env.window.__now });
    env.live2d.enable();
    const m = await env.seam.mount("large", "idle");
    assert(m.fell_back === true, `${label}: must fall back to the static PNG`);
    assert(m.threw !== true || opts.factoryThrows === undefined,
      `${label}: must not throw synchronously into the seam`);
  }
});

step("a runtime that dies mid-frame tears itself down instead of throwing", async () => {
  const env = makeEnv();
  const stub = stubRuntime({ updateThrows: true });
  env.live2d._config({ runtimeFactory: stub.factory, raf: env.window.requestAnimationFrame,
    cancelRaf: env.window.cancelAnimationFrame, now: env.window.__now });
  env.live2d.enable();
  const m = await env.seam.mount("large", "idle");
  env.window.__advance(100);
  env.window.__pump();
  assert(m.renderer._debug().dead === true, "a throwing update must kill the renderer");
  assert(stub.log.released === 1, "the model must be released exactly once");
  m.renderer.setState("thinking", null);
  m.renderer.react("head");
  assert(stub.log.motions.length === 1, "a dead renderer must ignore further commands");
});

step("disable() removes the factory and restores the static path", async () => {
  const env = makeEnv();
  const stub = stubRuntime();
  env.live2d._config({ runtimeFactory: stub.factory, raf: env.window.requestAnimationFrame,
    cancelRaf: env.window.cancelAnimationFrame, now: env.window.__now });
  env.live2d.enable();
  assert(env.live2d.disable() === true, "disable() must uninstall");
  assert(env.seam.factory === null, "the seam must be empty again");
  assert(env.live2d.disable() === false, "disable() must be idempotent");
  const m = await env.seam.mount("large", "idle");
  assert(m.fell_back === true, "after disable the static PNG is the only path");
});

/* ============ 6. frame governing ============ */
step("frames are skipped below the surface budget", async () => {
  const env = makeEnv();
  const stub = stubRuntime();
  env.live2d._config({ runtimeFactory: stub.factory, raf: env.window.requestAnimationFrame,
    cancelRaf: env.window.cancelAnimationFrame, now: env.window.__now });
  env.live2d.enable();
  const m = await env.seam.mount("small", "idle");   /* 30fps => 33.3ms */
  assert(Math.round(m.renderer._debug().minFrameMs) === 33, "drawer budget must be ~33ms");

  env.window.__pump();                 /* first frame primes the clock */
  const primed = stub.log.updates;
  env.window.__advance(10); env.window.__pump();
  assert(stub.log.updates === primed, "a 10ms gap is under the 30fps budget — no update");
  env.window.__advance(10); env.window.__pump();
  assert(stub.log.updates === primed, "20ms is still under budget");
  env.window.__advance(20); env.window.__pump();
  assert(stub.log.updates === primed + 1, "past 33ms the model must advance");

  const page = await env.seam.mount("large", "idle");
  assert(Math.round(page.renderer._debug().minFrameMs) === 17, "page budget must be ~17ms");
});

step("the loop pauses when hidden and when offscreen, and resumes", async () => {
  const env = makeEnv();
  const stub = stubRuntime();
  env.live2d._config({ runtimeFactory: stub.factory, raf: env.window.requestAnimationFrame,
    cancelRaf: env.window.cancelAnimationFrame, now: env.window.__now });
  env.live2d.enable();
  const m = await env.seam.mount("large", "idle");
  assert(m.renderer._debug().running === true, "a visible surface runs");

  env.window.__setVisibility("hidden");
  assert(m.renderer._debug().hidden === true, "hidden must be observed");
  assert(m.renderer._debug().running === false, "a hidden document must pause the loop");
  assert(env.window.__frameCount() === 0, "no frame may stay queued while hidden");

  env.window.__setVisibility("visible");
  assert(m.renderer._debug().running === true, "becoming visible must resume");
  assert(env.window.__frameCount() > 0, "a frame must be queued again");

  const obs = env.window.__observers[env.window.__observers.length - 1];
  assert(obs && obs.targets.length === 1, "the page surface must observe its host");
  obs.cb([{ isIntersecting: false }]);
  assert(m.renderer._debug().offscreen === true && m.renderer._debug().running === false,
    "scrolling offscreen must pause the loop");
  obs.cb([{ isIntersecting: true }]);
  assert(m.renderer._debug().running === true, "scrolling back must resume");
});

step("destroy() detaches every listener and observer, exactly once", async () => {
  const env = makeEnv();
  const stub = stubRuntime();
  env.live2d._config({ runtimeFactory: stub.factory, raf: env.window.requestAnimationFrame,
    cancelRaf: env.window.cancelAnimationFrame, now: env.window.__now });
  env.live2d.enable();
  const m = await env.seam.mount("large", "idle");
  const obs = env.window.__observers[env.window.__observers.length - 1];

  m.renderer.destroy();
  assert(stub.log.released === 1, "the model must be released once");
  assert(obs.disconnected === true, "the IntersectionObserver must be disconnected");
  assert(env.window.__frameCount() === 0, "no frame may remain queued after destroy");

  m.renderer.destroy();
  assert(stub.log.released === 1, "destroy() must be idempotent");

  /* A detached visibilitychange listener must not revive the loop. */
  env.window.__setVisibility("visible");
  assert(env.window.__frameCount() === 0, "a destroyed renderer must not re-queue frames");
});

/* ============ 7. static presence (Phase 1.5) ============
   The six flat PNGs carry the fallback, so the fallback has to feel alive
   on its own. These assert the CSS contract that gives them presence and,
   crucially, that it yields the moment a live renderer mounts. */
const css = fs.readFileSync(path.join(ROOT, "css/main.css"), "utf8");

step("the static renders breathe, sway and bloom on coprime cycles", () => {
  for (const kf of ["asstBreath", "asstSway", "asstBloom"]) {
    assert(css.includes("@keyframes " + kf), `missing @keyframes ${kf}`);
  }
  assert(/\.asst-mascot-img\s*\{[^}]*animation:\s*asstBreath[^}]*asstSway/.test(css),
    "the mascot image must run both breath and sway");
  assert(/\.asst-mascot-frame::before\s*\{\s*animation:\s*asstBloom/.test(css),
    "the bloom must animate on the frame's ::before, not the image");
  /* Different periods are the whole point: equal ones would visibly loop. */
  const durs = ["--asst-breath-dur: 4.6s", "--asst-sway-dur: 11s", "--asst-bloom-dur: 7s"];
  for (const d of durs) assert(css.includes(d), `missing default ${d}`);
  const values = durs.map((d) => d.split(": ")[1]);
  assert(new Set(values).size === values.length, "the three cycles must not share a period");
  assert(/\.asst-mascot-img\s*\{[^}]*transform-origin:\s*50%\s*100%/.test(css),
    "breathing must be anchored at her feet, matching object-position: bottom center");
});

step("each lifecycle state has its own posture and entry motion", () => {
  /* idle is the resting state and deliberately has NO entry animation. */
  assert(!/\[data-state="idle"\]\s*\.asst-mascot-frame\s*\{\s*animation/.test(css),
    "idle must not have an entry animation");
  const entries = {
    success: "asstEnterSuccess", error: "asstEnterError",
    confirmation: "asstEnterLean", thinking: "asstEnterSettle", working: "asstEnterSettle"
  };
  for (const [state, kf] of Object.entries(entries)) {
    const re = new RegExp(`\\[data-state="${state}"\\]\\s*\\.asst-mascot-frame\\s*\\{\\s*animation:\\s*${kf}`);
    assert(re.test(css), `${state} must enter with ${kf}`);
    assert(css.includes("@keyframes " + kf), `missing @keyframes ${kf}`);
  }
  /* Every lifecycle state the controller can reach must be styled. */
  const posture = [...css.matchAll(/\.asst-mascot\[data-state="(\w+)"\]\s*\{\s*\n?\s*--asst-/g)].map((m) => m[1]);
  for (const s of ["thinking", "working", "confirmation", "error"]) {
    assert(posture.includes(s), `${s} must retune the motion variables`);
  }
});

step("reactions ripple through the existing ring spans, inside the 0.36s window", () => {
  assert(/\.asst-mascot\.is-reacting\s+\.asst-bloom-ring\s*\{\s*animation:\s*asstRipple\s+\.34s/.test(css),
    "ring-one must ripple for 0.34s");
  const two = /\.asst-mascot\.is-reacting\s+\.ring-two\s*\{\s*animation:\s*asstRipple\s+\.28s\s+[\w-]+\s+\.06s/.exec(css);
  assert(two, "ring-two must ripple for 0.28s after a 0.06s delay");
  /* showReaction() removes .is-reacting after 360ms; a ripple that outlived
     the class would be cut off mid-flight. */
  assert(0.28 + 0.06 <= 0.36, "the staggered ripple must finish inside the reaction window");
  const js = fs.readFileSync(path.join(ROOT, "js/modules/assistant.js"), "utf8");
  assert(/removeAttribute\("data-reaction"\).*?\}, 360\)|360\)/.test(js.replace(/\n/g, " ")),
    "assistant.js must still clear the reaction after 360ms");
  /* The nudge is last in the list so it deliberately wins over breath's
     translate for its duration, then hands it straight back. */
  const nudge = /\.asst-mascot\.is-reacting\s+\.asst-mascot-img\s*\{\s*animation:([^;]+);/.exec(css);
  assert(nudge, "a reaction must nudge the image");
  assert(nudge[1].trim().endsWith("asstNudge .34s ease-out"),
    "asstNudge must be LAST in the animation list or breath will override it");
});

step("static life stands down for a live renderer and for reduced motion", () => {
  const live = /\.asst-mascot\.has-live-renderer\s+\.asst-mascot-img,\s*\n?\s*\.asst-mascot\.has-live-renderer\s+\.asst-mascot-frame,\s*\n?\s*\.asst-mascot\.has-live-renderer\s+\.asst-mascot-frame::before\s*\{\s*animation:\s*none/.test(css);
  assert(live, "a mounted renderer must stop all three static animation layers");

  const reduced = css.slice(css.indexOf("@media (prefers-reduced-motion: reduce)",
    css.indexOf(".asst-mascot")));
  const block = reduced.slice(0, reduced.indexOf("\n}\n"));
  for (const sel of [".asst-mascot-img", ".asst-mascot-frame"]) {
    assert(block.includes(sel), `reduced motion must silence ${sel}`);
  }
  /* rig-contract says reduced motion is the static PNG, so the resting
     transforms have to be cleared too - animation:none alone would leave
     her mid-pose if a one-shot had filled backwards. */
  assert(/translate:\s*none\s*!important/.test(block)
    && /rotate:\s*none\s*!important/.test(block)
    && /scale:\s*none\s*!important/.test(block),
    "reduced motion must clear translate/rotate/scale, not just animations");
  assert(contract.runtime.reducedMotion === "static-phase-1-png",
    "the rig contract must still specify the static PNG for reduced motion");
});

/* ============ 8. redraw scaffold ============ */
step("the Krita redraw scaffold matches layer-map.json", () => {
  const scaffold = path.join(LIVE2D_SRC, "source/kurenai-live2d-scaffold-4096-v1.kra");
  assert(fs.existsSync(scaffold),
    "scaffold missing — build it with tools/build_live2d_scaffold.sh");
  const out = execFileSync("node", [path.join(ROOT, "tools/validate_live2d_scaffold.mjs")],
    { cwd: ROOT, encoding: "utf8" });
  assert(/^SCAFFOLD PASS/.test(out.trim()), "scaffold validator did not pass:\n" + out);

  const map = JSON.parse(fs.readFileSync(path.join(LIVE2D_SRC, "layer-map.json"), "utf8"));
  assert(map.layers.length === 126, "layer map must define 126 layers");
  const required = map.layers.filter((l) => l.export !== false && !l.optional);
  const freeCore = required.filter((l) => !l.freeMergeInto);
  assert(required.length === 118, "118 required ArtMeshes");
  assert(freeCore.length === 95, "95 FREE-core ArtMeshes");
  assert(freeCore.length <= map.profiles.freeCore.artMeshLimit,
    "the FREE core must fit inside the Cubism FREE ArtMesh limit");
  assert(contract.parameters.length <= 30,
    "the parameter set must fit inside the Cubism FREE parameter limit");
});

/* ============ run ============ */
(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try {
      await Promise.race([fn(), new Promise((_, rej) =>
        setTimeout(() => rej(new Error("STEP TIMEOUT (15s)")), 15000))]);
      console.log("  ok  " + name);
    } catch (e) {
      failed++;
      console.error("  FAIL " + name + "\n       "
        + (e && e.stack ? e.stack.split("\n").slice(0, 3).join("\n       ") : e));
    }
  }
  await tick(50);
  console.log("\n==============================");
  if (failed) { console.error("SMOKE39 FAILED — " + failed + " step(s)"); process.exit(1); }
  console.log("SMOKE39 PASS — Phase 2 Live2D binding, release gate and redraw scaffold verified ("
    + steps.length + " steps).");
  process.exit(0);
})();
