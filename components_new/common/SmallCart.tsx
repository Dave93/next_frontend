import { FC, memo } from 'react'
import useCart from '@framework/cart/use-cart'
import { useForm } from 'react-hook-form'
import Image from 'next/image'

const SmallCart: FC = () => {
  const { data, isLoading, isEmpty } = useCart()
  console.log(isEmpty)
  const { register, handleSubmit } = useForm()
  const onSubmit = (data: Object) => console.log(JSON.stringify(data))
  return (
    <div className="mt-2">
      <div className="border border-yellow px-5 py-7 rounded-[15px]">
        <div className="border-b-2 border-yellow flex items-center justify-between pb-4">
          <div>
            <span className="font-bold mr-1 text-xl">Корзина</span>
            {/* {items.length > 0 && (
              <span className="font-bold text-[18px] text-yellow">
                ({items.length})
              </span>
            )} */}
          </div>
          <div>
            <Image src="/small_cart_icon.png" width={34} height={34} />
          </div>
        </div>
        {isEmpty && (
          <div className="flex flex-col items-center mt-2 text-center text-gray-400 text-sm">
            <Image src="/cart_empty.png" width={120} height={120} />
            <div>
              Корзина пуста <br />
              Выберите пиццу
            </div>
          </div>
        )}
      </div>
      <div className="border border-yellow mt-3 p-5 rounded-[15px]">
        <form onSubmit={handleSubmit(onSubmit)} className="relative">
          <input
            type="text"
            placeholder="Промокод"
            {...register('discount_code')}
            className="bg-gray-100 focus:outline-none outline-none px-5 py-2 rounded-full text-xs w-full"
          />
          <button className="absolute focus:outline-none outline-none right-1 top-0.5">
            <Image src="/discount_arrow.png" width={28} height={28} />
          </button>
        </form>
      </div>
    </div>
  )
}

export default memo(SmallCart)
