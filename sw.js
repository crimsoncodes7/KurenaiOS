/* Kurenai OS — sw.js (Build 4b)
   The versioned service worker. Strategy, per resource class:

   - APP SHELL (same-origin statics: js/css/icons/manifest): precached at
     install, then STALE-WHILE-REVALIDATE — every hit serves from cache and
     refreshes in the background, so a deployed change reaches the cache on
     the next load and no stale shell can wedge permanently even without a
     version bump. The precache list is DERIVED from index.html's own script
     and stylesheet tags at install time, so it can never drift from the app.
   - NAVIGATIONS: network-first (fresh HTML when online) with the cached
     index.html as the offline fallback.
   - CDN statics (Google fonts, jsdelivr): stale-while-revalidate in a
     runtime cache.
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

var VERSION = "kos-4c-1";
var STATIC_CACHE = "kos-static-" + VERSION;
var RUNTIME_CACHE = "kos-runtime-" + VERSION;

var CDN_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com", "cdn.jsdelivr.net"];

var EXTRA_PRECACHE = [
  "css/main.css",
  "manifest.webmanifest",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png",
  "icons/apple-touch-icon.png"
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
      if (n.indexOf("kos-") === 0 && n !== STATIC_CACHE && n !== RUNTIME_CACHE) return caches.delete(n);
      return null;
    }));
    await self.clients.claim();
  })());
});

self.addEventListener("message", function (e) {
  if (e.data && e.data.type === "SKIP_WAITING") self.skipWaiting();
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

  if (req.mode === "navigate") {
    e.respondWith((async function () {
      try {
        var fresh = await fetch(req);
        var cache = await caches.open(STATIC_CACHE);
        cache.put("index.html", fresh.clone());
        return fresh;
      } catch (err) {
        var cached = await caches.match("index.html");
        if (cached) return cached;
        throw err;
      }
    })());
    return;
  }

  staleWhileRevalidate(e, STATIC_CACHE);
});
