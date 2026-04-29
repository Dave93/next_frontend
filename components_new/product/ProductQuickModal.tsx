'use client'

import { FC, Fragment, useRef } from 'react'
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react'
import { useExtracted, useLocale } from 'next-intl'
import { useRouter } from '../../i18n/navigation'
import { toast } from 'sonner'
import ProductDetailContent from './ProductDetailContent'

type Props = {
  product: any
}

const ProductQuickModal: FC<Props> = ({ product }) => {
  const t = useExtracted()
  const locale = useLocale()
  const router = useRouter()
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const close = () => {
    router.back()
  }

  const handleAdded = () => {
    toast.success(t('Товар добавлен в корзину'))
    router.back()
  }

  const localizedName = (() => {
    const attr =
      product?.attribute_data?.name?.['chopar']?.[locale] ||
      product?.attribute_data?.name?.['chopar']?.['ru']
    return attr || product?.name || ''
  })()

  return (
    <Transition show as={Fragment} appear>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={close}
        initialFocus={closeButtonRef}
      >
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60" aria-hidden="true" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="relative w-[90vw] max-w-[960px] max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
                <DialogTitle className="sr-only">{localizedName}</DialogTitle>

                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={close}
                  aria-label={t('Закрыть')}
                  className="absolute top-4 right-4 z-10 inline-flex items-center justify-center w-11 h-11 rounded-full bg-white/90 hover:bg-gray-100 transition-colors text-gray-700 shadow-sm"
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>

                <ProductDetailContent product={product} onAdded={handleAdded} />
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

export default ProductQuickModal
