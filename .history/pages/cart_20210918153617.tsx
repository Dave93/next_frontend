import type { GetServerSidePropsContext } from 'next'
import commerce from '@lib/api/commerce'
import { Layout } from '@components/common'
import Image from 'next/image'
import { XIcon, MinusIcon, PlusIcon, TrashIcon } from '@heroicons/react/solid'

export async function getServerSideProps({
  preview,
  locale,
  locales,
}: GetServerSidePropsContext) {
  const config = { locale, locales }
  const productsPromise = commerce.getAllProducts({
    variables: { first: 6 },
    config,
    preview,
    // Saleor provider only
    ...({ featured: true } as any),
  })
  const pagesPromise = commerce.getAllPages({ config, preview })
  const siteInfoPromise = commerce.getSiteInfo({ config, preview })
  const { products } = await productsPromise
  const { pages } = await pagesPromise
  const { categories, brands, topMenu, footerInfoMenu, socials, cities } =
    await siteInfoPromise

  return {
    props: {
      products,
      categories,
      brands,
      pages,
      topMenu,
      footerInfoMenu,
      socials,
      cleanBackground: true,
      cities,
    },
  }
}

export default function Cart() {
  return (
    <>
      <div className="p-10 rounded-2xl text-xl mt-5 bg-white mb-3">
        <div className="flex justify-between items-center">
          <div className="text-lg font-bold">
            Корзина <span className="text-yellow">(3)</span>
          </div>
          {/* <div className="text-gray-400 text-sm flex cursor-pointer">
            Очистить всё <TrashIcon className=" w-5 h-5 ml-1" />
          </div> */}
        </div>
        <div className="mt-10 space-y-3">
          <div className="flex justify-between items-center border-b pb-3">
            <div className="flex">
              <Image src="/pizza_img.png" width="70" height="70" />
              <div className="ml-7 space-y-2">
                <div className="text-xl font-bold">Пепперони</div>
                <div className="text-xs text-gray-400">
                  Средняя 32 см, Традиционное тесто
                </div>
              </div>
            </div>
            <div className="flex space-x-10 items-center">
              <div className="w-20 h-6 ml-1 bg-yellow rounded-full flex items-center text-white">
                <div className="w-6 h-6 items-center flex justify-around">
                  <MinusIcon
                    className="cursor-pointer w-5 h-5"
                    onClick={() => ''}
                  />
                </div>
                <div className="flex-grow text-center">{1}</div>
                <div className="w-6 h-6 items-center flex justify-around">
                  <PlusIcon
                    className="cursor-pointer w-5 h-5"
                    onClick={() => ''}
                  />
                </div>
              </div>
              <div>36 000 сум</div>
              <XIcon
                className="cursor-pointer h-4 text-black w-4"
                onClick={() => ''}
              />
            </div>
          </div>
          <div className="flex justify-between items-center border-b pb-3">
            <div className="flex">
              <Image src="/pizza_img.png" width="70" height="70" />
              <div className="ml-7 space-y-2">
                <div className="text-xl font-bold">Пепперони</div>
                <div className="text-xs text-gray-400">
                  Средняя 32 см, Традиционное тесто
                </div>
              </div>
            </div>
            <div className="flex space-x-10 items-center">
              <div className="w-20 h-6 ml-1 bg-yellow rounded-full flex items-center text-white">
                <div className="w-6 h-6 items-center flex justify-around">
                  <MinusIcon
                    className="cursor-pointer w-5 h-5"
                    onClick={() => ''}
                  />
                </div>
                <div className="flex-grow text-center">{1}</div>
                <div className="w-6 h-6 items-center flex justify-around">
                  <PlusIcon
                    className="cursor-pointer w-5 h-5"
                    onClick={() => ''}
                  />
                </div>
              </div>
              <div>36 000 сум</div>
              <XIcon
                className="cursor-pointer h-4 text-black w-4"
                onClick={() => ''}
              />
            </div>
          </div>
          <div className="flex justify-between items-center border-b pb-3">
            <div className="flex">
              <Image src="/pizza_img.png" width="70" height="70" />
              <div className="ml-7 space-y-2">
                <div className="text-xl font-bold">Пепперони</div>
                <div className="text-xs text-gray-400">
                  Средняя 32 см, Традиционное тесто
                </div>
              </div>
            </div>
            <div className="flex space-x-10 items-center">
              <div className="w-20 h-6 ml-1 bg-yellow rounded-full flex items-center text-white">
                <div className="w-6 h-6 items-center flex justify-around">
                  <MinusIcon
                    className="cursor-pointer w-5 h-5"
                    onClick={() => ''}
                  />
                </div>
                <div className="flex-grow text-center">{1}</div>
                <div className="w-6 h-6 items-center flex justify-around">
                  <PlusIcon
                    className="cursor-pointer w-5 h-5"
                    onClick={() => ''}
                  />
                </div>
              </div>
              <div>36 000 сум</div>
              <XIcon
                className="cursor-pointer h-4 text-black w-4"
                onClick={() => ''}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="p-10 rounded-2xl bg-white">
        <div className="md:flex justify-between mt-8 space-y-2 md:space-y-0">
          <button className="md:text-xl text-gray-400 bg-gray-200 flex h-12 items-center justify-between px-12 rounded-full md:w-80 w-full">
            <img src="/left.png" /> {tr('back_to_basket')}
          </button>
          <button
            className={`md:text-xl text-white bg-yellow flex h-12 items-center justify-evenly rounded-full md:w-80 w-full ${
              !locationData?.terminal_id ? 'opacity-25 cursor-not-allowed' : ''
            }`}
            disabled={!locationData?.terminal_id || isSavingOrder}
            onClick={handleSubmit(prepareOrder)}
          >
            {isSavingOrder ? (
              <svg
                className="animate-spin h-5 mx-auto text-center text-white w-5"
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
            ) : (
              <>
                {tr('pay')} <img src="/right.png" />
              </>
            )}
          </button>
        </div>
      </div>
    </>
  )
}

Cart.Layout = Layout
