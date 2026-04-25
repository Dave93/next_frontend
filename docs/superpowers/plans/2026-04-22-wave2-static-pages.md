# App Router Migration — Wave 2: City Layout + Static Pages

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Поднять city-scoped layout (Header/Footer/модалки) для App Router URL'ов, мигрировать **`/[city]/about`** как proof-of-concept (server component с `getExtracted`, client view-component с `useExtracted`, inline RU тексты, build-time extraction → `messages/{ru,uz,en}.po`). Предоставить готовый паттерн для миграции остальных статичных страниц (`/[city]/about/fran`, `/contacts`, `/delivery`, `/branch`, `/privacy`) — реализуются как Wave 2B по тому же шаблону.

**Architecture:** App Router и Pages Router сосуществуют (`localePrefix: 'never'`, locale через `NEXT_LOCALE` cookie). `app/[city]/layout.tsx` (server) валидирует city через `fetchSiteInfo()` и передаёт данные в client wrapper, который обёртывает существующий legacy `Layout` компонент (Header/Footer/модалки) — это экономит 2-3 недели работы по переписыванию Layout с нуля. View-компоненты (`AboutApp.tsx`) — новые client components с `useExtracted` (NEVER `useTranslations`); inline RU тексты — single source of truth, `useExtracted` build-time loader превращает их в ключи и автозаполняет `messages/{locale}.po` (UZ/EN msgstr — пустые до production запуска и snapshot'а с прода через DevTools MCP).

**Tech Stack:** Next.js 16.2.2, React 18, TypeScript 5.3.3, `next-intl@4.9.1` (`useExtracted`/`getExtracted` only), `gettext-parser`, axios (legacy fetcher для config), Bun runtime, Chrome DevTools MCP для validation.

**Reference spec:** `docs/superpowers/specs/2026-04-22-app-router-migration-design.md` (включая Lessons learned после Wave 1).

**Reference plan для Wave 1:** `docs/superpowers/plans/2026-04-22-wave1-foundation.md`

---

## File Structure

### Created

| Файл | Ответственность |
|---|---|
| `app/[city]/layout.tsx` | Server: validate city slug через `fetchSiteInfo()`, передать pageProps в LayoutWrapper |
| `app/[city]/LayoutWrapper.tsx` | `'use client'`: useEffect для setActiveCity/setCitiesData, рендерит legacy `<Layout pageProps={...}>` |
| `app/[city]/not-found.tsx` | City-scoped 404 (наследует layout, видны Header/Footer) |
| `app/[city]/about/page.tsx` | Server: generateMetadata (canonical/hreflang), рендерит `<AboutApp />` |
| `components_new/about/AboutApp.tsx` | `'use client'`: client view-компонент с `useExtracted`, inline RU тексты |

### Modified

| Файл | Изменение |
|---|---|
| `proxy.ts` | Расширить matcher: добавить `/[city]/about` patterns (для всех known city slugs) |

### Deleted

| Файл | Причина |
|---|---|
| `pages/[city]/about/index.tsx` | Заменено `app/[city]/about/page.tsx` |

### Untouched

- `pages/[city]/about/fran/index.tsx` — Wave 2B (тот же паттерн)
- `pages/[city]/contacts/index.tsx`, `delivery/`, `branch/`, `privacy/` — Wave 2B
- `pages/_app.tsx`, `_document.tsx`, `i18n.js` — Wave 6 cleanup
- Все остальные `pages/[city]/...` — Waves 3-5
- `components_new/about/About.tsx` — оставляем (используется legacy `pages/[city]/about/index.tsx` пока в `Wave 2A` мы только рефакторим for App Router; в Wave 2A удаляется только `pages/[city]/about/index.tsx`, не component)

---

## Pre-flight

- [ ] **Step 1: Verify ветка и состояние Wave 1**

Run:
```bash
cd /Users/macbookpro/development/next_frontend
git branch --show-current
git log --oneline -5
ls app/ i18n/ lib/data/ proxy.ts
```

Expected:
- Branch: `migration/app-router`
- Last commit: `ceec55ef` (docs(spec): record Wave 1 lessons) или newer
- `app/`: `error.tsx`, `global-error.tsx`, `layout.tsx`, `not-found.tsx`, `providers.tsx`
- `i18n/`: `navigation.ts`, `request.ts`, `routing.ts`
- `lib/data/`: `auth.ts`, `site-info.ts`
- `proxy.ts` exists

If anything missing — STOP and verify Wave 1 was completed.

- [ ] **Step 2: Verify build passes (baseline для Wave 2)**

Run:
```bash
rm -rf .next && bun run build > /tmp/wave2-baseline.log 2>&1 && echo "OK" || (echo "FAIL"; tail -30 /tmp/wave2-baseline.log)
```

Expected: `OK`. If FAIL — investigate before proceeding.

---

## Task 1: app/[city]/LayoutWrapper.tsx — client wrapper

**Files:** Create `app/[city]/LayoutWrapper.tsx`

Wraps existing `Layout` from `@components/common`. Дополнительно: на mount/change syncs `activeCity`/`cities` в `ManagedUIContext` (legacy Layout читает `useUI().setCitiesData(cities)`, но `setActiveCity` нужно явно вызвать).

- [ ] **Step 1: Прочитать ManagedUIContext API для setActiveCity**

Run:
```bash
grep -n "setActiveCity\|SET_ACTIVE_CITY" components/ui/context.tsx | head -5
```

Confirm `setActiveCity` is exported via `useUI()`. If signature differs from `(city: City) => void` — adapt step 2.

- [ ] **Step 2: Создать LayoutWrapper.tsx**

Write `app/[city]/LayoutWrapper.tsx`:

```typescript
'use client'

import { useEffect } from 'react'
import { Layout } from '@components/common'
import { useUI } from '@components/ui/context'
import type { City } from '@commerce/types/cities'

type Props = {
  children: React.ReactNode
  pageProps: {
    categories: unknown[]
    topMenu: unknown[]
    footerInfoMenu: unknown[]
    socials: unknown[]
    cities: City[]
    currentCity: City
  }
}

export default function LayoutWrapper({ children, pageProps }: Props) {
  const { setActiveCity, setCitiesData } = useUI()

  useEffect(() => {
    if (pageProps.currentCity) {
      setActiveCity(pageProps.currentCity)
    }
    if (pageProps.cities?.length) {
      setCitiesData(pageProps.cities)
    }
  }, [pageProps.currentCity, pageProps.cities, setActiveCity, setCitiesData])

  return <Layout pageProps={pageProps as any}>{children}</Layout>
}
```

- [ ] **Step 3: Verify TS**

Run:
```bash
bunx tsc --noEmit 2>&1 | grep -E "^app/\[city\]/LayoutWrapper" | head -5
```

Expected: empty.

- [ ] **Step 4: Commit**

```bash
git add "app/[city]/LayoutWrapper.tsx"
git commit -m "feat(app): add LayoutWrapper — client wrapper around legacy Layout, syncs city to UIContext"
```

---

## Task 2: app/[city]/layout.tsx — server city-scope layout

**Files:** Create `app/[city]/layout.tsx`

Server component: загружает `siteInfo` через `fetchSiteInfo()`, валидирует city slug, передаёт pageProps в LayoutWrapper. Использует `notFound()` если city не найден.

- [ ] **Step 1: Создать файл**

Write `app/[city]/layout.tsx`:

```typescript
import { notFound } from 'next/navigation'
import { fetchSiteInfo } from '../../lib/data/site-info'
import LayoutWrapper from './LayoutWrapper'

export const dynamicParams = true

export async function generateStaticParams() {
  const siteInfo = await fetchSiteInfo()
  return siteInfo.cities.map((c) => ({ city: c.slug }))
}

export default async function CityLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ city: string }>
}) {
  const { city: citySlug } = await params
  const siteInfo = await fetchSiteInfo()
  const currentCity = siteInfo.cities.find((c) => c.slug === citySlug)
  if (!currentCity) notFound()

  return (
    <LayoutWrapper
      pageProps={{
        categories: siteInfo.categories,
        topMenu: siteInfo.topMenu,
        footerInfoMenu: siteInfo.footerInfoMenu,
        socials: siteInfo.socials,
        cities: siteInfo.cities,
        currentCity,
      }}
    >
      {children}
    </LayoutWrapper>
  )
}
```

- [ ] **Step 2: Verify TS**

Run:
```bash
bunx tsc --noEmit 2>&1 | grep -E "^app/\[city\]/layout" | head -5
```

Expected: empty.

- [ ] **Step 3: Commit**

```bash
git add "app/[city]/layout.tsx"
git commit -m "feat(app): add city layout (server, fetchSiteInfo + notFound + generateStaticParams)"
```

---

## Task 3: app/[city]/not-found.tsx — city-scoped 404

**Files:** Create `app/[city]/not-found.tsx`

City-scoped 404 — рендерится внутри `[city]/layout.tsx`, поэтому Header/Footer видны.

- [ ] **Step 1: Создать файл**

Write `app/[city]/not-found.tsx`:

```typescript
import Link from 'next/link'

export default function CityNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
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

- [ ] **Step 2: Verify TS**

Run:
```bash
bunx tsc --noEmit 2>&1 | grep -E "^app/\[city\]/not-found" | head -5
```

Expected: empty.

- [ ] **Step 3: Commit**

```bash
git add "app/[city]/not-found.tsx"
git commit -m "feat(app): add city-scoped not-found (renders within layout — Header/Footer visible)"
```

---

## Task 4: components_new/about/AboutApp.tsx

**Files:** Create `components_new/about/AboutApp.tsx`

New client view-component using `useExtracted`. Inline RU texts из `About.tsx` (legacy):
- `tr('about')` → `t('О компании')`
- `tr('about_text')` — это HTML строка, в legacy грузится из API. В Wave 2 — захардкоженный inline текст из снэпшота прода (через DevTools MCP в Step 2 ниже).

> **Важно:** инлайн RU тексты — single source of truth. `useExtracted` build-time loader превращает их в auto-generated keys и заполняет `messages/{ru,uz,en}.po`. Перевод UZ/EN — снимается с прода через DevTools MCP в Wave 7 (полировка), потому что в `bun dev` `useExtracted` возвращает inline-текст как есть для всех локалей.

- [ ] **Step 1: Снять snapshot прода для /tashkent/about**

Через Chrome DevTools MCP (либо вручную через curl):

```bash
curl -s https://choparpizza.uz/tashkent/about > /tmp/prod-about-ru.html
curl -s https://choparpizza.uz/uz/tashkent/about > /tmp/prod-about-uz.html
curl -s https://choparpizza.uz/en/tashkent/about > /tmp/prod-about-en.html
```

Найди и зафиксируй (в соответствующем txt комментарии в коде):
- Заголовок (RU: "О нас" из `tr('about')`) — точный текст с прода
- Тело статьи (RU "О нас текст" из `tr('about_text')`) — точный HTML с прода

Если curl возвращает SSR-rendered HTML (не пустой `<div id="__next">`) — извлечь из него тексты. Если HTML hydration-only — использовать DevTools MCP `take_snapshot` через `new_page("https://choparpizza.uz/tashkent/about")`.

- [ ] **Step 2: Создать AboutApp.tsx**

Write `components_new/about/AboutApp.tsx`:

```typescript
'use client'

import { useExtracted } from 'next-intl'

const ABOUT_BODY_HTML = `<!-- TODO: Wave 2 Step 1 — paste actual HTML from prod /tashkent/about here -->
<p>Chopar Pizza — это пицца с тандырным тестом, приготовленная по уникальному рецепту.</p>`

export default function AboutApp() {
  const t = useExtracted()
  return (
    <div className="mx-5 md:mx-0">
      <div className="text-3xl mb-1">{t('О компании')}</div>
      <div className="border-b-2 w-24 border-yellow mb-10"></div>
      <div className="md:grid gap-10 mb-8">
        <div dangerouslySetInnerHTML={{ __html: ABOUT_BODY_HTML }}></div>
      </div>
    </div>
  )
}
```

> Note: `ABOUT_BODY_HTML` остаётся захардкоженным HTML literal вместо `useExtracted` потому что HTML с разметкой в `useExtracted` создаст один огромный msgid — не идиоматично. Рекомендуемый pattern для длинных HTML-блоков — отдельные translations files (`.po`) или CMS source. Wave 7 решит как корректно перенести длинные тексты (отдельные msgid per paragraph, `.rich()` API, или CMS injection).

- [ ] **Step 3: Verify TS**

Run:
```bash
bunx tsc --noEmit 2>&1 | grep -E "^components_new/about/AboutApp" | head -5
```

Expected: empty.

- [ ] **Step 4: Commit**

```bash
git add components_new/about/AboutApp.tsx
git commit -m "feat(about): add AboutApp client component with useExtracted (RU inline)"
```

---

## Task 5: app/[city]/about/page.tsx

**Files:** Create `app/[city]/about/page.tsx`

Server component: generateMetadata с canonical/hreflang (сохраняет SEO commit `fd7c7ccd`). Рендерит `<AboutApp />` (client).

- [ ] **Step 1: Создать файл**

Write `app/[city]/about/page.tsx`:

```typescript
import type { Metadata } from 'next'
import AboutApp from '../../../components_new/about/AboutApp'

type Params = { city: string }

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { city } = await params
  const base = 'https://choparpizza.uz'
  return {
    title: 'О компании Chopar Pizza',
    description: 'История бренда Chopar Pizza',
    alternates: {
      canonical: `${base}/${city}/about`,
      languages: {
        ru: `${base}/${city}/about`,
        uz: `${base}/uz/${city}/about`,
        en: `${base}/en/${city}/about`,
      },
    },
    openGraph: {
      url: `${base}/${city}/about`,
      type: 'website',
    },
  }
}

export default function AboutPage() {
  return <AboutApp />
}
```

- [ ] **Step 2: Verify TS**

Run:
```bash
bunx tsc --noEmit 2>&1 | grep -E "^app/\[city\]/about/page" | head -5
```

Expected: empty.

- [ ] **Step 3: Commit**

```bash
git add "app/[city]/about/page.tsx"
git commit -m "feat(app): add /[city]/about page (server, Metadata API with canonical/hreflang)"
```

---

## Task 6: Update proxy.ts matcher

**Files:** Modify `proxy.ts`

Расширить matcher так, чтобы App Router обрабатывал `/[city]/about` для всех known city slugs (важно: matcher НЕ должен перехватывать `/[city]/cart`, `/[city]/news` и прочее, что ещё в Pages Router).

City slugs из прода: `tashkent`, `samarkand`, `bukhara`, `namangan`, `fergana`, `andijan`, `qarshi`, `nukus`, `urgench`, `jizzakh`, `gulistan`, `termez`, `chirchiq`, `navoi`. Точный список лучше получить из `siteInfo.cities` через runtime check, но Wave 2 hardcode.

- [ ] **Step 1: Прочитать текущий proxy.ts**

Run:
```bash
cat proxy.ts
```

- [ ] **Step 2: Обновить matcher**

Write `proxy.ts`:

```typescript
import createMiddleware from 'next-intl/middleware'
import { type NextRequest } from 'next/server'
import { routing } from './i18n/routing'

const intlProxy = createMiddleware(routing)

export function proxy(request: NextRequest) {
  // App Router URL'ы постепенно расширяются по мере миграции страниц.
  // Wave 1: /test-foundation (удалена)
  // Wave 2: /[city]/about (только about, остальные статичные — Wave 2B)
  // Wave 3+: контент, каталог, personal, etc.
  return intlProxy(request)
}

// Matcher включает ТОЛЬКО App Router URL'ы. Pages Router URL'ы (/[city],
// /[city]/cart, /[city]/news, etc.) обходят proxy.ts.
//
// `(tashkent|samarkand|...)` — все known city slugs. Если бэкенд добавит
// новый город — добавить в этот список (либо в Wave 5/6 переключиться
// на динамический matcher через middleware logic).
export const config = {
  matcher: [
    '/(tashkent|samarkand|bukhara|namangan|fergana|andijan|qarshi|nukus|urgench|jizzakh|gulistan|termez|chirchiq|navoi)/about',
  ],
}
```

- [ ] **Step 3: Verify TS**

Run:
```bash
bunx tsc --noEmit 2>&1 | grep -E "^proxy" | head -5
```

Expected: empty.

- [ ] **Step 4: Commit**

```bash
git add proxy.ts
git commit -m "feat(app): expand proxy matcher — /[city]/about for all known cities"
```

---

## Task 7: Удалить pages/[city]/about/index.tsx

**Files:** Delete `pages/[city]/about/index.tsx`

Pages Router и App Router не могут оба определять `/[city]/about`. App Router выигрывает, но Pages файл становится мёртвым кодом — удаляем явно.

- [ ] **Step 1: Удалить файл**

Run:
```bash
git rm "pages/[city]/about/index.tsx"
```

Expected: `rm 'pages/[city]/about/index.tsx'`

- [ ] **Step 2: Verify build всё ещё проходит**

Run:
```bash
rm -rf .next && bun run build > /tmp/wave2-task8.log 2>&1 && echo "BUILD OK" || (echo "BUILD FAIL"; tail -50 /tmp/wave2-task8.log)
```

Expected: `BUILD OK`. Если FAIL — изучить лог. Возможные причины:
- Layout пытается импортировать что-то из `pages/[city]/about/` — маловероятно
- TypeScript `routes.d.ts` validator имеет старую route — это автогенерируется и должно очиститься после `rm -rf .next`

- [ ] **Step 3: Commit**

```bash
git commit -m "feat(app): remove legacy pages/[city]/about/index.tsx (replaced by app/[city]/about/page.tsx)"
```

---

## Task 8: Verify dev runtime

**Files:** none

Проверить что `/tashkent/about` рендерится через App Router и `/tashkent` (без `/about`) всё ещё рендерится через Pages Router.

- [ ] **Step 1: Запустить dev на free port**

> **Note:** `bun dev` хардкодит `PORT=5656`. Если 5656 занят — использовать `bunx next dev --webpack -p <free port>`.

Run:
```bash
lsof -i :5656 2>&1 | head -3 || echo "5656 free"
```

If 5656 free, use `bun dev`. Otherwise use port 5757 (or other free port):

```bash
bunx next dev --webpack -p 5757 > /tmp/wave2-dev.log 2>&1 &
DEV_PID=$!
echo "DEV_PID=$DEV_PID" > /tmp/wave2-dev.pid
sleep 25
tail -30 /tmp/wave2-dev.log
```

Expected: `Ready in <X>ms` in log, no fatal errors.

- [ ] **Step 2: Curl /tashkent/about (App Router)**

Run (replace 5757 with actual port):
```bash
curl -s -o /tmp/curl-about.html -w "HTTP %{http_code}\n" http://localhost:5757/tashkent/about
echo "=== HTML excerpt ==="
grep -oE "(О компании|<h1|<title|chopar)" /tmp/curl-about.html | head -10
```

Expected:
- `HTTP 200`
- HTML contains `О компании` (наш inline RU текст)
- HTML contains Header/Footer markup (потому что layout рендерит legacy Layout)

- [ ] **Step 3: Curl /tashkent (Pages Router — должен работать как раньше)**

Run:
```bash
curl -s -o /tmp/curl-tashkent.html -w "HTTP %{http_code}\n" http://localhost:5757/tashkent
```

Expected: `HTTP 200` (Pages Router всё ещё работает для главной города).

- [ ] **Step 4: Curl /unknown-city/about (404 через notFound в layout)**

Run:
```bash
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:5757/notarealcity/about
```

Expected: `HTTP 404`.

> **Note:** Если HTTP 200 — значит matcher не отработал и URL пошёл в Pages Router. Проверить proxy.ts matcher — `notarealcity` не в списке известных, поэтому proxy его НЕ обработал. Это OK поведение: legacy pages/[city]/about — не должен ловить (мы его удалили в Task 8). Возможно вместо 404 Next.js покажет default 404 page без layout. Acceptable.

- [ ] **Step 5: Console check (рекомендуется через Chrome DevTools MCP)**

Если Chrome DevTools MCP доступен:

```
new_page("http://localhost:5757/tashkent/about")
list_console_messages()
```

Expected: нет hydration mismatch warnings, нет уровня ERROR.

- [ ] **Step 6: Остановить dev**

Run:
```bash
kill $(cat /tmp/wave2-dev.pid) 2>/dev/null
sleep 2
lsof -i :5757 2>/dev/null | head -2 || echo "5757 free"
```

---

## Task 9: Production build smoke test

**Files:** none

- [ ] **Step 1: Clean build**

Run:
```bash
rm -rf .next && bun run build > /tmp/wave2-prod-build.log 2>&1
echo "EXIT_CODE=$?"
tail -40 /tmp/wave2-prod-build.log
```

Expected: `EXIT_CODE=0`. В route summary видим `/[city]/about` в App Router section (статус ƒ Dynamic или ● SSG). Все остальные `/[city]/*` остаются в Pages Router section (как было).

- [ ] **Step 2: Verify generated routes**

Run:
```bash
grep -E "/\[city\]/about|/\[city\]/contacts" /tmp/wave2-prod-build.log
```

Expected:
- `/[city]/about` listed under App Router (с префиксом `┌` или `├` без указания `pages/`)
- `/[city]/contacts` listed under Pages Router (соседствует, не мигрирован)

---

## Task 10: Visual diff проверка через Chrome DevTools MCP

**Files:** none

Это шаг VALIDATION плана из спеки (Раздел 9). Чтобы Wave 2 действительно завершён — нужно сравнить локалку (после `bun dev`) с продом (`https://choparpizza.uz/tashkent/about`).

> **Если Chrome DevTools MCP недоступен** — пропустить этот шаг (отметить как DONE_WITH_CONCERNS) и зафиксировать manual validation как TODO для Wave 7 polish.

- [ ] **Step 1: Запустить dev (если уже не запущен)**

Run (адаптировать порт):
```bash
bunx next dev --webpack -p 5757 > /tmp/wave2-dev2.log 2>&1 &
echo $! > /tmp/wave2-dev2.pid
sleep 25
```

- [ ] **Step 2: Открыть обе страницы**

Через Chrome DevTools MCP:

```
new_page("https://choparpizza.uz/tashkent/about")
take_screenshot()  # сохранить для сравнения

new_page("http://localhost:5757/tashkent/about")
take_screenshot()  # сохранить для сравнения
```

- [ ] **Step 3: Diff DOM structure**

Через Chrome DevTools MCP:

```
take_snapshot() для обеих страниц
```

Compare:
- Header structure совпадает (нав, корзина, городской селектор, мобильная панель)
- Body content — заголовок "О компании" + параграф текста на месте
- Footer structure совпадает (соцсети, ссылки меню, copyright)
- CSS классы те же (Tailwind должен выдавать одинаковые имена для одинаковых утилит)

- [ ] **Step 4: Diff network**

```
list_network_requests() — для localhost
```

Expected:
- Нет 4xx/5xx (кроме известных, например favicon если отсутствует)
- Изображения с правильного CDN (`api.choparpizza.uz`, `choparpizza.uz`)

- [ ] **Step 5: Console check**

```
list_console_messages() — для localhost
```

Expected: пустой или только info/log. Никаких `ERROR` или hydration warnings.

- [ ] **Step 6: Остановить dev**

Run:
```bash
kill $(cat /tmp/wave2-dev2.pid) 2>/dev/null
sleep 2
```

---

## Final Verification

- [ ] **Step 1: Дерево файлов**

Run:
```bash
ls "app/[city]/" components_new/about/ lib/data/
git ls-files pages/[city]/about/ 2>&1
```

Expected:
- `app/[city]/`: `LayoutWrapper.tsx`, `about/`, `layout.tsx`, `not-found.tsx`
- `app/[city]/about/`: `page.tsx`
- `components_new/about/`: `About copy.tsx`, `About.tsx`, `AboutApp.tsx`
- `lib/data/`: `auth.ts`, `configs.ts`, `site-info.ts`
- `git ls-files pages/[city]/about/`: пусто (всё удалено), либо только `fran/` (Wave 2B)

- [ ] **Step 2: TS clean for our code**

Run:
```bash
bunx tsc --noEmit 2>&1 | grep -E "^(app/|i18n/|lib/data/|lib/posthog-app|proxy\.ts|components_new/(seo|about))" | head -10
```

Expected: пустой вывод.

- [ ] **Step 3: Build OK**

Run:
```bash
rm -rf .next && bun run build > /tmp/wave2-final.log 2>&1
echo "EXIT_CODE=$?"
```

Expected: `EXIT_CODE=0`.

- [ ] **Step 4: Commits Wave 2**

Run:
```bash
git log --oneline ceec55ef..HEAD
```

Expected: ~7-9 commits (`feat(app): add LayoutWrapper...` через `feat(app): remove legacy pages/[city]/about...`).

- [ ] **Step 5: Branch ready для Wave 2B**

Run:
```bash
git status
```

Expected: `working tree clean`.

---

## Wave 2A Done. Pattern для Wave 2B (контакты, доставка, филиалы, конфиденциальность, франшиза)

Wave 2B = повторить этот паттерн для оставшихся 5 статичных страниц. Для каждой:

1. **Создать `components_new/<feature>/<Feature>App.tsx`** — copy of legacy view-component, swap `useTranslation('common')` → `useExtracted`, replace `tr('key')` → `t('Inline RU text')`. Snap прод-тексты через DevTools MCP.

2. **Создать `app/[city]/<route>/page.tsx`** — server component с `generateMetadata` (canonical/hreflang/og), renders `<FeatureApp />`.

3. **Расширить `proxy.ts` matcher** — добавить новый route в `(city|...)/route` pattern.

4. **Удалить legacy `pages/[city]/<route>/index.tsx`**.

5. **Verify build + dev + DevTools MCP visual diff**.

**Что критично помнить для Wave 2B:**

- **Запрет `useTranslations`/`getTranslations`** — только `useExtracted`/`getExtracted`.
- **Inline RU тексты** — single source. UZ/EN msgstr заполняются в Wave 7 после `bun run build` extraction раскладывает в `messages/{uz,en}.po`.
- **Длинные HTML блоки** (как `tr('about_text')`, `tr('privacy_text')`) пока хардкодятся inline в TSX как HTML-литерал — Wave 7 решит правильную стратегию (отдельные msgid per paragraph vs CMS injection vs `.rich()` API).
- **Client components с формами** (Contacts с react-hook-form + axios) — больше работы:
  - Заменить `axios.post(...)` на Server Action (или оставить axios для Wave 2B, перенос на Server Actions — Wave 4)
  - Заменить `sessionStorage.getItem('configData')` на server-fetched `fetchPublicConfig()` через props
  - Заменить `useTranslation` → `useExtracted` для всех строк (включая form labels, error messages, button labels)

- **Branch.tsx использует `useUI().activeCity`** — теперь оно sync'ится через LayoutWrapper useEffect, должно работать as-is.

- **Privacy.tsx** — простейший, только `dangerouslySetInnerHTML={tr('privacy_text')}`. Заменить на inline HTML literal или вынести в отдельный data файл.

---

## Self-Review Checklist (для разработчика, выполняющего план)

- [ ] Каждая Task'а имеет `Files:` секцию
- [ ] Каждый Step имеет либо exact код, либо exact команду
- [ ] Pre-flight выполнен (Wave 1 завершён, baseline build OK)
- [ ] App Router URL `/tashkent/about` работает с правильным title и Header/Footer
- [ ] Pages Router URL `/tashkent` (без /about) всё ещё работает
- [ ] Production build проходит, route summary показывает `/[city]/about` в App Router
- [ ] Никаких `useTranslations`/`getTranslations` в новом коде
- [ ] Visual diff через DevTools MCP подтверждает паритет с прод-сайтом (или TODO для Wave 7)
