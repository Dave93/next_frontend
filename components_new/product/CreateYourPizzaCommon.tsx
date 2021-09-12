import React, { FC } from 'react'
import CreateYourPizza from './CreateYourPizza'
import CreateYourPizzaMobile from './CreateYourPizzaMobile'

type CreatePizzaProps = {
  sec: any
  channelName: string
}
const CreateYourPizzaCommon: FC<CreatePizzaProps> = ({ sec, channelName }) => {
  return (
    <>
      {window.innerWidth < 768 ? (
        <CreateYourPizzaMobile channelName={channelName} sec={sec} />
      ) : (
        <CreateYourPizza channelName={channelName} sec={sec} />
      )}
    </>
  )
}

export default CreateYourPizzaCommon
