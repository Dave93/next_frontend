import Image from 'next/image'
import { Link } from '../i18n/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faFacebook,
  faInstagram,
  faTelegram,
  IconDefinition,
} from '@fortawesome/free-brands-svg-icons'
import type { APILinkItem } from '@commerce/types/headerMenu'
import type { SocialIcons } from '@commerce/types/socialIcons'
import type { City } from '@commerce/types/cities'
import type { PublicConfig } from '../lib/data/configs'

const socIcons: Record<string, IconDefinition> = {
  fb: faFacebook,
  inst: faInstagram,
  tg: faTelegram,
}

type Props = {
  categories: any[]
  footerInfoMenu: APILinkItem[]
  socials: SocialIcons[]
  currentCity?: City
  config: PublicConfig
  locale: string
}

export default function FooterApp({
  categories = [],
  footerInfoMenu = [],
  socials = [],
  currentCity,
  config,
  locale,
}: Props) {
  const workTime =
    locale === 'uz'
      ? config.workTimeUz
      : locale === 'en'
        ? config.workTimeEn
        : config.workTimeRu

  const citySlug = currentCity?.slug || ''

  return (
    <footer className="text-white hidden md:flex flex-col">
      <div className="hidden md:block w-full">
        <img
          src="/assets/uzor.svg"
          alt="footer_bg"
          className="w-full h-auto"
        />
      </div>
      <div className="bg-secondary w-full pt-5 pb-2 px-4 md:px-0">
        <div className="container mx-auto md:my-6">
          <div className="md:border-b md:flex justify-between mb-1 md:pb-10">
            <div className="md:w-1/5">
              <div className="hidden md:flex">
                <Image
                  src="/assets/footer_logo.svg"
                  width={188}
                  height={68}
                  alt="footer_logo"
                />
              </div>
              <h3 className="md:block mt-7 text-xl hidden">
                Вкус, который объединяет!
              </h3>
              <div className="md:absolute">
                <a
                  href="https://play.google.com/store/apps/details?id=havoqand.chopar"
                  className="flex"
                  target="_blank"
                  rel="noreferrer"
                >
                  <div className="items-center mt-2">
                    <img
                      src="/googleReady.svg"
                      alt="Get it on Google Play"
                      className="w-48"
                    />
                  </div>
                </a>
                <a
                  href="https://apps.apple.com/uz/app/chopar-pizza/id1597897308"
                  target="_blank"
                  rel="noreferrer"
                >
                  <div className="items-center mt-1">
                    <img
                      src="/appleReady.svg"
                      alt="Available on the App Store"
                      className="w-48"
                    />
                  </div>
                </a>
                <a href="https://telegram.me/Chopar_bot">
                  <div className="bg-black rounded-md w-48 mt-1 h-14 flex items-center justify-evenly">
                    <FontAwesomeIcon icon={faTelegram} className="w-9" />
                    <div className="text-3xl">Telegram</div>
                  </div>
                </a>
              </div>
            </div>
            <div className="flex-grow border-b border-blue md:border-0 mt-5 md:mt-0 pb-5 md:pb-0">
              <div className="md:flex justify-center">
                <div className="mr-24 hidden md:block">
                  <span className="block font-bold mb-3 text-[16px]">Меню</span>
                  <ul className="ml-3">
                    {categories.map((item: any) => (
                      <li
                        key={item.id}
                        className="leading-[1.85rem] cursor-pointer hover:text-yellow"
                      >
                        <Link
                          href={`/${citySlug}/#productSection_${item.id}`}
                          prefetch={false}
                        >
                          {item?.attribute_data?.name?.['chopar']?.[locale] ||
                            item?.attribute_data?.name?.['chopar']?.['ru']}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  {footerInfoMenu && footerInfoMenu.length > 0 && (
                    <>
                      <span className="block font-bold mb-3 text-[16px]">
                        Информация
                      </span>
                      <ul className="ml-3">
                        {footerInfoMenu.map((item: any) => {
                          const keyTyped =
                            `name_${locale}` as keyof typeof item
                          let href: string = item.href
                          if (href.indexOf('http') < 0) {
                            href = `/${citySlug}${item.href}`
                          }
                          return (
                            <li
                              key={item.href}
                              className="leading-[1.85rem] cursor-pointer hover:text-yellow"
                            >
                              <Link href={href} prefetch={false}>
                                {item[keyTyped] || item.name_ru}
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="md:text-right text-sm leading-7 mt-5 md:mt-0">
              <div className="border-b border-blue md:border-0 pb-5 md:pb-0">
                График работы <br />
                {workTime}
              </div>
              <div className="mt-4 border-b border-blue md:border-0 pb-5 md:pb-0">
                <span>Подписывайтесь на нас:</span>
                <ul className="flex md:justify-end text-4xl">
                  {socials.map((soc) => (
                    <li key={soc.code} className="mx-1">
                      <a
                        target="_blank"
                        className="no-underline text-white"
                        href={soc.link}
                        rel="noreferrer"
                      >
                        {socIcons[soc.code] && (
                          <FontAwesomeIcon
                            icon={socIcons[soc.code]}
                            className="w-10 h-10"
                          />
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="mb-7 md:mb-0">
            {new Date().getFullYear()} Все права защищены
          </div>
        </div>
      </div>
    </footer>
  )
}
