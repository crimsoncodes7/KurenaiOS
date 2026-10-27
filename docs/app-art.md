# App-wide art: the prompt sheet

For the art and shop audit (roadmap 5.13; the report is the artifact
https://claude.ai/artifact/6u9Wg3fQ6ugEN9w41zy5Ck). Everything here is
PROPOSED: make a batch only once it is approved. **Work from the sheet page,
not this file:**

1. Start the dev server: `python3 tools/dev_server.py 8123`.
2. Open http://localhost:8123/prototypes/app-art/art.html.

It is Japanese's prompt and contact sheet, pointed at
`art-source/app/manifest.json`. It shows each prompt in full with a copy
button, the files to attach and where the image goes, ticks off what is
saved, and compares each of Kurenai's faces with her base pose. If this
file and the manifest disagree, the manifest wins.

Make these by hand in the Gemini app (never through an API), one batch at a
time, in order. Save each result as PNG into `art-source/app/inbox/<id>.png`.
The same rules apply as for Japanese, Mind and Routines: no text in any
image, ever; sprites, spots and badges on flat #00FF00; Kurenai identical
to her redesign sheet. Her references are copied into `art-source/app/refs/`
(`kurenai-sheet.png` and `kurenai-base.png`, from 24 October 2026), so this
sheet stands on its own.

| Batch | Ids | Used where | Priority |
|---|---|---|---|
| 1 | `app.base.kurenai` | The Assistant's panel, empty thread, portrait and familiar crops | 1 |
| 2 | `app.face.kurenai.{thinking,working,success,concerned,asking}` | The Assistant's states | 1 |
| 3 | `app.hero.home.{autumn,winter,spring,summer}` | Home's hero, by the date | 1 |
| 4 | `app.hero.desk.{cs,maths,it,code}` | Each subject desk's hero | 2 |
| 5 | `app.focus.{library,train,shrine,cafe,rooftop,snow}` | The Focus stage (library free, the rest shop) | 2 |
| 6 | `app.spotlight.{anime,books,vn,games}`, `app.shrine.{lantern,moon,gold}` | Vault spotlights; Shrine halls (shop) | 2 |
| 7 | `app.empty.*` (11) | Empty states | 2 |
| 8 | `app.story.{week,study,days,recap}`, `app.finish.{washi,foil,film}` | Reports' story; share-card finishes (shop) | 3 |
| 9 | `app.banner.*` (6) | Painted profile banners (shop) | 3 |
| 10 | `app.skin.kurenai.*` (6) | Kurenai's outfits (shop); each outfit's faces follow on approval | 3 |
| 11 | `app.badge.code.{c1,c2,c3,c4,ct1,ct2}` | Code's capstone badges | 3 |
| 12 | `app.exam.{room,season}` | The Exam Room; Exam Season's header | 3 |

The import is the same script as the other spaces':

```sh
python3 -I prototypes/japanese-space/art_import.py art-source/app assets/app/img
```

Wiring each slot (where it reads the image, its opacity per theme, the
setting that turns decorative art off) is its own release, after the
matching Claude Design pass in design-prompts.md section 18.
