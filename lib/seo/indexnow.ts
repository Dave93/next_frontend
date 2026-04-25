import 'server-only'
import { SEO_BASE_URL } from './alternates'

const HOST = new URL(SEO_BASE_URL).host
const ENDPOINT = 'https://api.indexnow.org/IndexNow'

function getKey(): string | undefined {
  return process.env.INDEXNOW_KEY?.trim() || undefined
}

/**
 * Submit one or more URLs (absolute or path) to IndexNow.
 * Picked up by Bing, Yandex, Naver and Seznam in real time.
 *
 * No-op (returns false) when INDEXNOW_KEY env is not configured.
 */
export async function submitUrls(urls: string[]): Promise<boolean> {
  const key = getKey()
  if (!key) return false
  if (!urls || urls.length === 0) return false

  const urlList = urls
    .map((u) =>
      u.startsWith('http') ? u : `${SEO_BASE_URL}${u.startsWith('/') ? '' : '/'}${u}`
    )
    .slice(0, 10000)

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: HOST,
        key,
        keyLocation: `${SEO_BASE_URL}/indexnow-key.txt`,
        urlList,
      }),
    })
    return res.ok || res.status === 202
  } catch {
    return false
  }
}

/**
 * Submit one URL — convenience wrapper.
 */
export async function submitUrl(url: string): Promise<boolean> {
  return submitUrls([url])
}
