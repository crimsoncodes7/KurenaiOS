using Contacts;

// The command line (milestone 4). The contacts live in contacts-data/contacts.db
// next to where the program runs (Git ignores that folder).
Directory.CreateDirectory("contacts-data");
IContactRepository contacts = new SqliteContactRepository(Path.Combine("contacts-data", "contacts.db"));

string? line;
while ((line = Console.ReadLine()) is not null)
{
    string[] words = line.Split(' ', StringSplitOptions.RemoveEmptyEntries);
    if (words.Length == 0) continue;
    switch (words[0].ToLowerInvariant())
    {
        case "help":
            Console.WriteLine("Commands: clear, add <email|-> <name>, list, find <text>, help, quit");
            break;
        case "quit":
            Console.WriteLine("Bye.");
            return;
        default:
            Console.WriteLine($"Unknown command: {words[0]}");
            break;
    }
}
