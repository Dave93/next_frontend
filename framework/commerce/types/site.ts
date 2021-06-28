import { LinkItem } from './headerMenu'
import { SocialIcons } from './socialIcons'

export type Category = {
  id: string
  name: string
  slug: string
  path: string
}

export type Brand = any

export type SiteTypes = {
  category: Category
  brand: Brand
  topMenu: LinkItem
  footerInfoMenu: LinkItem
  socials: SocialIcons
}

export type GetSiteInfoOperation<T extends SiteTypes = SiteTypes> = {
  data: {
    categories: T['category'][]
    brands: T['brand'][]
    topMenu: T['topMenu'][]
    footerInfoMenu: T['footerInfoMenu'][]
    socials: T['socials'][]
  }
}
