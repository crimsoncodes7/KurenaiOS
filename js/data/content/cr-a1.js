/* Kurenai OS — data/content/cr-a1.js (AUTHORED)
   Creatives · Art, Unit 1: Lines and confidence. Three lessons (A1.1–A1.3).
   The block types are cr-w1.js's (KOS.crTopic); a step list's `art` names its pictures
   (cr.step.<lesson>.<n>) and a beginner block's `art` its page, from art-source/creatives. */
(function () {
  "use strict";
  var C = window.KOS_CONTENT = window.KOS_CONTENT || {};

  C["creatives:A1.1"] = {
    pages: [
      { t: "A line you mean", blocks: [
        { p: "Drawing starts with lines you can put where you want, in one go." },
        { list: ["Scratchy lines (lots of short strokes) look unsure.", "One stroke looks confident, even when it wobbles.", "Speed helps: a slow line shakes."] },
        { callout: { t: "This lesson's skill", body: "A straight line drawn in one confident stroke." } }
      ] },
      { t: "Step by step", blocks: [
        { steps: ["Two dots for the line's start and end", "Ghost the motion above the paper", "Draw it from the shoulder in one stroke", "A page of lines in every direction"], art: "A1.1" },
        { callout: { t: "From the shoulder", body: "Lock your wrist and move your whole arm. The wrist makes arcs; the shoulder makes straight lines." } }
      ] },
      { t: "What goes wrong", blocks: [
        { pair: { before: "A line built from five short, hairy strokes.", after: "One stroke, a little wobbly, landing near its dot.", why: "One honest stroke trains your hand; patching a line trains nothing." } },
        { list: ["Drawing too slowly: speed up a little.", "Looking at the pencil: look at the end dot.", "Fixing a bad line: leave it and draw the next one."] }
      ] },
      { t: "Expected beginner output", blocks: [
        { beginner: { text: "A page of about twenty ghosted lines between dot pairs.\nMost are straight; a few wobble at the end, two overshoot and one is drawn twice.", note: "Not neat, and that's fine: nearly every line is one stroke. A pass for this unit.", art: "A1.1" } }
      ] },
      { t: "Quick reference", blocks: [
        { list: ["Two dots, then ghost.", "Draw from the shoulder.", "One stroke, a little fast.", "Eyes on the end dot.", "Never patch a line."] }
      ] }
    ],
    flashcards: [
      ["What is ghosting a line?", "Rehearsing the motion just above the paper before drawing it."],
      ["Which joint makes straight lines?", "The shoulder: the whole arm moves, the wrist stays locked."],
      ["Where should your eyes be while drawing a line?", "On the end point, not the pencil tip."],
      ["Why not fix a wobbly line by going over it?", "Patching trains nothing; one honest stroke trains your hand."],
      ["Why draw a little faster?", "A slow line shakes; speed makes it smoother."]
    ]
  };

  C["creatives:A1.2"] = {
    pages: [
      { t: "Round, in one go", blocks: [
        { p: "Ellipses are everywhere: cups, wheels, eyes, the tops of cylinders." },
        { list: ["An ellipse is a circle seen at an angle.", "Thin ellipses are seen nearly edge-on; round ones nearly face-on.", "Going round two or three times is normal, not cheating."] },
        { callout: { t: "This lesson's skill", body: "A smooth ellipse drawn round in one go." } }
      ] },
      { t: "Step by step", blocks: [
        { steps: ["A flat rectangle for the ellipse to sit in", "Ghost the round motion inside it", "Go round two or three times in one go", "A column of ellipses, thin to round"], art: "A1.2" },
        { callout: { t: "The short axis", body: "A line through the narrow middle of an ellipse is its short axis. Later, on a cylinder, it points along the cylinder's length." } }
      ] },
      { t: "What goes wrong", blocks: [
        { pair: { before: "An ellipse with a pointed end, like a lemon.", after: "Round ends, touching the middle of each side of its box.", why: "An ellipse never has corners: its ends stay round however thin it gets." } },
        { list: ["Stopping halfway: keep going round.", "Drawing from the wrist: use the shoulder.", "One lap only: two or three find the shape."] }
      ] },
      { t: "Expected beginner output", blocks: [
        { beginner: { text: "A column of eight ellipses from thin to round.\nSeveral are lopsided, one has a pointed end, most are traced round two or three times.", note: "The shapes are uneven, but most are smooth loops: a pass for this unit.", art: "A1.2" } }
      ] },
      { t: "Quick reference", blocks: [
        { list: ["A box first.", "Ghost the loop.", "Two or three laps.", "Round ends, never points.", "Thin to round in a column."] }
      ] }
    ],
    flashcards: [
      ["What is an ellipse?", "A circle seen at an angle."],
      ["Is going round an ellipse two or three times allowed?", "Yes: it helps you find a smooth shape."],
      ["What shape do an ellipse's ends have?", "Round: an ellipse never has points."],
      ["What is the short axis?", "A line through the ellipse's narrow middle."],
      ["What does a very thin ellipse mean?", "The circle is seen nearly edge-on."]
    ]
  };

  C["creatives:A1.3"] = {
    pages: [
      { t: "Curves with a direction", blocks: [
        { p: "Curves give drawings life: the bend of a back, a hill, a strand of hair." },
        { list: ["A C curve bends one way.", "An S curve bends one way, then the other.", "Three dots plan a curve: start, bend, end."] },
        { callout: { t: "This lesson's skill", body: "A curve drawn smoothly through its points." } }
      ] },
      { t: "Step by step", blocks: [
        { steps: ["Three dots for the start, the bend and the end", "Ghost the curve through the dots", "One smooth C curve", "S curves: the bend changes side"], art: "A1.3" }
      ] },
      { t: "What goes wrong", blocks: [
        { pair: { before: "A curve that goes flat in the middle where the hand slowed.", after: "One even sweep through all three dots.", why: "Keeping the speed steady keeps the curve round." } },
        { list: ["Stopping at the middle dot: draw through it.", "Bending at the wrist: the shoulder again.", "Too many dots: three is enough."] }
      ] },
      { t: "Expected beginner output", blocks: [
        { beginner: { text: "A page of C and S curves through dots.\nMost are smooth; a few have a flat spot or a kink, one is gone over twice.", note: "Some kinks, but most curves flow in one movement: a pass for this unit.", art: "A1.3" } }
      ] },
      { t: "Quick reference", blocks: [
        { list: ["Three dots: start, bend, end.", "Ghost it.", "One steady sweep.", "S: the bend swaps side.", "Draw through the middle dot."] }
      ] }
    ],
    flashcards: [
      ["How many dots plan a simple curve?", "Three: the start, the bend and the end."],
      ["What is the difference between a C and an S curve?", "A C bends one way; an S bends one way, then the other."],
      ["Why does a curve go flat in the middle?", "The hand slowed down; keep the speed steady."],
      ["Should you stop at the middle dot?", "No: draw through it in one movement."]
    ]
  };
})();
