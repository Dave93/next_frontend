'use client'

import { FC, useEffect, useMemo, useRef } from 'react'
import Image from 'next/image'
import { useExtracted } from 'next-intl'
import { Link } from '../i18n/navigation'
import { useLocationStore } from '../lib/stores/location-store'
import { useUIStore } from '../lib/stores/ui-store'
import ChooseCityDropDownApp from './header/ChooseCityDropDownApp'
import HeaderMiniCartApp from './header/HeaderMiniCartApp'
import HeaderPhoneApp from './header/HeaderPhoneApp'
import LanguageDropDownApp from './header/LanguageDropDownApp'
import SignInButtonApp from './header/SignInButtonApp'
import SideMenuApp from './header/SideMenuApp'

const HeaderApp: FC = () => {
  const activeCity = useLocationStore((s) => s.activeCity) as any
  const cities = useLocationStore((s) => s.cities) as any
  const locationData = useLocationStore((s) => s.locationData) as any
  const openLocationTabs = useUIStore((s) => s.openLocationModal)
  const t = useExtracted()
  const headerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const el = headerRef.current
    if (!el) return
    const update = () => {
      document.documentElement.style.setProperty(
        '--header-h',
        `${el.offsetHeight}px`
      )
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    window.addEventListener('resize', update)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [])

  const chosenCity = useMemo(() => {
    if (activeCity) return activeCity
    if (cities && cities.length) return cities[0]
    return null
  }, [cities, activeCity])

  const addressLabel = useMemo(() => {
    if (locationData?.address) return locationData.address as string
    return t('Укажите свой адрес')
  }, [locationData, t])

  const deliveryType = locationData?.deliveryType
  const ACTIVE_BG = 'rgba(250, 175, 4, 0.08)'
  const ACTIVE_BORDER = '#FAAF04'
  const INACTIVE_BG = '#F3F4F6'
  const INACTIVE_BORDER = 'transparent'

  return (
    <header
      ref={headerRef}
      className="bg-white mb-3 md:py-[15px] md:items-center md:flex sticky top-0 z-30"
      id="header"
    >
      <div className="container mx-auto px-3 md:px-0">
        <div className="flex justify-between items-center py-3 md:py-0 gap-2 md:gap-4">
          {/* Brand cluster: logo + explicit "Меню" link so it's obvious how
              to return to the catalog from inner pages (the logo alone wasn't
              discovered by users). */}
          <div className="flex items-center gap-3 md:gap-5">
            <div className="w-32 md:w-48">
              <Link href={`/${chosenCity?.slug || ''}`} prefetch={false}>
                <Image
                  src="/assets/main_logo.svg"
                  width={188}
                  height={68}
                  alt="main_logo"
                />
              </Link>
            </div>
            <Link
              href={`/${chosenCity?.slug || ''}`}
              prefetch={false}
              className="hidden md:inline-flex items-center text-lg font-bold text-gray-800 hover:text-yellow transition-colors"
            >
              {t('Меню')}
            </Link>
          </div>
          {/* Center: address / delivery type picker (primary action). */}
          <div className="hidden md:flex flex-1 justify-center px-6">
            <button
              type="button"
              onClick={() => openLocationTabs?.()}
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
          {/* Right cluster — logical grouping:
              locale (city, lang) → contact (phone) → user (sign-in)
              → commerce (cart) → overflow (burger). */}
          <div className="flex items-center">
            <div className="md:flex hidden items-center gap-1">
              <ChooseCityDropDownApp />
              <LanguageDropDownApp />
              <HeaderPhoneApp />
              <SignInButtonApp />
              <HeaderMiniCartApp />
              <SideMenuApp />
            </div>
            <div className="md:hidden flex items-center gap-0.5 -mr-2">
              <ChooseCityDropDownApp />
              <LanguageDropDownApp />
              <SideMenuApp />
            </div>
          </div>
        </div>

        <div className="md:hidden grid grid-cols-2 gap-2 pb-3">
          <button
            type="button"
            onClick={() => openLocationTabs?.('deliver')}
            className="rounded-full text-sm font-medium py-3 transition"
            style={{
              background: deliveryType === 'deliver' ? ACTIVE_BG : INACTIVE_BG,
              border: `1px solid ${
                deliveryType === 'deliver' ? ACTIVE_BORDER : INACTIVE_BORDER
              }`,
              color: deliveryType === 'deliver' ? ACTIVE_BORDER : '#1f2937',
            }}
          >
            {t('Доставка')}
          </button>
          <button
            type="button"
            onClick={() => openLocationTabs?.('pickup')}
            className="rounded-full text-sm font-medium py-3 transition"
            style={{
              background: deliveryType === 'pickup' ? ACTIVE_BG : INACTIVE_BG,
              border: `1px solid ${
                deliveryType === 'pickup' ? ACTIVE_BORDER : INACTIVE_BORDER
              }`,
              color: deliveryType === 'pickup' ? ACTIVE_BORDER : '#1f2937',
            }}
          >
            {t('Самовывоз')}
          </button>
        </div>
      </div>
    </header>
  )
}

export default HeaderApp
