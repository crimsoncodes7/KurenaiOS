/* Kurenai OS — deep content: Mechanics outline entries still to be
   rewritten (Edexcel Paper 3 sections 8–9, refs M8–M9). M6 and M7 live in
   maths-mech-m7.js; Statistics S1–S5 in maths-stats-s1.js … s5.js. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {

C["maths:M8.1"] = {
  "notes": [
    {
      "h": "Newton's First Law"
    },
    {
      "callout": {
        "t": "info",
        "h": "The Law",
        "body": "Object stays at rest or constant velocity unless acted on by a resultant force."
      }
    },
    {
      "steps": [
        {
          "h": "Equilibrium",
          "m": "Sum of forces is zero. $\\sum F_x = 0$ and $\\sum F_y = 0$.",
          "n": "Constant speed in straight line is equilibrium."
        }
      ]
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Newton's First Law",
        "body": "An object remains at rest or at constant velocity UNLESS a resultant force acts. Equilibrium: $\\sum F_x = 0$ and $\\sum F_y = 0$. Constant speed in a straight line means zero resultant force — drives and resistances balance."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Constant Speed Requires a Driving Force",
        "body": "A driving force is needed to maintain constant speed ONLY to balance resistances (friction, drag). If there were no resistances, zero net force would maintain constant speed by N1L. The driving force balances resistance, not speed."
      }
    }
  ],
  "flashcards": [
    [
      "What is inertia?",
      "Resistance to change in motion. Measured by mass."
    ],
    [
      "Resultant force on car at steady speed?",
      "Zero."
    ],
    [
      "State Newton's first law.",
      "A body stays at rest or moves with constant velocity unless acted on by a resultant force."
    ],
    [
      "What is meant by equilibrium?",
      "The resultant force is zero (so no acceleration)."
    ],
    [
      "Name three common forces in mechanics.",
      "Weight, normal reaction, friction, tension, thrust (any three)."
    ],
    [
      "What is the normal reaction force?",
      "The contact force a surface exerts perpendicular to itself."
    ],
    [
      "What is tension?",
      "A pulling force along a string or rod."
    ],
    [
      "If a body moves at constant velocity, the resultant force is...?",
      "Zero."
    ]
  ],
  "quiz": [
    {
      "q": "$1000\\text{kg}$ car at steady $30\\text{ m/s}$. Net force?",
      "opts": [
        "$30000$",
        "$0$",
        "$9800$"
      ],
      "ans": 1,
      "why": "Constant velocity."
    },
    {
      "q": "Newton's first law concerns bodies with...?",
      "opts": [
        "no resultant force",
        "increasing force",
        "friction only",
        "weight only"
      ],
      "ans": 0,
      "why": "Zero resultant means rest or constant velocity."
    },
    {
      "q": "Equilibrium means the resultant force is...?",
      "opts": [
        "maximum",
        "zero",
        "weight",
        "upward"
      ],
      "ans": 1,
      "why": "No net force."
    },
    {
      "q": "The normal reaction acts...?",
      "opts": [
        "along the surface",
        "perpendicular to the surface",
        "downward always",
        "with friction"
      ],
      "ans": 1,
      "why": "Perpendicular to the contact surface."
    },
    {
      "q": "A book resting on a table is in...?",
      "opts": [
        "acceleration",
        "equilibrium",
        "free fall",
        "tension"
      ],
      "ans": 1,
      "why": "Forces balance."
    }
  ],
  "exam": [
    {
      "q": "$F_1 = (3i+5j), F_2 = (-i+2j)$. Find $F_3$ for equilibrium.",
      "marks": 3,
      "ms": [
        "$F_1 + F_2 + F_3 = 0$ (1)",
        "$(2i + 7j) + F_3 = 0$ (1)",
        "$F_3 = -2i - 7j$ (1)"
      ]
    },
    {
      "q": "A box rests in equilibrium on a horizontal floor. Name the two vertical forces and state how they are related.",
      "marks": 2,
      "ms": [
        "Weight (down) and normal reaction (up). (1)",
        "They are equal in magnitude (resultant zero). (1)"
      ]
    },
    {
      "q": "A lift moves at constant velocity carrying a 60 kg person ($g=9.8$). (a) State why the resultant force is zero. (b) Find the normal reaction on the person.",
      "marks": 6,
      "ms": [
        "(a) Constant velocity means no acceleration. (1)",
        "By Newton's first law the resultant force is zero. (1)",
        "Forces on the person: weight down, reaction up. (1)",
        "Weight $=mg=60\\times9.8=588$ N. (1)",
        "Resultant zero $\\Rightarrow R=W$. (1)",
        "$R=588$ N. (1)"
      ]
    }
  ]
};

C["maths:M8.2"] = {
  "notes": [
    {
      "h": "Newton's Second Law: $F=ma$"
    },
    {
      "steps": [
        {
          "h": "Routine",
          "m": "1. Draw diagram. 2. Resolve. 3. $F_{net} = ma$ along motion; $0$ perp.",
          "n": "Weight is $mg$ (Newtons), mass is $m$ (kg)."
        }
      ]
    },
    {
      "callout": {
        "t": "tip",
        "h": "Sin Slides",
        "body": "On a slope, $mg\\sin\\theta$ slides it down; $mg\\cos\\theta$ presses it in."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "$F = ma$ Routine",
        "body": "Draw diagram. Resolve forces. Apply $F_{\\text{net}} = ma$ along motion; $0$ perpendicular. On slope: $mg\\sin\\theta$ component along slope, $mg\\cos\\theta$ perpendicular (= normal reaction $R$ if smooth). Weight $= mg$ (Newtons)."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Weight = Mass",
        "body": "Weight is a FORCE: $W = mg$ in Newtons. Mass is in kg and measures inertia. Substituting mass (kg) for weight in $F = ma$ gives dimensionally wrong answers. Always convert mass to weight when needed."
      }
    }
  ],
  "flashcards": [
    [
      "Newton's Second Law?",
      "$F = ma$."
    ],
    [
      "Weight vs Mass?",
      "$W=mg$ (Force); $m$ is matter (Inertia)."
    ],
    [
      "State Newton's second law.",
      "Resultant force $=$ mass $\\times$ acceleration ($F=ma$)."
    ],
    [
      "Rearrange $F=ma$ for acceleration.",
      "$a=\\dfrac{F}{m}$."
    ],
    [
      "What does a larger resultant force do (same mass)?",
      "Produces a larger acceleration."
    ],
    [
      "Units check for $F=ma$?",
      "N $=$ kg $\\times$ m s$^{-2}$."
    ],
    [
      "What force is needed to accelerate 2 kg at 3 m s$^{-2}$?",
      "$F=ma=6$ N."
    ],
    [
      "If the resultant force is zero, the acceleration is...?",
      "Zero (constant velocity)."
    ]
  ],
  "quiz": [
    {
      "q": "Net $12\\text{N}$ on $3\\text{kg}$. Accel?",
      "opts": [
        "$4$",
        "$36$",
        "$0.25$"
      ],
      "ans": 0,
      "why": "$12/3 = 4$."
    },
    {
      "q": "$F=ma$. A 5 kg mass under 20 N accelerates at...?",
      "opts": [
        "$4$ m s$^{-2}$",
        "$100$ m s$^{-2}$",
        "$0.25$ m s$^{-2}$",
        "$15$ m s$^{-2}$"
      ],
      "ans": 0,
      "why": "$a=F/m=20/5=4$."
    },
    {
      "q": "Doubling the resultant force (same mass) doubles the...?",
      "opts": [
        "mass",
        "acceleration",
        "weight",
        "time"
      ],
      "ans": 1,
      "why": "$a\\propto F$."
    },
    {
      "q": "Force to give 3 kg an acceleration of 2 m s$^{-2}$?",
      "opts": [
        "$1.5$ N",
        "$5$ N",
        "$6$ N",
        "$2/3$ N"
      ],
      "ans": 2,
      "why": "$F=ma=6$ N."
    },
    {
      "q": "If $F=0$ then $a=$?",
      "opts": [
        "$g$",
        "$0$",
        "$m$",
        "max"
      ],
      "ans": 1,
      "why": "No resultant force, no acceleration."
    }
  ],
  "exam": [
    {
      "q": "$4\\text{kg}$ block pushed up smooth $25^\\circ$ slope by $30\\text{N}$ parallel. Accel?",
      "marks": 4,
      "ms": [
        "$30 - 4g\\sin 25 = 4a$ (2)",
        "$13.43 = 4a$ (1)",
        "$a = 3.36\\text{ m/s}^2$ (1)"
      ]
    },
    {
      "q": "A resultant force of 24 N acts on a 4 kg object. Find its acceleration.",
      "marks": 2,
      "ms": [
        "$a=\\dfrac{F}{m}=\\dfrac{24}{4}$. (1)",
        "$=6$ m s$^{-2}$. (1)"
      ]
    },
    {
      "q": "A 1200 kg car experiences a driving force of 4000 N and a resistance of 1000 N. (a) Find the resultant force. (b) Find the acceleration. (c) Find the time to reach 15 m s$^{-1}$ from rest.",
      "marks": 6,
      "ms": [
        "(a) Resultant $=4000-1000=3000$ N. (1)",
        "(b) $a=\\dfrac{3000}{1200}$. (1)",
        "$=2.5$ m s$^{-2}$. (1)",
        "(c) $v=u+at\\Rightarrow15=0+2.5t$. (1)",
        "$t=\\dfrac{15}{2.5}$. (1)",
        "$=6$ s. (1)"
      ]
    }
  ]
};

C["maths:M8.3"] = {
  "notes": [
    {
      "h": "Weight and Gravity"
    },
    {
      "callout": {
        "t": "info",
        "h": "Gravity",
        "body": "$W = mg$. $g = 9.8\\text{ m/s}^2$. Acceleration under gravity alone is $a=-g$."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Weight and Gravity",
        "body": "$W = mg$, unit: Newton. $g = 9.8\\text{ m s}^{-2}$ (use $10$ only if told). Free fall: $a = g$ downward regardless of mass. $g$ is the same for all objects (Galileo). Heavier objects do not fall faster."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Object in Free Fall Has No Weight",
        "body": "Weight ($W = mg$) always acts on an object — it does not disappear in free fall. In free fall there is NO NORMAL REACTION, giving the sensation of weightlessness, but gravitational force ($mg$) still acts throughout."
      }
    }
  ],
  "flashcards": [
    [
      "Unit of Weight?",
      "Newton."
    ],
    [
      "Does $g$ depend on mass?",
      "No."
    ],
    [
      "Formula for weight?",
      "$W=mg$ ($g\\approx9.8$ m s$^{-2}$)."
    ],
    [
      "Difference between mass and weight?",
      "Mass (kg) is the amount of matter; weight (N) is the gravitational force on it."
    ],
    [
      "Weight of a 10 kg mass ($g=9.8$)?",
      "$98$ N."
    ],
    [
      "Does mass change with location? Does weight?",
      "Mass stays constant; weight depends on $g$ (location)."
    ],
    [
      "Direction of weight?",
      "Vertically downward."
    ],
    [
      "What is $g$ approximately on Earth?",
      "$9.8$ m s$^{-2}$ (sometimes 9.81)."
    ]
  ],
  "quiz": [
    {
      "q": "Weight of $5\\text{kg}$?",
      "opts": [
        "$5$",
        "$49$",
        "$9.8$"
      ],
      "ans": 1,
      "why": "$5 \\times 9.8 = 49$."
    },
    {
      "q": "Weight $=$?",
      "opts": [
        "$m/g$",
        "$mg$",
        "$m+g$",
        "$ma$ only"
      ],
      "ans": 1,
      "why": "$W=mg$."
    },
    {
      "q": "A 5 kg mass weighs ($g=9.8$)...?",
      "opts": [
        "$5$ N",
        "$49$ N",
        "$9.8$ N",
        "$0.5$ N"
      ],
      "ans": 1,
      "why": "$5\\times9.8=49$ N."
    },
    {
      "q": "Mass is measured in...?",
      "opts": [
        "newtons",
        "kilograms",
        "m s$^{-2}$",
        "joules"
      ],
      "ans": 1,
      "why": "kg."
    },
    {
      "q": "Weight acts...?",
      "opts": [
        "horizontally",
        "vertically down",
        "up",
        "along the surface"
      ],
      "ans": 1,
      "why": "Toward the Earth's centre."
    }
  ],
  "exam": [
    {
      "q": "$500\\text{kg}$ lift lowered at $1.2\\text{ m/s}^2$. Tension?",
      "marks": 3,
      "ms": [
        "$mg - T = ma$ (1)",
        "$4900 - T = 600$ (1)",
        "$T = 4300\\text{N}$ (1)"
      ]
    },
    {
      "q": "Find the weight of a 25 kg object ($g=9.8$).",
      "marks": 2,
      "ms": [
        "$W=mg=25\\times9.8$. (1)",
        "$=245$ N. (1)"
      ]
    },
    {
      "q": "A 2 kg stone is dropped from rest ($g=9.8$). (a) State its weight. (b) Find its acceleration (no air resistance). (c) Find its speed after 3 s.",
      "marks": 6,
      "ms": [
        "(a) $W=mg=2\\times9.8=19.6$ N. (1)",
        "(b) Only force is weight; $a=\\dfrac{W}{m}=g$. (1)",
        "$=9.8$ m s$^{-2}$. (1)",
        "(c) $v=u+at=0+9.8(3)$. (1)",
        "$=29.4$ m s$^{-1}$. (1)",
        "(downward). (1)"
      ]
    }
  ]
};

C["maths:M8.4"] = {
  "notes": [
    {
      "h": "Newton's Third Law"
    },
    {
      "callout": {
        "t": "info",
        "h": "The Law",
        "body": "Every action has an equal and opposite reaction acting on DIFFERENT bodies."
      }
    },
    {
      "steps": [
        {
          "h": "Connected Particles",
          "m": "Tension $T$ is same throughout for light inextensible strings.",
          "n": "Consider whole system for $a$, single particle for $T$."
        }
      ]
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Newton's Third Law Pairs",
        "body": "N3L pair: equal magnitude, opposite direction, same TYPE of force, act on DIFFERENT bodies. Examples: Earth pulls ball (gravity) ↔ ball pulls Earth (gravity). Connected particles: tension $T$ same throughout a light inextensible string over a smooth pulley."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Normal Reaction and Weight are N3L Pair",
        "body": "Normal reaction ($R$) and weight ($W = mg$) are NOT a Newton's 3rd Law pair — they act on the SAME body. N3L partner of weight (Earth pulling object) is the object pulling Earth. N3L partner of $R$ is the object pushing down on the surface."
      }
    }
  ],
  "flashcards": [
    [
      "State N3L.",
      "Equal magnitude, opposite direction, same type, different bodies."
    ],
    [
      "Smooth pulley implies?",
      "Same tension on both sides."
    ],
    [
      "State Newton's third law.",
      "Every action has an equal and opposite reaction (forces act in pairs on different bodies)."
    ],
    [
      "Do action-reaction forces act on the same body?",
      "No — on two different bodies, so they don't cancel."
    ],
    [
      "Give an example of a third-law pair.",
      "A book pushes down on a table; the table pushes up on the book."
    ],
    [
      "Are action-reaction forces equal in magnitude?",
      "Yes, equal and opposite."
    ],
    [
      "Why don't third-law pairs cancel out?",
      "They act on different objects."
    ],
    [
      "When you walk, what propels you forward?",
      "The ground's reaction to the backward push of your foot."
    ]
  ],
  "quiz": [
    {
      "q": "Partner of 'Earth pulls moon'?",
      "opts": [
        "Moon pulls Earth",
        "Gravity",
        "Centripetal"
      ],
      "ans": 0,
      "why": "Swap bodies."
    },
    {
      "q": "Newton's third-law forces are...?",
      "opts": [
        "unequal",
        "equal and opposite, on different bodies",
        "on the same body",
        "always zero"
      ],
      "ans": 1,
      "why": "Equal/opposite pair on two bodies."
    },
    {
      "q": "A rocket moves forward by ejecting gas backward. This is...?",
      "opts": [
        "first law",
        "second law",
        "third law",
        "friction"
      ],
      "ans": 2,
      "why": "Action-reaction."
    },
    {
      "q": "Action-reaction pairs do NOT cancel because they act on...?",
      "opts": [
        "the same body",
        "different bodies",
        "nothing",
        "the ground"
      ],
      "ans": 1,
      "why": "Different objects."
    },
    {
      "q": "If A pushes B with 10 N, B pushes A with...?",
      "opts": [
        "0 N",
        "5 N",
        "10 N",
        "20 N"
      ],
      "ans": 2,
      "why": "Equal and opposite."
    }
  ],
  "exam": [
    {
      "q": "$2\\text{kg}$ held by horiz $15\\text{N}$ and angled $T$. Find $\\theta$.",
      "marks": 4,
      "ms": [
        "$T\\cos\\theta = 15, T\\sin\\theta = 19.6$ (2)",
        "$\\tan\\theta = 1.306 \\Rightarrow \\theta = 52.6^\\circ$ (2)"
      ]
    },
    {
      "q": "A swimmer pushes back on the water. State the reaction force and its effect.",
      "marks": 2,
      "ms": [
        "The water pushes the swimmer forward with an equal and opposite force. (1)",
        "This propels the swimmer through the water. (1)"
      ]
    },
    {
      "q": "A 50 kg box sits on the floor. (a) Identify the Newton's third-law pair to the box's weight. (b) Explain why this pair does not balance the weight in the box's equilibrium. (c) Name the force that balances the weight.",
      "marks": 6,
      "ms": [
        "(a) The box's weight is the Earth pulling the box; the pair is the box pulling the Earth up. (1)",
        "These are equal and opposite. (1)",
        "(b) The pair acts on the EARTH, not on the box. (1)",
        "So it cannot balance forces on the box. (1)",
        "(c) The normal reaction from the floor balances the box's weight. (1)",
        "Reaction and weight act on the box and are equal (equilibrium). (1)"
      ]
    }
  ]
};

C["maths:M8.5"] = {
  "notes": [
    {
      "h": "Resultant Forces"
    },
    {
      "callout": {
        "t": "tip",
        "h": "Vector Net",
        "body": "Net force is the vector sum of all individual forces."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Finding Resultant Force",
        "body": "Resultant = vector sum of all forces. For two perpendicular forces: $|R| = \\sqrt{P^2 + Q^2}$, direction $\\theta = \\arctan(Q/P)$. Resolve into components, sum each axis separately, then combine."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Resultant = Sum of Magnitudes",
        "body": "Resultant magnitude equals the sum of individual magnitudes ONLY if all forces point in the same direction. For forces at an angle, use vector addition (components or cosine rule). Two $5\\text{ N}$ forces at $90°$ give resultant $\\approx 7.07\\text{ N}$, not $10\\text{ N}$."
      }
    }
  ],
  "flashcards": [
    [
      "How to find resultant of $P, Q$ at $90^\\circ$?",
      "$\\sqrt{P^2 + Q^2}$."
    ],
    [
      "What is a resultant force?",
      "The single force equivalent to the vector sum of all forces."
    ],
    [
      "How do you add perpendicular forces?",
      "Use Pythagoras for magnitude and trig for direction."
    ],
    [
      "What is the condition for equilibrium with forces?",
      "The resultant (vector sum) is zero — components balance in each direction."
    ],
    [
      "How do you resolve a force at angle $\\theta$?",
      "Horizontal $F\\cos\\theta$, vertical $F\\sin\\theta$."
    ],
    [
      "Resultant of perpendicular forces 3 N and 4 N?",
      "$\\sqrt{3^2+4^2}=5$ N."
    ],
    [
      "For equilibrium, the sum of horizontal components equals...?",
      "Zero (and likewise vertical)."
    ],
    [
      "What does it mean to resolve a force?",
      "To split it into perpendicular (e.g. horizontal and vertical) components."
    ]
  ],
  "quiz": [
    {
      "q": "$4\\text{kg}, 20\\text{N}$ push, $4\\text{N}$ resistance. $a = ?$",
      "opts": [
        "$4$",
        "$5$",
        "$6$"
      ],
      "ans": 0,
      "why": "$(20-4)/4 = 4$."
    },
    {
      "q": "Resultant of 3 N east and 4 N north?",
      "opts": [
        "$7$ N",
        "$5$ N",
        "$1$ N",
        "$12$ N"
      ],
      "ans": 1,
      "why": "$\\sqrt{9+16}=5$."
    },
    {
      "q": "For equilibrium, the resultant force is...?",
      "opts": [
        "maximum",
        "zero",
        "weight",
        "the largest force"
      ],
      "ans": 1,
      "why": "Vector sum zero."
    },
    {
      "q": "Horizontal component of force $F$ at angle $\\theta$ to horizontal?",
      "opts": [
        "$F\\sin\\theta$",
        "$F\\cos\\theta$",
        "$F\\tan\\theta$",
        "$F$"
      ],
      "ans": 1,
      "why": "$F\\cos\\theta$."
    },
    {
      "q": "Two equal and opposite forces give a resultant of...?",
      "opts": [
        "double",
        "zero",
        "half",
        "maximum"
      ],
      "ans": 1,
      "why": "They cancel."
    }
  ],
  "exam": [
    {
      "q": "$5\\text{kg}$ block on smooth $30^\\circ$ slope. Accel?",
      "marks": 2,
      "ms": [
        "$mg\\sin 30 = ma \\Rightarrow g\\sin 30 = a$ (1)",
        "$a = 4.9\\text{ m/s}^2$ (1)"
      ]
    },
    {
      "q": "Forces of 6 N east and 8 N north act on a point. Find the magnitude of the resultant.",
      "marks": 3,
      "ms": [
        "Perpendicular forces: use Pythagoras. (1)",
        "$R=\\sqrt{6^2+8^2}=\\sqrt{100}$. (1)",
        "$=10$ N. (1)"
      ]
    },
    {
      "q": "A particle is in equilibrium under three forces: $5$ N east, $P$ N west, and $Q$ N at $90^\\circ$ (north). Given the system balances, with a fourth force of $5$ N west already opposing the east force, find $P$ and explain the role of $Q$.",
      "marks": 6,
      "ms": [
        "Resolve horizontally: east forces = west forces. (1)",
        "$5=P$ (the 5 N east is balanced). (1)",
        "So $P=5$ N. (1)",
        "Resolve vertically: $Q$ must be balanced by an equal opposite vertical force. (1)",
        "For equilibrium the vertical components must also sum to zero. (1)",
        "So $Q$ requires an equal and opposite vertical force ($Q$ alone would break equilibrium). (1)"
      ]
    }
  ]
};

C["maths:M8.6"] = {
  "notes": [
    {
      "h": "Friction"
    },
    {
      "callout": {
        "t": "def",
        "h": "Model",
        "body": "$F \\le \\mu R$. Limiting is $F = \\mu R$ (about to slip)."
      }
    },
    {
      "steps": [
        {
          "h": "Solving",
          "m": "1. Find $R$ from perp. 2. $F = \\mu R$ if moving/limiting. 3. $F = ma$ along motion.",
          "n": "Friction opposes motion."
        }
      ]
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Friction Model",
        "body": "$F \\le \\mu R$. Limiting (about to slip or moving): $F = \\mu R$. Find $R$ from perpendicular equilibrium first. Friction OPPOSES motion (or tendency of motion). $\\mu$ has no units."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Friction Always Equals $\\mu R$",
        "body": "Friction is $F = \\mu R$ ONLY at the limiting case (on the point of sliding, or already moving). When stationary and not at the limit, friction is whatever value is needed for equilibrium — which may be less than $\\mu R$."
      }
    }
  ],
  "flashcards": [
    [
      "Limiting friction formula?",
      "$F = \\mu R$."
    ],
    [
      "Direction of friction?",
      "Opposite to potential motion."
    ],
    [
      "State the friction model.",
      "$F\\le\\mu R$, where $\\mu$ is the coefficient of friction and $R$ the normal reaction."
    ],
    [
      "When is friction at its maximum?",
      "When the object is on the point of sliding (limiting equilibrium): $F=\\mu R$."
    ],
    [
      "What does a larger $\\mu$ mean?",
      "Rougher contact — more friction available."
    ],
    [
      "Direction of friction?",
      "Opposes (relative) motion or tendency to move."
    ],
    [
      "Maximum friction for $\\mu=0.4$, $R=20$ N?",
      "$F_{max}=\\mu R=8$ N."
    ],
    [
      "Can friction exceed $\\mu R$?",
      "No — $\\mu R$ is the maximum available."
    ]
  ],
  "quiz": [
    {
      "q": "$\\mu=0.4, R=50$. Max friction?",
      "opts": [
        "$20$",
        "$125$",
        "$50$"
      ],
      "ans": 0,
      "why": "$0.4 \\times 50 = 20$."
    },
    {
      "q": "The maximum friction force is...?",
      "opts": [
        "$R/\\mu$",
        "$\\mu R$",
        "$\\mu+R$",
        "$\\mu R^2$"
      ],
      "ans": 1,
      "why": "$F_{max}=\\mu R$."
    },
    {
      "q": "Friction acts...?",
      "opts": [
        "along motion",
        "opposing motion/tendency",
        "perpendicular to surface",
        "downward"
      ],
      "ans": 1,
      "why": "It resists sliding."
    },
    {
      "q": "Limiting equilibrium is when...?",
      "opts": [
        "$F=0$",
        "$F=\\mu R$ (about to slide)",
        "$R=0$",
        "$\\mu=0$"
      ],
      "ans": 1,
      "why": "Friction is at maximum."
    },
    {
      "q": "$\\mu=0.5$, $R=30$ N. Max friction?",
      "opts": [
        "$15$ N",
        "$60$ N",
        "$30.5$ N",
        "$0.5$ N"
      ],
      "ans": 0,
      "why": "$0.5\\times30=15$ N."
    }
  ],
  "exam": [
    {
      "q": "$10\\text{kg}, \\mu=0.3$. $P=40\\text{N}$ applied. Accel?",
      "marks": 4,
      "ms": [
        "$R=98, F_{max}=29.4$ (1)",
        "$40 > 29.4 \\Rightarrow$ moves (1)",
        "$40 - 29.4 = 10a \\Rightarrow a = 1.06$ (2)"
      ]
    },
    {
      "q": "A block on a horizontal surface has $\\mu=0.3$ and normal reaction $R=50$ N. Find the maximum friction force.",
      "marks": 2,
      "ms": [
        "$F_{max}=\\mu R=0.3\\times50$. (1)",
        "$=15$ N. (1)"
      ]
    },
    {
      "q": "A 4 kg block ($g=9.8$) on a rough horizontal floor has $\\mu=0.25$. A horizontal force $P$ is applied. (a) Find the normal reaction. (b) Find the maximum friction. (c) Determine whether the block moves when $P=12$ N, and if so its acceleration.",
      "marks": 6,
      "ms": [
        "(a) $R=mg=4\\times9.8=39.2$ N. (1)",
        "(b) $F_{max}=\\mu R=0.25\\times39.2=9.8$ N. (1)",
        "(c) $P=12$ N $>9.8$ N, so the block moves. (1)",
        "Resultant $=P-F_{max}=12-9.8=2.2$ N. (1)",
        "$a=\\dfrac{2.2}{4}$. (1)",
        "$=0.55$ m s$^{-2}$. (1)"
      ]
    }
  ]
};

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
