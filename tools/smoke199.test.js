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

/* ---------------- C · U3 Home Routines (4 habits + smart rotation) & Reminders (3 rows) ---------------- */
step("C · Home shows 4 habits with smart rotation on completion and 3 reminders (U3)", async () => {
  const R = K.routines;
  const today = K.srs.todayISO();
  K.store.state.welcome = { seen: true, mode: "own" };
  /* Add a routine due now (clock is 13:00) so dueNow is active */
  R.add({
    name: "Midday Reset", kind: "custom", mark: "昼", tone: "teal",
    days: [0, 1, 2, 3, 4, 5, 6], window: { from: "12:00", to: "15:00" },
    steps: [{ title: "Step 1" }]
  });
  const names = ["H1 Water", "H2 Read", "H3 Stretch", "H4 Anki", "H5 Desk", "H6 Walk"];
  names.forEach((n) => R.add({ name: n, kind: "habit", days: [0, 1, 2, 3, 4, 5, 6], steps: [{ title: n }] }));
  ["R1 One", "R2 Two", "R3 Three", "R4 Four", "R5 Five"].forEach((t, i) => {
    K.reminders.add({ title: t, due: K.srs.addDays(today, i - 1) });
  });
  K.store.save();

  K.show("home"); await app.settle();
  const snap = () => { const c = Object.assign({}, K.store.state); delete c.ui; return JSON.stringify(c); };
  const beforeRender = snap();
  K.rerender(); await app.settle();
  eq(snap(), beforeRender, "Home render writes nothing");

  const habitNames = () => qa("[data-ui~='home.routines'] [data-ui~='home.routine-tick']").map((n) => (n.getAttribute("aria-label") || "").replace(/^(?:Tick|Untick) /, "").replace(/ for today$/, ""));
  assert(q("[data-ui~='home.routine-now']"), "dueNow routine is active");
  eq(habitNames(), ["H1 Water", "H2 Read", "H3 Stretch", "H4 Anki"], "4 habits visible even when dueNow is active");

  /* Tick H1: completed habit rotates out, H5 surfaces into the 4 visible slots */
  click(qa("[data-ui~='home.routines'] [data-ui~='home.routine-tick']")[0]); await app.settle();
  eq(habitNames(), ["H2 Read", "H3 Stretch", "H4 Anki", "H5 Desk"], "completed H1 rotated out and H5 surfaced");

  /* Tick H2 and H3: 3 undone remain (H4, H5, H6), so 1st completed (H1) backfills slot 4 */
  click(qa("[data-ui~='home.routines'] [data-ui~='home.routine-tick']")[0]); await app.settle();
  click(qa("[data-ui~='home.routines'] [data-ui~='home.routine-tick']")[0]); await app.settle();
  eq(habitNames(), ["H4 Anki", "H5 Desk", "H6 Walk", "H1 Water"], "undone habits stay first and completed H1 backfills 4th slot");

  /* Tick remaining 3 undone: all 6 done -> first 4 completed stay cleanly populated */
  click(qa("[data-ui~='home.routines'] [data-ui~='home.routine-tick']")[0]); await app.settle();
  click(qa("[data-ui~='home.routines'] [data-ui~='home.routine-tick']")[0]); await app.settle();
  click(qa("[data-ui~='home.routines'] [data-ui~='home.routine-tick']")[0]); await app.settle();
  eq(habitNames(), ["H1 Water", "H2 Read", "H3 Stretch", "H4 Anki"], "all done backfills all 4 slots");

  /* Reminders card shows 3 open rows and reports 3 of 5 */
  const remCard = q("[data-ui~='rem.sum']");
  assert(remCard && /3 of 5/.test(remCard.textContent), "Reminders meta reports 3 of 5: " + (remCard && remCard.textContent));
  eq(qa("[data-ui~='rem.sum'] [data-ui~='home.reminder-tick']").length, 3, "Reminders shows 3 rows on Home");
  eq(app.errors, [], "no page errors");
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
