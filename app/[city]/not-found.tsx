import Link from 'next/link'

export default function CityNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
      <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">Страница не найдена</p>
      <Link
        href="/"
        className="px-6 py-3 bg-yellow text-white rounded-lg hover:bg-opacity-90 transition"
      >
        На главную
      </Link>
    </div>
  )
}
