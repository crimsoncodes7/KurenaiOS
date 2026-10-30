/* Kurenai OS — data/creatives.js (KOS_CR, AUTHORED)
   Creatives, the sixth study space (roadmap 5.7 item 3, docs/creatives-plan.md revision 2, design
   turn 31). Four TRACKS, each a core path of short units; a unit's lessons are released one set at a
   time and whole, like Code's and Japanese's (invariant 104's shape). A unit not released yet is an
   outline: its name, its stage and the one skill it will teach, and no leaf on the spine.

   A LESSON (KOS_CR.LESSONS[id], id "<track letter><unit>.<n>", "W1.2"):
     title, min          the lesson and its usual time
     skill               the ONE skill it checks (the emblem names it, never a percentage)
     studies [{ id, t, min, tool, give, vary, setup, target }]
                         micro-studies (§3.1): what is given (the 80%), the one variable left, the
                         tool it is made in — "desk" (the Writing Desk), "drill:<type>" (a design
                         drill), "sketch" (the sketchbook, Art), "outside" (a free app, then an
                         upload) — and for the Writing Desk the text it opens with (setup)
     check { skill, good, ignore: [[skill, where]], rows: [question] }
                         "Good for this unit" (§3.3): what passes at THIS unit, the later skills
                         struck through, one or two rows, the unit's one skill only
   A UNIT's project (KOS_CR.UNITS[id].project): { t, brief, milestones: [t], after } — offered once
   its lessons' studies are saved; "Try it anyway" always stays (nothing is locked for good).
   Lesson notes and theory cards are KOS_CONTENT["creatives:<id>"] = { pages, flashcards }.

   The spine (KOS_DATA.creatives) carries released units only, one section each, staged by track. */
(function () {
  "use strict";
  var TRACKS = [
    { id: "art", letter: "A", k: "絵", name: "Art", app: "In the app · the sketchbook",
      stages: [["Construction", 1, 5], ["Figures", 6, 10], ["Scenes", 11, 13]],
      units: ["Lines and confidence", "Boxes and forms", "Perspective", "Value", "Colour basics", "Gesture", "The mannequin",
        "Heads and the anime face", "Hands", "Clothing and folds", "Backgrounds and scenery", "Composition", "A digital workflow"] },
    { id: "design", letter: "D", k: "図", name: "Graphic design", app: "In the app · drills, then Figma or Canva (free)",
      stages: [["Foundations", 1, 4], ["Making", 5, 8]],
      units: ["The principles", "Typography", "Grids and layout", "Colour in design", "Logos and marks", "Covers and posters", "UI and screens", "Export"] },
    { id: "edit", letter: "E", k: "映", name: "Editing", app: "DaVinci Resolve for iPad, CapCut or Alight Motion (free)",
      stages: [["The cut", 1, 4], ["The edit", 5, 8]],
      units: ["The cut and continuity", "Cutting on the beat", "Pacing", "Sound and music levels", "A story in 30 seconds", "Colour, then a grade", "Titles and text", "Export for platforms"] },
    { id: "write", letter: "W", k: "文", name: "Writing", app: "In the app · the Writing Desk",
      stages: [["Craft", 1, 4], ["Story", 5, 9]],
      units: ["The sentence and the paragraph", "Point of view and voice", "Dialogue", "Description and the senses", "The scene", "Character", "Structure", "Revision", "Forms"] }
  ];

  var UNITS = {}, LESSONS = {};
  TRACKS.forEach(function (t) {
    t.units = t.units.map(function (name, i) {
      var n = i + 1, stage = t.stages.filter(function (s) { return n >= s[1] && n <= s[2]; })[0];
      var u = { id: t.letter + n, track: t.id, n: n, name: name, stage: stage ? stage[0] : "", lessons: [], project: null };
      UNITS[u.id] = u;
      return u.id;
    });
  });
  function unit(id, def) { Object.assign(UNITS[id], def); }
  function lesson(def) { LESSONS[def.id] = def; UNITS[def.unit].lessons.push(def.id); }

  /* ================= Art · Units 1–3 (the sketchbook: "sketch" studies) =================
     A sketch study may carry `timer` (minutes, a countdown the learner starts), `momentum` (the
     no-undo, no-eraser switch is offered) and `ref` (a KOS.crRefs kind shown beside the page). */
  var A1_IGNORE = [["Boxes and forms", "Art 2"], ["Perspective", "Art 3"], ["Shading", "Art 4"]];
  lesson({ id: "A1.1", unit: "A1", title: "Ghosted lines", min: 20, skill: "a straight line drawn in one confident stroke",
    studies: [
      { id: "a", t: "Twenty ghosted lines", min: 8, tool: "sketch", timer: 8, momentum: true,
        give: "A blank page and the ghosting routine", vary: "Twenty lines between dot pairs: ghost, then one stroke from the shoulder" },
      { id: "b", t: "Edge to edge", min: 7, tool: "sketch", timer: 7, momentum: true,
        give: "A blank page", vary: "Ten long lines that cross the whole page, each in one stroke" }
    ],
    check: { skill: "Lines are straight-ish and drawn in one go", rows: ["Are most lines one stroke, not several short ones?", "Do most of them land on or near their end dot?"],
      good: "Your lines will wobble a little at the ends and some will miss their dot. That is right for now. Pass if most are one confident stroke rather than scratchy, stitched-together lines. Ignore what you could draw with them: that comes later.",
      ignore: A1_IGNORE } });
  lesson({ id: "A1.2", unit: "A1", title: "Ellipses", min: 20, skill: "a smooth ellipse drawn round in one go",
    studies: [
      { id: "a", t: "A column of ellipses", min: 8, tool: "sketch", timer: 8, momentum: true,
        give: "A vertical line down the page", vary: "Eight ellipses on it, from thin to round, each gone round two or three times" },
      { id: "b", t: "Ellipses in boxes", min: 8, tool: "sketch", timer: 8,
        give: "Rectangles you draw first, long and flat to nearly square", vary: "An ellipse in each, touching the middle of every side" }
    ],
    check: { skill: "Ellipses are smooth and fill their space", rows: ["Are most ellipses smooth, with no flat sides or points?", "Do they touch the middle of each side of their box?"],
      good: "Some will be lopsided and doubled up, which is exactly how ellipses are drawn. Pass if most are smooth loops rather than lumpy ones. Ignore how they would sit on a cylinder: that's Art 2.",
      ignore: A1_IGNORE } });
  lesson({ id: "A1.3", unit: "A1", title: "Curves that commit", min: 20, skill: "a curve drawn smoothly through its points",
    studies: [
      { id: "a", t: "C and S curves", min: 8, tool: "sketch", timer: 8, momentum: true,
        give: "Three dots for each curve, placed by you", vary: "Ten C curves, then ten S curves, each in one stroke" },
      { id: "b", t: "The same curve, ten times", min: 7, tool: "sketch", timer: 7,
        give: "One curve you like from study a", vary: "Draw it ten more times, trying to match it" }
    ],
    check: { skill: "Curves are smooth and hit their points", rows: ["Are most curves smooth, without kinks or flat spots?", "Do they pass through or near their dots?"],
      good: "Some will flatten where your hand slowed, and that's normal. Pass if most curves flow in one movement. Ignore whether they would make a good figure: gesture is Art 6.",
      ignore: A1_IGNORE } });
  unit("A1", { project: { t: "A still life in lines", after: "A1.3",
    brief: "Three things from your kitchen (a mug, a bowl, a bottle) drawn only with ghosted lines, ellipses and curves: no shading, no sketchy fur.",
    milestones: ["The three objects placed with light ellipses and lines", "Each one drawn over in confident strokes", "A second page, faster, saved as a second version"] } });

  var A2_IGNORE = [["Perspective that agrees", "Art 3"], ["Shading", "Art 4"], ["Colour", "Art 5"]];
  lesson({ id: "A2.1", unit: "A2", title: "A box drawn through", min: 25, skill: "a box with its hidden edges drawn through",
    studies: [
      { id: "a", t: "Three boxes drawn through", min: 10, tool: "sketch", timer: 10,
        give: "The four steps: the Y, the top, the sides, the hidden edges", vary: "Three boxes at different sizes, every hidden edge drawn lightly" },
      { id: "b", t: "Copy a box", min: 10, tool: "sketch", ref: "forms",
        give: "A generated reference with a box in it", vary: "Draw just the box, its hidden edges included" }
    ],
    check: { skill: "Boxes look solid and their hidden edges are drawn", rows: ["Does each box look like a solid box, not a flat shape?", "Are the hidden edges drawn, meeting at a back corner?"],
      good: "Your edges will spread or bend a little and the back corners will miss. That's fine. Pass if each box reads as solid and you drew through it. Ignore whether the boxes agree with one horizon: that's Art 3.",
      ignore: A2_IGNORE } });
  lesson({ id: "A2.2", unit: "A2", title: "Boxes that turn", min: 25, skill: "the same box turned to new angles",
    studies: [
      { id: "a", t: "A box in five turns", min: 10, tool: "sketch", timer: 10,
        give: "One box, seen from the front", vary: "Draw it again four times, turning it a little more each time" },
      { id: "b", t: "Turn the reference", min: 10, tool: "sketch", ref: "forms",
        give: "A generated box", vary: "Draw it, then draw it turned the other way" }
    ],
    check: { skill: "The box keeps its size and shape as it turns", rows: ["Does it look like the same box in every drawing?", "Can you see the turn from one drawing to the next?"],
      good: "One or two will tip or stretch. Pass if the row reads as one box turning. Ignore shading and exact perspective.",
      ignore: A2_IGNORE } });
  lesson({ id: "A2.3", unit: "A2", title: "Cylinders from boxes", min: 25, skill: "a cylinder built inside a box",
    studies: [
      { id: "a", t: "Four cylinders", min: 10, tool: "sketch", timer: 10,
        give: "Tall and short boxes, drawn lightly first", vary: "A cylinder in each: two ellipses and two side lines" },
      { id: "b", t: "Things that are cylinders", min: 10, tool: "sketch",
        give: "A mug, a can and a bottle you can see", vary: "Each as a cylinder in its box, no detail" }
    ],
    check: { skill: "Cylinders sit in their boxes", rows: ["Do the ellipses sit in the box's top and bottom faces?", "Do the side lines touch both ellipses?"],
      good: "Bottom ellipses often come out too flat, and that's the usual first mistake. Pass if each cylinder clearly comes from its box. Ignore shading and labels.",
      ignore: A2_IGNORE } });
  unit("A2", { project: { t: "Your desk in boxes", after: "A2.3",
    brief: "Your desk and the things on it drawn as boxes and cylinders, every hidden edge drawn through. No detail, no shading.",
    milestones: ["The desk as one big box", "Every object on it as a box or a cylinder", "A cleaner second page, saved as a second version"] } });

  var A3_IGNORE = [["Shading and value", "Art 4"], ["Colour", "Art 5"], ["Figures", "Art 6"]];
  lesson({ id: "A3.1", unit: "A3", title: "One-point perspective", min: 25, skill: "boxes whose depth lines meet at one point",
    studies: [
      { id: "a", t: "Four boxes, one point", min: 10, tool: "sketch", timer: 10,
        give: "A horizon line with one point", vary: "Four boxes around it: above, below, left and right" },
      { id: "b", t: "Copy a grid", min: 10, tool: "sketch", ref: "grid",
        give: "A generated perspective grid with a box", vary: "Redraw the box on your own horizon" }
    ],
    check: { skill: "Depth lines aim at the point", rows: ["Do the depth lines of each box run to the vanishing point?", "Are the front and back faces parallel?"],
      good: "Some lines will miss the point slightly, and that is normal. Pass if each box clearly recedes to the one point. Ignore shading and texture.",
      ignore: A3_IGNORE } });
  lesson({ id: "A3.2", unit: "A3", title: "Two-point perspective", min: 25, skill: "a box between two vanishing points",
    studies: [
      { id: "a", t: "Three boxes, two points", min: 10, tool: "sketch", timer: 10,
        give: "A horizon with two points far apart", vary: "Three boxes: one above the horizon, one below, one across it" },
      { id: "b", t: "Copy a two-point grid", min: 10, tool: "sketch", ref: "grid",
        give: "A generated two-point grid", vary: "Draw its box on your own horizon" }
    ],
    check: { skill: "Each side runs to its own point", rows: ["Do the left edges run to one point and the right edges to the other?", "Are the vertical edges upright?"],
      good: "Boxes may stretch if your points are too close; that's a lesson, not a fail. Pass if the edges clearly aim at the two points. Ignore shading.",
      ignore: A3_IGNORE } });
  lesson({ id: "A3.3", unit: "A3", title: "A street of boxes", min: 25, skill: "many boxes sharing one vanishing point",
    studies: [
      { id: "a", t: "A street of boxes", min: 15, tool: "sketch", timer: 15,
        give: "A horizon, a point and a road", vary: "Box buildings on both sides, getting smaller" },
      { id: "b", t: "Windows that follow", min: 10, tool: "sketch",
        give: "Your street from study a", vary: "Rows of windows whose edges run to the point" }
    ],
    check: { skill: "Everything shares the one point", rows: ["Do the buildings and windows all aim at the same point?", "Do the buildings get smaller as they go back?"],
      good: "A few windows will drift off their lines. Pass if the street reads as going away from you. Ignore texture, shading and people.",
      ignore: A3_IGNORE } });
  unit("A3", { project: { t: "Your room in one point", after: "A3.3",
    brief: "The room you are in, drawn in one-point perspective: the back wall, the floor and ceiling lines to the point, and three pieces of furniture as boxes.",
    milestones: ["The horizon, the point and the back wall", "The furniture as boxes aimed at the point", "A cleaner second page, saved as a second version"] } });

  /* ================= Writing · Unit 1 · The sentence and the paragraph ================= */
  var W1_IGNORE = [["Voice and point of view", "Writing 2"], ["Dialogue", "Writing 3"], ["Description and the senses", "Writing 4"], ["Whether the story is interesting", "Writing 5"]];
  lesson({ id: "W1.1", unit: "W1", title: "The clear sentence", min: 20, skill: "one clear idea a sentence",
    studies: [
      { id: "a", t: "Ten things, ten sentences", min: 10, tool: "desk",
        give: "Ten things in one room, already chosen", vary: "Each thing as ONE sentence: someone or something doing one thing",
        setup: "A kitchen at 7 a.m. Write one sentence for each.\n\n1. the kettle\n2. a cat\n3. the window\n4. a phone on the table\n5. burnt toast\n6. a school bag\n7. the radio\n8. a tap\n9. a note on the fridge\n10. the back door\n" },
      { id: "b", t: "Swap the weak verbs", min: 8, tool: "desk",
        give: "A paragraph, written for you, full of weak verbs", vary: "Change ONLY the verbs. Leave every other word alone",
        setup: "Rewrite only the verbs. Keep every other word.\n\nKaito was walking quickly down the corridor. He was feeling nervous. He went into the classroom and put his bag down in a hurry. The teacher was looking at him. He made a sound with his chair and sat down. Everyone was being quiet.\n" }
    ],
    check: { skill: "One idea a sentence, with someone doing something", rows: ["Does each sentence carry one idea?", "Can you point to who (or what) does what in each?"],
      good: "Your sentences will sound plain, and some will be dull. That is fine for now. Pass if most sentences hold ONE idea and you can point to who or what does something. Ignore style, voice and whether it is interesting: they are later units.",
      ignore: W1_IGNORE } });
  lesson({ id: "W1.2", unit: "W1", title: "Rhythm: long and short", min: 20, skill: "varying sentence length on purpose",
    studies: [
      { id: "a", t: "Unflatten a paragraph", min: 12, tool: "desk",
        give: "A paragraph of eight sentences that are all the same length", vary: "The LENGTHS only: join some, split some, keep the words close",
        setup: "Every sentence below is about the same length. Join some and split others so the lengths vary. Keep the meaning.\n\nThe train was late again this morning. Haruka stood near the edge of the platform. She checked the time on her phone twice. The board said the train was ten minutes away. A man beside her was eating a rice ball. The wind carried leaves along the tracks. She thought about the test in first period. Then the train finally came around the bend.\n" },
      { id: "b", t: "End on a short one", min: 6, tool: "desk",
        give: "A long build-up, already written", vary: "ONE last sentence of five words or fewer that lands",
        setup: "Finish this paragraph with ONE sentence of five words or fewer.\n\nShe had practised the speech for three weeks, in the bath, on the bus, under her breath in the queue at the shop, until every pause was where she wanted it and every joke landed in the empty room. She walked to the front of the hall, unfolded the paper, looked up at three hundred faces, and opened her mouth.\n\n" }
    ],
    check: { skill: "Sentence lengths that vary on purpose", rows: ["Do the lengths vary across the paragraph?", "Is there one short sentence placed where it hits hardest?"],
      good: "It may feel clumsy to break a sentence on purpose, and some joins will be awkward. Pass if your paragraph no longer has one steady length, and a short sentence sits where you wanted weight. Ignore word choice and voice.",
      ignore: W1_IGNORE } });
  lesson({ id: "W1.3", unit: "W1", title: "The paragraph: one job each", min: 25, skill: "one job a paragraph",
    studies: [
      { id: "a", t: "Break the wall", min: 10, tool: "desk",
        give: "A wall of text, every word written for you", vary: "Where the breaks go: one job a paragraph",
        setup: "This is one block. Put a blank line wherever a new job starts (a new moment, a new place, a new person speaking, a turn). Change nothing else.\n\nThe festival opened at six, and by half past the street was full of lanterns and the smell of grilled squid. Aoi had promised to meet Ren by the shrine gate, so she pushed through the crowd with her yukata sleeves held close. The gate was empty. She checked her phone: no message, the battery at four per cent. Ren, meanwhile, was three streets away, stuck behind a float, holding two candy apples that were starting to melt down his wrists. He had left his phone charging at home. When the first firework went up, both of them looked at the sky at the same moment, and both of them thought, at the same moment, that the other one had forgotten.\n" },
      { id: "b", t: "One paragraph, one moment", min: 12, tool: "desk", target: 100,
        give: "Who, where and what happens are chosen for you", vary: "ONE paragraph of about 100 words that does one job",
        setup: "Write ONE paragraph (about 100 words) that does one job: the moment the lights go out in a school library during an exam revision session. Who: you. Where: the second floor. Nothing else needs to happen.\n\n" }
    ],
    check: { skill: "Each paragraph does one job", rows: ["Could you name each paragraph's job in a few words?", "Does a new paragraph start where the job changes?"],
      good: "Your breaks may not match anyone else's, and that is normal: there is more than one right answer. Pass if you can name each paragraph's job in a few words and a new one starts when the job changes. Ignore the prose itself.",
      ignore: W1_IGNORE } });
  unit("W1", { project: { t: "A 300-word moment", after: "W1.3",
    brief: "One moment from your own week, told in about 300 words: three or four paragraphs, each with one job, sentences that vary on purpose.",
    milestones: ["A first draft, any length, in the Writing Desk", "A sentence pass: one idea each, the weak verbs swapped", "A rhythm and paragraph pass, saved as a second version"] } });

  /* ================= Writing · Unit 2 · Point of view and voice ================= */
  var W2_IGNORE = [["Dialogue", "Writing 3"], ["Description and the senses", "Writing 4"], ["Plot and whether it is interesting", "Writing 5"]];
  lesson({ id: "W2.1", unit: "W2", title: "Whose eyes? Point of view", min: 20, skill: "one point of view, held",
    studies: [
      { id: "a", t: "One moment, two chairs", min: 12, tool: "desk",
        give: "A moment already written in third person", vary: "The POINT OF VIEW only: rewrite it in first person, as Mei",
        setup: "Rewrite this in FIRST person, as Mei. Keep the events. Change only whose eyes we are behind.\n\nMei waited outside the staff room with her report card folded in half. The door opened and Mr Sato looked at her over his glasses. She felt her face go hot. He said nothing for a moment, then smiled and held the door wider.\n\n" },
      { id: "b", t: "Catch the head-hop", min: 8, tool: "desk",
        give: "A paragraph that jumps between two characters' thoughts", vary: "Pick ONE character and cut or change every line we could not know from inside them",
        setup: "This paragraph jumps between Ren's head and Aoi's. Choose one of them, and fix every sentence the other one's thoughts leak into.\n\nRen held out the candy apple, worried it had melted too much. Aoi took it and thought it was the sweetest thing anyone had done all week. Ren wondered if she was angry about the wait. She decided not to mention it, and he was relieved, though he didn't show it.\n\n" }
    ],
    check: { skill: "One point of view, held for the whole piece", rows: ["Is the whole piece told from one person's position?", "Did every thought and feeling come from inside that person?"],
      good: "Holding a point of view feels restrictive at first, and a slip or two is normal. Pass if the piece mostly stays behind one person's eyes and the thoughts we hear are theirs. Ignore how vivid or interesting it is.",
      ignore: W2_IGNORE } });
  lesson({ id: "W2.2", unit: "W2", title: "Close or far: the camera", min: 20, skill: "choosing the distance",
    studies: [
      { id: "a", t: "Zoom in on one line", min: 10, tool: "desk",
        give: "A distant summary sentence and the scene it sums up", vary: "The DISTANCE only: rewrite it close, inside the moment",
        setup: "This line is told from far away. Rewrite it CLOSE: inside the moment, through one person, in three to five sentences.\n\nThe class trip to Kyoto went badly from the start.\n\n" },
      { id: "b", t: "Zoom out in one breath", min: 8, tool: "desk",
        give: "A close, slow paragraph", vary: "The DISTANCE only: sum it up in ONE far-off sentence",
        setup: "Sum up this close paragraph in ONE distant sentence, as if looking back.\n\nThe spoon clinked against the cup. Grandma stirred and stirred, though the sugar had dissolved a minute ago. She looked at the photo on the table, then at me, then back at the photo. \"He used to take it with two,\" she said.\n\n" }
    ],
    check: { skill: "A distance chosen on purpose", rows: ["Does the close version put us inside the moment?", "Does the far version sum it up from outside?"],
      good: "Your close version may run long and your far one may feel cold. Both are fine. Pass if you can feel the camera move in for one and out for the other. Ignore word choice.",
      ignore: W2_IGNORE } });
  lesson({ id: "W2.3", unit: "W2", title: "Voice: how a narrator sounds", min: 25, skill: "a voice that stays the same",
    studies: [
      { id: "a", t: "Three narrators, one event", min: 15, tool: "desk",
        give: "One event and three narrators, already chosen", vary: "The VOICE only: tell the same three sentences three ways",
        setup: "The event: someone drops a full tray in the school canteen. Tell it in about three sentences, three times:\n\n1. A bored, sarcastic third-year:\n\n2. A nervous first-year who is trying not to be noticed:\n\n3. The canteen cat:\n\n" },
      { id: "b", t: "Keep the voice going", min: 8, tool: "desk",
        give: "A paragraph opening in a strong voice", vary: "Continue it for about 80 words WITHOUT changing how it sounds",
        setup: "Keep going in exactly this voice for about 80 more words.\n\nRight, so, the thing about my brother is he cannot lose at anything, not cards, not races, not even the game where you guess what the cat is thinking, and today, today of all days, he lost at\n" }
    ],
    check: { skill: "Each voice sounds like one person, all the way through", rows: ["Could a reader tell your three narrators apart?", "Did the continued voice stay the same to the end?"],
      good: "Voices can feel like costumes at first, and exaggerated is fine for now. Pass if each narrator sounds different and none slides back into your usual voice. Ignore grammar slips the voice makes on purpose.",
      ignore: W2_IGNORE } });
  unit("W2", { project: { t: "One scene, two eyes", after: "W2.3",
    brief: "A short moment (about 250 words) told twice: once close in first person, once from a different character in close third person. Same events, two voices.",
    milestones: ["The first telling, first person", "The second telling, another character, close third", "A pass on each for point-of-view slips, saved as a second version"] } });

  /* ================= Writing · Unit 3 · Dialogue ================= */
  var W3_IGNORE = [["Description and the senses", "Writing 4"], ["Scene structure and plot", "Writing 5"], ["Deep characterisation", "Writing 6"]];
  lesson({ id: "W3.1", unit: "W3", title: "Dialogue on the page", min: 20, skill: "dialogue set out so a reader can follow it",
    studies: [
      { id: "a", t: "Set it out", min: 10, tool: "desk",
        give: "A conversation squashed into one block, every word written", vary: "The LAYOUT only: quotation marks, new lines, simple tags",
        setup: "Set this conversation out properly: a new paragraph for each speaker, quotation marks, and \"said\" where a tag is needed. Change no words.\n\nAre you coming to the festival Ren asked. Maybe Aoi said I have to help at the stall until eight. Eight is fine he said the fireworks are at nine. Then maybe yes she said.\n" },
      { id: "b", t: "Cut the tags", min: 8, tool: "desk",
        give: "A short exchange where every line has a fancy tag", vary: "The TAGS only: cut each one you can, make the rest \"said\"",
        setup: "Cut every tag a reader doesn't need, and turn the rest into \"said\".\n\n\"Where were you?\" Haruka demanded angrily.\n\"At the library,\" Sora replied quietly.\n\"Until midnight?\" she exclaimed.\n\"It was open late,\" he explained.\n\"Libraries don't open late,\" she retorted.\n" }
    ],
    check: { skill: "A reader always knows who is speaking", rows: ["Does each speaker get their own paragraph?", "Could a reader follow who says each line without fancy tags?"],
      good: "Punctuation in dialogue is fiddly and you may still miss a comma. Pass if every speaker has their own line and a reader can follow who speaks. Ignore whether the conversation is interesting yet: that is the next lesson.",
      ignore: W3_IGNORE } });
  lesson({ id: "W3.2", unit: "W3", title: "Want: what each one is after", min: 25, skill: "dialogue where each speaker wants something",
    studies: [
      { id: "a", t: "A 150-word exchange", min: 15, tool: "desk", target: 150,
        give: "Two characters, a place and what each one wants", vary: "The EXCHANGE only: about 150 words of dialogue, each line pushing for that want",
        setup: "Write about 150 words of dialogue. Mostly lines, very little else.\n\nWho: Kaito and his older sister Rin.\nWhere: the front door, 7:58 a.m., one umbrella between them, and it is pouring.\nKaito wants: the umbrella (he has a presentation).\nRin wants: the umbrella (new shoes).\nNeither says what they want straight out.\n\n" },
      { id: "b", t: "Say it without saying it", min: 8, tool: "desk",
        give: "A flat line where a character says exactly what she feels", vary: "ONE replacement exchange of three to four lines where the feeling sits under the words",
        setup: "Replace this flat line with three or four lines of dialogue where the feeling is UNDER the words, never said.\n\n\"I'm upset that you forgot my birthday,\" Mei said.\n\n" }
    ],
    check: { skill: "Each speaker is after something", rows: ["Could you name what each speaker wants?", "Do most lines push toward that want, instead of just passing information?"],
      good: "It will feel stagey, and some lines will just be there to fill. That's normal. Pass if you can name each person's want and most lines push for it. Ignore description, setting and whether it ends well.",
      ignore: W3_IGNORE } });
  lesson({ id: "W3.3", unit: "W3", title: "Dialogue in a VN script", min: 20, skill: "a scene carried by lines and beats",
    studies: [
      { id: "a", t: "Novel to script", min: 12, tool: "desk",
        give: "A short prose scene with dialogue", vary: "The FORM only: rewrite it as a VN script, one speaker label a line, actions as [beats]",
        setup: "Rewrite this as a visual-novel script: NAME: line. Put actions and expressions in [square brackets] on their own lines. Narration lines have no name.\n\nThe club room was empty except for Yui, who did not look up from her sketchbook. \"You're late,\" she said. Sora set down two cans of melon soda. \"Peace offering.\" She glanced at the cans, then at him, and finally closed the sketchbook. \"Fine. Sit.\"\n\n" },
      { id: "b", t: "Beats between lines", min: 8, tool: "desk",
        give: "Six lines of script with no beats at all", vary: "Add TWO or THREE beats (an action or an expression) where they change how a line lands",
        setup: "Add two or three [beats] where they change how the next line reads. Don't change the lines.\n\nRIN: You took the umbrella.\nKAITO: I had a presentation.\nRIN: I had new shoes.\nKAITO: They're shoes.\nRIN: They WERE shoes.\nKAITO: ...Sorry.\n\n" }
    ],
    check: { skill: "The scene reads from lines and beats alone", rows: ["Is each line labelled with who says it?", "Does at least one beat change how a line lands?"],
      good: "Script form looks odd the first time, and your beats may be obvious ones. Pass if the speakers are clear and one beat really changes a line. Ignore art direction and music: that is the VN project later.",
      ignore: W3_IGNORE } });
  unit("W3", { project: { t: "A two-person scene", after: "W3.3",
    brief: "A scene of about 400 words, mostly dialogue, between two people who each want something different. Finish it as prose or as a VN script.",
    milestones: ["The wants and the place, in two lines each", "The first draft of the exchange", "A tag-and-want pass, saved as a second version"] } });

  /* ================= Graphic design · Unit 1 · The principles ================= */
  var D1_IGNORE = [["Choosing typefaces", "Design 2"], ["Grids in depth", "Design 3"], ["Whether it looks professional", "later units"]];
  var FREE = "Canva or Figma (free)";
  lesson({ id: "D1.1", unit: "D1", title: "Contrast and hierarchy", min: 25, skill: "the most important thing reads first",
    studies: [
      { id: "a", t: "Fix a flat flyer", min: 10, tool: "drill:hierarchy",
        give: "The flyer's words, all one size", vary: "Size and weight only, until the title reads first" },
      { id: "b", t: "Three sizes only", min: 15, tool: "outside",
        give: "An event's details: a title, a date, a place, two lines of detail", vary: "A poster in " + FREE + " using exactly three text sizes and nothing else" }
    ],
    check: { skill: "One thing reads first, then the next", rows: ["Does the eye land on one thing first?", "Is the order after that the order you meant?"],
      good: "It may look plain and empty, and that is fine. Pass if someone glancing at it reads the title first and the key detail second. Ignore fonts and colour: they come later.",
      ignore: D1_IGNORE } });
  lesson({ id: "D1.2", unit: "D1", title: "Alignment and proximity", min: 25, skill: "things line up and related things sit together",
    studies: [
      { id: "a", t: "Back on the grid", min: 10, tool: "drill:grid",
        give: "Four blocks already made", vary: "Where they sit: every edge on a column line" },
      { id: "b", t: "Group it", min: 15, tool: "outside",
        give: "A business card's seven lines of text, written for you", vary: "Only spacing and alignment, in " + FREE + ": related lines together, one shared left edge" }
    ],
    check: { skill: "Edges line up, groups read as groups", rows: ["Do most things share a few edges?", "Are related things closer to each other than to the rest?"],
      good: "Your spacing may feel too big or too tight. Pass if you can see one or two strong edges and the groups are obvious at a glance. Ignore type choice and colour.",
      ignore: D1_IGNORE } });
  lesson({ id: "D1.3", unit: "D1", title: "Repetition and colour contrast", min: 25, skill: "a small set of colours with enough contrast, repeated",
    studies: [
      { id: "a", t: "A palette that passes", min: 10, tool: "drill:palette",
        give: "Three swatches and a live contrast check", vary: "Lightness and hue until text and accent pass" },
      { id: "b", t: "Repeat one thing", min: 15, tool: "outside",
        give: "Three post ideas for a club account", vary: "Three square tiles in " + FREE + " that share one colour and one shape" }
    ],
    check: { skill: "Few colours, enough contrast, something repeated", rows: ["Does the text pass the contrast check?", "Does one colour or shape repeat so the pieces belong together?"],
      good: "Your colours may feel safe or a little dull. That is fine. Pass if the text is easy to read and the set looks related. Ignore whether the colours are fashionable.",
      ignore: D1_IGNORE } });
  unit("D1", { project: { t: "A flyer for your club", after: "D1.3",
    brief: "One A5 flyer for a real or made-up club, in " + FREE + ": a clear hierarchy, things on a grid, two or three colours that pass the check.",
    milestones: ["The words, and a rough thumbnail sketch", "A first layout on a grid", "A hierarchy and colour pass, saved as a second version"] } });

  /* ================= Graphic design · Unit 2 · Typography ================= */
  var D2_IGNORE = [["Layout and grids", "Design 3"], ["Colour", "Design 4"], ["Logos and lettering", "Design 5"]];
  lesson({ id: "D2.1", unit: "D2", title: "Letters and spacing", min: 25, skill: "even spacing between letters",
    studies: [
      { id: "a", t: "Kerning by eye", min: 10, tool: "drill:kerning",
        give: "A word with its spacing knocked out", vary: "The gaps between letters, until they look even" },
      { id: "b", t: "Kern a title", min: 10, tool: "outside",
        give: "The title of a book you love, typed for you at a large size", vary: "Only the letter spacing, by hand, in " + FREE }
    ],
    check: { skill: "The spaces between letters look even", rows: ["Squinting, do the gaps look about the same?", "Did the worst pair (often A, V, W, Y, T) get fixed?"],
      good: "Kerning is fiddly and your eye will improve for years. Pass if nothing jumps out as a hole or a collision. Ignore the choice of font: that is the next lesson.",
      ignore: D2_IGNORE } });
  lesson({ id: "D2.2", unit: "D2", title: "Pairing typefaces", min: 25, skill: "two faces with different jobs",
    studies: [
      { id: "a", t: "Pair for a brief", min: 8, tool: "drill:pairing",
        give: "A brief and five typefaces", vary: "Which face is the heading and which is the body" },
      { id: "b", t: "Two faces, one card", min: 15, tool: "outside",
        give: "A short recipe, written for you", vary: "A recipe card in " + FREE + " in exactly two typefaces" }
    ],
    check: { skill: "One face leads, one face reads", rows: ["Is it clear which face is the heading?", "Is the body face easy to read at its size?"],
      good: "Your pairs may be safe ones, and safe is good here. Pass if the two faces do different jobs and the body reads easily. Ignore layout and colour.",
      ignore: D2_IGNORE } });
  lesson({ id: "D2.3", unit: "D2", title: "Leading and the measure", min: 20, skill: "a comfortable line length and line spacing",
    studies: [
      { id: "a", t: "A comfortable paragraph", min: 6, tool: "drill:measure",
        give: "A paragraph set badly", vary: "Line length and leading only" },
      { id: "b", t: "A readable page", min: 15, tool: "outside",
        give: "A page of a short story, written for you", vary: "Set it in " + FREE + " with 45–75 characters a line and comfortable leading" }
    ],
    check: { skill: "Long text is comfortable to read", rows: ["Is the line length roughly 45–75 characters?", "Is there enough space between lines that the eye finds the next one?"],
      good: "It may look like a plain page, which is the point. Pass if a paragraph is easy to read to the end. Ignore the page's decoration.",
      ignore: D2_IGNORE } });
  unit("D2", { project: { t: "A title for a book you love", after: "D2.3",
    brief: "First recreate one real cover's title type as a study (not your own design), then design your own title for the same book: one display face, one supporting face, kerned by hand.",
    milestones: ["The study: the real title recreated", "Your own title, first draft", "A kerning and pairing pass, saved as a second version"] } });

  /* every unit not released yet still says what it will teach (the desk's path reads these) */
  var SKILLS = {
    A1: "a confident line", A2: "boxes drawn through", A3: "vanishing points that agree", A4: "light and shadow on a form", A5: "hue, value and saturation", A6: "the line of action",
    A7: "proportions on a mannequin", A8: "the anime head turned", A9: "a hand as simple forms", A10: "folds that follow the form", A11: "a room in perspective", A12: "where the eye goes", A13: "flats under a clean line",
    D1: "contrast and alignment", D2: "spacing type by eye", D3: "a grid that holds", D4: "a palette that reads", D5: "a mark that reduces", D6: "a title that leads", D7: "a screen's hierarchy", D8: "the right file for the place",
    E1: "a cut you do not notice", E2: "a cut on the beat", E3: "the length of a shot", E4: "music under voice", E5: "a turn in 30 seconds", E6: "a correction, then a mood", E7: "type on moving images", E8: "the right export",
    W1: "one clear idea a sentence", W2: "a voice that stays put", W3: "dialogue that carries want", W4: "one sense, one room", W5: "a scene that turns", W6: "want, need and flaw", W7: "a shape for a story", W8: "a second draft", W9: "a finished form"
  };
  Object.keys(SKILLS).forEach(function (id) { if (UNITS[id]) UNITS[id].skill = SKILLS[id]; });

  /* the pictures imported so far (art-source/creatives/manifest.json, imported into
     assets/creatives/img/ as <id>.webp); a slot whose id is not listed draws nothing */
  var ART = [
    "cr.beginner.A1.1",
    "cr.beginner.A1.2",
    "cr.beginner.A1.3",
    "cr.beginner.A2.1",
    "cr.beginner.A2.2",
    "cr.beginner.A2.3",
    "cr.beginner.A3.1",
    "cr.beginner.A3.2",
    "cr.beginner.A3.3",
    "cr.spot.log",
    "cr.spot.portfolio",
    "cr.spot.rest",
    "cr.step.A1.1.1",
    "cr.step.A1.1.4",
    "cr.step.A1.2.1",
    "cr.step.A1.2.2",
    "cr.step.A1.2.3",
    "cr.step.A1.2.4",
    "cr.step.A1.3.2",
    "cr.step.A1.3.3",
    "cr.step.A1.3.4",
    "cr.step.A2.2.1",
    "cr.step.A2.2.2",
    "cr.step.A2.2.3",
    "cr.step.A2.2.4",
    "cr.step.A2.3.1",
    "cr.step.A2.3.2",
    "cr.step.A2.3.3",
    "cr.step.A2.3.4",
    "cr.step.A3.1.1",
    "cr.step.A3.1.2",
    "cr.step.A3.1.3",
    "cr.step.A3.1.4",
    "cr.step.A3.2.1",
    "cr.step.A3.3.1",
    "cr.step.A3.3.2"
  ];

  window.KOS_CR = { TRACKS: TRACKS, UNITS: UNITS, LESSONS: LESSONS, ART: ART };

  /* the spine: released units only, staged by track */
  window.KOS_DATA = window.KOS_DATA || {};
  window.KOS_DATA.creatives = {
    id: "creatives", name: "Creatives", board: "Art, design, editing and writing",
    labelL: "What this lesson teaches", labelR: "Where it leads",
    sections: [].concat.apply([], TRACKS.map(function (t, ti) {
      return t.units.filter(function (uid) { return UNITS[uid].lessons.length; }).map(function (uid) {
        var u = UNITS[uid];
        return { ref: u.id, title: u.name, stage: ti, kanji: t.k,
          children: u.lessons.map(function (id) { return { ref: id, title: LESSONS[id].title, content: ["The one skill: " + LESSONS[id].skill + "."] }; }) };
      });
    }))
  };
})();
