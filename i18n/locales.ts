// `code` is the URL segment and `language` is the hreflang tag. They are identical for the four
// launch locales and diverge for the Chinese variants, whose segment lowercases to zh-hans while
// the tag stays zh-Hans.
export interface Locale {
  code: string
  language: string
  name: string
}

export const LOCALES = [
  { code: 'en', language: 'en', name: 'English' },
  { code: 'ja', language: 'ja', name: '日本語' },
  { code: 'de', language: 'de', name: 'Deutsch' },
  { code: 'fr', language: 'fr', name: 'Français' },
] as const satisfies readonly Locale[]

export type LocaleCode = (typeof LOCALES)[number]['code']

export const DEFAULT_LOCALE: LocaleCode = 'en'

export const LOCALE_CODES = LOCALES.map(locale => locale.code) as LocaleCode[]
