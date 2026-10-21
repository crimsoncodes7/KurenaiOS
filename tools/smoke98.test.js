/* Kurenai OS — smoke98.test.js
   Code → GitHub as a GitHub App (roadmap 5.7 item 2,
   docs/github-app-plan.md; invariant 110).

   The claims:

     A · THE APP'S JWT (github-token/jwt.ts, pure): signed RS256 from the
         .pem GitHub hands out (PKCS#1) or a PKCS#8 one, with `iss` the App
         and a nine-minute life; the signature verifies with the public key.
     B · CONNECTING: without the App's slug or a cloud session the App is
         not offered and says why; "Connect with GitHub" goes to the App's
         install page with a one-time state; a return whose state does not
         match is refused and changes nothing; a matching one links the
         installation through the function and keeps {repo, via:"app"} in
         the synced link.
     C · PUSHING through the App: the token comes from the function, is
         used as the bearer, is reused while fresh, and is NEVER written to
         the media kv, the state document or a backup; disconnecting
         unlinks it and falls back to the token way.
     D · THE CARD: Connect with GitHub first, the token form under "Use a
         token instead"; connected, it says it is through the App.
     E · THE SERVER: github-token is JWT-verified, logs nothing, proves
         ownership through /user/installations before it stores a link,
         mints a token for ONE repository with Contents write; kos_github has
         row-level security and no policy a browser could use.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke98.test.js                                            */
"use strict";
const fs = require("fs");
const path = require("path");
const nodeCrypto = require("crypto");
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }
const ROOT = path.join(__dirname, "..");
const REPO = "kai/kurenai-programming", APPTOKEN = "ghs_INSTALLATION1";

step("A · the App's JWT", async () => {
  const J = await import(path.join(ROOT, "supabase/functions/github-token/jwt.ts"));
  const kp = nodeCrypto.generateKeyPairSync("rsa", { modulusLength: 2048 });
  for (const type of ["pkcs1", "pkcs8"]) {
    const pem = kp.privateKey.export({ type, format: "pem" });
    const jwt = await J.appJwt("123456", pem, Date.UTC(2026, 9, 22, 10, 0));
    const [h, b, sig] = jwt.split(".");
    const ok = nodeCrypto.verify("RSA-SHA256", Buffer.from(h + "." + b), kp.publicKey, Buffer.from(sig, "base64url"));
    assert(ok, type + ": the signature verifies");
    const claims = JSON.parse(Buffer.from(b, "base64url").toString());
    eq([JSON.parse(Buffer.from(h, "base64url").toString()).alg, claims.iss, claims.exp - claims.iat], ["RS256", "123456", 540], type + ": RS256, the App, nine minutes");
  }
});

let app, K, G, edgeCalls, navTo, gh;
function fakeGitHub() {
  const st = { head: "c0", calls: [] };
  const res = (status, json) => Promise.resolve({ ok: status < 300, status, text: () => Promise.resolve(json ? JSON.stringify(json) : "") });
  st.fetch = (url, init) => {
    init = init || {};
    const m = init.method || "GET", u = String(url).replace("https://api.github.com/repos/" + REPO, "");
    st.calls.push({ m, u, auth: (init.headers || {}).Authorization });
    if ((init.headers || {}).Authorization !== "Bearer " + APPTOKEN) return res(401, { message: "Bad credentials" });
    if (m === "GET" && u === "/git/ref/heads/main") return res(200, { object: { sha: st.head } });
    if (m === "GET" && u.indexOf("/git/commits/") === 0) return res(200, { tree: { sha: "t0" } });
    if (m === "POST" && u === "/git/trees") return res(201, { sha: "t1" });
    if (m === "POST" && u === "/git/commits") return res(201, { sha: "c1" });
    if (m === "PATCH" && u === "/git/refs/heads/main") { st.head = "c1"; return res(200, {}); }
    return res(404, { message: "Not Found" });
  };
  return st;
}
step("boot", async () => {
  app = await boot({ clock: "2026-10-22T10:00:00" });
  K = app.KOS; G = K.codeGit;
  edgeCalls = [];
  G._setEdge((body) => {
    edgeCalls.push(body.action);
    if (body.action === "link") return Promise.resolve({ repo: REPO, account: "kai", branch: "main" });
    if (body.action === "token") return Promise.resolve({ token: APPTOKEN, expires_at: new Date(app.window.Date.now() + 3600e3).toISOString(), repo: REPO });
    if (body.action === "unlink") return Promise.resolve({ ok: true });
    return Promise.reject(new Error("?"));
  });
  G._setNav((u) => { navTo = u; });
  gh = fakeGitHub();
  const plain = app.window.fetch;
  app.window.fetch = (url, init) => String(url).indexOf("https://api.github.com") === 0 ? gh.fetch(url, init) : plain(url, init);
  eq(app.errors, [], "boot errors");
});

step("B · connecting through the App", async () => {
  eq(G.appBlocked(), "unconfigured", "no App slug: not offered");
  app.window.KOS_ENV = Object.assign({}, app.window.KOS_ENV, { GITHUB_APP_SLUG: "kurenaios-yours" });
  K.cloud.signedIn = () => false;
  eq(G.appBlocked(), "signed-out", "signed out: says so");
  eq((await G.connectApp()).ok, false, "and does not leave");
  K.cloud.signedIn = () => true; K.cloud.userId = () => "u1";
  const r = await G.connectApp();
  assert(r.ok && /^https:\/\/github\.com\/apps\/kurenaios-yours\/installations\/new\?state=/.test(navTo), "to the install page: " + navTo);
  const state = navTo.split("state=")[1];
  app.window.sessionStorage.setItem("kos.gh.state", state);
  const bad = await G.completeApp(new URLSearchParams("installation_id=42&code=abcdef123&state=forged"));
  assert(!bad.ok && /did not come from this app/.test(bad.why), "a return with another state is refused");
  eq([G.cfg().via, G.cfg().repo, edgeCalls.length], ["token", "", 0], "and changes nothing");
  app.window.sessionStorage.setItem("kos.gh.state", state);
  const good = await G.completeApp(new URLSearchParams("installation_id=42&code=abcdef123&state=" + state));
  eq([good.ok, good.repo, G.cfg().via, G.cfg().repo, G.cfg().mode], [true, REPO, "app", REPO, "checkpoint"], "linked through the function");
  eq(K.store.state.code.github.via, "app", "the link is in the synced state");
});

step("C · pushing through the App; the token is never stored", async () => {
  await G.queueTask(K.code.task("1.1-box"), [{ name: "Program.cs", src: "Console.WriteLine(\"Hi\");" }]);
  const r = await G.push("Checkpoint");
  assert(r.ok, "pushed: " + JSON.stringify(r));
  assert(gh.calls.length && gh.calls.every((c) => c.auth === "Bearer " + APPTOKEN), "the App's token is the bearer");
  const r2 = await G.push("Again");
  eq(edgeCalls.filter((a) => a === "token").length, 1, "a fresh token is reused");
  void r2;
  const kv = await new Promise((res) => K.mediadb.getKV("github.token", (e, v) => res(v)));
  assert(!kv, "no token in the media kv");
  assert(JSON.stringify(K.store.state).indexOf(APPTOKEN) < 0, "none in the state document");
  const full = await new Promise((res) => K.store.exportFull((e, b) => res(JSON.stringify(b || {}))));
  assert(full.indexOf(APPTOKEN) < 0, "none in a backup");
  await G.disconnectApp();
  eq([G.cfg().via, G.cfg().repo, edgeCalls[edgeCalls.length - 1]], ["token", "", "unlink"], "disconnect unlinks and falls back");
});

step("D · the card", async () => {
  const $ = (s) => app.document.querySelector(s);
  K.show("code", { page: "settings" }); for (let i = 0; i < 5; i++) await app.settle();
  assert($("[data-ui~='code.github-app']") && !$("[data-ui~='code.github-app']").disabled, "Connect with GitHub first");
  const way = $("[data-ui~='code.github-token-way']");
  assert(way && way.querySelector("[data-ui~='code.github-token']"), "the token form under Use a token instead");
  app.window.sessionStorage.setItem("kos.gh.state", "s1");
  await G.completeApp(new URLSearchParams("installation_id=42&code=abcdef123&state=s1"));
  K.show("code", { page: "settings" }); for (let i = 0; i < 5; i++) await app.settle();
  assert(/Through the GitHub App/.test(($("[data-ui~='code.github-via']") || {}).textContent || ""), "connected through the App");
  eq(app.errors, [], "no errors");
});

step("E · the server side", () => {
  const src = fs.readFileSync(path.join(ROOT, "supabase/functions/github-token/index.ts"), "utf8");
  assert(/requireUserId/.test(src) && !/console\.(log|warn|error|info|debug)/.test(src), "JWT checked, nothing logged");
  const link = src.indexOf("/user/installations?"), store = src.indexOf("serviceRest(\"kos_github\"");
  assert(link > 0 && store > link, "ownership is proved before a link is stored");
  assert(/repositories: \[name\], permissions: \{ contents: "write" \}/.test(src), "one repository, Contents write");
  assert(/\[functions\.github-token\]\s*\nverify_jwt = true/.test(fs.readFileSync(path.join(ROOT, "supabase/config.toml"), "utf8")), "verify_jwt on");
  const sql = fs.readFileSync(path.join(ROOT, "supabase/migrations/20261022000003_kos_github.sql"), "utf8");
  assert(/enable row level security/.test(sql) && !/create policy/.test(sql), "kos_github: RLS on, no browser policy");
  const cg = fs.readFileSync(path.join(ROOT, "js/core/codegit.js"), "utf8");
  assert(!/setKv\(TOKEN, (appToken|r\.token)/.test(cg), "the client never stores the App's token");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + e.message); }
  }
  console.log(failed ? "smoke98: " + failed + " failed" : "smoke98: all " + steps.length + " passed");
  process.exit(failed ? 1 : 0);
})();
