'use client'

import { FC, Fragment, useEffect, useMemo, useRef, useState } from 'react'
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Transition,
  TransitionChild,
} from '@headlessui/react'
import { XIcon } from '@heroicons/react/outline'
import { useUI } from '@components/ui/context'
import { useExtracted, useLocale } from 'next-intl'
import axios from 'axios'

const webAddress = process.env.NEXT_PUBLIC_API_URL

type Suggestion = {
  title: string
  description: string
  formatted: string
  addressItems: any[]
  coordinates: { lat: string; long: string }
}

type Tab = 'deliver' | 'pickup'

const LocationTabsModalApp: FC = () => {
  const ui = useUI() as any
  const {
    showLocationTabs,
    closeLocationTabs,
    setLocationData,
    locationData,
    activeCity,
    cities,
    setActiveCity,
  } = ui
  const t = useExtracted()
  const locale = useLocale()

  const [tab, setTab] = useState<Tab>(locationData?.deliveryType || 'deliver')
  const [address, setAddress] = useState(locationData?.address || '')
  const [house, setHouse] = useState(locationData?.house || '')
  const [flat, setFlat] = useState(locationData?.flat || '')
  const [entrance, setEntrance] = useState(locationData?.entrance || '')
  const [doorCode, setDoorCode] = useState(locationData?.door_code || '')
  const [label, setLabel] = useState(locationData?.label || '')
  const [showExtras, setShowExtras] = useState(
    !!(locationData?.entrance || locationData?.door_code || locationData?.label)
  )
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isFocused, setIsFocused] = useState(false)
  const [coords, setCoords] = useState<number[] | null>(
    locationData?.location || null
  )
  const [pickupPoints, setPickupPoints] = useState<any[]>([])
  const [terminal, setTerminal] = useState<any>(locationData?.terminalData || null)
  const [showCityDropdown, setShowCityDropdown] = useState(false)

  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const cityName = useMemo(() => {
    if (!activeCity) return ''
    if (locale === 'uz') return activeCity.name_uz
    if (locale === 'en') return activeCity.name_en || activeCity.name
    return activeCity.name
  }, [activeCity, locale])

  const countryPrefix = useMemo(() => {
    if (locale === 'uz') return "O'zbekiston"
    if (locale === 'en') return 'Uzbekistan'
    return 'Узбекистан'
  }, [locale])

  useEffect(() => {
    if (!showLocationTabs) return
    setTab(locationData?.deliveryType || 'deliver')
    setAddress(locationData?.address || '')
    setHouse(locationData?.house || '')
    setFlat(locationData?.flat || '')
    setEntrance(locationData?.entrance || '')
    setDoorCode(locationData?.door_code || '')
    setLabel(locationData?.label || '')
    setShowExtras(
      !!(
        locationData?.entrance ||
        locationData?.door_code ||
        locationData?.label
      )
    )
    setCoords(locationData?.location || null)
    setTerminal(locationData?.terminalData || null)
  }, [showLocationTabs, locationData])

  useEffect(() => {
    if (tab !== 'pickup' || !activeCity?.id) return
    let cancelled = false
    axios
      .get(`${webAddress}/api/terminals/pickup?city_id=${activeCity.id}`)
      .then((r) => {
        if (cancelled) return
        const data = Array.isArray(r.data?.data) ? r.data.data : r.data || []
        setPickupPoints(data)
      })
      .catch(() => setPickupPoints([]))
    return () => {
      cancelled = true
    }
  }, [tab, activeCity])

  const fetchSuggestions = (query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      if (!query || query.trim().length < 3) {
        setSuggestions([])
        return
      }
      try {
        const { data } = await axios.get<Suggestion[]>(
          `/api/geocode?text=${encodeURIComponent(query)}&bounds=${
            (activeCity as any)?.bounds || ''
          }`
        )
        setSuggestions(Array.isArray(data) ? data : [])
      } catch {
        setSuggestions([])
      }
    }, 300)
  }

  const handleAddressChange = (val: string) => {
    setAddress(val)
    setCoords(null)
    fetchSuggestions(val)
  }

  const handlePickSuggestion = (s: Suggestion) => {
    setAddress(s.formatted || s.title)
    setCoords([parseFloat(s.coordinates.lat), parseFloat(s.coordinates.long)])
    setSuggestions([])
  }

  const handleSubmit = () => {
    if (tab === 'deliver') {
      if (!address.trim()) return
      setLocationData({
        address,
        house,
        flat,
        entrance,
        door_code: doorCode,
        label,
        deliveryType: 'deliver',
        location: coords || undefined,
      })
    } else {
      if (!terminal) return
      const termAddress =
        (locale === 'uz' && terminal.name_uz) ||
        (locale === 'en' && terminal.name_en) ||
        terminal.name ||
        terminal.desc ||
        ''
      setLocationData({
        address: termAddress,
        house: '',
        flat: '',
        entrance: '',
        door_code: '',
        label: terminal.label || '',
        deliveryType: 'pickup',
        terminalId: terminal.id,
        terminalData: terminal,
      })
    }
    closeLocationTabs()
  }

  const submitDisabled =
    tab === 'deliver' ? !address.trim() : !terminal

  return (
    <Transition show={!!showLocationTabs} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-y-auto"
        onClose={closeLocationTabs}
      >
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <DialogBackdrop className="fixed inset-0 bg-black/50" />
        </TransitionChild>

        <div className="min-h-screen px-4 flex items-start justify-center pt-10">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 translate-y-4"
            enterTo="opacity-100 translate-y-0"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-4"
          >
            <DialogPanel className="relative w-full max-w-3xl bg-white rounded-3xl shadow-xl p-8">
              <button
                type="button"
                onClick={closeLocationTabs}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                aria-label="close"
              >
                <XIcon className="w-6 h-6" />
              </button>

              <div className="flex bg-gray-100 rounded-full p-1 mb-6 max-w-md mx-auto">
                <button
                  type="button"
                  onClick={() => setTab('deliver')}
                  className={`flex-1 py-2 rounded-full text-sm font-medium transition ${
                    tab === 'deliver'
                      ? 'bg-yellow text-white shadow'
                      : 'text-gray-600'
                  }`}
                  style={
                    tab === 'deliver' ? { backgroundColor: '#FFC22A' } : undefined
                  }
                >
                  {t('Доставка')}
                </button>
                <button
                  type="button"
                  onClick={() => setTab('pickup')}
                  className={`flex-1 py-2 rounded-full text-sm font-medium transition ${
                    tab === 'pickup'
                      ? 'bg-yellow text-white shadow'
                      : 'text-gray-600'
                  }`}
                  style={
                    tab === 'pickup' ? { backgroundColor: '#FFC22A' } : undefined
                  }
                >
                  {t('Самовывоз')}
                </button>
              </div>

              {tab === 'deliver' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-500">
                      {t('Укажите свой адрес')}
                    </span>
                    {cities && cities.length > 1 ? (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowCityDropdown((s) => !s)}
                          className="text-sm font-medium text-gray-700 flex items-center gap-1"
                        >
                          {cityName}
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M6 9l6 6 6-6" />
                          </svg>
                        </button>
                        {showCityDropdown && (
                          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow z-10 min-w-[160px]">
                            {cities.map((c: any) => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => {
                                  setActiveCity(c)
                                  setShowCityDropdown(false)
                                }}
                                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                              >
                                {locale === 'uz'
                                  ? c.name_uz
                                  : locale === 'en'
                                    ? c.name_en || c.name
                                    : c.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm font-medium text-gray-700">
                        {cityName}
                      </span>
                    )}
                  </div>

                  <div className="text-sm text-gray-500 mb-2">{t('Адрес:')}</div>
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-12 md:col-span-7 relative">
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => handleAddressChange(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setTimeout(() => setIsFocused(false), 150)}
                        placeholder={`${countryPrefix}, ${cityName},`}
                        className="w-full bg-gray-50 rounded-full px-5 py-3 outline-none text-sm border border-gray-200 focus:border-yellow"
                      />
                      {address && (
                        <button
                          type="button"
                          onClick={() => {
                            setAddress('')
                            setSuggestions([])
                            setCoords(null)
                          }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <XIcon className="w-4 h-4" />
                        </button>
                      )}
                      {isFocused && suggestions.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-2xl shadow-lg z-20 max-h-64 overflow-y-auto">
                          {suggestions.map((s, i) => (
                            <button
                              key={i}
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => handlePickSuggestion(s)}
                              className="block w-full text-left px-5 py-2 text-sm hover:bg-gray-50"
                            >
                              <div className="font-medium">{s.title}</div>
                              {s.description && (
                                <div className="text-xs text-gray-500">
                                  {s.description}
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="col-span-6 md:col-span-2">
                      <input
                        type="text"
                        value={house}
                        onChange={(e) => setHouse(e.target.value)}
                        placeholder={t('Дом')}
                        className="w-full bg-gray-50 rounded-full px-5 py-3 outline-none text-sm border border-gray-200 focus:border-yellow"
                      />
                    </div>
                    <div className="col-span-6 md:col-span-3">
                      <input
                        type="text"
                        value={flat}
                        onChange={(e) => setFlat(e.target.value)}
                        placeholder={t('Квартира')}
                        className="w-full bg-gray-50 rounded-full px-5 py-3 outline-none text-sm border border-gray-200 focus:border-yellow"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowExtras((s) => !s)}
                    className="mt-3 text-yellow text-sm font-medium flex items-center gap-1"
                    style={{ color: '#F9B004' }}
                  >
                    {t('Указать подъезд и домофон')}
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{
                        transform: showExtras ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.15s',
                      }}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>

                  {showExtras && (
                    <div className="grid grid-cols-12 gap-3 mt-3">
                      <div className="col-span-6 md:col-span-3">
                        <input
                          type="text"
                          value={entrance}
                          onChange={(e) => setEntrance(e.target.value)}
                          placeholder={t('Подъезд')}
                          className="w-full bg-gray-50 rounded-full px-5 py-3 outline-none text-sm border border-gray-200 focus:border-yellow"
                        />
                      </div>
                      <div className="col-span-6 md:col-span-3">
                        <input
                          type="text"
                          value={doorCode}
                          onChange={(e) => setDoorCode(e.target.value)}
                          placeholder={t('Код от домофона')}
                          className="w-full bg-gray-50 rounded-full px-5 py-3 outline-none text-sm border border-gray-200 focus:border-yellow"
                        />
                      </div>
                      <div className="col-span-12 md:col-span-6">
                        <input
                          type="text"
                          value={label}
                          onChange={(e) => setLabel(e.target.value)}
                          placeholder={t('Название адреса. Например, Дом Работа...')}
                          className="w-full bg-gray-50 rounded-full px-5 py-3 outline-none text-sm border border-gray-200 focus:border-yellow"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {tab === 'pickup' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-500">
                      {t('Выберите ресторан')}
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      {cityName}
                    </span>
                  </div>
                  <div className="max-h-80 overflow-y-auto space-y-2">
                    {pickupPoints.length === 0 && (
                      <div className="text-sm text-gray-400 text-center py-8">
                        {t('Загрузка...')}
                      </div>
                    )}
                    {pickupPoints.map((p) => {
                      const name =
                        (locale === 'uz' && p.name_uz) ||
                        (locale === 'en' && p.name_en) ||
                        p.name ||
                        p.desc ||
                        ''
                      const isActive = terminal?.id === p.id
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setTerminal(p)}
                          className={`w-full text-left px-5 py-3 rounded-2xl border transition ${
                            isActive
                              ? 'border-yellow bg-yellow/10'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          style={
                            isActive
                              ? { borderColor: '#F9B004', background: 'rgba(249,176,4,0.08)' }
                              : undefined
                          }
                        >
                          <div className="font-medium text-sm">{name}</div>
                          {p.desc && p.desc !== name && (
                            <div className="text-xs text-gray-500 mt-0.5">
                              {p.desc}
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitDisabled}
                  className={`px-8 py-3 rounded-full font-bold text-white transition ${
                    submitDisabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-yellow'
                  }`}
                  style={
                    submitDisabled ? undefined : { backgroundColor: '#F9B004' }
                  }
                >
                  {t('Подтвердить')}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  )
}

export default LocationTabsModalApp
