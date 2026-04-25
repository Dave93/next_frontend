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
          Reduces the 40px paddings + 20px vertical gaps that made the form
          feel airy and forced extra scrolling between Контакты ↔ Адрес ↔
          Время ↔ Оплата. */}
      <style jsx global>{`
        .checkout-desktop-compact .orders-root > .my-5 {
          margin-top: 12px !important;
          margin-bottom: 12px !important;
        }
        .checkout-desktop-compact .orders-root > .mb-5 {
          margin-bottom: 12px !important;
        }
        .checkout-desktop-compact .orders-root .p-10 {
          padding: 20px !important;
        }
        .checkout-desktop-compact .orders-root .text-lg.font-bold {
          font-size: 1rem !important;
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
