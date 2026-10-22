/* Kurenai OS — core/push.js · KOS.push
   Closed-app delivery (roadmap 5.7 item 1, docs/server-runner-plan.md).
   The device side of the runner:

     subscribe    a Web Push subscription for THIS browser, encrypted to
                  keys the browser holds (kos_push_subs). Per device, an
                  opt-in from a user gesture, and only with notification
                  permission (invariant 98).
     publish      KOS.outlook.build() → kos_outlook, when it changed (a
                  hash), at most every five minutes and at least every six
                  hours, with the schedules the server owns and the model
                  route. The server delivers only what was published here
                  (invariant 131).
     presence     while a page is visible, a beat every two minutes
                  (kos_outlook.seen_at), so the runner holds pushes while you
                  are in front of the app: the open device raises them.
     pull         the server's scheduled replies (kos_runs) folded into
                  their schedules through KOS.ai.schedule.applyServerRun.

   Synced: state.notifyCloud = {on, serverRuns} — closed-app delivery for
   the account, and whether the server runs the schedules. Per device: the
   subscription itself, and its endpoint in the media kv (`push.endpoint`).
   Local first: signed out, unconfigured or in a review namespace nothing
   is sent, and the app works exactly as before.                          */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var store = KOS.store;
  var PUBLISH_EVERY = 5 * 60 * 1000, REPUBLISH = 6 * 3600 * 1000, BEAT = 2 * 60 * 1000, PULL = 10 * 60 * 1000;
  var cloudApi = null, last = { hash: null, at: 0 }, timers = [], publishing = false;

  function cfg() { var c = store.state.notifyCloud; return c && typeof c === "object" ? c : {}; }
  function setCfg(patch) {
    store.state.notifyCloud = Object.assign({ on: false, serverRuns: false }, cfg(), patch || {});
    store.save();
    if (KOS.cloudsync && KOS.cloudsync.noteChange) { try { KOS.cloudsync.noteChange(); } catch (e) { /* offline is fine */ } }
  }
  function vapidKey() { return (window.KOS_ENV && window.KOS_ENV.VAPID_PUBLIC_KEY) || ""; }
  function supported() {
    return typeof navigator !== "undefined" && "serviceWorker" in navigator && typeof window.PushManager !== "undefined" &&
      typeof window.Notification !== "undefined";
  }
  function signedIn() { return !!(KOS.cloud && KOS.cloud.signedIn && KOS.cloud.signedIn()); }
  function uid() { return KOS.cloud && KOS.cloud.userId ? KOS.cloud.userId() : null; }
  /* why closed-app delivery cannot be used here, or null */
  function blocked() {
    if (KOS.dataMode && KOS.dataMode.mode) return "review";
    if (!vapidKey()) return "unconfigured";
    if (!signedIn()) return "signed-out";
    if (!supported()) return "unsupported";
    return null;
  }

  /* ---------------- the cloud ---------------- */
  function realCloud() {
    function c() { return KOS.cloud.client(); }
    function run(b, cb) {
      b.then(function (res) { res.error ? cb(new Error(res.error.message || "Push sync failed.")) : cb(null, res.data); })
        .catch(function (e) { cb(new Error((e && e.message) || "Push sync failed — network?")); });
    }
    return {
      saveSub: function (row, cb) { run(c().from("kos_push_subs").upsert(row, { onConflict: "user_id,endpoint" }), cb); },
      dropSub: function (endpoint, cb) { run(c().from("kos_push_subs").delete().eq("user_id", uid()).eq("endpoint", endpoint), cb); },
      saveOutlook: function (row, cb) { run(c().from("kos_outlook").upsert(row, { onConflict: "user_id" }), cb); },
      beat: function (cb) { run(c().from("kos_outlook").update({ seen_at: new Date().toISOString() }).eq("user_id", uid()), cb); },
      runsSince: function (iso, cb) {
        var q = c().from("kos_runs").select("schedule_id, day, ok, text, updated_at").neq("text", "");
        if (iso) q = q.gt("updated_at", iso);
        run(q.order("updated_at", { ascending: true }).limit(100), cb);
      }
    };
  }
  function cloud() { return cloudApi || realCloud(); }
  function kv(key) { return new Promise(function (res) { KOS.mediadb.getKV(key, function (e, v) { res(e ? null : v); }); }); }
  function setKv(key, v) { return new Promise(function (res) { KOS.mediadb.setKV(key, v, function () { res(); }); }); }

  /* ---------------- this device's subscription ---------------- */
  function keyBytes(b64) {
    var s = b64.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((b64.length + 3) % 4), bin = atob(s), out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  function registration() {
    return navigator.serviceWorker && navigator.serviceWorker.getRegistration
      ? navigator.serviceWorker.getRegistration().then(function (r) { return r || navigator.serviceWorker.ready; })
      : Promise.reject(new Error("No service worker."));
  }
  function label() {
    var ua = navigator.userAgent || "";
    var dev = KOS.ui && KOS.ui.device ? KOS.ui.device() : {};
    return (dev.ios ? dev.name : /Android/.test(ua) ? "Android" : /Mac/.test(ua) ? "Mac" : /Windows/.test(ua) ? "Windows" : "Browser") +
      " · " + (/Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "web");
  }
  /* subscribe(cb): from a user gesture. Asks for notification permission
     when it is not granted yet. */
  function subscribe(cb) {
    cb = cb || function () {};
    var why = blocked();
    if (why) { cb(new Error(why)); return; }
    var ask = Notification.permission === "granted" ? Promise.resolve("granted") : Notification.requestPermission();
    Promise.resolve(ask).then(function (perm) {
      if (perm !== "granted") throw new Error("permission");
      return registration();
    }).then(function (reg) {
      return reg.pushManager.getSubscription().then(function (s) {
        return s || reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(vapidKey()) });
      });
    }).then(function (sub) {
      var j = sub.toJSON();
      return new Promise(function (res, rej) {
        cloud().saveSub({ user_id: uid(), endpoint: j.endpoint, p256dh: j.keys.p256dh, auth: j.keys.auth, label: label() },
          function (e) { e ? rej(e) : res(j.endpoint); });
      });
    }).then(function (endpoint) {
      return setKv("push.endpoint", endpoint).then(function () {
        if (!cfg().on) setCfg({ on: true });
        publish(true, function () {});
        cb(null, endpoint);
      });
    }).catch(function (e) { cb(e instanceof Error ? e : new Error(String(e))); });
  }
  function unsubscribe(cb) {
    cb = cb || function () {};
    kv("push.endpoint").then(function (endpoint) {
      var drop = endpoint && signedIn() ? new Promise(function (res) { cloud().dropSub(endpoint, function () { res(); }); }) : Promise.resolve();
      return drop.then(function () {
        return supported() ? registration().then(function (reg) { return reg.pushManager.getSubscription(); })
          .then(function (s) { return s && s.unsubscribe(); }).catch(function () {}) : null;
      });
    }).then(function () { return setKv("push.endpoint", null); })
      .then(function () { cb(null); }, function (e) { cb(e); });
  }
  function subscribed(cb) { kv("push.endpoint").then(function (e) { cb(!!e); }); }

  /* ---------------- the outlook ---------------- */
  function route() {
    var a = KOS.ai && KOS.ai.config ? KOS.ai.config() : null;
    var r = a && a.routing && a.routing.complex ? a.routing.complex : (KOS.ai && KOS.ai.DEFAULT_ROUTING ? KOS.ai.DEFAULT_ROUTING.complex : null);
    return r ? { provider: r.provider, model: r.model || "" } : null;
  }
  function schedules() {
    return (KOS.ai && KOS.ai.schedule ? KOS.ai.schedule.list() : []).map(function (s) {
      return { id: s.id, name: s.name || "", prompt: s.prompt, time: s.time, days: s.days, enabled: !!s.enabled };
    });
  }
  /* a stable fingerprint of what the server would act on */
  function hashOf(o) {
    var b = Object.assign({}, o.brief, { asOf: null });
    return KOS.fsrs.unit(JSON.stringify([o.items, b, o.schedules, o.serverRuns, o.route, o.tz])).toString(36);
  }
  function publish(force, cb) {
    cb = cb || function () {};
    if (publishing || !cfg().on || blocked() === "signed-out" || blocked() === "review" || !signedIn()) { cb(null, { skipped: true }); return; }
    publishing = true;
    KOS.outlook.build(function (err, o) {
      if (err) { publishing = false; cb(err); return; }
      o.serverRuns = !!cfg().serverRuns;
      o.schedules = o.serverRuns ? schedules() : [];
      o.route = o.serverRuns ? route() : null;
      var h = hashOf(o), now = Date.now();
      if (!force && h === last.hash && now - last.at < REPUBLISH) { publishing = false; cb(null, { skipped: true, same: true }); return; }
      cloud().saveOutlook({ user_id: uid(), data_json: o, hash: h }, function (e) {
        publishing = false;
        if (!e) { last = { hash: h, at: now }; }
        cb(e || null, { published: !e, items: o.items.length });
      });
    });
  }
  function beat() {
    if (!cfg().on || !signedIn() || (KOS.dataMode && KOS.dataMode.mode)) return;
    if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
    cloud().beat(function () {});
  }
  function pull(cb) {
    cb = cb || function () {};
    if (!cfg().serverRuns || !signedIn() || (KOS.dataMode && KOS.dataMode.mode)) { cb(null, 0); return; }
    var key = "push.runs." + uid();
    kv(key).then(function (cursor) {
      cloud().runsSince(cursor || null, function (e, rows) {
        if (e) { cb(e); return; }
        var n = 0, max = cursor || null;
        (rows || []).forEach(function (r) {
          if (KOS.ai.schedule.applyServerRun(r)) n++;
          if (!max || r.updated_at > max) max = r.updated_at;
        });
        setKv(key, max).then(function () { cb(null, n); });
      });
    });
  }
  /* closed-app delivery off for the account: the server stops; this
     device's subscription goes too */
  function turnOff(cb) {
    setCfg({ on: false, serverRuns: false });
    unsubscribe(cb);
  }
  function setServerRuns(on) {
    setCfg({ serverRuns: !!on && !!cfg().on });
    publish(true, function () {});
  }

  function start() {
    if (timers.length) return;
    timers.push(setInterval(function () { publish(false); }, PUBLISH_EVERY));
    timers.push(setInterval(beat, BEAT));
    timers.push(setInterval(function () { pull(); }, PULL));
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", function () {
        if (document.visibilityState !== "visible") { publish(false); return; }
        beat(); pull();
      });
    }
    setTimeout(function () { beat(); pull(); publish(false); }, 11000);
  }

  KOS.push = {
    blocked: blocked, supported: supported, config: cfg,
    subscribe: subscribe, unsubscribe: unsubscribe, subscribed: subscribed,
    publish: publish, beat: beat, pull: pull, turnOff: turnOff, setServerRuns: setServerRuns,
    lastPublished: function () { return last.at || null; },
    start: start,
    /* test seam: a fake cloud (saveSub, dropSub, saveOutlook, beat, runsSince) */
    _setCloudApi: function (a) { cloudApi = a || null; }
  };
})();
