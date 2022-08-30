import useTranslation from 'next-translate/useTranslation'
import { FC, memo } from 'react'

const About: FC = () => {
  const { t: tr } = useTranslation('common')
  return (
    <>
      <div className="text-3xl mb-1">{tr('about')}</div>
      <div className="border-b-2 w-24 border-yellow mb-10"></div>
      <div className="grid grid-cols-2">
        <div className="text-7xl text-yellow font-bold">ИСТОРИЯ “CHOPAR”</div>
        <div className="col-span-2">
          <div>
            It is a long established fact that a reader will be distracted by
            the readable content of a page when looking at its layout. The point
            of using Lorem Ipsum is that it has a more-or-less normal
            distribution of letters, as opposed to using 'Content here, content
            here', making it look like readable English.
          </div>
          <div>
            Many desktop publishing packages and web page editors now use Lorem
            Ipsum as their default model text, and a search for 'lorem ipsum'
            will uncover many web sites still in their infancy. Various versions
            have evolved over the years, sometimes by accident, sometimes on
            purpose (injected humour and the like).
          </div>
        </div>
      </div>
    </>
  )
}

export default memo(About)
