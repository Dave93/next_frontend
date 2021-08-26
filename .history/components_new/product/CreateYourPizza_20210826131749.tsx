import React, { memo, FC, useState, Fragment } from 'react'
import Image from 'next/image'
import { Dialog, Transition } from '@headlessui/react'

const CreateYourPizza: FC = () => {
  let [isOpen, setIsOpen] = useState(false)
  function closeModal() {
    setIsOpen(false)
  }

  function openModal() {
    setIsOpen(true)
  }
  return (
    <>
      <div className="gap-4 grid grid-cols-2 py-4 md:py-0 items-center justify-between md:flex md:flex-col">
        <div className="text-center">
          <div className="text-lg font-bold mb-2">Создай свою пиццу</div>
          <div>
            <Image src="/createYourPizza.png" width="250" height="250" />
          </div>
          <div className="mt-10">
            <button
              className="bg-gray-100 focus:outline-none font-bold outline-none px-6 py-2 rounded-full text-center text-yellow uppercase"
              onClick={openModal}
            >
              Создать пиццу
            </button>
          </div>
        </div>
      </div>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={closeModal}
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child as={Fragment}>
              <div>
                <div className="absolute right-10 top-36">
                  <button
                    type="button"
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                    onClick={closeModal}
                  >
                    Got it, thanks!
                  </button>
                </div>
                <div className="bg-white grid grid-cols-3 p-6 transform transition-all fixed inset-40">
                                  <div className="grid grid-cols-2">
                                      <div>
                                          <Image width="110" height="110" />
                                      </div>
                  </div>
                  <div>1</div>
                  <div>9</div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

export default memo(CreateYourPizza)
