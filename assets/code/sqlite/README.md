# SQLite in WebAssembly (sql.js 1.14.2)

Vendored, unchanged, from the npm package `sql.js` 1.14.2 (MIT licence,
`LICENSE` here; it bundles SQLite 3.49.1, public domain). Integrity of the
tarball: `sha512-` as published on registry.npmjs.org.

Used only by Code's SQL runner (`js/labs/sql-run.js` in the sealed worker
`js/labs/sql-worker.js`), and fetched only the first time a lesson runs SQL.
To update: replace `sql-wasm.js` and `sql-wasm.wasm` from a newer release,
then run `node tools/sql_diff.mjs`.
