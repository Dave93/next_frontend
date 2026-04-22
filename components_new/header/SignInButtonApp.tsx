'use client'

import { FC, memo, useEffect, useState } from 'react'
import { useUI } from '@components/ui/context'
import { useExtracted } from 'next-intl'

const SignInButtonApp: FC = () => {
  const t = useExtracted()
  const { user, openSignInModal } = useUI()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <button
        className="md:bg-gray-200 bg-yellow px-8 py-1 rounded-full text-secondary outline-none focus:outline-none mb-5 md:mb-0 ml-1 md:ml-0 font-bold md:font-normal"
        onClick={openSignInModal}
      >
        {t('Войти')}
      </button>
    )
  }

  if (user?.user?.name) {
    return (
      <span className="text-secondary px-2 py-1">{user.user.name}</span>
    )
  }

  return (
    <button
      className="md:bg-gray-200 bg-yellow px-8 py-1 rounded-full text-secondary outline-none focus:outline-none mb-5 md:mb-0 ml-1 md:ml-0 font-bold md:font-normal"
      onClick={openSignInModal}
    >
      {t('Войти')}
    </button>
  )
}

export default memo(SignInButtonApp)
