# Spike S — speech checking (interim, 17 October 2026)

Plan: `docs/japanese-plan.md` §13 and decision D. Page: `speech.html` (40 scripted items, 20 of
them deliberate mistakes). This note covers what was measured **without your voice**. The
decision waits for your recordings and the browser recogniser, which can only listen to a live
microphone.

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

## Interim conclusion (to confirm with your recordings)

1. **Single words and sound contrasts** use the acoustic check only. If it is unsure, it asks
   you to say the word again; it never marks you down on a guess.
2. **Sentences** use speech recognition, plus an acoustic length check whenever the target
   contains っ or a long vowel. Without that check, the recogniser's "fixes" would pass the
   mistake.
3. **Default engine:** not decided. Still to measure:
   - the browser recogniser on your live voice (same script);
   - Whisper base against small on your voice.

## Validator fix found by the spike

The checker treated a transcript's ー as different from the kana long vowel, so コーコー failed
against こうこう. It now treats them as the same sound; golden tests cover this.

## To finish the spike

1. Open `speech.html`. Calibrate, then Download and load Whisper (base).
2. Record all 40 lines. A deliberate mistake is labelled; say exactly what it shows.
3. Press "Copy results (JSON)" and paste them back to Claude.
