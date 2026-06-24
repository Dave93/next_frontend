/**
 * Safely extract a product's localized display name from the backend
 * `attribute_data.name[channel][locale]` shape.
 *
 * The raw access `product.attribute_data.name[channel][locale]` throws a
 * TypeError when any segment is missing — which happens for optimistically
 * added lines and recommendation items whose product shape is incomplete. A
 * thrown error in a cart render hits the App Router error boundary
 * ("Что-то пошло не так") and wipes the in-memory cart until a reload (DAV-624).
 *
 * This never throws: optional-chains the whole path and falls back to the
 * channel's `ru` value, then the flat `product.name` / `custom_name` that
 * optimistic lines always carry.
 */
export function pickProductName(
  product: any,
  channelName: string,
  locale?: string
): string {
  const m = product?.attribute_data?.name?.[channelName]
  return (
    m?.[locale || 'ru'] ||
    m?.['ru'] ||
    product?.name ||
    product?.custom_name ||
    ''
  )
}
