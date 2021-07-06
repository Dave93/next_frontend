import { OperationContext } from '@commerce/api/operations'
import { Category } from '@commerce/types/site'
import { LinkItem, APILinkItem } from '@commerce/types/headerMenu'
import { SocialIcons } from '@commerce/types/socialIcons'
import { LocalConfig } from '../index'
import getMenus from '../utils/fetch-menus'

export type GetSiteInfoResult<
  T extends { categories: any[]; brands: any[] } = {
    categories: LinkItem[]
    brands: any[]
    topMenu: APILinkItem[]
    footerInfoMenu: APILinkItem[]
    socials: SocialIcons[]
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
    return Promise.resolve({
      categories: [
        {
          id: '1',
          label: {
            ru: 'Пицца',
            uz: 'Picca',
          },
          href: '/s/1',
        },
        {
          id: '2',
          label: {
            ru: 'Сеты',
            uz: 'Setlar',
          },
          href: '/s/2',
        },
        {
          id: '3',
          label: {
            ru: 'Закуски',
            uz: 'Zakuski',
          },
          href: '/s/3',
        },
        {
          id: '4',
          label: {
            ru: 'Соусы',
            uz: 'Souslar',
          },
          href: '/s/4',
        },
        {
          id: '5',
          label: {
            ru: 'Салаты',
            uz: 'Salatlar',
          },
          href: '/s/5',
        },
        {
          id: '6',
          label: {
            ru: 'Напитки',
            uz: 'Ichimliklar',
          },
          href: '/s/6',
        },
      ],
      brands: [],
      topMenu,
      footerInfoMenu,
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
