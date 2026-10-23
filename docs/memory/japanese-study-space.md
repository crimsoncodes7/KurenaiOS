---
name: japanese-study-space
description: "Japanese study space (roadmap 5.5), plan rev 3.2; PLATFORM RELEASED 2026-10-22 (d061169, sw kos-japanese-1): backend, pages, Stage 0 kana lessons; next Stage 1 units"
metadata:
  node_type: memory
  type: project
  originSessionId: f8374df6-dc96-4ee0-a99a-7f4ee584945d
  modified: 2026-10-17T20:36:01.116Z
---

Japanese is the planned fifth subject (roadmap 5.5, asked 2026-10-17), built like Code ([[code-study-space]]). Plan: `docs/japanese-plan.md` revision 3.2; Claude Design prompt 12 (frames 28a–28p).

User: absolute zero in Japanese (cannot read kana, had never heard it), ~30–45 min/day. Goal: anime/J-drama/J-pop/manga/LN/VN without English.

Decisions the user made:
- Art: manual generation in the Gemini app only (NO API spend, NO automation of Gemini). Base poses + expressions as face swaps.
- Style anchor: Kurenai master art, but Kurenai NOT in lessons; new cast (akari, yota so far).
- Media: ship only licensed/original assets; the user's own clips stay on-device.

Slice state (branch claude/roadmap-code-study-space, not pushed; last commit bc75349, a voice bake-off of VOICEVOX, ElevenLabs and Gemini TTS after the 03505a9 close): all §16 criteria have evidence. Art all imported (art_import.py; panels trimmed), VN scene (vn.js), manga panels with live vertical balloons + "Fill the bubbles" (manga.js), "Your part" hub (results.html: speech/trace/media + one Download, import from another browser).

Measured on the user's real data (results file in ~/Downloads, not committed):
- Speech (decision D decided): browser recogniser (Chrome) = intelligibility check (sentences 10/10 ok, 3/10 mistakes passed: っ/long vowel/voicing; words 6/10, 0/10). Whisper base and the acoustic check FAILED on a beginner voice → acoustic is advisory length bar only; っ/long vowels/voicing trained by listening + self-marked shadowing.
- Handwriting: all 8 performed mistakes caught (7 right reason after the reversed-order fix).
- Real episode Frieren S1E17: 2.9% known after lesson 1.1; splitter bugs fixed (names, bogus joins, double count).

Gotchas: the app's service worker on localhost:8123 serves prototype files stale — reload twice after edits. Safari cannot cut clips (no captureStream) and Web Speech differs → user tests in Chrome. The user can't read kana: any speaking task needs ▶ Hear + a romaji guide.

**Why:** the user reviews plans first, then a throwaway slice, then integration.
**State 2026-10-22:** feat/japanese has the backend (6655440) and the pages from design turn 28 + Stage 0's 16 lessons (d5591f5; smoke80/82; gate 98/98). RELEASED 2026-10-22 as d061169 (sw kos-japanese-1, https://6a6bcfa7.kurenai-os.pages.dev); main fast-forwarded. Lesson leaves need non-empty `content` in KOS_DATA.ja or hub's BYREF skips them. Left: reader/media/immersion (28h/28i/28l), Stage 1 units one per release, baked audio packs.
**How to apply:** the plan §17 platform release (registry, hue, routes, desk, model, scheduler, validators, engine, audio, Stage 0 kana, smokes 80–83) — only when the user asks.

Voices (plan §4.4, rev 3.2, blind bake-off 2026-10-22): ElevenLabs for the cast's dialogue (voices DESIGNED on the website: "KOS Akari 2", "KOS Yota 2" (v2 prompts, approved 2026-10-22; account voice cap means old designs get deleted); the free plan's API refuses library voices and API voice design; Voice Design refuses prompts describing a minor → describe young adults), VOICEVOX for model audio (accent-correct, editable), Gemini TTS dropped — the user said never pick it. Bake-off tools: prototypes/japanese-space/voice/ (bake.mjs, design.mjs, keys in git-ignored voice/.env.local, never print them).

Integration started 2026-10-22 on branch feat/japanese (from main): BACKEND committed 6655440 — KOS.ja, KOS.jaSrs (on KOS.fsrs), jaKana/jaConj/jaValid/jaStroke, js/data/ja.js (Stage 0 spine, 16 lessons), js/data/ja-strokes.js (KanjiVG, generated), --ja token per theme (provisional), invariants 112–118, smoke81 + smoke83. Subject stays hidden until KOS_DATA.ja + pages. Next: pages from design turn 28 (user said Claude Design still working), Stage 0 lesson content (mnemonics/notes), smoke80 + smoke82. Pay: reviews +1 XP/facet cap 30/day, one ledger entry per session; lesson 15/2/+3; checkpoint 60/15/+5; gate 150/40/+10.



Review fixes 2026-10-22 (ee1a746, sw kos-japanese-2): the user wants NO Japanese rail item (a Study subject), subject pills grouped (A-levels alone on their pages; Code + Japanese together; one switch pill), ONE nav (no second tab bar), the core path inside the desk hero like Code, aligned rows everywhere.

Stage 1 started 2026-10-23 on branch feat/japanese-s1: unit F1 "First conversations" (lessons 1.1–1.6, js/data/ja-s1.js + js/data/content/ja-f1.js, 8-page contract, VN scenes + manga panels via KOS.jaUI.scene/panel, Makoto the café owner added to the cast). Syllabus F1–F6 in docs/japanese-plan.md §3.1. F1 is NOT released until the user's Makoto art (manifest batch 6) and panels (batch 7) arrive; smoke82 AWAITED_ART lists what is missing. Audio not baked yet (VOICEVOX must be open).
Audio (2026-10-23, user's choice): ElevenLabs for the cast's dialogue (KOS Akari 2, KOS Yota 2; Makoto's voice to be designed by the user on the website from design.mjs's prompt, then its voice_id goes in voices.json), VOICEVOX No.7 アナウンス for the narrator (words, examples, kana). tools/bake_ja_audio.mjs bakes into assets/ja/audio + js/data/ja-audio.js; it sends kanji text first and falls back to the reading when VOICEVOX misreads (はち was read ワチ in kana).
