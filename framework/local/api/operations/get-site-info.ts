import { OperationContext } from '@commerce/api/operations'
import { Category } from '@commerce/types/site'
import { LinkItem, APILinkItem } from '@commerce/types/headerMenu'
import { SocialIcons } from '@commerce/types/socialIcons'
import { LocalConfig } from '../index'
import getMenus from '../utils/fetch-menus'
import getCategories from '../utils/fetch-categories'
import getCities from '../utils/fetch-cities'
import { City } from '@commerce/types/cities'

export type GetSiteInfoResult<
  T extends { categories: any[]; brands: any[] } = {
    categories: LinkItem[]
    brands: any[]
    topMenu: APILinkItem[]
    footerInfoMenu: APILinkItem[]
    socials: SocialIcons[]
    cities: City[]
  }
> = T

export default function getSiteInfoOperation({
  commerce,
}: OperationContext<any>) {
  async function getSiteInfo({
    query,
    variables,
    config,
  }: {
    query?: string
    variables?: any
    config?: Partial<LocalConfig>
    preview?: boolean
  } = {}): Promise<GetSiteInfoResult> {
    const cfg = commerce.getConfig(config)
    const { footer_info: footerInfoMenu, header: topMenu } = await getMenus(cfg)

    const cities = await getCities(cfg)

    const categories = await getCategories(cfg)
    return Promise.resolve({
      categories: categories.filter((cat: any) => !cat.half_mode),
      brands: [],
      topMenu,
      footerInfoMenu,
      cities,
      socials: [
        {
          code: 'fb',
          link: 'https://facebook.com',
        },
        {
          code: 'inst',
          link: 'https://instagram.com',
        },
        {
          code: 'tg',
          link: 'https://telegram.org',
        },
      ],
    })
  }

  return getSiteInfo
}
