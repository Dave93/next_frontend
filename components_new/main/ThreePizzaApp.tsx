'use client'
import { FC, useRef, useState } from 'react'
import {
  Dialog,
  DialogBackdrop,
  Transition,
  TransitionChild,
} from '@headlessui/react'
import { CheckIcon, XIcon } from '@heroicons/react/outline'
import { useLocale } from 'next-intl'
import { useLocationStore } from '../../lib/stores/location-store'
import Image from 'next/image'
import { useAddToCart } from '../../lib/hooks/useCartMutations'
import { Product } from '@commerce/types/product'

type ThreePizzaProps = {
  items: Product[]
  channelName: string
  isSmall?: boolean
}
const ThreePizza: FC<ThreePizzaProps> = ({ items, channelName }) => {
  let [isOpen, setIsOpen] = useState(false)
  let completeButtonRef = useRef(null)
  const locale = useLocale()
  const locationData = useLocationStore((s) => s.locationData) as any
  const [selected, setSelected] = useState([] as number[])
  const addMutation = useAddToCart()
  const isLoadingBasket = addMutation.isPending

  const selectProduct = (id: number) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((i) => i != id))
    } else {
      if (selected.length < 3) {
        setSelected([...selected, id])
      } else {
        setSelected([selected[0], selected[1], id])
      }
    }
  }

  const addToBasket = () => {
    if (selected.length < 3) {
      return
    }

    const headProduct: any = items.find((i: any) => i.id === selected[0])
    const childProducts: any[] = [selected[1], selected[2]]
      .map((id) => items.find((i: any) => i.id === id))
      .filter(Boolean)
    const basePrice = Number(headProduct?.price ?? 0)
    const optimisticId = -Date.now()
    const productName =
      headProduct?.attribute_data?.name?.[channelName]?.[locale || 'ru'] ||
      headProduct?.name ||
      ''

    addMutation.mutate({
      variants: [
        {
          id: selected[0],
          quantity: 1,
          modifiers: null,
          three: [selected[1], selected[2]],
        },
      ],
      deliveryType: locationData?.deliveryType,
      optimisticLine: {
        id: optimisticId,
        productId: Number(headProduct?.id ?? selected[0]),
        variantId: Number(selected[0]),
        name: productName,
        qty: 1,
        price: basePrice,
        image: headProduct?.image,
        _raw: {
          id: optimisticId,
          quantity: 1,
          total: basePrice,
          variant: {
            id: selected[0],
            product_id: Number(headProduct?.id ?? selected[0]),
            product: headProduct,
          },
          child: childProducts.map((p) => ({
            variant: { id: p.id, product: p, product_id: p.id },
          })),
        },
      },
    })

    setIsOpen(false)
  }

  return (
    <div>
      <div className="cursor-pointer" onClick={() => setIsOpen(true)}>
        <div className="relative md:block hidden h-[250px]">
          <img
            src={`/three_sale_new/${
              locale == 'uz' ? 'desktop_uz.webp' : 'desktop.webp'
            }`}
          />
        </div>
        <div className="relative md:hidden block h-[200px]">
          <img
            src={`/three_sale_new/${
              locale == 'uz' ? 'mobile_uz.webp' : 'mobile.webp'
            }`}
            className="mx-auto"
          />
        </div>
      </div>
      <Transition show={isOpen}>
        <Dialog
          initialFocus={completeButtonRef}
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={() => setIsOpen(false)}
        >
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <TransitionChild
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <DialogBackdrop className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </TransitionChild>

            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <TransitionChild
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <div className="inline-block align-bottom bg-white p-5 rounded-3xl text-left shadow-xl transform transition-all sm:my-8 sm:align-middle container sm:w-full">
                <button
                  className="absolute focus:outline-none outline-none -right-10 top-2"
                  onClick={() => setIsOpen(false)}
                >
                  <XIcon className="cursor-pointer h-7 text-white w-7" />
                </button>
                <div className="grid md:grid-cols-4 grid-cols-2 gap-10 container">
                  {items.map((item: any) => (
                    <div
                      className={`hover:shadow-lg rounded-3xl flex md:flex-col items-center justify-center border hover:border-yellow p-4 cursor-pointer relative gap-1 ${
                        selected.includes(item.id) ? 'border-yellow' : ''
                      }`}
                      key={item.id}
                      onClick={() => selectProduct(item.id)}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <div>
                          {selected.includes(item.id) && (
                            <div className="absolute right-4 top-2">
                              <CheckIcon className=" text-yellow border border-yellow rounded-full w-6 md:w-10" />
                            </div>
                          )}
                          <Image
                            src={item.image}
                            width={200}
                            height={200}
                            alt={
                              item?.attribute_data?.name[channelName][
                                locale || 'ru'
                              ]
                            }
                          />
                        </div>
                        <div key={item.id} className="text-xl text-center">
                          {
                            item?.attribute_data?.name[channelName][
                              locale || 'ru'
                            ]
                          }
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  className="bg-yellow rounded-3xl px-10 py-2 text-white mt-7 flex items-center justify-around sticky bottom-3 shadow-lg mx-auto"
                  ref={completeButtonRef}
                  onClick={addToBasket}
                >
                  {isLoadingBasket && (
                    <svg
                      className="animate-spin h-5 w-5 text-white flex-grow text-center"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  )}
                  {'Добавить в корзину'}
                </button>
              </div>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>
    </div>
  )
}

export default ThreePizza
