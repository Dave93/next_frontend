import 'server-only'
import { unstable_cache as cache } from 'next/cache'

export type PublicConfig = {
  workTimeRu?: string
  workTimeUz?: string
  workTimeEn?: string
  [key: string]: unknown
}

async function fetchPublicConfigRaw(): Promise<PublicConfig> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL
  const res = await fetch(`${apiUrl}/api/configs/public`, {
    next: { revalidate: 3600, tags: ['public-config'] },
  })
  if (!res.ok) throw new Error(`Failed to fetch public config: ${res.status}`)
  const json = (await res.json()) as { data: string }
  const decoded = Buffer.from(json.data, 'base64').toString('utf8')
  return JSON.parse(decoded) as PublicConfig
}

export const fetchPublicConfig = cache(fetchPublicConfigRaw, ['public-config'], {
  revalidate: 3600,
  tags: ['public-config'],
})
