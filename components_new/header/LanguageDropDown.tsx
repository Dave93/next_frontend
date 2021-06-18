import { Fragment, FC, memo } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { Ru, Uz } from 'react-flags-select'
import { useRouter } from 'next/router'
import Link from 'next/link'

const locales = {
  ru: Ru,
  uz: Uz,
}

const localeLabel = {
  ru: 'Ru',
  uz: 'Uz',
}

const LanguageDropDown: FC = () => {
  const router = useRouter()
  const { locale, pathname } = router
  const localeComponent = locales[locale]()

  return (
    <Menu as="div" className="relative inline-block text-left">
      {({ open }) => (
        <>
          <div>
            <Menu.Button className="bg-white focus:outline-none font-medium inline-flex justify-center outline-none px-4 py-2 text-secondary text-sm w-full">
              {localeComponent}{' '}
              <span className="ml-1.5">{localeLabel[locale]}</span>
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
              className="absolute overflow-hidden bg-white divide-gray-100 divide-y focus:outline-none mt-2 origin-top-right right-0 ring-1 ring-black ring-opacity-5 rounded-2xl shadow-lg top-0 z-20"
            >
              {Object.keys(locales).map((langKey) => (
                <Menu.Item key={langKey}>
                  <Link href={pathname} locale={langKey} scroll={false}>
                    <a className="px-4 py-2 text-sm text-secondary hover:bg-secondary hover:text-white flex items-center no-underline">
                      {locales[langKey]()}{' '}
                      <span className="ml-1.5">{localeLabel[langKey]}</span>
                    </a>
                  </Link>
                </Menu.Item>
              ))}
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  )
}

export default memo(LanguageDropDown)
