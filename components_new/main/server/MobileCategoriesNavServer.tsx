import type { SlimSection } from '../../../lib/data/menu-dto'

type Props = {
  sections: SlimSection[]
}

export default function MobileCategoriesNavServer({ sections }: Props) {
  if (!sections.length) return null
  return (
    <nav
      className="md:hidden sticky top-12 z-30 bg-white border-b border-gray-100 overflow-x-auto"
      aria-label="Categories"
    >
      <ul className="flex gap-2 px-3 py-2 whitespace-nowrap">
        {sections.map((s) => (
          <li key={s.id}>
            <a
              href={`#productSection_${s.id}`}
              className="inline-block px-3 py-1.5 rounded-full bg-gray-100 text-xs font-medium"
            >
              {s.icon ? `${s.icon} ` : ''}
              {s.name}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
