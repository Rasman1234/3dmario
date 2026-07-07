#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
PORT="${PORT:-3011}"

echo "=== 3D Mario Auto-Fix ==="
echo ""

FIXED=0

if [ ! -d node_modules ]; then
  echo "ROOT CAUSE: Missing node_modules"
  echo "FIX: Running npm install..."
  npm install
  FIXED=1
fi

if ! npm run typecheck >/dev/null 2>&1; then
  echo "ROOT CAUSE: TypeScript errors detected"
  echo "DIAGNOSTIC:"
  npm run typecheck 2>&1 | tail -20
  echo "FIX: Manual intervention required for type errors"
fi

if command -v lsof >/dev/null; then
  STALE_PID=$(lsof -i :"$PORT" -sTCP:LISTEN -t 2>/dev/null || true)
  if [ -n "$STALE_PID" ] && [ -f logs/dev.pid ]; then
    CURRENT_PID=$(cat logs/dev.pid 2>/dev/null || echo "")
    if [ "$STALE_PID" != "$CURRENT_PID" ]; then
      echo "ROOT CAUSE: Port $PORT occupied by stale process $STALE_PID"
      echo "FIX: Killing stale process..."
      kill "$STALE_PID" 2>/dev/null || true
      FIXED=1
    fi
  fi
fi

if [ "$FIXED" -eq 1 ]; then
  echo ""
  echo "VALIDATION: Re-running health check..."
  "$ROOT/scripts/health.sh" || true
else
  echo "No automatic fixes applied."
  echo "Run ./scripts/health.sh for diagnostics."
fi
