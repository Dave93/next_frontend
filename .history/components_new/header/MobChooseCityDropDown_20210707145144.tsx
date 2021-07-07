import React, { Fragment, FC, memo, useState } from 'react'
import { Menu, Transition } from '@headlessui/react'
import Image from 'next/image'

interface City {
  id: string
  label: string
  active: boolean
}

const ChooseCityDropDown: FC = () => {
  const [cities, setCities] = useState<City[]>([
    {
      id: 'tash',
      label: 'Ташкент',
      active: false,
    },
    {
      id: 'ferg',
      label: 'Фергана',
      active: false,
    },
    {
      id: 'sam',
      label: 'Самарканд',
      active: false,
    },
  ])

  const activeLabel = cities.find((item) => item.active)?.label

  const setActive = (id: string) => {
    setCities(
      cities.map((item) => {
        if (item.id == id) {
          item.active = true
        } else {
          item.active = false
        }
        return item
      })
    )
  }

  return (
    <Menu as="div">
      {({ open }) => (
        <>
          <div className={`${open ? 'hidden' : ''}`}>
            <Menu.Button className="focus:outline-none font-medium justify-center outline-none px-4 py-2 text-white text-sm w-full">
              <div className="flex items-center">
                <Image src="/assets/location.png" width="14" height="16" className="mr-3"/>
                <div className="ml-2 text-xl">
                  {!activeLabel ? 'Ваш город' : activeLabel}
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
              {cities.map((item) => (
                <Menu.Item key={item.id}>
                  <span
                    onClick={() => setActive(item.id)}
                    className={`block px-4 py-2 cursor-pointer text-xl ml-12`}
                  >
                    {item.label}
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
