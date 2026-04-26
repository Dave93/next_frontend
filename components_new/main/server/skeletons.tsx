export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-[20px] md:rounded-[15px] shadow-sm p-3 md:py-3 md:px-3 flex flex-col h-full">
      <div className="mx-auto w-[120px] h-[96px] md:w-[250px] md:h-[250px] rounded-lg md:rounded-full bg-gray-100 animate-pulse" />
      <div className="mt-3 h-4 bg-gray-100 rounded animate-pulse" />
      <div className="mt-2 h-3 bg-gray-100 rounded animate-pulse w-3/4" />
      <div className="mt-auto pt-5">
        <div className="h-9 bg-gray-100 rounded-full animate-pulse" />
      </div>
    </div>
  )
}

export function CategorySectionSkeleton({
  itemCount = 6,
}: {
  itemCount?: number
}) {
  return (
    <div>
      <div className="px-3 md:px-0 mb-5 md:mb-8 flex flex-col items-center">
        <div className="h-8 w-40 bg-gray-100 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 md:grid-cols-2 gap-2.5 md:gap-3 px-4 md:px-0">
        {Array.from({ length: itemCount }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

export function CatalogSkeleton() {
  return (
    <div className="space-y-16">
      <CategorySectionSkeleton itemCount={6} />
      <CategorySectionSkeleton itemCount={6} />
      <CategorySectionSkeleton itemCount={4} />
    </div>
  )
}

export function HeroSliderSkeleton() {
  return (
    <div className="w-full aspect-[3/1] bg-gray-100 animate-pulse rounded-lg" />
  )
}
