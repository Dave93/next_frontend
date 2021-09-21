import type { GetServerSidePropsContext, GetStaticPropsContext } from 'next'
import useCart from '@framework/cart/use-cart'
import usePrice from '@framework/product/use-price'
import commerce from '@lib/api/commerce'
import { Layout } from '@components/common'
import { Button, Text } from '@components/ui'
import { Bag, Cross, Check, MapPin, CreditCard } from '@components/icons'
import { CartItem } from '@components/cart'
import { Disclosure } from '@headlessui/react'
import Link from 'next/link'
import useTranslation from 'next-translate/useTranslation'
import { DateTime } from 'luxon'
import currency from 'currency.js'

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
      cities,
    },
  }
}

export default function Cart() {
  const { t: tr } = useTranslation('common')
  return (
    <div className="border  p-10 rounded-2xl text-xl mt-5" key={order.id}>
      <Disclosure>
        {({ open }) => (
          <>
            <div className="flex  text-base justify-between border-b pb-8">
              {open ? (
                <div className="font-bold text-xl">
                  <Link href={`${'/order/' + hashids.encode(order.id)}`}>
                    <a>
                      {tr('order')} № {order.id}
                    </a>
                  </Link>
                </div>
              ) : (
                <div> № {order.id}</div>
              )}

              {!open && (
                <>
                  <div>
                    {DateTime.fromISO(order?.created_at)
                      .setLocale('ru')
                      .setZone('Asia/Tashkent')
                      .toLocaleString(DateTime.DATETIME_MED)}
                  </div>
                  <div className="w-40">{order?.billing_address}</div>
                  <div>
                    {tr('prod-count', {
                      count: order?.basket?.lines.length,
                    })}
                  </div>
                  <div>
                    {currency(order?.order_total / 100, {
                      pattern: '# !',
                      separator: ' ',
                      decimal: '.',
                      symbol: 'сум',
                      precision: 0,
                    }).format()}
                  </div>
                </>
              )}
              <div className={`ml-56 `}>
                {tr(`order_status_${order?.status}`)}
              </div>
            </div>
            {order?.basket?.lines.map((pizza: any) => (
              <Disclosure.Panel
                className="flex items-center justify-between border-b mt-4 pb-4"
                key={pizza.id}
              >
                <div className="flex items-center">
                  {pizza.child && pizza.child.length ? (
                    <div className="h-24 w-24 flex relative">
                      <div className="w-12 relative overflow-hidden">
                        <div>
                          <Image
                            src={
                              pizza?.variant?.product?.assets?.length
                                ? `${webAddress}/storage/${pizza?.variant?.product?.assets[0]?.location}/${pizza?.variant?.product?.assets[0]?.filename}`
                                : '/no_photo.svg'
                            }
                            width="95"
                            height="95"
                            layout="fixed"
                            className="absolute rounded-full"
                          />
                        </div>
                      </div>
                      <div className="w-12 relative overflow-hidden">
                        <div className="absolute right-0">
                          <Image
                            src={
                              pizza?.child[0].variant?.product?.assets?.length
                                ? `${webAddress}/storage/${pizza?.child[0].variant?.product?.assets[0]?.location}/${pizza?.child[0].variant?.product?.assets[0]?.filename}`
                                : '/no_photo.svg'
                            }
                            width="95"
                            height="95"
                            layout="fixed"
                            className="rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Image
                        src={
                          pizza?.variant?.product?.assets?.length
                            ? `${webAddress}/storage/${pizza?.variant?.product?.assets[0]?.location}/${pizza?.variant?.product?.assets[0]?.filename}`
                            : '/no_photo.svg'
                        }
                        width={95}
                        height={95}
                        className="rounded-full w-24"
                      />
                    </div>
                  )}
                  <div className="ml-5">
                    <div className="text-xl font-bold">
                      {pizza.child && pizza.child.length
                        ? `${
                            pizza?.variant?.product?.attribute_data?.name[
                              channelName
                            ][locale || 'ru']
                          } + ${
                            pizza?.child[0].variant?.product?.attribute_data
                              ?.name[channelName][locale || 'ru']
                          }`
                        : pizza?.variant?.product?.attribute_data?.name[
                            channelName
                          ][locale || 'ru']}
                    </div>
                  </div>
                </div>
                <div>
                  {pizza.child && pizza.child.length
                    ? currency(
                        (+pizza.total + +pizza.child[0].total) * pizza.quantity,
                        {
                          pattern: '# !',
                          separator: ' ',
                          decimal: '.',
                          symbol: 'сум',
                          precision: 0,
                        }
                      ).format()
                    : currency(pizza.total * pizza.quantity, {
                        pattern: '# !',
                        separator: ' ',
                        decimal: '.',
                        symbol: 'сум',
                        precision: 0,
                      }).format()}
                </div>
              </Disclosure.Panel>
            ))}
            {open && (
              <>
                <div className="flex items-center justify-between border-b pt-7 pb-7">
                  <div>{tr('order_price')}</div>
                  <div className="font-bold">
                    {currency(order?.order_total / 100, {
                      pattern: '# !',
                      separator: ' ',
                      decimal: '.',
                      symbol: 'сум',
                      precision: 0,
                    }).format()}
                  </div>
                </div>
                <div className="flex items-center justify-between border-b pt-7 pb-7">
                  <div>{tr('order_address')}</div>
                  <div>{order?.billing_address}</div>
                </div>
                <div className="flex items-center justify-between border-b pt-7 pb-7">
                  <div>{tr('order_time')}</div>
                  <div>
                    {DateTime.fromISO(order?.created_at)
                      .setLocale('ru')
                      .setZone('Asia/Tashkent')
                      .toLocaleString(DateTime.DATETIME_MED)}
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-between mt-8">
              <Disclosure.Button className="border flex focus:outline-none items-center justify-between px-3 py-3 w-64 text-lg h-10 rounded-3xl bg-gray-100 text-gray-400">
                <div className="ml-auto">{tr('order_detail')}</div>
                <ChevronDownIcon
                  className={`${
                    open ? 'transform rotate-180' : ''
                  } w-6 h-6 text-purple-500 ml-auto`}
                />
              </Disclosure.Button>
              {/* <Disclosure>
                      <Disclosure.Button className="border flex focus:outline-none items-center justify-center px-3 py-3 w-64 text-lg h-10 rounded-3xl bg-yellow text-white">
                        <div>{tr('order_repeat')}</div>
                      </Disclosure.Button>
                    </Disclosure> */}
            </div>
          </>
        )}
      </Disclosure>
    </div>
  )
}

Cart.Layout = Layout
