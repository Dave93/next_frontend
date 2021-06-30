import { FetcherError } from '@commerce/utils/errors'
import type { GraphQLFetcher } from '@commerce/api'
import type { LocalConfig } from '../index'
import fetch from './fetch'
import { API_URL } from '../../const'

const fetchGraphqlApi: (getConfig: () => LocalConfig) => GraphQLFetcher =
  (getConfig) =>
  async (query: string, { variables, preview } = {}, fetchOptions) => {
    const config = getConfig()
    const { locale, apiUrl, ...vars } = variables ?? {}
    const res = await fetch(API_URL + apiUrl, {
      ...fetchOptions,
      method: fetchOptions?.method ?? 'POST',
      headers: {
        ...fetchOptions?.headers,
        'Content-Type': 'application/json',
      },
      body:
        fetchOptions?.method != 'GET'
          ? JSON.stringify({
              query,
              variables: vars,
            })
          : undefined,
    })

    const json = await res.json()
    if (json.errors) {
      throw new FetcherError({
        errors: json.errors ?? [{ message: 'Failed to fetch for API' }],
        status: res.status,
      })
    }

    return { data: json.data, res }
  }

export default fetchGraphqlApi
