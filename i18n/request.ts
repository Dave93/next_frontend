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

  return { locale, messages }
})
