/**
 * Location store — selected delivery address, active city, address book.
 * Persisted (city + last selected delivery point) so user doesn't have to
 * re-pick on every visit.
 *
 * `cities[]` is NOT persisted — it always comes from server siteInfo
 * to avoid stale polygons / phones. Same for `addressList[]` (it's a
 * server-side per-user collection).
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { City } from '@commerce/types/cities'

const SCHEMA_VERSION = 1

export type DeliveryType = 'deliver' | 'pickup'

export type LocationData = {
  deliveryType: DeliveryType
  address?: string
  flat?: string
  house?: string
  entrance?: string
  door_code?: string
  label?: string
  // [lat, lon]
  location?: [number, number] | null
  terminal_id?: number | null
  terminalData?: any
}

export type Address = {
  id: number
  address: string
  flat?: string
  house?: string
  entrance?: string
  door_code?: string
  label?: string
  lat?: number
  lon?: number
}

type LocationState = {
  schemaVersion: number
  activeCity: City | null
  cities: City[]
  locationData: LocationData | null
  addressId: number | null
  addressList: Address[]
  hasHydrated: boolean
}

type LocationActions = {
  setActiveCity: (city: City | null) => void
  setCities: (cities: City[]) => void
  setLocationData: (data: LocationData | null) => void
  patchLocationData: (patch: Partial<LocationData>) => void
  setAddressId: (id: number | null) => void
  setAddressList: (list: Address[]) => void
  reset: () => void
  setHasHydrated: (v: boolean) => void
}

export type LocationStore = LocationState & LocationActions

const INITIAL: LocationState = {
  schemaVersion: SCHEMA_VERSION,
  activeCity: null,
  cities: [],
  locationData: null,
  addressId: null,
  addressList: [],
  hasHydrated: false,
}

export const useLocationStore = create<LocationStore>()(
  persist(
    (set, get) => ({
      ...INITIAL,

      setActiveCity: (city) => set({ activeCity: city }),
      setCities: (cities) => set({ cities }),
      setLocationData: (data) => set({ locationData: data }),
      patchLocationData: (patch) => {
        const cur = get().locationData
        set({ locationData: cur ? { ...cur, ...patch } : (patch as LocationData) })
      },
      setAddressId: (id) => set({ addressId: id }),
      setAddressList: (list) => set({ addressList: list }),
      reset: () =>
        set({
          locationData: null,
          addressId: null,
          addressList: [],
        }),
      setHasHydrated: (v) => set({ hasHydrated: v }),
    }),
    {
      name: 'chopar-location-v1',
      version: SCHEMA_VERSION,
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? window.localStorage : (undefined as any)
      ),
      partialize: (s) => ({
        schemaVersion: s.schemaVersion,
        // Persist only stable, user-chosen state.
        // Cities & addressList come from server every load.
        activeCity: s.activeCity
          ? { ...s.activeCity, polygons: undefined as any }
          : null,
        locationData: s.locationData,
        addressId: s.addressId,
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

export const locationSelectors = {
  activeCity: (s: LocationStore) => s.activeCity,
  cities: (s: LocationStore) => s.cities,
  locationData: (s: LocationStore) => s.locationData,
  addressId: (s: LocationStore) => s.addressId,
  addressList: (s: LocationStore) => s.addressList,
}
