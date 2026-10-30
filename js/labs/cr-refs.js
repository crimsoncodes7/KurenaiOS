/* Kurenai OS — labs/cr-refs.js (KOS.crRefs, pure, also in Node)
   The procedural reference generator (docs/creatives-plan.md §5.4, design 31i): references for
   Art's drills drawn by the app, so a drill needs no files and nothing is bundled or hot-linked
   (invariant 156). Four kinds, each repeatable by its SEED (the same seed, the same drawing):
     forms     three primitives — box, cylinder, sphere, cone — turned at random, in perspective
     grid      a one- or two-point perspective grid with a box set in it
     mannequin a block figure (head, ribcage, pelvis, limbs) in a random pose
     head      a block head (sphere, side plane, jaw) turned and tilted at random
   build(kind, seed) returns { items, w, h, facts }: items are { d (an SVG path), role } where the
   role is "form" (the drawing), "hidden" (the form's far edges) or "cons" (construction: centre
   lines, axes, vanishing lines). The page shows "cons" and "hidden" only with Show construction.
   Units are the lab stage's (800 × 450).                                                    */
(function (root) {
  "use strict";
  var W = 800, H = 450;
  function rng(seed) { var x = (Number(seed) >>> 0) || 1; return function () { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; }; }
  function f(v) { return Math.round(v * 10) / 10; }
  function poly(pts, closed) { return pts.map(function (p, i) { return (i ? "L" : "M") + f(p[0]) + " " + f(p[1]); }).join("") + (closed ? "Z" : ""); }
  function seg(a, b) { return "M" + f(a[0]) + " " + f(a[1]) + "L" + f(b[0]) + " " + f(b[1]); }

  /* ---- 3D: turn, then a mild perspective onto the stage ---- */
  function rot(p, yaw, pitch, roll) {
    var x = p[0], y = p[1], z = p[2], c, s, t;
    c = Math.cos(roll || 0); s = Math.sin(roll || 0); t = x * c - y * s; y = x * s + y * c; x = t;
    c = Math.cos(yaw); s = Math.sin(yaw); t = x * c + z * s; z = -x * s + z * c; x = t;
    c = Math.cos(pitch); s = Math.sin(pitch); t = y * c - z * s; z = y * s + z * c; y = t;
    return [x, y, z];
  }
  function cam(cx, cy, scale, dist) {
    return function (p) { var k = dist / (dist - p[2]); return [cx + p[0] * scale * k, cy - p[1] * scale * k, p[2]]; };
  }
  function circle3(n, r, y) { var out = []; for (var i = 0; i < n; i++) { var a = 2 * Math.PI * i / n; out.push([r * Math.cos(a), y, r * Math.sin(a)]); } return out; }

  /* a box: visible edges belong to a face turned towards the viewer */
  function box(T, P, sx, sy, sz) {
    var V = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]].map(function (v) { return T([v[0] * sx, v[1] * sy, v[2] * sz]); });
    var S = V.map(P);
    var faces = [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [3, 2, 6, 7], [0, 3, 7, 4], [1, 2, 6, 5]];
    var depth = faces.map(function (fc) { return fc.reduce(function (s, i) { return s + V[i][2]; }, 0) / 4; });
    var vis = {};
    [[0, 1], [2, 3], [4, 5]].forEach(function (pair) { var near = depth[pair[0]] > depth[pair[1]] ? pair[0] : pair[1]; vis[near] = 1; });
    var edges = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
    var items = [];
    edges.forEach(function (e) {
      var shown = faces.some(function (fc, fi) { return vis[fi] && fc.indexOf(e[0]) >= 0 && fc.indexOf(e[1]) >= 0; });
      items.push({ d: seg(S[e[0]], S[e[1]]), role: shown ? "form" : "hidden" });
    });
    return items;
  }
  /* a solid of revolution's rim: the near half drawn, the far half hidden */
  function rim(T, P, r, y) {
    var pts = circle3(48, r, y).map(T);
    var S = pts.map(P), near = [], far = [], items = [];
    var cz = pts.reduce(function (s, p) { return s + p[2]; }, 0) / pts.length;
    for (var i = 0; i < pts.length; i++) { var j = (i + 1) % pts.length; (pts[i][2] + pts[j][2] >= 2 * cz ? near : far).push(seg(S[i], S[j])); }
    items.push({ d: near.join(""), role: "form" });
    if (far.length) items.push({ d: far.join(""), role: "hidden" });
    return { items: items, S: S };
  }
  /* the two outline edges of a cylinder or cone: the rim points furthest either side of the axis */
  function sides(S, a, b) {
    var ax = b[0] - a[0], ay = b[1] - a[1], L = Math.hypot(ax, ay) || 1, nx = -ay / L, ny = ax / L, lo = null, hi = null;
    S.forEach(function (p) { var d = (p[0] - a[0]) * nx + (p[1] - a[1]) * ny; if (!lo || d < lo.d) lo = { d: d, p: p }; if (!hi || d > hi.d) hi = { d: d, p: p }; });
    return [lo.p, hi.p];
  }
  function form(kind, cx, cy, r) {
    var yaw = (r() - 0.5) * 1.6, pitch = 0.25 + r() * 0.45, roll = (r() - 0.5) * 0.5;
    var T = function (p) { return rot(p, yaw, pitch, roll); }, P = cam(cx, cy, 1, 900);
    var items = [], k = 72 + r() * 18, info = kind;
    if (kind === "box") {
      var sx = k * (0.7 + r() * 0.6), sy = k * (0.7 + r() * 0.6), sz = k * (0.7 + r() * 0.6);
      items = box(T, P, sx, sy, sz);
      var c0 = P(T([0, -sy, 0])), c1 = P(T([0, sy, 0]));
      items.push({ d: seg(c0, c1), role: "cons" });
    } else if (kind === "cylinder" || kind === "cone") {
      var h = k * (1.1 + r() * 0.7), rr = k * (0.55 + r() * 0.3);
      var base = rim(T, P, rr, -h / 2), top = kind === "cylinder" ? rim(T, P, rr, h / 2) : null;
      var A = P(T([0, -h / 2, 0])), B = P(T([0, h / 2, 0]));
      items = items.concat(base.items);
      if (top) {
        items = items.concat(top.items.map(function (x) { return { d: x.d, role: "form" }; }));
        var s1 = sides(base.S, A, B), s2 = sides(top.S, A, B);
        items.push({ d: seg(s1[0], s2[0]) + seg(s1[1], s2[1]), role: "form" });
      } else {
        var sc = sides(base.S, A, B);
        items.push({ d: seg(sc[0], B) + seg(sc[1], B), role: "form" });
      }
      items.push({ d: seg(A, B), role: "cons" });
    } else {
      var R = k * 0.95, ctr = P(T([0, 0, 0]));
      var out = []; for (var i = 0; i <= 48; i++) { var a = 2 * Math.PI * i / 48; out.push([ctr[0] + R * Math.cos(a), ctr[1] + R * Math.sin(a)]); }
      items.push({ d: poly(out), role: "form" });
      var eq = rim(T, P, R, 0), mer = rim(function (p) { return T(rot(p, 0, 0, Math.PI / 2)); }, P, R, 0);
      eq.items.concat(mer.items).forEach(function (x) { items.push({ d: x.d, role: "cons" }); });
      info = "sphere";
    }
    return { items: items, label: info };
  }
  function forms(seed) {
    var r = rng(seed), kinds = ["box", "cylinder", "sphere", "cone"], picked = [];
    while (picked.length < 3) { var k = kinds[Math.floor(r() * kinds.length)]; if (picked.indexOf(k) < 0 || picked.length >= 2) picked.push(k); }
    var items = [];
    picked.forEach(function (k, i) { items = items.concat(form(k, 150 + i * 250, 225, r).items); });
    return { items: items, facts: [["Forms", picked.join(" · ")]] };
  }

  /* ---- a perspective grid with a box set in it ---- */
  function grid(seed) {
    var r = rng(seed), two = r() < 0.6, hy = 150 + r() * 120, items = [];
    items.push({ d: seg([0, hy], [W, hy]), role: "form" });
    if (!two) {
      var vx = 250 + r() * 300;
      for (var i = -8; i <= 8; i++) items.push({ d: seg([vx, hy], [vx + i * 140, H + 40]), role: "cons" });
      for (var j = 1; j <= 6; j++) { var y = hy + (H - hy) * Math.pow(j / 6, 1.8); items.push({ d: seg([0, y], [W, y]), role: "cons" }); }
      var bx = vx + (r() - 0.5) * 300, by = hy + 60 + r() * 60, bw = 90 + r() * 60, bh = 70 + r() * 60;
      var front = [[bx, by + bh], [bx + bw, by + bh], [bx + bw, by], [bx, by]];
      var t = 0.18 + r() * 0.12, back = front.map(function (p) { return [p[0] + (vx - p[0]) * t, p[1] + (hy - p[1]) * t]; });
      items.push({ d: poly(front, true), role: "form" });
      items.push({ d: seg(front[2], back[2]) + seg(front[3], back[3]) + seg(back[2], back[3]) + seg(front[1], back[1]) + seg(back[1], back[2]), role: "form" });
      items.push({ d: seg(front[0], back[0]) + seg(back[0], back[1]) + seg(back[0], back[3]), role: "hidden" });
      front.forEach(function (p) { items.push({ d: seg(p, [vx, hy]), role: "cons" }); });
      items.push({ d: "M" + f(vx - 6) + " " + f(hy) + "a6 6 0 1 0 12 0a6 6 0 1 0 -12 0", role: "form" });
      return { items: items, facts: [["Perspective", "one-point"], ["Horizon", Math.round(hy) + " of 450"]] };
    }
    var vl = -40 + r() * 120, vr = W + 40 - r() * 120;
    for (var a = 0; a <= 10; a++) { var gx = 100 + a * 60; items.push({ d: seg([vl, hy], [gx, H + 10]) + seg([vr, hy], [gx, H + 10]), role: "cons" }); }
    var x = 330 + r() * 140, yt = hy - 70 - r() * 50, yb = Math.min(H - 30, hy + 110 + r() * 80), tl = 0.22 + r() * 0.12, tr = 0.22 + r() * 0.12;
    function lerp(p, q, s) { return [p[0] + (q[0] - p[0]) * s, p[1] + (q[1] - p[1]) * s]; }
    function xing(p1, p2, p3, p4) { var d = (p1[0] - p2[0]) * (p3[1] - p4[1]) - (p1[1] - p2[1]) * (p3[0] - p4[0]); var a1 = p1[0] * p2[1] - p1[1] * p2[0], b1 = p3[0] * p4[1] - p3[1] * p4[0]; return [(a1 * (p3[0] - p4[0]) - (p1[0] - p2[0]) * b1) / d, (a1 * (p3[1] - p4[1]) - (p1[1] - p2[1]) * b1) / d]; }
    var A = [x, yt], B = [x, yb], VL = [vl, hy], VR = [vr, hy];
    var Lt = lerp(A, VL, tl), Rt = lerp(A, VR, tr), Lb = xing(B, VL, Lt, [Lt[0], Lt[1] + 10]), Rb = xing(B, VR, Rt, [Rt[0], Rt[1] + 10]);
    var Top = xing(Lt, VR, Rt, VL), Bot = xing(Lb, VR, Rb, VL);
    items.push({ d: seg(A, B) + seg(A, Lt) + seg(A, Rt) + seg(B, Lb) + seg(B, Rb) + seg(Lt, Lb) + seg(Rt, Rb), role: "form" });
    items.push({ d: seg(Lt, Top) + seg(Rt, Top), role: yt < hy ? "hidden" : "form" });
    items.push({ d: seg(Lb, Bot) + seg(Rb, Bot) + seg(Top, Bot), role: "hidden" });
    [A, B, Lt, Rt].forEach(function (p) { items.push({ d: seg(p, VL) + seg(p, VR), role: "cons" }); });
    return { items: items, facts: [["Perspective", "two-point"], ["Horizon", Math.round(hy) + " of 450"]] };
  }

  /* ---- a block mannequin: proportions in heads (about 7½), joints in a random pose ---- */
  function mannequin(seed) {
    var r = rng(seed), u = 46, items = [];
    var lean = (r() - 0.5) * 0.5, twist = (r() - 0.5) * 0.6;
    var hip = [400 + (r() - 0.5) * 80, 255], chest = [hip[0] + Math.sin(lean) * u * 2.2, hip[1] - Math.cos(lean) * u * 2.2];
    var neck = [chest[0] + Math.sin(lean * 1.3) * u * 0.9, chest[1] - Math.cos(lean * 1.3) * u * 0.9];
    var head = [neck[0] + Math.sin(lean * 1.5) * u * 0.6, neck[1] - Math.cos(lean * 1.5) * u * 0.6];
    function limb(from, a1, l1, a2, l2) { var k1 = [from[0] + Math.sin(a1) * l1, from[1] + Math.cos(a1) * l1]; var k2 = [k1[0] + Math.sin(a1 + a2) * l2, k1[1] + Math.cos(a1 + a2) * l2]; return [from, k1, k2]; }
    function ell(c, rx, ry, ang) { var p = []; for (var i = 0; i <= 36; i++) { var t = 2 * Math.PI * i / 36, x = rx * Math.cos(t), y = ry * Math.sin(t); p.push([c[0] + x * Math.cos(ang) - y * Math.sin(ang), c[1] + x * Math.sin(ang) + y * Math.cos(ang)]); } return poly(p); }
    var shW = u * 0.95, hpW = u * 0.75;
    var shL = [neck[0] - Math.cos(lean + twist) * shW, neck[1] + u * 0.25 - Math.sin(lean + twist) * shW * 0.3], shR = [neck[0] + Math.cos(lean + twist) * shW, neck[1] + u * 0.25 + Math.sin(lean + twist) * shW * 0.3];
    var hpL = [hip[0] - Math.cos(lean - twist) * hpW, hip[1] - Math.sin(lean - twist) * hpW * 0.3], hpR = [hip[0] + Math.cos(lean - twist) * hpW, hip[1] + Math.sin(lean - twist) * hpW * 0.3];
    items.push({ d: ell(head, u * 0.42, u * 0.52, lean * 1.5), role: "form" });
    items.push({ d: ell([(chest[0] + neck[0]) / 2, chest[1] - u * 0.15], u * 0.78, u * 0.95, lean), role: "form" });
    items.push({ d: ell(hip, u * 0.72, u * 0.5, lean - twist * 0.5), role: "form" });
    /* angles from straight down: negative swings out to the left, positive to the right */
    var arms = [limb(shL, -(0.15 + r() * 1.5), u * 1.45, -(r() * 1.2), u * 1.3), limb(shR, 0.15 + r() * 1.5, u * 1.45, r() * 1.2, u * 1.3)];
    var legs = [limb(hpL, -(0.04 + r() * 0.35), u * 1.9, r() * 0.5, u * 1.85), limb(hpR, 0.04 + r() * 0.35, u * 1.9, -(r() * 0.5), u * 1.85)];
    arms.concat(legs).forEach(function (L) {
      items.push({ d: poly(L), role: "form" });
      L.forEach(function (j) { items.push({ d: "M" + f(j[0] - 5) + " " + f(j[1]) + "a5 5 0 1 0 10 0a5 5 0 1 0 -10 0", role: "form" }); });
    });
    items.push({ d: seg(shL, shR) + seg(hpL, hpR), role: "form" });
    /* construction: the line of action, head to the supporting foot */
    var foot = legs[0][2][1] > legs[1][2][1] ? legs[0][2] : legs[1][2];
    items.push({ d: "M" + f(head[0]) + " " + f(head[1]) + "Q" + f(chest[0] + (chest[0] - (head[0] + foot[0]) / 2) * 0.8) + " " + f(chest[1]) + " " + f(foot[0]) + " " + f(foot[1]), role: "cons" });
    items.push({ d: seg(neck, hip), role: "cons" });
    return { items: items, facts: [["Lean", Math.round(lean * 57) + "°"], ["Twist", Math.round(twist * 57) + "°"]] };
  }

  /* ---- a block head: the cranium, the side plane, the centre and brow lines, the jaw ---- */
  function head(seed) {
    var r = rng(seed), yaw = (r() - 0.5) * 2.0, pitch = (r() - 0.5) * 0.8, R = 120, cx = 400, cy = 205;
    var T = function (p) { return rot(p, yaw, pitch, 0); }, P = cam(cx, cy, 1, 1400), items = [];
    var out = []; for (var i = 0; i <= 64; i++) { var a = 2 * Math.PI * i / 64; out.push([cx + R * Math.cos(a), cy + R * Math.sin(a)]); }
    items.push({ d: poly(out), role: "form" });
    /* centre line (a great circle front to back) and brow line (around the middle) */
    var centre = rim(function (p) { return T(rot(p, 0, 0, Math.PI / 2)); }, P, R, 0);
    var brow = rim(T, P, R, 0);
    centre.items.concat(brow.items).forEach(function (x) { items.push({ d: x.d, role: x.role === "form" ? "cons" : "hidden" }); });
    /* the side plane: a circle cut from the side the head turns away from */
    var side = yaw >= 0 ? -1 : 1, sp = [];
    for (var j = 0; j <= 36; j++) { var t = 2 * Math.PI * j / 36; sp.push(P(T([side * R * 0.78, R * 0.6 * Math.sin(t), R * 0.6 * Math.cos(t)]))); }
    items.push({ d: poly(sp), role: "form" });
    /* the jaw: from the side plane's lower edge to the chin, below the sphere on the centre line */
    var chin3 = T([0, -R * 1.45, R * 0.55]), chin = P(chin3);
    [-1, 1].forEach(function (sd) {
      var j3 = T([sd * R * 0.72, -R * 0.62, -R * 0.1]);
      items.push({ d: seg(P(j3), chin), role: sd === side ? "form" : "hidden" });
    });
    var top = P(T([0, R, 0])), bot = chin;
    items.push({ d: seg(top, bot), role: "cons" });
    return { items: items, facts: [["Turn", Math.round(yaw * 57) + "°"], ["Tilt", Math.round(pitch * 57) + "°"]] };
  }

  var KINDS = [
    { id: "forms", t: "Forms", what: "Boxes, cylinders, spheres and cones, turned" },
    { id: "grid", t: "Perspective", what: "A one- or two-point grid with a box" },
    { id: "mannequin", t: "Mannequin", what: "A block figure in a random pose" },
    { id: "head", t: "Head", what: "A block head, turned and tilted" }
  ];
  function build(kind, seed) {
    var fn = { forms: forms, grid: grid, mannequin: mannequin, head: head }[kind] || forms;
    var out = fn(seed);
    return { items: out.items, facts: out.facts, w: W, h: H };
  }
  var api = { KINDS: KINDS, build: build, rng: rng };
  if (root.KOS) root.KOS.crRefs = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
