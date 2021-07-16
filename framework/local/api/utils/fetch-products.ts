import { CommerceAPIConfig } from '@commerce/api'

const getProducts = async ({ fetch }: CommerceAPIConfig) => {
  const { data } = await fetch(
    '',
    {
      variables: {
        apiUrl: 'products/public?perSection=1',
      },
    },
    {
      method: 'GET',
    }
  )
  return data
}
export default getProducts
