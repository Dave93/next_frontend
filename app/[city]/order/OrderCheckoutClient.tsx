'use client'

import dynamic from 'next/dynamic'

// Forms depend on auth/cart state; render on the client only to mirror
// the legacy pages-router behaviour.
const OrdersApp = dynamic(
  () => import('../../../components_new/order/OrdersApp'),
  { ssr: false }
)
const MobileOrdersApp = dynamic(
  () => import('../../../components_new/order/MobileOrdersApp'),
  { ssr: false }
)

export default function OrderCheckoutClient({
  channelName = 'chopar',
}: {
  channelName?: string
}) {
  return (
    <>
      <div className="md:hidden">
        <MobileOrdersApp channelName={channelName} />
      </div>
      <div className="hidden md:block">
        <OrdersApp channelName={channelName} />
      </div>
    </>
  )
}
