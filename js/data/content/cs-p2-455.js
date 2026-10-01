/* Kurenai OS — deep content: AQA Computer Science Paper 2, spec 4.5.5
   (information coding systems: the character form of a decimal digit,
   ASCII and Unicode, error checking and correction) at full A-level
   depth. Each topic REPLACES the short entry the older file carried;
   every way AQA has examined it (7516/2 June 2016–2025, 7517/2 June
   2017–2025) is explained, worked and answered in the mark scheme's own
   format. Every parity bit, majority vote and code was checked by program.
   Past-paper banks stay in bank-cs-45a.js / bank-cs-45b.js. */
window.KOS_CONTENT = window.KOS_CONTENT || {};
(function (C) {
var before = Object.keys(C);

/* ---- figure helpers ---- */
function cells(bits, x, y, cw, col, hl) {
  var it = [];
  bits.split("").forEach(function (b, i) {
    var xx = x + i * cw, on = b === "1", h = hl && hl.indexOf(i) >= 0;
    it.push({ poly: [[xx, y], [xx + cw, y], [xx + cw, y + 34], [xx, y + 34]], fill: h ? "accent2" : (on ? col : null), alpha: h ? 0.35 : (on ? 0.26 : 0), c: "line", w: 1.3 });
    it.push({ text: [xx + cw / 2, y + 17], t: b, b: true, size: 14, c: on || h ? "text" : "muted" });
  });
  return it;
}
/* a byte with its parity bit picked out */
function parityFig(data, parity, cap, o) {
  o = o || {};
  var cw = 42, x0 = 30, it = [];
  it.push({ text: [x0 + cw / 2, 18], t: "parity", b: true, c: "accent2", size: 11.5 });
  it.push({ text: [x0 + cw + data.length * cw / 2, 18], t: o.label || "7-bit ASCII code", b: true, c: "accent", size: 11.5 });
  it = it.concat(cells(parity + data, x0, 30, cw, "accent", [0]));
  it.push({ text: [x0 + (data.length + 1) * cw / 2, 84], t: o.note || "", c: "text2", size: 12 });
  return { w: x0 * 2 + (data.length + 1) * cw, h: 100, items: it, cap: cap };
}

var MS_KEY = { callout: { t: "tip", h: "Reading an AQA mark scheme", body: [
  "Each creditworthy point ends in a semicolon (**;**) and earns one mark. **MAX n** caps the total.",
  "**A.** accept · **R.** reject · **NE.** not enough · **I.** ignore · **//** alternative wordings of one point.",
  "\"Explain\" questions here usually pair an AO1 knowledge mark (what) with an AO1 understanding mark (how or why) — the second needs the first."
] } };

/* =====================================================================
   4.5.5.1  Character form of a decimal digit
   ===================================================================== */
C["compsci:4.5.5.1"] = {
  notes: [
    { h: "Character form of a decimal digit — the whole topic on one page" },
    "Spec 4.5.5.1: differentiate between the **character code** representation of a decimal digit and its **pure binary** representation.",
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Which character does a code represent?", "What character", "1", "AS 2016 Q02.5"],
      ["Convert a digit's character code to its value", "Explain how", "1", "AS 2019 Q03.1"],
      ["Write the ASCII code for a digit (in a transmission frame)", "Complete", "1 of 3", "A-level 2019 Q09.2"],
      ["Code of a character from a neighbour's code", "What is", "1", "AS 2025 Q03.1"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Two ways to store 8**.", "**Converting between them**.", "**Exam toolkit**."] },

    { page: "Two ways to store 8" },
    { callout: { t: "def", h: "Character code vs pure binary", body: "A **character code** is the number a coding system (ASCII, Unicode) assigns to a **symbol** — the character '8' is code 56. A digit's **pure binary** representation is the **value** itself — the number 8 is 00001000. They are different bit patterns; only the pure binary can be used in arithmetic." } },
    { fig: { w: 520, h: 150, items: [].concat(
      [{ text: [120, 18], t: "the character '8' (ASCII 56)", b: true, c: "accent", size: 12 }], cells("00111000", 20, 30, 25, "accent"),
      [{ text: [400, 18], t: "the number 8 (pure binary)", b: true, c: "accent3", size: 12 }], cells("00001000", 300, 30, 25, "accent3"),
      [{ text: [260, 100], t: "'8' − 48 = 8  //  '8' AND 00001111 = 8  //  '8' XOR 00110000 = 8", b: true, c: "accent2", size: 12 }]
    ), cap: "The digit characters '0'–'9' are ASCII 48–57 (0110000–0111001): the low four bits ARE the digit's value." } },
    { table: { head: ["Character", "ASCII (denary)", "ASCII (binary)", "Value"], rows: [
      ["'0'", "48", "011 0000", "0"], ["'4'", "52", "011 0100", "4"], ["'8'", "56", "011 1000", "8"], ["'9'", "57", "011 1001", "9"]
    ] } },
    { callout: { t: "miscon", h: "\"'7' + '5' = 12\"", body: "Added as characters, '7' + '5' is 55 + 53 = 108 — the code for 'l' — or, in a string language, the string \"75\". The values are only added correctly after converting each character to its pure binary value." } },

    { page: "Converting between them" },
    { worked: { tag: "exam", title: "Convert the character code for '8' to the value 8", src: "AS June 2019 · P2 Q03.1 · 1 mark",
      q: "The bit pattern 00111000 is the character code for the numeric character '8'. The bit pattern 00001000 represents the decimal number 8. Explain how a computer could convert the character code for '8' to the bit pattern for its corresponding decimal value.",
      steps: [{ m: "Subtract 48 (00110000) from the character code // AND the code with 00001111 (a mask keeping the low four bits) // XOR the code with 00110000.", mk: "1 mark", n: "MAX 1 — one complete method. Synoptic: AND and XOR masks are 4.7.3.5 bitwise operations." }],
      result: "Subtract 48 (or AND with 00001111)" } },
    { worked: { tag: "exam", title: "Which character is this code?", src: "AS June 2016 · P2 Q02.5 · 1 mark",
      q: "The ASCII code for the numeric character \"0\" is 48 in decimal; the other numeric characters follow in sequence. What character is represented by the bit pattern 00111001 if it is an ASCII code?",
      steps: [{ m: "00111001 = 57 = 48 + 9 → the character **9**", mk: "1 mark", n: "I. quotes around the answer." }], result: "9" } },
    { worked: { tag: "exam", title: "Count along the sequence", src: "AS June 2025 · P2 Q03.1 · 1 mark",
      q: "The character Q has the binary representation 1010001 in ASCII. What is the binary representation of the character T in ASCII?",
      steps: [{ m: "T is three letters after Q: 1010001 + 11 = **1010100**", mk: "1 mark", n: "Letters, like digits, are coded in sequence — so code arithmetic works." }], result: "1010100" } },
    { worked: { tag: "variation", title: "Read a number typed as characters", q: "A user types \"472\". Write a C# loop that turns the three character codes into the integer 472 without using a library parse.",
      steps: [
        { m: "Each character's value is its code minus 48; build the number left to right with value = value × 10 + digit — the decimal twin of the hex algorithm in 4.5.2.1." },
        { m: "`int value = 0; foreach (char c in s) value = value * 10 + (c - '0');`", n: "c − '0' is c − 48: the character code to pure binary conversion." }
      ], result: "value = value × 10 + (c − 48)" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Explain how to convert", "One complete method: subtract 48, AND 00001111, or XOR 00110000."],
      ["What character / code", "Count from the anchor code given in the question."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"Zero is forty-eight\"", body: "'0' = 48 = 0110000; the digit is the last four bits." } },
    { callout: { t: "warn", h: "Specific errors", body: ["Treating the character code as the value.", "Subtracting 30 (that is hexadecimal 30 = 48 — fine only if you write 30₁₆).", "Saying \"convert to an integer\" without a method (NE.)."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.7.3.5 masking with AND / XOR; 4.5.5.2 ASCII; 4.1 programming — parsing input strings to numbers." } }
  ],
  flashcards: [
    ["ASCII code of '0'?", "48 (0110000)."],
    ["Character code vs pure binary of a digit?", "Code identifies the symbol ('8' = 56); pure binary is the value (8 = 00001000)."],
    ["Convert '8' (00111000) to 8?", "Subtract 48, or AND with 00001111."],
    ["00111001 as ASCII?", "'9'."],
    ["Why can't character codes be added as numbers?", "They are codes for symbols, not the values."],
    ["ASCII 'Q' = 1010001. 'T'?", "1010100."],
    ["Which bits of a digit's ASCII code hold its value?", "The low four bits."],
    ["'7' + '5' added as codes?", "108 — not 12."]
  ],
  quiz: [
    { q: "The ASCII code for '5' is", opts: ["53", "5", "48", "35"], ans: 0, why: "48 + 5." },
    { q: "To turn the code for a digit into its value", opts: ["subtract 48", "add 48", "multiply by 48", "shift left 4"], ans: 0, why: "Codes start at 48." },
    { q: "00110110 as an ASCII character is", opts: ["'6'", "'54'", "'V'", "'6' + 48"], ans: 0, why: "54 = 48 + 6." },
    { q: "ANDing a digit's code with 00001111", opts: ["keeps its value", "keeps the 0110", "inverts it", "doubles it"], ans: 0, why: "Masks off the high bits." }
  ]
};

/* =====================================================================
   4.5.5.2  ASCII and Unicode
   ===================================================================== */
C["compsci:4.5.5.2"] = {
  notes: [
    { h: "ASCII and Unicode — the whole topic on one page" },
    "Spec 4.5.5.2: describe **ASCII** and **Unicode** coding systems for coding character data and explain **why Unicode was introduced**.",
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Explain the term character code", "Explain", "1", "AS 2022 Q04.1"],
      ["Why was Unicode introduced?", "Explain", "2", "AS 2019 Q03.2, AS 2022 Q04.2"],
      ["One limitation of ASCII that Unicode overcomes", "State", "1", "AS 2025 Q03.2"],
      ["Discuss replacing ASCII with Unicode (and parity with majority voting)", "Discuss", "4", "A-level 2019 Q09.3"],
      ["What a circuit on ASCII codes detects (letters / capitals)", "Describe the purpose", "2", "A-level 2025 Q09.2"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**ASCII**.", "**Unicode**.", "**Comparing them**.", "**Exam toolkit**."] },

    { page: "ASCII" },
    { callout: { t: "def", h: "Character code", body: "A **character code** is a **(unique) number used to represent a character** in a character set. (R. \"a code\" — say what it is: a number.)" } },
    { kv: [
      ["ASCII", "American Standard Code for Information Interchange: a **7-bit** code — **128** characters (2⁷)"],
      ["Contents", "English letters (upper and lower case), digits, punctuation, space, and 32 non-printing control codes (e.g. 10 line feed, 13 carriage return)"],
      ["Layout", "in sequence: '0'–'9' = 48–57, 'A'–'Z' = 65–90, 'a'–'z' = 97–122"],
      ["Extended ASCII", "8-bit versions with 256 codes; codes 128–255 differ between **code pages** — the same code can mean different characters in different countries"]
    ] },
    { fig: { w: 520, h: 150, items: [].concat(
      [{ text: [130, 18], t: "'A' = 65", b: true, c: "accent", size: 12 }], cells("1000001", 30, 30, 28, "accent", [1]),
      [{ text: [390, 18], t: "'a' = 97", b: true, c: "accent3", size: 12 }], cells("1100001", 290, 30, 28, "accent3", [1]),
      [{ text: [260, 100], t: "bit 5 (value 32) is the case bit: 0 upper, 1 lower", b: true, c: "accent2", size: 12 }, { text: [260, 124], t: "codes 64–95 and 96–127 hold the letters; B6 = 1 for every letter", c: "text2", size: 11.5 }]
    ), cap: "Lower case = upper case + 32: the codes differ in one bit, which is why a logic circuit can test for letters and capitals." } },
    { worked: { tag: "exam", title: "Explain the term character code", src: "AS June 2022 · P2 Q04.1 · 1 mark",
      q: "ASCII is one character coding system. Explain the term 'character code'.",
      steps: [{ m: "A (unique) number used to represent a character.", mk: "1 mark", n: "R. \"a code\"." }], result: "A unique number representing a character" } },
    { worked: { tag: "exam", title: "The purpose of a circuit on ASCII codes", src: "A-level June 2025 · P2 Q09.2 · 2 marks",
      q: "A logic circuit takes the 7-bit ASCII code of a character (inputs B6 to B0) and has two outputs, Q1 and Q2. Its outputs for six characters are: * → Q1 0, Q2 0; @ → 0, 0; F → 1, 1; W → 1, 1; \\ → 0, 0; f → 1, 0. Describe the purpose of the outputs Q1 and Q2.",
      steps: [
        { m: "Q1 indicates whether the input character is a **letter** (1 = letter);", mk: "1 mark", n: "R. 0 indicates a letter." },
        { m: "Q2 indicates whether the character is an **upper case (capital)** letter (1 = capital);", mk: "1 mark", n: "NE. \"indicates not a lowercase letter\"." }
      ], result: "Q1: is a letter; Q2: is a capital" } },

    { page: "Unicode" },
    { kv: [
      ["Unicode", "a coding system intended to give **every character in every writing system** a **unique code point** — over 1.1 million possible, about 150 000 assigned"],
      ["Compatibility", "the first 128 code points are the same as ASCII"],
      ["Encodings", "**UTF-8** (8 to 32 bits per character — ASCII text stays 1 byte), **UTF-16** (16 or 32 bits), **UTF-32** (always 32 bits)"],
      ["Includes", "every language (Chinese, Arabic, Devanagari …), mathematical, scientific and engineering symbols, emoji"]
    ] },
    { callout: { t: "memorise", h: "Why Unicode was introduced (MAX 2)", body: [
      "to support a **larger range of characters** than 128/256;",
      "because of increased **international communication** / use of files in multiple countries — interchange of documents between countries; (concurrent) support for multiple languages; additional symbols (maths, emoji);",
      "so that each character code is **always interpreted as the same character** (no conflicting code pages);",
      "**NE.** \"use in other countries\" on its own."
    ] } },
    { worked: { tag: "exam", title: "Why was Unicode introduced?", src: "AS June 2022 · P2 Q04.2 · 2 marks",
      q: "Explain why Unicode was introduced as an alternative to ASCII.",
      steps: [
        { m: "To support a larger range of characters than ASCII's 128;", mk: "1 mark" },
        { m: "because increased international communication requires documents in many languages (and symbols such as mathematical characters and emoji) to be exchanged between countries, with each code always meaning the same character;", mk: "1 mark" }
      ], result: "More characters; international, consistent communication" } },
    { worked: { tag: "exam", title: "One limitation of ASCII", src: "AS June 2025 · P2 Q03.2 · 1 mark",
      q: "Unicode was introduced to overcome some of the limitations of ASCII. State one limitation of ASCII that Unicode overcomes.",
      steps: [{ m: "The number of different characters is limited to 128 (2⁷) // it assumes English as the language // it does not include international character sets (e.g. Chinese) or emoji.", mk: "1 mark" }], result: "Only 128 characters" } },

    { page: "Comparing them" },
    { table: { head: ["", "ASCII", "Unicode"], rows: [
      ["Bits per character", "7 (8 in extended)", "8 to 32 (UTF-8), 16/32 (UTF-16), 32 (UTF-32)"],
      ["Characters", "128 (256 extended)", "over 1.1 million code points"],
      ["Languages", "English only", "every writing system"],
      ["Consistency", "extended codes depend on the code page", "one code point = one character everywhere"],
      ["Storage / transmission", "compact", "more bits per character (except ASCII text in UTF-8)"],
      ["Compatibility", "—", "first 128 code points = ASCII"]
    ] } },
    { worked: { tag: "exam", title: "Discuss: majority voting and Unicode instead of parity and ASCII", src: "A-level June 2019 · P2 Q09.3 · 4 marks",
      q: "A data communication system uses asynchronous serial transmission with ASCII and a parity bit. It is proposed that a majority voting system is used instead of the parity bit, and Unicode instead of ASCII. Discuss the improvements that will occur and any disadvantages that will result.",
      steps: [
        { h: "Improvements (MAX 3)", m: "Errors can sometimes be **corrected** as well as detected (majority voting);", mk: "1 mark" },
        { m: "**multi-bit errors** (an even number of changed bits) can be detected;", mk: "1 mark" },
        { m: "a **greater range of characters** can be transmitted — multiple languages, specialised symbols; problems caused by different ASCII code pages are eliminated;", mk: "1 mark" },
        { h: "Disadvantages (MAX 3)", m: "each character needs **more bits** (8 to 32 in Unicode) and **each bit is sent several times** (redundancy), so the effective rate of useful data transmission is **reduced** (transmissions take longer).", mk: "1 mark", n: "\"Discuss\" — both sides are required for full marks. R. references to storage space." }
      ], result: "More reliable and international; slower" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Explain (character code)", "\"a unique number that represents a character\"."],
      ["Explain why Unicode", "Two distinct points: more characters; international communication / consistent meaning."],
      ["Discuss", "Improvements AND disadvantages, each a separate creditworthy point."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"ASCII: 7 bits, English only. Unicode: Universal.\"", body: "128 vs over a million; one country vs every language." } },
    { callout: { t: "warn", h: "Specific errors", body: ["\"ASCII is 8 bits\" — standard ASCII is 7 bits.", "\"Unicode is used in other countries\" (NE.) — say why: more characters, international communication.", "Claiming Unicode always uses 16 bits."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.5.3.1 2⁷ = 128; 4.5.5.3 parity bits pad ASCII to a byte; 4.8 consequences — Unicode supports cultural and linguistic inclusion; 4.9.4.2 HTTP and email declare the character encoding." } }
  ],
  flashcards: [
    ["What is a character code?", "A unique number used to represent a character."],
    ["How many bits in standard ASCII?", "7 (128 characters)."],
    ["Why was Unicode introduced? (two)", "More characters; international communication with consistent codes."],
    ["Unicode code points for the first 128 characters?", "The same as ASCII."],
    ["'A' and 'a' in ASCII?", "65 and 97 — differ only in bit 5 (32)."],
    ["Limitation of extended ASCII?", "Codes 128–255 depend on the code page — inconsistent between countries."],
    ["Bits per character in UTF-8?", "8 to 32."],
    ["Disadvantage of Unicode?", "More bits per character — larger files, slower transmission."]
  ],
  quiz: [
    { q: "Standard ASCII can represent", opts: ["128 characters", "256 characters", "65 536 characters", "1.1 million characters"], ans: 0, why: "7 bits." },
    { q: "A reason for Unicode is", opts: ["international communication with many languages", "ASCII is too slow", "Unicode uses fewer bits", "ASCII has no digits"], ans: 0, why: "Larger, consistent character set." },
    { q: "In ASCII, lower case letters differ from capitals by", opts: ["32", "26", "64", "1"], ans: 0, why: "Bit 5." },
    { q: "UTF-8 stores an ASCII character in", opts: ["1 byte", "2 bytes", "4 bytes", "7 bytes"], ans: 0, why: "Backward compatible." }
  ]
};

/* =====================================================================
   4.5.5.3  Error checking and correction
   ===================================================================== */
C["compsci:4.5.5.3"] = {
  notes: [
    { h: "Error checking and correction — the whole topic on one page" },
    "Spec 4.5.5.3: describe and explain the use of **parity bits**, **majority voting**, **checksums** and **check digits**.",
    "Asked on almost every AS paper and regularly at A-level — calculating a parity bit, spotting a corrupted byte, decoding a majority vote, and comparing the methods:",
    { table: { head: ["Question shape", "Command word", "Marks", "Seen in"], rows: [
      ["Calculate / write the parity bit", "Calculate / Write", "1", "AS 2017 Q02.5, AS 2022 Q04.4"],
      ["Describe how a parity bit is generated", "Describe / Explain", "2", "AS 2016 Q02.6, AS 2022 Q04.3"],
      ["Explain how the receiver detects errors", "Explain", "2", "AS 2020 Q10.3"],
      ["Find the byte received incorrectly", "Circle", "1", "AS 2023 Q04.3"],
      ["Valid asynchronous frames with parity", "How many", "1–3", "A-level 2019 Q09.2, 2023 Q10.1"],
      ["Explain majority voting", "Explain", "2", "AS 2016 Q02.7"],
      ["Decode a majority-voted byte", "Shade", "1", "AS 2020 Q01.3"],
      ["Majority voting vs parity: advantage / reasons for each", "State / Explain / Give", "1–2", "AS 2017 Q02.6, 2019 Q09.7, 2023 Q04.1–04.2"],
      ["Limitation of parity", "Describe", "1", "AS 2025 Q07.4, A-level 2023 Q10.3"],
      ["Parity with an XOR circuit", "State / Describe", "2–3", "AS 2025 Q07.1–07.3"],
      ["Check digits; checksums", "Explain / Outline", "2", "AS 2020 Q01.4, A-level 2023 Q02.2"]
    ] } },
    { h: "How these notes are organised" },
    { ol: ["**Parity bits**.", "**Parity in exam questions**.", "**Majority voting**.", "**Checksums and check digits**.", "**Comparing the methods**.", "**Exam toolkit**."] },

    { page: "Parity bits" },
    { callout: { t: "def", h: "Parity bit", body: "An extra bit added to a group of data bits so that the **total number of 1s** is **even** (even parity) or **odd** (odd parity), as agreed by sender and receiver. The receiver counts the 1s again: if the count has the wrong parity, an error has occurred." } },
    { steps: [
      { h: "Sender (even parity)", m: "1. Count the 1s in the data bits. 2. If the count is even, the parity bit is 0; if odd, it is 1 — so the total is even. (Equivalently: XOR all the data bits; the result is the even parity bit.)" },
      { h: "Receiver", m: "3. Count the 1s in the whole received byte (data + parity). 4. Even total → assumed correct; odd total → error detected — ask for retransmission." }
    ] },
    { fig: parityFig("0110100", "1", "A-level June 2019: the digit '4' (0110100) has three 1s, so the even parity bit is 1 — four 1s in all.", { note: "data 1s: 3 → parity 1 → total 4 (even)" }) },
    { callout: { t: "warn", h: "What parity cannot do", body: [
      "It **cannot detect an even number of changed bits** (two flips cancel out);",
      "it **cannot locate** the error, so it **cannot correct** it — the whole message must be resent."
    ] } },

    { page: "Parity in exam questions" },
    { worked: { tag: "exam", title: "How was this parity bit calculated?", src: "AS June 2016 · P2 Q02.6 · 2 marks",
      q: "In the bit pattern 00111001, the most significant (leftmost) bit is a parity bit. Explain how the sending device calculated its value, assuming even parity.",
      steps: [
        { m: "The number of 1s in the other 7 bits was counted — there are four;", mk: "1 mark" },
        { m: "four is even, so the parity bit was set to 0 (keeping the total number of 1s even);", mk: "1 mark", n: "Alternative: the 7 data bits are XORed; the result 0 is the parity bit." }
      ], result: "Four 1s → parity 0" } },
    { worked: { tag: "exam", title: "Calculate an odd parity bit", src: "AS June 2017 · P2 Q02.5 · 1 mark",
      q: "The 7-bit ASCII character 1001110 is to be transmitted. The system uses odd parity with the parity bit in the MSB. Calculate the parity bit.",
      steps: [{ m: "1001110 has four 1s (even), so for odd parity the parity bit is **1**", mk: "1 mark" }], result: "1" } },
    { worked: { tag: "exam", title: "Describe, then write, an even parity bit", src: "AS June 2022 · P2 Q04.3–04.4 · 3 marks",
      q: "The 7-bit ASCII character code 1010011 is to be sent across a network using a parity system. (a) Describe how the parity bit would be generated using even parity. (b) Write the parity bit.",
      steps: [
        { h: "(a)", m: "The number of 1s is counted; if the total is even, the parity bit is set to 0, otherwise to 1 (so the total number of 1s is even);", mk: "2 marks", n: "Or: the bits are XORed with each other; the result is the parity bit. MAX 2." },
        { h: "(b)", m: "1010011 has four 1s → **0**", mk: "1 mark" }
      ], result: "Parity bit 0" } },
    { worked: { tag: "exam", title: "How the receiver detects an error", src: "AS June 2020 · P2 Q10.3 · 2 marks",
      q: "A data transmission system uses even parity; each byte has seven data bits and one parity bit. Explain how the receiver will perform error detection on a received byte.",
      steps: [
        { m: "If the number of 1s in the received byte is even, the data is assumed to have been received correctly;", mk: "1 mark" },
        { m: "if the number of 1s is odd, the data has been corrupted;", mk: "1 mark" }
      ], result: "Count the 1s: even OK, odd error" } },
    { worked: { tag: "exam", title: "Which byte arrived corrupted?", src: "AS June 2023 · P2 Q04.3 · 1 mark",
      q: "Each byte contains a 7-bit ASCII code with a parity bit; odd parity was used with the parity bit leftmost. Received: 01010010 01000001 11001101. Circle the byte the system calculates has been received incorrectly.",
      steps: [{ h: "Count the 1s in each byte", m: "01010010 → 3 (odd ✓); 01000001 → 2 (even ✗); 11001101 → 5 (odd ✓)" }, { m: "The **second byte, 01000001**", mk: "1 mark" }], result: "01000001" } },
    { worked: { tag: "exam", title: "A full asynchronous frame for '4'", src: "A-level June 2019 · P2 Q09.2 · 3 marks",
      q: "The ASCII code for the digit '0' is 48 in decimal; other digits follow in sequence. The digit '4' is transmitted using asynchronous serial transmission and even parity, the parity bit in the most significant bit of the data byte. Complete the frame: start bit, parity bit, ASCII code, stop bit.",
      steps: [
        { m: "Start bit and stop bit with **opposite values** (e.g. start 1, stop 0);", mk: "1 mark", n: "Synoptic: 4.9.1.1 asynchronous transmission." },
        { m: "ASCII code for '4' = 52 = **0110100**;", mk: "1 mark" },
        { m: "three 1s → even parity bit **1**;", mk: "1 mark" }
      ], result: "start | 1 0110100 | stop" } },
    { worked: { tag: "exam", title: "How many frames are valid?", src: "A-level June 2023 · P2 Q10.1 · 1 mark",
      q: "An asynchronous system sends 7-bit ASCII with even parity: each 10-bit pattern is start bit, 7 data bits, parity bit, stop bit. Patterns: (1) 1011101101 (2) 1101111000 (3) 0100001110 (4) 1011110000 (5) 1100000100. How many could be valid transmissions of a single character?",
      steps: [
        { h: "Two tests", m: "start bit ≠ stop bit; the eight middle bits have an even number of 1s" },
        { m: "(1) start = stop ✗; (2) five 1s ✗; (3) start = stop ✗; (4) four 1s ✓; (5) two 1s ✓" },
        { m: "**2**", mk: "1 mark" }
      ], result: "2" } },
    { worked: { tag: "exam", title: "A parity circuit of XOR gates", src: "AS June 2025 · P2 Q07.1–07.4 · 8 marks",
      q: "A circuit of three gates of the same type computes a parity bit for a 4-bit message; for 1001 it outputs 0. (a) Name the gate type and explain its operation. (b) State the type of parity computed, with a reason. (c) Alice sends a 4-bit message to Bob with a parity bit: describe how, and how Bob detects an error, stating when each uses the circuit. (d) Describe one limitation of a parity bit.",
      steps: [
        { h: "(a)", m: "**XOR**;", mk: "1 mark" },
        { m: "outputs 1 when its inputs are different (one 1 and one 0);", mk: "1 mark" },
        { h: "(b)", m: "**Even** parity;", mk: "1 mark" },
        { m: "it outputs 0 when the number of 1s in the input is even (1001 → 0);", mk: "1 mark" },
        { h: "(c)", m: "Alice feeds the 4-bit message into her circuit to produce the parity bit;", mk: "1 mark" },
        { m: "the parity bit is appended to the message and the 5 bits are transmitted;", mk: "1 mark" },
        { m: "Bob separates the message, feeds the 4 bits into his copy of the circuit and compares its output with the received parity bit — a difference means an error;", mk: "1 mark" },
        { h: "(d)", m: "Errors that change an even number of bits are not detected // the position of an error cannot be found, so the whole message must be resent.", mk: "1 mark" }
      ], result: "XOR; even parity" } },
    { fig: { w: 500, h: 170, items: [
      { text: [30, 34], t: "B3", b: true, c: "text" }, { text: [30, 64], t: "B2", b: true, c: "text" }, { text: [30, 104], t: "B1", b: true, c: "text" }, { text: [30, 134], t: "B0", b: true, c: "text" },
      { line: [[44, 34], [120, 40]], c: "text2" }, { line: [[44, 64], [120, 58]], c: "text2" }, { line: [[44, 104], [120, 110]], c: "text2" }, { line: [[44, 134], [120, 128]], c: "text2" },
      { poly: [[120, 30], [160, 30], [175, 49], [160, 68], [120, 68]], fill: "accent", alpha: 0.18, c: "accent", w: 1.6 }, { text: [146, 49], t: "XOR", b: true, size: 11, c: "text" },
      { poly: [[120, 100], [160, 100], [175, 119], [160, 138], [120, 138]], fill: "accent", alpha: 0.18, c: "accent", w: 1.6 }, { text: [146, 119], t: "XOR", b: true, size: 11, c: "text" },
      { line: [[175, 49], [270, 76]], c: "text2" }, { line: [[175, 119], [270, 92]], c: "text2" },
      { poly: [[270, 65], [310, 65], [325, 84], [310, 103], [270, 103]], fill: "accent2", alpha: 0.2, c: "accent2", w: 1.6 }, { text: [296, 84], t: "XOR", b: true, size: 11, c: "text" },
      { line: [[325, 84], [400, 84]], arrow: true, c: "accent2", w: 2 }, { text: [450, 84], t: "parity", b: true, c: "accent2" }
    ], cap: "Three XOR gates compute the even parity bit of four bits: XOR is 1 exactly when an odd number of its inputs are 1." } },

    { page: "Majority voting" },
    { callout: { t: "def", h: "Majority voting", body: "Each bit is transmitted an **odd number of times (at least three)**. The receiver looks at each group: if the copies are not all the same, it **assumes the value it received the most copies of** is the bit that was sent. It can therefore **correct** (some) errors, not just detect them." } },
    { fig: { w: 520, h: 120, items: (function () {
      var r = "111000000110001101111011", it = [];
      for (var g = 0; g < 8; g++) {
        var grp = r.substr(g * 3, 3), ones = (grp.match(/1/g) || []).length, bit = ones >= 2 ? "1" : "0";
        var x = 14 + g * 62;
        it = it.concat(cells(grp, x, 20, 18, "accent"));
        it.push({ text: [x + 27, 80], t: "→ " + bit, b: true, c: grp === "000" || grp === "111" ? "text" : "accent2", size: 13 });
      }
      it.push({ text: [260, 106], t: "received 24 bits → byte 10010111", b: true, c: "accent2", size: 12 });
      return it;
    })(), cap: "AS June 2020: each bit sent three times. Groups 110, 001 and 101 disagree — the majority wins." } },
    { worked: { tag: "exam", title: "Explain majority voting", src: "AS June 2016 · P2 Q02.7 · 2 marks",
      q: "Majority voting is an alternative to using parity bits. Explain how the majority voting system works in the context of data transmission.",
      steps: [
        { h: "AO1 knowledge", m: "Each bit is sent multiple times (an odd number greater than 2, e.g. three times);", mk: "1 mark" },
        { h: "AO1 understanding", m: "the receiver checks the copies; if they are not all the same it assumes the value it received most often is the correct value of the bit;", mk: "1 mark", n: "R. \"the receiver knows the bit is correct\" — it only assumes." }
      ], result: "Odd number of copies; majority taken" } },
    { worked: { tag: "exam", title: "Decode a majority-voted byte", src: "AS June 2020 · P2 Q01.3 · 1 mark",
      q: "One byte is transmitted with majority voting. Received: 111 000 000 110 001 101 111 011. Shade the byte the receiver will assume was sent: A 10010011; B 10011011; C 10010111; D 10011110.",
      steps: [{ m: "Majorities: 1 0 0 1 0 1 1 1 → **C (10010111)**", mk: "1 mark" }], result: "C" } },
    { worked: { tag: "exam", title: "Five copies, not four", src: "AS June 2023 · P2 Q04.1 · 1 mark",
      q: "Explain why it is better for a majority voting system to send each bit five times instead of four.",
      steps: [{ m: "With five copies there is always a majority; with four, a bit could be received as two 0s and two 1s, giving no majority (five can also correct two changed copies).", mk: "1 mark" }], result: "An odd count guarantees a majority" } },

    { page: "Checksums and check digits" },
    { kv: [
      ["Checksum", "a value **calculated from the data / payload** of a block or packet (e.g. a sum, or a hash) and transmitted with it; the receiver recalculates it from the received data and compares — a mismatch shows the data has been **changed during transmission**"],
      ["Check digit", "an extra **digit calculated (by an algorithm) from the other digits** of a number, usually appended to it (ISBN, barcode, bank card); used to detect **data entry / transcription errors** such as a mistyped or transposed digit"]
    ] },
    { worked: { tag: "exam", title: "What is a check digit?", src: "AS June 2020 · P2 Q01.4 · 2 marks",
      q: "A check digit can be used to detect errors when data are entered or transmitted. Explain what a check digit is and outline how the check digit is generated.",
      steps: [{ m: "A check digit is a digit calculated (using an algorithm);", mk: "1 mark" }, { m: "from the other digits / letters in the input sequence (and appended to it);", mk: "1 mark", n: "A. answer by example." }], result: "A digit computed from the other digits" } },
    { worked: { tag: "exam", title: "What the checksum in a packet is for", src: "A-level June 2023 · P2 Q02.2 · 2 marks",
      q: "A network packet has fields Destination address, Source address, Payload (data) and Checksum. Explain what the checksum is used for and outline how its value will be determined.",
      steps: [
        { h: "Used for", m: "to check whether the contents of the packet have been corrupted / changed during transmission;", mk: "1 mark", n: "NE. \"error checking\"; NE. \"to correct errors\"." },
        { h: "Determined by", m: "calculating it from the payload / data (e.g. applying a hash function, or summing the bytes);", mk: "1 mark" }
      ], result: "Detect changed data; computed from the payload" } },
    { worked: { tag: "variation", title: "A modulo-11 check digit", q: "An ISBN-10 is checked by weights 10, 9, …, 1: the weighted sum must be divisible by 11. Find the check digit of 0-306-40615-?.",
      steps: [
        { m: "0×10 + 3×9 + 0×8 + 6×7 + 4×6 + 0×5 + 6×4 + 1×3 + 5×2 = 0 + 27 + 0 + 42 + 24 + 0 + 24 + 3 + 10 = 130" },
        { m: "130 + d ≡ 0 (mod 11) → d = 2 (132 = 12 × 11) → ISBN **0-306-40615-2**", n: "Swapping two adjacent digits changes the weighted sum, so transposition errors are caught — a plain sum would miss them." }
      ], result: "2" } },

    { page: "Comparing the methods" },
    { table: { head: ["", "Parity bit", "Majority voting", "Checksum", "Check digit"], rows: [
      ["Detects", "odd number of flipped bits", "most errors in a group", "most changes to a block", "typing / transposition errors"],
      ["Corrects?", "no", "**yes** (most)", "no", "no"],
      ["Locates the error?", "no", "yes (the bit)", "no", "no"],
      ["Overhead", "1 bit per byte", "×3 or ×5 the data", "one value per block", "one digit"],
      ["Weakness", "misses even numbers of errors", "slow, costly bandwidth", "some changes can cancel", "data entry only"]
    ] } },
    { worked: { tag: "exam", title: "An advantage of majority voting, explained", src: "AS June 2017 · P2 Q02.6 · 2 marks",
      q: "When transmitting data across a network some systems use majority voting rather than a parity bit. State one advantage of majority voting over a parity bit and explain how this advantage is achieved.",
      steps: [
        { h: "Advantage (AO1 knowledge)", m: "Majority voting can **correct** as well as identify errors;", mk: "1 mark" },
        { h: "How (AO1 understanding)", m: "because the value received the majority of times is taken as correct and the minority value is discounted;", mk: "1 mark", n: "Or: it detects multi-bit errors, because each group of copies represents one bit. The understanding mark needs the knowledge mark." }
      ], result: "Corrects errors — majority taken" } },
    { worked: { tag: "exam", title: "Two reasons to prefer parity", src: "AS June 2023 · P2 Q04.2 · 2 marks",
      q: "Give two reasons why using a parity bit system might be preferred to using majority voting when transmitting data.",
      steps: [
        { m: "Data can be transmitted more quickly / using less bandwidth (far fewer bits are sent);", mk: "1 mark" },
        { m: "it may be more efficient to retransmit the occasional corrupted data than to send multiple copies of everything // transmitting multiple copies may be costly;", mk: "1 mark" }
      ], result: "Less data; retransmission is cheaper" } },
    { worked: { tag: "exam", title: "A limitation of parity bits", src: "A-level June 2023 · P2 Q10.3 · 1 mark",
      q: "Describe one limitation of the use of parity bits for managing errors.",
      steps: [{ m: "Errors that change an even number of bits (e.g. two) cannot be detected // errors can be detected but not corrected (their position cannot be identified).", mk: "1 mark", n: "R. \"multi-bit errors cannot be identified\" — three flipped bits are detected." }], result: "Even number of errors undetected" } },

    { page: "Exam toolkit" },
    { table: { head: ["Command word", "What earns the mark"], rows: [
      ["Calculate / Write the parity bit", "Count the data 1s; choose the bit that makes the total even/odd as specified."],
      ["Describe how it is generated", "Count the 1s (or XOR the bits) AND the rule for setting the bit."],
      ["Explain majority voting", "Sent an odd number (≥3) of times + the receiver assumes the majority value."],
      ["State an advantage … and explain how", "Knowledge point, then the mechanism that delivers it."],
      ["Give two reasons", "Two distinct points — not one point reworded."]
    ] } },
    MS_KEY,
    { callout: { t: "mnemonic", h: "\"Parity Detects, Majority Mends\"", body: "Parity detects (odd numbers of) errors; majority voting mends them. Checksums check blocks; check digits check typing." } },
    { callout: { t: "warn", h: "Specific errors", body: ["\"The receiver knows the data is correct\" (R.) — it assumes.", "Including the parity bit when counting data 1s to generate it.", "Majority voting with an even number of copies.", "\"Checksum = error checking\" (NE.) — say it is calculated from the data and compared."] } },
    { callout: { t: "tip", h: "Synoptic links", body: "4.6.4.1 XOR gates compute parity; 4.7.3.5 an assembly program that sets a parity bit (A-level 2024 Q10); 4.9.1.1 asynchronous frames; 4.9.2.3 wireless transmission with majority voting (AS 2019 Q09.6); 4.9.4.1 TCP checksums." } }
  ],
  flashcards: [
    ["What is a parity bit?", "An extra bit making the number of 1s even (or odd) as agreed."],
    ["Even parity bit for 1010011?", "0 (four 1s)."],
    ["Odd parity bit for 1001110?", "1."],
    ["How does the receiver use even parity?", "Counts the 1s; odd total = error."],
    ["Two limitations of parity?", "Misses even numbers of flipped bits; cannot locate/correct errors."],
    ["How does majority voting work?", "Each bit sent an odd number (≥3) of times; receiver assumes the majority value."],
    ["Advantage of majority voting?", "It can correct errors."],
    ["Disadvantage of majority voting?", "Several times the data — slower, more bandwidth."],
    ["What is a checksum?", "A value calculated from the data, sent with it and recalculated to detect changes."],
    ["What is a check digit?", "A digit calculated from the other digits of a number to detect entry errors."],
    ["Gate that computes parity?", "XOR."]
  ],
  quiz: [
    { q: "Even parity bit for 1100101", opts: ["0", "1", "either", "2"], ans: 0, why: "Four 1s." },
    { q: "Which error does even parity miss?", opts: ["two flipped bits", "one flipped bit", "three flipped bits", "a flipped parity bit"], ans: 0, why: "Count stays even." },
    { q: "Received 101 (majority voting) means", opts: ["1", "0", "error", "resend"], ans: 0, why: "Two 1s." },
    { q: "A check digit is mainly used to detect", opts: ["data entry errors", "network collisions", "overflow", "viruses"], ans: 0, why: "Typing and transposition." },
    { q: "Majority voting sends each bit", opts: ["an odd number of times (≥3)", "twice", "once with a parity bit", "four times"], ans: 0, why: "Guarantees a majority." }
  ]
};

/* the exam-tagged worked cards above are this section's past-paper
   practice: derive the self-marking exam items from them once */
Object.keys(C).forEach(function (k) {
  if (before.indexOf(k) >= 0 || !window.KOS || !KOS.content) return;
  C[k].exam = (C[k].exam || []).concat(KOS.content.examFromWorked(C[k].notes, "AQA"));
});
})(window.KOS_CONTENT);
