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
import { createRef, useEffect, useMemo, useState } from 'react'
import Hashids from 'hashids'
import axios from 'axios'
import Cookies from 'js-cookie'
import defaultChannel from '@lib/defaultChannel'
import currency from 'currency.js'
import { useUI } from '@components/ui/context'
import Flicking, { ViewportSlot } from '@egjs/react-flicking'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

export async function getServerSideProps({
  preview,
  locale,
  locales,
  query,
}: GetServerSidePropsContext) {
  const config = { locale, locales, queryParams: query }
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
  const {
    categories,
    brands,
    topMenu,
    footerInfoMenu,
    socials,
    cities,
    currentCity,
  } = await siteInfoPromise
  if (!currentCity) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      products,
      categories,
      brands,
      pages,
      topMenu,
      currentCity,
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
  const [channelName, setChannelName] = useState('chopar')
  const [recomendedItems, setRecomendedItems] = useState([])
  const [biRecommendations, setBiRecommendations] = useState({
    relatedItems: [],
    topItems: [],
  })
  const [isLoadingBiRecommendations, setIsLoadingBiRecommendations] =
    useState(false)
  const [defaultIndex, setDefaultIndex] = useState(1)
  const sliderRef = createRef<Flicking>()

  const getChannel = async () => {
    const channelData = await defaultChannel()
    setChannelName(channelData.name)
  }

  const { activeCity, locationData } = useUI()
  useEffect(() => {
    getChannel()
  }, [])

  const { t: tr } = useTranslation('common')
  let cartId: string | null = null
  if (typeof window !== 'undefined') {
    cartId = localStorage.getItem('basketId')
  }

  const { data, isLoading, isEmpty, mutate } = useCart({
    cartId,
    locationData,
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
  const [configData, setConfigData] = useState({} as any)

  const fetchRecomendedItems = async () => {
    if (cartId) {
      const { data } = await axios.get(
        `${webAddress}/api/baskets/related/${cartId}`
      )
      if (data.data && data.data.length) {
        setRecomendedItems(data.data)
      }
    }
  }

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
    setIsCartLoading(true)
    await setCredentials()
    const { data } = await axios.delete(
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
      setIsCartLoading(false)
    }
  }

  const addToBasket = async (selectedProdId: number) => {
    let modifierProduct: any = null
    let selectedModifiers: any = null
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

    await mutate(basketResult, false)
    fetchRecomendedItems()
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
      console.log(productIds)
      console.log(data)
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
      console.log(recommendations)
    }
    // setBiRecommendations(recommendations)
  }

  const goToCheckout = (e: any) => {
    e.preventDefault()
    router.push(`/${activeCity.slug}/order/`)
  }

  const clearBasket = async () => {
    if (cartId) {
      const { data: basket } = await axios.get(
        `${webAddress}/api/baskets/${cartId}/clear`
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
    fetchRecomendedItems()
    loadBiRecommendations()
    return
  }, [])

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
          {tr('isNotWorkTime')}{' '}
          {locale == 'uz' ? configData.workTimeUz : configData.workTimeRu}
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
        <div className="flex flex-col items-center mt-2 text-center text-gray-400 text-sm pb-4">
          <img src="/cart_empty.png" width={130} height={119} />
          <div className="w-6/12">{tr('basket_empty')}</div>
          <button
            className="bg-yellow text-white p-3 mt-4 rounded-full"
            onClick={() => router.push(`/${activeCity.slug}`)}
          >
            {tr('back_to_menu')}
          </button>
        </div>
      )}
      {!isEmpty && (
        <>
          <div className="md:p-10 p-5 md:rounded-2xl text-xl mt-5 bg-white md:mb-3">
            <div className="flex justify-between items-center">
              <div className="text-lg font-bold">
                {tr('basket')}{' '}
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
                Очистить всё <TrashIcon className=" w-5 h-5 ml-1" />
              </div>
            </div>
            <div className="mt-10 space-y-3">
              {data &&
                data?.lineItems
                  .map((lineItem: any) => (
                    <div
                      className="flex justify-between items-center border-b pb-3"
                      key={lineItem.id}
                    >
                      <div className="md:flex items-center text-center uppercase">
                        {lineItem.child &&
                        lineItem.child.length &&
                        lineItem.child[0].variant?.product?.id !=
                          lineItem?.variant?.product?.box_id ? (
                          <div className="h-28 w-28 flex relative">
                            <div className="w-12 relative overflow-hidden">
                              <div>
                                <Image
                                  src={
                                    lineItem?.variant?.product?.assets?.length
                                      ? `${webAddress}/storage/${lineItem?.variant?.product?.assets[0]?.location}/${lineItem?.variant?.product?.assets[0]?.filename}`
                                      : '/no_photo.svg'
                                  }
                                  width="100"
                                  height="100"
                                  layout="fixed"
                                  className="absolute rounded-full"
                                />
                              </div>
                            </div>
                            <div className="w-12 relative overflow-hidden">
                              <div className="absolute right-0">
                                <Image
                                  src={
                                    lineItem?.child[0].variant?.product?.assets
                                      ?.length
                                      ? `${webAddress}/storage/${lineItem?.child[0].variant?.product?.assets[0]?.location}/${lineItem?.child[0].variant?.product?.assets[0]?.filename}`
                                      : '/no_photo.svg'
                                  }
                                  width="100"
                                  height="100"
                                  layout="fixed"
                                  className="rounded-full"
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="h-24 w-24 flex relative mr-4">
                            <img
                              src={
                                lineItem?.variant?.product?.assets?.length
                                  ? `${webAddress}/storage/${lineItem?.variant?.product?.assets[0]?.location}/${lineItem?.variant?.product?.assets[0]?.filename}`
                                  : '/no_photo.svg'
                              }
                              width={100}
                              height={100}
                              className="rounded-full"
                            />
                          </div>
                        )}
                        <div className="md:ml-7 ml-1 space-y-2 md:w-72 md:text-left">
                          <div className="text-xl font-bold">
                            {lineItem.child && lineItem.child.length > 1
                              ? `${
                                  lineItem?.variant?.product?.attribute_data
                                    ?.name[channelName][locale || 'ru']
                                } + ${lineItem?.child
                                  .filter(
                                    (v: any) =>
                                      lineItem?.variant?.product?.box_id !=
                                      v?.variant?.product?.id
                                  )
                                  .map(
                                    (v: any) =>
                                      v?.variant?.product?.attribute_data?.name[
                                        channelName
                                      ][locale || 'ru']
                                  )
                                  .join(' + ')}`
                              : lineItem?.variant?.product?.attribute_data
                                  ?.name[channelName][locale || 'ru']}{' '}
                            {lineItem.bonus_id && (
                              <span className="text-yellow">
                                ({tr('bonus')})
                              </span>
                            )}
                            {lineItem.sale_id && (
                              <span className="text-yellow">
                                ({tr('sale_label')})
                              </span>
                            )}
                          </div>
                        </div>
                        {lineItem.modifiers && (
                          <div className="md:flex">
                            {lineItem.modifiers
                              .filter((mod: any) => mod.price > 0)
                              .map((mod: any) => (
                                <div
                                  className="bg-yellow rounded-full px-2 py-1 md:ml-2 text-xs text-white my-2"
                                  key={mod.id}
                                >
                                  {locale == 'uz' ? mod.name_uz : mod.name}
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                      <div className="md:flex md:space-x-10 items-center hidden">
                        {!readonlyItems.includes(lineItem.id) && (
                          <div className="w-20 h-6 ml-1 bg-yellow rounded-full flex items-center text-white">
                            <div className="w-6 h-6 items-center flex justify-around">
                              <MinusIcon
                                className="cursor-pointer w-5 h-5"
                                onClick={() => decreaseQuantity(lineItem)}
                              />
                            </div>
                            <div className="flex-grow text-center">
                              {lineItem.quantity}
                            </div>
                            <div className="w-6 h-6 items-center flex justify-around">
                              <PlusIcon
                                className="cursor-pointer w-5 h-5"
                                onClick={() => increaseQuantity(lineItem.id)}
                              />
                            </div>
                          </div>
                        )}
                        <div className="text-xl">
                          {currency(lineItem.total, {
                            pattern: '# !',
                            separator: ' ',
                            decimal: '.',
                            symbol: `${locale == 'uz' ? "so'm" : 'сум'}`,
                            precision: 0,
                          }).format()}
                        </div>
                        {!readonlyItems.includes(lineItem.id) && (
                          <>
                            <XIcon
                              className="cursor-pointer h-4 text-black w-4"
                              onClick={() => destroyLine(lineItem.id)}
                            />
                          </>
                        )}
                      </div>
                      <div className="md:space-x-10 items-center md:hidden">
                        {!readonlyItems.includes(lineItem.id) && (
                          <XIcon
                            className="cursor-pointer h-4 text-black w-4 ml-auto"
                            onClick={() => destroyLine(lineItem.id)}
                          />
                        )}
                        <div className="text-xl mb-2">
                          {currency(lineItem.total, {
                            pattern: '# !',
                            separator: ' ',
                            decimal: '.',
                            symbol: `${locale == 'uz' ? "so'm" : 'сум'}`,
                            precision: 0,
                          }).format()}
                        </div>
                        {!readonlyItems.includes(lineItem.id) && (
                          <div className="w-20 h-6 bg-yellow rounded-full flex items-center text-white ml-auto">
                            <div className="w-6 h-6 items-center flex justify-around">
                              <MinusIcon
                                className="cursor-pointer w-5 h-5"
                                onClick={() => decreaseQuantity(lineItem)}
                              />
                            </div>
                            <div className="flex-grow text-center">
                              {lineItem.quantity}
                            </div>
                            <div className="w-6 h-6 items-center flex justify-around">
                              <PlusIcon
                                className="cursor-pointer w-5 h-5"
                                onClick={() => increaseQuantity(lineItem.id)}
                              />
                            </div>
                          </div>
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
                {tr('related_to_your_products')}
              </div>
              <div className="mt-5">
                <Slider {...settings}>
                  {biRecommendations.relatedItems.map((item: any) => (
                    <div className="border border-gray-300 rounded-2xl md:px-5 px-1 py-2 text-center h-full flex flex-col">
                      <div className="flex-grow flex items-center flex-col justify-center">
                        {item.image ? (
                          <img
                            src={item.image}
                            width="130"
                            height="130"
                            alt={
                              item?.attribute_data?.name[channelName][
                                locale || 'ru'
                              ]
                            }
                            className="transform motion-safe:group-hover:scale-105 transition duration-500"
                          />
                        ) : (
                          <img
                            src="/no_photo.svg"
                            width="130"
                            height="130"
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
                      {/* <div className="text-sm text-gray-300 mb-4">
                        Просто объедение!
                      </div> */}
                      <div
                        className="rounded-full bg-yellow text-white font-normal cursor-pointer py-1"
                        onClick={() => addToBasket(item.id)}
                      >
                        {currency(parseInt(item.price, 0) || 0, {
                          pattern: '# !',
                          separator: ' ',
                          decimal: '.',
                          symbol: `${locale == 'uz' ? "so'm" : 'сум'}`,
                          precision: 0,
                        }).format()}
                      </div>
                    </div>
                  ))}
                </Slider>
              </div>
            </div>
          )}
          {biRecommendations.topItems.length > 0 && (
            <div className="md:p-10 p-5 md:rounded-2xl bg-white md:my-3">
              <div className="text-lg font-bold">{tr('top_products')}</div>
              <div className="mt-5">
                <Slider {...settings}>
                  {biRecommendations.topItems.map((item: any) => (
                    <div className="border border-gray-300 rounded-2xl md:px-5 px-1 py-2 text-center h-full flex flex-col">
                      <div className="flex-grow flex items-center flex-col justify-center">
                        {item.image ? (
                          <img
                            src={item.image}
                            width="130"
                            height="130"
                            alt={
                              item?.attribute_data?.name[channelName][
                                locale || 'ru'
                              ]
                            }
                            className="transform motion-safe:group-hover:scale-105 transition duration-500"
                          />
                        ) : (
                          <img
                            src="/no_photo.svg"
                            width="130"
                            height="130"
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
                      {/* <div className="text-sm text-gray-300 mb-4">
                        Просто объедение!
                      </div> */}
                      <div
                        className="rounded-full bg-yellow text-white font-normal cursor-pointer py-1"
                        onClick={() => addToBasket(item.id)}
                      >
                        {currency(parseInt(item.price, 0) || 0, {
                          pattern: '# !',
                          separator: ' ',
                          decimal: '.',
                          symbol: `${locale == 'uz' ? "so'm" : 'сум'}`,
                          precision: 0,
                        }).format()}
                      </div>
                    </div>
                  ))}
                </Slider>
              </div>
            </div>
          )}
          <div className="md:p-10 p-5 md:rounded-2xl bg-white">
            <div className="border-b items-center justify-between pb-10">
              {/* <div className="md:w-72">
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
              </div> */}

              <div className="flex font-bold items-center justify-between mt-10 md:justify-end">
                <div className="text-lg text-gray-400">
                  {tr('basket_order_price')}
                </div>
                <div className="ml-7 text-3xl">
                  {currency(data.totalPrice, {
                    pattern: '# !',
                    separator: ' ',
                    decimal: '.',
                    symbol: `${locale == 'uz' ? "so'm" : 'сум'}`,
                    precision: 0,
                  }).format()}
                </div>
              </div>
            </div>
            <div className="md:flex justify-between mt-8 space-y-2 md:space-y-0">
              <button
                className="md:text-xl text-gray-400 bg-gray-100 flex h-12 items-center justify-between px-12 rounded-full md:w-80 w-full"
                onClick={(e) => {
                  e.preventDefault()
                  router.push(`/${activeCity.slug}`)
                }}
              >
                <img src="/left.png" /> {tr('back_to_menu')}
              </button>
              <button
                className={`md:text-xl text-white bg-yellow flex h-12 items-center justify-evenly rounded-full md:w-80 w-full`}
                onClick={goToCheckout}
              >
                {tr('checkout')} <img src="/right.png" />
              </button>
            </div>
          </div>
        </>
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

Cart.Layout = Layout
