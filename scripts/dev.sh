#!/usr/bin/env bash
set -euo pipefail

# Simple dev launcher that starts backend, admin and glasses client in background
# and waits. Adjust ports/commands if your projects use different scripts.

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT_DIR"

echo "Starting services from $ROOT_DIR"

pids=()

start_backend() {
  if [ -f backend/.env ] || [ -f backend/.env.example ]; then
    echo "Starting backend (uvicorn)"
    (cd backend && pip install --upgrade pip >/dev/null 2>&1 || true; pip install -r requirements.txt >/dev/null 2>&1 || true; uvicorn coatvision_core.app:app --reload --host 0.0.0.0 --port 8000) &
    pids+=("$!")
  else
    echo "Skipping backend: backend/.env not present. Run: cp backend/.env.example backend/.env"
  fi
}

start_admin() {
  if [ -f admin_portal/package.json ]; then
    echo "Starting admin_portal (npm run dev)"
    (cd admin_portal && npm ci >/dev/null 2>&1 || npm install >/dev/null 2>&1; npm run dev) &
    pids+=("$!")
  else
    echo "Skipping admin_portal: admin_portal/package.json not found"
  fi
}

start_glasses() {
  if [ -f glasses_client/package.json ]; then
    echo "Starting glasses_client (npm run dev)"
    (cd glasses_client && npm ci >/dev/null 2>&1 || npm install >/dev/null 2>&1; npm run dev) &
    pids+=("$!")
  else
    echo "Skipping glasses_client: glasses_client/package.json not found"
  fi
}

trap 'echo "Stopping..."; for pid in "${pids[@]:-}"; do kill "$pid" 2>/dev/null || true; done; exit' INT TERM EXIT

start_backend
start_admin
start_glasses

echo "All started. Press Ctrl+C to stop."
wait
