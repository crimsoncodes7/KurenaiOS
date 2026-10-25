/* Kurenai OS — runner/logic.ts
   The runner's decisions, pure (docs/server-runner-plan.md §3–5), so Node
   holds them in smoke97 without a database or a network.

   The outlook a device published is the only input. The runner never
   re-derives a notice (invariant 131): it picks what is due, holds while a
   device is open, drops what is stale, and works out which scheduled
   messages are due in the user's own time zone. */

export const HOLD_MS = 5 * 60 * 1000;      // a device seen this recently holds pushes
export const STALE_MS = 30 * 60 * 1000;    // an item later than this is dropped

export type Item = { id: string; kind: string; at: number; title: string; body: string; view: string | null; arg: unknown };
export type Schedule = { id: string; name?: string; prompt: string; time: string; days: number[]; enabled: boolean };

/* the outlook items to send now: due, not stale, not sent */
export function dueItems(items: Item[], sent: Set<string>, now: number): Item[] {
  return (items || []).filter((it) => it && typeof it.id === "string" && typeof it.at === "number" &&
    it.at <= now && now - it.at <= STALE_MS && !sent.has(it.id));
}

/* what may go out this tick: everything due, or while a device is in front
   of the app only a test ("Send a test" asks for it there) */
export function sendable(items: Item[], hold: boolean): Item[] {
  return hold ? items.filter((it) => it.kind === "test") : items;
}

/* is any device in front of the app? */
export function present(seenAt: string | null | undefined, now: number): boolean {
  if (!seenAt) return false;
  const t = Date.parse(seenAt);
  return Number.isFinite(t) && now - t < HOLD_MS;
}

/* the wall clock in a time zone: {day "YYYY-MM-DD", hm "HH:MM", dow 0–6} */
export function localParts(now: number, tz: string): { day: string; hm: string; dow: number } {
  let zone = tz;
  try { new Intl.DateTimeFormat("en-GB", { timeZone: zone }); } catch { zone = "UTC"; }
  const parts: Record<string, string> = {};
  new Intl.DateTimeFormat("en-GB", {
    timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23", weekday: "short",
  }).formatToParts(new Date(now)).forEach((p) => { parts[p.type] = p.value; });
  const DOW: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return { day: `${parts.year}-${parts.month}-${parts.day}`, hm: `${parts.hour}:${parts.minute}`, dow: DOW[parts.weekday] ?? 0 };
}

/* the schedules due now: enabled, today one of its days, its time passed
   today (a schedule is today's until midnight, as on the device, invariant
   71b), and not already run for this local day */
export function dueSchedules(list: Schedule[], ran: Set<string>, now: number, tz: string): { s: Schedule; day: string }[] {
  const L = localParts(now, tz);
  return (list || []).filter((s) => s && s.enabled && /^([01]\d|2[0-3]):[0-5]\d$/.test(s.time) &&
    Array.isArray(s.days) && s.days.indexOf(L.dow) !== -1 && s.time <= L.hm && !ran.has(s.id + "|" + L.day))
    .map((s) => ({ s, day: L.day }));
}

/* the one message a scheduled run sends: the brief, then the prompt */
export function runPrompt(brief: unknown, prompt: string, builtAt: number, tz: string): { system: string; user: string } {
  const asOf = new Date(builtAt || Date.now()).toISOString();
  return {
    system: "You are Kurenai, the study companion inside KurenaiOS, answering a scheduled message while the app is closed. " +
      "You have no tools. Answer only from the BRIEF below: the learner's own week as their device last saw it (" + asOf + ", time zone " + tz + "). " +
      "If the answer needs something the brief does not hold, say plainly what you could not see. Be brief and concrete; British English.",
    user: "BRIEF (JSON):\n" + JSON.stringify(brief ?? {}).slice(0, 40000) + "\n\nMESSAGE:\n" + String(prompt || "").slice(0, 1000),
  };
}

/* the push a notification item becomes (the service worker shows it) */
export function pushMessage(it: { id: string; kind: string; title: string; body: string; view: string | null; arg: unknown }) {
  return { id: it.id, kind: it.kind, title: String(it.title || "").slice(0, 200), body: String(it.body || "").slice(0, 300),
    view: it.view ?? null, arg: it.arg ?? null };
}
