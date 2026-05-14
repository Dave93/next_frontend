'use client'

import { FC } from 'react'
import Image from 'next/image'
import currency from 'currency.js'
import { useExtracted, useLocale } from 'next-intl'
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
  onAdded?: () => void
}

const ProductDetailContent: FC<Props> = ({ product, onAdded }) => {
  const t = useExtracted()
  const locale = useLocale()
  const builder = useProductBuilder(product, onAdded)

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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-10 p-4 md:p-10">
      <div className="flex items-center justify-center">
        {/* После server-side trim фотки бутылок/коробок имеют aspect ~1:3.5;
            без явного потолка по высоте картонные пакеты сока 1L растягивают
            модалку на 1500+ px. Ограничиваем max-h, ширину масштабируем
            пропорционально. */}
        {product.image ? (
          <Image
            src={product.image}
            alt={localizedName}
            width={520}
            height={520}
            sizes="(max-width: 768px) 90vw, 520px"
            className="w-auto h-auto max-w-full max-h-[520px] object-contain"
            priority
          />
        ) : (
          <img
            src="/no_photo.svg"
            alt={localizedName}
            className="w-auto h-auto max-w-full max-h-[520px] object-contain"
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

        {builder.isInStop && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-3 py-2 text-red-700">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span className="text-sm font-semibold">
              {builder.variants.length > 1
                ? t('Выбранный размер временно недоступен')
                : t('Товар временно недоступен')}
            </span>
          </div>
        )}

        {builder.variants.length > 1 && (
          <div className="mt-6">
            <div className="bg-gray-100 rounded-full p-1 flex gap-1">
              {builder.variants.map((v: any) => {
                const isActive = v.id === builder.activeVariant?.id
                const inStop = builder.isVariantInStop(v.id)
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => builder.selectVariant(v.id)}
                    className="flex-1 h-10 rounded-full text-sm font-semibold transition-colors"
                    style={{
                      background: isActive
                        ? inStop
                          ? '#9CA3AF'
                          : YELLOW
                        : 'transparent',
                      color: isActive
                        ? '#fff'
                        : inStop
                          ? '#9CA3AF'
                          : '#6B7280',
                      textDecoration: !isActive && inStop ? 'line-through' : 'none',
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
          <span
            className="text-xl md:text-2xl font-extrabold"
            style={{ color: builder.isInStop ? '#9CA3AF' : '#111827' }}
          >
            {formatPrice(builder.totalPrice, locale)}
          </span>
          <button
            type="button"
            onClick={builder.addToCart}
            disabled={builder.isLoading || builder.isInStop}
            className="rounded-full font-bold text-white px-8 h-12 transition-opacity disabled:cursor-not-allowed uppercase text-sm"
            style={{
              background: builder.isInStop ? '#9CA3AF' : YELLOW,
              opacity: builder.isLoading && !builder.isInStop ? 0.7 : 1,
            }}
          >
            {builder.isInStop
              ? t('Нет в наличии')
              : builder.isLoading
                ? t('Загрузка...')
                : t('В корзину')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailContent
