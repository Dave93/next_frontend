import { NextResponse, type NextRequest } from 'next/server'

const NON_DEFAULT_LOCALES = ['uz', 'en'] as const
const LOCALE_PREFIX_RE = /^\/(uz|en)(\/.*)?$/

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Locale prefix handling — strip /uz or /en, save NEXT_LOCALE cookie,
  // rewrite to the city-only path so app/[city]/... matches.
  const localeMatch = pathname.match(LOCALE_PREFIX_RE)
  if (localeMatch) {
    const locale = localeMatch[1] as (typeof NON_DEFAULT_LOCALES)[number]
    const rest = localeMatch[2] || '/'
    const url = request.nextUrl.clone()
    url.pathname = rest
    const response = NextResponse.rewrite(url)
    response.cookies.set('NEXT_LOCALE', locale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    })
    return response
  }

  // Legacy /[city]/_bonus → /[city]/bonus (Next folder convention)
  if (pathname.includes('/_bonus')) {
    const newPath = pathname.replace('/_bonus', '/bonus')
    return NextResponse.redirect(new URL(newPath, request.url))
  }
  // Legacy product redirect: /product/[id] → /[city]/product/[id]
  const m = pathname.match(/^\/product\/(\d+)$/)
  if (m) {
    const citySlug = request.cookies.get('city_slug')?.value || 'tashkent'
    return NextResponse.redirect(
      new URL(`/${citySlug}/product/${m[1]}`, request.url)
    )
  }
  // Root → city redirect
  if (pathname === '/') {
    const citySlug = request.cookies.get('city_slug')?.value || 'tashkent'
    return NextResponse.redirect(new URL(`/${citySlug}`, request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/product/:id',
    '/(uz|en)/:path*',
    '/(tashkent|samarkand|bukhara|namangan|fergana|andijan|qarshi|nukus|urgench|jizzakh|gulistan|termez|chirchiq|navoi)/_bonus/:path*',
  ],
}
