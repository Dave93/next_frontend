'use client'

import { FC, Fragment, useState } from 'react'
import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from '@headlessui/react'
import axios from 'axios'
import Cookies from 'js-cookie'
import Hashids from 'hashids'
import currency from 'currency.js'
import { useLocale, useExtracted } from 'next-intl'
import { useCart } from '@framework/cart'
import { useUserStore } from '../../lib/stores/user-store'
import { useLocationStore } from '../../lib/stores/location-store'
import { useUIStore } from '../../lib/stores/ui-store'
import { useRouter } from '../../i18n/navigation'
import getAssetUrl from '@utils/getAssetUrl'

const webAddress = process.env.NEXT_PUBLIC_API_URL
const YELLOW = '#FAAF04'

const hashids = new Hashids(
  'basket',
  15,
  'abcdefghijklmnopqrstuvwxyz1234567890'
)

const setCsrf = async () => {
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

const formatPrice = (val: number, locale: string) =>
  currency(val, {
    pattern: '# !',
    separator: ' ',
    decimal: '.',
    symbol: locale === 'uz' ? "so'm" : locale === 'en' ? 'sum' : 'сум',
    precision: 0,
  }).format()

const HeaderMiniCartApp: FC = () => {
  const locale = useLocale()
  const t = useExtracted()
  const router = useRouter()
  const activeCity = useLocationStore((s) => s.activeCity) as any
  const user = useUserStore((s) => s.user) as any
  const openSignInModal = useUIStore((s) => s.openSignInModal)
  const { data, mutate } = useCart()
  const [busy, setBusy] = useState<number | null>(null)

  const lineItems: any[] = (data as any)?.lineItems || []
  const totalQty = lineItems.reduce(
    (acc, l: any) => acc + (l?.quantity || 0),
    0
  )
  const totalPrice = (data as any)?.totalPrice || 0
  const isEmpty = lineItems.length === 0

  const refetchBasket = async () => {
    const cartId =
      typeof window !== 'undefined' ? localStorage.getItem('basketId') : null
    if (!cartId) {
      await mutate()
      return
    }
    const { data: basket } = await axios.get(
      `${webAddress}/api/baskets/${cartId}`,
      { withCredentials: true }
    )
    await mutate(
      {
        id: basket.data.id,
        createdAt: '',
        currency: { code: basket.data.currency },
        taxesIncluded: basket.data.tax_total,
        lineItems: basket.data.lines,
        lineItemsSubtotalPrice: basket.data.sub_total,
        subtotalPrice: basket.data.sub_total,
        totalPrice: basket.data.total,
      },
      false
    )
  }

  const inc = async (line: any) => {
    setBusy(line.id)
    try {
      await setCsrf()
      await axios.post(
        `${webAddress}/api/v1/basket-lines/${hashids.encode(line.id)}/add`,
        { quantity: 1 },
        { withCredentials: true }
      )
      await refetchBasket()
    } finally {
      setBusy(null)
    }
  }

  const dec = async (line: any) => {
    setBusy(line.id)
    try {
      await setCsrf()
      if (line.quantity <= 1) {
        await axios.delete(
          `${webAddress}/api/basket-lines/${hashids.encode(line.id)}`,
          { withCredentials: true }
        )
      } else {
        await axios.put(
          `${webAddress}/api/v1/basket-lines/${hashids.encode(line.id)}/remove`,
          { quantity: 1 },
          { withCredentials: true }
        )
      }
      await refetchBasket()
    } finally {
      setBusy(null)
    }
  }

  const remove = async (line: any) => {
    setBusy(line.id)
    try {
      await setCsrf()
      await axios.delete(
        `${webAddress}/api/basket-lines/${hashids.encode(line.id)}`,
        { withCredentials: true }
      )
      await refetchBasket()
    } finally {
      setBusy(null)
    }
  }

  const goToCheckout = (close: () => void) => {
    close()
    const slug = activeCity?.slug || 'tashkent'
    if (user?.user) {
      router.push(`/${slug}/cart`)
    } else {
      openSignInModal?.()
    }
  }

  const lineName = (line: any) => {
    const product = line?.variant?.product
    const attr = product?.attribute_data?.name?.['chopar']
    return (
      attr?.[locale] ||
      attr?.['ru'] ||
      product?.name ||
      line?.variant?.name ||
      ''
    )
  }

  const lineImage = (line: any) => {
    const assets = line?.variant?.product?.assets
    const url = getAssetUrl(assets)
    return url || '/no_photo.svg'
  }

  return (
    <Popover className="relative ml-2">
      {({ open, close }) => (
        <>
          <PopoverButton
            aria-label="cart"
            className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-colors outline-none ${
              open
                ? 'bg-yellow-100 text-yellow-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {totalQty > 0 && (
              <span
                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center px-1"
                style={{ background: YELLOW, color: '#fff' }}
              >
                {totalQty}
              </span>
            )}
          </PopoverButton>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-150"
            enterFrom="opacity-0 -translate-y-2 scale-95"
            enterTo="opacity-100 translate-y-0 scale-100"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100 translate-y-0 scale-100"
            leaveTo="opacity-0 -translate-y-2 scale-95"
          >
            <PopoverPanel className="absolute right-0 top-full mt-2 w-[380px] origin-top-right rounded-2xl bg-white shadow-xl ring-1 ring-black/5 z-50 focus:outline-none overflow-hidden">
              <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg text-gray-900">
                    {t('Корзина')}
                  </span>
                  {totalQty > 0 && (
                    <span
                      className="font-bold text-sm"
                      style={{ color: YELLOW }}
                    >
                      ({totalQty})
                    </span>
                  )}
                </div>
              </div>

              {isEmpty ? (
                <div className="px-5 py-10 flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <svg
                      width="34"
                      height="34"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#9CA3AF"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="9" cy="21" r="1" />
                      <circle cx="20" cy="21" r="1" />
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                  </div>
                  <div className="font-bold text-gray-900">
                    {t('Корзина пуста')}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {t('Выберите пиццу')}
                  </div>
                </div>
              ) : (
                <>
                  <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-100">
                    {lineItems.map((line: any) => {
                      const isLineBusy = busy === line.id
                      return (
                        <div
                          key={line.id}
                          className="px-5 py-3 flex items-start gap-3"
                        >
                          <div className="w-14 h-14 flex-shrink-0 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden">
                            <img
                              src={lineImage(line)}
                              alt={lineName(line)}
                              className="max-w-full max-h-full object-contain"
                              loading="lazy"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-2">
                              <div className="flex-1 text-sm font-semibold text-gray-900 line-clamp-2 leading-tight">
                                {lineName(line)}
                              </div>
                              <button
                                type="button"
                                onClick={() => remove(line)}
                                disabled={isLineBusy}
                                aria-label="remove"
                                className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 -mt-0.5"
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
                                  <line x1="18" y1="6" x2="6" y2="18" />
                                  <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                              </button>
                            </div>
                            <div className="mt-2 flex items-center justify-between gap-2">
                              <div
                                className="flex items-center rounded-full h-8"
                                style={{
                                  background: YELLOW,
                                  padding: '0 3px',
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={() => dec(line)}
                                  disabled={isLineBusy}
                                  aria-label="dec"
                                  className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-base font-bold disabled:opacity-60"
                                  style={{ color: YELLOW }}
                                >
                                  −
                                </button>
                                <span className="text-white font-bold text-xs px-2 min-w-[24px] text-center">
                                  {isLineBusy ? '…' : line.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => inc(line)}
                                  disabled={isLineBusy}
                                  aria-label="inc"
                                  className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-base font-bold disabled:opacity-60"
                                  style={{ color: YELLOW }}
                                >
                                  +
                                </button>
                              </div>
                              <div className="text-sm font-bold text-gray-900 whitespace-nowrap">
                                {formatPrice(line.total, locale)}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="px-5 py-4 border-t border-gray-100 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-500">
                        {t('Стоимость заказа')}
                      </span>
                      <span className="text-lg font-extrabold text-gray-900">
                        {formatPrice(totalPrice, locale)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => goToCheckout(close)}
                      className="w-full h-11 rounded-full font-bold text-white transition-opacity hover:opacity-90 uppercase text-sm"
                      style={{ background: YELLOW }}
                    >
                      {t('Оформить заказ')}
                    </button>
                  </div>
                </>
              )}
            </PopoverPanel>
          </Transition>
        </>
      )}
    </Popover>
  )
}

export default HeaderMiniCartApp
