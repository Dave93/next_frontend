import { FC } from 'react'

const PersonalData: FC = () => {
    return (
      <>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mt-10">
            <label className="text-sm text-gray-400 mb-2 block">Ваше имя</label>
            <div className="relative">
              <input
                type="text"
                {...register('name')}
                className="border border-yellow focus:outline-none outline-none px-6 py-3 rounded-full text-sm w-full"
              />
              {authName && (
                <button
                  className="absolute focus:outline-none inset-y-0 outline-none right-4 text-gray-400"
                  onClick={() => {
                    reset('name')
                  }}
                >
                  <XIcon className="cursor-pointer h-5 text-gray-400 w-5" />
                </button>
              )}
            </div>
          </div>
          <div className="mt-10">
            <label className="text-sm text-gray-400 mb-2 block">
              Номер телефона
            </label>
            <div className="relative">
              <input
                type="text"
                {...register('phone', {
                  required: true,
                  pattern: /^\+998\d\d\d\d\d\d\d\d\d$/i,
                })}
                className="border border-yellow focus:outline-none outline-none px-6 py-3 rounded-full text-sm w-full"
              />
              {authPhone && (
                <button
                  className="absolute focus:outline-none inset-y-0 outline-none right-4 text-gray-400"
                  onClick={() => {
                    reset('phone')
                  }}
                >
                  <XIcon className="cursor-pointer h-5 text-gray-400 w-5" />
                </button>
              )}
            </div>
          </div>
          <div className="mt-10">
            <button
              className={`py-3 px-20 text-white font-bold text-xl rounded-full ${
                formState.isValid ? 'bg-yellow' : 'bg-gray-400'
              }`}
              disabled={!formState.isValid}
              ref={authButtonRef}
            >
              Получить код
            </button>
          </div>
        </form>
      </>
    )
}

export default PersonalData
