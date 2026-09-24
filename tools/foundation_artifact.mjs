/* tools/foundation_artifact.mjs — package design/foundation.html for review.

   The specimen is a standalone page in the repository that links the real
   layers as ../css/*.css. A published review page is served from one flat
   folder and wrapped in its host's own document skeleton, so this writes a
   copy whose stylesheet links point at css/*.css beside it, with the outer
   <!DOCTYPE>/<html>/<head>/<body> tags removed (their contents kept), plus
   the two stylesheets it links. Nothing else changes.

     node tools/foundation_artifact.mjs <out-dir>                            */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = process.argv[2];
if (!out) { console.error("usage: node tools/foundation_artifact.mjs <out-dir>"); process.exit(1); }

let html = await readFile(path.join(ROOT, "design/foundation.html"), "utf8");
html = html
  .replace(/^<!DOCTYPE html>\s*/i, "")
  .replace(/<html[^>]*>\s*/i, "")
  .replace(/<\/?head>\s*/gi, "")
  .replace(/<meta charset[^>]*>\s*/i, "")
  .replace(/<meta name="viewport"[^>]*>\s*/i, "")
  .replace(/<body[^>]*>\s*/i, "")
  .replace(/\s*<\/body>\s*<\/html>\s*$/i, "\n")
  .replace(/href="\.\.\/css\//g, 'href="css/');

const sheets = [...html.matchAll(/href="(css\/[^"]+)"/g)].map((m) => m[1]);
await mkdir(path.join(out, "css"), { recursive: true });
await writeFile(path.join(out, "foundation.html"), html);
for (const s of sheets) await writeFile(path.join(out, s), await readFile(path.join(ROOT, s), "utf8"));
console.log(`packaged foundation.html + ${sheets.join(", ")} → ${out}`);
