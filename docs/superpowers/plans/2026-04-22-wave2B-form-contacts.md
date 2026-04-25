# App Router Migration — Wave 2B-Form: Contacts Page (Form + CSRF)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Мигрировать `/[city]/contacts` (контакты + форма "Оставьте отзыв"). Это последняя статичная страница с интерактивом — react-hook-form + axios POST + CSRF token flow + display workTime/phone/jobs link.

**Architecture:** `app/[city]/contacts/page.tsx` — server (Metadata + fetch publicConfig + getLocale; передаёт workTime в ContactsApp как prop). `ContactsApp.tsx` — client component (`'use client'`) с react-hook-form, useExtracted для labels, useUI для prefill user data, axios POST `/api/reviews` с CSRF token (получаемым с `/api/keldi` если cookie X-XSRF-TOKEN отсутствует).

**Out of scope:** Wave 3+ (контент, каталог, personal). После Wave 2B-Form — все статичные страницы под `[city]/...` мигрированы.

**Tech Stack:** Next.js 16.2.2, React 18, TypeScript 5.3.3, `next-intl@4.9.1` (`useExtracted` only — `useTranslations` forbidden), `react-hook-form@7.x`, `react-phone-number-input`, `axios@0.21.1`, `js-cookie`, `@heroicons/react`, Tailwind 2.

**Reference spec:** `docs/superpowers/specs/2026-04-22-app-router-migration-design.md`
**Reference plans:** Wave 1, Wave 2 (about), Wave 2.5 (header/footer), Wave 2B-lite (fran/delivery/privacy), Wave 2B-Maps (branch)

---

## File Structure

### Created

| Файл | Тип | Ответственность |
|---|---|---|
| `components_new/contacts/ContactsApp.tsx` | client | Form (react-hook-form), useExtracted labels, axios POST review, CSRF flow, useUI for user defaults; принимает `workTime` prop |
| `app/[city]/contacts/page.tsx` | server | Page + generateMetadata + fetchPublicConfig + getLocale, рендерит `<ContactsApp workTime={...} />` |

### Modified

| Файл | Изменение |
|---|---|
| `proxy.ts` | Добавить `/[city]/contacts` в matcher для known city slugs |

### Deleted

| Файл | Причина |
|---|---|
| `pages/[city]/contacts/index.tsx` | Заменено `app/[city]/contacts/page.tsx` |

### Untouched

- `components_new/contacts/Contacts.tsx` (legacy, удаляется в Wave 6 cleanup)

---

## Pre-flight

- [ ] **Step 1: Verify Wave 2B-Maps done**

```bash
cd /Users/macbookpro/development/next_frontend
git branch --show-current  # = migration/app-router
ls "app/[city]/branch/page.tsx" components_new/branch/BranchApp.tsx
git log --oneline -3
```

Expected: ветка `migration/app-router`; branch page существует; последний commit ~ `ff0b48a8` или newer.

- [ ] **Step 2: Baseline build OK**

```bash
rm -rf .next && bun run build > /tmp/wave2bform-baseline.log 2>&1 && echo "OK" || (echo "FAIL"; tail -30 /tmp/wave2bform-baseline.log)
```

Expected: `OK`.

---

## Task 1: components_new/contacts/ContactsApp.tsx

**File:** Create `components_new/contacts/ContactsApp.tsx`

Полная миграция legacy `Contacts.tsx` (348 строк) на App Router primitives.

**Изменения vs legacy:**
- `useTranslation('common').t('key')` → `useExtracted()('Inline RU text')` для labels:
  - `tr('contacts')` → `t('Контакты')`
  - `tr('your_review')` → `t('Оставьте свой отзыв')`
  - `tr('name')` → `t('Имя')`
  - `tr('phone_number')` → `t('Номер телефона')`
  - `tr('email')` → `t('Эл. почта')`
  - `tr('order_number')` → `t('Номер заказа')`
  - `tr('review')` → `t('Отзыв')`
  - `tr('required')` → `t('Обязательное поле')`
  - `tr('send')` → `t('Отправить')`
  - `tr('review_add_success')` → `t('Отзыв успешно отправлен')`
  - `tr('work_time')` → `t('График работы')`
  - `tr('get_a_job')` → `t('Устроиться на работу')`
- `useRouter().locale` → `useLocale()` from `next-intl`
- `configData` (client-side fetch с sessionStorage) удалён — `workTime` приходит через props
- Удалить избыточные legacy `next-translate` imports

- [ ] **Step 1: Создать файл**

`mkdir -p components_new/contacts` (директория уже есть от legacy Contacts.tsx).

Write `components_new/contacts/ContactsApp.tsx`:

```typescript
'use client'

import { FC, memo, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { XIcon } from '@heroicons/react/outline'
import Input from 'react-phone-number-input/input'
import { useUI } from '@components/ui/context'
import { useExtracted } from 'next-intl'
import Cookies from 'js-cookie'
import axios from 'axios'

const webAddress = process.env.NEXT_PUBLIC_API_URL
axios.defaults.withCredentials = true

const errorTexts: Record<string, string> = {
  name_field_is_required:
    'Мы Вас не нашли в нашей системе. Просьба указать своё имя.',
  opt_code_is_incorrect: 'Введённый код неверный или срок кода истёк',
}

type FormData = {
  name: string
  phone: string
  email: string
  order_id: string
  text: string
}

type Props = {
  workTime?: string
}

const ContactsApp: FC<Props> = ({ workTime }) => {
  const t = useExtracted()
  const { user } = useUI()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    watch,
    getValues,
    control,
    formState: { errors },
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      name: user?.user?.name || '',
      phone: user?.user?.phone || '',
      email: '',
      order_id: '',
      text: '',
    },
  })
  const name = watch('name')
  const phone = watch('phone')
  const email = watch('email')
  const order_id = watch('order_id')
  const text = watch('text')

  const setCredentials = async () => {
    let csrf = Cookies.get('X-XSRF-TOKEN')
    if (!csrf) {
      const csrfReq = await axios(`${webAddress}/api/keldi`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          crossDomain: true,
        } as any,
        withCredentials: true,
      })
      const { data: res } = csrfReq
      csrf = Buffer.from(res.result, 'base64').toString('ascii')
      const inTenMinutes = new Date(new Date().getTime() + 10 * 60 * 1000)
      Cookies.set('X-XSRF-TOKEN', csrf, { expires: inTenMinutes })
    }
    axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrf
    axios.defaults.headers.common['XCSRF-TOKEN'] = csrf
  }

  const onSubmit = async () => {
    setIsSubmitting(true)
    setSuccessMessage('')
    try {
      await setCredentials()
      const { data: reviewData } = await axios.post(
        `${webAddress}/api/reviews`,
        { ...getValues() }
      )
      if (reviewData.success) {
        reset()
        setSuccessMessage(t('Отзыв успешно отправлен'))
      }
    } catch (e) {
      // swallow — error toasts handled by legacy stack; Wave 7 may add formal handling
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetField = (fieldName: keyof FormData) => {
    const newFields: any = { ...getValues() }
    newFields[fieldName] = null
    reset(newFields)
  }

  return (
    <div className="mx-5 md:mx-0">
      <div>
        <div className="text-3xl mb-1">{t('Контакты')}</div>
        <div className="border-b-2 w-24 border-yellow mb-10"></div>
      </div>
      <div className="md:grid grid-cols-2 gap-24 mb-16">
        <div>
          <div className="w-60">
            <div className="flex justify-between">
              <a href="tel:+998712051111">+998 (71) 205-11-11</a>
            </div>
          </div>
          <div className="mt-3">
            {t('График работы')}
            {': '}
            {workTime}
            <div className="mt-2 text-white">
              <a
                href="https://t.me/Chopar_jbot"
                className="bg-yellow rounded-full p-2"
              >
                {t('Устроиться на работу')}
              </a>
            </div>
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="border border-gray-400 rounded-2xl p-8 md:w-[724px] md:mb-96 mb-8">
          <div className="text-2xl mb-7">{t('Оставьте свой отзыв')}</div>
          <div className="md:flex justify-between">
            <div className="md:w-80">
              <label className="text-sm text-gray-400">{t('Имя')}</label>
              <div className="flex items-center justify-end">
                <input
                  type="text"
                  {...register('name', { required: true })}
                  className="bg-gray-100 px-8 py-2 rounded-full outline-none focus:outline-none w-full"
                />
                {name && (
                  <button
                    type="button"
                    className="absolute focus:outline-none outline-none text-gray-400 mr-4"
                    onClick={() => resetField('name')}
                  >
                    <XIcon className="cursor-pointer h-5 text-gray-400 w-5" />
                  </button>
                )}
              </div>
              {errors.name && (
                <div className="text-sm text-center text-red-600">
                  {t('Обязательное поле')}
                </div>
              )}
            </div>
            <div className="md:w-80">
              <label className="text-sm text-gray-400">
                {t('Номер телефона')}
              </label>
              <div className="flex items-center justify-end">
                <Controller
                  render={({ field: { onChange, value } }) => (
                    <Input
                      defaultCountry="UZ"
                      country="UZ"
                      international
                      withCountryCallingCode
                      value={value}
                      className="bg-gray-100 px-8 py-2 rounded-full outline-none focus:outline-none w-full"
                      onChange={(e: any) => onChange(e)}
                    />
                  )}
                  rules={{ required: true }}
                  key="phone"
                  name="phone"
                  control={control}
                />
                {phone && (
                  <button
                    type="button"
                    className="absolute focus:outline-none outline-none text-gray-400 mr-4"
                    onClick={() => resetField('phone')}
                  >
                    <XIcon className="cursor-pointer h-5 text-gray-400 w-5" />
                  </button>
                )}
              </div>
              {errors.phone && (
                <div className="text-sm text-center text-red-600">
                  {t('Обязательное поле')}
                </div>
              )}
            </div>
          </div>
          <div className="md:flex md:mt-7 justify-between">
            <div className="md:w-80">
              <label className="text-sm text-gray-400">{t('Эл. почта')}</label>
              <div className="flex items-center justify-end">
                <input
                  type="text"
                  {...register('email')}
                  className="bg-gray-100 px-8 py-2 rounded-full outline-none focus:outline-none w-full"
                />
                {email && (
                  <button
                    type="button"
                    className="absolute focus:outline-none outline-none text-gray-400 mr-4"
                    onClick={() => resetField('email')}
                  >
                    <XIcon className="cursor-pointer h-5 text-gray-400 w-5" />
                  </button>
                )}
              </div>
            </div>
            <div className="md:w-80">
              <label className="text-sm text-gray-400">
                {t('Номер заказа')}
              </label>
              <div className="md:flex items-center justify-end">
                <input
                  type="text"
                  {...register('order_id')}
                  className="bg-gray-100 px-8 py-2 rounded-full outline-none focus:outline-none w-full"
                />
                {order_id && (
                  <button
                    type="button"
                    className="absolute focus:outline-none outline-none text-gray-400 mr-4"
                    onClick={() => resetField('order_id')}
                  >
                    <XIcon className="cursor-pointer h-5 text-gray-400 w-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="md:mt-7">
            <label className="text-sm text-gray-400">{t('Отзыв')}</label>
            <div className="flex items-center justify-end">
              <textarea
                {...register('text', { required: true })}
                rows={5}
                className="bg-gray-100 px-8 py-2 rounded-lg outline-none focus:outline-none w-full"
              />
              {text && (
                <button
                  type="button"
                  className="absolute focus:outline-none outline-none text-gray-400 mr-4"
                  onClick={() => resetField('text')}
                >
                  <XIcon className="cursor-pointer h-5 text-gray-400 w-5" />
                </button>
              )}
            </div>
            {errors.text && (
              <div className="text-sm text-center text-red-600">
                {t('Обязательное поле')}
              </div>
            )}
          </div>
          {successMessage && (
            <div
              className="bg-teal-100 border-t-4 border-teal-500 rounded-b mt-4 text-teal-900 px-4 py-3 shadow-md"
              role="alert"
            >
              <div className="flex">
                <div className="py-1">
                  <svg
                    className="fill-current h-6 w-6 text-teal-500 mr-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold">{successMessage}</p>
                </div>
              </div>
            </div>
          )}
          <div className="ml-auto md:w-80">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-yellow rounded-full flex items-center md:w-80 w-full justify-evenly py-2 mt-10 text-white"
            >
              {isSubmitting ? (
                <svg
                  className="animate-spin h-5 mx-auto text-center text-white w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <>{t('Отправить')}</>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default memo(ContactsApp)
```

> **Critical:** Only `useExtracted` from `next-intl`. NEVER `useTranslations`. NEVER `useRouter().locale` — `useLocale()` if needed (but ContactsApp doesn't actually need locale anymore — workTime comes pre-localized via prop).

> **Note on `errorTexts`:** Sохранил unused legacy const как ссылка для будущего mapping ошибок API → UI. Если subagent захочет удалить как unused — оставить с `// eslint-disable-next-line` или просто удалить (текущая onSubmit ловит все ошибки в catch без mapping). YAGNI: удалить если TS ругается.

- [ ] **Step 2: Verify TS**

```bash
bunx tsc --noEmit 2>&1 | grep -E "^components_new/contacts/ContactsApp" | head -10
```

Expected: empty. If `errorTexts` flagged as unused — remove it from the file.

- [ ] **Step 3: Commit**

```bash
git add components_new/contacts/ContactsApp.tsx
git commit -m "feat(contacts): add ContactsApp client (react-hook-form + axios POST + CSRF, useExtracted)"
```

---

## Task 2: app/[city]/contacts/page.tsx

**File:** Create `app/[city]/contacts/page.tsx`

`mkdir -p app/[city]/contacts` first.

Server component: fetchPublicConfig для workTime (per locale), getLocale, передаёт в ContactsApp.

- [ ] **Step 1: Создать файл**

Write `app/[city]/contacts/page.tsx`:

```typescript
import type { Metadata } from 'next'
import { getLocale } from 'next-intl/server'
import { fetchPublicConfig } from '../../../lib/data/configs'
import ContactsApp from '../../../components_new/contacts/ContactsApp'

type Params = { city: string }

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { city } = await params
  const base = 'https://choparpizza.uz'
  return {
    title: 'Наши контакты',
    description: 'Контакты и график работы Chopar Pizza',
    alternates: {
      canonical: `${base}/${city}/contacts`,
      languages: {
        ru: `${base}/${city}/contacts`,
        uz: `${base}/uz/${city}/contacts`,
        en: `${base}/en/${city}/contacts`,
      },
    },
  }
}

export default async function ContactsPage() {
  const [config, locale] = await Promise.all([
    fetchPublicConfig().catch(
      () => ({}) as Awaited<ReturnType<typeof fetchPublicConfig>>
    ),
    getLocale(),
  ])

  const workTime =
    locale === 'uz'
      ? config.workTimeUz
      : locale === 'en'
        ? config.workTimeEn
        : config.workTimeRu

  return <ContactsApp workTime={workTime} />
}
```

- [ ] **Step 2: Verify TS**

```bash
bunx tsc --noEmit 2>&1 | grep -E "^app/\[city\]/contacts" | head -5
```

Expected: empty.

- [ ] **Step 3: Commit**

```bash
git add "app/[city]/contacts/page.tsx"
git commit -m "feat(app): add /[city]/contacts page (server, fetchPublicConfig + getLocale)"
```

---

## Task 3: Update proxy.ts matcher

**File:** Modify `proxy.ts`

Add `/[city]/contacts` literal pattern (template expressions not supported, см. Wave 2B-lite Task 9 lesson).

- [ ] **Step 1: Read current proxy.ts**

```bash
cat proxy.ts
```

- [ ] **Step 2: Add /[city]/contacts entry**

В существующий `config.matcher` array добавить новую строку (literal):

```typescript
'/(tashkent|samarkand|bukhara|namangan|fergana|andijan|qarshi|nukus|urgench|jizzakh|gulistan|termez|chirchiq|navoi)/contacts',
```

Также обновить comment:

```typescript
  // Wave 2B-Form: + /[city]/contacts
```

Полный финальный proxy.ts:

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
  // Wave 2B-Form: + /[city]/contacts
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
    '/(tashkent|samarkand|bukhara|namangan|fergana|andijan|qarshi|nukus|urgench|jizzakh|gulistan|termez|chirchiq|navoi)/contacts',
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
git commit -m "feat(app): expand proxy matcher — /[city]/contacts route"
```

---

## Task 4: Удалить legacy pages/[city]/contacts/index.tsx

**File:** Delete `pages/[city]/contacts/index.tsx`

- [ ] **Step 1: Удалить файл**

```bash
git rm "pages/[city]/contacts/index.tsx"
```

- [ ] **Step 2: Verify build OK**

```bash
rm -rf .next/* 2>/dev/null; rm -rf .next; bun run build > /tmp/wave2bform-task4.log 2>&1 && echo "BUILD OK" || (echo "BUILD FAIL"; tail -50 /tmp/wave2bform-task4.log)
```

Expected: `BUILD OK`. Если FAIL — STOP, report BLOCKED.

- [ ] **Step 3: Commit**

```bash
git commit -m "feat(app): remove legacy pages/[city]/contacts/index.tsx"
```

---

## Task 5: Verify dev runtime

**Files:** none

- [ ] **Step 1: Запустить dev**

```bash
lsof -i :5757 2>&1 | head -3 || echo "5757 free"
bunx next dev --webpack -p 5757 > /tmp/wave2bform-dev.log 2>&1 &
echo $! > /tmp/wave2bform-dev.pid
sleep 25
tail -10 /tmp/wave2bform-dev.log
```

Expected: `Ready in <X>ms`.

- [ ] **Step 2: Curl /tashkent/contacts**

```bash
curl -s -o /tmp/curl-contacts.html -w "HTTP %{http_code}\n" http://localhost:5757/tashkent/contacts
echo "Title: $(grep -oE '<title>[^<]*</title>' /tmp/curl-contacts.html | head -1)"
echo "Header/Footer: $(grep -ocE 'main_logo|footer_logo' /tmp/curl-contacts.html)"
echo "Form labels: $(grep -ocE 'Контакты|Оставьте свой отзыв|Имя|Номер телефона|Эл\. почта|Отправить' /tmp/curl-contacts.html)"
echo "Phone: $(grep -ocE '\+998 \(71\) 205-11-11|tel:\+998712051111' /tmp/curl-contacts.html)"
echo "Jobs link: $(grep -ocE 'Устроиться на работу|Chopar_jbot' /tmp/curl-contacts.html)"
```

Expected:
- HTTP 200
- Title "Наши контакты | Chopar Pizza"
- Header/Footer markers > 0
- Form labels markers > 5
- Phone marker > 0
- Jobs link marker > 0

- [ ] **Step 3: Pages Router /tashkent live**

```bash
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:5757/tashkent
```

Expected: HTTP 200.

- [ ] **Step 4: Stop dev**

```bash
kill $(cat /tmp/wave2bform-dev.pid) 2>/dev/null
sleep 2
```

---

## Task 6: Production build smoke

**Files:** none

- [ ] **Step 1: Clean build**

```bash
rm -rf .next/* 2>/dev/null; rm -rf .next; bun run build > /tmp/wave2bform-prod.log 2>&1
echo "EXIT_CODE=$?"
grep -E "/\[city\]/contacts" /tmp/wave2bform-prod.log | tail -3
tail -10 /tmp/wave2bform-prod.log
```

Expected: `EXIT_CODE=0`, `/[city]/contacts` в App Router section.

---

## Task 7: DevTools MCP visual diff

**Files:** none

- [ ] **Step 1: Запустить dev**

```bash
bunx next dev --webpack -p 5757 > /tmp/wave2bform-dev2.log 2>&1 &
echo $! > /tmp/wave2bform-dev2.pid
sleep 25
```

- [ ] **Step 2: Open localhost через DevTools MCP**

```
mcp__plugin_chrome-devtools-mcp_chrome-devtools__new_page(url: "http://localhost:5757/tashkent/contacts")
```

- [ ] **Step 3: Verify form structure**

```
mcp__plugin_chrome-devtools-mcp_chrome-devtools__evaluate_script(function: `
() => {
  return {
    title: document.title,
    headings: Array.from(document.querySelectorAll('main .text-3xl, main .text-2xl, main label')).map(e => e.textContent?.trim()).filter(Boolean).slice(0, 20),
    inputs: Array.from(document.querySelectorAll('main input, main textarea')).map(e => ({
      type: e.tagName,
      name: e.getAttribute('name'),
    })),
    button: document.querySelector('main form button')?.textContent?.trim(),
    workTime: document.body.innerText.match(/с \d+-\d+ до \d+-\d+/)?.[0],
    phone: document.querySelector('main a[href^="tel:"]')?.textContent?.trim(),
    jobsLink: document.querySelector('main a[href*="Chopar_jbot"]')?.textContent?.trim(),
    hasHeader: !!document.querySelector('header'),
    hasFooter: !!document.querySelector('footer'),
  }
}`)
```

Expected (matching prod snapshot):
- `title`: "Наши контакты | Chopar Pizza"
- `headings`: ["Контакты", "Оставьте свой отзыв", "Имя", "Номер телефона", "Эл. почта", "Номер заказа", "Отзыв"]
- `inputs`: 5 entries (4 INPUT + 1 TEXTAREA), names: name, (phone), email, order_id, text
- `button`: "Отправить"
- `workTime`: "с 10-00 до 03-00"
- `phone`: "+998 (71) 205-11-11"
- `jobsLink`: "Устроиться на работу"
- `hasHeader`/`hasFooter`: true

- [ ] **Step 4: Console check**

```
mcp__plugin_chrome-devtools-mcp_chrome-devtools__list_console_messages(types: ["error"])
```

Expected: only known issues (favicon 404). No hydration mismatches.

- [ ] **Step 5: Close page, stop dev**

```
mcp__plugin_chrome-devtools-mcp_chrome-devtools__close_page(...)
```

```bash
kill $(cat /tmp/wave2bform-dev2.pid) 2>/dev/null
sleep 2
```

---

## Final Verification

- [ ] **Step 1: File tree**

```bash
ls components_new/contacts/ContactsApp.tsx "app/[city]/contacts/page.tsx"
git ls-files "pages/[city]/contacts" 2>&1
```

Expected:
- Both new files exist
- `git ls-files` empty

- [ ] **Step 2: TS clean**

```bash
bunx tsc --noEmit 2>&1 | grep -E "^(app/|i18n/|lib/data/|lib/posthog-app|proxy\.ts|components_new/(seo|about|fran|delivery|privacy|branch|contacts|HeaderApp|FooterApp|header/(HeaderPhone|ChooseCity|Language|SignInButton)App))" | head -10
```

Expected: empty.

- [ ] **Step 3: Build OK**

```bash
rm -rf .next/* 2>/dev/null; rm -rf .next; bun run build > /tmp/wave2bform-final.log 2>&1
echo "EXIT_CODE=$?"
```

Expected: `EXIT_CODE=0`.

- [ ] **Step 4: Wave 2B-Form commits**

```bash
git log --oneline ff0b48a8..HEAD
```

Expected: ~5 commits (ContactsApp → contacts/page → proxy → delete legacy).

- [ ] **Step 5: Branch clean**

```bash
git status
```

Expected: clean.

---

## Wave 2B-Form Done. Что осталось:

После Wave 2B-Form **все статичные страницы** (`/[city]/about`, `/about/fran`, `/delivery`, `/privacy`, `/branch`, `/contacts`) полностью мигрированы.

**Следующее:**
- **Wave 3** — Контент (`news`, `news/[id]`, `sale`, `sale/[id]`)
- **Wave 4** — Каталог (`/[city]` главная, `/[city]/product/[id]`)
- **Wave 5** — Personal (cart, checkout, profile, orders, tracking, bonus)
- **Wave 6** — Cleanup (remove pages/_app.tsx, _document.tsx, i18n.js, next-translate, next-cookies, next-seo, switch localePrefix to 'as-needed' с [locale] segment)

---

## Self-Review Checklist

- [ ] Каждая Task имеет `Files:` секцию
- [ ] Каждый Step имеет либо exact код, либо exact команду
- [ ] **Никаких `useTranslations`/`getTranslations`** — только `useExtracted`/`getExtracted`
- [ ] Form labels через `useExtracted` (Имя, Номер телефона, Эл. почта, Номер заказа, Отзыв, Обязательное поле, Отправить, Отзыв успешно отправлен, График работы, Устроиться на работу, Контакты, Оставьте свой отзыв)
- [ ] CSRF flow preserved: get token from `/api/keldi`, set cookie X-XSRF-TOKEN, attach to axios defaults
- [ ] Form validation: name/phone/text required (через react-hook-form `required: true`)
- [ ] workTime приходит через props from server page (не client-side fetch)
- [ ] page использует Promise.all([fetchPublicConfig, getLocale]) для параллельной загрузки
- [ ] proxy.ts matcher — literal strings
- [ ] Build OK after delete legacy
- [ ] DevTools MCP подтверждает все form labels + workTime + phone + jobs link
