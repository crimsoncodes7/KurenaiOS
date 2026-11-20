/* Kurenai OS — core/gameapi.js (Build 4c)
   The browser client for the game Edge Functions: IGDB title search and the
   verified Steam link/import. Everything here requires the cloud session —
   the functions authorise by JWT — and every call happens only on an
   explicit user action (a typed search, a pressed button). Manual entry
   remains the Games module's permanent baseline: with no cloud sign-in, no
   server credentials, or either upstream API down, every caller gets a
   plain-English error and the module keeps working untouched.

   Identity rule (invariant): the browser NEVER supplies a SteamID. It asks
   steam-auth to begin the OpenID flow, Steam talks to the server, and the
   server stores what STEAM verified. steam-owned-games then reads only that
   stored identity.                                                        */
(function () {
  "use strict";
  window.KOS = window.KOS || {};

  function ready() {
    return !!(KOS.cloud && KOS.cloud.available() && KOS.cloud.userId());
  }
  function notReadyError() {
    if (!KOS.cloud || !KOS.cloud.configured()) {
      return new Error("Game search and Steam import need cloud sync, which isn't configured on this device (see Archive → Account & Cloud Sync).");
    }
    return new Error("Sign in to cloud sync first (Archive → Account & Cloud Sync) — game search and Steam import authenticate through your account.");
  }

  /* the shared Edge Function call (KOS.cloud.invoke) with this module's
     wording for the signed-out case */
  function invoke(name, body, cb) {
    if (!ready()) { cb(notReadyError()); return; }
    KOS.cloud.invoke(name, body, cb);
  }

  /* ---------------- IGDB search ---------------- */
  function igdbSearch(query, platform, cb) {
    invoke("igdb-search", { query: query, platform: platform || null }, function (err, data) {
      if (err) { cb(err, []); return; }
      cb(null, (data && data.results) || []);
    });
  }

  /* ---------------- Steam ---------------- */
  function steamStatus(cb) { invoke("steam-auth", { action: "status" }, cb); }
  function steamBegin(cb) { invoke("steam-auth", { action: "begin" }, cb); }
  function steamUnlink(cb) { invoke("steam-auth", { action: "unlink" }, cb); }
  function steamOwnedGames(cb) { invoke("steam-owned-games", {}, cb); }

  /* Steam's sign-in tab comes back here as `/?steam=<code>` (steam-auth's
     callback redirects; a page on *.supabase.co would show as raw source).
     The code is read once, taken out of the address, said in a toast and
     Games opens, where Steam library… carries on. */
  var STEAM_RESULT = {
    linked: "Steam account linked. Open Steam library… in Games to import what you own.",
    malformed: "Steam link failed: the request was malformed. Start again from Steam library… in Games.",
    unknown: "Steam link failed: that link request is unknown or was already used. Start again from Steam library… in Games.",
    expired: "Steam link expired: it took longer than 10 minutes. Start again from Steam library… in Games.",
    cancelled: "Steam link cancelled: Steam did not complete the sign-in.",
    endpoint: "Steam link failed: Steam's answer was addressed somewhere else. Start again from Steam library… in Games.",
    unreachable: "Steam link failed: Steam could not be reached to verify the sign-in. Try Link Steam again in a minute.",
    refused: "Steam link failed: Steam refused to verify the sign-in.",
    identity: "Steam link failed: Steam returned an identity Kurenai doesn't recognise.",
    store: "Steam link failed: verified, but the link could not be saved. Try again."
  };
  function steamReturn() {
    if (typeof location === "undefined") return null;
    var m = /[?&]steam=([a-z]+)/.exec(location.search || "");
    return m && STEAM_RESULT[m[1]] ? m[1] : null;
  }
  function boot() {
    var code = steamReturn();
    if (!code) return;
    try { history.replaceState(null, "", location.pathname + (location.hash || "")); } catch (e) { /* file:// */ }
    if (KOS.ui && KOS.ui.toast) KOS.ui.toast(STEAM_RESULT[code], code !== "linked");
    if (KOS.show) KOS.show("game");
  }

  KOS.gameapi = {
    STEAM_RESULT: STEAM_RESULT,
    steamReturn: steamReturn,
    boot: boot,
    ready: ready,
    igdbSearch: igdbSearch,
    steamStatus: steamStatus,
    steamBegin: steamBegin,
    steamUnlink: steamUnlink,
    steamOwnedGames: steamOwnedGames
  };
})();
