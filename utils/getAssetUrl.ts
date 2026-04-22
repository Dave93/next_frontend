const webAddress = process.env.NEXT_PUBLIC_CDN_URL

interface Asset {
  location?: string
  filename?: string
}

export default function getAssetUrl(
  assets?: Asset[] | null,
  fallback = '/no_photo.svg'
): string {
  if (!assets?.length) return fallback
  const { location, filename } = assets[0]
  if (!location || !filename) return fallback
  if (!webAddress) return `/storage/${location}/${filename}`
  return `${webAddress}/storage/${location}/${filename}`
}
