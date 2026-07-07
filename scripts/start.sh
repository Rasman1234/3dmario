#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
PORT="${PORT:-3011}"
LOG_DIR="$ROOT/logs"
PID_FILE="$LOG_DIR/dev.pid"

mkdir -p "$LOG_DIR"

echo "==> Validating environment..."
command -v node >/dev/null || { echo "ERROR: node not found"; exit 1; }
command -v npm >/dev/null || { echo "ERROR: npm not found"; exit 1; }

echo "==> Checking disk space..."
avail=$(df -BM "$ROOT" | awk 'NR==2 {print $4}' | tr -d M)
if [ "$avail" -lt 500 ]; then
  echo "WARNING: Low disk space (${avail}MB available)"
fi

echo "==> Checking dependencies..."
[ -d node_modules ] || npm install

echo "==> Running typecheck..."
npm run typecheck

echo "==> Validating architecture..."
npm run validate:arch

echo "==> Checking port $PORT..."
if command -v lsof >/dev/null && lsof -i :"$PORT" -sTCP:LISTEN -t >/dev/null 2>&1; then
  echo "ERROR: Port $PORT already in use"
  lsof -i :"$PORT" -sTCP:LISTEN || true
  exit 1
fi

echo "==> Starting dev server..."
nohup npm run dev -- --host 0.0.0.0 --port "$PORT" > "$LOG_DIR/dev.log" 2>&1 &
echo $! > "$PID_FILE"

echo "==> Waiting for health..."
for i in $(seq 1 30); do
  if curl -sf "http://localhost:$PORT" >/dev/null 2>&1; then
    echo "✓ Dev server healthy at http://localhost:$PORT"
    exit 0
  fi
  sleep 1
done

echo "ERROR: Server did not become healthy in time"
tail -20 "$LOG_DIR/dev.log" || true
exit 1
