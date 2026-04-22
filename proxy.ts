import createMiddleware from 'next-intl/middleware'
import { type NextRequest } from 'next/server'
import { routing } from './i18n/routing'

const intlProxy = createMiddleware(routing)

export function proxy(request: NextRequest) {
  // App Router URL'ы постепенно расширяются по мере миграции страниц.
  // Wave 1: /test-foundation (удалена)
  // Wave 2: /[city]/about (только about, остальные статичные — Wave 2B)
  // Wave 3+: контент, каталог, personal, etc.
  return intlProxy(request)
}

// Matcher включает ТОЛЬКО App Router URL'ы. Pages Router URL'ы (/[city],
// /[city]/cart, /[city]/news, etc.) обходят proxy.ts.
//
// (tashkent|samarkand|...) — все known city slugs. Если бэкенд добавит
// новый город — добавить в этот список (либо в Wave 5/6 переключиться
// на динамический matcher через middleware logic).
export const config = {
  matcher: [
    '/(tashkent|samarkand|bukhara|namangan|fergana|andijan|qarshi|nukus|urgench|jizzakh|gulistan|termez|chirchiq|navoi)/about',
  ],
}
