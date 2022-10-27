import { FC, memo } from 'react'

const AboutUser: FC = () => {
  return (
    <div className="flex">
      <div className="1">Привет Зафар</div>
      <div className="2"></div>
    </div>
  )
}

export default memo(AboutUser)
