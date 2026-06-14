/* Kurenai OS content */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {

C["compsci:4.11.1"] = {
  "notes": [
    {
      "h": "Big Data"
    },
    {
      "callout": {
        "t": "def",
        "h": "Big Data",
        "body": "Datasets that are so large, complex, and rapidly changing that traditional relational database management systems (RDBMS) are insufficient to process them."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "The Three Vs of Big Data",
        "body": [
          {
            "kv": [
              ["Volume", "The sheer amount of data being stored or generated — terabytes to petabytes."],
              ["Velocity", "The speed at which new data is generated and must be processed."],
              ["Variety", "The different types and formats: structured, unstructured, text, image, sensor, etc."]
            ]
          }
        ]
      }
    },
    {
      "callout": {
        "t": "info",
        "h": "Handling Big Data: Key Approaches",
        "body": [
          {
            "kv": [
              ["Lack of Structure", "Big data often lacks standard structure, making traditional tables ineffective. Machine learning discovers hidden patterns instead."],
              ["Fact-Based Model", "Stores raw, immutable facts with timestamps. Updates are appended as new facts — existing data is never overwritten."],
              ["Graph Schemas", "Nodes represent entities; edges represent relationships. Ideal for social networks, recommendation engines, and fraud detection."]
            ]
          }
        ]
      }
    },
    {
      "callout": {
        "t": "warn",
        "h": "Why Traditional RDBMS Fails for Big Data",
        "body": "Relational databases require a rigid schema, scale vertically (one powerful server), and use row-locking for writes. Big data requires flexible schemas, horizontal scaling across many cheap machines, and high write throughput."
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "Distributed Storage",
        "body": "Big Data is distributed across many machines in parallel. No single machine can hold or process it all. Systems like Hadoop and Spark split data across a cluster."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Big Data Misconceptions",
        "body": "**Big Data just means a very large database** — it's defined by all three Vs: not just Volume but also Velocity (speed of generation) and Variety (unstructured/mixed formats). **You can handle Big Data by upgrading to a more powerful server** — Big Data requires horizontal scaling across many cheap machines (distributed computing); adding resources to a single server (vertical scaling) does not scale far enough."
      }
    }
  ],
  "flashcards": [
    [
      "What are the 'Three Vs' of Big Data?",
      "Volume, Velocity, and Variety."
    ],
    [
      "Why is traditional RDBMS often unsuitable for Big Data?",
      "Data is too large, changes too quickly, or is too unstructured (variety) to fit into rigid tables."
    ],
    [
      "What is a 'fact-based model' in the context of Big Data?",
      "A model where data is stored as immutable facts with timestamps; data is appended, never updated or deleted."
    ],
    [
      "What is the purpose of a graph schema?",
      "To represent entities as nodes and relationships as edges, making it easier to analyze complex connections in data."
    ],
    [
      "What does 'Variety' refer to in Big Data?",
      "The different forms data can take, such as text, images, video, sensor data, often unstructured."
    ]
  ],
  "quiz": [
    {
      "q": "Which of the following is NOT one of the typical 'Three Vs' of Big Data?",
      "opts": [
        "Volume",
        "Velocity",
        "Validity",
        "Variety"
      ],
      "ans": 2,
      "why": "The three Vs are Volume, Velocity, and Variety. Validity is sometimes added as a fourth, but is not the core 'Three Vs'."
    },
    {
      "q": "In a fact-based model, what happens when an entity's attribute changes?",
      "opts": [
        "The existing record is overwritten.",
        "A new immutable fact is appended with a timestamp.",
        "The entity is deleted and recreated.",
        "The change is ignored until batch processing."
      ],
      "ans": 1,
      "why": "Fact-based models append new facts to preserve a historical record; existing data is never mutated."
    },
    {
      "q": "Which data structure is most naturally suited to representing connections between people in a social network?",
      "opts": [
        "Relational table",
        "Graph schema",
        "Flat file",
        "Linked List"
      ],
      "ans": 1,
      "why": "Graph schemas explicitly model entities as nodes and their relationships as edges, ideal for social networks."
    },
    {
      "q": "What does 'Velocity' mean in the context of Big Data?",
      "opts": [
        "The speed at which queries execute.",
        "The speed at which data is generated and processed.",
        "The maximum bandwidth of the network.",
        "The CPU clock speed of the database server."
      ],
      "ans": 1,
      "why": "Velocity refers to the rapid rate at which new data is created and needs to be analyzed."
    }
  ],
  "exam": [
    {
      "q": "Explain two reasons why a relational database might not be suitable for storing Big Data. (4 marks)",
      "marks": 4,
      "ms": [
        "Relational databases require a strict schema/structured data (1) but Big Data often has a large variety/unstructured data (1).",
        "Relational databases scale vertically (adding more power to one server) (1) but Big Data volume requires horizontal scaling across distributed servers (1).",
        "Relational databases use locking which slows down writes (1) making them unsuitable for the high velocity of Big Data (1)."
      ]
    }
  ]
};

C["compsci:4.12.1.1"] = {
  "notes": [
    {
      "h": "Functions in Mathematics & Programming"
    },
    {
      "callout": {
        "t": "def",
        "h": "Function",
        "body": "A mapping from one set of values (the domain) to another set of values (the co-domain). It associates each element of the domain with exactly one element of the co-domain."
      }
    },
    {
      "callout": {
        "t": "info",
        "h": "Domain, Co-domain, and Type",
        "body": [
          {
            "kv": [
              ["Domain", "The set of all possible valid input values."],
              ["Co-domain", "The set of all potential output values (may be larger than the actual range produced)."],
              ["Function Type", "Written `f : A → B` — maps domain A to co-domain B. E.g., `f : Integer → String`."]
            ]
          }
        ]
      }
    },
    {
      "callout": {
        "t": "formula",
        "h": "Function Type Notation",
        "body": "$f : A \\to B$ — a function $f$ that takes an element from set $A$ (domain) and maps it to exactly one element in set $B$ (co-domain)."
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "Co-domain ≠ Range",
        "body": "The co-domain is the set of all **possible** output values. The range (image) is the set of values actually produced. The range is always a subset of the co-domain."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Functions — Key Facts",
        "body": "A function maps **every** input in the domain to **exactly one** output. Type notation: `f : A → B` (A = domain, B = co-domain). **Co-domain** = declared set of all possible outputs; **Range/image** = outputs actually produced. Range is always a subset of the co-domain (they may differ)."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Common Function Misconceptions",
        "body": "**The co-domain and range of a function are always the same** — the co-domain is the declared output type; the range (image) is only what is actually produced. For `f(x) = x²` over integers, the co-domain is all integers but the range is only non-negative integers. **A function can map one input to multiple outputs** — by definition a function maps each input to exactly one output; a relation with multiple outputs per input is not a function."
      }
    }
  ],
  "flashcards": [
    [
      "What is the 'domain' of a function?",
      "The set of all possible input values for which the function is defined."
    ],
    [
      "What is the 'co-domain' of a function?",
      "The set of all possible output values that the function could produce."
    ],
    [
      "How is a function mapping described mathematically?",
      "As mapping each element of a domain to exactly one element of a co-domain."
    ],
    [
      "What does a function type like `A -> B` mean?",
      "It takes an input of type A (domain) and returns an output of type B (co-domain)."
    ],
    [
      "Can a function map one input to multiple outputs?",
      "No, a valid mathematical function maps each input to exactly one output."
    ]
  ],
  "quiz": [
    {
      "q": "In the function `f(x) = x * 2` where x is any integer, what is the domain?",
      "opts": [
        "All real numbers",
        "All integers",
        "All even integers",
        "All positive integers"
      ],
      "ans": 1,
      "why": "The question specifies x is any integer, making the set of integers the domain."
    },
    {
      "q": "What is a co-domain?",
      "opts": [
        "The actual outputs produced by the function.",
        "The set of all possible valid inputs.",
        "The set from which the function's outputs are drawn.",
        "A subset of the domain."
      ],
      "ans": 2,
      "why": "The co-domain is the set of potential output values, which may be larger than the actual range of outputs produced."
    },
    {
      "q": "What notation represents a function `f` taking an integer and returning a boolean?",
      "opts": [
        "f : Boolean -> Integer",
        "f : Integer -> Boolean",
        "f(Integer, Boolean)",
        "f = Integer + Boolean"
      ],
      "ans": 1,
      "why": "The arrow notation `Domain -> Co-domain` is used, so `Integer -> Boolean`."
    },
    {
      "q": "Which statement is true about mathematical functions?",
      "opts": [
        "An input can map to multiple outputs.",
        "Every element in the co-domain must be mapped to.",
        "Each input maps to exactly one output.",
        "Functions must always take numeric inputs."
      ],
      "ans": 2,
      "why": "The definition of a function requires that each element in the domain maps to one and only one element in the co-domain."
    }
  ],
  "exam": [
    {
      "q": "Define the terms 'domain' and 'co-domain' in the context of functional programming. (2 marks)",
      "marks": 2,
      "ms": [
        "Domain: The set of all valid input values for a function (1).",
        "Co-domain: The set of all possible return values/output types for a function (1)."
      ]
    }
  ]
};

C["compsci:4.12.1.2"] = {
  "notes": [
    {
      "h": "First-Class Objects"
    },
    {
      "callout": {
        "t": "def",
        "h": "First-Class Objects",
        "body": "In functional programming, functions are treated as first-class objects (or first-class citizens). This means they can be treated like any other variable or data."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Properties of First-Class Functions",
        "body": [
          {
            "kv": [
              ["Assigned", "Can be assigned to a variable: `let f = double`"],
              ["Passed", "Can be passed as an argument to another function (higher-order functions)"],
              ["Returned", "Can be returned as the result of another function"],
              ["Stored", "Can be stored in data structures (arrays, dictionaries, lists)"]
            ]
          }
        ]
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "Higher-Order Functions",
        "body": "A function that takes another function as an argument, or returns one, is called a **higher-order function**. `map`, `filter`, and `fold` are classic examples — they only exist because functions are first-class."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "First-Class Function Misconceptions",
        "body": "**A higher-order function executes at higher priority or faster** — the term has nothing to do with performance. A higher-order function is one that takes another function as an argument or returns a function as its result. **First-class functions are unique to functional programming** — many languages (Python, JavaScript, C#) support first-class functions; the concept is a language feature, not exclusive to the functional paradigm."
      }
    }
  ],
  "flashcards": [
    [
      "What does it mean for a function to be a 'first-class object'?",
      "It can be treated like any other variable (assigned, passed as argument, returned)."
    ],
    [
      "Name one thing you can do with a first-class function.",
      "Pass it as an argument to another function (or assign to variable, return it)."
    ],
    [
      "Can a first-class function be stored in an array?",
      "Yes, they can be stored in data structures just like standard data."
    ],
    [
      "What is a higher-order function?",
      "A function that takes another function as an argument, or returns a function as a result."
    ],
    [
      "Why are first-class functions important in functional programming?",
      "They enable higher-order functions like map, filter, and fold, which are the building blocks of the paradigm."
    ]
  ],
  "quiz": [
    {
      "q": "Which of the following is NOT a property of a first-class object?",
      "opts": [
        "Can be assigned to a variable",
        "Can be passed as an argument",
        "Must execute in constant time",
        "Can be returned from a function"
      ],
      "ans": 2,
      "why": "Execution time is irrelevant to whether something is a first-class object."
    },
    {
      "q": "A function that takes another function as an argument is called a...",
      "opts": [
        "Primary function",
        "First-class function",
        "Higher-order function",
        "Recursive function"
      ],
      "ans": 2,
      "why": "Higher-order functions take functions as inputs or return them."
    },
    {
      "q": "Which programming paradigm relies heavily on functions being first-class objects?",
      "opts": [
        "Object-Oriented Programming",
        "Functional Programming",
        "Procedural Programming",
        "Logic Programming"
      ],
      "ans": 1,
      "why": "Functional programming treats functions as the primary building blocks, requiring them to be first-class."
    },
    {
      "q": "If `add` is a function, what does assigning `let myFunc = add` demonstrate?",
      "opts": [
        "Recursion",
        "Function composition",
        "Functions as first-class objects",
        "Partial application"
      ],
      "ans": 2,
      "why": "Assigning a function to a variable demonstrates that the function is a first-class object."
    }
  ],
  "exam": [
    {
      "q": "Explain what is meant by a 'first-class object' in functional programming. Give two examples of what can be done with first-class functions. (3 marks)",
      "marks": 3,
      "ms": [
        "Functions are treated as data/standard variables (1).",
        "They can be passed as arguments to other functions (1).",
        "They can be returned as a result from another function (1).",
        "They can be assigned to variables (1)."
      ]
    }
  ]
};

C["compsci:4.12.1.3"] = {
  "notes": [
    {
      "h": "Function Application"
    },
    {
      "callout": {
        "t": "def",
        "h": "Function Application",
        "body": "The process of applying a function to its arguments in order to evaluate it."
      }
    },
    {
      "h": "Notation Styles"
    },
    {
      "table": {
        "head": [
          "Notation Style",
          "Example Syntax"
        ],
        "rows": [
          [
            "Mathematical Notation",
            "f(x)"
          ],
          [
            "Some Functional Languages (e.g. Haskell)",
            "f x (written simply without parentheses)"
          ]
        ]
      }
    },
    {
      "code": {
        "lang": "pseudo",
        "src": "let result = myFunc(5, 10)"
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Function Application — Key Facts",
        "body": "Function application = supplying arguments to a function to get a result. Mathematical style: `f(x)`. Haskell/functional style: `f x` (space, no parentheses). Applications can be chained: `f(g(x))` — inner first, then outer."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Function Application Misconception",
        "body": "**Functional languages always require parentheses for function calls** — in Haskell, function application is denoted by a space: `f x` not `f(x)`. Parentheses are used for grouping, not for the call itself. `f(x)` is also valid in Haskell but only because the inner `(x)` evaluates to `x`."
      }
    }
  ],
  "flashcards": [
    [
      "What is function application?",
      "The process of supplying arguments to a function and evaluating it."
    ],
    [
      "How is function application written in Haskell-like languages?",
      "Simply by putting a space between the function name and its arguments, e.g., `f x`."
    ],
    [
      "What is the result of applying a function?",
      "The evaluation of the function's body using the provided arguments."
    ],
    [
      "If f(x) = x + 2, what is the application f(3)?",
      "5"
    ],
    [
      "Can function application be chained?",
      "Yes, the result of one application can be the argument to another, e.g., f(g(x))."
    ]
  ],
  "quiz": [
    {
      "q": "What does 'function application' mean?",
      "opts": [
        "Writing the code for a function.",
        "Calling a function with arguments to get a result.",
        "Assigning a function to a variable.",
        "Combining two functions into one."
      ],
      "ans": 1,
      "why": "Application is the act of providing inputs to a function so it can evaluate and produce an output."
    },
    {
      "q": "In Haskell, how do you apply the function `add` to arguments `x` and `y`?",
      "opts": [
        "add(x, y)",
        "add[x, y]",
        "add x y",
        "add(x)(y)"
      ],
      "ans": 2,
      "why": "In Haskell, function application is denoted by spaces."
    },
    {
      "q": "What is evaluated during function application?",
      "opts": [
        "The type signature.",
        "The function's body using the supplied arguments.",
        "The domain and co-domain.",
        "The compiler directives."
      ],
      "ans": 1,
      "why": "The body of the function executes with the actual values passed in."
    },
    {
      "q": "If `double x = x * 2`, what is the value of `double (double 3)`?",
      "opts": [
        "6",
        "9",
        "12",
        "18"
      ],
      "ans": 2,
      "why": "First application: double 3 is 6. Second application: double 6 is 12."
    }
  ],
  "exam": [
    {
      "q": "Describe the process of function application. (2 marks)",
      "marks": 2,
      "ms": [
        "Providing arguments/inputs to a function (1).",
        "Evaluating the function to produce an output/result (1)."
      ]
    }
  ]
};

C["compsci:4.12.1.4"] = {
  "notes": [
    {
      "h": "Partial Function Application & Currying"
    },
    {
      "callout": {
        "t": "def",
        "h": "Partial Function Application",
        "body": "Binding some of a function's arguments, creating a new function that takes the remaining arguments."
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Currying",
        "body": "A technique where a function taking multiple arguments is translated into a sequence of functions, each taking a single argument. This enables partial application."
      }
    },
    {
      "h": "Example Process"
    },
    {
      "steps": [
        {
          "h": "Step 1: Original Function",
          "m": "add(x, y)",
          "n": "A function that takes two arguments and adds them."
        },
        {
          "h": "Step 2: Partial Application",
          "m": "addFive = add(5)",
          "n": "Bind the first argument (x=5). Returns a new function waiting for y."
        },
        {
          "h": "Step 3: Evaluating Remaining Argument",
          "m": "addFive(10)",
          "n": "Provide the remaining argument (y=10). Yields the final result 15."
        }
      ]
    },
    {
      "code": {
        "lang": "pseudo",
        "src": "function add(x) {\n  return function(y) {\n    return x + y\n  }\n}\nlet addFive = add(5)\nlet result = addFive(10) // 15"
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Partial Application & Currying",
        "body": "**Partial application**: supply fewer arguments than expected → returns a new function waiting for the rest (e.g., `addFive = add(5)` gives a function that adds 5 to any argument). **Currying**: transforming `f(x, y)` into a chain `f(x)(y)` where each call takes exactly one argument. Currying enables partial application; they are related but distinct."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Partial Application vs Currying",
        "body": "**Partial application and currying are the same thing** — currying restructures a function into single-argument steps; partial application binds some arguments to produce a new function. You can partially apply without currying. **Partial application immediately produces the final answer** — it produces a new function that still needs the remaining arguments; only full application yields the final value."
      }
    }
  ],
  "flashcards": [
    [
      "What is partial function application?",
      "Providing a function with fewer arguments than it expects, resulting in a new function that expects the remaining arguments."
    ],
    [
      "What is currying?",
      "Translating a function with multiple arguments into a sequence of functions, each taking one argument."
    ],
    [
      "If `mul(x, y) = x * y`, what does `mul(2)` return in a curried language?",
      "A new function that takes one argument and multiplies it by 2."
    ],
    [
      "Why is partial application useful?",
      "It allows creating specialized functions from general ones, reducing code repetition."
    ],
    [
      "How many arguments does a fully curried function take at a time?",
      "Exactly one."
    ]
  ],
  "quiz": [
    {
      "q": "What is returned when a function is partially applied?",
      "opts": [
        "An error.",
        "The final result.",
        "A new function expecting the remaining arguments.",
        "A tuple of the arguments."
      ],
      "ans": 2,
      "why": "Partial application locks in some arguments and returns a new function to accept the rest."
    },
    {
      "q": "What is 'currying'?",
      "opts": [
        "Optimizing a function for speed.",
        "Converting a multi-argument function into a chain of single-argument functions.",
        "Combining two functions into one.",
        "Applying all arguments at once."
      ],
      "ans": 1,
      "why": "Currying transforms f(x,y) into f(x)(y)."
    },
    {
      "q": "Given `power(base, exp)` in a curried language, what is `power(2)`?",
      "opts": [
        "4",
        "A function that squares a number.",
        "A function that takes an exponent and calculates 2^exp.",
        "An error."
      ],
      "ans": 2,
      "why": "It partially applies the base as 2, returning a function waiting for the exponent."
    },
    {
      "q": "Which feature is essential for partial function application to work?",
      "opts": [
        "First-class functions",
        "Mutable state",
        "Loops",
        "Graph schemas"
      ],
      "ans": 0,
      "why": "Functions must be first-class so they can be returned as results from the partial application."
    }
  ],
  "exam": [
    {
      "q": "Explain the difference between function application and partial function application. (3 marks)",
      "marks": 3,
      "ms": [
        "Function application provides all arguments to evaluate and get a final result (1).",
        "Partial function application provides only some of the required arguments (1).",
        "This results in returning a new function that takes the remaining arguments (1)."
      ]
    }
  ]
};

C["compsci:4.12.1.5"] = {
  "notes": [
    {
      "h": "Composition of Functions"
    },
    {
      "callout": {
        "t": "def",
        "h": "Function Composition",
        "body": "The process of combining two or more functions to produce a new function."
      }
    },
    {
      "callout": {
        "t": "warn",
        "h": "Order of Execution",
        "body": "Given f(x) and g(x), composing them as `f ∘ g` means evaluating g(x) first, and then passing its result as the argument to f. `(f ∘ g)(x)` is equivalent to `f(g(x))`."
      }
    },
    {
      "h": "Evaluation Steps for `(f ∘ g)(x)`"
    },
    {
      "steps": [
        {
          "h": "Inner Function",
          "m": "g(x)",
          "n": "Evaluate the inner function first with the given input."
        },
        {
          "h": "Pass Output",
          "m": "y = g(x)",
          "n": "The result of g(x) becomes the input for the next function."
        },
        {
          "h": "Outer Function",
          "m": "f(y)",
          "n": "Evaluate the outer function. Yields the final combined output."
        }
      ]
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Function Composition Rules",
        "body": "`(f ∘ g)(x) = f(g(x))` — **right to left**: g runs first, then f. For validity: the **co-domain of g must match the domain of f** (the output type of g must be acceptable input to f). Composition lets you chain simple reusable functions into complex behaviour without intermediate variables."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "Composition Order Misconception",
        "body": "**`f ∘ g` means f is applied first, then g** — it is the opposite: the rightmost function in composition notation runs first. `(f ∘ g)(x) = f(g(x))`, so g evaluates first and its result is passed to f. Think of it as reading right to left."
      }
    }
  ],
  "flashcards": [
    [
      "What is function composition?",
      "Combining two functions such that the output of one becomes the input to the other."
    ],
    [
      "What does the notation `f ∘ g` mean?",
      "Compose f and g. Specifically, apply g first, then apply f to the result. `f(g(x))`."
    ],
    [
      "In the expression `f(g(x))`, which function is evaluated first?",
      "g(x) is evaluated first."
    ],
    [
      "For `f ∘ g` to be valid, what must be true about their types?",
      "The co-domain of g must match (or be a subset of) the domain of f."
    ],
    [
      "What is the advantage of function composition?",
      "It allows building complex behaviors by piping together simple, reusable functions."
    ]
  ],
  "quiz": [
    {
      "q": "What is the equivalent of `(f ∘ g)(x)`?",
      "opts": [
        "g(f(x))",
        "f(x) * g(x)",
        "f(g(x))",
        "f(x) + g(x)"
      ],
      "ans": 2,
      "why": "The symbol ∘ denotes composition, and it applies right-to-left."
    },
    {
      "q": "If `double(x) = x * 2` and `addOne(x) = x + 1`, what is `(double ∘ addOne)(3)`?",
      "opts": [
        "7",
        "8",
        "10",
        "12"
      ],
      "ans": 1,
      "why": "First addOne(3) = 4. Then double(4) = 8."
    },
    {
      "q": "If `double(x) = x * 2` and `addOne(x) = x + 1`, what is `(addOne ∘ double)(3)`?",
      "opts": [
        "7",
        "8",
        "10",
        "12"
      ],
      "ans": 0,
      "why": "First double(3) = 6. Then addOne(6) = 7."
    },
    {
      "q": "In order to compose `f` and `g` as `f(g(x))`, what type condition must be met?",
      "opts": [
        "f and g must have the same domain.",
        "The output type of g must match the input type of f.",
        "The output type of f must match the input type of g.",
        "Both functions must return integers."
      ],
      "ans": 1,
      "why": "Because the result of g is passed to f, g's co-domain must match f's domain."
    }
  ],
  "exam": [
    {
      "q": "A program defines functions `square(x)` returning x^2 and `half(x)` returning x/2. Write the composition notation to halve a number and then square the result, and calculate its value for x=4. (3 marks)",
      "marks": 3,
      "ms": [
        "Square composed with half: `square ∘ half` or `square(half(x))` (1).",
        "half(4) = 2 (1).",
        "square(2) = 4 (1)."
      ]
    }
  ]
};

C["compsci:4.12.2.1"] = {
  "notes": [
    {
      "h": "Functional Operations: map, filter, fold"
    },
    {
      "callout": {
        "t": "def",
        "h": "Higher-Order Functions",
        "body": "Map, filter, and fold are higher-order functions used extensively in functional programming to process lists."
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Map",
        "body": "Applies a function to **every element** of a list, returning a new list of the same length. `map(f, [a, b, c])` → `[f(a), f(b), f(c)]`."
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Filter",
        "body": "Takes a predicate (boolean function) and a list. Returns a new list containing only elements for which the predicate returns `true`. Result may be shorter than the original."
      }
    },
    {
      "callout": {
        "t": "def",
        "h": "Fold / Reduce",
        "body": "Takes a combining function, an initial accumulator, and a list. Processes elements one by one, updating the accumulator until the list is empty. Returns a single value."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Which Produces What?",
        "body": [
          {
            "kv": [
              ["map", "New list, same length — every element transformed"],
              ["filter", "New list, same or shorter — elements kept or removed"],
              ["fold", "Single value — list collapsed to one result"]
            ]
          }
        ]
      }
    },
    {
      "h": "Operation Examples"
    },
    {
      "table": {
        "head": [
          "Operation",
          "Pseudo-code Syntax"
        ],
        "rows": [
          [
            "Map",
            "map(double, [1, 2, 3]) // returns [2, 4, 6]"
          ],
          [
            "Filter",
            "filter(isEven, [1, 2, 3, 4]) // returns [2, 4]"
          ],
          [
            "Fold",
            "fold(add, 0, [1, 2, 3]) // returns 6"
          ]
        ]
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "map / filter / fold Misconceptions",
        "body": "**map changes the length of the list** — map always returns a list of the same length as the input; every element is transformed but nothing is added or removed. Only filter can shorten the list. **fold always produces a list** — fold (reduce) collapses a list down to a single value (a number, string, boolean, etc.), not a list."
      }
    }
  ],
  "flashcards": [
    [
      "What does the `map` function do?",
      "Applies a given function to each element of a list, returning a new list of the results."
    ],
    [
      "What does the `filter` function do?",
      "Returns a new list containing only elements that satisfy a given boolean condition (predicate)."
    ],
    [
      "What does the `fold` (or reduce) function do?",
      "Combines elements of a list into a single value using an accumulator and a combining function."
    ],
    [
      "What is a 'predicate' in the context of `filter`?",
      "A function that takes a value and returns true or false."
    ],
    [
      "If you `map` a list of 5 elements, how many elements will the resulting list have?",
      "Exactly 5."
    ]
  ],
  "quiz": [
    {
      "q": "Which higher-order function is best for extracting all negative numbers from a list?",
      "opts": [
        "map",
        "filter",
        "fold",
        "reduce"
      ],
      "ans": 1,
      "why": "Filter keeps elements that match a condition (is negative)."
    },
    {
      "q": "What will `map(x => x * 10, [1, 2, 3])` evaluate to?",
      "opts": [
        "[10, 2, 3]",
        "[1, 2, 30]",
        "60",
        "[10, 20, 30]"
      ],
      "ans": 3,
      "why": "Map multiplies every element by 10."
    },
    {
      "q": "Which operation reduces a list of numbers to their sum?",
      "opts": [
        "map",
        "filter",
        "fold",
        "append"
      ],
      "ans": 2,
      "why": "Fold (or reduce) combines elements into a single aggregate value, like a sum."
    },
    {
      "q": "If `filter` is applied to a list, what can be said about the length of the new list?",
      "opts": [
        "It is exactly the same length.",
        "It is greater than or equal to the original.",
        "It is less than or equal to the original.",
        "It is exactly 1."
      ],
      "ans": 2,
      "why": "Filter removes items that fail the condition, so the list length either stays the same or decreases."
    }
  ],
  "exam": [
    {
      "q": "Explain how the `fold` (or reduce) function works when applied to a list of integers to find their sum. Assume the list is [2, 4, 6] and the initial value is 0. (4 marks)",
      "marks": 4,
      "ms": [
        "Fold takes a combining function (addition) and an initial accumulator (0) (1).",
        "It applies the function to the accumulator and the first element: 0 + 2 = 2 (1).",
        "It carries the new accumulator forward to the next element: 2 + 4 = 6 (1).",
        "It repeats for the final element: 6 + 6 = 12, returning 12 as the final result (1)."
      ]
    }
  ]
};

C["compsci:4.12.3.1"] = {
  "notes": [
    {
      "h": "List Processing"
    },
    {
      "callout": {
        "t": "def",
        "h": "Lists",
        "body": "In functional languages, lists are a fundamental recursive data structure."
      }
    },
    {
      "callout": {
        "t": "memorise",
        "h": "Anatomy of a List",
        "body": [
          {
            "kv": [
              ["Head", "The first element. `head([1, 2, 3])` → `1`"],
              ["Tail", "Everything **after** the head — itself a list. `tail([1, 2, 3])` → `[2, 3]`"],
              ["Empty list `[]`", "No head, no tail. Used as the **base case** in recursive list functions."]
            ]
          }
        ]
      }
    },
    {
      "callout": {
        "t": "info",
        "h": "List Operations",
        "body": [
          {
            "kv": [
              ["Prepend (cons `:`)", "Adds an element to the front: `1 : [2, 3]` → `[1, 2, 3]`. Creates a new list."],
              ["Append (`++`)", "Joins two lists: `[1] ++ [2, 3]` → `[1, 2, 3]`."]
            ]
          }
        ]
      }
    },
    {
      "callout": {
        "t": "tip",
        "h": "Recursive Pattern",
        "body": "Most functional list algorithms follow the pattern: if list is empty → return base value. Otherwise, process head and recurse on tail. The empty list terminates the recursion."
      }
    },
    {
      "callout": {
        "t": "miscon",
        "h": "List Head/Tail Misconceptions",
        "body": "**The tail of a list is the last element** — the tail is everything AFTER the head (first element) and is itself a list. `tail([1,2,3]) = [2,3]`, not `3`. **`tail` of a one-element list returns the element** — `tail([x])` returns the empty list `[]`, not `x`. The empty list is also the base case for recursive list algorithms."
      }
    }
  ],
  "flashcards": [
    [
      "What is the 'head' of a list?",
      "The very first element of the list."
    ],
    [
      "What is the 'tail' of a list?",
      "A list containing all elements except the head."
    ],
    [
      "What is the head of the list `[5, 10, 15]`?",
      "5"
    ],
    [
      "What is the tail of the list `[5, 10, 15]`?",
      "`[10, 15]`"
    ],
    [
      "What is 'prepending' in list processing?",
      "Adding a single element to the beginning of a list to create a new list."
    ]
  ],
  "quiz": [
    {
      "q": "If `myList = [A, B, C]`, what is `tail(myList)`?",
      "opts": [
        "A",
        "C",
        "[B, C]",
        "[A, B]"
      ],
      "ans": 2,
      "why": "The tail is everything after the first element, so [B, C]."
    },
    {
      "q": "What happens if you ask for the head of an empty list?",
      "opts": [
        "Returns 0",
        "Returns an empty list",
        "Causes an error/exception",
        "Returns null"
      ],
      "ans": 2,
      "why": "An empty list has no elements, so it has no head. Attempting to access it typically raises an error in functional languages."
    },
    {
      "q": "What is the result of prepending `1` to `[2, 3]`?",
      "opts": [
        "[1, 2, 3]",
        "[2, 3, 1]",
        "[123]",
        "[[1], [2, 3]]"
      ],
      "ans": 0,
      "why": "Prepend adds the element to the front."
    },
    {
      "q": "Why is the empty list `[]` important in recursive list processing?",
      "opts": [
        "It stores variables.",
        "It acts as the base case to stop recursion.",
        "It is the only way to return a value.",
        "It reverses the list."
      ],
      "ans": 1,
      "why": "Recursive functions typically process the head and recurse on the tail until the list is empty."
    }
  ],
  "exam": [
    {
      "q": "Given the list `L = [10, 20, 30]`, evaluate `head(tail(L))`. Show your working. (2 marks)",
      "marks": 2,
      "ms": [
        "tail(L) evaluates to [20, 30] (1).",
        "head([20, 30]) evaluates to 20 (1)."
      ]
    }
  ]
};

})(window.KOS_CONTENT);