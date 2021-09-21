import React, { memo, FC } from 'react'

const CreateYourPizza: FC = () => {
  return (
    <>
      <div className="gap-4 grid grid-cols-2 py-4 md:py-0 items-center justify-between md:flex md:flex-col">
        <div>
          <div className="text-center">
            {store.image ? (
              <Image
                src={store.image}
                width={250}
                height={250}
                alt={store?.attribute_data?.name[channelName][locale || 'ru']}
              />
            ) : (
              <Image
                src="/no_photo.svg"
                width={250}
                height={250}
                alt={store?.attribute_data?.name[channelName][locale || 'ru']}
                className="rounded-full"
              />
            )}
          </div>
        </div>
        <div className="flex flex-col flex-grow w-full">
          <div className="font-black mt-4 text-xl">
            {store?.attribute_data?.name[channelName][locale || 'ru']}
          </div>
          {store.sizeDesc && (
            <div className="font-bold mt-2 text-gray-700 text-xs">
              {store.sizeDesc}
            </div>
          )}
          <div
            className="mt-1 text-xs flex-grow"
            dangerouslySetInnerHTML={{
              __html: store?.attribute_data?.description
                ? store?.attribute_data?.description[channelName][
                    locale || 'ru'
                  ]
                : '',
            }}
          ></div>
          <div className="hidden md:block">
            {store.variants && store.variants.length > 0 && (
              <div className={styles.productSelectorOption}>
                {store.variants.map((v) => (
                  <div
                    className={`w-full text-center cursor-pointer rounded-2xl outline-none ${
                      v.active ? 'bg-gray-300' : ''
                    }`}
                    onClick={() => updateOptionSelection(v.id)}
                    key={v.id}
                  >
                    <button className="outline-none focus:outline-none text-xs py-2">
                      {locale == 'ru' ? v?.custom_name : v?.custom_name_uz}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="md:mt-10 mt-2 flex justify-between items-center text-sm">
            <button
              className="bg-yellow focus:outline-none font-bold outline-none px-6 py-2 rounded-full text-white uppercase md:inline-flex items-center hidden"
              onClick={handleSubmit}
              disabled={addToCartInProgress}
            >
              {addToCartInProgress && (
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
              )}
              {tr('main_to_basket')}
            </button>
            <span className="md:text-xl bg-yellow md:bg-white w-28 md:w-auto rounded-full px-2 py-2 text-sm text-center md:px-0 md:py-0 text-white md:text-black">
              <span className="md:hidden">от</span>{' '}
              {currency(totalPrice, {
                pattern: '# !',
                separator: ' ',
                decimal: '.',
                symbol: 'сум',
                precision: 0,
              }).format()}
            </span>
          </div>
        </div>
      </div>
    </>
  )
}

export default memo(CreateYourPizza)
