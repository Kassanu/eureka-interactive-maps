import { z } from 'zod'
import {
  DEFAULT_LOCALE,
  LOCALE_CODES,
  type LocaleCode,
  type TranslatedLocaleCode,
} from '../i18n/locales'

// A value in every locale it has been translated into, keyed by locale code (`zh-hans`), never by
// hreflang tag. English is always present, which is what keeps a fallback from rendering blank.
export type Localized = { en: string } & Partial<Record<TranslatedLocaleCode, string>>

// Each locale's string follows `text`, the rule of the field being translated. Keys are declared in
// LOCALES order, so a parsed value is written in that order whatever order it was read in.
export function localized(text: z.ZodType<string>): z.ZodType<Localized> {
  const shape = Object.fromEntries(
    LOCALE_CODES.map(code => [code, code === DEFAULT_LOCALE ? text : text.optional()])
  )
  return z.strictObject(shape).check(ctx => {
    for (const code of LOCALE_CODES) {
      if (ctx.value[code] === '') {
        ctx.issues.push({
          code: 'custom',
          input: ctx.value,
          message: `${code} is empty; an untranslated locale is left out`,
        })
      }
    }
  }) as unknown as z.ZodType<Localized>
}

export function inLocale(value: Localized, locale: LocaleCode): string {
  return value[locale] ?? value.en
}
