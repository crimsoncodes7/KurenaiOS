/* Kurenai OS — ext-token's pure half (docs/integrations-plan.md §3).
   No network, no Deno: the provider table, the redirect rule, the
   authorize URL and the reading of a token reply, so smoke112 can hold
   them from Node. */

export type Provider = "google" | "todoist";

export const PROVIDERS: Record<Provider, {
  authorize: string; token: string; revoke?: string; scopes: string[]; sep: string; extra: Record<string, string>;
}> = {
  google: {
    authorize: "https://accounts.google.com/o/oauth2/v2/auth",
    token: "https://oauth2.googleapis.com/token",
    revoke: "https://oauth2.googleapis.com/revoke",
    /* events on any calendar (two-way with the primary), the app's OWN
       secondary calendar (the one-way export), tasks, and who you are */
    scopes: [
      "openid", "email",
      "https://www.googleapis.com/auth/calendar.events",
      "https://www.googleapis.com/auth/calendar.app.created",
      "https://www.googleapis.com/auth/tasks",
    ],
    sep: " ",
    /* offline + consent: Google returns a refresh token on every connect */
    extra: { access_type: "offline", prompt: "consent", include_granted_scopes: "true", response_type: "code" },
  },
  todoist: {
    authorize: "https://app.todoist.com/oauth/authorize",
    token: "https://api.todoist.com/oauth/access_token",
    scopes: ["data:read_write", "data:delete"],
    sep: ",",
    extra: { response_type: "code" },
  },
};

export function isProvider(p: unknown): p is Provider {
  return p === "google" || p === "todoist";
}

/* A code is only ever sent back to the app itself: its public URL, or a
   local development host. Anything else is refused before a provider is
   asked (the provider checks its own registered list as well). */
export function redirectAllowed(uri: unknown, appUrl: string): boolean {
  if (typeof uri !== "string" || uri.length > 300) return false;
  let u: URL;
  try { u = new URL(uri); } catch { return false; }
  if (u.search || u.hash) return false;
  const app = new URL(appUrl);
  if (u.origin === app.origin) return true;
  return u.protocol === "http:" && (u.hostname === "localhost" || u.hostname === "127.0.0.1");
}

/* the state is the device's own one-time nonce, marked so the GitHub
   return handler leaves it alone */
export function stateOk(s: unknown): boolean {
  return typeof s === "string" && /^ext-(google|todoist)-[A-Za-z0-9]{12,64}$/.test(s);
}

export function authorizeUrl(p: Provider, clientId: string, redirect: string, state: string): string {
  const d = PROVIDERS[p];
  const q = new URLSearchParams({ client_id: clientId, redirect_uri: redirect, scope: d.scopes.join(d.sep), state, ...d.extra });
  return d.authorize + "?" + q.toString();
}

export function codeOk(c: unknown): c is string {
  return typeof c === "string" && c.length >= 6 && c.length <= 2048 && /^[A-Za-z0-9._~\/+=-]+$/.test(c);
}

/* the account a Google id_token names (read, not verified: it came
   straight from Google's token endpoint over TLS, and it is a label) */
export function emailFromIdToken(idToken: unknown): string {
  if (typeof idToken !== "string") return "";
  const part = idToken.split(".")[1];
  if (!part) return "";
  try {
    const b = part.replace(/-/g, "+").replace(/_/g, "/");
    const txt = atob(b + "===".slice((b.length + 3) % 4));
    const claims = JSON.parse(txt);
    return typeof claims.email === "string" ? claims.email : "";
  } catch { return ""; }
}

/* a token reply → what a device gets: the access token and when it ends
   (an hour unless the provider says otherwise; never past 24 hours) */
export function accessOf(reply: Record<string, unknown> | null, now: number) {
  const tok = reply && typeof reply.access_token === "string" ? reply.access_token : "";
  if (!tok) return null;
  const secs = Math.min(Math.max(Number(reply!.expires_in) || 3600, 60), 86400);
  return { token: tok, expires_at: new Date(now + secs * 1000).toISOString(),
    refresh: typeof reply!.refresh_token === "string" ? reply!.refresh_token : "" };
}
