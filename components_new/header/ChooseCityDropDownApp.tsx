'use client'

import { FC, memo, useMemo } from 'react'
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from '@headlessui/react'
import { useUI } from '@components/ui'
import { useLocationStore } from '../../lib/stores/location-store'
import type { City } from '@commerce/types/cities'
import Cookies from 'js-cookie'
import { useExtracted, useLocale } from 'next-intl'
import { useRouter, usePathname } from '../../i18n/navigation'

const ChooseCityDropDownApp: FC = () => {
  const t = useExtracted()
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const cities = useLocationStore((s) => s.cities)
  const activeCity = useLocationStore((s) => s.activeCity)
  const { setActiveCity } = useUI() as any

  const chosenCity = useMemo(() => {
    if (activeCity) return activeCity
    if (cities && cities.length > 0) return cities[0]
    return null
  }, [cities, activeCity])

  const changeCity = (city: City) => {
    const segments = pathname.split('/').filter(Boolean)
    if (segments.length > 0 && chosenCity?.slug && segments[0] === chosenCity.slug) {
      segments[0] = city.slug
    } else {
      segments.unshift(city.slug)
    }
    const newPath = '/' + segments.join('/')
    router.push(newPath)
    setActiveCity(city)
    Cookies.set('city_confirmed', '1', { expires: 365 })
    Cookies.set('city_slug', city.slug, { expires: 365 })
  }

  if (!chosenCity) return null

  return (
    <Menu as="div" className="relative inline-block text-left">
      {({ open }) => (
        <>
          <div>
            <MenuButton className="bg-white focus:outline-none font-medium inline-flex items-center justify-center h-10 px-3 outline-none text-secondary text-base md:text-2xl">
              {locale === 'uz' ? chosenCity?.name_uz : ''}
              {locale === 'ru' ? chosenCity?.name : ''}
              {locale === 'en' ? chosenCity?.name_en : ''}
            </MenuButton>
          </div>

          <Transition
            show={open}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <MenuItems className="absolute bg-white divide-gray-100 divide-y focus:outline-none mt-2 origin-top-right right-0 ring-1 ring-black ring-opacity-5 rounded-2xl shadow-lg top-0 z-20">
              <MenuItem>
                {() => (
                  <span className="text-secondary block px-4 py-2">
                    {t('Ваш город')}
                  </span>
                )}
              </MenuItem>
              {cities?.map((item: City) => (
                <MenuItem key={item.id}>
                  <span
                    onClick={() => changeCity(item)}
                    className={`block px-4 py-2 cursor-pointer ${
                      chosenCity.id === item.id
                        ? 'bg-secondary text-white'
                        : 'text-secondary'
                    }`}
                  >
                    {locale === 'uz' ? item.name_uz : ''}
                    {locale === 'ru' ? item.name : ''}
                    {locale === 'en' ? item.name_en : ''}
                  </span>
                </MenuItem>
              ))}
            </MenuItems>
          </Transition>
        </>
      )}
    </Menu>
  )
}

export default memo(ChooseCityDropDownApp)
