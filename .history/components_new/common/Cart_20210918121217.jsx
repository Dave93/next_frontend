import { memo } from "react"

export default function Cart() {
    return (
    <div className="mt-2">
      <div className="border border-yellow px-5 py-7 rounded-[15px] relative">
        {isCartLoading && (
          <div className="h-full w-full absolute flex items-center justify-around bg-gray-300 top-0 bg-opacity-60 left-0 rounded-[15px]">
            <svg
              className="animate-spin text-yellow h-14"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        )}
        <div className="border-b-2 border-yellow flex items-center justify-between pb-4">
          <div>
            <span className="font-bold mr-1 text-xl">{tr('basket')}</span>
            {data?.lineItems.length > 0 && (
              <span className="font-bold text-[18px] text-yellow">
                ({data.lineItems.length})
              </span>
            )}
          </div>
          <div className="flex items-center">
            <Image src="/small_cart_icon.png" width={34} height={34} />
          </div>
        </div>
        {isEmpty && (
          <div className="flex flex-col items-center mt-2 text-center text-gray-400 text-sm">
            <Image src="/cart_empty.png" width={130} height={119} />
            <div className="w-6/12">{tr('basket_empty')}</div>
          </div>
        )}
        {!isEmpty && (
          <div className="grid grid-cols-1 divide-y border-b mb-3 overflow-y-auto max-h-60">
            {data &&
              data?.lineItems.map((lineItem: any) => (
                <div key={lineItem.id} className="py-3">
                  <div className="flex mb-2">
                    {lineItem.child && lineItem.child.length ? (
                      <div className="h-11 w-11 flex relative">
                        <div className="w-5 relative overflow-hidden">
                          <div>
                            <Image
                              src={
                                lineItem?.variant?.product?.assets?.length
                                  ? `${webAddress}/storage/${lineItem?.variant?.product?.assets[0]?.location}/${lineItem?.variant?.product?.assets[0]?.filename}`
                                  : '/no_photo.svg'
                              }
                              width="40"
                              height="40"
                              layout="fixed"
                              className="absolute rounded-full"
                            />
                          </div>
                        </div>
                        <div className="w-5 relative overflow-hidden">
                          <div className="absolute right-0">
                            <Image
                              src={
                                lineItem?.child[0].variant?.product?.assets
                                  ?.length
                                  ? `${webAddress}/storage/${lineItem?.child[0].variant?.product?.assets[0]?.location}/${lineItem?.child[0].variant?.product?.assets[0]?.filename}`
                                  : '/no_photo.svg'
                              }
                              width="40"
                              height="40"
                              layout="fixed"
                              className="rounded-full"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <Image
                          src={
                            lineItem?.variant?.product?.assets?.length
                              ? `${webAddress}/storage/${lineItem?.variant?.product?.assets[0]?.location}/${lineItem?.variant?.product?.assets[0]?.filename}`
                              : '/no_photo.svg'
                          }
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      </div>
                    )}
                    <div className="font-bold text-sm flex-grow mx-1">
                      {lineItem.child && lineItem.child.length
                        ? `${
                            lineItem?.variant?.product?.attribute_data?.name[
                              channelName
                            ][locale || 'ru']
                          } + ${
                            lineItem?.child[0].variant?.product?.attribute_data
                              ?.name[channelName][locale || 'ru']
                          }`
                        : lineItem?.variant?.product?.attribute_data?.name[
                            channelName
                          ][locale || 'ru']}
                    </div>
                    <div>
                      <XIcon
                        className="cursor-pointer h-4 text-black w-4"
                        onClick={() => destroyLine(lineItem.id)}
                      />
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="ml-10">
                      <div className="w-20 h-6 ml-1 bg-yellow rounded-full flex items-center text-white">
                        <div className="w-6 h-6 items-center flex justify-around">
                          <MinusIcon
                            className="cursor-pointer w-5 h-5"
                            onClick={() => decreaseQuantity(lineItem)}
                          />
                        </div>
                        <div className="flex-grow text-center">
                          {lineItem.quantity}
                        </div>
                        <div className="w-6 h-6 items-center flex justify-around">
                          <PlusIcon
                            className="cursor-pointer w-5 h-5"
                            onClick={() => increaseQuantity(lineItem.id)}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-grow text-sm">
                      {lineItem.child && lineItem.child.length
                        ? currency(
                            (+lineItem.total + +lineItem.child[0].total) *
                              lineItem.quantity,
                            {
                              pattern: '# !',
                              separator: ' ',
                              decimal: '.',
                              symbol: 'сум',
                              precision: 0,
                            }
                          ).format()
                        : currency(lineItem.total * lineItem.quantity, {
                            pattern: '# !',
                            separator: ' ',
                            decimal: '.',
                            symbol: 'сум',
                            precision: 0,
                          }).format()}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
        {!isEmpty && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {tr('basket_order_price')}
            </div>
            <div className="text-[18px] font-bold">
              {currency(data.totalPrice, {
                pattern: '# !',
                separator: ' ',
                decimal: '.',
                symbol: 'сум',
                precision: 0,
              }).format()}
            </div>
          </div>
        )}
        {!isEmpty && (
          <div className="mt-8">
            <button
              onClick={goToCheckout}
              className="cursor-pointer outline-none focus:outline-none bg-yellow py-3 rounded-full w-full text-white font-bold"
            >
              {tr('checkout')}
            </button>
          </div>
        )}
      </div>
      <div className="border border-yellow mt-3 p-5 rounded-[15px]">
        <form onSubmit={handleSubmit(onSubmit)} className="relative">
          <input
            type="text"
            placeholder={tr('promocode')}
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

export default memo(Cart)
