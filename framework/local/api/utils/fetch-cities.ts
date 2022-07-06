import { CommerceAPIConfig } from '@commerce/api'

const getCities = async ({ fetch }: CommerceAPIConfig) => {
  const { data } = await fetch(
    '',
    {
      variables: {
        apiUrl: 'cities/public',
      },
    },
    {
      method: 'GET',
    }
  )
  return data
}
export default getCities
