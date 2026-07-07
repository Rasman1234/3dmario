#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOG_DIR="$ROOT/logs"
SERVICE="${1:-}"
FOLLOW="${2:-}"

show_log() {
  local file="$1"
  if [ -f "$file" ]; then
    echo "=== $file ==="
    if [ "$FOLLOW" = "--follow" ] || [ "$SERVICE" = "--follow" ]; then
      tail -f "$file"
    else
      tail -50 "$file"
    fi
  fi
}

mkdir -p "$LOG_DIR"

case "$SERVICE" in
  dev|"")
    show_log "$LOG_DIR/dev.log"
    ;;
  --follow)
    show_log "$LOG_DIR/dev.log"
    ;;
  *)
    echo "Unknown service: $SERVICE"
    echo "Usage: ./logs.sh [dev] [--follow]"
    exit 1
    ;;
esac
