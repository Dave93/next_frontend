import { CommerceAPIConfig } from '@commerce/api'

const getCategories = async ({ fetch, queryParams }: CommerceAPIConfig) => {
  const { data } = await fetch(
    '',
    {
      variables: {
        apiUrl: `categories/root${
          queryParams.city ? `?city_slug=${queryParams.city}` : ''
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
