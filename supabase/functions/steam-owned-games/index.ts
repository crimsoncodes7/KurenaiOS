/* Kurenai OS — Edge Function: steam-owned-games (Build 4c)
   Returns the authenticated user's owned Steam library — for the VERIFIED
   SteamID stored by steam-auth only. A client-supplied SteamID is never
   accepted; the Steam Web API key never leaves the server.

   POST {} (JWT required; verify_jwt is also ON at the platform level)
   → 200 { steamId, games: [{ appId, title, playtimeHours }] }
   → 401 no/invalid JWT · 409 no verified link · 502/503 upstream/config
   Private profiles return a specific, actionable message.               */
import { json, preflight, requireUserId, serviceRest } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return preflight();
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  const userId = await requireUserId(req);
  if (!userId) return json({ error: "Sign in to cloud sync first." }, 401);

  const key = Deno.env.get("STEAM_API_KEY");
  if (!key) return json({ error: "Steam import isn't configured on the server yet." }, 503);

  /* the ONLY source of identity: the row steam-auth verified */
  const sel = await serviceRest(`kos_steam?user_id=eq.${userId}&select=steam_id`);
  const rows = sel.ok ? await sel.json() : [];
  if (!rows.length) {
    return json({ error: "No verified Steam account is linked — use “Link Steam” first.", kind: "unlinked" }, 409);
  }
  const steamId: string = rows[0].steam_id;

  try {
    const res = await fetch(
      "https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/" +
        `?key=${encodeURIComponent(key)}&steamid=${encodeURIComponent(steamId)}` +
        "&include_appinfo=1&include_played_free_games=1&format=json",
    );
    if (res.status === 401 || res.status === 403) {
      return json({ error: "Steam rejected the server's API key — it may need regenerating." }, 502);
    }
    if (res.status === 429) return json({ error: "Steam is rate-limiting — try again in a minute." }, 429);
    if (!res.ok) return json({ error: `Steam returned HTTP ${res.status}.` }, 502);

    const body = await res.json();
    const games = body?.response?.games;
    if (!Array.isArray(games)) {
      return json({
        error: "Steam returned no library. The profile's Game Details are probably Private or Friends-only — " +
          "set them to Public (Steam → Profile → Privacy Settings → Game Details), wait a minute, then retry.",
        kind: "private",
      }, 200);
    }
    const normalised = games
      .map((g: { appid?: number; name?: string; playtime_forever?: number }) => ({
        appId: g.appid ?? null,
        title: String(g.name ?? "").trim(),
        playtimeHours: Math.round(((g.playtime_forever ?? 0) / 60) * 10) / 10,
      }))
      .filter((g) => g.appId != null && g.title)
      .sort((a, b) => a.title.localeCompare(b.title));
    return json({ steamId, count: normalised.length, games: normalised });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Steam request failed." }, 502);
  }
});
