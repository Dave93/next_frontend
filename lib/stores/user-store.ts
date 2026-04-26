/**
 * User store — auth + profile. Persisted to localStorage so the user
 * doesn't need to re-fetch /api/me on every page load (the OTP token
 * itself remains in `opt_token` cookie for backend auth).
 *
 * On logout: clears user store but does NOT clear cart-store. The cart
 * survives logout because it lives by basketId, not user identity.
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const SCHEMA_VERSION = 1

export type User = {
  id: number
  name?: string
  phone?: string
  email?: string
  birth?: string | null
  // Bonus / loyalty
  bonus?: number
  // Other backend fields
  [key: string]: any
}

type UserState = {
  schemaVersion: number
  user: User | null
  hasHydrated: boolean
}

type UserActions = {
  setUser: (user: User | null) => void
  patchUser: (patch: Partial<User>) => void
  logout: () => void
  setHasHydrated: (v: boolean) => void
}

export type UserStore = UserState & UserActions

const INITIAL: UserState = {
  schemaVersion: SCHEMA_VERSION,
  user: null,
  hasHydrated: false,
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      ...INITIAL,

      setUser: (user) => set({ user }),

      patchUser: (patch) => {
        const cur = get().user
        if (!cur) return
        set({ user: { ...cur, ...patch } })
      },

      logout: () => set({ user: null }),

      setHasHydrated: (v) => set({ hasHydrated: v }),
    }),
    {
      name: 'chopar-user-v1',
      version: SCHEMA_VERSION,
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? window.localStorage : (undefined as any)
      ),
      partialize: (s) => ({
        schemaVersion: s.schemaVersion,
        user: s.user,
      }),
      migrate: (state: any, version) => {
        if (version !== SCHEMA_VERSION) return { ...INITIAL }
        return state
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)

export const userSelectors = {
  user: (s: UserStore) => s.user,
  isLoggedIn: (s: UserStore) => s.user !== null,
  hasHydrated: (s: UserStore) => s.hasHydrated,
}
