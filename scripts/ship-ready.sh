#!/bin/sh
set -eu

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

print_ok() {
  echo "[OK] $1"
}

print_warn() {
  echo "[WARN] $1"
}

print_fail() {
  echo "[FAIL] $1"
}

require_file() {
  if [ -f "$1" ]; then
    print_ok "Found $1"
  else
    print_fail "Missing required file: $1"
    exit 1
  fi
}

run_quality_gates_local() {
  npm ci
  npm run typecheck
  npm test
  npm run build
}

run_quality_gates_docker() {
  docker run --rm -v "$REPO_ROOT":/app -w /app node:22-alpine sh -lc \
    "npm ci && npm run typecheck && npm test && npm run build"
}

echo "=== Ship Readiness Check ==="

if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  print_ok "Inside git repository"
else
  print_fail "Not inside a git repository"
  exit 1
fi

current_branch="$(git branch --show-current || true)"
if [ -z "$current_branch" ]; then
  print_fail "Detached HEAD detected. Switch to a branch before shipping."
  exit 1
fi
print_ok "Current branch: $current_branch"

if git remote get-url origin >/dev/null 2>&1; then
  print_ok "Git remote 'origin' is configured"
else
  print_fail "Git remote 'origin' is not configured"
  exit 1
fi

require_file ".github/workflows/ci.yml"
require_file "railway.toml"
require_file "apps/web/vercel.json"
require_file ".env.example"
sh scripts/check-env-example.sh

echo "=== Quality Gates ==="
if command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1; then
  print_ok "Using local Node/npm"
  run_quality_gates_local
else
  print_warn "Local Node/npm not found, using Docker Node 22 fallback"
  if command -v docker >/dev/null 2>&1; then
    run_quality_gates_docker
  else
    print_fail "Docker is required when local Node/npm is unavailable"
    exit 1
  fi
fi
print_ok "Typecheck, tests, and build passed"

echo "=== Runtime Connectivity ==="
if curl -fsS "http://localhost:3001/api/health" >/dev/null 2>&1; then
  print_ok "API health endpoint is reachable on :3001"
else
  print_warn "API health endpoint not reachable on :3001"
fi

if curl -fsS "http://localhost:5173" >/dev/null 2>&1; then
  print_ok "Web app is reachable on :5173"
else
  print_warn "Web app not reachable on :5173"
fi

if curl -fsS "http://localhost:5173/api/health" >/dev/null 2>&1; then
  print_ok "Web -> API proxy connectivity works"
else
  print_warn "Web -> API proxy connectivity is not verified"
fi

echo "=== Deploy Wiring Checklist ==="
echo "- Railway: confirm API service is connected to GitHub main with auto-deploy enabled."
echo "- Vercel: confirm web project is connected to GitHub main with auto-deploy enabled."
echo "- Ensure Railway/Vercel environment variables are set from .env.example."
echo ""
echo "Ship readiness check complete."
