# Mobile Navigation & Header — Design Spec

## Goal

Replace the hamburger menu with a bottom tab bar and two-row sticky header on mobile, using a fully separate MobileLayout that doesn't touch desktop code. First of 4 mobile UI improvement specs.

## Reference

Expo app at `projects/LesChoparExpo/choparpizza-expo/` — specifically:
- `components/ui/CustomTabBar.tsx` — bottom tab design
- `components/screens/HomeScreen.tsx` — header with delivery/pickup toggle
- `components/screens/ProfileScreen.tsx` — profile menu structure
- `components/ui/CityBottomSheet.tsx` — city selector pattern

---

## Architecture

### New File Structure

```
components_new/mobile/
  MobileLayout.tsx         — shell: MobileHeader + children + MobileBottomNav
  MobileHeader.tsx         — two-row sticky header
  MobileBottomNav.tsx      — 4-tab bottom navigation
  MobileProfileMenu.tsx    — profile page menu items (language, support, logout)
```

### Layout Switching

In the existing `Layout.tsx` (or the page-level layout), render both layouts and toggle visibility with CSS:

```tsx
<div className="md:hidden">
  <MobileLayout pageProps={pageProps}>{children}</MobileLayout>
</div>
<div className="hidden md:block">
  {/* existing desktop layout: Header, Footer, etc. */}
  {children}
</div>
```

No `window.innerWidth` checks. Pure CSS responsive via Tailwind `md:` breakpoint (768px).

### Desktop Isolation

Desktop components (`Header.tsx`, `HeaderMenu`, `ChooseCityDropDown`, `UserProfileDropDown`, etc.) remain untouched. They are wrapped inside the `hidden md:block` container.

---

## Component Specs

### MobileBottomNav

**Visibility:** Only on screens < 768px (`md:hidden`).

**Position:** `fixed bottom-0 left-0 right-0`, white background, `border-t border-gray-200`, `z-30`. Safe-area bottom padding via `pb-[env(safe-area-inset-bottom)]`.

**Tabs:**

| Tab | Icon (outline/filled) | Route | Auth required? |
|-----|----------------------|-------|----------------|
| Home | home-outline / home | `/[city]` | No |
| Orders | clipboard-outline / clipboard | `/[city]/myorders` | Yes — redirect to sign-in |
| Cart | cart-outline / cart | `/[city]/cart` | No |
| Profile | person-outline / person | `/[city]/profile` | Yes — show sign-in |

**Active state:** Icon and label colored `#F9B004`. Inactive: `rgba(0,0,0,0.4)`.

**Cart badge:** Red circle (`bg-red-500`) with white text showing item count from `ManagedUIContext`. Positioned top-right of cart icon. Hidden when count is 0.

**Active tab detection:** Based on `router.pathname` matching:
- `/[city]` or `/` → Home
- `/[city]/myorders` or `/[city]/order` → Orders
- `/[city]/cart` → Cart
- `/[city]/profile` → Profile

**Content padding:** All page content gets `pb-16` on mobile to prevent overlap with the fixed bottom nav.

**Icons:** Use `@heroicons/react` (already installed) — `HomeIcon`, `ClipboardListIcon`, `ShoppingCartIcon`, `UserIcon` from both `outline` and `solid`.

---

### MobileHeader

**Visibility:** Only on screens < 768px. Part of `MobileLayout`.

**Position:** `sticky top-0 z-30 bg-white`.

**Row 1 — Logo + City:**
- Left: Chopar logo (existing logo image or text, linked to home)
- Right: City selector chip — rounded pill (`bg-gray-100 rounded-full px-3 py-1.5`), shows pin icon + city name + chevron-down. Tapping opens existing `CityModal` from Layout.

**Row 2 — Delivery/Pickup Toggle:**
- Two buttons, `flex gap-2`, full width
- Active button: `bg-primary text-white rounded-xl py-2`
- Inactive button: `bg-gray-100 text-gray-500 rounded-xl py-2`
- Each button has icon + label ("Delivery" / "Pickup")
- State bound to `deliveryType` from `ManagedUIContext`
- Tapping "Delivery" when already selected → opens `SetLocation` modal (address picker)
- Tapping "Pickup" when already selected → opens `SetLocation` modal (terminal picker)
- Switching between delivery/pickup updates context

**Shadow on scroll:** Add subtle `shadow-sm` when page is scrolled (via scroll listener or `sticky` intersection observer).

---

### MobileLayout

**Structure:**
```
MobileHeader (sticky top)
<main className="pb-16">
  {children}
</main>
MobileBottomNav (fixed bottom)
```

**Responsibility:** Wraps page content with mobile header and bottom nav. Receives `pageProps` to pass city data to header.

---

### MobileProfileMenu

**Location:** Rendered on the profile page (`pages/[city]/profile/index.tsx`) when on mobile.

**Unauthenticated view:**
- Sign-in prompt with button → opens `SignInModal`

**Authenticated view — menu items:**

Each item is a row: icon (in rounded circle) + label + chevron-right.

1. **User info header** — name + phone (from context)
2. **My Addresses** → `/[city]/profile/address`
3. **My Orders** → `/[city]/myorders`
4. **Language** — inline selector or sheet, switches locale via `next-translate`
5. **Support Phone** — `tel:+998712005400` (or from API)
6. **About / Privacy Policy** — links
7. **Download App** — App Store + Google Play links
8. **Logout** — clears token, reloads

**Styling:** `divide-y divide-gray-100` between items. Each row: `flex items-center gap-3 py-3 px-4`.

---

## Removals

| File | Action | Reason |
|------|--------|--------|
| `components_new/header/MobHeaderMenu.tsx` | Delete | Hamburger menu replaced by bottom nav + header |
| `components_new/header/BurgerMenu.js` | Delete | Hamburger button no longer needed |
| Hamburger logic in `Header.tsx` | Remove | `mobMenuOpen` state, fullscreen overlay, mobile menu rendering |
| Floating cart button in `SmallCartMobile.tsx` | Remove | Replaced by Cart tab in bottom nav |

---

## Colors

From Expo app's Tailwind config, already matching the web project:
- Primary: `#F9B004` (active tabs, active toggle)
- Secondary: `#2F5E8E` (logo)
- Inactive: `rgba(0,0,0,0.4)` (inactive tab icons)
- Badge: `#ef4444` (cart count)
- Background: `#ffffff` (header, bottom nav)
- Borders: `#e5e7eb` (dividers)

---

## Scope Boundaries

**In scope (this spec):**
- MobileLayout, MobileHeader, MobileBottomNav, MobileProfileMenu
- Layout switching in Layout.tsx
- Removal of hamburger menu and floating cart button
- Profile page updates for mobile menu items

**Out of scope (future specs):**
- Home page content (banners, sticky categories, product grid) — Spec 2
- Product cards and detail views — Spec 3
- Cart page and checkout flow — Spec 4
- Pull-to-refresh, gestures, animations
- Consolidation of duplicate mobile/desktop components (CreateYourPizza, LocationTabs)
