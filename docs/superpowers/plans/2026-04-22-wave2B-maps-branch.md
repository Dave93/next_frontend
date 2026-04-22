# App Router Migration — Wave 2B-Maps: Branch Page (Yandex Maps)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Мигрировать `/[city]/branch` (страница филиалов с интерактивной картой Yandex Maps + список терминалов с фильтром). Это самая комплексная статичная страница из Wave 2B (Yandex Maps integration в App Router, axios fetch terminals на клиенте, SimpleBar для прокрутки списка, интеграция с уже существующим `ChooseCityDropDownApp` из Wave 2.5).

**Architecture:** `app/[city]/branch/page.tsx` — server component (Metadata + рендерит `<BranchApp />`). `BranchApp.tsx` — client component (`'use client'`) с `useUI()` для `activeCity`, axios fetch terminals при mount, state для `activeBranch`/`zoom`, рендерит `<BranchMap />` и список терминалов в `<SimpleBar />`. `BranchMap.tsx` — client component, обёрнутый в `dynamic({ ssr: false })` (Yandex Maps требует `window`, не работает в SSR). Замена `useRouter().locale` → `useLocale()` из `next-intl`, замена `ChooseCityDropDown` (legacy) → `ChooseCityDropDownApp` (Wave 2.5).

**Out of scope (отдельные waves):**
- `[city]/contacts` — react-hook-form + axios POST + CSRF → Wave 2B-Form
- `[city]/order/*`, `news/*`, `sale/*`, продуктовые — Waves 3+
- Header/Footer — already done in Wave 2.5

**Tech Stack:** Next.js 16.2.2, React 18, TypeScript 5.3.3, `next-intl@4.9.1` (`useExtracted` only — `useTranslations` forbidden), `react-yandex-maps@4.6.0`, `simplebar-react@2.3.6`, `axios@0.21.1`, Tailwind 2.

**Reference spec:** `docs/superpowers/specs/2026-04-22-app-router-migration-design.md`
**Reference plans:** Wave 1, Wave 2 (about), Wave 2.5 (header/footer), Wave 2B-lite (fran/delivery/privacy)

---

## File Structure

### Created

| Файл | Тип | Ответственность |
|---|---|---|
| `components_new/branch/BranchMap.tsx` | client | YMaps + Map + Placemark; принимает `branches`, `activeBranch`, `mapState` props |
| `components_new/branch/BranchApp.tsx` | client | `'use client'`: useUI, state, axios fetch terminals, dynamic import BranchMap (ssr:false), список через SimpleBar, ChooseCityDropDownApp |
| `app/[city]/branch/page.tsx` | server | Page + generateMetadata, рендерит `<BranchApp />` |

### Modified

| Файл | Изменение |
|---|---|
| `proxy.ts` | Добавить `/[city]/branch` в matcher для known city slugs |

### Deleted

| Файл | Причина |
|---|---|
| `pages/[city]/branch/index.tsx` | Заменено `app/[city]/branch/page.tsx` |

### Untouched

- `components_new/branch/Branch.tsx` (legacy, остаётся для backward compatibility — удаляется в Wave 6 cleanup)
- `components_new/header/ChooseCityDropDown.tsx` (legacy, остаётся для других legacy pages)

---

## Pre-flight

- [ ] **Step 1: Verify Wave 2B-lite done**

```bash
cd /Users/macbookpro/development/next_frontend
git branch --show-current  # = migration/app-router
ls "app/[city]/about/fran/page.tsx" "app/[city]/delivery/page.tsx" "app/[city]/privacy/page.tsx"
git log --oneline -3
```

Expected: ветка `migration/app-router`; все 3 page.tsx Wave 2B-lite present; последний commit ~ `a4acb123` (fix(proxy): use literal matcher) или newer.

- [ ] **Step 2: Baseline build OK**

```bash
rm -rf .next && bun run build > /tmp/wave2bmaps-baseline.log 2>&1 && echo "OK" || (echo "FAIL"; tail -30 /tmp/wave2bmaps-baseline.log)
```

Expected: `OK`.

- [ ] **Step 3: Verify ChooseCityDropDownApp existence (Wave 2.5)**

```bash
ls components_new/header/ChooseCityDropDownApp.tsx
```

Expected: file exists.

---

## Task 1: components_new/branch/BranchMap.tsx (Yandex Maps client)

**File:** Create `components_new/branch/BranchMap.tsx`

Component, который рендерит только саму карту с Placemarks. Изолирован — будет dynamic-imported в BranchApp с `ssr: false`.

- [ ] **Step 1: Создать файл**

Write `components_new/branch/BranchMap.tsx`:

```typescript
'use client'

import { YMaps, Map, Placemark } from 'react-yandex-maps'

type Branch = {
  id: number | string
  location?: { lat: number; lon: number } | null
  [key: string]: unknown
}

type Props = {
  branches: Branch[]
  mapState: {
    center: [number, number]
    zoom: number
  }
}

export default function BranchMap({ branches, mapState }: Props) {
  return (
    <YMaps>
      <Map state={mapState} width="100%" height={500}>
        {branches.map((branch) =>
          branch.location ? (
            <Placemark
              key={branch.id}
              geometry={[branch.location.lat, branch.location.lon]}
              options={{
                iconLayout: 'default#image',
                iconImageHref: '/map_placemark.png',
                iconImageSize: [50, 55],
              }}
            />
          ) : null
        )}
      </Map>
    </YMaps>
  )
}
```

- [ ] **Step 2: Verify TS**

```bash
bunx tsc --noEmit 2>&1 | grep -E "^components_new/branch/BranchMap" | head -5
```

Expected: empty. Note: `react-yandex-maps` types may complain about width string vs number — if so, the original code passed `width={'100%'}` so this is the documented pattern. If TS strict mode rejects, cast: `width={'100%' as any}` or refer to typedef.

- [ ] **Step 3: Commit**

```bash
git add components_new/branch/BranchMap.tsx
git commit -m "feat(branch): add BranchMap client component (YMaps + Placemarks)"
```

---

## Task 2: components_new/branch/BranchApp.tsx (main branch UI)

**File:** Create `components_new/branch/BranchApp.tsx`

Client component с full branch UX: city dropdown (left/right side), map, scrollable list. Migration of legacy `Branch.tsx` (110 lines) to App Router primitives.

**Изменения vs legacy `Branch.tsx`:**
- `useRouter().locale` → `useLocale()` from `next-intl`
- `ChooseCityDropDown` (legacy) → `ChooseCityDropDownApp` (Wave 2.5)
- `import { YMaps, Map, Placemark }` direct → dynamic import BranchMap with `ssr: false`
- Удалить `console.log` строки (legacy debug)

- [ ] **Step 1: Создать файл**

Write `components_new/branch/BranchApp.tsx`:

```typescript
'use client'

import axios from 'axios'
import { useEffect, useMemo, useState, FC } from 'react'
import dynamic from 'next/dynamic'
import { useUI } from '@components/ui/context'
import { useLocale } from 'next-intl'
import SimpleBar from 'simplebar-react'
import 'simplebar/dist/simplebar.min.css'
import ChooseCityDropDownApp from '../header/ChooseCityDropDownApp'

const webAddress = process.env.NEXT_PUBLIC_API_URL

const BranchMap = dynamic(() => import('./BranchMap'), {
  ssr: false,
  loading: () => (
    <div
      style={{ width: '100%', height: 500 }}
      className="bg-gray-100 flex items-center justify-center"
    >
      Загрузка карты...
    </div>
  ),
})

type Branch = {
  id: number | string
  name?: string
  name_uz?: string
  name_en?: string
  desc?: string
  desc_uz?: string
  desc_en?: string
  location?: { lat: number; lon: number } | null
  [key: string]: unknown
}

const BranchApp: FC = () => {
  const locale = useLocale()
  const { activeCity } = useUI()
  const [zoom] = useState(11)
  const [branches, setBranches] = useState<Branch[]>([])
  const [activeBranch, setActiveBranch] = useState<Branch | null>(null)

  const mapState = useMemo(() => {
    return {
      center: activeBranch?.location
        ? ([activeBranch.location.lat, activeBranch.location.lon] as [
            number,
            number,
          ])
        : ([
            Number(activeCity?.lat) || 41.2995,
            Number(activeCity?.lon) || 69.2401,
          ] as [number, number]),
      zoom: activeBranch ? 17 : zoom,
    }
  }, [activeBranch, activeCity, zoom])

  useEffect(() => {
    if (!activeCity?.id) return
    let cancelled = false
    const fetchBranches = async () => {
      try {
        const { data } = await axios.get(
          `${webAddress}/api/terminals/pickup?city_id=${activeCity.id}`
        )
        if (!cancelled) setBranches(data.data || [])
      } catch {
        if (!cancelled) setBranches([])
      }
    }
    fetchBranches()
    return () => {
      cancelled = true
    }
  }, [activeCity])

  const localizedName = (b: Branch) => {
    if (locale === 'uz') return b.name_uz
    if (locale === 'en') return b.name_en
    return b.name
  }
  const localizedDesc = (b: Branch) => {
    if (locale === 'uz') return b.desc_uz
    if (locale === 'en') return b.desc_en
    return b.desc
  }

  return (
    <div className="flex md:flex-row flex-col justify-between pt-10 gap-10">
      <div className="md:flex-[4] md:mb-0 mb-10">
        <BranchMap branches={branches} mapState={mapState} />
      </div>
      <div className="md:flex-[2] space-y-2 mb-4 md:mb-0 px-4">
        <ChooseCityDropDownApp />
        <SimpleBar style={{ maxHeight: 500 }}>
          <div className="space-y-2 overflow-y-auto">
            {branches.map((branch) => (
              <div
                className={`border-1 border rounded-md p-4 cursor-pointer ${
                  activeBranch != null && activeBranch.id === branch.id
                    ? 'bg-primary text-white'
                    : 'hover:bg-primary hover:text-white'
                }`}
                key={branch.id}
                onClick={() => {
                  if (activeBranch != null && activeBranch.id === branch.id) {
                    setActiveBranch(null)
                  } else {
                    setActiveBranch(branch)
                  }
                }}
              >
                <div className="text-xl font-bold">{localizedName(branch)}</div>
                <div className="whitespace-pre-line">
                  {localizedDesc(branch)}
                </div>
              </div>
            ))}
          </div>
        </SimpleBar>
      </div>
    </div>
  )
}

export default BranchApp
```

> **Note vs legacy `Branch.tsx`:**
> - `whitespace-pre-line` добавлен в desc div чтобы preserve `\n` from API (e.g. `Адрес: ...\nОриентир: ...\nРежим работы: ...`).
> - `Number(activeCity?.lat) || 41.2995` defensive — `activeCity.lat` приходит как string из API, нужно конвертировать.
> - `axios` request убран `console.log` debug.
> - `useUI().activeCity` может быть undefined первый рендер до того как LayoutWrapper sync'нул — useEffect skips fetch если no id.

- [ ] **Step 2: Verify TS**

```bash
bunx tsc --noEmit 2>&1 | grep -E "^components_new/branch/BranchApp" | head -10
```

Expected: empty.

- [ ] **Step 3: Commit**

```bash
git add components_new/branch/BranchApp.tsx
git commit -m "feat(branch): add BranchApp client (axios fetch + dynamic Map + SimpleBar list)"
```

---

## Task 3: app/[city]/branch/page.tsx

**File:** Create `app/[city]/branch/page.tsx`

`mkdir -p app/[city]/branch` first.

- [ ] **Step 1: Создать файл**

Write `app/[city]/branch/page.tsx`:

```typescript
import type { Metadata } from 'next'
import BranchApp from '../../../components_new/branch/BranchApp'

type Params = { city: string }

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { city } = await params
  const base = 'https://choparpizza.uz'
  return {
    title: 'Наши филиалы Chopar Pizza',
    description: 'Адреса пиццерий Chopar Pizza с режимом работы и картой',
    alternates: {
      canonical: `${base}/${city}/branch`,
      languages: {
        ru: `${base}/${city}/branch`,
        uz: `${base}/uz/${city}/branch`,
        en: `${base}/en/${city}/branch`,
      },
    },
  }
}

export default function BranchPage() {
  return <BranchApp />
}
```

- [ ] **Step 2: Verify TS**

```bash
bunx tsc --noEmit 2>&1 | grep -E "^app/\[city\]/branch" | head -5
```

Expected: empty.

- [ ] **Step 3: Commit**

```bash
git add "app/[city]/branch/page.tsx"
git commit -m "feat(app): add /[city]/branch page (server, generateMetadata)"
```

---

## Task 4: Update proxy.ts matcher

**File:** Modify `proxy.ts`

Добавить `/[city]/branch` для всех known city slugs. Помнить: literal strings only (no template expressions, см. Wave 2B-lite Task 9 lesson).

- [ ] **Step 1: Read current proxy.ts**

```bash
cat proxy.ts
```

- [ ] **Step 2: Update matcher (add branch pattern)**

В существующий `config.matcher` array добавить **5-ю запись** перед закрывающей скобкой:

```typescript
'/(tashkent|samarkand|bukhara|namangan|fergana|andijan|qarshi|nukus|urgench|jizzakh|gulistan|termez|chirchiq|navoi)/branch',
```

Полный финальный `proxy.ts`:

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
  // Wave 2B-Maps: + /[city]/branch
  // Waves далее добавят остальные routes (контент, каталог, personal).
  return intlProxy(request)
}

// Matcher должен быть literal — Next.js парсит его статически,
// template literals с expressions не поддерживаются.
// Cities: tashkent, samarkand, bukhara, namangan, fergana, andijan, qarshi,
// nukus, urgench, jizzakh, gulistan, termez, chirchiq, navoi
export const config = {
  matcher: [
    '/(tashkent|samarkand|bukhara|namangan|fergana|andijan|qarshi|nukus|urgench|jizzakh|gulistan|termez|chirchiq|navoi)/about',
    '/(tashkent|samarkand|bukhara|namangan|fergana|andijan|qarshi|nukus|urgench|jizzakh|gulistan|termez|chirchiq|navoi)/about/fran',
    '/(tashkent|samarkand|bukhara|namangan|fergana|andijan|qarshi|nukus|urgench|jizzakh|gulistan|termez|chirchiq|navoi)/delivery',
    '/(tashkent|samarkand|bukhara|namangan|fergana|andijan|qarshi|nukus|urgench|jizzakh|gulistan|termez|chirchiq|navoi)/privacy',
    '/(tashkent|samarkand|bukhara|namangan|fergana|andijan|qarshi|nukus|urgench|jizzakh|gulistan|termez|chirchiq|navoi)/branch',
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
git commit -m "feat(app): expand proxy matcher — /[city]/branch route"
```

---

## Task 5: Удалить legacy pages/[city]/branch/index.tsx

**File:** Delete `pages/[city]/branch/index.tsx`

- [ ] **Step 1: Удалить файл**

```bash
git rm "pages/[city]/branch/index.tsx"
```

- [ ] **Step 2: Verify build OK**

```bash
rm -rf .next && bun run build > /tmp/wave2bmaps-task5.log 2>&1 && echo "BUILD OK" || (echo "BUILD FAIL"; tail -50 /tmp/wave2bmaps-task5.log)
```

Expected: `BUILD OK`. Если FAIL — STOP, report BLOCKED.

- [ ] **Step 3: Commit**

```bash
git commit -m "feat(app): remove legacy pages/[city]/branch/index.tsx"
```

---

## Task 6: Verify dev runtime

**Files:** none

- [ ] **Step 1: Запустить dev**

```bash
lsof -i :5757 2>&1 | head -3 || echo "5757 free"
bunx next dev --webpack -p 5757 > /tmp/wave2bmaps-dev.log 2>&1 &
echo $! > /tmp/wave2bmaps-dev.pid
sleep 25
tail -10 /tmp/wave2bmaps-dev.log
```

Expected: `Ready in <X>ms` без fatal errors.

- [ ] **Step 2: Curl /tashkent/branch**

```bash
curl -s -o /tmp/curl-branch.html -w "HTTP %{http_code}\n" http://localhost:5757/tashkent/branch
echo "=== Title ==="
grep -oE "<title>[^<]*</title>" /tmp/curl-branch.html | head -1
echo "=== Header/Footer ==="
grep -ocE "main_logo|footer_logo" /tmp/curl-branch.html
echo "=== ChooseCity dropdown / Loading map placeholder ==="
grep -ocE "Загрузка карты|Ташкент" /tmp/curl-branch.html
```

Expected:
- HTTP 200
- Title "Наши филиалы Chopar Pizza | Chopar Pizza"
- Header/Footer markers > 0
- "Загрузка карты" присутствует в SSR HTML (loading state для dynamic Map) ИЛИ "Ташкент" (city dropdown)

> Note: SSR HTML НЕ содержит сами Placemark'и (карта рендерится только на клиенте). Это ОК — branches тоже грузятся client-side через axios (legacy approach).

- [ ] **Step 3: Verify Pages Router /tashkent (главная) всё ещё работает**

```bash
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:5757/tashkent
```

Expected: HTTP 200.

- [ ] **Step 4: Stop dev**

```bash
kill $(cat /tmp/wave2bmaps-dev.pid) 2>/dev/null
sleep 2
```

---

## Task 7: Production build smoke

**Files:** none

- [ ] **Step 1: Clean build**

```bash
rm -rf .next && bun run build > /tmp/wave2bmaps-prod.log 2>&1
echo "EXIT_CODE=$?"
grep -E "/\[city\]/branch" /tmp/wave2bmaps-prod.log | tail -5
tail -10 /tmp/wave2bmaps-prod.log
```

Expected: `EXIT_CODE=0`, `/[city]/branch` в App Router section route summary.

---

## Task 8: DevTools MCP visual diff

**Files:** none

- [ ] **Step 1: Запустить dev**

```bash
bunx next dev --webpack -p 5757 > /tmp/wave2bmaps-dev2.log 2>&1 &
echo $! > /tmp/wave2bmaps-dev2.pid
sleep 25
```

- [ ] **Step 2: Open prod + local через DevTools MCP**

```
mcp__plugin_chrome-devtools-mcp_chrome-devtools__new_page(url: "https://choparpizza.uz/tashkent/branch")
mcp__plugin_chrome-devtools-mcp_chrome-devtools__new_page(url: "http://localhost:5757/tashkent/branch")
```

- [ ] **Step 3: Verify branches list rendered (через evaluate_script на localhost)**

```
mcp__plugin_chrome-devtools-mcp_chrome-devtools__evaluate_script(function: `
() => {
  return {
    title: document.title,
    branchCount: document.querySelectorAll('main .border-1.border').length,
    firstBranchTitle: document.querySelector('main .border-1.border .text-xl')?.textContent?.trim(),
    hasMapContainer: !!document.querySelector('ymaps') || !!document.querySelector('[class*="ymaps"]'),
    hasHeader: !!document.querySelector('header'),
    hasFooter: !!document.querySelector('footer'),
  }
}`)
```

Expected:
- `title`: "Наши филиалы Chopar Pizza | Chopar Pizza"
- `branchCount`: ~15 (для Tashkent city_id=7)
- `firstBranchTitle`: "Парус" (first terminal в API)
- `hasMapContainer`: true (карта инициализирована после ssr:false dynamic load)
- `hasHeader/Footer`: true

- [ ] **Step 4: Verify localized name change при клике на city dropdown** (опционально, manual)

В DevTools MCP click на city dropdown → выбрать другой город → URL меняется → branches refetch.

- [ ] **Step 5: Console check**

```
mcp__plugin_chrome-devtools-mcp_chrome-devtools__list_console_messages(types: ["error"])
```

Expected: только known issues (favicon 404). Если есть errors про Yandex Maps — note as known issue.

- [ ] **Step 6: Close pages, stop dev**

```
mcp__plugin_chrome-devtools-mcp_chrome-devtools__close_page(...)
```

```bash
kill $(cat /tmp/wave2bmaps-dev2.pid) 2>/dev/null
sleep 2
```

---

## Final Verification

- [ ] **Step 1: File tree**

```bash
ls components_new/branch/BranchApp.tsx components_new/branch/BranchMap.tsx "app/[city]/branch/page.tsx"
git ls-files "pages/[city]/branch" 2>&1
```

Expected:
- All 3 new files exist
- `git ls-files` empty (legacy deleted)

- [ ] **Step 2: TS clean for our code**

```bash
bunx tsc --noEmit 2>&1 | grep -E "^(app/|i18n/|lib/data/|lib/posthog-app|proxy\.ts|components_new/(seo|about|fran|delivery|privacy|branch|HeaderApp|FooterApp|header/(HeaderPhone|ChooseCity|Language|SignInButton)App))" | head -10
```

Expected: пустой вывод.

- [ ] **Step 3: Build OK**

```bash
rm -rf .next && bun run build > /tmp/wave2bmaps-final.log 2>&1
echo "EXIT_CODE=$?"
```

Expected: `EXIT_CODE=0`.

- [ ] **Step 4: Wave 2B-Maps commits**

```bash
git log --oneline a4acb123..HEAD
```

Expected: ~6 commits (BranchMap → BranchApp → branch/page → proxy update → delete legacy).

- [ ] **Step 5: Branch clean**

```bash
git status
```

Expected: clean.

---

## Wave 2B-Maps Done. Что осталось:

- **Wave 2B-Form** — `/[city]/contacts` (react-hook-form + axios POST review + CSRF)
- **Wave 3+** — контент (news, sale), каталог, personal, etc.

---

## Self-Review Checklist

- [ ] Каждая Task имеет `Files:` секцию
- [ ] Каждый Step имеет либо exact код, либо exact команду
- [ ] **Никаких `useTranslations`/`getTranslations`** — `BranchApp` не использует переводы (только локализованные `name_*`/`desc_*` поля из API)
- [ ] BranchMap обёрнут в `dynamic({ ssr: false })` (Yandex Maps требует window)
- [ ] BranchApp использует `ChooseCityDropDownApp` (Wave 2.5), НЕ legacy `ChooseCityDropDown`
- [ ] `useLocale` from `next-intl`, не `useRouter().locale`
- [ ] axios fetch wrapped в cancelable useEffect
- [ ] `proxy.ts` matcher — literal strings, не template expressions
- [ ] Build OK после удаления legacy
- [ ] DevTools MCP подтверждает 15 branches + map container
