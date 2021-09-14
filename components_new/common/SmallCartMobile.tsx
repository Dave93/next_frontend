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

const { publicRuntimeConfig } = getConfig()
let webAddress = publicRuntimeConfig.apiUrl
axios.defaults.withCredentials = true

const SmallCartMobile: FC = () => {
  const { t: tr } = useTranslation('common')
  let cartId: string | null = null
  if (typeof window !== undefined) {
    cartId = localStorage.getItem('basketId')
  }

  const { data, isLoading, isEmpty, mutate } = useCart({
    cartId,
  })
  const onSubmit = (data: Object) => console.log(JSON.stringify(data))

  const router = useRouter()

  const goToCheckout = (e: any) => {
    e.preventDefault()
    router.push('/order/')
  }

  return (
    <button
      className="md:hidden fixed outline-none focus:outline-none top-1/2 right-4 divide-x flex w-20 px-2 bg-red-700 h-12 items-center justify-around rounded-full"
      onClick={goToCheckout}
    >
      <div className="flex">
        <Image src="/mobile_cart.png" width="20" height="20" />
      </div>
      <div className="text-xl pl-2 text-white">
        {data && data.lineItems.length}
      </div>
    </button>
  )
}

export default memo(SmallCartMobile)
