'use client'

import { useEffect } from 'react'
import { useUI } from '@components/ui/context'
import type { City } from '@commerce/types/cities'

type Props = {
  children: React.ReactNode
  pageProps: {
    cities: City[]
    currentCity: City
  }
}

// Wave 2A: минимальный city layout без legacy Layout (Header/Footer/CityModal/...).
// Причины:
// - Legacy Layout использует useRouter() из next/router (Pages Router API),
//   что вызывает "NextRouter was not mounted" в App Router context.
// - Legacy Layout читает router.locale, router.pathname, router.query —
//   все это нужно переписать на next/navigation + next-intl, что является
//   объёмом отдельных Wave (Header/Footer migration).
//
// Что мы делаем сейчас: только syncим currentCity/cities в ManagedUIContext
// (для совместимости с legacy code) и рендерим children.
//
// Wave 3/4 спланируют отдельную миграцию Header/Footer/Modals для App Router.
// До тех пор страницы под app/[city]/* отображаются "голыми" (без шапки/футера),
// но контент рендерится корректно и SEO meta присутствуют.
export default function LayoutWrapper({ children, pageProps }: Props) {
  const { setActiveCity, setCitiesData } = useUI()

  useEffect(() => {
    if (pageProps.currentCity) {
      setActiveCity(pageProps.currentCity)
    }
    if (pageProps.cities?.length) {
      setCitiesData(pageProps.cities)
    }
  }, [pageProps.currentCity, pageProps.cities, setActiveCity, setCitiesData])

  return <main className="container mx-auto py-8">{children}</main>
}
