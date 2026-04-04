import React, { useState, FC, useEffect, useMemo } from 'react'
import SetLocation from '@components_new/header/SetLocation'
import Link from 'next/link'
import ChooseCityDropDown from './header/ChooseCityDropDown'
import { MenuIcon, XIcon } from '@heroicons/react/outline'
import HeaderMenu from '@components_new/header/HeaderMenu'
import SignInButton from './header/SignInButton'
import LanguageDropDown from './header/LanguageDropDown'
import Image from 'next/image'
import type { APILinkItem } from '@commerce/types/headerMenu'
import HeaderPhone from './header/HeaderPhone'
import axios from 'axios'
import { useUI } from '@components/ui/context'
import { useRouter } from 'next/router'

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
  const [configData, setConfigData] = useState({} as any)

  const fetchConfig = async () => {
    let configData
    if (!sessionStorage.getItem('configData')) {
      let { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/configs/public`
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
                href={`/${chosenCity?.slug || ''}`}
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
                </div>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  )
}
export default Header
