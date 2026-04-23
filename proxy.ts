import { NextResponse, type NextRequest } from 'next/server'

// Wave 7: next-intl middleware removed entirely.
// With localePrefix:'never' the middleware still rewrites '/tashkent' →
// '/ru/tashkent' internally, but our app structure is `app/[city]/...`
// (NOT `app/[locale]/[city]/...`), so every rewrite produces 404.
// Locale is now resolved per-request in i18n/request.ts via NEXT_LOCALE
// cookie + Accept-Language header (handled by getRequestConfig).
//
// Future: switch to `localePrefix:'as-needed'` with `app/[locale]/[city]/...`
// restructure if SEO needs `/uz/`, `/en/` URLs visible (separate wave).
export function proxy(request: NextRequest) {
  // Legacy /[city]/_bonus → /[city]/bonus (Wave 7 rename for Next folder convention)
  if (request.nextUrl.pathname.includes('/_bonus')) {
    const newPath = request.nextUrl.pathname.replace('/_bonus', '/bonus')
    return NextResponse.redirect(new URL(newPath, request.url))
  }
  // Legacy product redirect: /product/[id] → /[city]/product/[id]
  const m = request.nextUrl.pathname.match(/^\/product\/(\d+)$/)
  if (m) {
    const citySlug = request.cookies.get('city_slug')?.value || 'tashkent'
    return NextResponse.redirect(
      new URL(`/${citySlug}/product/${m[1]}`, request.url)
    )
  }
  // Root → city redirect
  if (request.nextUrl.pathname === '/') {
    const citySlug = request.cookies.get('city_slug')?.value || 'tashkent'
    return NextResponse.redirect(new URL(`/${citySlug}`, request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/product/:id',
    '/(tashkent|samarkand|bukhara|namangan|fergana|andijan|qarshi|nukus|urgench|jizzakh|gulistan|termez|chirchiq|navoi)/_bonus/:path*',
  ],
}
