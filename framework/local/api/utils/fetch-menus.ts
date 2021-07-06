import { CommerceAPIConfig } from '@commerce/api'

const getMenus = async ({ fetch }: CommerceAPIConfig) => {
  const { data } = await fetch(
    '',
    {
      variables: {
        apiUrl: 'menus',
      },
    },
    {
      method: 'GET',
    }
  )
  return data
}
export default getMenus
