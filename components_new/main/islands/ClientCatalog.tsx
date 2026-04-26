'use client'

import { FC, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { Link } from '../../../i18n/navigation'
import ProductCardActions from './ProductCardActions'
import { CatalogSkeleton } from '../server/skeletons'
import type {
  SlimMenu,
  SlimSection,
  SlimProduct,
} from '../../../lib/data/menu-dto'

type Props = {
  citySlug: string
  locale: string
  channelName: string
  skipSectionIds?: number[]
}

async function fetchMenu(
  citySlug: string,
  locale: string
): Promise<SlimMenu> {
  const res = await fetch(`/api/menu/${citySlug}/${locale}`, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`Menu fetch ${res.status}`)
  return res.json()
}

const ProductCardClient: FC<{
  product: SlimProduct
  citySlug: string
  channelName: string
}> = ({ product, citySlug, channelName }) => {
  const productHref = `/${citySlug}/product/${product.id}`
  const altName = product.name || ''
  return (
    <div
      className="overflow-hidden bg-white rounded-[20px] md:rounded-[15px] hover:shadow-xl shadow-sm group md:py-3 md:px-3 flex flex-col h-full"
      id={`prod-${product.id}`}
    >
      <div className="md:hidden p-3">
        <Link href={productHref} prefetch={false}>
          <div className="text-center mb-2 relative">
            {product.image ? (
              <Image
                src={product.image}
                width={120}
                height={96}
                sizes="120px"
                alt={altName}
                className="mx-auto object-contain"
                loading="lazy"
              />
            ) : (
              <img
                src="/no_photo.svg"
                width={120}
                height={96}
                alt={altName}
                className="mx-auto"
                loading="lazy"
              />
            )}
          </div>
          <div className="text-center text-sm font-semibold mb-1 truncate">
            {product.name}
          </div>
        </Link>
        {product.description && (
          <div className="text-xs text-gray-600 mb-2 product-desc-clamp">
            {product.description}
          </div>
        )}
        <ProductCardActions product={product} channelName={channelName} />
      </div>
      <div className="hidden md:flex md:flex-col md:h-full">
        <Link
          href={productHref}
          prefetch={false}
          className="cursor-pointer"
        >
          <div className="text-center relative">
            {product.image ? (
              <Image
                src={product.image}
                width={250}
                height={250}
                sizes="250px"
                alt={altName}
                className="transform motion-safe:group-hover:scale-105 transition duration-500 object-cover"
                loading="lazy"
              />
            ) : (
              <img
                src="/no_photo.svg"
                width={250}
                height={250}
                alt={altName}
                className="rounded-full transform motion-safe:group-hover:scale-105 transition duration-500"
                loading="lazy"
              />
            )}
          </div>
          <div className="font-serif mt-4 text-xl uppercase">
            {product.name}
          </div>
        </Link>
        <div className="flex flex-col flex-grow w-full">
          {product.description && (
            <div className="mt-1 flex-grow product-desc-clamp">
              {product.description}
            </div>
          )}
          <ProductCardActions
            product={product}
            channelName={channelName}
          />
        </div>
      </div>
    </div>
  )
}

const CategorySectionClient: FC<{
  section: SlimSection
  citySlug: string
  channelName: string
}> = ({ section, citySlug, channelName }) => (
  <div id={`productSection_${section.id}`}>
    <div className="px-3 md:px-0 mb-5 md:mb-8 flex flex-col items-center">
      <h2 className="font-serif text-3xl md:text-4xl text-center">
        {section.icon ? `${section.icon} ` : ''}
        {section.name}
      </h2>
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-3 md:grid-cols-2 gap-2.5 md:gap-3 px-4 md:px-0">
      {section.items.map((p) => (
        <ProductCardClient
          key={p.id}
          product={p}
          citySlug={citySlug}
          channelName={channelName}
        />
      ))}
    </div>
    {section.description && (
      <div className="mt-5 px-4 md:px-0">
        <p>{section.description}</p>
      </div>
    )}
  </div>
)

const ClientCatalog: FC<Props> = ({
  citySlug,
  locale,
  channelName,
  skipSectionIds = [],
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['menu', citySlug, locale],
    queryFn: () => fetchMenu(citySlug, locale),
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const skipSet = useMemo(() => new Set(skipSectionIds), [skipSectionIds])

  if (isLoading) return <CatalogSkeleton />
  if (error || !data) return null

  const sectionsToRender = data.sections.filter(
    (s) => !s.halfMode && !skipSet.has(s.id) && s.items.length > 0
  )

  return (
    <>
      {sectionsToRender.map((section) => (
        <CategorySectionClient
          key={section.id}
          section={section}
          citySlug={citySlug}
          channelName={channelName}
        />
      ))}
    </>
  )
}

export default ClientCatalog
