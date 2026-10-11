import type { CanvasStyle } from 'eureka-canvas'
import type { LocaleCode } from './locales'

// `system-ui` follows the OS language rather than the page's, so no stack names it. A face listed
// ahead of the Japanese ones must hold no kana or kanji, or it takes the Japanese text.
export const FONT_STACKS: Partial<Record<LocaleCode, readonly string[]>> = {
  ja: [
    'ui-sans-serif',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Hiragino Sans"',
    '"Hiragino Kaku Gothic ProN"',
    '"Yu Gothic UI"',
    'Meiryo',
    '"Noto Sans CJK JP"',
    '"Noto Sans JP"',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
    '"Noto Color Emoji"',
  ],
}

export function fontFamily(locale: LocaleCode): string | undefined {
  return FONT_STACKS[locale]?.join(', ')
}

export function fontRules(): Record<string, { fontFamily: string }> {
  return Object.fromEntries(
    Object.entries(FONT_STACKS).map(([locale, stack]) => [
      `[lang|="${locale}"]`,
      { fontFamily: stack.join(', ') },
    ])
  )
}

export function canvasStyleFor(locale: LocaleCode): CanvasStyle | undefined {
  const family = fontFamily(locale)
  return family ? { text: { fontFamily: family } } : undefined
}
