/* Kurenai OS — labs/trace.js
   Data Structure Trace Lab: push, pop, enqueue, dequeue, insert and
   traverse on a live canvas, with pointer arithmetic shown and a
   trace table logging every operation. */
(function () {
  "use strict";
  var el = KOS.ui.el, store = KOS.store;

  var GOLD = "#F2C46D", CRIM = "#FF2E44", JADE = "#45d6a8", BLUE = "#7b9ef8",
      INKC = "#120d1b", LINE = "#3a2d52", TEXT = "#ece7f4", MUTE = "#a89dbf", FAINT = "#6f6488";

  /* shared animation clock */
  var animItems = [];   // {obj, key, to, speed}
  var rafId = null;
  function tween(obj, key, to) {
    animItems.push({ obj: obj, key: key, to: to });
    if (!rafId) tick();
  }
  function tick() {
    rafId = requestAnimationFrame(tick);
    var live = false;
    animItems = animItems.filter(function (a) {
      var cur = a.obj[a.key];
      var d = a.to - cur;
      if (Math.abs(d) < 0.6) { a.obj[a.key] = a.to; return false; }
      a.obj[a.key] = cur + d * 0.18;
      live = true;
      return true;
    });
    if (currentDraw) currentDraw();
    if (!live && animItems.length === 0 && flashes.length === 0) {
      cancelAnimationFrame(rafId); rafId = null;
    }
  }
  var flashes = []; // {x,y,w,h,until,color} transient highlights
  function flash(rect, color, ms) {
    flashes.push(Object.assign({ until: performance.now() + (ms || 700), color: color }, rect));
    if (!rafId) tick();
  }
  function drawFlashes(ctx) {
    var now = performance.now();
    flashes = flashes.filter(function (f) { return f.until > now; });
    flashes.forEach(function (f) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, (f.until - now) / 400) * 0.9;
      ctx.strokeStyle = f.color; ctx.lineWidth = 3;
      ctx.strokeRect(f.x, f.y, f.w, f.h);
      ctx.restore();
    });
  }

  var currentDraw = null;
  var canvas, ctx, W, H;

  function setupCanvas(holder, h) {
    canvas = el("canvas", { class: "labcanvas", "aria-label": "Data structure visualisation" });
    holder.appendChild(canvas);
    var dpr = window.devicePixelRatio || 1;
    W = holder.clientWidth - 2 || 920; H = h;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.height = H + "px";
    ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
  }
  function clear() { ctx.clearRect(0, 0, W, H); }
  function cellText(v, x, y, w, h, color) {
    ctx.fillStyle = color || TEXT;
    ctx.font = "600 15px 'SF Mono',Consolas,monospace";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(String(v), x + w / 2, y + h / 2);
  }
  function box(x, y, w, h, stroke, fill) {
    if (fill) { ctx.fillStyle = fill; ctx.fillRect(x, y, w, h); }
    ctx.strokeStyle = stroke || LINE; ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, w, h);
  }
  function label(t, x, y, color, align) {
    ctx.fillStyle = color || FAINT;
    ctx.font = "10px 'SF Mono',Consolas,monospace";
    ctx.textAlign = align || "center"; ctx.textBaseline = "middle";
    ctx.fillText(t, x, y);
  }
  function arrow(x1, y1, x2, y2, color) {
    ctx.strokeStyle = color || MUTE; ctx.fillStyle = color || MUTE; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    var a = Math.atan2(y2 - y1, x2 - x1);
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 9 * Math.cos(a - 0.42), y2 - 9 * Math.sin(a - 0.42));
    ctx.lineTo(x2 - 9 * Math.cos(a + 0.42), y2 - 9 * Math.sin(a + 0.42));
    ctx.fill();
  }

  /* trace table */
  var traceBody = null;
  function traceHead(holder, cols) {
    var tbl = el("table", { class: "trace-table" });
    tbl.appendChild(el("thead", {}, [el("tr", {}, cols.map(function (c) {
      return el("th", { text: c }); }))]));
    traceBody = el("tbody");
    tbl.appendChild(traceBody);
    holder.appendChild(tbl);
  }
  function traceRow(cells) {
    traceBody.appendChild(el("tr", {}, cells.map(function (c) {
      return el("td", { text: String(c) }); })));
    while (traceBody.children.length > 9) traceBody.removeChild(traceBody.firstChild);
  }

  function controlValue(input, fallback) {
    var v = input.value.trim();
    input.value = "";
    if (v === "") v = String(fallback);
    return v.slice(0, 4);
  }

  /* C# code panel beside each canvas: hl(line | [lines]) flashes the
     relevant statement for 500ms when an operation fires. */
  function codePanel(lines) {
    var pre = el("pre", { class: "code-panel", "aria-hidden": "true" });
    var timers = {};
    var spans = lines.map(function (ln) {
      var s = el("span", { class: "code-line",
        html: ln ? KOS.content.highlight(ln, "csharp") : "&nbsp;" });
      pre.appendChild(s);
      return s;
    });
    function hl(idx, ms) {
      (Array.isArray(idx) ? idx : [idx]).forEach(function (i) {
        var sp = spans[i];
        if (!sp) return;
        sp.classList.remove("hl");
        void sp.offsetWidth; /* restart the transition if already lit */
        sp.classList.add("hl");
        clearTimeout(timers[i]);
        timers[i] = setTimeout(function () { sp.classList.remove("hl"); }, ms || 500);
      });
    }
    return { el: pre, hl: hl };
  }
  function canvasWithCode(panel, lines) {
    var wrap = el("div", { class: "trace-flex" });
    var holder = el("div", { class: "trace-canvas" });
    var cp = codePanel(lines);
    wrap.appendChild(holder);
    wrap.appendChild(cp.el);
    panel.appendChild(wrap);
    return { holder: holder, hl: cp.hl };
  }

  /* ====================== STACK ====================== */
  function stackLab(panel) {
    var CAP = 8, items = [], sp = -1; // items: {v, y(animated)}
    var ctrl = el("div", { class: "lab-controls" });
    var valIn = el("input", { type: "text", placeholder: "value", maxlength: 4, style: "width:90px" });
    ctrl.appendChild(el("label", {}, ["push value", valIn]));
    ctrl.appendChild(el("button", { class: "btn primary", text: "Push", onclick: push }));
    ctrl.appendChild(el("button", { class: "btn", text: "Pop", onclick: pop }));
    ctrl.appendChild(el("button", { class: "btn", text: "Peek", onclick: peek }));
    ctrl.appendChild(el("button", { class: "btn gold", text: "Reset", onclick: function () {
      items = []; sp = -1; traceRow(["reset", "—", "-1", render() || "empty"]); draw(); } }));
    panel.appendChild(ctrl);
    var cc = canvasWithCode(panel, [
      "// Stack<T> — LIFO",
      "stack.Push(value);       // SP = SP + 1",
      "var top = stack.Pop();   // SP = SP - 1",
      "var t = stack.Peek();    // SP unchanged",
      "// full?   SP == capacity - 1",
      "// empty?  SP == -1"
    ]);
    var holder = cc.holder;
    setupCanvas(holder, 360);
    traceHead(panel, ["operation", "value", "SP after", "stack (bottom → top)"]);

    var CW = 130, CH = 34, X = W / 2 - CW / 2, BOT = H - 40;
    function slotY(i) { return BOT - (i + 1) * (CH + 4); }
    function render() { return items.map(function (i) { return i.v; }).join(" "); }

    function push() {
      if (sp + 1 >= CAP) { cc.hl(4); KOS.ui.toast("Stack overflow — test for full BEFORE pushing.", true); traceRow(["push", "—", sp, "FULL — rejected"]); return; }
      cc.hl(1);
      var v = controlValue(valIn, Math.floor(Math.random() * 90) + 10);
      sp++;
      var item = { v: v, y: -CH };
      items.push(item);
      tween(item, "y", slotY(sp));
      flash({ x: X, y: slotY(sp), w: CW, h: CH }, JADE);
      traceRow(["push", v, sp, render()]);
    }
    function pop() {
      if (sp < 0) { cc.hl(5); KOS.ui.toast("Stack underflow — test for empty BEFORE popping.", true); traceRow(["pop", "—", sp, "EMPTY — rejected"]); return; }
      cc.hl(2);
      var item = items.pop();
      traceRow(["pop", item.v, sp - 1, ""]);
      sp--;
      flash({ x: X, y: item.y, w: CW, h: CH }, CRIM);
      tween(item, "y", -CH - 10);
      setTimeout(function () { draw(); }, 450);
      traceBody.lastChild.children[3].textContent = render();
    }
    function peek() {
      if (sp < 0) { cc.hl(5); KOS.ui.toast("Stack is empty — nothing to peek.", true); return; }
      cc.hl(3);
      flash({ x: X, y: slotY(sp), w: CW, h: CH }, GOLD, 1100);
      traceRow(["peek", items[sp].v, sp, render() + "  (unchanged)"]);
    }

    function draw() {
      clear();
      label("STACK — LIFO · capacity " + CAP, W / 2, 18, MUTE);
      for (var i = 0; i < CAP; i++) {
        box(X, slotY(i), CW, CH, LINE);
        label(String(i), X - 16, slotY(i) + CH / 2, FAINT, "right");
      }
      items.forEach(function (it, i) {
        if (it.y > -CH - 5) {
          box(X, it.y, CW, CH, JADE, "rgba(69,214,168,.08)");
          cellText(it.v, X, it.y, CW, CH);
        }
      });
      // SP arrow
      var spy = sp >= 0 ? slotY(sp) + CH / 2 : BOT + 6;
      arrow(X + CW + 64, spy, X + CW + 14, spy, GOLD);
      label("SP = " + sp, X + CW + 78, spy, GOLD, "left");
      drawFlashes(ctx);
    }
    currentDraw = draw;
    draw();
  }

  /* ====================== QUEUE ====================== */
  function queueLab(panel) {
    var CAP = 8, slots = new Array(CAP).fill(null), front = 0, rear = -1, size = 0, circular = true;
    var ctrl = el("div", { class: "lab-controls" });
    var valIn = el("input", { type: "text", placeholder: "value", maxlength: 4, style: "width:90px" });
    var mode = el("select", {}, [
      el("option", { value: "circular", text: "circular queue" }),
      el("option", { value: "linear", text: "linear queue" })
    ]);
    mode.onchange = function () { circular = mode.value === "circular"; reset(); };
    ctrl.appendChild(el("label", {}, ["mode", mode]));
    ctrl.appendChild(el("label", {}, ["enqueue value", valIn]));
    ctrl.appendChild(el("button", { class: "btn primary", text: "Enqueue", onclick: enq }));
    ctrl.appendChild(el("button", { class: "btn", text: "Dequeue", onclick: deq }));
    ctrl.appendChild(el("button", { class: "btn gold", text: "Reset", onclick: reset }));
    panel.appendChild(ctrl);
    var cc = canvasWithCode(panel, [
      "// Queue<T> — FIFO",
      "queue.Enqueue(value);",
      "//   rear = (rear + 1) % maxSize;",
      "var v = queue.Dequeue();",
      "//   front = (front + 1) % maxSize;",
      "// full?   size == maxSize",
      "// empty?  size == 0"
    ]);
    var holder = cc.holder;
    setupCanvas(holder, 250);
    traceHead(panel, ["operation", "value", "front", "rear", "pointer arithmetic"]);

    var CW = Math.min(96, (W - 80) / CAP), CH = 52;
    var X0 = (W - CW * CAP) / 2, Y = 90;

    function reset() {
      slots = new Array(CAP).fill(null); front = 0; rear = -1; size = 0;
      traceRow(["reset", "—", front, rear, circular ? "circular mode" : "linear mode"]);
      draw();
    }
    function enq() {
      var full = circular ? size >= CAP : rear + 1 >= CAP;
      if (full) {
        cc.hl(5);
        KOS.ui.toast(circular ? "Queue full (size = capacity)." : "Rear hit the end — a LINEAR queue wastes the freed cells at the front. Switch to circular.", true);
        traceRow(["enqueue", "—", front, rear, "FULL — rejected"]);
        return;
      }
      cc.hl([1, 2]);
      var v = controlValue(valIn, Math.floor(Math.random() * 90) + 10);
      var newRear = circular ? (rear + 1) % CAP : rear + 1;
      var arith = circular
        ? "rear ← (rear + 1) MOD " + CAP + " = (" + rear + "+1) MOD " + CAP + " = " + newRear
        : "rear ← rear + 1 = " + newRear;
      rear = newRear;
      slots[rear] = { v: v, a: 0 };
      tween(slots[rear], "a", 1);
      size++;
      flash({ x: X0 + rear * CW, y: Y, w: CW, h: CH }, JADE);
      traceRow(["enqueue", v, front, rear, arith]);
    }
    function deq() {
      if (size === 0) {
        cc.hl(6);
        KOS.ui.toast("Queue empty — test before dequeuing.", true);
        traceRow(["dequeue", "—", front, rear, "EMPTY — rejected"]);
        return;
      }
      cc.hl([3, 4]);
      var v = slots[front] ? slots[front].v : "?";
      flash({ x: X0 + front * CW, y: Y, w: CW, h: CH }, CRIM);
      slots[front] = null;
      var newFront = circular ? (front + 1) % CAP : front + 1;
      var arith = circular
        ? "front ← (front + 1) MOD " + CAP + " = " + newFront
        : "front ← front + 1 = " + newFront + "  (cell " + front + " now wasted)";
      front = newFront;
      size--;
      traceRow(["dequeue", v, front, rear, arith]);
      draw();
    }
    function draw() {
      clear();
      label((circular ? "CIRCULAR" : "LINEAR") + " QUEUE — FIFO · capacity " + CAP + " · size " + size, W / 2, 22, MUTE);
      for (var i = 0; i < CAP; i++) {
        var x = X0 + i * CW;
        box(x, Y, CW, CH, LINE);
        label(String(i), x + CW / 2, Y - 12, FAINT);
        var s = slots[i];
        if (s) {
          ctx.save(); ctx.globalAlpha = s.a;
          box(x, Y, CW, CH, JADE, "rgba(69,214,168,.08)");
          cellText(s.v, x, Y, CW, CH);
          ctx.restore();
        }
      }
      if (size > 0 || rear >= 0) {
        var fx = X0 + (front % CAP) * CW + CW / 2;
        arrow(fx, Y + CH + 44, fx, Y + CH + 8, BLUE);
        label("front = " + front, fx, Y + CH + 56, BLUE);
        if (rear >= 0) {
          var rx = X0 + (rear % CAP) * CW + CW / 2;
          arrow(rx, Y - 52 + 8, rx, Y - 22, GOLD);
          label("rear = " + rear, rx, Y - 56, GOLD);
        }
      }
      if (circular) {
        label("wrap: index MOD " + CAP, W / 2, H - 14, FAINT);
      }
      drawFlashes(ctx);
    }
    currentDraw = draw;
    reset();
  }

  /* ====================== LINKED LIST ====================== */
  function listLab(panel) {
    var nodes = []; // {v, x(anim), y}
    var ctrl = el("div", { class: "lab-controls" });
    var valIn = el("input", { type: "text", placeholder: "value", maxlength: 4, style: "width:90px" });
    ctrl.appendChild(el("label", {}, ["value", valIn]));
    ctrl.appendChild(el("button", { class: "btn primary", text: "Append (tail)", onclick: function () { add(false); } }));
    ctrl.appendChild(el("button", { class: "btn", text: "Prepend (head)", onclick: function () { add(true); } }));
    ctrl.appendChild(el("button", { class: "btn", text: "Remove value", onclick: removeVal }));
    ctrl.appendChild(el("button", { class: "btn gold", text: "Reset", onclick: function () { nodes = []; traceRow(["reset", "—", "list empty"]); draw(); } }));
    panel.appendChild(ctrl);
    var cc = canvasWithCode(panel, [
      "// LinkedList<T>",
      "list.AddLast(value);    // append at tail",
      "list.AddFirst(value);   // prepend at head",
      "// remove: traverse from the head",
      "var cur = list.First;",
      "while (cur != null && cur.Value != v)",
      "    cur = cur.Next;",
      "if (cur != null) list.Remove(cur);"
    ]);
    var holder = cc.holder;
    setupCanvas(holder, 230);
    traceHead(panel, ["operation", "value", "list after (head → tail)"]);

    var NW = 74, NH = 46, GAP = 44, Y = 100;
    function targetX(i) { return 60 + i * (NW + GAP); }
    function listStr() { return nodes.length ? nodes.map(function (n) { return n.v; }).join(" → ") + " → null" : "empty"; }

    function add(atHead) {
      if (nodes.length >= 9) { KOS.ui.toast("Canvas is full — remove something first.", true); return; }
      cc.hl(atHead ? 2 : 1);
      var v = controlValue(valIn, Math.floor(Math.random() * 90) + 10);
      var node = { v: v, x: atHead ? -NW : W + 10, y: Y };
      if (atHead) nodes.unshift(node); else nodes.push(node);
      relayout();
      flash({ x: targetX(atHead ? 0 : nodes.length - 1), y: Y, w: NW, h: NH }, JADE);
      traceRow([atHead ? "prepend" : "append", v, listStr()]);
    }
    function removeVal() {
      var v = valIn.value.trim();
      if (!v) { KOS.ui.toast("Type the value to remove.", true); return; }
      valIn.value = "";
      var idx = nodes.findIndex(function (n) { return n.v === v; });
      // traversal animation: highlight each node until found
      cc.hl(4);
      var i = 0;
      (function step() {
        if (i < nodes.length) {
          flash({ x: nodes[i].x, y: Y, w: NW, h: NH }, i === idx ? CRIM : GOLD, 380);
          cc.hl(i === idx ? 7 : [5, 6], 350);
          if (i === idx) {
            setTimeout(function () {
              nodes.splice(idx, 1);
              relayout();
              traceRow(["remove", v, listStr()]);
            }, 420);
            return;
          }
          i++;
          setTimeout(step, 300);
        } else {
          KOS.ui.toast("\u201C" + v + "\u201D isn't in the list — traversal reached null.", true);
          traceRow(["remove", v, "not found — " + listStr()]);
        }
      })();
    }
    function relayout() {
      nodes.forEach(function (n, i) { tween(n, "x", targetX(i)); });
      draw();
    }
    function draw() {
      clear();
      label("LINKED LIST — dynamic, traversed from the head pointer", W / 2, 20, MUTE);
      if (!nodes.length) { label("empty — head = null", W / 2, Y + NH / 2, FAINT); drawFlashes(ctx); return; }
      // head pointer
      arrow(24, Y - 34, nodes[0].x + 18, Y - 4, BLUE);
      label("head", 24, Y - 46, BLUE);
      nodes.forEach(function (n, i) {
        box(n.x, Y, NW, NH, JADE, "rgba(69,214,168,.06)");
        ctx.beginPath(); ctx.strokeStyle = LINE;
        ctx.moveTo(n.x + NW - 20, Y); ctx.lineTo(n.x + NW - 20, Y + NH); ctx.stroke();
        cellText(n.v, n.x, Y, NW - 20, NH);
        // next pointer
        var nx = n.x + NW - 10, ny = Y + NH / 2;
        if (i < nodes.length - 1) {
          arrow(nx, ny, nodes[i + 1].x - 4, ny, MUTE);
        } else {
          arrow(nx, ny, nx + 26, ny, MUTE);
          label("null", nx + 44, ny, FAINT, "left");
        }
        ctx.fillStyle = GOLD;
        ctx.beginPath(); ctx.arc(n.x + NW - 10, ny, 3, 0, 7); ctx.fill();
      });
      drawFlashes(ctx);
    }
    currentDraw = draw;
    draw();
  }

  /* ====================== BINARY SEARCH TREE ====================== */
  function treeLab(panel) {
    var root = null, count = 0;
    var ctrl = el("div", { class: "lab-controls" });
    var valIn = el("input", { type: "number", placeholder: "number", style: "width:100px" });
    ctrl.appendChild(el("label", {}, ["insert number", valIn]));
    ctrl.appendChild(el("button", { class: "btn primary", text: "Insert", onclick: insert }));
    ctrl.appendChild(el("button", { class: "btn", text: "Pre-order", onclick: function () { traverse("pre"); } }));
    ctrl.appendChild(el("button", { class: "btn", text: "In-order", onclick: function () { traverse("in"); } }));
    ctrl.appendChild(el("button", { class: "btn", text: "Post-order", onclick: function () { traverse("post"); } }));
    ctrl.appendChild(el("button", { class: "btn gold", text: "Reset", onclick: function () { root = null; count = 0; traceRow(["reset", "—", "tree empty"]); draw(); } }));
    panel.appendChild(ctrl);
    var cc = canvasWithCode(panel, [
      "void Insert(Node n, int v) {",
      "    if (v < n.Value) Insert(n.Left, v);",
      "    else Insert(n.Right, v);",
      "}",
      "void PreOrder(n)  { Visit(n); PreOrder(n.L); PreOrder(n.R); }",
      "void InOrder(n)   { InOrder(n.L); Visit(n); InOrder(n.R); }",
      "void PostOrder(n) { PostOrder(n.L); PostOrder(n.R); Visit(n); }"
    ]);
    var holder = cc.holder;
    setupCanvas(holder, 380);
    traceHead(panel, ["operation", "value / order", "detail"]);

    var R = 19;

    function insert() {
      if (count >= 15) { KOS.ui.toast("Tree's getting crowded — reset to start over.", true); return; }
      var raw = valIn.value.trim();
      var v = raw === "" ? Math.floor(Math.random() * 99) + 1 : parseInt(raw, 10);
      valIn.value = "";
      if (isNaN(v)) { KOS.ui.toast("Insert needs a number.", true); return; }
      var path = [];
      if (!root) {
        root = { v: v, l: null, r: null, x: W / 2, y: 60 };
        count++;
        traceRow(["insert", v, "tree was empty → becomes the root"]);
        layout(); draw();
        return;
      }
      var cur = root, wentLeft = false;
      while (true) {
        path.push(cur.v + (v < cur.v ? " → go left" : v > cur.v ? " → go right" : " (duplicate)"));
        if (v === cur.v) { KOS.ui.toast(v + " is already in the tree — BSTs hold unique keys here.", true); traceRow(["insert", v, "duplicate rejected"]); return; }
        wentLeft = v < cur.v;
        if (v < cur.v) { if (!cur.l) { cur.l = { v: v, l: null, r: null, x: cur.x, y: cur.y }; break; } cur = cur.l; }
        else { if (!cur.r) { cur.r = { v: v, l: null, r: null, x: cur.x, y: cur.y }; break; } cur = cur.r; }
      }
      count++;
      cc.hl([0, wentLeft ? 1 : 2, 3], 900);
      traceRow(["insert", v, path.join(", ")]);
      layout();
      animPath(v);
    }
    function animPath(v) {
      // flash each comparison node down to the new node
      var seq = [], cur = root;
      while (cur) { seq.push(cur); if (v === cur.v) break; cur = v < cur.v ? cur.l : cur.r; }
      seq.forEach(function (n, i) {
        setTimeout(function () {
          flash({ x: n.x - R, y: n.y - R, w: R * 2, h: R * 2 }, i === seq.length - 1 ? JADE : GOLD, 420);
        }, i * 260);
      });
    }
    function layout() {
      // in-order index → x position; depth → y
      var idx = 0, n = count;
      (function walk(node, depth) {
        if (!node) return;
        walk(node.l, depth + 1);
        var tx = (idx + 1) * (W / (n + 1));
        idx++;
        tween(node, "x", tx);
        tween(node, "y", 56 + depth * 64);
        walk(node.r, depth + 1);
      })(root, 0);
    }
    function traverse(kind) {
      if (!root) { KOS.ui.toast("Insert some numbers first.", true); return; }
      cc.hl({ pre: 4, in: 5, post: 6 }[kind], 1600);
      var order = [];
      (function walk(n) {
        if (!n) return;
        if (kind === "pre") order.push(n);
        walk(n.l);
        if (kind === "in") order.push(n);
        walk(n.r);
        if (kind === "post") order.push(n);
      })(root);
      order.forEach(function (n, i) {
        setTimeout(function () {
          flash({ x: n.x - R, y: n.y - R, w: R * 2, h: R * 2 }, CRIM, 460);
        }, i * 380);
      });
      var name = { pre: "pre-order (N L R)", in: "in-order (L N R)", post: "post-order (L R N)" }[kind];
      traceRow(["traverse", name, order.map(function (n) { return n.v; }).join(", ") +
        (kind === "in" ? "  — sorted ascending, as a BST guarantees" : "")]);
    }
    function draw() {
      clear();
      label("BINARY SEARCH TREE — left < node < right", W / 2, 18, MUTE);
      if (!root) { label("empty — insert a number", W / 2, H / 2, FAINT); drawFlashes(ctx); return; }
      (function edges(n) {
        if (!n) return;
        [n.l, n.r].forEach(function (c) {
          if (c) {
            ctx.strokeStyle = LINE; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(c.x, c.y); ctx.stroke();
          }
        });
        edges(n.l); edges(n.r);
      })(root);
      (function dots(n) {
        if (!n) return;
        ctx.fillStyle = INKC;
        ctx.beginPath(); ctx.arc(n.x, n.y, R, 0, 7); ctx.fill();
        ctx.strokeStyle = BLUE; ctx.lineWidth = 1.8; ctx.stroke();
        ctx.fillStyle = TEXT;
        ctx.font = "600 13px 'SF Mono',Consolas,monospace";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(String(n.v), n.x, n.y);
        dots(n.l); dots(n.r);
      })(root);
      drawFlashes(ctx);
    }
    currentDraw = draw;
    draw();
  }

  /* ====================== view ====================== */
  var TABS = [
    ["stack", "Stack (LIFO)", stackLab, "4.2.3.1"],
    ["queue", "Queue (FIFO)", queueLab, "4.2.2.1"],
    ["list", "Linked list", listLab, "4.2.1.4"],
    ["tree", "Binary search tree", treeLab, "4.2.5.1 / 4.3.2.1"]
  ];

  KOS.views.trace = function (main) {
    document.getElementById("tree").classList.add("hidden");
    document.getElementById("cols").classList.add("no-tree");

    main.appendChild(el("div", { class: "lab-h" }, [
      el("h1", { text: "Data Structure Trace Lab" }),
      el("p", { class: "sub", text: "Push, pop, enqueue and dequeue with live pointer arithmetic on the canvas. Every operation lands in the trace table underneath — exactly the evidence an AQA trace question wants." })
    ]));

    var tabs = el("div", { class: "lab-tabs" });
    var panel = el("div", { class: "lab-panel lab-wrap" });
    var current = store.state.trace.tab || "stack";

    TABS.forEach(function (t) {
      tabs.appendChild(el("button", {
        class: "lab-tab" + (t[0] === current ? " active" : ""),
        onclick: function () {
          current = t[0];
          store.state.trace.tab = current; store.save();
          tabs.querySelectorAll(".lab-tab").forEach(function (b, i) {
            b.classList.toggle("active", TABS[i][0] === current);
          });
          open(t);
        }
      }, [t[1]]));
    });
    main.appendChild(tabs);
    main.appendChild(panel);

    function open(t) {
      currentDraw = null; flashes = []; animItems = [];
      panel.innerHTML = "";
      panel.appendChild(el("div", { class: "specref", style: "font-family:var(--mono);font-size:10.5px;color:var(--faint);margin-bottom:10px",
        text: "AQA 7517 · " + t[3] }));
      t[2](panel);
    }
    open(TABS.find(function (t) { return t[0] === current; }) || TABS[0]);
  };

  /* expose each structure so a topic's Simulate tab can mount it INLINE
     (sims.js wires these) instead of redirecting to the full Trace Lab view */
  var LABFN = { stack: stackLab, queue: queueLab, list: listLab, tree: treeLab };
  KOS.traceLabs = {
    has: function (tab) { return !!LABFN[tab]; },
    mount: function (tab, panel) {
      currentDraw = null; flashes = []; animItems = [];   // isolate from any prior canvas
      if (LABFN[tab]) LABFN[tab](panel);
    }
  };
})();
