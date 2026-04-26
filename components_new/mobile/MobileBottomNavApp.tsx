'use client'

import { FC, useMemo, useCallback } from 'react'
import { usePathname, useParams } from 'next/navigation'
import { useExtracted } from 'next-intl'
import { Link } from '../../i18n/navigation'
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
import { useUserStore } from '../../lib/stores/user-store'
import { useUIStore } from '../../lib/stores/ui-store'
import { useLocationStore } from '../../lib/stores/location-store'
import { useCartStore, cartSelectors } from '../../lib/stores/cart-store'

interface Tab {
  key: string
  label: string
  href: string
  iconOutline: React.ComponentType<React.SVGProps<SVGSVGElement>>
  iconSolid: React.ComponentType<React.SVGProps<SVGSVGElement>>
  requiresAuth?: boolean
}

const MobileBottomNavApp: FC = () => {
  const pathname = usePathname() || '/'
  const params = useParams()
  const t = useExtracted()
  const activeCity = useLocationStore((s) => s.activeCity)
  const user = useUserStore((s) => s.user)
  const openSignInModal = useUIStore((s) => s.openSignInModal)
  const citySlug =
    (params?.city as string) || activeCity?.slug || 'tashkent'

  const cartCount = useCartStore(cartSelectors.count)

  const tabs: Tab[] = useMemo(
    () => [
      {
        key: 'home',
        label: t('Главная'),
        href: `/${citySlug}`,
        iconOutline: HomeOutline,
        iconSolid: HomeSolid,
      },
      {
        key: 'orders',
        label: t('Заказы'),
        href: `/${citySlug}/profile/orders`,
        iconOutline: OrdersOutline,
        iconSolid: OrdersSolid,
        requiresAuth: true,
      },
      {
        key: 'cart',
        label: t('Корзина'),
        href: `/${citySlug}/cart`,
        iconOutline: CartOutline,
        iconSolid: CartSolid,
      },
      {
        key: 'profile',
        label: t('Настройки'),
        href: `/${citySlug}/profile`,
        iconOutline: SettingsOutline,
        iconSolid: SettingsSolid,
        requiresAuth: true,
      },
    ],
    [citySlug, t]
  )

  const activeTab = useMemo(() => {
    if (pathname.endsWith(`/${citySlug}`) || pathname === '/') return 'home'
    if (
      pathname.includes('/profile/orders') ||
      pathname.includes('/order') ||
      pathname.includes('/track')
    )
      return 'orders'
    if (pathname.includes('/cart')) return 'cart'
    if (pathname.includes('/profile')) return 'profile'
    return 'home'
  }, [pathname, citySlug])

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
                  className="w-6 h-6"
                  style={{
                    color: isActive ? '#F9B004' : 'rgba(0,0,0,0.4)',
                  }}
                />
                {tab.key === 'cart' && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-3 bg-red-500 text-white text-[11px] font-bold rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center border-2 border-white">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </div>
              <span
                className={`text-xs mt-0.5 ${isActive ? 'font-semibold' : ''}`}
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

export default MobileBottomNavApp
