# Exams & Papers audit · 18 November 2026

After kos-exams-3 the user found the reworked Exams & Papers hub full of
problems. This is the audit done before fixing anything: every surface
driven in the browser on the dense test data (24 exams: AQA CS, Edexcel
Maths and OCR IT; a mock, a real exam and a topic test of each kind), the
papers printed to PDF and the page sizes measured, every dialog opened.
Each line says what is wrong and what the fix is. Status is kept here.

## Reported by the user

| # | Problem | Cause | Fix |
|---|---|---|---|
| U1 | Printed papers are not A4, page sizes all over the place | Each question is its own "page" (on screen 725–1,736 px tall at A4 width); in print each sheet's white area stops where its question ends and the rest prints in the app's dark background. The Papers section's Print opens the paper and prints the WHOLE APP. The paper's own Print always appends the mark scheme. | A pagination engine: parts flow onto fixed A4 sheets (210 × 297 mm), the same on screen and in print, a footer on each; print is white paper only; every Print prints the paper alone; the scheme only when asked |
| U2 | Your own past-paper files are not treated like the app's papers | Files live only in the Library; an exam's Papers section links away to it; a file attached to an exam is just a file | The exam's Papers section lists every past paper of its board paper you hold, with Sit, Print, Scheme and Log marks; a PDF attached to an exam can be used as a past paper (matched in place) |
| U3 | Exams settings: "Extra time" squeezed into a one-word column | The select fills the row and the label wraps beside it | Label above the control, full width, like every other field |
| U4 | "You predicted 34: 0 marks — spot on" | The gap reads as a score | "Spot on: you predicted 34, you got 34" / "2 over your prediction" |
| U5 | Topic and retrieval tests cannot record their result | "This IS the result of…" lists only mocks and real exams | Every assessment that is not a deadline, dated today or earlier |
| U6 | Grade is a text box | — | A dropdown of the subject's scale (A*–U; IT: Distinction*–U), with "Not graded" |
| U7 | No IT paper in Match your files | The past-paper index holds AQA and Edexcel only | OCR H119 F200 and F201 in the index (their SAMs as sittings), the annotated SAM matched as the scheme |
| U8 | A detour to the Library to reach a past paper | — | U2 |
| U9 | "Set its page" is unclear and may not work | Only 1 of 10 questions found in the PDF's text; choosing one silently pins the page in view; forgotten when the viewer closes | Better question finding (OCR 1(a), AQA 0 1 . 1, Edexcel 1.); a question not found asks "Which page is Q3 on?" with the page in view filled in; kept with the file |
| U10 | Attempts cannot be cleared; little can be edited | Review shows attempts with no Edit or Delete | Edit (marks, out of, grade, date, timed, notes, the assessment it counts for) and Delete with Undo on every attempt in Review and in Results |

## Found in the audit

| # | Problem | Fix |
|---|---|---|
| A1 | Sidebar says Papers 0/1, the section says "0 of 2 sat" | One count from one function |
| A2 | A topic test's scope-built paper shows no marks or time | The row shows them like every other paper |
| A3 | Library: two tab rows, both with "Library"; a big empty card | One tab row; the empty state sized to its content |
| A4 | Results: the IT units card cuts "Distinction" off at its edge | The row fits its card |
| A5 | Today: "Weakest topic … Red · Recall 100 %" contradicts itself; "After this" repeats step 2 | Say why it is weakest (Red, your rating); "After this" shows the next step or hides |
| A6 | Load: long exam titles run out of their day cards | Titles clamp to two lines with the full title on hover/press |
| A7 | Review with no attempt is a line on an empty page | It says what Review will hold and offers the papers to sit |

## Rule from here (the user, 18 November 2026)

Every new feature is rigorously tested and looked at in every aspect
before a release: each surface in the browser at desktop and iPad sizes,
printed to PDF with every page measured, every tier and every board, your
own files as well as the app's, and the edit, clear and undo paths.
