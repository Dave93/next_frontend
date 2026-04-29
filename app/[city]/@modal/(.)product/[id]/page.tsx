import { notFound } from 'next/navigation'
import { fetchProductById } from '../../../../../lib/data/products'
import ProductQuickModal from '../../../../../components_new/product/ProductQuickModal'

type Params = { city: string; id: string }

export default async function InterceptedProductPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { city: citySlug, id } = await params
  const product = await fetchProductById(id, citySlug)
  if (!product) notFound()
  return <ProductQuickModal product={product} />
}
