'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import { useLocale } from 'next-intl'
import { useRouter } from '../../i18n/navigation'
import { Ru, Uz } from 'react-flags-select'
import { useLocationStore } from '../../lib/stores/location-store'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faFacebook,
  faInstagram,
  faTelegramPlane,
} from '@fortawesome/free-brands-svg-icons'
import { Link } from '../../i18n/navigation'

const localeLabel = {
  ru: 'Ru',
  uz: 'Uz',
}

interface BonusListAppProps {
  bonusProducts?: any[]
}

export default function BonusListApp(_props: BonusListAppProps) {
  const router = useRouter()
  const locale = useLocale()
  const activeCity = useLocationStore((s) => s.activeCity)
  const cities = useLocationStore((s) => s.cities)

  const chosenCity = useMemo(() => {
    if (activeCity) {
      return activeCity
    }
    if (cities) return cities[0]
    return null
  }, [cities, activeCity])

  const changeLang = (e: React.MouseEvent, loc: string) => {
    e.preventDefault()
    router.push('/', { locale: loc })
  }

  return (
    <div
      className="w-screen bg-secondary md:px-36 px-2 py-4 h-screen fixed overflow-auto"
      style={{
        backgroundImage: `url("/Union.png")`,
        backgroundSize: 'cover',
        position: 'fixed',
      }}
    >
      <div className="flex justify-between items-center">
        <Link href={`/${chosenCity?.slug || ''}`} prefetch={false}>
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
            href="#"
            onClick={(e) => changeLang(e, 'ru')}
          >
            <Ru className="w-5" />
            <span className="ml-1.5">{localeLabel.ru}</span>
          </a>
          <a
            className={`${
              locale == 'uz' ? 'bg-white text-secondary ' : 'text-white'
            } font-medium inline-flex items-center px-4 mx-1 my-1 rounded-full w-20`}
            href="#"
            onClick={(e) => changeLang(e, 'uz')}
          >
            <Uz className="w-5" />
            <span className="ml-1.5">{localeLabel.uz}</span>
          </a>
        </div>
      </div>
      <div className="xl:flex">
        <div>
          <div className="md:mt-20 text-5xl uppercase">
            <span className="text-yellow">CHOPAR</span>{' '}
            {locale == 'ru' ? 'дарит' : 'sovg\'a'}
          </div>
          <div className="md:text-8xl text-2xl font-black text-white mt-2 uppercase">
            {locale == 'ru' ? 'подарки' : 'beradi'}
          </div>
          <div className="text-white md:w-[400px] mt-10">
            <div>{'Получите подарок от Chopar Pizza!'}</div>
          </div>
          <button
            onClick={() => {
              router.push(`/${chosenCity?.slug}/_bonus/start`)
            }}
            className="h-32 md:w-[500px] w-full hidden md:block"
            style={{
              backgroundImage: `url("/surpriseButton.png")`,
              backgroundRepeat: 'no-repeat',
            }}
          >
            <div className="text-white md:text-3xl font-bold uppercase">
              {'Получить подарок'}
            </div>
          </button>
        </div>

        <div className="ml-auto">
          <Image
            src="/surpriseMainLogo.png"
            alt="Бонусы Chopar Pizza"
            width={550}
            height={350}
          />
        </div>
        <button
          onClick={() => {
            router.push(`/${chosenCity?.slug}/_bonus/start`)
          }}
          className="flex h-32 items-center justify-around md:hidden md:w-[500px] w-full"
          style={{
            backgroundImage: `url("/surpriseButton.png")`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
          }}
        >
          <div className="font-bold md:text-3xl pb-10 text-2xl text-white uppercase">
            {'Получить подарок'}
          </div>
        </button>
      </div>

      <div className="text-white text-center md:text-left">
        {'Следите за нами'}
      </div>

      <div className="text-white flex space-x-2 w-max items-center m-auto md:mx-0">
        <a
          target="_blank"
          href="https://www.instagram.com/choparpizza"
          className="border border-white rounded-full p-2"
        >
          <FontAwesomeIcon icon={faInstagram} className="w-5 h-5" />
        </a>
        <a
          target="_blank"
          href="https://www.facebook.com/choparpizza"
          className="border border-white rounded-full p-2"
        >
          <FontAwesomeIcon icon={faFacebook} className="w-5 h-5" />
        </a>
        <a
          target="_blank"
          href="https://telegram.me/Chopar_bot"
          className="border border-white rounded-full p-2"
        >
          <FontAwesomeIcon icon={faTelegramPlane} className="w-5 h-5" />
        </a>
      </div>
    </div>
  )
}
