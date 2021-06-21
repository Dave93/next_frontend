import cn from 'classnames'
import React, { FC } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { CommerceProvider } from '@framework'
import { useUI } from '@components/ui/context'
import type { Page } from '@commerce/types/page'
import { Navbar, Footer } from '@components/common'
import type { Category } from '@commerce/types/site'
import type { LinkItem } from '@commerce/types/headerMenu'
import ShippingView from '@components/checkout/ShippingView'
import CartSidebarView from '@components/cart/CartSidebarView'
import { useAcceptCookies } from '@lib/hooks/useAcceptCookies'
import { Sidebar, Button, Modal, LoadingDots } from '@components/ui'
import PaymentMethodView from '@components/checkout/PaymentMethodView'
import CheckoutSidebarView from '@components/checkout/CheckoutSidebarView'

import LoginView from '@components/auth/LoginView'
import styles from './Layout.module.css'
import Header from '@components_new/Header'
import Image from 'next/image'
import Link from 'next/link'
import {
  faFacebook,
  faInstagram,
  faTelegram,
} from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { SocialIcons } from '@commerce/types/socialIcons'

const Loading = () => (
  <div className="w-80 h-80 flex items-center text-center justify-center p-3">
    <LoadingDots />
  </div>
)

const dynamicProps = {
  loading: () => <Loading />,
}

const SignUpView = dynamic(
  () => import('@components/auth/SignUpView'),
  dynamicProps
)

const ForgotPassword = dynamic(
  () => import('@components/auth/ForgotPassword'),
  dynamicProps
)

const FeatureBar = dynamic(
  () => import('@components/common/FeatureBar'),
  dynamicProps
)

interface Props {
  pageProps: {
    pages?: Page[]
    categories: LinkItem[]
    topMenu: LinkItem[]
    footerInfoMenu: LinkItem[]
    socials: SocialIcons[]
  }
}

const ModalView: FC<{ modalView: string; closeModal(): any }> = ({
  modalView,
  closeModal,
}) => {
  return (
    <Modal onClose={closeModal}>
      {modalView === 'LOGIN_VIEW' && <LoginView />}
      {modalView === 'SIGNUP_VIEW' && <SignUpView />}
      {modalView === 'FORGOT_VIEW' && <ForgotPassword />}
    </Modal>
  )
}

const ModalUI: FC = () => {
  const { displayModal, closeModal, modalView } = useUI()
  return displayModal ? (
    <ModalView modalView={modalView} closeModal={closeModal} />
  ) : null
}

const SidebarView: FC<{ sidebarView: string; closeSidebar(): any }> = ({
  sidebarView,
  closeSidebar,
}) => {
  return (
    <Sidebar onClose={closeSidebar}>
      {sidebarView === 'CART_VIEW' && <CartSidebarView />}
      {sidebarView === 'CHECKOUT_VIEW' && <CheckoutSidebarView />}
      {sidebarView === 'PAYMENT_VIEW' && <PaymentMethodView />}
      {sidebarView === 'SHIPPING_VIEW' && <ShippingView />}
    </Sidebar>
  )
}

const SidebarUI: FC = () => {
  const { displaySidebar, closeSidebar, sidebarView } = useUI()
  return displaySidebar ? (
    <SidebarView sidebarView={sidebarView} closeSidebar={closeSidebar} />
  ) : null
}

const socIcons = {
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
  const { acceptedCookies, onAcceptCookies } = useAcceptCookies()
  const { locale = 'ru' } = useRouter()
  console.log(footerInfoMenu)

  return (
    <CommerceProvider locale={locale}>
      <div className="font-sans">
        <div className="flex flex-col h-screen">
          <Header menu={topMenu} />
          <main className="flex-grow">{children}</main>
          <footer className="text-white">
            <Image src="/assets/footer_weave.png" width={1920} height={40} />
            <div className="bg-secondary w-full pt-5 pb-2">
              <div className="container mx-auto my-6">
                <div className="border-b flex justify-between mb-5 pb-10">
                  <div className="w-1/5">
                    <div>
                      <Image
                        src="/assets/footer_logo.png"
                        width={188}
                        height={68}
                      />
                    </div>
                    <span className="block mt-7 text-xl">
                      Пицца, которая объединяет
                    </span>
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-center">
                      <div className="mr-24">
                        <span className="block font-bold mb-3 text-[16px]">
                          Меню
                        </span>
                        <ul className="ml-3">
                          {categories.map((item) => (
                            <li
                              key={item.href}
                              className={styles.footerMenuListItem}
                            >
                              <Link href={item.href} prefetch={false}>
                                <a>{item.label[locale]}</a>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="block font-bold mb-3 text-[16px]">
                          Информация
                        </span>
                        <ul className="ml-3">
                          {footerInfoMenu.map((item) => (
                            <li
                              key={item.href}
                              className={styles.footerMenuListItem}
                            >
                              <Link href={item.href} prefetch={false}>
                                <a>{item.label[locale]}</a>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm leading-7">
                    <div>Телефон доставки</div>
                    <div className="text-[30px] font-bold">71 205 11 11</div>
                    <div>
                      График работы <br /> с 10-00 до 23-00 Ежедневно
                    </div>
                    <div className="mt-4">
                      <span>Подписывайтесь на нас:</span>
                      <ul className="flex justify-end text-4xl">
                        {socials.map((soc) => (
                          <li key={soc.code} className="mx-1">
                            <a
                              target="_blank"
                              className="no-underline text-white"
                            >
                              <FontAwesomeIcon icon={socIcons[soc.code]} />
                            </a>
                          </li>
                        ))}
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
