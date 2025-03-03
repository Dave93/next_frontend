import type { GetServerSidePropsContext } from 'next'
import commerce from '@lib/api/commerce'
import React, { Fragment, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { Ru, Uz } from 'react-flags-select'
import { useUI } from '@components/ui/context'
import Link from '@components/ui/Link'
import { motion } from 'framer-motion'
import { shuffle as lodashShuffle } from 'lodash'
import { Dialog, Transition } from '@headlessui/react'
import getConfig from 'next/config'
import axios from 'axios'
import cookies from 'next-cookies'
import useTranslation from 'next-translate/useTranslation'
import defaultChannel from '@lib/defaultChannel'
import Cookies from 'js-cookie'

const { publicRuntimeConfig } = getConfig()
let webAddress = publicRuntimeConfig.apiUrl
axios.defaults.withCredentials = true

export async function getServerSideProps({
  preview,
  locale,
  locales,
  query,
  ...context
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

  const c = cookies(context)
  let otpToken: any = c['opt_token']
  c['user_token'] = otpToken
  axios.defaults.headers.get.Cookie = c
  axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
  let isBonusListSuccess = false
  let errorMessage = ''
  let bonusList: any[] = []
  try {
    const { data } = await axios.get(`${webAddress}/api/bonus_prods`, {
      headers: {
        Authorization: `Bearer ${otpToken}`,
      },
    })

    isBonusListSuccess = data.success
    if (!data.success) {
      errorMessage = data.message
    } else {
      bonusList = data.data
    }
  } catch (e) {}

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
      isBonusListSuccess,
      bonusList,
      errorMessage,
    },
  }
}

const localeLabel = {
  ru: 'Ru',
  uz: 'Uz',
}

export default function Dev({
  isBonusListSuccess,
  errorMessage,
  bonusList,
}: {
  isBonusListSuccess: boolean
  errorMessage: string
  bonusList: any[]
}) {
  const router = useRouter()
  const { t: tr } = useTranslation('common')
  const [channelName, setChannelName] = useState('chopar')
  const { locale, pathname } = router
  const { activeCity, cities } = useUI()
  const [shuffle, setShuffle] = useState(false)
  const [chosenCard, setChosenCard] = useState(null as any)
  const [isOpenCard, setIsOpenCard] = useState(false)
  const [isLookingForBonus, setIsLookingForBonus] = useState(false)

  const getChannel = async () => {
    const channelData = await defaultChannel()
    setChannelName(channelData.name)
  }
  const [shuffleItems, setShuffleItems] = useState(bonusList)

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

  const openCard = async (sh: any) => {
    if (isLookingForBonus) {
      return
    }

    setIsLookingForBonus(true)
    const otpToken = Cookies.get('opt_token')

    let basketId = localStorage.getItem('basketId')
    const { data } = await axios.get(
      `${webAddress}/api/bonus_prods/show${
        basketId ? '?basketId=' + basketId : ''
      }`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${otpToken}`,
        },
        withCredentials: true,
      }
    )
    setChosenCard(data.data.prodData)
    setIsOpenCard(true)
    let basketData = data.data.basketResponse
    localStorage.setItem('basketId', basketData.encoded_id)
  }

  const closeCard = () => {
    router.push('/')
  }

  const goHome = () => {
    router.push(`/${activeCity.slug}`)
  }

  const startShuffle = () => {
    setShuffle(true)
    setTimeout(() => {
      let items = lodashShuffle([...shuffleItems])
      items = lodashShuffle(items)
      // items = lodashShuffle(items)
      items = lodashShuffle(items)

      setShuffleItems(items)

      // setTimeout(() => {
      //   items = lodashShuffle([...items])
      //   items = lodashShuffle(items)
      //   // items = lodashShuffle(items)
      //   items = lodashShuffle(items)

      //   setShuffleItems(items)
      // }, 200)
      for (let i = 0; i < items.length; i++) {
        setTimeout(() => {
          items = lodashShuffle([...items])
          setShuffleItems(items)
        }, i * 100)
      }
      setTimeout(() => {
        openCard(items[0])
      }, items.length * 100)
    }, 600)
  }

  useEffect(() => {
    getChannel()
    return () => {}
  }, [])

  return (
    <div
      className="h-full w-screen bg-secondary md:px-36 px-2 py-4 fixed overflow-y-auto"
      style={{
        backgroundImage: `url("/Union.png")`,
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="flex justify-between items-center">
        <Link href={`/${chosenCity.slug}`} prefetch={false} legacyBehavior>
          <Image
            src="/assets/footer_logo.svg"
            width={200}
            height={72}
            alt="footer_logo"
          />
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

      {isBonusListSuccess && (
        <>
          {!shuffle && (
            <div className="font-bold mt-5 text-4xl text-center text-white uppercase">
              {tr('stir_to')}{' '}
              <span className="text-yellow">{tr('get_a_gift')}</span>
            </div>
          )}

          {!isOpenCard && (
            <div className="grid md:grid-cols-3 lg:grid-cols-4 grid-cols-2 gap-8 gap-y-28 relative mt-32">
              {shuffleItems.map((sh, i) => (
                <motion.div
                  className="bg-white rounded-3xl h-32 text-center relative"
                  key={sh.id}
                  layout
                  transition={{ type: 'spring', stiffness: 2000, damping: 50 }}
                >
                  <div className="lg:ml-10 md:-top-24 absolute lg:-top-28 lg:w-56 md:w-auto -top-24">
                    <img
                      src={shuffle ? '/surprise/box.png' : sh.image}
                      alt=""
                    />
                  </div>
                  {!shuffle && (
                    <div className="text-xl font-bold absolute bottom-2 ml-auto w-full capitalize">
                      {sh.attribute_data?.name[channelName][locale || 'ru']}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
          {!shuffle && (
            <div
              className="m-auto w-max mt-8 md:text-4xl text-2xl px-3 font-bold bg-yellow border-white border-2 rounded-full md:px-32 py-1  text-white cursor-pointer mb-10 md:mb-0"
              onClick={() => {
                startShuffle()
              }}
            >
              {tr('mix')}
            </div>
          )}
          <Transition appear show={isOpenCard} as={Fragment}>
            <Dialog
              as="div"
              className="fixed inset-0 z-10 overflow-y-auto"
              onClose={() => {}}
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
                  <Dialog.Overlay className="fixed inset-0" />
                </Transition.Child>

                {/* This element is to trick the browser into centering the modal contents. */}
                <span
                  className="inline-block h-screen align-middle"
                  aria-hidden="true"
                >
                  &#8203;
                </span>
                <div className="align-middle bg-white inline-block overflow-hidden px-20 py-10 rounded-2xl shadow-xl text-center transform transition-all">
                  <Dialog.Title
                    as="h3"
                    className="leading-6 text-4xl text-secondary md:w-72 uppercase"
                  >
                    {
                      chosenCard?.attribute_data?.name[channelName][
                        locale || 'ru'
                      ]
                    }
                  </Dialog.Title>
                  <img className="m-auto w-48" src={chosenCard?.image} alt="" />
                  <div className="md:w-72 m-auto">
                    <span className="text-yellow">
                      {tr('congratulations')}!
                    </span>{' '}
                    <span className="font-bold">{tr('your_winnings')}</span>{' '}
                    {tr('automatic_added')}
                  </div>
                  <button
                    onClick={() => closeCard()}
                    className="bg-secondary rounded-full px-12 py-3 text-xl text-white mt-3"
                  >
                    {tr('go_to_home')}
                  </button>
                </div>
              </div>
            </Dialog>
          </Transition>
        </>
      )}
      {!isBonusListSuccess && (
        <>
          <div className="font-bold mt-5 text-4xl text-center text-white uppercase">
            {tr(errorMessage)}
          </div>
          <div className="m-auto w-max mt-8">
            <button
              className="text-white md:text-4xl text-2xl px-3 font-bold bg-yellow border-white border-2 rounded-full md:px-32 pt-1 pb-3"
              onClick={goHome}
            >
              {tr('go_to_home')}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
