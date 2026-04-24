'use client'

import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import { useCart } from '@framework/cart'
import { useUI } from '@components/ui/context'
import { trackAddToCart } from '@lib/posthog-events'

const webAddress = process.env.NEXT_PUBLIC_API_URL

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

export type UseProductBuilder = ReturnType<typeof useProductBuilder>

export function useProductBuilder(
  product: any | null,
  onAdded?: () => void
) {
  const { locationData } = useUI() as any
  const { mutate } = useCart()

  const [activeVariantId, setActiveVariantId] = useState<number | null>(null)
  const [activeModifiers, setActiveModifiers] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!product) {
      setActiveVariantId(null)
      setActiveModifiers([])
      return
    }
    const variants = product.variants || []
    if (variants.length) {
      const fromStore = variants.find((v: any) => v.active)?.id
      const initial =
        fromStore ?? variants[1]?.id ?? variants[0]?.id ?? null
      setActiveVariantId(initial)
    } else {
      setActiveVariantId(null)
    }
    setActiveModifiers([])
  }, [product?.id])

  const variants: any[] = product?.variants || []
  const activeVariant = useMemo(
    () =>
      variants.find((v: any) => v.id === activeVariantId) ||
      variants[0] ||
      null,
    [variants, activeVariantId]
  )

  const modifiers = useMemo(() => {
    if (!product) return [] as any[]
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
    } else if (product.modifiers) {
      mods = product.modifiers
    }
    return mods.filter((m: any) => +m.price > 0)
  }, [product, activeVariant])

  const basePrice = useMemo(() => {
    if (activeVariant?.price) return Number(activeVariant.price)
    if (product?.price) return Number(product.price)
    return 0
  }, [activeVariant, product])

  const totalPrice = useMemo(() => {
    const modSum = modifiers
      .filter((m: any) => activeModifiers.includes(m.id))
      .reduce((acc: number, m: any) => acc + Number(m.price || 0), 0)
    return basePrice + modSum
  }, [basePrice, modifiers, activeModifiers])

  const selectVariant = (id: number) => {
    setActiveVariantId(id)
    setActiveModifiers([])
  }

  const toggleModifier = (modId: number) => {
    if (!product) return
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

  const addToCart = async () => {
    if (!product) return
    setIsLoading(true)
    try {
      await setCsrf()
      const modifierProduct = activeVariant?.modifierProduct || null
      let selectedProdId = activeVariant?.id ?? +product.id
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
        product_id: product.id,
        product_name: product.name,
        variant_id: selectedProdId,
        quantity: 1,
        price: basePrice / 100,
      })

      onAdded?.()
    } catch (e) {
      // swallow
    } finally {
      setIsLoading(false)
    }
  }

  return {
    variants,
    activeVariant,
    activeVariantId,
    selectVariant,
    modifiers,
    activeModifiers,
    toggleModifier,
    basePrice,
    totalPrice,
    isLoading,
    addToCart,
  }
}
