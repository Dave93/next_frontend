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
    if (loc === locale) return
    Cookies.set('NEXT_LOCALE', loc, { expires: 365, path: '/' })

    // Build the next URL ourselves and do a real navigation:
    // - next-intl's router.replace({locale: 'ru'}) was producing /ru/...
    //   even though ru is the default locale and per i18n/routing.ts
    //   localePrefix='as-needed' it must NOT carry a prefix → 404.
    // - Soft navigation also leaves the SSR HTML intact, so the page
    //   stays in the old language until the user reloads.
    // A hard navigation forces a fresh server render in the new locale.
    const current = window.location.pathname
    const stripped = current.replace(/^\/(uz|en)(?=\/|$)/, '') || '/'
    const nextPath =
      loc === 'ru'
        ? stripped
        : `/${loc}${stripped === '/' ? '' : stripped}`
    window.location.assign(
      nextPath + window.location.search + window.location.hash
    )
  }

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <MenuButton className="inline-flex justify-center h-10 px-3 text-sm md:text-lg font-medium text-secondary bg-white rounded-md hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 items-center gap-1.5">
          <FlagComponent />
          <span>{localeLabel[locale]}</span>
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
