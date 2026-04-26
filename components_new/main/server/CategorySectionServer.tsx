import ProductCardServer from './ProductCardServer'
import type { SlimSection } from '../../../lib/data/menu-dto'

type Props = {
  section: SlimSection
  citySlug: string
  channelName: string
  priorityCount?: number
}

export default function CategorySectionServer({
  section,
  citySlug,
  channelName,
  priorityCount = 0,
}: Props) {
  return (
    <div id={`productSection_${section.id}`}>
      <div className="px-3 md:px-0 mb-5 md:mb-8 flex flex-col items-center">
        <h2 className="font-serif text-3xl md:text-4xl text-center">
          {section.icon ? `${section.icon} ` : ''}
          {section.name}
        </h2>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 md:grid-cols-2 gap-2.5 md:gap-3 px-4 md:px-0">
        {section.items.map((product, idx) => (
          <ProductCardServer
            key={product.id}
            product={product}
            citySlug={citySlug}
            channelName={channelName}
            priority={idx < priorityCount}
          />
        ))}
      </div>
      {section.description && (
        <div className="mt-5 px-4 md:px-0">
          <p>{section.description}</p>
        </div>
      )}
    </div>
  )
}
