/* Kurenai OS — data/content/cr-w3.js (AUTHORED)
   Creatives · Writing, Unit 3: Dialogue. Three lessons (W3.1–W3.3).
   The block types are cr-w1.js's (KOS.crTopic). Every example passage is original to KurenaiOS. */
(function () {
  "use strict";
  var C = window.KOS_CONTENT = window.KOS_CONTENT || {};

  C["creatives:W3.1"] = {
    pages: [
      { t: "The rules that help the reader", blocks: [
        { p: "Dialogue layout has a few rules. They all exist so the reader never asks \"who said that?\"" },
        { list: ["A new speaker = a new paragraph.", "Spoken words go inside quotation marks.", "Punctuation sits inside the closing mark: \"Fine,\" she said.", "\"Said\" is almost invisible. That's its job."] },
        { callout: { t: "This lesson's skill", body: "A reader always knows who is speaking." } }
      ] },
      { t: "Setting it out", blocks: [
        { ex: { label: "Squashed", text: "Are you coming Ren asked. Maybe Aoi said.", note: "Two speakers in one line: hard to follow." } },
        { ex: { label: "Set out", text: "\"Are you coming?\" Ren asked.\n\n\"Maybe,\" Aoi said.", note: "Each speaker gets a paragraph. The comma goes inside the quote." } },
        { steps: ["Find where each speaker starts and stops.", "Give each turn its own paragraph.", "Add quotation marks and a tag only where it's unclear."] }
      ] },
      { t: "Tags: said, or nothing", blocks: [
        { pair: { before: "\"Where were you?\" Haruka demanded angrily.", after: "\"Where were you?\" Haruka said.", why: "The question already sounds angry. \"Demanded angrily\" says it twice." } },
        { pair: { before: "\"At the library,\" Sora replied quietly.\n\"Until midnight?\" she exclaimed.", after: "\"At the library.\"\n\"Until midnight?\"", why: "With two speakers taking turns, the reader can follow without tags." } },
        { callout: { t: "When to tag", body: "At the start of an exchange, after a long run of lines, or when a third person speaks." } }
      ] },
      { t: "Expected beginner output", blocks: [
        { beginner: { text: "\"Are you coming to the festival\" Ren asked.\n\"Maybe,\" Aoi said, \"I have to help at the stall until eight.\"\n\"Eight is fine. The fireworks are at nine,\" he said.\n\"Then maybe yes.\"", note: "A missing question mark and a comma splice. But every speaker has a line and you can follow who speaks: a pass for this unit." } }
      ] },
      { t: "Quick reference", blocks: [
        { list: ["New speaker, new paragraph.", "Punctuation inside the quotes.", "\"Said\" or no tag at all.", "Tag at the start and after long runs.", "No adverbs on tags if the line already says it."] }
      ] }
    ],
    flashcards: [
      ["What must happen when a new person speaks?", "A new paragraph."],
      ["Where does the comma go in: \"Fine\" she said?", "Inside the quotes: \"Fine,\" she said."],
      ["Why is \"said\" usually best?", "It's nearly invisible, so the line itself carries the feeling."],
      ["When does dialogue need a tag?", "At the start of an exchange, after a long run, or when a third person speaks."],
      ["What's wrong with \"she demanded angrily\" after an angry question?", "It says the feeling twice; the line already shows it."]
    ]
  };

  C["creatives:W3.2"] = {
    pages: [
      { t: "Every speaker wants something", blocks: [
        { p: "Dull dialogue passes information. Good dialogue is a small fight: each speaker is after something." },
        { list: ["Know what each one WANTS in this scene.", "Every line is a move toward it, or away from the other's.", "People rarely say what they want straight out."] },
        { callout: { t: "This lesson's skill", body: "You can name each speaker's want, and most lines push for it." } }
      ] },
      { t: "Information or a move?", blocks: [
        { ex: { label: "Information only", text: "\"It's raining.\"\n\"Yes, it is.\"\n\"There's one umbrella.\"\n\"I know.\"", note: "True, and nothing happens." } },
        { ex: { label: "Two wants", text: "\"Wow, that's some rain.\"\n\"Good thing you love getting wet.\"\n\"I have a presentation, Rin.\"\n\"And I have new shoes. Shoes beat slides.\"", note: "Same facts. Now every line is a move for the umbrella." } }
      ] },
      { t: "Under the words", blocks: [
        { pair: { before: "\"I'm upset that you forgot my birthday,\" Mei said.", after: "\"Nice day yesterday?\"\n\"Fine. Normal.\"\n\"Normal.\" Mei folded the card back into its envelope.", why: "The feeling sits under the words, and one action shows it." } },
        { steps: ["Write what the character feels in one line, then delete it.", "Write what they'd SAY instead, to avoid saying it.", "Add one small action that leaks the truth."] }
      ] },
      { t: "Expected beginner output", blocks: [
        { beginner: { text: "\"Morning,\" Kaito said, picking up the umbrella.\n\"That's mine,\" said Rin.\n\"It's the family umbrella.\"\n\"Which I bought.\"\n\"I have a presentation today, it's important.\"\n\"These shoes are important.\"\n\"They're just shoes!\"\n\"So is your presentation.\"", note: "A couple of lines say the want straight out, and the last line doesn't quite make sense. But both wants are clear and most lines push: a pass for this unit." } }
      ] },
      { t: "Quick reference", blocks: [
        { list: ["Name each speaker's want first.", "Each line = a move.", "Don't say the want straight out.", "Feeling under the words.", "One action can leak the truth."] }
      ] }
    ],
    flashcards: [
      ["What makes dialogue more than information?", "Each speaker wants something, and the lines are moves toward it."],
      ["Do people usually say what they want straight out?", "Rarely; they circle it, hint, or avoid it."],
      ["What is subtext?", "The feeling or want under the words, not said aloud."],
      ["A quick way to put a feeling under the words?", "Write the feeling, delete it, write what they'd say to avoid it, add one action."],
      ["What should you decide before writing a dialogue scene?", "What each speaker wants in it."]
    ]
  };

  C["creatives:W3.3"] = {
    pages: [
      { t: "How VNs carry a scene", blocks: [
        { p: "A visual novel's text box carries almost everything: who speaks, what they say, and short narration." },
        { list: ["Each line has a speaker label (or none for narration).", "Expressions and actions are beats between lines.", "The art does the description, so the text stays lean."] },
        { callout: { t: "This lesson's skill", body: "A scene that reads from its lines and beats alone." } }
      ] },
      { t: "A small script format", blocks: [
        { ex: { label: "Script", text: "The club room is empty except for Yui.\nYUI: You're late.\n[Sora sets down two cans of melon soda.]\nSORA: Peace offering.\n[Yui glances at the cans. Closes the sketchbook.]\nYUI: Fine. Sit.", note: "NAME: line. [Beats] on their own lines. Narration has no name." } },
        { callout: { t: "This is your own VN one day", body: "The Japanese space's VN scenes use the same idea: lines, speakers and beats over art." } }
      ] },
      { t: "Beats change how a line lands", blocks: [
        { pair: { before: "KAITO: They're shoes.\nRIN: They WERE shoes.", after: "KAITO: They're shoes.\n[Rin lifts one foot. Mud to the ankle.]\nRIN: They WERE shoes.", why: "The beat makes the line funny." } },
        { steps: ["Read the script aloud without beats.", "Find a line that could land two ways.", "Add the one beat that makes it land the way you want."] }
      ] },
      { t: "Expected beginner output", blocks: [
        { beginner: { text: "Yui is in the club room drawing.\nYUI: You're late.\nSORA: Peace offering. [he puts down two sodas]\n[Yui looks at the cans]\nYUI: Fine. Sit.", note: "One beat is tucked onto a line instead of its own. But the speakers are clear and \"[Yui looks at the cans]\" changes how \"Fine\" lands: a pass for this unit." } }
      ] },
      { t: "Quick reference", blocks: [
        { list: ["NAME: line.", "[Beats] on their own lines.", "Narration: no name.", "Let the art describe.", "One beat can change a line."] }
      ] }
    ],
    flashcards: [
      ["How does a VN script show who speaks?", "A speaker label before each line."],
      ["What is a beat in a script?", "A short action or expression between lines."],
      ["Why can VN text stay lean?", "The art does the description."],
      ["How is narration marked in this script format?", "It has no speaker label."],
      ["What can one beat do?", "Change how the next line lands: funny, sad, tense."]
    ]
  };
})();
