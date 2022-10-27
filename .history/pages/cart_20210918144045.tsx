import type { GetServerSidePropsContext, GetStaticPropsContext } from 'next'
import useCart from '@framework/cart/use-cart'
import usePrice from '@framework/product/use-price'
import commerce from '@lib/api/commerce'
import { Layout } from '@components/common'
import { Button, Text } from '@components/ui'
import { Bag, Cross, Check, MapPin, CreditCard } from '@components/icons'
import { CartItem } from '@components/cart'
import { Disclosure } from '@headlessui/react'
import Image from 'next/image'

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
      <div className="mt-10">
        <div className="flex justify-between">
          <div className="flex">
            <Image src="/pizza_img.png" width="70" height="70" />
            <div className="ml-7 space-y-2">
              <div className="text-xl font-bold">Пепперони</div>
              <div className="text-xs text-gray-400">
                Средняя 32 см, Традиционное тесто
              </div>
            </div>
          </div>
          <div className="flex">
            <div className="flex bg-yellow w-20">
              <div>-</div>
              <div>1</div>
              <div>+</div>
            </div>
            <div>36 000 сум</div>
            <div>X</div>
          </div>
        </div>
      </div>
    </div>
  )
}

Cart.Layout = Layout
