import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { fetchSiteInfo } from '../../../../lib/data/site-info'
import { fetchProductById } from '../../../../lib/data/products'
import ProductDetailApp from '../../../../components_new/product/ProductDetailApp'
import ProductJsonLd from '../../../../components_new/seo/ProductJsonLd'
import BreadcrumbsJsonLd from '../../../../components_new/seo/BreadcrumbsJsonLd'
import { crumbLabel, localizedPath } from '../../../../lib/seo/alternates'
import type { City } from '@commerce/types/cities'

type Params = { city: string; id: string }

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { city, id } = await params
  const base = 'https://choparpizza.uz'
  const locale = (await getLocale()) as 'ru' | 'uz' | 'en'
  const product = await fetchProductById(id, city)
  const name =
    product?.attribute_data?.name?.['chopar']?.[locale] ||
    product?.attribute_data?.name?.['chopar']?.['ru'] ||
    product?.name ||
    ''
  const rawDesc =
    product?.attribute_data?.description?.['chopar']?.[locale] ||
    product?.attribute_data?.description?.['chopar']?.['ru'] ||
    product?.description ||
    ''
  const description =
    String(rawDesc)
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 160) || undefined
  const orderSuffix =
    locale === 'uz'
      ? 'yetkazib berish bilan buyurtma qiling'
      : locale === 'en'
      ? 'order with delivery'
      : 'заказать с доставкой'
  const productFallback =
    locale === 'uz'
      ? 'Chopar Pizza — Mahsulot'
      : locale === 'en'
      ? 'Chopar Pizza — Product'
      : 'Chopar Pizza — Продукт'
  const title = name
    ? `${name} — ${orderSuffix} | Chopar Pizza`
    : productFallback
  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: `${base}/${city}/product/${id}`,
      languages: {
        ru: `${base}/${city}/product/${id}`,
        uz: `${base}/uz/${city}/product/${id}`,
        en: `${base}/en/${city}/product/${id}`,
        'x-default': `${base}/${city}/product/${id}`,
      },
    },
    openGraph: {
      title: name || 'Chopar Pizza',
      description,
      url: `${base}/${city}/product/${id}`,
      type: 'website',
      images: product?.image
        ? [{ url: product.image, alt: name }]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: name || 'Chopar Pizza',
      description,
      images: product?.image ? [product.image] : undefined,
    },
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { city: citySlug, id } = await params
  const siteInfo = await fetchSiteInfo()
  const cities = (siteInfo as any).cities as City[]
  const currentCity = cities.find((c) => c.slug === citySlug)
  if (!currentCity) notFound()

  const product = await fetchProductById(id, citySlug)
  if (!product) notFound()

  const locale = (await getLocale()) as 'ru' | 'uz' | 'en'
  const productName =
    product?.attribute_data?.name?.['chopar']?.[locale] ||
    product?.attribute_data?.name?.['chopar']?.['ru'] ||
    product?.name ||
    ''
  return (
    <>
      <ProductJsonLd product={product} citySlug={citySlug} locale={locale} />
      <BreadcrumbsJsonLd
        items={[
          {
            name: crumbLabel(locale, 'home'),
            url: localizedPath(locale, `/${citySlug}`),
          },
          {
            name: productName,
            url: localizedPath(locale, `/${citySlug}/product/${id}`),
          },
        ]}
      />
      <ProductDetailApp product={product} />
    </>
  )
}
