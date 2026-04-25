# App Router Migration — Wave 1: Foundation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Поднять параллельный App Router (`app/` директорию) с фундаментом: `next-intl@4.5+` с `useExtracted`/`getExtracted`, `proxy.ts` (Next 16), root `layout.tsx` со всеми провайдерами, `error`/`not-found` boundaries, минимальную тестовую страницу. По завершении — `bun dev` запускается, `app/page.tsx` рендерится в браузере, `useExtracted`/`getExtracted` работают, существующие `pages/[city]/...` продолжают работать (для последующих волн миграции).

**Architecture:** Big Bang в feature-ветке `migration/app-router`. Wave 1 = инфраструктура. App Router и Pages Router **сосуществуют** на протяжении Waves 1-5 — это позволяет валидировать каждую группу страниц через Chrome DevTools MCP без поломки остальных. Wave 1 ДОБАВЛЯЕТ `next-intl` рядом с `next-translate` (оба пакета установлены), создаёт `app/layout.tsx`, `app/providers.tsx`, `proxy.ts`, error/not-found boundaries. **НЕ удаляет** `pages/_app.tsx`, `pages/_document.tsx`, `i18n.js`, `next-translate`, `next-cookies`, `next-seo` — они нужны для существующих `pages/[city]/...`. Удаление legacy инфраструктуры одной волной происходит в **Wave 6 (Cleanup)** после миграции всех страниц. `proxy.ts` matcher включает только URL'ы обработанные App Router (в Wave 1: `/`, `/_test`); расширяется по мере миграции страниц в Wave 2-5.

**Tech Stack:** Next.js 16.2.2, React 18, TypeScript 5.3.3, `next-intl@^4.5`, `gettext-parser`, Tailwind 2, `@tanstack/react-query`, `posthog-js`, `react-google-recaptcha-v3`, `react-toastify`, Bun runtime.

**Reference spec:** `docs/superpowers/specs/2026-04-22-app-router-migration-design.md`

---

## File Structure

### Created

| Файл | Ответственность |
|---|---|
| `i18n/routing.ts` | Конфиг локалей и стратегии префиксов (`as-needed`) для next-intl |
| `i18n/navigation.ts` | `Link`, `useRouter`, `usePathname`, `redirect` локализованные |
| `i18n/request.ts` | `getRequestConfig` — загружает `messages/{locale}.po` через `gettext-parser` |
| `proxy.ts` | Node runtime: legacy product redirect, root → city redirect, next-intl middleware |
| `lib/data/site-info.ts` | `fetchSiteInfo()` — типизированная обёртка над `commerce.getSiteInfo()` с кэшем |
| `lib/data/auth.ts` | `getAuthHeaders()` — читает `opt_token` из `cookies()` для server fetch'ей |
| `components_new/seo/RestaurantJsonLd.tsx` | Server Component с JSON-LD `Restaurant` schema (был в `_document.tsx`) |
| `app/providers.tsx` | `'use client'` обёртка: PostHog, ReCaptcha, FacebookPixel, QueryClient, ManagedUIContext |
| `app/layout.tsx` | Root: `<html lang>`, `<body>`, fonts, GTM noscript+script, JSON-LD, NextIntlClientProvider + Providers |
| `app/not-found.tsx` | Глобальный 404 |
| `app/error.tsx` | `'use client'` — error boundary для всех страниц |
| `app/global-error.tsx` | `'use client'` — error boundary для ошибок в root layout |
| `app/page.tsx` | Минимальный fallback (редирект в `proxy.ts`) — рендерит селектор города |
| `messages/ru.po` | Пустой PO для RU (заполняется при extraction) |
| `messages/uz.po` | Пустой PO для UZ |
| `messages/en.po` | Пустой PO для EN |
| `app/_test/page.tsx` | Тест `useExtracted`/`getExtracted` (удаляется в конце Wave 1) |

### Modified

| Файл | Изменение |
|---|---|
| `package.json` | **Add only:** `next-intl@^4.5`, `gettext-parser`, `@types/gettext-parser`. Старые (`next-translate`, `next-cookies`, `next-seo`) **остаются** — нужны для legacy pages (удалятся в Wave 6) |
| `next.config.js` | **Обернуть** `nextTranslate(baseConfig)` в `withNextIntl(...)` — оба плагина работают одновременно. Legacy rewrites не трогаем (могут использоваться) |
| `tsconfig.json` | Добавить path alias `@/*` → `./*` (для `next-intl` соглашений) |

### Untouched in Wave 1 (deleted in Wave 6)

| Файл | Причина |
|---|---|
| `pages/_app.tsx` | Pages Router root для legacy `pages/[city]/...` — нужен пока они существуют |
| `pages/_document.tsx` | Pages Router document — нужен пока legacy pages существуют |
| `i18n.js` | `next-translate-plugin` config — нужен пока legacy pages используют `useTranslation` |

### Untouched (other waves)

`pages/[city]/...`, `pages/[...pages].tsx`, `pages/index.tsx`, `pages/product/[id].tsx`, `pages/api/...`, `pages/404.tsx`, `pages/_error.js` — продолжают работать через legacy Pages Router до миграции в Waves 2-6.

---

## Pre-flight

Создать ветку, убедиться что мы в чистом состоянии (committed working changes that're not part of this work).

- [ ] **Step 1: Создать feature-ветку**

Run:
```bash
git checkout -b migration/app-router
git status
```

Expected: `On branch migration/app-router`, `working tree clean` (или известные незакоммиченные `bun.lockb`/`next-env.d.ts`/`package.json` от bun).

- [ ] **Step 2: Зафиксировать baseline артефактов сборки (для diff после Wave 1)**

Run:
```bash
bun install
bun run build > /tmp/build-baseline.log 2>&1 && echo "BUILD OK" || echo "BUILD FAILED"
ls -la .next/
```

Expected: `BUILD OK`. Если `BUILD FAILED` — останавливаемся, разбираемся (Wave 1 предполагает рабочий baseline).

---

## Task 1: Установка зависимостей (только add)

**Files:**
- Modify: `package.json`
- Modify: `bun.lockb` (autogen)

> **Важно:** в Wave 1 мы только **добавляем** новые пакеты. `next-translate`, `next-translate-plugin`, `next-cookies`, `next-seo` остаются установленными — они нужны для legacy `pages/[city]/...`. Их удаление будет в Wave 6 после миграции всех страниц.

- [ ] **Step 1: Установить новые пакеты**

Run:
```bash
bun add next-intl@^4.5 gettext-parser
bun add -d @types/gettext-parser
```

Expected: `installed 3 packages`.

- [ ] **Step 2: Проверить версии**

Run:
```bash
cat package.json | grep -E '"next-intl"|"gettext-parser"|"@types/gettext-parser"'
```

Expected: три строки с версиями (`next-intl@^4.5.x`, `gettext-parser@^...`, `@types/gettext-parser@^...`).

- [ ] **Step 3: Проверить что legacy пакеты на месте**

Run:
```bash
cat package.json | grep -E '"next-translate"|"next-cookies"|"next-seo"|"next-translate-plugin"'
```

Expected: четыре строки — все legacy пакеты сохранены.

- [ ] **Step 4: Verify install**

Run:
```bash
bun install
```

Expected: completes without errors.

- [ ] **Step 5: Commit**

Run:
```bash
git add package.json bun.lockb
git commit -m "chore: add next-intl + gettext-parser (alongside legacy next-translate)"
```

---

## Task 2: TypeScript path alias `@/*`

**Files:**
- Modify: `tsconfig.json`

`next-intl` документация по соглашению использует `@/i18n/...`, `@/components/...`. Добавляем path alias чтобы это работало; существующие `@lib`, `@components_new` и т.д. остаются.

- [ ] **Step 1: Обновить tsconfig.json**

Edit `tsconfig.json`, в секции `compilerOptions.paths` добавить новый alias **первым**:

```json
"paths": {
  "@/*": ["./*"],
  "@lib/*": ["lib/*"],
  ...
}
```

Полный новый `paths`:

```json
"paths": {
  "@/*": ["./*"],
  "@lib/*": ["lib/*"],
  "@utils/*": ["utils/*"],
  "@config/*": ["config/*"],
  "@assets/*": ["assets/*"],
  "@components/*": ["components/*"],
  "@components_new/*": ["components_new/*"],
  "@commerce": ["framework/commerce"],
  "@commerce/*": ["framework/commerce/*"],
  "@framework": ["framework/local"],
  "@framework/*": ["framework/local/*"]
}
```

- [ ] **Step 2: Verify TypeScript**

Run:
```bash
bunx tsc --noEmit
```

Expected: completes without errors (или с теми же ошибками, что были до изменения — alias не должен ничего ломать).

- [ ] **Step 3: Commit**

Run:
```bash
git add tsconfig.json
git commit -m "chore(ts): add @/* path alias for next-intl convention"
```

---

## Task 3: i18n/routing.ts

**Files:**
- Create: `i18n/routing.ts`

- [ ] **Step 1: Создать файл**

Write `i18n/routing.ts`:

```typescript
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['ru', 'uz', 'en'],
  defaultLocale: 'ru',
  localePrefix: 'as-needed',
})
```

- [ ] **Step 2: Verify типы**

Run:
```bash
bunx tsc --noEmit
```

Expected: no new errors. Если `next-intl/routing` не найден — проверить что Task 1 выполнен.

- [ ] **Step 3: Commit**

Run:
```bash
git add i18n/routing.ts
git commit -m "feat(i18n): add routing config (ru default, uz/en, prefix as-needed)"
```

---

## Task 4: i18n/navigation.ts

**Files:**
- Create: `i18n/navigation.ts`

- [ ] **Step 1: Создать файл**

Write `i18n/navigation.ts`:

```typescript
import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
```

- [ ] **Step 2: Verify**

Run:
```bash
bunx tsc --noEmit
```

Expected: no new errors.

- [ ] **Step 3: Commit**

Run:
```bash
git add i18n/navigation.ts
git commit -m "feat(i18n): add localized navigation helpers (Link, useRouter, redirect)"
```

---

## Task 5: messages/{ru,uz,en}.po — пустые stub'ы

**Files:**
- Create: `messages/ru.po`
- Create: `messages/uz.po`
- Create: `messages/en.po`

- [ ] **Step 1: Создать `messages/ru.po`**

Write `messages/ru.po`:

```po
# Chopar Pizza — RU translations (source locale)
# Auto-managed by next-intl useExtracted/getExtracted
msgid ""
msgstr ""
"Content-Type: text/plain; charset=UTF-8\n"
"Language: ru\n"

msgid "__test_extracted_message__"
msgstr "__test_extracted_message__"
```

- [ ] **Step 2: Создать `messages/uz.po`**

Write `messages/uz.po`:

```po
# Chopar Pizza — UZ translations
msgid ""
msgstr ""
"Content-Type: text/plain; charset=UTF-8\n"
"Language: uz\n"

msgid "__test_extracted_message__"
msgstr "__test_extracted_message___uz"
```

- [ ] **Step 3: Создать `messages/en.po`**

Write `messages/en.po`:

```po
# Chopar Pizza — EN translations
msgid ""
msgstr ""
"Content-Type: text/plain; charset=UTF-8\n"
"Language: en\n"

msgid "__test_extracted_message__"
msgstr "__test_extracted_message___en"
```

- [ ] **Step 4: Verify файлы есть**

Run:
```bash
ls -la messages/
```

Expected: `ru.po`, `uz.po`, `en.po` присутствуют.

- [ ] **Step 5: Commit**

Run:
```bash
git add messages/
git commit -m "feat(i18n): add empty PO stubs for ru/uz/en (test message included)"
```

---

## Task 6: i18n/request.ts (PO loader через gettext-parser)

**Files:**
- Create: `i18n/request.ts`

Используем fallback path (manual `gettext-parser`) как primary — это надёжнее чем экспериментальная нативная поддержка `next-intl@4.5`. Если в Wave 7 окажется что нативный path работает лучше — упростим.

- [ ] **Step 1: Создать файл**

Write `i18n/request.ts`:

```typescript
import { getRequestConfig } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { promises as fs } from 'fs'
import path from 'path'
import gettext from 'gettext-parser'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale

  const poBuffer = await fs.readFile(
    path.join(process.cwd(), 'messages', `${locale}.po`)
  )
  const parsed = gettext.po.parse(poBuffer)

  const messages: Record<string, string> = {}
  for (const ctx of Object.values(parsed.translations)) {
    for (const entry of Object.values(ctx)) {
      if (entry.msgid) {
        messages[entry.msgid] = entry.msgstr[0] || entry.msgid
      }
    }
  }

  return { locale, messages }
})
```

- [ ] **Step 2: Verify TypeScript**

Run:
```bash
bunx tsc --noEmit
```

Expected: no errors. Если `gettext-parser` типы не находятся — проверить что `@types/gettext-parser` установлен (Task 1).

- [ ] **Step 3: Commit**

Run:
```bash
git add i18n/request.ts
git commit -m "feat(i18n): add request config — load PO via gettext-parser per locale"
```

---

## Task 7: next.config.js — добавить withNextIntl поверх nextTranslate

**Files:**
- Modify: `next.config.js`

`nextTranslate` остаётся (для legacy pages с `useTranslation`). `withNextIntl` добавляется поверх — оба плагина композируются. Legacy rewrites не трогаем.

- [ ] **Step 1: Прочитать текущий next.config.js**

Run:
```bash
cat next.config.js
```

Note текущий `module.exports = moduleExports` где `moduleExports = nextTranslate(baseConfig)`.

- [ ] **Step 2: Обновить next.config.js**

Полностью заменить содержимое `next.config.js`:

```javascript
const commerce = require('./commerce.config.json')
const prod = process.env.NODE_ENV === 'production'
const {
  withCommerceConfig,
  getProviderName,
} = require('./framework/commerce/config')
const nextTranslate = require('next-translate-plugin')
const createNextIntlPlugin = require('next-intl/plugin')

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const provider = commerce.provider || getProviderName()
const isBC = provider === 'bigcommerce'
const isShopify = provider === 'shopify'
const isSaleor = provider === 'saleor'
const isSwell = provider === 'swell'
const isVendure = provider === 'vendure'

const baseConfig = withCommerceConfig({
  commerce,
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_URL: process.env.API_URL,
  },
  rewrites() {
    return [
      (isBC || isShopify || isSwell || isVendure) && {
        source: '/checkout',
        destination: '/api/checkout',
      },
      isBC && {
        source: '/logout',
        destination: '/api/logout?redirect_to=/',
      },
      isVendure &&
        process.env.NEXT_PUBLIC_VENDURE_LOCAL_URL && {
          source: `${process.env.NEXT_PUBLIC_VENDURE_LOCAL_URL}/:path*`,
          destination: `${process.env.NEXT_PUBLIC_VENDURE_SHOP_API_URL}/:path*`,
        },
    ].filter(Boolean)
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'store.hq.fungeek.net' },
      { protocol: 'https', hostname: 'api.hq.fungeek.net' },
      { protocol: 'https', hostname: 'choparpizza.uz' },
      { protocol: 'https', hostname: 'api.choparpizza.uz' },
    ],
  },
})

// Композируем оба плагина: next-intl сверху, next-translate снизу.
// Pages Router использует next-translate (legacy), App Router — next-intl.
module.exports = withNextIntl(nextTranslate(baseConfig))
```

**Что изменилось vs оригинал:**
- Добавлен импорт `createNextIntlPlugin` и создан `withNextIntl`
- `module.exports = nextTranslate(baseConfig)` → `module.exports = withNextIntl(nextTranslate(baseConfig))`
- Удалён закомментированный `withPWA` (мёртвый код, PWA выключен)
- Удалён дебажный `console.log` в конце (избыточен)

- [ ] **Step 3: Verify конфиг загружается**

Run:
```bash
node -e "const c = require('./next.config.js'); console.log(typeof c)"
```

Expected: `function` (next-intl plugin возвращает функцию-обёртку, которую Next вызывает с phase).

- [ ] **Step 4: Commit**

Run:
```bash
git add next.config.js
git commit -m "feat(next): add next-intl plugin alongside next-translate (App + Pages cohabit)"
```

---

## Task 8: Skip — i18n.js остаётся

**Files:** none

`i18n.js` нужен `next-translate-plugin` для legacy pages в `pages/[city]/...` где используется `useTranslation('common')`. Удаление файла → next-translate plugin падает на старте → весь Pages Router ломается. Удаление перенесено в Wave 6.

- [ ] **Step 1: Verify i18n.js на месте**

Run:
```bash
cat i18n.js | head -3
```

Expected: содержимое начинается с `module.exports = {`. Файл существует.

- [ ] **Step 2: No action — skip task**

Никаких изменений не требуется. Задача документирует осознанное решение оставить `i18n.js`.

---

## Task 9: lib/data/site-info.ts

**Files:**
- Create: `lib/data/site-info.ts`

Server-side обёртка над существующим `commerce.getSiteInfo()` с типами. Используется в `app/[city]/layout.tsx` (Wave 2) и через Next 16 fetch dedup переиспользуется во вложенных страницах.

- [ ] **Step 1: Прочитать существующую сигнатуру**

Run:
```bash
cat framework/local/api/operations/get-site-info.ts 2>/dev/null | head -50
```

Note возвращаемый тип. Если файла нет — `find framework/local -name "get-site-info*"`.

- [ ] **Step 2: Создать файл**

Write `lib/data/site-info.ts`:

```typescript
import 'server-only'
import { unstable_cache as cache } from 'next/cache'
import commerce from '@lib/api/commerce'

export type City = {
  id: number
  slug: string
  name: string
  [key: string]: unknown
}

export type SiteInfo = {
  cities: City[]
  categories: unknown[]
  brands: unknown[]
  [key: string]: unknown
}

async function fetchSiteInfoRaw(): Promise<SiteInfo> {
  const result = await commerce.getSiteInfo()
  return result as SiteInfo
}

export const fetchSiteInfo = cache(
  fetchSiteInfoRaw,
  ['site-info'],
  { revalidate: 3600, tags: ['site-info'] }
)
```

- [ ] **Step 3: Verify TypeScript**

Run:
```bash
bunx tsc --noEmit
```

Expected: no new errors. Если `server-only` не находится — это часть Next.js 16, должен быть из коробки.

- [ ] **Step 4: Commit**

Run:
```bash
git add lib/data/site-info.ts
git commit -m "feat(data): add fetchSiteInfo with 1h cache + 'site-info' tag"
```

---

## Task 10: lib/data/auth.ts

**Files:**
- Create: `lib/data/auth.ts`

Замена `next-cookies` для server-side чтения `opt_token`.

- [ ] **Step 1: Создать файл**

Write `lib/data/auth.ts`:

```typescript
import 'server-only'
import { cookies } from 'next/headers'

export async function getAuthToken(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get('opt_token')?.value
}

export async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await getAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function getCitySlug(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get('city_slug')?.value
}
```

- [ ] **Step 2: Verify**

Run:
```bash
bunx tsc --noEmit
```

Expected: no new errors.

- [ ] **Step 3: Commit**

Run:
```bash
git add lib/data/auth.ts
git commit -m "feat(data): add server-side auth helpers (getAuthToken, getAuthHeaders, getCitySlug)"
```

---

## Task 11: components_new/seo/RestaurantJsonLd.tsx

**Files:**
- Create: `components_new/seo/RestaurantJsonLd.tsx`

Извлекаем JSON-LD `Restaurant` schema из `pages/_document.tsx` в отдельный server component.

- [ ] **Step 1: Создать компонент**

Write `components_new/seo/RestaurantJsonLd.tsx`:

```typescript
export default function RestaurantJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: 'Chopar Pizza',
    description:
      'Доставка пиццы с тандырным тестом в Ташкенте. Халяль. Бесплатная доставка.',
    url: 'https://choparpizza.uz',
    telephone: '+998712051111',
    servesCuisine: ['Pizza', 'Italian', 'Uzbek'],
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Ташкент',
      addressCountry: 'UZ',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 41.2995,
      longitude: 69.2401,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      opens: '10:00',
      closes: '03:00',
    },
    sameAs: [
      'https://www.instagram.com/choparpizza/',
      'https://www.facebook.com/choparpizza',
      'https://t.me/Chopar_bot',
    ],
    image: 'https://choparpizza.uz/icon512x.png',
    hasMenu: {
      '@type': 'Menu',
      url: 'https://choparpizza.uz/tashkent',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
```

- [ ] **Step 2: Verify**

Run:
```bash
bunx tsc --noEmit
```

Expected: no new errors.

- [ ] **Step 3: Commit**

Run:
```bash
git add components_new/seo/RestaurantJsonLd.tsx
git commit -m "feat(seo): extract Restaurant JSON-LD into reusable component"
```

---

## Task 12: app/providers.tsx

**Files:**
- Create: `app/providers.tsx`

Все клиентские провайдеры из `pages/_app.tsx`. `QueryClient` создаётся через `useState` чтобы избежать утечек между пользователями в SSR.

- [ ] **Step 1: Проверить ManagedUIContext API**

Run:
```bash
grep -n "export" components/ui/context.tsx | head -20
```

Note exported names — нужно `ManagedUIContext` (или похожее). Если export named — используем как есть.

- [ ] **Step 2: Создать app/providers.tsx**

Write `app/providers.tsx`:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import { ToastContainer } from 'react-toastify'
import { ManagedUIContext } from '@components/ui/context'
import FacebookPixel from '@components/common/FacebookPixel'
import { PostHogProvider } from '@lib/posthog'

export default function Providers({
  children,
}: {
  children: React.ReactNode
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60_000 },
        },
      })
  )

  useEffect(() => {
    document.body.classList?.remove('loading')
  }, [])

  return (
    <PostHogProvider>
      <GoogleReCaptchaProvider
        reCaptchaKey="6LfDMQElAAAAAL0Nbu6ypK_-chUW81SXBIQgeuoe"
        language="RU"
      >
        <FacebookPixel />
        <ManagedUIContext pageProps={{}}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </ManagedUIContext>
        <ToastContainer />
      </GoogleReCaptchaProvider>
    </PostHogProvider>
  )
}
```

> Note: `ManagedUIContext` принимает `pageProps` в legacy `_app.tsx`. Передаём `{}` (placeholder) — в Wave 2 заменим на корректное распределение через CityScopeProvider. Сейчас важно сохранить runtime-совместимость для существующих legacy `pages/[city]/...` (которые продолжают работать через `_app.tsx`... но мы его удаляем — см. Task 17).

- [ ] **Step 3: Verify TypeScript**

Run:
```bash
bunx tsc --noEmit
```

Expected: no new errors. Если `ManagedUIContext` ругается на отсутствие `pageProps` или другой prop — посмотреть сигнатуру и подкорректировать.

- [ ] **Step 4: Commit**

Run:
```bash
git add app/providers.tsx
git commit -m "feat(app): add Providers (PostHog, ReCaptcha, QueryClient, UI context, toast)"
```

---

## Task 13: app/layout.tsx

**Files:**
- Create: `app/layout.tsx`

Root layout: `<html>`, `<body>`, fonts, GTM, JSON-LD, NextIntlClientProvider + Providers. CRM скрипт остаётся локальным `/crm-scripts/ct.min.js?<cache-bust>` (как в `_document.tsx`).

- [ ] **Step 1: Создать app/layout.tsx**

Write `app/layout.tsx`:

```typescript
import type { Metadata } from 'next'
import Script from 'next/script'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import Providers from './providers'
import RestaurantJsonLd from '@components_new/seo/RestaurantJsonLd'

import 'tailwindcss/tailwind.css'
import '@assets/chrome-bug.css'
import 'keen-slider/keen-slider.min.css'
import '@assets/fonts.css'
import '@assets/simplebar.css'
import 'react-toastify/dist/ReactToastify.css'
import '@egjs/flicking-plugins/dist/arrow.css'
import '@components_new/header/DatePicker.css'

export const metadata: Metadata = {
  title: {
    default: 'Chopar Pizza',
    template: '%s | Chopar Pizza',
  },
  description:
    'Доставка пиццы с тандырным тестом в Ташкенте. Халяль. Бесплатная доставка.',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <head>
        <RestaurantJsonLd />
      </head>
      <body className="loading">
        <noscript
          dangerouslySetInnerHTML={{
            __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TSJ79WZ" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
          }}
        />

        <NextIntlClientProvider messages={messages} locale={locale}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>

        <Script id="gtm-init" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-TSJ79WZ');`}
        </Script>

        <Script id="crm-loader" strategy="lazyOnload">
          {`var s=document.createElement('script');s.async=true;
s.src='/crm-scripts/ct.min.js?'+(Date.now()/60000|0);
document.body.appendChild(s);`}
        </Script>
      </body>
    </html>
  )
}
```

> Note: `body className="loading"` сохраняется (legacy CSS классы могут на это завязываться — `chrome-bug.css`). `useEffect` в `Providers` снимает `loading` класс после mount — поведение идентично `_app.tsx`.

- [ ] **Step 2: Verify TypeScript**

Run:
```bash
bunx tsc --noEmit
```

Expected: no new errors.

- [ ] **Step 3: Commit**

Run:
```bash
git add app/layout.tsx
git commit -m "feat(app): add root layout (html, body, fonts, GTM, CRM, JSON-LD, NextIntl + Providers)"
```

---

## Task 14: app/not-found.tsx

**Files:**
- Create: `app/not-found.tsx`

Минимальный 404 для unknown URL. В Wave 2 city-scoped 404 будет в `app/[city]/not-found.tsx`.

- [ ] **Step 1: Создать файл**

Write `app/not-found.tsx`:

```typescript
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">Страница не найдена</p>
      <Link
        href="/"
        className="px-6 py-3 bg-yellow text-white rounded-lg hover:bg-opacity-90 transition"
      >
        На главную
      </Link>
    </div>
  )
}
```

- [ ] **Step 2: Verify**

Run:
```bash
bunx tsc --noEmit
```

Expected: no new errors.

- [ ] **Step 3: Commit**

Run:
```bash
git add app/not-found.tsx
git commit -m "feat(app): add global not-found boundary"
```

---

## Task 15: app/error.tsx

**Files:**
- Create: `app/error.tsx`

Client error boundary для всех страниц. Заменяет `pages/_error.js` (`getInitialProps` устаревший).

- [ ] **Step 1: Создать файл**

Write `app/error.tsx`:

```typescript
'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Что-то пошло не так
      </h1>
      <p className="text-gray-600 mb-8">
        Произошла ошибка. Попробуйте перезагрузить страницу.
      </p>
      <button
        onClick={reset}
        className="px-6 py-3 bg-yellow text-white rounded-lg hover:bg-opacity-90 transition"
      >
        Попробовать снова
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Verify**

Run:
```bash
bunx tsc --noEmit
```

Expected: no new errors.

- [ ] **Step 3: Commit**

Run:
```bash
git add app/error.tsx
git commit -m "feat(app): add error boundary"
```

---

## Task 16: app/global-error.tsx

**Files:**
- Create: `app/global-error.tsx`

Boundary для ошибок в `app/layout.tsx`. Должен сам рендерить `<html>` и `<body>`.

- [ ] **Step 1: Создать файл**

Write `app/global-error.tsx`:

```typescript
'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html lang="ru">
      <body>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '2rem',
            textAlign: 'center',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
            Критическая ошибка
          </h1>
          <p style={{ color: '#666', marginBottom: '2rem' }}>
            Произошла серьёзная ошибка. Пожалуйста, перезагрузите страницу.
          </p>
          <button
            onClick={reset}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#FFD700',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Попробовать снова
          </button>
        </div>
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Verify**

Run:
```bash
bunx tsc --noEmit
```

Expected: no new errors.

- [ ] **Step 3: Commit**

Run:
```bash
git add app/global-error.tsx
git commit -m "feat(app): add global-error boundary for root layout failures"
```

---

## Task 17: Skip — pages/_app.tsx и pages/_document.tsx остаются

**Files:** none

`pages/_app.tsx` и `pages/_document.tsx` нужны для существующих `pages/[city]/...` страниц. Удаление сейчас → legacy pages теряют все провайдеры (PostHog, ReCaptcha, QueryClient, ManagedUIContext, ToastContainer) и `<html>`/`<body>` обёртку → весь Pages Router ломается → невозможно валидировать миграцию через DevTools MCP в Waves 2-5.

App Router имеет свой `app/layout.tsx` (Task 13) — он используется только для URL'ов обработанных App Router (в Wave 1: `/`, `/_test`). Pages Router использует свой `_app.tsx`/`_document.tsx` для всего остального. Оба root layout сосуществуют.

Удаление будет в **Wave 6 (Cleanup)** после того как все pages мигрированы и `pages/` директория удалена.

- [ ] **Step 1: Verify файлы на месте**

Run:
```bash
ls pages/_app.tsx pages/_document.tsx
```

Expected: оба файла существуют.

- [ ] **Step 2: No action — skip task**

Никаких изменений не требуется.

---

## Task 18: Skip — app/page.tsx не создаём в Wave 1

**Files:** none

`pages/index.tsx` уже существует и обрабатывает корневой URL `/` (редирект на `/[city]` через `getServerSideProps`). Если создать `app/page.tsx` в Wave 1 — Next.js залогирует ошибку конфликта (`/` определён и в `app/`, и в `pages/`) — App Router выигрывает, но Pages Router `pages/index.tsx` становится unreachable.

Поскольку `pages/index.tsx` уже корректно работает (редирект из cookie), оставляем его до Wave 4 (когда мигрируем главную). Тогда удаляем `pages/index.tsx` и одновременно создаём `app/page.tsx`.

В Wave 1 root URL обрабатывается legacy Pages Router. Для тестирования App Router используем `/_test` (Task 19).

- [ ] **Step 1: Verify pages/index.tsx на месте**

Run:
```bash
ls pages/index.tsx
```

Expected: файл существует.

- [ ] **Step 2: No action — skip task**

Никаких изменений не требуется.

---

## Task 19: app/_test/page.tsx — sanity check для useExtracted/getExtracted

**Files:**
- Create: `app/_test/page.tsx`

Тестовая страница. Проверяет что:
1. `app/layout.tsx` рендерится без ошибок
2. `getExtracted()` работает в server component
3. `useExtracted()` работает в client component
4. Локали переключаются (RU без префикса, /uz/_test, /en/_test)
5. Перевод подтягивается из `messages/{locale}.po`

Удаляется после успешного прогона (см. Final Verification).

- [ ] **Step 1: Создать server-side тест**

Write `app/_test/page.tsx`:

```typescript
import { getExtracted } from 'next-intl/server'
import TestClient from './TestClient'

export default async function TestPage() {
  const t = await getExtracted()
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>App Router Foundation — Sanity Check</h1>

      <section style={{ marginTop: '2rem' }}>
        <h2>Server Component (getExtracted)</h2>
        <p>
          <strong>Test message (from .po):</strong>{' '}
          <code>{t('__test_extracted_message__')}</code>
        </p>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2>Client Component (useExtracted)</h2>
        <TestClient />
      </section>
    </div>
  )
}
```

- [ ] **Step 2: Создать client-side companion**

Write `app/_test/TestClient.tsx`:

```typescript
'use client'

import { useExtracted } from 'next-intl'
import { useState } from 'react'

export default function TestClient() {
  const t = useExtracted()
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>
        <strong>Test message (from .po):</strong>{' '}
        <code>{t('__test_extracted_message__')}</code>
      </p>
      <p>
        <strong>useState works:</strong> count = {count}{' '}
        <button
          onClick={() => setCount((c) => c + 1)}
          style={{ marginLeft: '0.5rem', padding: '0.25rem 0.75rem' }}
        >
          +1
        </button>
      </p>
    </div>
  )
}
```

- [ ] **Step 3: Verify TypeScript**

Run:
```bash
bunx tsc --noEmit
```

Expected: no new errors. Если `useExtracted` или `getExtracted` не найдены — проверить версию `next-intl` (`bun pm ls next-intl`); должна быть `^4.5.0` или новее. Если версия старая — `bun add next-intl@latest`.

- [ ] **Step 4: Commit**

Run:
```bash
git add app/_test/
git commit -m "feat(app): add sanity test page for useExtracted/getExtracted"
```

---

## Task 20: proxy.ts (Next 16) — узкий matcher для Wave 1

**Files:**
- Create: `proxy.ts`

`proxy.ts` matcher должен включать **только** URL'ы, которые обрабатывает App Router в текущей волне. Иначе next-intl middleware начнёт редиректить legacy URL'ы (например `/uz/tashkent/news`) → попытка отрендерить через App Router → 404, потому что эти страницы ещё не мигрированы.

В Wave 1 App Router обрабатывает только `/_test/*`. Корневой `/` обрабатывается legacy Pages Router (см. Task 18). По мере миграции в Wave 2-5 — расширяем matcher.

- [ ] **Step 1: Создать файл**

Write `proxy.ts`:

```typescript
import createMiddleware from 'next-intl/middleware'
import { type NextRequest } from 'next/server'
import { routing } from './i18n/routing'

const intlProxy = createMiddleware(routing)

export function proxy(request: NextRequest) {
  // В Wave 1 единственный App Router URL — /_test (и его /uz/_test, /en/_test варианты).
  // Дополнительная логика (legacy product redirect, root city redirect, etc.) добавится
  // в следующих волнах вместе с миграцией соответствующих страниц.
  return intlProxy(request)
}

// Matcher включает ТОЛЬКО App Router URL'ы. Legacy pages обрабатываются Pages Router
// без перехвата proxy.
//
// В Wave 1: /_test, /uz/_test, /en/_test
// В Wave 2 добавится: /[city]/about, /[city]/contacts, /[city]/delivery, ...
// В Wave 6 после полной миграции: '/((?!api|_next|_vercel|.*\\..*).*)'
export const config = {
  matcher: ['/_test/:path*', '/_test', '/(ru|uz|en)/_test/:path*', '/(ru|uz|en)/_test'],
}
```

> Note: `proxy.ts` всегда работает на Node.js runtime (Next 16 не позволяет настроить runtime для proxy). Это нам подходит — `next-intl` middleware работает на обоих runtime'ах.

- [ ] **Step 2: Verify TypeScript**

Run:
```bash
bunx tsc --noEmit
```

Expected: no new errors.

- [ ] **Step 3: Commit**

Run:
```bash
git add proxy.ts
git commit -m "feat(app): add proxy.ts with narrow Wave 1 matcher (/_test only)"
```

---

## Task 21: Verify build

**Files:** none

- [ ] **Step 1: Очистить .next**

Run:
```bash
rm -rf .next
```

- [ ] **Step 2: Запустить dev и проверить старт**

Run в одном терминале:
```bash
bun dev > /tmp/dev.log 2>&1 &
DEV_PID=$!
sleep 15
echo "=== last 50 lines of dev.log ==="
tail -n 50 /tmp/dev.log
```

Expected:
- В логе видим `Ready in <X>ms`
- Нет фатальных ошибок (`Error:`, `Failed to compile`)

Если есть ошибки — диагностика, фиксы перед переходом дальше. Не убивать процесс — ниже шаги используют его.

- [ ] **Step 3: Curl главной страницы (legacy Pages Router)**

Run:
```bash
curl -sI http://localhost:5656/ | head -n 5
```

Expected: HTTP `200` или `307`/`308` (legacy `pages/index.tsx` рендерит селектор города + редирект через `getServerSideProps` на `/[city]`). **Важно:** должен работать через Pages Router, не App Router.

- [ ] **Step 4: Curl test page (RU)**

Run:
```bash
curl -s http://localhost:5656/_test | grep -E "Server Component|Test message|__test_extracted"
```

Expected:
- Видим `<h2>Server Component (getExtracted)</h2>`
- Видим `__test_extracted_message__` (значение из `messages/ru.po` — для тестового сообщения мы поставили msgstr равный msgid, так что выводится сама строка)

- [ ] **Step 5: Curl test page (UZ)**

Run:
```bash
curl -s http://localhost:5656/uz/_test | grep -E "__test_extracted"
```

Expected: видим `__test_extracted_message___uz` (значение из `messages/uz.po`).

- [ ] **Step 6: Curl test page (EN)**

Run:
```bash
curl -s http://localhost:5656/en/_test | grep -E "__test_extracted"
```

Expected: видим `__test_extracted_message___en` (значение из `messages/en.po`).

- [ ] **Step 7: Console check (через chrome-devtools-mcp)**

Run в Chrome DevTools MCP:
```
new_page("http://localhost:5656/_test")
list_console_messages()
```

Expected: нет `Error` или `Warning` про hydration mismatch, missing locale, etc. Допустимы info/debug сообщения.

- [ ] **Step 8: Остановить dev**

Run:
```bash
kill $DEV_PID 2>/dev/null
wait $DEV_PID 2>/dev/null
echo "dev stopped"
```

- [ ] **Step 9: Smoke test legacy Pages Router (city URL)**

Run:
```bash
curl -sI http://localhost:5656/tashkent | head -n 5
```

Expected: HTTP `200` (legacy `pages/[city]/index.tsx` рендерит главную города). Это должно работать через Pages Router, который сосуществует с App Router.

- [ ] **Step 10: Production build smoke test**

Run:
```bash
bun run build > /tmp/build-wave1.log 2>&1 && echo "BUILD OK" || (echo "BUILD FAILED"; tail -n 100 /tmp/build-wave1.log)
```

Expected: `BUILD OK`. Если FAILED — изучить лог, исправить ошибки. **Не переходить дальше пока build не пройдёт.**

> Note: build должен пройти полностью без ошибок — все legacy pages (`pages/[city]/...`) продолжают компилироваться через Pages Router (с `next-translate`, `next-cookies`, `next-seo` — они всё ещё установлены и работают).

---

## Task 22: Cleanup test page

**Files:**
- Delete: `app/_test/page.tsx`
- Delete: `app/_test/TestClient.tsx`

После того как Task 21 прошла все проверки — убираем тестовую страницу.

- [ ] **Step 1: Удалить тест**

Run:
```bash
git rm -r app/_test
```

Expected: `rm 'app/_test/TestClient.tsx'`, `rm 'app/_test/page.tsx'`.

- [ ] **Step 2: Verify**

Run:
```bash
bunx tsc --noEmit
```

Expected: no errors (тест больше ничего не импортирует).

- [ ] **Step 3: Commit**

Run:
```bash
git commit -m "chore(app): remove sanity test page (Wave 1 verified)"
```

---

## Task 23: Удалить тестовое сообщение из .po файлов

**Files:**
- Modify: `messages/ru.po`
- Modify: `messages/uz.po`
- Modify: `messages/en.po`

- [ ] **Step 1: Очистить ru.po**

Edit `messages/ru.po`, удалить блок:

```po
msgid "__test_extracted_message__"
msgstr "__test_extracted_message__"
```

Финальный `messages/ru.po`:

```po
# Chopar Pizza — RU translations (source locale)
# Auto-managed by next-intl useExtracted/getExtracted
msgid ""
msgstr ""
"Content-Type: text/plain; charset=UTF-8\n"
"Language: ru\n"
```

- [ ] **Step 2: Очистить uz.po**

Edit `messages/uz.po`, удалить блок:

```po
msgid "__test_extracted_message__"
msgstr "__test_extracted_message___uz"
```

- [ ] **Step 3: Очистить en.po**

Edit `messages/en.po`, удалить блок:

```po
msgid "__test_extracted_message__"
msgstr "__test_extracted_message___en"
```

- [ ] **Step 4: Commit**

Run:
```bash
git add messages/
git commit -m "chore(i18n): remove sanity test message from PO stubs"
```

---

## Final Verification — Wave 1 Definition of Done

- [ ] **Step 1: Дерево файлов соответствует плану**

Run:
```bash
ls -la app/ i18n/ lib/data/ messages/ proxy.ts
ls pages/_app.tsx pages/_document.tsx i18n.js
```

Expected:
- `app/`: `layout.tsx`, `providers.tsx`, `not-found.tsx`, `error.tsx`, `global-error.tsx` (НЕ `page.tsx` — он создаётся в Wave 4, НЕ `_test/` — удалён в Task 22)
- `i18n/`: `routing.ts`, `navigation.ts`, `request.ts`
- `lib/data/`: `site-info.ts`, `auth.ts`
- `messages/`: `ru.po`, `uz.po`, `en.po`
- `proxy.ts` существует
- Legacy на месте: `pages/_app.tsx`, `pages/_document.tsx`, `i18n.js` (удалятся в Wave 6)

- [ ] **Step 2: package.json содержит И legacy И новые пакеты**

Run:
```bash
grep -E '"next-translate"|"next-cookies"|"next-seo"|"next-translate-plugin"' package.json
```

Expected: 4 строки — legacy пакеты на месте (для Pages Router).

- [ ] **Step 3: package.json содержит новые пакеты**

Run:
```bash
grep -E '"next-intl"|"gettext-parser"' package.json
```

Expected: три строки (`next-intl`, `gettext-parser`, `@types/gettext-parser`).

- [ ] **Step 4: TypeScript полностью зелёный для нового кода**

Run:
```bash
bunx tsc --noEmit 2>&1 | grep -E "(app/|i18n/|lib/data/|proxy\.ts|components_new/seo/)" | head -20
```

Expected: пустой вывод (нет ошибок в новых файлах). Ошибки в `pages/[city]/...` могут быть — они про legacy `next/router`, `next-translate` импорты — это для следующих волн.

- [ ] **Step 5: Production build проходит**

Run:
```bash
bun run build > /tmp/build-final.log 2>&1 && echo "BUILD OK" || (echo "BUILD FAILED"; tail -n 100 /tmp/build-final.log)
```

Expected: `BUILD OK`. Допустимы warnings про legacy pages.

- [ ] **Step 6: Проверка списка коммитов Wave 1**

Run:
```bash
git log --oneline main..HEAD
```

Expected: ~17+ коммитов от `chore: add next-intl...` до `chore(i18n): remove sanity test message...`. Все коммиты связаны с Wave 1. Tasks 8, 17, 18 не создают коммиты (skip-задачи).

- [ ] **Step 7: Branch ready для Wave 2**

Run:
```bash
git status
git branch --show-current
```

Expected:
- Branch: `migration/app-router`
- `working tree clean` (или известные autogenerated файлы)

---

## Wave 1 Done. Что дальше:

- **Wave 2 — Статика** (`app/[city]/about`, `contacts`, `delivery`, `branch`, `privacy`, `[city]/layout.tsx` с Header/Footer/CityScopeProvider)
- **План Wave 2:** будет создан отдельной итерацией `superpowers:writing-plans`, после того как Wave 1 фактически выполнен и проверен
- **Промежуточный шаг:** между Wave 1 и Wave 2 — снять snapshot прода для статичных страниц через Chrome DevTools MCP (3 локали × 6 городов × 5 статичных страниц = 90 snapshots для baseline)

---

## Self-Review Checklist (для разработчика, выполняющего план)

- [ ] Каждая Task'а имеет `Files:` секцию
- [ ] Каждый Step имеет либо exact код, либо exact команду
- [ ] Все ссылки между Task'ами консистентны (`Task 17` ссылается на `app/_test/`, `Task 22` его удаляет)
- [ ] Pre-flight выполнен (мы в чистой ветке, baseline build OK)
- [ ] Final Verification пройдена полностью
