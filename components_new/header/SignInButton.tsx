import React, { Fragment, useState, memo, useRef, FC, useMemo } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import useTranslation from 'next-translate/useTranslation'
import { XIcon } from '@heroicons/react/outline'
import { useForm, Controller, SubmitHandler } from 'react-hook-form'
import OtpInput from 'react-otp-input'
import axios from 'axios'
import Cookies from 'js-cookie'
import { useUI } from '@components/ui/context'

import styles from './SignInButton.module.css'
import UserProfileDropDown from './UserProfileDropDown'
import Input from 'react-phone-number-input/input'
import { useRouter } from 'next/router'
import getConfig from 'next/config'

axios.defaults.withCredentials = true
const { publicRuntimeConfig } = getConfig()

interface Errors {
  [key: string]: string
}

interface AnyObject {
  [key: string]: any
}

const errors: Errors = {
  name_field_is_required:
    'Мы Вас не нашли в нашей системе. Просьба указать своё имя.',
  opt_code_is_incorrect: 'Введённый код неверный или срок кода истёк',
}

let otpTimerRef: NodeJS.Timeout

const SignInButton: FC = () => {
  const { t: tr } = useTranslation('common')

  let router = useRouter()

  let [isShowPrivacy, setIsShowPrivacy] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [isShowPasswordForm, setIsShowPasswordForm] = useState(false)
  const [otpShowCode, setOtpShowCode] = useState(0)
  const [showUserName, setShowUserName] = useState(false)

  const {
    user,
    setUserData,
    showSignInModal,
    openSignInModal,
    closeSignInModal,
  } = useUI()

  const otpTime = useRef(0)

  const openModal = () => {
    openSignInModal()
  }

  return (
    <>
      {user && (
        <div>
          <UserProfileDropDown />
        </div>
      )}
      {!user && (
        <>
          <button
            className="md:bg-gray-200 bg-yellow px-8 py-1 rounded-full text-secondary outline-none focus:outline-none mb-5 md:mb-0 ml-1 md:ml-0 font-bold md:font-normal"
            onClick={openModal}
          >
            {tr('signIn')}
          </button>
        </>
      )}
    </>
  )
}

export default memo(SignInButton)
