# App Router Migration — Wave 2B-lite: Static Pages (Fran, Delivery, Privacy)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Мигрировать 3 простых статичных страницы в App Router: `[city]/about/fran` (inline RU markup без хуков), `[city]/delivery` (heading + HTML body), `[city]/privacy` (только HTML body). Все 3 — **server components** с `getExtracted` (NEVER `getTranslations`).

**Architecture:** Каждая страница = `app/[city]/<route>/page.tsx` (server, generateMetadata) → рендерит view-component из `components_new/<feature>/<Feature>App.tsx` (server, без `'use client'`). Длинные HTML-блоки (delivery_text, privacy_text) хардкодятся inline literal — Wave 7 решит strategy для proper i18n. Snap прод-текстов через Chrome DevTools MCP.

**Out of scope:**
- `[city]/branch` — Yandex Maps + axios fetch → Wave 2B-Maps
- `[city]/contacts` — react-hook-form + axios POST + CSRF → Wave 2B-Form
- Mobile UX, LocationTabs, SignInModal — отдельные waves

**Tech Stack:** Next.js 16.2.2, React 18, TypeScript 5.3.3, `next-intl@4.9.1` (`getExtracted` only — `useTranslations`/`getTranslations` forbidden), Tailwind 2, `next/image`.

**Reference spec:** `docs/superpowers/specs/2026-04-22-app-router-migration-design.md`
**Reference plans:** Wave 1, Wave 2 (about), Wave 2.5 (header/footer)

---

## File Structure

### Created

| Файл | Тип | Ответственность |
|---|---|---|
| `components_new/fran/FranApp.tsx` | server | Server component с inline RU markup (копия Fran.tsx без `memo`/`'use client'`) |
| `components_new/delivery/DeliveryApp.tsx` | server | `getExtracted('Доставка и оплата')` heading + inline HTML body |
| `components_new/privacy/PrivacyApp.tsx` | server | Inline HTML body (snap прода) |
| `app/[city]/about/fran/page.tsx` | server | Page + generateMetadata, рендерит `<FranApp />` |
| `app/[city]/delivery/page.tsx` | server | Page + generateMetadata, рендерит `<DeliveryApp />` |
| `app/[city]/privacy/page.tsx` | server | Page + generateMetadata, рендерит `<PrivacyApp />` |

### Modified

| Файл | Изменение |
|---|---|
| `proxy.ts` | Расширить matcher: добавить `about/fran`, `delivery`, `privacy` для known city slugs |

### Deleted

| Файл | Причина |
|---|---|
| `pages/[city]/about/fran/index.tsx` | Заменено `app/[city]/about/fran/page.tsx` |
| `pages/[city]/delivery/index.tsx` | Заменено `app/[city]/delivery/page.tsx` |
| `pages/[city]/privacy/index.tsx` | Заменено `app/[city]/privacy/page.tsx` |

### Untouched

- `components_new/fran/Fran.tsx`, `delivery/Delivery.tsx`, `privacy` (legacy, не существует — Privacy.tsx hardcoded в legacy `pages/[city]/privacy/index.tsx`)
- `pages/[city]/branch/`, `pages/[city]/contacts/` — Wave 2B-Maps / 2B-Form
- Все остальные legacy `pages/[city]/...` — Waves 3-5

---

## Pre-flight

- [ ] **Step 1: Verify Wave 2.5 done**

```bash
cd /Users/macbookpro/development/next_frontend
git branch --show-current  # = migration/app-router
ls components_new/HeaderApp.tsx components_new/FooterApp.tsx
git log --oneline -3
```

Expected: ветка `migration/app-router`; HeaderApp.tsx и FooterApp.tsx существуют; последний commit ~ `597d08c6` (chore(header): drop unused React import) или newer.

- [ ] **Step 2: Baseline build OK**

```bash
rm -rf .next && bun run build > /tmp/wave2b-baseline.log 2>&1 && echo "OK" || (echo "FAIL"; tail -30 /tmp/wave2b-baseline.log)
```

Expected: `OK`.

---

## Task 1: Snap прод-текстов через Chrome DevTools MCP

**Files:** none (data collection)

Снять с прода тексты для:
1. `/tashkent/delivery` — заголовок "Доставка и оплата" + body HTML
2. `/tashkent/privacy` — body HTML (заголовка нет)

- [ ] **Step 1: Снять delivery с прода**

Use Chrome DevTools MCP:

```
mcp__plugin_chrome-devtools-mcp_chrome-devtools__new_page(url: "https://choparpizza.uz/tashkent/delivery")
mcp__plugin_chrome-devtools-mcp_chrome-devtools__take_snapshot()
```

Также через `evaluate_script` извлечь exact innerHTML body (то что в `<div class="md:grid gap-10 mb-8">`):

```javascript
document.querySelector('.md\\:grid.gap-10.mb-8')?.innerHTML
```

Сохранить:
- Heading text (RU): должно быть "Доставка и оплата" или близко
- Body HTML (RU): полный HTML с параграфами

If MCP fails → fallback к curl:
```bash
curl -s -A "Mozilla/5.0..." https://choparpizza.uz/tashkent/delivery > /tmp/prod-delivery-ru.html
```
Найти div с body.

- [ ] **Step 2: Снять privacy с прода**

```
mcp__plugin_chrome-devtools-mcp_chrome-devtools__new_page(url: "https://choparpizza.uz/tashkent/privacy")
mcp__plugin_chrome-devtools-mcp_chrome-devtools__take_snapshot()
```

`evaluate_script`:
```javascript
// Privacy text rendered into <div dangerouslySetInnerHTML> — find the wrapper.
// Legacy code: <div dangerouslySetInnerHTML={{ __html: tr('privacy_text') }} />
// So look for the <div> element that has innerHTML matching long text.
document.body.innerText.length  // diagnostic
document.querySelector('main > div')?.outerHTML  // try to find main content wrapper
```

Сохранить privacy_text HTML.

If text is enormous (>10K chars) — записать его в `/tmp/prod-privacy-ru.html` для последующего использования в Task 6.

If MCP unavailable / page is fully client-rendered → use placeholder for Task 6:
```
<p>Политика конфиденциальности пользователей сайта Chopar Pizza...</p>
<p>(полный текст будет добавлен в Wave 7 после snap прода через DevTools MCP)</p>
```

Note in subagent report: какой режим использовали (snap или fallback).

- [ ] **Step 3: Close DevTools MCP pages**

```
mcp__plugin_chrome-devtools-mcp_chrome-devtools__close_page(pageId: <delivery_page_id>)
mcp__plugin_chrome-devtools-mcp_chrome-devtools__close_page(pageId: <privacy_page_id>)
```

(или leave open — будут переиспользованы в Task 11 visual diff)

> **No commit for this task** — это data collection. Тексты используются в Tasks 5, 6.

---

## Task 2: components_new/fran/FranApp.tsx (server component)

**Files:** Create `components_new/fran/FranApp.tsx`

Legacy `Fran.tsx` — pure markup без хуков. Просто скопировать и убрать `memo`/`FC` wrappers (server components не используют `memo`).

- [ ] **Step 1: Создать файл**

Read legacy `components_new/fran/Fran.tsx` для копирования содержимого. Затем write `components_new/fran/FranApp.tsx`:

Структура:
```typescript
import Image from 'next/image'

export default function FranApp() {
  return (
    <div className="mx-5 md:mx-0">
      {/* COPY ALL JSX FROM legacy Fran.tsx return (...) */}
    </div>
  )
}
```

**Полностью** скопировать markup из legacy `Fran.tsx` (все 9 секций: header, форматы ресторанов, о пицце, секреты вкуса, форматы продукта, бренд, контакты). Тексты остаются inline RU как в оригинале (legacy Fran не использовал `tr()`).

- [ ] **Step 2: Verify TS**

```bash
bunx tsc --noEmit 2>&1 | grep -E "^components_new/fran/FranApp" | head -5
```

Expected: empty.

- [ ] **Step 3: Commit**

```bash
git add components_new/fran/FranApp.tsx
git commit -m "feat(fran): add FranApp server component (inline RU markup, no hooks)"
```

---

## Task 3: app/[city]/about/fran/page.tsx

**Files:** Create `app/[city]/about/fran/page.tsx`

- [ ] **Step 1: Создать файл**

Write `app/[city]/about/fran/page.tsx`:

```typescript
import type { Metadata } from 'next'
import FranApp from '../../../../components_new/fran/FranApp'

type Params = { city: string }

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { city } = await params
  const base = 'https://choparpizza.uz'
  return {
    title: 'Франшиза Chopar Pizza',
    description: 'Льготные условия франчайзинга — открой свою пиццерию Chopar',
    alternates: {
      canonical: `${base}/${city}/about/fran`,
      languages: {
        ru: `${base}/${city}/about/fran`,
        uz: `${base}/uz/${city}/about/fran`,
        en: `${base}/en/${city}/about/fran`,
      },
    },
  }
}

export default function FranPage() {
  return <FranApp />
}
```

- [ ] **Step 2: Verify TS**

```bash
bunx tsc --noEmit 2>&1 | grep -E "^app/\[city\]/about/fran" | head -5
```

Expected: empty.

- [ ] **Step 3: Commit**

```bash
git add "app/[city]/about/fran/page.tsx"
git commit -m "feat(app): add /[city]/about/fran page (server, generateMetadata)"
```

---

## Task 4: components_new/delivery/DeliveryApp.tsx (server component)

**Files:** Create `components_new/delivery/DeliveryApp.tsx`

Use `getExtracted` from `next-intl/server` для heading. Body — inline HTML literal (snap прода из Task 1).

- [ ] **Step 1: Создать файл**

Write `components_new/delivery/DeliveryApp.tsx`:

```typescript
import { getExtracted } from 'next-intl/server'

const DELIVERY_BODY_HTML = `<!-- TODO: Replace with actual HTML extracted from prod /tashkent/delivery in Task 1 -->
<p>Доставка работает с 10:00 до 03:00 ежедневно.</p>
<p>Способы оплаты: наличными курьеру, картой курьеру, онлайн-оплата.</p>`

export default async function DeliveryApp() {
  const t = await getExtracted()
  return (
    <div className="mx-5 md:mx-0">
      <div className="text-3xl mb-1">{t('Доставка и оплата')}</div>
      <div className="border-b-2 w-24 border-yellow mb-10"></div>
      <div className="md:grid gap-10 mb-8">
        <div dangerouslySetInnerHTML={{ __html: DELIVERY_BODY_HTML }} />
      </div>
    </div>
  )
}
```

If Task 1 successfully extracted real prod HTML — replace `DELIVERY_BODY_HTML` literal with that HTML. Use exact text from prod `t('...')` for heading too (might be "Доставка и оплата" or different exact string).

> **Critical:** Only `getExtracted` from `next-intl/server` — NEVER `getTranslations`. NEVER `useTranslations`. NEVER `useExtracted` here (this is server component, useExtracted is client-only).

- [ ] **Step 2: Verify TS**

```bash
bunx tsc --noEmit 2>&1 | grep -E "^components_new/delivery/DeliveryApp" | head -5
```

Expected: empty.

- [ ] **Step 3: Commit**

```bash
git add components_new/delivery/DeliveryApp.tsx
git commit -m "feat(delivery): add DeliveryApp server component (getExtracted heading, inline HTML body)"
```

---

## Task 5: app/[city]/delivery/page.tsx

**Files:** Create `app/[city]/delivery/page.tsx`

- [ ] **Step 1: Создать файл**

Write `app/[city]/delivery/page.tsx`:

```typescript
import type { Metadata } from 'next'
import DeliveryApp from '../../../components_new/delivery/DeliveryApp'

type Params = { city: string }

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { city } = await params
  const base = 'https://choparpizza.uz'
  return {
    title: 'Доставка и оплата',
    description: 'Как сделать заказ, инструкция и дополнительная информация',
    alternates: {
      canonical: `${base}/${city}/delivery`,
      languages: {
        ru: `${base}/${city}/delivery`,
        uz: `${base}/uz/${city}/delivery`,
        en: `${base}/en/${city}/delivery`,
      },
    },
  }
}

export default function DeliveryPage() {
  return <DeliveryApp />
}
```

- [ ] **Step 2: Verify TS**

```bash
bunx tsc --noEmit 2>&1 | grep -E "^app/\[city\]/delivery" | head -5
```

Expected: empty.

- [ ] **Step 3: Commit**

```bash
git add "app/[city]/delivery/page.tsx"
git commit -m "feat(app): add /[city]/delivery page (server, generateMetadata)"
```

---

## Task 6: components_new/privacy/PrivacyApp.tsx (server component)

**Files:** Create `components_new/privacy/PrivacyApp.tsx`

Privacy не имеет heading в legacy — просто HTML body. Тоже server component.

- [ ] **Step 1: Создать файл**

```bash
mkdir -p components_new/privacy
```

Write `components_new/privacy/PrivacyApp.tsx`:

```typescript
const PRIVACY_BODY_HTML = `<!-- TODO: Replace with actual HTML extracted from prod /tashkent/privacy in Task 1 -->
<h1 class="text-3xl mb-4">Политика конфиденциальности</h1>
<p>Полный текст будет добавлен в Wave 7 после snap прода через DevTools MCP.</p>`

export default function PrivacyApp() {
  return (
    <div className="mx-5 md:mx-0 prose max-w-none">
      <div dangerouslySetInnerHTML={{ __html: PRIVACY_BODY_HTML }} />
    </div>
  )
}
```

If Task 1 extracted real prod HTML — replace `PRIVACY_BODY_HTML` literal with that HTML (could be very long, up to 50K+ chars — that's fine, it's a single string literal).

> **Note:** No `getExtracted` here — body is one giant HTML blob. Wave 7 decides if to split into per-paragraph msgid or keep as CMS data.

- [ ] **Step 2: Verify TS**

```bash
bunx tsc --noEmit 2>&1 | grep -E "^components_new/privacy/PrivacyApp" | head -5
```

Expected: empty.

- [ ] **Step 3: Commit**

```bash
git add components_new/privacy/PrivacyApp.tsx
git commit -m "feat(privacy): add PrivacyApp server component (inline HTML body)"
```

---

## Task 7: app/[city]/privacy/page.tsx

**Files:** Create `app/[city]/privacy/page.tsx`

- [ ] **Step 1: Создать файл**

Write `app/[city]/privacy/page.tsx`:

```typescript
import type { Metadata } from 'next'
import PrivacyApp from '../../../components_new/privacy/PrivacyApp'

type Params = { city: string }

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { city } = await params
  const base = 'https://choparpizza.uz'
  return {
    title: 'Политика конфиденциальности',
    description: 'Политика конфиденциальности Chopar Pizza',
    alternates: {
      canonical: `${base}/${city}/privacy`,
      languages: {
        ru: `${base}/${city}/privacy`,
        uz: `${base}/uz/${city}/privacy`,
        en: `${base}/en/${city}/privacy`,
      },
    },
    robots: {
      index: false,
      follow: true,
    },
  }
}

export default function PrivacyPage() {
  return <PrivacyApp />
}
```

> Note: `robots.index: false` потому что privacy policy обычно не нужен в search index.

- [ ] **Step 2: Verify TS**

```bash
bunx tsc --noEmit 2>&1 | grep -E "^app/\[city\]/privacy" | head -5
```

Expected: empty.

- [ ] **Step 3: Commit**

```bash
git add "app/[city]/privacy/page.tsx"
git commit -m "feat(app): add /[city]/privacy page (server, generateMetadata, noindex)"
```

---

## Task 8: Update proxy.ts matcher

**Files:** Modify `proxy.ts`

Расширить matcher: добавить `about/fran`, `delivery`, `privacy` для known city slugs.

- [ ] **Step 1: Прочитать текущий proxy.ts**

```bash
cat proxy.ts
```

- [ ] **Step 2: Обновить proxy.ts**

Replace `proxy.ts`:

```typescript
import createMiddleware from 'next-intl/middleware'
import { type NextRequest } from 'next/server'
import { routing } from './i18n/routing'

const intlProxy = createMiddleware(routing)

export function proxy(request: NextRequest) {
  // App Router URL'ы постепенно расширяются по мере миграции страниц.
  // Wave 1: /test-foundation (удалена)
  // Wave 2: /[city]/about
  // Wave 2B-lite: + /[city]/about/fran, /[city]/delivery, /[city]/privacy
  // Waves далее добавят остальные routes (контент, каталог, personal).
  return intlProxy(request)
}

const CITIES = '(tashkent|samarkand|bukhara|namangan|fergana|andijan|qarshi|nukus|urgench|jizzakh|gulistan|termez|chirchiq|navoi)'

export const config = {
  matcher: [
    `/${CITIES}/about`,
    `/${CITIES}/about/fran`,
    `/${CITIES}/delivery`,
    `/${CITIES}/privacy`,
  ],
}
```

- [ ] **Step 3: Verify TS**

```bash
bunx tsc --noEmit 2>&1 | grep -E "^proxy" | head -5
```

Expected: empty.

- [ ] **Step 4: Commit**

```bash
git add proxy.ts
git commit -m "feat(app): expand proxy matcher — fran, delivery, privacy routes"
```

---

## Task 9: Удалить legacy pages

**Files:**
- Delete: `pages/[city]/about/fran/index.tsx`
- Delete: `pages/[city]/delivery/index.tsx`
- Delete: `pages/[city]/privacy/index.tsx`

3 deletes — один commit.

- [ ] **Step 1: Удалить файлы**

```bash
git rm "pages/[city]/about/fran/index.tsx" "pages/[city]/delivery/index.tsx" "pages/[city]/privacy/index.tsx"
```

Expected:
```
rm 'pages/[city]/about/fran/index.tsx'
rm 'pages/[city]/delivery/index.tsx'
rm 'pages/[city]/privacy/index.tsx'
```

- [ ] **Step 2: Verify build**

```bash
rm -rf .next && bun run build > /tmp/wave2b-task9.log 2>&1 && echo "BUILD OK" || (echo "BUILD FAIL"; tail -50 /tmp/wave2b-task9.log)
```

Expected: `BUILD OK`. Если FAIL — STOP, report BLOCKED.

- [ ] **Step 3: Commit**

```bash
git commit -m "feat(app): remove legacy pages/[city]/{about/fran,delivery,privacy}"
```

---

## Task 10: Verify dev runtime

**Files:** none

- [ ] **Step 1: Запустить dev**

```bash
lsof -i :5757 2>&1 | head -3 || echo "5757 free"
bunx next dev --webpack -p 5757 > /tmp/wave2b-dev.log 2>&1 &
echo $! > /tmp/wave2b-dev.pid
sleep 25
tail -10 /tmp/wave2b-dev.log
```

Expected: `Ready in <X>ms`.

- [ ] **Step 2: Curl all 3 routes**

```bash
echo "=== /tashkent/about/fran ==="
curl -s -o /tmp/wave2b-fran.html -w "HTTP %{http_code}\n" http://localhost:5757/tashkent/about/fran
grep -ocE "Льготные условия|Франшиза|форматы ресторанов|Большой ресторан" /tmp/wave2b-fran.html

echo "=== /tashkent/delivery ==="
curl -s -o /tmp/wave2b-delivery.html -w "HTTP %{http_code}\n" http://localhost:5757/tashkent/delivery
grep -ocE "Доставка и оплата|payment|delivery" /tmp/wave2b-delivery.html

echo "=== /tashkent/privacy ==="
curl -s -o /tmp/wave2b-privacy.html -w "HTTP %{http_code}\n" http://localhost:5757/tashkent/privacy
grep -ocE "конфиденциальности|privacy" /tmp/wave2b-privacy.html
```

Expected: HTTP 200 for all 3, marker counts > 0.

- [ ] **Step 3: Verify Header/Footer present (from Wave 2.5)**

```bash
grep -ocE "main_logo|footer_logo|googleReady" /tmp/wave2b-fran.html
```

Expected: > 0 (Header + Footer должны рендериться через city layout).

- [ ] **Step 4: Verify legacy /tashkent (Pages Router) не сломан**

```bash
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:5757/tashkent
```

Expected: HTTP 200.

- [ ] **Step 5: Stop dev**

```bash
kill $(cat /tmp/wave2b-dev.pid) 2>/dev/null
sleep 2
```

---

## Task 11: DevTools MCP visual diff

**Files:** none

Сравнить три новых страницы с продом.

- [ ] **Step 1: Запустить dev (если не запущен)**

```bash
bunx next dev --webpack -p 5757 > /tmp/wave2b-dev2.log 2>&1 &
echo $! > /tmp/wave2b-dev2.pid
sleep 25
```

- [ ] **Step 2: Snapshot fran (local + prod)**

```
mcp__plugin_chrome-devtools-mcp_chrome-devtools__new_page(url: "https://choparpizza.uz/tashkent/about/fran")
mcp__plugin_chrome-devtools-mcp_chrome-devtools__take_snapshot()

mcp__plugin_chrome-devtools-mcp_chrome-devtools__new_page(url: "http://localhost:5757/tashkent/about/fran")
mcp__plugin_chrome-devtools-mcp_chrome-devtools__take_snapshot()
```

Compare:
- ✅ Header (logo, phone, city, lang, login)
- ✅ Main: "Льготные условия", "форматы ресторанов" 3 cards (Большой/Средний/Маленький), "О нашей пицце", "Главные секреты" 3 cards (тесто/соус/моцарелла), "форматы продукта" 3 sizes (35/32/25 см), "Узнаваемый бренд", "По вопросам франчайзинга" + tel
- ✅ Footer

- [ ] **Step 3: Snapshot delivery**

```
mcp__plugin_chrome-devtools-mcp_chrome-devtools__new_page(url: "https://choparpizza.uz/tashkent/delivery")
mcp__plugin_chrome-devtools-mcp_chrome-devtools__take_snapshot()

mcp__plugin_chrome-devtools-mcp_chrome-devtools__new_page(url: "http://localhost:5757/tashkent/delivery")
mcp__plugin_chrome-devtools-mcp_chrome-devtools__take_snapshot()
```

Compare:
- Heading "Доставка и оплата" совпадает
- Body content совпадает (если был snap'ed real HTML в Task 1)

- [ ] **Step 4: Snapshot privacy**

```
mcp__plugin_chrome-devtools-mcp_chrome-devtools__new_page(url: "https://choparpizza.uz/tashkent/privacy")
mcp__plugin_chrome-devtools-mcp_chrome-devtools__take_snapshot()

mcp__plugin_chrome-devtools-mcp_chrome-devtools__new_page(url: "http://localhost:5757/tashkent/privacy")
mcp__plugin_chrome-devtools-mcp_chrome-devtools__take_snapshot()
```

Compare body content.

- [ ] **Step 5: Console check (хотя бы 1 страница)**

```
mcp__plugin_chrome-devtools-mcp_chrome-devtools__list_console_messages(types: ["error"])
```

Expected: пусто или только known issues (favicon).

- [ ] **Step 6: Close pages, stop dev**

```
mcp__plugin_chrome-devtools-mcp_chrome-devtools__close_page(...)  # for each new page
```

```bash
kill $(cat /tmp/wave2b-dev2.pid) 2>/dev/null
sleep 2
```

---

## Final Verification

- [ ] **Step 1: File tree**

```bash
ls components_new/fran/FranApp.tsx components_new/delivery/DeliveryApp.tsx components_new/privacy/PrivacyApp.tsx
ls "app/[city]/about/fran/page.tsx" "app/[city]/delivery/page.tsx" "app/[city]/privacy/page.tsx"
git ls-files "pages/[city]/about/fran" "pages/[city]/delivery" "pages/[city]/privacy" 2>&1
```

Expected:
- All 3 view-components exist
- All 3 page.tsx exist
- `git ls-files` пусто для удалённых legacy

- [ ] **Step 2: TS clean**

```bash
bunx tsc --noEmit 2>&1 | grep -E "^(app/|i18n/|lib/data/|lib/posthog-app|proxy\.ts|components_new/(seo|about|fran|delivery|privacy|HeaderApp|FooterApp|header/(HeaderPhone|ChooseCity|Language|SignInButton)App))" | head -10
```

Expected: пустой вывод.

- [ ] **Step 3: Build OK**

```bash
rm -rf .next && bun run build > /tmp/wave2b-final.log 2>&1
echo "EXIT_CODE=$?"
grep -E "/\[city\]/(about|delivery|privacy)" /tmp/wave2b-final.log | tail -10
```

Expected:
- `EXIT_CODE=0`
- App Router section shows: `/[city]/about`, `/[city]/about/fran`, `/[city]/delivery`, `/[city]/privacy`
- Pages Router section больше не содержит этих routes

- [ ] **Step 4: Commits**

```bash
git log --oneline 597d08c6..HEAD
```

Expected: ~10 commits Wave 2B-lite (FranApp → fran/page → DeliveryApp → delivery/page → PrivacyApp → privacy/page → proxy update → 3 deletes).

- [ ] **Step 5: Branch clean**

```bash
git status
```

Expected: clean (или известные autogen tsconfig).

---

## Wave 2B-lite Done. Что осталось из статичных:

- **Wave 2B-Maps** — `/[city]/branch` (Yandex Maps + axios fetch terminals + ChooseCityDropDownApp) — отдельный план
- **Wave 2B-Form** — `/[city]/contacts` (react-hook-form + axios POST review + CSRF) — отдельный план

Затем — Wave 3+ (контент: news, sale, news/[id], sale/[id]).

---

## Self-Review Checklist

- [ ] Каждая Task имеет `Files:` секцию
- [ ] Каждый Step имеет либо exact код, либо exact команду
- [ ] **Никаких `useTranslations`/`getTranslations`** — только `useExtracted`/`getExtracted`
- [ ] FranApp, DeliveryApp, PrivacyApp — server components (нет `'use client'`)
- [ ] Все 3 page.tsx используют `generateMetadata` с canonical/hreflang
- [ ] Privacy page имеет `robots: { index: false }`
- [ ] proxy.ts matcher расширен для всех 3 новых routes
- [ ] Legacy pages удалены
- [ ] Build OK
- [ ] DevTools MCP подтверждает структура совпадает с прод (где snap'ed)
