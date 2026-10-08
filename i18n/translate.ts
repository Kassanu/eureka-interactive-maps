import type { LocaleCode } from './locales'

// vue-i18n's `t` with the active locale beside it, declared here so `model/` and `zones/` can
// build a translated string while importing nothing from Nuxt. The test suite passes its own,
// built from en.json. A component builds one with useTranslate().
export interface Translate {
  (key: string, named?: Record<string, unknown>): string
  readonly locale: LocaleCode
}

// `locale` is read through the ref on every access, so a computed reading it re-runs on a locale
// switch.
export function translateFrom(
  t: (key: string, named: Record<string, unknown>) => string,
  locale: { readonly value: string }
): Translate {
  const translate = (key: string, named?: Record<string, unknown>) => t(key, named ?? {})
  return Object.defineProperty(translate, 'locale', {
    get: () => locale.value as LocaleCode,
  }) as Translate
}

// A label declared where no translator is in reach, resolved where it is drawn. Filter options
// and defaults are computed without one, so resolving a label that early would put the locale in
// charge of what a filter matches. One that ignores its argument is text the data supplied.
export type Text = (t: Translate) => string
