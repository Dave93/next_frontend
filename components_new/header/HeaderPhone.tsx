import { useUI } from '@components/ui'
import { PhoneIcon } from '@heroicons/react/solid'
import { FC, memo, useMemo } from 'react'
import parsePhoneNumber from 'libphonenumber-js'

const HeaderPhone: FC = () => {
  const { activeCity, cities } = useUI()

  const chosenCity = useMemo(() => {
    if (activeCity) {
      return activeCity
    }
    if (cities) return cities[0]
    return null
  }, [cities, activeCity])
  return (
    <div className="flex items-center mx-3">
      {chosenCity?.phone && (
        <div className="space-x-1 flex items-center">
          <PhoneIcon className="w-5 h-5 text-secondary" />
          <div>
            <a
              href={parsePhoneNumber(chosenCity?.phone)?.getURI()}
              className="text-secondary"
            >
              {parsePhoneNumber(chosenCity?.phone)
                ?.formatNational()
                .substring(2)}
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

export default memo(HeaderPhone)
