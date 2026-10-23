---
name: user-made-assets
description: The user makes images in the Gemini app and voice in VOICEVOX/ElevenLabs on request — ask for assets instead of drawing SVG stand-ins
metadata:
  type: feedback
---

The user said (2026-10-23) they can create assets with Gemini, and wants that remembered generally (Japanese now, Creatives later). They also run VOICEVOX and ElevenLabs for audio.

**Why:** hand-drawn SVG art looks like clip-art; real raster art is the plan (docs/japanese-plan.md §12.1), made by hand in the Gemini app (no API spend, no automation).
**How to apply:** when a feature needs an image or audio, add it to the relevant manifest (Japanese: art-source/ja/manifest.json, prompt sheet prototypes/japanese-space/art.html) with full prompt + attachments, tell the user what to make, and keep building around it. No text in generated images. See CLAUDE.md "Assets the user makes". Related: [[japanese-study-space]].
