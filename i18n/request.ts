import { getRequestConfig } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { headers } from 'next/headers'
import { promises as fs } from 'fs'
import path from 'path'
import { po } from 'gettext-parser'
import { routing } from './routing'

// Locale resolution priority:
// 1. x-next-locale request header — set by proxy.ts when URL has /uz or /en
//    prefix. This is the authoritative source for prefixed routes.
// 2. routing.defaultLocale (ru) — every other URL, including direct visits to
//    /tashkent or /tashkent/about, must serve ru content (prod parity).
//
// We deliberately ignore Accept-Language and the NEXT_LOCALE cookie for
// server-side detection: relying on either causes /tashkent to render in uz
// or en for users whose browser language is not Russian, breaking the
// "ru is default and prefix-less" contract.
async function detectLocale(): Promise<'ru' | 'uz' | 'en'> {
  const headerStore = await headers()
  const fromHeader = headerStore.get('x-next-locale')
  if (hasLocale(routing.locales, fromHeader)) return fromHeader as any
  return routing.defaultLocale as 'ru' | 'uz' | 'en'
}

export default getRequestConfig(async ({ requestLocale }) => {
  // requestLocale is empty when middleware doesn't set it; fall back to detection
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : await detectLocale()

  const poBuffer = await fs.readFile(
    path.join(process.cwd(), 'messages', `${locale}.po`)
  )
  const parsed = po.parse(poBuffer)

  const messages: Record<string, string> = {}
  for (const ctx of Object.values(parsed.translations)) {
    for (const entry of Object.values(ctx)) {
      if (entry.msgid) {
        messages[entry.msgid] = entry.msgstr[0] || entry.msgid
      }
    }
  }

  return {
    locale,
    messages,
    // Tolerate missing messages — components use useExtracted with inline RU
    // strings as the source of truth; PO files are populated via build-time
    // extraction (Wave 7 polish). Until then, fall back to the inline message
    // string and don't throw on miss.
    onError: () => {
      // suppress IntlError logs for MISSING_MESSAGE
    },
    getMessageFallback: ({ key }: { key: string }) => key,
  }
})
