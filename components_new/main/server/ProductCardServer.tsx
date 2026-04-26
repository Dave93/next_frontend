import Image from 'next/image'
import { Link } from '../../../i18n/navigation'
import ProductCardActions from '../islands/ProductCardActions'
import type { SlimProduct } from '../../../lib/data/menu-dto'

type Props = {
  product: SlimProduct
  citySlug: string
  channelName: string
  priority?: boolean
}

export default function ProductCardServer({
  product,
  citySlug,
  channelName,
  priority,
}: Props) {
  const productHref = `/${citySlug}/product/${product.id}`
  const altName = product.name || ''

  return (
    <div
      className="overflow-hidden bg-white rounded-[20px] md:rounded-[15px] hover:shadow-xl shadow-sm group md:py-3 md:px-3 flex flex-col h-full"
      id={`prod-${product.id}`}
      itemScope
      itemType="https://schema.org/Product"
    >
      {/* Mobile compact vertical card */}
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
                itemProp="image"
                priority={priority}
                loading={priority ? undefined : 'lazy'}
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
          <div
            className="text-center text-sm font-semibold mb-1 truncate"
            itemProp="name"
          >
            {product.name}
          </div>
        </Link>
        {product.description && (
          <div
            className="text-xs text-gray-600 mb-2 product-desc-clamp"
            itemProp="description"
          >
            {product.description}
          </div>
        )}
        <ProductCardActions product={product} channelName={channelName} />
      </div>

      {/* Desktop card */}
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
                itemProp="image"
                priority={priority}
                loading={priority ? undefined : 'lazy'}
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
          <div
            className="font-serif mt-4 text-xl uppercase"
            itemProp="name"
          >
            {product.name}
          </div>
        </Link>
        <div className="flex flex-col flex-grow w-full">
          {product.description && (
            <div
              className="mt-1 flex-grow product-desc-clamp"
              itemProp="description"
            >
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
