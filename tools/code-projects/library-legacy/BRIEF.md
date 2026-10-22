# The Lending Library — brief

`LateFees.Calculate` works out what a late book or DVD costs. Nobody wrote
down the rules, so the code is the specification:

- not yet due: nothing;
- a book has two days' grace, then 25p a day;
- a DVD costs £1 a day from the first day late;
- the fee stops at £10;
- a damaged item adds £5 to a late fee.

## Milestones

1. **Your first tests.** In `tests/Library.Tests`, write at least five
   passing tests of `LateFees`, at least one of them a `[Theory]`.
2. **Tests that catch bugs.** The validator plants five small bugs in
   `LateFees.cs`, one at a time, and runs your tests. Catch at least four.
   (Do this before you refactor `LateFees.cs`.)
3. **Test-first: renewals.** `Loan.Renew(today)` adds 14 days and counts the
   renewal; at most two renewals; never once overdue (throw
   `InvalidOperationException`). Write your tests first, watch them fail,
   then make them pass.
4. **A clock you control.** Give `LateFees` a constructor that takes an
   `IClock`, and use it instead of `DateTime.Today`. Move your tests to a
   fake clock.
5. **Depend on an abstraction.** `Reminders` creates an `SmtpSender` itself.
   Give it a constructor that takes an `INotifier` and stop mentioning
   `SmtpSender` in `Reminders.cs`. Your tests stay green.
6. **Clean and committed.** No compiler warnings; the work committed with Git
   and a clean working tree.
