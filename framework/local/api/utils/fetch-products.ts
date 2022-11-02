import { CommerceAPIConfig } from '@commerce/api'

const getProducts = async ({ fetch, queryParams }: CommerceAPIConfig) => {
  const { data } = await fetch(
    '',
    {
      variables: {
        apiUrl: `products/public?perSection=1${
          queryParams && queryParams.city
            ? '?city_slug=' + queryParams.city
            : '?city_slug=tashkent'
        }`,
      },
    },
    {
      method: 'GET',
    }
  )

  return data
}
export default getProducts
