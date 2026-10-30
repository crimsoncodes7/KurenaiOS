/* Kurenai OS — core/ext.js · KOS.ext
   Google Calendar, Google Tasks and Todoist (roadmap 5.15,
   docs/integrations-plan.md, invariants 157–160): what every connection
   shares.

     · SIGN-IN like the GitHub App (invariant 157): the ext-token Edge
       Function keeps the refresh token; a device asks it for a one-hour
       access token and keeps that in MEMORY only — never the kv, the
       state document, a backup or a log. A connect needs cloud sign-in.
     · IDS. Every synced record carries `uid`, 32 lowercase hex characters
       (random at birth; derived from the record's own id and `created`
       for one made before this release, so every device derives the
       same). Hex is a subset of base32hex, so `gcalId()` is a valid
       Google event id (a–v, 0–9, 5–1024 long) with nothing to strip.
     · THE THREE-WAY RULE (invariant 158): a linked record keeps `ext.base`,
       the mapped fields both sides last agreed on. A field changed on one
       side only takes that side; changed on both, this app's wins. No
       clock is compared.
     · NO ECHO (invariant 158): a write that a PULL makes runs inside
       `inbound(fn)`, which (1) sets the base to what was written, so the
       next diff finds nothing to push, and (2) keeps `noteLocal` from
       scheduling a push cycle. Either alone is enough; both are kept.
     · ONE DEVICE AT A TIME: a cycle takes the provider's lease in kos_ext
       (two minutes, the database's clock) or waits for the next.
     · DELETIONS are an explicit queue, `state.ext.deletes` (a keyed map,
       synced, so any device can carry it out), written by the owner's
       delete of a LINKED record — never inferred from a record's absence,
       so restoring an old backup can never delete anything remotely.
     · ACTIVITY, NOT PAY (invariant 160): completions pulled from Todoist
       or Google Tasks log ONE `todo` session a cycle, `metrics.external`,
       which the Governor prices at nothing; it is activity for the day.
                                                                          */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var store = function () { return KOS.store; };

  var PROVIDERS = ["google", "todoist"];
  var NAME = { google: "Google", todoist: "Todoist" };
  var CYCLE_MS = 15 * 60 * 1000, DEBOUNCE_MS = 20 * 1000, LEASE_S = 120;

  /* ---------------- the synced settings ---------------- */
  function S() {
    var st = store().state;
    if (!st.ext || typeof st.ext !== "object") st.ext = {};
    return normalise(st.ext);
  }
  /* the same settings for a page to READ: never writes (smoke112 C) */
  function view() {
    var e = store().state.ext;
    return normalise(e && typeof e === "object" ? JSON.parse(JSON.stringify(e)) : {});
  }
  function normalise(e) {
    e.v = 1;
    if (!e.google || typeof e.google !== "object") e.google = {};
    if (!e.todoist || typeof e.todoist !== "object") e.todoist = {};
    if (!e.deletes || typeof e.deletes !== "object") e.deletes = {};
    var g = e.google;
    if (typeof g.on !== "boolean") g.on = false;
    if (typeof g.cal !== "boolean") g.cal = true;
    if (!g.export || typeof g.export !== "object") g.export = {};
    if (typeof g.export.on !== "boolean") g.export.on = true;
    EXPORT_KINDS.forEach(function (k) { if (typeof g.export[k] !== "boolean") g.export[k] = true; });
    if (typeof g.tasks !== "boolean") g.tasks = false;
    if (typeof e.todoist.on !== "boolean") e.todoist.on = false;
    /* the "Reminders with no list" link: {p, id} or null */
    if (e.noList && (typeof e.noList !== "object" || !e.noList.p || !e.noList.id)) e.noList = null;
    return e;
  }
  var EXPORT_KINDS = ["exams", "assignments", "startby", "pacing", "money", "goals"];

  /* ---------------- per device ---------------- */
  function device() {
    var ui = store().state.ui;
    if (!/^[a-z0-9]{16}$/.test(ui.extDevice || "")) ui.extDevice = rhex(16);
    return ui.extDevice;
  }
  function kv(key) { return new Promise(function (res) { KOS.mediadb.getKV(key, function (e, v) { res(e ? null : v); }); }); }
  function setKv(key, v) { return new Promise(function (res) { KOS.mediadb.setKV(key, v, function () { res(); }); }); }
  function delKv(key) { return new Promise(function (res) { KOS.mediadb.delKV(key, function () { res(); }); }); }
  /* a kv key for this signed-in account, so two accounts on one browser
     never share a sync token */
  function key(name) { return "ext." + name + "." + ((KOS.cloud && KOS.cloud.userId && KOS.cloud.userId()) || "local"); }

  /* ---------------- ids ---------------- */
  /* ids name things (Math.random, seeded under test, so they are stable
     there); `strong` is for what must not be guessed — the sign-in state */
  function rhex(n, strong) {
    var out = "", b = null;
    if (strong) try { if (window.crypto && window.crypto.getRandomValues) b = window.crypto.getRandomValues(new Uint8Array(Math.ceil(n / 2))); } catch (e) { b = null; }
    for (var i = 0; i < Math.ceil(n / 2); i++) {
      var v = b ? b[i] : Math.floor(Math.random() * 256);
      out += (v < 16 ? "0" : "") + v.toString(16);
    }
    return out.slice(0, n);
  }
  /* a deterministic 128-bit hash, as 32 hex characters (FNV-1a in four
     lanes; not cryptographic — it names things, it guards nothing) */
  function hashHex(s) {
    s = String(s);
    var seeds = [0x811c9dc5, 0x01000193, 0x6a09e667, 0xbb67ae85], out = "";
    for (var k = 0; k < 4; k++) {
      var h = seeds[k] >>> 0;
      for (var i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i) + k * 31;
        h = Math.imul(h, 0x01000193) >>> 0;
      }
      h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d) >>> 0; h ^= h >>> 12;
      out += ("0000000" + (h >>> 0).toString(16)).slice(-8);
    }
    return out;
  }
  var UID = /^[0-9a-f]{32}$/;
  function newUid() { return rhex(32); }
  function uidOk(u) { return typeof u === "string" && UID.test(u); }
  /* the uid a record made before this release derives, the same on
     every device (its id and `created` are already shared) */
  function legacyUid(kind, rec) { return hashHex(kind + "|" + rec.id + "|" + (rec.created || "")); }
  /* a Google event id: base32hex, lowercase a–v and 0–9, 5–1024 long.
     A uid is hex already; anything else is cleaned to that alphabet. */
  function gcalId(s) {
    var id = String(s || "").toLowerCase().replace(/[^0-9a-v]/g, "");
    if (id.length < 5) id = hashHex("gcal|" + s);
    return id.slice(0, 1024);
  }
  /* a UUID-shaped command id for Todoist, the same for the same work */
  function uuidOf(s) {
    var h = hashHex(s);
    return h.slice(0, 8) + "-" + h.slice(8, 12) + "-4" + h.slice(13, 16) + "-a" + h.slice(17, 20) + "-" + h.slice(20, 32);
  }

  /* ---------------- the three-way rule ---------------- */
  function same(a, b) { return JSON.stringify(a === undefined ? null : a) === JSON.stringify(b === undefined ? null : b); }
  /* local, remote and base are objects of mapped fields. Returns the
     merged object, the fields to pull into the record and the fields to
     push to the provider. With no base (a first link) remote wins every
     field that differs, except where the caller says local leads. */
  function merge3(local, remote, base, fields, localLeads) {
    var merged = {}, pull = [], push = [];
    fields.forEach(function (f) {
      var L = local[f], R = remote[f];
      if (same(L, R)) { merged[f] = L; return; }
      if (!base) {
        if (localLeads) { merged[f] = L; push.push(f); } else { merged[f] = R; pull.push(f); }
        return;
      }
      var B = base[f], lc = !same(L, B), rc = !same(R, B);
      if (rc && !lc) { merged[f] = R; pull.push(f); }
      else { merged[f] = L; push.push(f); }      // local changed, or both did: this app's wins
    });
    return { merged: merged, pull: pull, push: push };
  }

  /* ---------------- inbound writes and the scheduler ---------------- */
  var inboundDepth = 0;
  function inbound(fn) {
    inboundDepth++;
    try { return fn(); } finally { inboundDepth--; }
  }
  function isInbound() { return inboundDepth > 0; }
  var timer = null, running = null, interval = null;
  /* an owner's write: a reminder or event changed here. Inside a pull it
     is ignored — that write came FROM the provider. */
  function noteLocal(kind) {
    if (inboundDepth > 0 || !anyOn()) return false;
    clearTimeout(timer);
    timer = setTimeout(function () { syncAll("change:" + kind); }, DEBOUNCE_MS);
    return true;
  }
  /* an owner deleted a linked record: queue the remote deletion */
  function queueDelete(p, kind, ref) {
    if (inboundDepth > 0 || !ref || !ref.id) return;
    var e = S();
    e.deletes[p + ":" + kind + ":" + ref.id] = Object.assign({ p: p, kind: kind, at: Date.now() }, ref);
    noteLocal(kind);
  }
  function anyOn() { var e = store().state.ext; return !!(e && ((e.google && e.google.on) || (e.todoist && e.todoist.on))); }

  /* ---------------- sign-in (invariant 157) ---------------- */
  var edgeApi = null, nav = function (url) { window.location.assign(url); };
  var tokens = {};      // {provider: {token, exp}} — memory only
  function signedIn() { return !!(KOS.cloud && KOS.cloud.signedIn && KOS.cloud.signedIn()); }
  function edge(body) {
    if (edgeApi) return edgeApi(body);
    return KOS.cloud.client().functions.invoke("ext-token", { body: body }).then(function (res) {
      if (!res.error) return res.data;
      var ctx = res.error.context;
      return (ctx && typeof ctx.json === "function" ? ctx.json().catch(function () { return null; }) : Promise.resolve(null)).then(function (p) {
        var err = new Error((p && p.error) || "The connection service could not be reached.");
        err.status = ctx && ctx.status;
        throw err;
      });
    });
  }
  /* where a sign-in comes back: this page. Todoist's console refuses a
     bare domain with a trailing slash ("Invalid URL" on
     https://kurenai-os.pages.dev/), so Todoist is sent the address without
     it; Google is registered with it. The same string goes to the token
     exchange, which must match exactly. */
  function redirectUri(p, at) {
    var loc = at || location, path = loc.pathname;
    if (p === "todoist" && path === "/") path = "";
    return loc.origin + path;
  }
  function blocked() {
    if (typeof location === "undefined" || !/^https?:$/.test(location.protocol)) return "file";
    if (!signedIn()) return "signed-out";
    return null;
  }
  function connect(p) {
    var why = blocked();
    if (why) return Promise.resolve({ ok: false, why: why === "file" ? "Open the app from its web address to connect." : "Sign in to cloud sync first." });
    var state = "ext-" + p + "-" + rhex(24, true);
    try { sessionStorage.setItem("kos.ext.state", state); } catch (e) { /* the state check then fails safe */ }
    return edge({ action: "start", provider: p, redirect: redirectUri(p), state: state }).then(function (r) {
      nav(r.url);
      return { ok: true, leaving: true };
    }, function (e) { return { ok: false, why: e.message }; });
  }
  function complete(params) {
    var state = params.get("state") || "", code = params.get("code"), err = params.get("error");
    var want = null;
    try { want = sessionStorage.getItem("kos.ext.state"); sessionStorage.removeItem("kos.ext.state"); } catch (e) { want = null; }
    var m = /^ext-(google|todoist)-/.exec(state);
    if (!m) return Promise.resolve({ ok: false, why: "That sign-in did not come from this app." });
    var p = m[1];
    if (!want || state !== want) return Promise.resolve({ ok: false, p: p, why: "That sign-in did not come from this app. Connect again." });
    if (err || !code) return Promise.resolve({ ok: false, p: p, why: err === "access_denied" ? "You didn't allow access, so nothing was connected." : NAME[p] + " didn't send the sign-in back. Connect again." });
    return edge({ action: "complete", provider: p, code: code, redirect: redirectUri(p) }).then(function (r) {
      var e = S();
      e[p].on = true;
      e[p].account = r.account || "";
      if (p === "google" && r.scopes && !/\/auth\/tasks/.test(r.scopes)) e.google.tasks = false;
      store().save();
      tokens[p] = null;
      changed();
      syncSoon();
      return { ok: true, p: p, account: r.account || "" };
    }, function (e2) { return { ok: false, p: p, why: e2.message }; });
  }
  function disconnect(p) {
    tokens[p] = null;
    var e = S();
    e[p].on = false;
    e[p].account = "";
    store().save();
    return (signedIn() ? edge({ action: "unlink", provider: p }).catch(function () {}) : Promise.resolve()).then(function () {
      return Promise.all(["sync", "mirror", "known", "ro", "status"].map(function (n) { return delKv(key(p + "." + n)); }));
    }).then(function () { changed(); });
  }
  /* an access token: fetched when missing or within five minutes of
     its end; null when this device cannot get one */
  function token(p) {
    var t = tokens[p];
    if (t && t.exp - Date.now() > 5 * 60 * 1000) return Promise.resolve(t.token);
    if (!signedIn()) return Promise.resolve(null);
    return edge({ action: "token", provider: p }).then(function (r) {
      tokens[p] = { token: r.token, exp: Date.parse(r.expires_at) || Date.now() + 3600 * 1000 };
      return r.token;
    }, function (e) {
      if (e.status === 404 || e.status === 409) setStatus(p, { ok: false, why: e.status === 404 ? "Not connected on the server. Connect again." : e.message });
      return null;
    });
  }
  function serverStatus() { return signedIn() ? edge({ action: "status" }).catch(function () { return null; }) : Promise.resolve(null); }

  /* ---------------- the lease ---------------- */
  function lease(p) {
    return edge({ action: "lease", provider: p, holder: device(), secs: LEASE_S }).then(function (r) { return !!(r && r.ok); }, function () { return false; });
  }
  function release(p) { return edge({ action: "release", provider: p, holder: device() }).catch(function () {}); }

  /* ---------------- HTTP ---------------- */
  function call(tok, method, url, body, headers) {
    var h = Object.assign({ Authorization: "Bearer " + tok, Accept: "application/json" }, headers || {});
    var init = { method: method, headers: h };
    if (body !== undefined && body !== null) {
      if (typeof body === "string") init.body = body;
      else { init.body = JSON.stringify(body); h["Content-Type"] = "application/json"; }
    }
    return fetch(url, init).then(function (r) {
      return r.text().then(function (t) {
        var j = null; try { j = t ? JSON.parse(t) : null; } catch (e) { j = null; }
        return { status: r.status, ok: r.ok, json: j };
      });
    }, function () { return { status: 0, ok: false, json: null }; });
  }

  /* ---------------- adapters and the cycle ---------------- */
  var adapters = [];   // {name, provider, on(), cycle(token) → Promise<{counts}>}
  function register(a) { adapters.push(a); }
  var listeners = [];
  function onChange(fn) { listeners.push(fn); }
  function changed() { listeners.forEach(function (f) { try { f(); } catch (e) { /* a listener's own trouble */ } }); }
  function setStatus(p, st) {
    st.at = Date.now();
    return setKv(key(p + ".status"), st).then(changed);
  }
  function status(p) { return kv(key(p + ".status")); }

  function syncProvider(p, why) {
    var mine = adapters.filter(function (a) { return a.provider === p && a.on(); });
    if (!mine.length || !S()[p].on) return Promise.resolve({ ok: true, skipped: true });
    return token(p).then(function (tok) {
      if (!tok) return { ok: false, why: "No sign-in for " + NAME[p] + " on this device." };
      return lease(p).then(function (got) {
        if (!got) return { ok: true, waiting: true };
        var counts = {};
        return mine.reduce(function (chain, a) {
          return chain.then(function () {
            return Promise.resolve(a.cycle(tok)).then(function (c) { counts[a.name] = c || {}; }, function (e) { counts[a.name] = { error: (e && e.message) || String(e) }; });
          });
        }, Promise.resolve()).then(function () {
          return release(p).then(function () {
            var errs = Object.keys(counts).filter(function (k) { return counts[k].error; }).map(function (k) { return counts[k].error; });
            return { ok: !errs.length, why: errs[0] || null, counts: counts, reason: why };
          });
        });
      });
    }).then(function (r) {
      if (!r.skipped && !r.waiting) setStatus(p, { ok: r.ok, why: r.why || null, counts: r.counts || {} });
      return r;
    });
  }
  function syncAll(why) {
    if (running) return running;
    if (!anyOn() || !signedIn()) return Promise.resolve({ ok: true, skipped: true });
    running = PROVIDERS.reduce(function (chain, p) {
      return chain.then(function (acc) { return syncProvider(p, why).then(function (r) { acc[p] = r; return acc; }); });
    }, Promise.resolve({})).then(function (acc) {
      running = null;
      if (store().state && store().save) store().save();
      changed();
      return acc;
    }, function (e) { running = null; throw e; });
    return running;
  }
  function syncSoon() { clearTimeout(timer); timer = setTimeout(function () { syncAll("soon"); }, 1500); }

  /* pulled completions: activity for the day, never pay (invariant 160) */
  function logActivity(source, titles) {
    if (!titles.length || !KOS.sessions || !KOS.sessions.log) return;
    KOS.sessions.log({ type: "todo", metrics: { source: source, external: true, n: titles.length, item: titles[0] } });
  }

  /* ---------------- boot ---------------- */
  function isReturn() { return typeof location !== "undefined" && /[?&]state=ext-(google|todoist)-/.test(location.search); }
  function boot() {
    if (isReturn()) {
      var params = new URLSearchParams(location.search);
      try { history.replaceState(null, "", location.pathname + (location.hash || "")); } catch (e) { /* file:// */ }
      var tries = 0;
      (function wait() {
        if (!signedIn() && tries++ < 20) { setTimeout(wait, 1000); return; }
        complete(params).then(function (r) {
          KOS.ui.toast(r.ok ? NAME[r.p] + " connected" + (r.account ? ": " + r.account : "") + "." : r.why, !r.ok);
          if (KOS.show) KOS.show("connections");
        });
      })();
    }
    /* the media kv is opened only for a connected account (an early open
       would pre-empt the store's own version gate) */
    var g0 = store().state.ext && store().state.ext.google;
    if (KOS.extGcal && g0 && g0.on && g0.cal !== false) KOS.extGcal.loadRo().then(function () { if (KOS.extGcal.hasRo() && KOS.rerender) KOS.rerender(); });
    if (interval) clearInterval(interval);
    interval = setInterval(function () { syncAll("timer"); }, CYCLE_MS);
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible") noteLocal("focus"); });
    }
    /* the first cycle once the cloud session has restored */
    var t2 = 0;
    (function first() {
      if (!anyOn()) return;
      if (!signedIn() && t2++ < 30) { setTimeout(first, 2000); return; }
      syncAll("boot");
    })();
  }

  KOS.ext = {
    S: S, view: view, EXPORT_KINDS: EXPORT_KINDS, NAME: NAME, PROVIDERS: PROVIDERS,
    newUid: newUid, uidOk: uidOk, legacyUid: legacyUid, gcalId: gcalId, hashHex: hashHex, uuidOf: uuidOf,
    same: same, merge3: merge3,
    inbound: inbound, isInbound: isInbound, noteLocal: noteLocal, queueDelete: queueDelete,
    connect: connect, complete: complete, redirectUri: redirectUri, disconnect: disconnect, token: token, blocked: blocked, serverStatus: serverStatus, isReturn: isReturn,
    lease: lease, release: release, device: device,
    call: call, kv: kv, setKv: setKv, key: key,
    register: register, onChange: onChange, changed: changed, status: status, setStatus: setStatus,
    syncAll: syncAll, syncProvider: syncProvider, logActivity: logActivity, boot: boot,
    _setEdge: function (f) { edgeApi = f; }, _setNav: function (f) { nav = f; }, _clearTokens: function () { tokens = {}; }
  };
})();
