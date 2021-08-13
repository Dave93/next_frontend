import cn from 'classnames'
import React, { FC, useEffect, useState } from 'react'
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
const { publicRuntimeConfig } = getConfig()

interface Props {
  pageProps: {
    pages?: Page[]
    categories: any[]
    topMenu: APILinkItem[]
    footerInfoMenu: APILinkItem[]
    socials: SocialIcons[]
    cleanBackground?: boolean
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
    cleanBackground = false,
    ...pageProps
  },
}) => {
  const { locale = 'ru', pathname } = useRouter()
  const { t: tr } = useTranslation('common')

  const [configData, setConfigData] = useState({} as any)
  
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

  useEffect(() => {
    fetchConfig()
    return
  }, [])


  return (
    <CommerceProvider locale={locale}>
      <div className="font-sans">
        <div className="md:flex md:flex-col h-screen">
          <Header menu={topMenu} />
          <main
            className={`${
              cleanBackground == true ? 'bg-gray-200' : ''
            } flex-grow md:pb-14`}
          >
            {pathname == '/' ? (
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
              <Image src="/assets/uzor.png" width={450} height={30} />
            </div>
            <div className="bg-secondary w-full pt-5 pb-2 px-4 md:px-0">
              <div className="container mx-auto md:my-6">
                <div className="md:border-b md:flex justify-between mb-1 md:pb-10">
                  <div className="md:w-1/5">
                    <div className="hidden md:flex">
                      <Image
                        src="/assets/footer_logo.png"
                        width={188}
                        height={68}
                      />
                    </div>
                    <div className="md:hidden border-b border-blue md:border-0 pb-5">
                      <div>{tr('delivery_phone')}</div>
                      <div className="text-[30px] font-bold">
                        {configData.contact_phone}
                      </div>
                    </div>
                    <span className="md:block mt-7 text-xl hidden">
                      {tr('footer_pizza_unites')}
                    </span>
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
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                      <div>
                        <span className="block font-bold mb-3 text-[16px]">
                          {tr('information')}
                        </span>
                        <ul className="ml-3">
                          {footerInfoMenu.map((item) => {
                            const keyTyped =
                              `name_${locale}` as keyof typeof item
                            return (
                              <li
                                key={item.href}
                                className={styles.footerMenuListItem}
                              >
                                <Link href={item.href} prefetch={false}>
                                  <a>{item[keyTyped]}</a>
                                </Link>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="md:text-right text-sm leading-7 mt-5 md:mt-0">
                    <div className="hidden md:block">
                      <div>{tr('delivery_phone')}</div>
                      <div className="text-[30px] font-bold">
                        {configData.contact_phone}
                      </div>
                    </div>
                    <div className=" border-b border-blue md:border-0 pb-5 md:pb-0">
                      График работы <br /> с 10-00 до 23-00 Ежедневно
                    </div>
                    <div className="mt-4  border-b border-blue md:border-0 pb-5 md:pb-0">
                      <span>Подписывайтесь на нас:</span>
                      <ul className="flex md:justify-end text-4xl">
                        {socials.map((soc) => {
                          return (
                            <li key={soc.code} className="mx-1">
                              <a
                                target="_blank"
                                className="no-underline text-white"
                              >
                                <FontAwesomeIcon icon={socIcons[soc.code]} />
                              </a>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="mb-7 md:mb-0">
                  {new Date().getFullYear()} Все права защищены
                </div>
              </div>
            </div>
          </footer>
        </div>
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
    </CommerceProvider>
  )
}

export default Layout
