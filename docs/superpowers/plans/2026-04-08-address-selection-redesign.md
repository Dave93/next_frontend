# Address Selection Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract the address selection section from the monolithic `Orders.tsx` (2907 lines) into clean, focused components with separate desktop (search + map) and mobile (search + saved list, no map) UX.

**Architecture:** 6 new components under `components_new/order/AddressSelection/`. Desktop shows search bar, saved address chips, Yandex map with pin, and detail fields. Mobile shows search bar, saved address cards, detail fields, and a CTA button — no map. Both share `AddressSearch` and `AddressDetails` components. The parent `Orders.tsx` passes react-hook-form controls and receives address data via callbacks.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, react-hook-form, Downshift, react-yandex-maps, axios, next-translate

---

## File Structure

```
components_new/order/AddressSelection/
  index.tsx                     # Re-exports both desktop and mobile
  AddressSearch.tsx              # Shared: autocomplete input with Yandex geocode
  SavedAddressChips.tsx          # Desktop: horizontal chip list
  SavedAddressList.tsx           # Mobile: vertical card list
  AddressDetails.tsx             # Shared: flat, entrance, floor, door_code fields
  AddressSelection.tsx           # Desktop: full section with map
  AddressSelectionMobile.tsx     # Mobile: no map, CTA button
```

**Modified files:**
- `components_new/order/Orders.tsx` — remove ~540 lines of address JSX (lines ~1480-2025), replace with `<AddressSelection />` / `<AddressSelectionMobile />`

---

### Task 1: Create AddressDetails component

**Files:**
- Create: `components_new/order/AddressSelection/AddressDetails.tsx`

- [ ] **Step 1: Create the component file**

```tsx
import { FC } from 'react'
import { UseFormRegister } from 'react-hook-form'
import useTranslation from 'next-translate/useTranslation'

interface AddressDetailsProps {
  register: UseFormRegister<any>
  isMobile?: boolean
}

const AddressDetails: FC<AddressDetailsProps> = ({ register, isMobile = false }) => {
  const { t: tr } = useTranslation('common')

  return (
    <div className={isMobile ? 'grid grid-cols-2 gap-2' : 'flex gap-2'}>
      <input
        type="text"
        {...register('flat')}
        placeholder={tr('flat')}
        className="flex-1 px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm outline-none focus:border-yellow"
      />
      <input
        type="text"
        {...register('entrance')}
        placeholder={tr('entrance')}
        className="flex-1 px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm outline-none focus:border-yellow"
      />
      <input
        type="text"
        {...register('floor')}
        placeholder={tr('floor') || 'Этаж'}
        className="flex-1 px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm outline-none focus:border-yellow"
      />
      <input
        type="text"
        {...register('door_code')}
        placeholder={tr('door_code')}
        className="flex-1 px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm outline-none focus:border-yellow"
      />
    </div>
  )
}

export default AddressDetails
```

- [ ] **Step 2: Verify it compiles**

Run: `cd C:/projects/next_frontend && npx tsc --noEmit components_new/order/AddressSelection/AddressDetails.tsx 2>&1 | head -20`

- [ ] **Step 3: Commit**

```bash
git add components_new/order/AddressSelection/AddressDetails.tsx
git commit -m "feat(address): add AddressDetails shared component"
```

---

### Task 2: Create SavedAddressChips component (Desktop)

**Files:**
- Create: `components_new/order/AddressSelection/SavedAddressChips.tsx`

- [ ] **Step 1: Create the component file**

```tsx
import { FC } from 'react'
import { Address } from '@commerce/types/address'
import useTranslation from 'next-translate/useTranslation'

interface SavedAddressChipsProps {
  addresses: Address[] | null
  selectedId: number | null
  onSelect: (address: Address) => void
  onAddNew: () => void
}

const SavedAddressChips: FC<SavedAddressChipsProps> = ({
  addresses,
  selectedId,
  onSelect,
  onAddNew,
}) => {
  const { t: tr } = useTranslation('common')

  if (!addresses || addresses.length === 0) return null

  const getIcon = (label: string | null | undefined) => {
    if (!label) return '📍'
    const lower = label.toLowerCase()
    if (lower.includes('дом') || lower.includes('home') || lower.includes('uy')) return '🏠'
    if (lower.includes('офис') || lower.includes('office') || lower.includes('ofis')) return '🏢'
    return '📍'
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {addresses.map((addr) => (
        <button
          key={addr.id}
          type="button"
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm transition-colors ${
            selectedId === addr.id
              ? 'bg-yellow bg-opacity-10 border-2 border-yellow font-semibold'
              : 'bg-gray-100 border-2 border-transparent hover:border-gray-200'
          }`}
          onClick={() => onSelect(addr)}
        >
          <span>{getIcon(addr.label)}</span>
          <span>{addr.label || addr.address}</span>
        </button>
      ))}
      <button
        type="button"
        className="flex items-center gap-1 px-4 py-2 rounded-full text-sm text-yellow hover:bg-yellow hover:bg-opacity-5 transition-colors"
        onClick={onAddNew}
      >
        + {tr('add_new_address')}
      </button>
    </div>
  )
}

export default SavedAddressChips
```

- [ ] **Step 2: Commit**

```bash
git add components_new/order/AddressSelection/SavedAddressChips.tsx
git commit -m "feat(address): add SavedAddressChips desktop component"
```

---

### Task 3: Create SavedAddressList component (Mobile)

**Files:**
- Create: `components_new/order/AddressSelection/SavedAddressList.tsx`

- [ ] **Step 1: Create the component file**

```tsx
import { FC } from 'react'
import { Address } from '@commerce/types/address'
import { CheckIcon } from '@heroicons/react/solid'
import useTranslation from 'next-translate/useTranslation'

interface SavedAddressListProps {
  addresses: Address[] | null
  selectedId: number | null
  onSelect: (address: Address) => void
  onAddNew: () => void
}

const SavedAddressList: FC<SavedAddressListProps> = ({
  addresses,
  selectedId,
  onSelect,
  onAddNew,
}) => {
  const { t: tr } = useTranslation('common')

  const getIcon = (label: string | null | undefined) => {
    if (!label) return '📍'
    const lower = label.toLowerCase()
    if (lower.includes('дом') || lower.includes('home') || lower.includes('uy')) return '🏠'
    if (lower.includes('офис') || lower.includes('office') || lower.includes('ofis')) return '🏢'
    return '📍'
  }

  return (
    <div className="space-y-2">
      {addresses && addresses.length > 0 && (
        <>
          <div className="text-xs text-gray-400 uppercase tracking-wide">
            {tr('profile_address')}
          </div>
          {addresses.map((addr) => (
            <button
              key={addr.id}
              type="button"
              className={`w-full text-left rounded-xl p-3 flex items-center justify-between transition-colors ${
                selectedId === addr.id
                  ? 'border-2 border-yellow bg-yellow bg-opacity-5'
                  : 'border border-gray-200'
              }`}
              onClick={() => onSelect(addr)}
            >
              <div>
                <div className="font-semibold text-sm flex items-center gap-1">
                  <span>{getIcon(addr.label)}</span>
                  {addr.label || tr('address')}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">{addr.address}</div>
              </div>
              {selectedId === addr.id && (
                <CheckIcon className="w-5 h-5 text-yellow flex-shrink-0" />
              )}
            </button>
          ))}
        </>
      )}
      <button
        type="button"
        className="w-full rounded-xl border border-dashed border-gray-300 p-3 text-center text-sm text-yellow"
        onClick={onAddNew}
      >
        + {tr('add_new_address')}
      </button>
    </div>
  )
}

export default SavedAddressList
```

- [ ] **Step 2: Commit**

```bash
git add components_new/order/AddressSelection/SavedAddressList.tsx
git commit -m "feat(address): add SavedAddressList mobile component"
```

---

### Task 4: Create AddressSearch component

**Files:**
- Create: `components_new/order/AddressSelection/AddressSearch.tsx`

This extracts the Downshift + Yandex geocode autocomplete from Orders.tsx (lines ~492-569).

- [ ] **Step 1: Create the component file**

```tsx
import { FC, useCallback, useRef, useState } from 'react'
import Downshift from 'downshift'
import { debounce } from 'lodash'
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
  const { t: tr } = useTranslation('common')
  const [suggestions, setSuggestions] = useState<GeoSuggestion[]>([])

  const fetchSuggestions = async (value: string) => {
    if (!value || !hasGeoKey) return
    try {
      const { data } = await axios.get(
        `/api/geocode?text=${encodeURI(value)}&bounds=${cityBounds}`
      )
      setSuggestions(data || [])
    } catch {
      setSuggestions([])
    }
  }

  const debouncedFetch = useCallback(debounce(fetchSuggestions, 300), [
    hasGeoKey,
    cityBounds,
  ])

  return (
    <Downshift
      ref={downshiftRef}
      initialInputValue={defaultValue}
      onInputValueChange={(value) => debouncedFetch(value)}
      itemToString={(item: GeoSuggestion | null) =>
        item ? item.formatted : ''
      }
      onSelect={(selection: GeoSuggestion | null) => {
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
        <div className="relative">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
            <input
              {...getInputProps({
                placeholder: tr('address_placeholder') || 'Введите адрес доставки...',
              })}
              className="w-full pl-10 pr-4 py-3.5 bg-gray-100 border-2 border-transparent rounded-xl text-sm outline-none focus:border-yellow focus:bg-white transition-colors"
            />
          </div>
          <ul
            {...getMenuProps()}
            className={`absolute z-30 left-0 right-0 bg-white border border-gray-100 rounded-xl shadow-lg mt-1 max-h-60 overflow-y-auto ${
              isOpen && suggestions.length > 0 ? '' : 'hidden'
            }`}
          >
            {isOpen &&
              suggestions.map((item, index) => (
                <li
                  key={`${item.formatted}-${index}`}
                  {...getItemProps({ item, index })}
                  className={`px-4 py-3 text-sm cursor-pointer border-b border-gray-50 last:border-0 ${
                    highlightedIndex === index
                      ? 'bg-yellow bg-opacity-5'
                      : ''
                  }`}
                >
                  <span className="text-gray-400 mr-2">📍</span>
                  {item.formatted}
                </li>
              ))}
          </ul>
        </div>
      )}
    </Downshift>
  )
}

export default AddressSearch
```

- [ ] **Step 2: Commit**

```bash
git add components_new/order/AddressSelection/AddressSearch.tsx
git commit -m "feat(address): add AddressSearch autocomplete component"
```

---

### Task 5: Create AddressSelection desktop component

**Files:**
- Create: `components_new/order/AddressSelection/AddressSelection.tsx`

This is the main desktop component that composes search, chips, map, and details.

- [ ] **Step 1: Create the component file**

```tsx
import { FC, useMemo, useRef, useState } from 'react'
import { UseFormRegister, UseFormSetValue } from 'react-hook-form'
import { YMaps, Map, Placemark, MapState, MapStateBase, MapStateCenter } from 'react-yandex-maps'
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react'
import { ChevronDownIcon, LocationMarkerIcon } from '@heroicons/react/solid'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'
import axios from 'axios'
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

  const [selectedCoordinates, setSelectedCoordinates] = useState(
    locationData && locationData.location
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

  const chosenCity = useMemo(() => {
    if (activeCity) return activeCity
    if (cities) return cities[0]
    return null
  }, [cities, activeCity])

  const cityName = useMemo(() => {
    if (!chosenCity) return ''
    if (locale === 'uz') return chosenCity.name_uz
    if (locale === 'en') return chosenCity.name_en
    return chosenCity.name
  }, [chosenCity, locale])

  const currentCityPrefix = useMemo(() => {
    if (!activeCity?.active) return ''
    if (locale === 'ru') return 'Узбекистан, ' + activeCity.name + ','
    if (locale === 'uz') return "O'zbekiston, " + activeCity.name_uz + ','
    if (locale === 'en') return 'Uzbekistan, ' + activeCity.name_en + ','
    return ''
  }, [activeCity, locale])

  const changeCity = (city: City) => {
    let link = pathname
    Object.keys(query).map((k: string) => {
      if (k === 'city') link = link.replace('[city]', city.slug)
      else link = link.replace(`[${k}]`, query[k]!.toString())
    })
    setActiveCity(city)
    setMapCenter([+city.lat, +city.lon])
    if (locale === 'uz') {
      setValue('address', "O'zbekiston, " + city.name_uz)
      downshiftRef?.current?.reset({ inputValue: "O'zbekiston, " + city.name_uz + ',' })
    } else if (locale === 'en') {
      setValue('address', 'Uzbekistan, ' + city.name_en)
      downshiftRef?.current?.reset({ inputValue: 'Uzbekistan, ' + city.name_en + ',' })
    } else {
      setValue('address', 'Узбекистан, ' + city.name)
      downshiftRef?.current?.reset({ inputValue: 'Узбекистан, ' + city.name + ',' })
    }
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
    selection.addressItems.map((address: any) => {
      if (address.kind === 'house') {
        setValue('house', address.name)
        house = address.name
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
      terminal_id: terminalData.terminal_id,
      terminalData: terminalData.terminalData,
    })
  }

  const clickOnMap = async (event: any) => {
    const coords = event.get('coords') || event.get('position')
    let polygon = objects.current?.searchContaining(coords)?.get(0)
    if (!polygon) {
      toast.warn(tr('point_delivery_not_available'), {
        position: toast.POSITION.BOTTOM_RIGHT,
        hideProgressBar: true,
      })
      return
    } else {
      let pickedCity = cities.find((city: City) => city.slug === polygon.properties._data.slug)
      if (pickedCity && pickedCity.id !== activeCity.id) {
        changeCity(pickedCity)
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
      terminal_id: terminalData.terminal_id,
      terminalData: terminalData.terminalData,
    })
  }

  const loadPolygonsToMap = (ymaps: any) => {
    mapRef.current.controls.remove('geolocationControl')
    const geolocationControl = new ymaps.control.GeolocationControl({ options: { noPlacemark: true } })
    geolocationControl.events.add('locationchange', (event: any) => {
      const position = event.get('position')
      clickOnMap({ get: (key: string) => (key === 'coords' ? position : null) })
    })
    mapRef.current.controls.add(geolocationControl)

    const objectManager = ymaps.geoQuery(
      cities
        .filter((city: City) => city.polygon)
        .map((city: City) => ({
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
  }

  return (
    <div className="bg-white rounded-2xl p-6 md:p-10 mb-5">
      {/* Delivery / Pickup toggle */}
      <div className="bg-gray-100 flex rounded-full p-1 mb-6">
        <button
          type="button"
          className={`flex-1 font-bold py-3 text-base rounded-full outline-none transition-colors ${
            tabIndex === 'deliver' ? 'bg-yellow text-white' : 'text-gray-400'
          }`}
          onClick={() => onChangeTab('deliver')}
        >
          {tr('delivery')}
        </button>
        <button
          type="button"
          className={`flex-1 font-bold py-3 text-base rounded-full outline-none transition-colors ${
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
            <span className="text-gray-400 text-sm">{tr('chooseLocation')}</span>
            <Menu as="div" className="relative">
              <MenuButton className="font-semibold text-secondary text-sm flex items-center gap-1 outline-none">
                {cityName}
                <ChevronDownIcon className="w-4 h-4" />
              </MenuButton>
              <Transition
                enter="transition ease-out duration-100"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <MenuItems className="absolute right-0 z-20 w-48 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                  {cities.map((city: City) => (
                    <MenuItem key={city.id}>
                      <button
                        type="button"
                        className={`block w-full text-left px-4 py-2.5 text-sm ${
                          city.id === chosenCity?.id ? 'bg-yellow bg-opacity-10 text-yellow font-semibold' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={() => changeCity(city)}
                      >
                        {locale === 'uz' ? city.name_uz : locale === 'en' ? city.name_en : city.name}
                      </button>
                    </MenuItem>
                  ))}
                </MenuItems>
              </Transition>
            </Menu>
          </div>

          {/* Address search */}
          <AddressSearch
            defaultValue={locationData?.address || currentCityPrefix}
            cityBounds={activeCity?.bounds || ''}
            hasGeoKey={!!yandexGeoKey}
            onSelect={handleAddressSelect}
            downshiftRef={downshiftRef}
          />

          {/* Saved addresses */}
          <SavedAddressChips
            addresses={addressList}
            selectedId={addressId}
            onSelect={onSelectAddress}
            onAddNew={onAddNewAddress}
          />

          {/* Yandex Map */}
          {yandexGeoKey && (
            <div className="rounded-xl overflow-hidden">
              <YMaps query={{ apikey: yandexGeoKey }}>
                <Map
                  state={mapState}
                  onLoad={loadPolygonsToMap}
                  instanceRef={(ref) => (mapRef.current = ref)}
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

          {/* Address details */}
          <AddressDetails register={register} />

          {/* Nearest branch */}
          {locationData?.terminalData && (
            <div className="flex items-center gap-2 bg-green-50 rounded-xl px-4 py-3 text-sm">
              <LocationMarkerIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>
                {tr('nearest_filial', { filialName: locationData.terminalData.name })}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AddressSelection
```

- [ ] **Step 2: Commit**

```bash
git add components_new/order/AddressSelection/AddressSelection.tsx
git commit -m "feat(address): add AddressSelection desktop component with map"
```

---

### Task 6: Create AddressSelectionMobile component

**Files:**
- Create: `components_new/order/AddressSelection/AddressSelectionMobile.tsx`

- [ ] **Step 1: Create the component file**

```tsx
import { FC, useMemo } from 'react'
import { UseFormRegister, UseFormSetValue } from 'react-hook-form'
import { LocationMarkerIcon } from '@heroicons/react/solid'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import axios from 'axios'
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
    if (!activeCity?.active) return ''
    if (locale === 'ru') return 'Узбекистан, ' + activeCity.name + ','
    if (locale === 'uz') return "O'zbekiston, " + activeCity.name_uz + ','
    if (locale === 'en') return 'Uzbekistan, ' + activeCity.name_en + ','
    return ''
  }, [activeCity, locale])

  const handleAddressSelect = async (selection: any) => {
    setValue('address', selection.formatted)
    downshiftRef?.current?.reset({ inputValue: selection.formatted })

    let house = ''
    selection.addressItems.map((address: any) => {
      if (address.kind === 'house') {
        setValue('house', address.name)
        house = address.name
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
      terminal_id: terminalData.terminal_id,
      terminalData: terminalData.terminalData,
    })
  }

  return (
    <div className="bg-white px-4 py-4 mb-1">
      {/* Delivery / Pickup toggle */}
      <div className="bg-gray-100 flex rounded-full p-1 mb-4">
        <button
          type="button"
          className={`flex-1 font-bold py-2.5 text-sm rounded-full outline-none transition-colors ${
            tabIndex === 'deliver' ? 'bg-yellow text-white' : 'text-gray-400'
          }`}
          onClick={() => onChangeTab('deliver')}
        >
          {tr('delivery')}
        </button>
        <button
          type="button"
          className={`flex-1 font-bold py-2.5 text-sm rounded-full outline-none transition-colors ${
            tabIndex === 'pickup' ? 'bg-yellow text-white' : 'text-gray-400'
          }`}
          onClick={() => onChangeTab('pickup')}
        >
          {tr('pickup')}
        </button>
      </div>

      {tabIndex === 'deliver' && (
        <div className="space-y-3">
          {/* Search */}
          <AddressSearch
            defaultValue={locationData?.address || currentCityPrefix}
            cityBounds={activeCity?.bounds || ''}
            hasGeoKey={!!yandexGeoKey}
            onSelect={handleAddressSelect}
            downshiftRef={downshiftRef}
          />

          {/* Saved addresses */}
          <SavedAddressList
            addresses={addressList}
            selectedId={addressId}
            onSelect={onSelectAddress}
            onAddNew={onAddNewAddress}
          />

          {/* Address details */}
          <AddressDetails register={register} isMobile />

          {/* Nearest branch */}
          {locationData?.terminalData && (
            <div className="flex items-center gap-2 bg-green-50 rounded-xl px-3 py-2.5 text-xs">
              <LocationMarkerIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>
                {tr('nearest_filial', { filialName: locationData.terminalData.name })}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AddressSelectionMobile
```

- [ ] **Step 2: Commit**

```bash
git add components_new/order/AddressSelection/AddressSelectionMobile.tsx
git commit -m "feat(address): add AddressSelectionMobile component (no map)"
```

---

### Task 7: Create index barrel export

**Files:**
- Create: `components_new/order/AddressSelection/index.tsx`

- [ ] **Step 1: Create barrel file**

```tsx
export { default as AddressSelection } from './AddressSelection'
export { default as AddressSelectionMobile } from './AddressSelectionMobile'
```

- [ ] **Step 2: Commit**

```bash
git add components_new/order/AddressSelection/index.tsx
git commit -m "feat(address): add barrel export for AddressSelection"
```

---

### Task 8: Integrate into Orders.tsx

**Files:**
- Modify: `components_new/order/Orders.tsx`

This replaces the inline address/delivery section (~lines 1480-2025) with the new components.

- [ ] **Step 1: Add imports at top of Orders.tsx**

After existing imports (around line 62), add:

```tsx
import { AddressSelection, AddressSelectionMobile } from './AddressSelection'
```

- [ ] **Step 2: Replace the delivery/address section in JSX**

Find the section starting with comment `{/* Delivery/Pickup section */}` (around line 1480) and the closing `</div>` of pickup section (around line 2025). Replace the entire block:

```tsx
{/* Delivery/Address section */}
{isMobile ? (
  <AddressSelectionMobile
    register={register}
    setValue={setValue}
    locationData={locationData}
    setLocationData={setLocationData}
    activeCity={activeCity}
    addressList={addressList}
    addressId={addressId}
    onSelectAddress={selectAddressLocal}
    onAddNewAddress={addNewAddress}
    yandexGeoKey={yandexGeoKey}
    configData={configData}
    tabIndex={tabIndex}
    onChangeTab={changeTabIndex}
    searchTerminal={searchTerminal}
    downshiftRef={downshiftControl}
  />
) : (
  <AddressSelection
    register={register}
    setValue={setValue}
    locationData={locationData}
    setLocationData={setLocationData}
    cities={cities}
    activeCity={activeCity}
    setActiveCity={setActiveCity}
    addressList={addressList}
    addressId={addressId}
    onSelectAddress={selectAddressLocal}
    onAddNewAddress={addNewAddress}
    yandexGeoKey={yandexGeoKey}
    configData={configData}
    tabIndex={tabIndex}
    onChangeTab={changeTabIndex}
    searchTerminal={searchTerminal}
    downshiftRef={downshiftControl}
    mapRef={map}
  />
)}
```

- [ ] **Step 3: Remove now-unused imports from Orders.tsx**

Remove these imports that are now handled inside AddressSelection components:
- `Downshift` (if no longer used elsewhere in Orders.tsx)
- `YMaps, Map, Placemark, MapState, MapStateBase, MapStateCenter` from `react-yandex-maps`
- `Menu, MenuButton, MenuItem, MenuItems` from `@headlessui/react` (if only used in address section)

Also remove the now-unused state variables:
- `geoSuggestions`, `setGeoSuggestions`
- `selectedCoordinates`, `setSelectedCoordinates`
- `mapCenter`, `setMapCenter`
- `mapZoom`, `setMapZoom`
- `debouncedAddressInputChangeHandler`
- `addressInputChangeHandler`
- `setActive` (city change for address)
- `setSelectedAddress`
- `clickOnMap`
- `loadPolygonsToMap`
- `mapState` useMemo

Keep: `map` ref (passed to AddressSelection), `downshiftControl` ref (passed to AddressSearch).

- [ ] **Step 4: Verify the app compiles**

Run: `cd C:/projects/next_frontend && bun run build 2>&1 | tail -30`

Expected: Build succeeds without type errors related to address components.

- [ ] **Step 5: Manual smoke test**

Run: `bun dev` and navigate to `http://localhost:5656/tashkent/order`

Verify:
- Desktop: search bar, saved address chips, map, detail fields all render
- Mobile (resize to <768px): search bar, saved address cards, detail fields, no map
- Selecting a saved address updates the form
- Typing in search shows autocomplete suggestions
- Clicking map (desktop) places pin and fills address

- [ ] **Step 6: Commit**

```bash
git add components_new/order/Orders.tsx
git commit -m "refactor(orders): replace inline address section with AddressSelection components"
```

---

### Task 9: Final cleanup and push

- [ ] **Step 1: Remove the compact address bar in Orders.tsx**

The section at ~line 1457-1479 that shows a compact mobile address bar can be removed — the new `AddressSelectionMobile` handles this display.

- [ ] **Step 2: Run full build to verify**

Run: `cd C:/projects/next_frontend && bun run build 2>&1 | tail -20`

- [ ] **Step 3: Final commit and push**

```bash
git add -A
git commit -m "refactor(orders): clean up unused address code after extraction"
git push
```
