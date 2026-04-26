'use client'

import { useEffect, useMemo, useState } from 'react'
import { useLocale, useExtracted } from 'next-intl'
import { useRouter } from '../../i18n/navigation'
import axios from 'axios'
import Cookies from 'js-cookie'
import defaultChannel from '@lib/defaultChannel'
import currency from 'currency.js'
import getAssetUrl from '@utils/getAssetUrl'
import { useCartStore, cartSelectors } from '../../lib/stores/cart-store'
import {
  useUpdateCartQty,
  useRemoveCartLine,
} from '../../lib/hooks/useCartMutations'
import { syncCartFromBasketResult } from '../../lib/data/cart-adapter'
import { useUserStore } from '../../lib/stores/user-store'
import { useLocationStore } from '../../lib/stores/location-store'
import { useUIStore } from '../../lib/stores/ui-store'
import {
  trackCheckoutStarted,
  trackCartViewed,
  trackRemoveFromCart,
} from '@lib/posthog-events'

const webAddress = process.env.NEXT_PUBLIC_API_URL
axios.defaults.withCredentials = true

const YELLOW = '#FAAF04'

interface CartAppProps {
  products?: any[]
}

export default function CartApp(_props: CartAppProps) {
  const [channelName, setChannelName] = useState('chopar')
  const [biRecommendations, setBiRecommendations] = useState<any>({
    relatedItems: [],
    topItems: [],
  })

  const getChannel = async () => {
    const channelData = await defaultChannel()
    setChannelName(channelData.name)
  }

  const activeCity = useLocationStore((s) => s.activeCity) as any
  const locationData = useLocationStore((s) => s.locationData) as any
  const user = useUserStore((s) => s.user) as any
  const openSignInModal = useUIStore((s) => s.openSignInModal)
  useEffect(() => {
    getChannel()
  }, [])

  const locale = useLocale()
  const t = useExtracted()
  const router = useRouter()

  const cartId =
    typeof window !== 'undefined' ? localStorage.getItem('basketId') : null

  const cartLines = useCartStore(cartSelectors.lines)
  const updateQty = useUpdateCartQty()
  const removeLineMut = useRemoveCartLine()
  const data: any = useMemo(
    () => ({
      lineItems: cartLines.map(
        (l) =>
          l._raw || {
            id: l.id,
            quantity: l.qty,
            total: l.qty * l.price,
            variant: {
              id: l.variantId,
              product_id: l.productId,
              product: { id: l.productId, name: l.name, image: l.image },
            },
          }
      ),
      totalPrice: cartLines.reduce(
        (acc, l) => acc + Number(l._raw?.total ?? l.qty * l.price),
        0
      ),
      discountTotal: 0,
      discountValue: 0,
    }),
    [cartLines]
  )
  const isEmpty = cartLines.length === 0

  const [isCartLoading, setIsCartLoading] = useState(false)
  const [loadingLineId, setLoadingLineId] = useState<string | null>(null)
  const [addingItemId, setAddingItemId] = useState<number | null>(null)
  const [configData, setConfigData] = useState<any>({})

  const formatPrice = (val: number) =>
    currency(val, {
      pattern: '# !',
      separator: ' ',
      decimal: '.',
      symbol: locale === 'uz' ? "so'm" : locale === 'en' ? 'sum' : 'сум',
      precision: 0,
    }).format()

  const fetchConfig = async () => {
    let cfg
    if (!sessionStorage.getItem('configData')) {
      const { data } = await axios.get(`${webAddress}/api/configs/public`)
      cfg = data.data
      sessionStorage.setItem('configData', data.data)
    } else {
      cfg = sessionStorage.getItem('configData')
    }
    try {
      cfg = Buffer.from(cfg, 'base64').toString('ascii')
      cfg = JSON.parse(cfg)
      setConfigData(cfg)
    } catch (e) {}
  }

  const setCredentials = async () => {
    let csrf = Cookies.get('X-XSRF-TOKEN')
    if (!csrf) {
      const csrfReq = await axios(`${webAddress}/api/keldi`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      })
      csrf = Buffer.from(csrfReq.data.result, 'base64').toString('ascii')
      Cookies.set('X-XSRF-TOKEN', csrf, {
        expires: new Date(Date.now() + 10 * 60 * 1000),
      })
    }
    axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrf
    axios.defaults.headers.common['XCSRF-TOKEN'] = csrf
  }

  const refetchBasket = async () => {
    if (!cartId) return
    const additionalQuery =
      locationData?.deliveryType === 'pickup' ? '?delivery_type=pickup' : ''
    const { data: basket } = await axios.get(
      `${webAddress}/api/baskets/${cartId}${additionalQuery}`
    )
    syncCartFromBasketResult({
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
    })
  }

  const destroyLine = async (lineId: string) => {
    setLoadingLineId(lineId)
    const itemBeingRemoved = data?.lineItems?.find((l: any) => l.id == lineId)
    try {
      await removeLineMut.mutateAsync({ lineId: Number(lineId) })
      if (itemBeingRemoved) {
        trackRemoveFromCart({
          product_id: itemBeingRemoved?.variant?.product_id || lineId,
          product_name: itemBeingRemoved?.variant?.name || '',
          cart_total: (data?.totalPrice || 0) / 100,
          cart_items_count: (data?.lineItems?.length || 0) - 1,
        })
      }
    } finally {
      setLoadingLineId(null)
    }
  }

  const decreaseQuantity = async (line: any) => {
    setLoadingLineId(line.id)
    try {
      await updateQty.mutateAsync({
        lineId: Number(line.id),
        delta: -1,
        currentQty: Number(line.quantity || 0),
      })
    } finally {
      setLoadingLineId(null)
    }
  }

  const increaseQuantity = async (lineId: string, currentQty: number) => {
    setLoadingLineId(lineId)
    try {
      await updateQty.mutateAsync({
        lineId: Number(lineId),
        delta: 1,
        currentQty: Number(currentQty || 0),
      })
    } finally {
      setLoadingLineId(null)
    }
  }

  const addToBasket = async (selectedProdId: number) => {
    setAddingItemId(selectedProdId)
    await setCredentials()
    const basketId = localStorage.getItem('basketId')
    const otpToken = Cookies.get('opt_token')
    const additionalQuery =
      locationData?.deliveryType === 'pickup' ? '?delivery_type=pickup' : ''
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${otpToken}`,
    }
    const payload = {
      variants: [
        {
          id: selectedProdId,
          quantity: 1,
          modifiers: null,
          additionalSale: true,
        },
      ],
    }
    if (basketId) {
      await axios.post(
        `${webAddress}/api/baskets-lines${additionalQuery}`,
        { basket_id: basketId, ...payload },
        { headers, withCredentials: true }
      )
    } else {
      const { data: basketData } = await axios.post(
        `${webAddress}/api/baskets${additionalQuery}`,
        payload,
        { headers, withCredentials: true }
      )
      localStorage.setItem('basketId', basketData.data.encoded_id)
    }
    await refetchBasket()
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
    if (isEmpty) return
    const productIds: string[] = []
    data.lineItems.forEach((item: any) => {
      productIds.push(item.variant.product_id.toString())
    })
    const queryString = objectToQueryString({ productIds })
    try {
      const {
        data: { data: recommendations },
      } = await axios.get(
        `${webAddress}/api/baskets/bi_related/?${queryString}`
      )
      if (recommendations.relatedItems) setBiRecommendations(recommendations)
    } catch (e) {}
  }

  const goToCheckout = (e: any) => {
    e.preventDefault()
    trackCheckoutStarted({
      cart_items_count: data?.lineItems?.length || 0,
      cart_total: (data?.totalPrice || 0) / 100,
      city: activeCity?.slug,
      delivery_type: locationData?.deliveryType,
    })
    router.push(`/${activeCity?.slug}/order/`)
  }

  const clearBasket = async () => {
    if (!cartId) return
    setIsCartLoading(true)
    await axios.get(`${webAddress}/api/baskets/${cartId}/clear`)
    await refetchBasket()
    setIsCartLoading(false)
  }

  const readonlyItems = useMemo(() => {
    const res: number[] = []
    if (!isEmpty) {
      data?.lineItems.forEach((lineItem: any) => {
        if (lineItem.bonus_id) res.push(lineItem.id)
        if (lineItem.sale_id) res.push(lineItem.id)
      })
    }
    return res
  }, [data, isEmpty])

  useEffect(() => {
    fetchConfig()
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
    if (!configData?.workTimeStart && !configData?.workTimeEnd) return true
    const currentHour = new Date().getHours()
    return (
      configData.workTimeStart <= currentHour ||
      configData.workTimeEnd > currentHour
    )
  }, [configData])

  const workTimeLabel =
    locale === 'uz'
      ? configData?.workTimeUz
      : locale === 'en'
        ? configData?.workTimeEn
        : configData?.workTimeRu

  const totalQty = useMemo(() => {
    if (isEmpty) return 0
    return data.lineItems.reduce(
      (a: number, b: any) => a + (b.quantity || 0),
      0
    )
  }, [data, isEmpty])

  const lineName = (line: any) => {
    const product = line?.variant?.product
    const attr = product?.attribute_data?.name?.[channelName]
    const main = attr?.[locale] || attr?.['ru'] || product?.name || ''
    if (line.child && line.child.length === 1) {
      const extras = line.child
        .filter(
          (v: any) => product?.box_id !== v?.variant?.product?.id
        )
        .map((v: any) => {
          const a = v?.variant?.product?.attribute_data?.name?.[channelName]
          return a?.[locale] || a?.['ru'] || ''
        })
        .filter(Boolean)
        .join(' + ')
      return extras ? `${main} + ${extras}` : main
    }
    return main
  }

  const recName = (item: any) => {
    const a = item?.attribute_data?.name?.[channelName]
    return a?.[locale] || a?.['ru'] || item?.name || ''
  }

  const renderLineImage = (line: any) => {
    const child = line?.child
    if (
      child &&
      child.length &&
      child[0]?.variant?.product?.id !== line?.variant?.product?.box_id
    ) {
      if (child.length > 1) {
        return (
          <div className="w-16 h-16 relative rounded-2xl bg-gray-50 overflow-hidden flex-shrink-0">
            <img
              src={getAssetUrl(line?.variant?.product?.assets)}
              className="absolute inset-0 m-auto w-10 h-10 object-contain rounded-full"
              alt=""
            />
            {child.map((c: any, i: number) => (
              <img
                key={i}
                src={getAssetUrl(c?.variant?.product?.assets)}
                className="absolute w-8 h-8 object-contain rounded-full bg-white"
                style={{
                  right: i * 6,
                  bottom: i * 4,
                }}
                alt=""
              />
            ))}
          </div>
        )
      }
      return (
        <div className="w-16 h-16 flex rounded-2xl bg-gray-50 overflow-hidden flex-shrink-0">
          <div className="w-1/2 relative overflow-hidden">
            <img
              src={getAssetUrl(line?.variant?.product?.assets)}
              className="absolute h-full max-w-none left-0"
              alt=""
            />
          </div>
          <div className="w-1/2 relative overflow-hidden">
            <img
              src={getAssetUrl(child[0]?.variant?.product?.assets)}
              className="absolute h-full max-w-none right-0"
              alt=""
            />
          </div>
        </div>
      )
    }
    return (
      <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
        <img
          src={getAssetUrl(line?.variant?.product?.assets)}
          className="max-w-full max-h-full object-contain"
          alt=""
        />
      </div>
    )
  }

  const Stepper = ({ line }: { line: any }) => {
    const isLineBusy = loadingLineId === line.id
    return (
      <div
        className="flex items-center rounded-full h-9"
        style={{ background: YELLOW, padding: '0 3px' }}
      >
        <button
          type="button"
          onClick={() => decreaseQuantity(line)}
          disabled={isLineBusy}
          aria-label="dec"
          className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-base font-bold disabled:opacity-60"
          style={{ color: YELLOW }}
        >
          −
        </button>
        <span className="text-white font-bold text-sm px-3 min-w-[28px] text-center">
          {isLineBusy ? '…' : line.quantity}
        </span>
        <button
          type="button"
          onClick={() => increaseQuantity(line.id, line.quantity)}
          disabled={isLineBusy}
          aria-label="inc"
          className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-base font-bold disabled:opacity-60"
          style={{ color: YELLOW }}
        >
          +
        </button>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-3 md:px-0 py-8 md:py-16">
        <div className="bg-white rounded-3xl shadow-sm p-8 md:p-16 max-w-2xl mx-auto text-center">
          <div className="w-24 h-24 rounded-full bg-gray-50 mx-auto mb-6 flex items-center justify-center">
            <svg
              width="44"
              height="44"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9CA3AF"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">
            {t('Войдите в аккаунт')}
          </h1>
          <p className="text-gray-500 mb-6">
            {t('Чтобы оформить заказ, нужно войти в личный кабинет')}
          </p>
          <button
            onClick={openSignInModal}
            className="rounded-full font-bold text-white px-10 h-12 transition-opacity hover:opacity-90 uppercase text-sm"
            style={{ background: YELLOW }}
          >
            {t('Войти')}
          </button>
        </div>
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div className="container mx-auto px-3 md:px-0 py-8 md:py-16">
        <div className="bg-white rounded-3xl shadow-sm p-8 md:p-16 max-w-2xl mx-auto text-center">
          <img
            src="/cart_empty.png"
            width={160}
            height={146}
            className="mx-auto mb-6"
            alt=""
          />
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">
            {t('Корзина пуста')}
          </h1>
          <p className="text-gray-500 mb-6">{t('Выберите пиццу')}</p>
          <button
            onClick={() => router.push(`/${activeCity?.slug || 'tashkent'}`)}
            className="rounded-full font-bold text-white px-10 h-12 transition-opacity hover:opacity-90 uppercase text-sm"
            style={{ background: YELLOW }}
          >
            {t('Вернуться в меню')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-3 md:px-0 py-4 md:py-8">
      {!isWorkTime && (
        <div
          className="mb-4 md:mb-6 rounded-2xl px-5 md:px-6 py-4 md:py-5 flex items-start gap-4 shadow-lg ring-1 ring-red-300/40"
          style={{
            background:
              'linear-gradient(135deg, #FEE2E2 0%, #FECACA 50%, #FCA5A5 100%)',
          }}
          role="alert"
        >
          <div className="flex-shrink-0 w-11 h-11 md:w-12 md:h-12 rounded-full bg-white/70 flex items-center justify-center shadow-sm">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#DC2626"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="13" />
              <line x1="12" y1="16.5" x2="12.01" y2="16.5" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-base md:text-lg font-extrabold text-red-800 leading-tight">
              {t('Сейчас не время работы')}
            </div>
            <div className="mt-1 text-sm md:text-base text-red-900/80 leading-snug">
              {t(
                'Оформить заказ можно будет в рабочие часы. Корзина сохранится.'
              )}
              {workTimeLabel && (
                <span className="block mt-1.5 font-semibold text-red-900">
                  {t('Рабочие часы')}: {workTimeLabel}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 md:px-7 py-4 border-b border-gray-100">
              <div className="flex items-baseline gap-2">
                <h1 className="text-xl md:text-2xl font-extrabold text-gray-900">
                  {t('Корзина')}
                </h1>
                {totalQty > 0 && (
                  <span
                    className="text-base md:text-lg font-bold"
                    style={{ color: YELLOW }}
                  >
                    ({totalQty})
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={clearBasket}
                disabled={isCartLoading}
                className="text-sm text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                {t('Очистить')}
              </button>
            </div>

            <div className="divide-y divide-gray-100">
              {data?.lineItems
                .map((line: any) => {
                  const isLineBusy = loadingLineId === line.id
                  const mods = (line.modifiers || []).filter(
                    (m: any) => m.price > 0
                  )
                  return (
                    <div
                      key={line.id}
                      className="px-5 md:px-7 py-4 flex items-start gap-3 md:gap-4 relative"
                    >
                      {isLineBusy && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
                          <svg
                            className="animate-spin h-5 w-5"
                            style={{ color: YELLOW }}
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                          </svg>
                        </div>
                      )}
                      {renderLineImage(line)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-sm md:text-base font-bold text-gray-900 leading-tight">
                              {lineName(line)}
                              {line.bonus_id && (
                                <span
                                  className="ml-2 text-xs font-bold"
                                  style={{ color: YELLOW }}
                                >
                                  ({t('Бонус')})
                                </span>
                              )}
                              {line.sale_id && (
                                <span
                                  className="ml-2 text-xs font-bold"
                                  style={{ color: YELLOW }}
                                >
                                  ({t('Акция')})
                                </span>
                              )}
                            </div>
                            {mods.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-1.5">
                                {mods.map((m: any) => (
                                  <span
                                    key={m.id}
                                    className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium"
                                  >
                                    +{' '}
                                    {locale === 'uz'
                                      ? m.name_uz
                                      : locale === 'en'
                                        ? m.name_en
                                        : m.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          {!readonlyItems.includes(line.id) && (
                            <button
                              type="button"
                              onClick={() => destroyLine(line.id)}
                              disabled={isLineBusy}
                              aria-label="remove"
                              className="text-gray-300 hover:text-red-500 transition-colors disabled:opacity-50 flex-shrink-0"
                            >
                              <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </button>
                          )}
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-2">
                          {!readonlyItems.includes(line.id) ? (
                            <Stepper line={line} />
                          ) : (
                            <span className="text-xs text-gray-400">
                              {line.quantity} ×
                            </span>
                          )}
                          <div className="text-base md:text-lg font-extrabold text-gray-900 whitespace-nowrap">
                            {formatPrice(line.total)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
                .reverse()}
            </div>
          </div>

          {(biRecommendations.relatedItems?.length > 0 ||
            biRecommendations.topItems?.length > 0) && (
            <div className="bg-white rounded-3xl shadow-sm p-5 md:p-7">
              <h2 className="text-lg md:text-xl font-extrabold text-gray-900 mb-4">
                {t('Вам может понравиться')}
              </h2>
              <div className="-mx-5 md:-mx-7 px-5 md:px-7 overflow-x-auto pb-2">
                <div className="flex gap-3 md:gap-4">
                  {(biRecommendations.relatedItems?.length
                    ? biRecommendations.relatedItems
                    : biRecommendations.topItems
                  ).map((item: any) => (
                    <div
                      key={item.id}
                      className="flex-shrink-0 w-[140px] md:w-[160px] bg-white border border-gray-100 rounded-2xl p-3 flex flex-col items-center text-center"
                    >
                      <div className="w-full h-20 md:h-24 flex items-center justify-center mb-2">
                        <img
                          src={item.image || '/no_photo.svg'}
                          className="max-w-full max-h-full object-contain"
                          alt={recName(item)}
                          loading="lazy"
                        />
                      </div>
                      <div className="text-xs md:text-sm font-semibold text-gray-800 leading-tight line-clamp-2 min-h-[32px] mb-2">
                        {recName(item)}
                      </div>
                      <button
                        type="button"
                        onClick={() => addToBasket(item.id)}
                        disabled={addingItemId === item.id}
                        className="w-full h-9 rounded-full text-xs font-bold text-white flex items-center justify-center disabled:opacity-60"
                        style={{ background: YELLOW }}
                      >
                        {addingItemId === item.id
                          ? '…'
                          : `+ ${formatPrice(parseInt(item.price, 10) || 0)}`}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <aside className="lg:col-span-1">
          <div className="bg-white rounded-3xl shadow-sm p-5 md:p-7 lg:sticky lg:top-24">
            <h2 className="text-lg md:text-xl font-extrabold text-gray-900 mb-4">
              {t('Ваш заказ')}
            </h2>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">
                  {t('Товары')} ({totalQty})
                </span>
                <span className="font-semibold text-gray-900">
                  {formatPrice(data?.lineItemsSubtotalPrice || data?.totalPrice || 0)}
                </span>
              </div>
              {data?.discountValue > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">{t('Скидка')}</span>
                  <span className="font-semibold" style={{ color: YELLOW }}>
                    − {formatPrice(data.discountValue)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-gray-500">{t('Доставка')}</span>
                <span className="text-gray-400">
                  {locationData?.deliveryType === 'pickup'
                    ? t('Самовывоз')
                    : t('Уточняется')}
                </span>
              </div>
            </div>
            <div className="mt-5 pt-5 border-t border-gray-100 flex items-baseline justify-between">
              <span className="text-base font-semibold text-gray-700">
                {t('Итого')}
              </span>
              <span className="text-2xl md:text-3xl font-extrabold text-gray-900">
                {formatPrice(data?.totalPrice || 0)}
              </span>
            </div>

            <button
              type="button"
              onClick={goToCheckout}
              disabled={!isWorkTime}
              className="mt-5 w-full h-12 md:h-14 rounded-full font-bold text-white text-sm md:text-base uppercase tracking-wide flex items-center justify-center transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: YELLOW }}
            >
              {t('Оформить заказ')}
              <svg
                className="ml-2"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() =>
                router.push(`/${activeCity?.slug || 'tashkent'}`)
              }
              className="mt-3 w-full h-11 rounded-full font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors text-sm flex items-center justify-center"
            >
              <svg
                className="mr-2"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              {t('Вернуться в меню')}
            </button>

            <div className="mt-4 text-[11px] text-gray-400 leading-relaxed">
              {t(
                'Обрабатывая ваши данные, вы соглашаетесь с нашими условиями использования'
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
