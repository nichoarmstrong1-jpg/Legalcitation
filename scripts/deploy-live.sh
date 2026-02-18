#!/bin/sh
set -eu

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

if [ "${1:-}" = "" ]; then
  echo "Usage: npm run deploy:live -- \"commit message\""
  echo "Optional: DEPLOY_TO_MAIN=1 npm run deploy:live -- \"commit message\""
  exit 1
fi

COMMIT_MESSAGE="$1"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "[FAIL] Not inside a git repository."
  exit 1
fi

if ! git remote get-url origin >/dev/null 2>&1; then
  echo "[FAIL] No 'origin' remote configured."
  exit 1
fi

current_branch="$(git branch --show-current || true)"
if [ -z "$current_branch" ]; then
  echo "[FAIL] Detached HEAD detected."
  echo "Create/switch to a branch before deploy, then rerun:"
  echo "  git switch -c fix/<short-name>"
  exit 1
fi

echo "Running ship readiness checks..."
sh scripts/ship-ready.sh

if [ -z "$(git status --porcelain)" ]; then
  echo "[OK] No file changes to commit."
else
  echo "Committing changes..."
  git add -A
  git commit -m "$COMMIT_MESSAGE"
fi

echo "Pushing current branch to origin/$current_branch..."
git push -u origin "$current_branch"

if [ "${DEPLOY_TO_MAIN:-0}" = "1" ]; then
  echo "DEPLOY_TO_MAIN=1 set. Pushing current HEAD to origin/main..."
  git push origin HEAD:main
  echo "[OK] Deploy push complete. Railway and Vercel should auto-deploy from main."
else
  if [ "$current_branch" = "main" ]; then
    echo "[OK] Deploy push complete from main."
  else
    echo "[OK] Branch push complete."
    echo "To deploy to production from this branch, rerun with DEPLOY_TO_MAIN=1."
  fi
fi
