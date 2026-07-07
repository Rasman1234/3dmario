#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${PORT:-3011}"
PID_FILE="$ROOT/logs/dev.pid"

echo "=== 3D Mario Status ==="
echo ""

if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
  echo "✓ Dev Server Running (PID $(cat "$PID_FILE"))"
else
  echo "✗ Dev Server Stopped"
fi

if curl -sf "http://localhost:$PORT" >/dev/null 2>&1; then
  echo "✓ HTTP Healthy on port $PORT"
else
  echo "✗ HTTP Unreachable on port $PORT"
fi

echo ""
echo "--- System ---"
echo "CPU: $(top -bn1 | grep 'Cpu(s)' | awk '{print $2}')% used"
echo "Memory: $(free -h | awk '/Mem:/ {print $3 "/" $2}')"
echo "Disk: $(df -h "$ROOT" | awk 'NR==2 {print $3 "/" $2 " (" $5 " used)"}')"

if command -v lsof >/dev/null; then
  echo ""
  echo "--- Port $PORT ---"
  lsof -i :"$PORT" -sTCP:LISTEN 2>/dev/null || echo "No listeners"
fi
