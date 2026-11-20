#!/usr/bin/env node
/* tools/gen_service_icons.mjs — the Collection's service icons (1C,
   collection#1/#2, decision D1): one small SVG per service that
   js/modules/watchlink.js names with a slug, made from the CC0 Simple Icons
   set as a tile in the brand's colour with the mark in white (or near-black
   on a light brand colour), so every icon reads in every theme. Written to
   assets/icons/services/<slug>.svg, with docs/service-icons.md crediting
   the set (kept out of assets/: the deploy ships no .md).

     npm pack simple-icons && tar -xzf simple-icons-*.tgz   (anywhere; never run it)
     node tools/gen_service_icons.mjs --from <that package folder>
     node tools/gen_service_icons.mjs --check     every named slug has its file */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "assets/icons/services");
const src = fs.readFileSync(path.join(ROOT, "js/modules/watchlink.js"), "utf8");
const block = /var SERVICES = \[([\s\S]*?)\]\.map/.exec(src)[1];
const slugs = [...block.matchAll(/"([a-z0-9]+)\|/g)].map((m) => m[1]);

if (process.argv.includes("--check")) {
  const missing = slugs.filter((s) => !fs.existsSync(path.join(OUT, s + ".svg")));
  if (missing.length) { console.error("gen_service_icons: no icon for " + missing.join(", ")); process.exit(1); }
  console.log("gen_service_icons: all " + slugs.length + " service icons are present");
  process.exit(0);
}
const at = process.argv.indexOf("--from");
if (at < 0 || !process.argv[at + 1]) { console.error("usage: node tools/gen_service_icons.mjs --from <simple-icons package folder> | --check"); process.exit(2); }
const pkg = path.resolve(process.argv[at + 1]);
const meta = JSON.parse(fs.readFileSync(path.join(pkg, "data/simple-icons.json"), "utf8"));
const version = JSON.parse(fs.readFileSync(path.join(pkg, "package.json"), "utf8")).version;
const bySlug = new Map(meta.map((m) => [m.slug, m]));
/* relative luminance of a #RRGGBB, for the mark's colour */
function lum(hex) {
  const c = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
fs.mkdirSync(OUT, { recursive: true });
const made = [];
for (const slug of slugs) {
  const m = bySlug.get(slug);
  const file = path.join(pkg, "icons", slug + ".svg");
  if (!m || !fs.existsSync(file)) { console.error("gen_service_icons: Simple Icons " + version + " has no " + slug); process.exit(1); }
  const d = /<path d="([^"]+)"/.exec(fs.readFileSync(file, "utf8"))[1];
  if (!/^[MmLlHhVvCcSsQqTtAaZz0-9.,\s-]+$/.test(d)) { console.error("gen_service_icons: unexpected path data in " + slug); process.exit(1); }
  const ink = lum(m.hex) > 0.45 ? "#111111" : "#FFFFFF";
  fs.writeFileSync(path.join(OUT, slug + ".svg"),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#${m.hex}"/><rect x=".5" y=".5" width="31" height="31" rx="6.5" fill="none" stroke="#FFFFFF" stroke-opacity=".14"/><path transform="translate(6 6) scale(.8333)" fill="${ink}" d="${d}"/></svg>\n`);
  made.push(`- \`${slug}.svg\`: ${m.title}`);
}
fs.writeFileSync(path.join(ROOT, "docs/service-icons.md"), `# Service icons

The Collection's service icons in \`assets/icons/services/\`, made by \`tools/gen_service_icons.mjs\` from [Simple Icons](https://simpleicons.org) ${version}, released under
CC0 1.0 (public domain): each brand's mark in white (or near-black) on a tile of its own colour. The marks are the
trademarks of their owners, shown only to name the service a link opens. Do not edit these files by hand; add a
service to \`SERVICES\` in \`js/modules/watchlink.js\` and run the tool again.

${made.join("\n")}
`);
console.log("gen_service_icons: wrote " + made.length + " icons from Simple Icons " + version);
