import { FC, memo, useEffect, useMemo, useState } from 'react'
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
import { useUI } from '@components/ui/context'
import { toast } from 'react-toastify'
import SimpleBar from 'simplebar-react'
import 'simplebar/dist/simplebar.min.css'

const { publicRuntimeConfig } = getConfig()
let webAddress = publicRuntimeConfig.apiUrl
axios.defaults.withCredentials = true

type SmallCartProps = {
  channelName: any
}

const SmallCart: FC<SmallCartProps> = ({ channelName }) => {
  const { t: tr } = useTranslation('common')
  let cartId: string | null = null
  if (typeof window !== 'undefined') {
    cartId = localStorage.getItem('basketId')
  }
  const { locationData, user, activeCity, openSignInModal } = useUI()

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
  const isWorkTime = useMemo(() => {
    let currentHour = new Date().getHours()
    if (
      configData.workTimeStart <= currentHour ||
      configData.workTimeEnd > currentHour
    )
      return true
    return false
  }, [configData])

  const goToCheckout = (e: any) => {
    e.preventDefault()
    if (!isWorkTime) {
      toast.warn(
        `${tr('isNotWorkTime')} ${
          locale == 'uz' ? configData.workTimeUz : configData.workTimeRu
        }`,
        {
          position: toast.POSITION.BOTTOM_RIGHT,
          hideProgressBar: true,
        }
      )
      return
    }
    if (user) {
      router.push(`/${activeCity.slug}/cart/`)
    } else {
      router.push(
        `/${activeCity.slug}?backUrl=/${activeCity.slug}/cart/`,
        undefined,
        {
          shallow: true,
        }
      )
      openSignInModal()
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
  }, [locationData])

  return (
    <div className="mt-2 rounded-[15px] bg-white ">
      <div className="border border-yellow px-5 py-7 rounded-[15px] relative">
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
        <div className="border-b-2 border-yellow flex items-center justify-between pb-4">
          <div>
            <span className="font-bold mr-1 text-xl">{tr('basket')}</span>
            {data?.lineItems?.length > 0 && (
              <span className="font-bold text-[18px] text-yellow">
                (
                {data.lineItems
                  .map((line: any) => line.quantity)
                  .reduce((a: number, b: number) => a + b)}
                )
              </span>
            )}
          </div>
          <div className="flex items-center">
            <Image src="/small_cart_icon.png" width={34} height={34} />
          </div>
        </div>
        {isEmpty && (
          <div className="flex flex-col items-center mt-2 text-center text-gray-400 text-sm">
            <Image src="/cart_empty.png" width={130} height={119} />
            <div className="w-6/12">{tr('basket_empty')}</div>
          </div>
        )}
        {!isEmpty && (
          <SimpleBar style={{ maxHeight: 300, paddingLeft: 30 }}>
            <div className="grid grid-cols-1 divide-y border-b mb-3 overflow-y-auto">
              {data &&
                data?.lineItems
                  .map((lineItem: any) => (
                    <div key={lineItem.id} className="py-3">
                      <div className="flex mb-2">
                        {lineItem.child &&
                        lineItem.child.length &&
                        lineItem.child[0].variant?.product?.id !=
                          lineItem?.variant?.product?.box_id ? (
                          lineItem.child.length > 1 ? (
                            <div className="h-14 w-40 flex relative">
                              <div className="w-5 absolute left-0">
                                <div>
                                  <Image
                                    src={
                                      lineItem?.variant?.product?.assets?.length
                                        ? `${webAddress}/storage/${lineItem?.variant?.product?.assets[0]?.location}/${lineItem?.variant?.product?.assets[0]?.filename}`
                                        : '/no_photo.svg'
                                    }
                                    width="40"
                                    height="40"
                                    layout="fixed"
                                    className="rounded-full"
                                  />
                                </div>
                              </div>
                              {lineItem.child.map(
                                (child: any, index: number) => (
                                  <div
                                    key={`three_child_${index}`}
                                    className="w-5 absolute"
                                    style={{
                                      left: index == 0 ? '0.5rem' : '1.5rem',
                                    }}
                                  >
                                    <Image
                                      src={
                                        child.variant?.product?.assets?.length
                                          ? `${webAddress}/storage/${child.variant?.product?.assets[0]?.location}/${child.variant?.product?.assets[0]?.filename}`
                                          : '/no_photo.svg'
                                      }
                                      width="40"
                                      height="40"
                                      layout="fixed"
                                      className="rounded-full"
                                    />
                                  </div>
                                )
                              )}
                            </div>
                          ) : (
                            <div className="h-11 w-11 flex relative">
                              <div className="w-5 relative overflow-hidden">
                                <div>
                                  <Image
                                    src={
                                      lineItem?.variant?.product?.assets?.length
                                        ? `${webAddress}/storage/${lineItem?.variant?.product?.assets[0]?.location}/${lineItem?.variant?.product?.assets[0]?.filename}`
                                        : '/no_photo.svg'
                                    }
                                    width="40"
                                    height="40"
                                    layout="fixed"
                                    className="absolute rounded-full"
                                  />
                                </div>
                              </div>
                              <div className="w-5 relative overflow-hidden">
                                <div className="absolute right-0">
                                  <Image
                                    src={
                                      lineItem?.child[0].variant?.product
                                        ?.assets?.length
                                        ? `${webAddress}/storage/${lineItem?.child[0].variant?.product?.assets[0]?.location}/${lineItem?.child[0].variant?.product?.assets[0]?.filename}`
                                        : '/no_photo.svg'
                                    }
                                    width="40"
                                    height="40"
                                    layout="fixed"
                                    className="rounded-full"
                                  />
                                </div>
                              </div>
                            </div>
                          )
                        ) : (
                          <div>
                            <Image
                              src={
                                lineItem?.variant?.product?.assets?.length
                                  ? `${webAddress}/storage/${lineItem?.variant?.product?.assets[0]?.location}/${lineItem?.variant?.product?.assets[0]?.filename}`
                                  : '/no_photo.svg'
                              }
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          </div>
                        )}
                        <div className="font-bold text-sm flex-grow mx-1 uppercase">
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
                            : lineItem?.variant?.product?.attribute_data?.name[
                                channelName
                              ][locale || 'ru']}{' '}
                          {lineItem.bonus_id && (
                            <span className="text-yellow">({tr('bonus')})</span>
                          )}
                          {lineItem.sale_id && (
                            <span className="text-yellow">
                              ({tr('sale_label')})
                            </span>
                          )}
                        </div>
                        {!readonlyItems.includes(lineItem.id) && (
                          <div>
                            <XIcon
                              className="cursor-pointer h-4 text-black w-4"
                              onClick={() => destroyLine(lineItem.id)}
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center">
                        {!readonlyItems.includes(lineItem.id) && (
                          <div className="">
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
                          </div>
                        )}
                        <div className="text-right flex-grow">
                          {lineItem.discount_value && (
                            <span className="text-xs line-through">
                              {currency(lineItem.total, {
                                pattern: '# !',
                                separator: ' ',
                                decimal: '.',
                                symbol: `${locale == 'uz' ? "so'm" : 'сум'}`,
                                precision: 0,
                              }).format()}
                            </span>
                          )}
                          <div className=" text-sm">
                            {currency(
                              lineItem.discount_value > 0
                                ? lineItem.total - lineItem.discount_value
                                : lineItem.total,
                              {
                                pattern: '# !',
                                separator: ' ',
                                decimal: '.',
                                symbol: `${locale == 'uz' ? "so'm" : 'сум'}`,
                                precision: 0,
                              }
                            ).format()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                  .reverse()}
            </div>
          </SimpleBar>
        )}
        {!isEmpty && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {tr('basket_order_price')}
            </div>
            <div>
              {data.discountValue > 0 && (
                <span className="text-xs line-through font-bold text-gray-500">
                  {currency(data.discountTotal, {
                    pattern: '# !',
                    separator: ' ',
                    decimal: '.',
                    symbol: `${locale == 'uz' ? "so'm" : 'сум'}`,
                    precision: 0,
                  }).format()}
                </span>
              )}
              <div className="text-[18px] font-bold">
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
        )}
        {!isEmpty && (
          <div className="mt-8">
            <button
              onClick={goToCheckout}
              className="cursor-pointer outline-none focus:outline-none bg-yellow py-3 rounded-full w-full text-white font-bold"
            >
              {tr('main_to_basket')}
            </button>
          </div>
        )}
      </div>
      {/* <div className="border border-yellow mt-3 p-5 rounded-[15px]">
        <form onSubmit={handleSubmit(onSubmit)} className="relative">
          <input
            type="text"
            placeholder={tr('promocode')}
            {...register('discount_code')}
            className="bg-gray-100 focus:outline-none outline-none px-5 py-2 rounded-full text-xs w-full"
          />
          <button className="absolute focus:outline-none outline-none right-1 top-0.5">
            <Image src="/discount_arrow.png" width={28} height={28} />
          </button>
        </form>
      </div> */}
    </div>
  )
}

export default memo(SmallCart)
