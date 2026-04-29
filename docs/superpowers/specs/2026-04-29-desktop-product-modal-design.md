# Desktop product quick-view modal — design spec

**Date:** 2026-04-29
**Status:** Approved (pending final review)
**Owner:** Davron / Claude

## Goal

On desktop, clicking a product card from the city catalog (`/[city]`) opens
the product as a centered overlay modal instead of full-page navigation to
`/[city]/product/[id]`. Users can browse, change size, toggle modifiers and
add to cart without losing scroll position in the catalog. Mobile keeps the
existing vaul drawer; both surfaces share the same product-builder logic.

The full product page MUST keep working unchanged for direct visits, refresh,
shared links and Google Search — both for SEO (existing JSON-LD + microdata)
and as a graceful fallback when intercepting routes do not apply.

## Non-goals

- Prev/next product navigation inside the modal (out of scope).
- Image gallery / zoom (each product has a single image).
- Persisting modal state across hard refresh — the URL already deep-links to
  the full page, which is the correct behavior on refresh.
- Touching `ProductDrawerApp` or its history-back hack.
- Modifying the schema/microdata on `/[city]/product/[id]` (already fixed
  earlier this week).

## Architecture — Next.js parallel + intercepting routes

```
app/[city]/
├── layout.tsx                  MOD: add `modal` parallel slot
├── page.tsx                    unchanged (catalog + MenuJsonLd)
├── @modal/
│   ├── default.tsx             NEW: returns null (modal closed state)
│   └── (.)product/
│       └── [id]/
│           └── page.tsx        NEW: intercepted route, renders ProductQuickModal
└── product/[id]/
    └── page.tsx                unchanged (full ProductDetailApp on direct hit)
```

**Routing semantics:**

- User on `/[city]` clicks the desktop `<Link href="/{city}/product/{id}">`
  in `ProductItemNewApp`. Next.js intercepts via `(.)product/[id]` and
  renders the modal slot above the still-mounted catalog. URL becomes
  `/[city]/product/[id]` while `page.tsx` of the catalog remains in DOM.
- User refreshes, opens the URL directly, shares the link, or arrives from
  Google: no interception (the user is not coming from `/[city]`), so the
  request resolves to `app/[city]/product/[id]/page.tsx` — the existing full
  `ProductDetailApp` flow with all its microdata and JSON-LD intact.
- Closing the modal (any channel) issues `router.back()`. The URL returns to
  `/[city]`, the modal slot reverts to `@modal/default.tsx` (null), the
  modal unmounts. Browser back / mouse swipe-back work for free — no
  manual `pushState` / `popstate` plumbing.
- Mobile path is unchanged. The mobile branch of `ProductItemNewApp` uses a
  `<button onClick={openProductDrawer}>`, never a `<Link>`, so intercepting
  routes do not apply. `ProductDrawerApp` keeps its current vaul + history
  back handling.

## Components

```
components_new/product/
├── ProductDetailApp.tsx        MOD: thin wrapper (container + back) around content
├── ProductDetailContent.tsx    NEW: shared body — image left, controls right
├── ProductQuickModal.tsx       NEW: HUI Dialog wrapper around ProductDetailContent
├── ProductDrawerApp.tsx        unchanged
└── useProductBuilder.ts        unchanged
```

**`ProductDetailContent`** — extracts the existing `ProductDetailApp` body
(image column + name/desc/sizes/modifiers/price/qty column). Accepts:

```ts
type Props = {
  product: any
  onAdded?: () => void
}
```

Internally calls `useProductBuilder(product, onAdded)`. No knowledge of
"page vs modal" — purely presentational + builder-bound. Single source of
truth for the layout that both `/[city]/product/[id]` and the modal use.

**`ProductDetailApp`** shrinks to:

```tsx
<div className="container mx-auto py-4 md:py-6 px-3 md:px-0">
  <BackButton />
  <ProductDetailContent product={product} />
</div>
```

**`ProductQuickModal`** — `'use client'`. Built on `@headlessui/react@^2`'s
`<Dialog>` (focus trap, ESC, scroll lock, `inert` background out of the box):

- backdrop: `bg-black/60` with `Transition` fade 200ms
- panel: `max-w-[960px] w-[90vw] max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl`
- panel `Transition`: scale-95 → 100 + fade, 200ms `ease-out` (Headless UI
  honors `prefers-reduced-motion` automatically)
- close button (top-right, 44×44 tap target, `aria-label="Закрыть"`)
- body: `<ProductDetailContent product={product} onAdded={handleAdded} />`
- `handleAdded`: `router.back()` + `toast.success(t('Товар добавлен в корзину'))`
- `onClose` of `<Dialog>`: `router.back()` (handles Esc + backdrop click)

**`app/[city]/@modal/(.)product/[id]/page.tsx`** — server component:

```tsx
export default async function Page({
  params,
}: {
  params: Promise<{ city: string; id: string }>
}) {
  const { city, id } = await params
  const product = await fetchProductById(id, city)
  if (!product) return null
  return <ProductQuickModal product={product} />
}
```

`fetchProductById` is the same already-cached server function used by the
full page, so the modal benefits from the same Next.js cache (revalidate
600s, tags ['products']).

**`app/[city]/@modal/default.tsx`**:

```tsx
export default function Default() {
  return null
}
```

**`app/[city]/layout.tsx`** — accept the `modal` slot prop and render it as
a sibling of `children`:

```tsx
export default function CityLayout({
  children,
  modal,
}: {
  children: ReactNode
  modal: ReactNode
}) {
  return (
    <>
      {children}
      {modal}
    </>
  )
}
```

## UX details

**Layout (≥1024px):**

```
┌──────────────────────────────────────── × ┐
│ ┌─────────────┐                            │
│ │             │  Название (h2 / DialogTitle)
│ │  фото       │  Описание (без clamp)      │
│ │  480×480    │                            │
│ │             │  [25 см] [30 см] [35] [40] │
│ │             │                            │
│ └─────────────┘  Добавить в пиццу:         │
│                  [халап] [сос] [сыр.борт]  │
│                                            │
│  98 000 сум          [    В корзину    ]   │
└────────────────────────────────────────────┘
```

- Outer panel grid: `grid grid-cols-1 md:grid-cols-2 gap-8 p-8`. On a
  pinched desktop window <`md`, falls back to a single column with image
  on top — keeps the modal usable.
- Right column uses `flex flex-col`. The price + cart action sit at the
  bottom (`mt-auto`) so the CTA is always anchored, even when the modifier
  grid is short.
- The catalog behind is NOT scroll-locked visually changed; HUI's scroll
  lock just freezes `<body>` scroll position.

**Open animation:** 200ms ease-out: backdrop opacity 0→1, panel
scale 95%→100% + opacity 0→1.

**Close animation:** symmetric reverse, 150ms.

**Initial focus:** the close (×) button. Setting it explicitly via HUI
`initialFocus` ref so screen readers and keyboard users don't accidentally
land inside the modifier grid.

**Toast on add:** `toast.success(t('Товар добавлен в корзину'))` from the
toast lib already used by `ProductItemNewApp` (`toast.error` line 652).
Position: project default (top-right). Duration 2.5s.

**Add error path:** if `addMutation` rejects (network / 5xx), the existing
`onError` toast in `useCartMutations` fires AND the modal stays open
(because `onAdded` only runs on success). User can retry without rebuilding
their selection.

## Accessibility

- `role="dialog"`, `aria-modal="true"` — Headless UI auto.
- `<DialogTitle>` set to localized product name (h2 visually). HUI wires
  `aria-labelledby` automatically.
- `<DialogDescription>` (optional) = first sentence of `localizedDesc`,
  or omitted if empty.
- Background `inert` while open — clicks/tab/aria-hidden auto from HUI v2.
- Scroll lock on `<body>` — auto from HUI.
- ESC closes — auto from HUI.
- Close button has `aria-label="Закрыть"` (i18n key already exists in the
  project — verify during implementation).
- `prefers-reduced-motion`: HUI `Transition` skips animation.

## SEO impact

None.

- `/[city]` keeps `MenuJsonLd` and `ProductItemNewApp` microdata exactly as
  they are post the 2026-04-28 fix (price/priceCurrency/availability).
- `/[city]/product/[id]` keeps `ProductJsonLd` + `BreadcrumbsJsonLd` exactly
  as they are. The modal does not duplicate them — Google never sees the
  intercepted slot rendered in isolation; if a bot lands on
  `/[city]/product/[id]` it always gets the full page.
- The modal route is purely client-interaction. No new sitemap entries, no
  duplicate JSON-LD, no canonical drift.

## Edge cases

1. **Direct URL `/kokand/product/123`** (refresh, share, Google) — no
   interception, full `ProductDetailApp` page renders. SEO/JSON-LD/microdata
   preserved.
2. **Header navigation (other city, cart) while modal is open** — standard
   navigation, the entire `[city]/layout.tsx` re-renders with new params,
   the modal slot resets. Clean unmount.
3. **Stop-list product** — desktop card today has `<Link>` regardless of
   `isProductInStop`. Mobile branch already shows a toast and refuses to
   open the drawer. We replicate this on desktop: if the modal opens and
   `isProductInStop` is true, `ProductQuickModal` shows a disabled "Товар
   временно недоступен" state in the CTA region (no CTA, no toast inside).
   Pre-emptively, the desktop `<Link>` itself can be replaced with a
   `<button>` for stop-list items in a future pass — out of scope here.
4. **Mobile viewport with desktop view forced (DevTools)** — desktop branch
   `<Link>` still triggers intercepting routes. Modal layout collapses to
   one column thanks to `grid-cols-1 md:grid-cols-2`. Acceptable.
5. **Double-click between two cards** — clicking a second card while a modal
   is open triggers another `<Link>` navigation. Next.js handles it as a
   normal route change; the existing modal unmounts and the new one mounts.
   No race condition.
6. **prefers-reduced-motion** — HUI `Transition` skips. Confirmed.
7. **Focus restore on close** — HUI v2 returns focus to the originating
   `<Link>`. If the user navigated via keyboard, focus returns to the same
   card, which is correct.

## Open question (non-blocking)

In the current `ProductItemNewApp.tsx` desktop branch, the click-to-cart
button is INSIDE the same card as the `<Link>`. We need to ensure clicking
"В корзину" does NOT bubble to the link, otherwise the modal will open even
when the user wanted a single-step add. The existing code already calls
`e.stopPropagation()` on the variant size buttons (line 855); we'll verify
the same is in place for the inline "В корзину" CTA during implementation
and add `stopPropagation` if missing.

## Out of scope

- Carousel / prev-next navigation inside modal.
- Image zoom or multi-image galleries.
- Saving last-opened product to URL across sessions.
- Replacing `ProductDrawerApp` with the same intercepting routes pattern
  (would unify mobile + desktop, but explicitly user-rejected: mobile keeps
  current drawer behavior).
- Removing the now-thin wrapper `ProductDetailApp` — keep it; it's the SSR
  entry for `/[city]/product/[id]`.

## Files touched

| File | Status |
|---|---|
| `app/[city]/layout.tsx` | modify (add `modal` slot) |
| `app/[city]/@modal/default.tsx` | create |
| `app/[city]/@modal/(.)product/[id]/page.tsx` | create |
| `components_new/product/ProductDetailApp.tsx` | refactor (extract body) |
| `components_new/product/ProductDetailContent.tsx` | create |
| `components_new/product/ProductQuickModal.tsx` | create |

No backend changes. No env / config changes.

## Verification plan

1. **Catalog click → modal opens**: navigate to `/kokand`, click a desktop
   card, modal appears, URL becomes `/kokand/product/<id>`, catalog scroll
   position preserved.
2. **Esc / backdrop / × / browser back → modal closes**, URL returns to
   `/kokand`. All four channels exercised.
3. **Refresh on `/kokand/product/<id>` → full ProductDetailApp page**, not
   modal. Microdata + JSON-LD intact (curl + Rich Results test).
4. **Direct visit to `/kokand/product/<id>`** (new tab) → full page.
5. **Add to cart from modal**: success → modal closes + toast appears + cart
   line in header increments. Error path: modal stays open.
6. **Mobile (real iOS Safari + Android Chrome)**: clicking card opens vaul
   drawer (not modal). Hardware/system back closes drawer (existing flow).
7. **Keyboard a11y**: Tab cycles inside modal only, ESC closes, focus
   returns to originating card.
8. **prefers-reduced-motion** OS setting: modal opens without scale/fade.
9. **Stop-list product**: modal opens with disabled CTA region.
10. **Lighthouse a11y on `/kokand` with modal open**: no new violations.
