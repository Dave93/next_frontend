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

const Header: FC<{
  menu: Array<APILinkItem>
}> = ({ menu = [] }) => {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <header className="py-[15px] items-center flex bg-white mb-3" id="header">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <div className="w-32 md:w-48 h-9 md:h-16">
              <Link href="/" prefetch={false}>
                <a>
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
                <SetLocation />
                <div className="flex items-center">
                  <div>
                    <ChooseCityDropDown />
                  </div>
                  <div>
                    <MenuIcon
                      className="cursor-pointer h-5 text-secondary w-5"
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
