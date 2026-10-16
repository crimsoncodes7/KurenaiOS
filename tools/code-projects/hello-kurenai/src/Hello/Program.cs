using Greeter;

// Reads a name, then the hour (0–23), and greets.
// Milestone 3: one of these lines is wrong. Find it with the debugger.
Console.Write("Name: ");
string name = Console.ReadLine()?.Trim() ?? "";
Console.Write("Hour: ");
int hour = int.Parse(Console.ReadLine() ?? "0");
if (hour < 0 || hour > 23)
{
    Console.WriteLine("The hour runs from 0 to 23.");
    return;
}
int shown = hour % 12;
Console.WriteLine();
Console.WriteLine(Greetings.For(name, shown));
Console.WriteLine("It is " + Greetings.Describe(hour) + ".");
