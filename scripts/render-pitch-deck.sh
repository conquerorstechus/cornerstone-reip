#!/bin/bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/public/RIP-Pitch-Deck.pdf"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
URL="${1:-http://localhost:3003/pitch/deck.html}"

"$CHROME" \
  --headless=new \
  --disable-gpu \
  --no-pdf-header-footer \
  --no-first-run \
  --disable-extensions \
  --virtual-time-budget=20000 \
  --hide-scrollbars \
  --print-to-pdf="$OUT" \
  "$URL"

echo "Wrote $OUT"
ls -lh "$OUT"
