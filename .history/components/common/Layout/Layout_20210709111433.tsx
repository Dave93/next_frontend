import cn from 'classnames'
import React, { FC } from 'react'
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
import {
  faFacebook,
  faInstagram,
  faTelegram,
  IconDefinition,
} from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { SocialIcons } from '@commerce/types/socialIcons'

interface Props {
  pageProps: {
    pages?: Page[]
    categories: LinkItem[]
    topMenu: APILinkItem[]
    footerInfoMenu: APILinkItem[]
    socials: SocialIcons[]
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
    ...pageProps
  },
}) => {
  const { locale = 'ru', pathname } = useRouter()

  return (
    <CommerceProvider locale={locale}>
      <div className="font-sans">
        <div className="md:flex md:flex-col h-screen">
          <Header menu={topMenu} />
          <main className="flex-grow">
            {pathname == '/' ? (
              children
            ) : (
              <div className="container mx-auto">{children}</div>
            )}
          </main>
          <footer className="text-white md:flex flex-col md:mt-14">
            <Image src="/assets/footer_weave.png" width={1920} height={40} />
            <div className="bg-secondary w-full pt-5 pb-2 px-4 md:px-0">
              <div className="container mx-auto my-6">
                <div className="border-b md:flex justify-between mb-5 pb-10">
                  <div className="md:w-1/5">
                    <div className="hidden md:flex">
                      <Image
                        src="/assets/footer_logo.png"
                        width={188}
                        height={68}
                      />
                    </div>
                    <div className="md:hidden border-b border-blue-600">
                      <div>Телефон доставки</div>
                      <div className="text-[30px] font-bold">71 205 11 11</div>
                    </div>
                    <span className="md:block mt-7 text-xl hidden">
                      Пицца, которая объединяет
                    </span>
                  </div>
                  <div className="flex-grow">
                    <div className="md:flex justify-center">
                      <div className="mr-24 hidden md:block">
                        <span className="block font-bold mb-3 text-[16px]">
                          Меню
                        </span>
                        <ul className="ml-3">
                          {categories.map((item) => {
                            const keyTyped = locale as keyof typeof item.label
                            return (
                              <li
                                key={item.href}
                                className={styles.footerMenuListItem}
                              >
                                <Link href={item.href} prefetch={false}>
                                  <a>{item.label[keyTyped]}</a>
                                </Link>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                      <div>
                        <span className="block font-bold mb-3 text-[16px]">
                          Информация
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
                  <div className="md:text-right text-sm leading-7">
                    <div className="hidden md:block">
                      <div>Телефон доставки</div>
                      <div className="text-[30px] font-bold">71 205 11 11</div>
                    </div>
                    <div>
                      График работы <br /> с 10-00 до 23-00 Ежедневно
                    </div>
                    <div className="mt-4">
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
                <div>{new Date().getFullYear()} Все права защищены</div>
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
