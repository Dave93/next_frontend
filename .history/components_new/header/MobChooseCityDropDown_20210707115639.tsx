import React, { Fragment, useState, FC, memo } from 'react'
import { Menu, Transition } from '@headlessui/react'
import Image from 'next/image'
import Link from 'next/link'
import { XIcon } from '@heroicons/react/outline'

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
      active: true,
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
    <Menu as="div" className="relative inline-block text-left">
      {({ open }) => (
        <>
          <div>
            <Menu.Button className="focus:outline-none font-medium inline-flex justify-center outline-none px-4 py-2 text-white text-sm w-full">
              <div className="flex items-center">
                <Image src="/assets/location.png" width="14" height="16" />
                <div className="ml-2 text-xl">Ваш город</div>
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
              className="absolute bg-white divide-gray-100 divide-y focus:outline-none mt-2 origin-top-right right-0 ring-1 ring-black ring-opacity-5 rounded-2xl shadow-lg top-0 z-20"
            >
              <div className="flex justify-between items-center mt-10">
                <div className="w-32 md:w-48 ml-4 md:ml-0">
                  <Link href="/" prefetch={false}>
                    <a className="flex">
                      <Image
                        src="/assets/footer_logo.png"
                        width="188"
                        height="68"
                      />
                    </a>
                  </Link>
                </div>
                <div>
                  <XIcon
                    className="cursor-pointer h-5 w-5 text-white mr-4"
                    onClick={() => setMobMenuOpen(false)}
                  />
                </div>
              </div>
              {cities.map((item) => (
                <Menu.Item key={item.id}>
                  <span
                    onClick={() => setActive(item.id)}
                    className={`block px-4 py-2 text-sm cursor-pointer ${
                      item.active ? 'bg-secondary text-white' : 'text-secondary'
                    }`}
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
