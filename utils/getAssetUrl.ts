const webAddress =
  process.env.NEXT_PUBLIC_CDN_URL || 'https://cdn.choparpizza.uz'

interface Asset {
  location?: string
  filename?: string
  local?: string
}

export default function getAssetUrl(
  assets?: Asset[] | null,
  fallback = '/no_photo.svg'
): string {
  if (!assets?.length) return fallback
  const { location, filename, local } = assets[0]
  if (local) return local
  if (!location || !filename) return fallback
  return `${webAddress}/storage/${location}/${filename}`
}

// Cart line products can come without their own assets (child variants
// inherit the image from the parent). Backend now copies the parent URL
// into product.image — try that first, fall back to assets, then to the
// "no photo" placeholder.
export function pickProductImage(
  product?: { image?: string | null; assets?: Asset[] | null } | null,
  fallback = '/no_photo.svg'
): string {
  if (product?.image) return product.image
  return getAssetUrl(product?.assets, fallback)
}
