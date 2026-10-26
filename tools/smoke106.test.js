/* Kurenai OS — smoke106.test.js
   Files R1–R4 (docs/files-plan.md revision 2, invariants 150–153), airing
   and release days on a closed app, Rider evidence from GitHub CI, and
   habits several times a day.

   The claims:

     A · ONE FILE, MANY LINKS (150): a file added twice (one SHA-256) is
         linked, not stored again; it keeps its name, the new name joins
         `aliases`; a link adds a place, removing one never deletes the
         file while another link uses it; a topic's Files tab lists a file
         linked there; kind only moves up on a match.
     B · THE INDEX: KOS.files reads both stores into one list; linkedTo,
         the text queue (a text file is indexed in the background), and
         search finds a name, an alias and text inside a file; freeing
         space removes the binary only — the record and its text stay.
     C · THE PAGES only read when drawn: Files and Storage render, the
         filters work, and drawing writes nothing to the state document.
     D · THE SCAN's warp is a true homography: the four photo corners map
         to the page's corners, and a point inside maps inside.
     E · A CLOSED APP: the outlook forecasts the next episode (`air:`) and
         a Wishlist release day (`wish:`, 09:00) under the ledger's own
         ids, publishes the watched AniList ids (left out when muted); the
         runner's airingItems turns AniList's schedule into the same ids,
         dropped in quiet hours.
     F · CI EVIDENCE (invariant 109): the workflow is an allowed path and
         runs the validator; ciReport reads the latest "Kurenai · <id>"
         check run and returns its report text, and says why when it
         can't (Checks: read); apply({level: "ci"}) records ◆ CI-verified
         and a milestone shows the strongest evidence that passed it.
     G · SEVERAL TIMES A DAY: a habit with times has a step per time, the
         day is kept (and pays) only once every time is ticked, a reminder
         per time not yet ticked, and clearing the times gives one step.
     H · THE ASSISTANT: files_list and file_text are read tools; file_text
         sends only the pages asked for.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke106.test.js                                           */
"use strict";
const fs = require("fs");
const path = require("path");
const { boot } = require("./lib/app-harness");
const ROOT = path.join(__dirname, "..");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }

let app, K, $, $$;
const cb = (fn) => new Promise((r) => fn((e, v) => r(e || v)));
async function settle(n) { for (let i = 0; i < (n || 4); i++) await app.settle(); }
/* a File the store can hash: Node's own Blob/File, which carry arrayBuffer() */
function file(name, text, type) { return new File([text], name, { type: type || "text/plain" }); }

step("boot", async () => {
  app = await boot({ clock: "2026-10-26T10:00:00" });
  K = app.KOS;
  $ = (s) => app.document.querySelector(s);
  $$ = (s) => [...app.document.querySelectorAll(s)];
  if (!app.window.crypto || !app.window.crypto.subtle) Object.defineProperty(app.window, "crypto", { value: globalThis.crypto, configurable: true });
  await app.settle();
  eq(app.errors, [], "boot errors");
  for (const n of ["files", "fileScan", "filesUI"]) assert(K[n], "KOS." + n + " is loaded");
  assert(typeof K.views.files === "function" && typeof K.views.storage === "function", "the two pages");
});

step("A · one file, many links", async () => {
  const A = K.attach;
  const r1 = await new Promise((r) => K.files.add([file("Handout.txt", "Big O and the halting problem")], { link: { kind: "topic", id: "compsci:4.1.1.1" } }, (e, out) => r(out)));
  eq(r1.map((x) => x.outcome), ["added"], "added");
  const r2 = await new Promise((r) => K.files.add([file("Handout copy.txt", "Big O and the halting problem")], { link: { kind: "assignment", id: "77" } }, (e, out) => r(out)));
  eq(r2.map((x) => x.outcome), ["linked"], "the same content is linked, not stored twice");
  const meta = await cb((d) => A.listMeta(d));
  eq(meta.length, 1, "one record");
  const m = meta[0];
  eq(m.name, "Handout.txt", "the name is kept");
  eq(m.aliases, ["Handout copy.txt"], "the new name is an alias");
  eq(m.links.map((l) => l.kind + ":" + l.id).sort(), ["assignment:77", "topic:compsci:4.1.1.1"], "two places");
  const inTopic = await cb((d) => A.list("compsci", "4.1.1.1", d));
  const inAsg = await cb((d) => A.list("_", "assignment:77", d));
  eq([inTopic.length, inAsg.length], [1, 1], "each place lists it");
  await cb((d) => A.removeLink(m.fileId, { kind: "topic", id: "compsci:4.1.1.1" }, d));
  const after = (await cb((d) => A.listMeta(d)))[0];
  eq(after.links.map((l) => l.kind), ["assignment"], "removing one link keeps the file and its other link");
  /* kind only moves up on a match */
  await cb((d) => A.setKind(m.fileId, "handout", d));
  await new Promise((r) => A.add("_", "_", file("Again.txt", "Big O and the halting problem"), () => r(), { kind: "photo" }));
  eq((await cb((d) => A.listMeta(d)))[0].kind, "handout", "a match never demotes");
  await new Promise((r) => A.add("_", "_", file("Again 2.txt", "Big O and the halting problem"), () => r(), { kind: "scheme" }));
  eq((await cb((d) => A.listMeta(d)))[0].kind, "scheme", "and promotes");
});

step("B · the index, text inside files, freeing space", async () => {
  await cb((d) => K.files.refresh(d));
  const all = K.files.all();
  eq(all.length, 1, "one indexed file");
  const r = all[0];
  eq(K.files.linkedTo("assignment", "77").length, 1, "linkedTo");
  assert(K.files.search("handout copy").length === 1, "search finds an alias");
  /* the background queue indexes the text file */
  K.files.indexNow({ now: true });
  for (let i = 0; i < 40 && K.files.textState(r) !== "done"; i++) await settle();
  eq(K.files.textState(r), "done", "indexed in the background");
  const hit = K.files.search("halting");
  eq([hit.length, hit[0] && hit[0].where, hit[0] && hit[0].page], [1, "text", 1], "the text inside it is searched");
  await cb((d) => K.attach.evict(r.fileId, d));
  await cb((d) => K.files.refresh(d));
  const ev = K.files.get(r.fileId);
  eq([!!ev, ev.hasBlob, ev.evicted], [true, false, true], "freeing removes the binary only");
  eq(K.files.search("halting").length, 1, "and the text still matches");
});

step("C · the pages only read", async () => {
  const before = JSON.stringify(K.store.state);
  K.show("files"); await settle();
  assert($("[data-ui~='files.page']"), "Files renders");
  assert($$("[data-ui~='files.item']").length === 1, "the file is listed");
  K.show("storage"); await settle(6);
  assert($("[data-ui~='storage.page']") && $("[data-ui~='storage.unlinked']") && $("[data-ui~='storage.free']"), "Storage renders");
  const strip = (s) => { const o = JSON.parse(s); delete o.ui; return JSON.stringify(o); };
  eq(strip(JSON.stringify(K.store.state)), strip(before), "drawing writes nothing to the synced state");
  eq(app.errors, [], "no errors");
});

step("D · the scan's warp is a homography", () => {
  const S = K.fileScan, src = [[120, 80], [900, 140], [860, 760], [90, 700]], W = 1240, H = 1754;
  const h = S.homography(src, W, H);
  const near = (p, q) => Math.abs(p[0] - q[0]) < 1e-6 && Math.abs(p[1] - q[1]) < 1e-6;
  assert(near(S.mapPoint(h, 0, 0), src[0]) && near(S.mapPoint(h, W, 0), src[1]) && near(S.mapPoint(h, W, H), src[2]) && near(S.mapPoint(h, 0, H), src[3]), "the page's corners map to the photo's");
  const m = S.mapPoint(h, W / 2, H / 2);
  assert(m[0] > 90 && m[0] < 900 && m[1] > 80 && m[1] < 760, "a point inside maps inside");
});

step("E · airing and release days on a closed app", async () => {
  const now = Date.parse("2026-10-26T10:00:00");
  K.store.state.notify.airing = { "171018": { ep: 5, at: Math.floor((now + 864e5) / 1000), title: "Test Show", entryId: 1 } };
  if (K.wishlist && K.wishlist.add) K.wishlist.add({ title: "Volume 9", status: "waitingForRelease", releaseDate: "2026-10-28" });
  const o = await new Promise((r) => K.outlook.build((e, v) => r(v), { now: now }));
  const air = o.items.filter((i) => /^air:/.test(i.id));
  eq(air.map((i) => i.id), ["air:171018:5"], "the next episode, under the ledger's own id");
  if (K.wishlist && K.wishlist.add) {
    const w = o.items.filter((i) => /^wish:/.test(i.id))[0];
    assert(w && new Date(w.at).getHours() === 9, "a release day at 09:00");
  }
  eq(o.airing && o.airing.ids, [171018], "the watched AniList ids are published");
  K.store.state.ui.notifyMuted = { airing: true };
  const o2 = await new Promise((r) => K.outlook.build((e, v) => r(v), { now: now }));
  eq([o2.airing, o2.items.filter((i) => /^air:/.test(i.id)).length], [null, 0], "muted, nothing about airing leaves");
  K.store.state.ui.notifyMuted = {};
  const L = await import(path.join(ROOT, "supabase/functions/runner/logic.ts"));
  const t = Math.floor(now / 1000);
  const items = L.airingItems({ ids: [171018], titles: { "171018": "Test Show" } }, [{ mediaId: 171018, episode: 6, airingAt: t - 60 }, { mediaId: 999, episode: 1, airingAt: t - 60 }], now, "Europe/London");
  eq(items.map((i) => [i.id, i.kind, i.title]), [["air:171018:6", "airing", "Episode 6 of Test Show aired"]], "AniList's schedule becomes the same id, only for watched shows");
  eq(L.airingItems({ ids: [171018], titles: {}, quiet: { from: "09:00", to: "11:00" } }, [{ mediaId: 171018, episode: 6, airingAt: t - 60 }], now, "Europe/London").length, 0, "dropped in quiet hours");
  const runner = fs.readFileSync(path.join(ROOT, "supabase/functions/runner/index.ts"), "utf8");
  assert(/graphql\.anilist\.co/.test(runner) && !/Authorization: `Bearer \$\{[^}]*anilist/i.test(runner), "the runner reads AniList's public schedule, no token");
});

step("F · Rider evidence from GitHub CI", async () => {
  const G = K.codeGit;
  eq(G.guard([{ path: G.WORKFLOW, content: G.workflow() }]), null, "the workflow is an allowed path");
  assert(/dotnet run \.kurenai\/validate\.cs/.test(G.workflow()) && /Kurenai · /.test(G.workflow()) && /checks: write/.test(G.workflow()), "it runs the validator and posts a check run");
  const pid = Object.keys(K_CODE().PROJECTS)[0];
  K.store.state.code.github = { repo: "me/kurenai-work", branch: "main", mode: "checkpoint", via: "token" };
  await new Promise((r) => K.mediadb.setKV("github.token", "github_pat_TEST", r));
  const calls = [];
  app.window.fetch = (url, opts) => {
    calls.push(String(url));
    if (/check-runs/.test(url)) return Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve(JSON.stringify({ check_runs: [
      { status: "completed", conclusion: "success", completed_at: "2026-10-26T09:00:00Z", head_sha: "abc1234def", html_url: "https://github.com/x", output: { summary: "exit 0", text: "{\"report\":1}" } }] })) });
    return Promise.resolve({ ok: false, status: 404, text: () => Promise.resolve("{}") });
  };
  const r = await G.ciReport(pid);
  eq([r.ok, r.text, r.conclusion], [true, "{\"report\":1}", "success"], "the latest check run's report");
  assert(calls.some((u) => /\/repos\/me\/kurenai-work\/commits\/main\/check-runs\?filter=latest&check_name=Kurenai%20%C2%B7%20/.test(u)), "read by its name on the branch head");
  app.window.fetch = () => Promise.resolve({ ok: false, status: 403, text: () => Promise.resolve("{}") });
  assert(/Checks: read/.test((await G.ciReport(pid)).why), "a refusal says which permission");
  /* the evidence level: a CI report beats a self-run */
  const C = K.code, p = K_CODE().PROJECTS[pid], mid = p.milestones[0].id;
  const rep = (sha) => ({ finishedAt: "2026-10-26T09:00:00Z", steps: [], milestones: [{ id: mid, ok: true, checks: [] }], env: {}, validator: { version: "1.1.1" }, project: { id: pid, scaffoldVersion: p.scaffoldVersion } });
  C.recordReport(pid, rep(), { sha: "s1", level: "self" });
  eq(C.projectView(pid).milestones[0].level, "self", "self-run first");
  C.recordReport(pid, rep(), { sha: "s2", level: "ci" });
  eq(C.projectView(pid).milestones[0].level, "ci", "then CI-verified");
  const src = fs.readFileSync(path.join(ROOT, "js/core/codeproj.js"), "utf8");
  assert(/level: ci \? "ci" : "self"/.test(src), "apply records the level it is given");
  const tok = fs.readFileSync(path.join(ROOT, "supabase/functions/github-token/index.ts"), "utf8");
  assert(/checks: "read", workflows: "write"/.test(tok) && /status === 422/.test(tok), "the App asks for Checks and Workflows and falls back");
});
function K_CODE() { return app.window.KOS_CODE; }

step("G · a habit several times a day", () => {
  const R = K.routines;
  R.enable(true);
  const h = R.add({ name: "Take medicine", kind: "habit", steps: [{ text: "Take medicine" }], days: [], times: ["20:00", "08:00"], remind: true });
  eq(h.times, ["08:00", "20:00"], "times in order");
  eq(h.steps.map((s) => [s.id, s.at]), [["t0800", "08:00"], ["t2000", "20:00"]], "a step per time");
  const now = Date.parse("2026-10-26T10:00:00"), day = R.routineDay(now);
  const before = (K.store.state.sessions || []).length;
  const a = R.tick(h.id, "t0800", true, { now: now });
  eq([a.state, R.stateOn(h, day, now)], ["partial", "partial"], "one time ticked is not the day kept");
  eq((K.store.state.sessions || []).length, before, "and pays nothing yet");
  const b = R.tick(h.id, "t2000", true, { now: now });
  eq(b.state, "done", "every time ticked keeps the day");
  eq((K.store.state.sessions || []).length, before + 1, "paid once");
  const h2 = R.add({ name: "Water plants", kind: "habit", steps: [{ text: "Water plants" }], days: [], times: ["08:00", "18:00"], remind: true });
  const f = R.forecast(now, now + 864e5).filter((x) => x.id.indexOf("routine:" + h2.id) === 0);
  eq(f.map((x) => x.id.split(":").pop()), ["1800", "0800"], "a reminder at each time not yet ticked (the 08:00 today has passed)");
  const back = R.update(h2.id, { times: null });
  eq([back.times, back.steps.length, !!back.steps[0].at], [undefined, 1, false], "clearing the times gives one step");
  assert(!R.normalise({ name: "x", kind: "habit", times: ["08:00"] }).times, "one time is not several");
});

step("H · the Assistant's file tools", async () => {
  const T = K.ai.tools;
  eq([T.get("files_list").tier, T.get("file_text").tier], ["read", "read"], "read tools");
  const fid = K.files.all()[0].fileId;
  const out = await new Promise((r) => T.execute("file_text", { fileId: fid, from: 1, to: 1 }, (e, v) => r(e || v)));
  assert(out.pages && out.pages.length === 1 && /halting/.test(out.pages[0].text), "only the pages asked for");
  const list = await new Promise((r) => T.execute("files_list", {}, (e, v) => r(e || v)));
  assert(list.files.length === 1 && !("text" in list.files[0]), "the list names files, never their content");
  eq(app.errors, [], "no errors");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + (e && e.message)); }
  }
  console.log(failed ? "smoke106: " + failed + " failed" : "smoke106: all " + steps.length + " passed");
  process.exit(failed ? 1 : 0);
})();
