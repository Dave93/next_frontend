// SWR-based commerce hook stub. The real implementation was removed
// when SWR was deleted from the project after Wave 3.7. Only types are
// kept so existing legacy framework code (vendure/bigcommerce/etc.)
// continues to type-check; nothing in the active app actually calls it.

export type ResponseState<Result> = {
  data?: Result
  error?: Error
  isLoading: boolean
  mutate: (...args: any[]) => any
}

export type UseData = (..._args: any[]) => ResponseState<any>

const useData: UseData = () => ({
  data: undefined,
  error: undefined,
  isLoading: false,
  mutate: () => Promise.resolve(undefined),
})

export default useData
