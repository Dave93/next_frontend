#!/usr/bin/env bash
#
# Production deploy script for choparpizza.uz frontend.
# Run on the server:  cd /home/davr/chopar/next_frontend && ./deploy.sh
#
# Why this script exists — three quirks of our setup:
#   1. Local edits often appear in .next/ between builds → reset before pull.
#   2. Next.js standalone output does NOT include public/, .next/static/,
#      or messages/*.po — we copy them in after build.
#   3. PM2 runs .next/standalone/server.js, so files must land there before reload.

set -euo pipefail

# ─── Configuration ──────────────────────────────────────────────────────────
PROJECT_DIR="/home/davr/chopar/next_frontend"
PM2_APP="chopar"
BRANCH="${1:-main}"
HEALTH_URLS=(
  "https://choparpizza.uz/"
  "https://choparpizza.uz/tashkent/news"
  "https://choparpizza.uz/_next/image?url=%2FcreateYourPizza.png&w=640&q=75"
)

# ─── Colors ─────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
log()  { echo -e "${CYAN}[deploy]${NC} $*"; }
ok()   { echo -e "${GREEN}[  ok  ]${NC} $*"; }
warn() { echo -e "${YELLOW}[ warn ]${NC} $*"; }
err()  { echo -e "${RED}[error ]${NC} $*" >&2; }

cd "$PROJECT_DIR" || { err "project dir not found: $PROJECT_DIR"; exit 1; }

# ─── Toolchain: node 20 + bun ───────────────────────────────────────────────
export NVM_DIR="${NVM_DIR:-/root/.nvm}"
# shellcheck disable=SC1091
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use 20 >/dev/null 2>&1 || warn "nvm use 20 failed (continuing with $(node -v 2>/dev/null || echo 'no node'))"
ok "Node $(node -v)"

BUN="${BUN:-/root/.bun/bin/bun}"
[ -x "$BUN" ] || BUN="$(command -v bun || true)"
[ -n "$BUN" ] || { err "bun not found"; exit 1; }

# ─── Step 1: Pull latest code ───────────────────────────────────────────────
log "Step 1/5: Pulling latest code (branch: ${BRANCH})"
echo "  Current commit: $(git rev-parse --short HEAD)"
# Builds modify tracked files (next-env.d.ts, .po files, etc.) → discard before pull.
git checkout .
git fetch origin
git checkout "$BRANCH"
git pull origin "$BRANCH"
echo "  Updated to:     $(git rev-parse --short HEAD)"
ok "Code updated"

# ─── Step 2: Install dependencies ───────────────────────────────────────────
log "Step 2/5: Installing dependencies"
"$BUN" install --frozen-lockfile 2>/dev/null || "$BUN" install
ok "Dependencies installed"

# ─── Step 3: Build (clean) ──────────────────────────────────────────────────
log "Step 3/5: Building Next.js (standalone output)"
rm -rf .next
"$BUN" run build

[ -d ".next/standalone" ] || { err "standalone build missing — check next.config.ts has output: 'standalone'"; exit 1; }

# ─── Step 4: Backfill files Next.js standalone leaves out ───────────────────
# These three are NOT copied by `next build` and the server crashes/404s without them.
log "Step 4/5: Copying public/, .next/static/, messages/ into .next/standalone/"
cp -r public       .next/standalone/        || warn "no public/ to copy"
cp -r .next/static .next/standalone/.next/  || warn "no .next/static to copy"
cp -r messages     .next/standalone/        || warn "no messages/ to copy"

# Sanity checks — fail fast if a critical file is missing.
[ -f .next/standalone/public/createYourPizza.png ] || { err "standalone/public missing after copy"; exit 1; }
[ -d .next/standalone/.next/static ]               || { err "standalone/.next/static missing after copy"; exit 1; }
[ -f .next/standalone/messages/ru.po ]             || warn "standalone/messages/ru.po missing — i18n may break"

# Pre-compress static assets so nginx gzip_static can serve them without re-gzipping per request.
log "Pre-compressing static assets"
find .next/standalone/.next/static -type f \( -name '*.js' -o -name '*.css' -o -name '*.svg' \) -print0 \
  | xargs -0 -r -n1 gzip -9 -k -f
GZIP_COUNT=$(find .next/standalone/.next/static -name '*.gz' | wc -l)
ok "Standalone ready (${GZIP_COUNT} files pre-compressed)"

# ─── Step 5: Reload PM2 ─────────────────────────────────────────────────────
log "Step 5/5: Reloading PM2 app: ${PM2_APP}"
mkdir -p logs
if pm2 describe "$PM2_APP" >/dev/null 2>&1; then
  pm2 reload "$PM2_APP" --update-env
else
  err "pm2 app '$PM2_APP' is not registered — start it manually first with the correct script path"
  err "  expected: $PROJECT_DIR/.next/standalone/server.js"
  exit 1
fi
pm2 save >/dev/null
ok "PM2 reloaded"

# ─── Health checks ──────────────────────────────────────────────────────────
sleep 3
log "Health checks"
fail_count=0
for url in "${HEALTH_URLS[@]}"; do
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$url" || echo "000")
  if [[ "$code" =~ ^(200|301|302|304|307)$ ]]; then
    echo -e "  ${GREEN}✓${NC} $code  $url"
  else
    echo -e "  ${RED}✗${NC} $code  $url"
    fail_count=$((fail_count + 1))
  fi
done

# Surface fresh sharp / manifest / standalone-related errors from pm2 logs.
recent_errors=$(pm2 logs "$PM2_APP" --lines 50 --nostream 2>&1 | tail -50 \
  | grep -iE 'sharp\._isUsingX64V2|client reference manifest|ENOENT.*standalone|⨯ Error' || true)
if [ -n "$recent_errors" ]; then
  warn "Recent errors in pm2 logs:"
  echo "$recent_errors" | sed 's/^/    /'
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
if [ "$fail_count" -gt 0 ]; then
  echo -e "${RED}  Deploy finished with ${fail_count} failed health check(s)${NC}"
  echo -e "${RED}  Investigate: pm2 logs ${PM2_APP} --lines 100${NC}"
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  exit 1
fi
echo -e "${GREEN}  Deployment complete${NC}"
echo -e "${GREEN}  Branch:  ${BRANCH}${NC}"
echo -e "${GREEN}  Commit:  $(git rev-parse --short HEAD)${NC}"
echo -e "${GREEN}  URL:     https://choparpizza.uz${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
