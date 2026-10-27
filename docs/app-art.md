# App-wide art, design and the new shop (roadmap 5.13)

The art and shop audit's plan, APPROVED by the user on 27 October 2026. The
audit report is the artifact https://claude.ai/artifact/6u9Wg3fQ6ugEN9w41zy5Ck
(the walk, the findings, the reasons). This file is the BUILD PLAN: what was
decided, the order of work, and how the art is made. Nothing here is built
yet. Mind and Routines are out of scope (the user's call).

## Decisions (27 October 2026)

1. Every batch of art is approved, the Assistant's redesign and Home's
   seasons first.
2. The shop is priced for a long grind: over 70,000 gold of new items (the
   user holds about 43,000 and the Collection pays a lot). Premium items
   are meant to take months. Prices below.
3. All six outfits are made, plus the prestige gala outfit proposed with
   the repricing.
4. Claude Design passes, in this order: 18.4 (Japanese path) → 18.6
   (Exams attempts table) → 18.3 (the Assistant) → 18.7 (art slots) →
   18.5 (the shop) → 18.8 (cosmetics) → 18.1 and 18.2 (Money and Files
   empty) last. Prompts: design-prompts.md section 18.
5. The four CSS banners are retired (owned copies keep working, never sold
   or shown again); painted banners replace them. The six seals stay on
   sale.

## Making the art (the user, by hand, in waves)

1. Start the dev server: `python3 tools/dev_server.py 8123`.
2. Open http://localhost:8123/prototypes/app-art/art.html.

It is Japanese's prompt and contact sheet, pointed at
`art-source/app/manifest.json`: each prompt in full with a copy button, the
files to attach, where the image goes and its WAVE, what is saved, and each
face compared with its base. If this file and the manifest disagree, the
manifest wins. Make them in the Gemini app (never through an API) and save
each as PNG into `art-source/app/inbox/<id>.png`. Rules: no text in any
image, ever; sprites, spots and badges on flat #00FF00; Kurenai identical to
her redesign sheet (`art-source/app/refs/kurenai-sheet.png`,
`kurenai-base.png`).

101 images. Gemini fills its usage window after about 15, so they go in
eight waves, one window each; a wave's images only need earlier waves.

| Wave | Images | What |
|---|---|---|
| 1 | 14 | Batch 1–2: the Assistant's base and five faces; batch 3: Home's four seasons; batch 4: the four subject desks |
| 2 | 13 | Batch 5: six Focus scenes; batch 6: four vault spotlights and three Shrine halls |
| 3 | 13 | Batch 7: eleven empty states; batch 12: the Exam Room and Exam Season |
| 4 | 13 | Batch 8: four story covers and three share finishes; batch 9: six painted banners |
| 5 | 13 | Batch 10: the seven outfit bases (needs wave 1's base); batch 11: six Code badges |
| 6–8 | 15 · 15 · 5 | Batch 13: each outfit's five faces (35; needs wave 5) |

The import is the shared script (keys out the green, puts faces on their
base, resizes, writes WebP):

```sh
python3 -I prototypes/japanese-space/art_import.py art-source/app assets/app/img
```

## The new shop (79,600 gold)

Every item is cosmetic; labs stay the only functional unlocks (invariant 2).
New catalogue kinds are marked *new*; ids are new so nothing owned changes.

| Item | Kind | Each | Count | Total |
|---|---|---|---|---|
| Kurenai outfits: winter, yukata, exam season, rain, New Year, day off | outfit *new* | 4,500 | 6 | 27,000 |
| The gala outfit (prestige) | outfit *new* | 10,000 | 1 | 10,000 |
| Focus scenes (the library is free) | scene *new* | 1,800 | 5 | 9,000 |
| Shrine halls: lantern, moon, gold leaf | hall *new* | 2,500 | 3 | 7,500 |
| Painted banners: dawn, lantern, tide, ink night, sakura, first snow | banner (painted) | 1,200 | 6 | 7,200 |
| Share-card finishes: washi, foil, film | finish *new* | 800 | 3 | 2,400 |
| OS themes (four new, from 18.8) | theme | 1,500 | 4 | 6,000 |
| Avatar frames | frame | 600 | 4 | 2,400 |
| Shelf skins: paulownia, steel and glass, library oak | shelfskin | 600 | 3 | 1,800 |
| Seals: 雪 花 夢 刀 鶴 光 | seal | 400 | 6 | 2,400 |
| Notebook papers: kraft, dark slate grid, isometric dots, manuscript, music staff, 2 mm graph | paper *new* | 400 | 6 | 2,400 |
| Pen sets (roles from the theme, invariant 133) | penset *new* | 500 | 3 | 1,500 |

The existing 55 items keep their prices. An outfit is worn on the
Assistant panel, the Daily Review's header and Home's greeting; the free
default is the redesign (batch 1–2). The art (outfits, scenes, halls,
banners, finishes) arrives through the manifest; themes, frames, skins,
seals, papers and pens are CSS and tokens from pass 18.8.

## The build, one release each (on the other account if this one is out)

Branch from `main` (fetch first). Each release: its smoke suite, the full
gate (107 suites today), the responsive audit at 1440/820/390 and
`--ipad`, the visual audit for any hero or image change, then ask before
deploying. Art that has not arrived yet leaves its slot as it is today
(never an SVG stand-in).

1. **The Assistant's redesign** (wave 1; pass 18.3 when it is back). Import
   batch 1–2 to `assets/app/img/`; point `assets/assistant/manifest.json`'s
   six states (idle = the base, thinking, working, success, error =
   concerned, confirmation = asking) at them, the portrait and familiar
   crops cut from the base; keep smoke39's Live2D tables in step. Retire
   the first-design PNGs from the runtime (keep them in Git history).
2. **Home's seasons** (wave 1): the hero reads the date (Dec–Feb winter,
   Mar–May spring, Jun–Aug summer, Sep–Nov autumn) and draws its painting
   at low opacity per theme; Critical HP still owns the slot; a per-device
   "Decorative art" switch turns all of it off.
3. **Pass 18.4, the Japanese path** (the overlap is already fixed in
   kos-japanese-5; this is the redesign for phone and iPad portrait).
4. **Pass 18.6, the Exams attempts table** (no art).
5. **Pass 18.7, the art slots**: subject desks, vault spotlights, the
   Focus stage's default scene, the empty states, Reports' story covers,
   the Exam Room and Exam Season, Code's capstone badges.
6. **Pass 18.5, the shop**: the new kinds (outfit, scene, hall, painted
   banner, finish, paper, penset) in `governor.js`' catalogue at the
   prices above, their departments and previews in `governor-ui.js`, Try
   on for scenes and outfits as themes have it, the four CSS banners
   hidden for good; the outfit choice and scene choice sync like the theme.
7. **Pass 18.8, the cosmetics**: four themes (css/themes.css, roles only,
   invariant 26a), frames, shelf skins, seals, papers, pen sets.
8. **Passes 18.1 and 18.2**: Money's and Files' empty pages.

When a release lands, update this file's status, ROADMAP 5.13 and
CLAUDE.md's baseline.
