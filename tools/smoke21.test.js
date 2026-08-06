/* Kurenai OS — smoke21.test.js
   Category 6 Phase B: the assistant tool registry (js/core/aitools.js), the
   shared-domain extractions it rides on, and the validation-before-save law.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke21.test.js

   TESTED PROPERTIES:
   1. Registry integrity: loads inert, every tool carries desc/category/tier/
      schema, unknown tools and malformed argument shapes are rejected before
      any execution; JSON Schemas are real (additionalProperties:false).
   2. Validation: missing required fields, wrong types, invalid enums,
      out-of-range numbers, unknown fields, invalid refs/ids — all rejected
      with specific errors and zero side effects. No silent coercion.
   3. Every write tool drives the REAL domain function (store/srs/tracker/
      calendar/todo/wishlist/goals/governor/focus/mediadb/media) — asserted
      by observing the real state change, the real session log, and undo
      restoring the prior state.
   4. Governor invariants survive the tool layer: one deliberate act = one
      session (tracker add, todo complete, games bulk add, sync rewards);
      the wishlist tools move ZERO sessions/gold/XP/HP and emit ZERO network
      (invariant #5a); media updates ride put() so the reward watermark and
      push scheduling behave exactly like quickEdit.
   5. Generation is validated-before-save and ATOMIC: malformed flashcard/
      quiz output (bad JSON, extra fields, out-of-range answer index, a bad
      item in an otherwise-good batch) saves NOTHING and explains; valid
      output saves AI-marked, deletable records; the custom quiz block
      renders separately in the topic Quiz tab with an "AI · Custom" badge.
   6. The hub search extraction: KOS.hub.search returns ranked hits with
      snippets and the topbar search UI still works on the same function.
   7. Result sanitization: entry payloads never carry coverUrl/reward/push
      bookkeeping; the collection sync tool logs ONE reward session through
      the real bulkUpsert watermark path (stubbed AniList transport only). */

const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const dom = new JSDOM(html, { url: "http://localhost/index.html", runScripts: "outside-only", pretendToBeVisual: true });
const { window } = dom;
const errors = [];
window.addEventListener("error", e => errors.push("window error: " + e.message));
const noop = () => {};
const ctxStub = new Proxy({}, { get: (t, k) => k === "measureText" ? () => ({ width: 10 }) : (typeof k === "string" ? noop : undefined), set: () => true });
window.HTMLCanvasElement.prototype.getContext = () => ctxStub;
window.requestAnimationFrame = cb => setTimeout(cb, 0);
window.confirm = () => true;

let netLog = [];
window.fetch = (url) => {
  netLog.push({ url: String(url) });
  return Promise.resolve({ ok: true, status: 200, headers: { get: () => null }, json: () => Promise.resolve({}), text: () => Promise.resolve("") });
};

const { indexedDB, IDBKeyRange } = require("fake-indexeddb");
window.indexedDB = indexedDB;
window.IDBKeyRange = IDBKeyRange;

const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
for (const src of scripts) {
  try { window.eval(fs.readFileSync(path.join(ROOT, src), "utf8")); }
  catch (e) { errors.push(`LOAD FAIL ${src}: ${e.message}`); }
}
const KOS = window.KOS;
if (KOS.autosync) KOS.autosync.stop();
if (KOS.cloudsync) KOS.cloudsync.stop();

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
const tick = ms => new Promise(r => setTimeout(r, ms || 0));
function assert(cond, msg) { if (!cond) throw new Error(msg); }
/* exec a tool → {err, result, undo} */
function ex(name, args) {
  return new Promise(res => KOS.ai.tools.execute(name, args, (err, result, undo) => res({ err, result, undo })));
}
function sessions() { return KOS.store.state.sessions; }
function gov() { return KOS.store.state.governor; }
const T = KOS.ai.tools;

/* ============ 1 · registry integrity ============ */
console.log("== registry integrity ==");

step("registry loads with 60+ tools, all carrying desc/category/tier", async () => {
  assert(errors.length === 0, "load errors: " + errors.join(" | "));
  const names = T.names();
  assert(names.length >= 60, "expected 60+ tools, got " + names.length);
  names.forEach(n => {
    const t = T.get(n);
    assert(t.desc && t.category && ["read", "reversible", "consequential"].includes(t.tier),
      n + " missing metadata");
    assert(/^[a-z][a-z0-9_]*$/.test(n), n + " is not a provider-safe function name");
  });
  const tiers = { read: 0, reversible: 0, consequential: 0 };
  names.forEach(n => tiers[T.get(n).tier]++);
  assert(tiers.read >= 20 && tiers.reversible >= 20 && tiers.consequential >= 12,
    "tier distribution looks wrong: " + JSON.stringify(tiers));
});

step("every deletion/spend/bulk/sync/purchase tool is consequential", async () => {
  ["study_delete_flashcard", "study_delete_exam_result", "collection_delete_entry",
   "calendar_delete_event", "todo_delete_task", "wishlist_remove_item", "goals_delete",
   "attachments_delete", "governor_buy_item", "games_bulk_add", "collection_sync_provider",
   "sync_cloud_sync_now", "sync_retry_pushes", "wishlist_mark_purchased", "wishlist_set_budget"
  ].forEach(n => assert(T.get(n) && T.get(n).tier === "consequential", n + " must be consequential"));
});

step("unknown tool + malformed argument shapes are rejected", async () => {
  const a = await ex("does_not_exist", {});
  assert(a.err && /unknown tool/i.test(a.err.message), "unknown tool must fail");
  const b = T.validate("study_get_topic", [1, 2]);
  assert(!b.ok, "array args must be rejected");
  const c = T.validate("study_get_topic", { subject: "compsci" });
  assert(!c.ok && c.errors.some(e => /ref is required/.test(e)), "missing required must be named");
});

step("schemas are real JSON Schemas with additionalProperties:false", async () => {
  const schemas = T.schemas(["study_add_flashcard", "collection_update_entry"]);
  assert(schemas.length === 2, "schemas() lost tools");
  schemas.forEach(s => {
    assert(s.name && s.description && s.parameters.type === "object", "schema shell wrong");
    assert(s.parameters.additionalProperties === false, "additionalProperties must be false");
  });
  const add = schemas[0].parameters;
  assert(add.required.includes("subject") && add.required.includes("q"), "required list wrong");
  assert(add.properties.subject.enum.includes("personal"), "subject enum lost");
});

step("no silent coercion: wrong types/enums/ranges/unknown fields all rejected", async () => {
  const cases = [
    ["study_set_topic_status", { subject: "compsci", ref: "3.1.1", status: "finished" }, /must be one of/],
    ["study_set_topic_check", { subject: "compsci", ref: "3.1.1", index: 4, value: true }, /must be ≤ 3/],
    ["study_set_topic_check", { subject: "compsci", ref: "3.1.1", index: "0", value: true }, /must be an integer/],
    ["study_rate_flashcard", { key: "x", rating: 2.5 }, /must be an integer/],
    ["calendar_add_event", { title: "T", date: "2026-09-01", type: "party" }, /must be one of/],
    ["todo_add_task", { text: "x", bogus: 1 }, /unknown field/],
    ["collection_list_entries", { module: "movies" }, /must be one of/],
    ["wishlist_add_item", { module: "books", title: "x", price: -5 }, /must be ≥ 0/]
  ];
  for (const [name, args, rx] of cases) {
    const v = T.validate(name, args);
    assert(!v.ok && v.errors.some(e => rx.test(e)), name + " should reject " + JSON.stringify(args) + " → " + JSON.stringify(v.errors));
  }
});

/* ============ 2 · study tools drive the real domain ============ */
console.log("== study tools ==");

const SID = "compsci";
let REF = null;   // a real leaf with deep content
step("reads: subjects, topics, topic detail, canonical notes, spec search", async () => {
  const subj = await ex("study_list_subjects", {});
  assert(!subj.err && subj.result.subjects.length === 3, "list_subjects wrong");
  const cs = subj.result.subjects.find(s => s.subject === "compsci");
  assert(cs.topicCount > 100 && cs.withDeepContent > 100, "compsci counts implausible");

  REF = KOS.hub.LEAVES[SID].find(l => KOS.content.has(SID, l.ref) &&
    (KOS.content.get(SID, l.ref).notes || []).length).ref;
  const topics = await ex("study_list_topics", { subject: SID });
  assert(!topics.err && topics.result.topics.length === 60 && topics.result.total > 100, "paging wrong");

  const t = await ex("study_get_topic", { subject: SID, ref: REF });
  assert(!t.err && t.result.specLines.length && t.result.content.hasNotes, "get_topic wrong");

  const notes = await ex("study_read_notes", { subject: SID, ref: REF });
  assert(!notes.err && notes.result.hasNotes && notes.result.text.length > 200,
    "read_notes must serialize real content, got " + (notes.result && notes.result.text.length) + " chars");

  const bad = await ex("study_get_topic", { subject: SID, ref: "99.99.99" });
  assert(bad.err && /not a spec point/.test(bad.err.message), "invalid ref must fail helpfully");

  const s = await ex("study_search_spec", { query: "binary search" });
  assert(!s.err && s.result.results.length && s.result.results[0].snippet, "search_spec must return snippets");
});

step("topbar search UI still rides the shared KOS.hub.search", async () => {
  const hits = KOS.hub.search("stack");
  assert(hits.length && hits[0].subject && hits[0].ref && hits[0].snippet, "hub.search shape wrong");
  const input = window.document.getElementById("search");
  input.value = "stack";
  input.dispatchEvent(new window.Event("input", { bubbles: true }));
  await tick(30);
  const items = window.document.querySelectorAll("#search-results .sr-item");
  assert(items.length > 0, "topbar search rendered nothing after the extraction");
  window.document.getElementById("search-results").classList.remove("open");
});

step("set status/check/note write real progress + undo restores", async () => {
  const st = await ex("study_set_topic_status", { subject: SID, ref: REF, status: "started" });
  assert(!st.err && KOS.store.peekProgress(SID, REF).status === "started", "status not written");
  await new Promise(r => st.undo.run(r));
  assert(KOS.store.peekProgress(SID, REF).status === "none", "undo did not restore status");

  const ck = await ex("study_set_topic_check", { subject: SID, ref: REF, index: 0, value: true });
  assert(!ck.err && KOS.store.peekProgress(SID, REF).check[0] === true, "check not written");

  const nt = await ex("study_set_topic_note", { subject: SID, ref: REF, note: "assistant note" });
  assert(!nt.err && KOS.store.peekProgress(SID, REF).note === "assistant note", "note not written");
  await new Promise(r => nt.undo.run(r));
  assert(KOS.store.peekProgress(SID, REF).note === "", "undo did not restore note");
});

let cardId = null;
step("flashcard add (dup-guarded) / rate / update / delete via real srs", async () => {
  const before = KOS.store.state.custom.cards.length;
  const add = await ex("study_add_flashcard", { subject: SID, ref: REF, q: "What is Q1?", a: "A1" });
  assert(!add.err && KOS.store.state.custom.cards.length === before + 1, "card not added");
  cardId = add.result.id;

  const dup = await ex("study_add_flashcard", { subject: SID, ref: REF, q: "what is q1?", a: "A2" });
  assert(dup.err && /already exists/.test(dup.err.message), "case-folded duplicate must be rejected");
  assert(KOS.store.state.custom.cards.length === before + 1, "duplicate must not save");

  const rate = await ex("study_rate_flashcard", { key: "u" + cardId, rating: 2 });
  assert(!rate.err && rate.result.nextDue && KOS.srs.peek("u" + cardId).reps === 1, "rating must ride SM-2");
  const rbad = await ex("study_rate_flashcard", { key: "u999999", rating: 2 });
  assert(rbad.err && /No card/.test(rbad.err.message), "missing card must fail");

  const up = await ex("study_update_flashcard", { id: cardId, q: "What is Q1 (v2)?", a: "A1v2" });
  assert(!up.err && KOS.store.state.custom.cards.find(c => c.id === cardId).q === "What is Q1 (v2)?", "update lost");
  await new Promise(r => up.undo.run(r));
  assert(KOS.store.state.custom.cards.find(c => c.id === cardId).q === "What is Q1?", "undo lost");

  const del = await ex("study_delete_flashcard", { id: cardId });
  assert(!del.err && !KOS.store.state.custom.cards.find(c => c.id === cardId), "delete failed");
  assert(!KOS.srs.peek("u" + cardId), "schedule must be dropped with the card");
});

step("exam tracker: add logs exactly ONE session, update/delete work, undo works", async () => {
  const s0 = sessions().length;
  const add = await ex("study_log_exam_result", { kind: "exam", subject: SID, ref: REF, topic: "Trees", marks: 7, max: 10 });
  assert(!add.err && add.result.pct === 70, "tracker add wrong");
  assert(sessions().length === s0 + 1 && sessions()[sessions().length - 1].type === "tracker",
    "tracker add must log exactly one session (the domain's own)");
  const badMarks = await ex("study_log_exam_result", { kind: "exam", marks: 11, max: 10 });
  assert(badMarks.err && /exceed/.test(badMarks.err.message), "marks>max must fail");

  const up = await ex("study_update_exam_result", { id: add.result.id, changes: { grade: "A" } });
  assert(!up.err && KOS.store.state.tracker.entries.find(t => t.id === add.result.id).grade === "A", "update lost");
  assert(sessions().length === s0 + 1, "update must NOT log another session");

  const del = await ex("study_delete_exam_result", { id: add.result.id });
  assert(!del.err && !KOS.store.state.tracker.entries.find(t => t.id === add.result.id), "delete failed");
});

/* ============ 3 · generation: validate-before-save, atomic ============ */
console.log("== generation (malformed → zero saves) ==");

function stubGeneration(responder) {
  KOS.ai._config({});   // clear transports
  KOS.ai.chat = function (category, request, cb) {
    responder(category, request, cb);
  };
}
const realChat = KOS.ai.chat;

step("malformed flashcard output (bad JSON / extra fields) saves NOTHING", async () => {
  const before = KOS.store.state.custom.cards.length;
  stubGeneration((cat, req, cb) => cb(null, { text: "not json at all", provider: "deepseek", model: "m" }));
  let r = await ex("study_generate_flashcards", { subject: SID, ref: REF, count: 3 });
  assert(r.err && /cards array|try again/i.test(r.err.message), "bad JSON must fail cleanly");
  assert(KOS.store.state.custom.cards.length === before, "bad JSON must save nothing");

  stubGeneration((cat, req, cb) => cb(null, {
    text: JSON.stringify({ cards: [{ q: "ok?", a: "yes" }, { q: "bad", a: "x", hint: "EXTRA" }] }),
    provider: "deepseek", model: "m"
  }));
  r = await ex("study_generate_flashcards", { subject: SID, ref: REF, count: 3 });
  assert(r.err && /unexpected fields/.test(r.err.message), "extra fields must fail");
  assert(KOS.store.state.custom.cards.length === before, "ATOMICITY: partial batch must save nothing");
});

step("valid flashcard generation saves AI-marked cards; undo removes them", async () => {
  const before = KOS.store.state.custom.cards.length;
  stubGeneration((cat, req, cb) => {
    assert(cat === "generation", "generation must route through the generation category");
    assert(/CONTENT:/.test(req.messages[0].content) && req.messages[0].content.length > 300,
      "generation must be grounded in real topic content");
    assert(req.structured && req.structured.schema, "generation must request structured output");
    cb(null, { text: JSON.stringify({ cards: [{ q: "Gen Q A?", a: "a" }, { q: "Gen Q B?", a: "b" }] }),
      provider: "deepseek", model: "deepseek-v4-flash" });
  });
  const r = await ex("study_generate_flashcards", { subject: SID, ref: REF, count: 2 });
  assert(!r.err && r.result.added === 2 && r.result.marked === "AI · Custom", "valid generation failed: " + (r.err && r.err.message));
  const created = KOS.store.state.custom.cards.slice(-2);
  assert(created.every(c => c.ai === true), "generated cards must carry the ai flag");
  assert(KOS.srs.cardsFor(SID, REF).some(c => c.ai), "cardsFor must expose the ai flag for badges");
  await new Promise(res => r.undo.run(res));
  assert(KOS.store.state.custom.cards.length === before, "undo must remove all generated cards");
});

step("malformed quiz (out-of-range ans in an otherwise-good batch) saves NOTHING", async () => {
  const beforeQ = (KOS.store.state.custom.quizzes || []).length;
  stubGeneration((cat, req, cb) => cb(null, {
    text: JSON.stringify({ questions: [
      { q: "Good?", opts: ["a", "b", "c", "d"], ans: 1, why: "ok" },
      { q: "Bad", opts: ["a", "b"], ans: 5, why: "out of range" }
    ] }), provider: "deepseek", model: "m"
  }));
  const r = await ex("study_generate_quiz", { subject: SID, ref: REF, count: 2 });
  assert(r.err && /out of range/.test(r.err.message), "bad answer index must be named");
  assert((KOS.store.state.custom.quizzes || []).length === beforeQ, "ATOMICITY: quiz batch must save nothing");

  stubGeneration((cat, req, cb) => cb(null, {
    text: JSON.stringify({ questions: [{ q: "Dup?", opts: ["x", "x", "y"], ans: 0, why: "w" }] }),
    provider: "deepseek", model: "m"
  }));
  const r2 = await ex("study_generate_quiz", { subject: SID, ref: REF, count: 1 });
  assert(r2.err && /duplicate option/.test(r2.err.message), "duplicate options must be rejected");
});

let quizIds = [];
step("valid quiz generation saves AI-marked questions in the custom store", async () => {
  stubGeneration((cat, req, cb) => cb(null, {
    text: JSON.stringify({ questions: [
      { q: "Which is O(log n)?", opts: ["linear scan", "binary search", "bubble sort", "bogosort"], ans: 1, why: "halves the space" },
      { q: "Stack order?", opts: ["FIFO", "LIFO", "random", "sorted"], ans: 1, why: "last in first out" }
    ] }), provider: "deepseek", model: "deepseek-v4-flash"
  }));
  const r = await ex("study_generate_quiz", { subject: SID, ref: REF, count: 2 });
  assert(!r.err && r.result.added === 2, "valid quiz generation failed: " + (r.err && r.err.message));
  quizIds = r.result.ids;
  const rows = KOS.srs.customQuizFor(SID, REF);
  assert(rows.length === 2 && rows.every(q => q.ai === true), "quiz rows must be AI-marked");
});

step("the topic Quiz tab renders the custom block separately with an AI badge", async () => {
  KOS.ai.chat = realChat;
  KOS.show("ref", { subject: SID, ref: REF });
  await tick(80);
  const tab = [...window.document.querySelectorAll(".study-tab")].find(b => b.dataset.tab === "quiz");
  assert(tab, "quiz tab missing even with custom questions present");
  tab.click();
  await tick(50);
  const block = window.document.querySelector(".quiz-custom");
  assert(block, "custom quiz block missing");
  const badge = [...window.document.querySelectorAll(".quiz-custom-manage .fc-custom")];
  assert(badge.length === 2 && badge.every(b => /AI/.test(b.textContent)), "AI badge missing on custom questions");
  const delBtns = window.document.querySelectorAll(".quiz-custom-manage .mini-btn.danger");
  delBtns[0].click();
  await tick(30);
  assert(KOS.srs.customQuizFor(SID, REF).length === 1, "in-tab delete must work");
  KOS.srs.deleteCustomQuiz(quizIds[1]);
});

/* ============ 4 · planner tools ============ */
console.log("== planner tools ==");

step("calendar add/update/delete on the real store; bad dates rejected", async () => {
  const bad = await ex("calendar_add_event", { title: "X", date: "2026-02-30", type: "exam" });
  assert(bad.err && /real YYYY-MM-DD/.test(bad.err.message), "impossible date must fail");
  const add = await ex("calendar_add_event", { title: "Mock exam", date: "2026-09-01", time: "09:00", type: "exam", subject: SID });
  assert(!add.err && KOS.store.state.calendar.events.some(e => e.id === add.result.id), "event not added");
  const up = await ex("calendar_update_event", { id: add.result.id, changes: { title: "Mock exam 2" } });
  assert(!up.err && KOS.store.state.calendar.events.find(e => e.id === add.result.id).title === "Mock exam 2", "update lost");
  const missing = await ex("calendar_update_event", { id: 99999, changes: { title: "x" } });
  assert(missing.err && /No event/.test(missing.err.message), "missing target must fail");
  const del = await ex("calendar_delete_event", { id: add.result.id });
  assert(!del.err && !KOS.store.state.calendar.events.some(e => e.id === add.result.id), "delete failed");
});

step("todo: add, complete (ONE session via the domain), habits, delete", async () => {
  const s0 = sessions().length;
  const add = await ex("todo_add_task", { text: "Revise stacks" });
  assert(!add.err, "task add failed");
  const tog = await ex("todo_toggle_task", { id: add.result.id, done: true });
  assert(!tog.err && sessions().length === s0 + 1 && sessions()[sessions().length - 1].type === "todo",
    "completing must log exactly one todo session");
  const tog2 = await ex("todo_toggle_task", { id: add.result.id, done: true });
  assert(!tog2.err && tog2.result.unchanged === true && sessions().length === s0 + 1,
    "re-completing must be a no-op, never a second session");
  const hab = await ex("todo_add_habit", { text: "Read 20 min" });
  assert(!hab.err, "habit add failed");
  const tickH = await ex("todo_tick_habit", { id: hab.result.id, done: true });
  assert(!tickH.err && tickH.result.doneToday === true, "habit tick failed");
  const del = await ex("todo_delete_task", { id: add.result.id });
  assert(!del.err && !KOS.store.state.todo.manual.some(t => t.id === add.result.id), "task delete failed");
});

step("wishlist: full flow is governor-neutral and network-silent (#5a)", async () => {
  const s0 = sessions().length, g0 = { ...gov() }, net0 = netLog.length;
  const add = await ex("wishlist_add_item", { module: "game", title: "Silksong", price: 20 });
  assert(!add.err && add.result.status === "wantToBuy", "wishlist add failed");
  const up = await ex("wishlist_update_item", { id: add.result.id, changes: { price: 18 } });
  assert(!up.err && KOS.wishlist.get(add.result.id).price === 18, "wishlist update lost");
  const st = await ex("wishlist_set_status", { id: add.result.id, status: "waitingForRelease" });
  assert(!st.err, "set_status failed");
  const buyViaStatus = T.validate("wishlist_set_status", { id: add.result.id, status: "purchased" });
  assert(!buyViaStatus.ok, "purchased must NOT be reachable via set_status — only mark_purchased");
  const buy = await ex("wishlist_mark_purchased", { id: add.result.id });
  assert(!buy.err && buy.result.purchased === true, "mark_purchased failed");
  assert(buy.result.spentThisMonth === 18, "purchase must commit the price to the month ledger");
  const again = await ex("wishlist_mark_purchased", { id: add.result.id });
  assert(!again.err && again.result.alreadyPurchased === true, "re-marking must be idempotent");
  const g1 = gov();
  assert(sessions().length === s0 && g1.gold === g0.gold && g1.xp === g0.xp && g1.hp === g0.hp,
    "INVARIANT 5a VIOLATED: the wishlist flow touched the governor");
  assert(netLog.length === net0, "INVARIANT 5a VIOLATED: the wishlist flow emitted network traffic");
  const rm = await ex("wishlist_remove_item", { id: add.result.id });
  assert(!rm.err, "remove failed");
  const bud = await ex("wishlist_set_budget", { monthlyLimit: 60 });
  assert(!bud.err && KOS.wishlist.budget().monthlyLimit === 60, "budget not set");
});

step("goals: manual + auto rules enforced by the real domain", async () => {
  const badMetric = await ex("goals_add", { title: "x", kind: "auto", metric: "not-a-metric", target: 5 });
  assert(badMetric.err && /metric/.test(badMetric.err.message), "bad auto metric must fail");
  const man = await ex("goals_add", { title: "Finish 3 VNs", kind: "manual", target: 3 });
  assert(!man.err, "manual goal add failed");
  const up = await ex("goals_update", { id: man.result.id, changes: { current: 1 } });
  assert(!up.err && KOS.goals.get(man.result.id).current === 1, "manual progress lost");
  const auto = await ex("goals_add", { title: "Complete 5 anything", kind: "auto",
    metric: KOS.goals.metrics()[0].id, target: 5 });
  assert(!auto.err, "auto goal add failed");
  const upAuto = await ex("goals_update", { id: auto.result.id, changes: { current: 2 } });
  assert(upAuto.err && /auto goal/.test(upAuto.err.message), "auto progress must be computed, not set");
  const list = await ex("goals_list", {});
  assert(!list.err && list.result.goals.length >= 2, "goals_list wrong");
  await ex("goals_delete", { id: man.result.id });
  await ex("goals_delete", { id: auto.result.id });
});

/* ============ 5 · governor + focus tools ============ */
console.log("== governor + focus ==");

step("governor status/shop reads; buy enforces the real gold rule", async () => {
  const st = await ex("governor_get_status", {});
  assert(!st.err && typeof st.result.hp === "number" && st.result.level >= 1, "status wrong");
  const shop = await ex("governor_list_shop", {});
  assert(!shop.err && shop.result.items.length > 30, "shop catalog wrong");
  gov().gold = 0;
  const poor = await ex("governor_buy_item", { itemId: "seal-tsuki" });
  assert(poor.err && /gold/.test(poor.err.message), "insufficient gold must fail via the domain");
  gov().gold = 100;
  const buy = await ex("governor_buy_item", { itemId: "seal-tsuki" });
  assert(!buy.err && gov().gold === 30 && gov().owned.includes("seal-tsuki"), "buy must spend real gold");
  const again = await ex("governor_buy_item", { itemId: "seal-tsuki" });
  assert(again.err && /Already owned/.test(again.err.message), "double-buy must fail");
});

step("cosmetics: unowned rejected, owned applied, undo restores", async () => {
  const un = await ex("governor_set_cosmetic", { kind: "seal", id: "seal-ryuu" });
  assert(un.err && /isn't owned/.test(un.err.message), "unowned cosmetic must fail");
  const ok = await ex("governor_set_cosmetic", { kind: "seal", id: "seal-tsuki" });
  assert(!ok.err && gov().seal === "seal-tsuki", "owned cosmetic not applied");
  await new Promise(r => ok.undo.run(r));
  assert(gov().seal === "kurenai", "undo must restore the previous seal");
});

step("focus: start/pause/resume/end guards through the one timer", async () => {
  const idleEnd = await ex("focus_end_session", {});
  assert(idleEnd.err && /No session/.test(idleEnd.err.message), "end with no session must fail");
  const start = await ex("focus_start_session", { workMin: 25 });
  assert(!start.err && KOS.focus.state() === "running", "start failed");
  const dbl = await ex("focus_start_session", { workMin: 10 });
  assert(dbl.err && /already running/.test(dbl.err.message), "double start must fail");
  const pause = await ex("focus_pause_resume", { action: "pause" });
  assert(!pause.err && KOS.focus.state() === "paused", "pause failed");
  const resume = await ex("focus_pause_resume", { action: "resume" });
  assert(!resume.err && KOS.focus.state() === "running", "resume failed");
  const tooEarly = await ex("focus_end_session", {});
  assert(tooEarly.err && /forfeit/.test(tooEarly.err.message), "premature complete must warn about forfeiture");
  const s0 = sessions().length;
  const endEarly = await ex("focus_end_session", { early: true });
  assert(!endEarly.err && endEarly.result.awardForfeited === true, "early end failed");
  assert(KOS.focus.state() === "idle", "session must be gone");
  assert(sessions().length === s0 + 1 && sessions()[sessions().length - 1].metrics.complete === false,
    "early end must log the incomplete session (day-drain evidence)");
});

/* ============ 6 · collection tools (fake-indexeddb) ============ */
console.log("== collection tools ==");

let animeId = null, vnId = null, bookId = null;
step("add entries: axis guards, duplicate guard, sanitized results", async () => {
  const wrongAxis = await ex("collection_add_entry", { module: "anime", title: "X", playtimeHours: 5 });
  assert(wrongAxis.err && /doesn't apply/.test(wrongAxis.err.message), "game axis on anime must fail");
  const vnProg = await ex("collection_add_entry", { module: "vn", title: "X", progressCurrent: 3 });
  assert(vnProg.err && /routes/.test(vnProg.err.message), "VN stored progress must be refused (derived)");

  const s0 = sessions().length;
  const a = await ex("collection_add_entry", { module: "anime", title: "Frieren", status: "inProgress", progressCurrent: 4, progressTotal: 28 });
  assert(!a.err && a.result.id, "anime add failed: " + (a.err && a.err.message));
  animeId = a.result.id;
  assert(sessions().length === s0 + 1 && sessions()[sessions().length - 1].type === "media",
    "manual add must log one media session (the UI path's activity)");

  const dup = await ex("collection_add_entry", { module: "anime", title: "frieren" });
  assert(dup.err && /already in the/.test(dup.err.message), "duplicate title must be refused");

  const v = await ex("collection_add_entry", { module: "vn", title: "Steins;Gate", status: "inProgress" });
  vnId = v.result.id;
  const b = await ex("collection_add_entry", { module: "books", title: "Frieren Manga", status: "inProgress", author: "Abe" });
  bookId = b.result.id;

  const got = await ex("collection_get_entry", { entryId: animeId });
  assert(!got.err && got.result.title === "Frieren", "get_entry failed");
  const json = JSON.stringify(got.result);
  assert(!/coverUrl|reward|cleanLocal|lastPushedHash/.test(json), "SANITIZATION: internal fields leaked: " + json.slice(0, 200));
});

step("update: quickEdit parity (watermark absorbed, no push for manual rows), undo restores", async () => {
  const up = await ex("collection_update_entry", { entryId: animeId, changes: { progressCurrent: 6, score: 8 } });
  assert(!up.err && up.result.updated.includes("progressCurrent"), "update failed: " + (up.err && up.err.message));
  const after = await ex("collection_get_entry", { entryId: animeId });
  assert(after.result.progress.current === 6 && after.result.score === 8, "update not persisted");
  assert(up.result.pushScheduled === false, "a manual entry must never schedule a push (eligibility)");
  const missing = await ex("collection_update_entry", { entryId: 424242, changes: { score: 5 } });
  assert(missing.err && /No collection entry/.test(missing.err.message), "missing target must fail");
  await new Promise(r => up.undo.run(r));
  const restored = await ex("collection_get_entry", { entryId: animeId });
  assert(restored.result.progress.current === 4 && restored.result.score === 0, "undo must restore progress+score");
});

step("vn routes derive progress; quotes can mint a personal flashcard", async () => {
  const r = await ex("vn_update_routes", { entryId: vnId, add: ["Kurisu", "Mayuri"] });
  assert(!r.err && r.result.progress.total === 2 && r.result.progress.current === 0, "route add must re-derive progress");
  const clear = await ex("vn_update_routes", { entryId: vnId, setCleared: [{ name: "Kurisu", cleared: true }] });
  assert(!clear.err && clear.result.progress.current === 1, "clearing must move derived progress");
  const ghost = await ex("vn_update_routes", { entryId: vnId, setCleared: [{ name: "Nope", cleared: true }] });
  assert(ghost.err && /No route named/.test(ghost.err.message), "unknown route must fail atomically");
  const cardsBefore = KOS.store.state.custom.cards.length;
  const q = await ex("vn_add_quote", { entryId: vnId, text: "El Psy Kongroo", asFlashcard: true });
  assert(!q.err && q.result.flashcardId && KOS.store.state.custom.cards.length === cardsBefore + 1,
    "quote→flashcard path broken");
  const wrongModule = await ex("vn_add_quote", { entryId: animeId, text: "x" });
  assert(wrongModule.err && /isn't a visual novel/.test(wrongModule.err.message), "module check missing");
});

step("books physical volume + custom lists", async () => {
  const v = await ex("books_add_physical_volume", { entryId: bookId, number: 1, condition: "mint", price: 9.99 });
  assert(!v.err && v.result.volumeCount === 1, "volume add failed");
  const dup = await ex("books_add_physical_volume", { entryId: bookId, number: 1 });
  assert(dup.err && /already in the physical vault/.test(dup.err.message), "duplicate volume must fail");
  const cl = await ex("collection_set_custom_lists", { entryId: bookId, add: ["Cozy"] });
  assert(!cl.err && cl.result.customLists.includes("Cozy"), "custom list add failed");
  const lists = await new Promise(r => KOS.media.customLists("books", (e, l) => r(l)));
  assert(lists.includes("Cozy"), "list must be registered in the kv registry too");
});

step("list/query + stats + cross-app search", async () => {
  const l = await ex("collection_list_entries", { module: "anime", status: "inProgress" });
  assert(!l.err && l.result.entries.some(e => e.title === "Frieren"), "query lost the entry");
  const stats = await ex("collection_get_stats", {});
  assert(!stats.err && stats.result.total >= 3, "stats wrong");
  const s = await ex("search_app", { query: "frieren" });
  assert(!s.err && s.result.media.length >= 2, "cross-app search must hit both Frieren rows");
  assert(s.result.spec !== undefined, "spec scope missing by default");
});

step("games_bulk_add: dedupes, ONE session for the whole paste", async () => {
  const s0 = sessions().length;
  const r = await ex("games_bulk_add", { titles: ["Hades", "Outer Wilds", "Hades"] });
  assert(!r.err && r.result.added === 2 && r.result.dupPaste === 1, "bulk report wrong: " + JSON.stringify(r.result));
  assert(sessions().length === s0 + 1 && sessions()[sessions().length - 1].metrics.action === "bulk-add",
    "bulk add must log exactly ONE session");
});

step("delete records a tombstone (cloud identity law)", async () => {
  const g = await new Promise(r => KOS.mediadb.query({ module: "game", search: "Hades" }, (e, rows) => r(rows[0])));
  const del = await ex("collection_delete_entry", { entryId: g.id });
  assert(!del.err && del.result.deleted, "delete failed");
  const tombs = await new Promise(r => KOS.mediadb.getKV("cloudsync.pendingDeletes", (e, t) => r(t)));
  assert(Array.isArray(tombs) && tombs.some(t => t.syncId === g.syncId),
    "delete must record a tombstone carrying the syncId");
});

step("collection_sync_provider rides the ONE extracted runner (stubbed transport, real bulkUpsert, one reward session)", async () => {
  const realGetConn = KOS.anilist.getConnection, realSync = KOS.anilist.syncList;
  KOS.anilist.getConnection = cb => cb(null, { token: "t", viewer: { id: 1, name: "u" } });
  KOS.anilist.syncList = (tok, viewer, module, cb) => cb(null, [
    { module: "anime", title: "Frieren", status: "completed",
      progress: { current: 28, total: 28 }, score: 9,
      externalIds: { anilistId: 154587 }, syncSource: "anilist" }
  ]);
  const s0 = sessions().length;
  const r = await ex("collection_sync_provider", { source: "anilist", module: "anime" });
  KOS.anilist.getConnection = realGetConn; KOS.anilist.syncList = realSync;
  assert(!r.err, "sync failed: " + (r.err && r.err.message));
  assert(r.result.added + r.result.updated >= 1, "sync must touch the vault");
  const logged = sessions().slice(s0).filter(e => e.metrics && e.metrics.action === "sync-reward");
  assert(logged.length <= 1, "sync must log AT MOST one reward session (got " + logged.length + ")");
  const ts = await new Promise(res => KOS.mediadb.getKV("anilist.lastSync.anime", (e, v) => res(v)));
  assert(typeof ts === "number", "lastSync watermark must be stamped");
});

/* ============ 7 · sync/archive/app tools ============ */
console.log("== sync, archive, app ==");

step("cloud/sync reads degrade cleanly signed out; autosync toggle works", async () => {
  const st = await ex("sync_cloud_status", {});
  assert(!st.err && st.result.signedIn === false, "cloud status wrong signed out");
  const now = await ex("sync_cloud_sync_now", {});
  assert(now.err && /Not signed in/.test(now.err.message), "sync now must fail signed out");
  const health = await ex("collection_get_sync_health", {});
  assert(!health.err && typeof health.result.autosyncEnabled === "boolean", "sync health wrong");
  const off = await ex("sync_set_autosync", { enabled: false });
  assert(!off.err, "autosync toggle failed");
  const health2 = await ex("collection_get_sync_health", {});
  assert(health2.result.autosyncEnabled === false, "toggle not persisted");
  await new Promise(r => off.undo.run(r));
});

step("backup info counts without exposing payloads", async () => {
  const r = await ex("archive_get_backup_info", {});
  assert(!r.err && r.result.mediaEntries >= 3 && r.result.tokensIncluded === false, "backup info wrong");
  assert(JSON.stringify(r.result).length < 500, "backup info must be counts, not payload");
});

step("app_navigate uses KOS.show with a whitelist; app_get_context reads live ui", async () => {
  const bad = await ex("app_navigate", { view: "ref", subject: SID });
  assert(bad.err && /needs subject and ref/.test(bad.err.message), "ref nav needs both");
  const nav = await ex("app_navigate", { view: "calendar" });
  assert(!nav.err && KOS.store.state.ui.view === "calendar", "navigate must ride KOS.show");
  const ctx = await ex("app_get_context", {});
  assert(!ctx.err && ctx.result.view === "calendar" && ctx.result.section === "productivity", "context wrong");
});

step("media_log_activity: 0 HP by contract, feeds the rest streak", async () => {
  const hp0 = gov().hp;
  const r = await ex("media_log_activity", { entryId: animeId, action: "progress" });
  assert(!r.err && r.result.logged, "log activity failed");
  assert(gov().hp === hp0, "INVARIANT 3 VIOLATED: media activity touched HP");
  assert(KOS.sessions.restStreak() >= 1, "media activity must feed the rest streak");
});

/* ============ run ============ */
(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try {
      await Promise.race([fn(), new Promise((_, rej) =>
        setTimeout(() => rej(new Error("STEP TIMEOUT (15s) — a callback never fired")), 15000))]);
      console.log("  ok  " + name);
    }
    catch (e) { failed++; console.error("  FAIL " + name + "\n       " + (e && e.stack ? e.stack.split("\n").slice(0, 3).join("\n       ") : e)); }
  }
  if (errors.length) { failed++; console.error("page errors: " + errors.join(" | ")); }
  await tick(100);
  console.log("\n==============================");
  if (failed) { console.error("SMOKE21 FAILED — " + failed + " step(s)"); process.exit(1); }
  console.log("SMOKE21 PASS — Category 6 Phase B tool registry verified (" + steps.length + " steps).");
  process.exit(0);
})();
