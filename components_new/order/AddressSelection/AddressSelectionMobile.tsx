import { FC, useMemo, useRef, useState } from 'react'
import { UseFormRegister, UseFormSetValue } from 'react-hook-form'
import { LocationMarkerIcon } from '@heroicons/react/solid'
import { YMaps, Map, Placemark, MapState, MapStateBase, MapStateCenter } from 'react-yandex-maps'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'
import axios from 'axios'
import { City } from '@commerce/types/cities'
import { Address } from '@commerce/types/address'
import AddressSearch from './AddressSearch'
import SavedAddressList from './SavedAddressList'
import AddressDetails from './AddressDetails'

let webAddress = process.env.NEXT_PUBLIC_API_URL

interface AddressSelectionMobileProps {
  register: UseFormRegister<any>
  setValue: UseFormSetValue<any>
  locationData: any
  setLocationData: (data: any) => void
  cities: City[]
  activeCity: any
  setActiveCity: (city: City) => void
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
  mapRef: React.MutableRefObject<any>
}

const AddressSelectionMobile: FC<AddressSelectionMobileProps> = ({
  register,
  setValue,
  locationData,
  setLocationData,
  cities,
  activeCity,
  setActiveCity,
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
  mapRef,
}) => {
  const { t: tr } = useTranslation('common')
  const { locale, pathname, query } = useRouter()
  const objects = useRef<any>(null)

  const [selectedCoordinates, setSelectedCoordinates] = useState(
    locationData && locationData.location && locationData.location.length
      ? [
          {
            coordinates: { lat: locationData.location[0], long: locationData.location[1] },
            key: `${locationData.location[0]}${locationData.location[1]}`,
          },
        ]
      : ([] as any)
  )

  const [mapCenter, setMapCenter] = useState(
    (locationData?.location && locationData.location.length
      ? locationData?.location
      : [activeCity?.lat, activeCity?.lon]) as number[]
  )
  const [mapZoom, setMapZoom] = useState(
    (locationData?.location && locationData.location.length ? 17 : activeCity?.map_zoom || 10) as number
  )

  const mapState = useMemo<MapState>(() => {
    const baseState: MapStateBase = {
      controls: ['zoomControl', 'fullscreenControl', 'geolocationControl'],
    }
    const mapStateCenter: MapStateCenter = { center: mapCenter || [], zoom: mapZoom || 10 }
    return Object.assign({}, baseState, mapStateCenter)
  }, [mapCenter, mapZoom, activeCity])

  const currentCityPrefix = useMemo(() => {
    if (!activeCity) return ''
    if (locale === 'uz') return `O'zbekiston, ${activeCity.name_uz},`
    if (locale === 'en') return `Uzbekistan, ${activeCity.name_en},`
    return `Узбекистан, ${activeCity.name},`
  }, [activeCity, locale])

  const cityBounds = activeCity?.bounds || ''

  const changeCity = (city: City) => {
    setActiveCity(city)
    setMapCenter([+city.lat, +city.lon])
  }

  const handleAddressSelect = async (selection: any) => {
    setMapCenter([selection.coordinates.lat, selection.coordinates.long])
    setSelectedCoordinates([
      { ...selection, key: `${selection.coordinates.lat}${selection.coordinates.long}` },
    ])
    setMapZoom(17)
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

  const clickOnMap = async (event: any) => {
    const coords = event.get('coords') || event.get('position')
    if (!coords) return

    // Check delivery zone if polygons loaded
    if (objects.current) {
      try {
        const polygon = objects.current.searchContaining(coords)?.get(0)
        if (polygon) {
          const pickedCity = cities.find((city: City) => city.slug === polygon.properties._data.slug)
          if (pickedCity && pickedCity.id !== activeCity.id) {
            changeCity(pickedCity)
          }
        }
      } catch (e) {
        // ignore polygon errors
      }
    }

    setSelectedCoordinates([
      { key: `${coords[0]}${coords[1]}`, coordinates: { lat: coords[0], long: coords[1] } },
    ])
    setMapZoom(17)
    const { data } = await axios.get(`${webAddress}/api/geocode?lat=${coords[0]}&lon=${coords[1]}`)
    let house = ''
    data.data.addressItems.map((item: any) => {
      if (item.kind === 'house') house = item.name
    })
    setValue('house', house)
    setValue('address', data.data.formatted)
    downshiftRef?.current?.reset({ inputValue: data.data.formatted })

    const terminalData = await searchTerminal({ location: coords }, true)
    setLocationData({
      ...locationData,
      deliveryType: tabIndex,
      location: coords,
      address: data.data.formatted,
      house,
      terminal_id: terminalData?.terminal_id,
      terminalData: terminalData?.terminalData,
    })
  }

  const handleSelectSavedAddress = (address: Address) => {
    if (address.lat && address.lon) {
      setMapCenter([+address.lat, +address.lon])
      setSelectedCoordinates([
        {
          key: `${address.lat}${address.lon}`,
          coordinates: { lat: +address.lat, long: +address.lon },
        },
      ])
      setMapZoom(17)
    }
    onSelectAddress(address)
  }

  const loadPolygonsToMap = (ymaps: any) => {
    // Load polygons FIRST so clickOnMap can check containment
    const objectManager = ymaps.geoQuery(
      cities
        .filter((city: any) => city.polygon)
        .map((city: any) => ({
          type: 'Feature',
          geometry: { type: 'Polygon', coordinates: [JSON.parse(city.polygon)] },
          properties: { slug: city.slug },
        }))
    )
    objectManager.addToMap(mapRef.current)
    objectManager.each((obj: any) => {
      obj.options.set({ fillColor: '#00000011', strokeColor: '#F9B00444', strokeWidth: 1 })
    })
    objects.current = objectManager

    // Then add geolocation control
    mapRef.current.controls.remove('geolocationControl')
    const geolocationControl = new ymaps.control.GeolocationControl({ options: { noPlacemark: true } })
    geolocationControl.events.add('locationchange', (event: any) => {
      const position = event.get('position')
      clickOnMap({ get: (key: string) => (key === 'coords' ? position : null) })
    })
    mapRef.current.controls.add(geolocationControl)
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
            onSelect={handleSelectSavedAddress}
            onAddNew={onAddNewAddress}
          />

          {/* Map */}
          {yandexGeoKey && (
            <div className="rounded-xl overflow-hidden">
              <YMaps query={{ apikey: yandexGeoKey }}>
                <Map
                  state={mapState}
                  onLoad={loadPolygonsToMap}
                  instanceRef={(ref) => (mapRef.current = ref)}
                  width="100%"
                  height="250px"
                  onClick={clickOnMap}
                  modules={[
                    'control.ZoomControl',
                    'control.FullscreenControl',
                    'control.GeolocationControl',
                    'geoQuery',
                  ]}
                >
                  {selectedCoordinates.map((item: any) => (
                    <Placemark
                      modules={['geoObject.addon.balloon']}
                      defaultGeometry={[item?.coordinates?.lat, item?.coordinates?.long]}
                      geomerty={[item?.coordinates?.lat, item?.coordinates?.long]}
                      key={item.key}
                      defaultOptions={{ iconLayout: 'default#image', iconImageHref: '/map_placemark.png' }}
                    />
                  ))}
                </Map>
              </YMaps>
            </div>
          )}

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
