'use client'

import { useExtracted } from 'next-intl'
import { useState } from 'react'

export default function TestClient() {
  const t = useExtracted()
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>
        <strong>Test message (from .po):</strong>{' '}
        <code>{t('__test_extracted_message__')}</code>
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
