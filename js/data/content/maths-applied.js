/* Kurenai OS — deep content: Applied Mathematics (Stats/Mech) */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {

C["maths:S6.1"] = {
  "notes": [
    {
      "h": "S.I. Units in Mechanics"
    },
    {
      "callout": {
        "t": "def",
        "h": "Base Units",
        "body": [
          {
            "kv": [
              [
                "Mass",
                "Kilogram ($\\text{kg}$)"
              ],
              [
                "Length",
                "Metre ($\\text{m}$)"
              ],
              [
                "Time",
                "Second ($\\text{s}$)"
              ]
            ]
          }
        ]
      }
    },
    {
      "table": {
        "head": [
          "Quantity",
          "Standard Unit",
          "Base Units"
        ],
        "rows": [
          [
            "Velocity ($v$)",
            "$\\text{m s}^{-1}$",
            "$\\text{m/s}$"
          ],
          [
            "Acceleration ($a$)",
            "$\\text{m s}^{-2}$",
            "$\\text{m/s}^2$"
          ],
          [
            "Force ($F$)",
            "Newton ($\\text{N}$)",
            "$\\text{kg m s}^{-2}$"
          ],
          [
            "Energy ($E$)",
            "Joule ($\\text{J}$)",
            "$\\text{kg m}^2 \\text{s}^{-2}$"
          ]
        ]
      }
    },
    {
      "steps": [
        {
          "h": "Dimensional Homogeneity",
          "m": "Check that every term in an equation (e.g. $s = ut + \\frac{1}{2}at^2$) has the same base units.",
          "n": "Constants like $\\frac{1}{2}$ are dimensionless."
        }
      ]
    },
    {
      "callout": {
        "t": "memorise",
        "h": "SI Base Units in Mechanics",
        "body": "Mass — kg. Length — m. Time — s. Velocity — $\\text{m s}^{-1}$. Acceleration — $\\text{m s}^{-2}$. Force — Newton ($\\text{N}$) $= \\text{kg m s}^{-2}$. Convert km/h: $\\div 3.6$ to get m/s."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Weight is Measured in kg",
        "body": "Weight is a FORCE measured in Newtons ($W = mg$). Mass is measured in kg. Saying an object 'weighs $5\\text{ kg}$' is everyday language, but in mechanics weight must be in Newtons."
      }
    }
  ],
  "flashcards": [
    [
      "Base units of Newton?",
      "$\\text{kg m s}^{-2}$."
    ],
    [
      "Why is kg special?",
      "Only base unit with a prefix."
    ],
    [
      "SI base units for mass, length and time?",
      "kilogram (kg), metre (m), second (s)."
    ],
    [
      "SI unit of force, in base units?",
      "Newton (N) $=$ kg·m·s$^{-2}$."
    ],
    [
      "Units of velocity and acceleration?",
      "m s$^{-1}$ and m s$^{-2}$."
    ],
    [
      "What is a derived unit?",
      "A unit built from base units, e.g. N $=$ kg m s$^{-2}$."
    ],
    [
      "Units of momentum?",
      "kg m s$^{-1}$ (equivalently N s)."
    ],
    [
      "Why check units in a formula?",
      "To verify it is dimensionally consistent — a useful check against errors."
    ]
  ],
  "quiz": [
    {
      "q": "Convert $90\\text{ km/h}$ to $\\text{m/s}$.",
      "opts": [
        "$25$",
        "$32.4$",
        "$900$"
      ],
      "ans": 0,
      "why": "$90,000 / 3,600 = 25$."
    },
    {
      "q": "The newton in base units is...?",
      "opts": [
        "kg m s$^{-1}$",
        "kg m s$^{-2}$",
        "kg s$^{-1}$",
        "kg m$^2$"
      ],
      "ans": 1,
      "why": "$F=ma\\Rightarrow$ kg·m·s$^{-2}$."
    },
    {
      "q": "SI unit of acceleration?",
      "opts": [
        "m s$^{-1}$",
        "m s$^{-2}$",
        "m",
        "N"
      ],
      "ans": 1,
      "why": "Rate of change of velocity."
    },
    {
      "q": "Which is a base quantity?",
      "opts": [
        "force",
        "velocity",
        "mass",
        "energy"
      ],
      "ans": 2,
      "why": "Mass is fundamental."
    },
    {
      "q": "Momentum has units...?",
      "opts": [
        "kg m s$^{-1}$",
        "N",
        "m s$^{-2}$",
        "J"
      ],
      "ans": 0,
      "why": "mass × velocity."
    }
  ],
  "exam": [
    {
      "q": "Determine base units of $G$ from $F = G m_1 m_2 / r^2$.",
      "marks": 3,
      "ms": [
        "$G = F r^2 / (m_1 m_2)$ (1)",
        "Units: $(\\text{kg m s}^{-2})(\\text{m}^2) / (\\text{kg}^2)$ (1)",
        "$= \\text{kg}^{-1} \\text{m}^3 \\text{s}^{-2}$ (1)"
      ]
    },
    {
      "q": "State the SI base units of (a) acceleration (b) force.",
      "marks": 2,
      "ms": [
        "(a) m s$^{-2}$. (1)",
        "(b) kg m s$^{-2}$ (the newton). (1)"
      ]
    },
    {
      "q": "Using base units, show that $F=ma$ is dimensionally consistent when $F$ is measured in newtons.",
      "marks": 6,
      "ms": [
        "Mass $m$ has units kg. (1)",
        "Acceleration $a$ has units m s$^{-2}$. (1)",
        "So $ma$ has units kg·m·s$^{-2}$. (1)",
        "The newton is defined as kg·m·s$^{-2}$. (1)",
        "Hence the units of $ma$ equal the units of $F$. (1)",
        "The equation is dimensionally consistent. (1)"
      ]
    }
  ]
};

C["maths:S7.1"] = {
  "notes": [
    {
      "h": "Language of Kinematics"
    },
    {
      "callout": {
        "t": "def",
        "h": "Vectors vs Scalars",
        "body": [
          {
            "kv": [
              [
                "Scalar",
                "Magnitude only: Distance, Speed, Time, Mass."
              ],
              [
                "Vector",
                "Magnitude and Direction: Displacement ($s$), Velocity ($v$), Accel ($a$)."
              ]
            ]
          }
        ]
      }
    },
    {
      "callout": {
        "t": "info",
        "h": "Averages",
        "body": "Average Speed $= \\frac{\\text{Total Distance}}{\\text{Total Time}}$. Average Velocity $= \\frac{\\text{Total Displacement}}{\\text{Total Time}}$."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Scalar/Vector Pairs",
        "body": "Scalar → vector: Distance → Displacement. Speed → Velocity. Mass → Weight (force). Average speed $=$ total distance $\\div$ total time. Average velocity $=$ total displacement $\\div$ total time. At rest: $v = 0$."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Average Speed = Displacement / Time",
        "body": "Average SPEED uses total DISTANCE (path length), not displacement. If you travel $50\\text{ m}$ and return $50\\text{ m}$, average speed $= 100/t$, but average velocity $= 0/t = 0$."
      }
    }
  ],
  "flashcards": [
    [
      "Difference between speed and velocity?",
      "Speed is scalar; velocity is vector."
    ],
    [
      "Define 'at rest'.",
      "$v = 0$."
    ],
    [
      "Difference between distance and displacement?",
      "Distance is total path length (scalar); displacement is the straight-line vector from start to end."
    ],
    [
      "Difference between speed and velocity?",
      "Speed is a scalar; velocity is speed with direction (a vector)."
    ],
    [
      "What is acceleration?",
      "The rate of change of velocity."
    ],
    [
      "Is acceleration a scalar or a vector?",
      "A vector."
    ],
    [
      "What does negative velocity indicate?",
      "Motion in the negative direction."
    ],
    [
      "What does deceleration mean?",
      "Acceleration acting opposite to the velocity (slowing down)."
    ]
  ],
  "quiz": [
    {
      "q": "Swim $50\\text{m}$ and back. Displacement?",
      "opts": [
        "$100\\text{m}$",
        "$50\\text{m}$",
        "$0\\text{m}$"
      ],
      "ans": 2,
      "why": "Starts and ends at O."
    },
    {
      "q": "Displacement is a...?",
      "opts": [
        "scalar",
        "vector",
        "speed",
        "distance only"
      ],
      "ans": 1,
      "why": "It has magnitude and direction."
    },
    {
      "q": "Which is a scalar?",
      "opts": [
        "velocity",
        "displacement",
        "speed",
        "acceleration"
      ],
      "ans": 2,
      "why": "Speed has no direction."
    },
    {
      "q": "A particle returns to its start. Its displacement is...?",
      "opts": [
        "maximum",
        "zero",
        "the distance travelled",
        "negative"
      ],
      "ans": 1,
      "why": "Start = end, so displacement is zero."
    },
    {
      "q": "Acceleration is the rate of change of...?",
      "opts": [
        "displacement",
        "velocity",
        "distance",
        "speed only"
      ],
      "ans": 1,
      "why": "$a=dv/dt$."
    }
  ],
  "exam": [
    {
      "q": "Calculate avg speed for $100\\text{m}$ in $70\\text{s}$ total journey.",
      "marks": 2,
      "ms": [
        "Avg speed $= 100/70$ (1)",
        "$= 1.43\\text{ m/s}$ (1)"
      ]
    },
    {
      "q": "A runner goes 100 m east then 40 m west. State the total distance and the magnitude of the displacement.",
      "marks": 2,
      "ms": [
        "Distance $=100+40=140$ m. (1)",
        "Displacement $=100-40=60$ m (east). (1)"
      ]
    },
    {
      "q": "Explain the difference between distance and displacement, and between speed and velocity, using a particle that travels 5 m right then 5 m left in 4 s.",
      "marks": 6,
      "ms": [
        "Distance is the total path length: $5+5=10$ m. (1)",
        "Displacement is the net vector from start to end: $0$ m. (1)",
        "Speed (scalar) = distance/time = $10/4=2.5$ m s$^{-1}$ average. (1)",
        "Velocity (vector) = displacement/time = $0/4=0$. (1)",
        "So average speed is non-zero but average velocity is zero. (1)",
        "This shows scalars ignore direction while vectors include it. (1)"
      ]
    }
  ]
};

C["maths:S7.2"] = {
  "notes": [
    {
      "h": "Kinematics Graphs"
    },
    {
      "callout": {
        "t": "formula",
        "h": "Gradient = Rate of Change",
        "body": "$s$-$t$ graph: gradient = velocity. $v$-$t$ graph: gradient = acceleration. $a$-$t$ graph: gradient = rate of change of acceleration. Area under graph = integral of that quantity."
      }
    },
    {
      "table": {
        "head": [
          "Graph",
          "Gradient gives",
          "Area gives"
        ],
        "rows": [
          [
            "$s$-$t$",
            "Velocity $v$",
            "N/A"
          ],
          [
            "$v$-$t$",
            "Acceleration $a$",
            "Displacement $s$"
          ],
          [
            "$a$-$t$",
            "Rate of change of $a$",
            "Change in velocity $\\Delta v$"
          ]
        ]
      }
    },
    {
      "callout": {
        "t": "warn",
        "h": "Distance ≠ Displacement from $v$-$t$ Graph",
        "body": "**Displacement** = net area (regions below the axis count negative). **Distance** = total area, all positive. If a particle reverses, distance > |displacement|."
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "Curved $v$-$t$ Graph",
        "body": "If the $v$-$t$ graph is curved, the gradient at a point (instantaneous acceleration) requires differentiation. Area under a curved $v$-$t$ graph requires integration — you cannot use simple trapezium rules exactly."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Reading the Graph — Key Signs",
        "body": "Positive velocity = moving in positive direction. Zero velocity = stationary (turning point or rest). Negative velocity = moving in opposite direction. Horizontal $v$-$t$ segment = constant velocity (zero acceleration)."
      }
    },
    {
      "steps": [
        {
          "h": "Find distance from $v$-$t$ graph with sign change",
          "m": "Split at $v = 0$ (where direction reverses). Compute each area separately, then sum the absolute values.",
          "n": "Displacement = algebraic sum; distance = sum of absolute areas."
        }
      ]
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Area Under $v$-$t$ = Distance",
        "body": "Area under a $v$-$t$ graph gives DISPLACEMENT (signed), NOT distance. Distance requires summing the absolute area of each section, treating regions below the axis as positive. If the particle never reverses, displacement $=$ distance."
      }
    }
  ],
  "flashcards": [
    [
      "Gradient of $v-t$?",
      "Acceleration."
    ],
    [
      "Area of $v-t$?",
      "Displacement."
    ],
    [
      "What does the gradient of a displacement-time graph give?",
      "The velocity."
    ],
    [
      "What does the gradient of a velocity-time graph give?",
      "The acceleration."
    ],
    [
      "What does the area under a velocity-time graph give?",
      "The displacement."
    ],
    [
      "What does a horizontal line on a velocity-time graph mean?",
      "Constant velocity (zero acceleration)."
    ],
    [
      "What does a straight sloping line on a v-t graph mean?",
      "Constant acceleration."
    ],
    [
      "How do you find distance from a v-t graph if velocity goes negative?",
      "Take the area as positive for distance (displacement uses signed area)."
    ]
  ],
  "quiz": [
    {
      "q": "$v-t$ triangle: base $10$, height $20$. $s = ?$",
      "opts": [
        "$200$",
        "$100$",
        "$2$"
      ],
      "ans": 1,
      "why": "$\\frac{1}{2} \\times 10 \\times 20 = 100$."
    },
    {
      "q": "Gradient of a displacement-time graph is...?",
      "opts": [
        "acceleration",
        "velocity",
        "distance",
        "force"
      ],
      "ans": 1,
      "why": "$ds/dt=v$."
    },
    {
      "q": "Area under a velocity-time graph is...?",
      "opts": [
        "acceleration",
        "displacement",
        "speed",
        "force"
      ],
      "ans": 1,
      "why": "$\\int v\\,dt=s$."
    },
    {
      "q": "A horizontal v-t line means...?",
      "opts": [
        "constant acceleration",
        "constant velocity",
        "at rest",
        "increasing speed"
      ],
      "ans": 1,
      "why": "No change in velocity."
    },
    {
      "q": "Gradient of a velocity-time graph gives...?",
      "opts": [
        "displacement",
        "acceleration",
        "speed",
        "distance"
      ],
      "ans": 1,
      "why": "$dv/dt=a$."
    }
  ],
  "exam": [
    {
      "q": "Car accelerates $0$ to $15$ in $10\\text{s}$, stays $20\\text{s}$, slows in $5\\text{s}$. Total dist?",
      "marks": 3,
      "ms": [
        "Trapezium areas or parts (1)",
        "Area $= \\frac{1}{2}(20 + 35) \\times 15$ (1)",
        "$= 412.5\\text{m}$ (1)"
      ]
    },
    {
      "q": "A velocity-time graph is a straight line from $(0,0)$ to $(10,20)$ (s, m s$^{-1}$). Find the acceleration and the distance travelled.",
      "marks": 3,
      "ms": [
        "Acceleration = gradient $=20/10=2$ m s$^{-2}$. (1)",
        "Distance = area $=\\tfrac12(10)(20)$. (1)",
        "$=100$ m. (1)"
      ]
    },
    {
      "q": "A car accelerates uniformly from rest to 30 m s$^{-1}$ in 12 s, travels at 30 m s$^{-1}$ for 8 s, then decelerates uniformly to rest in 6 s. Sketch reasoning aside, find the total distance.",
      "marks": 6,
      "ms": [
        "Phase 1 (triangle): $\\tfrac12(12)(30)=180$ m. (1)",
        "Phase 2 (rectangle): $30\\times8=240$ m. (1)",
        "Phase 3 (triangle): $\\tfrac12(6)(30)=90$ m. (1)",
        "Sum the three areas. (1)",
        "$180+240+90$. (1)",
        "$=510$ m. (1)"
      ]
    }
  ]
};

C["maths:S7.3"] = {
  "notes": [
    {
      "h": "suvat: Constant Acceleration"
    },
    {
      "callout": {
        "t": "info",
        "h": "The Five Equations",
        "body": "$v = u + at$; $s = ut + \\frac{1}{2}at^2$; $s = \\frac{1}{2}(u+v)t$; $v^2 = u^2 + 2as$; $s = vt - \\frac{1}{2}at^2$."
      }
    },
    {
      "steps": [
        {
          "h": "The Routine",
          "m": "1. List $s, u, v, a, t$. 2. Declare positive direction. 3. Pick equation. 4. Solve.",
          "n": "Gravity $a = -9.8\\text{ m s}^{-2}$ if up is positive."
        }
      ]
    },
    {
      "callout": {
        "t": "memorise",
        "h": "The Five suvat Equations",
        "body": "$v = u + at$; $s = ut + \\tfrac{1}{2}at^2$; $s = \\tfrac{1}{2}(u+v)t$; $v^2 = u^2 + 2as$; $s = vt - \\tfrac{1}{2}at^2$. Valid ONLY for constant acceleration. List $s,u,v,a,t$ and pick the equation that uses 4 of the 5."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "suvat Works for Variable Acceleration",
        "body": "suvat equations assume CONSTANT acceleration throughout. For variable acceleration you MUST use calculus ($v = ds/dt$, $a = dv/dt$). Using suvat with variable $a$ gives wrong answers."
      }
    }
  ],
  "flashcards": [
    [
      "When is suvat invalid?",
      "Variable acceleration."
    ],
    [
      "At max height, what is zero?",
      "Vertical velocity $v_y$."
    ],
    [
      "State the suvat equation linking $v,u,a,t$.",
      "$v=u+at$."
    ],
    [
      "State the suvat equation for displacement with $u,a,t$.",
      "$s=ut+\\tfrac12 at^2$."
    ],
    [
      "State the suvat equation without $t$.",
      "$v^2=u^2+2as$."
    ],
    [
      "State the suvat equation using average velocity.",
      "$s=\\tfrac12(u+v)t$."
    ],
    [
      "What condition must hold to use suvat?",
      "Constant (uniform) acceleration."
    ],
    [
      "What does $u$ represent?",
      "The initial velocity."
    ]
  ],
  "quiz": [
    {
      "q": "Know $u, a, t$; want $s$, no $v$. Use?",
      "opts": [
        "$v^2=u^2+2as$",
        "$s=ut+\\frac{1}{2}at^2$",
        "$v=u+at$"
      ],
      "ans": 1,
      "why": "Missing $v$."
    },
    {
      "q": "Which equation finds $v$ from $u,a,t$?",
      "opts": [
        "$v=u+at$",
        "$s=ut+\\tfrac12at^2$",
        "$v^2=u^2+2as$",
        "$s=\\tfrac12(u+v)t$"
      ],
      "ans": 0,
      "why": "$v=u+at$."
    },
    {
      "q": "suvat equations require...?",
      "opts": [
        "constant velocity",
        "constant acceleration",
        "no acceleration",
        "a force"
      ],
      "ans": 1,
      "why": "They assume uniform acceleration."
    },
    {
      "q": "A body from rest, $a=2$, after $5$ s has $v=$?",
      "opts": [
        "$2$",
        "$10$",
        "$5$",
        "$25$"
      ],
      "ans": 1,
      "why": "$v=0+2(5)=10$."
    },
    {
      "q": "Which equation omits time?",
      "opts": [
        "$v=u+at$",
        "$v^2=u^2+2as$",
        "$s=ut+\\tfrac12at^2$",
        "$s=\\tfrac12(u+v)t$"
      ],
      "ans": 1,
      "why": "$v^2=u^2+2as$ has no $t$."
    }
  ],
  "exam": [
    {
      "q": "Car $8\\text{ m/s}$ to $20\\text{ m/s}$ over $150\\text{m}$. Find $a$.",
      "marks": 3,
      "ms": [
        "$v^2 = u^2 + 2as$ (1)",
        "$400 = 64 + 300a$ (1)",
        "$a = 1.12\\text{ m/s}^2$ (1)"
      ]
    },
    {
      "q": "A car accelerates from $8$ m s$^{-1}$ at $3$ m s$^{-2}$ for $4$ s. Find its final velocity and the distance travelled.",
      "marks": 3,
      "ms": [
        "$v=u+at=8+3(4)=20$ m s$^{-1}$. (1)",
        "$s=ut+\\tfrac12at^2=8(4)+\\tfrac12(3)(16)$. (1)",
        "$=32+24=56$ m. (1)"
      ]
    },
    {
      "q": "A ball is thrown vertically up at $14$ m s$^{-1}$ ($g=9.8$). Find the greatest height and the time to return to the throwing point.",
      "marks": 6,
      "ms": [
        "At greatest height $v=0$. (1)",
        "$v^2=u^2-2gs\\Rightarrow0=14^2-2(9.8)s$. (1)",
        "$s=\\dfrac{196}{19.6}=10$ m. (1)",
        "Time up: $v=u-gt\\Rightarrow0=14-9.8t$. (1)",
        "$t=\\dfrac{14}{9.8}=1.43$ s. (1)",
        "By symmetry, total time $=2(1.43)\\approx2.86$ s. (1)"
      ]
    }
  ]
};

C["maths:S7.4"] = {
  "notes": [
    {
      "h": "Calculus in Kinematics"
    },
    {
      "steps": [
        {
          "h": "Differentiation Chain",
          "m": "$s(t) \\xrightarrow{d/dt} v(t) \\xrightarrow{d/dt} a(t)$."
        },
        {
          "h": "Integration Chain",
          "m": "$a(t) \\xrightarrow{\\int} v(t) \\xrightarrow{\\int} s(t)$. Always add $+c$.",
          "n": "Use boundary conditions to find constants."
        }
      ]
    },
    {
      "callout": {
        "t": "tip",
        "h": "Distance Travelled",
        "body": "Integrate $|v(t)|$ or split integral at points where $v=0$ if particle changes direction."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Calculus Chain in Kinematics",
        "body": "Differentiate: $s \\xrightarrow{d/dt} v \\xrightarrow{d/dt} a$. Integrate: $a \\xrightarrow{\\int} v \\xrightarrow{\\int} s$ (add $+c$ each time, use initial conditions). Integrating $v$ gives DISPLACEMENT; to get DISTANCE, split at $v=0$ and sum absolute areas."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Integrating $v$ Gives Distance",
        "body": "Integrating $v(t)$ from $a$ to $b$ gives DISPLACEMENT (signed), not distance. If the particle changes direction, $\\int |v(t)| \\, dt$ gives distance. Missing this when the particle reverses gives an underestimate of distance."
      }
    }
  ],
  "flashcards": [
    [
      "How to find velocity from displacement?",
      "$v = ds/dt$."
    ],
    [
      "What to add when integrating?",
      "Constant of integration $+C$."
    ],
    [
      "How do you get velocity from displacement using calculus?",
      "Differentiate: $v=\\dfrac{ds}{dt}$."
    ],
    [
      "How do you get acceleration from velocity?",
      "Differentiate: $a=\\dfrac{dv}{dt}$."
    ],
    [
      "How do you get displacement from velocity?",
      "Integrate: $s=\\int v\\,dt$."
    ],
    [
      "How do you get velocity from acceleration?",
      "Integrate: $v=\\int a\\,dt$."
    ],
    [
      "Why use calculus instead of suvat?",
      "When the acceleration is NOT constant (varies with time)."
    ],
    [
      "What do you need when integrating to find motion?",
      "Initial conditions to determine the constant of integration."
    ]
  ],
  "quiz": [
    {
      "q": "$s = 2t^3 - 5t$. $v$ at $t=2$?",
      "opts": [
        "$19$",
        "$11$",
        "$24$"
      ],
      "ans": 0,
      "why": "$v = 6t^2 - 5$. $6(4)-5 = 19$."
    },
    {
      "q": "$v=\\dfrac{ds}{dt}$ means velocity is the...?",
      "opts": [
        "integral of s",
        "derivative of displacement",
        "area under s",
        "constant"
      ],
      "ans": 1,
      "why": "Differentiate displacement."
    },
    {
      "q": "To find displacement from velocity you...?",
      "opts": [
        "differentiate",
        "integrate",
        "square",
        "divide by t"
      ],
      "ans": 1,
      "why": "$s=\\int v\\,dt$."
    },
    {
      "q": "Calculus methods are needed when acceleration is...?",
      "opts": [
        "constant",
        "zero",
        "variable",
        "negative"
      ],
      "ans": 2,
      "why": "suvat fails for variable acceleration."
    },
    {
      "q": "$a=\\dfrac{dv}{dt}$ is the...?",
      "opts": [
        "integral of v",
        "derivative of velocity",
        "displacement",
        "speed"
      ],
      "ans": 1,
      "why": "Differentiate velocity."
    }
  ],
  "exam": [
    {
      "q": "$a = 3t^2 - 4, v(0)=2, s(0)=5$. Find $s(2)$.",
      "marks": 5,
      "ms": [
        "$v = t^3 - 4t + 2$ (1)",
        "$s = \\frac{1}{4}t^4 - 2t^2 + 2t + 5$ (2)",
        "$s(2) = 4 - 8 + 4 + 5 = 5\\text{m}$ (2)"
      ]
    },
    {
      "q": "A particle has velocity $v=3t^2-4t$ m s$^{-1}$. Find its acceleration at $t=2$.",
      "marks": 3,
      "ms": [
        "$a=\\dfrac{dv}{dt}=6t-4$. (1)",
        "At $t=2$: $a=12-4$. (1)",
        "$=8$ m s$^{-2}$. (1)"
      ]
    },
    {
      "q": "A particle moves with velocity $v=6t-t^2$ m s$^{-1}$, starting at the origin. Find (a) the acceleration when $t=1$, (b) the displacement after 3 s.",
      "marks": 6,
      "ms": [
        "(a) $a=\\dfrac{dv}{dt}=6-2t$. (1)",
        "At $t=1$: $a=4$ m s$^{-2}$. (1)",
        "(b) $s=\\int_0^3(6t-t^2)\\,dt$. (1)",
        "$=\\left[3t^2-\\tfrac{t^3}{3}\\right]_0^3$. (1)",
        "$=27-9$. (1)",
        "$=18$ m. (1)"
      ]
    }
  ]
};

C["maths:S7.5"] = {
  "notes": [
    {
      "h": "Projectiles"
    },
    {
      "callout": {
        "t": "info",
        "h": "Independence",
        "body": "Horizontal: $a=0, v_x = u\\cos\\theta, x = (u\\cos\\theta)t$. Vertical: $a=-g, y = (u\\sin\\theta)t - \\frac{1}{2}gt^2$."
      }
    },
    {
      "steps": [
        {
          "h": "Resolution",
          "m": "Resolve $u$ into $u_x, u_y$. Solve $x, y$ independently.",
          "n": "Time $t$ is the common link."
        }
      ]
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Projectile Motion Setup",
        "body": "Resolve initial velocity: $u_x = u\\cos\\theta$, $u_y = u\\sin\\theta$. Horizontal: $a=0$, $x = (u\\cos\\theta)t$. Vertical: $a = -g$, use suvat. Time $t$ is the same for both components. At max height: $v_y = 0$."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Horizontal Velocity Changes During Flight",
        "body": "In standard projectile motion, horizontal velocity is CONSTANT (no air resistance, $a_x = 0$). Only vertical velocity changes due to gravity. Applying $F=ma$ horizontally gives zero net force, so $v_x = u\\cos\\theta$ throughout."
      }
    }
  ],
  "flashcards": [
    [
      "Horizontal acceleration?",
      "Zero."
    ],
    [
      "Vertical acceleration?",
      "$-9.8\\text{ m/s}^2$."
    ],
    [
      "How is projectile motion split?",
      "Into independent horizontal (constant velocity) and vertical (acceleration $g$) components."
    ],
    [
      "Horizontal acceleration of a projectile (no air resistance)?",
      "Zero."
    ],
    [
      "Vertical acceleration of a projectile?",
      "$g\\approx9.8$ m s$^{-2}$ downward."
    ],
    [
      "Initial horizontal/vertical components of speed $u$ at angle $\\theta$?",
      "$u\\cos\\theta$ and $u\\sin\\theta$."
    ],
    [
      "What links the horizontal and vertical motions?",
      "Time — it is the same for both components."
    ],
    [
      "When does a projectile reach maximum height?",
      "When its vertical velocity is zero."
    ]
  ],
  "quiz": [
    {
      "q": "$u=20$ at $30^\\circ$. Initial $v_y$?",
      "opts": [
        "$10$",
        "$17.3$",
        "$20$"
      ],
      "ans": 0,
      "why": "$20\\sin 30 = 10$."
    },
    {
      "q": "Horizontal acceleration of a projectile is...?",
      "opts": [
        "$g$",
        "$0$",
        "$-g$",
        "$u$"
      ],
      "ans": 1,
      "why": "No horizontal force (ignoring air resistance)."
    },
    {
      "q": "Vertical velocity at maximum height is...?",
      "opts": [
        "$u$",
        "$0$",
        "$g$",
        "maximum"
      ],
      "ans": 1,
      "why": "It momentarily stops rising."
    },
    {
      "q": "Horizontal component of $u$ at angle $\\theta$?",
      "opts": [
        "$u\\sin\\theta$",
        "$u\\cos\\theta$",
        "$u\\tan\\theta$",
        "$u$"
      ],
      "ans": 1,
      "why": "$u\\cos\\theta$."
    },
    {
      "q": "The two component motions share the same...?",
      "opts": [
        "acceleration",
        "velocity",
        "time",
        "displacement"
      ],
      "ans": 2,
      "why": "Time connects them."
    }
  ],
  "exam": [
    {
      "q": "$28\\text{ m/s}$ at $30^\\circ$. Range?",
      "marks": 3,
      "ms": [
        "$t_{flight} = 2.86\\text{ s}$ (1)",
        "$x = (28\\cos 30) \\times 2.86$ (1)",
        "$= 69.3\\text{m}$ (1)"
      ]
    },
    {
      "q": "A ball is projected horizontally at $10$ m s$^{-1}$ from a height of $20$ m ($g=9.8$). Find the time to land.",
      "marks": 3,
      "ms": [
        "Vertical: $s=\\tfrac12gt^2\\Rightarrow20=\\tfrac12(9.8)t^2$. (1)",
        "$t^2=\\dfrac{40}{9.8}=4.08$. (1)",
        "$t\\approx2.02$ s. (1)"
      ]
    },
    {
      "q": "A projectile is launched at $20$ m s$^{-1}$ at $30^\\circ$ above the horizontal ($g=9.8$). Find the maximum height and the horizontal range.",
      "marks": 6,
      "ms": [
        "$u_y=20\\sin30^\\circ=10$, $u_x=20\\cos30^\\circ\\approx17.3$. (1)",
        "Max height: $v_y^2=u_y^2-2g h\\Rightarrow0=100-19.6h$. (1)",
        "$h=\\dfrac{100}{19.6}\\approx5.10$ m. (1)",
        "Time of flight: $t=\\dfrac{2u_y}{g}=\\dfrac{20}{9.8}\\approx2.04$ s. (1)",
        "Range $=u_x\\times t=17.3\\times2.04$. (1)",
        "$\\approx35.3$ m. (1)"
      ]
    }
  ]
};

C["maths:S8.1"] = {
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

C["maths:S8.2"] = {
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

C["maths:S8.3"] = {
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

C["maths:S8.4"] = {
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

C["maths:S8.5"] = {
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

C["maths:S8.6"] = {
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

C["maths:S9.1"] = {
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
