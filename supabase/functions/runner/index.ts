/* Kurenai OS — Edge Function: runner (roadmap 5.7 item 1,
   docs/server-runner-plan.md). What reaches a closed app.

   Called ONLY by pg_cron, every five minutes, with
   `Authorization: Bearer <CRON_SECRET>` (compared in constant time;
   verify_jwt is off because no user calls it). For every published outlook
   (kos_outlook, one row a user):

     1. if no device has beaten presence in the last five minutes, the
        outlook items now due (and not stale, not sent) go out as Web
        Pushes to every subscription, and are recorded in kos_push_sent;
        a subscription the push service calls gone (404/410) is deleted;
     2. with `serverRuns` on, each scheduled message due in the user's own
        time zone is claimed in kos_runs, answered from the brief by ONE
        text-only model request (runner/model.ts, metered), stored, and
        pushed unless a device is open.

   It never re-derives a notice (invariant 131) and never reads kos_state,
   media, files or any credential. Secrets: CRON_SECRET, VAPID_PUBLIC_KEY,
   VAPID_PRIVATE_KEY, VAPID_SUBJECT, the provider keys. */
import { json, serviceRest } from "../_shared/cors.ts";
import { send, type Sub, type Vapid } from "./webpush.ts";
import { dueItems, dueSchedules, present, pushMessage, runPrompt, type Item, type Schedule } from "./logic.ts";
import { answer } from "./model.ts";

const RUNS_PER_TICK = 3;

function sameSecret(a: string, b: string): boolean {
  const x = new TextEncoder().encode(a), y = new TextEncoder().encode(b);
  let d = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) d |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return d === 0;
}
async function rows<T>(path: string): Promise<T[]> {
  const res = await serviceRest(path);
  if (!res.ok) throw new Error(`read failed (${res.status})`);
  return await res.json() as T[];
}
function enc(v: string): string { return encodeURIComponent(v); }

type Outlook = { user_id: string; data_json: {
  tz?: string; builtAt?: number; items?: Item[]; brief?: unknown;
  serverRuns?: boolean; schedules?: Schedule[]; route?: { provider?: string; model?: string } | null;
}; seen_at: string | null };

async function pushAll(userId: string, subs: Sub[], msg: unknown, vapid: Vapid, topic: string): Promise<number> {
  let ok = 0;
  for (const s of subs) {
    let status = 0;
    try { status = await send(s, msg, vapid, { topic }); } catch { status = 0; }
    if (status === 404 || status === 410) {
      await serviceRest(`kos_push_subs?user_id=eq.${userId}&endpoint=eq.${enc(s.endpoint)}`, { method: "DELETE" });
    } else if (status >= 200 && status < 300) ok++;
  }
  return ok;
}
async function markSent(userId: string, ids: string[]) {
  if (!ids.length) return;
  await serviceRest("kos_push_sent", {
    method: "POST",
    headers: { Prefer: "resolution=ignore-duplicates,return=minimal" },
    body: JSON.stringify(ids.map((id) => ({ user_id: userId, item_id: id }))),
  });
}

Deno.serve(async (req) => {
  const secret = Deno.env.get("CRON_SECRET") ?? "";
  const auth = req.headers.get("Authorization") ?? "";
  if (!secret || !auth.startsWith("Bearer ") || !sameSecret(auth.slice(7), secret)) return json({ error: "Not allowed." }, 401);

  const vapid: Vapid | null = Deno.env.get("VAPID_PRIVATE_KEY") && Deno.env.get("VAPID_PUBLIC_KEY")
    ? { publicKey: Deno.env.get("VAPID_PUBLIC_KEY")!, privateKey: Deno.env.get("VAPID_PRIVATE_KEY")!,
        subject: Deno.env.get("VAPID_SUBJECT") ?? "mailto:kurenai@example.invalid" }
    : null;
  const now = Date.now();
  const out = { users: 0, pushed: 0, runs: 0, held: 0 };

  let outlooks: Outlook[] = [];
  try { outlooks = await rows<Outlook>("kos_outlook?select=user_id,data_json,seen_at"); }
  catch { return json({ error: "The outlook could not be read." }, 502); }

  for (const o of outlooks) {
    out.users++;
    const uid = o.user_id, d = o.data_json || {};
    const hold = present(o.seen_at, now);
    if (hold) out.held++;
    let subs: Sub[] = [];
    try { subs = await rows<Sub>(`kos_push_subs?user_id=eq.${uid}&select=endpoint,p256dh,auth`); } catch { subs = []; }

    /* 1. the outlook's due items */
    if (!hold && vapid && subs.length && Array.isArray(d.items)) {
      const since = new Date(now - 2 * 864e5).toISOString();
      let sent = new Set<string>();
      try { sent = new Set((await rows<{ item_id: string }>(`kos_push_sent?user_id=eq.${uid}&sent_at=gte.${enc(since)}&select=item_id`)).map((r) => r.item_id)); }
      catch { continue; }
      const due = dueItems(d.items, sent, now);
      const done: string[] = [];
      for (const it of due) {
        if (await pushAll(uid, subs, pushMessage(it), vapid, it.id)) out.pushed++;
        done.push(it.id);
      }
      await markSent(uid, done);
    }

    /* 2. scheduled messages the server owns */
    if (d.serverRuns && Array.isArray(d.schedules) && d.schedules.length) {
      const tz = d.tz || "UTC";
      let ran = new Set<string>();
      try {
        const recent = await rows<{ schedule_id: string; day: string }>(`kos_runs?user_id=eq.${uid}&updated_at=gte.${enc(new Date(now - 2 * 864e5).toISOString())}&select=schedule_id,day`);
        ran = new Set(recent.map((r) => r.schedule_id + "|" + r.day));
      } catch { continue; }
      for (const { s, day } of dueSchedules(d.schedules, ran, now, tz).slice(0, RUNS_PER_TICK)) {
        /* claim first: a second tick finding the row skips it */
        const claim = await serviceRest("kos_runs", {
          method: "POST",
          headers: { Prefer: "resolution=ignore-duplicates,return=representation" },
          body: JSON.stringify([{ user_id: uid, schedule_id: s.id, day, ok: false, text: "" }]),
        });
        const claimed = claim.ok ? await claim.json() : [];
        if (!Array.isArray(claimed) || !claimed.length) continue;
        const p = runPrompt(d.brief, s.prompt, d.builtAt ?? now, tz);
        const r = await answer(uid, d.route ?? null, p.system, p.user);
        await serviceRest(`kos_runs?user_id=eq.${uid}&schedule_id=eq.${enc(s.id)}&day=eq.${day}`, {
          method: "PATCH", headers: { Prefer: "return=minimal" },
          body: JSON.stringify({ ok: r.ok, text: r.text.slice(0, 4000) }),
        });
        out.runs++;
        if (!hold && vapid && subs.length) {
          const id = "asst:" + s.id + ":" + day;
          const msg = pushMessage({ id, kind: "assistant",
            title: r.ok ? "Kurenai · " + (s.name || s.prompt.slice(0, 60)) : "Kurenai couldn't send “" + (s.name || s.prompt).slice(0, 50) + "”",
            body: r.text.replace(/[#>*_`|]/g, "").replace(/\s+/g, " ").slice(0, 280),
            view: "assistant", arg: { tab: "scheduled", run: s.id } });
          if (await pushAll(uid, subs, msg, vapid, id)) out.pushed++;
          await markSent(uid, [id]);
        }
      }
    }
  }
  return json(out);
});
