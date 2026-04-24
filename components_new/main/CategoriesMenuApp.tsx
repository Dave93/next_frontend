'use client'
import { FC, memo } from 'react'
import { useLocale } from 'next-intl'
import { Link } from 'react-scroll'

const CategoriesMenu: FC<{ categories: any[]; channelName: string }> = ({
  categories = [],
  channelName = '',
}) => {
  const locale = useLocale()

  if (!categories.length) return null

  return (
    <div
      className="hidden md:block sticky z-20 bg-secondary shadow-lg"
      style={{ top: 'var(--header-h, 0px)' }}
      id="categoriesMenuSticky"
    >
      <div className="container flex items-center m-auto overflow-x-auto md:overflow-x-visible">
        <div className="flex h-14 items-center justify-evenly w-full">
          {categories.map((item: any) => (
            <div
              className="text-white font-serif text-base text-center cursor-pointer uppercase min-w-max px-4"
              key={item.id}
            >
              {/* @ts-ignore */}
              <Link
                to={`productSection_${item.id}`}
                spy={true}
                smooth={true}
                hashSpy
                activeClass="text-yellow"
                offset={-160}
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
  )
}

export default memo(CategoriesMenu)
