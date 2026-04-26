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
      // GET /api/baskets/{encoded} response body OMITS encoded_id (only POST
      // endpoints include it). Backfill it from the basketId we just used to
      // make the request so pickBasketIdFromCart doesn't fall through to the
      // decoded numeric basket.id and overwrite the store with a value the
      // write endpoints will reject.
      encoded_id: basket.encoded_id || basketId,
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

  // One-time legacy localStorage `basketId` bridge for sessions that predate
  // Zustand persist. Also self-heals when the persisted store has a decoded
  // numeric id (Laravel write endpoints reject those) but localStorage still
  // has the encoded hashid (or vice-versa). Drops decoded-numeric values from
  // both layers because they cannot succeed against the API anyway.
  useEffect(() => {
    if (!hasHydrated) return
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem('basketId')
      let legacy: string | null = null
      if (raw) {
        if (raw.startsWith('"')) {
          try {
            const parsed = JSON.parse(raw)
            legacy = parsed ? String(parsed) : null
          } catch {
            legacy = raw.replace(/^"|"$/g, '') || null
          }
        } else {
          legacy = raw
        }
      }
      const isDecoded = (v: string | null | undefined) =>
        !!v && /^\d+$/.test(v)
      // Drop a stale decoded id from localStorage so future writes can't
      // pollute the store again.
      if (isDecoded(legacy)) {
        legacy = null
        try {
          localStorage.removeItem('basketId')
        } catch {}
      }
      if (
        legacy &&
        (!persistedBasketId || isDecoded(persistedBasketId))
      ) {
        useCartStore.getState().setBasketId(legacy)
      } else if (!legacy && isDecoded(persistedBasketId)) {
        useCartStore.getState().setBasketId(null)
      }
    } catch {}
  }, [hasHydrated, persistedBasketId])

  const queryBasketId =
    persistedBasketId && /^\d+$/.test(persistedBasketId)
      ? null
      : persistedBasketId
  const { data } = useQuery({
    queryKey: ['cart', queryBasketId, deliveryType],
    queryFn: () => fetchBasket(queryBasketId as string, deliveryType),
    enabled: hasHydrated && !!queryBasketId,
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
        localStorage.setItem('basketId', String(basketId))
      } catch {}
    }
  }, [data, persistedBasketId])

  return null
}

export default CartHydrator
