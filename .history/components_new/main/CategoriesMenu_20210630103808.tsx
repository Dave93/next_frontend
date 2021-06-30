import { FC, memo, useState } from 'react'
import { useRouter } from 'next/router'
import { LinkItem } from '@commerce/types/headerMenu'
import Image from 'next/image'
import Link from 'next/link'

const CategoriesMenu: FC<{ categories: LinkItem[] }> = ({
  categories = [],
}) => {
  const { locale = 'ru', pathname } = useRouter()
  const fixed = useState(false)
  return (
    //fixed left-0 m-auto right-0 top-0 z-30
    <div className="">
      <div className="container m-auto">
        <div className="bg-white flex h-14 items-center justify-between px-36 rounded-xl shadow-lg w-full">
          <Link href="/" prefetch={false}>
            <Image src="/assets/categories_logo.png" width="44" height="44" />
          </Link>
          {categories.map((item: LinkItem, id) => {
            const keyTyped = locale as keyof typeof item.label
            return (
              <div className="font-bold text-base text-center text-secondary uppercase w-28" key={id}>
                {item.label[keyTyped]}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default memo(CategoriesMenu)
