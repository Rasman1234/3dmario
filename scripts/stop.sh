#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PID_FILE="$ROOT/logs/dev.pid"

if [ ! -f "$PID_FILE" ]; then
  echo "No running server found"
  exit 0
fi

PID=$(cat "$PID_FILE")
if kill -0 "$PID" 2>/dev/null; then
  echo "==> Stopping dev server (PID $PID)..."
  kill "$PID"
  for i in $(seq 1 10); do
    kill -0 "$PID" 2>/dev/null || break
    sleep 0.5
  done
  if kill -0 "$PID" 2>/dev/null; then
    echo "==> Force killing..."
    kill -9 "$PID" 2>/dev/null || true
  fi
  echo "✓ Server stopped"
else
  echo "Process $PID not running"
fi

rm -f "$PID_FILE"
