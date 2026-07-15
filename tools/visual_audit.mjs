/* KurenaiOS live crop/design audit.
   From the repository root, start the two long-running commands separately:
     python3 -m http.server 8765
     "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
       --headless=new --remote-debugging-port=9222 \
       --user-data-dir=/tmp/kos-visual-audit http://127.0.0.1:8765/index.html
   Then run:
     node tools/visual_audit.mjs
   The script drives the real browser UI through CDP and writes inspection
   screenshots to /tmp; it does not alter repository files or real profiles. */
import { writeFile } from "node:fs/promises";

const endpoint = process.env.KOS_CDP || "http://127.0.0.1:9222/json";
const pages = await fetch(endpoint).then(r => {
  if (!r.ok) throw new Error(`CDP discovery failed (${r.status})`);
  return r.json();
});
const page = pages.find(p => p.type === "page" && /127\.0\.0\.1:8765/.test(p.url)) || pages.find(p => p.type === "page");
if (!page) throw new Error("No debuggable KurenaiOS page found.");

const ws = new WebSocket(page.webSocketDebuggerUrl);
const pending = new Map();
const browserErrors = [];
let seq = 0;

await new Promise((resolve, reject) => {
  ws.addEventListener("open", resolve, { once: true });
  ws.addEventListener("error", reject, { once: true });
});
ws.addEventListener("message", event => {
  const msg = JSON.parse(String(event.data));
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) reject(new Error(`${msg.error.message}: ${JSON.stringify(msg.error.data || {})}`));
    else resolve(msg.result || {});
    return;
  }
  if (msg.method === "Runtime.exceptionThrown") {
    browserErrors.push(msg.params.exceptionDetails?.exception?.description || msg.params.exceptionDetails?.text || "Runtime exception");
  }
  if (msg.method === "Runtime.consoleAPICalled" && msg.params.type === "error") {
    browserErrors.push(msg.params.args.map(a => a.value || a.description || "").join(" "));
  }
});

function send(method, params = {}) {
  const id = ++seq;
  ws.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

async function evaluate(expression) {
  const out = await send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
    userGesture: true
  });
  if (out.exceptionDetails) {
    throw new Error(out.exceptionDetails.exception?.description || out.exceptionDetails.text || "Evaluation failed");
  }
  return out.result?.value;
}

const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
function assert(ok, message) { if (!ok) throw new Error(message); }

async function waitFor(expression, label, timeout = 6000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await evaluate(`(() => { try { return !!(${expression}); } catch (_) { return false; } })()`)) return;
    await pause(80);
  }
  throw new Error(`Timed out waiting for ${label}`);
}

async function viewport(width, height) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
  await pause(120);
}

async function screenshot(path) {
  const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  await writeFile(path, Buffer.from(shot.data, "base64"));
}

async function clickText(scope, text) {
  const ok = await evaluate(`(() => {
    const root = document.querySelector(${JSON.stringify(scope)}) || document;
    const b = [...root.querySelectorAll("button")].find(x => x.textContent.trim().includes(${JSON.stringify(text)}));
    if (!b) return false; b.click(); return true;
  })()`);
  assert(ok, `Button not found: ${scope} / ${text}`);
}

async function setRange(label, value) {
  const ok = await evaluate(`(() => {
    const input = document.querySelector('input[aria-label=${JSON.stringify(label)}]');
    if (!input) return false;
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(input, ${JSON.stringify(String(value))});
    input.dispatchEvent(new Event("input", { bubbles: true }));
    return true;
  })()`);
  assert(ok, `Range not found: ${label}`);
}

async function auditView(view, arg, selector) {
  await evaluate(`KOS.show(${JSON.stringify(view)}, ${JSON.stringify(arg)})`);
  if (selector) await waitFor(`document.querySelector(${JSON.stringify(selector)})`, `${view} content`);
  await pause(180);
  const size = await evaluate(`(() => ({
    viewport: innerWidth,
    doc: document.documentElement.scrollWidth,
    mainClient: document.getElementById("main").clientWidth,
    mainScroll: document.getElementById("main").scrollWidth
  }))()`);
  assert(size.doc <= size.viewport + 1, `${view} overflows the viewport (${size.doc} > ${size.viewport})`);
  assert(size.mainScroll <= size.mainClient + 1, `${view} main content overflows (${size.mainScroll} > ${size.mainClient})`);
}

function svgData(width, height, body) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${body}</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

const avatar = svgData(800, 500,
  '<rect width="800" height="500" fill="#382c58"/><rect width="360" height="500" fill="#bd5c4e"/>' +
  '<circle cx="570" cy="210" r="120" fill="#edca78"/><text x="570" y="235" text-anchor="middle" font-size="72" fill="#241b2b">顔</text>');
const banner = svgData(1600, 600,
  '<defs><linearGradient id="g"><stop stop-color="#553b72"/><stop offset=".52" stop-color="#b85c50"/><stop offset="1" stop-color="#d2ac58"/></linearGradient></defs>' +
  '<rect width="1600" height="600" fill="url(#g)"/><circle cx="1250" cy="270" r="190" fill="#f4efe2" fill-opacity=".78"/>' +
  '<text x="1250" y="310" text-anchor="middle" font-size="120" fill="#2a2132">紅</text>');
const cover = svgData(600, 900,
  '<rect width="600" height="900" fill="#263a45"/><rect x="330" width="270" height="900" fill="#a64d45"/>' +
  '<circle cx="410" cy="330" r="150" fill="#dfbf70"/><text x="410" y="375" text-anchor="middle" font-size="120" fill="#2b2330">蒐</text>');

await send("Page.enable");
await send("Runtime.enable");
await send("Log.enable");
await viewport(1440, 900);
const bootOrigin = await evaluate("performance.timeOrigin");
await send("Page.reload", { ignoreCache: true });
await waitFor(`performance.timeOrigin > ${bootOrigin} && document.readyState === 'complete' && window.KOS && KOS.imageCrop && KOS.views.home`, "application boot", 12000);

const seeded = await evaluate(`(async () => {
  const avatar = ${JSON.stringify(avatar)}, banner = ${JSON.stringify(banner)}, cover = ${JSON.stringify(cover)};
  const g = KOS.store.state.governor;
  g.hp = 100;
  g.avatar = { kind: "custom", id: "seal-ember", img: avatar, crop: { x: 22, y: 68, zoom: 1.35 }, frame: null };
  KOS.governor.setBanner("custom", banner, { x: 72, y: 38, zoom: 1.25 });
  const entry = await new Promise((resolve, reject) => KOS.mediadb.add({
    module: "anime", title: "Crop Audit — The Moving Focal Point", status: "inProgress",
    progress: { current: 4, total: 12 }, coverUrl: cover,
    coverCrop: { x: 68, y: 31, zoom: 1.65 },
    externalIds: { anilistId: 990001 }, syncSource: "anilist",
    extra: { bannerImage: banner, studio: "Audit Atelier" }
  }, (err, row) => err ? reject(err) : resolve(row)));
  await new Promise((resolve, reject) => KOS.mediadb.setKV("hero.anime", {
    entryId: entry.id, banner: null, crop: { x: 64, y: 36, zoom: 1.3 }
  }, err => err ? reject(err) : resolve()));
  window.__cropAudit = { entryId: entry.id, avatar, banner, cover };
  KOS.store.save();
  return { entryId: entry.id };
})()`);
assert(seeded?.entryId, "Could not seed the live media entry");

/* Governor avatar: final-ratio preview, source-aware focal click, failed
   replacement recovery, reset/cancel isolation, and real save. */
await evaluate(`KOS.show("governor", "avatar")`);
await waitFor("document.querySelector('.av-grid')", "Governor avatar page");
await clickText("#main", "Edit image");
await waitFor("document.querySelector('.cropper-ov') && !document.querySelector('.cropper-foot .primary').disabled", "loaded avatar cropper");
let ratio = await evaluate(`(() => { const r = document.querySelector('.cropper-preview').getBoundingClientRect(); return r.width / r.height; })()`);
assert(Math.abs(ratio - 1) < 0.03, `Avatar preview ratio is ${ratio}`);
await setRange("Zoom", 2);
await setRange("Horizontal position", 20);
await setRange("Vertical position", 80);
const focal = await evaluate(`(() => {
  const p = document.querySelector('.cropper-preview'), r = p.getBoundingClientRect();
  const init = { bubbles: true, clientX: r.left + r.width * .8, clientY: r.top + r.height * .2 };
  p.dispatchEvent(new MouseEvent("pointerdown", init));
  p.dispatchEvent(new MouseEvent("pointerup", init));
  return document.querySelector('.cropper-ov').cropperApi.getValue().crop;
})()`);
assert(Math.abs(focal.x - 38.75) < 0.8 && Math.abs(focal.y - 50) < 0.8,
  `Focal click did not invert cover/zoom geometry: ${JSON.stringify(focal)}`);
await setRange("Zoom", 1.72);
await setRange("Horizontal position", 63);
await setRange("Vertical position", 24);
await pause(260);
await screenshot("/tmp/kos-cropper-avatar-1440.png");
await clickText(".cropper-foot", "Save image");
await waitFor("!document.querySelector('.cropper-ov')", "avatar crop save");
let savedAvatar = await evaluate(`KOS.store.state.governor.avatar.crop`);
assert(savedAvatar.x === 63 && savedAvatar.y === 24 && savedAvatar.zoom === 1.72, "Avatar crop did not persist from the UI");

await clickText("#main", "Edit image");
await waitFor("document.querySelector('.cropper-ov') && !document.querySelector('.cropper-foot .primary').disabled", "reopened avatar cropper");
const uploadRecovery = await evaluate(`(() => {
  const input = document.querySelector('.cropper-file');
  const transfer = new DataTransfer();
  transfer.items.add(new File(["not an image"], "bad.txt", { type: "text/plain" }));
  Object.defineProperty(input, "files", { configurable: true, value: transfer.files });
  input.dispatchEvent(new Event("change", { bubbles: true }));
  return {
    disabled: document.querySelector('.cropper-foot .primary').disabled,
    status: document.querySelector('.cropper-status').textContent
  };
})()`);
assert(!uploadRecovery.disabled && /image file/i.test(uploadRecovery.status), "Failed upload invalidated the existing source");
await setRange("Zoom", 2.6);
await clickText(".cropper-small-actions", "Reset changes");
const resetCrop = await evaluate(`document.querySelector('.cropper-ov').cropperApi.getValue().crop`);
assert(resetCrop.x === 63 && resetCrop.y === 24 && resetCrop.zoom === 1.72, "Reset did not restore the saved crop");
await setRange("Horizontal position", 5);
await clickText(".cropper-foot", "Cancel");
await waitFor("!document.querySelector('.cropper-ov')", "avatar crop cancel");
savedAvatar = await evaluate(`KOS.store.state.governor.avatar.crop`);
assert(savedAvatar.x === 63 && savedAvatar.y === 24, "Cancel mutated the saved avatar crop");

/* Home and Governor share the source/crop, but use surface-aware contrast. */
await auditView("home", undefined, ".home-id .image-crop-bg");
let homeVars = await evaluate(`(() => {
  const img = document.querySelector('.home-id .image-crop-bg img');
  return { x: img.style.getPropertyValue('--crop-x'), y: img.style.getPropertyValue('--crop-y'), zoom: img.style.getPropertyValue('--crop-zoom'), h: document.querySelector('.home-id').getBoundingClientRect().height };
})()`);
assert(homeVars.x === "72%" && homeVars.y === "38%" && homeVars.zoom === "1.25", "Home banner did not use saved crop metadata");
assert(homeVars.h >= 235, `Home hero is below shared desktop height (${homeVars.h})`);

await evaluate(`KOS.show("governor", "status")`);
await waitFor("document.querySelector('.b-id.banner-dark .image-crop-shade')", "Governor status banner");
const govContrast = await evaluate(`document.querySelector('.b-id .image-crop-shade').style.background`);
assert(/rgba\(16, 14, 10/.test(govContrast), `Governor did not receive the dark contrast scrim: ${govContrast}`);
await screenshot("/tmp/kos-governor-banner-1440.png");

/* Collection hero and nested cover editor. */
await evaluate(`KOS.show("anime")`);
await waitFor("document.querySelector('.vault-hero .image-crop-bg img')", "Collection hero", 8000);
const hero = await evaluate(`(() => {
  const h = document.querySelector('.vault-hero'), img = h.querySelector('.image-crop-bg img');
  return { h: h.getBoundingClientRect().height, x: img.style.getPropertyValue('--crop-x'), y: img.style.getPropertyValue('--crop-y'), z: img.style.getPropertyValue('--crop-zoom') };
})()`);
assert(hero.h >= 235 && hero.x === "64%" && hero.y === "36%" && hero.z === "1.3", `Collection hero geometry/crop mismatch: ${JSON.stringify(hero)}`);
await clickText(".vault-hero", "Banner");
await waitFor("document.querySelector('.cropper-ov') && !document.querySelector('.cropper-foot .primary').disabled", "Collection banner cropper");
ratio = await evaluate(`(() => { const r = document.querySelector('.cropper-preview').getBoundingClientRect(); return r.width / r.height; })()`);
assert(Math.abs(ratio - 3.2) < 0.08, `Hero preview ratio is ${ratio}`);
await setRange("Zoom", 1.4);
await setRange("Horizontal position", 77);
await setRange("Vertical position", 29);
await evaluate(`document.querySelector('.toast')?.classList.remove('show')`);
await pause(260);
await screenshot("/tmp/kos-cropper-hero-1440.png");
await clickText(".cropper-foot", "Save image");
await waitFor("!document.querySelector('.cropper-ov') && document.querySelector('.vault-hero')", "Collection banner save");
const heroSaved = await evaluate(`new Promise((resolve, reject) => KOS.mediadb.getKV("hero.anime", (err, pref) => err ? reject(err) : KOS.mediadb.get(window.__cropAudit.entryId, (e2, row) => e2 ? reject(e2) : resolve({ pref, remote: row.extra.bannerImage }))))`);
assert(heroSaved.pref.banner === null && heroSaved.pref.crop.x === 77 && heroSaved.remote === banner,
  "Remote hero source/attribution was not preserved with its crop");

await clickText(".vault-hero", "Open entry");
await waitFor("document.querySelector('.modal-ov:not(.cropper-ov)')", "media editor");
await clickText(".modal-ov:not(.cropper-ov)", "Position cover");
await waitFor("document.querySelectorAll('.modal-ov').length === 2", "nested cover cropper");
await evaluate(`document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }))`);
await waitFor("!document.querySelector('.cropper-ov') && document.querySelector('.modal-ov:not(.cropper-ov)')", "scoped cropper Escape");
await clickText(".modal-ov:not(.cropper-ov)", "Cancel");
await waitFor("!document.querySelector('.modal-ov')", "media editor cancel");

/* Connected-profile views are rendered against local deterministic API
   fixtures so their real edit actions can be exercised without credentials. */
await evaluate(`(async () => {
  const a = window.__cropAudit;
  await new Promise((resolve, reject) => KOS.mediadb.setKV("profile.anilist.7", {
    banner: { source: null, crop: { x: 19, y: 61, zoom: 1.2 } },
    avatar: { source: null, crop: { x: 71, y: 34, zoom: 1.5 } }
  }, err => err ? reject(err) : resolve()));
  KOS.anilist.getConnection = cb => cb(null, { token: "audit", viewer: { id: 7 } });
  KOS.anilist.fetchProfileBundle = (_token, _id, cb) => cb(null, {
    Viewer: { id: 7, name: "Audit Curator", about: "Local visual fixture", avatar: { large: a.avatar }, bannerImage: a.banner,
      siteUrl: "https://anilist.co/user/audit", createdAt: 1600000000, unreadNotificationCount: 0,
      statistics: { anime: { count: 12, episodesWatched: 42, minutesWatched: 720, meanScore: 80, genres: [], statuses: [] },
        manga: { count: 3, chaptersRead: 18, volumesRead: 2, meanScore: 76, genres: [] } },
      favourites: { anime: { nodes: [] }, manga: { nodes: [] }, characters: { nodes: [] }, staff: { nodes: [] }, studios: { nodes: [] } } },
    followers: { pageInfo: { total: 0 }, followers: [] }, following: { pageInfo: { total: 0 }, following: [] },
    activity: { activities: [] }, notifications: { notifications: [] }
  });
  KOS.show("aniprofile");
})()`);
await waitFor("document.querySelector('.ap-head .image-crop-bg img') && [...document.querySelectorAll('#main button')].some(b => b.textContent.includes('Banner'))", "AniList profile fixture");
const aniProfileVars = await evaluate(`(() => {
  const b = document.querySelector('.ap-head .image-crop-bg img'), a = document.querySelector('.ap-avatar img');
  return { bx: b.style.getPropertyValue('--crop-x'), by: b.style.getPropertyValue('--crop-y'), ax: a.style.getPropertyValue('--crop-x') };
})()`);
assert(aniProfileVars.bx === "19%" && aniProfileVars.by === "61%" && aniProfileVars.ax === "71%", "AniList profile crops did not render");
await clickText("#main", "Banner");
await waitFor("document.querySelector('.cropper-ov') && !document.querySelector('.cropper-foot .primary').disabled", "AniList banner cropper");
await setRange("Horizontal position", 42);
await clickText(".cropper-foot", "Save image");
await waitFor("!document.querySelector('.cropper-ov')", "AniList banner save");
const aniSaved = await evaluate(`new Promise((resolve, reject) => KOS.mediadb.getKV("profile.anilist.7", (err, value) => err ? reject(err) : resolve(value)))`);
assert(aniSaved.banner.source === null && aniSaved.banner.crop.x === 42, "AniList crop/remote source pairing did not persist");

await evaluate(`(async () => {
  const a = window.__cropAudit;
  await new Promise((resolve, reject) => KOS.mediadb.setKV("profile.vndb.u7", {
    banner: { source: a.banner, crop: { x: 82, y: 23, zoom: 1.35 } },
    avatar: { source: a.avatar, crop: { x: 28, y: 70, zoom: 1.4 } }
  }, err => err ? reject(err) : resolve()));
  KOS.vndb.getConnection = cb => cb(null, { token: "audit", user: { id: "u7", username: "Audit Reader" } });
  KOS.vndb.fetchUlistLabels = (_t, _id, cb) => cb(null, []);
  KOS.vndb.fetchUserStats = (_t, _id, cb) => cb(null, { lengthvotes: 0, lengthvotes_sum: 0 });
  KOS.vndb.fetchSiteStats = cb => cb(null, {});
  KOS.show("vndbprofile");
})()`);
await waitFor("document.querySelector('.vp-head .image-crop-bg img') && document.querySelector('.vp-head .ap-avatar img')", "VNDB profile fixture");
await clickText("#main", "Avatar");
await waitFor("document.querySelector('.cropper-ov') && !document.querySelector('.cropper-foot .primary').disabled", "VNDB avatar cropper");
await setRange("Vertical position", 47);
await clickText(".cropper-foot", "Save image");
await waitFor("!document.querySelector('.cropper-ov')", "VNDB avatar save");
const vndbSaved = await evaluate(`new Promise((resolve, reject) => KOS.mediadb.getKV("profile.vndb.u7", (err, value) => err ? reject(err) : resolve(value)))`);
assert(vndbSaved.avatar.source === avatar && vndbSaved.avatar.crop.y === 47, "VNDB local source/crop did not persist");

/* Collection hierarchy: archive stays compact; workspaces preserve their routes/history. */
await auditView("wishlist", undefined, ".collection-workspace-tabs");
const collectionNav = await evaluate(`(() => ({
  labels: [...document.querySelectorAll("#subnav .subnav-item")].map(b => b.textContent.trim()),
  active: document.querySelector("#subnav .subnav-item.active")?.textContent.trim(),
  planner: [...document.querySelectorAll(".collection-workspace-tabs button")].map(b => b.textContent.trim())
}))()`);
assert(JSON.stringify(collectionNav.labels) === JSON.stringify(["Overview", "Anime", "Books", "Visual Novels", "Games", "Shrine", "Planner", "Sync"]),
  `Collection primary navigation is overcrowded: ${JSON.stringify(collectionNav.labels)}`);
assert(collectionNav.active === "Planner" && JSON.stringify(collectionNav.planner) === JSON.stringify(["Budget Planner", "Goals"]),
  "Planner workspace or active navigation is incomplete");
await evaluate("KOS.show('mediasync')");
await waitFor("document.querySelector('.integration-provider')", "Sync workspace");
const integrations = await evaluate(`(() => ({
  providers: document.querySelectorAll('.integration-provider').length,
  facts: [...document.querySelectorAll('.integration-facts')].map(x => x.textContent),
  nested: document.querySelectorAll('.integration-provider .colcard').length
}))()`);
assert(integrations.providers === 2 && integrations.facts.every(text => /Status/.test(text) && /Sync mode/.test(text)) && integrations.nested === 0,
  `Integration overview composition is incomplete: ${JSON.stringify(integrations)}`);
await screenshot("/tmp/kos-integrations-1440.png");
await clickText(".collection-workspace-tabs", "AniList");
await waitFor("document.querySelector('.ap-head')", "AniList profile from Sync");
assert(await evaluate("document.querySelector('#subnav .subnav-item.active')?.textContent.trim() === 'Sync'"),
  "AniList profile did not retain Sync as active");
await evaluate("KOS.back()");
await waitFor("document.querySelector('.collection-workspace-tabs .study-tab.active')?.textContent.includes('Sync & Import')", "back to Sync & Import");
await evaluate("KOS.forward()");
await waitFor("document.querySelector('.ap-head')", "forward to AniList profile");

/* Study comparison: cross-subject data, aligned modes and pair notes use the
   actual modal rather than treating two reference articles as a layout test. */
await evaluate("KOS.show('subject', 'compsci')");
await waitFor("document.querySelector('.subject-grid')", "Study dashboard for comparison");
await clickText("#main", "Compare topics");
await waitFor("document.querySelector('.cmp-modal .cmp-sticky-head')", "Compare Topics workspace");
let comparison = await evaluate(`(() => ({
  selectors: document.querySelectorAll('.cmp-selectors select').length,
  summaries: document.querySelectorAll('.cmp-sticky-head .cmp-topic').length,
  modes: [...document.querySelectorAll('.cmp-tabs button')].map(b => b.textContent.trim()),
  rows: document.querySelectorAll('.cmp-row').length
}))()`);
assert(comparison.selectors === 2 && comparison.summaries === 2 && comparison.rows > 0 &&
  JSON.stringify(comparison.modes) === JSON.stringify(["Overview", "Specification", "Notes", "Key terms", "Exam focus", "Progress"]),
  `Compare Topics workspace is incomplete: ${JSON.stringify(comparison)}`);
await evaluate(`(() => {
  const select = document.querySelectorAll('.cmp-selectors select')[1];
  const option = [...select.options].find(o => o.value.startsWith('maths:'));
  if (!option) return false;
  select.value = option.value;
  select.dispatchEvent(new Event('change', { bubbles: true }));
  return true;
})()`);
await waitFor("[...document.querySelectorAll('.cmp-topic .sub')].some(x => x.textContent.includes('Mathematics'))", "cross-subject comparison");
await clickText(".cmp-tabs", "Key terms");
await waitFor("document.querySelector('.cmp-row')", "key terms comparison row");
await clickText(".cmp-actions", "Comparison note");
await waitFor("document.querySelector('.cmp-note-modal .note-area')", "comparison note editor");
await evaluate(`(() => { const ta = document.querySelector('.cmp-note-modal .note-area'); ta.value = 'Audit: compare the evidence before revision.'; ta.dispatchEvent(new Event('input', { bubbles: true })); })()`);
await clickText(".cmp-note-modal", "Save note");
await waitFor("!document.querySelector('.cmp-note-modal')", "saved comparison note");
assert(await evaluate("Object.values(KOS.store.state.study.compareNotes || {}).includes('Audit: compare the evidence before revision.')"),
  "Comparison note did not persist in study state");
await evaluate(`(() => {
  const [a, b] = document.querySelectorAll('.cmp-selectors select');
  a.value = 'compsci:4.1.1.1'; a.dispatchEvent(new Event('change', { bubbles: true }));
  b.value = 'compsci:4.1.1.2'; b.dispatchEvent(new Event('change', { bubbles: true }));
})()`);
await clickText(".cmp-tabs", "Notes");
await waitFor("document.querySelector('.cmp-notes')", "long structured note comparison");
const longNotes = await evaluate(`(() => {
  const body = document.querySelector('.cmp-body'), row = document.querySelector('.cmp-row');
  body.scrollTop = body.scrollHeight;
  return { client: body.clientHeight, scroll: body.scrollHeight, top: body.scrollTop,
    rowClient: row.clientHeight, rowScroll: row.scrollHeight };
})()`);
assert(longNotes.scroll > longNotes.client && longNotes.top > 0 && longNotes.rowClient === longNotes.rowScroll,
  `Long comparison notes are clipped instead of scrolling: ${JSON.stringify(longNotes)}`);
await screenshot("/tmp/kos-compare-topics-1440.png");
await clickText(".cmp-actions", "Open Topic A");
await waitFor("document.querySelector('#main .page-h')", "open Topic A");
assert(await evaluate("document.querySelector('#main .page-h h1')?.textContent.includes('Data types')"), "Open Topic A did not open the selected reference");
await evaluate("KOS.show('subject', 'compsci')");
await waitFor("document.querySelector('.subject-grid')", "return to Study dashboard");
await clickText("#main", "Compare topics");
await waitFor("document.querySelector('.cmp-modal')", "comparison workspace for focus action");
await clickText(".cmp-actions", "Focus Topic A");
await waitFor("document.querySelector('.fx-link-row')", "prefilled focus timer");
assert(await evaluate(`(() => { const s = document.querySelectorAll('.fx-link-row select'); return s[0].value === 'compsci' && !!s[1].value; })()`),
  "Focus Topic A did not prefill the selected subject/topic");

/* Matrix strip clipping and adjacent-page regression pass. */
await auditView("matrix", undefined, ".med-strip-card");
const stripClip = await evaluate(`(() => {
  const f = document.querySelector('.med-strip-cover'), title = document.querySelector('.med-strip-t');
  const fr = f.getBoundingClientRect(), tr = title.getBoundingClientRect();
  return { overflow: getComputedStyle(f).overflow, aspect: fr.width / fr.height, separated: fr.bottom <= tr.top + 1 };
})()`);
assert(stripClip.overflow === "hidden" && Math.abs(stripClip.aspect - 2 / 3) < 0.02 && stripClip.separated,
  `Matrix strip cover is not independently clipped: ${JSON.stringify(stripClip)}`);

for (const [view, arg, selector] of [
  ["home", undefined, ".home-id"],
  ["subject", "compsci", ".subject-grid"],
  ["help", undefined, ".help-wrap"],
  ["matrix", undefined, ".med-mods"],
  ["mediasync", undefined, ".collection-workspace-tabs"],
  ["governor", "status", ".gov-status"],
  ["data", undefined, "#main"]
]) await auditView(view, arg, selector);

const dataActionButtons = await evaluate(`(() => [...document.querySelectorAll('.data-action .btn')].map(b => ({
  width: Math.round(b.getBoundingClientRect().width), client: b.clientHeight, scroll: b.scrollHeight,
  whiteSpace: getComputedStyle(b).whiteSpace, text: b.textContent.trim() })))()`);
assert(dataActionButtons.length === 4 && dataActionButtons.every(b => b.width === 280 && b.client === b.scroll && b.whiteSpace === 'nowrap'),
  `Backup actions are inconsistent or wrap their labels: ${JSON.stringify(dataActionButtons)}`);
await screenshot("/tmp/kos-backup-1440.png");

await auditView("subject", "maths", ".tree-subject-h");
const sectionCounts = await evaluate(`(() => [...document.querySelectorAll('#tree .sec-head')].map(head => {
  const pc = head.querySelector('.pc'), arr = head.querySelector('.arr');
  return pc && arr ? { countRight: Math.round(pc.getBoundingClientRect().right), arrowLeft: Math.round(arr.getBoundingClientRect().left), arrowRight: Math.round(arr.getBoundingClientRect().right) } : null;
}).filter(Boolean))()`);
assert(sectionCounts.length > 1 && sectionCounts.every(x => x.arrowLeft - x.countRight >= 0) &&
  new Set(sectionCounts.map(x => x.arrowRight)).size === 1,
  `Subject section counts are not consistently anchored beside their arrows: ${JSON.stringify(sectionCounts)}`);

await auditView("help", undefined, ".help-wrap");
const helpWide = await evaluate(`(() => {
  const wrap = document.querySelector('.help-wrap'), content = document.querySelector('.help-content');
  return { columns: getComputedStyle(wrap).gridTemplateColumns.split(' ').length,
    aside: !!document.querySelector('.help-aside'), width: Math.round(content.getBoundingClientRect().width),
    search: Math.round(document.querySelector('.help-search-shell').getBoundingClientRect().width) };
})()`);
assert(helpWide.columns === 3 && helpWide.aside && helpWide.width <= 760 && Math.abs(helpWide.search - helpWide.width) <= 2,
  `Help documentation layout is not a readable wide-screen workspace: ${JSON.stringify(helpWide)}`);
await screenshot("/tmp/kos-help-1440.png");
await evaluate(`(() => { const s = document.querySelector('.help-search'); s.value = 'Focus Timer'; s.dispatchEvent(new Event('input', { bubbles: true })); })()`);
await waitFor("document.querySelectorAll('.help-row[style*=none]').length > 0 && document.querySelector('.help-row.open')", "Help search results");
await clickText(".help-row.open", "Open Focus Timer");
await waitFor("document.querySelector('.fx-setup')", "related Help link");

await viewport(980, 800);
for (const [view, arg, selector] of [
  ["home", undefined, ".home-id"],
  ["subject", "compsci", ".subject-grid"],
  ["matrix", undefined, ".med-mods"],
  ["mediasync", undefined, ".integration-provider"],
  ["governor", "status", ".gov-status"],
  ["data", undefined, "#main"]
]) await auditView(view, arg, selector);
await auditView("help", undefined, ".help-wrap");
const helpNarrow = await evaluate(`(() => ({ aside: getComputedStyle(document.querySelector('.help-aside')).display,
  nav: getComputedStyle(document.querySelector('.help-nav')).display,
  scroll: document.documentElement.scrollWidth, viewport: innerWidth }))()`);
assert(helpNarrow.aside === 'none' && helpNarrow.nav !== 'none' && helpNarrow.scroll <= helpNarrow.viewport + 1,
  `Compact Help workspace does not adapt cleanly: ${JSON.stringify(helpNarrow)}`);
await evaluate("KOS.show('subject', 'compsci')");
await waitFor("document.querySelector('.subject-grid')", "narrow Study dashboard");
await clickText("#main", "Compare topics");
await waitFor("document.querySelector('.cmp-modal')", "narrow Compare Topics workspace");
const narrowCompare = await evaluate(`(() => {
  const modal = document.querySelector('.cmp-modal'), body = document.querySelector('.cmp-body');
  return { viewport: innerWidth, doc: document.documentElement.scrollWidth, modal: modal.scrollWidth, modalClient: modal.clientWidth,
    cols: getComputedStyle(document.querySelector('.cmp-row-cells')).gridTemplateColumns, bodyOverflow: getComputedStyle(body).overflowY };
})()`);
assert(narrowCompare.doc <= narrowCompare.viewport + 1 && narrowCompare.modal <= narrowCompare.modalClient + 1 &&
  narrowCompare.cols.split(' ').length === 1 && narrowCompare.bodyOverflow === 'auto',
  `Narrow comparison workspace overflows or keeps unreadable columns: ${JSON.stringify(narrowCompare)}`);
await clickText(".cmp-modal", "Close");
await evaluate(`KOS.show("anime")`);
await waitFor("document.querySelector('.vault-hero')", "narrow Collection hero");
await screenshot("/tmp/kos-anime-hero-980.png");

/* Actual full backup/restore in the browser, followed by rendered checks. */
await evaluate(`(async () => {
  let blob = null;
  const oldClick = HTMLAnchorElement.prototype.click;
  const oldCreate = URL.createObjectURL;
  const oldRevoke = URL.revokeObjectURL;
  HTMLAnchorElement.prototype.click = function () {};
  URL.createObjectURL = value => { blob = value; return "blob:http://127.0.0.1/audit"; };
  URL.revokeObjectURL = function () {};
  try {
    await new Promise((resolve, reject) => KOS.store.exportFull(err => err ? reject(err) : resolve()));
    window.__cropAudit.backup = await blob.text();
  } finally {
    HTMLAnchorElement.prototype.click = oldClick;
    URL.createObjectURL = oldCreate;
    URL.revokeObjectURL = oldRevoke;
  }
  const parsed = JSON.parse(window.__cropAudit.backup);
  if (!parsed.state.governor.avatar.crop || !parsed.mediaKV.some(x => x.key === "hero.anime")) throw new Error("Crop metadata missing from backup");
  KOS.store.state.governor.avatar.crop = { x: 1, y: 1, zoom: 1 };
  await new Promise((resolve, reject) => KOS.mediadb.setKV("hero.anime", { entryId: window.__cropAudit.entryId, crop: { x: 1, y: 1, zoom: 1 } }, err => err ? reject(err) : resolve()));
  const file = new File([window.__cropAudit.backup], "audit-backup.json", { type: "application/json" });
  await new Promise((resolve, reject) => KOS.store.importFull(file, (err, report) => err ? reject(err) : resolve(report)));
})()`);
const restored = await evaluate(`new Promise((resolve, reject) => KOS.mediadb.getKV("hero.anime", (err, hero) => err ? reject(err) : resolve({ avatar: KOS.store.state.governor.avatar.crop, hero })))`);
assert(restored.avatar.x === 63 && restored.avatar.y === 24 && restored.hero.crop.x === 77,
  `Backup restore lost crop metadata: ${JSON.stringify(restored)}`);

await pause(300);
const reloadOrigin = await evaluate("performance.timeOrigin");
await send("Page.reload", { ignoreCache: true });
await waitFor(`performance.timeOrigin > ${reloadOrigin} && document.readyState === 'complete' && window.KOS && KOS.imageCrop`, "post-save reload", 12000);
const afterReload = await evaluate(`KOS.store.state.governor.avatar.crop`);
assert(afterReload.x === 63 && afterReload.y === 24 && afterReload.zoom === 1.72, "Avatar crop did not survive reload");
await evaluate(`KOS.show("home")`);
await waitFor("document.querySelector('.home-id .image-crop-bg img')", "post-reload Home banner");
const reloadBanner = await evaluate(`(() => { const i = document.querySelector('.home-id .image-crop-bg img'); return [i.style.getPropertyValue('--crop-x'), i.style.getPropertyValue('--crop-y')]; })()`);
assert(reloadBanner[0] === "72%" && reloadBanner[1] === "38%", "Banner crop did not render after reload/restore");

await viewport(1440, 900);
await screenshot("/tmp/kos-home-restored-1440.png");
assert(browserErrors.length === 0, `Browser errors:\n${browserErrors.join("\n")}`);

console.log("VISUAL AUDIT PASS — live crop workflows, Compare Topics, persistence, backup/restore and responsive adjacent pages verified");
console.log("Screenshots: /tmp/kos-cropper-avatar-1440.png, /tmp/kos-cropper-hero-1440.png, /tmp/kos-compare-topics-1440.png, /tmp/kos-help-1440.png, /tmp/kos-backup-1440.png, /tmp/kos-anime-hero-980.png, /tmp/kos-home-restored-1440.png");
ws.close();
