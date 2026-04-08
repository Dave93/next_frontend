import { FC, useCallback, useRef, useState } from 'react'
import Downshift from 'downshift'
import debounce from 'lodash/debounce'
import axios from 'axios'
import useTranslation from 'next-translate/useTranslation'

interface GeoSuggestion {
  formatted: string
  coordinates: { lat: number; long: number }
  addressItems: { kind: string; name: string }[]
}

interface AddressSearchProps {
  defaultValue: string
  cityBounds: string
  hasGeoKey: boolean
  onSelect: (suggestion: GeoSuggestion) => void
  downshiftRef?: React.MutableRefObject<any>
}

const AddressSearch: FC<AddressSearchProps> = ({
  defaultValue,
  cityBounds,
  hasGeoKey,
  onSelect,
  downshiftRef,
}) => {
  const { t } = useTranslation('common')
  const [suggestions, setSuggestions] = useState<GeoSuggestion[]>([])

  const fetchSuggestions = async (value: string) => {
    if (!value || !hasGeoKey) return
    try {
      const { data } = await axios.get(
        `/api/geocode?text=${encodeURI(value)}&bounds=${cityBounds}`
      )
      setSuggestions(data)
    } catch (e) {
      // silently ignore
    }
  }

  const debouncedFetch = useCallback(
    debounce(fetchSuggestions, 300),
    [hasGeoKey, cityBounds]
  )

  return (
    <Downshift
      ref={downshiftRef}
      initialInputValue={defaultValue}
      onInputValueChange={debouncedFetch}
      itemToString={(item) => (item ? item.formatted : '')}
      onSelect={(selection) => {
        if (selection) {
          onSelect(selection)
          setSuggestions([])
        }
      }}
    >
      {({
        getInputProps,
        getItemProps,
        getMenuProps,
        isOpen,
        highlightedIndex,
      }) => (
        <div className='relative'>
          <div className='relative'>
            <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-5 w-5'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z'
                />
              </svg>
            </span>
            <input
              {...getInputProps({
                placeholder:
                  t('address_placeholder') || 'Введите адрес доставки...',
                className:
                  'w-full pl-10 pr-4 py-3.5 bg-gray-100 border-2 border-transparent rounded-xl text-sm outline-none focus:border-yellow focus:bg-white transition-colors',
              })}
            />
          </div>
          <ul
            {...getMenuProps()}
            className={`absolute z-30 bg-white border border-gray-100 rounded-xl shadow-lg mt-1 max-h-60 overflow-y-auto w-full ${
              isOpen && suggestions.length > 0 ? '' : 'hidden'
            }`}
          >
            {isOpen &&
              suggestions.map((item, index) => (
                <li
                  key={index}
                  {...getItemProps({ item, index })}
                  className={`px-4 py-3 text-sm cursor-pointer border-b border-gray-50 ${
                    highlightedIndex === index
                      ? 'bg-yellow bg-opacity-5'
                      : ''
                  }`}
                >
                  📍 {item.formatted}
                </li>
              ))}
          </ul>
        </div>
      )}
    </Downshift>
  )
}

export default AddressSearch
