# App Router Migration — Wave 6: Cleanup (Remove Legacy Pages Router + Packages)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Удалить весь legacy Pages Router после Waves 1-5: `pages/_app.tsx`, `_document.tsx`, `_error.js`, `404.tsx`, `[...pages].tsx`, `index.tsx`, перенести `pages/api/*` в `app/api/*/route.ts` (либо удалить если noop), удалить `i18n.js`, очистить `next.config.js` от `next-translate-plugin`, удалить deprecated npm packages (`next-translate`, `next-translate-plugin`, `next-cookies`, `next-seo`), удалить legacy view-components из `components_new/` (replaced by `*App.tsx` versions).

**Architecture:** Sequential phased deletion. Каждая фаза — отдельный commit с проверкой `bun run build` после. Wave 7 polish (later) обработает: catalog mapping fix, SmallCart hydration, ThreePizza restore, `[locale]` segment switch.

**Out of scope (Wave 7):**
- Switch `localePrefix` to `'as-needed'` with `[locale]` segment (restructures all `app/[city]/*` paths)
- Fix Wave 4/5 hydration crashes (cart/profile)
- Snap PO translations
- Remove `@ts-nocheck` from large ports

**Tech Stack:** Next.js 16.2.2, bun, git.

**Reference plans:** Wave 1-5.

---

## File Structure

### Modified

| Файл | Изменение |
|---|---|
| `next.config.js` | Удалить `nextTranslate` plugin wrapping |
| `package.json` | Удалить 4 deprecated dependencies |
| `bun.lockb` | Auto |

### Deleted

**Pages Router infrastructure (8 files):**
- `pages/_app.tsx`
- `pages/_document.tsx`
- `pages/_error.js`
- `pages/404.tsx`
- `pages/[...pages].tsx`
- `pages/index.tsx`
- `i18n.js`

**Pages API routes (10 files):** Will be migrated to `app/api/*/route.ts` in Phase B (or deleted if noop).

**Legacy view components in `components_new/` (~40 files):**
- All `*.tsx` files where corresponding `*App.tsx` exists
- Plus: `Header.tsx`, `MobileHeader.tsx`, `MobileBottomNav.tsx`, `MobileLayout.tsx` (old wrappers, no App version)
- Plus: `About copy.tsx`, `Delivery copy.tsx` (orphans)

**Legacy infrastructure:**
- `components/common/Layout/` (whole dir: Layout.tsx, NotFoundLayout.tsx, BonusModal.tsx, CityModal.tsx, Layout.module.css, index.ts)
- `lib/posthog.tsx` (Pages Router version — `posthog-app.tsx` stays)
- `framework/local/api/operations/get-all-pages.ts` and `get-page.ts` (dead CMS)
- `pages/[city]/index.module.css`, `pages/[city]/track/[id]/Track.module.css` (orphans)

### Untouched

- All `app/*` files (App Router)
- All `components_new/*App.tsx` files
- `lib/posthog-app.tsx`, `lib/data/*`
- `i18n/*`
- `proxy.ts`
- All `framework/local/*` except 2 mentioned dead operations

---

## Pre-flight

- [ ] **Step 1: Verify branch state**

```bash
cd /Users/macbookpro/development/next_frontend
git branch --show-current  # = migration/app-router
git status  # should be clean
git log --oneline -3
```

- [ ] **Step 2: Baseline build OK**

```bash
rm -rf .next/* 2>/dev/null; rm -rf .next
bun run build > /tmp/wave6-baseline.log 2>&1 && echo "OK" || (echo "FAIL"; tail -30 /tmp/wave6-baseline.log)
```

Expected: `OK`. Baseline includes legacy still working.

---

## Phase A: Delete obsolete Pages Router root files

### Task 1: Delete `pages/_app.tsx`, `_document.tsx`, `_error.js`, `404.tsx`, `index.tsx`, `i18n.js`

```bash
git rm pages/_app.tsx pages/_document.tsx pages/_error.js pages/404.tsx pages/index.tsx i18n.js
```

Build check (will fail if `next-translate-plugin` still wired — that's fixed in Phase D):
```bash
rm -rf .next/* 2>/dev/null; rm -rf .next
bun run build > /tmp/wave6-task1.log 2>&1
echo "EXIT_CODE=$?"
tail -20 /tmp/wave6-task1.log
```

If FAIL with `i18n.js not found` — `next-translate-plugin` still in next.config. **Don't fix yet** — proceed to Task 2 (delete catch-all) then Phase D (config cleanup).

Commit: `chore(cleanup): remove legacy pages root files (_app, _document, 404, index, i18n.js)`

### Task 2: Delete `pages/[...pages].tsx` (dead CMS catch-all)

```bash
git rm "pages/[...pages].tsx"
```

Commit: `chore(cleanup): remove dead pages/[...pages].tsx CMS catch-all`

---

## Phase B: Migrate pages/api/* to app/api/*/route.ts

The 10 legacy API routes are mostly `noopApi` placeholders that never worked (return undefined per Wave 1 fix). Realistic strategy: **delete them** rather than port. If any have actual logic, port to `route.ts`.

### Task 3: Inspect pages/api/* — identify real vs noop

```bash
for f in pages/api/cart.ts pages/api/checkout.ts pages/api/customer.ts pages/api/login.ts pages/api/logout.ts pages/api/signup.ts pages/api/wishlist.ts pages/api/catalog/products.ts; do
  echo "=== $f ==="
  cat "$f"
done
echo "=== pages/api/geo/index.js ==="
cat pages/api/geo/index.js
echo "=== pages/api/geocode.ts ==="
cat pages/api/geocode.ts
```

For each: if it's a 1-3 line `cartApi(commerce)`-style import → delete (noop). If it has real implementation (likely `geo`, `geocode`) → port to `app/api/<name>/route.ts`.

### Task 4: Port real API routes (geo, geocode if non-noop)

For each real API route, create `app/api/<name>/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  // ... port logic from pages/api version
  return NextResponse.json({ ... })
}
```

If GET is the only method, only export GET. Same for POST.

Preserve original logic exactly. Commit per route.

### Task 5: Delete all pages/api/*

```bash
git rm -r pages/api
```

Build check.

Commit: `chore(cleanup): remove legacy pages/api/* (noop placeholders / migrated to app/api)`

---

## Phase C: Delete pages/ directory entirely

### Task 6: Final pages/ cleanup

```bash
# Verify pages/ is empty (or only has CSS modules orphans)
find pages -type f
git rm -rf pages/
```

Commit: `chore(cleanup): remove pages/ directory (App Router migration complete)`

---

## Phase D: Clean next.config.js + remove deprecated packages

### Task 7: Clean next.config.js

Read current. Remove `nextTranslate` import + plugin wrapping. Final shape:

```javascript
const commerce = require('./commerce.config.json')
const {
  withCommerceConfig,
  getProviderName,
} = require('./framework/commerce/config')
const createNextIntlPlugin = require('next-intl/plugin')

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const provider = commerce.provider || getProviderName()
const isBC = provider === 'bigcommerce'
const isShopify = provider === 'shopify'
const isSwell = provider === 'swell'
const isVendure = provider === 'vendure'

const baseConfig = withCommerceConfig({
  commerce,
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_URL: process.env.API_URL,
  },
  rewrites() {
    return [
      (isBC || isShopify || isSwell || isVendure) && {
        source: '/checkout',
        destination: '/api/checkout',
      },
      isBC && {
        source: '/logout',
        destination: '/api/logout?redirect_to=/',
      },
      isVendure &&
        process.env.NEXT_PUBLIC_VENDURE_LOCAL_URL && {
          source: `${process.env.NEXT_PUBLIC_VENDURE_LOCAL_URL}/:path*`,
          destination: `${process.env.NEXT_PUBLIC_VENDURE_SHOP_API_URL}/:path*`,
        },
    ].filter(Boolean)
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'store.hq.fungeek.net' },
      { protocol: 'https', hostname: 'api.hq.fungeek.net' },
      { protocol: 'https', hostname: 'choparpizza.uz' },
      { protocol: 'https', hostname: 'api.choparpizza.uz' },
      { protocol: 'https', hostname: 'cdn.choparpizza.uz' },
    ],
  },
})

module.exports = withNextIntl(baseConfig)
```

Verify build:
```bash
rm -rf .next/* 2>/dev/null; rm -rf .next
bun run build > /tmp/wave6-task7.log 2>&1 && echo "OK" || (echo "FAIL"; tail -30 /tmp/wave6-task7.log)
```

Commit: `chore(next): remove next-translate-plugin wrapping (App Router only)`

### Task 8: Remove deprecated npm packages

```bash
bun remove next-translate next-translate-plugin next-cookies next-seo
```

Verify build:
```bash
rm -rf .next/* 2>/dev/null; rm -rf .next
bun run build > /tmp/wave6-task8.log 2>&1 && echo "OK" || (echo "FAIL"; tail -30 /tmp/wave6-task8.log)
```

If FAIL with import errors from legacy components_new/ files (`next-translate`/`next-cookies`/`next-seo`):
- These are dead orphans (Wave 6 Phase E will delete them)
- If a single still-active file imports them → delete that import & replace with inline RU literals OR delete the file if redundant

Commit: `chore: remove deprecated npm packages (next-translate, next-cookies, next-seo)`

---

## Phase E: Delete orphan legacy view-components

### Task 9: Delete legacy components with App ports

```bash
git rm \
  "components_new/Header.tsx" \
  "components_new/main/MainSlider.tsx" \
  "components_new/main/CategoriesMenu.tsx" \
  "components_new/main/MobileCategoriesMenu.tsx" \
  "components_new/main/ThreePizza.tsx" \
  "components_new/header/MobSetLocation.tsx" \
  "components_new/header/HeaderPhone.tsx" \
  "components_new/header/ChooseCityDropDown.tsx" \
  "components_new/header/LanguageDropDown.tsx" \
  "components_new/header/SignInButton.tsx" \
  "components_new/product/ProductItemNew.tsx" \
  "components_new/product/ProductOptionSelector.tsx" \
  "components_new/product/CreateYourPizza.tsx" \
  "components_new/product/CreateYourPizzaMobile.tsx" \
  "components_new/product/CreateYourPizzaCommon.tsx" \
  "components_new/common/SmallCart.tsx" \
  "components_new/common/SmallCartMobile.tsx" \
  "components_new/about/About.tsx" \
  "components_new/about/About copy.tsx" \
  "components_new/branch/Branch.tsx" \
  "components_new/contacts/Contacts.tsx" \
  "components_new/delivery/Delivery.tsx" \
  "components_new/delivery/Delivery copy.tsx" \
  "components_new/fran/Fran.tsx" \
  "components_new/news/NewsItem.tsx" \
  "components_new/news/NewsDetail.tsx" \
  "components_new/sale/SaleItem.tsx" \
  "components_new/order/OrderAccept.tsx" \
  "components_new/order/OrderTracking.tsx" \
  "components_new/order/Orders.tsx" \
  "components_new/order/MobileOrders.tsx" \
  "components_new/profile/UserData.tsx" \
  "components_new/profile/PersonalData.tsx" \
  "components_new/profile/Address.tsx" \
  "components_new/profile/Bonuses.tsx" \
  "components_new/profile/Orders.tsx" \
  "components_new/mobile/MobileProfileMenu.tsx"
```

Verify build:
```bash
rm -rf .next/* 2>/dev/null; rm -rf .next
bun run build > /tmp/wave6-task9.log 2>&1 && echo "OK" || (echo "FAIL"; tail -40 /tmp/wave6-task9.log)
```

If FAIL with import errors — some `*App.tsx` file may still import a deleted legacy. Identify, fix import (replace with App version), retry.

Commit: `chore(cleanup): remove ~37 legacy view-components (replaced by *App.tsx variants)`

### Task 10: Delete components/common/Layout/ + lib/posthog.tsx

```bash
git rm -r components/common/Layout
git rm lib/posthog.tsx
```

Verify build.

Commit: `chore(cleanup): remove legacy Layout dir + lib/posthog.tsx (App versions exist)`

### Task 11: Delete framework dead operations

```bash
git rm framework/local/api/operations/get-all-pages.ts framework/local/api/operations/get-page.ts
```

Search for references — they may be in `framework/local/api/operations/index.ts` or similar barrel:
```bash
grep -rn "get-all-pages\|get-page" framework/ 2>/dev/null
```

If found in a barrel — remove that line.

Verify build.

Commit: `chore(cleanup): remove dead CMS framework operations`

### Task 12: Delete orphan CSS modules

```bash
find components_new -name "*.module.css" -path "*Mobile*" 2>&1 | head -5
# Also: pages/[city]/index.module.css, Track.module.css if not deleted yet
git ls-files | grep "\.module\.css" | grep -v "App\|app/"
```

Delete orphan CSS modules that no `*App.tsx` imports.

Commit: `chore(cleanup): remove orphan CSS modules`

---

## Phase F: Final verification

### Task 13: Final build + DevTools MCP smoke

```bash
rm -rf .next/* 2>/dev/null; rm -rf .next
bun run build > /tmp/wave6-final.log 2>&1
echo "EXIT_CODE=$?"
grep "/[a-z]" /tmp/wave6-final.log | head -30  # route summary
```

Expected: `EXIT_CODE=0`. Route summary shows ONLY App Router routes (no `Pages Router` section).

### Task 14: Dev runtime smoke

```bash
bunx next dev --webpack -p 5757 > /tmp/wave6-dev.log 2>&1 &
echo $! > /tmp/wave6-dev.pid
sleep 25

for url in "/tashkent" "/tashkent/about" "/tashkent/news" "/tashkent/sale" "/tashkent/contacts" "/tashkent/delivery" "/tashkent/branch" "/tashkent/privacy"; do
  curl -s -o /dev/null -w "$url: HTTP %{http_code}\n" "http://localhost:5757$url"
done

kill $(cat /tmp/wave6-dev.pid) 2>/dev/null
sleep 2
```

Expected: `/tashkent` and all known stable App Router routes HTTP 200.

### Task 15: Final Verification

```bash
echo "=== pages/ tree (should be empty) ==="
find pages -type f 2>&1 || echo "pages/ does not exist"

echo "=== package.json deprecated check (should be empty) ==="
grep -E '"next-translate"|"next-cookies"|"next-seo"' package.json || echo "No deprecated packages"

echo "=== TS clean ==="
bunx tsc --noEmit 2>&1 | grep -E "^(app/|i18n/|lib/data/|lib/posthog-app|proxy\.ts|components_new/(seo|about|fran|delivery|privacy|branch|contacts|news|sale|cart|track|bonus|main|HeaderApp|FooterApp|product|common/Small|order|profile|mobile/MobileProfileMenu|header))" | head -10
echo "(empty above = our code clean)"

echo "=== Wave 6 commits ==="
git log --oneline | head -20

echo "=== Branch ==="
git status
```

Expected:
- `pages/` does not exist
- `next-translate`/`next-cookies`/`next-seo` not in package.json
- TS clean for our code
- ~12-15 commits Wave 6
- Branch clean

---

## Wave 6 Done. Что осталось:

- **Wave 7** — Polish:
  - Fix Wave 4 catalog `productsByCategory` mapping (currently grid empty)
  - Fix cart/profile hydration crashes (useCart ref undefined)
  - Restore SmallCart sidebar in LayoutWrapper
  - Restore ThreePizza in CityMainApp
  - Fix `_bonus` URL (rename to `bonus` or use route group)
  - Snap real PO translations from prod via DevTools MCP
  - Remove `@ts-nocheck` escapes from large ports
  - Switch `localePrefix` to `'as-needed'` with `[locale]` segment (restructures all paths)
  - Lighthouse audit, bundle analyzer, performance regression check

---

## Self-Review Checklist

- [ ] Each phase has its own commit(s)
- [ ] Build verified after each major deletion
- [ ] No `pages/` directory remains
- [ ] No deprecated npm packages in `package.json`
- [ ] `next.config.js` has only `withNextIntl` wrap (no `nextTranslate`)
- [ ] All `app/*` routes still work in dev
- [ ] No legacy components_new/<File>.tsx where <File>App.tsx exists

---

## Realistic expectations

This wave is **mostly deletions** — low complexity per task but high cumulative volume (~50+ files, 4 packages). Build may fail intermediately if something still imports a deleted symbol. Strategy: **fix forward, don't revert**.

Estimate: **8-12 commits**, ~30 minutes of subagent work + manual verification.
