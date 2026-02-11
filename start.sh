#!/bin/bash
# LegalCitation — Start Development Servers
# Usage: ./start.sh
#
# Optional: Set ANTHROPIC_API_KEY for Claude-powered case verification
#   export ANTHROPIC_API_KEY="sk-ant-..."
#   ./start.sh

set -e

PROJECT_DIR="/Users/nichoarmstrong/bluebook-ai"
export PATH="$HOME/local/node/bin:/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin:$PATH"

# Load .env file if it exists
if [ -f "$PROJECT_DIR/.env" ]; then
  set -a
  source "$PROJECT_DIR/.env"
  set +a
fi

echo ""
echo "  ⚖️  LegalCitation — Starting Development Servers"
echo "  ─────────────────────────────────────────────"
echo ""

# Check Node.js is available
if ! command -v node &> /dev/null; then
  echo "  ✗ Node.js not found. Check PATH includes ~/local/node/bin"
  exit 1
fi
echo "  Node.js: $(node --version)"

# Check project directory exists
if [ ! -d "$PROJECT_DIR/node_modules" ]; then
  echo "  ✗ node_modules not found. Run: cd $PROJECT_DIR && npm install"
  exit 1
fi

# Kill any existing servers on these ports
kill $(lsof -ti:3001) 2>/dev/null || true
kill $(lsof -ti:5173) 2>/dev/null || true
sleep 1

# Trap Ctrl+C to kill both servers
cleanup() {
  echo ""
  echo "  Shutting down servers..."
  kill $API_PID 2>/dev/null || true
  kill $WEB_PID 2>/dev/null || true
  exit 0
}
trap cleanup INT TERM

# Check for ANTHROPIC_API_KEY
if [ -n "$ANTHROPIC_API_KEY" ]; then
  echo "  ✓ ANTHROPIC_API_KEY is set (Claude verification enabled)"
else
  echo "  ⚠ ANTHROPIC_API_KEY not set (running in format-only mode)"
  echo "    To enable Claude verification: export ANTHROPIC_API_KEY=\"sk-ant-...\""
fi
echo ""

# Start API server (from monorepo root)
echo "  [1/2] Starting API server on port 3001..."
cd "$PROJECT_DIR"
node node_modules/.bin/tsx apps/api/src/server.ts &
API_PID=$!
sleep 2

# Verify API is running
if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
  echo "  ✓ API server running at http://localhost:3001"
else
  echo "  ✗ API server failed to start (check terminal for errors)"
  kill $API_PID 2>/dev/null || true
  exit 1
fi

# Start Vite frontend (MUST run from apps/web/ for Tailwind CSS to work)
echo "  [2/2] Starting frontend on port 5173..."
cd "$PROJECT_DIR/apps/web"
"$PROJECT_DIR/node_modules/.bin/vite" --port 5173 &
WEB_PID=$!
sleep 3

# Verify frontend is running
if curl -s http://localhost:5173/ > /dev/null 2>&1; then
  echo "  ✓ Frontend running at http://localhost:5173"
else
  echo "  ✗ Frontend failed to start"
  kill $API_PID 2>/dev/null || true
  kill $WEB_PID 2>/dev/null || true
  exit 1
fi

echo ""
echo "  ────────────────────────────────────────────────"
echo "  ✓ LegalCitation is running!"
echo ""
echo "  Open in browser:  http://localhost:5173"
echo ""
echo "  API server:       http://localhost:3001  (PID: $API_PID)"
echo "  Frontend:         http://localhost:5173  (PID: $WEB_PID)"
echo ""
echo "  Press Ctrl+C to stop both servers"
echo "  ────────────────────────────────────────────────"
echo ""

# Wait for either process to exit
wait
