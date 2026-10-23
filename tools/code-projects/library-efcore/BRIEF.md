# The Lending Library on EF Core — brief

## Milestones

1. **Entities and a context.** In `LibraryContext.OnModelCreating`, make
   `Book.Title` required and at most 200 characters. In `LibraryService`, write
   `AddBook` and `AddMember` (a blank title or name is an `ArgumentException`;
   trim it; each gets its id from the database) and `Shelf` (title order, then
   year).
2. **Queries that translate.** Write `ByAuthor` (oldest first), `Search`
   (titles containing the text, ignoring case, A–Z), `CountOnLoan` (loans not
   returned) and `BooksPerAuthor` (most books first, then A–Z). The filtering,
   counting and grouping must happen in SQL: the tests read the SQL EF sends.
   No `AsEnumerable()` or `ToList()` before a `Where`.
3. **Migrations.** `dotnet ef migrations add Initial --project src/Library.Data`.
   Whenever the model changes later, add another — the tests check your
   migrations still describe the model.
4. **Relationships and loading.** `Lend(book, member, today)`: due 14 days
   later; a book already out, or a book or member that does not exist, is an
   `InvalidOperationException`. `Return(loan, today)`. `Overdue(today)`: each
   loan past due and not returned, with its book's title and its member's name,
   earliest due first. Configure the two relationships so a book or member with
   loans cannot be deleted (`DeleteBehavior.Restrict`) — then add a migration.
5. **Change tracking.** Reading (`Shelf`, `ByAuthor`, `Search`) tracks nothing.
   `Rename(book, title)` changes only the title: the UPDATE EF sends names no
   other column. `Return` saves one UPDATE.
6. **N+1, found and fixed.** `Members()` already works — and sends one query
   per member. Rewrite it so twenty members take at most two queries.
7. **The command line.** `src/Library.Cli` is written for you:

   | Command | Answer |
   |---|---|
   | `clear` | `Cleared.` (the database deleted and migrated afresh) |
   | `book <year> <title> \| <author>` | `Added book #1 Dune (Frank Herbert, 1965)` |
   | `member <name…>` | `Added member #1 Ann Lee` |
   | `shelf` | `#1 Dune — Frank Herbert (1965)`; `No books.` |
   | `lend <book> <member> <yyyy-mm-dd>` | `Lent book #1 to member #1, due 2026-09-15.` |
   | `return <loan> <yyyy-mm-dd>` | `Returned loan #1.` |
   | `overdue <yyyy-mm-dd>` | `Dune · Ann Lee · due 2026-09-15 · 5 days late`; `Nothing overdue.` |
   | `members` | `Ann Lee · 1 loan(s) · 1 out` |
   | `quit` | `Bye.` |

   Make it answer every command and remember between runs. Also: at least five
   of your own tests, no compiler warnings, and the work committed with Git.
