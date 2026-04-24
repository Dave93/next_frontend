'use client'

import { FC, useEffect, useMemo, useState } from 'react'
import { Drawer } from 'vaul'
import Image from 'next/image'
import axios from 'axios'
import Cookies from 'js-cookie'
import currency from 'currency.js'
import { useLocale } from 'next-intl'
import { useExtracted } from 'next-intl'
import { useCart } from '@framework/cart'
import { useUI } from '@components/ui/context'
import getAssetUrl from '@utils/getAssetUrl'
import { trackAddToCart } from '@lib/posthog-events'

const webAddress = process.env.NEXT_PUBLIC_API_URL
const YELLOW = '#FAAF04'

const formatPrice = (val: number, locale: string) =>
  currency(val, {
    pattern: '# !',
    separator: ' ',
    decimal: '.',
    symbol:
      locale === 'uz' ? "so'm" : locale === 'en' ? 'sum' : 'сум',
    precision: 0,
  }).format()

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

const ProductDrawerApp: FC = () => {
  const ui = useUI() as any
  const { productDrawerProduct, closeProductDrawer, locationData } = ui
  const t = useExtracted()
  const locale = useLocale()
  const { mutate } = useCart()
  const open = !!productDrawerProduct

  const [activeVariantId, setActiveVariantId] = useState<number | null>(null)
  const [activeModifiers, setActiveModifiers] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!productDrawerProduct) {
      setActiveVariantId(null)
      setActiveModifiers([])
      return
    }
    const variants = productDrawerProduct.variants || []
    if (variants.length) {
      const fromStore = variants.find((v: any) => v.active)?.id
      const initial =
        fromStore ?? variants[1]?.id ?? variants[0]?.id ?? null
      setActiveVariantId(initial)
    } else {
      setActiveVariantId(null)
    }
    setActiveModifiers([])
  }, [productDrawerProduct?.id])

  const variants = productDrawerProduct?.variants || []
  const activeVariant = useMemo(
    () =>
      variants.find((v: any) => v.id === activeVariantId) ||
      variants[0] ||
      null,
    [variants, activeVariantId]
  )

  const modifiers = useMemo(() => {
    if (!productDrawerProduct) return [] as any[]
    let mods: any[] = []
    if (variants.length && activeVariant?.modifiers) {
      mods = activeVariant.modifiers
      if (activeVariant.modifierProduct) {
        const exists = mods.find(
          (m: any) => m.id === activeVariant.modifierProduct.id
        )
        if (!exists) {
          mods = [
            ...mods,
            {
              id: activeVariant.modifierProduct.id,
              name_ru: activeVariant.modifierProduct.name_ru,
              name_uz: activeVariant.modifierProduct.name_uz,
              name_en: activeVariant.modifierProduct.name_en,
              price:
                +activeVariant.modifierProduct.price - +activeVariant.price,
              assets: activeVariant.modifierProduct.assets || [
                { local: '/sausage_modifier.png' },
              ],
            },
          ]
        }
      }
    } else if (productDrawerProduct.modifiers) {
      mods = productDrawerProduct.modifiers
    }
    return mods.filter((m: any) => +m.price > 0)
  }, [productDrawerProduct, activeVariant])

  const basePrice = useMemo(() => {
    if (activeVariant?.price) return Number(activeVariant.price)
    if (productDrawerProduct?.price) return Number(productDrawerProduct.price)
    return 0
  }, [activeVariant, productDrawerProduct])

  const totalPrice = useMemo(() => {
    const modSum = modifiers
      .filter((m: any) => activeModifiers.includes(m.id))
      .reduce((acc: number, m: any) => acc + Number(m.price || 0), 0)
    return basePrice + modSum
  }, [basePrice, modifiers, activeModifiers])

  const localizedName = (() => {
    if (!productDrawerProduct) return ''
    const attr =
      productDrawerProduct?.attribute_data?.name?.['chopar']?.[locale] ||
      productDrawerProduct?.attribute_data?.name?.['chopar']?.['ru']
    return attr || productDrawerProduct?.name || ''
  })()

  const localizedDesc = (() => {
    if (!productDrawerProduct) return ''
    const attr =
      productDrawerProduct?.attribute_data?.description?.['chopar']?.[locale] ||
      productDrawerProduct?.attribute_data?.description?.['chopar']?.['ru']
    const raw =
      attr ||
      productDrawerProduct?.description ||
      productDrawerProduct?.desc ||
      ''
    return raw
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  })()

  const toggleModifier = (modId: number) => {
    if (!productDrawerProduct) return
    const modifierProduct = activeVariant?.modifierProduct || null
    if (activeModifiers.includes(modId)) {
      const current = modifiers.find((m: any) => m.id === modId)
      if (!current || current.price === 0) return
      setActiveModifiers((prev) => prev.filter((id) => id !== modId))
      return
    }
    let next = [...activeModifiers, modId]
    if (modifierProduct) {
      const sausage = modifiers.find((m: any) => m.id === modifierProduct.id)
      const current = modifiers.find((m: any) => m.id === modId)
      if (
        sausage &&
        current &&
        next.includes(modifierProduct.id) &&
        sausage.price < current.price
      ) {
        next = next.filter((id) => id !== sausage.id)
      } else if (sausage && current && current.id === sausage.id) {
        const richer = modifiers
          .filter((m: any) => m.price > sausage.price)
          .map((m: any) => m.id)
        next = next.filter((id) => !richer.includes(id))
        next.push(modId)
      }
    }
    setActiveModifiers(next)
  }

  const handleAddToCart = async () => {
    if (!productDrawerProduct) return
    setIsLoading(true)
    try {
      await setCsrf()
      const modifierProduct = activeVariant?.modifierProduct || null
      let selectedProdId = activeVariant?.id ?? +productDrawerProduct.id
      let selectedModifiers: any[] = modifiers
        .filter((m: any) => activeModifiers.includes(m.id))
        .map((m: any) => ({ id: m.id }))

      if (modifierProduct && activeModifiers.includes(modifierProduct.id)) {
        selectedProdId = modifierProduct.id
        const otherPrices = modifiers
          .filter(
            (m: any) =>
              m.id !== modifierProduct.id && activeModifiers.includes(m.id)
          )
          .map((m: any) => m.price)
        selectedModifiers = (modifierProduct.modifiers || [])
          .filter((m: any) => otherPrices.includes(m.price))
          .map((m: any) => ({ id: m.id }))
      }

      const otpToken = Cookies.get('opt_token')
      const basketId = localStorage.getItem('basketId')
      const queryDeliveryType =
        locationData?.deliveryType === 'pickup' ? '?delivery_type=pickup' : ''

      const payload = {
        variants: [
          { id: selectedProdId, quantity: 1, modifiers: selectedModifiers },
        ],
      }
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${otpToken}`,
      }

      let basketData: any
      if (basketId) {
        const { data } = await axios.post(
          `${webAddress}/api/baskets-lines${queryDeliveryType}`,
          { basket_id: basketId, ...payload },
          { headers, withCredentials: true }
        )
        basketData = data.data
      } else {
        const { data } = await axios.post(
          `${webAddress}/api/baskets${queryDeliveryType}`,
          payload,
          { headers, withCredentials: true }
        )
        basketData = data.data
        localStorage.setItem('basketId', basketData.encoded_id)
      }

      await mutate(
        {
          id: basketData.id,
          createdAt: '',
          currency: { code: basketData.currency },
          taxesIncluded: basketData.tax_total,
          lineItems: basketData.lines,
          lineItemsSubtotalPrice: basketData.sub_total,
          subtotalPrice: basketData.sub_total,
          totalPrice: basketData.total,
        },
        false
      )

      trackAddToCart({
        product_id: productDrawerProduct.id,
        product_name: productDrawerProduct.name,
        variant_id: selectedProdId,
        quantity: 1,
        price: basePrice / 100,
      })

      closeProductDrawer()
    } catch (e) {
      // swallow
    } finally {
      setIsLoading(false)
    }
  }

  const variantLabel = (v: any) =>
    locale === 'uz'
      ? v.custom_name_uz
      : locale === 'en'
        ? v.custom_name_en
        : v.custom_name

  const modifierLabel = (m: any) => {
    const byLocale =
      (locale === 'uz' && m.name_uz) ||
      (locale === 'en' && m.name_en) ||
      m.name_ru
    return byLocale || m.name || ''
  }

  const productImage = productDrawerProduct?.image || null

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(v) => !v && closeProductDrawer()}
      direction="bottom"
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 z-40" />
        <Drawer.Content className="bg-white flex flex-col rounded-t-[24px] fixed bottom-0 left-0 right-0 max-h-[92vh] z-50 outline-none">
          <Drawer.Title className="sr-only">{localizedName}</Drawer.Title>
          <div className="mx-auto w-10 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mt-2 mb-1" />

          <div className="overflow-y-auto flex-1 pb-[120px]">
            {productImage && (
              <div
                className="relative w-full bg-gradient-to-b from-gray-50 to-white"
                style={{ paddingTop: '70%' }}
              >
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <Image
                    src={productImage}
                    alt={localizedName}
                    width={420}
                    height={420}
                    sizes="(max-width: 768px) 90vw, 420px"
                    className="max-h-full w-auto object-contain"
                    style={{ height: 'auto' }}
                    priority
                  />
                </div>
              </div>
            )}

            <div className="px-5 pt-4">
              <h2 className="text-2xl font-extrabold text-gray-900 leading-tight">
                {localizedName}
              </h2>
              {localizedDesc && (
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                  {localizedDesc}
                </p>
              )}
            </div>

            {variants.length > 1 && (
              <div className="px-5 mt-5">
                <div className="bg-gray-100 rounded-full p-1 flex gap-1">
                  {variants.map((v: any) => {
                    const isActive = v.id === activeVariant?.id
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => {
                          setActiveVariantId(v.id)
                          setActiveModifiers([])
                        }}
                        className="flex-1 h-10 rounded-full text-sm font-semibold transition-colors"
                        style={{
                          background: isActive ? '#fff' : 'transparent',
                          color: isActive ? '#111827' : '#6B7280',
                          boxShadow: isActive
                            ? '0 1px 2px rgba(0,0,0,0.06)'
                            : 'none',
                        }}
                      >
                        {variantLabel(v)}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {modifiers.length > 0 && (
              <div className="px-5 mt-6">
                <h3 className="text-base font-bold text-gray-900 mb-3">
                  {t('Добавить в пиццу')}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {modifiers.map((mod: any) => {
                    const isActive = activeModifiers.includes(mod.id)
                    return (
                      <button
                        key={mod.id}
                        type="button"
                        onClick={() => toggleModifier(mod.id)}
                        className="relative bg-white rounded-2xl border text-left transition-all overflow-hidden"
                        style={{
                          borderColor: isActive ? YELLOW : '#E5E7EB',
                          borderWidth: isActive ? 2 : 1,
                          padding: isActive ? 11 : 12,
                        }}
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className="w-16 h-16 mb-2 flex items-center justify-center">
                            <img
                              src={getAssetUrl(mod.assets)}
                              alt={modifierLabel(mod)}
                              className="max-w-full max-h-full object-contain"
                              loading="lazy"
                            />
                          </div>
                          <div className="text-[13px] font-semibold text-gray-800 leading-tight line-clamp-2 min-h-[32px]">
                            {modifierLabel(mod)}
                          </div>
                          <div
                            className="text-[13px] font-bold mt-1"
                            style={{ color: isActive ? YELLOW : '#111827' }}
                          >
                            +{formatPrice(mod.price, locale)}
                          </div>
                        </div>
                        {isActive && (
                          <div
                            className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-white"
                            style={{ background: YELLOW }}
                          >
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <div
            className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 py-4"
            style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
          >
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isLoading}
              className="w-full h-14 rounded-full font-bold text-white flex items-center justify-between px-6 transition-opacity disabled:opacity-70"
              style={{ background: YELLOW }}
            >
              <span className="text-base">
                {isLoading ? t('Загрузка...') : t('В корзину')}
              </span>
              <span className="text-base">{formatPrice(totalPrice, locale)}</span>
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

export default ProductDrawerApp
