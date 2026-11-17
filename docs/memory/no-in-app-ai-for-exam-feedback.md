---
name: no-in-app-ai-for-exam-feedback
description: "Exam-attempt feedback must NOT come from Kurenai's in-app model; record and measure on device, export a prompt + pack for Claude/Gemini web, import the structured reply back"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 04c027ef-86ba-4c56-80ec-65e818f91578
  modified: 2026-11-17T19:33:38.498Z
---

17 November 2026, on the exam-recording idea: "I don't want Kurenai to do
this. Responses are too unreliable, often rate limits, its a … google flash
model so its practically too incompetent to give real feedback."

**Why:** the user has Pro subscriptions to Claude and Gemini and wants top
models to analyse their work, not the app's metered Flash route.

**How to apply:** for exam/paper review, the app records (event journal),
computes deterministic diagnostics, and builds a copyable context prompt +
downloadable pack; the user pastes the model's reply back as a fenced JSON
block that the app validates and stores as feedback and targets. Never add
an in-app "ask Kurenai to review my attempt" call. Plan:
`docs/exams-rework-plan.md` §8. Related: [[december-mocks-2026]].
