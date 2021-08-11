import { FC, memo } from 'react'

const Contacts: FC = () => {
  return (
    <>
      <div>
        <div className="text-3xl mb-1">Контакты</div>
        <div className="border-b-2 w-24 border-yellow mb-10"></div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>1</div>

        <div>9</div>
      </div>
    </>
  )
}

export default memo(Contacts)
