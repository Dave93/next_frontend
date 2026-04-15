import { FC } from 'react'
import useTranslation from 'next-translate/useTranslation'
import { UseFormRegister } from 'react-hook-form'

interface AddressDetailsProps {
  register: UseFormRegister<any>
  isMobile?: boolean
}

const AddressDetails: FC<AddressDetailsProps> = ({ register, isMobile = false }) => {
  const { t: tr } = useTranslation('common')

  const inputClassName = 'bg-gray-100 border border-gray-200 rounded-xl text-sm outline-none focus:border-yellow px-4 py-3'

  if (isMobile) {
    return (
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          {...register('flat')}
          placeholder={tr('flat')}
          className={inputClassName}
        />
        <input
          type="text"
          {...register('entrance')}
          placeholder={tr('entrance')}
          className={inputClassName}
        />
        <input
          type="text"
          {...register('floor')}
          placeholder={tr('floor', { defaultValue: 'Этаж' })}
          className={inputClassName}
        />
        <input
          type="text"
          {...register('door_code')}
          placeholder={tr('door_code')}
          className={inputClassName}
        />
      </div>
    )
  }

  return (
    <div className="flex gap-3">
      <input
        type="text"
        {...register('flat')}
        placeholder={tr('flat')}
        className={inputClassName}
      />
      <input
        type="text"
        {...register('entrance')}
        placeholder={tr('entrance')}
        className={inputClassName}
      />
      <input
        type="text"
        {...register('floor')}
        placeholder={tr('floor', { defaultValue: 'Этаж' })}
        className={inputClassName}
      />
      <input
        type="text"
        {...register('door_code')}
        placeholder={tr('door_code')}
        className={inputClassName}
      />
    </div>
  )
}

export default AddressDetails
