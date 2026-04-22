'use client'

import { useEffect } from 'react'
import { Layout } from '@components/common'
import { useUI } from '@components/ui/context'
import type { City } from '@commerce/types/cities'

type Props = {
  children: React.ReactNode
  pageProps: {
    categories: unknown[]
    topMenu: unknown[]
    footerInfoMenu: unknown[]
    socials: unknown[]
    cities: City[]
    currentCity: City
  }
}

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

  return <Layout pageProps={pageProps as any}>{children}</Layout>
}
