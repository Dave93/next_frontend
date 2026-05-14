'use client'

import React, {
  memo,
  useState,
  FC,
  useMemo,
  useRef,
  useEffect,
} from 'react'
import Image from 'next/image'
import { Link } from '../../i18n/navigation'
import currency from 'currency.js'
import {
  Dialog,
  DialogBackdrop,
  Transition,
  TransitionChild,
} from '@headlessui/react'
import { Product } from '@commerce/types/product'
import { useExtracted, useLocale } from 'next-intl'
import { useParams } from 'next/navigation'
import axios from 'axios'
import getAssetUrl from '@utils/getAssetUrl'
import { useAddToCart } from '../../lib/hooks/useCartMutations'
import { XIcon } from '@heroicons/react/solid'
import styles from './ProductItemNew.module.css'
import { useLocationStore } from '../../lib/stores/location-store'
import { useUIStore } from '../../lib/stores/ui-store'
import { DateTime } from 'luxon'
import { toast } from 'sonner'
import { trackAddToCart } from '@lib/posthog-events'
// import SessionContext from 'react-storefront/session/SessionContext'

type ProductItem = {
  product: Product
  channelName: string
}

let webAddress = process.env.NEXT_PUBLIC_API_URL
axios.defaults.withCredentials = true

const ProductItemNewApp: FC<ProductItem> = ({ product, channelName }) => {
  const t = useExtracted()
  const locale = useLocale()
  const params = useParams()
  const citySlug = (params?.city as string) || ''

  const [store, updateStore] = useState<any>(() => {
    const p: any = { ...product }
    if (Array.isArray(p.variants) && p.variants.length > 0) {
      const enabled = p.variants.filter((v: any) => v.active)
      const pool = enabled.length > 0 ? enabled : p.variants
      const defaultId = (pool[1] ?? pool[0])?.id
      p.variants = p.variants.map((v: any) => ({
        ...v,
        active: v.id === defaultId,
      }))
    }
    return p
  })
  const isLoadingBasket = false
  const locationData = useLocationStore((s) => s.locationData) as any
  const stopProducts = useUIStore((s) => s.stopProducts)
  const openProductDrawer = useUIStore((s) => s.openProductDrawer)
  const addMutation = useAddToCart()

  const [imageLoaded, setImageLoaded] = useState(false)

  const [isChoosingModifier, setIsChoosingModifier] = useState(false)
  const [activeModifiers, setActiveModifiers] = useState([] as number[])

  const [configData, setConfigData] = useState({} as any)
  let [isOpen, setIsOpen] = useState(false)
  let completeButtonRef = useRef(null)

  const fetchConfig = async () => {
    let configData
    if (!sessionStorage.getItem('configData')) {
      let { data } = await axios.get(`${webAddress}/api/configs/public`)
      configData = data.data
      sessionStorage.setItem('configData', data.data)
    } else {
      configData = sessionStorage.getItem('configData')
    }

    try {
      configData = Buffer.from(configData, 'base64')
      configData = configData.toString('ascii')
      configData = JSON.parse(configData)
      setConfigData(configData)
    } catch (e) {}
  }

  function closeModal() {
    setIsOpen(false)
  }

  // openModal removed (was unused) — opening modal is handled inline by handleSubmit / modifier flow

  const updateOptionSelection = (valueId: string) => {
    setActiveModifiers([])
    updateStore((prev: any) => {
      if (!prev?.variants) return prev
      return {
        ...prev,
        // The variant objects come from a server-rendered payload and may be
        // frozen by React 19's RSC pipeline — clone each one before flipping
        // `active`, instead of mutating in place.
        variants: prev.variants.map((v: any) => ({
          ...v,
          active: v.id == valueId,
        })),
      }
    })
  }

  const addModifier = (modId: number) => {
    let modifierProduct: any = null
    if (store.variants && store.variants.length) {
      const activeValue: any = store.variants.find(
        (item: any) => item.active == true
      )

      if (activeValue.modifierProduct) {
        modifierProduct = activeValue.modifierProduct
      }
    }
    if (activeModifiers.includes(modId)) {
      let currentModifier: any = modifiers.find((mod: any) => mod.id == modId)
      if (!currentModifier) return
      if (currentModifier.price == 0) return
      let resultModifiers = [
        ...activeModifiers.filter((id) => modId != id),
      ].filter((id) => id)
      setActiveModifiers(resultModifiers)
    } else {
      let currentModifier: any = modifiers.find((mod: any) => mod.id == modId)
      let selectedModifiers = [...activeModifiers, modId]

      if (modifierProduct) {
        let sausage = modifiers.find((mod: any) => mod.id == modifierProduct.id)
        if (
          selectedModifiers.includes(modifierProduct.id) &&
          sausage.price < currentModifier.price
        ) {
          selectedModifiers = [
            ...selectedModifiers.filter((modId: any) => modId != sausage.id),
          ]
        } else if (currentModifier.id == sausage.id) {
          let richerModifier = modifiers
            .filter((mod: any) => mod.price > sausage.price)
            .map((mod: any) => mod.id)
          selectedModifiers = [
            ...selectedModifiers.filter(
              (modId: any) => !richerModifier.includes(modId)
            ),
            modId,
          ]
        }
      }
      setActiveModifiers(selectedModifiers)
    }
  }

  const addToBasket = (mods: any = null) => {
    if (isProductInStop) return

    let modifierProduct: any = null
    let selectedModifiers: { id: number }[] = []

    if (!mods || !mods.length) {
      mods = activeModifiers
    }
    if (modifiers) {
      selectedModifiers = modifiers
        .filter((m: any) => mods.includes(m.id))
        .map((m: any) => ({ id: m.id }))
    }

    let selectedProdId = 0
    let selectedVariant: any = null
    if (store.variants && store.variants.length) {
      selectedVariant = store.variants.find((v: any) => v.active == true)
      selectedProdId = selectedVariant.id
      if (selectedVariant.modifierProduct) {
        modifierProduct = selectedVariant.modifierProduct
      }

      if (mods.length && modifierProduct) {
        if (mods.includes(modifierProduct.id)) {
          selectedProdId = modifierProduct.id
          const currentProductModifiersPrices = modifiers
            .filter(
              (mod: any) =>
                mod.id != modifierProduct.id && mods.includes(mod.id)
            )
            .map((mod: any) => mod.price)
          selectedModifiers = (modifierProduct.modifiers || [])
            .filter((mod: any) =>
              currentProductModifiersPrices.includes(mod.price)
            )
            .map((m: any) => ({ id: m.id }))
        }
      }
    } else {
      selectedProdId = +store.id
    }

    const basePrice = Number(
      selectedVariant?.price ?? store.price ?? 0
    )
    const optimisticId = -Date.now()
    const optimisticModifiers = (modifiers || [])
      .filter((m: any) => mods.includes(m.id))
      .map((m: any) => ({
        id: Number(m.id),
        name: m.name || m.name_ru || '',
        price: Number(m.price ?? 0),
      }))
    const productName =
      store?.attribute_data?.name?.[channelName]?.[locale || 'ru'] ||
      store?.name ||
      ''

    const optimisticPayload = {
      variants: [
        {
          id: selectedProdId,
          quantity: 1,
          modifiers: selectedModifiers,
        },
      ],
      deliveryType: locationData?.deliveryType,
      optimisticLine: {
        id: optimisticId,
        productId: Number(store.id),
        variantId: selectedProdId,
        name: productName,
        qty: 1,
        price: basePrice,
        image: store.image,
        modifiers: optimisticModifiers.length
          ? optimisticModifiers
          : undefined,
        _raw: {
          id: optimisticId,
          quantity: 1,
          total:
            basePrice +
            optimisticModifiers.reduce(
              (acc: number, m: any) => acc + Number(m.price || 0),
              0
            ),
          variant: {
            id: selectedProdId,
            product_id: Number(store.id),
            product: store,
          },
          modifiers: optimisticModifiers,
        },
      },
    }
    addMutation.mutate(optimisticPayload)

    trackAddToCart({
      product_id: store.id,
      product_name: store.name,
      variant_id: selectedProdId,
      quantity: 1,
      price: basePrice / 100,
      city: citySlug,
    })

    if (modifiers && modifiers.length) {
      setIsChoosingModifier(false)
    }

    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      closeModal()
    }
  }

  useEffect(() => {
    fetchConfig()
  }, [])

  const modifiers = useMemo(() => {
    let modifier = null
    if (store.variants && store.variants.length) {
      const activeValue: any = store.variants.find(
        (item: any) => item.active == true
      )
      if (activeValue && activeValue.modifiers) {
        modifier = activeValue.modifiers
        if (activeValue.modifierProduct) {
          let isExistSausage = modifier.find(
            (mod: any) => mod.id == activeValue.modifierProduct.id
          )
          if (!isExistSausage) {
            const mp = activeValue.modifierProduct
            const ruName = mp.name_ru || 'Сосисочный борт'
            const uzName = mp.name_uz || "Sosiskali bo'rt"
            const enName = mp.name_en || 'Sausage border'
            modifier.push({
              id: mp.id,
              name: ruName,
              name_ru: ruName,
              name_uz: uzName,
              name_en: enName,
              price: +mp.price - +activeValue.price,
              assets: [
                {
                  local: '/sausage_modifier.png',
                },
              ],
            })
          }
        }
      }
    } else {
      if (store.modifiers && store.modifiers.length) {
        modifier = store.modifiers
      }
    }

    if (modifier) {
      modifier = modifier.filter((m: any) => +m.price > 0)
      modifier.sort(function (a: any, b: any) {
        if (+a.price > +b.price) {
          return 1
        }
        if (+a.price < +b.price) {
          return -1
        }
        // a должно быть равным b
        return 0
      })
    }

    return modifier
  }, [store])

  const totalPrice = useMemo(() => {
    let price: number = parseInt(store.price, 0) || 0
    if (store.variants && store.variants.length > 0) {
      const activeValue: any = store.variants.find(
        (item: any) => item.active == true
      )
      if (activeValue) price += parseInt(activeValue.price, 0)
    }

    if (modifiers && modifiers.length) {
      modifiers.map((mod: any) => {
        if (activeModifiers.includes(mod.id)) {
          price += mod.price
        }
      })
    }

    if (
      locationData &&
      configData.discount_end_date &&
      locationData.deliveryType == 'pickup' &&
      locationData.terminal_id &&
      configData.discount_catalog_sections
        .split(',')
        .map((i: string) => +i)
        .includes(store.category_id)
    ) {
      if (DateTime.now().toFormat('E') != configData.discount_disable_day) {
        if (DateTime.now() <= DateTime.fromSQL(configData.discount_end_date)) {
          if (configData.discount_value) {
            price = price * ((100 - configData.discount_value) / 100)
          }
        }
      }
    }

    return price
  }, [
    store.price,
    store.variants,
    modifiers,
    activeModifiers,
    locationData,
    configData,
  ])

  const isProductInStop = useMemo(() => {
    if (store.variants && store.variants.length) {
      let selectedVariant = store.variants.find((v: any) => v.active == true)
      let selectedProdId = selectedVariant.id
      if (stopProducts.includes(selectedProdId)) {
        return true
      }
    } else {
      let selectedProdId = +store.id
      if (stopProducts.includes(selectedProdId)) {
        return true
      }
    }
    return false
  }, [stopProducts, store])

  const prodPriceDesktop = useMemo(() => {
    let price: number = parseInt(store.price, 0) || 0
    if (store.variants && store.variants.length > 0) {
      const activeValue: any = store.variants.find(
        (item: any) => item.active == true
      )
      if (activeValue) price += parseInt(activeValue.price, 0)
    }
    if (
      locationData &&
      configData.discount_end_date &&
      locationData.deliveryType == 'pickup' &&
      locationData.terminal_id &&
      configData.discount_catalog_sections
        .split(',')
        .map((i: string) => +i)
        .includes(store.category_id)
    ) {
      if (DateTime.now().toFormat('E') != configData.discount_disable_day) {
        if (DateTime.now() <= DateTime.fromSQL(configData.discount_end_date)) {
          if (configData.discount_value) {
            price = price * ((100 - configData.discount_value) / 100)
          }
        }
      }
    }

    return price
  }, [store.price, store.variants, locationData, configData])

  const prodDiscountPriceDesktop = useMemo(() => {
    let price: number = parseInt(store.price, 0) || 0
    if (store.variants && store.variants.length > 0) {
      const activeValue: any = store.variants.find(
        (item: any) => item.active == true
      )
      if (activeValue) price += parseInt(activeValue.price, 0)
    }

    if (
      locationData &&
      configData.discount_end_date &&
      locationData.deliveryType == 'pickup' &&
      locationData.terminal_id &&
      configData.discount_catalog_sections
        .split(',')
        .map((i: string) => +i)
        .includes(store.category_id)
    ) {
      if (DateTime.now().toFormat('E') != configData.discount_disable_day) {
        if (DateTime.now() <= DateTime.fromSQL(configData.discount_end_date)) {
          if (configData.discount_value) {
            return price * (configData.discount_value / 100)
          }
        }
      }
    }
    return 0
  }, [store.price, store.variants, locationData, configData])

  const handleSubmit = async (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault() // prevent the page location from changing
    // setAddToCartInProgress(true) // disable the add to cart button until the request is finished
    if (modifiers && modifiers.length) {
      if (isProductInStop) {
        return // if the product is in stop, do not add to basket
      }
      setIsChoosingModifier(true)
    } else {
      addToBasket()
    }
  }
  // console.log(modifiers)
  return (
    <>
      {isChoosingModifier ? (
        <div
          className="items-center bg-white justify-between relative flex flex-col px-6 py-4 rounded-[15px] shadow-lg"
          id={`prod-${store.id}`}
        >
          {isLoadingBasket && (
            <div className="h-full w-full absolute flex items-center justify-around bg-gray-300 top-0 bg-opacity-60">
              <svg
                className="animate-spin text-yellow h-14"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          )}
          <div className="absolute right-2">
            <XIcon
              className="cursor-pointer h-4 text-black w-4"
              onClick={() => setIsChoosingModifier(false)}
            />
          </div>
          <div className="border-b border-yellow pb-3 text-center text-xl w-full">
            {t('Добавить')}
          </div>
          <div className="max-h-96 overflow-y-auto py-5 space-y-2 w-full">
            {modifiers &&
              modifiers.map((mod: any) => (
                <div
                  key={mod.id}
                  className={`border ${
                    activeModifiers.includes(mod.id)
                      ? 'border-yellow border-2 shadow-md'
                      : 'border-gray-300'
                  } flex items-center justify-between overflow-hidden rounded-[15px] cursor-pointer`}
                  onClick={() => addModifier(mod.id)}
                >
                  <div className="px-2">
                    <img
                      src={getAssetUrl(mod.assets)}
                      width={50}
                      height={50}
                      alt={mod.name}
                      className="mx-auto"
                      loading="lazy"
                    />
                  </div>
                  <div className="text-center text-base m-auto">
                    <div>
                      {locale == 'uz' ? mod.name_uz : ''}
                      {locale == 'ru' ? mod.name_ru : ''}
                      {locale == 'en' ? mod.name_en : ''}
                    </div>

                    <div className={`font-bold text-center text-sm`}>
                      {currency(mod.price, {
                        pattern: '# !',
                        separator: ' ',
                        decimal: '.',
                        symbol: `${locale == 'uz' ? "so'm" : ''} ${
                          locale == 'ru' ? 'сум' : ''
                        } ${locale == 'en' ? 'sum' : ''}`,
                        precision: 0,
                      }).format()}
                    </div>
                  </div>
                </div>
              ))}
          </div>
          <div className="mx-auto">
            <button
              className="bg-yellow focus:outline-none font-bold outline-none px-10 py-2 rounded-full text-center text-white uppercase"
              onClick={addToBasket}
            >
              {t('Добавить')}
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`${styles.gridItemOutline} relative overflow-hidden bg-white rounded-[20px] md:rounded-[15px] hover:shadow-xl shadow-sm group md:py-3 md:px-3 flex flex-col h-full`}
          id={`prod-${store.id}`}
          itemScope
          itemType="https://schema.org/Product"
          aria-disabled={isProductInStop || undefined}
        >
          {/* Mobile horizontal card (image-left, text-right, drawer on tap) */}
          <div className="md:hidden">
            <button
              type="button"
              className="w-full flex items-stretch gap-3 p-3 text-left"
              onClick={() => {
                if (isProductInStop) {
                  toast.error(t('Товар временно недоступен'))
                  return
                }
                openProductDrawer(store)
              }}
            >
              <div className="w-[110px] h-[110px] flex-shrink-0 flex items-center justify-center relative">
                {!imageLoaded && store.image && (
                  <div className="w-[110px] h-[110px] rounded-full bg-gray-100 animate-pulse" />
                )}
                {store.image ? (
                  <Image
                    src={store.image}
                    width={110}
                    height={110}
                    sizes="110px"
                    alt={
                      store?.attribute_data?.name[channelName][locale || 'ru']
                    }
                    className={`object-contain ${
                      imageLoaded ? '' : 'absolute opacity-0'
                    } ${isProductInStop ? 'grayscale opacity-60' : ''}`}
                    itemProp="image"
                    loading="lazy"
                    onLoad={() => setImageLoaded(true)}
                  />
                ) : (
                  <img
                    src="/no_photo.svg"
                    width={110}
                    height={110}
                    alt={
                      store?.attribute_data?.name[channelName][locale || 'ru']
                    }
                    className={isProductInStop ? 'grayscale opacity-60' : ''}
                    loading="lazy"
                  />
                )}
                {isProductInStop && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="bg-white/95 text-red-600 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full shadow-sm border border-red-100 whitespace-nowrap">
                      {t('Нет в наличии')}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                <div>
                  <div
                    className="font-bold text-base text-gray-900 line-clamp-2"
                    itemProp="name"
                  >
                    {store?.attribute_data?.name[channelName][locale || 'ru']}
                  </div>
                  {store?.attribute_data?.description?.[channelName]?.[
                    locale || 'ru'
                  ] && (
                    <div
                      className="mt-1 text-[12px] text-gray-500 line-clamp-2 product-desc-clamp"
                      dangerouslySetInnerHTML={{
                        __html:
                          store.attribute_data.description[channelName][
                            locale || 'ru'
                          ],
                      }}
                      itemProp="description"
                    />
                  )}
                </div>
                <div className="mt-2">
                  {isProductInStop ? (
                    <span
                      className="inline-block px-4 py-1.5 rounded-full text-sm font-bold"
                      style={{
                        backgroundColor: '#FEE2E2',
                        color: '#B91C1C',
                      }}
                    >
                      {t('Нет в наличии')}
                    </span>
                  ) : (
                    <span
                      className="inline-block px-4 py-1.5 rounded-full text-sm font-bold"
                      style={{
                        backgroundColor: '#FEF3C7',
                        color: '#B45309',
                      }}
                    >
                      {store.variants && store.variants.length > 1
                        ? locale === 'uz'
                          ? 'dan '
                          : locale === 'en'
                          ? 'from '
                          : 'от '
                        : ''}
                      {currency(prodPriceDesktop, {
                        pattern: '# !',
                        separator: ' ',
                        decimal: '.',
                        symbol:
                          locale === 'uz'
                            ? "so'm"
                            : locale === 'en'
                            ? 'sum'
                            : 'сум',
                        precision: 0,
                      }).format()}
                    </span>
                  )}
                </div>
              </div>
            </button>
          </div>
          {/* Desktop card */}
          <div className="hidden md:flex md:flex-col md:h-full">
          <Link href={`/${citySlug}/product/${store.id}`} prefetch={false} className="cursor-pointer">
            {/* Bottom-aligned image box. Sources have wildly different aspect
                ratios (square pizzas, vertical 1:3 bottles after server-side
                trim, small juice boxes). Using `fill` instead of width/height
                tells Next.js Image to preserve the source aspect ratio
                (passing width={250}/height={250} made the optimizer stretch
                everything into a 1:1 square — this was the actual root cause
                of bottles looking distorted). object-contain keeps the whole
                product visible; object-bottom plants every product on the
                same baseline regardless of its native height. */}
            <div className="relative h-[250px] w-full">
              {!imageLoaded && store.image && (
                <div className="absolute inset-x-0 bottom-0 mx-auto w-[250px] h-[250px] rounded-full bg-gray-100 animate-pulse" />
              )}
              {store.image ? (
                <Image
                  src={store.image}
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  alt={store?.attribute_data?.name[channelName][locale || 'ru']}
                  className={`object-contain object-bottom transform motion-safe:group-hover:scale-105 transition duration-500 ${imageLoaded ? '' : 'opacity-0'} ${isProductInStop ? 'grayscale opacity-60' : ''}`}
                  itemProp="image"
                  loading="lazy"
                  onLoad={() => setImageLoaded(true)}
                />
              ) : (
                <img
                  src="/no_photo.svg"
                  width={250}
                  height={250}
                  alt={store?.attribute_data?.name[channelName][locale || 'ru']}
                  className={`absolute inset-0 m-auto rounded-full transform motion-safe:group-hover:scale-105 transition duration-500 ${isProductInStop ? 'grayscale opacity-60' : ''}`}
                  loading="lazy"
                />
              )}
              {isProductInStop && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="bg-white/95 text-red-600 text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full shadow-md border border-red-100 whitespace-nowrap">
                    {t('Нет в наличии')}
                  </span>
                </div>
              )}
            </div>
            <div className="font-serif mt-4 text-xl uppercase" itemProp="name">
              {store?.attribute_data?.name[channelName][locale || 'ru']}
            </div>
          </Link>
          <div className="flex flex-col flex-grow w-full">
            {store.sizeDesc && (
              <div className="mt-2 text-gray-700 text-xs">{store.sizeDesc}</div>
            )}
            <div className="relative mt-1 flex-grow">
              {/* Видимый, всегда обрезанный текст. Hover именно по нему
                  (peer) — а не по всей карточке — чтобы tooltip не
                  всплывал при наведении на размеры/кнопку В корзину. */}
              <div
                className="peer product-desc-clamp cursor-help"
                dangerouslySetInnerHTML={{
                  __html: store?.attribute_data?.description
                    ? store?.attribute_data?.description[channelName][
                        locale || 'ru'
                      ]
                    : '',
                }}
                itemProp="description"
              />
              {/* Полный текст — tooltip ВВЕРХ от описания (bottom-full),
                  всплывает поверх изображения, а не кнопок снизу.
                  pointer-events-none, чтобы не блокировал клик по карточке.
                  На тачскринах скрыт через @media (hover: none). */}
              <div
                className="desc-tooltip pointer-events-none opacity-0 peer-hover:opacity-100 transition-opacity duration-150 absolute z-40 left-0 right-0 bottom-full mb-1 max-h-32 overflow-hidden px-3 py-2.5 bg-white rounded-xl shadow-xl ring-1 ring-gray-200 leading-snug text-gray-700"
                aria-hidden="true"
                dangerouslySetInnerHTML={{
                  __html: store?.attribute_data?.description
                    ? store?.attribute_data?.description[channelName][
                        locale || 'ru'
                      ]
                    : '',
                }}
              />
            </div>
            <div className="mt-auto">
              {store.variants && store.variants.length > 0 && (
                <div className="flex mt-5 space-x-1 -mx-2">
                  {store.variants.map((v: any) => {
                    const variantInStop = stopProducts.includes(v.id)
                    return (
                    <div className="w-full" key={v.id}>
                      <div
                        className={`w-full text-center cursor-pointer rounded-2xl outline-none ${
                          v.active
                            ? variantInStop
                              ? 'bg-gray-400 text-white'
                              : 'bg-yellow text-white'
                            : variantInStop
                              ? 'bg-gray-100 text-gray-400'
                              : 'bg-gray-200 text-gray-400'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation()
                          updateOptionSelection(v.id)
                        }}
                      >
                        <button
                          className="outline-none focus:outline-none text-xs py-2"
                          style={{
                            textDecoration:
                              variantInStop && !v.active ? 'line-through' : 'none',
                          }}
                        >
                          {locale == 'ru'
                            ? v?.custom_name
                            : locale == 'uz'
                            ? v?.custom_name_uz
                            : locale == 'en'
                            ? v?.custom_name_en
                            : ''}
                        </button>
                      </div>

                      {/* <div
                        className={` flex flex-col items-center w-full ${
                          v.active ? 'text-yellow' : ''
                        }`}
                      >
                        {(locale == 'ru' ? 'гр ' : 'gr ') + v.weight}
                      </div> */}
                    </div>
                    )
                  })}
                </div>
              )}
            </div>
            <div className="mt-10 flex justify-between items-center text-sm">
              <button
                className={`focus:outline-none ${
                  isProductInStop ? 'w-40 bg-gray-300' : 'w-32 bg-yellow'
                } justify-around font-bold outline-none py-2 rounded-full text-white uppercase inline-flex items-center disabled:cursor-not-allowed`}
                onClick={(e) => {
                  e.stopPropagation()
                  if (isProductInStop) {
                    toast.error(t('Товар временно недоступен'))
                    return
                  }
                  handleSubmit(e)
                }}
                disabled={isLoadingBasket || isProductInStop}
              >
                {isProductInStop ? (
                  t('Нет в наличии')
                ) : isLoadingBasket ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white flex-grow text-center"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  t('В корзину')
                )}
              </button>
              <div
                itemProp="offers"
                itemScope
                itemType="https://schema.org/Offer"
              >
                {/* schema.org/Offer needs numeric price + ISO currency.
                    The visible spans are formatted strings ("98 000 сум")
                    which Google rejects, hence the meta-tag mirror. */}
                <meta itemProp="price" content={String(prodPriceDesktop)} />
                <meta itemProp="priceCurrency" content="UZS" />
                <meta
                  itemProp="availability"
                  content={
                    isProductInStop
                      ? 'https://schema.org/OutOfStock'
                      : 'https://schema.org/InStock'
                  }
                />
                {prodDiscountPriceDesktop > 0 && (
                  <span className="text-sm bg-white block w-auto rounded-full text-xs text-left line-through px-0 py-0 text-gray-500">
                    {currency(prodPriceDesktop + prodDiscountPriceDesktop, {
                      pattern: '# !',
                      separator: ' ',
                      decimal: '.',
                      symbol: `${locale == 'uz' ? "so'm" : ''} ${
                        locale == 'ru' ? 'сум' : ''
                      } ${locale == 'en' ? 'sum' : ''}`,
                      precision: 0,
                    }).format()}
                  </span>
                )}
                <span
                  className={`text-xl md:text-2xl font-bold bg-white block w-auto rounded-full text-right px-0 py-0 whitespace-nowrap ${
                    isProductInStop ? 'text-gray-400' : 'text-black'
                  }`}
                >
                  {currency(prodPriceDesktop, {
                    pattern: '# !',
                    separator: ' ',
                    decimal: '.',
                    symbol: `${locale == 'uz' ? "so'm" : ''} ${
                      locale == 'ru' ? 'сум' : ''
                    } ${locale == 'en' ? 'sum' : ''}`,
                    precision: 0,
                  }).format()}
                </span>
              </div>
            </div>
          </div>
          </div>
              <Transition show={isOpen}>
                <Dialog
                  initialFocus={completeButtonRef}
                  as="div"
                  className="fixed inset-0 z-50 overflow-y-auto"
                  onClose={closeModal}
                >
                  <div className="flex items-end justify-center min-h-screen  text-center sm:block sm:p-0">
                    <TransitionChild
                      enter="ease-out duration-300"
                      enterFrom="opacity-0"
                      enterTo="opacity-100"
                      leave="ease-in duration-200"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <DialogBackdrop className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                    </TransitionChild>

                    {/* This element is to trick the browser into centering the modal contents. */}
                    <span
                      className="hidden sm:inline-block sm:align-middle sm:h-screen"
                      aria-hidden="true"
                    >
                      &#8203;
                    </span>
                    <TransitionChild
                      enter="ease-out duration-300"
                      enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                      enterTo="opacity-100 translate-y-0 sm:scale-100"
                      leave="ease-in duration-200"
                      leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                      leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    >
                      <div className="bg-white p-4 text-left transform w-full">
                        <div className="flex fixed w-full max-h-10 -ml-4 -mt-4 bg-white pt-8 pl-4 top-0 flex-col">
                          <div className="flex w-full items-center">
                            <span onClick={closeModal} className="flex">
                              <img
                                src="/assets/back.png"
                                width={24}
                                height={24}
                              />
                            </span>
                          </div>
                        </div>
                        <div className=" overflow-y-auto mt-6 overflow-hidden">
                          <div className=" mx-auto bg-cover flex relative mt-10">
                            {store.image ? (
                              <Image
                                src={store.image}
                                width={500}
                                height={500}
                                sizes="(max-width: 768px) 90vw, 500px"
                                alt={
                                  store?.attribute_data?.name[channelName][
                                    locale || 'ru'
                                  ]
                                }
                                className="mx-auto h-auto w-auto"
                              />
                            ) : (
                              <img
                                src="/no_photo.svg"
                                alt={
                                  store?.attribute_data?.name[channelName][
                                    locale || 'ru'
                                  ]
                                }
                                className="rounded-full mx-auto"
                              />
                            )}
                          </div>
                          <div className="font-black mt-4 text-xl">
                            {
                              store?.attribute_data?.name[channelName][
                                locale || 'ru'
                              ]
                            }
                          </div>
                          <div
                            className="mt-1 text-base product-desc-clamp"
                            dangerouslySetInnerHTML={{
                              __html: store?.attribute_data?.description
                                ? store?.attribute_data?.description[
                                    channelName
                                  ][locale || 'ru']
                                : '',
                            }}
                          ></div>
                          {store.variants && store.variants.length > 0 && (
                            <div className="flex mt-5 space-x-1">
                              {store.variants.map((v: any) => (
                                <div className="w-full" key={v.id}>
                                  <div
                                    className={`w-full text-center cursor-pointer rounded-2xl outline-none ${
                                      v.active
                                        ? 'bg-yellow text-white shadow-xl'
                                        : 'bg-gray-200 text-gray-600'
                                    }`}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      updateOptionSelection(v.id)
                                    }}
                                  >
                                    <button className="outline-none focus:outline-none text-xs py-2">
                                      {locale == 'ru'
                                        ? v?.custom_name
                                        : v?.custom_name_uz}
                                    </button>
                                  </div>
                                  {/* <div
                                    className={` flex flex-col items-center w-full ${
                                      v.active ? 'text-yellow' : ''
                                    }`}
                                  >
                                    {(locale == 'ru' ? 'гр ' : 'gr ') +
                                      v.weight}
                                  </div> */}
                                </div>
                              ))}
                            </div>
                          )}
                          {modifiers && (
                            <div className="pb-10">
                              <div className="my-2">
                                <span>{t('Добавить к пицце')}</span>
                              </div>
                              <div className="overflow-x-scroll">
                                <div className="-mr-20 flex space-x-2 pb-2">
                                  {modifiers.map((mod: any) => (
                                    <div
                                      key={mod.id}
                                      className={`border ${
                                        activeModifiers.length &&
                                        activeModifiers.includes(mod.id)
                                          ? 'border-yellow'
                                          : 'border-gray-300'
                                      } flex flex-col justify-between overflow-hidden rounded-[15px] cursor-pointer w-24`}
                                      onClick={() => addModifier(mod.id)}
                                    >
                                      <div className="flex-grow pt-2 px-2">
                                        <img
                                          src={getAssetUrl(mod.assets)}
                                          width={50}
                                          height={50}
                                          alt={mod.name}
                                          className="mx-auto"
                                        />
                                      </div>
                                      <div className="text-center text-xs">
                                        {locale == 'uz'
                                          ? mod.name_uz
                                          : mod.name}
                                      </div>
                                      <div
                                        className={`${
                                          activeModifiers.length &&
                                          activeModifiers.includes(mod.id)
                                            ? 'bg-yellow'
                                            : 'bg-gray-300'
                                        } font-bold px-2 py-2 text-center text-white text-xs`}
                                      >
                                        {currency(mod.price, {
                                          pattern: '# !',
                                          separator: ' ',
                                          decimal: '.',
                                          symbol: `${
                                            locale == 'uz' ? "so'm" : ''
                                          } ${locale == 'ru' ? 'сум' : ''} ${
                                            locale == 'en' ? 'sum' : ''
                                          }`,
                                          precision: 0,
                                        }).format()}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="bg-white flex items-center px-3 py-5 w-full sticky bottom-0">
                          <button
                            className="bg-yellow flex items-center justify-around focus:outline-none font-bold outline-none py-2 rounded-full text-center text-white w-full"
                            onClick={addToBasket}
                          >
                            {isLoadingBasket ? (
                              <svg
                                className="animate-spin h-5 w-5 text-white flex-grow text-center"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                            ) : (
                              <span>
                                {t('В корзину')}{' '}
                                {currency(totalPrice, {
                                  pattern: '# !',
                                  separator: ' ',
                                  decimal: '.',
                                  symbol: `${locale == 'uz' ? "so'm" : ''} ${
                                    locale == 'ru' ? 'сум' : ''
                                  } ${locale == 'en' ? 'sum' : ''}`,
                                  precision: 0,
                                }).format()}
                              </span>
                            )}
                          </button>
                        </div>
                      </div>
                    </TransitionChild>
                  </div>
                </Dialog>
              </Transition>
        </div>
      )}
    </>
  )
}

export default memo(ProductItemNewApp)
