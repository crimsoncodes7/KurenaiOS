/* Kurenai OS — labs/sims-structures.js
   The data-structure diagrams on the lab system (frame 20a): the linked
   list, the binary search tree, the hash table with open addressing and
   the dictionary as a chained hash table. Each operation is a run of
   frames: the sim commits its model when the run is loaded, then the
   stage and the readout replay it (Step › one at a time, ▶ Run through),
   so a run cut short never leaves the structure half-changed.

   The ids are the ones the Governor prices and the content files list
   (tl-list and tl-tree once mounted the Trace Lab's canvases), so a
   deep link, an unlock or a topic's Simulate tab carries over. */
(function () {
  "use strict";
  var el = KOS.ui.el, L = KOS.lab;

  function numIn(v, w) { return el("input", { type: "number", value: v, inputmode: "numeric", style: "--w: " + (w || 64) + "px" }); }
  function textIn(v, w, ph) { return el("input", { type: "text", value: v, placeholder: ph || null, maxlength: 10, style: "--w: " + (w || 90) + "px" }); }
  function readInt(input, lo, hi) {
    var n = Number(String(input.value).trim());
    if (String(input.value).trim() === "" || !isFinite(n) || Math.floor(n) !== n || n < lo || n > hi) {
      KOS.ui.toast("Enter a whole number from " + lo + " to " + hi + ".", true);
      return null;
    }
    return n;
  }
  function plural(n, w) { return n + " " + w + (n === 1 ? "" : "s"); }

  /* =================== the linked list =================== */
  var LIST_SEED = [12, 19, 23, 31, 38, 44, 57, 63];
  var LL = { X0: 18, STEP: 98, NW: 76, NH: 46, ROW0: 150, ROWH: 210, PER: 8, MAX: 20 };

  function listLab(panel) {
    var list = LIST_SEED.slice(), showIdx = true, shown = null;
    var valIn = numIn(27);
    var lab = L.create(panel, {
      controls: [L.field("Value", valIn), L.action("Insert sorted", insertSorted, true), L.action("Append", append),
        L.action("Delete", del), L.action("Search", search), L.sep(),
        L.toggle("Show indices", true, function (on) { showIdx = on; lab.draw(); })],
      transport: true, label: "Linked list diagram",
      onReset: function () { list = LIST_SEED.slice(); idle(["Reset to eight sorted nodes. The head is ", ["12", "done"], " and the tail ", ["63", "done"], "."]); }
    });
    lab.legend([["ring-done", "new node"], ["ring-front", "cur pointer"], ["line-hot", "pointer about to change"]]);

    function pos(i) { return { x: LL.X0 + (i % LL.PER) * LL.STEP, y: LL.ROW0 + Math.floor(i / LL.PER) * LL.ROWH }; }
    function F(nodes, o) { o = o || {}; o.nodes = nodes.slice(); o.tones = o.tones || {}; return o; }

    function render(f, i, n) {
      shown = f;
      lab.draw(paint);
      lab.now(f.say, n > 1 ? "Step " + (i + 1) + " of " + n : null);
      lab.values(f.vals || [["length", String(f.nodes.length)], ["head", f.nodes.length ? "→ " + f.nodes[0] : "null"],
        ["tail", f.nodes.length ? "→ " + f.nodes[f.nodes.length - 1] : "null"]]);
    }
    function idle(say) { lab.steps([F(list, { say: say || ["Type a value, then insert, append, delete or search. The list is kept in ascending order when you insert sorted."] })], render); }

    function paint(d) {
      var f = shown, n = f.nodes.length, fr = f.fresh;
      var slots = Math.max(n, fr && fr.slot != null ? fr.slot + 1 : 0, 1);
      var cols = Math.min(LL.PER, slots), rows = Math.ceil(slots / LL.PER);
      var W = Math.max(LL.X0 * 2 + cols * LL.STEP - (LL.STEP - LL.NW), 320), H = LL.ROW0 + (rows - 1) * LL.ROWH + LL.NH + 100;
      if (!n && !fr) {
        d.text(W / 2, LL.ROW0 + 28, "head = null · the list is empty", { tone: "mute" });
        return { w: W, h: H, count: 0, noun: "node" };
      }
      f.nodes.forEach(function (v, i) {
        var p = pos(i), tail = i === n - 1;
        node(d, p.x, p.y, v, f.tones[i], tail && !f.tailLink);
        if (showIdx) d.text(p.x + LL.NW / 2, p.y + LL.NH + 24, "[" + i + "]", { size: 14, tone: "mute" });
        if (!tail) link(d, i, i + 1, f.cut === i ? { tone: "faint", dash: true } : {});
      });
      if (n) {
        pointer(d, pos(0), "head", f.headTone || "done", 23);
        pointer(d, pos(n - 1), "tail", f.tailTone || "done", n === 1 ? 61 : 38);
      }
      if (f.cur != null && f.cur >= 0) below(d, pos(f.cur), "cur", "front");
      if (f.prev != null && f.prev >= 0) below(d, pos(f.prev), "prev", "sub");
      if (f.skip) {
        var a = pos(f.skip.from), b = f.skip.to != null ? pos(f.skip.to) : null;
        var sx = a.x + 61, sy = a.y + LL.NH + 2;
        if (b && b.y === a.y) d.path("M" + sx + " " + sy + " C" + sx + " " + (sy + 64) + " " + (b.x + 23) + " " + (sy + 64) + " " + (b.x + 23) + " " + (b.y + LL.NH + 3), { tone: "hot", dash: true, arrow: true });
        else d.text(sx + 18, sy + 40, "next = null", { size: 14, tone: "hot", anchor: "start" });
      }
      if (fr) {
        var fx = fr.x, fy = fr.y;
        d.text(fx + LL.NW / 2, fy - 12, "new", { size: 14, tone: "done", weight: "bold" });
        node(d, fx, fy, fr.v, "new", fr.next == null);
        if (fr.next != null) {
          var t = pos(fr.next);
          if (t.y > fy) d.path("M" + (fx + 61) + " " + (fy + 23) + " C" + (fx + 110) + " " + (fy + 23) + " " + (t.x + 30) + " " + (t.y - 50) + " " + (t.x + 30) + " " + (t.y - 3), { tone: "done", arrow: true });
          else d.line(fx + 61, fy + 23, t.x - 1, t.y + 23, { tone: "done", arrow: true });
        }
        if (fr.from != null) {
          var c = pos(fr.from), cx = c.x + 61, cy = c.y + 23;
          if (fy < c.y) {
            d.path("M" + cx + " " + (cy - 6) + " C" + cx + " " + (cy - 60) + " " + (fx + 23) + " " + (fy + LL.NH + 50) + " " + (fx + 23) + " " + (fy + LL.NH + 3), { tone: "hot", dash: true, arrow: true });
            d.text((cx + fx + 23) / 2 - 22, (cy + fy + LL.NH) / 2 + 4, "next", { size: 14, tone: "hot", anchor: "end" });
          } else d.line(cx, cy, fx - 1, fy + 23, { tone: "hot", dash: true, arrow: true });
        }
        if (fr.fromHead) {
          d.path("M" + (pos(0).x + 23) + " " + (pos(0).y - 58) + " C" + (pos(0).x + 23) + " " + (fy + 70) + " " + (fx + 10) + " " + (fy + 80) + " " + (fx + 10) + " " + (fy + LL.NH + 3), { tone: "hot", dash: true, arrow: true });
        }
      }
      return { w: W, h: H, count: n, noun: "node" };
    }
    function node(d, x, y, v, tone, isNull) {
      d.rect(x, y, LL.NW, LL.NH, { tone: tone || null });
      d.line(x + 46, y, x + 46, y + LL.NH, { tone: "line" });
      d.text(x + 23, y + 29, String(v), { weight: "bold" });
      if (isNull) d.text(x + 61, y + 28, "∅", { size: 14, tone: "mute" });
      else d.dot(x + 61, y + 23, 3.5, "ink");
    }
    /* the next pointer from node i to node j: straight along a row, or
       down the right edge and back to the start of the next row */
    function link(d, i, j, op) {
      var a = pos(i), b = pos(j), sx = a.x + 61, sy = a.y + 23;
      op.arrow = true;
      if (a.y === b.y) { d.line(sx, sy, b.x - 1, b.y + 23, op); return; }
      var right = a.x + LL.NW + 10, mid = a.y + LL.NH + 56;
      d.path("M" + sx + " " + sy + " H" + right + " V" + mid + " H" + (LL.X0 - 10) + " V" + (b.y + 23) + " H" + (b.x - 1), op);
    }
    function pointer(d, p, name, tone, dx) {
      d.text(p.x + dx, p.y - 44, name, { size: 14, tone: tone, weight: "bold" });
      d.line(p.x + dx, p.y - 36, p.x + dx, p.y - 3, { tone: tone, arrow: true });
    }
    function below(d, p, name, tone) {
      d.line(p.x + 23, p.y + LL.NH + 34, p.x + 23, p.y + LL.NH + 4, { tone: tone === "sub" ? null : tone, arrow: true });
      d.text(p.x + 23, p.y + LL.NH + 52, name, { size: 14, tone: tone, weight: "bold" });
    }
    function freshAt(slotBetween, v) {
      /* above the gap after node `slotBetween` (−1 = before the head) */
      var p = pos(Math.max(0, slotBetween));
      return { v: v, x: slotBetween < 0 ? p.x + 40 : p.x + 49, y: p.y - 104 };
    }

    function full() {
      if (list.length >= LL.MAX) { KOS.ui.toast("That is plenty to follow — delete a node or reset first.", true); return true; }
      return false;
    }
    function insertSorted() {
      var v = readInt(valIn, 0, 999); if (v == null || full()) return;
      var before = list.slice(), n = before.length, out = [];
      var fr0 = freshAt(n ? 0 : -1, v);
      out.push(F(before, { fresh: { v: v, x: fr0.x, y: fr0.y }, say: ["Make a new node holding ", [v, "done"], ". Its next pointer is null for now."],
        vals: [["new.data", String(v), "done"], ["new.next", "null"], ["length", String(n)]] }));
      var at;
      if (!n || v <= before[0]) {
        at = 0;
        var fh = freshAt(-1, v);
        out.push(F(before, { fresh: { v: v, x: fh.x, y: fh.y, next: n ? 0 : null, fromHead: true }, headTone: "faint",
          say: n ? [[v, "done"], " is not larger than the head's value, ", [before[0], "done"], ", so it goes first: ", ["new.next", "done"], " ← head, then ", ["head", "hot"], " ← new."]
                 : ["The list is empty, so ", ["head", "hot"], " and tail both point at the new node."],
          vals: [["new.data", String(v), "done"], ["new.next", n ? "→ " + before[0] : "null", "done"], ["head", "→ " + v, "hot"]] }));
      } else {
        var c = 0;
        while (c + 1 < n && before[c + 1] < v) {
          out.push(F(before, { cur: c, fresh: { v: v, x: fr0.x, y: fr0.y }, tones: tone1(c, "front"),
            say: [["cur", "front"], " is at ", [before[c], "front"], ". The next value, " + before[c + 1] + ", is smaller than " + v + ", so move cur on."],
            vals: [["cur", "→ " + before[c], "front"], ["new.data", String(v), "done"], ["length", String(n)]] }));
          c++;
        }
        var fs = freshAt(c, v), last = c + 1 >= n;
        out.push(F(before, { cur: c, cut: last ? null : c, tailLink: last, fresh: { v: v, x: fs.x, y: fs.y, next: last ? null : c + 1, from: c }, tones: tone1(c, "front"),
          say: last ? [["cur", "front"], " reaches the tail, ", [before[c], "front"], ": nothing after it is larger. ", ["new.next", "done"], " stays null and ", ["cur.next", "hot"], " ← new."]
                    : [["cur", "front"], " stops at " + before[c] + " because the next value, " + before[c + 1] + ", is larger than " + v + ". Point ", ["new.next", "done"], " at " + before[c + 1] + ", then move ", ["cur.next", "hot"], " to the new node."],
          vals: [["cur", "→ " + before[c], "front"], ["new.data", String(v), "done"], ["new.next", last ? "null" : "→ " + before[c + 1], "done"], ["length", n + " → " + (n + 1)]] }));
        at = c + 1;
      }
      list.splice(at, 0, v);
      out.push(F(list, { tones: tone1(at, "new"), say: ["Done: ", [v, "done"], " is linked in at index " + at + ". No node moved in memory — two pointers changed."],
        vals: [["length", String(list.length)], ["head", "→ " + list[0]], ["tail", "→ " + list[list.length - 1]]] }));
      lab.steps(out, render, { autoplay: true });
    }
    function append() {
      var v = readInt(valIn, 0, 999); if (v == null || full()) return;
      var before = list.slice(), n = before.length, out = [], p = pos(n);
      out.push(F(before, { fresh: { v: v, x: p.x, y: p.y - 104 }, say: ["Make a new node holding ", [v, "done"], ". Appending uses the tail pointer, so there is no walk."],
        vals: [["new.data", String(v), "done"], ["length", String(n)]] }));
      if (n) out.push(F(before, { tailLink: true, fresh: { v: v, x: p.x, y: p.y - 104, from: n - 1 }, tailTone: "faint",
        say: [["tail.next", "hot"], " ← new: the old tail, " + before[n - 1] + ", now points at " + v + ". Then ", ["tail", "hot"], " ← new."],
        vals: [["tail.next", "→ " + v, "hot"], ["length", n + " → " + (n + 1)]] }));
      list.push(v);
      out.push(F(list, { tones: tone1(n, "new"), say: n ? ["Done: ", [v, "done"], " is the new tail. Appending with a tail pointer is O(1)."] : ["The list was empty, so ", [v, "done"], " is both the head and the tail."] }));
      lab.steps(out, render, { autoplay: true });
    }
    function walk(v, verb) {
      var before = list.slice(), out = [], c = 0;
      while (c < before.length && before[c] !== v) {
        out.push(F(before, { cur: c, prev: verb === "delete" ? c - 1 : null, tones: tone1(c, "front"),
          say: [["cur", "front"], " is at ", [before[c], "front"], ", not " + v + ". " + (verb === "delete" ? "prev ← cur, cur ← cur.next." : "cur ← cur.next.")],
          vals: [["cur", "→ " + before[c], "front"], ["comparisons", String(c + 1)]] }));
        c++;
      }
      return { out: out, at: c < before.length ? c : -1, before: before };
    }
    function del() {
      var v = readInt(valIn, 0, 999); if (v == null) return;
      var w = walk(v, "delete"), out = w.out, b = w.before, at = w.at;
      if (at < 0) {
        out.push(F(b, { say: ["cur reached null: ", [v, "hot"], " is not in the list, so nothing changes."], vals: [["comparisons", String(b.length)]] }));
      } else if (at === 0) {
        out.push(F(b, { cur: 0, tones: tone1(0, "hot-ring"), headTone: "hot",
          say: ["The head holds ", [v, "hot"], ", so ", ["head", "hot"], " ← head.next" + (b.length > 1 ? " (" + b[1] + ")." : ", which is null.")],
          vals: [["head", b.length > 1 ? "→ " + b[1] : "null", "hot"], ["length", b.length + " → " + (b.length - 1)]] }));
        list.splice(0, 1);
        out.push(F(list, { say: ["Removed ", [v, "hot"], ". Nothing points at its node now, so its memory can be reclaimed."] }));
      } else {
        var last = at === b.length - 1;
        out.push(F(b, { cur: at, prev: at - 1, cut: at - 1, skip: { from: at - 1, to: last ? null : at + 1 }, tones: tone1(at, "hot-ring"),
          say: ["Found ", [v, "hot"], ". ", ["prev.next", "hot"], " ← cur.next" + (last ? " (null): " + b[at - 1] + " becomes the tail." : ", so the list skips straight from " + b[at - 1] + " to " + b[at + 1] + ".")],
          vals: [["prev", "→ " + b[at - 1]], ["cur", "→ " + v, "hot"], ["prev.next", last ? "null" : "→ " + b[at + 1], "hot"], ["length", b.length + " → " + (b.length - 1)]] }));
        list.splice(at, 1);
        out.push(F(list, { say: ["Removed ", [v, "hot"], " after " + plural(at + 1, "comparison") + ". Deleting needs the node before it, which is why the walk keeps prev."] }));
      }
      lab.steps(out, render, { autoplay: true });
    }
    function search() {
      var v = readInt(valIn, 0, 999); if (v == null) return;
      var w = walk(v, "search"), out = w.out, b = w.before, at = w.at;
      if (at < 0) out.push(F(b, { say: ["cur reached null after " + plural(b.length, "comparison") + ": ", [v, "hot"], " is not in the list."] }));
      else out.push(F(b, { cur: at, tones: tone1(at, "done-ring"), say: ["Found ", [v, "done"], " at index " + at + " after " + plural(at + 1, "comparison") + ". A list has no index to jump to, so searching is O(n)."],
        vals: [["cur", "→ " + v, "done"], ["comparisons", String(at + 1)]] }));
      lab.steps(out, render, { autoplay: true });
    }
    function tone1(i, t) { var o = {}; o[i] = t; return o; }
    idle();
  }

  /* =================== the binary search tree =================== */
  var BST_SEED = [50, 30, 70, 20, 40, 60, 80, 15, 25, 35, 45, 55, 65, 75, 85];
  var BT = { R: 19, TOP: 46, DY: 84, MARG: 30, MAX: 63 };

  function bstLab(panel) {
    var root = null, shown = null;
    function ins(t, v) { if (!t) return { v: v, l: null, r: null }; if (v < t.v) t.l = ins(t.l, v); else if (v > t.v) t.r = ins(t.r, v); return t; }
    function clone(t) { return t && { v: t.v, l: clone(t.l), r: clone(t.r) }; }
    function count(t) { return t ? 1 + count(t.l) + count(t.r) : 0; }
    function depth(t) { return t ? 1 + Math.max(depth(t.l), depth(t.r)) : 0; }
    function seed() { root = null; BST_SEED.forEach(function (v) { root = ins(root, v); }); }
    seed();

    var valIn = numIn(65);
    var lab = L.create(panel, {
      controls: [L.field("Value", valIn), L.action("Search", search, true), L.action("Insert", insert), L.action("Delete", del), L.sep(),
        L.action("Pre-order", function () { trav("pre"); }), L.action("In-order", function () { trav("in"); }), L.action("Post-order", function () { trav("post"); })],
      transport: true, label: "Binary search tree diagram",
      onReset: function () { seed(); idle(["Reset to a balanced tree of 15 nodes, depth 4."]); }
    });
    lab.legend([["fill-hot", "current"], ["ring-hot", "path so far"], ["fill-done", "found or visited"], ["ring-done", "new node"]]);
    function F(o) { o.tree = clone(root); o.tones = o.tones || {}; o.edges = o.edges || {}; return o; }
    function idle(say) {
      lab.steps([F({ say: say || ["Every value in a node's left subtree is smaller and every value in its right subtree is larger. Search, insert or delete, or run a traversal."] })], render);
    }
    function render(f, i, n) {
      shown = f;
      lab.draw(paint);
      lab.now(f.say, n > 1 ? "Step " + (i + 1) + " of " + n : null);
      lab.values(f.vals || [["nodes", String(count(f.tree))], ["depth", String(depth(f.tree))]]);
    }
    function paint(d) {
      var t = shown.tree, n = count(t);
      if (!t) { d.text(400, 225, "root = null · the tree is empty", { tone: "mute" }); return { w: 800, h: 450, count: 0, noun: "node" }; }
      var dx = n <= 16 ? 50 : 36, at = {}, idx = 0, deep = 0;
      (function lay(x, dpt) {
        if (!x) return;
        lay(x.l, dpt + 1);
        at[x.v] = { x: BT.MARG + idx * dx, y: BT.TOP + dpt * BT.DY };
        idx++; deep = Math.max(deep, dpt);
        lay(x.r, dpt + 1);
      })(t, 0);
      var W = Math.max(BT.MARG * 2 + (n - 1) * dx, 300), H = BT.TOP + deep * BT.DY + BT.R + 30;
      var tones = shown.tones, edges = shown.edges;
      (function edge(x) {
        if (!x) return;
        [x.l, x.r].forEach(function (c, side) {
          if (!c) return;
          var a = at[x.v], b = at[c.v], key = x.v + "-" + c.v;
          var len = Math.hypot(b.x - a.x, b.y - a.y), ux = (b.x - a.x) / len, uy = (b.y - a.y) / len;
          d.line(a.x + ux * BT.R, a.y + uy * BT.R, b.x - ux * BT.R, b.y - uy * BT.R, { tone: edges[key] || "mute" });
          if (shown.labels && shown.labels[key]) {
            d.text((a.x + b.x) / 2 + (side ? 12 : -12), (a.y + b.y) / 2 - 4, shown.labels[key], { size: 14, tone: edges[key] || "sub", anchor: side ? "start" : "end" });
          }
        });
        edge(x.l); edge(x.r);
      })(t);
      Object.keys(at).forEach(function (v) {
        var p = at[v], tn = tones[v];
        d.circle(p.x, p.y, BT.R, { tone: tn || "ink" });
        d.text(p.x, p.y + 5, v, { size: 15, weight: "bold", tone: tn === "hot" || tn === "done" ? "on" : null });
      });
      return { w: W, h: H, count: n, noun: "node", note: "depth " + (deep + 1) };
    }
    /* walk from the root towards v; each step lights the edge it takes */
    function path(v, verb) {
      var out = [], tones = {}, edges = {}, labels = {}, x = root, parent = null, steps = 0;
      while (x) {
        steps++;
        var t = {}; Object.keys(tones).forEach(function (k) { t[k] = tones[k]; });
        t[x.v] = "hot";
        if (v === x.v) break;
        var goL = v < x.v, next = goL ? x.l : x.r;
        out.push(F({ tones: t, edges: copy(edges), labels: copy(labels),
          say: [[v, "hot"], (goL ? " < " : " > ") + x.v + ", so go " + (goL ? "left" : "right") + (next ? " to " + next.v + "." : ": that branch is empty.")],
          vals: [["comparisons", String(steps)], ["path", pathText(tones, x.v)]] }));
        tones[x.v] = "hot-ring";
        if (next) { edges[x.v + "-" + next.v] = "hot"; labels[x.v + "-" + next.v] = v + (goL ? " < " : " > ") + x.v + (goL ? " ←" : " →"); }
        parent = x; x = next;
      }
      return { out: out, node: x, parent: parent, tones: tones, edges: edges, labels: labels, steps: steps };
    }
    function pathText(tones, last) { return Object.keys(tones).concat(last != null ? [last] : []).join(" · "); }
    function copy(o) { var r = {}; Object.keys(o).forEach(function (k) { r[k] = o[k]; }); return r; }
    function search() {
      var v = readInt(valIn, 0, 999); if (v == null) return;
      var p = path(v);
      if (p.node) {
        var t = copy(p.tones); t[v] = "done";
        p.out.push(F({ tones: t, edges: p.edges, labels: p.labels,
          say: ["Found ", [v, "done"], " after " + plural(p.steps, "comparison") + ". A balanced tree of " + count(root) + " nodes needs at most " + depth(root) + "."],
          vals: [["comparisons", String(p.steps)], ["path", pathText(p.tones, v)]] }));
      } else {
        p.out.push(F({ tones: p.tones, edges: p.edges, labels: p.labels,
          say: [[v, "hot"], " is not in the tree: the search ran off an empty branch after " + plural(p.steps, "comparison") + "."],
          vals: [["comparisons", String(p.steps)]] }));
      }
      lab.steps(p.out, render, { autoplay: true });
    }
    function insert() {
      var v = readInt(valIn, 0, 999); if (v == null) return;
      if (count(root) >= BT.MAX) { KOS.ui.toast("That is a big tree already — reset first.", true); return; }
      var p = path(v);
      if (p.node) {
        var t = copy(p.tones); t[v] = "hot-ring";
        p.out.push(F({ tones: t, edges: p.edges, labels: p.labels, say: [[v, "hot"], " is already in the tree. A BST holds each key once, so nothing changes."] }));
        lab.steps(p.out, render, { autoplay: true });
        return;
      }
      root = ins(root, v);
      var t2 = copy(p.tones); t2[v] = "new";
      var e2 = copy(p.edges); if (p.parent) e2[p.parent.v + "-" + v] = "done";
      p.out.push(F({ tones: t2, edges: e2, labels: p.labels,
        say: p.parent ? ["Attach ", [v, "done"], " as the " + (v < p.parent.v ? "left" : "right") + " child of " + p.parent.v + ". New keys always arrive as leaves."]
                      : ["The tree was empty, so ", [v, "done"], " becomes the root."],
        vals: [["nodes", String(count(root))], ["depth", String(depth(root))]] }));
      lab.steps(p.out, render, { autoplay: true });
    }
    function del() {
      var v = readInt(valIn, 0, 999); if (v == null) return;
      var p = path(v);
      if (!p.node) {
        p.out.push(F({ tones: p.tones, edges: p.edges, labels: p.labels, say: [[v, "hot"], " is not in the tree, so there is nothing to delete."] }));
        lab.steps(p.out, render, { autoplay: true });
        return;
      }
      var x = p.node, t = copy(p.tones); t[v] = "hot";
      var kids = (x.l ? 1 : 0) + (x.r ? 1 : 0), say;
      if (!kids) say = [[v, "hot"], " is a leaf, so its parent's pointer is simply set to null."];
      else if (kids === 1) say = [[v, "hot"], " has one child, " + (x.l || x.r).v + ", which moves up into its place."];
      else {
        var s = x.r; while (s.l) s = s.l;
        t[s.v] = "front";
        say = [[v, "hot"], " has two children. Replace it with its in-order successor, ", [s.v, "front"], " (the smallest value in its right subtree), then remove that node."];
      }
      p.out.push(F({ tones: t, edges: p.edges, labels: p.labels, say: say }));
      root = remove(root, v);
      p.out.push(F({ say: ["Deleted ", [v, "hot"], ". An in-order traversal still comes out sorted."], vals: [["nodes", String(count(root))], ["depth", String(depth(root))]] }));
      lab.steps(p.out, render, { autoplay: true });
    }
    function remove(t, v) {
      if (!t) return null;
      if (v < t.v) { t.l = remove(t.l, v); return t; }
      if (v > t.v) { t.r = remove(t.r, v); return t; }
      if (!t.l) return t.r;
      if (!t.r) return t.l;
      var s = t.r; while (s.l) s = s.l;
      t.v = s.v; t.r = remove(t.r, s.v);
      return t;
    }
    function trav(kind) {
      if (!root) { KOS.ui.toast("Insert some values first.", true); return; }
      var order = [];
      (function walk(x) {
        if (!x) return;
        if (kind === "pre") order.push(x.v);
        walk(x.l);
        if (kind === "in") order.push(x.v);
        walk(x.r);
        if (kind === "post") order.push(x.v);
      })(root);
      var rule = { pre: "Pre-order visits a node, then its left subtree, then its right.",
        in: "In-order visits the left subtree, then the node, then the right — a BST comes out sorted.",
        post: "Post-order visits both subtrees before the node, so children come before parents." }[kind];
      var out = [], tones = {};
      order.forEach(function (v, i) {
        var t = copy(tones); t[v] = "hot";
        out.push(F({ tones: t, say: ["Visit ", [v, "hot"], ". " + (i ? "" : rule)], vals: [["output", order.slice(0, i + 1).join(", ")]] }));
        tones[v] = "done";
      });
      out.push(F({ tones: tones, say: [{ pre: "Pre-order", in: "In-order", post: "Post-order" }[kind] + " traversal: ", [order.join(", "), "done"], kind === "in" ? " — sorted ascending, as a BST guarantees." : "."],
        vals: [["output", order.join(", ")]] }));
      lab.steps(out, render, { autoplay: true });
    }
    idle();
  }

  /* =================== the hash table, open addressing =================== */
  var HT = { N: 11, CW: 58, GAP: 8, Y: 232, CH: 58, SEED: [33, 13, 47, 5, 18, 29] };

  function hashLab(panel) {
    var table, mode = "linear", shown = null, TOMB = "✕";
    function seed() { table = new Array(HT.N).fill(null); HT.SEED.forEach(function (k) { place(k); }); }
    function home(k) { return ((k % HT.N) + HT.N) % HT.N; }
    function probe(k, i) { return (home(k) + (mode === "linear" ? i : i * i)) % HT.N; }
    function place(k) { for (var i = 0; i < HT.N; i++) { var s = probe(k, i); if (table[s] === null || table[s] === TOMB) { table[s] = k; return s; } } return -1; }
    function load() { return table.filter(function (x) { return x !== null && x !== TOMB; }).length; }
    seed();

    var keyIn = numIn(24, 72);
    var modeSeg = L.choice([["linear", "Linear"], ["quadratic", "Quadratic"]], mode, function (m) { mode = m; seed(); idle(["Switched to " + m + " probing and rebuilt the table: " + (m === "linear" ? "h(k), h(k)+1, h(k)+2, …" : "h(k), h(k)+1², h(k)+2², …") + " mod 11."]); }, "Probing");
    var lab = L.create(panel, {
      controls: [L.field("Key", keyIn), L.action("Insert", insert, true), L.action("Find", find), L.action("Delete", del), L.sep(), modeSeg],
      transport: true, label: "Hash table diagram",
      onReset: function () { seed(); idle(["Reset to six keys in eleven slots."]); }
    });
    lab.legend([["ring-hot", "home slot h(k)"], ["ring-front", "probed, occupied"], ["ring-done", "placed or found"], ["ring-mute", "deleted (tombstone)"]]);

    function F(o) { o.table = table.slice(); o.tones = o.tones || {}; return o; }
    function idle(say) { lab.steps([F({ say: say || ["Each key goes to slot h(k) = k mod 11. When that slot is taken, " + mode + " probing steps on to the next one to try."] })], render); }
    function render(f, i, n) {
      shown = f;
      lab.draw(paint);
      lab.now(f.say, n > 1 ? "Step " + (i + 1) + " of " + n : null);
      var used = f.table.filter(function (x) { return x !== null && x !== TOMB; }).length;
      lab.values((f.vals || []).concat([["load factor", used + " / " + HT.N + " = " + (used / HT.N).toFixed(2)]]));
    }
    function paint(d) {
      var f = shown, X0 = (800 - (HT.N * HT.CW + (HT.N - 1) * HT.GAP)) / 2;
      function cx(s) { return X0 + s * (HT.CW + HT.GAP); }
      f.table.forEach(function (k, s) {
        var tomb = k === TOMB;
        d.rect(cx(s), HT.Y, HT.CW, HT.CH, { tone: f.tones[s] || (tomb ? "ghost" : k === null ? "well" : null) });
        if (k !== null) d.text(cx(s) + HT.CW / 2, HT.Y + 35, String(k), { weight: "bold", tone: tomb ? "mute" : null });
        d.text(cx(s) + HT.CW / 2, HT.Y + HT.CH + 26, String(s), { size: 14, tone: "mute" });
      });
      if (f.key != null) {
        d.rect(400 - 62, 70, 124, 34, { rx: 17, tone: "hot-ring" });
        d.text(400, 93, f.verb + " " + f.key, { size: 15, weight: "bold" });
        d.text(400, 140, "h(" + f.key + ") = " + f.key + " mod " + HT.N + " = " + home(f.key), { size: 15, tone: "sub" });
        var hs = home(f.key);
        d.path("M400 150 C400 190 " + (cx(hs) + HT.CW / 2) + " 186 " + (cx(hs) + HT.CW / 2) + " " + (HT.Y - 4), { tone: "hot", arrow: true });
        (f.hops || []).forEach(function (h) {
          var a = cx(h[0]) + HT.CW / 2, b = cx(h[1]) + HT.CW / 2, lift = h[1] > h[0] ? 46 : 30;
          if (h[1] > h[0]) {
            d.path("M" + a + " " + (HT.Y - 4) + " C" + a + " " + (HT.Y - lift) + " " + b + " " + (HT.Y - lift) + " " + b + " " + (HT.Y - 4), { tone: "front", dash: true, arrow: true });
            d.text((a + b) / 2, HT.Y - lift + 2, h[2], { size: 14, tone: "front" });
          } else {
            /* a wrap-around: down past the row and back to the start */
            d.path("M" + a + " " + (HT.Y + HT.CH + 34) + " C" + a + " " + (HT.Y + HT.CH + 80) + " " + b + " " + (HT.Y + HT.CH + 80) + " " + b + " " + (HT.Y + HT.CH + 34), { tone: "front", dash: true, arrow: true });
            d.text((a + b) / 2, HT.Y + HT.CH + 98, h[2] + " (wraps)", { size: 14, tone: "front" });
          }
        });
      }
      d.text(24, 36, "h(k) = k mod " + HT.N + " · " + mode + " probing", { size: 14, tone: "mute", anchor: "start" });
      return { w: 800, h: 450, count: HT.N, noun: "slot" };
    }
    function hop(i) { return mode === "linear" ? 1 : i * i - (i - 1) * (i - 1); }
    function run(k, verb) {
      var out = [], tones = {}, hops = [], s = home(k), i = 0, last = s;
      for (i = 0; i < HT.N; i++) {
        s = probe(k, i);
        if (i) hops.push([last, s, mode === "linear" ? "+1" : "h+" + i * i]);
        var cell = table[s], t = copy(tones);
        if (cell === null || (verb === "insert" && cell === TOMB) || cell === k) return { out: out, slot: s, tries: i + 1, tones: tones, hops: hops, hit: cell === k };
        t[s] = i ? "front" : "hot-ring";
        out.push(F({ key: k, verb: verb, tones: t, hops: hops.slice(),
          say: i ? ["Slot " + s + (cell === TOMB ? " is a tombstone: a deleted key once sat here, so the search must keep going." : " holds " + cell + ", so step on " + (mode === "linear" ? "by 1." : "by " + (i + 1) + "² − " + i + "² = " + hop(i + 1) + "."))]
                 : ["h(" + k + ") = " + k + " mod 11 = " + s + ". " + (cell === TOMB ? "Slot " + s + " is a tombstone, so keep probing." : "Slot " + s + " holds " + cell + ": a collision.")],
          vals: [["probes", String(i + 1)]] }));
        tones[s] = t[s];
        last = s;
      }
      return { out: out, slot: -1, tries: HT.N, tones: tones, hops: hops, hit: false };
    }
    function copy(o) { var r = {}; Object.keys(o).forEach(function (k) { r[k] = o[k]; }); return r; }
    function insert() {
      var k = readInt(keyIn, 0, 999); if (k == null) return;
      if (table.indexOf(k) >= 0) { find(); return; }
      if (load() >= HT.N) { KOS.ui.toast("Every slot is full — delete a key or reset.", true); return; }
      var r = run(k, "insert"), t = copy(r.tones);
      if (r.slot < 0) {
        r.out.push(F({ key: k, verb: "insert", tones: t, hops: r.hops, say: ["Quadratic probing visited every slot it can reach and found none free, though the table is not full. That is why quadratic probing wants a load factor under ½."] }));
        lab.steps(r.out, render, { autoplay: true });
        return;
      }
      table[r.slot] = k; t[r.slot] = "done-ring";
      r.out.push(F({ key: k, verb: "insert", tones: t, hops: r.hops,
        say: r.tries === 1 ? ["Placed: h(" + k + ") = " + r.slot + " and slot " + r.slot + " is free, so ", [k, "done"], " goes straight in."]
                           : ["Placed ", [k, "done"], " in slot " + r.slot + " after " + plural(r.tries, "probe") + ". Finding it again will follow the same path."],
        vals: [["probes", String(r.tries)]] }));
      lab.steps(r.out, render, { autoplay: true });
    }
    function find() {
      var k = readInt(keyIn, 0, 999); if (k == null) return;
      var r = run(k, "find"), t = copy(r.tones);
      if (r.hit) {
        t[r.slot] = "done-ring";
        r.out.push(F({ key: k, verb: "find", tones: t, hops: r.hops, say: ["Found ", [k, "done"], " in slot " + r.slot + " after " + plural(r.tries, "probe") + "."], vals: [["probes", String(r.tries)]] }));
      } else {
        if (r.slot >= 0) t[r.slot] = "hot-ring";
        r.out.push(F({ key: k, verb: "find", tones: t, hops: r.hops,
          say: [[k, "hot"], " is not in the table: " + (r.slot >= 0 ? "slot " + r.slot + " is empty, and an insert would have stopped there." : "every slot was probed.")], vals: [["probes", String(r.tries)]] }));
      }
      lab.steps(r.out, render, { autoplay: true });
    }
    function del() {
      var k = readInt(keyIn, 0, 999); if (k == null) return;
      var r = run(k, "delete"), t = copy(r.tones);
      if (!r.hit) {
        r.out.push(F({ key: k, verb: "delete", tones: t, hops: r.hops, say: [[k, "hot"], " is not in the table, so nothing is deleted."] }));
      } else {
        t[r.slot] = "hot-ring";
        r.out.push(F({ key: k, verb: "delete", tones: t, hops: r.hops, say: ["Found ", [k, "hot"], " in slot " + r.slot + "."] }));
        table[r.slot] = TOMB;
        r.out.push(F({ key: k, verb: "delete", hops: [],
          say: ["Slot " + r.slot + " becomes a ", ["tombstone", "hot"], ", not empty: a key placed past it by probing must still be findable."] }));
      }
      lab.steps(r.out, render, { autoplay: true });
    }
    idle();
  }

  /* =================== the dictionary, chained =================== */
  var DC = { B: 7, X0: 40, Y0: 26, RH: 52, BW: 46, NW: 156, GAP: 34, SEED: [["GBP", "1.00"], ["USD", "1.27"], ["JPY", "190"], ["EUR", "1.18"], ["INR", "106"], ["CHF", "1.12"]] };

  function dictLab(panel) {
    var buckets, shown = null;
    function codes(k) { return k.split("").map(function (c) { return c.charCodeAt(0); }); }
    function sum(k) { return codes(k).reduce(function (a, b) { return a + b; }, 0); }
    function hash(k) { return sum(k) % DC.B; }
    function seed() { buckets = []; for (var i = 0; i < DC.B; i++) buckets.push([]); DC.SEED.forEach(function (p) { buckets[hash(p[0])].push([p[0], p[1]]); }); }
    function size() { return buckets.reduce(function (a, b) { return a + b.length; }, 0); }
    seed();

    var keyIn = textIn("USD", 80, "key"), valIn = textIn("1.30", 80, "value");
    var lab = L.create(panel, {
      controls: [L.field("Key", keyIn), L.field("Value", valIn), L.action("Get", get, true), L.action("Set", set), L.action("Delete", del)],
      transport: true, label: "Dictionary diagram",
      onReset: function () { seed(); idle(["Reset to six currency rates."]); }
    });
    lab.legend([["ring-hot", "bucket h(key)"], ["ring-front", "compared"], ["ring-done", "found, set or new"]]);

    function F(o) { o.buckets = buckets.map(function (b) { return b.map(function (p) { return p.slice(); }); }); o.tones = o.tones || {}; return o; }
    function idle(say) { lab.steps([F({ say: say || ["A dictionary stores key → value pairs with unique keys. This one is a hash table with chaining: each key's bucket is h(key), and a bucket holds a short chain."] })], render); }
    function render(f, i, n) {
      shown = f;
      lab.draw(paint);
      lab.now(f.say, n > 1 ? "Step " + (i + 1) + " of " + n : null);
      var pairs = f.buckets.reduce(function (a, b) { return a + b.length; }, 0);
      lab.values((f.vals || []).concat([["pairs", String(pairs)], ["buckets", String(DC.B)]]));
    }
    function paint(d) {
      var f = shown, longest = 0;
      f.buckets.forEach(function (chain, b) {
        var y = DC.Y0 + b * DC.RH;
        d.rect(DC.X0, y, DC.BW, DC.RH - 12, { rx: 8, tone: f.tones["b" + b] || "well" });
        d.text(DC.X0 + DC.BW / 2, y + 26, String(b), { size: 15, weight: "bold", tone: f.tones["b" + b] ? null : "mute" });
        var x = DC.X0 + DC.BW + DC.GAP;
        if (!chain.length) { d.text(x - DC.GAP + 10, y + 26, "∅", { size: 14, tone: "mute", anchor: "start" }); }
        else d.line(DC.X0 + DC.BW, y + 20, x - 2, y + 20, { arrow: true, tone: f.tones["b" + b] ? "hot" : null });
        chain.forEach(function (p, j) {
          var tn = f.tones[p[0]];
          d.rect(x, y, DC.NW, DC.RH - 12, { rx: 8, tone: tn || null });
          d.line(x + 62, y, x + 62, y + DC.RH - 12, { tone: "line" });
          d.text(x + 31, y + 26, p[0], { size: 15, weight: "bold", tone: tn === "front" ? "front" : tn ? null : "ink" });
          d.text(x + 62 + (DC.NW - 62) / 2, y + 26, p[1], { size: 15 });
          if (j < chain.length - 1) d.line(x + DC.NW, y + 20, x + DC.NW + DC.GAP - 2, y + 20, { arrow: true });
          x += DC.NW + DC.GAP;
        });
        longest = Math.max(longest, chain.length);
      });
      var W = Math.max(800, DC.X0 + DC.BW + DC.GAP + longest * (DC.NW + DC.GAP) + 20);
      return { w: W, h: 450, count: DC.B, noun: "bucket" };
    }
    function formula(k) { return "h(\"" + k + "\") = (" + codes(k).join(" + ") + ") mod " + DC.B + " = " + sum(k) + " mod " + DC.B + " = " + hash(k); }
    function readKey() {
      var k = keyIn.value.trim();
      if (!k) { KOS.ui.toast("Type a key.", true); return null; }
      return k;
    }
    function chainWalk(k, verb) {
      var b = hash(k), out = [], tones = {}, chain = buckets[b], fml = formula(k);
      tones["b" + b] = "hot-ring";
      out.push(F({ key: k, formula: fml, tones: copy(tones),
        say: ["Hash the key: the character codes of \"" + k + "\" add up to " + sum(k) + ", and " + sum(k) + " mod " + DC.B + " = ", [hash(k), "hot"], ". Go straight to bucket " + b + " — no other bucket is looked at."],
        vals: [["h(key)", sum(k) + " mod " + DC.B + " = " + b, "hot"]] }));
      for (var j = 0; j < chain.length; j++) {
        var t = copy(tones); t[chain[j][0]] = chain[j][0] === k ? "done-ring" : "front";
        if (chain[j][0] === k) return { out: out, b: b, j: j, tones: tones, fml: fml };
        out.push(F({ key: k, formula: fml, tones: t, say: ["\"" + chain[j][0] + "\" is not \"" + k + "\": follow the chain."], vals: [["h(key)", sum(k) + " mod " + DC.B + " = " + b, "hot"], ["compared", String(j + 1)]] }));
        tones[chain[j][0]] = "front";
      }
      return { out: out, b: b, j: -1, tones: tones, fml: fml };
    }
    function copy(o) { var r = {}; Object.keys(o).forEach(function (k) { r[k] = o[k]; }); return r; }
    function bucketTone(b) { var o = {}; o["b" + b] = "hot-ring"; return o; }
    function get() {
      var k = readKey(); if (!k) return;
      var w = chainWalk(k), t = copy(w.tones);
      if (w.j >= 0) {
        t[k] = "done-ring";
        w.out.push(F({ key: k, formula: w.fml, tones: t, say: ["dict[\"" + k + "\"] = ", [buckets[w.b][w.j][1], "done"], ". Hashing jumps to the bucket, so a lookup is O(1) on average."], vals: [["value", buckets[w.b][w.j][1], "done"]] }));
      } else {
        w.out.push(F({ key: k, formula: w.fml, tones: t, say: ["\"" + k + "\" is not a key: its bucket's chain ended without a match."], vals: [["value", "not found", "hot"]] }));
      }
      lab.steps(w.out, render, { autoplay: true });
    }
    function set() {
      var k = readKey(); if (!k) return;
      var v = valIn.value.trim();
      if (!v) { KOS.ui.toast("Type a value to store.", true); return; }
      if (size() >= 24) { KOS.ui.toast("That is plenty of pairs — delete one or reset.", true); return; }
      var w = chainWalk(k), t = copy(w.tones), old = w.j >= 0 ? buckets[w.b][w.j][1] : null;
      if (w.j >= 0) buckets[w.b][w.j][1] = v; else buckets[w.b].push([k, v]);
      t[k] = "done-ring";
      w.out.push(F({ key: k, formula: w.fml, tones: t,
        say: w.j >= 0 ? ["\"" + k + "\" is already a key, so its value is replaced: " + old + " → ", [v, "done"], ". Keys stay unique."]
                      : ["\"" + k + "\" is new: add ", [k + " → " + v, "done"], " to the end of bucket " + w.b + "'s chain."],
        vals: [["value", (old != null ? old + " → " : "") + v, "done"]] }));
      lab.steps(w.out, render, { autoplay: true });
    }
    function del() {
      var k = readKey(); if (!k) return;
      var w = chainWalk(k);
      if (w.j < 0) {
        w.out.push(F({ key: k, formula: w.fml, tones: w.tones, say: ["\"" + k + "\" is not a key, so nothing is deleted."] }));
      } else {
        var t = copy(w.tones); t[k] = "hot-ring";
        w.out.push(F({ key: k, formula: w.fml, tones: t, say: ["Found \"" + k + "\": unlink it from the chain."] }));
        buckets[w.b].splice(w.j, 1);
        w.out.push(F({ key: k, formula: w.fml, tones: bucketTone(w.b), say: ["Deleted \"" + k + "\". With chaining nothing else moves, and no tombstone is needed."] }));
      }
      lab.steps(w.out, render, { autoplay: true });
    }
    idle();
  }

  [
    { id: "tl-list", title: "Linked list", subject: "compsci", ref: "4.2.1.4",
      desc: "Insert in order, append, delete and search a singly linked list, one pointer change at a time.", mount: listLab },
    { id: "tl-tree", title: "Binary search tree", subject: "compsci", ref: "4.2.5.1",
      desc: "Search, insert and delete in a BST, and run the pre-, in- and post-order traversals node by node.", mount: bstLab },
    { id: "hash-table", title: "Hash table", subject: "compsci", ref: "4.2.6.1",
      desc: "h(k) = k mod 11 with linear or quadratic probing: watch collisions step to a free slot, and deletes leave tombstones.", mount: hashLab },
    { id: "dictionary", title: "Dictionary", subject: "compsci", ref: "4.2.7.1",
      desc: "A key → value store backed by a chained hash table: get, set and delete by key, with the hash worked out.", mount: dictLab }
  ].forEach(function (s) { KOS.sims.register(s); });
})();
