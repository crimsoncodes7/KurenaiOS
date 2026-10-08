/* Kurenai OS — smoke67.test.js
   The merged Computer Science leaves and the flashcard clean-up.

   The claims:

     A · THE MERGE IS IN THE SPEC. Each kept leaf carries the specification
         wording of every leaf folded into it, the folded refs are gone, and
         the tree holds 131 leaves.
     B · NO REVIEW SCHEDULE MOVES. Every shipped flashcard of a merged leaf
         keeps the SM-2 key it had as a separate leaf (a whole-key third
         element), keys are unique across the whole deck, and a stored
         schedule under an old key still belongs to the same card text.
     C · STORED STATE FOLLOWS THE REFS. A returning user's progress, topic
         links and plan rows filed under a folded ref are renamed to the kept
         leaf at boot; the kept leaf's own record wins; card keys are not
         touched.
     D · NOTHING DANGLES. No content entry, sim or generator is still wired
         to a folded ref, and every merged leaf keeps overview, toolkit and
         practice.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke67.test.js                                            */
"use strict";
const { boot } = require("./lib/app-harness");

/* kept leaf → the leaves folded into it (tools/gen_data.py CS_MERGES) */
const MERGES = {
  "4.5.1.1": ["4.5.1.2", "4.5.1.3", "4.5.1.4", "4.5.1.5", "4.5.1.6", "4.5.1.7"],
  "4.4.1.3": ["4.4.1.4", "4.4.1.5", "4.4.1.6", "4.4.1.7", "4.4.1.8"],
  "4.4.1.9": ["4.4.1.10", "4.4.1.11"],
  "4.4.4.4": ["4.4.4.5"],
  "4.4.4.6": ["4.4.4.7"],
  "4.5.3.1": ["4.5.3.2"],
  "4.5.4.1": ["4.5.4.2"],
  "4.5.4.5": ["4.5.4.6", "4.5.4.9"],
  "4.5.5.1": ["4.5.5.2"],
  "4.5.6.1": ["4.5.6.2", "4.5.6.3"],
  "4.5.6.4": ["4.5.6.5", "4.5.6.6"],
  "4.1.1.3": ["4.1.1.4", "4.1.1.5"]
};
const FOLDED = [].concat.apply([], Object.keys(MERGES).map(k => MERGES[k]));

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }

function leaves(app) {
  const out = [];
  (function walk(n) { if (!(n.children || []).length && n.content && n.content.length) out.push(n); (n.children || []).forEach(walk); })({ children: app.window.KOS_DATA.compsci.sections });
  return out;
}

step("A · the spec tree holds the merged leaves and their wording", async (app) => {
  const L = leaves(app), by = {};
  L.forEach(n => { by[n.ref] = n; });
  assert(L.length === 131, "131 leaves, found " + L.length);
  FOLDED.forEach(r => assert(!by[r], r + " is folded away"));
  Object.keys(MERGES).forEach(host => {
    assert(by[host], host + " is kept");
    assert(by[host].content.length >= 1 + MERGES[host].length, host + " carries every member's wording (" + by[host].content.length + " lines)");
  });
  assert(/irrational/i.test(by["4.5.1.1"].content.join(" ")), "number systems carries the irrational-number wording");
  assert(/ordinal/i.test(by["4.5.1.1"].content.join(" ")), "number systems carries the ordinal wording");
});

step("B · merged flashcards keep their old SM-2 keys, and keys never collide", async (app) => {
  const KOS = app.KOS, seen = {};
  KOS.srs.allCards().filter(c => !c.custom).forEach(c => {
    assert(!seen[c.key], "duplicate card key " + c.key + " (" + seen[c.key] + " and " + c.sid + ":" + c.ref + ")");
    seen[c.key] = c.sid + ":" + c.ref;
  });
  Object.keys(MERGES).forEach(host => {
    const cards = KOS.srs.cardsFor("compsci", host).filter(c => !c.custom);
    assert(cards.length >= 18 && cards.length <= 50, host + " has a sensible deck (" + cards.length + ")");
    const members = [host].concat(MERGES[host]);
    cards.forEach(c => {
      if (/:(sym)$/.test(c.key)) return;          /* a card written for the merge */
      const owner = members.some(m => c.key.indexOf("compsci:" + m + ":") === 0);
      assert(owner, host + " card " + c.key + " does not come from one of its members");
    });
  });
});

step("C · stored state under a folded ref moves to the kept leaf", async () => {
  const state = {
    progress: {
      "compsci:4.5.1.3": { status: "started", check: [true, false, false, false], note: "from ℚ" },
      "compsci:4.5.1.1": { status: "done", check: [true, true, true, true], note: "the kept one" },
      "compsci:4.4.1.5": { status: "paused", check: [false, false, false, false], note: "procedural" }
    },
    srs: { "compsci:4.5.1.3:5": { ef: 2.5, ivl: 6, reps: 3, due: "2026-10-20", last: "2026-10-14", views: 3, lapses: 0, lastRating: 3 } }
  };
  const app = await boot({ storage: { "kurenai-os-v1": JSON.stringify(state) } });
  const st = app.KOS.store.state;
  assert(st.progress["compsci:4.5.1.1"] && st.progress["compsci:4.5.1.1"].note === "the kept one", "the kept leaf's own record wins");
  assert(!st.progress["compsci:4.5.1.3"], "the folded leaf's record is gone");
  assert(st.progress["compsci:4.4.1.3"] && st.progress["compsci:4.4.1.3"].note === "procedural", "a folded record moves when the kept leaf has none");
  assert(st.srs["compsci:4.5.1.3:5"] && st.srs["compsci:4.5.1.3:5"].reps === 3, "a card schedule keeps its key");
  assert(app.KOS.store.renamedRef("compsci", "4.5.1.3") === "4.5.1.1", "renamedRef maps a folded ref");
  assert(app.KOS.store.renamedRef("compsci", "4.5.1.1") == null && app.KOS.store.renamedRef("compsci", "4.5.2.1") == null, "other refs are left alone");
  assert(app.KOS.store.renamedRef("compsci", "4.5.1.3:5") == null, "a card key is not a ref");
});

step("D · nothing is still wired to a folded ref", async (app) => {
  const C = app.window.KOS_CONTENT, KOS = app.KOS;
  FOLDED.forEach(r => assert(!C["compsci:" + r], "content for folded " + r + " is still defined"));
  Object.keys(MERGES).forEach(host => {
    const c = C["compsci:" + host], n = c.notes;
    assert(/— the whole topic on one page$/.test((n[0] && n[0].h) || ""), host + " opens on its overview");
    assert(n.some(b => b && b.page === "Exam toolkit"), host + " ends with a toolkit");
    assert(n.filter(b => b && b.worked).length >= 3, host + " has worked examples");
    assert((c.exam || []).length >= 6 && (c.quiz || []).length >= 6, host + " has practice");
    assert(n.filter(b => b && b.page).length <= 14, host + " is not sprawling (" + n.filter(b => b && b.page).length + " pages)");
  });
  KOS.sims.all().forEach(s => { if (s.subject === "compsci") FOLDED.forEach(r => assert(String(s.ref).indexOf(r) < 0, s.id + " still names " + r)); });
  assert(KOS.sims.forRef("compsci", "4.5.4.1").some(s => s.id === "binary-number"), "binary-number is on its kept leaf");
  assert(KOS.sims.forRef("compsci", "4.5.5.1").some(s => s.id === "char-codes"), "char-codes is on its kept leaf");
  assert(KOS.sims.forRef("compsci", "4.5.6.1").some(s => s.id === "adc-sampling"), "adc-sampling is on its kept leaf");
  KOS.pacing.ensureSeeded && KOS.pacing.ensureSeeded();
  (KOS.store.state.pacing.entries || []).filter(r => r.subject === "compsci").forEach(r => (r.refs || []).forEach(x => assert(FOLDED.indexOf(x) < 0, "plan row " + r.id + " still links " + x)));
});

(async () => {
  const app = await boot();
  let fails = 0;
  for (const [name, fn] of steps) {
    try { await fn(app); console.log("  ok  " + name); }
    catch (e) { fails++; console.log("FAIL  " + name + "\n      " + (e && e.message)); }
  }
  const errs = app.errors.filter(e => !/env\.local\.js/.test(e));
  if (errs.length) { fails++; console.log("FAIL  runtime errors: " + errs.join(" / ")); }
  console.log(fails ? "\nSMOKE67: " + fails + " failure(s)" : "\nSMOKE67: all " + steps.length + " steps passed");
  process.exit(fails ? 1 : 0);
})();
