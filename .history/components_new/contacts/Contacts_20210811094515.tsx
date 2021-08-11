import { FC, memo } from "react"


const Contacts: FC = () => {
    return (
      <>
        <div className="text-3xl mb-1">Контакты</div>
        <div className="border-b-2 w-24 border-yellow mb-10"></div>
      </>
    )   
}

export default memo(Contacts)