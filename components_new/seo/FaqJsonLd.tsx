import JsonLd from './JsonLd'

export type FaqItem = { question: string; answer: string }

type Props = { items: FaqItem[] }

export default function FaqJsonLd({ items }: Props) {
  if (!items || items.length === 0) return null
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: it.answer,
      },
    })),
  }
  return <JsonLd data={data} />
}
