'use client'

/**
 * Cart mutation hooks with optimistic updates (TanStack Query).
 *
 * Pattern (per Q1 2026 best practice):
 *   onMutate    → snapshot from store, apply optimistic delta
 *   onError     → rollback to snapshot, toast error
 *   onSuccess   → server response replaces store via setFromServer
 *   scope.id    → mutations with same id run serially per tab
 *
 * Network goes through axios + setCredentials (CSRF token) like the
 * legacy useCart() flow. After success, we also call SWR's globalMutate
 * with the legacy `['baskets/', cartId, ...]` key so legacy consumers
 * (still reading via useCart()) get refreshed.
 */

import { useMutation } from '@tanstack/react-query'
import { mutate as swrGlobalMutate } from 'swr'
import { toast } from 'sonner'
import axios from 'axios'
import Cookies from 'js-cookie'
import Hashids from 'hashids'
import { useCartStore, type CartLine } from '../stores/cart-store'
import {
  adaptServerCartToLines,
  pickBasketIdFromCart,
} from '../data/cart-adapter'

const webAddress = process.env.NEXT_PUBLIC_API_URL
axios.defaults.withCredentials = true

const hashids = new Hashids(
  'basket',
  15,
  'abcdefghijklmnopqrstuvwxyz1234567890'
)

async function ensureCsrf(): Promise<void> {
  let csrf = Cookies.get('X-XSRF-TOKEN')
  if (!csrf) {
    const csrfReq = await axios(`${webAddress}/api/keldi`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    })
    const { data: res } = csrfReq
    csrf = Buffer.from(res.result, 'base64').toString('ascii')
    const inTen = new Date(new Date().getTime() + 10 * 60 * 1000)
    Cookies.set('X-XSRF-TOKEN', csrf, { expires: inTen })
  }
  axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
  axios.defaults.headers.common['X-CSRF-TOKEN'] = csrf
  axios.defaults.headers.common['XCSRF-TOKEN'] = csrf
}

function authHeader(): Record<string, string> {
  const otpToken = Cookies.get('opt_token')
  return otpToken ? { Authorization: `Bearer ${otpToken}` } : {}
}

function syncStore(cartData: any) {
  if (!cartData) return
  const lines = adaptServerCartToLines(cartData)
  const basketId = pickBasketIdFromCart(cartData)
  useCartStore.getState().setFromServer(basketId, lines)
  // Refresh legacy SWR cache so non-migrated consumers see new data too.
  // SWR keys here come from framework/local/cart/use-cart fetcher arguments.
  try {
    swrGlobalMutate(
      (key: any) =>
        Array.isArray(key) && typeof key[0] === 'string' && key[0].startsWith('baskets/'),
      undefined,
      { revalidate: true }
    )
  } catch {}
}

// =====================================================================
// useAddToCart — POST /api/baskets-lines
// =====================================================================

type AddInput = {
  variantId: number
  optimisticLine: CartLine
  modifiers?: { id: number }[]
}

export function useAddToCart() {
  return useMutation({
    scope: { id: 'cart' },
    mutationFn: async ({ variantId, modifiers }: AddInput) => {
      await ensureCsrf()
      const basketId = useCartStore.getState().basketId
      const { data } = await axios.post(
        `${webAddress}/api/baskets-lines`,
        {
          variants: [
            {
              id: variantId,
              quantity: 1,
              modifiers: modifiers || [],
            },
          ],
          basket_id: basketId,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            ...authHeader(),
          },
          withCredentials: true,
        }
      )
      if (data?.id) {
        // Mirror legacy localStorage key so legacy consumers still find it
        try {
          localStorage.setItem('basketId', JSON.stringify(data.id))
        } catch {}
      }
      return data
    },
    onMutate: ({ optimisticLine }) => {
      const snapshot = useCartStore.getState().optimisticAdd(optimisticLine)
      return { snapshot }
    },
    onError: (err: any, _vars, ctx) => {
      if (ctx) useCartStore.getState().rollback(ctx.snapshot)
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        'Не удалось добавить в корзину'
      toast.error(String(msg))
    },
    onSuccess: (cartData) => syncStore(cartData),
  })
}

// =====================================================================
// useUpdateCartQty — PUT /api/v1/basket-lines/:id/{add|remove}
// =====================================================================

type QtyInput = {
  lineId: number
  delta: 1 | -1
  /** Current qty before delta — needed to decide between PUT remove vs DELETE. */
  currentQty: number
}

export function useUpdateCartQty() {
  return useMutation({
    scope: { id: 'cart' },
    mutationFn: async ({ lineId, delta, currentQty }: QtyInput) => {
      await ensureCsrf()
      const lineIdEncoded = hashids.encode(lineId)
      if (delta > 0) {
        return axios
          .post(
            `${webAddress}/api/v1/basket-lines/${lineIdEncoded}/add`,
            { quantity: 1 },
            { headers: authHeader(), withCredentials: true }
          )
          .then((r) => r.data)
      }
      if (currentQty <= 1) {
        return axios
          .delete(`${webAddress}/api/basket-lines/${lineIdEncoded}`, {
            headers: authHeader(),
            withCredentials: true,
          })
          .then((r) => r.data)
      }
      return axios
        .put(
          `${webAddress}/api/v1/basket-lines/${lineIdEncoded}/remove`,
          { quantity: 1 },
          { headers: authHeader(), withCredentials: true }
        )
        .then((r) => r.data)
    },
    onMutate: ({ lineId, delta, currentQty }) => {
      const newQty = Math.max(0, currentQty + delta)
      const snapshot = useCartStore
        .getState()
        .optimisticUpdateQty(lineId, newQty)
      return { snapshot }
    },
    onError: (err: any, _vars, ctx) => {
      if (ctx) useCartStore.getState().rollback(ctx.snapshot)
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        'Не удалось обновить корзину'
      toast.error(String(msg))
    },
    onSuccess: (cartData) => syncStore(cartData),
  })
}

// =====================================================================
// useRemoveCartLine — DELETE /api/basket-lines/:id
// =====================================================================

type RemoveInput = { lineId: number }

export function useRemoveCartLine() {
  return useMutation({
    scope: { id: 'cart' },
    mutationFn: async ({ lineId }: RemoveInput) => {
      await ensureCsrf()
      const lineIdEncoded = hashids.encode(lineId)
      const { data } = await axios.delete(
        `${webAddress}/api/basket-lines/${lineIdEncoded}`,
        { headers: authHeader(), withCredentials: true }
      )
      return data
    },
    onMutate: ({ lineId }) => {
      const snapshot = useCartStore.getState().optimisticRemove(lineId)
      return { snapshot }
    },
    onError: (err: any, _vars, ctx) => {
      if (ctx) useCartStore.getState().rollback(ctx.snapshot)
      toast.error('Не удалось удалить из корзины')
    },
    onSuccess: (cartData) => syncStore(cartData),
  })
}
