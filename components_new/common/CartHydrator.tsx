'use client'

/**
 * Bridge component: subscribes to the legacy SWR-backed useCart() and
 * mirrors the result into the Zustand cart-store.
 *
 * This lets new components read from the Zustand store (with selectors,
 * optimistic helpers, persist) while existing components keep working
 * unchanged. Mount once in LayoutWrapper.
 *
 * Once all consumers migrate to useCartStore, useCart() can be deleted
 * and this hydrator can fetch directly from /api/baskets/:id (and SWR
 * + framework/cart can be removed entirely).
 */

import { FC, useEffect, useMemo } from 'react'
import { useCart } from '@framework/cart'
import { useUI } from '@components/ui/context'
import { useCartStore } from '../../lib/stores/cart-store'
import {
  adaptServerCartToLines,
  pickBasketIdFromCart,
} from '../../lib/data/cart-adapter'

const CartHydrator: FC = () => {
  // Read basketId from store (synced from legacy storage by useCart input)
  const persistedBasketId = useCartStore((s) => s.basketId)
  // locationData still lives in legacy ManagedUIContext — read from there
  // until Wave 3.2's location store migration. CartHydrator only needs it
  // so the legacy useCart() can append `?delivery_type=pickup` correctly.
  const { locationData } = useUI() as any

  // Compute basketId for legacy useCart — prefer persisted (Zustand, from
  // localStorage on mount) and fall back to legacy localStorage `basketId`
  // key during migration.
  const cartId = useMemo(() => {
    if (persistedBasketId) return persistedBasketId
    if (typeof window === 'undefined') return null
    try {
      const raw = localStorage.getItem('basketId')
      if (!raw) return null
      const parsed = JSON.parse(raw)
      return parsed ? String(parsed) : null
    } catch {
      return null
    }
  }, [persistedBasketId])

  const { data: cartData } = useCart({
    cartId: cartId || undefined,
    locationData: locationData || undefined,
  })

  // Mirror legacy cart payload into Zustand whenever it changes.
  useEffect(() => {
    if (!cartData) return
    const lines = adaptServerCartToLines(cartData)
    const basketId = pickBasketIdFromCart(cartData)
    useCartStore.getState().setFromServer(basketId, lines)
  }, [cartData])

  return null
}

export default CartHydrator
