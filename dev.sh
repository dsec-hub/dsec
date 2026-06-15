#!/usr/bin/env bash
# Run all 3 DSEC services locally.
# dsec-website  → http://localhost:3000
# dsec-app      → http://localhost:3001
# dsec-api      → http://localhost:8000

ROOT="$(cd "$(dirname "$0")" && pwd)"

PIDS=()

cleanup() {
  echo ""
  echo "Shutting down..."
  for pid in "${PIDS[@]}"; do
    kill -- -"$pid" 2>/dev/null || kill "$pid" 2>/dev/null
  done
  wait "${PIDS[@]}" 2>/dev/null
  echo "All services stopped."
  exit 0
}
trap cleanup INT TERM

# --- dsec-api (FastAPI) ---
echo "[dsec-api] Starting on http://localhost:8000 ..."
(
  cd "$ROOT/dsec-api"
  if [ ! -d ".venv" ]; then
    echo "[dsec-api] Creating virtual environment..."
    python3 -m venv .venv
    .venv/bin/pip install -r requirements.txt -q
  fi
  .venv/bin/uvicorn app.main:app --reload --port 8000
) &
PIDS+=($!)

# --- dsec-website (Next.js) ---
echo "[dsec-website] Starting on http://localhost:3000 ..."
(
  cd "$ROOT/dsec-website"
  [ ! -d "node_modules" ] && npm install -q
  npm run dev -- --port 3000
) &
PIDS+=($!)

# --- dsec-app (Next.js) ---
echo "[dsec-app] Starting on http://localhost:3001 ..."
(
  cd "$ROOT/dsec-app"
  [ ! -d "node_modules" ] && npm install -q
  npm run dev -- --port 3001
) &
PIDS+=($!)

echo ""
echo "All services starting. Logs are interleaved below."
echo "  dsec-website  → http://localhost:3000"
echo "  dsec-app      → http://localhost:3001"
echo "  dsec-api      → http://localhost:8000"
echo "Press Ctrl+C to stop all."
echo ""

wait
