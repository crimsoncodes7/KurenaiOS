# Edge Functions audit (W0, read-only)

Quality programme W0, plan §A7. Scope: `supabase/functions/*` (8 functions + `_shared/cors.ts`),
`supabase/config.toml` (`verify_jwt`), and every client caller in `js/core/*.js`.
Findings only, no fixes. Read on 8 Nov 2026, branch `feat/w0-safety-net`.

Severity: P0 data loss / security hole · P1 broken feature · P2 wrong or misleading behaviour
under a realistic failure · P3 hygiene, latent or cosmetic.

## Summary

| Function | verify_jwt | In-function auth | CORS vs client | Error shape vs client | Findings |
|---|---|---|---|---|---|
| ai-chat | true | `requireUserId` | OK | OK (`error` + `kind`) | EF-01, EF-03, EF-08 |
| vndb-ulist | true | `requireUserId` | OK | OK (`error`, `upstream`, `retryAfter`) | EF-01, EF-02 |
| igdb-search | true | `requireUserId` | OK | OK | EF-01 |
| steam-auth | **false** (Steam's GET return) | `requireUserId` on every POST action; GET bound to a single-use nonce | OK | OK | EF-01, EF-07 |
| steam-owned-games | true | `requireUserId`; SteamID only from `kos_steam` | OK | OK (200 + `kind:"private"` is handled, games.js:619) | EF-01 |
| github-token | true | `requireUserId` | OK | client keeps `error` only | EF-01, EF-02, EF-04 |
| ext-token | true | `requireUserId` | OK | client keeps `error` + `status` | EF-01, EF-02 |
| runner | **false** (pg_cron) | `CRON_SECRET`, constant-time | n/a (no browser caller) | n/a | EF-05, EF-06 |

**No P0 or P1.** Every user-facing function checks the caller's JWT inside the function as well
as at the gateway (steam-auth checks it in the function for every POST, and its GET callback is
bound to a nonce minted for an authenticated user). The runner fails closed when `CRON_SECRET`
is unset. CORS matches what supabase-js sends. Identity always comes from the token, never the
body. The weak points are the **failure paths**: an exception the function does not catch, and
the gateway's own 401.

## CORS

`_shared/cors.ts:6-10`: `Access-Control-Allow-Origin: *`, headers
`authorization, x-client-info, apikey, content-type`, methods `POST, GET, OPTIONS`, preflight
204 (`cors.ts:19-21`). Every browser-called function answers `OPTIONS` first
(ai-chat:483, vndb-ulist:32, igdb-search:58, steam-auth:156, steam-owned-games:13,
github-token:58, ext-token:67).

Client side: all calls go through `supabase.functions.invoke` (`js/core/cloud.js:147`,
`ai.js:159`, `codegit.js:125`, `ext.js:185`; `vndb.js:274` and `gameapi.js:32` through
`KOS.cloud.invoke`). The vendored supabase-js sends `Authorization`, `apikey`, `X-Client-Info`
and `Content-Type`, all allowed. It sends `x-region` only when a region option is set, and none
is. The page does not use `credentials: "include"`, so `*` with `Authorization` is valid.
**No mismatch.** The permissive origin is deliberate (file://, localhost and pages.dev; the JWT
is the boundary, comment at `cors.ts:1-4`).

## Findings

### EF-01 · P2 · An uncaught exception answers without CORS headers, so the client sees "network?" instead of the reason
- `_shared/cors.ts:53` `requireUserId` calls `fetch(.../auth/v1/user)` with no try/catch, so an
  auth-server blip throws out of every user function.
- `_shared/cors.ts:70` `serviceRest` **throws** when `SUPABASE_URL` or the service key is
  missing. Callers with no try/catch:
  - ext-token:36 (`rowOf`), :62 (`rpc`), :102, :125, :141;
  - github-token:51 (`linkOf`), :71, :96;
  - steam-owned-games:23;
  - steam-auth:61, :87, :89, :128, :142, :151;
  - ai-chat:84 (`usedToday`, reached from the `health` action at :496).
- github-token:38 `gh()` has no catch on `fetch`, and `appJwt` (jwt.ts) throws on a malformed PEM
  (github-token:106).
- None of these handlers wraps its body in a try/catch. The response then comes from the runtime,
  not from `json()`, so it has no `Access-Control-Allow-Origin`. The browser blocks reading it,
  and supabase-js raises a `FunctionsFetchError` whose `context` has no `json()`.
- Client result:
  - `cloud.js:160-161` gives "The server function failed — network?";
  - `ai.js:171` gives "The assistant server failed — network?" (kind `network`, retryable);
  - `codegit.js:126-130` gives "The GitHub App could not be reached.";
  - `ext.js:188-191` gives "The connection service could not be reached." with no status.
- A configuration error or a GitHub outage is reported as the user's network.
- *Not verified on a live project:* that the edge runtime's 500 carries no CORS header. Confirm
  with one deliberate throw on a staging function.

### EF-02 · P2 · The gateway's own 401 (`verify_jwt = true`, expired or invalid JWT) has no `error` field
- `config.toml:420-450` turns on gateway verification. When the session has expired and
  supabase-js could not refresh it, the gateway answers before the function runs, with its own
  body (`{"msg": …}` / `{"message": …}`), not `{error}`.
- `cloud.js:154-158` reads `payload.error`, so it falls back to supabase-js's generic "Edge
  Function returned a non-2xx status code". `err.status` is 401, so:
  - vndb.js:277-281 maps it correctly to "The cloud session has expired" (no `upstream`);
  - ai.js:179 maps 401 to `auth`, which is correct;
  - **github-token via codegit.js:128** shows the generic text, not "sign in again", because it
    keeps only `p.error` and drops the status;
  - **ext-token via ext.js:186-192** keeps the status, but `ext.js:261` acts only on 404/409, so
    a 401 surfaces as the generic text.
- *To verify live:* the exact gateway body, and whether the gateway's 401 carries CORS headers.
  If it does not, this becomes EF-01's "network?" message.

### EF-03 · P3 · ai-chat `health` performs several unguarded reads in a loop
- ai-chat:493-497: for each provider it calls `usedToday` (unguarded `serviceRest`, see EF-01)
  and `listModels`, which is guarded at :339-342.
- One failed metering read fails the whole health check with a CORS-less 500, where "used:
  unknown" would do.

### EF-04 · P3 · github-token `status` reports `configured` only when not linked
- github-token:68 returns `{linked:true, repo, account}` without `configured`.
- If the App's secrets are later removed, a linked account reads as fine until `token` answers
  503 (:74).
- Cosmetic; the client handles the 503 message.

### EF-05 · P2 · runner: one user's failure aborts the whole tick for every user
- These calls have no try/catch inside the `for (const o of outlooks)` loop (runner/index.ts:112):
  - `serviceRest` for the claims (:137, :186);
  - the PATCHes (:146, :195);
  - `claim.json()` (:142, :191);
  - `pushAll`'s DELETE (:82);
  - `markSent` (:89).
- A network blip or missing env on one row throws out of `Deno.serve`. Every later user's pushes
  and runs wait for the next 5-minute tick, and pg_cron logs a 500.
- Pushes already delivered in this tick but not yet `markSent` (:173, :207) are sent **again**
  next tick (duplicate notification).
- Contrast: the reads use `rows()` inside try/catch with `continue` (:118, :164-165, :181-183).

### EF-06 · P3 · runner: module-level `results` can carry a failed tick's rows into the next reply
- runner/index.ts:74 `const results = []` lives at module scope and is emptied only by
  `results.splice(0)` on the success path (:212).
- After EF-05's throw, the next invocation in the same isolate returns the previous tick's
  device labels, push hosts and statuses as well.
- No key is ever stored there, and the reply is readable only by the project owner
  (`net._http_response`), so this is hygiene.
- `CRON_SECRET` itself is sound:
  - `sameSecret` (:37-42) compares over the longer length and folds the length difference into
    the result;
  - an unset secret is refused (:99);
  - `verify_jwt = false` is justified, because pg_cron has no user JWT (config.toml:441-442).

### EF-07 · P3 · steam-auth callback: an unreachable Steam gives a bare 500 page
- steam-auth:113-118: the `check_authentication` `fetch` and `vres.text()` are not caught.
- The user, who has just come back from Steam in a browser tab, gets the runtime's 500, not
  `htmlPage("Steam link failed", …)`.
- The nonce has already been consumed (:89), so a retry needs "Link Steam" again, which is
  correct but unexplained.

### EF-08 · P3 · A server misconfiguration reads as "sign in"
- `_shared/cors.ts:52`: when `SUPABASE_URL` or the anon/publishable key is missing,
  `requireUserId` returns `null`, so every function answers 401 "Sign in to cloud sync …".
- The vndb relay then tells a signed-in user that their session expired (vndb.js:279).
- A 503 "not configured" would be accurate.

## Checked and found sound (no finding)

- **Identity.** The user id always comes from `requireUserId`, never from the body.
  - steam-owned-games reads the SteamID only from `kos_steam` (:22-28).
  - ext-token and github-token key every row by the caller's `uid`.
  - runner reads only `kos_outlook`, `kos_push_subs`, `kos_push_sent` and `kos_runs`
    (invariant 131).
- **Input validation.**
  - vndb-ulist allow-lists `vote`/`labels_*` and validates the id and token shape (:22-61).
  - igdb-search strips `"` and `\` from the APIcalypse string (:80).
  - ext-token checks `redirectAllowed` (own origin or local dev, no query or hash), `stateOk`,
    `codeOk`, and the lease `holder` shape (:87; the client's 16 hex chars pass,
    ext.js:73-76).
  - runner's review `day` is checked `^\d{4}-\d{2}-\d{2}$` before it reaches a PostgREST filter
    (logic.ts:90), and a schedule id is `encodeURIComponent`-ed.
- **Error shapes on the paths the functions do handle** all match their callers.
  - ai-chat sends `{error, kind}` with 429/503/502 and `{used, cap}` on the daily cap; ai.js
    reads `payload.kind`, falling back to status.
  - vndb-ulist sends `{error, upstream, retryAfter}` with VNDB's 401/403/429 passed through;
    vndb.js:276-288 reads `err.payload.upstream` and `retryAfter`.
  - steam-owned-games' 200 with `kind:"private"` is handled (games.js:619).
  - ext-token's 404/409 are acted on (ext.js:261).
  - `KOS.cloud.invoke` (cloud.js:139-166) normalises everything into `err.message` +
    `err.status` + `err.payload`, and signed out it makes no request.
- **Secrets never returned or logged.**
  - ext-token and github-token keep refresh and installation tokens server-side and return
    one-hour access tokens only (invariants 110 and 157).
  - igdb-search caches the Twitch token in the isolate and never returns it.
  - steam-owned-games keeps the Steam key server-side.
- **The VNDB relay** is not an open proxy: JWT required, fixed upstream host, allow-listed body
  (invariant 19).
