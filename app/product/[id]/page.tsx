import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

type Params = { id: string }

export default async function LegacyProductRedirect({
  params,
}: {
  params: Promise<Params>
}) {
  const { id } = await params
  const cookieStore = await cookies()
  const citySlug = cookieStore.get('city_slug')?.value || 'tashkent'
  redirect(`/${citySlug}/product/${id}`)
}
