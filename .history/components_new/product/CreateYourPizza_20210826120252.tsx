import React, { memo, FC } from 'react'

const CreateYourPizza: FC = () => {
    return (
      <>
        <div className="col-span-3 space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 md:gap-10 divide-y md:divide-y-0 px-4 md:px-0"></div>
        </div>
      </>
    )
}

export default memo(CreateYourPizza )