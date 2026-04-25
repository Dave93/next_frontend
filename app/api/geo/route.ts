import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// IP geolocation temporarily stubbed — geoip-lite (.dat files) doesn't bundle
// cleanly with Next.js webpack. Wave 7 will replace with serverless geo
// service (Vercel geo headers / Cloudflare CF-IPCountry / API call).
export async function GET(_req: NextRequest) {
  return NextResponse.json({
    geo: null,
    note: 'geo lookup deferred — see Wave 7 polish',
  })
}
