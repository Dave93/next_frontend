import cn from 'classnames'
import React, {
  FC,
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useRouter } from 'next/router'
import { CommerceProvider } from '@framework'
import type { Page } from '@commerce/types/page'
import type {
  APILinkItem,
  LinkItem,
  LinkLabel,
} from '@commerce/types/headerMenu'
import { useAcceptCookies } from '@lib/hooks/useAcceptCookies'
import styles from './Layout.module.css'
import Header from '@components_new/Header'
import Image from 'next/image'
import Link from 'next/link'
import { Link as LinkScroll } from 'react-scroll'
import { useUI } from '@components/ui'
import {
  faFacebook,
  faInstagram,
  faTelegram,
  IconDefinition,
} from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { SocialIcons } from '@commerce/types/socialIcons'
import useTranslation from 'next-translate/useTranslation'
import getConfig from 'next/config'
import axios from 'axios'
import { City } from '@commerce/types/cities'
import { parsePhoneNumber } from 'libphonenumber-js'
import { Dialog, Transition } from '@headlessui/react'
import Cookies from 'js-cookie'
import CityModal from './CityModal'
import dynamic from 'next/dynamic'
import SignInModal from '@components_new/header/SignInModal'
import { XIcon } from '@heroicons/react/solid'
import LocationTabs from '@components_new/header/LocationTabs'
import MobLocationTabs from '@components_new/header/MobLocationTabs.'

const BonusModalNoSSR = dynamic(
  () => import('@components/common/Layout/BonusModal'),
  { ssr: false }
)

const { publicRuntimeConfig } = getConfig()

interface Props {
  pageProps: {
    pages?: Page[]
    categories: any[]
    topMenu: APILinkItem[]
    footerInfoMenu: APILinkItem[]
    socials: SocialIcons[]
    cleanBackground?: boolean
    cities: City[]
    currentCity?: City
    geo: any
  }
}

interface SocIconsProps {
  [key: string]: IconDefinition
}

const socIcons: SocIconsProps = {
  fb: faFacebook,
  inst: faInstagram,
  tg: faTelegram,
}

const Layout: FC<Props> = ({
  children,
  pageProps: {
    categories = [],
    topMenu = [],
    footerInfoMenu = [],
    socials = [],
    cities = [],
    currentCity,
    cleanBackground = false,
    ...pageProps
  },
}) => {
  const { locale = 'ru', pathname, query } = useRouter()
  const { t: tr } = useTranslation('common')

  const [configData, setConfigData] = useState({} as any)

  const {
    setCitiesData,
    activeCity,
    setActiveCity,
    showLocationTabs,
    locationTabsClosable,
    closeLocationTabs,
    showMobileLocationTabs,
    closeMobileLocationTabs,
    setLocationTabsClosable,
  } = useUI()
  const cancelButtonRef = useRef(null)
  const cancelMobileButtonRef = useRef(null)

  const fetchConfig = async () => {
    let configData
    if (!sessionStorage.getItem('configData')) {
      let { data } = await axios.get(
        `${publicRuntimeConfig.apiUrl}/api/configs/public`
      )
      configData = data.data
      sessionStorage.setItem('configData', data.data)
    } else {
      configData = sessionStorage.getItem('configData')
    }

    try {
      configData = Buffer.from(configData, 'base64')
      configData = configData.toString()
      configData = JSON.parse(configData)
      setConfigData(configData)
    } catch (e) {}
  }

  // const fetchGeo = async () => {
  //   const res = await fetch('/api/geo')
  //   const json = await res.json()
  // }

  useEffect(() => {
    fetchConfig()
    setCitiesData(cities)
    document.body.className = cleanBackground ? 'bg-gray-100' : ''
    return
  }, [cleanBackground, currentCity])

  return (
    <CommerceProvider locale={locale}>
      <div className="font-sans">
        <div className="md:flex md:flex-col h-screen">
          <Header menu={topMenu} />
          <main
            className={`${
              cleanBackground == true ? 'bg-gray-100' : ''
            } flex-grow md:pb-14`}
          >
            {pathname == '/[city]' ? (
              children
            ) : (
              <div className="container mx-auto">{children}</div>
            )}
          </main>
          <footer className="text-white md:flex flex-col flex">
            <div className="hidden md:flex justify-center">
              <Image src="/assets/uzor.svg" width={1920} height={40} />
            </div>
            <div className="md:hidden flex">
              <Image
                src="/assets/uzormob.svg"
                width={1000}
                height={60}
                className="object-cover"
              />
            </div>
            <div className="bg-secondary w-full pt-5 pb-2 px-4 md:px-0">
              <div className="container mx-auto md:my-6">
                <div className="md:border-b md:flex justify-between mb-1 md:pb-10">
                  <div className="md:w-1/5">
                    <div className="hidden md:flex">
                      <Image
                        src="/assets/footer_logo.svg"
                        width={188}
                        height={68}
                      />
                    </div>
                    <div className="md:hidden border-b border-blue md:border-0 pb-5">
                      <div>{tr('delivery_phone')}</div>
                      <div className="text-[30px] font-bold">
                        {currentCity?.phone && (
                          <a
                            href={parsePhoneNumber(
                              currentCity?.phone ?? ''
                            )?.getURI()}
                          >
                            {parsePhoneNumber(currentCity?.phone ?? '')
                              ?.formatNational()
                              .substring(2)}
                          </a>
                        )}
                      </div>
                    </div>
                    <h3 className="md:block mt-7 text-xl hidden">
                      {tr('footer_pizza_unites')}
                    </h3>
                  </div>
                  <div className="flex-grow border-b border-blue md:border-0 mt-5 md:mt-0 pb-5 md:pb-0">
                    <div className="md:flex justify-center">
                      <div className="mr-24 hidden md:block">
                        <span className="block font-bold mb-3 text-[16px]">
                          {tr('menu')}
                        </span>
                        <ul className="ml-3">
                          {categories.map((item) => {
                            return (
                              <li
                                key={item.id}
                                className={styles.footerMenuListItem}
                              >
                                {pathname == '/[city]' ? (
                                  <LinkScroll
                                    to={`productSection_${item.id}`}
                                    spy={true}
                                    smooth={true}
                                    offset={-100}
                                    className="w-full cursor-pointer block"
                                  >
                                    {
                                      item?.attribute_data?.name['chopar'][
                                        locale || 'ru'
                                      ] // TODO: fix static value chopar
                                    }
                                  </LinkScroll>
                                ) : (
                                  <Link
                                    href={`/${currentCity?.slug}/#productSection_${item.id}`}
                                    prefetch={false}
                                  >
                                    {
                                      item?.attribute_data?.name['chopar'][
                                        locale || 'ru'
                                      ] // TODO: fix static value chopar
                                    }
                                  </Link>
                                )}
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                      <div>
                        {footerInfoMenu && footerInfoMenu.length > 0 && (
                          <>
                            <span className="block font-bold mb-3 text-[16px]">
                              {tr('information')}
                            </span>
                            <ul className="ml-3">
                              {footerInfoMenu.map((item) => {
                                const keyTyped =
                                  `name_${locale}` as keyof typeof item
                                let href = item.href
                                if (href.indexOf('http') < 0) {
                                  href = `/${currentCity?.slug}${item.href}`
                                }
                                return (
                                  <li
                                    key={item.href}
                                    className={styles.footerMenuListItem}
                                  >
                                    <Link href={href} prefetch={false}>
                                      <a>{item[keyTyped]}</a>
                                    </Link>
                                  </li>
                                )
                              })}
                            </ul>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="md:text-right text-sm leading-7 mt-5 md:mt-0">
                    <div className="hidden md:block">
                      <div>{tr('delivery_phone')}</div>
                      <div className="text-[30px] font-bold">
                        {currentCity?.phone && (
                          <a
                            href={parsePhoneNumber(
                              currentCity?.phone ?? ''
                            )?.getURI()}
                          >
                            {parsePhoneNumber(currentCity?.phone ?? '')
                              ?.formatNational()
                              .substring(2)}
                          </a>
                        )}
                      </div>
                    </div>
                    <div className=" border-b border-blue md:border-0 pb-5 md:pb-0">
                      {tr('work_time')} <br />{' '}
                      {locale == 'uz'
                        ? configData.workTimeUz
                        : configData.workTimeRu}
                    </div>
                    <div className="mt-4  border-b border-blue md:border-0 pb-5 md:pb-0">
                      <span>{tr('follow_us')}</span>
                      <ul className="flex md:justify-end text-4xl">
                        {socials.map((soc) => {
                          return (
                            <li key={soc.code} className="mx-1">
                              <a
                                target="_blank"
                                className="no-underline text-white"
                                href={soc.link}
                              >
                                <FontAwesomeIcon
                                  icon={socIcons[soc.code]}
                                  className="w-10 h-10"
                                />
                              </a>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="mb-7 md:mb-0">
                  {new Date().getFullYear()} {tr('all_rights_reserved')}
                </div>
              </div>
            </div>
          </footer>
        </div>

        <BonusModalNoSSR />
        <SignInModal />
      </div>
      <div className={cn(styles.root)}>
        {/* <Navbar links={navBarlinks} />
        <main className="fit">{children}</main>
        <Footer pages={pageProps.pages} />
        <ModalUI />
        <SidebarUI />
        <FeatureBar
          title="This site uses cookies to improve your experience. By clicking, you agree to our Privacy Policy."
          hide={acceptedCookies}
          action={
            <Button className="mx-5" onClick={() => onAcceptCookies()}>
              Accept cookies
            </Button>
          }
        /> */}
      </div>
      <Transition.Root show={showLocationTabs} as={Fragment}>
        <Dialog
          as="div"
          static
          className="fixed z-10 inset-0 overflow-y-auto"
          initialFocus={cancelButtonRef}
          open={showLocationTabs}
          onClose={() => {
            if (locationTabsClosable) closeLocationTabs()
          }}
        >
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <div
                className="inline-block align-bottom bg-white p-5 rounded-lg text-left shadow-xl transform transition-all sm:my-8 sm:align-middle container sm:w-full"
                ref={cancelButtonRef}
              >
                {locationTabsClosable && (
                  <button
                    className="absolute focus:outline-none outline-none -right-10 top-2"
                    onClick={() => {
                      setLocationTabsClosable(false)
                      closeLocationTabs()
                    }}
                  >
                    <XIcon className="cursor-pointer h-7 text-white w-7" />
                  </button>
                )}
                <LocationTabs />
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
      <Transition.Root show={showMobileLocationTabs} as={Fragment}>
        <Dialog
          as="div"
          static
          className="fixed z-10 inset-0 overflow-y-auto"
          initialFocus={cancelMobileButtonRef}
          open={showMobileLocationTabs}
          onClose={() => {
            if (locationTabsClosable) closeMobileLocationTabs()
          }}
        >
          <div className="flex items-end justify-center min-h-screen  text-center sm:block sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <div
                className="bg-white p-4 text-left transform h-screen overflow-y-auto w-full overflow-hidden z-50"
                ref={cancelMobileButtonRef}
              >
                <MobLocationTabs />
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </CommerceProvider>
  )
}

export default Layout
