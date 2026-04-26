/**
 * SWR-based useData stub. The legacy commerce-framework hook system is
 * no longer reachable from the application (cart/customer/wishlist now
 * use Zustand + TanStack Query directly). This file remains only to
 * satisfy types referenced by other files inside framework/commerce.
 */
import type {
  HookSWRInput,
  HookFetchInput,
  HookFetcherOptions,
  HookFetcherFn,
  Fetcher,
  SwrOptions,
  SWRHookSchemaBase,
} from './types'
import { CommerceError } from './errors'

export type ResponseState<Result> = {
  data?: Result
  error?: CommerceError
  isValidating?: boolean
  mutate: (...args: any[]) => Promise<any>
  isLoading: boolean
}

export type UseData = <H extends SWRHookSchemaBase>(
  options: {
    fetchOptions: HookFetcherOptions
    fetcher: HookFetcherFn<H>
  },
  input: HookFetchInput | HookSWRInput,
  fetcherFn: Fetcher,
  swrOptions?: SwrOptions<H['data'], H['fetcherInput']>
) => ResponseState<H['data']>

const useData: UseData = () => {
  return {
    data: undefined,
    error: undefined,
    isValidating: false,
    mutate: async () => undefined,
    isLoading: false,
  }
}

export default useData
