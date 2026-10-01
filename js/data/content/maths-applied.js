/* Kurenai OS — deep content: the Mechanics outline entry still to be
   rewritten (Edexcel Paper 3 section 9, ref M9). M6–M7 live in
   maths-mech-m7.js, M8 in maths-mech-m8.js; Statistics S1–S5 in
   maths-stats-s1.js … s5.js. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {

C["maths:M9.1"] = {
  "notes": [
    {
      "h": "Moments"
    },
    {
      "callout": {
        "t": "def",
        "h": "Definition",
        "body": "Moment $= F \\times d$ (perpendicular distance). Units: $\\text{Nm}$."
      }
    },
    {
      "callout": {
        "t": "info",
        "h": "Principle of Moments",
        "body": "In equilibrium, Clockwise Moments = Anticlockwise Moments about ANY point."
      }
    },
    {
      "steps": [
        {
          "h": "Beam Problems",
          "m": "1. Diagram. 2. $\\sum F_y = 0$. 3. $\\sum M = 0$. Solve.",
          "n": "Weight of uniform beam acts at center."
        }
      ]
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Principle of Moments",
        "body": "Moment $= F \\times d_{\\perp}$ (perpendicular distance), unit Nm. Equilibrium: CW moments $=$ ACW moments about ANY chosen point. Choose pivot at an unknown force to eliminate it from the equation. Weight of uniform rod acts at midpoint."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Can Only Take Moments About a Support",
        "body": "You can take moments about ANY point on (or off) the beam — not just supports. Taking moments about a point where an unknown force acts eliminates that unknown, making it the strategic pivot choice. There is no restriction to supports or pivots."
      }
    }
  ],
  "flashcards": [
    [
      "Moment formula?",
      "$F \\times d_{\\perp}$."
    ],
    [
      "Reaction at support B if tilting about A?",
      "Zero."
    ],
    [
      "Define the moment of a force.",
      "Force $\\times$ perpendicular distance from the pivot."
    ],
    [
      "Units of a moment?",
      "Newton-metres (N m)."
    ],
    [
      "Condition for a body in equilibrium (rotation)?",
      "Total clockwise moments = total anticlockwise moments."
    ],
    [
      "What is the principle of moments?",
      "For equilibrium, sum of clockwise moments about any point = sum of anticlockwise moments."
    ],
    [
      "Moment of a 10 N force at 0.5 m from a pivot?",
      "$10\\times0.5=5$ N m."
    ],
    [
      "What happens if moments are unbalanced?",
      "The body rotates (turns) about the pivot."
    ]
  ],
  "quiz": [
    {
      "q": "$20\\text{N}$ at $3\\text{m}$ at $90^\\circ$. Moment?",
      "opts": [
        "$60$",
        "$6.6$",
        "$23$"
      ],
      "ans": 0,
      "why": "$20 \\times 3 = 60$."
    },
    {
      "q": "Moment $=$?",
      "opts": [
        "force $+$ distance",
        "force $\\times$ perpendicular distance",
        "force $/$ distance",
        "mass $\\times$ distance"
      ],
      "ans": 1,
      "why": "Definition of a moment."
    },
    {
      "q": "Units of a moment?",
      "opts": [
        "N",
        "N m",
        "m",
        "kg"
      ],
      "ans": 1,
      "why": "Newton-metres."
    },
    {
      "q": "For equilibrium, clockwise moments equal...?",
      "opts": [
        "zero",
        "anticlockwise moments",
        "the weight",
        "the reaction"
      ],
      "ans": 1,
      "why": "Principle of moments."
    },
    {
      "q": "A 20 N force at 0.4 m has moment...?",
      "opts": [
        "$8$ N m",
        "$50$ N m",
        "$20.4$ N m",
        "$0.4$ N m"
      ],
      "ans": 0,
      "why": "$20\\times0.4=8$."
    }
  ],
  "exam": [
    {
      "q": "Uniform $4\\text{m}, 5\\text{kg}$ rod. Support $A(0)$ and $C(3)$. $10\\text{kg}$ at $B(4)$. Reaction $C$?",
      "marks": 5,
      "ms": [
        "Moments about $A$: $(5g \\times 2) + (10g \\times 4) = 3R_c$ (2)",
        "$50g = 3R_c$ (1)",
        "$R_c = 163.3\\text{N}$ (2)"
      ]
    },
    {
      "q": "A force of 15 N acts at a perpendicular distance of 0.6 m from a pivot. Find its moment.",
      "marks": 2,
      "ms": [
        "Moment $=$ force $\\times$ distance $=15\\times0.6$. (1)",
        "$=9$ N m. (1)"
      ]
    },
    {
      "q": "A uniform beam of length 4 m and weight 60 N rests on a pivot 1 m from the left end. A weight $W$ hangs from the left end to keep it in equilibrium. Find $W$ (take moments about the pivot; the beam's weight acts at its centre).",
      "marks": 6,
      "ms": [
        "Beam's weight 60 N acts at the centre, 2 m from the left, i.e. 1 m to the RIGHT of the pivot. (1)",
        "Clockwise moment (beam weight) $=60\\times1=60$ N m. (1)",
        "$W$ acts 1 m to the LEFT of the pivot. (1)",
        "Anticlockwise moment $=W\\times1$. (1)",
        "Equilibrium: $W\\times1=60$. (1)",
        "$W=60$ N. (1)"
      ]
    }
  ]
};

})(window.KOS_CONTENT);
