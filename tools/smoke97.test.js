/* Kurenai OS — smoke97.test.js
   What reaches a closed app (roadmap 5.7 item 1, docs/server-runner-plan.md;
   invariants 98, 71b, 131).

   The claims:

     A · FORECASTS: the calendar, reminder and assignment tickers each say
         what they WOULD fire in a window, under the ticker's own id and
         wording (one `notice()` for both), and the ticker still fires it.
     B · THE OUTLOOK: the next seven days of notices — alert forecasts and
         exam, money and goal notices at the morning time — with muted
         kinds left out, quiet hours moving a day notice and dropping a
         short alert, no money figure anywhere, and a brief of the week.
         build() writes nothing.
     C · PUBLISHING (KOS.push): off or signed out nothing is sent; on, the
         outlook goes up once and an unchanged one is not sent again; the
         schedules and the model route ride only with serverRuns.
     D · THE HAND-OVER: with serverRuns on a device never runs a schedule
         itself; the server's reply arrives through pull() onto its
         schedule and into the ledger under `asst:<id>:<day>`, once.
     E · THE RUNNER (pure, Node): due items hold while a device is present
         and drop when stale; schedules are due by the user's own clock;
         the payload decrypts with the browser's keys (RFC 8291) and the
         VAPID signature verifies (RFC 8292).
     F · THE PAGE: "When the app is closed" says why it is off here; with a
         key and a signed-in session its switches are live. The service
         worker shows a push under the ledger id.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke97.test.js                                            */
"use strict";
const fs = require("fs");
const path = require("path");
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }
const p = (fn) => new Promise((res, rej) => fn((e, v) => (e ? rej(e) : res(v))));
const ROOT = path.join(__dirname, "..");
const TODAY = "2026-10-22";

let app, K, T0;
step("boot", async () => {
  app = await boot({ clock: TODAY + "T10:00:00" });
  K = app.KOS;
  T0 = app.window.Date.now();   // the app's fixed clock, not this process's real one
  K.store.state.calendar.events = [];
  eq(app.errors, [], "boot errors");
});

let rem, asg;
step("A · the tickers' forecasts", () => {
  /* due the day after tomorrow: both alerts (on time and a day before, 23 Oct 09:00) lie ahead of
     the clock (22 Oct 10:00) — a reminder due tomorrow at 09:00 has its day-before alert an hour
     in the past, which a forecast rightly leaves out */
  rem = K.reminders.add({ title: "Hand in the form", due: "2026-10-24", dueTime: "09:00", alerts: [0, 1440] });
  asg = K.assignments.add({ title: "NEA analysis", subject: "compsci", due: "2026-10-25", dueTime: "17:00", alerts: [60] });
  K.calendar.addEvent({ title: "Maths mock", date: "2026-10-27", time: "09:00", type: "exam", subject: "maths", alerts: [1440, 30] });
  const to = T0 + 7 * 864e5;
  const r = K.reminders.forecast(T0, to);
  eq(r.map((x) => x.id).sort(), ["rem:" + rem.id + ":2026-10-24:09:00:0", "rem:" + rem.id + ":2026-10-24:09:00:1440"], "two reminder alerts");
  assert(r.every((x) => x.kind === "reminder" && x.at >= T0), "reminder kind and times");
  eq(r.find((x) => /:0$/.test(x.id)).at, new Date(2026, 9, 24, 9, 0).getTime(), "at the time");
  eq(r.find((x) => /:1440$/.test(x.id)).at, new Date(2026, 9, 23, 9, 0).getTime(), "and a day before");
  eq(K.reminders.notice(rem, 0).id, r.find((x) => /:0$/.test(x.id)).id, "the ticker and the forecast share one id");
  const a = K.assignments.forecast(T0, to);
  eq([a.length, a[0].at], [1, new Date(2026, 9, 25, 16, 0).getTime()], "an assignment's hour-before alert");
  const c = K.calendar.forecast(T0, to, "08:00");
  const day = c.find((x) => /:1440$/.test(x.id)), half = c.find((x) => /:30$/.test(x.id));
  eq(day.at, new Date(2026, 9, 26, 8, 0).getTime(), "a day-before alert lands that morning");
  eq(half.at, new Date(2026, 9, 27, 8, 30).getTime(), "a 30-minute alert at the minute");
  assert(/Exam · 1 day away/.test(day.body), "the ticker's own wording: " + day.body);
});

let built;
step("B · the outlook", async () => {
  K.money.addRule({ name: "Phone bill", amount: 12, kind: "out", cat: "bills", every: { n: 1, unit: "month" }, start: "2026-10-26" });
  const snap = JSON.stringify(K.store.state);
  built = await p((cb) => K.outlook.build(cb, { now: T0 }));
  eq(JSON.stringify(K.store.state), snap, "build writes nothing");
  const ids = built.items.map((x) => x.id);
  assert(ids.some((i) => /^rem:/.test(i)) && ids.some((i) => /^asg:/.test(i)) && ids.some((i) => /^cal:/.test(i)), "the alert forecasts");
  const bill = built.items.find((x) => x.kind === "money");
  assert(bill && /Phone bill/.test(bill.title), "the bill's notice: " + JSON.stringify(built.items.map((x) => x.id)));
  eq(new Date(bill.at).getHours(), 8, "a day notice at the morning time");
  assert(!/£|12\.00/.test(JSON.stringify(built)), "no money figure anywhere");
  assert(built.items.every((x, i, A) => !i || A[i - 1].at <= x.at), "in time order");
  eq(built.brief.days.length, 7, "the brief holds the week");
  assert(built.brief.assignments.some((x) => x.title === "NEA analysis"), "open assignments in the brief");
  const tue = built.brief.days.find((d) => d.date === "2026-10-27");
  assert(tue && tue.events.some((e) => e.title === "Maths mock"), "events by day: " + JSON.stringify(tue));
  assert(built.brief.bills.some((b) => b.name === "Phone bill" && !("minor" in b)), "bills by name, no amount");
  /* muted and quiet */
  K.notify.setMuted("money", true);
  K.notify.setQuiet({ on: true, from: "07:00", to: "09:30" });
  const q = await p((cb) => K.outlook.build(cb, { now: T0 }));
  assert(!q.items.some((x) => x.kind === "money"), "a muted kind is left out");
  assert(!q.items.some((x) => x.id === "rem:" + rem.id + ":2026-10-24:09:00:0"), "a short alert inside quiet hours is dropped");
  const exam = q.items.find((x) => /:1440$/.test(x.id) && x.kind === "calendar");
  eq(new Date(exam.at).getHours() * 60 + new Date(exam.at).getMinutes(), 9 * 60 + 30, "a day notice waits for quiet hours to end");
  K.notify.setMuted("money", false);
  K.notify.setQuiet({ on: false });
});

let table;
function fakeCloud() {
  const t = { subs: [], outlooks: [], beats: 0, runs: [] };
  t.api = {
    saveSub(row, cb) { t.subs.push(row); cb(null); },
    dropSub(endpoint, cb) { t.subs = t.subs.filter((s) => s.endpoint !== endpoint); cb(null); },
    saveOutlook(row, cb) { t.outlooks.push(row); cb(null); },
    beat(cb) { t.beats++; cb(null); },
    runsSince(iso, cb) { cb(null, t.runs.filter((r) => !iso || r.updated_at > iso)); }
  };
  return t;
}
step("C · publishing", async () => {
  table = fakeCloud();
  K.push._setCloudApi(table.api);
  app.window.KOS_ENV = Object.assign({}, app.window.KOS_ENV, { VAPID_PUBLIC_KEY: "BPub" });
  K.cloud.signedIn = () => false;
  eq((await p((cb) => K.push.publish(true, cb))).skipped, true, "off: nothing is sent");
  K.store.state.notifyCloud = { on: true, serverRuns: false };
  eq((await p((cb) => K.push.publish(true, cb))).skipped, true, "signed out: nothing is sent");
  K.cloud.signedIn = () => true; K.cloud.userId = () => "u1";
  const first = await p((cb) => K.push.publish(false, cb));
  eq([first.published, table.outlooks.length], [true, 1], "on and signed in: published");
  eq(table.outlooks[0].user_id, "u1", "for this user");
  eq([table.outlooks[0].data_json.schedules.length, table.outlooks[0].data_json.route], [0, null], "no schedules without serverRuns");
  const again = await p((cb) => K.push.publish(false, cb));
  eq([again.same, table.outlooks.length], [true, 1], "an unchanged outlook is not sent again");
  K.reminders.add({ title: "New thing", due: "2026-10-24", dueTime: "12:00", alerts: [0] });
  await p((cb) => K.push.publish(false, cb));
  eq(table.outlooks.length, 2, "a change publishes");
  K.push.beat();
  eq(table.beats, 0, "a page left open but untouched is not presence");
  app.window.document.dispatchEvent(new app.window.Event("pointerdown"));
  K.push.beat();
  eq(table.beats, 0, "nor is one touched in a window without focus");
  app.window.document.hasFocus = () => true;
  K.push.beat();
  eq(table.beats, 1, "presence beats while in use");
});

let sch;
step("D · the hand-over to the server", async () => {
  sch = K.ai.schedule.add({ prompt: "What's on today?", name: "Morning", time: "07:00", days: [0, 1, 2, 3, 4, 5, 6] }).schedule;
  sch.lastRun = null;
  K.push.setServerRuns(true);
  await app.settle();
  const o = table.outlooks[table.outlooks.length - 1].data_json;
  eq([o.serverRuns, o.schedules.map((s) => s.id)], [true, [sch.id]], "the schedules ride with serverRuns");
  assert(o.route && o.route.provider, "and the model route");
  assert(K.ai.schedule.serverOwned(), "the server owns the runs");
  let ran = false;
  const orch = K.ai.orchestrator;
  K.ai.orchestrator = Object.assign({}, orch, { send() { ran = true; return "x"; }, isBusy: () => false });
  K.ai.schedule.tick();
  eq(ran, false, "a device never runs a schedule the server owns");
  K.ai.orchestrator = orch;
  table.runs.push({ schedule_id: sch.id, day: TODAY, ok: true, text: "Maths mock on Tuesday; NEA due Sunday.", updated_at: "2026-10-22T06:01:00Z" });
  eq(await p((cb) => K.push.pull(cb)), 1, "the reply is pulled");
  const rec = K.ai.schedule.get(sch.id);
  eq([rec.lastRun, rec.last.server, rec.last.ok], [TODAY, true, true], "onto its schedule");
  assert(K.store.state.notify.items.some((i) => i.id === "asst:" + sch.id + ":" + TODAY), "into the ledger under the push's id");
  eq(await p((cb) => K.push.pull(cb)), 0, "once");
});

step("E · the runner's logic and crypto", async () => {
  const L = await import(path.join(ROOT, "supabase/functions/runner/logic.ts"));
  const W = await import(path.join(ROOT, "supabase/functions/runner/webpush.ts"));
  /* Apple answers BadWebPushTopic to anything but exact base64url */
  const tp = await W.topicOf("cal:7:2026-10-26:60");
  assert(/^[A-Za-z0-9_-]{32}$/.test(tp) && tp === await W.topicOf("cal:7:2026-10-26:60"), "a push topic is 32 base64url characters, the same for the same item");
  const now = Date.UTC(2026, 9, 22, 7, 2);
  const items = [{ id: "a", at: now - 60000 }, { id: "b", at: now + 60000 }, { id: "c", at: now - 3600000 }, { id: "d", at: now - 120000 }];
  eq(L.dueItems(items, new Set(["d"]), now).map((x) => x.id), ["a"], "due, not stale, not sent");
  eq([L.present(new Date(now - 60000).toISOString(), now), L.present(new Date(now - 600000).toISOString(), now), L.present(null, now)], [true, false, false], "presence");
  /* a device in front holds everything but a test ("Send a test") */
  const its = [{ id: "a", kind: "calendar" }, { id: "test:1", kind: "test" }];
  eq([L.sendable(its, true).map((x) => x.id), L.sendable(its, false).length], [["test:1"], 2], "the hold lets a test through");
  const S = [{ id: "m", prompt: "x", time: "07:00", days: [4], enabled: true }, { id: "n", prompt: "y", time: "09:00", days: [4], enabled: true }];
  eq(L.dueSchedules(S, new Set(), now, "Europe/London").map((x) => [x.s.id, x.day]), [["m", "2026-10-22"]], "07:00 London is due at 08:02 London");
  eq(L.dueSchedules(S, new Set(["m|2026-10-22"]), now, "Europe/London").length, 0, "once a local day");
  eq(L.dueSchedules(S, new Set(), now, "America/New_York").length, 0, "03:02 in New York: not yet");
  const rp = L.runPrompt({ days: [] }, "What's on?", now, "Europe/London");
  assert(/no tools/i.test(rp.system) && /BRIEF/.test(rp.user) && /What's on\?/.test(rp.user), "the brief, then the message");
  const s = globalThis.crypto.subtle, te = new TextEncoder();
  const ua = await s.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
  const uaPub = new Uint8Array(await s.exportKey("raw", ua.publicKey)), auth = globalThis.crypto.getRandomValues(new Uint8Array(16));
  const body = await W.encrypt(te.encode('{"title":"hi"}'), W.b64u(uaPub), W.b64u(auth));
  const salt = body.slice(0, 16), asPub = body.slice(21, 21 + body[20]), ct = body.slice(21 + body[20]);
  const hmac = async (k, d) => new Uint8Array(await s.sign("HMAC", await s.importKey("raw", k, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]), d));
  const cat = (...a) => { const o = new Uint8Array(a.reduce((n, x) => n + x.length, 0)); let i = 0; for (const x of a) { o.set(x, i); i += x.length; } return o; };
  const hk = async (sl, ikm, info, n) => (await hmac(await hmac(sl, ikm), cat(info, new Uint8Array([1])))).slice(0, n);
  const ecdh = new Uint8Array(await s.deriveBits({ name: "ECDH", public: await s.importKey("raw", asPub, { name: "ECDH", namedCurve: "P-256" }, false, []) }, ua.privateKey, 256));
  const ikm = await hk(auth, ecdh, cat(te.encode("WebPush: info\0"), uaPub, asPub), 32);
  const cek = await hk(salt, ikm, te.encode("Content-Encoding: aes128gcm\0"), 16), nonce = await hk(salt, ikm, te.encode("Content-Encoding: nonce\0"), 12);
  const pt = new Uint8Array(await s.decrypt({ name: "AES-GCM", iv: nonce }, await s.importKey("raw", cek, "AES-GCM", false, ["decrypt"]), ct));
  eq([new TextDecoder().decode(pt.slice(0, -1)), pt[pt.length - 1]], ['{"title":"hi"}', 2], "the browser decrypts it (RFC 8291)");
  const vk = await s.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
  const jwk = await s.exportKey("jwk", vk.privateKey), pub = new Uint8Array(await s.exportKey("raw", vk.publicKey));
  const h = await W.vapidHeader("https://web.push.apple.com/abc", W.b64u(pub), jwk.d, "mailto:a@b.c");
  const t = /t=([^,]+)/.exec(h)[1].split(".");
  assert(await s.verify({ name: "ECDSA", hash: "SHA-256" }, vk.publicKey, W.unb64u(t[2]), te.encode(t[0] + "." + t[1])), "the VAPID signature verifies (RFC 8292)");
  eq(JSON.parse(new TextDecoder().decode(W.unb64u(t[1]))).aud, "https://web.push.apple.com", "for the push service's origin");
  const src = fs.readFileSync(path.join(ROOT, "supabase/functions/runner/index.ts"), "utf8");
  assert(/sameSecret\(auth\.slice\(7\), secret\)/.test(src) && !/kos_state/.test(src.replace(/\/\*[\s\S]*?\*\//g, "")), "cron secret checked; kos_state never read");
  assert(!/console\.(log|warn|error|info|debug)/.test(src + fs.readFileSync(path.join(ROOT, "supabase/functions/runner/model.ts"), "utf8")), "no logging");
  assert(/\[functions\.runner\]\s*\nverify_jwt = false/.test(fs.readFileSync(path.join(ROOT, "supabase/config.toml"), "utf8")), "the runner is cron-only");
});

step("F · the page and the service worker", async () => {
  const $ = (s) => app.document.querySelector(s);
  K.cloud.signedIn = () => false;
  K.show("notifications"); await app.settle();
  const card = $("[data-ui~='notify.closed']");
  assert(card && /Sign in to cloud sync/.test(card.textContent), "says why it is off: " + (card && card.textContent));
  assert($("[data-ui~='notify.closed-toggle']").disabled, "and its switch is off");
  K.cloud.signedIn = () => true;
  app.window.PushManager = function () {};
  app.window.Notification = app.window.Notification || function () {};
  Object.defineProperty(app.window.navigator, "serviceWorker", { value: { getRegistration: () => Promise.resolve(null) }, configurable: true });
  K.show("notifications"); await app.settle();
  assert(!$("[data-ui~='notify.closed-toggle']").disabled, "live once configured and signed in");
  assert($("[data-ui~='notify.server-runs']").checked, "the schedules switch shows the account's setting");
  const sw = fs.readFileSync(path.join(ROOT, "sw.js"), "utf8");
  assert(/addEventListener\("push"/.test(sw) && /tag: m\.id/.test(sw), "the service worker shows a push under the ledger id");
  K.push._setCloudApi(null);
  eq(app.errors, [], "no errors");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + e.message); }
  }
  console.log(failed ? "smoke97: " + failed + " failed" : "smoke97: all " + steps.length + " passed");
  process.exit(failed ? 1 : 0);
})();
