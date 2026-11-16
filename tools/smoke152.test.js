/* Kurenai OS — smoke152.test.js
   Six small audit findings (PR-02, SC-16, SC-14, AX-36, SC-31, SH-19).

     A · PR-02: a page header takes the art of the page being drawn.
     B · SC-16: the ink toolbar's Paper button names a bought shop paper.
     C · SC-14: First snow's scrim and glass, and the chip clamp, exist.
     D · AX-36: looking at the locked "Your own" lock card writes no rule.
     E · SC-31: scenes and halls pick by their own season and time of day.
     F · SH-19: the header controls share one size token.

   Run:  node tools/smoke152.test.js                                       */
"use strict";
const fs = require("fs");
const path = require("path");
const { boot } = require("./lib/app-harness");
const ROOT = path.join(__dirname, "..");
const css = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }

let app, K, doc;
const $ = (s) => doc.querySelector(s);

step("boot", async () => {
  app = await boot({ clock: "2026-11-16T10:00:00" });
  K = app.KOS; doc = app.document;
  eq(app.errors, [], "boot errors");
});

step("A · PR-02: a page header shows its own page's band after in-app navigation", async () => {
  K.show("goals"); await app.settle();
  K.show("money"); await app.settle();
  const img = $("#main .k-pagehead > .k-art img");
  assert(img, "money's header paints a band");
  assert(/app\.hero\.page\.money\./.test(img.getAttribute("src") || ""), "money's band, not goals': " + img.getAttribute("src"));
  K.show("goals"); await app.settle();
  const img2 = $("#main .k-pagehead > .k-art img");
  assert(img2 && /app\.hero\.page\.goals\./.test(img2.getAttribute("src")), "and goals' band back: " + (img2 && img2.getAttribute("src")));
});

step("B · SC-16: the Paper button names a bought shop paper", async () => {
  const g = K.store.state.governor;
  if (!g.owned.includes("paper-kraft")) g.owned.push("paper-kraft");
  assert(K.ink.PAPERS.some((p) => p[0] === "kraft"), "KOS.ink.PAPERS includes kraft once owned");
  const noop = new Proxy({}, { get: (t, k) => (k === "prefs" ? K.inkUI.prefs() : () => null) });
  let bar;
  try { bar = K.inkUI.toolbar(noop, { paper: { get: () => "kraft", set: () => {} } }); }
  catch (e) { bar = null; }
  assert(bar, "a toolbar to read");
  const btn = bar.querySelector(".k-ink-paper-btn");
  assert(btn, "the paper button");
  assert(/Kraft/.test(btn.textContent) && !/Lined/.test(btn.textContent), "labelled with the paper: " + btn.textContent);
});

step("C · SC-14: First snow carries its own scrim and glass; the chip is clamped", () => {
  const p = css("css/views/productivity.css"), t = css("css/tokens.css"), f = css("js/modules/focus.js");
  assert(/--art-scrim-stage-bright:/.test(t), "the bright-scene scrim token");
  assert(/\.k-fx-stage\[data-scene="snow"\] > \.k-art \{[^}]*--art-scrim-stage-bright/.test(p), "the snow scrim rule");
  assert(/\[data-scene="snow"\][^{]*\.k-fx-left[^{]*\{[^}]*var\(--art-glass\)/.test(p), "glass behind the side text");
  assert(/\.k-fx-ctx \.k-chip \{[^}]*max-inline-size: 100%[^}]*overflow: hidden[^}]*text-overflow: ellipsis[^}]*white-space: nowrap/.test(p), "the chip clamp");
  assert(/setAttribute\("data-scene"/.test(f), "focus.js sets data-scene");
});

step("D · AX-36: looking at the locked 'Your own' writes no rule", async () => {
  const st = K.store.state;
  st.artSlots = { home: { mode: "one", pick: "app.hero.home.summer" } };
  assert(!K.art.canUpload("home"), "locked");
  K.artSlot.open("home"); await app.settle();
  const own = [...doc.querySelectorAll(".k-art-drawer-body .k-seg-item")].find((b) => b.textContent === "Your own");
  assert(own, "the segment");
  own.click(); await app.settle();
  assert($("[data-ui='art.lock']"), "the lock card is shown");
  eq(st.artSlots.home, { mode: "one", pick: "app.hero.home.summer" }, "the rule is unchanged");
  const one = [...doc.querySelectorAll(".k-art-drawer-body .k-seg-item")].find((b) => b.textContent === "One picture");
  one.click(); await app.settle();
  assert(!$("[data-ui='art.lock']"), "leaving it hides the lock");
  eq(st.artSlots.home.mode, "one", "still one picture");
});

step("E · SC-31: scenes pick by their own season and hour", () => {
  const g = K.store.state.governor;
  K.governor.catalog().filter((c) => c.kind === "scene" || c.kind === "hall").forEach((c) => { if (!g.owned.includes(c.id)) g.owned.push(c.id); });
  K.art.setCfg("focus", { mode: "rotate", by: "time", period: "season" });
  eq(K.art.rotated("focus", new Date(2026, 0, 15, 14)), "app.focus.snow", "winter is First snow");
  K.art.setCfg("focus", { mode: "rotate", by: "time", period: "tod" });
  eq(K.art.rotated("focus", new Date(2026, 5, 15, 23)), "app.focus.train", "night is the night train");
  eq(K.art.rotated("focus", new Date(2026, 5, 15, 19)), "app.focus.rooftop", "evening is the rooftop");
  const seen = new Set();
  const scenes = K.art.pool("focus").map((x) => x.id);
  for (const period of ["season", "tod"]) {
    K.art.setCfg("focus", { mode: "rotate", by: "time", period });
    for (let m = 0; m < 12; m++) for (let h = 0; h < 24; h += 3) for (let d = 1; d < 29; d += 3) seen.add(K.art.rotated("focus", new Date(2026, m, d, h)));
  }
  scenes.forEach((s) => assert(seen.has(s), s + " is reachable"));
  K.art.setCfg("shrine", { mode: "rotate", by: "time", period: "season" });
  const halls = K.art.pool("shrine").map((x) => x.id), hs = new Set();
  for (let m = 0; m < 12; m++) for (let d = 1; d < 29; d += 3) hs.add(K.art.rotated("shrine", new Date(2026, m, d, 12)));
  halls.forEach((s) => assert(hs.has(s), s + " is reachable"));
  /* the fallback of By condition is the season, not a stored period */
  K.art.setCfg("focus", { mode: "rotate", by: "condition", period: "tod", conds: {} });
  eq(K.art.rotated("focus", new Date(2026, 0, 15, 23)), "app.focus.snow", "By condition falls back to the season");
  /* Home's heroes keep their behaviour */
  K.art.setCfg("home", { mode: "rotate", by: "time", period: "season" });
  eq(K.art.rotated("home", new Date(2026, 6, 1)), "app.hero.home.summer", "home summer");
  eq(K.art.rotated("home", new Date(2026, 11, 1)), "app.hero.home.winter", "home winter");
  K.art.setCfg("home", { mode: "rotate", by: "time", period: "tod" });
  eq(K.art.rotated("home", new Date(2026, 6, 1, 13)), "app.hero.home.spring", "home by time of day, as before");
});

step("F · SH-19: the header controls share one size token", () => {
  const l = css("css/layout.css"), r = css("css/views/routines.css"), c = css("css/components.css");
  assert(/\.k-syncdot \{[^}]*inline-size: var\(--icon-btn\)[^}]*block-size: var\(--icon-btn\)/.test(l), "the sync control");
  assert(/\.k-brand \{[^}]*min-block-size: var\(--icon-btn\)/.test(l), "the brand");
  assert(/\.k-dr-chip \{[^}]*min-block-size: var\(--icon-btn\)/.test(r), "the review chip");
  assert(/\.k-dr-chip \{ min-block-size: var\(--hit-coarse\); \}/.test(c), "the chip takes the coarse minimum on touch");
  assert(/\.k-iconbtn \{[^}]*block-size: var\(--icon-btn\)/.test(c), "the bell and Assistant");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok   " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + (e && e.stack || e)); }
  }
  console.log(failed ? `SMOKE152 FAIL — ${failed} step(s)` : "SMOKE152 OK");
  process.exit(failed ? 1 : 0);
})();
