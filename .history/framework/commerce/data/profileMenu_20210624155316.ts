export type profileMenuItem = {
  href: string
  icon: string
  langCode: string
}

const menuItems: profileMenuItem[] = [
  {
    href: '/profile',
    icon: 'bonuses.png',
    langCode: 'profile_bonuses',
  },
  {
    href: '/profile/orders',
    icon: 'order.png',
    langCode: 'profile_orders',
  },
  {
    href: '/profile/account',
    icon: 'personal.png',
    langCode: 'profile_account',
  },
  {
    href: '/profile/logout',
    icon: 'logout.png',
    langCode: 'profile_logout',
  },
]

export default menuItems
