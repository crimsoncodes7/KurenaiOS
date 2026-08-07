#!/usr/bin/env node
/* Validate the Krita redraw scaffold against layer-map.json.
 *
 *   node tools/validate_live2d_scaffold.mjs [path.kra]
 *
 * A .kra is a zip whose maindoc.xml carries the whole layer tree, so this
 * reads the archive directly - no Krita required, which keeps the check
 * runnable in CI and alongside the other validators.
 *
 * The scaffold is a starting canvas: this asserts STRUCTURE (every
 * contract layer present, correct group, correct back-to-front order,
 * correct canvas) and deliberately does NOT assert that any layer has
 * been painted. Redraw progress is tracked by the artist, not here.
 */
import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LIVE2D = path.join(ROOT, "art-source/assistant/live2d");
const REF_LAYER = "REF_Master_4096_NO_EXPORT";
const GUIDE_GROUP = "00_GUIDES_NO_EXPORT";

const target = process.argv[2]
  || path.join(LIVE2D, "source/kurenai-live2d-scaffold-4096-v1.kra");

const fail = [];
function check(ok, msg) { if (!ok) fail.push(msg); }

if (!existsSync(target)) {
  console.error(`SCAFFOLD FAIL - not found: ${path.relative(ROOT, target)}`);
  console.error("Build it with: tools/build_live2d_scaffold.sh");
  process.exit(1);
}

const map = JSON.parse(readFileSync(path.join(LIVE2D, "layer-map.json"), "utf8"));

/* unzip -p keeps this dependency-free; jsdom-based suites already assume a
   POSIX toolchain, and .kra is always a stored/deflated zip. */
const xml = execFileSync("unzip", ["-p", target, "maindoc.xml"], {
  encoding: "utf8", maxBuffer: 1 << 24
});

const image = /<IMAGE\b([^>]*)>/.exec(xml);
check(!!image, "maindoc.xml has no <IMAGE> element");
const attr = (src, name) => {
  const m = new RegExp(`${name}="([^"]*)"`).exec(src);
  return m ? m[1] : null;
};
if (image) {
  const w = Number(attr(image[1], "width"));
  const h = Number(attr(image[1], "height"));
  check(w >= map.canvas.minimumWidth,
    `canvas width ${w} < required ${map.canvas.minimumWidth}`);
  check(h >= map.canvas.minimumHeight,
    `canvas height ${h} < required ${map.canvas.minimumHeight}`);
  check(attr(image[1], "colorspacename") === "RGBA",
    `colorspace is ${attr(image[1], "colorspacename")}, expected RGBA`);
}

/* Walk <layers>…</layers> nesting. Krita writes each group's children
   inside its own <layers> block, and writes them TOP-FIRST - the reverse
   of groupsBackToFront - so every sibling list is flipped after parsing. */
function parseTree(src) {
  const tokens = src.matchAll(/<(\/?)(layers|layer)\b([^>]*?)(\/?)>/g);
  const rootNodes = [];
  const stack = [{ children: rootNodes }];
  let pending = null;
  for (const t of tokens) {
    const [, closing, tag, attrs, selfClose] = t;
    if (tag === "layer") {
      if (closing) continue;
      const node = {
        name: attr(attrs, "name"),
        type: attr(attrs, "nodetype"),
        visible: attr(attrs, "visible") === "1",
        children: []
      };
      stack[stack.length - 1].children.push(node);
      pending = selfClose ? null : node;
    } else if (!closing) {
      /* The document's own root <layers> has no pending group; descending
         into the current level keeps the top-level nodes attached. */
      stack.push(pending || stack[stack.length - 1]);
      pending = null;
    } else if (stack.length > 1) {
      stack.pop();
    }
  }
  const flip = (nodes) => {
    nodes.reverse();
    for (const n of nodes) flip(n.children);
    return nodes;
  };
  return flip(rootNodes);
}

const tree = parseTree(xml);
const groups = tree.filter((n) => n.type === "grouplayer");

check(groups.length === map.groupsBackToFront.length,
  `${groups.length} groups, expected ${map.groupsBackToFront.length}`);

const gotGroupOrder = groups.map((g) => g.name).join("|");
const wantGroupOrder = map.groupsBackToFront.join("|");
check(gotGroupOrder === wantGroupOrder,
  `group order is not back-to-front\n  got:  ${gotGroupOrder}\n  want: ${wantGroupOrder}`);

const byGroup = new Map();
for (const layer of map.layers) {
  if (!byGroup.has(layer.group)) byGroup.set(layer.group, []);
  byGroup.get(layer.group).push(layer);
}

let seen = 0;
for (const group of groups) {
  const want = (byGroup.get(group.name) || []).map((l) => l.id);
  let got = group.children.filter((n) => n.type === "paintlayer").map((n) => n.name);

  if (group.name === GUIDE_GROUP) {
    check(got[0] === REF_LAYER,
      `${REF_LAYER} must be the bottom layer of ${GUIDE_GROUP}, found ${got[0]}`);
    got = got.filter((n) => n !== REF_LAYER);
  } else {
    check(!got.includes(REF_LAYER), `${REF_LAYER} leaked into ${group.name}`);
  }

  seen += got.length;
  if (got.join("|") !== want.join("|")) {
    const missing = want.filter((n) => !got.includes(n));
    const extra = got.filter((n) => !want.includes(n));
    if (missing.length) fail.push(`${group.name}: missing ${missing.join(", ")}`);
    if (extra.length) fail.push(`${group.name}: unexpected ${extra.join(", ")}`);
    if (!missing.length && !extra.length) {
      fail.push(`${group.name}: wrong order\n  got:  ${got.join("|")}\n  want: ${want.join("|")}`);
    }
  }
}

check(seen === map.layers.length,
  `${seen} contract layers in scaffold, expected ${map.layers.length}`);

/* ALT_* variants and optional effects must ship hidden so the neutral
   pose is what Cubism imports first (README PSD preparation contract). */
const visibility = new Map();
for (const group of groups) {
  for (const node of group.children) visibility.set(node.name, node.visible);
}
for (const layer of map.layers) {
  if (!layer.variant && !layer.optional) continue;
  check(visibility.get(layer.id) === false,
    `${layer.id} is a ${layer.variant ? "variant" : "optional"} layer and must start hidden`);
}

const exportable = map.layers.filter((l) => l.export !== false);
const required = exportable.filter((l) => !l.optional);
const freeCore = required.filter((l) => !l.freeMergeInto);

if (fail.length) {
  console.error("SCAFFOLD FAIL");
  for (const f of fail) console.error("  - " + f);
  process.exit(1);
}

console.log(
  `SCAFFOLD PASS - ${map.layers.length} contract layers in ${groups.length} groups, `
  + `back-to-front order verified, ${required.length} required / ${freeCore.length} FREE-core `
  + `ArtMeshes, reference + construction guides in place, variants hidden.`
);
