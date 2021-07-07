import React, { Fragment, FC, memo, useState } from 'react'
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

  const [closeModal, setCloseModal] = useState(false)

  return (
    <Menu as="div" className="relative inline-block text-left">
      {({ open }) => (
        <>
          <div>
            <Menu.Button className="focus:outline-none font-medium inline-flex justify-center outline-none px-4 py-2 text-white text-sm w-full">
              <div className="flex items-center">
                <Image src="/assets/location.png" width="14" height="16" />
                <div className="ml-2 text-xl">{!activeLabel || "Ваш город"}</div>
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
            <Menu.Items static className="text-white">
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
                    onClick={() => setCloseModal(true)}
                  />
                </div>
              </div>
              {cities.map((item) => (
                <Menu.Item key={item.id}>
                  <span
                    onClick={() => setActive(item.id)}
                    className={`block px-4 py-2 text-sm cursor-pointer`}
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
