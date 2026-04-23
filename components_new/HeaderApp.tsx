'use client'

import { FC, useMemo } from 'react'
import Image from 'next/image'
import { Link } from '../i18n/navigation'
import { useUI } from '@components/ui/context'
import ChooseCityDropDownApp from './header/ChooseCityDropDownApp'
import HeaderPhoneApp from './header/HeaderPhoneApp'
import SignInButtonApp from './header/SignInButtonApp'

const addressLabels: Record<string, string> = {
  ru: 'Укажите свой адрес',
  uz: 'Manzilni tanlang',
  en: 'Enter your address',
}

const HeaderApp: FC = () => {
  const { activeCity, cities, locationData, openSidebar } = useUI() as any

  const chosenCity = useMemo(() => {
    if (activeCity) return activeCity
    if (cities && cities.length) return cities[0]
    return null
  }, [cities, activeCity])

  const addressLabel = useMemo(() => {
    if (locationData?.address) return locationData.address as string
    const lang = (
      typeof document !== 'undefined'
        ? document.documentElement.lang
        : 'ru'
    ) as string
    return addressLabels[lang] || addressLabels.ru
  }, [locationData])

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
          <div className="hidden md:flex flex-1 justify-center px-6">
            <button
              type="button"
              onClick={() => openSidebar?.()}
              className="flex items-center gap-2 bg-yellow rounded-full px-6 h-11 text-white font-medium shadow-sm hover:shadow transition"
              style={{ backgroundColor: '#FFC22A' }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="truncate max-w-[260px]">{addressLabel}</span>
            </button>
          </div>
          <div className="flex items-center">
            <div className="md:flex hidden items-center">
              <HeaderPhoneApp />
              <ChooseCityDropDownApp />
              <div className="mx-2">
                <SignInButtonApp />
              </div>
              <button
                type="button"
                aria-label="menu"
                className="ml-3 p-2 text-gray-700 hover:text-gray-900"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default HeaderApp
