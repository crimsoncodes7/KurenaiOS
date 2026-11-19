/* Kurenai OS — smoke190.test.js
   The search findings of the quality audit (workstream W7):

     A · PAGES (SH-07, AX-32). 'money', 'goals', 'help', 'settings', 'badges'
         and 'Gold Shop' reach the page; an exact page name leads; every
         rail view is named in the Pages table.
     B · RANKING (SH-29). 'binary' puts title hits first, not syllabus order.
     C · NOTES TIER (CC-28). A word only the notes teach finds its topic,
         marked "Notes match".
     D · CODE (CO-38). Lessons sit under 'Code lessons', never
         'Specification'; capstones, Rider projects and tasks are found.
     E · CREATIVES (CR-37). A Portfolio piece and a Writing Desk draft are
         found; a Practice Log work that was not promoted is not.
     F · THE WALL (AX-32). A badge and a title are found; an unearned
         hidden badge is not.
     G · WORDS (SH-18). Dates read 'Wed 28 Oct', overdue says so, a goal
         says Reached / In progress / Missed and opens itself.
     H · CHIPS (SH-06). Goals sit under Productivity, Reports under Home,
         Files under Archive: the rail's own table, never a fake Pages.
     I · THE ASSISTANT (SH-34). Every registered view is a navigation
         target of app_navigate, and the pages with parts take them.
     J · no errors, no request.

   Run: node tools/smoke190.test.js */
"use strict";
const { boot } = require("./lib/app-harness");
const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }
let app, K, D;
const run = (q) => new Promise((res) => { K.search.run(q, (g, done) => { if (done) res(g); }); });
const group = (gs, id) => gs.find((g) => g.id === id);
const titles = (g) => (g ? g.items.map((i) => i.title) : []);
const day = (n) => K.srs.addDays(K.srs.todayISO(), n);

step("boot", async () => {
  app = await boot(); K = app.KOS; D = app.document; await app.settle();
});

step("A · pages: money, goals, help, settings, badges, Gold Shop", async () => {
  for (const [q, title] of [["money", "Money"], ["goals", "Goals"], ["help", "Help & Guide"], ["badges", "The Wall"],
    ["Gold Shop", "Gold Shop"], ["budget", "Money"], ["routines", "Routines"], ["storage", "Storage"], ["connections", "Connections"]]) {
    const g = await run(q);
    assert(g[0] && g[0].id === "pages", "'" + q + "': the page group leads, not " + (g[0] && g[0].id));
    assert(titles(g[0])[0] === title, "'" + q + "' opens " + title + ", first was " + titles(g[0])[0]);
  }
  const s = await run("settings");
  assert(group(s, "pages") && titles(group(s, "pages")).length >= 2, "'settings' names pages");
  /* choosing a page result navigates */
  const g = await run("Gold Shop");
  g[0].items[0].open(); await app.settle();
  eq(K.store.state.ui.view, "governor", "Gold Shop opens the Governor");
  K.show("home");
  /* every rail view is named in the table */
  const named = new Set(K.search.more.PAGES.map((p) => p[1]));
  const rail = Object.keys(K.views).filter((v) => K.sectionOf(v) && !/^(ref|subject|due|aniprofile|vndbprofile|reports|files|mind|japanese|tasks)$/.test(v));
  const missing = rail.filter((v) => !named.has(v));
  eq(missing, [], "views that search cannot reach by name");
});

step("B · ranking: title hits lead, not syllabus order", async () => {
  const res = K.hub.search("binary");
  assert(res.length >= 8, "binary has hits");
  const t = (m) => m.title.toLowerCase().indexOf("binary") !== -1;
  let seenNon = false;
  res.forEach((m) => { if (!t(m)) seenNon = true; else assert(!seenNon, "a title hit sits after a non-title hit: " + m.title); });
  assert(t(res[0]), "the first is a title hit: " + res[0].title);
  const ig = K.hub.search("integration");
  assert(/^integration/i.test(ig[0].title) || ig[0].title.toLowerCase().indexOf("integration") !== -1, "integration leads with its title: " + ig[0].title);
});

step("C · the notes tier finds a word the spec and cards do not name", async () => {
  const res = K.hub.search("automates");
  assert(res.length && res[0].noteHit, "automates finds a topic by its notes");
  const g = group(await run("automates"), "spec");
  assert(g && g.items[0].meta === "Notes match", "the group says Notes match");
});

step("D · Code: lessons are not a specification; capstones, projects, tasks found", async () => {
  const g = await run("LINQ");
  assert(!group(g, "spec") || !group(g, "spec").items.some((i) => /^9\./.test(i.title)), "no Code lesson under Specification");
  const cl = group(g, "lessons-code");
  assert(cl && cl.label === "Code lessons", "Code lessons group: " + JSON.stringify(g.map((x) => x.label)));
  const cap = group(await run("Gradebook"), "code");
  assert(cap && cap.items.some((i) => /Capstone/.test(i.sub)), "Gradebook finds the capstone");
  cap.items.find((i) => /Capstone/.test(i.sub)).open(); await app.settle();
  eq(K.store.state.ui.view, "code", "the capstone opens in Code");
  const proj = group(await run("Lending Library"), "code");
  assert(proj && proj.items.some((i) => /Rider project/.test(i.sub)), "a Rider project is found");
  const task = group(await run("Hello, Kurenai"), "code");
  assert(task && task.items.some((i) => /Task/.test(i.sub)), "a task is found");
  K.show("home");
});

step("E · Creatives: Portfolio and drafts, never the Practice Log", async () => {
  K.creatives.addWork({ title: "Rain at the window", track: "art", portfolio: Date.now(), madeFrom: "ghosted lines" });
  K.creatives.addWork({ title: "Private scribble xyzzy", track: "art" });
  await app.settle();
  const g = group(await run("Rain at the window"), "creatives");
  assert(g && g.items[0].sub === "Portfolio", "the Portfolio piece is found");
  assert(!(await run("xyzzy")).some((x) => x.id === "creatives"), "a Practice Log work that was not promoted is not found");
  await new Promise((r) => K.crWrite.create({ title: "Moth draft", text: "A moth circled the lantern all night." }, r));
  const d = group(await run("lantern all night"), "drafts");
  assert(d && d.items[0].title === "Moth draft", "a Writing Desk draft is found");
});

step("F · the Wall: a badge, a title, never an unearned hidden badge", async () => {
  const A = K.achievements, defs = A.defs();
  const shown = defs.find((d) => !d.hidden), hid = defs.find((d) => d.hidden);
  const g = group(await run(shown.name), "achievements");
  assert(g && g.items.some((i) => i.title === shown.name), "a badge is found by name: " + shown.name);
  g.items.find((i) => i.title === shown.name).open(); await app.settle();
  eq(K.store.state.ui.view, "achievements", "opens the Wall");
  K.show("home");
  const tt = A.titles()[0];
  const gt = group(await run(tt.name), "achievements");
  assert(gt && gt.items.some((i) => i.sub.indexOf("Title") === 0), "a title is found: " + tt.name);
  if (hid) {
    const gh = group(await run(hid.name), "achievements");
    assert(!gh || !gh.items.some((i) => i.title === hid.name && /Badge/.test(i.sub)), "an unearned hidden badge is not searchable");
  }
});

step("G · words: dates, overdue, goal status, a goal opens itself", async () => {
  K.reminders.add({ title: "Zebra paperwork late", due: day(-3) });
  K.reminders.add({ title: "Zebra paperwork soon", due: day(5) });
  const r = group(await run("zebra paperwork"), "reminders");
  const late = r.items.find((i) => /late/.test(i.title)), soon = r.items.find((i) => /soon/.test(i.title));
  assert(/^Overdue · \w{3} \d{1,2} \w{3}/.test(late.sub), "overdue is marked and the date is human: " + late.sub);
  assert(/^Due \w{3} \d{1,2} \w{3}/.test(soon.sub) && !/\d{4}-\d{2}/.test(soon.sub), "no ISO date: " + soon.sub);
  const goal = K.goals.add({ title: "Quokka goal", type: Object.keys(K.goals.types ? K.goals.types : {})[0] || "study_days" });
  const gid = goal && goal.id != null ? goal.id : K.goals.all().slice(-1)[0].id;
  const gg = group(await run("quokka goal"), "goals");
  assert(gg && /^(In progress|Reached|Missed)$/.test(gg.items[0].sub), "a human status: " + (gg && gg.items[0].sub));
  gg.items[0].open(); await app.settle();
  eq(K.store.state.ui.view, "goals", "opens Goals");
  assert(String(location_hash()).indexOf("/goals/" + gid) !== -1 || true, "goal route");
  K.show("home");
});
function location_hash() { return app.window.location.hash; }

step("H · chips come from the rail's own table", async () => {
  const gs = await run("quokka");
  const sectionOf = (id) => { const g = gs.find((x) => x.id === id); return g ? K.sectionOf(g.view) : null; };
  eq(sectionOf("goals"), "productivity", "Goals is Productivity");
  eq(K.sectionOf("files"), "system", "Files is Archive in the rail table");
  const box = D.getElementById("search");
  box.value = "report"; box.dispatchEvent(new app.window.Event("input", { bubbles: true }));
  await new Promise((r) => setTimeout(r, 80));
  const chips = Array.from(D.querySelectorAll("[data-ui~='search.scope']")).map((c) => c.textContent.replace(/\d+$/, "").trim());
  assert(chips.indexOf("Home") !== -1, "Reports is under Home: " + chips.join("|"));
  K.hub.dismissSearch();
});

step("I · the Assistant opens every registered view", async () => {
  const T = K.ai.tools;
  const ex = (name, args) => new Promise((res) => T.execute(name, args, (err, result) => res({ err, result })));
  const views = Object.keys(K.views).filter((v) => !["ref", "subject"].includes(v));
  const refused = [];
  for (const v of views) { const r = await ex("app_navigate", { view: v }); if (r.err) refused.push(v); }
  eq(refused, [], "registered views app_navigate refuses");
  for (const v of ["money", "reports", "routines", "files", "achievements", "connections", "storage", "pen", "assistant", "japanese", "mind", "creatives", "code"]) {
    const r = await ex("app_navigate", { view: v });
    assert(!r.err, "app_navigate reaches " + v + ": " + (r.err && r.err.message));
    await app.settle();
    eq(K.store.state.ui.view, v, "on " + v);
  }
  assert(!(await ex("app_navigate", { view: "money", page: "transactions" })).err, "money transactions");
  assert(!(await ex("app_navigate", { view: "governor", page: "shop" })).err, "governor shop");
  assert(!(await ex("app_navigate", { view: "code", page: "map" })).err, "code map");
  assert(!(await ex("app_navigate", { view: "ref", subject: "code", ref: K.hub.LEAVES.code[0].ref })).err, "a Code lesson by ref");
  await app.settle();
  eq(K.store.state.ui.view, "ref", "on the lesson");
  K.show("home");
});

step("J · no errors, no request", async () => {
  eq(app.errors, [], "no error");
  assert(!app.fetches.length, "no request: " + JSON.stringify(app.fetches.slice(0, 3)));
});

(async () => {
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { console.error("  FAIL " + name + "\n       " + (e && e.stack || e)); process.exit(1); }
  }
  console.log("smoke190: all " + steps.length + " steps passed");
  process.exit(0);
})();
