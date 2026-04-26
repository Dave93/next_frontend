# Chopar Pizza — Frontend Redesign 2026 (Next.js 16)

**Дата создания:** 2026-04-26
**Версия Next.js:** 16.2.2
**React:** 19.2
**Цель:** Сократить вес главной с 1556 KB / 130 KB gz → ~120 KB / ~18 KB gz, поднять LCP с 3041 ms → <1000 ms (полевые данные CrUX), при сохранении SEO для меню.

---

## 1. Контекст и базовые метрики

Текущее состояние главной `/[city]`:

| Метрика | Значение |
|---|---|
| HTML raw | 1556 KB |
| HTML gz | 130 KB |
| RSC payload в HTML | 700 KB JSON (полный список продуктов) |
| JSON-LD Menu schema (дублирован) | ~75 KB |
| Полигоны зон доставки в HTML | ~30 KB |
| Network requests | 105 на cold load |
| LCP (lab) | 611 ms |
| LCP (field, p75) | 3041 ms |
| TTFB (field, p75) | 1202 ms |
| INP (field, p75) | 235 ms |
| CLS (field, p75) | 0.27 |
| Топ JS чанки | 216 KB / 195 KB / 175 KB / 152 KB |

**Корневые причины:**

1. `<CityMainApp>` помечен `'use client'` и получает весь сырой массив продуктов с `attribute_data` (3 локали × name+description) и системными полями БД → 700 KB RSC payload.
2. `LayoutWrapper` помечен `'use client'`, получает `cities` с `polygons` (~30 KB) на каждой странице, хотя полигоны нужны только на `/order`.
3. `MenuJsonLd` рендерится дважды: один раз через JSON-LD `<script>`, второй раз попадает в RSC payload как часть `'use client'` дерева.
4. `react-phone-number-input` (152 KB) и Leaflet (144 KB) в общих чанках вместо динамических импортов.
5. Третьесторонние скрипты (GTM, FB Pixel, PostHog, Yandex Metrika, reCAPTCHA) грузятся одновременно с hydration.

---

## 2. Архитектурное решение — **Hybrid SSR shell + client-fetch каталога (вариант D)**

### Принцип
- **SSR (HTML):** Header, hero/слайдер, навигация категорий, **первая категория целиком + первые 6 продуктов** (above-fold для LCP + SEO ранжирования первой категории).
- **CSR (после hydration):** Все остальные категории фетчатся с `/api/menu/[city]/[locale]` через TanStack Query.
- **JSON-LD Menu schema:** Полная, генерируется серверно для SEO. Вынесена через `generateMetadata.other` для исключения дублирования в RSC.
- **API endpoint:** `app/api/menu/[city]/[locale]/route.ts` с `Cache-Control: s-maxage=3600, stale-while-revalidate=86400` + edge cache.

### Прогноз
| Метрика | Цель |
|---|---|
| HTML raw | ~120 KB (−92%) |
| HTML gz | ~18 KB (−86%) |
| First-paint LCP | ~700 ms (видна первая категория) |
| Full catalog visible | ~1500 ms (после client-fetch с edge-cache) |
| SEO | ✅ Google индексирует первую категорию + полный JSON-LD Menu |

---

## 3. Применяемые технологии Next.js 16 (factual feature inventory)

| Технология | Версия Next | Применение |
|---|---|---|
| `cacheComponents: true` | 16.0 stable | Включаем глобально → static shell + dynamic islands модель |
| `'use cache'` директива | 16.0 stable | Замена `unstable_cache` для всех data fetching функций |
| `cacheLife()`, `cacheTag()` | 16.0 stable | Точечный контроль TTL и инвалидация по тегам |
| `revalidateTag(tag, profile)` | 16.0 BREAKING | Новая 2-арг сигнатура для webhook-инвалидации |
| `updateTag(tag)` | 16.0 NEW | Read-your-writes после Server Actions |
| React Compiler `reactCompiler: true` | 16.0 opt-in | Авто-мемоизация |
| Turbopack production | 16.0 default | Уже включён по умолчанию |
| Layout deduplication + incremental prefetch | 16.0 free | Уже работает автоматически на наших `next/link` |
| `transitionTypes` на `next/link` | 16.2 NEW | Плавные переходы для категорий |
| `<Activity>` (React 19.2) | 16.0+ | Сохранение state cart drawer при hide |
| `images.localPatterns` | 16.0 BREAKING | Обязателен для `<img src="/cart_empty.png?w=...">` |
| `images.qualities` | 16.0 BREAKING | По умолчанию только `[75]` |
| Server Function Logging | 16.2 | Автоматический dev tool — мы уже на 16.2 |
| Hydration Diff Indicator | 16.2 | Автоматический dev tool — мы уже на 16.2 |
| `proxy.ts` (вместо middleware.ts) | 16.0 | ✅ Уже мигрировали |
| `<Suspense>` для streaming | стабильно | Скелетоны для каталога |
| Server Actions + Zod | стабильно | Для checkout / saveAddress / sendOTP |

**Что НЕ применяем** (отложено или скип):
- `forbidden()` / `unauthorized()` (experimental, не критично)
- `experimental.cachedNavigations` (16.2 эксп)
- `experimental.prefetchInlining` (16.2 эксп)
- Build Adapters API (для Vercel-style platforms)

---

## 4. Состав волн

### Wave 0 — React Compiler + breaking changes (0.5 дня)

**Цель:** Подготовить фундамент — включить React Compiler, обновить image config, исправить breaking changes. **`cacheComponents: true` НЕ включаем здесь** — только после миграции `lib/data/*` на `'use cache'` в Wave 1 (иначе билд падает на uncached fetch вне Suspense, особенно на private-роутах типа `/profile/address`).

**Файлы:**
- `next.config.ts`
  - `reactCompiler: true` — авто-мемоизация (требует `babel-plugin-react-compiler` dev-dep)
  - `images.imageSizes`: убрать `16` (16.0 default change)
  - `images.localPatterns: [{ pathname: '/**' }]` (16.0 BREAKING — без него `next/image` для local источников падает)
  - **Комментарий:** `cacheComponents` будет включён в Wave 1 в самом конце
- `package.json`
  - `"analyze": "next experimental-analyze"` (заменить на встроенный анализатор Next 16.1+)
  - Удалить devDependency `@next/bundle-analyzer` (устаревшая)

**Проверки (grep + фикс):**
- `revalidateTag('foo')` (1-arg) → `revalidateTag('foo', 'max')` (16.0 BREAKING)
- Parallel routes (`@*` папки в `app/`) → если есть, добавить `default.js`
- `next/legacy/image` → миграция на `next/image`
- Sync `cookies()` / `headers()` / `params` без await → исправить
- `serverRuntimeConfig` / `publicRuntimeConfig` → удалить

**Эффект Wave 0:**
- Готовый фундамент под Wave 1
- React Compiler — потенциально −5..15% времени рендера (нужно измерить)
- HTML/JS пока не меняется

---

### Wave 1 — Slim DTO + Hybrid SSR shell + Client-fetched каталог + cacheComponents on (3-4 дня)

**Цель:** −92% HTML, −86% gz, исчезает 700 KB RSC payload, остаётся первая категория для LCP/SEO. **Включаем `cacheComponents: true` в самом конце**, после миграции data layer на `'use cache'` и добавления Suspense обёрток.

**ВАЖНО про cacheComponents — ОТЛОЖЕНО (research findings):**

⚠️ **Включение cacheComponents в проде заблокировано до Next 16.2.5+** из-за критических memory leak багов:
- Issue #92287 — `output: standalone` + `cacheComponents` = OOM за 8 часов на 512 MiB. **Не исправлен в 16.2.3 / 16.2.4.**
- Issue #93069/#93068 — широкий tee'd-stream `arrayBuffers` leak ~30 MiB/час даже без standalone, влияет на ВСЕ 16.x stable. Фикс только на canary (PRs #88577, #89040).
- Issue #92992 — blank page после POST с cacheComponents (open).
- Issue #86577 — `<Activity>` route preservation breaks с cacheComponents (open).

**Решение:** Wave 1 строим БЕЗ cacheComponents. Используем существующий `unstable_cache(fn, keys, { tags, revalidate })` API — он не deprecated, работает корректно, и обеспечивает 95% нужной нам функциональности:
- `unstable_cache(...)` для кеша = ✅ (вместо `'use cache'`)
- `revalidateTag('menu')` для инвалидации от Laravel webhook = ✅
- `revalidate: 3600` опция для TTL = ✅ (вместо `cacheLife('hours')`)

Что откладываем (включим в отдельной Wave когда появится 16.2.5+):
- `'use cache'` директива (косметика — та же функциональность через `unstable_cache`)
- `cacheLife()` granular API
- `updateTag()` для read-your-writes (заменяем на `revalidateTag` + `router.refresh()`)
- `<Activity>` для cart drawer (есть свой баг с cacheComponents)

Suspense streaming, slim DTO, client-fetch каталог, JSON-LD trim — **всё это работает БЕЗ cacheComponents** и составляет основу Wave 1.

**Новые файлы:**
1. `lib/data/menu-dto.ts` — типы `SlimMenu`, `SlimSection`, `SlimProduct`, `SlimVariant`, `SlimModifierGroup`, функция `toSlimMenu(raw, citySlug, locale)` с локализацией и обрезкой description до 200 chars без HTML.
2. `app/api/menu/[city]/[locale]/route.ts` — GET handler возвращающий `SlimMenu` с `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400`.
3. `components_new/main/server/CityMainServer.tsx` — серверный компонент (RSC), возвращает разметку shell + первой категории.
4. `components_new/main/server/CategoriesNavServer.tsx` — серверный, рендерит `<a href="#section-N">` ссылки.
5. `components_new/main/server/MobileCategoriesNavServer.tsx` — серверный mobile вариант.
6. `components_new/main/server/CategorySectionServer.tsx` — серверная секция категории.
7. `components_new/main/server/ProductCardServer.tsx` — серверная карточка продукта.
8. `components_new/main/server/HeroSliderServer.tsx` — серверная обёртка над swiper (client-island внутри).
9. `components_new/main/server/skeletons.tsx` — `<CatalogSkeleton/>`, `<CategorySectionSkeleton/>`.
10. `components_new/main/islands/ClientCatalog.tsx` — `'use client'`, использует `useQuery` от TanStack Query, рендерит остальные категории.
11. `components_new/main/islands/AddToCartButton.tsx` — `'use client'`, минимальный leaf для add-to-cart.
12. `components_new/main/islands/OpenProductDrawer.tsx` — `'use client'`, button-обёртка.
13. `components_new/main/islands/CityHeading.tsx` — `'use client'`, H1 с активным городом из useUI.

**Изменяемые файлы:**
- `lib/data/products.ts` — добавить `getCityMenu(citySlug, locale): Promise<SlimMenu>` с `'use cache'` + `cacheLife('hours')` + `cacheTag('menu', menu:${slug}, menu:${slug}:${locale})`.
- `lib/data/site-info.ts` — мигрировать с `unstable_cache` на `'use cache'` + `cacheTag('site-info')`.
- `lib/data/sliders.ts` — мигрировать на `'use cache'` + `cacheTag('sliders', sliders:${locale})`.
- `lib/data/news.ts`, `lib/data/sales.ts` — мигрировать на `'use cache'`.
- `app/[city]/page.tsx` — переписать: фетчит лёгкие данные (sliders, siteInfo), вызывает `getCityMenu`, рендерит `<CityMainServer/>` + `<ClientCatalog citySlug locale skipFirstSection/>`.
- `components_new/seo/MenuJsonLd.tsx` — принимать `SlimMenu`, генерировать минимальный schema (имя + url + price только).

**Чистка:**
- Найти все импорты `swr` через grep, мигрировать на `@tanstack/react-query`.
- Удалить пакет `swr` из `package.json` (−5 KB gz initial).

**Старый код:**
- `components_new/main/CityMainApp.tsx` — НЕ удаляем сразу. Помечаем `@deprecated` в JSDoc, оставляем рядом с новыми компонентами. Удалим в Wave 1.5 после prod-валидации.

**Эффект Wave 1:**
- HTML 1556 KB → ~150 KB (−90%), gz 130 KB → ~22 KB (−83%)
- RSC payload: 700 KB → 0
- Первая категория в HTML для LCP/SEO
- Остальное стримится по сети после hydration через edge-cache

---

### Wave 2 — `<Suspense>` boundaries + параллельный data fetching (1 день)

**Цель:** Streaming TTFB <100ms — shell виден до загрузки данных меню.

**Изменения:**
- `app/[city]/page.tsx`:
  - Обернуть `<CityMainServer/>` в `<Suspense fallback={<HeroSliderSkeleton/>}>`
  - Обернуть `<ClientCatalog/>` в `<Suspense fallback={<CatalogSkeleton/>}>`
  - Параллелизовать fetches через `Promise.all`
- Все async серверные компоненты получают свои Suspense обёртки

**Эффект Wave 2:**
- TTFB lab: 316 ms → <100 ms (shell сразу из cache)
- LCP shell виден до данных
- Каждая категория получает свой stream chunk (если меняем модель внутри Wave 1)

---

### Wave 3 — Cart Zustand + декомпозиция `ManagedUIContext` + `<Activity>` для drawer + Server Actions (3-4 дня)

**Цель:** Точечные ре-рендеры, read-your-writes для адресов, типизированные мутации.

**Новые файлы:**
1. `lib/stores/cart-store.ts` — Zustand с `persist` middleware (localStorage). API: `addItem`, `removeItem`, `updateQty`, `clear`, `total`, `count`.
2. `lib/stores/ui-store.ts` — Zustand для модалов/sidebars (взято из useUI).
3. `lib/stores/user-store.ts` — Zustand для auth/profile (взято из useUI).
4. `lib/stores/location-store.ts` — Zustand для locationData/activeCity.
5. `app/[city]/profile/address/actions.ts` — Server Action `saveAddress(formData)` с Zod валидацией + `updateTag('user-addresses')`.
6. `app/[city]/profile/account/actions.ts` — Server Action `updateProfile(formData)`.
7. `app/[city]/order/actions.ts` — Server Action `createOrder(formData)`.

**Изменяемые файлы:**
- `components_new/main/islands/AddToCartButton.tsx` — переключить на `useCartStore`.
- `components_new/common/SmallCartApp.tsx` — Zustand + `<Activity mode={isOpen ? 'visible' : 'hidden'}>`.
- `components_new/order/OrdersApp.tsx` — заменить axios `saveOrder` на Server Action.
- `components/ui/context.tsx` — постепенно деприкейтить, оставить shim.

**Эффект Wave 3:**
- Cart перестаёт триггерить ре-рендер всего сайта
- Drawer сохраняет state при close
- Сохранение адреса → мгновенно отображается (read-your-writes)
- Типизированный API для checkout

---

### Wave 4 — Webhook инвалидации меню от Laravel (1 день)

**Цель:** Меню обновляется на сайте мгновенно после изменения в админке.

**Новые файлы:**
1. `app/api/revalidate/route.ts` — POST handler с проверкой `x-revalidate-secret`, вызывает `revalidateTag(tag, 'max')` для каждого тега из body.
2. `.env.local.example` — добавить `REVALIDATE_SECRET=...`

**Backend (Laravel — отдельный коммит в backend репо):**
- Хук на `Product::saved`, `Category::saved`, `Slider::saved` → POST на `https://choparpizza.uz/api/revalidate` с массивом тегов.

**Эффект Wave 4:**
- Меню обновляется мгновенно в проде после сохранения в админке
- Без webhook кеш живёт `cacheLife('hours')` = до 1 часа задержка

---

### Wave 5 — Чистка `polygons` из layout + bundle slimming (1-2 дня)

**Цель:** −30 KB HTML на каждой странице (полигоны), −60 KB gz initial JS.

**Изменения:**
1. `app/[city]/layout.tsx` — фильтровать `cities` через `slimCity()` (без `polygons`), тонкий `currentCity`.
2. `lib/data/city-zones.ts` (новый) — `getCityZones(citySlug)` с `'use cache'` + `cacheLife('days')` + `cacheTag('zones', zones:${slug})`.
3. `app/[city]/order/page.tsx` — фетчит `zones` серверно, передаёт в `OrderCheckoutClient`.
4. `components_new/order/OrdersApp.tsx` — читает `zones` из пропсов, не из контекста.

**Bundle splits:**
1. `react-phone-number-input` → dynamic-импорт **только** в `SignInModalApp`.
2. Leaflet → проверить, что не утекает в общий чанк через `LayoutWrapper.tsx` (`LocationTabsModalApp`); обернуть `LocationTabsModalApp` в `dynamic({ ssr: false })`.
3. PostHog/GTM/FB Pixel/reCAPTCHA → обёртка через `dynamic({ ssr: false })` + `requestIdleCallback` для отложенной инициализации.

**Эффект Wave 5:**
- HTML −30 KB
- Initial JS bundle −60 KB gz

---

### Wave 6 (опционально) — PWA: Service Worker + push notifications (3-5 дней)

**Цель:** Offline-first для повторных визитов, push для статусов заказов.

- Workbox precache app shell + last-viewed menu
- Web Push API подписка → backend пушит "ваш заказ принят/готов/в пути"
- Install prompt после 2 успешных заказов

**Откладываем до завершения Wave 1-5 + prod-валидации.**

---

## 5. Метрики успеха

После Wave 5 ожидаем:

| Метрика | Сейчас | Цель | Измерять через |
|---|---|---|---|
| HTML raw | 1556 KB | <200 KB | `curl -sH 'Accept-Encoding: identity'` |
| HTML gz | 130 KB | <25 KB | curl + gzip |
| TTFB (lab) | 316 ms | <100 ms | Chrome DevTools Performance |
| LCP (lab) | 611 ms | <500 ms | Chrome DevTools Performance |
| LCP (field p75) | 3041 ms | <1500 ms | CrUX (через 30 дней после deploy) |
| INP (field p75) | 235 ms | <200 ms | CrUX |
| CLS (field p75) | 0.27 | <0.1 | CrUX |
| Initial JS bundle gz | ~240 KB | <180 KB | `next experimental-analyze` |
| Network requests на cold load | 105 | <60 | Chrome DevTools Network |
| SEO ранжирование "пицца ташкент" | baseline | сохранить или улучшить | Yandex Webmaster + Google Search Console |

---

## 6. Outside-of-scope (для будущих фаз)

- **MapLibre GL** вместо Leaflet (отдельная фаза, экономия −60% карта-bundle)
- **WebAuthn / Passkey** для повторных пользователей
- **SSE order tracking** (вместо polling)
- **sGTM** (server-side GTM) на Cloudflare Worker
- **CDN** (Cloudflare/BunnyCDN) перед `choparpizza.uz` для edge cache HTML и `_next/static`
- **OpenTelemetry** на Laravel + Next API routes
- **Real User Monitoring** через web-vitals → собственный endpoint
- Полный отказ от `ManagedUIContext` (постепенная декомпозиция в Wave 3+)

---

## 7. План коммитов

Каждая волна = минимум один атомарный коммит, максимум один коммит на файловую группу. После каждой волны:
1. `bun run build` локально → проверить отсутствие ошибок
2. Самопроверка на dev (где возможно)
3. `git commit` с описательным сообщением
4. `git push origin main`
5. Деплой через `./deploy.sh` на сервере
6. Smoke test на проде через Chrome DevTools MCP
7. Замер метрик (HTML size, network requests)
8. Подтвердить с пользователем перед стартом следующей волны

---

## 8. Откат

Если Wave ломает прод:
- `git revert <commit-hash>` + push + redeploy
- Старые файлы (например `CityMainApp.tsx`) сохраняются до полной валидации Wave 1.5

---

**Готов к выполнению по подтверждению пользователя. Стартовая точка — Wave 0.**
