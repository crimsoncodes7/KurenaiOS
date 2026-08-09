/* KurenaiOS — tools/responsive_audit.mjs (Category 7 Phase B)

   The Phase A lesson, made permanent: an EMPTY account hides most layout
   failures. GOV-1 survived a whole phase because it was measured against a
   store with nothing in it, where the Governor seat happens to fit.

   This harness therefore does three things phone_overflow.mjs does not:

     1. SEEDS a dense, realistic account first (--seed) — ~1,900 collection
        entries with real cover PNGs and long titles, 600 sessions, 120
        progress records, a full calendar, reminders, assignments, a budget
        planner and goals. Long titles and dense lists are deliberate.
     2. Sweeps a WIDTH LIST rather than one phone width, so a breakpoint
        change is measured on both sides of every tier it moves.
     3. Sweeps THEMES, so a change that only holds on the default palette
        is caught.

   It reports, per view × width × theme: elements whose right edge is past
   the viewport, text amputated by a hidden-overflow box, the bottom tab
   bar's overlap with the last content row, and (optionally) a screenshot.
   Output is written as JSON so two runs can be diffed — which is how a
   consolidation is proved not to have regressed anything.

   Start these two first:
     python3 -m http.server 8765
     "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
       --headless=new --remote-debugging-port=9222 \
       --user-data-dir=/tmp/kos-cat7b http://127.0.0.1:8765/index.html

   Then:
     node tools/responsive_audit.mjs --seed              # seed, then measure
     node tools/responsive_audit.mjs                     # measure only
     node tools/responsive_audit.mjs --out before.json
     node tools/responsive_audit.mjs --diff before.json  # compare with a baseline
     node tools/responsive_audit.mjs --shots /tmp/kos-shots
     node tools/responsive_audit.mjs --widths 390,820 --views home,subject  */

import { writeFile, readFile, mkdir } from "node:fs/promises";

/* ---------------- CLI ---------------- */
const argv = process.argv.slice(2);
const flag = (name, fallback = null) => {
  const i = argv.indexOf("--" + name);
  return i === -1 ? fallback : (argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : true);
};
const DO_SEED = argv.includes("--seed");
const OUT = flag("out", null);
const DIFF = flag("diff", null);
const SHOTS = flag("shots", null);
const WIDTHS = String(flag("widths", "1920,1440,820,390")).split(",").map(Number);
const THEMES = String(flag("themes", "atelier-dawn,atelier-dusk")).split(",");
const VIEWS = String(flag("views",
  "home,subject,ref,review,assignments,tracker,focus,reminders,calendar,tasks," +
  "matrix,anime,books,vn,game,mangaka,shrine,wishlist,goals,mediasync," +
  "governor,assistant,data,help")).split(",");

/* ---------------- CDP plumbing ---------------- */
const endpoint = process.env.KOS_CDP || "http://127.0.0.1:9222/json";
const pages = await fetch(endpoint).then(r => r.json());
const page = pages.find(p => p.type === "page" && /127\.0\.0\.1:8765/.test(p.url)) || pages.find(p => p.type === "page");
if (!page) throw new Error("No debuggable KurenaiOS page found.");

const ws = new WebSocket(page.webSocketDebuggerUrl);
const pending = new Map();
let seq = 0;
await new Promise((res, rej) => { ws.addEventListener("open", res, { once: true }); ws.addEventListener("error", rej, { once: true }); });
ws.addEventListener("message", ev => {
  const msg = JSON.parse(String(ev.data));
  if (msg.id && pending.has(msg.id)) {
    const { res, rej } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? rej(new Error(msg.error.message)) : res(msg.result || {});
  }
});
const send = (method, params = {}) => new Promise((res, rej) => {
  const id = ++seq;
  pending.set(id, { res, rej });
  ws.send(JSON.stringify({ id, method, params }));
});
async function evaluate(expression) {
  const out = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true, userGesture: true });
  if (out.exceptionDetails) throw new Error(out.exceptionDetails.exception?.description || out.exceptionDetails.text);
  return out.result?.value;
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* The service worker precaches the shell and serves statics
   stale-while-revalidate — without this a run measures the CSS from before
   the edit you are trying to check. */
async function clearWorker() {
  await evaluate(`(async () => {
    if (!navigator.serviceWorker) return "none";
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map(r => r.unregister()));
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
    return regs.length + " reg / " + keys.length + " cache";
  })()`).catch(() => "n/a");
}
async function bootWait() {
  for (let i = 0; i < 90; i++) {
    await sleep(400);
    const ok = await evaluate("document.readyState === 'complete' && typeof window.KOS === 'object' && !!KOS.show && !!KOS.store && !!KOS.mediadb").catch(() => false);
    if (ok) return true;
  }
  return false;
}

await send("Page.enable");
await clearWorker();
await send("Page.reload", { ignoreCache: true });
if (!await bootWait()) throw new Error("app did not boot");
await sleep(1200);

/* ---------------- density seeding ----------------
   Realistic, not synthetic-pretty: long titles that wrap, entries with no
   cover at all, unrated scores, a mature Governor, a calendar with
   overlapping days. Uses the app's own repository images so real <img>
   loading, aspect ratios and the crop pipeline are exercised.            */
const SEED = String.raw`(async () => {
  const S = KOS.store.state;
  const iso = d => new Date(d).toISOString().slice(0, 10);
  const DAY = 86400000;
  const today = Date.parse(new Date().toISOString().slice(0, 10) + "T09:00:00Z");
  const ART = ["/icons/icon-512.png", "/icons/icon-192.png", "/icons/apple-touch-icon.png",
               "/assets/assistant/mascot/portrait/kurenai-idle.png",
               "/assets/assistant/mascot/portrait/kurenai-thinking.png"];
  const LONG = "The Extraordinarily Long Light-Novel Title That Explains Its Entire Premise In One Breath, Volume 12";
  const rnd = (n => () => (n = (n * 1664525 + 1013904223) >>> 0) / 4294967296)(20260808);
  const pick = a => a[Math.floor(rnd() * a.length)];

  /* ---- Governor: a mature account ---- */
  S.governor.xp = 71802; S.governor.gold = 12476; S.governor.hp = 74;
  S.governor.owned = ["theme:atelier-dusk", "theme:celestial-duality", "seal:kurenai", "frame:brass"];
  S.governor.avatar = { kind: "img", id: "", img: ART[3], crop: { x: 50, y: 34, zoom: 1.2 }, frame: "brass" };
  S.governor.bannerImg = ART[0];
  S.governor.bannerCrop = { x: 50, y: 40, zoom: 1.1 };

  /* ---- sessions: 600 over 140 days ---- */
  const kinds = ["flashcards", "quiz", "notes", "exam", "focus", "media", "tracker", "reading"];
  S.sessions = [];
  for (let i = 0; i < 600; i++) {
    const t = today - Math.floor(rnd() * 140) * DAY - Math.floor(rnd() * 8) * 3600000;
    const type = pick(kinds);
    S.sessions.push({ id: i + 1, ts: t, date: iso(t), type,
      subject: pick(["compsci", "maths", "it"]), ref: "4.5.4.2",
      dur: 300 + Math.floor(rnd() * 2400),
      metrics: { complete: rnd() > .12, module: type === "media" ? pick(["anime","books","vn","game"]) : undefined } });
  }
  S.sessions.sort((a, b) => a.ts - b.ts);

  /* ---- progress: 120 real records, some completed, some with notes ----
     The status vocabulary is none|started|paused|done (js/modules/hub.js).
     This seeder used to write "completed", which is not a status the app
     knows — so every study surface read 0 secure on a "dense" account and
     the subject desk was measured with its primary figure blank. */
  const refs = [];
  Object.keys(window.KOS_DATA || {}).forEach(sid => {
    const walk = n => { if (!n) return; if (n.content && n.content.length) refs.push(sid + ":" + n.ref);
      (n.children || []).forEach(walk); };
    ((window.KOS_DATA[sid] || {}).sections || []).forEach(walk);
  });
  S.progress = S.progress || {};
  refs.slice(0, 120).forEach((k, i) => {
    S.progress[k] = { status: i % 5 === 0 ? "done" : i % 3 === 0 ? "started" : i % 7 === 0 ? "paused" : "none",
      check: [i % 2 === 0, i % 3 === 0, i % 4 === 0, i % 5 === 0],
      rag: i % 4 === 0 ? ["r", "a", "g"][i % 3] : null,
      note: i % 7 === 0 ? "Revisit the worked example — the exam mark scheme wants the justification written out in full, not just the final value." : "" };
  });
  S.study = S.study || {};
  S.study.fc = S.study.fc || {}; S.study.quiz = S.study.quiz || {};
  refs.slice(0, 60).forEach((k, i) => {
    S.study.fc[k] = { seen: 20 + i, right: 12 + i, wrong: 8 };
    S.study.quiz[k] = { attempts: 3, best: 40 + (i % 55), lastPct: 30 + (i % 60) };
  });
  /* SM-2 metadata so the study inspector, "cards due" and the review queue
     read like a used account rather than a fresh install */
  S.srs = S.srs || {};
  refs.slice(0, 60).forEach((k, i) => {
    (KOS.srs.cardsFor(k.split(":")[0], k.split(":").slice(1).join(":")) || []).forEach((c, j) => {
      if ((i + j) % 3 === 2) return;
      S.srs[c.key] = { ef: 1.9 + ((i + j) % 12) / 10, ivl: 1 + ((i + j) % 21),
        reps: 1 + ((i + j) % 9), due: iso(today + (((i + j) % 11) - 4) * DAY),
        last: iso(today - (1 + ((i + j) % 9)) * DAY), views: 2 + ((i + j) % 14),
        lapses: (i + j) % 5 === 0 ? 1 + ((i + j) % 3) : 0, lastRating: (i + j) % 4 };
    });
  });
  /* a handful of user-authored cards so the personal/custom paths render */
  S.custom = S.custom || { nextId: 1, cards: [] };
  refs.slice(0, 6).forEach((k, i) => {
    S.custom.cards.push({ id: S.custom.nextId++, sid: k.split(":")[0], ref: k.split(":").slice(1).join(":"),
      q: "Custom card " + (i + 1) + " — state the definition the mark scheme rewards",
      a: "The full wording, written out at length so the card face has to wrap onto several lines." });
  });

  /* ---- calendar: dense weeks, long titles, recurrence ---- */
  S.calendar = { v: 2, nextId: 1, seeded: true, events: [], notified: {} };
  const evTypes = ["exam", "deadline", "study", "other"];
  for (let i = 0; i < 46; i++) {
    const d = today + (Math.floor(rnd() * 60) - 25) * DAY;
    S.calendar.events.push({ id: S.calendar.nextId++, type: pick(evTypes),
      title: i % 6 === 0 ? "AQA 7517 Paper 2 — Data structures, algorithms and the theory of computation mock" : "Revision block " + (i + 1),
      date: iso(d), time: pick(["09:00", "11:30", "14:00", "16:45"]), dur: 60,
      subject: pick(["compsci", "maths", "it"]), colour: "", recur: i % 9 === 0 ? "weekly" : "",
      alerts: [1440], alerted: {}, showInCountdown: i % 4 === 0, notes: "" });
  }

  /* ---- reminders, assignments, tracker ---- */
  S.reminders = { v: 2, nextId: 1, migrated: true, items: [], lists: [
    { id: "l1", name: "Study", colour: "" }, { id: "l2", name: "Life admin", colour: "" }], rewardLog: {} };
  for (let i = 0; i < 34; i++) S.reminders.items.push({ id: S.reminders.nextId++,
    title: i % 5 === 0 ? "Email the exams officer about the certificate replacement and the November resit window" : "Reminder " + (i + 1),
    notes: "", done: i % 6 === 0, due: iso(today + (i % 20 - 5) * DAY), dueTime: "", priority: i % 3,
    listId: i % 2 ? "l1" : "l2", tags: i % 3 === 0 ? ["urgent"] : [], subs: [], recur: "",
    alerts: [], alerted: {}, created: today - i * DAY, updatedAt: today });
  S.assignments = { v: 1, nextId: 1, items: [] };
  for (let i = 0; i < 16; i++) S.assignments.items.push({ id: S.assignments.nextId++,
    title: i % 4 === 0 ? "NEA — Analysis section: stakeholder interviews, success criteria and the justification of the chosen approach" : "Assignment " + (i + 1),
    subject: pick(["compsci", "maths", "it"]), type: "coursework", description: "",
    assigned: iso(today - 20 * DAY), due: iso(today + (i - 4) * DAY), dueTime: "23:59",
    status: pick(["notStarted", "inProgress", "submitted", "complete"]), progress: (i * 7) % 100,
    priority: i % 3, estimateMins: 180, actualMins: 60, subtasks: [], notes: "", topics: [],
    alerts: [], alerted: {}, showInCalendar: true, showInCountdown: i % 3 === 0,
    created: today - 20 * DAY, updatedAt: today });
  S.tracker = { nextId: 1, entries: [] };
  for (let i = 0; i < 22; i++) S.tracker.entries.push({ id: S.tracker.nextId++, kind: i % 2 ? "paper" : "exam",
    subject: pick(["compsci", "maths", "it"]), ref: "4.5.4.2",
    title: "AQA 7517/1 June 2025 — Paper 1 (on-screen)", date: iso(today - i * 9 * DAY),
    marks: 40 + (i % 35), outOf: 100, notes: "" });

  /* ---- budget planner + goals ---- */
  S.wishlist = { nextId: 1, budget: { monthlyLimit: 60, currency: "GBP", history: [] }, items: [] };
  for (let i = 0; i < 19; i++) S.wishlist.items.push({ id: S.wishlist.nextId++,
    module: pick(["books", "vn", "game"]),
    title: i % 5 === 0 ? LONG : "Wishlist title " + (i + 1),
    coverUrl: i % 4 === 3 ? "" : pick(ART), coverCrop: { x: 50, y: 42, zoom: 1.1 },
    price: 8 + (i % 40), currency: "GBP", retailer: "Waterstones", retailerUrl: "",
    priority: i, releaseDate: iso(today + (i - 6) * 5 * DAY),
    status: i % 3 === 0 ? "purchased" : i % 3 === 1 ? "waitingRelease" : "wantToBuy",
    linkedEntryId: null, notes: "", addedAt: today - i * DAY,
    purchasedAt: i % 3 === 0 ? today - i * DAY : null });
  S.goals = { v: 2, nextId: 1, items: [], completionLedger: {} };
  for (let i = 0; i < 9; i++) S.goals.items.push({ id: S.goals.nextId++,
    title: i % 3 === 0 ? "Finish every unfinished light novel currently sitting on the physical shelf" : "Goal " + (i + 1),
    description: "", measure: "completedTitles", target: 10 + i, current: i, status: i % 4 === 0 ? "completed" : "active",
    module: pick(["anime", "books", "vn", "game"]), notes: "", created: today - i * DAY, deadline: iso(today + 40 * DAY) });

  KOS.store.save();

  /* ---- media vault: the REAL account's shape, not a token sample ----
     Category 7 Phase D. The seeder used to write 460 entries on a flat
     4-way module rotation with 40 author names — which is not the library
     the audit measured, and not the one the vault views have to survive.
     The real account is 692 anime · 1,107 book series · 11 VNs · 70 games,
     with 882 distinct authors and a genre facet carrying 64 mixed
     genre-and-tag values. Mangaka's whole failure mode (MNG-1) only exists
     above ~800 authors, and the vault toolbars only look cluttered once
     the facets are full. Seed the real shape.                            */
  const SURNAMES = ["Aida","Arakawa","Asano","Endo","Fujimoto","Furudate","Hara","Hirano","Horikoshi",
    "Ichikawa","Inoue","Isayama","Ito","Kamome","Kishimoto","Kubo","Maruyama","Matsumoto","Mizukami",
    "Mori","Nagabe","Nakamura","Nihei","Oda","Ohba","Okada","Ono","Otomo","Sakurai","Sato","Shiina",
    "Sonoda","Sugimoto","Takahashi","Tanaka","Tatsuki","Toriyama","Tsutsui","Urasawa","Watase","Yamada",
    "Yazawa","Yokoyama","Yoshida","Zaiya"];
  const GIVEN = ["Aki","Chika","Daisuke","Eri","Fumi","Gen","Haruko","Isamu","Junji","Kaori","Kenji",
    "Mari","Naoki","Rei","Sana","Taku","Umi","Yuki","Zen","Ayame"];
  /* 882 distinct author strings, a couple deliberately very long */
  const AUTHORS = [];
  for (let s = 0; s < SURNAMES.length; s++) {
    for (let g = 0; g < GIVEN.length; g++) {
      AUTHORS.push(SURNAMES[s] + " " + GIVEN[g]);
      if (AUTHORS.length >= 882) break;
    }
    if (AUTHORS.length >= 882) break;
  }
  AUTHORS[7] = "A Very Long Mangaka Name That Refuses To Wrap Politely, With A Studio Credit Attached";
  /* the 64-value genre facet the audit found: real genres plus VNDB-style
     tags, most of which occur once or twice */
  const GENRES = ["Action","Adventure","Comedy","Drama","Fantasy","Horror","Mecha","Mystery",
    "Psychological","Romance","Sci-Fi","Slice of Life","Sports","Supernatural","Thriller"];
  const TAGS = [];
  for (let t = 0; t < 49; t++) TAGS.push("Protagonist with a Tragic Past " + (t + 1));
  const FACET = GENRES.concat(TAGS);
  const PLAN = [["anime", 692], ["books", 1107], ["vn", 11], ["game", 70]];

  const existing = await new Promise(r => KOS.mediadb.count(null, (e, n) => r(n || 0)));
  if (existing < 1800) {
    const rows = [];
    let i = 0;
    for (const [module, count] of PLAN) {
      for (let k = 0; k < count; k++, i++) {
        const long = i % 7 === 0;
        /* author distribution is Zipf-ish: a few prolific names, a long
           tail of one-work authors — which is what makes an A–Z rail and a
           "≥ N works" filter worth having */
        const authorIx = module === "books"
          ? (k % 5 === 0 ? k % 40 : Math.min(AUTHORS.length - 1, 40 + Math.floor(k / 1.3)))
          : -1;
        rows.push({
          module,
          title: long ? LONG + " " + (i + 1) : "Collection entry " + (i + 1),
          coverUrl: i % 6 === 5 ? "" : ART[i % ART.length],
          coverCrop: { x: 50, y: 38, zoom: 1.15 },
          status: ["planned", "inProgress", "completed", "onHold", "dropped"][i % 5],
          score: i % 9 === 0 ? 0 : 1 + (i % 10),
          favourite: i % 23 === 0,
          genres: [FACET[i % FACET.length], FACET[(i * 7) % FACET.length], FACET[(i * 13) % FACET.length]]
            .slice(0, 1 + (i % 3)),
          customLists: i % 11 === 0 ? ["—— ☆ ——"] : (i % 17 === 0 ? ["Comfort reads"] : []),
          syncSource: module === "game" ? "manual" : (i % 3 === 0 ? "manual" : "anilist"),
          progress: { current: i % 40, total: module === "game" ? null : 40 + (i % 60), unit: module === "game" ? "hr" : "ep" },
          author: authorIx >= 0 ? AUTHORS[authorIx % AUTHORS.length] : "",
          format: module === "books" ? ["manga", "lightNovel", "oneShot"][i % 3] : "",
          playtimeHours: module === "game" ? (i % 90) : null,
          physical: module === "books" && k % 5 === 0
            ? { owned: true, volumes: Array.from({ length: 3 + (k % 5) }, (_, v) => ({ number: v + 1, condition: "good", purchaseDate: iso(today - v * DAY), price: 8.99, coverUrl: ART[v % ART.length], coverCrop: null })) }
            : { owned: false, volumes: [] },
          routes: module === "vn" ? [{ name: "Common route", cleared: true }, { name: "True end", cleared: i % 2 === 0 }] : [],
          notes: i % 8 === 0 ? "A long personal note about this entry that keeps going for a while so the editor has to wrap it properly." : ""
        });
      }
    }
    /* bulkUpsert in slices — one 1,880-row transaction is a very different
       thing from the app's own sync batches and can time the store out */
    for (let s = 0; s < rows.length; s += 250) {
      const slice = rows.slice(s, s + 250);
      await new Promise(r => KOS.mediadb.bulkUpsert(slice, { source: "manual" }, () => r()));
    }
    /* ONLY anime gets a banner — that is the real situation (AniList is the
       only provider that exposes one) and it is exactly the asymmetry the
       audit's VLT-4 describes. Seeding all four hid it. */
    await new Promise(r => KOS.mediadb.setKV("hero.anime", { entryId: null, banner: ART[0], crop: { x: 50, y: 45, zoom: 1.2 } }, () => r()));
  }
  const n = await new Promise(r => KOS.mediadb.count(null, (e, c) => r(c || 0)));
  /* store.save() is debounced 120ms and the harness reloads the page the
     moment this resolves — on a re-seed (media already present, no awaits
     above to burn the timer) the whole localStorage half of the seed was
     lost, and every "dense account" measurement after it ran against a
     default store. flush() writes through synchronously. */
  KOS.store.flush();
  const authors = await new Promise(r => KOS.mediadb.query({ module: "books" }, (e, rs) => {
    const set = {};
    (rs || []).forEach(x => { if ((x.author || "").trim()) set[x.author.trim()] = 1; });
    r(Object.keys(set).length);
  }));
  return { sessions: S.sessions.length, progress: Object.keys(S.progress).length,
    media: n, authors: authors,
    secure: Object.values(S.progress).filter(p => p.status === "done").length };
})()`;

if (DO_SEED) {
  const info = await evaluate(SEED);
  console.log("seeded:", JSON.stringify(info));
  await send("Page.reload", { ignoreCache: true });
  if (!await bootWait()) throw new Error("app did not boot after seeding");
  await sleep(1500);
}

/* ---------------- the probe ----------------
   A box whose right edge is past the viewport is a failure whichever way it
   got there: #app is overflow-hidden so it is simply gone, and an ancestor
   with overflow-x:auto only converts it into a sideways scroll nobody
   discovers. The one honest exception is decoration — a negative-z layer
   with no text and nothing to click cannot be unreachable content.        */
const PROBE = String.raw`(() => {
  const vw = window.innerWidth;
  const out = [], cut = [];
  const label = n => n.tagName.toLowerCase() + (n.className && typeof n.className === "string"
    ? "." + n.className.trim().split(/\s+/).slice(0, 3).join(".") : "");
  const decorative = n => {
    if (+getComputedStyle(n).zIndex >= 0) return false;
    if ((n.textContent || "").trim()) return false;
    return !n.querySelector("a, button, input, select, textarea, [tabindex]");
  };
  /* A DECLARED horizontal scroller is not amputated content. [data-scroller]
     is set only by KOS.ui.scroller, which guarantees edge fades, arrow
     controls and arrow-key access — so the content past the edge is
     reachable and says so. A bare overflow-x:auto still fails: that is the
     sideways scroll nobody discovers (audit SUBJ-3/MTX-1). */
  const declaredScroll = n => !!(n.closest && n.closest("[data-scroller]"));
  document.querySelectorAll("#app *").forEach(n => {
    const s = getComputedStyle(n);
    if (s.display === "none" || s.visibility === "hidden" || +s.opacity === 0) return;
    const r = n.getBoundingClientRect();
    if (!r.width || !r.height) return;
    if (r.right > vw + 0.5 && !decorative(n) && !declaredScroll(n)) out.push({ sel: label(n), over: Math.round(r.right - vw), w: Math.round(r.width) });
    const text = (n.textContent || "").trim();
    if (text && n.children.length === 0 && /hidden|clip/.test(s.overflowX)
        && !n.classList.contains("sr-only")
        && n.scrollWidth > n.clientWidth + 1 && s.textOverflow !== "ellipsis") {
      cut.push({ sel: label(n), lost: n.scrollWidth - n.clientWidth, text: text.slice(0, 40) });
    }
  });
  out.sort((a, b) => b.over - a.over);
  cut.sort((a, b) => b.lost - a.lost);
  const main = document.getElementById("main");
  const rail = document.getElementById("rail");
  const rr = rail ? rail.getBoundingClientRect() : null;
  let overlap = null;
  if (main && rr && rr.top > window.innerHeight / 2) {
    main.scrollTop = main.scrollHeight;
    const kids = [...main.children];
    const last = kids[kids.length - 1];
    if (last) overlap = Math.round(Math.max(0, last.getBoundingClientRect().bottom - rr.top));
    main.scrollTop = 0;
  }
  return { vw, docScrollWidth: document.documentElement.scrollWidth,
           mainScrollHeight: main ? main.scrollHeight : 0,
           nodes: document.querySelectorAll("#main *").length,
           overlap, count: out.length, worst: out.slice(0, 5),
           cutCount: cut.length, cutWorst: cut.slice(0, 4) };
})()`;

/* ---------------- sweep ---------------- */
if (SHOTS) await mkdir(SHOTS, { recursive: true });
const results = {};
let totalOver = 0, totalCut = 0;

for (const theme of THEMES) {
  await evaluate(`(() => { KOS.store.state.governor.theme = ${JSON.stringify(theme)};
    if (KOS.governor.applyCosmetics) KOS.governor.applyCosmetics();
    document.documentElement.setAttribute("data-theme", ${JSON.stringify(theme)}); return true; })()`);
  for (const width of WIDTHS) {
    await send("Emulation.setDeviceMetricsOverride",
      { width, height: width <= 700 ? 844 : 1000, deviceScaleFactor: 1, mobile: width <= 700 });
    await sleep(250);
    for (const view of VIEWS) {
      const arg = view === "subject" ? '"compsci"'
        : view === "ref" ? '{subject:"compsci",ref:(KOS.store.state.ui.lastRef||"4.5.4.2")}' : "";
      try {
        await evaluate(`KOS.show(${JSON.stringify(view)}${arg ? ", " + arg : ""})`);
      } catch (e) { continue; }
      await sleep(view === "mangaka" || view === "matrix" ? 900 : 420);
      let r;
      try { r = await evaluate(PROBE); } catch (e) { continue; }
      const key = `${theme}|${width}|${view}`;
      results[key] = r;
      totalOver += r.count; totalCut += r.cutCount;
      if (r.count || r.cutCount || r.overlap) {
        console.log(`${theme.padEnd(14)} ${String(width).padStart(4)}  ${view.padEnd(12)}`
          + ` spill ${String(r.count).padStart(3)}  cut ${String(r.cutCount).padStart(3)}`
          + (r.overlap ? `  tab-bar overlap ${r.overlap}px` : ""));
        r.worst.forEach(w => console.log(`      +${w.over}px  ${w.sel}  (w ${w.w})`));
        r.cutWorst.forEach(c => console.log(`      cut -${c.lost}px  ${c.sel}  "${c.text}"`));
      }
      if (SHOTS) {
        const shot = await send("Page.captureScreenshot", { format: "jpeg", quality: 72 });
        await writeFile(`${SHOTS}/${width}-${theme}-${view}.jpg`, Buffer.from(shot.data, "base64"));
      }
    }
  }
}

console.log(`\n=== ${Object.keys(results).length} cells · ${totalOver} overflowing element(s) · ${totalCut} amputated text node(s) ===`);

if (OUT) { await writeFile(OUT, JSON.stringify(results, null, 1)); console.log("wrote " + OUT); }

if (DIFF) {
  const base = JSON.parse(await readFile(DIFF, "utf8"));
  let worse = 0, better = 0;
  for (const key of new Set([...Object.keys(base), ...Object.keys(results)])) {
    const a = base[key] || { count: 0, cutCount: 0 }, b = results[key] || { count: 0, cutCount: 0 };
    const d = (b.count - a.count) + (b.cutCount - a.cutCount);
    if (d > 0) { worse++; console.log(`WORSE  ${key}  spill ${a.count}→${b.count}  cut ${a.cutCount}→${b.cutCount}`); }
    else if (d < 0) { better++; console.log(`better ${key}  spill ${a.count}→${b.count}  cut ${a.cutCount}→${b.cutCount}`); }
  }
  console.log(`\ndiff vs ${DIFF}: ${worse} worse, ${better} better`);
}

ws.close();
