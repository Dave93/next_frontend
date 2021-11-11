import { City } from '@commerce/types/cities'
import { useUI } from '@components/ui/context'
import { Dialog, Menu, Transition } from '@headlessui/react'
import axios from 'axios'
import Cookies from 'js-cookie'
import useTranslation from 'next-translate/useTranslation'
import router, { useRouter } from 'next/router'
import React, { FC, Fragment, useEffect, useRef, useState } from 'react'
import getConfig from 'next/config'
import { XIcon } from '@heroicons/react/outline'

const { publicRuntimeConfig } = getConfig()
let webAddress = publicRuntimeConfig.apiUrl
axios.defaults.withCredentials = true

const BonusModal: FC = () => {
  const { t: tr } = useTranslation('common')
  const { locale } = useRouter()
  const [isShowModal, setIsShowModal] = useState(false)

  const { user, openSignInModal, activeCity } = useUI()

  let cityListRef = useRef(null)

  function closeModal() {
    setIsShowModal(false)
  }

  function openModal() {
    setIsShowModal(true)
  }

  const lookupForBonus = async () => {
    try {
      // get opt_token from cookie
      const opt_token = Cookies.get('opt_token')
      // create axios get request for bonus existense
      let options = {}
      if (opt_token) {
        options = {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${opt_token}`,
          },
          withCredentials: true,
        }
      }
      const { data } = await axios.get(
        `${webAddress}/api/bonus_prods/check`,
        options
      )
      if (!data.success) {
        openModal()
      }
    } catch (error) {
      console.log(error)
    }
  }

  const gotToBonus = () => {
    if (!user) {
      closeModal()
      router.push(
        `/${activeCity.slug}?backUrl=/${activeCity.slug}/bonus/`,
        undefined,
        {
          shallow: true,
        }
      )
      openSignInModal()
    } else {
      router.push(`/${activeCity.slug}/bonus/`)
    }
  }

  useEffect(() => {
    lookupForBonus()
    return () => {}
  }, [])

  return (
    <div>
      <Transition appear show={isShowModal} as={Fragment}>
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
            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="align-middle inline-block">
                <div className="md:inline-flex my-8 items-start">
                  <div className="inline-block p-6 overflow-hidden text-left align-middle transition-all transform bg-secondary shadow-xl rounded-2xl">
                    <div className="md:flex items-center">
                      <div>
                        <div className="text-4xl">
                          <span className="text-yellow">CHOPAR</span> ДАРИТ
                        </div>
                        <div className="md:text-6xl text-2xl font-black text-white mt-2">
                          ПОДАРКИ
                        </div>
                        <button
                          ref={cityListRef}
                          onClick={gotToBonus}
                          className="flex h-28 items-center justify-around w-80 outline-none"
                          style={{
                            backgroundImage: `url("/surpriseButton.png")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: 'contain',
                          }}
                        >
                          <div className="text-white font-bold text-xl pb-5">
                            ПОЛУЧИТЬ ПОДАРОК
                          </div>
                        </button>
                      </div>

                      <div className="ml-auto">
                        <img src="/surpriseMainLogo.png" alt="" width="350" />
                      </div>
                    </div>
                  </div>

                  <button
                    className="text-white outline-none focus:outline-none transform hidden md:block"
                    onClick={closeModal}
                  >
                    <XIcon className="text-white cursor-pointer w-10 h-10" />
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </div>
  )
}

export default BonusModal
