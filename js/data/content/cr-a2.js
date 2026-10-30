/* Kurenai OS — data/content/cr-a2.js (AUTHORED)
   Creatives · Art, Unit 2: Boxes and forms. Three lessons (A2.1–A2.3). The block types are
   cr-w1.js's; step and beginner pictures come from art-source/creatives (see cr-a1.js). */
(function () {
  "use strict";
  var C = window.KOS_CONTENT = window.KOS_CONTENT || {};

  C["creatives:A2.1"] = {
    pages: [
      { t: "Thinking in boxes", blocks: [
        { p: "Almost anything can start as a box: a phone, a house, a head, a chest." },
        { list: ["A box has three sets of parallel edges.", "From one corner you usually see three faces at most.", "Drawing through means drawing the hidden edges too, lightly."] },
        { callout: { t: "This lesson's skill", body: "A box with its hidden edges drawn through." } }
      ] },
      { t: "Step by step", blocks: [
        { steps: ["The nearest corner as a Y", "The top face's far edges", "The side edges down", "The hidden edges, drawn through"], art: "A2.1" },
        { callout: { t: "Why draw through?", body: "The hidden edges show whether the box really works. If the back corner misses, you see it straight away." } }
      ] },
      { t: "What goes wrong", blocks: [
        { pair: { before: "A box whose far edges spread apart, so it looks bent.", after: "Matching edges kept parallel (or gently converging).", why: "Edges that spread make the far end look bigger, which never happens." } },
        { list: ["Skipping the hidden edges.", "Hidden edges as dark as the front ones.", "Starting with the outline instead of the near corner."] }
      ] },
      { t: "Expected beginner output", blocks: [
        { beginner: { text: "Three boxes drawn through on one page.\nTheir back edges meet a little off, one looks slightly bent, the hidden lines are too dark.", note: "Rough, but every box reads as solid and is drawn through: a pass for this unit.", art: "A2.1" } }
      ] },
      { t: "Quick reference", blocks: [
        { list: ["Start with the near corner's Y.", "Parallel edges stay parallel.", "Draw the hidden edges, lightly.", "Check the back corner meets."] }
      ] }
    ],
    flashcards: [
      ["How many sets of parallel edges does a box have?", "Three."],
      ["What does drawing through mean?", "Drawing the hidden edges too, lightly."],
      ["Why draw the hidden edges?", "They show whether the box really works: a missed back corner shows straight away."],
      ["Where do you start a box?", "At the nearest corner, as a Y of three edges."],
      ["Why does a box look bent?", "Its far edges spread apart instead of staying parallel."]
    ]
  };

  C["creatives:A2.2"] = {
    pages: [
      { t: "The same box, turning", blocks: [
        { p: "Being able to turn a box in your head is how you later turn a head or a car." },
        { list: ["Face on, you see mostly one face.", "As it turns, a side face opens up.", "From above, the top face grows."] },
        { callout: { t: "This lesson's skill", body: "The same box turned to new angles." } }
      ] },
      { t: "Step by step", blocks: [
        { steps: ["A box seen straight from the front", "The same box turned a little", "Turned further, both sides showing", "Seen from above"], art: "A2.2" }
      ] },
      { t: "What goes wrong", blocks: [
        { pair: { before: "Each turn drawn as a different-sized box.", after: "One box kept the same size while it turns.", why: "If the size changes, it reads as a new box, not a turn." } },
        { list: ["The top face growing too tall.", "Boxes tipping forward.", "Forgetting the hidden edges."] }
      ] },
      { t: "Expected beginner output", blocks: [
        { beginner: { text: "A row of five boxes turning step by step.\nThe turn reads, but the third box's top is too tall and the last tips forward.", note: "Uneven, but you can see one box turning: a pass for this unit.", art: "A2.2" } }
      ] },
      { t: "Quick reference", blocks: [
        { list: ["Same size every turn.", "A side face opens as it turns.", "From above, the top grows.", "Draw through every time."] }
      ] }
    ],
    flashcards: [
      ["Why practise turning a box?", "It's how you later turn heads, cars and anything solid."],
      ["What happens to the side face as a box turns towards you?", "It opens up and gets wider."],
      ["What makes a turned box look like a new box?", "Changing its size between drawings."],
      ["What grows when you see a box from above?", "Its top face."]
    ]
  };

  C["creatives:A2.3"] = {
    pages: [
      { t: "Cylinders live in boxes", blocks: [
        { p: "A cup, a can, an arm, a tree trunk: cylinders are everywhere, and a box keeps them honest." },
        { list: ["Draw a light box first.", "Its top and bottom faces hold the two ellipses.", "Two straight side lines touch both ellipses."] },
        { callout: { t: "This lesson's skill", body: "A cylinder built inside a box." } }
      ] },
      { t: "Step by step", blocks: [
        { steps: ["A tall box as the guide", "An ellipse in the top and bottom faces", "The two side lines, touching both ellipses", "The back of the base drawn through"], art: "A2.3" },
        { callout: { t: "The lower ellipse", body: "When you look down on a cylinder, the bottom ellipse is a little rounder than the top one, never flatter." } }
      ] },
      { t: "What goes wrong", blocks: [
        { pair: { before: "A flat bottom ellipse that makes the can look cut off.", after: "A bottom ellipse slightly rounder than the top.", why: "The bottom is further below your eye, so you see more of it." } },
        { list: ["Side lines that miss the ellipses.", "A cylinder that leans out of its box.", "No box at all."] }
      ] },
      { t: "Expected beginner output", blocks: [
        { beginner: { text: "Four cylinders in their guide boxes.\nThe bottom ellipses are a bit flat, one cylinder leans, the side lines slightly miss.", note: "Each one clearly comes from its box: a pass for this unit.", art: "A2.3" } }
      ] },
      { t: "Quick reference", blocks: [
        { list: ["A light box first.", "Ellipses in the top and bottom faces.", "Side lines touch both.", "The bottom ellipse is rounder."] }
      ] }
    ],
    flashcards: [
      ["Where do a cylinder's ellipses go?", "In the top and bottom faces of a guide box."],
      ["Looking down on a cylinder, which ellipse is rounder?", "The bottom one."],
      ["What do the side lines of a cylinder touch?", "The outer edges of both ellipses."],
      ["Why draw a box before a cylinder?", "It keeps the cylinder upright and the ellipses matched."]
    ]
  };
})();
