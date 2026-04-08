import { FC } from 'react'
import useTranslation from 'next-translate/useTranslation'
import { CheckIcon } from '@heroicons/react/solid'
import { Address } from '@commerce/types/address'

interface SavedAddressListProps {
  addresses: Address[] | null
  selectedId: number | null
  onSelect: (address: Address) => void
  onAddNew: () => void
}

const getIcon = (label: string | null | undefined): string => {
  if (!label) return '📍'

  const lowerLabel = label.toLowerCase()

  if (
    lowerLabel === 'home' ||
    lowerLabel === 'дом' ||
    lowerLabel === 'uy'
  ) {
    return '🏠'
  }

  if (
    lowerLabel === 'office' ||
    lowerLabel === 'офис' ||
    lowerLabel === 'ofis'
  ) {
    return '🏢'
  }

  return '📍'
}

const SavedAddressList: FC<SavedAddressListProps> = ({
  addresses,
  selectedId,
  onSelect,
  onAddNew,
}) => {
  const { t: tr } = useTranslation('common')

  return (
    <div className="space-y-2">
      <div className="text-xs text-gray-400 uppercase tracking-wide">
        {tr('profile_address')}
      </div>

      {addresses && addresses.length > 0 && (
        <>
          {addresses.map((address) => {
            const displayLabel = address.label || address.address
            const icon = getIcon(address.label)
            const isSelected = selectedId === address.id

            return (
              <button
                key={address.id}
                type="button"
                onClick={() => onSelect(address)}
                className={`w-full rounded-xl p-3 flex items-center justify-between transition-all ${
                  isSelected
                    ? 'border-2 border-yellow bg-yellow bg-opacity-5'
                    : 'border border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3 text-left">
                  <div>
                    <div className="font-semibold text-sm">
                      {icon} {displayLabel}
                    </div>
                    <div className="text-xs text-gray-400">
                      {address.address}
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <CheckIcon className="w-5 h-5 text-yellow flex-shrink-0" />
                )}
              </button>
            )
          })}
        </>
      )}

      <button
        type="button"
        onClick={onAddNew}
        className="w-full rounded-xl border border-dashed border-gray-300 p-3 text-center text-sm text-yellow"
      >
        + {tr('add_new_address')}
      </button>
    </div>
  )
}

export default SavedAddressList
