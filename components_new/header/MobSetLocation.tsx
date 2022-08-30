import React, { Fragment, useRef, useState, memo, FC } from 'react'
import useTranslation from 'next-translate/useTranslation'
import { Dialog, Transition } from '@headlessui/react'
import Image from 'next/image'
import MobLocationTabs from './MobLocationTabs.'
import { useUI } from '@components/ui'

const SetLocation: FC = () => {
  const { t: tr } = useTranslation('common')
  const [open, setOpen] = useState(false)
  const {
    locationData,
    openMobileLocationTabs,
    closeMobileLocationTabs,
    setLocationTabsClosable,
    locationTabsClosable,
    showLocationTabs,
  } = useUI()

  const cancelButtonRef = useRef(null)
  return (
    <>
      <button
        className="bg-yellow cursor-pointer flex items-center justify-center rounded-full text-white w-full h-[40px] md:h-[36px] outline-none focus:outline-none"
        onClick={() => {
          setLocationTabsClosable(true)
          openMobileLocationTabs(true)
        }}
      >
        <div className="flex items-center mr-3">
          <Image src="/assets/location.png" width="14" height="16" />
        </div>
        {locationData && locationData.address
          ? locationData.label
            ? locationData.label
            : locationData.address
          : tr('chooseLocation')}
      </button>
    </>
  )
}

export default memo(SetLocation)
