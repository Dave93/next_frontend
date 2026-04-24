'use client'

import { FC } from 'react'
import { Drawer } from 'vaul'
import Image from 'next/image'
import currency from 'currency.js'
import { useExtracted, useLocale } from 'next-intl'
import { useUI } from '@components/ui/context'
import getAssetUrl from '@utils/getAssetUrl'
import { useProductBuilder } from './useProductBuilder'

const YELLOW = '#FAAF04'

const formatPrice = (val: number, locale: string) =>
  currency(val, {
    pattern: '# !',
    separator: ' ',
    decimal: '.',
    symbol: locale === 'uz' ? "so'm" : locale === 'en' ? 'sum' : 'сум',
    precision: 0,
  }).format()

const ProductDrawerApp: FC = () => {
  const ui = useUI() as any
  const { productDrawerProduct, closeProductDrawer } = ui
  const t = useExtracted()
  const locale = useLocale()
  const open = !!productDrawerProduct

  const builder = useProductBuilder(productDrawerProduct, () =>
    closeProductDrawer()
  )

  const localizedName = (() => {
    if (!productDrawerProduct) return ''
    const attr =
      productDrawerProduct?.attribute_data?.name?.['chopar']?.[locale] ||
      productDrawerProduct?.attribute_data?.name?.['chopar']?.['ru']
    return attr || productDrawerProduct?.name || ''
  })()

  const localizedDesc = (() => {
    if (!productDrawerProduct) return ''
    const attr =
      productDrawerProduct?.attribute_data?.description?.['chopar']?.[locale] ||
      productDrawerProduct?.attribute_data?.description?.['chopar']?.['ru']
    const raw =
      attr ||
      productDrawerProduct?.description ||
      productDrawerProduct?.desc ||
      ''
    return raw
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  })()

  const variantLabel = (v: any) =>
    locale === 'uz'
      ? v.custom_name_uz
      : locale === 'en'
        ? v.custom_name_en
        : v.custom_name

  const modifierLabel = (m: any) => {
    const byLocale =
      (locale === 'uz' && m.name_uz) ||
      (locale === 'en' && m.name_en) ||
      m.name_ru
    return byLocale || m.name || ''
  }

  const productImage = productDrawerProduct?.image || null

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(v) => !v && closeProductDrawer()}
      direction="bottom"
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 z-40" />
        <Drawer.Content className="bg-white flex flex-col rounded-t-[24px] fixed bottom-0 left-0 right-0 max-h-[92vh] z-50 outline-none">
          <Drawer.Title className="sr-only">{localizedName}</Drawer.Title>
          <div className="mx-auto w-10 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mt-2 mb-1" />

          <div className="overflow-y-auto flex-1 pb-[120px]">
            {productImage && (
              <div
                className="relative w-full bg-gradient-to-b from-gray-50 to-white"
                style={{ paddingTop: '70%' }}
              >
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <Image
                    src={productImage}
                    alt={localizedName}
                    width={420}
                    height={420}
                    sizes="(max-width: 768px) 90vw, 420px"
                    className="max-h-full w-auto object-contain"
                    style={{ height: 'auto' }}
                    priority
                  />
                </div>
              </div>
            )}

            <div className="px-5 pt-4">
              <h2 className="text-2xl font-extrabold text-gray-900 leading-tight">
                {localizedName}
              </h2>
              {localizedDesc && (
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                  {localizedDesc}
                </p>
              )}
            </div>

            {builder.variants.length > 1 && (
              <div className="px-5 mt-5">
                <div className="bg-gray-100 rounded-full p-1 flex gap-1">
                  {builder.variants.map((v: any) => {
                    const isActive = v.id === builder.activeVariant?.id
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => builder.selectVariant(v.id)}
                        className="flex-1 h-10 rounded-full text-sm font-semibold transition-colors"
                        style={{
                          background: isActive ? '#fff' : 'transparent',
                          color: isActive ? '#111827' : '#6B7280',
                          boxShadow: isActive
                            ? '0 1px 2px rgba(0,0,0,0.06)'
                            : 'none',
                        }}
                      >
                        {variantLabel(v)}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {builder.modifiers.length > 0 && (
              <div className="px-5 mt-6">
                <h3 className="text-base font-bold text-gray-900 mb-3">
                  {t('Добавить в пиццу')}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {builder.modifiers.map((mod: any) => {
                    const isActive = builder.activeModifiers.includes(mod.id)
                    return (
                      <button
                        key={mod.id}
                        type="button"
                        onClick={() => builder.toggleModifier(mod.id)}
                        className="relative bg-white rounded-2xl border text-left transition-all overflow-hidden"
                        style={{
                          borderColor: isActive ? YELLOW : '#E5E7EB',
                          borderWidth: isActive ? 2 : 1,
                          padding: isActive ? 11 : 12,
                        }}
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className="w-16 h-16 mb-2 flex items-center justify-center">
                            <img
                              src={getAssetUrl(mod.assets)}
                              alt={modifierLabel(mod)}
                              className="max-w-full max-h-full object-contain"
                              loading="lazy"
                            />
                          </div>
                          <div className="text-[13px] font-semibold text-gray-800 leading-tight line-clamp-2 min-h-[32px]">
                            {modifierLabel(mod)}
                          </div>
                          <div
                            className="text-[13px] font-bold mt-1"
                            style={{ color: isActive ? YELLOW : '#111827' }}
                          >
                            +{formatPrice(mod.price, locale)}
                          </div>
                        </div>
                        {isActive && (
                          <div
                            className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-white"
                            style={{ background: YELLOW }}
                          >
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <div
            className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 py-4"
            style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
          >
            <button
              type="button"
              onClick={builder.addToCart}
              disabled={builder.isLoading}
              className="w-full h-14 rounded-full font-bold text-white flex items-center justify-between px-6 transition-opacity disabled:opacity-70"
              style={{ background: YELLOW }}
            >
              <span className="text-base">
                {builder.isLoading ? t('Загрузка...') : t('В корзину')}
              </span>
              <span className="text-base">
                {formatPrice(builder.totalPrice, locale)}
              </span>
            </button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

export default ProductDrawerApp
