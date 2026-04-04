import { FC, useMemo } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import {
  HomeIcon as HomeOutline,
  ClipboardListIcon as OrdersOutline,
  ShoppingCartIcon as CartOutline,
  UserIcon as ProfileOutline,
} from '@heroicons/react/outline'
import {
  HomeIcon as HomeSolid,
  ClipboardListIcon as OrdersSolid,
  ShoppingCartIcon as CartSolid,
  UserIcon as ProfileSolid,
} from '@heroicons/react/solid'
import { useUI } from '@components/ui/context'
import useCart from '@framework/cart/use-cart'

interface Tab {
  key: string
  label: string
  href: string
  iconOutline: React.ComponentType<React.SVGProps<SVGSVGElement>>
  iconSolid: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

const MobileBottomNav: FC = () => {
  const { pathname, query } = useRouter()
  const { locationData, activeCity } = useUI()
  const citySlug = (query.city as string) || activeCity?.slug || ''

  let cartId: string | null = null
  if (typeof window !== undefined) {
    cartId = localStorage.getItem('basketId')
  }

  const { data: cartData } = useCart({
    cartId,
    locationData,
  })
  const cartCount = cartData?.lineItems?.length || 0

  const tabs: Tab[] = useMemo(
    () => [
      {
        key: 'home',
        label: 'Home',
        href: `/${citySlug}`,
        iconOutline: HomeOutline,
        iconSolid: HomeSolid,
      },
      {
        key: 'orders',
        label: 'Orders',
        href: `/${citySlug}/myorders`,
        iconOutline: OrdersOutline,
        iconSolid: OrdersSolid,
      },
      {
        key: 'cart',
        label: 'Cart',
        href: `/${citySlug}/cart`,
        iconOutline: CartOutline,
        iconSolid: CartSolid,
      },
      {
        key: 'profile',
        label: 'Profile',
        href: `/${citySlug}/profile`,
        iconOutline: ProfileOutline,
        iconSolid: ProfileSolid,
      },
    ],
    [citySlug]
  )

  const activeTab = useMemo(() => {
    if (pathname === '/[city]' || pathname === '/') return 'home'
    if (pathname.includes('/myorders') || pathname.includes('/order'))
      return 'orders'
    if (pathname.includes('/cart')) return 'cart'
    if (pathname.includes('/profile')) return 'profile'
    return 'home'
  }, [pathname])

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center h-14">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key
          const Icon = isActive ? tab.iconSolid : tab.iconOutline
          return (
            <Link key={tab.key} href={tab.href} prefetch={false}>
              <a className="flex flex-col items-center justify-center w-full h-full relative">
                <Icon
                  className={`w-6 h-6 ${
                    isActive ? 'text-yellow-500' : 'text-gray-400'
                  }`}
                  style={isActive ? { color: '#F9B004' } : undefined}
                />
                {tab.key === 'cart' && cartCount > 0 && (
                  <span className="absolute top-0.5 right-1/4 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-white">
                    {cartCount > 99 ? '99' : cartCount}
                  </span>
                )}
                <span
                  className={`text-[10px] mt-0.5 ${
                    isActive ? 'font-semibold' : ''
                  }`}
                  style={{
                    color: isActive ? '#F9B004' : 'rgba(0,0,0,0.4)',
                  }}
                >
                  {tab.label}
                </span>
              </a>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default MobileBottomNav
