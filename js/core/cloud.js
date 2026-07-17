/* Kurenai OS — core/cloud.js
   The Supabase client + auth wrapper (Build 4a). This file owns exactly two
   things: creating the one shared client, and email/password auth (sign-up,
   sign-in, sign-out, session restoration, auth-change fan-out). Everything
   about SYNCING lives in cloudsync.js.

   Configuration comes from the gitignored js/env.local.js (see
   js/env.example.js) and the vendored supabase-js UMD build — both loaded
   with `defer`, so this module must always feature-check lazily. With either
   missing the app runs exactly as before: fully local, sync unconfigured.
   The publishable key is browser-public BY DESIGN; Row-Level Security on the
   Supabase tables is the actual security boundary.

   Session persistence is the client library's own (localStorage key
   "sb-<ref>-auth-token") — deliberately OUTSIDE KOS.store.state, so R3
   backups keep excluding credentials with no extra filtering, same rule as
   the AniList/VNDB tokens. Never log tokens; errors are surfaced by message
   only.

   Email confirmation is DISABLED on this deployment (bespoke single-user
   app), so sign-up starts a session immediately. The code still branches on
   a null session so enabling confirmation later degrades to a clear message
   instead of a broken flow.                                                 */
(function () {
  "use strict";
  window.KOS = window.KOS || {};

  var client = null;
  var session = null;
  var listeners = [];

  function env() {
    var e = window.KOS_ENV;
    if (!e || !e.SUPABASE_URL || !e.SUPABASE_ANON_KEY) return null;
    if (String(e.SUPABASE_URL).indexOf("<") !== -1) return null;   // the template file
    return e;
  }
  function configured() { return !!env(); }
  function libLoaded() { return !!(window.supabase && window.supabase.createClient); }
  function available() { return configured() && libLoaded(); }

  function getClient() {
    if (client) return client;
    if (!available()) return null;
    var e = env();
    try {
      client = window.supabase.createClient(e.SUPABASE_URL, e.SUPABASE_ANON_KEY, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false }
      });
    } catch (err) {
      console.warn("Kurenai OS: could not create the Supabase client.", err && err.message);
      return null;
    }
    client.auth.onAuthStateChange(function (event, s) {
      session = s || null;
      listeners.forEach(function (fn) {
        try { fn(event, session); } catch (e2) { console.warn("cloud auth listener failed", e2); }
      });
    });
    return client;
  }

  /* auth errors arrive with server wording; keep the message, drop the rest
     (no status objects, no tokens) */
  function friendly(err, fallback) {
    var m = (err && (err.message || err.error_description)) || fallback || "Cloud request failed.";
    return new Error(String(m));
  }
  function notConfigured() {
    return new Error("Cloud sync isn't configured on this device — copy js/env.example.js to js/env.local.js and fill in your Supabase project values.");
  }

  /* restore any persisted session. cb(err, session|null) — a missing
     session is NOT an error, it's the signed-out state. */
  function init(cb) {
    var c = getClient();
    if (!c) { cb && cb(null, null); return; }
    c.auth.getSession().then(function (res) {
      session = (res.data && res.data.session) || null;
      cb && cb(null, session);
    }).catch(function (e) {
      /* Supabase unreachable — signed-out behaviour, never a crash */
      cb && cb(null, null);
    });
  }

  function signUp(email, password, cb) {
    var c = getClient();
    if (!c) { cb(notConfigured()); return; }
    c.auth.signUp({ email: email, password: password }).then(function (res) {
      if (res.error) { cb(friendly(res.error, "Sign-up failed.")); return; }
      if (!res.data || !res.data.session) {
        /* confirmation must have been (re-)enabled server-side */
        cb(new Error("Account created, but the server wants the email address confirmed before signing in. Confirm it from your inbox, then sign in here."));
        return;
      }
      session = res.data.session;
      cb(null, session);
    }).catch(function (e) { cb(friendly(e, "Sign-up failed — is the network up?")); });
  }

  function signIn(email, password, cb) {
    var c = getClient();
    if (!c) { cb(notConfigured()); return; }
    c.auth.signInWithPassword({ email: email, password: password }).then(function (res) {
      if (res.error) { cb(friendly(res.error, "Sign-in failed.")); return; }
      session = (res.data && res.data.session) || null;
      cb(null, session);
    }).catch(function (e) { cb(friendly(e, "Sign-in failed — is the network up?")); });
  }

  function signOut(cb) {
    var c = getClient();
    if (!c) { session = null; cb && cb(null); return; }
    c.auth.signOut().then(function () {
      session = null;
      cb && cb(null);
    }).catch(function (e) {
      /* even a failed remote revoke signs out locally */
      session = null;
      cb && cb(null);
    });
  }

  function onAuth(fn) { if (typeof fn === "function") listeners.push(fn); }

  function userId() { return session && session.user ? session.user.id : null; }
  function userEmail() { return session && session.user ? (session.user.email || "") : ""; }

  KOS.cloud = {
    configured: configured,
    available: available,
    client: getClient,
    init: init,
    signUp: signUp,
    signIn: signIn,
    signOut: signOut,
    onAuth: onAuth,
    userId: userId,
    userEmail: userEmail,
    /* test seam — smoke17 injects a fake session without a real client */
    _setSession: function (s) { session = s || null; }
  };
})();
