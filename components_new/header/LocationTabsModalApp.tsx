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

const YELLOW = '#FAAF04'
const BRAND_BLUE = '#2F5E8E'
const GRAY_400 = '#9CA3AF'
const GRAY_500 = '#6B7280'
const GRAY_100 = '#F3F4F6'

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

  const defaultAddress = useMemo(
    () => `${countryPrefix}, ${cityName},`,
    [countryPrefix, cityName]
  )

  const [tab, setTab] = useState<Tab>(locationData?.deliveryType || 'deliver')
  const [address, setAddress] = useState(locationData?.address || defaultAddress)
  const [house, setHouse] = useState(locationData?.house || '')
  const [flat, setFlat] = useState(locationData?.flat || '')
  const [entrance, setEntrance] = useState(locationData?.entrance || '')
  const [doorCode, setDoorCode] = useState(locationData?.door_code || '')
  const [label, setLabel] = useState(locationData?.label || '')
  const [showExtras, setShowExtras] = useState(true)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isFocused, setIsFocused] = useState(false)
  const [coords, setCoords] = useState<number[] | null>(
    locationData?.location || null
  )
  const [pickupPoints, setPickupPoints] = useState<any[]>([])
  const [terminal, setTerminal] = useState<any>(locationData?.terminalData || null)
  const [showCityDropdown, setShowCityDropdown] = useState(false)

  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!showLocationTabs) return
    setTab(locationData?.deliveryType || 'deliver')
    setAddress(locationData?.address || defaultAddress)
    setHouse(locationData?.house || '')
    setFlat(locationData?.flat || '')
    setEntrance(locationData?.entrance || '')
    setDoorCode(locationData?.door_code || '')
    setLabel(locationData?.label || '')
    setCoords(locationData?.location || null)
    setTerminal(locationData?.terminalData || null)
  }, [showLocationTabs, locationData, defaultAddress])

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
      if (!address.trim() || address.trim() === defaultAddress.trim()) return
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
    tab === 'deliver'
      ? !address.trim() || address.trim() === defaultAddress.trim()
      : !terminal

  const cityNameOf = (c: any) =>
    locale === 'uz'
      ? c.name_uz
      : locale === 'en'
        ? c.name_en || c.name
        : c.name

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
            <DialogPanel
              className="relative bg-white shadow-xl"
              style={{
                width: '100%',
                maxWidth: 1160,
                padding: 20,
                borderRadius: 8,
              }}
            >
              <button
                type="button"
                onClick={closeLocationTabs}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                aria-label="close"
              >
                <XIcon className="w-6 h-6" />
              </button>

              <div
                className="flex rounded-full overflow-hidden mb-5"
                style={{ background: GRAY_100, height: 51 }}
              >
                <button
                  type="button"
                  onClick={() => setTab('deliver')}
                  className="flex-1 rounded-full transition"
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    background: tab === 'deliver' ? YELLOW : 'transparent',
                    color: tab === 'deliver' ? '#fff' : GRAY_400,
                  }}
                >
                  {t('Доставка')}
                </button>
                <button
                  type="button"
                  onClick={() => setTab('pickup')}
                  className="flex-1 rounded-full transition"
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    background: tab === 'pickup' ? YELLOW : 'transparent',
                    color: tab === 'pickup' ? '#fff' : GRAY_400,
                  }}
                >
                  {t('Самовывоз')}
                </button>
              </div>

              {tab === 'deliver' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span style={{ fontSize: 18, color: GRAY_400 }}>
                      {t('Укажите свой адрес')}
                    </span>
                    {cities && cities.length > 1 ? (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowCityDropdown((s) => !s)}
                          className="flex items-center gap-1"
                          style={{
                            color: BRAND_BLUE,
                            fontSize: 18,
                            fontWeight: 500,
                          }}
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
                                {cityNameOf(c)}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span
                        style={{
                          color: BRAND_BLUE,
                          fontSize: 18,
                          fontWeight: 500,
                        }}
                      >
                        {cityName}
                      </span>
                    )}
                  </div>

                  <div
                    className="mb-2"
                    style={{ fontSize: 18, color: GRAY_400 }}
                  >
                    {t('Адрес:')}
                  </div>
                  <div
                    className="grid"
                    style={{
                      gridTemplateColumns: '630px 180px 270px',
                      gap: 12,
                    }}
                  >
                    <div className="relative">
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => handleAddressChange(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() =>
                          setTimeout(() => setIsFocused(false), 150)
                        }
                        placeholder={t('Адрес')}
                        className="w-full outline-none rounded-full"
                        style={{
                          background: GRAY_100,
                          border: `1px solid ${GRAY_500}`,
                          padding: '12px 32px',
                          fontSize: 16,
                          height: 50,
                        }}
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
                    <input
                      type="text"
                      value={house}
                      onChange={(e) => setHouse(e.target.value)}
                      placeholder={t('Дом')}
                      className="outline-none rounded-full"
                      style={{
                        background: GRAY_100,
                        border: `1px solid ${GRAY_500}`,
                        padding: '12px 32px',
                        fontSize: 16,
                        height: 50,
                      }}
                    />
                    <input
                      type="text"
                      value={flat}
                      onChange={(e) => setFlat(e.target.value)}
                      placeholder={t('Квартира')}
                      className="outline-none rounded-full"
                      style={{
                        background: GRAY_100,
                        border: `1px solid ${GRAY_500}`,
                        padding: '12px 32px',
                        fontSize: 16,
                        height: 50,
                      }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowExtras((s) => !s)}
                    className="mt-3 flex items-center gap-1"
                    style={{ color: YELLOW, fontSize: 16, fontWeight: 500 }}
                  >
                    <span>{t('Указать подъезд и домофон')}</span>
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
                    <div
                      className="grid mt-3"
                      style={{
                        gridTemplateColumns: '196px 196px 560px',
                        gap: 12,
                      }}
                    >
                      <input
                        type="text"
                        value={entrance}
                        onChange={(e) => setEntrance(e.target.value)}
                        placeholder={t('Подъезд')}
                        className="outline-none rounded-full"
                        style={{
                          background: GRAY_100,
                          border: `1px solid ${GRAY_500}`,
                          padding: '12px 32px',
                          fontSize: 16,
                          height: 50,
                        }}
                      />
                      <input
                        type="text"
                        value={doorCode}
                        onChange={(e) => setDoorCode(e.target.value)}
                        placeholder={t('Код от домофона')}
                        className="outline-none rounded-full"
                        style={{
                          background: GRAY_100,
                          border: `1px solid ${GRAY_500}`,
                          padding: '12px 32px',
                          fontSize: 16,
                          height: 50,
                        }}
                      />
                      <input
                        type="text"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        placeholder={t('Название адреса. Например, Дом Работа...')}
                        className="outline-none rounded-full"
                        style={{
                          background: GRAY_100,
                          border: `1px solid ${GRAY_500}`,
                          padding: '12px 32px',
                          fontSize: 16,
                          height: 50,
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {tab === 'pickup' && (
                <div>
                  <div
                    className="mb-3"
                    style={{ fontSize: 18, color: GRAY_400 }}
                  >
                    {t('Выберите пиццерию:')}
                  </div>
                  <div
                    className="grid"
                    style={{
                      gridTemplateColumns: 'repeat(4, 274px)',
                      gap: 8,
                      maxHeight: 480,
                      overflowY: 'auto',
                    }}
                  >
                    {pickupPoints.length === 0 && (
                      <div
                        className="col-span-4 text-center py-8"
                        style={{ color: GRAY_400 }}
                      >
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
                      const addressLine =
                        (locale === 'uz' && p.desc_uz) ||
                        (locale === 'en' && p.desc_en) ||
                        p.desc ||
                        ''
                      const landmark =
                        (locale === 'uz' && p.latrest_uz) ||
                        (locale === 'en' && p.latrest_en) ||
                        p.latrest ||
                        ''
                      const workTime = p.open_time
                        ? `${p.open_time}-${p.close_time || ''}`
                        : ''
                      const isActive = terminal?.id === p.id
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setTerminal(p)}
                          className="text-left flex gap-2"
                          style={{
                            border: `1px solid ${isActive ? YELLOW : GRAY_400}`,
                            borderRadius: 15,
                            padding: 12,
                            background: isActive
                              ? 'rgba(250, 175, 4, 0.08)'
                              : 'transparent',
                          }}
                        >
                          <span
                            className="mt-0.5 flex-shrink-0"
                            style={{
                              width: 16,
                              height: 16,
                              borderRadius: '50%',
                              border: `1px solid ${
                                isActive ? YELLOW : GRAY_400
                              }`,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {isActive && (
                              <span
                                style={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  background: YELLOW,
                                  display: 'block',
                                }}
                              />
                            )}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div
                              style={{
                                fontWeight: 700,
                                fontSize: 14,
                                marginBottom: 4,
                              }}
                            >
                              {name}
                            </div>
                            {addressLine && (
                              <div
                                style={{
                                  fontSize: 12,
                                  color: GRAY_500,
                                  lineHeight: 1.3,
                                }}
                              >
                                {t('Адрес:')} {addressLine}
                              </div>
                            )}
                            {landmark && (
                              <div
                                style={{
                                  fontSize: 12,
                                  color: GRAY_500,
                                  lineHeight: 1.3,
                                }}
                              >
                                {t('Ориентир:')} {landmark}
                              </div>
                            )}
                            {workTime && (
                              <div
                                style={{
                                  fontSize: 12,
                                  color: GRAY_500,
                                  lineHeight: 1.3,
                                }}
                              >
                                {t('Режим работы:')} {workTime}
                              </div>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-end mt-5">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitDisabled}
                  className="rounded-full"
                  style={{
                    padding: '12px 48px',
                    fontSize: 18,
                    fontWeight: 700,
                    color: '#fff',
                    background: submitDisabled ? '#D1D5DB' : YELLOW,
                    cursor: submitDisabled ? 'not-allowed' : 'pointer',
                  }}
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
