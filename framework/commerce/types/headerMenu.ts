export type LinkLabel = {
  ru: string
  uz: string
}

export type LinkItem = {
  id: string
  href: string
  label: LinkLabel
}

export type HeaderMenuItems = {
  menuItems: APILinkItem[]
  setMobMenuOpen?: any
}

export type APILinkItem = {
  id: number
  name_ru: string
  name_uz: string
  href: string
  sort: number
  type_id: number
  type: any
}
