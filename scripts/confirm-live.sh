#!/bin/sh
set -eu

# Override defaults if your production URLs differ:
# LIVE_WEB_URL="https://your-web-url" LIVE_API_HEALTH_URL="https://your-api-url/api/health" sh scripts/confirm-live.sh
LIVE_WEB_URL="${LIVE_WEB_URL:-https://legalcitation.vercel.app}"
LIVE_API_HEALTH_URL="${LIVE_API_HEALTH_URL:-https://legalcitationapi-production-0fbb.up.railway.app/api/health}"
MAX_ATTEMPTS="${LIVE_CHECK_ATTEMPTS:-30}"
SLEEP_SECONDS="${LIVE_CHECK_INTERVAL_SECONDS:-6}"

attempt=1
while [ "$attempt" -le "$MAX_ATTEMPTS" ]; do
  api_ok=0
  web_ok=0

  api_body="$(curl -fsS "$LIVE_API_HEALTH_URL" || true)"
  case "$api_body" in
    *'"status":"ok"'*) api_ok=1 ;;
  esac

  if curl -fsSI "$LIVE_WEB_URL" >/dev/null 2>&1; then
    web_ok=1
  fi

  if [ "$api_ok" -eq 1 ] && [ "$web_ok" -eq 1 ]; then
    echo "✅ Live verification passed: web + API are reachable."
    echo "✅ Everything is live and deployed."
    exit 0
  fi

  echo "Waiting for live deploy... attempt $attempt/$MAX_ATTEMPTS"
  sleep "$SLEEP_SECONDS"
  attempt=$((attempt + 1))
done

echo "❌ Could not confirm live deployment in time."
echo "Web URL: $LIVE_WEB_URL"
echo "API health URL: $LIVE_API_HEALTH_URL"
exit 1
