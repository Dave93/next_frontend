import { NextResponse, type NextRequest } from 'next/server'

const NON_DEFAULT_LOCALES = ['uz', 'en'] as const
const LOCALE_PREFIX_RE = /^\/(uz|en)(\/.*)?$/

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Locale prefix handling — strip /uz or /en, save NEXT_LOCALE cookie
  // AND propagate the locale through a request header so the server
  // request config can read it without depending on cookie state.
  const localeMatch = pathname.match(LOCALE_PREFIX_RE)
  if (localeMatch) {
    const locale = localeMatch[1] as (typeof NON_DEFAULT_LOCALES)[number]
    const rest = localeMatch[2] || '/'

    // Bare /uz or /en (or /uz/, /en/) — there's no city slug yet, so
    // a rewrite to "/" would land on a route that doesn't exist (we
    // don't have an app/page.tsx, only app/[city]/page.tsx). Redirect
    // to /{locale}/{citySlug} instead so the catalog renders with the
    // chosen locale preserved.
    if (rest === '/' || rest === '') {
      const citySlug = request.cookies.get('city_slug')?.value || 'tashkent'
      const redirect = NextResponse.redirect(
        new URL(`/${locale}/${citySlug}`, request.url)
      )
      redirect.cookies.set('NEXT_LOCALE', locale, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
      })
      return redirect
    }

    const url = request.nextUrl.clone()
    url.pathname = rest
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-next-locale', locale)
    const response = NextResponse.rewrite(url, {
      request: { headers: requestHeaders },
    })
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
    '/(uz|en)',
    '/(uz|en)/:path*',
    '/(tashkent|samarkand|bukhara|namangan|fergana|andijan|qarshi|nukus|urgench|jizzakh|gulistan|termez|chirchiq|navoi)/_bonus/:path*',
  ],
}
