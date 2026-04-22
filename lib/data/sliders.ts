import 'server-only'
import { unstable_cache as cache } from 'next/cache'

const apiUrl = () => process.env.NEXT_PUBLIC_API_URL || process.env.API_URL

async function fetchSlidersRaw(locale: string) {
  const res = await fetch(`${apiUrl()}/api/sliders/public?locale=${locale}`, {
    next: { revalidate: 300, tags: ['sliders'] },
  })
  if (!res.ok) return []
  const json = (await res.json()) as { data?: any[] }
  return json.data || []
}

export const fetchSliders = cache(fetchSlidersRaw, ['sliders'], {
  revalidate: 300,
  tags: ['sliders'],
})
