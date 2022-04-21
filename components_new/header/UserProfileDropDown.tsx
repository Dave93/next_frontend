import { Fragment, FC, memo, ReactEventHandler } from 'react'
import { Menu, Transition } from '@headlessui/react'
import menuItems from '@commerce/data/profileMenu'
import useTranslation from 'next-translate/useTranslation'
import { useUI } from '@components/ui/context'
import Link from 'next/link'
import { useRouter } from 'next/router'
import useCart from '@framework/cart/use-cart'

type UserProfileDropdownProps = {
  setMobMenuOpen?: any
}

const UserProfileDropDown: FC<UserProfileDropdownProps> = ({
  setMobMenuOpen,
}) => {
  const { t: tr } = useTranslation('common')
  const router = useRouter()
  const { locale, pathname } = router
  const { user, setUserData, activeCity, locationData } = useUI()
  let cartId: string | null = null
  if (typeof window !== 'undefined') {
    cartId = localStorage.getItem('basketId')
  }
  const { mutate } = useCart({
    cartId,
    locationData,
  })

  let items = menuItems.map((item) => {
    return {
      ...item,
      name: tr(item.langCode),
    }
  })

  const logout = async (e: React.SyntheticEvent<EventTarget>) => {
    e.preventDefault()
    e.stopPropagation()
    localStorage.removeItem('mijoz')
    localStorage.removeItem('basketId')
    let basketData = {
      id: '',
      createdAt: '',
      currency: { code: '' },
      taxesIncluded: '',
      lineItems: [],
      lineItemsSubtotalPrice: '',
      subtotalPrice: 0,
      totalPrice: 0,
      discountTotal: 0,
    }
    await mutate(basketData, false)
    setUserData(null)
  }

  return (
    <Menu as="div" className="relative inline-block text-left">
      {({ open }) => (
        <>
          <div>
            <Menu.Button className="bg-gray-200 px-8 py-1 rounded-full text-secondary outline-none focus:outline-none mb-5 md:mb-0">
              {user.user.name}
            </Menu.Button>
          </div>

          <Transition
            show={open}
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items
              static
              className="absolute bg-white divide-gray-100 divide-y focus:outline-none mt-2 origin-top-right right-0 ring-1 ring-black ring-opacity-5 overflow-hidden rounded-2xl shadow-lg z-20"
            >
              {items.map((item) => {
                let href = `${item.href}`

                if (href.indexOf('http') < 0) {
                  href = `/${activeCity.slug}${item.href}`
                }

                return (
                  <Menu.Item key={item.href}>
                    {href == `/${activeCity.slug}/profile/logout` ? (
                      <span
                        className="block px-4 py-2 text-sm cursor-pointer text-secondary hover:text-white hover:bg-secondary"
                        onClick={logout}
                      >
                        {item.name}
                      </span>
                    ) : (
                      <Link href={href} locale={locale} prefetch={false}>
                        <a
                          className="block px-4 py-2 text-sm cursor-pointer text-secondary hover:text-white hover:bg-secondary"
                          onClick={() => setMobMenuOpen(false)}
                        >
                          {item.name}
                        </a>
                      </Link>
                    )}
                  </Menu.Item>
                )
              })}
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  )
}

export default memo(UserProfileDropDown)
