# Category 6.1 — Kurenai Assistant UI/UX Overhaul

Status: implemented, verified, staged, and deployed on 2026-08-06.

## 1. Scope and product intent

This follow-up build redesigns the Kurenai Assistant frontend without changing the assistant backend or its safety model. The primary job of the interface is to help one KurenaiOS user turn study and collection intent into understandable, verified actions while keeping consequential writes visibly gated.

The fixed contracts remain owned by:

- `KOS.assistant`
- `KOS.ai.orchestrator`
- `KOS.ai.convo`
- `KOS.ai.memory`
- `KOS.ai.tools`
- `KOS.ai.providers`

The UI will continue to submit through the orchestrator, render canonical confirmation objects, and accept or reject them only through the established confirmation methods. It will not call Phase B tools directly, infer approval from prose, expose credentials, render unsanitized HTML, or weaken context revalidation and autonomy tiers.

## 2. Audit findings

### Repository and contract audit

The following sources were reviewed before implementation: `CLAUDE.md`, `AGENTS.md`, `CATEGORY6_PLAN.md`, `PROGRESS.md`, `js/modules/assistant.js`, `js/core/aiorchestrator.js`, `js/core/aimemory.js`, `js/core/aitools.js`, `js/core/ai.js`, `css/main.css`, `index.html`, `js/core/ui.js`, `js/modules/hub.js`, `assets/assistant/manifest.json`, smoke tests 24–28, `sw.js`, and `tools/deploy_pages.sh`.

The requested `js/core/aiproviders.js` does not exist in this repository. The live provider contract is implemented by `js/core/ai.js`; that file was audited instead and will remain unchanged.

The current frontend correctly shares one controller state between the drawer and dedicated page, preserves a request when the drawer closes, and routes assistant work through the orchestrator. Those behaviours must survive the redesign.

### Current experience

- The dedicated page is visually sparse but not intentionally calm: the mascot, wordmark, navigation, messages, and composer feel disconnected across large blank areas.
- Six management tabs form one undifferentiated row and wrap awkwardly. Conversation and administration do not have a clear information hierarchy.
- The drawer lacks a scrim and robust dialog behaviour. It does restore focus and supports Escape, but it does not trap focus or announce lifecycle changes to assistive technology.
- User, assistant, tool, proposal, confirmation, receipt, warning, and error rows have insufficiently distinct visual grammar.
- Raw tool identifiers such as `study_list_subjects` appear as primary copy. These are useful only as secondary diagnostic information.
- Settings resembles a compact spreadsheet; permissions is a long wall of raw identifiers; activity lacks a clear timeline; memory and history have little scannable structure.
- The mobile drawer is an 82vh bottom sheet that competes with the global mobile rail and the on-screen keyboard.
- Empty, signed-out, and error states communicate facts but do not guide the next action.
- The composer is functional but does not feel anchored to the active conversation.

### Asset audit

Every PNG currently listed in `assets/assistant/manifest.json` reports no alpha channel. Visual inspection shows a gray-and-white checkerboard baked into all emblem, wordmark, mascot portrait, and full-body renders. These images cannot be displayed in production as transparent assets.

The redesign will:

- create one clean, true-transparent render derived from an approved Whispering Bloom mascot image;
- create or clean one true-transparent Whispering Bloom emblem for compact identity surfaces;
- stop displaying the checkerboard wordmark and render the product name with the existing typography system;
- map all semantic mascot states to the one canonical clean render, using restrained CSS state effects for idle, thinking, working, confirmation, success, and error.

### Browser benchmarking

Current ChatGPT, Gemini, and Claude public/signed-in surfaces were inspected in the in-app browser. Useful patterns were their strong composer focus, restrained top controls, generous but deliberate whitespace, compact tool/status language, and clear separation between conversation and secondary controls.

Kurenai will not imitate their generic chat-shell aesthetic. Its differentiator is a study-at-the-atelier feeling: editorial typography, a quiet ink-and-bloom presence rail, and safety information that feels integrated rather than bolted on.

## 3. Design direction

### Signature element: the Whispering Bloom presence rail

The dedicated assistant page will use a narrow presence rail beside the conversation. A single clean mascot portrait sits inside a subtle bloom field whose motion and colour respond to assistant state. The rail also carries the current human-readable status and two concise safety promises: what Kurenai is reading and whether an action still needs approval.

The drawer uses the same identity at a smaller scale: a clean bloom emblem, a compact state portrait, and status text in the header. This creates continuity without turning the mascot into decoration on every message.

### Visual language

- Existing theme tokens remain the source of colour. Assistant-specific tokens will be derived from the canonical surface, text, accent, success, warning, danger, and border variables so all existing light and dark themes remain valid.
- Fraunces remains the display voice, Alegreya Sans the conversational voice, IBM Plex Mono the diagnostic/technical voice, and Shippori Mincho the occasional state glyph.
- Bloom rings, soft ink washes, and thin editorial rules replace generic neon gradients and card grids.
- Motion is limited to state transitions, a quiet thinking orbit, a working pulse, and brief success/error acknowledgement. All motion stops under `prefers-reduced-motion`.

## 4. Information architecture

The six existing destinations remain compatible but are grouped visually:

- Conversation
  - Chat
  - History
- Control room
  - Settings
  - Memory
  - Permissions
  - Activity

The dedicated page uses this grouping as an internal navigation rail on desktop and a horizontally scrollable, keyboard-operable tab strip on mobile. The primary chat surface does not show settings, routing, memory, permissions, or audit detail unless the user deliberately opens those destinations.

### Chat hierarchy

1. User messages use a compact right-aligned accent bubble.
2. Assistant responses use an editorial left-aligned row with a small bloom mark and readable measure.
3. Tool activity appears as a quiet timeline event with human copy such as “Reading your CS topics.” The raw identifier remains available only as secondary technical text.
4. Proposals use a dashed brass treatment and clearly state that nothing has been changed yet.
5. Confirmations use a high-contrast review panel with human action, target, consequence, expiry, and canonical accept/reject controls. Exact arguments live in an expandable technical detail.
6. Receipts use a verified execution treatment, human-readable result, and secondary tool identifier.
7. Warnings and errors use separate icon-plus-text treatments so meaning is never communicated by colour alone.

### Human-readable activity copy

The frontend will add a display-only label layer for registered tool names. Common operations receive explicit, contextual verbs; unknown tools fall back to a safe title-cased description. Examples:

- `study_list_subjects` → “Reading your subjects”
- `study_read_notes` → “Reading your topic notes”
- `study_generate_flashcards` → “Preparing flashcards”
- `collection_list_entries` → “Reading your collection”
- `todo_add_task` → “Adding a task”

The original identifier is never discarded or changed in controller data, audit data, or orchestrator calls.

## 5. Layouts

### Desktop dedicated page

- A compact page identity header introduces Kurenai without a bitmap wordmark.
- A persistent internal navigation rail occupies roughly 190–210px.
- Chat occupies a readable central column with the transcript scrolling independently above a sticky composer.
- A 250–290px Whispering Bloom presence rail carries mascot state and safety context.
- Management destinations replace the chat/presence area with purpose-built cards, grouped controls, or a timeline while keeping the internal navigation stable.

### Desktop drawer

- A 460–480px full-height side panel sits above a scrim.
- Header, state identity, thread, and composer form one vertical flow.
- The transcript owns the flexible middle space; the composer stays available at the bottom.
- Opening the drawer moves focus to the composer, Escape and the scrim close it, Tab remains contained within the dialog, and closing restores the original trigger.

### Mobile

- The drawer becomes a true full-screen dialog, using safe-area padding and avoiding competition with the global bottom rail.
- The dedicated page becomes a single-column conversation. The large presence rail collapses into a compact state banner.
- The six tabs scroll horizontally and retain visible focus and selected states.
- The composer remains sticky above safe-area/keyboard space.
- Interactive targets are at least 44px where practical, with coarse-pointer affordances.

## 6. Management surfaces

- History: titled conversation cards with date, preview, resume, rename, and delete actions that preserve existing conversation APIs.
- Settings: request-class routing cards with readable purpose, provider/fallback controls, model field, Ollama URL, usage summary, and current sign-in/provider status.
- Memory: compact note cards grouped by scope, explicit add/edit/delete controls, and clear language that memory is user-controlled.
- Permissions: grouped category accordions. Every tool keeps its current autonomy options and defaults; the primary label is human-readable and the raw identifier is secondary.
- Activity: immutable audit rows presented as a chronological timeline with state, action, time, and technical details. No execution controls appear in the log.

## 7. Accessibility and resilience

- Use headings and landmarks that match the visual hierarchy.
- Add a polite live region for new replies, tool activity, confirmation requests, receipts, and errors.
- Mark assistant status as `role="status"` and confirmations/errors with appropriate semantic roles.
- Implement complete drawer focus containment, Escape, scrim close, and focus restoration.
- Implement arrow, Home, and End keyboard navigation for the assistant tablist.
- Keep visible `:focus-visible` outlines on every interactive surface.
- Use text and icons in addition to colour for every state.
- Never inject assistant, provider, tool, memory, or audit content as unsanitized HTML.
- Respect `prefers-reduced-motion` and existing theme variables.

## 8. Planned file changes

- `CATEGORY6_UI_PLAN.md` — this audit, plan, and final acceptance record.
- `js/modules/assistant.js` — UI composition, display labels, focus management, live announcements, and management-surface presentation only.
- `css/main.css` — assistant layout, hierarchy, themes, responsive behaviour, and reduced-motion treatment.
- `index.html` — update displayed assistant emblem if required; retain existing loading order and global trigger contract.
- `assets/assistant/manifest.json` — point production identity/state entries at clean assets.
- `assets/assistant/...` — add clean true-transparent production mascot/emblem assets.
- `tools/smoke29.test.js` — focused Category 6.1 acceptance coverage.
- `sw.js` — cache version bump after the implementation and test gate.
- `PROGRESS.md` — implementation, test, screenshot, and deployment record.
- `artifacts/category6-ui/` — browser verification screenshots, not application runtime assets.

Backend, provider, memory, tool registry, and orchestrator files are not planned for modification.

## 9. Acceptance criteria

- Drawer and dedicated page render one shared controller/conversation state with no duplicate controller instance.
- No displayed production assistant asset contains a checkerboard or broken transparency.
- All six mascot states use one approved clean render plus accessible text and CSS effects.
- User, assistant, tool, proposal, confirmation, receipt, warning, and error states are visually and semantically distinct.
- Primary activity copy is human-readable; raw tool IDs are secondary only.
- Canonical confirmation data is rendered faithfully and accepted/rejected only through the existing orchestrator path.
- No UI path calls Phase B tools directly or treats prose as write proof.
- Drawer focus is contained/restored; assistant tabs support keyboard navigation; live changes are announced.
- All existing dark and light themes remain readable, with reduced-motion support.
- Desktop dark, desktop light, and mobile screenshots cover drawer, chat, history, settings, memory, permissions, activity, and representative proposal/confirmation/receipt/error states.
- New smoke29 passes and smoke1–29 remain green.
- Service-worker cache is bumped, required assets are staged by the existing deploy script, documentation is updated, and the Pages deployment succeeds.

## 10. Verification record

### Automated gates

- `node --check js/modules/assistant.js`
- `node --check tools/smoke29.test.js`
- smoke1–29 all pass on the final workspace. The final acceptance was run in bounded groups (`smoke`, 2–8, 9–11, 12–20, 21–26, and 27–29) so every suite produced an unambiguous green result.
- `tools/deploy_pages.sh --stage` passed its development-file leak guard and produced 106 files / 20M.
- The staged bundle contains both production alpha assets, manifest v3, the redesigned assistant module, and service worker `kos-gov4-c6ui-1`.

The full run also uncovered a current Governor/header integration regression: its HUD move had removed the stable `#node-count` node still owned by `hub.js` and smoke1. The node was restored as screen-reader-only live text beside the moved HUD, retaining the Governor’s visible layout and re-establishing the existing frontend contract.

### Browser verification

Real in-app Browser captures are saved in `artifacts/category6-ui/`:

- `desktop-dark-chat.png` — dedicated chat, navigation, presence rail, user/assistant/tool/proposal hierarchy.
- `desktop-dark-message-states.png` — warning, error, verified receipt and sticky composer.
- `desktop-light-drawer-confirmation.png` — modal drawer, scrim, confirmation target/expiry/actions.
- `history-light.png`, `settings-light.png`, `memory-light.png` — light management surfaces and signed-out continuity states.
- `permissions-dark.png`, `activity-dark.png` — autonomy accordions and immutable timeline.
- `mobile-dark-chat-390.jpg`, `mobile-light-drawer-confirmation-390.jpg` — true 390px iframe viewports captured from the running app, including the full-screen drawer and canonical approval controls.

The browser accessibility snapshot confirmed headings/landmarks, a six-tab labelled tablist, status/live regions, the modal dialog label, composer focus, and labelled controls. Dark and light theme families were inspected through the app’s real token blocks.

### Assets

Built-in image editing produced flat chroma-key sources from the approved full-body Kurenai render and Whispering Bloom emblem. The local imagegen removal helper converted them to alpha PNGs. `sips` reports `hasAlpha: yes` for both; visual inspection confirmed transparent corners, clean hair/coat/petal edges, and no checkerboard. The exact production files are:

- `assets/assistant/mascot/full/kurenai-production.png`
- `assets/assistant/logo/whispering-bloom-emblem-production.png`

### Deployment

- Project: Cloudflare Pages `kurenai-os`, production branch `main`.
- Unique deployment: `https://01019473.kurenai-os.pages.dev`
- Production alias: `https://kurenai-os.pages.dev`
- Live verification: the unique deployment rendered the new empty chat; the production alias served service worker `kos-gov4-c6ui-1` and an assistant bundle containing the clean production mascot, “Begin with the part that feels tangled,” and the human-readable “Reading your subjects” activity label.
- No backend, provider, memory, tool-registry, orchestrator, migration, or cloud-function file was modified for Category 6.1.

## 11. Markdown and mathematics follow-up · 2026-08-06

The screenshots supplied after the first deployment exposed a frontend-only
integration defect: provider answers were correctly kept inert, but Markdown
and LaTeX punctuation was presented literally. The safety boundary is now
preserved by parsing assistant prose into a deliberately small DOM allowlist
instead of accepting provider HTML.

Supported response structure now includes headings, paragraphs, emphasis,
strikethrough, ordered/unordered/task lists, blockquotes, horizontal rules,
safe links, inline and fenced code, GFM-style tables, and inline/display maths
with `$…$`, `$$…$$`, `\\(…\\)`, and `\\[…\\]`. Tables, code blocks, and display
maths scroll inside the response at narrow widths. The already-loaded KaTeX
runtime receives only extracted formula source with `trust:false` and
`throwOnError:false`; malformed formulae fall back to readable source.

Raw HTML remains visible text, `javascript:` and other unsafe link protocols
are rejected, and Markdown images become labelled links rather than external
image fetches. User messages, tool events, proposals, confirmations, receipts,
warnings, and errors are intentionally unchanged. No backend, provider,
orchestrator, tool, memory, or canonical confirmation code was modified.

Smoke29 gained an eighth acceptance step covering semantic Markdown output,
GFM tables, code, safe/unsafe links, inert HTML, non-fetching images, KaTeX
options, display maths, and malformed-math recovery. Real in-app Browser checks
at desktop and 390×844 confirmed that the assistant page remains responsive.
The service-worker cache version is `kos-gov4-c6md-1`.

Final release verification: smoke1–29 passed; the existing staging guard
produced 106 runtime files / 20M; Cloudflare Pages deployed the follow-up to
`https://307af73d.kurenai-os.pages.dev`. The live assistant page mounted all
six tabs, the unique deployment and production alias both served service
worker `kos-gov4-c6md-1`, and the deployed assistant bundle contained the
safe rich-text renderer and public render hook.

## 12. Shared-shell regression follow-up · 2026-08-07

A later merge left the assistant trigger using its Category 6.1 markup but
restored an older idle-dot rule, producing the unexplained ring at the icon's
top-right corner. The trigger now keeps that lifecycle dot fully transparent
and borderless at rest; busy and confirmation classes explicitly reveal it.
No assistant controller, provider, conversation, memory, tool, orchestrator,
confirmation, or sanitisation path changed.

The same audit repaired adjacent Governor/profile styling contracts that share
the topbar and identity surfaces. Real browser checks on clean local origins
confirmed the idle assistant trigger, compact HUD, anchored profile speech
bubble, desktop light/dark Governor pages, and 390×844 layouts. Smoke29 remains
green and smoke31 now prevents the shared-shell regression from recurring.

## 13. Governor surface alignment follow-up · 2026-08-07

Real-user review prompted a final layout correction across the four Governor
destinations. Session Log uses a full-width overview row and filter rail above
date-grouped expandable records; its desktop date rail collapses into a compact
mobile group header. Avatar keeps the Discord-inspired identity/workshop split
but stretches the live profile card with the workshop so the lower-left column
is no longer a dead void. Status places the 90-day heatmap left of a vertical
three-stat stack, and Gold Shop opens on the complete All wares catalogue.

No economy, session, profile, cropper, routing, assistant, or provider contract
changed. Smoke31 and the visual audit now assert these precise alignment and
default-state decisions; smoke1–36 remain green.
