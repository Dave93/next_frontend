import type { GetServerSidePropsContext } from 'next'
import commerce from '@lib/api/commerce'
import { Layout } from '@components/common'
import Image from 'next/image'
import { XIcon, MinusIcon, PlusIcon } from '@heroicons/react/solid'

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
    <div className="border p-10 rounded-2xl text-xl mt-5 bg-white">
      <div className="flex justify-between items-center">
        <div className="text-lg font-bold">
          Корзина <span className="text-yellow">(3)</span>
        </div>
        <div className="text-gray-400 text-sm">Очистить всё </div>
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
            <div>36 000 сўм</div>
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
            <div>36 000 сўм</div>
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
            <div>36 000 сўм</div>
            <XIcon
              className="cursor-pointer h-4 text-black w-4"
              onClick={() => ''}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

Cart.Layout = Layout
