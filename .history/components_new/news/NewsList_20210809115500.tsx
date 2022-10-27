import useTranslation from 'next-translate/useTranslation'
import { memo, FC } from 'react'
import { Tab  from '@headlessui/react'

const NewsList: FC = () => {
  const { t: tr } = useTranslation('common')
  return (
    <>
      <Tab.Group>
        <Tab.List>
          <Tab>Tab 1</Tab>
          <Tab>Tab 2</Tab>
          <Tab>Tab 3</Tab>
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel>Content 1</Tab.Panel>
          <Tab.Panel>Content 2</Tab.Panel>
          <Tab.Panel>Content 3</Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </>
  )
}

export default memo(NewsList)