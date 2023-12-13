import cn from 'classnames'
import React, { FC, ReactNode, useEffect, useMemo, useState } from 'react'
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
const { publicRuntimeConfig } = getConfig()

interface Props {
  children: ReactNode
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

const NotFoundLayout: FC<Props> = ({
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

  return <CommerceProvider locale={locale}>{children}</CommerceProvider>
}

export default NotFoundLayout
