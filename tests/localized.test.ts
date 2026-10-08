import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { computed, ref } from 'vue'
import { z } from 'zod'
import { TRANSLATED_LOCALE_CODES } from '../i18n/locales'
import { translateFrom, type Translate } from '../i18n/translate'
import { inLocale, localized } from '../model/localized'
import { NameSchema } from '../model/primitives'

const name = localized(NameSchema)
const parses = (value: unknown) => name.safeParse(value).success

describe('a Localized value', () => {
  it('accepts English alone', () => {
    expect(parses({ en: 'Val Revenant' })).toBe(true)
  })

  it('accepts English with a translation', () => {
    expect(parses({ en: 'Val Revenant', ja: 'ヴァル・レヴナント' })).toBe(true)
  })

  it('refuses a translation without English', () => {
    expect(parses({ ja: 'ヴァル・レヴナント' })).toBe(false)
  })

  it('refuses a bare string', () => {
    expect(parses('Val Revenant')).toBe(false)
  })

  it('refuses an empty record', () => {
    expect(parses({})).toBe(false)
  })

  it('refuses null, since a field with no value is absent', () => {
    expect(parses(null)).toBe(false)
  })

  it('refuses a string its field refuses', () => {
    expect(parses({ en: '' })).toBe(false)
    expect(parses({ en: ' Val Revenant' })).toBe(false)
  })

  it('refuses an empty translation, since absent is the only way to say untranslated', () => {
    expect(parses({ en: 'Val Revenant', ja: '' })).toBe(false)
    expect(localized(z.string()).safeParse({ en: 'Val Revenant', ja: '' }).success).toBe(false)
  })

  it('refuses a locale the site does not declare', () => {
    expect(parses({ en: 'Val Revenant', it: 'Val Revenant' })).toBe(false)
  })

  it('accepts a translation identical to the English', () => {
    expect(parses({ en: 'Pazuzu', de: 'Pazuzu' })).toBe(true)
  })

  it('is written in LOCALES order whatever order it was read in', () => {
    const parsed = name.parse({ ja: 'ヴァル・レヴナント', en: 'Val Revenant' })
    expect(Object.keys(parsed)).toEqual(['en', 'ja'])
  })
})

describe('reading a Localized value', () => {
  const value = { en: 'Val Revenant', ja: 'ヴァル・レヴナント' }

  it('reads the locale asked for', () => {
    expect(inLocale(value, 'ja')).toBe('ヴァル・レヴナント')
    expect(inLocale(value, 'en')).toBe('Val Revenant')
  })

  it('falls back to the English for a locale with no translation', () => {
    expect(inLocale(value, 'de')).toBe('Val Revenant')
  })
})

describe('a translator', () => {
  it('carries the active locale, and follows it when it changes', () => {
    const locale = ref('en')
    const t = translateFrom(key => key, locale)
    const seen = computed(() => t.locale)

    expect(seen.value).toBe('en')
    locale.value = 'ja'
    expect(t.locale).toBe('ja')
    expect(seen.value).toBe('ja')
  })

  it('passes a key and its arguments through', () => {
    const calls: unknown[] = []
    const t = translateFrom((key, named) => {
      calls.push([key, named])
      return key
    }, ref('en'))

    expect(t('item.at', { name: 'Val Revenant' })).toBe('item.at')
    expect(t('sections.fates')).toBe('sections.fates')
    expect(calls).toEqual([['item.at', { name: 'Val Revenant' }], ['sections.fates', {}]])
  })

  it('is refused without a locale', () => {
    // @ts-expect-error vue-i18n's bare `t` carries no locale
    const bare: Translate = (key: string) => key
    expect(bare('fields.name')).toBe('fields.name')
  })
})

const ROOT = process.cwd()
const SCANNED = ['components', 'composables', 'layouts', 'pages', 'zones', 'app.vue']

function sourceFiles(path: string): string[] {
  const full = join(ROOT, path)
  if (statSync(full).isFile()) return [path]
  return readdirSync(full).flatMap(entry => sourceFiles(join(path, entry)))
}

// A translated locale is read through inLocale and nowhere else, so its fallback cannot be skipped.
describe('outside model/', () => {
  const files = SCANNED.flatMap(sourceFiles).filter(path => /\.(ts|vue)$/.test(path))
  const codes = TRANSLATED_LOCALE_CODES.join('|')
  const reads = [
    new RegExp(`\\.(${codes})\\b`),
    new RegExp(`\\[\\s*['"](${codes})['"]\\s*\\]`),
    /\[\s*(t\.)?locale(\.value)?\s*\]/,
  ]

  it('finds the source to scan, so an empty scan cannot pass', () => {
    expect(files.length).toBeGreaterThan(20)
  })

  it('reads no translated locale off a value', () => {
    const found = files.flatMap(path =>
      readFileSync(join(ROOT, path), 'utf8').split('\n').flatMap((line, index) =>
        reads.some(read => read.test(line)) ? [`${path}:${index + 1}: ${line.trim()}`] : []))
    expect(found).toEqual([])
  })
})
