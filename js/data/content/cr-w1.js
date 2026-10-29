/* Kurenai OS — data/content/cr-w1.js (AUTHORED)
   Creatives · Writing, Unit 1: The sentence and the paragraph. Three lessons (W1.1–W1.3).
   KOS_CONTENT["creatives:<lesson>"] = { pages: [{ t, blocks }], flashcards: [[q, a]] }.
   Blocks (KOS.crTopic): { h } · { p } · { list: [..] } · { callout: { t, body } }
     · { pair: { before, after, why } }  a sentence and its rewrite
     · { ex: { label, text, note } }     a passage to read as a writer
     · { steps: [..] }                   a demonstration, step by step
     · { beginner: { text, note } }      the EXPECTED BEGINNER OUTPUT: a deliberately rough pass,
                                         labelled as one, so the bar is visible (§3.3)
   Every example passage is original to KurenaiOS. */
(function () {
  "use strict";
  var C = window.KOS_CONTENT = window.KOS_CONTENT || {};

  C["creatives:W1.1"] = {
    pages: [
      { t: "Why start with the sentence", blocks: [
        { p: "Every story you love is made of sentences. Before voice, plot or style, a reader needs to know one thing in each sentence:" },
        { callout: { t: "Who does what?", body: "Someone or something, doing one thing. That is the whole skill of this lesson." } },
        { list: ["A clear sentence carries ONE idea.", "It has a subject (who or what) and a verb (what they do).", "Concrete nouns and strong verbs carry it; adverbs and \"was -ing\" weigh it down."] },
        { p: "Light novels and VNs read fast because their sentences are clear, not because they are fancy." }
      ] },
      { t: "One idea, someone doing something", blocks: [
        { steps: ["Find the subject: who or what is this sentence about?", "Find the verb: what do they DO?", "Cut anything that is a second idea, and give it its own sentence."] },
        { pair: { before: "There was a cat that was sitting on the windowsill and it was looking at the rain, which was heavy.", after: "A cat sat on the windowsill. It watched the heavy rain.", why: "Two ideas, two sentences. \"There was… that was…\" became a subject and a verb." } },
        { pair: { before: "The feeling of nervousness was something that Mei had.", after: "Mei was nervous.", why: "The real subject is Mei. Put her first." } }
      ] },
      { t: "Strong verbs", blocks: [
        { p: "A weak verb needs help: an adverb, \"was -ing\", or \"made a…\". A strong verb does the work alone." },
        { pair: { before: "He walked quickly.", after: "He hurried.", why: "One verb instead of a verb and an adverb." } },
        { pair: { before: "She was looking at the board.", after: "She stared at the board.", why: "\"Stared\" tells us HOW she looked." } },
        { pair: { before: "The chair made a loud noise.", after: "The chair screeched.", why: "The noise becomes the verb." } },
        { callout: { t: "Not every \"was\" is wrong", body: "\"Mei was nervous\" is fine. Swap a weak verb only when a stronger one is truer." } }
      ] },
      { t: "Expected beginner output", blocks: [
        { p: "This is what a first pass at \"Ten things, ten sentences\" usually looks like. It passes this unit's check." },
        { beginner: { text: "1. The kettle is boiling and making steam.\n2. A cat sleeps on the chair.\n3. The window is foggy.\n4. A phone buzzes on the table.\n5. The toast is burnt and smells bad.\n6. My school bag sits by the door.", note: "Plain, a bit flat, two sentences still carry two ideas. Most hold ONE idea with a clear subject and verb: a pass for Unit 1. Making it vivid is a later unit." } }
      ] },
      { t: "Quick reference", blocks: [
        { list: ["One idea a sentence.", "Subject first: who or what.", "Then the verb: what they do.", "Swap \"walked quickly\" for one strong verb.", "Cut \"There was… that…\" openings.", "Plain is fine. Clear is the goal."] }
      ] }
    ],
    flashcards: [
      ["What two parts does a clear sentence need?", "A subject (who or what) and a verb (what they do)."],
      ["How many ideas should one clear sentence carry?", "One."],
      ["What is a weak verb?", "A verb that needs help (an adverb, \"was -ing\", \"made a…\") to say what a stronger verb says alone."],
      ["Rewrite: \"He walked quickly.\"", "\"He hurried.\" (or rushed, strode): one strong verb."],
      ["What should you do with a sentence that holds two ideas?", "Split it: give the second idea its own sentence."],
      ["Is every \"was\" a weak verb?", "No. \"She was nervous\" is fine; swap only when a stronger verb is truer."]
    ]
  };

  C["creatives:W1.2"] = {
    pages: [
      { t: "Sentences have a beat", blocks: [
        { p: "Read a paragraph aloud and you hear it: sentences have a rhythm." },
        { list: ["All the same length: the reader drifts off.", "Long sentences carry a flow: movement, build-up, a list of things.", "Short sentences hit. They stop the reader."] },
        { callout: { t: "This lesson's skill", body: "Vary sentence length ON PURPOSE, and put a short one where you want weight." } }
      ] },
      { t: "Hearing the flat paragraph", blocks: [
        { ex: { label: "Flat: every sentence about ten words", text: "Sora opened the door to the club room slowly. The room was empty and the lights were off. He put his bag down next to the long table. A sheet of paper lay in the middle of it.", note: "Nothing is wrong with any one sentence. Together they drone." } },
        { ex: { label: "Varied: the same events", text: "Sora opened the club room door. Empty. The lights were off, the chairs pushed in, the long table bare except for a single sheet of paper lying in the very middle of it, as if someone had placed it there for him.", note: "A two-word sentence, then one long one that builds to the paper." } }
      ] },
      { t: "Three moves", blocks: [
        { steps: ["JOIN two short sentences that belong together with \"and\", a comma, or \"as\".", "SPLIT a long one where the idea turns.", "CUT one down to a few words and place it where you want the reader to stop."] },
        { pair: { before: "The bell rang. Everyone stood up. They rushed to the door.", after: "The bell rang, and everyone rushed for the door at once.", why: "Joined: one movement, one sentence." } },
        { pair: { before: "She read the message twice and then put the phone face down on the desk and did not look at it again for an hour.", after: "She read the message twice. Then she put the phone face down. She did not look at it again for an hour.", why: "Split: each beat lands on its own." } }
      ] },
      { t: "Expected beginner output", blocks: [
        { beginner: { text: "The train was late again this morning, and Haruka stood near the edge of the platform checking her phone twice. Ten minutes. A man beside her was eating a rice ball while the wind carried leaves along the tracks and she thought about the test in first period. Then the train came.", note: "One join is clumsy and the long sentence crams in too much. But the lengths now vary and \"Ten minutes.\" stops the reader: a pass for this unit." } }
      ] },
      { t: "Quick reference", blocks: [
        { list: ["Read it aloud: hear the drone.", "Join, split, cut.", "Long = flow and build-up.", "Short = weight. Put it last, or after a long one.", "Don't make every sentence short either."] }
      ] }
    ],
    flashcards: [
      ["What happens when every sentence in a paragraph is the same length?", "It drones: the reader drifts off."],
      ["What does a short sentence do after a long one?", "It hits: it stops the reader and gives weight."],
      ["Name the three moves for rhythm.", "Join, split and cut."],
      ["Where does a short sentence usually land hardest?", "At the end of a paragraph, or right after a long build-up."],
      ["What is a good test for rhythm?", "Read the paragraph aloud."]
    ]
  };

  C["creatives:W1.3"] = {
    pages: [
      { t: "One job each", blocks: [
        { p: "A paragraph is a container for ONE job. When the job changes, start a new one." },
        { list: ["A new moment or a jump in time.", "A new place.", "A new person speaking (always its own paragraph).", "A turn: something changes, someone decides."] },
        { callout: { t: "This lesson's skill", body: "You can name each paragraph's job in a few words, and a new one starts when the job changes." } }
      ] },
      { t: "Why breaks matter on a screen", blocks: [
        { list: ["Readers on phones see walls of text as hard work.", "Light novels use short paragraphs, often one or two sentences.", "A one-line paragraph is a spotlight: use it for a turn."] },
        { ex: { label: "A one-line paragraph as a spotlight", text: "Aoi checked the gate twice, then the steps, then the gate again.\n\nNobody.\n\nShe pulled out her phone. Four per cent.", note: "\"Nobody.\" gets its own line because it is the turn." } }
      ] },
      { t: "Finding the breaks", blocks: [
        { steps: ["Read the block and write a 3-word job next to each sentence (\"Aoi arrives\", \"gate empty\", \"Ren elsewhere\").", "Wherever the job label changes, break.", "Read it again: could each paragraph be summed up in one label? If not, split it."] },
        { callout: { t: "There is more than one right answer", body: "Two good writers will break the same text differently. What matters is that each break has a reason." } }
      ] },
      { t: "Expected beginner output", blocks: [
        { beginner: { text: "The lights went out at 4:12. I was halfway through a page of quadratic equations and my pen kept moving for a second, writing nothing. Someone laughed. Someone else said \"Seriously?\" Then the emergency light above the door clicked on, green and weak, and everyone looked at their phones like the phones would know.", note: "One paragraph, one job (the moment the lights go out). It wanders a little at the end. That's fine: it passes this unit's check." } }
      ] },
      { t: "Quick reference", blocks: [
        { list: ["One job a paragraph.", "Break for: new moment, new place, new speaker, a turn.", "Label each paragraph in three words.", "One-line paragraph = spotlight. Use it sparingly.", "On screens, shorter paragraphs read easier."] }
      ] }
    ],
    flashcards: [
      ["What is a paragraph's \"job\"?", "The one thing it does: a moment, a place, a speaker, a turn."],
      ["Name four reasons to start a new paragraph.", "A new moment or time, a new place, a new speaker, a turn."],
      ["Does a new speaker get a new paragraph?", "Always."],
      ["What does a one-line paragraph do?", "It spotlights a moment, usually a turn."],
      ["How do you check where breaks go?", "Label each sentence's job in a few words; break where the label changes."],
      ["Is there one right way to break a text?", "No; each break just needs a reason."]
    ]
  };
})();
