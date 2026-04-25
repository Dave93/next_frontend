import type { FC } from 'react'
import JsonLd from './JsonLd'

export type Crumb = { name: string; url: string }

type Props = { items: Crumb[] }

const BreadcrumbsJsonLd: FC<Props> = ({ items }) => {
  if (!items || items.length === 0) return null
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: it.name,
      item: it.url,
    })),
  }
  return <JsonLd data={data} />
}

export default BreadcrumbsJsonLd
