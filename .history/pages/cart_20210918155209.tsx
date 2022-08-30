import type { GetServerSidePropsContext } from 'next'
import commerce from '@lib/api/commerce'
import { Layout } from '@components/common'
import Image from 'next/image'
import { XIcon, MinusIcon, PlusIcon, TrashIcon } from '@heroicons/react/solid'
import { useForm } from 'react-hook-form'
import useTranslation from 'next-translate/useTranslation'

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
  const { t: tr } = useTranslation('common')
  const { register, handleSubmit } = useForm()
  const onSubmit = (data: Object) => console.log(JSON.stringify(data))
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
        <div className="border-b flex items-center justify-between pb-10">
          <div className="w-72">
            <form onSubmit={handleSubmit(onSubmit)} className="relative">
              <input
                type="text"
                placeholder={tr('promocode')}
                {...register('discount_code')}
                className="bg-gray-100 focus:outline-none outline-none px-5 py-2 rounded-full text-lg w-full"
              />
              <button className="absolute focus:outline-none outline-none right-1 top-0.5">
                <Image src="/discount_arrow.png" width={28} height={28} />
              </button>
            </form>
          </div>
          <div className="flex items-center font-bold">
            <div className="text-lg text-gray-400">Сумма заказа:</div>
            <div className="ml-7 text-3xl">108 000 сум</div>
          </div>
        </div>
        <div className="md:flex justify-between mt-8 space-y-2 md:space-y-0">
          <button className="md:text-xl text-gray-400 bg-gray-200 flex h-12 items-center justify-between px-12 rounded-full md:w-80 w-full">
            <img src="/left.png" /> {tr('back_to_basket')}
          </button>
          <button
            className={`md:text-xl text-white bg-yellow flex h-12 items-center justify-evenly rounded-full md:w-80 w-full`}
          >
            {tr('pay')} <img src="/right.png" />
          </button>
        </div>
      </div>
    </>
  )
}

Cart.Layout = Layout
