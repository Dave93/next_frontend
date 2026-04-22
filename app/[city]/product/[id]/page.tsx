import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fetchSiteInfo } from '../../../../lib/data/site-info'
import { fetchProductById } from '../../../../lib/data/products'
import ProductDetailApp from '../../../../components_new/product/ProductDetailApp'
import type { City } from '@commerce/types/cities'

type Params = { city: string; id: string }

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { city, id } = await params
  const base = 'https://choparpizza.uz'
  return {
    title: 'Chopar Pizza — Продукт',
    alternates: {
      canonical: `${base}/${city}/product/${id}`,
      languages: {
        ru: `${base}/${city}/product/${id}`,
        uz: `${base}/uz/${city}/product/${id}`,
        en: `${base}/en/${city}/product/${id}`,
      },
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

  return <ProductDetailApp product={product} channelName="chopar" />
}
