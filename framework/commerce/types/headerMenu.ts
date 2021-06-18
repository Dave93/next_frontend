type LinkLabel = {
  ru: string
  uz: string
}

export type LinkItem = {
  id: string
  href: string
  label: LinkLabel
}

export type HeaderMenuItems = {
  menuItems: LinkItem[]
}
