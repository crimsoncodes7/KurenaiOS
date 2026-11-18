---
name: test-every-aspect-before-release
description: "New rule (2026-11-18): every new feature is rigorously tested in every aspect (UI, UX, print, every tier/board/subject, edit/clear paths) before a release; audit before building"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 04c027ef-86ba-4c56-80ec-65e818f91578
  modified: 2026-11-18T16:48:10.026Z
---

Every new feature must be rigorously tested and looked at in every aspect before a release: each surface in the browser at desktop and iPad sizes, printing (real PDF output, A4 every page), every tier (mock, real exam, topic test, retrieval test, deadline), every board and subject (AQA CS, Edexcel Maths, OCR IT), the user's own uploaded files as well as the app's authored papers, and the edit / clear / undo paths, not just the happy path. Audit what exists before building more on it.

**Why:** on 2026-11-18 the user found the Exams & Papers rework (kos-exams-2/3) full of problems after release: printed pages not A4 and inconsistent sizes, their own past-paper files not treated like the authored papers, a broken settings layout ("Extra time" squeezed into a column), "0 marks" calibration wording, Grade a free-text box instead of a dropdown, no IT paper in Match your files, a needless detour to the Library, an unclear "set its page", no way to clear or fully edit attempts. "The whole point of this audit and implementation phase was to get rid of all these problems, we can't just be stacking more on."

**How to apply:** before calling any feature done, drive it in the headless browser across sizes and data, print to PDF and check page sizes, try the user's own files, try every tier/subject, try editing and deleting what it creates; write the findings down and fix them before release. Related: [[run-tests-yourself]], [[no-dead-space-layout]], [[design-handoff-not-1to1]].
