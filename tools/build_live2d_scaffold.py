"""Build the empty Krita layer scaffold for the Phase 2 Kurenai redraw.

Run through tools/build_live2d_scaffold.sh, which stages this file into
Krita's pykrita directory and drives it with kritarunner.

WHAT THIS DOES: creates a 4096x6144 RGBA .kra containing every group and
layer named in layer-map.json, in the map's back-to-front order, with the
4096 guide as a locked reference and construction lines on the guide layers.

WHAT THIS DOES NOT DO: it does not segment, trace, matte, or otherwise
derive any character material from the master. Every one of the 126
contract layers is created EMPTY. The redraw is manual work by contract
(art-source/assistant/live2d/README.md); this tool only removes the
error-prone bookkeeping of building the stack by hand so that a
mis-ordered or misspelt layer cannot reach Cubism.
"""

import json
import os
import sys

from krita import Krita

W, H = 4096, 6144

# Krita colour labels: 1 blue, 2 green, 3 yellow, 4 orange, 5 brown,
# 6 red, 7 purple, 8 grey. These make the FREE-core merge pass and the
# alternate-state groups visible at a glance in the layer docker.
LABEL_GUIDE = 6      # red    - never exported
LABEL_MERGE = 3      # yellow - merge into its parent for the FREE profile
LABEL_OPTIONAL = 8   # grey   - optional, excluded from the 118 required
LABEL_VARIANT = 7    # purple - ALT_* state layer, starts hidden
LABEL_CORE = 0       # none   - required core ArtMesh

REF_LAYER = "REF_Master_4096_NO_EXPORT"

# Character extents measured from the guide's alpha channel. The centre
# line is the art's own symmetry axis, not the canvas centre (2048).
ART_AXIS_X = 2022
ART_FOOT_Y = 5769
LINE_PX = 5


def bgra(r, g, b, a=255):
    return bytes((b, g, r, a))


def solid(px, count):
    return px * count


def main(args=None):
    # kritarunner invokes the entry point with its argument tuple.
    app = Krita.instance()
    root_dir = os.environ["KOS_LIVE2D_DIR"]
    out_path = os.environ["KOS_LIVE2D_OUT"]
    guide_path = os.path.join(root_dir, "source", "kurenai-neutral-guide-4096-v1.png")

    with open(os.path.join(root_dir, "layer-map.json")) as fh:
        cmap = json.load(fh)

    if cmap["canvas"]["minimumWidth"] > W or cmap["canvas"]["minimumHeight"] > H:
        raise SystemExit("layer-map canvas minimum exceeds scaffold size")

    by_group = {}
    for layer in cmap["layers"]:
        by_group.setdefault(layer["group"], []).append(layer)

    doc = app.createDocument(W, H, "kurenai-live2d-scaffold", "RGBA", "U8",
                             "sRGB-elle-V2-srgbtrc.icc", 300.0)
    doc.setBatchmode(True)
    root = doc.rootNode()

    # createDocument seeds a default paint layer; the scaffold owns its stack.
    for node in list(root.childNodes()):
        node.remove()

    created = []
    prev_group = None
    for group_id in cmap["groupsBackToFront"]:
        grp = doc.createGroupLayer(group_id)
        root.addChildNode(grp, prev_group)
        prev_group = grp

        # addChildNode(node, above) puts the node at the TOP when `above`
        # is None, so the stack is built by chaining each layer above the
        # previous one. That yields the map's back-to-front order.
        prev_layer = None
        if group_id == "00_GUIDES_NO_EXPORT":
            prev_layer = _place_reference(app, doc, grp, guide_path)

        for layer in by_group.get(group_id, []):
            node = doc.createNode(layer["id"], "paintlayer")
            grp.addChildNode(node, prev_layer)
            prev_layer = node
            created.append(layer["id"])

            if layer.get("export") is False:
                node.setColorLabel(LABEL_GUIDE)
            elif layer.get("freeMergeInto"):
                node.setColorLabel(LABEL_MERGE)
            elif layer.get("optional"):
                node.setColorLabel(LABEL_OPTIONAL)
            elif layer.get("variant"):
                node.setColorLabel(LABEL_VARIANT)
            else:
                node.setColorLabel(LABEL_CORE)

            # ALT_* variants and optional effects start hidden, per the
            # PSD preparation contract in README.md.
            if layer.get("variant") or layer.get("optional"):
                node.setVisible(False)

        # Construction geometry on the guide group only.
        if group_id == "00_GUIDES_NO_EXPORT":
            _draw_guides(doc, grp)
            grp.setOpacity(110)

    doc.refreshProjection()
    doc.setName("kurenai-live2d-scaffold")
    if not doc.saveAs(out_path):
        raise SystemExit("saveAs failed: " + out_path)

    print("SCAFFOLD-LAYERS %d" % len(created))
    print("SCAFFOLD-GROUPS %d" % len(cmap["groupsBackToFront"]))
    print("SCAFFOLD-OUT %s" % out_path)
    sys.stdout.flush()
    doc.close()


def _find(group, name):
    for node in group.childNodes():
        if node.name() == name:
            return node
    raise SystemExit("scaffold is missing guide layer " + name)


def _draw_guides(doc, grp):
    """Draw the symmetry axis and the shared foot baseline.

    These are two straight lines derived from the guide's alpha bounding
    box - construction geometry, not character material.
    """
    axis = _find(grp, "Guide_Centerline")
    axis.setPixelData(solid(bgra(255, 0, 180), LINE_PX * H),
                      ART_AXIS_X - LINE_PX // 2, 0, LINE_PX, H)
    axis.setLocked(True)

    foot = _find(grp, "Guide_FootLine")
    foot.setPixelData(solid(bgra(0, 210, 255), W * LINE_PX),
                      0, ART_FOOT_Y - LINE_PX // 2, W, LINE_PX)
    foot.setLocked(True)

    # Guide_Joints is deliberately left empty: joint centres are a
    # decision the rigger makes while redrawing, not something to infer.


def _place_reference(app, doc, grp, guide_path):
    """Add the 4096 guide as a locked, non-exported tracing reference."""
    if not os.path.exists(guide_path):
        raise SystemExit("guide image not found: " + guide_path)
    src = app.openDocument(guide_path)
    src.setBatchmode(True)
    src.refreshProjection()
    if src.width() != W or src.height() != H:
        src.close()
        raise SystemExit("guide is %dx%d, expected %dx%d"
                         % (src.width(), src.height(), W, H))
    data = src.pixelData(0, 0, W, H)

    # Added before any guide layer, so it sits at the bottom of the group
    # and the construction lines stay legible on top of it.
    ref = doc.createNode(REF_LAYER, "paintlayer")
    grp.addChildNode(ref, None)
    ref.setPixelData(data, 0, 0, W, H)
    ref.setOpacity(150)
    ref.setLocked(True)
    ref.setColorLabel(LABEL_GUIDE)
    src.close()
    return ref


if __name__ == "__main__":
    main()
