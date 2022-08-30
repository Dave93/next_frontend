import React, { memo, FC } from 'react'

type TitleProps = {
  title: string
}

const ProductListSectionTitle: FC<TitleProps> = ({ title = '' }) => {
  return (
    <h2 className="border-b-4 border-yellow py-1 text-3xl w-max mb-10 ml-4 md:ml-0">
      {title}
    </h2>
  )
}

export default memo(ProductListSectionTitle)
