import { FC, useMemo, useRef, useState } from 'react'
import { UseFormRegister, UseFormSetValue } from 'react-hook-form'
import {
  YMaps,
  Map,
  Placemark,
  MapState,
  MapStateBase,
  MapStateCenter,
} from 'react-yandex-maps'
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react'
import { ChevronDownIcon, LocationMarkerIcon } from '@heroicons/react/solid'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'
import axios from 'axios'
import { chunk, sortBy } from 'lodash'
import { City } from '@commerce/types/cities'
import { Address } from '@commerce/types/address'
import AddressSearch from './AddressSearch'
import SavedAddressChips from './SavedAddressChips'
import AddressDetails from './AddressDetails'

let webAddress = process.env.NEXT_PUBLIC_API_URL

interface AddressSelectionProps {
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

const AddressSelection: FC<AddressSelectionProps> = ({
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

  const [selectedCoordinates, setSelectedCoordinates] = useState<
    { coordinates: { lat: number; long: number }; key: string }[]
  >(
    locationData && locationData.location
      ? [
          {
            coordinates: {
              lat: locationData.location[0],
              long: locationData.location[1],
            },
            key: `${locationData.location[0]}${locationData.location[1]}`,
          },
        ]
      : []
  )

  const [mapCenter, setMapCenter] = useState<number[]>(
    locationData?.location && locationData.location.length
      ? locationData.location
      : [activeCity?.lat, activeCity?.lon]
  )

  const [mapZoom, setMapZoom] = useState<number>(
    locationData?.location && locationData.location.length
      ? 17
      : activeCity?.map_zoom || 10
  )

  const mapState = useMemo<MapState>(() => {
    const baseState: MapStateBase = {
      controls: ['zoomControl', 'fullscreenControl', 'geolocationControl'],
    }
    const mapStateCenter: MapStateCenter = {
      center: mapCenter || [],
      zoom: mapZoom || 10,
    }
    return Object.assign({}, baseState, mapStateCenter)
  }, [mapCenter, mapZoom, activeCity])

  const chosenCity = useMemo(() => {
    if (activeCity) return activeCity
    if (cities && cities.length) return cities[0]
    return null
  }, [cities, activeCity])

  const cityName = useMemo(() => {
    if (!chosenCity) return ''
    if (locale === 'uz') return chosenCity.name_uz
    if (locale === 'en') return chosenCity.name_en
    return chosenCity.name
  }, [chosenCity, locale])

  const currentCityPrefix = useMemo(() => {
    if (!chosenCity) return ''
    if (locale === 'uz') return `O'zbekiston, ${chosenCity.name_uz},`
    if (locale === 'en') return `Uzbekistan, ${chosenCity.name_en},`
    return `Узбекистан, ${chosenCity.name},`
  }, [chosenCity, locale])

  const cityBounds = activeCity?.bounds || ''

  const changeCity = (city: City) => {
    if (locale === 'uz') {
      setValue('address', `O'zbekiston, ${city.name_uz}`)
      downshiftRef?.current?.reset({ inputValue: `O'zbekiston, ${city.name_uz},` })
    } else if (locale === 'ru') {
      setValue('address', `Узбекистан, ${city.name}`)
      downshiftRef?.current?.reset({ inputValue: `Узбекистан, ${city.name},` })
    } else if (locale === 'en') {
      setValue('address', `Uzbekistan, ${city.name_en}`)
      downshiftRef?.current?.reset({ inputValue: `Uzbekistan, ${city.name_en},` })
    }
    setActiveCity(city)
    if (city) setMapCenter([+city.lat, +city.lon])
  }

  const handleAddressSelect = async (selection: any) => {
    setMapCenter([selection.coordinates.lat, selection.coordinates.long])
    setSelectedCoordinates([
      {
        coordinates: {
          lat: selection.coordinates.lat,
          long: selection.coordinates.long,
        },
        key: `${selection.coordinates.lat}${selection.coordinates.long}`,
      },
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

  const clickOnMap = async (event: any) => {
    const coords = event.get('coords') || event.get('position')

    if (objects.current) {
      const polygon = objects.current.searchContaining(coords).get(0)
      if (!polygon) {
        toast.warn(tr('point_delivery_not_available'), {
          position: toast.POSITION.BOTTOM_RIGHT,
          hideProgressBar: true,
        })
        return
      } else {
        const pickedCity = cities.find(
          (city: City) => city.slug === polygon.properties._data.slug
        )
        if (pickedCity && pickedCity.id !== activeCity.id) {
          changeCity(pickedCity)
        }
      }
    }

    setSelectedCoordinates([
      {
        key: `${coords[0]}${coords[1]}`,
        coordinates: { lat: coords[0], long: coords[1] },
      },
    ])
    setMapZoom(17)

    const { data } = await axios.get(
      `${webAddress}/api/geocode?lat=${coords[0]}&lon=${coords[1]}`
    )

    let house = ''
    data.data.addressItems?.forEach((item: any) => {
      if (item.kind === 'house') {
        house = item.name
      }
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

  const loadPolygonsToMap = (ymaps: any) => {
    if (!mapRef.current) return

    mapRef.current.controls.remove('geolocationControl')
    const geolocationControl = new ymaps.control.GeolocationControl({
      options: { noPlacemark: true },
    })
    geolocationControl.events.add('locationchange', (event: any) => {
      const position = event.get('position')
      clickOnMap(event)
      mapRef.current.panTo(position)
    })
    mapRef.current.controls.add(geolocationControl)

    const geoObjects: any = {
      type: 'FeatureCollection',
      metadata: { name: 'delivery', creator: 'Yandex Map Constructor' },
      features: [],
    }

    cities.forEach((city: any) => {
      if (city.polygons) {
        let arrPolygons = city.polygons.split(',').map((poly: any) => +poly)
        arrPolygons = chunk(arrPolygons, 2)
        arrPolygons = arrPolygons.map((poly: any) => sortBy(poly))
        geoObjects.features.push({
          type: 'Feature',
          id: 0,
          geometry: { type: 'Polygon', coordinates: [arrPolygons] },
          properties: {
            fill: '#FAAF04',
            fillOpacity: 0.1,
            stroke: '#FAAF04',
            strokeWidth: '7',
            strokeOpacity: 0.4,
            slug: city.slug,
          },
        })
      }
    })

    const deliveryZones = ymaps.geoQuery(geoObjects).addToMap(mapRef.current)
    deliveryZones.each((obj: any) => {
      obj.options.set({
        fillColor: obj.properties.get('fill'),
        fillOpacity: obj.properties.get('fillOpacity'),
        strokeColor: obj.properties.get('stroke'),
        strokeWidth: obj.properties.get('strokeWidth'),
        strokeOpacity: obj.properties.get('strokeOpacity'),
      })
      obj.events.add('click', clickOnMap)
    })
    objects.current = deliveryZones
  }

  return (
    <div className="bg-white rounded-2xl p-6 md:p-10 mb-5">
      {/* Delivery/Pickup toggle */}
      <div className="bg-gray-100 flex rounded-full p-1 mb-6">
        <button
          type="button"
          className={`flex-1 font-bold py-3 text-[18px] rounded-full outline-none focus:outline-none transition-colors ${
            tabIndex === 'deliver' ? 'bg-yellow text-white' : 'text-gray-400'
          }`}
          onClick={() => onChangeTab('deliver')}
        >
          {tr('delivery')}
        </button>
        <button
          type="button"
          className={`flex-1 font-bold py-3 text-[18px] rounded-full outline-none focus:outline-none transition-colors ${
            tabIndex === 'pickup' ? 'bg-yellow text-white' : 'text-gray-400'
          }`}
          onClick={() => onChangeTab('pickup')}
        >
          {tr('pickup')}
        </button>
      </div>

      {tabIndex === 'deliver' && (
        <div className="space-y-4">
          {/* City selector */}
          <div className="flex justify-between items-center">
            <div className="text-gray-400 font-bold text-lg">
              {tr('chooseLocation')}
            </div>
            <Menu as="div" className="relative inline-block text-left">
              <MenuButton className="focus:outline-none font-medium inline-flex justify-center py-2 text-secondary text-lg w-full items-center">
                {cityName}
                <ChevronDownIcon
                  className="w-5 h-5 ml-2 -mr-1 text-violet-200 hover:text-violet-100"
                  aria-hidden="true"
                />
              </MenuButton>
              <Transition
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <MenuItems className="z-20 absolute right-0 w-56 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  {cities.map((city: City) => (
                    <MenuItem key={city.id}>
                      <span
                        onClick={() => changeCity(city)}
                        className={`block px-4 py-2 text-sm cursor-pointer ${
                          chosenCity && city.id === chosenCity.id
                            ? 'bg-secondary text-white'
                            : 'text-secondary'
                        }`}
                      >
                        {locale === 'uz'
                          ? city.name_uz
                          : locale === 'ru'
                          ? city.name
                          : locale === 'en'
                          ? city.name_en
                          : city.name}
                      </span>
                    </MenuItem>
                  ))}
                </MenuItems>
              </Transition>
            </Menu>
          </div>

          {/* Address search */}
          <AddressSearch
            defaultValue={locationData?.address || currentCityPrefix}
            cityBounds={cityBounds}
            hasGeoKey={Boolean(yandexGeoKey)}
            onSelect={handleAddressSelect}
            downshiftRef={downshiftRef}
          />

          {/* Saved address chips */}
          <SavedAddressChips
            addresses={addressList}
            selectedId={addressId}
            onSelect={handleSelectSavedAddress}
            onAddNew={onAddNewAddress}
          />

          {/* Yandex Map */}
          {yandexGeoKey && (
            <YMaps query={{ apikey: yandexGeoKey }}>
              <div className="rounded-xl overflow-hidden" style={{ height: '280px' }}>
                <Map
                  state={mapState}
                  onLoad={(ymaps: any) => loadPolygonsToMap(ymaps)}
                  instanceRef={(ref: any) => {
                    mapRef.current = ref
                  }}
                  width="100%"
                  height="280px"
                  onClick={clickOnMap}
                  modules={[
                    'control.ZoomControl',
                    'control.FullscreenControl',
                    'control.GeolocationControl',
                    'geoQuery',
                  ]}
                >
                  {selectedCoordinates.map((item) => (
                    <Placemark
                      modules={['geoObject.addon.balloon']}
                      defaultGeometry={[
                        item.coordinates.lat,
                        item.coordinates.long,
                      ]}
                      geomerty={[item.coordinates.lat, item.coordinates.long]}
                      key={item.key}
                      defaultOptions={{
                        iconLayout: 'default#image',
                        iconImageHref: '/map_placemark.png',
                      }}
                    />
                  ))}
                </Map>
              </div>
            </YMaps>
          )}

          {/* Address detail fields */}
          <AddressDetails register={register} isMobile={false} />

          {/* Nearest branch info */}
          {locationData?.terminalData && (
            <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-green-700">
              <LocationMarkerIcon className="w-5 h-5 flex-shrink-0 text-green-500" />
              <span className="text-sm font-medium">
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

export default AddressSelection
