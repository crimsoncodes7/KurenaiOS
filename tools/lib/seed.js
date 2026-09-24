/* tools/lib/seed.js — a used account for jsdom suites (UI rebuild M2).

   A compact version of the dense seed in tools/responsive_audit.mjs: every
   domain a view can read has records in it, with long titles, a mature
   Governor and a small Collection across all four vaults (AniList-owned,
   VNDB-owned, manual and physical rows). It is deterministic: no randomness
   beyond a fixed LCG and dates relative to the harness's fixed clock.

     await seedAccount(app)     app from tools/lib/app-harness.js boot()    */
"use strict";

async function seedAccount(app) {
  const { window, KOS } = app;
  const S = KOS.store.state;
  const DAY = 86400000;
  const today = window.Date.parse(new window.Date().toISOString().slice(0, 10) + "T09:00:00Z");
  const iso = (t) => new window.Date(t).toISOString().slice(0, 10);
  const rnd = ((n) => () => (n = (n * 1664525 + 1013904223) >>> 0) / 4294967296)(20260808);
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const LONG = "The Extraordinarily Long Light-Novel Title That Explains Its Entire Premise In One Breath";

  KOS.governor.debugUnlockAll();
  S.governor.xp = 71802; S.governor.gold = 12476; S.governor.hp = 74;

  const kinds = ["flashcards", "quiz", "notes", "exam", "focus", "media", "tracker", "reading"];
  S.sessions = [];
  for (let i = 0; i < 160; i++) {
    const t = today - Math.floor(rnd() * 60) * DAY - Math.floor(rnd() * 8) * 3600000;
    const type = pick(kinds);
    S.sessions.push({ id: i + 1, ts: t, date: iso(t), type, subject: pick(["compsci", "maths", "it"]),
      ref: "4.2.3.1", dur: 300 + Math.floor(rnd() * 2400),
      metrics: { complete: rnd() > 0.12, module: type === "media" ? pick(["anime", "books", "vn", "game"]) : undefined } });
  }
  S.sessions.sort((a, b) => a.ts - b.ts);

  const refs = [];
  Object.keys(window.KOS_DATA || {}).forEach((sid) => {
    const walk = (n) => { if (!n) return; if (n.content && n.content.length) refs.push(sid + ":" + n.ref); (n.children || []).forEach(walk); };
    ((window.KOS_DATA[sid] || {}).sections || []).forEach(walk);
  });
  refs.slice(0, 90).forEach((k, i) => {
    S.progress[k] = { status: i % 5 === 0 ? "done" : i % 3 === 0 ? "started" : i % 7 === 0 ? "paused" : "none",
      check: [i % 2 === 0, i % 3 === 0, i % 4 === 0, i % 5 === 0],
      rag: i % 4 === 0 ? ["r", "a", "g"][i % 3] : null,
      note: i % 7 === 0 ? "Revisit the worked example — write the justification out in full." : "" };
  });
  refs.slice(0, 40).forEach((k, i) => {
    const [sid, ...rest] = k.split(":");
    (KOS.srs.cardsFor(sid, rest.join(":")) || []).forEach((c, j) => {
      if ((i + j) % 3 === 2) return;
      S.srs[c.key] = { ef: 1.9 + ((i + j) % 12) / 10, ivl: 1 + ((i + j) % 21), reps: 1 + ((i + j) % 9),
        due: iso(today + (((i + j) % 11) - 4) * DAY), last: iso(today - (1 + ((i + j) % 9)) * DAY),
        views: 2 + ((i + j) % 14), lapses: (i + j) % 5 === 0 ? 1 : 0, lastRating: (i + j) % 4 };
    });
  });
  refs.slice(0, 4).forEach((k, i) => {
    const [sid, ...rest] = k.split(":");
    S.custom.cards.push({ id: S.custom.nextId++, sid, ref: rest.join(":"),
      q: "Custom card " + (i + 1) + " — state the definition", a: "The full wording, written out." });
  });

  S.calendar = { v: 2, nextId: 1, seeded: true, events: [], notified: {} };
  for (let i = 0; i < 24; i++) {
    const d = today + (Math.floor(rnd() * 40) - 15) * DAY;
    /* every record goes through its domain's schema gate (invariant 41 and
     its siblings), as every real write does */
    S.calendar.events.push(KOS.calendar.normalise({ type: pick(["exam", "deadline", "study", "other"]),
      title: i % 6 === 0 ? "AQA 7517 Paper 2 — Data structures and algorithms mock" : "Revision block " + (i + 1),
      date: iso(d), time: pick(["09:00", "11:30", "14:00"]), durationMins: 60, subject: pick(["compsci", "maths", "it"]),
      recur: i % 9 === 0 ? "weekly" : "none", alerts: [1440], showInCountdown: i % 4 === 0 }, { id: S.calendar.nextId++ }));
  }
  S.reminders = { v: 2, nextId: 1, migrated: true, items: [], rewardLog: {},
    lists: [{ id: "l1", name: "Study", colour: "" }, { id: "l2", name: "Life admin", colour: "" }] };
  const gate = (norm, rec) => Object.assign(norm(rec, { id: rec.id }), { id: rec.id });
  for (let i = 0; i < 14; i++) S.reminders.items.push(gate(KOS.reminders.normalise, { id: S.reminders.nextId++,
    title: i % 5 === 0 ? "Email the exams officer about the November resit window" : "Reminder " + (i + 1),
    notes: "", done: i % 6 === 0, due: iso(today + ((i % 12) - 4) * DAY), dueTime: "", priority: i % 3,
    listId: i % 2 ? "l1" : "l2", tags: i % 3 === 0 ? ["urgent"] : [], subs: [], recur: "",
    alerts: [], alerted: {}, created: today - i * DAY, updatedAt: today }));
  S.assignments = { v: 1, nextId: 1, items: [] };
  for (let i = 0; i < 8; i++) S.assignments.items.push(gate(KOS.assignments.normalise, { id: S.assignments.nextId++,
    title: i % 4 === 0 ? "NEA — Analysis section: stakeholder interviews and success criteria" : "Assignment " + (i + 1),
    subject: pick(["compsci", "maths", "it"]), type: "coursework", description: "",
    assigned: iso(today - 20 * DAY), due: iso(today + (i - 3) * DAY), dueTime: "23:59",
    status: ["notStarted", "inProgress", "submitted", "complete"][i % 4], progress: (i * 13) % 100,
    priority: i % 3, estimateMins: 180, actualMins: 60, subtasks: [], notes: "", topics: [],
    alerts: [], alerted: {}, showInCalendar: true, showInCountdown: i % 3 === 0,
    created: today - 20 * DAY, updatedAt: today }));
  S.tracker = { nextId: 1, entries: [] };
  for (let i = 0; i < 8; i++) S.tracker.entries.push({ id: S.tracker.nextId++, kind: i % 2 ? "paper" : "exam",
    subject: pick(["compsci", "maths", "it"]), ref: "4.2.3.1", title: "AQA 7517/1 June 2025 — Paper 1",
    date: iso(today - i * 9 * DAY), marks: 40 + (i % 35), outOf: 100, notes: "" });
  S.wishlist = { nextId: 1, budget: { monthlyLimit: 60, currency: "GBP", history: [] }, items: [] };
  for (let i = 0; i < 8; i++) S.wishlist.items.push({ id: S.wishlist.nextId++, module: pick(["books", "vn", "game"]),
    title: i % 5 === 0 ? LONG : "Wishlist title " + (i + 1), coverUrl: "", coverCrop: null,
    price: 8 + (i % 40), currency: "GBP", retailer: "Waterstones", retailerUrl: "", priority: i,
    releaseDate: iso(today + (i - 3) * 5 * DAY),
    status: i % 3 === 0 ? "purchased" : i % 3 === 1 ? "waitingRelease" : "wantToBuy",
    linkedEntryId: null, notes: "", addedAt: today - i * DAY, purchasedAt: i % 3 === 0 ? today - i * DAY : null });
  S.goals = { v: 2, nextId: 1, items: [], completionLedger: {} };
  for (let i = 0; i < 4; i++) S.goals.items.push(KOS.goals.normalise({ id: S.goals.nextId++,
    title: i === 0 ? "Finish every unfinished light novel on the physical shelf" : "Goal " + (i + 1),
    description: "", measure: "completedTitles", target: 10 + i, current: i, status: i === 3 ? "completed" : "active",
    module: ["anime", "books", "vn", "game"][i], notes: "", created: today - i * DAY, deadline: iso(today + 40 * DAY) }));
  KOS.store.flush();

  const rows = [];
  const PLAN = [["anime", 14], ["books", 16], ["vn", 5], ["game", 6]];
  let i = 0;
  for (const [module, count] of PLAN) {
    for (let k = 0; k < count; k++, i++) {
      const owned = module === "books" ? (k % 4 === 0 ? "shelf" : "anilist") : module === "anime" ? "anilist" : module === "vn" ? "vndb" : "manual";
      rows.push({
        module,
        title: i % 7 === 0 ? LONG + " " + (i + 1) : "Collection entry " + (i + 1),
        coverUrl: "",
        status: ["planned", "inProgress", "completed", "onHold", "dropped"][i % 5],
        score: i % 9 === 0 ? 0 : 1 + (i % 10),
        favourite: i % 11 === 0,
        genres: ["Action", "Drama", "Romance", "Mystery"].slice(0, 1 + (i % 3)),
        customLists: i % 6 === 0 ? ["Comfort reads"] : [],
        anilistId: owned === "anilist" ? 90000 + i : undefined,
        vndbId: owned === "vndb" ? "v" + (1000 + i) : undefined,
        syncSource: owned === "anilist" ? "anilist" : owned === "vndb" ? "vndb" : "manual",
        progress: { current: i % 12, total: module === "game" ? null : 12 + (i % 24), unit: module === "game" ? "hr" : "ep" },
        author: module === "books" ? ["Aida Aki", "Oda Gen", "Mori Rei"][k % 3] : "",
        format: module === "books" ? ["manga", "lightNovel"][k % 2] : "",
        playtimeHours: module === "game" ? 5 + i : null,
        physical: module === "books" && owned === "shelf"
          ? { owned: true, volumes: [1, 2, 3].map((v) => ({ number: v, condition: "good", purchaseDate: iso(today - v * DAY), price: 8.99, coverUrl: "", coverCrop: null })) }
          : { owned: false, volumes: [] },
        routes: module === "vn" ? [{ name: "Common route", cleared: true }, { name: "True end", cleared: i % 2 === 0 }] : [],
        notes: i % 8 === 0 ? "A personal note long enough to wrap in the editor." : ""
      });
    }
  }
  await new Promise((r) => KOS.mediadb.bulkUpsert(rows, { source: "manual" }, () => r()));
  await app.settle();
  return { sessions: S.sessions.length, progress: Object.keys(S.progress).length, media: rows.length };
}

module.exports = { seedAccount };
