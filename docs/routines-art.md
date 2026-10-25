# Daily Review and Routines: the art prompt sheet

For [routines-plan.md](routines-plan.md). **Work from the sheet page, not
this file:**

1. Start the dev server: `python3 tools/dev_server.py 8123`.
2. Open http://localhost:8123/prototypes/routines-space/art.html.

It is Japanese's prompt and contact sheet, pointed at
`art-source/routines/manifest.json`. It shows each prompt in full with
a copy button and the files to attach, ticks off what is saved, and
compares each of Kurenai's faces with her base pose. If this file and
the manifest disagree, the manifest wins.

Make these by hand in the Gemini app (never through an API), one batch
at a time, in order. Save each result as PNG into
`art-source/routines/inbox/<id>.png`.

**Before you start:**
- Kurenai's base pose is drawn from her redesign on the Mind sheet
  (`art-source/mind/inbox/mind.sheet.kurenai.png` and
  `mind.base.kurenai.a.png`), so those must exist. They do: made on 24
  October 2026.
- The same rules apply as for Mind and Japanese: no text in any image,
  ever; sprites on flat #00FF00; keep Kurenai identical to her sheet.

## What is asked for, and why

| Batch | Ids | Used where |
|---|---|---|
| 1 · Kurenai's base | `routines.base.kurenai`: full body, holding a mug of tea, on green | The header of every review (frames 33a–33h), cropped to the waist on a phone; hideable |
| 2 · Expressions (edits of the base) | `…face.kurenai.morning`, `attentive`, `evening`, `concerned`, `proud` | Morning greeting; the afternoon's "so far"; the evening and wind-down; "behind, and that's fine" (never cross); a routine kept |
| 3 · Review backgrounds, 16:9 | `routines.bg.morning`, `afternoon`, `evening`, `night` | Behind each review's header; `night` for the wind-down step and "Good night". The right third stays calm for Kurenai and the text |
| 4 · Routine covers, 3:2 still lifes | `routines.cover.morning`, `evening`, `study`, `habit`, `sunday`, `exam` | Template cards and routine cards, chosen by the routine's kind; the player's header |
| 5 · Empty states, 1:1 on green | `routines.spot.alldone`, `routines.spot.fresh` | "Done for today" and the first visit |

18 images in all.

## What is better NOT made in Gemini

- **Icons and badges** (streak seals, review marks, step ticks, the
  chip):
  - drawn as SVG or the app's kanji marks (朝 morning, 昼 afternoon,
    夜 evening, 習 habit, 始 about to study, 支 prep), so they follow
    every theme, Dawn and the 23 shop themes;
  - a raster badge cannot re-tint, and a seal with a character in it
    breaks the "no text in an image" rule.
- **The heat map, the timeline and the time-left strip:** these are data,
  drawn live.
- **Seasonal variants of the backgrounds:** worth it later (spring
  sakura at the window, winter dark mornings), but only once the four
  base scenes are in use.

## Import

When R3 (the reviews) is built, the manifest runs through Japanese's
pipeline:
1. chroma key for the sprite and spots;
2. face-only composites onto the base;
3. WebP/AVIF into `assets/routines/img/`;
4. a contact sheet to catch drift.

Covers and backgrounds are resized only. Everything is credited as
AI-assisted in Licences.
