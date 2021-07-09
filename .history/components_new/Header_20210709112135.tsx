import React, { useState, useCallback, useContext, Fragment, FC } from 'react'
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

const Header: FC<{
  menu: Array<APILinkItem>
}> = ({ menu = [] }) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobMenuOpen, setMobMenuOpen] = useState(false)

  return (
    <>
      <header
        className="py-[15px] items-center md:flex bg-white mb-3"
        id="header"
      >
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <div className="w-32 md:w-48 ml-4 md:ml-0">
              <Link href="/" prefetch={false}>
                <a className="flex">
                  <Image src="/assets/main_logo.png" width="188" height="68" />
                </a>
              </Link>
            </div>
            {menuOpen ? (
              <div className="flex items-center justify-between w-6/12">
                <HeaderMenu menuItems={menu} />
                <SignInButton />
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
                    <ChooseCityDropDown />
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
          <div className="w-screen h-screen fixed bg-secondary z-40 top-0 overflow-y-hidden p-4">
            <div className="flex justify-between items-center mt-10 border-b pb-2 border-blue-500">
              <div className="w-32 md:w-48 md:ml-0">
                <Link href="/" prefetch={false}>
                  <a className="flex">
                    <Image
                      src="/assets/footer_logo.png"
                      width="188"
                      height="68"
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
            <div className="border-blue border-b py-5 mb-7">
              <MobChooseCityDropDown />
            </div>
            <div className="border-b border-blue py-8">
              <SignInButton />
              <MobHeaderMenu menuItems={menu} />
            </div>
            <div className="ml-9 text-white pt-8">
              <div className="text-xs mb-1">Телефон доставки</div>
              <div className="text-2xl mb-5">71 205 11 11</div>
              <a className="flex mb-5" href="#">
                <Image src="/assets/appstore.png" width="151" height="49" />
              </a>
              <MobLanguageDropDown />
            </div>
          </div>
        )}
      </header>
    </>
  )
}
export default Header
