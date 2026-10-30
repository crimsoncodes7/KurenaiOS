#!/usr/bin/env python3
"""Add the Badge Wall's pending art to art-source/app/manifest.json (roadmap 5.16-5.17).

    python3 -I tools/gen_ach_manifest.py

Batch 26: one 21:9 panorama per set (the panel behind its medallions).
Batch 27: one enamel-pin badge per achievement that has no unit badge (101).
Reads art-source/app/ach-defs.json (every badge without a unit picture and every set, written
from the registry: node tools/gen_ach_defs.mjs). Idempotent: assets are replaced by id. Waves continue after 5.13's 23. The motifs,
palettes and composition rules are the art brief; docs/design-prompts.md §19 is the page's.
"""
import json, os

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
MP = os.path.join(ROOT, "art-source", "app", "manifest.json")

GREEN = ("Background: one flat solid pure green colour (#00FF00), completely even, no floor, no cast shadow, "
         "no gradient, no green anywhere on the subject.")
NOTEXT = "No text anywhere: no letters, numbers, Roman numerals, kanji, labels or scribbles that look like writing."

# each set: its palette for the badge enamel, its rim metal, and the panorama's scene
SETS = {
  "app": ("deep crimson and gold", "gold", "a quiet study room at dawn seen through a tall window, a desk with a single lamp, morning light across the floor"),
  "focus": ("warm amber and bronze", "bronze", "a hushed reading hall at golden hour, long tables and green banker's lamps, dust in the light"),
  "streaks": ("ember orange and gold", "gold", "a mountain path of stone steps climbing at sunrise, a line of small lanterns along it"),
  "study": ("teal and silver", "silver", "a calm library mezzanine with tall shelves and a skylight, soft teal shadows"),
  "exams": ("indigo and silver", "silver", "an empty exam hall at early morning, rows of desks, a wall clock with a blank face, long window light"),
  "code": ("sky blue and silver", "silver", "a night desk by a window over a city of soft lights, a closed laptop glowing faintly, rain on the glass"),
  "ja": ("vermilion and gold", "gold", "a Kyoto side street at dusk with paper lanterns and a small shrine gate, wet stones"),
  "mind": ("lavender violet and gold", "gold", "a moonlit stone courtyard with a single old tree and a reflecting pool, stars"),
  "creatives": ("moegi (a fresh light yellow-green) and gold", "gold", "an artist's sunlit atelier with easels, paper sketches pinned on a wall (no readable marks), plants"),
  "routines": ("sea-green teal and brass", "brass", "a morning kitchen table by a window, a teapot steaming, soft green garden outside"),
  "organised": ("slate blue and brass", "brass", "a tidy wooden desk seen from above with folders, a corkboard and a calendar grid of blank squares"),
  "goals": ("jade green and gold", "gold", "a mountain summit above a sea of cloud at sunrise, a small flag on the peak"),
  "collection": ("cobalt blue and rose gold", "rose-gold", "a cosy den at night: shelves of books and game boxes with blank spines, a screen's soft glow"),
  "ink": ("ink black and sakura pink", "silver", "a calligraphy desk with an ink stone and brushes, petals drifting through an open window"),
  "kurenai": ("crimson and platinum", "platinum", "an elegant observatory office at night, a round window full of stars, a red velvet chair"),
  "u-cs": ("periwinkle blue and silver", "silver", "a server room drawn softly as a starry night, cool periwinkle light along the racks"),
  "u-maths": ("amber and silver", "silver", "a chalk-dust study at dusk with a large blank blackboard and brass instruments, amber light"),
  "u-it": ("slate green-grey and silver", "silver", "a quiet modern office at night with a wall of blank dashboards glowing grey-green"),
  "u-code": ("sky blue and silver", "silver", "a blueprint-blue workshop with tools on pegboards and a long workbench under a skylight"),
  "u-code-t": ("sky blue and silver", "silver", "a railway station at dawn with many tracks branching into mist, signal lamps"),
  "u-ja": ("vermilion and gold", "gold", "a winding path of torii gates up a green hillside, late afternoon sun"),
  "u-mind": ("lavender violet and gold", "gold", "a long cloister of stone arches opening onto a lavender garden at twilight"),
  "u-cr-art": ("moegi and gold", "gold", "a bright sketching studio with a window seat, a mannequin and stacked sketchbooks (blank covers)"),
  "u-cr-design": ("moegi and gold", "gold", "a print studio with type cases (blank blocks), paper samples in a fan of colours"),
  "u-cr-edit": ("moegi and gold", "gold", "an editing suite at night with a film reel, a mixing desk and soft monitor glow (blank screens)"),
  "u-cr-write": ("moegi and gold", "gold", "a writer's attic with a typewriter, a cup of tea and rain on a round window"),
}

# the badge's subject — one clear object, readable at 64 px
MOTIF = {
  "regular": "a small key on a ring beside a door slightly open, warm light from inside",
  "year-one": "a sapling grown into a young tree with a ring of the year around its trunk",
  "early-bird": "a small bird on a branch against a rising sun",
  "night-owl": "an owl perched on a crescent moon",
  "witching": "an old pocket watch with its hands near three, under a thin moon",
  "first-light": "the first sunrise over the sea with a single pine on a rock",
  "in-the-zone": "a candle flame perfectly still inside a glass lantern",
  "deep-hours": "an hourglass with glowing sand, the top bulb nearly empty",
  "marathon": "a winding road disappearing over hills toward a distant gate",
  "unbroken": "a single unbroken golden thread looping through three rings",
  "full-day": "the sun arcing over a day, three positions of it along a curve",
  "change-of-subject": "a railway point switch turning one track into two",
  "kept-going": "a chain of linked rings, each link a little brighter",
  "rest-is-work": "a cup of tea steaming beside a closed book and a folded blanket",
  "perfect-week": "seven small lanterns in a row, all lit",
  "into-the-green": "a leaf turning from grey to bright green, with a small check-shaped vein",
  "card-sharp": "a fanned hand of blank study cards with a silver edge",
  "steady-memory": "a lighthouse holding a steady beam across calm water",
  "leech-hunter": "a pair of tweezers lifting a small curled leech off a blank card",
  "quiz-runner": "a running shoe stepping over a stack of blank question cards",
  "paper-trail": "a trail of blank papers fluttering into a neat stack",
  "second-attempt": "an arrow that misses, curves back and lands in the centre of a target",
  "margin-notes": "an open notebook with a small sticky tab in the margin and a pencil",
  "lab-keys": "a brass key with a tiny flask for its bow",
  "companion-complete": "a closed leather guidebook with a ribbon and a compass on its cover",
  "tuned-to-you": "a tuning fork humming with three soft rings of sound",
  "dress-rehearsal": "a stage curtain half open on an empty desk with a lamp",
  "on-target": "an arrow in the centre of a target",
  "ready": "a quill pen and a sealed envelope on a neat desk, a small star above",
  "survived-season": "a ship on calm water after a storm, a rainbow behind it",
  "ahead-of-time": "a paper aeroplane flying ahead of a clock's minute hand",
  "under-the-clock": "a stopwatch over a sheet of blank exam paper",
  "know-thyself": "a hand mirror reflecting a small star",
  "green-tests": "three glowing lamps all lit green on a small silver panel",
  "recall": "a boomerang returning along a curved trail of light",
  "kata": "a pair of crossed wooden practice swords",
  "shipped": "a small sailing ship launching down a slipway",
  "verified": "a wax seal with a gear impression pressed on a ribbon",
  "no-hints": "a lantern burning bright with its cover closed, no light leaking",
  "bug-catcher": "a butterfly net with a tiny beetle caught inside",
  "daily-20": "a small kettlebell beside a twenty-minute sand timer",
  "hiragana": "a round brush stroke curling into a soft circle, with a brush (no real character)",
  "katakana": "three sharp brush strokes arranged like a bamboo stem (no real character)",
  "words": "a stack of three small blank books with a ribbon bookmark",
  "ear": "a seashell with soft sound waves coming from it",
  "brush": "a calligraphy brush resting on an ink stone",
  "voice": "a small paper lantern shaped like a speech bubble glowing (blank)",
  "checkpoint": "a small wooden toll gate raised over a path",
  "immersion": "a koi swimming in a round pond seen from above",
  "sentence-miner": "a small pickaxe beside a glowing gem with a blank ribbon around it",
  "evaluated": "a balance scale weighing a feather against a stone, level",
  "changed-my-mind": "a weathervane turning to point a new direction",
  "journal": "a leather journal held shut by a band, a pressed flower peeking out",
  "big-questions": "a single large question-mark-shaped constellation of stars (made of stars, not a glyph)",
  "studies": "a small easel with a blank canvas and a palette",
  "wordsmith": "a fountain pen nib forging a spark on a tiny anvil",
  "sketchbook": "an open sketchbook with a loose gesture drawing of a cat (no writing)",
  "drills": "a grid of small squares with one square lit, and a ruler",
  "portfolio": "a leather portfolio folder with one framed picture peeking out",
  "momentum": "a paper windmill spinning, motion lines around it",
  "projects": "a finished scale model of a little house on a wooden board",
  "routine": "a ring of seven small stones arranged like a clock face (no numbers)",
  "morning-person": "a window opening onto sunrise with a teacup on the sill",
  "wind-down": "a candle beside a crescent moon through a window",
  "habit-former": "a sprout growing from the same spot in three stages",
  "every-time": "a small bell rung three times, three soft rings around it",
  "done-and-dusted": "a feather duster over a gleaming empty shelf",
  "handed-in": "a hand placing an envelope into a letterbox",
  "on-the-plan": "a map with a dotted path and a pin at its end",
  "caught-up": "a runner's baton passed between two hands",
  "in-step": "two sets of footprints walking side by side in sand",
  "synced": "two interlocking gears turning together",
  "goal-getter": "a flag planted on a small summit",
  "every-period": "four small checkmark-shaped leaves on one stem (leaves, not ticks)",
  "bookkeeper": "a closed ledger book with a ribbon and a brass corner",
  "under-budget": "a coin purse tied with a ribbon, a few coins beside it",
  "saver": "a ceramic piggy bank with a coin dropping in",
  "wish-granted": "a shooting star landing in a gift box",
  "binge": "a cosy sofa facing a glowing screen (blank) with popcorn",
  "episodes": "a strip of film frames curling like a wave (blank frames)",
  "bookshelf": "a short shelf of books with blank spines, a bookend",
  "reader": "an open book with pages turning in a breeze",
  "route-master": "a crossroads signpost with three blank boards",
  "visual-novels": "a scene window frame with a dialogue box shape (blank) and a cherry branch",
  "player": "a game controller resting on a cushion",
  "the-shrine": "a small wooden shrine with a lit lantern and an offering of flowers",
  "mirror": "a round hand mirror reflecting a stack of cards",
  "backlog-clearer": "a tall stack of game boxes (blank) being swept into a neat row",
  "airing": "a cherry blossom, a sun, a maple leaf and a snowflake in a ring of four seasons",
  "handwritten": "a pen writing a smooth loop on lined paper (no letters)",
  "marked": "a red pencil ticking a sheet of blank exam paper",
  "write-it-out": "a pencil drawing a simple diagram of circles and arrows",
  "clipper": "a pair of scissors cutting a rectangle out of a page",
  "library": "an archive box with neat folders peeking out",
  "conversations": "two teacups facing each other on a small table, steam curling together",
  "on-a-schedule": "a pocket watch with a small envelope tucked under its chain",
  "week-by-week": "a ribbon-tied bundle of seven thin blank cards",
  "gold": "a small chest overflowing with gold coins",
  "level": "a staircase of three steps rising into light",
  "collector": "a glass display cabinet with tiny trinkets",
  "wardrobe": "an elegant clothes rail with three tiny outfits on hangers",
}

def pano_prompt(sid, name):
    pal, metal, scene = SETS[sid]
    return ("A wide painted panorama for a badge collection panel, in the painterly anime background style of the attached reference: "
            + scene + ". The colour mood leans " + pal + ". Keep the LEFT third quiet and dark enough for a set name to sit over it, "
            "and the right two-thirds calm with no busy detail, because round badges are laid on top of it. No people, no characters. " + NOTEXT)

def badge_prompt(motif, pal, metal):
    return ("A small round emblem illustration, like an enamel pin, painted in the same style: " + motif + ". "
            "One clear subject centred, simple and readable at 64 pixels, filling the circle with a small margin. "
            "A thin " + metal + " rim; the enamel in " + pal + ". The badge must work at full colour: the app dims it to grey "
            "and lights it up as progress grows, so keep strong value contrast and no tiny detail. "
            "Do not draw tiers, numbers, stars-for-rank or ribbons with marks: the app draws the tier pips. " + GREEN + " " + NOTEXT)

def main():
    m = json.load(open(MP))
    defs = json.load(open(os.environ.get("ACH_DEFS", os.path.join(ROOT, "art-source", "app", "ach-defs.json"))))
    keep = [a for a in m["assets"] if not a["id"].startswith("app.ach.")]
    batches = [b for b in m["batches"] if b["n"] not in (26, 27)]
    batches.append({"n": 26, "title": "The Badge Wall: set panoramas", "why": "Roadmap 5.16: each set's panel is a 21:9 painting behind its medallions (after Reverse: 1999's Fourth Wall). Until one arrives the panel is a wash of the set's colour with its glyph."})
    batches.append({"n": 27, "title": "The Badge Wall: badges", "why": "Roadmap 5.17: one enamel-pin badge per achievement that has no unit badge. Until one arrives the medal is the set's enamel disc with its glyph. Keyed as a solid disc and exported at 384 px."})
    wave, n = 24, 0
    out = []
    for s in defs["sets"]:
        out.append({"id": "app.ach.pano." + s["id"], "batch": 26, "kind": "bg", "style": "bg", "aspect": "21:9", "attach": [],
                    "prompt": pano_prompt(s["id"], s["name"]),
                    "where": "The Wall: the panel of the set “" + s["name"] + "”, behind its badges (55% opacity).",
                    "size": "wave %d · exported 1920 px wide" % wave, "wave": wave})
        n += 1
        if n % 15 == 0: wave += 1
    for d in defs["defs"]:
        pal, metal, _ = SETS[d["set"]]
        out.append({"id": "app.ach." + d["id"], "batch": 27, "kind": "spot", "style": "bg", "aspect": "1:1", "attach": [],
                    "prompt": badge_prompt(MOTIF[d["id"]], pal, metal),
                    "where": "The Wall: the badge “" + d["name"] + "” (" + d["what"] + ")" + (" — a hidden badge: drawn as a silhouette until earned" if d["hidden"] else ""),
                    "size": "wave %d · exported 384 px, keyed" % wave, "wave": wave, "solid": True, "long": 384})
        n += 1
        if n % 15 == 0: wave += 1
    m["assets"] = keep + out
    m["batches"] = batches
    json.dump(m, open(MP, "w"), indent=1, ensure_ascii=False)
    open(MP, "a").write("\n")
    print(len(out), "assets in batches 26-27, waves 24-%d" % wave)

main()
