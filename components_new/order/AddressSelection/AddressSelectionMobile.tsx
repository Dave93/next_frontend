import { FC, useMemo } from 'react'
import { UseFormRegister, UseFormSetValue } from 'react-hook-form'
import { LocationMarkerIcon } from '@heroicons/react/solid'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { Address } from '@commerce/types/address'
import AddressSearch from './AddressSearch'
import SavedAddressList from './SavedAddressList'
import AddressDetails from './AddressDetails'

interface AddressSelectionMobileProps {
  register: UseFormRegister<any>
  setValue: UseFormSetValue<any>
  locationData: any
  setLocationData: (data: any) => void
  activeCity: any
  addressList: Address[] | null
  addressId: number | null
  onSelectAddress: (address: Address) => void
  onAddNewAddress: () => void
  yandexGeoKey: string
  configData: any
  tabIndex: string
  onChangeTab: (tab: string) => void
  searchTerminal: (data: any, returnResult: boolean) => Promise<any>
  downshiftRef: React.MutableRefObject<any>
}

const AddressSelectionMobile: FC<AddressSelectionMobileProps> = ({
  register,
  setValue,
  locationData,
  setLocationData,
  activeCity,
  addressList,
  addressId,
  onSelectAddress,
  onAddNewAddress,
  yandexGeoKey,
  configData,
  tabIndex,
  onChangeTab,
  searchTerminal,
  downshiftRef,
}) => {
  const { t: tr } = useTranslation('common')
  const { locale } = useRouter()

  const currentCityPrefix = useMemo(() => {
    if (!activeCity) return ''
    if (locale === 'uz') return `O'zbekiston, ${activeCity.name_uz},`
    if (locale === 'en') return `Uzbekistan, ${activeCity.name_en},`
    return `Узбекистан, ${activeCity.name},`
  }, [activeCity, locale])

  const cityBounds = activeCity?.bounds || ''

  const handleAddressSelect = async (selection: any) => {
    setValue('address', selection.formatted)
    downshiftRef?.current?.reset({ inputValue: selection.formatted })

    let house = ''
    selection.addressItems?.forEach((addr: any) => {
      if (addr.kind === 'house') {
        setValue('house', addr.name)
        house = addr.name
      }
    })

    const terminalData = await searchTerminal(
      { location: [selection.coordinates.lat, selection.coordinates.long] },
      true
    )
    setLocationData({
      ...locationData,
      deliveryType: tabIndex,
      house,
      location: [selection.coordinates.lat, selection.coordinates.long],
      terminal_id: terminalData?.terminal_id,
      terminalData: terminalData?.terminalData,
    })
  }

  return (
    <div className="bg-white px-4 py-4 mb-1">
      {/* Delivery/Pickup toggle */}
      <div className="bg-gray-100 flex rounded-full p-1 mb-4">
        <button
          type="button"
          className={`flex-1 font-bold py-2.5 text-sm rounded-full outline-none focus:outline-none transition-colors ${
            tabIndex === 'deliver' ? 'bg-yellow text-white' : 'text-gray-400'
          }`}
          onClick={() => onChangeTab('deliver')}
        >
          {tr('delivery')}
        </button>
        <button
          type="button"
          className={`flex-1 font-bold py-2.5 text-sm rounded-full outline-none focus:outline-none transition-colors ${
            tabIndex === 'pickup' ? 'bg-yellow text-white' : 'text-gray-400'
          }`}
          onClick={() => onChangeTab('pickup')}
        >
          {tr('pickup')}
        </button>
      </div>

      {tabIndex === 'deliver' && (
        <div className="space-y-3">
          <AddressSearch
            defaultValue={locationData?.address || currentCityPrefix}
            cityBounds={cityBounds}
            hasGeoKey={Boolean(yandexGeoKey)}
            onSelect={handleAddressSelect}
            downshiftRef={downshiftRef}
          />

          <SavedAddressList
            addresses={addressList}
            selectedId={addressId}
            onSelect={onSelectAddress}
            onAddNew={onAddNewAddress}
          />

          <AddressDetails register={register} isMobile />

          {/* Nearest branch info */}
          {locationData?.terminalData && (
            <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-green-700">
              <LocationMarkerIcon className="w-5 h-5 flex-shrink-0 text-green-500" />
              <span className="text-xs font-medium">
                {tr('nearest_filial', {
                  filialName: locationData.terminalData.name,
                })}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AddressSelectionMobile
