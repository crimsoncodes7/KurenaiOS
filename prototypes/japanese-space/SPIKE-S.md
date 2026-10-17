# Spike S — speech checking (17 October 2026)

Plan: `docs/japanese-plan.md` §13 and decision D. Page: `speech.html` (40 scripted items, 20 of
them deliberate mistakes). The first half measured a synthetic voice; **the second half is your
40 recordings** (Chrome on this Mac, one session) and decides the default.

## What was run

- **Synthetic baseline:** every scripted line spoken by macOS's Kyoko voice at three speeds
  (`say -r 130`, default, `-r 230`) — 120 clips (`ttscheck.js`, `tts-test/`). A clean synthetic
  voice is an *optimistic* stand-in for a learner.
- **Whisper:** base (`onnx-community/whisper-base`), transformers.js 4.3.0, WebGPU on this Mac.
  Download about 200 MB; cached afterwards.
- **Acoustic check:** `jaacoustic.js` with your pace calibrated from one ありがとうございます.

## Results

| Engine | Task | Correct line accepted | Deliberate mistake caught |
|---|---|---|---|
| Whisper base | sentences | 23 / 30 (77%) | 24 / 30 (80%) |
| Whisper base | single words | 14 / 30 (47%) | 28 / 30 (93%) |
| Acoustic | word pairs | 22 / 30 (73%; the rest “unsure, say it again”) | **30 / 30 (100%)** |

Every confident acoustic call was right (60 of 60). Whisper's median time was 292 ms a clip.

**Whisper hides length mistakes.** It turned ちょとまってください into ちょっと待ってください, and
ありがとございます into ありがとうございます, at all three speeds. It also turned かこ into かっこ.
These are exactly the dropped っ and long-vowel mistakes a learner makes, as the outside review
predicted. It did catch particle and voicing mistakes (これを本です, それはベンです).

**Whisper is unusable on single words.** It gave 聞いて for きって, ね for いえ and いいね for
いいえ. On one clip it fell into a hallucination loop (お前のお前の…). The plausibility filter
dropped it, and generation is now capped at 64 tokens.

## Your recordings (Chrome, 17 October 2026)

One speaker, an absolute beginner copying ▶ Hear, a laptop microphone. You said a few items came out
wrong by accident, so a handful of "correct" items may not be; the pattern is still clear.
Whisper was not loaded for the first seven sentences. "Accepted" means any of the engine's
alternatives matched (the browser offers up to three).

| Engine | Task | Correct line accepted | Deliberate mistake accepted (lower is better) |
|---|---|---|---|
| Browser (Chrome → Google) | sentences | **10 / 10** (top guess alone: 6) | 3 / 10 — ちょと, ありがとご, なんですが |
| Browser | single words | 6 / 10 | **0 / 10** |
| Whisper base | sentences | 0 / 3 (アレワー殴り, かっこく合います) | 1 / 10 (near) |
| Whisper base | single words | 3 / 10 | 1 / 10 |
| Acoustic check, as recorded | word pairs | 3 / 10 | heard the short form almost every time |
| Acoustic check, pace from s10 | word pairs | 3 / 10 confident | 2 / 10; 12 / 20 right overall |

**Why the acoustic check failed on the day:** the calibration recording was silent (every sample 0
— the microphone had not started), which gave a pace of 0.30 s a beat instead of about 0.13. Every
word then looked half as long as it was. `speech.js` now rejects a silent or implausible
calibration. **But it fails even with the right pace:** re-run with the pace taken from your s10
(the same phrase, 0.126 s a beat), it is barely better than a coin. Real speech is not the
synthetic model: voiced consonants (b) read as unvoiced bursts, final vowels fade, a beginner's
held vowel is not twice a short one, and っ is a 0–20% gap rather than a clean silence.

**Whisper base is unusable on a beginner's voice**, not only on single words.

**The browser recogniser is the only engine that works**, and it still "fixes" the same three
kinds of mistake every recogniser does: a dropped っ (ちょと → ちょっと), a dropped long vowel
(ありがとご → ありがとう) and voicing (が for か). On single words it rarely accepts the wrong word
but often hears nothing useful (か, 曲, アーク).

## Decision

1. **Sentences** (`say-it`, `shadow`, `read-aloud`, `dialogue-turn`): **the browser recogniser,
   matched against all its alternatives**. It is an *intelligibility* check — "a listener would
   understand this" — and is labelled that way. Chrome sends the audio to Google; the speaking
   settings say so and the feature is opt-in. Safari's recogniser and the phone are untested.
2. **っ, long vowels and voicing are not judged from your speech by any engine.** They are trained
   where a verdict is reliable: listening minimal pairs (the L facet, a pick) and dictation, plus
   shadowing with your recording beside the model's, played back to back and self-marked.
3. **Single words:** the browser recogniser as a lenient check — accepted when an alternative
   matches, otherwise "say it again", never marked wrong.
4. **The acoustic analysis becomes advisory:** a length bar of your word against the model, drawn
   for the self-check. It is not a verdict.
5. **Whisper is dropped as a default.** It may be retried later at small or large-v3-turbo; not a
   release blocker.

## Validator fix found by the spike

The checker treated a transcript's ー as different from the kana long vowel, so コーコー failed
against こうこう. It now treats them as the same sound; golden tests cover this.

## Data

The results file (`ja-slice-results-2026-10-17.json`, with the recordings) stays on your Mac and is
not committed. Re-analysis scripts read it directly.
