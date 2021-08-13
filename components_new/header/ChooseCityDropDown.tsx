import { Fragment, useState, FC, memo, useMemo } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { useUI } from '@components/ui'
import { City } from '@commerce/types/cities'

const ChooseCityDropDown: FC = () => {
  const { cities, activeCity, setActiveCity } = useUI()

  const chosenCity = useMemo(() => {
    if (activeCity) {
      return activeCity
    }
    if (cities) return cities[0]
    return null
  }, [cities, activeCity])

  return (
    <Menu as="div" className="relative inline-block text-left">
      {({ open }) => (
        <>
          <div>
            <Menu.Button className="bg-white focus:outline-none font-medium inline-flex justify-center outline-none px-4 py-2 text-secondary text-sm w-full">
              {chosenCity?.name}
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
              className="absolute bg-white divide-gray-100 divide-y focus:outline-none mt-2 origin-top-right right-0 ring-1 ring-black ring-opacity-5 rounded-2xl shadow-lg top-0 z-20"
            >
              <Menu.Item>
                {({ active }) => (
                  <span className="text-secondary block px-4 py-2 text-sm">
                    Ваш город
                  </span>
                )}
              </Menu.Item>
              {cities?.map((item: City) => (
                <Menu.Item key={item.id}>
                  <span
                    onClick={() => setActiveCity(item)}
                    className={`block px-4 py-2 text-sm cursor-pointer ${
                      chosenCity.id == item.id
                        ? 'bg-secondary text-white'
                        : 'text-secondary'
                    }`}
                  >
                    {item.name}
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
