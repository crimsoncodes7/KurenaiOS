/* Kurenai OS — smoke151.test.js
   W5's first batch (quality audit; the user's decisions of 16 November 2026).

     A · SC-22: every shop theme is gone; Atelier Dusk and Atelier Dawn are
         the only themes, in the catalogue and in css/themes.css, and a worn
         retired theme falls back to the default.
     B · The refund: each owned retired theme gives back what it cost, ONCE,
         through one ledger correction marked refund (no activity), with a
         receipt per theme; a second run and a re-added owned id pay nothing.
     C · 42d: buying asks first (a confirm naming the cost and what is left);
         Cancel spends nothing, Buy spends it.
     D · SC-04: the worn seal is stamped beside the brand mark (its painted
         art, or its glyph), and goes when the default is worn again.
     E · SC-28: the CSS gradient frames are retired (not sold; an owned one
         stays usable).
     F · SC-05: shelf skins and Shrine cards point --skin-art at an absolute
         URL, never one resolved against the stylesheet.
     G · SC-20: the twelve avatars are whole painted discs, 640 square.
     H · 42b: the share dialog offers a Finish row (Lacquer and each owned
         finish), opening on the one worn.
     I · SC-34: a pen set colours only strokes written while it is worn
         (a stroke carries its set; the probe rule follows the stroke).
     J · SC-01/06/07/21: a painted frame is sized by its measured opening,
         and a preview never inherits the worn frame.

   Run: node tools/smoke151.test.js */
"use strict";
const fs = require("fs");
const path = require("path");
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }
const ROOT = path.join(__dirname, "..");

let app, K, doc;
const $ = (s, r) => (r || doc).querySelector(s);
async function wait(promise) {
  let done = false, val, err;
  promise.then((v) => { done = true; val = v; }, (e) => { done = true; err = e; });
  for (let i = 0; i < 2000 && !done; i++) await app.settle();
  if (!done) throw new Error("a promise never settled");
  if (err) throw err;
  return val;
}

step("boot", async () => {
  app = await boot({ clock: "2026-11-16T10:00:00" });
  K = app.KOS; doc = app.document;
});

step("A · SC-22: only Atelier Dusk and Dawn remain", () => {
  const themes = K.governor.catalog().filter((c) => c.kind === "theme").map((c) => c.theme).sort();
  eq(themes, ["atelier-dawn", "atelier-dusk"], "the catalogue's themes");
  const css = fs.readFileSync(path.join(ROOT, "css/themes.css"), "utf8");
  const blocks = (css.match(/^:root\[data-theme="([a-z-]+)"\]/gm) || []).map((l) => l.match(/"(.+)"/)[1]).sort();
  eq(blocks, ["atelier-dawn", "atelier-dusk"], "themes.css's blocks");
  const g = K.store.state.governor;
  g.theme = "spectral-rose"; g.themeFollow = false;
  K.governor.applyCosmetics();
  assert(doc.documentElement.dataset.theme !== "spectral-rose", "a retired theme is never applied: " + doc.documentElement.dataset.theme);
  g.theme = "kurenai"; K.governor.applyCosmetics();
});

step("B · the retired themes are refunded once, through the ledger", async () => {
  const g = K.store.state.governor;
  g.owned.push("theme-spectral-rose", "theme-washi-morning", "seal-homura");
  const gold0 = g.gold, n0 = K.store.state.sessions.length;
  const pv = await wait(K.repairThemes.plan());
  assert(pv.needed, "the plan sees two themes to refund");
  eq(pv.summary, { themes: 2, gold: 1640 }, "the plan's totals");
  const r = await wait(K.repairs.run(K.repairThemes.ID));
  assert(r.ok, "the repair ran: " + JSON.stringify(r));
  eq(g.gold - gold0, 1640, "140 + 1,500 gold back");
  const added = K.store.state.sessions.slice(n0);
  eq(added.length, 1, "one ledger entry");
  eq([added[0].type, added[0].metrics.refund, added[0].award.gold], ["correction", true, 1640], "a correction marked refund");
  assert(g.refunds["theme-spectral-rose"] && g.refunds["theme-washi-morning"], "a receipt per theme");
  assert(!g.refunds["seal-homura"], "a seal is not a theme");
  const again = await wait(K.repairThemes.plan());
  assert(!again.needed, "nothing left to refund");
  g.owned.push("theme-spectral-rose");   /* another device's owned list unions it back */
  assert(!(await wait(K.repairThemes.plan())).needed, "a re-added id is not paid again");
  eq(g.gold - gold0, 1640, "the balance did not move again");
});

step("C · 42d: buying asks first", async () => {
  const g = K.store.state.governor;
  g.gold += 5000;
  K.show("governor", "shop");
  await app.settle();
  const it = K.governor.catalog().find((c) => c.kind === "avatar" && !K.governor.owns(c.id));
  const btn = doc.querySelector(`[aria-label="Buy ${it.name} for ${K.ui.num(it.price)} gold"]`);
  assert(btn, "the card's Buy button");
  const gold = g.gold;
  btn.click(); await app.settle();
  const dlg = $("[data-ui~='ui.confirm']");
  assert(dlg && /Buy /.test(dlg.textContent) && dlg.textContent.includes("left after"), "a confirm names the cost: " + (dlg && dlg.textContent));
  $("[data-ui~='ui.confirm-no']").click(); await app.settle();
  eq(g.gold, gold, "Cancel spends nothing");
  assert(!K.governor.owns(it.id), "and buys nothing");
  doc.querySelector(`[aria-label="Buy ${it.name} for ${K.ui.num(it.price)} gold"]`).click(); await app.settle();
  $("[data-ui~='ui.confirm-yes']").click(); await app.settle();
  eq(gold - g.gold, it.price, "Buy spends the price");
  assert(K.governor.owns(it.id), "and owns it");
});

step("D · SC-04: the worn seal beside the brand mark", () => {
  const g = K.store.state.governor;
  if (!g.owned.includes("seal-yuki")) g.owned.push("seal-yuki");
  K.governor.setSeal("seal-yuki");
  let s = $("#topbar [data-ui~='shell.brand-seal']");
  assert(s && s.querySelector("img") && /app\.seal\.yuki\.webp$/.test(s.querySelector("img").getAttribute("src")), "the painted stamp");
  assert($("#topbar .k-brand-logo"), "the bloom stays");
  K.governor.setSeal("seal-homura");
  s = $("#topbar [data-ui~='shell.brand-seal']");
  assert(s && s.textContent === "焔" && s.getAttribute("data-seal") === "seal-homura", "an ink seal's glyph");
  eq(K.governor.sealMark().glyph, "焔", "sealMark for the share card");
  K.governor.setSeal("kurenai");
  assert(!$("#topbar [data-ui~='shell.brand-seal']"), "none for the default");
  eq(K.governor.sealMark(), null, "and no share-card seal");
});

step("E · SC-28: the CSS frames are retired", () => {
  const css = K.governor.catalog().filter((c) => c.kind === "frame" && !c.painted);
  assert(css.length && css.every((c) => c.retired), "every CSS frame is retired");
  assert(K.governor.catalog().filter((c) => c.kind === "frame" && c.painted).every((c) => !c.retired), "painted frames are still sold");
});

step("F · SC-05: absolute --skin-art URLs", () => {
  for (const f of ["js/modules/shrine.js", "js/modules/books.js"]) {
    const src = fs.readFileSync(path.join(ROOT, f), "utf8");
    assert(!/"url\(assets\/app\/img\//.test(src), f + " sets a relative --skin-art");
    assert(/--skin-art", "url\(\\"" \+ new URL\(/.test(src), f + " builds the URL against the page");
  }
});

step("G · SC-20: twelve whole-disc avatars", () => {
  const ids = K.governor.catalog().filter((c) => c.kind === "avatar").map((c) => c.art);
  eq(ids.length, 12, "twelve avatars");
  const bad = ids.filter((a) => {
    const b = fs.readFileSync(path.join(ROOT, "assets/app/img", a + ".webp"));
    /* VP8X canvas: 24-bit width-1 and height-1 at bytes 24 and 27 */
    const w = 1 + b.readUIntLE(24, 3), h = 1 + b.readUIntLE(27, 3);
    return !(b.toString("ascii", 12, 16) === "VP8X" && w === 640 && h === 640);
  });
  eq(bad, [], "each avatar is a 640 × 640 picture");
  eq(app.errors, [], "no page errors");
});

step("H · 42b: the share dialog's Finish row", async () => {
  const g = K.store.state.governor;
  ["finish-washi", "finish-film"].forEach((id) => { if (!g.owned.includes(id)) g.owned.push(id); });
  K.governor.wear("finish", "finish-film");
  const rep = { period: "week", start: "2026-11-09", end: "2026-11-15", facts: { period: "week", start: "2026-11-09", end: "2026-11-15", gov: {}, study: {} }, words: { headline: "A week" } };
  let ov;
  ov = K.reportShare.dialog(rep);
  await app.settle();
  const row = doc.querySelector("[data-ui~='reports.export-finishes']");
  assert(row, "the Finish row");
  const opts = [...row.querySelectorAll("[data-ui~='reports.export-finish']")].map((b) => b.getAttribute("data-finish"));
  eq(opts, ["none", "finish-washi", "finish-film"], "Lacquer and the owned finishes");
  assert(row.querySelector("[data-finish='finish-film']").getAttribute("aria-checked") === "true", "opens on the worn one");
  doc.querySelectorAll(".k-dialog-overlay").forEach((o) => o.remove());
  K.governor.wear("finish", null);
});

step("I · SC-34: pen sets on new strokes only", () => {
  const css = fs.readFileSync(path.join(ROOT, "css/views/ink.css"), "utf8");
  assert(!/:root\[data-penset="\w+"\] :is\(\.k-ink-dot, \.k-ink-swatch, \.k-ink-probe\)/.test(css), "no rule recolours every stroke from :root");
  assert(/\.k-ink-probe\[data-penset="exam"\]/.test(css), "the probe follows a stroke's own set");
  const src = fs.readFileSync(path.join(ROOT, "js/core/inkui.js"), "utf8");
  assert(/function withSet\(/.test(src) && /it\.ps && pal\.forSet \? pal\.forSet\(it\.ps\)/.test(src), "a stroke records and is drawn with its set");
});

step("J · painted frames by their opening; previews never inherit", () => {
  const g = K.store.state.governor;
  const art = (n) => n.querySelector(".k-avatar-frame-art");
  const koi = K.governor.avatarNode(64, { frame: "frame-koi" });
  assert(art(koi) && art(koi).style.getPropertyValue("--fh").trim() === "0.732", "Koi's measured opening");
  eq(koi.getAttribute("data-frame"), "frame-koi", "the host names its own frame");
  if (!g.owned.includes("frame-sakura")) g.owned.push("frame-sakura");
  g.avatar.frame = "frame-sakura";
  const worn = K.governor.avatarNode(64);
  assert(art(worn) && /app\.frame\.sakura/.test(art(worn).getAttribute("src")), "the worn frame by default");
  const bare = K.governor.avatarNode(40, { frame: null });
  assert(!art(bare) && !bare.hasAttribute("data-frame"), "a preview asked for no frame draws none");
  g.avatar.frame = null;
  Object.keys(K.governor.FRAME_HOLE).forEach((k) => {
    const h = K.governor.FRAME_HOLE[k];
    assert(h[0] > 0.6 && h[0] < 0.85 && Math.abs(h[1] - 0.5) < 0.03 && Math.abs(h[2] - 0.5) < 0.03, k + " opening looks wrong: " + h);
  });
  eq(app.errors, [], "no page errors");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok   " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + (e && e.stack ? e.stack.split("\n").slice(0, 3).join("\n       ") : e)); }
  }
  console.log(failed ? `\n${failed} of ${steps.length} step(s) failed` : `\nall ${steps.length} steps passed`);
  process.exit(failed ? 1 : 0);
})();
