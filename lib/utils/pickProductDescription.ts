/**
 * Single source of truth for rendering product descriptions.
 *
 * Backend stores `attribute_data.description[channel][locale]` in two shapes,
 * depending on which admin wrote it:
 *   1. WYSIWYG HTML — `<p>Состав:</p><p>Пепперони (25 см)</p>...` (~90% of rows)
 *   2. Plain text with literal newlines — `"Quvvat 25\nДонар 25\n..."`
 *
 * Rendering the raw value through `dangerouslySetInnerHTML` handles (1) but
 * silently collapses (2): HTML ignores bare `\n`, so a 3-line composition ends
 * up as one run-on line on the catalog card. Rendering it as a text node fixes
 * (2) but leaks visible `<p>` tags for (1).
 *
 * So we normalize both shapes down to plain text with real newlines, and every
 * surface renders that text node with `white-space: pre-line`. Line breaks then
 * look identical on cards, modals, drawers and mini-apps.
 *
 * Note: this deliberately drops inline styling (`<span style="color:...">`) —
 * the storefront has its own typography and the colors were never intentional.
 */

const ENTITIES: [RegExp, string][] = [
  [/&nbsp;/gi, ' '],
  [/&lt;/gi, '<'],
  [/&gt;/gi, '>'],
  [/&quot;/gi, '"'],
  [/&#0?39;/gi, "'"],
  [/&apos;/gi, "'"],
  [/&amp;/gi, '&'],
]

/**
 * HTML (or plain text) -> plain text with `\n` at every intended line break.
 * Safe to call with undefined/null; always returns a string.
 */
export function normalizeDescription(raw?: string | null): string {
  if (!raw) return ''

  let out = String(raw)
    // block boundaries become line breaks before tags are stripped
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|tr|h[1-6]|blockquote)\s*>/gi, '\n')
    // everything else is presentational — drop it
    .replace(/<[^>]+>/g, ' ')

  for (const [re, to] of ENTITIES) out = out.replace(re, to)

  return out
    .replace(/\r\n?/g, '\n')
    // collapse runs of horizontal whitespace only — never newlines
    .replace(/[ \t\u00a0\u2000-\u200b\ufeff]+/g, ' ')
    .replace(/[ \t]*\n[ \t]*/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * Safely extract a product's localized description and normalize it.
 * Mirrors `pickProductName`: never throws on incomplete product shapes, falls
 * back to the channel's `ru` value, then to flat `description` / `desc`.
 */
export function pickProductDescription(
  product: any,
  channelName: string,
  locale?: string
): string {
  const m = product?.attribute_data?.description?.[channelName]
  const raw =
    m?.[locale || 'ru'] ||
    m?.['ru'] ||
    product?.description ||
    product?.desc ||
    ''
  return normalizeDescription(raw)
}
