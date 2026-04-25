'use client'

import { FC, useEffect, useMemo, useState } from 'react'
import { useLocale } from 'next-intl'
import LocationPickerCore from '../header/LocationPickerCore'

type Props = {
  register?: any
  setValue?: any
  locationData?: any
  setLocationData?: any
  cities?: any[]
  activeCity?: any
  setActiveCity?: any
  addressList?: any[]
  addressId?: number | null
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
  saved: {
    ru: 'Сохранённые адреса',
    uz: 'Saqlangan manzillar',
    en: 'Saved addresses',
  },
  empty: {
    ru: 'У вас пока нет сохранённых адресов',
    uz: "Sizda hali saqlangan manzillar yo'q",
    en: 'You have no saved addresses yet',
  },
  addNew: {
    ru: 'Указать новый адрес',
    uz: 'Yangi manzil kiritish',
    en: 'Enter a new address',
  },
  hidePicker: {
    ru: 'Скрыть форму',
    uz: 'Formani yashirish',
    en: 'Hide form',
  },
}

const AddressSelectionApp: FC<Props> = ({
  addressList = [],
  addressId,
  onSelectAddress,
  onAddNewAddress,
  tabIndex,
  isMobile = false,
}) => {
  const locale = useLocale()
  const t = (key: string) => labels[key]?.[locale] || labels[key]?.ru || key

  const list = useMemo(
    () => (Array.isArray(addressList) ? addressList : []),
    [addressList]
  )

  // Auto-open the inline picker when there's nothing to choose from yet,
  // or when no saved address is currently selected.
  const [pickerOpen, setPickerOpen] = useState(
    list.length === 0 || addressId == null
  )

  useEffect(() => {
    if (list.length === 0) setPickerOpen(true)
  }, [list.length])

  const formatAddress = (addr: any) => {
    const parts: string[] = []
    if (addr.label) parts.push(addr.label)
    if (addr.address) parts.push(addr.address)
    if (addr.house) parts.push(`д. ${addr.house}`)
    if (addr.flat) parts.push(`кв. ${addr.flat}`)
    return parts.join(', ') || `#${addr.id}`
  }

  const padding = isMobile ? 'p-4' : 'p-5'
  const initialTab = tabIndex === 'pickup' ? 'pickup' : 'deliver'

  const handleAddNewClick = async () => {
    if (!pickerOpen) {
      // Switching INTO new-address mode — reset the currently selected
      // saved address so the form starts blank.
      await onAddNewAddress()
    }
    setPickerOpen((s) => !s)
  }

  return (
    <div className={`bg-white ${padding} rounded-2xl space-y-4`}>
      {list.length > 0 && (
        <div>
          <div className="font-bold text-[15px] text-gray-700 mb-2.5">
            {t('saved')}
          </div>
          {/* Two columns on md+ to halve the vertical scroll. Best-practice
              "compact saved addresses" — Baymard, SennaLabs.  */}
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {list.map((addr) => {
              const active = addressId === addr.id
              return (
                <li key={addr.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectAddress(addr)
                      setPickerOpen(false)
                    }}
                    className={`w-full h-full text-left px-3 py-2.5 rounded-xl border transition flex items-start gap-2.5 min-h-[44px] ${
                      active
                        ? 'border-yellow-500 bg-yellow-50 text-gray-900'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <span
                      className="flex-shrink-0 w-4 h-4 mt-0.5 rounded-full border inline-flex items-center justify-center"
                      style={{
                        borderColor: active ? '#FAAF04' : '#9CA3AF',
                      }}
                    >
                      {active && (
                        <span
                          className="block rounded-full"
                          style={{
                            width: 8,
                            height: 8,
                            background: '#FAAF04',
                          }}
                        />
                      )}
                    </span>
                    <span className="text-sm leading-snug flex-1">
                      {formatAddress(addr)}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {list.length > 0 && (
        <button
          type="button"
          onClick={handleAddNewClick}
          className="w-full text-sm font-semibold flex items-center justify-center gap-1.5 py-2.5 rounded-full border-2 transition min-h-[44px]"
          style={{
            color: pickerOpen ? '#6B7280' : '#FAAF04',
            borderColor: pickerOpen ? '#E5E7EB' : '#FAAF04',
            background: 'transparent',
          }}
        >
          {pickerOpen ? (
            t('hidePicker')
          ) : (
            <>
              <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
              <span>{t('addNew')}</span>
            </>
          )}
        </button>
      )}

      {pickerOpen && (
        <div className={list.length > 0 ? 'pt-2 border-t border-gray-100' : ''}>
          {/* autoSubmit + smaller map: address/terminal pick is committed
              instantly per Mapbox/Geoapify "silent acceptance" pattern,
              no extra "Подтвердить" click. */}
          <LocationPickerCore
            inline
            autoSubmit
            mapHeight={isMobile ? 180 : 220}
            initialTab={initialTab}
          />
        </div>
      )}
    </div>
  )
}

export const AddressSelectionMobileApp: FC<Props> = (props) => (
  <AddressSelectionApp {...props} isMobile />
)

export default AddressSelectionApp
