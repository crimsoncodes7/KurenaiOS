# Mind — a study space for psychology and philosophy (plan, revision 2.1, approved; design received)

Roadmap 5.9, asked for on 24 October 2026. It follows the shape of Code,
Japanese and Creatives: a plan first, then Claude Design
([prompt 16](design-prompts.md)), then a platform release, then one unit
per release.

**Revision 2 (24 October 2026)** follows your answers (§15). It approves
decisions A–I and invariants 137–141, with these changes:
- **The name is "Mind", everywhere.** It is the subject's name on the
  desk, in pills, in Reports and in search. Inside the space, the
  curriculum is split under two headers, **Psychology** and
  **Philosophy**, with the Foundation and the Crossings around them (§2).
- **Beginner, but well read.** You have no formal study, but you know
  many of the themes from visual novels, psychological mysteries, light
  novels, and CS and AI. So every lesson's hook can start from a story,
  and the **media lens** (§10) is a main route in, not an extra.
- **For curiosity, thinking and stories.** There is no university thread.
  Each lesson gets a short **"For your stories"** note (§3.1), so what you
  learn about motives, memory and dilemmas feeds your own VN and story
  writing in Creatives (§10.1).
- **Strategy, decisions and Bayesian thinking** are added (§2.1):
  - Bayes and base rates in the Foundation (F2);
  - Psychology's Y3 becomes **Decisions and strategy**, with game theory
    (the Prisoner's Dilemma, zero-sum and positive-sum games) and the
    decision paradoxes (Newcomb's problem and others);
  - unreliable memory in Y1;
  - cognitive distortions in Y4.
- **One written prompt per lesson** (§3.3, decision J). An explanatory
  lesson asks for an **explain-back**. A contested lesson asks for a
  **position**. Never both. Bullet points are explicitly welcome.
- **Year 1 features** (§11):
  - the Argument Mapper;
  - the Fallacy Field Guide;
  - thought-experiment theatre as VN scenes;
  - the reading room;
  - and two light ones: philosopher cards and the yearly "what I
    believe".
- **15 minutes on top of the other spaces, done on the go.** You will
  mostly do it on the bus or whenever you are free, so **the phone is a
  first-class device here.** This is unlike Creatives, where the phone is
  for review only. The whole Daily 15 works one-handed, offline and in
  short bursts (§5.4).

Short answer:
- **One subject, Mind.** It is not an exam subject. It has its own hue,
  desk and lessons on the shared topic page, like Code and Japanese, and
  sits in their subject group.
- **15 minutes a day:** reviews, one lesson sitting and one question. It
  shrinks to 5 minutes of reviews during Exam Season.
- **The concept is the atom.** Paths contain units, units contain lessons,
  and lessons teach **concepts**. A concept is what FSRS schedules, what
  the knowledge graph links, and what mastery measures.
- **Philosophy is argued, not memorised.** Contested lessons end with
  your **position**. The Journal keeps every version of it, so you can see
  your views change over months.
- **Psychology is tested on yourself.** Classic experiments run as labs
  on your own data. The app's own mechanics are taught as case studies:
  KurenaiOS explains itself.
- **The companion is a hybrid.** Authored Socratic dialogue trees in the
  VN scene UI are the default: free, offline and the same every time.
  "Ask Kurenai" goes further when you press it.

---

## 1. Why this is not "CS notes with essays"

The other spaces prove skill with something checkable: a test passes, a
reading is right, a piece is made. Here most of what matters is
**understanding and judgement**, so the evidence is layered:

| Level | What it means | Evidence (any one route) |
|---|---|---|
| **Recall** | You can state the idea | FSRS concept cards (invariant 111) |
| **Explain** | You can say it in your own words | An explain-back (§3.3), or a checkpoint's synthesis that covers the concept's key points |
| **Apply** | You can spot it in a new case | Scenario items: "which concept is this?" or "what would X say?" |
| **Evaluate** | You can weigh it | A position with a reason and an objection answered (§6), or a checkpoint's evaluate item ("which design would test this best?") |

A concept's **mastery** is the highest level whose evidence holds, and it
is derived, never set (like invariant 107). Each level has more than one
route, so the one-prompt rule (§3.3) never leaves a concept stuck below
Evaluate. Recall decays with FSRS. The other three are kept as dated
evidence, and revisits (§5.3) bring them back.

## 2. The curriculum

**Paths → units → lessons → concepts.** On the desk and the path page the
paths sit under four headers: Foundation, Psychology, Philosophy and
Crossings.

### 2.1 Paths

**Foundation** (first, and suggested before the others):
- **F. Thinking well:**
  - **F1. What makes an argument good:** structure, validity and
    soundness, deduction and induction, fallacies, charity and
    steelmanning.
  - **F2. Evidence and belief:** probability as degree of belief,
    base rates, **Bayes' rule** in plain words, then as natural frequencies
    and with odds; updating on evidence, extraordinary claims, how to read
    a study, and correlation and causation. It links to Maths'
    conditional probability.

**Psychology:**
- **Y1. Learning and memory** (first, because it pays back in every
  subject): encoding, the forgetting curve, the spacing and testing
  effects, interleaving, sleep, attention, metacognition, and **memory
  is reconstructed** (Loftus, false memories, eyewitnesses: the unreliable
  narrator's science).
- **Y2. Social psychology:** conformity, obedience, attribution,
  persuasion, groups, and the replication crisis told honestly.
- **Y3. Decisions and strategy:**
  - **Y3.1 Biases and heuristics:** availability, anchoring, framing,
    loss aversion, sunk costs, and the dual-process debate.
  - **Y3.2 Games and strategy:** zero-sum and positive-sum games, the
    Prisoner's Dilemma, Nash equilibrium, chicken and coordination games,
    repeated games and tit-for-tat (Axelrod), signalling and bluffing,
    and trust and reputation.
  - **Y3.3 Decision paradoxes:** Newcomb's problem, Monty Hall, the
    St Petersburg paradox, Allais, Pascal's wager and the two-envelope
    problem.
- **Y4. Emotion, motivation and habit:** theories of emotion,
  self-determination theory, habit loops, rewards and intrinsic
  motivation, flow, and **cognitive distortions** (catastrophising,
  mind-reading, all-or-nothing thinking, and how stories write them).
- **Y5. Development and personality:** attachment, the Big Five,
  identity, and what changes with age.
- **Y6. Research methods:** designs, variables, sampling, ethics, effect
  sizes and p-values. It links to Maths' Statistics (S1–S5).
- **Y7. Mind and brain** (later): neurons, the brain's systems, and what
  imaging can and cannot show.

**Philosophy:**
- **P1. Ethics:** virtue ethics, utilitarianism, Kant and duty, contract
  theory, care ethics, applied cases, and metaethics later.
- **P2. Mind and self:** dualism, physicalism, functionalism,
  consciousness and the hard problem, personal identity, free will.
- **P3. Knowledge and reality:** scepticism, justification, Gettier,
  induction's problem, what exists, time, and **rational choice**
  (expected value, dominance against expected utility: where Newcomb's
  problem is argued, after Y3.3 has shown it).
- **P4. How to live:** Stoicism, Epicureanism, existentialism and
  absurdism, and East Asian thought (Confucius, Zhuangzi, Zen, and
  Japanese aesthetics: *mono no aware*, *wabi-sabi*, *ikigai* as it is
  actually used rather than as the Venn diagram).
- **P5. Society and power** (later): justice, rights, liberty and
  authority, with the social contract as a game (Y3.2).

**Crossings** (a unit owned by both disciplines, suggested once you have
done a unit on each side):
- **X1. Free will:** Libet and its critics ↔ compatibilism.
- **X2. Morality:** moral psychology (Haidt, trolley-problem data) ↔
  normative ethics.
- **X3. Happiness:** eudaimonia ↔ positive psychology and hedonic
  adaptation.
- **X4. The self:** personal identity ↔ self-concept and reconstructed
  memory.
- **X5. Machine minds:** the Chinese room and functionalism ↔ what
  language models do. It links to CS and Code.
- **X6. Cooperation:** why cooperation evolves (Y3.2) ↔ contract
  theory and trust.

### 2.2 The order (approved)

1. F. Thinking well: F1, then F2 (Bayes);
2. Y1. Learning and memory;
3. P1. Ethics, unit 1;
4. X3. Happiness (the first crossing);
5. after that, your choice. Y3.2 Games and strategy is the suggested
   next step because it builds on F2 and feeds X6.

The desk always suggests one next unit (§5.1) and never locks anything.
A crossing whose two sides you have not done says so, with
"Start anyway".

### 2.3 Example units

These show the size, not a final list. A unit has 6–10 lessons, and a
lesson takes one or two 8-minute sittings. The prompt column shows the
lesson's one written prompt (§3.3): **E** is an explain-back, **P** a
position, and a dash means the lesson has none.

**F1. What makes an argument good**

| # | Lesson | Prompt |
|---|---|---|
| 1 | Claims, reasons and conclusions | E |
| 2 | Standard form: writing an argument out | E |
| 3 | Valid is not the same as true | E |
| 4 | Deduction and induction | E |
| 5 | Five fallacies you will meet weekly | — (Field Guide items) |
| 6 | The principle of charity | E |
| 7 | Steelmanning: making the other side stronger | P |
| 8 | Checkpoint: map and judge a real argument | (the Mapper) |

**F2. Evidence and belief**

| # | Lesson | Prompt |
|---|---|---|
| 1 | Belief comes in degrees | E |
| 2 | Base rates: the test that is 99% accurate | E |
| 3 | Bayes' rule with natural frequencies | E |
| 4 | Updating: how much should this change my mind? | E |
| 5 | Extraordinary claims | P |
| 6 | Correlation, causation and confounders | E |
| 7 | Checkpoint: the detective's update (a mystery solved by Bayes) | (synthesis) |

**Y3.2 Games and strategy**

| # | Lesson | Prompt |
|---|---|---|
| 1 | What is a game? Players, moves, payoffs | E |
| 2 | Zero-sum and positive-sum | E |
| 3 | The Prisoner's Dilemma | E |
| 4 | Nash equilibrium | E |
| 5 | Repeated games: Axelrod's tournament (a lab) | E |
| 6 | Chicken, coordination and commitment | E |
| 7 | Signalling, bluffing and reputation | E |
| 8 | Should you always defect against a stranger? | P |
| 9 | Checkpoint: analyse the game in a story's climax | (synthesis) |

**P1. Living well: Aristotle and the virtues** (after your example)

| # | Lesson | Prompt |
|---|---|---|
| 1 | What is ethics for? | P |
| 2 | *Eudaimonia*: flourishing, not feeling good | E |
| 3 | The function argument | P |
| 4 | Virtue as a trained character | E |
| 5 | The doctrine of the mean | E |
| 6 | Practical wisdom (*phronesis*) | E |
| 7 | Friendship | P |
| 8 | Objections: whose virtues? and the action-guiding problem | P |
| 9 | Synthesis: does Aristotle explain what makes a life good? | (synthesis) |

### 2.4 Content rules

- **Original writing.** Primary sources are quoted only from
  public-domain translations (Ross's Aristotle, Jowett's Plato, Long's
  Marcus Aurelius), cited every time. Modern works are summarised and
  cited, never copied.
- **Psychology claims carry their evidence.** Each finding is marked
  **Robust**, **Debated** or **Failed to replicate** (Stanford prison,
  ego depletion and power posing get the honest version).
- **Maths is checked by program.** Bayes examples, payoff matrices,
  equilibria and paradox odds are computed before they are written, as
  the Exams Companion's are (invariant 130).
- **Notes follow the house style:** short lines, bullets, and annotated
  `{fig}` diagrams wherever a picture helps (argument maps, frequency
  trees, payoff matrices, curves).
- **Media hooks name the idea, not the plot.** A hook can say "a VN where
  you can't trust the narrator", or name a title from your Collection
  through the media lens (§10), and never spoils it without a warning.
- **No therapy.** Applied units (Stoic practice, recognising cognitive
  distortions) are educational. They say so once and point to real
  help. Nothing diagnoses or assesses you.

## 3. A lesson

### 3.1 The pages

A lesson is short, with 4–6 pages on the shared topic page:
1. **Hook.** A puzzle, a thought experiment, a scene from a kind of
   story you know, or a quick vote ("Would you plug into the experience
   machine?"). Your answer is kept so the end of the lesson can return to
   it.
2. **The idea.** The concept or concepts, in short lines and with a
   diagram.
3. **The case.** A worked example, a study, a payoff matrix, or a passage
   read closely.
4. **The pushback.** The strongest objection, or the evidence against.
5. **Check.** 3–5 quiz items, including at least one "apply" scenario.
6. **Close.** The lesson's one written prompt (§3.3), the Socratic
   dialogue (§7.1), a **"For your stories"** note, and the quick
   reference.

**"For your stories"** is two or three lines on how a writer uses the
idea, for example:
- reconstructive memory → the unreliable narrator;
- the Prisoner's Dilemma → a betrayal that makes sense to both
  characters;
- akrasia → a character who knows better.

It is never a task. "Save to Journal" turns it into an insight you can
take to the Writing Desk (§10.1).

### 3.2 Concepts

A concept is authored once and reused everywhere:
```
{ id: "eudaimonia", name, gist (one line), keyPoints [3–5],
  cards [[q, a], …], scenarios [...], confusables [ids],
  links [{to, type}], sources [...], evidence: "robust"|"debated"|"failed"|null }
```
Its id is stable, so cards, graph edges and journal links survive a
rewrite (like invariant 87).

### 3.3 One written prompt (decision J)

A lesson is either **explanatory** (`kind: "explain"`: most of Psychology,
the Foundation's tools, game theory) or **contested** (`kind: "contested"`:
Philosophy, the Crossings and the open questions). It asks **one** written
prompt to match, never both:

- **Explain-back** (explanatory): "Explain *the base-rate fallacy* to a
  friend." It takes three bullets or three sentences. You then tick which
  of the concept's key points you covered, and that tick is the evidence.
- **Position** (contested): your answer, your confidence and one line of
  reason (§6). The objection and your reply are optional, and adding
  them is the route to Evaluate.

To keep a sitting fast:
- **Bullets are the default.** The box opens as a bullet list and says
  "Bullets are fine". There is no word minimum.
- **"Later" is always offered.** It parks the prompt into a coming Daily
  15's question slot (§5.1). It never blocks the lesson's other checks
  and is never counted as missed.
- **A checkpoint or synthesis lesson** has its one synthesis and no
  other prompt.
- **Ask Kurenai to check it** is optional and advisory: it never sets
  mastery (decision F).

## 4. Progress and milestones

- **A lesson** has four checks, derived from evidence: pages read, check
  passed, its one prompt done, and its concepts' first retrieval passed.
  A lesson with no prompt has three. The status follows the checks, as
  Code's does (invariant 107).
- **A unit** ends in a **checkpoint**. It mixes concept cards, apply
  scenarios, and one short written synthesis that you mark against a
  rubric. It is never locked and can be retaken.
- **Milestones** show on the desk and in Reports:
  - first argument mapped;
  - first Bayesian update worked out;
  - ten positions taken;
  - first crossing unit;
  - first changed mind (a position revised with a reason, §6);
  - first self-experiment finished (§8.1);
  - first thought experiment where you resolved a tension.
- **Mastery** per concept (Recall → Evaluate) and per path appears as a
  ladder, not a percentage.

## 5. The daily session (15 minutes, on top of the other spaces)

### 5.1 The Daily 15

It is computed from the date and the evidence and never stored, like
Code's Daily 20 (invariant 108):

| Minutes | Part | What happens |
|---|---|---|
| ~4 | **Reviews** | Due concept cards (FSRS), capped at 15 a day |
| ~8 | **One sitting** | The next part of the current lesson; a lesson is cut into sittings at page breaks |
| ~3 | **One question** | A parked prompt (§3.3), a revisit (§5.3), a Field Guide item (§11.2), or the week's Big Question (§9.2) |

- It is one Focus session, so it pays as study through the Governor's
  normal rule (invariant 4a). A 15-minute session earns one block.
- **Short day:** "Just reviews" (5 minutes) is always offered.
- **Exam Season** (invariant 123) shrinks it to reviews only, without
  being asked. Lessons wait, and nothing reads as behind.
- **No streak of its own.** It feeds the normal study streak only. A
  missed day carries nothing over and nothing goes overdue except cards,
  which FSRS already handles.

### 5.2 Retrieval

- Concept cards schedule through `KOS.fsrs` with the learner's weights
  and target retention (invariant 111), keyed `mind:<concept>:<i>`. The
  review log records `src: "mind"`.
- Only cards **worth keeping** are authored: the definition, the key
  distinction ("valid vs sound"), the classic objection, and the finding
  and its status. Names and dates are rarely worth a card.
- Mixed reviews can show one concept's card next to its **look-alike**
  (utilitarianism vs consequentialism, negative reinforcement vs
  punishment, zero-sum vs constant-sum).

### 5.3 Revisits

Positions and explain-backs come back too, but not as cards. Spaced at
roughly 2 weeks, 2 months and 6 months, a revisit asks: "In October you
said X because Y. Still true?" You keep it, revise it, or retire it.
That is what powers the belief timeline (§6).

### 5.4 On the go (the phone is first-class)

The Daily 15 is designed for a bus ride: about 15 minutes, one hand,
patchy signal, and being interrupted.
- **One hand.** Reviews, quiz items, dialogue choices, Field Guide items
  and thought-experiment choices are thumb taps in the lower half of the
  screen. Typing is only needed for the one prompt, and "Later" moves it
  to a desk.
- **Offline.** Lessons, cards, dialogue trees, the reading room and the
  thought-experiment scenes come with the app (the service worker caches
  them). Journal writes and evidence queue locally and sync later
  (invariant 31). Ask Kurenai needs a connection and says so calmly
  ("Saved to ask when you're online").
- **Interrupted.** Each part resumes exactly where it stopped: the page,
  the dialogue turn, the card. A sitting left halfway is finished next
  time and is never restarted. The Focus session banks on page hide
  (invariant 4c).
- **The phone layout** follows the phone views (15a onwards): the Daily
  15 as one vertical flow with a progress strip for its three parts.

## 6. Positions: where you stand

On each Big Question a contested lesson raises ("Can a machine think?",
"Is lying ever right?", "Should you defect against a stranger?"):
- your answer, from a scale or a set of options;
- your confidence, from 50% to 99%;
- one line of reason (bullets are fine);
- the best objection and your reply. This is optional, but it is one
  route to **Evaluate**.

Positions are **never overwritten**. Each revision is a new dated
version with "what changed my mind". The **belief timeline** shows how
your views drift, and a revision counts as a milestone, because
changing your mind for a reason is the point. Your confidence is
compared later with whether you kept the view (a calibration view, read
with F2's ideas).

**Tension pairs.** Authored pairs flag answers that pull against each
other, for example "You pull the lever in the trolley case but don't push
in the footbridge case. What's the difference?" A pair can span lessons
and thought experiments (§11.3). It opens a short dialogue instead of a
verdict. Tensions are authored, never guessed by AI.

## 7. The companion (decision E, approved)

### 7.1 The dialogue trees (the default)

Each lesson carries a short authored **Socratic dialogue** in the VN
scene UI (`KOS.jaUI.scene`, with Kurenai's existing art; no new cast):
- Kurenai asks a question;
- you pick from 2–4 answers or type your own, and a typed answer is
  matched to the nearest branch by keywords, with "none of these" as a
  way out;
- each branch has a written follow-up, a counterexample or a deeper
  question;
- after 3–5 turns it ends in a short summary of the line you took, and
  "Save to Journal".

Every tree is checked by `tools/mind_tree_check.mjs`: every branch is
reachable, every ending is reached, and no turn is a dead end.

### 7.2 Ask Kurenai (optional)

A button on every lesson, concept and journal entry. There are four
modes, each a fixed prompt to `KOS.ai.chat`:

| Mode | What Kurenai does |
|---|---|
| **Socratic** | Asks only questions and never gives the answer until you ask for it |
| **Explain it differently** | A simpler or more concrete explanation, then one check question |
| **Push back** | Argues the strongest case against your position: a steelman, not a strawman |
| **Make it mine** | Examples drawn from what you allow: your subjects, a Collection title you choose, a story you are writing |

- **"What is sent"** lists the payload before the first message, as in
  Reports and Creatives: the concept, the lesson, your typed answer, and
  only the extras you tick. Journal entries never go unless you send one
  by hand.
- A conversation can be **saved to the Journal** as a reflection.
- It never sets mastery, writes a position or grades a checkpoint
  (invariant 140).
- **Assistant tools** are read-only: `mind_overview`, `mind_concept` and
  `mind_due`. Saving to the Journal goes through the approval card.

## 8. Psychology on yourself

### 8.1 Self-experiments in the lab

Built on the lab system (`KOS.lab`, the text and SVG kinds, never a
canvas). Each one shows your own result beside the published one, and
the results stay on the device:
- Stroop;
- serial position (free recall of 15 words);
- digit span;
- the misinformation effect (a short scene, then leading questions:
  Y1's reconstructed memory on yourself);
- anchoring;
- change blindness;
- reaction time with and without a distractor;
- the Müller-Lyer illusion.

**Strategy labs** (Y3), with nothing about you to keep:
- **Axelrod's tournament:** pick or build a strategy (always defect,
  tit-for-tat, grudger, random, your own rules) and watch a round-robin
  play out;
- **Monty Hall:** play 20 rounds, then simulate 10,000;
- **the Bayes box:** drag a base rate and a test's accuracy, and watch
  the frequency tree and the posterior update.

Y6 then teaches you to test the difference between your result and the
published one, using the statistics you are learning in Maths.

### 8.2 KurenaiOS explains itself

Lessons use your own app data as their case study. These are pure reads
with the low-data rule (invariant 76):
- **the forgetting curve** from your review log (`KOS.reviewLog`), in
  Y1;
- **calibration** from your exam predictions (`KOS.examStats`), in F2;
- **time of day:** your Focus completion by hour;
- **rewards:** how the Governor uses reinforcement, why HP gates
  nothing (invariant 2), and what research says about streaks, in Y4.

This makes the app's design choices visible and open to argument.

## 9. The Journal

### 9.1 Entries

Five kinds, each linked to concepts and, optionally, to a lesson, a
topic, a Collection title or a Creatives piece:

| Kind | Holds |
|---|---|
| **Insight** | Something that clicked, or a "For your stories" note saved |
| **Quote** | Short, with its source; your own collection, never bundled |
| **Question** | Something open; it can become a Big Question |
| **Position** | §6: versioned, with confidence |
| **Reflection** | Free writing, a saved dialogue or a saved Kurenai conversation |

- Search, filter by kind or concept, and a "this month" view.
- A **commonplace book** export (Markdown) of everything, or one
  concept's entries.
- **Quick capture** from anywhere in the app on a phone: kind, text,
  done. Concepts can be linked later.
- **Private by default.** Reports count entries only and never quote
  them (invariant 102b's rule). Kurenai sees an entry only when you send
  it.

### 9.2 The Big Question of the week

One question each week, chosen from your open Questions or the current
unit:
- a 3-minute prompt on most days builds a short thread;
- on Sunday, a closing synthesis in a few bullets ends it.

### 9.3 Storage (decision G)

- The Journal has its own IndexedDB, `kurenai-os-mind`.
- It is included in the full backup.
- It replicates to an owner-only `kos_mind` table the way Money and the
  review log do: local first, per-row stamps, tombstones.
- Lesson evidence and positions' metadata stay in `state.mind` as keyed
  maps.

## 10. The knowledge graph

- **Nodes:** concepts, plus thinkers and studies as light nodes.
- **Typed edges:** *is a kind of*, *objects to*, *supports*,
  *is evidence for*, *same idea as*, *applies in*.
- **Edges out of the space** use links the app already has:
  - **CS and Maths** through topic refs (`"sid:ref"`, invariant 26e):
    - logic ↔ Boolean algebra;
    - induction ↔ proof by induction;
    - the Chinese room ↔ the Turing machine and computability;
    - Bayes and base rates ↔ conditional probability;
    - game theory ↔ the minimax ideas behind game-playing algorithms;
    - research methods ↔ hypothesis testing;
  - **Code** concepts (X5, recursion as self-reference);
  - **Japanese** lessons (P4's aesthetics, honorifics as social
    psychology);
  - **Collection titles** by `syncId`, private.
- **The media lens.** You tag a VN, light novel, anime or game with the
  ideas it explores: an unreliable narrator, a Prisoner's Dilemma, a
  Newcomb-like choice, determinism, personal identity. A few tags are
  suggested for titles in your Collection, and the rest are yours.
  - A concept's page lists the titles you tagged ("You've seen this
    in…").
  - A title's page in the Collection gets a quiet "Ideas in this"
    section.
- **Your edges.** A journal entry's links add your own edges, drawn
  apart from the authored ones.
- **Views:**
  - each concept page has a **Neighbours** panel, which is the
    accessible route;
  - the **Atlas** is an SVG map of one path or one concept's
    two-step neighbourhood, built on the lab stage and its overflow
    rule. Like the braid (invariant 85), the picture is one image and
    the list beneath it is the real control.
- `KOS.search` finds concepts, thinkers and journal entries, but never
  journal text in the cross-domain list unless you are on the Journal.

### 10.1 Into Creatives

Mind feeds your writing; it never writes for you:
- the "For your stories" notes and Journal insights can be opened from
  the Writing Desk's side panel, filtered by concept;
- Y5 ends with a **character lens**: a worksheet (motives, attachment
  style, Big Five sketch, a distortion they hold, the dilemma that tests
  them). You fill it in for your own character and it is saved to the
  Journal;
- Y3.2's checkpoint can be done on your own story's climax;
- this is a link and a side panel only. Creatives' invariants (134–136)
  are unchanged, and Kurenai still never writes the story.

## 11. Year 1 features (approved)

### 11.1 The Argument Mapper

Drag premises and a conclusion into a tree joined by *because*, *but* and
*therefore*:
- it arrives with F1 and is used in every checkpoint;
- it is built on `KOS.ui.reorder` with indentation, so the keyboard and
  screen readers can use it, and on a phone it works by tap to move, not
  drag;
- a map exports to the Journal and as an image.

### 11.2 The Fallacy Field Guide

Short items in the Daily 15's question slot: a quote, a fake ad or a line
of dialogue, and you name the fallacy or bias.
- Each fallacy and bias is a concept, so it has its own card and
  mastery.
- "Spotted in the wild" logs one you met in your own life to the
  Journal.
- The guide is also a page: every fallacy and bias, with a one-line
  definition, an example and your sightings.

### 11.3 Thought-experiment theatre

About ten classics as interactive VN scenes (`KOS.jaUI.scene`):
- the trolley and the footbridge;
- the experience machine;
- Mary's room;
- the ship of Theseus and teleportation;
- the veil of ignorance;
- the Chinese room;
- Newcomb's problem;
- the Prisoner's Dilemma played against a character.

Your choices feed the tension pairs (§6). The results page says where
your answers place you ("you answered like a consequentialist 4 times
out of 6"), as a description, never a score. Each scene uses Kurenai's
art. Any extra character needs your art (Gemini) and voice
(ElevenLabs is capped at three designed voices), so it is asked for
through the manifest first.

### 11.4 The reading room

Short public-domain passages read a few paragraphs at a sitting:
Meditations, the Apology, the Nicomachean Ethics (books I–II), Hume on
induction, Mill on liberty. Each has guided margin notes and two or
three questions, and is linked to its lesson. It fits the Daily 15's
sitting slot.

### 11.5 The light ones

- **Philosopher cards.** A small collectable deck: a thinker, the one
  idea and an objection. A card is "earned" when you reach Apply on that
  thinker's main concept. It is display only and pays nothing.
- **Yearly "what I believe".** On 1 September, Reports' year view
  (invariant 102d) shows your positions then and now. It counts facts
  only and shows your words only when you open it.

### 11.6 Parked

The Stoic evening review and debate rounds with Kurenai stay parked
until you ask.

## 12. Rewards (the Governor)

- The Daily 15 is a Focus session and pays under the Focus rule
  (invariant 4a). That is the main route.
- **Pay once:**
  - a lesson's first finish: 12 XP, 2 gold, +2 HP;
  - a unit checkpoint: 50 XP, 12 gold, +4 HP;
  - a path complete: 120 XP, 30 gold, +8 HP.
- A proven concept review pays +1 XP, at most 15 a day (like Japanese,
  invariant 116).
- These pay **nothing**: Journal entries, positions, dialogues, Kurenai,
  self-experiments, strategy labs, Field Guide items, the reading room
  and philosopher cards. Writing more must never earn more.
- HP gates nothing (invariant 2). Nothing in the space is locked behind
  gold.

## 13. Releases

1. **Plan:** revision 2 (this document), approved.
2. **Claude Design, prompt 16** (◆, frames 32a onwards): the desk, the
   path, a lesson, the one prompt in both forms, the dialogue, the
   position card and belief timeline, the Journal, the Atlas, the
   Argument Mapper, the Field Guide, a thought experiment, a
   self-experiment and a strategy lab, the reading room, a checkpoint,
   and the phone Daily 15.
3. **Platform:**
   - the subject (`mind`), hue, routes and desk;
   - the model (`state.mind`, `KOS.mind`), the concept registry and the
     FSRS keys;
   - the Daily 15 with its Exam Season shrink and the phone flow;
   - the Journal and its store;
   - positions, revisits and tension pairs;
   - the dialogue-tree engine and its checker;
   - Ask Kurenai's four modes;
   - smokes numbered after Creatives';
   - **with F1** and the Argument Mapper.
4. **F2** (Bayes) with the Bayes box and the Field Guide.
5. **Y1 unit 1** with the first self-experiments and "KurenaiOS explains
   itself".
6. **P1 unit 1** with the first thought experiments and the reading room.
7. **X3,** with the Atlas.
8. After that, one unit per release in the order you choose. Y3.2 is
   suggested, with Axelrod's tournament.

Backend that needs no design can start any time:
- the concept schema and its validator;
- the Journal store and its replication;
- the dialogue-tree format and `tools/mind_tree_check.mjs`.

## 14. Invariants this adds (approved, numbered after Creatives')

- **137. A CONCEPT IS THE UNIT OF RETENTION.** Concepts have stable ids.
  Cards, edges and journal links point at the id. Mastery (Recall →
  Evaluate) is derived from evidence, and only `KOS.mind` writes it. A
  lesson asks ONE written prompt, an explain-back or a position by its
  `kind`, and "Later" never blocks its other checks.
- **138. POSITIONS ARE VERSIONED, NEVER OVERWRITTEN.** A revision appends
  a dated version with its reason. Tensions are authored, never
  inferred.
- **139. THE JOURNAL IS PRIVATE AND LOCAL FIRST.** It lives in
  `kurenai-os-mind`, is in the backup and replicates to `kos_mind`.
  Reports count entries and never quote them. Kurenai sees an entry only
  when you send it.
- **140. KURENAI DISCUSSES, NEVER GRADES.** Ask Kurenai sends only what
  "What is sent" shows, once per press. It never sets mastery, a
  position or a checkpoint. The authored dialogue works without it, and
  offline.
- **141. CLAIMS CARRY THEIR EVIDENCE.** Every psychology finding is
  marked Robust, Debated or Failed to replicate. Primary sources come
  from public-domain translations only, and are cited. Numbers (Bayes,
  payoffs, odds) are checked by program before they are written.

## 15. Your answers (24 October 2026)

1. **Name:** "Mind" everywhere. Psychology and Philosophy are headers
   inside the curriculum.
2. **Level:** no formal study. Familiar with many themes through VNs,
   psychological mysteries, light novels, and CS and AI.
3. **Purpose:** curiosity, sharper critical thinking, understanding
   behaviour and strategy, and analysing the themes in what you read and
   write, feeding your VN and story writing in Creatives. Not a
   university degree. X5 and formal logic and Bayesian thinking connect
   to CS and AI.
4. **Companion:** authored trees by default, in the VN scene UI; Ask
   Kurenai's four modes on request.
5. **First paths:** F → Y1 → P1 → X3, with game theory, decision
   paradoxes, Bayesian thinking and unreliable memory woven in (§2.1).
6. **Year 1:** the Argument Mapper, the Fallacy Field Guide,
   thought-experiment theatre and the reading room, plus philosopher
   cards and the yearly "what I believe".
7. **Time:** 15 minutes added to the other spaces, done on the bus or
   whenever you are free.
8. **Your guardrail:** one written prompt per lesson, an explain-back or
   a position by the lesson's kind, with bullets welcome.

## 16. Decisions (approved 24 October 2026)

| | Decision | Agreed |
|---|---|---|
| A | Shape | one subject, Mind (`mind`, `exam: false`, hue chosen in design), with Foundation, Psychology, Philosophy and Crossings as headers; in Code and Japanese's subject group |
| B | Atom | the concept: authored once, FSRS-scheduled, graph-linked |
| C | Time | the Daily 15 (reviews · a sitting · a question), added to the other spaces; 5 minutes in Exam Season; no separate streak; phone-first and offline |
| D | Philosophy evidence | positions with confidence, versioned, revisited at about 2 weeks, 2 months and 6 months |
| E | Companion | authored Socratic trees in the VN scene UI by default; Ask Kurenai in four modes, on request |
| F | Grading | self-checks against key points and rubrics; AI is advisory only |
| G | Journal storage | its own IndexedDB, backed up, replicated to `kos_mind` |
| H | Graph | authored and personal edges; cross-space edges through existing refs; the media lens; the Atlas over an accessible list |
| I | Rewards | Focus first; lessons, checkpoints and paths pay once; writing pays nothing |
| J | Friction | one written prompt per lesson by its kind (explain-back or position), bullets welcome, "Later" parks it |

## 17. Risks

- **Too much on the plate.** This is the fourth daily space, added on
  top. The defences: 15 minutes that fit dead time, the 5-minute "just
  reviews" day, the automatic Exam Season shrink, and no streak of its
  own.
- **Philosophy turning into memorising.** Contested lessons end in a
  position, and cards are limited to what is worth keeping.
- **Writing fatigue.** At most one prompt per lesson, bullets, and
  "Later".
- **Pop-psychology errors.** Each claim is labelled with its evidence,
  failed replications are taught openly, and sources are cited.
- **The content is large.** Units stay short, one ships per release, and
  the trees have a checker.
- **Applied units mistaken for therapy.** They are educational, say so,
  and never assess you.
- **Spoilers.** Media hooks name ideas, not plots; a title's ideas are
  shown only for titles in your own Collection.

## 18. The design (turn 32, received 24 October 2026)

The handoff package is `~/Downloads/design_handoff_kurenaios_mind/` on
the Mac that made it: `KurenaiOS Mind.dc.html` (open it with `support.js`
and `assets/` beside it), `README.md`, `mind-tokens.css`, and the plan.
It is not committed, as with earlier handoffs. **The notes under each
frame are the spec:** States, Focus order, Live region, Empty/offline/
errors, and breakpoints. The blue ◇ tags name the shared components.

**What it settles:**
- **Hue: 藤 Fuji.** `--mind` is `oklch(0.78 0.1 302)` in Dusk and
  `oklch(0.5 0.14 302)` in Dawn. `--mind-ink` (ink on a fill) is
  `oklch(0.2 0.04 302)` in Dusk and the page white in Dawn. It goes beside
  `--code` and `--ja` in `css/themes.css` and shifts in the shop themes
  like the other subject hues. It sits between Maths (270) and IT (325),
  and is never used for right or wrong.
- **Type:** Onest, JetBrains Mono, Shippori Mincho (the 心 emblem), and
  **Newsreader** for reading (hooks, passages, "For your stories", quotes,
  dialogue lines). Newsreader is already loaded and is `--font-read` in
  `tokens.css`, so no font change is needed.
- **Fidelity:** high. Colours, type, spacing, radii and copy are final,
  in British English. The sample learner is five weeks in (F1 and F2
  done, at Y1.6). All counts are samples.
- **Match the siblings.** The desk follows Code's and Japanese's (26a,
  28a). A lesson is the shared topic page. The dialogue and the theatre
  are `KOS.jaUI.scene`. The labs are the lab system. The Argument Mapper
  is `KOS.ui.reorder`.
- **The subject group** shows Code · Japanese · Mind until Creatives has
  its hue.

**The frames:**

| Frames | What they are |
|---|---|
| 32·hue, 32·kit | The hue and the shared parts: ladder, path ladder, evidence tag, Daily 15 strip, Journal kinds, "For your stories", confidence slider |
| 32a–32b | The desk and its states (first visit, skipped week, Exam Season, offline); iPad and Dawn |
| 32c | The path page, with a phone version |
| 32d–32f | Lesson Y1.6, every page; iPad and Dawn |
| 32g–32h | The explain-back and the position card |
| 32i–32j | The Socratic dialogue in the VN scene, with a phone version |
| 32k–32l | Versions, the belief timeline, the revisit and the tension pair |
| 32m | Ask Kurenai |
| 32n–32o | The Journal, with phone quick capture |
| 32p–32q | Neighbours, the media lens and the Atlas |
| 32r | The Argument Mapper |
| 32s | The Fallacy Field Guide |
| 32t–32u | Thought-experiment theatre and its results |
| 32v–32w | The serial-position lab, the Bayes box and Axelrod's standings |
| 32x | The reading room (Meditations II.1, tr. Long) |
| 32y | A checkpoint |
| 32z–32ab | The phone Daily 15 |
| 32ac | Philosopher cards and the yearly "What I believe" |

**To do before or while building:**
- **Check the sample figures by program** (invariant 141): the Loftus &
  Palmer figures in 32e, the published serial-position curve in 32v, and
  the Axelrod scores in 32w. The Bayes box values are computed already.
- **Scene layers.** Kurenai's body and face are separate layers in the
  scene: only the face swaps, as with Japanese's cast (that plan's §12.1).
  Until the faces arrive, her neutral pose shows and the slots are
  marked. The background is a calm Fuji wash until its art arrives.
- **The art slots** in the design (§19): Kurenai's faces (thinking,
  pleased, curious), the dialogue and theatre backgrounds, and the
  philosopher portraits.
- **A second character** is now wanted (24 October 2026), and the design
  shows none yet. Their frames are a small follow-up turn once the
  character sheet exists: the scene with two speakers, the theatre with
  them as a participant, and their Push back line.

## 19. The second character and the voices

The art prompts are in [mind-art.md](mind-art.md). The images go into
`art-source/mind/inbox/<id>.png`, by hand in the Gemini app. They become
`art-source/mind/manifest.json` when the platform is built, run through
the same pipeline as Japanese's (chroma key, face-only composites,
WebP/AVIF, and a contact sheet).

**The character (proposed, open to change): 藤宮 蓮 Fujimiya Ren.**
- **Role:** Kurenai's colleague across the hall, and the space's
  **sceptic**. He takes the other side in a dialogue, is the one whose
  view Kurenai examines, plays your opponent in the Prisoner's Dilemma,
  and stands in the thought experiments.
- **Why he helps:** he **changes his mind out loud** when an argument
  beats him. That models the milestone the space cares most about (§6).
  He is sometimes right against Kurenai, so the dialogues are not a
  teacher always winning.
- **Personality:** dry, amused, contrarian on principle, but honest. He
  reads mystery novels and plays board games. He likes strategy, puzzles
  and paradoxes.
- **Look:** a late-twenties scholar who matches Kurenai's world: the
  Fuji hue to her crimson (mind-art.md has the full description).

**Voices: ElevenLabs library voices cannot be used on the free plan.**
I tested this on 24 October 2026 with the project key:
- the API refuses every library voice with HTTP 402 `paid_plan_required`
  ("Free users cannot use library voices via the API");
- that includes the two library voices already saved to your account
  (Akira and Yuki);
- the **21 built-in ("premade") voices work** (HTTP 200). They take no
  voice slot, so the three designed Japanese voices are untouched.

The options, in order of preference:
1. **A built-in voice (recommended, free, scripted).** For Ren, in British
   English to match the copy:
   - **George** (warm, captivating storyteller; British; middle-aged),
     with stability lowered for a dry delivery: recommended;
   - **Daniel** (steady, formal; British);
   - **Charlie** (young, confident; Australian), if you want Ren younger.

   Listen on the website (Voices → Default) and pick one; it is a single
   `voice_id` in the bake script.
2. **A library voice through the API.** It needs the Creator plan or $5
   of credits. That is a purchase, so it is your call; nothing here
   assumes it.
3. **A library voice by hand on the website.** Generate each line and
   download it. It is slow for dozens of lines. I could not check from
   the API whether the free website allows it.

**Kurenai's voice:** her Assistant cues are already ElevenLabs renders
(`assets/assistant/voice/`). Her Mind lines should use the same voice.
Which voice made those renders is not recorded in the repo. Name it when
the audio pack is built; if it is a library voice, the same free-plan
limit applies, and a built-in voice (Alice or Lily, both British) is the
fallback.

**The narrator** of the thought experiments is Kurenai (32t).

