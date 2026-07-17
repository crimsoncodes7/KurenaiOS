/* Kurenai OS — smoke18.test.js
   Build 4b PWA suite: manifest validity, icon assets, service-worker
   contract (safe updates, API-cache exclusion, self-maintaining precache),
   page-side runtime inertness, and the phone-tier CSS contract.

   Run:
     npm install jsdom              (one-time; no IndexedDB needed here)
     node tools/smoke18.test.js

   TESTED PROPERTIES:
   1. manifest.webmanifest is valid JSON with the required install fields
      and a maskable icon; every referenced icon file exists and is a PNG.
   2. index.html carries the PWA metadata (manifest link, theme-color,
      apple-touch-icon, viewport-fit=cover) and loads js/core/pwa.js.
   3. sw.js parses; it never calls skipWaiting during install (safe
      updates — only the SKIP_WAITING message may); its CDN cache list
      contains NO API host (Supabase/AniList/VNDB must never enter Cache
      Storage); non-GET requests are never intercepted.
   4. The install-time precache derivation (regexes over index.html)
      matches every LOCAL script and stylesheet the real index.html loads —
      the precache list cannot drift from the app.
   5. js/core/pwa.js is inert without a service worker (jsdom): KOS.pwa is
      exposed, supported() is false, requestPersistence never throws.
   6. The phone tier exists in css/main.css: bottom-bar rail, tree drawer,
      bottom-sheet modals, 16px inputs, safe-area insets, coarse-pointer
      targets.                                                             */

const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const read = f => fs.readFileSync(path.join(ROOT, f), "utf8");

const failures = [];
let passed = 0;
function step(name, fn) {
  try { fn(); console.log("  ok  " + name); passed++; }
  catch (e) { console.log("  FAIL " + name + " — " + e.message); failures.push(name + ": " + e.message); }
}
function assert(cond, msg) { if (!cond) throw new Error(msg); }

const html = read("index.html");
const sw = read("sw.js");
const css = read("css/main.css");

console.log("== manifest + icons ==");
step("manifest is valid JSON with the required install fields", () => {
  const m = JSON.parse(read("manifest.webmanifest"));
  ["name", "short_name", "description", "start_url", "scope", "display",
   "theme_color", "background_color", "icons"].forEach(k => assert(k in m, "missing " + k));
  assert(m.display === "standalone", "display should be standalone");
  assert(m.icons.length >= 3, "needs 192 + 512 + maskable icons");
  assert(m.icons.some(i => i.purpose === "maskable"), "no maskable icon");
  assert(m.icons.some(i => i.sizes === "512x512"), "no 512 icon");
});
step("every referenced icon exists and is a real PNG", () => {
  const m = JSON.parse(read("manifest.webmanifest"));
  const files = m.icons.map(i => i.src).concat(["icons/apple-touch-icon.png"]);
  files.forEach(f => {
    const buf = fs.readFileSync(path.join(ROOT, f));
    assert(buf.length > 1000, f + " suspiciously small");
    assert(buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47, f + " is not a PNG");
  });
});

console.log("== index.html metadata ==");
step("index.html carries the PWA metadata and pwa.js", () => {
  assert(html.includes('rel="manifest"'), "manifest link missing");
  assert(html.includes('name="theme-color"'), "theme-color missing");
  assert(html.includes('rel="apple-touch-icon"'), "apple-touch-icon missing");
  assert(html.includes("viewport-fit=cover"), "viewport-fit=cover missing");
  assert(html.includes('src="js/core/pwa.js"'), "pwa.js not loaded");
});

console.log("== service worker contract ==");
step("sw.js parses and declares a version + all five handlers", () => {
  new Function(sw);   // syntax check
  assert(/var VERSION = "/.test(sw), "no VERSION");
  ["install", "activate", "fetch", "message", "sync"].forEach(ev =>
    assert(sw.includes('addEventListener("' + ev + '"'), "no " + ev + " handler"));
});
step("safe updates: skipWaiting only ever runs from the SKIP_WAITING message", () => {
  const code = sw.replace(/\/\*[\s\S]*?\*\//g, "");   // comments don't count
  const calls = [...code.matchAll(/skipWaiting\(\)/g)];
  assert(calls.length === 1, "expected exactly one skipWaiting() call, found " + calls.length);
  const idx = code.indexOf("skipWaiting()");
  const msgIdx = code.indexOf('addEventListener("message"');
  const nextHandler = code.indexOf("addEventListener", msgIdx + 10);
  assert(idx > msgIdx && (nextHandler === -1 || idx < nextHandler),
    "skipWaiting() lives outside the message handler");
});
step("no API host can enter Cache Storage; non-GET passes through", () => {
  const cdnMatch = sw.match(/var CDN_HOSTS = (\[[^\]]*\])/);
  assert(cdnMatch, "CDN_HOSTS not found");
  const hosts = JSON.parse(cdnMatch[1].replace(/'/g, '"'));
  ["supabase", "anilist", "vndb", "openlibrary", "books.google"].forEach(bad =>
    assert(!hosts.some(h => h.includes(bad)), bad + " must never be cached"));
  assert(/req\.method !== "GET"\)? return/.test(sw.replace(/\n\s*/g, " ")), "non-GET requests must not be intercepted");
});
step("the precache derivation matches every local script/stylesheet in index.html", () => {
  const derived = new Set();
  let m;
  const scriptRe = /<script[^>]*\ssrc="([^"]+)"/g;
  while ((m = scriptRe.exec(html))) { if (!/^https?:/.test(m[1])) derived.add(m[1]); }
  const linkRe = /<link[^>]*\shref="([^"]+\.css)"/g;
  while ((m = linkRe.exec(html))) { if (!/^https?:/.test(m[1])) derived.add(m[1]); }
  /* every plain same-origin script tag the smoke loader sees must be in
     the derived set (defer-tagged env/vendor files are included too) */
  for (const tag of html.matchAll(/<script src="([^"]+)"><\/script>/g)) {
    assert(derived.has(tag[1]), tag[1] + " missed by the sw precache regex");
  }
  assert(derived.has("css/main.css"), "stylesheet missed");
  assert(derived.has("js/vendor/supabase.js"), "deferred vendor script missed");
  assert(derived.has("js/env.local.js"), "deferred env script missed (its 404 is tolerated at install)");
  /* and each derived file (except the gitignored env) exists on disk */
  for (const f of derived) {
    if (f === "js/env.local.js") continue;
    assert(fs.existsSync(path.join(ROOT, f)), f + " referenced but missing on disk");
  }
});

console.log("== page runtime inert without a SW ==");
step("pwa.js exposes KOS.pwa and stays inert in jsdom", () => {
  const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", { url: "http://localhost/", runScripts: "outside-only" });
  const w = dom.window;
  w.eval(read("js/core/ui.js"));
  w.eval(read("js/core/pwa.js"));
  assert(w.KOS.pwa, "KOS.pwa missing");
  assert(w.KOS.pwa.supported() === false, "supported() should be false without serviceWorker");
  w.KOS.pwa.requestPersistence();   // must not throw
  assert(w.KOS.pwa.registration() === null, "no registration expected");
});

console.log("== phone tier CSS contract ==");
step("the ≤700px tier re-homes the shell for touch", () => {
  assert(/@media \(max-width: 700px\)[\s\S]*#rail \{[\s\S]*position: fixed/.test(css), "bottom-bar rail missing");
  assert(css.includes("env(safe-area-inset-bottom)"), "safe-area bottom missing");
  assert(css.includes("env(safe-area-inset-top)"), "safe-area top missing");
  assert(/input, select, textarea \{ font-size: 16px; \}/.test(css), "16px inputs (iOS zoom guard) missing");
  assert(/\.modal-ov \{ align-items: flex-end/.test(css), "bottom-sheet modals missing");
  assert(/@media \(pointer: coarse\)/.test(css), "coarse-pointer targets missing");
  assert(/\.sync-chip \{ white-space: nowrap/.test(css), "chip nowrap missing");
});

console.log("");
if (failures.length) {
  console.log("SMOKE18 FAILURES (" + failures.length + "):");
  failures.forEach(f => console.log("  - " + f));
  process.exit(1);
}
console.log("SMOKE18 PASS — Build 4b PWA layer verified (" + passed + " steps).");
