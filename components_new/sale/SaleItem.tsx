import useTranslation from 'next-translate/useTranslation'
import { memo, FC } from 'react'
import Image from 'next/image'
import { ClockIcon, CalendarIcon } from '@heroicons/react/solid'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useUI } from '@components/ui/context'

type AnyObject = {
  [key: string]: any
}

type SaleListProps = {
  SaleItems: AnyObject[]
}

const SaleItem: FC<SaleListProps> = ({ SaleItems }) => {
  const { t: tr } = useTranslation('common')
  const router = useRouter()
  const { activeCity } = useUI()
  const { locale } = router
  return (
    <>
      {SaleItems.map((item, key) => (
        <div
          className="bg-white rounded-3xl flex flex-col overflow-hidden mb-4 md:mb-0"
          key={item.id}
        >
          <div className="relative">
            {item.asset && item.asset.length ? (
              <Link
                href={`${'/' + activeCity.slug + '/sale/' + item.id}`}
                prefetch={false}
                legacyBehavior
              >
                <a>
                  <Image
                    src={item.asset[0].link}
                    width="400"
                    height="400"
                    alt={item.name}
                  />
                </a>
              </Link>
            ) : (
              <Link
                href={`${'/' + activeCity.slug + '/sale/' + item.id}`}
                prefetch={false}
                legacyBehavior
              >
                <a>
                  <Image
                    src="/no_photo.svg"
                    width="400"
                    height="400"
                    alt={item.name}
                  />
                </a>
              </Link>
            )}

            {/* <div className="absolute bottom-5 flex justify-between px-4 text-white w-full">
                  <div className="flex items-center">
                    <ClockIcon className="h-5 w-5 mr-2" />
                    <div>22:00-03:00</div>
                  </div>
                  <div className="flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    <div>01.07-31.07</div>
                  </div>
                </div> */}
          </div>
          <div className="flex flex-col justify-between p-5 flex-grow">
            <div className="md:text-lg mb-3">
              <Link
                href={`${'/' + activeCity.slug + '/sale/' + item.id}`}
                prefetch={false}
                legacyBehavior
              >
                {item.name}
              </Link>
            </div>
            <Link
              href={`${'/' + activeCity.slug + '/sale/' + item.id}`}
              prefetch={false}
              legacyBehavior
            >
              <a className="text-xs text-gray-400 hover:underline">
                {tr('more')}
              </a>
            </Link>
          </div>
        </div>
      ))}
    </>
  )
}

export default memo(SaleItem)
