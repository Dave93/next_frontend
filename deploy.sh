#!/usr/bin/env bash
set -euo pipefail

# ─── Configuration ────────────────────────────────────────────────────────────
PROJECT_DIR="/home/davr/chopar/next_frontend"
PM2_APP="chopar"
BRANCH="${1:-main}"

# ─── Colors ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log()  { echo -e "${CYAN}[deploy]${NC} $1"; }
ok()   { echo -e "${GREEN}[  ok  ]${NC} $1"; }
warn() { echo -e "${YELLOW}[ warn ]${NC} $1"; }
err()  { echo -e "${RED}[error ]${NC} $1" >&2; }

cd "$PROJECT_DIR"

# ─── Node version ─────────────────────────────────────────────────────────────
NODE_BIN="/root/.nvm/versions/node/v20.20.2/bin"
export PATH="$NODE_BIN:$PATH"
ok "Node $(node -v) active"

# ─── Step 1: Pull latest code ────────────────────────────────────────────────
log "Step 1/5: Pulling latest code (branch: ${BRANCH})..."
echo "  Current commit: $(git rev-parse --short HEAD)"
git fetch origin
git checkout "$BRANCH"
git pull origin "$BRANCH"
echo "  Updated to:     $(git rev-parse --short HEAD)"
ok "Code updated"

# ─── Step 2: Install dependencies ────────────────────────────────────────────
log "Step 2/5: Installing dependencies..."
if command -v bun &>/dev/null; then
  bun install --frozen-lockfile 2>/dev/null || bun install
else
  npm install --legacy-peer-deps
fi
ok "Dependencies installed"

# ─── Step 3: Build ────────────────────────────────────────────────────────────
log "Step 3/5: Building Next.js (standalone output)..."

rm -rf .next

if command -v bun &>/dev/null; then
  bun run build
else
  npm run build
fi

# standalone requires static assets and public to be copied manually
if [ ! -d ".next/standalone" ]; then
  err "Standalone build not found! Check that next.config.js has output: 'standalone'"
  exit 1
fi
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public 2>/dev/null || true

# Pre-compress static assets for nginx gzip_static
log "Pre-compressing static assets..."
find .next/static -type f \( -name '*.js' -o -name '*.css' -o -name '*.svg' \) | while read f; do
  gzip -9 -k -f "$f"
done
GZIP_COUNT=$(find .next/static -name '*.gz' | wc -l)
ok "Standalone build ready ($GZIP_COUNT files pre-compressed)"

# ─── Step 4: Restart PM2 ─────────────────────────────────────────────────────
log "Step 4/5: Restarting PM2 (standalone server.js)..."
mkdir -p logs

if pm2 describe "$PM2_APP" &>/dev/null; then
  pm2 reload ecosystem.config.js
else
  pm2 delete "$PM2_APP" 2>/dev/null || true
  pm2 start ecosystem.config.js
fi
pm2 save
ok "PM2 restarted"

# ─── Step 5: Health check ────────────────────────────────────────────────────
log "Step 5/5: Health check..."
sleep 5

HEALTH_STATUS=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:5656/ --max-time 10 || echo "000")

if [ "$HEALTH_STATUS" = "200" ] || [ "$HEALTH_STATUS" = "301" ] || [ "$HEALTH_STATUS" = "302" ] || [ "$HEALTH_STATUS" = "307" ]; then
  ok "Health check passed (HTTP $HEALTH_STATUS)"
else
  warn "Health check returned HTTP $HEALTH_STATUS — check: pm2 logs $PM2_APP --lines 50"
fi

# ─── Done ─────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Deployment complete!${NC}"
echo -e "${GREEN}  Branch:  ${BRANCH}${NC}"
echo -e "${GREEN}  Commit:  $(git rev-parse --short HEAD)${NC}"
echo -e "${GREEN}  URL:     https://choparpizza.uz${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
