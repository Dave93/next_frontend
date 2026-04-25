# App Router Migration — Wave 5: Personal Pages (Cart, Order, Profile, Tracking, Bonus)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Мигрировать все personal pages: `/[city]/cart`, `/order`, `/order/[id]`, `/order/success`, `/profile`, `/profile/account`, `/profile/address`, `/profile/orders`, `/track/[id]`, `/_bonus`, `/_bonus/start`. Big Bang port.

**Architecture / Strategy: PORT, NOT REWRITE** (same pattern as Wave 4). Each legacy view-component → `App` suffix variant with `'use client'`, `useRouter from 'next/router'` → `useLocale`/relative `'../../i18n/navigation'`, `useTranslation` → `useExtracted` (or inline RU). Pages.tsx — server components with auth-protected fetches via `lib/data/auth.ts` (`getAuthToken` + Bearer headers).

**Out of scope:** Wave 6 cleanup, Wave 7 polish (catalog grid mapping, SmallCart hydration, ThreePizza items).

**Tech Stack:** Next.js 16.2.2, React 18, `next-intl@4.9.1` (`useExtracted` only), `@framework/cart`, `@framework/customer`, `react-hook-form`, `react-yandex-maps` (track + branch), `axios`, `Hashids`, `react-toastify`, `currency.js`, `luxon`.

**Reference plans:** Wave 1-4.

---

## File Structure

### Created

| Файл | Тип | Назначение |
|---|---|---|
| `lib/data/orders.ts` | server fetcher | `fetchOrderById(id)` (server-side с auth header) — read user's order |
| `lib/data/bonus.ts` | server fetcher | `fetchBonusProducts()` (server-side с auth) |
| `components_new/profile/UserDataApp.tsx` | client | Sidebar profile menu (~87 строк) |
| `components_new/profile/PersonalDataApp.tsx` | client | Form для имени/email (~194) |
| `components_new/profile/AddressApp.tsx` | client | List адресов + add/edit (~217) |
| `components_new/profile/BonusesApp.tsx` | client | Bonus state widget (~19) |
| `components_new/profile/OrdersApp.tsx` | client | Profile orders list (~373) |
| `components_new/mobile/MobileProfileMenuApp.tsx` | client | Mobile profile nav (~existing) |
| `components_new/order/OrderAcceptApp.tsx` | client | Order detail "thanks" view (~447) |
| `components_new/order/OrderTrackingApp.tsx` | client | Live tracking widget (~282) |
| `components_new/order/OrdersApp.tsx` | client | Cart-checkout sidebar component (~2555 — largest) |
| `components_new/order/MobileOrdersApp.tsx` | client | Mobile cart-checkout (~235) |
| `components_new/cart/CartApp.tsx` | client | Cart page composition (~~1243 from cart.tsx) |
| `components_new/track/TrackClientApp.tsx` | client | Tracking page client (~513 from index.client.tsx) |
| `components_new/bonus/BonusListApp.tsx` | client | Bonus products list page (~213) |
| `components_new/bonus/BonusStartApp.tsx` | client | Bonus start page (~377) |
| `app/[city]/cart/page.tsx` | server | Cart page wrapper |
| `app/[city]/order/page.tsx` | server | Orders list page |
| `app/[city]/order/[id]/page.tsx` | server | Order detail (auth fetch) |
| `app/[city]/order/success/page.tsx` | server | Order success |
| `app/[city]/profile/page.tsx` | server | Profile home |
| `app/[city]/profile/account/page.tsx` | server | Account form |
| `app/[city]/profile/address/page.tsx` | server | Address list |
| `app/[city]/profile/orders/page.tsx` | server | Orders history |
| `app/[city]/track/[id]/page.tsx` | server | Track wrapper |
| `app/[city]/_bonus/page.tsx` | server | Bonus list |
| `app/[city]/_bonus/start/page.tsx` | server | Bonus start |

### Modified

| Файл | Изменение |
|---|---|
| `proxy.ts` | + 11 personal routes |

### Deleted

12 legacy `pages/[city]/...` files

---

## Phase A: Server fetchers + simple ports

### Task 1: lib/data/orders.ts + bonus.ts

```typescript
// lib/data/orders.ts
import 'server-only'
import { getAuthToken } from './auth'

const apiUrl = () => process.env.NEXT_PUBLIC_API_URL || process.env.API_URL

export async function fetchOrderById(id: string) {
  const token = await getAuthToken()
  if (!token) return null
  const res = await fetch(`${apiUrl()}/api/orders?id=${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  if (!res.ok) return null
  const json = (await res.json()) as { data?: any }
  return json.data || null
}

export async function fetchOrderStatuses() {
  const res = await fetch(`${apiUrl()}/api/order_statuses/system`, {
    next: { revalidate: 3600 },
  })
  if (!res.ok) return []
  const json = (await res.json()) as { data?: any[] }
  return json.data || []
}
```

```typescript
// lib/data/bonus.ts
import 'server-only'
import { getAuthToken } from './auth'

const apiUrl = () => process.env.NEXT_PUBLIC_API_URL || process.env.API_URL

export async function fetchBonusProducts() {
  const token = await getAuthToken()
  if (!token) return []
  const res = await fetch(`${apiUrl()}/api/bonus_prods`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  if (!res.ok) return []
  const json = (await res.json()) as { data?: any[] }
  return json.data || []
}
```

Verify TS, single commit: `feat(data): add orders + bonus server fetchers (auth via opt_token)`

### Task 2: Port profile components (5 files)

Apply port pattern:
- `components_new/profile/UserData.tsx` → `UserDataApp.tsx`
- `components_new/profile/PersonalData.tsx` → `PersonalDataApp.tsx`
- `components_new/profile/Address.tsx` → `AddressApp.tsx`
- `components_new/profile/Bonuses.tsx` → `BonusesApp.tsx`
- `components_new/profile/Orders.tsx` → `OrdersApp.tsx`

For each: `'use client'` + swap routers/translations + drop unused imports + numeric Image + drop legacyBehavior. Five separate commits.

### Task 3: Port mobile profile menu

`components_new/mobile/MobileProfileMenu.tsx` → `MobileProfileMenuApp.tsx`. Single commit.

---

## Phase B: Order + Tracking ports

### Task 4: Port order components (4 files)

- `components_new/order/OrderAccept.tsx` → `OrderAcceptApp.tsx` (447 lines)
- `components_new/order/OrderTracking.tsx` → `OrderTrackingApp.tsx` (282 lines, has `react-yandex-maps` — wrap dynamic if needed)
- `components_new/order/MobileOrders.tsx` → `MobileOrdersApp.tsx` (235 lines)
- `components_new/order/Orders.tsx` → `OrdersApp.tsx` (2555 lines — largest)

For Orders.tsx (2555 lines): port pattern. May need split into sub-components if too large for single subagent. Acceptable to drop sections if they import legacy code that breaks (Wave 7 polish restores).

Four commits.

### Task 5: Port cart page

`pages/[city]/cart.tsx` → `components_new/cart/CartApp.tsx`. Cart page logic migrated as client component with `useCart` SWR hook + axios CRUD basket-lines. ~1240 lines.

Single commit.

### Task 6: Port tracking client

`pages/[city]/track/[id]/index.client.tsx` → `components_new/track/TrackClientApp.tsx`. ~513 lines.

Single commit.

### Task 7: Port bonus pages

`pages/[city]/_bonus/index.tsx` → `components_new/bonus/BonusListApp.tsx`
`pages/[city]/_bonus/start/index.tsx` → `components_new/bonus/BonusStartApp.tsx`

Two commits.

---

## Phase C: 11 page.tsx + proxy + delete

### Task 8: Create 11 app/[city]/* page.tsx

Each follows pattern:
```typescript
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fetchSiteInfo } from '../../../lib/data/site-info'
import XApp from '../../../components_new/<group>/XApp'
import type { City } from '@commerce/types/cities'

export async function generateMetadata({ params }): Promise<Metadata> {
  const { city } = await params
  return {
    title: '<Title> | Chopar Pizza',
    alternates: { canonical: `https://choparpizza.uz/${city}/<route>`, ... },
  }
}

export default async function XPage({ params }) {
  const { city: citySlug } = await params
  const siteInfo = await fetchSiteInfo()
  const cities = (siteInfo as any).cities as City[]
  if (!cities.find((c) => c.slug === citySlug)) notFound()
  return <XApp />
}
```

For order/[id] and tracking — also fetch order via `fetchOrderById` server-side and pass as prop. For _bonus — fetch bonus products.

11 page.tsx files. Single commit per group:
- 1 commit: 4 order pages
- 1 commit: 4 profile pages
- 1 commit: cart + track + bonus (3 pages)

### Task 9: proxy.ts + delete 12 legacy

Add 11 literal patterns to `proxy.ts` matcher (note `_bonus` literally with underscore) — single commit.

Delete 12 legacy `pages/[city]/...` files — single commit (or 2: profile + others).

Verify build OK after deletions.

### Task 10: Verify dev + build

Standard pattern. Curl all 11 routes, expect HTTP 200 (or 401/redirect for auth-required).

### Task 11: DevTools MCP visual diff

For each page: snapshot prod vs local, document regressions.

### Task 12: Final Verification

DoD: file tree, TS clean, build OK, commits.

---

## Wave 5 Done. Что осталось:

- **Wave 6** — Cleanup: remove `pages/_app.tsx`, `_document.tsx`, `i18n.js`, legacy packages, switch `localePrefix` to `'as-needed'` with `[locale]` segment, delete legacy view components
- **Wave 7** — Polish: fix catalog mapping, restore SmallCart hydration, restore ThreePizza, snap PO translations from prod, address `useExtracted` MISSING_MESSAGE warnings

---

## Self-Review Checklist

- [ ] All ports use `'use client'`
- [ ] No `useRouter from 'next/router'`
- [ ] No `useTranslation from 'next-translate'`
- [ ] No `useTranslations`/`getTranslations` (only `useExtracted`/`getExtracted` if i18n needed; otherwise inline RU literals to avoid IntlError)
- [ ] Auth-required pages: server-side fetch via `getAuthToken` returns null → page handles gracefully (e.g., redirect or "please login" state)
- [ ] proxy.ts matcher — literal strings for all 11 routes
- [ ] Build OK after delete legacy
- [ ] Pages Router cleanup empty `pages/[city]/` (only `pages/api/` remaining)

---

## Realistic expectations

This wave is **second largest** in scope (~7600 LOC). Many ports may produce hydration crashes (like SmallCart in Wave 4). Strategy: **commit forward, document regressions for Wave 7**.

Expect multiple commits to disable broken hooks during port (e.g., `useCart` ref crashes, `react-yandex-maps` SSR issues). All such items go to Wave 7 polish list.

Estimate: **15-20 subagent dispatches**. Some large ports (Orders 2555 lines) may be split or partially completed.
