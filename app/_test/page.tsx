import { getExtracted } from 'next-intl/server'
import TestClient from './TestClient'

export default async function TestPage() {
  const t = await getExtracted()
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>App Router Foundation — Sanity Check</h1>

      <section style={{ marginTop: '2rem' }}>
        <h2>Server Component (getExtracted)</h2>
        <p>
          <strong>Test message (from .po):</strong>{' '}
          <code>{t('__test_extracted_message__')}</code>
        </p>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2>Client Component (useExtracted)</h2>
        <TestClient />
      </section>
    </div>
  )
}
