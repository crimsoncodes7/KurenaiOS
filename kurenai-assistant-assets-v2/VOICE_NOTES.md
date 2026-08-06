# Kurenai Voice — V1 Direction

## Recommended initial approach

Use Gemini TTS as the first implementation path. Keep the provider/model configurable.

Suggested direction:

> Young-adult feminine voice, calm, intelligent, measured, and quietly confident. Restrained warmth, precise articulation, subtle dry wit. Not bubbly, childish, or overly dramatic.

## Behaviour

- Voice should be opt-in and muted by default.
- A play/speaker button per assistant response is a good V1 interaction.
- Do not auto-read long tool outputs.
- Consequential confirmations may be read aloud only when voice mode is enabled.
- Stop or cancel playback cleanly when the next response begins.

## Later options

A more bespoke provider such as ElevenLabs can be considered later if a stronger signature voice is desired.
