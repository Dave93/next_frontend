import type { SlimSection } from '../../../lib/data/menu-dto'

type Props = {
  sections: SlimSection[]
}

export default function CategoriesNavServer({ sections }: Props) {
  if (!sections.length) return null
  return (
    <nav
      className="hidden md:flex justify-center sticky top-16 z-30 bg-white py-3 border-b border-gray-100"
      aria-label="Categories"
    >
      <ul className="flex gap-3 flex-wrap justify-center">
        {sections.map((s) => (
          <li key={s.id}>
            <a
              href={`#productSection_${s.id}`}
              className="px-4 py-2 rounded-full bg-gray-100 hover:bg-yellow hover:text-white text-sm font-medium transition-colors"
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
