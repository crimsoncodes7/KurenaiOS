import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const liveRoot = resolve(root, "art-source/assistant/live2d");
const layerPath = resolve(liveRoot, "layer-map.json");
const rigPath = resolve(liveRoot, "rig-contract.json");
const layerMap = JSON.parse(readFileSync(layerPath, "utf8"));
const rig = JSON.parse(readFileSync(rigPath, "utf8"));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function pngInfo(path) {
  const bytes = readFileSync(path);
  assert(bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), `${path} is not a PNG`);
  assert(bytes.subarray(12, 16).toString("ascii") === "IHDR", `${path} has no leading IHDR chunk`);
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
    bitDepth: bytes[24],
    colourType: bytes[25]
  };
}

const masterPath = resolve(liveRoot, layerMap.sourceMaster);
assert(existsSync(masterPath), "canonical neutral master is missing");
const master = pngInfo(masterPath);
assert(master.width === 2048 && master.height === 3072, `master must be 2048×3072, got ${master.width}×${master.height}`);
assert(master.bitDepth === 8 && master.colourType === 6, "master must be 8-bit RGBA");

assert(layerMap.canvas.minimumWidth >= 4096 && layerMap.canvas.minimumHeight >= 6144, "manual PSD target is below the Phase 2 resolution floor");
assert(layerMap.canvas.transparent === true, "manual PSD must keep transparency");
assert(layerMap.status === "awaiting-manual-redraw", "layer-map status changed without updating the validator gate");
assert(Array.isArray(layerMap.layers) && layerMap.layers.length >= 100, "layer map is not detailed enough for the full-body rig");

const groupSet = new Set(layerMap.groupsBackToFront);
const ids = new Set();
for (const layer of layerMap.layers) {
  assert(layer.id && !ids.has(layer.id), `duplicate or missing layer id: ${layer.id || "<empty>"}`);
  assert(groupSet.has(layer.group), `unknown group for ${layer.id}: ${layer.group}`);
  ids.add(layer.id);
}
const exportedLayers = layerMap.layers.filter(layer => layer.export !== false && !layer.optional);
for (const layer of exportedLayers) {
  if (layer.freeMergeInto) assert(ids.has(layer.freeMergeInto), `freeMergeInto target is missing for ${layer.id}: ${layer.freeMergeInto}`);
}
const fullMeshCount = new Set(exportedLayers.map(layer => layer.id)).size;
const freeMeshCount = new Set(exportedLayers.map(layer => layer.freeMergeInto || layer.id)).size;
assert(fullMeshCount === 118, `full profile must contain 118 required ArtMeshes, got ${fullMeshCount}`);
assert(freeMeshCount <= layerMap.profiles.freeCore.artMeshLimit, `free profile exceeds ${layerMap.profiles.freeCore.artMeshLimit} ArtMeshes: ${freeMeshCount}`);
assert(freeMeshCount === 95, `free profile changed unexpectedly: ${freeMeshCount}`);
for (const required of [
  "Body_HeadBase", "Body_Neck", "Body_Torso", "Eye_L_Sclera", "Eye_R_Sclera",
  "Mouth_Inner", "Hair_Back_Base", "Hair_Front_Base", "Arm_L_Upper", "Arm_R_Upper",
  "Hand_L_Base", "Hand_R_Base", "Leg_L_Upper", "Leg_R_Upper", "Coat_Front_L",
  "Coat_Front_R", "Tablet_Back", "Flower_Petals"
]) assert(ids.has(required), `required Live2D layer is missing: ${required}`);

const lifecycle = ["idle", "thinking", "working", "success", "error", "confirmation"];
assert(JSON.stringify(Object.keys(rig.motions)) === JSON.stringify(lifecycle), "rig lifecycle motion order must match the Phase 1 controller");
assert(rig.release.publicDeployment === false, "public Live2D deployment cannot be enabled before the licensing gate is recorded");
assert(rig.release.staticFallbackRequired === true, "Phase 1 static fallback must remain mandatory");
assert(rig.runtime.controllerOwnsLifecycle === true && rig.runtime.inferStateFromProse === false, "the rig must not own or infer lifecycle state");
assert(rig.runtime.reducedMotion === "static-phase-1-png" && rig.runtime.loadFailure === "static-phase-1-png", "reduced motion and failures must retain the static renderer");
assert(Object.keys(rig.interactions).join(",") === "hover,head,flower,tablet", "interaction contract drifted from Phase 1");
assert(rig.parameters.length <= 30, `free profile exceeds Cubism FREE's 30-parameter limit: ${rig.parameters.length}`);

for (const path of [
  "assets/assistant/mascot/states/idle.png",
  "assets/assistant/mascot/states/thinking.png",
  "assets/assistant/mascot/states/working.png",
  "assets/assistant/mascot/states/success.png",
  "assets/assistant/mascot/states/error.png",
  "assets/assistant/mascot/states/confirmation.png"
]) assert(existsSync(resolve(root, path)), `static fallback missing: ${path}`);

assert(!existsSync(resolve(root, "assets/assistant/live2d")), "runtime Live2D assets exist before the release gate is cleared");

console.log(`PHASE 2 SOURCE PASS — ${layerMap.layers.length} named layers, ${fullMeshCount} full / ${freeMeshCount} free-core ArtMeshes, ${rig.parameters.length} parameters, ${lifecycle.length} lifecycle motions, RGBA ${master.width}×${master.height} master, release gate closed.`);
