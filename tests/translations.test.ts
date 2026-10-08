import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { DEFAULT_LOCALE, TRANSLATED_LOCALE_CODES } from '../i18n/locales'
import { TranslationsSchema } from '../model/primitives'
import {
  ZONE_SCHEMA_VERSION,
  encodeZone,
  firstAccepted,
  parseSections,
  shapeOf,
  zoneFileText,
  zoneFor,
  zoneSlugs,
  zones,
} from '../zones'
import { hydrateZone, loadZoneFile } from './helpers/zoneFiles'

function translationsOf(name: string) {
  return Object.fromEntries(TRANSLATED_LOCALE_CODES.map(code => [code, { name: `${name} ${code}` }]))
}

const accepts = (block: unknown) => TranslationsSchema.safeParse(block).success

describe('an i18n block', () => {
  it('takes any declared locale but the default', () => {
    expect(accepts(translationsOf('Val Revenant'))).toBe(true)
    for (const code of TRANSLATED_LOCALE_CODES) {
      expect(accepts({ [code]: { name: 'Val Revenant' } }), code).toBe(true)
    }
  })

  it('refuses the default locale, which the item\'s own name already is', () => {
    expect(accepts({ [DEFAULT_LOCALE]: { name: 'Val Revenant' } })).toBe(false)
  })

  // Italian has no official client, so no locale will ever declare it.
  it('refuses a locale nobody declared', () => {
    expect(accepts({ it: { name: 'Val Revenant' } })).toBe(false)
  })

  it('translates the name and nothing else', () => {
    expect(accepts({ ja: { name: 'ヴァル・レヴナント', icon: 'fate' } })).toBe(false)
  })

  it('refuses an empty block and an empty locale', () => {
    expect(accepts({})).toBe(false)
    expect(accepts({ ja: {} })).toBe(false)
  })

  it('holds a translated name to the rules the English follows', () => {
    expect(accepts({ de: { name: '' } })).toBe(false)
    expect(accepts({ de: { name: ' Eis-Exergon' } })).toBe(false)
  })

  it('writes its locales in declared order whatever order it read them in', () => {
    const reversed = Object.fromEntries(
      [...TRANSLATED_LOCALE_CODES].reverse().map(code => [code, { name: code }])
    )
    const written = z.encode(TranslationsSchema, TranslationsSchema.parse(reversed))
    expect(Object.keys(written)).toEqual(TRANSLATED_LOCALE_CODES)
  })
})

const files = Object.fromEntries(zoneSlugs.map(slug => [slug, loadZoneFile(slug)]))

const sections = zoneSlugs.flatMap(slug =>
  Object.entries(zones[slug].sections).map(([key, section]) => ({
    label: `${slug}.${key}`,
    schema: section.schema as z.ZodType,
    shape: shapeOf(section.schema),
    items: (files[slug]!.sections[key]?.items ?? []) as Record<string, unknown>[],
  }))
)

describe('where a block goes', () => {
  it('is declared on every section that takes a name, directly after the name', () => {
    for (const { label, shape } of sections) {
      const keys = Object.keys(shape)
      if (!keys.includes('name')) continue
      expect(keys, label).toContain('i18n')
      expect(keys.indexOf('i18n'), label).toBe(keys.indexOf('name') + 1)
    }
  })

  it('rides on every named item the data ships', () => {
    let seen = 0
    for (const { label, schema, items } of sections) {
      const named = items.find(item => typeof item.name === 'string')
      if (!named) continue
      const translated = { ...named, i18n: translationsOf(named.name as string) }
      expect(schema.safeParse(translated).success, label).toBe(true)
      seen++
    }
    expect(seen).toBeGreaterThan(20)
  })

  it('refuses one on an item with no name to translate', () => {
    let seen = 0
    for (const { label, schema, items } of sections) {
      const nameless = items.find(item => !('name' in item))
      if (!nameless) continue
      expect(schema.safeParse(nameless).success, label).toBe(true)
      expect(schema.safeParse({ ...nameless, i18n: translationsOf('Coffer') }).success, label)
        .toBe(false)
      seen++
    }
    expect(seen).toBeGreaterThan(0)
  })

  it('is declared on every boss', () => {
    const i18n = translationsOf('Boss')
    let seen = 0
    for (const { label, shape } of sections) {
      if (!('bosses' in shape)) continue
      const accepted = firstAccepted(shape, 'bosses', [
        [{ name: 'Boss', weakness: [], i18n }],
        [{ name: 'Boss', i18n }],
      ])
      expect(accepted, label).toBeDefined()
      seen++
    }
    expect(seen).toBeGreaterThan(0)
  })
})

describe('a translated zone', () => {
  it('comes back from a save as it went in, each block directly after its name', () => {
    const zone = hydrateZone('north_horn')
    const fates = zone.sections.find(section => section.key === 'fates')!.items
    const fate = fates.find(item => 'bosses' in item && item.bosses.length > 0)!
    const boss = (fate as { bosses: { name: string }[] }).bosses[0]!
    const enemy = zone.sections.find(section => section.key === 'enemies')!.items[0]!

    Object.assign(fate, { i18n: translationsOf((fate as { name: string }).name) })
    Object.assign(boss, { i18n: translationsOf(boss.name) })
    Object.assign(enemy, { i18n: translationsOf((enemy as { name: string }).name) })

    const { file, issues } = encodeZone(zone, ZONE_SCHEMA_VERSION)
    expect(issues).toEqual([])
    const written = JSON.parse(zoneFileText(file!))

    const writtenFate = written.sections.fates.items.find(
      (item: { id: string }) => item.id === fate.id
    )
    expect(Object.keys(writtenFate).slice(1, 3)).toEqual(['name', 'i18n'])
    expect(Object.keys(writtenFate.bosses[0]).slice(0, 2)).toEqual(['name', 'i18n'])

    const read = parseSections(zoneFor('north_horn'), written)
    expect(read.issues).toEqual([])
    expect(read.sections.get('fates')!.find(item => item.id === fate.id)).toEqual(fate)
    expect(read.sections.get('enemies')!.find(item => item.id === enemy.id)).toEqual(enemy)
  })
})
