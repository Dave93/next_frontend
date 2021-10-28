import type { GetServerSidePropsContext } from 'next'
import commerce from '@lib/api/commerce'
import React, { useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { Ru, Uz } from 'react-flags-select'
import { useUI } from '@components/ui/context'
import Link from '@components/ui/Link'

export async function getServerSideProps({
  preview,
  locale,
  locales,
  query,
}: GetServerSidePropsContext) {
  const config = { locale, locales, queryParams: query }
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
  const {
    categories,
    brands,
    topMenu,
    footerInfoMenu,
    socials,
    cities,
    currentCity,
  } = await siteInfoPromise
  if (!currentCity) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      products,
      categories,
      brands,
      pages,
      topMenu,
      currentCity,
      footerInfoMenu,
      socials,
      cities,
    },
  }
}

const localeLabel = {
  ru: 'Ru',
  uz: 'Uz',
}

export default function Dev() {
  const router = useRouter()
  const { locale, pathname } = router
  const { activeCity, cities } = useUI()
  const [shuffle, setShuffle] = useState(false)

  const chosenCity = useMemo(() => {
    if (activeCity) {
      return activeCity
    }
    if (cities) return cities[0]
    return null
  }, [cities, activeCity])

  const changeLang = (e: any, loc: string | undefined) => {
    e.preventDefault()
    let path = pathname.replace('[city]', activeCity.slug)
    return router.push(path, path, {
      locale: loc,
    })
  }

  const startShuffle = () => {
    setShuffle(true)
  }

  return (
    <div
      className="h-screen w-screen bg-secondary px-36 py-4"
      style={{
        backgroundImage: `url("/Union.png")`,
        backgroundSize: 'cover',
      }}
    >
      <div className="flex justify-between items-center">
        <Link href={`/${chosenCity.slug}`} prefetch={false}>
          <Image src="/assets/footer_logo.svg" width={200} height={72} />
        </Link>
        <div className="w-44 h-10 bg-blue rounded-full flex justify-between">
          <a
            className={`${
              locale == 'ru' ? 'bg-white text-secondary ' : 'text-white'
            } font-medium inline-flex items-center px-4 mx-1 my-1 rounded-full w-20`}
            href={`/${locale}${pathname}`}
            onClick={(e) => changeLang(e, 'ru')}
          >
            <Ru className="w-5" />
            <span className="ml-1.5">{localeLabel.ru}</span>
          </a>
          <a
            className={`${
              locale == 'uz' ? 'bg-white text-secondary ' : 'text-white'
            } font-medium inline-flex items-center px-4 mx-1 my-1 rounded-full w-20`}
            href={`/${locale}${pathname}`}
            onClick={(e) => changeLang(e, 'uz')}
          >
            <Uz className="w-5" />
            <span className="ml-1.5">{localeLabel.uz}</span>
          </a>
        </div>
      </div>
      {!shuffle && (
        <div className="font-bold mt-5 text-4xl text-center text-white uppercase">
          Перемешайте чтобы{' '}
          <span className="text-yellow"> получить подарок</span>
        </div>
      )}

      <div className="grid grid-cols-4 gap-8 gap-y-28 relative mt-32">
        <div className="bg-white rounded-3xl h-32 text-center relative">
          <div className="ml-10 w-56 absolute -top-28">
            <img
              src={shuffle ? '/surprise/box.png' : '/surprise/2.png'}
              alt=""
            />
          </div>
          {!shuffle && (
            <div className="text-xl font-bold absolute bottom-2 ml-auto w-full ">
              пицца пепперони
            </div>
          )}
        </div>
        <div className="bg-white rounded-3xl h-32 text-center relative">
          <div className="ml-10 w-56 absolute -top-28">
            <img
              src={shuffle ? '/surprise/box.png' : '/surprise/3.png'}
              alt=""
            />
          </div>
          {!shuffle && (
            <div className="text-xl font-bold absolute bottom-2 ml-auto w-full ">
              Соca-cola 0,5 литр
            </div>
          )}
        </div>
        <div className="bg-white rounded-3xl h-32 text-center relative">
          <div className="ml-10 w-56 absolute -top-28">
            <img
              src={shuffle ? '/surprise/box.png' : '/surprise/4.png'}
              alt=""
            />
          </div>
          {!shuffle && (
            <div className="text-xl font-bold absolute bottom-2 ml-auto w-full">
              греческий салат
            </div>
          )}
        </div>
        <div className="bg-white rounded-3xl h-32 text-center relative">
          <div className="ml-10 w-56 absolute -top-28">
            <img
              src={shuffle ? '/surprise/box.png' : '/surprise/5.png'}
              alt=""
            />
          </div>
          {!shuffle && (
            <div className="text-xl font-bold absolute bottom-2 ml-auto w-full">
              салат цезарь
            </div>
          )}
        </div>
        <div className="bg-white rounded-3xl h-32 text-center relative">
          <div className="ml-10 w-56 absolute -top-28">
            <img
              src={shuffle ? '/surprise/box.png' : '/surprise/6.png'}
              alt=""
            />
          </div>
          {!shuffle && (
            <div className="text-xl font-bold absolute bottom-2 ml-auto w-full">
              картофель по деревенски
            </div>
          )}
        </div>
        <div className="bg-white rounded-3xl h-32 text-center relative">
          <div className="ml-10 w-56 absolute -top-28">
            <img
              src={shuffle ? '/surprise/box.png' : '/surprise/7.png'}
              alt=""
            />
          </div>
          {!shuffle && (
            <div className="text-xl font-bold absolute bottom-2 ml-auto w-full">
              Соca-cola 1 литр
            </div>
          )}
        </div>
        <div className="bg-white rounded-3xl h-32 text-center relative">
          <div className="ml-10 w-56 absolute -top-28">
            <img
              src={shuffle ? '/surprise/box.png' : '/surprise/8.png'}
              alt=""
            />
          </div>
          {!shuffle && (
            <div className="text-xl font-bold absolute bottom-2 ml-auto w-full">
              пицца маргарита
            </div>
          )}
        </div>
        <div className="bg-white rounded-3xl h-32 text-center relative">
          <div className="ml-10 w-56 absolute -top-28">
            <img
              src={shuffle ? '/surprise/box.png' : '/surprise/9.png'}
              alt=""
            />
          </div>
          {!shuffle && (
            <div className="text-xl font-bold absolute bottom-2 ml-auto w-full">
              шоколадная
            </div>
          )}
        </div>
      </div>
      {!shuffle && (
        <div className="m-auto w-max mt-8">
          <button
            onClick={() => {
              startShuffle()
            }}
            className="text-white text-4xl font-bold bg-yellow border-white border-2 rounded-full px-32 pt-1 pb-3"
          >
            перемешать
          </button>
        </div>
      )}
    </div>
  )
}
