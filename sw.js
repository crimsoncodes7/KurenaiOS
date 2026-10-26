/* Kurenai OS — sw.js (Build 4b)
   The versioned service worker. Strategy, per resource class:

   - APP SHELL (same-origin statics: js/css/icons/manifest): precached at
     install, then STALE-WHILE-REVALIDATE — every hit serves from cache and
     refreshes in the background, so a deployed change reaches the cache on
     the next load and no stale shell can wedge permanently even without a
     version bump. The precache list is DERIVED from index.html's own script
     and stylesheet tags at install time, so it can never drift from the app.
   - NAVIGATIONS: the index.html of THIS worker's version, from the same
     cache as its scripts and styles — a page is always one version. It
     used to be network-first, which paired a freshly deployed index.html
     with the previous version's cached scripts for one load (the page came
     up half-styled until "Reload now"). A new deploy reaches the page by
     its new worker: installed in the background, applied when the user
     accepts the update. Network only when nothing is cached yet; local
     development hosts stay network-first so an edited index.html shows.
   - CDN statics (Google fonts, jsdelivr): stale-while-revalidate in a
     runtime cache.
   - THE FULL C# RUNTIME (assets/code/runtime/<id>/, Code units 7+): an
     optional download the page asks for, CACHE-FIRST in its own cache,
     kos-csharp-<id>. Its folder is versioned by the runner's id, so its
     files never change in place; a deploy does not clear it (it is not a
     VERSION cache) and the page prunes an older id's cache itself.
   - SQLITE IN WEBASSEMBLY (assets/code/sqlite/, Code's T1 SQL lessons):
     fetched only when a lesson first runs SQL, then CACHE-FIRST in its own
     cache, kos-sqlite-<SQLITE_ID>, kept across deploys; a new SQLite build
     bumps SQLITE_ID and the old cache is cleared.
   - EVERYTHING ELSE — Supabase, AniList, VNDB, Open Library, Google Books,
     any non-GET — is NOT intercepted at all. Authenticated and personalised
     responses must never sit in Cache Storage.

   VERSION bumps on deploy force a full precache rebuild and old-cache
   cleanup (belt and braces on top of SWR). Updates are SAFE by default: no
   skipWaiting at install — the new worker waits until the page offers the
   user a reload (js/core/pwa.js posts SKIP_WAITING on confirmation), so a
   running session never mixes old page + new assets.                       */
/* eslint-env serviceworker */
"use strict";

var VERSION = "kos-routines-2";
var STATIC_CACHE = "kos-static-" + VERSION;
var RUNTIME_CACHE = "kos-runtime-" + VERSION;
var SQLITE_CACHE = "kos-sqlite-1.14.2";

var CDN_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com", "cdn.jsdelivr.net"];
/* local development: navigations stay network-first (see header) */
var DEV_HOST = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(self.location.hostname);

/* Stylesheets are not listed here: every css/*.css layer the page links is
   derived from index.html at install, like the scripts (UI rebuild M2). */
var EXTRA_PRECACHE = [
  "manifest.webmanifest",
  /* Code's in-app runner: a worker script, never a <script> tag (roadmap 5.3) */
  "js/labs/cs-interp.js",
  "js/labs/cs-wasm-worker.js",
  "js/labs/sql-worker.js",
  "js/labs/sql-run.js",
  /* the Rider validator, zipped into every exported project (offline export) */
  "assets/code/validator/validate.cs",
  "assets/brand/kurenai-bloom.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png",
  "icons/apple-touch-icon.png",
  "assets/assistant/logo/whispering-bloom-emblem-production.png",
  "assets/assistant/mascot/states/idle.png",
  "assets/assistant/mascot/states/thinking.png",
  "assets/assistant/mascot/states/working.png",
  "assets/assistant/mascot/states/success.png",
  "assets/assistant/mascot/states/error.png",
  "assets/assistant/mascot/states/confirmation.png",
  "assets/assistant/voice/state/idle.mp3",
  "assets/assistant/voice/state/thinking.mp3",
  "assets/assistant/voice/state/working.mp3",
  "assets/assistant/voice/state/success.mp3",
  "assets/assistant/voice/state/error.mp3",
  "assets/assistant/voice/state/confirmation.mp3",
  "assets/assistant/voice/interaction/hover-01.mp3",
  "assets/assistant/voice/interaction/hover-02.mp3",
  "assets/assistant/voice/interaction/hover-03.mp3",
  "assets/assistant/voice/interaction/hover-04.mp3",
  "assets/assistant/voice/interaction/head-01.mp3",
  "assets/assistant/voice/interaction/head-02.mp3",
  "assets/assistant/voice/interaction/head-03.mp3",
  "assets/assistant/voice/interaction/head-04.mp3",
  "assets/assistant/voice/interaction/flower-01.mp3",
  "assets/assistant/voice/interaction/flower-02.mp3",
  "assets/assistant/voice/interaction/flower-03.mp3",
  "assets/assistant/voice/interaction/flower-04.mp3",
  "assets/assistant/voice/interaction/tablet-01.mp3",
  "assets/assistant/voice/interaction/tablet-02.mp3",
  "assets/assistant/voice/interaction/tablet-03.mp3",
  "assets/assistant/voice/interaction/tablet-04.mp3"
];

self.addEventListener("install", function (e) {
  e.waitUntil((async function () {
    var cache = await caches.open(STATIC_CACHE);
    var res = await fetch("index.html", { cache: "no-cache" });
    if (!res.ok) throw new Error("shell fetch failed: " + res.status);
    var html = await res.text();
    await cache.put("index.html", new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } }));
    var urls = new Set(EXTRA_PRECACHE);
    var m;
    var scriptRe = /<script[^>]*\ssrc="([^"]+)"/g;
    while ((m = scriptRe.exec(html))) { if (!/^https?:/.test(m[1])) urls.add(m[1]); }
    var linkRe = /<link[^>]*\shref="([^"]+\.css)"/g;
    while ((m = linkRe.exec(html))) { if (!/^https?:/.test(m[1])) urls.add(m[1]); }
    /* individually, tolerating misses — js/env.local.js is gitignored and
       absent on a fresh checkout; its 404 must not fail the whole install */
    await Promise.all([].concat.apply([], [Array.from(urls)]).map(function (u) {
      return cache.add(u).catch(function () { return null; });
    }));
  })());
  /* deliberately NO self.skipWaiting() — see header */
});

self.addEventListener("activate", function (e) {
  e.waitUntil((async function () {
    var names = await caches.keys();
    await Promise.all(names.map(function (n) {
      if (n.indexOf("kos-") === 0 && n.indexOf("kos-csharp-") !== 0 && n !== STATIC_CACHE && n !== RUNTIME_CACHE && n !== SQLITE_CACHE) return caches.delete(n);
      return null;
    }));
    await self.clients.claim();
  })());
});

self.addEventListener("message", function (e) {
  if (e.data && e.data.type === "SKIP_WAITING") self.skipWaiting();
});

/* A tapped device notification (core/notify.js shows them through this
   registration so an installed phone app gets them): focus an open
   client and hand it the view to show, or open one on the route. */
self.addEventListener("notificationclick", function (e) {
  e.notification.close();
  var data = (e.notification && e.notification.data) || {};
  e.waitUntil((async function () {
    var clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    var hash = data.view ? "#/" + data.view + (data.arg != null && typeof data.arg !== "object" ? "/" + data.arg : "") : "";
    if (clients.length) {
      var c = clients[0];
      try { await c.focus(); } catch (err) { /* focus can be refused */ }
      c.postMessage({ type: "kos-open", view: data.view || null, arg: data.arg == null ? null : data.arg });
      return;
    }
    if (self.clients.openWindow) await self.clients.openWindow("./" + hash);
  })());
});

/* Closed-app delivery (roadmap 5.7, docs/server-runner-plan.md §5): the
   runner's Web Push carries one notification the device published in its
   outlook, under the ledger's own id as the tag, so a repeat replaces
   rather than stacks. A tap is the notificationclick above. */
self.addEventListener("push", function (e) {
  var m = {};
  try { m = e.data ? e.data.json() : {}; } catch (err) { m = {}; }
  if (!m || !m.title) return;
  e.waitUntil(self.registration.showNotification(String(m.title).slice(0, 200), {
    body: String(m.body || "").slice(0, 300), tag: m.id || undefined,
    icon: "icons/icon-192.png", badge: "icons/icon-192.png",
    data: { view: m.view || null, arg: m.arg == null ? null : m.arg }
  }));
});

/* Background Sync (progressive enhancement — correctness never depends on
   it; cloudsync retries on online/boot/focus/manual regardless). The engine
   lives in the page, so the event just nudges any open client. */
self.addEventListener("sync", function (e) {
  if (e.tag !== "kos-cloud-sync") return;
  e.waitUntil((async function () {
    var clients = await self.clients.matchAll({ type: "window" });
    clients.forEach(function (c) { c.postMessage({ type: "kos-cloud-sync" }); });
  })());
});

function staleWhileRevalidate(e, cacheName) {
  e.respondWith((async function () {
    var cache = await caches.open(cacheName);
    var cached = await cache.match(e.request, { ignoreSearch: false });
    var refresh = fetch(e.request).then(function (res) {
      if (res && (res.ok || res.type === "opaque")) cache.put(e.request, res.clone());
      return res;
    }).catch(function () { return null; });
    if (cached) { e.waitUntil(refresh); return cached; }
    var fresh = await refresh;
    if (fresh) return fresh;
    return new Response("", { status: 504, statusText: "offline" });
  })());
}

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;                       // mutations: untouched
  var url = new URL(req.url);

  if (url.origin !== self.location.origin) {
    /* only known static CDNs are cached; APIs (Supabase/AniList/VNDB/books)
       and cover art pass straight through — never into Cache Storage */
    if (CDN_HOSTS.indexOf(url.hostname) !== -1) staleWhileRevalidate(e, RUNTIME_CACHE);
    return;
  }

  var rt = /\/assets\/code\/runtime\/([^/]+)\//.exec(url.pathname);
  var sq = /\/assets\/code\/sqlite\//.test(url.pathname);
  if (rt || sq) {
    e.respondWith((async function () {
      var cache = await caches.open(sq ? SQLITE_CACHE : "kos-csharp-" + rt[1]);
      var hit = await cache.match(req);
      if (hit) return hit;
      var res = await fetch(req);
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    })());
    return;
  }

  if (req.mode === "navigate") {
    e.respondWith((async function () {
      var cache = await caches.open(STATIC_CACHE);
      if (!DEV_HOST) {
        var shell = await cache.match("index.html");
        if (shell) return shell;
      }
      try {
        var fresh = await fetch(req);
        if (fresh && fresh.ok) cache.put("index.html", fresh.clone());
        return fresh;
      } catch (err) {
        var cached = await cache.match("index.html");
        if (cached) return cached;
        throw err;
      }
    })());
    return;
  }

  staleWhileRevalidate(e, STATIC_CACHE);
});
