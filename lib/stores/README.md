# Zustand stores

Created in Wave 3.1 of the Next.js 16 redesign. **Not yet wired into the UI** — that's Wave 3.2.

## Architecture

| Store | What it owns | Persisted? | Source of truth |
|---|---|---|---|
| `cart-store` | basketId, lines[], optimistic mutations | yes (cache only) | server (Laravel basket) |
| `ui-store` | modals, drawers, sidebars open/closed | no | local |
| `user-store` | profile data | yes | server (`/api/me`) |
| `location-store` | active city, delivery address, address book | partially (city + address) | mixed |

## Cart store (server-authoritative + optimistic)

The cart **is owned by the backend** (Laravel basket via `basketId`). Zustand is the **UI projection** with optimistic updates layered on top.

### Pattern (to be implemented in Wave 3.2)

```ts
// hooks/useUpdateCartQty.ts
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import axios from 'axios'
import Hashids from 'hashids'
import { useCartStore } from '@/lib/stores'

const hashids = new Hashids('basket', 15, 'abcdefghijklmnopqrstuvwxyz1234567890')

export function useUpdateCartQty() {
  return useMutation({
    scope: { id: 'cart-line' }, // serialize per-cart mutations
    mutationFn: ({ lineId, qty }: { lineId: number; qty: number }) => {
      const encoded = hashids.encode(lineId)
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/baskets/lines/${encoded}`
      return qty <= 0
        ? axios.delete(url, { withCredentials: true }).then(r => r.data)
        : axios.put(url, { quantity: qty }, { withCredentials: true }).then(r => r.data)
    },
    onMutate: ({ lineId, qty }) => {
      // Snapshot + apply optimistic update in one call
      const snapshot = useCartStore.getState().optimisticUpdateQty(lineId, qty)
      return { snapshot }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx) useCartStore.getState().rollback(ctx.snapshot)
      toast.error('Не удалось обновить корзину')
    },
    onSuccess: (server) => {
      // Server response is authoritative — replace whole cart from it
      useCartStore.getState().setFromServer(
        server.basketId ?? null,
        adaptServerLines(server.lineItems ?? [])
      )
    },
  })
}
```

### Hydration on mount (Wave 3.2)

A top-level `<CartHydrator/>` mounted in `app/[city]/LayoutWrapper.tsx`:

```ts
'use client'
import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useCartStore } from '@/lib/stores'

export function CartHydrator() {
  const hasHydrated = useCartStore((s) => s.hasHydrated)
  const basketId = useCartStore((s) => s.basketId)

  useQuery({
    queryKey: ['cart', basketId],
    queryFn: async () => {
      if (!basketId) return null
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/baskets/${basketId}`, {
        credentials: 'include',
      })
      return res.json()
    },
    enabled: hasHydrated && !!basketId,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    select: (data) => {
      if (data) {
        useCartStore.getState().setFromServer(data.basketId, adaptServerLines(data.lineItems))
      }
      return data
    },
  })

  return null
}
```

### Selectors (already provided)

```ts
import { useCartStore, cartSelectors } from '@/lib/stores'

const count = useCartStore(cartSelectors.count)       // re-renders only when count changes
const total = useCartStore(cartSelectors.total)
const lines = useCartStore(cartSelectors.lines)
```

## Anti-patterns to avoid (per research)

1. ❌ Reading from both Zustand AND TanStack Query cache — flicker.
2. ❌ Refetching after every mutation — defeats the optimism.
3. ❌ Optimistically updating totals — server-computed prices include promotions, taxes, delivery thresholds. Show optimistic line qty, mark totals as "calculating…" until server returns.
4. ❌ Persisting optimistic state without schema version — bumped via `SCHEMA_VERSION` constant in each store.
5. ❌ No mutation queue — fixed via `scope: { id: 'cart-line' }` on TanStack Query mutations.
6. ❌ Trusting `basketId` from localStorage over the cookie — when wiring `<CartHydrator/>`, cookie wins.
7. ❌ Hydrating mid-mutation — gate with `mutationCache.getAll().filter(m => m.state.status === 'pending').length === 0`.

## SSR notes

All stores use `createJSONStorage(() => typeof window !== 'undefined' ? window.localStorage : undefined)` so they're SSR-safe — server renders empty initial state, client hydrates from localStorage post-mount, then `<CartHydrator/>` syncs from backend.

The `hasHydrated` flag in cart-store and user-store lets components defer rendering until persisted state is available (avoids "0 items" flash for users who actually have items in their cart).

## What's still TODO in Wave 3.2

1. Create mutation hooks: `useAddToCart`, `useUpdateCartQty`, `useRemoveCartItem`
2. Create `<CartHydrator/>` and mount in `LayoutWrapper`
3. Migrate components to read from stores:
   - `AddToCartButton` (currently uses `useCart()` from `@framework/cart`)
   - `SmallCartApp`, `SmallCartMobileApp`
   - `CartApp`
   - `OrdersApp` (uses `useUI()` for cart/user/location)
   - All `useUI()` consumers (50+)
4. Adapter `adaptServerLines(rawLineItems): CartLine[]` to convert backend response to slim CartLine shape
5. Replace `setUserData` from `useUI` with `useUserStore.setState({ user })` in OTP flow
6. Migrate `setActiveCity` / `setLocationData` from `useUI` to `useLocationStore`
7. Once last `useUI()` import removed, delete `ManagedUIContext`
8. Remove `swr` from `package.json` (was kept because legacy `@framework/cart` used it)
