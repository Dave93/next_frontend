# App Router Migration — Wave 4: Catalog + Product + Cart UI (Big Bang)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Мигрировать каталог (`/[city]` главная) и продуктовую страницу (`/[city]/product/[id]`) **с полным интерактивным функционалом** — categories navigation, product cards с add-to-cart, modifiers, half-and-half pizza builder, mini-cart sidebar. Big Bang: все компоненты порт'ятся одной волной с минимальными модификациями (swap `useRouter` → `useLocale`/`useExtracted`, добавление `'use client'`).

**Architecture / Strategy: PORT, NOT REWRITE.** Каждый legacy компонент копируется в новый файл с суффиксом `App` (например, `ProductItemNew.tsx` → `ProductItemNewApp.tsx`). Внутри компонента:
1. Добавляется `'use client'` (все интерактивные).
2. `useRouter` from `next/router` → удаляется. Если использовался `router.locale` → `useLocale()` from `next-intl`. Если `router.push` → `useRouter` from `@/i18n/navigation` (или относительно).
3. `useTranslation` from `next-translate` → `useExtracted()` from `next-intl`. Каждый `tr('key')` → `t('Inline RU text')` (snap'ятся с прода через DevTools MCP в Wave 7 polish).
4. Все остальное (axios, useCart, useUI, useState, useEffect, Hashids, Image, Link) — **остается как есть**.
5. `useCart from '@framework/cart'` оставляется — это framework хук работающий с SWR, независимый от Pages/App Router.
6. Imports из `next/link` остаются для App Router (next-intl Link только для localized routes; внутренние links на /[city]/product/[id] могут использовать `next/link`).

**Out of scope:** Wave 5 (cart full page, checkout, profile, orders, tracking, bonus). Wave 6 cleanup.

**Tech Stack:** Next.js 16.2.2, React 18, `next-intl@4.9.1` (`useExtracted` only), `@framework/cart` (SWR-based), `axios`, `Hashids`, `react-toastify`, `@headlessui/react`, `@egjs/react-flicking`, `next/image`, `next/link`, `currency.js`, `luxon`.

**Reference plans:** Wave 1-3.

---

## File Structure

### Created (15+ files)

| Файл | Тип | Объём | Стратегия |
|---|---|---|---|
| `lib/data/products.ts` | server fetcher | ~50 строк | новый: `fetchProductsBySite`, `fetchProductById` через `commerce.getAllProducts`/etc with `unstable_cache` |
| `lib/data/sliders.ts` | server fetcher | ~30 строк | новый: `fetchSliders(locale)` |
| `components_new/main/MainSliderApp.tsx` | client | port 157→~150 | port MainSlider.tsx, swap useRouter → useLocale |
| `components_new/main/CategoriesMenuApp.tsx` | client | port 87→~80 | port CategoriesMenu.tsx, swap useRouter → useLocale, useEffect scroll listener сохраняется |
| `components_new/main/ThreePizzaApp.tsx` | client | port 317→~310 | port ThreePizza.tsx |
| `components_new/main/MobileCategoriesMenuApp.tsx` | client | port 87→~80 | port MobileCategoriesMenu.tsx |
| `components_new/header/MobSetLocationApp.tsx` | client | port 43→~40 | port MobSetLocation.tsx |
| `components_new/product/ProductOptionSelectorApp.tsx` | client | port 33→~30 | port |
| `components_new/product/ProductItemNewApp.tsx` | client | port 1254→~1240 | port ProductItemNew.tsx (большой) |
| `components_new/product/CreateYourPizzaCommonApp.tsx` | client | port 30→~30 | port wrapper для desktop/mobile switch |
| `components_new/product/CreateYourPizzaApp.tsx` | client | port 1002→~990 | port desktop pizza builder |
| `components_new/product/CreateYourPizzaMobileApp.tsx` | client | port 1028→~1015 | port mobile pizza builder |
| `components_new/common/SmallCartApp.tsx` | client | port 583→~575 | port mini-cart sidebar (desktop) |
| `components_new/common/SmallCartMobileApp.tsx` | client | port 729→~720 | port mini-cart (mobile) |
| `components_new/main/CityMainApp.tsx` | client | ~250 | новый: композиция главной страницы (MainSlider + CategoriesMenu + product grid + ThreePizza + dynamic SmallCart) |
| `components_new/product/ProductDetailApp.tsx` | client | ~400 | новый: product detail page композиция (info + add to cart + related) |
| `app/[city]/page.tsx` | server | ~70 | server: fetch products + siteInfo + sliders, рендерит CityMainApp |
| `app/[city]/product/[id]/page.tsx` | server | ~80 | server: fetch product by id, рендерит ProductDetailApp |
| `app/product/[id]/page.tsx` | server | ~30 | server: legacy redirect /product/[id] → /[city]/product/[id] (city из cookie) |

### Modified

| Файл | Изменение |
|---|---|
| `proxy.ts` | + `/[city]`, `/[city]/product/[id]`, `/product/[id]` matchers |
| `app/[city]/LayoutWrapper.tsx` | Добавить `<SmallCartApp channelName="chopar" />` sidebar после `<main>` |

### Deleted

| Файл | Причина |
|---|---|
| `pages/[city]/index.tsx` | Заменено `app/[city]/page.tsx` |
| `pages/[city]/product/[id].tsx` | Заменено `app/[city]/product/[id]/page.tsx` |
| `pages/product/[id].tsx` | Заменено `app/product/[id]/page.tsx` |

---

## Pre-flight

- [ ] **Step 1: Verify Wave 3 done**

```bash
cd /Users/macbookpro/development/next_frontend
git branch --show-current
git log --oneline -3
ls "app/[city]/news/page.tsx" "app/[city]/sale/page.tsx"
```

Expected: branch `migration/app-router`, news/sale pages exist.

- [ ] **Step 2: Baseline build**

```bash
rm -rf .next/* 2>/dev/null; rm -rf .next
bun run build > /tmp/wave4-baseline.log 2>&1 && echo "OK" || (echo "FAIL"; tail -30 /tmp/wave4-baseline.log)
```

Expected: `OK`.

---

## Phase A: Server data fetchers + simple client components

### Task 1: lib/data/products.ts + lib/data/sliders.ts

**Files:** Create both.

```typescript
// lib/data/products.ts
import 'server-only'
import { unstable_cache as cache } from 'next/cache'
import commerce from '@lib/api/commerce'

async function fetchAllProductsRaw(citySlug?: string) {
  const config: any = {
    queryParams: citySlug ? { city: citySlug } : {},
  }
  const result = await commerce.getAllProducts({
    variables: { first: 6 },
    config,
  } as any)
  return ((result as any)?.products as any[]) || []
}

async function fetchProductByIdRaw(id: string, citySlug?: string) {
  // commerce.getAllProducts returns full list; use getProduct if exists, else filter from getAllProducts
  // Implementation depends on framework/local/api/operations/get-product.ts existence.
  // Fallback: fetch all products and find by id.
  const all = await fetchAllProductsRaw(citySlug)
  return all.find((p) => String((p as any).id) === String(id)) || null
}

export const fetchAllProducts = cache(
  fetchAllProductsRaw,
  ['products-all'],
  { revalidate: 600, tags: ['products'] }
)

export const fetchProductById = cache(
  fetchProductByIdRaw,
  ['product-by-id'],
  { revalidate: 600, tags: ['products'] }
)
```

```typescript
// lib/data/sliders.ts
import 'server-only'
import { unstable_cache as cache } from 'next/cache'

const apiUrl = () => process.env.NEXT_PUBLIC_API_URL || process.env.API_URL

async function fetchSlidersRaw(locale: string) {
  const res = await fetch(`${apiUrl()}/api/sliders/public?locale=${locale}`, {
    next: { revalidate: 300, tags: ['sliders'] },
  })
  if (!res.ok) return []
  const json = (await res.json()) as { data?: any[] }
  return json.data || []
}

export const fetchSliders = cache(fetchSlidersRaw, ['sliders'], {
  revalidate: 300,
  tags: ['sliders'],
})
```

Verify TS, commit: `feat(data): add products + sliders server fetchers`

### Task 2: Port simple components — Main + Header siblings

**Files:** Create 5 files (port from legacy with useExtracted/useLocale swap).

For each, the port pattern is:
1. Read legacy file (`components_new/main/MainSlider.tsx` etc.)
2. Copy verbatim into new file with `App` suffix (`MainSliderApp.tsx`)
3. Add `'use client'` at top
4. Replace `import { useRouter } from 'next/router'` → if needs locale: `import { useLocale } from 'next-intl'` (use `const locale = useLocale()`); if needs router.push: `import { useRouter } from '../../i18n/navigation'`
5. Replace `import useTranslation from 'next-translate/useTranslation'` → `import { useExtracted } from 'next-intl'`
6. Replace `const { t: tr } = useTranslation('common')` → `const t = useExtracted()`
7. Replace `tr('key')` calls with `t('Inline RU')` — use the keys' meanings (snap from legacy `messages/common.json` from prod API or use sensible Russian inline)
8. Image components: change `width="400"` (string) → `width={400}` (number). Same for height.
9. Remove `legacyBehavior` from `<Link>`. Drop wrapping `<a>` inside Link.
10. Save as new file. Original `components_new/main/MainSlider.tsx` not modified — kept for legacy `pages/` reference; deleted in Wave 6 cleanup.

Files to port:

| Source | Target |
|---|---|
| `components_new/main/MainSlider.tsx` | `components_new/main/MainSliderApp.tsx` |
| `components_new/main/CategoriesMenu.tsx` | `components_new/main/CategoriesMenuApp.tsx` |
| `components_new/main/MobileCategoriesMenu.tsx` | `components_new/main/MobileCategoriesMenuApp.tsx` |
| `components_new/main/ThreePizza.tsx` | `components_new/main/ThreePizzaApp.tsx` |
| `components_new/header/MobSetLocation.tsx` | `components_new/header/MobSetLocationApp.tsx` |

For each: verify TS, individual commit.

Commits (5):
- `feat(main): port MainSliderApp (Flicking carousel)`
- `feat(main): port CategoriesMenuApp (sticky scroll nav)`
- `feat(main): port MobileCategoriesMenuApp`
- `feat(main): port ThreePizzaApp (banner + builder trigger)`
- `feat(header): port MobSetLocationApp`

### Task 3: Port ProductOptionSelectorApp

Same port pattern. `components_new/product/ProductOptionSelector.tsx` → `components_new/product/ProductOptionSelectorApp.tsx`.

Commit: `feat(product): port ProductOptionSelectorApp`

---

## Phase B: Product card + builder (large ports)

### Task 4: Port ProductItemNewApp (1254 lines — largest)

Same port pattern. Critical points to verify after port:
- `useCart from '@framework/cart'` retained as-is
- Add `'use client'` at top
- `useRouter()` removed, locale via `useLocale()` from `next-intl` if used
- `import getAssetUrl from '@utils/getAssetUrl'` retained
- `import Hashids from 'hashids'` retained
- `import { trackAddToCart } from '@lib/posthog-events'` — check this file exists; if uses `next/router` internally, need adapter (see notes below)
- `axios.defaults.withCredentials = true` retained
- All toast.* calls retained
- `Image width="400"` → `width={400}` numeric

If `@lib/posthog-events` uses `next/router` — port it OR replace with no-op stub for now (ship analytics tracking wave later).

Verify TS, commit: `feat(product): port ProductItemNewApp (card + add to cart + modifiers)`

### Task 5: Port CreateYourPizza family

3 files:
- `CreateYourPizzaCommon.tsx` → `CreateYourPizzaCommonApp.tsx` (small wrapper)
- `CreateYourPizza.tsx` → `CreateYourPizzaApp.tsx` (1002 lines — desktop)
- `CreateYourPizzaMobile.tsx` → `CreateYourPizzaMobileApp.tsx` (1028 lines — mobile)

Same port pattern. CreateYourPizzaCommonApp uses dynamic imports for desktop/mobile based on screen size — preserve this.

Verify TS, 3 commits.

---

## Phase C: SmallCart + composition + pages

### Task 6: Port SmallCartApp + SmallCartMobileApp

Same port pattern.
- `useCart from '@framework/cart'` retained
- `useForm from 'react-hook-form'` retained
- `axios` for basket-line CRUD retained
- `Hashids` for line ID encoding retained

Two files, two commits:
- `feat(cart): port SmallCartApp (desktop sidebar)`
- `feat(cart): port SmallCartMobileApp`

### Task 7: components_new/main/CityMainApp.tsx — главная композиция

**File:** Create `components_new/main/CityMainApp.tsx`

```typescript
'use client'

import { useEffect, useMemo, useState, FC } from 'react'
import dynamic from 'next/dynamic'
import { useUI } from '@components/ui/context'
import MainSliderApp from './MainSliderApp'
import CategoriesMenuApp from './CategoriesMenuApp'
import MobileCategoriesMenuApp from './MobileCategoriesMenuApp'
import ProductItemNewApp from '../product/ProductItemNewApp'
import ProductListSectionTitle from '../product/ProductListSectionTitle'
import MobSetLocationApp from '../header/MobSetLocationApp'

const ThreePizzaApp = dynamic(() => import('./ThreePizzaApp'), { ssr: false })
const HalfPizzaApp = dynamic(() => import('../product/CreateYourPizzaCommonApp'), { ssr: false })

type Props = {
  products: any[]
  categories: any[]
  sliders: any[]
  channelName: string
}

const CityMainApp: FC<Props> = ({ products, categories, sliders, channelName }) => {
  // Group products by category (port logic from legacy pages/[city]/index.tsx)
  const productsByCategory = useMemo(() => {
    const map: Record<string, any[]> = {}
    products.forEach((p) => {
      const catId = String(p.category_id || p.categoryId || 'misc')
      if (!map[catId]) map[catId] = []
      map[catId].push(p)
    })
    return map
  }, [products])

  return (
    <>
      <div className="md:hidden">
        <MobSetLocationApp />
      </div>
      <MainSliderApp initialSliders={sliders} />
      <div id="header" />
      <div className="hidden md:block">
        <CategoriesMenuApp categories={categories} channelName={channelName} />
      </div>
      <div className="md:hidden">
        <MobileCategoriesMenuApp categories={categories} />
      </div>
      <ThreePizzaApp />
      <HalfPizzaApp />
      <div className="container mx-auto py-4">
        {categories.map((cat) => {
          const items = productsByCategory[String(cat.id)] || []
          if (!items.length) return null
          return (
            <section
              id={`productSection_${cat.id}`}
              key={cat.id}
              className="mb-10"
            >
              <ProductListSectionTitle category={cat} />
              <div className="md:grid md:grid-cols-3 gap-6">
                {items.map((product) => (
                  <ProductItemNewApp
                    key={product.id}
                    product={product}
                    channelName={channelName}
                  />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </>
  )
}

export default CityMainApp
```

> Note: actual product → category grouping logic depends on legacy `pages/[city]/index.tsx` lines 110-200 (read it to copy the exact algorithm). The above is simplified — replace with actual logic during implementation.

Commit: `feat(main): add CityMainApp (catalog composition)`

### Task 8: Port ProductListSectionTitle (small)

`components_new/product/ProductListSectionTitle.tsx` is 15 lines, no hooks. Can be reused as-is from legacy if pure markup. Verify it doesn't import next/router or useTranslation. If clean — no port needed; if has those — port to `ProductListSectionTitleApp.tsx`.

If ported: commit: `feat(product): port ProductListSectionTitleApp`

### Task 9: app/[city]/page.tsx + ProductDetailApp + product page + product redirect

#### app/[city]/page.tsx (server)

```typescript
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { fetchSiteInfo } from '../../lib/data/site-info'
import { fetchAllProducts } from '../../lib/data/products'
import { fetchSliders } from '../../lib/data/sliders'
import CityMainApp from '../../components_new/main/CityMainApp'
import type { City } from '@commerce/types/cities'

type Params = { city: string }

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { city } = await params
  const base = 'https://choparpizza.uz'
  return {
    title: 'Chopar Pizza — Доставка пиццы',
    description: 'Заказать онлайн доставку пиццы Chopar в Ташкенте и других городах',
    alternates: {
      canonical: `${base}/${city}`,
      languages: {
        ru: `${base}/${city}`,
        uz: `${base}/uz/${city}`,
        en: `${base}/en/${city}`,
      },
    },
  }
}

export default async function CityHomePage({
  params,
}: {
  params: Promise<Params>
}) {
  const { city: citySlug } = await params
  const [siteInfo, locale] = await Promise.all([
    fetchSiteInfo(),
    getLocale(),
  ])
  const cities = (siteInfo as any).cities as City[]
  const currentCity = cities.find((c) => c.slug === citySlug)
  if (!currentCity) notFound()

  const [products, sliders] = await Promise.all([
    fetchAllProducts(citySlug),
    fetchSliders(locale),
  ])

  return (
    <CityMainApp
      products={products}
      categories={(siteInfo as any).categories || []}
      sliders={sliders}
      channelName="chopar"
    />
  )
}
```

#### components_new/product/ProductDetailApp.tsx

Port relevant pieces from legacy `pages/[city]/product/[id].tsx` (741 lines). Composition: product info + ProductItemNewApp (or specialized detail variant) + related/recommended.

Implementation tip: `ProductItemNewApp` already handles cart/modifiers — `ProductDetailApp` is mostly a wrapper that displays product info larger and includes `ProductItemNewApp` as the action panel.

#### app/[city]/product/[id]/page.tsx

```typescript
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { fetchSiteInfo } from '../../../../lib/data/site-info'
import { fetchProductById } from '../../../../lib/data/products'
import ProductDetailApp from '../../../../components_new/product/ProductDetailApp'
import type { City } from '@commerce/types/cities'

type Params = { city: string; id: string }

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { city, id } = await params
  const base = 'https://choparpizza.uz'
  return {
    title: 'Chopar Pizza — Продукт',
    alternates: {
      canonical: `${base}/${city}/product/${id}`,
      languages: {
        ru: `${base}/${city}/product/${id}`,
        uz: `${base}/uz/${city}/product/${id}`,
        en: `${base}/en/${city}/product/${id}`,
      },
    },
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { city: citySlug, id } = await params
  const [siteInfo, locale] = await Promise.all([
    fetchSiteInfo(),
    getLocale(),
  ])
  const cities = (siteInfo as any).cities as City[]
  const currentCity = cities.find((c) => c.slug === citySlug)
  if (!currentCity) notFound()

  const product = await fetchProductById(id, citySlug)
  if (!product) notFound()

  return <ProductDetailApp product={product} channelName="chopar" />
}
```

#### app/product/[id]/page.tsx (legacy redirect)

```typescript
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

type Params = { id: string }

export default async function LegacyProductRedirect({
  params,
}: {
  params: Promise<Params>
}) {
  const { id } = await params
  const cookieStore = await cookies()
  const citySlug = cookieStore.get('city_slug')?.value || 'tashkent'
  redirect(`/${citySlug}/product/${id}`)
}
```

3 page.tsx + 1 component (ProductDetailApp). Multiple commits suggested:
- `feat(app): add /[city] city home page (server, fetch products + sliders)`
- `feat(product): add ProductDetailApp composition`
- `feat(app): add /[city]/product/[id] page`
- `feat(app): add /product/[id] legacy redirect`

### Task 10: Wire SmallCartApp into LayoutWrapper

Modify `app/[city]/LayoutWrapper.tsx`. Add SmallCartApp + SmallCartMobileApp render after `<main>`. They are conditionally rendered based on `useUI().displaySidebar` state — keep that logic via `useUI()`.

Pattern:
```typescript
import dynamic from 'next/dynamic'
const SmallCartApp = dynamic(() => import('../../components_new/common/SmallCartApp'), { ssr: false })
const SmallCartMobileApp = dynamic(() => import('../../components_new/common/SmallCartMobileApp'), { ssr: false })

// Inside JSX, after <main>:
<SmallCartApp channelName="chopar" />
<SmallCartMobileApp channelName="chopar" />
```

Commit: `feat(app): wire SmallCartApp + SmallCartMobileApp into city layout`

---

## Phase D: Proxy + delete legacy + verify

### Task 11: Update proxy.ts matcher

Add 3 new patterns:
- `/[city]` (root city page)
- `/[city]/product/[id]` (product detail)
- `/product/[id]` (legacy redirect)

```typescript
'/(tashkent|samarkand|bukhara|namangan|fergana|andijan|qarshi|nukus|urgench|jizzakh|gulistan|termez|chirchiq|navoi)',
'/(tashkent|samarkand|bukhara|namangan|fergana|andijan|qarshi|nukus|urgench|jizzakh|gulistan|termez|chirchiq|navoi)/product/:id',
'/product/:id',
```

Commit: `feat(app): expand proxy matcher — city home, product detail, legacy product redirect`

### Task 12: Delete legacy pages

```bash
git rm "pages/[city]/index.tsx" "pages/[city]/product/[id].tsx" "pages/product/[id].tsx"
rm -rf .next/* 2>/dev/null; rm -rf .next
bun run build > /tmp/wave4-task12.log 2>&1 && echo "BUILD OK" || (echo "BUILD FAIL"; tail -50 /tmp/wave4-task12.log)
```

If BUILD FAIL — STOP, report.

Commit: `feat(app): remove legacy /[city]/index.tsx + product pages (3 files)`

### Task 13: Verify dev runtime

Standard pattern:
```bash
bunx next dev --webpack -p 5757 > /tmp/wave4-dev.log 2>&1 &
echo $! > /tmp/wave4-dev.pid
sleep 30

curl -s -o /tmp/curl-home.html -w "/tashkent HTTP %{http_code}\n" http://localhost:5757/tashkent
curl -s -o /tmp/curl-pid.html -w "/tashkent/product/1234 HTTP %{http_code}\n" http://localhost:5757/tashkent/product/1234
curl -s -o /dev/null -w "/product/1234 HTTP %{http_code}\n" http://localhost:5757/product/1234
curl -s -o /dev/null -w "/tashkent/about HTTP %{http_code}\n" http://localhost:5757/tashkent/about

kill $(cat /tmp/wave4-dev.pid) 2>/dev/null
```

Expected:
- `/tashkent` HTTP 200 with catalog markers (categories + products)
- `/tashkent/product/<real-id>` HTTP 200 (use a valid id from API)
- `/product/<id>` HTTP 307 (redirect)
- `/tashkent/about` HTTP 200 (Wave 2 still works)

### Task 14: Production build smoke

```bash
rm -rf .next/* 2>/dev/null; rm -rf .next
bun run build > /tmp/wave4-prod.log 2>&1
echo "EXIT_CODE=$?"
grep -E "/\[city\]|/product" /tmp/wave4-prod.log | tail -10
```

Expected: `EXIT_CODE=0`, all 3 routes in App Router section.

### Task 15: DevTools MCP visual diff

```
new_page("https://choparpizza.uz/tashkent")  # prod
new_page("http://localhost:5757/tashkent")  # local

evaluate_script: count category sections, count product cards, verify CategoriesMenu, MainSlider, ThreePizza, SmallCart present.
```

Compare DOM structure to prod. Document any visual regressions as TODO.

### Task 16: Final Verification

Standard DoD:
- File tree complete
- TS clean for our code
- Build OK
- All commits accumulated
- Branch clean

---

## Wave 4 Done. Что осталось:

- **Wave 5** — Personal: cart full page (`/cart`), checkout (`/order/*`), profile, tracking, bonus
- **Wave 6** — Cleanup: remove `pages/_app.tsx`, `_document.tsx`, `i18n.js`, `next-translate`, `next-cookies`, `next-seo`, switch `localePrefix` to `'as-needed'` with `[locale]` segment, delete legacy view-components

---

## Self-Review Checklist

- [ ] All ports preserve original logic (cart axios calls, useCart hook, Hashids encoding, etc.)
- [ ] All ports use `'use client'` directive
- [ ] All `useRouter from 'next/router'` removed
- [ ] All `useTranslation from 'next-translate'` → `useExtracted`
- [ ] All `tr('key')` → `t('Inline RU')`
- [ ] `<Image width="400">` (string) → `width={400}` (number)
- [ ] `<Link legacyBehavior>` removed where straightforward
- [ ] Build OK after deleting 3 legacy pages
- [ ] DevTools MCP confirms catalog renders with cards + cart sidebar

---

## Realistic expectations

This wave is **the largest in the migration** — ~6600 lines of interactive code being ported. Each large component port (ProductItemNewApp at 1254 lines, CreateYourPizzaApp at 1002 lines, SmallCartApp at 583 lines) is its own subagent task and may surface issues that require fixes (TS strict mode mismatches in ported code, dependency hooks needing adaptation, missing imports, etc.).

Estimate: **15-25 subagent dispatches**, including review iterations. Build failures and runtime issues during port are expected — fix forward, don't revert. Visual diff at end may show regressions; document and prioritize fixes for Wave 7 polish.
