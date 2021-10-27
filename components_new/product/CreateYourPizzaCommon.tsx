import React, { FC } from 'react'
import CreateYourPizza from './CreateYourPizza'
import CreateYourPizzaMobile from './CreateYourPizzaMobile'

type CreatePizzaProps = {
  sec: any
  channelName: string
  isSmall?: boolean
}
const CreateYourPizzaCommon: FC<CreatePizzaProps> = ({
  sec,
  channelName,
  isSmall,
}) => {
  return (
    <>
      {window.innerWidth < 768 ? (
        <CreateYourPizzaMobile channelName={channelName} sec={sec} />
      ) : (
        <CreateYourPizza
          channelName={channelName}
          sec={sec}
          isSmall={isSmall}
        />
      )}
    </>
  )
}

export default CreateYourPizzaCommon
