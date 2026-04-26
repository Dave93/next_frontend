/**
 * UI store — modals, drawers, sidebars. Pure UI state, no persistence.
 *
 * Each consumer subscribes to a single boolean via a selector:
 *   const open = useUIStore((s) => s.signInModalOpen)
 *
 * This prevents the cascade re-renders that the legacy ManagedUIContext
 * caused (every consumer re-rendered when ANY field changed).
 */

import { create } from 'zustand'

type UIState = {
  signInModalOpen: boolean
  locationModalOpen: boolean
  productDrawerOpen: boolean
  productDrawerData: any | null
  smallCartOpen: boolean
  // Initial tab to focus when location modal opens — 'deliver' or 'pickup'
  locationModalInitialTab: 'deliver' | 'pickup' | null
}

type UIActions = {
  openSignInModal: () => void
  closeSignInModal: () => void
  openLocationModal: (initialTab?: 'deliver' | 'pickup' | null) => void
  closeLocationModal: () => void
  openProductDrawer: (product: any) => void
  closeProductDrawer: () => void
  openSmallCart: () => void
  closeSmallCart: () => void
  toggleSmallCart: () => void
}

export type UIStore = UIState & UIActions

export const useUIStore = create<UIStore>((set) => ({
  signInModalOpen: false,
  locationModalOpen: false,
  productDrawerOpen: false,
  productDrawerData: null,
  smallCartOpen: false,
  locationModalInitialTab: null,

  openSignInModal: () => set({ signInModalOpen: true }),
  closeSignInModal: () => set({ signInModalOpen: false }),

  openLocationModal: (initialTab = null) =>
    set({ locationModalOpen: true, locationModalInitialTab: initialTab }),
  closeLocationModal: () =>
    set({ locationModalOpen: false, locationModalInitialTab: null }),

  openProductDrawer: (product) =>
    set({ productDrawerOpen: true, productDrawerData: product }),
  closeProductDrawer: () =>
    set({ productDrawerOpen: false, productDrawerData: null }),

  openSmallCart: () => set({ smallCartOpen: true }),
  closeSmallCart: () => set({ smallCartOpen: false }),
  toggleSmallCart: () =>
    set((s) => ({ smallCartOpen: !s.smallCartOpen })),
}))
