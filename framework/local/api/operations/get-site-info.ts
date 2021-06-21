import { OperationContext } from '@commerce/api/operations'
import { Category } from '@commerce/types/site'
import { LinkItem } from '@commerce/types/headerMenu'
import { SocialIcons } from '@commerce/types/socialIcons'
import { LocalConfig } from '../index'

export type GetSiteInfoResult<
  T extends { categories: any[]; brands: any[] } = {
    categories: LinkItem[]
    brands: any[]
    topMenu: LinkItem[]
    footerInfoMenu: LinkItem[]
    socials: SocialIcons[]
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
      footerInfoMenu: [
        {
          id: '1',
          label: {
            ru: 'О нас',
            uz: 'Biz haqimizda',
          },
          href: '/about',
        },
        {
          id: '2',
          label: {
            ru: 'Франшиза',
            uz: 'Franshiza',
          },
          href: '/about/fran',
        },
        {
          id: '3',
          label: {
            ru: 'Акции',
            uz: 'Aksiyalar',
          },
          href: '/sale',
        },
        {
          id: '4',
          label: {
            ru: 'Доставка и оплата',
            uz: 'Yetkazish',
          },
          href: '/delivery',
        },
        {
          id: '5',
          label: {
            ru: 'Контакты',
            uz: 'Kontaktlar',
          },
          href: '/contacts',
        },
        {
          id: '6',
          label: {
            ru: 'Политика конфиденциальности',
            uz: 'Maxfiylik siyosati',
          },
          href: '/privacy',
        },
      ],
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
