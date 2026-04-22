'use client'

import { FC } from 'react'
import CreateYourPizzaApp from './CreateYourPizzaApp'
import CreateYourPizzaMobileApp from './CreateYourPizzaMobileApp'

type CreatePizzaProps = {
  sec: any
  channelName: string
  isSmall?: boolean
}

const CreateYourPizzaCommonApp: FC<CreatePizzaProps> = ({
  sec,
  channelName,
  isSmall,
}) => {
  return (
    <>
      {window.innerWidth < 768 ? (
        <CreateYourPizzaMobileApp channelName={channelName} sec={sec} />
      ) : (
        <CreateYourPizzaApp
          channelName={channelName}
          sec={sec}
          isSmall={isSmall}
        />
      )}
    </>
  )
}

export default CreateYourPizzaCommonApp
