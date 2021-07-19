import { CommerceAPIConfig } from '@commerce/api'

const getCategories = async ({ fetch }: CommerceAPIConfig) => {
  const { data } = await fetch(
    '',
    {
      variables: {
        apiUrl: 'categories/root',
      },
    },
    {
      method: 'GET',
    }
  )
  return data
}
export default getCategories
