'use client'

import { FC, memo } from 'react'
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from '@headlessui/react'
import { Ru, Uz, Us } from 'react-flags-select'
import Cookies from 'js-cookie'
import { useLocale } from 'next-intl'

const flagComponents = {
  ru: Ru,
  uz: Uz,
  en: Us,
} as const

const localeLabel: Record<'ru' | 'uz' | 'en', string> = {
  ru: 'Ru',
  uz: 'Uz',
  en: 'En',
}

type Locale = 'ru' | 'uz' | 'en'

const LanguageDropDownApp: FC = () => {
  const locale = useLocale() as Locale
  const FlagComponent = flagComponents[locale]

  const changeLang = (e: React.MouseEvent, loc: Locale) => {
    e.preventDefault()
    Cookies.set('NEXT_LOCALE', loc, { expires: 365 })
    window.location.reload()
  }

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <MenuButton className="inline-flex justify-center w-full px-4 py-2 text-lg font-medium text-secondary bg-white rounded-md hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 items-center">
          <FlagComponent />
          <span className="ml-1.5">{localeLabel[locale]}</span>
        </MenuButton>
      </div>
      <Transition
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <MenuItems className="absolute right-0 z-10 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-1 py-1">
            {(['uz', 'ru', 'en'] as Locale[]).map((loc) => {
              const Flag = flagComponents[loc]
              return (
                <MenuItem key={loc}>
                  <a
                    className="text-gray-900 hover:text-primary group flex rounded-md items-center w-full px-2 py-2 text-lg"
                    href="#"
                    onClick={(e) => changeLang(e, loc)}
                  >
                    <Flag /> <span className="ml-2">{localeLabel[loc]}</span>
                  </a>
                </MenuItem>
              )
            })}
          </div>
        </MenuItems>
      </Transition>
    </Menu>
  )
}

export default memo(LanguageDropDownApp)
