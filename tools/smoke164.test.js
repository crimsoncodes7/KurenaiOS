/* Kurenai OS — smoke164.test.js
   Design turn 41, the first open (decision B8).

   The claims:

     A · NO SAMPLE EVENTS. A new device plants none (the calendar is still
         marked seeded); it stays pristine (invariant 34's userData).
     B · THE WELCOME IS OWED only on a pristine, signed-out device with cloud
         sync set up — never signed in, never once answered, never with
         "Use this device only" — and badges a new device earns by itself do
         not count as the user's data.
     C · ONE SCREEN: the mark, a line, "Sign in to bring your data", "Start
         fresh" and the live theme swatches (a press sets the theme, the
         switch follows the system). Sign in opens the existing email and
         password sign-in in place, with ‹ Back; a refusal is said in words.
     D · SIGNING IN shows the account's copy arriving and opens Home once
         this page load holds it (KOS.cloudsync.settled); answered "signin".
     E · START FRESH: answered "fresh"; Home then shows the three first
         steps in Routines and Reminders' place (each opening its page), the
         daily goal says it fills in with subjects, and the steps go once the
         device holds anything of the user's.
     F · HELD UNTIL ANSWERED: the plan's carry-over notice is not pushed
         while the welcome is owed.
     G · THE CHIP'S WAY OUT: Account & Cloud Sync's "Use this device only"
         ends "Not synced · Sign in" and the welcome; pressed again it is back.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke164.test.js                                           */
"use strict";
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }

let app, K, doc, uid = null, signInAnswer = null;
const $ = (s) => doc.querySelector(s);
const $$ = (s) => [...doc.querySelectorAll(s)];
const text = (n) => (n ? n.textContent.replace(/\s+/g, " ").trim() : "");
function click(n) { assert(n, "nothing to click"); n.dispatchEvent(new app.window.MouseEvent("click", { bubbles: true })); }
function closeWelcome() { const o = $(".k-wel-overlay"); if (o) o.close(); }
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

step("boot, with cloud sync set up and signed out", async () => {
  app = await boot({ clock: "2026-11-17T16:35:00", before: (w) => { w.KOS_SAMPLE_EVENTS = false; } });
  K = app.KOS; doc = app.document;
  /* the harness has no js/env.local.js: stand in for a configured cloud */
  K.cloud.configured = () => true;
  K.cloud.available = () => true;
  K.cloud.userId = () => uid;
  K.cloud.userEmail = () => (uid ? "crimson@example.com" : "");
  K.cloud.signIn = (e, p, cb) => setTimeout(() => { if (signInAnswer) cb(signInAnswer); else { uid = "u1"; cb(null, {}); } }, 0);
  K.cloudsync.settled = () => true;
  eq(app.errors, [], "boot errors");
});

/* ---------------- A ---------------- */
step("A · no SAMPLE events on a new device", () => {
  eq((K.store.state.calendar.events || []).length, 0, "no events planted");
  assert(K.store.state.calendar.seeded, "still marked seeded");
  eq(K.cloudsync.userData(K.store.state), null, "the device is pristine");
});

/* ---------------- B ---------------- */
step("B · owed only where it should be", () => {
  assert(K.welcome.pending(), "a pristine, signed-out device with cloud set up");
  K.store.state.achievements.earned["week-by-week"] = { tier: 1, at: Date.now(), t: { 1: Date.now() } };
  assert(K.welcome.pending(), "a badge the device earned by itself is not the user's data");
  delete K.store.state.achievements.earned["week-by-week"];
  uid = "u0"; assert(!K.welcome.pending(), "never signed in"); uid = null;
  const cfg = K.cloud.configured; K.cloud.configured = () => false;
  assert(!K.welcome.pending(), "never without cloud sync"); K.cloud.configured = cfg;
  K.store.state.ui.localOnly = true; assert(!K.welcome.pending(), "never with Use this device only"); delete K.store.state.ui.localOnly;
  K.store.state.reminders.items.push({ id: 900, title: "Mine", done: false });
  assert(!K.welcome.pending(), "never once the device holds the user's data");
  K.store.state.reminders.items.pop();
  assert(K.welcome.neverSynced(), "the chip says Not synced");
});

/* ---------------- C ---------------- */
step("C · one screen; the swatches are live; sign in in place", async () => {
  K.welcome.open(); await app.settle();
  const scr = $("[data-ui~='welcome.screen']");
  assert(scr && /Kurenai/.test(text(scr)) && /Study, routines and your collection/.test(text(scr)), "the mark and the line");
  assert($("[data-ui~='welcome.sign-in']") && $("[data-ui~='welcome.fresh']"), "the two ways in");
  eq($$("[data-ui~='welcome.theme']").length, 2, "Graphite and Dawn");
  click($$("[data-ui~='welcome.theme']")[1]); await app.settle();
  eq(K.store.state.governor.theme, "atelier-dawn", "Dawn chosen");
  assert($$("[data-ui~='welcome.theme']")[1].getAttribute("aria-pressed") === "true", "and ringed");
  click($$("[data-ui~='welcome.theme']")[0]); await app.settle();
  eq(K.store.state.governor.theme, "atelier-dusk", "back to Graphite");
  click($("[data-ui~='welcome.sign-in']")); await app.settle();
  assert($("[data-ui~='welcome.email']") && $("[data-ui~='welcome.password']"), "the sign-in, in place");
  click($("[data-ui~='welcome.submit']")); await app.settle();
  assert(/Enter both/.test(text($("[data-ui~='welcome.msg']"))), "both fields asked for");
  signInAnswer = { message: "Invalid login credentials" };
  $("[data-ui~='welcome.email']").value = "crimson@example.com"; $("[data-ui~='welcome.password']").value = "wrong-password";
  click($("[data-ui~='welcome.submit']")); await wait(20); await app.settle();
  assert(/Invalid login credentials/.test(text($("[data-ui~='welcome.msg']"))), "a refusal said in words");
  signInAnswer = null;
  click($("[data-ui~='welcome.back']")); await app.settle();
  assert($("[data-ui~='welcome.fresh']"), "‹ Back to the two ways in");
  closeWelcome();
  assert(!K.store.state.ui.welcomed, "closing it answers nothing");
});

/* ---------------- F ---------------- */
step("F · the plan's carry-over notice waits for the answer", () => {
  assert(K.welcome.pending(), "still owed");
  eq(K.pacing.noteRollover(), false, "nothing pushed");
  assert(!(K.store.state.notify.items || []).some((n) => /^pace:carry:/.test(n.id)), "no carry-over notice");
});

/* ---------------- E ---------------- */
step("E · Start fresh: Home's three first steps", async () => {
  K.welcome.open(); await app.settle();
  click($("[data-ui~='welcome.fresh']")); await app.settle();
  eq(K.store.state.ui.welcomed, "fresh", "answered");
  assert(!$(".k-wel-overlay"), "the screen is gone");
  eq(K.store.state.ui.view, "home", "Home");
  const st = $$("[data-ui~='home.first-step']");
  eq(st.length, 3, "three first steps");
  assert(/Pick your subjects/.test(text(st[0])) && /Import your Collection/.test(text(st[1])) && /Connect a calendar/.test(text(st[2])), "subjects, Collection, calendar");
  assert(!$("[data-ui~='rem.sum']"), "in Routines and Reminders' place");
  assert(/Fills in once you have subjects/.test(text($("[data-ui~='habit.panel']"))), "the daily goal's line");
  click(st[1].querySelector("[data-ui~='home.first-step-go']")); await app.settle();
  eq(K.store.state.ui.view, "mediasync", "Import your Collection opens Sync & Import");
  K.show("home"); await app.settle();
  K.store.state.reminders.items.push({ id: 901, title: "Mine", done: false }); K.store.save();
  K.show("home"); await app.settle();
  assert(!$("[data-ui~='home.first-steps']") && $("[data-ui~='rem.sum']"), "the steps go once the device holds the user's data");
  K.store.state.reminders.items.pop();
  delete K.store.state.ui.welcomed; K.store.save();
});

/* ---------------- D ---------------- */
step("D · signing in: the account's copy arriving, then Home", async () => {
  K.show("calendar"); await app.settle();
  K.welcome.open(); await app.settle();
  click($("[data-ui~='welcome.sign-in']")); await app.settle();
  $("[data-ui~='welcome.email']").value = "crimson@example.com"; $("[data-ui~='welcome.password']").value = "a-good-password";
  click($("[data-ui~='welcome.submit']")); await wait(5);
  eq(K.store.state.ui.welcomed, "signin", "answered by signing in");
  const list = $("[data-ui~='welcome.arriving']");
  assert(list && /Your study/.test(text(list)) && /Collection/.test(text(list)) && /Sessions and routines/.test(text(list)), "what is arriving");
  assert(/Bringing your data/.test(text($("[data-ui~='welcome.screen']"))), "the screen says so");
  for (let i = 0; i < 40 && $(".k-wel-overlay"); i++) { await app.settle(); await wait(50); }
  assert(!$(".k-wel-overlay"), "it closes once the copy is held");
  eq(K.store.state.ui.view, "home", "and Home opens");
  uid = null;
});

/* ---------------- H ---------------- */
step("H · it opens by itself once the sync library arrives after boot", async () => {
  uid = null; delete K.store.state.ui.welcomed; delete K.store.state.ui.localOnly;
  /* the library is not loaded for the first few looks, then it is */
  let looks = 0;
  K.cloud.available = () => ++looks > 6;
  K.welcome.maybeOpen();
  for (let i = 0; i < 40 && !$(".k-wel-overlay"); i++) { await app.settle(); await wait(20); }
  assert(looks > 6, "it kept looking while the library loaded");
  assert($("[data-ui~='welcome.screen']"), "it opens once the library is in");
  closeWelcome();
  K.cloud.available = () => true;
});

/* ---------------- G ---------------- */
step("G · Use this device only, and back", async () => {
  uid = null;
  delete K.store.state.ui.welcomed;
  K.show("data"); await app.settle();
  const b = $("[data-ui~='cloud.local-only']");
  assert(b && /Use this device only/.test(text(b)), "offered while signed out");
  click(b); await app.settle();
  assert(K.store.state.ui.localOnly === true && !K.welcome.neverSynced() && !K.welcome.pending(), "the chip's prompt and the welcome go");
  click($("[data-ui~='cloud.local-only']")); await app.settle();
  assert(!K.store.state.ui.localOnly && K.welcome.neverSynced(), "and come back");
  eq(app.errors, [], "no page errors");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok   " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + (e && e.stack || e)); }
  }
  console.log(failed ? `\n${failed} of ${steps.length} step(s) failed` : `\nall ${steps.length} steps passed`);
  process.exit(failed ? 1 : 0);
})();
