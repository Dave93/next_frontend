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
    langCode: 'news',
  },
  {
    href: '/sale',
    icon: '/order.svg',
    activeIcon: '/activeOrder.svg',
    langCode: 'sale',
  },
]

export default menuItems
