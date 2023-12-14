import React, {
  useState,
  useCallback,
  useContext,
  Fragment,
  FC,
  useEffect,
  useMemo,
} from 'react'
import SetLocation from '@components_new/header/SetLocation'
import Link from 'next/link'
import ChooseCityDropDown from './header/ChooseCityDropDown'
import { MenuIcon, XIcon } from '@heroicons/react/outline'
import HeaderMenu from '@components_new/header/HeaderMenu'
import SignInButton from './header/SignInButton'
import LanguageDropDown from './header/LanguageDropDown'
import Image from 'next/image'
import type { APILinkItem, LinkItem } from '@commerce/types/headerMenu'
import MobHeaderMenu from './header/MobHeaderMenu'
import MobChooseCityDropDown from './header/MobChooseCityDropDown'
import MobLanguageDropDown from './header/MobLanguageDropDown'
import HeaderPhone from './header/HeaderPhone'
import useTranslation from 'next-translate/useTranslation'
import getConfig from 'next/config'
import axios from 'axios'
import { useUI } from '@components/ui/context'
import parsePhoneNumber from 'libphonenumber-js'
import { faTelegram } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useRouter } from 'next/router'
const { publicRuntimeConfig } = getConfig()

const Header: FC<{
  menu: Array<APILinkItem>
}> = ({ menu = [] }) => {
  const { locale = 'ru' } = useRouter()
  const { activeCity, cities } = useUI()

  const chosenCity = useMemo(() => {
    if (activeCity) {
      return activeCity
    }
    if (cities) return cities[0]
    return null
  }, [cities, activeCity])
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobMenuOpen, setMobMenuOpen] = useState(false)
  const { t: tr } = useTranslation('common')
  const [configData, setConfigData] = useState({} as any)

  const fetchConfig = async () => {
    let configData
    if (!sessionStorage.getItem('configData')) {
      let { data } = await axios.get(
        `${publicRuntimeConfig.apiUrl}/api/configs/public`
      )
      configData = data.data
      sessionStorage.setItem('configData', data.data)
    } else {
      configData = sessionStorage.getItem('configData')
    }

    try {
      configData = Buffer.from(configData, 'base64')
      configData = configData.toString()
      configData = JSON.parse(configData)
      setConfigData(configData)
    } catch (e) {}
  }

  useEffect(() => {
    fetchConfig()
    return
  }, [])

  return (
    <>
      <header
        className="py-[15px] items-center md:flex bg-white mb-3"
        id="header"
      >
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <div className="w-32 md:w-48 ml-4 md:ml-0">
              <Link
                href={`/${chosenCity.slug}`}
                prefetch={false}
                legacyBehavior
              >
                <a className="flex">
                  <Image
                    src="/assets/main_logo.svg"
                    width="188"
                    height="68"
                    alt="main_logo"
                  />
                </a>
              </Link>
            </div>
            {menuOpen ? (
              <div className="flex items-center">
                <HeaderMenu menuItems={menu} />
                <LanguageDropDown />
                <XIcon
                  className="cursor-pointer h-5 text-secondary w-5"
                  onClick={() => setMenuOpen(false)}
                />
              </div>
            ) : (
              <>
                <div className="w-1/3 md:flex hidden">
                  <SetLocation />
                </div>
                <div className="flex items-center">
                  <div className="md:flex hidden">
                    <HeaderPhone />
                    <ChooseCityDropDown />
                    <div className="mx-2">
                      <SignInButton />
                    </div>
                  </div>
                  <div className="hidden md:flex">
                    <MenuIcon
                      className="cursor-pointer h-5 text-secondary w-5 mr-[21px] md:mr-0"
                      onClick={() => setMenuOpen(true)}
                    />
                  </div>
                  <div className="md:hidden flex">
                    <MenuIcon
                      className="cursor-pointer h-5 text-secondary w-5 mr-[21px] md:mr-0"
                      onClick={() => setMobMenuOpen(true)}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        {mobMenuOpen && (
          <div className="w-screen h-screen fixed bg-secondary z-40 top-0 overflow-y-auto p-4 pt-12">
            <div className="flex justify-between items-center border-b pb-2 border-blue">
              <div className="w-32 md:w-48 md:ml-0">
                <Link
                  href={`/${chosenCity.slug}`}
                  prefetch={false}
                  legacyBehavior
                >
                  <a className="flex">
                    <Image
                      src="/assets/footer_logo.svg"
                      width="188"
                      height="68"
                      alt="footer_logo"
                    />
                  </a>
                </Link>
              </div>
              <div>
                <XIcon
                  className="cursor-pointer h-5 w-5 text-white"
                  onClick={() => setMobMenuOpen(false)}
                />
              </div>
            </div>
            <div className="border-blue border-b py-5 md:mb-7">
              <MobChooseCityDropDown />
            </div>
            <div className="border-b border-blue py-8">
              <SignInButton setMobMenuOpen={setMobMenuOpen} />
              <MobHeaderMenu menuItems={menu} setMobMenuOpen={setMobMenuOpen} />
            </div>
            <div className="text-white pt-8">
              {chosenCity?.phone && (
                <>
                  <div className="text-xs mb-1">{tr('delivery_phone')}</div>
                  <div className="text-2xl mb-5">
                    <a href={parsePhoneNumber(chosenCity?.phone)?.getURI()}>
                      {parsePhoneNumber(chosenCity?.phone)
                        ?.formatNational()
                        .substring(2)}
                    </a>
                  </div>
                </>
              )}
              <div className="flex items-center justify-between mb-5">
                <a className="flex" href="#">
                  <Image
                    src="/assets/appstore.png"
                    width="151"
                    height="49"
                    alt="appstore"
                  />
                </a>
                <a
                  href="https://play.google.com/store/apps/details?id=havoqand.chopar"
                  className=""
                  target={'_blank'}
                >
                  <div className="">
                    <img
                      src="/googleReady.svg"
                      alt="Get it on Google Play"
                      className="w-40"
                    />
                  </div>
                </a>
              </div>
              <MobLanguageDropDown />
            </div>
          </div>
        )}
      </header>
    </>
  )
}
export default Header
