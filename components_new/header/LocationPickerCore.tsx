'use client'

import { FC, useEffect, useMemo, useRef, useState } from 'react'
import { XIcon } from '@heroicons/react/outline'
import { useUI } from '@components/ui/context'
import { useExtracted, useLocale } from 'next-intl'
import axios from 'axios'
import dynamic from 'next/dynamic'
import MapErrorBoundary from './MapErrorBoundary'

const LocationMap = dynamic(() => import('./LocationMap'), { ssr: false })

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

const parseHHMM = (s: string | null | undefined): number | null => {
  if (!s) return null
  const m = /^(\d{1,2})[:.](\d{2})/.exec(s.trim())
  if (!m) return null
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10)
}

const tashkentMinutesNow = () => {
  const tz = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Tashkent',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date())
  const m = /(\d{2}):(\d{2})/.exec(tz)
  if (!m) return new Date().getHours() * 60 + new Date().getMinutes()
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10)
}

const extractScheduleFromDesc = (
  desc: string | null | undefined
): { open: number; close: number } | null => {
  if (!desc) return null
  const m = /(\d{1,2}[:.]\d{2})\s*[-–—]\s*(\d{1,2}[:.]\d{2})/.exec(desc)
  if (!m) return null
  const o = parseHHMM(m[1])
  const c = parseHHMM(m[2])
  if (o == null || c == null) return null
  return { open: o, close: c }
}

const isTerminalOpenNow = (desc?: string | null) => {
  const sched = extractScheduleFromDesc(desc)
  if (!sched) return true
  const now = tashkentMinutesNow()
  if (sched.close >= sched.open)
    return now >= sched.open && now < sched.close
  return now >= sched.open || now < sched.close
}

const useIsMd = () => {
  const [isMd, setIsMd] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const update = () => setIsMd(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return isMd
}

type Props = {
  /**
   * Initial tab to show. Falls back to current locationData.deliveryType
   * or 'deliver'. The modal passes `locationTabsInitialTab` here.
   */
  initialTab?: Tab | null
  /**
   * Triggers a re-sync of internal state from context.locationData. The
   * modal increments this when it opens; for inline usage it can stay 0.
   */
  resyncKey?: number | string | boolean | null
  /**
   * Called after locationData is written. Used by the modal to close
   * itself; inline usage can leave undefined.
   */
  onSaved?: () => void
  /**
   * Hides the inner padded card chrome — for use inside checkout where
   * the parent already provides a card.
   */
  inline?: boolean
}

const LocationPickerCore: FC<Props> = ({
  initialTab,
  resyncKey,
  onSaved,
  inline = false,
}) => {
  const ui = useUI() as any
  const {
    setLocationData,
    locationData,
    activeCity,
    cities,
    setActiveCity,
  } = ui
  const t = useExtracted()
  const locale = useLocale()
  const isMd = useIsMd()

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

  const [tab, setTab] = useState<Tab>(
    initialTab || locationData?.deliveryType || 'deliver'
  )
  const [address, setAddress] = useState(locationData?.address || defaultAddress)
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

  // Re-sync state whenever resyncKey changes (modal open) or initialTab changes.
  useEffect(() => {
    setTab(initialTab || locationData?.deliveryType || 'deliver')
    setAddress(locationData?.address || defaultAddress)
    setHouse(locationData?.house || '')
    setFlat(locationData?.flat || '')
    setEntrance(locationData?.entrance || '')
    setDoorCode(locationData?.door_code || '')
    setLabel(locationData?.label || '')
    setCoords(locationData?.location || null)
    setTerminal(locationData?.terminalData || null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resyncKey, initialTab])

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

  const handleMapPick = async (lat: number, lon: number) => {
    setCoords([lat, lon])
    try {
      const { data } = await axios.get(`/api/geocode?lat=${lat}&lon=${lon}`)
      const item = Array.isArray(data) ? data[0] : data
      if (!item) return
      const houseComp = item.addressItems?.find((c: any) => c.kind === 'house')
      if (houseComp?.name) setHouse(houseComp.name)
      const text = item.formatted || item.title || null
      if (text) setAddress(text)
    } catch {
      // ignore — keep marker without text
    }
  }

  const mapCenter = useMemo<[number, number]>(() => {
    const ac: any = activeCity
    const lat = parseFloat(ac?.lat ?? ac?.latitude ?? ac?.location?.lat)
    const lon = parseFloat(ac?.lon ?? ac?.longitude ?? ac?.location?.lon)
    if (!isNaN(lat) && !isNaN(lon)) return [lat, lon]
    return [41.3111, 69.2797]
  }, [activeCity])

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
        // OrdersApp's payment / submit gates check locationData.terminal_id
        // (snake_case). Keep terminalId too for any consumer using camelCase.
        terminal_id: terminal.id,
        terminalId: terminal.id,
        terminalData: terminal,
      })
    }
    onSaved?.()
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
    <div className={inline ? '' : 'p-3 md:p-5'}>
      <div
        className="flex rounded-full overflow-hidden mb-4 md:mb-5 h-[44px] md:h-[51px]"
        style={{ background: GRAY_100 }}
      >
        <button
          type="button"
          onClick={() => setTab('deliver')}
          className="flex-1 rounded-full transition text-base md:text-lg font-bold"
          style={{
            background: tab === 'deliver' ? YELLOW : 'transparent',
            color: tab === 'deliver' ? '#fff' : GRAY_400,
          }}
        >
          {t('Доставка')}
        </button>
        <button
          type="button"
          onClick={() => setTab('pickup')}
          className="flex-1 rounded-full transition text-base md:text-lg font-bold"
          style={{
            background: tab === 'pickup' ? YELLOW : 'transparent',
            color: tab === 'pickup' ? '#fff' : GRAY_400,
          }}
        >
          {t('Самовывоз')}
        </button>
      </div>

      {tab === 'deliver' && (
        <div>
          <div className="mb-4">
            <MapErrorBoundary
              fallback={
                <div
                  style={{
                    height: 280,
                    borderRadius: 16,
                    border: '1px solid #E5E7EB',
                    background: '#F3F4F6',
                  }}
                />
              }
            >
              <LocationMap
                center={mapCenter}
                coords={coords}
                onPick={handleMapPick}
                height={280}
              />
            </MapErrorBoundary>
          </div>

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

          <div className="mb-2" style={{ fontSize: 18, color: GRAY_400 }}>
            {t('Адрес:')}
          </div>
          <div
            className="grid gap-3"
            style={{
              gridTemplateColumns: isMd
                ? 'minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr)'
                : '1fr',
            }}
          >
            <div className="relative">
              <input
                type="text"
                value={address}
                onChange={(e) => handleAddressChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 150)}
                placeholder={t('Адрес')}
                className="w-full outline-none rounded-full px-[18px] md:px-8"
                style={{
                  background: GRAY_100,
                  border: `1px solid ${GRAY_500}`,
                  paddingTop: 12,
                  paddingBottom: 12,
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
              className="outline-none rounded-full px-[18px] md:px-8"
              style={{
                background: GRAY_100,
                border: `1px solid ${GRAY_500}`,
                paddingTop: 12,
                paddingBottom: 12,
                fontSize: 16,
                height: 50,
              }}
            />
            <input
              type="text"
              value={flat}
              onChange={(e) => setFlat(e.target.value)}
              placeholder={t('Квартира')}
              className="outline-none rounded-full px-[18px] md:px-8"
              style={{
                background: GRAY_100,
                border: `1px solid ${GRAY_500}`,
                paddingTop: 12,
                paddingBottom: 12,
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
              className="grid mt-3 gap-3"
              style={{
                gridTemplateColumns: isMd
                  ? 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 3fr)'
                  : '1fr',
              }}
            >
              <input
                type="text"
                value={entrance}
                onChange={(e) => setEntrance(e.target.value)}
                placeholder={t('Подъезд')}
                className="outline-none rounded-full px-[18px] md:px-8"
                style={{
                  background: GRAY_100,
                  border: `1px solid ${GRAY_500}`,
                  paddingTop: 12,
                  paddingBottom: 12,
                  fontSize: 16,
                  height: 50,
                }}
              />
              <input
                type="text"
                value={doorCode}
                onChange={(e) => setDoorCode(e.target.value)}
                placeholder={t('Код от домофона')}
                className="outline-none rounded-full px-[18px] md:px-8"
                style={{
                  background: GRAY_100,
                  border: `1px solid ${GRAY_500}`,
                  paddingTop: 12,
                  paddingBottom: 12,
                  fontSize: 16,
                  height: 50,
                }}
              />
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder={t('Название адреса. Например, Дом Работа...')}
                className="outline-none rounded-full px-[18px] md:px-8"
                style={{
                  background: GRAY_100,
                  border: `1px solid ${GRAY_500}`,
                  paddingTop: 12,
                  paddingBottom: 12,
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
          <div className="mb-3" style={{ fontSize: 18, color: GRAY_400 }}>
            {t('Выберите пиццерию:')}
          </div>
          <div
            className="grid gap-2"
            style={{
              gridTemplateColumns: isMd
                ? 'repeat(4, minmax(0, 1fr))'
                : '1fr',
            }}
          >
            {pickupPoints.length === 0 && (
              <div
                className="col-span-1 sm:col-span-2 md:col-span-4 text-center py-8"
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
                ''
              const desc =
                (locale === 'uz' && p.desc_uz) ||
                (locale === 'en' && p.desc_en) ||
                p.desc ||
                ''
              const isActive = terminal?.id === p.id
              const open = isTerminalOpenNow(desc)
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => open && setTerminal(p)}
                  disabled={!open}
                  className="text-left flex items-start gap-2"
                  style={{
                    border: `1px solid ${isActive ? YELLOW : GRAY_400}`,
                    borderRadius: 15,
                    padding: 12,
                    background: isActive
                      ? 'rgba(250, 175, 4, 0.08)'
                      : 'transparent',
                    opacity: open ? 1 : 0.3,
                    cursor: open ? 'pointer' : 'not-allowed',
                  }}
                >
                  <span
                    className="mt-0.5 flex-shrink-0"
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      border: `1px solid ${isActive ? YELLOW : GRAY_400}`,
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
                    {desc && (
                      <div
                        style={{
                          fontSize: 12,
                          color: GRAY_500,
                          lineHeight: 1.3,
                          whiteSpace: 'pre-line',
                        }}
                      >
                        {desc}
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex justify-stretch md:justify-end mt-4 md:mt-5">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitDisabled}
          className="rounded-full w-full md:w-auto py-3 md:py-3 px-6 md:px-12 text-base md:text-lg font-bold"
          style={{
            color: '#fff',
            background: submitDisabled ? '#D1D5DB' : YELLOW,
            cursor: submitDisabled ? 'not-allowed' : 'pointer',
          }}
        >
          {t('Подтвердить')}
        </button>
      </div>
    </div>
  )
}

export default LocationPickerCore
