/* Kurenai OS — smoke62.test.js
   Roadmap 1.7: the OOP sandbox's model, ready for the IDE (js/labs/oop.js,
   KOS.oop). The IDE's views come from the design; this suite pins the pure
   model they will be built on.

   The claims:

     A · THE GATE. normalise() cleans any model (a pull, a restore, a
         proposal) without "fixing" a modelling error: dangling, self and
         duplicate links go; a cycle or a second base stays for validate().
     B · IDENTITY. A class's id is stable through a rename; its file name is
         derived from its name, so the file tree and the code never drift.
     C · VALIDATION names every C# rule the generated code would break:
         names, duplicate classes and members, single inheritance, cycles,
         and the abstract / virtual / override rules.
     D · THE CANVAS. Pan and zoom are per device (state.ui.oopView),
         clamped, zoomed about a point, and fitted to the model.
     E · RENDER PURITY. The first visit's example is a draft until the first
         edit: rendering the sandbox writes nothing; the transpiler is the
         same one the page shows.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke62.test.js                                            */
"use strict";
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": " + JSON.stringify(a) + " vs " + JSON.stringify(b)); }

let app, KOS;
const O = () => KOS.oop;
const cls = (id, name, extra) => Object.assign({ id: id, name: name, abstract: false, x: 0, y: 0, fields: [], methods: [] }, extra || {});
const meth = (name, virt, acc) => ({ acc: acc || "public", type: "void", name: name, virt: virt || "none" });
const codes = m => O().validate(m).errors.map(e => e.code + ":" + e.classId).sort();

/* ============ A · the gate ============ */
step("A · normalise cleans members and links, keeps modelling errors for validate()", () => {
  const n = O().normalise({
    classes: [cls(1, "  Animal  ", { fields: [{ acc: "weird", type: "int", name: "legs" }], methods: [{ name: "Speak", virt: "odd" }] }),
      cls(2, "Dog"), cls(2, "Duplicate id"), { id: "x" }, null, cls(3, "Cat")],
    links: [{ child: 2, parent: 1 }, { child: 2, parent: 1 }, { child: 9, parent: 1 }, { child: 3, parent: 3 },
      { child: 1, parent: 2 }, { child: 3, parent: 1 }, { child: 3, parent: 2 }],
    nextId: 2
  });
  eq(n.classes.map(c => c.id + ":" + c.name), ["1:Animal", "2:Dog", "3:Cat"], "classes: trimmed, a duplicate or bad id dropped");
  eq([n.classes[0].fields[0].acc, n.classes[0].methods[0].acc, n.classes[0].methods[0].virt], ["private", "public", "none"], "members cleaned");
  eq(n.links, [{ child: 2, parent: 1 }, { child: 1, parent: 2 }, { child: 3, parent: 1 }, { child: 3, parent: 2 }],
    "a duplicate, dangling and self link go; a cycle and a second base stay");
  eq(n.nextId, 4, "nextId is lifted past every id");
});

/* ============ B · identity ============ */
step("B · a rename keeps the id; the file name follows the class name", () => {
  const m = O().normalise({ classes: [cls(4, "Animal", { abstract: true }), cls(7, "Dog")], links: [{ child: 7, parent: 4 }] });
  eq(O().files(m), [{ id: 4, file: "Animal.cs", name: "Animal", abstract: true, base: null },
    { id: 7, file: "Dog.cs", name: "Dog", abstract: false, base: 4 }], "the file tree");
  m.classes[1].name = "Puppy";
  eq(O().files(m)[1], { id: 7, file: "Puppy.cs", name: "Puppy", abstract: false, base: 4 }, "renamed: same id, new file");
  eq(O().fileName({ id: 9, name: "" }), "Class9.cs", "a blank name still has a file");
  eq(O().ancestors(O().normalise({ classes: [cls(1, "A"), cls(2, "B"), cls(3, "C")],
    links: [{ child: 3, parent: 2 }, { child: 2, parent: 1 }] }), 3), [2, 1], "ancestors, nearest first");
});

/* ============ C · validation ============ */
step("C · a valid model has no errors", () => {
  const m = { classes: [cls(1, "Shape", { abstract: true, methods: [meth("Area", "abstract"), meth("Describe", "virtual")] }),
    cls(2, "Circle", { fields: [{ acc: "private", type: "double", name: "radius" }], methods: [meth("Area", "override"), meth("Describe", "override")] }),
    cls(3, "Unit", { methods: [meth("Area", "override")] })],
    links: [{ child: 2, parent: 1 }, { child: 3, parent: 2 }] };
  eq(O().validate(m), { ok: true, errors: [] }, "valid");
});

step("C · names: invalid identifiers, keywords, duplicates", () => {
  eq(codes({ classes: [cls(1, "2Fast"), cls(2, "class"), cls(3, "Ok", { fields: [{ acc: "private", type: "int", name: "my field" }] })] }),
    ["invalid-name:1", "invalid-name:2", "invalid-name:3"], "invalid names");
  eq(codes({ classes: [cls(1, "Dog"), cls(2, "Dog")] }), ["duplicate-class:1", "duplicate-class:2"], "duplicate classes");
  eq(codes({ classes: [cls(1, "Dog", { fields: [{ acc: "private", type: "int", name: "Bark" }], methods: [meth("Bark")] })] }),
    ["duplicate-member:1"], "duplicate members");
  eq(codes({ classes: [cls(1, "Dog", { methods: [meth("Dog")] })] }), ["invalid-name:1"], "a member named like its class");
});

step("C · inheritance: one base, no cycles", () => {
  eq(codes({ classes: [cls(1, "A"), cls(2, "B"), cls(3, "C")], links: [{ child: 3, parent: 1 }, { child: 3, parent: 2 }] }),
    ["multiple-bases:3"], "a second base");
  eq(codes({ classes: [cls(1, "A"), cls(2, "B"), cls(3, "C")], links: [{ child: 1, parent: 3 }, { child: 3, parent: 2 }, { child: 2, parent: 1 }] }),
    ["cycle:1", "cycle:2", "cycle:3"], "a three-class cycle marks every class in it");
});

step("C · the abstract, virtual and override rules", () => {
  eq(codes({ classes: [cls(1, "Shape", { methods: [meth("Area", "abstract")] })] }), ["abstract-in-concrete:1"], "abstract method, concrete class");
  eq(codes({ classes: [cls(1, "Shape", { abstract: true, methods: [meth("Area", "abstract", "private")] })] }), ["private-virtual:1"], "private abstract");
  eq(codes({ classes: [cls(1, "Dog", { methods: [meth("Bark", "override")] })] }), ["override-without-base:1"], "override of nothing");
  eq(codes({ classes: [cls(1, "A"), cls(2, "B", { methods: [meth("Run", "override")] })], links: [{ child: 2, parent: 1 }],
    }), ["override-without-base:2"], "the base has Run only if it is virtual");
  eq(codes({ classes: [cls(1, "Shape", { abstract: true, methods: [meth("Area", "abstract")] }), cls(2, "Square")], links: [{ child: 2, parent: 1 }] }),
    ["unimplemented:2"], "a concrete class must override the abstract method");
  eq(codes({ classes: [cls(1, "Shape", { abstract: true, methods: [meth("Area", "abstract")] }),
    cls(2, "Polygon", { abstract: true }), cls(3, "Square", { methods: [meth("Area", "override")] })],
    links: [{ child: 2, parent: 1 }, { child: 3, parent: 2 }] }), [], "an abstract middle class may defer it");
  const e = O().validate({ classes: [cls(1, "Dog", { methods: [meth("Bark", "override")] })] }).errors[0];
  assert(e.member === "Bark" && /overrides nothing/.test(e.message), "errors name the member and say why");
});

/* ============ D · the canvas ============ */
step("D · view state: clamped, zoomed about a point, fitted to the model", () => {
  /* side/cs/framed: where the generated C# sits and whether this device
     has framed the diagram yet (the IDE, frames 19a/19b/19d) */
  eq(O().normaliseView({ zoom: 99, x: "a" }), { x: 0, y: 0, zoom: 3, mode: "code", selected: null, side: true, cs: "side", framed: false }, "clamped");
  const z = O().zoomAt({ x: 0, y: 0, zoom: 1 }, 2, 100, 100);
  eq([z.x, z.y, z.zoom], [-100, -100, 2], "the point under the cursor stays put");
  eq(O().zoomAt({ zoom: 0.3 }, 0.1, 0, 0).zoom, 0.25, "zoom floor");
  const m = { classes: [cls(1, "A", { x: 0, y: 0 }), cls(2, "B", { x: 1000, y: 600 })] };
  const f = O().fit(m, 800, 500);
  const C = O().CARD;
  assert(f.zoom < 1 && f.zoom >= 0.25, "zoomed out to fit: " + f.zoom);
  assert(f.x >= 0 && f.y >= 0 && f.x + (1000 + C.w) * f.zoom <= 800 + 1 && f.y + (600 + C.h) * f.zoom <= 500 + 1, "everything inside: " + JSON.stringify(f));
  eq(O().fit({ classes: [] }, 800, 500).zoom, 1, "an empty model fits at 100%");
});

step("D · the view is per device (state.ui), never in the synced model", () => {
  const v = O().setView({ zoom: 1.5, x: 40, mode: "diagram", selected: 2 });
  eq(KOS.store.state.ui.oopView, v, "stored in state.ui");
  assert(!("view" in KOS.store.state.oop) && !("zoom" in KOS.store.state.oop), "not in the model");
  eq(O().view().mode, "diagram", "read back");
});

/* ============ E · render purity ============ */
step("E · rendering the sandbox writes nothing; its code is KOS.oop.transpile", async () => {
  KOS.store.state.oop = { classes: [], links: [], nextId: 1 };
  /* the lab is a Gold Shop unlock (invariant 2); own it for the test */
  if (KOS.store.state.governor.owned.indexOf("oop") === -1) KOS.store.state.governor.owned.push("oop");
  const before = JSON.stringify(KOS.store.state.oop);
  O().setView({ mode: "code", cs: "side", side: true });   // the generated C# beside the editor
  KOS.show("oop");
  await app.settle();
  eq(JSON.stringify(KOS.store.state.oop), before, "the example is a draft until the first edit");
  const shown = app.document.querySelector("#oop-code pre").textContent;
  assert(/class Suspect : GameEntity/.test(shown), "the example is shown");
  const m = { classes: [cls(1, "Animal", { abstract: true, methods: [meth("Speak", "abstract")] }), cls(2, "Dog", { methods: [meth("Speak", "override")] })],
    links: [{ child: 2, parent: 1 }] };
  const all = O().transpile(m), one = O().transpile(m, 2);
  assert(/public abstract class Animal/.test(all) && /public class Dog : Animal/.test(all), "the whole model");
  assert(!/class Animal/.test(one) && /public class Dog : Animal/.test(one), "one class's file");
});

(async () => {
  app = await boot();
  KOS = app.KOS;
  let fails = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { fails++; console.log("FAIL  " + name + "\n      " + (e && e.stack ? e.stack.split("\n").slice(0, 2).join(" | ") : e)); }
  }
  const errs = app.errors.filter(e => !/env\.local\.js/.test(e));
  if (errs.length) { fails++; console.log("FAIL  runtime errors: " + errs.join(" / ")); }
  console.log(fails ? "\nSMOKE62: " + fails + " failure(s)" : "\nSMOKE62: all " + steps.length + " steps passed");
  process.exit(fails ? 1 : 0);
})();
