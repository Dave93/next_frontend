'use client'

import { useTranslations, useLocale } from 'next-intl'
import { useState } from 'react'

export default function TestClient() {
  const t = useTranslations()
  const locale = useLocale()
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>
        <strong>Client locale:</strong> <code>{locale}</code>
      </p>
      <p>
        <strong>Translated:</strong>{' '}
        <code>{t('__test_message__')}</code>
      </p>
      <p>
        <strong>useState works:</strong> count = {count}{' '}
        <button
          onClick={() => setCount((c) => c + 1)}
          style={{ marginLeft: '0.5rem', padding: '0.25rem 0.75rem' }}
        >
          +1
        </button>
      </p>
    </div>
  )
}
