/* Kurenai OS — data/ink-drills.js · KOS_INK_DRILLS (AUTHORED)
   The diagram drills (roadmap 6.6, design 30n): a diagram named and
   nothing else, drawn from memory on dotted paper, then this model laid
   over it in Teal at 50%. Every model is written by KurenaiOS and says so;
   a drill exists only where a topic has one (30n "Empty"). Coordinates are
   page units (a page is 1000 wide; an A4 sheet 1414 tall), so the model
   lines up with the page's own dotted grid at any size. Markup takes its
   colour from the stylesheet (currentColor), never a literal.

   {id, sid, refs, kind (the drill type chip), title, prompt, svg, features}
   `features` is the checklist the overlay is marked against.            */
(function () {
  "use strict";
  window.KOS_INK_DRILLS = [
    {
      id: "fsm-even-ones", sid: "compsci", refs: ["4.4.2.1"], kind: "FSM",
      title: "An FSM that accepts an even number of 1s",
      prompt: "Draw a finite state machine over {0, 1} that accepts a string when it has an even number of 1s. Mark the start state and the accepting state.",
      svg: '<g fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">' +
        '<circle cx="300" cy="420" r="80"/><circle cx="300" cy="420" r="66"/><circle cx="700" cy="420" r="80"/>' +
        '<path d="M120 420h96"/><path d="M200 404l16 16-16 16"/>' +
        '<path d="M368 372c90-70 174-70 264 0"/><path d="M612 356l20 16-26 6"/>' +
        '<path d="M632 468c-90 70-174 70-264 0"/><path d="M388 484l-20-16 26-6"/>' +
        '<path d="M260 346c-30-110 110-110 80 0"/><path d="M330 330l10 16 8-18"/>' +
        '<path d="M660 346c-30-110 110-110 80 0"/><path d="M730 330l10 16 8-18"/></g>' +
        '<g fill="currentColor" font-size="34" font-family="sans-serif" text-anchor="middle">' +
        '<text x="300" y="432">S0</text><text x="700" y="432">S1</text><text x="500" y="300">1</text><text x="500" y="560">1</text>' +
        '<text x="300" y="232">0</text><text x="700" y="232">0</text><text x="150" y="400">start</text></g>',
      features: ["Two states: an even count so far, and an odd one", "The start state is the even one (an arrow in)", "The even state is the accepting state (a double circle)", "1 moves between the two states, in both directions", "0 loops back to the same state, on both"]
    },
    {
      id: "bst-inserts", sid: "compsci", refs: ["4.2.5.1", "4.3.4.3"], kind: "Binary tree",
      title: "A binary search tree after seven inserts",
      prompt: "Insert 50, 30, 70, 20, 40, 60 and 80, in that order, into an empty binary search tree. Draw the tree.",
      svg: '<g fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round">' +
        '<path d="M470 240L330 380M530 240L670 380M300 440L220 580M330 440L410 580M670 440L590 580M700 440L780 580"/>' +
        '<circle cx="500" cy="210" r="52"/><circle cx="310" cy="410" r="52"/><circle cx="690" cy="410" r="52"/>' +
        '<circle cx="210" cy="610" r="52"/><circle cx="410" cy="610" r="52"/><circle cx="590" cy="610" r="52"/><circle cx="790" cy="610" r="52"/></g>' +
        '<g fill="currentColor" font-size="36" font-family="sans-serif" text-anchor="middle">' +
        '<text x="500" y="222">50</text><text x="310" y="422">30</text><text x="690" y="422">70</text>' +
        '<text x="210" y="622">20</text><text x="410" y="622">40</text><text x="590" y="622">60</text><text x="790" y="622">80</text></g>',
      features: ["50 is the root (the first insert)", "30 is 50's left child and 70 its right", "20 and 40 hang under 30, smaller to the left", "60 and 80 hang under 70, smaller to the left", "Three levels, every node with at most two children"]
    },
    {
      id: "half-adder", sid: "compsci", refs: ["4.6.4.1"], kind: "Logic circuit",
      title: "A half adder",
      prompt: "Draw a half adder: inputs A and B, outputs S (the sum) and C (the carry), from logic gates.",
      svg: '<g fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M180 300H440M180 520H440M300 300V560H440M240 520V340H440"/>' +
        '<path d="M430 290c40 50 40 110 0 160c80 0 140-30 180-80c-40-50-100-80-180-80z"/><path d="M410 290c40 50 40 110 0 160"/>' +
        '<path d="M440 500v120h90a60 60 0 000-120z"/>' +
        '<path d="M610 370H800M590 560H800"/></g>' +
        '<g fill="currentColor" font-size="34" font-family="sans-serif">' +
        '<text x="130" y="312">A</text><text x="130" y="532">B</text><text x="815" y="382">S</text><text x="815" y="572">C</text>' +
        '<text x="470" y="382" font-size="24">XOR</text><text x="470" y="572" font-size="24">AND</text></g>',
      features: ["Two inputs, A and B, each going to both gates", "An XOR gate gives the sum, S", "An AND gate gives the carry, C", "No other gates: a half adder has no carry in"]
    },
    {
      id: "normal-curve", sid: "maths", refs: ["S4.2"], kind: "Normal curve",
      title: "X ~ N(50, 10²), and P(X > 60)",
      prompt: "Sketch the distribution of X ~ N(50, 10²). Mark the mean and one standard deviation each side, and shade the region for P(X > 60).",
      svg: '<g fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round">' +
        '<path d="M100 640H900"/>' +
        '<path d="M120 636C260 632 330 600 390 500C440 410 470 300 500 300C530 300 560 410 610 500C670 600 740 632 880 636"/>' +
        '<path d="M500 300V640" stroke-dasharray="10 10"/><path d="M400 640v18M600 640v18"/></g>' +
        '<path d="M600 485C660 590 740 632 880 636V640H600z" fill="currentColor" fill-opacity="0.35"/>' +
        '<g fill="currentColor" font-size="32" font-family="sans-serif" text-anchor="middle">' +
        '<text x="500" y="694">50</text><text x="400" y="694">40</text><text x="600" y="694">60</text><text x="500" y="280">μ</text></g>',
      features: ["One symmetric bell, its peak at the mean, 50", "40 and 60 marked one standard deviation either side", "The tails come down towards the axis but never touch it", "The area to the right of 60 shaded for P(X > 60)"]
    },
    {
      id: "free-body", sid: "maths", refs: ["M8.4", "M8.5"], kind: "Free-body diagram",
      title: "A box pulled along a rough floor",
      prompt: "A box of weight W rests on a rough horizontal floor and is pulled by a horizontal force P, but does not move. Draw the forces on the box.",
      svg: '<g fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M150 600H850"/><rect x="400" y="440" width="200" height="160"/>' +
        '<path d="M500 520V760M484 740l16 20 16-20"/><path d="M500 520V300M484 320l16-20 16 20"/>' +
        '<path d="M600 520H800M780 504l20 16-20 16"/><path d="M400 584H220M240 568l-20 16 20 16"/></g>' +
        '<g fill="currentColor" font-size="34" font-family="sans-serif" text-anchor="middle">' +
        '<text x="530" y="800">W</text><text x="530" y="290">R</text><text x="830" y="532">P</text><text x="190" y="572">F</text></g>',
      features: ["The weight W straight down", "The normal reaction R straight up, from the floor", "The pull P along the floor", "Friction F along the floor, opposing P", "Every arrow starts on the box"]
    }
  ];
})();
