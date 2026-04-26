import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'

const ALLOWED_TAGS = new Set([
  'menu',
  'products',
  'sliders',
  'site-info',
  'config',
  'news',
  'sales',
  'zones',
])

function isTagAllowed(tag: string): boolean {
  if (ALLOWED_TAGS.has(tag)) return true
  // Allow scoped sub-tags: menu:tashkent, menu:tashkent:ru, sliders:ru, etc.
  const root = tag.split(':')[0]
  return ALLOWED_TAGS.has(root)
}

export async function POST(req: Request) {
  const secret =
    req.headers.get('x-revalidate-secret') ||
    req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')

  if (!process.env.REVALIDATE_SECRET) {
    return NextResponse.json(
      { error: 'REVALIDATE_SECRET not configured' },
      { status: 500 }
    )
  }
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const tags: string[] = Array.isArray(body?.tags) ? body.tags : []
  if (!tags.length) {
    return NextResponse.json(
      { error: 'tags must be a non-empty array' },
      { status: 400 }
    )
  }

  const accepted: string[] = []
  const rejected: string[] = []
  for (const tag of tags) {
    if (typeof tag !== 'string' || !tag.length) {
      rejected.push(String(tag))
      continue
    }
    if (!isTagAllowed(tag)) {
      rejected.push(tag)
      continue
    }
    revalidateTag(tag, 'max')
    accepted.push(tag)
  }

  return NextResponse.json({
    revalidated: accepted,
    rejected,
    timestamp: new Date().toISOString(),
  })
}

// Reject GET so the endpoint isn't accidentally hit by browsers/crawlers.
export async function GET() {
  return NextResponse.json(
    { error: 'POST only — see docs/redesign-nextjs16-2026/laravel-webhook.md' },
    { status: 405, headers: { Allow: 'POST' } }
  )
}
