'use client'

import { FC, useState, useMemo } from 'react'
import { useExtracted, useLocale } from 'next-intl'
import { useCart } from '@framework/cart'
import { useUI } from '@components/ui/context'
import { toast } from 'sonner'
import axios from 'axios'
import Cookies from 'js-cookie'
import Hashids from 'hashids'
import { CheckIcon } from '@heroicons/react/solid'
import { trackAddToCart } from '@lib/posthog-events'
import { formatPrice } from '../server/format'
import type { SlimProduct, SlimVariant } from '../../../lib/data/menu-dto'

const webAddress = process.env.NEXT_PUBLIC_API_URL
axios.defaults.withCredentials = true

type Props = {
  product: SlimProduct
  channelName: string
}

const ProductCardActions: FC<Props> = ({ product, channelName }) => {
  const t = useExtracted()
  const locale = useLocale()
  const { stopProducts, locationData, openProductDrawer } = useUI() as any
  const { data: cartData, mutate } = useCart()

  const variants = product.variants
  const initialVariantId = useMemo(() => {
    if (!variants?.length) return null
    return (variants[1] ?? variants[0])?.id ?? null
  }, [variants])

  const [activeVariantId, setActiveVariantId] = useState<number | null>(
    initialVariantId
  )
  const [isLoading, setIsLoading] = useState(false)
  const [addedFlash, setAddedFlash] = useState(false)

  const activeVariant: SlimVariant | undefined = variants?.find(
    (v) => v.id === activeVariantId
  )

  const isProductInStop = useMemo(() => {
    const ids = (stopProducts || []) as number[]
    if (!Array.isArray(ids)) return false
    if (ids.includes(product.id)) return true
    if (variants?.some((v) => ids.includes(v.id))) return true
    return false
  }, [stopProducts, product.id, variants])

  const displayPrice =
    activeVariant?.price ??
    product.price ??
    product.priceMin ??
    0

  const cartLineItem = useMemo(() => {
    const items: any[] = (cartData as any)?.lineItems || []
    if (!items.length) return null
    const targetId = activeVariant?.id ?? product.id
    return items.find((li: any) => {
      const variantId = li?.variant?.id ?? li?.variantId
      return Number(variantId) === Number(targetId)
    })
  }, [cartData, activeVariant?.id, product.id])

  const cartQuantity: number = cartLineItem?.quantity || 0
  const hashids = useMemo(
    () =>
      new Hashids('basket', 15, 'abcdefghijklmnopqrstuvwxyz1234567890'),
    []
  )

  const setCredentials = async () => {
    let csrf = Cookies.get('X-XSRF-TOKEN')
    if (!csrf) {
      const csrfReq = await axios(`${webAddress}/api/keldi`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      })
      const { data: res } = csrfReq
      csrf = Buffer.from(res.result, 'base64').toString('ascii')
      const inTenMinutes = new Date(new Date().getTime() + 10 * 60 * 1000)
      Cookies.set('X-XSRF-TOKEN', csrf, { expires: inTenMinutes })
    }
    axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrf
    axios.defaults.headers.common['XCSRF-TOKEN'] = csrf
  }

  const addToBasket = async () => {
    if (isProductInStop) {
      toast.error(t('Товар временно недоступен'))
      return
    }
    setIsLoading(true)
    await setCredentials()
    const otpToken = Cookies.get('opt_token')
    let basketId: any = localStorage.getItem('basketId')
    try {
      basketId = JSON.parse(basketId)
    } catch {
      basketId = null
    }
    const targetId = activeVariant?.id ?? product.id
    try {
      const { data } = await axios.post(
        `${webAddress}/api/baskets-lines`,
        {
          variants: [{ id: targetId, quantity: 1, modifiers: [] }],
          basket_id: basketId,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: otpToken ? `Bearer ${otpToken}` : '',
          },
          withCredentials: true,
        }
      )
      if (data?.id) {
        localStorage.setItem('basketId', JSON.stringify(data.id))
      }
      await mutate()
      setAddedFlash(true)
      setTimeout(() => setAddedFlash(false), 1200)
      trackAddToCart({
        product_id: product.id,
        product_name: product.name,
        price: displayPrice,
        quantity: 1,
      })
    } catch (e: any) {
      const msg =
        e?.response?.data?.error?.message ||
        e?.response?.data?.message ||
        t('Ошибка')
      toast.error(String(msg))
    } finally {
      setIsLoading(false)
    }
  }

  const changeQty = async (delta: number) => {
    if (!cartLineItem) return
    setIsLoading(true)
    await setCredentials()
    const lineIdEncoded = hashids.encode(cartLineItem.id)
    const newQty = cartQuantity + delta
    try {
      if (newQty <= 0) {
        await axios.delete(
          `${webAddress}/api/baskets/lines/${lineIdEncoded}`,
          { withCredentials: true }
        )
      } else {
        await axios.put(
          `${webAddress}/api/baskets/lines/${lineIdEncoded}`,
          { quantity: newQty },
          { withCredentials: true }
        )
      }
      await mutate()
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddClick = () => {
    if (product.hasModifiers) {
      openProductDrawer({ ...product, ...(activeVariant || {}) })
      return
    }
    addToBasket()
  }

  const priceLabel = formatPrice(displayPrice, locale)

  return (
    <div className="mt-auto">
      {variants && variants.length > 0 && (
        <div className="flex mt-5 space-x-1 -mx-2">
          {variants.map((v) => (
            <div className="w-full" key={v.id}>
              <div
                className={`w-full text-center cursor-pointer rounded-2xl outline-none ${
                  v.id === activeVariantId
                    ? 'bg-yellow text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}
                onClick={() => setActiveVariantId(v.id)}
              >
                <button
                  type="button"
                  className="outline-none focus:outline-none text-xs py-2"
                >
                  {v.name}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-10 flex justify-between items-center text-sm">
        {cartQuantity > 0 ? (
          <div
            className="flex items-center rounded-full py-0.5 px-0.5 w-32 transition-opacity"
            style={{ backgroundColor: '#F9B004' }}
          >
            <button
              type="button"
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-lg font-bold"
              style={{ color: '#F9B004' }}
              disabled={isLoading}
              onClick={() => changeQty(-1)}
            >
              −
            </button>
            <span className="flex-1 text-center text-white font-bold">
              {cartQuantity}
            </span>
            <button
              type="button"
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-lg font-bold"
              style={{ color: '#F9B004' }}
              disabled={isLoading}
              onClick={() => changeQty(1)}
            >
              +
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="bg-yellow focus:outline-none w-32 justify-around font-bold outline-none py-2 rounded-full text-white uppercase inline-flex items-center"
            style={{
              backgroundColor: addedFlash ? '#22c55e' : '#F9B004',
            }}
            disabled={isLoading}
            onClick={handleAddClick}
          >
            {isLoading ? (
              <svg
                className="animate-spin h-5 w-5 text-white flex-grow text-center"
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
            ) : addedFlash ? (
              <CheckIcon className="w-4 h-4" />
            ) : (
              <span className="text-xs">{priceLabel}</span>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

export default ProductCardActions
