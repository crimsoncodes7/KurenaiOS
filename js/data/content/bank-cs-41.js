/* Kurenai OS — past-paper bank: AQA 7517 §4.1 Fundamentals of programming
   Exam-style items modelled on AQA 7516/7517 Paper 1 Section A and Paper 2
   questions, June 2016–2025. `src` names the paper each item is modelled on.
   Every question is re-written — new context, numbers and wording — so the
   original papers in the A-level archive stay a clean mock. Mark-scheme
   points follow the examiners' own phrasing (AO1 knowledge / AO1
   understanding / AO2 apply) and the "Max n" convention. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (X) {

X("compsci:4.1.1.1", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "How data types are actually examined" },
    "Data types are rarely a question on their own. They arrive as the **first part of a Section A programming question** (\"state the most appropriate data type for…\"), as a **record/array declaration** in a skeleton-program task, or as a why-question about **pointer/reference** types in the data-structures section.",
    { table: { head: ["Pattern", "Tariff", "What earns the mark"], rows: [
      ["State the most suitable data type for a value", "1", "The type AND it must fit the range/precision: `Integer` for a count, `Real` for a measurement, `Boolean` for a flag, `String` for a postcode (it has letters), `Date/Time` for a timestamp."],
      ["Why is `String` more suitable than `Integer` for a phone number?", "1–2", "Leading zeros would be lost / no arithmetic is ever performed / may contain `+` or spaces."],
      ["Explain what a pointer data type stores", "1–2", "The **memory address** of another data item/object (created dynamically at run time)."],
      ["Describe a user-defined type for X", "2–3", "Name the built-in types composed, e.g. a `record` with fields `Name: String`, `Score: Integer`; state that it is built from language-defined types."]
    ]}},
    { callout: { t: "warn", body: "\"Number\" is never a data type in a mark scheme. Say **integer** or **real/float** and be ready to justify the choice by whether a fractional part is possible." }},
    { callout: { t: "memorise", h: "The eight built-ins to name on demand", body: "integer · real/float · Boolean · character · string · date/time · pointer/reference · record (plus array). The spec lists exactly these and a \"state three data types\" question wants three from this list, not `long` or `double`." }}
  ],
  flashcards: [
    ["A variable will hold a UK postcode. Which data type and why?", "String — postcodes contain letters and a space, and no arithmetic is done on them."],
    ["A variable holds the number of students in a class. Data type?", "Integer — a count is always a whole number."],
    ["A variable records whether a form has been submitted. Data type?", "Boolean — exactly two states, true/false."],
    ["What does a pointer/reference variable actually store?", "The memory address of another data item or object, typically one created dynamically at run time."],
    ["Why store a telephone number as a string rather than an integer?", "Leading zeros must be kept, the value may contain + or spaces, and no arithmetic is ever performed on it."],
    ["What is a user-defined data type?", "A type the programmer defines, built from language-defined (built-in) types — e.g. a record with named fields, or an enumeration."],
    ["State the data type of the result of 7 / 2 in most languages.", "Real/float (3.5). Integer division would need DIV: 7 DIV 2 = 3."],
    ["Why is date/time listed as a separate data type?", "It needs its own storage format and operations (differences, comparisons, formatting) that neither integer nor string provide safely."]
  ],
  quiz: [
    { q: "A program stores the time an order was placed to the second. Most appropriate type?", opts: ["String", "Integer", "Date/Time", "Real"], ans: 2, why: "Date/Time supports comparison and arithmetic on timestamps; a string cannot be compared chronologically without parsing." },
    { q: "Which value could NOT be stored correctly in an integer variable?", opts: ["−17", "0", "3.0 exactly", "0.5"], ans: 3, why: "0.5 has a fractional part; the others are whole numbers (3.0 would be stored as 3)." },
    { q: "A variable is declared as a pointer. Its value is:", opts: ["a copy of the data item", "a memory address", "always zero", "a text label"], ans: 1, why: "Pointers/references hold the address of the item they point to, not the item itself." },
    { q: "Best type for a student's exam grade recorded as a single letter A–E?", opts: ["Character", "Integer", "Boolean", "Real"], ans: 0, why: "One letter is a character; a string would work but is heavier than needed." },
    { q: "Why should a National Insurance number (e.g. QQ 12 34 56 C) be a string?", opts: ["It is too large for an integer", "It contains letters and spaces", "It must be encrypted", "Strings are faster"], ans: 1, why: "The presence of letters rules out any numeric type." },
    { q: "Which is an example of a user-defined data type?", opts: ["A record type Student with fields Name and DOB", "The built-in integer type", "A variable named total", "The value TRUE"], ans: 0, why: "Records compose built-in types into a new named type defined by the programmer." }
  ],
  exam: [
    { level: "AS", src: "AS 2018 P1 Q3", q: "A program stores, for each parcel, its weight in kilograms, its tracking code (e.g. `RB123456789GB`) and whether it has been delivered. State the most appropriate data type for each of the three values.", marks: 3,
      ms: ["Weight: real/float (1)", "Tracking code: string (1)", "Delivered: Boolean (1)"] },
    { src: "AQA 2019 P1 Q2", q: "Explain what is meant by a pointer data type and give one situation in which a program would use one.", marks: 2,
      ms: ["A pointer stores the memory address of another data item / object (1)", "Used to link nodes of a dynamic structure such as a linked list, or to refer to an object created at run time (1)"] },
    { level: "AS", src: "AS 2022 P1 Q2", q: "A programmer decides to store customers' telephone numbers as strings rather than as integers. Give two reasons why this is the appropriate choice.", marks: 2,
      ms: ["Leading zeros would be lost if stored as an integer (1)", "A phone number may contain characters such as `+`, spaces or brackets (1)", "No arithmetic is ever performed on a phone number (1)", "Max 2"] },
    { src: "AQA 2023 P1 Q1", ctx: "A theatre booking system records each seat as a value of a user-defined type `Seat`, with fields `Row` (a single letter), `Number` (1–40), `Price` and `Booked`.",
      parts: [
        { q: "State a suitable built-in data type for each of the four fields.", marks: 2, ms: ["Row: character (or string); Number: integer (1)", "Price: real/float (accept decimal/currency); Booked: Boolean (1)"] },
        { q: "Explain why `Seat` is described as a user-defined data type.", marks: 2, ms: ["It is defined by the programmer rather than provided by the language (1)", "It is composed of / built from language-defined (built-in) types (1)"] },
        { q: "Explain one advantage of grouping the four values into a record rather than using four separate arrays.", marks: 2, ms: ["All data about one seat is kept together / accessed through one identifier (1)", "So it can be passed to a subroutine / stored in a file as a single unit, reducing the chance of the parallel arrays getting out of step (1)"] }
      ] }
  ]
});

X("compsci:4.1.1.2", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "The AS Section A programming task" },
    "Every AS Paper 1 carries an 8–11 mark **write-a-program** question in Section A: persistence of a number (2016), greatest common factor (2017), a number series (2018), decimal→binary (2019), factorial detection (2020), dice simulation (2022), prime factorisation (2023), Roman-numeral-style output (2024), palindrome check (2025). The marks are awarded for **program features**, not for a perfect answer:",
    { ul: [
      "one mark for a **loop** that repeats the right number of times / until the right condition",
      "one mark for the **selection** that makes the decision the question describes",
      "one or two marks for **correct arithmetic** (MOD, DIV, integer division, accumulation)",
      "one mark for **input** taken and validated as asked, one for **output** in the stated format",
      "one mark for **meaningful identifiers** / a sensible data structure — awarded only if the program is substantially attempted",
      "the final one or two marks for a **fully working program** with screenshots of the stated test cases"
    ]},
    { callout: { t: "tip", h: "Follow-up parts are predictable", body: "\"Why was a WHILE loop chosen rather than a FOR loop?\" (the number of iterations is not known in advance) · \"Why does REPEAT differ from WHILE for this input?\" (REPEAT executes the body at least once, so a negative input is processed before the test) · \"Why were temporary variables used?\" (to preserve the original values for later use)." }},
    { callout: { t: "memorise", h: "Definite vs indefinite iteration", body: "**Definite**: the number of repetitions is known before the loop starts (FOR). **Indefinite**: it depends on a condition tested at the **start** (WHILE — may run zero times) or the **end** (REPEAT…UNTIL / DO…WHILE — always runs at least once)." }}
  ],
  flashcards: [
    ["Why choose WHILE rather than FOR for a loop that reads input until a sentinel value?", "The number of iterations is not known in advance — it depends on the data, so indefinite iteration is required."],
    ["How does a REPEAT…UNTIL loop differ from WHILE on an input that fails the test immediately?", "REPEAT executes its body once before testing, so the failing input is still processed; WHILE tests first and executes zero times."],
    ["Name the three combining principles of imperative programming.", "Sequence, selection (choice) and iteration (repetition)."],
    ["What is nested selection?", "An IF statement placed inside a branch of another IF statement."],
    ["Why use meaningful identifier names?", "The program is easier to understand, debug and maintain, by the original programmer and by others; the purpose of each variable is clear without comments."],
    ["What is the difference between a variable declaration and an assignment?", "Declaration reserves storage and fixes the identifier and (usually) type; assignment stores a value in it."],
    ["When is definite iteration appropriate?", "When the number of repetitions is known before the loop begins, e.g. processing every element of an array of known size."],
    ["What does 'condition at the end of the iterative structure' guarantee?", "The loop body executes at least once."]
  ],
  quiz: [
    { q: "A loop must read marks until the user types −1. Which construct is most appropriate?", opts: ["FOR i ← 1 TO 10", "WHILE mark ≠ −1", "A sequence of ten READ statements", "A nested IF"], ans: 1, why: "The number of marks is unknown, so indefinite iteration with a condition is needed." },
    { q: "Which loop always executes its body at least once?", opts: ["WHILE…ENDWHILE", "FOR…ENDFOR with an empty range", "REPEAT…UNTIL", "None of them"], ans: 2, why: "REPEAT…UNTIL tests its condition after the body, so the body runs before any test." },
    { q: "`total ← total + n` inside a FOR loop is an example of:", opts: ["selection", "assignment within iteration", "declaration", "recursion"], ans: 1, why: "An assignment statement placed inside definite iteration — the accumulator pattern." },
    { q: "Why are identifiers such as `numberOfPassengers` preferred to `n`?", opts: ["They run faster", "They use less memory", "They make the program's purpose clear to readers and maintainers", "Compilers require it"], ans: 2, why: "Meaningful names aid understanding, debugging and maintenance; they have no effect on speed." },
    { q: "Selection nested inside iteration is needed when:", opts: ["every element is treated identically", "a decision must be made for each repetition", "the loop runs exactly once", "the program has no input"], ans: 1, why: "Each pass of the loop makes a choice — e.g. counting the even numbers in a list." },
    { q: "A constant declaration differs from a variable declaration because:", opts: ["a constant cannot be given a name", "a constant's value cannot change while the program runs", "a constant uses more memory", "a constant is always an integer"], ans: 1, why: "A constant is fixed for the program's lifetime; the identifier makes the value meaningful and easy to change at source." }
  ],
  exam: [
    { level: "AS", src: "AS 2025 P1 Q2", q: "A program uses a REPEAT…UNTIL loop to read a positive integer from the user, and continues to loop while the value entered is less than 1. Explain why replacing this with a WHILE loop, keeping the same condition, would change the program's behaviour when the first value entered is −4.", marks: 2,
      ms: ["REPEAT…UNTIL tests its condition at the end, so the body (the input) executes at least once before the test (1)", "A WHILE loop tests first; with the same condition the loop body would not run / the program would not re-prompt for −4 in the same way (1)"] },
    { level: "AS", src: "AS 2016 P1 Q5.3", q: "A program that repeatedly divides a number by 2 until it reaches 1 uses a WHILE loop. Explain why a FOR loop would have been an inappropriate choice.", marks: 1,
      ms: ["The number of iterations is not known before the loop starts / depends on the value entered, so indefinite iteration is required (1)"] },
    { level: "AS", src: "AS 2024 P1 Q4.1", ctx: "The **digital root** of a positive integer is found by adding its digits, then adding the digits of the result, and so on until a single digit remains. For example, 9875 → 9+8+7+5 = 29 → 2+9 = 11 → 1+1 = 2, so the digital root of 9875 is 2 and it took 3 additions.",
      parts: [
        { q: "Write a program that asks the user for a positive integer, then outputs its digital root and the number of additions performed. Your program should reject any input less than 1 and ask again.", marks: 8,
          ms: ["Input taken and validated with a loop that re-prompts while value < 1 (1)", "Outer loop repeats while the number has more than one digit (number ≥ 10) (1)", "Inner loop extracts each digit using MOD 10 and DIV 10 (1)", "Digits accumulated into a running sum, which becomes the new number (1)", "Counter incremented once per addition pass (1)", "Correct outputs for digital root and count in the required format (1)", "Meaningful identifiers used throughout (1)", "Fully working program matching the example 9875 → 2, 3 additions (1)"] },
        { q: "Explain why the outer loop's condition cannot simply be `number ≠ digital root`.", marks: 1, ms: ["The digital root is not known until the loop finishes — the condition must use a property that can be tested at each iteration, such as the number having more than one digit (1)"] }
      ] },
    { level: "AS", src: "AS 2017 P1 Q3.3", q: "In a program that swaps and then prints two values, the programmer copies the original inputs into two additional variables before the swap. State why these temporary variables are needed.", marks: 1,
      ms: ["To preserve the original values so they can be output / used later — otherwise they are overwritten and the output would not make sense (1)"] },
    { src: "AQA 2020 P1 Q3", q: "Describe the difference between definite and indefinite iteration, and state, with a reason, which is more appropriate for processing each character of a string whose length is known.", marks: 3,
      ms: ["Definite iteration repeats a known number of times, fixed before the loop starts (1)", "Indefinite iteration repeats until/while a condition holds, so the number of repetitions is not known in advance (1)", "Definite (FOR) is appropriate: the length of the string is known so the loop count is known before it begins (1)"] }
  ]
});

X("compsci:4.1.1.3", {
  flashcards: [
    ["What is the result of 17 DIV 5 and 17 MOD 5?", "17 DIV 5 = 3 (integer quotient); 17 MOD 5 = 2 (remainder)."],
    ["Which two operators extract the digits of an integer one at a time?", "MOD 10 gives the last digit; DIV 10 removes it."],
    ["How do you test whether n is even using MOD?", "n MOD 2 = 0."],
    ["What is truncation?", "Discarding the fractional part of a real number, always towards zero (e.g. 3.9 → 3, −3.9 → −3)."],
    ["How does rounding differ from truncation for 2.7?", "Rounding gives 3 (nearest integer); truncation gives 2 (fractional part dropped)."],
    ["Give the order of precedence for arithmetic operators.", "Exponentiation, then multiplication/division/DIV/MOD, then addition/subtraction; brackets override."],
    ["What does 2 ^ 10 mean in pseudo-code?", "Exponentiation: 2 to the power 10 = 1024."],
    ["Why might integer division be used when converting seconds to minutes?", "minutes ← seconds DIV 60 gives whole minutes; seconds MOD 60 gives the remaining seconds."]
  ],
  quiz: [
    { q: "What is 29 MOD 6?", opts: ["4", "5", "3", "6"], ans: 1, why: "29 = 4×6 + 5, so the remainder is 5." },
    { q: "What is 29 DIV 6?", opts: ["4", "5", "4.83", "6"], ans: 0, why: "DIV is integer division: the quotient is 4 with the fraction discarded." },
    { q: "Which expression gives the tens digit of a three-digit integer n?", opts: ["n MOD 10", "(n DIV 10) MOD 10", "n DIV 100", "n MOD 100"], ans: 1, why: "DIV 10 drops the units digit, then MOD 10 isolates what is now the last digit." },
    { q: "ROUND(−2.5) to nearest integer under 'round half away from zero' gives:", opts: ["−2", "−3", "2", "0"], ans: 1, why: "Half away from zero: −2.5 → −3. (Truncation would give −2.)" },
    { q: "In `3 + 4 * 2 ^ 2`, which operation is performed first?", opts: ["3 + 4", "4 * 2", "2 ^ 2", "Left to right"], ans: 2, why: "Exponentiation has the highest precedence, so 2^2 = 4, then 4×4 = 16, then 3 + 16 = 19." },
    { q: "A program computes 7 / 2 and stores the result in an integer variable using truncation. Value stored?", opts: ["3.5", "4", "3", "Error"], ans: 2, why: "7 / 2 = 3.5; truncation keeps 3." }
  ],
  exam: [
    { level: "AS", src: "AS 2019 P1 Q3.1", ctx: "A program converts a number of seconds entered by the user into hours, minutes and seconds. For 3725 it should output `1 h 2 m 5 s`.",
      parts: [
        { q: "Write pseudo-code for the conversion, using the operators DIV and MOD.", marks: 4, ms: ["hours ← total DIV 3600 (1)", "remaining ← total MOD 3600 (1)", "minutes ← remaining DIV 60 and seconds ← remaining MOD 60 (1)", "Output in the stated format (1)"] },
        { q: "Explain the difference between the results of `total / 3600` and `total DIV 3600` when total is 3725.", marks: 2, ms: ["`/` gives the real result 1.034… (1)", "DIV gives the integer quotient 1, discarding the fractional part (1)"] }
      ] },
    { src: "AQA 2021 P2 Q1", q: "Explain, using an example, the difference between rounding and truncation when a real number is converted to an integer.", marks: 2,
      ms: ["Rounding gives the nearest integer, e.g. 6.8 → 7 (1)", "Truncation discards the fractional part, e.g. 6.8 → 6 (1)"] },
    { src: "AQA 2018 P2 Q3", q: "A subroutine must determine whether an integer `n` is a multiple of both 3 and 4. Write an expression that evaluates to TRUE exactly when this is the case.", marks: 2,
      ms: ["Uses MOD with 3 and MOD with 4 tested against 0 (1)", "Combined correctly with AND: `(n MOD 3 = 0) AND (n MOD 4 = 0)` (accept `n MOD 12 = 0`) (1)"] },
    { level: "AS", src: "AS 2023 P1 Q5.1", q: "Write a program that inputs a positive integer and outputs the sum of its digits. For example, 4072 gives 13.", marks: 5,
      ms: ["Input taken (with validation for a positive integer) (1)", "Loop that continues while the number is greater than 0 (1)", "Digit extracted with MOD 10 and added to a running total (1)", "Number reduced with DIV 10 each iteration (1)", "Correct total output — program works for the example (1)"] }
  ]
});

X("compsci:4.1.1.4", {
  flashcards: [
    ["List the six relational operators.", "= (equal), ≠ (not equal), <, >, ≤, ≥."],
    ["What type does a relational expression evaluate to?", "Boolean — TRUE or FALSE."],
    ["Why is `IF x = 1 OR 2` wrong?", "`2` is not a Boolean; each comparison must be complete: `x = 1 OR x = 2`."],
    ["What is an off-by-one error in a loop condition?", "Using < where ≤ is needed (or vice versa), so the loop runs one time too few or too many."],
    ["Can strings be compared with < and >?", "Yes — lexicographically, by character code, so 'Zebra' < 'apple' in ASCII because upper-case codes are lower."],
    ["What is the result of 5 ≥ 5?", "TRUE — ≥ includes equality."],
    ["Why is comparing two reals for exact equality risky?", "Rounding errors mean 0.1 + 0.2 may not equal 0.3 exactly; compare with a tolerance instead."],
    ["Write a condition that is TRUE when age is between 13 and 19 inclusive.", "age ≥ 13 AND age ≤ 19."]
  ],
  quiz: [
    { q: "Which condition is TRUE only when `n` lies strictly between 10 and 20?", opts: ["n > 10 OR n < 20", "n > 10 AND n < 20", "n ≥ 10 AND n ≤ 20", "NOT (n > 10)"], ans: 1, why: "Strictly between excludes the ends and both comparisons must hold — AND." },
    { q: "A loop should process array indices 0 to 9. `WHILE i < 10` with i starting at 0 runs:", opts: ["9 times", "10 times", "11 times", "forever"], ans: 1, why: "i = 0,1,…,9 → 10 iterations; `i ≤ 10` would be the off-by-one error." },
    { q: "The expression `\"apple\" < \"Banana\"` in ASCII order evaluates to:", opts: ["TRUE", "FALSE", "an error", "0"], ans: 1, why: "'a' (97) is greater than 'B' (66), so \"apple\" is not less than \"Banana\"." },
    { q: "What is wrong with `IF mark ≥ 50 AND ≤ 70`?", opts: ["Nothing", "≤ 70 is not a complete comparison", "AND cannot join comparisons", "Mark should be a string"], ans: 1, why: "Each side of AND must be a Boolean: `mark ≥ 50 AND mark ≤ 70`." },
    { q: "The value of `7 ≠ 7` is:", opts: ["TRUE", "FALSE", "7", "undefined"], ans: 1, why: "Not-equal is false when both sides are the same." },
    { q: "Why should `IF total = 0.3` be avoided when total is a real accumulated by adding 0.1 three times?", opts: ["Reals cannot be compared", "Rounding error may make total ≠ 0.3 exactly", "0.3 is an integer", "= is not a relational operator"], ans: 1, why: "Binary floating point cannot represent 0.1 exactly, so the sum may be 0.30000000000000004." }
  ],
  exam: [
    { level: "AS", src: "AS 2020 P1 Q3", q: "A program validates that a percentage mark entered is in the range 0 to 100 inclusive. Write a Boolean expression that is TRUE when the mark is **invalid**.", marks: 2,
      ms: ["Correct comparisons: mark < 0, mark > 100 (1)", "Combined with OR: `mark < 0 OR mark > 100` (accept `NOT (mark ≥ 0 AND mark ≤ 100)`) (1)"] },
    { src: "AQA 2022 P1 Q3", q: "A loop is written as `FOR i ← 1 TO Length(word)` to examine each character of `word`, whose characters are indexed from 0. Explain the error and state the correct loop bounds.", marks: 2,
      ms: ["Off-by-one: index Length(word) does not exist / the first character at index 0 is missed (1)", "Correct bounds: `FOR i ← 0 TO Length(word) − 1` (1)"] },
    { src: "AQA 2017 P2 Q2", q: "Explain why testing two real numbers with `=` can give an unexpected result, and describe how a programmer should test whether they are equal.", marks: 3,
      ms: ["Reals are stored with limited precision so arithmetic introduces rounding errors (1)", "Two values that are mathematically equal may differ in their least significant bits (1)", "Test whether the absolute difference is less than a small tolerance, e.g. `ABS(a − b) < 0.0001` (1)"] },
    { level: "AS", src: "AS 2018 P1 Q2", q: "State the value of each of the following expressions. (i) `9 MOD 4 = 1` (ii) `\"cat\" ≠ \"Cat\"` (iii) `NOT (6 > 2)`", marks: 3,
      ms: ["(i) TRUE (1)", "(ii) TRUE — comparison is case-sensitive (1)", "(iii) FALSE (1)"] }
  ]
});

X("compsci:4.1.1.5", {
  flashcards: [
    ["Which Boolean operator has the highest precedence in NOT, AND, OR?", "NOT, then AND, then OR."],
    ["What is the value of NOT (A AND B) when A = TRUE, B = FALSE?", "A AND B = FALSE; NOT FALSE = TRUE."],
    ["State De Morgan's law for NOT (A OR B).", "NOT A AND NOT B."],
    ["What is XOR?", "Exclusive OR — TRUE when exactly one input is TRUE; used in parity and simple encryption."],
    ["What is short-circuit evaluation?", "In A AND B, if A is FALSE then B is never evaluated (and in A OR B, B is skipped when A is TRUE)."],
    ["Simplify A OR (A AND B).", "A (absorption)."],
    ["When would a programmer use XOR in a program?", "Toggling a Boolean flag, checking that exactly one of two options was chosen, or as a reversible cipher step."],
    ["Rewrite `NOT (x > 5)` without NOT.", "x ≤ 5."]
  ],
  quiz: [
    { q: "A = TRUE, B = FALSE, C = TRUE. Evaluate `A AND B OR C`.", opts: ["TRUE", "FALSE", "Error", "Depends on the language"], ans: 0, why: "AND binds tighter: (TRUE AND FALSE) OR TRUE = FALSE OR TRUE = TRUE." },
    { q: "Which is equivalent to `NOT (raining AND cold)`?", opts: ["NOT raining AND NOT cold", "NOT raining OR NOT cold", "raining OR cold", "raining XOR cold"], ans: 1, why: "De Morgan: the negation of a conjunction is the disjunction of the negations." },
    { q: "`TRUE XOR TRUE` evaluates to:", opts: ["TRUE", "FALSE", "1", "undefined"], ans: 1, why: "XOR is true only when the inputs differ." },
    { q: "`IF list ≠ NULL AND list.head > 0` avoids a crash because of:", opts: ["operator precedence", "short-circuit evaluation", "De Morgan's law", "absorption"], ans: 1, why: "If the first operand is FALSE the second is never evaluated, so `list.head` is never accessed on NULL." },
    { q: "How many rows does the truth table for three Boolean variables have?", opts: ["3", "6", "8", "9"], ans: 2, why: "2³ = 8 combinations." },
    { q: "Which condition is TRUE only when a user has ticked exactly one of two boxes?", opts: ["a AND b", "a OR b", "a XOR b", "NOT a"], ans: 2, why: "Exactly one — XOR." }
  ],
  exam: [
    { level: "AS", src: "AS 2022 P1 Q1", q: "A lift will move only if the doors are closed and either the up button or the down button (but not both) has been pressed. Write a Boolean expression for `Move` using the variables `DoorsClosed`, `Up` and `Down`.", marks: 2,
      ms: ["`Up XOR Down` (or `(Up OR Down) AND NOT (Up AND Down)`) (1)", "Combined with `DoorsClosed AND …` (1)"] },
    { src: "AQA 2024 P2 Q2", q: "Complete the truth table for `NOT A OR (A AND B)` and hence state a simpler equivalent expression.", marks: 3,
      ms: ["Column for A AND B: F F F T; column for NOT A: T T F F (1)", "Final column: T T F T (1)", "Equivalent to `NOT A OR B` (1)"] },
    { src: "AQA 2019 P1 Q3", q: "Explain what is meant by short-circuit evaluation of a Boolean expression and why a programmer might rely on it.", marks: 2,
      ms: ["The second operand is not evaluated when the first already determines the result — e.g. FALSE AND x, TRUE OR x (1)", "Allows a guard such as `index < length AND array[index] = target` to avoid an out-of-range access / division by zero (1)"] },
    { level: "AS", src: "AS 2024 P1 Q1", q: "Using De Morgan's law, rewrite `NOT (age < 18 OR member = FALSE)` without a NOT operator applied to a bracketed expression.", marks: 2,
      ms: ["`NOT (age < 18) AND NOT (member = FALSE)` (1)", "Simplified to `age ≥ 18 AND member = TRUE` (accept `age ≥ 18 AND member`) (1)"] }
  ]
});

X("compsci:4.1.1.6", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Local vs global — asked almost every AS year" },
    "AS Paper 1 has asked for the local/global **difference** (2019, 2023, 2024) and for **why locals are good practice** (2019, 2024). The examiners accept the same set of points every time, and the trap is giving two versions of the *same* point:",
    { table: { head: ["Accepted point", "Counts as"], rows: [
      ["A global is accessible from **all** parts of the program; a local only inside the block/subroutine in which it is declared", "Difference"],
      ["A global is declared in the main/outermost block; a local inside a subroutine", "Difference (same idea as scope — do not give both as two marks)"],
      ["A local **exists / uses memory only while** its subroutine is executing; a global for the whole run", "Difference AND a reason"],
      ["Locals make a subroutine **self-contained** — it can be reused in another program / tested independently", "Reason"],
      ["Prevents unintended side-effects / accidental changes from elsewhere", "Reason"],
      ["Variable names can be reused in other subroutines", "Reason"]
    ]}},
    { callout: { t: "warn", body: "\"Locals are stored on the stack\" is accepted as a *difference*, not as a reason for preferring them. And **constants**: a question that says \"the programmer used a constant for VAT rate\" wants *the value cannot be changed accidentally* and *one change in the declaration updates every use*." }}
  ],
  flashcards: [
    ["State the difference between a global and a local variable.", "A global is declared in the main program block and can be used anywhere; a local is declared inside a subroutine and can only be used there."],
    ["Give two reasons why local variables are good practice.", "Subroutines become self-contained/reusable; memory is used only while the subroutine executes; prevents unintended side-effects; names can be reused."],
    ["What happens to a local variable when its subroutine finishes?", "It ceases to exist — its memory (in the stack frame) is released."],
    ["Why declare VAT_RATE as a constant?", "Its value cannot be changed accidentally while the program runs, and changing it once in the declaration updates every use."],
    ["What is a side-effect in the context of global variables?", "A subroutine changes a global that other parts of the program rely on, so behaviour elsewhere changes unexpectedly."],
    ["What does 'scope' of a variable mean?", "The region of the program in which the identifier is valid and the variable can be accessed."],
    ["If a local variable has the same name as a global, which is used inside the subroutine?", "The local — it shadows the global within that scope."],
    ["Name a legitimate use of a global variable.", "A value genuinely needed everywhere, e.g. a configuration constant or a program-wide counter — but a constant or a parameter is usually better."]
  ],
  quiz: [
    { q: "A variable declared inside subroutine `Calc` is accessible from:", opts: ["the whole program", "only inside Calc", "any subroutine that calls Calc", "the main block only"], ans: 1, why: "Local scope is the block in which the variable is declared." },
    { q: "Which is a reason to prefer local variables?", opts: ["They run faster", "They make the subroutine self-contained and reusable", "They are always integers", "They persist between calls"], ans: 1, why: "Self-containment (no reliance on outside state) is the accepted reason; persistence is what they do NOT do." },
    { q: "A constant differs from a variable because:", opts: ["it has no identifier", "its value cannot change during execution", "it cannot be used in expressions", "it is stored on the stack"], ans: 1, why: "Fixed value for the program's lifetime — that is the definition." },
    { q: "Two subroutines each declare a local called `count`. What happens?", opts: ["A compile error", "They share one variable", "Each has its own independent count", "The second overwrites the first"], ans: 2, why: "Locals are separate storage in each subroutine's own scope (stack frame)." },
    { q: "Memory for a local variable is allocated:", opts: ["when the program starts", "when its subroutine is called", "never", "only if it is an array"], ans: 1, why: "It exists only while the subroutine executes; a global exists for the whole run." },
    { q: "Using a global for a subroutine's working value risks:", opts: ["unintended side-effects elsewhere in the program", "faster execution", "loss of the value after the call", "a syntax error"], ans: 0, why: "Other code that reads the global sees the change — the classic side-effect." }
  ],
  exam: [
    { level: "AS", src: "AS 2024 P1 Q2.1", q: "Describe two differences between local and global variables.", marks: 2,
      ms: ["A global is accessible from all parts of the program; a local only in the block/subroutine in which it is declared (1)", "A local is declared inside a subroutine; a global in the main program block / outside subroutines (1)", "A local only exists / uses memory while its subroutine is executing; a global exists for the whole run (1)", "Max 2"] },
    { level: "AS", src: "AS 2024 P1 Q2.2", q: "Explain why using local variables in subroutines is considered good practice.", marks: 2,
      ms: ["Makes the subroutine self-contained / aids modularisation — it can be reused in another program (1)", "Memory is used only while the subroutine executes (1)", "Prevents unintended side-effects / accidental changes (1)", "Variable names can be reused elsewhere (1)", "Max 2"] },
    { level: "AS", src: "AS 2019 P1 Q1", q: "A program calculates prices including VAT. The programmer declares `VAT_RATE` as a constant and stores each subtotal in a local variable of the subroutine that computes it. Explain the benefit of each decision.", marks: 3,
      ms: ["Constant: value cannot be altered accidentally during execution (1)", "Constant: one change in the declaration updates every use / the identifier makes the code readable (1)", "Local: exists only during the call so the subroutine is self-contained / cannot cause side-effects elsewhere (1)"] },
    { src: "AQA 2023 P1 Q2", q: "A subroutine uses a global variable `Total` as its working accumulator. Explain one problem this could cause and how a local variable would avoid it.", marks: 2,
      ms: ["Another part of the program that reads or writes `Total` could see / cause an unexpected change — a side-effect (1)", "A local `Total` exists only inside the subroutine so nothing else can observe or alter it (1)"] }
  ]
});

X("compsci:4.1.1.7", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Where string handling appears" },
    "String operations are examined inside the AS programming task (2025 asked for a **palindrome check** — read the string from both ends, or reverse it and compare) and inside skeleton-program parts (\"which built-in function returns the length…\"). The functions the specification names are the ones a mark scheme accepts as pseudo-code:",
    { kv: [
      ["`LEN(s)` / `Length`", "number of characters"],
      ["`POSITION(s, c)`", "index of first occurrence of a character (or −1)"],
      ["`SUBSTRING(start, end, s)`", "characters between two indices"],
      ["Concatenation `+`", "join two strings"],
      ["`CHAR_TO_CODE` / `CODE_TO_CHAR`", "character ↔ character code (ASCII/Unicode)"],
      ["`STRING_TO_INT`, `INT_TO_STRING`, `STRING_TO_REAL`, `REAL_TO_STRING`, `DATE_TO_STRING`…", "type conversions"]
    ]},
    { callout: { t: "tip", body: "The palindrome and Caesar-cipher tasks both earn a mark for **normalising** (converting to one case / stripping spaces) and a mark for the **character-code arithmetic** wrapping with MOD 26 — write both as separate, visible statements." }}
  ],
  flashcards: [
    ["How do you get the character code of 'A' and what is it in ASCII?", "CHAR_TO_CODE('A') → 65."],
    ["Write pseudo-code to reverse a string s.", "r ← \"\"; FOR i ← LEN(s) − 1 TO 0 STEP −1: r ← r + s[i]; ENDFOR"],
    ["Outline an algorithm to test whether a string is a palindrome.", "Normalise case (and strip non-letters), then compare character i with character LEN−1−i for i from 0 to LEN DIV 2 − 1; any mismatch → not a palindrome."],
    ["What does SUBSTRING(2, 4, \"computer\") return (inclusive indices from 0)?", "\"mpu\"."],
    ["What is concatenation?", "Joining two strings end to end, e.g. \"data\" + \"base\" → \"database\"."],
    ["Why does a Caesar shift use MOD 26?", "So a shift past 'Z' wraps back to 'A': code ← (code − 65 + shift) MOD 26 + 65."],
    ["What does POSITION(\"hello\", \"l\") return?", "2 — the index of the first occurrence."],
    ["Why convert a string to an integer before arithmetic?", "\"12\" + \"3\" concatenates to \"123\"; STRING_TO_INT gives numeric 12 + 3 = 15."]
  ],
  quiz: [
    { q: "`LEN(\"A level\")` returns:", opts: ["6", "7", "8", "5"], ans: 1, why: "The space counts: A, space, l, e, v, e, l = 7." },
    { q: "In ASCII, `CODE_TO_CHAR(CHAR_TO_CODE('a') − 32)` gives:", opts: ["'A'", "'b'", "'a'", "'@'"], ans: 0, why: "Lower-case codes are 32 above upper-case: 97 − 32 = 65 = 'A'." },
    { q: "Which pair of indices compares first and last characters of s (0-indexed)?", opts: ["s[0], s[LEN(s)]", "s[1], s[LEN(s)]", "s[0], s[LEN(s) − 1]", "s[0], s[0]"], ans: 2, why: "The last valid index is LEN − 1." },
    { q: "`\"7\" + \"3\"` in a language where + concatenates strings gives:", opts: ["10", "\"73\"", "\"10\"", "an error"], ans: 1, why: "Both operands are strings, so they are joined." },
    { q: "To shift 'Y' (code 89) by 3 in a Caesar cipher with wrap-around you compute:", opts: ["89 + 3", "(89 − 65 + 3) MOD 26 + 65", "89 MOD 3", "(89 + 3) MOD 26"], ans: 1, why: "Normalise to 0–25, add, wrap with MOD 26, restore the 'A' base → 'B'." },
    { q: "`SUBSTRING(0, 2, \"kurenai\")` (inclusive) returns:", opts: ["\"ku\"", "\"kur\"", "\"ure\"", "\"k\""], ans: 1, why: "Indices 0, 1 and 2 inclusive → k, u, r." }
  ],
  exam: [
    { level: "AS", src: "AS 2025 P1 Q3.1", ctx: "A word is a **palindrome** if it reads the same backwards as forwards, ignoring the case of the letters. `Level`, `noon` and `RaDar` are palindromes; `Levels` is not.",
      parts: [
        { q: "Write a program that inputs a word and outputs whether or not it is a palindrome.", marks: 8,
          ms: ["Word input and converted to a single case (1)", "Loop over the first half of the word (up to LEN DIV 2) (1)", "Compares character i with character LEN − 1 − i (1)", "Sets a flag / exits the loop when a mismatch is found (1)", "Correct output for both cases (1)", "Alternative accepted: builds the reversed string with a loop and compares (covers loop + comparison marks)", "Meaningful identifiers (1)", "Fully working with the test cases `Level` and `Levels` (1)", "Max 8"] },
        { q: "State the value of `LEN(\"RaDar\") DIV 2` and explain why looping up to this value is sufficient.", marks: 2, ms: ["2 (1)", "Each comparison checks a pair from both ends; once the middle is reached every character has been compared (1)"] }
      ] },
    { src: "AQA 2018 P1 Q2", q: "A subroutine takes a string and returns it with every letter shifted 3 places forward in the alphabet, so `XYZ` becomes `ABC`. Write pseudo-code for the subroutine.", marks: 5,
      ms: ["Loop through each character of the string (1)", "Converts the character to its code with CHAR_TO_CODE (1)", "Adds the shift and wraps using MOD 26 relative to the code of 'A' (1)", "Converts back with CODE_TO_CHAR and concatenates to the result (1)", "Returns the result string (1)"] },
    { level: "AS", src: "AS 2021 P1 Q2", q: "A program reads a string containing a number, e.g. `\"42\"`, and must add 8 to it. Explain why `input + 8` may not work and state the operation needed.", marks: 2,
      ms: ["The input is a string, so + would concatenate / cause a type error rather than add (1)", "Convert first with STRING_TO_INT (1)"] },
    { src: "AQA 2022 P1 Q1", q: "State the output of each expression. (i) `POSITION(\"binary\", \"n\")` (ii) `SUBSTRING(1, 3, \"binary\")` (iii) `LEN(\"\") + 1`", marks: 3,
      ms: ["(i) 2 (1)", "(ii) \"ina\" (1)", "(iii) 1 (1)"] }
  ]
});

X("compsci:4.1.1.8", {
  flashcards: [
    ["What does a random number generator in a program actually produce?", "Pseudo-random numbers — a deterministic sequence that appears random, produced by an algorithm from a seed."],
    ["Write pseudo-code to simulate one roll of a six-sided die.", "roll ← RANDOM_INT(1, 6)"],
    ["Why might a program set the seed to a fixed value during testing?", "To make the 'random' sequence reproducible so a bug can be recreated."],
    ["How would you simulate a 30% chance event?", "IF RANDOM_INT(1, 100) ≤ 30 THEN … (or RANDOM_REAL() < 0.3)."],
    ["What does 'uniform' mean for a random number generator?", "Every value in the range is equally likely."],
    ["Give two uses of random numbers in programs.", "Games and simulations, sampling/shuffling, generating test data, cryptographic keys (with a secure generator)."],
    ["How do you produce a random even number between 2 and 20?", "2 × RANDOM_INT(1, 10)."],
    ["Why is a simple pseudo-random generator unsuitable for cryptography?", "Its output is predictable if the algorithm and seed are known; a cryptographically secure generator is needed."]
  ],
  quiz: [
    { q: "`RANDOM_INT(1, 6)` returns a value in the range:", opts: ["0–5", "1–5", "1–6", "0–6"], ans: 2, why: "The pseudo-code convention is inclusive of both ends." },
    { q: "Why are computer random numbers called pseudo-random?", opts: ["They are stored in a file", "They come from a deterministic algorithm started from a seed", "They are always odd", "They cannot be repeated"], ans: 1, why: "Same seed → same sequence; only the appearance is random." },
    { q: "To choose one of 4 options with equal chance you use:", opts: ["RANDOM_INT(1, 4)", "RANDOM_INT(0, 4)", "RANDOM_INT(1, 3)", "4 × RANDOM_INT(0, 1)"], ans: 0, why: "Four values, each equally likely." },
    { q: "A simulation of two dice should generate:", opts: ["one number 2–12", "two independent numbers 1–6 and add them", "RANDOM_INT(1, 12)", "RANDOM_INT(2, 12) × 2"], ans: 1, why: "Adding two independent rolls reproduces the correct non-uniform distribution of totals." },
    { q: "Fixing the seed during testing gives:", opts: ["truly random output", "a reproducible sequence", "faster execution", "an error"], ans: 1, why: "Reproducibility is why seeds exist." },
    { q: "The probability that `RANDOM_INT(1, 100) ≤ 25` is:", opts: ["0.25", "0.24", "0.26", "0.5"], ans: 0, why: "25 of the 100 equally likely values satisfy it." }
  ],
  exam: [
    { level: "AS", src: "AS 2022 P1 Q3.1", ctx: "A game uses two six-sided dice. A player wins a round if the two dice show the same value (a double). A program simulates 1000 rounds and reports how many were won.",
      parts: [
        { q: "Write the program.", marks: 6, ms: ["Loop repeating 1000 times (1)", "Two independent random integers in the range 1 to 6 generated each iteration (1)", "Selection comparing the two values (1)", "Counter incremented when they are equal (1)", "Result output after the loop (1)", "Fully working with meaningful identifiers (1)"] },
        { q: "The programmer runs the program twice and gets 172 and 159. Explain why the results differ and state what result would be expected in the long run.", marks: 2, ms: ["Each run generates a different random sequence (different seed) (1)", "Expected ≈ 1000 × 1/6 ≈ 167 (1)"] }
      ] },
    { src: "AQA 2020 P2 Q4", q: "Explain why the numbers produced by a typical programming-language random function are described as pseudo-random.", marks: 2,
      ms: ["They are generated by a deterministic algorithm from a starting seed value (1)", "So the same seed produces the same sequence — they only appear random (1)"] },
    { level: "AS", src: "AS 2019 P1 Q4", q: "Write a pseudo-code statement that assigns to `chance` the value TRUE with probability 0.2 and FALSE otherwise.", marks: 2,
      ms: ["Random integer in a suitable range generated, e.g. RANDOM_INT(1, 5) (1)", "Compared so exactly one fifth of outcomes give TRUE: `chance ← RANDOM_INT(1, 5) = 1` (1)"] }
  ]
});

X("compsci:4.1.1.9", {
  flashcards: [
    ["What is an exception?", "An error or unexpected event that occurs during program execution and disrupts the normal flow, e.g. division by zero, file not found."],
    ["What is the purpose of a TRY…CATCH (exception handling) block?", "To run code that might raise an exception and, if one occurs, transfer control to handling code instead of crashing."],
    ["Name three common exceptions.", "Division by zero, array index out of range, file not found, invalid type conversion (e.g. STRING_TO_INT(\"abc\"))."],
    ["Why is exception handling preferable to checking every possible error in advance?", "Some errors (hardware/file/network) cannot be predicted; the handler keeps the program running and can report or recover gracefully."],
    ["What happens to an unhandled exception?", "It propagates up the call stack; if nothing catches it the program terminates with an error message."],
    ["What is a FINALLY block for?", "Code that must run whether or not an exception occurred, e.g. closing a file."],
    ["Should exceptions be used for normal control flow?", "No — they are for exceptional conditions; using them for routine decisions is slow and obscures logic."],
    ["Give an example of graceful recovery from an exception.", "Catching an invalid input conversion and asking the user to enter the value again."]
  ],
  quiz: [
    { q: "Which is an exception rather than a syntax error?", opts: ["A missing ENDIF", "Attempting to open a file that does not exist", "Misspelling a keyword", "A missing bracket"], ans: 1, why: "Exceptions occur at run time; the others are detected before execution." },
    { q: "Code that runs only when an exception is raised is placed in the:", opts: ["TRY block", "CATCH/EXCEPT block", "FINALLY block", "main program"], ans: 1, why: "TRY encloses risky code; CATCH handles the exception." },
    { q: "A FINALLY block executes:", opts: ["only on error", "only on success", "always", "never"], ans: 2, why: "It is the place for clean-up such as closing files." },
    { q: "`STRING_TO_INT(\"twelve\")` would most likely raise:", opts: ["a syntax error", "a type-conversion exception", "a logic error", "nothing"], ans: 1, why: "The string is not a valid integer, so the conversion fails at run time." },
    { q: "Without a handler, an exception causes the program to:", opts: ["continue silently", "terminate with an error", "retry", "recompile"], ans: 1, why: "An unhandled exception crashes the program." },
    { q: "Best use of exception handling in a data-entry loop:", opts: ["Catch conversion errors and re-prompt", "Ignore invalid input", "Terminate on the first error", "Convert everything to strings"], ans: 0, why: "Graceful recovery keeps the program usable." }
  ],
  exam: [
    { level: "AS", src: "AS 2023 P1 Q2", q: "A program asks the user to enter their age and converts the input to an integer. Explain how exception handling could be used to deal with a user typing `eighteen`.", marks: 3,
      ms: ["Place the conversion inside a TRY block (1)", "The failed conversion raises an exception which transfers control to the CATCH block (1)", "The handler outputs an error message and asks for the input again rather than the program crashing (1)"] },
    { src: "AQA 2021 P1 Q4", q: "Describe two advantages of using exception handling rather than testing for every possible error condition with selection statements.", marks: 2,
      ms: ["Some run-time errors (hardware failure, file missing, network loss) cannot be predicted or tested for in advance (1)", "Separates error-handling code from the main logic, making the program easier to read / one handler can cover a whole block (1)", "Prevents the program terminating abnormally / allows recovery (1)", "Max 2"] },
    { src: "AQA 2024 P2 Q3", q: "A subroutine opens a file, reads it and closes it. State where the close operation should be placed so that it runs even if reading the file raises an exception, and explain why this matters.", marks: 2,
      ms: ["In a FINALLY block (after the TRY/CATCH) (1)", "Otherwise the file remains open / locked when an exception skips the close statement (1)"] },
    { level: "AS", src: "AS 2017 P1 Q2", q: "Give two examples of situations that would raise an exception at run time.", marks: 2,
      ms: ["Division by zero (1)", "Array index out of bounds / file not found / invalid type conversion / running out of memory (1 each, max 2)"] }
  ]
});

X("compsci:4.1.1.10", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "\"Advantages of subroutines\" — A-level 2024, AS 2025" },
    "A 3-mark question. The examiners insist that each advantage is **different** and is accompanied by a **how** — \"easier to test\" scores nothing on its own; \"easier to test **because each subroutine can be tested separately**\" scores.",
    { ul: [
      "Easier to **test/debug** — each subroutine can be tested independently / errors are easier to locate",
      "Easier to **understand** — the program has an overview structure; sensible subroutine names describe the tasks",
      "Code can be **reused** — called as often as needed without rewriting; reused in other programs",
      "Enables **team working** — subroutines can be implemented independently by different programmers",
      "Easier to **maintain/update** — a change is made in one place",
      "**Reduces side-effects** — local variables mean state is not shared",
      "Allows **recursive** techniques — a subroutine can call itself"
    ]},
    { callout: { t: "def", h: "Subroutine (AS 2025)", body: "\"A **named**, **callable** (out-of-line) block of code that can be executed by writing its name in a program statement.\" One mark; both *named* and *callable/out-of-line* were needed." }}
  ],
  flashcards: [
    ["Define the term subroutine.", "A named, out-of-line block of code that performs a task and can be called by name from elsewhere in the program."],
    ["Difference between a procedure and a function?", "A function returns a value and is used in an expression; a procedure does not return a value and is called as a statement."],
    ["Give three advantages of using subroutines, each with a reason.", "Easier to test (each tested separately); easier to understand (named tasks); reuse (called as often as needed without rewriting); team work (implemented independently); easier maintenance (one change in one place)."],
    ["What is meant by 'out-of-line'?", "The subroutine's code is stored once, separately from where it is called; control jumps to it and returns afterwards."],
    ["What is a built-in (library) subroutine?", "One provided by the language or a library, e.g. LEN, ROUND, RANDOM_INT."],
    ["What is the interface of a subroutine?", "Its name, the parameters it expects (with types) and the value it returns."],
    ["Why does using subroutines reduce errors?", "Code reuse means a tested subroutine is used again rather than rewritten; less duplicated code, fewer places for errors."],
    ["What must happen after a subroutine finishes?", "Control returns to the statement after the call (using the return address stored on the stack)."]
  ],
  quiz: [
    { q: "A subroutine that returns a value and is used inside an expression is a:", opts: ["procedure", "function", "parameter", "module"], ans: 1, why: "Functions return; procedures act." },
    { q: "Which is NOT an accepted advantage of subroutines?", opts: ["Easier to test independently", "Programs always run faster", "Enables team working", "Code can be reused"], ans: 1, why: "Speed is not a benefit — calls add small overhead." },
    { q: "'Easier to debug' earns a mark only if you add:", opts: ["a code example", "how — each subroutine can be tested separately", "the language used", "nothing extra"], ans: 1, why: "Examiners require the explanation of how the advantage arises." },
    { q: "`LEN(word)` is an example of a:", opts: ["user-defined procedure", "built-in function", "local variable", "recursive call"], ans: 1, why: "Provided by the language and returns a value." },
    { q: "After a subroutine finishes, execution continues:", opts: ["at the start of the program", "at the statement after the call", "at the next subroutine", "nowhere — the program ends"], ans: 1, why: "The return address saved at the call is used." },
    { q: "Which makes a subroutine self-contained?", opts: ["Using global variables", "Using local variables and parameters", "Making it very long", "Calling it only once"], ans: 1, why: "All data enters via parameters and lives in locals; nothing outside is touched." }
  ],
  exam: [
    { src: "AQA 2024 P1 Q1", q: "A programmer structures a large program as a set of subroutines. Explain three advantages of doing this.", marks: 3,
      ms: ["Easier to test/debug because each subroutine can be tested separately (1)", "Easier to understand because the program is an overview of named tasks (1)", "Code can be reused / called repeatedly without rewriting (1)", "Team members can implement subroutines independently (1)", "Easier to maintain because a change is made in one place (1)", "Each advantage must be different and include how it is achieved. Max 3"] },
    { level: "AS", src: "AS 2025 P1 Q4.1", q: "Define the term *subroutine*.", marks: 1,
      ms: ["A named / callable (out-of-line) block of code that can be executed by writing its name in a program statement (1)"] },
    { src: "AQA 2019 P1 Q1", q: "State the difference between a function and a procedure, and give one example of each from a typical language's built-in subroutines.", marks: 2,
      ms: ["A function returns a value (used in an expression); a procedure does not (called as a statement) (1)", "Function e.g. LEN / ROUND; procedure e.g. OUTPUT / PRINT (1)"] }
  ]
});

X("compsci:4.1.1.11", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "\"How do parameters improve a subroutine?\" (AS 2025)" },
    { ul: [
      "Avoids the use of global variables — the subroutine is **self-contained / encapsulated**",
      "The subroutine can be used with **different values / expressions / variables** each call",
      "Easier to **reuse in a different program** and to **test independently**",
      "Makes it **clear which values from outside** are used inside, because they are explicitly listed"
    ]},
    { callout: { t: "memorise", h: "By value vs by reference", body: "**By value**: a copy of the data is passed; changes inside the subroutine do not affect the caller's variable. **By reference**: the address is passed; the subroutine works on the caller's variable so changes persist. Arrays are passed by reference in most languages." }}
  ],
  flashcards: [
    ["What is a parameter?", "A variable in the subroutine's declaration that receives a value (the argument) when the subroutine is called."],
    ["Difference between parameter and argument?", "The parameter is the name in the definition; the argument is the actual value/expression supplied in the call."],
    ["What does passing by value mean?", "A copy of the argument is passed; changes inside the subroutine do not affect the original."],
    ["What does passing by reference mean?", "The address of the argument is passed; the subroutine operates on the caller's variable, so changes persist."],
    ["Why do parameters make a subroutine easier to reuse?", "It depends only on what is passed in, not on global state, so it can be called with different values and moved to another program."],
    ["When would you pass by reference deliberately?", "When the subroutine must modify the caller's variable (e.g. swap two values) or to avoid copying a large structure."],
    ["What happens if a subroutine expects two parameters and is called with one?", "A compile-time (or run-time) error — the interface must be matched."],
    ["Give one advantage of listing parameters explicitly.", "It is clear which outside values the subroutine uses — better documentation and fewer hidden dependencies."]
  ],
  quiz: [
    { q: "In `Area(length, width)` called as `Area(5, 3)`, the values 5 and 3 are:", opts: ["parameters", "arguments", "locals", "globals"], ans: 1, why: "Actual values supplied at the call are arguments; length and width are the parameters." },
    { q: "A subroutine doubles its integer parameter. Passed by value, the caller's variable afterwards is:", opts: ["doubled", "unchanged", "zero", "undefined"], ans: 1, why: "By value passes a copy." },
    { q: "To write a `Swap(a, b)` procedure that swaps the caller's variables you need:", opts: ["passing by value", "passing by reference", "a return value of a", "global variables"], ans: 1, why: "The subroutine must alter the caller's storage." },
    { q: "Which is an accepted reason parameters improve subroutines?", opts: ["They make the subroutine run faster", "They avoid global variables, making it self-contained", "They increase memory use", "They allow only one call"], ans: 1, why: "Encapsulation via parameters is the mark-scheme point." },
    { q: "Passing a large array by reference rather than by value:", opts: ["copies the array", "avoids copying, passing its address", "prevents modification", "is impossible"], ans: 1, why: "Only the address travels; the subroutine works on the original." },
    { q: "A parameter's scope is:", opts: ["global", "the subroutine in which it is declared", "the calling program", "the whole file"], ans: 1, why: "Parameters behave as locals of the subroutine." }
  ],
  exam: [
    { level: "AS", src: "AS 2025 P1 Q4.3", q: "A subroutine that calculates delivery cost currently reads the parcel weight from a global variable. Explain two ways in which passing the weight as a parameter instead would improve the subroutine.", marks: 2,
      ms: ["Avoids a global variable, so the subroutine is self-contained / encapsulated (1)", "Can be called with different weights / values / expressions (1)", "Easier to reuse in another program or to test independently (1)", "Makes it explicit which outside values are used (1)", "Max 2"] },
    { src: "AQA 2022 P1 Q2", q: "Explain the difference between passing a parameter by value and by reference, and state which should be used for a procedure that must sort an array in place.", marks: 3,
      ms: ["By value: a copy is passed, so changes in the subroutine do not affect the caller's variable (1)", "By reference: the address is passed, so the subroutine changes the caller's variable (1)", "By reference — the array itself must be reordered (1)"] },
    { src: "AQA 2017 P1 Q3", ctx: "A procedure is declared as `PROCEDURE Increase(n)` with body `n ← n + 10; OUTPUT n`. The main program contains `x ← 5; Increase(x); OUTPUT x`.",
      parts: [
        { q: "State the two values output if `n` is passed by value.", marks: 1, ms: ["15 then 5 (1)"] },
        { q: "State the two values output if `n` is passed by reference.", marks: 1, ms: ["15 then 15 (1)"] },
        { q: "Identify the parameter and the argument in this program.", marks: 1, ms: ["Parameter `n`; argument `x` (1)"] }
      ] }
  ]
});

X("compsci:4.1.1.12", {
  flashcards: [
    ["How does a function hand a value back to the caller?", "With a RETURN statement; the value replaces the function call in the calling expression."],
    ["Can a subroutine return more than one value?", "Yes — return a record/array/tuple, or use by-reference parameters, or (less cleanly) globals."],
    ["What happens to statements after RETURN in a function?", "They never execute — RETURN exits the function immediately."],
    ["Why should every path through a function return a value?", "Otherwise some inputs produce no result / an undefined value, causing a run-time error or a bug."],
    ["What is the type of a function?", "The data type of the value it returns, e.g. an Integer function."],
    ["Write a function that returns TRUE if n is even.", "FUNCTION IsEven(n): RETURN n MOD 2 = 0"],
    ["How is a function call used?", "In an expression, e.g. `total ← total + Square(x)` — a procedure call cannot appear there."],
    ["What does a Boolean-returning function often represent?", "A test or validation, e.g. IsValid(input)."]
  ],
  quiz: [
    { q: "`FUNCTION Max(a, b)`: `IF a > b THEN RETURN a ENDIF`. What is wrong?", opts: ["Nothing", "No value is returned when a ≤ b", "RETURN cannot be inside IF", "It returns b twice"], ans: 1, why: "The a ≤ b path falls off the end without a RETURN." },
    { q: "A function call may appear:", opts: ["only as a statement", "anywhere an expression of its return type is allowed", "only in the main program", "only once"], ans: 1, why: "The call evaluates to its returned value." },
    { q: "To return both a quotient and a remainder from one function you could:", opts: ["use two RETURN statements in sequence", "return a record containing both", "return the quotient and print the remainder", "use a FOR loop"], ans: 1, why: "A single composite value carries both; the second RETURN would never run." },
    { q: "A function declared to return an Integer contains `RETURN \"done\"`. This is:", opts: ["fine", "a type error", "a run-time exception only", "a logic error"], ans: 1, why: "The returned value must match the function's declared type." },
    { q: "Which statement ends a function and supplies its value?", opts: ["END", "OUTPUT", "RETURN", "EXIT"], ans: 2, why: "RETURN both exits and delivers the value." },
    { q: "`OUTPUT Square(4) + Square(3)` where Square returns n×n prints:", opts: ["7", "25", "49", "16 9"], ans: 1, why: "16 + 9 = 25 — each call is evaluated then added." }
  ],
  exam: [
    { src: "AQA 2023 P1 Q3", q: "A function `Grade(mark)` should return `\"Pass\"` for marks of 40 or more and `\"Fail\"` otherwise. A student writes it with a single `IF mark ≥ 40 THEN RETURN \"Pass\" ENDIF`. Explain the error and write a corrected version.", marks: 3,
      ms: ["When mark < 40 no RETURN executes, so the function returns no / an undefined value (1)", "Add the ELSE branch (or a RETURN after the IF): `IF mark ≥ 40 THEN RETURN \"Pass\" ELSE RETURN \"Fail\" ENDIF` (1)", "Every path now returns a String value (1)"] },
    { level: "AS", src: "AS 2020 P1 Q2", q: "Explain the difference between how a function and a procedure are called, giving an example statement for each.", marks: 2,
      ms: ["A function call appears within an expression because it returns a value, e.g. `y ← Square(x) + 1` (1)", "A procedure call is a statement on its own, e.g. `DisplayMenu()` (1)"] },
    { src: "AQA 2018 P2 Q2", q: "A subroutine must give the caller both the largest and smallest values in an array. Describe two different ways this could be achieved.", marks: 2,
      ms: ["Return a composite value (record / array / tuple) containing both (1)", "Use two by-reference parameters that the subroutine sets (1)", "Accept: two separate functions Max and Min (1)", "Max 2"] }
  ]
});

X("compsci:4.1.1.13", {
  flashcards: [
    ["What is a local variable?", "A variable declared inside a subroutine, accessible only within it, existing only while the subroutine runs."],
    ["Where are local variables stored during a call?", "In the subroutine's stack frame on the call stack."],
    ["Why can two subroutines use the same local variable name?", "Each name is in its own scope; they are different variables in different stack frames."],
    ["Does a local variable keep its value between calls?", "No — a new one is created each call and destroyed on return."],
    ["Why do locals aid modularisation?", "The subroutine depends on nothing outside itself except its parameters, so it can be moved or reused."],
    ["What is variable shadowing?", "A local with the same name as a global hides the global inside the subroutine."],
    ["Name a memory advantage of local variables.", "Memory is allocated only while the subroutine executes and is reused afterwards."],
    ["In recursion, how many copies of a local variable exist?", "One per active call — each stack frame has its own."]
  ],
  quiz: [
    { q: "A local variable's lifetime is:", opts: ["the whole program run", "the execution of its subroutine", "until the next call", "one statement"], ans: 1, why: "Created on call, destroyed on return." },
    { q: "Locals for a subroutine call are stored in:", opts: ["the heap", "its stack frame", "a global table", "secondary storage"], ans: 1, why: "Each call pushes a frame holding locals, parameters and the return address." },
    { q: "Two subroutines each declare a local `i`. Calling both:", opts: ["causes a clash", "uses two separate variables", "shares one i", "is a syntax error"], ans: 1, why: "Separate scopes, separate storage." },
    { q: "A recursive function with a local `temp`, called to depth 4, has how many `temp` variables alive?", opts: ["1", "2", "4", "0"], ans: 2, why: "One per stack frame." },
    { q: "Which is NOT true of local variables?", opts: ["Accessible only in their block", "Exist only during the call", "Prevent side-effects", "Retain their value between calls"], ans: 3, why: "Retention would need a global or static variable." },
    { q: "Using locals rather than globals in a subroutine makes it:", opts: ["slower", "self-contained and reusable", "unable to return values", "recursive"], ans: 1, why: "The accepted mark-scheme phrasing." }
  ],
  exam: [
    { level: "AS", src: "AS 2023 P1 Q3", q: "A subroutine declares a variable `count` locally. State two features of this variable that distinguish it from a global variable with the same name.", marks: 2,
      ms: ["It can only be accessed / used inside the subroutine in which it is declared (1)", "It exists / uses memory only while the subroutine is executing (1)", "Accept: it is stored in the subroutine's stack frame (1)", "Max 2"] },
    { src: "AQA 2021 P1 Q2.6", q: "State two items, other than local variables, that are stored in a stack frame when a subroutine is called.", marks: 2,
      ms: ["Return address (1)", "Parameters (1)", "Register values (1)", "Max 2"] },
    { src: "AQA 2020 P1 Q2", q: "A recursive function declares a local variable `half`. Explain what happens to `half` as the function calls itself three times and then returns.", marks: 3,
      ms: ["Each call creates its own `half` in a new stack frame — three separate copies exist at the deepest point (1)", "Each copy holds the value for its own call and is not affected by the others (1)", "As each call returns its frame is popped and that copy of `half` is destroyed (1)"] }
  ]
});

X("compsci:4.1.1.14", {
  flashcards: [
    ["What is a global variable?", "A variable declared in the main program block (outside all subroutines) that can be accessed from anywhere in the program."],
    ["Give one problem caused by global variables.", "Unintended side-effects: any subroutine can change it, so bugs are hard to trace; subroutines become dependent on outside state."],
    ["When might a global be acceptable?", "For a value genuinely used throughout the program, e.g. a configuration setting — though a constant is often better."],
    ["How does a global's lifetime differ from a local's?", "A global exists for the whole program run; a local only while its subroutine executes."],
    ["Why do globals make testing harder?", "A subroutine's behaviour depends on the global's current value, so it cannot be tested in isolation."],
    ["What is the alternative to using a global to share data with a subroutine?", "Pass it as a parameter (and return results with RETURN)."],
    ["Can a subroutine modify a global?", "Yes — which is exactly the side-effect risk."],
    ["Why do globals hinder reuse?", "The subroutine relies on a variable that may not exist in another program."]
  ],
  quiz: [
    { q: "A global variable is declared:", opts: ["inside a subroutine", "in the main program block / outside subroutines", "in a stack frame", "in a parameter list"], ans: 1, why: "That placement is what makes its scope program-wide." },
    { q: "The main risk of globals is:", opts: ["they use more CPU", "unintended side-effects from any subroutine", "they cannot hold strings", "they are read-only"], ans: 1, why: "Any code can change them." },
    { q: "Instead of a global, data should usually be given to a subroutine via:", opts: ["a file", "a parameter", "a comment", "a constant"], ans: 1, why: "Parameters keep the subroutine self-contained." },
    { q: "A global exists:", opts: ["only during a call", "for the whole run of the program", "until first assigned", "only in the main block"], ans: 1, why: "Lifetime = program lifetime." },
    { q: "Testing a subroutine that reads a global is harder because:", opts: ["the global is private", "its behaviour depends on outside state", "globals cannot be printed", "it cannot be called"], ans: 1, why: "Isolation is lost." },
    { q: "Which is a legitimate use of a global?", opts: ["A loop counter in one subroutine", "A program-wide configuration value", "A temporary swap variable", "A function's return value"], ans: 1, why: "Genuinely program-wide data is the exception." }
  ],
  exam: [
    { level: "AS", src: "AS 2019 P1 Q1", q: "A program uses a global variable `Total` that is updated by several subroutines. Explain one problem this design could cause and describe how the program could be restructured to avoid it.", marks: 3,
      ms: ["Any subroutine can change `Total`, so an unexpected change (side-effect) in one place affects the others / is hard to trace (1)", "Pass the current total to each subroutine as a parameter (1)", "Return the updated value from the subroutine (1)"] },
    { src: "AQA 2016 P1 Q2", q: "State two disadvantages of using global variables in a program made of many subroutines.", marks: 2,
      ms: ["Subroutines are no longer self-contained, so harder to reuse / test independently (1)", "Risk of unintended side-effects when a subroutine changes the value (1)", "Occupies memory for the whole run (1)", "Names cannot be reused elsewhere (1)", "Max 2"] }
  ]
});

X("compsci:4.1.1.15", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "The stack-frame question (A-level 2018, 2021)" },
    "\"State two items stored in a stack frame\" is worth 2 and the accepted list is fixed: **return address**, **parameters**, **local variables**, **register values** (an example register such as the accumulator is accepted). Longer questions ask you to explain *why* the stack is the right structure — LIFO matches the nesting of calls: the most recently called subroutine is the first to finish.",
    { callout: { t: "tip", body: "When a trace asks for the *state of the stack* after nested calls, draw one frame per **active** call, most recent on top, and label the return address as \"the statement after the call in the caller\" — not a line number you have invented." }}
  ],
  flashcards: [
    ["What is a stack frame?", "The block of data pushed onto the call stack for one subroutine call: return address, parameters, local variables and saved register values."],
    ["Why is a stack (LIFO) the right structure for subroutine calls?", "The most recently called subroutine is always the first to finish, so its frame is on top when it returns."],
    ["What is the return address?", "The address of the instruction to execute after the subroutine finishes — the one following the call."],
    ["What happens to the stack when a subroutine returns?", "Its frame is popped; execution continues at the return address with the caller's frame now on top."],
    ["What causes stack overflow?", "Too many nested (often recursive) calls push more frames than the stack can hold."],
    ["What is the stack pointer?", "A register holding the address of the top of the stack."],
    ["Which register value must be saved so the caller can resume?", "The program counter (as the return address), and typically the accumulator/other working registers."],
    ["Where do a subroutine's parameters live during its execution?", "In its stack frame (or in registers for the first few, depending on the calling convention)."]
  ],
  quiz: [
    { q: "Which is NOT normally stored in a stack frame?", opts: ["Return address", "Local variables", "The program's source code", "Parameters"], ans: 2, why: "Code lives in the program area; the frame holds per-call data." },
    { q: "Subroutine A calls B, which calls C. Which frame is on top?", opts: ["A", "B", "C", "main"], ans: 2, why: "The most recent call is on top." },
    { q: "When C returns, the return address used is:", opts: ["the start of A", "the statement after the call to C in B", "the start of main", "the top of C"], ans: 1, why: "Control resumes in the caller, just after the call." },
    { q: "Infinite recursion eventually causes:", opts: ["heap exhaustion", "stack overflow", "an integer overflow", "a syntax error"], ans: 1, why: "Frames keep being pushed until the stack is full." },
    { q: "The stack is suitable for calls because it is:", opts: ["FIFO", "LIFO", "random access", "sorted"], ans: 1, why: "Last-called, first-returned." },
    { q: "Saving register values in the frame ensures:", opts: ["faster calls", "the caller's working values are restored on return", "recursion is impossible", "parameters are copied"], ans: 1, why: "The callee may reuse the registers; the saved copies restore the caller's state." }
  ],
  exam: [
    { src: "AQA 2021 P1 Q2.6", q: "State two items of information that are stored in a stack frame.", marks: 2,
      ms: ["Return address (1)", "Parameters (1)", "Local variables (1)", "Register values (accept an example such as the accumulator) (1)", "Max 2"] },
    { src: "AQA 2018 P1 Q2", q: "Explain how the call stack is used when subroutine `Main` calls `Print`, which in turn calls `Format`, and how execution correctly resumes in `Main` afterwards.", marks: 4,
      ms: ["When `Print` is called a stack frame containing its return address (the instruction after the call in Main), parameters and locals is pushed (1)", "Calling `Format` pushes a second frame on top (1)", "When `Format` returns its frame is popped and the return address in it is loaded into the program counter, resuming in `Print` (1)", "When `Print` returns its frame is popped in the same way and execution resumes at the statement after the call in `Main` — LIFO order matches the nesting of the calls (1)"] },
    { src: "AQA 2023 P2 Q6", q: "A recursive subroutine has no base case. Explain, with reference to the call stack, what happens when it is executed.", marks: 2,
      ms: ["Every call pushes another stack frame and none is ever popped because no call returns (1)", "The stack runs out of space — stack overflow — and the program crashes (1)"] }
  ]
});

X("compsci:4.1.1.16", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "Recursion in the papers" },
    "\"What is a recursive subroutine?\" (2017, 2021, 2022 — one mark: **a subroutine that calls itself**) and \"what is a base case?\" (2021 — **the circumstance in which the recursive subroutine does not call itself**) are the AO1 items. The AO2 items are **traces**: a table of *call → argument → value returned* for a list function (2023), a *Visited* array trace for a recursive graph routine (2022), or the output of a recursive tree search (2017). The 2025 paper asked why **naive recursive Fibonacci is inefficient**: the same sub-problems are recomputed many times / the number of calls grows exponentially.",
    { callout: { t: "tip", h: "Trace-table discipline", body: "Write the calls **in the order they are made**, deepest last; then fill the *value returned* column **bottom-up** — the deepest call returns first. Examiners award a mark for the argument column being right and a separate mark for the returned values, so a half-finished table still scores." }}
  ],
  flashcards: [
    ["What is a recursive subroutine?", "A subroutine that calls itself."],
    ["What is a base case?", "The condition under which a recursive subroutine does not call itself, so the recursion terminates."],
    ["What is the general (recursive) case?", "The branch in which the subroutine calls itself with a smaller / simpler argument that moves towards the base case."],
    ["Why must each recursive call move towards the base case?", "Otherwise the recursion never terminates and the stack overflows."],
    ["Why is naive recursive Fibonacci inefficient?", "It recomputes the same sub-problems many times; the number of calls grows exponentially with n."],
    ["Give three problems naturally solved recursively.", "Tree traversal, factorial/Fibonacci, binary search, depth-first search, merge sort, Tower of Hanoi."],
    ["What is the space cost of recursion depth d?", "d stack frames must exist at once — O(d) memory."],
    ["What does `Sum([]) = 0; Sum(h:t) = h + Sum(t)` compute?", "The sum of a list, recursing on the tail until the empty list."]
  ],
  quiz: [
    { q: "The base case of `Fact(n) = n × Fact(n − 1)` is:", opts: ["n = 1 returns 1", "n = 10", "n × 1", "there is none"], ans: 0, why: "Fact(1) (or Fact(0)) = 1 stops the recursion." },
    { q: "`F(5)` where `F(n) = n + F(n − 2)` with `F(n) = 0` for n ≤ 0 returns:", opts: ["9", "6", "5", "15"], ans: 0, why: "F(5) = 5 + F(3) = 5 + 3 + F(1) = 5 + 3 + 1 + F(−1) = 9." },
    { q: "A recursive routine without a base case will:", opts: ["return 0", "loop forever until stack overflow", "raise a syntax error", "return immediately"], ans: 1, why: "Frames accumulate with no return." },
    { q: "Naive recursive Fibonacci is slow because:", opts: ["recursion is always slow", "the same values are recomputed many times", "it uses a queue", "it cannot use integers"], ans: 1, why: "Fib(n−2) is computed inside both Fib(n−1) and Fib(n) — exponential calls." },
    { q: "How many calls does `Sum([4, 2, 5, 3])` make, counting the initial call, with base case the empty list?", opts: ["4", "5", "3", "6"], ans: 1, why: "Arguments [4,2,5,3], [2,5,3], [5,3], [3], [] — five calls." },
    { q: "Which structure is naturally processed by recursion?", opts: ["A stack", "A tree", "A queue", "A constant"], ans: 1, why: "Each subtree is a smaller instance of the same problem." }
  ],
  exam: [
    { src: "AQA 2023 P2 Q12.1", ctx: "The function below is written in a functional style: `Total([]) = 0` and `Total(x:xs) = x + Total(xs)`, where `x:xs` splits a list into its head `x` and tail `xs`.",
      parts: [
        { q: "Complete a trace table showing, for the call `Total([6, 1, 4])`, each call in order, its argument and the value it returns.", marks: 3,
          ms: ["Argument column: [6, 1, 4], [1, 4], [4], [] in order (1)", "Bottom row: argument [] returns 0 (1)", "Returned values 11, 5, 4, 0 in order (1)"] },
        { q: "State the base case of `Total`.", marks: 1, ms: ["The empty list [] (returns 0) (1)"] },
        { q: "Explain why `Total` is described as recursive.", marks: 1, ms: ["It calls itself (with the tail of the list as argument) (1)"] }
      ] },
    { src: "AQA 2021 P1 Q2.4", q: "Explain what is meant by a recursive subroutine and by a base case.", marks: 2,
      ms: ["A recursive subroutine is one that calls itself (1)", "A base case is the circumstance in which the recursive subroutine does not call itself (1)"] },
    { src: "AQA 2025 P2 Q11.3", q: "A programmer implements the Fibonacci sequence with `Fib(n) = Fib(n − 1) + Fib(n − 2)` and base cases `Fib(0) = 0`, `Fib(1) = 1`. Explain why this implementation is inefficient for large `n`.", marks: 2,
      ms: ["The same sub-problems (e.g. Fib(n − 2)) are calculated many times over (1)", "So the number of calls / time grows exponentially with n (1)"] },
    { src: "AQA 2022 P1 Q4.5", ctx: "A recursive procedure `Visit(node)` marks `Seen[node]` as TRUE, then for each neighbour `m` of `node` that is not yet seen, calls `Visit(m)`. The graph has edges 0–1, 1–3, 0–2 and neighbours are considered in ascending order.",
      parts: [
        { q: "List the sequence of calls made by `Visit(0)`.", marks: 2, ms: ["Visit(0), Visit(1), Visit(3) (1)", "then Visit(2) after returning to Visit(0) — no call repeated (1)"] },
        { q: "State the contents of `Seen` when the procedure completes and the base case of the recursion.", marks: 2, ms: ["Seen = [TRUE, TRUE, TRUE, TRUE] (1)", "Base case: a node with no unseen neighbours (the loop makes no call) (1)"] }
      ] }
  ]
});

X("compsci:4.1.2.1", {
  flashcards: [
    ["What is a programming paradigm?", "A style or approach to programming — the way a program is structured and its computation expressed, e.g. procedural, object-oriented, functional, declarative."],
    ["Name the four paradigms the specification lists.", "Procedural (imperative), object-oriented, functional and (as context) declarative/logic."],
    ["How does a procedural program express computation?", "As a sequence of instructions that change state, organised into subroutines."],
    ["How does a functional program express computation?", "As the evaluation of functions without side-effects; no mutable state, functions are first-class."],
    ["What distinguishes object-oriented programming?", "Data and the operations on it are bundled into objects; classes, inheritance, encapsulation and polymorphism."],
    ["What is a declarative language?", "One where you state what result is wanted, not how to compute it — e.g. SQL, Prolog."],
    ["Why might one language support several paradigms?", "Modern languages (C#, Python) mix procedural, OO and functional features; the paradigm is how you use it."],
    ["Which paradigm is best suited to modelling a system of interacting real-world entities?", "Object-oriented — objects map naturally onto the entities."]
  ],
  quiz: [
    { q: "SQL is best described as:", opts: ["procedural", "object-oriented", "declarative", "functional"], ans: 2, why: "You say what data you want, not how to retrieve it." },
    { q: "A program built from sequences of statements that change variables is:", opts: ["procedural", "declarative", "functional", "logic"], ans: 0, why: "Imperative/procedural: step-by-step state change." },
    { q: "Which feature belongs to the functional paradigm?", opts: ["Mutable global state", "Functions as first-class objects", "Class inheritance", "GOTO statements"], ans: 1, why: "Functions can be passed and returned like values." },
    { q: "Encapsulation and inheritance are features of:", opts: ["procedural programming", "object-oriented programming", "functional programming", "assembly"], ans: 1, why: "Core OOP concepts." },
    { q: "A paradigm is:", opts: ["a specific language", "an approach to structuring programs", "a compiler", "a data type"], ans: 1, why: "Languages implement paradigms; they are not the same thing." },
    { q: "Which pairing is correct?", opts: ["Haskell — functional", "Prolog — object-oriented", "C — declarative", "SQL — procedural"], ans: 0, why: "Haskell is the archetypal functional language." }
  ],
  exam: [
    { src: "AQA 2019 P2 Q5", q: "Describe the difference between the procedural and object-oriented programming paradigms.", marks: 2,
      ms: ["Procedural: the program is a list of instructions organised into subroutines that operate on separate data (1)", "Object-oriented: data and the subroutines (methods) that act on it are combined into objects / defined by classes (1)"] },
    { src: "AQA 2022 P2 Q11", q: "State two characteristics of the functional programming paradigm that distinguish it from the procedural paradigm.", marks: 2,
      ms: ["Functions have no side-effects / there is no mutable state — a function's result depends only on its arguments (1)", "Functions are first-class objects — they can be passed as arguments and returned (1)", "Computation is expressed as evaluation of functions / function composition rather than sequences of state changes (1)", "Max 2"] },
    { src: "AQA 2017 P2 Q4", q: "Explain why a language such as SQL is described as declarative rather than procedural.", marks: 2,
      ms: ["The programmer states what result is required (1)", "Not the sequence of steps by which it is obtained — the system decides how (1)"] }
  ]
});

X("compsci:4.1.2.2", {
  flashcards: [
    ["What is structured programming?", "A procedural style using only sequence, selection and iteration, with subroutines and no unstructured jumps (GOTO)."],
    ["What is a hierarchy chart?", "A diagram showing a program decomposed into modules/subroutines, top-down, with each level calling the ones below."],
    ["Give two benefits of the structured approach.", "Easier to read and debug (block structure, one entry/exit per block); easier to test modules separately; easier to maintain and reuse."],
    ["What does 'top-down design' mean?", "Start from the whole problem and repeatedly break it into smaller sub-tasks until each is simple enough to code."],
    ["Why is GOTO avoided?", "It produces 'spaghetti' control flow that is hard to follow and test."],
    ["What is stepwise refinement?", "Successively adding detail to a high-level outline until it is executable code."],
    ["How do procedures relate to the procedural paradigm?", "They are the unit of decomposition — the program is a set of procedures that call one another."],
    ["What is meant by 'one entry, one exit'?", "Each block of structured code has a single point where it is entered and one where it is left, aiding reasoning."]
  ],
  quiz: [
    { q: "Structured programming uses which three control structures?", opts: ["sequence, selection, iteration", "GOTO, jump, branch", "class, object, method", "map, filter, reduce"], ans: 0, why: "The three combining principles." },
    { q: "A hierarchy chart shows:", opts: ["the order statements execute", "modules and which calls which, top-down", "the data types used", "the memory map"], ans: 1, why: "It is a decomposition diagram." },
    { q: "Top-down design begins with:", opts: ["writing the smallest routine", "the overall problem, broken into sub-tasks", "the test plan", "the user interface"], ans: 1, why: "Whole → parts." },
    { q: "Which is a benefit of structured programming?", opts: ["Faster CPU", "Easier testing of independent modules", "No need for variables", "Removes all bugs"], ans: 1, why: "Modularity aids testing and maintenance." },
    { q: "Stepwise refinement means:", opts: ["deleting code until it works", "adding detail to an outline level by level", "sorting the modules", "rewriting in assembly"], ans: 1, why: "Refine repeatedly until executable." },
    { q: "'Spaghetti code' results from:", opts: ["too many subroutines", "unstructured jumps (GOTO)", "meaningful names", "recursion"], ans: 1, why: "Uncontrolled control flow." }
  ],
  exam: [
    { src: "AQA 2020 P2 Q3", q: "Describe the structured programming approach and give two advantages of using it.", marks: 4,
      ms: ["Programs are built only from sequence, selection and iteration blocks (no GOTO) (1)", "The problem is decomposed top-down into subroutines / modules, often shown in a hierarchy chart (1)", "Advantage: modules can be tested / debugged independently (1)", "Advantage: easier to understand, maintain and reuse; suits team development (1)"] },
    { src: "AQA 2016 P2 Q2", q: "A hierarchy chart is drawn for a program. Explain what it shows and how it supports the procedural paradigm.", marks: 2,
      ms: ["Shows the program decomposed into modules with each module's sub-modules beneath it (1)", "Each box becomes a procedure/subroutine, so the chart is the plan for the procedural program (1)"] }
  ]
});

X("compsci:4.1.2.3", {
  notes: [
    { page: "Past-paper patterns" },
    { h: "OOP in Paper 2 — the reliable 8–12 marks" },
    "A-level Paper 2 has asked for an OOP item every year: a **class diagram** to draw or read, **inheritance** and **polymorphism/overriding** explained *with reference to the given classes*, **encapsulation** and why attributes are private, and **aggregation vs composition**. Paper 1 Section B/C then asks you to write class definitions against the skeleton program.",
    { table: { head: ["Term", "The mark-scheme phrasing"], rows: [
      ["Encapsulation", "Combining data (attributes) and the methods that act on it into an object; attributes are private and accessed only through public methods (getters/setters)"],
      ["Inheritance", "A subclass has all the attributes and methods of its superclass and may add / override; written `Class Dog Inherits Animal`"],
      ["Polymorphism", "Objects of different classes respond to the same method call in different ways; a subclass overrides a method of the superclass"],
      ["Overriding", "A subclass provides its own definition of a method with the same name/signature as one inherited"],
      ["Abstract class", "A class that cannot be instantiated; exists to be inherited from"],
      ["Virtual method", "A method in a base class that a subclass is expected/allowed to override"],
      ["Composition", "'Has-a' where the part cannot exist without the whole (car—engine): filled diamond"],
      ["Aggregation", "'Has-a' where the part can exist independently (team—player): hollow diamond"],
      ["Instantiation", "Creating an object from a class using the constructor"]
    ]}},
    { callout: { t: "tip", body: "Class diagrams: name box, attributes with `-` (private) / `+` (public), methods with return types; inheritance is an **open arrow to the superclass**. When asked to *write* a class definition, include the constructor and use the `Public`/`Private` keywords as the skeleton program does." }}
  ],
  flashcards: [
    ["Define encapsulation.", "Combining data and the methods that operate on it into an object, hiding the data behind public methods so it cannot be changed directly."],
    ["Define inheritance.", "A subclass acquires the attributes and methods of its superclass, and can add its own or override inherited ones."],
    ["Define polymorphism.", "The same method call producing different behaviour depending on the object's class — typically via overriding."],
    ["What is an abstract class?", "A class that cannot be instantiated and exists only to be inherited from, often with abstract (unimplemented) methods."],
    ["Composition vs aggregation?", "Composition: the part cannot exist without the whole (filled diamond). Aggregation: the part can exist independently (hollow diamond)."],
    ["What is a constructor?", "A special method called when an object is instantiated, used to initialise its attributes."],
    ["Why make attributes private?", "So they can only be changed through methods that validate the change — protects the object's integrity (information hiding)."],
    ["What is method overriding?", "A subclass defining its own version of a method it inherits, replacing the superclass behaviour for objects of the subclass."],
    ["What is meant by 'virtual' in a base-class method?", "It marks the method as one that subclasses may override, so the version called is chosen at run time by the object's actual class."],
    ["How is inheritance shown in a class diagram?", "An arrow with an open (hollow) triangular head from subclass to superclass."]
  ],
  quiz: [
    { q: "A `Manager` class adds a `Department` attribute to everything in `Employee`. This is:", opts: ["encapsulation", "inheritance", "aggregation", "instantiation"], ans: 1, why: "Manager is a subclass of Employee." },
    { q: "Declaring attributes private and providing `GetBalance()` is an example of:", opts: ["polymorphism", "encapsulation", "composition", "overriding"], ans: 1, why: "Data is hidden behind methods." },
    { q: "`Shape.Area()` is redefined in `Circle` and `Square`. Calling `Area()` on a list of shapes is:", opts: ["aggregation", "polymorphism", "inheritance only", "a constructor"], ans: 1, why: "Same call, class-specific behaviour." },
    { q: "A `Car` object contains an `Engine` object that is destroyed with the car. The relationship is:", opts: ["aggregation", "composition", "inheritance", "polymorphism"], ans: 1, why: "Part cannot exist without the whole." },
    { q: "A class marked abstract:", opts: ["can be instantiated", "cannot be instantiated", "has no methods", "cannot be inherited"], ans: 1, why: "It exists to be a base class." },
    { q: "In a class diagram, `-balance: Real` means balance is:", opts: ["public", "private", "static", "abstract"], ans: 1, why: "`-` denotes private; `+` public." },
    { q: "The method that runs when `new Account(500)` executes is the:", opts: ["destructor", "constructor", "getter", "override"], ans: 1, why: "Constructors initialise new objects." }
  ],
  exam: [
    { src: "AQA 2022 P2 Q9", ctx: "A veterinary practice's software has a class `Animal` with private attributes `Name` and `Age`, a constructor, and a public method `Describe()`. Classes `Dog` and `Cat` inherit from `Animal`. `Dog` adds a private attribute `Breed` and overrides `Describe()`.",
      parts: [
        { q: "Draw a class diagram for `Animal`, `Dog` and `Cat`.", marks: 4, ms: ["Three class boxes with correct names, Dog and Cat below Animal (1)", "Inheritance arrows (open triangle) from Dog and Cat to Animal (1)", "Animal attributes shown as private (−) with Describe() public (+); constructor shown (1)", "Dog shows −Breed and its own Describe() (1)"] },
        { q: "Explain what is meant by *overriding* with reference to `Describe()`.", marks: 2, ms: ["Dog provides its own definition of Describe() with the same name as the inherited method (1)", "So calling Describe() on a Dog object runs the Dog version rather than the Animal version (1)"] },
        { q: "Explain why `Name` and `Age` are declared private and how other code can still obtain an animal's age.", marks: 2, ms: ["Encapsulation / information hiding: the attributes cannot be altered directly from outside, protecting them from invalid values (1)", "A public method (getter) such as GetAge() returns the value (1)"] },
        { q: "Write the class definition for `Cat` in pseudo-code, given that it only inherits from `Animal` and adds a Boolean attribute `Indoor` set by its constructor.", marks: 3, ms: ["`Class Cat Inherits Animal` (1)", "`Private Indoor : Boolean` (1)", "Constructor taking name, age and indoor, calling the superclass constructor and setting Indoor (1)"] }
      ] },
    { src: "AQA 2019 P2 Q8", ctx: "In a school timetabling system a `Department` object holds a list of `Teacher` objects, and a `Lesson` object holds a `Register` object that is created and destroyed with the lesson.",
      parts: [
        { q: "State, with a reason, whether the relationship between `Department` and `Teacher` is aggregation or composition.", marks: 2, ms: ["Aggregation (1)", "A Teacher can exist independently of the Department — deleting the department does not delete its teachers (1)"] },
        { q: "State, with a reason, whether the relationship between `Lesson` and `Register` is aggregation or composition, and describe how each relationship is drawn in a class diagram.", marks: 3, ms: ["Composition — the Register cannot exist without its Lesson / is destroyed with it (1)", "Composition: filled (black) diamond at the whole end of the line (1)", "Aggregation: hollow (white) diamond at the whole end (1)"] }
      ] },
    { src: "AQA 2024 P2 Q10", q: "Explain what is meant by *polymorphism* and describe one advantage it gives a programmer.", marks: 3,
      ms: ["Objects of different classes can respond to the same method call (1)", "Each class provides its own implementation (overriding) and the correct one is selected by the object's class at run time (1)", "Advantage: code can process a collection of different subclass objects uniformly without selection statements for each type / new subclasses can be added without changing that code (1)"] },
    { src: "AQA 2017 P2 Q7", q: "State what is meant by an *abstract class* and explain why a designer might make the class `Shape` abstract in a drawing program.", marks: 2,
      ms: ["A class that cannot be instantiated / exists only to be inherited from (1)", "A generic 'shape' object makes no sense — only concrete subclasses (Circle, Rectangle) can be drawn; Shape defines the common interface they must implement (1)"] }
  ]
});

})(KOS.content.extend);
