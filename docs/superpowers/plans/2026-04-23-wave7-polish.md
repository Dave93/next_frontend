# App Router Migration — Wave 7: Polish (Bug Fixes + UX Restoration)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Закрыть оставшиеся issues после Waves 1-6: восстановить cart/profile рендеринг (HTTP 500 → 200), починить `_bonus` 404 (Next folder convention), восстановить SmallCart sidebar в LayoutWrapper, восстановить ThreePizza баннер, починить catalog `productsByCategory` mapping (grid пустой), восстановить AddressSelection picker, удалить `@ts-nocheck` escapes из больших ports, snap PO translations с прода.

**Architecture:** Targeted fixes per issue. Каждый fix — отдельный commit. После каждого — verify через `bunx next dev` + curl.

**Tech Stack:** Next.js 16.2.2, React 18, `next-intl@4.9.1`, all existing infra from Waves 1-6.

**Reference plans:** Waves 1-6.

---

## Issue Inventory (from Wave 6 final state)

| # | Issue | Symptom | Wave |
|---|---|---|---|
| 1 | `Cannot read properties of undefined (reading 'slug')` | `/cart`, `/profile/*` HTTP 500 | 4-5 hydration |
| 2 | `_bonus` URL 404 | Next.js underscore-prefix folder convention treats it as private | 5 |
| 3 | Catalog grid пустой | `productsByCategory` mapping не находит matches | 4 |
| 4 | SmallCart disabled | `useRef.current undefined` hydration crash | 4 |
| 5 | ThreePizza disabled | падал на пустом `items` prop | 4 |
| 6 | AddressSelection stubbed | удалён в Wave 6 (next-translate orphan) | 6 |
| 7 | `@ts-nocheck` в 5+ файлах | hide TypeScript errors in large ports | 4-5 |
| 8 | PO translations пусты | `useExtracted` shows inline RU as fallback | 1+ |
| 9 | `react-toastify` `'render' not exported from react-dom` | React 18 incompat warning | external |
| 10 | `geoip-lite` stubbed | `.dat` files don't bundle | 6 |
| 11 | IP geo: replace stub | use Vercel `req.geo` headers / Cloudflare CF-IPCountry / API call | 6 |

---

## File Structure

### Modified

| Файл | Изменение |
|---|---|
| `app/[city]/layout.tsx`, `LayoutWrapper.tsx` | Wire SmallCart back, fix slug error |
| `components_new/main/CityMainApp.tsx` | Restore ThreePizza, fix products grouping |
| `components_new/cart/CartApp.tsx` | Fix hydration ref crash |
| `components_new/profile/UserDataApp.tsx` | Fix `activeCity?.slug` access |
| `proxy.ts` | Add `_bonus` rewrite to internal `bonus` directory (or rename folder) |
| `messages/{ru,uz,en}.po` | Populate from prod via DevTools MCP snap |
| `package.json` | Update `react-toastify` if compatible version |

### Created

| Файл | Назначение |
|---|---|
| `components_new/order/AddressSelectionApp.tsx` | Минимальный address picker (Wave 7 reimpl, без yandex-maps если возможно) |

### Renamed (or routed)

| From | To | Reason |
|---|---|---|
| `app/[city]/_bonus/` | `app/[city]/bonus/` | Next.js folder convention (underscore = private) |

---

## Pre-flight

- [ ] **Step 1: Branch state**

```bash
cd /Users/macbookpro/development/next_frontend
git branch --show-current  # = migration/app-router
git log --oneline -3
git status  # should be clean
```

- [ ] **Step 2: Build OK**

```bash
rm -rf .next/* 2>/dev/null; rm -rf .next
bun run build > /tmp/wave7-baseline.log 2>&1 && echo "OK" || (echo "FAIL"; tail -20 /tmp/wave7-baseline.log)
```

Expected: OK.

---

## Phase A: Critical Bug Fixes

### Task 1: Fix `_bonus` 404 — rename to `bonus`

Next.js treats folders starting with `_` as private (not routable). Legacy URL `/[city]/_bonus` is broken. Solution: rename folder + add proxy redirect from old URL to new.

- [ ] **Step 1: Rename app/[city]/_bonus → app/[city]/bonus**

```bash
git mv "app/[city]/_bonus" "app/[city]/bonus"
```

- [ ] **Step 2: Update proxy.ts to redirect `/_bonus` → `/bonus` (preserve old URL backward-compat)**

Add to proxy.ts before existing logic:

```typescript
// Legacy /_bonus URL → /bonus
const bonusMatch = request.nextUrl.pathname.match(
  /^\/(tashkent|samarkand|bukhara|namangan|fergana|andijan|qarshi|nukus|urgench|jizzakh|gulistan|termez|chirchiq|navoi)\/_bonus(\/.*)?$/
)
if (bonusMatch) {
  const newPath = request.nextUrl.pathname.replace('/_bonus', '/bonus')
  return NextResponse.redirect(new URL(newPath, request.url))
}
```

Also add to `config.matcher`: `'/(tashkent|samarkand|bukhara|namangan|fergana|andijan|qarshi|nukus|urgench|jizzakh|gulistan|termez|chirchiq|navoi)/_bonus/:path*'`

- [ ] **Step 3: Verify**

Build + dev:
```bash
rm -rf .next/* 2>/dev/null; rm -rf .next
bun run build > /tmp/wave7-task1.log 2>&1 && echo "OK"

bunx next dev --webpack -p 5757 > /tmp/wave7-dev.log 2>&1 &
sleep 25
curl -sI "http://localhost:5757/tashkent/bonus" | head -1
curl -sI "http://localhost:5757/tashkent/_bonus" | head -1  # should redirect to /tashkent/bonus
curl -sI "http://localhost:5757/tashkent/bonus/start" | head -1
```

Expected: `/tashkent/bonus` HTTP 200, `/tashkent/_bonus` HTTP 307/308 redirect.

Commit: `fix(bonus): rename app/[city]/_bonus → bonus + legacy redirect`

### Task 2: Fix `Cannot read properties of undefined (reading 'slug')` in cart/profile

The error comes from accessing `activeCity.slug` before `activeCity` is set in `useUI()`. Need defensive `?.slug`.

- [ ] **Step 1: Find all places**

```bash
grep -rn "activeCity\.slug\|activeCity\.id\|currentCity\.slug" components_new/profile/ components_new/cart/ components_new/order/ 2>/dev/null | grep -v "?\." | head -20
```

- [ ] **Step 2: Add `?.` defensive access**

For each match, replace `activeCity.slug` with `activeCity?.slug` (and similar for `.id`, `.name`). Also for `currentCity.slug`.

This will be a multi-file find/replace across the listed files. Use `sed`-style transformations carefully (only inside expressions, not in type annotations or assignments).

- [ ] **Step 3: Verify**

Build + dev test:
```bash
curl -s -o /dev/null -w "/cart: %{http_code}\n" http://localhost:5757/tashkent/cart
curl -s -o /dev/null -w "/profile: %{http_code}\n" http://localhost:5757/tashkent/profile
```

Expected: both HTTP 200.

Commit: `fix(profile,cart): add defensive optional chaining for activeCity access`

### Task 3: Fix catalog `productsByCategory` mapping (CityMainApp grid empty)

Issue from Wave 4: `productsByCategory` finds no matches because `prod.category_id` doesn't match `cat.id`. Inspect actual API response and adapt grouping.

- [ ] **Step 1: Inspect API response shape**

```bash
curl -s "https://api.choparpizza.uz/api/cms/website/menu?city_slug=tashkent" 2>&1 | python3 -c "import sys, json; d = json.load(sys.stdin); print('keys:', list(d.keys())[:5]); print(json.dumps(d, indent=2, ensure_ascii=False)[:1000])"
```

If API has different shape, find the products endpoint that legacy used. Check `commerce.getAllProducts()` flow:

```bash
grep -rn "category_id\|categoryId" framework/local/api/operations/get-all-products.ts framework/local/utils/fetch-products.ts 2>/dev/null | head -10
```

- [ ] **Step 2: Update CityMainApp grouping to match real shape**

Legacy code in deleted `pages/[city]/index.tsx` had a different mapping. Re-derive from products structure (might involve `prod.items[].variants[]` with `category` field, not flat `category_id`).

Replace `productsByCategory` logic with the correct algorithm.

- [ ] **Step 3: Verify**

```bash
curl -s "http://localhost:5757/tashkent" | grep -ocE 'productSection_'  # > 0
curl -s "http://localhost:5757/tashkent" | grep -ocE 'class=.bg-white.rounded-3xl'  # > 5 (product cards)
```

Commit: `fix(catalog): correct productsByCategory mapping (Wave 4 fix)`

---

## Phase B: Restore disabled UX

### Task 4: Restore SmallCart sidebar in LayoutWrapper

Wave 4 disabled SmallCartApp due to `useRef.current undefined` hydration error. Investigate root cause + restore.

- [ ] **Step 1: Inspect SmallCartApp ref usage**

```bash
grep -n "useRef\|\.current" components_new/common/SmallCartApp.tsx | head -20
```

Identify which ref initialization fails. Likely cause: `createRef()` outside component (legacy pattern), should be `useRef()` inside hooks.

- [ ] **Step 2: Fix ref initialization**

Convert `createRef()` patterns to `useRef()` and ensure `.current` access is conditional.

- [ ] **Step 3: Re-enable in LayoutWrapper**

Restore the `<SmallCartApp />` and `<SmallCartMobileApp />` renders inside `app/[city]/LayoutWrapper.tsx` (currently commented out / removed).

- [ ] **Step 4: Verify dev runtime — no hydration errors**

```bash
curl -s "http://localhost:5757/tashkent" | grep -ocE 'SmallCart\|cart-sidebar'
```

Verify in DevTools MCP that no console errors about `'current'`.

Commit: `fix(cart): restore SmallCart sidebar (useRef hydration fix)`

### Task 5: Restore ThreePizza banner

Disabled in Wave 4 due to crash on empty `items` prop. Pass real items.

- [ ] **Step 1: Identify what `items` ThreePizza expects**

Check legacy logic in deleted `pages/[city]/index.tsx` for `threeCategories` derivation:

```typescript
// Build threeCategories from products: variants/items with `threesome` flag
const threeCategories = (() => {
  let res = []
  for (const prod of products) {
    if (prod.items) {
      for (const item of prod.items) {
        if (item.variants?.length) {
          for (const variant of item.variants) {
            if (variant.threesome) res.push(variant)
          }
        } else if (item.threesome) {
          res.push(item)
        }
      }
    } else if (prod.variants?.length) {
      for (const variant of prod.variants) {
        if (variant.threesome) res.push(variant)
      }
    } else if (prod.threesome) {
      res.push(prod)
    }
  }
  return res
})()
```

- [ ] **Step 2: Add to CityMainApp + render ThreePizzaApp with items**

```typescript
// Inside CityMainApp:
const threeCategories = useMemo(() => { /* logic above */ }, [products])

// In JSX:
{threeCategories.length >= 3 && (
  <ThreePizzaApp items={threeCategories} channelName={channelName} />
)}
```

- [ ] **Step 3: Verify**

```bash
curl -s "http://localhost:5757/tashkent" | grep -ocE 'three-pizza\|class=.three'
```

Commit: `fix(catalog): restore ThreePizza banner with derived items`

### Task 6: Fix react-toastify React 18 incompat

Currently logs warning: `'render' is not exported from 'react-dom'`. Solutions:
- Update to `react-toastify@10+` (React 18 compat)
- Or replace with alternative (sonner, etc.)
- Or accept warning (cosmetic only)

- [ ] **Step 1: Try update**

```bash
bun add react-toastify@latest
```

- [ ] **Step 2: Verify build + import paths**

```bash
rm -rf .next; bun run build > /tmp/wave7-toastify.log 2>&1 && echo "OK"
```

If breaks (e.g. CSS path changed) — revert and accept warning.

Commit: `chore(deps): update react-toastify for React 18 compat` (or skip if breaks)

---

## Phase C: TypeScript hygiene

### Task 7: Remove `@ts-nocheck` from large ports

Files with @ts-nocheck escapes (Wave 4-5):
- `components_new/order/OrdersApp.tsx`
- `components_new/cart/CartApp.tsx`
- `components_new/track/TrackClientApp.tsx`
- `components_new/bonus/BonusStartApp.tsx`

For each: remove `@ts-nocheck` line, run `bunx tsc --noEmit | grep <file>`, fix individual TypeScript errors.

If error is genuinely unfixable (e.g., legacy untyped `Hashids` API) — replace with targeted `// @ts-expect-error` per line.

Commit per file: `chore(types): remove @ts-nocheck from <FileName>App.tsx`

---

## Phase D: PO translations from prod

### Task 8: Snap real translations from prod via DevTools MCP

For each major page (about, contacts, delivery, branch, privacy, fran, news, sale, cart, profile, bonus): open prod URL in 3 locales (RU/UZ/EN), extract user-facing text, populate `messages/{ru,uz,en}.po`.

- [ ] **Step 1: Build extraction script**

Iterate: open `https://choparpizza.uz/<route>` for ru/uz/en, snapshot, extract texts. Compare with inline RU in our `*App.tsx` files. For each match, add msgid/msgstr to PO.

- [ ] **Step 2: Populate PO files**

Format:
```
msgid "Inline RU text used in *App.tsx"
msgstr ""  # for ru.po: same as msgid
msgstr "Uzbek translation from prod"  # for uz.po
msgstr "English translation from prod"  # for en.po
```

- [ ] **Step 3: Verify**

`useExtracted('Russian text')` in ru locale shows Russian, in uz shows Uzbek, in en shows English. Test by manually setting `NEXT_LOCALE` cookie and reloading page.

Commit: `feat(i18n): populate PO files with prod translations (RU/UZ/EN)`

---

## Phase E: Reimplement AddressSelection

### Task 9: AddressSelection picker for App Router

Wave 6 deleted legacy AddressSelection (next-translate orphan). Cart/checkout currently has no address picker.

Scope decision: **Minimal** — just a dropdown of saved addresses + button "Add new address" that opens a modal. Full LocationTabs (Yandex Map picker) — separate sub-task.

- [ ] **Step 1: Write minimal AddressSelectionApp**

Create `components_new/order/AddressSelectionApp.tsx` and `AddressSelectionMobileApp.tsx` with minimal API matching the props that `OrdersApp.tsx` passes:

```typescript
type Props = {
  register: any
  setValue: any
  locationData: any
  setLocationData: any
  cities: any[]
  activeCity: any
  setActiveCity: any
  addressList: any[]
  addressId?: number
  onSelectAddress: (addr: any) => void
  onAddNewAddress: () => void
  yandexGeoKey?: string
  configData?: any
  tabIndex?: number
  onChangeTab?: (i: number) => void
  searchTerminal?: any
  downshiftRef?: any
  mapRef?: any
}
```

Render: simple list of `addressList` with click handler `onSelectAddress`, plus "Добавить новый адрес" button calling `onAddNewAddress`.

- [ ] **Step 2: Wire into OrdersApp**

Replace stub `const AddressSelection = (_props: any) => null` with real import.

Commit: `feat(order): reimplement AddressSelection (minimal — list + add button)`

---

## Phase F: Final Verification

### Task 10: Full smoke test

```bash
bunx next dev --webpack -p 5757 > /tmp/wave7-final.log 2>&1 &
sleep 25

for url in "/tashkent" "/tashkent/about" "/tashkent/about/fran" "/tashkent/contacts" \
           "/tashkent/delivery" "/tashkent/branch" "/tashkent/privacy" "/tashkent/news" \
           "/tashkent/sale" "/tashkent/cart" "/tashkent/order" "/tashkent/order/success" \
           "/tashkent/profile" "/tashkent/profile/account" "/tashkent/profile/address" \
           "/tashkent/profile/orders" "/tashkent/bonus" "/tashkent/bonus/start" \
           "/tashkent/track/123" "/tashkent/product/1"; do
  curl -s -o /dev/null -w "$url: %{http_code}\n" "http://localhost:5757$url"
done
```

Expected: all HTTP 200 (or 404 for missing data like product/1 if id doesn't exist).

### Task 11: DevTools MCP visual diff (3 random routes)

Compare local vs prod for `/tashkent`, `/tashkent/about`, `/tashkent/cart`. Document any persistent regressions.

### Task 12: Production build + Lighthouse

```bash
rm -rf .next; bun run build > /tmp/wave7-prod.log 2>&1 && echo "OK"
```

Optional: `bun run analyze` for bundle comparison.

### Task 13: Final Verification

DoD:
- ✅ Build OK
- ✅ All known routes HTTP 200
- ✅ No `@ts-nocheck` in new files
- ✅ PO files populated
- ✅ SmallCart, ThreePizza, AddressSelection restored

---

## Wave 7 Done. Migration Complete.

After Wave 7:
- All migration phases (Wave 1-7) completed
- Pure App Router with full UX restoration
- Branch ready for merge to main as final PR

Next steps:
- `git checkout main && git merge --no-ff migration/app-router`
- Bundle analyzer + Lighthouse comparison vs prod baseline
- Production smoke test on staging
- DNS cutover

---

## Self-Review Checklist

- [ ] Every fix has a commit and verification command
- [ ] All HTTP 500 routes from Wave 6 baseline are now HTTP 200
- [ ] `_bonus` URL works (via redirect) AND `bonus` URL works
- [ ] No `@ts-nocheck` in App Router files
- [ ] DevTools MCP confirms visual paritypage with prod for at least 3 routes
- [ ] Production build OK

---

## Realistic expectations

This wave fixes accumulated debt from Waves 4-5 ports + Wave 6 collateral damage. Each task is targeted (1-3 files per fix). Estimate: **8-12 commits**, ~1-2 hours of work.

Some tasks (PO snap, AddressSelection reimpl) are larger and may produce multiple sub-commits.
