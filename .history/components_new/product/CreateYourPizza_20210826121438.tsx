import React, { memo, FC } from 'react'
import Image from 'next/image'

const CreateYourPizza: FC = () => {
  return (
    <>
      <div className="gap-4 grid grid-cols-2 py-4 md:py-0 items-center justify-between md:flex md:flex-col">
        <div>
          <div>Создай свою пиццу</div>
          <Image src="/createYourPizza.png" width="250" height="250" />
          <button
            className="bg-yellow focus:outline-none font-bold outline-none px-6 py-2 rounded-full text-center text-white uppercase"
            onClick={}
          >
            Создать пиццу
          </button>
        </div>
      </div>
    </>
  )
}

export default memo(CreateYourPizza)
