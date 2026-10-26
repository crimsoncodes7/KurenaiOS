"""Import the Gemini drafts (docs/japanese-plan.md §12.1, the pipeline's step 4).

  python3 -I prototypes/japanese-space/art_import.py art-source/ja prototypes/japanese-space/art

For every asset in manifest.json whose draft is in inbox/:
  - sprites (base, face): key out the flat green, take the green spill off the edges, and put
    every expression on its base's canvas;
  - faces: align the expression to the base by the BODY (a small shift search), measure how far
    the body drifted, and keep only the head from the expression — the body pixels stay the
    base's, so a reaction changes the face alone;
  - backgrounds: resize;
  - manga panels: trim any flat strip along an edge (a white band Gemini leaves under the art), resize;
  - covers (Routines' card art): resize;
  - spots (small empty-state art on green): key out the green, trim to the art, resize.
Writes WebP to the output folder and report.json (drift per face) for the contact sheet.
Drafts arrive as JPEG under a .png name (Gemini's download), which is handled.
"""
import json, sys, os
import numpy as np
from PIL import Image

SRC, OUT = sys.argv[1], sys.argv[2]
SPRITE_H = 1400          # exported sprite height (px)
BG_W = 1920              # exported background width (px)
PANEL_LONG = 1800        # exported manga panel, long side (px)
COVER_W = 960            # exported card cover width (px)
SPOT_LONG = 640          # exported spot illustration, long side (px)
HEAD = 0.20              # share of the figure's height treated as the head (top of hair to the chin/neck)
FEATHER = 28             # px of blend under the head box


def load(path):
    return np.asarray(Image.open(path).convert("RGB"), dtype=np.float32) / 255.0


def key_green(rgb):
    """Soft chroma key for a flat #00FF00 ground. Alpha from how much green dominates; then the
    green is UN-MIXED from every edge pixel (C = a·F + (1 − a)·G, solved for F), and whatever green
    still leans out is clamped — so hair and glasses keep no green fringe on any background."""
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    dom = g - np.maximum(r, b)
    key = np.clip((dom - 0.06) / (0.30 - 0.06), 0, 1) * (g > 0.25)
    alpha = 1.0 - key
    G = np.array([0.0, 1.0, 0.0], np.float32)
    a = np.maximum(alpha, 0.05)[..., None]
    out = np.clip((rgb - (1 - alpha)[..., None] * G) / a, 0, 1)
    # residual spill: green may not exceed the brighter of red and blue
    ro, go, bo = out[..., 0], out[..., 1], out[..., 2]
    out[..., 1] = np.minimum(go, np.maximum(ro, bo) + 0.02)
    alpha = np.where(alpha < 0.08, 0, alpha)
    return out, alpha


def bbox(alpha, thr=0.5):
    ys, xs = np.where(alpha > thr)
    return ys.min(), ys.max(), xs.min(), xs.max()


def shift(img, dy, dx):
    out = np.zeros_like(img)
    h, w = img.shape[:2]
    ys, yd = (slice(0, h - dy), slice(dy, h)) if dy >= 0 else (slice(-dy, h), slice(0, h + dy))
    xs, xd = (slice(0, w - dx), slice(dx, w)) if dx >= 0 else (slice(-dx, w), slice(0, w + dx))
    out[yd, xd] = img[ys, xs]
    return out


def align(base, base_a, face, face_a, body_from, rng=14):
    """Best (dy, dx) for the face image so its BODY sits on the base's, searched at half size."""
    def half(x):
        return x[::2, ::2]
    g_b, g_f = half(base.mean(axis=2)), half(face.mean(axis=2))
    m = half((base_a > 0.5).astype(np.float32))
    m[: body_from // 2] = 0
    best, arg = 1e9, (0, 0)
    for dy in range(-rng // 2, rng // 2 + 1):
        for dx in range(-rng // 2, rng // 2 + 1):
            d = np.abs(shift(g_f, dy, dx) - g_b) * m
            s = d.sum() / max(1, m.sum())
            if s < best:
                best, arg = s, (dy * 2, dx * 2)
    return arg


def trim_flat(rgb, tol=0.03, min_px=4):
    """Crop flat bands off each edge: a row (or column) counts as flat when it is one even tone
    (white, black or grey) — art has texture, a padding strip does not. Returns the crop box and
    what was trimmed from each side."""
    g = rgb.mean(axis=2)
    def flat(lines):
        return (lines.std(axis=1) < tol) & (np.abs(lines.mean(axis=1) - lines.mean(axis=1)[0]) < tol)
    h, w = g.shape
    def run(lines):
        f = flat(lines); n = 0
        while n < len(f) and f[n]:
            n += 1
        return n if n >= min_px else 0
    top, bottom = run(g), run(g[::-1])
    left, right = run(g.T), run(g.T[::-1])
    trimmed = {k: v for k, v in (("top", top), ("bottom", bottom), ("left", left), ("right", right)) if v}
    return (left, top, w - right, h - bottom), trimmed


def to_image(rgb, a=None):
    arr = np.clip(rgb * 255 + 0.5, 0, 255).astype(np.uint8)
    if a is None:
        return Image.fromarray(arr, "RGB")
    return Image.fromarray(np.dstack([arr, np.clip(a * 255 + 0.5, 0, 255).astype(np.uint8)]), "RGBA")


def main():
    man = json.load(open(os.path.join(SRC, "manifest.json")))
    inbox = os.path.join(SRC, "inbox")
    os.makedirs(OUT, exist_ok=True)
    report = {"assets": {}}
    have = lambda a: os.path.exists(os.path.join(inbox, a["id"] + ".png"))
    bases = {}

    for a in man["assets"]:
        if a["kind"] == "base" and have(a):
            rgb = load(os.path.join(inbox, a["id"] + ".png"))
            rgb, al = key_green(rgb)
            y0, y1, x0, x1 = bbox(al)
            bases[a["who"]] = dict(id=a["id"], rgb=rgb, a=al, box=(y0, y1, x0, x1), size=rgb.shape[:2])
            r = {"kind": "base", "src": list(rgb.shape[:2][::-1])}
            if y1 >= rgb.shape[0] - 4:
                r["note"] = "the feet touch the bottom edge: the figure is cut off; regenerate with more margin if it matters"
            report["assets"][a["id"]] = r

    def export_sprite(aid, who, rgb, al):
        b = bases[who]
        y0, y1, x0, x1 = b["box"]
        pad = 12
        y0, x0 = max(0, y0 - pad), max(0, x0 - pad)
        y1, x1 = min(rgb.shape[0], y1 + pad), min(rgb.shape[1], x1 + pad)
        img = to_image(rgb[y0:y1, x0:x1], al[y0:y1, x0:x1])
        scale = SPRITE_H / img.height
        if scale < 1:
            img = img.resize((round(img.width * scale), SPRITE_H), Image.LANCZOS)
        img.save(os.path.join(OUT, aid + ".webp"), "WEBP", quality=88, method=6)
        return img.size

    for who, b in bases.items():
        report["assets"][b["id"]]["out"] = export_sprite(b["id"], who, b["rgb"], b["a"])
        y0, y1, _, _ = b["box"]
        report["assets"][b["id"]]["headBox"] = [int(y0), int(y0 + HEAD * (y1 - y0))]

    for a in man["assets"]:
        if a["kind"] != "face" or not have(a) or a["who"] not in bases:
            continue
        b = bases[a["who"]]
        H, W = b["size"]
        im = Image.open(os.path.join(inbox, a["id"] + ".png")).convert("RGB")
        note = []
        if im.height < H * 0.8:
            note.append("low resolution (%dx%d): upscaled; regenerate at full size" % im.size)
        if im.size != (W, H):
            im = im.resize((W, H), Image.LANCZOS)
        rgb, al = key_green(np.asarray(im, dtype=np.float32) / 255.0)
        y0, y1, x0, x1 = b["box"]
        head_end = int(y0 + HEAD * (y1 - y0))
        dy, dx = align(b["rgb"], b["a"], rgb, al, head_end)
        rgb, al = shift(rgb, dy, dx), shift(al, dy, dx)
        # body drift after alignment: mean colour difference where both are figure
        body = np.zeros((H, W), bool); body[head_end:] = True
        both = body & (b["a"] > 0.5) & (al > 0.5)
        diff = np.abs(rgb - b["rgb"]).mean(axis=2)[both] * 255
        drift = float(diff.mean()) if diff.size else 99.0
        off = float((diff > 40).mean() * 100) if diff.size else 100.0
        # how far the HEAD itself moved against the base's head (a moved head leaves a seam)
        hdy, hdx = align(b["rgb"][: head_end + 40], b["a"][: head_end + 40], rgb[: head_end + 40], al[: head_end + 40], 0, rng=10)
        # composite: the expression's head over the base, feathered into the neck
        w = np.zeros((H, W), np.float32)
        w[:head_end] = 1.0
        ramp = np.linspace(1, 0, FEATHER)
        w[head_end:head_end + FEATHER] = ramp[: max(0, min(FEATHER, H - head_end))][:, None]
        out_rgb = b["rgb"] * (1 - w[..., None]) + rgb * w[..., None]
        out_a = b["a"] * (1 - w) + al * w
        size = export_sprite(a["id"], a["who"], out_rgb, out_a)
        grade = "ok" if drift < 7 and off < 4 else "slight" if drift < 12 and off < 10 else "redo"
        if abs(hdy) > 6 or abs(hdx) > 6:
            note.append("the head moved %d,%d px against the body: check the neck seam" % (hdx, hdy))
        report["assets"][a["id"]] = {"kind": "face", "shift": [dx, dy], "bodyDrift": round(drift, 1),
                                     "bodyOffPct": round(off, 1), "grade": grade, "out": size, "note": "; ".join(note) or None}

    for a in man["assets"]:
        if a["kind"] != "background" or not have(a):
            continue
        im = Image.open(os.path.join(inbox, a["id"] + ".png")).convert("RGB")
        if im.width > BG_W:
            im = im.resize((BG_W, round(im.height * BG_W / im.width)), Image.LANCZOS)
        im.save(os.path.join(OUT, a["id"] + ".webp"), "WEBP", quality=86, method=6)
        report["assets"][a["id"]] = {"kind": "background", "out": im.size}

    for a in man["assets"]:
        if a["kind"] != "panel" or not have(a):
            continue
        im = Image.open(os.path.join(inbox, a["id"] + ".png")).convert("RGB")
        box, trimmed = trim_flat(np.asarray(im, dtype=np.float32) / 255.0)
        im = im.crop(box)
        if max(im.size) > PANEL_LONG:
            k = PANEL_LONG / max(im.size)
            im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
        im.save(os.path.join(OUT, a["id"] + ".webp"), "WEBP", quality=88, method=6)
        report["assets"][a["id"]] = {"kind": "panel", "out": im.size, "trimmed": trimmed,
                                     "note": ("trimmed a flat strip: " + ", ".join("%s %dpx" % t for t in trimmed.items())) if trimmed else None}

    for a in man["assets"]:
        if a["kind"] != "cover" or not have(a):
            continue
        im = Image.open(os.path.join(inbox, a["id"] + ".png")).convert("RGB")
        if im.width > COVER_W:
            im = im.resize((COVER_W, round(im.height * COVER_W / im.width)), Image.LANCZOS)
        im.save(os.path.join(OUT, a["id"] + ".webp"), "WEBP", quality=84, method=6)
        report["assets"][a["id"]] = {"kind": "cover", "out": im.size}

    for a in man["assets"]:
        if a["kind"] != "spot" or not have(a):
            continue
        rgb, al = key_green(load(os.path.join(inbox, a["id"] + ".png")))
        y0, y1, x0, x1 = bbox(al)
        pad = 16
        y0, x0 = max(0, y0 - pad), max(0, x0 - pad)
        y1, x1 = min(rgb.shape[0], y1 + pad), min(rgb.shape[1], x1 + pad)
        im = to_image(rgb[y0:y1, x0:x1], al[y0:y1, x0:x1])
        if max(im.size) > SPOT_LONG:
            k = SPOT_LONG / max(im.size)
            im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
        im.save(os.path.join(OUT, a["id"] + ".webp"), "WEBP", quality=88, method=6)
        report["assets"][a["id"]] = {"kind": "spot", "out": im.size}

    json.dump(report, open(os.path.join(OUT, "report.json"), "w"), indent=1, ensure_ascii=False)
    for k, v in report["assets"].items():
        print(k, json.dumps({x: v[x] for x in v if x in ("grade", "bodyDrift", "bodyOffPct", "shift", "note", "out")}, ensure_ascii=False))


main()
