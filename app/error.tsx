'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Что-то пошло не так
      </h1>
      <p className="text-gray-600 mb-8">
        Произошла ошибка. Попробуйте перезагрузить страницу.
      </p>
      <button
        onClick={reset}
        className="px-6 py-3 bg-yellow text-white rounded-lg hover:bg-opacity-90 transition"
      >
        Попробовать снова
      </button>
    </div>
  )
}
