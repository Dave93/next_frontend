# App Router Migration — Wave 3: Content (News + Sale)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Мигрировать 4 контентные страницы — `/[city]/news`, `/[city]/news/[id]`, `/[city]/sale`, `/[city]/sale/[id]`. List и detail для news и sale используют идентичный pattern (axios fetch → render с Image + Link), общий `NewsMenuTabs` навигационный header.

**Architecture:** Все 4 страницы — server components с server-side fetch (через новые `lib/data/news.ts` + `lib/data/sales.ts` с `unstable_cache`). View-components (`NewsListApp`, `NewsDetailApp`, `SaleListApp`, `SaleDetailApp`) — server. `NewsMenuTabsApp` (общий tabs header для list страниц news/sale) — client (`usePathname`). `useExtracted` only для inline текстов (заголовки, "Подробнее", "Рекомендованные"). Динамический контент (`name`, `description`) приходит из API, локализуется через `useLocale` или server-side `getLocale`.

**Out of scope:** Wave 4+ (каталог, personal, etc).

**Tech Stack:** Next.js 16.2.2, React 18, TypeScript 5.3.3, `next-intl@4.9.1` (`useExtracted`/`getExtracted` only), `next/image`, `next/link`, server-side `fetch` через `unstable_cache`.

**Reference plans:** Wave 1, Wave 2 (about), Wave 2.5 (header/footer), Wave 2B-lite/Maps/Form (other static pages).

---

## File Structure

### Created

| Файл | Тип | Ответственность |
|---|---|---|
| `lib/data/news.ts` | server fetcher | `fetchNewsList(cityId, locale)`, `fetchNewsById(id, cityId)`, `fetchRelatedNews(id, cityId)` с unstable_cache |
| `lib/data/sales.ts` | server fetcher | `fetchSalesList(cityId, locale)`, `fetchSaleById(id, cityId)`, `fetchRelatedSales(id, cityId, locale)` |
| `components_new/news/NewsMenuTabsApp.tsx` | client | Tabs header (Новости/Акции toggle с usePathname highlight) |
| `components_new/news/NewsListApp.tsx` | server | Grid news items с Image + Link to detail |
| `components_new/news/NewsDetailApp.tsx` | server | Single news + related news section |
| `components_new/sale/SaleListApp.tsx` | server | Grid sale items |
| `components_new/sale/SaleDetailApp.tsx` | server | Single sale + related sales section |
| `app/[city]/news/page.tsx` | server | Page + Metadata, fetch news list |
| `app/[city]/news/[id]/page.tsx` | server | Page + Metadata, fetch news + related, notFound if missing |
| `app/[city]/sale/page.tsx` | server | Page + Metadata, fetch sales list |
| `app/[city]/sale/[id]/page.tsx` | server | Page + Metadata, fetch sale + related, notFound if missing |

### Modified

| Файл | Изменение |
|---|---|
| `proxy.ts` | + `/[city]/news`, `/[city]/news/[id]`, `/[city]/sale`, `/[city]/sale/[id]` matcher patterns |

### Deleted

| Файл | Причина |
|---|---|
| `pages/[city]/news/index.tsx` | Заменено `app/[city]/news/page.tsx` |
| `pages/[city]/news/[id].tsx` | Заменено `app/[city]/news/[id]/page.tsx` |
| `pages/[city]/sale/index.tsx` | Заменено `app/[city]/sale/page.tsx` |
| `pages/[city]/sale/[id].tsx` | Заменено `app/[city]/sale/[id]/page.tsx` |

### Untouched

- `components_new/news/NewsItem.tsx`, `news/NewsDetail.tsx` (legacy, удаляются в Wave 6 cleanup)
- `components_new/sale/SaleItem.tsx` (legacy)
- `framework/commerce/data/newsMenu.ts` (используется в новых компонентах через переинтерпретацию данных — оставляем для обратной совместимости)

---

## Pre-flight

- [ ] **Step 1: Verify Wave 2B-Form done**

```bash
cd /Users/macbookpro/development/next_frontend
git branch --show-current  # = migration/app-router
ls "app/[city]/contacts/page.tsx" components_new/contacts/ContactsApp.tsx
git log --oneline -3
```

Expected: ветка `migration/app-router`; contacts page existing; последний commit ~ `3f5daa44` (chore(contacts): drop redundant defaultCountry) или newer.

- [ ] **Step 2: Baseline build OK**

```bash
rm -rf .next/* 2>/dev/null; rm -rf .next
bun run build > /tmp/wave3-baseline.log 2>&1 && echo "OK" || (echo "FAIL"; tail -30 /tmp/wave3-baseline.log)
```

Expected: `OK`.

---

## Task 1: lib/data/news.ts + lib/data/sales.ts

**Files:** Create two server fetcher modules.

- [ ] **Step 1: Создать lib/data/news.ts**

Write `lib/data/news.ts`:

```typescript
import 'server-only'
import { unstable_cache as cache } from 'next/cache'

const apiUrl = () => process.env.NEXT_PUBLIC_API_URL || process.env.API_URL

async function fetchNewsListRaw(cityId: number, locale: string) {
  const res = await fetch(
    `${apiUrl()}/api/news/public?city_id=${cityId}&locale=${locale}`,
    { next: { revalidate: 300, tags: ['news', `news-list-${cityId}`] } }
  )
  if (!res.ok) return []
  const json = (await res.json()) as { data?: any[] }
  return json.data || []
}

async function fetchNewsByIdRaw(id: string, cityId: number) {
  const res = await fetch(
    `${apiUrl()}/api/news/public/${id}/?city_id=${cityId}`,
    { next: { revalidate: 600, tags: [`news-${id}`] } }
  )
  if (!res.ok) return null
  const json = (await res.json()) as { data?: any[] }
  return json.data?.[0] || null
}

async function fetchRelatedNewsRaw(id: string, cityId: number) {
  const res = await fetch(
    `${apiUrl()}/api/news/related/${id}/?city_id=${cityId}`,
    { next: { revalidate: 600, tags: [`news-related-${id}`] } }
  )
  if (!res.ok) return []
  const json = (await res.json()) as { data?: any[] }
  return json.data || []
}

export const fetchNewsList = cache(
  fetchNewsListRaw,
  ['news-list'],
  { revalidate: 300, tags: ['news'] }
)

export const fetchNewsById = cache(
  fetchNewsByIdRaw,
  ['news-by-id'],
  { revalidate: 600, tags: ['news'] }
)

export const fetchRelatedNews = cache(
  fetchRelatedNewsRaw,
  ['news-related'],
  { revalidate: 600, tags: ['news'] }
)
```

- [ ] **Step 2: Создать lib/data/sales.ts**

Write `lib/data/sales.ts`:

```typescript
import 'server-only'
import { unstable_cache as cache } from 'next/cache'

const apiUrl = () => process.env.NEXT_PUBLIC_API_URL || process.env.API_URL

async function fetchSalesListRaw(cityId: number, locale: string) {
  const res = await fetch(
    `${apiUrl()}/api/sales/public?city_id=${cityId}&locale=${locale}`,
    { next: { revalidate: 300, tags: ['sales', `sales-list-${cityId}`] } }
  )
  if (!res.ok) return []
  const json = (await res.json()) as { data?: any[] }
  return json.data || []
}

async function fetchSaleByIdRaw(id: string, cityId: number) {
  const res = await fetch(
    `${apiUrl()}/api/sales/public/${id}/?city_id=${cityId}`,
    { next: { revalidate: 600, tags: [`sale-${id}`] } }
  )
  if (!res.ok) return null
  const json = (await res.json()) as { data?: any[] }
  return json.data?.[0] || null
}

async function fetchRelatedSalesRaw(id: string, cityId: number, locale: string) {
  const res = await fetch(
    `${apiUrl()}/api/sales/related/${id}/?city_id=${cityId}&locale=${locale}`,
    { next: { revalidate: 600, tags: [`sale-related-${id}`] } }
  )
  if (!res.ok) return []
  const json = (await res.json()) as { data?: any[] }
  return json.data || []
}

export const fetchSalesList = cache(
  fetchSalesListRaw,
  ['sales-list'],
  { revalidate: 300, tags: ['sales'] }
)

export const fetchSaleById = cache(
  fetchSaleByIdRaw,
  ['sale-by-id'],
  { revalidate: 600, tags: ['sales'] }
)

export const fetchRelatedSales = cache(
  fetchRelatedSalesRaw,
  ['sales-related'],
  { revalidate: 600, tags: ['sales'] }
)
```

- [ ] **Step 3: Verify TS**

```bash
bunx tsc --noEmit 2>&1 | grep -E "^lib/data/(news|sales)" | head -5
```

Expected: empty.

- [ ] **Step 4: Commit**

```bash
git add lib/data/news.ts lib/data/sales.ts
git commit -m "feat(data): add news + sales server fetchers (unstable_cache)"
```

---

## Task 2: components_new/news/NewsMenuTabsApp.tsx

**File:** Create `components_new/news/NewsMenuTabsApp.tsx`

Client component с usePathname для определения активного tab. Структура согласно `framework/commerce/data/newsMenu.ts` (2 tabs: news, sale, иконки `/bonuses.png`/`/activeBonuses.png` для news, `/order.svg`/`/activeOrder.svg` для sale).

- [ ] **Step 1: Создать файл**

Write `components_new/news/NewsMenuTabsApp.tsx`:

```typescript
'use client'

import { FC, memo } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useExtracted } from 'next-intl'

type Props = {
  citySlug: string
}

const TABS: Array<{ href: string; icon: string; activeIcon: string; label: string }> = [
  { href: '/news', icon: '/bonuses.png', activeIcon: '/activeBonuses.png', label: 'Новости' },
  { href: '/sale', icon: '/order.svg', activeIcon: '/activeOrder.svg', label: 'Акции' },
]

const NewsMenuTabsApp: FC<Props> = ({ citySlug }) => {
  const t = useExtracted()
  const pathname = usePathname() || ''

  return (
    <div className="flex items-center justify-center md:my-10 space-x-6 py-6 md:py-0">
      {TABS.map((item) => {
        const href = `/${citySlug}${item.href}`
        const isActive = pathname.indexOf(item.href) >= 0
        return (
          <div key={item.href} className="flex items-center md:ml-10">
            <img src={isActive ? item.activeIcon : item.icon} alt="" />
            <Link
              href={href}
              prefetch={false}
              className={`${isActive ? 'text-yellow' : 'text-gray-400'} ml-1 text-sm`}
            >
              {t(item.label)}
            </Link>
          </div>
        )
      })}
    </div>
  )
}

export default memo(NewsMenuTabsApp)
```

- [ ] **Step 2: Verify TS**

```bash
bunx tsc --noEmit 2>&1 | grep -E "^components_new/news/NewsMenuTabsApp" | head -5
```

Expected: empty.

- [ ] **Step 3: Commit**

```bash
git add components_new/news/NewsMenuTabsApp.tsx
git commit -m "feat(news): add NewsMenuTabsApp (client tabs with usePathname)"
```

---

## Task 3: components_new/news/NewsListApp.tsx

**File:** Create `components_new/news/NewsListApp.tsx`

Server component. Принимает `news` items + `citySlug` + `locale` как props.

- [ ] **Step 1: Создать файл**

Write `components_new/news/NewsListApp.tsx`:

```typescript
import { getExtracted } from 'next-intl/server'
import Image from 'next/image'
import Link from 'next/link'

type NewsItem = {
  id: number | string
  name?: string
  name_uz?: string
  name_en?: string
  asset?: Array<{ link: string }>
  [key: string]: unknown
}

type Props = {
  news: NewsItem[]
  citySlug: string
  locale: string
}

const localizedName = (item: NewsItem, locale: string) => {
  if (locale === 'uz') return item.name_uz || ''
  if (locale === 'en') return item.name_en || ''
  return item.name || ''
}

export default async function NewsListApp({ news, citySlug, locale }: Props) {
  const t = await getExtracted()

  if (!news.length) {
    return (
      <div className="mx-5 md:mx-0">
        <div className="text-3xl mb-1">{t('Новости')}</div>
        <div className="border-b-2 w-24 border-yellow mb-10"></div>
        <div className="text-2xl text-center">{t('Пока новостей нет')}</div>
      </div>
    )
  }

  return (
    <div className="mx-5 md:mx-0">
      <div className="text-3xl mb-1">{t('Новости')}</div>
      <div className="border-b-2 w-24 border-yellow mb-10"></div>
      <div className="md:grid md:grid-cols-3 gap-10 mb-8">
        {news.map((item) => {
          const href = `/${citySlug}/news/${item.id}`
          const imgSrc = item.asset?.[0]?.link || '/no_photo.svg'
          const alt = localizedName(item, locale)
          return (
            <div
              className="bg-white rounded-3xl flex flex-col overflow-hidden mb-4 md:mb-0"
              key={item.id}
            >
              <div className="relative">
                <Link href={href} prefetch={false}>
                  <Image src={imgSrc} width={400} height={400} alt={alt} />
                </Link>
              </div>
              <div className="md:flex md:flex-col justify-between p-5 flex-grow">
                <div className="md:text-lg mb-3">
                  <Link href={href} prefetch={false}>
                    {alt}
                  </Link>
                </div>
                <Link
                  href={href}
                  prefetch={false}
                  className="text-xs text-gray-400 hover:underline"
                >
                  {t('Подробнее')}
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TS**

```bash
bunx tsc --noEmit 2>&1 | grep -E "^components_new/news/NewsListApp" | head -5
```

Expected: empty.

- [ ] **Step 3: Commit**

```bash
git add components_new/news/NewsListApp.tsx
git commit -m "feat(news): add NewsListApp server component (grid + Image + Link)"
```

---

## Task 4: components_new/news/NewsDetailApp.tsx

**File:** Create `components_new/news/NewsDetailApp.tsx`

Server component. Принимает `news` item + `relatedNews` + `citySlug` + `locale`.

- [ ] **Step 1: Создать файл**

Write `components_new/news/NewsDetailApp.tsx`:

```typescript
import { getExtracted } from 'next-intl/server'
import Image from 'next/image'
import Link from 'next/link'

type NewsItem = {
  id: number | string
  name?: string
  name_uz?: string
  name_en?: string
  description?: string
  description_uz?: string
  description_en?: string
  asset?: Array<{ link: string }>
  [key: string]: unknown
}

type Props = {
  news: NewsItem
  relatedNews: NewsItem[]
  citySlug: string
  locale: string
}

const localizedName = (item: NewsItem, locale: string) => {
  if (locale === 'uz') return item.name_uz || ''
  if (locale === 'en') return item.name_en || ''
  return item.name || ''
}

const localizedDescription = (item: NewsItem, locale: string) => {
  if (locale === 'uz') return item.description_uz || ''
  if (locale === 'en') return item.description_en || ''
  return item.description || ''
}

export default async function NewsDetailApp({
  news,
  relatedNews,
  citySlug,
  locale,
}: Props) {
  const t = await getExtracted()
  const heroImg = news.asset?.[0]?.link || '/no_photo.svg'
  const heroAlt = localizedName(news, locale)
  const heroDesc = localizedDescription(news, locale)
  const heroHref = `/${citySlug}/news/${news.id}`

  return (
    <>
      <div>
        <div className="bg-white rounded-3xl flex p-5">
          <div>
            <Link href={heroHref} prefetch={false}>
              <Image src={heroImg} width={450} height={450} alt={heroAlt} />
            </Link>
          </div>
          <div className="ml-16 w-[430px]">
            <div className="text-2xl">{heroAlt}</div>
            <div dangerouslySetInnerHTML={{ __html: heroDesc }} />
          </div>
        </div>
      </div>
      {relatedNews && relatedNews.length > 0 && (
        <>
          <div className="text-2xl mb-4 mt-10">{t('Рекомендованные новости')}</div>
          <div className="bg-white rounded-3xl flex justify-between p-4">
            <div className="md:grid md:grid-cols-3 gap-10 mx-5 md:mx-0">
              {relatedNews.map((item) => {
                const href = `/${citySlug}/news/${item.id}`
                const imgSrc = item.asset?.[0]?.link || '/no_photo.svg'
                const alt = localizedName(item, locale)
                return (
                  <div key={item.id}>
                    <div className="relative rounded-t-lg overflow-hidden">
                      <Link href={href} prefetch={false}>
                        <Image src={imgSrc} width={350} height={350} alt={alt} />
                      </Link>
                    </div>
                    <div className="flex flex-col justify-between p-5 flex-grow">
                      <div className="text-lg mb-3">
                        <Link href={href} prefetch={false}>
                          {alt}
                        </Link>
                      </div>
                      <Link
                        href={href}
                        prefetch={false}
                        className="text-xs text-gray-400 hover:underline"
                      >
                        {t('Подробнее')}
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </>
  )
}
```

- [ ] **Step 2: Verify TS**

```bash
bunx tsc --noEmit 2>&1 | grep -E "^components_new/news/NewsDetailApp" | head -5
```

Expected: empty.

- [ ] **Step 3: Commit**

```bash
git add components_new/news/NewsDetailApp.tsx
git commit -m "feat(news): add NewsDetailApp server component (hero + related grid)"
```

---

## Task 5: components_new/sale/SaleListApp.tsx + SaleDetailApp.tsx

**Files:** Create `components_new/sale/SaleListApp.tsx`, `components_new/sale/SaleDetailApp.tsx`

Идентичная структура news, но для sale items. Sales имеют только один `name`/`description` (без `_uz`/`_en` варианта в локализованных полях list view — bы используем те же localizedName helpers).

- [ ] **Step 1: Создать SaleListApp.tsx**

Write `components_new/sale/SaleListApp.tsx`:

```typescript
import { getExtracted } from 'next-intl/server'
import Image from 'next/image'
import Link from 'next/link'

type SaleItem = {
  id: number | string
  name?: string
  name_uz?: string
  name_en?: string
  asset?: Array<{ link: string }>
  [key: string]: unknown
}

type Props = {
  sales: SaleItem[]
  citySlug: string
  locale: string
}

const localizedName = (item: SaleItem, locale: string) => {
  if (locale === 'uz') return item.name_uz || item.name || ''
  if (locale === 'en') return item.name_en || item.name || ''
  return item.name || ''
}

export default async function SaleListApp({ sales, citySlug, locale }: Props) {
  const t = await getExtracted()

  if (!sales.length) {
    return (
      <div className="mx-5 md:mx-0">
        <div className="text-3xl mb-1">{t('Акции')}</div>
        <div className="border-b-2 w-24 border-yellow mb-10"></div>
        <div className="text-2xl text-center">{t('Пока акций нет')}</div>
      </div>
    )
  }

  return (
    <div className="mx-5 md:mx-0">
      <div className="text-3xl mb-1">{t('Акции')}</div>
      <div className="border-b-2 w-24 border-yellow mb-10"></div>
      <div className="md:grid md:grid-cols-3 gap-10">
        {sales.map((item) => {
          const href = `/${citySlug}/sale/${item.id}`
          const imgSrc = item.asset?.[0]?.link || '/no_photo.svg'
          const alt = localizedName(item, locale)
          return (
            <div
              className="bg-white rounded-3xl flex flex-col overflow-hidden mb-4 md:mb-0"
              key={item.id}
            >
              <div className="relative">
                <Link href={href} prefetch={false}>
                  <Image src={imgSrc} width={400} height={400} alt={alt} />
                </Link>
              </div>
              <div className="flex flex-col justify-between p-5 flex-grow">
                <div className="md:text-lg mb-3">
                  <Link href={href} prefetch={false}>
                    {alt}
                  </Link>
                </div>
                <Link
                  href={href}
                  prefetch={false}
                  className="text-xs text-gray-400 hover:underline"
                >
                  {t('Подробнее')}
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Создать SaleDetailApp.tsx**

Write `components_new/sale/SaleDetailApp.tsx`:

```typescript
import { getExtracted } from 'next-intl/server'
import Image from 'next/image'
import Link from 'next/link'

type SaleItem = {
  id: number | string
  name?: string
  name_uz?: string
  name_en?: string
  description?: string
  description_uz?: string
  description_en?: string
  asset?: Array<{ link: string }>
  [key: string]: unknown
}

type Props = {
  sale: SaleItem
  relatedSale: SaleItem[]
  citySlug: string
  locale: string
}

const localizedName = (item: SaleItem, locale: string) => {
  if (locale === 'uz') return item.name_uz || item.name || ''
  if (locale === 'en') return item.name_en || item.name || ''
  return item.name || ''
}

const localizedDescription = (item: SaleItem, locale: string) => {
  if (locale === 'uz') return item.description_uz || item.description || ''
  if (locale === 'en') return item.description_en || item.description || ''
  return item.description || ''
}

export default async function SaleDetailApp({
  sale,
  relatedSale,
  citySlug,
  locale,
}: Props) {
  const t = await getExtracted()
  const heroImg = sale.asset?.[0]?.link || '/no_photo.svg'
  const heroAlt = localizedName(sale, locale)
  const heroDesc = localizedDescription(sale, locale)
  const heroHref = `/${citySlug}/sale/${sale.id}`

  return (
    <>
      <div>
        <div className="bg-white rounded-3xl flex p-5">
          <div>
            <Link href={heroHref} prefetch={false}>
              <Image src={heroImg} width={450} height={450} alt={heroAlt} />
            </Link>
          </div>
          <div className="ml-16 w-[430px]">
            <div className="text-2xl">{heroAlt}</div>
            <div dangerouslySetInnerHTML={{ __html: heroDesc }} />
          </div>
        </div>
      </div>
      {relatedSale && relatedSale.length > 0 && (
        <>
          <div className="text-2xl mb-4 mt-10">{t('Рекомендованные акции')}</div>
          <div className="bg-white rounded-3xl flex justify-between p-4">
            <div className="md:grid md:grid-cols-3 gap-10 mx-5 md:mx-0">
              {relatedSale.map((item) => {
                const href = `/${citySlug}/sale/${item.id}`
                const imgSrc = item.asset?.[0]?.link || '/no_photo.svg'
                const alt = localizedName(item, locale)
                return (
                  <div key={item.id}>
                    <div className="relative rounded-t-lg overflow-hidden">
                      <Link href={href} prefetch={false}>
                        <Image src={imgSrc} width={350} height={350} alt={alt} />
                      </Link>
                    </div>
                    <div className="flex flex-col justify-between p-5 flex-grow">
                      <div className="text-lg mb-3">
                        <Link href={href} prefetch={false}>
                          {alt}
                        </Link>
                      </div>
                      <Link
                        href={href}
                        prefetch={false}
                        className="text-xs text-gray-400 hover:underline"
                      >
                        {t('Подробнее')}
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </>
  )
}
```

- [ ] **Step 3: Verify TS**

```bash
bunx tsc --noEmit 2>&1 | grep -E "^components_new/sale/(SaleListApp|SaleDetailApp)" | head -5
```

Expected: empty.

- [ ] **Step 4: Commit**

```bash
git add components_new/sale/SaleListApp.tsx components_new/sale/SaleDetailApp.tsx
git commit -m "feat(sale): add SaleListApp + SaleDetailApp server components"
```

---

## Task 6: 4 page.tsx files

**Files:** Create 4 server pages.

- [ ] **Step 1: mkdir all directories**

```bash
mkdir -p "app/[city]/news" "app/[city]/news/[id]" "app/[city]/sale" "app/[city]/sale/[id]"
```

- [ ] **Step 2: Create app/[city]/news/page.tsx**

```typescript
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { fetchSiteInfo } from '../../../lib/data/site-info'
import { fetchNewsList } from '../../../lib/data/news'
import NewsListApp from '../../../components_new/news/NewsListApp'
import NewsMenuTabsApp from '../../../components_new/news/NewsMenuTabsApp'
import type { City } from '@commerce/types/cities'

type Params = { city: string }

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { city } = await params
  const base = 'https://choparpizza.uz'
  return {
    title: 'Новости Chopar Pizza',
    description: 'Свежие новости и события Chopar Pizza',
    alternates: {
      canonical: `${base}/${city}/news`,
      languages: {
        ru: `${base}/${city}/news`,
        uz: `${base}/uz/${city}/news`,
        en: `${base}/en/${city}/news`,
      },
    },
  }
}

export default async function NewsPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { city: citySlug } = await params
  const [siteInfo, locale] = await Promise.all([
    fetchSiteInfo(),
    getLocale(),
  ])
  const cities = (siteInfo as any).cities as City[]
  const currentCity = cities.find((c) => c.slug === citySlug)
  if (!currentCity) notFound()

  const news = await fetchNewsList(currentCity.id, locale)

  return (
    <>
      <NewsMenuTabsApp citySlug={citySlug} />
      <NewsListApp news={news} citySlug={citySlug} locale={locale} />
    </>
  )
}
```

- [ ] **Step 3: Create app/[city]/news/[id]/page.tsx**

```typescript
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { fetchSiteInfo } from '../../../../lib/data/site-info'
import { fetchNewsById, fetchRelatedNews } from '../../../../lib/data/news'
import NewsDetailApp from '../../../../components_new/news/NewsDetailApp'
import NewsMenuTabsApp from '../../../../components_new/news/NewsMenuTabsApp'
import type { City } from '@commerce/types/cities'

type Params = { city: string; id: string }

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { city, id } = await params
  const base = 'https://choparpizza.uz'
  return {
    title: 'Новость Chopar Pizza',
    alternates: {
      canonical: `${base}/${city}/news/${id}`,
      languages: {
        ru: `${base}/${city}/news/${id}`,
        uz: `${base}/uz/${city}/news/${id}`,
        en: `${base}/en/${city}/news/${id}`,
      },
    },
  }
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { city: citySlug, id } = await params
  const [siteInfo, locale] = await Promise.all([
    fetchSiteInfo(),
    getLocale(),
  ])
  const cities = (siteInfo as any).cities as City[]
  const currentCity = cities.find((c) => c.slug === citySlug)
  if (!currentCity) notFound()

  const news = await fetchNewsById(id, currentCity.id)
  if (!news) notFound()

  const relatedNews = await fetchRelatedNews(id, currentCity.id)

  return (
    <>
      <NewsMenuTabsApp citySlug={citySlug} />
      <NewsDetailApp
        news={news}
        relatedNews={relatedNews}
        citySlug={citySlug}
        locale={locale}
      />
    </>
  )
}
```

- [ ] **Step 4: Create app/[city]/sale/page.tsx**

```typescript
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { fetchSiteInfo } from '../../../lib/data/site-info'
import { fetchSalesList } from '../../../lib/data/sales'
import SaleListApp from '../../../components_new/sale/SaleListApp'
import NewsMenuTabsApp from '../../../components_new/news/NewsMenuTabsApp'
import type { City } from '@commerce/types/cities'

type Params = { city: string }

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { city } = await params
  const base = 'https://choparpizza.uz'
  return {
    title: 'Акции от Chopar Pizza',
    description:
      'Акции и специальные предложения Chopar Pizza — скидки на пиццу, сеты и доставку',
    alternates: {
      canonical: `${base}/${city}/sale`,
      languages: {
        ru: `${base}/${city}/sale`,
        uz: `${base}/uz/${city}/sale`,
        en: `${base}/en/${city}/sale`,
      },
    },
  }
}

export default async function SalePage({
  params,
}: {
  params: Promise<Params>
}) {
  const { city: citySlug } = await params
  const [siteInfo, locale] = await Promise.all([
    fetchSiteInfo(),
    getLocale(),
  ])
  const cities = (siteInfo as any).cities as City[]
  const currentCity = cities.find((c) => c.slug === citySlug)
  if (!currentCity) notFound()

  const sales = await fetchSalesList(currentCity.id, locale)

  return (
    <>
      <NewsMenuTabsApp citySlug={citySlug} />
      <SaleListApp sales={sales} citySlug={citySlug} locale={locale} />
    </>
  )
}
```

- [ ] **Step 5: Create app/[city]/sale/[id]/page.tsx**

```typescript
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { fetchSiteInfo } from '../../../../lib/data/site-info'
import { fetchSaleById, fetchRelatedSales } from '../../../../lib/data/sales'
import SaleDetailApp from '../../../../components_new/sale/SaleDetailApp'
import NewsMenuTabsApp from '../../../../components_new/news/NewsMenuTabsApp'
import type { City } from '@commerce/types/cities'

type Params = { city: string; id: string }

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { city, id } = await params
  const base = 'https://choparpizza.uz'
  return {
    title: 'Акция Chopar Pizza',
    alternates: {
      canonical: `${base}/${city}/sale/${id}`,
      languages: {
        ru: `${base}/${city}/sale/${id}`,
        uz: `${base}/uz/${city}/sale/${id}`,
        en: `${base}/en/${city}/sale/${id}`,
      },
    },
  }
}

export default async function SaleDetailPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { city: citySlug, id } = await params
  const [siteInfo, locale] = await Promise.all([
    fetchSiteInfo(),
    getLocale(),
  ])
  const cities = (siteInfo as any).cities as City[]
  const currentCity = cities.find((c) => c.slug === citySlug)
  if (!currentCity) notFound()

  const sale = await fetchSaleById(id, currentCity.id)
  if (!sale) notFound()

  const relatedSale = await fetchRelatedSales(id, currentCity.id, locale)

  return (
    <>
      <NewsMenuTabsApp citySlug={citySlug} />
      <SaleDetailApp
        sale={sale}
        relatedSale={relatedSale}
        citySlug={citySlug}
        locale={locale}
      />
    </>
  )
}
```

- [ ] **Step 6: Verify TS**

```bash
bunx tsc --noEmit 2>&1 | grep -E "^app/\[city\]/(news|sale)" | head -10
```

Expected: empty.

- [ ] **Step 7: Commit**

```bash
git add "app/[city]/news/" "app/[city]/sale/"
git commit -m "feat(app): add 4 content pages (news list/detail, sale list/detail)"
```

---

## Task 7: Update proxy.ts matcher

**File:** Modify `proxy.ts`

Добавить 4 literal patterns. Помнить: literal strings only.

- [ ] **Step 1: Read current proxy.ts**

```bash
cat proxy.ts
```

- [ ] **Step 2: Update matcher**

В существующий `config.matcher` array добавить 4 новых строки **после** `/contacts`:

```typescript
'/(tashkent|samarkand|bukhara|namangan|fergana|andijan|qarshi|nukus|urgench|jizzakh|gulistan|termez|chirchiq|navoi)/news',
'/(tashkent|samarkand|bukhara|namangan|fergana|andijan|qarshi|nukus|urgench|jizzakh|gulistan|termez|chirchiq|navoi)/news/:id',
'/(tashkent|samarkand|bukhara|namangan|fergana|andijan|qarshi|nukus|urgench|jizzakh|gulistan|termez|chirchiq|navoi)/sale',
'/(tashkent|samarkand|bukhara|namangan|fergana|andijan|qarshi|nukus|urgench|jizzakh|gulistan|termez|chirchiq|navoi)/sale/:id',
```

Также обновить comment: `// Wave 3: + /[city]/news, /news/[id], /sale, /sale/[id]`.

- [ ] **Step 3: Verify TS**

```bash
bunx tsc --noEmit 2>&1 | grep -E "^proxy" | head -5
```

Expected: empty.

- [ ] **Step 4: Commit**

```bash
git add proxy.ts
git commit -m "feat(app): expand proxy matcher — 4 content routes (news + sale)"
```

---

## Task 8: Удалить 4 legacy pages

**Files:** Delete

- [ ] **Step 1: Удалить файлы**

```bash
git rm "pages/[city]/news/index.tsx" "pages/[city]/news/[id].tsx" "pages/[city]/sale/index.tsx" "pages/[city]/sale/[id].tsx"
```

Expected: 4 deletes.

- [ ] **Step 2: Verify build OK**

```bash
rm -rf .next/* 2>/dev/null; rm -rf .next
bun run build > /tmp/wave3-task8.log 2>&1 && echo "BUILD OK" || (echo "BUILD FAIL"; tail -50 /tmp/wave3-task8.log)
```

Expected: `BUILD OK`. If FAIL — STOP, report BLOCKED.

- [ ] **Step 3: Commit**

```bash
git commit -m "feat(app): remove legacy pages/[city]/{news,sale}/* (4 files)"
```

---

## Task 9: Verify dev runtime

**Files:** none

- [ ] **Step 1: Запустить dev**

```bash
lsof -i :5757 2>&1 | head -3 || echo "5757 free"
bunx next dev --webpack -p 5757 > /tmp/wave3-dev.log 2>&1 &
echo $! > /tmp/wave3-dev.pid
sleep 25
tail -10 /tmp/wave3-dev.log
```

Expected: `Ready in <X>ms`.

- [ ] **Step 2: Curl all 4 routes**

```bash
echo "=== /tashkent/news ==="
curl -s -o /tmp/curl-news.html -w "HTTP %{http_code}\n" http://localhost:5757/tashkent/news
echo "Title: $(grep -oE '<title>[^<]*</title>' /tmp/curl-news.html | head -1)"
echo "Tabs (Новости/Акции): $(grep -ocE '>Новости<|>Акции<' /tmp/curl-news.html)"
echo "Empty state or items: $(grep -ocE 'Пока новостей нет|news/[0-9]' /tmp/curl-news.html)"

echo ""
echo "=== /tashkent/sale ==="
curl -s -o /tmp/curl-sale.html -w "HTTP %{http_code}\n" http://localhost:5757/tashkent/sale
echo "Title: $(grep -oE '<title>[^<]*</title>' /tmp/curl-sale.html | head -1)"
echo "Sale items: $(grep -ocE 'Бесплатная доставка|sale/[0-9]' /tmp/curl-sale.html)"

echo ""
echo "=== /tashkent/sale/4 (existing sale id) ==="
curl -s -o /tmp/curl-sale-detail.html -w "HTTP %{http_code}\n" http://localhost:5757/tashkent/sale/4
echo "Title: $(grep -oE '<title>[^<]*</title>' /tmp/curl-sale-detail.html | head -1)"
echo "Detail content: $(grep -ocE 'Бесплатная доставка|2 600' /tmp/curl-sale-detail.html)"

echo ""
echo "=== /tashkent/news/9999999 (nonexistent → 404) ==="
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:5757/tashkent/news/9999999

echo ""
echo "=== Pages Router /tashkent live ==="
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:5757/tashkent
```

Expected:
- `/tashkent/news` HTTP 200, title "Новости Chopar Pizza | Chopar Pizza", tabs > 0, "Пока новостей нет" (since news API returns empty for tashkent)
- `/tashkent/sale` HTTP 200, "Бесплатная доставка" present (1 active sale)
- `/tashkent/sale/4` HTTP 200, detail content present
- `/tashkent/news/9999999` HTTP 404 (notFound)
- `/tashkent` HTTP 200 (Pages Router)

- [ ] **Step 3: Stop dev**

```bash
kill $(cat /tmp/wave3-dev.pid) 2>/dev/null
sleep 2
```

---

## Task 10: Production build smoke

**Files:** none

```bash
rm -rf .next/* 2>/dev/null; rm -rf .next
bun run build > /tmp/wave3-prod.log 2>&1
echo "EXIT_CODE=$?"
grep -E "/\[city\]/(news|sale)" /tmp/wave3-prod.log | tail -10
```

Expected: `EXIT_CODE=0`, all 4 routes in App Router section.

---

## Task 11: DevTools MCP visual diff

**Files:** none

- [ ] **Step 1: Запустить dev**

```bash
bunx next dev --webpack -p 5757 > /tmp/wave3-dev2.log 2>&1 &
echo $! > /tmp/wave3-dev2.pid
sleep 25
```

- [ ] **Step 2: Sale list page (has 1 item)**

```
mcp__plugin_chrome-devtools-mcp_chrome-devtools__new_page(url: "http://localhost:5757/tashkent/sale")
mcp__plugin_chrome-devtools-mcp_chrome-devtools__evaluate_script(function: `
() => ({
  title: document.title,
  heading: document.querySelector('main .text-3xl')?.textContent?.trim(),
  saleItems: Array.from(document.querySelectorAll('main .bg-white.rounded-3xl')).map(el => ({
    title: el.querySelector('.md\\\\:text-lg')?.textContent?.trim(),
    img: el.querySelector('img')?.getAttribute('src'),
  })),
  tabsActive: Array.from(document.querySelectorAll('main a')).filter(a => /text-yellow/.test(a.className)).map(a => a.textContent?.trim()),
  hasHeader: !!document.querySelector('header'),
  hasFooter: !!document.querySelector('footer'),
})`)
```

Expected: title "Акции от Chopar Pizza | Chopar Pizza", heading "Акции", saleItems contains "Бесплатная доставка..." with valid img link, "Акции" tab active.

- [ ] **Step 3: Sale detail page**

```
mcp__plugin_chrome-devtools-mcp_chrome-devtools__new_page(url: "http://localhost:5757/tashkent/sale/4")
mcp__plugin_chrome-devtools-mcp_chrome-devtools__evaluate_script(function: `
() => ({
  title: document.title,
  heading: document.querySelector('main .text-2xl')?.textContent?.trim(),
  hasDescription: document.body.innerText.includes('2 600'),
  hasHeader: !!document.querySelector('header'),
  hasFooter: !!document.querySelector('footer'),
})`)
```

Expected: title contains "Акция Chopar Pizza", heading "Бесплатная доставка...", hasDescription true.

- [ ] **Step 4: News list (empty state)**

```
mcp__plugin_chrome-devtools-mcp_chrome-devtools__new_page(url: "http://localhost:5757/tashkent/news")
mcp__plugin_chrome-devtools-mcp_chrome-devtools__evaluate_script(function: `
() => ({
  title: document.title,
  heading: document.querySelector('main .text-3xl')?.textContent?.trim(),
  emptyState: document.body.innerText.includes('Пока новостей нет'),
  tabsActive: Array.from(document.querySelectorAll('main a')).filter(a => /text-yellow/.test(a.className)).map(a => a.textContent?.trim()),
})`)
```

Expected: title "Новости Chopar Pizza | Chopar Pizza", heading "Новости", emptyState true (API returns []), "Новости" tab active.

- [ ] **Step 5: Console check**

```
mcp__plugin_chrome-devtools-mcp_chrome-devtools__list_console_messages(types: ["error"])
```

Expected: only known issues (favicon 404).

- [ ] **Step 6: Close pages, stop dev**

```
mcp__plugin_chrome-devtools-mcp_chrome-devtools__close_page(...)
```

```bash
kill $(cat /tmp/wave3-dev2.pid) 2>/dev/null
sleep 2
```

---

## Final Verification

- [ ] **Step 1: File tree**

```bash
ls lib/data/news.ts lib/data/sales.ts
ls components_new/news/NewsMenuTabsApp.tsx components_new/news/NewsListApp.tsx components_new/news/NewsDetailApp.tsx
ls components_new/sale/SaleListApp.tsx components_new/sale/SaleDetailApp.tsx
ls "app/[city]/news/page.tsx" "app/[city]/news/[id]/page.tsx" "app/[city]/sale/page.tsx" "app/[city]/sale/[id]/page.tsx"
git ls-files "pages/[city]/news" "pages/[city]/sale" 2>&1
```

Expected: все 11 файлов; legacy `pages/[city]/news` и `pages/[city]/sale` пусты.

- [ ] **Step 2: TS clean**

```bash
bunx tsc --noEmit 2>&1 | grep -E "^(app/|i18n/|lib/data/|lib/posthog-app|proxy\.ts|components_new/(seo|about|fran|delivery|privacy|branch|contacts|news|sale|HeaderApp|FooterApp|header/(HeaderPhone|ChooseCity|Language|SignInButton)App))" | head -10
```

Expected: пустой вывод.

- [ ] **Step 3: Build OK**

```bash
rm -rf .next/* 2>/dev/null; rm -rf .next
bun run build > /tmp/wave3-final.log 2>&1
echo "EXIT_CODE=$?"
```

Expected: `EXIT_CODE=0`.

- [ ] **Step 4: Wave 3 commits**

```bash
git log --oneline 3f5daa44..HEAD
```

Expected: ~10 commits Wave 3.

- [ ] **Step 5: Branch clean**

```bash
git status
```

Expected: clean.

---

## Wave 3 Done. Что осталось:

- **Wave 4** — Каталог: `/[city]` главная (с категориями, продуктами, слайдером), `/[city]/product/[id]`
- **Wave 5** — Personal: cart, order, order/[id], order/success, profile/*, track/[id], _bonus/*
- **Wave 6** — Cleanup: удалить pages/_app.tsx, _document.tsx, i18n.js, легаси пакеты, переключиться на `localePrefix: 'as-needed'` с `[locale]` segment

---

## Self-Review Checklist

- [ ] Каждая Task имеет `Files:` секцию
- [ ] Каждый Step имеет либо exact код, либо exact команду
- [ ] **Никаких `useTranslations`/`getTranslations`** — только `useExtracted`/`getExtracted`
- [ ] All view-components кроме NewsMenuTabsApp — server (no `'use client'`)
- [ ] NewsMenuTabsApp — client (использует `usePathname`)
- [ ] Server fetchers через `unstable_cache` с разными revalidate (300s для list, 600s для detail)
- [ ] City validation в каждой page через `fetchSiteInfo` + notFound
- [ ] News/sale detail: notFound при отсутствующем item
- [ ] proxy.ts matcher — literal strings (without/:id для list, with/:id для detail)
- [ ] Build OK после удаления 4 legacy
- [ ] DevTools MCP подтверждает sale list (1 item) + sale detail + news empty state
