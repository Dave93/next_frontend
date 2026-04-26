'use client'

import { useUI } from '@components/ui/context'
import { PhoneIcon } from '@heroicons/react/solid'
import { FC, memo, useMemo } from 'react'

// Inline UZ phone formatter — replaces libphonenumber-js (~115 KB chunk)
// for the single use case of rendering "+998 XX XXX-XX-XX" links in the
// header. Falls back to the raw value if shape is unexpected.
function formatUzPhone(phone: string): { uri: string; display: string } {
  const digits = phone.replace(/\D/g, '')
  const uri = digits ? `tel:+${digits}` : phone
  const national = digits.startsWith('998') ? digits.slice(3) : digits
  if (national.length === 9) {
    const display = `${national.slice(0, 2)} ${national.slice(2, 5)}-${national.slice(5, 7)}-${national.slice(7, 9)}`
    return { uri, display }
  }
  return { uri, display: phone }
}

const HeaderPhoneApp: FC = () => {
  const { activeCity, cities } = useUI()

  const chosenCity = useMemo(() => {
    if (activeCity) return activeCity
    if (cities) return cities[0]
    return null
  }, [cities, activeCity])

  const formatted = useMemo(
    () => (chosenCity?.phone ? formatUzPhone(chosenCity.phone) : null),
    [chosenCity?.phone]
  )

  return (
    <div className="flex items-center mx-3">
      {formatted && (
        <div className="space-x-1 flex items-center">
          <PhoneIcon className="w-5 h-5 text-secondary" />
          <div>
            <a href={formatted.uri} className="text-secondary">
              {formatted.display}
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

export default memo(HeaderPhoneApp)
