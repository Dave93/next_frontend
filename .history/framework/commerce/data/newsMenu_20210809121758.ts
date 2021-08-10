export type profileMenuItem = {
  href: string
  icon: string
  langCode: string
  activeIcon: string
}

const menuItems: profileMenuItem[] = [
  {
    href: '/news',
    activeIcon: '/activeBonuses.png',
    icon: '/bonuses.png',
    langCode: 'profile_bonuses',
  },
  {
    href: '/stock',
    icon: '/order.png',
    activeIcon: '/activeOrder.png',
    langCode: 'profile_orders',
  },
]

export default menuItems
