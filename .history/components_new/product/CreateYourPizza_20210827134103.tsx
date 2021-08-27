import React, { memo, FC, useState, Fragment, useRef } from 'react'
import Image from 'next/image'
import { Dialog, Transition } from '@headlessui/react'

const CreateYourPizza: FC = () => {
  let [isOpen, setIsOpen] = useState(false)
  let completeButtonRef = useRef(null)
  let [active, setActive] = useState(true)
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
      <Transition show={isOpen} as={Fragment}>
        <Dialog
          initialFocus={completeButtonRef}
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          open={isOpen}
          onClose={closeModal}
        >
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
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
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <div className="inline-block align-bottom bg-white p-10 rounded-lg text-left shadow-xl transform transition-all sm:my-8 sm:align-middle container sm:w-full">
                <button ref={completeButtonRef}>Complete order</button>
                <div className="grid grid-cols-12 gap-2 container">
                  <div className="grid grid-cols-2 gap-2 text-center col-span-3">
                    <div className="rounded-3xl bg-white p-2 shadow-xl">
                      <Image src="/pizza_img.png" width="110" height="110" />
                      <div>СЫРНАЯ</div>
                      <div className="text-gray-400">86000 сум</div>
                    </div>
                    <div className="rounded-3xl bg-white p-2 shadow-xl">
                      <Image src="/pizza_img.png" width="110" height="110" />
                      <div>СЫРНАЯ</div>
                      <div className="text-gray-400">86000 сум</div>
                    </div>
                    <div className="rounded-3xl bg-white p-2 shadow-xl">
                      <Image src="/pizza_img.png" width="110" height="110" />
                      <div>СЫРНАЯ</div>
                      <div className="text-gray-400">86000 сум</div>
                    </div>
                    <div className="rounded-3xl bg-white p-2 shadow-xl">
                      <Image src="/pizza_img.png" width="110" height="110" />
                      <div>СЫРНАЯ</div>
                      <div className="text-gray-400">86000 сум</div>
                    </div>
                    <div className="rounded-3xl bg-white p-2 shadow-xl">
                      <Image src="/pizza_img.png" width="110" height="110" />
                      <div>СЫРНАЯ</div>
                      <div className="text-gray-400">86000 сум</div>
                    </div>
                    <div className="rounded-3xl bg-white p-2 shadow-xl">
                      <Image src="/pizza_img.png" width="110" height="110" />
                      <div>СЫРНАЯ</div>
                      <div className="text-gray-400">86000 сум</div>
                    </div>
                    <div className="rounded-3xl bg-white p-2 shadow-xl">
                      <Image src="/pizza_img.png" width="110" height="110" />
                      <div>СЫРНАЯ</div>
                      <div className="text-gray-400">86000 сум</div>
                    </div>
                  </div>
                  <div className="bg-white rounded-3xl p-5 text-center col-span-6 shadow-xl">
                    <div className="text-2xl">Пицца Половинки 50/50</div>
                    <div className="text-gray-200 mb-5">
                      Соедини 2 любимых вкуса
                    </div>
                    <Image
                      src="/createYourPizza.png"
                      width="326"
                      height="326"
                    />
                    <div className="flex justify-center mt-5 space-x-4">
                      <div className="rounded-3xl bg-gray-200 px-5 py-2 text-gray-400">
                        <button>Средняя</button>
                      </div>
                      <div
                        className={`${
                          active
                            ? 'bg-yellow text-white'
                            : 'bg-gray-200 text-gray-400'
                        } rounded-3xl  px-5 py-2`}
                      >
                        <button>Большая</button>
                      </div>
                      <div className="rounded-3xl bg-gray-200 px-5 py-2 text-gray-400">
                        <button>Семейная</button>
                      </div>
                    </div>
                    <div className="flex space-x-4 mt-5">
                      <div className="border rounded-3xl w-6/12 p-3">
                        <div>2x ПЕППЕРОНИ</div>
                        <div className="text-xs text-gray-400">
                          Фирменный томатный соус, сыр Моцарелла, ещё больше
                          копченой колбасы
                        </div>
                      </div>
                      <div className="border rounded-3xl w-6/12 p-3">
                        <div>КУРИНАЯ</div>
                        <div className="text-xs text-gray-400">
                          Фирменный томатный соус, сыр Моцарелла, микс мясных
                          деликатесов (говядина, баранина)(Halal), лук красный,
                          маслины, базилик
                        </div>
                      </div>
                    </div>
                    <button className="bg-yellow w-full rounded-3xl px-10 py-2 text-white mt-7">
                      В корзину 120 000 сум
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center col-span-3">
                    <div className="rounded-3xl bg-white p-2 h-[174px] shadow-xl">
                      <Image src="/pizza_img.png" width="110" height="110" />
                      <div>СЫРНАЯ</div>
                      <div className="text-gray-400">86000 сум</div>
                    </div>
                    <div className="rounded-3xl bg-white p-2 h-[174px] shadow-xl">
                      <Image src="/pizza_img.png" width="110" height="110" />
                      <div>СЫРНАЯ</div>
                      <div className="text-gray-400">86000 сум</div>
                    </div>
                    <div className="rounded-3xl bg-white p-2 h-[174px] shadow-xl">
                      <Image src="/pizza_img.png" width="110" height="110" />
                      <div>СЫРНАЯ</div>
                      <div className="text-gray-400">86000 сум</div>
                    </div>
                    <div className="rounded-3xl bg-white p-2 h-[174px] shadow-xl">
                      <Image src="/pizza_img.png" width="110" height="110" />
                      <div>СЫРНАЯ</div>
                      <div className="text-gray-400">86000 сум</div>
                    </div>
                    <div className="rounded-3xl bg-white p-2 h-[174px] shadow-xl">
                      <Image src="/pizza_img.png" width="110" height="110" />
                      <div>СЫРНАЯ</div>
                      <div className="text-gray-400">86000 сум</div>
                    </div>
                    <div className="rounded-3xl bg-white p-2 shadow-xl">
                      <Image src="/pizza_img.png" width="110" height="110" />
                      <div>СЫРНАЯ</div>
                      <div className="text-gray-400">86000 сум</div>
                    </div>
                    <div className="rounded-3xl bg-white p-2 shadow-xl">
                      <Image src="/pizza_img.png" width="110" height="110" />
                      <div>СЫРНАЯ</div>
                      <div className="text-gray-400">86000 сум</div>
                    </div>
                    <div className="rounded-3xl bg-white p-2 shadow-xl">
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
