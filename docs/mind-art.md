# Mind — the art prompt sheet

For [mind-plan.md](mind-plan.md) §19. **Work from the sheet page, not this
file:** start the dev server (`python3 tools/dev_server.py 8123`) and open
http://localhost:8123/prototypes/mind-space/art.html. It is Japanese's
prompt and contact sheet pointed at `art-source/mind/manifest.json`. It
shows each prompt in full, with a copy button and the files to attach,
ticks off what is saved in the inbox, and lets you compare each face with
its base pose. If this file and the manifest disagree, the manifest wins. Make these by hand in the Gemini
app (never through an API), one batch at a time, in order. Each batch
needs the previous one.

**How to use it:**
- **Save every result** as PNG at the highest resolution Gemini offers,
  into `art-source/mind/inbox/` under the exact id shown (for example
  `art-source/mind/inbox/mind.sheet.ren.png`).
- **Attach the files listed** with each prompt:
  - `STYLE` is `art-source/mind/refs/style-anchor.png` (a copy of
    Japanese's style anchor), used for its style only;
  - Kurenai's base uses `art-source/mind/refs/kurenai.png`, her production
    art;
  - inbox files are the ones you saved in an earlier batch.
- **Fill in `{look:ren}`** with the description under "Ren" below,
  pasted in full.
- **When the platform is built**, `art-source/mind/manifest.json` runs
  through Japanese's pipeline:
  chroma key, face-only composites onto the base pose, WebP/AVIF, and a
  contact sheet to catch drift. Reject anything that drifts, and make it
  again.

## Rules (every image)

- **Never any text:** no letters, no speech bubbles, no captions, no
  signatures and no logos. Books, screens, signs and boards are blank or
  show pictures only. All text is added later as a live layer.
- **Keep each character identical** to their sheet: hair, eyes,
  clothes, colours.
- **Sprites** go on one flat, even, pure green background (#00FF00), with
  no floor, no shadow and no green on the character.

**The styles:**
- **COLOUR (characters):** "STYLE: Match the rendering of the attached
  style reference (the tall woman in the white coat) exactly:
  high-quality modern anime illustration, light-novel cover quality, fine
  clean lineart with thin tapered lines, soft cel shading with gentle
  gradients, detailed fabric folds, rich but slightly muted colours,
  natural slender proportions, soft even studio lighting from the
  front-left. Do NOT draw the woman from the style reference; use her only
  for the art style."
- **BG (backgrounds):** "STYLE: Match the rendering of the attached style
  reference (painterly anime background art, as in a high-budget TV anime
  or visual novel): soft painted lighting, clean perspective, gentle depth
  of field. Do NOT draw the woman from the style reference; use her only
  for the art style."

Start every prompt with its style paragraph, then the prompt.

## Ren (the second character)

**藤宮 蓮 Fujimiya Ren.** He is Kurenai's colleague and the space's
sceptic: dry, amused, contrarian on principle, and honest enough to say
"fine, you got me" when he loses an argument. His colours are Fuji
(wisteria) to her crimson, and his flower motif echoes hers.

**`{look:ren}`:**
> a Japanese man in his late twenties, slim and tall (a little taller than
> the woman in the style reference), relaxed posture with a faintly amused,
> half-lidded expression; slightly messy ash-black hair, collar length,
> with a soft side part, a few strands falling over his right eye, the
> underside and tips tinted a muted wisteria purple; calm grey-violet eyes;
> a single small earring on his left ear: a wisteria-blossom charm with a
> short pale-purple silk tassel; a long charcoal-grey scholar's coat with a
> high mandarin collar, worn open, its lining a muted wisteria purple with
> a faint fine geometric line pattern, the sleeves turned back once at the
> cuffs; under it a fitted black high-neck sweater, a dark slate waistcoat
> with a thin silver watch chain, slim dark trousers, polished black
> leather boots; a thin silver ring on his right hand; no glasses, no hat

### Batch 1: the character sheet

**`mind.sheet.ren`** (16:9; COLOUR; attach STYLE)
> A character reference sheet for an original character: {look:ren}. On
> one plain light-grey background, side by side: full-body front view,
> full-body three-quarter view and full-body back view, all standing in a
> relaxed neutral pose at the same scale, plus three head close-ups on the
> right (neutral, a dry amused half-smile, one eyebrow raised in
> scepticism). Consistent proportions and colours across every view. No
> text, no labels, no colour swatches with writing.

Check before going on: does he read as a sibling of Kurenai's art, and is
the purple muted, not neon? Remake the sheet until you are happy. Every
later image copies it.

### Batch 2: the base poses

**`mind.base.ren.a`** (2:3; COLOUR; attach STYLE and `inbox/mind.sheet.ren.png`)
> Ren from the attached character sheet ({look:ren}), drawn as a
> visual-novel character sprite: full body, standing, body turned slightly
> to his right (three-quarter view) with his face toward the viewer,
> holding a closed, worn dark-green hardcover book against his side in his
> left hand with a ribbon bookmark hanging out, right hand relaxed in his
> trouser pocket, neutral calm expression with the mouth closed, eyes open
> looking at the viewer. Centred, the whole figure visible from the top of
> the hair to the boots, with a small margin above the head and below the
> feet; nothing cropped. Background: one flat solid pure green colour
> (#00FF00), completely even, no floor, no cast shadow, no gradient, no
> green anywhere on the character.

**`mind.base.ren.b`** (2:3; COLOUR; attach STYLE, `inbox/mind.sheet.ren.png` and `inbox/mind.base.ren.a.png`)
> The same character in the same style, scale and framing as the attached
> sprite, in a second pose: full body, standing, facing the viewer more
> directly, his right hand raised at chest height with a plain silver coin
> balanced on the knuckle of his index finger as if about to flip it
> (no markings on the coin), his left hand holding the closed book at his
> hip, neutral calm expression with the mouth closed, eyes on the viewer.
> Identical clothing, hair and colours. Whole figure visible, nothing
> cropped. Background: one flat solid pure green colour (#00FF00),
> completely even, no floor, no cast shadow, no gradient.

### Batch 3: Ren's faces

One edit each, on `inbox/mind.base.ren.a.png` (attach it and nothing
else; the aspect stays the same). Every prompt begins:
> Edit this image. Keep the exact same pose, body, hands, book, clothing,
> hair, framing, size, position and the flat green background, pixel for
> pixel. Change ONLY the facial expression to:

| id | ending |
|---|---|
| `mind.face.ren.amused` | amused: a dry, lopsided half-smile, eyes slightly narrowed with humour. Do not move the head. |
| `mind.face.ren.thinking` | thinking: eyes looking up and to the side, lips pressed together, a small frown of concentration. Do not move the head. |
| `mind.face.ren.sceptical` | sceptical: one eyebrow raised high, the other level, a flat unimpressed mouth. Do not move the head. |
| `mind.face.ren.surprised` | surprised: eyes wide, eyebrows up, lips slightly parted. Do not move the head. |
| `mind.face.ren.conceding` | conceding: a rueful, good-natured smile with eyes briefly closed, eyebrows lifted, as if saying "fine, you got me". Do not move the head. |
| `mind.face.ren.serious` | serious: a steady, level gaze straight at the viewer, mouth closed and neutral, eyebrows slightly lowered. Do not move the head. |
| `mind.face.ren.pleased` | pleased: a genuine warm smile, eyes softened. Do not move the head. |

## Kurenai's faces (the design's slots)

### Batch 4: Kurenai on green, then three faces

**`mind.base.kurenai`** (2:3; edit; attach `assets/assistant/mascot/full/kurenai-production.png`)
> Edit this image. Keep the woman exactly as she is, pixel for pixel: pose,
> body, hands, tablet, coat, hair, face, framing, size and position. Change
> ONLY the background: make it one flat solid pure green colour (#00FF00),
> completely even, no floor, no shadow, no gradient, no green on her.

Then one edit each on `inbox/mind.base.kurenai.png`. Every prompt begins:
> Edit this image. Keep the exact same pose, body, hands, tablet, clothing,
> hair, hair ornament, framing, size, position and the flat green
> background, pixel for pixel. Change ONLY the facial expression to:

| id | ending |
|---|---|
| `mind.face.kurenai.thinking` | thinking: eyes lowered slightly to one side, a calm, considering look, lips gently closed. Do not move the head. |
| `mind.face.kurenai.pleased` | pleased: a soft, warm closed-mouth smile, eyes gently curved. Do not move the head. |
| `mind.face.kurenai.curious` | curious: eyebrows slightly raised, eyes bright and attentive, head still, a faint interested smile. Do not move the head. |

## Batch 5: the scene backgrounds (16:9; BG; attach STYLE)

Every prompt ends:
> Camera at standing eye level, horizon at about 45% of the height, the
> floor area in the centre left open so characters can stand there. No
> people. No text anywhere.

**For the dialogues:**
- **`mind.bg.study`**: A quiet scholar's study in an old building in the
  afternoon: tall dark-wood bookshelves full of books with blank spines,
  a large arched window on the right with soft daylight and a hint of a
  wisteria vine outside, a long reading table with a brass lamp, an open
  blank notebook and a cup of tea, a chalkboard on the back wall with
  only simple diagrams (arrows, a tree of boxes), no writing. Muted warm
  wood with soft purple shadows.
- **`mind.bg.study.evening`**: The same study, the same layout and
  camera, at evening: the lamp lit and warm, the window deep blue-violet
  with a few lights outside, soft shadows.
- **`mind.bg.wisteria`**: A wisteria trellis walk in a Japanese garden in
  late spring: hanging purple wisteria blossoms overhead, a stone path
  leading away, a low wooden bench at one side, dappled light. Calm and
  open.

**For the thought-experiment theatre:**
- **`mind.bg.trolley`**: A quiet rural railway junction on an overcast
  morning: one track splits into two branches that curve away from the
  viewer, a tall manual lever beside the switch in the foreground left,
  an old empty tram car stopped far up the line. Nothing on the tracks;
  calm, not frightening.
- **`mind.bg.footbridge`**: The same railway seen from a narrow iron
  footbridge that crosses above the tracks, the railing in the
  foreground, the tracks running away below, an overcast morning. No one
  on the bridge or the tracks.
- **`mind.bg.machine`** (later): A softly lit, clean futuristic room with
  a single reclined sleep pod with a glass canopy, calm blue-violet light,
  cables neatly along the floor.
- **`mind.bg.harbour`** (later, for the ship of Theseus): A small
  wooden harbour at sunset with one old wooden sailing ship moored, a
  pile of new planks on the quay beside it.
- **`mind.bg.room`** (later, for the Chinese room): A closed windowless
  room with filing cabinets, a desk with stacks of blank cards and a large
  manual open, a narrow slot in the door. Lamplight.

## Batch 6: philosopher portraits (1:1; COLOUR; attach STYLE)

Small card portraits for §11.5: a head-and-shoulders bust, in the same
anime style, against a plain soft Fuji-purple background. These are
respectful anime interpretations based on the person's surviving
portraits or busts, not caricatures. Every prompt is:
> A head-and-shoulders portrait card illustration of the historical
> philosopher [WHO], drawn in the anime style of the attached reference,
> as a respectful interpretation based on their well-known surviving
> portraits and busts: [LOOK]. Three-quarter view, calm thoughtful
> expression, looking slightly past the viewer. Plain soft muted
> wisteria-purple background, no frame. No text, no name, no labels.

| id | WHO | LOOK |
|---|---|---|
| `mind.card.socrates` | Socrates | an older man, bald on top, broad snub nose, full curly grey beard, a simple pale himation over one shoulder |
| `mind.card.aristotle` | Aristotle | a middle-aged man with short curled hair, a neat short beard, a thoughtful brow, a cream chiton and himation |
| `mind.card.epicurus` | Epicurus | a man with long wavy hair and a long full beard, gentle eyes, a simple pale robe |
| `mind.card.aurelius` | Marcus Aurelius | a man in his forties with thick curly hair and a full curly beard, a dark Roman cloak fastened at the shoulder |
| `mind.card.hume` | David Hume | a heavy-set, good-humoured eighteenth-century Scotsman, a powdered wig, a dark red coat and white cravat |
| `mind.card.kant` | Immanuel Kant | a slight, thin elderly man with a high forehead, powdered grey hair tied back, a dark brown eighteenth-century coat and white neckcloth |
| `mind.card.mill` | John Stuart Mill | a balding Victorian gentleman with side whiskers, a high forehead, a black frock coat and white collar |
| `mind.card.beauvoir` | Simone de Beauvoir | a woman in her forties with dark hair swept up in a turban-style wrap, strong brows, a dark high-collared jacket |

## Credits

The credits page says the art is AI-assisted (Gemini) and original to
this app, as Japanese's does.
