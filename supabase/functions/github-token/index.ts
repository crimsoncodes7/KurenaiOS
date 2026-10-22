/* Kurenai OS — Edge Function: github-token (roadmap 5.7 item 2,
   docs/github-app-plan.md). Code → GitHub through YOUR installation of a
   KurenaiOS GitHub App, so no device ever holds a long-lived token.

   POST { action:"link", code, installation_id? }  (Supabase JWT)
     → exchanges `code` (OAuth during installation) for a user token, once,
       in memory; the installation must be listed in that user's own
       /user/installations (the ownership proof — a user token of this App
       sees only this App's installations, and the App installs only on its
       owner's account, so a forged return has nothing to link). GitHub's
       install-time OAuth sends no `state` and may send no installation id:
       without one, the user's single installation is taken. It must reach
       exactly one repository; stores {installation_id, repo, account} in kos_github
       (service role only) → 200 { repo, account, branch }
   POST { action:"token" }   → a one-hour installation token for the linked
       repository, Contents write only → 200 { token, expires_at, repo }
   POST { action:"status" }  → 200 { linked, repo?, account? }
   POST { action:"unlink" }  → deletes the row → 200 { ok:true }
   → 400 bad input · 401 no/invalid JWT · 403 not your installation
   · 409 not exactly one repository · 503 the App is not configured

   Secrets: GITHUB_APP_ID, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET,
   GITHUB_APP_PRIVATE_KEY (the .pem GitHub gives, PKCS#1 or PKCS#8).
   Nothing GitHub returns is logged, and a token is never stored. */
import { json, preflight, requireUserId, serviceRest } from "../_shared/cors.ts";
import { appJwt } from "./jwt.ts";

const API = "https://api.github.com";
const UA = "KurenaiOS-github-token";

function cfg() {
  const id = Deno.env.get("GITHUB_APP_ID"), cid = Deno.env.get("GITHUB_CLIENT_ID");
  const secret = Deno.env.get("GITHUB_CLIENT_SECRET"), pem = Deno.env.get("GITHUB_APP_PRIVATE_KEY");
  return id && cid && secret && pem ? { id, cid, secret, pem } : null;
}

async function gh(method: string, path: string, auth: string, body?: unknown) {
  const res = await fetch(API + path, {
    method,
    headers: { Accept: "application/vnd.github+json", Authorization: auth, "X-GitHub-Api-Version": "2022-11-28", "User-Agent": UA,
      ...(body ? { "Content-Type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  let j: Record<string, unknown> | null = null;
  try { j = await res.json(); } catch { j = null; }
  return { status: res.status, ok: res.ok, json: j };
}

type Link = { installation_id: number; repo: string; account: string };
async function linkOf(uid: string): Promise<Link | null> {
  const res = await serviceRest(`kos_github?user_id=eq.${uid}&select=installation_id,repo,account`);
  if (!res.ok) return null;
  const rows = await res.json();
  return Array.isArray(rows) && rows[0] ? rows[0] as Link : null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return preflight();
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  const uid = await requireUserId(req);
  if (!uid) return json({ error: "Sign in to cloud sync to use the GitHub App." }, 401);
  let input: Record<string, unknown>;
  try { input = await req.json(); } catch { return json({ error: "Invalid JSON body." }, 400); }
  const c = cfg();

  if (input.action === "status") {
    const l = await linkOf(uid);
    return json(l ? { linked: true, repo: l.repo, account: l.account } : { linked: false, configured: !!c });
  }
  if (input.action === "unlink") {
    await serviceRest(`kos_github?user_id=eq.${uid}`, { method: "DELETE" });
    return json({ ok: true });
  }
  if (!c) return json({ error: "The GitHub App isn't configured on the server yet." }, 503);

  if (input.action === "link") {
    const inst = input.installation_id == null || input.installation_id === "" ? null : Number(input.installation_id);
    const code = typeof input.code === "string" ? input.code.trim() : "";
    if ((inst !== null && (!Number.isInteger(inst) || inst <= 0)) || !/^[A-Za-z0-9_-]{6,100}$/.test(code)) return json({ error: "The installation's details are missing." }, 400);
    const tok = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json", "User-Agent": UA },
      body: JSON.stringify({ client_id: c.cid, client_secret: c.secret, code }),
    }).then((r) => r.json()).catch(() => null) as { access_token?: string } | null;
    const userToken = tok?.access_token;
    if (!userToken) return json({ error: "GitHub did not confirm the sign-in. Try connecting again." }, 403);
    /* the ownership proof: the installation is one of THIS user's */
    const mine = await gh("GET", "/user/installations?per_page=100", `Bearer ${userToken}`);
    const list = (mine.json?.installations ?? []) as { id: number; account?: { login?: string } }[];
    const hit = inst !== null ? list.find((i) => i.id === inst) : list.length === 1 ? list[0] : undefined;
    if (!hit) return json({ error: inst !== null || !list.length ? "That installation isn't yours." : "More than one installation: open the App's settings on GitHub and keep one." }, inst !== null || !list.length ? 403 : 409);
    const repos = await gh("GET", `/user/installations/${hit.id}/repositories?per_page=5`, `Bearer ${userToken}`);
    const rs = (repos.json?.repositories ?? []) as { full_name: string; default_branch?: string; private?: boolean }[];
    if (rs.length !== 1) return json({ error: rs.length ? "Install the App on exactly one repository." : "The App can't see a repository yet." }, 409);
    const row = { user_id: uid, installation_id: hit.id, repo: rs[0].full_name, account: hit.account?.login ?? "" };
    const up = await serviceRest("kos_github", {
      method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify(row),
    });
    if (!up.ok) return json({ error: "The link could not be saved." }, 502);
    return json({ repo: row.repo, account: row.account, branch: rs[0].default_branch ?? "main", private: !!rs[0].private });
  }

  if (input.action === "token") {
    const l = await linkOf(uid);
    if (!l) return json({ error: "GitHub isn't connected for this account." }, 404);
    const jwt = await appJwt(c.id, c.pem);
    const name = l.repo.split("/")[1];
    const r = await gh("POST", `/app/installations/${l.installation_id}/access_tokens`, `Bearer ${jwt}`,
      { repositories: [name], permissions: { contents: "write" } });
    if (r.status === 404) return json({ error: "The App was uninstalled on GitHub. Connect it again." }, 404);
    if (!r.ok || typeof r.json?.token !== "string") return json({ error: `GitHub answered ${r.status}.` }, 502);
    return json({ token: r.json.token, expires_at: r.json.expires_at, repo: l.repo });
  }
  return json({ error: "Unknown action." }, 400);
});
