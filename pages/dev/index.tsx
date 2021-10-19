import commerce from '@lib/api/commerce'
import { GetServerSidePropsContext } from 'next'
import Image from 'next/dist/client/image'
import { Menu, Transition } from '@headlessui/react'
import { Fragment, useEffect, useMemo } from 'react'
import { useUI } from '@components/ui'
import { City } from '@commerce/types/cities'
import { useRouter } from 'next/router'
import useTranslation from 'next-translate/useTranslation'

export async function getServerSideProps({
  preview,
  locale,
  locales,
}: GetServerSidePropsContext) {
  const config = { locale, locales }
  const siteInfoPromise = commerce.getSiteInfo({ config, preview })
  const { categories, brands, topMenu, footerInfoMenu, socials, cities } =
    await siteInfoPromise

  return {
    props: {
      categories,
      brands,
      topMenu,
      footerInfoMenu,
      socials,
      cities,
    },
  }
}

export default function DevPage({ cities }: { cities: any }) {
  const { t: tr } = useTranslation('common')
  const { locale } = useRouter()
  const { activeCity, setActiveCity, setCitiesData } = useUI()
  const chosenCity = useMemo(() => {
    if (activeCity) {
      return activeCity
    }
    if (cities) return cities[0]
    return null
  }, [cities, activeCity])

  useEffect(() => {
    setCitiesData(cities)
  }, [])

  return (
    <div className="bg-secondary w-full h-screen">
      <div className="m-auto w-max pt-40">
        <Image src="/assets/footer_logo.svg " width={300} height={200} />
      </div>
      <div className="m-auto w-96 bg-white rounded-2xl">
        <Menu as="div" className="text-center">
          {({ open }) => (
            <>
              <div>
                <Menu.Button className=" focus:outline-none font-medium inline-flex justify-center outline-none py-2 text-secondary w-full">
                  {locale == 'uz' ? chosenCity?.name_uz : chosenCity?.name}
                </Menu.Button>
              </div>

              <Transition
                show={open}
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items
                  static
                  className="cursor-pointer divide-gray-100 divide-y focus:outline-none  ring-1 ring-black ring-opacity-5 shadow-lg top-0 z-20"
                >
                  <Menu.Item>
                    {({ active }) => (
                      <span className="text-secondary block px-4 py-2 text-sm">
                        {tr('your_city')}
                      </span>
                    )}
                  </Menu.Item>
                  {cities?.map((item: City) => (
                    <Menu.Item key={item.id}>
                      <span
                        onClick={() => setActiveCity(item)}
                        className={`block px-4 py-2 text-sm cursor-pointer ${
                          chosenCity.id == item.id
                            ? 'bg-secondary text-white'
                            : 'text-secondary'
                        }`}
                      >
                        {locale == 'uz' ? item.name_uz : item.name}
                      </span>
                    </Menu.Item>
                  ))}
                </Menu.Items>
              </Transition>
            </>
          )}
        </Menu>
      </div>
    </div>
  )
}
