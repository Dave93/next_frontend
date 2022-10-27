import { Layout } from '@components/common'
import OrderAccept from '@components_new/order/OrderAccept'
import commerce from '@lib/api/commerce'
import { GetServerSidePropsContext } from 'next'

export async function getServerSideProps({
  preview,
  locale,
  locales,
}: GetServerSidePropsContext) {
  const config = { locale, locales }
  const productsPromise = commerce.getAllProducts({
    variables: { first: 6 },
    config,
    preview,
    // Saleor provider only
    ...({ featured: true } as any),
  })
  const pagesPromise = commerce.getAllPages({ config, preview })
  const siteInfoPromise = commerce.getSiteInfo({ config, preview })
  const { products } = await productsPromise
  const { pages } = await pagesPromise
  const { categories, brands, topMenu, footerInfoMenu, socials } =
    await siteInfoPromise

  return {
    props: {
      products,
      categories,
      brands,
      pages,
      topMenu,
      footerInfoMenu,
      socials,
      cleanBackground: true
    },
  }
}


export default function OrderId() {
  return (
    <div>
      <OrderAccept />
    </div>
  )
}



OrderId.Layout = Layout
