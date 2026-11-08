#!/bin/sh
export PATH="/usr/local/n/versions/node/24.18.0/bin:/usr/local/bin:/opt/homebrew/bin:$PATH"
exec /usr/local/n/versions/node/24.18.0/bin/node docs/audit/2026-11/harness/kos.mjs "$@"
