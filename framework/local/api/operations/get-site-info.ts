import { OperationContext } from '@commerce/api/operations'
import { Category } from '@commerce/types/site'
import { LocalConfig } from '../index'

export type GetSiteInfoResult<
  T extends { categories: any[]; brands: any[] } = {
    categories: Category[]
    brands: any[]
  }
> = T

export default function getSiteInfoOperation({}: OperationContext<any>) {
  function getSiteInfo({
    query,
    variables,
    config: cfg,
  }: {
    query?: string
    variables?: any
    config?: Partial<LocalConfig>
    preview?: boolean
  } = {}): Promise<GetSiteInfoResult> {
    return Promise.resolve({
      categories: [
        {
          id: 'new-arrivals',
          name: 'New Arrivals',
          slug: 'new-arrivals',
          path: '/new-arrivals',
        },
        {
          id: 'featured',
          name: 'Featured',
          slug: 'featured',
          path: '/featured',
        },
      ],
      brands: [],
      topMenu: [
        {
          id: '1',
          href: '/menu',
          label: {
            ru: 'Меню',
            uz: 'Menyu',
          },
        },
        {
          id: '2',
          href: '/sale',
          label: {
            ru: 'Акции',
            uz: 'Aksiyalar',
          },
        },
        {
          id: '3',
          href: '/deliver',
          label: {
            ru: 'Доставка',
            uz: 'Yetkazish',
          },
        },
        {
          id: '4',
          href: '/contacts',
          label: {
            ru: 'Контакты',
            uz: 'Kontaktlar',
          },
        },
      ],
    })
  }

  return getSiteInfo
}
