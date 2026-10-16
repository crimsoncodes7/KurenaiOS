/* Kurenai OS — smoke79.test.js
   Code → GitHub v1 (docs/code-plan.md §10; js/core/codegit.js), against a
   fake GitHub that keeps a real tree of commits.

     A · CONNECT. A bad name, a refused token and a read-only token each
         say why and save nothing; a good one keeps the token in the media
         kv (never the state document) and the link in state.code.github.
     B · QUEUE AND PUSH. Off queues nothing; a task's first pass queues its
         source and a README; a push is ONE commit on the head (an empty
         repository gets its first commit first) holding the app's paths
         and the generated README, and empties the queue.
     C · GUARDS. A token in the code blocks the push and keeps the queue;
         a path outside the allowlist is refused; the head moving between
         read and write (a Rider push) rebuilds on the new head.
     D · PRIVACY. The token is in no backup, no state document and no
         request but GitHub's; the settings card draws without writing.

   Run: node tools/smoke79.test.js                                        */
"use strict";
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
const PASS = { passed: true };

/* a tiny GitHub: one repository, one branch, commits holding whole trees */
function fakeGitHub(o) {
  const gh = { repo: "kai/kurenai-programming", private: true, push: true, token: "github_pat_TEST", empty: true,
    commits: {}, trees: {}, head: null, n: 0, calls: [], moveOnce: false };
  Object.assign(gh, o || {});
  const id = (p) => p + (++gh.n).toString(16).padStart(8, "0");
  function res(status, json) { return Promise.resolve({ ok: status < 300, status, text: () => Promise.resolve(json ? JSON.stringify(json) : "") }); }
  gh.fetch = (url, init) => {
    init = init || {};
    const m = (init.method || "GET"), u = String(url).replace("https://api.github.com", ""), body = init.body ? JSON.parse(init.body) : null;
    gh.calls.push(m + " " + u);
    if ((init.headers || {}).Authorization !== "Bearer " + gh.token) return res(401, { message: "Bad credentials" });
    const R = "/repos/" + gh.repo;
    if (m === "GET" && u === R) return res(200, { full_name: gh.repo, private: gh.private, default_branch: "main", permissions: { push: gh.push } });
    if (u.indexOf(R) !== 0) return res(404, { message: "Not Found" });
    const rest = u.slice(R.length);
    if (m === "GET" && rest === "/git/ref/heads/main") return gh.head ? res(200, { object: { sha: gh.head } }) : res(409, { message: "Git Repository is empty." });
    if (m === "PUT" && rest === "/contents/README.md") {
      const t = id("t"); gh.trees[t] = { "README.md": Buffer.from(body.content, "base64").toString() };
      const c = id("c"); gh.commits[c] = { tree: t, parents: [], message: body.message }; gh.head = c; gh.empty = false;
      return res(201, { commit: { sha: c } });
    }
    if (m === "GET" && rest.indexOf("/git/commits/") === 0) { const c = gh.commits[rest.slice(13)]; return c ? res(200, { tree: { sha: c.tree } }) : res(404); }
    if (m === "POST" && rest === "/git/trees") {
      const base = Object.assign({}, gh.trees[body.base_tree] || {});
      body.tree.forEach((e) => { base[e.path] = e.content; });
      const t = id("t"); gh.trees[t] = base; return res(201, { sha: t });
    }
    if (m === "POST" && rest === "/git/commits") { const c = id("c"); gh.commits[c] = { tree: body.tree, parents: body.parents, message: body.message }; return res(201, { sha: c }); }
    if (m === "PATCH" && rest === "/git/refs/heads/main") {
      if (body.force) return res(400, { message: "no force" });
      if (gh.moveOnce) {           /* someone pushed from Rider meanwhile */
        gh.moveOnce = false;
        const t = id("t"); gh.trees[t] = Object.assign({}, gh.trees[gh.commits[gh.head].tree], { "projects/hello/Program.cs": "// mine" });
        const c = id("c"); gh.commits[c] = { tree: t, parents: [gh.head], message: "from Rider" }; gh.head = c;
        return res(422, { message: "Update is not a fast forward" });
      }
      if (gh.commits[body.sha].parents[0] !== gh.head) return res(422, { message: "Update is not a fast forward" });
      gh.head = body.sha; return res(200, { object: { sha: body.sha } });
    }
    return res(404, { message: "Not Found" });
  };
  gh.tree = () => gh.trees[gh.commits[gh.head].tree];
  return gh;
}

let GH;
step("A · connect: every refusal says why and saves nothing; a good token is kept on the device", async (app) => {
  const K = app.KOS, G = K.codeGit;
  let r = await G.connect("not a repo", "x");
  assert(!r.ok && /owner\/name/.test(r.why), "a bad name says how to write it");
  r = await G.connect(GH.repo, "github_pat_WRONG");
  assert(!r.ok && /refused/.test(r.why), "a refused token says so: " + r.why);
  GH.push = false;
  r = await G.connect(GH.repo, GH.token);
  assert(!r.ok && /read and write/.test(r.why), "a read-only token says what it needs");
  assert(!(await G.hasToken()) && !G.cfg().repo, "nothing was saved");
  GH.push = true;
  r = await G.connect("https://github.com/" + GH.repo + ".git", GH.token);
  assert(r.ok && r.private && r.repo === GH.repo, "a pasted URL connects");
  assert(await G.hasToken(), "the token is kept on this device");
  assert(G.cfg().repo === GH.repo && G.cfg().mode === "checkpoint", "the link is saved, checkpoints by default");
  assert(JSON.stringify(K.store.state).indexOf(GH.token) < 0, "the token is not in the state document");
});

step("B · queue and push: one commit with the app's paths, on an empty repository too", async (app) => {
  const K = app.KOS, G = K.codeGit;
  G.setMode("off");
  const t = K.code.task("1.1-box");
  await G.queueTask(t, [{ name: "Program.cs", src: "Console.WriteLine(1);" }]);
  assert((await G.status()).waiting === 0, "off queues nothing");
  G.setMode("checkpoint");
  K.code.recordCheck(t.id, PASS);
  await G.queueTask(t, [{ name: "Program.cs", src: "Console.WriteLine(\"Hi\");" }]);
  const st = await G.status();
  assert(st.waiting === 2, "a pass queues its source and its README: " + st.waiting);
  const r = await G.push();
  assert(r.ok, "the push worked: " + r.why);
  const tree = GH.tree();
  assert(tree["exercises/unit-01/1-1-box/Program.cs"] === "Console.WriteLine(\"Hi\");", "the source is at its path: " + Object.keys(tree).join(", "));
  assert(/^# /.test(tree["exercises/unit-01/1-1-box/README.md"]) && /Tasks passed \| 1/.test(tree["README.md"]), "the task README and the progress README");
  const head = GH.commits[GH.head];
  assert(head.parents.length === 1 && GH.commits[head.parents[0]].message === "Start Kurenai Programming", "an empty repository got its first commit, then ONE commit on top");
  assert((await G.status()).waiting === 0 && (await G.status()).last.ok, "the queue is empty and the status says pushed");
  assert(!GH.calls.some((c) => /PATCH/.test(c)) || GH.calls.filter((c) => /PATCH/.test(c)).length === 1, "one ref update");
});

step("C · guards: a secret blocks, a strange path is refused, a moved head is rebuilt on", async (app) => {
  const K = app.KOS, G = K.codeGit, t = K.code.task("1.1-box");
  const head0 = GH.head;
  await G.queueTask(t, [{ name: "Program.cs", src: "var key = \"github_pat_" + "A".repeat(50) + "\";" }]);
  let r = await G.push();
  assert(!r.ok && r.blocked && /GitHub token/.test(r.why), "a token in the code blocks the push: " + r.why);
  assert(GH.head === head0 && (await G.status()).waiting === 2, "nothing was pushed and the queue is kept");
  assert(/not a path/.test(G.guard([{ path: "../etc/passwd", content: "x" }])), "a path outside the allowlist is refused");
  await G.queueTask(t, [{ name: "Program.cs", src: "Console.WriteLine(2);" }]);
  GH.moveOnce = true;
  r = await G.push("Checkpoint: second try");
  assert(r.ok, "the push rebuilt on the moved head: " + r.why);
  const tree = GH.tree();
  assert(tree["projects/hello/Program.cs"] === "// mine" && tree["exercises/unit-01/1-1-box/Program.cs"] === "Console.WriteLine(2);", "Rider's file and the app's both survive");
  assert(GH.commits[GH.head].message === "Checkpoint: second try", "a checkpoint carries its message");
});

step("D · privacy: no backup, no other host; the settings card draws without writing", async (app) => {
  const K = app.KOS;
  const full = await new Promise((res) => K.store.snapshotFull((e, d) => res(JSON.stringify(d || null))));
  assert(full.length > 100 && full.indexOf("code.github") < 0 && full.indexOf(GH.token) < 0, "the token and the queue are in no backup");
  assert(full.indexOf(GH.repo) >= 0, "the link itself (state.code.github) is in the backup");
  assert(app.fetches.every((f) => f.indexOf("api.github.com") >= 0 || f.indexOf("github") < 0), "GitHub is called only at api.github.com");
  const before = JSON.stringify(K.store.state.code);
  K.show("code", { page: "settings" }); await app.settle(); await new Promise((r) => setTimeout(r, 50)); await app.settle();
  assert(app.document.querySelector("[data-ui~='code.github-push']"), "the connected card offers Push now");
  assert(JSON.stringify(K.store.state.code) === before, "drawing the card wrote nothing");
  await K.codeGit.disconnect();
  assert(!(await K.codeGit.hasToken()), "Disconnect removes the token on this device");
  assert(app.errors.length === 0, "errors: " + app.errors.join(" | "));
});

(async () => {
  let failed = 0;
  const app = await boot();
  GH = fakeGitHub();
  const plain = app.window.fetch;
  app.window.fetch = (url, init) => String(url).indexOf("https://api.github.com") === 0 ? GH.fetch(url, init) : plain(url, init);
  for (const [name, fn] of steps) {
    try { await fn(app); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + e.message); }
  }
  console.log("\n" + "=".repeat(30));
  if (failed) { console.log("SMOKE79 FAIL — " + failed + " step(s)"); process.exit(1); }
  console.log("SMOKE79 PASS — Code → GitHub (" + steps.length + " steps).");
})();
