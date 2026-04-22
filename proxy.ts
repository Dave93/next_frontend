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
