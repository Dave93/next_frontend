'use client'
import { memo, FC } from 'react'
import Image from 'next/image'
import { useLocationStore } from '../../lib/stores/location-store'
import { useUIStore } from '../../lib/stores/ui-store'

const SetLocation: FC = () => {
  const locationData = useLocationStore((s) => s.locationData) as any
  const openMobileLocationTabs = useUIStore((s) => s.openMobileLocationModal)
  const setLocationTabsClosable = useUIStore((s) => s.setLocationModalClosable)
  return (
    <>
      <button
        className="bg-yellow cursor-pointer flex items-center justify-center rounded-full text-white w-full h-[40px] md:h-[36px] outline-none focus:outline-none"
        onClick={() => {
          setLocationTabsClosable(true)
          openMobileLocationTabs()
        }}
      >
        <div className="flex items-center mr-3">
          <Image src="/assets/location.png" width={14} height={16} alt="" />
        </div>
        {locationData && locationData.address
          ? locationData.label
            ? locationData.label
            : locationData.address
          : 'Укажите свой адрес'}
      </button>
    </>
  )
}

export default memo(SetLocation)
