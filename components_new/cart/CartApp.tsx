// @ts-nocheck
// DONE_WITH_CONCERNS: complex cart page with SWR, Hashids, react-slick, currency, useUI – ts-nocheck applied
'use client'

import { createRef, useEffect, useMemo, useState } from 'react'
import useCart from '@framework/cart/use-cart'
import { XIcon, MinusIcon, PlusIcon, TrashIcon } from '@heroicons/react/solid'
import { useForm } from 'react-hook-form'
import { useLocale } from 'next-intl'
import { useRouter } from '../../i18n/navigation'
import Hashids from 'hashids'
import axios from 'axios'
import Cookies from 'js-cookie'
import defaultChannel from '@lib/defaultChannel'
import currency from 'currency.js'
import getAssetUrl from '@utils/getAssetUrl'
import { useUI } from '@components/ui/context'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import { trackCheckoutStarted, trackCartViewed, trackRemoveFromCart } from '@lib/posthog-events'
import MobileOrdersApp from '../order/MobileOrdersApp'

let webAddress = process.env.NEXT_PUBLIC_API_URL
axios.defaults.withCredentials = true

interface CartAppProps {
  products?: any[]
}

export default function CartApp({ products }: CartAppProps) {
  const [channelName, setChannelName] = useState('chopar')
  const [biRecommendations, setBiRecommendations] = useState({
    relatedItems: [],
    topItems: [],
  })
  const [isLoadingBiRecommendations, setIsLoadingBiRecommendations] =
    useState(false)
  const [defaultIndex, setDefaultIndex] = useState(1)
  const sliderRef = createRef<any>()

  const getChannel = async () => {
    const channelData = await defaultChannel()
    setChannelName(channelData.name)
  }

  const { activeCity, locationData, user, openSignInModal } = useUI()
  useEffect(() => {
    getChannel()
  }, [])

  const locale = useLocale()
  const cartId = typeof window !== 'undefined' ? localStorage.getItem('basketId') : null

  const { data, isLoading, isEmpty, mutate } = useCart()

  const [isCartLoading, setIsCartLoading] = useState(false)
  const [loadingLineId, setLoadingLineId] = useState<string | null>(null)
  const [addingItemId, setAddingItemId] = useState<number | null>(null)

  const { register, handleSubmit } = useForm()
  const onSubmit = (data: Object) => console.log(JSON.stringify(data))

  const router = useRouter()

  const hashids = new Hashids(
    'basket',
    15,
    'abcdefghijklmnopqrstuvwxyz1234567890'
  )
  const [configData, setConfigData] = useState({} as any)

  const fetchConfig = async () => {
    let configData
    if (!sessionStorage.getItem('configData')) {
      let { data } = await axios.get(`${webAddress}/api/configs/public`)
      configData = data.data
      sessionStorage.setItem('configData', data.data)
    } else {
      configData = sessionStorage.getItem('configData')
    }

    try {
      configData = Buffer.from(configData, 'base64')
      configData = configData.toString('ascii')
      configData = JSON.parse(configData)
      setConfigData(configData)
    } catch (e) {}
  }

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

      var inTenMinutes = new Date(new Date().getTime() + 10 * 60 * 1000)
      Cookies.set('X-XSRF-TOKEN', csrf, {
        expires: inTenMinutes,
      })
    }
    axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrf
    axios.defaults.headers.common['XCSRF-TOKEN'] = csrf
  }

  const destroyLine = async (lineId: string) => {
    setLoadingLineId(lineId)

    const itemBeingRemoved = data?.lineItems?.find((l: any) => l.id == lineId)

    await setCredentials()
    const { data: deleteResult } = await axios.delete(
      `${webAddress}/api/basket-lines/${hashids.encode(lineId)}`
    )
    if (cartId) {
      let additionalQuery = ''
      if (locationData && locationData.deliveryType == 'pickup') {
        additionalQuery = `?delivery_type=pickup`
      }
      let { data: basket } = await axios.get(
        `${webAddress}/api/baskets/${cartId}${additionalQuery}`
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
        discountTotal: basket.data.discount_total,
        discountValue: basket.data.discount_value,
      }

      await mutate(basketResult, false)

      trackRemoveFromCart({
        product_id: itemBeingRemoved?.variant?.product_id || lineId,
        product_name: itemBeingRemoved?.variant?.name || '',
        cart_total: basketResult.totalPrice / 100,
        cart_items_count: basketResult.lineItems.length,
      })

      setLoadingLineId(null)
    }
  }

  const decreaseQuantity = async (line: any) => {
    if (line.quantity == 1) {
      return
    }
    setLoadingLineId(line.id)
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
      setLoadingLineId(null)
    }
  }

  const increaseQuantity = async (lineId: string) => {
    setLoadingLineId(lineId)
    await setCredentials()
    const { data: basket } = await axios.post(
      `${webAddress}/api/v1/basket-lines/${hashids.encode(lineId)}/add`,
      {
        quantity: 1,
      }
    )

    if (cartId) {
      let additionalQuery = ''
      if (locationData && locationData.deliveryType == 'pickup') {
        additionalQuery = `?delivery_type=pickup`
      }
      let { data: basket } = await axios.get(
        `${webAddress}/api/baskets/${cartId}${additionalQuery}`
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
        discountTotal: basket.data.discount_total,
        discountValue: basket.data.discount_value,
      }

      await mutate(basketResult, false)
      setLoadingLineId(null)
    }
  }

  const addToBasket = async (selectedProdId: number) => {
    setAddingItemId(selectedProdId)
    await setCredentials()

    let basketId = localStorage.getItem('basketId')
    const otpToken = Cookies.get('opt_token')

    let basketResult = {}

    if (basketId) {
      let additionalQuery = ''
      if (locationData && locationData.deliveryType == 'pickup') {
        additionalQuery = `?delivery_type=pickup`
      }
      const { data: basketData } = await axios.post(
        `${webAddress}/api/baskets-lines${additionalQuery}`,
        {
          basket_id: basketId,
          variants: [
            {
              id: selectedProdId,
              quantity: 1,
              modifiers: null,
              additionalSale: true,
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${otpToken}`,
          },
          withCredentials: true,
        }
      )
      basketResult = {
        id: basketData.data.id,
        createdAt: '',
        currency: { code: basketData.data.currency },
        taxesIncluded: basketData.data.tax_total,
        lineItems: basketData.data.lines,
        lineItemsSubtotalPrice: basketData.data.sub_total,
        subtotalPrice: basketData.data.sub_total,
        totalPrice: basketData.data.total,
        discountTotal: basketData.data.discount_total,
        discountValue: basketData.data.discount_value,
      }
    } else {
      let additionalQuery = ''
      if (locationData && locationData.deliveryType == 'pickup') {
        additionalQuery = `?delivery_type=pickup`
      }
      const { data: basketData } = await axios.post(
        `${webAddress}/api/baskets${additionalQuery}`,
        {
          variants: [
            {
              id: selectedProdId,
              quantity: 1,
              modifiers: null,
              additionalSale: true,
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${otpToken}`,
          },
          withCredentials: true,
        }
      )
      localStorage.setItem('basketId', basketData.data.encoded_id)
      basketResult = {
        id: basketData.data.id,
        createdAt: '',
        currency: { code: basketData.data.currency },
        taxesIncluded: basketData.data.tax_total,
        lineItems: basketData.data.lines,
        lineItemsSubtotalPrice: basketData.data.sub_total,
        subtotalPrice: basketData.data.sub_total,
        totalPrice: basketData.data.total,
        discountTotal: basketData.data.discount_total,
        discountValue: basketData.data.discount_value,
      }
    }

    await mutate()
    setAddingItemId(null)
  }

  const objectToQueryString = (initialObj: Object) => {
    const reducer =
      (obj: any, parentPrefix = null) =>
      (prev: any, key: any) => {
        const val = obj[key]
        key = encodeURIComponent(key)
        const prefix = parentPrefix ? `${parentPrefix}[${key}]` : key

        if (val == null || typeof val === 'function') {
          prev.push(`${prefix}=`)
          return prev
        }

        if (['number', 'boolean', 'string'].includes(typeof val)) {
          prev.push(`${prefix}=${encodeURIComponent(val)}`)
          return prev
        }

        prev.push(Object.keys(val).reduce(reducer(val, prefix), []).join('&'))
        return prev
      }

    return Object.keys(initialObj).reduce(reducer(initialObj), []).join('&')
  }

  const loadBiRecommendations = async () => {
    if (!isEmpty) {
      let productIds: string[] = []
      data.lineItems.map((item: any) => {
        productIds.push(item.variant.product_id.toString())
      })
      setIsLoadingBiRecommendations(true)
      let queryString = objectToQueryString({
        productIds,
      })
      const {
        data: { data: recommendations },
      } = await axios.get(
        `${webAddress}/api/baskets/bi_related/?${queryString}`
      )
      setIsLoadingBiRecommendations(false)
      if (recommendations.relatedItems) {
        setBiRecommendations(recommendations)
      }
    }
  }

  const goToCheckout = (e: any) => {
    e.preventDefault()

    trackCheckoutStarted({
      cart_items_count: data?.lineItems?.length || 0,
      cart_total: data?.totalPrice / 100 || 0,
      city: activeCity?.slug,
      delivery_type: locationData?.deliveryType,
    })

    router.push(`/${activeCity.slug}/order/`)
  }

  const clearBasket = async () => {
    if (cartId) {
      setIsCartLoading(true)
      await axios.get(
        `${webAddress}/api/baskets/${cartId}/clear`
      )
      await mutate()
      setIsCartLoading(false)
    }
  }

  const readonlyItems = useMemo(() => {
    let res: number[] = []

    if (!isEmpty) {
      data?.lineItems.map((lineItem: any) => {
        if (lineItem.bonus_id) {
          res.push(lineItem.id)
        }

        if (lineItem.sale_id) {
          res.push(lineItem.id)
        }
      })
    }
    return res
  }, [data])

  useEffect(() => {
    fetchConfig()
    return
  }, [])

  useEffect(() => {
    if (data && data.lineItems && data.lineItems.length > 0) {
      trackCartViewed({
        cart_items_count: data.lineItems.length,
        cart_total: data.totalPrice / 100,
        city: activeCity?.slug,
      })
    }
  }, [])

  useEffect(() => {
    if (data && data.lineItems && data.lineItems.length > 0) {
      loadBiRecommendations()
    }
  }, [data?.lineItems?.length])

  const isWorkTime = useMemo(() => {
    let currentHour = new Date().getHours()
    if (
      configData.workTimeStart <= currentHour ||
      configData.workTimeEnd > currentHour
    )
      return true
    return false
  }, [configData])

  if (!isWorkTime) {
    return (
      <div className="bg-white flex py-20 text-xl text-yellow font-bold px-10">
        <div>
          {'Сейчас не время работы'}{' '}
          {locale == 'uz'
            ? configData.workTimeUz
            : locale == 'ru'
            ? configData.workTimeRu
            : locale == 'en'
            ? configData.workTimeEn
            : ''}
        </div>
      </div>
    )
  }

  const settings = {
    infinite: false,
    centerPadding: '40px',
    arrows: true,
    slidesToShow: 6,
    swipeToSlide: true,
    speed: 500,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          arrows: false,
          dots: true,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          arrows: false,
          dots: true,
        },
      },
    ],
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
        <p className="text-gray-500 text-lg mb-4">{'Корзина пуста'}</p>
        <button
          className="bg-yellow text-white font-bold py-3 px-10 rounded-full"
          onClick={openSignInModal}
        >
          {'Войти'}
        </button>
      </div>
    )
  }

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
              strokeWidth="4"
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
        <div className="flex flex-col items-center justify-center text-center text-gray-400 text-sm min-h-[60vh]">
          <img src="/cart_empty.png" width={130} height={119} />
          <div className="w-6/12 mt-3">{'Корзина пуста'}</div>
          <button
            className="bg-yellow text-white p-3 mt-4 rounded-full hidden md:block"
            onClick={() => router.push(`/${activeCity.slug}`)}
          >
            {'Вернуться в меню'}
          </button>
        </div>
      )}
      {/* Mobile: cart + checkout combined */}
      {!isEmpty && (
        <div className="md:hidden bg-gray-50 pb-28">
          {/* Cart items section */}
          <div className="bg-white mx-3 mt-3 rounded-2xl overflow-hidden shadow-sm">
            {/* Cart header */}
            <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
              <div className="text-base font-bold">
                {'Корзина'}{' '}
                <span style={{ color: '#F9B004' }}>
                  ({data?.lineItems
                    .map((item: any) => item.quantity)
                    .reduce((a: number, b: number) => a + b, 0)})
                </span>
              </div>
              <button
                className="text-gray-400 text-xs flex items-center gap-1"
                onClick={clearBasket}
              >
                {'Очистить'} <TrashIcon className="w-4 h-4" />
              </button>
            </div>
            {/* Items */}
            {data?.lineItems
              .map((lineItem: any) => (
                <div key={lineItem.id} className="flex gap-3 px-4 py-3 border-b border-gray-50 relative">
                  {loadingLineId === lineItem.id && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
                      <svg className="animate-spin h-5 w-5 text-yellow" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    </div>
                  )}
                  {lineItem.child &&
                  lineItem.child.length === 1 &&
                  lineItem.child[0].variant?.product?.id !==
                    lineItem?.variant?.product?.box_id ? (
                    <div className="w-16 h-16 flex rounded-full overflow-hidden flex-shrink-0">
                      <div className="w-1/2 relative overflow-hidden">
                        <img
                          src={getAssetUrl(lineItem?.variant?.product?.assets)}
                          className="absolute h-full max-w-none left-0"
                        />
                      </div>
                      <div className="w-1/2 relative overflow-hidden">
                        <img
                          src={getAssetUrl(lineItem?.child[0].variant?.product?.assets)}
                          className="absolute h-full max-w-none right-0"
                        />
                      </div>
                    </div>
                  ) : (
                    <img
                      src={getAssetUrl(lineItem?.variant?.product?.assets)}
                      className="w-16 h-16 object-contain rounded-xl flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold leading-tight">
                      {lineItem.child && lineItem.child.length == 1
                        ? `${lineItem?.variant?.product?.attribute_data?.name[channelName][locale || 'ru']} + ${lineItem?.child
                            .filter((v: any) => lineItem?.variant?.product?.box_id != v?.variant?.product?.id)
                            .map((v: any) => v?.variant?.product?.attribute_data?.name[channelName][locale || 'ru'])
                            .join(' + ')}`
                        : lineItem?.variant?.product?.attribute_data?.name[channelName][locale || 'ru']}
                    </div>
                    {lineItem.modifiers?.filter((mod: any) => mod.price > 0).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {lineItem.modifiers.filter((mod: any) => mod.price > 0).map((mod: any) => (
                          <span key={mod.id} className="text-[10px] text-gray-400">
                            + {locale == 'uz' ? mod.name_uz : locale == 'en' ? mod.name_en : mod.name}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-sm font-bold">
                        {currency(lineItem.total, {
                          pattern: '# !',
                          separator: ' ',
                          decimal: '.',
                          symbol: `${locale == 'uz' ? "so'm" : locale == 'ru' ? 'сум' : 'sum'}`,
                          precision: 0,
                        }).format()}
                      </div>
                      <div className="flex items-center gap-2">
                        {!readonlyItems.includes(lineItem.id) && (
                          <div className="flex items-center bg-gray-100 rounded-full">
                            <button
                              className="w-8 h-8 flex items-center justify-center"
                              onClick={() => decreaseQuantity(lineItem)}
                            >
                              <MinusIcon className="w-4 h-4 text-gray-500" />
                            </button>
                            <span className="text-sm font-bold min-w-[20px] text-center">
                              {lineItem.quantity}
                            </span>
                            <button
                              className="w-8 h-8 flex items-center justify-center"
                              onClick={() => increaseQuantity(lineItem.id)}
                            >
                              <PlusIcon className="w-4 h-4 text-gray-500" />
                            </button>
                          </div>
                        )}
                        {!readonlyItems.includes(lineItem.id) && (
                          <button onClick={() => destroyLine(lineItem.id)} className="p-1">
                            <TrashIcon className="w-4 h-4 text-gray-300" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
              .reverse()}
          </div>

          {/* Recommendations */}
          {biRecommendations.relatedItems.length > 0 && (
            <div className="mt-4 px-4">
              <div className="text-base font-bold mb-3">
                {'Похожие товары'}
              </div>
              <div className="flex gap-3 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">
                {biRecommendations.relatedItems.map((item: any) => (
                  <div key={item.id} className="flex-shrink-0 w-28 bg-white rounded-2xl p-2 shadow-sm">
                    <img
                      src={item.image || '/no_photo.svg'}
                      className="w-full h-16 object-contain mb-1"
                      alt={item?.attribute_data?.name[channelName][locale || 'ru']}
                    />
                    <div className="text-[10px] font-semibold text-center leading-tight h-6 overflow-hidden">
                      {item?.attribute_data?.name[channelName][locale || 'ru']}
                    </div>
                    <button
                      className="w-full mt-1 text-white text-[10px] font-bold py-1.5 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#F9B004' }}
                      onClick={() => addToBasket(item.id)}
                      disabled={addingItemId === item.id}
                    >
                      {addingItemId === item.id ? (
                        <svg className="animate-spin h-3 w-3 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        currency(parseInt(item.price, 0) || 0, {
                          pattern: '# !',
                          separator: ' ',
                          decimal: '.',
                          symbol: `${locale == 'uz' ? "so'm" : locale == 'ru' ? 'сум' : 'sum'}`,
                          precision: 0,
                        }).format()
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {biRecommendations.topItems.length > 0 && (
            <div className="mt-4 px-4">
              <div className="text-base font-bold mb-3">
                {'Популярные продукты'}
              </div>
              <div className="flex gap-3 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">
                {biRecommendations.topItems.map((item: any) => (
                  <div key={item.id} className="flex-shrink-0 w-28 bg-white rounded-2xl p-2 shadow-sm">
                    <img
                      src={item.image || '/no_photo.svg'}
                      className="w-full h-16 object-contain mb-1"
                      alt={item?.attribute_data?.name[channelName][locale || 'ru']}
                    />
                    <div className="text-[10px] font-semibold text-center leading-tight h-6 overflow-hidden">
                      {item?.attribute_data?.name[channelName][locale || 'ru']}
                    </div>
                    <button
                      className="w-full mt-1 text-white text-[10px] font-bold py-1.5 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#F9B004' }}
                      onClick={() => addToBasket(item.id)}
                      disabled={addingItemId === item.id}
                    >
                      {addingItemId === item.id ? (
                        <svg className="animate-spin h-3 w-3 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        currency(parseInt(item.price, 0) || 0, {
                          pattern: '# !',
                          separator: ' ',
                          decimal: '.',
                          symbol: `${locale == 'uz' ? "so'm" : locale == 'ru' ? 'сум' : 'sum'}`,
                          precision: 0,
                        }).format()
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Checkout section */}
          <MobileOrdersApp channelName={channelName} />

          {/* Privacy notice */}
          <div className="px-4 py-3 text-[11px] text-gray-400">
            {'Обрабатывая ваши данные, вы соглашаетесь с нашими'}{' '}
            <a href="/privacy" className="text-yellow" target="_blank">
              {'условиями использования'}
            </a>
          </div>
        </div>
      )}
      {/* Desktop Cart */}
      {!isEmpty && (
        <div className="hidden md:flex justify-between gap-4">
          <div className="md:w-9/12">
            <div className="md:p-10 p-4 md:rounded-2xl bg-white md:mb-3">
              <div className="flex justify-between items-center">
                <div className="text-lg font-bold">
                  {'Корзина'}{' '}
                  {data?.lineItems.length > 0 && (
                    <span className="font-bold text-[18px] text-yellow">
                      (
                      {data.lineItems
                        .map((item: any) => item.quantity)
                        .reduce((a: number, b: number) => a + b, 0)}
                      )
                    </span>
                  )}
                </div>
                <div
                  className="text-gray-400 text-sm flex cursor-pointer"
                  onClick={clearBasket}
                >
                  {'Очистить'} <TrashIcon className=" w-5 h-5 ml-1" />
                </div>
              </div>
              <div className="mt-10 space-y-3">
                {data &&
                  data?.lineItems
                    .map((lineItem: any) => (
                      <div
                        className="border-b pb-4 mb-1"
                        key={lineItem.id}
                      >
                        {/* Desktop layout */}
                        <div className="hidden md:flex md:items-center md:gap-4 relative">
                        {loadingLineId === lineItem.id && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10 rounded-lg">
                            <svg className="animate-spin h-6 w-6 text-yellow" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          </div>
                        )}
                          {/* Image */}
                          {lineItem.child &&
                          lineItem.child.length &&
                          lineItem.child[0].variant?.product?.id !=
                            lineItem?.variant?.product?.box_id ? (
                            lineItem.child.length > 1 ? (
                              <div className="h-14 w-14 flex relative flex-shrink-0">
                                <img
                                  src={getAssetUrl(lineItem?.variant?.product?.assets)}
                                  width={40}
                                  height={40}
                                  className="rounded-full absolute left-0"
                                  alt=""
                                />
                                {lineItem.child.map(
                                  (child: any, index: number) => (
                                    <img
                                      key={`three_child_${index}`}
                                      src={getAssetUrl(child.variant?.product?.assets)}
                                      width={40}
                                      height={40}
                                      className="rounded-full absolute"
                                      style={{ left: (index + 1) * 10 }}
                                      alt=""
                                    />
                                  )
                                )}
                              </div>
                            ) : (
                              <div className="w-16 h-16 flex rounded-full overflow-hidden flex-shrink-0">
                                <div className="w-1/2 relative overflow-hidden">
                                  <img
                                    src={getAssetUrl(lineItem?.variant?.product?.assets)}
                                    className="absolute h-full max-w-none left-0"
                                    alt=""
                                  />
                                </div>
                                <div className="w-1/2 relative overflow-hidden">
                                  <img
                                    src={getAssetUrl(lineItem?.child[0].variant?.product?.assets)}
                                    className="absolute h-full max-w-none right-0"
                                    alt=""
                                  />
                                </div>
                              </div>
                            )
                          ) : (
                            <div className="w-16 h-16 flex-shrink-0">
                              <img
                                src={getAssetUrl(lineItem?.variant?.product?.assets)}
                                className="w-full h-full object-contain rounded-full"
                                alt=""
                              />
                            </div>
                          )}
                          {/* Name + modifiers */}
                          <div className="flex-1 min-w-0">
                            <div className="text-base font-bold truncate">
                              {lineItem.child && lineItem.child.length == 1
                                ? `${lineItem?.variant?.product?.attribute_data?.name[channelName][locale || 'ru']} + ${lineItem?.child
                                    .filter((v: any) => lineItem?.variant?.product?.box_id != v?.variant?.product?.id)
                                    .map((v: any) => v?.variant?.product?.attribute_data?.name[channelName][locale || 'ru'])
                                    .join(' + ')}`
                                : lineItem?.variant?.product?.attribute_data?.name[channelName][locale || 'ru']}
                              {lineItem.bonus_id && <span className="text-yellow ml-1">({'Бонус'})</span>}
                              {lineItem.sale_id && <span className="text-yellow ml-1">({'Акция'})</span>}
                            </div>
                            {lineItem.modifiers?.filter((mod: any) => mod.price > 0).length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {lineItem.modifiers.filter((mod: any) => mod.price > 0).map((mod: any) => (
                                  <span className="bg-yellow rounded-full px-2 py-0.5 text-xs text-white" key={mod.id}>
                                    {locale == 'uz' ? mod.name_uz : locale == 'en' ? mod.name_en : mod.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          {/* Counter */}
                          {!readonlyItems.includes(lineItem.id) && (
                            <div className="w-24 h-8 bg-yellow rounded-full flex items-center text-white flex-shrink-0">
                              <button className="w-8 h-8 flex items-center justify-center" onClick={() => decreaseQuantity(lineItem)}>
                                <MinusIcon className="w-4 h-4" />
                              </button>
                              <span className="flex-grow text-center text-sm font-bold">{lineItem.quantity}</span>
                              <button className="w-8 h-8 flex items-center justify-center" onClick={() => increaseQuantity(lineItem.id)}>
                                <PlusIcon className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                          {/* Price */}
                          <div className="text-lg font-bold w-36 text-right flex-shrink-0">
                            {currency(lineItem.total, {
                              pattern: '# !',
                              separator: ' ',
                              decimal: '.',
                              symbol: `${locale == 'uz' ? "so'm" : locale == 'ru' ? 'сум' : 'sum'}`,
                              precision: 0,
                            }).format()}
                          </div>
                          {/* Delete */}
                          {!readonlyItems.includes(lineItem.id) && (
                            <XIcon
                              className="cursor-pointer h-5 w-5 text-gray-400 hover:text-red-500 flex-shrink-0"
                              onClick={() => destroyLine(lineItem.id)}
                            />
                          )}
                        </div>
                      </div>
                    ))
                    .reverse()}
              </div>
            </div>
            {biRecommendations.relatedItems.length > 0 && (
              <div className="md:p-10 p-5 md:rounded-2xl bg-white md:my-3">
                <div className="text-lg font-bold">
                  {'Похожие товары'}
                </div>
                <div className="mt-5">
                  {/* @ts-ignore */}
                  <Slider {...settings}>
                    {biRecommendations.relatedItems.map((item: any) => (
                      <div className="border border-gray-300 rounded-2xl md:px-5 px-1 py-2 text-center flex flex-col">
                        <div className="flex-grow flex items-center flex-col justify-center">
                          {item.image ? (
                            <img
                              src={item.image}
                              width={130}
                              height={130}
                              alt={
                                item?.attribute_data?.name[channelName][
                                  locale || 'ru'
                                ]
                              }
                              className="transform motion-safe:group-hover:scale-105 transition duration-500 h-20"
                            />
                          ) : (
                            <img
                              src="/no_photo.svg"
                              width={130}
                              height={130}
                              alt={
                                item?.attribute_data?.name[channelName][
                                  locale || 'ru'
                                ]
                              }
                              className="rounded-full transform motion-safe:group-hover:scale-105 transition duration-500"
                            />
                          )}
                          <div className="text-lg leading-5 font-bold mb-3 md:h-12 h-16">
                            {
                              item?.attribute_data?.name[channelName][
                                locale || 'ru'
                              ]
                            }
                          </div>
                        </div>
                        <div
                          className={`rounded-full bg-yellow text-white font-normal cursor-pointer py-1 flex items-center justify-center transition-opacity ${
                            addingItemId === item.id ? 'opacity-50 pointer-events-none' : ''
                          }`}
                          onClick={() => addToBasket(item.id)}
                        >
                          {addingItemId === item.id ? (
                            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          ) : (
                            currency(parseInt(item.price, 0) || 0, {
                              pattern: '# !',
                              separator: ' ',
                              decimal: '.',
                              symbol: `${
                                locale == 'uz'
                                  ? "so'm"
                                  : locale == 'ru'
                                  ? 'сум'
                                  : locale == 'en'
                                  ? 'sum'
                                  : ''
                              }`,
                              precision: 0,
                            }).format()
                          )}
                        </div>
                      </div>
                    ))}
                  </Slider>
                </div>
              </div>
            )}
            {biRecommendations.topItems.length > 0 && (
              <div className="md:p-10 p-5 md:rounded-2xl bg-white md:my-3">
                <div className="text-lg font-bold">{'Топ продуктов'}</div>
                <div className="mt-5">
                  {/* @ts-ignore */}
                  <Slider {...settings}>
                    {biRecommendations.topItems.map((item: any) => (
                      <div className="border border-gray-300 rounded-2xl md:px-5 px-1 py-2 text-center flex flex-col">
                        <div className="flex-grow flex items-center flex-col justify-center">
                          {item.image ? (
                            <img
                              src={item.image}
                              width={130}
                              height={130}
                              alt={
                                item?.attribute_data?.name[channelName][
                                  locale || 'ru'
                                ]
                              }
                              className="transform motion-safe:group-hover:scale-105 transition duration-500 h-20"
                            />
                          ) : (
                            <img
                              src="/no_photo.svg"
                              width={130}
                              height={130}
                              alt={
                                item?.attribute_data?.name[channelName][
                                  locale || 'ru'
                                ]
                              }
                              className="rounded-full transform motion-safe:group-hover:scale-105 transition duration-500"
                            />
                          )}
                          <div className="text-lg leading-5 font-bold mb-3 md:h-12 h-16">
                            {
                              item?.attribute_data?.name[channelName][
                                locale || 'ru'
                              ]
                            }
                          </div>
                        </div>
                        <div
                          className={`rounded-full bg-yellow text-white font-normal cursor-pointer py-1 flex items-center justify-center transition-opacity ${
                            addingItemId === item.id ? 'opacity-50 pointer-events-none' : ''
                          }`}
                          onClick={() => addToBasket(item.id)}
                        >
                          {addingItemId === item.id ? (
                            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          ) : (
                            currency(parseInt(item.price, 0) || 0, {
                              pattern: '# !',
                              separator: ' ',
                              decimal: '.',
                              symbol: `${
                                locale == 'uz'
                                  ? "so'm"
                                  : locale == 'ru'
                                  ? 'сум'
                                  : locale == 'en'
                                  ? 'sum'
                                  : ''
                              }`,
                              precision: 0,
                            }).format()
                          )}
                        </div>
                      </div>
                    ))}
                  </Slider>
                </div>
              </div>
            )}
          </div>
          <div className="hidden md:block">
            <div className="py-9 px-3 rounded-2xl bg-white sticky top-5">
              <div className="border-b items-center justify-between pb-2">
                <div className="flex font-bold items-center justify-between md:justify-end">
                  <div className="text-lg text-gray-400">
                    {'Стоимость заказа'}
                  </div>
                  <div className="ml-7 text-2xl">
                    {currency(data.totalPrice, {
                      pattern: '# !',
                      separator: ' ',
                      decimal: '.',
                      symbol: `${
                        locale == 'uz'
                          ? "so'm"
                          : locale == 'ru'
                          ? 'сум'
                          : locale == 'en'
                          ? 'sum'
                          : ''
                      }`,
                      precision: 0,
                    }).format()}
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-4">
                <button
                  className="text-xl text-white bg-yellow flex h-8 items-center justify-evenly rounded-full w-full"
                  onClick={goToCheckout}
                >
                  {'Оформить заказ'} <img src="/right.png" />
                </button>
                <button
                  className="text-xl text-gray-400 bg-gray-100 flex h-8 items-center rounded-full justify-evenly w-full"
                  onClick={(e) => {
                    e.preventDefault()
                    router.push(`/${activeCity.slug}`)
                  }}
                >
                  <img src="/left.png" /> {'Вернуться в меню'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <style global jsx>{`
        .slick-prev:before,
        .slick-next:before {
          color: #faaf04;
        }
        .slick-prev:before {
          font-size: 33px;
          margin-left: -48px;
        }

        .slick-next:before {
          font-size: 33px;
          margin-left: 24px;
        }

        .slick-track {
          display: flex;
        }
        .slick-track .slick-slide {
          display: flex;
          height: auto;
          align-items: center;
          justify-content: center;
        }
        .slick-track .slick-slide > div {
          height: 100%;
        }
        /* the slides */
        .slick-slide {
          margin: 0 5px;
        }
        /* the parent */
        .slick-list {
          margin: 0 -10px;
        }
      `}</style>
    </>
  )
}
