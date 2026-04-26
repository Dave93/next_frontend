'use client'

import { FC, Fragment, useEffect, useState } from 'react'
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Transition,
  TransitionChild,
} from '@headlessui/react'
import { XIcon } from '@heroicons/react/outline'
import { useUIStore } from '../../lib/stores/ui-store'
import LocationPickerCore from './LocationPickerCore'

const LocationTabsModalApp: FC = () => {
  const showLocationTabs = useUIStore((s) => s.locationModalOpen)
  const locationTabsInitialTab = useUIStore((s) => s.locationModalInitialTab)
  const closeLocationTabs = useUIStore((s) => s.closeLocationModal)

  // Bump on every open so LocationPickerCore re-syncs its inner state
  // from the latest locationData / initialTab.
  const [resyncKey, setResyncKey] = useState(0)
  useEffect(() => {
    if (showLocationTabs) setResyncKey((k) => k + 1)
  }, [showLocationTabs])

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

        <div className="min-h-screen px-3 md:px-4 flex items-start justify-center pt-4 md:pt-10">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 translate-y-4"
            enterTo="opacity-100 translate-y-0"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-4"
          >
            <DialogPanel className="relative bg-white shadow-xl w-full max-w-[1160px] rounded-lg">
              <button
                type="button"
                onClick={closeLocationTabs}
                className="absolute top-3 right-3 z-10 text-gray-400 hover:text-gray-600"
                aria-label="close"
              >
                <XIcon className="w-6 h-6" />
              </button>
              <LocationPickerCore
                initialTab={locationTabsInitialTab || null}
                resyncKey={resyncKey}
                onSaved={closeLocationTabs}
              />
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  )
}

export default LocationTabsModalApp
