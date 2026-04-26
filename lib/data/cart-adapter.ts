/**
 * Convert legacy backend cart response (lineItems shape from
 * framework/local/cart/use-cart.tsx) into the slim CartLine shape that
 * lib/stores/cart-store.ts uses.
 *
 * Backend lineItem looks like:
 *   {
 *     id: number,
 *     quantity: number,
 *     total: number,
 *     variant: {
 *       id: number,
 *       product: { id: number, attribute_data: {...}, image, ... },
 *       attribute_data, price, modifiers?
 *     },
 *     modifiers?: [{ id, name, price }]
 *   }
 */

import type { CartLine, CartLineModifier } from '../stores/cart-store'

function pickName(rawProduct: any, channel = 'chopar'): string {
  if (!rawProduct) return ''
  const ad = rawProduct.attribute_data?.name?.[channel]
  if (ad) return ad.ru || ad.uz || ad.en || ''
  return rawProduct.custom_name || rawProduct.name || ''
}

function pickImage(rawProduct: any, lineItem: any): string | undefined {
  return (
    rawProduct?.image ||
    lineItem?.variant?.image ||
    lineItem?.variant?.product?.image ||
    undefined
  )
}

export function adaptServerCartToLines(cartData: any): CartLine[] {
  const items: any[] = Array.isArray(cartData?.lineItems)
    ? cartData.lineItems
    : []
  if (!items.length) return []

  return items
    .map<CartLine | null>((it) => {
      if (!it || typeof it.id !== 'number') return null
      const variant = it.variant || {}
      const product = variant.product || {}
      const price = Number(variant.price ?? it.price ?? 0)
      const modifiers: CartLineModifier[] = Array.isArray(it.modifiers)
        ? it.modifiers.map((m: any) => ({
            id: Number(m.id),
            name: m.name || m.name_ru || '',
            price: Number(m.price ?? 0),
          }))
        : []
      const productId = Number(product.id ?? variant.product_id ?? 0)
      return {
        id: Number(it.id),
        productId,
        variantId: typeof variant.id === 'number' ? variant.id : undefined,
        name: pickName(product) || pickName(variant) || it.name || '',
        qty: Number(it.quantity ?? 0),
        price,
        image: pickImage(product, it),
        modifiers: modifiers.length ? modifiers : undefined,
      }
    })
    .filter((x): x is CartLine => x !== null)
}

export function pickBasketIdFromCart(cartData: any): string | null {
  if (!cartData) return null
  const id = cartData.id
  if (typeof id === 'string' && id) return id
  if (typeof id === 'number') return String(id)
  return null
}
