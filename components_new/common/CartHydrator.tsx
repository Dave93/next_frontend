'use client'

/**
 * Bridge: subscribes to backend basket via TanStack Query and mirrors
 * result into the Zustand cart-store. No SWR / @framework/cart dependency.
 *
 * - Reads basketId from Zustand (already rehydrated from localStorage by
 *   persist middleware) with legacy localStorage `basketId` fallback.
 * - GET /api/baskets/:basketId (with optional ?delivery_type=pickup).
 * - On success: adapts response into slim CartLine[] (preserving _raw)
 *   and writes to useCartStore.
 * - Mutation hooks in lib/hooks/useCartMutations.ts also call setFromServer
 *   directly; this hook is for first load + post-login + tab-focus refresh.
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
  const qs = deliveryType === 'pickup' ? '?delivery_type=pickup' : ''
  try {
    const { data } = await axios.get(
      `${webAddress}/api/baskets/${basketId}${qs}`,
      { withCredentials: true }
    )
    // Normalize backend wrapper shape ({ data: {...} } or {...}).
    const basket = data?.data || data
    if (!basket?.id) return null
    return {
      id: basket.id,
      lineItems: basket.lines || basket.lineItems || [],
      subtotalPrice: basket.sub_total ?? basket.subtotalPrice ?? 0,
      totalPrice: basket.total ?? basket.totalPrice ?? 0,
      discountTotal: basket.discount_total ?? basket.discountTotal ?? 0,
      discountValue: basket.discount_value ?? basket.discountValue ?? 0,
    }
  } catch {
    return null
  }
}

const CartHydrator: FC = () => {
  const persistedBasketId = useCartStore((s) => s.basketId)
  const hasHydrated = useCartStore((s) => s.hasHydrated)
  const locationData = useLocationStore((s) => s.locationData)
  const deliveryType = locationData?.deliveryType ?? null

  // One-time legacy localStorage `basketId` bridge for sessions that
  // predate Zustand persist.
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
