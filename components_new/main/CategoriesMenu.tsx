import { FC, memo, useEffect, useState } from 'react'
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

  const categoriesFixing = () => {
    window.pageYOffset > 600 ? changeState(true) : changeState(false)
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', categoriesFixing)
    }
  }, [])

  return (
    <div
      className={`${
        fixed
          ? 'fixed left-0 m-auto right-0 top-0 z-30 bg-secondary w-full shadow-lg'
          : ''
      }`}
    >
      <div className="container flex items-center m-auto overflow-x-scroll sm:overflow-x-hidden md:overflow-x-visible">
        {fixed && (
          <Link to="header" spy={true} smooth={true}>
            <span className="md:flex mr-16 cursor-pointer hidden">
              <Image
                src="/assets/categories_logo.png"
                width="44"
                height="44"
                unoptimized={true}
              />
            </span>
          </Link>
        )}
        <div
          className={`${
            fixed
              ? ' flex h-14 items-center justify-evenly md:w-full'
              : 'bg-white flex h-14 items-center justify-between md:px-36 md:rounded-xl shadow-lg md:w-full'
          } `}
        >
          {categories.map((item: any) => {
            return (
              <div
                className={`${
                  fixed ? 'text-white' : 'text-secondary'
                } font-bold text-base text-center  cursor-pointer uppercase min-w-max px-4`}
                key={item.id}
              >
                <Link
                  to={`productSection_${item.id}`}
                  spy={true}
                  smooth={true}
                  activeClass="text-yellow"
                  offset={-100}
                >
                  <span>
                    {item?.attribute_data?.name[channelName][locale || 'ru']}
                  </span>
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default memo(CategoriesMenu)
