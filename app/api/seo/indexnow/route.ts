import { NextResponse } from 'next/server'
import { submitUrls } from '@lib/seo/indexnow'

/**
 * POST /api/seo/indexnow
 * Body: { urls: string[], secret: string }
 *
 * Pings IndexNow with the supplied URL list. Useful from CMS webhooks
 * after publishing/editing products, news or sales.
 *
 * Auth: shared secret in `INDEXNOW_WEBHOOK_SECRET` env. Without it the
 * endpoint refuses requests.
 */
export async function POST(request: Request) {
  const expected = process.env.INDEXNOW_WEBHOOK_SECRET?.trim()
  if (!expected) {
    return NextResponse.json({ ok: false, reason: 'not_configured' }, { status: 503 })
  }
  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, reason: 'invalid_json' }, { status: 400 })
  }
  if (!body || body.secret !== expected) {
    return NextResponse.json({ ok: false, reason: 'unauthorized' }, { status: 401 })
  }
  const urls = Array.isArray(body.urls) ? body.urls.filter((u: any) => typeof u === 'string') : []
  if (urls.length === 0) {
    return NextResponse.json({ ok: false, reason: 'no_urls' }, { status: 400 })
  }
  const ok = await submitUrls(urls)
  return NextResponse.json({ ok, submitted: urls.length })
}
