'use client'

import { FC, Fragment } from 'react'
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react'
import { Link } from '../../i18n/navigation'
import { useUI } from '@components/ui/context'
import { useLocale } from 'next-intl'

type Props = {
  open: boolean
  onClose: () => void
}

const labels: Record<string, Record<string, string>> = {
  about: { ru: 'О нас', uz: 'Biz haqimizda', en: 'About' },
  delivery: { ru: 'Доставка и оплата', uz: 'Yetkazib berish', en: 'Delivery' },
  contacts: { ru: 'Контакты', uz: 'Kontaktlar', en: 'Contacts' },
  branch: { ru: 'Адреса ресторанов', uz: 'Restoran manzillari', en: 'Locations' },
  sale: { ru: 'Акции', uz: 'Aksiyalar', en: 'Promo' },
  fran: { ru: 'Франшиза', uz: 'Franshiza', en: 'Franchise' },
  privacy: { ru: 'Конфиденциальность', uz: 'Maxfiylik', en: 'Privacy' },
  bonus: { ru: 'Бонусная программа', uz: 'Bonus dasturi', en: 'Bonus' },
}

const items = [
  { key: 'about', href: '/about' },
  { key: 'delivery', href: '/delivery' },
  { key: 'branch', href: '/branch' },
  { key: 'contacts', href: '/contacts' },
  { key: 'sale', href: '/sale' },
  { key: 'fran', href: '/about/fran' },
  { key: 'bonus', href: '/bonus' },
  { key: 'privacy', href: '/privacy' },
]

const SideMenuApp: FC<Props> = ({ open, onClose }) => {
  const { activeCity } = useUI()
  const locale = useLocale()
  const t = (key: string) => labels[key]?.[locale] || labels[key]?.ru || key
  const citySlug = activeCity?.slug || 'tashkent'

  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className="fixed inset-0 bg-black/40"
            aria-hidden="true"
          />
        </TransitionChild>

        <div className="fixed inset-0 flex justify-end">
          <TransitionChild
            as={Fragment}
            enter="transform transition ease-out duration-300"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transform transition ease-in duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <DialogPanel className="w-full max-w-sm bg-white shadow-2xl flex flex-col h-full">
              <div className="flex items-center justify-between px-5 py-4 border-b">
                <span className="text-lg font-semibold">Меню</span>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="close"
                  className="p-2 text-gray-500 hover:text-gray-800"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto py-3">
                <ul className="space-y-1">
                  {items.map((item) => (
                    <li key={item.key}>
                      <Link
                        href={`/${citySlug}${item.href}`}
                        prefetch={false}
                        onClick={onClose}
                        className="block px-5 py-3 text-gray-800 hover:bg-yellow-50 hover:text-yellow-700 transition-colors"
                      >
                        {t(item.key)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  )
}

export default SideMenuApp
