import 'server-only'
import { unstable_cache as cache } from 'next/cache'
import commerce from '@lib/api/commerce'

async function fetchSiteInfoRaw() {
  return await commerce.getSiteInfo()
}

export const fetchSiteInfo = cache(fetchSiteInfoRaw, ['site-info'], {
  revalidate: 3600,
  tags: ['site-info'],
})
