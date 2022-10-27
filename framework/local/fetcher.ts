import { Fetcher } from '@commerce/utils/types'
import { API_URL } from './const'

import { FetcherError } from '@commerce/utils/errors'

export function getError(errors: any[] | null, status: number) {
  errors = errors ?? [{ message: 'Failed to fetch Shopify API' }]
  return new FetcherError({ errors, status })
}

export async function getAsyncError(res: Response) {
  const data = await res.json()
  return getError(data.errors, res.status)
}

const handleFetchResponse = async (res: Response) => {
  if (res.ok) {
    const { data, errors } = await res.json()

    if (errors && errors.length) {
      throw getError(errors, res.status)
    }

    return data
  }

  throw await getAsyncError(res)
}

const fetcher: Fetcher = async ({
  url = API_URL,
  method = 'GET',
  variables,
  query,
}) => {
  const { locale, apiUrl, ...vars } = variables ?? {}
  if (!url || typeof url == undefined) {
    url = API_URL
  }
  return handleFetchResponse(
    await fetch(url + apiUrl, {
      method,
      body:
        query || (vars && Object.values(vars).length)
          ? JSON.stringify({ query, variables: vars })
          : null,
      headers: {
        'Content-Type': 'application/json',
        ...(locale && {
          'Accept-Language': locale,
        }),
      },
    })
  )
}

export default fetcher
