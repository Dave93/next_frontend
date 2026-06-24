const SEP = ' + '

/**
 * Joins the localized names of a multi-half pizza (50/50) and collapses a
 * trailing add-on that every half repeats.
 *
 * Backend "modifier-as-product" variants bake the add-on into the product
 * name itself — e.g. the sausage-crust variant of "Грибная 40" is named
 * "Грибная 40 + Сосисочный борт". For a 50/50 pizza the constructor swaps
 * BOTH halves to their crust variant, so naively joining the halves repeats
 * the crust:
 *   "Ханская 40 + Сосисочный борт + Комбо 40 + Сосисочный борт"   ← DAV-633
 *
 * When every segment shares the same trailing " + X", emit X once at the end:
 *   "Ханская 40 + Комбо 40 + Сосисочный борт"
 *
 * Locale-agnostic by design — the crust suffix differs per locale
 * (ru "Сосисочный борт" / uz "sosiskali bo'rt" / en "Sausage crust"), so we
 * compare the trailing segment instead of matching hardcoded strings.
 * Conservative: if the halves don't all share the same trailing segment
 * (e.g. only one half has a crust), nothing is collapsed.
 */
export function composeHalfPizzaName(
  names: (string | undefined | null)[]
): string {
  const parts = names.map((n) => String(n ?? '').trim()).filter(Boolean)
  if (parts.length <= 1) return parts.join(SEP)

  const split = parts.map((n) => n.split(SEP))
  const lastOf = (segs: string[]) => segs[segs.length - 1]
  const suffix = lastOf(split[0])
  const allShareSuffix = split.every(
    (segs) => segs.length > 1 && lastOf(segs) === suffix
  )

  if (!allShareSuffix) return parts.join(SEP)

  const bases = split.map((segs) => segs.slice(0, -1).join(SEP))
  return `${bases.join(SEP)}${SEP}${suffix}`
}
