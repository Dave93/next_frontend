import { FC, memo } from 'react'

const Contacts: FC = () => {
  return (
    <>
      <div>
        <div className="text-3xl mb-1">Контакты</div>
        <div className="border-b-2 w-24 border-yellow mb-10"></div>
      </div>
      <div className="grid grid-cols-3 gap-24">
        <div>
          ООО « Havoqand People » Юридический адрес: г. Ташкент, Чиланзарский
          район, ул. Катартал, д. 28 Режим работы: 10:00 - 22:00, без перерыва и
          выходных Телефон: 71-200-42-42
        </div>

        <div>
          ООО « Havoqand People » Юридический адрес: г. Ташкент, Чиланзарский
          район, ул. Катартал, д. 28 Режим работы: 10:00 - 22:00, без перерыва и
          выходных Телефон: 71-200-42-42
        </div>
      </div>
    </>
  )
}

export default memo(Contacts)
