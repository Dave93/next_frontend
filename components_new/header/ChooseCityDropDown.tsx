import { Fragment, useState, FC, memo, useMemo } from 'react'
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from '@headlessui/react'
import { useUI } from '@components/ui'
import { City } from '@commerce/types/cities'
import router, { useRouter } from 'next/router'
import useTranslation from 'next-translate/useTranslation'

const ChooseCityDropDown: FC = () => {
  const { t: tr } = useTranslation('common')
  const { locale, pathname, query } = useRouter()
  const { cities, activeCity, setActiveCity } = useUI()

  const chosenCity = useMemo(() => {
    if (activeCity) {
      return activeCity
    }
    if (cities) return cities[0]
    return null
  }, [cities, activeCity])

  const changeCity = (city: City) => {
    let link = pathname
    Object.keys(query).map((k: string) => {
      if (k == 'city') {
        link = link.replace('[city]', city.slug)
      } else {
        link = link.replace(`[${k}]`, query[k]!.toString())
      }
    })
    router.push(link)
    setActiveCity(city)
  }

  return (
    <Menu as="div" className="relative inline-block text-left">
      {({ open }) => (
        <>
          <div>
            <MenuButton className="bg-white focus:outline-none font-medium inline-flex justify-center outline-none text-secondary text-2xl w-full">
              {locale == 'uz' ? chosenCity?.name_uz : ''}
              {locale == 'ru' ? chosenCity?.name : ''}
              {locale == 'en' ? chosenCity?.name_en : ''}
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
                {({ active }) => (
                  <span className="text-secondary block px-4 py-2">
                    {tr('your_city')}
                  </span>
                )}
              </MenuItem>
              {cities?.map((item: City) => (
                <MenuItem key={item.id}>
                  <span
                    onClick={() => changeCity(item)}
                    className={`block px-4 py-2 cursor-pointer ${
                      chosenCity.id == item.id
                        ? 'bg-secondary text-white'
                        : 'text-secondary'
                    }`}
                  >
                    {locale == 'uz' ? item.name_uz : ''}
                    {locale == 'ru' ? item.name : ''}
                    {locale == 'en' ? item.name_en : ''}
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

export default memo(ChooseCityDropDown)
