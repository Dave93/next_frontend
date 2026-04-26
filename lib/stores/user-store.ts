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
import Cookies from 'js-cookie'

const SCHEMA_VERSION = 1

// Mirror legacy ManagedUIContext side effects so removal of the legacy
// reducer doesn't break anything else that still reads `mijoz` from
// localStorage or `opt_token` from cookies.
function persistLegacyUserSideEffects(value: any | null) {
  if (typeof window === 'undefined') return
  try {
    if (value == null) {
      localStorage.removeItem('mijoz')
      localStorage.removeItem('opt_token')
      Cookies.remove('opt_token')
      return
    }
    const encoded = Buffer.from(JSON.stringify(value)).toString('base64')
    localStorage.setItem('mijoz', encoded)
  } catch {}
}

export type User = {
  // All fields optional — legacy UserData wrapper shape varies
  // (top-level may be the wrapper { user_identity, user_token, user: {...} }
  // or the inner user object).
  id?: number
  name?: string
  phone?: string
  email?: string
  birth?: string | null
  bonus?: number
  [key: string]: any
}

type UserState = {
  schemaVersion: number
  user: User | null
  hasHydrated: boolean
}

type UserActions = {
  setUser: (user: User | null) => void
  /** Legacy alias preserving the SET_USER_DATA cookie/localStorage side effects. */
  setUserData: (user: User | null) => void
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

      setUserData: (user) => {
        persistLegacyUserSideEffects(user)
        set({ user })
      },

      patchUser: (patch) => {
        const cur = get().user
        if (!cur) return
        set({ user: { ...cur, ...patch } })
      },

      logout: () => {
        persistLegacyUserSideEffects(null)
        set({ user: null })
      },

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
