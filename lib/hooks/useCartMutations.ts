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
  if (!cartData) {
    console.log('[cart] syncStore: empty cartData, skip')
    return
  }
  // Some endpoints return { data: {...} } wrapper, others return body directly.
  const body = cartData?.data?.id ? cartData.data : cartData
  // Preserve encoded_id alongside id so pickBasketIdFromCart can pick the
  // hashid-encoded form (Laravel rejects decoded numeric basket ids).
  const adapted = body?.lines
    ? { id: body.id, encoded_id: body.encoded_id, lineItems: body.lines }
    : body
  const lines = adaptServerCartToLines(adapted)
  const basketId = pickBasketIdFromCart(adapted)
  console.log('[cart] syncStore', {
    serverDecodedId: body?.id,
    serverEncodedId: body?.encoded_id,
    pickedBasketId: basketId,
    lineCount: lines.length,
  })
  useCartStore.getState().setFromServer(basketId, lines)
  if (basketId && typeof window !== 'undefined') {
    try {
      // Legacy code (BonusStartApp, OrdersApp, etc.) reads this with a raw
      // localStorage.getItem and sends it straight to the API — no JSON.parse.
      // So we must store the raw string, not a JSON-quoted string.
      localStorage.setItem('basketId', String(basketId))
      console.log('[cart] syncStore wrote localStorage.basketId =', basketId)
    } catch (e) {
      console.warn('[cart] syncStore localStorage write failed', e)
    }
  }
}

function isLikelyEncodedHashid(v: string | null | undefined): v is string {
  return !!v && !/^\d+$/.test(v)
}

function readBasketIdFromLocalStorage(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('basketId')
    if (!raw) return null
    // Tolerate both raw "encoded" and legacy JSON.stringified '"encoded"'.
    if (raw.startsWith('"')) {
      try {
        const parsed = JSON.parse(raw)
        return parsed ? String(parsed) : null
      } catch {
        return raw.replace(/^"|"$/g, '') || null
      }
    }
    return raw
  } catch {
    return null
  }
}

// =====================================================================
// useAddToCart — POST /api/baskets-lines (existing basket)
//                 POST /api/baskets       (no basket yet)
// Accepts the full `variants` payload so callers handle modifierProduct,
// "three"-pizza, additionalSale, etc. without the hook needing to care.
// =====================================================================

type AddVariantInput = {
  id: number
  quantity?: number
  modifiers?: Array<{ id: number }> | null
  three?: number[]
  additionalSale?: boolean
}

type AddInput = {
  variants: AddVariantInput[]
  optimisticLine: CartLine
  /** locationData.deliveryType — adds ?delivery_type=pickup */
  deliveryType?: string | null
}

export function useAddToCart() {
  return useMutation({
    scope: { id: 'cart' },
    mutationFn: async ({ variants, deliveryType }: AddInput) => {
      await ensureCsrf()
      // Laravel rejects decoded numeric basket ids; only encoded hashids are
      // accepted. Reject any candidate that looks like raw digits and fall
      // through to creating a fresh basket via POST /api/baskets.
      const fromLocal = readBasketIdFromLocalStorage()
      const storeId = useCartStore.getState().basketId
      const basketId =
        (isLikelyEncodedHashid(fromLocal) ? fromLocal : null) ||
        (isLikelyEncodedHashid(storeId) ? storeId : null)
      const qs = deliveryType === 'pickup' ? '?delivery_type=pickup' : ''
      const headers = {
        'Content-Type': 'application/json',
        ...authHeader(),
      }
      console.log('[cart] add: candidates', {
        fromLocal,
        storeId,
        chosenBasketId: basketId,
        deliveryType,
        variantIds: variants.map((v) => v.id),
        endpoint: basketId ? '/api/baskets-lines' : '/api/baskets',
      })
      if (basketId) {
        const { data } = await axios.post(
          `${webAddress}/api/baskets-lines${qs}`,
          { basket_id: basketId, variants },
          { headers, withCredentials: true }
        )
        console.log('[cart] add: appended to existing basket', {
          basket_id_sent: basketId,
          serverResponseId: data?.data?.id,
          serverEncodedId: data?.data?.encoded_id,
        })
        return data
      }
      const { data } = await axios.post(
        `${webAddress}/api/baskets${qs}`,
        { variants },
        { headers, withCredentials: true }
      )
      const encoded = data?.data?.encoded_id || data?.encoded_id
      console.log('[cart] add: created NEW basket', {
        serverDecodedId: data?.data?.id,
        serverEncodedId: encoded,
      })
      if (encoded) {
        // Write to BOTH the Zustand store and localStorage immediately so
        // any subsequent click reads the encoded id even before onSuccess
        // / syncStore fires.
        useCartStore.getState().setBasketId(String(encoded))
        try {
          localStorage.setItem('basketId', String(encoded))
          console.log(
            '[cart] add: wrote basketId into store + localStorage =',
            encoded
          )
        } catch (e) {
          console.warn('[cart] add: localStorage write failed', e)
        }
      } else {
        console.warn('[cart] add: server returned no encoded_id', data)
      }
      return data
    },
    onMutate: ({ optimisticLine }) => {
      console.log('[cart] add onMutate: optimistic line', {
        id: optimisticLine.id,
        variantId: optimisticLine.variantId,
        productId: optimisticLine.productId,
        name: optimisticLine.name,
      })
      const snapshot = useCartStore.getState().optimisticAdd(optimisticLine)
      return { snapshot }
    },
    onError: (err: any, _vars, ctx) => {
      console.error('[cart] add onError', {
        status: err?.response?.status,
        data: err?.response?.data,
      })
      if (ctx) useCartStore.getState().rollback(ctx.snapshot)
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        'Не удалось добавить в корзину'
      toast.error(String(msg))
    },
    onSuccess: (cartData) => {
      console.log('[cart] add onSuccess')
      syncStore(cartData)
    },
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
