import { getRequestConfig } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { cookies, headers } from 'next/headers'
import { promises as fs } from 'fs'
import path from 'path'
import { po } from 'gettext-parser'
import { routing } from './routing'

// With proxy.ts no longer running next-intl middleware (Wave 7), locale
// must be resolved here from cookie / Accept-Language header.
async function detectLocale(): Promise<'ru' | 'uz' | 'en'> {
  const cookieStore = await cookies()
  const fromCookie = cookieStore.get('NEXT_LOCALE')?.value
  if (hasLocale(routing.locales, fromCookie)) return fromCookie as any

  const headerStore = await headers()
  const accept = headerStore.get('accept-language') || ''
  for (const lang of accept.split(',')) {
    const code = lang.split(';')[0].trim().slice(0, 2).toLowerCase()
    if (hasLocale(routing.locales, code)) return code as any
  }
  return routing.defaultLocale as any
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
