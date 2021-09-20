import { useMemo } from 'react'
import { SWRHook } from '@commerce/utils/types'
import useCart, { UseCart } from '@commerce/cart/use-cart'

export default useCart as UseCart<typeof handler>

export const handler: SWRHook<any> = {
  fetchOptions: {
    query: 'baskets/',
  },
  async fetcher({ input, fetch, options }) {
    if (input.cartId) {
      const data = await fetch({
        variables: {
          apiUrl: options.query + input.cartId,
        },
        method: 'GET',
      })
      if (data && data.id) {
        return {
          id: data.id,
          createdAt: '',
          currency: { code: data.currency },
          taxesIncluded: data.tax_total,
          lineItems: data.lines,
          lineItemsSubtotalPrice: data.sub_total,
          subtotalPrice: data.sub_total,
          totalPrice: data.total,
        }
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
          Object.create(response, {
            isEmpty: {
              get() {
                return (response.data?.lineItems?.length ?? 0) <= 0
              },
              enumerable: true,
            },
          }),
        []
      )
    },
}
