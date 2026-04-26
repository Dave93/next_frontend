// Adapter: SlimMenu shape -> "legacy raw" shape that existing client
// components (ProductItemNewApp, ThreePizzaApp, CategoriesMenuApp,
// CreateYourPizzaCommonApp) consume.
//
// We only fill the locale used for the slim payload. Other-locale fields
// are mirrored to the same value so that legacy lookups
// `attribute_data.name[channelName][locale]` always hit a string.

import type { SlimMenu, SlimSection, SlimProduct, SlimVariant } from './menu-dto'

const CHANNEL = 'chopar'

function nameMap(text: string | undefined): any {
  const safe = text ?? ''
  return {
    [CHANNEL]: { ru: safe, uz: safe, en: safe },
  }
}

function descMap(text: string | undefined): any {
  if (!text) return undefined
  return {
    [CHANNEL]: { ru: text, uz: text, en: text },
  }
}

function legacyVariant(v: SlimVariant): any {
  return {
    id: v.id,
    price: typeof v.price === 'number' ? v.price.toString() : v.price,
    weight: v.weight ?? 0,
    active: false,
    attribute_data: {
      name: nameMap(v.name),
      description: descMap(v.description),
    },
    custom_name: v.name,
    custom_name_uz: v.name,
    custom_name_en: v.name,
    modifiers: (v.modifiers || []).map(legacyModifier),
  }
}

function legacyModifier(m: any): any {
  return {
    id: m.id,
    name: m.name,
    name_uz: m.name,
    name_en: m.name,
    name_ru: m.name,
    price: m.price,
    weight: m.weight ?? 0,
    groupId: m.groupId,
    assets: m.image
      ? [
          {
            location: '',
            filename: '',
          },
        ]
      : [],
  }
}

export function legacyProduct(p: SlimProduct): any {
  const variants = (p.variants || []).map(legacyVariant)
  // Mark variant index 1 active (legacy default), or 0 if only one
  if (variants.length) {
    const idx = variants.length > 1 ? 1 : 0
    variants[idx].active = true
  }
  return {
    id: p.id,
    image: p.image,
    asset: p.image
      ? {
          location: '',
          filename: '',
        }
      : null,
    weight: p.weight ?? 0,
    price: typeof p.price === 'number' ? p.price.toString() : p.price,
    half_mode: 0,
    threesome: p.threesome ? 1 : 0,
    custom_name: p.name,
    custom_name_uz: p.name,
    custom_name_en: p.name,
    attribute_data: {
      name: nameMap(p.name),
      description: descMap(p.description),
    },
    variants,
    modifiers: (p.modifiers || []).map(legacyModifier),
    items: undefined,
  }
}

export function legacyCategory(s: SlimSection): any {
  return {
    id: s.id,
    half_mode: s.halfMode ? 1 : 0,
    three_sale: s.threeSale ? 1 : 0,
    icon: s.icon,
    desc: s.description,
    desc_uz: s.description,
    desc_en: s.description,
    attribute_data: {
      name: nameMap(s.name),
    },
    items: s.items.map(legacyProduct),
  }
}

export function legacyMenu(menu: SlimMenu): any[] {
  return menu.sections.map(legacyCategory)
}
