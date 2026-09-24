/* tools/lib/css.js — the stylesheet the smoke suites assert against (UI rebuild).

   Suites used to read css/main.css by name, which tied every CSS contract to
   one file of the old presentation layer. They read THE stylesheet instead:
   every local sheet index.html links, concatenated in cascade order. Since
   M2 that is the layer files (tokens, base, layout, components, views/*,
   themes), and the same assertions run over them without naming a file.

     readCss()          the concatenated source, comments included
     stylesheets()      the local sheet paths, in link order
     LAYERS             layer name → file ("views/study" → css/views/study.css)
     layerCss(name)     one layer file's source
     hasRules(name)     does that layer declare anything yet?
     pending(name, what)
                        the gate for a DESIGN CONTRACT whose layer is still
                        empty. M2 deleted the legacy stylesheet, so a contract
                        (16px phone inputs, safe-area insets, the z-scale, the
                        reduced-motion guards …) has nothing to hold until the
                        milestone that writes its layer. It is not deleted and
                        not skipped by hand: it waits, prints that it waits,
                        and switches itself on the moment its layer gains a
                        rule. docs/ui-rebuild/css-assertions.md lists each
                        contract's owner.                                  */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");

const LAYERS = {
  tokens: "css/tokens.css",
  base: "css/base.css",
  layout: "css/layout.css",
  components: "css/components.css",
  "views/home": "css/views/home.css",
  "views/study": "css/views/study.css",
  "views/productivity": "css/views/productivity.css",
  "views/collection": "css/views/collection.css",
  "views/governor": "css/views/governor.css",
  "views/assistant": "css/views/assistant.css",
  "views/archive": "css/views/archive.css",
  "views/labs": "css/views/labs.css",
  themes: "css/themes.css"
};

function stylesheets(root = ROOT) {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  return [...html.matchAll(/<link[^>]*\brel="stylesheet"[^>]*\bhref="([^"]+)"/g)]
    .map((m) => m[1])
    .filter((href) => !/^(?:https?:)?\/\//.test(href));
}

function readCss(root = ROOT) {
  return stylesheets(root)
    .map((href) => fs.readFileSync(path.join(root, href), "utf8"))
    .join("\n");
}

function layerCss(name, root = ROOT) {
  const file = LAYERS[name];
  if (!file) throw new Error("unknown layer " + name + " — one of " + Object.keys(LAYERS).join(", "));
  const full = path.join(root, file);
  return fs.existsSync(full) ? fs.readFileSync(full, "utf8") : "";
}

/* a layer "has rules" once any block in it holds a declaration; the layer
   order statement and an empty @layer wrapper do not count */
function hasRules(name, root = ROOT) {
  const src = layerCss(name, root).replace(/\/\*[\s\S]*?\*\//g, "");
  return /\{[^{}]*[\w-]\s*:[^{}]*\}/.test(src);
}

const announced = new Set();
function pending(name, what, root = ROOT) {
  if (hasRules(name, root)) return false;
  const key = name + "|" + what;
  if (!announced.has(key)) {
    announced.add(key);
    console.log(`  wait  ${what} — pending until ${LAYERS[name]} has rules`);
  }
  return true;
}

module.exports = { readCss, stylesheets, LAYERS, layerCss, hasRules, pending };
