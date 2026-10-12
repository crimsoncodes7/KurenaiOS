/* Kurenai OS — labs/trace.js
   The Trace Lab (design part 2, frame 20f): code · structure · trace.

   Three columns in a fixed order. The code pane shows the procedure being
   run in AQA-style pseudocode, the running line lit crimson with ▶ in the
   gutter. The structure is a 20a diagram on the lab system's stage, and
   the cell just written is teal. The trace table gains one row per line
   executed, the newest lit; a dashed row shows where the next will land.

   Every operation (push, enqueue, append, insert, a traversal) is run
   once, up front, by a small interpreter that records each line it
   executes; the lab replays those lines. With "Break at each line" off an
   operation lands on its last line at once and the table holds every row;
   with it on, the operation stops on its first line and Step › or ▶ Run
   walks it, so the three columns stay in step.

   Stack and Queue also mount on their topic's Simulate tab
   (KOS.traceLabs.mount); the linked list and the BST there are the 20a
   sims in sims-structures.js. */
(function () {
  "use strict";
  var el = KOS.ui.el, store = KOS.store, L = KOS.lab;
  function rnd() { return 1 + Math.floor(Math.random() * 99); }
  function copy(x) { return JSON.parse(JSON.stringify(x)); }

  /* ====================== the four programs ====================== */
  var STACK_MAX = 5, QUEUE_MAX = 5;
  var KINDS = {
    stack: {
      label: "Stack", ref: "4.2.3.1", columns: ["call", "line", "item", "top", "stack[top]"],
      init: function () { return { a: new Array(STACK_MAX).fill(null), top: -1 }; },
      code: {
        push: ["PROCEDURE push(item)", "  IF top = max - 1 THEN", "    OUTPUT \"Stack overflow\"", "  ELSE", "    top ← top + 1", "    stack[top] ← item", "  ENDIF", "ENDPROCEDURE"],
        pop: ["FUNCTION pop()", "  IF top = -1 THEN", "    OUTPUT \"Stack underflow\"", "  ELSE", "    item ← stack[top]", "    top ← top - 1", "    RETURN item", "  ENDIF", "ENDFUNCTION"],
        peek: ["FUNCTION peek()", "  IF top = -1 THEN", "    OUTPUT \"Stack empty\"", "  ELSE", "    RETURN stack[top]", "  ENDIF", "ENDFUNCTION"]
      },
      ops: [
        { label: "Push", primary: true, value: true, run: function (m, v, rec) {
          var call = "push(" + v + ")";
          rec("push", 2, [call, 2, v, m.top, "·"], "top = " + m.top + " and max − 1 = " + (STACK_MAX - 1) + ": " + (m.top === STACK_MAX - 1 ? "the stack is full." : "there is room."));
          if (m.top === STACK_MAX - 1) { rec("push", 3, [call, 3, v, m.top, "·"], "The stack is full: OUTPUT \"Stack overflow\".", { out: "Stack overflow" }); return { toast: "Stack overflow — check top = max − 1 BEFORE pushing.", bad: true }; }
          m.top++; rec("push", 5, [call, 5, v, m.top, "·"], "top moves up to " + m.top + ".", { hot: m.top });
          m.a[m.top] = v; rec("push", 6, [call, 6, v, m.top, v], "Line 6 stores " + v + " at stack[" + m.top + "].", { hot: m.top, wrote: m.top });
        } },
        { label: "Pop", run: function (m, v, rec) {
          rec("pop", 2, ["pop()", 2, "·", m.top, m.top >= 0 ? m.a[m.top] : "·"], "top = " + m.top + (m.top === -1 ? ": the stack is empty." : ": there is something to pop."));
          if (m.top === -1) { rec("pop", 3, ["pop()", 3, "·", -1, "·"], "Nothing to pop: OUTPUT \"Stack underflow\".", { out: "Stack underflow" }); return { toast: "Stack underflow — test for empty BEFORE popping.", bad: true }; }
          var item = m.a[m.top]; rec("pop", 5, ["pop()", 5, item, m.top, item], "item takes stack[" + m.top + "], which is " + item + ".", { hot: m.top });
          m.a[m.top] = null; m.top--; rec("pop", 6, ["pop()", 6, item, m.top, m.top >= 0 ? m.a[m.top] : "·"], "top drops to " + m.top + ". The old cell is free; its value need not be cleared.", { hot: m.top + 1, gone: m.top + 1 });
          rec("pop", 7, ["pop()", 7, item, m.top, m.top >= 0 ? m.a[m.top] : "·"], "RETURN " + item + ": last in, first out.", { out: String(item) });
        } },
        { label: "Peek", run: function (m, v, rec) {
          rec("peek", 2, ["peek()", 2, "·", m.top, m.top >= 0 ? m.a[m.top] : "·"], "top = " + m.top + ".");
          if (m.top === -1) { rec("peek", 3, ["peek()", 3, "·", -1, "·"], "Nothing to peek at: OUTPUT \"Stack empty\".", { out: "Stack empty" }); return { toast: "Stack is empty — nothing to peek.", bad: true }; }
          rec("peek", 5, ["peek()", 5, m.a[m.top], m.top, m.a[m.top]], "RETURN stack[" + m.top + "] = " + m.a[m.top] + ", without removing it.", { hot: m.top, out: String(m.a[m.top]) });
        } }
      ],
      draw: function (d, m, f) {
        var CW = 200, CH = 64, X = 120, B = 500;
        for (var i = 0; i < STACK_MAX; i++) {
          var y = B - (i + 1) * (CH + 6), v = m.a[i], tone = f.wrote === i ? "new" : f.gone === i ? "hot-ring" : f.hot === i ? "front" : i <= m.top ? null : "well";
          d.rect(X, y, CW, CH, { rx: 10, tone: tone });
          d.text(X + CW / 2, y + 40, v == null || i > m.top && f.gone !== i ? "" : String(v), { size: 18, weight: "bold", tone: f.gone === i ? "mute" : null });
          d.text(X - 16, y + 38, String(i), { size: 15, tone: "mute", anchor: "end" });
        }
        if (m.top >= 0) {
          var ty = B - (m.top + 1) * (CH + 6) + CH / 2;
          d.line(X + CW + 56, ty, X + CW + 10, ty, { tone: "ink", arrow: true });
          d.text(X + CW + 30, ty - 14, "top = " + m.top, { size: 15, weight: "bold", tone: "ink" });
        } else d.text(X + CW / 2, B - 2 * (CH + 6) - 30, "top = −1 (empty)", { size: 15, tone: "mute" });
        d.text(X + CW / 2, B + 34, "stack · max = " + STACK_MAX, { size: 14, tone: "mute" });
        return { w: 480, h: 600 };
      }
    },

    queue: {
      label: "Queue", ref: "4.2.2.1", columns: ["call", "line", "item", "front", "rear", "size", "working"],
      init: function () { return { a: new Array(QUEUE_MAX).fill(null), front: 0, rear: -1, size: 0, circular: true }; },
      code: {
        enqueue: ["PROCEDURE enqueue(item)", "  IF size = max THEN", "    OUTPUT \"Queue full\"", "  ELSE", "    rear ← (rear + 1) MOD max", "    queue[rear] ← item", "    size ← size + 1", "  ENDIF", "ENDPROCEDURE"],
        enqueueL: ["PROCEDURE enqueue(item)", "  IF rear = max - 1 THEN", "    OUTPUT \"Queue full\"", "  ELSE", "    rear ← rear + 1", "    queue[rear] ← item", "    size ← size + 1", "  ENDIF", "ENDPROCEDURE"],
        dequeue: ["FUNCTION dequeue()", "  IF size = 0 THEN", "    OUTPUT \"Queue empty\"", "  ELSE", "    item ← queue[front]", "    front ← (front + 1) MOD max", "    size ← size - 1", "    RETURN item", "  ENDIF", "ENDFUNCTION"],
        dequeueL: ["FUNCTION dequeue()", "  IF size = 0 THEN", "    OUTPUT \"Queue empty\"", "  ELSE", "    item ← queue[front]", "    front ← front + 1", "    size ← size - 1", "    RETURN item", "  ENDIF", "ENDFUNCTION"]
      },
      ops: [
        { label: "Enqueue", primary: true, value: true, run: function (m, v, rec) {
          var c = m.circular, p = c ? "enqueue" : "enqueueL", call = "enqueue(" + v + ")";
          var full = c ? m.size === QUEUE_MAX : m.rear === QUEUE_MAX - 1;
          rec(p, 2, [call, 2, v, m.front, m.rear, m.size, c ? "size = " + m.size : "rear = " + m.rear], full ? "The queue is full." : "There is room.");
          if (full) { rec(p, 3, [call, 3, v, m.front, m.rear, m.size, ""], c ? "Full: every slot holds an item." : "Full: rear reached the end. A linear queue cannot reuse the slots the front has left behind — a circular queue can.", { out: "Queue full" }); return { toast: "Queue overflow — " + (c ? "all " + QUEUE_MAX + " slots are in use." : "rear is at the end; the freed slots at the front cannot be reused."), bad: true }; }
          var old = m.rear;
          m.rear = c ? (m.rear + 1) % QUEUE_MAX : m.rear + 1;
          var work = c ? "(" + old + " + 1) MOD " + QUEUE_MAX + " = " + m.rear : old + " + 1 = " + m.rear;
          rec(p, 5, [call, 5, v, m.front, m.rear, m.size, work], c && m.rear < old ? "rear wraps round to " + m.rear + ": (" + old + " + 1) MOD " + QUEUE_MAX + " = 0." : "rear moves on to " + m.rear + ".", { hot: m.rear });
          m.a[m.rear] = v; rec(p, 6, [call, 6, v, m.front, m.rear, m.size, work], "Store " + v + " at queue[" + m.rear + "].", { hot: m.rear, wrote: m.rear });
          m.size++; rec(p, 7, [call, 7, v, m.front, m.rear, m.size, work], "size is now " + m.size + ".", { wrote: m.rear });
        } },
        { label: "Dequeue", run: function (m, v, rec) {
          var c = m.circular, p = c ? "dequeue" : "dequeueL";
          rec(p, 2, ["dequeue()", 2, "·", m.front, m.rear, m.size, "size = " + m.size], m.size ? "There is an item to take." : "The queue is empty.");
          if (!m.size) { rec(p, 3, ["dequeue()", 3, "·", m.front, m.rear, 0, ""], "Nothing to take: OUTPUT \"Queue empty\".", { out: "Queue empty" }); return { toast: "Queue underflow — the queue is empty.", bad: true }; }
          var item = m.a[m.front], old = m.front; rec(p, 5, ["dequeue()", 5, item, m.front, m.rear, m.size, ""], "item takes queue[" + m.front + "] = " + item + ": first in, first out.", { hot: m.front });
          m.a[m.front] = null; m.front = c ? (m.front + 1) % QUEUE_MAX : m.front + 1;
          var work = c ? "(" + old + " + 1) MOD " + QUEUE_MAX + " = " + m.front : old + " + 1 = " + m.front;
          rec(p, 6, ["dequeue()", 6, item, m.front, m.rear, m.size, work], "front moves on to " + m.front + ".", { hot: m.front, gone: old });
          m.size--; rec(p, 7, ["dequeue()", 7, item, m.front, m.rear, m.size, work], "size is now " + m.size + ".");
          rec(p, 8, ["dequeue()", 8, item, m.front, m.rear, m.size, work], "RETURN " + item + ".", { out: String(item) });
        } }
      ],
      draw: function (d, m, f) {
        var CW = 74, G = 12, n = QUEUE_MAX, X0 = (480 - (n * CW + (n - 1) * G)) / 2, Y = 250;
        for (var i = 0; i < n; i++) {
          var x = X0 + i * (CW + G), live = m.size && (m.circular ? ((i - m.front + n) % n) < m.size : i >= m.front && i <= m.rear);
          var tone = f.wrote === i ? "new" : f.gone === i ? "hot-ring" : f.hot === i ? "front" : live ? null : "well";
          d.rect(x, Y, CW, 62, { rx: 10, tone: tone });
          if (live || f.gone === i) d.text(x + CW / 2, Y + 39, m.a[i] == null ? "" : String(m.a[i]), { size: 18, weight: "bold" });
          d.text(x + CW / 2, Y + 90, String(i), { size: 14, tone: "mute" });
        }
        function ptr(i, name, up, tone) {
          var x = X0 + i * (CW + G) + CW / 2;
          if (up) { d.line(x, Y - 44, x, Y - 4, { tone: tone, arrow: true }); d.text(x, Y - 52, name, { size: 15, weight: "bold", tone: tone }); }
          else { d.line(x, Y + 146, x, Y + 104, { tone: tone, arrow: true }); d.text(x, Y + 166, name, { size: 15, weight: "bold", tone: tone }); }
        }
        ptr(m.front, "front = " + m.front, true, "ink");
        if (m.rear >= 0 && m.rear < n) ptr(m.rear, "rear = " + m.rear, false, "front");
        if (m.circular) d.path("M" + (X0 + (n - 1) * (CW + G) + CW / 2) + " " + (Y - 4) + " C" + (X0 + (n - 1) * (CW + G) + CW / 2) + " " + (Y - 110) + " " + (X0 + CW / 2) + " " + (Y - 110) + " " + (X0 + CW / 2) + " " + (Y - 60), { tone: "line", dash: true });
        d.text(240, 520, (m.circular ? "circular" : "linear") + " queue · max = " + n, { size: 14, tone: "mute" });
        d.text(240, 544, "size = " + m.size, { size: 14, tone: "mute" });
        return { w: 480, h: 600 };
      }
    },

    list: {
      label: "Linked list", ref: "4.2.1.4", columns: ["call", "line", "value", "cur", "list"],
      init: function () { return { nodes: [], seq: 0 }; },
      code: {
        append: ["PROCEDURE append(value)", "  new ← Node(value)", "  IF head = null THEN", "    head ← new", "  ELSE", "    cur ← head", "    WHILE cur.next ≠ null", "      cur ← cur.next", "    ENDWHILE", "    cur.next ← new", "  ENDIF", "ENDPROCEDURE"],
        prepend: ["PROCEDURE prepend(value)", "  new ← Node(value)", "  new.next ← head", "  head ← new", "ENDPROCEDURE"],
        remove: ["PROCEDURE remove(value)", "  prev ← null", "  cur ← head", "  WHILE cur ≠ null AND cur.value ≠ value", "    prev ← cur", "    cur ← cur.next", "  ENDWHILE", "  IF cur = null THEN", "    OUTPUT \"Not found\"", "  ELSE IF prev = null THEN", "    head ← cur.next", "  ELSE", "    prev.next ← cur.next", "  ENDIF", "ENDPROCEDURE"]
      },
      ops: [
        { label: "Append (tail)", primary: true, value: true, run: function (m, v, rec) {
          if (m.nodes.length >= 9) return { toast: "That is plenty to trace — remove something first.", bad: true };
          var call = "append(" + v + ")", s = function () { return listStr(m); };
          rec("append", 2, [call, 2, v, "·", s()], "Make a node holding " + v + ".", { fresh: v });
          rec("append", 3, [call, 3, v, "·", s()], m.nodes.length ? "head is not null, so walk to the end." : "The list is empty.", { fresh: v });
          if (!m.nodes.length) { m.nodes.push(v); rec("append", 4, [call, 4, v, "·", s()], "head ← new: the node is the whole list.", { wrote: 0 }); return; }
          rec("append", 6, [call, 6, v, m.nodes[0], s()], "cur starts at the head.", { cur: 0, fresh: v });
          for (var i = 0; i < m.nodes.length - 1; i++) {
            rec("append", 7, [call, 7, v, m.nodes[i], s()], "cur.next is not null.", { cur: i, fresh: v });
            rec("append", 8, [call, 8, v, m.nodes[i + 1], s()], "cur ← cur.next.", { cur: i + 1, fresh: v });
          }
          rec("append", 7, [call, 7, v, m.nodes[m.nodes.length - 1], s()], "cur.next is null: cur is the tail.", { cur: m.nodes.length - 1, fresh: v });
          m.nodes.push(v); rec("append", 10, [call, 10, v, m.nodes[m.nodes.length - 2], s()], "cur.next ← new: the old tail now points at " + v + ".", { cur: m.nodes.length - 2, wrote: m.nodes.length - 1 });
        } },
        { label: "Prepend (head)", value: true, run: function (m, v, rec) {
          if (m.nodes.length >= 9) return { toast: "That is plenty to trace — remove something first.", bad: true };
          var call = "prepend(" + v + ")";
          rec("prepend", 2, [call, 2, v, "·", listStr(m)], "Make a node holding " + v + ".", { fresh: v, freshHead: true });
          rec("prepend", 3, [call, 3, v, "·", listStr(m)], "new.next ← head" + (m.nodes.length ? ", so it points at " + m.nodes[0] + "." : ", which is null."), { fresh: v, freshHead: true });
          m.nodes.unshift(v); rec("prepend", 4, [call, 4, v, "·", listStr(m)], "head ← new. No walk was needed: prepending is O(1).", { wrote: 0 });
        } },
        { label: "Remove value", value: true, run: function (m, v, rec) {
          var call = "remove(" + v + ")", i = 0;
          rec("remove", 2, [call, 2, v, "·", listStr(m)], "prev starts at null.");
          rec("remove", 3, [call, 3, v, m.nodes.length ? m.nodes[0] : "null", listStr(m)], "cur starts at the head.", { cur: 0 });
          while (i < m.nodes.length && String(m.nodes[i]) !== String(v)) {
            rec("remove", 4, [call, 4, v, m.nodes[i], listStr(m)], m.nodes[i] + " is not " + v + ".", { cur: i });
            rec("remove", 6, [call, 6, v, i + 1 < m.nodes.length ? m.nodes[i + 1] : "null", listStr(m)], "prev ← cur, cur ← cur.next.", { cur: i + 1, prev: i });
            i++;
          }
          if (i >= m.nodes.length) { rec("remove", 9, [call, 9, v, "null", listStr(m)], "cur reached null: OUTPUT \"Not found\".", { out: "Not found" }); return { toast: "“" + v + "” isn't in the list — traversal reached null.", bad: true }; }
          rec("remove", 4, [call, 4, v, m.nodes[i], listStr(m)], "Found " + v + ".", { cur: i, gone: i });
          m.nodes.splice(i, 1);
          if (i === 0) rec("remove", 11, [call, 11, v, "·", listStr(m)], "prev is null, so head ← cur.next.");
          else rec("remove", 13, [call, 13, v, "·", listStr(m)], "prev.next ← cur.next: " + m.nodes[i - 1] + " now skips the removed node.", { prev: i - 1 });
        } }
      ],
      draw: function (d, m, f) {
        /* four nodes to a row; the pointer from a row's end drops to the next */
        var NW = 70, NH = 44, STEP = 104, PER = 4, X0 = 34, Y0 = 130, ROW = 150;
        function pos(i) { return { x: X0 + (i % PER) * STEP, y: Y0 + Math.floor(i / PER) * ROW }; }
        if (!m.nodes.length && f.fresh == null) { d.text(240, 300, "head = null · the list is empty", { tone: "mute" }); return { w: 480, h: 600 }; }
        m.nodes.forEach(function (v, i) {
          var p = pos(i), tone = f.wrote === i ? "new" : f.gone === i ? "hot-ring" : f.cur === i ? "front" : null;
          d.rect(p.x, p.y, NW, NH, { rx: 10, tone: tone });
          d.line(p.x + 44, p.y, p.x + 44, p.y + NH, { tone: "line" });
          d.text(p.x + 22, p.y + 28, String(v), { size: 16, weight: "bold" });
          if (i < m.nodes.length - 1) {
            var q = pos(i + 1);
            d.dot(p.x + 57, p.y + 22, 3.5, "ink");
            if (q.y === p.y) d.line(p.x + 57, p.y + 22, q.x - 1, q.y + 22, { arrow: true });
            else d.path("M" + (p.x + 57) + " " + (p.y + 22) + " H" + (p.x + NW + 14) + " V" + (p.y + NH + 50) + " H" + (X0 - 14) + " V" + (q.y + 22) + " H" + (q.x - 1), { arrow: true });
          } else d.text(p.x + 57, p.y + 27, "∅", { size: 14, tone: "mute" });
          if (f.cur === i) { d.line(p.x + 22, p.y + NH + 32, p.x + 22, p.y + NH + 4, { tone: "front", arrow: true }); d.text(p.x + 22, p.y + NH + 48, "cur", { size: 14, weight: "bold", tone: "front" }); }
          if (f.prev === i) d.text(p.x + 22, p.y + NH + 48, "prev", { size: 14, weight: "bold", tone: "sub" });
        });
        if (m.nodes.length) { var h = pos(0); d.text(h.x + 22, h.y - 44, "head", { size: 14, weight: "bold", tone: "done" }); d.line(h.x + 22, h.y - 36, h.x + 22, h.y - 3, { tone: "done", arrow: true }); }
        if (f.fresh != null) {
          var fp = f.freshHead ? { x: pos(0).x + 120, y: pos(0).y - 104 } : pos(m.nodes.length);
          if (f.freshHead && m.nodes.length) d.path("M" + (fp.x + 57) + " " + (fp.y + 22) + " C" + (fp.x + 90) + " " + (fp.y + 80) + " " + (pos(0).x + 60) + " " + (pos(0).y - 60) + " " + (pos(0).x + 46) + " " + (pos(0).y - 3), { tone: "done", arrow: true, dash: true });
          d.text(fp.x + NW / 2, fp.y - 12, "new", { size: 14, weight: "bold", tone: "done" });
          d.rect(fp.x, fp.y, NW, NH, { rx: 10, tone: "new" });
          d.line(fp.x + 44, fp.y, fp.x + 44, fp.y + NH, { tone: "line" });
          d.text(fp.x + 22, fp.y + 28, String(f.fresh), { size: 16, weight: "bold" });
        }
        var rows = Math.ceil((m.nodes.length + (f.fresh != null ? 1 : 0)) / PER);
        return { w: 480, h: Math.max(600, Y0 + rows * ROW), count: m.nodes.length, noun: "node" };
      }
    },

    tree: {
      label: "Binary search tree", ref: "4.2.5.1", columns: ["call", "line", "value", "node", "output"],
      init: function () { return { root: null }; },
      code: {
        insert: ["PROCEDURE insert(value)", "  IF root = null THEN", "    root ← Node(value)", "  ELSE", "    cur ← root", "    WHILE TRUE", "      IF value < cur.value THEN", "        IF cur.left = null THEN cur.left ← Node(value); RETURN", "        cur ← cur.left", "      ELSE", "        IF cur.right = null THEN cur.right ← Node(value); RETURN", "        cur ← cur.right", "      ENDIF", "    ENDWHILE", "  ENDIF", "ENDPROCEDURE"],
        pre: ["PROCEDURE preOrder(node)", "  IF node ≠ null THEN", "    OUTPUT node.value", "    preOrder(node.left)", "    preOrder(node.right)", "  ENDIF", "ENDPROCEDURE"],
        in: ["PROCEDURE inOrder(node)", "  IF node ≠ null THEN", "    inOrder(node.left)", "    OUTPUT node.value", "    inOrder(node.right)", "  ENDIF", "ENDPROCEDURE"],
        post: ["PROCEDURE postOrder(node)", "  IF node ≠ null THEN", "    postOrder(node.left)", "    postOrder(node.right)", "    OUTPUT node.value", "  ENDIF", "ENDPROCEDURE"]
      },
      ops: [
        { label: "Insert", primary: true, value: true, numeric: true, run: function (m, v, rec) {
          if (count(m.root) >= 15) return { toast: "Tree's getting crowded — reset to start over.", bad: true };
          var call = "insert(" + v + ")";
          rec("insert", 2, [call, 2, v, "·", ""], m.root ? "There is a root, so walk down from it." : "The tree is empty.");
          if (!m.root) { m.root = { v: v, l: null, r: null }; rec("insert", 3, [call, 3, v, v, ""], v + " becomes the root.", { wrote: v }); return; }
          var cur = m.root; rec("insert", 5, [call, 5, v, cur.v, ""], "cur starts at the root, " + cur.v + ".", { cur: cur.v });
          while (true) {
            if (v === cur.v) { rec("insert", 7, [call, 7, v, cur.v, ""], v + " is already in the tree.", { cur: cur.v }); return { toast: v + " is already in the tree — BSTs hold unique keys here.", bad: true }; }
            var left = v < cur.v;
            rec("insert", left ? 7 : 10, [call, left ? 7 : 10, v, cur.v, ""], v + (left ? " < " : " > ") + cur.v + ": go " + (left ? "left." : "right."), { cur: cur.v });
            var next = left ? cur.l : cur.r;
            if (!next) {
              if (left) cur.l = { v: v, l: null, r: null }; else cur.r = { v: v, l: null, r: null };
              rec("insert", left ? 8 : 11, [call, left ? 8 : 11, v, cur.v, ""], "That side is empty: attach " + v + " as the " + (left ? "left" : "right") + " child of " + cur.v + ".", { wrote: v });
              return;
            }
            cur = next; rec("insert", left ? 9 : 12, [call, left ? 9 : 12, v, cur.v, ""], "cur moves to " + cur.v + ".", { cur: cur.v });
          }
        } },
        { label: "Pre-order", run: function (m, v, rec) { return trav(m, "pre", rec); } },
        { label: "In-order", run: function (m, v, rec) { return trav(m, "in", rec); } },
        { label: "Post-order", run: function (m, v, rec) { return trav(m, "post", rec); } }
      ],
      draw: function (d, m, f) {
        if (!m.root) { d.text(240, 300, "root = null · the tree is empty", { tone: "mute" }); return { w: 480, h: 600 }; }
        var n = count(m.root), dx = 30, idx = 0, at = {}, deep = 0, R = 17;
        (function lay(x, dpt) { if (!x) return; lay(x.l, dpt + 1); at[x.v] = { x: 24 + idx * dx, y: 44 + dpt * 84 }; idx++; deep = Math.max(deep, dpt); lay(x.r, dpt + 1); })(m.root, 0);
        var W = Math.max(48 + (n - 1) * dx, 480);
        if (W === 480) Object.keys(at).forEach(function (k) { at[k].x += (480 - (48 + (n - 1) * dx)) / 2; });
        (function edge(x) { if (!x) return; [x.l, x.r].forEach(function (c) { if (!c) return; var a = at[x.v], b = at[c.v], len = Math.hypot(b.x - a.x, b.y - a.y); d.line(a.x + (b.x - a.x) / len * R, a.y + (b.y - a.y) / len * R, b.x - (b.x - a.x) / len * R, b.y - (b.y - a.y) / len * R, { tone: "mute" }); }); edge(x.l); edge(x.r); })(m.root);
        Object.keys(at).forEach(function (k) {
          var v = +k, p = at[k], done = (f.visited || []).indexOf(v) >= 0, tone = f.wrote === v ? "new" : f.cur === v ? "hot" : done ? "done" : "ink";
          d.circle(p.x, p.y, R, { tone: tone });
          d.text(p.x, p.y + 5, k, { size: 15, weight: "bold", tone: tone === "hot" || tone === "done" ? "on" : null });
        });
        return { w: W, h: 44 + deep * 84 + 50, count: n, noun: "node" };
      }
    }
  };
  function listStr(m) { return m.nodes.length ? m.nodes.join(" → ") + " → null" : "null"; }
  function count(t) { return t ? 1 + count(t.l) + count(t.r) : 0; }
  function trav(m, kind, rec) {
    if (!m.root) return { toast: "Insert some numbers first.", bad: true };
    var out = [], name = { pre: "preOrder", in: "inOrder", post: "postOrder" }[kind], line = { pre: 3, in: 4, post: 5 }[kind];
    (function walk(x) {
      if (!x) return;
      if (kind === "pre") visit(x);
      walk(x.l);
      if (kind === "in") visit(x);
      walk(x.r);
      if (kind === "post") visit(x);
    })(m.root);
    function visit(x) {
      out.push(x.v);
      var full = out.join(", ") + (kind === "in" && out.length === count(m.root) ? " — sorted ascending, as a BST guarantees" : "");
      rec(kind, line, [name + "(" + x.v + ")", line, x.v, x.v, full], "OUTPUT " + x.v + ".", { cur: x.v, visited: out.slice(0, -1), out: String(x.v) });
    }
  }

  /* ====================== one Trace Lab ====================== */
  function traceLab(panel, kind) {
    var K = KINDS[kind], model = K.init(), history = [], outputs = [], brk = false;
    var valIn = el("input", { type: K.ops.some(function (o) { return o.numeric; }) ? "number" : "text", placeholder: "value", maxlength: 4, style: "--w: 76px" });
    var head = el("div", { class: "k-lab-code-h" }, [el("span", { class: "k-kicker", text: "Pseudocode" }), el("span", { class: "k-lab-code-tag", text: "AQA style" })]);
    var list = el("ol", { class: "k-lab-code-l", "aria-label": "The procedure being traced" });
    var pane = el("section", { class: "k-lab-codepane", "data-ui": "lab.code", "aria-label": "Pseudocode" }, [head, list]);
    var controls = [L.field("Value", valIn)].concat(K.ops.map(function (op) { return L.action(op.label, function () { run(op); }, op.primary); }));
    if (kind === "queue") controls.push(L.choice([["c", "Circular"], ["l", "Linear"]], "c", function (v) { model = K.init(); model.circular = v === "c"; history = []; outputs = []; show(); }, "Queue type"));
    controls.push(L.sep(), L.toggle("Break at each line", brk, function (on) { brk = on; }));
    var lab = L.create(panel, { controls: controls, transport: true, speed: true, tick: 650, before: [pane], kind: "trace", vb: [480, 600], label: K.label + " diagram",
      readout: ["now", "trace", "out"], onReset: function () { model = K.init(); if (kind === "queue") model.circular = true; history = []; outputs = []; show(); } });

    function value(op) {
      if (!op.value) return null;
      var raw = String(valIn.value).trim();
      if (raw === "") return rnd();
      if (op.numeric) { var n = parseInt(raw, 10); if (isNaN(n)) { KOS.ui.toast("Insert needs a number.", true); return undefined; } valIn.value = ""; return n; }
      valIn.value = "";
      return /^-?\d+$/.test(raw) ? parseInt(raw, 10) : raw;
    }
    function run(op) {
      var v = value(op);
      if (v === undefined) return;
      var made = [];
      function rec(proc, line, row, say, extra) {
        made.push(Object.assign({ proc: proc, line: line, row: row.map(String), say: say, model: copy(model) }, extra || {}));
      }
      var res = op.run(model, v, rec) || {};
      if (res.toast) KOS.ui.toast(res.toast, res.bad);
      if (!made.length) return;
      made.forEach(function (f) { if (f.out != null) outputs.push(f.out); f.outN = outputs.length; });
      history = history.concat(made);
      lab.steps(history, render, { at: brk ? history.length - made.length : history.length - 1 });
    }
    function show() {
      if (history.length) { lab.steps(history, render, { at: history.length - 1 }); return; }
      lab.steps([{ proc: null, line: 0, row: null, model: copy(model), say: "Pick an operation. Each line it runs adds one row to the trace table.", outN: 0 }], render);
    }
    function render(f, i, n) {
      /* the code pane: the procedure being run, its line lit */
      var lines = f.proc ? K.code[f.proc] : [];
      list.innerHTML = "";
      lines.forEach(function (t, k) {
        var on = k + 1 === f.line;
        list.appendChild(el("li", { class: "k-lab-cl", "data-state": on ? "run" : null, "aria-current": on ? "step" : null }, [
          el("span", { class: "k-lab-cl-n", "aria-hidden": "true", text: on ? "▶" : String(k + 1) }), el("code", { text: t })]));
      });
      if (!lines.length) list.appendChild(el("li", { class: "k-lab-cl k-lab-cl-empty", text: "No procedure running." }));
      lab.draw(function (d) { return K.draw(d, f.model, f); });
      lab.now(f.say, f.proc ? "line " + f.line : null);
      /* the trace table: one row per line run so far; the next row dashed */
      var upto = f.row ? i : -1;
      var tbl = el("table", { class: "k-lab-trace-table", "data-ui": "lab.trace-table" }, [
        el("thead", {}, [el("tr", {}, K.columns.map(function (c) { return el("th", { scope: "col", text: c }); }))]),
        el("tbody", {}, history.slice(0, upto + 1).map(function (h, k) {
          return el("tr", { "data-state": k === upto ? "live" : null }, h.row.map(function (c) { return el("td", { text: c }); }));
        }).concat(upto < history.length - 1 ? [el("tr", { "data-state": "next" }, [el("td", { colspan: String(K.columns.length), text: "next row appears on Step ›" })])] : []))
      ]);
      var wrap = el("div", { class: "k-lab-tablewrap k-lab-trace-wrap" }, [tbl]);
      lab.section("trace", "Trace table", [wrap], (upto + 1) + " row" + (upto === 0 ? "" : "s"));
      /* keep the newest row in view */
      var liveRow = tbl.querySelector("tr[data-state~='live']");
      if (liveRow) wrap.scrollTop = Math.max(0, liveRow.offsetTop - wrap.clientHeight + liveRow.offsetHeight * 2);
      var outs = outputs.slice(0, f.outN || 0);
      lab.section("out", "Output", [el("p", { class: "k-lab-work", text: outs.length ? outs.join("  ·  ") : "—" })]);
    }
    show();
  }

  /* ====================== the view ====================== */
  var TABS = [["stack", "Stack (LIFO)"], ["queue", "Queue (FIFO)"], ["list", "Linked list"], ["tree", "Binary search tree"]];
  KOS.views.trace = function (main) {
    KOS.shell.tree("none");
    main.appendChild(KOS.ui.pageHeader({ kicker: "Labs · 4.2", title: "Trace Lab", sub: "Code, structure and trace table move together, one line at a time." }));
    var st = store.state.trace = store.state.trace || {};
    var current = KINDS[st.tab] ? st.tab : "stack";
    var tabs = el("div", { class: "k-lab-tabs", role: "group", "aria-label": "Structure" });
    var panel = el("section", { class: "k-lab k-card", "data-subject": "compsci" });
    TABS.forEach(function (t) {
      tabs.appendChild(el("button", { type: "button", class: "k-lab-tab", "data-ui": "lab.tab", "data-state": t[0] === current ? "active" : null, "aria-pressed": String(t[0] === current),
        onclick: function () {
          current = t[0]; st.tab = current; store.save();
          tabs.querySelectorAll("[data-ui~='lab.tab']").forEach(function (b, i) { KOS.ui.state(b, "active", TABS[i][0] === current); b.setAttribute("aria-pressed", String(TABS[i][0] === current)); });
          open();
        } }, [t[1]]));
    });
    main.appendChild(tabs);
    main.appendChild(panel);
    function open() {
      panel.innerHTML = "";
      var K = KINDS[current];
      panel.appendChild(el("header", { class: "k-lab-head", "data-ui": "lab.sim-head" }, [
        el("div", { class: "k-lab-head-t" }, [
          el("span", { class: "k-kicker", text: "Trace Lab" }),
          el("h2", { class: "k-lab-title" }, [K.label + " ", el("span", { class: "k-lab-refpill k-mono", "data-subject": "compsci", text: K.ref })])
        ])
      ]));
      traceLab(panel, current);
    }
    open();
  };

  /* a topic's Simulate tab mounts Stack and Queue inline (sims.js) */
  KOS.traceLabs = {
    has: function (tab) { return !!KINDS[tab]; },
    mount: function (tab, panel) { if (KINDS[tab]) traceLab(panel, tab); }
  };
})();
