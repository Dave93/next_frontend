import React, { FC } from 'react'
import Orders from './Orders'

interface MobileOrdersProps {
  channelName: string
}

const MobileOrders: FC<MobileOrdersProps> = ({ channelName }) => {
  return (
    <div className="mobile-checkout-wrap">
      <Orders channelName={channelName} isMobile />
      <style jsx global>{`
        /* ===== ROOT ===== */
        .mobile-checkout-wrap .orders-root {
          margin-left: 0 !important;
          margin-right: 0 !important;
          padding-top: 0 !important;
          padding-bottom: 140px !important;
        }

        /* ===== SECTIONS: full-width cards ===== */
        .mobile-checkout-wrap .orders-root > div,
        .mobile-checkout-wrap .orders-root > .mb-5 > div {
          border-radius: 0 !important;
        }
        .mobile-checkout-wrap .orders-root > .my-5 {
          margin-top: 2px !important;
          margin-bottom: 2px !important;
          border-radius: 0 !important;
        }
        .mobile-checkout-wrap .orders-root > .mb-5 {
          margin-top: 2px !important;
          margin-bottom: 2px !important;
        }

        /* ===== PADDING: 40px → 16px ===== */
        .mobile-checkout-wrap .p-10 {
          padding: 16px !important;
        }

        /* ===== SECTION TITLES ===== */
        .mobile-checkout-wrap .orders-root .text-lg.font-bold {
          font-size: 1rem;
          margin-bottom: 12px !important;
        }

        /* ===== DELIVERY/PICKUP TOGGLE ===== */
        .mobile-checkout-wrap .h-32 {
          height: auto !important;
          padding: 12px 16px !important;
        }
        .mobile-checkout-wrap .h-32 button {
          padding-top: 10px !important;
          padding-bottom: 10px !important;
          font-size: 15px !important;
        }


        /* ===== FORM INPUTS ===== */
        .mobile-checkout-wrap input[type="text"],
        .mobile-checkout-wrap input[type="tel"],
        .mobile-checkout-wrap input[type="email"],
        .mobile-checkout-wrap textarea {
          font-size: 16px !important;
          padding: 10px 16px !important;
        }

        /* ===== FORM GRID: stack on mobile ===== */
        .mobile-checkout-wrap .grid.gap-2 {
          grid-template-columns: 1fr !important;
          gap: 8px !important;
        }

        /* ===== PICKUP TERMINALS: scrollable list ===== */
        .mobile-checkout-wrap .gap-5.grid {
          max-height: 45vh;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          grid-template-columns: 1fr !important;
          gap: 8px !important;
        }
        .mobile-checkout-wrap .gap-5.grid > div {
          padding: 12px !important;
        }
        .mobile-checkout-wrap .gap-5.grid .text-xl {
          font-size: 0.875rem !important;
          line-height: 1.25rem !important;
        }
        .mobile-checkout-wrap .gap-5.grid .text-gray-500 {
          font-size: 0.75rem !important;
        }

        /* ===== ADDRESS FIELDS ROW ===== */
        .mobile-checkout-wrap .md\\:flex.justify-between.md\\:w-full {
          flex-direction: column !important;
        }
        .mobile-checkout-wrap .md\\:flex.justify-between.md\\:w-full > div {
          width: 100% !important;
        }

        /* ===== SAVED ADDRESSES ===== */
        .mobile-checkout-wrap .grid.grid-cols-1 {
          gap: 6px !important;
        }

        /* ===== LARGE TEXT → smaller ===== */
        .mobile-checkout-wrap .text-2xl {
          font-size: 1.125rem !important;
        }
        .mobile-checkout-wrap .text-xl {
          font-size: 1rem !important;
        }

        /* ===== DELIVERY TIME BUTTONS ===== */
        .mobile-checkout-wrap .space-x-5 > button,
        .mobile-checkout-wrap .space-x-5 > a {
          font-size: 14px !important;
        }

        /* ===== PAYMENT SECTION ===== */
        .mobile-checkout-wrap .relative .absolute.bg-gray-300 {
          border-radius: 0 !important;
        }

        /* ===== ORDER SUMMARY ===== */
        .mobile-checkout-wrap .border-b.py-2 img {
          width: 50px !important;
          height: 50px !important;
        }
        .mobile-checkout-wrap .border-b.py-2 .text-base {
          font-size: 0.8125rem !important;
        }

        /* ===== MODIFIERS TAGS ===== */
        .mobile-checkout-wrap .bg-yellow.rounded-full.px-2 {
          font-size: 10px !important;
          padding: 2px 8px !important;
        }

        /* ===== CUTLERY ===== */
        .mobile-checkout-wrap .text-2xl.items-center {
          font-size: 1rem !important;
        }

        /* ===== BOTTOM BUTTONS: fixed ===== */
        .mobile-checkout-wrap .justify-between.mt-8.space-y-2 {
          position: fixed !important;
          bottom: 56px;
          left: 0;
          right: 0;
          z-index: 25;
          background: white;
          border-top: 1px solid #f3f4f6;
          padding: 12px 16px !important;
          margin: 0 !important;
          display: flex !important;
          flex-direction: row !important;
          gap: 8px;
        }
        /* Hide "back to basket" button */
        .mobile-checkout-wrap .justify-between.mt-8.space-y-2 > button:first-child {
          display: none !important;
        }
        /* Full-width checkout button */
        .mobile-checkout-wrap .justify-between.mt-8.space-y-2 > button:last-child {
          width: 100% !important;
          height: 48px !important;
          font-size: 16px !important;
          font-weight: 700 !important;
        }

        /* ===== PRIVACY TEXT ===== */
        .mobile-checkout-wrap .text-gray-400.text-sm {
          font-size: 0.75rem !important;
        }

        /* ===== CHECKBOX SECTION ===== */
        .mobile-checkout-wrap .md\\:flex > .mr-5 {
          margin-bottom: 8px;
        }

        /* ===== SCROLLBAR HIDE ===== */
        .mobile-checkout-wrap .gap-5.grid::-webkit-scrollbar {
          display: none;
        }
        .mobile-checkout-wrap .gap-5.grid {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}

export default MobileOrders
