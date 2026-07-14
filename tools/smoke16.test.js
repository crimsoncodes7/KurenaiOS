/* Kurenai OS — smoke16.test.js
   Reusable, non-destructive image positioning suite.

   Covers the shared crop contract, modal lifecycle, render helpers, whole-
   source upload preparation, Collection schema/persistence, intentional hero
   editing, Governor/localStorage state, and full backup/restore across both
   localStorage and IndexedDB.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke16.test.js                                           */

const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const dom = new JSDOM(html, {
  url: "http://localhost/index.html",
  runScripts: "outside-only",
  pretendToBeVisual: true
});
const { window } = dom;
const { document } = window;
const errors = [];
window.addEventListener("error", e => errors.push("window error: " + e.message));

const noop = () => {};
const ctxStub = new Proxy({}, {
  get: (t, k) => k === "measureText" ? () => ({ width: 10 })
    : (typeof k === "string" ? noop : undefined),
  set: () => true
});
window.HTMLCanvasElement.prototype.getContext = () => ctxStub;
window.HTMLCanvasElement.prototype.toDataURL = () => "data:image/jpeg;base64,cHJlcGFyZWQ=";
window.requestAnimationFrame = cb => setTimeout(cb, 0);
window.confirm = () => true;
window.__kosAutoConfirm = true;
window.fetch = () => Promise.resolve({
  ok: true, status: 200, headers: { get: () => null },
  json: () => Promise.resolve({}), text: () => Promise.resolve("")
});

const { indexedDB, IDBKeyRange } = require("fake-indexeddb");
window.indexedDB = indexedDB;
window.IDBKeyRange = IDBKeyRange;

const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
for (const src of scripts) {
  try { window.eval(fs.readFileSync(path.join(ROOT, src), "utf8")); }
  catch (e) { errors.push(`LOAD FAIL ${src}: ${e.message}`); }
}
const KOS = window.KOS;
if (KOS.autosync) KOS.autosync.stop();
if (KOS.governor) KOS.governor.debugUnlockAll();

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function p(fn) {
  return new Promise((resolve, reject) => fn((err, out) => {
    if (err) reject(err instanceof Error ? err : new Error(err.message || String(err)));
    else resolve(out);
  }));
}
const tick = ms => new Promise(resolve => setTimeout(resolve, ms || 0));
async function waitFor(cond, ms) {
  const until = Date.now() + (ms || 2000);
  while (Date.now() < until) {
    if (cond()) return true;
    await tick(20);
  }
  return !!cond();
}
function cropEq(actual, expected, label) {
  const a = actual || {}, e = expected || {};
  for (const key of ["x", "y", "zoom"]) {
    if (a[key] !== e[key]) throw new Error(`${label || "crop"}.${key}: expected ${e[key]}, got ${a[key]}`);
  }
}
function button(root, text) {
  const hit = [...root.querySelectorAll("button")].find(b => b.textContent.trim() === text);
  if (!hit) throw new Error(`button not found: ${text}`);
  return hit;
}
function loadPreview(overlay, naturalWidth, naturalHeight) {
  const img = overlay.querySelector(".cropper-preview img");
  if (!img) throw new Error("crop preview image missing");
  if (naturalWidth && naturalHeight) {
    Object.defineProperties(img, {
      naturalWidth: { configurable: true, value: naturalWidth },
      naturalHeight: { configurable: true, value: naturalHeight }
    });
  }
  img.dispatchEvent(new window.Event("load"));
  return img;
}
function range(overlay, label, value) {
  const input = overlay.querySelector(`input[type="range"][aria-label="${label}"]`);
  if (!input) throw new Error(`range missing: ${label}`);
  input.value = String(value);
  input.dispatchEvent(new window.Event("input", { bubbles: true }));
  return input;
}
function getKV(key) { return p(cb => KOS.mediadb.getKV(key, cb)); }

/* ============ 1 · shared crop value contract ============ */
console.log("== image crop contract ==");

step("legacy/missing crop metadata renders as centred cover-fit", async () => {
  cropEq(KOS.imageCrop.value(null), { x: 50, y: 50, zoom: 1 }, "legacy centre");
  if (KOS.imageCrop.normalise(null) !== null) throw new Error("untouched legacy metadata must remain null on persistence");
  if (!KOS.imageCrop.same(undefined, { x: 50, y: 50, zoom: 1 })) throw new Error("legacy value must compare equal to centre");
});

step("normalise clamps, rounds, accepts numeric strings, and never mutates input", async () => {
  const raw = { x: -12.345, y: 128.889, zoom: 9 };
  const before = JSON.stringify(raw);
  cropEq(KOS.imageCrop.normalise(raw), { x: 0, y: 100, zoom: 3 }, "clamped");
  if (JSON.stringify(raw) !== before) throw new Error("normalise mutated its input");
  cropEq(KOS.imageCrop.normalise({ x: "12.345", y: "bad", zoom: 0.2 }),
    { x: 12.35, y: 50, zoom: 1 }, "coerced");
});

/* ============ 2 · rendering helpers ============ */
console.log("== render helpers ==");

step("image() applies one reusable class and focal/zoom CSS variables", async () => {
  const img = KOS.imageCrop.image("https://images.example/cover.jpg", { alt: "Cover" }, { x: 23, y: 78, zoom: 1.75 });
  if (!img.classList.contains("crop-media")) throw new Error("shared crop-media class missing");
  if (img.getAttribute("src") !== "https://images.example/cover.jpg") throw new Error("source URL was rewritten");
  if (img.style.getPropertyValue("--crop-x") !== "23%") throw new Error("x CSS variable missing");
  if (img.style.getPropertyValue("--crop-y") !== "78%") throw new Error("y CSS variable missing");
  if (img.style.getPropertyValue("--crop-zoom") !== "1.75") throw new Error("zoom CSS variable missing");

  const legacy = KOS.imageCrop.image("legacy.jpg", {}, null);
  if (legacy.style.getPropertyValue("--crop-x") !== "50%" || legacy.style.getPropertyValue("--crop-y") !== "50%") {
    throw new Error("legacy image did not receive sensible centre variables");
  }
});

step("background() owns one replaceable child layer and preserves host content", async () => {
  const host = document.createElement("section");
  const content = document.createElement("p");
  content.textContent = "kept";
  host.appendChild(content);
  KOS.imageCrop.background(host, "https://images.example/one.jpg", { x: 11, y: 66, zoom: 1.4 }, {
    overlay: "linear-gradient(#0008,#0000)", className: "test-layer"
  });
  let layer = host.querySelector(".image-crop-bg.test-layer");
  if (!host.classList.contains("image-crop-host") || !layer) throw new Error("background layer contract missing");
  if (layer !== host.firstElementChild) throw new Error("background layer must sit behind host content");
  if (!layer.querySelector(".image-crop-shade")) throw new Error("requested scrim missing");
  cropEq({
    x: Number(layer.querySelector("img").style.getPropertyValue("--crop-x").replace("%", "")),
    y: Number(layer.querySelector("img").style.getPropertyValue("--crop-y").replace("%", "")),
    zoom: Number(layer.querySelector("img").style.getPropertyValue("--crop-zoom"))
  }, { x: 11, y: 66, zoom: 1.4 }, "background vars");

  KOS.imageCrop.background(host, "https://images.example/two.jpg", null);
  if (host.querySelectorAll(":scope > .image-crop-bg").length !== 1) throw new Error("background calls accumulated layers");
  if (!host.contains(content)) throw new Error("background replacement removed real host content");
  KOS.imageCrop.clearBackground(host);
  if (host.querySelector(".image-crop-bg") || host.classList.contains("image-crop-host")) throw new Error("clearBackground left crop chrome behind");
  if (!host.contains(content)) throw new Error("clearBackground removed real host content");
});

step("prepareFile scales the whole source image without destructive source-crop coordinates", async () => {
  const OriginalReader = window.FileReader;
  const OriginalImage = window.Image;
  const originalContext = window.HTMLCanvasElement.prototype.getContext;
  const originalToDataURL = window.HTMLCanvasElement.prototype.toDataURL;
  let drawArgs = null;
  function FakeReader() {}
  FakeReader.prototype.readAsDataURL = function () {
    this.result = "data:image/jpeg;base64,c291cmNl";
    this.onload();
  };
  function FakeImage() { this.width = 1200; this.height = 600; }
  Object.defineProperty(FakeImage.prototype, "src", {
    set: function (v) { this._src = v; this.onload(); }, get: function () { return this._src; }
  });
  window.FileReader = FakeReader;
  window.Image = FakeImage;
  window.HTMLCanvasElement.prototype.getContext = () => ({
    drawImage: function () { drawArgs = [...arguments]; }, fillRect: noop
  });
  window.HTMLCanvasElement.prototype.toDataURL = () => "data:image/jpeg;base64,cHJlcGFyZWQ=";
  try {
    const result = await new Promise((resolve, reject) => {
      const file = new window.File(["image bytes"], "wide.jpg", { type: "image/jpeg" });
      KOS.imageCrop.prepareFile(file, { maxWidth: 600, maxHeight: 600, maxBytes: 100000 }, (err, data, meta) => {
        if (err) reject(err); else resolve({ data, meta });
      });
    });
    if (!/^data:image\/jpeg/.test(result.data)) throw new Error("prepared source is not a data URL");
    if (result.meta.width !== 600 || result.meta.height !== 300) throw new Error("whole-image aspect ratio was not preserved");
    if (!drawArgs || drawArgs.length !== 5 || drawArgs[1] !== 0 || drawArgs[2] !== 0 || drawArgs[3] !== 600 || drawArgs[4] !== 300) {
      throw new Error("canvas draw must be whole-image drawImage(img,0,0,width,height), got " + JSON.stringify(drawArgs && drawArgs.slice(1)));
    }
  } finally {
    window.FileReader = OriginalReader;
    window.Image = OriginalImage;
    window.HTMLCanvasElement.prototype.getContext = originalContext;
    window.HTMLCanvasElement.prototype.toDataURL = originalToDataURL;
  }
});

/* ============ 3 · reusable modal lifecycle ============ */
console.log("== cropper modal ==");

step("modal converts a focal click through cover-fit and zoom source geometry", async () => {
  const original = { x: 20, y: 30, zoom: 1.2 };
  const originalJSON = JSON.stringify(original);
  let saved = null, cancelled = 0;
  const overlay = KOS.imageCrop.open({
    title: "Position test hero", source: "https://images.example/hero.jpg", crop: original,
    aspect: 3.2, allowUpload: false,
    onSave: result => { saved = result; }, onCancel: () => { cancelled++; }
  });
  const preview = overlay.querySelector(".cropper-preview");
  if (!/aspect-ratio:\s*3\.2/.test(preview.getAttribute("style") || "")) {
    throw new Error("final aspect ratio not reflected in preview: " + (preview.getAttribute("style") || "<none>"));
  }
  if (!button(overlay, "Save image").disabled) throw new Error("save must wait for a valid preview load");
  /* Portrait source in a wide preview: object-fit cover scales 100×200 to
     200×400, then the saved 1.2 zoom applies. A click therefore cannot be
     copied directly from preview percentages into source percentages. */
  loadPreview(overlay, 100, 200);
  if (button(overlay, "Save image").disabled) throw new Error("loaded source did not enable save");

  preview.getBoundingClientRect = () => ({ left: 10, top: 20, width: 200, height: 100, right: 210, bottom: 120 });
  preview.dispatchEvent(new window.MouseEvent("pointerdown", { bubbles: true, clientX: 160, clientY: 65 }));
  preview.dispatchEvent(new window.MouseEvent("pointerup", { bubbles: true, clientX: 160, clientY: 65 }));
  cropEq(overlay.cropperApi.getValue().crop, { x: 65.83, y: 33.13, zoom: 1.2 }, "source-aware clicked focus");

  button(overlay, "Centre image").click();
  cropEq(overlay.cropperApi.getValue().crop, { x: 50, y: 50, zoom: 1 }, "centred");
  button(overlay, "Reset changes").click();
  /* reset reassigns src, so mark the restored preview ready again */
  loadPreview(overlay);
  cropEq(overlay.cropperApi.getValue().crop, original, "reset");

  range(overlay, "Horizontal position", 71.4);
  range(overlay, "Vertical position", 18.6);
  range(overlay, "Zoom", 2.25);
  button(overlay, "Save image").click();
  if (!saved) throw new Error("save callback did not run");
  cropEq(saved.crop, { x: 71.4, y: 18.6, zoom: 2.25 }, "saved");
  if (saved.source !== "https://images.example/hero.jpg" || saved.sourceChanged) throw new Error("unchanged source was not preserved");
  if (cancelled) throw new Error("saving fired cancel callback");
  if (document.body.contains(overlay)) throw new Error("saved modal was not removed");
  if (JSON.stringify(original) !== originalJSON) throw new Error("modal mutated caller crop before save");
});

step("cancel discards working state and URL entry reports a changed source only on save", async () => {
  const original = { x: 9, y: 91, zoom: 1.1 };
  let saved = 0, cancelled = 0;
  let overlay = KOS.imageCrop.open({
    source: "https://images.example/original.jpg", crop: original, allowUpload: false,
    onSave: () => { saved++; }, onCancel: () => { cancelled++; }
  });
  loadPreview(overlay);
  range(overlay, "Zoom", 2.8);
  button(overlay, "Cancel").click();
  if (saved !== 0 || cancelled !== 1) throw new Error("cancel callback lifecycle is incorrect");
  cropEq(original, { x: 9, y: 91, zoom: 1.1 }, "cancelled caller value");

  let result = null;
  overlay = KOS.imageCrop.open({ allowUpload: false, allowUrl: true, onSave: value => { result = value; } });
  const url = overlay.querySelector(".cropper-url");
  url.value = "https://images.example/from-url.jpg";
  button(overlay, "Use URL").click();
  loadPreview(overlay);
  button(overlay, "Save image").click();
  if (!result || result.source !== url.value || !result.sourceChanged) throw new Error("URL source was not committed correctly");
  cropEq(result.crop, { x: 50, y: 50, zoom: 1 }, "new URL centre");
});

step("originalSource restores its own originalCrop before save", async () => {
  let result = null;
  const originalCrop = { x: 14, y: 86, zoom: 1.35 };
  const overlay = KOS.imageCrop.open({
    source: "data:image/jpeg;base64,Y3VzdG9t", crop: { x: 70, y: 20, zoom: 2.2 },
    originalSource: "https://images.example/original-source.jpg", originalCrop,
    originalLabel: "Use supplied artwork", allowUpload: false,
    onSave: value => { result = value; }
  });
  loadPreview(overlay);
  button(overlay, "Use supplied artwork").click();
  loadPreview(overlay);
  const restored = overlay.cropperApi.getValue();
  if (restored.source !== "https://images.example/original-source.jpg") throw new Error("original source was not restored");
  cropEq(restored.crop, originalCrop, "original source crop");
  button(overlay, "Save image").click();
  if (!result || !result.sourceChanged) throw new Error("restored original source was not saved as the selected source");
  cropEq(result.crop, originalCrop, "saved original crop");
});

step("a failed replacement upload leaves an already-loaded source saveable", async () => {
  const overlay = KOS.imageCrop.open({
    source: "https://images.example/valid-existing.jpg", crop: { x: 42, y: 58, zoom: 1.25 },
    allowUpload: true
  });
  loadPreview(overlay);
  const save = button(overlay, "Save image");
  if (save.disabled) throw new Error("valid existing source did not begin saveable");
  const fileInput = overlay.querySelector(".cropper-file");
  Object.defineProperty(fileInput, "files", {
    configurable: true,
    value: [new window.File(["not an image"], "notes.txt", { type: "text/plain" })]
  });
  fileInput.dispatchEvent(new window.Event("change", { bubbles: true }));
  if (save.disabled) throw new Error("failed replacement invalidated the already-loaded source");
  if (!/Choose an image file/i.test(overlay.querySelector(".cropper-status").textContent)) {
    throw new Error("replacement error was not retained for the user");
  }
  cropEq(overlay.cropperApi.getValue().crop, { x: 42, y: 58, zoom: 1.25 }, "crop after failed replacement");
  button(overlay, "Cancel").click();
});

step("cover control centres a typed URL and Use saved cover restores its source/crop pair", async () => {
  const entry = { coverUrl: "https://images.example/manual-cover.jpg", coverCrop: { x: 30, y: 40, zoom: 1.1 } };
  const input = document.createElement("input");
  input.value = entry.coverUrl;
  const control = KOS.medview.coverPositionControl(entry, input, { allowUpload: false });
  if (control.sourceFor() !== entry.coverUrl) throw new Error("sourceFor did not expose the saved cover");
  input.value = "https://images.example/newly-typed-cover.jpg";
  if (control.sourceFor() !== input.value) throw new Error("sourceFor ignored the newly typed URL");
  if (control.cropFor(input.value) !== null) throw new Error("saved crop leaked onto newly typed artwork");
  button(control.node, "⌖ Position cover…").click();
  const overlay = [...document.querySelectorAll(".cropper-ov")].pop();
  if (!overlay) throw new Error("cover control did not launch the shared cropper");
  if (overlay.cropperApi.getValue().source !== input.value) throw new Error("typed URL was not used as the crop candidate");
  cropEq(overlay.cropperApi.getValue().crop, { x: 50, y: 50, zoom: 1 }, "new URL centre");
  loadPreview(overlay);
  button(overlay, "Use saved cover").click();
  loadPreview(overlay);
  if (overlay.cropperApi.getValue().source !== entry.coverUrl) throw new Error("Use saved cover did not restore the saved source");
  cropEq(overlay.cropperApi.getValue().crop, entry.coverCrop, "restored saved cover crop");
  range(overlay, "Horizontal position", 64);
  range(overlay, "Vertical position", 22);
  range(overlay, "Zoom", 1.8);
  button(overlay, "Save image").click();
  cropEq(entry.coverCrop, { x: 30, y: 40, zoom: 1.1 }, "unsaved entry");
  if (control.sourceFor() !== entry.coverUrl || input.value !== entry.coverUrl) throw new Error("saved cover source did not return to the editor field");
  cropEq(control.cropFor(entry.coverUrl), { x: 64, y: 22, zoom: 1.8 }, "editor draft");
  if (control.cropFor("https://images.example/different.jpg") !== null) throw new Error("crop leaked onto a different source URL");
});

step("masked local cover stays usable through sourceFor without exposing its data URL", async () => {
  const dataUrl = "data:image/jpeg;base64,bG9jYWwtY292ZXI=";
  const entry = { coverUrl: dataUrl, coverCrop: { x: 72, y: 18, zoom: 1.7 } };
  const input = document.createElement("input");
  input.placeholder = "https://…";
  const control = KOS.medview.coverPositionControl(entry, input, { allowUpload: true, maskDataUrl: true });
  if (input.value) throw new Error("local data URL was exposed in the visible URL field");
  if (!/Local cover selected/i.test(input.placeholder)) throw new Error("masked cover did not explain its local source");
  if (control.sourceFor() !== dataUrl) throw new Error("sourceFor lost the masked local source");
  cropEq(control.cropFor(control.sourceFor()), entry.coverCrop, "masked saved crop");

  input.value = "https://images.example/replacement.jpg";
  if (control.sourceFor() !== input.value || control.cropFor(input.value) !== null) {
    throw new Error("typed replacement did not supersede the masked source at centred default");
  }
  button(control.node, "⌖ Position cover…").click();
  const overlay = [...document.querySelectorAll(".cropper-ov")].pop();
  cropEq(overlay.cropperApi.getValue().crop, { x: 50, y: 50, zoom: 1 }, "masked replacement centre");
  loadPreview(overlay);
  button(overlay, "Use saved cover").click();
  loadPreview(overlay);
  cropEq(overlay.cropperApi.getValue().crop, entry.coverCrop, "masked restored crop");
  button(overlay, "Save image").click();
  if (input.value || control.sourceFor() !== dataUrl) throw new Error("restored local source was not re-masked after save");
  if (input.value.includes("data:image")) throw new Error("data URL leaked into the editor UX");
});

/* ============ 4 · IndexedDB schema and source attribution ============ */
console.log("== media persistence ==");
let animeId, bookId;

step("mediadb normalises top-level and per-volume crop metadata; old entries stay valid", async () => {
  const anime = await p(cb => KOS.mediadb.add({
    module: "anime", title: "Crop Source", status: "inProgress",
    progress: { current: 2, total: 12 }, coverUrl: "https://cdn.example/cover-a.jpg",
    coverCrop: { x: -8, y: 101, zoom: 4 },
    externalIds: { anilistId: 160016 }, syncSource: "anilist",
    extra: { bannerImage: "https://cdn.example/banner-attribution.jpg", studio: "Source Studio" }
  }, cb));
  animeId = anime.id;
  cropEq(anime.coverCrop, { x: 0, y: 100, zoom: 3 }, "anime cover");
  if (anime.coverUrl !== "https://cdn.example/cover-a.jpg") throw new Error("cover source was altered by crop normalisation");
  if (anime.coverCropSource !== anime.coverUrl) throw new Error("new crop was not fingerprinted to its source");

  const book = await p(cb => KOS.mediadb.add({
    module: "books", title: "Physical Crop", status: "planned", coverUrl: "https://cdn.example/book.jpg",
    coverCrop: { x: 12.345, y: 56.789, zoom: 1.23456 },
    physical: { owned: true, volumes: [
      { number: 1, condition: "good", coverUrl: "data:image/jpeg;base64,dm9sdW1l", coverCrop: { x: 99, y: -1, zoom: 2.2222 } }
    ] }
  }, cb));
  bookId = book.id;
  cropEq(book.coverCrop, { x: 12.35, y: 56.79, zoom: 1.235 }, "book cover");
  if (book.coverCropSource !== book.coverUrl) throw new Error("book crop/source pair was not persisted");
  cropEq(book.physical.volumes[0].coverCrop, { x: 99, y: 0, zoom: 2.222 }, "volume cover");

  const legacy = await p(cb => KOS.mediadb.add({ module: "game", title: "Legacy no crop", coverUrl: "legacy-cover.jpg" }, cb));
  if (legacy.coverCrop !== null) throw new Error("legacy/no-metadata entry should normalise to null");
  if (legacy.coverCropSource !== null) throw new Error("uncropped legacy cover gained a meaningless source fingerprint");
  const node = KOS.medview.cover(legacy, "遊").querySelector("img");
  if (!node || node.style.getPropertyValue("--crop-x") !== "50%") throw new Error("legacy media cover does not render centred");
});

step("sync merge keeps crop paired to its source and preserves remote attribution", async () => {
  await p(cb => KOS.mediadb.bulkUpsert([{
    module: "anime", title: "Crop Source (synced)", status: "inProgress",
    progress: { current: 3, total: 12 }, coverUrl: "https://cdn.example/cover-b.jpg",
    externalIds: { anilistId: 160016 }, syncSource: "anilist",
    extra: { bannerImage: null, studio: null }
  }], {}, cb));
  const anime = await p(cb => KOS.mediadb.get(animeId, cb));
  cropEq(anime.coverCrop, { x: 0, y: 100, zoom: 3 }, "merged cover crop");
  if (anime.coverUrl !== "https://cdn.example/cover-a.jpg" || anime.coverCropSource !== anime.coverUrl) {
    throw new Error("positioned crop was detached from its original artwork");
  }
  if (anime.extra.bannerImage !== "https://cdn.example/banner-attribution.jpg") throw new Error("banner attribution/source was erased by sync");
  if (anime.extra.studio !== "Source Studio") throw new Error("existing source metadata was erased by null sync fields");
});

step("entry, volume, hero and profile crop metadata round-trip through media export/import", async () => {
  const heroPref = { entryId: animeId, banner: null, crop: { x: 38, y: 62, zoom: 1.45 } };
  const aniProfile = {
    banner: { source: null, crop: { x: 25, y: 44, zoom: 1.3 } },
    avatar: { source: "data:image/webp;base64,YXZhdGFy", crop: { x: 66, y: 31, zoom: 2 } }
  };
  const vnProfile = {
    banner: { source: "data:image/jpeg;base64,dm5iYW5uZXI=", crop: { x: 70, y: 20, zoom: 1.8 } }
  };
  await p(cb => KOS.mediadb.setKV("hero.anime", heroPref, cb));
  await p(cb => KOS.mediadb.setKV("profile.anilist.42", aniProfile, cb));
  await p(cb => KOS.mediadb.setKV("profile.vndb.u7", vnProfile, cb));

  const exported = await p(cb => KOS.mediadb.exportAll(cb));
  const expBook = exported.entries.find(e => e.id === bookId);
  cropEq(expBook.coverCrop, { x: 12.35, y: 56.79, zoom: 1.235 }, "exported book");
  if (expBook.coverCropSource !== expBook.coverUrl) throw new Error("export detached book crop from its source");
  cropEq(expBook.physical.volumes[0].coverCrop, { x: 99, y: 0, zoom: 2.222 }, "exported volume");
  await p(cb => KOS.mediadb.importAll(exported, cb));

  const book = await p(cb => KOS.mediadb.get(bookId, cb));
  cropEq(book.coverCrop, { x: 12.35, y: 56.79, zoom: 1.235 }, "restored book");
  if (book.coverCropSource !== book.coverUrl) throw new Error("import detached book crop from its source");
  cropEq(book.physical.volumes[0].coverCrop, { x: 99, y: 0, zoom: 2.222 }, "restored volume");
  cropEq((await getKV("hero.anime")).crop, heroPref.crop, "restored hero");
  cropEq((await getKV("profile.anilist.42")).avatar.crop, aniProfile.avatar.crop, "restored AniList avatar");
  cropEq((await getKV("profile.vndb.u7")).banner.crop, vnProfile.banner.crop, "restored VNDB banner");
  if ((await getKV("profile.anilist.42")).banner.source !== null) throw new Error("remote AniList source sentinel changed during backup");
});

step("Collection hero repositions the remote banner without copying or replacing its source", async () => {
  const holder = document.createElement("div");
  document.body.appendChild(holder);
  KOS.medview.heroCard(holder, "anime", KOS.media.module("anime"), noop);
  if (!await waitFor(() => holder.querySelector(".vault-hero"), 2000)) throw new Error("Collection hero did not render");
  const hero = holder.querySelector(".vault-hero");
  const bg = hero.querySelector(":scope > .image-crop-bg img");
  if (!bg || bg.getAttribute("src") !== "https://cdn.example/banner-attribution.jpg") throw new Error("remote title banner was not used as the hero source");
  if (bg.style.getPropertyValue("--crop-x") !== "38%" || bg.style.getPropertyValue("--crop-zoom") !== "1.45") {
    throw new Error("persisted hero crop was not rendered");
  }
  button(hero, "✎ Banner").click();
  const overlay = [...document.querySelectorAll(".cropper-ov")].pop();
  if (!overlay) throw new Error("intentional hero action did not launch the shared cropper");
  loadPreview(overlay);
  range(overlay, "Horizontal position", 47);
  range(overlay, "Vertical position", 29);
  range(overlay, "Zoom", 1.9);
  button(overlay, "Save image").click();
  await tick(80);
  const pref = await getKV("hero.anime");
  if (pref.banner !== null) throw new Error("positioning a remote banner copied it into the custom-source field");
  cropEq(pref.crop, { x: 47, y: 29, zoom: 1.9 }, "edited hero");
  const entry = await p(cb => KOS.mediadb.get(animeId, cb));
  if (entry.extra.bannerImage !== "https://cdn.example/banner-attribution.jpg") throw new Error("hero editing modified remote attribution/source data");
  holder.remove();
});

/* ============ 5 · Governor, localStorage and full restore ============ */
console.log("== app state and backup ==");
let wishlistId;

step("Governor avatar/banner store metadata and render consistently from existing edit actions", async () => {
  KOS.governor.setBanner("custom", "data:image/jpeg;base64,YmFubmVy", { x: 17, y: 83, zoom: 1.6 });
  cropEq(KOS.store.state.governor.bannerCrop, { x: 17, y: 83, zoom: 1.6 }, "Governor banner");
  const bannerHost = document.createElement("div");
  if (!KOS.governor.applyBanner(bannerHost)) throw new Error("custom Governor banner did not apply");
  const bannerImg = bannerHost.querySelector(".image-crop-bg img");
  if (!bannerImg || bannerImg.style.getPropertyValue("--crop-y") !== "83%") throw new Error("Governor banner crop not rendered");

  const overlay = KOS.governor.editAvatar();
  overlay.cropperApi.setSource("data:image/png;base64,YXZhdGFy", true);
  loadPreview(overlay);
  range(overlay, "Horizontal position", 61);
  range(overlay, "Vertical position", 37);
  range(overlay, "Zoom", 2.1);
  button(overlay, "Save image").click();
  const avatar = KOS.store.state.governor.avatar;
  if (avatar.kind !== "custom" || avatar.img !== "data:image/png;base64,YXZhdGFy") throw new Error("custom avatar source not stored");
  cropEq(avatar.crop, { x: 61, y: 37, zoom: 2.1 }, "Governor avatar");
  const avatarImg = KOS.governor.avatarNode(64).querySelector("img");
  if (!avatarImg || avatarImg.style.getPropertyValue("--crop-x") !== "61%") throw new Error("avatar crop not rendered");
});

step("wishlist cover metadata uses localStorage state and the shared hero renderer", async () => {
  const item = KOS.wishlist.add({
    module: "books", title: "Crop Wish", coverUrl: "https://images.example/wish.jpg",
    coverCrop: { x: 88.888, y: 12.222, zoom: 1.5555 }, price: 8,
    status: "waitingForRelease", releaseDate: "2035-01-01"
  });
  wishlistId = item.id;
  cropEq(item.coverCrop, { x: 88.89, y: 12.22, zoom: 1.556 }, "wishlist cover");
  KOS.show("wishlist");
  await tick(40);
  const hero = document.querySelector(".wl-hero.has-banner");
  const img = hero && hero.querySelector(":scope > .image-crop-bg img");
  if (!img || img.style.getPropertyValue("--crop-x") !== "88.89%") throw new Error("wishlist hero ignored its saved cover crop");

  await tick(160);
  const persisted = JSON.parse(window.localStorage.getItem("kurenai-os-v1"));
  const persistedItem = persisted.wishlist.items.find(it => it.id === wishlistId);
  cropEq(persistedItem.coverCrop, item.coverCrop, "localStorage wishlist");
  cropEq(persisted.governor.avatar.crop, { x: 61, y: 37, zoom: 2.1 }, "localStorage avatar");
  cropEq(persisted.governor.bannerCrop, { x: 17, y: 83, zoom: 1.6 }, "localStorage banner");
});

step("full backup/restore preserves local, entry, volume, hero and profile crop metadata", async () => {
  const media = await p(cb => KOS.mediadb.exportAll(cb));
  const backup = {
    kos_backup_version: 2,
    exportedAt: Date.now(),
    state: JSON.parse(JSON.stringify(KOS.store.state)),
    mediaEntries: media.entries,
    mediaKV: media.kv,
    attachments: []
  };

  KOS.store.state.governor.bannerCrop = null;
  KOS.store.state.governor.avatar.crop = null;
  KOS.wishlist.get(wishlistId).coverCrop = null;
  await p(cb => KOS.mediadb.importAll({ entries: [], kv: [] }, cb));

  const file = new window.File([JSON.stringify(backup)], "crop-backup.json", { type: "application/json" });
  await p(cb => KOS.store.importFull(file, cb));
  cropEq(KOS.store.state.governor.bannerCrop, { x: 17, y: 83, zoom: 1.6 }, "restored banner");
  cropEq(KOS.store.state.governor.avatar.crop, { x: 61, y: 37, zoom: 2.1 }, "restored avatar");
  cropEq(KOS.wishlist.get(wishlistId).coverCrop, { x: 88.89, y: 12.22, zoom: 1.556 }, "restored wishlist");

  const book = await p(cb => KOS.mediadb.get(bookId, cb));
  cropEq(book.coverCrop, { x: 12.35, y: 56.79, zoom: 1.235 }, "restored entry cover");
  cropEq(book.physical.volumes[0].coverCrop, { x: 99, y: 0, zoom: 2.222 }, "restored physical cover");
  cropEq((await getKV("hero.anime")).crop, { x: 47, y: 29, zoom: 1.9 }, "restored hero preference");
  cropEq((await getKV("profile.anilist.42")).banner.crop, { x: 25, y: 44, zoom: 1.3 }, "restored AniList profile");
  cropEq((await getKV("profile.vndb.u7")).banner.crop, { x: 70, y: 20, zoom: 1.8 }, "restored VNDB profile");
});

/* ============ runner ============ */
(async () => {
  for (const [name, fn] of steps) {
    try {
      await fn();
      console.log("  ok  " + name);
    } catch (e) {
      errors.push(`STEP "${name}": ${e.stack.split("\n").slice(0, 3).join(" | ")}`);
      console.log("FAIL  " + name);
      document.querySelectorAll(".cropper-ov").forEach(node => node.remove());
    }
  }
  console.log("");
  if (errors.length) {
    console.log("SMOKE16 FAILURES (" + errors.length + "):");
    errors.forEach(e => console.log("  - " + e));
    process.exit(1);
  }
  console.log("SMOKE16 PASS — reusable image positioning and persistence verified (" + steps.length + " steps).");
  process.exit(0);
})();
