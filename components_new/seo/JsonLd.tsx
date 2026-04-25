import type { FC } from 'react'

type Props = { data: Record<string, any> | Record<string, any>[] }

const JsonLd: FC<Props> = ({ data }) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
  />
)

export default JsonLd
