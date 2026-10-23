# Contacts on SQLite — brief

## Milestones

1. **Connect and read.** In `SqliteContactRepository`, create the table when
   it is missing — `contacts (id INTEGER PRIMARY KEY, name TEXT NOT NULL CHECK
   (name <> ''), email TEXT UNIQUE)` — then write `Add` (a blank name is an
   `ArgumentException`; trim it) and `All` (id order).
2. **Parameters, never concatenation.** Write `FindByName(text)`: names that
   contain the text, ignoring case, A–Z. Every value goes in as a parameter
   (`$name`), never glued into the SQL — a name like `O'Brien` must work, and
   SQL typed into a search must stay text. No `$"…SELECT…"` or `"…" +` SQL
   anywhere in `src/Contacts`.
3. **All or nothing.** Write `Import(contacts)` in ONE transaction: if any
   contact fails (an email already used, say), none of them are kept.
4. **The command line.** `src/Contacts.Cli` reads commands, one a line:

   | Command | Answer |
   |---|---|
   | `clear` | `Cleared.` |
   | `add <email or -> <name…>` | `Added #1 Ann Lee` |
   | `list` | `#1 Ann Lee <ann@x.uk>` (or `#2 Bob` with no email), by id; `No contacts.` |
   | `find <text>` | the same lines, A–Z by name; `No match.` |
   | `quit` | `Bye.` |

   A refusal prints `Error: ` and the message. Also: at least five of your own
   tests, no compiler warnings, and the work committed with Git.
