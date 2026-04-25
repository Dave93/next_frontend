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
      <div className="hidden md:block checkout-desktop-compact">
        <OrdersApp channelName={channelName} />
      </div>
      {/* Desktop compaction (mobile already has its own MobileOrdersApp CSS).
          Only collapses the airy 20px vertical gaps between cards — fonts
          and inner padding stay at their original values. */}
      <style jsx global>{`
        .checkout-desktop-compact .orders-root > .my-5 {
          margin-top: 12px !important;
          margin-bottom: 12px !important;
        }
        .checkout-desktop-compact .orders-root > .mb-5 {
          margin-bottom: 12px !important;
        }
        /* Sticky CTA sits ~16px above the viewport bottom — give the
           form some breathing room so the Оплата section isn't kissed
           by the floating button. */
        .checkout-desktop-compact .orders-root {
          padding-bottom: 24px !important;
        }
      `}</style>
    </>
  )
}
