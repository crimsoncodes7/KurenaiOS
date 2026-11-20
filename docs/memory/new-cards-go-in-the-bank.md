---
name: new-cards-go-in-the-bank
description: "A new flashcard on a leaf that has a bank block goes at the END of the bank block with a fixed key (100+), never appended to the shipped deck"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 5836de0b-1c44-45f8-aa3d-83dc2da7b461
  modified: 2026-11-20T01:42:24.992Z
---

On 20 Nov 2026 nine new Maths cards appended to the shipped decks of 4.3, 6.1 and 6.2 shifted the positional keys of those leaves' bank cards (`bank-maths-pure-b.js`, `X("maths:…")`). One key collided and smoke67 B caught it; the other shifts were silent.

A shipped card's key is `sid:ref:<position>` unless its third element pins it (a number = position, a string with ":" = whole key; `KOS.srs.shippedKey`). The bank cards come after the shipped deck, so adding to the deck moves them.

**Why:** invariant 87. A moved key gives a learner's schedule to a different card.

QUIZ ITEMS have the same trap. A quiz item's key is `q:sid:ref:<place>` unless it carries `qk` (`KOS.questions.keyOf`). Bank quiz items are concatenated after the shipped quiz, so appending to the shipped quiz moves their history and FSRS schedule (invariant 111c). Six were appended on 20 Nov and fixed in `306d269`. Exam items are safe: bank exam items pin their place (`oi`).

**How to apply:**
- Before adding cards or quiz items to a leaf, grep the bank files for `X("<ref>"`.
- If the leaf has a bank block, add them at the end of that block:
  - cards with fixed numeric keys from 100 (a third element);
  - quiz items with `qk: "100"` and up.
- Run smoke67, smoke155 and `node tools/gen_moved_cards.mjs --check`.
- Then compare every key against the commit before, by booting both and listing the keys with their question text.

Related: [[maths-notes-depth-rewrite]], [[bash-mangles-backslash-semicolon]].
