/* Kurenai OS — smoke154.test.js
   Roadmap 5.19 item 2 (design 44f): IT units archived, and a current unit.

     A · archived: the units done at school (F200, F202, F204) and any unit
         with a result are archived by default; a unit's own flag wins;
         refs map to their unit; reads write nothing.
     B · current: F201 by default, a chosen unit while it is live, never an
         archived one.
     C · the spine leaves the archived units out and offers "Show completed
         units"; the switch brings them back (per device); the open topic's
         own unit always shows.
     D · the review analytics leave them out; the desk leads with the
         current unit (Continue, Next, Change) and orders it first.
     E · the topic picker hides them unless shown or already picked.

   Run: node tools/smoke154.test.js */
"use strict";
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }
let app, K, doc;
const $ = (s, r) => (r || doc).querySelector(s);
const $$ = (s, r) => [...(r || doc).querySelectorAll(s)];

step("boot", async () => {
  app = await boot({ clock: "2026-11-16T10:00:00" });
  K = app.KOS; doc = app.document;
});

step("A · archived", () => {
  const IU = K.itUnits;
  const before = JSON.stringify(K.store.state.itUnits);
  eq(["F200", "F201", "F202", "F204", "F206"].map(IU.archived), [true, false, true, true, false], "the default");
  eq(IU.unitOf("F201.3.2"), "F201", "a ref's unit");
  assert(!IU.visible("F200.1") && IU.visible("F201.1") && IU.inReview("F201.1") && !IU.inReview("F204"), "visible and in review");
  eq(JSON.stringify(K.store.state.itUnits), before, "reads write nothing");
  IU.setArchived("F204", false);
  assert(!IU.archived("F204"), "a unit's own flag wins");
  IU.setArchived("F204", null);
  assert(IU.archived("F204"), "and back to the default");
});

step("B · current", () => {
  const IU = K.itUnits;
  eq(IU.current(), "F201", "F201 by default");
  IU.setCurrent("F206");
  eq(IU.current(), "F206", "the chosen unit");
  IU.setCurrent("F200");
  eq(IU.current(), "F201", "never an archived one");
  IU.setCurrent(null);
});

step("C · the spine and its switch", async () => {
  K.store.state.ui.itShowDone = false;
  K.show("ref", { subject: "it", ref: K.spec.leaves("it", "F201")[0].ref }, { _nav: true }); await app.settle();
  const heads = () => $$("[data-ui~='study.spine-list'] [data-ui~='ui.section-head']").map((h) => h.textContent);
  assert(!heads().some((t) => /F200|F202|F204/.test(t)) && heads().some((t) => /F201/.test(t)), "archived units leave the spine: " + heads().join(" | "));
  const sw = $("[data-ui~='study.it-show-done']");
  assert(sw && !sw.checked, "the switch is offered");
  sw.checked = true; sw.dispatchEvent(new app.window.Event("change")); await app.settle();
  assert(heads().some((t) => /F200/.test(t)), "the switch brings them back");
  K.store.state.ui.itShowDone = false;
  K.show("ref", { subject: "it", ref: K.spec.leaves("it", "F200")[0].ref }, { _nav: true }); await app.settle();
  assert(heads().some((t) => /F200/.test(t)), "an open topic's own unit always shows");
});

step("D · the desk and its analytics", async () => {
  K.show("subject", "it", { _nav: true }); await app.settle();
  const cur = $("#main [data-ui~='it.current']");
  assert(cur && /F201/.test(cur.textContent) && $("[data-ui~='it.current-continue']", cur), "the current unit leads, with Continue");
  assert(/F206/.test(cur.textContent), "and names the next unit");
  const units = $$("#main [data-ui~='study.unit'] .k-unit-ref").map((n) => n.textContent);
  eq(units[0], "F201", "the current unit first");
  assert(!units.some((u) => /F200|F202|F204/.test(u)), "no archived unit among the desk's units: " + units.join(","));
  /* an exam logged on an archived unit is not counted in the review strip */
  const n0 = K.sessions.all().length;
  K.sessions.log({ type: "exam", subject: "it", ref: K.spec.leaves("it", "F200")[0].ref, dur: 60, metrics: {} });
  assert(K.sessions.all().length === n0 + 1, "logged");
  K.show("home", null, { _nav: true }); await app.settle();
  K.show("subject", "it", { _nav: true }); await app.settle();
  const ex = $$("#main [data-ui~='study.analytics'] .k-stat").find((t) => /Exam Qs/.test(t.textContent));
  assert(!ex || !/\b1\b/.test(ex.textContent.replace(/Exam Qs/, "")), "an archived unit's exam is not in review analytics");
});

step("E · the picker", async () => {
  const host = doc.createElement("div"); doc.body.appendChild(host);
  const tp = K.topicPicker({ label: "Topics", multi: true, subject: "it", value: [] });
  host.appendChild(tp.el);
  const open = host.querySelector("[aria-expanded]");
  open && open.click(); await app.settle();
  const text = () => (host.querySelector("[data-ui~='tp.list']") || { textContent: "" }).textContent;
  assert(!/F200/.test(text()) && /F201/.test(text()), "archived units are not offered: " + text().slice(0, 120));
  const sd = host.querySelector("[data-ui~='tp.show-done']");
  assert(sd, "the picker offers the switch");
  sd.checked = true; sd.dispatchEvent(new app.window.Event("change")); await app.settle();
  assert(/F200/.test(text()), "and shows them on request");
  K.store.state.ui.itShowDone = false;
  host.remove();
  eq(app.errors, [], "no page errors");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok   " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + (e && e.stack ? e.stack.split("\n").slice(0, 3).join("\n       ") : e)); }
  }
  console.log(failed ? `\nSMOKE154 FAIL — ${failed} of ${steps.length} step(s)` : `\nSMOKE154 OK — ${steps.length} steps`);
  process.exit(failed ? 1 : 0);
})();
