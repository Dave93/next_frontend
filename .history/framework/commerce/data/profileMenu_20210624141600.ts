export type profileMenuItem = {
  href: string
  icon: string
  langCode: string
}

const menuItems: profileMenuItem[] = [
  {
    href: '/profile',
    icon: '',
    langCode: 'profile_bonuses',
  },
  {
    href: '/profile/orders',
    icon: '',
    langCode: 'profile_orders',
  },
  {
    href: '/profile/account',
    icon: '',
    langCode: 'profile_account',
  },
  {
    href: '/profile/logout',
    icon: '',
    langCode: 'profile_logout',
  },
]

export default menuItems
