/* tools/lib/css.js — the stylesheet the smoke suites assert against (UI rebuild M1).

   Suites used to read css/main.css by name, which tied every CSS contract to
   one file of the old presentation layer. They now read THE stylesheet: every
   local sheet index.html links, concatenated in cascade order. Today that is
   css/main.css alone; as the rebuild splits the layer into tokens, base,
   layout, components and views, the same assertions run over the new files
   without any suite naming a file.

     readCss()        the concatenated source, comments included
     stylesheets()    the local sheet paths, in link order                  */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");

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

module.exports = { readCss, stylesheets };
