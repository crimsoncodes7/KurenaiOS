/* Kurenai OS content */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {

C["compsci:4.4.2.1"] = {
  "notes": [
    {
      "h": "Finite state machines"
    },
    {
      "diagram": "fsm-lab"
    },
    {
      "kv": [
        [
          "Finite state machine",
          "A model of computation with a finite set of states, an input alphabet, a transition function, a start state and — for an acceptor — a set of accepting (goal) states."
        ]
      ]
    },
    {
      "h": "Reading the diagrams"
    },
    {
      "callout": {
        "t": "tip",
        "h": "FSM Visual Conventions",
        "body": [
          {
            "kv": [
              [
                "Start state",
                "Marked by an unattached incoming arrow."
              ],
              [
                "Accepting state",
                "Indicated by a double circle (in acceptors)."
              ],
              [
                "Transition",
                "A labelled edge showing the input that triggers a state change."
              ],
              [
                "Mealy machine",
                "Labels in 'input/output' format (e.g. 1/0) — it produces an output on transition."
              ],
              [
                "Determinism",
                "Exactly one transition exists for every possible (state, input) pair."
              ]
            ]
          }
        ]
      }
    },
    {
      "page": "Tracing & method"
    },
    {
      "h": "\"What does this FSM accept?\" — the method"
    },
    {
      "steps": [
        {
          "h": "Probe systematically",
          "m": "Test ε (empty), 0, 1, 00, 01, 10, 11…\nrecord accept/reject for each"
        },
        {
          "h": "Name the states",
          "m": "Ask what each state REMEMBERS.\nE.g. S0 = \"seen an even number of 1s so far\", S1 = \"odd so far\"",
          "n": "Once states have meanings, the language usually announces itself."
        },
        {
          "h": "State the pattern, not examples",
          "m": "\"The FSM accepts strings containing an even number of 1s\" — a general description, in a sentence."
        }
      ]
    },
    {
      "callout": {
        "t": "miscon",
        "body": "An FSM has **no memory beyond its current state** — it cannot count unboundedly. That's exactly why no FSM accepts \"equal numbers of 0s and 1s\", and why BNF/context-free grammars (4.4.3) exist for what FSMs can't do."
      }
    },
    {
      "callout": {
        "t": "tip",
        "body": "Construction questions: draw a transition for EVERY symbol from EVERY state (determinism), mark the start arrow and double-circle the accepts before tracing anything. Missing transitions are the classic dropped mark."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "FSM Essentials",
        "body": "Five components: finite set of STATES, INPUT ALPHABET, TRANSITION FUNCTION (state × input → next state), START STATE, ACCEPTING STATES. Deterministic: exactly one transition per (state, input) pair. Mealy: output on each transition (input/output label). A string is accepted when ALL input is consumed AND the machine is in an accepting state."
      }
    }
  ],
  "flashcards": [
    [
      "Components of an FSM acceptor?",
      "Finite states, input alphabet, transition function, one start state, set of accepting states."
    ],
    [
      "Visual conventions for start and accept?",
      "Start: incoming unattached arrow. Accepting: double circle."
    ],
    [
      "What makes an FSM deterministic?",
      "Exactly one transition defined for every (state, input symbol) pair."
    ],
    [
      "What is a Mealy machine?",
      "An FSM producing outputs on its transitions (input/output labels) — a transducer, not an acceptor."
    ],
    [
      "Why can't an FSM match brackets/count equal 0s and 1s?",
      "Finite states = bounded memory; unbounded counting needs more powerful models (e.g. grammars in BNF)."
    ],
    ["List the five components of an FSM acceptor.", "A finite set of states, an input alphabet, a transition function, a start state, and a set of accepting states."],
    ["How do you work out what an FSM accepts?", "Test short strings recording accept/reject, give each state a meaning (what it remembers), then state the general pattern in a sentence."],
    ["In a deterministic FSM, how many transitions leave each state?", "Exactly one per input symbol — so states × alphabet-size transitions in total."]
  ],
  "quiz": [
    {
      "q": "A string is accepted when…",
      "opts": [
        "any state is reached",
        "the machine halts in an accepting state after consuming ALL input",
        "the start state is revisited",
        "an output is produced"
      ],
      "ans": 1,
      "why": "Both conditions: input exhausted AND current state accepting."
    },
    {
      "q": "Edge label \"1/0\" on a state diagram indicates…",
      "opts": [
        "a syntax error",
        "a Mealy machine: input 1 produces output 0",
        "division",
        "a probability"
      ],
      "ans": 1,
      "why": "Input/output transition labels are the Mealy signature."
    },
    {
      "q": "An FSM for \"binary strings divisible by 3\" needs how many states?",
      "opts": [
        "1",
        "2",
        "3",
        "infinitely many"
      ],
      "ans": 2,
      "why": "Track the remainder mod 3 — three possible remainders, three states."
    },
    {
      "q": "Deterministic FSM, alphabet {0,1}, 4 states: total transitions required?",
      "opts": [
        "4",
        "6",
        "8",
        "16"
      ],
      "ans": 2,
      "why": "One per symbol per state: 4 × 2 = 8."
    },
    {
      "q": "Why can no FSM accept the language of strings with equal numbers of 0s and 1s?",
      "opts": ["it has too few states", "it has no memory to count unboundedly", "it is non-deterministic", "0s and 1s are not in its alphabet"],
      "ans": 1,
      "why": "Equal-count requires tracking an unbounded difference; finite states can't store an unbounded count."
    }
  ],
  "exam": [
    {
      "q": "An FSM has states S0 (start, accepting) and S1. On input 1 each state moves to the other; input 0 leaves the state unchanged. Describe the set of strings this FSM accepts, justifying your answer.",
      "marks": 3,
      "ms": [
        "1s toggle the state; 0s are ignored (1)",
        "Machine is in S0 exactly when an even number of 1s has been read (1)",
        "Accepts all binary strings containing an even number of 1s (including none) (1)"
      ]
    },
    {
      "q": "State the five components of a finite state machine acceptor.",
      "marks": 3,
      "ms": ["Finite set of states; input alphabet (1)", "Transition function (state × input → next state); start state (1)", "Set of accepting (goal) states (1)"]
    },
    {
      "q": "Design a deterministic FSM that accepts binary strings divisible by 3 (value mod 3). Describe the states and transitions, and explain why three states suffice.",
      "marks": 6,
      "ms": ["Three states for remainders 0, 1, 2; start and accept = remainder-0 state (1-2)", "Reading a bit b updates value to 2×value + b, so remainder r → (2r + b) mod 3 (1-2)", "Transitions: r0 on 0→r0, on 1→r1; r1 on 0→r2, on 1→r0; r2 on 0→r1, on 1→r2 (1)", "Three states suffice because only the remainder mod 3 (not the whole value) needs to be remembered (1)"]
    }
  ],
  "sims": [
    "fsm-lab"
  ]
};

})(window.KOS_CONTENT);