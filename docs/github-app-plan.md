# Code → GitHub as a GitHub App (plan, revision 1)

Asked for on 20 October 2026 (roadmap 5.7 item 2), started 22 October 2026.
It unparks "Code → GitHub as a GitHub App" (docs/code-plan.md §10, v2).

> **Status (22 October 2026):** plan written; built on `feat/after-fsrs`
> (smoke98). Nothing is deployed. Creating the App on GitHub and its
> secrets need your account (§6).

Short answer:
- **You install a KurenaiOS GitHub App on the one repository** your work
  goes to. You never type a token again, on any device.
- **The device never holds a long-lived credential.** An Edge Function
  mints a one-hour installation token, scoped to that repository with
  Contents write only, each time a push needs one. The token lives in
  memory, never in IndexedDB, a backup or a log.
- **Everything else stays as v1:** the outbox, one-commit pushes, the
  allowlist, the size caps and the secret scan. The fine-grained token
  remains as the fallback.

---

## 1. What v1 does (invariant 110)

- You create a private repository and a fine-grained token (Contents:
  read and write), then paste both into Code settings.
- The token is per device, in the media kv (`github.token`), and every
  device needs its own.
- The push uses the Git Data API from the browser: a tree on the head, a
  commit, a fast-forward.

What wears thin: tokens expire (at most a year, often 30 or 90 days), each
device needs one, and a pasted token is a long-lived secret sitting in
IndexedDB.

## 2. The App

- **Permissions:** Repository Contents: read and write; Metadata: read
  (implied). Nothing else: no issues, no workflows, no account access.
- **Installation:** "Only select repositories", one of them. Because
  "Request user authorization (OAuth) during installation" is on, GitHub
  returns to the Callback URL (`https://kurenai-os.pages.dev/`) with a
  `code`, perhaps `installation_id`, and NO `state` (GitHub does not pass
  it through the install-time flow). The app's nonce only says this device
  started a connect; the proof is the function's ownership check (§5).
- **Why an installation token and not a user token:** it can only touch
  the repositories you installed it on, and it expires in an hour. A user
  token can act as you everywhere you have access.

## 3. The flow

```
Code settings ─ "Connect with GitHub" ─► github.com/apps/<slug>/installations/new
   (a nonce in sessionStorage: this device started a connect)
github.com ─ install on one repo ─► back to https://kurenai-os.pages.dev/?code=…[&installation_id=…]
device ─ POST github-token {action:"link", code, installation_id?} (Supabase JWT) ─►
   Edge Function:
     1. exchange `code` for a user token (client id + secret), once, in memory
     2. GET /user/installations with it: the installation must be listed,
        so it is yours; read its repositories (exactly one is accepted)
     3. store {user_id, installation_id, repo, account} in kos_github
        (service-role only; no row-level access for the browser at all)
     4. forget the user token; return {repo, account}
device ─ sets state.code.github = {repo, branch, mode, via:"app"} (synced)

a push ─ POST github-token {action:"token"} (JWT) ─►
   Edge Function: App JWT (RS256, the App's private key, 9-minute life)
     → POST /app/installations/<id>/access_tokens
        {repositories:[repo], permissions:{contents:"write"}}
     → {token, expires_at}  (one hour)
device ─ keeps it in memory until 5 minutes before it expires, then asks again
```

## 4. What changes in the app

- **`KOS.codeGit.connect` gains `connectApp()`.** It sends you to the
  install page, and on return calls `link`. The repository comes from the
  installation, so there is nothing to type.
- **`tokenFor()`** returns the memory token when `via:"app"` (fetching a
  fresh one when it is missing or within 5 minutes of expiry), else the kv
  token. `push()` is unchanged apart from asking `tokenFor()`.
- **Every device of yours is connected once one is.** `state.code.github`
  syncs, and the function knows your installation by your Supabase user.
  A device signed out of cloud sync cannot use the App and says so; the
  token fallback still works there.
- **Disconnect** deletes the `kos_github` row (`action:"unlink"`) and
  points to GitHub's own Uninstall button. The app never uninstalls
  anything itself.
- **Code settings** shows the App connection, with the repository, the
  account and "Change repository" (back to the install page). Token
  connection moves under "Use a token instead".

## 5. Security (invariants 35, 110)

- **The App's private key and client secret are function secrets only.**
  The installation id is not a secret, but it is stored server-side
  anyway, so a browser cannot point the function at someone else's
  installation.
- **Every function call needs your Supabase JWT.** `token` answers only
  for the installation linked to that user, and only for the linked
  repository with Contents write.
- **The `link` check is the ownership proof.** The installation must
  appear in the user's own `/user/installations`, so a stolen
  installation id cannot be claimed.
- **Nothing GitHub returns is logged.** Errors are normalised as
  `ai-chat`'s are.

## 6. What you run once (needs your account)

> **22 October 2026:** `kos_github` is applied and `github-token` is
> deployed (it answers 503 "not configured" until step 3's secrets exist).

1. GitHub → Settings → Developer settings → GitHub Apps → New:
   - name "KurenaiOS (yours)", homepage the app's URL;
   - Callback (Redirect) URL `https://kurenai-os.pages.dev/`, with
     "Request user authorization (OAuth) during installation" on (the Setup
     URL is then unavailable: GitHub returns to the callback);
   - no webhook;
   - permissions: Contents read and write;
   - "Only on this account".
2. Generate a private key (a `.pem`), note the App ID, the client ID and a
   new client secret, and the app's slug.
3. `supabase secrets set GITHUB_APP_ID=… GITHUB_APP_SLUG=…
   GITHUB_CLIENT_ID=… GITHUB_CLIENT_SECRET=… GITHUB_APP_PRIVATE_KEY="$(cat key.pem)"`.
4. `supabase db push`, then `supabase functions deploy github-token`.
5. Put `GITHUB_APP_SLUG` in `js/env.local.js`, so the page can build the
   install link.

## 7. Later: CI-verified evidence

A workflow in the repository can run the Rider validator on each push and
write its report as a check run. The app could then accept a report whose
SHA-256 matches a passing check. That needs the App's Checks: read
permission and a workflow file the app would commit. It is not in this
release.

## 8. Decisions (proposed)

| | Decision | Proposed |
|---|---|---|
| A | Token kind | installation token, one repository, Contents write, one hour |
| B | Where the installation lives | `kos_github`, service role only |
| C | Fallback | the v1 token stays, under "Use a token instead" |
| D | Signed out | the App needs cloud sign-in; the token works without |
