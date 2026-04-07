import { FC, memo, useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import { LinkItem } from '@commerce/types/headerMenu'
import Image from 'next/image'
import { Link } from 'react-scroll'

const CategoriesMenu: FC<{ categories: any[]; channelName: string }> = ({
  categories = [],
  channelName = '',
}) => {
  const { locale = 'ru', pathname } = useRouter()

  const [fixed, changeState] = useState(false)
  const [headerHeight, setHeaderHeight] = useState(48)

  const categoriesFixing = () => {
    window.pageYOffset > 450 ? changeState(true) : changeState(false)
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', categoriesFixing)
      // Measure mobile header height
      const header = document.getElementById('mobile-header')
      if (header) {
        setHeaderHeight(header.offsetHeight)
      }
    }
  }, [])

  return (
    <>
      {/* Desktop: original behavior */}
      <div
        className={`hidden md:block ${
          fixed
            ? 'fixed left-0 m-auto right-0 top-0 z-30 bg-secondary w-full shadow-lg'
            : ''
        }`}
      >
        <div className="container flex items-center m-auto overflow-x-visible">
          {fixed && (
            <>
              {/* @ts-ignore */}
              <Link to="header" spy={true} smooth={true}>
                <span className="flex mr-16 cursor-pointer">
                  <Image
                    src="/assets/categories_logo.png"
                    width="44"
                    height="44"
                    unoptimized={true}
                    alt="categories_logo"
                  />
                </span>
              </Link>
            </>
          )}
          <div
            className={`${
              fixed
                ? 'flex h-14 items-center justify-evenly w-full'
                : 'bg-white flex h-14 items-center justify-between px-36 rounded-xl shadow-lg w-full'
            }`}
          >
            {categories.map((item: any) => (
              <div
                className={`${
                  fixed ? 'text-white' : 'text-secondary'
                } font-serif text-base text-center cursor-pointer uppercase min-w-max px-4`}
                key={item.id}
              >
                {/* @ts-ignore */}
                <Link
                  to={`productSection_${item.id}`}
                  spy={true}
                  smooth={true}
                  hashSpy
                  activeClass="text-yellow"
                  offset={-100}
                >
                  <span>
                    {item?.attribute_data?.name[channelName][locale || 'ru']}
                  </span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile: sticky under header */}
      <div className="md:hidden sticky z-20 bg-white border-b border-gray-100" style={{ top: headerHeight }}>
        <div
          className="flex items-center overflow-x-auto h-11 px-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categories.map((item: any) => (
            <div
              className="text-secondary font-serif text-sm text-center cursor-pointer uppercase min-w-max px-3"
              key={item.id}
            >
              {/* @ts-ignore */}
              <Link
                to={`productSection_${item.id}`}
                spy={true}
                smooth={true}
                hashSpy
                activeClass="text-yellow"
                offset={-120}
              >
                <span>
                  {item?.attribute_data?.name[channelName][locale || 'ru']}
                </span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default memo(CategoriesMenu)
