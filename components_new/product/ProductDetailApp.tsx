'use client'

import { FC } from 'react'
import Image from 'next/image'
import currency from 'currency.js'
import { useExtracted, useLocale } from 'next-intl'
import { useRouter } from '../../i18n/navigation'
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

type Props = {
  product: any
  channelName: string
}

const ProductDetailApp: FC<Props> = ({ product }) => {
  const t = useExtracted()
  const locale = useLocale()
  const router = useRouter()
  const builder = useProductBuilder(product)

  const localizedName = (() => {
    const attr =
      product?.attribute_data?.name?.['chopar']?.[locale] ||
      product?.attribute_data?.name?.['chopar']?.['ru']
    return attr || product?.name || ''
  })()

  const localizedDesc = (() => {
    const attr =
      product?.attribute_data?.description?.['chopar']?.[locale] ||
      product?.attribute_data?.description?.['chopar']?.['ru']
    const raw = attr || product?.description || product?.desc || ''
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

  return (
    <div className="container mx-auto py-4 md:py-6 px-3 md:px-0">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="back"
        className="mb-4 inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors text-gray-700"
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
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-10 p-4 md:p-10">
          <div className="flex items-center justify-center">
            {product.image ? (
              <Image
                src={product.image}
                alt={localizedName}
                width={520}
                height={520}
                sizes="(max-width: 768px) 90vw, 520px"
                className="w-full h-auto max-w-[520px] object-contain"
                priority
              />
            ) : (
              <img
                src="/no_photo.svg"
                alt={localizedName}
                className="w-full max-w-[520px] object-contain"
              />
            )}
          </div>

          <div className="flex flex-col">
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
              {localizedName}
            </h1>
            {localizedDesc && (
              <p className="mt-3 text-sm md:text-base text-gray-500 leading-relaxed">
                {localizedDesc}
              </p>
            )}

            {builder.variants.length > 1 && (
              <div className="mt-6">
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
                          background: isActive ? YELLOW : 'transparent',
                          color: isActive ? '#fff' : '#6B7280',
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
              <div className="mt-6">
                <h3 className="text-base font-bold text-gray-900 mb-3">
                  {t('Добавить в пиццу')}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                          <div className="w-14 h-14 mb-2 flex items-center justify-center">
                            <img
                              src={getAssetUrl(mod.assets)}
                              alt={modifierLabel(mod)}
                              className="max-w-full max-h-full object-contain"
                              loading="lazy"
                            />
                          </div>
                          <div className="text-[12px] font-semibold text-gray-800 leading-tight line-clamp-2 min-h-[28px]">
                            {modifierLabel(mod)}
                          </div>
                          <div
                            className="text-[12px] font-bold mt-1"
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

            <div className="mt-6 md:mt-auto pt-4 flex items-center justify-between gap-4">
              <span className="text-xl md:text-2xl font-extrabold text-gray-900">
                {formatPrice(builder.totalPrice, locale)}
              </span>
              {builder.cartQuantity > 0 ? (
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center rounded-full h-12"
                    style={{ background: YELLOW, padding: '0 4px' }}
                  >
                    <button
                      type="button"
                      onClick={() => builder.changeQuantity(-1)}
                      disabled={builder.isLoading}
                      aria-label="decrement"
                      className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl font-bold disabled:opacity-60"
                      style={{ color: YELLOW }}
                    >
                      −
                    </button>
                    <span className="text-white font-bold text-base px-4 min-w-[36px] text-center">
                      {builder.isLoading ? '…' : builder.cartQuantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => builder.changeQuantity(1)}
                      disabled={builder.isLoading}
                      aria-label="increment"
                      className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl font-bold disabled:opacity-60"
                      style={{ color: YELLOW }}
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={builder.addToCart}
                    disabled={builder.isLoading}
                    aria-label="add another"
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white disabled:opacity-70"
                    style={{ background: YELLOW }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={builder.addToCart}
                  disabled={builder.isLoading}
                  className="rounded-full font-bold text-white px-8 h-12 transition-opacity disabled:opacity-70 uppercase text-sm"
                  style={{ background: YELLOW }}
                >
                  {builder.isLoading ? t('Загрузка...') : t('В корзину')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailApp
