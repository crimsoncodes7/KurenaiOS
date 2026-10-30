/* Kurenai OS — data/content/cr-d1.js (AUTHORED)
   Creatives · Graphic design, Unit 1: The principles. Three lessons (D1.1–D1.3).
   The block types are cr-w1.js's (KOS.crTopic). Every example is original to KurenaiOS. */
(function () {
  "use strict";
  var C = window.KOS_CONTENT = window.KOS_CONTENT || {};

  C["creatives:D1.1"] = {
    pages: [
      { t: "Where does the eye go first?", blocks: [
        { p: "Every layout is read in an order. Hierarchy is deciding that order on purpose." },
        { list: ["The eye goes first to what is biggest, boldest or most different.", "Then to what is next biggest.", "If everything is the same, nothing is first and the reader gives up."] },
        { callout: { t: "This lesson's skill", body: "One thing reads first, then the next, in the order you meant." } }
      ] },
      { t: "Contrast makes the order", blocks: [
        { p: "Contrast is difference. Four kinds do most of the work:" },
        { list: ["Size: big against small.", "Weight: bold against regular.", "Colour: dark against light, bright against quiet.", "Space: one thing alone against things in a group."] },
        { callout: { t: "Make it obvious", body: "A difference that is only a little different looks like a mistake. Make a step clearly bigger, or don't make it." } }
      ] },
      { t: "Three sizes are enough", blocks: [
        { steps: ["Rank the words: what must be read first, second, third?", "Give rank 1 the biggest size, rank 2 a middle size, everything else one small size.", "Squint at it. The squint test shows what reads first."] },
        { pair: { before: "Title, date, place and details all at 18 pt.", after: "Title 48 pt bold · date and place 24 pt · details 14 pt.", why: "Three clear steps: the eye knows where to start and where to go next." } }
      ] },
      { t: "Expected beginner output", blocks: [
        { beginner: { text: "A white poster. \"ART CLUB OPEN DAY\" huge at the top in black.\n\"Wednesday 3:30 · Room B12\" medium under it.\nThe two lines of detail small at the bottom, a bit squashed against the edge.", note: "Plain, the bottom is cramped, and the fonts are the default. But the title reads first and the when and where second: a pass for this unit." } }
      ] },
      { t: "Quick reference", blocks: [
        { list: ["Decide the reading order first.", "Contrast = size, weight, colour, space.", "Three sizes or fewer.", "Make differences obvious.", "Squint to check."] }
      ] }
    ],
    flashcards: [
      ["What is visual hierarchy?", "The order in which a layout is read, decided on purpose."],
      ["Name four kinds of contrast.", "Size, weight, colour and space."],
      ["Why is a slight size difference risky?", "It looks like a mistake rather than a choice: make steps clearly different."],
      ["How many text sizes does a simple poster need?", "Usually three or fewer."],
      ["What is the squint test?", "Blur your eyes at the layout: whatever still stands out is what reads first."]
    ]
  };

  C["creatives:D1.2"] = {
    pages: [
      { t: "Invisible lines", blocks: [
        { p: "Good layouts feel calm because things share edges. The lines are invisible but the eye sees them." },
        { list: ["Alignment: things start on the same edge.", "Fewer edges = calmer.", "Centred text is fine for a title; long text reads better aligned left."] },
        { callout: { t: "This lesson's skill", body: "Edges line up, and related things sit together." } }
      ] },
      { t: "Proximity: close means related", blocks: [
        { p: "Readers group things that are close together. Use space to say what belongs with what." },
        { pair: { before: "Name, job, phone, email, address, website, all evenly spaced.", after: "Name and job together · a gap · phone, email and website together · a gap · the address.", why: "The gaps now carry meaning: who you are, how to reach you, where you are." } },
        { callout: { t: "Space between groups > space inside groups", body: "If those two are the same, the groups disappear." } }
      ] },
      { t: "A grid makes it easy", blocks: [
        { steps: ["Turn on a column grid (12 columns works for most things).", "Start and end every block on a column line.", "Line up as many left edges as you can."] },
        { ex: { label: "Why 12 columns", text: "Twelve divides into halves, thirds, quarters and sixths, so most layouts fit it.", note: "You'll study grids in depth in Design 3." } }
      ] },
      { t: "Expected beginner output", blocks: [
        { beginner: { text: "A business card. Name and job at the top left.\nA big gap, then phone, email and website stacked on the same left edge.\nThe address at the bottom, also on that edge, a little too close to the website.", note: "One gap is too small and it is very plain. But there is one strong left edge and three clear groups: a pass for this unit." } }
      ] },
      { t: "Quick reference", blocks: [
        { list: ["Share edges; fewer is calmer.", "Close = related.", "Gap between groups > gap inside them.", "Use a 12-column grid.", "Long text: align left."] }
      ] }
    ],
    flashcards: [
      ["What does alignment do for a layout?", "It makes things share edges, which looks calm and deliberate."],
      ["What is proximity?", "Putting related things close together so they read as a group."],
      ["Which gap should be bigger: between groups or inside a group?", "Between groups."],
      ["Why are 12-column grids common?", "Twelve divides into halves, thirds, quarters and sixths."],
      ["How should long text usually be aligned?", "Left aligned."]
    ]
  };

  C["creatives:D1.3"] = {
    pages: [
      { t: "Fewer colours, used again", blocks: [
        { p: "Most good designs use two or three colours and repeat them." },
        { list: ["A background, a text colour and one accent is enough.", "Repetition (a colour, a shape, a style) makes separate pieces look like a set.", "The accent is for the one thing you want pressed or noticed."] },
        { callout: { t: "This lesson's skill", body: "A small set of colours with enough contrast, repeated." } }
      ] },
      { t: "Contrast you can measure", blocks: [
        { p: "Readable text needs enough difference in lightness from its background. It can be measured as a ratio:" },
        { list: ["Body text: at least 4.5 : 1.", "Large text and buttons: at least 3 : 1.", "Two colours of the same lightness fail, however different their hues."] },
        { pair: { before: "Red text on a green background of the same lightness.", after: "Dark text on a light background, a bright accent for the button.", why: "Hue alone isn't contrast: lightness does the work." } }
      ] },
      { t: "Building a palette", blocks: [
        { steps: ["Pick the background's lightness first: very light or very dark.", "Make the text the opposite.", "Choose an accent hue and adjust its lightness until it passes 3 : 1."] }
      ] },
      { t: "Expected beginner output", blocks: [
        { beginner: { text: "Three square tiles. Each has a pale cream background, dark brown text and an orange circle in a corner.\nThe orange circle repeats on all three; the text sizes differ a bit between tiles.", note: "Slightly inconsistent, and the colours are safe. But the text is easy to read and the repeated circle makes them a set: a pass for this unit." } }
      ] },
      { t: "Quick reference", blocks: [
        { list: ["Background, text, one accent.", "Text 4.5 : 1, large text and buttons 3 : 1.", "Lightness makes contrast, not hue.", "Repeat a colour or shape across a set."] }
      ] }
    ],
    flashcards: [
      ["What contrast ratio does body text need?", "At least 4.5 : 1."],
      ["What contrast ratio do large text and buttons need?", "At least 3 : 1."],
      ["Why can red on green fail?", "If both have the same lightness, there is little contrast, whatever the hue."],
      ["What makes several separate designs look like a set?", "Repetition: a shared colour, shape or style."],
      ["What is an accent colour for?", "The one thing you want noticed or pressed."]
    ]
  };
})();
