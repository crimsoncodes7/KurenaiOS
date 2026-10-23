using Planner.Core;
using Planner.Storage;

// The command line (milestone 4). The topics live in planner-data/topics.json,
// next to where the program runs (Git ignores that folder).
var store = new JsonTopicStore(Path.Combine("planner-data", "topics.json"));
var planner = new StudyPlanner(store, new SystemClock());

string? line;
while ((line = Console.ReadLine()) is not null)
{
    string[] words = line.Split(' ', StringSplitOptions.RemoveEmptyEntries);
    if (words.Length == 0) continue;
    switch (words[0].ToLowerInvariant())
    {
        case "help":
            Console.WriteLine("Commands: clear, add <subject> <name>, rate <id> <1-5>, next <n>, list, help, quit");
            break;
        case "quit":
            Console.WriteLine("Bye.");
            return;
        default:
            Console.WriteLine($"Unknown command: {words[0]}");
            break;
    }
}
