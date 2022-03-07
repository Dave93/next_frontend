import { CommerceAPIConfig } from '@commerce/api'

const getCategories = async ({ fetch, queryParams }: CommerceAPIConfig) => {
  console.log(queryParams)
  const { data } = await fetch(
    ``,
    {
      variables: {
        apiUrl: `categories/root${
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
export default getCategories
