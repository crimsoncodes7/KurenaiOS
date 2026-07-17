/* Kurenai OS — core/pwa.js (Build 4b)
   The page-side PWA runtime:

   - registers sw.js (never on file:// — service workers don't run there;
     the file:// app keeps working exactly as before, just without offline
     caching or install);
   - SAFE UPDATES: a newly installed worker waits; the user gets an explicit
     "reload to update" offer, and only their confirmation posts
     SKIP_WAITING and reloads — a running session never mixes old page with
     new assets;
   - PERSISTENT STORAGE: navigator.storage.persist() is requested ONCE, at a
     user-meaningful moment (installing the app, or signing in to cloud
     sync) — never nagged on every load. Granted or not, browsers may still
     evict PWA data; the Help view says so plainly, and backups remain the
     strongest protection;
   - BACKGROUND SYNC (progressive enhancement only): a one-shot sync tag is
     registered while changes are pending, and the SW's sync event nudges
     the page to run a cloud cycle. Correctness never depends on it —
     cloudsync already retries on online/boot/focus/manual;
   - keeps the <meta name="theme-color"> in step with the active shop theme.*/
(function () {
  "use strict";
  window.KOS = window.KOS || {};

  var PERSIST_FLAG = "kos-persist-requested";
  var reg = null;
  var reloadOnControl = false;

  function swSupported() {
    return "serviceWorker" in navigator && window.location.protocol !== "file:";
  }

  /* ---------------- persistent storage ---------------- */
  function requestPersistence(force) {
    try {
      if (!navigator.storage || !navigator.storage.persist) return;
      if (!force && localStorage.getItem(PERSIST_FLAG)) return;
      localStorage.setItem(PERSIST_FLAG, "1");
      navigator.storage.persisted().then(function (already) {
        if (already) return true;
        return navigator.storage.persist();
      }).then(function (granted) {
        console.info("Kurenai OS: persistent storage " + (granted ? "granted" : "not granted") +
          " — backups remain the strongest protection either way.");
      }).catch(function () {});
    } catch (e) { /* unsupported contexts stay silent */ }
  }

  /* ---------------- safe update flow ---------------- */
  function offerUpdate(worker) {
    if (!KOS.ui || !KOS.ui.confirm) { return; }
    KOS.ui.confirm({
      title: "Update ready",
      body: "A new version of Kurenai OS has been downloaded. Reload to switch to it now? (Your data is unaffected either way — otherwise it applies once every Kurenai tab is closed.)",
      confirm: "Reload now"
    }, function () {
      reloadOnControl = true;
      worker.postMessage({ type: "SKIP_WAITING" });
    });
  }
  function watchRegistration(r) {
    reg = r;
    if (r.waiting && navigator.serviceWorker.controller) offerUpdate(r.waiting);
    r.addEventListener("updatefound", function () {
      var w = r.installing;
      if (!w) return;
      w.addEventListener("statechange", function () {
        /* only an UPDATE (controller already exists) prompts — the very
           first install just starts controlling silently */
        if (w.state === "installed" && navigator.serviceWorker.controller) offerUpdate(w);
      });
    });
  }

  /* ---------------- theme-color follows the active theme ---------------- */
  function syncThemeColor() {
    try {
      var meta = document.querySelector('meta[name="theme-color"]');
      if (!meta) return;
      var bg = getComputedStyle(document.documentElement).getPropertyValue("--bg0").trim();
      if (bg) meta.setAttribute("content", bg);
    } catch (e) {}
  }

  function start() {
    if (!swSupported()) return;
    navigator.serviceWorker.register("sw.js").then(watchRegistration).catch(function (e) {
      console.warn("Kurenai OS: service worker registration failed —", e && e.message);
    });
    navigator.serviceWorker.addEventListener("controllerchange", function () {
      if (reloadOnControl) { reloadOnControl = false; window.location.reload(); }
    });
    /* SW sync event → run a cloud cycle in this page */
    navigator.serviceWorker.addEventListener("message", function (e) {
      if (e.data && e.data.type === "kos-cloud-sync" && KOS.cloudsync) KOS.cloudsync.syncNow();
    });
    /* register the background-sync tag while changes are pending/erroring */
    if (KOS.cloudsync && KOS.cloudsync.onStatus) {
      KOS.cloudsync.onStatus(function (s) {
        if ((s.state === "pending" || s.state === "error" || s.state === "offline") &&
            reg && "sync" in reg) {
          reg.sync.register("kos-cloud-sync").catch(function () {});
        }
      });
    }
    /* installation is the natural moment to ask for durable storage */
    window.addEventListener("appinstalled", function () { requestPersistence(true); });
    /* signing in to cloud sync is the other user-meaningful moment */
    if (KOS.cloud && KOS.cloud.onAuth) {
      KOS.cloud.onAuth(function (event) {
        if (event === "SIGNED_IN") requestPersistence(false);
      });
    }
    syncThemeColor();
    new MutationObserver(syncThemeColor)
      .observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();

  KOS.pwa = {
    supported: swSupported,
    requestPersistence: requestPersistence,
    registration: function () { return reg; }
  };
})();
