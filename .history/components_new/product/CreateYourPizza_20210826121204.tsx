import React, { memo, FC } from 'react'
import Image from 'next/image'

const CreateYourPizza: FC = () => {
  return (
    <>
      <div className="gap-4 grid grid-cols-2 py-4 md:py-0 items-center justify-between md:flex md:flex-col">
        <div>
          <div>Создай свою пиццу</div>
          <Image src="/createYourPizza.png" width="250" height="250" />
        </div>
      </div>
    </>
  )
}

export default memo(CreateYourPizza)