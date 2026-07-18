# Kurenai Assistant Asset Pack — V2

This pack contains the user-approved Kurenai mascot assets and the preferred Whispering Bloom logo assets.

## What is included

- `assets/assistant/mascot/full/idle.png`
  - Full-body idle render.
- `assets/assistant/mascot/portrait/*.png`
  - State portraits for `idle`, `thinking`, `working`, `success`, `error`, and `confirmation`.
- `assets/assistant/logo/whispering-bloom-emblem.png`
  - Main emblem/logo.
- `assets/assistant/logo/whispering-bloom-wordmark.png`
  - Full wordmark lockup.
- `assets/assistant/logo/whispering-bloom-emblem-alt.png`
  - Alternate emblem extracted from the exploration board.
- `assets/assistant/manifest.json`
  - Semantic mapping for the UI.
- `integration/`
  - Reference CSS/JS/preview files from the earlier V1 pack. These are only starter integration files.
- `references/`
  - The original concept sheet references used to derive the selected character and logo direction.

## Intended use

Use the portrait assets in the assistant drawer, assistant page, or contextual panels.
Use the full-body idle asset for showcase screens, profile/setup screens, or future cosmetic pages.
Use the emblem logo for compact UI placements and the wordmark for larger headers.

## Important notes

- These are packaged as PNG extracts/exports. The portrait state images are separate assets rather than CSS overlays.
- Some state overlay UI elements (especially working, success, error, and confirmation) are usable but may be refined later.
- Status text such as “Thinking”, “Working”, or confirmation prompts should still be rendered as real HTML by KurenaiOS.
- The integration files are examples only. Claude should hook them to the real assistant/orchestrator lifecycle.

## Suggested repository placement

Place `assets/assistant/` into the repository's asset area, preserving filenames, then wire `manifest.json` into the Phase E visual component.

## Recommended state mapping

- `idle` → assistant open, no active request
- `thinking` → awaiting provider response, planning, or context resolution
- `working` → executing tool calls or processing content
- `success` → completed successfully, then return to idle
- `error` → provider/tool/validation/context failure
- `confirmation` → awaiting explicit user approval for a consequential action

## Deferred

Future skins, cosmetics, re-polished overlays, animation rigs, and alternate logo families (Fallen Crown / Faded Oath) remain deferred.
