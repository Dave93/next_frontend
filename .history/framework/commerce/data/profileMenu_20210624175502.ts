export type profileMenuItem = {
  href: string
  icon: string
  langCode: string
  activeIcon: string
}

const menuItems: profileMenuItem[] = [
  {
    href: '/profile',
    activeIcon: '',
    icon: '/bonuses.svg',
    langCode: 'profile_bonuses',
  },
  {
    href: '/profile/orders',
    icon: '/order.png',
    activeIcon: '',
    langCode: 'profile_orders',
  },
  {
    href: '/profile/account',
    icon: '/personal.png',
    activeIcon: '',
    langCode: 'profile_account',
  },
  {
    href: '/profile/logout',
    icon: '/logout.png',
    activeIcon: '',
    langCode: 'profile_logout',
  },
]

export default menuItems
