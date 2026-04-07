import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { LocationMarkerIcon, ChevronDownIcon } from '@heroicons/react/solid'
import useTranslation from 'next-translate/useTranslation'
import { useUI } from '@components/ui/context'
import { City } from '@commerce/types/cities'

const MobileHeader: FC = () => {
  const routerInstance = useRouter()
  const { locale = 'ru', query, pathname } = routerInstance
  const { t: tr } = useTranslation('common')
  const {
    activeCity,
    cities,
    locationData,
    setLocationData,
    setActiveCity,
    openMobileLocationTabs,
  } = useUI()
  const [showCityList, setShowCityList] = useState(false)

  const chosenCity = useMemo(() => {
    if (activeCity) return activeCity
    if (cities) return cities[0]
    return null
  }, [cities, activeCity])

  const citySlug = (query.city as string) || chosenCity?.slug || ''

  const cityName = useMemo(() => {
    if (!chosenCity) return ''
    const key = `name_${locale}` as keyof typeof chosenCity
    return (chosenCity as any)[key] || chosenCity.name || ''
  }, [chosenCity, locale])

  const changeCity = (city: City) => {
    let link = pathname
    Object.keys(query).map((k: string) => {
      if (k == 'city') {
        link = link.replace('[city]', city.slug)
      } else {
        link = link.replace(`[${k}]`, query[k]!.toString())
      }
    })
    routerInstance.push(link)
    setActiveCity(city)
    setLocationData({
      deliveryType: 'deliver',
      location: [],
      address: '',
      terminal_id: undefined,
      terminalData: undefined,
    } as any)
    setShowCityList(false)
  }

  const headerRef = useCallback((node: HTMLElement | null) => {
    if (node) {
      const update = () => {
        document.documentElement.style.setProperty(
          '--header-h',
          node.offsetHeight + 'px'
        )
      }
      update()
      const ro = new ResizeObserver(update)
      ro.observe(node)
    }
  }, [])

  return (
    <header ref={headerRef} className="sticky top-0 z-30 bg-white">
      <div className="flex items-center justify-between px-4 py-2.5">
        <Link href={`/${citySlug}`} prefetch={false} legacyBehavior>
          <a className="flex">
            <Image
              src="/assets/main_logo.svg"
              width={120}
              height={44}
              alt="Chopar"
            />
          </a>
        </Link>
        <div className="relative">
          <button
            className="flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1.5"
            onClick={() =>
              pathname === '/[city]' && setShowCityList(!showCityList)
            }
          >
            <LocationMarkerIcon
              className="w-3.5 h-3.5"
              style={{ color: '#F9B004' }}
            />
            <span className="text-xs font-medium text-gray-700">
              {cityName}
            </span>
            {pathname === '/[city]' && (
              <ChevronDownIcon className="w-3 h-3 text-gray-400" />
            )}
          </button>
          {showCityList && cities && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowCityList(false)}
              />
              <div className="absolute right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 min-w-[160px]">
                {cities.map((city: City) => (
                  <button
                    key={city.id}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      activeCity?.id === city.id
                        ? 'font-semibold'
                        : 'text-gray-700'
                    }`}
                    style={
                      activeCity?.id === city.id
                        ? { color: '#F9B004' }
                        : undefined
                    }
                    onClick={() => changeCity(city)}
                  >
                    {locale === 'uz'
                      ? city.name_uz
                      : locale === 'en'
                      ? city.name_en
                      : city.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      {/* Delivery / Pickup toggle - only on main page */}
      {pathname === '/[city]' && (
        <div className="flex gap-2 px-4 pb-2.5">
          <button
            className={`flex-1 flex items-center rounded-2xl p-3 transition-colors ${
              locationData?.deliveryType === 'deliver'
                ? 'border border-yellow-200 bg-yellow-50'
                : 'bg-gray-100'
            }`}
            onClick={() => {
              setLocationData({
                ...(locationData || {}),
                deliveryType: 'deliver',
              })
              openMobileLocationTabs()
            }}
          >
            <div className="ml-1 flex-1 text-left">
              <div
                className={`text-sm font-semibold ${
                  locationData?.deliveryType === 'deliver'
                    ? ''
                    : 'text-gray-600'
                }`}
                style={
                  locationData?.deliveryType === 'deliver'
                    ? { color: '#F9B004' }
                    : undefined
                }
              >
                {tr('delivery') || 'Доставка'}
              </div>
              {locationData?.deliveryType === 'deliver' &&
                locationData?.address && (
                  <div className="text-[10px] text-gray-500 mt-0.5 truncate">
                    {locationData.address}
                  </div>
                )}
            </div>
          </button>
          <button
            className={`flex-1 flex items-center rounded-2xl p-3 transition-colors ${
              locationData?.deliveryType !== 'deliver'
                ? 'border border-yellow-200 bg-yellow-50'
                : 'bg-gray-100'
            }`}
            onClick={() => {
              setLocationData({
                ...(locationData || {}),
                deliveryType: 'pickup',
              })
              openMobileLocationTabs()
            }}
          >
            <div className="ml-1 flex-1 text-left">
              <div
                className={`text-sm font-semibold ${
                  locationData?.deliveryType !== 'deliver'
                    ? ''
                    : 'text-gray-600'
                }`}
                style={
                  locationData?.deliveryType !== 'deliver'
                    ? { color: '#F9B004' }
                    : undefined
                }
              >
                {tr('pickup') || 'Самовывоз'}
              </div>
              {locationData?.deliveryType !== 'deliver' &&
                locationData?.terminalData && (
                  <div className="text-[10px] text-gray-500 mt-0.5 truncate">
                    {(locationData.terminalData as any)?.[
                      locale === 'uz'
                        ? 'name_uz'
                        : locale === 'en'
                        ? 'name_en'
                        : 'name'
                    ] || ''}
                  </div>
                )}
            </div>
          </button>
        </div>
      )}
    </header>
  )
}

export default MobileHeader
