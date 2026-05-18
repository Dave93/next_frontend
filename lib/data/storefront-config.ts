// Static storefront configuration.
//
// Replaces the legacy runtime fetch of `${API_URL}/api/configs/public`
// (a base64-encoded JSON payload backed by the Laravel `configs` DB table).
// All values are inlined at build time by Next.js from NEXT_PUBLIC_CHOPAR_*
// environment variables.
//
// Field names match the keys of the original DB-backed payload so existing
// call sites need no property renames.

export type PublicConfig = {
  yandexGeoKey: string
  workTimeRu: string
  workTimeUz: string
  workTimeEn: string
  workTimeStart: number
  workTimeEnd: number
  discount_value: number
  discount_end_date: string
  discount_disable_day: string
  discount_catalog_sections: string
}

export const storefrontConfig: Readonly<PublicConfig> = {
  yandexGeoKey: process.env.NEXT_PUBLIC_CHOPAR_YANDEX_GEO_KEY ?? '',
  workTimeRu: process.env.NEXT_PUBLIC_CHOPAR_WORK_TIME_RU ?? '',
  workTimeUz: process.env.NEXT_PUBLIC_CHOPAR_WORK_TIME_UZ ?? '',
  workTimeEn: process.env.NEXT_PUBLIC_CHOPAR_WORK_TIME_EN ?? '',
  workTimeStart:
    Number(process.env.NEXT_PUBLIC_CHOPAR_WORK_TIME_START) || 0,
  workTimeEnd: Number(process.env.NEXT_PUBLIC_CHOPAR_WORK_TIME_END) || 0,
  discount_value:
    Number(process.env.NEXT_PUBLIC_CHOPAR_DISCOUNT_VALUE) || 0,
  discount_end_date:
    process.env.NEXT_PUBLIC_CHOPAR_DISCOUNT_END_DATE ?? '',
  discount_disable_day:
    process.env.NEXT_PUBLIC_CHOPAR_DISCOUNT_DISABLE_DAY ?? '',
  discount_catalog_sections:
    process.env.NEXT_PUBLIC_CHOPAR_DISCOUNT_CATALOG_SECTIONS ?? '',
}
