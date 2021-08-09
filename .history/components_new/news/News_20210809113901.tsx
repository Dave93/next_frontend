import useTranslation from 'next-translate/useTranslation'
import { memo, FC } from 'react'

const News: FC = () => {
    const { t: tr } = useTranslation('common')
    return (<>News</>)
    
}

export default News