'use client'

import { FC, memo, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import Image from 'next/image'
import { XIcon, MinusIcon, PlusIcon } from '@heroicons/react/solid'
import currency from 'currency.js'
import axios from 'axios'
import { useLocale, useExtracted } from 'next-intl'
import { useRouter } from '../../i18n/navigation'
import { useCartStore, cartSelectors } from '../../lib/stores/cart-store'
import {
  useUpdateCartQty,
  useRemoveCartLine,
} from '../../lib/hooks/useCartMutations'
import { useUserStore } from '../../lib/stores/user-store'
import { useLocationStore } from '../../lib/stores/location-store'
import { useUIStore } from '../../lib/stores/ui-store'
import { pickProductImage } from '@utils/getAssetUrl'
import { toast } from 'sonner'
import { isWithinWorkHours } from '../../lib/utils/isWorkTime'
import SimpleBar from 'simplebar-react'
import 'simplebar/dist/simplebar.min.css'

let webAddress = process.env.NEXT_PUBLIC_API_URL
axios.defaults.withCredentials = true

type SmallCartProps = {
  channelName: any
}

const SmallCartApp: FC<SmallCartProps> = ({ channelName }) => {
  const locale = useLocale()
  const t = useExtracted()
  const router = useRouter()
  const locationData = useLocationStore((s) => s.locationData) as any
  const user = useUserStore((s) => s.user) as any
  const activeCity = useLocationStore((s) => s.activeCity) as any
  const openSignInModal = useUIStore((s) => s.openSignInModal)

  const cartLines = useCartStore(cartSelectors.lines)
  const updateQty = useUpdateCartQty()
  const removeLine = useRemoveCartLine()
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
  const isCartLoading = updateQty.isPending || removeLine.isPending

  // useForm imported but its register/handleSubmit not used in current layout — keep import to avoid breaking later additions; if unused at TS check, drop.
  useForm()
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

  const destroyLine = (lineId: string) => {
    removeLine.mutate({ lineId: Number(lineId) })
  }

  const decreaseQuantity = (line: any) => {
    if (Number(line.quantity || 0) <= 1) return
    updateQty.mutate({
      lineId: Number(line.id),
      delta: -1,
      currentQty: Number(line.quantity || 0),
    })
  }

  const increaseQuantity = (lineId: string, currentQty: number) => {
    updateQty.mutate({
      lineId: Number(lineId),
      delta: 1,
      currentQty: Number(currentQty || 0),
    })
  }

  const isWorkTime = useMemo(
    () =>
      isWithinWorkHours(
        configData.workTimeStart,
        configData.workTimeEnd
      ),
    [configData]
  )

  const goToCheckout = (e: any) => {
    e.preventDefault()
    if (!isWorkTime) {
      toast.warning(
        `${'Сейчас не рабочее время'} ${
          locale == 'uz'
            ? configData.workTimeUz
            : locale == 'ru'
            ? configData.workTimeRu
            : locale == 'en'
            ? configData.workTimeEn
            : ''
        }`
      )
      return
    }
    if (user) {
      router.push(`/${activeCity.slug}/cart/`)
    } else {
      router.push(
        `/${activeCity.slug}?backUrl=/${activeCity.slug}/cart/`
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
        <div className="border-b-2 border-yellow flex items-center justify-between pb-4">
          <div>
            <span className="font-bold mr-1 text-xl">{t('Корзина')}</span>
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
            <Image src="/small_cart_icon.png" width={34} height={34} alt="" />
          </div>
        </div>
        {isEmpty && (
          <div className="flex flex-col items-center mt-2 text-center text-gray-400 text-sm">
            <Image src="/cart_empty.png" width={130} height={119} alt="" />
            <div>{t('Корзина пуста')}</div>
            <div>{t('Выберите пиццу')}</div>
          </div>
        )}
        {!isEmpty && (
          <SimpleBar style={{ maxHeight: 300, paddingLeft: 30 }}>
            <div className="grid grid-cols-1 divide-y border-b mb-3 overflow-y-auto">
              {data &&
                data?.lineItems
                  .map((lineItem: any) => (
                    <div key={lineItem.id} className="py-3">
                      <div className="grid grid-cols-3 items-center place-items-center">
                        {lineItem.child &&
                        lineItem.child.length &&
                        lineItem.child[0].variant?.product?.id !=
                          lineItem?.variant?.product?.box_id ? (
                          lineItem.child.length > 1 ? (
                            <div className="h-14 w-40 flex relative">
                              <div className="w-5 absolute left-0">
                                <div>
                                  <img
                                    src={
                                      pickProductImage(lineItem?.variant?.product)
                                    }
                                    width="40"
                                    height="40"
                                    className="rounded-full"
                                    alt=""
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
                                    <img
                                      src={
                                        pickProductImage(child.variant?.product)
                                      }
                                      width="40"
                                      height="40"
                                      className="rounded-full"
                                      alt=""
                                    />
                                  </div>
                                )
                              )}
                            </div>
                          ) : (
                            <div className="h-16 w-16 flex relative">
                              <div className="w-10 relative overflow-hidden">
                                <img
                                  src={
                                    pickProductImage(lineItem?.variant?.product)
                                  }
                                  width="60"
                                  height="60"
                                  className="absolute h-full max-w-none"
                                  alt=""
                                />
                              </div>
                              <div className="w-10 relative overflow-hidden">
                                <img
                                  src={
                                    pickProductImage(lineItem?.child[0].variant?.product)
                                  }
                                  width="60"
                                  height="60"
                                  className="absolute h-full max-w-none right-0"
                                  alt=""
                                />
                              </div>
                            </div>
                          )
                        ) : (
                          <div className="">
                            <img
                              src={
                                pickProductImage(lineItem?.variant?.product)
                              }
                              width={60}
                              height={60}
                              className="rounded-full"
                              alt=""
                            />
                          </div>
                        )}
                        <div className="font-bold text-xs">
                          {lineItem.child && lineItem.child.length > 1
                            ? `${
                                lineItem?.variant?.product?.attribute_data
                                  ?.name[channelName][locale || 'ru']
                              }  ${lineItem?.child
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
                                )} `
                            : lineItem?.variant?.product?.attribute_data?.name[
                                channelName
                              ][locale || 'ru']}
                          {'  '}
                          {lineItem.bonus_id && (
                            <span className="text-yellow">({'Бонус'})</span>
                          )}
                          {lineItem.sale_id && (
                            <span className="text-yellow">
                              ({'Акция'})
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
                      <div className="flex items-center mt-2">
                        {!readonlyItems.includes(lineItem.id) && (
                          <div className="">
                            <div className="h-6 ml-1 bg-yellow rounded-full flex items-center text-white">
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
                                  onClick={() =>
                                    increaseQuantity(
                                      lineItem.id,
                                      lineItem.quantity
                                    )
                                  }
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
                                symbol:
                                  locale === 'uz'
                                    ? "so'm"
                                    : locale === 'ru'
                                    ? 'сум'
                                    : locale === 'en'
                                    ? 'sum'
                                    : 'сум',
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
                                symbol:
                                  locale === 'uz'
                                    ? "so'm"
                                    : locale === 'ru'
                                    ? 'сум'
                                    : locale === 'en'
                                    ? 'sum'
                                    : 'сум',
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
              {'Стоимость заказа'}
            </div>
            <div>
              {data.discountValue > 0 && (
                <span className="text-xs line-through font-bold text-gray-500">
                  {currency(data.discountTotal, {
                    pattern: '# !',
                    separator: ' ',
                    decimal: '.',
                    symbol:
                      locale === 'uz'
                        ? "so'm"
                        : locale === 'ru'
                        ? 'сум'
                        : locale === 'en'
                        ? 'sum'
                        : 'сум',
                    precision: 0,
                  }).format()}
                </span>
              )}
              <div className="text-[18px] font-bold">
                {currency(data.totalPrice, {
                  pattern: '# !',
                  separator: ' ',
                  decimal: '.',
                  symbol:
                    locale === 'uz'
                      ? "so'm"
                      : locale === 'ru'
                      ? 'сум'
                      : locale === 'en'
                      ? 'sum'
                      : 'сум',
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
              {'В корзину'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default memo(SmallCartApp)
