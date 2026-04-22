import 'server-only'
import { getAuthToken } from './auth'

const apiUrl = () => process.env.NEXT_PUBLIC_API_URL || process.env.API_URL

export async function fetchOrderById(id: string) {
  const token = await getAuthToken()
  if (!token) return null
  const res = await fetch(`${apiUrl()}/api/orders?id=${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  if (!res.ok) return null
  const json = (await res.json()) as { data?: any }
  return json.data || null
}

export async function fetchOrderStatuses() {
  const res = await fetch(`${apiUrl()}/api/order_statuses/system`, {
    next: { revalidate: 3600 },
  })
  if (!res.ok) return []
  const json = (await res.json()) as { data?: any[] }
  return json.data || []
}
