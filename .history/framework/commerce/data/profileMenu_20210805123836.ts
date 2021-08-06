export type profileMenuItem = {
  href: string
  icon: string
  langCode: string
  activeIcon: string
}

const menuItems: profileMenuItem[] = [
  {
    href: '/profile',
    activeIcon: '/activeBonuses.png',
    icon: '/bonuses.png',
    langCode: 'profile_bonuses',
  },
  {
    href: '/profile/orders',
    icon: '/order.png',
    activeIcon: '/activeOrder.png',
    langCode: 'profile_orders',
  },
  {
    href: '/profile/address',
    icon: '/logout.png',
    activeIcon: '/logout.png',
    langCode: 'profile_address',
  },
  {
    href: '/profile/account',
    icon: '/personal.png',
    activeIcon: '/activePersonal.png',
    langCode: 'profile_account',
  },
  {
    href: '/profile/logout',
    icon: '/logout.png',
    activeIcon: '/logout.png',
    langCode: 'profile_logout',
  },
]

export default menuItems
