#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
PORT="${PORT:-3011}"

SCORE=100
WARNINGS=0
ERRORS=0

check() {
  local name="$1"
  local cmd="$2"
  if eval "$cmd" >/dev/null 2>&1; then
    echo "✓ $name"
  else
    echo "✗ $name"
    ERRORS=$((ERRORS + 1))
    SCORE=$((SCORE - 10))
  fi
}

warn() {
  local name="$1"
  local cmd="$2"
  if eval "$cmd" >/dev/null 2>&1; then
    echo "✓ $name"
  else
    echo "⚠ $name"
    WARNINGS=$((WARNINGS + 1))
    SCORE=$((SCORE - 3))
  fi
}

echo "=== 3D Mario Health Audit ==="
echo ""

echo "--- Infrastructure ---"
check "Node.js" "command -v node"
check "npm" "command -v npm"
check "Dependencies installed" "[ -d node_modules ]"

echo ""
echo "--- Code Quality ---"
check "TypeScript compiles" "npm run typecheck"
check "Unit tests pass" "npm run test"
warn "Architecture valid" "npm run validate:arch"

echo ""
echo "--- Runtime ---"
warn "Dev server running" "[ -f logs/dev.pid ] && kill -0 \$(cat logs/dev.pid)"
warn "HTTP reachable" "curl -sf http://localhost:$PORT"

echo ""
echo "--- Disk & Memory ---"
avail=$(df -BM "$ROOT" | awk 'NR==2 {print $4}' | tr -d M)
if [ "$avail" -gt 1000 ]; then
  echo "✓ Disk space (${avail}MB)"
else
  echo "⚠ Low disk space (${avail}MB)"
  WARNINGS=$((WARNINGS + 1))
  SCORE=$((SCORE - 5))
fi

echo ""
echo "Health Score: $SCORE/100"
echo "Warnings: $WARNINGS"
echo "Errors: $ERRORS"

[ "$ERRORS" -eq 0 ]
