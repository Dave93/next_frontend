import { FC, memo } from 'react'

const About: FC = () => {
  return (
    <>
      <div className="text-3xl mb-1">
        Доставка в Chopar Pizza ежедневно с 10:00 до 03:00{' '}
      </div>
      <div className="border-b-2 w-24 border-yellow mb-10"></div>
    </>
  )
}

export default memo(About)
