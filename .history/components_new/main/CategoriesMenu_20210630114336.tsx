import { FC, memo, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { LinkItem } from '@commerce/types/headerMenu'
import Image from 'next/image'
import Link from 'next/link'

const CategoriesMenu: FC<{ categories: LinkItem[] }> = ({
  categories = [],
}) => {
  const { locale = 'ru', pathname } = useRouter()

  const [fixed, changeState] = useState(false)

  const categoriesFixing = () => {
    window.pageYOffset > 428 ? changeState(true) : changeState(false)
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', categoriesFixing)
    }
  }, [])

  console.log(categories)

  return (
    <div
      className={`${
        fixed
          ? 'fixed left-0 m-auto right-0 top-0 z-30 bg-white w-full shadow-lg'
          : ''
      } transition-all duration-500 ease-in-out`}
    >
      <div className="container flex items-center m-auto">
        {fixed && (
          <Link href="/" prefetch={false}>
            <a className="flex mr-16">
              <Image
                src="/assets/categories_logo.png"
                width="44"
                height="44"
                unoptimized={true}
              />
            </a>
          </Link>
        )}
        <div
          className={`${
            fixed
              ? ' flex h-14 items-center justify-evenly w-full'
              : 'bg-white flex h-14 items-center justify-between px-36 rounded-xl shadow-lg w-full'
          } `}
        >
          {categories.map((item: LinkItem) => {
            const keyTyped = locale as keyof typeof item.label
            return (
              <div
                className="font-bold text-base text-center text-secondary uppercase w-28"
                key={item.id}
              >
                <Link href={item.href} prefetch={false}>
                  <a>{item.label[keyTyped]}</a>
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
