/* Kurenai OS — data/content/cr-a3.js (AUTHORED)
   Creatives · Art, Unit 3: Perspective. Three lessons (A3.1–A3.3). The block types are
   cr-w1.js's; step and beginner pictures come from art-source/creatives (see cr-a1.js). */
(function () {
  "use strict";
  var C = window.KOS_CONTENT = window.KOS_CONTENT || {};

  C["creatives:A3.1"] = {
    pages: [
      { t: "Lines that meet", blocks: [
        { p: "Rails, roads and corridors seem to meet far away. Perspective draws that." },
        { list: ["The horizon is your eye level.", "A vanishing point sits on the horizon.", "In one-point perspective, every depth line runs to that one point."] },
        { callout: { t: "This lesson's skill", body: "Boxes whose depth lines meet at one point." } }
      ] },
      { t: "Step by step", blocks: [
        { steps: ["A horizon line and one vanishing point", "A rectangle facing you", "Lines from its corners to the point", "The back edge cut: a box"], art: "A3.1" },
        { callout: { t: "Above or below", body: "A box below the horizon shows its top; above, its underside. Left of the point you see its right side." } }
      ] },
      { t: "What goes wrong", blocks: [
        { pair: { before: "Depth lines drawn by eye, each going its own way.", after: "Every depth line ruled to the same point.", why: "One stray line makes the whole box twist." } },
        { list: ["A back face that isn't parallel to the front.", "A vanishing point off the horizon.", "Boxes that run too deep."] }
      ] },
      { t: "Expected beginner output", blocks: [
        { beginner: { text: "A horizon with one point and four boxes around it.\nMost edges aim at the point, but two miss slightly and one back face isn't quite parallel.", note: "Each box clearly recedes to the point: a pass for this unit.", art: "A3.1" } }
      ] },
      { t: "Quick reference", blocks: [
        { list: ["The horizon is eye level.", "One point on it.", "Depth lines to the point.", "Front and back faces parallel."] }
      ] }
    ],
    flashcards: [
      ["What is the horizon line?", "Your eye level."],
      ["Where does a vanishing point sit?", "On the horizon."],
      ["In one-point perspective, where do depth lines go?", "All to the one vanishing point."],
      ["Which face of a box below the horizon can you see?", "Its top."],
      ["What stays parallel in one-point perspective?", "The front and back faces facing you."]
    ]
  };

  C["creatives:A3.2"] = {
    pages: [
      { t: "Two points, one corner", blocks: [
        { p: "When a box's corner faces you, each side runs to its own vanishing point." },
        { list: ["Two points on the horizon, far apart.", "The nearest vertical edge comes first.", "Left edges run to one point, right edges to the other."] },
        { callout: { t: "This lesson's skill", body: "A box between two vanishing points." } }
      ] },
      { t: "Step by step", blocks: [
        { steps: ["A horizon with two points far apart", "The nearest vertical edge", "Lines from its ends to both points", "The back verticals: a box"], art: "A3.2" },
        { callout: { t: "Keep the points apart", body: "Points too close together stretch the box like a fish-eye lens. Put them near the edges of the page, or off it." } }
      ] },
      { t: "What goes wrong", blocks: [
        { pair: { before: "Two points a hand's width apart: a stretched, pointy box.", after: "Points near the page edges: a calm, natural box.", why: "Close points exaggerate perspective." } },
        { list: ["Leaning vertical edges.", "Right edges sent to the left point.", "Guide lines left heavy."] }
      ] },
      { t: "Expected beginner output", blocks: [
        { beginner: { text: "Boxes in two-point perspective on one horizon.\nOne looks stretched, one back vertical leans slightly, the guides are left heavy.", note: "The edges clearly aim at the two points: a pass for this unit.", art: "A3.2" } }
      ] },
      { t: "Quick reference", blocks: [
        { list: ["Two points, far apart.", "The nearest edge first.", "Each side to its own point.", "Verticals stay upright."] }
      ] }
    ],
    flashcards: [
      ["When do you use two-point perspective?", "When a box's corner faces you."],
      ["What happens if the two points are too close?", "The box stretches and looks distorted."],
      ["What do you draw first in two-point perspective?", "The nearest vertical edge."],
      ["Do vertical edges converge in two-point perspective?", "No: they stay upright."]
    ]
  };

  C["creatives:A3.3"] = {
    pages: [
      { t: "One point, a whole street", blocks: [
        { p: "Once one box works, a street is just many boxes sharing the same point." },
        { list: ["The road's edges run to the point.", "Buildings stand on the road's edges.", "Windows follow the same lines."] },
        { callout: { t: "This lesson's skill", body: "Many boxes sharing one vanishing point." } }
      ] },
      { t: "Step by step", blocks: [
        { steps: ["A horizon and one vanishing point", "The road's two edges to the point", "Boxes along the road as buildings", "Windows that follow the lines"], art: "A3.3" }
      ] },
      { t: "What goes wrong", blocks: [
        { pair: { before: "Windows drawn level, ignoring the perspective.", after: "Window tops and bottoms ruled to the point.", why: "Level windows on a receding wall flatten the building." } },
        { list: ["Buildings floating above the road.", "A roof line aimed above the horizon's point.", "Every building the same size."] }
      ] },
      { t: "Expected beginner output", blocks: [
        { beginner: { text: "A one-point street of simple box buildings.\nIt reads as a street, but a few windows drift off their lines and one roof aims too high.", note: "The street clearly goes away from you: a pass for this unit.", art: "A3.3" } }
      ] },
      { t: "Quick reference", blocks: [
        { list: ["Road edges to the point.", "Buildings stand on the road.", "Smaller as they go back.", "Windows follow the lines."] }
      ] }
    ],
    flashcards: [
      ["In a one-point street, where do the road's edges go?", "To the vanishing point."],
      ["What should windows on a receding wall follow?", "Lines to the vanishing point."],
      ["Why do buildings get smaller down the street?", "They are further away."],
      ["Where should buildings stand?", "On the road's edges, not floating above them."]
    ]
  };
})();
