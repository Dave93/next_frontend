import React, { Fragment, useMemo, useRef, useState, memo, FC } from 'react'
import useTranslation from 'next-translate/useTranslation'
import { Dialog, Transition } from '@headlessui/react'
import LocationTabs from './LocationTabs'
import Image from 'next/image'
import { useUI } from '@components/ui/context'
import { XIcon } from '@heroicons/react/solid'
import { useRouter } from 'next/router'

const SetLocation: FC = () => {
  const { t: tr } = useTranslation('common')
  const { locale = 'ru' } = useRouter()
  const [open, setOpen] = useState(false)
  const {
    locationData,
    openLocationTabs,
    closeLocationTabs,
    setLocationTabsClosable,
    locationTabsClosable,
    showLocationTabs,
  } = useUI()
  const cancelButtonRef = useRef(null)

  const displayText = useMemo(() => {
    if (!locationData) return tr('chooseLocation')
    if (locationData.deliveryType === 'pickup' && locationData.terminalData) {
      const terminal = locationData.terminalData as any
      return (
        terminal[
          locale === 'uz' ? 'name_uz' : locale === 'en' ? 'name_en' : 'name'
        ] ||
        terminal.name ||
        tr('chooseLocation')
      )
    }
    if (locationData.address) {
      return locationData.label || locationData.address
    }
    return tr('chooseLocation')
  }, [locationData, locale, tr])

  return (
    <>
      <button
        className="bg-yellow truncate cursor-pointer flex items-center justify-center rounded-full text-white w-full h-[40px] md:h-[36px] outline-none focus:outline-none"
        onClick={() => {
          setLocationTabsClosable(true)
          openLocationTabs(true)
        }}
      >
        <div className="flex items-center mr-3">
          <Image src="/assets/location.png" width="14" height="16" alt="" />
        </div>
        {displayText}
      </button>
    </>
  )
}

export default memo(SetLocation)
