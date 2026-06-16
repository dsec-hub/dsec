#!/usr/bin/env bash
# Run all DSEC services locally.
# dsec-website  → http://localhost:3000   (public site)
# dsec-app      → http://localhost:3001   (member portal · app.dsec.club)
# dsec-hub      → http://localhost:3002   (committee dashboard · hub.dsec.club)
# dsec-api      → http://localhost:8000   (FastAPI backend)

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

# --- dsec-website (Next.js · public site) ---
echo "[dsec-website] Starting on http://localhost:3000 ..."
(
  cd "$ROOT/dsec-website"
  [ ! -d "node_modules" ] && npm install -q
  npm run dev -- --port 3000
) &
PIDS+=($!)

# --- dsec-app (Next.js · member portal) ---
echo "[dsec-app] Starting on http://localhost:3001 ..."
(
  cd "$ROOT/dsec-app"
  [ ! -d "node_modules" ] && npm install -q
  npm run dev -- --port 3001
) &
PIDS+=($!)

# --- dsec-hub (Next.js · committee dashboard) ---
echo "[dsec-hub] Starting on http://localhost:3002 ..."
(
  cd "$ROOT/dsec-hub"
  [ ! -d "node_modules" ] && npm install -q
  npm run dev -- --port 3002
) &
PIDS+=($!)

echo ""
echo "All services starting. Logs are interleaved below."
echo "  dsec-website  → http://localhost:3000   (public site)"
echo "  dsec-app      → http://localhost:3001   (member portal)"
echo "  dsec-hub      → http://localhost:3002   (committee dashboard)"
echo "  dsec-api      → http://localhost:8000   (API)"
echo "Press Ctrl+C to stop all."
echo ""

wait
