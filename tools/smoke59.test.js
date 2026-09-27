/* Kurenai OS — smoke59.test.js
   Roadmap 1.3: the inspector's quick note → the topic's Spec tab.

   The claims:

     A · A DRAFT, PER DEVICE. What is typed is held in state.ui.quickNote
         under "sid:ref" (state.ui never syncs), survives a redraw of the
         same topic and a reload, and an emptied draft leaves nothing behind.
     B · FILED ON LEAVE. Navigating anywhere but that topic files the draft
         as ONE dated {md} block with an id at the end of the Spec fork's
         guidance list, and clears it. A reload files it at the first
         navigation. An empty or whitespace draft writes nothing — not even
         a fork.
     C · APPEND-ONLY. Filing never edits, reorders or removes an existing
         block; shipped rows keep their deterministic ids; a topic the
         specification does not have is refused.
     D · BOUNDARIES. No Governor traffic, and two devices each filing a note
         to the same topic both keep theirs through the merge.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke59.test.js                                            */
"use strict";
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": " + JSON.stringify(a) + " vs " + JSON.stringify(b)); }

let app, KOS;
const A = { subject: "compsci", ref: "4.1.1.1" }, B = { subject: "maths", ref: "1.1" };
const E = () => KOS.edits;
function fresh() {
  KOS.store.state.edits = { v: 1, topics: {} };
  KOS.store.state.ui.quickNote = {};
}
function info(t) { const f = E().get(t.subject, t.ref); return f && f.spec ? f.spec.info : null; }

/* ============ A · a draft, per device ============ */
step("A · the draft is held per device under the topic's key", () => {
  fresh();
  E().setDraft(A.subject, A.ref, "remember two's complement overflow");
  eq(KOS.store.state.ui.quickNote, { "compsci:4.1.1.1": "remember two's complement overflow" }, "stored in state.ui");
  eq(E().draft(A.subject, A.ref), "remember two's complement overflow", "read back");
  eq(E().draft(B.subject, B.ref), "", "another topic has none");
  E().setDraft(A.subject, A.ref, "   ");
  eq(KOS.store.state.ui.quickNote, {}, "an emptied draft leaves nothing");
  eq(E().get(A.subject, A.ref), null, "typing never forks the material");
});

step("A · a redraw of the same topic keeps the draft", () => {
  fresh();
  KOS.show("ref", A);
  E().setDraft(A.subject, A.ref, "keep me");
  KOS.show("ref", A, { _nav: true });
  eq(E().draft(A.subject, A.ref), "keep me", "still a draft");
  eq(E().get(A.subject, A.ref), null, "nothing filed");
});

/* ============ B · filed on leave ============ */
step("B · leaving the topic files ONE dated block and clears the draft", () => {
  fresh();
  KOS.show("ref", A);
  E().setDraft(A.subject, A.ref, "sign bit is the MSB");
  KOS.show("ref", B);
  const rows = info(A);
  assert(rows, "the Spec is forked");
  const last = rows[rows.length - 1];
  eq([last.src, last.date], ["quick-note", KOS.srs.todayISO()], "a quick-note block, dated today");
  assert(/^\*\*Note · \d{1,2} [A-Z][a-z]{2} \d{4}\*\*\n\nsign bit is the MSB$/.test(last.md), "a dated {md} block: " + JSON.stringify(last.md));
  assert(typeof last.id === "string" && last.id.length > 3, "the block has an id");
  eq(rows.filter(r => r.src === "quick-note").length, 1, "one block");
  eq(E().draft(A.subject, A.ref), "", "the draft is cleared");
  eq(E().get(B.subject, B.ref), null, "the topic now open is untouched");
});

step("B · a draft on the open topic files when anything else opens", () => {
  fresh();
  KOS.show("ref", B);
  E().setDraft(B.subject, B.ref, "proof by contradiction: assume the negation");
  KOS.show("home");
  assert(info(B) && /assume the negation/.test(info(B).slice(-1)[0].md), "filed on the way home");
});

step("B · an empty draft writes nothing, not even a fork", () => {
  fresh();
  KOS.show("ref", A);
  KOS.store.state.ui.quickNote["compsci:4.1.1.1"] = "  \n  ";
  KOS.show("home");
  eq(E().get(A.subject, A.ref), null, "no fork");
  eq(KOS.store.state.ui.quickNote, {}, "the empty draft is gone");
  eq(E().fileDraft(A.subject, A.ref), null, "filing nothing returns null");
});

step("B · a reload keeps the draft, and the first navigation files it", async () => {
  const b = await boot({ storage: { "kurenai-os-v1": JSON.stringify({
    progress: {}, ui: { view: "home", quickNote: { "compsci:4.1.1.1": "written before the tab closed" } } }) } });
  await b.settle();
  const f = b.KOS.edits.get("compsci", "4.1.1.1");
  assert(f && f.spec && /written before the tab closed/.test(f.spec.info.slice(-1)[0].md), "filed at boot's first show");
  eq(b.KOS.store.state.ui.quickNote, {}, "cleared");
});

/* ============ C · append-only ============ */
step("C · filing appends; it never edits, reorders or removes a block", () => {
  fresh();
  const first = E().appendSpec(A.subject, A.ref, "one");
  const before = JSON.parse(JSON.stringify(E().get(A.subject, A.ref).spec));
  assert(before.content.every((b, i) => b.id === "s" + i), "shipped rows keep deterministic ids");
  const second = E().appendSpec(A.subject, A.ref, "two");
  const after = E().get(A.subject, A.ref).spec;
  eq(after.content, before.content, "the content list is untouched");
  eq(after.info.slice(0, before.info.length), before.info, "every earlier block is exactly as it was");
  eq(after.info.slice(-2).map(b => b.id), [first.id, second.id], "the new block is last");
  assert(first.id !== second.id, "fresh ids");
  eq(E().appendSpec(A.subject, A.ref, "  "), null, "empty text");
  eq(E().appendSpec("compsci", "4.1", "a unit"), null, "not a leaf");
  eq(E().appendSpec("compsci", "9.9.9", "nothing"), null, "not in the specification");
  eq(E().appendSpec(A.subject, A.ref, "dated", { date: "2026-01-05" }).md.slice(0, 20), "**Note · 5 Jan 2026*", "an explicit date");
});

/* ============ D · boundaries ============ */
step("D · no Governor traffic", () => {
  fresh();
  const g = JSON.stringify(KOS.store.state.governor), n = KOS.store.state.sessions.length;
  KOS.show("ref", A);
  E().setDraft(A.subject, A.ref, "no reward for this");
  KOS.show("home");
  eq([JSON.stringify(KOS.store.state.governor), KOS.store.state.sessions.length], [g, n], "nothing paid, nothing logged");
});

step("D · two devices filing to the same topic both keep their note", () => {
  fresh();
  E().appendSpec(A.subject, A.ref, "the shared first note");
  const base = { edits: JSON.parse(JSON.stringify(KOS.store.state.edits)) };
  const local = JSON.parse(JSON.stringify(base)), remote = JSON.parse(JSON.stringify(base));
  const k = "compsci:4.1.1.1";
  local.edits.topics[k].spec.info.push({ id: "eLOCAL", md: "**Note · 1 Oct 2026**\n\nlaptop", date: "2026-10-01", src: "quick-note" });
  local.edits.topics[k].updatedAt = 5;
  remote.edits.topics[k].spec.info.push({ id: "eREMOTE", md: "**Note · 1 Oct 2026**\n\nphone", date: "2026-10-01", src: "quick-note" });
  remote.edits.topics[k].updatedAt = 6;
  const out = KOS.cloudmerge.merge(base, local, remote).doc.edits.topics[k].spec.info;
  assert(out.some(b => b.id === "eLOCAL") && out.some(b => b.id === "eREMOTE"), "both notes survive");
  eq(out.filter(b => /shared first note/.test(b.md)).length, 1, "the shared note is not doubled");
});

(async () => {
  app = await boot();
  KOS = app.KOS;
  let fails = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { fails++; console.log("FAIL  " + name + "\n      " + (e && e.stack ? e.stack.split("\n").slice(0, 2).join(" | ") : e)); }
  }
  const errs = app.errors.filter(e => !/env\.local\.js/.test(e));
  if (errs.length) { fails++; console.log("FAIL  runtime errors: " + errs.join(" / ")); }
  console.log(fails ? "\nSMOKE59: " + fails + " failure(s)" : "\nSMOKE59: all " + steps.length + " steps passed");
  process.exit(fails ? 1 : 0);
})();
