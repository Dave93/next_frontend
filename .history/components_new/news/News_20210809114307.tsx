import useTranslation from 'next-translate/useTranslation'
import { memo, FC } from 'react'

const NewsList: FC = () => {
  const { t: tr } = useTranslation('common')
  return (
    <>
      <h2>News</h2>
    </>
  )
}

export default memo(NewsList)