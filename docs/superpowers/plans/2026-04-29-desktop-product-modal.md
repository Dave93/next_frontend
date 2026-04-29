# Desktop product quick-view modal — implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Open product cards as a centered desktop modal via Next.js intercepting + parallel routes, while keeping the mobile vaul drawer and full `/[city]/product/[id]` page (refresh / share / SEO) unchanged.

**Architecture:** Extract the existing detail-page body into a shared `ProductDetailContent`. Mount a `@modal` parallel slot under `app/[city]/`. An intercepting route `(.)product/[id]` renders `ProductQuickModal` (Headless UI Dialog) which wraps `ProductDetailContent`. Closing any way (Esc / backdrop / × / browser back) calls `router.back()`, which unmounts the slot via the intercepting route lifecycle.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, `@headlessui/react@^2`, `sonner` (toast), `next-intl`, existing `useProductBuilder` hook, existing `fetchProductById` cached server function.

**Test strategy:** No unit-test framework in repo. Each task ends with **manual verification** (curl + browser at `localhost:5656` via `bun dev`, or live `https://choparpizza.uz` after deploy) and a commit.

**Spec:** `docs/superpowers/specs/2026-04-29-desktop-product-modal-design.md` (commit `8580744d`).

---

## Task 1: Extract `ProductDetailContent` from `ProductDetailApp`

Pure refactor. Lift the image-grid + controls "core" out of `ProductDetailApp` into a new presentational component so both the full page and the modal can render the same body. After this task `/[city]/product/[id]` must look and behave identically.

**Files:**
- Create: `components_new/product/ProductDetailContent.tsx`
- Modify: `components_new/product/ProductDetailApp.tsx`

- [ ] **Step 1: Create `ProductDetailContent.tsx` with the full grid body**

```tsx
'use client'

import { FC } from 'react'
import Image from 'next/image'
import currency from 'currency.js'
import { useExtracted, useLocale } from 'next-intl'
import getAssetUrl from '@utils/getAssetUrl'
import { useProductBuilder } from './useProductBuilder'

const YELLOW = '#FAAF04'

const formatPrice = (val: number, locale: string) =>
  currency(val, {
    pattern: '# !',
    separator: ' ',
    decimal: '.',
    symbol: locale === 'uz' ? "so'm" : locale === 'en' ? 'sum' : 'сум',
    precision: 0,
  }).format()

type Props = {
  product: any
  onAdded?: () => void
}

const ProductDetailContent: FC<Props> = ({ product, onAdded }) => {
  const t = useExtracted()
  const locale = useLocale()
  const builder = useProductBuilder(product, onAdded)

  const localizedName = (() => {
    const attr =
      product?.attribute_data?.name?.['chopar']?.[locale] ||
      product?.attribute_data?.name?.['chopar']?.['ru']
    return attr || product?.name || ''
  })()

  const localizedDesc = (() => {
    const attr =
      product?.attribute_data?.description?.['chopar']?.[locale] ||
      product?.attribute_data?.description?.['chopar']?.['ru']
    const raw = attr || product?.description || product?.desc || ''
    return raw
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  })()

  const variantLabel = (v: any) =>
    locale === 'uz'
      ? v.custom_name_uz
      : locale === 'en'
        ? v.custom_name_en
        : v.custom_name

  const modifierLabel = (m: any) => {
    const byLocale =
      (locale === 'uz' && m.name_uz) ||
      (locale === 'en' && m.name_en) ||
      m.name_ru
    return byLocale || m.name || ''
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-10 p-4 md:p-10">
      <div className="flex items-center justify-center">
        {product.image ? (
          <Image
            src={product.image}
            alt={localizedName}
            width={520}
            height={520}
            sizes="(max-width: 768px) 90vw, 520px"
            className="w-full h-auto max-w-[520px] object-contain"
            priority
          />
        ) : (
          <img
            src="/no_photo.svg"
            alt={localizedName}
            className="w-full max-w-[520px] object-contain"
          />
        )}
      </div>

      <div className="flex flex-col">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
          {localizedName}
        </h1>
        {localizedDesc && (
          <p className="mt-3 text-sm md:text-base text-gray-500 leading-relaxed">
            {localizedDesc}
          </p>
        )}

        {builder.variants.length > 1 && (
          <div className="mt-6">
            <div className="bg-gray-100 rounded-full p-1 flex gap-1">
              {builder.variants.map((v: any) => {
                const isActive = v.id === builder.activeVariant?.id
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => builder.selectVariant(v.id)}
                    className="flex-1 h-10 rounded-full text-sm font-semibold transition-colors"
                    style={{
                      background: isActive ? YELLOW : 'transparent',
                      color: isActive ? '#fff' : '#6B7280',
                    }}
                  >
                    {variantLabel(v)}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {builder.modifiers.length > 0 && (
          <div className="mt-6">
            <h3 className="text-base font-bold text-gray-900 mb-3">
              {t('Добавить в пиццу')}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {builder.modifiers.map((mod: any) => {
                const isActive = builder.activeModifiers.includes(mod.id)
                return (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => builder.toggleModifier(mod.id)}
                    className="relative bg-white rounded-2xl border text-left transition-all overflow-hidden"
                    style={{
                      borderColor: isActive ? YELLOW : '#E5E7EB',
                      borderWidth: isActive ? 2 : 1,
                      padding: isActive ? 11 : 12,
                    }}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="w-14 h-14 mb-2 flex items-center justify-center">
                        <img
                          src={getAssetUrl(mod.assets)}
                          alt={modifierLabel(mod)}
                          className="max-w-full max-h-full object-contain"
                          loading="lazy"
                        />
                      </div>
                      <div className="text-[12px] font-semibold text-gray-800 leading-tight line-clamp-2 min-h-[28px]">
                        {modifierLabel(mod)}
                      </div>
                      <div
                        className="text-[12px] font-bold mt-1"
                        style={{ color: isActive ? YELLOW : '#111827' }}
                      >
                        +{formatPrice(mod.price, locale)}
                      </div>
                    </div>
                    {isActive && (
                      <div
                        className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-white"
                        style={{ background: YELLOW }}
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div className="mt-6 md:mt-auto pt-4 flex items-center justify-between gap-4">
          <span className="text-xl md:text-2xl font-extrabold text-gray-900">
            {formatPrice(builder.totalPrice, locale)}
          </span>
          {builder.cartQuantity > 0 ? (
            <div className="flex items-center gap-3">
              <div
                className="flex items-center rounded-full h-12"
                style={{ background: YELLOW, padding: '0 4px' }}
              >
                <button
                  type="button"
                  onClick={() => builder.changeQuantity(-1)}
                  disabled={builder.isLoading}
                  aria-label="decrement"
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl font-bold disabled:opacity-60"
                  style={{ color: YELLOW }}
                >
                  −
                </button>
                <span className="text-white font-bold text-base px-4 min-w-[36px] text-center">
                  {builder.isLoading ? '…' : builder.cartQuantity}
                </span>
                <button
                  type="button"
                  onClick={() => builder.changeQuantity(1)}
                  disabled={builder.isLoading}
                  aria-label="increment"
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl font-bold disabled:opacity-60"
                  style={{ color: YELLOW }}
                >
                  +
                </button>
              </div>
              <button
                type="button"
                onClick={builder.addToCart}
                disabled={builder.isLoading}
                aria-label="add another"
                className="w-12 h-12 rounded-full flex items-center justify-center text-white disabled:opacity-70"
                style={{ background: YELLOW }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={builder.addToCart}
              disabled={builder.isLoading}
              className="rounded-full font-bold text-white px-8 h-12 transition-opacity disabled:opacity-70 uppercase text-sm"
              style={{ background: YELLOW }}
            >
              {builder.isLoading ? t('Загрузка...') : t('В корзину')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductDetailContent
```

- [ ] **Step 2: Replace `ProductDetailApp` body with `<ProductDetailContent>`**

Open `components_new/product/ProductDetailApp.tsx`. Reduce it to a thin wrapper that keeps only the page-specific outer container, the back button and the card chrome, delegating the rest to `ProductDetailContent`. Replace the entire file with:

```tsx
'use client'

import { FC } from 'react'
import { useExtracted, useLocale } from 'next-intl'
import { useRouter } from '../../i18n/navigation'
import ProductDetailContent from './ProductDetailContent'

type Props = {
  product: any
  channelName: string
}

const ProductDetailApp: FC<Props> = ({ product }) => {
  // useExtracted/useLocale aren't used in this thin wrapper, but other
  // call-sites of the file historically import them; keep the hooks out
  // since ProductDetailContent owns everything that needed them.
  const router = useRouter()

  return (
    <div className="container mx-auto py-4 md:py-6 px-3 md:px-0">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="back"
        className="mb-4 inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors text-gray-700"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        <ProductDetailContent product={product} />
      </div>
    </div>
  )
}

export default ProductDetailApp
```

(The unused `useExtracted/useLocale` import comment is informational. Final file imports are exactly: `FC` from `react`, `useRouter` from `../../i18n/navigation`, `ProductDetailContent`. Drop the rest.)

- [ ] **Step 3: Type-check / build the refactor**

Run from repo root:

```bash
bun run build
```

Expected: build completes without TypeScript errors. The `Route (app)` table at the end still lists `ƒ /[city]/product/[id]`.

If the build complains about unused imports in `ProductDetailApp.tsx`, remove them — only `FC`, `useRouter` and `ProductDetailContent` should remain.

- [ ] **Step 4: Manual smoke test in dev**

```bash
bun dev
```

Open `http://localhost:5656/kokand/product/579` (Грибная). Expected:
- Page renders identically to before — back arrow top-left, white rounded card, image left, name/description/sizes/modifiers/price/В корзину right.
- Click sizes — they swap. Click modifiers — they toggle. "В корзину" adds to cart and the button morphs into −/qty/+ controls.
- No console errors.

Stop dev server (`Ctrl+C`).

- [ ] **Step 5: Commit**

```bash
git add components_new/product/ProductDetailContent.tsx components_new/product/ProductDetailApp.tsx
git commit -m "$(cat <<'EOF'
refactor(product): extract ProductDetailContent for reuse in modal

Lifts the image-grid body of ProductDetailApp into its own component so
the upcoming desktop quick-view modal can render the same UI inside an
intercepting-route Dialog. ProductDetailApp is now a thin wrapper
(container + back-button + card chrome) around the new component.
No behavior change on /[city]/product/[id].

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Add `@modal` parallel slot (default null)

Wire the parallel slot into the city layout without yet hooking up an interceptor. After this task the slot exists, renders nothing, and the catalog still works exactly as before.

**Files:**
- Create: `app/[city]/@modal/default.tsx`
- Modify: `app/[city]/layout.tsx`

- [ ] **Step 1: Create the default slot file**

```bash
mkdir -p app/\[city\]/@modal
```

Create `app/[city]/@modal/default.tsx` with:

```tsx
export default function ModalSlotDefault() {
  return null
}
```

- [ ] **Step 2: Wire the slot into `app/[city]/layout.tsx`**

Replace the existing layout (top to bottom — preserve `dynamicParams` / `generateStaticParams`):

```tsx
import { notFound } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { fetchSiteInfo } from '../../lib/data/site-info'
import { fetchPublicConfig } from '../../lib/data/configs'
import LayoutWrapper from './LayoutWrapper'
import type { City } from '@commerce/types/cities'

export const dynamicParams = true

export async function generateStaticParams() {
  const siteInfo = await fetchSiteInfo()
  const cities = (siteInfo as any).cities as City[]
  return cities.map((c) => ({ city: c.slug }))
}

export default async function CityLayout({
  children,
  modal,
  params,
}: {
  children: React.ReactNode
  modal: React.ReactNode
  params: Promise<{ city: string }>
}) {
  const { city: citySlug } = await params
  const [siteInfo, config, locale] = await Promise.all([
    fetchSiteInfo(),
    fetchPublicConfig().catch(() => ({}) as Awaited<ReturnType<typeof fetchPublicConfig>>),
    getLocale(),
  ])
  const cities = (siteInfo as any).cities as City[]
  const currentCity = cities.find((c) => c.slug === citySlug)
  if (!currentCity) notFound()

  return (
    <LayoutWrapper
      pageProps={{
        cities,
        currentCity,
        categories: siteInfo.categories,
        footerInfoMenu: siteInfo.footerInfoMenu,
        socials: siteInfo.socials,
        config,
        locale,
      }}
    >
      {children}
      {modal}
    </LayoutWrapper>
  )
}
```

The only change vs the original is the new `modal: React.ReactNode` prop and the `{modal}` render after `{children}`.

- [ ] **Step 3: Build and smoke test**

```bash
bun run build
```

Expected: build completes. `bun dev` and open `http://localhost:5656/kokand`. The catalog renders exactly as before (the slot is `null`).

Open DevTools, confirm no React warnings about missing parallel slot.

- [ ] **Step 4: Commit**

```bash
git add app/\[city\]/@modal/default.tsx app/\[city\]/layout.tsx
git commit -m "$(cat <<'EOF'
feat(city-layout): add empty @modal parallel slot

Prepares app/[city]/ for the upcoming intercepting-route product modal.
The slot is currently a no-op (default.tsx returns null) so the catalog
behavior is unchanged.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Create `ProductQuickModal` component

Build the dialog component — Headless UI v2 `<Dialog>` (focus trap / ESC / scroll lock / inert background out of the box) wrapping `ProductDetailContent`. Closing any way calls `router.back()`. On successful add: `router.back()` + `toast.success`.

**Files:**
- Create: `components_new/product/ProductQuickModal.tsx`

- [ ] **Step 1: Create the component**

```tsx
'use client'

import { FC, Fragment, useRef } from 'react'
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react'
import { useExtracted } from 'next-intl'
import { useRouter } from '../../i18n/navigation'
import { toast } from 'sonner'
import ProductDetailContent from './ProductDetailContent'

type Props = {
  product: any
}

const ProductQuickModal: FC<Props> = ({ product }) => {
  const t = useExtracted()
  const router = useRouter()
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const close = () => {
    router.back()
  }

  const handleAdded = () => {
    toast.success(t('Товар добавлен в корзину'))
    router.back()
  }

  const localizedName = (() => {
    const attr =
      product?.attribute_data?.name?.['chopar']?.['ru'] ||
      product?.attribute_data?.name?.['chopar']?.['en']
    return attr || product?.name || ''
  })()

  return (
    <Transition show as={Fragment} appear>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={close}
        initialFocus={closeButtonRef}
      >
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60" aria-hidden="true" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="relative w-[90vw] max-w-[960px] max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
                <DialogTitle className="sr-only">{localizedName}</DialogTitle>

                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={close}
                  aria-label={t('Закрыть')}
                  className="absolute top-4 right-4 z-10 inline-flex items-center justify-center w-11 h-11 rounded-full bg-white/90 hover:bg-gray-100 transition-colors text-gray-700 shadow-sm"
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>

                <ProductDetailContent product={product} onAdded={handleAdded} />
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

export default ProductQuickModal
```

- [ ] **Step 2: Verify the component type-checks**

```bash
bun run build
```

Expected: build completes. `ProductQuickModal` is unused so far — just needs to compile.

If TypeScript flags `next-intl`'s `useExtracted` returning a function that can't be called with a string key like `t('Закрыть')`, fall back to passing the literal string for the `aria-label` (`aria-label="Закрыть"`). Inspect the existing project usage: `useExtracted` is already used the same way in `ProductDetailApp` — so this is a precaution only.

- [ ] **Step 3: Confirm i18n key for "Закрыть" exists**

```bash
grep -rn "\"Закрыть\"" messages/ 2>/dev/null | head -5
```

If the key is missing in any of `messages/ru.json`, `messages/uz.json`, `messages/en.json`, add it now. Russian → "Закрыть", Uzbek → "Yopish", English → "Close". Use the existing JSON structure of those files (look at the surrounding keys in the file).

- [ ] **Step 4: Commit**

```bash
git add components_new/product/ProductQuickModal.tsx
git add messages/ru.json messages/uz.json messages/en.json 2>/dev/null
git commit -m "$(cat <<'EOF'
feat(product): add ProductQuickModal Dialog component

Headless UI v2 Dialog wrapping the shared ProductDetailContent. Handles
backdrop fade + panel scale/fade animation, ESC, focus trap, scroll lock
and inert background out of the box. Close (×/Esc/backdrop/back) calls
router.back() so the intercepting-route slot unmounts naturally.
Add success → toast + router.back().

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Add intercepting route + end-to-end verification

Wire the intercepted route under `@modal/(.)product/[id]/page.tsx` so that desktop `<Link href="/{city}/product/{id}">` clicks open the modal instead of navigating.

**Files:**
- Create: `app/[city]/@modal/(.)product/[id]/page.tsx`

- [ ] **Step 1: Create the intercepted page**

```bash
mkdir -p 'app/[city]/@modal/(.)product/[id]'
```

Create `app/[city]/@modal/(.)product/[id]/page.tsx`:

```tsx
import { fetchProductById } from '../../../../../lib/data/products'
import ProductQuickModal from '../../../../../components_new/product/ProductQuickModal'

type Params = { city: string; id: string }

export default async function InterceptedProductPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { city: citySlug, id } = await params
  const product = await fetchProductById(id, citySlug)
  if (!product) return null
  return <ProductQuickModal product={product} />
}
```

(The relative path has five `..` segments because the file is nested at `app/[city]/@modal/(.)product/[id]/page.tsx` — verify by counting.)

- [ ] **Step 2: Build and check the route table**

```bash
bun run build
```

Expected: the `Route (app)` summary at the end of the build now lists both:
- `ƒ /[city]/product/[id]` (full page, unchanged)
- `ƒ /[city]/@modal/(.)product/[id]` (intercepted route)

If the second entry is missing, the slot/folder structure is wrong.

- [ ] **Step 3: Manual desktop verification (golden path)**

```bash
bun dev
```

In a desktop-width browser (≥1280px), test the full open/close matrix on `http://localhost:5656/kokand`:

1. **Click a pizza card** (any one with sizes, e.g. Грибная). Expected: modal slides in over the catalog with backdrop, URL becomes `/kokand/product/<id>`, catalog scroll position preserved behind backdrop.
2. **Click backdrop** — modal closes, URL returns to `/kokand`.
3. Re-open modal, **press Esc** — closes.
4. Re-open modal, **click ×** — closes.
5. Re-open modal, **press browser Back** — closes, URL returns to `/kokand`.
6. Re-open modal. Inside the modal: switch sizes, toggle modifiers — they work. Click **В корзину**. Expected: modal closes, toast "Товар добавлен в корзину" appears top-right, header cart counter increments. Reopen modal — the qty counter shows the line you just added.
7. **Refresh the page** while modal is open (URL = `/kokand/product/<id>`). Expected: the FULL page (`ProductDetailApp` with back-arrow chrome) renders. NOT a modal. Microdata is present (View Source, search for `itemProp="price"`).
8. **Open `http://localhost:5656/kokand/product/<id>` directly in a new tab.** Expected: full page (same as step 7).

- [ ] **Step 4: Manual mobile verification (regression)**

In Chrome DevTools, switch to a mobile emulation (e.g. iPhone 14). Reload `/kokand`. Tap a card. Expected: vaul drawer slides up from the bottom (NOT the desktop modal). Confirm: drawer history-back trick still works — press the simulated back button, drawer closes.

- [ ] **Step 5: A11y spot-check**

With the modal open on desktop:
- Tab cycles only between elements inside the modal panel (close → sizes → modifiers → CTA → close). Cannot tab to the catalog behind.
- Screen reader (Mac VoiceOver: `Cmd+F5`) announces the dialog and the product name.

- [ ] **Step 6: Commit**

```bash
git add 'app/[city]/@modal/(.)product/[id]/page.tsx'
git commit -m "$(cat <<'EOF'
feat(product): intercept /product/[id] from /[city] into modal

Desktop card clicks now open ProductQuickModal as an overlay via
Next.js intercepting + parallel routes, while refresh / share / direct
visit / Google still resolve to the full ProductDetailApp page (with
all its JSON-LD and microdata intact). Mobile flow is untouched —
ProductItemNewApp's mobile branch uses a button → vaul drawer, which
never enters this route.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Production deploy + live verification

Push to `origin/main` and run the prod deploy script. Re-run the verification matrix on the live site to catch anything that only manifests with SSR + caching + standalone build behind PM2.

**Files:** none (deploy only).

- [ ] **Step 1: Push and deploy**

```bash
git push origin main
ssh -i ~/.ssh/chopar_server root@choparpizza.uz \
  'cd /home/davr/chopar/next_frontend && bash deploy.sh'
```

Expected: deploy.sh prints `Deployment complete` with the new commit hash and three green health checks.

- [ ] **Step 2: Live golden-path test**

Open `https://choparpizza.uz/kokand` on a desktop browser. Re-run the matrix from Task 4 step 3 — points 1-7. Pay special attention to:
- Step 7 (refresh while modal is open) MUST land on the full SSR page.
- View source on `https://choparpizza.uz/kokand/product/<id>` and confirm the JSON-LD `<script type="application/ld+json">` block is present (Product schema).

- [ ] **Step 3: Live mobile sanity check**

On a real phone or Chrome DevTools mobile emulation, open `https://choparpizza.uz/kokand`. Tap a card. Expected: vaul drawer (mobile flow). Hardware back closes drawer.

- [ ] **Step 4: Search Console rich-results retest**

In Google Search Console → URL inspection → paste a product URL like `https://choparpizza.uz/kokand/product/579`. Click "Test live URL" → "View tested page" → "Structured data". Expected: Product schema is detected and valid (no new errors introduced by the modal route).

If the modal page somehow shows up in Search Console with a duplicated Product schema, this means Google saw the intercepted route as a separate URL — investigate before claiming complete.

- [ ] **Step 5: Final wrap-up**

No commit — production is already on the latest commit. Update the spec status:

```bash
sed -i.bak 's/^\*\*Status:\*\*.*/**Status:** Implemented/' \
  docs/superpowers/specs/2026-04-29-desktop-product-modal-design.md
rm docs/superpowers/specs/2026-04-29-desktop-product-modal-design.md.bak
git add docs/superpowers/specs/2026-04-29-desktop-product-modal-design.md
git commit -m "docs(spec): mark desktop product modal as implemented"
git push origin main
```

---

## Self-review (post-write checklist run inline)

**Spec coverage:**

| Spec section | Covered by |
|---|---|
| Architecture (parallel + intercepting routes) | Tasks 2, 4 |
| Components (ProductDetailContent / ProductQuickModal) | Tasks 1, 3 |
| ProductDetailApp shrinks to wrapper | Task 1 step 2 |
| `@modal/default.tsx` returns null | Task 2 step 1 |
| layout.tsx accepts `modal` slot | Task 2 step 2 |
| HUI Dialog with focus trap / ESC / scroll lock | Task 3 step 1 |
| Animations (fade backdrop + scale panel, 200ms ease-out) | Task 3 step 1 (`Transition` configs) |
| Close on Esc / backdrop / × / browser back via router.back() | Task 3 step 1 + Task 4 step 3 |
| Add success → close + toast | Task 3 step 1 (`handleAdded`) |
| Direct URL / refresh / share = full page | Task 4 step 3 (#7, #8) |
| Mobile drawer untouched | Task 4 step 4 |
| SEO / microdata / JSON-LD unchanged | Task 5 step 2 + step 4 |
| Stop-list product (out of scope per spec) | Not in plan, intentionally |
| `ProductItemNewApp` `e.stopPropagation()` already in place | Verified pre-plan, no edit needed |

**Placeholder scan:** No "TBD" / "TODO" / "implement later" / "fill in details". All code blocks complete. The note about `useExtracted` import in Task 1 step 2 is informational, not a placeholder — exact final imports are listed.

**Type consistency:** `ProductDetailContent` accepts `{ product, onAdded? }` consistently in Tasks 1 and 3. `useProductBuilder(product, onAdded)` matches the existing hook signature (`useProductBuilder.ts:14`). `ProductQuickModal` accepts only `{ product }` (Tasks 3, 4 agree). `router.back()` semantics match across Task 3 and Task 4.

No issues found.
