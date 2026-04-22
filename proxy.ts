import createMiddleware from 'next-intl/middleware'
import { type NextRequest } from 'next/server'
import { routing } from './i18n/routing'

const intlProxy = createMiddleware(routing)

export function proxy(request: NextRequest) {
  // В Wave 1 единственный App Router URL — /test-foundation.
  // localePrefix='never' в i18n/routing.ts означает что middleware не делает
  // URL rewrites для локалей; locale определяется через NEXT_LOCALE cookie.
  // Дополнительная логика и matcher расширятся в Wave 2-5.
  return intlProxy(request)
}

// Matcher включает ТОЛЬКО App Router URL'ы. Legacy pages обрабатываются
// Pages Router без перехвата proxy.
export const config = {
  matcher: ['/test-foundation/:path*', '/test-foundation'],
}
