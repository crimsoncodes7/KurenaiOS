/* Kurenai OS — Edge Function: igdb-search (Build 4c)
   Authenticated IGDB title search for the Games module. The Twitch app
   credentials live ONLY in function secrets; the browser sees a stable
   normalised result shape, never the upstream payload or any token.

   POST { query: string, platform?: "pc"|"playstation"|"xbox"|"switch" }
   → 200 { results: [{ igdbId, title, releaseDate, genres, platforms,
                        platformGuess, coverUrl, publisher }] }
   → 400 invalid input · 401 no/invalid JWT · 503 not configured
   (verify_jwt is ON at the platform level too; the in-function check is
   defence in depth and yields the user id we rate-limit by design around.) */
import { corsHeaders, json, preflight, requireUserId } from "../_shared/cors.ts";

/* IGDB platform ids per app platform enum (verified against IGDB docs:
   6 PC · 9 PS3 · 48 PS4 · 167 PS5 · 12 X360 · 49 XONE · 169 Series X|S ·
   130 Switch) */
const PLATFORM_IDS: Record<string, number[]> = {
  pc: [6],
  playstation: [9, 48, 167],
  xbox: [12, 49, 169],
  switch: [130],
};

/* app-enum guess from IGDB platform names, first match wins */
function guessPlatform(names: string[]): string | null {
  const joined = names.join(" ").toLowerCase();
  if (/pc|windows|mac|linux/.test(joined)) return "pc";
  if (/playstation/.test(joined)) return "playstation";
  if (/xbox/.test(joined)) return "xbox";
  if (/switch|nintendo/.test(joined)) return "switch";
  return names.length ? "other" : null;
}

let cachedToken: { token: string; expires: number } | null = null;

async function twitchToken(clientId: string, secret: string): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expires - 60_000) return cachedToken.token;
  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${encodeURIComponent(clientId)}` +
      `&client_secret=${encodeURIComponent(secret)}&grant_type=client_credentials`,
    { method: "POST" },
  );
  if (!res.ok) throw new Error(`Twitch token request failed (${res.status})`);
  const body = await res.json();
  cachedToken = { token: body.access_token, expires: Date.now() + (body.expires_in ?? 3600) * 1000 };
  return cachedToken.token;
}

async function igdbQuery(clientId: string, token: string, body: string): Promise<Response> {
  return fetch("https://api.igdb.com/v4/games", {
    method: "POST",
    headers: { "Client-ID": clientId, Authorization: `Bearer ${token}`, "Content-Type": "text/plain" },
    body,
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return preflight();
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  const userId = await requireUserId(req);
  if (!userId) return json({ error: "Sign in to cloud sync to use game search." }, 401);

  const clientId = Deno.env.get("TWITCH_CLIENT_ID");
  const secret = Deno.env.get("TWITCH_CLIENT_SECRET");
  if (!clientId || !secret) {
    return json({ error: "IGDB search isn't configured on the server yet." }, 503);
  }

  let input: { query?: unknown; platform?: unknown };
  try { input = await req.json(); } catch { return json({ error: "Invalid JSON body." }, 400); }
  const query = typeof input.query === "string" ? input.query.trim() : "";
  if (query.length < 2) return json({ error: "Query too short." }, 400);
  if (query.length > 80) return json({ error: "Query too long." }, 400);
  const platform = typeof input.platform === "string" && PLATFORM_IDS[input.platform]
    ? input.platform : null;

  /* APIcalypse body — the search term is quoted; strip the one character
     that could break out of the string literal */
  const safe = query.replace(/["\\]/g, " ");
  const where = platform ? ` where platforms = (${PLATFORM_IDS[platform].join(",")});` : "";
  const body =
    `search "${safe}"; fields name,first_release_date,genres.name,platforms.name,` +
    `cover.image_id,involved_companies.company.name,involved_companies.publisher; limit 20;${where}`;

  try {
    let token = await twitchToken(clientId, secret);
    let res = await igdbQuery(clientId, token, body);
    if (res.status === 401) {           // token expired server-side — refresh once
      cachedToken = null;
      token = await twitchToken(clientId, secret);
      res = await igdbQuery(clientId, token, body);
    }
    if (res.status === 429) return json({ error: "IGDB is rate-limiting — try again in a moment." }, 429);
    if (!res.ok) return json({ error: `IGDB returned HTTP ${res.status}.` }, 502);
    const rows = await res.json();

    const results = (Array.isArray(rows) ? rows : []).map((g) => {
      const platformNames: string[] = (g.platforms ?? []).map((p: { name?: string }) => p?.name).filter(Boolean);
      const publisher = (g.involved_companies ?? [])
        .filter((c: { publisher?: boolean }) => c?.publisher)
        .map((c: { company?: { name?: string } }) => c?.company?.name)
        .filter(Boolean)[0] ?? "";
      return {
        igdbId: g.id ?? null,
        title: String(g.name ?? "Untitled"),
        releaseDate: typeof g.first_release_date === "number"
          ? new Date(g.first_release_date * 1000).toISOString().slice(0, 10)
          : null,
        genres: (g.genres ?? []).map((x: { name?: string }) => x?.name).filter(Boolean),
        platforms: platformNames,
        platformGuess: guessPlatform(platformNames),
        coverUrl: g.cover?.image_id
          ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${g.cover.image_id}.jpg`
          : null,
        publisher,
      };
    });
    return json({ results });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "IGDB request failed." }, 502);
  }
});
