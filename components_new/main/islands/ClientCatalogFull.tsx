'use client'

import { FC, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import CityMainApp from '../CityMainApp'
import { legacyMenu } from '../../../lib/data/menu-to-legacy'
import type { SlimMenu } from '../../../lib/data/menu-dto'

type Props = {
  citySlug: string
  locale: string
  channelName: string
  categories: any[]
  sliders: any[]
  initialMenu?: SlimMenu | null
}

async function fetchMenu(
  citySlug: string,
  locale: string
): Promise<SlimMenu> {
  const res = await fetch(`/api/menu/${citySlug}/${locale}`, {
    headers: { Accept: 'application/json' },
    cache: 'force-cache',
  })
  if (!res.ok) throw new Error(`Menu fetch ${res.status}`)
  return res.json()
}

const ClientCatalogFull: FC<Props> = ({
  citySlug,
  locale,
  channelName,
  categories,
  sliders,
  initialMenu = null,
}) => {
  const { data: menu } = useQuery({
    queryKey: ['menu', citySlug, locale],
    queryFn: () => fetchMenu(citySlug, locale),
    initialData: initialMenu ?? undefined,
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const products = useMemo(() => (menu ? legacyMenu(menu) : []), [menu])

  return (
    <CityMainApp
      products={products}
      categories={categories}
      sliders={sliders}
      channelName={channelName}
    />
  )
}

export default ClientCatalogFull
