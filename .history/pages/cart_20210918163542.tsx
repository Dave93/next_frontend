import type { GetServerSidePropsContext } from 'next'
import commerce from '@lib/api/commerce'
import { Layout } from '@components/common'
import useCart from '@framework/cart/use-cart'
import Image from 'next/image'
import { XIcon, MinusIcon, PlusIcon, TrashIcon } from '@heroicons/react/solid'
import { useForm } from 'react-hook-form'
import useTranslation from 'next-translate/useTranslation'
import getConfig from 'next/config'
import { useRouter } from 'next/router'
import { useState } from 'react'
import Hashids from 'hashids'
import axios from 'axios'
import Cookies from 'js-cookie'

export async function getServerSideProps({
  preview,
  locale,
  locales,
}: GetServerSidePropsContext) {
  const config = { locale, locales }
  const productsPromise = commerce.getAllProducts({
    variables: { first: 6 },
    config,
    preview,
    // Saleor provider only
    ...({ featured: true } as any),
  })
  const pagesPromise = commerce.getAllPages({ config, preview })
  const siteInfoPromise = commerce.getSiteInfo({ config, preview })
  const { products } = await productsPromise
  const { pages } = await pagesPromise
  const { categories, brands, topMenu, footerInfoMenu, socials, cities } =
    await siteInfoPromise

  return {
    props: {
      products,
      categories,
      brands,
      pages,
      topMenu,
      footerInfoMenu,
      socials,
      cleanBackground: true,
      cities,
    },
  }
}

const { publicRuntimeConfig } = getConfig()
let webAddress = publicRuntimeConfig.apiUrl
axios.defaults.withCredentials = true

export default function Cart() {
  const { t: tr } = useTranslation('common')
  let cartId: string | null = null
  if (typeof window !== 'undefined') {
    cartId = localStorage.getItem('basketId')
  }

  const { data, isLoading, isEmpty, mutate } = useCart({
    cartId,
  })

  const [isCartLoading, setIsCartLoading] = useState(false)

  const { register, handleSubmit } = useForm()
  const onSubmit = (data: Object) => console.log(JSON.stringify(data))

  const router = useRouter()
  const { locale } = router

  const hashids = new Hashids(
    'basket',
    15,
    'abcdefghijklmnopqrstuvwxyz1234567890'
  )

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
      `${webAddress}/api/v1/basket-lines/${hashids.encode(lineId)}`
    )
    if (cartId) {
      let { data: basket } = await axios.get(
        `${webAddress}/api/baskets/${cartId}`
      )
      const basketResult = {
        id: basket.data.id,
        createdAt: '',
        currency: { code: basket.data.currency },
        taxesIncluded: basket.data.tax_total,
        lineItems: basket.data.lines,
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
      `${webAddress}/api/v1/basket-lines/${hashids.encode(line.id)}/remove`,
      {
        quantity: 1,
      }
    )

    if (cartId) {
      let { data: basket } = await axios.get(
        `${webAddress}/api/baskets/${cartId}`
      )
      const basketResult = {
        id: basket.data.id,
        createdAt: '',
        currency: { code: basket.data.currency },
        taxesIncluded: basket.data.tax_total,
        lineItems: basket.data.lines,
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
      `${webAddress}/api/v1/basket-lines/${hashids.encode(lineId)}/add`,
      {
        quantity: 1,
      }
    )

    if (cartId) {
      let { data: basket } = await axios.get(
        `${webAddress}/api/baskets/${cartId}`
      )
      const basketResult = {
        id: basket.data.id,
        createdAt: '',
        currency: { code: basket.data.currency },
        taxesIncluded: basket.data.tax_total,
        lineItems: basket.data.lines,
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
  console.log(data)
  return (
    <>
      {isCartLoading && (
        <div className="h-full w-full absolute flex items-center justify-around bg-gray-300 top-0 bg-opacity-60 left-0 rounded-[15px]">
          <svg
            className="animate-spin text-yellow h-14"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      )}
      {isEmpty && (
        <div className="flex flex-col items-center mt-2 text-center text-gray-400 text-sm">
          <Image src="/cart_empty.png" width={130} height={119} />
          <div className="w-6/12">{tr('basket_empty')}</div>
        </div>
      )}
      {!isEmpty && (
        <>
          <div className="p-10 rounded-2xl text-xl mt-5 bg-white mb-3">
            <div className="flex justify-between items-center">
              <div className="text-lg font-bold">
                {tr('basket')}{' '}
                {data?.lineItems.length > 0 && (
                  <span className="font-bold text-[18px] text-yellow">
                    ({data.lineItems.length})
                  </span>
                )}
              </div>
              {/* <div className="text-gray-400 text-sm flex cursor-pointer">
            Очистить всё <TrashIcon className=" w-5 h-5 ml-1" />
          </div> */}
            </div>
            <div className="mt-10 space-y-3">
              {data &&
                data?.lineItems.map((lineItem: any) => (
                  <div className="flex justify-between items-center border-b pb-3">
                    {console.log(lineItem)}
                    <div className="flex">
                      <Image
                        src={
                          lineItem?.variant?.product?.assets?.length
                            ? `${webAddress}/storage/${lineItem?.variant?.product?.assets[0]?.location}/${lineItem?.variant?.product?.assets[0]?.filename}`
                            : '/no_photo.svg'
                        }
                        width="70"
                        height="70"
                      />
                      <div className="ml-7 space-y-2">
                        <div className="text-xl font-bold">Пепперони</div>
                        <div className="text-xs text-gray-400">
                          Средняя 32 см, Традиционное тесто
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-10 items-center">
                      <div className="w-20 h-6 ml-1 bg-yellow rounded-full flex items-center text-white">
                        <div className="w-6 h-6 items-center flex justify-around">
                          <MinusIcon
                            className="cursor-pointer w-5 h-5"
                            onClick={() => ''}
                          />
                        </div>
                        <div className="flex-grow text-center">{1}</div>
                        <div className="w-6 h-6 items-center flex justify-around">
                          <PlusIcon
                            className="cursor-pointer w-5 h-5"
                            onClick={() => ''}
                          />
                        </div>
                      </div>
                      <div>36 000 сўм</div>
                      <XIcon
                        className="cursor-pointer h-4 text-black w-4"
                        onClick={() => ''}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
          <div className="p-10 rounded-2xl bg-white">
            <div className="border-b flex items-center justify-between pb-10">
              <div className="w-72">
                <form onSubmit={handleSubmit(onSubmit)} className="relative">
                  <input
                    type="text"
                    placeholder={tr('promocode')}
                    {...register('discount_code')}
                    className="bg-gray-100 focus:outline-none outline-none px-5 py-2 rounded-full text-lg w-full"
                  />
                  <button className="absolute focus:outline-none outline-none right-1 top-1">
                    <Image src="/discount_arrow.png" width={37} height={37} />
                  </button>
                </form>
              </div>
              <div className="flex items-center font-bold">
                <div className="text-lg text-gray-400">Сумма заказа:</div>
                <div className="ml-7 text-3xl">108 000 сум</div>
              </div>
            </div>
            <div className="md:flex justify-between mt-8 space-y-2 md:space-y-0">
              <button className="md:text-xl text-gray-400 bg-gray-200 flex h-12 items-center justify-between px-12 rounded-full md:w-80 w-full">
                <img src="/left.png" /> {tr('back_to_menu')}
              </button>
              <button
                className={`md:text-xl text-white bg-yellow flex h-12 items-center justify-evenly rounded-full md:w-80 w-full`}
              >
                {tr('checkout')} <img src="/right.png" />
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}

Cart.Layout = Layout
