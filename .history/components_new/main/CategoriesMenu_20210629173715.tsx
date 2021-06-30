import { FC, memo } from 'react'
import { useRouter } from 'next/router'
import { LinkItem } from '@commerce/types/headerMenu'

const CategoriesMenu: FC<{ categories: LinkItem[] }> = ({
  categories = [],
}) => {
  console.log(categories)
  const { locale = 'ru', pathname } = useRouter()
  return (
    <div className="fixed left-0 m-auto right-0 top-0 z-30">
      <div className="container m-auto">
        <div className="bg-white flex h-14 items-center justify-between px-36 rounded-xl shadow-lg w-full">
          {categories.map((item: LinkItem) => {
            const keyTyped = locale as keyof typeof item.label
            return (
              <div className="font-bold text-base text-center text-secondary uppercase w-28">
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
