using Library;
using Microsoft.EntityFrameworkCore;

// The command line (milestone 7). The library lives in library-data/library.db
// next to where the program runs (Git ignores that folder); every start applies
// your migrations, so the file always has the tables your model describes.
Directory.CreateDirectory("library-data");
var options = new DbContextOptionsBuilder<LibraryContext>()
    .UseSqlite("Data Source=" + Path.Combine("library-data", "library.db")).Options;
using var db = new LibraryContext(options);
db.Database.Migrate();
var library = new LibraryService(db);

string? line;
while ((line = Console.ReadLine()) is not null)
{
    string[] words = line.Split(' ', StringSplitOptions.RemoveEmptyEntries);
    if (words.Length == 0) continue;
    try
    {
        switch (words[0].ToLowerInvariant())
        {
            case "clear":
                db.Database.EnsureDeleted();
                db.Database.Migrate();
                db.ChangeTracker.Clear();
                Console.WriteLine("Cleared.");
                break;
            case "book":
            {
                // book <year> <title> | <author>
                string[] parts = string.Join(' ', words[2..]).Split('|', StringSplitOptions.TrimEntries);
                var b = library.AddBook(parts[0], parts.Length > 1 ? parts[1] : "", int.Parse(words[1]));
                Console.WriteLine($"Added book #{b.Id} {b.Title} ({b.Author}, {b.Year})");
                break;
            }
            case "member":
            {
                var m = library.AddMember(string.Join(' ', words[1..]));
                Console.WriteLine($"Added member #{m.Id} {m.Name}");
                break;
            }
            case "shelf":
            {
                var books = library.Shelf();
                if (books.Count == 0) Console.WriteLine("No books.");
                foreach (var b in books) Console.WriteLine($"#{b.Id} {b.Title} — {b.Author} ({b.Year})");
                break;
            }
            case "lend":
            {
                var loan = library.Lend(int.Parse(words[1]), int.Parse(words[2]), DateOnly.Parse(words[3]));
                Console.WriteLine($"Lent book #{loan.BookId} to member #{loan.MemberId}, due {loan.Due:yyyy-MM-dd}.");
                break;
            }
            case "return":
                library.Return(int.Parse(words[1]), DateOnly.Parse(words[2]));
                Console.WriteLine($"Returned loan #{words[1]}.");
                break;
            case "overdue":
            {
                var late = library.Overdue(DateOnly.Parse(words[1]));
                if (late.Count == 0) Console.WriteLine("Nothing overdue.");
                foreach (var o in late) Console.WriteLine($"{o.Title} · {o.Member} · due {o.Due:yyyy-MM-dd} · {o.DaysLate} days late");
                break;
            }
            case "members":
                foreach (var s in library.Members()) Console.WriteLine($"{s.Name} · {s.Loans} loan(s) · {s.Out} out");
                break;
            case "help":
                Console.WriteLine("Commands: clear, book <year> <title> | <author>, member <name>, shelf, lend <book> <member> <date>, return <loan> <date>, overdue <date>, members, help, quit");
                break;
            case "quit":
                Console.WriteLine("Bye.");
                return;
            default:
                Console.WriteLine($"Unknown command: {words[0]}");
                break;
        }
    }
    catch (Exception e) when (e is ArgumentException or InvalidOperationException or FormatException or IndexOutOfRangeException)
    {
        Console.WriteLine("Error: " + e.Message);
    }
}
