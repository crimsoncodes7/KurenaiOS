# CATEGORY 6 — Kurenai Assistant: Implementation Plan

This is the design record and resume point for the Category 6 workstream: a
system-wide, context-aware, tool-calling AI layer over KurenaiOS. Updated at
every checkpoint and before every commit. The **Live status** section at the
end is authoritative for "where are we".

---

## 1. Architecture & request flow

KurenaiOS is a script-tag-global, no-bundler app (`KOS` namespace, strict
`index.html` load order, `file://`-capable). The assistant follows the same
architecture: new flat files, no modules, feature-checked lazily so the app
runs unchanged with no cloud config and no Ollama.

### New files

| File | Owns |
|------|------|
| `js/core/ai.js` | `KOS.ai` — provider abstraction: normalized message/tool/result shapes, adapters (Ollama local transport; Gemini + DeepSeek via the `ai-chat` Edge Function), capability flags, health checks, per-category routing, fallback config, timeouts/cancellation, request correlation ids, normalized errors |
| `js/core/aitools.js` | `KOS.ai.tools` — the explicit tool registry: schemas, validation, execution wrappers over existing `KOS.*` domain functions, autonomy metadata, result sanitization |
| `js/core/aiorchestrator.js` | `KOS.ai.orchestrator` — the conversation/tool loop: live context capture + revalidation, bounded iterations, confirmation gating and integrity, audit-log writes, undo where supported |
| `js/core/aimemory.js` | `KOS.ai.memory` + `KOS.ai.convo` — conversation persistence and cross-session memory over the Build 4a Supabase patterns; bounded context-window assembly |
| `js/modules/assistant.js` | The three UI surfaces: global drawer (topbar button), contextual actions helper, dedicated `assistant` view (settings/history/memory/permissions/audit) |
| `supabase/functions/ai-chat/index.ts` | External-provider proxy: JWT auth, provider REST calls via raw `fetch()`, usage metering + rate limiting, safe error normalization |
| `supabase/migrations/2026XXXXXXXXXX_kos_assistant.sql` | Tables + RLS + the atomic metering function (§4) |

Script-tag order: `ai.js` after `gameapi.js` (needs `cloud.js`);
`aitools.js` + `aiorchestrator.js` + `aimemory.js` after every domain module
they wrap would be ideal, but core loads before modules — so the registry
DEFERS binding: tools resolve their `KOS.*` target at call time (the same
lazy feature-check style as `cloud.js`), never at load time.
`assistant.js` loads with the other modules. All follow the existing pattern:
missing config degrades to clear messages, never a crash.

### Request flow (external providers)

1. UI (drawer/page/contextual action) → `orchestrator.send(convo, userMsg)`.
2. Orchestrator captures **live context** (current view via `KOS.store.state.ui`
   + the section registry, selected topic/entry identifiers, active filters)
   and assembles: system prompt, bounded history (§Phase D), allowed tool
   schemas (filtered by user permissions), minimal context block.
3. `KOS.ai.chat(category, request)` routes per task category → adapter.
   External adapters call the `ai-chat` Edge Function with the user's JWT
   (via `KOS.cloud.client().functions.invoke`, same as `gameapi.js`).
4. `ai-chat` authenticates (`requireUserId`), checks the per-user daily cap
   atomically, calls the provider's documented REST endpoint with raw
   `fetch()` (no SDK), records usage, returns a **normalized** response
   `{text?, toolCalls?, usage, finishReason, correlationId}`.
5. Orchestrator validates any proposed tool call (name in registry →
   permission → argument schema → required context → target identity),
   gates by autonomy tier (auto / confirm card), executes the registered
   wrapper over the existing KOS domain function, writes audit rows.
6. Sanitized tool result goes back into the next provider turn. Loop
   continues within hard bounds (§Phase C).

Ollama uses the same normalized interface but a client-side transport
(browser `fetch` to the user's configured endpoint) — no Edge Function, no
JWT requirement for the transport itself (tool execution and audit still
require what they require).

### Execution boundaries

- **Client (browser)**: context, tool validation/gating/execution via
  existing domain functions, confirmation UI, undo, conversation/memory
  reads-writes through the user's own authenticated session (normal RLS),
  Ollama transport.
- **Server (`ai-chat` Edge Function)**: provider secrets, provider REST
  calls, usage metering, rate limiting, error normalization. It NEVER
  executes tools and NEVER touches user KurenaiOS data tables.
- **Privileged access (documented)**: the Edge Function uses the service
  role for exactly one purpose — calling the atomic metering function /
  writing `kos_ai_usage` rows (server-owned infrastructure data, mirroring
  the `kos_steam` precedent). No user-data operation ever uses service role.

### Untrusted-output rule

Every model response, tool argument, and generated record is validated
client-side against the registry schema and the real application schema
before anything persists. Retrieved user content (notes, entry titles,
memory) is data — the system prompt states it cannot override tool
permissions or confirmation rules, and the orchestrator never re-parses tool
results for instructions.

---

## 2. Providers

No SDKs. Documented REST endpoints, translated behind adapters:

| Provider | Endpoint | Notes |
|----------|----------|-------|
| Gemini | `POST https://generativelanguage.googleapis.com/v1beta/models/<model>:generateContent` (`x-goog-api-key` header) | `contents[]` with `role user/model`, `systemInstruction`, `tools:[{functionDeclarations}]`, `functionCall`/`functionResponse` parts, `generationConfig.responseSchema` + `responseMimeType:"application/json"` for structured output, `usageMetadata` |
| DeepSeek | `POST https://api.deepseek.com/chat/completions` (Bearer key) | OpenAI-compatible: `messages[]`, `tools:[{type:"function",function}]`, `tool_calls`, `response_format:{type:"json_object"}`, `usage` |
| Ollama | `POST <endpoint>/api/chat` (default `http://127.0.0.1:11434`) | `messages[]`, `tools`, `message.tool_calls`, `format` (JSON schema) for structured output; health via `GET /api/tags`; model capability probed via `POST /api/show` |

Verify exact request/response field names against current docs at Phase A
implementation time (WebFetch) — do not trust memory.

**Capability flags** per configured model: `{toolCalling, structuredOutput,
streaming, systemPrompt}`. Ollama capabilities depend on the pulled model —
health check reports the configured model's presence; tool-calling support is
declared by the user-picked model (documented in the checklist) with a
runtime failure surfaced clearly if the model ignores tools.

**Routing** (per task category, user-configurable, exact model ids
configurable — these are defaults):

| Category | Default |
|----------|---------|
| `tutor` (conversational/explanations) | Gemini `gemini-3.5-flash` |
| `crud` (simple tool requests) | local Ollama (user-configured model) |
| `generation` (structured flashcards/quiz) | DeepSeek `deepseek-v4-flash` |
| `complex` (multi-step/ambiguous) | Gemini `gemini-3.5-flash` |

Fallback: explicit per-category setting, default **off** for anything that
would move local→billable. Ollama unavailable + fallback disabled → clear
error, no silent switch. Ollama assumed unavailable by default on phones
(availability check still runs only on demand).

**Streaming**: Phase A ships non-streaming end-to-end (Edge Functions +
normalized contract support it later without orchestrator changes; the
interface carries a `stream` flag and the UI renders progressive text when a
transport provides it). Recorded as an intentional simplification.

### Secrets & keys

`GEMINI_API_KEY`, `DEEPSEEK_API_KEY` — Supabase Edge Function secrets only
(`supabase secrets set`), same pattern as `STEAM_API_KEY`. Never in the repo,
client, logs, tool records, or error messages. Keys are requested from the
user only immediately before the first live external-provider verification.

### Rate limiting & usage (server-enforced)

- `kos_ai_usage` rows per request: user, provider, model, category,
  request time, outcome, token usage when returned, rate-limit decision,
  correlation id. No prompts, no message content, no secrets.
- Daily cap per user per external provider, enforced **atomically** by a
  `security definer` SQL function (`kos_ai_consume(p_provider, p_day)`) that
  upserts a counter row with `... on conflict do update ... where` so
  concurrent requests cannot pass the cap (row-level lock in one statement).
  Called by the Edge Function before the provider call; refusals recorded.
- Client reads its own usage via RLS `select` for the UI cap display.
- Ollama usage tracked client-side for visibility only (kv), never metered
  as spend.

---

## 3. Phases & acceptance criteria

**Phase A — provider layer.** `js/core/ai.js` + `ai-chat` Edge Function +
migration (usage/metering part). Normalized chat with tool definitions and
structured output across all three adapters; capability flags; health checks;
routing + fallback config persisted in `state.assistant`; timeouts,
cancellation, bounded retries (never after a tool may have executed);
correlation ids; normalized errors; server cap concurrency-safe.
*Accept when*: smoke20 green (adapters translate shapes correctly against
mocked fetch; routing honours config; no silent fallback; cap function
refuses at limit including concurrent simulation at the SQL level — the SQL
concurrency property itself is proven in the live integration script), all
existing suites green, committed.

**Phase B — tool layer.** `js/core/aitools.js` implementing the registry in
§5 exactly; the hub search extraction; the custom-quiz store (gap §5.9);
generation tools grounded in `KOS.content.get`; validation-before-save
everywhere. *Accept when*: smoke21 green (valid/invalid args per tool family,
malformed generation rejected before persistence with zero partial saves,
enum rejection, batch atomicity), all suites green, committed.

**Phase C — orchestrator.** Loop bounds, live-context revalidation before
every context-dependent execution, stale-target failure, autonomy tiers +
confirmation integrity (bound to exact tool+normalized args+target+session,
expiring, re-confirm on any change), audit log lifecycle rows, undo where the
architecture supports it (see §5 per-tool). *Accept when*: smoke22 green
(loop caps, duplicate-call guard, expired/changed confirmation, audit state
transitions with mocked Supabase), suites green, committed.

**Phase D — memory.** Conversations + messages + memory tables; create/
resume/rename/browse/delete; bounded context assembly (recent N messages +
running summary row updated client-side); memory only via explicit ask or
approved proposal; no secrets in memory. *Accept when*: smoke23 green
(persistence round-trip with mocked API, context bounding, memory rules),
suites green, committed.

**Phase E — UI.** Drawer (every page, shell-level button), contextual
actions (registered per-view through one shared helper reading the same
orchestrator), dedicated `assistant` view (history, routing, availability,
usage/caps, memory manager, permissions, audit, confirmation states).
Automation management: **no automation engine exists in KurenaiOS** — the
section is omitted; recorded as deferred (§10). *Accept when*: smoke24 green
(surfaces mount, permission edits can't weaken consequential minimum,
provider-offline states render), phone-tier CSS respected, suites green,
committed.

**Phase F — verification.** §9 test matrix fully executed; live browser
verification via Claude in Chrome against the running app with real Gemini
(keys requested from the user at this point, not before);
`tools/assistant_integration.mjs` proves RLS isolation + cap concurrency
against the real project; Ollama user-assisted checklist delivered. Final
report.

Checkpoint discipline: full smoke suite + new tests before every phase
commit; `CATEGORY6_PLAN.md` + `PROGRESS.md` updated; diffs reviewed for
unrelated changes; one phase at a time.

---

## 4. Database migrations & RLS

One migration (split if a later phase needs additions):

- `kos_ai_usage` — `(id, user_id, provider, model, category, outcome,
  prompt_tokens, completion_tokens, rate_limited, correlation_id,
  created_at)`. RLS: owner `select` only; **writes via service role only**
  (documented privileged use — server-owned metering, `kos_steam`
  precedent).
- `kos_ai_daily` — `(user_id, provider, day, used, primary key(user_id,
  provider, day))` + `kos_ai_consume()` security-definer function (atomic
  check-and-increment against the cap). Service-role/definer only; owner
  `select` for the UI.
- `kos_assistant_conversations` — `(id uuid, user_id, title, summary,
  created_at, updated_at + touch trigger)`. Owner-only CRUD policies.
- `kos_assistant_messages` — `(id, conversation_id, user_id, role, content
  jsonb, created_at)`. Owner-only CRUD. (Tool-call transcript detail lives in
  content jsonb, sanitized.)
- `kos_assistant_memory` — `(id, user_id, content text, origin, created_at,
  updated_at)`. Owner-only CRUD.
- `kos_assistant_audit` — `(id, user_id, conversation_id, correlation_id,
  tool, provider, model, args_json (sanitized), target text, tier, status
  [proposed|awaiting_confirmation|confirmed|rejected|executed|failed],
  result_summary, error_summary, created_at, updated_at)`. Owner `select` +
  `insert` + `update` (status transitions) — no delete policy (history
  integrity); revisit only with explicit user decision.

All timestamps server-generated (shared `kos_touch_updated_at` trigger).
RLS isolation is tested positively and negatively in
`tools/assistant_integration.mjs` (two throw-away users, same pattern as
`cloud_integration.mjs`).

Offline/signed-out behaviour: conversations, memory, and audit require the
cloud session (they are Supabase-backed by the brief). Signed out, the
assistant still works with Ollama for the **current** in-memory conversation
with tools that don't need cloud; persistence surfaces state this plainly.
Audit rows for executed tools while signed out are queued client-side (kv)
and flushed on sign-in — recorded as a design decision to keep the audit
complete without inventing a second permanent store.

---

## 5. Phase B tool registry (exhaustive, derived from the codebase)

Conventions used below —
**fn**: the real implementation target. **wrap**: callable directly;
**extract**: shared logic must first be pulled out of a UI function (noted).
**R/W**: read or write. **Tier**: `read` | `reversible` | `consequential`
(minimum; users may tighten, never loosen destructive minimums).
**ctx**: required live application context beyond arguments (— means none).
**idem**: idempotency/duplicate-call note. Input/output schemas are stated
compactly here; the registry code carries full JSON Schemas. Every tool gets
valid-call + invalid-args + (where applicable) missing-target tests in
smoke21, plus the Phase F matrix. Status is **supported** unless marked.
Undo: only tools marked `undo:yes` register a reliable inverse; others rely
on tier gating.

Shared validation primitives (applied everywhere applicable):
subject ∈ {compsci, maths, it}; ref must exist in `KOS.hub.BYREF[sid]`;
module ∈ {anime, books, vn, game}; media status ∈ mediadb.STATUSES;
score 0–10; dates `YYYY-MM-DD` and real; strings length-capped; ids must
resolve to a live record at execute time (revalidated, not trusted from
proposal time); numeric ranges per field; unknown fields rejected.

### 5.1 Study

1. **study.list_subjects** — R/read. fn: `KOS_DATA` + `KOS.hub.LEAVES` +
   `KOS.content.coverage`. wrap. in: `{}`. out: `[{sid, name, leafCount,
   contentCovered, progressCounts}]`. ctx —. idem: pure.
2. **study.list_topics** — R/read. fn: `KOS.hub.LEAVES[sid]` +
   `KOS.store.peekProgress`. wrap. in: `{subject, section?, status?}`.
   out: `[{ref, title, section, status, rag, hasContent}]`. Output capped
   (paged) — never the whole content bodies.
3. **study.get_topic** — R/read. fn: `KOS.hub.BYREF` + `KOS.content.get/has`
   + `KOS.store.peekProgress` + `KOS.intel` data. wrap. in: `{subject, ref}`.
   out: `{ref, title, path, specLines, status, check[4], note, hasNotes,
   counts:{flashcards, quiz, exam}}`.
4. **study.read_notes** — R/read. fn: `KOS.content.get(sid,ref).notes`
   serialized block-by-block to plain text (new pure serializer in
   aitools.js — rendering stays in content.js). wrap+small serializer.
   in: `{subject, ref, page?}`. out: `{text, pages}`. Canonical content, not
   the search snippet.
5. **study.search_spec** — R/read. fn: hub search — **extract**: expose the
   existing index walk as `KOS.hub.search(q)` (topbar `runSearch` keeps its
   DOM; the match loop moves to the shared function; `SEARCH_INDEX` is
   currently closure-private). in: `{query}`. out: `[{subject, ref, title,
   snippet, flashcardMatch}]` (≤30).
6. **study.set_topic_status** — W/reversible, undo:yes (restore prior).
   fn: `KOS.store.setStatus`. wrap. in: `{subject, ref, status ∈
   none|started|paused|done}`. idem: same-value call is a no-op.
7. **study.set_topic_check** — W/reversible, undo:yes. fn:
   `KOS.store.setCheck`. wrap. in: `{subject, ref, index 0–3, value bool}`.
   Note: setCheck's auto done/started rule applies — documented in tool desc.
8. **study.set_topic_note** — W/reversible, undo:yes (prior text restored).
   fn: `KOS.store.setNote`. wrap. in: `{subject, ref, note ≤5000}`.
   Overwrites — tool description says so; orchestrator includes prior note
   in the confirmation-free activity line.
9. **study.list_flashcards** — R/read. fn: `KOS.srs.cardsFor` /
   `customCards`. wrap. in: `{subject?, ref?, origin? ∈ all|curriculum|
   custom}`. out: `[{key, q, a, custom, due?}]` capped/paged.
10. **study.add_flashcard** — W/reversible, undo:yes (delete the created
    card). fn: `KOS.srs.addCustom`. wrap. in: `{subject ∈ sids ∪ "personal",
    ref, q ≤2000, a ≤2000}`. Validation: for curriculum sids ref must exist
    in BYREF; `personal` refs are free-form ≤60. idem: duplicate q+a on the
    same topic within one request is rejected (duplicate-call guard).
11. **study.update_flashcard** — W/reversible, undo:yes. fn:
    `KOS.srs.updateCustom`. wrap. in: `{id, q, a}`. Custom cards only —
    curriculum cards are hand-authored and immutable (matches UI).
12. **study.delete_flashcard** — W/**consequential**. fn:
    `KOS.srs.deleteCustom` (drops schedule too). wrap. in: `{id}`.
13. **study.rate_flashcard** — W/reversible. fn: `KOS.srs.rate`. wrap.
    in: `{key, rating 0–3}`. Key must resolve via `allCards()`. No session
    is logged (matches per-rating engine behaviour — sessions log at
    session end in the engines, not per card). idem: repeat calls re-rate;
    duplicate-call guard blocks identical repeats in one request.
14. **study.get_due_summary** — R/read. fn: `KOS.srs.dueCards/dueCount`.
    wrap. out: `{count, byTopic[≤20], oldestOverdueDays}`.
15. **study.get_study_stats** — R/read. fn: `state.study.fc/quiz` tallies +
    `KOS.sessions.streaks` + `KOS.quiz.stats`. wrap. in: `{subject?, ref?}`.
16. **study.log_exam_result** — W/reversible, undo:yes (tracker.remove).
    fn: `KOS.tracker.add` (logs its own governor session — one deliberate
    act, one session; the tool NEVER also logs). wrap. in: `{kind ∈
    exam|paper, subject?, ref?, topic?, paper?, marks?, max?, grade?, date?,
    well?, badly?, notes?}`. marks ≤ max, both ≥0.
17. **study.list_exam_results** — R/read. fn: `KOS.tracker.forSubject/
    forRef` + entries. wrap.
18. **study.update_exam_result** — W/reversible, undo:yes. fn:
    `KOS.tracker.update`. wrap. No session re-log (matches UI).
19. **study.delete_exam_result** — W/**consequential**. fn:
    `KOS.tracker.remove`. wrap.
20. **study.generate_flashcards** — W/reversible (saves are individually
    deletable custom cards), generation itself billable-provider-routed.
    fn: provider `generation` route + `KOS.content.get` grounding +
    `KOS.srs.addCustom` with `extra:{ai:true, src:{provider,model,ts}}`.
    in: `{subject, ref, count 1–20, focus?}`. Flow: resolve canonical
    content (notes + existing cards to avoid duplicates) → structured
    output request → **local validation**: array of `{q:string 1–2000,
    a:string 1–2000}` exactly, no extra fields, count ≤ requested, no
    near-duplicate of an existing card (case-folded q match) → save all or
    nothing (atomic batch: validate the whole array before the first
    `addCustom`). Malformed → clean failure + retry offer, zero saves.
    Cards are visibly marked AI-generated (the `ai` flag renders as a badge
    in manage-cards; editable/deletable like any custom card; curriculum
    files are never touched).
21. **study.generate_quiz** — W/reversible. **gap, new storage** (§5.9):
    `state.custom.quizzes` (`{id, sid, ref, items:[{q, opts[2–6], ans idx,
    why}], ai:true, created}`). fn: provider generation + new
    `KOS.srs.addCustomQuiz`-style store functions in aitools-adjacent core
    (implemented in srs.js beside the card CRUD, same custom-vs-curriculum
    distinction) + quiz engine mounts custom sets beside curriculum ones.
    Validation mirrors §20 (ans in range, opts distinct, all fields
    typed, atomic). Marked AI-generated, editable via manage UI (Phase B
    adds the minimal manage/delete affordance in the quiz tab), deletable.
22. **study.explain_topic** — R/read (pure provider text, no tool writes).
    fn: `tutor` route grounded in `study.read_notes` output. in: `{subject,
    ref, question?}`. This is the "explain the selected note" contextual
    action.

### 5.2 Governor

23. **governor.get_status** — R/read. fn: `state.governor` + `KOS.governor
    .levelInfo/hpState` + `KOS.sessions.streaks/restStreak` +
    `KOS.srs.dueCount`. wrap. out: `{hp, hpState, gold, xp, level, streaks,
    restStreak, dueCount, backlogLimit}`.
24. **governor.list_shop** — R/read. fn: `KOS.governor.catalog/owns` +
    `hpState` (shop suspended while strained — reported, mirroring gate).
25. **governor.buy_item** — W/**consequential** (spends gold). fn:
    `KOS.governor.buy` — verify at implementation that `buy` itself
    enforces gold + HP-gate rules (it is the UI's path); if any check lives
    only in governor-ui, **extract** it into `buy`. in: `{itemId}`.
    idem: owning already → domain error, no double-spend.
26. **governor.set_cosmetic** — W/reversible, undo:yes (restore prior).
    fn: `KOS.governor.setTheme/setSeal/setShelfSkin/setShrineStyle`. wrap.
    in: `{kind ∈ theme|seal|shelfskin|shrinestyle, id}`. Owned/default ids
    only (validated against catalog + owned).
27. **governor.get_session_log** — R/read. fn: `KOS.sessions.all` filtered/
    capped. in: `{days? ≤90, type?, subject?}`. out: sanitized entries.
28. **focus.get_state** — R/read. fn: `KOS.focus.state/session/kind/
    workSeconds/canComplete`. wrap.
29. **focus.start_session** — W/reversible. fn: `KOS.focus.start` —
    verify signature at implementation; the domain function exists
    (`lastConfig` shows the config shape: mode, workMin, breakMin, subject,
    ref). in: `{mode ∈ pomodoro|free, workMin?, breakMin?, subject?, ref?,
    kind? ∈ study|reading}`. ctx: no session already active (live-checked).
30. **focus.pause_resume** — W/reversible. fn: `KOS.focus.pause/resume`.
    in: `{action ∈ pause|resume}`. ctx: active session, valid state.
31. **focus.end_session** — W/reversible with explicit activity line (award
    lands via the one governor pipeline; ending early forfeits — the tool
    requires `early:true` to be stated for an early end so the model cannot
    forfeit silently). fn: `KOS.focus.endComplete/endEarly`. ctx: active
    session; `canComplete()` checked for the complete path.
32. **media.log_activity** — W/reversible. fn: `KOS.media.logActivity`
    (one deliberate act = one `type:"media"` session; 0 HP by contract).
    in: `{module, entryId, action, note?}`. ctx: entry exists (live).

### 5.3 Collection Matrix (modules confirmed in code: anime, books, vn, game)

33. **collection.list_entries** — R/read. fn: `KOS.mediadb.query`. wrap.
    in: `{module, status?, genre?, search?, favourite?, sort?, limit ≤60,
    offset?}` (+ module-specific: format/shelf/mood [books], platform/tier/
    priority [game]). out: sanitized `[{id, title, status, progress, score,
    favourite, genres≤5}]` — never full blobs, never the whole vault.
34. **collection.get_entry** — R/read. fn: `KOS.mediadb.get`. wrap.
    out: sanitized full entry (module axes included; data-URL images and
    `reward`/sync bookkeeping stripped).
35. **collection.get_stats** — R/read. fn: `KOS.mediadb.stats` (+
    `distinct` for genre lists). wrap.
36. **collection.add_entry** — W/reversible, undo:yes (remove created id).
    fn: `KOS.mediadb.add` (normalise is the schema gate) + optional
    `KOS.media.logActivity(module, id, "added")` matching the manual-add
    UI path (verify exact action string at implementation). in: `{module,
    title, status?, progress?, score?, genres?, module-specific axes…}`.
    Validation: enums via mediadb.STATUSES/TIERS/PLATFORMS/FORMATS;
    `syncSource:"manual"`; no external ids from the model (search-and-add
    is the id-bearing path). idem: same-title same-module duplicate warned
    via domain check before save.
37. **collection.update_entry** — W/reversible, undo:yes (field-level
    restore). fn: `KOS.mediadb.get` → mutate allowed fields →
    `KOS.mediadb.put` → `KOS.mediapush.schedule(id)` when
    `KOS.mediapush.eligible(entry)` — exactly the quickEdit path
    (medview.quickEdit stays UI; the put+schedule sequence is small enough
    to mirror without divergence, and Phase B asserts parity in tests).
    in: `{entryId, changes:{status?, progress?, volumesOwned?…, score?,
    favourite?, notes?, module-axes…}}`. Watermark absorption happens in
    `put` (invariant #17 untouched). Manual-layer fields (routes, quotes,
    chapters, physical, shelves, mood) validated per-module.
38. **collection.delete_entry** — W/**consequential**. fn:
    `KOS.mediadb.remove` (tombstone recorded — invariant #32). in:
    `{entryId}`. Confirmation card shows title + module.
39. **collection.set_custom_lists** — W/reversible, undo:yes. fn:
    `KOS.media.registerList` + entry `customLists` via put (union axis,
    invariant #9). in: `{entryId, add?[], remove?[]}`.
40. **collection.search_external** — R/read (network on user request).
    fn per module: `KOS.anilist.searchMedia` (anime/books),
    `KOS.vndb.searchVN` (vn), `KOS.gameapi.igdbSearch` (game — needs cloud
    session), `KOS.bookapi` lookup (books ISBN/title). wrap. in: `{module,
    query, platform?}`. out: normalized candidates (no tokens, no raw
    payloads). Errors: provider-specific plain English (existing clients
    already do this).
41. **collection.add_from_external** — W/reversible, undo:yes. fn: the
    create-then-mirror domain path used by mediasearch — **extract**: the
    confirmed-create logic in `mediasearch.js` (entry construction from a
    search candidate + optional remote mirror for anilist) moves to a
    shared `KOS.mediaSearch.createFromCandidate(candidate, status, cb)`;
    the modal and the tool both call it. in: `{module, candidate
    (echoed from search_external, revalidated), status}`. Games/IGDB adds
    stay local-only `syncSource:"manual"` (invariant #20).
42. **games.bulk_add** — W/**consequential** (bulk mutation). fn:
    `KOS.games.parseBulkTitles` + its apply path (verify whether parse and
    apply are separate; extract apply if modal-bound). in: `{titles[1–100]}`.
    ONE governor session for the whole paste (invariant #5) — the domain
    function already owns that.
43. **collection.sync_provider** — W/**consequential** (explicit manual
    sync). fn: the mediasync flow — **extract**: `KOS.anilist.syncList →
    bulkUpsert → logSyncRewards → lastSync kv` currently lives inline in
    `mediasync.js` buttons; move to `KOS.mediasync.run(source, module, cb)`
    (update-and-add mode only — replace mode stays UI-only, excluded from
    the assistant). in: `{source ∈ anilist|vndb, module}`. Rewards flow
    through the existing single-session path (invariants #5/#17).
44. **collection.get_sync_health** — R/read. fn: kv `anilist.lastSync.*`,
    `vndb.lastSync`, `KOS.mediapush.getLog/isPending`, autosync
    enabled/lastRun. wrap.
45. **vn.add_quote** — W/reversible, undo:yes. fn: entry quotes push via
    put (+ optional `KOS.srs.addCustom(PERSONAL_SID, "vn", …)` when
    `asFlashcard:true` — the existing quote→flashcard path). in:
    `{entryId, text, context?, asFlashcard?}`.
46. **vn.update_routes** — W/reversible, undo:yes. fn: entry routes via
    put; progress re-derives in normalise (invariant #10). in: `{entryId,
    routes ops add/rename/setCleared/remove}`. Completing a route logs via
    the existing precedence rules only if the UI path does (verify; do not
    invent a session).
47. **books.add_physical_volume** — W/reversible, undo:yes. fn: entry
    `physical.volumes` via put (normVolume gate). in: `{entryId, number,
    condition?, price?, purchaseDate?}`. No coverUrl from the model.

### 5.4 Planner

48. **calendar.list_events** — R/read. fn: `state.calendar.events` +
    `KOS.calendar.eventsOn/deadlines`. in: `{from?, to?, type?}`.
49. **calendar.add_event** — W/reversible, undo:yes. fn:
    `KOS.calendar.addEvent`. in: `{title, date, time?, type ∈ exam|deadline|
    study|lesson|personal, subject?, ref?, recur? ∈ none|weekly}`.
50. **calendar.update_event** — W/reversible, undo:yes. fn:
    `KOS.calendar.updateEvent`. in: `{id, changes…}`. Target revalidated.
51. **calendar.delete_event** — W/**consequential**. fn:
    `KOS.calendar.deleteEvent`.
52. **todo.list** — R/read. fn: `KOS.todo.autoItems` + `state.todo.manual` +
    `KOS.todo.habits/habitStreak`.
53. **todo.add_task** — W/reversible, undo:yes. fn: `KOS.todo.addManual`.
    in: `{text ≤500}`.
54. **todo.toggle_task** — W/reversible. fn: `KOS.todo.toggleManual`
    (completing logs the existing `todo` session through the UI path —
    verify where the session is logged; the tool must produce identical
    behaviour, one act one session). in: `{id, done}`.
55. **todo.delete_task** — W/**consequential**. fn: `KOS.todo.deleteManual`.
56. **todo.add_habit / todo.tick_habit** — W/reversible. fn:
    `KOS.todo.addHabit/tickHabit`. (Two tools; tick is per-day idempotent.)
57. **wishlist.list** — R/read. fn: `KOS.wishlist.items/byStatus/budget/
    currentMonthSpend/featuredItem`. out: sanitized items + ledger summary.
58. **wishlist.add_item** — W/reversible, undo:yes. fn: `KOS.wishlist.add`.
    in: `{module ∈ books|vn|game, title, price?, currency?, retailer?,
    releaseDate?, priority?, notes?, linkedEntryId?}` (linked entry
    revalidated). Planner stays governor/network-free (invariant #5a) —
    the wrapper adds nothing.
59. **wishlist.update_item** — W/reversible, undo:yes. fn:
    `KOS.wishlist.update`.
60. **wishlist.set_status** — W/reversible EXCEPT `purchased` — moving to
    purchased is `wishlist.mark_purchased` only. fn: `KOS.wishlist
    .setStatus` (validated to non-purchased targets).
61. **wishlist.mark_purchased** — W/**consequential** (real spending
    decision). fn: `KOS.wishlist.markPurchased` (idempotent by design —
    re-marking never double-archives) + the existing local Collection
    handoff `handoffPurchased` exactly as the UI does (verify call site).
62. **wishlist.remove_item** — W/**consequential**. fn:
    `KOS.wishlist.remove`.
63. **wishlist.set_budget** — W/**consequential** (budget change). fn:
    `KOS.wishlist.setBudget` (currency-change guard is domain-enforced).
64. **goals.list** — R/read. fn: `KOS.goals.compute` (live auto-metrics).
65. **goals.add** — W/reversible, undo:yes. fn: `KOS.goals.add`. in:
    manual or auto (`metric` validated against `KOS.goals.metrics()`).
66. **goals.update** — W/reversible, undo:yes. fn: `KOS.goals.update`.
67. **goals.delete** — W/**consequential**. fn: `KOS.goals.remove`.

### 5.5 Archive

68. **archive.get_backup_info** — R/read. fn: `KOS.store.snapshotFull`
    summarized (counts + sizes only, never the payload to the model).
69. **archive.export_backup** — W/reversible (local download, no mutation).
    fn: `KOS.store.exportFull`. No arguments.
70. **attachments.list** — R/read. fn: `KOS.attach.list/listMeta`.
    out: `{id, name, size, mime, topic, note}` — never blob content.
71. **attachments.set_note** — W/reversible, undo:yes. fn:
    `KOS.attach.setNote`.
72. **attachments.delete** — W/**consequential** (also removes the remote
    binary — invariant #36 path). fn: `KOS.attach.remove`.

### 5.6 Search

73. **search.app** — R/read. Cross-application search: `KOS.hub.search`
    (spec + flashcard index; §5.1.5 extraction) + `KOS.mediadb.query
    {search}` per module + title scans over wishlist/goals/calendar/manual
    todos. in: `{query, scopes?[]}`. out: grouped hits with type, id/ref,
    title, snippet. The index snippet is not canonical content — hits carry
    the identifiers needed for `study.read_notes` / `collection.get_entry`
    follow-ups, and the tool description says to use them.

### 5.7 Sync (cloud)

74. **sync.cloud_status** — R/read. fn: `KOS.cloudsync.getStatus/lastSync/
    lastError/linkStatus` + `KOS.cloud.userId/userEmail(masked)`.
75. **sync.cloud_sync_now** — W/**consequential** (explicit manual sync).
    fn: `KOS.cloudsync.syncNow`.
76. **sync.retry_pushes** — W/**consequential**. fn: `KOS.mediapush.flush`
    + `KOS.cloudsync.retry`.
77. **sync.set_autosync** — W/reversible, undo:yes. fn:
    `KOS.autosync.setEnabled`.
78. **sync.resolve_first_link** — **excluded** (the `both`/`localOnly`
    first-link choice is a rare, high-stakes interactive decision with its
    own dedicated UI — invariant #34's explicit-confirmation flow stays
    human-only).

### 5.8 Assistant/navigation

79. **app.navigate** — W/read-tier (meaningful navigation, no data
    mutation). fn: `KOS.show(viewId, arg)` against a whitelist derived from
    `SECTION_OF` + valid args (subject sids, `ref` `{subject,ref}` pairs).
80. **app.get_context** — R/read. Orchestrator-owned context snapshot
    (current view, selection, filters) exposed as a tool so the model can
    re-ask instead of assuming.

### 5.9 Gaps discovered (recorded, not fabricated)

- **`SEARCH_INDEX` not exported** — hub.js keeps it closure-private.
  Phase B extracts `KOS.hub.search(q)`; topbar behaviour unchanged.
- **No custom-quiz store** — `state.custom` holds flashcards only; quiz
  content is curriculum-only (`KOS_CONTENT`). AI quiz generation requires a
  new `state.custom.quizzes` bucket + srs-side CRUD + quiz-engine mounting
  of custom sets (small, follows the existing custom-cards pattern and the
  curriculum/custom distinction). Implemented in Phase B.
- **No automation engine** — nothing in the codebase schedules user-defined
  automations (autosync/cron-like behaviour is fixed engine code).
  Automation management is deferred; no placeholder UI (§10).
- **Session-boundary verifications** deferred to Phase B implementation
  (marked "verify" above): focus.start signature, todo toggle session site,
  games bulk apply separation, mediasearch create extraction shape,
  governor.buy self-containedness, quote→flashcard call shape. Each is a
  wrap-vs-extract decision recorded here and finalized (with the plan
  updated) during Phase B.

Excluded (with reasons): XML/file imports and `importFull` restore (file
pickers + destructive restore stay human-only), Steam link/import
(interactive OpenID + already server-verified flow with mandatory human
review stage), shrine/matrix purely-visual browsing, image/crop tools
(visual positioning is inherently manual), replace-mode provider sync
(destructive import, dedicated UI confirmation flow), first-link resolution
(#78), autosync internals, personal-deck session running (interactive).

---

## 6. Orchestrator specifics (Phase C)

- **Bounds**: ≤8 tool-call iterations per user request, ≤12 total calls,
  identical (tool+args) call rejected within one request, ≤2 provider
  retries (transient only, never after a write tool executed), 120 s total
  request duration, all configurable constants in one place.
- **Live context**: captured per turn; context-dependent tools re-read the
  live selection immediately before execution and carry a `contextVersion`
  (monotonic counter bumped by `KOS.show` and selection changes); stale →
  safe failure with explanation.
- **Confirmation integrity**: pending consequential actions stored as
  `{tool, normalizedArgs, targetFingerprint, conversationId, correlationId,
  expiresAt}`; executing compares the stored normalized args byte-for-byte;
  any change → new confirmation; expiry 2 minutes or on context change;
  confirm/cancel/failure all audited.
- **Undo**: tools marked undo:yes capture the minimal inverse (prior field
  values / created id) and surface a one-shot undo chip in the transcript;
  undo executes through the same domain functions and is itself audited.

## 7. Validation strategy for writing tools (summary)

Every write tool: full JSON-Schema argument validation (types, enums,
ranges, lengths, no unknown fields) → referential checks against live state
→ domain-rule checks via the existing functions (never reimplemented — the
wrapper calls the same code the UI calls) → atomic batch semantics for
multi-record writes (validate everything, then write; any failure = zero
writes) → sanitized result back to the model. Generated content additionally
passes the application-schema validation of §5.1.20–21 before any save, and
failures are reported with the specific reason and a retry offer.

## 8. Provider interface (normalized shapes)

```
request:  { category, messages:[{role, content|toolResult}], system,
            tools:[{name, description, parameters(JSON Schema)}],
            structured?: {schema}, stream:false, timeoutMs, correlationId }
response: { text?, toolCalls?:[{id, name, args}], structured?,
            usage:{prompt, completion}, finishReason, provider, model,
            correlationId }
error:    { kind: config|auth|rate|network|provider|timeout|cancelled,
            message (user-readable), retryable, correlationId }
```

Adapters own all translation; the orchestrator never sees provider shapes.

## 9. Test matrix

| Suite | Covers |
|-------|--------|
| smoke20 (Phase A) | adapter translation (mocked fetch): messages/tools/tool-calls/structured/usage per provider; routing per category; fallback off = hard error; capability flags; timeout/cancellation; retry bounds; no retry after tool execution; correlation ids; error normalization; no secrets anywhere client-side |
| smoke21 (Phase B) | every tool: valid call → correct domain function invoked (spy), invalid args rejected pre-execution, missing target fails safely; enum/range/length rejection; malformed flashcard/quiz/record generation rejected with zero partial saves; batch atomicity; duplicate-call guard; result sanitization (no blobs/tokens); governor invariants hold (no double sessions, planner zero-governor/zero-network, watermark untouched) |
| smoke22 (Phase C) | loop caps; identical-call rejection; tiers enforced (read no-confirm, consequential blocked unconfirmed, cancel leaves state untouched); confirmation binding/expiry/arg-change; stale context fails; audit lifecycle rows (mocked API); undo correctness |
| smoke23 (Phase D) | conversation CRUD + resume (mocked API); bounded context assembly; memory explicit-consent rule; no secrets in memory; signed-out degradation |
| smoke24 (Phase E) | surfaces mount on every view; permissions floor (consequential cannot be weakened); provider-offline/empty/confirmation states; drawer a11y hooks (focus trap present) |
| assistant_integration.mjs (Phase F) | live: RLS isolation both directions on all five tables (two throw-away users); cap enforcement incl. concurrent burst; ai-chat auth rejection; no secret material in any response |
| Browser (Phase F) | live Gemini through configured route; one representative request per §5 category; consequential gating + cancel; malformed generation proves zero saves; context awareness + stale invalidation; reload-resume; memory rules; audit history matches actions |
| Existing smoke1–19 | full regression gate before every commit |

Ollama: mocked transport tests in smoke20 + unavailable-behaviour tests;
live verification is the user-assisted checklist (§Phase F boundary — a
sandbox-local check, if the environment allows one, will be labelled as
such and is NOT deployment proof).

## 10. Risks, dependencies, deferred

- **Provider API drift** — endpoints/fields verified against live docs at
  Phase A start; model ids are config, not constants.
- **Model ids** `gemini-3.5-flash` / `deepseek-v4-flash` per the brief; if
  live verification finds them unknown, the config surface makes the fix a
  settings change, and the report will say what was actually verified.
- **Context budget** — 22k-line app + big registry; tool descriptions are
  written tersely and tool lists are filtered by permission + category
  before sending.
- **jsdom limits** — Supabase/network mocked via the established `_config`
  test-seam pattern; new modules expose the same seams.
- **Signed-out persistence** — conversations/memory/audit need cloud;
  behaviour documented in §4.
- **Deferred**: automation engine (does not exist; no placeholder),
  streaming transports (interface ready), replace-mode syncs, Steam flows,
  file-based imports, first-link resolution, per-tool fine-grained Books/VN
  axes beyond §5 (extendable later), assistant-triggered backup restore
  (never), mobile UX polish pass (pre-existing deferral).

## 11. Live status

- **Completed**:
  - Inventory + this plan (commit 84c5edd).
  - **Phase A** — provider layer:
    `supabase/migrations/20260718000001_kos_ai.sql` (kos_ai_daily +
    atomic `kos_ai_consume` security-definer capped increment,
    service_role-only EXECUTE; kos_ai_usage metadata rows; RLS select-own
    only, zero client write policies),
    `supabase/functions/ai-chat/index.ts` (JWT via requireUserId, cap
    consumed before any provider call, raw-fetch Gemini
    `generateContent` with `x-goog-api-key` header + DeepSeek
    `/chat/completions`, structured-output translation
    [responseJsonSchema / json_object+schema-instruction], usage rows,
    redacted upstream errors, health action; `verify_jwt = true` in
    config.toml), `js/core/ai.js` (normalized chat/tools/structured/usage
    contract, Ollama client-side transport with OLLAMA_ORIGINS-aware
    errors and on-demand health, per-category routing with the §2
    defaults, explicit-only labelled fallback, single network-only retry,
    noRetry seam for the orchestrator, cancellation + correlation ids,
    local-only Ollama visibility counter), `tools/smoke20.test.js`
    (22 steps). Provider REST shapes verified against live docs
    2026-07-17 (gemini-3.5-flash and deepseek-v4-flash confirmed real
    current ids).
- **In progress**: Phase A closeout (regression gate + commit).
- **Not started**: Phases B–F. Migration/deploy of ai-chat happens with
  live verification (Phase F), keys requested then.
- **Current blockers**: none.
- **Exact resume point**: commit Phase A, then Phase B — hub `search()`
  extraction, `state.custom.quizzes` store + srs CRUD, `js/core/aitools.js`
  registry per §5, smoke21.
- **Last verified commit**: 84c5edd + Phase A working tree (smoke20 green;
  full 1–19 gate re-run pending in this checkpoint).
