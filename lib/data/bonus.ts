import 'server-only'
import { getAuthToken } from './auth'

const apiUrl = () => process.env.NEXT_PUBLIC_API_URL || process.env.API_URL

export async function fetchBonusProducts() {
  const token = await getAuthToken()
  if (!token) return []
  const res = await fetch(`${apiUrl()}/api/bonus_prods`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  if (!res.ok) return []
  const json = (await res.json()) as { data?: any[] }
  return json.data || []
}
