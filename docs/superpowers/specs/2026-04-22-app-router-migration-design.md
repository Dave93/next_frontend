# Дизайн миграции с Pages Router на App Router

**Дата:** 2026-04-22
**Проект:** Chopar Pizza (next_frontend)
**Текущая версия Next.js:** 16.2.2
**Стратегия:** Big Bang в feature-ветке
**Last updated:** 2026-04-22 (поправки после Wave 1)

---

## Lessons learned после Wave 1 (поправки к спеке)

1. **`localePrefix: 'never'` (не `'as-needed'`) пока сосуществуют Pages и App Router.**
   Next.js не позволяет `[locale]` (App) и `[city]` (Pages) на одном URL уровне ("different slug names for the same dynamic path"). До удаления `pages/[city]/` локаль определяется через `NEXT_LOCALE` cookie. Переключение на `'as-needed'` + `app/[locale]/...` структуру переносится в **Wave 5/6** одновременно с удалением `pages/[city]/`.

2. **`useExtracted`/`getExtracted` обязательны — `useTranslations`/`getTranslations` запрещены.** В dev mode `useExtracted('Текст')` возвращает inline-сообщение как есть; extraction → ключ → msgstr происходит на build time. Для проверки переводов в dev — `bun run build && bun run start`, не `bun dev`.

3. **`@/*` path alias непостоянен.** Next.js при каждом dev start удаляет нестандартные aliases из tsconfig. В новом коде используем относительные импорты или существующие aliases (`@lib`, `@components_new` и т.п.).

4. **Legacy `noopApi` пришлось пофиксить** в `framework/local/api/endpoints/*` чтобы default export возвращал handler `(req, res) => unknown` вместо `void`. Next 16 type validator более строгий.

5. **PostHog dual implementation:** `lib/posthog.tsx` использует `next/router.events` и работает только в Pages Router. Создан `lib/posthog-app.tsx` с `usePathname`/`useSearchParams` для App Router. После Wave 6 cleanup `posthog.tsx` удаляется, `posthog-app.tsx` переименовывается обратно.

6. **Composition `withNextIntl(nextTranslate(baseConfig))`** работает: оба плагина уживаются, Pages Router использует next-translate (legacy), App Router — next-intl. Warning от next-intl про `i18n` свойство в config — ожидаемый и безвредный во время cohabitation.

---

## 1. Цели и контекст

Перевести проект с Pages Router на App Router. Заодно:
- Заменить `next-translate` (динамическая загрузка переводов с API) на **`next-intl@4.5+`** с **`useExtracted`/`getExtracted`** (inline переводы, auto-extraction, формат `.po`).
- Удалить мёртвый CMS catch-all (`pages/[...pages].tsx` — `getAllPages` возвращает `[]`).
- Заменить `middleware.ts` парадигму на новый **`proxy.ts`** (Next 16).
- Сохранить недавние SEO-фичи: sitemap, hreflang, JSON-LD, canonical, security headers.

**Не трогаем (вне scope миграции):**
- Логику корзины/checkout/auth — только переписываем на новые API
- Бэкенд / API схему
- Дизайн / UI/UX
- Версии React (остаётся 18), Tailwind (2.2.2), сторонних либ
- PWA (отключён, оставляем как есть)

---

## 2. Текущее состояние

### Inventory

- **29 страниц** в `pages/` (1 root, 28 city-scoped + 1 product redirect)
- **30+ страниц с `getServerSideProps`**, 2 с `getStaticProps`/`getStaticPaths`, 1 `getInitialProps`
- **40+ мест** использования `next/router`
- **9+ `dynamic({ssr:false})`**
- **128 компонентов** в `components/` + `components_new/`
- **10 API routes** в `pages/api/`
- **Provider chain в `_app.tsx`**: PostHog → ReCaptcha → Head → FacebookPixel → ManagedUIContext → QueryClient → Layout
- **JSON-LD `Restaurant` + GTM** в `_document.tsx`
- **i18n**: `next-translate` с `loadLocaleFrom: ${API_URL}/api/get_langs?lang=...`
- **Cookies**: `next-cookies` (в SSR), `js-cookie` (на клиенте)

### Мёртвый код к удалению

- `pages/[...pages].tsx` — CMS catch-all, `getAllPages()` возвращает `[]`, `getPage()` возвращает `{}`
- `framework/local/api/operations/get-all-pages.ts`, `get-page.ts`
- `lib/get-slug.ts`, `lib/usage-warns.ts` (если использовались только в `[...pages].tsx`)
- `pwaTrackingListeners()` (PWA отключён)

---

## 3. Финальный стек

| Решение | Значение |
|---|---|
| Стратегия миграции | **Big Bang в feature-ветке**, переключение одним PR |
| Валидация | **Chrome DevTools MCP** — диф `localhost:5656` ↔ `https://choparpizza.uz` |
| i18n библиотека | **`next-intl@4.5+`** (установлен `4.9.1`) |
| API переводов | **`useExtracted`** (Client) / **`getExtracted`** (Server) — **строго запрещены `useTranslations`/`getTranslations`** |
| Формат хранения переводов | **`.po`** через `gettext-parser` loader в `i18n/request.ts` |
| Source locale | `ru` |
| URL locale prefix | **Wave 1-4: `'never'`** (cookie-based) → **Wave 5/6: `'as-needed'`** (URL-based с `[locale]` segment) |
| Источник переводов | **Снимаем визуально с прода** через Chrome DevTools MCP, локали ru/uz/en |
| Бэкенд `/api/get_langs` | Игнорируется (не используется в новом коде) |
| Edge file convention | **`proxy.ts`** (Next 16, заменяет `middleware.ts`) |
| Cookie reads (server) | `cookies()` из `next/headers` (заменяет `next-cookies`) |
| Cookie writes (client) | `js-cookie` (как сейчас, не трогаем) |
| Мутации | Server Actions для cart/checkout/auth/profile; route handlers для геокодинга и каталог-поиска |
| Метаданные | **Metadata API** (заменяет `next-seo`) |
| Скрипты (GTM/CRM) | `next/script` |
| Шрифты | `@font-face` сейчас → опционально на `next/font/local` в полировке |

### Удаляемые npm пакеты

- `next-translate`
- `next-translate-plugin`
- `next-cookies`
- `next-seo`

### Добавляемые npm пакеты

- `next-intl@^4.5`

---

## 4. Целевая архитектура

### 4.1. Структура `app/`

```
app/
├── layout.tsx                          # Root: <html lang>, <body>, fonts, GTM, JSON-LD, NextIntl + Providers
├── providers.tsx                       # 'use client' — PostHog, ReCaptcha, QueryClient, UI/Auth/Location, FacebookPixel
├── not-found.tsx                       # глобальный 404
├── error.tsx                           # 'use client' — error boundary (заменяет _error.js)
├── global-error.tsx                    # ошибки в root layout
├── page.tsx                            # минимальный fallback (редирект делает proxy.ts)
│
└── [city]/
    ├── layout.tsx                      # Header, Footer, модалки, ToastContainer, CityScopeProvider
    ├── not-found.tsx                   # city-scoped 404
    ├── page.tsx                        # главная города (меню + слайдеры)
    ├── cart/page.tsx                   # + actions.ts (Server Actions для cart/checkout)
    ├── about/
    │   ├── page.tsx
    │   └── fran/page.tsx
    ├── branch/page.tsx
    ├── contacts/page.tsx
    ├── delivery/page.tsx
    ├── privacy/page.tsx
    ├── news/
    │   ├── page.tsx
    │   └── [id]/page.tsx
    ├── sale/
    │   ├── page.tsx
    │   └── [id]/page.tsx
    ├── order/
    │   ├── page.tsx
    │   ├── [id]/page.tsx
    │   └── success/page.tsx
    ├── profile/
    │   ├── layout.tsx                  # nested: UserData sidebar + {children}
    │   ├── actions.ts                  # Server Actions: updateProfile, addAddress, ...
    │   ├── page.tsx
    │   ├── account/page.tsx
    │   ├── address/page.tsx
    │   └── orders/page.tsx
    ├── product/[id]/page.tsx
    ├── track/[id]/page.tsx             # server обёртка → client TrackClient
    └── _bonus/
        ├── page.tsx
        └── start/page.tsx

app/api/                                # Route Handlers (только то что нужно дёргать с клиента)
├── geocode/route.ts
├── geo/route.ts
└── catalog/products/route.ts

app/(auth)/
└── actions.ts                          # Server Actions: requestOtp, verifyOtp, logout

i18n/
├── routing.ts                          # defineRouting({locales, defaultLocale, localePrefix: 'as-needed'})
├── navigation.ts                       # createNavigation(routing) — Link, useRouter, redirect, ...
└── request.ts                          # getRequestConfig — load messages по locale

lib/data/                               # Server-side fetcher слой
├── site-info.ts
├── news.ts
├── sales.ts
├── orders.ts
├── bonus.ts
├── tracking.ts
├── products.ts
└── auth.ts                             # getAuthHeaders() — opt_token из cookies()

messages/
├── ru.po                               # source locale (snapshot с прода через DevTools MCP)
├── uz.po
└── en.po

proxy.ts                                # Node runtime — locale detection, city redirect, product redirect
```

### 4.2. `proxy.ts`

```typescript
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { NextResponse, type NextRequest } from 'next/server'

const intlProxy = createMiddleware(routing)

export function proxy(request: NextRequest) {
  // 1. Legacy product redirect: /product/123 → /[city]/product/123
  const productMatch = request.nextUrl.pathname.match(/^\/product\/(\d+)$/)
  if (productMatch) {
    const citySlug = request.cookies.get('city_slug')?.value || 'tashkent'
    return NextResponse.redirect(
      new URL(`/${citySlug}/product/${productMatch[1]}`, request.url)
    )
  }

  // 2. Root redirect: / → /[city]
  if (request.nextUrl.pathname === '/') {
    const citySlug = request.cookies.get('city_slug')?.value || 'tashkent'
    return NextResponse.redirect(new URL(`/${citySlug}`, request.url))
  }

  // 3. next-intl: locale detection + redirect (RU без префикса, /uz/*, /en/*)
  return intlProxy(request)
}

export const config = {
  matcher: '/((?!api|_next|_vercel|.*\\..*).*)',
}
```

### 4.3. `i18n/routing.ts`

```typescript
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['ru', 'uz', 'en'],
  defaultLocale: 'ru',
  localePrefix: 'as-needed',  // RU без префикса (текущее поведение, важно для SEO)
})
```

### 4.4. `i18n/navigation.ts`

```typescript
import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
```

### 4.5. `i18n/request.ts`

**Primary path — нативная PO поддержка `next-intl@4.5+`:**

Если `createNextIntlPlugin({ messages: { format: 'po' } })` загружает `.po` автоматически (через build-time loader), `i18n/request.ts` упрощается:

```typescript
import { getRequestConfig } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale
  return { locale }  // messages подгружает плагин
})
```

**Fallback path — manual PO parsing** (если нативная поддержка не сработает или окажется в другом виде, чем ожидается на момент Wave 1):

```typescript
import { getRequestConfig } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { routing } from './routing'
import { promises as fs } from 'fs'
import path from 'path'
import gettext from 'gettext-parser'

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale
  const poBuffer = await fs.readFile(path.join(process.cwd(), 'messages', `${locale}.po`))
  const parsed = gettext.po.parse(poBuffer)
  const messages: Record<string, string> = {}
  for (const ctx of Object.values(parsed.translations)) {
    for (const entry of Object.values(ctx)) {
      if (entry.msgid) messages[entry.msgid] = entry.msgstr[0] || entry.msgid
    }
  }
  return { locale, messages }
})
```

**Решение по выбору пути** делается в Wave 1 после первого запуска `bun dev` с `useExtracted` хуком: проверяем читаются ли `.po` нативно. Если да — primary path; если нет — fallback с `gettext-parser`.

### 4.6. `next.config.js` изменения

```diff
+const createNextIntlPlugin = require('next-intl/plugin')
+const withNextIntl = createNextIntlPlugin('./i18n/request.ts', {
+  experimental: {
+    extract: { sourceLocale: 'ru' },
+    messages: { format: 'po', locales: 'infer' },
+  },
+})

-const nextTranslate = require('next-translate-plugin')
-module.exports = nextTranslate({...})
+module.exports = withNextIntl({...})

  // Удалить:
-  i18n: {...}                   // next-translate
-  rewrites: [/checkout/, /logout/, vendure-rewrite]  // legacy BC/Shopify
```

### 4.7. `app/layout.tsx`

```typescript
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import Script from 'next/script'
import Providers from './providers'
import RestaurantJsonLd from '@components_new/seo/RestaurantJsonLd'

import '@assets/fonts.css'
import '@assets/chrome-bug.css'
import 'tailwindcss/tailwind.css'
import 'keen-slider/keen-slider.min.css'
import 'react-toastify/dist/ReactToastify.css'
import '@egjs/flicking-plugins/dist/arrow.css'
import '@components_new/header/DatePicker.css'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const messages = await getMessages()

  return (
    <html lang="ru">
      <head>
        <RestaurantJsonLd />
      </head>
      <body>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-TSJ79WZ"
            height="0" width="0" style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        <NextIntlClientProvider messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-TSJ79WZ');`}
        </Script>
        <Script src="https://crm.choparpizza.uz/widget.js" strategy="lazyOnload" />
      </body>
    </html>
  )
}
```

**Удалено vs `_document.tsx` + `_app.tsx`:**
- `<body className="loading">` + class removal hack — не нужен в App Router
- `setTimeout(3000)` для CRM скрипта → `<Script strategy="lazyOnload" />`
- `pwaTrackingListeners()` — PWA выключен

### 4.8. `app/providers.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { PostHogProvider } from 'posthog-js/react'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { UIContextProvider } from '@components/ui/context'
import { AuthProvider } from '@components_new/auth/AuthProvider'
import { LocationProvider } from '@components_new/location/LocationProvider'
import FacebookPixel from '@components/common/FacebookPixel'
import posthog from 'posthog-js'

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 60_000 } } })
  )

  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    })
  }, [])

  return (
    <PostHogProvider client={posthog}>
      <GoogleReCaptchaProvider reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_KEY!} language="ru">
        <FacebookPixel />
        <AuthProvider>
          <LocationProvider>
            <UIContextProvider>
              <QueryClientProvider client={queryClient}>
                {children}
              </QueryClientProvider>
            </UIContextProvider>
          </LocationProvider>
        </AuthProvider>
      </GoogleReCaptchaProvider>
    </PostHogProvider>
  )
}
```

### 4.9. `app/[city]/layout.tsx`

```typescript
import Header from '@components_new/header/Header'
import Footer from '@components_new/common/Footer'
import { ToastContainer } from 'react-toastify'
import { CityScopeProvider } from '@components_new/city/CityScopeProvider'
import { fetchSiteInfo } from '@lib/data/site-info'
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
  const { cities } = await fetchSiteInfo()
  return cities.map(c => ({ city: c.slug }))
}
export const dynamicParams = true

export default async function CityLayout({
  children, params,
}: {
  children: React.ReactNode
  params: Promise<{ city: string }>
}) {
  const { city } = await params
  const siteInfo = await fetchSiteInfo()
  const currentCity = siteInfo.cities.find(c => c.slug === city)
  if (!currentCity) notFound()

  return (
    <CityScopeProvider city={currentCity} siteInfo={siteInfo}>
      <Header />
      <main>{children}</main>
      <Footer />
      <ToastContainer />
    </CityScopeProvider>
  )
}
```

`siteInfo` грузится **один раз** (благодаря `fetch` дедупликации Next 16) и шарится между layout и вложенными страницами.

### 4.10. `app/[city]/profile/layout.tsx`

```typescript
import UserData from '@components_new/profile/UserData'
import MobileProfileMenu from '@components_new/profile/MobileProfileMenu'

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <aside className="hidden md:block w-64"><UserData /></aside>
      <div className="md:hidden"><MobileProfileMenu /></div>
      <div className="flex-1">{children}</div>
    </div>
  )
}
```

`UserData` рендерится один раз — при навигации между вкладками (account/address/orders) не размонтируется.

---

## 5. Data Fetching

### 5.1. Слой `lib/data/*`

Изолируем все fetch'и от страниц:

```typescript
// lib/data/news.ts
import 'server-only'
import { cookies } from 'next/headers'

export async function fetchNews({ cityId, locale }: { cityId: number; locale: string }) {
  const res = await fetch(
    `${process.env.API_URL}/api/news/public?city_id=${cityId}&locale=${locale}`,
    { next: { revalidate: 300, tags: ['news'] } }
  )
  if (!res.ok) throw new Error('Failed to fetch news')
  return res.json()
}

export async function fetchNewsById(id: string, cityId: number) {
  const res = await fetch(
    `${process.env.API_URL}/api/news/public/${id}/?city_id=${cityId}`,
    { next: { revalidate: 600, tags: [`news-${id}`] } }
  )
  if (!res.ok) return null
  return res.json()
}
```

В странице — берём `cityId` из layout-fetched `siteInfo`:

```typescript
// app/[city]/news/[id]/page.tsx
export default async function NewsDetailPage({ params }) {
  const { city, id } = await params
  const siteInfo = await fetchSiteInfo()  // дедуплицируется с layout
  const currentCity = siteInfo.cities.find(c => c.slug === city)!
  const news = await fetchNewsById(id, currentCity.id)
  if (!news) notFound()
  return <NewsDetail news={news} />
}
```

```typescript
// lib/data/auth.ts
import 'server-only'
import { cookies } from 'next/headers'

export async function getAuthHeaders(): Promise<HeadersInit> {
  const cookieStore = await cookies()
  const token = cookieStore.get('opt_token')?.value
  return token ? { Authorization: `Bearer ${token}` } : {}
}
```

### 5.2. Кэширование стратегия

| Тип данных | Strategy | Tag |
|---|---|---|
| `getSiteInfo` (категории/города/бренды) | `revalidate: 3600` | `site-info` |
| Каталог продуктов | `revalidate: 600` | `products` |
| Один продукт по ID | `revalidate: 600` | `product-${id}` |
| Списки новостей/акций | `revalidate: 300` | `news`/`sales` |
| Одна новость/акция | `revalidate: 600` | `news-${id}`/`sale-${id}` |
| Заказы пользователя | `cache: 'no-store'` | — |
| Бонусы пользователя | `cache: 'no-store'` | — |
| Tracking | `cache: 'no-store'` | — |
| Геокодинг (через route handler) | client-side, без Next кэша | — |

**Критично:** все авторизованные fetch'и → `cache: 'no-store'`. Code review должно ловить нарушения.

### 5.3. Параллельная загрузка

```typescript
const [siteInfo, news, sliders] = await Promise.all([
  fetchSiteInfo(),
  fetchNews({ cityId, locale }),
  fetchSliders({ locale }),
])
```

### 5.4. Streaming

`loading.tsx` для тяжёлых страниц (главная города, каталог) — показывает skeleton, пока сервер стримит. Personal pages (cart, profile, checkout) — без `loading.tsx` (нужен auth check до рендера).

### 5.5. Server Actions vs Route Handlers

**Server Actions (`'use server'`):**
- `app/[city]/cart/actions.ts`: addToBasket, removeFromBasket, updateQuantity, applyPromo
- `app/[city]/cart/actions.ts`: submitCheckout
- `app/[city]/profile/actions.ts`: updateProfile, addAddress, removeAddress, updateAddress
- `app/(auth)/actions.ts`: requestOtp, verifyOtp, logout

**Route Handlers (`app/api/*/route.ts`):**
- `geocode/route.ts` — нужна низкая латентность для autocomplete
- `geo/route.ts` — IP geo при первом визите
- `catalog/products/route.ts` — продуктовый поиск с клиента (debounced)

---

## 6. Routing & Navigation

### 6.1. `next/router` → `@/i18n/navigation`

40+ мест. Маппинг:

| Старый (`next/router`) | Новый |
|---|---|
| `useRouter()` | `useRouter()` из `@/i18n/navigation` |
| `router.push('/x')` | `router.push('/x')` (работает) |
| `router.replace()` | `router.replace()` |
| `router.back()` | `router.back()` |
| `router.query` | `useSearchParams()` (для query) + `useParams()` (для динамических сегментов) |
| `router.pathname` | `usePathname()` из `@/i18n/navigation` |
| `router.asPath` | `usePathname()` + `useSearchParams()` |
| `router.locale` | `useLocale()` из `next-intl` |
| `router.events` | **нет аналога** — `useEffect(() => {...}, [usePathname()])` |
| `router.isReady`, `router.isFallback` | не нужны |

### 6.2. `next/link` → `@/i18n/navigation`

```diff
-import Link from 'next/link'
-<Link href="/x" prefetch={false} legacyBehavior>
-  <a className="...">text</a>
-</Link>
+import { Link } from '@/i18n/navigation'
+<Link href="/x" prefetch={false} className="...">text</Link>
```

`legacyBehavior` удаляется. После миграции — `prefetch={false}` можно убрать в большинстве мест (Next 16 prefetch'ит только при hover).

### 6.3. Метаданные через Metadata API

```typescript
// app/[city]/news/[id]/page.tsx
import type { Metadata } from 'next'

export async function generateMetadata({ params }): Promise<Metadata> {
  const { city, id } = await params
  const news = await fetchNewsById(id, /* cityId */)
  return {
    title: news.title,
    description: news.excerpt,
    alternates: {
      canonical: `https://choparpizza.uz/${city}/news/${id}`,
      languages: {
        ru: `https://choparpizza.uz/${city}/news/${id}`,
        uz: `https://choparpizza.uz/uz/${city}/news/${id}`,
        en: `https://choparpizza.uz/en/${city}/news/${id}`,
      },
    },
    openGraph: { title: news.title, description: news.excerpt, images: [news.image] },
  }
}
```

`next-seo` пакет удаляется. Hreflang/canonical сохраняются (commit `fd7c7ccd`).

---

## 7. Client/Server Boundaries

### 7.1. `'use client'` — только листья с интерактивом

Триггеры:
- `useState` / `useReducer` / `useEffect`
- `useContext` (UI/cart/customer)
- Browser API (`window`, `localStorage`)
- Event handlers
- Сторонние client-only либы: `react-leaflet`, `react-yandex-maps`, `keen-slider`, `react-toastify`, `posthog-js`, `react-slick`, `@egjs/react-flicking`, `@headlessui/react` модалки

### 7.2. Категории компонентов

**A. Останутся / станут Server Components:**
- `Footer` (статика)
- `Delivery`, `About`, `Fran`, `Branch`, `Contacts`, `Privacy`
- `RestaurantJsonLd`
- `CategoriesMenu` (рендерит ссылки)
- `NewsItem`, `SaleItem` (один элемент списка)
- `ProductListSectionTitle`

**B. Станут `'use client'`:**
- `Header` (городской селектор, корзина, поиск)
- `MobSetLocation`
- `MainSlider`, `ThreePizza`
- `ProductItemNew`, `CreateYourPizzaCommon`
- `SmallCart`, `SmallCartMobile`
- `Orders`, `MobileOrders`, `OrderAccept`
- `UserData`, `PersonalData`, `Address`, `Bonuses`
- `MobileProfileMenu`, `NewsDetail`
- Все формы (`react-hook-form`)
- Все модалки (`AuthModal`, `CityModal`, `BonusModal`)
- Все слайдеры/карты
- `FacebookPixel`

**C. Server обёртка → Client child:**
- `app/[city]/news/[id]/page.tsx` (server fetch) → `<NewsDetail news={news} />` (client)
- `app/[city]/track/[id]/page.tsx` (server) → `<TrackClient orderId={orderId} />` (client)
- `app/[city]/order/[id]/page.tsx` (server, `cache: 'no-store'`) → `<OrderDetail order={order} />` (client polling)
- `app/[city]/cart/page.tsx` (server initial load) → `<CartView initial={cart} />` (client управление)

### 7.3. `dynamic({ ssr: false })` миграция

Большинство — просто `'use client'` (без `dynamic`).

Исключения, где нужен полный отказ от SSR:
- `react-leaflet`, `react-yandex-maps` — wrap с `dynamic({ ssr: false })` внутри client компонента + `useEffect` mounted флаг

```typescript
'use client'
import dynamic from 'next/dynamic'
const Map = dynamic(() => import('./MapInner'), { ssr: false, loading: () => <MapSkeleton /> })
```

### 7.4. Контексты — разделяем

`ManagedUIContext` — слишком жирный. Разбиваем:

| Контекст | Назначение | Источник данных |
|---|---|---|
| `CityScopeProvider` | `currentCity`, `siteInfo` (categories/brands) | server (props из `[city]/layout.tsx`) |
| `UIContextProvider` | модалки, sidebar visibility | client only |
| `AuthProvider` | `user`, login/logout (через Server Actions) | hybrid |
| `LocationProvider` | координаты доставки | client only (localStorage backed) |

**Смена города:** при выборе нового города в `CityModal` клиентский код вызывает `router.push('/${newCitySlug}/...')` через `next/navigation`. Это триггерит navigation, Next перерендерит `[city]/layout.tsx` с новым `params.city` → `fetchSiteInfo` найдёт новый `currentCity` → `CityScopeProvider` получит новые props → пере-рендерит детей. Cookie `city_slug` обновляется через `js-cookie` в client handler перед `router.push`.

`CityScopeProvider` сам по себе stateless — это просто `React.createContext` обёртка над props. Никакого `useState` — single source of truth это URL.

### 7.5. Переводы

```diff
-import useTranslation from 'next-translate/useTranslation'
-const { t: tr } = useTranslation('common')
-tr('add_to_cart')
+import { useExtracted } from 'next-intl'
+const t = useExtracted()
+t('Добавить в корзину')
```

В Server Components:
```typescript
import { getExtracted } from 'next-intl/server'
const t = await getExtracted()
t('О компании')
```

---

## 8. Wave-based порядок работ внутри ветки

> Big Bang в смысле "один PR в main". Внутри ветки — incremental waves для валидации через DevTools MCP.

### Wave 1 — Фундамент (Day 1-2)
1. `bun add next-intl@latest`, `bun remove next-translate next-translate-plugin next-cookies next-seo`
2. Создать `i18n/routing.ts`, `i18n/navigation.ts`, `i18n/request.ts`
3. Создать `proxy.ts`
4. Создать `app/layout.tsx`, `app/providers.tsx`, `app/not-found.tsx`, `app/error.tsx`, `app/global-error.tsx`
5. Создать `lib/data/site-info.ts`, `lib/data/auth.ts`
6. Удалить `pages/_app.tsx`, `pages/_document.tsx` (App Router root layout берёт верх)
7. Создать минимальный `app/page.tsx` (для теста)
8. Verify: `bun dev` запускается, hot reload работает

### Wave 2 — Статика (Day 2-3)
- `app/[city]/layout.tsx` (Header, Footer, модалки, CityScope)
- `app/[city]/about/page.tsx`, `about/fran/page.tsx`
- `app/[city]/contacts/page.tsx`
- `app/[city]/delivery/page.tsx`
- `app/[city]/branch/page.tsx`
- `app/[city]/privacy/page.tsx`
- `app/[city]/not-found.tsx`
- Удалить соответствующие `pages/[city]/...`
- **DevTools MCP валидация для каждой страницы**

### Wave 3 — Контент (Day 3-5)
- `app/[city]/news/page.tsx`, `news/[id]/page.tsx`
- `app/[city]/sale/page.tsx`, `sale/[id]/page.tsx`
- Удалить старые
- DevTools MCP валидация

### Wave 4 — Каталог (Day 5-7)
- `app/[city]/page.tsx` (главная — самая сложная)
- `app/[city]/product/[id]/page.tsx`
- `app/page.tsx` + редирект через `proxy.ts`
- Удалить `pages/index.tsx`, `pages/[city]/index.tsx`, `pages/[city]/product/[id].tsx`, `pages/product/[id].tsx`
- DevTools MCP валидация: каталог, продукт, add-to-cart

### Wave 5 — Personal (Day 7-9)
- `app/[city]/cart/page.tsx` + `actions.ts` (Server Actions для cart)
- `app/[city]/order/page.tsx`, `order/[id]/page.tsx`, `order/success/page.tsx`
- `app/[city]/profile/layout.tsx`, `profile/page.tsx`, `account/page.tsx`, `address/page.tsx`, `orders/page.tsx`
- `app/[city]/profile/actions.ts`
- `app/(auth)/actions.ts` (login/logout)
- `app/[city]/track/[id]/page.tsx`
- `app/[city]/_bonus/page.tsx`, `_bonus/start/page.tsx`
- DevTools MCP: e2e flow (каталог → cart → checkout → success → tracking)

### Wave 6 — API + Cleanup (Day 9-10)
- Перенести `app/api/geocode/route.ts`, `geo/route.ts`, `catalog/products/route.ts`
- Удалить `pages/api/` целиком
- Удалить `pages/404.tsx`, `pages/_error.js`
- Удалить `pages/[...pages].tsx`
- Удалить `framework/local/api/operations/get-all-pages.ts`, `get-page.ts`
- Удалить `pages/` директорию
- Удалить `i18n.js`
- Очистить `next.config.js` (убрать next-translate, ненужные rewrites)

### Wave 7 — Полировка (Day 10-12)
- Lighthouse аудит всех страниц
- Bundle analyzer — сравнение с baseline
- Опционально: миграция шрифтов на `next/font/local`
- Финальная сверка `messages/{ru,uz,en}.po`
- Заполнить пропущенные переводы (DevTools MCP обход прода для всех 3 локалей)

---

## 9. Валидация (Chrome DevTools MCP)

### 9.1. Workflow для каждой страницы

```
1. bun dev → http://localhost:5656
2. new_page("https://choparpizza.uz/<path>")
3. new_page("http://localhost:5656/<path>")
4. take_snapshot() для обеих
5. take_screenshot() для обеих
6. Сравнить:
   - Layout (header, footer, контентные блоки)
   - Тексты (переводы корректны)
   - Картинки грузятся
   - Стили (spacing, typography, цвета)
   - Интерактив (клик по продукту → модалка)
7. list_network_requests() — нет 4xx/5xx
8. list_console_messages() — нет errors/warnings (особенно hydration mismatch)
9. lighthouse_audit() для главной + продукта
10. Mobile: emulate({device: 'iPhone 15 Pro'})
```

### 9.2. Per-page чеклист

```markdown
- [ ] URL соответствует прод (с учётом /uz, /en префиксов)
- [ ] Server-rendered HTML содержит ключевые блоки (view-source)
- [ ] Нет hydration mismatch warning
- [ ] Все network requests 2xx (или ожидаемые 4xx)
- [ ] Изображения с правильного CDN
- [ ] title, description, og:image, canonical, hreflang
- [ ] JSON-LD валиден
- [ ] Mobile responsive (375 / 768 / 1024)
- [ ] Переводы для ru/uz/en соответствуют проду
- [ ] Cookies (basketId, opt_token, city_slug) работают
- [ ] React Query cache работает
- [ ] Server Actions возвращают корректные ответы
```

### 9.3. PR Acceptance criteria

- [ ] Все 28+ страниц провалидированы через DevTools MCP
- [ ] `bun run build` без warnings
- [ ] `tsc --noEmit` зелёный
- [ ] Все `messages/{ru,uz,en}.po` заполнены
- [ ] Lighthouse: Performance / SEO / Accessibility не упали vs прод
- [ ] Sitemap (commit `d53d790e`) и hreflang (commit `fd7c7ccd`) сохранены
- [ ] Manual smoke: каталог → product → add-to-cart → cart → checkout → success → order detail → tracking
- [ ] Manual auth: phone OTP login → profile → logout
- [ ] Mobile UX
- [ ] Нет упоминаний `next-translate`, `next-cookies`, `next-seo`, `next/router`, `getServerSideProps`, `getStaticProps`, `_app`, `_document`, `Component.Layout`
- [ ] `pages/` директория удалена

---

## 10. Risks & Mitigations

| Риск | Mitigation |
|---|---|
| Hydration mismatch | DevTools MCP console check на каждой странице, никаких warning |
| Утечка данных между пользователями (cache misuse) | Все авторизованные fetch — `cache: 'no-store'`; code review правило |
| SEO регрессия | Lighthouse + view-source check; sitemap не трогаем |
| Сломанные cookies (auth, cart) | Manual e2e test |
| Перевод не подсмотрен с прода | Скрипт обхода прода с `take_snapshot` для всех 3 локалей до Wave 7 |
| Server Action timeout | per-action try/catch + `toast.error()` |
| Bundle size регрессия | `bun run analyze` сравнение до/после |
| `react-leaflet` падает в SSR | Wrapper с `useEffect` mounted check |
| Прод rewrites сломались | Smoke test BC/Shopify URL'ов (если используются) |
| `next-intl@4.5` PO support — экспериментальный | Fallback: в `i18n/request.ts` парсим `.po` через `gettext-parser` сами |

---

## 11. Ссылки

- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [Renaming Middleware to Proxy](https://nextjs.org/docs/messages/middleware-to-proxy)
- [proxy.js file convention](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)
- [next-intl: useExtracted (experimental)](https://next-intl.dev/docs/usage/extraction)
- [next-intl: useExtracted blog](https://next-intl.dev/blog/use-extracted)
- [next-intl: Proxy/middleware](https://next-intl.dev/docs/routing/middleware)
- [next-intl + Next.js 16 proxy fix](https://www.buildwithmatija.com/blog/next-intl-nextjs-16-proxy-fix)
