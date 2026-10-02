/* Kurenai OS — deep content: AQA 7517 §4.1.1 Programming Fundamentals */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {

C["compsci:4.2.1.3"] = {
  notes: [
    { callout: { t: "tip", h: "File Handling", body: "Programs use file handling to persist data permanently. We distinguish between **Text** files (human-readable characters) and **Binary** files (raw bytes, more compact and efficient)." }},
    { callout: { t: "def", h: "File Operations", body: [
      { kv: [
        ["Open", "Establishes a connection between the physical file on disk and a file handle in the program."],
        ["Read", "Retrieves data from the file into the program's variables."],
        ["Write", "Persists data from variables into the file on disk."],
        ["Close", "Terminates the connection and ensures all buffered data is physically written to disk."],
        ["EOF (End of File)", "A specific marker or condition indicating that no more data is available to read."]
      ]}
    ]}},
    { callout: { t: "warn", h: "Always Close!", body: "Failure to close a file can lead to data loss (unflushed buffers) or the file remaining 'locked', preventing other applications from accessing it." }},
    { code: { lang: "csharp", cap: "Reading and Writing text files in C#.", src:
"using System.IO;\n\n// Writing\nFile.WriteAllText(\"save.txt\", \"KurenaiOS v2.0\");\n\n// Reading line by line\nusing (StreamReader reader = new StreamReader(\"data.txt\")) {\n    while (!reader.EndOfStream) {\n        string line = reader.ReadLine();\n        Console.WriteLine(line);\n    }\n}\n// 'using' block automatically CLOSES the file." }},
    { callout: { t: "memorise", h: "4 File Operations", body: "Open (connect to file) → Read (retrieve data into variables) → Write (persist data from variables) → Close (flush buffer + release lock). Text files store character codes. Binary files store raw bytes (more compact for numbers/images)." }},
    { callout: { t: "miscon", h: "Closing a File Is NOT Optional", body: "Failing to close a file can corrupt data (write buffer not flushed to disk) or leave the file locked, blocking all other processes from accessing it. The `using` block in C# auto-closes the file via the IDisposable pattern." }}
  ],
  flashcards: [
    ["Difference between a text file and a binary file?", "Text files store characters (ASCII/UTF-8); Binary files store raw bytes (like images or compiled code)."],
    ["Why is it important to close a file after writing?", "To flush the buffer and ensure data is actually saved, and to release the file lock."],
    ["What does EOF stand for?", "End Of File."],
    ["Which is more memory efficient for storing large numbers: Text or Binary?", "Binary (stores the number directly in its byte representation, no conversion to characters needed)."],
    ["What happens if you try to read past the EOF?", "An error/exception usually occurs, or the function returns null."],
    ["What is a 'File Handle'?", "A variable or pointer used by the program to keep track of an open file."],
    ["List the four core file operations in order of typical use.", "Open (connect), Read/Write (transfer data), then Close (flush + release)."],
    ["Give one benefit and one drawback of text files vs binary.", "Text: human-readable and portable, but larger and slower to parse. Binary: compact and fast, but not human-readable and less portable."],
    ["Why might EOF detection use indefinite iteration?", "The number of lines/records is usually unknown in advance, so you loop until the EOF condition is met."],
    ["What is the risk of not flushing/closing a written file?", "Buffered data may be lost (not written to disk) and the file may stay locked, blocking other processes."]
  ],
  quiz: [
    { q: "Which operation is used to move data from RAM to secondary storage?", opts: ["Open", "Read", "Write", "Close"], ans: 2, why: "Writing 'outputs' data to the disk." },
    { q: "A text file containing `123` takes how many bytes? (Assuming 1 byte per char)", opts: ["1", "2", "3", "4"], ans: 2, why: "It stores three character codes ('1', '2', '3')." },
    { q: "Which block in C# ensures a file is closed even if an error occurs?", opts: ["try", "catch", "using", "finally"], ans: 2, why: "'using' is syntactic sugar for try-finally with a Close() call." },
    { q: "Binary files are better than text files for…", opts: ["Editing in Notepad", "Saving space and execution speed", "Web pages", "Human readability"], ans: 1, why: "Binary is the 'native' format of the computer, avoiding overhead." },
    { q: "Which loop condition is most appropriate when reading every record from a file of unknown length?", opts: ["A fixed FOR loop of 100", "WHILE NOT EOF", "A single IF", "An infinite loop with no exit"], ans: 1, why: "Read until the end-of-file condition because the record count is unknown." }
  ],
  exam: [
    { q: "A company stores its product catalogue in a text file. Each line contains a product ID, name, and price. Describe the steps a program must take to find the price of a specific product ID.", marks: 4,
      ms: ["Open the file for reading (1)", "Read each line in a loop until EOF is reached (1)", "Split the line and check if the product ID matches (1)", "If matched, output the price and close the file (1)"] },
    { q: "Explain the difference between a text file and a binary file, giving one advantage of each.", marks: 4,
      ms: ["Text file stores character codes (ASCII/Unicode), human-readable (1); advantage: portable / easily edited and inspected (1)", "Binary file stores raw bytes in the computer's native format (1); advantage: more compact and faster to read/write (no parsing) (1)"] },
    { q: "Describe the four standard file operations and explain why failing to close a file correctly can cause problems.", marks: 6,
      ms: ["Open — establishes a connection/handle between the program and the file (1)", "Read — retrieves data from the file into variables (1)", "Write — persists data from variables to the file (1)", "Close — flushes buffered data and releases the file lock (1)", "Not closing risks data loss because the write buffer is not flushed to disk (1)", "The file may remain locked, preventing other programs/processes from accessing it (1)"] }
  ]
};



})(window.KOS_CONTENT);
