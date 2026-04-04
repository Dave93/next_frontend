# Mobile Navigation & Header Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hamburger menu with a bottom tab bar and two-row sticky header on mobile, using a fully separate MobileLayout.

**Architecture:** Create new `components_new/mobile/` directory with MobileLayout, MobileHeader, MobileBottomNav, and MobileProfileMenu. Layout.tsx renders both mobile and desktop layouts, toggled via Tailwind `md:hidden` / `hidden md:block` — no `window.innerWidth`. Desktop code is untouched.

**Tech Stack:** Next.js 16, React 18, TypeScript, Tailwind CSS 2, @heroicons/react, next-translate

---

## File Structure

```
components_new/mobile/
  MobileBottomNav.tsx    — fixed bottom tab bar (Home, Orders, Cart, Profile)
  MobileHeader.tsx       — two-row sticky header (logo+city, delivery/pickup)
  MobileLayout.tsx       — shell combining header + content + bottom nav
  MobileProfileMenu.tsx  — profile page menu items for mobile
```

**Modified files:**

- `components/common/Layout/Layout.tsx` — wrap desktop in `hidden md:block`, add MobileLayout in `md:hidden`
- `pages/[city]/profile/index.tsx` — render MobileProfileMenu on mobile
- `components_new/common/SmallCartMobile.tsx` — remove floating cart button

**Deleted files:**

- `components_new/header/MobHeaderMenu.tsx`
- `components_new/header/BurgerMenu.js`

---

### Task 1: Create MobileBottomNav component

**Files:**

- Create: `components_new/mobile/MobileBottomNav.tsx`

- [ ] **Step 1: Create the component file**

```tsx
import React, { FC, useMemo } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import {
  HomeIcon as HomeOutline,
  ClipboardListIcon as OrdersOutline,
  ShoppingCartIcon as CartOutline,
  UserIcon as ProfileOutline,
} from '@heroicons/react/outline'
import {
  HomeIcon as HomeSolid,
  ClipboardListIcon as OrdersSolid,
  ShoppingCartIcon as CartSolid,
  UserIcon as ProfileSolid,
} from '@heroicons/react/solid'
import { useUI } from '@components/ui/context'
import useCart from '@framework/cart/use-cart'

interface Tab {
  key: string
  label: string
  href: string
  iconOutline: React.ComponentType<React.SVGProps<SVGSVGElement>>
  iconSolid: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

const MobileBottomNav: FC = () => {
  const { pathname, query } = useRouter()
  const { locationData, activeCity } = useUI()
  const citySlug = (query.city as string) || activeCity?.slug || ''

  const { data: cartData } = useCart()
  const cartCount = cartData?.lineItems?.length || 0

  const tabs: Tab[] = useMemo(
    () => [
      {
        key: 'home',
        label: 'Home',
        href: `/${citySlug}`,
        iconOutline: HomeOutline,
        iconSolid: HomeSolid,
      },
      {
        key: 'orders',
        label: 'Orders',
        href: `/${citySlug}/myorders`,
        iconOutline: OrdersOutline,
        iconSolid: OrdersSolid,
      },
      {
        key: 'cart',
        label: 'Cart',
        href: `/${citySlug}/cart`,
        iconOutline: CartOutline,
        iconSolid: CartSolid,
      },
      {
        key: 'profile',
        label: 'Profile',
        href: `/${citySlug}/profile`,
        iconOutline: ProfileOutline,
        iconSolid: ProfileSolid,
      },
    ],
    [citySlug]
  )

  const activeTab = useMemo(() => {
    if (pathname === '/[city]' || pathname === '/') return 'home'
    if (pathname.includes('/myorders') || pathname.includes('/order'))
      return 'orders'
    if (pathname.includes('/cart')) return 'cart'
    if (pathname.includes('/profile')) return 'profile'
    return 'home'
  }, [pathname])

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center h-14">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key
          const Icon = isActive ? tab.iconSolid : tab.iconOutline
          return (
            <Link key={tab.key} href={tab.href} prefetch={false}>
              <a className="flex flex-col items-center justify-center w-full h-full relative">
                <Icon
                  className={`w-6 h-6 ${
                    isActive ? 'text-yellow-500' : 'text-gray-400'
                  }`}
                  style={isActive ? { color: '#F9B004' } : undefined}
                />
                {tab.key === 'cart' && cartCount > 0 && (
                  <span className="absolute top-0.5 right-1/4 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-white">
                    {cartCount > 99 ? '99' : cartCount}
                  </span>
                )}
                <span
                  className={`text-[10px] mt-0.5 ${
                    isActive ? 'font-semibold' : ''
                  }`}
                  style={{ color: isActive ? '#F9B004' : 'rgba(0,0,0,0.4)' }}
                >
                  {tab.label}
                </span>
              </a>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default MobileBottomNav
```

- [ ] **Step 2: Verify it compiles**

```bash
bun run build 2>&1 | head -20
```

The component won't be rendered yet (not imported anywhere), but it should compile without type errors.

- [ ] **Step 3: Commit**

```bash
git add components_new/mobile/MobileBottomNav.tsx
git commit -m "feat: create MobileBottomNav component"
```

---

### Task 2: Create MobileHeader component

**Files:**

- Create: `components_new/mobile/MobileHeader.tsx`

- [ ] **Step 1: Create the component file**

```tsx
import React, { FC, useMemo, useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { LocationMarkerIcon, ChevronDownIcon } from '@heroicons/react/solid'
import useTranslation from 'next-translate/useTranslation'
import { useUI } from '@components/ui/context'

const MobileHeader: FC = () => {
  const { locale = 'ru', query } = useRouter()
  const { t: tr } = useTranslation('common')
  const {
    activeCity,
    cities,
    locationData,
    setLocationData,
    showMobileLocationTabs,
    openMobileLocationTabs,
  } = useUI()

  const chosenCity = useMemo(() => {
    if (activeCity) return activeCity
    if (cities) return cities[0]
    return null
  }, [cities, activeCity])

  const citySlug = (query.city as string) || chosenCity?.slug || ''

  const cityName = useMemo(() => {
    if (!chosenCity) return ''
    const key = `name_${locale}` as keyof typeof chosenCity
    return (chosenCity as any)[key] || chosenCity.name || ''
  }, [chosenCity, locale])

  const isDelivery = locationData?.deliveryType === 'deliver'

  const handleDeliveryType = (type: 'deliver' | 'pickup') => {
    if (locationData) {
      setLocationData({ ...locationData, deliveryType: type })
    }
    openMobileLocationTabs()
  }

  return (
    <header className="sticky top-0 z-30 bg-white">
      {/* Row 1: Logo + City */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <Link href={`/${citySlug}`} prefetch={false} legacyBehavior>
          <a className="flex">
            <Image
              src="/assets/main_logo.svg"
              width={120}
              height={44}
              alt="Chopar"
            />
          </a>
        </Link>
        <button
          className="flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1.5"
          onClick={openMobileLocationTabs}
        >
          <LocationMarkerIcon
            className="w-3.5 h-3.5 text-yellow-500"
            style={{ color: '#F9B004' }}
          />
          <span className="text-xs font-medium text-gray-700">{cityName}</span>
          <ChevronDownIcon className="w-3 h-3 text-gray-400" />
        </button>
      </div>
      {/* Row 2: Delivery / Pickup toggle */}
      <div className="flex gap-2 px-4 pb-2.5">
        <button
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
            isDelivery
              ? 'bg-yellow-500 text-white'
              : 'bg-gray-100 text-gray-500'
          }`}
          style={isDelivery ? { backgroundColor: '#F9B004' } : undefined}
          onClick={() => handleDeliveryType('deliver')}
        >
          {tr('delivery')}
        </button>
        <button
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition-colors ${
            !isDelivery
              ? 'bg-yellow-500 text-white'
              : 'bg-gray-100 text-gray-500'
          }`}
          style={!isDelivery ? { backgroundColor: '#F9B004' } : undefined}
          onClick={() => handleDeliveryType('pickup')}
        >
          {tr('pickup')}
        </button>
      </div>
    </header>
  )
}

export default MobileHeader
```

- [ ] **Step 2: Check if `openMobileLocationTabs` exists in context**

Read `components/ui/context.tsx` and search for `openMobileLocationTabs` or `showMobileLocationTabs`. The context has `showMobileLocationTabs` state and setters. If `openMobileLocationTabs` does not exist as a named action, find the equivalent setter. The context likely has a dispatch action for it — check the reducer cases and use the appropriate action. You may need to use `showMobileLocationTabs` setter directly or add a convenience function.

Adjust the MobileHeader import accordingly. For example, if the context exposes `setShowMobileLocationTabs` or a dispatch, use that instead.

- [ ] **Step 3: Verify it compiles**

```bash
bun run build 2>&1 | head -20
```

- [ ] **Step 4: Commit**

```bash
git add components_new/mobile/MobileHeader.tsx
git commit -m "feat: create MobileHeader component with city selector and delivery toggle"
```

---

### Task 3: Create MobileLayout shell

**Files:**

- Create: `components_new/mobile/MobileLayout.tsx`

- [ ] **Step 1: Create the component file**

```tsx
import React, { FC, ReactNode } from 'react'
import MobileHeader from './MobileHeader'
import MobileBottomNav from './MobileBottomNav'

interface MobileLayoutProps {
  children: ReactNode
}

const MobileLayout: FC<MobileLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <MobileHeader />
      <main className="flex-grow pb-16">{children}</main>
      <MobileBottomNav />
    </div>
  )
}

export default MobileLayout
```

- [ ] **Step 2: Commit**

```bash
git add components_new/mobile/MobileLayout.tsx
git commit -m "feat: create MobileLayout shell component"
```

---

### Task 4: Integrate MobileLayout into Layout.tsx

**Files:**

- Modify: `components/common/Layout/Layout.tsx`

This is the critical integration step. We wrap the existing desktop layout in `hidden md:block` and add MobileLayout in `md:hidden`.

- [ ] **Step 1: Add MobileLayout import**

At the top of `components/common/Layout/Layout.tsx`, after the existing imports (after line 41), add:

```typescript
import MobileLayout from '@components_new/mobile/MobileLayout'
```

- [ ] **Step 2: Wrap the layout return with mobile/desktop split**

In the `return (` block starting at line 131, the current structure is:

```tsx
return (
  <CommerceProvider locale={locale}>
    <div className="font-sans">
      <div className="md:flex md:flex-col h-screen">
        <Header menu={topMenu} />
        <main ...>
          {children}
        </main>
        <footer ...>
          ...
        </footer>
      </div>
      <SignInModal />
    </div>
    ... (location modals)
  </CommerceProvider>
)
```

Replace the inner structure to split mobile and desktop. The `<div className="font-sans">` becomes:

```tsx
return (
  <CommerceProvider locale={locale}>
    <div className="font-sans">
      {/* Mobile Layout */}
      <div className="md:hidden">
        <MobileLayout>{children}</MobileLayout>
      </div>
      {/* Desktop Layout */}
      <div className="hidden md:flex md:flex-col h-screen">
        <Header menu={topMenu} />
        <main
          className={`${
            cleanBackground == true ? 'bg-gray-100' : ''
          } flex-grow md:pb-14`}
        >
          {pathname == '/[city]' ? (
            children
          ) : (
            <div className="container mx-auto">{children}</div>
          )}
        </main>
        <footer className="text-white md:flex flex-col flex">
          {/* ... existing footer content unchanged ... */}
        </footer>
      </div>
      <SignInModal />
    </div>
    {/* Location tab modals — keep as-is, they work for both layouts */}
    <Transition show={showLocationTabs}>
      {/* ... existing desktop location modal ... */}
    </Transition>
    <Transition show={showMobileLocationTabs}>
      {/* ... existing mobile location modal ... */}
    </Transition>
  </CommerceProvider>
)
```

**Important:** Keep the `<SignInModal />` and both `<Transition>` location modals outside the mobile/desktop split — they are portals that overlay on top of everything and work for both layouts.

The original `<div className="md:flex md:flex-col h-screen">` becomes `<div className="hidden md:flex md:flex-col h-screen">` (adding `hidden`). The footer stays inside this desktop wrapper since it should only show on desktop.

- [ ] **Step 3: Verify build**

```bash
bun run build
```

Expected: Build succeeds. Mobile should now show the two-row header + bottom nav.

- [ ] **Step 4: Test dev server**

```bash
bun dev
```

Open browser, resize to mobile width (< 768px). Verify:

- Two-row header visible (logo + city, delivery/pickup toggle)
- Bottom tab bar visible (Home, Orders, Cart, Profile)
- Desktop header and footer hidden
- At 768px+ width, desktop layout shows normally

- [ ] **Step 5: Commit**

```bash
git add components/common/Layout/Layout.tsx
git commit -m "feat: integrate MobileLayout into Layout with CSS-based switching"
```

---

### Task 5: Remove hamburger menu and floating cart button

**Files:**

- Delete: `components_new/header/MobHeaderMenu.tsx`
- Delete: `components_new/header/BurgerMenu.js`
- Modify: `components_new/Header.tsx` — remove mobile menu overlay (lines 137-210) and `mobMenuOpen` state
- Modify: `components_new/common/SmallCartMobile.tsx` — remove floating cart button

- [ ] **Step 1: Remove mobile menu overlay from Header.tsx**

In `components_new/Header.tsx`:

1. Remove the `mobMenuOpen` state (line 45): `const [mobMenuOpen, setMobMenuOpen] = useState(false)`
2. Remove the mobile hamburger button (lines 126-131): the `<div className="md:hidden flex">` block with `MenuIcon`
3. Remove the entire mobile menu overlay (lines 137-210): the `{mobMenuOpen && (<div className="w-screen h-screen ...">...</div>)}` block
4. Remove unused imports: `MobHeaderMenu`, `MobChooseCityDropDown`, `MobLanguageDropDown`, `SignInButton` (if only used in mobile menu), `parsePhoneNumber`, `faTelegram`, `FontAwesomeIcon`

After cleanup, the Header only renders the desktop version (which is already hidden on mobile via `hidden md:flex` in Layout).

- [ ] **Step 2: Remove floating cart button from SmallCartMobile.tsx**

In `components_new/common/SmallCartMobile.tsx`, find and remove the floating button (around lines 285-295):

```tsx
<button
  className="md:hidden fixed outline-none focus:outline-none bottom-20 right-4 divide-x flex w-20 px-2 bg-red-700 h-12 items-center justify-around rounded-full"
  onClick={goToCheckout}
>
  ...
</button>
```

Remove this entire `<button>` element. The cart is now accessible via the Cart tab in bottom nav.

- [ ] **Step 3: Delete MobHeaderMenu.tsx and BurgerMenu.js**

```bash
rm components_new/header/MobHeaderMenu.tsx components_new/header/BurgerMenu.js
```

- [ ] **Step 4: Remove MobHeaderMenu import from Header.tsx**

If not already removed in Step 1, ensure these imports are gone from `components_new/Header.tsx`:

```typescript
// REMOVE these:
import MobHeaderMenu from './header/MobHeaderMenu'
import MobChooseCityDropDown from './header/MobChooseCityDropDown'
import MobLanguageDropDown from './header/MobLanguageDropDown'
```

Note: `MobChooseCityDropDown` and `MobLanguageDropDown` files are NOT deleted — they may be used elsewhere. Only remove the imports from Header.tsx.

- [ ] **Step 5: Verify build**

```bash
bun run build
```

Expected: Build succeeds. No references to deleted files remain.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: remove hamburger menu and floating cart button, replaced by MobileLayout"
```

---

### Task 6: Create MobileProfileMenu component

**Files:**

- Create: `components_new/mobile/MobileProfileMenu.tsx`
- Modify: `pages/[city]/profile/index.tsx`

- [ ] **Step 1: Create the MobileProfileMenu component**

```tsx
import React, { FC } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  LocationMarkerIcon,
  ClipboardListIcon,
  GlobeAltIcon,
  PhoneIcon,
  InformationCircleIcon,
  LogoutIcon,
  ChevronRightIcon,
  DeviceMobileIcon,
} from '@heroicons/react/outline'
import useTranslation from 'next-translate/useTranslation'
import { useUI } from '@components/ui/context'
import Cookies from 'js-cookie'

const MobileProfileMenu: FC = () => {
  const { locale = 'ru', query, push } = useRouter()
  const { t: tr } = useTranslation('common')
  const { user, activeCity } = useUI()
  const citySlug = (query.city as string) || activeCity?.slug || ''

  const handleLogout = () => {
    Cookies.remove('opt_token')
    localStorage.removeItem('opt_token')
    window.location.reload()
  }

  const handleLanguage = (lang: string) => {
    const { pathname, asPath, query } = useRouter()
    push({ pathname, query }, asPath, { locale: lang })
  }

  if (!user) {
    return null
  }

  const menuItems = [
    {
      icon: LocationMarkerIcon,
      label: tr('my_addresses') || 'My Addresses',
      href: `/${citySlug}/profile/address`,
    },
    {
      icon: ClipboardListIcon,
      label: tr('my_orders') || 'My Orders',
      href: `/${citySlug}/myorders`,
    },
  ]

  return (
    <div className="md:hidden">
      {/* User info header */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="text-lg font-semibold text-gray-900">
          {user?.user?.name || tr('profile')}
        </div>
        {user?.user_contact && (
          <div className="text-sm text-gray-500 mt-0.5">
            {user.user_contact}
          </div>
        )}
      </div>

      {/* Menu items */}
      <div className="divide-y divide-gray-100">
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href} prefetch={false}>
            <a className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                <item.icon className="w-5 h-5 text-gray-600" />
              </div>
              <span className="flex-1 text-sm text-gray-800">{item.label}</span>
              <ChevronRightIcon className="w-4 h-4 text-gray-400" />
            </a>
          </Link>
        ))}

        {/* Language */}
        <div className="px-4 py-3.5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
              <GlobeAltIcon className="w-5 h-5 text-gray-600" />
            </div>
            <span className="text-sm text-gray-800">
              {tr('language') || 'Language'}
            </span>
          </div>
          <div className="flex gap-2 ml-12">
            {['ru', 'uz', 'en'].map((lang) => (
              <Link key={lang} href="" locale={lang} prefetch={false}>
                <a
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    locale === lang
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                  style={
                    locale === lang ? { backgroundColor: '#F9B004' } : undefined
                  }
                >
                  {lang.toUpperCase()}
                </a>
              </Link>
            ))}
          </div>
        </div>

        {/* Support phone */}
        {activeCity?.phone && (
          <a
            href={`tel:${activeCity.phone}`}
            className="flex items-center gap-3 px-4 py-3.5"
          >
            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
              <PhoneIcon className="w-5 h-5 text-gray-600" />
            </div>
            <span className="flex-1 text-sm text-gray-800">
              {tr('support') || 'Support'}: {activeCity.phone}
            </span>
            <ChevronRightIcon className="w-4 h-4 text-gray-400" />
          </a>
        )}

        {/* Download app */}
        <div className="px-4 py-3.5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
              <DeviceMobileIcon className="w-5 h-5 text-gray-600" />
            </div>
            <span className="text-sm text-gray-800">
              {tr('download_app') || 'Download App'}
            </span>
          </div>
          <div className="flex gap-3 ml-12">
            <a href="#" className="block">
              <img src="/assets/appstore.png" alt="App Store" className="h-9" />
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=havoqand.chopar"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <img src="/googleReady.svg" alt="Google Play" className="h-9" />
            </a>
          </div>
        </div>

        {/* Logout */}
        <button
          className="flex items-center gap-3 px-4 py-3.5 w-full text-left"
          onClick={handleLogout}
        >
          <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
            <LogoutIcon className="w-5 h-5 text-red-500" />
          </div>
          <span className="text-sm text-red-500">
            {tr('logout') || 'Logout'}
          </span>
        </button>
      </div>
    </div>
  )
}

export default MobileProfileMenu
```

- [ ] **Step 2: Update profile page to render MobileProfileMenu**

In `pages/[city]/profile/index.tsx`, modify the component:

```tsx
import type { GetServerSidePropsContext, GetStaticPropsContext } from 'next'
import useCustomer from '@framework/customer/use-customer'
import commerce from '@lib/api/commerce'
import { Layout } from '@components/common'
import React from 'react'
import UserData from '@components_new/profile/UserData'
import MobileProfileMenu from '@components_new/mobile/MobileProfileMenu'

export async function getServerSideProps({
  preview,
  locale,
  locales,
  query,
}: GetServerSidePropsContext) {
  // ... existing getServerSideProps unchanged ...
}

export default function Profile() {
  const { data } = useCustomer()
  return (
    <>
      {/* Desktop profile */}
      <div className="hidden md:block">
        <UserData />
      </div>
      {/* Mobile profile menu */}
      <MobileProfileMenu />
    </>
  )
}

Profile.Layout = Layout
```

- [ ] **Step 3: Verify build**

```bash
bun run build
```

- [ ] **Step 4: Test in dev server**

```bash
bun dev
```

Open `/tashkent/profile` on mobile width. Verify:

- Menu items display (Addresses, Orders, Language, Support, App, Logout)
- Language switcher works
- Links navigate correctly

- [ ] **Step 5: Commit**

```bash
git add components_new/mobile/MobileProfileMenu.tsx pages/[city]/profile/index.tsx
git commit -m "feat: create MobileProfileMenu and integrate into profile page"
```

---

### Task 7: Final verification and cleanup

**Files:**

- Possibly modify: any files with remaining issues

- [ ] **Step 1: Full production build**

```bash
bun run build
```

Expected: Clean build, no errors.

- [ ] **Step 2: Test all mobile flows in dev server**

```bash
bun dev
```

Test on mobile width (< 768px):

1. Home page: header with logo + city, delivery/pickup toggle, bottom nav visible
2. Tap Orders tab → navigates to myorders
3. Tap Cart tab → navigates to cart, badge shows count
4. Tap Profile tab → shows profile menu
5. City chip in header → opens location modal
6. Delivery/Pickup toggle → switches type and opens location picker
7. Resize to desktop (768px+) → desktop layout shows, no bottom nav, no mobile header

- [ ] **Step 3: Run prettier**

```bash
bun run prettier-fix
```

- [ ] **Step 4: Commit if any formatting changes**

```bash
git add -A
git commit -m "chore: format mobile navigation components"
```
