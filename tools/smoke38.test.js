/* Kurenai OS — smoke38.test.js
   Collection Goals v2 + Shrine Hall of Fame acceptance gate.

   A · every requested goal class measures the existing local domains
   B · completion receipts are idempotent and never mint a duplicate session
   C · the goal modal/view expose the richer information architecture
   D · Shrine uses one featured #1, a ranked remainder, filters and sort
   E · share cards contain rank/type/score/metadata/message/brand and respect crop

   Run: node tools/smoke38.test.js */
const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const dom = new JSDOM(html, {
  url: "http://localhost/index.html",
  runScripts: "outside-only",
  pretendToBeVisual: true
});
const { window } = dom;
const { document } = window;
const errors = [];
window.addEventListener("error", e => errors.push("window error: " + e.message));
window.requestAnimationFrame = cb => setTimeout(cb, 0);
window.confirm = () => true;
window.__kosAutoConfirm = true;
const { indexedDB, IDBKeyRange } = require("fake-indexeddb");
window.indexedDB = indexedDB;
window.IDBKeyRange = IDBKeyRange;
window.fetch = () => Promise.reject(new Error("network disabled in smoke38"));

let drawImageCalls = [], paintedText = [];
const gradient = { addColorStop() {} };
const context = new Proxy({
  createLinearGradient: () => gradient,
  measureText: text => ({ width: String(text).length * 8 }),
  drawImage: (...args) => drawImageCalls.push(args),
  fillText: text => paintedText.push(String(text))
}, {
  get(target, key) {
    if (key in target) return target[key];
    return () => {};
  },
  set() { return true; }
});
window.HTMLCanvasElement.prototype.getContext = () => context;
window.HTMLCanvasElement.prototype.toDataURL = () => "data:image/png;base64,c21va2UzOA==";
window.HTMLCanvasElement.prototype.toBlob = cb => cb(new window.Blob(["png"], { type: "image/png" }));

for (const match of html.matchAll(/<script src="([^"]+)"><\/script>/g)) {
  try { window.eval(fs.readFileSync(path.join(ROOT, match[1]), "utf8")); }
  catch (err) { errors.push("LOAD FAIL " + match[1] + ": " + err.message); }
}
const KOS = window.KOS;
if (KOS.autosync) KOS.autosync.stop();

const steps = [];
const step = (name, fn) => steps.push([name, fn]);
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const call = fn => new Promise((resolve, reject) => fn((err, value) => err ? reject(err) : resolve(value)));
function assert(ok, message) { if (!ok) throw new Error(message); }
async function waitFor(test, timeout = 4000) {
  const start = Date.now();
  while (!test()) {
    if (Date.now() - start > timeout) throw new Error("timed out");
    await wait(20);
  }
}

let anime, book, game;
console.log("== goal data + automatic measures ==");
step("seed the four-domain Collection data used by automatic goals", async () => {
  await call(cb => KOS.mediadb.open(cb));
  anime = await call(cb => KOS.mediadb.add({
    module: "anime", title: "Violet Archive", status: "completed", score: 9.4,
    favourite: true, genres: ["Drama"], tags: ["Letter"], customLists: ["Essential"],
    progress: { current: 12, total: 12, unit: "ep" }
  }, cb));
  book = await call(cb => KOS.mediadb.add({
    module: "books", title: "The Long Shelf", status: "inProgress", score: 8.8,
    favourite: true, author: "K. Author", genres: ["Drama"],
    progress: { current: 80, total: 100, volumes: 5, totalVolumes: 10, unit: "ch" }
  }, cb));
  game = await call(cb => KOS.mediadb.add({
    module: "game", title: "Clockwork Route", status: "completed", score: 10,
    favourite: true, developer: "Studio Eight", playtimeHours: 45,
    progress: { current: 45, total: 45, unit: "hr" }
  }, cb));
  assert(anime.id && book.id && game.id, "seed entries missing ids");
});

step("the registry includes every requested goal family plus useful automatic extras", () => {
  const ids = KOS.goals.types().map(type => type.id);
  [
    "titles-completed", "episodes-watched", "chapters-read", "volumes-read",
    "specific-title", "finish-series", "filtered-completed", "spend-below",
    "custom-manual", "library-size", "favourites", "purchases", "game-hours",
    "routes-cleared"
  ].forEach(id => assert(ids.includes(id), "missing goal type " + id));
});

step("goal records carry the complete v2 shape", () => {
  const goal = KOS.goals.add({
    title: "Read with intent", description: "A useful description", notes: "Private note",
    type: "custom-manual", target: 4, current: 1,
    startDate: "2026-08-01", deadline: "2026-09-01"
  });
  ["title", "description", "type", "target", "current", "startDate", "deadline",
    "status", "progress", "notes"].forEach(key => assert(Object.prototype.hasOwnProperty.call(goal, key), "missing field " + key));
});

step("automatic goals read totals, progress, linked titles and filters", async () => {
  const ids = {
    titles: KOS.goals.add({ title: "Two finishes", type: "titles-completed", target: 2 }).id,
    episodes: KOS.goals.add({ title: "Ten episodes", type: "episodes-watched", target: 10 }).id,
    chapters: KOS.goals.add({ title: "Read chapters", type: "chapters-read", target: 75 }).id,
    volumes: KOS.goals.add({ title: "Read volumes", type: "volumes-read", target: 4 }).id,
    title: KOS.goals.add({ title: "Finish Violet", type: "specific-title", linkedEntryId: anime.id }).id,
    series: KOS.goals.add({ title: "Finish the shelf", type: "finish-series", linkedEntryId: book.id }).id,
    filter: KOS.goals.add({ title: "Finish Drama", type: "filtered-completed", filterKind: "genre", filterValue: "Drama", target: 1 }).id,
    hours: KOS.goals.add({ title: "Play forty hours", type: "game-hours", target: 40 }).id
  };
  const rows = await call(cb => KOS.goals.compute(cb));
  const byId = id => rows.find(row => row.id === id);
  assert(byId(ids.titles)._current === 2, "completed title count wrong");
  assert(byId(ids.episodes)._current === 12, "episode count wrong");
  assert(byId(ids.chapters)._current === 80, "chapter count wrong");
  assert(byId(ids.volumes)._current === 5, "volume count wrong");
  assert(byId(ids.title)._status === "completed" && /Violet/.test(byId(ids.title)._meta), "specific-title goal wrong");
  assert(byId(ids.series)._current === 80 && byId(ids.series)._target === 100 && byId(ids.series)._status === "active", "series progress wrong");
  assert(byId(ids.filter)._current === 1, "genre-filtered completion wrong");
  assert(byId(ids.hours)._current === 45, "game-hours goal wrong");
});

step("spend-below settles against the planner window without treating budget as progress units", async () => {
  KOS.store.state.wishlist = {
    nextId: 2,
    budget: { monthlyLimit: 100, currency: "£", history: [] },
    items: [{ id: 1, title: "Budget item", module: "books", price: 15, status: "purchased", purchasedAt: Date.now() }]
  };
  const active = KOS.goals.add({
    title: "Keep this month light", type: "spend-below", target: 50,
    startDate: "2020-01-01", deadline: "2099-12-31"
  });
  const settled = KOS.goals.add({
    title: "Historic no-spend month", type: "spend-below", target: 50,
    startDate: "2000-01-01", deadline: "2000-01-31"
  });
  const rows = await call(cb => KOS.goals.compute(cb));
  assert(rows.find(row => row.id === active.id)._current === 15, "current spend wrong");
  assert(rows.find(row => row.id === active.id)._status === "active", "open spending goal settled early");
  assert(rows.find(row => row.id === settled.id)._status === "completed", "past under-cap goal did not settle");
});

console.log("== reward boundary + Goals UI ==");
step("completion receipts are idempotent and never duplicate Governor rewards", async () => {
  const beforeSessions = KOS.store.state.sessions.length;
  const first = JSON.stringify(KOS.store.state.goals.completionLedger);
  await call(cb => KOS.goals.compute(cb));
  const second = JSON.stringify(KOS.store.state.goals.completionLedger);
  await call(cb => KOS.goals.compute(cb));
  const third = JSON.stringify(KOS.store.state.goals.completionLedger);
  assert(first === second && second === third, "completion ledger changed on repeated reads");
  assert(KOS.store.state.sessions.length === beforeSessions, "goal completion minted a second session");
  Object.values(KOS.store.state.goals.completionLedger).forEach(receipt => {
    assert(receipt.payout === "activity-only", "receipt does not preserve activity-only reward law");
  });
});

step("Goals renders summary, status views, useful cards and the integrity statement", async () => {
  KOS.store.state.media.goalsTab = "active";
  KOS.show("goals");
  await waitFor(() => document.querySelector(".goal-overview"));
  const summary = [...document.querySelectorAll(".goal-summary-metric")];
  assert(summary.length && summary.length <= 4, "meaningful summary metrics missing");
  assert(summary.every(node => Number(node.querySelector("b").textContent) > 0), "a zero-value summary metric returned");
  assert(document.querySelectorAll(".goal-tabs .study-tab").length === 3, "status tabs missing");
  assert(document.querySelector(".goal-card-v2"), "useful goal card missing");
  assert(/never duplicates Governor rewards/.test(document.querySelector(".goal-integrity").textContent), "anti-farming rule not explained");
});

step("the create/edit modal is internally structured and full-field", () => {
  KOS.goalEditor(null, () => {});
  const modal = document.querySelector(".goal-modal-v2");
  assert(modal, "goal modal missing");
  const heads = [...modal.querySelectorAll(".goal-form-section-head b")].map(node => node.textContent);
  assert(heads.join("|") === "Identity|Measure|Schedule|Notes", "modal sections wrong: " + heads.join("|"));
  assert(modal.querySelector(".goal-editor-body"), "internal scrolling body missing");
  assert(modal.querySelector(".goal-modal-foot"), "separate action rail missing");
  modal.closest(".modal-ov").close();
});

step("goals and the anti-farming ledger ride the normal state backup", () => {
  /* exportJSON serialises this exact state object before handing the blob to
     the browser download API; keeping the assertion DOM-only avoids teaching
     jsdom how to manufacture object URLs. */
  const state = JSON.parse(JSON.stringify(KOS.store.state));
  assert(state.goals && state.goals.v === 2, "goal schema absent from backup");
  assert(state.goals.completionLedger && Object.keys(state.goals.completionLedger).length, "completion ledger absent from backup");
});

console.log("== Shrine Hall of Fame + share card ==");
step("Shrine renders a featured #1 and a smaller ranked remainder", async () => {
  KOS.store.state.media.shrine = { module: "", sort: "score", description: "Only the works I would defend." };
  KOS.show("shrine");
  await waitFor(() => document.querySelector(".shrine-feature"));
  assert(/Clockwork Route/.test(document.querySelector(".shrine-feature").textContent), "score-sorted #1 is wrong");
  assert(/Rank 01/.test(document.querySelector(".shrine-feature-rank").textContent), "featured rank unclear");
  assert(document.querySelectorAll(".shrine-ranked-grid .shrine-rank-card").length === 2, "ranked remainder wrong");
  assert(document.querySelector(".shrine-stage .shrine-ledger"), "Hall ledger is not beside rank one");
  assert(document.querySelectorAll(".shrine-ledger-lines .shrine-ledger-line").length === 3, "Hall statistics missing");
  assert(document.querySelector(".shrine-feature.wl-hero.wl-hero-feature .wl-hero-body"), "rank one does not share the Budget Planner hero structure");
  assert(document.querySelectorAll(".shrine-rank-card .shrine-row-foot").length === 2, "ranked cards lack score/action footers");
  assert(document.querySelectorAll(".shrine-filter").length === 5, "media-type filters missing");
  assert(document.querySelector(".shrine-sort select"), "sort control missing");
  assert(/Only the works/.test(document.querySelector(".shrine-description").textContent), "optional hall note missing");
});

step("a single-item filtered wing keeps the featured layout without an empty grid", async () => {
  const gameFilter = [...document.querySelectorAll(".shrine-filter")].find(button => button.textContent === "Games");
  gameFilter.click();
  await waitFor(() => document.querySelector(".shrine-hall.one"));
  assert(document.querySelector(".shrine-feature"), "single item was not featured");
  assert(!document.querySelector(".shrine-ranked-grid"), "single item left an empty ranked grid");
});

step("share renderer includes identity fields and applies stored crop metadata", () => {
  paintedText = [];
  drawImageCalls = [];
  const entry = Object.assign({}, anime, { coverCrop: { x: 100, y: 0, zoom: 2 } });
  const image = { naturalWidth: 1000, naturalHeight: 1500 };
  const template = { naturalWidth: 1536, naturalHeight: 1024 };
  let rendered = null;
  KOS.shrineRenderCard(entry, image, 3, "A small message with meaning.", canvas => { rendered = canvas; }, template);
  assert(rendered && rendered.width === 1536 && rendered.height === 1024, "share card geometry wrong");
  const allText = paintedText.join(" | ");
  ["KURENAI · PRIVATE HALL", "RANK", "03", "ANIME · PERSONAL ARCHIVE", "Violet Archive",
    "PERSONAL SCORE / 10", "EPISODES", "A small message with meaning.", "CURATED IN KURENAIOS · PERSONAL COLLECTION"]
    .forEach(value => assert(allText.includes(value), "share card missing " + value));
  assert(drawImageCalls.some(args => args.length === 5 && args[0] === template), "ceremonial template was not painted");
  const coverDraw = drawImageCalls.find(args => args.length === 9);
  assert(coverDraw, "cover was not drawn");
  assert(coverDraw[1] > 0 && coverDraw[2] === 0, "stored crop focal point was ignored");
  [
    "assets/shrine/private-hall-template-v1.png",
    "assets/shrine/fonts/CormorantGaramond-Variable.ttf",
    "assets/shrine/fonts/CormorantGaramond-Italic-Variable.ttf",
    "assets/shrine/fonts/Cinzel-Variable.ttf"
  ].forEach(file => assert(fs.existsSync(path.join(ROOT, file)), "bundled share-card asset missing: " + file));
});

step("share modal starts with a useful default message", async () => {
  KOS.shrineCard(Object.assign({}, game, { coverUrl: "" }), 1);
  await waitFor(() => document.querySelector(".shrine-message"));
  const value = document.querySelector(".shrine-message").value;
  assert(/Clockwork Route/.test(value) && /Hall of Fame/.test(value), "default share message is not useful");
  document.querySelector(".shrine-card-modal").closest(".modal-ov").close();
});

(async () => {
  for (const [name, fn] of steps) {
    try {
      await fn();
      console.log("  ok  " + name);
    } catch (err) {
      errors.push('STEP "' + name + '": ' + err.stack.split("\n").slice(0, 2).join(" | "));
      console.log("FAIL  " + name);
    }
  }
  if (errors.length) {
    console.error("\n" + errors.join("\n"));
    process.exit(1);
  }
  console.log("\nSMOKE38 PASS — Collection Goals v2 and Shrine Hall of Fame verified (" + steps.length + " steps).");
  process.exit(0);
})();
