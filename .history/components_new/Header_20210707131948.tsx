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
          <div className="w-screen h-screen fixed bg-secondary z-40 top-0 overflow-y-hidden">
            <div className="flex justify-between items-center mt-10 border-b pb-2 mx-4 border-blue-700">
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
            <div className="">
              <MobChooseCityDropDown />
            </div>
            <MobHeaderMenu menuItems={menu} />
            <SignInButton />
            <LanguageDropDown />
          </div>
        )}
      </header>
    </>
  )
}
export default Header
