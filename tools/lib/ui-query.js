/* tools/lib/ui-query.js — how the smoke suites find the DOM (UI rebuild M1).

   Tests address the interface by its behavioural contract, never by a
   presentation class (docs/ui-rebuild/view-contracts.md §0.1):

     hook("vault.card")          → '[data-ui~="vault.card"]'
     ui(root, "vault.card")      first element with that hook
     uiAll(root, "vault.card")   every element with that hook, as an array
     hasHook(node, name)         does this node carry the hook?
     hasState(node, word)        does data-state carry the word?
     byName(root, "Save")        the first control whose accessible name
                                 matches (string = contains, RegExp = test)
     allByName(root, /Delete/)   every such control

   A control is a button, a link, an input button, or anything with an
   interactive ARIA role. Its accessible name is aria-label, else the text of
   aria-labelledby, else its text content, else title/value — the same order
   a screen reader would use, simplified for jsdom.                        */
"use strict";

const hook = (name) => `[data-ui~="${name}"]`;
const state = (word) => `[data-state~="${word}"]`;
const intent = (word) => `[data-intent~="${word}"]`;

function tokens(node, attr) {
  const v = node && node.getAttribute ? node.getAttribute(attr) : null;
  return v ? v.trim().split(/\s+/) : [];
}
const hasHook = (node, name) => tokens(node, "data-ui").includes(name);
const hasState = (node, word) => tokens(node, "data-state").includes(word);
const ui = (root, name) => root.querySelector(hook(name));
const uiAll = (root, name) => [...root.querySelectorAll(hook(name))];

const CONTROL = 'button, a[href], input[type="button"], input[type="submit"], [role="button"], ' +
  '[role="tab"], [role="menuitem"], [role="option"], [role="switch"], [role="checkbox"], [role="radio"]';

function accessibleName(node) {
  if (!node) return "";
  const label = node.getAttribute("aria-label");
  if (label) return label.trim();
  const by = node.getAttribute("aria-labelledby");
  if (by) {
    const doc = node.ownerDocument;
    const text = by.split(/\s+/).map((id) => {
      const ref = doc.getElementById(id);
      return ref ? ref.textContent : "";
    }).join(" ").trim();
    if (text) return text;
  }
  const text = (node.textContent || "").replace(/\s+/g, " ").trim();
  if (text) return text;
  return (node.getAttribute("title") || node.value || "").trim();
}
function matchesName(node, name) {
  const n = accessibleName(node);
  return name instanceof RegExp ? name.test(n) : n.includes(name);
}
function allByName(root, name, opts = {}) {
  const sel = opts.selector || CONTROL;
  return [...root.querySelectorAll(sel)].filter((n) => matchesName(n, name));
}
const byName = (root, name, opts) => allByName(root, name, opts)[0] || null;

module.exports = { hook, state, intent, hasHook, hasState, ui, uiAll, accessibleName, byName, allByName, CONTROL };
