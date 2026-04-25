'use client'

import { FC, Fragment, useMemo } from 'react'
import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from '@headlessui/react'
import { DayPicker } from 'react-day-picker'
import { ru, enUS, uz } from 'date-fns/locale'
import 'react-day-picker/dist/style.css'

const YELLOW = '#FAAF04'

const pad = (n: number) => String(n).padStart(2, '0')

const toIso = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

const parseIso = (iso?: string | null) => {
  if (!iso) return undefined
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return undefined
  return new Date(y, m - 1, d)
}

const formatDisplay = (iso: string, locale: string) => {
  const d = parseIso(iso)
  if (!d) return ''
  return d.toLocaleDateString(
    locale === 'uz' ? 'uz-UZ' : locale === 'en' ? 'en-GB' : 'ru-RU',
    { day: '2-digit', month: '2-digit', year: 'numeric' }
  )
}

type Props = {
  value: string | null | undefined
  onChange: (value: string) => void
  placeholder?: string
  locale?: string
  fromYear?: number
  toYear?: number
  className?: string
}

const DatePicker: FC<Props> = ({
  value,
  onChange,
  placeholder = 'дд.мм.гггг',
  locale = 'ru',
  fromYear,
  toYear,
  className,
}) => {
  const selected = parseIso(value || undefined)
  const display = value ? formatDisplay(value, locale) : ''
  const dfLocale = locale === 'uz' ? uz : locale === 'en' ? enUS : ru

  const currentYear = new Date().getFullYear()
  const captionLayout = 'dropdown-buttons' as const
  const fy = fromYear ?? 1930
  const ty = toYear ?? currentYear

  const dayPickerStyles = useMemo(
    () =>
      ({
        '--rdp-cell-size': '38px',
        '--rdp-accent-color': YELLOW,
        '--rdp-background-color': 'rgba(250, 175, 4, 0.08)',
        '--rdp-accent-color-dark': YELLOW,
        '--rdp-background-color-dark': 'rgba(250, 175, 4, 0.16)',
        '--rdp-outline': `2px solid ${YELLOW}`,
        '--rdp-outline-selected': `3px solid ${YELLOW}`,
        margin: 0,
      }) as React.CSSProperties,
    []
  )

  return (
    <Popover className={`relative ${className || ''}`}>
      {({ open, close }) => (
        <>
          <PopoverButton
            type="button"
            className={`w-full text-left flex items-center justify-between px-6 py-3 rounded-full text-sm bg-gray-200 outline-none transition-colors ${
              open ? 'ring-2 ring-yellow-400/40' : 'hover:bg-gray-300/60'
            }`}
          >
            <span className={display ? 'text-gray-900' : 'text-gray-400'}>
              {display || placeholder}
            </span>
            <svg
              className="text-gray-500 ml-2 flex-shrink-0"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </PopoverButton>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-150"
            enterFrom="opacity-0 -translate-y-2 scale-95"
            enterTo="opacity-100 translate-y-0 scale-100"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100 translate-y-0 scale-100"
            leaveTo="opacity-0 -translate-y-2 scale-95"
          >
            <PopoverPanel className="absolute left-0 top-full mt-2 z-50 rounded-2xl bg-white shadow-xl ring-1 ring-black/5 p-3 origin-top-left">
              <DayPicker
                mode="single"
                selected={selected}
                onSelect={(date) => {
                  if (date) {
                    onChange(toIso(date))
                    close()
                  }
                }}
                defaultMonth={selected || new Date(currentYear - 25, 0, 1)}
                captionLayout={captionLayout}
                fromYear={fy}
                toYear={ty}
                locale={dfLocale}
                weekStartsOn={1}
                showOutsideDays
                style={dayPickerStyles}
                modifiersStyles={{
                  selected: {
                    background: YELLOW,
                    color: '#fff',
                    borderRadius: 9999,
                    fontWeight: 700,
                  },
                  today: {
                    color: YELLOW,
                    fontWeight: 700,
                  },
                }}
                styles={{
                  caption: { padding: '0 8px 8px', alignItems: 'center' },
                  caption_label: {
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#111827',
                  },
                  dropdown: {
                    fontSize: 14,
                    color: '#111827',
                    background: 'transparent',
                  },
                  nav_button: {
                    width: 30,
                    height: 30,
                    color: '#374151',
                    borderRadius: 9999,
                  },
                  head_cell: {
                    fontSize: 11,
                    color: '#9CA3AF',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                  },
                  day: {
                    fontSize: 13,
                    color: '#111827',
                    borderRadius: 9999,
                  },
                }}
              />
              <div className="flex items-center justify-between border-t border-gray-100 mt-2 pt-2 px-1">
                <button
                  type="button"
                  onClick={() => {
                    onChange('')
                    close()
                  }}
                  className="text-sm font-semibold text-gray-500 hover:text-red-500 transition-colors px-2 py-1"
                >
                  {locale === 'uz'
                    ? 'Tozalash'
                    : locale === 'en'
                      ? 'Clear'
                      : 'Очистить'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onChange(toIso(new Date()))
                    close()
                  }}
                  className="text-sm font-bold transition-colors px-2 py-1"
                  style={{ color: YELLOW }}
                >
                  {locale === 'uz'
                    ? 'Bugun'
                    : locale === 'en'
                      ? 'Today'
                      : 'Сегодня'}
                </button>
              </div>
            </PopoverPanel>
          </Transition>
        </>
      )}
    </Popover>
  )
}

export default DatePicker
