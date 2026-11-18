/* Kurenai OS — smoke180.test.js
   Recorded attempts and feedback from a model you choose (the Exams &
   Papers rework, docs/exams-rework-plan.md §8; invariant 130a).

     A · figures: a recorded attempt's events give, the same way every time,
         each part's time, time to the first mark, writing time, idle gaps,
         erasures, returns, minutes a mark against the budget, skipped and
         flagged parts, pauses and the pacing line; marks add what was lost.
     B · the recorder: begin, open, keys, flag, pause, resume and end, saved
         as it goes and read back; the record's gate drops bad events; it
         rides the full backup and the store registry.
     C · ink: a stroke on an answer pad carries its start time (`t0`) and
         reaches the recorder through `kos-ink-act` once its doc is bound,
         with erasures and undos; an unbound doc records nothing.
     D · the timed paper records: Start begins it, a question change opens a
         part, a flag, a pause and the end are logged, and the tally's Log
         puts each question's marks on it (EX-32: a logged pause keeps the
         clock in view).
     E · the review pack: ONE text in strict XML-tagged sections, every
         part with its id, marks, scheme, marking and timing, the answer
         format; the pages planned on A4, a long answer cut across pages.
     F · the reply read back: a fenced JSON block among prose, ```JSON,
         no fence, smart quotes, trailing commas and // comments, part ids
         written loosely; refused: another attempt, an unknown part, a
         re-mark out of range, another version, no JSON at all.
     H · replication to kos_attempts: up, down, newer wins, deletions both
         ways, nothing echoed (decision D1).
     G · no errors, no request.

   Run: node tools/smoke180.test.js */
"use strict";
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }

let app, K, A, RP;
async function wait(promise) {
  let done = false, val, err;
  promise.then((v) => { done = true; val = v; }, (e) => { done = true; err = e; });
  for (let i = 0; i < 4000 && !done; i++) await app.settle();
  if (!done) throw new Error("a promise never settled");
  if (err) throw err;
  return val;
}
const cb = (fn) => wait(new Promise((res, rej) => fn((e, v) => e ? rej(e) : res(v))));
const S = 1000, M = 60000;

/* a hand-built record: Q1 (2 marks) and Q2 (6 marks), budget 1.5 min a mark */
function sample() {
  return {
    uid: "abcdef0123456789", kind: "paper", title: "Test paper", board: "OCR", started: 1e12, allowedMs: 12 * M, budget: 1.5,
    parts: [{ id: "1(a)", label: "1(a)", marks: 2, topic: "it:F201.1.1", command: "State" },
      { id: "2", label: "2", marks: 6, topic: "it:F201.2.6", command: "Discuss" },
      { id: "3", label: "3", marks: 1, topic: "it:F201.1.1", command: "State" }],
    ev: [
      [0, "o", "1(a)"], [10 * S, "s", "1(a)", 4 * S], [20 * S, "s", "1(a)", 3 * S],      // 1(a): first mark at 10 s
      [60 * S, "o", "2"], [150 * S, "s", "2", 30 * S], [200 * S, "e", "2"], [210 * S, "u", "2"],
      [300 * S, "p", ""], [360 * S, "r", ""],                                           // a one-minute pause on Q2
      [400 * S, "s", "2", 60 * S], [500 * S, "f", "2", 1],
      [600 * S, "o", "1(a)"], [610 * S, "k", "1(a)", 5],                                // a return to 1(a)
      [640 * S, "z", ""],
      [5, "?", "x"], ["bad", "s", "2"]                                                  // dropped by the gate
    ]
  };
}

step("boot", async () => {
  app = await boot();
  K = app.KOS; A = K.attempts; RP = K.reviewPack;
  await app.settle();
  assert(A && RP, "KOS.attempts and KOS.reviewPack");
});

step("A · figures from the events, the same every time", async () => {
  const r = A.normalise(sample());
  eq(r.ev.length, 14, "the gate drops a bad code and a bad time");
  const f = A.figures(r), g = A.figures(r);
  eq(f, g, "the same twice");
  const p1 = f.parts[0], p2 = f.parts[1], p3 = f.parts[2];
  eq([p1.timeMs, p1.firstMarkMs, p1.writeMs, p1.strokes, p1.keys, p1.opens, p1.returns], [60 * S + 40 * S, 10 * S, 7 * S, 2, 5, 2, 1], "Q1(a): time over two visits, first mark, writing");
  /* Q2: open at 60, pause at 300 (240 s), resume at 360, leave at 600 (240 s) → 480 s */
  eq([p2.timeMs, p2.firstMarkMs, p2.writeMs, p2.erasures, p2.undos, p2.flagged], [480 * S, 90 * S, 90 * S, 1, 1, true], "Q2's time leaves out the pause");
  assert(p2.idleGaps >= 2, "Q2 has idle gaps over 20 s (" + p2.idleGaps + ")");
  eq([p3.skipped, p3.timeMs], [true, 0], "Q3 never opened: skipped");
  eq(p2.minPerMark, 1.33, "minutes a mark");
  eq([f.pauses, f.pausedMs, f.activeMs], [1, 60 * S, 580 * S], "paper: one pause of a minute, active time");
  eq(f.timeLeftMs, 12 * M - 580 * S, "time left of the allowed");
  eq(f.skipped, ["3"], "skipped parts");
  eq(f.flagged, ["2"], "flagged parts");
  eq(f.order, ["1(a)", "2"], "the order answered");
  eq(f.pace.map((q) => q[1]), [2, 8], "pacing: marks covered at the end of each first visit");
  assert(f.got == null, "no marks yet");
  /* with marks */
  r.marks = { "1(a)": 2, "2": 1 }; r.by = "self";
  const m = A.figures(r);
  eq([m.got, m.parts[1].lost, m.parts[0].lost], [3, 5, 0], "marks: got and lost");
  eq(m.byTopic["it:F201.2.6"], { marks: 6, got: 1, timeMs: 480 * S, parts: 1 }, "by topic");
  eq(m.byCommand.State.marks, 3, "by command word");
  /* Q2 took 480 s against a 6×1.5 = 9 min budget: not over; make it slow */
  r.budget = 0.5;
  const slow = A.figures(r);
  assert(slow.parts[1].overBudget && slow.slowLowYield.indexOf("2") >= 0, "slow for few marks is named");
});

step("B · the recorder saves as it goes and reads back; backup and registry", async () => {
  const t = Date.now();
  const uid = A.begin({ kind: "paper", aid: "x1", title: "Rec", started: t, budget: 1.5, allowedMs: 90 * M,
    parts: [{ id: "1", marks: 4 }, { id: "2", marks: 6 }] });
  assert(/^[0-9a-f]{16}$/.test(uid) && A.isLive(uid), "begun");
  A.open(uid, "1", t + 1 * S); A.keys(uid, "1", 3, t + 5 * S); A.flag(uid, "1", true, t + 6 * S);
  A.open(uid, "2", t + 30 * S); A.pause(uid, t + 40 * S); A.resumeClock(uid, t + 50 * S);
  assert(!A.log(uid, "nope", "1"), "an unknown code is refused");
  A.end(uid, t + 90 * S);
  assert(!A.isLive(uid) && !A.log(uid, "k", "1", 1), "nothing after the end");
  for (let i = 0; i < 50; i++) await app.settle();
  const r = await cb((c) => A.get(uid, c));
  eq(r.ev.map((x) => x[1]).join(""), "okfoprz", "every event in order");
  eq(r.ended, t + 90 * S, "ended");
  const f = A.figures(r);
  eq([f.parts[0].timeMs, f.parts[1].timeMs, f.pausedMs], [29 * S, 50 * S, 10 * S], "times from the saved events");
  await cb((c) => A.setMarks(uid, { "1": 3, "2": 2 }, "teacher", "trk1", c));
  const r2 = await cb((c) => A.get(uid, c));
  eq([r2.marks, r2.by, r2.tracker], [{ "1": 3, "2": 2 }, "teacher", "trk1"], "marks on the record");
  const rows = await cb((c) => A.list({ aid: "x1" }, c));
  eq(rows.length, 1, "listed by assessment");
  /* the store registry and the full backup */
  const reg = K.stores.list().filter((x) => x.id === "attempts")[0];
  assert(reg && reg.db === "kurenai-os-attempts" && reg.backup === "attempts", "in the store registry");
  const snap = await cb((c) => K.store.snapshotFull(c));
  assert(Array.isArray(snap.attempts) && snap.attempts.some((x) => x.uid === uid), "in the full backup");
  await cb((c) => A.remove(uid, c));
  eq((await cb((c) => A.list({}, c))).length, 0, "removed");
  await cb((c) => A.importAll(snap.attempts, c));
  eq((await cb((c) => A.get(uid, c))).marks, { "1": 3, "2": 2 }, "restored from the backup's rows");
});

step("C · a stroke carries its start time and reaches a bound recorder", async () => {
  const host = app.document.createElement("div");
  app.document.body.appendChild(host);
  const pad = K.inkPad.mount(host, { q: "3", marks: 4, kind: "page" });
  await app.settle();
  const sf = pad.desk.surfaces[0];
  assert(sf && sf._stroke, "the pad's surface");
  const uid = A.begin({ kind: "question", started: Date.now(), parts: [{ id: "3", marks: 4 }] });
  A.open(uid, "3");
  const it0 = sf._stroke([{ x: 100, y: 100, pr: 0, dt: 0 }, { x: 160, y: 120, pr: 0, dt: 16 }]);
  assert(typeof it0.t0 === "number", "the stroke item has t0");
  eq((await cb((c) => A.get(uid, c))).ev.filter((x) => x[1] === "s").length, 0, "an unbound doc records nothing");
  A.bindDoc(uid, pad.key, "3");
  const it = sf._stroke([{ x: 100, y: 200, pr: 0, dt: 0 }, { x: 160, y: 220, pr: 0, dt: 16 }]);
  assert(typeof it.t0 === "number" && sf.undo(), "a second stroke, then undo");
  app.window.dispatchEvent(new app.window.CustomEvent("kos-ink-act", { detail: { doc: pad.key, kind: "erase", at: Date.now() } }));
  A.end(uid);
  const r = await cb((c) => A.get(uid, c));
  eq(r.ev.map((x) => x[1]).join(""), "osuez", "open, stroke, undo, erase, end");
  host.remove();
});

step("D · the timed paper records, and the tally puts marks on it", async () => {
  const a = K.exams.add({ preset: "aqa-7517-2", tier: "mock", title: "Recorded mock", date: "2026-12-15", time: "09:00" }, { quiet: true });
  K.show("exams", { id: a.id, tab: "paper", sub: "1" }); await app.settle();
  app.document.querySelector("[data-ui~='exams.timed-start']").click(); await app.settle();
  const s = K.store.state.ui.examPaperSess;
  assert(s && /^[0-9a-f]{16}$/.test(s.rec), "the session names its recording");
  app.document.querySelector("[data-ui~='exams.tnext']").click(); await app.settle();
  app.document.querySelector("[data-ui~='exams.tflag']").click(); await app.settle();
  K.exams.setPrefs ? K.exams.setPrefs({ restBreaks: false }) : null;
  app.document.querySelector("[data-ui~='exams.tpause']").click(); await app.settle();
  const clock = app.document.querySelector("[data-ui~='exams.tclock']").textContent;
  if (!K.exams.prefs().restBreaks) assert(/\d/.test(clock) && /paused/.test(clock), "EX-32: a logged pause keeps the clock (" + clock + ")");
  app.document.querySelector("[data-ui~='exams.tpause']").click(); await app.settle();
  app.document.querySelector("[data-ui~='exams.tend']").click(); await app.settle();
  app.document.querySelector("[data-ui~='ui.confirm-yes']").click(); await app.settle();
  const chip = app.document.querySelector("[data-ui~='exams.mchip']:not([disabled])");
  chip.click(); await app.settle();
  app.document.querySelector("[data-ui~='exams.tally-log']").click();
  for (let i = 0; i < 60; i++) await app.settle();
  const r = await cb((c) => A.get(s.rec, c));
  eq(r.ev.map((x) => x[1]).join(""), "oofprz", "start opens Q1, next opens Q2, flag, pause, resume, end");
  assert(r.ended && r.by === "self" && Object.keys(r.marks).length === 1 && r.tracker, "the tally's marks and the tracker attempt");
  eq(r.parts.length, K.examPaper.build(a, 1).questions.length, "a part a question");
  K.exams.remove(a.id);
});

step("E · the review pack: one XML-tagged text, the pages planned on A4", async () => {
  const r = A.normalise(sample());
  r.marks = { "1(a)": 1, "2": 4 }; r.by = "self";
  const f = A.figures(r);
  const txt = RP.build({ rec: r, figures: f, context: "A retailer <with> stores & a loyalty scheme.",
    parts: [{ id: "1(a)", question: "State one characteristic.", scheme: ["Veracity (1)", "Volume (1)"], points: [{ code: "1", text: "Veracity", ticked: true }] },
      { id: "2", question: "Discuss…", scheme: "Indicative content", levels: ["L3 7–9", "L2 4–6", "L1 1–3"], typed: "My answer" }] });
  ["<instructions>", "</instructions>", '<attempt uid="abcdef0123456789"', "<paper>", "</paper>", '<part id="1(a)" marks="2"', '<part id="2" marks="6"',
    "<scheme>Veracity (1)\nVolume (1)</scheme>", "<levels>", "<typed_answer>My answer</typed_answer>", '<point code="1" ticked="yes">Veracity</point>',
    "<timing ", "<error_types>", "<answer_format>", "```json", '"kos": "exam-feedback/1"'].forEach((s) => assert(txt.indexOf(s) >= 0, "the pack holds " + s));
  assert(txt.indexOf("A retailer &lt;with&gt; stores &amp; a loyalty scheme.") >= 0, "text is escaped inside the tags");
  eq(txt.split('<part id="').length - 1, 3, "every part");
  /* A4: three answers, one taller than a page */
  const pl = RP.plan([{ part: "1", label: "Q1", h: 400 }, { part: "2", label: "Q2", h: 2000 }, { part: "3", label: "Q3", h: 300 }]);
  assert(pl.length >= 2 && pl.length <= 4, "2–4 pages (" + pl.length + ")");
  const q2 = [].concat(...pl).filter((x) => x.part === "2");
  eq(q2.reduce((s, x) => s + x.h, 0), 2000, "a long answer is cut across pages, nothing lost");
  assert(q2[0].from === 0 && q2[1].from > 0 && /cont\./.test(q2[1].label), "its slices continue");
  pl.forEach((pg) => pg.forEach((x) => assert(x.y + 46 + x.h <= 1414, "every slice fits its page")));
});

step("F · the reply read back, noise forgiven, the wrong things refused", async () => {
  const rec = A.normalise(sample());
  const good = {
    kos: "exam-feedback/1", attempt: rec.uid, model: "Claude Opus", summary: "Good start.",
    remark: [{ part: "2", was: 4, should: 3, why: "No conclusion." }],
    findings: [{ parts: ["Q1 (a)", "2"], error_type: "command word", what: "Explained when asked to state", evidence: "…", lost: 1 }],
    actions: [{ text: "End every 9-marker with a judgement", kind: "technique" }]
  };
  const wrap = (body) => "<review>Here is my review.</review>\n\nSome more prose.\n" + body + "\nThanks!";
  let r = RP.parse(wrap("```json\n" + JSON.stringify(good, null, 2) + "\n```"), rec);
  assert(r.ok, "a fenced block among prose: " + r.errors.join("; "));
  eq(r.data.findings[0].parts, ["1(a)", "2"], "part ids written loosely are mapped");
  eq(r.data.findings[0].error_type, "command_word", "an error type with a space");
  eq(r.data.remark, [{ part: "2", was: 4, should: 3, why: "No conclusion." }], "the re-mark");
  r = RP.parse(wrap("```JSON\n" + JSON.stringify(good) + "\n```"), rec); assert(r.ok, "```JSON");
  r = RP.parse(wrap(JSON.stringify(good)), rec); assert(r.ok && r.warnings.length, "no fence: found by its kos field, with a warning");
  const messy = JSON.stringify(good, null, 2).replace(/"/g, (m, i) => i % 2 ? "“" : "”").replace(/\n\}/, ",\n}").replace('"summary"', "// a comment\n  “summary”");
  r = RP.parse(wrap("```json\n" + messy + "\n```"), rec);
  assert(r.ok && r.warnings.some((w) => /tidying/.test(w)), "smart quotes, a trailing comma, a comment: " + r.errors.join("; "));
  r = RP.parse(wrap("```json\n" + JSON.stringify(Object.assign({}, good, { attempt: "ffffffffffffffff" })) + "\n```"), rec);
  assert(!r.ok && /not this one/.test(r.errors.join(" ")) && r.data === null, "another attempt is refused, nothing to store");
  r = RP.parse(wrap("```json\n" + JSON.stringify(Object.assign({}, good, { findings: [{ parts: ["7(z)"], error_type: "method", what: "x" }] })) + "\n```"), rec);
  assert(!r.ok && /7\(z\)/.test(r.errors.join(" ")), "an unknown part is refused");
  r = RP.parse(wrap("```json\n" + JSON.stringify(Object.assign({}, good, { remark: [{ part: "1(a)", was: 1, should: 5 }] })) + "\n```"), rec);
  assert(!r.ok && /outside 0–2/.test(r.errors.join(" ")), "a re-mark out of range is refused");
  r = RP.parse(wrap("```json\n" + JSON.stringify(Object.assign({}, good, { kos: "other/2" })) + "\n```"), rec);
  assert(!r.ok, "another version is refused");
  r = RP.parse("Sorry, I can't help with that.", rec);
  assert(!r.ok && /No JSON block/.test(r.errors[0]), "no JSON at all");
  const many = Object.assign({}, good, { actions: Array.from({ length: 9 }, (_, i) => ({ text: "a" + i, kind: "zzz" })), summary: "s".repeat(5000) });
  r = RP.parse("```json\n" + JSON.stringify(many) + "\n```", rec);
  assert(r.ok && r.data.actions.length === 6 && r.data.actions[0].kind === "practice" && r.data.summary.length <= 1200, "actions capped at six, kinds and text capped");
  /* stored as feedback on the attempt */
  const uid = A.begin({ kind: "paper", started: Date.now(), parts: rec.parts });
  A.end(uid);
  const parsed = RP.parse("```json\n" + JSON.stringify(Object.assign({}, good, { attempt: uid })) + "\n```", Object.assign({}, rec, { uid: uid }));
  assert(parsed.ok, "parsed for the new attempt: " + parsed.errors.join("; "));
  const id = await wait(new Promise((res, rej) => A.addFeedback(uid, parsed.data, (e, fid) => e ? rej(e) : res(fid))));
  const back = await cb((c) => A.get(uid, c));
  assert(back.feedback[id] && back.feedback[id].findings.length === 1, "feedback kept on the attempt");
  await cb((c) => A.remove(uid, c));
});

step("H · recorded attempts replicate (D1): up, down, newer wins, deletions both ways", async () => {
  const rows = new Map(); let n = 0;
  const ts = () => "2026-11-18T10:00:" + String(n++).padStart(2, "0");
  A._setCloudApi({
    since(stamp, offset, done) {
      const list = [...rows.values()].filter((r) => !stamp || r.updated_at > stamp).sort((x, y) => (x.updated_at < y.updated_at ? -1 : 1));
      done(null, list.slice(offset, offset + 200));
    },
    upsert(batch, done) { batch.forEach((r) => rows.set(r.uid, Object.assign({}, r, { updated_at: ts() }))); done(null, []); }
  });
  const sync = () => cb((c) => A.syncCloud(c));
  (await cb((c) => A.list({}, c))).forEach(() => {});
  await Promise.all((await cb((c) => A.list({}, c))).map((r) => cb((c) => A.remove(r.uid, c))));
  await cb((c) => K.mediadb.setKV("attempts.del", [], () => c(null)));
  K.cloud.signedIn = () => false;
  eq((await sync()).skipped, true, "signed out, nothing is sent");
  const t = Date.now();
  const mine = A.begin({ kind: "paper", title: "Mine", started: t, parts: [{ id: "1", marks: 4 }] });
  A.open(mine, "1", t + 1000); A.keys(mine, "1", 2, t + 2000); A.end(mine, t + 9000);
  for (let i = 0; i < 40; i++) await app.settle();
  K.cloud.signedIn = () => true; K.cloud.userId = () => "u1";
  const up = await sync();
  assert(up.pushed >= 1 && rows.has(mine), "this device's attempt goes up: " + JSON.stringify(up));
  eq(rows.get(mine).data_json.ev.map((x) => x[1]).join(""), "okz", "its events, nothing else");
  eq((await sync()).pushed, 0, "an unchanged attempt is not sent again");
  /* another device's attempt arrives */
  const other = "0123456789abcdef";
  rows.set(other, { uid: other, data_json: { uid: other, kind: "paper", title: "From the iPad", started: t - 5000, parts: [{ id: "1", marks: 2 }], ev: [[0, "o", "1"]], marks: { "1": 2 }, by: "self", updatedAt: t + 100 }, updated_at: ts() });
  const down = await sync();
  eq([down.pulled, down.pushed], [1, 0], "another device's attempt arrives and is not echoed");
  eq((await cb((c) => A.get(other, c))).title, "From the iPad", "stored here");
  /* a newer copy elsewhere (feedback added there) replaces ours; an older one does not */
  rows.set(other, { uid: other, data_json: Object.assign({}, rows.get(other).data_json, { feedback: { f1: { id: "f1", summary: "Good" } }, updatedAt: t + 500 }), updated_at: ts() });
  await sync();
  assert((await cb((c) => A.get(other, c))).feedback.f1, "the newer copy wins");
  rows.set(other, { uid: other, data_json: Object.assign({}, rows.get(other).data_json, { feedback: {}, updatedAt: t + 200 }), updated_at: ts() });
  await sync();
  assert((await cb((c) => A.get(other, c))).feedback.f1, "an older copy never replaces a newer one");
  /* marks set here go up */
  await cb((c) => A.setMarks(mine, { "1": 3 }, "self", null, c));
  await sync();
  eq(rows.get(mine).data_json.marks, { "1": 3 }, "marks set here travel");
  /* a deletion here travels as a tombstone; one there is applied and not sent back */
  await cb((c) => A.remove(mine, c));
  await sync();
  assert(rows.get(mine).data_json.deleted, "a deletion here is a tombstone there");
  rows.set(other, { uid: other, data_json: { uid: other, deleted: true, updatedAt: t + 900 }, updated_at: ts() });
  const del = await sync();
  eq(del.deleted, 1, "a deletion there is applied here");
  eq(await cb((c) => A.get(other, c)), null, "gone");
  eq((await sync()).pushed, 0, "and nothing is sent back");
  K.cloud.signedIn = () => false;
  A._setCloudApi(null);
});

step("G · no errors, no request", async () => {
  eq(app.errors, [], "no error");
  assert(!app.fetches.length, "no request: " + app.fetches.slice(0, 3).join(", "));
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + String(e && e.stack || e).split("\n").slice(0, 4).join("\n       ")); }
  }
  console.log(failed ? "smoke180: " + failed + " failed" : "smoke180: all " + steps.length + " passed");
  process.exit(failed ? 1 : 0);
})();
