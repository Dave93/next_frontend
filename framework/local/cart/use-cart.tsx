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
      let additionalQuery = ''
      if (input.locationData && input.locationData.deliveryType == 'pickup') {
        additionalQuery = `?delivery_type=pickup`
      }
      const data = await fetch({
        variables: {
          apiUrl: options.query + input.cartId + additionalQuery,
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
          discountTotal: data.discount_total,
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
          discountTotal: 0,
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
        discountTotal: 0,
      }
    }
  },
  useHook:
    ({ useData }) =>
    (input) => {
      const response = useData({
        swrOptions: {
          revalidateOnFocus: false,
          ...input?.swrOptions,
        },
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
