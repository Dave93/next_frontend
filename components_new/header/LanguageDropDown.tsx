import { Fragment, FC, memo } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { Ru, Uz, Us } from 'react-flags-select'
import { useRouter } from 'next/router'
import { useUI } from '@components/ui/context'

const locales = {
  ru: Ru,
  uz: Uz,
  en: Us,
}

const localeLabel = {
  ru: 'Ru',
  uz: 'Uz',
  en: 'En',
}

const LanguageDropDown: FC = () => {
  const router = useRouter()
  const { locale, pathname, query } = router
  const keyTyped = locale as keyof typeof locales
  const keyTypedLabel = locale as keyof typeof locales
  const localeComponent = locales[keyTyped]({})
  const { activeCity } = useUI()

  const changeLang = (e: any, loc: string | undefined) => {
    e.preventDefault()
    let link = pathname
    Object.keys(query).map((k: string) => {
      if (k == 'city') {
        link = link.replace('[city]', activeCity.slug)
      } else {
        link = link.replace(`[${k}]`, query[k]!.toString())
      }
    })
    return router.push(link, link, {
      locale: loc,
    })
  }
  return (
    //dropdown menu
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex justify-center w-full px-4 py-2 text-lg font-medium text-secondary bg-white rounded-md hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 items-center">
          {localeComponent}{' '}
          <span className="ml-1.5">{localeLabel[keyTypedLabel]}</span>
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-1 py-1 ">
            <Menu.Item>
              {({ active }) => (
                <a
                  className={`${active ? 'text-primary' : 'text-gray-900'
                    } group flex rounded-md items-center w-full px-2 py-2 text-lg`}
                  href={`/${locale}${pathname}`}
                  onClick={(e) => changeLang(e, 'uz')}
                >
                  <Uz /> <span className="ml-2">Uz</span>
                </a>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <a
                  className={`${active ? 'text-primary' : 'text-gray-900'
                    } group flex rounded-md items-center w-full px-2 py-2 text-lg`}
                  href={`/${locale}${pathname}`}
                  onClick={(e) => changeLang(e, 'ru')}
                >
                  <Ru /> <span className="ml-2">Ru</span>
                </a>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <a
                  className={`${active ? 'text-primary' : 'text-gray-900'
                    } group flex rounded-md items-center w-full px-2 py-2 text-lg`}
                  href={`/${locale}${pathname}`}
                  onClick={(e) => changeLang(e, 'en')}
                >
                  <Us /> <span className="ml-2">En</span>
                </a>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}

export default memo(LanguageDropDown)
