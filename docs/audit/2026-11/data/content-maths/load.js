// Loads maths spine + content files (as index.html orders them) into a vm sandbox.
const fs = require("fs"), vm = require("vm"), path = require("path");
const ROOT = "/Users/fj/Developer/KurenaiOS - Web";
const html = fs.readFileSync(ROOT + "/index.html", "utf8");
const srcs = [...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1]).filter(s => /data\/maths\.js|content\/(maths-|bank-maths)/.test(s));
const win = {};
win.window = win;
const content = {
  extend(key, patch) {
    const e = win.KOS_CONTENT[key] = win.KOS_CONTENT[key] || {};
    ["flashcards", "quiz", "exam"].forEach(k => { if (patch[k] && patch[k].length) e[k] = (e[k] || []).concat(patch[k].map(x => (x.__bank = 1, x))); });
    if (patch.notes && patch.notes.length) e.notes = (e.notes || []).concat(patch.notes);
    ["sims", "gens"].forEach(k => { if (!patch[k]) return; e[k] = e[k] || []; patch[k].forEach(id => { if (e[k].indexOf(id) < 0) e[k].push(id); }); });
    return e;
  },
  examFromWorked(notes) {
    const out = [];
    (notes || []).forEach(b => { const w = b && b.worked; if (!w || w.tag !== "exam" || typeof w.q !== "string" || !w.src) return;
      const mm = /(\d+)\s*marks?/.exec(w.src); if (!mm) return; out.push({ q: w.q, marks: +mm[1], ms: (w.steps || []).map(s => s.m), src: w.src, __derived: 1 }); });
    return out;
  }
};
win.KOS = { content };
win.KOS_DATA = {};
const ctx = vm.createContext(win);
for (const s of srcs) vm.runInContext(fs.readFileSync(path.join(ROOT, s), "utf8"), ctx, { filename: s });
module.exports = { win, srcs };
if (require.main === module) console.log(srcs, Object.keys(win.KOS_CONTENT).filter(k => k.startsWith("maths:")).length);
