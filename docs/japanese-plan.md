# Japanese — a study space for KurenaiOS (plan, revision 3)

**Revision 3 (17 October 2026)** folds in what the vertical slice measured
(`prototypes/japanese-space/`, commits 63993ac and b5a0093):
- **Load and pace** (§8, §9, §10.2). Simulated on the scheduler:
  - writing and speaking every word fits only ~900 words a year into 40
    minutes a day;
  - giving W and S only to production-set words (~30%) fits ~1,700;
  - the daily budget matters most: 30 minutes gives ~1,000 words a year.
  - The timeline now uses these figures.
- **Speech** (decision D, §13). Spike S, before your recordings:
  - Whisper "fixes" dropped っ and long vowels (ちょと → ちょっと), and is
    unusable on single words;
  - the pace-calibrated acoustic check accepted no mistakes and made no
    wrong confident calls.
  - Sentences therefore get recognition plus an acoustic length check;
    words get the acoustic check alone.
- **The tokeniser** (decision K, §7.2). Spike T chose Lindera + UniDic with a
  JMdict merge: 98.9% of the needed dictionary forms on colloquial lines,
  against 94.5% for IPADIC. Its 576 MB memory keeps it on the Mac; the phone
  has no tokeniser.
- **Personal clips** (decision L, §12). Saving a line cuts just that line
  (a few seconds of video) into IndexedDB; the episode itself is never
  stored.
- **Smaller findings**:
  - ー is the same sound as a spelled long vowel in every comparison (§7.1);
  - furigana are spelled from readings, not pronunciation (§6);
  - the licences in §4.3 are confirmed.

**Revision 2** followed an outside review and your answers
on the art pipeline:
- **kuromoji** runs only in a worker and only where it is needed; lookup uses
  deinflection rules instead (§6, §7.2).
- **Speech recognition** is used on sentences only. Single-word sound
  contrasts are checked acoustically, and Spike S measures how often a
  mistake is accepted (§13).
- **Handwriting** in the core is kana plus typed Japanese; kanji written from
  memory moves to the Kanji deep track (§8, §9).
- **Art** is raster images under a live text layer. It is made by hand in the
  Gemini app around a reusable cast, with expressions swapped onto fixed
  base poses (§12.1).
- **The ShareAlike boundary** is now explicit (§4.3).

## Context

KurenaiOS has four subjects. Code, the newest, was a study space built on the
shared Study shell. It added its own curriculum, practice engine, evidence
model and pay rules. Japanese is the fifth, and it follows the same route:
1. a full plan (this document);
2. a throwaway vertical slice in `prototypes/japanese-space/`;
3. integration, released one unit at a time.

**The aim.** Broad proficiency in reading, writing, listening and speaking.
The concrete test is using Japanese media without English: anime, J-dramas,
J-pop, manga, light novels (LNs) and visual novels (VNs).

**What you told me:**
- You start from absolute zero.
- You can give about **30–45 minutes a day** (about 4–5 hours a week).
- Media snippets are split: the deployed app ships only licensed or original
  material, and your own clips stay on your device.
- Speech recognition: whichever is better and more reliable. A spike decides.
- Art: made by hand in the Gemini app, no API spend for now; a new cast in
  the Kurenai art style, with base poses and swapped expressions.

**What this plan is not:** a Duolingo clone. Section 2 says why and what it
does instead.

---

## 1. Decisions (proposed; for your review)

| # | Question | Proposal |
|---|---|---|
| A | Method | Input-led, with explicit grammar and frequency-ordered vocabulary aimed at your media, and skills scheduled separately (§2). |
| B | Content source | Authored lessons and checks, plus dictionary and corpus data **generated at build time** from openly licensed sources (§4). Nothing is generated live by an LLM. The AI only *grades* free production, and that grade is advisory. |
| C | Scheduler | **FSRS-style**, per item × skill facet (§9). It is more accurate than SM-2 for long-term retention. It sits in `state.japanese`, the way Code's retrieval scheduler does, not in `srs.js`. Writing and speaking facets go only to production-set words (~30%), which the load simulation showed is what fits the budget (§8). |
| D | Speech checking | **Words and sound contrasts: the acoustic check alone**, calibrated to your pace; when unsure it asks you to say it again. **Sentences: recognition plus an acoustic length check** wherever the target has っ or a long vowel, because recognisers silently "fix" those mistakes (§13). Two recognisers behind one interface: the browser's (no download; Chrome sends audio to Google) and Whisper on the device (about 200 MB, offered like the C# runtime). The default recogniser waits for your recordings in Spike S. Pitch is always analysed on the device and is advisory. |
| E | Media snippets | Shipped: original illustrated panels, VN scenes, audio and freely licensed text (art per decision I). Personal: your own clips, screenshots and subtitle files, kept in IndexedDB on the device only — never synced as binaries, committed or deployed (§12). |
| F | Subject hue | **朱 shu (vermilion)**, about `oklch(0.72 0.15 42)`. It reads clearly orange next to the rose crimson (hue 18), so it is a sibling to the identity colour rather than a clash. To be confirmed in the design frames. |
| G | Rewards | Pay once per lesson, checkpoint and capstone. Reviews pay a small amount with a daily cap. Immersion pays only through Focus. HP gates nothing (invariants 2 and 106). |
| H | Romaji | Shown only in Stage 0's first week, then removed for good. Typed answers accept romaji through an IME-style converter, which shows you the kana it produced. |
| I | Art | **Generated by hand in the Gemini app** (your Pro plan; no API spend for now). A fixed cast of four new characters in the rendering style of the Kurenai master art (Kurenai herself is not in the lessons). One or two base poses per character; expressions are face swaps on those poses. Raster art with no text; all text is a live layer (§12.1). |
| J | Writing scope | Core W = kana handwriting and typed production. Kanji are traced once when introduced (not reviewed); kanji written from memory is the optional Kanji deep track (§8). |
| K | Tokeniser | **Lindera + UniDic** (lindera-wasm v6, dictionary loaded at run time) in a worker, with a **JMdict merge** that joins pieces into dictionary headwords when the join holds a content word. **Mac only**: on the phone, lookup uses deinflection and longest match, and coverage results arrive as synced data (§7.2). |
| L | Personal clips | Your video and subtitle files are opened, never copied. "Save this line" cuts only that line out of the playing video (a few seconds of WebM) into IndexedDB on the device. Saved lines are not synced, backed up, committed or deployed (§12). |

---

## 2. The method: why it is not Duolingo

Duolingo optimises streaks and multiple-choice taps. That is weak for Japanese,
where kanji, reading volume and listening hours are the bottleneck. This space
runs on these principles, each with a mechanism in the app:

1. **Kana in days, not months.** Stage 0 is mnemonic-led recognition plus
   writing, with speed drills until reading is automatic (under 1.5 s a
   character).
2. **Vocabulary chosen by frequency and by your media.** The core list is
   ordered by frequency in an anime, manga and LN corpus, not by textbook
   themes. "Target packs" pull words from the titles in your Collection (§11).
3. **Kanji learned through words.** Components are taught as building blocks
   (WaniKani/RTK-style radicals), but each kanji is drilled inside the words
   you are learning, never as an isolated reading list.
4. **Grammar: explain once, then recognise it in context many times.** A short
   explanation, then the point turns up again in input (reading and listening)
   before you produce it.
5. **Comprehensible input is the main course.** From Stage 1, every lesson
   ends with a short graded passage and audio. From Stage 2, input is the
   biggest share of the day (graded readers, then your own media).
6. **The four skills are tracked separately** (§8). You can read a word without
   being able to hear it, write it or say it, and the app knows the difference.
7. **Production with real checks.** Typed answers go through validators (§7),
   speech is compared with a reference (mora and pitch), and kanji are traced
   stroke by stroke. Self-marking is used only where no check is possible, and
   it is labelled as self-marked.
8. **Sentence mining.** Any line you meet (a reader passage, a clip subtitle,
   a pasted line from a VN) becomes a card, with its audio and picture, in one
   action.
9. **Shadowing and pitch from Stage 1.** Short shadowing reps against native
   audio, with a pitch-contour overlay.
10. **An honest timeline** (§10). Your measured rates project when you could
    reach each media milestone, and the projection updates as you go.

**The daily 30–45 minutes**, computed each day like Code's Daily 20 and never
stored:

| Stage | Reviews | New material | Input (read/listen) | Output (write/speak) |
|---|---|---|---|---|
| 0 Kana | 10 min | 15 min | 5 min | 10 min (writing) |
| 1 Foundations | 12 | 13 | 8 | 7 |
| 2 Bridge | 12 | 10 | 15 | 8 |
| 3+ | 10 | 7 | 20+ | 8 |

If reviews run long, new material shrinks. Input is never cut. Immersion
outside the app (watching, reading) counts towards input (§11).

---

## 3. The curriculum

Six stages. Each stage has units, each unit has about 6–8 lessons, and every
unit ends with a checkpoint. Nothing is locked (invariant 2). The order is
recommended, and each lesson lists its prerequisites as items on the item
graph.

| Stage | Rough equivalent | Words / kanji (cumulative) | Typical content | Media it opens |
|---|---|---|---|---|
| **0 Kana** | — | 40 words / 0 | hiragana, katakana, dakuten, small kana, long vowels, っ, pitch basics, mora timing | reading signs, menus, song titles |
| **1 Foundations** | N5 / A1 | 800 / 120 | です/だ, particles は が を に で へ と も の, verb groups, ます forms, て-form, adjectives, existence, counters, time | graded readers L0–1, Yotsuba-style manga **with lookup** |
| **2 Bridge** | N4 / A2 | 2,000 / 350 | plain forms, casual speech, potential, volitional, conditionals, giving/receiving, ている, explanatory の/んだ, quoting | slice-of-life anime **with Japanese subtitles**, easy manga with furigana |
| **3 Intermediate** | N3 / B1 | 4,500 / 750 | passive/causative, keigo basics, ようだ/らしい/そう, contractions and anime speech (じゃん, ってば, ちゃう), written style | shounen manga, VNs with lookup, easy anime raw |
| **4 Upper intermediate** | N2 / B2 | 8,000 / 1,200 | literary grammar, nuance pairs, regional and character speech (役割語), sound effects | LNs, J-dramas raw, most anime raw |
| **5 Advanced** | N1 / C1 | 12,000+ / 2,000 | classical remnants, dense prose, fast speech | literary VNs, seinen, unscripted variety TV |

**Tracks** (optional, opened from the skill map):
- **Kanji deep track** — components, writing all jōyō kanji.
- **Pitch accent** — patterns, minimal pairs, compound rules.
- **Keigo** — polite, honorific and humble speech for real-world use.
- **Media packs** — genre vocabulary: shounen battle, isekai and LN
  narration, romance/school VNs, J-pop lyrics language.
- **Onomatopoeia** — manga sound effects (擬音語/擬態語).

**Size, honestly.** About 6 units in Stage 0+1 and 8 in Stage 2. Stages 3–5
lean on input, with fewer authored lessons and more mined material. Like Code,
it is released one unit at a time.

**Can-do statements.** Every unit lists what you can now do in each skill
(JF Standard / CEFR style), for example "R: read a café menu", "L: follow a
self-introduction at natural speed", "S: order and ask for the bill".
Checkpoints test these.

---

## 4. Content model and sources

### 4.1 Item graph (the atomic units of knowledge)

| Item kind | Key | Example |
|---|---|---|
| `kana` | `k:あ` | あ |
| `kanji` | `j:食` | 食 (components 人+良, readings ショク/た-べる) |
| `word` | `w:<JMdict seq>` | 食べる |
| `grammar` | `g:<slug>` | `g:te-form`, `g:noun-desu` |
| `sound` | `s:<contrast>` | `s:long-vowel`, `s:っ`, `s:ら-row`, `s:pitch-atamadaka` |
| `sentence` | `x:<id>` | an authored or mined sentence, linking the words and grammar it uses |

Lessons introduce items. Exercises practise items. Evidence is recorded per
item × skill (§8).

### 4.2 Lesson shape (mirrors Code's `KOS_JA.lesson`)

Page order:
1. Hook (a real snippet the lesson unlocks)
2. Core idea
3. Patterns
4. Listen & notice
5. Pitfalls
6. Culture/usage note
7. Practise
8. Quick reference

Each lesson also carries:
- vocabulary and kanji lists (item keys);
- grammar points;
- at least 8 example sentences with audio;
- one graded passage;
- a shadowing set;
- an exercise bank (§5) covering all four skills;
- a Media moment (a panel, a VN scene or a clip, §12).

A smoke test enforces this depth contract, as smoke75 does for Code.

### 4.3 Build-time data (generated, never hand-edited; invariant 24 style)

`tools/gen_ja.mjs` writes `js/data/ja-dict.js` (only the items in the
released units), plus lazily loaded packs in `assets/ja/`.

| Data | Source | Licence (to verify at the slice) |
|---|---|---|
| Words, readings, glosses | JMdict (EDRDG), via jmdict-simplified | **CC BY-SA 4.0** (the EDRDG licence); attribution page; ShareAlike applies to the derived data files |
| Kanji meanings and readings | KANJIDIC2 (EDRDG) | CC BY-SA 4.0 |
| Stroke order and paths | KanjiVG | **CC BY-SA 3.0**, confirmed in each file's header (© Ulrich Apel) |
| Example sentences | Tatoeba | CC BY 2.0 FR (some CC0); audio is licensed per clip, so only clips with a compatible licence are used |
| Pitch accent | Kanjium | licence to confirm before use |
| Graded readers | Tadoku free series (NPO Tadoku Supporters) | CC BY-NC 4.0 (fits a personal, non-commercial app; attribution) |
| Advanced reading | Aozora Bunko | public domain titles |
| Morphology (Mac) | Lindera (lindera-wasm) with UniDic | Lindera MIT; UniDic BSD, LGPL or GPL, at your choice |
| Speech recognition (optional) | transformers.js running Whisper | Apache-2.0 (library), MIT (Whisper models) |
| Kana/romaji conversion | WanaKana, or the slice's own converter (`kana.js`) | MIT / ours |

**The ShareAlike boundary.** CC BY-SA applies to the data generated from
JMdict, KANJIDIC2 and KanjiVG, so that data lives only in its own files:
`js/data/ja-dict.js` and `assets/ja/dict/`. Each carries a licence header
and is released under CC BY-SA in turn. Authored lesson files
(`js/data/content/ja-u*.js`) never embed dictionary glosses or stroke paths.
They refer to items by key (`w:<seq>`, `j:<char>`), and the page fetches the
data at render time. Tadoku readers (NC) and Tatoeba (BY) sit in their own
files as well.

A **Licences & credits** page under Help lists every source.

### 4.4 Audio

- **Shipped audio** is pre-rendered at build time with VOICEVOX. The voices
  vary by speaker, age and gender. Each character requires its credit line
  (`VOICEVOX:<name>`), and the per-character terms are checked when the voices
  are chosen.
- Files are Opus/m4a, content-hashed, in `assets/ja/audio/`. They come as an
  **optional download pack per unit**, cache-first in the service worker,
  like the C# runtime.
- **Fallback:** `speechSynthesis` with a ja-JP voice (good on macOS and iOS)
  for any sentence that has no file, marked "synthetic voice".
- Where licences allow, native human audio from Tatoeba is used for listening
  checks. Synthetic audio alone would leave the ear unprepared for real voices.

---

## 5. The exercise engine

One schema, many renderers. Every exercise is data:

```js
{ id, kind, skills:["R","L"], items:["w:1358280","g:te-form"],
  prompt:{ text?, audio?, image?, media? }, // what is shown or played
  answer:{ strategy:"reading-set", accept:[…], diagnose:[…] }, // §7
  scaffold:{ furigana:"unknown"|"all"|"none", translation:true|false },
  hints:[…], tier:"warm-up|core|stretch" }
```

`KOS.jaEx.render(container, ex, onResult)` dispatches on `kind`. A result is
`{verdict, grade, diagnosis, ms, hintsUsed}`, and the grade is always
**derived**, never self-reported (as in Code, invariant 107).

| From your image | Kinds | Skill facets |
|---|---|---|
| **A. Recognition & recall** | `kana-read`, `kana-write`, `word-meaning`, `meaning-word` (typed, no options), `kanji-reading`, `kanji-meaning`, `cloze-recall` | R, W |
| **B. Grammar & construction** | `particle-pick`, `particle-type`, `build-sentence` (tiles), `conjugate`, `translate-en-ja`, `translate-ja-en`, `fix-error` + `explain-fix` | W, R |
| **C. Reading** | `passage` with questions, `infer-meaning` (an unknown word in context), `read-aloud` (links to S), and furigana and translation fading per item mastery | R |
| **D. Listening** | `listen-pick`, `minimal-pair` (おばさん/おばあさん, pitch pairs), `dictation`, `dialogue` (questions first, transcript only after answering), `speed-ladder` (0.75× → 1× → 1.25×) | L |
| **E. Production** | `prompt-write` (EN → JA typed), `situation-write` (free, AI-graded), `stroke-trace`, `stroke-free`, `shadow`, `say-it` (EN → spoken JA), `dialogue-turn` (respond to a character) | W, S |

**Choosing exercises.** Each session picks from the due facets (§9) and
the lesson in progress. It interleaves kinds and never shows two siblings of
the same item back to back. Deterministic seeding (as in Code's
`variation`) gives each review a fresh but reproducible variant: another
sentence for the word, another conjugation target, another speaker.

---

## 6. Furigana and scaffolding (meaningful, not decorative)

- Ruby text (`<ruby>`) is driven by **your** mastery. Furigana show only on
  kanji whose reading facet (R) you have not yet made stable. A global
  override cycles All, Unknown only (the default) and None.
- Translations fade the same way: a passage's English is hidden by default
  from Stage 2 and revealed per sentence on request. A request is recorded
  as a lookup and lightly lowers that item's confidence.
- Tapping any word gives a dictionary pop-up, "Add to reviews", and audio.
  The lookup does **not** need kuromoji. It works the way the Yomitan
  extension does: deinflection rules (about 150 entries, covering the casual
  contractions ちゃう/じゃう/てる/とく/じゃん) produce candidate dictionary
  forms, then the longest match from the cursor is looked up in the local
  JMdict pack. It is fast, small and runs on the main thread.

---

## 7. Answer validation

Exact string comparison is wrong for Japanese. `js/core/javalid.js` is a pure
module, runnable in Node, that holds a pipeline of reusable strategies. Each
returns:

```js
{ verdict:"correct"|"accepted"|"near"|"wrong",
  note?, diagnosis?:{ code, span, explain }, normalised }
```

- `accepted` means valid but not the target form, for example kana where
  the kanji was taught. It shows a note and counts as correct with a slightly
  lower grade.
- `near` means a typo-level slip (one mora wrong, a missing ゛). It gets one
  retry and costs one grade step.

### 7.1 Normalisation (always first)

- NFKC, full-width/half-width folding, trimmed whitespace.
- Romaji to kana (WanaKana; nn/n', long-vowel spellings ou/oo/ō).
- Katakana/hiragana folding where the kana *script* is not what is being
  tested.
- Iteration marks (々), ー vs ～ vs -, 。/. and 、/,, ・ and spaces removed.
- **ー is the same sound as the spelled long vowel** in every comparison
  (コーコー = こうこう, けーき = けえき). Recognisers and subtitles write long
  vowels both ways. The difference between a long and a short vowel still
  counts.
- Optional trailing です/ます politeness where the prompt allows either.

### 7.2 Strategies

| Strategy | Used by | How it judges |
|---|---|---|
| `exact-kana` | kana drills | The normalised kana match, with script **enforced** (ア ≠ あ when testing katakana). |
| `reading-set` | word recall, kanji reading | Accepts any written form of the target JMdict entry (kanji, mixed or kana) or of an authored synonym. Kana for a taught kanji is `accepted` with a note. |
| `meaning-set` | JA → EN glosses | Normalised English (articles, "to" before verbs, plurals); matches any JMdict gloss or authored alternative, with fuzzy matching for one-word slips. |
| `conjugation` | `conjugate`, slots in sentences | A **conjugation engine** (`KOS.jaConj`) generates the expected form from the dictionary form, verb class and target. Wrong answers are **diagnosed** by generating forms for other targets and classes: "You used the ichidan rule on a godan verb (帰る → 帰って)". Exceptions (行く, する, くる, ある/ない) are handled. |
| `particle-slot` | particle exercises | An authored list of acceptable particles per slot, with a reason for each alternative (は vs が judged by the authored context). |
| `order-graph` | `build-sentence` | The sentence is authored as chunks with ordering constraints (the verb is final, time/topic/place may move). Any order that satisfies them is correct; a valid but unusual one is `accepted` with "more natural: …". |
| `token-match` | `prompt-write`, `translate-en-ja`, `dictation` | The tokeniser (in its worker, see below) splits both answers and compares **lemmas plus required grammar features**: tense, polarity, politeness and the required particles. Synonyms come from JMdict and authored sets. Diagnoses: missing particle, wrong tense, wrong politeness, unknown word. |
| `mora-align` | dictation, `say-it` transcript | Levenshtein on **mora**, not characters, so the diagnosis can say: long vowel dropped (おばさん/おばあさん), っ dropped, voicing (か/が). |
| `stroke` | `stroke-trace`, `stroke-free` | KanjiVG reference strokes: stroke count, order and direction, and shape by resampled-path distance. Diagnoses: "stroke 3 drawn before stroke 2", "stroke 5 direction reversed". |
| `pitch` | `shadow`, pitch drills | A YIN pitch tracker on the device draws your F0 contour; it is normalised and compared with the reference pattern (Kanjium heiban/atamadaka/nakadaka/odaka) per mora. **Advisory**: shown as an overlay and never fails an answer on its own. |
| `ai-rubric` | `situation-write`, `explain-fix`, `dialogue-turn` | `KOS.ai.chat("generation", {structured:{schema}})` returns `{meaning_ok, grammar_issues[], naturalness, corrected}` against an authored rubric and target items. **Advisory and optional**: it never pays alone, works offline as "self-check against the model answer", and sends only the answer and prompt (a "What is sent" dialog, as for Code capstones). |

**The tokeniser (decision K; Spike T, `prototypes/japanese-space/SPIKE-T.md`).**
Four candidates were run on 137 original lines in eleven registers: textbook,
contractions, slang, character speech, sound effects, narration and others.
Each was scored on how many of the 271 dictionary forms needed for lookup and
coverage it returned:

| Tokeniser | Alone | + JMdict merge | Download | Memory |
|---|---|---|---|---|
| kuromoji / Lindera + IPADIC | 93.0% | 94.5% | 16–17 MB | 130–400 MB |
| **Lindera + UniDic** | 93.7% | **98.9%** | 50 MB | 576 MB WebAssembly heap (browser) |
| Sudachi (core) | 93.7% | 98.5% | 40 MB | ~250 MB |

What the results mean:
- **IPADIC breaks colloquial speech.** すげえ comes back as the made-up verbs
  すげる + える, and potential forms come back as headwords (倒せる).
- **UniDic handles colloquial speech.** It returns 凄い, やばい and 食べる,
  so no contraction overlay is needed. It cuts compounds into short pieces,
  and the merge joins them back (日本|語 → 日本語, 乗り|遅れ → 乗り遅れる,
  おばあさん). A join counts only when it holds a content word, so grammar
  runs such as ました stay apart.
- **What remains:**
  - a small alias table for UniDic's classical lemmas (信ずる → 信じる);
  - 走り出そう, which every tokeniser misreads.

How it is used:
- **It runs in a worker on the Mac**, started on first use. The dictionary
  sits in its own optional cache.
- **It is used by two things only:** `token-match` and subtitle coverage
  (§10.3). Lookup (§6) and every other strategy run without it.
- **No tokeniser on the phone.** Short answers to fixed prompts (most of
  Stages 0–1) use `reading-set`, `particle-slot` and `order-graph`, which need
  none.
- **Sudachi is the fallback.** Its `normalized_form` handles spelling
  variants (表記ゆれ) for free. It was not chosen because its browser build
  has one maintainer.

Strategies compose. For example, `translate-en-ja` runs `token-match` first
and falls back to `ai-rubric` only when `token-match` says "unknown structure"
and AI is configured.

**Golden tests.** Each strategy has a table of right, near, accepted and
wrong answers with the expected diagnosis, run in Node. It is the
Japanese equivalent of `cs_diff.mjs`: a new exercise ships only when its
expected answers pass its own validator.

---

## 8. Skill-specific mastery (the data model)

Every item has up to four **facets**: R (reading), W (writing), L (listening)
and S (speaking). Each facet has its own memory state and evidence.

```js
state.japanese = {
  v: 1,
  facets: {           // keyed map, merged per key by the cloud merge
    "w:1358280|R": { s:stability, d:difficulty, due, reps, lapses, last, firstAt },
    "w:1358280|L": { … }, "j:食|W": { … }, "g:te-form|W": { … }, …
  },
  lessons: { "1.3": { pages:{i:ts}, done:{…}, checkAt } },  // evidence, as in Code
  checkpoints: { "U2": { passAt, scores:{R,W,L,S}, paid } },
  mined: { id: { text, reading?, src:{kind,title,at}, items:[…], audioRef?, imgRef? } },
  input: { "YYYY-MM-DD": { readChars, listenMin, rawMin, jpSubMin } }, // tallies, never text
  rates: { … },       // derived cache only; recomputed, never trusted
  settings: { furigana, dailyMin:40, asr:"auto", voice }  // synced; per-device bits in state.ui.japanese
}
```

**Which exercise feeds which facet:**
**Measured: only some words get production facets.** The slice's
scheduler simulation (`sim.mjs`) assumed:
- a learner whose recall follows the model;
- harder production (W and S facets are recalled less reliably than R and L);
- the day's fixed input and output blocks.

At 40 minutes a day:

| Production facets on… | New words a year | Average day | Worst day |
|---|---|---|---|
| every word (R, L, W, S) | ~900 | 38.6 min | 43 min |
| 40% of words | ~1,500 | 39.3 min | 43 min |
| **30% of words (the production set)** | **~1,700** | 39.6 min | 43 min |

So every word gets R and L. W and S go only to a lesson's production set:
the words you will need to say and write, about 30%. The rest stay reading
and listening vocabulary, met again in input. Grammar points get W, and kana
get handwriting.

- R ← word-meaning, kanji-reading, passages, cloze.
- W ← meaning-word typed, conjugation, prompt-write, and kana handwriting
  (kana W is handwriting with stroke checks, KanjiVG; "Type instead" is a
  fallback that counts as a hint).
  Writing a kanji from memory takes 10–15 seconds against 2–3 for a
  recognition rep, so in the core W means **typed** production (choosing the
  right kanji in the IME counts). Kanji are traced once when introduced, with
  stroke diagnosis, and that is not reviewed. `stroke-free` reviews belong to
  the optional **Kanji deep track**, which adds a `j:<char>|H` (handwriting)
  facet only when the track is switched on.
- L ← listen-pick, dictation, minimal pairs, dialogues.
- S ← say-it, shadow, read-aloud, dialogue-turn.

An exercise can feed several facets (a dictation feeds L, and W lightly).

**Skill mastery figures** are derived in one place (`KOS.ja.skills()`,
invariant 26d), never stored. For each skill:
- **Coverage**: frequency-weighted share of the core word list whose facet is
  "stable" (stability > 21 days). This drives the timeline.
- **Kanji known** (R) and **kanji writable** (W).
- **Fluency measures**: reading speed (characters a minute in timed passages),
  listening rate handled (the highest speed-ladder step passed), speaking
  (mora accuracy, mean pitch agreement), writing (production accuracy).
- **Input hours**: from tallies and Focus immersion (§11).

The skill map shows four bars per unit and a radar of R/W/L/S. You can see
where reading runs ahead of listening, which is the usual imbalance.

---

## 9. Spaced repetition

- **One scheduler for every facet** (FSRS-style: stability, difficulty,
  retrievability). It is a pure function, like Code's `schedule()`.
- **Grades are derived** from correctness, hints, time and validator verdict:
  `near` → hard, a first-try answer under the item's time target → easy.
- **Facets unlock in order.** R and L first; W and S once R is stable, so
  you never have to produce a word you cannot yet recognise. Each facet then
  keeps its own schedule. Not every item has every facet: a kanji has R
  (and H only in the deep track); grammar points have R, W and L; a word
  has S only once it appears in a speaking set.
- **Sibling burying.** Two facets of one item never fall on the same day
  unless both are overdue.
- **Load control for 30–45 minutes.** New items a day = f(the forecast
  review minutes over the next 7 days, `dailyMin`). The forecast counts each
  facet once, on its due day. The slice's first version counted backlog
  cumulatively, over-estimated the load and starved new words. The desk says
  "Today ≈ 38 min" and why.
- **Saved lines from your media** (§12) are listening facets (`x:<id>|L`),
  reviewed as clip dictation.
- **Leeches** (8 lapses) are paused and moved to a "Rework" list, which
  offers a mnemonic page and a new example sentence instead of drilling the
  same card.
- **Mined sentences** become cards with their own facets (R by default, plus
  L when they have audio).
- The lesson's plain flashcards still use `srs.js` (study-wide Review). The
  Japanese facets are their own deck, shown in Review as a "Japanese" source.

---

## 10. Checkpoints, progression and the timeline

### 10.1 Checkpoints

- **Unit checkpoint**: about 20 items, five per skill (R/L items, written
  production, a spoken task), plus one **media task** (a panel, a scene or a
  clip from the unit). It passes at 80% per skill. A skill below that gets a
  targeted rework set, and the checkpoint can be retaken freely; pay is once.
- **Stage gate**: a mock-JLPT-style section for R and L at the stage's level,
  a short essay (W, AI-advisory plus a self-rubric) and a 2-minute spoken
  monologue (S, recorded and checked with ASR and the rubric). It works like a
  Code capstone: the reward is paid once and it is never locked.
- Can-do statements are ticked from checkpoint evidence, not by hand.

### 10.2 The media path timeline (the "when could I…" view)

A horizontal path (it reuses the stage-path visual from `codeui.stagePath`)
with milestones. Each milestone has a **requirement profile** and a
**projected date** computed from your measured rates.

| Milestone | Profile (initial estimates; refined by measured coverage) |
|---|---|
| Read all kana fluently | kana R stable, < 1.5 s a character |
| Graded reader Level 1 | 300 words R, kana speed |
| Yotsuba&! with a dictionary | 1,200 words R (85% coverage), 100 kanji |
| Slice-of-life anime, **JP subtitles** | 2,500 words R+L, reading 150 cpm, 50 h listening |
| Shounen manga (furigana) | 4,000 words R (95% coverage) |
| VN with lookup | 4,000 words R, 600 kanji, 150 cpm |
| Easy anime **raw** | 5,000 words L, 250 h listening |
| Light novel | 8,000 words R (97%), 1,200 kanji, 250 cpm |
| J-drama / most anime raw | 8,000 words L, 600 h listening |
| J-pop lyrics by ear | L + poetic register track |

**Projection.**
- **Rates** come from the last 4 weeks: new stable words a week, kanji a
  week, input hours a week and reading-speed trend.
- **ETA** = (requirement − current) / rate, given as a **range** (rate ± one
  standard deviation). It is never one exact date.
- It says what moves the date most, for example "+15 min/day of listening
  brings 'easy anime raw' forward ~4 months".
- With under 2 weeks of data it shows "Calibrating", never a guess.

**Starting estimate from zero**, from the scheduler simulation (stable
reading words; words picked up from immersion and mining come on top, and
the live timeline counts them):

| Point | 30 min a day | 40 min a day | 45 min a day |
|---|---|---|---|
| Kana | 3–4 weeks | 2–3 weeks | 2 weeks |
| ~800 words (N5 level) | ~9 months | ~5 months | ~4 months |
| ~1,200 words (Yotsuba&! with a dictionary) | ~15 months | ~8 months | ~6–7 months |
| ~2,500 words (anime with JP subtitles) | 3+ years | ~20 months | ~16–17 months |
| ~4,000 words (shounen manga, VNs with lookup) | much later | ~3 years | ~2.5 years |
| Comfortable raw anime and LNs | — | 4+ years without extra immersion | 3–4 years |

Simulated new words a year: about 1,000 at 30 minutes, 1,700 at 40 and
2,050 at 45.

**The daily budget is the biggest lever.** The fixed input and output
blocks take about 15 minutes, so a 30-minute day leaves half the room for
reviews and new words that a 40-minute day does. Watching and reading in
Japanese outside the app is the second lever. The timeline names both.

FSI rates Japanese among the hardest languages for English speakers (about
2,200 class hours). The timeline shows this plainly rather than flattering you.

### 10.3 Personal readiness (the strongest feature)

Open a subtitle file (`.srt`, `.vtt`, `.ass`) from a title you own. The
tokeniser splits it **on the device**, and the app computes the following
(built in the slice: `media.js`, `#/media`).

**Coverage.** Running-word coverage, with marks at 90, 95 and 98%.
- Counted: content words only.
- Not counted: particles, auxiliaries, names and numbers.
- A merged compound counts once.
- "Known" means a word whose reading review holds (R stability of 3 days or
  more), plus any words you list yourself.

**New words**, by frequency, with a target pack of the top 30. They become
reviews once the generated dictionary gives them meanings.

**Lines you can already read**, and **i+1 lines**: lines with exactly one
new word, which are the best sentences to mine.

**The player** works line by line:
- loop the line and slow it to 0.75×;
- subtitles shown, hidden, or as dictation;
- furigana only on words you do not know, spelled from the reading
  (学校 → がっこう);
- shadowing with your own recording;
- "Save this line" (§12).

The split runs on the Mac. The resulting word list and coverage are data, so
they can sync to the phone.

Titles in your Collection (anime/books/VN rows with `extra.country === "JP"`
or `extra.olang === "ja"`, `inProgress`/`planned`) show a readiness chip in
the Japanese desk. The Collection itself is only **read** (invariant 27); no
field is added to media rows.

---

## 11. Immersion and mining

- **Immersion is study** when it is in Japanese. Start a Focus session with
  the Japanese subject, choose the mode (raw · JP subtitles · EN subtitles)
  and optionally link a Collection title.
  - Raw and JP-subtitle minutes count as listening and reading input.
  - EN-subtitle minutes are logged but count as **0** listening input, and
    the app says so.
  - Pay follows Focus's block rule (invariant 4a); nothing new is paid.
- **The Collection stays leisure** (invariant 3). Episode progress there pays
  nothing here. The link only labels the Focus session.
- **The Reader** (`#/japanese/reader`): paste or import text, or open a
  shipped passage. It gives furigana by your mastery, tap-to-lookup, mining in
  one action, a timed reading-speed measure, and read-aloud with TTS.
- **Mining** from anywhere: the Reader, a clip line, a pasted VN line
  (works with a texthooker on the clipboard), or a manual card. A mined
  card can carry your screenshot or audio snippet, stored on the device
  only (§12).

---

## 12. Media snippets: audio, images, manga, VN and anime

Four components, all in `js/core/jamedia.js`, all reused by lessons,
exercises and checkpoints.

| Component | What it shows | Shipped content | Personal content |
|---|---|---|---|
| **Panel** (manga) | An image plus **text layers**. Bubble text is real text, so it is selectable, can carry furigana by mastery, and can be looked up and hidden for a "read the bubble" exercise. Includes vertical text (`writing-mode: vertical-rl`). | Original panels: raster art from the cast (§12.1) with live text bubbles on top | Your screenshots, with bubble regions you draw and type (or paste from OCR) |
| **VN scene** | Background, sprite and a text box with typewriter advance, a name plate, voiced lines and a backlog. Clicking a line mines it. | Original scenes from the cast and backgrounds (§12.1) with VOICEVOX voices | Your screenshots plus the line text from a texthooker |
| **Clip** (anime/drama) | A `<video>` with in/out points, subtitles hidden or shown (JP/none), loop line, 0.75× speed, a "what did they say?" dictation and a shadowing overlay. | Short original or CC-licensed clips; official YouTube embeds (IFrame API start/end) for trailers and MVs, as links only, never downloaded | **Your own video and subtitle files**, opened, never copied. "Save this line" cuts only that line out of the playing video (`captureStream` → a few seconds of WebM) into IndexedDB on the device (`kurenai-os-ja-media`; not synced, not backed up). A saved line can join reviews as clip dictation |
| **Song** | An audio/embed player with line-timed **user-supplied** lyrics | Official MV embed only; **no lyrics shipped** (copyright) | Lyrics you paste for your own use, stored locally |

### 12.1 The art: raster under live text, from a reusable cast

**Why not SVG art.** Hand-coded SVG illustration looks like clip-art. The
art is raster (WebP/AVIF at two sizes). SVG/HTML is the layer on top:
panel borders, speech bubbles, live Japanese text, furigana by mastery and
vertical text. The art is generated **with no text and no bubbles**. Image
models write garbled Japanese, and live text is what makes a panel a lesson.

**Style.** The rendering of the Kurenai master art: polished anime
illustration, soft cel shading, clean line work. Kurenai herself does not
appear in lessons. Manga panels are **black and white with screentone**, as
real manga is; VN scenes are in colour.

**The cast: four new characters, chosen by speech register** (役割語), so
that recognising character voices is part of the course:

| Character | Role | Speech they model |
|---|---|---|
| A polite guide (a senpai at school) | Introduces lessons | です/ます, then keigo |
| A classmate | A same-age friend | casual speech, contractions (じゃん, ちゃう) |
| A café owner | Older and warm | polite-relaxed, giving and receiving, set phrases |
| A little sibling or rival | Comic energy | strong casual endings (ぞ, ぜ, わ), sound effects |

Names, looks and personalities are settled when the character sheets are
made.

**Sprites: a fixed body, swapped faces.**
- Each character has **one or two base poses** (standing; one gesture),
  full body, on a flat chroma background.
- The **eight expressions** are neutral, happy, laughing, surprised,
  troubled, annoyed, sad and thinking. Each is made with an edit prompt on
  the base pose ("Keep this exact pose, clothing and framing; only change the
  facial expression to surprised").
- Edits drift slightly (hair strands, line weight). So post-processing keeps
  **only the head region** of each expression: it is aligned to the base pose
  and composited with a feathered mask. The body pixels then never change,
  and a reaction in a dialogue changes the face alone, with no jump.
- The VN scene component stores `{base, face}` per line and cross-fades only
  the face layer.

**Backgrounds.** About 12, reused everywhere: classroom, café, station
platform, convenience store, shrine, bedroom, a street at night, park,
school rooftop, bookshop, kitchen and a summer festival. Each has a day
version and, where useful, an evening one.

**Panels** are composed per lesson from the cast and backgrounds, plus a
few one-off scenes where a lesson needs a specific object. A new Media
moment is mostly a JSON script referencing existing sprites and backgrounds,
not new art.

**The pipeline (manual, no API):**
1. `art-source/ja/manifest.json` lists every asset: id, kind (sheet, base,
   face, background, panel), the prompt, the reference images to attach and
   status.
2. `tools/ja_art_pack.mjs` prints the next batch as a prompt sheet: prompt
   text plus the files to attach (the style anchor, the character sheet, the
   base pose).
3. You generate in the Gemini app and save the results into
   `art-source/ja/inbox/` under the asset id.
4. `tools/ja_art_import.mjs` does the post-processing:
   - checks the size;
   - keys out the chroma background on sprites;
   - aligns and composites the face swaps;
   - crops to the frame;
   - writes WebP/AVIF to `assets/ja/img/`;
   - marks the manifest entry `done`.
5. A local **contact sheet** page shows each batch next to its siblings
   (same character, same background), so drift is caught before anything
   ships. You approve or reject each image, and rejects return to the
   prompt sheet.

The credits page says the art was AI-assisted (Gemini) and is original to
this app. Spending on the API stays an option if the manual pace becomes
the bottleneck.

**Audio integration.**
- Every sentence, word and passage has an audio reference.
- The player is shared: play, 0.75×/1×, a loop, and a waveform with a pitch
  contour.
- Recording uses `MediaRecorder`. Recordings stay on the device and are kept
  only while the exercise is open, unless you keep one for a mined card.

---

## 13. Speech practice

- **Engines** (decision D):
  1. Browser `SpeechRecognition` (lang ja-JP, interim results). Chrome sends
     audio to Google; Safari varies. The settings say which.
  2. Whisper (`transformers.js`, WebGPU with a WASM fallback) in a module
     worker. It is an optional download (small or base model) offered like
     the C# runtime, cache-first in its own cache.
- **Recognisers fix mistakes.** Whisper (and the browser engine) is
  trained to output likely real Japanese. A learner who says おばさん for
  おばあさん, or drops a っ, can get the correct word back, and the mistake
  disappears. Whisper also hallucinates on very short clips (for example
  "ご視聴ありがとうございました"). So:
  - recognition is used **only on sentence-level tasks** (`say-it`,
    `shadow`, `read-aloud`, `dialogue-turn`), never on single words or mora
    contrasts;
  - **minimal pairs and single words** are checked **acoustically on the
    device**: segment duration and energy for long vowels, the silence gap
    for っ, and the F0 contour for pitch, each measured against the
    reference recording's own segment ratios;
  - Whisper gets a kana-biased prompt, and a transcript that matches a known
    hallucination or is much longer than the audio is discarded.
- **Spike S, interim (`prototypes/japanese-space/SPIKE-S.md`).** The spike
  page has 40 scripted items, 20 of them deliberate mistakes. Before your
  recordings, it ran on 120 clips of macOS's Kyoko voice at three speeds.
  Whisper base ran on WebGPU, at a median 292 ms per clip.

  | Engine | Task | Correct line accepted | Mistake caught |
  |---|---|---|---|
  | Whisper | sentences | 77% | 80% |
  | Whisper | single words | 47% | 93% |
  | Acoustic check | word pairs | 73% (the rest: "say it again") | **100%** |

  - **Every mistake Whisper missed was a length error it "fixed"**
    (ちょと → ちょっと, ありがとご → ありがとう), at all three speeds.
  - **On single words Whisper heard other words** (聞いて for きって, ね for
    いえ).
  - **The acoustic check made 60 confident calls, all right.**
  - **Long vowels need your pace.** いえ and いいえ are all voice, so they
    cannot be told apart by proportion. One ありがとうございます at the start
    of a session calibrates your mora length.
  - **Generation is capped at 64 tokens**, and a plausibility filter drops
    hallucination loops; one clip produced a loop of nonsense.
- **What is decided:**
  - words and sound contrasts use the acoustic check;
  - sentences use recognition plus the acoustic length check on っ and long
    vowels.

  **What waits for your 40 recordings:** the browser recogniser (it only
  listens to a live microphone) and Whisper base against small on your
  voice. Those choose the default recogniser. If neither is reliable for an
  exercise, it falls back to "record, compare, self-mark" (labelled
  self-marked, paying nothing).
- **Checks:**
  - transcript → kana → `mora-align` against the target, with any accepted
    alternatives;
  - pitch overlay (advisory);
  - a timing check (a mora rhythm bar) for shadowing.
- **Dialogue turns:** a character says a line (a VN-scene style). You
  answer by speech. The transcript is validated with `token-match` (the
  required items) and optionally `ai-rubric` (natural?).

---

## 14. User interface

**Place in the app.** A fifth subject in `KOS.subjects` (`exam:false`,
`hue: var(--ja)`), with its own desk like Code's.

**Routes:** `#/japanese/<page>[/<id>]`:
- `desk`, `path` (the media timeline), `skills`, `review`, `reader`,
  `kana`, `kanji/<char>`, `checkpoint/<unit>`, `media` (your snippets),
  `settings`;
- lessons use the shared topic page through `KOS.jaTopic`, as Code uses
  `KOS.codeTopic`.

**The desk (frame 28a)**:
- Today's session: ≈ minutes and four blocks (Reviews · New · Input · Output)
  with one Start.
- The path strip, showing the next milestone and its ETA.
- An R/W/L/S skill radar.
- Collection readiness chips.
- Continue reading or the current clip.
- A streak and input hours this week.

**Visual direction:**
- **Graphite tokens throughout.** The subject hue is 朱 shu for the desk
  accent, the path and the radar. Pass/fail stay green/alarm (invariant 26a).
- **Japanese typography, used for meaning:**
  - **Noto Sans JP** (or Zen Kaku Gothic New) for Japanese body text in
    exercises and readers.
  - **Klee One** (textbook-style handwriting) as the **model glyph** for
    kana and kanji writing. Learners should copy textbook forms, not Mincho
    serifs.
  - **Shippori Mincho** (already loaded) for display: the lesson hero's key
    word or kanji, and the stage titles' kanji.
  - Every Japanese run is `lang="ja"`, so glyphs render as Japanese, not as
    Chinese variants.
- **Content is Japanese; navigation is English.** Rail, tabs, buttons and
  headers are English ("Reviews", "Reader", "Path"). Japanese appears where it
  carries meaning: the item being studied, a stage's emblem kanji
  (仮 Kana, 基 Foundations, 橋 Bridge, 中 Intermediate, 上 Upper, 達 Advanced)
  with its English name always beside it, and the rail's kanji tile (語),
  which matches the existing tile style.
- **Motifs, kept quiet:**
  - genkō-yōshi (manuscript grid) as the writing canvas;
  - vertical text in the reader option and the manga panels;
  - a thin hanko-style seal on passed checkpoints;
  - the path drawn like a stepping-stone garden path (飛び石).
  - Not used: cherry-blossom wallpaper, decorative kanji, fake Japanese labels.
- **Every theme.** The `--ja` role is restated in each of the 25 theme blocks
  (smoke-checked, like `--code`).
- **Phone.** Kana, reviews, listening, the reader and speaking work fully.
  Free writing of kanji works by touch. The design frames come from a
  Claude Design prompt (prompt 12 in `design-prompts.md`), as for Code.

---

## 15. Architecture (files, mirroring Code)

| Piece | File | Contract |
|---|---|---|
| Registry | `js/core/subjects.js` | add `{id:"ja", name:"Japanese", hue:"var(--ja)", exam:false}` |
| Spine and lesson DSL | `js/data/ja.js` (`KOS_DATA.ja`, `KOS_JA.lesson/add`) | authored, like `code.js` |
| Generated dictionary | `js/data/ja-dict.js`, `assets/ja/*` | from `tools/gen_ja.mjs`; never hand-edited |
| Content | `js/data/content/ja-u*.js` | one file per released unit |
| Model | `js/core/ja.js` (`KOS.ja`) | state gate, facets, evidence, `award`, `planDay`, `skills`, `timeline` |
| Scheduler | `js/core/jasrs.js` | FSRS-style, pure |
| Validation | `js/core/javalid.js`, `js/core/jaconj.js` | pure, Node-testable |
| Exercises | `js/core/jaex.js` (`KOS.jaEx`) | the renderers |
| Media and audio | `js/core/jamedia.js`, `js/core/jaaudio.js` (player, recorder, pitch, acoustic checks), `js/labs/ja-asr-worker.js` | |
| Tokeniser and lookup | `js/labs/ja-token-worker.js` (Lindera + UniDic and the JMdict merge; Mac only), `js/core/jalookup.js` (deinflection and longest match, main thread, every device) | |
| Your media | `js/modules/jamedia.js` (subtitles, coverage, the line player, saved lines; from the slice's `media.js`) | files opened, never copied; saved lines in IndexedDB only |
| Art | `art-source/ja/` (manifest, inbox, sheets; tracked except the inbox), `tools/ja_art_pack.mjs`, `tools/ja_art_import.mjs`, `assets/ja/img/` | manual generation, scripted import |
| Pages | `js/modules/japanese.js` (desk/path/skills/reader/settings), `js/modules/jatopic.js`, `js/modules/jacheck.js` | |
| Styles | `css/views/japanese.css`, `--ja` in `tokens.css` and `themes.css` | |

**Integration touchpoints** (each a small, known edit, as Code made):
- `sessions.js` streaks: add `ja`.
- `governor.js`: type `ja` → `KOS.ja.award`.
- `report.js`: `f.ja` gives reviews, new items, input hours and checkpoints,
  zero facts absent (invariant 77).
- `aitools.js`: read tools `ja_overview`, `ja_lesson`, `ja_skills`, with no
  write tool (evidence is earned).
- `router.js`: the `japanese` route.
- `cloudmerge.js`: `state.japanese` keyed maps.
- `search.js`: lessons and items.
- `sw.js`: the audio pack and ASR model caches.

---

## 16. The vertical slice (`prototypes/japanese-space/`), the next step after review

A throwaway, standalone prototype, in the same style as
`prototypes/code-space/`: plain HTML, CSS and JS, Graphite tokens copied in,
localStorage. It is served by `tools/dev_server.py`. Its job is to **prove the
risky parts**, not to look finished.

**Scope:**
1. **Stage 0 hiragana, あ to さ rows (15 kana).** Recognition, typed recall
   (romaji input converted), handwriting with KanjiVG and stroke diagnosis,
   and listening pick.
2. **One Stage 1 lesson**: "これ・それ・あれ + です / は". Notes pages, 8
   sentences with VOICEVOX audio, and a graded mini-passage with
   mastery-driven furigana.
3. **The engine with about 10 exercise kinds** across A–E: `word-meaning`,
   `meaning-word`, `particle-pick`, `build-sentence`, `conjugate` (using a
   preview of the verb engine with ~20 verbs), `translate-en-ja`,
   `dictation`, `minimal-pair`, `shadow`, `say-it`.
4. **`javalid.js` with every strategy in §7** except `ai-rubric` (stubbed),
   plus a Node golden-test runner (`validate.mjs`).
5. **Facet model and FSRS scheduler**, with a simulated 60-day run to check
   that the load stays within 40 minutes a day.
6. **Media**: one manga panel (raster art with a live bubble layer and
   vertical text), one VN scene (voiced, with a face swap mid-dialogue), and
   the personal clip importer (your local video plus `.srt` → pick a line →
   loop/dictation).
7. **The art pipeline, end to end, on a small set**: two characters (a
   sheet, one base pose and four expressions each), three backgrounds and
   two panels, generated by you in the Gemini app from the prompt sheet and
   brought in by the import script and contact sheet.
8. **Speech Spike S**: both ASR engines behind one interface, with a
   measurement page that includes the deliberate-mistake set, plus the
   acoustic checks for long vowels and っ.
9. **Tokeniser Spike T**: IPADIC against UniDic on 200 real lines, in a
   worker.
10. **Readiness**: subtitle-file coverage ("you know X% of this episode") and a
   timeline built from simulated rates.

**Where it stands (17 October 2026):**

| Criterion | Status |
|---|---|
| Golden tests 100% | ✓ 128 of 128 (`validate.mjs`) |
| Conjugation engine correct on its set | ✓ every class and godan ending, the 行く/ある/する/来る exceptions, with diagnoses |
| Stroke diagnosis catches order and direction | ✓ on synthesised strokes for all 15 kana; the 20 real traced samples are still yours to do |
| ASR spike numbers and a default | half: synthetic-voice baseline done; your 40 recordings pending |
| Acoustic check tells おばさん/おばあさん, きて/きって | ✓ on synthetic and Kyoko audio; your voice pending |
| Face swaps show no body shift | pending: your drafts are in the inbox; import next |
| Tokeniser chosen, memory and load time | ✓ Lindera + UniDic, 576 MB heap, 0.6 s from cache |
| Clip importer works on one of your files | ✓ on an original test episode; one of your files pending |
| Coverage for one real episode | ✓ pipeline; a real subtitle file of yours pending |
| Desk at 1440 and 390 | ✓ no sideways scroll; desk, session, media and spike pages checked |

**Success criteria:**
- golden tests 100%;
- the conjugation engine is correct on its test set;
- stroke diagnosis catches order and direction errors on 20 traced
  samples;
- ASR spike numbers recorded (false acceptance first) and a default chosen;
- the acoustic check tells おばさん from おばあさん and きて from きって on
  your recordings;
- face swaps show no visible body shift when toggled;
- the tokeniser chosen, with its memory and load time recorded;
- the clip importer works on one of your files;
- a coverage figure for one real episode's subtitles;
- the desk renders at 1440 and 390 with no dead space.

---

## 17. Releases and gates (after the slice)

1. **Platform release**:
   - registry, hue, routes, desk, model, scheduler, validators, engine,
     audio player;
   - **Stage 0 (Kana)** complete;
   - Licences page;
   - smokes 80–83.
2. **Stage 1, one unit per release** (about 6 units), each with its
   checkpoint, audio pack and Media moments.
3. **Reader, mining and personal media** (the clip importer, subtitle
   coverage, panel import).
4. **Speech** at the chosen engine, with dialogue turns.
5. **Stage 2** units, then the timeline is recalibrated on your real data.
6. Then tracks and Stages 3–5, input-heavy with fewer authored lessons.

Each release passes the full smoke gate, the validator golden tests and a
responsive audit, and bumps `sw.js` `VERSION` (CLAUDE.md deploy rules).

## 18. Tests

| Test | What it holds |
|---|---|
| smoke80 | registry: five subjects, `--ja` in tokens and every theme, routes, the spine in the picker, `lang="ja"` on Japanese runs |
| smoke81 | pay-once, review cap, immersion only through Focus, derived grades, a render writes nothing |
| smoke82 | content depth contract per lesson; every exercise's expected answers pass its own validator; audio refs resolve |
| smoke83 | the scheduler (determinism, facet unlock, sibling burying, load forecast) and the timeline (calibrating state, ranges, no NaN) |
| Node tools | `tools/ja_valid_check.mjs` (golden tests), `tools/gen_ja.mjs --check` (the dictionary is reproducible) |

## 19. Invariants this would add (draft, numbered 111+)

- 111: the Japanese subject registry, hue and exam status.
- 112: facets are per item × skill; their grades are derived and never
  self-reported.
- 113: validators are pure, each verdict is one of four, and the AI grade is
  advisory.
- 114: personal media never leaves the device.
- 115: pay once; immersion only through Focus; the Collection stays leisure.
- 116: the timeline is a derived projection, shown as a range, never stored
  as a promise.
- 117: generated dictionary data and attribution.

## 20. Risks

| Risk | Mitigation |
|---|---|
| Content volume is huge | Release unit by unit. Stages 3+ lean on input and mining rather than authored lessons. |
| ASR is poor on beginner speech, or hides mistakes | ASR on sentences only; acoustic checks for sound contrasts; Spike S measures false acceptance; the self-mark fallback. |
| Tokeniser memory and quality | Lindera + UniDic chosen by Spike T; worker only, Mac only, used by two features; the phone uses deinflection lookup. |
| A 30-minute day slows everything | The desk shows the timeline at the current budget and what 10 more minutes would change; input outside the app counts. |
| Large optional downloads (Whisper ~200 MB, tokeniser ~50 MB) | Each is offered, never fetched unasked, and kept in its own cache like the C# runtime. |
| Review load from handwriting | Kanji handwriting only in the opt-in deep track (decision J). |
| Art pace and consistency (manual generation) | A reusable cast and backgrounds; face swaps on fixed poses; the contact sheet; the API remains an option. |
| Licence missteps | Every source is verified at the slice; Licences page; no copyrighted media shipped. |
| TTS-only ear | Native Tatoeba audio and your own clips from Stage 1. |
| Reading outpaces listening | Separate facets, plus the timeline's "what moves the date" pushing listening. |
| Scope creep into a Duolingo-like game | Input is never cut from the day; rewards stay small and pay once. |

---

## Next step

1. **The art.** Your Gemini drafts are in `art-source/ja/inbox/`. Review them
   on the contact sheet, then build the import (chroma key, face swaps,
   WebP), the manga panel and the VN scene.
2. **Your part:**
   - record the 40 speech-spike lines;
   - open one real subtitle file (and its video) on `#/media`;
   - trace the 15 kana a few times.
3. **Then** decide the default recogniser and close the slice against the
   criteria above, before integration.
