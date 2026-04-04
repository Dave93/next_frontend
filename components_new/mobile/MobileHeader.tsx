import React, { FC, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { LocationMarkerIcon, ChevronDownIcon } from '@heroicons/react/solid'
import useTranslation from 'next-translate/useTranslation'
import { useUI } from '@components/ui/context'

const MobileHeader: FC = () => {
  const { locale = 'ru', query } = useRouter()
  const { t: tr } = useTranslation('common')
  const {
    activeCity,
    cities,
    locationData,
    setLocationData,
    openMobileLocationTabs,
  } = useUI()

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

  const isDelivery = locationData?.deliveryType === 'deliver'

  const handleDeliveryType = (type: 'deliver' | 'pickup') => {
    if (locationData) {
      setLocationData({ ...locationData, deliveryType: type })
    }
    openMobileLocationTabs()
  }

  return (
    <header className="sticky top-0 z-30 bg-white">
      {/* Row 1: Logo + City */}
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
        <button
          className="flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1.5"
          onClick={() => openMobileLocationTabs()}
        >
          <LocationMarkerIcon
            className="w-3.5 h-3.5"
            style={{ color: '#F9B004' }}
          />
          <span className="text-xs font-medium text-gray-700">{cityName}</span>
          <ChevronDownIcon className="w-3 h-3 text-gray-400" />
        </button>
      </div>
      {/* Row 2: Delivery / Pickup toggle */}
      <div className="flex gap-2 px-4 pb-2.5">
        <button
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
            isDelivery ? 'text-white' : 'bg-gray-100 text-gray-500'
          }`}
          style={isDelivery ? { backgroundColor: '#F9B004' } : undefined}
          onClick={() => handleDeliveryType('deliver')}
        >
          {tr('headerMenuDelivery') || 'Доставка'}
        </button>
        <button
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
            !isDelivery ? 'text-white' : 'bg-gray-100 text-gray-500'
          }`}
          style={!isDelivery ? { backgroundColor: '#F9B004' } : undefined}
          onClick={() => handleDeliveryType('pickup')}
        >
          {'Самовывоз'}
        </button>
      </div>
    </header>
  )
}

export default MobileHeader
