'use client'

import { FC } from 'react'
import { Drawer } from 'vaul'
import { useUI } from '@components/ui/context'
import { useLocale } from 'next-intl'
import ProductItemNewApp from './ProductItemNewApp'

const ProductDrawerApp: FC = () => {
  const ui = useUI() as any
  const { productDrawerProduct, closeProductDrawer } = ui
  const locale = useLocale()
  const open = !!productDrawerProduct

  const localizedName = (() => {
    if (!productDrawerProduct) return ''
    const attr =
      productDrawerProduct?.attribute_data?.name?.['chopar']?.[locale] ||
      productDrawerProduct?.attribute_data?.name?.['chopar']?.['ru']
    return attr || productDrawerProduct?.name || ''
  })()

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(v) => !v && closeProductDrawer()}
      direction="bottom"
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Drawer.Content className="bg-white flex flex-col rounded-t-[20px] fixed bottom-0 left-0 right-0 max-h-[90vh] z-50 outline-none">
          <Drawer.Title className="sr-only">{localizedName}</Drawer.Title>
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 my-3" />
          <div className="overflow-y-auto px-4 pb-6">
            {productDrawerProduct && (
              <ProductItemNewApp
                product={productDrawerProduct}
                channelName="chopar"
                mode="drawer"
              />
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

export default ProductDrawerApp
