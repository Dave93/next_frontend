import React, { FC, ReactNode } from 'react'
import MobileHeader from './MobileHeader'
import MobileBottomNav from './MobileBottomNav'
import MobileCategoriesMenu from '@components_new/main/MobileCategoriesMenu'

interface MobileLayoutProps {
  children: ReactNode
  categories?: any[]
}

const MobileLayout: FC<MobileLayoutProps> = ({ children, categories = [] }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <MobileHeader />
      {categories.length > 0 && (
        <MobileCategoriesMenu categories={categories} />
      )}
      <main className="flex-grow pb-16">{children}</main>
      <MobileBottomNav />
    </div>
  )
}

export default MobileLayout
