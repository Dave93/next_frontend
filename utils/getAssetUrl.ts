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
