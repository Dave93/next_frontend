import { FC } from 'react'
import useTranslation from 'next-translate/useTranslation'
import { Address } from '@commerce/types/address'

interface SavedAddressChipsProps {
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

const SavedAddressChips: FC<SavedAddressChipsProps> = ({
  addresses,
  selectedId,
  onSelect,
  onAddNew,
}) => {
  const { t: tr } = useTranslation('common')

  if (!addresses || addresses.length === 0) {
    return null
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {addresses.map((address) => {
        const displayText = address.label || address.address
        const icon = getIcon(address.label)
        const isSelected = selectedId === address.id

        return (
          <button
            key={address.id}
            type="button"
            onClick={() => onSelect(address)}
            className={`rounded-full px-4 py-2 border-2 text-sm transition-all ${
              isSelected
                ? 'bg-yellow bg-opacity-10 border-yellow font-semibold'
                : 'bg-gray-100 border-transparent hover:border-gray-200'
            }`}
          >
            {icon} {displayText}
          </button>
        )
      })}
    </div>
  )
}

export default SavedAddressChips
