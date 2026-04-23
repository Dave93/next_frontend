'use client'

import { FC, useMemo } from 'react'
import { useLocale } from 'next-intl'

type Props = {
  register?: any
  setValue?: any
  locationData?: any
  setLocationData?: any
  cities?: any[]
  activeCity?: any
  setActiveCity?: any
  addressList?: any[]
  addressId?: number
  onSelectAddress: (addr: any) => void | Promise<void>
  onAddNewAddress: () => void | Promise<void>
  yandexGeoKey?: string
  configData?: any
  tabIndex?: any
  onChangeTab?: (i: any) => void
  searchTerminal?: any
  downshiftRef?: any
  mapRef?: any
  isMobile?: boolean
}

const labels: Record<string, Record<string, string>> = {
  saved: { ru: 'Сохранённые адреса', uz: 'Saqlangan manzillar', en: 'Saved addresses' },
  empty: {
    ru: 'У вас пока нет сохранённых адресов',
    uz: "Sizda hali saqlangan manzillar yo'q",
    en: 'You have no saved addresses yet',
  },
  add: {
    ru: 'Добавить новый адрес',
    uz: "Yangi manzil qo'shish",
    en: 'Add new address',
  },
  selected: { ru: 'Выбран', uz: 'Tanlangan', en: 'Selected' },
}

const AddressSelectionApp: FC<Props> = ({
  addressList = [],
  addressId,
  onSelectAddress,
  onAddNewAddress,
  isMobile = false,
}) => {
  const locale = useLocale()
  const t = (key: string) => labels[key]?.[locale] || labels[key]?.ru || key

  const list = useMemo(
    () => (Array.isArray(addressList) ? addressList : []),
    [addressList]
  )

  const formatAddress = (addr: any) => {
    const parts: string[] = []
    if (addr.label) parts.push(addr.label)
    if (addr.address) parts.push(addr.address)
    if (addr.house) parts.push(`д. ${addr.house}`)
    if (addr.flat) parts.push(`кв. ${addr.flat}`)
    return parts.join(', ') || `#${addr.id}`
  }

  return (
    <div className={isMobile ? 'bg-white p-4 rounded-2xl' : 'bg-white p-6 rounded-2xl'}>
      <div className="font-bold text-[16px] text-gray-700 mb-3">
        {t('saved')}
      </div>
      {list.length === 0 ? (
        <div className="text-gray-400 text-sm mb-4">{t('empty')}</div>
      ) : (
        <ul className="space-y-2 mb-4">
          {list.map((addr) => {
            const active = addressId === addr.id
            return (
              <li key={addr.id}>
                <button
                  type="button"
                  onClick={() => onSelectAddress(addr)}
                  className={`w-full text-left px-3 py-2 rounded-lg border transition ${
                    active
                      ? 'border-yellow-500 bg-yellow-50 text-gray-900'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-sm">{formatAddress(addr)}</span>
                  {active && (
                    <span className="ml-2 text-xs text-yellow-700">
                      {t('selected')}
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
      <button
        type="button"
        onClick={onAddNewAddress}
        className="w-full text-white font-semibold rounded-full h-11 px-4"
        style={{ backgroundColor: '#F9B004' }}
      >
        {t('add')}
      </button>
    </div>
  )
}

export const AddressSelectionMobileApp: FC<Props> = (props) => (
  <AddressSelectionApp {...props} isMobile />
)

export default AddressSelectionApp
