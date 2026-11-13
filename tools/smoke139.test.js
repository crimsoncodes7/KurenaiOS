/* Kurenai OS — smoke139.test.js
   W2's core: the redraw policy, the change bus and the view lifecycle
   (js/core/redraw.js; invariants 164–166). It replaces the kos-redraw-1
   stopgap, which never redrew a study page and so left it stale.

     A · the bus: snapshot/diff name the top-level keys that moved, and
         this device's own `ui` is never one of them
     B · SY-05: a change the page on screen does not read redraws nothing
         and shows nothing (a pull that moved only Money, on a topic page)
     C · SY-26: a change a TASK page reads is never applied under the
         reader — "Updated on another device · Refresh"; Refresh redraws;
         leaving the page clears it; what this device did itself is silent
     D · elsewhere it is applied at a safe point: at once when idle, after
         a dialog closes, after typing ends — and the text typed into a
         field and not yet submitted is still there (SY-08, SY-24)
     E · a redraw keeps keyboard focus (AP-10, AA-15) and inner scrollers
     F · two tabs: another tab's write redraws only a page that reads it,
         worded "Updated in another tab"
     G · the lifecycle: onDispose, token, signal; memo survives a redraw
         and is dropped by a navigation; keep survives both
     H · AX-38: a real navigation closes the dialogs open over the page it
         leaves; the same page shown again keeps them; {persist} stays
     I · SY-20, AX-22: Edit your seat keeps its draft and tab across a
         background redraw, holds while unsaved, and leaving asks first
         (Stay keeps the page and the address; Leave goes)
     J · SY-02, ST-36: the notes page being read survives a redraw and
         coming back to the topic
     K · SY-19: a vault redraws as deep as the reader had scrolled
     L · SH-20 Enter on Cancel cancels; SH-21 the skip link focuses #main
         and routes nowhere; SH-02 Backspace is not Back; SH-23 the same
         page twice is one history entry; SH-41 an unknown view is Home
     M · UR-3, SY-06: a finished review is never downgraded to skipped;
         one finished elsewhere closes the open sheet; no auto-open over a
         page with work in it
     N · every view's declared reads cover what it reads while it draws

   Run: node tools/smoke139.test.js */
"use strict";
const { boot, sharedStorage, fakeLocks } = require("./lib/app-harness");
const { seedAccount } = require("./lib/seed");
const SURF = require("./lib/view-surfaces");
const fake = require("fake-indexeddb");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }

let app, KOS, document, window;
const main = () => document.getElementById("main");
const pill = () => document.querySelector("[data-ui~='shell.refresh']");
const pillShown = () => { const p = pill(); return !!p && !p.hidden; };
const TOPIC = { subject: "compsci", ref: "4.2.3.1" };
/* a page is remounted when its first node is a new one */
function mark() { const n = main().firstElementChild; n.__mark = (n.__mark || 0) + 1; return n; }
const remounted = (n) => main().firstElementChild !== n;
/* the harness's clock: move it past the "touched in the last few seconds" window */
async function idle() { window.setTimeout(() => {}, 900); for (let i = 0; i < 8; i++) { window.setTimeout(() => {}, 900); await app.settle(); } }

step("boot a used account", async () => {
  app = await boot();
  ({ KOS, document, window } = app);
  await seedAccount(app);
  await app.settle();
  eq(app.errors, [], "no load errors");
  assert(KOS.changes && KOS.view && typeof KOS.rerender === "function", "the redraw core is loaded");
});

step("A · the bus names the top-level keys that moved; `ui` never is one", async () => {
  const snap = KOS.changes.snapshot();
  eq(KOS.changes.diff(snap), [], "nothing moved");
  KOS.store.state.ui.someDevicePref = 1;
  eq(KOS.changes.diff(snap), [], "this device's ui is not a change");
  KOS.store.state.money.currency = KOS.store.state.money.currency === "GBP" ? "EUR" : "GBP";
  eq(KOS.changes.diff(snap), ["money"], "Money moved");
  KOS.store.state.reminders.items.push({ id: 99901, title: "x", created: 1 });
  eq(KOS.changes.diff(snap).sort(), ["money", "reminders"], "and Reminders");
  KOS.store.state.reminders.items.pop();
});

step("B · SY-05: a change the page does not read redraws nothing and says nothing", async () => {
  KOS.show("ref", TOPIC);
  await app.settle();
  const n = mark();
  assert(!KOS.changes.relevant("ref", TOPIC, ["money"]), "a topic page does not read Money");
  KOS.rerender({ background: "hard", changed: ["money"], source: "device" });
  await app.settle();
  assert(!remounted(n), "the topic page was not remounted");
  assert(!pillShown(), "and no pill");
  eq(KOS.changes.pending(), null, "nothing is waiting");
});

step("C · SY-26: a task page is never redrawn under the reader; the pill offers it", async () => {
  const n = mark();
  KOS.rerender({ background: "hard", changed: ["progress"], source: "device" });
  await app.settle();
  assert(!remounted(n), "not remounted");
  assert(pillShown(), "the pill is shown");
  assert(/Updated on another device/.test(pill().textContent) && /Refresh/.test(pill().textContent), "its words: " + pill().textContent);
  eq(KOS.changes.pending(), { source: "device", why: "task" }, "pending");
  /* what this device did itself behind the page is not news (SY-12) */
  KOS.changes.apply();
  await app.settle();
  assert(!pillShown(), "Refresh hides the pill");
  assert(remounted(n), "and redraws the page");
  const n2 = mark();
  KOS.rerender({ background: "soft", changed: ["sessions", "routines"] });
  await app.settle();
  assert(!remounted(n2) && !pillShown(), "a local change on a task page: no redraw, no pill");
  /* leaving clears it */
  KOS.rerender({ background: "hard", changed: ["srs"], source: "device" });
  assert(pillShown(), "pill again");
  KOS.show("help");
  await app.settle();
  assert(!pillShown() && !KOS.changes.pending(), "navigation clears the pill");
});

step("D · elsewhere: at once when idle; after a dialog; after typing, with the typed text kept", async () => {
  KOS.show("reminders");
  await app.settle();
  await idle();
  let n = mark();
  KOS.rerender({ background: "hard", changed: ["reminders"], source: "device" });
  await app.settle();
  assert(remounted(n), "an idle Reminders page is redrawn at once");
  assert(!pillShown(), "with no pill");

  /* a dialog open: it waits, then lands when the dialog closes */
  await idle();
  n = mark();
  let closed = null;
  KOS.ui.confirm({ title: "Test", body: "…" }, () => { closed = true; }, () => { closed = false; });
  KOS.rerender({ background: "hard", changed: ["reminders"], source: "device" });
  await app.settle();
  assert(!remounted(n), "held while the dialog is open");
  eq(KOS.changes.pending().why, "dialog", "why");
  await idle();
  document.querySelector("[data-ui~='ui.confirm-no']").click();
  await app.settle();
  eq(closed, false, "the dialog cancelled");
  assert(remounted(n), "applied when the dialog closed");

  /* typing: held; on blur it lands and the unsent text is still there */
  await idle();
  const q = main().querySelector(".k-rem-quick input, .k-rem-quick textarea");
  assert(q, "the quick-add field");
  q.focus();
  q.value = "buy milk";
  q.dispatchEvent(new window.Event("input", { bubbles: true }));
  n = mark();
  KOS.rerender({ background: "hard", changed: ["reminders"], source: "device" });
  await app.settle();
  assert(!remounted(n), "held while typing");
  assert(document.activeElement === q && q.value === "buy milk", "the field keeps focus and text");
  await idle();
  q.blur();
  await app.settle();
  assert(remounted(n), "applied when typing ended");
  const q2 = main().querySelector(".k-rem-quick input, .k-rem-quick textarea");
  assert(q2 && q2 !== q, "a fresh field");
  eq(q2.value, "buy milk", "SY-24: the text typed and not yet submitted is still there");
  eq(KOS.store.state.reminders.items.filter((r) => r.title === "buy milk").length, 0, "and was not submitted");
  q2.value = "";

  /* a redraw the page asked for itself (after a submit) never puts text back */
  const q3 = main().querySelector(".k-rem-quick input, .k-rem-quick textarea");
  q3.focus(); q3.value = "typed then submitted";
  q3.dispatchEvent(new window.Event("input", { bubbles: true }));
  KOS.rerender();
  await app.settle();
  eq(main().querySelector(".k-rem-quick input, .k-rem-quick textarea").value, "", "a foreground redraw draws the field as the page says");
});

step("E · a redraw keeps keyboard focus and inner scroll positions (AP-10, AA-15)", async () => {
  KOS.show("notifications");
  await app.settle();
  const t = main().querySelector("[data-ui~='notify.filter'], [data-ui~='notify.device-toggle'], button");
  assert(t, "a control to focus");
  const label = t.getAttribute("aria-label") || t.textContent;
  t.focus();
  assert(document.activeElement === t, "focused");
  KOS.rerender();
  await app.settle();
  const a = document.activeElement;
  assert(a && a !== document.body && main().contains(a), "focus is still in the page, not on <body>");
  assert(a !== t, "on the redrawn control");
  eq(a.getAttribute("aria-label") || a.textContent, label, "the same control");
  /* a background redraw too (while a non-field control is focused it is not 'typing') */
  await idle();
  KOS.rerender({ background: "hard", changed: ["notify"], source: "device" });
  await app.settle();
  assert(main().contains(document.activeElement) && document.activeElement !== main(), "kept across a background redraw");
});

step("F · two tabs: another tab's write redraws only a page that reads it", async () => {
  const ls = sharedStorage(), idb = new fake.IDBFactory(), locks = fakeLocks();
  const A = await boot({ localStorage: ls, indexedDB: idb, locks, seed: 1 });
  const B = await boot({ localStorage: ls, indexedDB: idb, locks, seed: 2 });
  async function sync() { for (let i = 0; i < 12; i++) { await A.settle(); await B.settle(); await A.settle(); if (!ls.deliver()) { await A.settle(); await B.settle(); return; } } }
  await sync();
  A.KOS.show("ref", TOPIC);
  await sync();
  const aMain = () => A.document.getElementById("main");
  const aPill = () => { const p = A.document.querySelector("[data-ui~='shell.refresh']"); return !!p && !p.hidden; };
  let node = aMain().firstElementChild;
  /* B changes Money only */
  B.KOS.store.state.money.currency = "EUR";
  B.KOS.store.save();
  await sync();
  eq(A.KOS.store.state.money.currency, "EUR", "A took the write in");
  assert(aMain().firstElementChild === node, "A's topic page was not remounted for Money");
  assert(!aPill(), "and shows no pill");
  /* B navigates (only its ui moves): nothing */
  B.KOS.show("money");
  await sync();
  assert(aMain().firstElementChild === node && !aPill(), "another tab navigating is not a change");
  /* B changes progress: the topic page reads it */
  const P = B.KOS.store.state.progress;
  P["compsci:4.2.3.1"] = Object.assign({}, P["compsci:4.2.3.1"] || {}, { confidence: 4, touched: 123 });
  B.KOS.store.save();
  await sync();
  assert(aMain().firstElementChild === node, "still not remounted (a task page)");
  assert(aPill(), "the pill is shown");
  assert(/Updated in another tab/.test(A.document.querySelector("[data-ui~='shell.refresh']").textContent), "worded for a tab");
  eq(A.errors.concat(B.errors), [], "no errors in either tab");
});

step("G · the lifecycle: dispose, token, signal, memo, keep", async () => {
  const log = [];
  let tok = null, sig = null, vtok = null;
  KOS.views.__probe = function (m) {
    m.appendChild(document.createElement("p")).textContent = "probe";
    KOS.view.onDispose((o) => log.push(o.leaving ? "leave" : "redraw"));
    tok = KOS.view.token(); vtok = KOS.view.visitToken(); sig = KOS.view.signal();
    const memo = KOS.view.memo("n", () => ({ n: 0 })); memo.n++;
    const kept = KOS.view.keep("k", () => ({ n: 0 })); kept.n++;
    m.setAttribute("data-memo", memo.n + "/" + kept.n);
  };
  KOS.show("__probe");
  const t1 = tok, s1 = sig, v1 = vtok;
  eq(main().getAttribute("data-memo"), "1/1", "first render");
  assert(t1() && v1() && (!s1 || !s1.aborted), "alive");
  KOS.rerender();
  eq(log, ["redraw"], "onDispose ran for the redraw");
  assert(!t1(), "the old render's token is dead");
  assert(v1(), "but the visit goes on");
  assert(!s1 || s1.aborted, "its signal aborted");
  eq(main().getAttribute("data-memo"), "2/2", "memo and keep survive a redraw");
  KOS.show("help");
  eq(log, ["redraw", "leave"], "onDispose ran for the navigation, leaving");
  assert(!v1(), "the visit ended");
  KOS.show("__probe");
  eq(main().getAttribute("data-memo"), "1/3", "memo is per visit; keep is per page load");
  KOS.show("help");
  delete KOS.views.__probe;
});

step("H · AX-38: navigation closes the dialogs over the page it leaves", async () => {
  KOS.show("reminders");
  await app.settle();
  const mk = (opts) => {
    const ov = KOS.ui.el("div", {}, [KOS.ui.el("div", { "data-dialog-box": "" }, [KOS.ui.el("h2", { text: "T" }), KOS.ui.el("button", { type: "button", text: "ok" })])]);
    KOS.ui.openDialog(ov, opts || {});
    return ov;
  };
  let closed = 0;
  const d1 = mk({ onClose: () => { closed++; } });
  KOS.show("reminders");                         /* the same page again */
  assert(document.contains(d1), "the same page shown again keeps its dialog");
  const d2 = mk({ persist: true });
  KOS.show("calendar");
  await app.settle();
  assert(!document.contains(d1), "a real navigation closes the page's dialog");
  eq(closed, 1, "through its own close path, once");
  assert(document.contains(d2), "a persistent dialog stays");
  d2.remove();
  assert(!KOS.ui.topDialog(), "nothing left open");
  assert(!document.documentElement.hasAttribute("data-scroll-lock"), "and the scroll lock is released");
});

step("I · SY-20, AX-22: Edit your seat keeps its draft, holds, and asks before leaving", async () => {
  KOS.show("governor", "edit");
  await app.settle();
  const tabs = () => [...main().querySelectorAll(".k-gv-edit-tabs button, .k-gv-edit-tabs [role=tab]")];
  const sig = tabs().find((b) => /Sigil/.test(b.textContent));
  assert(sig, "the Sigil tab");
  sig.click();
  await app.settle();
  const seals = () => [...main().querySelectorAll(".k-gv-sigil")];
  const other = seals().find((b) => b.getAttribute("aria-checked") === "false");
  assert(other, "another seal to pick");
  const name = other.textContent;
  other.click();
  await app.settle();
  const before = KOS.store.state.governor.seal;
  /* a background change the page reads: held (unsaved work), pill, draft kept */
  await idle();
  let n = mark();
  KOS.rerender({ background: "hard", changed: ["governor"], source: "device" });
  await app.settle();
  assert(!remounted(n), "held while the seat has unsaved changes");
  eq(KOS.changes.pending().why, "work", "why");
  assert(pillShown(), "the pill offers it");
  KOS.changes.apply();
  await app.settle();
  assert(remounted(n), "Refresh redraws");
  const picked = seals().find((b) => b.getAttribute("aria-checked") === "true");
  assert(picked && picked.textContent === name, "the unsaved seal is still picked, on the Sigil tab");
  eq(KOS.store.state.governor.seal, before, "and nothing was saved");
  /* leaving asks */
  const hash = window.location.hash;
  const r = KOS.show("home");
  await app.settle();
  eq(r, false, "KOS.show reports it was held");
  const dlg = document.querySelector("[data-ui~='ui.confirm']");
  assert(dlg && /Leave without saving/.test(dlg.textContent), "the leave prompt");
  eq(window.location.hash, hash, "the address did not move");
  assert(main().querySelector("[data-ui~='gov.seat-save']"), "the page is still Edit your seat");
  document.querySelector("[data-ui~='ui.confirm-no']").click();   /* Stay */
  await app.settle();
  assert(main().querySelector("[data-ui~='gov.seat-save']"), "Stay keeps the page");
  KOS.show("home");
  await app.settle();
  document.querySelector("[data-ui~='ui.confirm-yes']").click();  /* Leave */
  await app.settle();
  assert(!main().querySelector("[data-ui~='gov.seat-save']"), "Leave goes");
  eq(KOS.store.state.governor.seal, before, "without saving");
  /* Save and Discard never ask */
  KOS.show("governor", "edit");
  await app.settle();
  tabs().find((b) => /Sigil/.test(b.textContent)).click();
  await app.settle();
  seals().find((b) => b.getAttribute("aria-checked") === "false").click();
  await app.settle();
  main().querySelector("[data-ui~='gov.seat-save']").click();
  await app.settle();
  assert(!document.querySelector("[data-ui~='ui.confirm']"), "Save does not ask");
  assert(KOS.store.state.governor.seal !== before, "and saved the seal");
});

step("J · SY-02, ST-36: the notes page being read survives a redraw and a return", async () => {
  KOS.show("ref", TOPIC);
  await app.settle();
  const sel = () => main().querySelector("[data-ui~='topic.reader-page-select']");
  assert(sel(), "this topic's notes are paged");
  assert(sel().options.length >= 3, "with at least three pages");
  sel().value = "2";
  sel().dispatchEvent(new window.Event("change", { bubbles: true }));
  await app.settle();
  eq(sel().value, "2", "on page 3");
  KOS.rerender();
  await app.settle();
  eq(sel().value, "2", "still page 3 after a redraw");
  KOS.changes.apply();
  await app.settle();
  eq(sel().value, "2", "and after the pill's Refresh");
  KOS.show("home");
  await app.settle();
  KOS.show("ref", TOPIC);
  await app.settle();
  eq(sel().value, "2", "and coming back to the topic");
  KOS.show("ref", { subject: "maths", ref: "5.7" });
  await app.settle();
  const other = sel();
  assert(!other || other.value === "0", "another topic starts on its own first page");
});

step("K · SY-19: a vault redraws as deep as the reader had scrolled", async () => {
  const rows = [];
  for (let i = 0; i < 170; i++) rows.push({ module: "anime", title: "Depth " + String(i).padStart(3, "0"), status: "inProgress", anilistId: 900000 + i, syncSource: "anilist" });
  await new Promise((r) => KOS.mediadb.bulkUpsert(rows, {}, () => r()));
  const realIO = window.IntersectionObserver;
  delete window.IntersectionObserver;                 /* no observer: the list fills itself, as a reader scrolling to the end would */
  const cards = () => main().querySelectorAll("[data-ui~='vault.grid'] > *").length;
  /* a cursor over 180 rows takes many IndexedDB turns */
  const drawn = async (n) => { for (let i = 0; i < 300 && cards() < n; i++) await app.settle(); for (let i = 0; i < 6; i++) await app.settle(); };
  KOS.show("anime");
  await drawn(170);
  const full = cards();
  assert(full >= 170, "the whole list is drawn: " + full);
  window.IntersectionObserver = realIO;               /* a stub that never fires: only the first batch would be drawn */
  KOS.rerender();
  await drawn(170);
  assert(cards() >= 170, "a redraw draws as deep again: " + cards());
  KOS.show("home");
  await app.settle();
  KOS.show("anime");
  await drawn(1);
  assert(cards() <= 61, "a fresh visit starts with one batch: " + cards());
});

step("L · SH-20, SH-21, SH-02, SH-23, SH-41", async () => {
  /* SH-20: Enter on a focused Cancel cancels */
  let ans = null;
  KOS.ui.confirm({ title: "End session?", body: "…" }, () => { ans = true; }, () => { ans = false; });
  const no = document.querySelector("[data-ui~='ui.confirm-no']");
  no.focus();
  no.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  eq(ans, null, "Enter on Cancel did not confirm");
  no.click();
  eq(ans, false, "and Cancel cancels");
  ans = null;
  KOS.ui.confirm({ title: "End session?", body: "…" }, () => { ans = true; }, () => { ans = false; });
  document.querySelector("[data-ui~='ui.confirm-yes']").dispatchEvent(new window.KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  eq(ans, true, "Enter on the confirm button confirms");

  /* SH-21 */
  KOS.show("money");
  await app.settle();
  const hash = window.location.hash;
  document.querySelector("[data-ui~='shell.skip-link']").click();
  await app.settle();
  eq(window.location.hash, hash, "the skip link routes nowhere");
  assert(document.activeElement === main(), "and focuses #main");
  assert(main().querySelector("[data-ui~='money.page'], .k-money, h1"), "Money is still on screen");
  assert(KOS.currentNav().viewId === "money", "still Money");

  /* SH-02: Backspace is not Back; Alt+← is */
  let backs = 0;
  const realBack = KOS.back;
  KOS.back = function () { backs++; };
  const btn = main().querySelector("button");
  btn.focus();
  btn.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Backspace", bubbles: true, cancelable: true }));
  eq(backs, 0, "Backspace does not go Back");
  btn.dispatchEvent(new window.KeyboardEvent("keydown", { key: "ArrowLeft", altKey: true, bubbles: true, cancelable: true }));
  eq(backs, 1, "Alt+← does");
  btn.dispatchEvent(new window.KeyboardEvent("keydown", { key: "[", metaKey: true, bubbles: true, cancelable: true }));
  eq(backs, 2, "and ⌘[");
  KOS.ui.confirm({ title: "T", danger: true }, () => {}, () => {});
  document.querySelector("[data-ui~='ui.confirm-no']").dispatchEvent(new window.KeyboardEvent("keydown", { key: "ArrowLeft", altKey: true, bubbles: true, cancelable: true }));
  eq(backs, 2, "never while a dialog is open");
  document.querySelector("[data-ui~='ui.confirm-no']").click();
  KOS.back = realBack;

  /* SH-23 */
  KOS.show("calendar");
  const d = KOS.router.depth();
  KOS.show("calendar");
  KOS.show("calendar");
  eq(KOS.router.depth(), d, "the same page again is not a new history entry");
  KOS.show("reminders");
  eq(KOS.router.depth(), d + 1, "another page is");

  /* SH-41 */
  KOS.show("nonsense-view");
  await app.settle();
  eq(KOS.currentNav().viewId, "home", "an unknown view is Home");
  eq(window.location.hash, "#/home", "at Home's address");
});

step("M · UR-3, SY-06: done is never downgraded; finished elsewhere closes the sheet; no auto-open over work", async () => {
  const V = KOS.dayReview;
  const now = window.Date.now();
  eq(V.finish("morning", "done", now), "done", "finished");
  eq(V.finish("morning", "skipped", now), "done", "a later Skip does not downgrade it");
  eq(V.stateOf("morning", now), "done", "still done");
  /* two devices: the merge kept both stamps and the skip's state */
  const day = Object.keys(KOS.store.state.dayReview.days).pop();
  KOS.store.state.dayReview.days[day].midday = { state: "skipped", skippedAt: now, doneAt: now - 5 };
  assert(V.heal(), "heal put it right");
  eq(KOS.store.state.dayReview.days[day].midday.state, "done", "done wins");

  /* an open sheet closes when its review is finished on another device */
  delete KOS.store.state.dayReview.days[day].evening;
  KOS.show("home");
  await app.settle();
  KOS.reviewSheet.open("evening");
  await app.settle();
  assert(KOS.reviewSheet.isOpen(), "the evening review is open");
  KOS.store.state.dayReview.days[day].evening = { state: "done", doneAt: now };
  KOS.rerender({ background: "hard", changed: ["dayReview"], source: "device" });
  await app.settle();
  assert(!KOS.reviewSheet.isOpen(), "it closed");
  assert(!document.querySelector("[data-ui~='review.sheet']"), "and left the screen");

  /* closing a review over a lesson redraws nothing under it */
  delete KOS.store.state.dayReview.days[day].evening;
  KOS.show("ref", TOPIC);
  await app.settle();
  const n = mark();
  KOS.reviewSheet.open("evening");
  await app.settle();
  KOS.reviewSheet.close();
  await app.settle();
  assert(!remounted(n), "the lesson under the sheet was not remounted");
  assert(!pillShown(), "and no pill for a review that changed nothing it reads");
});

step("N · every view's declared reads cover what it reads while it draws", async () => {
  const missing = [];
  for (const [view, arg] of SURF) {
    if (!KOS.views[view]) continue;
    const decl = KOS.changes.reads(view, arg);
    if (decl.indexOf("*") !== -1) continue;
    const got = await SURF.reads(app, view, arg);
    const miss = got.filter((k) => decl.indexOf(k) === -1);
    if (miss.length) missing.push(view + (arg ? ":" + JSON.stringify(arg) : "") + " reads " + miss.join(", "));
  }
  eq(missing, [], "undeclared reads (add them in js/core/redraw.js)");
  /* a view with no declaration reads everything */
  eq(KOS.changes.reads("some-new-view"), ["*"], "the default is everything");
  const noErr = app.errors.filter((e) => !/nonsense/.test(e));
  eq(noErr, [], "no errors");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok   " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + (e && e.message)); }
  }
  console.log(failed ? `\n${failed} of ${steps.length} step(s) failed` : `\nall ${steps.length} steps passed`);
  process.exit(failed ? 1 : 0);
})();
