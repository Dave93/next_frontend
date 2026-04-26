'use client'

/**
 * On first mount: read the legacy `mijoz` (base64-encoded UserData in
 * localStorage) and `yetkazish` (base64-encoded LocationData in cookie)
 * and seed the Zustand stores. Replaces the equivalent useEffect that
 * lived inside ManagedUIContext.UIProvider.
 *
 * Zustand's persist middleware also rehydrates from its own
 * `chopar-cart-v1` / `chopar-user-v1` / `chopar-location-v1` keys —
 * but we still need to honour the legacy cookie/localStorage so users
 * with a session from the pre-Zustand era don't get logged out and
 * don't lose their delivery address on first visit after upgrade.
 */

import { useEffect } from 'react'
import Cookies from 'js-cookie'
import { useUserStore } from '../../lib/stores/user-store'
import { useLocationStore } from '../../lib/stores/location-store'

const StorePersistRehydrator = () => {
  useEffect(() => {
    // mijoz → user
    try {
      const raw = localStorage.getItem('mijoz')
      if (raw) {
        const decoded = Buffer.from(raw, 'base64').toString()
        const parsed = JSON.parse(decoded)
        // Only seed if Zustand store is empty (don't override fresher state)
        if (!useUserStore.getState().user && parsed) {
          useUserStore.getState().setUser(parsed)
        }
      }
    } catch {}

    // yetkazish (cookie) → locationData
    try {
      const raw = Cookies.get('yetkazish')
      if (raw) {
        const decoded = Buffer.from(raw, 'base64').toString()
        const parsed = JSON.parse(decoded)
        if (!useLocationStore.getState().locationData && parsed) {
          useLocationStore.getState().setLocationData(parsed)
        }
      }
    } catch {}

    // activeCity (cookie) → activeCity
    try {
      const raw = Cookies.get('activeCity')
      if (raw) {
        const decoded = Buffer.from(raw, 'base64').toString()
        const parsed = JSON.parse(decoded)
        if (!useLocationStore.getState().activeCity && parsed) {
          useLocationStore.getState().setActiveCity(parsed)
        }
      }
    } catch {}
  }, [])

  return null
}

export default StorePersistRehydrator
