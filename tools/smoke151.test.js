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
     D · SC-04: the worn seal shows on the portrait's badge (its painted
         stamp) and the share card, never in the header.
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

   W5's second batch:
     K · SC-33/17/11/02: Try on covers every kind but labs and unlocks; the
         Stage is the fitting room (a tried avatar, frame or seal on its
         portrait, a tried banner, scene or hall as its ground, a sample
         for the rest, Kurenai standing there in her own clothes), nothing
         is saved, and the Buy keeps its gold over the stage's glass.
     L · SC-18/41/27: an owned item's sheet can be worn or taken off and
         says where it shows; the default theme has no Take off and taking a
         theme off wears Atelier Dusk; an owned unlock is a button.
     M · SC-25/19: switching painted avatars keeps your photo; Use replaces
         the picture drawer's rule.
     N · SC-12/24/37: the Wardrobe shows papers and pen sets as pictures,
         names wrap with a title, kinds owned none of are one line.
     O · SC-09/10/35: the Study set has its own colours; the first sixteen
         cosmetics use their repainted art; outfits are worded as painted.
     P · SC-38: a locked lab names its unlock and offers it when you can
         afford it; the shop opens at Labs.
     Q · SC-15/03/08: the Shrine's card takes a finish; a painted frame's
         reach is kept clear on the large portraits.

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

step("D · SC-04: the worn seal on the portrait's badge and the share card, never the header", async () => {
  const g = K.store.state.governor;
  if (!g.owned.includes("seal-yuki")) g.owned.push("seal-yuki");
  K.governor.setSeal("seal-yuki");
  /* the user's call (16 November 2026): no stamp beside the brand mark */
  assert(!$("#topbar [data-ui~='shell.brand-seal']") && !$("#topbar .k-brand-seal"), "nothing in the header");
  assert($("#topbar .k-brand-logo"), "the bloom stays");
  K.show("governor", "status", { _nav: true }); await app.settle();
  let b = $("#main .k-gv-ring .k-gv-ring-seal");
  assert(b && b.querySelector("img") && /app\.seal\.yuki\.webp$/.test(b.querySelector("img").getAttribute("src")), "the painted stamp on the portrait's badge");
  K.governor.setSeal("seal-homura");
  eq(K.governor.sealMark().glyph, "焔", "sealMark for the share card");
  K.governor.setSeal("kurenai"); K.rerender(); await app.settle();
  b = $("#main .k-gv-ring .k-gv-ring-seal");
  assert(b && !b.querySelector("img") && b.textContent === "紅", "the default's glyph");
  eq(K.governor.sealMark(), null, "and no share-card seal");
});

step("E · SC-28: the CSS frames are retired", () => {
  /* the four first frames are retired from sale and repainted for their
     owners (SC-10): no frame is drawn in CSS any more */
  const first = ["frame-gold", "frame-crimson", "frame-jade", "frame-amethyst"].map((id) => K.governor.item(id));
  assert(first.every((c) => c.retired && c.painted && c.art && K.governor.FRAME_HOLE[c.art]), "the first frames: retired, repainted, measured");
  assert(K.governor.catalog().filter((c) => c.kind === "frame").every((c) => c.painted), "no CSS frame left");
  assert(K.governor.catalog().filter((c) => c.kind === "frame" && first.indexOf(c) === -1).every((c) => !c.retired), "the painted frames are sold");
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


step("K · SC-33: Try on everything; the Stage is the fitting room", async () => {
  const g = K.store.state.governor, G = K.governor;
  const kinds = {};
  G.catalog().filter((c) => !c.retired).forEach((c) => { kinds[c.kind] = kinds[c.kind] || G.canTry(c); });
  Object.keys(kinds).forEach((k) => assert(kinds[k] === !(k === "lab" || k === "unlock"), k + " can" + (kinds[k] ? "" : "not") + " be tried"));
  const before = JSON.stringify({ a: g.avatar, s: g.seal, b: g.banner, sk: g.shelfSkin });
  G.tryItem("avatar-fox"); G.tryItem("frame-koi"); G.tryItem("seal-yuki"); G.tryItem("banner-snow" in {} ? "x" : G.catalog().find((c) => c.kind === "banner" && c.painted).id);
  G.tryItem("shelf-oak");
  K.show("governor", "shop", { _nav: true }); await app.settle(); await app.settle();
  const st = $("#main [data-ui~='gov.treasury']");
  const port = $("[data-ui~='shop.try-portrait']", st);
  assert(port && /app\.avatar\.fox/.test(port.querySelector(".k-avatar-art").getAttribute("src")), "the tried avatar on the portrait");
  assert(/app\.frame\.koi/.test(port.querySelector(".k-avatar-frame-art").getAttribute("src")), "the tried frame round it");
  assert(/app\.seal\.yuki/.test(port.querySelector(".k-gv-ring-seal img").getAttribute("src")), "the tried seal on the portrait's badge");
  assert($("[data-ui~='shop.try-ground']", st), "the tried banner is the stage's ground");
  assert($("[data-ui~='shop.try-sample'] .k-gv-pv", st), "a sample of the tried shelf");
  eq(JSON.stringify({ a: g.avatar, s: g.seal, b: g.banner, sk: g.shelfSkin }), before, "nothing tried is saved");
  G.stopTrying(); K.rerender(); await app.settle();
  assert(!$("#main [data-ui~='shop.try-portrait']"), "Stop ends it");
  const fig = $("#main .k-gv-shop-fig img");
  assert(fig && /app\.base\.kurenai/.test(fig.getAttribute("src")), "Kurenai stands on the stage in her own clothes (SC-11)");
  const css = fs.readFileSync(path.join(ROOT, "css/views/governor.css"), "utf8");
  assert(/:where\(\.k-gv-stage\) \.k-btn \{/.test(css) && !/^\.k-gv-stage \.k-btn \{/m.test(css), "the stage glass sits below a gold Buy (SC-02)");
});

step("L · owned sheets, the default theme, unlock buttons", async () => {
  const g = K.store.state.governor, G = K.governor;
  if (!g.owned.includes("frame-sakura")) g.owned.push("frame-sakura");
  ["upload-home", "upload-all"].forEach((id) => { if (!g.owned.includes(id)) g.owned.push(id); });
  g.avatar.frame = null;
  K.show("governor", "shop", { _nav: true }); await app.settle();
  const card = (id) => [...doc.querySelectorAll("#main [data-ui~='shop.card']")].find((c) => c.getAttribute("aria-label") === G.item(id).name);
  card("frame-sakura").querySelector("[data-ui~='shop.open']").click(); await app.settle();
  let sheet = $("[data-ui~='shop.sheet']");
  assert(sheet && $("[data-ui~='shop.sheet-where']", sheet) && $("[data-ui~='shop.sheet-state']", sheet).textContent === "Owned", "an owned sheet says it is owned and where it shows");
  const use = [...sheet.querySelectorAll(".k-dialog-foot .k-btn")].find((b) => b.textContent === "Use");
  assert(use, "Use on an owned sheet"); use.click(); await app.settle();
  eq(g.avatar.frame, "frame-sakura", "Use from the sheet wears it");
  const dusk = card("theme-atelier-dusk") || [...doc.querySelectorAll("#main [data-ui~='shop.card'][data-kind='theme']")][0];
  if (g.theme === "atelier-dusk" || !g.theme) assert(!dusk.querySelector("[data-ui~='shop.take-off']"), "the default theme has no Take off (SC-41)");
  assert(card("upload-home").querySelector("[data-ui~='shop.upload']"), "an owned unlock is a button (SC-27)");
  assert(!card("upload-home").querySelector(".k-gv-unlocked"), "not a sentence");
  assert(card("upload-all").querySelector("[data-ui~='ui.menu-button']"), "Every area is a menu of slots");
});

step("M · SC-25/19: avatars keep your photo; Use replaces a drawer rule", async () => {
  const g = K.store.state.governor, G = K.governor;
  ["avatar-cat", "avatar-fox", "scene-train"].forEach((id) => { if (!g.owned.includes(id)) g.owned.push(id); });
  g.avatar.kind = "custom";
  K.show("governor", "shop", { _nav: true }); await app.settle();
  const use = (id) => { const c = [...doc.querySelectorAll("#main [data-ui~='shop.card']")].find((x) => x.getAttribute("aria-label") === G.item(id).name); const b = c && (c.querySelector("[data-ui~='shop.use']") || c.querySelector("[data-ui~='shop.take-off']")); assert(b, id + ": no Use or Take off on " + (c ? c.getAttribute("data-ware") + " " + c.textContent : "no card")); b.click(); };
  use("avatar-cat"); await app.settle(); use("avatar-fox"); await app.settle(); use("avatar-fox"); await app.settle();
  eq(g.avatar.kind, "custom", "taking the second painted avatar off brings your photo back");
  K.art.setCfg("focus", { mode: "one", pick: "app.focus.library" });
  use("scene-train"); await app.settle();
  eq(K.art.cfg("focus"), null, "the shop's Use replaces the drawer's rule");
  eq(G.wearing("scene"), "scene-train", "and is what shows");
});

step("N · the Wardrobe: pictures for papers and pens, names, the not-yet line", async () => {
  const g = K.store.state.governor;
  ["paper-graph", "penset-exam"].forEach((id) => { if (K.governor.item(id) && !g.owned.includes(id)) g.owned.push(id); });
  const pid = K.governor.catalog().find((c) => c.kind === "paper").id;
  if (!g.owned.includes(pid)) g.owned.push(pid);
  K.show("governor", "avatar", { _nav: true }); await app.settle();
  const row = (k) => $(`#main [data-ui~='gov.wardrobe'] .k-gv-ward-row[data-kind='${k}']`);
  assert(row("paper") && row("paper").querySelector(".k-gv-ward-chip .k-gv-pv[data-kind='paper']"), "a paper chip shows the paper (SC-12)");
  assert(row("penset").querySelector(".k-gv-ward-chip .k-gv-pv[data-kind='penset']"), "a pen chip shows the pens");
  assert([...doc.querySelectorAll("#main .k-gv-ward-chip")].every((c) => c.getAttribute("title")), "every chip names itself in full (SC-24)");
  const css = fs.readFileSync(path.join(ROOT, "css/views/governor.css"), "utf8");
  assert(/\.k-gv-ward-n \{[^}]*line-clamp: 2/.test(css), "names wrap to two lines");
  const none = $("#main [data-ui~='gov.wardrobe-none']");
  if (none) assert(!row(none.querySelector("[data-kind]").getAttribute("data-kind")), "a kind owned none of has no row (SC-37)");
});

step("O · the Study set, the repainted sixteen, the outfit words", () => {
  const ink = fs.readFileSync(path.join(ROOT, "css/views/ink.css"), "utf8");
  assert(/data-penset="study"[^{]*\[data-role="accent"\] \{ --ink-c: var\(--amber\)/.test(ink), "the Study set has its own mark (SC-09)");
  ["seal-homura", "seal-tsuki", "seal-ryuu", "seal-sakura", "seal-rai", "seal-hoshi", "frame-gold", "frame-crimson", "frame-jade", "frame-amethyst",
    "shelf-walnut", "shelf-lacquer", "shelf-vermilion", "shrine-gilded", "shrine-ink", "shrine-neon"].forEach((id) => {
    const it = K.governor.item(id);
    assert(it.art && fs.existsSync(path.join(ROOT, "assets/app/img", it.art + ".webp")), id + " uses its repainted art (SC-10)");
  });
  assert(/hoodie/.test(K.governor.item("outfit-dayoff").desc) && !/lanyard/.test(K.governor.item("outfit-exam").desc), "outfits worded as painted (SC-35)");
});

step("P · SC-38: a locked lab names its unlock and sells it here", async () => {
  const g = K.store.state.governor;
  g.owned = g.owned.filter((id) => id !== "trace");
  g.gold = 5000;
  const host = doc.createElement("div"); doc.body.appendChild(host);
  K.governor.lockPanel(host, K.governor.simAccess("tl-stack"), null, { compact: true });
  const why = host.textContent;
  assert(/Trace Lab/.test(why) && /all 4/.test(why), "it names the Trace Lab and its four labs");
  assert(host.querySelector("[data-ui~='gov.lock-unlock']"), "Unlock is offered when affordable");
  assert(!/HP/.test(fs.readFileSync(path.join(ROOT, "js/core/governor.js"), "utf8").match(/function lockPanel[\s\S]*?\n  }\n/)[0]), "the HP branch is gone");
  host.remove();
  K.openShop({ dept: "labs" }); await app.settle();
  const vis = [...doc.querySelectorAll("#main [data-ui~='shop.section']")].filter((x) => !x.hidden);
  assert(vis.length === 1 && vis[0].dataset.group === "labs", "the shop opens at Labs");
});

step("Q · the Shrine card's finish; a painted frame's reach kept clear", async () => {
  const shr = fs.readFileSync(path.join(ROOT, "js/modules/shrine.js"), "utf8");
  assert(/overFinish\(canvas, opts\.finish/.test(shr) && /data-ui": "shrine\.finishes"/.test(shr), "the Shrine's card takes a finish (SC-15)");
  assert(typeof K.reportShare.overFinish === "function", "the finish is laid over by reportShare");
  const g = K.store.state.governor;
  g.avatar.frame = "frame-koi"; if (!g.owned.includes("frame-koi")) g.owned.push("frame-koi");
  assert(K.governor.frameBleed(180, 11) > 20, "a painted frame reaches past a large ring");
  K.show("governor", "status", { _nav: true }); await app.settle();
  const ring = $("#main .k-gv-ring");
  assert(ring && parseInt(ring.style.getPropertyValue("--fbleed"), 10) > 20, "the Seat keeps it clear (SC-03)");
  g.avatar.frame = null;
  eq(K.governor.frameBleed(180, 11), 0, "no frame, no reach");
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
