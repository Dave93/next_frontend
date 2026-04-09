import type { GetServerSidePropsContext } from 'next'
import cookies from 'next-cookies'

export async function getServerSideProps({
  params,
  ...context
}: GetServerSidePropsContext) {
  const c = cookies(context)
  const citySlug = c.city_slug || 'tashkent'
  return {
    redirect: {
      destination: `/${citySlug}/product/${params?.id}`,
      permanent: true,
    },
  }
}

export default function ProductRedirect() {
  return null
}
