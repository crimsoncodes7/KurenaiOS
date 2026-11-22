/* Kurenai OS — smoke199.test.js
   User-directed feature & customisation branch (neon/user-custom-1).
   Run:
     node tools/smoke199.test.js */
"use strict";
const fs = require("fs");
const path = require("path");
const { boot } = require("./lib/app-harness");

const ROOT = path.resolve(__dirname, "..");
const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) {
  if (JSON.stringify(a) !== JSON.stringify(b)) {
    throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b));
  }
}

let app, K, doc;
const q = (s) => doc.querySelector(s);
const qa = (s) => [...doc.querySelectorAll(s)];
function click(n) { assert(n, "nothing to click"); n.dispatchEvent(new app.window.MouseEvent("click", { bubbles: true })); }

step("boot", async () => {
  app = await boot({ clock: "2026-11-22T13:00:00" });
  K = app.KOS; doc = app.document;
  eq(app.errors, [], "boot errors");
});

/* ---------------- A · U1 Kurenai panel centring, aura & animation clipping ---------------- */
step("A · Kurenai panel centres figure, aligns aura behind body, and prevents animation clipping (U1)", () => {
  const css = fs.readFileSync(path.join(ROOT, "css/views/assistant.css"), "utf8");

  const presence = css.match(/\.k-asst-presence\s*\{[^}]*\}/);
  assert(presence && /radial-gradient\([^)]*at\s+50%\s+4[5-9]%/.test(presence[0]),
    "presence radial aura should centre behind her body (50% 45–49%), got: " + (presence && presence[0]));

  const stage = css.match(/\.k-asst-stage\s*\{[^}]*\}/);
  assert(stage && /padding-block-start:\s*var\(--sp-/.test(stage[0]),
    "stage reserves top headroom with a spacing token, got: " + (stage && stage[0]));

  const frame = css.match(/\.k-asst-stage\s+\.k-asst-mascot-frame\s*\{[^}]*\}/);
  assert(frame && /margin-block:\s*auto/.test(frame[0]),
    "stage mascot frame vertically centres with margin-block: auto, got: " + (frame && frame[0]));
  assert(frame && /overflow:\s*visible/.test(frame[0]),
    "stage mascot frame allows overflow: visible so idle animation never clips her head, got: " + (frame && frame[0]));
  assert(frame && /max-block-size:\s*calc\(100%\s*-\s*var\(--sp-/.test(frame[0]),
    "stage mascot frame reserves headroom via max-block-size calc, got: " + (frame && frame[0]));

  const aura = css.match(/\.k-asst-stage\s+\.k-asst-mascot-frame::before\s*\{[^}]*\}/);
  assert(aura && /inset:\s*14%\s+-8%\s+14%/.test(aura[0]),
    "stage aura sits centred behind her body without clipping on narrow frame edges, got: " + (aura && aura[0]));

  const drawerFrame = css.match(/\.k-asst-drawer\[data-state~="is-empty"\]\s+\.k-asst-mascot-frame\s*\{[^}]*\}/);
  assert(drawerFrame && /overflow:\s*visible/.test(drawerFrame[0]),
    "empty drawer mascot frame prevents head clipping too, got: " + (drawerFrame && drawerFrame[0]));
});

/* ---------------- B · U2 Home hero lighter blue overlay ---------------- */
step("B · Home hero lightens blue scrim overlay and lets artwork breathe in Graphite and Dawn (U2)", () => {
  const tokens = fs.readFileSync(path.join(ROOT, "css/tokens.css"), "utf8");
  const themes = fs.readFileSync(path.join(ROOT, "css/themes.css"), "utf8");
  const home = fs.readFileSync(path.join(ROOT, "css/views/home.css"), "utf8");

  assert(/--home-art-op:\s*0\.8\d/.test(tokens), "tokens.css defines raised --home-art-op for Graphite");
  assert(/--home-art-op:\s*0\.6\d/.test(themes), "themes.css defines raised --home-art-op for Dawn");
  assert(/\.k-home-hero\s*>\s*\.k-art\s*\{[^}]*--art-op:\s*var\(--home-art-op\)/.test(home),
    "home.css binds --art-op: var(--home-art-op) on .k-home-hero > .k-art");

  const duskScrim = tokens.match(/--home-hero-scrim:\s*([^;]+);/);
  assert(duskScrim, "Graphite --home-hero-scrim exists");
  const duskPeak = Math.max(...[...duskScrim[1].matchAll(/\/\s*(0?\.\d+)\)/g)].map((m) => parseFloat(m[1])));
  assert(duskPeak <= 0.55, "Graphite --home-hero-scrim peak alpha should be lightened (<= 0.55), got " + duskPeak);

  const dawnScrim = themes.match(/--home-hero-scrim:\s*([^;]+);/);
  assert(dawnScrim, "Dawn --home-hero-scrim exists");
  const dawnPeak = Math.max(...[...dawnScrim[1].matchAll(/\/\s*(0?\.\d+)\)/g)].map((m) => parseFloat(m[1])));
  assert(dawnPeak <= 0.60, "Dawn --home-hero-scrim peak alpha should be lightened (<= 0.60), got " + dawnPeak);
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok   " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + String(e && e.stack || e).split("\n").slice(0, 5).join("\n       ")); }
  }
  console.log(failed ? `\nSMOKE199 FAIL — ${failed} of ${steps.length} step(s)` : `\nSMOKE199 OK — ${steps.length} steps`);
  process.exit(failed ? 1 : 0);
})();
