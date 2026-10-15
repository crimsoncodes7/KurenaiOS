/* Kurenai OS — data/content/code-c1.js
   Code · Capstone 1 · Text adventure engine (roadmap 5.3, frame 26l).

   The end of stage 1: one program built from units 1–3 only — variables,
   decisions, loops, methods, scope; no arrays or classes (unit 4 and 7).
   Six steps: a closed-book quiz (never locks), the brief & build
   against five milestones of acceptance tests, the rubric, an optional
   Kurenai review, a write-up and the result. The reference solution is
   for the gates only (smoke76, tools/cs_diff.mjs): it passes every
   acceptance case under the interpreter and under .NET.                 */
(function () {
  "use strict";
  var K = window.KOS_CODE;
  var HELP = "Commands: look, go <direction>, take <item>, inventory, help, quit";
  var HALL = "You are in the hall. Dust hangs in the air.\nExits: north, east, west";
  var LIB = "You are in the library. Shelves lean in the dark.";
  var KIT = "You are in the kitchen. Something smells of smoke.";
  var WELCOME = "Welcome to the Old House. Type help for commands.\n" + HALL;

  K.capstone("C1", {
    stage: 1,
    minutes: 180,
    summary: "A small text adventure: rooms, exits, items, a locked door and a way out — every stage 1 skill in one program.",
    quiz: [
      { q: "What does `Console.WriteLine(7 / 2);` print?", opts: ["3.5", "3", "4", "an error"], ans: 1, lesson: "1.4", why: "Both are ints, so the division drops the remainder." },
      { q: "Which loop always runs its body at least once?", opts: ["while", "for", "do … while", "foreach"], ans: 2, lesson: "2.5", why: "do … while tests after the body." },
      { q: "`int Half(int n) { if (n > 0) return n / 2; }` gives…", opts: ["CS0161", "CS0103", "0 for negatives", "nothing"], ans: 0, lesson: "3.2", why: "Not every path returns a value." },
      { q: "After `for (int i = 0; i < 3; i++) { }`, what does `Console.WriteLine(i);` give?", opts: ["3", "2", "CS0103", "0"], ans: 2, lesson: "3.3", why: "i's scope is the loop." },
      { q: "In `n switch { 1 => \"one\", _ => \"other\" }`, `_` means…", opts: ["zero", "anything else", "an error", "an empty string"], ans: 1, lesson: "2.4", why: "The discard matches every value the arms above did not." }
    ],
    brief: [
      "Build the engine for a tiny text adventure, the **Old House**. The player types commands, one per line; the program answers.",
      { h: "The house" },
      { table: { head: ["Room", "Exits", "Item"], rows: [["hall (start)", "north → garden (locked), east → library, west → kitchen", "—"], ["library", "west → hall", "key"], ["kitchen", "east → hall", "lamp"], ["garden", "the way out", "—"]] } },
      { h: "The words" },
      { ul: [
        "Start: `Welcome to the Old House. Type help for commands.`, then the hall described.",
        "A room is described as its line, then `You see: <item>` if one is there, then `Exits: …` (the hall's are `north, east, west`).",
        "Hall: `You are in the hall. Dust hangs in the air.` · Library: `You are in the library. Shelves lean in the dark.` · Kitchen: `You are in the kitchen. Something smells of smoke.` · Garden: `You are in the garden. Sunlight, at last.`"
      ] },
      { h: "The commands" },
      { table: { head: ["Command", "Answer"], rows: [
        ["`look`", "describe the room again"],
        ["`help`", "`" + HELP + "`"],
        ["`go <direction>`", "move and describe the new room, or `You can't go that way.`; north from the hall without the key: `The door is locked.`"],
        ["`take <item>`", "`Taken: key`, or `There is no <item> here.`"],
        ["`inventory`", "`You carry: key, lamp` in the order taken, or `You carry nothing.`"],
        ["`quit`", "`Goodbye.` and the program ends"],
        ["anything else", "`I don't understand that.`"]
      ] } },
      { ul: [
        "Reaching the garden prints its line, then `You escaped the Old House in N moves!` and ends. A move is a `go` that worked.",
        "When the input runs out (`Console.ReadLine()` gives `null`), the program ends quietly."
      ] },
      { h: "Forgiving input (milestone 5)" },
      { ul: [ "Commands ignore case and extra spaces: `  Go   East ` works.", "A blank line is ignored. `go` alone answers `Go where?`; `take` alone, `Take what?`." ] },
      call("tip", "Stage 1 only", ["No arrays or classes are needed: a `string room`, a few `bool`s and one method per job. Units 1–3 are all it takes; lessons 2.9, 3.6 and 3.8 are the closest."]),
      { h: "Useful string methods" },
      { code: { lang: "csharp", src: 'string c = "  Go East ".Trim().ToLower();   // "go east"\nbool g = c.StartsWith("go ");                 // True\nstring dir = c.Substring(3);                  // "east"\nc = c.Replace("  ", " ");                     // two spaces → one' } }
    ],
    starter: '// Capstone 1 · Text adventure engine\n// Build it one milestone at a time: Run it with your own commands,\n// then run the acceptance tests.\n\nstring room = "hall";\n\nConsole.WriteLine("Welcome to the Old House. Type help for commands.");\nLook();\n\nwhile (true)\n{\n    string line = Console.ReadLine();\n    if (line == null) break;              // no more input\n    string command = line.Trim().ToLower();\n    if (command == "quit")\n    {\n        Console.WriteLine("Goodbye.");\n        break;\n    }\n    // milestone 1: look, help, and anything else\n}\n\nvoid Look()\n{\n    // describe the room you are in\n}\n',
    milestones: [
      { id: "m1", title: "Look, help and quit", about: "The loop, the welcome, look, help, quit and an unknown command.", cases: [
        { stdin: "look\nhelp\nquit", out: WELCOME + "\n" + HALL + "\n" + HELP + "\nGoodbye." },
        { stdin: "dance\nquit\nlook", out: WELCOME + "\nI don't understand that.\nGoodbye.", hidden: true },
        { stdin: "", out: WELCOME, hidden: true }
      ] },
      { id: "m2", title: "Moving between rooms", about: "go, the exits, and a wall.", cases: [
        { stdin: "go east\ngo west\ngo west\ngo south\nlook", out: WELCOME + "\n" + LIB + "\nYou see: key\nExits: west\n" + HALL + "\n" + KIT + "\nYou see: lamp\nExits: east\nYou can't go that way.\n" + KIT + "\nYou see: lamp\nExits: east" },
        { stdin: "go up\ngo east\ngo east\ngo west", out: WELCOME + "\nYou can't go that way.\n" + LIB + "\nYou see: key\nExits: west\nYou can't go that way.\n" + HALL, hidden: true }
      ] },
      { id: "m3", title: "Items and the inventory", about: "take, a missing item, and what you carry.", cases: [
        { stdin: "go east\ntake key\ntake key\ninventory\ngo west\ngo west\ntake lamp\ninventory\ntake sword", out: WELCOME + "\n" + LIB + "\nYou see: key\nExits: west\nTaken: key\nThere is no key here.\nYou carry: key\n" + HALL + "\n" + KIT + "\nYou see: lamp\nExits: east\nTaken: lamp\nYou carry: key, lamp\nThere is no sword here." },
        { stdin: "inventory\ngo west\ntake key\nlook", out: WELCOME + "\nYou carry nothing.\n" + KIT + "\nYou see: lamp\nExits: east\nThere is no key here.\n" + KIT + "\nYou see: lamp\nExits: east", hidden: true }
      ] },
      { id: "m4", title: "The locked door", about: "North needs the key; the garden ends the game.", cases: [
        { stdin: "inventory\ngo north\ngo east\ntake key\ngo west\ngo north\nlook", out: WELCOME + "\nYou carry nothing.\nThe door is locked.\n" + LIB + "\nYou see: key\nExits: west\nTaken: key\n" + HALL + "\nYou are in the garden. Sunlight, at last.\nYou escaped the Old House in 3 moves!" },
        { stdin: "go west\ngo east\ngo east\ntake key\ngo west\ngo north", out: WELCOME + "\n" + KIT + "\nYou see: lamp\nExits: east\n" + HALL + "\n" + LIB + "\nYou see: key\nExits: west\nTaken: key\n" + HALL + "\nYou are in the garden. Sunlight, at last.\nYou escaped the Old House in 5 moves!", hidden: true }
      ] },
      { id: "m5", title: "Forgiving input", about: "Case, spaces, blank lines, and go or take on their own.", cases: [
        { stdin: "  LOOK  \ngo\ntake\n\nGo   East\nTAKE Key\nQuit", out: WELCOME + "\n" + HALL + "\nGo where?\nTake what?\n" + LIB + "\nYou see: key\nExits: west\nTaken: key\nGoodbye." },
        { stdin: "Help\n\n\nINVENTORY\ntake   lamp\nQUIT", out: WELCOME + "\n" + HELP + "\nYou carry nothing.\nThere is no lamp here.\nGoodbye.", hidden: true }
      ] }
    ],
    rubric: [
      { id: "correct", title: "Correctness · acceptance tests", auto: true, max: 12 },
      { id: "input", title: "Handles odd input", max: 4, guide: ["Crashes or loops on odd input", "Some odd input handled", "Most odd input handled", "Every odd input in the brief handled", "And cases the brief did not mention"] },
      { id: "structure", title: "Structure and names", max: 4, guide: ["One long block", "A few methods", "One method per job", "Methods with clear names and parameters", "Read like the plan, no repeated code"] },
      { id: "scope", title: "Variables and scope", max: 4, guide: ["Everything shared", "Some locals", "Locals where possible", "Shared state kept to a few clear variables", "Each variable in the smallest scope that works"] }
    ],
    writeupMin: 40,
    writeupPrompts: ["How did you split the program into methods, and why?", "Which milestone was hardest, and what changed your mind?", "What would you change with arrays (unit 4) or classes (unit 7)?"],
    reward: { xp: 150, gold: 40, hp: 10 },
    answer: 'string room = "hall";\nbool keyInLibrary = true, lampInKitchen = true, hasKey = false;\nstring carried = "";\nint moves = 0;\n\nConsole.WriteLine("Welcome to the Old House. Type help for commands.");\nLook();\n\nwhile (true)\n{\n    string line = Console.ReadLine();\n    if (line == null) break;\n    string command = Normalise(line);\n    if (command == "") continue;\n    if (command == "quit")\n    {\n        Console.WriteLine("Goodbye.");\n        break;\n    }\n    if (command == "look") Look();\n    else if (command == "help") Console.WriteLine("Commands: look, go <direction>, take <item>, inventory, help, quit");\n    else if (command == "inventory") Console.WriteLine(carried == "" ? "You carry nothing." : "You carry: " + carried);\n    else if (command == "go") Console.WriteLine("Go where?");\n    else if (command == "take") Console.WriteLine("Take what?");\n    else if (command.StartsWith("go ")) { if (Go(command.Substring(3))) break; }\n    else if (command.StartsWith("take ")) Take(command.Substring(5));\n    else Console.WriteLine("I don\'t understand that.");\n}\n\nstring Normalise(string s)\n{\n    string t = s.Trim().ToLower();\n    while (t.Contains("  ")) t = t.Replace("  ", " ");\n    return t;\n}\n\nbool Go(string dir)\n{\n    string next = Exit(room, dir);\n    if (next == "")\n    {\n        Console.WriteLine("You can\'t go that way.");\n        return false;\n    }\n    if (next == "garden" && !hasKey)\n    {\n        Console.WriteLine("The door is locked.");\n        return false;\n    }\n    room = next;\n    moves++;\n    if (room == "garden")\n    {\n        Console.WriteLine(Describe(room));\n        Console.WriteLine($"You escaped the Old House in {moves} moves!");\n        return true;\n    }\n    Look();\n    return false;\n}\n\nstring Exit(string from, string dir)\n{\n    if (from == "hall" && dir == "north") return "garden";\n    if (from == "hall" && dir == "east") return "library";\n    if (from == "hall" && dir == "west") return "kitchen";\n    if (from == "library" && dir == "west") return "hall";\n    if (from == "kitchen" && dir == "east") return "hall";\n    return "";\n}\n\nstring Describe(string r) => r switch\n{\n    "hall" => "You are in the hall. Dust hangs in the air.",\n    "library" => "You are in the library. Shelves lean in the dark.",\n    "kitchen" => "You are in the kitchen. Something smells of smoke.",\n    _ => "You are in the garden. Sunlight, at last."\n};\n\nstring Exits(string r) => r switch\n{\n    "hall" => "north, east, west",\n    "library" => "west",\n    _ => "east"\n};\n\nstring ItemHere(string r)\n{\n    if (r == "library" && keyInLibrary) return "key";\n    if (r == "kitchen" && lampInKitchen) return "lamp";\n    return "";\n}\n\nvoid Look()\n{\n    Console.WriteLine(Describe(room));\n    string item = ItemHere(room);\n    if (item != "") Console.WriteLine("You see: " + item);\n    Console.WriteLine("Exits: " + Exits(room));\n}\n\nvoid Take(string item)\n{\n    if (item == "" || item != ItemHere(room))\n    {\n        Console.WriteLine($"There is no {item} here.");\n        return;\n    }\n    if (item == "key")\n    {\n        keyInLibrary = false;\n        hasKey = true;\n    }\n    else lampInKitchen = false;\n    carried = carried == "" ? item : carried + ", " + item;\n    Console.WriteLine("Taken: " + item);\n}\n'
  });
  function call(t, h, body) { return { callout: { t: t, h: h, body: body } }; }
})();
