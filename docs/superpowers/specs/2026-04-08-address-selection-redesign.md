# Address Selection Redesign

## Summary

Redesign the delivery address selection section in the checkout page (`Orders.tsx`). Extract the monolithic address/delivery block into a standalone component with separate desktop and mobile UX.

## Problem

The current `Orders.tsx` (2907 lines) contains the address selection inline — a Yandex map, Downshift autocomplete, saved addresses, and address detail fields all mixed into the main checkout form. On mobile it's the same layout just compressed via CSS overrides in `MobileOrders.tsx`.

## Design Decisions

- **Approach**: Search bar with autocomplete + map + saved address chips (Яндекс Еда style)
- **Mobile**: No map — search + saved address list + detail fields + "Подтвердить" button
- **Desktop**: Search bar + saved address chips + Yandex map with pin + detail fields inline
- **Geocoding**: Keep Yandex Maps API (existing integration)

## Architecture

### New Components

```
components_new/order/
  AddressSelection/
    AddressSelection.tsx        # Desktop version — search, chips, map, details
    AddressSelectionMobile.tsx   # Mobile version — search, saved list, details, CTA
    AddressSearch.tsx            # Shared autocomplete input (Yandex geocode)
    SavedAddressChips.tsx        # Desktop: horizontal chip list
    SavedAddressList.tsx         # Mobile: vertical card list
    AddressDetails.tsx           # Shared: flat, entrance, floor, door_code fields
```

### AddressSelection.tsx (Desktop)

Layout top-to-bottom:
1. Delivery/Pickup toggle (existing, moved here)
2. City selector dropdown (existing)
3. `AddressSearch` — input with Yandex autocomplete dropdown
4. `SavedAddressChips` — horizontal scrollable chips (Home, Office, + Add)
5. Yandex Map (existing `react-yandex-maps`) — 280px height, pin draggable
6. `AddressDetails` — 4 fields in a row: flat, entrance, floor, door_code
7. Nearest branch info bar

### AddressSelectionMobile.tsx (Mobile)

Layout top-to-bottom:
1. Header with back arrow + "Адрес доставки" title
2. Delivery/Pickup toggle
3. `AddressSearch` — full-width search input
4. `SavedAddressList` — vertical cards with selected state (yellow border + checkmark)
5. "+ Добавить новый адрес" dashed card
6. `AddressDetails` — 2x2 grid: flat, entrance, floor, door_code
7. Nearest branch info bar
8. Fixed bottom CTA: "Подтвердить адрес" yellow button

No map on mobile. If user enters a new address, geocoding happens via Yandex API without showing a map.

### AddressSearch.tsx (Shared)

- Uses existing Downshift + Yandex geocode logic from Orders.tsx
- Props: `onAddressSelect(address, coordinates)`, `defaultValue`, `cityPrefix`
- Debounced input (300ms) triggers Yandex geocode API
- Dropdown shows matching addresses
- On select: calls `onAddressSelect` with full address string + lat/lng

### SavedAddressChips.tsx (Desktop)

- Props: `addresses: Address[]`, `selectedId`, `onSelect`, `onAddNew`
- Horizontal flex with wrap, each address as a rounded chip
- Selected chip has yellow background + border
- Last chip is "+ Добавить" in yellow text

### SavedAddressList.tsx (Mobile)

- Props: same as chips
- Vertical card list, each card shows label icon + name + full address
- Selected card has yellow border + checkmark
- Bottom: dashed border card for "+ Добавить новый адрес"

### AddressDetails.tsx (Shared)

- Props: `register` (from react-hook-form), `isMobile`
- Desktop: 4 fields in a row (flex)
- Mobile: 2x2 grid
- Fields: flat, entrance, floor, door_code
- Uses existing form registration from parent

## Data Flow

1. User types in `AddressSearch` → debounced Yandex geocode → dropdown
2. User selects address → `onAddressSelect(address, coords)` → parent updates form + map pin
3. OR user clicks saved address chip/card → loads address + coords → updates form + map
4. User adjusts pin on map (desktop only) → reverse geocode → updates address field
5. User fills detail fields → form state updates via react-hook-form
6. Parent (`Orders.tsx`) reads all address data from form state

## Integration with Orders.tsx

The new components replace lines ~1480-2025 in `Orders.tsx`. The parent component:
- Passes `react-hook-form` register/setValue/control
- Passes `locationData`, `addressList`, `cities` from useUI context
- Receives address selection via callbacks that update form state
- Map state management stays in the address component (not parent)

## Styling

- Tailwind CSS only, no CSS modules
- Rounded corners (12px cards, 20px chips, 24px buttons)
- Yellow accent: `#F9B004` (existing `bg-yellow` class)
- Gray backgrounds: `bg-gray-100` / `#f7f7f7`
- Consistent with existing Chopar design language

## Out of Scope

- Pickup terminal selection (stays as-is in Orders.tsx)
- Payment section
- Order summary
- OTP verification
- Contact form
