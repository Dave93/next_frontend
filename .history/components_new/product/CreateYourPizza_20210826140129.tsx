import React, { memo, FC, useState, Fragment, useRef } from 'react'
import Image from 'next/image'
import { Dialog, Transition } from '@headlessui/react'

const CreateYourPizza: FC = () => {
  let [isOpen, setIsOpen] = useState(false)
  const cancelButtonRef = useRef(null)
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
      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={closeModal}
          initialFocus={cancelButtonRef}
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
              <div className="inline-block align-bottom bg-white p-10 rounded-lg text-left shadow-xl transform transition-all sm:my-8 sm:align-middle container sm:w-full">
                <div className="col-span-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-3xl bg-white p-2 w-[130px] h-[174px]">
                      <Image src="/pizza_img.png" width="110" height="110" />
                      <div>СЫРНАЯ</div>
                      <div className="text-gray-400">86000 сум</div>
                    </div>
                    <div className="rounded-3xl bg-white p-2 w-[130px] h-[174px]">
                      <Image src="/pizza_img.png" width="110" height="110" />
                      <div>СЫРНАЯ</div>
                      <div className="text-gray-400">86000 сум</div>
                    </div>
                    <div className="rounded-3xl bg-white p-2 w-[130px] h-[174px]">
                      <Image src="/pizza_img.png" width="110" height="110" />
                      <div>СЫРНАЯ</div>
                      <div className="text-gray-400">86000 сум</div>
                    </div>
                  </div>
                </div>
                <div className="w-[500] bg-white rounded-3xl col-span-6">
                  <div>Пицца Половинки 50/50</div>
                  <div>Соедини 2 любимых вкуса</div>
                  <Image src="/createYourPizza.png" width="326" height="326" />
                </div>
                <div className="col-span-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-3xl bg-white p-2 w-[130px] h-[174px]">
                      <Image src="/pizza_img.png" width="110" height="110" />
                      <div>СЫРНАЯ</div>
                      <div className="text-gray-400">86000 сум</div>
                    </div>
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  )
}

export default memo(CreateYourPizza)