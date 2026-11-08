import fs from 'node:fs';

const fullLog = "/Users/fj/.gemini/antigravity/brain/f0fb8560-a4df-48e1-818a-dc57c75788eb/.system_generated/logs/transcript_full.jsonl";
const lines = fs.readFileSync(fullLog, "utf-8").trim().split("\n");
const step147 = JSON.parse(lines[147]);
const tc = step147.tool_calls.find(t => t.name === "send_message");
let msg = tc.args.Message;

// Replace \' with '
let cleaned = msg.replaceAll("\\'", "'");
const parsed = JSON.parse(cleaned);
fs.writeFileSync("docs/audit/2026-11/gemini/evidence/batch3a_results.json", JSON.stringify(parsed, null, 2));
console.log("Successfully wrote batch3a_results.json! Item count:", parsed.length);
