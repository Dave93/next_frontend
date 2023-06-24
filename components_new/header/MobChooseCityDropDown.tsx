import React, { Fragment, FC, memo, useState, useMemo } from 'react'
import { Menu, Transition } from '@headlessui/react'
import Image from 'next/image'
import { useUI } from '@components/ui'
import { City } from '@commerce/types/cities'
import router, { useRouter } from 'next/router'

const ChooseCityDropDown: FC = () => {
  const { cities, activeCity, setActiveCity } = useUI()
  const { locale, pathname, query } = useRouter()

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
    <Menu as="div">
      {({ open }) => (
        <>
          <div className={`${open ? 'hidden' : ''}`}>
            <Menu.Button className="focus:outline-none font-medium justify-center outline-none px-4 py-2 text-white text-sm w-full">
              <div className="flex items-center">
                <Image src="/assets/location.png" width="14" height="16" />
                <div className="ml-3 text-xl">
                  {locale == 'uz' ? chosenCity?.name_uz : ''}
                  {locale == 'ru' ? chosenCity?.name : ''}
                  {locale == 'en' ? chosenCity?.name_en : ''}
                </div>
              </div>
            </Menu.Button>
          </div>

          <Transition
            show={open}
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items
              static
              className="text-white w-full h-full z-50 fixed bg-secondary"
            >
              {cities.map((item: City) => (
                <Menu.Item key={item.id}>
                  <span
                    onClick={() => changeCity(item)}
                    className={`block px-4 py-2 cursor-pointer text-xl ml-12`}
                  >
                    {locale == 'ru' ? item.name : ''}
                    {locale == 'uz' ? item.name_uz : ''}
                    {locale == 'en' ? item.name_en : ''}
                  </span>
                </Menu.Item>
              ))}
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  )
}

export default memo(ChooseCityDropDown)
