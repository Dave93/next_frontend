import React, { FC } from 'react'
import Orders from './Orders'

interface MobileOrdersProps {
  channelName: string
}

const MobileOrders: FC<MobileOrdersProps> = ({ channelName }) => {
  return (
    <div className="mobile-checkout">
      <Orders channelName={channelName} />
      <style jsx global>{`
        /* Root container — remove side margins, add bottom padding */
        .mobile-checkout > div {
          margin-left: 0 !important;
          margin-right: 0 !important;
          padding-bottom: 80px !important;
          padding-top: 0 !important;
        }

        /* All white card sections — no border-radius, tight spacing */
        .mobile-checkout > div > .rounded-2xl,
        .mobile-checkout > div > .mb-5 > .rounded-2xl,
        .mobile-checkout > div > div > .rounded-2xl {
          border-radius: 0 !important;
        }
        .mobile-checkout > div > .my-5,
        .mobile-checkout > div > .mb-5 {
          margin-top: 4px !important;
          margin-bottom: 4px !important;
        }

        /* Reduce inner padding from p-10 (40px) to 16px */
        .mobile-checkout .p-10 {
          padding: 16px !important;
        }

        /* Toggle section height */
        .mobile-checkout .h-32 {
          height: auto !important;
          padding: 12px 16px !important;
        }

        /* Pickup terminals list — scrollable with max height */
        .mobile-checkout .gap-5.grid {
          max-height: 50vh;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }

        /* Terminal cards — more compact */
        .mobile-checkout .gap-5.grid > div {
          padding: 12px !important;
        }
        .mobile-checkout .gap-5.grid .text-xl {
          font-size: 0.875rem;
          line-height: 1.25rem;
        }
        .mobile-checkout .gap-5.grid .text-gray-500 {
          font-size: 0.75rem;
        }

        /* Reduce large text */
        .mobile-checkout .text-2xl {
          font-size: 1.125rem;
          line-height: 1.5rem;
        }
        .mobile-checkout .text-lg {
          font-size: 1rem;
        }

        /* Order summary images — smaller */
        .mobile-checkout [style*="width: 80px"] {
          width: 50px !important;
          height: 50px !important;
        }

        /* Bottom buttons — fixed */
        .mobile-checkout > div > .rounded-2xl:last-of-type .md\\:flex.justify-between.mt-8 {
          position: fixed;
          bottom: 56px;
          left: 0;
          right: 0;
          z-index: 25;
          background: white;
          border-top: 1px solid #f3f4f6;
          padding: 12px 16px;
          margin: 0 !important;
          display: flex;
          gap: 8px;
        }
        .mobile-checkout > div > .rounded-2xl:last-of-type .md\\:flex.justify-between.mt-8 button {
          font-size: 14px !important;
          height: 44px !important;
          padding-left: 16px !important;
          padding-right: 16px !important;
        }

        /* Map container height */
        .mobile-checkout [class*="ymaps"] {
          min-height: 180px !important;
        }

        /* Input fields — larger touch targets */
        .mobile-checkout input[type="text"],
        .mobile-checkout input[type="tel"],
        .mobile-checkout input[type="email"],
        .mobile-checkout select,
        .mobile-checkout textarea {
          font-size: 16px !important;
        }

        /* Hide back-to-basket on mobile (use browser back) */
        .mobile-checkout > div > .rounded-2xl:last-of-type .md\\:flex.justify-between.mt-8 button:first-child {
          display: none;
        }
        .mobile-checkout > div > .rounded-2xl:last-of-type .md\\:flex.justify-between.mt-8 button:last-child {
          width: 100% !important;
        }
      `}</style>
    </div>
  )
}

export default MobileOrders
