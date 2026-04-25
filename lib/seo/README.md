# SEO conventions

This module owns SEO helpers and documents site-wide rules so every new page
follows the same playbook.

## Helpers

- `lib/seo/alternates.ts`
  - `SEO_BASE_URL` — single source of truth for canonical host
  - `SEO_LOCALES` — `['ru', 'uz', 'en']`
  - `localizedPath(locale, path)` — builds the absolute URL for the given
    locale, respecting the as-needed prefix policy (ru without prefix,
    uz/en with `/uz` and `/en`)
  - `buildLanguages(path)` — produces `{ ru, uz, en, 'x-default' }` map
    suitable for `metadata.alternates.languages`
  - `crumbLabel(locale, key)` — localized label for breadcrumb keys
- `components_new/seo/JsonLd.tsx` — generic JSON-LD `<script>` wrapper
- `components_new/seo/RestaurantJsonLd.tsx` — site-wide Restaurant schema
- `components_new/seo/SiteJsonLd.tsx` — WebSite + Organization (root)
- `components_new/seo/MenuJsonLd.tsx` — Menu/MenuSection/MenuItem (city)
- `components_new/seo/ProductJsonLd.tsx` — Product + AggregateOffer
- `components_new/seo/BreadcrumbsJsonLd.tsx` — BreadcrumbList

## Canonical policy

1. **One URL per piece of content.** Every page sets `metadata.alternates.canonical`
   to the `ru` URL (`https://choparpizza.uz/{city}/...`) regardless of the
   active locale. Locale alternates live under `alternates.languages`.
2. **`x-default` mirrors `ru`.** Required for users with non-matching
   `Accept-Language`. Always present alongside ru/uz/en.
3. **Pagination (when added):** each paginated page should set its own
   `canonical` (self-referential). Do **not** point page 2/3 at page 1 —
   Google treats that as soft-noindex. If the listing has a "view all"
   variant, that becomes the canonical for all paginated pages.
4. **Filtered listings (when added):** filter combinations should set
   `canonical` back to the unfiltered category URL **unless** the filter
   creates substantial unique content (e.g. permanent landing pages for
   "vegetarian pizza", "halal sets"). For ad hoc filter combinations,
   prefer `noindex` over canonical-stuffing.
5. **Tracking parameters (utm_*, gclid, yclid):** keep the bare URL as
   canonical; query params should never appear in `canonical` or sitemap.
6. **Trailing slashes:** Next.js default — no trailing slash. Do not flip
   `trailingSlash: true` without a 301 redirect plan and full sitemap rewrite.
7. **Private routes** (`/cart`, `/profile/*`, `/order/*`, `/track/*`,
   `/bonus/start`): set `metadata.robots = { index: false, follow: false }`
   AND list them in `app/robots.ts` `Disallow`. Belt and suspenders —
   `noindex` only takes effect after a crawl, `Disallow` saves the crawl.

## Adding a new page

When adding `app/[city]/foo/page.tsx`:

```ts
import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import { buildLanguages, localizedPath, crumbLabel } from '@lib/seo/alternates'
import BreadcrumbsJsonLd from '@components_new/seo/BreadcrumbsJsonLd'

export async function generateMetadata({ params }): Promise<Metadata> {
  const { city } = await params
  return {
    title: '...',
    description: '...',
    alternates: {
      canonical: localizedPath('ru', `/${city}/foo`),
      languages: buildLanguages(`/${city}/foo`),
    },
  }
}

export default async function FooPage({ params }) {
  const { city: citySlug } = await params
  const loc = (await getLocale()) as 'ru' | 'uz' | 'en'
  return (
    <>
      <BreadcrumbsJsonLd
        items={[
          { name: crumbLabel(loc, 'home'), url: localizedPath(loc, `/${citySlug}`) },
          { name: 'Foo', url: localizedPath(loc, `/${citySlug}/foo`) },
        ]}
      />
      <YourComponent />
    </>
  )
}
```
