import { Product } from '@commerce/types/product'
import { GetAllProductsOperation } from '@commerce/types/product'
import type { OperationContext } from '@commerce/api/operations'
import type { LocalConfig, Provider } from '../index'
import data from '../../chopar_data.json'
import getProducts from '../utils/fetch-products'

export default function getAllProductsOperation({
  commerce,
}: OperationContext<any>) {
  async function getAllProducts<T extends GetAllProductsOperation>({
    query = '',
    variables,
    config,
  }: {
    query?: string
    variables?: T['variables']
    config?: Partial<LocalConfig>
    preview?: boolean
  } = {}): Promise<{ products: any[] | any[] }> {
    const cfg = commerce.getConfig(config)

    const result = await getProducts(cfg)
    return {
      products: result,
    }
  }
  return getAllProducts
}
