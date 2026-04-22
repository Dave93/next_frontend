import { getRequestConfig } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { promises as fs } from 'fs'
import path from 'path'
import { po } from 'gettext-parser'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale

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
