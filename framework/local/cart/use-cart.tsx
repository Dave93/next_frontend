import { useMemo } from 'react'
import { SWRHook } from '@commerce/utils/types'
import useCart, { UseCart } from '@commerce/cart/use-cart'

export default useCart as UseCart<typeof handler>

export const handler: SWRHook<any> = {
  fetchOptions: {
    query: 'api/v1/baskets/',
  },
  async fetcher({ input, fetch, options }) {
    console.log(options)

    if (input.cartId) {
      const { data } = await fetch({
        variables: {
          apiUrl: options.query + input.cartId,
        },
        method: 'GET',
      })
      console.log('basketData', data)
    } else {
      return {
        id: '',
        createdAt: '',
        currency: { code: '' },
        taxesIncluded: '',
        lineItems: [],
        lineItemsSubtotalPrice: '',
        subtotalPrice: 0,
        totalPrice: 0,
      }
    }
  },
  useHook:
    ({ useData }) =>
    (input) => {
      const response = useData({
        swrOptions: { revalidateOnFocus: false, ...input?.swrOptions },
      })
      return useMemo(
        () =>
          Object.create(
            {},
            {
              isEmpty: {
                get() {
                  return true
                },
                enumerable: true,
              },
            }
          ),
        []
      )
    },
}
