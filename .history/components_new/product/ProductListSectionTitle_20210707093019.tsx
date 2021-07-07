import React, { memo, FC } from 'react'

type TitleProps = {
  title: string
}

const ProductListSectionTitle: FC<TitleProps> = ({ title = '' }) => {
  return (
    <h3 className="border-b-4 border-yellow py-1 text-3xl w-max mb-10 mx-4">
      {title}
    </h3>
  )
}

export default memo(ProductListSectionTitle)
