import MainSliderApp from '../MainSliderApp'
import CategoriesNavServer from './CategoriesNavServer'
import MobileCategoriesNavServer from './MobileCategoriesNavServer'
import CategorySectionServer from './CategorySectionServer'
import HalfPizzaSection from '../islands/HalfPizzaSection'
import ThreePizzaSection from '../islands/ThreePizzaSection'
import CityHeading from '../islands/CityHeading'
import SmallCartApp from '../../common/SmallCartApp'
import ClientCatalog from '../islands/ClientCatalog'
import type { SlimMenu } from '../../../lib/data/menu-dto'

type Props = {
  menu: SlimMenu
  sliders: any[]
  channelName: string
}

export default function CityMainServer({
  menu,
  sliders,
  channelName,
}: Props) {
  // Sections that have actual product cards (no half_mode, has items)
  const productSections = menu.sections.filter(
    (s) => !s.halfMode && s.items.length > 0
  )
  const halfModeSections = menu.sections.filter((s) => s.halfMode)
  const threeSaleSections = menu.sections.filter(
    (s) => s.threeSale || s.items.some((i) => i.threesome)
  )

  // SSR first product section for SEO + LCP. Rest stream via ClientCatalog.
  const firstSection = productSections[0]
  const ssrSectionIds = firstSection ? [firstSection.id] : []

  return (
    <>
      <MainSliderApp initialSliders={sliders} />
      <div id="header" />
      <div className="container mx-auto">
        <CategoriesNavServer sections={productSections} />
        <MobileCategoriesNavServer sections={productSections} />
        <CityHeading />
        <div className="grid lg:grid-cols-4 grid-cols-1 md:grid-cols-2 gap-10 mt-10">
          {threeSaleSections.length > 0 && (
            <div className="col-span-3 md:hidden">
              <ThreePizzaSection
                sections={threeSaleSections}
                channelName={channelName}
              />
            </div>
          )}
          {halfModeSections.length > 0 && (
            <div className="col-span-3 md:hidden space-y-4">
              <HalfPizzaSection
                sections={halfModeSections}
                channelName={channelName}
              />
            </div>
          )}
          <div className="col-span-3 space-y-16">
            {threeSaleSections.length > 0 && (
              <div className="hidden md:block">
                <ThreePizzaSection
                  sections={threeSaleSections}
                  channelName={channelName}
                />
              </div>
            )}
            {firstSection && (
              <CategorySectionServer
                section={firstSection}
                citySlug={menu.citySlug}
                channelName={channelName}
                priorityCount={4}
              />
            )}
            <ClientCatalog
              citySlug={menu.citySlug}
              locale={menu.locale}
              channelName={channelName}
              skipSectionIds={ssrSectionIds}
            />
          </div>
          <div className="sticky top-16 max-h-screen hidden md:block space-y-4">
            <HalfPizzaSection
              sections={halfModeSections}
              channelName={channelName}
              isSmall
            />
            <SmallCartApp channelName={channelName} />
          </div>
        </div>
      </div>
    </>
  )
}
