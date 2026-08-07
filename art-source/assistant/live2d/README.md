# Kurenai Live2D source workspace

This directory is the non-runtime production workspace for Phase 2. Nothing in
`art-source/` is copied by `tools/deploy_pages.sh`; only exported, approved
runtime files may later enter `assets/assistant/live2d/`.

## Current gate

- Development and local SDK evaluation may proceed.
- Public deployment is disabled until Live2D confirms the applicable
  AI/chatbot publication classification in writing.
- No Cubism SDK, Core binary, `.moc3`, or model texture is currently committed.
- Phase 1 static PNGs remain the production fallback and the lifecycle/audio
  controller remains authoritative.

Live2D's March 2025 AI FAQ says AI avatars, chat interfaces, concierges, and
AI-assisted source preparation are permitted in principle when the terms are
otherwise followed. Their SDK licensing page separately routes AI/chatbot
interfaces through its publication flow and requires every Expandable
Application to be reviewed, including individual publishers. See:

- <https://help.live2d.com/en/other/other_33/>
- <https://www.live2d.com/en/sdk/license/>
- <https://www.live2d.com/en/sdk/license/expandable/>

This is an engineering gate, not a legal conclusion. The release question is
drafted in `LICENSE_REQUEST.md` and must be answered before enabling the runtime
on the public Pages build.

## Canonical master

`source/kurenai-neutral-master-2048-v2.png` is the approved neutral redraw
guide. It is a `2048×3072` RGBA image with transparent corners, level head,
square shoulders and hips, visible hands, a common foot line, and no tablet.

The master is **not** a rigging source by itself. Do not automatically segment,
trace, or infer hidden body material from it. Create a new high-resolution PSD
and manually redraw every component listed in `layer-map.json`, including the
material hidden behind joints and overlaps.

The source sequence is retained for auditability:

- `kurenai-neutral-chroma-v1.png` — built-in ImageGen output on a flat key.
- `kurenai-neutral-cutout-v1.png` — first local matte pass.
- `kurenai-neutral-master-2048-v1.png` — first 2× working enlargement.
- `kurenai-neutral-cutout-v2.png` — selected matte with a one-pixel edge
  contraction.
- `kurenai-neutral-master-2048-v2.png` — selected master/redraw guide.

### Generation provenance

Mode: built-in ImageGen, identity-preserving edit using the Phase 1 idle PNG as
the authoritative face, outfit, accessory, and palette reference. The prompt
requested a front-facing neutral full-body pose, empty separated hands, square
torso, common foot line, no prop, no shadow, and a uniform `#00ff00` chroma
background. Chroma removal used the bundled `remove_chroma_key.py` helper with
soft matte, despill, and a one-pixel edge contraction. The selected cutout was
then enlarged to `2048×3072` as a manual redraw guide.

## Redraw scaffold (build this first)

`source/kurenai-live2d-scaffold-4096-v1.kra` is the starting canvas for the
manual redraw. Rebuild it at any time with:

```sh
tools/build_live2d_scaffold.sh          # → source/kurenai-live2d-scaffold-4096-v1.kra
node tools/validate_live2d_scaffold.mjs # structural check against layer-map.json
```

It is `4096×6144` RGBA and contains every group and layer in `layer-map.json`,
in the map's back-to-front order, so a misspelt or mis-stacked layer cannot
reach Cubism. Colour labels mark the work: **yellow** = merge into its parent
for the FREE profile, **purple** = `ALT_*` variant (starts hidden), **grey** =
optional (starts hidden), **red** = never exported.

`00_GUIDES_NO_EXPORT` holds a locked `REF_Master_4096_NO_EXPORT` tracing
reference at the bottom, plus a magenta symmetry axis at x=2022 and a cyan
foot baseline at y=5769 (both measured from the guide's alpha bounding box,
x 843–3201 / y 231–5769). `Guide_Joints` is deliberately empty — joint centres
are the rigger's decision. **Delete the whole guide group before exporting the
PSD.**

**Every one of the 126 contract layers is EMPTY.** The scaffold builds
structure only; it does not segment, trace, matte or infer any character
material from the master, and no tool in this repository may be changed to do
so. The redraw — including the material hidden behind every joint — is manual
work, exactly as the PSD preparation contract below requires.

## PSD preparation contract

Use Krita or Photopea for source preparation and validate the first structural
PSD in Cubism before detailing every layer.

1. Start at `4096×6144` or larger so the face, fingers, jewellery, and coat
   motifs retain enough material for clean meshes.
2. Use the exact group and layer IDs in `layer-map.json`. Left and right always
   mean Kurenai's left and right, not the viewer's.
3. Redraw hidden material beyond every neck, shoulder, elbow, wrist, waist,
   hip, knee, hair, coat, and skirt overlap. A 12–20% overlap beyond the visible
   seam is the normal minimum; large rotations need more.
4. Keep left/right eyes, brows, irises, highlights, lashes, ears, limbs, sleeves,
   coat panels, skirt panels, earrings, and tassels independent.
5. Keep shadows with the material they deform with. Use normal layers and
   clipping groups that survive PSD import; avoid unsupported blend modes,
   smart objects, linked layers, layer effects, vector masks, and merged limbs.
6. Alternate state arms, hands, and tablet pieces live under the `ALT_*` groups
   and start hidden. Expressions should reuse the base face wherever possible.
7. Preserve a transparent background, a shared centreline, and the same foot
   baseline. Do not crop between exports.
8. Import the structural PSD into Cubism before painting fine detail. Any lost
   clipping, changed ordering, or merged group is cheaper to fix at this stage.

### FREE editor profile

The full map contains 118 required ArtMeshes. Live2D Cubism FREE currently
allows 100 ArtMeshes, 30 motion parameters, and one texture atlas up to 2048px.
For the first no-cost rig, merge the 23 layers marked `freeMergeInto` in
`layer-map.json`; this produces a 95-ArtMesh core model with 17 parameters.
Keep an unmerged source PSD so the 118-mesh `proFull` profile can be restored
during the 42-day PRO trial or a later paid/student licence. The free core is the
durable baseline because it can still be opened and saved after a trial expires.

## Rigging order

1. Face angles, eye tracking/blinks, brows, mouth form/open, and head turn.
2. Neck, torso, hip, and breathing deformation.
3. Hair, earrings, tassels, coat tails, and skirt physics.
4. Arm/hand pose switches and tablet prop.
5. Lifecycle motions: idle, thinking, working, success, error, confirmation.
6. Interaction motions: hover, head, flower, tablet.
7. Optional high-cost motions such as a dance or attack only after the core
   model meets performance and identity checks.

`rig-contract.json` is the runtime-facing parameter, motion, hit-area, and
fallback contract. The existing JavaScript lifecycle controller owns state,
cooldowns, audio priority, and reduced-motion behaviour; Cubism may animate the
visual but may not infer or change lifecycle state.

## Runtime binding

`js/modules/assistant-live2d.js` is the adapter that plugs a Cubism runtime
into the renderer seam in `js/modules/assistant.js`. It ships with the app and
contains **no** SDK, Core binary, model or texture — `enable()` refuses unless
`window.Live2DCubismCore` and `window.Live2DCubismFramework` have been
installed on the page by hand, so it is inert on every build produced today.

Its motion, reaction and frame-budget tables mirror `rig-contract.json`;
`tools/smoke39.test.js` fails if the two drift, and also proves the fallback:
a runtime that returns nothing, throws, rejects or hands back an unplayable
model leaves the Phase 1 static PNGs untouched.

To evaluate a runtime locally, place the SDK under `js/vendor/live2d/` and the
exported model under `assets/assistant/live2d/`. Both paths are gitignored and
`tools/deploy_pages.sh` hard-fails if either reaches `dist/` — the gate above
stays closed until Live2D answers `LICENSE_REQUEST.md` in writing.

## Blocked on the user

1. **Live2D Cubism Editor 5.3 (Apple Silicon) is not installed.** Download it
   from <https://www.live2d.com/en/cubism/download/editor/> and accept the
   EULA personally — no agent may accept it on the user's behalf. The 42-day
   PRO trial starts on first launch; the FREE editor is the durable baseline
   because it still opens and saves after the trial expires.
2. **The redraw itself.** 126 layers of hand illustration on the scaffold,
   including material hidden behind every joint and overlap. Automatic layer
   extraction is forbidden by this contract, so this cannot be delegated to
   tooling. Rigging, expressions, physics and the six lifecycle motions all
   follow from it.
