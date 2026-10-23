# Your first window — brief

A tip calculator: type the bill and how many people, pick a tip, and the
window shows the tip, the total and each person's share as you type.

## Milestones

1. **A window with controls.** In `MainWindow.axaml`: the title
   `Tip calculator`; a `TextBox` named `BillBox` and one named `PeopleBox`
   (starting at `1`); three `RadioButton`s named `Tip10`, `Tip15` and
   `Tip20` in one group, 15% chosen; and four `TextBlock`s named `TipText`,
   `TotalText`, `EachText` and `Message`. Name them with `x:Name`.
2. **Laid out.** Give each box a `Label` whose `Target` is that box. At 320,
   420 and 800 pixels wide nothing may overlap or run outside the window, and
   the boxes stretch with it (a `Grid` with an `Auto` and a `*` column does
   this).
3. **Events.** In `MainWindow.axaml.cs`, update the answer on every change —
   each keystroke and each tip chosen — through `TipMath.Split`:

   | Shown | For £42.50, 15%, 3 people |
   |---|---|
   | `TipText` | `£6.38` (to the nearest penny, halves up) |
   | `TotalText` | `£48.88` |
   | `EachText` | `£16.30` (rounded **up**, so the bill is covered) |
   | `Message` | empty |

   Until a bill is typed, show `—` in the three answers and no message. A bill
   that is not a number of 0 or more shows `—` and the message
   `Enter the bill as a number, like 42.50.`; people that are not a whole
   number of 1 or more, `Enter how many people, 1 or more.`
4. **Tested, clean and committed.** At least four of your own tests of
   `TipMath` in `tests/Tips.Tests`, no compiler warnings, and the work
   committed with Git.
