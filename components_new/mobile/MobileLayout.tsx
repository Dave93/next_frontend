import React, { FC, ReactNode } from 'react'
import MobileHeader from './MobileHeader'
import MobileBottomNav from './MobileBottomNav'

interface MobileLayoutProps {
  children: ReactNode
}

const MobileLayout: FC<MobileLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <MobileHeader />
      <main className="flex-grow pb-16">{children}</main>
      <MobileBottomNav />
    </div>
  )
}

export default MobileLayout
