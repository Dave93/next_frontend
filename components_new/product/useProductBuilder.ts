'use client'

import { useEffect, useMemo, useState } from 'react'
import { useCartStore, cartSelectors } from '../../lib/stores/cart-store'
import {
  useAddToCart,
  useUpdateCartQty,
} from '../../lib/hooks/useCartMutations'
import { useLocationStore } from '../../lib/stores/location-store'
import { trackAddToCart } from '@lib/posthog-events'

export type UseProductBuilder = ReturnType<typeof useProductBuilder>

export function useProductBuilder(
  product: any | null,
  onAdded?: () => void
) {
  const locationData = useLocationStore((s) => s.locationData) as any
  const cartLines = useCartStore(cartSelectors.lines)
  const updateQtyMutation = useUpdateCartQty()
  const addMutation = useAddToCart()
  const cartData: any = useMemo(
    () => ({
      lineItems: cartLines.map(
        (l) =>
          l._raw || {
            id: l.id,
            quantity: l.qty,
            variant: {
              id: l.variantId,
              product: { id: l.productId, name: l.name, image: l.image },
            },
          }
      ),
    }),
    [cartLines]
  )

  const [activeVariantId, setActiveVariantId] = useState<number | null>(null)
  const [activeModifiers, setActiveModifiers] = useState<number[]>([])
  const isLoading = addMutation.isPending

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
          // The sausage-rim modifier-product carries the FULL
          // pizza-with-rim image on the backend (high-res mp.image / CDN),
          // which crops to a generic texture inside a 56×56 modifier tile.
          // Use the static sausage icon so the rim is recognisable on
          // drawer, list card AND /product/[id] — same visual everywhere.
          // Names: backend's name_* are null and attribute_data.name.chopar
          // holds the full "ГРИБНАЯ Средняя+ СОСИСОЧНЫЙ БОРТ" title (wrong
          // for a tile). Use the short rim label, matching the other sausage
          // synthetic-modifier sites in the legacy product components.
          const mp = activeVariant.modifierProduct
          const ruName = mp.name_ru || 'Сосисочный борт'
          const uzName = mp.name_uz || "Sosiskali bo'rt"
          const enName = mp.name_en || 'Sausage border'
          mods = [
            ...mods,
            {
              id: mp.id,
              name: ruName,
              name_ru: ruName,
              name_uz: uzName,
              name_en: enName,
              price: +mp.price - +activeVariant.price,
              assets: [{ local: '/sausage_modifier.png' }],
            },
          ]
        }
      }
    } else if (product.modifiers) {
      mods = product.modifiers
    }
    return mods
      .filter((m: any) => +m.price > 0)
      .slice()
      .sort((a: any, b: any) => +a.price - +b.price)
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

  const effectiveProductId = useMemo(() => {
    if (!product) return null
    const modifierProduct = activeVariant?.modifierProduct
    if (
      modifierProduct &&
      activeModifiers.includes(modifierProduct.id)
    ) {
      return String(modifierProduct.id)
    }
    if (activeVariant) return String(activeVariant.id)
    return String(product.id)
  }, [product, activeVariant, activeModifiers])

  const cartLineItem = useMemo(() => {
    if (!effectiveProductId || !cartData?.lineItems?.length) return null
    return cartData.lineItems.find((item: any) => {
      return (
        String(item.variant?.id) === effectiveProductId ||
        String(item.variant?.product?.id) === effectiveProductId ||
        String(item.variant?.product_id) === effectiveProductId
      )
    })
  }, [cartData, effectiveProductId])

  const cartQuantity: number = (cartLineItem as any)?.quantity || 0

  const changeQuantity = (delta: number) => {
    if (!cartLineItem) return
    updateQtyMutation.mutate({
      lineId: Number((cartLineItem as any).id),
      delta: delta > 0 ? 1 : -1,
      currentQty: Number((cartLineItem as any).quantity || 0),
    })
  }

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

  const addToCart = () => {
    if (!product) return

    const modifierProduct = activeVariant?.modifierProduct || null
    let selectedProdId = activeVariant?.id ?? +product.id
    let selectedModifiers: { id: number }[] = modifiers
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

    const optimisticId = -Date.now()
    const optimisticModifiers = modifiers
      .filter((m: any) => activeModifiers.includes(m.id))
      .map((m: any) => ({
        id: Number(m.id),
        name: m.name || m.name_ru || '',
        price: Number(m.price ?? 0),
      }))

    addMutation.mutate({
      variants: [
        { id: selectedProdId, quantity: 1, modifiers: selectedModifiers },
      ],
      deliveryType: locationData?.deliveryType,
      optimisticLine: {
        id: optimisticId,
        productId: Number(product.id),
        variantId: selectedProdId,
        name: product?.name || '',
        qty: 1,
        price: basePrice,
        image: product?.image,
        modifiers: optimisticModifiers.length ? optimisticModifiers : undefined,
        _raw: {
          id: optimisticId,
          quantity: 1,
          total:
            basePrice +
            optimisticModifiers.reduce(
              (acc: number, m: any) => acc + Number(m.price || 0),
              0
            ),
          variant: {
            id: selectedProdId,
            product_id: Number(product.id),
            product,
          },
          modifiers: optimisticModifiers,
        },
      },
    })

    trackAddToCart({
      product_id: product.id,
      product_name: product.name,
      variant_id: selectedProdId,
      quantity: 1,
      price: basePrice / 100,
    })

    onAdded?.()
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
    cartQuantity,
    changeQuantity,
  }
}
