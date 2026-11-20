---
name: new-cards-go-in-the-bank
description: "A new flashcard on a leaf that has a bank block goes at the END of the bank block with a fixed key (100+), never appended to the shipped deck"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 5836de0b-1c44-45f8-aa3d-83dc2da7b461
  modified: 2026-11-20T01:04:22.750Z
---

On 20 Nov 2026 nine new Maths cards appended to the shipped decks of 4.3, 6.1 and 6.2 shifted the positional keys of those leaves' bank cards (`bank-maths-pure-b.js`, `X("maths:…")`). One key collided and smoke67 B caught it; the other shifts were silent.

A shipped card's key is `sid:ref:<position>` unless its third element pins it (a number = position, a string with ":" = whole key; `KOS.srs.shippedKey`). The bank cards come after the shipped deck, so adding to the deck moves them.

**Why:** invariant 87. A moved key gives a learner's schedule to a different card.

**How to apply:**
- Before adding cards to a leaf, grep the bank files for `X("<ref>"`.
- If the leaf has a bank block, add the cards at the end of that block with fixed numeric keys from 100.
- Run smoke67, smoke155 and `node tools/gen_moved_cards.mjs --check`.

Related: [[maths-notes-depth-rewrite]], [[bash-mangles-backslash-semicolon]].
