'use client'

import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useUI } from '@components/ui/context'
import type { City } from '@commerce/types/cities'
import type { APILinkItem } from '@commerce/types/headerMenu'
import type { SocialIcons } from '@commerce/types/socialIcons'
import type { PublicConfig } from '../../lib/data/configs'
import HeaderApp from '../../components_new/HeaderApp'
import FooterApp from '../../components_new/FooterApp'

const SmallCartApp = dynamic(
  () => import('../../components_new/common/SmallCartApp'),
  { ssr: false }
)
const SmallCartMobileApp = dynamic(
  () => import('../../components_new/common/SmallCartMobileApp'),
  { ssr: false }
)

type Props = {
  children: React.ReactNode
  pageProps: {
    cities: City[]
    currentCity: City
    categories: any[]
    footerInfoMenu: APILinkItem[]
    socials: SocialIcons[]
    config: PublicConfig
    locale: string
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

  return (
    <>
      <HeaderApp />
      <main className="container mx-auto py-8">{children}</main>
      <FooterApp
        categories={pageProps.categories}
        footerInfoMenu={pageProps.footerInfoMenu}
        socials={pageProps.socials}
        currentCity={pageProps.currentCity}
        config={pageProps.config}
        locale={pageProps.locale}
      />
      <SmallCartApp channelName="chopar" />
      <SmallCartMobileApp />
    </>
  )
}
