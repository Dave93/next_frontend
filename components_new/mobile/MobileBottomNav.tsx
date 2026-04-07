import { FC, useMemo, useCallback } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import {
  HomeIcon as HomeOutline,
  ClipboardListIcon as OrdersOutline,
  ShoppingCartIcon as CartOutline,
  CogIcon as SettingsOutline,
} from '@heroicons/react/outline'
import {
  HomeIcon as HomeSolid,
  ClipboardListIcon as OrdersSolid,
  ShoppingCartIcon as CartSolid,
  CogIcon as SettingsSolid,
} from '@heroicons/react/solid'
import { useUI } from '@components/ui/context'
import useCart from '@framework/cart/use-cart'

interface Tab {
  key: string
  label: string
  href: string
  iconOutline: React.ComponentType<React.SVGProps<SVGSVGElement>>
  iconSolid: React.ComponentType<React.SVGProps<SVGSVGElement>>
  requiresAuth?: boolean
}

const MobileBottomNav: FC = () => {
  const router = useRouter()
  const { pathname, query } = router
  const { locale = 'ru' } = router
  const { activeCity, user, openSignInModal } = useUI()
  const citySlug = (query.city as string) || activeCity?.slug || ''

  const tabLabels: Record<string, Record<string, string>> = {
    home: { ru: 'Главная', uz: 'Bosh sahifa', en: 'Home' },
    orders: { ru: 'Заказы', uz: 'Buyurtmalar', en: 'Orders' },
    cart: { ru: 'Корзина', uz: 'Savat', en: 'Cart' },
    profile: { ru: 'Настройки', uz: 'Sozlamalar', en: 'Settings' },
  }

  const { data: cartData } = useCart()
  const cartCount = useMemo(() => {
    if (!cartData?.lineItems?.length) return 0
    return cartData.lineItems.reduce(
      (sum: number, item: any) => sum + (item.quantity || 1),
      0
    )
  }, [cartData])

  const tabs: Tab[] = useMemo(
    () => [
      {
        key: 'home',
        label: tabLabels.home[locale] || 'Home',
        href: `/${citySlug}`,
        iconOutline: HomeOutline,
        iconSolid: HomeSolid,
      },
      {
        key: 'orders',
        label: tabLabels.orders[locale] || 'Orders',
        href: `/${citySlug}/profile/orders`,
        iconOutline: OrdersOutline,
        iconSolid: OrdersSolid,
        requiresAuth: true,
      },
      {
        key: 'cart',
        label: tabLabels.cart[locale] || 'Cart',
        href: `/${citySlug}/cart`,
        iconOutline: CartOutline,
        iconSolid: CartSolid,
      },
      {
        key: 'profile',
        label: tabLabels.profile[locale] || 'Profile',
        href: `/${citySlug}/profile`,
        iconOutline: SettingsOutline,
        iconSolid: SettingsSolid,
        requiresAuth: true,
      },
    ],
    [citySlug, locale]
  )

  const activeTab = useMemo(() => {
    if (pathname === '/[city]' || pathname === '/') return 'home'
    if (pathname.includes('/profile/orders') || pathname.includes('/order'))
      return 'orders'
    if (pathname.includes('/cart')) return 'cart'
    if (pathname.includes('/profile')) return 'profile'
    return 'home'
  }, [pathname])

  const handleTabClick = useCallback(
    (e: React.MouseEvent, tab: Tab) => {
      if (tab.requiresAuth && !user) {
        e.preventDefault()
        openSignInModal()
      }
    },
    [user, openSignInModal]
  )

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center h-14">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key
          const Icon = isActive ? tab.iconSolid : tab.iconOutline
          return (
            <Link
              key={tab.key}
              href={tab.href}
              prefetch={false}
              className="flex flex-col items-center justify-center w-full h-full"
              onClick={(e) => handleTabClick(e, tab)}
            >
                <div className="relative">
                  <Icon
                    className={`w-6 h-6 ${
                      isActive ? 'text-yellow-500' : 'text-gray-400'
                    }`}
                    style={isActive ? { color: '#F9B004' } : undefined}
                  />
                  {tab.key === 'cart' && cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-3 bg-red-500 text-white text-[11px] font-bold rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center border-2 border-white">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </div>
                <span
                  className={`text-xs mt-0.5 ${
                    isActive ? 'font-semibold' : ''
                  }`}
                  style={{
                    color: isActive ? '#F9B004' : 'rgba(0,0,0,0.4)',
                  }}
                >
                  {tab.label}
                </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default MobileBottomNav
