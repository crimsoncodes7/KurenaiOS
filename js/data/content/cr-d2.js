/* Kurenai OS — data/content/cr-d2.js (AUTHORED)
   Creatives · Graphic design, Unit 2: Typography. Three lessons (D2.1–D2.3).
   The block types are cr-w1.js's (KOS.crTopic). Every example is original to KurenaiOS. */
(function () {
  "use strict";
  var C = window.KOS_CONTENT = window.KOS_CONTENT || {};

  C["creatives:D2.1"] = {
    pages: [
      { t: "Letters have parts", blocks: [
        { p: "A few words for the parts of letters make type easier to talk about." },
        { list: ["Baseline: the line letters sit on.", "x-height: how tall a lower-case x is.", "Serif: the small foot at the end of a stroke (a sans-serif has none).", "Ascender and descender: the parts that rise above (h, k) or drop below (g, y)."] },
        { callout: { t: "This lesson's skill", body: "Even-looking spaces between letters." } }
      ] },
      { t: "Kerning is about area", blocks: [
        { p: "Kerning adjusts the space between two particular letters. The goal is even AREA between letters, not equal distance." },
        { list: ["Round letters (O, C) need to sit a little closer to look even.", "Straight letters (H, I) need a little more room.", "Diagonals (A, V, W, Y) and overhangs (T, F) leave holes: pull them in."] },
        { pair: { before: "W A V E  with every gap the same width.", after: "WAVE with A pulled under the W and V.", why: "The diagonals left big triangles of space; closing them makes it look even." } }
      ] },
      { t: "Kerning by eye", blocks: [
        { steps: ["Look at the word at a large size.", "Find the biggest hole and the tightest squeeze.", "Fix the worst pair first, then look again.", "Turn it upside down: you see the spaces, not the letters."] },
        { callout: { t: "Tracking is different", body: "Tracking changes the spacing of a whole word or line at once. Kerning is one pair at a time." } }
      ] },
      { t: "Expected beginner output", blocks: [
        { beginner: { text: "\"TOKYO\" at 72 pt. The T and O pulled closer, the Y and O a little closer.\nThe K and Y still slightly too far apart.", note: "Not perfect: one gap is still loose. But no pair jumps out as a hole or a collision: a pass for this unit." } }
      ] },
      { t: "Quick reference", blocks: [
        { list: ["Even area, not equal distance.", "Round letters closer, straight letters further.", "Fix A, V, W, Y, T pairs first.", "Upside down to see spaces.", "Kerning = one pair; tracking = all."] }
      ] }
    ],
    flashcards: [
      ["What is kerning?", "Adjusting the space between one particular pair of letters."],
      ["What is the goal of kerning?", "Even-looking area between letters, not equal distances."],
      ["Which letter shapes usually need pulling closer?", "Diagonals and overhangs: A, V, W, Y, T, F."],
      ["What is tracking?", "Changing the spacing of a whole word or line at once."],
      ["What is the x-height?", "The height of a lower-case x."],
      ["Why turn a word upside down when kerning?", "You stop reading it and see the spaces instead."]
    ]
  };

  C["creatives:D2.2"] = {
    pages: [
      { t: "One leads, one reads", blocks: [
        { p: "Most designs need only two typefaces: one with personality for headings, one calm face for reading." },
        { list: ["A display face sets the mood: spooky, friendly, technical.", "A text face disappears so the words can be read.", "Two loud faces shout over each other."] },
        { callout: { t: "This lesson's skill", body: "Two faces with different jobs." } }
      ] },
      { t: "What makes a pair work", blocks: [
        { list: ["Contrast: a serif with a sans, or a display face with a plain one.", "A shared feel: both warm, both crisp, both old-fashioned.", "One family in two weights also works, and is the safest choice."] },
        { pair: { before: "A handwritten heading with a handwritten body.", after: "A handwritten heading with a clean sans body.", why: "The heading keeps its charm; the body becomes easy to read." } }
      ] },
      { t: "Match the brief", blocks: [
        { steps: ["Read the brief and pick three mood words (\"calm\", \"old\", \"playful\").", "Choose the heading face for those words.", "Choose the plainest body face that doesn't fight it.", "Read the body text at its real size."] },
        { callout: { t: "Interfaces are different", body: "Screens and apps usually use one sturdy sans for everything, with weight and size doing the work." } }
      ] },
      { t: "Expected beginner output", blocks: [
        { beginner: { text: "A recipe card: \"Grandma's Melon Bread\" in a soft handwritten face.\nThe ingredients and steps in a plain sans at a small size.\nThe heading is a little too big for the card.", note: "The heading is oversized, but one face clearly leads and the other is easy to read: a pass for this unit." } }
      ] },
      { t: "Quick reference", blocks: [
        { list: ["Two faces: one leads, one reads.", "Contrast in style, a shared feel.", "One family, two weights is safe.", "Never two loud faces.", "Interfaces: one sans."] }
      ] }
    ],
    flashcards: [
      ["How many typefaces does most design need?", "Two: one for headings, one for reading."],
      ["What is a display face for?", "Setting the mood in headings and titles."],
      ["What makes two faces pair well?", "Contrast in style with a shared feel."],
      ["What is the safest pairing?", "One family in two weights."],
      ["What usually goes wrong with two decorative faces?", "They shout over each other."]
    ]
  };

  C["creatives:D2.3"] = {
    pages: [
      { t: "Comfortable reading", blocks: [
        { p: "Long text is comfortable when the lines are the right length and the right distance apart." },
        { list: ["The measure: characters a line. Aim for about 45–75.", "Leading: the space between lines. Aim for about 1.4–1.6 times the text size.", "Too long a line: the eye loses its place going back. Too short: it jumps constantly."] },
        { callout: { t: "This lesson's skill", body: "A line length and line spacing that are easy to read." } }
      ] },
      { t: "They depend on each other", blocks: [
        { list: ["Longer lines need a little more leading, so the eye finds the next line.", "Short lines can sit a little tighter.", "Headings are short, so they want tighter leading than body text."] },
        { pair: { before: "A paragraph 110 characters wide with lines nearly touching.", after: "The same paragraph 65 characters wide with leading at 1.5.", why: "The eye now travels a comfortable distance and finds each new line easily." } }
      ] },
      { t: "Setting a page", blocks: [
        { steps: ["Choose the body size first (on screen, about 16 px).", "Set the text box width until lines hold 45–75 characters.", "Set leading around 1.5 and read a paragraph.", "Adjust once, then stop."] }
      ] },
      { t: "Expected beginner output", blocks: [
        { beginner: { text: "A page of a short story with wide margins.\nLines of about 70 characters, leading a little loose at 1.7.\nParagraphs separated by both an indent and a gap.", note: "The leading is a bit loose and the paragraph breaks are doubled up. But the page is easy to read to the end: a pass for this unit." } }
      ] },
      { t: "Quick reference", blocks: [
        { list: ["Measure: 45–75 characters.", "Leading: about 1.4–1.6.", "Longer lines, more leading.", "Headings tighter.", "Read a whole paragraph to judge."] }
      ] }
    ],
    flashcards: [
      ["What is the measure?", "The number of characters in a line of text."],
      ["What is a comfortable measure for body text?", "About 45–75 characters a line."],
      ["What is leading?", "The space between lines of text."],
      ["What is a comfortable leading for body text?", "About 1.4–1.6 times the text size."],
      ["Do longer lines need more or less leading?", "More, so the eye finds the next line."]
    ]
  };
})();
