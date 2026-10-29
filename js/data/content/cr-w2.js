/* Kurenai OS — data/content/cr-w2.js (AUTHORED)
   Creatives · Writing, Unit 2: Point of view and voice. Three lessons (W2.1–W2.3).
   The block types are cr-w1.js's (KOS.crTopic). Every example passage is original to KurenaiOS. */
(function () {
  "use strict";
  var C = window.KOS_CONTENT = window.KOS_CONTENT || {};

  C["creatives:W2.1"] = {
    pages: [
      { t: "Whose eyes are we behind?", blocks: [
        { p: "Every piece of fiction is told from somewhere. That position is the point of view (POV)." },
        { list: ["First person: \"I\". We are inside the narrator.", "Close third: \"she\". We ride in one character's head.", "Distant third: \"they\". A narrator above everyone."] },
        { callout: { t: "This lesson's skill", body: "Pick ONE point of view and hold it for the whole piece." } },
        { p: "Light novels love first person; many VNs switch between characters, but only at a clear break." }
      ] },
      { t: "The head-hop", blocks: [
        { p: "A head-hop is a jump into a second character's thoughts in the middle of a scene. It blurs whose story it is." },
        { pair: { before: "Ren handed her the apple, hoping she wasn't angry. Aoi thought it was the sweetest thing.", after: "Ren handed her the apple, hoping she wasn't angry. Aoi's face broke into a grin.", why: "Inside Ren, we can't know what Aoi THINKS. We can only see what she does." } },
        { steps: ["Choose your POV character.", "For each sentence ask: could they know or see this?", "Turn the others' thoughts into what your character can see or hear."] }
      ] },
      { t: "First person, gently", blocks: [
        { ex: { label: "First person", text: "The door opened and Mr Sato looked at me over his glasses. My face went hot. I held the report card so tightly it creased.", note: "We get Mei's body and feelings directly. Mr Sato stays outside." } },
        { callout: { t: "A trap", body: "In first person, you can't describe your own face as others see it (\"my cheeks turned a pretty pink\"). You feel it instead." } }
      ] },
      { t: "Expected beginner output", blocks: [
        { beginner: { text: "I waited outside the staff room with my report card folded in half. The door opened and Mr Sato looked at me. My face went really hot and red. He didn't say anything and he was thinking about my grades. Then he smiled and held the door.", note: "One slip: \"he was thinking about my grades\" is inside Mr Sato. Everything else stays behind Mei's eyes: a pass for this unit." } }
      ] },
      { t: "Quick reference", blocks: [
        { list: ["I = first person. She/he in one head = close third.", "One POV a scene.", "Others' thoughts → what your character sees.", "Switch POV only at a clear break.", "First person: feel your face, don't see it."] }
      ] }
    ],
    flashcards: [
      ["What is point of view?", "The position a story is told from: whose eyes, or how far above."],
      ["What is a head-hop?", "Jumping into a second character's thoughts mid-scene."],
      ["In close third on Ren, how do we learn what Aoi feels?", "Only through what Ren can see or hear: her face, actions and words."],
      ["When is it safe to switch point of view?", "At a clear break: a new scene or chapter."],
      ["Why is \"my cheeks turned a pretty pink\" odd in first person?", "The narrator can't see their own face; they'd feel the heat instead."]
    ]
  };

  C["creatives:W2.2"] = {
    pages: [
      { t: "The camera's distance", blocks: [
        { p: "Inside any point of view, you choose how close the camera is." },
        { list: ["CLOSE: one moment, slow, sensations, thoughts.", "FAR: a summary, fast, from outside or looking back.", "Stories move between the two."] },
        { callout: { t: "This lesson's skill", body: "Choose the distance on purpose: zoom in for what matters, out to skip what doesn't." } }
      ] },
      { t: "Zooming in", blocks: [
        { pair: { before: "The class trip to Kyoto went badly from the start.", after: "The bus pulled away from the school at 6:40. I had the window seat, the wrong bag, and Hikaru's elbow in my ribs. Nobody had told me the ticket was in the OTHER bag.", why: "Close: one person, one moment, small concrete things." } },
        { steps: ["Pick ONE moment inside the summary.", "Put one person in it.", "Give two or three concrete details they notice."] }
      ] },
      { t: "Zooming out", blocks: [
        { pair: { before: "Grandma stirred and stirred, though the sugar had gone. She looked at the photo, then at me.", after: "That winter, Grandma made tea for two every afternoon, though only one of us drank it.", why: "Far: a pattern over time, told from outside the moment." } },
        { callout: { t: "Summary is not bad", body: "Zooming out skips the boring parts so the close moments shine." } }
      ] },
      { t: "Expected beginner output", blocks: [
        { beginner: { text: "Close: The bus left at 6:40 and I was squashed against the window. My ticket was in the other bag. I realised this on the motorway and felt sick.\nFar: Grandma always made tea for Grandpa even after he died.", note: "Plain, but the first is inside one moment and the second sums up from outside. A pass for this unit." } }
      ] },
      { t: "Quick reference", blocks: [
        { list: ["Close = one moment, slow, details.", "Far = summary, fast, a pattern.", "Zoom in for what matters.", "Zoom out to skip.", "Same POV, different distance."] }
      ] }
    ],
    flashcards: [
      ["What does a close camera give the reader?", "One moment, slowed down, with sensations and thoughts."],
      ["What does a far camera do?", "Sums up: fast, from outside or looking back."],
      ["Why use summary at all?", "To skip what doesn't matter so the close moments stand out."],
      ["Three steps to zoom in?", "Pick one moment, put one person in it, give two or three concrete details."],
      ["Does changing distance change the point of view?", "No: it's the same eyes, closer or further away."]
    ]
  };

  C["creatives:W2.3"] = {
    pages: [
      { t: "What voice is", blocks: [
        { p: "Voice is how the telling sounds: the narrator's personality coming through the words." },
        { list: ["Word choice: \"car\" or \"motor\" or \"death-trap\".", "Sentence shape: tidy, rambling, clipped.", "Attitude: what they find funny, scary or boring."] },
        { callout: { t: "This lesson's skill", body: "Make a voice sound like ONE person, all the way through." } }
      ] },
      { t: "One event, three voices", blocks: [
        { ex: { label: "A sarcastic third-year", text: "Somebody dropped a whole tray of curry. Incredible. Truly the highlight of my academic career.", note: "Short, dry, exaggerated praise." } },
        { ex: { label: "A nervous first-year", text: "There was a crash and everyone turned and I thought, please don't let it be me, please, and it wasn't, but I still went red.", note: "Run-on sentences: the panic is in the shape." } },
        { ex: { label: "The canteen cat", text: "Curry, on the floor. A gift. The humans were shouting, as they do when they are pleased.", note: "A different mind: what it notices and how it misreads." } }
      ] },
      { t: "Holding it", blocks: [
        { steps: ["Write three words your narrator would use and three they never would.", "Decide their sentence shape: short? long? questions?", "Reread at the end: does the last line sound like the first?"] },
        { callout: { t: "Where voices slip", body: "Usually in the middle, when you start explaining. Your own voice creeps back in." } }
      ] },
      { t: "Expected beginner output", blocks: [
        { beginner: { text: "1. Wow. Someone dropped their tray. Amazing. Best day ever.\n2. There was a huge crash and I hoped nobody would look at me and I went red anyway.\n3. Food on the floor! For me! The humans are very loud today.", note: "The cat sounds a bit like a puppy and the first one is thin. But the three sound different from each other: a pass for this unit." } }
      ] },
      { t: "Quick reference", blocks: [
        { list: ["Voice = word choice + sentence shape + attitude.", "Three words they'd use, three they wouldn't.", "Check the middle: that's where it slips.", "Exaggerated is fine while you learn.", "Last line should sound like the first."] }
      ] }
    ],
    flashcards: [
      ["What is voice?", "How the telling sounds: the narrator's personality in the words."],
      ["Name three things that make a voice.", "Word choice, sentence shape and attitude."],
      ["Where does a voice usually slip?", "In the middle, when the writer starts explaining."],
      ["A quick way to fix a voice before writing?", "List three words they'd use and three they never would."],
      ["How can sentence shape carry a feeling?", "Run-ons can carry panic; short clipped lines can carry boredom or calm."]
    ]
  };
})();
