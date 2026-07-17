/* Kurenai OS Edge Functions — shared CORS + response helpers (Build 4c).
   The app runs from file:// (Origin: null), localhost and pages.dev, and
   every protected operation is authorised by the caller's Supabase JWT —
   so CORS is permissive by design; authentication is the boundary. */

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export function preflight(): Response {
  return new Response(null, { status: 204, headers: corsHeaders });
}

/* Runtime env (verified against the Supabase docs, not assumed): every
   function automatically receives SUPABASE_URL plus the legacy
   SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY AND, on new-key projects,
   SUPABASE_PUBLISHABLE_KEYS / SUPABASE_SECRET_KEYS. Accept either
   generation so the functions survive a legacy-key disable. */
function firstKey(name: string): string | null {
  const v = Deno.env.get(name);
  if (!v) return null;
  try {
    const arr = JSON.parse(v);
    if (Array.isArray(arr) && arr.length) return String(arr[0]);
  } catch { /* not JSON — fall through */ }
  const first = v.split(",")[0].trim();
  return first || null;
}
function anonKey(): string | null {
  return Deno.env.get("SUPABASE_ANON_KEY") ?? firstKey("SUPABASE_PUBLISHABLE_KEYS");
}
function serviceKey(): string | null {
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? firstKey("SUPABASE_SECRET_KEYS");
}

/* Validate the caller's JWT against the auth server and return the user id,
   or null. Never trusts client-supplied identity fields — only the token. */
export async function requireUserId(req: Request): Promise<string | null> {
  const auth = req.headers.get("Authorization") ?? "";
  if (!auth.startsWith("Bearer ")) return null;
  const url = Deno.env.get("SUPABASE_URL");
  const anon = anonKey();
  if (!url || !anon) return null;
  const res = await fetch(`${url}/auth/v1/user`, {
    headers: { Authorization: auth, apikey: anon },
  });
  if (!res.ok) return null;
  const user = await res.json();
  return typeof user?.id === "string" ? user.id : null;
}

/* Service-role REST helper — used ONLY for the operations that genuinely
   need it (nonce table, verified-identity writes). Secrets never leave the
   server; errors carry status only. */
export async function serviceRest(
  path: string,
  init: RequestInit & { headers?: Record<string, string> } = {},
): Promise<Response> {
  const url = Deno.env.get("SUPABASE_URL");
  const key = serviceKey();
  if (!url || !key) throw new Error("service configuration missing");
  return fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
}
