export type profileMenuItem = {
  href: string
  icon: string
  langCode: string
  activeIcon: string
}

const menuItems: profileMenuItem[] = [
  // {
  //   href: '/profile',
  //   activeIcon: '/activeBonuses.png',
  //   icon: '/bonuses.png',
  //   langCode: 'profile_bonuses',
  // },
  {
    href: '/profile/orders',
    icon: '/order.svg',
    activeIcon: '/activeOrder.svg',
    langCode: 'profile_orders',
  },
  // {
  //   href: '/profile/address',
  //   icon: '/address.png',
  //   activeIcon: '/activeAddress.png',
  //   langCode: 'profile_address',
  // },
  {
    href: '/profile/account',
    icon: '/personal.svg',
    activeIcon: '/activePersonal.svg',
    langCode: 'profile_account',
  },
  {
    href: '/profile/logout',
    icon: '/logout.svg',
    activeIcon: '/logout.svg',
    langCode: 'profile_logout',
  },
]

export default menuItems
