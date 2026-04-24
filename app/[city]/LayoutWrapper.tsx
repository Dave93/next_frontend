'use client'

import { useEffect } from 'react'
import { useUI } from '@components/ui/context'
import type { City } from '@commerce/types/cities'
import type { APILinkItem } from '@commerce/types/headerMenu'
import type { SocialIcons } from '@commerce/types/socialIcons'
import type { PublicConfig } from '../../lib/data/configs'
import HeaderApp from '../../components_new/HeaderApp'
import FooterApp from '../../components_new/FooterApp'
import SmallCartMobileApp from '../../components_new/common/SmallCartMobileApp'
import MobileBottomNavApp from '../../components_new/mobile/MobileBottomNavApp'
import SignInModalApp from '../../components_new/auth/SignInModalApp'
import LocationTabsModalApp from '../../components_new/header/LocationTabsModalApp'

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
    <div className="flex flex-col min-h-screen">
      <HeaderApp />
      <SmallCartMobileApp />
      <main className="flex-1 w-full container mx-auto px-4 md:px-0">
        {children}
      </main>
      <MobileBottomNavApp />
      <FooterApp
        categories={pageProps.categories}
        footerInfoMenu={pageProps.footerInfoMenu}
        socials={pageProps.socials}
        currentCity={pageProps.currentCity}
        config={pageProps.config}
        locale={pageProps.locale}
      />
      <SignInModalApp />
      <LocationTabsModalApp />
    </div>
  )
}
