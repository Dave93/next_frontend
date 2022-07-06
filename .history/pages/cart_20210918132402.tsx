import { FC, memo, useState } from 'react'
import useCart from '@framework/cart/use-cart'
import { useForm } from 'react-hook-form'
import Image from 'next/image'
import { XIcon, MinusIcon, PlusIcon } from '@heroicons/react/solid'
import currency from 'currency.js'
import axios from 'axios'
import Cookies from 'js-cookie'
import getConfig from 'next/config'
import { useRouter } from 'next/router'
import useTranslation from 'next-translate/useTranslation'
import Hashids from 'hashids'

const { publicRuntimeConfig } = getConfig()
let webAddress = publicRuntimeConfig.apiUrl
axios.defaults.withCredentials = true

type CartProps = {
  channelName: any
}

const Cart: FC<CartProps> = ({
  channelName,
}: {
  channelName: any
}) => {
  return (
    <>asd</>
  )
}

export default memo(Cart)
