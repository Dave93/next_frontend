'use client'

import { FC, useMemo } from 'react'
import { useLocale } from 'next-intl'
import { useUI } from '@components/ui/context'

const cityHeading: Record<string, Record<string, string>> = {
  tashkent: {
    ru: 'Пицца для всей семьи в Ташкенте',
    uz: 'Toshkentdagi butun oila uchun pitsa',
    en: 'Pizza for the whole family in Tashkent',
  },
  samarkand: {
    ru: 'Пицца для всей семьи в Самарканде',
    uz: 'Samarqanddagi butun oila uchun pitsa',
    en: 'Pizza for the whole family in Samarkand',
  },
}

const CityHeading: FC = () => {
  const locale = useLocale()
  const { activeCity } = useUI()

  const heading = useMemo(() => {
    const slug = (activeCity as any)?.slug || 'tashkent'
    return (
      cityHeading[slug]?.[locale] ||
      cityHeading[slug]?.ru ||
      cityHeading.tashkent[locale] ||
      cityHeading.tashkent.ru
    )
  }, [activeCity, locale])

  return (
    <h1 className="py-1 md:text-4xl text-2xl w-max mt-4 mb-10 md:my-10 m-auto">
      {heading}
    </h1>
  )
}

export default CityHeading
