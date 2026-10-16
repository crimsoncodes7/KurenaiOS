#!/bin/bash
# Kurenai OS — tools/build_cs_wasm.sh
# Builds the full C# runner (tools/cs-wasm: Roslyn inside .NET WebAssembly,
# units 7+) into assets/code/runtime/<id>/, where the worker
# js/labs/cs-wasm-worker.js loads it. The id is Runner.Version; a new id is
# a new folder, so a device keeps its cached copy until the runner changes.
# The output is generated (gitignored); tools/deploy_pages.sh builds it when
# it is missing. Needs the .NET 10 SDK and NuGet once.
set -euo pipefail
cd "$(dirname "$0")/.."
ID=$(grep -o 'const string Version = "[^"]*"' tools/cs-wasm/Program.cs | sed 's/.*"\(.*\)"/\1/')
JSID=$(grep -o 'RUNTIME_ID = "[^"]*"' js/core/coderun.js | sed 's/.*"\(.*\)"/\1/')
if [ "$ID" != "$JSID" ]; then echo "ERROR: Runner.Version ($ID) and coderun.js RUNTIME_ID ($JSID) disagree" >&2; exit 1; fi
TMP=$(mktemp -d)
dotnet publish tools/cs-wasm/CsWasm.csproj -c Release -o "$TMP" -p:TreatWarningsAsErrors=false -nologo -v quiet
rm -rf assets/code/runtime
mkdir -p "assets/code/runtime/$ID"
cp -R "$TMP/wwwroot/_framework/." "assets/code/runtime/$ID/"
rm -rf "$TMP"
node -e '
const fs = require("fs"), path = require("path"), zlib = require("zlib");
const dir = process.argv[1], files = [];
(function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else files.push(p); } })(dir);
let bytes = 0, gz = 0;
const list = files.map((p) => { const b = fs.readFileSync(p); bytes += b.length; gz += zlib.gzipSync(b).length; return path.relative(dir, p).split(path.sep).join("/"); }).sort();
fs.writeFileSync(path.join(dir, "kurenai-runtime.json"), JSON.stringify({ id: process.argv[2], bytes, gzipBytes: gz, files: list }, null, 1));
console.log("runtime " + process.argv[2] + ": " + list.length + " files, " + (bytes / 1e6).toFixed(1) + " MB (" + (gz / 1e6).toFixed(1) + " MB compressed)");
' "assets/code/runtime/$ID" "$ID"
