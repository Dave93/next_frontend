import React, { useEffect, useMemo, useState } from 'react'
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from 'next'
import { useRouter } from 'next/router'
import Image from 'next/image'
import Link from 'next/link'
import commerce from '@lib/api/commerce'
import { Layout } from '@components/common'
import useTranslation from 'next-translate/useTranslation'
import axios from 'axios'
import Cookies from 'js-cookie'
import cookies from 'next-cookies'
import Hashids from 'hashids'
import currency from 'currency.js'
import { useCart } from '@framework/cart'
import { useUI } from '@components/ui/context'
import defaultChannel from '@lib/defaultChannel'
import { NextSeo } from 'next-seo'
import { DateTime } from 'luxon'
import getAssetUrl from '@utils/getAssetUrl'

let webAddress = process.env.NEXT_PUBLIC_API_URL
axios.defaults.withCredentials = true

export async function getServerSideProps({
  preview,
  locale,
  locales,
  query,
  params,
  ...context
}: GetServerSidePropsContext) {
  const c = cookies(context)
  const config = {
    locale,
    locales,
    queryParams: { ...query, city: c.city_slug },
    city: c.city_slug,
  }

  const productsPromise = commerce.getAllProducts({
    variables: { first: 6 },
    config,
    preview,
    ...({ featured: true } as any),
  })
  const siteInfoPromise = commerce.getSiteInfo({ config, preview })

  const { products }: { products: any[] } = await productsPromise

  const productId = params?.id

  let product = null
  for (const section of products) {
    if (section.items && section.items.length) {
      const found = section.items.find(
        (item: any) => String(item.id) === String(productId)
      )
      if (found) {
        product = found
        break
      }
    }
  }

  if (!product) {
    return { notFound: true }
  }

  const {
    categories,
    brands,
    topMenu,
    footerInfoMenu,
    socials,
    cities,
    currentCity,
  } = await siteInfoPromise

  return {
    props: {
      product,
      categories: categories || null,
      brands: brands || null,
      topMenu: topMenu || null,
      footerInfoMenu: footerInfoMenu || null,
      socials: socials || null,
      cities: cities || null,
      currentCity: currentCity || null,
    },
  }
}

export default function ProductPage({
  product,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter()
  const { locale } = router
  const { t: tr } = useTranslation('common')
  const { data: cartData, mutate } = useCart()
  const { stopProducts, locationData, activeCity, cities } = useUI()
  const chosenCity = activeCity || (cities && cities[0]) || null

  const [channelName, setChannelName] = useState('chopar')
  const [store, setStore] = useState(product)
  const [isLoadingBasket, setIsLoadingBasket] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const [activeModifiers, setActiveModifiers] = useState([] as number[])
  const [configData, setConfigData] = useState({} as any)

  const hashids = useMemo(
    () => new Hashids('basket', 15, 'abcdefghijklmnopqrstuvwxyz1234567890'),
    []
  )

  // Effective product ID: changes based on variant + modifierProduct selection
  const effectiveProductId = useMemo(() => {
    const activeVariant = store?.variants?.find((v: any) => v.active)
    if (!activeVariant) return String(store?.id || '')
    // If sausage board modifier is selected, the product ID becomes modifierProduct.id
    if (
      activeVariant.modifierProduct &&
      activeModifiers.includes(activeVariant.modifierProduct.id)
    ) {
      return String(activeVariant.modifierProduct.id)
    }
    return String(activeVariant.id)
  }, [store, activeModifiers])

  const cartLineItem = useMemo(() => {
    if (!cartData?.lineItems?.length || !effectiveProductId) return null
    return cartData.lineItems.find((item: any) => {
      return (
        String(item.variant?.id) === effectiveProductId ||
        String(item.variant?.product?.id) === effectiveProductId ||
        String(item.variant?.product_id) === effectiveProductId
      )
    })
  }, [cartData, effectiveProductId])

  const cartQuantity = cartLineItem?.quantity || 0

  const changeCartQuantity = async (delta: number) => {
    if (!cartLineItem) return
    setIsLoadingBasket(true)
    const lineIdEncoded = hashids.encode(cartLineItem.id)
    if (delta > 0) {
      await axios.post(`${webAddress}/api/v1/basket-lines/${lineIdEncoded}/add`, { quantity: 1 })
    } else {
      if (cartLineItem.quantity <= 1) {
        await axios.delete(`${webAddress}/api/basket-lines/${lineIdEncoded}`)
      } else {
        await axios.put(`${webAddress}/api/v1/basket-lines/${lineIdEncoded}/remove`, { quantity: 1 })
      }
    }
    await mutate()
    setIsLoadingBasket(false)
  }

  const getChannel = async () => {
    const channelData = await defaultChannel()
    setChannelName(channelData.name)
  }

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

  useEffect(() => {
    getChannel()
    fetchConfig()
  }, [])

  useEffect(() => {
    if (product) {
      const p = { ...product }
      const variantFromQuery = router.query.variant
      if (p.variants && p.variants.length) {
        p.variants = p.variants.map((v: any, index: number) => {
          if (variantFromQuery) {
            v.active = v.id == variantFromQuery
          } else {
            v.active = index === 1 || (p.variants.length === 1 && index === 0)
          }
          return v
        })
      }
      setStore(p)
    }
  }, [product])

  const updateOptionSelection = (valueId: string) => {
    const prod = { ...store }
    if (prod.variants) {
      prod.variants = prod.variants.map((v: any) => {
        v.active = v.id == valueId
        return v
      })
    }
    setActiveModifiers([])
    setStore(prod)
  }

  const addModifier = (modId: number) => {
    let modifierProduct: any = null
    if (store.variants && store.variants.length) {
      const activeValue: any = store.variants.find(
        (item: any) => item.active == true
      )
      if (activeValue?.modifierProduct) {
        modifierProduct = activeValue.modifierProduct
      }
    }
    if (activeModifiers.includes(modId)) {
      let currentModifier: any = modifiers?.find((mod: any) => mod.id == modId)
      if (!currentModifier) return
      if (currentModifier.price == 0) return
      let resultModifiers = [
        ...activeModifiers.filter((id) => modId != id),
      ].filter((id) => id)
      setActiveModifiers(resultModifiers)
    } else {
      let currentModifier: any = modifiers?.find((mod: any) => mod.id == modId)
      let selectedModifiers = [...activeModifiers, modId]

      if (modifierProduct) {
        let sausage = modifiers?.find((mod: any) => mod.id == modifierProduct.id)
        if (
          sausage &&
          selectedModifiers.includes(modifierProduct.id) &&
          sausage.price < currentModifier.price
        ) {
          selectedModifiers = [
            ...selectedModifiers.filter((id: any) => id != sausage.id),
          ]
        } else if (sausage && currentModifier.id == sausage.id) {
          let richerModifier = (modifiers || [])
            .filter((mod: any) => mod.price > sausage.price)
            .map((mod: any) => mod.id)
          selectedModifiers = [
            ...selectedModifiers.filter(
              (id: any) => !richerModifier.includes(id)
            ),
            modId,
          ]
        }
      }
      setActiveModifiers(selectedModifiers)
    }
  }

  const setCredentials = async () => {
    let csrf = Cookies.get('X-XSRF-TOKEN')
    if (!csrf) {
      const csrfReq = await axios(`${webAddress}/api/keldi`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          crossDomain: true,
        },
        withCredentials: true,
      })
      let { data: res } = csrfReq
      csrf = Buffer.from(res.result, 'base64').toString('ascii')
      var inTenMinutes = new Date(new Date().getTime() + 10 * 60 * 1000)
      Cookies.set('X-XSRF-TOKEN', csrf, { expires: inTenMinutes })
    }
    axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrf
    axios.defaults.headers.common['XCSRF-TOKEN'] = csrf
  }

  const addToBasket = async () => {
    setIsLoadingBasket(true)
    await setCredentials()

    let selectedProdId = 0
    let modifierProduct: any = null
    let selectedModifiers: any = null

    if (store.variants && store.variants.length) {
      let selectedVariant = store.variants.find((v: any) => v.active == true)
      selectedProdId = selectedVariant.id
      if (selectedVariant.modifierProduct) {
        modifierProduct = selectedVariant.modifierProduct
      }

      if (activeModifiers.length && modifierProduct && activeModifiers.includes(modifierProduct.id)) {
        selectedProdId = modifierProduct.id
        let currentProductModifiersPrices = [
          ...(modifiers || [])
            .filter(
              (mod: any) =>
                mod.id != modifierProduct.id && activeModifiers.includes(mod.id)
            )
            .map((mod: any) => mod.price),
        ]
        selectedModifiers = modifierProduct.modifiers
          .filter((mod: any) =>
            currentProductModifiersPrices.includes(mod.price)
          )
          .map((m: any) => ({ id: m.id }))
      } else if (modifiers && activeModifiers.length) {
        selectedModifiers = modifiers
          .filter((m: any) => activeModifiers.includes(m.id))
          .map((m: any) => ({ id: m.id }))
      }
    } else {
      selectedProdId = +store.id
      if (modifiers && activeModifiers.length) {
        selectedModifiers = modifiers
          .filter((m: any) => activeModifiers.includes(m.id))
          .map((m: any) => ({ id: m.id }))
      }
    }

    if (isProductInStop) {
      setIsLoadingBasket(false)
      return
    }

    let basketId = localStorage.getItem('basketId')
    const otpToken = Cookies.get('opt_token')

    let additionalQuery = ''
    if (locationData && locationData.deliveryType == 'pickup') {
      additionalQuery = `?delivery_type=pickup`
    }

    let basketResult = {}

    if (basketId) {
      const { data: basketData } = await axios.post(
        `${webAddress}/api/baskets-lines${additionalQuery}`,
        {
          basket_id: basketId,
          variants: [
            {
              id: selectedProdId,
              quantity: 1,
              modifiers: selectedModifiers,
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${otpToken}`,
          },
          withCredentials: true,
        }
      )
      basketResult = {
        id: basketData.data.id,
        createdAt: '',
        currency: { code: basketData.data.currency },
        taxesIncluded: basketData.data.tax_total,
        lineItems: basketData.data.lines,
        lineItemsSubtotalPrice: basketData.data.sub_total,
        subtotalPrice: basketData.data.sub_total,
        totalPrice: basketData.data.total,
      }
    } else {
      const { data: basketData } = await axios.post(
        `${webAddress}/api/baskets${additionalQuery}`,
        {
          variants: [
            {
              id: selectedProdId,
              quantity: 1,
              modifiers: selectedModifiers,
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${otpToken}`,
          },
          withCredentials: true,
        }
      )
      localStorage.setItem('basketId', basketData.data.encoded_id)
      basketResult = {
        id: basketData.data.id,
        createdAt: '',
        currency: { code: basketData.data.currency },
        taxesIncluded: basketData.data.tax_total,
        lineItems: basketData.data.lines,
        lineItemsSubtotalPrice: basketData.data.sub_total,
        subtotalPrice: basketData.data.sub_total,
        totalPrice: basketData.data.total,
        discountTotal: basketData.data.discount_total,
        discountValue: basketData.data.discount_value,
      }
    }

    await mutate()
    setIsLoadingBasket(false)
  }

  const modifiers = useMemo(() => {
    let modifier = null
    if (store?.variants && store.variants.length) {
      const activeValue: any = store.variants.find(
        (item: any) => item.active == true
      )
      if (activeValue && activeValue.modifiers) {
        modifier = [...activeValue.modifiers]
        if (activeValue.modifierProduct) {
          let isExist = modifier.find(
            (mod: any) => mod.id == activeValue.modifierProduct.id
          )
          if (!isExist) {
            modifier.push({
              id: activeValue.modifierProduct.id,
              name: 'Сосисочный борт',
              name_uz: "Sosiskali bo'rt",
              name_en: 'Sausage border',
              price: +activeValue.modifierProduct.price - +activeValue.price,
              assets: [{ local: '/sausage_modifier.png' }],
            })
          }
        }
      }
    } else {
      if (store?.modifiers && store.modifiers.length) {
        modifier = [...store.modifiers]
      }
    }
    if (modifier) {
      modifier.sort((a: any, b: any) => +a.price - +b.price)
    }
    return modifier
  }, [store])

  const totalPrice = useMemo(() => {
    let price: number = parseInt(store?.price, 0) || 0
    if (store?.variants && store.variants.length > 0) {
      const activeValue: any = store.variants.find(
        (item: any) => item.active == true
      )
      if (activeValue) price += parseInt(activeValue.price, 0)
    }
    if (modifiers && modifiers.length) {
      modifiers.forEach((mod: any) => {
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
        ?.split(',')
        .map((i: string) => +i)
        .includes(store?.category_id)
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
  }, [store, modifiers, activeModifiers, locationData, configData])

  const isProductInStop = useMemo(() => {
    if (store?.variants && store.variants.length) {
      let selectedVariant = store.variants.find((v: any) => v.active == true)
      if (selectedVariant && stopProducts.includes(selectedVariant.id)) {
        return true
      }
    } else {
      if (stopProducts.includes(+store?.id)) {
        return true
      }
    }
    return false
  }, [stopProducts, store])

  const productName =
    store?.attribute_data?.name?.[channelName]?.[locale || 'ru'] || ''
  const productDesc =
    store?.attribute_data?.description?.[channelName]?.[locale || 'ru'] || ''

  const currencySymbol =
    locale == 'uz' ? "so'm" : locale == 'ru' ? 'сум' : 'sum'

  const formatPrice = (price: number) =>
    currency(price, {
      pattern: '# !',
      separator: ' ',
      decimal: '.',
      symbol: currencySymbol,
      precision: 0,
    }).format()

  if (!store) return null

  return (
    <>
      <NextSeo title={productName} description={productDesc} />
      <div className="container mx-auto px-4 py-10">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-500 hover:text-gray-700"
          >
            <img src="/assets/back.png" width="24" height="24" alt="back" />
          </button>
        </div>

        <div
          className={`bg-white rounded-[15px] shadow-lg p-6 md:p-10 ${
            isProductInStop ? 'opacity-25' : ''
          }`}
          itemScope
          itemType="https://schema.org/Product"
        >
          <div className="grid md:grid-cols-2 gap-10">
            {/* Image */}
            <div className="flex items-center justify-center">
              {store.image ? (
                <img
                  src={store.image}
                  alt={productName}
                  className="max-w-full h-auto object-cover max-h-[250px] md:max-h-[500px]"
                  itemProp="image"
                />
              ) : (
                <img
                  src="/no_photo.svg"
                  alt={productName}
                  className="max-w-full h-auto rounded-full max-h-[250px] md:max-h-[500px]"
                />
              )}
            </div>

            {/* Details */}
            <div className="flex flex-col">
              <h1
                className="font-serif text-2xl md:text-3xl uppercase"
                itemProp="name"
              >
                {productName}
              </h1>

              {store.sizeDesc && (
                <div className="mt-2 text-gray-700 text-sm">
                  {store.sizeDesc}
                </div>
              )}

              <div
                className="mt-3 text-gray-600 flex-grow"
                dangerouslySetInnerHTML={{ __html: productDesc }}
                itemProp="description"
              />

              {/* Variants */}
              {store.variants && store.variants.length > 0 && (
                <div className="flex mt-6 space-x-2">
                  {store.variants.map((v: any) => (
                    <div className="w-full" key={v.id}>
                      <div
                        className={`w-full text-center cursor-pointer rounded-2xl outline-none py-2 text-sm ${
                          v.active
                            ? 'bg-yellow text-white'
                            : 'bg-gray-200 text-gray-400'
                        }`}
                        onClick={() => updateOptionSelection(v.id)}
                      >
                        {locale == 'ru'
                          ? v?.custom_name
                          : locale == 'uz'
                          ? v?.custom_name_uz
                          : locale == 'en'
                          ? v?.custom_name_en
                          : ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Modifiers */}
              {modifiers && modifiers.length > 0 && (
                <div className="mt-6">
                  <div className="text-lg font-semibold mb-3">
                    {tr('add_to_pizza')}
                  </div>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                    {modifiers.map((mod: any) => (
                      <div
                        key={mod.id}
                        className={`border ${
                          activeModifiers.includes(mod.id)
                            ? 'border-yellow border-2 shadow-md'
                            : 'border-gray-300'
                        } flex flex-col items-center overflow-hidden rounded-[15px] cursor-pointer p-2`}
                        onClick={() => addModifier(mod.id)}
                      >
                        <div className="mb-1">
                          <img
                            src={getAssetUrl(mod.assets)}
                            width={50}
                            height={50}
                            alt={mod.name}
                            className="mx-auto"
                          />
                        </div>
                        <div className="text-center text-xs">
                          {locale == 'uz' ? mod.name_uz : ''}
                          {locale == 'ru' ? mod.name_ru || mod.name : ''}
                          {locale == 'en' ? mod.name_en : ''}
                        </div>
                        <div className="font-bold text-center text-xs mt-1">
                          {formatPrice(mod.price)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Price & Add to basket */}
              <div className="mt-8 flex items-center justify-between">
                <div
                  className="text-2xl font-bold"
                  itemProp="offers"
                  itemScope
                  itemType="https://schema.org/Offer"
                >
                  <span itemProp="price">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex items-center gap-3">
                  {cartQuantity > 0 ? (
                    <>
                      <div
                        className={`flex items-center rounded-full py-1 px-1 min-w-[160px] h-[48px] transition-opacity ${
                          isLoadingBasket ? 'opacity-50 pointer-events-none' : ''
                        }`}
                        style={{ backgroundColor: '#F9B004' }}
                      >
                        <button
                          className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl font-bold"
                          style={{ color: '#F9B004' }}
                          disabled={isLoadingBasket}
                          onClick={() => changeCartQuantity(-1)}
                        >
                          −
                        </button>
                        <span className="flex-1 text-center text-white font-bold text-lg">
                          {cartQuantity}
                        </span>
                        <button
                          className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl font-bold"
                          style={{ color: '#F9B004' }}
                          disabled={isLoadingBasket}
                          onClick={() => changeCartQuantity(1)}
                        >
                          +
                        </button>
                      </div>
                      <Link
                        href={`/${chosenCity?.slug || ''}/cart`}
                        prefetch={false}
                        className="bg-yellow focus:outline-none outline-none w-[48px] h-[48px] rounded-full text-white flex items-center justify-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                        </svg>
                      </Link>
                    </>
                  ) : (
                    <button
                      className={`bg-yellow focus:outline-none font-bold outline-none px-10 py-3 rounded-full text-white uppercase flex items-center justify-center min-w-[200px] transition-opacity ${
                        isLoadingBasket ? 'opacity-50 pointer-events-none' : ''
                      }`}
                      onClick={addToBasket}
                      disabled={isLoadingBasket || isProductInStop}
                    >
                      {isLoadingBasket ? (
                        <svg
                          className="animate-spin h-5 w-5 text-white"
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
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                      ) : (
                        tr('main_to_basket')
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

ProductPage.Layout = Layout
