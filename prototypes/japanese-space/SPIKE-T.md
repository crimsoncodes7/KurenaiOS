# Spike T: the tokeniser (17 October 2026)

Plan: `docs/japanese-plan.md` §7.2 ("The tokeniser"). This spike chose what splits Japanese
text into dictionary words for two features:
- `token-match`, which checks free written answers;
- subtitle coverage (§10.3).

Lookup (§6) does not depend on it.

## What was compared

Four tokenisers:
- **kuromoji 0.1.2**, the classic, with the IPADIC dictionary.
- **Lindera 2.1.0 with IPADIC**: MIT, WebAssembly, dictionary built in.
- **Lindera 2.1.0 with UniDic**: the same, with UniDic built in.
- **Sudachi** (`sudachi-wasm333` 1.0.4, core dictionary).

The tokenisers were run on 137 original lines (`spike-t/lines.js`, written for the spike) in 11
registers:
- textbook;
- casual contractions;
- slang endings;
- character speech;
- manga sound effects;
- light-novel/VN narration;
- drama;
- J-pop;
- loanwords;
- harder grammar.

Each line names the dictionary forms that lookup and coverage need (271 in all). Each tokeniser
was run on its own and then with the **JMdict merge** (`spike-t/merge.js`). The merge joins
adjacent pieces when the joined form is a JMdict headword (JMdict 2026-10-12, 465,845
headwords).

Run it: `node prototypes/japanese-space/spike-t/run.mjs <node_modules> --merge <headwords.txt>`

## Results

| Tokeniser | Recall alone | With the JMdict merge | Download (compressed) | Memory | Lines a second |
|---|---|---|---|---|---|
| kuromoji (IPADIC) | 93.0% | 94.5% | 17 MB of dictionary files | ~400 MB in Node | ~22,000 |
| Lindera + IPADIC | 93.0% | 94.5% | 16 MB | ~130 MB in Node | ~23,000 |
| **Lindera + UniDic** | 93.7% | **98.9%** (268 / 271) | 50 MB | ~470 MB in Node; **576 MB WebAssembly heap in the browser** | ~16,500 |
| Sudachi (core) | 93.7% | 98.5% | 40 MB | ~250 MB in Node | ~21,000 |

**IPADIC breaks colloquial speech.**
- It splits すげえ into the made-up verbs すげる and える; やべえ, うめえ and ほんと fail the same way.
- It returns potential forms as their own words (倒せる, 眠れる), which a dictionary lookup will
  not find.
- The merge cannot repair either problem. A contraction overlay could patch the first, but not
  the second.

**UniDic and Sudachi understand colloquial speech** (すげえ → 凄い/すごい, やべえ → やばい,
食べちゃった → 食べる). Alone, their misses are compounds cut into short pieces: 日本|語,
放課|後, お|疲れ|様, 乗り|遅れ. The merge fixes almost all of these, and also joins idioms such as
目を覚ます.

**UniDic's last three misses:**
- 信じる and 存じる: UniDic files these under their classical lemmas 信ずる and 存ずる, which
  needs a small alias table.
- 走り出そう, which every tokeniser misreads.

**In the browser:** the worker (`ja-token-worker.js`, `tokens.html`) is ready in 0.6 s from cache.
It splits a 15-line subtitle file in 7 ms and returns its word list on this device.

## Decision (proposed)

1. **Mac: Lindera + UniDic with the JMdict merge, in a worker** (plan §7.2). It has the best
   recall on the speech the media path is about, and an MIT licence.
   - Integrate it on **lindera-wasm v6**, which loads dictionaries at run time. 2.x is
     deprecated.
   - Re-measure memory on v6.
   - Add the classical-lemma alias table.
2. **Phone: no tokeniser.** A 576 MB heap is too much for a phone browser tab.
   - Lookup uses the deinflection rules and longest match, as planned.
   - Short written answers use the strategies that need no tokeniser.
   - Subtitle coverage is a Mac feature. Its result (the word list and coverage) syncs as data.
3. **Sudachi is the fallback.** Its recall is close, and its `normalized_form` handles spelling
   variants (表記ゆれ) for free. It is not chosen because the browser package has a single
   maintainer and a 40 MB dictionary.
4. **No contraction overlay.** UniDic already handles the contractions the outside review
   worried about.
5. **The merge counts only joins with a kanji or katakana character.** This keeps grammar
   joins such as ました and のに out of coverage.

## Caveats

- **Who wrote the test:** the test lines and their expected words were written by the same
  person, Claude. Real subtitles are the better test. Load a subtitle file from something you
  own into `tokens.html`; it stays on this device.
- **Memory figures:** these are Node RSS and a WebAssembly heap size. Browsers report memory
  differently.
- **Service worker:** during the spike, the app's service worker on `localhost:8123` also caches
  the 54 MB wasm file. In the app, the file gets its own optional cache, like the C# runtime.

## Licences

- Lindera: MIT.
- UniDic: BSD, LGPL or GPL, at your choice.
- JMdict: EDRDG, CC BY-SA 4.0 — the ShareAlike boundary in plan §4.3.

Vendored copies are in `vendor/`, for the slice only and never deployed.
