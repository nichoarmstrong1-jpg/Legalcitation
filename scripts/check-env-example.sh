#!/bin/sh
set -eu

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$REPO_ROOT/.env.example"

if [ ! -f "$ENV_FILE" ]; then
  echo "[FAIL] Missing .env.example"
  exit 1
fi

required_keys='
ANTHROPIC_API_KEY
DATABASE_URL
REDIS_URL
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
JWT_SECRET
APPLE_CLIENT_ID
APPLE_TEAM_ID
APPLE_KEY_ID
APPLE_PRIVATE_KEY
MICROSOFT_CLIENT_ID
MICROSOFT_CLIENT_SECRET
S3_BUCKET
S3_REGION
S3_ENDPOINT
S3_ACCESS_KEY_ID
S3_SECRET_ACCESS_KEY
DATABASE_CA_CERT
PORT
CORS_ORIGIN
CORS_ORIGIN_PATTERNS
FRONTEND_URL
NODE_ENV
DB_POOL_MAX
DB_POOL_IDLE_TIMEOUT
DB_POOL_CONNECTION_TIMEOUT
VITE_API_URL
VITE_GOOGLE_CLIENT_ID
VITE_APPLE_CLIENT_ID
VITE_MICROSOFT_CLIENT_ID
'

missing_keys=""

for key in $required_keys; do
  if ! awk -F= -v key="$key" '
    $0 ~ /^[[:space:]]*#/ { next }
    $1 == key { found=1 }
    END { exit(found ? 0 : 1) }
  ' "$ENV_FILE"; then
    missing_keys="$missing_keys $key"
  fi
done

if [ -n "$missing_keys" ]; then
  echo "[FAIL] .env.example is missing required keys:$missing_keys"
  exit 1
fi

echo "[OK] .env.example contains all required keys."
