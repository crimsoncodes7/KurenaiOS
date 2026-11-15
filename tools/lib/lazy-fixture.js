/* Kurenai OS — tools/lib/lazy-fixture.js
   A test account for loading on first use (quality W2, AP-01; smoke142).

   The Sample account, plus the evidence that reads the lazily loaded
   bundles from OUTSIDE their own pages: cards rated in every exam subject
   (some due, one set aside), Code lessons read, run and passed, forks of a
   topic's cards and notes, a quick note, and real exams from the board
   presets with their goals. Made with the app's own functions in an eager
   boot, so it is exactly what a learner's account holds.

   The harness's clock is fixed, so two calls give the same account: one is
   rebooted eager and one lazy, and whatever they save must be equal.

   seed() → { storage, indexedDB }   ready to hand to boot()               */
const { boot } = require("./app-harness.js");

function dump(win) {
  const o = {};
  for (let i = 0; i < win.localStorage.length; i++) { const k = win.localStorage.key(i); o[k] = win.localStorage.getItem(k); }
  return o;
}

function enrich(app) {
  const KOS = app.KOS, w = app.window, C = w.KOS_CONTENT, st = KOS.store.state;
  const today = KOS.srs.todayISO();
  const made = { cards: 0, lessons: 0, forks: 0, exams: 0, goals: 0 };

  /* cards in Maths and IT: rated, two of each topic due today, one set aside */
  ["maths", "it"].forEach((sid) => {
    Object.keys(C).filter((k) => k.indexOf(sid + ":") === 0 && C[k].flashcards && C[k].flashcards.length >= 3).slice(0, 5).forEach((k, n) => {
      const ref = k.slice(sid.length + 1);
      KOS.srs.cardsFor(sid, ref).slice(0, 3).forEach((c, i) => {
        KOS.srs.rate(c.key, i === 0 ? 0 : 2);
        const m = st.srs[c.key];
        if (i < 2) m.due = KOS.srs.addDays(today, -i);
        if (n === 0 && i === 2) m.leech = today;
        made.cards++;
      });
    });
  });

  /* Code: the first three lessons read, run and passed; the fourth half read */
  const lessons = KOS.code.coreLessons().filter((l) => KOS.code.hasLesson(l.ref)).slice(0, 4);
  lessons.forEach((l, n) => {
    const ev = KOS.code.evidence(l.ref);
    const pages = n < 3 ? ev.pages : Math.ceil(ev.pages / 2);
    for (let i = 0; i < pages; i++) KOS.code.markPage(l.ref, i);
    if (n < 3) KOS.code.listingsOf(l.ref).forEach((x) => KOS.code.markListing(l.ref, x.id));
    if (n < 2) {
      const t = KOS.code.tasksOf(l.ref)[0];
      if (t) KOS.code.recordCheck(t.id, { passed: true });
    }
    KOS.code.syncChecks(l.ref);
    made.lessons++;
  });

  /* forks: a topic's cards with one added, another topic's notes with a
     line added, and a quick note on a Code lesson */
  const cs = Object.keys(C).filter((k) => k.indexOf("compsci:") === 0 && C[k].flashcards && C[k].notes);
  if (cs.length > 1) {
    const r0 = cs[0].slice(8), r1 = cs[1].slice(8);
    KOS.edits.set("compsci", r0, "flashcards", KOS.edits.material("compsci", r0, "flashcards").concat([{ q: "A card of my own?", a: "Yes." }]));
    KOS.edits.set("compsci", r1, "notes", KOS.edits.material("compsci", r1, "notes").concat([{ p: "A line of my own." }]));
    made.forks += 2;
  }
  if (lessons[0] && KOS.edits.appendSpec) { KOS.edits.appendSpec("code", lessons[0].ref, "Remember the semicolon."); made.forks++; }

  /* real exams from the board presets, with every goal their templates offer */
  ["aqa-7517-2", "edexcel-9ma0-1"].forEach((pid, n) => {
    if (!KOS.exams.preset(pid)) return;
    const a = KOS.exams.add({ preset: pid, tier: "real_exam", date: KOS.srs.addDays(today, 20 + 3 * n) });
    made.exams++;
    if (KOS.goalsExams) made.goals += KOS.goalsExams.add(a, KOS.goalsExams.templates(a).map((r) => Object.assign({}, r, { on: true }))).length;
  });
  if (KOS.srs.examPass) KOS.srs.examPass();
  KOS.store.save();
  return made;
}

async function seed() {
  const { IDBFactory } = require("fake-indexeddb");
  const indexedDB = new IDBFactory();
  const app = await boot({ storage: { "kurenai-os-data-mode": "sample" }, indexedDB });
  await app.settle();
  const made = enrich(app);
  await app.settle();
  if (app.KOS.store.flush) await app.KOS.store.flush();
  if (app.errors.length) throw new Error("the fixture did not boot clean: " + app.errors[0]);
  return { storage: dump(app.window), indexedDB, made };
}

module.exports = { seed, dump, enrich };
