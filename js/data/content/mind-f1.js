/* Kurenai OS — data/content/mind-f1.js
   Mind · Foundation · F1, What makes an argument good (docs/mind-plan.md §2.3; design turn 32).
   AUTHORED and original. Eight lessons on the six-page contract (Hook · The idea · The case · The
   pushback · Check · Close), the unit's concepts with their cards, its checkpoint, and one
   Socratic dialogue a lesson (KOS.mindTree; every tree passes tools/mind_tree_check.mjs).

   Page blocks: { story, note } · { vote: { q, options, note } } · { h } · { p } · { list } ·
   { std: { premises, conclusion, hidden } } · { map: { rows: [{ t, j, d }], caption } } ·
   { table: { head, rows } } · { evidence: { tag, t, body, src } } · { callout: { t, body } } ·
   { notes: [...] } · { concepts: [ids] }. A "check" page draws the lesson's check; "close" draws
   the vote's return, the one prompt, "For your stories", the dialogue and the quick reference.  */
(function () {
  "use strict";
  var M = window.KOS_MIND;
  if (!M) return;
  var C = M.concept, L = M.lesson;

  /* ================= the concepts ================= */
  C({ id: "argument", name: "Argument", lesson: "F1.1", gist: "One or more reasons offered for a claim.",
    keyPoints: ["An argument offers reasons for a claim", "The claim argued for is the conclusion", "The reasons are the premises", "A bare opinion or a story is not an argument"],
    cards: [["In logic, what is an argument?", "One or more reasons (premises) offered in support of a claim (the conclusion)."],
      ["Is \"I just think pineapple on pizza is wrong\" an argument?", "No. It states a claim and gives no reason for it."]],
    confusables: ["explanation"], links: [{ to: "premise", type: "has part" }, { to: "conclusion", type: "has part" }] });
  C({ id: "premise", name: "Premise", lesson: "F1.1", gist: "A claim offered as a reason for the conclusion.",
    keyPoints: ["A premise is a reason given for the conclusion", "Words like because and since often mark one", "An argument may have one premise or many"],
    cards: [["What is a premise?", "A claim offered as a reason for the conclusion."],
      ["Name two words that often signal a premise.", "Because, since, given that, for, as."]], links: [{ to: "argument", type: "is part of" }] });
  C({ id: "conclusion", name: "Conclusion", lesson: "F1.1", gist: "The claim the reasons are meant to support.",
    keyPoints: ["The conclusion is what the reasons are trying to prove", "Words like so and therefore often mark it", "It can come first, last or in the middle"],
    cards: [["Name two words that often signal a conclusion.", "So, therefore, hence, which shows that, it follows that."],
      ["Where in an argument does the conclusion appear?", "Anywhere: first, last or in the middle. Find it by asking what the rest is trying to prove."]], links: [{ to: "argument", type: "is part of" }] });
  C({ id: "standard-form", name: "Standard form", lesson: "F1.2", gist: "Each premise on its own numbered line, then the conclusion under a line.",
    keyPoints: ["Each premise goes on its own numbered line", "The conclusion goes under a line, after ∴", "Cut the rhetoric and keep the claims", "Writing it out shows what the argument needs"],
    cards: [["What is standard form?", "Each premise on its own numbered line, then the conclusion below a line, introduced by ∴ (therefore)."],
      ["Why write an argument in standard form?", "It strips out the rhetoric so you can see exactly which claims you would have to accept, and test each one."]],
    links: [{ to: "hidden-premise", type: "shows" }] });
  C({ id: "hidden-premise", name: "Hidden premise", lesson: "F1.2", gist: "An assumption the argument needs but does not say.",
    keyPoints: ["Some premises are left unsaid", "The argument still needs them to work", "Writing them out is often where the disagreement is"],
    cards: [["What is a hidden premise?", "An assumption an argument needs but does not state."],
      ["\"She's a vegetarian, so she won't like this restaurant.\" What is the hidden premise?", "That the restaurant has nothing a vegetarian would want, for instance that it is a steakhouse."]],
    links: [{ to: "standard-form", type: "found by" }] });
  C({ id: "validity", name: "Validity", lesson: "F1.3", gist: "If the premises were true, the conclusion would have to be.",
    keyPoints: ["Valid means the conclusion follows from the premises", "It is about structure, not about whether the premises are true", "A valid argument can have false premises and a false conclusion", "An invalid argument can have a true conclusion"],
    cards: [["What does it mean for an argument to be valid?", "If its premises were true, its conclusion would have to be true. Validity is about structure, not about whether the premises are true."],
      ["Can a valid argument have a false conclusion?", "Yes, if a premise is false. \"All cats can fly; Tom is a cat; so Tom can fly\" is valid."]],
    confusables: ["soundness"], links: [{ to: "soundness", type: "needed for" }, { to: "deduction", type: "the aim of" }] });
  C({ id: "soundness", name: "Soundness", lesson: "F1.3", gist: "Valid, and every premise really is true.",
    keyPoints: ["Sound means valid with true premises", "A sound argument's conclusion must be true", "To attack a valid argument, attack a premise"],
    cards: [["Valid and sound: what is the difference?", "Valid: if the premises were true, the conclusion would have to be. Sound: valid, and the premises really are true.", "distinction"],
      ["You accept that an argument is valid but reject its conclusion. What must you reject?", "At least one of its premises."]],
    confusables: ["validity"], links: [{ to: "validity", type: "needs" }] });
  C({ id: "deduction", name: "Deduction", lesson: "F1.4", gist: "Reasoning meant to guarantee its conclusion.",
    keyPoints: ["A deductive argument aims at certainty", "If it is valid and the premises are true, the conclusion cannot be false", "Adding premises never weakens a valid deduction"],
    cards: [["What does a deductive argument aim for?", "A conclusion that follows with certainty: if the premises are true, it cannot be false."]],
    confusables: ["induction"], links: [{ to: "validity", type: "judged by" }, { to: "induction", type: "contrasts with" }] });
  C({ id: "induction", name: "Induction", lesson: "F1.4", gist: "Reasoning that makes its conclusion probable, not certain.",
    keyPoints: ["An inductive argument aims at probability", "It is judged strong or weak, not valid or invalid", "New evidence can overturn it", "Most everyday and scientific reasoning is inductive"],
    cards: [["What does an inductive argument aim for?", "A conclusion made probable by the premises, not guaranteed."],
      ["\"Every swan I have seen is white, so all swans are white.\" Deductive or inductive?", "Inductive: the premises make it likely, not certain. Black swans live in Australia."],
      ["Deduction and induction: what is the difference?", "Deduction aims to guarantee its conclusion; induction aims to make it probable, and new evidence can overturn it.", "distinction"]],
    confusables: ["deduction"], links: [{ to: "deduction", type: "contrasts with" }] });
  C({ id: "straw-man", name: "Straw man", lesson: "F1.5", gist: "Attacking a weaker version of a view than the one held.",
    keyPoints: ["The view is replaced with a weaker or more extreme one", "The weaker version is then knocked down", "The real view is left untouched"],
    cards: [["What is a straw man?", "Replacing someone's view with a weaker or more extreme version of it, then attacking that instead."]],
    confusables: ["charity"], links: [{ to: "charity", type: "the opposite of" }] });
  C({ id: "ad-hominem", name: "Ad hominem", lesson: "F1.5", gist: "Attacking the person instead of the argument.",
    keyPoints: ["The arguer is attacked instead of the reasons", "A bad person can still give a good argument", "It is fair to question someone's reliability as a witness"],
    cards: [["What is an ad hominem?", "Rejecting an argument because of who is making it, not because of what it says."]] });
  C({ id: "false-dilemma", name: "False dilemma", lesson: "F1.5", gist: "Offering two options when there are more.",
    keyPoints: ["Only two options are offered", "Others are left out or ignored", "Rejecting one is taken to prove the other"],
    cards: [["What is a false dilemma?", "Presenting two options as the only ones when others exist, so that rejecting one seems to force the other."]] });
  C({ id: "bandwagon", name: "Bandwagon", lesson: "F1.5", gist: "Treating popularity as evidence that something is true or right.",
    keyPoints: ["\"Everyone does it\" is offered as the reason", "How many believe something is not evidence it is true", "Popularity can be a clue about experience, never a proof"],
    cards: [["What is the bandwagon fallacy?", "Treating how many people believe or do something as a reason it is true or right."]] });
  C({ id: "slippery-slope", name: "Slippery slope", lesson: "F1.5", gist: "Claiming one step must lead to an extreme, without showing each link.",
    keyPoints: ["A small step is said to lead to an extreme", "The links in between are not shown", "A slope argument with each link supported can be fair"],
    cards: [["What is a slippery-slope fallacy?", "Claiming that one step will inevitably lead to an extreme outcome without showing why each step follows."]] });
  C({ id: "charity", name: "Principle of charity", lesson: "F1.6", gist: "Read an argument in its most reasonable form before you criticise it.",
    keyPoints: ["Choose the most reasonable reading of what was said", "Fill gaps with the premise the person most likely meant", "Criticise that version, not a weaker one", "It is a method, not agreement"],
    cards: [["What is the principle of charity?", "When an argument is unclear, read it in its most reasonable form before you criticise it."],
      ["Charity and a straw man: how do they differ?", "Charity reads a view at its most reasonable; a straw man reads it at its weakest.", "distinction"]],
    confusables: ["straw-man", "steelman"], links: [{ to: "straw-man", type: "the opposite of" }, { to: "steelman", type: "leads to" }] });
  C({ id: "steelman", name: "Steelmanning", lesson: "F1.7", gist: "Building the strongest version of the opposing view, then answering that.",
    keyPoints: ["Make the other side's case stronger than they did", "Answer the strongest version, not the one you were given", "If you cannot answer it, you have learned something", "It goes further than charity: you add, not just interpret"],
    cards: [["What is steelmanning?", "Building the strongest version of the view you disagree with, then responding to that version."],
      ["Charity and steelmanning: what is the difference?", "Charity reads what was said at its most reasonable; steelmanning goes further and adds the best support the view could have.", "distinction"]],
    confusables: ["charity"], links: [{ to: "charity", type: "goes further than" }, { to: "straw-man", type: "the opposite of" }] });

  /* small builders for the dialogues: q(who, face, say, choices, other), c(text, keys, next, took) */
  function c(t, keys, next, took) { return { t: t, keys: keys, next: next, took: took }; }
  function q(who, face, say, choices, other) { return { who: who, face: face, say: say, choices: choices, other: other }; }
  function end(who, face, say) { return { end: true, who: who, face: face, say: say }; }

  /* ================= F1.1 Claims, reasons and conclusions ================= */
  L({ id: "F1.1", n: 1, unit: "F1", title: "Claims, reasons and conclusions", kind: "explain",
    can: "Tell an argument from an opinion, and find its premises and conclusion.",
    concepts: ["argument", "premise", "conclusion"], main: "argument", sittings: [2],
    prompt: { q: "Explain what an argument is to a friend." },
    pages: [
      { t: "Hook", kind: "hook", blocks: [
        { story: "Two characters argue across a café table in the visual novel you are playing. One says, \"You always do this.\" The other says, \"Because you never listen.\" Three choices appear on screen, and all three are just louder versions of the same line." },
        { note: "A kind of story you know · no title named, nothing spoiled" },
        { vote: { q: "Is \"You always do this\" an argument?", options: ["Yes: it is a strong point", "Not yet: it is a claim with no reason", "No: arguments have to be polite"], note: "Quick vote. Your answer is kept, and the last page comes back to it." } }
      ] },
      { t: "The idea", blocks: [
        { h: "An argument is reasons for a claim" },
        { list: ["In logic, an argument is not a quarrel.", "It is one or more reasons offered for a claim.", "The claim being argued for is the conclusion.", "The reasons offered for it are the premises."] },
        { map: { rows: [{ t: "We should leave before six.", j: null, d: 0 }, { t: "The last train is at six-fifteen.", j: "because", d: 1 }, { t: "It takes twenty minutes to walk to the station.", j: "because", d: 1 }], caption: "One conclusion at the top; each reason hangs from what it supports." } },
        { h: "Words that point" },
        { table: { head: ["Often marks a premise", "Often marks a conclusion"], rows: [["because, since, for", "so, therefore, hence"], ["given that, as", "which shows that, it follows that"]] } },
        { list: ["The words help, but they are not required.", "Find the conclusion by asking: what is the rest trying to prove?"] },
        { concepts: ["argument", "premise", "conclusion"] }
      ] },
      { t: "The case", blocks: [
        { h: "Three lines, three verdicts" },
        { p: "Each of these is about the same film. Only one is an argument." },
        { table: { head: ["Line", "Verdict"], rows: [["\"That ending was terrible.\"", "A claim. No reason is given."], ["\"First the hero saved the town, and then she left.\"", "A story. Nothing is offered as proof."], ["\"The ending was weak: it threw away the hero's whole arc.\"", "An argument. The second half is a reason for the first."]] } },
        { callout: { t: "A test that works", body: "Put \"because\" between two parts. If it still makes sense and one part is meant to support the other, you have found a premise and a conclusion." } }
      ] },
      { t: "The pushback", blocks: [
        { h: "Isn't an explanation an argument too?" },
        { p: "\"The milk went sour because it was left out\" uses because, but nobody is trying to prove the milk went sour. Everyone already agrees it did." },
        { list: ["An argument tries to show THAT something is true.", "An explanation tries to show WHY something already accepted is true.", "The same words can do either job; ask what is in doubt."] }
      ] },
      { t: "Check", kind: "check" },
      { t: "Close", kind: "close" }
    ],
    check: [
      { q: "In \"We should leave now, since the shop shuts at five\", what is the conclusion?", options: ["We should leave now", "The shop shuts at five", "Since"], a: 0, why: "Leaving now is what the line is trying to show; the shop closing is the reason given for it." },
      { q: "Which of these is an argument?", options: ["\"Cats are better than dogs.\"", "\"Cats are easier to keep, because they don't need walking.\"", "\"I got a cat last year.\""], a: 1, why: "Only the second offers a reason (no walking) for a claim (easier to keep)." },
      { q: "Apply · A character says: \"Nobody trusts the captain. She lied about the map, and she hid the radio.\" What is the conclusion?", options: ["She lied about the map", "Nobody trusts the captain", "She hid the radio"], a: 1, apply: true, concept: "conclusion", why: "The two things she did are offered as the reasons; the distrust is what they are meant to support." }
    ],
    stories: "A character who only repeats a claim louder is losing the argument without knowing it. Give your clever character the habit of answering \"why?\" before anyone asks.",
    ref: "An argument is reasons (premises) offered for a claim (the conclusion). Find the conclusion by asking what the rest is trying to prove.",
    dialogue: { id: "F1.1", title: "Is every disagreement an argument?", start: "a",
      lead: "",
      nodes: {
        a: q("kurenai", "curious", "If two people shout \"Yes it is!\" and \"No it isn't!\" at each other for ten minutes, have they had an argument?", [
          c("Yes. They disagreed.", ["yes", "disagre", "fight"], "b1", "You began with the everyday sense: a disagreement is an argument."),
          c("No. Nobody gave a reason.", ["no", "reason", "nobody"], "b2", "You began with the logician's sense: no reasons, no argument."),
          c("It depends what you mean by argument.", ["depend", "mean", "sense"], "b2", "You noticed the word has two senses before answering.")],
          c("", [], "b1", "You started from your own words.")),
        b1: q("kurenai", "thinking", "Then suppose one of them finally says, \"No it isn't, because the bus timetable changed in May.\" Has anything new happened?", [
          c("Yes: now there is a reason to check.", ["reason", "check", "yes"], "c", "When a reason arrived, you saw something new had happened."),
          c("Not really, it's the same fight.", ["same", "not", "fight"], "c", "At first you held that a reason changed nothing.")],
          c("", [], "c", "You weighed what a reason adds.")),
        b2: q("kurenai", "pleased", "Good. So what would one of them have to add for it to become an argument in the logician's sense?", [
          c("A reason for their side.", ["reason", "because", "why"], "c", "You named the missing piece: a reason."),
          c("Evidence that could be checked.", ["evidence", "check", "proof"], "c", "You asked for evidence that could be checked.")],
          c("", [], "c", "You looked for what was missing.")),
        c: q("ren", "amused", "Here is my problem with all this. Half the arguments in the stories I read are just a character being sure. If certainty works on the page, why bother with reasons?", [
          c("Because a reason can be checked and certainty can't.", ["check", "test", "reason"], "e1", "Against Ren, you held that a reason can be tested and certainty cannot."),
          c("Because certainty only works on people who already agree.", ["agree", "already", "convince"], "e1", "Against Ren, you said certainty only moves people who already agree."),
          c("He has a point: certainty is persuasive.", ["point", "persua", "right"], "e2", "You granted Ren that certainty persuades.")],
          c("", [], "e1", "You answered Ren in your own words.")),
        e1: end("kurenai", "pleased", "That is the line logicians draw: persuasion is about people, an argument is about reasons."),
        e2: end("kurenai", "thinking", "It persuades, for a while. The question for the rest of the unit is whether it should.")
      } }
  });

  /* ================= F1.2 Standard form ================= */
  L({ id: "F1.2", n: 2, unit: "F1", title: "Standard form: writing an argument out", kind: "explain",
    can: "Write an argument in standard form and find the premise it leaves unsaid.",
    concepts: ["standard-form", "hidden-premise"], main: "standard-form", sittings: [2],
    prompt: { q: "Explain standard form to a friend, and say why it helps." },
    pages: [
      { t: "Hook", kind: "hook", blocks: [
        { story: "In the light novel you are reading, the detective gathers everyone in the library and talks for eleven pages. By the end you are sure the butler did it, but if someone asked you why, you could not say which part of the speech actually proved it." },
        { note: "A kind of story you know · no title named, nothing spoiled" },
        { vote: { q: "After a long, convincing speech, how often can you say exactly what it proved and how?", options: ["Usually: I follow it", "Sometimes", "Rarely: I just feel convinced"], note: "Quick vote. Your answer is kept, and the last page comes back to it." } }
      ] },
      { t: "The idea", blocks: [
        { h: "Strip it down to the claims" },
        { list: ["Standard form puts each premise on its own numbered line.", "The conclusion goes under a line, after ∴ (therefore).", "Rhetoric, jokes and repetition are cut.", "What is left is exactly what you would have to accept."] },
        { std: { premises: ["The window was locked from the inside.", "Only the butler had a key to the study."], conclusion: "The butler was in the study." } },
        { h: "The premise nobody said" },
        { list: ["Many arguments rely on something unstated: a hidden premise.", "Writing the argument out makes the gap visible.", "Often the real disagreement is about that hidden premise."] },
        { concepts: ["standard-form", "hidden-premise"] }
      ] },
      { t: "The case", blocks: [
        { h: "Filling the gap" },
        { p: "\"She's a vegetarian, so she won't like that restaurant.\" In standard form it is one premise short:" },
        { std: { premises: ["She is a vegetarian."], hidden: "That restaurant serves almost nothing a vegetarian would eat.", conclusion: "She won't like that restaurant." } },
        { list: ["Without the hidden premise, the conclusion does not follow.", "With it written out, you can check it. Perhaps the restaurant has a good vegetarian menu."] },
        { callout: { t: "Fill gaps kindly", body: "Supply the premise the speaker most likely meant, not the silliest one that would fit. Lesson F1.6 gives this a name: charity." } }
      ] },
      { t: "The pushback", blocks: [
        { h: "Doesn't this flatten everything?" },
        { p: "A speech can carry tone, trust and feeling that a numbered list loses. Some people think standard form makes every argument look cold." },
        { list: ["True: standard form is not how anyone should talk.", "It is a tool for checking, used before you reply.", "You put the tone back when you answer. You just know what you are answering."] }
      ] },
      { t: "Check", kind: "check" },
      { t: "Close", kind: "close" }
    ],
    check: [
      { q: "In standard form, where does the conclusion go?", options: ["First, in bold", "Under a line, after the numbered premises", "Wherever the speaker put it"], a: 1, why: "Premises are numbered first; the conclusion sits under a line, introduced by ∴." },
      { q: "\"It's a horror film, so my sister will hate it.\" What is the hidden premise?", options: ["Horror films are scary", "My sister hates horror films", "It is a film"], a: 1, why: "Without \"my sister hates horror films\", nothing links the film's genre to her reaction." },
      { q: "Apply · \"He studied Japanese for a year, so he can read this menu.\" Which hidden premise would make this work?", options: ["A year of study is enough to read a menu", "Menus are written in Japanese", "He likes Japanese food"], a: 0, apply: true, concept: "hidden-premise", why: "The argument needs a link between a year of study and reading a menu; that link is the unstated premise, and it is exactly what you might doubt." }
    ],
    stories: "A detective's reveal lands when the reader can check each step in their head. Plant every premise earlier in the story; let the hidden one be the thing the reader skimmed past.",
    ref: "Standard form: numbered premises, then the conclusion under a line (∴). A hidden premise is one the argument needs but does not say.",
    dialogue: { id: "F1.2", title: "Is cutting the rhetoric fair?", start: "a",
      nodes: {
        a: q("kurenai", "thinking", "When you put someone's speech into standard form, you throw most of their words away. Is that fair to them?", [
          c("Yes, if the claims are kept.", ["claim", "kept", "yes", "fair"], "b", "You held that cutting is fair if every claim survives."),
          c("No, the tone is part of what they meant.", ["tone", "mean", "no", "feel"], "b", "You worried that the tone carries part of the meaning."),
          c("Only if they would agree with my version.", ["agree", "their", "check", "version"], "b", "You set a test: would they sign your version?")],
          c("", [], "b", "You answered in your own words.")),
        b: q("ren", "sceptical", "Try this one. \"You can't trust anything that app says. It's made by a company.\" What's the hidden premise, and would she admit to it?", [
          c("Anything a company makes can't be trusted.", ["company", "anything", "trust"], "c", "You dug out the hidden premise: nothing a company makes can be trusted."),
          c("Companies only care about money.", ["money", "profit", "care"], "c", "You found a softer hidden premise: companies only care about profit."),
          c("I'm not sure there is one.", ["not sure", "none", "no"], "c", "You were not sure a premise was hiding there.")],
          c("", [], "c", "You looked for what the line assumed.")),
        c: q("kurenai", "curious", "Once the hidden premise is written out, what usually happens to the disagreement?", [
          c("It moves onto the hidden premise.", ["move", "hidden", "premise", "shift"], "e1", "You saw that the disagreement moves onto what was unsaid."),
          c("It gets easier to settle.", ["easier", "settle", "clear"], "e1", "You saw that naming it makes the disagreement easier to settle."),
          c("It gets worse: now someone looks silly.", ["worse", "silly", "embarrass"], "e2", "You saw the cost: naming it can embarrass someone.")],
          c("", [], "e1", "You thought about what naming it does.")),
        e1: end("kurenai", "pleased", "That is the use of standard form: it shows where the real disagreement is."),
        e2: end("kurenai", "thinking", "Which is why F1.6 asks you to fill the gap with the premise they most likely meant.")
      } }
  });

  /* ================= F1.3 Valid is not the same as true ================= */
  L({ id: "F1.3", n: 3, unit: "F1", title: "Valid is not the same as true", kind: "explain",
    can: "Tell a valid argument from a sound one, and spot belief bias in yourself.",
    concepts: ["validity", "soundness"], main: "validity", sittings: [2],
    prompt: { q: "Explain the difference between valid and sound to a friend." },
    pages: [
      { t: "Hook", kind: "hook", blocks: [
        { story: "A character in a mystery reasons: \"All the guests who knew the code were in the ballroom. Mika was in the ballroom. So Mika knew the code.\" The reader nods. Two chapters later it turns out half the ballroom never knew the code at all." },
        { note: "A kind of story you know · no title named, nothing spoiled" },
        { vote: { q: "Did Mika's conclusion follow from what the character said?", options: ["Yes, it follows", "No, it doesn't follow", "I'm not sure"], note: "Quick vote. Your answer is kept, and the last page comes back to it." } }
      ] },
      { t: "The idea", blocks: [
        { h: "Two questions, asked separately" },
        { list: ["Valid: IF the premises were true, would the conclusion have to be?", "Sound: valid, AND are the premises actually true?", "Validity is about the shape of the reasoning.", "Truth is about the world."] },
        { table: { head: ["", "Premises true", "A premise false"], rows: [["Valid", "Sound: the conclusion must be true", "Valid but unsound"], ["Invalid", "Unsound: true premises, no guarantee", "Unsound"]] } },
        { std: { premises: ["All cats can fly.", "Tom is a cat."], conclusion: "Tom can fly." } },
        { notes: ["Valid: if both premises were true, Tom would fly.", "Unsound: the first premise is false."] },
        { concepts: ["validity", "soundness"] }
      ] },
      { t: "The case", blocks: [
        { h: "Belief gets in the way" },
        { evidence: { tag: "robust", t: "Belief bias", body: "People judge an argument valid more often when they already believe its conclusion. In the classic study, students accepted a VALID argument with an unbelievable conclusion far less often than an INVALID one with a believable conclusion.", src: "Evans, Barston & Pollard 1983, syllogisms; replicated many times since" } },
        { table: { head: ["The argument was", "Conclusion believable", "Conclusion unbelievable"], rows: [["Valid", "89% accepted", "56% accepted"], ["Invalid", "71% accepted", "10% accepted"]] } },
        { list: ["71% accepted an argument that did not follow, because its conclusion sounded right.", "Checking validity means asking the IF question while ignoring what you believe."] },
        { callout: { t: "Back to the ballroom", body: "\"All who knew the code were in the ballroom; Mika was in the ballroom\" does not make Mika one of those who knew. Plenty of people were in the ballroom. The argument is invalid, even before anyone checks the guest list." } }
      ] },
      { t: "The pushback", blocks: [
        { h: "Why care about validity at all?" },
        { p: "If what matters is whether the conclusion is true, why spend time on a property that false arguments can have?" },
        { list: ["Because validity tells you where to look.", "If an argument is valid and you reject its conclusion, at least one premise must be false.", "So you stop arguing about the conclusion and test the premises."] }
      ] },
      { t: "Check", kind: "check" },
      { t: "Close", kind: "close" }
    ],
    check: [
      { q: "\"All fish can climb trees. A salmon is a fish. So a salmon can climb trees.\" Is it valid?", options: ["Valid, but not sound", "Sound", "Invalid"], a: 0, why: "If the premises were true, the conclusion would follow, so it is valid; the first premise is false, so it is not sound." },
      { q: "Can an invalid argument have a true conclusion?", options: ["No, never", "Yes: the conclusion can be true for other reasons", "Only if the premises are false"], a: 1, why: "Validity is about whether the conclusion follows. A true conclusion can sit at the end of a bad argument." },
      { q: "Apply · You agree an argument is valid, but you think its conclusion is false. What must you also think?", options: ["That it is invalid after all", "That at least one premise is false", "That the conclusion is true"], a: 1, apply: true, concept: "soundness", why: "In a valid argument true premises force a true conclusion, so a false conclusion means a false premise." },
      { q: "Apply · \"Most people who are good at chess are good at maths. Ana is good at maths. So Ana is good at chess.\" What is wrong?", options: ["A premise is false", "It is invalid: being good at maths doesn't make you one of the chess players", "Nothing"], a: 1, apply: true, concept: "validity", why: "Even if both premises are true, the conclusion does not follow. It runs the link the wrong way round." }
    ],
    stories: "A twist works best when the reader followed a valid-looking chain built on one false premise you planted early. Give the reader every step, and hide the falsehood in a premise everyone believed.",
    ref: "Valid: if the premises were true, the conclusion would have to be. Sound: valid with true premises. Belief bias: we accept arguments whose conclusions we already believe.",
    dialogue: { id: "F1.3", title: "Can a good argument have a false conclusion?", start: "a",
      nodes: {
        a: q("kurenai", "curious", "Is \"All cats can fly; Tom is a cat; so Tom can fly\" a good argument?", [
          c("No. Cats can't fly.", ["no", "fly", "false"], "b1", "You judged it by its false premise."),
          c("Yes, in one sense: it follows.", ["follow", "valid", "sense"], "b2", "You saw that it follows, whatever cats can do."),
          c("Good in shape, bad in content.", ["shape", "content", "both"], "b2", "You split the question into shape and content straight away.")],
          c("", [], "b1", "You judged it in your own words.")),
        b1: q("kurenai", "thinking", "Then try this: if cats COULD fly, would Tom have to be able to fly?", [
          c("Yes.", ["yes", "would", "have"], "c", "Asked the IF question, you saw the conclusion would follow."),
          c("Not necessarily. Tom might be ill.", ["ill", "necessar", "might"], "c", "You looked for a way out even when the premises held.")],
          c("", [], "c", "You worked through the IF question.")),
        b2: q("kurenai", "pleased", "So which part would you attack, if you wanted to show the conclusion is false?", [
          c("The premise that all cats can fly.", ["cats", "fly", "first", "all cats"], "c", "You knew to attack the false premise."),
          c("The step from the premises.", ["step", "logic", "follow"], "c", "You went for the step, though it holds.")],
          c("", [], "c", "You picked a target.")),
        c: q("ren", "sceptical", "Fine for cats. But I believe in plenty of things because the conclusions feel right. Is that actually a problem?", [
          c("Yes. Belief bias makes me miss bad arguments.", ["bias", "miss", "yes", "bad"], "e1", "Against Ren, you said that feeling right lets bad arguments through."),
          c("Only when it matters.", ["matter", "only", "sometimes"], "e2", "You told Ren it is only a problem when the stakes are high."),
          c("No. Feelings are evidence too.", ["feeling", "evidence", "no"], "e2", "You defended feelings as a kind of evidence.")],
          c("", [], "e1", "You answered Ren in your own words.")),
        e1: end("kurenai", "pleased", "The study's point exactly: we pass invalid arguments that end where we already were."),
        e2: end("kurenai", "thinking", "Hold that thought for F2, which asks how much a feeling should count as evidence.")
      } }
  });

  /* ================= F1.4 Deduction and induction ================= */
  L({ id: "F1.4", n: 4, unit: "F1", title: "Deduction and induction", kind: "explain",
    can: "Tell reasoning that guarantees from reasoning that makes likely, and judge each fairly.",
    concepts: ["deduction", "induction"], main: "induction", sittings: [2],
    prompt: { q: "Explain the difference between deduction and induction to a friend." },
    pages: [
      { t: "Hook", kind: "hook", blocks: [
        { story: "A character in the game you play has died every time she trusted the stranger in the red coat. On her fifth run she meets him again. The player shouts at the screen: \"Don't trust him!\"" },
        { note: "A kind of story you know · no title named, nothing spoiled" },
        { vote: { q: "Does the player KNOW the stranger will betray her this time?", options: ["Yes, after four times", "No, but it's very likely", "No, it tells us nothing"], note: "Quick vote. Your answer is kept, and the last page comes back to it." } }
      ] },
      { t: "The idea", blocks: [
        { h: "Two ways to support a conclusion" },
        { table: { head: ["", "Deduction", "Induction"], rows: [["Aims for", "certainty", "probability"], ["Judged as", "valid or invalid", "strong or weak"], ["New evidence", "can't overturn a sound one", "can overturn it"], ["Example", "All humans are mortal; I am human; so I am mortal", "The sun has risen every day; so it will rise tomorrow"]] } },
        { list: ["Most everyday and scientific reasoning is induction.", "Induction is not worse: it is a different job.", "Its honest form says \"probably\"."] },
        { concepts: ["deduction", "induction"] }
      ] },
      { t: "The case", blocks: [
        { h: "The swans" },
        { p: "For centuries, Europeans who had only seen white swans reasoned:" },
        { std: { premises: ["Every swan anyone here has seen is white."], conclusion: "All swans are white." } },
        { list: ["A strong induction for its time: thousands of sightings, no exceptions.", "Then black swans were found in Australia.", "The argument was not invalid: it was never meant to be deductive.", "It was overturned by new evidence, which is exactly what induction allows."] },
        { callout: { t: "The red coat", body: "Four betrayals in four meetings is strong inductive evidence. It makes betrayal very likely; it cannot make it certain. A story can exploit exactly that gap." } }
      ] },
      { t: "The pushback", blocks: [
        { h: "Can induction ever be justified?" },
        { p: "The philosopher David Hume asked why the past should tell us anything about the future at all. Any argument that it does seems to assume it does." },
        { list: ["Nobody has a knock-down answer. P3 comes back to it.", "In practice, everyone, including Hume, keeps reasoning inductively.", "The fair response is to hold inductive conclusions with the right amount of confidence."] }
      ] },
      { t: "Check", kind: "check" },
      { t: "Close", kind: "close" }
    ],
    check: [
      { q: "\"Every test I've taken in this room has been hard, so the next one will be.\" What kind of reasoning is it?", options: ["Deductive", "Inductive", "Neither"], a: 1, why: "It moves from past cases to a probable future case." },
      { q: "An inductive argument's conclusion turns out false. What follows?", options: ["It was invalid", "It may still have been a strong argument", "Its premises must be false"], a: 1, why: "Induction only makes its conclusion likely; a strong induction can still end in a false conclusion." },
      { q: "Apply · A doctor reasons: \"Ninety per cent of patients with these symptoms have the flu, so you probably have the flu.\" How should it be judged?", options: ["As a valid deduction", "As a strong induction", "As a fallacy"], a: 1, apply: true, concept: "induction", why: "It says \"probably\" and rests on a base rate: a strong inductive argument, not a guarantee." }
    ],
    stories: "A pattern the reader has seen four times is a promise. Break it on the fifth, and make sure the reader can look back and see it was only ever induction.",
    ref: "Deduction aims to guarantee its conclusion (valid or invalid). Induction makes it probable (strong or weak), and new evidence can overturn it.",
    dialogue: { id: "F1.4", title: "Is induction second-best?", start: "a",
      nodes: {
        a: q("kurenai", "curious", "Deduction can guarantee its conclusion; induction only makes it likely. Does that make induction second-best?", [
          c("Yes. Certainty is better.", ["yes", "certain", "better"], "b1", "You started by ranking certainty first."),
          c("No. They do different jobs.", ["different", "job", "no"], "b2", "You started by saying they do different jobs."),
          c("Only when certainty is possible.", ["possible", "only", "when"], "b2", "You started by saying it depends whether certainty is on offer.")],
          c("", [], "b1", "You started in your own words.")),
        b1: q("kurenai", "thinking", "Then how would you know, with certainty, that your bus will come tomorrow?", [
          c("I wouldn't. I'd be using induction.", ["induct", "wouldnt", "probab"], "c", "You noticed you would be using induction to catch the bus."),
          c("From the timetable.", ["timetable", "schedule"], "c", "You pointed to the timetable, itself a promise based on the past.")],
          c("", [], "c", "You thought about the bus.")),
        b2: q("kurenai", "pleased", "What job could deduction never do for a scientist?", [
          c("Discover something new about the world.", ["new", "discover", "world"], "c", "You saw that deduction cannot discover new facts on its own."),
          c("Make predictions.", ["predict", "future"], "c", "You said deduction alone cannot predict.")],
          c("", [], "c", "You thought about science.")),
        c: q("ren", "amused", "So if four betrayals only make the fifth likely, the heroine who trusts him again isn't being stupid. She's just betting against the odds.", [
          c("She's still being unreasonable.", ["unreason", "stupid", "still"], "e1", "Against Ren, you said betting against strong evidence is still unreasonable."),
          c("Fair. Likely isn't certain.", ["fair", "likely", "certain"], "e2", "You granted Ren that likely is not certain."),
          c("It depends what she knows that we don't.", ["know", "depend", "secret"], "e2", "You told Ren she might have evidence we don't.")],
          c("", [], "e1", "You answered Ren in your own words.")),
        e1: end("kurenai", "pleased", "Reasonable belief follows the strength of the evidence, even when certainty is out of reach."),
        e2: end("kurenai", "thinking", "Then the question is how much evidence should move her. F2 gives that question its numbers.")
      } }
  });

  /* ================= F1.5 Five fallacies you will meet weekly ================= */
  L({ id: "F1.5", n: 5, unit: "F1", title: "Five fallacies you will meet weekly", kind: "explain",
    can: "Name five common fallacies when you meet them.",
    concepts: ["straw-man", "ad-hominem", "false-dilemma", "bandwagon", "slippery-slope"], main: null, sittings: [2],
    pages: [
      { t: "Hook", kind: "hook", blocks: [
        { story: "In the group chat, someone suggests the class tries a new revision app. Within a minute: \"So you think teachers are useless now?\", \"Says the person who failed the mock\", and \"Everyone's using the old one anyway.\"" },
        { note: "A kind of story you know · no title named, nothing spoiled" },
        { vote: { q: "Did any of those three replies actually answer the suggestion?", options: ["Yes, all of them", "One of them did", "None of them did"], note: "Quick vote. Your answer is kept, and the last page comes back to it." } }
      ] },
      { t: "The idea", blocks: [
        { h: "A fallacy is a bad move that looks like a good one" },
        { table: { head: ["Fallacy", "The move", "In one line"], rows: [
          ["Straw man", "Attack a weaker version of the view", "\"So you think teachers are useless?\""],
          ["Ad hominem", "Attack the person, not the reasons", "\"Says the person who failed the mock.\""],
          ["False dilemma", "Offer two options when there are more", "\"Either you revise all weekend or you fail.\""],
          ["Bandwagon", "Treat popularity as proof", "\"Everyone's using the old one.\""],
          ["Slippery slope", "Claim one step leads to an extreme, with no links shown", "\"Let him skip one lesson and he'll drop out.\""]] } },
        { list: ["Each one changes the subject from the reasons.", "Naming it is not a win. It is a way to get back to the reasons."] },
        { concepts: ["straw-man", "ad-hominem", "false-dilemma", "bandwagon", "slippery-slope"] }
      ] },
      { t: "The case", blocks: [
        { h: "Why the bandwagon works on us" },
        { evidence: { tag: "robust", t: "Conformity to a group", body: "When a group of actors all gave an obviously wrong answer about which line matched another, about a third of real participants' answers went along with the group, and about three quarters of people did so at least once.", src: "Asch 1951, 1956; repeated in many countries, usually weaker since the 1950s" } },
        { list: ["Going along with others is often sensible: they may know something.", "It becomes a fallacy when \"everyone does it\" is offered as the reason something is true.", "Ask: what do the others know that I don't?"] }
      ] },
      { t: "The pushback", blocks: [
        { h: "Not every appeal to the person is a fallacy" },
        { list: ["\"Don't trust his review: the company paid him\" questions a witness's reliability. That is fair.", "\"His argument is wrong because he's annoying\" is the fallacy.", "A slope with every link supported is an argument, not a fallacy.", "Calling \"fallacy\" too fast is its own bad move: it ends the conversation instead of answering."] }
      ] },
      { t: "Check", kind: "check" },
      { t: "Close", kind: "close" }
    ],
    check: [
      { q: "\"You want later school starts? So you think students should just sleep all day?\" Which fallacy?", options: ["Bandwagon", "Straw man", "Ad hominem"], a: 1, why: "A modest view (later starts) is swapped for an extreme one (sleep all day), which is then attacked." },
      { q: "\"Either you're with us or you're against us.\" Which fallacy?", options: ["False dilemma", "Slippery slope", "Straw man"], a: 0, why: "Only two options are offered; you could be neutral, partly with them, or undecided." },
      { q: "Apply · \"Why listen to her about climate? She flew to Spain last summer.\" Which fallacy?", options: ["Bandwagon", "Ad hominem", "False dilemma"], a: 1, apply: true, concept: "ad-hominem", why: "Her flight says nothing about whether her argument is right; the person is attacked instead." },
      { q: "Apply · \"If we let students use calculators, soon nobody will be able to add up.\" Which fallacy?", options: ["Slippery slope", "Straw man", "Bandwagon"], a: 0, apply: true, concept: "slippery-slope", why: "One step is said to lead to an extreme with none of the links shown." }
    ],
    field: [
      { line: "\"Everyone in our class has already joined the club. You're not going to be the only one who doesn't, are you?\"", a: "bandwagon", options: ["bandwagon", "straw-man", "false-dilemma", "ad-hominem"] },
      { line: "\"If we let the first years use the common room, next they'll want the staff room.\"", a: "slippery-slope", options: ["slippery-slope", "bandwagon", "ad-hominem", "straw-man"] },
      { line: "\"You think homework should be shorter? So you want us to learn nothing.\"", a: "straw-man", options: ["straw-man", "false-dilemma", "slippery-slope", "bandwagon"] },
      { line: "\"Either you buy the premium pass or you'll never finish the event.\"", a: "false-dilemma", options: ["false-dilemma", "bandwagon", "straw-man", "ad-hominem"] },
      { line: "\"Don't listen to his advice on revision. Have you seen his handwriting?\"", a: "ad-hominem", options: ["ad-hominem", "straw-man", "slippery-slope", "false-dilemma"] }
    ],
    stories: "A villain who wins arguments with fallacies is easy to write and easy to beat. Give yours one real argument, and let the hero notice the difference.",
    ref: "Straw man: a weaker version attacked. Ad hominem: the person attacked. False dilemma: two options where there are more. Bandwagon: popularity as proof. Slippery slope: an extreme with no links shown.",
    dialogue: { id: "F1.5", title: "Is naming a fallacy a win?", start: "a",
      nodes: {
        a: q("ren", "amused", "I've started shouting \"straw man!\" in the group chat. I'm undefeated. Is that how this works?", [
          c("No. Naming it isn't answering.", ["answer", "no", "naming"], "b1", "You told Ren that naming a fallacy is not the same as answering."),
          c("Yes, if it really was one.", ["yes", "really", "was"], "b2", "You backed Ren, if the call was accurate."),
          c("It depends how you say it.", ["depend", "how", "say"], "b1", "You said the way you call it matters.")],
          c("", [], "b1", "You answered Ren in your own words.")),
        b1: q("kurenai", "thinking", "Then what should Ren do after spotting a straw man?", [
          c("Restate the real view, then answer it.", ["restate", "real", "view"], "c", "You said to restate the real view and answer it."),
          c("Ask what they actually meant.", ["ask", "meant", "question"], "c", "You said to ask what they actually meant.")],
          c("", [], "c", "You suggested what comes next.")),
        b2: q("kurenai", "curious", "Suppose it was a straw man. Has Ren shown that his own view is right?", [
          c("No. Only that their reply missed.", ["no", "missed", "only"], "c", "You saw that exposing a bad reply does not prove your own view."),
          c("Sort of. They had no real answer.", ["sort", "answer", "no real"], "c", "You leaned towards counting it as a win.")],
          c("", [], "c", "You weighed what a call proves.")),
        c: q("ren", "conceding", "Fine. So the fallacy names are for me, not for them?", [
          c("Yes: they help me see what went wrong.", ["me", "see", "help", "yes"], "e1", "You concluded the names are a tool for your own thinking."),
          c("Both, if used gently.", ["both", "gentle", "kind"], "e1", "You concluded they can help both sides if used gently."),
          c("They're for winning, honestly.", ["win", "honest"], "e2", "You kept to the view that they are for winning.")],
          c("", [], "e1", "You concluded in your own words.")),
        e1: end("kurenai", "pleased", "A fallacy's name is a pointer back to the reasons. That is where the next lesson goes."),
        e2: end("kurenai", "thinking", "Then F1.6 is the counter-move: what to do with the argument they meant.")
      } }
  });

  /* ================= F1.6 The principle of charity ================= */
  L({ id: "F1.6", n: 6, unit: "F1", title: "The principle of charity", kind: "explain",
    can: "Read an argument at its most reasonable before you reply.",
    concepts: ["charity"], main: "charity", sittings: [2],
    prompt: { q: "Explain the principle of charity to a friend." },
    pages: [
      { t: "Hook", kind: "hook", blocks: [
        { story: "Your friend texts: \"Honestly, social media is ruining everyone.\" You could reply that you use it and you're fine, and that she's on it all day. Or you could ask what she actually means." },
        { note: "A kind of story you know · no title named, nothing spoiled" },
        { vote: { q: "What does she most likely mean?", options: ["Literally everyone is ruined", "It's doing more harm than good for many people", "She's just annoyed today"], note: "Quick vote. Your answer is kept, and the last page comes back to it." } }
      ] },
      { t: "The idea", blocks: [
        { h: "Answer what they meant" },
        { list: ["When an argument is unclear, choose its most reasonable reading.", "Fill gaps with the premise they most likely meant (F1.2).", "Then criticise that version.", "Charity is a method, not agreement: you may still reject it."] },
        { map: { rows: [{ t: "Social media is doing more harm than good for many people.", j: null, d: 0 }, { t: "Heavy use is linked to worse sleep and mood in teenagers.", j: "because", d: 1 }, { t: "Feeds are designed to keep people scrolling.", j: "because", d: 1 }], caption: "The charitable reading: a claim you can actually discuss." } },
        { concepts: ["charity"] }
      ] },
      { t: "The case", blocks: [
        { h: "Two replies to the same text" },
        { table: { head: ["Reply", "What it answers"], rows: [["\"I'm on it and I'm fine, so you're wrong.\"", "\"Literally everyone is ruined\": a claim she didn't make"], ["\"For some people, sure. Which part worries you most, the sleep or the comparing?\"", "The reasonable version, and it invites the reasons"]] } },
        { list: ["The first reply \"wins\" against nobody.", "The second can lead somewhere, including to disagreement."] }
      ] },
      { t: "The pushback", blocks: [
        { h: "What if they really meant the silly version?" },
        { list: ["Sometimes people do mean the extreme claim.", "Charity starts with the reasonable reading; it doesn't insist on it.", "If they confirm the extreme version, answer that.", "Charity also has a cost: done badly, you argue against a view nobody holds, in the other direction."] }
      ] },
      { t: "Check", kind: "check" },
      { t: "Close", kind: "close" }
    ],
    check: [
      { q: "What does the principle of charity ask you to do?", options: ["Agree with the other person", "Read their argument at its most reasonable before criticising it", "Avoid criticising anyone"], a: 1, why: "Charity is about which version you answer, not about agreeing." },
      { q: "Which is the opposite of charity?", options: ["A straw man", "A hidden premise", "Induction"], a: 0, why: "A straw man reads a view at its weakest; charity at its most reasonable." },
      { q: "Apply · Someone says, \"Exams don't measure anything.\" What is the most charitable reading?", options: ["Exams measure nothing at all", "Exams miss a lot of what matters about a person's ability", "The speaker failed an exam"], a: 1, apply: true, concept: "charity", why: "It's a reasonable claim worth discussing; the literal version is easy to knock down and probably not what was meant." }
    ],
    stories: "Two characters who misread each other on purpose make a sitcom. Two who try to read each other charitably and still disagree make a drama.",
    ref: "Charity: read an argument in its most reasonable form, fill gaps with what was most likely meant, then criticise that version.",
    dialogue: { id: "F1.6", title: "Is charity just being nice?", start: "a",
      nodes: {
        a: q("kurenai", "curious", "Is the principle of charity just a rule for being nice?", [
          c("Yes, it's about manners.", ["nice", "manner", "polite", "yes"], "b1", "You began by calling charity a rule of manners."),
          c("No, it's about answering the right thing.", ["right", "answer", "no", "argument"], "b2", "You began by calling charity a rule about what to answer."),
          c("Both.", ["both"], "b2", "You began by saying it is both.")],
          c("", [], "b1", "You began in your own words.")),
        b1: q("kurenai", "thinking", "Then could you be perfectly polite and still answer the wrong argument?", [
          c("Yes, politely missing the point.", ["yes", "miss", "point"], "c", "You saw you could be polite and still miss the point."),
          c("No, being polite means listening.", ["listen", "no"], "c", "You held that real politeness includes listening.")],
          c("", [], "c", "You tested manners against meaning.")),
        b2: q("kurenai", "pleased", "What do you get from beating the weakest version of a view?", [
          c("Nothing. They still believe the real one.", ["nothing", "still", "real"], "c", "You saw that beating the weakest version changes nothing."),
          c("A cheap win.", ["cheap", "win"], "c", "You called it a cheap win.")],
          c("", [], "c", "You weighed the easy win.")),
        c: q("ren", "sceptical", "Charity sounds great until someone uses it on you. \"What you REALLY mean is…\" Isn't that just putting words in my mouth?", [
          c("It can be. So check with them.", ["check", "ask", "can"], "e1", "You told Ren to check the charitable reading with the person."),
          c("No, it gives you a better view.", ["better", "no", "stronger"], "e2", "You told Ren it gives him a better view, not a worse one."),
          c("Yes, it's arrogant.", ["arrogant", "yes", "presum"], "e2", "You agreed it can be arrogant.")],
          c("", [], "e1", "You answered Ren in your own words.")),
        e1: end("kurenai", "pleased", "Read kindly, then ask. That habit is what F1.7 builds on."),
        e2: end("kurenai", "thinking", "Whether a stronger version still counts as theirs is exactly F1.7's question.")
      } }
  });

  /* ================= F1.7 Steelmanning (contested: a position) ================= */
  L({ id: "F1.7", n: 7, unit: "F1", title: "Steelmanning: making the other side stronger", kind: "contested",
    can: "Build the strongest version of a view you reject, and take a position on when it's worth it.",
    concepts: ["steelman", "charity"], main: "steelman", sittings: [2],
    prompt: { q: "Is steelmanning always worth it?", options: ["Yes, almost always", "Usually, not always", "Only in private", "Rarely"] },
    pages: [
      { t: "Hook", kind: "hook", blocks: [
        { story: "Before the final debate in the drama you're watching, the captain doesn't practise her own speech. She spends the night writing her opponent's speech, better than he could. Her friends think she's wasting time." },
        { note: "A kind of story you know · no title named, nothing spoiled" },
        { vote: { q: "Is she wasting her time?", options: ["Yes, she should practise her own side", "No, it's the best preparation", "Only if she has time left over"], note: "Quick vote. Your answer is kept, and the last page comes back to it." } }
      ] },
      { t: "The idea", blocks: [
        { h: "Charity, then a step further" },
        { list: ["Charity reads what was said at its most reasonable.", "Steelmanning adds the best support the view could have.", "You answer the strongest version, not the one you were given.", "If you can't answer it, you've learned where your own view is weak."] },
        { map: { rows: [{ t: "We should keep the old revision app.", j: null, d: 0 }, { t: "Everyone already knows it.", j: "because", d: 1 }, { t: "Switching mid-year costs weeks of setup, and the mocks are in six weeks.", j: "because", d: 1 }], caption: "The steelman keeps their claim and adds the strongest reason they didn't give: timing." } },
        { concepts: ["steelman", "charity"] }
      ] },
      { t: "The case", blocks: [
        { h: "A steelman, built" },
        { p: "The view: \"Phones should be banned in school.\" The usual version is \"they're distracting.\" A steelman might be:" },
        { std: { premises: ["Attention is a shared resource: one phone out distracts the people around it.", "Rules that depend on each student's self-control are hard to keep fairly.", "A clear rule removes the constant small decision."], conclusion: "A full ban may help even students who use their phones well." } },
        { list: ["You may still disagree.", "But now your reply has to deal with the shared-attention point, which is harder and more interesting."] }
      ] },
      { t: "The pushback", blocks: [
        { h: "When steelmanning costs something" },
        { list: ["It takes time, and some views have been answered many times already.", "Making a cruel view sound stronger, in public, can help it spread.", "Some people use \"just steelmanning\" to say things they believe.", "So the question isn't whether it is ever useful. It's whether it is always worth it."] }
      ] },
      { t: "Check", kind: "check" },
      { t: "Close", kind: "close" }
    ],
    check: [
      { q: "How does steelmanning go further than charity?", options: ["It adds the best support the view could have", "It agrees with the view", "It ignores the original argument"], a: 0, why: "Charity interprets; steelmanning improves the view before answering it." },
      { q: "Apply · Your friend says, \"Homework is pointless.\" Which reply steelmans her?", options: ["\"So you never want to learn anything?\"", "\"Do you mean that a lot of homework is busywork that doesn't help learning, and time could be better spent?\"", "\"You just don't like work.\""], a: 1, apply: true, concept: "steelman", why: "It builds the strongest version (busywork, opportunity cost) instead of a weaker one or a personal attack." },
      { q: "If you can't answer someone's steelman, what have you learned?", options: ["That you've lost", "Where your own view is weakest", "Nothing: steelmen aren't real views"], a: 1, why: "An unanswered steelman shows you where your own position needs work." }
    ],
    stories: "A rival who is right about something makes the hero's choice cost something. Steelman your antagonist on the page: give them the best argument you can, then make the hero answer it.",
    ref: "Steelmanning: build the strongest version of the view you reject, then answer that. It goes further than charity, and it has costs.",
    dialogue: { id: "F1.7", title: "Can steelmanning go too far?", start: "a",
      nodes: {
        a: q("ren", "serious", "I'll argue the other side, as always. Steelmanning is how you end up taking bad ideas seriously. Why should anyone have to?", [
          c("Because you can't beat what you don't understand.", ["understand", "beat", "know"], "b1", "You opened by saying you can't answer what you don't understand."),
          c("You shouldn't always. Some ideas don't deserve it.", ["deserve", "always", "some"], "b2", "You opened by saying some ideas don't deserve it."),
          c("Taking an idea seriously isn't agreeing with it.", ["agree", "serious", "isnt"], "b1", "You opened by separating taking an idea seriously from agreeing with it.")],
          c("", [], "b1", "You opened in your own words.")),
        b1: q("ren", "sceptical", "Fine in a seminar. But on a stream with ten thousand people watching, making a cruel view sound its best is advertising it.", [
          c("Then steelman it in private, and choose what to say.", ["private", "choose", "say"], "c", "Faced with an audience, you moved the steelman into private."),
          c("Still worth it. The audience deserves the real debate.", ["still", "worth", "audience"], "c", "You held that the audience deserves the strongest debate."),
          c("Good point. That changes things.", ["point", "changes", "fair"], "c", "You let the audience change your answer.")],
          c("", [], "c", "You weighed the audience.")),
        b2: q("kurenai", "thinking", "How would you decide which ideas deserve it, without first understanding them?", [
          c("Fair. I'd need to understand them first.", ["fair", "understand", "first"], "c", "You saw that deciding needs understanding first."),
          c("Some are obviously bad.", ["obvious", "bad"], "c", "You held that some ideas are obviously bad.")],
          c("", [], "c", "You thought about how you'd decide.")),
        c: q("ren", "conceding", "All right, I'll give you this much: it's a tool, not a duty. So when do YOU use it?", [
          c("When I'm about to disagree with someone.", ["disagree", "before", "someone"], "e1", "You'd use it before you disagree with someone."),
          c("When the stakes are high.", ["stakes", "matter", "important"], "e1", "You'd use it when the stakes are high."),
          c("Almost always. It's cheap.", ["always", "cheap", "almost"], "e2", "You'd use it almost always.")],
          c("", [], "e1", "You said when you would use it.")),
        e1: end("kurenai", "pleased", "Now put it as a position, with how sure you are. It will come back in two weeks to see if it held."),
        e2: end("kurenai", "curious", "Then the position card is the place to defend that, with Ren's audience point as the objection.")
      } }
  });

  /* ================= F1.8 Checkpoint ================= */
  L({ id: "F1.8", n: 8, unit: "F1", title: "Checkpoint: map and judge a real argument", kind: "checkpoint",
    can: "Map a real argument, then judge it with everything in F1.",
    concepts: [], main: null,
    pages: [
      { t: "The argument", blocks: [
        { h: "Something you can disagree with" },
        { story: "\"The app should not add a Mind streak. Streaks do raise how often people show up at first. But a broken streak makes many people quit altogether, because losing a streak feels worse than gaining a day feels good. And Mind is for curiosity: quitting it costs more than skipping a day.\"" },
        { list: ["Map it: the conclusion, its reasons, and the objection it answers.", "Then answer a few cards and scenarios, and write a short judgement.", "Never locked. Retake it any time; it pays once."] }
      ] }
    ]
  });

  M.checkpoint({ unit: "F1", title: "F1 checkpoint · map and judge a real argument",
    concepts: ["argument", "premise", "conclusion", "standard-form", "hidden-premise", "validity", "soundness", "deduction", "induction", "charity", "steelman"],
    cards: ["argument:0", "validity:0", "soundness:0", "induction:2", "hidden-premise:0", "charity:1", "steelman:1", "straw-man:0"],
    map: { claims: ["The app should not add a Mind streak.", "Streaks raise how often people show up at first.", "A broken streak makes many people quit altogether.", "Losing a streak feels worse than gaining a day feels good.", "Mind is for curiosity; quitting it costs more than skipping a day."],
      model: [{ t: 0, j: null, d: 0 }, { t: 1, j: "but", d: 1 }, { t: 2, j: "because", d: 1 }, { t: 3, j: "because", d: 2 }, { t: 4, j: "because", d: 1 }] },
    apply: [
      { q: "In the streak argument, what role does \"Streaks raise how often people show up at first\" play?", options: ["A reason for the conclusion", "An objection the argument grants and answers", "The conclusion"], a: 1, concept: "argument", why: "It points the other way; the argument grants it, then answers it with the quitting point." },
      { q: "Which hidden premise does the argument need?", options: ["Quitting Mind altogether is worse than showing up less often", "Streaks are always bad", "Everyone uses streaks"], a: 0, concept: "hidden-premise", why: "Without it, more frequent showing up might outweigh some people quitting." },
      { q: "Is the argument deductive or inductive?", options: ["Deductive: it guarantees its conclusion", "Inductive: its reasons make the conclusion likely, not certain", "Neither: it has no reasons"], a: 1, concept: "induction", why: "It weighs likely effects on people; new evidence about streaks could overturn it." }
    ],
    synthesis: { q: "A friend says this argument is \"obviously right, because everyone hates losing streaks\". In a few bullets: is the argument good, and is your friend's reason good?",
      rubric: [
        { t: "Names the conclusion and at least one premise accurately", concept: "argument", rung: "Explain" },
        { t: "States the hidden premise the argument needs", concept: "hidden-premise", rung: "Explain" },
        { t: "Says the friend's \"everyone hates\" reason is a bandwagon move, or weak induction", concept: "induction", rung: "Evaluate" },
        { t: "Offers the strongest case for a streak before answering it", concept: "steelman", rung: "Evaluate" }] }
  });

  M.spine();
})();
