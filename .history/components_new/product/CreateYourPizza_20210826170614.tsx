import React, { memo, FC, useState, Fragment, useRef, useState } from 'react'
import Image from 'next/image'
import { Dialog, Transition } from '@headlessui/react'

const CreateYourPizza: FC = () => {
  let [isOpen, setIsOpen] = useState(false)
  let completeButtonRef = useRef(null)
  let [active, setActive] = useState(false)
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
          initialFocus={completeButtonRef}
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={closeModal}
        >
          <button ref={completeButtonRef}>Complete order</button>
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
              <div className="bg-gray-100 flex justify-between m-auto max-w-7xl my-8 p-6 rounded-3xl transform transition-all">
                <div className="">
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
                <div className="w-6/12 bg-white rounded-3xl p-5">
                  <div className="text-2xl">Пицца Половинки 50/50</div>
                  <div className="text-gray-200 mb-5">
                    Соедини 2 любимых вкуса
                  </div>
                  <Image src="/createYourPizza.png" width="326" height="326" />
                  <div>
                    <div className="rounded-3xl">
                      <button>Средняя</button>
                    </div>
                    <div className="rounded-3xl">
                      <button>Большая</button>
                    </div>
                    <div className="rounded-3xl">
                      <button>Семейная</button>
                    </div>
                  </div>
                </div>
                <div className="">
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
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

export default memo(CreateYourPizza)
