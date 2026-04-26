'use client'

/**
 * Bridge component: subscribes to backend basket via TanStack Query and
 * mirrors result into the Zustand cart-store. Replaces the old SWR-based
 * useCart() bridge with a direct fetch.
 *
 * On mount:
 * 1. Read basketId from Zustand (already rehydrated from localStorage by
 *    persist middleware on the client).
 * 2. If basketId exists → fetch /api/baskets/:basketId (with optional
 *    ?delivery_type=pickup), sync result into useCartStore.
 * 3. Re-runs whenever basketId or locationData.deliveryType changes.
 *
 * Mutation hooks in lib/hooks/useCartMutations.ts also call setFromServer
 * directly on success, so this hook is mainly for first-load + post-login
 * hydration + tab-focus refresh.
 */

import { FC, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useCartStore } from '../../lib/stores/cart-store'
import { useLocationStore } from '../../lib/stores/location-store'
import {
  adaptServerCartToLines,
  pickBasketIdFromCart,
} from '../../lib/data/cart-adapter'

const webAddress = process.env.NEXT_PUBLIC_API_URL
axios.defaults.withCredentials = true

async function fetchBasket(
  basketId: string,
  deliveryType?: string | null
): Promise<any | null> {
  if (!basketId) return null
  const qs =
    deliveryType === 'pickup' ? '?delivery_type=pickup' : ''
  try {
    const { data } = await axios.get(
      `${webAddress}/api/baskets/${basketId}${qs}`,
      { withCredentials: true }
    )
    return data
  } catch {
    return null
  }
}

const CartHydrator: FC = () => {
  const persistedBasketId = useCartStore((s) => s.basketId)
  const hasHydrated = useCartStore((s) => s.hasHydrated)
  const locationData = useLocationStore((s) => s.locationData)
  const deliveryType = locationData?.deliveryType ?? null

  // Honour legacy localStorage `basketId` for users with a session that
  // predates Zustand persist (one-time bridge).
  useEffect(() => {
    if (!hasHydrated) return
    if (persistedBasketId) return
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem('basketId')
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (parsed) useCartStore.getState().setBasketId(String(parsed))
    } catch {}
  }, [hasHydrated, persistedBasketId])

  const { data } = useQuery({
    queryKey: ['cart', persistedBasketId, deliveryType],
    queryFn: () => fetchBasket(persistedBasketId as string, deliveryType),
    enabled: hasHydrated && !!persistedBasketId,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  })

  useEffect(() => {
    if (!data) return
    const lines = adaptServerCartToLines(data)
    const basketId = pickBasketIdFromCart(data) || persistedBasketId
    useCartStore.getState().setFromServer(basketId ?? null, lines)
    if (basketId) {
      try {
        localStorage.setItem('basketId', JSON.stringify(basketId))
      } catch {}
    }
  }, [data, persistedBasketId])

  return null
}

export default CartHydrator
