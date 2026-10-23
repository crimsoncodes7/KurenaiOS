# The Revision Planner — brief

A topic has an id, a subject, a name, a confidence from 1 (shaky) to 5
(solid) and the day it was last studied. `Priority.Score` decides what comes
first: lower scores first, `confidence × 100 − days since studied` (never
studied counts as 30 days; at most 30).

## Milestones

1. **Pin down the rule.** In `tests/Planner.Tests`, write at least six
   passing tests, at least one a `[Theory]`. The validator plants four bugs in
   `Priority.cs`, one at a time; your tests must catch at least three.
2. **The planner, test-first.** `StudyPlanner` over an `ITopicStore` and an
   `IClock`:
   - `AddAsync(subject, name)`: trims both, stores the subject in lower case;
     the next id (one more than the highest), confidence 1, never studied.
     A blank name is an `ArgumentException`; the same name again in the same
     subject (any case) an `InvalidOperationException`.
   - `RateAsync(id, confidence)`: 1–5 (else `ArgumentOutOfRangeException`),
     an unknown id a `KeyNotFoundException`; sets the confidence and makes
     today the day it was last studied.
   - `NextAsync(n)`: the n topics with the lowest scores, ties by name
     (ordinal), using a `PriorityQueue`; it saves nothing. n below 1 is an
     `ArgumentOutOfRangeException`.
3. **JSON storage, async.** `JsonTopicStore(path)`: a missing file loads as
   no topics; `SaveAsync` creates the folder and replaces the file; a broken
   file is an `InvalidDataException`; both honour the `CancellationToken`. No
   `.Result` or `.Wait()` anywhere in `src`.
4. **The command line.** `src/Planner.Cli` reads commands, one a line:

   | Command | Answer |
   |---|---|
   | `clear` | `Cleared.` (no topics saved) |
   | `add <subject> <name…>` | `Added #1 cs: Big O` |
   | `rate <id> <1-5>` | `Rated #1: 4` |
   | `next <n>` | `1. #3 cs: Hash tables (confidence 1)` … or `Nothing to study.` |
   | `list` | `#1 cs: Big O (confidence 4)` by id, or `No topics yet.` |
   | `help` | the commands |
   | `quit` | `Bye.` |
   | anything else | `Unknown command: fly` |

   A refusal prints `Error: ` and the exception's message. The topics persist
   in `planner-data/topics.json` between runs.
5. **Shipped.** At least ten of your own tests, no compiler warnings, and
   the work committed with Git and a clean working tree.
