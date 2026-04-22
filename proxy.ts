import createMiddleware from 'next-intl/middleware'
import { type NextRequest } from 'next/server'
import { routing } from './i18n/routing'

const intlProxy = createMiddleware(routing)

export function proxy(request: NextRequest) {
  // В Wave 1 единственный App Router URL — /_test (и его /uz/_test, /en/_test варианты).
  // Дополнительная логика (legacy product redirect, root city redirect, etc.) добавится
  // в следующих волнах вместе с миграцией соответствующих страниц.
  return intlProxy(request)
}

// Matcher включает ТОЛЬКО App Router URL'ы. Legacy pages обрабатываются Pages Router
// без перехвата proxy.
//
// В Wave 1: /_test, /uz/_test, /en/_test
// В Wave 2 добавится: /[city]/about, /[city]/contacts, /[city]/delivery, ...
// В Wave 6 после полной миграции: '/((?!api|_next|_vercel|.*\\..*).*)'
export const config = {
  matcher: ['/_test/:path*', '/_test', '/(ru|uz|en)/_test/:path*', '/(ru|uz|en)/_test'],
}
