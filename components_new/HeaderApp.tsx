'use client'

import React, { FC, useMemo } from 'react'
import Image from 'next/image'
import { Link } from '../i18n/navigation'
import { useUI } from '@components/ui/context'
import ChooseCityDropDownApp from './header/ChooseCityDropDownApp'
import HeaderPhoneApp from './header/HeaderPhoneApp'
import LanguageDropDownApp from './header/LanguageDropDownApp'
import SignInButtonApp from './header/SignInButtonApp'

const HeaderApp: FC = () => {
  const { activeCity, cities } = useUI()

  const chosenCity = useMemo(() => {
    if (activeCity) return activeCity
    if (cities && cities.length) return cities[0]
    return null
  }, [cities, activeCity])

  return (
    <header
      className="py-[15px] items-center md:flex bg-white mb-3"
      id="header"
    >
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <div className="w-32 md:w-48 ml-4 md:ml-0">
            <Link href={`/${chosenCity?.slug || ''}`} prefetch={false}>
              <Image
                src="/assets/main_logo.svg"
                width={188}
                height={68}
                alt="main_logo"
              />
            </Link>
          </div>
          <div className="flex items-center">
            <div className="md:flex hidden items-center">
              <HeaderPhoneApp />
              <ChooseCityDropDownApp />
              <div className="mx-2">
                <LanguageDropDownApp />
              </div>
              <div className="mx-2">
                <SignInButtonApp />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default HeaderApp
