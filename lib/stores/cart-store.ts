/**
 * Cart store — server-authoritative (Laravel basket) + Zustand for UI
 * + optimistic updates.
 *
 * Architecture (research-backed Q1 2026 best practice):
 *   - Zustand = single source of truth for what the UI renders
 *   - TanStack Query mutations (in Wave 3.2 hooks) own the network call,
 *     scoped per-line for serial execution + automatic offline pause
 *   - On mutate: snapshot current `lines`, apply delta locally → instant UI
 *   - On error: rollback to snapshot + toast
 *   - On success: replace store from server response (server is authoritative
 *     about totals, discounts, computed fields)
 *
 * Persisted to localStorage as a CACHE (not source of truth):
 *   - basketId (so we can refetch on next visit)
 *   - lines (so users see their cart instantly on reload)
 *   - updatedAt (for staleness checks)
 *   - schemaVersion (for invalidation on shape changes)
 *
 * Cookie-set basketId always wins on hydration if it disagrees with
 * persisted value (server can rotate basketId on logout / guest-merge).
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

// v2 — wipes any persisted store carrying a decoded numeric basketId from
// pre-fix builds so the hydrator can re-seed from legacy localStorage cleanly.
const SCHEMA_VERSION = 2

export type CartLineModifier = {
  id: number
  name: string
  price: number
}

export type CartLine = {
  id: number
  productId: number
  variantId?: number
  name: string
  qty: number
  price: number
  image?: string
  modifiers?: CartLineModifier[]
  /**
   * Raw lineItem from the backend (kept verbatim) — needed by legacy
   * UI in SmallCartApp / CartApp / OrdersApp / HeaderMiniCartApp which
   * reads nested fields like variant.product.attribute_data.name[ch][locale],
   * variant.product.assets, child[0].variant.product.assets etc.
   * Trim aggressively in a future pass once those JSX blocks are
   * rewritten to consume the slim shape directly.
   */
  _raw?: any
}

type CartState = {
  schemaVersion: number
  basketId: string | null
  lines: CartLine[]
  updatedAt: number
  hasHydrated: boolean
}

type CartActions = {
  /** Replace whole cart from a fresh server response (hydration / mutation success). */
  setFromServer: (basketId: string | null, lines: CartLine[]) => void

  /** Set basketId only (e.g. when cookie changes after login). */
  setBasketId: (id: string | null) => void

  /** Optimistic add. Returns previous lines for rollback. */
  optimisticAdd: (line: CartLine) => CartLine[]

  /** Optimistic qty change. Returns previous lines for rollback. */
  optimisticUpdateQty: (lineId: number, qty: number) => CartLine[]

  /** Optimistic remove. Returns previous lines for rollback. */
  optimisticRemove: (lineId: number) => CartLine[]

  /** Restore from snapshot after a failed mutation. */
  rollback: (snapshot: CartLine[]) => void

  /** Wipe everything (logout, manual clear). */
  clear: () => void

  /** Mark hydration complete (called by persist middleware). */
  setHasHydrated: (v: boolean) => void
}

export type CartStore = CartState & CartActions

const INITIAL: CartState = {
  schemaVersion: SCHEMA_VERSION,
  basketId: null,
  lines: [],
  updatedAt: 0,
  hasHydrated: false,
}

export const useCartStore = create<CartStore>()(
  persist(
    immer((set, get) => ({
      ...INITIAL,

      setFromServer: (basketId, lines) =>
        set((s) => {
          s.basketId = basketId
          s.lines = lines
          s.updatedAt = Date.now()
        }),

      setBasketId: (id) =>
        set((s) => {
          s.basketId = id
        }),

      optimisticAdd: (line) => {
        const snapshot = get().lines
        set((s) => {
          const existing = s.lines.find(
            (l) => l.id === line.id || l.variantId === line.variantId
          )
          if (existing) {
            existing.qty += line.qty
            // Mirror qty into _raw so legacy JSX (which reads
            // lineItem.quantity / lineItem.total from the raw shape)
            // updates instantly without waiting for the server response.
            if (existing._raw) {
              existing._raw.quantity = existing.qty
              const unit =
                Number(existing._raw.unit_price) ||
                Number(existing.price) ||
                0
              if (unit > 0) existing._raw.total = unit * existing.qty
            }
          } else {
            s.lines.push(line)
          }
          s.updatedAt = Date.now()
        })
        return snapshot
      },

      optimisticUpdateQty: (lineId, qty) => {
        const snapshot = get().lines
        set((s) => {
          if (qty <= 0) {
            s.lines = s.lines.filter((l) => l.id !== lineId)
          } else {
            const line = s.lines.find((l) => l.id === lineId)
            if (line) {
              line.qty = qty
              if (line._raw) {
                line._raw.quantity = qty
                const unit =
                  Number(line._raw.unit_price) || Number(line.price) || 0
                if (unit > 0) line._raw.total = unit * qty
              }
            }
          }
          s.updatedAt = Date.now()
        })
        return snapshot
      },

      optimisticRemove: (lineId) => {
        const snapshot = get().lines
        set((s) => {
          s.lines = s.lines.filter((l) => l.id !== lineId)
          s.updatedAt = Date.now()
        })
        return snapshot
      },

      rollback: (snapshot) =>
        set((s) => {
          s.lines = snapshot
          s.updatedAt = Date.now()
        }),

      clear: () =>
        set((s) => {
          s.basketId = null
          s.lines = []
          s.updatedAt = Date.now()
        }),

      setHasHydrated: (v) =>
        set((s) => {
          s.hasHydrated = v
        }),
    })),
    {
      name: 'chopar-cart-v1',
      version: SCHEMA_VERSION,
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? window.localStorage : (undefined as any)
      ),
      partialize: (s) => ({
        schemaVersion: s.schemaVersion,
        basketId: s.basketId,
        lines: s.lines,
        updatedAt: s.updatedAt,
      }),
      // Wipe on schema bump to avoid corrupted shapes from older versions.
      migrate: (state: any, version) => {
        if (version !== SCHEMA_VERSION) {
          return { ...INITIAL }
        }
        return state
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)

// Selectors — components subscribe via these to avoid full-store re-renders.
export const cartSelectors = {
  count: (s: CartStore) =>
    s.lines.reduce((sum, l) => sum + l.qty, 0),
  total: (s: CartStore) =>
    s.lines.reduce((sum, l) => {
      const modPrice = (l.modifiers || []).reduce((a, m) => a + m.price, 0)
      return sum + (l.price + modPrice) * l.qty
    }, 0),
  isEmpty: (s: CartStore) => s.lines.length === 0,
  basketId: (s: CartStore) => s.basketId,
  lines: (s: CartStore) => s.lines,
  hasHydrated: (s: CartStore) => s.hasHydrated,
}
