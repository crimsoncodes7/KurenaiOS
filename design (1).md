# Kurenai OS — UI/UX Overhaul: Design Direction (v2 — supersedes v1)

*v1 proposed evolving the existing crimson/dark identity. That's rejected
outright below — this version starts from zero on colour, as instructed,
and reverses the layout balance (Fable is now the base, not Sol).*

---

## 1. Colour — genuinely from zero

**Base theme: Linear Void, modified.** Pitch black (`#020305` base tier),
with violet (`#8C7CFF`) and cyan (`#35D7FF`) from the original theme, plus
a **newly added, genuinely bright red** (not a muted crimson-callback) as
a third signal colour. Treatment: thin borders, minimal glow, crisp
geometry — Linear's actual restraint, not an atmospheric/gradient-heavy
take.

**The other 23 themes from the lab file** (Ember Wraith, Porcelain Sky
Night, Azure Butterfly, Spectral Rose, Sakura Skyline, and everything
else) become **unlockable Gold Shop cosmetics** — this reuses the
existing shop/theme-variant mechanism from Build 2a/3j+3k directly, not
a new system.

The current crimson/gold identity is retired as the default. Not evolved,
not referenced — actually gone, per your explicit instruction.

---

## 2. Japanese/kanji aesthetic — dialled back, not removed

Kept to the same restrained, occasional usage the current app already
has (a wordmark, maybe a couple of section markers) — not deepened into
a pervasive design language the way v1 proposed. This is a de-emphasis,
not a full removal.

---

## 3. Layout — Fable is the base now, not Sol

Reversed from v1. Structure and specific components below.

### Study Hall
- **Tab bar: Fable's design** — explicitly preferred over Sol's.
- **Topic/subtopic sidebar tree: keep the CURRENT app's existing tree**,
  reskinned to the new visual language — neither mockup had this at all,
  it's not being replaced, just restyled.
- **Sol's subject-level content** (the paper/coursework breakdown cards)
  belongs on the Subject Overview page specifically, not the individual
  topic/study page.
- **Sol's study-inspector panel** (mastery %, recall record, next
  review): keep the *information*, change the *mechanism* — either a
  toggleable overlay triggered by a button, or keep Sol's multi-pane
  layout but make the side panels genuinely collapsible by the user.
  Lean toward the collapsible-panel version if it's not meaningfully
  harder to build — it's the more flexible answer and satisfies both
  "I like seeing this" and "don't force it always-on."
- **Notes/content layout**: blend of both mockups' text treatment —
  Fable's discretion, both were reasonable.

### Collection Vault
- **Card grid: Fable's, with one specific fix.** Status/progress
  information should overlay directly on the cover art (AniList's own
  actual pattern) rather than occupying separate space beside/below
  it — the current split-layout approach wastes space the overlay
  approach doesn't.
- **Hero card: Sol's treatment, extended.** User-selectable per medium
  (a chosen hero per module, not one global hero). Needs a genuine
  banner image, not stretched cover art — either a user upload, or
  pulled from the source API where available. AniList's schema does
  include a separate `bannerImage` field distinct from `coverImage`,
  if memory serves — verify against the live schema when this is
  actually built, same discipline as every other API integration in
  this project. VNDB's banner support is unconfirmed either way, worth
  checking at the same time.
- **Wishlist: neither mockup is the reference.** Use the original
  Kurenai manga-tracker screenshots from early in this project instead
  — specifically the Purchase Planner view (the "Next to Drop" hero
  treatment, the Budget Summary panel, Want to Buy / Waiting for
  Release tabs). Blend that structure with Fable's visual language, not
  Fable's or Sol's own wishlist mockup screens.

### Governor
**Fable's version is the reference**, even though it blends
overview-page and governor-page concepts somewhat — accepted as-is
rather than forcing a cleaner separation.

### Everything else (overview pages, stats, other areas)
Fable's creative discretion. Not mocked, not being pre-specified.

---

## 4. New feature latitude

Explicit permission to add features inspired by the named reference
apps (Habitica, AniList, YesGenie, and others already discussed) where
Fable judges they genuinely fit — not limited to visual treatment.

---

## 5. Explicitly OUT of this phase — flagged, not silently dropped

**A general-purpose wishlist/finance tracker** — tech, subscriptions,
clothes, general purchases, plus income/outgoing tracking and savings
metrics. This is real new functionality (a data model, real tracking
logic) not a visual change, and doesn't belong inside a UI/UX overhaul
prompt. Captured here so the requirement isn't lost — build as its own
phase once the overhaul is done and verified, same reasoning as why
3j+3k running long taught us not to bundle unrelated scope together.

---

## 6. Process requirements for the actual build

- Claude in Chrome, live, for reference-browsing during the session —
  confirmed, unchanged from the earlier plan.
- Read/interactively verify the current app's actual state before
  starting — same "read the codebase before writing anything" discipline
  every prior build phase has used, stated explicitly rather than
  assumed.
- The class-name preservation constraint from v1 §7 still applies where
  existing DOM is being restyled rather than restructured; new markup
  needs new smoke-suite coverage, not a silent assumption the old
  assertions still hold.
