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

  const [isCartLoading, setIsCartLoading] = useState(false)

  const { register, handleSubmit } = useForm()
  const onSubmit = (data: Object) => console.log(JSON.stringify(data))

  const router = useRouter()

  const setCredentials = async () => {
    let csrf = Cookies.get('X-XSRF-TOKEN')
    if (!csrf) {
      const csrfReq = await axios(`${webAddress}/api/keldi`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          crossDomain: true,
        },
        withCredentials: true,
      })
      let { data: res } = csrfReq
      csrf = Buffer.from(res.result, 'base64').toString('ascii')

      Cookies.set('X-XSRF-TOKEN', csrf)
    }
    axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrf
    axios.defaults.headers.common['XCSRF-TOKEN'] = csrf
  }

  const destroyLine = async (lineId: string) => {
    setIsCartLoading(true)
    await setCredentials()
    const { data } = await axios.delete(
      `${webAddress}/api/v1/basket-lines/${lineId}`
    )
    if (cartId) {
      let { data: basket } = await axios.get(
        `${webAddress}/api/v1/baskets/${cartId}`
      )
      const basketResult = {
        id: basket.data.id,
        createdAt: '',
        currency: { code: basket.data.currency },
        taxesIncluded: basket.data.tax_total,
        lineItems: basket.data.lines.data,
        lineItemsSubtotalPrice: basket.data.sub_total,
        subtotalPrice: basket.data.sub_total,
        totalPrice: basket.data.total,
      }

      await mutate(basketResult, false)
      setIsCartLoading(false)
    }
  }

  const decreaseQuantity = async (line: any) => {
    if (line.quantity == 1) {
      return
    }
    setIsCartLoading(true)
    await setCredentials()
    const { data: basket } = await axios.put(
      `${webAddress}/api/v1/basket-lines/${line.id}/remove`,
      {
        quantity: 1,
      }
    )

    if (cartId) {
      let { data: basket } = await axios.get(
        `${webAddress}/api/v1/baskets/${cartId}`
      )
      const basketResult = {
        id: basket.data.id,
        createdAt: '',
        currency: { code: basket.data.currency },
        taxesIncluded: basket.data.tax_total,
        lineItems: basket.data.lines.data,
        lineItemsSubtotalPrice: basket.data.sub_total,
        subtotalPrice: basket.data.sub_total,
        totalPrice: basket.data.total,
      }

      await mutate(basketResult, false)
      setIsCartLoading(false)
    }
  }

  const increaseQuantity = async (lineId: string) => {
    setIsCartLoading(true)
    await setCredentials()
    const { data: basket } = await axios.post(
      `${webAddress}/api/v1/basket-lines/${lineId}/add`,
      {
        quantity: 1,
      }
    )

    if (cartId) {
      let { data: basket } = await axios.get(
        `${webAddress}/api/v1/baskets/${cartId}`
      )
      const basketResult = {
        id: basket.data.id,
        createdAt: '',
        currency: { code: basket.data.currency },
        taxesIncluded: basket.data.tax_total,
        lineItems: basket.data.lines.data,
        lineItemsSubtotalPrice: basket.data.sub_total,
        subtotalPrice: basket.data.sub_total,
        totalPrice: basket.data.total,
      }

      await mutate(basketResult, false)
      setIsCartLoading(false)
    }
  }

  const goToCheckout = (e: any) => {
    e.preventDefault()
    router.push('/order/')
  }

  return (
    <div className="md:hidden fixed top-1/2 right-4 divide-x flex w-20 px-2 bg-red-700 h-12 items-center justify-around rounded-full">
      <div className="flex">
        <Image src="/mobile_cart.png" width="20" height="20" />
      </div>
      <div className="text-xl pl-2 text-white">
        {data && data.lineItems.length}
      </div>
    </div>
  )
}

export default memo(SmallCartMobile)
