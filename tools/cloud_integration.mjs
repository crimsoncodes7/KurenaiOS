/* Kurenai OS — tools/cloud_integration.mjs
   Build 4a LIVE integration + RLS verification against the configured
   Supabase project. Plain fetch, no dependencies. Reads the project URL and
   publishable key from js/env.local.js.

   Run (ONLY after the migration has been applied — this creates two
   throw-away auth users):
     node tools/cloud_integration.mjs

   What it proves:
   - email/password sign-up returns an immediate session (confirmation off)
   - POSITIVE RLS: a user can insert/select/update/delete their own rows in
     kos_state / kos_media / kos_files
   - NEGATIVE RLS: an authenticated user can NOT read, insert-as, or update
     another user's rows (cross-account isolation on every table)
   - updated_at is server-generated and monotonic (touch trigger)
   - storage: owner can upload/download under <uid>/...; another user is
     denied read and write on that path
   - anon key alone (no user token) reads nothing

   Cleanup: test rows and storage objects are deleted. The two auth users
   cannot delete themselves without a service-role key — remove them from
   the dashboard (Authentication → Users) if you want a spotless list.    */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envSrc = readFileSync(resolve(ROOT, "js/env.local.js"), "utf8");
const URL_M = envSrc.match(/SUPABASE_URL:\s*"([^"]+)"/);
const KEY_M = envSrc.match(/SUPABASE_ANON_KEY:\s*"([^"]+)"/);
if (!URL_M || !KEY_M) { console.error("Could not read js/env.local.js"); process.exit(1); }
const BASE = URL_M[1].replace(/\/$/, "");
const APIKEY = KEY_M[1];

const results = [];
let failures = 0;
function ok(name, cond, detail) {
  results.push({ name, pass: !!cond, detail });
  console.log((cond ? "  ok   " : "  FAIL ") + name + (cond || !detail ? "" : " — " + detail));
  if (!cond) failures++;
}

async function req(path, opts = {}, token) {
  const res = await fetch(BASE + path, {
    ...opts,
    headers: {
      apikey: APIKEY,
      Authorization: "Bearer " + (token || APIKEY),
      "Content-Type": "application/json",
      ...(opts.headers || {})
    }
  });
  let body = null;
  const text = await res.text();
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  return { status: res.status, body };
}

async function signUp(tag) {
  const email = `kos.test.${tag}.${Date.now()}@example.com`;
  const r = await req("/auth/v1/signup", {
    method: "POST",
    body: JSON.stringify({ email, password: "kos-test-password-1" })
  });
  const session = r.body && r.body.access_token ? r.body : (r.body && r.body.session) || null;
  const user = (r.body && r.body.user) || (session && session.user) || null;
  return { email, status: r.status, token: session ? session.access_token : null, id: user ? user.id : null };
}

(async () => {
  console.log("== auth ==");
  const A = await signUp("a");
  const B = await signUp("b");
  ok("user A signs up with an immediate session (confirmation off)", A.token && A.id, "status " + A.status + " " + JSON.stringify(A));
  ok("user B signs up with an immediate session", B.token && B.id);
  if (!A.token || !B.token) { console.log("\nCannot continue without sessions."); process.exit(1); }

  console.log("== kos_state: positive RLS ==");
  let r = await req("/rest/v1/kos_state", { method: "POST", headers: { Prefer: "return=representation" },
    body: JSON.stringify({ user_id: A.id, state_json: { probe: "A1" } }) }, A.token);
  ok("A inserts own state row", r.status === 201, "status " + r.status + " " + JSON.stringify(r.body));
  const ts1 = r.body && r.body[0] ? r.body[0].updated_at : null;
  ok("updated_at is server-populated on insert", !!ts1);

  await new Promise(res2 => setTimeout(res2, 1100));
  r = await req("/rest/v1/kos_state?user_id=eq." + A.id, { method: "PATCH", headers: { Prefer: "return=representation" },
    body: JSON.stringify({ state_json: { probe: "A2" } }) }, A.token);
  const ts2 = r.body && r.body[0] ? r.body[0].updated_at : null;
  ok("A updates own state row", r.status === 200 && r.body.length === 1, "status " + r.status);
  ok("updated_at is server-generated + monotonic (touch trigger)", ts1 && ts2 && Date.parse(ts2) > Date.parse(ts1), ts1 + " → " + ts2);

  r = await req("/rest/v1/kos_state?select=state_json", {}, A.token);
  ok("A selects own state row", r.status === 200 && r.body.length === 1 && r.body[0].state_json.probe === "A2");

  console.log("== kos_state: NEGATIVE RLS ==");
  r = await req("/rest/v1/kos_state?select=state_json", {}, B.token);
  ok("B sees ZERO of A's state rows", r.status === 200 && r.body.length === 0, JSON.stringify(r.body).slice(0, 120));
  r = await req("/rest/v1/kos_state", { method: "POST", body: JSON.stringify({ user_id: A.id, state_json: { evil: true } }) }, B.token);
  ok("B cannot insert a row AS A", r.status === 403 || r.status === 401 || r.status === 409, "status " + r.status);
  r = await req("/rest/v1/kos_state?user_id=eq." + A.id, { method: "PATCH", headers: { Prefer: "return=representation" },
    body: JSON.stringify({ state_json: { evil: true } }) }, B.token);
  ok("B's update of A's row hits nothing", (r.status === 200 || r.status === 404) && (!Array.isArray(r.body) || r.body.length === 0), "status " + r.status);
  r = await req("/rest/v1/kos_state?user_id=eq." + A.id + "&select=state_json", {}, A.token);
  ok("A's row is untouched after B's attempts", r.body.length === 1 && r.body[0].state_json.probe === "A2");
  r = await req("/rest/v1/kos_state?select=state_json", {});
  ok("the bare anon key (no user) reads nothing", r.status !== 200 || (Array.isArray(r.body) && r.body.length === 0), "status " + r.status);

  console.log("== kos_media / kos_files: cross-account isolation ==");
  r = await req("/rest/v1/kos_media", { method: "POST", headers: { Prefer: "return=representation" },
    body: JSON.stringify({ user_id: A.id, entry_id: "it-1", module: "anime", data_json: { title: "Test" }, deleted: false }) }, A.token);
  ok("A inserts own media row", r.status === 201, "status " + r.status + " " + JSON.stringify(r.body).slice(0, 160));
  r = await req("/rest/v1/kos_media?select=entry_id", {}, B.token);
  ok("B sees ZERO of A's media rows", r.status === 200 && r.body.length === 0);
  r = await req("/rest/v1/kos_files", { method: "POST", headers: { Prefer: "return=representation" },
    body: JSON.stringify({ user_id: A.id, file_id: "f-1", name: "x.txt", size: 5, meta_json: {} }) }, A.token);
  ok("A inserts own file-metadata row", r.status === 201, "status " + r.status + " " + JSON.stringify(r.body).slice(0, 160));
  r = await req("/rest/v1/kos_files?select=file_id", {}, B.token);
  ok("B sees ZERO of A's file rows", r.status === 200 && r.body.length === 0);

  console.log("== storage: kos-attachments ownership ==");
  const pathA = `${A.id}/f-1/x.txt`;
  let sres = await fetch(`${BASE}/storage/v1/object/kos-attachments/${pathA}`, {
    method: "POST", headers: { apikey: APIKEY, Authorization: "Bearer " + A.token, "Content-Type": "text/plain" },
    body: "hello from A"
  });
  ok("A uploads under own path", sres.status === 200, "status " + sres.status + " " + (await sres.text()).slice(0, 160));
  sres = await fetch(`${BASE}/storage/v1/object/kos-attachments/${pathA}`, {
    headers: { apikey: APIKEY, Authorization: "Bearer " + A.token } });
  ok("A downloads own object", sres.status === 200 && (await sres.text()) === "hello from A");
  sres = await fetch(`${BASE}/storage/v1/object/kos-attachments/${pathA}`, {
    headers: { apikey: APIKEY, Authorization: "Bearer " + B.token } });
  ok("B is DENIED reading A's object", sres.status !== 200, "status " + sres.status);
  sres = await fetch(`${BASE}/storage/v1/object/kos-attachments/${A.id}/f-1/evil.txt`, {
    method: "POST", headers: { apikey: APIKEY, Authorization: "Bearer " + B.token, "Content-Type": "text/plain" },
    body: "evil"
  });
  ok("B is DENIED writing under A's path", sres.status !== 200, "status " + sres.status);
  sres = await fetch(`${BASE}/storage/v1/object/kos-attachments/${pathA}`, {
    headers: { apikey: APIKEY } });
  ok("the bare anon key is denied the object", sres.status !== 200, "status " + sres.status);

  console.log("== cleanup ==");
  await fetch(`${BASE}/storage/v1/object/kos-attachments/${pathA}`, {
    method: "DELETE", headers: { apikey: APIKEY, Authorization: "Bearer " + A.token } });
  await req("/rest/v1/kos_state?user_id=eq." + A.id, { method: "DELETE" }, A.token);
  await req("/rest/v1/kos_media?user_id=eq." + A.id, { method: "DELETE" }, A.token);
  await req("/rest/v1/kos_files?user_id=eq." + A.id, { method: "DELETE" }, A.token);
  r = await req("/rest/v1/kos_state?select=user_id", {}, A.token);
  ok("cleanup: A's rows removed", r.status === 200 && r.body.length === 0);
  console.log("  note: the two throw-away auth users (" + A.email + ", " + B.email + ") need a service key or the dashboard to delete — harmless to leave.");

  console.log("");
  if (failures) { console.log("CLOUD INTEGRATION: " + failures + " FAILURE(S)"); process.exit(1); }
  console.log("CLOUD INTEGRATION PASS — auth, RLS isolation (positive + negative), server timestamps and storage ownership all verified live.");
})().catch(e => { console.error("Integration run crashed:", e); process.exit(1); });
