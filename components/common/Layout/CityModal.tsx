import { City } from '@commerce/types/cities'
import { useUI } from '@components/ui/context'
import { Dialog, Menu, Transition } from '@headlessui/react'
import Cookies from 'js-cookie'
import useTranslation from 'next-translate/useTranslation'
import router, { useRouter } from 'next/router'
import React, { FC, Fragment, useEffect, useRef, useState } from 'react'

type Props = {
  cities: City[]
}

const CityModal: FC<Props> = ({ cities }) => {
  const { t: tr } = useTranslation('common')
  const { locale } = useRouter()
  let cityListTitleRef = useRef(null)
  const [isShowCityList, setIsShowCityList] = useState(false)
  const [isShowCityPrompt, setIsShowCityPrompt] = useState(false)
  const { activeCity, setActiveCity, setCitiesData } = useUI()

  let cityListRef = useRef(null)
  let cityPromptRef = useRef(null)

  function closeModal() {
    setIsShowCityList(false)
  }
  function closePromptModal() {
    setIsShowCityPrompt(false)
  }

  function openModal() {
    setIsShowCityList(true)
  }

  function chooseAnotherCity() {
    closePromptModal()
    openModal()
  }

  const changeCity = (city: City) => {
    setActiveCity(city)
    router.push(`/${city.slug}`)
    closeModal()
  }

  useEffect(() => {
    if (!Cookies.get('city_slug')) {
      setIsShowCityList(true)
    } else {
      // setIsShowCityPrompt(true)
    }
    return () => {}
  }, [])

  return (
    <div>
      <Transition appear show={isShowCityList} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={() => {}}
          initialFocus={cityListRef}
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-secondary shadow-xl rounded-2xl">
                <Dialog.Title
                  as="h3"
                  className="text-2xl font-medium leading-6 text-white"
                >
                  {tr('choose_your_city')}
                </Dialog.Title>
                <div
                  className="m-auto md:w-96 bg-white rounded-2xl mt-4"
                  ref={cityListRef}
                >
                  <Menu as="div" className="text-center">
                    <>
                      <Transition
                        show={true}
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items static>
                          {cities?.map((item: City) => (
                            <Menu.Item key={item.id}>
                              <span
                                onClick={() => changeCity(item)}
                                className={`block px-4 py-2 cursor-pointer text-xl text-secondary hover:text-white hover:bg-secondary`}
                              >
                                {locale == 'uz' ? item.name_uz : ''}
                                {locale == 'ru' ? item.name : ''}
                                {locale == 'en' ? item.name_en : ''}
                              </span>
                            </Menu.Item>
                          ))}
                        </Menu.Items>
                      </Transition>
                    </>
                  </Menu>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
      <Transition appear show={isShowCityPrompt} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={() => {}}
          initialFocus={cityPromptRef}
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-secondary shadow-xl rounded-2xl">
                <Dialog.Title
                  as="h3"
                  className="text-2xl font-medium leading-6 text-white"
                >
                  {tr('isThisYourCity', {
                    city: locale == 'uz' ? activeCity.name_uz : activeCity.name,
                  })}
                </Dialog.Title>
                <div className="m-auto mt-4">
                  <div className="gap-3 grid grid-cols-2 w-full">
                    <button
                      className="bg-yellow focus:outline-none font-bold outline-none py-2 rounded-full text-center text-white uppercase"
                      onClick={closePromptModal}
                      ref={cityPromptRef}
                    >
                      {tr('yes')}
                    </button>
                    <button
                      className="bg-gray-200 focus:outline-none font-bold outline-none py-2 rounded-full text-center text-white uppercase"
                      onClick={chooseAnotherCity}
                    >
                      {tr('no')}
                    </button>
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </div>
  )
}

export default CityModal
