#!/bin/sh
set -eu

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

if [ "${1:-}" = "" ]; then
  echo "Usage: npm run deploy:live -- \"commit message\""
  exit 1
fi

COMMIT_MESSAGE="$1"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "[FAIL] Not inside a git repository."
  exit 1
fi

echo "Running ship readiness checks..."
npm run ship:ready

if [ -z "$(git status --porcelain)" ]; then
  echo "[OK] No file changes to commit."
else
  echo "Committing changes..."
  git add -A
  git commit -m "$COMMIT_MESSAGE"
fi

echo "Pushing current HEAD to origin/main..."
git push origin HEAD:main

echo "[OK] Deploy push complete. Railway and Vercel should auto-deploy from main."
