import 'server-only'
import { cookies } from 'next/headers'

export async function getAuthToken(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get('opt_token')?.value
}

export async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await getAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function getCitySlug(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get('city_slug')?.value
}
